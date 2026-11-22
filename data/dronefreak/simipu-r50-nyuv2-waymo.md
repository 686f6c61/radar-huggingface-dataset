# dronefreak/simipu-r50-nyuv2-waymo

## Resumen

SimIPU R50 NYUv2 Waymo es un modelo de estimación de profundidad monocular basado en un encoder ResNet-50 preentrenado con SimIPU sobre el conjunto Waymo (una quinta parte del dataset) y afinado posteriormente sobre NYUv2 para la tarea de predicción de mapas de profundidad a partir de una única imagen RGB. Lo desarrolla el equipo de Zhenyu Li et al. en el marco del proyecto Monocular-Depth-Estimation-Toolbox, y esta ficha concreta es un espejo no oficial publicado por el usuario dronefreak en Hugging Face.

El modelo resuelve el problema de estimar profundidad densa por píxel sin necesidad de sensores activos (LiDAR, estéreo o time-of-flight), lo que lo hace útil en robótica, conducción autónoma, realidad aumentada y reconstrucción 3D a partir de imágenes convencionales. Su interés técnico radica en que el encoder se inicializa con SimIPU, un método de preentrenamiento autosupervisado que combina imágenes 2D con nubes de puntos 3D para aprender representaciones con conciencia espacial, en lugar de partir de un backbone supervisado con ImageNet.

Arquitectura ResNet-50 con cabeza de profundidad del toolbox, 77,8 millones de parámetros, pesos en safetensors y PyTorch, licencia Apache-2.0. El repositorio ocupa 1,2 GB e incluye tanto el checkpoint original en formato `.pth` como una copia bit-exacta de los tensores en `model.safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (encoder) + cabeza de profundidad de Monocular-Depth-Estimation-Toolbox |
| Parametros totales | 77.823.809 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y PyTorch (`simipu_waymo_50e_nyu.pth`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas típica en estimación de profundidad monocular: un encoder convolucional ResNet-50 que extrae características de la imagen de entrada y una cabeza de decodificación específica del toolbox que produce el mapa de profundidad denso. La innovación principal no está en la arquitectura en sí, sino en la estrategia de inicialización del encoder: SimIPU (Simple 2D Image and 3D Point Cloud Unsupervised Pre-Training for Spatial-Aware Visual Representations, AAAI 2022) preentrena el backbone de forma autosupervisada aprovechando la correspondencia entre imágenes 2D y nubes de puntos 3D capturadas simultáneamente, de modo que las representaciones aprendidas codifican información espacial y geométrica en lugar de solo semántica visual.

En esta variante concreta, el preentrenamiento SimIPU se realizó sobre el dataset Waymo, utilizando una quinta parte de sus datos. Posteriormente, el modelo completo se afina sobre NYUv2 durante 24 épocas. El autor del espejo indica que los pesos son idénticos a los del repositorio oficial y que el `model.safetensors` es una copia bit-exacta del `state_dict` del checkpoint, sin estado del optimizador. No se documentan en la información disponible detalles sobre el número exacto de tokens o muestras de entrenamiento, la composición precisa del dataset más allá de NYUv2 y Waymo, ni si se aplicaron técnicas de regularización o aumentos específicos más allá del flip horizontal empleado en la evaluación.

## Capacidades

- Estimación de profundidad monocular densa a partir de una única imagen RGB.
- Predicción de mapas de profundidad métricos calibrados para el dominio de interiores de NYUv2.
- Transferencia de representaciones espaciales aprendidas con datos 3D reales (Waymo) al dominio de interiores.
- Extracción de características visuales con conciencia espacial gracias al preentrenamiento SimIPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo de razonamiento explícito (thinking mode), visión multi-imagen, audio ni otras modalidades.

## Casos de uso

- Reconstrucción 3D de escenas de interior: a partir de una foto de una habitación, el modelo genera un mapa de profundidad que puede proyectarse a una nube de puntos para modelado arquitectónico o inventario de espacios.
- Realidad aumentada en dispositivos móviles: la estimación de profundidad monocular permite colocar objetos virtuales con oclusión correcta respecto a la escena real sin necesidad de LiDAR.
- Navegación de robots de interior: un robot con cámara RGB puede usar el mapa de profundidad para detectar obstáculos y planificar trayectorias en entornos domésticos, donde NYUv2 es representativo.
- Análisis de imágenes médicas o de obra civil: la profundidad densa ayuda a medir distancias relativas en escenas controladas donde no se dispone de sensores activos.
- Generación de efectos de desenfoque de fondo (bokeh) en fotografía computacional: el mapa de profundidad permite segmentar primer plano y fondo para aplicar desenfoque selectivo realista.
- Benchmarking de estrategias de preentrenamiento: el modelo sirve como referencia para comparar inicializaciones (desde cero, ImageNet supervisado, SimIPU en KITTI, SimIPU en Waymo) en tareas de profundidad monocular.
- Preprocesado para pipelines de detección o segmentación: la profundidad estimada puede enriquecer las características de otros modelos que operan sobre imágenes RGB.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Abs Rel (NYUv2, con flip) | 0.166 |

El autor del espejo reporta únicamente el error absoluto relativo (Abs Rel) de 0.166 sobre NYUv2 con aumento por flip horizontal. No se han publicado en la información disponible resultados adicionales como RMSE, delta1, delta2 o delta3, ni comparaciones numéricas con otras inicializaciones del mismo backbone. Para tablas completas y detalles de evaluación, el autor remite al repositorio oficial del toolbox.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en FP32 para una imagen de entrada de resolución moderada (el modelo tiene 77,8 M de parámetros, unos 311 MB en FP32); en FP16 se reduce a unos 156 MB de pesos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100, H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: al ser un modelo PyTorch con código oficial específico, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje). El despliegue habitual es cargar el checkpoint con el código de Monocular-Depth-Estimation-Toolbox o cargar `model.safetensors` con `safetensors.torch.load_file` en la misma definición de red.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán de la GPU y de la resolución de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Abs Rel NYUv2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimIPU R50 NYUv2 Waymo (este) | 77,8 M | no aplica | 0.166 (+flip) | Apache-2.0 | Hugging Face (espejo) |
| Mismo backbone con inicialización ImageNet | ~77,8 M | no aplica | no disponible en la información | Apache-2.0 (toolbox) | Repositorio oficial |
| Mismo backbone desde cero | ~77,8 M | no aplica | no disponible en la información | Apache-2.0 (toolbox) | Repositorio oficial |
| SimIPU R50 NYUv2 KITTI | ~77,8 M | no aplica | no disponible en la información | Apache-2.0 (toolbox) | Repositorio oficial |

La información disponible solo permite comparar cualitativamente con las otras inicializaciones del mismo toolbox; no se aportan cifras de Abs Rel para las variantes alternativas, por lo que no es posible establecer una comparación numérica completa. Tampoco se dispone de datos de modelos de profundidad monocular de otros autores (por ejemplo, MiDaS o Depth Anything) en la información proporcionada.

## Limitaciones y advertencias

- Es un espejo no oficial: el autor original no ha validado esta publicación; para uso en producción conviene descargar los pesos del repositorio oficial y verificar la integridad.
- Dominio restringido: el afinamiento se realizó sobre NYUv2, un dataset de interiores; el rendimiento en escenas de exterior, nocturnas o con condiciones meteorológicas adversas puede degradarse notablemente.
- Riesgo de alucinación geométrica: como todo modelo de profundidad monocular, puede producir mapas plausibles pero incorrectos en regiones ocluidas, superficies reflectantes, texturas repetitivas o iluminación atípica.
- Sesgos del dataset: NYUv2 contiene un número limitado de escenas y cámaras; el modelo puede estar sesgado hacia la distribución de interiores, mobiliario y geometría de ese conjunto.
- Sin soporte lingüístico ni multimodal: no es adecuado para tareas de texto, código, razonamiento o agentes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor del espejo recomienda citar el trabajo original y contactar si se desea modificar o retirar la publicación.
- Sin cuantizaciones oficiales ni integración con frameworks de inferencia de alto nivel: el despliegue requiere código específico del toolbox.
- No se documentan métricas de calibración absoluta ni evaluación en otros datasets, lo que limita la confianza para aplicaciones métricas críticas.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/simipu-r50-nyuv2-waymo
- Paper SimIPU (arXiv): https://arxiv.org/abs/2112.04680
- Repositorio oficial Monocular-Depth-Estimation-Toolbox: https://github.com/zhyever/Monocular-Depth-Estimation-Toolbox
- Dataset NYUv2 (espejo en el Hub): https://huggingface.co/datasets/dronefreak/NYUv2
