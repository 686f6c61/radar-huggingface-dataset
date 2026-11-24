# mchuca/AttendanceSystem

## Resumen

FaceAttend es una aplicación de escritorio para el registro automatizado de asistencia mediante reconocimiento facial a partir de cámaras RTSP. No se trata de un modelo de lenguaje, sino de un paquete de despliegue que integra cinco modelos de reconocimiento facial (FaceNet, ArcFace y SFace) en formato ONNX y PyTorch, junto con la aplicación Python/PyQt5 y todos los paquetes necesarios para una instalación offline en Windows 10/11 y Linux x86_64. El autor es `mchuca` y el repositorio ocupa 2,1 GB.

El sistema reconoce empleados por su rostro y registra automáticamente entradas y salidas, funcionando únicamente en CPU sin necesidad de tarjeta gráfica. La detección de rostros se realiza con MTCNN, cuyos pesos se incluyen en el paquete `facenet-pytorch`. La relevancia de este repositorio radica en su carácter llave en mano: empaqueta intérpretes, dependencias y modelos verificados con sumas SHA-256, lo que facilita despliegues en entornos sin conectividad.

Es importante subrayar que la licencia es mixta: los modelos de InsightFace (ArcFace ResNet-50 y MobileFaceNet) están restringidos a investigación no comercial, mientras que FaceNet (MIT) y SFace (Apache-2.0) permiten uso comercial. El repositorio no publica métricas de benchmarks ni información sobre el entrenamiento de los modelos subyacentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un unico modelo: paquete de 5 modelos de reconocimiento facial (FaceNet, ArcFace ResNet-50, ArcFace MobileFaceNet, SFace) con detector MTCNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en ONNX y PyTorch sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Mixta: FaceNet MIT; SFace Apache-2.0; ArcFace (InsightFace) solo investigacion no comercial |
| Formato de pesos | `.onnx` y `.pt` (PyTorch / TorchScript) |
| Tamano del repositorio | 2,1 GB |
| Deteccion de rostros | MTCNN (pesos incluidos en facenet-pytorch) |
| Plataformas | Windows 10/11 64-bit y Linux x86_64 |
| Runtime | Python 3.9.9, PyQt5, ONNX Runtime, PyTorch, OpenCV (builds CPU) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia, sino que agrega modelos de terceros ya entrenados. FaceNet (variantes VGGFace2 y CASIA-WebFace) procede de `facenet-pytorch`; ArcFace ResNet-50 y MobileFaceNet provienen de InsightFace (`buffalo_l` y `buffalo_s`, concretamente `w600k_r50.onnx` y `w600k_mbf.onnx`); y SFace proviene de OpenCV Zoo (`face_recognition_sface_2021dec.onnx`). La detección de caras se realiza con MTCNN.

No se proporcionan datos sobre el número de tokens, composición del dataset, ni procesos de RLHF/DPO, ya que son modelos de reconocimiento facial y no de lenguaje. El autor sí documenta un control de calidad de las conversiones: cada archivo convertido (por ejemplo, de `.pt` a `.onnx` o a TorchScript) se verificó contra su fuente y produce embeddings idénticos con similitud coseno de 1,000000. Además, `models/SHA256SUMS.txt` incluye sumas de verificación SHA-256 de todos los archivos de modelo.

## Capacidades

- Reconocimiento facial de identidad a partir de imágenes o flujos de vídeo RTSP.
- Detección de rostros con MTCNN previa a la extracción de embeddings.
- Registro automático de entrada y salida de empleados con reglas de asistencia configurables.
- Selección entre cinco modelos de reconocimiento (FaceNet VGGFace2, FaceNet CASIA-WebFace, ArcFace ResNet-50, ArcFace MobileFaceNet, SFace).
- Ejecución en CPU sin GPU.
- Interfaz gráfica de escritorio con PyQt5.
- Instalación completamente offline mediante paquetes incluidos.
- Verificación de integridad de modelos mediante checksums SHA-256.
- No soporta tool calling, agentes, razonamiento multietapa ni capacidades multilingües de texto (no es un modelo de lenguaje).

## Casos de uso

- Control de asistencia laboral: la aplicación captura flujos de cámaras RTSP, detecta rostros con MTCNN y compara embeddings para registrar entradas y salidas de empleados de forma automática.
- Despliegue en entornos sin conectividad: los scripts `setup.bat` y `setup.sh` instalan todo desde el directorio `packages/`, lo que permite operar en plantas industriales o instalaciones aisladas sin acceso a internet.
- Sustitución de fichajes manuales en pymes: al funcionar solo en CPU, se puede ejecutar en un PC de oficina convencional con Windows 10/11 o Linux x86_64, sin inversión en GPU.
- Prototipado e investigación en biometría: los modelos ArcFace de InsightFace pueden emplearse en experimentos académicos no comerciales, con la salvedad de su licencia restrictiva.
- Evaluación comparativa de modelos de reconocimiento facial: el repositorio ofrece cinco variantes con conversiones verificadas (similitud coseno 1,000000), útil para comparar precisión y coste computacional en un mismo pipeline.
- Integración en sistemas de acceso físico: el registro automático de presencia puede conectarse a flujos internos de control de accesos, siempre que se cumplan los requisitos legales de consentimiento y protección de datos biométricos.
- Auditoría de integridad de modelos: el archivo `models/SHA256SUMS.txt` permite verificar que los pesos desplegados no han sido alterados en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el sistema está diseñado para ejecutarse en CPU.
- GPU recomendadas: no se requiere GPU. El autor indica explícitamente que funciona en una CPU normal.
- CPU: cualquier procesador x86_64 compatible con Windows 10/11 64-bit o Linux x86_64; los paquetes incluyen builds CPU de PyTorch y ONNX Runtime.
- Memoria RAM y latencia/throughput: no disponibles en la información proporcionada.
- Almacenamiento: el repositorio completo ocupa 2,1 GB; las descargas selectivas por sistema operativo reducen el tamaño.
- Despliegue: los scripts `setup.bat`/`run.bat` (Windows) y `setup.sh`/`run.sh` (Linux) gestionan la instalación; también es posible descargar solo los archivos necesarios con `huggingface-cli` usando los patrones `--include`.
- Dependencias de runtime: Python 3.9.9, PyQt5, PyTorch, ONNX Runtime, OpenCV y el runtime de Microsoft Visual C++ (Windows).

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Uso comercial | Contexto / tarea |
|---|---|---|---|---|---|
| FaceAttend (este repo) | Paquete de app + 5 modelos de reconocimiento facial | ONNX y PyTorch | Mixta (MIT, Apache-2.0, solo investigacion) | Parcial (FaceNet y SFace sí; ArcFace no) | Reconocimiento facial y asistencia |
| facenet-pytorch (timesler) | Modelos FaceNet + MTCNN | PyTorch | MIT | Sí | Reconocimiento facial |
| InsightFace (buffalo_l / buffalo_s) | Modelos ArcFace | ONNX | Solo investigacion no comercial | No | Reconocimiento facial |
| OpenCV Zoo (SFace) | Modelo SFace | ONNX | Apache-2.0 | Sí | Reconocimiento facial |

## Limitaciones y advertencias

- Licencia mixta: los modelos ArcFace de InsightFace (`arcface_r50.onnx`, `arcface_mbf.onnx`) solo pueden usarse para investigación no comercial; para uso comercial deben elegirse FaceNet o SFace.
- Los datos biométricos (imágenes faciales y embeddings) son datos personales; es obligatorio restringir el acceso a la carpeta `data`, informar a las personas afectadas y obtener consentimiento según la legislación local.
- El repositorio no documenta sesgos demográficos, tasas de falsos positivos/negativos ni precisión en condiciones de iluminación adversas.
- No se han publicado benchmarks de rendimiento en la información disponible.
- Dependencia de versiones fijas: Python 3.9.9 y paquetes empaquetados como wheels, lo que puede dificultar actualizaciones de seguridad.
- PyQt5 se distribuye bajo GPL v3, lo que puede condicionar la distribución de la aplicación si se combina con código propietario.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.
- No es un modelo de lenguaje: no ofrece generación de texto, razonamiento, código ni capacidades multilingües.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mchuca/AttendanceSystem
- facenet-pytorch (FaceNet y MTCNN): https://github.com/timesler/facenet-pytorch
- InsightFace (ArcFace, buffalo_l y buffalo_s): https://github.com/deepinsight/insightface
- OpenCV Zoo (SFace): https://github.com/opencv/opencv_zoo
- Archivo de checksums: `models/SHA256SUMS.txt` dentro del repositorio
- Licencia del repositorio: `LICENSE.md` dentro del repositorio
