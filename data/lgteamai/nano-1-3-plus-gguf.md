# LGTEAMai/Nano-1.3-Plus-GGUF

## Resumen

Nano 1.3-Plus es un modelo de lenguaje compacto y bilingue (ingles y ruso) desarrollado por LGTEAMai, entrenado desde cero como parte de su proyecto de investigacion "AI makes AI". Esta ficha cubre la version GGUF del modelo, publicada el 15 de noviembre de 2026, que empaqueta los pesos originales en formato compatible con llama.cpp, Ollama, LM Studio y otros runtimes GGUF. El modelo base declara 197 millones de parametros en su model card, aunque el repositorio de safetensors indica 254.190.720 parametros totales; la discrepancia no se aclara en la informacion disponible.

Se trata de un modelo de chat de proposito general, con una ventana de contexto de 4.096 tokens y una plantilla de chat basada en tokens especiales (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|end|>`). Su interes principal es el tamano: el fichero F16 ocupa solo 512 MB y las cuantizaciones mas agresivas bajan hasta los 201 MB, lo que permite ejecutarlo en CPU de portatil, en una Raspberry Pi 5 o incluso en un telefono. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

El autor es explicito sobre el alcance: el modelo es adecuado para conversacion corta y simple, y poco fiable para hechos y aritmetica. La publicacion GGUF incluye cinco cuantizaciones con mediciones de perplexity sobre una muestra fija de texto ingles y ruso, lo que permite elegir el compromiso tamano/calidad con datos concretos en lugar de estimaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 254.190.720 (safetensors); la model card indica 197 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) y ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo GGUF); safetensors en el repo base |
| Base RoPE | 50.000 |
| Plantilla de chat | Jinja embebida en el GGUF |
| Muestreo recomendado | temperature 0.6, top-k 40, top-p 0.9, repetition penalty 1.1 |

Ficheros publicados y perplexity asociada (muestra fija de 319 KB de texto ingles y ruso, 100 ventanas de 512 tokens, segunda mitad puntuada):

| Fichero | Cuantizacion | Tamano | Perplexity | Notas |
|---|---|---|---|---|
| `Nano-1.3-Plus-F16.gguf` | 16-bit float | 512 MB | 22,57 | Referencia sin perdida |
| `Nano-1.3-Plus-Q8_0.gguf` | 8-bit | 274 MB | 22,61 | Recomendado (+0,2 %) |
| `Nano-1.3-Plus-Q6_K.gguf` | 6-bit k-quant | 265 MB | 22,63 | Practicamente sin perdida (+0,3 %) |
| `Nano-1.3-Plus-Q5_K_M.gguf` | 5-bit k-quant | 213 MB | 22,85 | Perdida pequena (+1,2 %) |
| `Nano-1.3-Plus-Q4_K_M.gguf` | 4-bit k-quant | 201 MB | 22,96 | El mas pequeno (+1,7 %) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que es un transformer con una base RoPE de 50.000 y una ventana de contexto de 4.096 tokens. No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni si emplea variantes como GQA o atencion lineal. El modelo fue entrenado desde cero por LGTEAMai en el marco de su proyecto "AI makes AI"; no se publican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o ajuste supervisado.

La publicacion GGUF documenta el proceso de conversion y verificacion: los ficheros se generaron con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp a partir del release en safetensors. Como controles de calidad, los IDs de tokens producidos por llama.cpp coinciden con el tokenizer de Hugging Face en 12 cadenas de prueba (ingles, ruso, codigo, numeros y tokens especiales); los ficheros declaran correctamente el contexto de 4.096 tokens y la base RoPE de 50.000; y con la plantilla de chat embebida, las respuestas greedy de F16 y Q8_0 coinciden con las del modelo original en 4 de 5 prompts de prueba (el quinto, un saludo, difiere en la frase inicial). Q4_K_M coincide en 2 de 5.

## Capacidades

- Generacion de texto conversacional en ingles y ruso, con respuestas cortas y concisas.
- Chat multi-turno dentro de una ventana de 4.096 tokens.
- Soporte de system prompt: el autor recomienda encarecidamente proporcionar uno, ya que el comportamiento empeora notablemente sin el.
- Plantilla de chat embebida en el GGUF (Jinja), aplicada automaticamente por llama.cpp y compatible con el endpoint OpenAI `/v1/chat/completions` de `llama-server`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades limitadas por diseno: el autor indica que es poco fiable para hechos y aritmetica.

## Casos de uso

- Chat de proposito general en dispositivos de bajos recursos: el fichero Q8_0 (274 MB) se ejecuta en CPU de portatil, Raspberry Pi 5 o telefono, lo que permite desplegar un asistente conversacional local sin GPU ni conexion a internet.
- Prototipado rapido de interfaces conversacionales: con `llama-server` y su API compatible con OpenAI, se puede levantar un backend de chat en localhost en minutos para validar una UI o un flujo de producto antes de invertir en un modelo mayor.
- Asistente bilingue ingles-ruso en entornos embebidos: el modelo esta entrenado especificamente para ambos idiomas, lo que lo hace util en dispositivos de kiosco, electrodomesticos o terminales de atencion en ruso sin depender de servicios en la nube.
- Educacion y experimentacion: su tamano y su licencia Apache 2.0 lo convierten en una base accesible para estudiar tecnicas de cuantizacion GGUF, comparar perplexity entre ficheros o ensenar el funcionamiento de un pipeline de inferencia completo en un aula.
- Generacion de respuestas cortas en pipelines por lotes: para tareas de clasificacion ligera, reformulacion breve o generacion de etiquetas en grandes volumenes, el coste por token en CPU es minimo y el throughput agregado puede ser suficiente.
- Pruebas de integracion con Ollama y LM Studio: el repo incluye un `Modelfile` completo y valores de muestreo recomendados, lo que facilita validar flujos de despliegue en estas herramientas antes de migrar a modelos de mayor tamano.
- Filtrado o preprocesado de texto en el borde (edge computing): al caber en 201-274 MB, puede ejecutarse junto a otras cargas en un dispositivo limitado para tareas de normalizacion o respuesta conversacional basica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato cuantitativo de calidad es la perplexity por fichero de cuantizacion, recogida en la tabla de especificaciones: 22,57 para F16, 22,61 para Q8_0, 22,63 para Q6_K, 22,85 para Q5_K_M y 22,96 para Q4_K_M, medida sobre una muestra fija de 319 KB de texto ingles y ruso con 100 ventanas de 512 tokens.

## Requisitos de hardware

- VRAM/RAM estimada: entre 201 MB (Q4_K_M) y 512 MB (F16) solo para los pesos; hay que sumar el espacio del contexto KV cache para 4.096 tokens, que en un modelo de este tamano es reducido pero no se cuantifica en la informacion disponible.
- GPU recomendadas: no se especifican; el modelo esta pensado para inferencia en CPU. Cualquier GPU consumer con unos pocos GB de VRAM puede alojarlo, pero no hay datos de rendimiento en GPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, dado el tamano de los pesos; tambien en CPU de portatil, Raspberry Pi 5 y telefono, segun el autor.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`, `llama-completion`), Ollama (con el `Modelfile` incluido), LM Studio y cualquier runtime compatible con GGUF. El endpoint `/v1/chat/completions` de `llama-server` ofrece compatibilidad con la API de OpenAI.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables (benchmarks estandar, throughput) para establecer una comparativa rigurosa con alternativas de la misma categoria. A continuacion se indican alternativas conocidas del segmento de modelos muy pequenos, con los datos publicos de cada una; las cifras de Nano 1.3-Plus son las de esta ficha y las de los competidores corresponden a su documentacion publica habitual, que puede variar.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nano 1.3-Plus | 254 M (safetensors) / 197 M (model card) | 4.096 | en, ru | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-0.5B | 494 M | 32.768 | multilingue (29 idiomas) | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M | 362 M | 8.192 | ingles principalmente | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1,1 B | 2.048 | ingles | Apache 2.0 | safetensors, GGUF |

La comparativa de rendimiento real entre estos modelos no esta disponible en la informacion proporcionada; no se han publicado benchmarks de Nano 1.3-Plus que permitan situarlo frente a ellos.

## Limitaciones y advertencias

- Fiabilidad factual y aritmetica baja: el propio autor advierte que el modelo es poco fiable para hechos y matematicas; no debe usarse como fuente de verdad.
- Respuestas largas: el autor indica que las respuestas largas pueden empezar a repetirse; el modelo funciona mejor con respuestas cortas.
- Dependencia del system prompt: sin el system prompt recomendado el comportamiento empeora notablemente, lo que obliga a incluirlo en todas las integraciones.
- Contexto limitado: 4.096 tokens es una ventana pequena comparada con modelos actuales, lo que restringe conversaciones largas y documentos extensos.
- Cobertura idiomatica: solo ingles y ruso declarados; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Perdida por cuantizacion: en modelos de este tamano la cuantizacion profunda penaliza mas que en modelos grandes; Q4_K_M presenta un +1,7 % de perplexity y solo coincide con el modelo original en 2 de 5 prompts de prueba, frente a 4 de 5 en F16 y Q8_0.
- Sesgos: no se documentan en la informacion disponible analisis de sesgos del modelo base.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario asume la responsabilidad sobre el contenido generado y su adecuacion al caso de uso.
- Madurez: el repo GGUF tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo se publico en noviembre de 2026; no hay evidencia de adopcion ni de validacion por terceros.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/LGTEAMai/Nano-1.3-Plus-GGUF
- Modelo base en Hugging Face: https://huggingface.co/LGTEAMai/Nano-1.3-Plus
- Sitio del desarrollador: https://lgteamai.xyz
- llama.cpp: https://github.com/ggml-org/llama.cpp
