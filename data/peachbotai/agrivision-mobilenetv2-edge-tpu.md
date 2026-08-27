# peachbotAI/agrivision-mobilenetv2-edge-tpu

## Resumen

El modelo `peachbotAI/agrivision-mobilenetv2-edge-tpu` es un clasificador de imágenes orientado al ámbito agrícola, presumiblemente diseñado para la detección de enfermedades en cultivos a partir de imágenes de hojas. Su nombre sugiere que se basa en la arquitectura MobileNetV2, optimizada para su ejecución en dispositivos Edge TPU de Google Coral, lo que permitiría inferencia de baja latencia en hardware de bajo consumo. Sin embargo, la información pública disponible es extremadamente limitada: la model card únicamente declara la licencia Apache 2.0 y no incluye descripción, métricas, ni detalles de entrenamiento. No se han publicado resultados de benchmarks ni especificaciones técnicas verificables, por lo que esta ficha se basa en suposiciones razonables derivadas del nombre y de proyectos similares, pero no en datos confirmados del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (inferido por el nombre, no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (posiblemente int8 para Edge TPU, no confirmado) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (posiblemente TensorFlow Lite o safetensors, no confirmado) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura concreta, el proceso de entrenamiento, el dataset utilizado ni las técnicas de optimización aplicadas. El nombre del modelo indica que se emplea MobileNetV2, una red neuronal convolucional ligera basada en convoluciones separables en profundidad, conocida por su eficiencia computacional y su idoneidad para entornos con recursos limitados. La referencia a "edge-tpu" sugiere que el modelo ha sido convertido o cuantizado para ejecutarse en el acelerador Edge TPU de Google Coral, lo que implicaría una cuantización a enteros de 8 bits. No obstante, estos detalles no están documentados en la model card ni en los resultados de búsqueda, por lo que deben considerarse hipótesis no verificadas.

## Capacidades

- No se han documentado capacidades específicas del modelo en la información disponible.
- Por su naturaleza (clasificación de imágenes agrícolas), se espera que pueda identificar enfermedades o plagas en hojas de cultivos, pero no hay evidencia pública que lo confirme.
- No se indica soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, ya que es un modelo de visión puro.

## Casos de uso

Dado que no hay información confirmada sobre el modelo, los siguientes casos de uso son hipotéticos y basados en la funcionalidad típica de modelos similares en el dominio agrícola:

- Diagnóstico de enfermedades en cultivos: un agricultor podría fotografiar una hoja y el modelo clasificaría la enfermedad, permitiendo una intervención temprana. La optimización para Edge TPU facilitaría su despliegue en dispositivos móviles o sensores de campo.
- Monitorización automatizada de invernaderos: integrado en cámaras fijas, el modelo podría analizar imágenes periódicamente para detectar anomalías en las plantas, reduciendo la necesidad de inspección manual.
- Asistencia a extensionistas agrícolas: como herramienta de apoyo en zonas rurales sin conectividad, el modelo podría ejecutarse localmente en un dispositivo Coral para ofrecer diagnósticos sin depender de la nube.
- Educación y divulgación: en aplicaciones de aprendizaje, el modelo podría ayudar a estudiantes a identificar enfermedades vegetales a partir de fotografías.
- Control de calidad en la cadena de suministro: en almacenes o centros de procesamiento, el modelo podría clasificar hojas o frutos dañados antes del empaquetado.
- Investigación agronómica: como base para estudios de fenotipado o para validar hipótesis sobre la prevalencia de ciertas enfermedades en distintas regiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como precisión, recall, F1, ni comparaciones con otros modelos. Tampoco se conocen datos de latencia o throughput en Edge TPU.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni de GPU en la documentación.
- Dado el nombre, el modelo está pensado para ejecutarse en el acelerador Edge TPU de Google Coral (USB o dev board), que dispone de 4 TOPS de rendimiento y 8 MB de SRAM.
- También podría ejecutarse en CPUs convencionales, aunque con menor rendimiento, gracias a la ligereza de MobileNetV2.
- No se indican opciones de despliegue específicas, pero por la naturaleza del modelo, sería compatible con TensorFlow Lite y herramientas como Coral API o Edge TPU Compiler.
- No se dispone de estimaciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. Existen proyectos de código abierto como AgroVision-AI o AgriVision-Pro que también utilizan MobileNetV2 para detección de enfermedades de cultivos, pero no se han publicado métricas comparables ni se ha verificado que este modelo sea una variante de ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La falta de documentación técnica y de resultados de evaluación impide conocer su precisión real, sus sesgos o sus limitaciones específicas.
- Al ser un modelo de clasificación de imágenes, su rendimiento depende en gran medida de la calidad y diversidad del dataset de entrenamiento, que no se ha hecho público.
- No se garantiza que funcione correctamente en condiciones de iluminación variable, ángulos de cámara distintos o especies de plantas no representadas en el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero al no haber información sobre los datos de entrenamiento, podrían existir problemas de propiedad intelectual o de sesgo no documentados.
- No se ha verificado la compatibilidad real con Edge TPU; el nombre sugiere que sí, pero no hay evidencia de que el modelo haya sido compilado correctamente para ese hardware.
- Para uso en producción, se recomienda realizar una validación exhaustiva con datos propios y considerar la posibilidad de que el modelo no esté actualizado o mantenido.

## Enlaces

- [HuggingFace - peachbotAI/agrivision-mobilenetv2-edge-tpu](https://huggingface.co/peachbotAI/agrivision-mobilenetv2-edge-tpu)
- No se han encontrado otros enlaces relevantes (papers, repositorios, demos) específicos de este modelo en la búsqueda web.
