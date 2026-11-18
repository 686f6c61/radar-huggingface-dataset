# IFM/K2-Horizon-3.7B-GGUF

## Resumen

K2-Horizon-3.7B es un modelo de lenguaje decoder-only denso desarrollado por IFM, presentado como el miembro pequeno de la familia K2-Horizon. Con un nucleo de 3.700 millones de parametros (aunque los pesos en safetensors del modelo base suman 5.058.255.360 parametros totales, incluyendo embeddings y cabezas), esta disenado como una linea base solida para tareas agenticas, de codigo y de razonamiento dentro de su categoria de tamano.

Su caracteristica mas destacable es una ventana de contexto nativa de 524.288 tokens (512K), activa desde las etapas de midtraining, algo poco habitual en modelos de menos de 4.000 millones de parametros. El modelo se distribuye con licencia Apache 2.0 y con un nivel de apertura poco frecuente: datos de preentrenamiento y midtraining, receta de entrenamiento, codigo y recursos de evaluacion son publicos, ademas de checkpoints intermedios para estudiar la evolucion de capacidades.

Esta ficha corresponde a la version GGUF del modelo, publicada para su uso con llama.cpp e integrable en transformers. La relevancia actual del modelo radica en combinar contexto ultralargo, apertura total del pipeline de entrenamiento y un tamano que permite despliegue en hardware de consumo, lo que lo convierte en un candidato atractivo para evaluacion de tecnicas de contexto largo y para pipelines de agentes en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 5.058.255.360 (pesos en safetensors); nucleo declarado de 3.7B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K), nativo desde midtraining |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); modelo base en safetensors |

## Arquitectura y entrenamiento

K2-Horizon-3.7B es un transformer decoder-only denso, sin mezcla de expertos ni componentes de estado recurrente. El modelo parte de un preentrenamiento sobre el dataset IFM/K2-Horizon-Pretrain-Data y continua con una fase de midtraining sobre IFM/K2-Horizon-Midtrain-Data, etapa en la que se establece la ventana de contexto nativa de 524.288 tokens. El modelo base y la receta de entrenamiento son publicos, junto con checkpoints intermedios que permiten analizar la evolucion de capacidades a lo largo del entrenamiento en lugar de unicamente en el checkpoint final.

La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La distribucion GGUF incluye metadatos del tokenizer y una plantilla de chat compatible con llama.cpp, lo que facilita su uso conversacional directo.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de conversaciones multi-turno mediante plantilla de chat incluida en los GGUF.
- Razonamiento y tareas de codigo, evaluado por el autor en los mismos benchmarks agenticos, de codigo y razonamiento que el resto de la familia.
- Contexto largo nativo de 512K tokens, adecuado para documentos extensos, repositorios de codigo o historiales de conversacion prolongados.
- Uso como linea base de investigacion: checkpoints intermedios, datos y receta publicos permiten reproducir y estudiar el entrenamiento.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema transformers y llama.cpp.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios de codigo completos: con 512K tokens de contexto, el modelo puede ingerir varios ficheros o un repositorio de tamano medio en una sola pasada para tareas de resumen, busqueda de patrones o revision de cambios, algo inviable en modelos de 3-4B con contexto de 8K-32K.
- Procesamiento de documentacion legal o tecnica extensa: contratos, manuales o especificaciones de cientos de paginas caben en la ventana de contexto, permitiendo preguntas y respuestas sin necesidad de pipelines de recuperacion complejos.
- Agentes de investigacion sobre corpus largos: el contexto nativo reduce la dependencia de tecnicas RAG y permite razonar sobre el material completo, util en entornos donde la infraestructura de recuperacion no esta disponible.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPUs consumer con llama.cpp u Ollama, habilitando asistentes locales de codigo o documentacion con contexto largo.
- Generacion de codigo en pipelines ligeros: integrable via llama.cpp en herramientas de CI o editores, con la ventaja de que el contexto largo permite pasar el fichero completo y su historial de cambios como entrada.
- Investigacion sobre entrenamiento y contexto largo: los checkpoints intermedios, datos y receta publicos permiten estudiar como emerge la capacidad de contexto largo durante el midtraining, un caso de uso directamente apoyado por el autor.
- Evaluacion comparativa de modelos pequenos: sirve como referencia densa de 3.7B en benchmarks agenticos y de razonamiento, con resultados publicados frente a Qwen3.5-4B, G9v3-3B, Granite 4.2-3B y Nemotron 3 Nano-4B.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con los modelos Qwen3.5-4B, G9v3-3B, Granite 4.2-3B y Nemotron 3 Nano-4B, pero los datos extraidos solo contienen las filas de parametros totales, parametros activos y arquitectura, no los valores numericos de los benchmarks. Por tanto:

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en Q4_K_M, 3,5-4 GB en Q5_K_M y Q5_0, 4-4,5 GB en Q6_K, 5,5-6 GB en Q8_0 y unos 10-11 GB en BF16 (estimaciones a partir de los 5.058 millones de parametros de los pesos).
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 o superiores para BF16 y Q8_0; RTX 4060 Ti 16 GB, RTX 4070 o RTX 3060 12 GB para cuantizaciones Q4-Q6 con contexto largo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 8 GB o mas usando Q4_K_M o Q5_K_M; las cuantizaciones Q8_0 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp (requiere la release b11454 o posterior, donde se fusiono el soporte de la arquitectura K2 Horizon en mainline), Ollama y otros frontends basados en llama.cpp; transformers para el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. Nota: el contexto de 512K implica una cache KV considerable; con cuantizacion de cache y hardware consumer, el uso practico del contexto completo puede requerir ajustes de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| K2-Horizon-3.7B | 3,7B (nucleo) | 512K | Apache 2.0 | Datos, receta y checkpoints publicos |
| Qwen3.5-4B | 4B | No disponible | No disponible | Referencia en la tabla del autor |
| G9v3-3B | 3B | No disponible | No disponible | Referencia en la tabla del autor |
| Granite 4.2-3B | 3B | No disponible | No disponible | Referencia en la tabla del autor |
| Nemotron 3 Nano-4B | 4B | No disponible | No disponible | Referencia en la tabla del autor |

Los datos de contexto, licencia y rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada; solo se confirman sus tamanos y que son modelos densos de pesos abiertos segun la tabla de la model card.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni tasas de alucinacion; como todo modelo generativo de este tamano, es esperable un riesgo significativo en tareas de conocimiento factual.
- Sesgos: no se proporciona informacion sobre sesgos conocidos ni sobre el proceso de alineacion aplicado (RLHF/DPO no confirmados).
- Contexto largo: aunque la ventana nativa es de 512K tokens, no se publican resultados de benchmarks especificos de contexto largo (por ejemplo, needle-in-a-haystack) en la informacion disponible; el rendimiento efectivo en contextos muy largos debe validarse empiricamente.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario debe verificar el cumplimiento de las licencias de las dependencias (llama.cpp) y de los datasets publicados.
- Despliegue: requiere llama.cpp b11454 o posterior; versiones anteriores no cargaran los GGUF por falta de soporte de la arquitectura K2 Horizon.
- Memoria: el contexto de 512K exige una cache KV grande; sin cuantizacion de cache o hardware adecuado, el uso del contexto completo puede provocar OOM.
- Madurez: modelo reciente (publicado en septiembre de 2026), con 60 likes y 21.306 descargas en el momento de la consulta; el ecosistema de herramientas y validaciones de terceros es limitado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/IFM/K2-Horizon-3.7B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- Release de llama.cpp con soporte K2 Horizon (b11454): https://github.com/ggml-org/llama.cpp/releases?page=5#release-b11454
