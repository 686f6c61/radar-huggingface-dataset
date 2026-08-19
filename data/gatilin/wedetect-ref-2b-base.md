# gatilin/WeDetect-Ref-2B-Base

## Resumen

WeDetect-Ref-2B-Base es un modelo de detección de objetos de vocabulario abierto (open-vocabulary object detection) desarrollado por el equipo WeChatCV, presentado en el CVPR 2026 bajo el título "WeDetect: Fast Open-Vocabulary Object Detection as Retrieval". El modelo adopta una arquitectura de doble torre (dual-tower) que trata la detección como un problema de recuperación (retrieval), lo que le permite operar en tiempo real con una eficiencia destacable. Esta versión concreta, publicada por el usuario `gatilin`, es una variante "Base" con licencia MIT, aunque no se dispone de una model card oficial que detalle sus características internas.

El modelo se enmarca en la tendencia de sistemas de detección que no se limitan a clases predefinidas, sino que pueden localizar cualquier objeto descrito mediante lenguaje natural. Su relevancia radica en la combinación de velocidad y versatilidad, lo que lo hace adecuado para aplicaciones de visión por computador en entornos dinámicos. A partir de la información disponible, se sabe que utiliza pesos en formato Safetensors y está relacionado con la familia Qwen3-VL, aunque no se especifican el número de parámetros, la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-tower (detección como retrieval) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Según el repositorio oficial de WeChatCV, WeDetect emplea una arquitectura de doble torre que procesa simultáneamente la imagen y las consultas de texto, y reformula la detección de objetos como una tarea de recuperación. Este diseño permite una inferencia en tiempo real sin sacrificar la capacidad de generalizar a categorías no vistas. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo está vinculado a la familia Qwen3-VL, lo que sugiere que utiliza un backbone de visión-lenguaje de dicha serie, pero esta información no está confirmada para esta versión específica.

## Capacidades

- Detección de objetos de vocabulario abierto: localiza objetos en imágenes a partir de descripciones textuales arbitrarias, sin necesidad de clases predefinidas.
- Zero-shot object detection: puede detectar categorías no vistas durante el entrenamiento, gracias a su enfoque basado en retrieval.
- Inferencia en tiempo real: la arquitectura dual-tower está optimizada para baja latencia, adecuada para aplicaciones en streaming o robótica.
- Integración con modelos de visión-lenguaje: al estar relacionado con Qwen3-VL, hereda capacidades de comprensión multimodal, aunque no se especifica si soporta generación de texto o diálogo.
- Formato de pesos Safetensors: facilita la carga segura en frameworks de deep learning como PyTorch o Hugging Face Transformers.

## Casos de uso

- Vigilancia y análisis de vídeo en tiempo real: el modelo puede detectar objetos específicos (p. ej., "persona con casco", "vehículo rojo") en flujos de vídeo, gracias a su baja latencia y capacidad de vocabulario abierto.
- Búsqueda visual en bases de imágenes: permite consultar imágenes por descripciones naturales, como "silla de oficina" o "perro marrón", sin necesidad de etiquetas manuales.
- Robótica y navegación autónoma: un robot puede localizar objetos relevantes en su entorno a partir de instrucciones en lenguaje natural, mejorando la interacción humano-máquina.
- Moderación de contenido: detección de objetos no deseados (armas, sustancias) en imágenes subidas a plataformas, adaptándose a nuevas amenazas sin reentrenamiento.
- Asistencia a personas con discapacidad visual: descripción de objetos en el entorno capturado por una cámara, con respuestas rápidas y precisas.
- Automatización industrial: control de calidad detectando defectos o componentes específicos en líneas de producción, mediante consultas textuales configurables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como mAP, precisión o recall en conjuntos como COCO o LVIS para esta versión concreta.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware específicos para este modelo. Dado que es una variante "2B" (según el nombre, aunque no confirmado), se espera que pueda ejecutarse en GPUs de consumo medio (p. ej., RTX 3060 o superior) con cuantización, pero no hay datos oficiales. Las opciones de despliegue típicas para modelos Safetensors incluyen vLLM, Hugging Face Inference Endpoints o llama.cpp si se convierte a GGUF, aunque no se ha verificado compatibilidad.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de detección de vocabulario abierto como YOLO-World o Grounding DINO. La información disponible no permite establecer una tabla comparativa fiable. Se recomienda consultar el paper original para obtener datos de rendimiento relativos.

## Limitaciones y advertencias

- Falta de documentación oficial: la model card del modelo en Hugging Face está vacía, lo que dificulta conocer detalles de entrenamiento, sesgos o limitaciones específicas.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base podría tener dependencias con otros componentes (como Qwen3-VL) que tengan licencias más restrictivas (p. ej., GPL-3.0 en versiones duplicadas). Es necesario verificar la cadena de licencias.
- Riesgo de alucinación en detección: al ser un modelo de retrieval, puede generar falsos positivos si la consulta textual es ambigua o si la imagen contiene objetos similares.
- Sesgos en el entrenamiento: sin información sobre los datos, no se pueden evaluar sesgos de género, raza o contexto cultural en las detecciones.
- Sin soporte multilingüe confirmado: aunque está vinculado a Qwen3-VL, no se especifican los idiomas soportados; probablemente el inglés sea el principal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gatilin/WeDetect-Ref-2B-Base
- Repositorio oficial del paper (WeChatCV/WeDetect): https://github.com/WeChatCV/WeDetect
- Paper en arXiv (referencia 2512.12309): https://arxiv.org/abs/2512.12309
- Versión duplicada con más metadatos (leo1357/WeDetect-Ref-2B): https://huggingface.co/leo1357/WeDetect-Ref-2B
