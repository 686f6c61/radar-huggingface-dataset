# edvv1n/yunet-sface

## Resumen

`edvv1n/yunet-sface` es un repositorio de artefactos compilados que empaqueta dos modelos de visión por computador del OpenCV Zoo: YuNet, un detector de caras que localiza rostros y cinco puntos faciales (ojos, nariz y comisuras de la boca), y SFace, un modelo de reconocimiento facial que proyecta cada cara recortada en un espacio de embedding de 128 dimensiones. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un par de redes convolucionales ligeras orientadas a la detección y verificación facial en tiempo real.

El autor, `edvv1n`, ha compilado ambos modelos con IREE (Infrastructure for Runtime Execution Environments) para el proyecto Lumi, generando artefactos VMFB (VM FlatBuffer) listos para ejecución. El repositorio incluye, dentro del directorio `v1/`, un manifiesto, avisos de licencia y, para cada backend soportado (CPU, Metal, Vulkan y CUDA), un VMFB del detector y otro del reconocedor. Esta estructura permite desplegar el pipeline completo de detección más reconocimiento sobre distintas plataformas de cómputo sin depender del framework original.

La relevancia de este repositorio es acotada y muy específica: sirve a quien necesite ejecutar YuNet y SFace a través del runtime de IREE en lugar de OpenCV nativo, por ejemplo en despliegues embebidos o multiplataforma. El tamaño del repositorio es de 0,2 GB, coherente con modelos convolucionales pequeños. No hay información publicada sobre licencia, idiomas ni pipeline en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales (YuNet para deteccion facial, SFace para reconocimiento); compiladas a VMFB con IREE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica a la tarea) |
| Licencia | no disponible en la ficha de Hugging Face (el repositorio incluye avisos de licencia en `v1/`) |
| Formato de pesos | VMFB (VM FlatBuffer de IREE) para backends CPU, Metal, Vulkan y CUDA |

## Arquitectura y entrenamiento

YuNet es un detector facial convolucional ligero que predice cajas delimitadoras y cinco landmarks faciales por rostro. SFace es una red de reconocimiento facial que genera un embedding de 128 dimensiones por cara, pensado para comparación mediante distancia coseno o euclídea. Ambos proceden del OpenCV Zoo y están documentados en el repositorio oficial de OpenCV; esta ficha no dispone de detalles sobre el dataset de entrenamiento, el número de tokens (no aplica) ni el proceso de optimización empleado por los autores originales.

La innovación de este repositorio no está en el entrenamiento, sino en el empaquetado: los pesos originales se han compilado con IREE para cuatro backends de ejecución (CPU, Metal, Vulkan y CUDA), lo que permite ejecutar el pipeline de detección y reconocimiento sobre distintos aceleradores con un runtime común. El directorio `v1/` contiene el manifiesto y los avisos de licencia, lo que facilita la trazabilidad de los artefactos.

## Capacidades

- Detección de caras en imágenes con localización de caja delimitadora.
- Predicción de cinco landmarks faciales por rostro (ojos, nariz y comisuras de la boca).
- Extracción de embeddings faciales de 128 dimensiones mediante SFace.
- Verificación e identificación facial por comparación de embeddings.
- Ejecución sobre cuatro backends: CPU, Metal, Vulkan y CUDA.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües (no aplica).
- No incluye modo thinking, visión generativa ni audio.

## Casos de uso

- Control de acceso biométrico: el pipeline detecta la cara con YuNet, extrae el embedding con SFace y lo compara contra una base de embeddings registrados para conceder o denegar acceso.
- Verificación de identidad en aplicaciones móviles: los artefactos VMFB para Metal permiten ejecutar detección y reconocimiento en dispositivos Apple sin depender de OpenCV.
- Anonimización de vídeo: detección de rostros por fotograma y desenfoque o pixelado de las regiones delimitadas, útil en pipelines de privacidad.
- Análisis de aforo y presencia: conteo de caras detectadas en imágenes o streams para estimar ocupación en espacios controlados.
- Etiquetado automático de fotos: agrupación de imágenes por identidad usando la similitud de embeddings de 128 dimensiones.
- Despliegue multiplataforma con IREE: integración en aplicaciones que ya usan el runtime de IREE y necesitan visión facial sin añadir OpenCV como dependencia.
- Pruebas de regresión de modelos de visión: comparación de salidas entre backends (CPU frente a Vulkan o CUDA) para validar la compilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de modelos convolucionales pequeños y un repositorio de 0,2 GB, la huella de memoria es reducida, pero no se especifica.
- GPU recomendadas: no disponibles; los backends CUDA, Vulkan y Metal sugieren compatibilidad con GPU NVIDIA, GPU con soporte Vulkan y Apple Silicon, respectivamente.
- Compatibilidad con GPU de consumo: probable por el tamaño reducido de los modelos, pero no confirmada en la información disponible.
- Opciones de despliegue: runtime de IREE con los artefactos VMFB incluidos; también es posible usar los modelos originales de OpenCV Zoo fuera de este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| edvv1n/yunet-sface | Deteccion y reconocimiento facial | no disponible | no aplica | no disponible | Hugging Face (VMFB) |
| YuNet (OpenCV Zoo) | Deteccion facial | no disponible | no aplica | segun OpenCV Zoo | GitHub OpenCV Zoo |
| SFace (OpenCV Zoo) | Reconocimiento facial | no disponible | no aplica | segun OpenCV Zoo | GitHub OpenCV Zoo |
| MTCNN | Deteccion facial | no disponible | no aplica | no disponible | Multiples implementaciones |

La comparativa se limita a la tarea y al origen de los modelos; no hay datos de rendimiento publicados para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni admite instrucciones en lenguaje natural.
- El reconocimiento facial biométrico conlleva riesgos de sesgo demográfico y requiere evaluación específica antes de usarse en producción.
- No se especifica la licencia en la ficha de Hugging Face; el repositorio incluye avisos de licencia en `v1/`, que deben revisarse antes de cualquier uso comercial.
- Los embeddings de 128 dimensiones de SFace son más compactos que los de otros modelos de reconocimiento, lo que puede limitar la precisión en comparaciones a gran escala.
- El rendimiento depende del backend de IREE elegido; no hay datos publicados de latencia ni de precisión por backend.
- Riesgo de falsos positivos y negativos en detección con caras ocluidas, de perfil o con iluminación adversa; no se documentan métricas al respecto.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/edvv1n/yunet-sface
- OpenCV Zoo (modelos originales): https://github.com/opencv/opencv_zoo
- IREE (runtime de compilación): no se proporciona enlace en la información disponible.
