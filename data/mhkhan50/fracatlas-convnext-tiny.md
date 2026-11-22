# MHkhan50/fracatlas-convnext-tiny

## Resumen

FracAtlas ConvNeXt-Tiny es un clasificador de imagenes de fractura a nivel de imagen para radiografias osteomusculares de mano, pierna, cadera y hombro. Lo desarrolla Muzammal Hussain (MHkhan50) y deriva de un ajuste fino de `convnext_tiny.fb_in22k_ft_in1k` sobre el dataset FracAtlas, publicado por Abedeen et al. (2023) en Scientific Data. El repositorio incluye ademas un detector de cajas YOLO11s entrenado sobre el mismo split, ambos exportados a ONNX.

El modelo resuelve una tarea binaria de triaje: dada una radiografia, devuelve una probabilidad calibrada de fractura mediante sigmoid(logit / T) con T = 1.751 y un umbral de decision de 0.370 calculado con el indice de Youden sobre validacion. Incluye un mecanismo explicito de derivacion: si max(p, 1 - p) < 0.8, la imagen debe remitirse a un clinico en lugar de emitir una respuesta.

Es relevante como ejemplo de pipeline de investigacion reproducible y honesto en sus metricas: split documentado, seleccion de semilla por AUROC de validacion (0.941), test separado de 614 imagenes y comparacion contra baselines CNN pequena, DINOv2-S con sonda congelada y DINOv2-S ajustado. El autor declara explicitamente que no es un dispositivo medico y que su uso es solo de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (clasificador) + YOLO11s (detector), exportados a ONNX |
| Parametros totales | no disponible (ConvNeXt-Tiny tiene ~28 M; el dato no se indica en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 384 x 384 en el clasificador, 640 x 640 en el detector) |
| Tipos de cuantizacion | no disponible (solo se publican pesos ONNX y state_dict en PyTorch) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT (pesos); dataset FracAtlas bajo CC BY 4.0 |
| Formato de pesos | ONNX (`convnext_tiny_fracatlas.onnx`, `yolo11s_fracatlas.onnx`) y PyTorch `state_dict` (`convnext_tiny_fracatlas.pt`) |

## Arquitectura y entrenamiento

El clasificador es una ConvNeXt-Tiny inicializada desde `convnext_tiny.fb_in22k_ft_in1k` (pesos ImageNet-22k ajustados en ImageNet-1k) y reentrenada con `num_classes=1` sobre FracAtlas. El preprocesado convierte a escala de grises, redimensiona el lado mayor a 384 px manteniendo aspecto, rellena con negro centrado hasta 384 x 384, escala a [0, 1], replica a tres canales y normaliza con media y desviacion tipica de ImageNet. La salida es un unico logit que se calibra con temperature scaling (T = 1.751). El detector es un YOLO11s entrenado sobre el mismo split, con entrada 640 x 640 y salida [1, 5, N] (cx, cy, w, h, score) que requiere NMS aplicado por el usuario.

No se especifica en la informacion disponible el numero de tokens ni la composicion exacta del dataset de entrenamiento mas alla de FracAtlas. Se documenta que la semilla publicada es la semilla 1 de tres, elegida por AUROC de validacion (0.941) sin tocar el test. La exportacion ONNX coincide con PyTorch con una diferencia absoluta maxima de 3.0e-06 sobre entradas aleatorias. No se menciona RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un modelo de clasificacion de imagen.

## Capacidades

- Clasificacion binaria de fractura a nivel de imagen en radiografias de mano, pierna, cadera y hombro.
- Salida de probabilidad calibrada (temperature scaling) con umbral de decision fijado en validacion.
- Mecanismo de derivacion por baja confianza: si max(p, 1 - p) < 0.8, el sistema indica que la imagen debe revisarse por un clinico.
- Deteccion de cajas de fractura con YOLO11s (mAP@0.5 = 0.321 en test), menos fiable que la puntuacion del clasificador.
- Inferencia via ONNX Runtime y via PyTorch/timm con los mismos pesos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision y clasificacion.

## Casos de uso

- Triaje previo en investigacion radiologica: usar la probabilidad calibrada para priorizar revision de estudios con alta puntuacion de fractura en un conjunto de investigacion, aprovechando el umbral de Youden (0.370) y la derivacion por baja confianza.
- Validacion de pipelines de vision medica: servir como baseline reproducible (AUROC 0.917 en test, ECE 0.050) frente al que comparar nuevos modelos o preprocesados.
- Deteccion asistida de fracturas en extremidades: aplicar el detector YOLO11s para localizar regiones candidatas y el clasificador para puntuar la imagen completa, combinando ambas senales en un flujo de investigacion.
- Docencia y formacion en IA medica: el repositorio incluye codigo, split, paper y comparativa completa, lo que lo hace util como caso de estudio de calibracion, seleccion de semilla y evaluacion honesta.
- Demo interactiva en navegador: la Space `fracture-xray-check` permite probar el modelo sobre imagenes de ejemplo sin infraestructura propia.
- Integracion en herramientas de anotacion: preetiquetar radiografias de un corpus de investigacion para acelerar la revision manual, con el clasificador como filtro y el detector como propuesta de cajas.
- Auditoria de robustez: evaluar como se degrada el modelo en hospitales, dispositivos o grupos de edad distintos de FracAtlas, dado que el autor advierte de que no hay validacion externa.

## Benchmarks y rendimiento

Resultados en el split de test reservado (614 imagenes, 109 con fractura), semilla publicada:

| Metrica | Valor |
|---|---|
| AUROC (semilla publicada) | 0.917 |
| Sensibilidad en umbral | 0.75 |
| Especificidad en umbral | 0.93 |
| Sensibilidad a 90% de especificidad | 0.77 |
| ECE tras temperature scaling | 0.050 |
| Imagenes derivadas por confianza < 0.8 | 14% |
| Detector, mAP@0.5 en test | 0.321 |

Comparativa de ensembles de tres semillas (logits promediados), AUROC en test con intervalos bootstrap del 95%:

| Modelo | AUROC [IC 95%] |
|---|---|
| Small CNN | 0.809 [0.763, 0.852] |
| ConvNeXt-Tiny | 0.928 [0.891, 0.957] |
| DINOv2-S frozen probe | 0.873 [0.833, 0.909] |
| DINOv2-S fine-tuned | 0.902 [0.865, 0.934] |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un ConvNeXt-Tiny a 384 x 384 en FP32 ocupa del orden de cientos de MB y el YOLO11s a 640 x 640 es igualmente ligero. No se publican cifras exactas en la model card.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien funciona en CPU con ONNX Runtime dado el tamano reducido del modelo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: ONNX Runtime (recomendado por el autor), PyTorch con timm para el clasificador, y el export ONNX de YOLO11s con NMS aplicado externamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | AUROC test (ensemble 3 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConvNeXt-Tiny (este) | ~28 M (no confirmado en la card) | 384 x 384 | 0.928 [0.891, 0.957] | MIT | ONNX + PyTorch en HF |
| Small CNN (baseline del paper) | no disponible | no disponible | 0.809 [0.763, 0.852] | no disponible | no disponible |
| DINOv2-S frozen probe | no disponible | no disponible | 0.873 [0.833, 0.909] | no disponible | no disponible |
| DINOv2-S fine-tuned | no disponible | no disponible | 0.902 [0.865, 0.934] | no disponible | no disponible |

## Limitaciones y advertencias

- No es un dispositivo medico: el autor declara uso exclusivo en investigacion y prohibe su uso en atencion al paciente.
- FracAtlas no incluye identificadores de paciente, por lo que el split es por imagen; imagenes del mismo paciente pueden aparecer en train y test, lo que puede inflar las metricas.
- Un unico dataset de tres hospitales de Bangladesh y sin validacion externa: se espera un rendimiento inferior en otros hospitales, dispositivos, poblacion pediatrica o partes del cuerpo no cubiertas.
- Cadera y hombro tienen pocas fracturas en test, por lo que las metricas por region son inciertas.
- Las cajas del detector son mucho menos fiables que la puntuacion del clasificador (mAP@0.5 = 0.321).
- Riesgo de alucinacion en el sentido de falsos negativos y falsos positivos: sensibilidad 0.75 implica que una de cada cuatro fracturas del test no se detecta en el umbral elegido.
- El umbral (0.370) y la temperatura (1.751) estan fijados sobre validacion; recalibrar si se cambia el dominio de aplicacion.
- Licencia MIT en los pesos, pero el dataset subyacente es CC BY 4.0 y debe atribuirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MHkhan50/fracatlas-convnext-tiny
- Repositorio del benchmark: https://github.com/MHKhan50/fracatlas-fracture-benchmark
- Demo en navegador: https://huggingface.co/spaces/MHkhan50/fracture-xray-check
- Paper del dataset FracAtlas: https://doi.org/10.1038/s41597-023-02432-4
- ORCID del autor: https://orcid.org/0009-0001-2570-5686
