# nuetzliches/veilq-signature-v5

## Resumen

veilq-signature-v5 es un detector de firmas manuscritas en imagenes de documentos, capturas de pantalla y fotografias. Lo desarrolla nuetzliches como componente del proyecto veilq (ADR-0048, ADR-0068), una herramienta que localiza firmas y las cubre con un rectangulo negro para evitar su exposicion. El modelo es un ajuste fino de `mdefrance/yolos-tiny-signature-detection` (revision `b788cf7376464453c3dea1e5ee8589adcaa0c634`, Apache-2.0), del que hereda la arquitectura YOLOS-tiny y la licencia.

La aportacion principal de la version 5 frente a la v4 es la incorporacion de teselas (tiles) de 640 pixeles durante el entrenamiento, pensadas para paginas web y capturas de pantalla anchas (a partir de 1,3:1 y mas de 1280 pixeles de ancho). Ademas sube el umbral de deteccion de 0,5 a 0,65 (0,95 para cajas encontradas en teselas) y descarta cajas de menos de 40 pixeles de ancho, lo que reduce notablemente los falsos positivos.

El modelo se distribuye unicamente en formato ONNX (opset 17) y esta pensado para inferencia local dentro del pipeline de veilq, que fija el archivo por su SHA-256. No es un modelo de proposito general: es un detector binario de un solo tipo de objeto (firma / nada) con entradas de 640x640 y un maximo de 100 detecciones por imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOS-tiny (transformer de deteccion de objetos, ViT con cabecera de deteccion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 640x640) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, `model.onnx`) |

Otros datos tecnicos: entrada `pixel_values` float32 `[1, 3, 640, 640]`, RGB escalado a 0..1 y normalizado con media `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]`. Salidas `logits` `[1, 100, 2]` (firma / nada, softmax) y `pred_boxes` `[1, 100, 4]` (centro x, centro y, ancho y alto como proporciones de la entrada). SHA-256 de `model.onnx`: `bce063456cd61c4645eac224096f183e8d10026b76f805f1f87bcd88c80bbda0`.

## Arquitectura y entrenamiento

El modelo es un YOLOS-tiny, es decir, un transformer de vision con cabecera de deteccion que predice un conjunto fijo de cajas y puntuaciones sin necesidad de anchors ni de supresion no maxima clasica en la arquitectura. Sobre el checkpoint base se aplico un ajuste fino con 8.000 imagenes sinteticas y unas 7.500 teselas por epoca durante 24 epocas, en GPU, con batch 16, optimizador AdamW a 2e-5 y con los patch embeddings y las 6 primeras de las 12 capas del encoder congelados. La mejor epoca (21) se selecciono sobre 800 imagenes sinteticas reservadas, midiendo la recall media por tipo de imagen que contiene firmas menos la mitad de las cajas falsas por imagen, leidas con teselas.

La innovacion de la v5 es el regimen de teselas: ademas de una parte de cada imagen (completa o cuadrada), cada epoca entrena con dos teselas de 640 pixeles en posiciones aleatorias, una alrededor de una firma cuando la hay y otra sin firma. Si una tesela cortaria una firma, se vuelve a sortear, de modo que ninguna tesela ensena media firma. Las imagenes de entrenamiento son las mismas que en la v4 (mismo generador, mismas semillas). En inferencia, veilq lee la imagen completa, cuadrados del lado menor con solape del 50 % cuando la relacion de aspecto se aleja del cuadrado (desde 1,3:1) y, novedad de la v5, teselas de 640 pixeles de la imagen original con solape del 50 % cuando es apaisada desde 1,3:1 y supera los 1280 pixeles de ancho. Una caja cuenta desde puntuacion 0,65 (0,5 en la v4); una caja encontrada en una tesela, desde 0,95; se descartan cajas de menos de 40 pixeles de ancho.

## Capacidades

- Deteccion de firmas manuscritas en imagenes de documentos, cartas, formularios, capturas de pantalla y fotografias.
- Deteccion en paginas web con tarjetas de foto firmadas, incluyendo firmas sobre fotos pequenas.
- Discriminacion frente a elementos que no son firmas: fotos, paginas web, marcas de agua diagonales, sellos, logotipos, encabezados impresos y valores escritos a mano en formularios.
- Salida de hasta 100 cajas por imagen con puntuacion de confianza y coordenadas normalizadas.
- Inferencia local en formato ONNX, sin dependencia de servicios en la nube.
- Integracion con el pipeline de veilq para cubrir con negro las firmas detectadas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un detector de objetos de una sola clase.

## Casos de uso

- Anonimizacion de documentos antes de compartirlos: veilq usa el modelo para localizar firmas en facturas, contratos o cartas escaneadas y cubrirlas con un rectangulo negro, reduciendo el riesgo de exponer datos personales en revisiones o envios.
- Publicacion de capturas de pantalla de paginas web: gracias a las teselas de 640 pixeles y al umbral de 0,95 en teselas, detecta firmas en tarjetas de foto firmadas dentro de paginas anchas, un escenario donde la v4 generaba muchos falsos positivos.
- Tramitacion de formularios escaneados: distingue la firma manuscrita de los valores escritos a mano en los campos del formulario, de modo que el pipeline puede cubrir solo la firma y conservar legibles los datos del formulario.
- Cumplimiento de proteccion de datos en flujos documentales: al ejecutarse en local sobre ONNX, permite procesar documentos sensibles sin enviarlos a APIs externas, lo que facilita el cumplimiento de requisitos de residencia de datos.
- Curado de datasets de documentos: el detector puede usarse para etiquetar o filtrar imagenes que contienen firmas antes de incorporarlas a un corpus de entrenamiento o de evaluacion.
- Verificacion de presencia de firma en procesos internos: como paso previo a la revision humana, marca que imagenes contienen una firma y cuales no, priorizando la cola de revision.
- Preprocesado en pipelines de OCR: cubrir la firma antes de pasar la imagen por un OCR evita que el reconocimiento de texto interprete trazos manuscritos como caracteres y contamine la extraccion.

## Benchmarks y rendimiento

El autor publica una evaluacion sobre 800 imagenes sinteticas generadas con una semilla no usada ni para entrenamiento ni para elegir umbrales (529 firmas), comparando la v4 leida como veilq la leia (imagen completa y cuadrados, desde 0,5) con la v5 leida como se describe arriba:

| Tipo de imagen | Firmas encontradas v4 / v5 | Cajas falsas v4 / v5 |
|---|---|---|
| Carta sin marca de agua | 74 / 75 de 75 | 22 / 18 |
| Carta con marca de agua | 115 / 117 de 117 | 19 / 13 |
| Carta fotografiada | 24 / 24 de 24 | 12 / 10 |
| Foto firmada en su cara | 62 / 60 de 70 | 18 / 6 |
| Pagina web con tarjetas de foto firmadas | 109 / 127 de 164 | 177 / 97 |
| Foto sin firma | – | 12 / 5 |
| Formulario rellenado a mano | 78 / 77 de 79 | 52 / 48 |
| Texto impreso | – | 10 / 6 |
| Total | 462 / 480 de 529 | 322 / 203 |

En conjunto, la v5 encuentra 480 de 529 firmas (90,7 %) frente a 462 de la v4 (87,3 %), y reduce las cajas falsas de 322 a 203 (37 % menos). La mejora es especialmente marcada en paginas web con tarjetas firmadas (127 frente a 109 firmas, 97 frente a 177 falsos) y en fotos sin firma (5 frente a 12 falsos). El autor advierte que leer la v5 con umbral 0,5 en lugar de 0,65 produce un tercio mas de cajas falsas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano de YOLOS-tiny y una entrada de 640x640, la inferencia cabe holgadamente en GPUs de consumo, aunque el autor no publica cifras.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime; para uso en servidor, A100 o H100 son sobredimensionadas para este modelo; una RTX 4090 o incluso GPUs de gama media son suficientes.
- GPU de consumo: si, el modelo esta pensado para ejecutarse en local; el proyecto veilq lo descarga con `veilq models fetch signature`.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo), integracion directa en veilq. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| veilq-signature-v5 | no disponible (YOLOS-tiny) | 640x640 | Deteccion de firmas | Apache-2.0 | ONNX en Hugging Face |
| mdefrance/yolos-tiny-signature-detection | no disponible (YOLOS-tiny) | 640x640 | Deteccion de firmas | Apache-2.0 | Hugging Face (modelo base) |
| veilq-signature-v4 | no disponible (YOLOS-tiny) | 640x640 | Deteccion de firmas | Apache-2.0 | ONNX en Hugging Face |

No se dispone de datos de benchmarks de terceros ni de otros detectores de firmas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Las firmas en tarjetas de foto pequenas de paginas web siguen siendo las mas falladas: se detectan aproximadamente tres de cada cuatro, y una firma no detectada queda visible.
- En el conjunto de evaluacion, la v5 perdio dos firmas en fotos y una en un formulario que la v4 si encontraba.
- Un valor escrito a mano en un formulario se confunde ocasionalmente con una firma y se cubre de negro, lo que impide leer ese valor (no supone perdida de datos personales, pero si de informacion del formulario).
- Entrenado solo con datos sinteticos: las firmas y escaneos reales presentan mas variabilidad, por lo que el rendimiento en produccion puede diferir del medido.
- El umbral forma parte del modelo: leerlo a 0,5 en lugar de 0,65 genera un tercio mas de cajas falsas.
- Modelo de una sola clase y de vision: no procesa lenguaje, no soporta tool calling ni agentes, y no tiene capacidades multilingues.
- Licencia Apache-2.0, que permite uso comercial; el autor no documenta restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB reportado, por lo que conviene verificar la integridad del archivo con el SHA-256 publicado antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuetzliches/veilq-signature-v5
- Modelo base: https://huggingface.co/mdefrance/yolos-tiny-signature-detection
- Version anterior: https://huggingface.co/nuetzliches/veilq-signature-v4
- Repositorio de veilq: https://github.com/nuetzliches/veilq
