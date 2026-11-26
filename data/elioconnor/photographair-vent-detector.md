# elioconnor/photographair-vent-detector

## Resumen

PhotographAir Vent Detector es un modelo de deteccion de objetos especializado en localizar rejillas y difusores de ventilacion en interiores (difusores de techo, rejillas de retorno, ranuras largas y rejillas de pared) a partir de fotografias de camara. Lo desarrolla el autor elioconnor en el contexto de PhotographAir, una aplicacion de investigacion para iPad de la Universidad de Wisconsin-Madison orientada a documentar estancias para el muestreo de calidad del aire interior. El modelo es un fine-tuning de RF-DETR Nano de Roboflow sobre una unica clase (`vent`), exportado a Core ML en precision float16 con un tamano aproximado de 52 MB.

Su relevancia radica en el despliegue en dispositivo: al ejecutarse de forma nativa en iOS/iPadOS mediante Core ML, procesa cada foto en torno a 30 ms en un iPad, lo que permite escanear una habitacion en tiempo real sin enviar imagenes a la nube. Esto encaja con casos de uso de diagnostico de HVAC, auditoria energetica y monitorizacion de calidad del aire en edificios, donde la privacidad y la latencia importan.

El modelo es muy compacto (derivado de la variante "nano" de RF-DETR), esta liberado bajo licencia Apache 2.0 y se distribuye como paquete Core ML. La informacion publica no detalla el numero exacto de parametros, la longitud de contexto (no aplica a un detector) ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Nano (detector transformer DETR) fine-tuneado a una clase |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos) |
| Tipos de cuantizacion | float16 (pesos exportados a Core ML) |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`PhotographAirVentDetector.mlpackage`, float16, ~52 MB) |

## Arquitectura y entrenamiento

El modelo parte de RF-DETR Nano, un detector basado en arquitectura transformer tipo DETR (prediccion directa de cajas y logits por consulta, sin anclas ni NMS tradicional) y lo especializa a una unica clase: `vent`. La entrada se preprocesa redimensionando cada foto a 384x384 con interpolacion bilineal, escalando a rango 0-1 y normalizando con media (0.485, 0.456, 0.406) y desviacion tipica (0.229, 0.224, 0.225) en orden NCHW. La salida son `pred_boxes` (centro x, centro y, ancho y alto como fracciones de la foto) y `pred_logits` (una puntuacion por consulta antes de sigmoide).

El entrenamiento uso exclusivamente fotos publicas con licencias permisivas y fotos propias del laboratorio: imagenes de Open Images con rejillas (fotos CC BY 2.0 con etiquetas CC BY 4.0), imagenes de COCO con licencia CC BY o sin copyright conocido, y fotos de escaneo tomadas por el equipo en visitas de muestreo en tres ciudades. Las cajas de ventilacion se generaron inicialmente con OWLv2 y luego fueron revisadas y corregidas manualmente con ayuda de Claude y ChatGPT. Para la evaluacion se entrenaron tres copias adicionales del modelo dejando fuera una ciudad cada vez, de modo que cada copia se probo solo en la ciudad no vista. No se detalla el numero de tokens ni el volumen exacto del dataset.

## Capacidades

- Deteccion de objetos de una unica clase: localiza rejillas y difusores de ventilacion (difusores de techo, rejillas de retorno, ranuras largas y rejillas de pared) en fotografias.
- Salida de cajas delimitadoras con puntuacion de confianza por consulta, filtrable mediante umbral (la app usa 0.5).
- Inferencia en dispositivo en iOS/iPadOS mediante Core ML, con latencia de aproximadamente 30 ms por foto en iPad.
- Preprocesamiento y postprocesamiento documentados y centralizados en `preprocessing.json`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un detector visual puro.
- No tiene capacidades multilingues, de generacion de texto, vision general, audio ni modo "thinking".

## Casos de uso

- Escaneo de habitaciones para muestreo de calidad del aire: la app PhotographAir usa el modelo para localizar rejillas mientras el usuario recorre una sala con el iPad, y una caja solo se convierte en ventilacion sugerida cuando el modelo la detecta en al menos dos fotos del escaneo, lo que reduce falsos positivos puntuales.
- Auditoria de HVAC en edificios: un tecnico puede fotografiar estancias y obtener automaticamente la ubicacion de difusores y rejillas para documentar la instalacion sin anotacion manual.
- Diagnostico de flujo de aire y confort termico: al conocer donde estan las rejillas, se puede planificar donde colocar sensores de calidad del aire o de temperatura, tal como motiva el propio autor del modelo.
- Inventario de activos de climatizacion: catalogar el numero y tipo de rejillas por estancia a partir de un barrido fotografico, util para mantenimiento preventivo y planos "as-built".
- Aplicaciones moviles de eficiencia energetica: integracion en apps de iOS/iPadOS que asesoren sobre ventilacion y renovacion de aire, aprovechando la inferencia local sin subir imagenes a la nube.
- Documentacion de edificios en campo sin conectividad: al ejecutarse en dispositivo y ocupar unos 52 MB, funciona en ubicaciones sin red, algo relevante en visitas de inspeccion.
- Prototipado de vision por computador en Apple Silicon: sirve como ejemplo de pipeline completo Core ML (preprocesado, inferencia y filtrado) para equipos que quieran adaptar detectores DETR a otras clases de objetos del hogar.

## Benchmarks y rendimiento

El autor compara el modelo con cuatro detectores generales guiados por texto (OWLv2 base, OWLv2 large, Grounding DINO y Florence-2) sobre las mismas 765 fotos de test (escaneos propios de Cancun, Guatemala City y Toronto, 14 escaneos, 21 ventilaciones fisicas y 60 apariciones). La metrica cuenta apariciones de ventilacion encontradas (de 60) y ventilaciones fisicas encontradas (de 21) a un presupuesto fijo de cajas erroneas por cada 100 fotos. Una aparicion cuenta como encontrada si la caja solapa al menos 0,3 de IoU; una caja que solapa menos de 0,1 con cualquier ventilacion cuenta como erronea.

| Cajas erroneas por 100 fotos | Este modelo (apariciones, fisicas) | OWLv2 base | OWLv2 large | Grounding DINO |
|---|---|---|---|---|
| 1 | 30, 7 | 24, 6 | 11, 2 | 0, 0 |
| 2 | 39, 10 | 30, 7 | 26, 5 | 0, 0 |
| 5 | 44, 13 | 35, 10 | 33, 8 | 0, 0 |
| 10 | 48, 16 | 41, 12 | 40, 11 | 8, 1 |

Florence-2 no aparece en la tabla porque no ofrece puntuacion de confianza para sus cajas: encuentra 43 apariciones mientras dibuja aproximadamente 107 cajas erroneas por cada 100 fotos. Los modelos generales tardaron entre 1 y 2 segundos por foto en un Mac de sobremesa, frente a los aproximadamente 30 ms del modelo en un iPad. El autor advierte que el test es pequeno y que la ventaja sobre OWLv2 se mantuvo en aproximadamente 80-95 de cada 100 remuestreos aleatorios del conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el paquete Core ML float16 ocupa unos 52 MB, por lo que el consumo de memoria es muy bajo y apto para dispositivos moviles.
- GPU recomendadas: no requiere GPU de escritorio; esta pensado para la Neural Engine y GPU integrada de chips Apple (iPad y iPhone compatibles con Core ML). Para evaluacion en escritorio, un Mac con Apple Silicon es suficiente.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y en iPads/iPhones modernos; tambien podria ejecutarse en GPUs de consumo via conversion a otro runtime, aunque no se documenta ese camino.
- Opciones de despliegue: Core ML (Vision/Core ML en iOS/iPadOS). No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 30 ms por foto en iPad; los modelos generales comparados tardan 1-2 s por foto en un Mac de sobremesa.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| PhotographAir Vent Detector | Detector DETR especializado (1 clase) | no disponible (RF-DETR Nano) | no aplica | Apache 2.0 | Core ML en Hugging Face | ~52 MB, ~30 ms/foto en iPad |
| OWLv2 base | Detector abierto guiado por texto | no disponible | no aplica | no disponible en la informacion | Hugging Face | ~1-2 s/foto en Mac; menor recall a igual presupuesto de falsos positivos |
| OWLv2 large | Detector abierto guiado por texto | no disponible | no aplica | no disponible en la informacion | Hugging Face | Mas preciso que base en algunos umbrales, pero por detras del modelo especializado |
| Grounding DINO | Detector abierto guiado por texto | no disponible | no aplica | no disponible en la informacion | Hugging Face | Muy conservador: 0 detecciones a presupuestos bajos de falsos positivos |
| Florence-2 large | Modelo vision-lenguaje multitarea | no disponible | no aplica | no disponible en la informacion | Hugging Face | Sin puntuacion de confianza; ~107 cajas erroneas por 100 fotos |

## Limitaciones y advertencias

- Modelo de una unica clase: solo detecta ventilaciones; no reconoce otros objetos ni proporciona descripciones textuales.
- Conjunto de evaluacion pequeno (14 escaneos, 21 ventilaciones fisicas, 60 apariciones), por lo que las metricas tienen alta varianza; el propio autor reporta que la ventaja sobre OWLv2 se mantiene en el 80-95 % de remuestreos.
- Rendimiento dependiente del dominio: entrenado con fotos de tres ciudades y con anotaciones asistidas por IA y revisadas por personas; puede degradarse en tipos de rejilla, iluminacion o angulos no representados.
- Posibles sesgos de los datos de origen (Open Images, COCO y fotos del laboratorio) en cuanto a geografia, tipo de edificio y condiciones de captura.
- Riesgo de falsos positivos en patrones visuales similares a rejillas (persianas, rejillas de altavoces, mosaicos); la app mitiga parte de ello exigiendo deteccion en al menos dos fotos del escaneo.
- No apto para uso como unico criterio en decisiones criticas de seguridad o cumplimiento normativo de HVAC sin revision humana.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datos de origen (Open Images CC BY 2.0 / etiquetas CC BY 4.0, COCO CC BY o sin copyright) si se redistribuye el modelo o derivados.
- Dependencia del ecosistema Apple: el formato Core ML limita el despliegue fuera de iOS/iPadOS/macOS sin conversion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elioconnor/photographair-vent-detector
- Modelo base RF-DETR Nano: https://huggingface.co/Roboflow/rf-detr-nano
- Video explicativo del grafico de resultados: https://huggingface.co/elioconnor/photographair-vent-detector/resolve/main/photographair-vent-graph.mp4
- Open Images: https://storage.googleapis.com/openimages/web/index.html
- COCO: https://cocodataset.org
- OWLv2 base: https://huggingface.co/google/owlv2-base-patch16-ensemble
- OWLv2 large: https://huggingface.co/google/owlv2-large-patch14-ensemble
- Grounding DINO: https://huggingface.co/IDEA-Research/grounding-dino-base
- Florence-2 large: https://huggingface.co/florence-community/Florence-2-large
