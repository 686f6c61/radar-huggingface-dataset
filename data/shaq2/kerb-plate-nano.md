# Shaq2/kerb-plate-nano

## Resumen

Kerb Plate Nano es un detector de matrículas de vehículos disenado para ejecutarse en el propio dispositivo (on-device), desarrollado por el usuario Shaq2 dentro del proyecto Kerb. Se trata de un fine-tuning del detector de objetos RF-DETR Nano sobre un conjunto de datos multi-region de matrículas, exportado a ExecuTorch (`.pte`) con el backend XNNPACK para su uso en `react-native-executorch`. Su proposito no es leer el texto de la matrícula (no es un sistema OCR/ALPR), sino localizar la region de la matrícula para que el telefono pueda difuminarla antes de que cualquier recorte abandone el dispositivo.

El modelo forma parte de la familia de detectores `SensitiveRegionDetector` del proyecto Kerb y es relevante por su enfoque de privacidad: procesa la imagen localmente, con un contrato de entrada fijo de `[1,3,512,512]` con normalizacion ImageNet y salidas de cajas, puntuaciones y clases en float32. El repositorio ocupa 0,5 GB e incluye tanto el artefacto canonico para React Native como el ONNX usado en la evaluacion y el checkpoint de entrenamiento.

La evaluacion reportada por el autor sobre un conjunto de test retenido (13.881 imagenes, semilla 20261116) arroja un mAP50 global de 0,8014 sobre una unica clase `plate`, con variacion notable segun la fuente de datos (desde 0,6130 hasta 0,9091). La licencia es "other" y arrastra obligaciones de atribucion derivadas de los datasets upstream utilizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Nano (transformer detector, fine-tuned) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada `[1,3,512,512]`) |
| Tipos de cuantizacion | no disponible (export XNNPACK en `.pte`; el autor no detalla variantes) |
| Idiomas soportados | no disponible (no procesa texto; salida limitada a cajas/clases) |
| Licencia | other (con obligaciones de atribucion de los datasets upstream) |
| Formato de pesos | ExecuTorch `.pte` (XNNPACK), ONNX, checkpoint PyTorch `.pth` |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR Nano (version 1.12.1 de la libreria `rfdetr`), un detector de objetos basado en transformer con salida de consultas (queries) que produce cajas y logits de clase. Se ha realizado un fine-tuning sobre un stack multi-region de matrículas y se ha exportado a ExecuTorch con el backend XNNPACK para inferencia en movil mediante `react-native-executorch`. El repositorio incluye dos artefactos `.pte`: uno canonico que envuelve el contrato de React Native ExecuTorch (`boxes[N,4]` en formato xyxy normalizado, `scores[N]` y `classes[N]` en float32) y otro crudo que expone la salida nativa de RF-DETR (`dets[1,Q,4]` en formato cxcywh y `labels[1,Q,C]` como logits).

El entrenamiento utilizo un mix de datos de dominios y regiones diversas: `fareselmenshawii/large-license-plate-dataset` (CC0), `andrewmvd/car-plate-detection` (CC0), `aneesarom/rider-with-helmet-without-helmet-number-plate` (Apache-2.0), `amirhoseinahmadnejad/car-license-plate-detection-iran` (DbCL-1.0) y `adilshamim8/license-plate-recognition` (CC BY 4.0, aunque este ultimo no aporto anotaciones parseables). El split fue de 13.126 imagenes de entrenamiento, 1.305 de validacion y 13.881 de test, con una semilla fijada (golden_seed 20261116). No se detalla el numero de tokens ni si hubo etapas de RLHF/DPO, algo que no aplica a un detector de objetos. La innovacion principal es el empaquetado del modelo para inferencia local en React Native con un contrato de preprocesado y umbral pensados para maximizar el recall de privacidad.

## Capacidades

- Deteccion de matrículas de vehiculos en imagenes, con una unica clase `plate` (argmax indexado desde 0).
- Localizacion de regiones sensibles para difuminado previo a cualquier salida de la imagen del dispositivo.
- Inferencia on-device mediante ExecuTorch y XNNPACK, sin necesidad de conexion a red.
- Integracion con `react-native-executorch` mediante `ObjectDetectionModule.fromCustomModel`.
- Preprocesado configurable con normalizacion ImageNet (`normMean` y `normStd`).
- Umbral de deteccion ajustable (por defecto 0.3, priorizando recall sobre precision).
- Salida en dos formatos: contrato canonico RN-ET (cajas xyxy normalizadas, scores y clases) o salida cruda RF-DETR (cxcywh y logits).
- No realiza OCR ni lectura del texto de la matrícula.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no procesa texto).

## Casos de uso

- Difuminado de matrículas en aplicaciones de fotografia y video movil: el detector localiza la matrícula y la app aplica un desenfoque antes de subir o compartir la imagen, garantizando que el recorte nunca sale del dispositivo.
- Cumplimiento de privacidad en apps de denuncia ciudadana o reporte de incidencias: el usuario captura una imagen de un vehiculo y la app difumina la matrícula automaticamente antes de enviarla a un servidor.
- Procesamiento por lotes en galeria local: la app recorre la fototeca del telefono y aplica difuminado selectivo sobre las imagenes que contienen vehiculos, sin coste de subida ni de inferencia en la nube.
- Integracion en pipelines de vision para transporte y flotas: deteccion de presencia de matricula en imagenes capturadas por camaras de vehiculos, con procesamiento en el propio dispositivo para evitar transmitir datos sensibles.
- Moderacion de contenido generado por usuarios: una app de compraventa de vehiculos difumina automaticamente las matrículas de las fotos subidas antes de publicarlas.
- Prototipado rapido en React Native: el contrato canonico `.pte` y el ejemplo de uso con `ObjectDetectionModule` permiten integrar el detector en una app movil en pocas lineas, ideal para validar flujos de privacidad en entornos de desarrollo.
- Investigacion en deteccion on-device: el repositorio incluye el ONNX y el checkpoint, lo que permite reproducir la evaluacion retenida y comparar el rendimiento del export ExecuTorch frente al modelo original.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test retenido (13.881 imagenes, semilla 20261116, evaluacion ONNX a 512):

| Fuente | AP50 |
|---|---|
| car-license-plate-detection-iran (DbCL-1.0) | 0,9033 |
| rider-with-helmet-without-helmet-number-plate (Apache-2.0) | 0,9091 |
| car-plate-detection (CC0) | 0,7801 |
| large-license-plate-dataset (CC0) | 0,6130 |
| **mAP50 global** | **0,8014** |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un detector de objetos.

## Requisitos de hardware

- Inferencia orientada a movil: el artefacto canonico esta pensado para `react-native-executorch` con backend XNNPACK, por lo que el requisito principal es un dispositivo movil compatible con ExecuTorch.
- VRAM estimada para inferencia: no disponible; el autor no publica cifras de memoria. El tamano del repositorio (0,5 GB) incluye checkpoint, ONNX y `.pte`, no el peso en memoria en runtime.
- GPU recomendadas: no disponible para el artefacto movil. Para reproducir la evaluacion ONNX a 512 se requiere una GPU con capacidad suficiente para ejecutar RF-DETR Nano, pero el autor no especifica modelo concreto.
- Compatibilidad con GPU de consumo: no disponible; el modelo esta disenado para edge/movil, no para escritorio.
- Opciones de despliegue: ExecuTorch con XNNPACK (`.pte`) y `react-native-executorch`; ONNX para evaluacion; checkpoint PyTorch (`.pth`) para reentrenamiento o export.
- Latencia y throughput: no disponibles; no se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia cualitativa, el modelo se situa en la categoria de detectores de objetos ligeros para edge (tipo RF-DETR Nano, YOLO-nano o similares), pero no se han publicado comparativas numericas con alternativas en la documentacion disponible.

| Modelo | Parametros | Contexto | mAP50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kerb Plate Nano | no disponible | no aplica | 0,8014 (test retenido) | other | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un sistema OCR/ALPR: solo localiza matrículas, nunca lee el texto. No debe usarse para reconocimiento de matrículas.
- El recall sobre formas de matrícula inusuales u oclusiones esta acotado por el mix de entrenamiento; el autor lo advierte explicitamente.
- El umbral por defecto (0.3) prioriza recall sobre precision: genera falsos positivos a cambio de reducir el riesgo de fugas de privacidad. En produccion debe calibrarse segun el caso.
- La licencia es "other" y conlleva obligaciones de atribucion derivadas de los datasets upstream (DbCL-1.0, Apache-2.0, CC0, CC BY 4.0); es necesario revisar `SOURCES.md` antes de redistribuir.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validacion externa por parte de la comunidad.
- Sesgos conocidos: no documentados por el autor; la diversidad regional del dataset es limitada a las fuentes incluidas (Iran, y otros conjuntos publicos), por lo que el rendimiento puede degradarse en regiones no representadas.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si en forma de detecciones falsas (cajas sobre regiones que no son matrículas).
- No se detallan limitaciones de idioma porque el modelo no procesa texto.
- Para uso en produccion se recomienda validar el `.pte` en los dispositivos objetivo y medir latencia, ya que el autor no publica cifras de rendimiento en runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shaq2/kerb-plate-nano
- Repositorio del proyecto Kerb: https://github.com/MRSHAKILS/Kerb
- Libreria rfdetr (version 1.12.1): no disponible enlace directo en la informacion proporcionada
- Dataset `fareselmenshawii/large-license-plate-dataset` (CC0): no disponible enlace directo en la informacion proporcionada
- Dataset `andrewmvd/car-plate-detection` (CC0): no disponible enlace directo en la informacion proporcionada
- Dataset `aneesarom/rider-with-helmet-without-helmet-number-plate` (Apache-2.0): no disponible enlace directo en la informacion proporcionada
- Dataset `amirhoseinahmadnejad/car-license-plate-detection-iran` (DbCL-1.0): no disponible enlace directo en la informacion proporcionada
- Dataset `adilshamim8/license-plate-recognition` (CC BY 4.0): no disponible enlace directo en la informacion proporcionada
- Documento `SOURCES.md` con licencias y atribuciones: no disponible enlace directo en la informacion proporcionada
