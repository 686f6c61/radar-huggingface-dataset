# MalayKedia/qwen_uncompressed_init

## Resumen

MalayKedia/qwen_uncompressed_init es una copia verbatim, sin ninguna modificación, del checkpoint Qwen/Qwen3-4B-Instruct-2507, fijado en el commit `cdbee75f17c01a7cc42f958dc650907174af0554`. El autor, MalayKedia, lo publica como punto de referencia fijo para un proyecto de compresión de modelos: todas las ratios de compresión y deltas de precisión se miden contra estos números. No hay ningún peso alterado; es un baseline puro.

El modelo subyacente es el Qwen3-4B-Instruct-2507, la variante instruct sin modo *thinking* (no emite bloques `thinking`), con arquitectura transformer densa de 36 capas, hidden size 2560, intermediate 9728, atención GQA con 32 cabezas de consulta y 8 de clave/valor, head_dim 128 y vocabulario de 151 936 tokens. Tiene 4 022 468 096 parámetros en BF16, lo que ocupa 8,04 GB (7,49 GiB). Su relevancia radica en que permite aislar el efecto de la compresión sobre un checkpoint concreto, sin ruido de versiones o cambios de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B-Instruct-2507) |
| Parametros totales | 4 022 468 096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion) |
| Tipos de cuantizacion | BF16 (unico formato publicado) |
| Idiomas soportados | no disponible (hereda los del modelo base, no declarados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una copia exacta del Qwen3-4B-Instruct-2507, por lo que su arquitectura es la de ese checkpoint: un transformer causal denso con 36 capas, hidden size 2560, intermediate size 9728, atención GQA (32 cabezas de consulta, 8 de clave/valor, head_dim 128) y embeddings atados (`tie_word_embeddings: true`), lo que significa que la capa de embedding (389 M parámetros) se comparte con `lm_head`. El vocabulario es de 151 936 tokens.

No hay información sobre el entrenamiento porque no se ha realizado ninguno: los pesos son idénticos al checkpoint original. La model card confirma que es la variante *non-thinking* del instruct, distinta del Qwen3-4B original de abril de 2025. La distribución de parámetros es: MLP 66,9 % (2 689 597 440), attention 23,5 % (943 718 400), embedding 9,7 % (388 956 160) y norm 0,0 % (196 096).

## Capacidades

- Generación de texto y razonamiento: al ser una copia del Qwen3-4B-Instruct-2507, hereda sus capacidades de comprensión y generación de lenguaje natural, incluyendo razonamiento de varios pasos.
- Generación de código y matemáticas: el modelo base está entrenado para tareas de programación y resolución de problemas matemáticos.
- Tool calling / function calling: el Qwen3-4B-Instruct-2507 soporta llamada a herramientas, por lo que esta copia también la ofrece.
- Soporte de agentes y multi-step reasoning: puede integrarse en flujos agénticos, aunque al ser la variante *non-thinking* no emite bloques de razonamiento explícitos.
- Capacidades multilingües: el modelo base es multilingüe (entrenado con datos en múltiples idiomas), aunque no se detallan los idiomas concretos en la información proporcionada.
- Sin capacidades multimodales: es un modelo de solo texto; no procesa visión ni audio.

## Casos de uso

- Punto de referencia en experimentos de compresión: es el uso principal declarado. Sirve para medir la degradación de precisión tras aplicar técnicas como poda, cuantización o destilación, comparando siempre contra estos números fijos.
- Evaluación comparativa de modelos comprimidos: cualquier equipo que desarrolle métodos de compresión puede usar este checkpoint como baseline para reportar métricas (perplejidad, accuracy en tareas downstream) antes y después de comprimir.
- Reproducibilidad de investigaciones: al estar fijado en un commit concreto y verificado byte a byte, permite reproducir experimentos sin variabilidad de versiones.
- Pruebas de infraestructura de inferencia: al ser un modelo de 4B en BF16, sirve para validar pipelines de despliegue (vLLM, TGI, etc.) antes de usar versiones comprimidas.
- Estudio de distribución de pesos: la model card detalla dónde viven los bytes (MLP, attention, embedding), útil para investigar qué capas son más sensibles a la compresión.
- Benchmarking de hardware: con 8 GB de pesos, es adecuado para medir throughput y latencia en GPUs de consumo y profesionales, estableciendo una línea base de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares. Al ser una copia del Qwen3-4B-Instruct-2507, los benchmarks del modelo original serían aplicables, pero no se proporcionan en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa 8,04 GB. Para inferencia con contexto moderado, se recomienda al menos 10-12 GB de VRAM para evitar desbordamientos con el KV cache.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o cualquier GPU con al menos 12 GB de VRAM. En GPUs de 8 GB (como RTX 3070) podría caber con cuantización, pero no se ofrecen pesos cuantizados.
- Si cabe en consumer GPU: sí, en GPUs de gama alta (RTX 3090, 4090) y en muchas de gama media con 12-16 GB (RTX 4070 Ti, 4080).
- Opciones de despliegue: vLLM, TensorRT-LLM, llama.cpp (requiere conversión a GGUF), Ollama (si se convierte), Hugging Face TGI. Al ser safetensors estándar, es compatible con cualquier framework que soporte el formato.
- Latencia y throughput: no disponibles. Dependen del hardware y del backend; con una RTX 4090 y vLLM se puede esperar un throughput de decenas de tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MalayKedia/qwen_uncompressed_init | 4,02 B | no disponible | Apache-2.0 | safetensors BF16 | Copia verbatim del Qwen3-4B-Instruct-2507 |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 B | no disponible (original) | Apache-2.0 | safetensors | Modelo base original, mismo checkpoint |
| Qwen/Qwen3-4B (abril 2025) | 4,02 B | no disponible | Apache-2.0 | safetensors | Versión anterior, con modo thinking |

La comparativa es trivial: este modelo es idéntico al Qwen3-4B-Instruct-2507 original. No tiene sentido compararlo con otros modelos de 4B (como Llama-3.2-3B o Gemma-2-9B) porque no hay datos de rendimiento propios y su propósito es servir de baseline, no competir.

## Limitaciones y advertencias

- No es un modelo nuevo: es una copia sin cambios. Cualquier uso que no sea como baseline de compresión debería considerar el modelo original directamente.
- Sesgos y alucinaciones: hereda los del Qwen3-4B-Instruct-2507, que no están documentados en esta ficha. Como todo LLM, puede generar contenido incorrecto o inventado.
- Sin cuantizaciones: solo se publica en BF16. Para despliegue en hardware limitado, el usuario debe cuantizar por su cuenta, lo que puede introducir degradación.
- Contexto no especificado: no se indica la longitud de contexto soportada. El Qwen3-4B-Instruct-2507 soporta 32K tokens (según documentación oficial), pero no se confirma aquí.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero al ser una copia, se debe atribuir correctamente al modelo base.
- Sin soporte de visión ni audio: es un modelo de solo texto; no procesa entradas multimodales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MalayKedia/qwen_uncompressed_init
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Documentación de Qwen: https://qwen.readthedocs.io/
