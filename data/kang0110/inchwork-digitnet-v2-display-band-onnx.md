# kang0110/inchwork-digitnet-v2-display-band-onnx

## Resumen

DigitNet v2 display band ONNX es un clasificador de dígitos de siete segmentos empaquetado en formato ONNX y orientado a inferencia en CPU. Lo publica el usuario kang0110 (bajo la firma "寸作实验室") a partir de los pesos originales de DigitNet v2, desarrollados por Chakib Belgaid con licencia MIT. El modelo resuelve un problema acotado: dado un recorte de un dígito de una pantalla LCD de siete segmentos y el contexto de la banda de visualización completa, devuelve la clase 0-9 o la etiqueta "no dígito", con una puerta de confianza a 0,60.

La relevancia es práctica: se trata de un modelo diminuto (10.123 parámetros, 42.410 bytes de ONNX) que puede ejecutarse completamente offline en CPU, sin GPU ni conexión de red tras la preparación de dependencias. Está pensado como complemento de lectores de contadores (por ejemplo, medidores de presión arterial o contadores eléctricos) que ya disponen de detección de cajas de dígitos y necesitan rellenar lecturas que un clasificador principal ha rechazado.

La arquitectura concreta de la red no se detalla en la información disponible; únicamente se especifican los tensores de entrada (`uint8 [N,1,32,24]`) y salida (`[N,11]` probabilidades). El contexto de secuencia no aplica: es un clasificador por recorte, no un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de imagen por recorte; entrada `uint8 [N,1,32,24]`, salida `[N,11]`) |
| Parametros totales | 10.123 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador por recorte, sin contexto de secuencia) |
| Tipos de cuantizacion | no disponible (se distribuye un único ONNX de 42.410 bytes) |
| Idiomas soportados | no aplica (reconocimiento de dígitos, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`digitnet-v2.onnx`) |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna de la red más allá de su interfaz: recibe un tensor `uint8 [N,1,32,24]` donde 0 representa el fondo y 255 el trazo más profundo, y emite un vector `[N,11]` de probabilidades sobre las clases 0-9 más "no dígito". Solo se devuelve un dígito si la clase ganadora es una de las diez numéricas y su probabilidad es mayor o igual a 0,60; en caso contrario el resultado es nulo.

El entrenamiento original, según la model card, empleó 150.000 caracteres sintéticos individuales, con un conjunto de desarrollo real utilizado para ajustar el generador de datos y seleccionar la versión final. El autor del empaquetado mantiene los pesos fijos, los porta a ONNX, añade estimación de fondo sobre la banda de visualización completa, conserva la lectura principal aportada por el llamador y añade una entrada de fotografía, con una reevaluación offline. No se documentan fases de RLHF, DPO ni decodificación especulativa, que no tienen sentido en un clasificador de este tipo.

## Capacidades

- Clasificación de dígitos individuales de pantallas de siete segmentos (0-9) más una clase de rechazo "no dígito".
- Lectura de todos los recortes de una banda de visualización o solo de los que un reconocedor principal ha rechazado.
- Retorno del valor principal aportado por el llamador sin ejecutar inferencia (campo `primary` con valor 0-9).
- Estimación de fondo sobre la banda de visualización completa, lo que ayuda a conservar trazos que se perderían con recortes demasiado ajustados.
- Inferencia completamente offline en CPU tras la preparación de dependencias.
- Entrada de imagen local en JPEG o PNG, con coordenadas `xywh` en píxeles de la imagen original tras corrección EXIF.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador cerrado de 11 clases.

## Casos de uso

- Lectura de contadores de presión arterial: el modelo completa las lecturas de los dígitos de siete segmentos que el clasificador principal del dispositivo rechaza, manteniendo intactas las lecturas ya aceptadas.
- Digitalización de contadores eléctricos: sobre el conjunto YUVA EB v1, el modelo se evaluó en 904 cajas de dígitos de 156 fotografías de contadores, con 737 aciertos, 1 error y 166 rechazos en uso individual.
- Complemento de pipelines OCR existentes: se ejecuta únicamente sobre las cajas rechazadas por el lector principal; en la evaluación combinada con el clasificador ESP de referencia se obtuvieron 790 aciertos, 7 errores y 107 rechazos sobre las mismas 904 cajas.
- Despliegue en dispositivos de bajos recursos: con 42.410 bytes de ONNX y 10.123 parámetros, cabe en entornos embebidos o en CPU sin GPU, lo que permite integrarlo en herramientas de escritorio o utilidades de línea de comandos.
- Verificación de lecturas en entornos sin red: al funcionar offline tras la instalación, es adecuado para inspecciones de campo o plantas aisladas donde no hay conectividad.
- Procesamiento por lotes de fotografías de pantallas: la entrada `[N,1,32,24]` permite clasificar varias cajas en una sola pasada, útil para digitalizar archivos de imágenes de contadores.
- Control de calidad con abstención: la puerta de confianza a 0,60 y la clase "no dígito" permiten derivar casos dudosos a revisión humana en lugar de forzar una lectura.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto YUVA EB v1 (156 fotografías tras excluir 12 de prevalidación, 904 cajas de dígitos, geometría B por defecto con 15 % de margen por caja, lectura principal de referencia del clasificador ESP de un solo fotograma con umbral 0,80):

| Ruta sobre 904 cajas | Correctos | Errores | Rechazos |
|---|---:|---:|---:|
| DigitNet del paquete, en solitario | 737 | 1 | 166 |
| Clasificador ESP de referencia, en solitario | 707 | 7 | 190 |
| ESP de referencia + DigitNet solo en cajas rechazadas | 790 | 7 | 107 |

Datos adicionales de la model card:

| Prueba | Resultado |
|---|---|
| Criterio C preinscrito (ancho mediano de celda como límite inferior, combinado) | 791 correctos, 15 errores, 98 rechazos |
| Subconjunto de 12 fotografías de prevalidación con geometría B | 7 cajas corregidas, 1 error nuevo |
| Conjunto nativo de caracteres individuales (187 trazos extraídos, otra unidad de BP Log) | 186 correctos, 1 rechazo |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de texto, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU.
- GPU recomendadas: no aplica. Cualquier CPU capaz de ejecutar ONNX Runtime es suficiente.
- ¿Cabe en GPU de consumo? Sí, con un peso de 42.410 bytes es irrelevante a efectos de memoria; también cabe en dispositivos embebidos.
- Opciones de despliegue: ONNX Runtime (implícito en el paquete), con un script de ejemplo `digitnet_pilot.py` y dependencias instaladas vía `requirements.txt` en un entorno Python 3.12.
- Latencia y throughput: no disponibles. La model card indica que la velocidad en el hardware objetivo está pendiente de validación.
- Almacenamiento: el repositorio ocupa 0,0 GB según Hugging Face; el ZIP de ejemplo se distribuye desde ModelScope.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (904 cajas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DigitNet v2 display band ONNX (este) | 10.123 | no aplica | 737 correctos, 1 error, 166 rechazos en solitario | MIT | ONNX en Hugging Face y ModelScope |
| Clasificador ESP de referencia (Suikyoo meter-ocr) | no disponible | no aplica | 707 correctos, 7 errores, 190 rechazos | no disponible en la información | Firmware de referencia en GitHub |
| DigitNet v2 original (Chakib Belgaid) | no disponible | no aplica | no disponible de forma aislada en la información | MIT | Pesos y preprocesado en GitHub (bp-tracker) |

No se dispone de datos de otros clasificadores de siete segmentos comparables en la información proporcionada.

## Limitaciones y advertencias

- Requiere que el llamador aporte las posiciones de los dígitos; no incluye detección ni localización de cajas.
- El rendimiento se ha validado con recortes individuales; la localización, la votación entre fotogramas y la precisión sobre tableros completos en campo siguen sin validarse.
- La velocidad en el hardware objetivo no está medida.
- Los errores de la lectura principal aportada por el llamador se conservan tal cual; el modelo no los corrige.
- La evaluación combinada depende del clasificador principal usado; con otro lector hay que reevaluar la combinación sobre fotografías propias.
- En el subconjunto de 12 fotografías de prevalidación, la geometría B añadió 1 error nuevo además de corregir 7 cajas.
- Se desconocen el número de dispositivos físicos fotografiados y los miembros de entrenamiento de los pesos del clasificador ESP de referencia.
- Recortes demasiado ajustados pueden perder trazos; se recomienda conservar la banda de visualización completa para estimar el fondo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea cuando la probabilidad supera el umbral de 0,60; el modelo mitiga parcialmente con la clase de rechazo.
- Sesgos conocidos: no documentados en la información disponible; el entrenamiento con datos sintéticos puede no cubrir todas las variantes reales de pantallas y condiciones de iluminación.
- Licencia MIT: permite uso comercial y modificación, con la obligación habitual de conservar el aviso de copyright; conviene verificar la licencia de los pesos originales de DigitNet v2 y del firmware ESP de referencia si se combinan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kang0110/inchwork-digitnet-v2-display-band-onnx
- Modelo en ModelScope: https://modelscope.cn/models/nano0412/inchwork-digitnet-v2-display-band-onnx
- Paquete de ejemplo v0.1.0 (ZIP): https://modelscope.cn/models/nano0412/inchwork-digitnet-v2-display-band-onnx/resolve/v0.1.0/digitnet-display-band-cpu-v0.1.0.zip
- Foro de comentarios en ModelScope: https://modelscope.cn/models/nano0412/inchwork-digitnet-v2-display-band-onnx/feedback
- Repositorio upstream de DigitNet v2 (bp-tracker, versión fijada): https://github.com/chakib-belgaid/bp-tracker/tree/ba4701e3e72767d096b48fb1b3277664a58b0138
- Preprocesado original (ocr.js): https://github.com/chakib-belgaid/bp-tracker/blob/ba4701e3e72767d096b48fb1b3277664a58b0138/ocr.js
- Conjunto de datos YUVA EB v1 (Mendeley): https://data.mendeley.com/datasets/fnn44p4mj8/1
- Firmware de referencia ESP (Suikyoo meter-ocr): https://github.com/Suikyoo/meter-ocr/blob/6cb400dfea6c544d531d84931b2f7e58632d8d5e/firmware/main/reader.cc
- Conjunto nativo de caracteres individuales de siete segmentos: https://huggingface.co/datasets/chakibmed/bp-monitor-seven-segment/blob/c7ff0c48ca664eef2c5a8161b56a7be8fb7b8e59/README.md
