# mradermacher/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-Tess-i1-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-Tess`, preparadas por `mradermacher` para su uso con `llama.cpp`, `Ollama` y otras herramientas compatibles con GGUF. El modelo base es un sistema de 27 320 millones de parámetros (27B) etiquetado como experimental, desarrollado por `nightmedia`, que combina técnicas de destilación (se menciona destilación de Claude 4.6), merge con `mergekit` y ajuste por SFT/LoRA sobre una base Qwen3.6. Está orientado a tareas de razonamiento, código, matemáticas, STEM, escritura creativa y roleplaying, con soporte multilingüe (inglés, chino, japonés y español) y capacidades de visión (es un modelo de visión, aunque los archivos `mmproj` se encuentran en el repositorio estático de cuantizaciones).

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 27B con ventana de contexto potencialmente larga (los tags mencionan 256k y 1M, aunque no se confirma) en hardware de consumo mediante cuantización. La licencia Apache 2.0 permite uso comercial y modificación, lo que lo hace atractivo para prototipos y despliegues en producción. Sin embargo, al tratarse de un modelo experimental sin documentación técnica detallada, se recomienda precaución y evaluación propia antes de usarlo en entornos críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso, basado en Qwen3.6) |
| Parametros totales | 27 320 697 856 (27,32B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los tags mencionan 256k y 1M, sin confirmar) |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas de archivo imatrix) |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors (bf16) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, los datos de entrenamiento o el proceso de entrenamiento del modelo base. Los metadatos indican que se trata de un modelo experimental construido a partir de Qwen3.6 (posiblemente una variante de la familia Qwen), con tecnicas de destilacion (mencion de Claude 4.6), merge mediante `mergekit` y ajuste por SFT/LoRA. Tambien se menciona `unsloth` como herramienta de optimizacion. No hay datos sobre el numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO. La unica informacion confirmada es que el modelo es de tipo vision (incluye proyector multimodal) y que se distribuye en cuantizaciones GGUF con pesos imatrix para mejorar la calidad de cuantizacion.

## Capacidades

- Generacion de texto y conversacion multilingue (en, zh, ja, es).
- Razonamiento y cadena de pensamiento (chain-of-thought, long-cot), segun los tags.
- Soporte para codigo, matematicas y tareas STEM.
- Escritura creativa: ficcion, ciencia ficcion, generacion de tramas, continuacion de escenas, storytelling y roleplaying.
- Capacidades de vision (modelo multimodal), aunque los archivos `mmproj` estan en el repositorio estatico de cuantizaciones.
- No se menciona explicitamente soporte de tool calling ni function calling, aunque el tag "All use cases" podria sugerirlo; no esta confirmado.

## Casos de uso

- Generacion de codigo y asistencia en programacion: el modelo puede ayudar a escribir, revisar o explicar codigo en multiples lenguajes, aprovechando su entrenamiento en tareas de codigo y STEM. Se puede integrar en editores o pipelines de CI/CD mediante APIs locales.
- Escritura creativa automatizada: gracias a su orientacion a ficcion, tramas y storytelling, es adecuado para generar borradores de novelas, guiones o contenido narrativo, con control de estilo y genero.
- Roleplaying y simulacion de personajes: su capacidad de mantener conversaciones largas y coherentes lo hace util para juegos de rol, chatbots de personajes o asistentes narrativos.
- Asistente multilingue para atencion al cliente: al soportar ingles, chino, japones y español, puede gestionar consultas en varios idiomas, aunque se debe validar su calidad en cada lengua.
- Razonamiento y analisis de documentos: con su capacidad de razonamiento y contexto largo (si se confirma), podria resumir o analizar documentos extensos, extraer conclusiones o responder preguntas complejas.
- Prototipado rapido de aplicaciones de IA: al estar disponible en GGUF y con licencia Apache 2.0, es facil de desplegar localmente con `llama.cpp` u `Ollama` para experimentar con tareas de generacion, vision o razonamiento sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion elegida. Por ejemplo, `i1-Q4_K_M` ocupa 16,9 GB, por lo que se necesita al menos 20 GB de VRAM para una ejecucion comoda (incluyendo cache y overhead). Las cuantizaciones mas pequeñas como `i1-Q2_K` (11 GB) podrian caber en GPUs de 12 GB, pero con perdida notable de calidad.
- GPU recomendadas: para cuantizaciones Q4 o superiores, se recomienda una RTX 3090 (24 GB), RTX 4090 (24 GB) o A100 (40 GB). Para cuantizaciones Q2/Q3, una RTX 3060 de 12 GB o similar podria ser suficiente.
- Si cabe en consumer GPU: si, en GPUs de consumo con 12-24 GB de VRAM, dependiendo de la cuantizacion.
- Opciones de despliegue: al ser GGUF, se puede usar con `llama.cpp`, `Ollama`, `LM Studio`, `koboldcpp` y servidores compatibles con la API de OpenAI (por ejemplo, `llama.cpp` server). Tambien es compatible con `mlx` (mencionado en los tags) para Apple Silicon.
- Latencia y throughput: no se proporcionan datos concretos. En una RTX 4090 con cuantizacion Q4_K_M, se espera una velocidad de generacion de entre 20 y 40 tokens por segundo, pero es una estimacion orientativa.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria (por ejemplo, otros Qwen de 27B o modelos similares). No se han publicado benchmarks ni especificaciones detalladas del modelo base que permitan una comparacion objetiva.

## Limitaciones y advertencias

- Modelo experimental: no hay documentacion tecnica oficial, articulos ni evaluaciones independientes. Su comportamiento en produccion no esta garantizado.
- Riesgo de alucinacion y sesgos: al no haber evaluacion publica, se desconoce su fiabilidad en tareas factuales. Es probable que presente alucinaciones en temas especializados.
- Limitaciones de contexto: aunque los tags mencionan 256k y 1M, no se ha confirmado la longitud real de contexto soportada. Es posible que el modelo base tenga limitaciones practicas inferiores.
- Calidad de cuantizacion: las cuantizaciones i1 (imatrix) ofrecen mejor calidad que las estaticas equivalentes, pero aun asi hay perdida de precision respecto al modelo en bf16.
- Soporte de vision: los archivos `mmproj` no estan en este repositorio, sino en el repositorio estatico. Para usar la modalidad vision, es necesario descargarlos por separado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base puede incorporar componentes con restricciones adicionales (no se especifica). Se recomienda revisar la licencia del repositorio original.

## Enlaces

- Repositorio GGUF (este): https://huggingface.co/mradermacher/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-Tess-i1-GGUF
- Repositorio estatico de cuantizaciones (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-Tess-GGUF
- Modelo base (nightmedia): https://huggingface.co/nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-Tess
- Pagina de descarga con vista general: https://hf.tst.eu/model#Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-Tess-i1-GGUF
