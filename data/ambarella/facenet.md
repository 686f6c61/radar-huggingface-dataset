# Ambarella/Facenet

## Resumen

FaceNet es un marco de aprendizaje métrico profundo (deep metric learning) para reconocimiento y verificación facial que proyecta imágenes de rostros en un espacio de embeddings compacto donde la distancia euclídea entre vectores corresponde directamente a la similitud entre caras. El modelo fue descrito originalmente en el artículo "FaceNet: A Unified Embedding for Face Recognition and Clustering" (arXiv:1503.03832) y esta ficha concreta corresponde al repositorio `Ambarella/Facenet`, publicado por Ambarella, que empaqueta una implementación de FaceNet con backbone MobileNetV1 y pesos optimizados para sus propios aceleradores de visión (SoCs N1-655, X7, CV7, CV72 y CV75).

El problema que resuelve es la verificación e identificación de identidades a partir de una imagen facial: en lugar de clasificar caras en categorías cerradas, genera un embedding de 128 dimensiones (configuración habitual de FaceNet) que permite comparar, agrupar y buscar rostros mediante distancia L2. Al emplear MobileNetV1 como extractor de características y una resolución de entrada de 3x160x160, el modelo está pensado para inferencia en tiempo real en dispositivos móviles y embebidos, no para servidores de altas prestaciones.

La relevancia actual del repositorio es fundamentalmente práctica: Ambarella distribuye los binarios precompilados y optimizados para su familia de chips de visión, lo que facilita el despliegue en cámaras IP, sistemas de control de acceso y dispositivos de borde. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una red convolucional de visión especializada en biometría facial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con backbone MobileNetV1 y cabeza de embedding métrico (FaceNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 3x160x160) |
| Tipos de cuantizacion | no disponible (se distribuyen binarios "Amba_optimized" propietarios) |
| Idiomas soportados | no aplica (visión; sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | binarios `.bin` optimizados para hardware Ambarella; el repositorio declara `pytorch` como librería |
| Resolución de entrada | 3x160x160 |
| Dispositivos soportados | N1-655, X7, CV7, CV72, CV75 |
| Versiones de SDK | Cooper SDK 2.5.4, Cooper Foundry 2.3 |

## Arquitectura y entrenamiento

FaceNet se basa en una red convolucional profunda que aprende una función de embedding `f(x)` que mapea una imagen facial `x` a un vector en un espacio d-dimensional (típicamente 128 dimensiones). El entrenamiento original emplea una función de pérdida de tripletas (triplet loss) que fuerza a que las distancias entre embeddings de la misma identidad sean menores que las distancias entre identidades distintas más un margen. En esta variante concreta, el extractor de características es MobileNetV1, una CNN ligera basada en convoluciones separables en profundidad, lo que reduce drásticamente el coste computacional y el número de parámetros frente a las Inception originales de FaceNet.

No se especifican en la información disponible el número de tokens ni la composición exacta del dataset de entrenamiento, aunque por el artículo original se sabe que FaceNet se entrenó sobre cientos de millones de caras. El repositorio de Ambarella no documenta si se realizó un reentrenamiento propio, fine-tuning o cuantización específica para sus aceleradores; únicamente indica que los pesos provienen de una implementación de referencia (`bubbliiiing/facenet-pytorch`) y de un peso original alojado en Baidu Pan. La innovación técnica destacable en este paquete es la optimización de los binarios para el hardware Ambarella, orientada a latencia baja y consumo reducido en el borde.

## Capacidades

- Extracción de embeddings faciales de 128 dimensiones (configuración estándar de FaceNet) a partir de imágenes de entrada de 3x160x160.
- Verificación facial 1:1 mediante comparación de distancia L2 entre embeddings.
- Identificación facial 1:N y clustering de rostros por similitud en el espacio de embeddings.
- Reconocimiento en tiempo real sobre hardware embebido Ambarella (N1-655, X7, CV7, CV72, CV75).
- Funcionamiento en dispositivos de borde con recursos limitados gracias al backbone MobileNetV1.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo de visión.
- No dispone de capacidades multilingües ni de generación de texto.
- No incluye modo "thinking", visión general (solo rostros), audio ni otras modalidades.

## Casos de uso

- Control de acceso físico: el modelo genera un embedding del rostro capturado por la cámara y lo compara con la plantilla almacenada del usuario; la distancia L2 por debajo de un umbral determina la concesión de acceso. Es adecuado por su baja latencia en SoCs Ambarella.
- Autenticación en dispositivos de borde: integrado en cámaras IP o terminales de identificación que ejecutan el binario optimizado para CV7/CV72, permitiendo verificación local sin enviar imágenes a la nube.
- Videovigilancia con búsqueda de personas: los embeddings extraídos de fotogramas se indexan y permiten búsquedas por similitud sobre un rostro de referencia, útil en sistemas de seguridad con múltiples cámaras.
- Verificación de identidad en kioscos o tornos: comparación 1:1 entre la imagen del documento y la captura en vivo, con el modelo ejecutándose en el propio terminal embebido.
- Análisis de afluencia y agrupamiento de visitantes: clustering de embeddings para contar personas únicas en un recinto sin almacenar identificadores biométricos persistentes.
- Aplicaciones móviles de reconocimiento facial: al emplear MobileNetV1 y una entrada de 160x160, el modelo es viable en smartphones y dispositivos portátiles con aceleración hardware.
- Preprocesado biométrico en pipelines de vídeo: generación de embeddings por fotograma para alimentar sistemas de seguimiento o re-identificación en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo CNN ligero con backbone MobileNetV1 y entrada 3x160x160, la huella de memoria es reducida, pero no se documentan cifras concretas.
- GPU recomendadas: no se especifican; el repositorio está orientado a aceleradores Ambarella (N1-655, X7, CV7, CV72, CV75) en lugar de GPU de servidor.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; los binarios distribuidos son específicos del hardware Ambarella y no se garantiza su ejecución en RTX 4090, RTX 3090 u otras GPU consumer sin conversión.
- Opciones de despliegue: binarios `.bin` "Amba_optimized" para los SoCs listados, con Cooper SDK 2.5.4 y Cooper Foundry 2.3. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | Resolución | Embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ambarella/Facenet (esta ficha) | MobileNetV1 | 3x160x160 | 128 (estándar FaceNet) | no disponible | Binarios para SoCs Ambarella |
| FaceNet original (Schroff et al., 2015) | Inception (v1/v2) | 160x160 | 128 | Investigación (uso no comercial en algunas versiones) | Pesos no oficiales en diversos repos |
| facenet-pytorch (bubbliiiing) | InceptionResnetV1 / MobileNetV1 | 160x160 | 512 / 128 | MIT (repositorio de referencia) | Pesos PyTorch en GitHub |
| ArcFace (InsightFace) | ResNet / MobileNet | 112x112 | 512 | MIT (código) / modelos con licencia propia | Amplia disponibilidad en InsightFace |

La comparativa se limita a nivel de arquitectura y disponibilidad, ya que no se han publicado métricas de precisión (LFW, VGGFace2, IJB-C) para esta variante concreta de Ambarella.

## Limitaciones y advertencias

- Sesgos conocidos: los modelos de reconocimiento facial entrenados con datasets no balanceados pueden presentar menor precisión en determinados grupos demográficos; no se documenta la composición del dataset de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos/negativos en la verificación según el umbral de distancia L2 elegido.
- Limitaciones de contexto o idioma: al ser un modelo de visión, no procesa texto ni lenguaje; su alcance se restringe a imágenes de rostros.
- Restricciones de licencia: la licencia no está declarada en el repositorio, lo que impide confirmar si el uso comercial está permitido. Es imprescindible contactar con Ambarella o revisar los términos del SDK antes de un despliegue en producción.
- Dependencia de hardware: los binarios están optimizados para SoCs Ambarella concretos; su portabilidad a otras plataformas no está garantizada.
- Privacidad y cumplimiento: el uso de reconocimiento facial está sujeto al RGPD y a normativas biométricas; se requiere base legal, consentimiento y evaluación de impacto.
- Documentación incompleta: no se publican parámetros totales, cuantizaciones, métricas de precisión ni detalles del proceso de entrenamiento, lo que dificulta la evaluación rigurosa del modelo.
- Tamaño del repositorio de 0.0 GB y solo 11 descargas: la adopción es muy baja, lo que reduce la probabilidad de soporte comunitario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ambarella/Facenet
- Paper original FaceNet: https://arxiv.org/abs/1503.03832
- Implementación de referencia (bubbliiiing/facenet-pytorch): https://github.com/bubbliiiing/facenet-pytorch
- Pesos originales FaceNet MobileNetV1 (Baidu Pan): https://pan.baidu.com/s/1K20hyxU_UgSej1eZWih0Ag (código de extracción: anv6)
- Binario N1-655: https://huggingface.co/Ambarella/Facenet/blob/main/n1-655_facenet_mobilenet_amba_optimized.bin
- Binario X7: https://huggingface.co/Ambarella/Facenet/blob/main/x7_facenet_mobilenet_amba_optimized.bin
- Binario CV7: https://huggingface.co/Ambarella/Facenet/blob/main/cv7_facenet_mobilenet_amba_optimized.bin
- Binario CV72: https://huggingface.co/Ambarella/Facenet/blob/main/cv72_facenet_mobilenet_amba_optimized.bin
- Binario CV75: https://huggingface.co/Ambarella/Facenet/blob/main/cv75_facenet_mobilenet_amba_optimized.bin
