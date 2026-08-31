# milkyroad/convnext-seg

## Resumen

El modelo `milkyroad/convnext-seg` es un sistema de segmentación semántica binaria desarrollado por el usuario milkyroad para localizar el anillo del campo de visión en imágenes de cistoscopia. Su propósito es identificar con precisión la región circular que delimita el área visible del endoscopio, lo que permite normalizar el recorte de la imagen en un pipeline de preprocesamiento para un benchmark denominado "G". Está construido sobre un backbone ConvNeXt-Tiny (variante `convnext_tiny.fb_in22k_ft_in1k` de timm) con un decodificador FPN (Feature Pyramid Network), y se entrena con una combinación de pérdida Dice y entropía cruzada.

El modelo se distribuye bajo licencia Creative Commons Attribution-ShareAlike 4.0 (cc-by-sa-4.0) y está disponible en Hugging Face con un tamaño de repositorio de 0,1 GB. Aunque no se especifican los parámetros totales, la arquitectura ConvNeXt-Tiny suele rondar los 28 millones de parámetros, pero este dato no está confirmado en la documentación. La relevancia actual radica en su aplicación médica concreta: la segmentación de anillos de campo de visión en cistoscopia, una tarea de preprocesamiento que mejora la robustez de modelos de diagnóstico asistido por imagen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (timm `convnext_tiny.fb_in22k_ft_in1k`, features_only) + decodificador FPN |
| Parametros totales | No disponible (estimación típica de ConvNeXt-Tiny: ~28M, no confirmado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen 384x384 píxeles) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | PyTorch (.pt, checkpoint `best_model.pt`) |

## Arquitectura y entrenamiento

El modelo combina un backbone ConvNeXt-Tiny preentrenado en ImageNet-22k y fine-tuned en ImageNet-1k, configurado para extraer características multiescala (`features_only`), con un decodificador FPN que fusiona dichas características para producir una máscara de segmentación binaria. La salida son logits de forma `[1, 2, H, W]`, donde el canal 1 (argmax) corresponde al campo de visión del cistoscopio.

El entrenamiento se realizó con 340 imágenes de 35 pacientes, redimensionadas a 384x384 píxeles, con un batch size de 32, optimizador AdamW (lr 1e-4, weight decay 0.01) y una pérdida combinada Dice + entropía cruzada. Se utilizó una semilla fija (seed 42) para reproducibilidad. La validación se hizo con 49 imágenes de 8 pacientes, con separación estricta por paciente (patient-disjoint) para evitar fugas de datos. El mejor checkpoint se guardó en la época 23 con un Dice de 0.9037.

## Capacidades

- Segmentación semántica binaria de imágenes médicas, específicamente para localizar el anillo del campo de visión en cistoscopia.
- Generación de máscaras de probabilidad (logits) que permiten extraer la región circular del endoscopio.
- Preprocesamiento de imágenes para normalización de recortes en pipelines de análisis de vídeo de cistoscopia.
- Integración sencilla en código Python mediante la clase `SegModel` y carga de pesos con `load_state_dict`.
- Funciona con tensores de entrada de tamaño 1x3x384x384 (imagen RGB normalizada).
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multimodal; es un modelo puramente visual y de tarea única.

## Casos de uso

- **Preprocesamiento en diagnóstico asistido por cistoscopia**: el modelo identifica el campo de visión real del endoscopio, permitiendo recortar la imagen y eliminar bordes negros o artefactos antes de alimentar a clasificadores o detectores de lesiones.
- **Normalización de datasets médicos**: en el benchmark "G" mencionado en la documentación, la segmentación del anillo se usa para estandarizar las imágenes de entrada, mejorando la consistencia entre pacientes y sesiones.
- **Segmentación de regiones anatómicas en vídeo**: al aplicar el modelo a cada fotograma de un vídeo de cistoscopia, se puede rastrear el movimiento del campo de visión y estabilizar la secuencia.
- **Investigación en endoscopia computarizada**: sirve como componente de referencia para comparar técnicas de segmentación de campo de visión en entornos clínicos.
- **Entrenamiento de modelos downstream**: las máscaras generadas pueden usarse como anotaciones automáticas para entrenar otros modelos de segmentación o clasificación en el dominio urológico.
- **Evaluación de calidad de imagen**: la precisión del anillo detectado puede correlacionarse con la calidad de la imagen endoscópica, ayudando a filtrar fotogramas borrosos o fuera de foco.

## Benchmarks y rendimiento

Los resultados de validación reportados en la model card son los siguientes:

| Métrica | Valor |
|---|---|
| Dice (mejor época, época 23) | 0.9037 |
| Dice (final) | 0.8990 |
| IoU (final) | 0.8165 |

Estos valores se obtuvieron sobre 49 imágenes de 8 pacientes, con separación por paciente. No se proporcionan comparaciones con otros modelos en la documentación disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la documentación.
- Dado el tamaño del repositorio (0,1 GB) y la arquitectura ConvNeXt-Tiny, se espera que el modelo sea ligero y pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero este dato no está confirmado.
- El checkpoint se carga en memoria con PyTorch; no se mencionan opciones de despliegue como vLLM, Ollama o TGI, que son específicas para modelos de lenguaje.
- Para inferencia en lote sobre vídeos, una GPU con al menos 4 GB de VRAM sería suficiente en teoría, pero no hay datos oficiales de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede realizar una comparativa objetiva con otras arquitecturas de segmentación médica (como U-Net, DeepLab o Swin-UperNet) sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para segmentación de anillo de campo de visión en cistoscopia; no es generalizable a otros dominios médicos sin reentrenamiento.
- El conjunto de entrenamiento es reducido (340 imágenes de 35 pacientes), lo que puede limitar la robustez frente a variaciones de iluminación, equipo endoscópico o anatomía.
- No se reportan análisis de sesgos por edad, sexo o etnia de los pacientes; podría haber sesgos implícitos en los datos de entrenamiento.
- La licencia cc-by-sa-4.0 permite uso comercial, pero exige atribución y que las obras derivadas se compartan bajo la misma licencia. Esto puede ser restrictivo para integraciones en productos propietarios.
- El código de entrenamiento contiene rutas sanitizadas (`<PROJECT_ROOT>`, `<HF_CACHE>`) que deben ajustarse antes de su uso.
- No se proporcionan garantías de precisión clínica; el modelo es una herramienta de investigación y no un dispositivo médico certificado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/milkyroad/convnext-seg)
- [Documentación de ConvNeXt en Hugging Face](https://huggingface.co/docs/transformers/model_doc/convnext)
- [Repositorio oficial de ConvNeXt (Facebook Research)](https://github.com/facebookresearch/ConvNeXt)
- [Configuración de ConvNeXt en MMSegmentation para segmentación médica](https://github.com/haoshao-nku/medical_seg/blob/master/mmsegmentation/configs/convnext/README.md)
- [Artículo divulgativo sobre ConvNeXt en GeeksforGeeks](https://www.geeksforgeeks.org/computer-vision/convnext/)
