# imagingforgood/sam2.1-hiera-tiny-onnx

## Resumen

SAM 2.1 Hiera Tiny ONNX es una exportación a formato ONNX del modelo Segment Anything Model 2.1 (SAM 2.1) en su variante Hiera Tiny, desarrollado originalmente por Meta FAIR. Este repositorio, mantenido por Imaging for Good, no entrena ni modifica el modelo: se limita a conservar una copia de la exportación ONNX generada por onnx-community, con los cuatro ficheros que su librería browser-perception utiliza en producción. El modelo resuelve el problema de la segmentación de imágenes y vídeo a partir de indicaciones (prompts) como puntos, cajas o máscaras, generando máscaras de segmentación precisas.

La relevancia de esta variante concreta radica en su formato: al estar exportado a ONNX y disponible en fp32 y fp16, puede ejecutarse en entornos web mediante onnxruntime-web y WebGPU, lo que permite segmentación interactiva directamente en el navegador sin depender de un servidor. La variante Tiny mantiene un tamaño reducido (el repositorio completo ocupa 0,2 GB) a costa de una menor precisión frente a las variantes mayores de la familia SAM 2.1.

La arquitectura subyacente es la de SAM 2, que combina un codificador de imagen basado en Hiera con un codificador de prompts y un decodificador de máscaras. El contexto de entrada del codificador de visión es de 1024x1024 píxeles y el modelo no es un modelo de lenguaje: no genera texto ni mantiene conversaciones, sino que produce máscaras y puntuaciones de calidad (IoU).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2 (Hiera image encoder + prompt encoder + mask decoder) |
| Parametros totales | no disponible (repo de 0,2 GB; pesos fp32 del vision encoder ~134 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 1024x1024 px) |
| Tipos de cuantizacion | fp32 y fp16 en este repo; int8 y q4 disponibles en el repo original de onnx-community |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con ficheros `.onnx_data` externos) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SAM 2 descrita en el paper de Ravi et al. (arXiv:2408.00714). Se compone de tres módulos: un codificador de imagen basado en Hiera que transforma la entrada `pixel_values` de forma `[1, 3, 1024, 1024]` en tres mapas de embeddings de resoluciones `[1, 32, 256, 256]`, `[1, 64, 128, 128]` y `[1, 256, 64, 64]`; un codificador de prompts que procesa puntos, etiquetas y cajas; y un decodificador de máscaras que produce `pred_masks` de forma `[1, 1, 3, 256, 256]` (logits), `iou_scores` `[1, 1, 3]` y `object_score_logits`. SAM 2 introduce un mecanismo de memoria para el seguimiento en vídeo, aunque este repositorio solo expone los módulos de imagen (vision encoder y prompt encoder/mask decoder).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos corresponden al modelo original de Meta y no se detallan en la información proporcionada. La innovación técnica destacable de esta variante es la exportación a ONNX con separación de pesos en ficheros `.onnx_data`, lo que permite cargar los módulos de forma independiente y ejecutarlos con onnxruntime-web, incluyendo soporte de fp16 en GPUs con `shader-f16` en WebGPU.

## Capacidades

- Segmentación de imágenes a partir de prompts: acepta puntos (`input_points`), etiquetas (`input_labels`) y cajas (`input_boxes`) para generar máscaras.
- Generación de múltiples máscaras candidatas por prompt (tres máscaras con sus puntuaciones IoU).
- Puntuación de calidad de las máscaras mediante `iou_scores` y `object_score_logits`.
- Ejecución en navegador mediante onnxruntime-web y WebGPU (ficheros fp16) o en cualquier entorno con onnxruntime (ficheros fp32).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la segmentación visual.

## Casos de uso

- Segmentación interactiva en el navegador: una aplicación web puede cargar los ficheros fp16 con WebGPU y permitir al usuario hacer clic sobre una imagen para obtener la máscara del objeto seleccionado, sin enviar la imagen a un servidor.
- Edición de imágenes en cliente: integración en herramientas de recorte o retoque que necesiten aislar objetos a partir de una caja delimitadora, usando el prompt encoder y el mask decoder en el mismo navegador.
- Anotación asistida de datasets: uso del modelo para pregenerar máscaras que un anotador humano revisa y corrige, acelerando el etiquetado de imágenes en proyectos de visión por computador.
- Prototipado rápido de pipelines de segmentación: al estar en ONNX, se puede integrar en flujos de Python con onnxruntime para validar ideas antes de pasar a variantes mayores de SAM 2.1.
- Aplicaciones de privacidad: al ejecutarse localmente en el navegador, las imágenes no salen del dispositivo del usuario, lo que resulta adecuado para datos sensibles.
- Educación y demos: el tamaño reducido (0,2 GB) y la licencia Apache-2.0 facilitan su uso en tutoriales y demostraciones de segmentación sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos fp32 del vision encoder ocupan aproximadamente 134 MB y los del prompt encoder/mask decoder unos 21 MB; los fp16 reducen estas cifras a la mitad (aproximadamente 67 MB y 10 MB).
- GPU recomendadas: cualquier GPU con soporte de WebGPU y `shader-f16` para los ficheros fp16; para fp32, cualquier GPU compatible con onnxruntime, incluidas GPUs integradas.
- Cabe en GPUs de consumo: sí, dado el reducido tamaño de los pesos, es viable en GPUs de gama baja e incluso en entornos de navegador.
- Opciones de despliegue: onnxruntime-web (navegador), onnxruntime (Python/C++), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sam2.1-hiera-tiny-onnx (este) | no disponible (repo 0,2 GB) | 1024x1024 px | ONNX fp32/fp16 | Apache-2.0 | Hugging Face |
| facebook/sam2.1-hiera-tiny | no disponible | 1024x1024 px | PyTorch | Apache-2.0 | Hugging Face |
| onnx-community/sam2.1-hiera-tiny-ONNX | no disponible | 1024x1024 px | ONNX (incluye int8, q4) | Apache-2.0 | Hugging Face |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de rendimiento de alternativas de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas ni mantiene conversaciones.
- Solo incluye los módulos de imagen; no se incluye el mecanismo de memoria para seguimiento en vídeo de SAM 2.
- La variante Tiny ofrece menor precisión que las variantes Base, Large o Huge de SAM 2.1.
- Los ficheros fp16 requieren una GPU con `shader-f16` en WebGPU; en caso contrario deben usarse los fp32.
- No se han documentado sesgos específicos en la información disponible, pero al ser un modelo de segmentación visual puede heredar sesgos del dataset de entrenamiento original de Meta.
- Riesgo de máscaras imprecisas en objetos pequeños, oclusiones o imágenes de baja calidad; las puntuaciones IoU permiten filtrar resultados, pero no garantizan corrección.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el fichero LICENSE copiado de facebookresearch/sam2.
- El repositorio es una copia de conveniencia mantenida por Imaging for Good; no hay garantía de soporte ni actualizaciones.

## Enlaces

- [Hugging Face: imagingforgood/sam2.1-hiera-tiny-onnx](https://huggingface.co/imagingforgood/sam2.1-hiera-tiny-onnx)
- [Modelo base: facebook/sam2.1-hiera-tiny](https://huggingface.co/facebook/sam2.1-hiera-tiny)
- [Exportación original: onnx-community/sam2.1-hiera-tiny-ONNX](https://huggingface.co/onnx-community/sam2.1-hiera-tiny-ONNX)
- [Código: facebookresearch/sam2](https://github.com/facebookresearch/sam2)
- [Paper: SAM 2: Segment Anything in Images and Videos (arXiv:2408.00714)](https://arxiv.org/abs/2408.00714)
- [browser-perception](https://imagingforgood.github.io/browser-perception/)
