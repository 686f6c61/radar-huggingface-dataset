# gittensor-model-hub/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una cuantización post-entrenamiento del modelo multimodal Qwen3.8-27B de Alibaba, realizada por el hub comunitario gittensor-model-hub. El checkpoint está optimizado específicamente para las GPUs NVIDIA Blackwell (RTX 50-series, RTX PRO 6000, B200/B300) mediante el formato NVFP4 (W4A4) y la herramienta NVIDIA Model Optimizer. El objetivo es reducir el tamaño del modelo de aproximadamente 53 GB en BF16 a unos 20 GB, manteniendo la mayor parte de las capacidades del original, con una ventana de contexto de 32 768 tokens.

La relevancia de este modelo radica en que permite ejecutar un modelo de 27 000 millones de parámetros con capacidades de razonamiento, tool calling y visión en hardware consumer de última generación (como la RTX 5090) sin sacrificar demasiada precisión. Al estar basado en Qwen3.8, hereda la arquitectura híbrida con Gated-DeltaNet y multi-token prediction, así como el soporte para razonamiento explícito y llamadas a herramientas. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (transformer con Gated-DeltaNet, vision tower, MTP) basada en Qwen3.8-27B |
| Parametros totales | 15 193 246 960 (según safetensors; el modelo base Qwen3.8-27B tiene 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens (según configuración de vLLM) |
| Tipos de cuantizacion | NVFP4 (W4A4, group size 16), KV cache en FP8 |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta múltiples idiomas, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cuantización NVFP4) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del checkpoint Qwen/Qwen3.8-27B, no un entrenamiento desde cero. El modelo base emplea una arquitectura híbrida que combina atención tradicional con capas Gated-DeltaNet (una variante de atención lineal eficiente) y un módulo de multi-token prediction (MTP) para acelerar la generación. Incluye además un vision tower para procesamiento de imágenes, lo que lo convierte en un modelo multimodal (image-text-to-text).

La cuantización se realizó con NVIDIA Model Optimizer (versión git c4129b6) utilizando calibración con 128 muestras de imagen-texto. Los pesos y activaciones se cuantizan a NVFP4 con group size 16, mientras que la caché KV se mantiene en FP8. Ciertas partes del modelo se dejan en BF16 para preservar la precisión: el vision tower, la capa lm_head, los embeddings, el módulo MTP y las capas conv1d/in_proj_a/in_proj_b de Gated-DeltaNet. El tamaño final exportado es de aproximadamente 20 GB.

## Capacidades

- Generación de texto y razonamiento: soporta el parser de razonamiento `qwen3` en vLLM, lo que indica capacidad de razonamiento explícito (thinking mode).
- Tool calling / function calling: compatible con el parser `qwen3_coder` y la opción `--enable-auto-tool-choice`, permitiendo integración con herramientas externas.
- Multimodal: al ser image-text-to-text, puede procesar imágenes junto con texto (aunque la model card no detalla las capacidades exactas de visión).
- Multilingüe: probablemente hereda el soporte multilingüe del modelo base, aunque no se especifica en la documentación.
- Eficiencia en hardware Blackwell: optimizado para ejecución en GPUs con tensor cores NVFP4, reduciendo el uso de memoria y mejorando el throughput.

## Casos de uso

- Despliegue de un asistente multimodal en una RTX 5090: con 20 GB de pesos, el modelo cabe en una GPU de 32 GB, permitiendo ejecutar un asistente que combina visión y razonamiento en entornos de escritorio o estaciones de trabajo.
- Agentes autónomos con tool calling: gracias al soporte de `qwen3_coder` y auto-tool-choice, se puede integrar en pipelines de agentes que necesitan llamar a APIs, ejecutar código o consultar bases de datos, todo con razonamiento multi-paso.
- Inferencia de alto rendimiento en servidores con B200/B300: la cuantización NVFP4 aprovecha los tensor cores de Blackwell para servir el modelo a múltiples usuarios con baja latencia, usando vLLM o SGLang.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o fotografías junto con texto para tareas de extracción de información o resumen.
- Generación de código asistida por visión: el parser `qwen3_coder` sugiere que el modelo es adecuado para tareas de programación, pudiendo interpretar mockups o diagramas y generar código correspondiente.
- Investigación en eficiencia de modelos: sirve como referencia para estudiar el impacto de la cuantización NVFP4 en modelos multimodales grandes, comparando con el checkpoint BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al menos 24 GB para cargar los 20.6 GB de pesos (con overhead de runtime). Se recomienda 32 GB para operar con comodidad.
- GPUs compatibles: exclusivamente NVIDIA Blackwell (RTX 5090, RTX 5080, RTX PRO 6000 Blackwell, B200, B300). No funciona en Hopper, Ada o Ampere.
- GPU consumer: cabe en una RTX 5090 (32 GB) o RTX 5080 (16 GB no es suficiente). También en RTX PRO 6000 Blackwell (96 GB).
- Opciones de despliegue: vLLM (versión 0.24+ o 0.27.x recomendada) con `--quantization modelopt` y `--kv-cache-dtype fp8`; SGLang con `--quantization modelopt_fp4`.
- Latencia y throughput: no disponibles, pero se espera que la cuantización NVFP4 ofrezca mejor throughput que BF16 en hardware Blackwell gracias a los tensor cores dedicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Hardware | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 32K | BF16 | Cualquier GPU moderna | Apache 2.0 |
| Qwen3.8-27B-NVFP4 (este) | 27B (15.2B en safetensors) | 32K | NVFP4 W4A4 | Solo Blackwell | Apache 2.0 |
| Otras cuantizaciones (AWQ/GPTQ) | 27B | 32K | 4-bit | Ampere/Ada/Hopper | Depende del proveedor |

No se dispone de datos de rendimiento comparativo entre estas opciones.

## Limitaciones y advertencias

- Exclusivo para Blackwell: el checkpoint no puede ejecutarse en GPUs Hopper, Ada o Ampere, aunque los archivos se carguen, los tensor cores NVFP4 no están disponibles.
- Posible degradación de precisión: la cuantización W4A4 puede afectar ligeramente la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código, en comparación con el modelo BF16.
- Sin benchmarks publicados: no hay métricas objetivas que validen el rendimiento de esta cuantización frente al modelo original.
- Información limitada sobre idiomas y sesgos: la model card no detalla los idiomas soportados ni posibles sesgos, por lo que se recomienda evaluar el modelo en el dominio de uso antes de producción.
- Dependencia de versiones específicas: requiere vLLM 0.24+ o SGLang con soporte para `modelopt_fp4`, lo que puede limitar la compatibilidad con entornos existentes.
- Calibración con pocos datos: la calibración se realizó con solo 128 muestras de imagen-texto, lo que podría no representar la diversidad de casos reales y afectar la calidad de la cuantización en ciertos dominios.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-NVFP4)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [NVIDIA Model Optimizer](https://github.com/NVIDIA/Model-Optimizer)
