# gguf-org/mageflow-gguf

## Resumen

El modelo `gguf-org/mageflow-gguf` es una cuantización en formato GGUF del modelo `microsoft/Mage-Flow`, concretamente de la variante `edit-turbo` diseñada para edición de imágenes mediante instrucciones en lenguaje natural. Publicado por la organización `gguf-org`, este modelo permite transformar imágenes de entrada (por ejemplo, cambiar un gato por un perro o añadir un accesorio) a partir de comandos de texto, con un enfoque optimizado para ejecución eficiente en entornos con recursos limitados.

El repositorio incluye los pesos cuantizados del modelo de difusión, un VAE en precisión fp32/f16 y un proyector de visión (mmproj) basado en `qwen3vl-4b-it` para interpretar las instrucciones. Con 4.115.745.408 parámetros (aproximadamente 4,1 mil millones), el archivo principal `mageflow-edit-turbo-nvfp4.gguf` ocupa 2,37 GB, lo que lo hace viable en GPUs de consumo e incluso en CPU. Su relevancia radica en democratizar la edición de imágenes por IA al ofrecer un formato estándar compatible con motores de inferencia como `gguf-diffusion`, `gguf-connector` o `ggk`, evitando la dependencia de entornos propietarios.

La licencia MIT permite uso comercial sin restricciones adicionales, aunque se recomienda verificar los términos del modelo base de Microsoft. El modelo se distribuye bajo la etiqueta `edit-turbo`, indicando que está optimizado para generar resultados en solo 4 pasos de muestreo, lo que reduce drásticamente la latencia frente a modelos de difusión tradicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para edición de imágenes (arquitectura exacta no disponible) |
| Parametros totales | 4.115.745.408 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantizacion | NVFP4 (4 bits en punto flotante) para el modelo principal; VAE en FP32/FP16; proyector de visión en FP16 |
| Idiomas soportados | No disponibles (el LLM asociado `qwen3vl-4b-it` soporta múltiples idiomas, pero el modelo en sí no especifica) |
| Licencia | MIT |
| Formato de pesos | GGUF (archivos `.gguf`); también se encuentran safetensors en el repositorio original |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura interna del modelo `Mage-Flow` en la información proporcionada. Por el nombre y el contexto, se trata de un modelo de difusión (probablemente basado en transformer) especializado en edición de imágenes, con una variante "turbo" que reduce el número de pasos de muestreo a 4. El proceso de entrenamiento no está documentado en la model card; se desconoce la composición del dataset, el número de tokens o si se emplearon técnicas como RLHF o DPO.

La cuantización a NVFP4 (formato de 4 bits en coma flotante) es una innovación técnica destacable, ya que permite reducir el tamaño del modelo a 2,37 GB sin una pérdida significativa de calidad, según los benchmarks de velocidad presentados. El pipeline completo requiere además un VAE (en FP32/FP16) y un modelo de lenguaje multimodal (qwen3vl-4b-it) para interpretar las instrucciones de texto y generar la edición.

## Capacidades

- Edición de imágenes basada en instrucciones de texto: permite modificar elementos de una imagen (cambiar objetos, añadir accesorios, alterar escenas) mediante comandos en lenguaje natural.
- Generación de imágenes con pocos pasos: la variante turbo completa la edición en 4 pasos de muestreo, lo que reduce la latencia frente a modelos estándar.
- Integración con modelos de lenguaje multimodal: utiliza `qwen3vl-4b-it` como codificador de texto y visión, lo que permite comprender instrucciones complejas y referencias visuales.
- Soporte de imagen de referencia: acepta una imagen de entrada (`--ref-image`) para aplicar la edición sobre ella.
- Ejecución multiplataforma: compatible con motores GGUF como `gguf-diffusion`, `gguf-connector` y `ggk`, que funcionan en CPU y GPU.
- Cuantización eficiente: el formato NVFP4 reduce el uso de memoria y acelera la inferencia en hardware modesto.

## Casos de uso

- Edición de fotos de producto para comercio electrónico: se puede cambiar el fondo, añadir objetos o modificar la iluminación de una imagen de catálogo mediante instrucciones como "aplicar luz dorada de atardecer", gracias a la capacidad de edición con referencia y los 4 pasos de inferencia.
- Automatización de tareas de diseño gráfico: integración en pipelines de generación de contenido donde se necesite modificar imágenes existentes de forma programática, usando la CLI de `gguf-diffusion` o `ggk`.
- Prototipado rápido de ideas visuales: diseñadores pueden iterar sobre conceptos editando imágenes base con instrucciones de texto, sin necesidad de herramientas complejas de edición.
- Restauración y mejora de imágenes: añadir elementos faltantes o corregir imperfecciones en fotografías antiguas mediante comandos descriptivos.
- Creación de memes y contenido viral: edición humorística de imágenes (cambiar animales, añadir accesorios) con baja latencia, ideal para generación en tiempo real.
- Despliegue en entornos con recursos limitados: al ser un modelo GGUF cuantizado, puede ejecutarse en portátiles sin GPU dedicada o en servidores CPU-only, lo que lo hace adecuado para aplicaciones educativas o de investigación.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks de inferencia comparando tres motores de ejecución. No se proporcionan métricas de calidad de imagen (como FID o CLIP score), solo tiempos de procesamiento.

| Motor | Tiempo completado | Velocidad relativa |
|---|---|---|
| ggk (gk) | 7-8 s | 3x |
| gguf-cpp/gguf-diffusion (kernel ggml) | 24-25 s | 1x (base) |
| stable-diffusion.cpp (ggml completo) | 25-26 s | 0.95-1x |

Además, se presenta una comparativa adicional usando `pig-clip` como codificador de texto en lugar de `qwen3vl-4b-it`:

| Motor | Tiempo completado | Velocidad relativa |
|---|---|---|
| ggk con pig-clip | 5 s | 5x |
| ggk (estándar) | 7-8 s | 3x |
| gguf-cpp/gguf-diffusion | 24-25 s | 1x |

Estos datos indican que el motor `ggk` ofrece un rendimiento significativamente superior, especialmente cuando se combina con el codificador `pig-clip`. No se han publicado resultados de benchmarks de calidad de imagen en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo principal `mageflow-edit-turbo-nvfp4.gguf` ocupa 2,37 GB, por lo que se puede ejecutar en GPUs con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060). Con cuantización adicional o usando CPU, el requisito baja aún más.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA o Vulkan; se recomienda al menos 6 GB de VRAM para incluir el VAE y el proyector de visión. En CPU, se puede ejecutar con 8 GB de RAM.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de gama media y baja.
- Opciones de despliegue: `gguf-diffusion` (similar a llama.cpp), `gguf-connector`, `ggk` (motor optimizado), o `stable-diffusion.cpp`. También se puede integrar con Ollama para el LLM auxiliar.
- Latencia y throughput: según los benchmarks, el motor `ggk` completa una edición en 5-8 segundos en hardware típico; `gguf-cpp` tarda 24-25 segundos. El throughput depende del hardware y del número de pasos (4 por defecto).

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de edición de imágenes en la documentación proporcionada. Modelos como InstructPix2Pix o InstructDiffusion podrían ser alternativas, pero no se han publicado datos de rendimiento o calidad que permitan una comparación objetiva. Por tanto, esta sección queda como "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo de edición de imágenes, puede reflejar sesgos presentes en los datos de entrenamiento del modelo base (Microsoft Mage-Flow).
- Riesgo de alucinación: como todo modelo generativo, puede producir artefactos o modificaciones no deseadas en la imagen, especialmente con instrucciones ambiguas o complejas.
- Dependencia de componentes externos: el pipeline completo requiere un LLM multimodal (qwen3vl-4b-it) y un VAE; si estos no se cargan correctamente, el modelo no funciona.
- Limitaciones de contexto: al ser un modelo de imagen, no maneja texto de entrada largo; las instrucciones deben ser concisas.
- Restricciones de licencia: aunque el repositorio tiene licencia MIT, el modelo base `microsoft/Mage-Flow` puede tener términos adicionales; se recomienda revisar la licencia original de Microsoft antes de uso comercial.
- Rendimiento en CPU: aunque es posible ejecutarlo en CPU, la latencia puede ser alta (más de 25 segundos) y no es recomendable para aplicaciones en tiempo real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gguf-org/mageflow-gguf
- Pipeline de edición con MageFlow Edit GGUF (GitHub): https://github.com/47thtechcorner/RayCodes_MageFlow_Edit_GGUF
- Repositorio IBM/gguf (referencia general sobre formato GGUF): https://github.com/IBM/gguf
