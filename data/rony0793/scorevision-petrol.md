# Rony0793/Scorevision-petrol

## Resumen

Scorevision-petrol es un modelo de detección de objetos en formato ONNX publicado por el usuario Rony0793 en Hugging Face, concebido como minero de la pista pública de Score, la subred 44 de Bittensor. El modelo detecta cuatro clases específicas del dominio de las estaciones de servicio: surtidor de combustible (petrol pump), manguera (petrol hose), marquesina o cubierta (roof canopy) y panel de precios (price board). Se sirve a través de la plataforma Chutes y se ejecuta exclusivamente con onnxruntime, OpenCV y NumPy, lo que lo convierte en un artefacto de despliegue muy ligero.

El repositorio tiene un tamaño declarado de 0.0 GB y no incluye información sobre la arquitectura interna de la red, el número de parámetros ni el dataset de entrenamiento. La model card únicamente documenta los identificadores de clase, los ficheros que componen el paquete (`miner.py`, `weights.onnx`, `chute_config.yml`) y el esquema de puntuación empleado por la subred: 0.6·mAP50 + 0.4·tasa de falsos positivos, con un límite de latencia p95 de 100 ms.

Su relevancia es acotada y de nicho: no es un modelo de propósito general, sino un componente especializado para un mercado de incentivos on-chain orientado a detección de objetos en un dominio vertical concreto. Resulta de interés para quienes participan en la subred 44 de Bittensor o necesitan un detector de elementos de gasolinera de baja latencia, pero no para tareas generales de visión o lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos; la model card no especifica la familia, p. ej. YOLO, RT-DETR o similar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible; se distribuye un único artefacto `weights.onnx` |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`weights.onnx`, sha256 `f595fc38c9e76c66…`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del detector: la model card no indica si se trata de una familia YOLO, RT-DETR, Faster R-CNN u otra, ni el tamaño del backbone, la resolución de entrada o el número de parámetros. El único dato técnico verificable es el formato de serialización (ONNX) y el conjunto de dependencias de inferencia declaradas: onnxruntime, OpenCV y NumPy, lo que sugiere un pipeline de preprocesado de imagen con OpenCV y ejecución del grafo ONNX sin frameworks de deep learning adicionales.

Tampoco se documentan el volumen ni la composición del dataset de entrenamiento, la procedencia de las imágenes, las técnicas de aumento de datos ni si hubo ajuste fino desde un checkpoint previo. La model card menciona que el modelo fue "construido a partir de un modelo ONNX", sin especificar el punto de partida. No hay información sobre calibración de umbrales de confianza, NMS u otras decisiones de postprocesado más allá de lo que implemente `miner.py`.

## Capacidades

- Detección de objetos en imágenes con cuatro clases del dominio de estaciones de servicio: surtidor de combustible (id 0), manguera (id 1), marquesina o cubierta (id 2) y panel de precios (id 3).
- Inferencia en formato ONNX ejecutable con onnxruntime, sin dependencia de PyTorch o TensorFlow en tiempo de ejecución.
- Integración con el pipeline de minería de Score (Bittensor subnet 44) mediante la clase `Miner` que carga la plantilla de chute.
- Despliegue en Chutes a través de `chute_config.yml`, que fija la imagen y el nodo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión-lenguaje, audio ni modo de pensamiento. Es un detector puro, no un modelo generativo.

## Casos de uso

- Minería en la subred 44 de Bittensor (Score): el modelo está empaquetado específicamente para actuar como minero de la pista pública, con un esquema de puntuación definido (0.6·mAP50 + 0.4·falsos positivos) y un límite de latencia p95 de 100 ms. Se usaría tal cual, desplegando el chute en Chutes y dejando que la clase `Miner` gestione la inferencia.
- Inventario automatizado de estaciones de servicio: a partir de imágenes o vídeo de una gasolinera, el detector localiza surtidores, mangueras, marquesinas y paneles de precios, lo que permite generar recuentos y verificar la presencia de elementos esperados en cada instalación.
- Monitorización de precios en surtidor: la detección del panel de precios (clase 3) sirve como paso previo a un OCR que extraiga los importes; el detector acota la región de interés y reduce el coste computacional del reconocimiento.
- Control de mantenimiento y seguridad: la detección de mangueras y surtidores permite señalar elementos ausentes, mal colocados o dañados en inspecciones visuales automatizadas, con revisión humana posterior.
- Análisis de implantación geográfica: procesando imágenes de catálogo o street view, el modelo permite mapear qué estaciones cuentan con marquesina, cuántos surtidores tienen y si exhiben panel de precios, generando datos estructurados para estudios de red.
- Prototipado rápido de visión embebida: al ser un único fichero ONNX con dependencias mínimas (onnxruntime, OpenCV, NumPy), encaja en dispositivos de borde o contenedores ligeros donde no se quiere arrastrar un stack de deep learning completo.
- Componente de un pipeline mayor de inspección de activos: combinado con un clasificador o un OCR posteriores, el detector actúa como etapa de localización dentro de un sistema de documentación automática de instalaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe el esquema de puntuación de la subred (0.6·mAP50 + 0.4·tasa de falsos positivos, con latencia p95 máxima de 100 ms) y no reporta valores numéricos de mAP50, precisión, recall ni latencia medidos.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del fichero `weights.onnx` no se indica (el repositorio declara 0.0 GB) y no se conoce el número de parámetros, por lo que no es posible estimar el consumo de memoria.
- GPU recomendadas: no disponibles. Al ejecutarse con onnxruntime, puede correr en CPU o en GPU con los execution providers de ONNX Runtime (CUDA, TensorRT, DirectML), pero el autor no especifica ninguna configuración de referencia.
- ¿Cabe en GPU de consumo? No disponible. Por el tipo de tarea (detección de objetos en un dominio acotado) es plausible que quepa en GPUs de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: onnxruntime (declarado), con OpenCV para preprocesado; despliegue gestionado en Chutes mediante `chute_config.yml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el único dato es el límite de latencia p95 de 100 ms impuesto por la subred; no se publican mediciones propias.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación con otros detectores de objetos del mismo dominio o tamaño.

## Limitaciones y advertencias

- Dominio muy restringido: solo detecta cuatro clases (surtidor, manguera, marquesina y panel de precios); fuera de ese contexto su utilidad es nula.
- Ausencia total de documentación técnica: no se conocen arquitectura, parámetros, dataset, procedencia del checkpoint base ni proceso de entrenamiento, lo que impide evaluar su calidad de forma independiente.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; en producción habría que contactar con el autor o asumir el riesgo legal.
- Riesgo de alucinación y falsos positivos: la propia métrica de la subred penaliza explícitamente los falsos positivos (40 % del peso), lo que sugiere que el detector puede producir detecciones espurias en imágenes fuera de distribución.
- Sesgos desconocidos: al no documentarse el dataset, no se puede evaluar el sesgo respecto a geografías, tipos de estación, condiciones de iluminación, ángulos de cámara o calidades de imagen.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje ni multimodal; no procesa instrucciones en lenguaje natural.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, con un tamaño declarado de 0.0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que el paquete está incompleto.
- Dependencia de la infraestructura de Chutes y de la subred 44: el valor operativo del modelo está ligado a ese ecosistema concreto; fuera de él, su utilidad práctica es la de un detector ONNX sin métricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rony0793/Scorevision-petrol
- Referencia al modelo original citado en la model card: manak0/Detect-petrol-station-1-0 (no se ha proporcionado URL directa)
- Bittensor (red y subredes): https://bittensor.com
- Chutes (plataforma de despliegue): https://chutes.ai
- ONNX Runtime: https://onnxruntime.ai
