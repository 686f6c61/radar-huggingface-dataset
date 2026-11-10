# nxp/facenet512-imx

## Resumen

FaceNet512-imx es una versión cuantizada a int8 y compilada para plataformas NXP i.MX del conocido modelo FaceNet512, una red neuronal de reidentificación facial basada en la arquitectura Inception. El modelo original, desarrollado por Schroff et al. (Google) en 2015 y reimplementado en la librería DeepFace por Sefik Ilkin Serengil, regresa un vector de embedding facial de 512 dimensiones a partir de un recorte RGB de rostro de 160x160 píxeles. NXP ha adaptado estos pesos para ejecutarse eficientemente en sus MPUs i.MX 8M Plus, i.MX 93, i.MX 95 e i.MX 952, aprovechando las NPU integradas (Vivante VX, Ethos-U65 y eIQ Neutron).

El modelo resuelve el problema de verificación e identificación facial en el borde (edge computing): dado un rostro recortado, produce una representación vectorial que puede compararse contra una base de datos de embeddings conocidos mediante distancias (típicamente euclídea o coseno). Con 23,5 millones de parámetros y solo 23,4 MB en formato int8, es lo bastante compacto para ejecutarse en hardware embebido de bajo consumo sin renunciar a una calidad de embedding razonable para tareas de acceso, control de presencia o análisis demográfico en tiempo real.

La relevancia actual de esta ficha radica en que NXP publica artefactos precompilados por BSP y versión de SDK, lo que elimina gran parte del trabajo de integración en sistemas embebidos industriales. No es un modelo de propósito general ni un LLM: es un componente especializado de visión por computador pensado para integrarse en pipelines de detección + reconocimiento facial sobre dispositivos NXP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN tipo Inception (FaceNet, Schroff et al. 2015) |
| Parámetros totales | 23.497.424 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 160x160x3) |
| Tipos de cuantización | int8 post-training (entrada uint8 0-255, salida float32) |
| Idiomas soportados | no aplica (modelo de visión, sin componente lingüístico) |
| Licencia | MIT |
| Formato de pesos | LiteRT / TensorFlow Lite (`.tflite`), con variantes compiladas para Vela (Ethos-U65) y eIQ Neutron |
| Entrada | Tensor RGB (1, 160, 160, 3), uint8 |
| Salida | Embedding facial (1, 512), float32 |
| Cómputo | 2,84 GOPS |
| Tamaño del artefacto int8 | 23,4 MB |
| Framework de origen | TensorFlow/Keras (DeepFace 0.0.75) |
| Runtime | eIQ LiteRT (TensorFlow Lite) con delegado NPU por plataforma |

## Arquitectura y entrenamiento

El modelo base es FaceNet, una red convolucional profunda de tipo Inception que aprende una función de embedding tal que dos imágenes del mismo rostro quedan próximas en el espacio de 512 dimensiones y dos rostros distintos quedan alejados. El entrenamiento original (Schroff et al., CVPR 2015) empleó una pérdida de tripletas (triplet loss) sobre un corpus masivo de rostros, con el objetivo de que las distancias euclídeas entre embeddings reflejen la identidad. Los pesos distribuidos en este repositorio provienen de la implementación de DeepFace, que a su vez envuelve los pesos originales de Keras.

Las modificaciones introducidas por NXP son de despliegue, no de entrenamiento: conversión directa del modelo Keras a TensorFlow Lite, cuantización completa post-training a int8 con entrada uint8 y salida float32, calibración sobre 100 imágenes aleatorias de un subconjunto comercialmente usable de ImageNetV2 redimensionadas a 160x160 y escaladas a [0, 1], y compilación específica por plataforma. Para i.MX 93 se usa Vela con `--accelerator-config ethos-u65-256 --optimise Performance` (tags BSP lf-6.18.20_2.0.0 y lf-6.18.37_2.1.0). Para i.MX 95 e i.MX 952 se emplea el eIQ Neutron SDK en versiones 3.1.3, 3.2.1 y 3.2.3. El repositorio incluye además `recipe.sh` para regenerar los artefactos, `example.py` como ejemplo de inferencia y `evaluate.py` para evaluación.

## Capacidades

- Extracción de embeddings faciales de 512 dimensiones a partir de un recorte RGB de 160x160 píxeles.
- Verificación facial 1:1 (comparar dos embeddings y decidir si pertenecen a la misma persona mediante umbral de distancia).
- Identificación facial 1:N (búsqueda del embedding más cercano en una galería de rostros conocidos).
- Ejecución en NPU integradas de NXP: Vivante VX en i.MX 8M Plus, Ethos-U65 en i.MX 93 y eIQ Neutron en i.MX 95 / i.MX 952.
- Inferencia en el borde con modelo int8 de 23,4 MB, apto para dispositivos con recursos limitados.
- No incluye detección facial: requiere un detector previo (por ejemplo, MTCNN, RetinaFace o similar) que localice y recorte el rostro.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingües ni de generación de texto.
- Sin modo "thinking", sin visión general (solo rostros), sin audio.

## Casos de uso

- Control de acceso físico en edificios: el modelo genera el embedding del rostro capturado por una cámara y lo compara contra una galería de empleados autorizados; su tamaño int8 y su ejecución sobre NPU i.MX lo hacen adecuado para terminales de puerta alimentados por PoE y sin GPU dedicada.
- Verificación de identidad en quioscos de autoservicio: integrado en un dispositivo i.MX 95 con cámara, permite confirmar que la persona frente al terminal coincide con el documento presentado, ejecutando la comparación 1:1 en local sin enviar imágenes a la nube.
- Videovigilancia con análisis en el borde: sobre una cámara IP con SoC i.MX 8M Plus, el modelo extrae embeddings de los rostros detectados y los reenvía a un servidor central para búsqueda retrospectiva, reduciendo el ancho de banda al transmitir solo vectores de 512 float32 en lugar de vídeo.
- Sistemas de asistencia y registro horario: en un terminal i.MX 93 con Ethos-U65, el modelo permite fichar por reconocimiento facial en menos de un segundo, con el modelo precompilado listo para el BSP del cliente.
- Análisis demográfico agregado en retail: procesando localmente los embeddings de visitantes (sin almacenar imágenes), se pueden calcular métricas de reincidencia y flujos de personas respetando la privacidad, ya que los embeddings pueden hashearse o descartarse tras el conteo.
- Autenticación en dispositivos industriales o vehículos: en paneles de control con i.MX 952, el modelo habilita el desbloqueo por rostro del operario antes de acceder a funciones críticas, con la ventaja de que toda la inferencia ocurre en el dispositivo.
- Integración en pipelines de CI/CD de visión: los scripts `recipe.sh` y `evaluate.py` permiten regenerar y validar los artefactos cuantizados al actualizar el BSP o el SDK, facilitando la reproducibilidad en despliegues de flota.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de cómputo y tamaño (2,84 GOPS, 23.497.424 parámetros, 23,4 MB en int8), sin precisar exactitud de verificación (por ejemplo, accuracy en LFW) ni latencia medida sobre las NPU objetivo.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido de GPU de escritorio; el modelo ocupa 23,4 MB en memoria para los pesos int8 y opera sobre tensores de 160x160x3 de entrada.
- GPU recomendadas: no aplica; el modelo está pensado para NPU integradas en SoC NXP (Vivante VX, Ethos-U65, eIQ Neutron).
- ¿Cabe en GPU consumer? Sí, cualquier GPU moderna puede ejecutar el `.tflite` genérico mediante el delegado correspondiente, pero el objetivo del artefacto es el despliegue embebido.
- Opciones de despliegue: runtime eIQ LiteRT (TensorFlow Lite) con delegado VX (i.MX 8M Plus), Vela/Ethos-U (i.MX 93) o Neutron (i.MX 95 / i.MX 952). También es posible usar el `.tflite` genérico con TensorFlow Lite estándar en CPU.
- Latencia y throughput: no disponible en la información proporcionada; depende de la NPU, la versión de BSP y el SDK empleados.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión de embedding | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FaceNet512-imx (este) | 23,5 M | 512 | 160x160x3 | MIT | Hugging Face (nxp/facenet512-imx) |
| FaceNet (original, Schroff et al.) | ~23-27 M (según variante) | 128 / 512 | 160x160x3 | MIT (reimpl. DeepFace) | Repositorios académicos y DeepFace |
| ArcFace (InsightFace) | ~24-65 M según backbone | 512 | 112x112x3 | MIT (InsightFace) | Hugging Face, repositorios InsightFace |
| FaceNet de DeepFace (sin cuantizar) | 23,5 M | 512 | 160x160x3 | MIT | GitHub serengil/deepface |

La comparación con ArcFace es la más relevante: ArcFace suele obtener mejor exactitud en benchmarks de verificación (LFW, CFP-FP, AgeDB) gracias a la pérdida de margen angular, pero no ofrece artefactos precompilados para NPU NXP. FaceNet512-imx sacrifica algo de precisión potencial a cambio de un despliegue trivial sobre i.MX. Frente al FaceNet de DeepFace sin cuantizar, la diferencia es el formato (`.tflite` int8 frente a Keras) y la compilación por plataforma.

## Limitaciones y advertencias

- No es un detector facial: requiere un recorte previo del rostro; pasarle una imagen completa producirá embeddings sin sentido.
- La cuantización int8 puede degradar ligeramente la exactitud respecto al modelo float original; la calibración se hizo con solo 100 imágenes de ImageNetV2, no con un corpus facial específico, lo que puede introducir sesgo en la distribución de activaciones.
- Riesgo de sesgo demográfico heredado del entrenamiento original de FaceNet (VGGFace2/CASIA-WebFace en la cadena DeepFace); la model card no documenta evaluaciones de equidad por género, edad o etnia.
- Sensible a condiciones de captura: iluminación, pose, oclusión, resolución y calidad del recorte afectan directamente a la distancia entre embeddings.
- Uso comercial permitido por licencia MIT, pero el despliegue de reconocimiento facial está sujeto a normativa específica (RGPD en la UE, AI Act para sistemas de identificación biométrica); la licencia no exime del cumplimiento legal.
- No hay información publicada sobre latencia real, throughput ni exactitud de verificación (por ejemplo, accuracy en LFW) en las NPU objetivo.
- El repositorio incluye múltiples artefactos por BSP y versión de SDK; usar una combinación incorrecta de BSP y delegado puede provocar fallos de carga o resultados incorrectos.
- El modelo está atado al ecosistema NXP i.MX; fuera de esas plataformas se pierde la ventaja de compilación y solo queda el `.tflite` genérico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nxp/facenet512-imx
- Paper original de FaceNet (Schroff et al., CVPR 2015): https://www.cv-foundation.org/openaccess/content_cvpr_2015/html/Schroff_FaceNet_A_Unified_2015_CVPR_paper.html
- Repositorio DeepFace: https://github.com/serengil/deepface/
- Vela (compilador Ethos-U de NXP): https://github.com/nxp-imx/ethos-u-vela
- Artefacto i.MX 8M Plus: https://huggingface.co/nxp/facenet512-imx/blob/main/assets/imx8mplus/facenet512_uint8_float32.tflite
- Artefacto i.MX 93 (BSP lf-6.18.20_2.0.0): https://huggingface.co/nxp/facenet512-imx/blob/main/assets/imx93/lf-6.18.20_2.0.0/facenet512_uint8_float32_vela.tflite
- Artefacto i.MX 93 (BSP lf-6.18.37_2.1.0): https://huggingface.co/nxp/facenet512-imx/blob/main/assets/imx93/lf-6.18.37_2.1.0/facenet512_uint8_float32_vela.tflite
- Artefacto i.MX 95 (Neutron SDK 3.1.3): https://huggingface.co/nxp/facenet512-imx/blob/main/assets/imx95/3.1.3/facenet512_uint8_float32_converted.tflite
- Artefacto i.MX 95 (Neutron SDK 3.2.1): https://huggingface.co/nxp/facenet512-imx/blob/main/assets/imx95/3.2.1/facenet512_uint8_float32_converted.tflite
- Artefacto i.MX 95 (Neutron SDK 3.2.3): https://huggingface.co/nxp/facenet512-imx/blob/main/assets/imx95/3.2.3/facenet512_uint8_float32_converted.tflite
- Artefacto i.MX 952 (Neutron SDK 3.1.3): https://huggingface.co/nxp/facenet512-imx/blob/main/assets/imx952/3.1.3/facenet512_uint8_float32_converted.tflite
- Artefacto i.MX 952 (Neutron SDK 3.2.1): https://huggingface.co/nxp/facenet512-imx/blob/main/assets/imx952/3.2.1/facenet512_uint8_float32_converted.tflite
- Artefacto i.MX 952 (Neutron SDK 3.2.3): https://huggingface.co/nxp/facenet512-imx/blob/main/assets/imx952/3.2.3/facenet512_uint8_float32_converted.tflite
