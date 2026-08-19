# gabriellidenor/EmoteVision

## Resumen

EmoteVision es un modelo de clasificación de imágenes diseñado para el reconocimiento de expresiones faciales, desarrollado por Gabriel Lidenor. Se presenta como un pipeline completo de entrenamiento y evaluación que utiliza un backbone ResNet50 preentrenado y una cabeza de clasificación lineal para asignar categorías emocionales (feliz, triste, enfadado, etc.) a imágenes faciales. El modelo está pensado como una solución compacta y reproducible para tareas de visión por computador, con un enfoque práctico orientado a desarrolladores que necesitan integrar clasificación de emociones en sus aplicaciones.

La relevancia actual del modelo radica en su simplicidad y su licencia permisiva MIT, que permite uso comercial sin restricciones. Al estar construido sobre PyTorch y torchvision, se integra fácilmente en flujos de trabajo existentes. El proyecto incluye un pipeline end-to-end que cubre descarga de datos, entrenamiento, evaluación y exportación de métricas, lo que facilita su reproducción y adaptación. No se especifican el número total de parámetros ni otros detalles arquitectónicos más allá del backbone ResNet50, por lo que parte de la información técnica no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (backbone preentrenado) + cabeza de clasificación lineal con embedding intermedio (Linear + ReLU + Linear) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas del dataset en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (state dict, safetensors probablemente, no confirmado) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transfer learning clásica: un backbone ResNet50 preentrenado en ImageNet, con la mayoría de sus capas congeladas excepto la última capa (`layer4`). Sobre el backbone se añade una cabeza de embedding (Linear + ReLU) seguida de un clasificador lineal que produce logits para las clases de emoción. El entrenamiento utiliza `CrossEntropyLoss`, apropiado para clasificación multiclase supervisada, y se optimiza con un optimizador estándar de PyTorch (no especificado).

El dataset utilizado es `gabriellidenor/facial_emotion_images` de Hugging Face, que proporciona imágenes faciales con etiquetas categóricas. Las transformaciones aplicadas son `Grayscale -> ToTensor -> Normalize`. El autor justifica la elección de un enfoque de clasificación directa frente a métricas de aprendizaje (metric learning) por su simplicidad, estabilidad numérica y reproducibilidad. No se mencionan técnicas avanzadas como aumento de datos, aprendizaje contrastivo o RLHF, dado que es un modelo de visión supervisado estándar.

## Capacidades

- Clasificación de expresiones faciales en categorías emocionales discretas (p. ej., feliz, triste, enfadado).
- Extracción de características visuales mediante backbone ResNet50 preentrenado.
- Inferencia sobre imágenes individuales o lotes mediante PyTorch DataLoader.
- Exportación de métricas de evaluación (precisión, recall, F1) y matriz de confusión.
- Pipeline reproducible de entrenamiento y evaluación con configuración por CLI.
- Soporte de aceleración por GPU (CUDA) y Apple Silicon (MPS), según los badges del repositorio.

## Casos de uso

- Análisis de sentimiento en vídeo: el modelo puede clasificar emociones en fotogramas de vídeo para aplicaciones de investigación de mercado o análisis de reacciones de usuarios, procesando cada frame de forma independiente.
- Sistemas de atención al cliente: integración en kioscos o chatbots con cámara para detectar frustración o satisfacción del cliente en tiempo real, ajustando la respuesta del sistema.
- Herramientas de accesibilidad: ayudar a personas con dificultades de comunicación no verbal a expresar o interpretar emociones mediante una interfaz que clasifica expresiones faciales.
- Investigación en psicología: análisis de expresiones faciales en estudios de comportamiento, donde la clasificación automática acelera el etiquetado manual de grandes conjuntos de datos.
- Sistemas de recomendación de contenido: ajustar recomendaciones de música, vídeo o publicidad según la emoción detectada en el rostro del usuario.
- Control de calidad en entornos educativos: detectar aburrimiento o confusión en estudiantes durante cursos online para adaptar el ritmo de la enseñanza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall o F1 sobre el dataset de test, ni comparaciones con otros modelos de clasificación de emociones.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un ResNet50 con capas congeladas, el entrenamiento con batch pequeño (8) y una época puede ejecutarse en GPUs con 8-12 GB de VRAM (p. ej., RTX 3060, RTX 3070). La inferencia es ligera y puede correr en CPU.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GB de VRAM para entrenamiento; para inferencia, incluso CPU es viable.
- Compatible con consumer GPUs: sí, modelos como RTX 3060/4060 o superiores son suficientes.
- Opciones de despliegue: al ser un modelo PyTorch estándar, se puede servir con TorchServe, FastAPI, o exportar a ONNX para inferencia optimizada. No hay soporte nativo para vLLM, llama.cpp u Ollama (orientados a modelos de lenguaje).
- Latencia y throughput: no disponibles. La inferencia de ResNet50 en GPU moderna suele estar en el rango de 5-15 ms por imagen, pero no se han medido para este modelo concreto.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros clasificadores de emociones faciales (como los basados en VGG, EfficientNet o MobileNet). Al no haber datos de rendimiento, no es posible establecer una comparación cuantitativa. Alternativas genéricas en el mismo espacio incluyen modelos como `fer2013` basados en CNN pequeñas o `DeepFace` para análisis facial, pero sin datos concretos de este modelo no se puede hacer una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset específico (`facial_emotion_images`), el modelo puede heredar sesgos de género, edad o etnia presentes en los datos. No se documentan medidas de mitigación.
- Riesgo de alucinación: no aplica directamente al ser un clasificador, pero puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto: el modelo solo procesa imágenes estáticas; no maneja secuencias temporales ni vídeo completo.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial y modificación, sin obligación de compartir derivados.
- Advertencias para producción: la model card no especifica el número de clases ni el rendimiento esperado, por lo que es necesario validar el modelo en el dominio objetivo antes de desplegarlo. El pipeline está pensado para investigación y prototipado, no para alta disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabriellidenor/EmoteVision
- Dataset utilizado: https://huggingface.co/datasets/gabriellidenor/facial_emotion_images
- Perfil del autor en Hugging Face: https://huggingface.co/gabriellidenor
- Perfil del autor en GitHub: https://github.com/GabrielLidenor
