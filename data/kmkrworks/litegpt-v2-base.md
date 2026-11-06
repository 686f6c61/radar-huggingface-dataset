# kmkrworks/LiteGPT-V2-Base

## Resumen

LiteGPT V2 Base es un modelo de lenguaje de 201.373.952 parametros entrenado desde cero por el desarrollador independiente kmkrworks. Se trata de un transformer decoder-only de tipo denso con 28 capas, dimension oculta de 768, 12 cabezas de atencion y 4 cabezas KV (grouped-query attention), que incorpora RoPE, RMSNorm, QK-norm y SwiGLU. Su ventana de contexto es de 4.096 tokens y utiliza un tokenizer BPE a nivel de byte de 32.768 entradas entrenado especificamente para este modelo.

El modelo se presenta como una evolucion de LiteGPT V1 (124M parametros, arquitectura GPT-2 Small) y su propuesta de valor es la trazabilidad completa: cada experimento fue registrado antes de ejecutarse y los registros de entrenamiento, graficas y resultados estan publicos en el repositorio de GitHub del autor. El preentrenamiento completo se realizo en 37 horas sobre una unica GPU alquilada, lo que lo convierte en un caso de estudio util para investigadores que quieran reproducir el proceso.

Es relevante ahora porque demuestra que un modelo de ~200M parametros puede alcanzar un rendimiento competitivo en tareas de modelado de codigo (0,515 bits por byte, el mejor de los modelos por debajo de 300M medidos por el autor) y en tareas estructuradas tras fine-tuning (91,4% de exactitud en intenciones Banking77, JSON valido en el 99,99% de peticiones MASSIVE), con un consumo de solo 0,59 GiB de VRAM con batch 8 usando su propio motor de inferencia. Es un modelo base sin ajuste de seguridad, pensado para investigacion, aprendizaje y fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (RoPE, RMSNorm, QK-norm, SwiGLU, grouped-query attention) |
| Parametros totales | 201.373.952 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (pesos); MIT (codigo), con archivo NOTICE |
| Formato de pesos | safetensors (compatible con Transformers sin codigo remoto) |

Especificaciones adicionales: 28 capas, dimension de modelo 768, 12 cabezas de atencion, 4 cabezas KV, tokenizer BPE a nivel de byte de 32.768 tokens entrenado con la libreria `tokenizers` de Hugging Face. Tamano del repositorio: 0,4 GB.

## Arquitectura y entrenamiento

LiteGPT V2 es un transformer decoder-only denso con 28 capas y 768 dimensiones ocultas. Incorpora mejoras respecto a la arquitectura GPT-2 clasica de V1: RoPE para codificacion posicional rotatoria, RMSNorm en lugar de LayerNorm, QK-norm para estabilizar la atencion, SwiGLU como activacion en la MLP y grouped-query attention con 12 cabezas de consulta y 4 cabezas KV, lo que reduce el coste de memoria del KV cache. El tokenizer es un BPE a nivel de byte de 32.768 tokens entrenado sobre los datos del propio autor. El modelo carga en Transformers sin necesidad de codigo remoto.

El preentrenamiento se realizo en 37 horas sobre una unica GPU alquilada, con una mezcla de datos elegida mediante experimentos registrados previamente. La composicion es: FineWeb-Edu (72% en fase principal, 50% en fase de decay), Cosmopedia v2 generado por Mixtral-8x7B-Instruct (13% / 20%), FineMath (7,5% / 13%), codigo de Python, JavaScript, TypeScript, SQL y Shell procedente de github-code-clean (7,5% / 12%) y datos de SmolTalk (summarize, rewrite, constraints) generados por Qwen2.5-72B-Instruct (0% / 5% en decay). No se especifica el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO; al ser un modelo base, no se aplico ajuste de instrucciones ni de seguridad. La innovacion principal es metodologica: registro previo de cada experimento y publicacion completa de los registros de ejecucion.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base (completado de texto, no instrucciones).
- Modelado de codigo: el mejor bits por byte en codigo (0,515) entre los modelos por debajo de 300M parametros medidos por el autor.
- Modelado matematico: 0,928 bits por byte en datos matematicos.
- Razonamiento basico de sentido comun y conocimiento general (ARC-Easy, HellaSwag, PIQA, TriviaQA en evaluacion zero-shot).
- Capacidad de fine-tuning para clasificacion de intenciones (Banking77), extraccion de slots (MASSIVE) y extraccion de campos en contratos (CUAD).
- Generacion de JSON valido tras fine-tuning (99,99% en peticiones MASSIVE).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Clasificacion de intenciones en atencion al cliente: tras fine-tuning alcanza 91,4% de exactitud en Banking77, por lo que es adecuado para enrutar consultas de usuarios en un chatbot de soporte con recursos de computo muy limitados (0,59 GiB de VRAM con batch 8).
- Extraccion de informacion estructurada de documentos: con 0,711 de F1 en CUAD para campos de contratos, puede integrarse en pipelines de procesamiento documental que necesiten extraer clausulas y metadatos sin depender de APIs externas.
- Generacion de JSON para integracion con APIs: el 99,99% de respuestas JSON validas en MASSIVE tras fine-tuning lo hace util para generar payloads estructurados en sistemas de automatizacion.
- Asistencia de autocompletado de codigo en entornos con recursos limitados: su bajo bits por byte en codigo (0,515) y su huella de 1,66 GiB de RAM en CPU permiten desplegarlo localmente en portatiles para sugerencias de Python, JavaScript, TypeScript, SQL o Shell.
- Educacion e investigacion en entrenamiento de LLM: al ser un modelo construido desde cero con registros de experimentos publicos, sirve como caso de estudio reproducible para cursos y laboratorios sobre preentrenamiento, tokenizers y mezclas de datos.
- Fine-tuning para tareas de dominio especifico en ingles: su licencia Apache-2.0 y su tamano permiten ajustarlo en una unica GPU consumer para tareas de clasificacion, extraccion o generacion acotada.
- Prototipado rapido en CPU: con 1,66 GiB de RAM en CPU, permite validar pipelines de NLP antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (zero-shot, 10 tareas, media):

| Benchmark | LiteGPT V2 | LiteGPT V1 |
|---|---:|---:|
| Media zero-shot (10 tareas) | 0,383 | 0,371 |
| ARC-Easy | 0,588 | 0,529 |
| HellaSwag | 0,369 | 0,326 |
| PIQA | 0,663 | 0,630 |
| TriviaQA | 0,054 | 0,029 |
| Codigo, bits por byte (menor es mejor) | 0,515 | 1,612 |
| Matematicas, bits por byte (menor es mejor) | 0,928 | 1,374 |

Tras fine-tuning por tarea:

| Tarea | Puntuacion |
|---|---:|
| Banking77, exactitud de intencion | 0,914 |
| MASSIVE, F1 de slots | 0,775 |
| CUAD, F1 de campos de contrato | 0,711 |

Comparativa como modelo base (media de 3 semillas donde aplica):

| Modelo | Parametros | Media zero-shot (10 tareas) | Codigo, bits por byte | VRAM GPU, batch 8 |
|---|---:|---:|---:|---:|
| Qwen3-0.6B-Base | 596M | 0,489 | 0,372 | 2,72 GiB |
| SmolLM2-135M | 135M | 0,403 | 0,559 | 0,73 GiB |
| Gemma 3 270M | 268M | 0,393 | 0,617 | 2,59 GiB |
| LiteGPT V2 | 201M | 0,383 | 0,515 | 0,59 GiB |
| LiteGPT V1 | 124M | 0,371 | 1,612 | 0,78 GiB |

Comparativa text-to-data tras fine-tuning identico:

| Modelo | Parametros | Puntuacion media | Banking77 | MASSIVE | CUAD | RAM pico en CPU |
|---|---:|---:|---:|---:|---:|---:|
| Qwen3-0.6B | 596M | 0,851 | 0,931 | 0,812 | 0,809 | 4,27 GiB |
| Gemma 3 270M | 268M | 0,822 | 0,919 | 0,778 | 0,768 | 2,62 GiB |
| SmolLM2-135M | 135M | 0,817 | 0,920 | 0,787 | 0,745 | 1,61 GiB |
| LiteGPT V2 | 201M | 0,800 | 0,914 | 0,775 | 0,711 | 1,66 GiB |

Nota del autor: las cifras de memoria de V2 usan su propio motor de inferencia; las de los demas modelos usan Transformers.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,59 GiB con batch 8 usando el motor propio de LiteGPT; con Transformers la cifra no esta publicada, pero por tamano de pesos (0,4 GB en safetensors) es inferior a 1 GiB en fp16.
- RAM en CPU: 1,66 GiB en pico.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente; el autor no publica una lista de GPU recomendadas.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (GTX 1050 Ti o superior por VRAM), y en CPU con 2 GB de RAM libres.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), motor propio de LiteGPT (`litegpt generate`), y text-generation-inference segun los tags del repositorio. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media zero-shot | Codigo (bits/byte) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| LiteGPT V2 | 201M | 4.096 | 0,383 | 0,515 | Apache-2.0 | Hugging Face, Transformers |
| Qwen3-0.6B-Base | 596M | no disponible | 0,489 | 0,372 | no disponible | Hugging Face |
| SmolLM2-135M | 135M | no disponible | 0,403 | 0,559 | no disponible | Hugging Face |
| Gemma 3 270M | 268M | no disponible | 0,393 | 0,617 | no disponible | Hugging Face |

LiteGPT V2 no lidera la comparativa en rendimiento bruto, pero ofrece el menor consumo de VRAM (0,59 GiB) y un rendimiento en codigo superior a SmolLM2-135M y Gemma 3 270M con un tamano intermedio. Su ventaja diferencial es la trazabilidad completa del entrenamiento y la licencia Apache-2.0 para los pesos.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones ni de seguridad: no responde a instrucciones de forma fiable y requiere fine-tuning o prompting adecuado.
- Riesgo de alucinacion elevado: TriviaQA zero-shot de 0,054 indica conocimiento factual muy limitado; no debe usarse como fuente de hechos.
- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- No se especifica el numero total de tokens de entrenamiento, lo que dificulta evaluar el grado de agotamiento de los datos y el riesgo de sobreajuste.
- No hay datos publicados sobre sesgos, toxicidad o evaluacion de seguridad; al ser un modelo entrenado con datos web (FineWeb-Edu) y datos sinteticos, puede reproducir sesgos presentes en esas fuentes.
- La licencia Apache-2.0 permite uso comercial de los pesos, pero el codigo es MIT y existe un archivo NOTICE con atribuciones que debe respetarse; ademas, parte de los datos de entrenamiento derivan de generadores con licencia Qwen, lo que conviene revisar antes de un uso comercial a gran escala.
- Las cifras de memoria y rendimiento publicadas por el autor usan su propio motor de inferencia, no Transformers, por lo que no son directamente comparables con las de otros modelos.
- El modelo tiene solo 153 descargas y 0 likes en Hugging Face, lo que indica una validacion externa muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/kmkrworks/LiteGPT-V2-Base
- Repositorio GitHub: https://github.com/kmkrofficial/LiteGPT
- Resultados completos (incluye comparacion con 16 modelos): https://github.com/kmkrofficial/LiteGPT/blob/main/docs/results.md
- Fuentes de datos y revisiones: https://github.com/kmkrofficial/LiteGPT/blob/main/docs/spec/data_sources.yaml
- Modelo predecesor LiteGPT V1: https://huggingface.co/kmkrworks/LiteGPT-Base
- Grafica comparativa V1 vs V2: https://raw.githubusercontent.com/kmkrofficial/LiteGPT/main/docs/figures/v1_vs_v2.svg
