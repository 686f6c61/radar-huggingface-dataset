# Pranilllllll/geonusaf-s4-unet-r18-R1-block-fold1

## Resumen

GeoNUSAF Stage 4 - UNet-ResNet18 es un modelo de segmentación semántica para imágenes de teledetección, desarrollado por Pranilllllll dentro de la serie GeoNUSAF. Su objetivo es clasificar el uso del suelo en el valle de Katmandú (Nepal) en seis clases: residencial, carretera, río, bosque, tierra no utilizada y agrícola. El modelo combina un encoder ResNet18 preentrenado en ImageNet con un decoder UNet de canales progresivos [128, 64, 32, 16, 8], resultando en 12,46 millones de parámetros.

La relevancia de este modelo radica en su enfoque híbrido de entrenamiento: usa 804 pares de imágenes reales y otros 804 pares sintéticos generados en una etapa previa (stage 3), lo que busca mitigar la escasez de datos etiquetados en teledetección. Los pesos publicados corresponden a la media móvil exponencial (EMA) con decaimiento 0.999, no a los pesos finales crudos. El modelo alcanza un mIoU de 0.4515 en validación sobre 136 teselas reales del fold 1, con una precisión global (OA) de 0.7738 y un coeficiente kappa de 0.6217.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet con encoder ResNet18 (ImageNet) y decoder [128, 64, 32, 16, 8] |
| Parametros totales | 12,46 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, procesa imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (segmentacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 3.0 GB, probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura UNet clasica implementada en la libreria `segmentation-models-pytorch` (smp). El encoder es un ResNet18 preentrenado en ImageNet que extrae caracteristicas jerarquicas; el decoder reconstruye la mascara de segmentacion con canales [128, 64, 32, 16, 8] y una capa final de clasificacion por pixel para 6 clases, con `ignore_index=255` para píxeles no etiquetados.

El entrenamiento se realizo con 1608 pares imagen-mascara (804 reales + 804 sinteticos provenientes de `sugam24/geonusaf-stage3-fakepairs-block-fold1`, particion `fake_pairs_R1`). El esquema de optimizacion fue un programador coseno de 6000 pasos con 500 pasos de calentamiento, pesos de clase derivados de los datos reales y semilla fija 42. El mejor paso fue el 3200, y los pesos publicados son la media EMA con decaimiento 0.999. La validacion se realizo sobre 136 teselas reales del fold 1, sin píxeles sinteticos. Segun el autor, este modelo no es comparable con la corrida previa de U-Net del fold 1 de la parte 1, que sufria un bug de congelacion de aumentos y un esquema por epocas.

## Capacidades

- Segmentacion semantica de imagenes de teledeteccion (uso del suelo) en 6 clases: residencial, carretera, rio, bosque, tierra no utilizada y agricola.
- Procesamiento de imagenes de alta resolucion tipicas de satelites o vuelos aereos sobre areas urbanas.
- Manejo de píxeles sin etiquetar mediante `ignore_index=255`.
- No soporta generacion de texto, tool calling, agentes, ni capacidades multimodales mas alla de la segmentacion de imagenes.
- No se especifican capacidades multilingues ni de razonamiento; es un modelo puramente visual.

## Casos de uso

- Mapeo de uso del suelo urbano: el modelo clasifica teselas de imagenes satelitales del valle de Katmandú, permitiendo generar mapas actualizados de zonas residenciales, carreteras, rios, bosques, terrenos baldios y areas agricolas. Adecuado por su entrenamiento especifico en la region.
- Planificacion territorial y urbana: los mapas de cobertura del suelo resultantes pueden alimentar sistemas de informacion geografica (SIG) para detectar expansion urbana, identificar asentamientos informales o evaluar la presion sobre zonas verdes.
- Monitoreo ambiental: el seguimiento temporal de clases como bosque o rio permite detectar deforestacion, cambios en cauces o perdida de suelo agricola.
- Gestion de riesgos naturales: conocer la distribucion de carreteras, rios y zonas residenciales ayuda a modelar inundaciones o deslizamientos en el valle.
- Investigacion en teledeteccion con datos sinteticos: el modelo sirve como referencia para evaluar la utilidad de datos sinteticos en segmentacion semantica, ya que se entrena con una mezcla real-sintetica y se valida con datos reales puros.
- Generacion de datos de entrenamiento para otros modelos: las predicciones de este modelo podrian usarse como pseudo-etiquetas o para aumentar datasets en tareas relacionadas de la serie GeoNUSAF.

## Benchmarks y rendimiento

Resultados de validacion sobre 136 teselas reales del fold 1 (sin píxeles sinteticos):

| Metrica | Valor |
|---|---|
| mIoU | 0.4515 |
| mF1 | 0.5835 |
| OA (precision global) | 0.7738 |
| Kappa | 0.6217 |

Metricas por clase (IoU / F1):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0.8092 | 0.8945 |
| Road | 0.3142 | 0.4781 |
| River | 0.1181 | 0.2113 |
| Forest | 0.6622 | 0.7968 |
| UnusedLand | 0.2636 | 0.4173 |
| Agricultural | 0.5417 | 0.7027 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Con 12,46 millones de parametros, el modelo es muy ligero y cabe en cualquier GPU consumer (por ejemplo, NVIDIA GTX 1060 con 6 GB o superior) e incluso en CPU para inferencia a baja resolucion.
- VRAM estimada: menos de 1 GB para inferencia con batch de 1 a resoluciones tipicas de tesela (por ejemplo, 256x256 o 512x512). No se requieren GPUs de datacenter.
- Despliegue recomendado: puede usarse directamente con `segmentation-models-pytorch` en Python, o exportarse a ONNX o TorchScript para integracion en aplicaciones. No se menciona soporte para vLLM, Ollama o TGI (no aplica a modelos de vision).
- Latencia: no disponible en la informacion, pero dado el tamano del modelo, se espera inferencia en milisegundos en GPU moderna.

## Comparativa con modelos similares

No se dispone de datos de comparacion con otras arquitecturas (por ejemplo, DeepLabV3, PSPNet, o UNet con otros encoders) en la informacion proporcionada. El proyecto incluye variantes como `geonusaf-s4-unet-r18-R0-block-fold1` (con 0 sinteticos) y `geonusaf-s4-unetformer-r18-R0-block-fold1` (con encoder UNetFormer), pero no se han publicado metricas comparativas en esta ficha. Se recomienda consultar el repositorio del autor para futuras actualizaciones.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para el valle de Katmandú; su rendimiento en otras regiones geograficas o con otros estilos de imagen (diferentes sensores, resoluciones o condiciones atmosfericas) no esta garantizado.
- Las clases desbalanceadas muestran resultados muy desiguales: la clase "River" tiene un IoU de solo 0.1181, lo que indica dificultad para segmentar cauces de agua. La clase "Road" tambien presenta bajo rendimiento (IoU 0.3142).
- El uso de datos sinteticos en el entrenamiento puede introducir sesgos que no se manifiestan en validacion real, pero que podrian afectar la generalizacion a nuevos escenarios.
- La licencia no esta especificada; no se puede confirmar si el modelo puede usarse comercialmente. Contactar con el autor antes de cualquier uso en produccion.
- No se proporcionan pesos cuantizados ni formatos optimizados para despliegue ligero; el repo contiene los pesos completos (3.0 GB).
- No hay informacion sobre la composicion exacta del dataset sintetico ni sobre posibles artefactos de generacion (por ejemplo, errores de etiquetado en los pares sinteticos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-s4-unet-r18-R1-block-fold1
- Variante R0 del mismo fold: https://huggingface.co/Pranilllllll/geonusaf-s4-unet-r18-R0-block-fold1
- Variante UNetFormer R0 del mismo fold: https://huggingface.co/Pranilllllll/geonusaf-s4-unetformer-r18-R0-block-fold1
