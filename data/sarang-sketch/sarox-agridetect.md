# sarang-sketch/sarox-agriDetect

## Resumen

Sarox AgriDetector (sarang-sketch/sarox-agriDetect) es un modelo de clasificacion de imagenes especializado en agricultura, desarrollado por el autor sarang-sketch y publicado en HuggingFace bajo licencia Apache 2.0. Su objetivo es identificar el cultivo, la parte de la planta y su estado sanitario (enfermedad, plaga o planta sana) a partir de una fotografia, cubriendo 133 condiciones distintas en 26 cultivos y 6 partes de la planta. El modelo se denomina internamente Sarox Plangton 2.0 y es una version cuantizada a ONNX del modelo base timm/repvit_m0_9.dist_450e_in1k.

Su relevancia radica en que es un modelo extremadamente ligero: 4,77 millones de parametros y un unico archivo ONNX de 19,5 MB que se ejecuta en CPU ordinarias o incluso dentro del navegador con ONNX Runtime Web, sin necesidad de PyTorch ni GPU. Esto lo hace idoneo para despliegues en campo, dispositivos de bajos recursos y aplicaciones web con privacidad local (las fotos nunca se suben a un servidor). Incluye ademas mecanismos de abstencion: rechaza fotos no relacionadas con agricultura y emite respuestas "no seguro" cuando la confianza es baja, algo poco habitual en clasificadores de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RepViT (transformer hibrido convolucional-attention, variante m0_9) |
| Parametros totales | 4,77 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision) |
| Tipos de cuantizacion | Cuantizado para exportacion a ONNX (detalle exacto no disponible) |
| Idiomas soportados | no disponible (modelo de clasificacion de imagenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivo unico de 19,5 MB) |

## Arquitectura y entrenamiento

El modelo parte de RepViT m0_9, una arquitectura hibrida que combina bloques convolucionales con mecanismos de atencion, disenada para ser eficiente en dispositivos con recursos limitados. El checkpoint base es timm/repvit_m0_9.dist_450e_in1k, preentrenado en ImageNet-1k durante 450 epocas con destilacion, y posteriormente afinado por el autor para la tarea de deteccion de enfermedades en cultivos. La version publicada es una exportacion a ONNX en la que se han fusionado capas para optimizar la inferencia; el autor verifica que esta fusion solo desplaza marginalmente algunas fotos borderline respecto al modelo PyTorch original.

El conjunto de datos de evaluacion incluye 13.882 fotos etiquetadas nunca vistas en entrenamiento (10.787 de campo y 3.095 de laboratorio) mas 664 imagenes no relacionadas para la prueba de rechazo. El entrenamiento incorpora tecnicas de calibracion de confianza: escalado de temperatura (que reduce el error de calibracion de 0,022 a 0,006) y conjuntos conformales al 95% para ofrecer un conjunto de "condiciones posibles" por foto. Tambien incluye una puerta de rechazo de fotos desconocidas y un umbral de abstencion cuando la confianza es baja.

## Capacidades

- Clasificacion de 133 condiciones (enfermedades, plagas y plantas sanas) en 26 cultivos: arroz, trigo, tomate, maiz, patata, mango, coco, algodon, mandioca, anacardo, chile, cana de azucar, manzana, platano, citricos, vid, soja, berenjena, fresa y otros.
- Identificacion de 6 partes de la planta: hoja (102 clases), fruto, flor, tallo y tronco, raiz de trigo y planta completa.
- Evaluacion a nivel de planta completa: combina hasta 6 fotos de una misma planta (por ejemplo hoja, tallo y fruto) en un unico diagnostico con cultivo, probabilidad de sanidad y problemas probables, mediante la funcion `assess_plant`.
- Rechazo de imagenes no relacionadas: el 99,70% de fotos ajenas al dominio (personas, objetos, texturas, suelo) no reciben respuesta.
- Abstencion calibrada: si la confianza esta por debajo del umbral, devuelve estado `uncertain` en lugar de una clase incorrecta.
- Probabilidades calibradas mediante escalado de temperatura (ECE 0,006) y conjuntos conformales al 95% con cobertura del 95,87% y una media de 1,03 clases por foto.
- Marcado de baja fiabilidad (`low_trust_reason`) para tres clases con datos de entrenamiento debiles.
- Validacion de entrada robusta: rechaza archivos ilegibles, imagenes de mas de 40 megapixeles y proporciones de aspecto extremas (mas de 20:1) con `InvalidImageError`.
- Ejecucion en CPU o navegador (ONNX Runtime Web), sin dependencia de PyTorch ni GPU.

## Casos de uso

- Diagnostico sanitario de cultivos en campo: un agricultor o tecnico fotografía hojas, frutos o tallos y obtiene al instante el cultivo, la parte afectada y la condicion probable, con latencias de 7-35 ms por foto en CPU de portatil, ideal para apps moviles sin conexion.
- Aplicaciones web con privacidad: la demo de HuggingFace Spaces ejecuta el modelo con ONNX Runtime Web en el dispositivo del visitante, de modo que las fotos nunca se suben a un servidor; util para plataformas agronomicas con requisitos de privacidad de datos.
- APIs de asesoria agricola: la funcion de validacion de entrada con `InvalidImageError` (mapeable a HTTP 400) y los estados `success`/`uncertain`/`unknown` facilitan la integracion en servicios REST de diagnostico para cooperativas o extensionismo agrario.
- Vigilancia fitosanitaria a escala: dada su huella de 19,5 MB, puede desplegarse en dispositivos edge (Raspberry Pi, telefonos de gama baja) para monitorizacion continua de cultivos en zonas sin conectividad.
- Evaluacion multi-foto de plantas completas: combinar hasta 6 fotos de distintos organos de una planta en un diagnostico integrado, util en auditorias de viveros o inspecciones de calidad de cosecha.
- Sistemas de alerta temprana de plagas y enfermedades: cobertura destacada en cultivos de gran relevancia en la India y el sur global (arroz con 1.699 fotos de test, trigo con 1.754, tomate con 2.743, maiz con 1.290), adecuada para programas de proteccion de cultivos.
- Filtrado previo en pipelines de vision agricola: la puerta de rechazo de imagenes no agricolas permite usarlo como clasificador de primer nivel antes de modelos mas pesados de segmentacion o gravedad de enfermedad.

## Benchmarks y rendimiento

Datos de la model card del autor (conjunto de test reservado, 13.882 fotos):

| Metrica | Valor |
|---|---|
| Accuracy top-1 / top-3 | 94,59% / 99,04% |
| Macro-F1 (133 clases) | 92,77% |
| Macro-F1 fotos de campo / laboratorio | 91,22% / 98,72% |
| Accuracy cultivo / parte de planta / sano vs enfermo | 99,39% / 99,15% / 98,83% |
| Error de calibracion (ECE) | 0,022 (0,006 tras escalado de temperatura) |
| Respuestas emitidas / tasa de error entre ellas | 89,42% / 1,76% |
| Cobertura de conjuntos conformales al 95% | 95,87% (1,03 clases de media) |
| Imagenes no relacionadas sin respuesta | 99,70% |

Rendimiento por parte de la planta (accuracy / macro-F1): hoja 94,6% / 93,3%; fruto 92,5% / 91,1%; flor 94,8% / 96,2%; tallo 97,0% / 96,6%; raiz 70,1% / 82,4%; planta completa 97,3% / 95,3%.

Clases mas debiles (F1): mancha tan del trigo 52,9%, roña de la manzana 62,1%, soja sana 66,7%, tizón foliar del trigo 68,3%, roya del cedro en manzana 71,0%, roya del tallo del trigo 71,8%, podredumbre radicular comun del trigo 74,9%.

No hay comparacion directa publicada con otros modelos de referencia en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se realiza en CPU. El modelo ocupa 19,5 MB de memoria.
- GPU recomendadas: no necesarias; cualquier CPU de portatil o de escritorio es suficiente.
- Consumer GPUs: cabe sobradamente en cualquier GPU moderna si se desea acelerar con ONNX Runtime, aunque no es necesario.
- Latencia: aproximadamente 7-35 ms por foto en CPU de portatil segun la model card.
- Despliegue: ONNX Runtime (Python 3.11-3.14, con onnxruntime, numpy y pillow), ONNX Runtime Web en navegador, y script de linea de comandos `inference.py`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicable, al ser un modelo de vision en ONNX).
- Dependencias minimas: sin PyTorch; el paquete completo se descarga desde HuggingFace Hub con `snapshot_download`.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Dominio | Licencia |
|---|---|---|---|---|
| sarang-sketch/sarox-agriDetect | 4,77 M | ONNX (19,5 MB) | 133 condiciones, 26 cultivos | Apache 2.0 |
| timm/repvit_m0_9.dist_450e_in1k (base) | ~4,8 M | safetensors | ImageNet-1k (1000 clases genericas) | Apache 2.0 |
| Modelos PlantVillage tipicos (ResNet/EfficientNet afinados) | 5-25 M (estimacion) | PyTorch | ~38-39 clases, hojas mayoritariamente | variable |

No se han publicado comparaciones cuantitativas directas con alternativas en la informacion disponible. Como referencia cualitativa: frente a clasificadores clasicos basados en PlantVillage, sarox-agriDetect ofrece mas clases (133 frente a ~38), cobertura de mas organos de la planta, mecanismos de abstencion y calibracion, y exportacion ligera a ONNX lista para navegador y edge.

## Limitaciones y advertencias

- Rendimiento debil en trigo: varias clases de trigo presentan los F1 mas bajos del modelo (mancha tan 52,9%, tizón foliar 68,3%, roya del tallo 71,8%, podredumbre radicular 74,9%), y la accuracy global del trigo es del 86,7%.
- Raiz con pocos datos: la parte "raiz" tiene accuracy de solo 70,1% con 87 fotos de test.
- Clases con muy pocas fotos de test: soja (10), cereza (9), arandano (17), calabaza (20), soja y fresa (14-18) tienen muestras de evaluacion muy pequenas, por lo que sus metricas tienen alta incertidumbre; tres clases se marcan explicitamente con `low_trust_reason` por datos de entrenamiento debiles.
- Riesgo de alucinacion mitigado pero no nulo: entre las respuestas emitidas, el 1,76% son incorrectas; el sistema prefiere abstenerse (solo responde en el 89,42% de los casos), lo que implica que aproximadamente el 10,6% de las fotos no obtienen diagnostico.
- Cobertura de cultivos limitada: 26 cultivos; fotos de cultivos fuera de esta lista seran rechazadas o marcadas como desconocidas.
- Sesgos geograficos y de origen de datos: la mezcla de fotos de campo y laboratorio produce diferencias de rendimiento (macro-F1 91,22% frente a 98,72%), y el etiquetado "india" en los tags sugiere un sesgo hacia condiciones y variedades del subcontinente indio.
- Restricciones de licencia: ninguna relevante; Apache 2.0 permite uso comercial con atribucion y aviso de licencia.
- Produccion: se recomienda fijar la version del modelo con `revision="<commit hash>"` en `snapshot_download` para garantizar reproducibilidad.
- La model card esta parcialmente truncada en la informacion disponible, por lo que algunos detalles de la API de salida (estados adicionales) no estan completamente documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sarang-sketch/sarox-agriDetect
- Demo interactiva (Space): https://huggingface.co/spaces/sarang-sketch/sarox-agriDetect
- Modelo base: https://huggingface.co/timm/repvit_m0_9.dist_450e_in1k
- Paper, repositorio de entrenamiento y otros enlaces: no disponibles en la informacion proporcionada.
