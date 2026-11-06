# CrowdMind/lamb-base

## Resumen

`CrowdMind/lamb-base` es un checkpoint base de un modelo de lenguaje autoregresivo de tipo transformer decoder-only, desarrollado por CrowdMind y entrenado con la base de codigo nanochat. Se trata de un modelo experimental de pequeno tamano (286.261.730 parametros), disenado como punto de partida para investigacion y fine-tuning, no como asistente listo para produccion. El identificador interno del run es `simple_20261101_curriculum`, lo que refleja el uso de un curriculo de longitudes de secuencia durante el preentrenamiento.

El modelo emplea una arquitectura de 12 capas con embeddings de 768 dimensiones, 6 cabezas de atencion y 6 cabezas KV (GQA), y un tokenizador BPE propio de nanochat con vocabulario de 32.768 tokens. La longitud maxima de secuencia es de 8.196 tokens. El entrenamiento se realizo en una unica GPU NVIDIA GeForce RTX 4060 Ti en precision BF16, lo que da una idea del caracter modesto y accesible del proyecto.

Su relevancia es fundamentalmente didactica y de investigacion: permite estudiar el efecto de un curriculo de longitudes de contexto (2.048 -> 6.144 -> 8.196 tokens) sobre un modelo pequeno, asi como experimentar con fine-tuning posterior. No obstante, los resultados de evaluacion disponibles (CORE de 0,0521) indican una capacidad muy limitada, y no se ha publicado un checkpoint con SFT ni datos de licencia, idiomas o benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autoregresivo (estilo GPT), 12 capas, 768 dim, 6 cabezas de atencion, 6 cabezas KV (GQA), patron de ventana `SSSL` |
| Parametros totales | 286.261.730 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.196 tokens |
| Tipos de cuantizacion | GGUF (tag del repo); no se detallan variantes concretas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (tag del repo); el checkpoint original es `.pt` (PyTorch); no se confirma safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only autoregresivo con 12 capas, embeddings de 768 dimensiones y 6 cabezas de atencion con 6 cabezas KV (atencion con query grouping). El patron de ventana `SSSL` sugiere un esquema de atencion con ventanas locales y algunas capas globales, aunque la model card no detalla su implementacion exacta. El tokenizador es un BPE de nanochat con vocabulario de 32.768 tokens y la longitud maxima de secuencia es de 8.196 tokens.

El preentrenamiento siguio un curriculo de longitudes de secuencia de 2.048 -> 6.144 -> 8.196 tokens, con un lote total de 524.544 tokens, lote por dispositivo de 1 y datos ordenados. Las fuentes de datos registradas en el manifiesto son `CrowdMind/2048-pretraining` (145.056 filas), `CrowdMind/6144-pretraining` (187.702 filas), `AIGym/code-pretraining-8196` (1.632.309 filas) y `CrowdMind/cve-assistant-text` (50.000 filas, usando las primeras 50.000 en el segmento final). El checkpoint guardado corresponde al paso 1.679, con un BPB de validacion final de 0,3356 y un mejor BPB observado de 0,3315; el registro indica unas 27.802 segundos de entrenamiento en una RTX 4060 Ti en BF16. No se documenta el uso de RLHF, DPO ni SFT en los artefactos disponibles.

## Capacidades

- Generacion de texto autoregresiva y completado de prompts, propia de un modelo base preentrenado.
- Modelado de lenguaje y continuacion de secuencias con contexto de hasta 8.196 tokens.
- Exposicion a codigo mediante el segmento `AIGym/code-pretraining-8196` (1.632.309 filas), si bien no se garantiza calidad ni correccion del codigo generado.
- Exposicion a texto relacionado con seguridad y CVE mediante `CrowdMind/cve-assistant-text` (50.000 filas).
- Punto de partida para fine-tuning supervisado (SFT) y ajuste especifico de tarea.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles (no se especifican idiomas).

## Casos de uso

- Investigacion sobre curriculos de longitud de contexto: el modelo permite reproducir y estudiar el efecto de la progresion 2.048 -> 6.144 -> 8.196 tokens sobre el BPB de validacion en un entorno de un solo GPU consumer.
- Fine-tuning academico: sirve como base para experimentos de SFT y evaluacion de tecnicas de ajuste en modelos pequenos dentro del framework nanochat.
- Estudio de tokenizadores: al emplear un BPE propio de 32.768 tokens, es util para analizar el impacto del vocabulario en tareas de modelado de lenguaje.
- Pruebas de infraestructura de inferencia: su tamano reducido y su disponibilidad en GGUF permiten validar pipelines de despliegue (llama.cpp, Ollama) sin grandes requisitos de hardware.
- Analisis de datos de seguridad: el segmento CVE permite explorar como un modelo pequeno representa texto tecnico de vulnerabilidades, siempre con revision humana.
- Docencia y demostraciones: adecuado para ilustrar el funcionamiento interno de un transformer decoder-only y el flujo de preentrenamiento de nanochat en cursos o talleres.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| CORE (paso 1.679) | 0,0521 |
| BPB de validacion final | 0,3356 |
| Mejor BPB de validacion observado | 0,3315 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los valores anteriores son mediciones del propio run y no deben interpretarse como una evaluacion independiente de capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia: con 286 M de parametros, en FP16/BF16 requiere aproximadamente 0,6 GB solo para pesos; en cuantizacion de 8 bits alrededor de 0,3 GB y en 4 bits alrededor de 0,15 GB, mas overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio entrenamiento se realizo en una NVIDIA GeForce RTX 4060 Ti. Tambien cabe en RTX 3060, RTX 4090, A100 o H100 sin problema.
- Cabe holgadamente en GPU consumer, incluidas tarjetas con 4-8 GB de VRAM.
- Opciones de despliegue: llama.cpp y Ollama por la disponibilidad de GGUF; el checkpoint `.pt` requiere el codigo de nanochat/PyTorch. No se documenta soporte para vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CrowdMind/lamb-base | 286 M | 8.196 | No disponible | Hugging Face (GGUF y `.pt`) |
| GPT-2 small | 124 M | 1.024 | MIT | Amplia |
| GPT-2 medium | 355 M | 1.024 | MIT | Amplia |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | Hugging Face |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks estandar publicados para `lamb-base` que permitan una comparacion de rendimiento fiable. Frente a GPT-2 small/medium y SmolLM, `lamb-base` ofrece un contexto mayor (8.196 tokens) pero carece de licencia declarada y de evaluacion estandar, lo que dificulta su adopcion frente a alternativas con licencias permisivas y resultados publicos.

## Limitaciones y advertencias

- Es un checkpoint base, no un asistente verificado: no sigue instrucciones de forma fiable ni mantiene un formato conversacional util.
- Riesgo elevado de alucinacion, texto sesgado, ofensivo o fabricado; la evaluacion disponible no cubre seguridad, calibracion ni privacidad.
- Capacidad muy limitada: el CORE de 0,0521 refleja un rendimiento bajo en tareas estandar.
- El codigo y el texto sobre CVE del entrenamiento no garantizan salidas seguras ni correctas; es imprescindible revisar y probar cualquier salida.
- No se declara licencia, idiomas soportados ni procedencia completa de los datasets; antes de uso comercial o redistribucion hay que revisar los terminos de las fuentes (`CrowdMind/2048-pretraining`, `CrowdMind/6144-pretraining`, `AIGym/code-pretraining-8196`, `CrowdMind/cve-assistant-text`).
- Los datos de entrenamiento pueden contener material personal, con copyright o de baja calidad; el manifiesto no resuelve estas cuestiones.
- No se ha publicado checkpoint SFT ni evaluacion independiente; los resultados son especificos del run.
- No usar como unica base para decisiones consecuentes.

## Enlaces

- Hugging Face: https://huggingface.co/CrowdMind/lamb-base
- Dataset de preentrenamiento (segmento 1): https://huggingface.co/datasets/CrowdMind/2048-pretraining
- Dataset de preentrenamiento (segmento 2): https://huggingface.co/datasets/CrowdMind/6144-pretraining
- Dataset de codigo: https://huggingface.co/datasets/AIGym/code-pretraining-8196
- Dataset de seguridad/CVE: https://huggingface.co/datasets/CrowdMind/cve-assistant-text
- Base de codigo nanochat: no disponible como enlace en la informacion proporcionada
