# capyctl/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una cuantización de 4 bits (NVFP4, W4A4 con grupo de 16) del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario capyctl. La cuantización se realizó con NVIDIA Model Optimizer 0.47.0 y aplica NVFP4 a todas las proyecciones lineales grandes del modelo de lenguaje: MLP, `lm_head`, atención q/k/v/o y las proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj` del bloque Gated DeltaNet. A diferencia de la build de NVIDIA, que mantiene atención y DeltaNet en FP8, esta versión las cuantiza también a NVFP4, reduciendo el peso leído por token de 17,61 GB a 14,45 GB.

El modelo base es un transformer híbrido (atención clásica combinada con capas Gated DeltaNet, un mecanismo de atención lineal) con torre de visión, pipeline image-text-to-text y una cabeza MTP (multi-token prediction) que se conserva en BF16 para permitir decodificación especulativa en motores como vLLM o SGLang. La revisión actual mejora la selección de escalas de bloque: en lugar de tomar la escala por defecto (basada en el peso máximo del bloque), elige entre 21 candidatas (de 0,60x a 1,10x) la que redondea más cerca de los pesos BF16, bajando el error de los pesos de 4 bits del 9,48% al 8,59%.

Es relevante para despliegues en hardware con soporte NVFP4 (por ejemplo, NVIDIA GB10) donde el cuello de botella es el ancho de banda de memoria en decodificación de un solo stream: el checkpoint ocupa 18,77 GB en disco y lee 14,45 GB por token, frente a los 21,92 GB y 17,61 GB de la build de NVIDIA. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención clásica y capas Gated DeltaNet; torre de visión; cabeza MTP |
| Parametros totales | 14.557.547.760 (según safetensors del repo; el nombre comercial del modelo base indica 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 con grupo de 16 en MLP, `lm_head`, atención q/k/v/o y proyecciones DeltaNet; BF16 en embeddings, `in_proj_a/b`, `conv1d`, `A_log`, `dt_bias`, normas, torre de visión y cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B combina capas de self-attention clásica (16 capas, según el desglose de tensores de la model card) con capas Gated DeltaNet (48 capas), un mecanismo de atención lineal con estado recurrente. El modelo de lenguaje tiene 64 capas MLP. Incluye una torre de visión (pipeline image-text-to-text) y una cabeza MTP que se mantiene en BF16 para que los motores de inferencia puedan usarla como drafter en decodificación especulativa.

Esta ficha no documenta el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO); esa información correspondería a la model card de Qwen/Qwen3.8-27B y no está incluida en la información disponible. La innovación técnica de esta publicación es exclusivamente la cuantización: NVFP4 en todas las proyecciones grandes (208 tensores que NVIDIA mantiene en FP8 pasan aquí a NVFP4) y una búsqueda de escalas de bloque por tensor para minimizar el error de redondeo respecto a BF16. El KV cache no se cuantiza en el checkpoint; se recomienda servir con KV cache en FP8 si se desea.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con modo thinking activable (las mediciones se hicieron con thinking on).
- Generación de código: la model card evalúa con prompts de coding y reporta un 92,98% de acuerdo con BF16 en esa categoría.
- Matemáticas: evaluado en GSM8K (98,3% de respuestas correctas que terminan en 2.048 tokens en esta revisión).
- Tool calling / function calling: 30/30 casos correctos en vLLM y 29/30 en SGLang en el conjunto de prueba del autor.
- Procesamiento de imagen y texto (pipeline image-text-to-text, torre de visión en BF16).
- Capacidades multilingües: se mencionan prompts multilingües en el conjunto de evaluación, pero no se detallan los idiomas soportados.
- Decodificación especulativa: la cabeza MTP en BF16 permite drafting con DFlash2 en vLLM y SGLang.

## Casos de uso

- Inferencia de un solo stream en hardware con NVFP4: el checkpoint lee 14,45 GB por token, un 18% menos que la build de NVIDIA (17,61 GB), lo que se traduce en 35,7 tokens/s frente a 29,0 en vLLM 0.32.0 con DFlash2 sobre un GB10. Adecuado para asistentes interactivos donde prima la latencia por token.
- Servicio multiusuario en un solo acelerador: con 8 streams alcanza 181 tokens/s totales en vLLM con DFlash2 (+13% frente a NVIDIA) y 166 en SGLang (+10%), útil para desplegar un endpoint conversacional con varias sesiones concurrentes.
- Asistente con tool calling: 30/30 casos correctos en el conjunto de prueba, integrable en agentes que invocan APIs o funciones externas.
- Razonamiento matemático y resolución de problemas: 98,3% en GSM8K con respuestas acotadas a 2.048 tokens, apto para pipelines de verificación y tutoría automatizada.
- Generación de código asistida: mantiene un 92,98% de acuerdo de siguiente token con BF16 en prompts de coding, suficiente para autocompletado y revisión en entornos de desarrollo.
- Descripción y análisis de imágenes: al conservar la torre de visión en BF16, puede usarse en pipelines image-text-to-text (accesibilidad, moderación de contenido visual, extracción de información de capturas).
- Evaluación y comparación de builds cuantizadas: los scripts y recetas del autor (repositorio capyctl-recipes) permiten reproducir las mediciones de precisión y throughput, útil para equipos que eligen entre variantes FP8 y NVFP4.

## Benchmarks y rendimiento

Acuerdo de siguiente token codicioso con BF16 (200 prompts, 46.706 tokens de respuesta, vLLM 0.32.0):

| Build | Layout | Acuerdo con BF16 | Coding |
|---|---|---|---|
| BF16 (suelo del motor) | — | 99,54% | 99,51% |
| nvidia/Qwen3.8-27B-NVFP4 | Atención y DeltaNet en FP8 | 94,33% | 94,58% |
| RadixArk/Qwen3.8-27B-NVFP4 | Atención y DeltaNet en FP8 | 93,73% | 93,47% |
| Esta revisión | Todo NVFP4 | 93,00% | 92,98% |
| Primera revisión (4a47ea5e) | Todo NVFP4 | 92,63% | 92,29% |

Throughput en un NVIDIA GB10 (temperature 0, thinking on, 512 tokens de salida):

| Receta | Revisión | 1 stream | 8 streams | 32 streams | Memoria pico |
|---|---|---|---|---|---|
| vLLM 0.32.0 con DFlash2 | esta | 33,9 tok/s | 177 tok/s | 390 tok/s (KV cache 32 GiB, primera revisión) | 52,3 GiB |
| SGLang 0.5.22 con DFlash2 | primera | 36,3 tok/s | 166 tok/s | 329 tok/s | 58,1 GiB |

Comparación directa con nvidia/Qwen3.8-27B-NVFP4 (mismo motor y ajustes, primera revisión de este checkpoint):

| Configuración | Esta build | NVIDIA |
|---|---|---|
| vLLM 0.32.0 + DFlash2, 1 / 8 streams | 35,7 / 181 tok/s | 29,0 / 160 tok/s |
| SGLang 0.5.22 + DFlash2, 1 / 8 streams | 35,2 / 166 tok/s | 30,4 / 150 tok/s |
| SGLang 0.5.22 sin drafts, 1 / 8 streams | 14,9 / 101 tok/s | 12,5 / 85,9 tok/s |
| GSM8K (250 preguntas) | 98,3% | 98,4% |
| Tool calls (30 casos) | 30/30 | 30/30 |

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 18,77 GB en disco y lee 14,45 GB por token; en las pruebas se midió un pico de 52,3 GiB en vLLM y 58,1 GiB en SGLang sobre GB10, incluyendo KV cache y estado DeltaNet.
- GPU recomendadas: hardware con soporte de kernels NVFP4, como NVIDIA GB10 (única plataforma medida en la información disponible). No se documentan pruebas en A100, H100 ni RTX 4090.
- Consumer GPU: no disponible; no se confirma compatibilidad con GPUs de consumo.
- Opciones de despliegue: vLLM 0.32.0 con DFlash2 y SGLang 0.5.22 con DFlash2, mediante las recetas de CapyCTL 0.1.10. El checkpoint usa la librería transformers y safetensors.
- Latencia y throughput: 33,9 tok/s a un stream y 177 tok/s a 8 streams en vLLM; 31,3 y 162 tok/s respectivamente en SGLang con esta revisión. El KV cache no está cuantizado en el checkpoint; se recomienda FP8 si se necesita.

## Comparativa con modelos similares

| Modelo | Cuantización | Peso leído por token | Disco | Acuerdo con BF16 | Licencia |
|---|---|---|---|---|---|
| capyctl/Qwen3.8-27B-NVFP4 (esta) | NVFP4 en todo | 14,45 GB | 18,77 GB | 93,00% | Apache 2.0 |
| nvidia/Qwen3.8-27B-NVFP4 | NVFP4 + FP8 en atención/DeltaNet | 17,61 GB | 21,92 GB | 94,33% | no disponible en la información |
| RadixArk/Qwen3.8-27B-NVFP4 | NVFP4 + FP8 en atención/DeltaNet | no disponible | no disponible | 93,73% | no disponible en la información |
| Qwen/Qwen3.8-27B (BF16) | BF16 | no disponible | no disponible | 99,54% (suelo del motor) | no disponible en la información |

## Limitaciones y advertencias

- La cuantización NVFP4 introduce un error de pesos del 8,59% y reduce el acuerdo de siguiente token con BF16 al 93,00%, unos 1,3 puntos por debajo de la build de NVIDIA con atención y DeltaNet en FP8.
- El rendimiento depende del hardware: no hay datos de inferencia fuera de NVIDIA GB10; en otras GPUs la compatibilidad con kernels NVFP4 no está confirmada.
- El drafter DFlash2 acepta menos tokens por paso con esta revisión (3,24 frente a 3,28 en vLLM; 3,27 frente a 3,47 en SGLang a un stream), lo que puede afectar al throughput en configuraciones especulativas.
- En SGLang, esta revisión costó un 13% en un stream frente a la primera revisión, según la model card; la receta de SGLang mantiene la primera revisión por ese motivo.
- El KV cache no está cuantizado; sin KV cache FP8 el consumo de memoria en contextos largos puede ser elevado.
- No se documentan sesgos, idiomas soportados ni longitud de contexto en la información disponible; deben consultarse en la model card del modelo base.
- El número de parámetros reportado por safetensors (14,56B) no coincide con el "27B" del nombre comercial; conviene verificar el tamaño real del modelo base antes de dimensionar el despliegue.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/capyctl/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Repositorio CapyCTL: https://github.com/edurdias/capyctl
- Recetas y comparativas: https://github.com/edurdias/capyctl-recipes/tree/main/comparisons/qwen3.8-27b-nvfp4-builds-gb10
- Receta vLLM: https://github.com/edurdias/capyctl-recipes/tree/main/vllm/qwen3.8-27b-capyctl-nvfp4-gb10
- Receta SGLang: https://github.com/edurdias/capyctl-recipes/tree/main/sglang/qwen3.8-27b-capyctl-nvfp4-gb10
