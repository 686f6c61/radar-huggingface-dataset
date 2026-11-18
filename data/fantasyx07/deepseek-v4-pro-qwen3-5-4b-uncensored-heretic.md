# fantasyx07/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es un ajuste fino del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, publicado por el usuario fantasyx07. El modelo base es, a su vez, un fine-tune de Qwen3.5-4B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, entrenado sobre una mezcla de aproximadamente 250.000 muestras de matematicas y STEM. Esta version concreta aplica una ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) mediante la herramienta Heretic v2.0.0 para eliminar los comportamientos de rechazo del modelo original.

El resultado es un modelo de 4.539.265.536 parametros (4B) con licencia Apache 2.0, orientado a generacion de texto, razonamiento estructurado y resolucion de problemas matematicos y cientificos. La intervencion de decensura reduce los rechazos de 99/100 a 5/100 en la evaluacion del autor, con una divergencia KL de 0.0378 respecto al modelo base, lo que indica un cambio moderado en la distribucion de salidas.

Su relevancia radica en dos factores: por un lado, traslada la receta de destilacion de un modelo grande a la clase de 4B parametros, apta para despliegue en hardware de consumo; por otro, la modificacion heretic lo convierte en una opcion para escenarios donde el modelo base rechaza peticiones legitimas. El modelo se distribuye en formato safetensors y es compatible con transformers y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia Qwen3.5, segun tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repo contiene safetensors en fp16/bf16 (9,3 GB) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-4B, una arquitectura transformer de la familia Qwen3.5. El entrenamiento del modelo base consistio en destilacion desde DeepSeek-V4-Pro en modo Max Effect, con un conjunto de aproximadamente 250.000 muestras centradas en matematicas y razonamiento STEM, siguiendo el mismo pipeline que la version de 9B. La model card menciona SFT y evaluacion con MTP-Q8 (multi-token prediction cuantizado a 8 bits) entre las etiquetas y caracteristicas del modelo base, aunque no se detalla la composicion exacta del dataset ni el numero total de tokens de entrenamiento.

Sobre esa base, esta version aplica una Arbitrary-Rank Ablation (ARA) con Heretic v2.0.0. Los parametros de la ablacion son: start_layer_index 16, end_layer_index 32, preserve_good_behavior_weight 0.9854, steer_bad_behavior_weight 0.0002, overcorrect_relative_weight 0.6587 y neighbor_count 10. La intervencion actua sobre las capas 16 a 32 y busca preservar el comportamiento util mientras suprime las respuestas de rechazo. No se especifica si hubo RLHF o DPO adicional en esta etapa.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento estructurado con descomposicion explicita de problemas, aprendido por destilacion de DeepSeek-V4-Pro.
- Resolucion de problemas matematicos y cientificos (STEM), con enfasis en soluciones paso a paso.
- Capacidad multimodal de entrada image-text-to-text segun los tags del repo (heredada de la configuracion del modelo base).
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente.
- Multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Comportamiento decensurado: reduce drasticamente los rechazos (5/100 frente a 99/100 del original).
- Compatible con text-generation-inference y transformers.

## Casos de uso

- Tutoria de matematicas y ciencias: el modelo puede generar explicaciones paso a paso de problemas de algebra, calculo o fisica, aprovechando su entrenamiento sobre 250.000 muestras STEM destiladas de un profesor mas capaz.
- Generacion de codigo y scripts cientificos: util para traducir especificaciones a codigo Python o R en contextos de analisis de datos, con capacidad de razonamiento estructurado para depuracion.
- Asistente de investigacion documental: con soporte multilingue (en, zh, ko, ja, es, ru) puede resumir y comparar articulos tecnicos en varios idiomas en un mismo flujo de trabajo.
- Despliegue en hardware de consumo: con 4B parametros y pesos safetensors de 9,3 GB, cabe en GPU de gama alta para consumidores y en configuraciones cuantizadas, lo que permite prototipado local sin infraestructura cloud.
- Escenarios de red teaming y evaluacion de seguridad: al ser un modelo decensurado, sirve para estudiar comportamientos sin filtros en entornos controlados de investigacion sobre alineamiento.
- Fine-tuning posterior especializado: su licencia Apache 2.0 y tamano compacto lo hacen adecuado como base para ajustes en dominios concretos (por ejemplo, el autor menciona un fine-tune cientifico derivado, DeepThought-STEM).
- Procesamiento de imagenes y texto: si se confirma la capacidad image-text-to-text, podria usarse para tareas de descripcion de figuras cientificas o extraccion de datos de graficos.

## Benchmarks y rendimiento

La model card solo reporta metricas de la intervencion de decensurado, no benchmarks estandar de razonamiento o codigo.

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos (sobre 100) | 5/100 | 99/100 |
| Divergencia KL | 0.0378 | 0 (por definicion) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9-10 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion 8 bits: alrededor de 5-6 GB.
- VRAM estimada en cuantizacion 4 bits: alrededor de 3-4 GB (no se distribuyen GGUF oficiales en el repo, pero es convertible).
- GPU recomendadas: A100 40GB, H100, L40S para produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) para fp16 sin problemas.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 (16 GB) e incluso en GPUs de 8 GB con cuantizacion a 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (previa conversion), llama.cpp/Ollama (previa conversion a GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic (este) | 4,54B | no disponible | Apache 2.0 | Decensurado via Heretic; 5/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | 4,54B | no disponible | Apache 2.0 | Modelo base; 99/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9B (aprox.) | no disponible | Apache 2.0 | Version mayor de la misma receta |
| Qwen3.5-4B (modelo origen de la familia) | 4B (aprox.) | no disponible | no disponible en la informacion | Base arquitectonica sin destilacion DeepSeek |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de decensurado elimina filtros de seguridad: el modelo puede generar contenido que el original rechazaria, incluido material danino, ofensivo o ilegal. No es apto para despliegues publicos sin capas de moderacion externas.
- La divergencia KL de 0.0378 indica que la distribucion de salidas se ha alterado; puede haber degradacion en tareas que dependian de los rechazos suprimidos.
- Riesgo de alucinacion inherente a los modelos de 4B, especialmente en razonamiento matematico complejo y contextos largos.
- No se especifica la longitud de contexto soportada; asumir contextos cortos o medios hasta confirmacion.
- El modelo es un fine-tune comunitario sin evaluacion independiente publicada; los unicos datos de rendimiento son los del autor.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar normativas si se usa sin moderacion.
- Idiomas soportados limitados a seis; el rendimiento en espanol no esta cuantificado.
- La fecha de creacion indicada (2026-11-18) y el nombre "DeepSeek-V4-Pro" deben tratarse con cautela; no hay verificacion independiente de la procedencia del profesor de destilacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fantasyx07/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Version 9B decensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Fine-tune cientifico derivado (DeepThought-STEM): https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Heretic (herramienta de decensurado): https://heretic-project.org
