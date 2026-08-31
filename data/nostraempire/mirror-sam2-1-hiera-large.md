# NostraEmpire/mirror-sam2.1-hiera-large

## Resumen

SAM 2.1 Hiera Large es un modelo fundacional de segmentación visual promptable desarrollado por Meta FAIR, presentado en el paper "SAM 2: Segment Anything in Images and Videos" (arXiv:2408.00714). Este modelo, disponible en el repositorio espejo NostraEmpire/mirror-sam2.1-hiera-large, permite segmentar objetos en imágenes y vídeos a partir de prompts como puntos, cajas delimitadoras o máscaras, generando múltiples propuestas de máscaras ordenadas por calidad. Con una arquitectura Hiera (vision transformer jerárquico) y 224,4 millones de parámetros, está diseñado para resolver tareas de segmentación interactiva y automática en tiempo real, siendo especialmente relevante para aplicaciones de edición de imágenes, anotación de datos y seguimiento de objetos en vídeo. Su integración con la librería Transformers de Hugging Face facilita su uso mediante pipelines estándar, y su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hiera (vision transformer jerárquico) |
| Parametros totales | 224.447.154 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SAM 2.1 Hiera Large emplea una arquitectura Hiera, un vision transformer jerárquico que procesa imágenes y vídeos mediante una estructura multiescala. El modelo acepta prompts de entrada (puntos, cajas o máscaras) y produce máscaras de segmentación con una puntuación de calidad asociada. Para vídeo, utiliza un mecanismo de propagación temporal que permite mantener la coherencia de las máscaras a lo largo de los fotogramas, generando "masklets" (máscaras propagadas en el tiempo). El entrenamiento se realizó sobre un gran corpus de datos visuales, aunque no se han publicado detalles específicos sobre el número de tokens o la composición exacta del dataset en la información disponible. No se menciona el uso de RLHF o DPO, ya que es un modelo de visión y no de lenguaje. La innovación principal reside en su capacidad para segmentar tanto imágenes como vídeos con un único modelo, superando las limitaciones de SAM original en el dominio temporal.

## Capacidades

- Segmentación promptable en imágenes: acepta puntos positivos/negativos, cajas delimitadoras y máscaras como entrada.
- Segmentación en vídeo: permite inicializar prompts en un fotograma y propagar las máscaras a lo largo de la secuencia.
- Generación de múltiples máscaras por prompt, ordenadas por una puntuación de calidad.
- Segmentación automática de todos los objetos de una imagen mediante el pipeline `mask-generation` de Transformers.
- Extracción de características visuales (feature-extraction) gracias a su backbone Hiera.
- Integración nativa con la librería Transformers, incluyendo procesadores y modelos listos para usar.
- Soporte para inferencia por lotes (batch) en imágenes y vídeos.

## Casos de uso

- Anotación de datos para visión por computador: los anotadores pueden hacer clic en un objeto y obtener una máscara precisa, acelerando la creación de datasets de segmentación. El modelo genera varias propuestas para elegir la mejor.
- Edición de imágenes: recorte de objetos mediante caja delimitadora o clic, útil en herramientas de retoque fotográfico o composición. La salida de máscaras de alta calidad permite separar el objeto del fondo.
- Seguimiento de objetos en vídeo: en aplicaciones de vigilancia o análisis deportivo, se puede marcar un objeto en un fotograma y el modelo lo sigue automáticamente en los siguientes, generando máscaras temporales coherentes.
- Segmentación automática en pipelines de procesado de imágenes: el pipeline `mask-generation` permite segmentar todos los objetos de una imagen sin intervención manual, útil para indexación visual o preprocesado.
- Herramientas de diagnóstico médico (asistido): aunque no está entrenado específicamente para imágenes médicas, puede adaptarse con fine-tuning para segmentar estructuras en radiografías o resonancias, usando prompts de puntos.
- Robótica y navegación: segmentación de objetos en tiempo real para que un robot identifique y manipule elementos en su entorno, usando prompts de caja o punto.
- Realidad aumentada: superposición de objetos virtuales sobre segmentaciones precisas de objetos reales en vídeo, gracias a la propagación temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original (arXiv:2408.00714) reporta métricas en tareas de segmentación de imágenes y vídeos, pero no se incluyen en la documentación proporcionada.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM o GPUs recomendadas en la información consultada.
- Dado el tamaño del modelo (224M parámetros) y el peso del repositorio (1,8 GB), se estima que la inferencia en imágenes requiere al menos 8 GB de VRAM en una GPU de consumo (por ejemplo, RTX 3060 o superior) para trabajar con resoluciones típicas.
- Para vídeo, la memoria necesaria puede aumentar según la longitud y resolución de la secuencia.
- El modelo es compatible con PyTorch y se puede desplegar con librerías como Transformers, vLLM (aunque no es un modelo de lenguaje) o directamente con el código oficial de SAM 2.
- No se han publicado datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo en la información proporcionada. Sin embargo, SAM 2.1 Hiera Large pertenece a la familia SAM 2.1, que incluye variantes más pequeñas (hiera-tiny, hiera-small, hiera-base-plus) y más grandes (hiera-large). La variante large ofrece mayor capacidad de representación a costa de más parámetros y requisitos de cómputo. Comparado con SAM original (ViT-B/L/H), SAM 2.1 introduce mejoras en la propagación temporal y en la eficiencia del backbone Hiera. No se incluyen tablas comparativas por falta de datos concretos.

## Limitaciones y advertencias

- Es un modelo de visión, no de lenguaje: no procesa texto ni tiene capacidades multimodales más allá de la segmentación.
- Puede generar máscaras incorrectas o "alucinadas" en escenas complejas, con oclusiones o texturas ambiguas.
- La segmentación en vídeo puede degradarse en secuencias largas o con movimientos bruscos, perdiendo la coherencia temporal.
- No se han documentado sesgos específicos, pero al ser entrenado con datos web, puede presentar sesgos en el reconocimiento de ciertos objetos o categorías.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del paper y el código oficial para posibles patentes o restricciones adicionales.
- Para producción, es necesario validar la calidad de las máscaras en el dominio de aplicación, ya que el modelo no está especializado en dominios concretos (médico, industrial, etc.) sin fine-tuning.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/NostraEmpire/mirror-sam2.1-hiera-large
- Modelo original en Hugging Face: https://huggingface.co/facebook/sam2.1-hiera-large
- Paper SAM 2: https://arxiv.org/abs/2408.00714
- Código oficial (GitHub): https://github.com/facebookresearch/segment-anything-2
- Documentación de Transformers para SAM2: https://huggingface.co/docs/transformers/model_doc/sam2
