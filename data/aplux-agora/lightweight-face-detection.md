# APLUX-Agora/Lightweight-Face-Detection

## Resumen

Lightweight-Face-Detection es un modelo de deteccion de rostros publicado por APLUX-Agora dentro de su catalogo Agora, orientado a despliegue en hardware Qualcomm para escenarios de AIoT. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un detector de objetos especializado en caras cuya salida son cajas delimitadoras (`boxes`) a partir de una imagen de entrada. La model card lo presenta como un paquete de recursos ya convertidos y verificados placa a placa, no como pesos entrenados desde cero por el autor.

Su relevancia practica esta en el formato de entrega: variantes por System-on-Chip (SoC) con precisiones FP16, W8A16 y W8A8, con latencias medidas sobre placas reales (1,9 ms en QCS6490 y 1,5 ms en QCS8550 con la precision por defecto). Esto lo convierte en una pieza util para integrar deteccion facial en pipelines de vision embebida sobre aceleradores QNN de Qualcomm, donde el cuello de botella suele ser la conversion y validacion del modelo, no el entrenamiento.

La informacion publica es muy escasa: el repositorio de Hugging Face ocupa 0.0 GB, no registra descargas ni likes, no declara idiomas y no incluye arquitectura, numero de parametros ni resultados de benchmarks. La licencia de los recursos convertidos es la APLUX Model Farm License, mientras que la licencia del modelo fuente queda remitida a los terminos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos; familia no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no aplica contexto textual) |
| Tipos de cuantizacion | FP16, W8A16, W8A8 (segun SoC) |
| Idiomas soportados | no disponible |
| Licencia | APLUX Model Farm License para los recursos convertidos; licencia del modelo fuente segun terminos originales |
| Formato de pesos | recursos por SoC en `targets/<SoC>/` con `model.json` y binarios de contexto `model.bin` (formato QNN) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del detector: la model card no indica si se trata de una red tipo SSD, YOLO, RetinaFace, BlazeFace o cualquier otra familia, ni detalla el backbone, el numero de parametros o las capas de salida. La unica informacion estructural es funcional: la tarea es deteccion de objetos con entrada de imagen y salida de cajas.

Tampoco se documentan los datos de entrenamiento, el numero de imagenes, la composicion del dataset ni si hubo ajuste fino o destilacion. Lo que si se describe es el proceso de publicacion: APLUX-Agora distribuye recursos ya convertidos y validados con el preprocesado y los ejemplos oficiales de Model Farm, con verificacion por placa. Cada directorio `targets/<SoC>/` contiene un `model.json` que declara la precision por defecto y las rutas de las variantes, y los binarios de contexto se empaquetan como `model.bin`, manteniendo los paquetes multifichero tal como los publica Model Farm. Se incluyen `NOTICE.md` y `SHA256SUMS` para trazabilidad e integridad.

## Capacidades

- Deteccion de rostros en imagenes: entrada `image`, salida `boxes`.
- Ejecucion en aceleradores QNN de Qualcomm con precisiones FP16, W8A16 y W8A8.
- Despliegue verificado en QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1).
- Preprocesado y postprocesado oficiales proporcionados por Model Farm.
- Runner y proyecto exportable disponibles desde la plataforma Agora.
- Prueba en linea sin placa fisica mediante la demo de Agora.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision generativa, audio ni modo thinking.

## Casos de uso

- Control de acceso en dispositivos AIoT: el detector puede ejecutarse en el propio SoC para localizar caras antes de un modulo de reconocimiento, con latencias de 1,5-1,9 ms que permiten procesar flujos de video sin depender de la nube.
- Videovigilancia embebida: integrado en camaras o pasarelas con QCS6490 o QCS8550, permite filtrar fotogramas con presencia de rostros y reducir el ancho de banda enviado a un servidor central.
- Analitica de aforo y presencia: conteo de personas en entornos comerciales a partir de las cajas detectadas, aprovechando la baja latencia para procesar multiples canales de video en una sola placa.
- Preprocesado para pipelines de reconocimiento facial: recorte y alineado de rostros antes de un modelo de embeddings, usando las cajas como regiones de interes.
- Prototipado rapido sin hardware: la demo en linea de Agora permite validar el comportamiento del detector antes de adquirir una placa, reduciendo el coste de evaluacion inicial.
- Despliegue en produccion sobre Qualcomm: los recursos ya convertidos y verificados por placa evitan el trabajo de conversion a QNN y la validacion de precisiones, acortando el ciclo de integracion.
- Automatizacion de privacidad en el borde: deteccion local de caras para aplicar desenfoque antes de transmitir imagenes, manteniendo el dato biometrico en el dispositivo.

## Benchmarks y rendimiento

La model card solo publica latencias medidas en la plataforma Agora con la precision por defecto. No se han publicado resultados de benchmarks de precision (mAP, recall, etc.) en la informacion disponible.

| SoC · placa | Precisiones soportadas | Latencia medida (precision por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 1,9 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 1,5 ms |

## Requisitos de hardware

- Hardware objetivo: placas con SoC Qualcomm QCS6490 o QCS8550, con aceleracion via QNN.
- VRAM estimada: no disponible; al ser un modelo ligero para AIoT, se ejecuta en memoria unificada del SoC, no en VRAM dedicada.
- GPU recomendadas: no aplica en el sentido convencional; el despliegue previsto es sobre el NPU/Hexagon de los SoC Qualcomm listados.
- Compatibilidad con GPU de consumo: no documentada; no se indica soporte para RTX 4090 u otras GPU de escritorio.
- Opciones de despliegue: recursos QNN por SoC descargados con `hf download`, runner y proyecto exportable desde Agora, y demo en linea en mega.aidlux.com.
- Latencia: 1,9 ms en QCS6490 y 1,5 ms en QCS8550 con la precision por defecto.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa: la model card no declara arquitectura, parametros ni metricas de precision, y no se han identificado en la informacion proporcionada modelos comparables de APLUX-Agora con los que contrastar. Se indica por tanto "no disponible".

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lightweight-Face-Detection | no disponible | no aplica | APLUX Model Farm License (recursos convertidos) | Hugging Face y Agora |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de metricas de precision: no hay mAP, recall ni tasas de falsos positivos publicadas, por lo que no es posible evaluar la calidad de deteccion antes de desplegar.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se puede valorar el sesgo por etnia, genero, edad, iluminacion o angulo facial.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la deteccion.
- Dependencia de hardware: los recursos estan empaquetados para SoC Qualcomm concretos (QCS6490 y QCS8550); su uso en otras plataformas no esta documentado.
- Restricciones de licencia: los recursos convertidos se rigen por la APLUX Model Farm License, y la licencia del modelo fuente queda remitida a los terminos del modelo original; es necesario revisar ambos documentos antes de un uso comercial.
- Trazabilidad limitada: el repositorio no incluye pesos en formato estandar (safetensors, GGUF) ni codigo de entrenamiento, solo binarios de contexto QNN.
- Idiomas: no disponible; al ser un detector de caras, la nocion de idioma no aplica directamente.
- Advertencia legal y etica: la deteccion facial esta sujeta a normativa de proteccion de datos (RGPD en la UE); su uso en vigilancia o identificacion requiere base legal y evaluacion de impacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/Lightweight-Face-Detection
- Demo en linea en Agora: https://mega.aidlux.com/models/lightweight-face-detection
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/Lightweight-Face-Detection/blob/main/LICENSE_MODEL_FARM.pdf
