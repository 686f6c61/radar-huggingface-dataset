# Neeze/lifemate-zac2026

## Resumen

LifeMate es un sistema completo de agente de voz en vietnamita presentado al Zalo AI Challenge 2026. No se trata de un unico modelo, sino de un pipeline que combina un modelo ASR (reconocimiento automatico del habla) afinado a partir de `vinai/PhoWhisper-large` con un modelo de lenguaje pequeno (SLM) afinado mediante LoRA sobre `Qwen/Qwen3-4B-Instruct-2507`. El sistema convierte una locucion en vietnamita en texto, normaliza expresiones temporales (ITN), y despues un agente decide que herramientas invocar sobre un catalogo de funciones (`zaic_tools`) para resolver la tarea.

El problema que aborda es el de los asistentes de voz orientados a acciones: no basta con transcribir, hay que interpretar la intencion, extraer parametros y ejecutar llamadas a herramientas con estado persistente (el pipeline emite `tool_calls` y un `state_hash` por muestra). La relevancia actual viene de su enfoque de bajo coste: 5,57B de parametros totales (1,55B de ASR + 4,02B de LLM), con el LLM por debajo de 5B y una ventana de contexto de 16.384 tokens, lo que lo hace desplegable en una sola GPU.

El modelo base lingueistico es Qwen3-4B-Instruct-2507, un transformer denso de 4,02B de parametros. Sobre el se aplica un adaptador LoRA de rango 16 entrenado con datos aumentados (30% de ruido ASR simulado, 50% de nombres de aplicacion enmascarados, 2 epocas). El repositorio ocupa 3,2 GB e incluye tanto los pesos del ASR afinado como el adaptador LoRA, aunque no incluye los datos del desafio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline: ASR (Whisper fine-tune) + LLM transformer denso con LoRA + capa de agente con tool calling |
| Parametros totales | 5,57B (1,55B ASR + 4,02B LLM) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema se organiza en cuatro etapas encadenadas. Primero, el ASR `vinai/PhoWhisper-large` (1,55B) se afina sobre el conjunto completo de frases de entrenamiento (configuracion EXP1-all). Segundo, se aplica una normalizacion de texto inversa (ITN) centrada en horas y numeros en vietnamita. Tercero, el LLM `Qwen/Qwen3-4B-Instruct-2507` con un adaptador LoRA de rango 16 (version v3-all) recibe la transcripcion normalizada y decide las llamadas a herramientas. Cuarto, un guard basado en reglas (`lifemate_agent/guard/`) valida y normaliza las llamadas antes de emitir el `submission.jsonl` con los campos `id`, `tool_calls` y `state_hash`.

El entrenamiento del adaptador LoRA usa 2 epocas sobre todo el conjunto de train, con aumentacion deliberada: un 30% de ruido ASR simulado y un 50% de nombres de aplicacion enmascarados, lo que busca robustez frente a errores de transcripcion y generalizacion a entidades no vistas. La inferencia es greedy (temperature 0) con semilla fija, y el agente se ejecuta sobre vLLM mediante un cliente compatible con OpenAI apuntando a `localhost`. La innovacion destacable no es arquitectonica sino de ingenieria: el uso de ejemplos few-shot recuperados por TF-IDF a nivel de caracter (2 ejemplos mas cercanos) y una whitelist de parametros opcionales extraida del propio conjunto de train. El sistema tambien puede ejecutarse con el OpenAI Agents SDK en modos `Runner` y `VoicePipeline`, y soporta ejecucion offline con `HF_HUB_OFFLINE=1` y `--llm` apuntando a un directorio local.

## Capacidades

- Reconocimiento automatico del habla en vietnamita mediante PhoWhisper-large afinado.
- Normalizacion de expresiones temporales y numericas en vietnamita (ITN).
- Tool calling / function calling sobre un catalogo de herramientas (`zaic_tools`) con validacion por guard.
- Razonamiento multi-paso orientado a agentes: el bucle del agente puede encadenar varias llamadas por muestra.
- Gestion de estado por muestra con emision de `state_hash` para verificacion.
- Recuperacion de ejemplos few-shot por similitud TF-IDF de caracteres.
- Ejecucion con multiples backends de agente: bucle propio, OpenAI Agents SDK `Runner` y `VoicePipeline`.
- Control de tiempo por muestra con deadline configurable (25 s por defecto para la fase de agente).
- Ejecucion offline una vez descargados los pesos.

## Casos de uso

- Asistentes de voz para tramites: el pipeline transcribe la peticion del usuario, normaliza fechas y horas, y el agente invoca las herramientas necesarias (consulta de disponibilidad, reserva) en una sola pasada, con contexto de 16.384 tokens suficiente para historiales multi-turno.
- Automatizacion de atencion telefonica en vietnamita: el ASR afinado sobre frases del dominio y el enmascarado del 50% de nombres de aplicacion durante el entrenamiento permiten reconocer entidades nuevas sin reentrenar.
- Integracion en pipelines de CI/CD para agentes: el `run.py` con modos `sdk` y `voice` y la salida estructurada en JSONL facilitan la evaluacion automatizada y la comparacion de configuraciones.
- Despliegue en hardware modesto: con 5,57B de parametros totales y el LLM por debajo de 5B, el sistema cabe en una unica GPU y puede servirse con vLLM en local, sin dependencias de servicios externos.
- Investigacion en robustez ASR-LLM: la combinacion de ruido ASR simulado al 30% y ejemplos few-shot recuperados por TF-IDF constituye una base reproducible para estudiar la propagacion de errores de transcripcion al agente.
- Prototipado de agentes con estado verificable: el `state_hash` por muestra permite auditar que las llamadas se ejecutaron sobre el entorno correcto, util en entornos con requisitos de trazabilidad.
- Evaluacion comparativa de frameworks de agentes: el mismo modelo y configuracion se ejecutan con el bucle propio y con el OpenAI Agents SDK, lo que permite medir el impacto del framework en la puntuacion.

## Benchmarks y rendimiento

| Configuracion | Puntuacion |
|---|---|
| Dev 200 muestras (adapter v3, bucle original, 2 few-shot) | 61,52 |
| Dev 200 muestras, OpenAI Agents SDK `Runner` (`--mode sdk`) | 60,93 |
| Dev 200 muestras, OpenAI Agents SDK `VoicePipeline` (`--mode voice`) | 60,60 |
| Public test (adapter v3-all, bucle original) | 49,03 |

Latencia medida en A100, ejecucion secuencial por muestra: agente p50 de 1,4 s y maximo de 5,7 s; ASR con maximo de 5,8 s por muestra. Estimacion en A30 en el peor caso: aproximadamente 20-23 s por muestra. La reproducibilidad es alta: comparando ejecucion secuencial frente a 12 hilos, solo 8 de 634 secuencias de llamadas difieren.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 5,57B de parametros totales, en fp16 serian necesarios del orden de 11 GB solo para pesos, mas overhead de vLLM y del ASR.
- GPU recomendadas: A100 (mediciones oficiales), A30 (estimacion del autor). Cualquier GPU con suficiente VRAM para servir el LLM de 4B y el ASR de 1,55B en paralelo o secuencialmente.
- GPU de consumo: no confirmado por el autor; un LLM de 4B en cuantizacion de 4 bits es viable en GPUs de consumo con 16-24 GB, pero el pipeline completo incluye tambien el ASR y no se han publicado medidas en ese escenario.
- Opciones de despliegue: vLLM con cliente compatible OpenAI para el LLM; el ASR se ejecuta como componente separado; soporte de OpenAI Agents SDK (`Runner`, `VoicePipeline`) y bucle propio.
- Latencia y throughput: ver seccion de benchmarks (p50 de 1,4 s y maximo de 5,7 s para el agente en A100; hasta 5,8 s para ASR por muestra).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LifeMate (este) | 5,57B (1,55B ASR + 4,02B LLM) | 16.384 | ASR + agente con tool calling en vietnamita | other | Hugging Face, 0 descargas |
| Qwen3-4B-Instruct-2507 (base) | 4,02B | no disponible en la informacion | LLM generalista con tool calling | no disponible en la informacion | Hugging Face |
| vinai/PhoWhisper-large (base ASR) | 1,55B | no aplica | ASR en vietnamita | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks de los modelos base en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa directa.

## Limitaciones y advertencias

- El modelo solo soporta vietnamita; no hay evidencia de capacidades multilingues.
- La licencia es "other": es imprescindible revisar los terminos exactos antes de cualquier uso comercial, ya que las condiciones de los modelos base (Qwen y PhoWhisper) pueden imponer restricciones adicionales.
- El repositorio no incluye los datos del desafio; sin ellos no se puede reproducir la evaluacion.
- La puntuacion en public test (49,03) es notablemente inferior a la de dev (61,52), lo que sugiere sobreajuste a la distribucion de desarrollo o diferencias de dificultad entre conjuntos.
- Riesgo de propagacion de errores: los fallos del ASR se transmiten al agente; el entrenamiento con 30% de ruido simulado mitiga pero no elimina este problema.
- El enmascarado del 50% de nombres de aplicacion puede reducir la precision sobre entidades que si aparecian en entrenamiento.
- El deadline de 25 s por muestra implica que, en hardware lento, el agente puede no completar todas las llamadas previstas.
- Con 0 descargas y 0 likes, no existe validacion independiente por parte de la comunidad.
- No se han publicado datos de sesgos, tasas de alucinacion ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/Neeze/lifemate-zac2026
- Modelo base LLM: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base ASR: https://huggingface.co/vinai/PhoWhisper-large
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
