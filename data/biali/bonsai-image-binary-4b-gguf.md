# biali/bonsai-image-binary-4B-GGUF

## Resumen

Bonsai-Image 4B (binary) es un modelo de generación de texto a imagen basado en la arquitectura Flux, convertido y cuantizado de forma extrema por el usuario biali para su uso con el runtime sd.cpp. El modelo original, `prism-ml/bonsai-image-binary-4B-unpacked`, se ha transformado desde el formato diffusers a GGUF, aplicando una cuantización selectiva de los tensores de atención y MLP a 1 bit (q1_0) y de los tensores de modulación a 8 bits (q8_0), manteniendo el resto en bf16. El resultado es un archivo de pesos muy compacto que permite ejecutar el modelo en hardware modesto, incluso con descarga a CPU.

La relevancia de este modelo radica en su enfoque de compresión agresiva para modelos de difusión, similar a lo que se hace con los LLM cuantizados. Al reducir drásticamente el tamaño de los pesos, se facilita la inferencia en GPUs de gama media o incluso en CPU, a costa de una posible pérdida de calidad en las imágenes generadas. El autor indica que debe usarse de forma similar a Flux2 Klein 4B (distilled), con pocos pasos de muestreo y sin clasificador de guía (CFG).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión tipo Flux (bloques single y double, atención, MLP) |
| Parametros totales | 3.875.544.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen) |
| Tipos de cuantizacion | q1_0 (tensores de atención y MLP), q8_0 (tensores de modulación), bf16 (resto) |
| Idiomas soportados | no disponible (no especificado; probablemente inglés, pero no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors original convertido) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de los modelos de difusión Flux, con una serie de bloques "single" y "double" que procesan conjuntamente las representaciones de texto e imagen. Cada bloque contiene atención multi-cabeza (con proyecciones qkv y proyección de salida) y MLP, tanto para la rama de imagen como para la de texto. La cuantización selectiva aplicada por el autor afecta precisamente a estos tensores, reduciéndolos a 1 bit (q1_0), mientras que los tensores de modulación (que controlan el escalado y desplazamiento de las características) se cuantizan a 8 bits (q8_0) en una segunda versión del archivo.

No se dispone de información sobre el entrenamiento del modelo base (prism-ml/bonsai-image-binary-4B-unpacked), como el número de tokens, la composición del dataset o si se utilizó RLHF o DPO. La innovación principal de esta conversión es la cuantización extrema de los pesos de atención y MLP, que reduce significativamente el tamaño del archivo (el repositorio ocupa 18.1 GB, pero el archivo cuantizado principal es mucho menor, aunque no se indica su tamaño exacto). El proceso se realizó con la herramienta `sd-cli` de sd.cpp, aplicando reglas de tipo de tensor para seleccionar qué capas cuantizar.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image), con resolución configurable (el ejemplo usa 1024x1024).
- Soporte de muestreo con pocos pasos (6 pasos en el ejemplo), similar a modelos destilados como Flux2 Klein.
- Integración con el ecosistema sd.cpp, que permite ejecución en CPU y GPU con descarga de pesos a memoria principal.
- Compatibilidad con VAE de Flux2 (full_encoder_small_decoder) y técnicas de tiling para reducir el consumo de memoria.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe, ya que es un modelo puramente generativo de imágenes.

## Casos de uso

- Generación de imágenes en dispositivos con poca VRAM: gracias a la cuantización a 1 bit, el modelo puede ejecutarse en GPUs de gama media (por ejemplo, RTX 3060 con 8 GB) o incluso en CPU con descarga a memoria, permitiendo prototipado rápido sin hardware especializado.
- Integración en pipelines de generación de contenido: al ser un archivo GGUF, se puede cargar con sd.cpp en entornos de producción que ya usan este runtime, facilitando la automatización de generación de imágenes para blogs, redes sociales o material de marketing.
- Experimentación con cuantización extrema: sirve como caso de estudio para desarrolladores interesados en comprimir modelos de difusión, mostrando qué tensores son más sensibles a la cuantización (los de modulación se mantienen en q8_0 para preservar calidad).
- Generación de imágenes en entornos sin GPU: el comando de ejemplo incluye `--offload-to-cpu`, lo que permite ejecutar el modelo en máquinas con solo CPU, útil para servidores de bajo coste o entornos de desarrollo.
- Ajuste de hiperparámetros de muestreo: al ser un modelo destilado, se puede usar con pocos pasos (6) y CFG 1.0, reduciendo el tiempo de inferencia en aplicaciones que requieren alta velocidad, como generación en lote.
- Creación de demos interactivas: su tamaño reducido facilita su distribución y carga en aplicaciones web o de escritorio, permitiendo a usuarios finales probar la generación de imágenes sin necesidad de descargar modelos de varios gigabytes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos objetivos sobre calidad de imagen (FID, CLIP score, etc.) ni comparaciones con otros modelos. El autor solo muestra dos imágenes de ejemplo comparando la versión base (q1_0+bf16) con la versión con modulación cuantizada a q8_0, indicando una pérdida de calidad "despreciable", pero sin métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: no hay datos oficiales. Dado que el modelo tiene 3.87B parámetros y la mayoría están cuantizados a 1 bit, el tamaño del archivo GGUF principal podría estar en el rango de 1-2 GB (estimación razonable, no confirmada). Con la descarga a CPU, la VRAM necesaria puede ser inferior a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar el modelo con tiling y offload. Se ha probado con sd.cpp, que soporta CUDA, Metal y Vulkan.
- Compatibilidad con consumer GPU: sí, es probable que funcione en RTX 3060, RTX 4060, RX 6600, etc., gracias a la cuantización extrema.
- Opciones de despliegue: sd.cpp (sd-cli), que es el runtime recomendado por el autor. También podría usarse con llama.cpp si se adapta, pero no está documentado. No es compatible con vLLM ni TGI, orientados a LLM.
- Latencia y throughput: no disponibles. Dependen del hardware y del número de pasos (6 en el ejemplo). En una GPU moderna, se espera una generación de 1024x1024 en pocos segundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Bonsai-Image 4B (binary) | 3.87B | q1_0/q8_0/bf16 | no aplica | Apache 2.0 | GGUF |
| Flux.1-schnell | 12B | fp16/bf16 | no aplica | Apache 2.0 | safetensors |
| SDXL | 3.5B | fp16/bf16 | no aplica | OpenRAIL | safetensors |
| Flux2 Klein 4B (distilled) | 4B | no disponible | no aplica | no disponible | no disponible |

La comparativa se limita a tamaño y formato, ya que no hay benchmarks. Bonsai-Image 4B es significativamente más pequeño que Flux.1-schnell y similar a SDXL en parámetros, pero con una cuantización mucho más agresiva. El autor indica que se usa "como flux2 klein 4B (distilled)", lo que sugiere que comparte características de destilación, pero no hay datos para una comparación rigurosa.

## Limitaciones y advertencias

- La cuantización a 1 bit de los tensores de atención y MLP puede degradar la calidad de las imágenes, especialmente en detalles finos o texturas. El autor solo muestra dos ejemplos, por lo que el impacto real no está evaluado.
- No hay información sobre sesgos del modelo base. Al ser un modelo de difusión, puede reflejar sesgos presentes en los datos de entrenamiento, pero no se han documentado.
- Riesgo de alucinación: en generación de imágenes, esto se manifiesta como artefactos o incoherencias en objetos complejos, especialmente con cuantización extrema.
- Limitaciones de idioma: no se especifican los idiomas soportados para las indicaciones de texto. Es probable que funcione mejor en inglés, pero no está confirmado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base (prism-ml/bonsai-image-binary-4B-unpacked) podría tener condiciones adicionales no verificadas. Se recomienda revisar la licencia del modelo original.
- Esta es una conversión no oficial realizada por un tercero. No hay garantía de que el proceso de cuantización sea óptimo ni de que el modelo se comporte igual que el original en bf16.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un experimento reciente y poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/biali/bonsai-image-binary-4B-GGUF
- Modelo base: https://huggingface.co/prism-ml/bonsai-image-binary-4B-unpacked
- Herramienta sd.cpp (mencionada en la model card): no se proporciona enlace directo, pero se puede buscar como "sd.cpp" en GitHub.
