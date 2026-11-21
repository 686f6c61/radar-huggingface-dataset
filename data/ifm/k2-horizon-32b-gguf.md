# IFM/K2-Horizon-32B-GGUF

## Resumen

K2-Horizon-32B-Stage1 es un modelo de lenguaje decoder-only de tipo dense con 32B parámetros (34.779.304.960 parámetros reales según los pesos en safetensors) desarrollado por IFM. Forma parte de la familia K2-Horizon, de la que constituye el miembro dense de mayor tamaño, y se distribuye en este repositorio en formato GGUF para su uso con llama.cpp. Su rasgo más distintivo es una ventana de contexto nativa de 524.288 tokens (512K), disponible desde las etapas de midtraining.

El modelo se publica como open-weights bajo licencia Apache 2.0, con compromiso explícito del autor de liberar los datos de entrenamiento, la receta y el código de entrenamiento. El checkpoint disponible corresponde a la etapa 1 del entrenamiento final; el autor indica que el checkpoint definitivo (etapa 2) se publicará más adelante, junto con checkpoints intermedios para estudiar la evolución de capacidades a lo largo del entrenamiento.

Es relevante ahora porque ofrece una alternativa dense de tamaño medio con contexto extremadamente largo en un ecosistema (GGUF + llama.cpp) que facilita el despliegue local y en infraestructura propia, y porque su evaluación se presenta frente a modelos dense open-weights comparables (Qwen3.8-27B, Muse Glimmer-30B, IBM Granite 4.2 30B) en benchmarks agénticos, de código y de razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only dense |
| Parámetros totales | 34.779.304.960 (32B nominales) |
| Parámetros activos | No aplica (modelo dense) |
| Longitud de contexto | 524.288 tokens (512K), nativa desde midtraining |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base IFM/K2-Horizon-32B |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only dense, sin mezcla de expertos: los 32B parámetros están activos en cada paso de inferencia. El contexto nativo de 524.288 tokens se establece a partir de las etapas de midtraining, lo que sugiere una extensión planificada del contexto durante el entrenamiento en lugar de un ajuste posterior. La model card no detalla el número de capas, dimensiones ocultas, cabezas de atención ni el mecanismo exacto de atención empleado para sostener esa ventana.

El entrenamiento se organiza en etapas: el checkpoint publicado corresponde a la etapa 1 del entrenamiento final, con una etapa 2 pendiente de publicación. Los datasets referenciados son IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data, y el autor anuncia la publicación de los datos, la receta y el código de entrenamiento. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con llama.cpp incluida en los ficheros GGUF.
- Razonamiento y resolución de tareas evaluadas en benchmarks agénticos, de código y de razonamiento (según la model card).
- Procesamiento de contexto largo: hasta 524.288 tokens, adecuado para documentos extensos, repositorios de código o historiales de conversación prolongados.
- Uso como modelo base dense para tareas de generación y continuación de texto.
- Compatibilidad con endpoints (tag `endpoints_compatible` en el repositorio).
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Análisis de documentación técnica extensa: con 512K tokens de contexto, el modelo puede ingerir manuales completos, especificaciones o expedientes y responder preguntas sobre ellos sin fragmentación ni recuperación externa.
- Revisión de repositorios de código: el contexto largo permite cargar múltiples ficheros de un proyecto en una sola pasada para tareas de explicación, búsqueda de patrones o detección de inconsistencias entre módulos.
- Asistentes conversacionales de sesión larga: el historial completo de una conversación prolongada cabe en la ventana, lo que reduce la pérdida de información que sufren los modelos con contexto corto en diálogos multi-turno.
- Despliegue local con llama.cpp: las variantes Q4_K_M y Q5_K_M permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo alta o en servidores con memoria unificada, sin depender de APIs externas.
- Procesamiento por lotes de textos largos: resúmenes, extracción de información y clasificación sobre corpus de documentos de gran tamaño en pipelines offline.
- Base para fine-tuning e investigación: al ser open-weights con licencia Apache 2.0 y con datos y receta de entrenamiento anunciados, sirve como punto de partida para ajustes específicos de dominio y para estudios de escalado de contexto.
- Evaluación comparativa de arquitecturas dense: útil como referencia en experimentos que comparen modelos dense de ~30B en tareas de contexto largo.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa frente a Qwen3.8-27B, Muse Glimmer-30B e IBM Granite 4.2 30B en benchmarks agénticos, de código y de razonamiento. Sin embargo, en la información proporcionada solo se conservan las filas de número de parámetros, parámetros activos y arquitectura; los valores numéricos de los benchmarks no están disponibles en el extracto recibido.

| Modelo | Parámetros | Parámetros activos | Arquitectura |
|---|---|---|---|
| K2-Horizon-32B-Stage1 | 32B | 32B | Dense |
| Qwen3.8-27B | 27B | 27B | Dense |
| Muse Glimmer-30B | 30B | 30B | Dense |
| IBM Granite 4.2 30B | 30B | 30B | Dense |

No se han publicado en la información disponible los resultados numéricos de los benchmarks (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 70 GB solo para pesos, más caché KV para el contexto; en Q8_0, en torno a 35 GB; en Q6_K, unos 27 GB; en Q5_K_M, unos 23 GB; en Q4_K_M, unos 20 GB. Estas cifras son estimaciones a partir del tamaño del modelo y no están confirmadas en la información disponible.
- La caché KV para 512K tokens es el factor limitante principal: a mayor contexto configurado, mayor memoria adicional necesaria, por lo que en la práctica conviene ajustar la ventana al caso de uso.
- GPU recomendadas: A100 80 GB o H100 para BF16 con contexto largo; para cuantizaciones Q4/Q5, GPU de 24 GB (RTX 4090, RTX 3090) pueden ser suficientes con contextos moderados, y configuraciones multi-GPU o memoria unificada (por ejemplo, Apple Silicon de gama alta) para ventanas grandes.
- Cabe en GPU de consumo en cuantizaciones Q4_K_M y Q5_K_M con contexto reducido; no cabe en BF16 en GPU de consumo.
- Opciones de despliegue: llama.cpp (requiere una versión con soporte de la arquitectura K2 Horizon; el soporte en mainline se integró en la release b11454), y herramientas construidas sobre llama.cpp como Ollama o servidores compatibles con la API de OpenAI. No se documenta soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| K2-Horizon-32B-Stage1 | 32B dense | 524.288 tokens | Apache 2.0 | GGUF en Hugging Face; safetensors en el modelo base | Checkpoint de etapa 1; etapa 2 pendiente |
| Qwen3.8-27B | 27B dense | No disponible | No disponible | No disponible | Incluido como referencia en la tabla del autor |
| Muse Glimmer-30B | 30B dense | No disponible | No disponible | No disponible | Incluido como referencia en la tabla del autor |
| IBM Granite 4.2 30B | 30B dense | No disponible | No disponible | No disponible | Incluido como referencia en la tabla del autor |

Los datos de contexto, licencia y disponibilidad de los modelos comparables no figuran en la información proporcionada; solo se dispone de sus parámetros y arquitectura según la tabla de la model card.

## Limitaciones y advertencias

- El checkpoint publicado es la etapa 1 del entrenamiento final; el autor advierte que el checkpoint definitivo está pendiente, por lo que el rendimiento puede cambiar sustancialmente en la versión final.
- Modelo entrenado y declarado únicamente para inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- No se documentan en la información disponible datos sobre sesgos, filtrado de datos ni técnicas de alineación (RLHF/DPO), lo que dificulta evaluar el riesgo de respuestas sesgadas o inapropiadas.
- Riesgo de alucinación inherente a los modelos de lenguaje; con contextos de 512K tokens, la degradación de la atención en posiciones lejanas puede aumentar el riesgo de omitir o distorsionar información.
- El contexto largo exige mucha memoria para la caché KV; en hardware limitado habrá que recortar la ventana efectiva, lo que reduce una de las ventajas principales del modelo.
- Requiere una versión de llama.cpp con soporte de la arquitectura K2 Horizon (mainline desde b11454); versiones anteriores no cargarán los ficheros GGUF.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base y de los datasets anunciados cuando se publiquen.
- No se documenta soporte de tool calling ni de agentes multi-paso, por lo que no debe asumirse su uso en pipelines agénticos sin validación previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/IFM/K2-Horizon-32B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-32B
- Dataset de pretraining: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- Release de llama.cpp con soporte K2 Horizon (b11454): https://github.com/ggml-org/llama.cpp/releases?page=5#release-b11454
