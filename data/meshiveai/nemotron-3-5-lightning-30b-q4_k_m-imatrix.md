# MESHIVEAI/Nemotron-3.5-Lightning-30B-Q4_K_M-Imatrix

## Resumen

El modelo MESHIVEAI/Nemotron-3.5-Lightning-30B-Q4_K_M-Imatrix es una cuantización GGUF en formato Q4_K_M del modelo NVIDIA Nemotron 3.5 Lightning 30B A3B, realizada por MESHIVEAI. Se trata de un modelo de lenguaje de propósito general con arquitectura Mixture of Experts (MoE): 30.000 millones de parámetros totales, de los cuales solo 3.000 millones se activan por token, lo que permite una inferencia rápida y eficiente en recursos. La ventana de contexto entrenada es de 32.768 tokens.

La cuantización utiliza una importance matrix (imatrix) calculada sobre los pesos BF16 originales, una técnica especialmente relevante en modelos MoE, donde la pérdida de precisión en los pesos de enrutamiento puede degradar gravemente la calidad. Según la model card, 141 de 417 tensores requirieron cuantización de respaldo (Q5_0, Q8_0 o F32) para evitar pérdidas. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para su uso con llama.cpp.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nemotron MoE (Mixture of Experts) |
| Parametros totales | 30B (32.913.266.240 parámetros) |
| Parametros activos | 3B (por token) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (imatrix), con fallbacks a Q5_0, Q8_0 y F32 en 141 tensores |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con Mixture of Experts (MoE), donde solo una fracción de los parámetros (3B) se activa en cada token, lo que reduce el coste computacional frente a un modelo denso del mismo tamaño total. El modelo base fue desarrollado por NVIDIA y entrenado con una ventana de contexto de 32.768 tokens. La información proporcionada no incluye detalles sobre el dataset de entrenamiento ni sobre procesos de alineación como RLHF o DPO.

La innovación principal de esta versión es la cuantización con imatrix: se calculó una matriz de importancia sobre los pesos BF16 originales para asignar mayor precisión a los tensores críticos. En un modelo MoE, esto es especialmente importante porque los pesos de enrutamiento entre expertos son sensibles a la cuantización. El resultado es un GGUF Q4_K_M que preserva la calidad mediante fallbacks selectivos, aunque no se han publicado métricas cuantitativas que lo confirmen.

## Capacidades

- Generación de texto y chat: modelo de propósito general para razonamiento y conversación, según la documentación de NVIDIA.
- Razonamiento: adecuado para tareas de lógica y análisis, aunque no se especifican benchmarks.
- Generación de código: el modelo base está diseñado para lenguajes de programación, según NVIDIA.
- Multilingüe limitado: la versión cuantizada declara soporte para inglés y coreano. El modelo base también soporta español, francés, alemán, italiano y japonés, según la documentación de NVIDIA.
- No se ha documentado soporte de tool calling, visión ni audio en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 32.768 tokens, lo que permite mantener el historial completo de una interacción.
- Generación de código en entornos de desarrollo: al soportar lenguajes de programación, puede integrarse en IDEs o pipelines de revisión de código para asistir en la escritura y refactorización.
- Análisis de documentos extensos: procesa informes, contratos o actas de hasta 32.768 tokens sin perder información relevante, útil en sectores legal o financiero.
- Razonamiento en tareas de análisis: puede sintetizar información compleja y apoyar la toma de decisiones en entornos de consultoría o investigación.
- Despliegue en infraestructura con GPU limitada: al activar solo 3B parámetros por token, ofrece baja latencia en GPUs de 32 GB, lo que lo hace viable para aplicaciones en tiempo real.
- Asistencia bilingüe inglés-coreano: dado su entrenamiento en ambos idiomas, puede utilizarse en tareas de traducción o en aplicaciones de soporte para usuarios coreanos e ingleses.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye tablas de métricas de calidad (KL divergence, perplexity) y velocidad (prefill, generation) con valores pendientes de medición (TBD). No se dispone de datos numéricos que permitan comparar el rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada: ~25 GB para 4.096 tokens de contexto, ~28 GB para 16.384 tokens y ~31 GB para 32.768 tokens, según la model card.
- GPU recomendadas: 32 GB o superior (RTX 4090, A100 40GB, RTX PRO 6000 Blackwell). La medición de velocidad se realizó en una RTX PRO 6000 Blackwell Workstation Edition de 96 GB.
- No cabe de forma práctica en GPUs de 24 GB: la model card indica que 24 GB de VRAM es justo suficiente para 0 tokens de contexto.
- Despliegue: llama.cpp con soporte para la arquitectura Nemotron MoE. Se recomienda usar `--cache-type-k q8_0 --cache-type-v q8_0` para reducir los requisitos de KV cache.
- Latencia y throughput: no disponibles (TBD en la model card).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| MESHIVEAI/Nemotron-3.5-Lightning-30B-Q4_K_M-Imatrix | 30B (3B activos) | 32.768 | Apache 2.0 | GGUF Q4_K_M |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B (3B activos) | 32.768 | Apache 2.0 | Safetensors BF16 |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 | 30B (3B activos) | 32.768 | Apache 2.0 | NVFP4 |

No se dispone de datos de rendimiento comparativos entre estas versiones.

## Limitaciones y advertencias

- La cuantización Q4_K_M puede degradar la calidad del modelo; el uso de imatrix mitiga el riesgo, pero no hay métricas publicadas que lo confirmen.
- Idiomas soportados limitados a inglés y coreano en esta versión cuantizada, a pesar de que el modelo base soporta más idiomas.
- Riesgo de alucinación no evaluado; se recomienda validar las salidas en entornos de producción.
- Requiere 32 GB de VRAM para aprovechar la ventana completa de contexto, lo que excluye GPUs de consumo con 24 GB o menos.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la documentación del modelo base para confirmar restricciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/MESHIVEAI/Nemotron-3.5-Lightning-30B-Q4_K_M-Imatrix
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Versión NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
