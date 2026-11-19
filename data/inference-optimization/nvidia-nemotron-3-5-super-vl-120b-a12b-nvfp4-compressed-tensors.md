# inference-optimization/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-compressed-tensors

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-compressed-tensors es una conversión de formato del checkpoint NVFP4 original de NVIDIA, publicada por el usuario `inference-optimization`. No se trata de un modelo nuevo ni de una re-cuantización: el checkpoint de origen (`nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4`) se ha reempaquetado del formato ModelOpt al formato `compressed-tensors`, de modo que cualquier runtime compatible (principalmente vLLM) pueda cargarlo sin depender de ModelOpt. La conversión es numéricamente equivalente al original.

El modelo subyacente es Nemotron 3.5 Super VL, un modelo visión-lenguaje de NVIDIA orientado a razonamiento, generación de código, uso de herramientas, comprensión de documentos y comprensión de vídeo. Combina capas intercaladas de Mamba-2, mezcla de expertos (MoE) y atención, junto con un codificador visual C-RADIO y un conector visión-lenguaje. Declara 120B parámetros totales y 12B activos, con contexto de hasta 1M tokens y Multi-Token Prediction (MTP) para decodificación especulativa nativa.

La relevancia de esta ficha concreta es de despliegue: al estar en formato `compressed-tensors`, permite servir la cuantización NVFP4 W4A4 en vLLM sobre GPUs Blackwell de forma nativa o sobre Hopper mediante los kernels FP4 Marlin, reduciendo el peso del repositorio a unos 70 GB en 88 shards de safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h_omni` (híbrida: Mamba-2 + MoE + atención, con codificador visual C-RADIO y conector visión-lenguaje) |
| Parametros totales | 123.044.109.834 (según safetensors) |
| Parametros activos | 12B (denominación A12B del modelo) |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (4-bit float, grupo 16) en pesos y activaciones para 42.066 módulos; FP8 E4M3 W8A8 en 113 módulos (proyecciones `in_proj`/`out_proj` del mixer Mamba-2); KV cache FP8 E4M3 por tensor estático; resto de tensores en BF16 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (88 shards, 169.505 tensores, ~70 GB), formato `compressed-tensors` (`mixed-precision`, `quantization_status: compressed`) |

## Arquitectura y entrenamiento

La arquitectura es híbrida e intercala capas de Mamba-2, capas de mezcla de expertos y capas de atención, según describe la model card del modelo de origen. El componente visual es un codificador C-RADIO conectado mediante un conector visión-lenguaje, lo que habilita entrada de imagen y vídeo además de texto. El modelo incorpora Multi-Token Prediction (MTP), lo que permite decodificación especulativa nativa sin un modelo borrador externo. La implementación es de código personalizado (`NemotronH_Omni_Reasoning_V3`), por lo que requiere `trust_remote_code=True` al cargarse con `transformers`.

Sobre el entrenamiento, la información disponible indica que la cuantización NVFP4 del checkpoint de origen se produjo mediante destilación con conciencia de cuantización (quantization-aware distillation) a partir del modelo BF16 (`nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`). No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO. La conversión a `compressed-tensors` que documenta esta ficha no altera la cuantización: se reescribió la configuración de ModelOpt (`hf_quant_config.json`) como `QuantizationConfig` de compressed-tensors, se tradujo la lista de exclusión a 172 patrones `re:` de ignorados, se renombraron los pesos NVFP4 a `weight_packed` (uint8, dos valores FP4 por byte), se mantuvieron las escalas de grupo en FP8 E4M3 con grupo 16 y se invirtieron las escalas globales (`1 / input_scale` → `input_global_scale`, `1 / weight_scale_2` → `weight_global_scale`).

## Capacidades

- Generación de texto y razonamiento multi-paso.
- Generación y comprensión de código.
- Comprensión de imágenes mediante el codificador C-RADIO.
- Comprensión de vídeo.
- Comprensión de documentos (document understanding).
- Uso de herramientas (tool use / function calling), según la descripción del modelo de origen.
- Contexto largo de hasta 1M tokens para conversaciones y documentos extensos.
- Capacidades multilingües en inglés, español, francés, alemán, italiano y japonés.
- Decodificación especulativa nativa mediante Multi-Token Prediction (MTP).
- Entrada multimodal de imagen, vídeo y texto (pipeline `image-text-to-text`).

## Casos de uso

- Análisis de documentos extensos: el contexto de hasta 1M tokens permite procesar contratos, informes o expedientes completos en una sola pasada, con salida de texto razonada y referencias al contenido.
- Automatización de atención al cliente multimodal: gestión de conversaciones multi-turno en las que el usuario adjunta capturas, fotos de producto o documentos, con respuesta en español, francés, alemán, italiano o japonés.
- Procesamiento de vídeo para extracción de información: resumen y respuesta a preguntas sobre contenido audiovisual, aprovechando la comprensión de vídeo del modelo.
- Asistentes de código con herramientas: integración en entornos de desarrollo mediante tool calling para consultar repositorios, ejecutar pruebas o generar parches, con razonamiento multi-paso.
- Digitalización y extracción de datos de documentos: lectura de facturas, formularios y tablas en imagen para poblar sistemas de gestión, usando el pipeline `image-text-to-text`.
- Despliegue en producción con vLLM: servicio mediante `vllm serve` sobre GPUs Blackwell (kernels NVFP4 nativos) o Hopper (kernels FP4 Marlin), sin necesidad de instalar ModelOpt.
- Evaluación e investigación de cuantización: al ser numéricamente equivalente al checkpoint NVFP4 de NVIDIA, sirve como referencia para comparar el comportamiento de compressed-tensors frente a ModelOpt en la misma cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint de origen incluye una gráfica de evaluación de precisión (`accuracy_plot.png`) y remite a la model card de NVIDIA para los detalles completos, pero no se proporcionan cifras numéricas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio de pesos ocupa aproximadamente 70 GB (75,1 GB de tamaño total del repo), por lo que se necesita al menos esa cifra de memoria para pesos, más la memoria de activaciones y KV cache.
- GPUs recomendadas: NVIDIA Blackwell para soporte nativo de kernels NVFP4 en vLLM; NVIDIA Hopper mediante los kernels FP4 Marlin. La página de NGC del NIM indica servicio con vLLM sobre Blackwell, Hopper y Ampere, si bien el soporte de NVFP4 en vLLM se describe explícitamente para Blackwell (nativo) y Hopper (Marlin).
- GPU de consumo: no disponible en la información proporcionada; el tamaño de pesos (~70 GB) excede la VRAM de las GPU de consumo habituales en una sola unidad.
- Opciones de despliegue: vLLM es el runtime previsto (`vllm serve inference-optimization/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-compressed-tensors`); también es cargable con `transformers` usando `trust_remote_code=True` y el paquete `compressed-tensors`. No se documentan opciones para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3.5-Super-VL-120B-A12B-NVFP4-compressed-tensors) | 120B totales / 12B activos | 1M tokens | NVFP4 + FP8 + BF16 mixta | OpenMDW-1.1 | safetensors compressed-tensors |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 (origen) | 120B totales / 12B activos | 1M tokens | NVFP4 (ModelOpt) | OpenMDW-1.1 | safetensors ModelOpt |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 | 120B totales / 12B activos | 1M tokens | BF16 | OpenMDW-1.1 | safetensors |

No se dispone de información sobre otros modelos comparables de la misma categoría (visión-lenguaje con MoE y contexto de 1M) en los datos proporcionados; los tres modelos listados son variantes del mismo modelo base y difieren únicamente en el formato y la precisión de la cuantización.

## Limitaciones y advertencias

- La información sobre sesgos conocidos no está incluida en los datos proporcionados; la documentación de uso de NVIDIA (`bias.md`, `privacy.md`, `safety.md`, `explainability.md`) se distribuye junto al modelo y debe consultarse.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos de este tipo.
- La cuantización NVFP4 W4A4 puede degradar la precisión frente al modelo BF16; la model card remite a la gráfica de precisión del modelo de origen, sin cifras detalladas en la información disponible.
- Requiere GPUs con soporte de kernels NVFP4 en vLLM (Blackwell nativo, Hopper vía FP4 Marlin); no es desplegable en hardware sin ese soporte.
- Es una arquitectura de código personalizado: con `transformers` exige `trust_remote_code=True` y el paquete `compressed-tensors`, lo que implica ejecutar código del repositorio.
- Licencia OpenMDW-1.1: es una licencia de tipo "other" con términos propios; debe revisarse en el enlace oficial antes de un uso comercial.
- Idiomas soportados limitados a en, es, fr, de, it, ja; el rendimiento fuera de esos idiomas no está documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/inference-optimization/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-compressed-tensors
- Modelo de origen (NVFP4): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Modelo BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-super-vl-120b-a12b/modelcard
- Contenedor NIM en NGC: https://catalog.ngc.nvidia.com/orgs/nim/nvidia/containers/nemotron-3.5-super-vl-120b-a12b/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Repositorio compressed-tensors: https://github.com/vllm-project/compressed-tensors
- Documentación de vLLM: https://docs.vllm.ai
