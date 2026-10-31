# LiquidAI/LFM3-VL-2B-ONNX

## Resumen

LFM3-VL-2B-ONNX es la versión en formato ONNX del modelo multimodal LFM3-VL-2B de Liquid AI, diseñada para inferencia multiplataforma mediante ONNX Runtime. Se trata de un modelo image-text-to-text (visión-lenguaje) compacto, de unos 2 mil millones de parámetros, capaz de procesar imágenes y texto para generar respuestas conversacionales. Su relevancia radica en la combinación de un tamaño muy reducido con capacidades multimodales y soporte de 16 idiomas, lo que lo hace idóneo para despliegues en dispositivos con recursos limitados (CPU locales, móviles, edge) donde los modelos de mayor tamaño no son viables.

El repo incluye cinco precisiones cuantizadas (q4, q8, q4f16, q8f16 y fp16), cada una emparejando un decodificador con un codificador de visión, con archivos que van desde 1,69 GB en cuantización de 4 bits hasta el peso completo en fp16. Esto permite ejecutar el modelo en CPU sin GPU dedicada o acelerarlo en GPU, cubriendo un amplio espectro de hardware. La licencia es propia de Liquid AI (lfm1.0), con condiciones específicas que conviene revisar antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (decodificador LFM3 + codificador de visión); detalles en la model card original |
| Parametros totales | ~2B (LFM3-VL-2B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4, q8, q4f16, q8f16, fp16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo combina un decodificador de lenguaje basado en la familia LFM3 de Liquid AI con un codificador de visión independiente; en el formato ONNX, cada precisión se distribuye como dos ficheros separados (decoder y vision_encoder) que se ejecutan de forma conjunta en ONNX Runtime. Esta separación permite cuantizar cada componente con una precisión distinta: por ejemplo, la variante q4 empareja un decodificador en 4 bits con un codificador de visión en 8 bits, y la variante q8 usa decodificador de 8 bits con codificador de visión en fp16.

La información sobre datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) y sobre innovaciones técnicas específicas no está disponible en la model card de esta versión ONNX; los detalles de arquitectura y entrenamiento remiten a la model card del modelo base LFM3-VL-2B. La familia LFM (Liquid Foundation Models) de Liquid AI se caracteriza por arquitecturas no convencionales basadas en unidades líquidas, pero esta ficha no incluye datos concretos verificables para esta versión.

## Capacidades

- Comprensión de imágenes y generación de texto condicionada por imagen (pipeline image-text-to-text)
- Conversación multimodal (chat con entradas de imagen y texto)
- Generación de texto en 16 idiomas, incluido castellano
- Ejecución multiplataforma vía ONNX Runtime (CPU y GPU, dispositivos edge)
- Cinco niveles de cuantización para ajustar el equilibrio entre calidad y recursos

No se dispone de información verificada sobre soporte de tool calling, capacidades de agentes, thinking mode, audio o vídeo.

## Casos de uso

- **Descripción automática de imágenes en dispositivos edge**: con la variante q4 (1,69 GB en CPU), se puede integrar generación de descripciones de imágenes en aplicaciones locales sin GPU, útil en logística o inventario.
- **Asistente multimodal offline**: la ejecución en CPU permite incorporar chat con imágenes en aplicaciones de escritorio o móviles sin depender de APIs externas, preservando la privacidad de los datos.
- **OCR y extracción de información de documentos**: el codificador de visión permite interpretar capturas, formularios o facturas y extraer campos en texto estructurado en flujos de automatización.
- **Moderación y clasificación de contenido visual**: integración en pipelines que analizan imágenes subidas por usuarios y generan etiquetas o informes textuales.
- **Aplicaciones multilingües**: con soporte de 16 idiomas, es adecuado para productos con audiencia internacional que necesiten describir o conversar sobre imágenes en varios idiomas, incluido el castellano.
- **Prototipado rápido multiplataforma**: ONNX Runtime funciona en Windows, Linux, macOS, Android e iOS, lo que facilita validar casos de uso multimodales antes de portar a producción.
- **Accesibilidad**: generación de descripciones de imágenes en tiempo real para lectores de pantalla en aplicaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

| Precision | Tamano | Dispositivo objetivo |
|---|---|---|
| q4 | 1,69 GB | CPU |
| q8 | 2,51 GB | CPU |
| q4f16 | 1,69 GB | GPU |
| q8f16 | 2,34 GB | GPU |
| fp16 | no disponible (fichero truncado) | no disponible |

- **VRAM estimada para inferencia**: con la variante q4f16, aproximadamente 2 GB de VRAM; con q8f16, unos 2,5 GB. En CPU, la variante q4 requiere unos 2 GB de RAM.
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente (por ejemplo, RTX 3060 o superior); no se necesitan GPU de datacenter dado el tamaño del modelo.
- **Consumer GPU**: cabe con holgura en GPUs de consumo habituales (RTX 3060, 4060, 4090) e incluso en GPUs integradas compatibles con DirectML o CoreML.
- **CPU**: las variantes q4 y q8 están diseñadas explícitamente para CPU, por lo que un portátil o equipo de escritorio con 8 GB de RAM es suficiente.
- **Opciones de despliegue**: ONNX Runtime (nativo del formato), con soporte para ejecución en CPU, CUDA, DirectML, CoreML y móviles; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta versión ONNX.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Formato | Contexto | Licencia |
|---|---|---|---|---|---|
| LFM3-VL-2B-ONNX | ~2B | imagen-texto-a-texto | ONNX | no disponible | lfm1.0 (other) |
| Qwen2.5-VL-3B-Instruct | ~3B | imagen-texto-a-texto | safetensors, GGUF | 32k aprox. | Apache 2.0 |
| SmolVLM2-2.2B-Instruct | ~2,2B | imagen-texto-a-texto | safetensors, GGUF | 16k aprox. | Apache 2.0 |

Nota: los datos de los modelos comparados son aproximados y pueden variar; la ventaja diferencial de LFM3-VL-2B-ONNX es la distribución oficial en ONNX con cinco precisiones, orientada a despliegue multiplataforma, frente a licencias más permisivas en las alternativas.

## Limitaciones y advertencias

- La licencia lfm1.0 es una licencia propia ("other"), no una licencia estándar open source; debe revisarse el texto de la licencia antes de cualquier uso comercial o redistribución.
- La longitud de contexto no está documentada en esta model card; consultar la model card del modelo base antes de diseñar aplicaciones con documentos o conversaciones largas.
- Al tratarse de un modelo de 2B parámetros, la calidad de razonamiento y la fiabilidad factual son inferiores a las de modelos de mayor escala; es esperable cierto riesgo de alucinación, especialmente en descripciones detalladas de imágenes.
- El rendimiento en idiomas distintos del inglés puede ser desigual; no se publican evaluaciones por idioma.
- Los benchmarks no están publicados, por lo que la comparación de calidad con alternativas debe validarse empíricamente en cada caso de uso.
- La ejecución en CPU con las variantes cuantizadas implica una pérdida de calidad respecto a fp16, cuya magnitud no está cuantificada por el autor.

## Enlaces

- Modelo ONNX: https://huggingface.co/LiquidAI/LFM3-VL-2B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
