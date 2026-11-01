# davetha/launch80-swift15-qwen27b-unc-int4-fused-12l63

## Resumen

Launch80 Swift-1.5 Qwen3.8-27B Uncensored INT4 es un checkpoint cuantizado de precisión mixta publicado por el usuario davetha, derivado del modelo base swift-1-5/swift-1-5-qwen3-8-27b-uncensored (una variante sin censura de la familia Qwen3). El modelo combina una cuantización GPTQ INT4 para el cuerpo de la red con 13 "islas" de precisión elevada: 12 grupos de proyecciones qkv de atención completa seleccionados mediante captura de Hessian de activaciones, más la proyección o_proj de la capa 63, todos ellos fusionados en tensores BF16 únicos.

El problema que aborda es el compromiso entre huella de memoria y calidad en el despliegue de modelos de ~27.800 millones de parámetros. La promoción selectiva de capas a BF16 (y su conversión opcional a int8 en tiempo de carga con un kernel oneDNN W8A16) permite recuperar parte de la precisión perdida por la cuantización INT4 sin volver al modelo completo en BF16, reduciendo a la mitad la VRAM de las islas cuando se usa la ruta int8.

El checkpoint está pensado para servir en producción con vLLM 0.30 sobre stack XPU, decodificación especulativa DFlash2 (k=7) y caché KV en fp8 con una longitud máxima de contexto de 131.072 tokens. Su perfil de calidad prioriza el razonamiento (GSM8K) sobre el conocimiento factual (MMLU) respecto a su hermano sin fusionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3), con proyecciones qkv fusionadas en las capas 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59 y 63 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (configurado en el recipe de servicio con `--max-model-len 131072`) |
| Tipos de cuantizacion | GPTQ INT4 en el cuerpo; islas BF16 en disco (12 qkv + L63 o_proj); ruta opcional int8 por canal simétrico con kernel oneDNN W8A16 en carga |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 18,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de la familia Qwen3 con 27.800 millones de parámetros, del que no se detallan en la información disponible el número de capas total, la dimensión oculta ni la composición del dataset de entrenamiento original. El modelo base es swift-1-5/swift-1-5-qwen3-8-27b-uncensored, una variante sin censura, y no se especifican los detalles de su entrenamiento (número de tokens, mezcla de datos, si hubo RLHF o DPO).

La innovación técnica del checkpoint es el proceso de cuantización de precisión mixta: partiendo de un artefacto INT4 con la o_proj de la capa 63 en BF16, se seleccionaron 12 grupos de proyecciones qkv mediante captura del Hessian de activaciones y puntuación de error en espacio de activaciones sobre el objetivo INT4 en vivo. Esos grupos se fusionaron en tensores BF16 únicos (`language_model.model.layers.N.self_attn.qkv_proj.weight`) y se eliminaron los 144 tensores q/k/v INT4 huérfanos que la fusión reemplaza, de modo que los cargadores estándar no encuentren fragmentos obsoletos. El empaquetado incluye `modules_in_block_to_quantize`. Para el servicio, el autor propone sustituir las 13 islas BF16 por int8 simétrico por canal residente con un GEMM int8 nativo oneDNN (`int8_gemm_w8a16`, escalas por canal con group_size=K, verificado bit-exacto frente a la deconvolución BF16), lo que reduce a la mitad la VRAM de las islas.

## Capacidades

- Generación de texto y razonamiento de propósito general, con perfil orientado a tareas de razonamiento matemático (GSM8K) por encima del conocimiento factual (MMLU).
- Generación de código, evaluada con HumanEval en modo prefix-EM.
- Razonamiento matemático de varios pasos (GSM8K).
- Capacidades multilingües limitadas: la model card declara únicamente inglés (`language: en`).
- Compatibilidad con decodificación especulativa mediante el drafter DFlash2 (k=7) en el stack de servicio del autor.
- Soporte de tool calling, function calling y comportamiento agéntico: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Generación de código en producción: el modelo obtiene 28,33 puntos de prefix-EM en HumanEval-60 con la ruta int8, y su receta de servicio con decodificación especulativa alcanza ~139 tok/s en un solo stream, lo que lo hace apto para autocompletado y generación de parches en pipelines de CI/CD.
- Razonamiento matemático y resolución de problemas cuantitativos: con 95,67 en GSM8K-400 bajo la ruta int8, es adecuado para asistentes de cálculo, verificación de operaciones y tutoría de problemas de varios pasos.
- Servicio de chat de contexto largo: la ventana de 131.072 tokens configurada permite conversaciones multi-turno extensas, análisis de documentos largos o resumen de repositorios completos en una sola pasada.
- Evaluación comparativa de técnicas de cuantización: el checkpoint sirve como referencia reproducible para estudiar el efecto de islas de precisión mixta (BF16 frente a int8) sobre calidad y latencia en un mismo modelo base.
- Despliegue en GPUs de 32 GB: con las islas en int8 y caché KV en fp8, el checkpoint cabe en tarjetas de clase B70 de 32 GB, lo que permite servir un modelo de 27.800 millones de parámetros en hardware de gama profesional de una sola unidad.
- Investigación sobre modelos sin censura: al heredar el perfil del base uncensored, puede emplearse en estudios de robustez, red-teaming controlado y análisis de sesgos, siempre con las salvaguardas adecuadas.
- Prototipado de decodificación especulativa: la integración con el drafter DFlash2 (k=7) permite medir ganancias de throughput en stacks vLLM XPU.

## Benchmarks y rendimiento

Evaluación de precisión por tarea (3 semillas, temperatura 0), según la model card:

| Arm | GSM8K-400 | MMLU-500 | HumanEval-60 (prefix-EM) |
|---|---|---|---|
| INT4 + L63 BF16 (hermano base) | 90,33 | 81,20 | 24,44 |
| Este checkpoint, islas BF16 | 94,75 | 79,93 | 26,67 |
| Este checkpoint, islas int8 con kernel nativo | 95,67 | 80,40 | 28,33 |

Rendimiento de decodificación: ~139 tok/s en un solo stream en una tarjeta de clase B70 de 32 GB con decodificación especulativa, a paridad con la variante de islas BF16 en generación de código. Las islas int8 reducen a la mitad la VRAM de las islas frente a BF16.

## Requisitos de hardware

- VRAM estimada: el repo pesa 18,4 GB en safetensors (INT4 con islas BF16 en disco). Con las islas convertidas a int8 en carga, la huella de pesos baja respecto a la variante BF16, aunque el autor no publica una cifra exacta de VRAM total.
- GPU recomendadas: el autor reporta servicio en una tarjeta de clase B70 de 32 GB; el stack objetivo es vLLM 0.30 sobre XPU con vllm-xpu-kernels que incluya `int8_gemm_w8a16` (oneDNN W8A16).
- Cabe en GPU de consumo: no hay datos publicados sobre GPUs de consumo (RTX 4090, etc.); el único hardware citado es una tarjeta profesional de 32 GB.
- Opciones de despliegue: vLLM 0.30 (stack XPU) con decodificación especulativa DFlash2 (k=7), caché KV fp8 y `--max-model-len 131072`. Para cargar los tensores qkv BF16 fusionados en vLLM estándar ≤0.30 se requiere el parche vllm-project/vllm#63631.
- Latencia y throughput: ~139 tok/s en un solo stream con decodificación especulativa en la tarjeta citada. No se publican cifras de latencia ni de throughput agregado por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Launch80 INT4 + islas) | 27,78 B | 131.072 | GSM8K 95,67; MMLU 80,40; HumanEval 28,33 (ruta int8) | apache-2.0 | HuggingFace, 22 descargas |
| davetha/launch80-swift15-qwen27b-unc-int4-bodyp-bf16 (hermano base) | 27,78 B (implícito) | no disponible | GSM8K 90,33; MMLU 81,20; HumanEval 24,44 | apache-2.0 | HuggingFace |
| swift-1-5/swift-1-5-qwen3-8-27b-uncensored (modelo base) | 27 B (según nombre) | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks de otros modelos de la misma categoría (por ejemplo, Qwen3 de tamaño equivalente en BF16) en la información proporcionada, por lo que la comparación se limita a las variantes de la propia familia.

## Limitaciones y advertencias

- La promoción de los 12 grupos sacrifica ~0,8 puntos porcentuales de MMLU frente al hermano sin fusionar a cambio de +5 puntos en GSM8K: es un perfil deliberado de razonamiento frente a conocimiento, no una mejora estricta en todas las métricas.
- La ruta int8 de las islas exige el stack de kernels parcheado descrito (vLLM 0.30 XPU + vllm-xpu-kernels con `int8_gemm_w8a16`); sin él debe servirse con islas BF16, que el checkpoint carga igualmente.
- Cargar los tensores qkv BF16 fusionados en vLLM estándar ≤0.30 requiere el parche vllm-project/vllm#63631; sin él, los cargadores pueden fallar por los nombres de tensor en forma de árbol.
- Se aplican las limitaciones propias de los artefactos GPTQ INT4, incluida la pérdida de precisión inherente a la cuantización de 4 bits.
- El perfil de comportamiento hereda el del base uncensored, lo que implica riesgos de contenido inapropiado o dañino en producción sin filtros adicionales.
- El modelo declara únicamente inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información disponible.
- La licencia apache-2.0 permite uso comercial, pero el autor no detalla restricciones adicionales derivadas del modelo base; conviene verificar la licencia del base swift-1-5 antes de un despliegue comercial.
- El checkpoint tiene 22 descargas y 0 likes, con creación y actualización el mismo día (2026-10-27): es un artefacto muy reciente y con poca validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/davetha/launch80-swift15-qwen27b-unc-int4-fused-12l63
- Checkpoint predecesor: https://huggingface.co/davetha/launch80-swift15-qwen27b-unc-int4-bodyp-bf16
- Modelo base: https://huggingface.co/swift-1-5/swift-1-5-qwen3-8-27b-uncensored
- Parche del cargador de vLLM: https://github.com/vllm-project/vllm/pull/63631
