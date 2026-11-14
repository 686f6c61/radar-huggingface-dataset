# cssr4africa/dec_unit_test_data_files

## Resumen

`cssr4africa/dec_unit_test_data_files` no es un modelo de inteligencia artificial, sino un repositorio de datos de prueba para robótica. Contiene grabaciones de rosbag2 (el formato de registro de ROS 2) capturadas con una cámara Intel RealSense D435i, y su propósito es servir como entrada reproducible para los tests unitarios de detección de caras y personas del proyecto pepper4dec, el guía turístico robótico basado en ROS 2 desarrollado para el Upanzi Digital Experience Center de la Universidad Carnegie Mellon en África.

El repositorio es la conversión a ROS 2 de un conjunto previo de bags ROS 1 alojado en `cssr4africa/cssr4africa_unit_tests_data_files`. La conversión se realizó con la herramienta `rosbags` (versión de metadatos 8, la más reciente que lee ROS 2 Humble) preservando todos los topics y mensajes sin modificaciones. La estructura de directorios replica la del repositorio original: cada bag es un directorio con `metadata.yaml` y un fichero sqlite3 `.db3`.

Es relevante para desarrolladores que trabajan en percepción robótica con ROS 2, ya que proporciona datos reales de cámara con profundidad alineada, en condiciones variadas de iluminación y número de sujetos, sin necesidad de capturar sus propias grabaciones. El tamaño total del repositorio es de 0,4 GB y no incluye pesos de modelo ni artefactos de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un conjunto de datos rosbag2) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | no disponible; los datos se distribuyen como rosbag2 (metadata.yaml + fichero sqlite3 .db3) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado ni un pipeline de entrenamiento. Se trata de un conjunto de datos de sensores organizado según la especificación rosbag2 de ROS 2. Cada bag contiene cinco topics: imagen en color comprimida en JPEG a 640x480 y 15 fps, imagen de profundidad alineada al color comprimida en formato `16UC1; compressedDepth png`, información de calibración (`CameraInfo`) para ambos flujos y la transformada estática (`tf_static`) publicada como transient local.

Las grabaciones originales se realizaron con una Intel RealSense D435i y se convirtieron a ROS 2 con `rosbags-convert --dst-version 8`, manteniendo intactos todos los topics y mensajes. El repositorio incluye seis grabaciones únicas de detección de caras (single_face, multiple_faces, mutual_gaze, lighting_1 y lighting_2, más una variante) con duraciones entre 24,9 s y 43,2 s y entre 373 y 649 fotogramas; las cuatro grabaciones de detección de personas son byte a byte idénticas a las de caras correspondientes, tal como ocurría en el repositorio ROS 1 de origen.

## Capacidades

- Reproducción de flujos de cámara RGB y profundidad alineada mediante `ros2 bag play`, apta para validar nodos de percepción en ROS 2 Humble.
- Cobertura de escenarios de prueba variados: una sola cara, múltiples caras, mirada mutua y dos condiciones de iluminación distintas.
- Datos de calibración intrínseca incluidos en los mensajes `CameraInfo`, lo que permite probar pipelines de reproyección 3D sin calibración adicional.
- Transformadas estáticas (`tf_static`) incluidas, necesarias para tests que dependen del árbol de transformadas del robot.
- Reutilización directa de las mismas grabaciones para los tests de detección de caras y de personas, al ser los bags de personas idénticos a los de caras.
- Compatibilidad con el ecosistema de herramientas de ROS 2 (`ros2 bag info`, `ros2 bag play`) y con la librería `rosbags` de Python.

## Casos de uso

- Tests unitarios de detección de caras: alimentar el nodo de detección del proyecto pepper4dec con las grabaciones `face_detection_test` para verificar que detecta correctamente una cara, varias caras y caras en mirada mutua, con resultados reproducibles en CI.
- Tests de detección de personas: usar las grabaciones `person_detection_test` para validar el detector de personas en los mismos escenarios, aprovechando que los bags son idénticos a los de caras y permiten comparar ambos detectores sobre la misma entrada.
- Validación de robustez frente a iluminación: ejecutar los bags `lighting_1` y `lighting_2` para comprobar cómo se degrada la detección con cambios de luz, un caso habitual en robots sociales desplegados en entornos reales.
- Pruebas de pipelines de profundidad: emplear el topic `compressedDepth` alineado al color para validar etapas de estimación de distancia o segmentación 3D, verificando la coherencia entre la imagen RGB y el mapa de profundidad.
- Integración continua en robótica: incorporar los bags a una suite de CI que arranque nodos ROS 2, reproduzca las grabaciones y compruebe métricas de detección, evitando depender de hardware físico durante el desarrollo.
- Desarrollo y depuración sin robot: permitir que desarrolladores sin acceso a una Pepper o a una RealSense reproduzcan escenarios reales de interacción humano-robot para depurar sus nodos de percepción.
- Referencia para conversión de bags ROS 1 a ROS 2: el repositorio y su script de conversión sirven como ejemplo práctico de migración con `rosbags` manteniendo topics y mensajes intactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 0,4 GB para el repositorio completo; cada bag individual ocupa una fracción de ese total.
- VRAM: no aplica, ya que no se ejecuta ningún modelo de IA; el consumo de memoria depende de los nodos ROS 2 que consuman los topics durante la reproducción.
- GPU: no se requiere GPU para reproducir los bags; sí puede ser necesaria para los nodos de detección que se prueben con ellos (por ejemplo, inferencia con modelos de visión).
- CPU: cualquier equipo capaz de ejecutar ROS 2 Humble; la decodificación de JPEG y PNG de profundidad a 640x480 y 15 fps es ligera.
- Despliegue: `ros2 bag play` sobre ROS 2 Humble (metadatos versión 8) o la librería `rosbags` de Python; también es posible leer los ficheros `.db3` directamente con SQLite.
- Latencia y throughput: no disponibles; dependen enteramente de los nodos que consuman los datos.

## Comparativa con modelos similares

| Repositorio | Contenido | Formato | Topics | Licencia |
|---|---|---|---|---|
| `cssr4africa/dec_unit_test_data_files` | 6 grabaciones únicas de caras y personas con RealSense D435i | rosbag2 (metadata v8 + .db3) | Color JPEG, profundidad comprimida, CameraInfo x2, tf_static | no disponible |
| `cssr4africa/cssr4africa_unit_tests_data_files` | Las mismas grabaciones originales | rosbag ROS 1 (.bag) | Equivalentes | no disponible |

No se dispone de información sobre otros conjuntos de datos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede usarse para inferencia; cualquier expectativa en ese sentido es un error de categoría.
- La licencia no está declarada en la información disponible, lo que impide confirmar si se permite el uso comercial o la redistribución; debe consultarse con el autor antes de reutilizar los datos fuera de los proyectos CSSR4Africa y pepper4dec.
- Las grabaciones muestran personas reales; la model card indica que se proporcionan para probar el software CSSR4Africa y pepper4dec en los mismos términos que los originales ROS 1, por lo que su uso para otros fines (entrenamiento de modelos de reconocimiento facial, por ejemplo) no está cubierto explícitamente.
- Solo cubren condiciones de interior con una RealSense D435i a 640x480 y 15 fps; no representan otros sensores, resoluciones ni entornos exteriores.
- Los cuatro bags de detección de personas son byte a byte idénticos a los de caras, por lo que no aportan escenarios nuevos y duplican el espacio ocupado.
- La versión de metadatos 8 limita la compatibilidad a ROS 2 Humble y versiones posteriores; distribuciones más antiguas pueden no leerlos directamente.
- No se proporcionan métricas de calidad de las grabaciones ni anotaciones ground truth de caras o personas, de modo que los tests que las usen deben definir sus propias comprobaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cssr4africa/dec_unit_test_data_files
- Repositorio original ROS 1: https://huggingface.co/cssr4africa/cssr4africa_unit_tests_data_files
- Proyecto pepper4dec: https://github.com/yohatad/pepper4dec
- Script de conversión: https://github.com/yohatad/pepper4dec/blob/devel/scripts/convert_cssr4africa_bags.sh
- Librería rosbags: https://gitlab.com/ternaris/rosbags
