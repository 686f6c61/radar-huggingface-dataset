# Ar4ikov/Inkling-2-Mini-AWQ-W4A16-ASYM-INT4

## Resumen

Inkling-2-Mini-AWQ-W4A16-ASYM-INT4 es una cuantizacion de 4 bits del modelo multimodal thinkingmachines/Inkling-2-Mini, desarrollada por el usuario Ar4ikov y publicada bajo licencia Apache 2.0. El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) "looped", es decir, con capas que se reutilizan varias veces por token, capaz de procesar texto e imagenes como entrada y generar texto. Cuenta con 26.388.641.280 parametros totales, de los cuales unos 3.400 millones estan activos por token segun la model card.

La relevancia de esta version concreta es practica: el checkpoint original distribuye sus expertos en formatos NVFP4 y MXFP8, que solo se ejecutan de forma nativa en GPUs Hopper y Blackwell. Esta cuantizacion reempaqueta esos expertos como INT4 con cuantizacion asimetrica (W4A16, group size 128) en formato compressed-tensors, lo que permite usar kernels rapidos en GPUs Ampere y Ada (RTX 30xx/40xx, A100, L40). El repositorio ocupa 17,3 GB, frente a los 20,2 GB del original y a unos 53 GB de un equivalente en BF16.

El estado de ejecucion es un punto critico en noviembre de 2026: vLLM aun no carga este formato sin dos pull requests abiertos, y transformers funciona mediante otro PR y un loader auxiliar incluido en el repositorio, aunque descomprime a BF16 en carga y por tanto no ahorra VRAM en ese camino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas repetidas (looped transformer), multimodal (texto + imagen) |
| Parametros totales | 26.388.641.280 (~26,4B) |
| Parametros activos | ~3,4B (segun model card del autor de la cuantizacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 W4A16 asimetrica, group size 128, formato pack-quantized de compressed-tensors |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors / pack-quantized, INT4 empaquetado en int32) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo MoE con una innovacion estructural: capas "looped" o repetidas. Segun la model card de la cuantizacion, las capas 6 a 17 se ejecutan tres veces por token compartiendo pesos, y el modelo cuenta con 24 capas con 128 expertos cada una. Los expertos usan una activacion SwiGLU con softcaps de tipo tanh en las proyecciones gate y up. El checkpoint incluye ademas una torre de vision (mantenida en BF16), un router, embeddings, lm_head y una cabeza MTP/DSpark de decodificacion especulativa (0,6 GB, tambien en BF16).

No hay publicacion BF16 del modelo original. Los expertos de esta cuantizacion se obtuvieron descomprimiendo el checkpoint oficial NVFP4/MXFP8 a BF16 y recuantizando despues a INT4, de modo que la perdida de precision se acumula sobre la ya introducida por NVFP4. El proceso de cuantizacion AWQ se adapto especificamente a esta arquitectura: se linealizaron los 128 expertos (9216 capas Linear, 24,4B parametros cuantizados), se aplico suavizado solo en el par post_attention_layernorm hacia gate/up_proj y el router, se excluyo el par up_proj hacia down_proj por el softcap tanh intermedio, y se difirio el calculo de estadisticas al tercer pase de las capas repetidas para cubrir las tres pasadas. La calibracion uso 64 muestras de hasta 1024 tokens de HuggingFaceH4/ultrachat_200k (48) e ise-uiuc/Magicoder-Evol-Instruct-110K (16). No se dispone de informacion sobre el volumen de datos de entrenamiento original ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Entrada multimodal: procesa imagenes junto con texto (pipeline image-text-to-text).
- Razonamiento y generacion de codigo, incluyendo prompts de programacion en ingles y ruso segun los ejemplos de evaluacion del repositorio.
- Capacidades multilingues (etiquetas en y multilingual).
- Decodificacion especulativa mediante la cabeza MTP/DSpark incluida en el repositorio.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue multimodal en GPUs Ampere o Ada: al almacenar los expertos en INT4, el modelo puede ejecutarse en hardware como 2x RTX 3090 con tensor parallelism 2, algo inviable con el checkpoint original NVFP4/MXFP8 en esas GPUs. Encaja en prototipos de asistentes que reciben imagenes y texto.
- Atencion al cliente con entrada de imagenes: el pipeline image-text-to-text permite gestionar conversaciones donde el usuario adjunta capturas o fotos, manteniendo el contexto conversacional del modelo base.
- Generacion de codigo asistida: los ejemplos de evaluacion del repositorio incluyen prompts de programacion en ruso e ingles, lo que respalda su uso en asistentes de codigo para equipos multilingues.
- Investigacion sobre cuantizacion: el repositorio documenta en detalle la receta AWQ adaptada a MoE con capas repetidas, lo que lo convierte en material de referencia para estudiar cuantizacion de arquitecturas no estandar.
- Evaluacion de modelos MoE looped: sirve para experimentar con arquitecturas de capas compartidas en entornos con VRAM limitada, comparando su comportamiento frente a transformers convencionales.
- Despliegue en servidores con A100 o L40: el formato INT4 g128 dispone de kernels rapidos en estas GPUs, lo que permite servir el modelo con menor huella de memoria que el checkpoint original.
- Pruebas de decodificacion especulativa: la cabeza MTP/DSpark en BF16 incluida en el repositorio permite evaluar tecnicas de speculative decoding sobre un modelo cuantizado.

## Benchmarks y rendimiento

Los datos disponibles corresponden a mediciones de calidad de la cuantizacion, no a benchmarks del modelo base frente a terceros. Se midieron en 2x RTX 3090 con ambos modelos ejecutados en transformers con codigo identico.

| Metrica | Original (NVFP4/MXFP8 a BF16) | Esta cuantizacion (INT4) |
|---|---|---|
| Perplejidad wikitext-2 (32.736 tokens, ventanas de 1024) | 7,441 | 7,496 (+0,75%) |
| Coincidencia top-1 con el original | — | 94,3% |
| gsm8k 5-shot strict-match (vLLM con PRs aplicados, TP2 en 2x RTX 3090) | no disponible | 0,816 |
| Perplejidad wikitext-2 en vLLM con PRs aplicados | no disponible | 7,499 |

La model card indica que los benchmarks del modelo base mostrados en el repositorio son cifras de los autores originales, no de esta cuantizacion, y no se reproducen aqui al no estar disponibles sus valores numericos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 17,3 GB en disco (incluida la cabeza MTP de 0,6 GB). En vLLM con los PRs aplicados se ejecuto en 2x RTX 3090 con tensor parallelism 2, lo que situa el requisito practico en torno a 24 GB por GPU en ese escenario.
- GPUs recomendadas: RTX 3090, RTX 4090, A100 y L40, que disponen de kernels rapidos para INT4 g128. Las GPUs Hopper y Blackwell pueden usar el checkpoint original NVFP4/MXFP8 sin esta conversion.
- Cabe en GPU de consumo: si, en RTX 3090 o RTX 4090, aunque la configuracion verificada usa dos unidades con TP2.
- Opciones de despliegue: vLLM solo con los PRs vllm-project/vllm#69141 y vllm-project/vllm#69165 aplicados; transformers con el PR huggingface/transformers#51050 y el loader inkling_w4a16.py del repositorio, sin ahorro de VRAM porque descomprime a BF16 en carga. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-AWQ-W4A16-ASYM-INT4 (esta ficha) | 26,4B totales / ~3,4B activos | no disponible | INT4 W4A16 asimetrica, compressed-tensors | apache-2.0 | Pensado para Ampere/Ada; vLLM aun requiere PRs |
| thinkingmachines/Inkling-2-Mini (original) | 26,4B totales / ~3,4B activos | no disponible | NVFP4 / MXFP8 | apache-2.0 | Solo ejecucion nativa en Hopper/Blackwell; 20,2 GB |
| Equivalente BF16 hipotetico del mismo modelo | 26,4B totales | no disponible | BF16 | apache-2.0 | No existe publicacion oficial; ~53 GB |
| Otros modelos de tamano y tarea similares | no disponible | no disponible | no disponible | no disponible | No se proporcionan alternativas comparables en la informacion disponible |

## Limitaciones y advertencias

- Perdida de precision acumulada: los expertos se recuantizaron a INT4 partiendo de un checkpoint ya degradado a NVFP4/MXFP8, por lo que la comparacion debe hacerse contra el original, no contra un BF16 inexistente. La perplejidad sube un 0,75% y la coincidencia top-1 es del 94,3%.
- Estado de ejecucion incompleto: en noviembre de 2026 vLLM no carga este formato sin dos PRs abiertos, y transformers requiere otro PR mas un loader auxiliar. En transformers no hay ahorro de VRAM porque se descomprime a BF16.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no se documenta de forma especifica; aplican los riesgos habituales de los modelos generativos.
- Limitaciones de contexto e idioma: la longitud de contexto no esta disponible y los idiomas declarados son en y multilingual, sin detalle de cobertura.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini.
- Dependencia de hardware: los kernels rapidos INT4 g128 estan pensados para Ampere y Ada; en otras arquitecturas el rendimiento puede degradarse.
- Madurez del ecosistema: al depender de PRs no fusionados, la ruta de produccion con vLLM no es estable todavia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ar4ikov/Inkling-2-Mini-AWQ-W4A16-ASYM-INT4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- llm-compressor: https://github.com/vllm-project/llm-compressor
- PR de vLLM para expertos enrutados en compressed-tensors: https://github.com/vllm-project/vllm/pull/69141
- PR de vLLM para ejecucion en Ampere/Ada (SM80/86/89): https://github.com/vllm-project/vllm/pull/69165
- PR de transformers para soporte de Inkling 2: https://github.com/huggingface/transformers/pull/51050
