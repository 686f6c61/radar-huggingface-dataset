# lovedheart/Hy4-flash-NVFP4

## Resumen

Hy4-flash-NVFP4 es un checkpoint cuantizado del modelo Hy4-flash de Tencent Hunyuan, un modelo multimodal de tipo MoE (mezcla de expertos) que acepta entradas de texto e imagen y genera texto. El modelo original cuenta con 220B parámetros totales (incluyendo 64B de parámetros Engram) y solo 12B parámetros activos por token, lo que lo posiciona como una opción eficiente en coste para despliegues a gran escala. Soporta una ventana de contexto de hasta 1M tokens y utiliza una arquitectura híbrida con 42 capas de backbone lingüístico (una densa y 41 MoE), conexiones Hyper-Connections (iHC) y un codificador visual adaptado de SigLIP2-So400m-Patch16-Res512.

Este checkpoint concreto, publicado por el usuario lovedheart, aplica cuantización NVFP4 (W4A16) a los expertos enrutados del MoE (41 capas × 512 matrices = 62.976 matrices) y FP6 e2m3 a las tablas Engram n-gram, manteniendo el resto de componentes en BF16. El objetivo es reducir el peso del modelo de ~141 GiB nominales a ~94 GiB reales, facilitando su despliegue en hardware con memoria limitada sin requerir hardware FP6 (el loader convierte losslessly a fp8-e4m3).

La relevancia de esta ficha radica en que permite evaluar un modelo de 220B parámetros con contexto de 1M tokens en un formato cuantizado de 4 bits, con métricas de error publicadas (SNR 21,22 dB, rel-L2 0,0869 en MoE; SQNR 32,3 dB en Engram) y compatibilidad con el stack de transformers y SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido multimodal con 42 capas (1 densa + 41 MoE), iHC, Engram n-gram tables, ViT SigLIP2-So400m-Patch16-Res512, drafter DFly2 de 5 capas |
| Parametros totales | 130.781.541.942 (según safetensors del repo cuantizado); el modelo original declara 220B incluyendo 64B Engram |
| Parametros activos | 12B por token |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 e2m1 W4A16 weight-only (4-over-6, grupo 16 en K) para expertos MoE; FP6 e2m3 con escala por fila para tablas Engram; BF16 para atención/DSA, expertos compartidos, router, capa densa L0, MTP/DFly draft, embed, lm_head, ViT y norms |
| Idiomas soportados | No disponible |
| Licencia | Tencent Hy License (tencent-hy-license) |
| Formato de pesos | Safetensors (153 archivos: 41 layer-experts, 42 layer-attn, 12 engram-embed, model-mtp/embed/lm_head/vit/globals, index/config/hf_quant_config) |

## Arquitectura y entrenamiento

El backbone lingüístico de Hy4-flash consta de 42 capas: una capa densa feed-forward y 41 capas MoE. Cada capa MoE contiene 512 expertos enrutados (gate/up/down), lo que totaliza 62.976 matrices de expertos. La información fluye entre capas mediante identity Hyper-Connections (iHC). El modelo incorpora tablas Engram n-gram en las capas 1, 11, 21 y 31 (~165M filas × 96), que actúan como memoria asociativa. Un codificador visual adaptado de SigLIP2-So400m-Patch16-Res512 se conecta al backbone mediante un proyector MLP. Además, incluye un drafter de 5 capas, DFly2 (0,85B parámetros), que reutiliza la caché KV y los índices sparse del modelo objetivo para decodificación especulativa de bajo coste constante en contexto largo.

El entrenamiento del modelo original no está detallado en la información proporcionada (no se especifican número de tokens, composición del dataset ni si hubo RLHF/DPO). La innovación técnica destacable de este checkpoint es la cuantización NVFP4 con esquema 4-over-6: escala por bloque de 16 en K en fp8-e4m3 (con multiplicadores M6/M4 de 1,0/1,5 y selección por MSE por bloque) y escala por tensor en fp32 (`weight_scale_2`). Los expertos gate y up comparten un amax global por tensor sobre los 512 expertos, mientras que down usa amax por experto. El error medido frente al BF16 original es SNR 21,22 dB, rel-L2 0,0869, coseno 0,9962 y KL ~7e-3. Las tablas Engram se cuantizan a FP6 e2m3 con escala fp32 por fila (SQNR 32,3 dB, rel-L2 2,42%, ~2,0% de filas a cero), y el loader las convierte losslessly a fp8-e4m3, por lo que no se necesita hardware FP6.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de texto e imagen (pipeline image-text-to-text) y genera texto.
- Procesamiento de contexto largo: ventana de hasta 1M tokens, adecuada para documentos extensos, código de repositorios completos o conversaciones multi-turno prolongadas.
- Decodificación especulativa: el drafter DFly2 (0,85B) permite acelerar la generación reutilizando la caché KV del modelo objetivo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales: tablas Engram n-gram como memoria asociativa; modo instruct (tag `instruct`); cuantización híbrida auto-detectada sin flag `--quantization`.

## Casos de uso

- Análisis de documentos extensos: gracias a su ventana de 1M tokens, el modelo puede ingerir informes anuales, expedientes legales o libros completos en una sola pasada y responder preguntas sobre ellos sin fragmentación.
- Asistencia multimodal en atención al cliente: al aceptar imágenes y texto, puede procesar capturas de pantalla, facturas o fotografías de productos junto con la consulta del usuario en conversaciones multi-turno.
- Generación de código en repositorios grandes: con contexto de 1M tokens puede cargar múltiples archivos de un proyecto y generar parches o explicaciones coherentes entre módulos.
- Despliegue en hardware con memoria limitada: la cuantización NVFP4 reduce el peso a ~94 GiB reales, permitiendo servir un modelo de 220B en nodos con 4 GPUs SM120 mediante `--tp 4` y el backend `sm12x_nvfp4_bf16`.
- Investigación sobre cuantización: los CSV de error por capa y por matriz (`layer-XXXXX-experts_error.csv`, `nvfp4_hy4_all_layers_error.csv`) permiten estudiar el impacto de NVFP4 en modelos MoE de gran escala.
- Procesamiento por lotes de imágenes y texto: pipelines de moderación de contenido o catalogación de productos que combinan descripciones textuales con imágenes.
- Evaluación comparativa de decodificación especulativa: el drafter DFly2 permite medir ganancias de throughput en contexto largo con coste constante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos numéricos publicados son métricas de error de cuantización frente al modelo BF16 original:

| Componente | Metrica | Valor |
|---|---|---|
| Expertos MoE (41 capas × 512) | SNR | 21,22 dB |
| Expertos MoE (41 capas × 512) | rel-L2 | 0,0869 |
| Expertos MoE (41 capas × 512) | Coseno | 0,9962 |
| Expertos MoE (41 capas × 512) | KL | ~7e-3 |
| Tablas Engram (capas 1/11/21/31) | SQNR | 32,3 dB |
| Tablas Engram (capas 1/11/21/31) | rel-L2 | 2,42% |
| Tablas Engram (capas 1/11/21/31) | Filas a cero | ~2,0% |

## Requisitos de hardware

- VRAM estimada: ~94 GiB reales para el checkpoint completo (141 GiB nominales; los 12 archivos Engram son symlinks a `/media/lovedheart/models/Hy4-flash-FP3`, por lo que ese directorio debe estar montado o ejecutar `copy_hy4_nvfp4_rest.py` para materializarlos).
- GPU recomendadas: el autor documenta lanzamiento en SM120 con `--tp 4` y el backend `sm12x_nvfp4_bf16`; no se especifican modelos concretos de GPU más allá de la arquitectura SM120.
- Cabe en consumer GPU: no disponible en la información proporcionada; por el tamaño (~94 GiB) no cabe en una GPU de consumo individual.
- Opciones de despliegue: transformers (librería declarada), SGLang (comando documentado con `--tp 4 --language-model-only --moe-runner-backend sm12x_nvfp4_bf16`, opciones `--hy4-engram-offload`, `--kv-cache-dtype fp8_e4m3`, `--speculative-algorithm DFLY` en la rama `feat/hy4-integration`). El modelo original referencia vLLM y GGUF, pero no se confirma compatibilidad de este checkpoint NVFP4 con ellos.
- Latencia y throughput: no disponibles en la información proporcionada. El drafter DFly2 está diseñado para decodificación especulativa de coste constante en contexto largo.
- Advertencia de despliegue: el runner `sm12x_nvfp4_bf16` ignora `swiglu_limit=10` (requiere cablear el clamp) y debe mantenerse desactivado `SGLANG_SM12X_W4A4_PREFILL_MIN_TOKENS` (la rama W4A4 tampoco aplica el clamp).

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-NVFP4 (este) | 130,78B (safetensors) / 220B declarados | 12B | 1M | Tencent Hy License | Hugging Face (repo de terceros) |
| Hy4-flash (original BF16) | 220B (incl. 64B Engram) | 12B | 1M | Tencent Hy License | Hugging Face (tencent/Hy4-flash), ModelScope, GitCode |
| Hy4-flash-FP3 | No disponible | 12B | 1M | Tencent Hy License | Referenciado como origen de los symlinks Engram |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Repo de terceros: el checkpoint lo publica el usuario lovedheart, no Tencent; no es una versión oficial y no cuenta con validación del equipo original.
- Dependencia de symlinks: 12 archivos Engram apuntan a `/media/lovedheart/models/Hy4-flash-FP3`; si ese directorio no está montado, el modelo no carga correctamente salvo que se materialicen los archivos con `copy_hy4_nvfp4_rest.py`.
- Pérdida por cuantización: los expertos MoE presentan rel-L2 de 0,0869 y SNR de 21,22 dB frente a BF16; las tablas Engram tienen un 2,0% de filas a cero y rel-L2 del 2,42%. El impacto en tareas downstream no está medido.
- Bug conocido en el runner: `sm12x_nvfp4_bf16` ignora `swiglu_limit=10`, lo que puede alterar el comportamiento respecto al modelo original; además `SGLANG_SM12X_W4A4_PREFILL_MIN_TOKENS` debe permanecer desactivado.
- Licencia: Tencent Hy License, con posibles restricciones para uso comercial; debe revisarse el enlace de licencia antes de desplegar en producción.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Sesgos y alucinación: no hay información publicada sobre sesgos conocidos ni tasas de alucinación para este modelo.
- Sin benchmarks de tareas: no se han publicado resultados de MMLU, HumanEval, GSM8K u otros, lo que impide evaluar su calidad frente a alternativas.
- Requiere hardware SM120 y 4 GPUs para el comando de despliegue documentado; no se confirma funcionamiento en otras configuraciones.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/lovedheart/Hy4-flash-NVFP4
- Hugging Face (modelo original): https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- README en chino: https://huggingface.co/tencent/Hy4-flash/blob/main/README_CN.md
- Web oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- GGUF: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
