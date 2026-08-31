# HoopitAI/video-deepfake-detection-GenD_DINOv3_L_FF

## Resumen

El modelo `HoopitAI/video-deepfake-detection-GenD_DINOv3_L_FF` es un detector de deepfakes en vídeo basado en el framework GenD, presentado en el artículo "Deepfake Detection that Generalizes Across Benchmarks" (WACV 2026). Desarrollado por HoopitAI, este modelo utiliza como backbone visual el transformer preentrenado `facebook/dinov3-vitl16-pretrain-lvd1689m` (DINOv3 ViT-L/16) y lo adapta de forma paramétricamente eficiente para la detección de manipulaciones faciales en vídeo.

El problema que resuelve es la generalización de los detectores de deepfake a técnicas de manipulación no vistas durante el entrenamiento, un reto clave para el despliegue práctico. En lugar de añadir complejidad arquitectónica, GenD congela el backbone y solo ajusta los parámetros de Layer Normalization (aproximadamente el 0,03 % del total), junto con un head lineal normalizado y un entrenamiento con optimización SAM (Sharpness-Aware Minimization) y pérdidas de uniformidad y alineación. El modelo se entrena sobre FaceForensics++ (FF++) y alcanza un AUROC de vídeo del 91,84 % en ese conjunto.

Con 303 millones de parámetros y un tamaño de repo de 1,2 GB, es un modelo de visión por computadora de tamaño medio, adecuado para inferencia en GPUs de consumo. Su licencia MIT permite uso comercial sin restricciones, lo que lo hace atractivo para integración en productos de moderación y análisis forense.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L/16 (DINOv3) con head lineal normalizado (LinearNorm) |
| Parametros totales | 303.131.650 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, procesa imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (aunque es un modelo visual, la etiqueta de idioma es en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del framework GenD: un backbone visual DINOv3 ViT-L/16 preentrenado en LVD-1689M, congelado durante el entrenamiento, y un head de clasificación lineal normalizado (LinearNorm) que proyecta las características L2-normalizadas sobre una hipersfera. La adaptación se limita a los parámetros de Layer Normalization del backbone, lo que reduce drásticamente el número de parámetros entrenables y evita el sobreajuste a artefactos específicos de manipulación.

El entrenamiento se realiza sobre FaceForensics++ (FF++) con recortes de rostros alineados. Se utiliza el optimizador SAM-AdamW (con rho=0,05 y modo adaptativo) para encontrar mínimos planos que resistan cambios de dominio, junto con una función de pérdida compuesta por entropía cruzada con label smoothing (0,1), pérdida de uniformidad (0,5) y pérdida de alineación (0,1). Se entrenan 30 épocas con batch size de 96 y precisión mixta bf16. El learning rate es 0,0003.

## Capacidades

- Detección de deepfakes en vídeo: clasifica cada frame como real o falso, y agrega las predicciones a nivel de vídeo.
- Generalización cross-dataset: diseñado para funcionar en manipulaciones no vistas durante el entrenamiento, evaluado en 14 conjuntos de datos de deepfake publicados entre 2019 y 2025.
- Adaptación paramétricamente eficiente: solo entrena los parámetros de LayerNorm, lo que reduce el riesgo de sobreajuste y mejora la robustez.
- Inferencia por imagen: acepta recortes de rostro alineados como entrada y devuelve una probabilidad de deepfake.
- Compatible con el ecosistema Hugging Face Transformers mediante `trust_remote_code=True`.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede analizar vídeos subidos por usuarios para detectar manipulación facial y bloquear o etiquetar contenido falso antes de su publicación. Su capacidad de generalización permite detectar técnicas nuevas sin reentrenamiento constante.
- Verificación de identidad en videollamadas: integrado en sistemas de autenticación remota, puede evaluar si el rostro mostrado en una videollamada es genuino o generado, reduciendo el fraude de identidad en banca y servicios gubernamentales.
- Análisis forense de evidencia digital: peritos y agencias de investigación pueden usar el modelo para examinar vídeos presentados como prueba, obteniendo una probabilidad de manipulación que ayude a la toma de decisiones judiciales.
- Monitorización de campañas electorales: detectar vídeos manipulados de políticos o candidatos que circulen en redes sociales, permitiendo a los equipos de comunicación reaccionar rápidamente ante desinformación.
- Protección de la imagen pública de celebridades: empresas de gestión de derechos de imagen pueden rastrear vídeos falsos que utilicen el rostro de sus clientes y emitir avisos de retirada.
- Investigación académica en detección de manipulación: el modelo sirve como baseline robusto para comparar nuevas técnicas de detección, gracias a su licencia MIT y su disponibilidad pública.

## Benchmarks y rendimiento

Los resultados publicados en la model card, evaluados sobre FaceForensics++ (FF++):

| Metrica | Valor |
|---|---|
| Video AUROC | 91,84 % |
| Video mAP | 89,88 % |
| Video Accuracy | 84,91 % |
| Video EER | 15,09 % |
| Frame AUROC | 86,93 % |
| Frame mAP | 83,73 % |
| Frame Accuracy | 80,40 % |

El artículo asociado reporta evaluaciones en 14 conjuntos de datos de deepfake, indicando que el modelo supera a los métodos de última generación en la mayoría de los benchmarks. No se dispone de una tabla comparativa detallada en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un ViT-L/16 con 303 M de parámetros, la inferencia en precisión fp32 requiere aproximadamente 1,2 GB de VRAM solo para los pesos. Con batch pequeño y entrada de 224x224, el uso total de VRAM puede rondar los 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en tiempo real. Modelos como RTX 3060, RTX 4060, o superiores funcionan sin problemas. Para procesamiento por lotes, una A100 o H100 ofrecería mayor throughput.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de gama media y baja, como la RTX 2060 o incluso en Apple Silicon con Metal.
- Opciones de despliegue: al ser un modelo de Hugging Face con `trust_remote_code`, se puede servir con la librería `transformers` en Python. También es posible exportar a ONNX o TensorRT para optimización. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, ya que es un modelo de visión, no de lenguaje.
- Latencia y throughput estimados: no disponible en la información proporcionada. En una GPU moderna, la inferencia por frame debería ser inferior a 10 ms, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros detectores de deepfake en la documentación proporcionada. El modelo se basa en DINOv3, un backbone de visión de última generación, y su enfoque de adaptación paramétrica es similar a otros métodos de fine-tuning eficiente como LoRA o adaptadores, pero aplicado a la detección de manipulación. Se puede considerar comparable a otros detectores basados en DINOv3 o en modelos como CLIP, pero no hay datos de rendimiento cruzado disponibles en la información recopilada.

## Limitaciones y advertencias

- Entrenado exclusivamente en FaceForensics++: aunque el diseño busca generalizar, el rendimiento en otros conjuntos de datos puede variar. El artículo reporta buenos resultados en 14 benchmarks, pero no se garantiza un comportamiento perfecto en todos los escenarios.
- Dependencia de la calidad del recorte facial: el modelo espera recortes de rostro alineados como entrada. Si el preprocesamiento no es correcto, la precisión puede degradarse.
- Riesgo de falsos positivos y negativos: como cualquier detector, puede fallar en condiciones de baja calidad de vídeo, compresión extrema o manipulaciones muy sutiles.
- Sesgo potencial: el entrenamiento en FF++ puede introducir sesgos hacia ciertos tipos de rostros o condiciones de iluminación, aunque no se han documentado análisis de sesgo específicos.
- Licencia MIT: permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento legal en su jurisdicción, especialmente en aplicaciones de verificación de identidad o moderación.
- No es un modelo multimodal: solo procesa imágenes, no vídeo directamente. Para vídeo, se debe aplicar frame a frame y agregar resultados.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/HoopitAI/video-deepfake-detection-GenD_DINOv3_L_FF
- Repositorio oficial de GenD (GitHub): https://github.com/yermandy/GenD
- Artículo en arXiv: https://arxiv.org/html/2508.06248v3
- Publicación en WACV 2026 (IEEE Computer Society): https://www.computer.org/csdl/proceedings-article/wacv/2026/551100a773/2ggP4UMfX8s
- Colección de modelos GenD en Hugging Face: https://huggingface.co/collections/yermandy/gend
- Modelo base DINOv3: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
