# hungta/lifemate-zac2026

## Resumen

LifeMate (Zalo AI Challenge 2026) es un sistema compuesto publicado por el usuario hungta en Hugging Face que combina reconocimiento automatico del habla (ASR) en vietnamita con un agente de lenguaje pequeno (SLM) capaz de invocar herramientas. El pipeline encadena un fine-tune de `vinai/PhoWhisper-large` para transcribir voz, una capa de normalizacion de horas y numeros (ITN), y un adaptador LoRA de rango 16 sobre `Qwen/Qwen3-4B-Instruct-2507` que decide que herramientas invocar y con que argumentos.

El modelo resuelve un problema concreto: ejecutar tareas de asistente personal a partir de instrucciones habladas en vietnamita, emitiendo llamadas a herramientas estructuradas (`tool_calls`) y un hash de estado (`state_hash`) en lugar de texto libre. Esta orientado a la competicion Zalo AI Challenge 2026 y su diseno esta condicionado por las restricciones del certamen: menos de 6.000 millones de parametros totales (5,57B en conjunto) y contexto de 16.384 tokens.

Es relevante por dos motivos. Primero, demuestra un patron de integracion ASR + SLM + tool calling completamente local (vLLM apuntando a `localhost`, sin servicios externos ni tracing). Segundo, documenta resultados medidos en dev y en test publico, asi como latencias reales en A100, lo que permite evaluar su viabilidad en produccion sin especulacion. El repositorio ocupa 3,2 GB y no incluye los datos de la competicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema compuesto: ASR Whisper (encoder-decoder transformer) + LLM decoder-only transformer con adaptador LoRA |
| Parametros totales | 5,57B en conjunto (ASR 1,55B + LLM 4,02B con LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Other (sin terminos detallados en la informacion disponible) |
| Formato de pesos | safetensors |
| Modelo base LLM | Qwen/Qwen3-4B-Instruct-2507 |
| Modelo base ASR | vinai/PhoWhisper-large |
| Configuracion LoRA | Rango 16, entrenado sobre el 100% del conjunto de train, 2 epocas |
| Decodificacion | Greedy (temperature 0), semilla fija |
| Servidor de inferencia | vLLM (cliente compatible con OpenAI API en localhost) |

## Arquitectura y entrenamiento

El sistema no es un unico modelo sino una cadena de tres etapas. La primera es un fine-tune de PhoWhisper-large (1,55B) sobre la totalidad de las frases de entrenamiento (configuracion EXP1-all), encargado de transcribir el audio vietnamita. La segunda es una capa de normalizacion inversa de texto (ITN) que convierte expresiones habladas de horas y numeros a formato canonico. La tercera es el LLM: `Qwen3-4B-Instruct-2507` con un adaptador LoRA de rango 16 (denominado v3-all), servido con vLLM en modo greedy.

El entrenamiento del adaptador incorpora aumentacion orientada al ruido del pipeline: un 30% de ruido de ASR simulado y un enmascaramiento del 50% de los nombres de aplicaciones, con dos epocas sobre el conjunto completo de entrenamiento. El agente opera mediante un bucle de llamadas a herramientas sobre el catalogo `zaic_tools`, con una capa de guardas (guard v1 mas correcciones FIX) que valida y normaliza argumentos. La seleccion de ejemplos few-shot se hace con TF-IDF a nivel de caracter sobre el conjunto de train, tomando los dos ejemplos mas cercanos, y se mantiene una whitelist de parametros opcionales. La salida se serializa como `submission.jsonl` con los campos `id`, `tool_calls` y `state_hash`.

Una innovacion operativa destacable es la disciplina de estado: cada muestra usa exactamente un `ToolEnv` y no se reproduce la ejecucion para verificar el hash, lo que evita efectos secundarios. Ademas, el sistema impone un limite de 25 segundos para la fase de agente: al agotarse, deja de invocar al LLM y entrega las llamadas ya ejecutadas. El determinismo es casi total: la comparacion entre ejecucion secuencial y con 12 hilos arrojo 8 diferencias en 634 cadenas de llamadas.

## Capacidades

- Transcripcion de voz en vietnamita mediante PhoWhisper-large ajustado.
- Normalizacion de expresiones temporales y numericas en vietnamita (ITN).
- Generacion de llamadas a herramientas estructuradas (tool calling) sobre un catalogo definido.
- Razonamiento multi-paso dentro de un bucle de agente con estado persistente entre llamadas.
- Seleccion de ejemplos few-shot por similitud TF-IDF de caracteres.
- Ejecucion offline completa con pesos locales (`HF_HUB_OFFLINE=1`, `--llm` apuntando a directorio local).
- Integracion con OpenAI Agents SDK en dos modos: `Runner` y `VoicePipeline`.
- Salida determinista con hash de estado verificable.

## Casos de uso

- Asistente de voz para tareas de agenda: el pipeline transcribe la orden hablada, normaliza la hora y el LLM emite la llamada de creacion de evento con argumentos validados por las guardas. La ventana de 16.384 tokens permite mantener el contexto de la conversacion y del estado de herramientas.
- Automatizacion de recordatorios y alarmas en vietnamita: la capa ITN convierte expresiones como horas habladas de forma coloquial a formato canonico antes de que el agente construya la llamada, reduciendo errores de parseo.
- Control de dispositivos o servicios mediante voz en entornos sin conectividad: al ejecutarse con vLLM en localhost y pesos descargados, el sistema funciona sin llamadas a APIs externas, lo que encaja en despliegues con requisitos de privacidad.
- Evaluacion y benchmarking de agentes de voz: el formato de salida (`id`, `tool_calls`, `state_hash`) y el determinismo con semilla fija lo hacen util como referencia reproducible en experimentos de tool calling sobre ASR.
- Prototipado de agentes con OpenAI Agents SDK: los modos `sdk` y `voice` permiten comparar el bucle propio frente a `Runner` y `VoicePipeline` con el mismo modelo local, midiendo la degradacion (61,52 frente a 60,93 y 60,60 en dev).
- Investigacion sobre robustez al ruido de ASR: la receta de entrenamiento con 30% de ruido simulado y enmascaramiento de nombres de aplicaciones sirve como plantilla para adaptar SLM a transcripciones imperfectas en otros idiomas.
- Despliegue en hardware limitado para demos: con 5,57B parametros totales y latencias de 1,4 s p50 en A100 (maximo 5,7 s en agente), es viable en una unica GPU para pruebas de concepto interactivas.

## Benchmarks y rendimiento

| Evaluacion | Configuracion | Puntuacion |
|---|---|---|
| Dev, 200 muestras | Adaptador v3, bucle original, 2 ejemplos few-shot | 61,52 |
| Dev, 200 muestras | OpenAI Agents SDK `Runner` (`--mode sdk`) | 60,93 |
| Dev, 200 muestras | OpenAI Agents SDK `VoicePipeline` (`--mode voice`) | 60,60 |
| Test publico | Adaptador v3-all, bucle original | 49,03 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas anteriores corresponden a la metrica propia de la competicion Zalo AI Challenge 2026.

Latencias medidas en A100, ejecucion secuencial por muestra: agente p50 de 1,4 s y maximo de 5,7 s; ASR con maximo de 5,8 s por muestra. El autor estima un peor caso de aproximadamente 20-23 s por muestra en una A30.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 5,57B parametros en safetensors (3,2 GB de repositorio) y precision de entrenamiento, se requiere una GPU con al menos 16-24 GB para servir el LLM en vLLM sin cuantizar; el ASR anade 1,55B adicionales.
- GPU recomendadas: A100 (mediciones reales del autor), A30 (estimacion de 20-23 s por muestra en peor caso), H100 como alternativa de mayor throughput.
- GPU de consumo: no se documenta soporte en RTX 4090 ni en GPUs consumer; la cuantizacion no esta especificada, por lo que no se puede confirmar viabilidad en 24 GB o menos.
- Opciones de despliegue: vLLM como servidor principal (cliente compatible con OpenAI API en localhost), con modos `--mode sdk` y `--mode voice` sobre OpenAI Agents SDK. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Throughput y latencia: agente p50 1,4 s y maximo 5,7 s por muestra en A100; ASR maximo 5,8 s por muestra; limite de 25 s configurado para la fase de agente.
- Paralelismo: la ejecucion con 12 hilos produce 8 diferencias en 634 cadenas de llamadas respecto a la ejecucion secuencial; el autor recomienda el bucle original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LifeMate (hungta/lifemate-zac2026) | 5,57B en conjunto (ASR + LLM) | 16.384 | ASR + SLM con tool calling en vietnamita | Other | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02B | No disponible en esta ficha | LLM generalista con tool calling | No disponible en esta ficha | Hugging Face |
| vinai/PhoWhisper-large (modelo base ASR) | 1,55B | No aplica | ASR en vietnamita | No disponible en esta ficha | Hugging Face |

La comparativa con alternativas de la misma categoria (sistemas ASR + agente para vietnamita) no esta disponible en la informacion proporcionada. Los datos de los modelos base se limitan a lo indicado en la model card; no se dispone de sus especificaciones completas ni de resultados comparables en la misma metrica.

## Limitaciones y advertencias

- Cobertura linguistica limitada al vietnamita; no se documenta soporte de otros idiomas.
- La puntuacion en test publico (49,03) es notablemente inferior a la de dev (61,52), lo que sugiere una brecha de generalizacion relevante.
- El sistema depende de un catalogo de herramientas concreto (`zaic_tools`) y de una whitelist de parametros; su comportamiento fuera de ese esquema no esta documentado.
- La licencia es "other" sin terminos detallados: no se puede confirmar el uso comercial sin consultar al autor.
- El repositorio no incluye los datos de la competicion; el pipeline requiere un directorio `--root` con `<split>/` y `train/` para funcionar.
- El determinismo no es absoluto: con 12 hilos se observaron 8 diferencias en 634 cadenas de llamadas.
- Existe un limite de 25 s por muestra en la fase de agente; en hardware mas lento (estimacion A30 de 20-23 s) el margen es estrecho y puede truncar llamadas.
- Riesgo de alucinacion y de seleccion incorrecta de herramienta inherente al SLM de 4B, mitigado parcialmente por las guardas y la validacion de argumentos, pero no eliminado.
- No se documentan sesgos especificos ni evaluaciones de seguridad; las transcripciones ASR con ruido pueden degradar la precision del agente pese al entrenamiento con 30% de ruido simulado.
- No se especifican opciones de cuantizacion ni soporte en GPUs consumer, lo que limita el despliegue fuera de hardware de datacenter.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hungta/lifemate-zac2026
- Modelo base LLM: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base ASR: https://huggingface.co/vinai/PhoWhisper-large
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo independientes ni demos.
