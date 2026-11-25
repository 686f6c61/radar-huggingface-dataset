# moonbox-dev/MinerU2.5-Pro-2605-1.2B-ONNX

## Resumen

MinerU2.5-Pro-2605-1.2B-ONNX es la distribución en formato ONNX del modelo MinerU2.5-Pro, un modelo de lenguaje y visión (VLM) de 1.200 millones de parámetros desarrollado por OpenDataLab y especializado en parsing de documentos y OCR. Esta variante la publica moonbox-dev con el objetivo de facilitar la inferencia en dispositivo mediante ONNX Runtime, con soporte para CPU, CUDA y DirectML. El modelo hereda la arquitectura Qwen2-VL del modelo base y se distribuye bajo licencia Apache 2.0.

El modelo resuelve un problema concreto: extraer texto estructurado de imágenes de páginas (documentos escaneados, PDF renderizados, capturas) con alta fidelidad, manteniendo el formato y la disposición del contenido original. Frente a pipelines OCR clásicos, un VLM de este tipo integra detección, reconocimiento y estructuración en un único paso autorregresivo, lo que simplifica el despliegue y reduce la propagación de errores entre etapas.

La relevancia de esta variante ONNX radica en que permite ejecutar el modelo sin depender de PyTorch ni de CUDA Toolkit completo, lo que habilita su uso en entornos con requisitos estrictos de empaquetado, en servidores sin GPU dedicada o en aplicaciones de escritorio mediante DirectML. El repositorio ocupa 4,2 GB e incluye dos precisiones (fp16 e int8) con los grafos separados en visión, embedding y decodificador, además de un script `pipeline.py` que gestiona el preprocesado, el prompt y el bucle de decodificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer basada en Qwen2-VL (modelo base: opendatalab/MinerU2.5-Pro-2605-1.2B) |
| Parametros totales | 1.200 millones (1.2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 e int8 (grafos ONNX separados por precisión) |
| Idiomas soportados | no disponible (la model card menciona evaluación CER por idioma, pero no enumera idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `vision.onnx`, `embed.onnx`, `decoder.onnx` por precisión) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen2-VL, un transformer multimodal con un codificador visual que proyecta las imágenes a embeddings y un decodificador de lenguaje autorregresivo que genera el texto reconocido. La distribución ONNX separa explícitamente estos componentes en tres grafos: `vision.onnx` (1,32 GB en fp16), `embed.onnx` (272,3 MB en fp16) y `decoder.onnx` (989,0 MB en fp16). En int8 los tamaños se reducen aproximadamente a la mitad: 497,5 MB el decodificador y 136,7 MB el embedding, mientras que el grafo de visión no aparece listado completo en la información disponible.

No se dispone de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card se centra en los artefactos de la conversión a ONNX y en la validación de la cuantización, no en el proceso de entrenamiento del modelo base. La innovación técnica destacable de esta distribución es la preservación de la fidelidad respecto al original: según la model card, tanto fp16 como int8 obtienen un CER (character error rate) del 0,0 % frente al texto de la página y frente a la propia salida del modelo original en fp32, con texto idéntico en la comparación.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de páginas y documentos escaneados.
- Parsing de documentos: extracción de texto estructurado respetando la disposición del contenido.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text`).
- Generación autorregresiva de texto condicionada a la imagen de entrada.
- Ejecución en dispositivo mediante ONNX Runtime con backends CPU, CUDA y DirectML.
- Cuantización a int8 con degradación nula de calidad medida (CER 0,0 % e texto idéntico al original).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades de audio.

## Casos de uso

- Digitalización de archivos escaneados: el modelo procesa cada página renderizada como imagen y devuelve el texto reconocido, adecuado para proyectos de preservación documental donde se requiere fidelidad de caracteres (CER 0,0 % medido).
- Extracción de texto en aplicaciones de escritorio: gracias al backend DirectML de ONNX Runtime, puede integrarse en herramientas nativas de Windows sin GPU dedicada ni CUDA Toolkit.
- Procesamiento por lotes en servidores sin GPU: la variante int8 (grafos de menor tamaño) permite ejecutar el pipeline en CPU con un coste de 1,69 s por página en CUDA, según la referencia de la model card.
- Pipelines de ingesta documental: al ejecutarse sobre ONNX Runtime, se integra en servicios contenerizados con dependencias mínimas, reduciendo el tamaño de imagen frente a despliegues PyTorch.
- Análisis de documentos en el borde (edge): el tamaño de 1,2B parámetros y la disponibilidad de int8 facilitan el despliegue en hardware con recursos limitados.
- Validación de calidad OCR en producción: la coincidencia exacta con la salida del modelo original en fp32 permite sustituir el despliegue PyTorch por ONNX sin recalibrar umbrales ni revalidar resultados.

## Benchmarks y rendimiento

La model card proporciona métricas de fidelidad y latencia comparando las precisiones ONNX con el modelo original en fp32:

| Precision | CER vs texto de pagina | CER vs salida original | Texto identico | Latencia (CUDA) |
|---|---|---|---|---|
| fp16 | 0,0 % | 0,0 % | Si | 0,75 s por pagina |
| int8 | 0,0 % | 0,0 % | Si | 1,69 s por pagina |
| Original fp32 | 0,0 % | — | — | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo está especializado en OCR y parsing de documentos y la model card no reporta métricas de ese tipo.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 4,2 GB; la precisión fp16 requiere aproximadamente 2,6 GB de pesos (visión 1,32 GB + decodificador 989 MB + embedding 272 MB) más memoria para activaciones y KV cache; int8 reduce los pesos a aproximadamente 1,3 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA para ONNX Runtime; la model card reporta latencias medidas en CUDA sin especificar el modelo de GPU.
- Cabe en GPU de consumo: sí, tanto fp16 como int8 caben en GPUs consumer con 4-8 GB de VRAM; int8 es apto para GPUs con 2-4 GB.
- Opciones de despliegue: ONNX Runtime con ejecución CPU, CUDA o DirectML; el repositorio incluye `pipeline.py` para el preprocesado y el bucle de decodificación.
- Latencia y throughput: 0,75 s por página en fp16 y 1,69 s por página en int8 sobre CUDA, según la model card; no se reportan cifras para CPU ni DirectML.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MinerU2.5-Pro-2605-1.2B-ONNX (este) | 1,2B | no disponible | ONNX (fp16, int8) | Apache 2.0 | Variante ONNX para inferencia en dispositivo; CER 0,0 % frente al original |
| opendatalab/MinerU2.5-Pro-2605-1.2B | 1,2B | no disponible | safetensors (presumible, no confirmado) | Apache 2.0 | Modelo base original en fp32; referencia de calidad |
| Otros VLM de OCR de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La información disponible no permite establecer una comparativa cuantitativa con alternativas de la misma categoría más allá del propio modelo base.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al ser un modelo especializado en OCR, los sesgos se manifestarían principalmente en la calidad de reconocimiento según idioma, tipografía o calidad de la imagen.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas OCR la generación autorregresiva puede producir texto plausible no presente en la imagen, especialmente con imágenes degradadas.
- Idiomas soportados: no se enumeran; la model card menciona evaluación CER por idioma pero no detalla cuáles ni sus resultados individuales.
- Longitud de contexto: no disponible; no se puede garantizar el procesamiento de páginas de muy alta resolución o documentos de múltiples páginas en una sola pasada.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- Las latencias reportadas (0,75 s fp16, 1,69 s int8) corresponden a CUDA y no son extrapolables a CPU o DirectML.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; es una publicación reciente sin validación comunitaria amplia.
- La información sobre el proceso de entrenamiento del modelo base es inexistente en la model card, lo que limita la evaluación de riesgos asociados a los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/MinerU2.5-Pro-2605-1.2B-ONNX
- Modelo base: https://huggingface.co/opendatalab/MinerU2.5-Pro-2605-1.2B
- Paper referenciado (arXiv:2604.04771): https://arxiv.org/abs/2604.04771
- Script de pipeline incluido: https://huggingface.co/moonbox-dev/MinerU2.5-Pro-2605-1.2B-ONNX/blob/main/fp16/pipeline.py
