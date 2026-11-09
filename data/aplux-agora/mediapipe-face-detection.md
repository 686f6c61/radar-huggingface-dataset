# APLUX-Agora/MediaPipe-Face-Detection

## Resumen

MediaPipe-Face-Detection es un paquete de recursos de despliegue para la deteccion de rostros y keypoints faciales sobre hardware Qualcomm, publicado por APLUX-Agora dentro de su plataforma Agora. No se trata de un modelo de lenguaje ni de un transformer generativo: es una version convertida y optimizada del conocido detector facial de MediaPipe, empaquetada por SoC con binarios listos para ejecutarse en la NPU (QNN) de placas concretas.

El repositorio se centra en la portabilidad y la medicion real en placa: cada directorio `targets/<SoC>/` contiene un `model.json` con la precision por defecto y las rutas de las variantes, junto con binarios `model.bin`. La model card reporta una latencia medida de 3,3 ms en FP16 sobre un SoC QCS8550 montado en la placa Rhino Pi X1, lo que lo situa en el terreno de la inferencia en tiempo real para vision embebida.

Su relevancia es practica para desarrolladores de sistemas AIoT que necesitan integrar deteccion facial de baja latencia en dispositivos con Qualcomm sin tener que realizar ellos mismos la conversion y validacion por placa. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano reportado es de 0.0 GB, por lo que la disponibilidad efectiva de los binarios debe verificarse directamente en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector facial tipo MediaPipe; no se especifica en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP16 (default reportado para QCS8550); otras precisiones por confirmar en `targets/<SoC>/` |
| Idiomas soportados | no disponible (no aplica a la tarea) |
| Licencia | APLUX Model Farm License para los recursos convertidos; licencia del modelo original segun sus terminos |
| Formato de pesos | binarios QNN `model.bin` con `model.json` por SoC (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Por el nombre y la tarea (`keypoint-detection`), se corresponde con el detector facial de MediaPipe, que localiza rostros y devuelve keypoints y cajas delimitadoras. El paquete publicado no incluye detalles de entrenamiento, numero de tokens, composicion del dataset ni si hubo etapas de ajuste fino.

Lo que si documenta el autor es el proceso de conversion y validacion: los recursos se han convertido para ejecutarse sobre la NPU Qualcomm mediante QNN, con preprocesado y postprocesado oficiales de Model Farm y verificacion por placa. Las entradas y salidas declaradas son `image` (imagen) como entrada y `keypoints`, `boxes` y `out` (JSON) como salidas. No se mencionan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo.

## Capacidades

- Deteccion de rostros en imagenes: devuelve cajas delimitadoras (`boxes`) para cada rostro localizado.
- Deteccion de keypoints faciales: devuelve puntos clave del rostro (`keypoints`).
- Salida estructurada en JSON (`out`) ademas de las salidas tensoriales.
- Ejecucion en NPU Qualcomm mediante QNN, con binarios especificos por SoC.
- Inferencia de baja latencia orientada a tiempo real (3,3 ms medidos en QCS8550 en FP16).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni multilingues, que quedan fuera del alcance de este modelo.

## Casos de uso

- Control de acceso biometrico en dispositivos AIoT: el detector localiza el rostro y sus keypoints antes de pasar a un modulo de reconocimiento, con latencia de milisegundos que permite validacion en puerta sin bloqueos perceptibles.
- Desbloqueo y autenticacion en camaras y terminales empotrados: al ejecutarse en la NPU del SoC Qualcomm, el procesamiento puede mantenerse en el dispositivo, reduciendo el envio de imagenes a la nube.
- Analisis de atencion y seguimiento ocular en senalizacion digital: los keypoints faciales permiten estimar orientacion de la cabeza y mirada en paneles interactivos o carteleria con camara.
- Preprocesado en pipelines de video vigilancia: deteccion de rostros frame a frame para recortar regiones de interes antes de modelos mas costosos de identificacion o analitica.
- Fotografia y edicion automatica en camaras inteligentes: deteccion de caras para enfoque, encuadre o aplicacion de efectos en tiempo real sobre el visor.
- Telemetria de presencia en entornos retail: conteo y localizacion de rostros para medir afluencia y orientacion de visitantes, con la ventaja de una latencia de 3,3 ms que permite procesar multiples flujos de camara en una sola placa.
- Prototipado rapido en placas Qualcomm: al incluir preprocesado, postprocesado y runner, permite validar una aplicacion de vision facial en hardware real sin construir el pipeline de conversion desde cero.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Latencia de inferencia | 3,3 ms | QCS8550, placa Rhino Pi X1, precision FP16 (default) |

No se han publicado resultados de benchmarks de precision (mAP, recall, etc.) en la informacion disponible.

## Requisitos de hardware

- SoC validado: Qualcomm QCS8550, en placa Rhino Pi X1 (犀牛派 X1).
- Precision por defecto: FP16; consultar `targets/<SoC>/model.json` para variantes adicionales.
- VRAM: no disponible; al tratarse de un modelo de vision embebido, el requisito relevante es la memoria del SoC/NPU, no la VRAM de una GPU de escritorio.
- GPU de escritorio: no se documenta soporte para A100, H100 o RTX 4090; el paquete esta orientado a NPU Qualcomm via QNN.
- Despliegue: recursos QNN (`model.bin` + `model.json`) con el runner y el proyecto exportado de Agora; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Throughput: no disponible; solo se reporta la latencia por inferencia de 3,3 ms en la configuracion indicada.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe-Face-Detection (APLUX-Agora) | Deteccion facial y keypoints | no disponible | no aplica | APLUX Model Farm License (recursos convertidos) | Hugging Face, 0 descargas |
| MediaPipe Face Detection (Google) | Deteccion facial | no disponible | no aplica | Apache 2.0 (segun el proyecto original; verificar) | Disponible en el ecosistema MediaPipe |
| Alternativas de deteccion facial en NPU Qualcomm | Deteccion facial | no disponible | no aplica | variable | no disponible |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos demograficos, de iluminacion ni de oclusion; en deteccion facial estos sesgos son un riesgo conocido del dominio y deben evaluarse con datos propios.
- Riesgo de falsos positivos y negativos en condiciones de baja luz, rostros parciales o angulos extremos; no se aportan metricas de precision para cuantificarlo.
- El paquete solo ha sido validado en QCS8550 segun la informacion disponible; en otros SoC el rendimiento y la compatibilidad no estan garantizados.
- La licencia de los recursos convertidos es la APLUX Model Farm License, distinta de la del modelo original; es imprescindible revisar `LICENSE_MODEL_FARM.pdf` y `NOTICE.md` antes de un uso comercial.
- El uso de deteccion facial implica cumplimiento de normativa de proteccion de datos y biometria (por ejemplo, RGPD en la UE); la licencia no cubre obligaciones legales de tratamiento.
- El repositorio figura con 0 descargas y 0 likes y un tamano reportado de 0.0 GB, lo que puede indicar que los binarios no estan efectivamente publicados o que la metadata no refleja su contenido; conviene verificar la descarga antes de integrarlo.
- No se documentan idiomas ni capacidades de texto porque no aplican; no debe tratarse como un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/MediaPipe-Face-Detection
- Prueba online en Agora: https://mega.aidlux.com/models/mediapipe-face-detection
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/MediaPipe-Face-Detection/blob/main/LICENSE_MODEL_FARM.pdf
- NOTICE y sumas de verificacion: referenciados en el repositorio (`NOTICE.md`, `SHA256SUMS`)
