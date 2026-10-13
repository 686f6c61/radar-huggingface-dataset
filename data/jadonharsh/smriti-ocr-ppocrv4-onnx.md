# jadonharsh/smriti-ocr-ppocrv4-onnx

## Resumen

smriti-ocr-ppocrv4-onnx es un repositorio de HuggingFace que redistribuye dos ficheros ONNX correspondientes al detector y al reconocedor de texto de PaddleOCR PP-OCRv4, en la forma publicada por RapidOCR (paquete `rapidocr_onnxruntime` 1.4.4 en PyPI) y sin modificar. No se trata de un modelo generativo ni de un LLM, sino de un pipeline OCR clásico de dos etapas (detección de cajas de texto y reconocimiento de caracteres) empaquetado para inferencia local.

El autor, jadonharsh, lo publica como componente del proyecto Smriti, que lo descarga bajo demanda (aproximadamente 16 MB) para ejecutarlo íntegramente en la máquina del usuario. La relevancia actual del repositorio es de tipo práctico: ofrece OCR con licencia Apache-2.0, en formato ONNX portable, con un tamaño que permite desplegarlo en CPU, navegador o dispositivos de borde sin depender de servicios en la nube y sin enviar imágenes a terceros.

La model card es mínima: se limita a identificar los dos ficheros, sus hashes SHA256 y las fuentes originales. No documenta arquitectura interna, datos de entrenamiento, idiomas ni métricas, por lo que buena parte de la información de esta ficha queda marcada como no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas sobre grafos ONNX: un modelo de deteccion de texto y un modelo de reconocimiento de texto (PP-OCRv4). El detalle interno no se especifica en la model card |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (no es un modelo autorregresivo de contexto textual) |
| Tipos de cuantizacion | no documentados; la model card indica que se distribuyen los ficheros ONNX originales de RapidOCR 1.4.4 sin modificar |
| Idiomas soportados | no disponible en la model card. Los nombres de fichero usan el prefijo `ch_`, habitual en PaddleOCR para los modelos de chino e ingles, pero el autor no lo declara explicitamente |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`) |
| Numero de ficheros | 2: `ch_PP-OCRv4_det_infer.onnx` (deteccion) y `ch_PP-OCRv4_rec_infer.onnx` (reconocimiento) |
| Tamano declarado | aproximadamente 16 MB en total, segun la model card |
| Tamano del repositorio en HuggingFace | 0,0 GB (dato del propio repositorio) |
| Hashes SHA256 | det: `d2a7720d45a54257208b1e13e36a8479894cb74155a5efe29462512d42f49da9`; rec: `48fc40f24f6d2a207a2b1091d3437eb3cc3eb6b676dc3ef9c37384005483683b` |
| Fecha de creacion | 13 de octubre de 2026 |
| Ultima actualizacion | 13 de octubre de 2026 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado en HuggingFace | no disponible |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de los dos grafos ONNX ni aporta información sobre datos de entrenamiento, número de tokens o composición del dataset. Lo único verificable es que se trata de los ficheros publicados por RapidOCR, que a su vez empaquetan los modelos PP-OCRv4 de PaddleOCR, y que el autor los redistribuye sin modificaciones, como indican los hashes SHA256 incluidos. No ha habido, por tanto, ningún proceso de ajuste, RLHF, DPO ni cuantización posterior por parte de jadonharsh.

Funcionalmente, el pipeline es el estándar de PP-OCRv4: el detector localiza regiones candidatas que contienen texto y el reconocedor las transcribe a cadena de caracteres, con un postprocesado que reconstruye el orden de lectura. Cualquier detalle adicional sobre el backbone, la cabeza de detección o el decodificador debe consultarse en la documentación pública de PaddleOCR y RapidOCR, no en este repositorio.

## Capacidades

- Detección de texto en imágenes: localiza regiones con texto y devuelve sus cajas delimitadoras.
- Reconocimiento de texto: transcribe el contenido de cada región detectada a texto plano.
- Inferencia totalmente local: el modelo se ejecuta en la máquina del usuario, sin llamadas a servicios externos.
- Tamaño reducido: alrededor de 16 MB en total, lo que permite empaquetarlo dentro de aplicaciones de escritorio o móviles.
- Portabilidad de formato: al ser ONNX estándar, es desplegable con cualquier runtime compatible, incluido el citado en la model card (`rapidocr_onnxruntime` 1.4.4).
- Integración en pipelines de OCR existentes: sustituye o complementa a los modelos de RapidOCR o PaddleOCR en formato ONNX.

No se documentan en la información disponible las siguientes capacidades: generación de texto libre, razonamiento, código, matemáticas, tool calling o function calling, uso como agente, razonamiento multi-paso, modo de pensamiento, entrada de audio ni comprensión visual general (captioning, VQA).

## Casos de uso

- Digitalización de documentos escaneados: el detector localiza los bloques de texto de cada página y el reconocedor los transcribe, generando una capa de texto buscable para archivos PDF previamente sin OCR.
- Extracción de datos en aplicaciones móviles o de escritorio: por su tamaño (~16 MB) y su ejecución en CPU, puede embeberse en una app que lea facturas, tickets o albaranes sin conexión a internet.
- OCR con requisitos de privacidad: al ejecutarse íntegramente en local, es adecuado para entornos sanitarios, jurídicos o financieros donde las imágenes no pueden salir del dispositivo.
- Preprocesado para pipelines de recuperación aumentada (RAG): convertir documentos escaneados en texto antes de trocearlo e indexarlo en una base vectorial.
- Indexación y búsqueda en archivos corporativos: procesar de forma masiva carpetas de PDF e imágenes para hacerlas consultables por palabras clave.
- Accesibilidad: leer en voz alta el contenido de carteles, menús o documentos físicos capturados con la cámara de un dispositivo.
- Automatización de formularios: extraer campos de plantillas escaneadas como paso previo a la validación y carga en un sistema de gestión.
- Moderación y análisis de contenido: detectar la presencia y el contenido de texto incrustado en imágenes subidas por usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de precisión, recall, F1, CER ni WER, ni comparaciones con otros modelos. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con un peso declarado de aproximadamente 16 MB, la huella de memoria es muy reducida, pero no se publican cifras de consumo en ejecución ni de memoria de activaciones.
- GPU recomendadas: no disponibles. La model card no menciona ningún requisito de GPU; el flujo descrito es de ejecución local en el dispositivo del usuario.
- Viabilidad en GPU de consumo: si, previsiblemente en cualquier GPU consumer e incluso en CPU, dado el tamaño de los ficheros. No hay cifras publicadas que lo confirmen.
- Opciones de despliegue: ONNX Runtime (incluida la variante GPU) y el paquete `rapidocr_onnxruntime` 1.4.4 citado en la model card. Al ser ONNX estándar, también es integrable en runtimes compatibles con ONNX, como los de aplicaciones móviles o de borde.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smriti-ocr-ppocrv4-onnx | Detector + reconocedor OCR (PP-OCRv4) | ONNX | Apache-2.0 | Repositorio en HuggingFace, 0 descargas y 0 likes | Reempaquetado de RapidOCR sin modificar; sin benchmarks publicados |
| PaddleOCR PP-OCRv4 | Detector + reconocedor OCR | Pesos nativos de PaddlePaddle (y conversiones a ONNX) | Apache-2.0 (segun la documentacion publica del proyecto) | Repositorio oficial en GitHub | Fuente original del pipeline; incluye herramientas de entrenamiento y evaluación |
| RapidOCR | Paquete de OCR sobre ONNX Runtime | ONNX (empaquetado en libreria) | Apache-2.0 (segun la documentacion publica del proyecto) | Paquete en PyPI y repositorio en GitHub | Origen directo de los ficheros de este repositorio, en la version 1.4.4 |
| Modelos de OCR alternativos (por ejemplo, reconocedores de la familia Tesseract o EasyOCR) | OCR | Formatos propios de cada proyecto | no verificado en la informacion disponible | Repositorios publicos | Comparacion no cuantificable: no hay benchmarks en la informacion proporcionada |

Los datos de licencia de los proyectos de terceros proceden de su documentación pública y no han sido verificados en la información proporcionada para esta ficha. No se dispone de cifras comparativas de precisión, parámetros ni velocidad.

## Limitaciones y advertencias

- No es un modelo generativo: no conversa, no razona, no escribe código ni admite tool calling, function calling o uso como agente.
- Idiomas no declarados: no se especifica la cobertura lingüística. El prefijo `ch_` de los ficheros apunta a los modelos de PaddleOCR para chino e inglés, pero el autor no lo confirma, por lo que el rendimiento en otros idiomas es incierto.
- Riesgo de texto espurio: como en cualquier OCR, las imágenes con ruido, baja resolución, inclinación o fondos complejos pueden producir transcripciones incorrectas o caracteres inventados.
- Ausencia de evaluación: no hay benchmarks, ni análisis de sesgos, ni estudio de errores publicado por el autor.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe evidencia externa de uso en producción.
- Discrepancia de tamaño: la model card declara aproximadamente 16 MB, mientras que el repositorio muestra 0,0 GB, lo que sugiere ficheros cargados de forma diferida o no contabilizados; conviene verificar los hashes SHA256 antes de usar los ficheros.
- Reempaquetado de terceros: el autor no es el entrenador del modelo. La trazabilidad depende de que los hashes coincidan con los publicados por RapidOCR.
- Licencia: los ficheros se distribuyen bajo Apache-2.0, que permite uso comercial, pero el usuario debe cumplir además las condiciones de los proyectos de origen (PaddleOCR y RapidOCR). No se han identificado restricciones adicionales en la información disponible.
- Despliegue en producción: al no haber documentación de latencia, consumo de memoria ni precisión por dominio, es necesario realizar una evaluación propia con datos representativos antes de integrarlo en un sistema crítico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jadonharsh/smriti-ocr-ppocrv4-onnx
- Proyecto Smriti (aplicación que lo consume): https://smriti.jadonharsh.in
- PaddleOCR (fuente original del pipeline PP-OCRv4): https://github.com/PaddlePaddle/PaddleOCR
- RapidOCR (origen de los ficheros ONNX redistribuidos): https://github.com/RapidAI/RapidOCR
- Paquete `rapidocr_onnxruntime` en PyPI, version 1.4.4 citada en la model card: https://pypi.org/project/rapidocr_onnxruntime/

Nota: los resultados de la búsqueda web proporcionada no contenían enlaces relevantes sobre este modelo; todas las referencias devueltas correspondían a ChatGPT y no guardan relación con el repositorio analizado.
