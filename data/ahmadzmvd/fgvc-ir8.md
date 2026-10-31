# ahmadzmvd/FGVC-IR8

## Resumen

FGVC-IR8 (v9.5) es un motor de clasificación visual de grano fino (fine-grained visual categorization, FGVC) y reconocimiento de conjunto abierto (open-set recognition) especializado en vehículos iraníes a partir de anuncios reales de compraventa. Lo ha desarrollado ahmadzmvd y combina un backbone DINOv2-ViT-B/14-reg4 con 28 adaptadores LoRA fusionados, atención por slots sobre piezas del vehículo, un graph transformer relacional y una cabeza métrica SubCenterArcFace. No es un modelo de lenguaje: es un sistema de visión por computador orientado a identificar la marca, el modelo y la variante exacta de un vehículo en fotografías del mundo real, con mecanismos para rechazar clases desconocidas.

Su relevancia radica en que aborda un problema difícil y poco cubierto: la clasificación de vehículos del mercado iraní, con modelos y variantes que no aparecen en datasets occidentales estándar como Stanford Cars o CompCars. El sistema incorpora un módulo propio, OpenSetGuard v9.5, que opera en dos regímenes (geodésico y estructural) para detectar vehículos fuera de las clases conocidas, algo crítico en aplicaciones como tasación automática de anuncios o vigilancia de tráfico. Los pesos completos ocupan unos 0,3 GB y el checkpoint principal FP16 pesa 172,3 MB, lo que lo hace ejecutable incluso en portátiles sin GPU ni conexión a internet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2-ViT-B/14-reg4 + LoRA + Slot Attention (8+2 slots) + Graph Transformer relacional 2 capas + SubCenterArcFace + SetMILHead + OpenSetGuard |
| Parametros totales | no disponible (checkpoint FP16 principal: 172,3 MB, 266 tensores) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica: modelo de visión) |
| Tipos de cuantizacion | FP16 (bundle standalone); no disponible info adicional |
| Idiomas soportados | no disponible (modelo de visión; salida con título en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt, checkpoints binarios; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de un backbone DINOv2-ViT-B/14-reg4 (Vision Transformer con registro de 4 tokens) adaptado mediante 28 adaptadores LoRA fusionados matemáticamente en los pesos, de modo que el bundle standalone no requiere descargar el backbone original ni acceso a internet en tiempo de inferencia. Sobre las características del backbone se aplica una atención competitiva por slots de 8+2 partes (Part-Slot Attention) que segmenta implícitamente regiones del vehículo (parrilla, faros, logo, etc.), y un graph transformer relacional de 2 capas que modela relaciones entre slots en un espacio 5D. La cabeza de clasificación usa SubCenterArcFace (C=8, K_s=4), una pérdida métrica que mejora la discriminación entre clases visualmente muy similares, complementada con una cabeza SetMIL (multiple-instance learning sobre conjuntos de fotogramas) que permite agregar información de varias imágenes de un mismo anuncio.

El entrenamiento se realizó sobre el dataset FGVC-IR8 (18,8 GB, disponible en Kaggle), compuesto por anuncios reales de vehículos iraníes con anotaciones de bounding boxes en formato COCO. El checkpoint principal corresponde al paso 35.686 de entrenamiento, y la cabeza auxiliar de mejor validación al paso 28.039. Los detalles sobre número exacto de imágenes de entrenamiento, aumentaciones y optimizador no están disponibles en la model card, aunque el split de validación declarado contiene 5.098 anuncios y 12.100 fotogramas. El motor de inferencia v9.5 incluye un ensamblado de doble cabeza y un sistema de verificación de 17 etapas (`--selftest`).

## Capacidades

- Clasificación de grano fino de vehículos: identifica marca, modelo y variante a partir de fotografías individuales.
- Reconocimiento de conjunto abierto: OpenSetGuard v9.5 rechaza entradas que no pertenecen a ninguna clase conocida, en dos regímenes (geodésico y estructural).
- Agregación multi-imagen: la cabeza SetMIL permite clasificar un anuncio completo a partir de múltiples fotogramas del mismo vehículo.
- Inferencia completamente offline: el bundle FP16 es standalone y no requiere descargas adicionales en tiempo de ejecución.
- Ejecución en CPU: el motor admite `device_str="cpu"`, sin dependencia de GPU.
- Suite de autoverificación: 17 etapas de verificación integradas en el motor de inferencia (`engine.py`).
- Salida estructurada: estado de predicción, título del vehículo (en inglés) y porcentaje de confianza final.

## Casos de uso

- Tasación automática de anuncios de segunda mano: plataformas de compraventa pueden clasificar automáticamente la variante exacta del vehículo en cada anuncio a partir de sus fotos, con rechazo de anuncios inconsistentes vía open-set recognition.
- Moderación de marketplaces: detectar listados cuyas fotos no corresponden al vehículo declarado, usando el rechazo de conjunto abierto como señal de alerta.
- Vigilancia de tráfico y flotas: identificación de marca y modelo en imágenes de cámaras o dashcams para análisis de composición del parque móvil iraní.
- Sistemas autónomos y ADAS en contexto regional: como módulo de percepción auxiliar para reconocer modelos de vehículos frecuentes en Irán que no están bien cubiertos por clasificadores entrenados con datasets occidentales.
- Indexación y búsqueda visual de inventarios: concesionarios pueden etiquetar masivamente catálogos fotográficos para filtrar por modelo y variante.
- Investigación en FGVC: el dataset público (18,8 GB con bounding boxes COCO) y el código en GitHub permiten reproducir y comparar enfoques de clasificación de grano fino y open-set recognition.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados por terceros):

| Metrica | Valor | Dataset |
|---|---|---|
| Balanced validation accuracy | 97,99 % | FGVC-IR8 Validation Split (5.098 anuncios / 12.100 fotogramas) |
| Raw validation accuracy | 97,72 % | FGVC-IR8 Validation Split (5.098 anuncios / 12.100 fotogramas) |

No se han publicado comparaciones con modelos alternativos (por ejemplo, fine-tuning directo de DINOv2 o ResNet) en la información disponible, por lo que no es posible contextualizar estos números frente a baselines.

## Requisitos de hardware

- VRAM/RAM estimada: el checkpoint principal FP16 pesa 172,3 MB; el motor está diseñado para ejecutarse en CPU de portátil, por lo que unos 2-4 GB de RAM deberían ser suficientes (estimación, no confirmada por el autor).
- GPU recomendadas: no son necesarias; el motor admite CPU explícitamente. En GPU compatible con CUDA la inferencia sería más rápida, pero no se publican cifras.
- Consumer GPUs: cabe sobradamente en cualquier GPU moderna (el modelo completo ocupa menos de 200 MB en FP16).
- Opciones de despliegue: motor propio `engine.py` (PyTorch) con bundle standalone, aplicación de un clic para Windows y demo interactiva en Hugging Face Spaces. No hay soporte documentado de vLLM, llama.cpp, Ollama o TGI (no aplican a modelos de visión).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Dominio | Backbone | Licencia | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|
| FGVC-IR8 (v9.5) | Vehículos iraníes, FGVC + open-set | DINOv2-ViT-B/14-reg4 + LoRA + slots + graph transformer | MIT | Imágenes / conjuntos de fotogramas | Pesos, código, dataset y demo públicos |
| Stanford Cars (clasificadores típicos) | Vehículos occidentales | ResNet/ViT fine-tuned | Variada | Imagen única | Dataset público; sin open-set integrado |
| CompCars | Vehículos chinos y occidentales | CNN clásicas | Investigación | Imagen única | Dataset público; sin open-set ni multi-imagen |

FGVC-IR8 se diferencia de los benchmarks clásicos de FGVC vehicular en tres aspectos: cobertura del mercado iraní (ausente en Stanford Cars y CompCars), rechazo de clases desconocidas integrado en el motor, y agregación de múltiples fotogramas por anuncio mediante SetMIL. No hay comparaciones cuantitativas publicadas contra estos datasets alternativos.

## Limitaciones y advertencias

- Las métricas de validación (97,99 % / 97,72 %) son declaradas por el autor y no están verificadas por terceros; el dataset de validación procede del mismo corpus de anuncios, por lo que puede existir sesgo de distribución.
- El modelo está especializado en vehículos del mercado iraní; su rendimiento sobre marcas y modelos occidentales o asiáticos fuera de ese corpus no está documentado.
- El riesgo de falsos positivos/negativos en el open-set recognition no se cuantifica en la model card; conviene validar OpenSetGuard con datos propios antes de producción.
- Detalles de entrenamiento (número de imágenes, aumentaciones, hiperparámetros) no disponibles, lo que dificulta evaluar el rigor metodológico.
- Formato de pesos propietario en checkpoints .pt de PyTorch (no safetensors), lo que exige confiar en el código de carga y usar el `engine.py` incluido.
- La salida incluye título en inglés; no hay información sobre soporte de otros idiomas en la interfaz de resultados.
- Licencia MIT: sin restricciones para uso comercial, pero el dataset en Kaggle puede tener términos propios que conviene revisar antes de reentrenar o redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmadzmvd/FGVC-IR8
- Demo interactiva en HF Spaces: https://huggingface.co/spaces/ahmadzmvd/FGVC-IR8-Demo
- Repositorio de código (GitHub): https://github.com/ahmadZMVD/FGVC-IR8
- Dataset completo en Kaggle (18,8 GB): https://www.kaggle.com/datasets/ahmadzmvd/fgvc-ir8-iranian-vehicle-dataset
- Dataset en Hugging Face: https://huggingface.co/datasets/ahmadzmvd/fgvc-ir8-iranian-vehicle-dataset
