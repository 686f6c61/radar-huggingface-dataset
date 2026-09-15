# Hoang17z/EdgeCard-OCR-Models

## Resumen

EdgeCard-OCR-Models es el repositorio de pesos asociado al trabajo "EdgeCard: Real-Time Student Card Detection and Recognition on Low-Power Devices", publicado por el usuario Hoang17z. No es un modelo de lenguaje, sino un conjunto de pesos para un pipeline de vision por computador de cuatro etapas orientado a la deteccion y el reconocimiento OCR de tarjetas de estudiante en dispositivos de baja potencia. El pipeline combina YOLO26n-Pose para la deteccion de la tarjeta y sus cuatro esquinas semanticas, YOLO26n-OBB para la deteccion orientada de regiones de texto, PP-OCRv6 Small Recognition para la transcripcion de caracteres y un post-procesado basado en reglas que produce informacion estructurada.

El interes practico del repositorio esta en su orientacion a despliegue en el borde: incluye pesos en PyTorch, ONNX, NCNN y Paddle Inference, con variantes NCNN listas para CPU ARM. El autor reporta una precision exacta extremo a extremo del 94,25 % y un tiempo medio de 1105,82 ms por tarjeta (0,90 tarjetas/s) en una Raspberry Pi 4, con un pico de RSS de aproximadamente 795 MiB.

Se trata de un repositorio con 0 descargas y 0 likes en el momento de la consulta, con licencia no declarada y sin resultados de benchmarks externos. El dataset de entrenamiento (tarjetas de la Academy of Cryptography Techniques, ACTVN) no es publico por contener datos personales identificables, lo que limita la reproducibilidad independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de vision en cuatro etapas: YOLO26n-Pose (deteccion de tarjeta y cuatro keypoints de esquina), YOLO26n-OBB (deteccion orientada de regiones de texto), PP-OCRv6 Small Recognition (reconocimiento de texto) y post-procesado basado en reglas |
| Parametros totales | no disponible (no se publica el recuento por componente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la entrada son imagenes) |
| Tipos de cuantizacion | no disponible; se distribuyen pesos en precision original y variantes NCNN/ONNX, sin detallar esquemas de cuantizacion |
| Idiomas soportados | no disponible (el README no declara idiomas; los datos de entrenamiento son tarjetas de estudiante de ACTVN) |
| Licencia | no disponible (el README remite a las licencias y terminos de los frameworks y pesos preentrenados originales, y restringe aparte el acceso al dataset) |
| Formato de pesos | PyTorch (.pt, .pth), ONNX (.onnx), NCNN (.param, .bin), Paddle Inference (.pdmodel, .pdiparams, .yml, .json) |
| Tarea declarada (pipeline) | object-detection |
| Tamano del repositorio | 0,2 GB |
| Etapas del pipeline | 4 (deteccion de tarjeta, deteccion de texto, reconocimiento de texto, parsing por reglas) |
| Modelos seleccionados | YOLO26n-Pose, YOLO26n-OBB, PP-OCRv6 Small Recognition |
| Idiomas del model card | ingles |

## Arquitectura y entrenamiento

El sistema es un pipeline en cascada, no una red unica. La primera etapa usa YOLO26n-Pose para localizar la tarjeta y predecir cuatro keypoints de esquina en orden semantico fijo (superior izquierda, superior derecha, inferior derecha, inferior izquierda), lo que permite la alineacion por perspectiva. La segunda etapa emplea YOLO26n-OBB, una variante de deteccion con cajas orientadas, para localizar regiones de texto y asignarlas espacialmente dentro de la tarjeta ya alineada. La tercera etapa aplica PP-OCRv6 Small Recognition para transcribir cada region recortada. Finalmente, un modulo de parsing basado en reglas y post-procesado convierte las transcripciones en informacion estructurada de la tarjeta de estudiante. El propio README subraya que el pipeline extremo a extremo utiliza unicamente los modelos marcados como "Selected".

El repositorio incluye ademas pesos de referencia para benchmarking en varias etapas: DBNet y PP-OCRv6 Small Detection como alternativas de deteccion de texto, y MobileNetV3-CRNN y RepSVTR como alternativas de reconocimiento. Esta estructura permite reproducir las comparativas internas del trabajo. No se especifican en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, la resolucion de entrada, ni si se aplicaron tecnicas de aumento de datos o ajuste fino con aprendizaje por refuerzo. Los modelos se entrenaron y evaluaron con imagenes de tarjetas de estudiante de la Academy of Cryptography Techniques (ACTVN); el dataset no se publica por contener nombres, identificadores de estudiante e informacion de clase, es decir, datos personales identificables.

## Capacidades

- Deteccion de tarjeta de estudiante en imagen, con prediccion de cuatro keypoints de esquina para alineacion por perspectiva (etapa 1, YOLO26n-Pose).
- Deteccion de regiones de texto con cajas orientadas (OBB), adecuada para texto inclinado o en disposicion no horizontal (etapa 2, YOLO26n-OBB).
- Reconocimiento de texto sobre recortes de regiones, con transcripcion caracter a caracter (etapa 3, PP-OCRv6 Small Recognition).
- Asignacion espacial de regiones de texto a campos de la tarjeta y generacion de salida estructurada mediante reglas.
- Ejecucion en CPU de baja potencia mediante pesos NCNN, y en otros entornos via ONNX y Paddle Inference.
- Modo comparativo de benchmarking: el repositorio permite ejecutar variantes alternativas (DBNet, PP-OCRv6 Small Detection, MobileNetV3-CRNN, RepSVTR) para reproducir las tablas del trabajo.
- Capacidades de texto generativo, razonamiento, codigo, matematicas, tool calling, agentes, vision general, audio o modo "thinking": no disponibles (el modelo no es un modelo de lenguaje y no se documentan estas funciones).
- Capacidades multilingues: no disponibles (no se declara el conjunto de idiomas soportados por el reconocedor).

## Casos de uso

- Digitalizacion de tarjetas de estudiante en un torno o punto de acceso: el pipeline detecta la tarjeta, la alinea por perspectiva, localiza y reconoce los campos de texto y devuelve un registro estructurado; es adecuado porque la deteccion de esquinas (99,43 % mAP@0,5) garantiza una alineacion fiable incluso con la tarjeta en mano.
- Verificacion de identidad en examenes o bibliotecas: la precision exacta extremo a extremo del 94,25 % permite validar nombre, identificador y clase contra una base de datos, con intervencion humana en los casos de baja confianza.
- Despliegue en terminales de bajo coste: los pesos NCNN y el pico de RSS de aproximadamente 795 MiB en Raspberry Pi 4 permiten montar el sistema en hardware ARM barato, sin GPU, a 0,90 tarjetas por segundo.
- Control de acceso en aulas o laboratorios: la lectura automatizada de tarjetas agiliza el registro de asistencia, y el modelo puede ejecutarse en el propio dispositivo sin enviar imagenes a la nube, lo que reduce exposicion de datos personales.
- Etiquetado y auditoria retroactiva de imagenes de tarjetas ya capturadas: el pipeline procesa lotes de imagenes para extraer campos estructurados y poblar sistemas de gestion documental.
- Base para adaptacion a otros documentos con estructura fija: la combinacion de deteccion orientada de texto y parsing por reglas es reutilizable en carnets, badges de evento o identificadores corporativos, reentrenando las etapas 1 y 2 con el nuevo formato.
- Comparativa de componentes OCR en un entorno real: las variantes incluidas (DBNet, PP-OCRv6 Small Detection, MobileNetV3-CRNN, RepSVTR) permiten medir precision y latencia por etapa antes de fijar la arquitectura final de un producto.
- Investigacion en OCR sobre dispositivos de borde: el codigo de entrenamiento, benchmarking y evaluacion extremo a extremo esta publicado, lo que facilita reproducir la metodologia con datos propios.

## Benchmarks y rendimiento

Etapa 1, YOLO26n-Pose (deteccion de tarjeta y keypoints):

| Metrica | Valor |
|---|---|
| Precision | 99,6 % |
| Recall | 98,5 % |
| mAP@0,5 | 99,43 % |
| mAP@0,5:0,95 | 99,22 % |

Etapa 2, deteccion de regiones de texto:

| Modelo | Precision (%) | Recall (%) | F1-score (%) | IoU emparejado medio (%) |
|---|---|---|---|---|
| YOLO26n-OBB | 96,31 | 98,28 | 97,28 | 79,04 |
| DBNet | 88,69 | 95,42 | 91,93 | 76,41 |
| PP-OCRv6 Small Detection | 92,18 | 93,91 | 93,04 | 73,07 |

Etapa 3, reconocimiento de texto:

| Modelo | Precision exacta (%) | CER (%) | NES (%) | Latencia (ms/recorte) |
|---|---|---|---|---|
| MobileNetV3-CRNN | 98,22 | 0,26 | 99,73 | 11,18 |
| PP-OCRv6 Small Recognition | 99,03 | 0,11 | 99,91 | 10,24 |
| RepSVTR | 98,06 | 0,20 | 99,83 | 12,57 |

NES corresponde a Normalized Edit Similarity, donde un valor mayor es mejor. El hardware en el que se midieron las latencias por recorte no se especifica en la informacion disponible.

Rendimiento extremo a extremo:

| Metrica | Valor |
|---|---|
| Precision exacta global (PC y Raspberry Pi 4) | 94,25 % |
| Tiempo medio por tarjeta en Raspberry Pi 4 | 1105,82 ms |
| Throughput en Raspberry Pi 4 | 0,90 tarjetas/s |
| Pico de RSS en Raspberry Pi 4 | ~795 MiB |

No se han publicado comparaciones con modelos externos al trabajo en la informacion disponible.

## Requisitos de hardware

- VRAM: no disponible (el autor no publica requisitos de GPU). Como referencia de memoria real, el pipeline completo consume un pico de RSS de aproximadamente 795 MiB ejecutandose en CPU sobre Raspberry Pi 4.
- GPU recomendadas: no disponibles. Los pesos estan en formato nano y small, por lo que cualquier GPU consumer con unos pocos GB de memoria libre deberia poder ejecutar los componentes individuales; se trata de una estimacion del editor, no de un dato del autor.
- GPU consumer: no se documenta compatibilidad especifica. El pipeline esta disenado para CPU ARM, por lo que la GPU no es un requisito.
- CPU y sistemas embebidos: Raspberry Pi 4 es la plataforma de referencia medida (0,90 tarjetas/s, pico de RSS ~795 MiB).
- Opciones de despliegue: NCNN (pesos .param/.bin, orientado a movil y ARM), ONNX Runtime (archivos .onnx), Paddle Inference (.pdmodel/.pdiparams) y PyTorch con Ultralytics para los pesos .pt. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia por componente: PP-OCRv6 Small Recognition 10,24 ms por recorte; MobileNetV3-CRNN 11,18 ms; RepSVTR 12,57 ms (hardware de medida no especificado).
- Latencia extremo a extremo: aproximadamente 1105,82 ms por tarjeta en Raspberry Pi 4.

## Comparativa con modelos similares

Los unicos modelos comparables documentados en la informacion disponible son las variantes de referencia incluidas en el propio repositorio, medidas bajo el mismo protocolo:

| Modelo | Etapa | Precision exacta (%) | F1-score (%) | Latencia | Licencia |
|---|---|---|---|---|---|
| YOLO26n-OBB | Deteccion de texto | no aplica | 97,28 | no disponible | no disponible |
| DBNet | Deteccion de texto | no aplica | 91,93 | no disponible | no disponible |
| PP-OCRv6 Small Detection | Deteccion de texto | no aplica | 93,04 | no disponible | no disponible |
| PP-OCRv6 Small Recognition | Reconocimiento | 99,03 | no aplica | 10,24 ms/recorte | no disponible |
| MobileNetV3-CRNN | Reconocimiento | 98,22 | no aplica | 11,18 ms/recorte | no disponible |
| RepSVTR | Reconocimiento | 98,06 | no aplica | 12,57 ms/recorte | no disponible |

En deteccion de regiones de texto, YOLO26n-OBB supera a DBNet y a PP-OCRv6 Small Detection tanto en F1-score como en IoU emparejado medio. En reconocimiento, PP-OCRv6 Small Recognition obtiene la mayor precision exacta y la menor latencia de los tres candidatos evaluados. No se dispone de comparativas frente a pipelines OCR externos (por ejemplo, soluciones comerciales de document AI) ni de datos de licencia de los modelos alternativos.

## Limitaciones y advertencias

- Licencia no declarada: el README no incluye una licencia explicita para los pesos, y remite a las licencias de los frameworks y pesos preentrenados originales. Antes de cualquier uso comercial es imprescindible aclarar la situacion legal con el autor.
- Dataset restringido: las imagenes y anotaciones de tarjetas de ACTVN no se publican por contener datos personales identificables. La reproducibilidad independiente esta limitada a la solicitud de acceso por parte de investigadores cualificados.
- Validacion limitada a un unico dominio: los modelos se entrenaron y evaluaron con tarjetas de una institucion concreta, con un diseno y tipografia determinados. El rendimiento en otros formatos de tarjeta, idiomas o paises no esta documentado.
- Idiomas no declarados: no se especifica que alfabetos o idiomas reconoce la etapa OCR; un uso con caracteres no latinos o con escrituras complejas requeriria verificar la cobertura del reconocedor.
- Sin validacion externa ni adopcion: el repositorio registra 0 descargas y 0 likes, no hay benchmarks de terceros y el propio autor indica que la entrada BibTeX se anadira tras la publicacion del articulo.
- Riesgo de fallo en cascada: al ser un pipeline de cuatro etapas, un error en la deteccion de esquinas o en la deteccion de regiones propaga el fallo a las etapas posteriores. La precision exacta extremo a extremo (94,25 %) es inferior a la de las etapas individuales precisamente por este efecto.
- Robustez ante condiciones adversas no documentada: no se publican resultados sobre iluminacion variable, reflejos, oclusiones, desenfoque de movimiento o fondos no controlados.
- Dependencia del post-procesado por reglas: el parsing de campos depende de reglas especificas del formato de tarjeta objetivo, por lo que la adaptacion a otros documentos exige reescribir esa capa.
- Riesgo de sesgo: no se han publicado analisis de sesgo por tipo de imagen, calidad de captura o subpoblaciones de tarjetas.
- Huella de memoria declarada en un escenario concreto: el pico de 795 MiB corresponde a Raspberry Pi 4 con el pipeline completo; en otros dispositivos y backends puede variar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hoang17z/EdgeCard-OCR-Models
- Codigo fuente (entrenamiento, benchmarking y evaluacion extremo a extremo): https://github.com/HuyHoang172004/EdgeCard-OCR
- Paper de EdgeCard: referencia pendiente de publicacion segun el README; entrada BibTeX no disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a paginas de cuenta atras de fechas, sin relacion con el repositorio)
