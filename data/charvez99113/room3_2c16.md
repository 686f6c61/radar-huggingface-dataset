# Charvez99113/room3_2c16

## Resumen

El modelo `Charvez99113/room3_2c16` es un detector de objetos basado en YOLO26n, exportado a ONNX, especializado en la identificación de suciedad en habitaciones. Lo desarrolla el usuario Charvez99113 como parte de la competición "Detect-room-dirtiness-detection" y se publica bajo el identificador interno `worker-2-m015`. El modelo resuelve una tarea de visión por computador muy concreta: detectar cinco clases de suciedad (derrame de líquido, papelera, basura, moho y mancha) en imágenes de interiores, con un tamaño de entrada de 736x736 píxeles.

La relevancia de esta ficha es limitada desde el punto de vista de la IA generativa: no se trata de un modelo de lenguaje ni de un modelo multimodal general, sino de un detector de objetos de un solo dominio, entrenado específicamente para una competición. Aun así, resulta interesante como ejemplo de pipeline de entrenamiento con destilación de conocimiento (knowledge distillation) y de optimización de reglas de post-proceso para una métrica de evaluación concreta.

El repositorio de Hugging Face está prácticamente vacío (0.0 GB, sin descargas ni likes), y la model card es el único documento técnico disponible. Toda la información de esta ficha proviene de esa model card y de las referencias internas que en ella se citan; cualquier dato no cubierto se marca como "no disponible".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye `weights.onnx` sin especificar precisión; probablemente FP32) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible en el repo; los pesos base Ultralytics yolo26n son AGPL-3.0 |
| Formato de pesos | ONNX (`weights.onnx`) |
| Entrada | imagen 736x736 con letterbox |
| Clases (cls_id) | 0 liquid spillage, 1 bin, 2 litter, 3 mould, 4 stain |
| Umbral de confianza por clase | 0.25 |
| NMS IoU | 0.5 (NMS por clase) |
| max_det | 100 |
| Runtime de inferencia | ONNX Runtime (CUDA EP primero, fallback CPU) |
| Hilos | 2 intra-op, 1 inter-op, OpenCV 1 hilo |

## Arquitectura y entrenamiento

La arquitectura es YOLO26n, la variante "nano" de la familia YOLO26 de Ultralytics, un detector de objetos de una etapa basado en transformer/CNN según la implementación de Ultralytics (no se detalla en la model card la composición exacta de bloques). Los pesos se inicializan desde `yolo26n.pt` preentrenado en COCO y se afinan durante 30 épocas sobre la configuración de dataset `dc-118` (snapshot `DS-16688-3982d9de8def`), en el experimento `e1054_y26n_736_dc118_kdD1646c20_ep30_s0` con semilla 0.

El entrenamiento emplea destilación de conocimiento densa (dense KD) con un profesor (`CVCompressor/dirtiness_1646@59dbf3836f`, reconstruido a PyTorch a partir de su `weights.onnx` publicado). Las etiquetas del dataset provienen de varias fuentes: etiquetas `dc-64` anotadas por varios mineros públicos (Cargile/delta-202, ArthurSword/ThunderStone_06, artur7236/ScoreVision), etiquetas reconstruidas de rondas en vivo (GT v162/v171) y etiquetas del propietario del dataset. El conjunto limpio supera los 9.534.900 elementos. La innovación técnica destacable no está en la arquitectura sino en el post-proceso: la versión c16 introduce una regla de decodificación "liquid over stain" que reemplaza una caja de mancha por una caja de derrame de líquido cuando se solapan con confianza e IoU suficientes, basándose en que en el ground truth del validador una región líquida nunca lleva también una caja de mancha.

## Capacidades

- Detección de objetos en imágenes de interiores para cinco clases de suciedad: derrame de líquido, papelera, basura, moho y mancha.
- Salida de cajas delimitadoras con puntuaciones de confianza por clase, tras NMS por clase con IoU 0.5.
- Regla de post-proceso "liquid over stain": si una caja de mancha retenida (conf >= 0.25) solapa con una caja de derrame de líquido (conf >= 0.15) a IoU >= 0.6, se sustituye por la caja de líquido con la confianza máxima de ambas.
- Inferencia en GPU (CUDA execution provider) con fallback a CPU mediante ONNX Runtime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un detector de visión puro.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Inspección automatizada de limpieza en hoteles: el modelo puede procesar imágenes de habitaciones capturadas por el personal y detectar derrames, basura o manchas para priorizar la limpieza, aprovechando su especialización en las cinco clases de suciedad.
- Monitorización de estado en alquileres vacacionales: integrado en un pipeline de cámaras o fotos periódicas, permite verificar el estado de la vivienda entre huéspedes y generar alertas cuando se detecta moho o manchas.
- Auditoría de calidad en cadenas de restauración: análisis de fotos de mesas y suelos para detectar derrames y basura, con umbral de confianza 0.25 ajustado para reducir falsos positivos en producción.
- Control de mantenimiento en oficinas: detección de manchas y moho en superficies para programar limpiezas profundas o reparaciones antes de que el deterioro avance.
- Validación de datasets de suciedad: el modelo puede usarse como anotador automático o pre-etiquetador en la construcción de nuevos datasets de detección de suciedad, gracias a su entrenamiento con destilación de conocimiento.
- Despliegue en dispositivos con GPU modesta o CPU: al ser un modelo nano exportado a ONNX con 2 hilos intra-op y fallback a CPU, puede ejecutarse en estaciones de trabajo sin aceleradores dedicados para procesar lotes de imágenes por la noche.
- Investigación en post-proceso de detección: la regla "liquid over stain" y los experimentos de umbrales por clase documentados en la model card sirven como referencia para estudiar cómo las reglas de decodificación afectan a métricas de competición.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados son los de la métrica de la competición (live judge con GT reconstruido, T4.23) y las comparaciones pareadas entre c15 y c16. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, COCO mAP) en la información disponible.

| Metrica | Valor |
|---|---|
| Live judge a 0.25, ALL (8 rondas) | 0.6019 |
| Live judge a 0.25, FULL | 0.6141 |
| Live judge a 0.25, U | 0.6019 |
| c15 vs c16, forward > 9534900 (8 rondas) | 0.5969 → 0.6019 (+0.0050, IC 95 % [+0.0000, +0.0150]) |
| c15 vs c16, todas las rondas full/negative GT v174 (384) | 0.5363 → 0.5388 (+0.0025, IC 95 % [+0.0003, +0.0063]) |
| c15 vs c16, todas las rondas incl. parciales (437) | 0.5233 → 0.5249 (+0.0016, IC 95 % [-0.0009, +0.0050]) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un YOLO26n nano con entrada 736x736 y pesos ONNX sin cuantizar, la huella es reducida (típicamente por debajo de 1-2 GB en FP32, aunque no se confirma en la model card).
- GPU recomendadas: no se especifican modelos concretos; la model card solo indica que se usa el CUDA execution provider de ONNX Runtime con fallback a CPU.
- Compatibilidad con GPU de consumo: muy probable por el tamaño nano del modelo, pero no confirmado en la documentación.
- Opciones de despliegue: ONNX Runtime (CUDA o CPU), con 2 hilos intra-op, 1 inter-op y OpenCV limitado a 1 hilo. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de objetos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Charvez99113/room3_2c16 | YOLO26n + ONNX | no disponible | 736x736 | no disponible (base AGPL-3.0) | Hugging Face, repo 0.0 GB |
| worker-2-c15 (referencia interna) | YOLO26n + ONNX | mismos pesos que c16 | 736x736 | ídem | citado en la model card, no enlazado |
| CVCompressor/dirtiness_1646 (profesor KD) | no disponible | no disponible | no disponible | no disponible | citado como profesor en la model card |
| Ultralytics yolo26n | YOLO26n | no disponible | configurable | AGPL-3.0 | público en Ultralytics |

No se dispone de información suficiente para comparar con alternativas externas de detección de suciedad; la comparativa se limita a los modelos citados en la propia model card.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo detecta cinco clases de suciedad en interiores; no es un detector general ni un modelo de lenguaje.
- Licencia no declarada en el repositorio; los pesos base de Ultralytics yolo26n son AGPL-3.0, lo que puede imponer obligaciones de copyleft si se redistribuye o se usa en servicios de red. Verificar antes de uso comercial.
- La regla "liquid over stain" se calibró sobre rondas mayoritariamente in-sample (floor 0.15); fuera de fold puede dispararse en ambas direcciones, según advierte el propio autor.
- Los umbrales por clase (0.25) y el NMS IoU (0.5) se eligieron por defecto o por falta de generalización de ajustes finos; no hay garantía de que sean óptimos en otros dominios.
- El ground truth de evaluación es reconstruido (T4.23), no el del validador oficial, por lo que las métricas reportadas pueden no coincidir con las de la competición.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y falsos negativos en detección; no se publican análisis FP/FN fuera de fold en esta ficha (se remiten a la documentación de c15).
- Sin información sobre sesgos demográficos, geográficos o de iluminación; el dataset no se describe en detalle.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Charvez99113/room3_2c16
- Model card de referencia interna c15: `submissions/worker-2/worker-2-c15/repo/README.md` (citada en la model card, no enlazada)
- Profesor KD: `CVCompressor/dirtiness_1646@59dbf3836f` (citado, sin URL)
- Pesos base: Ultralytics yolo26n (`refs/weights/yolo26n.pt`, AGPL-3.0)
- Dataset de referencia: `manako/Detect-room-dirtiness-detection` (citado, sin URL)
