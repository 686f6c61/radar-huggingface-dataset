# dronefreak/dformer-tiny-sunrgbd

## Resumen

DFormer-T es un modelo de segmentación semántica RGB-D desarrollado por el grupo VCIP de la Universidad de Nankai (Bowen Yin, Xuying Zhang, Zhong-Yu Li, Li Liu, Ming-Ming Cheng y Qibin Hou) y presentado en ICLR 2024. Su objetivo es la comprensión de escenas interiores, combinando la información de color (RGB) y de profundidad (depth) para asignar una clase semántica a cada píxel de la imagen. Frente a los enfoques que reutilizan encoders preentrenados en ImageNet RGB, DFormer propone un encoder específicamente preentrenado con datos RGB-D, lo que permite explotar la geometría de la escena desde las primeras capas.

La variante Tiny es la más pequeña de la familia DFormer, con 6.007.221 parámetros totales, y está entrenada sobre el conjunto SUN RGB-D. Su decoder es ligero y el conjunto encoder-decoder está pensado para inferencia eficiente en entornos con recursos limitados, manteniendo una precisión competitiva (48,8 mIoU a escala única según los autores).

Este repositorio concreto (`dronefreak/dformer-tiny-sunrgbd`) es un espejo no oficial de los pesos originales: no modifica los pesos, solo añade una copia en `model.safetensors` y un `config.json` con metadatos. Es relevante para quien quiera cargar los pesos sin depender del formato `.pth` original y para pipelines que prefieran safetensors por seguridad y velocidad de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFormer (encoder RGB-D preentrenado + decoder ligero), variante Tiny |
| Parametros totales | 6.007.221 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en fp32 según checkpoint original) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint original), `model.safetensors` (solo pesos), `.pth.tar` (encoder preentrenado) |

## Arquitectura y entrenamiento

DFormer es una red de segmentación semántica RGB-D compuesta por un encoder y un decoder ligero. El encoder se preentrena primero en ImageNet-1K enriquecido con mapas de profundidad, de modo que aprende representaciones conjuntas de apariencia y geometría antes del ajuste fino en la tarea de segmentación. El decoder, de tamaño reducido, produce la máscara semántica por píxel a partir de las características multi-escala del encoder. La innovación central del trabajo es precisamente ese preentrenamiento RGB-D, que sustituye al habitual backbone RGB y mejora la captura de estructuras espaciales en interiores.

El ajuste fino se realiza sobre SUN RGB-D, un dataset de escenas interiores con anotaciones densas de segmentación semántica. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables en un modelo de visión). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; el foco técnico está en el preentrenamiento RGB-D del encoder.

## Capacidades

- Segmentación semántica densa de imágenes RGB-D: asigna una clase a cada píxel combinando color y profundidad.
- Comprensión de escenas interiores: orientado a entornos de interior (habitaciones, muebles, objetos domésticos) según el dominio de SUN RGB-D.
- Procesamiento multimodal RGB + depth: requiere ambos canales como entrada; no está pensado para RGB puro.
- Inferencia ligera: 6 M de parámetros, adecuado para dispositivos con recursos limitados.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera de la segmentación.

## Casos de uso

- Robótica de interior: un robot móvil equipado con cámara RGB-D puede usar DFormer-T para segmentar el suelo, paredes, muebles y obstáculos en tiempo real, aprovechando su bajo número de parámetros para ejecutarse en hardware embebido.
- Realidad aumentada y virtual: inserción de objetos virtuales con oclusión correcta, usando la máscara semántica y la profundidad para distinguir superficies y objetos de la escena.
- Asistencia a personas con discapacidad visual: descripción de escenas interiores a partir de la segmentación densa, identificando categorías de objetos y su extensión espacial.
- Domótica y hogar inteligente: análisis de imágenes de cámaras interiores para detectar presencia y distribución de muebles u objetos, con fines de automatización o monitorización.
- Anotación asistida de datasets: preetiquetado automático de imágenes RGB-D de interiores para acelerar el etiquetado humano en proyectos de visión.
- Investigación en segmentación RGB-D: modelo de referencia ligero para comparar técnicas de fusión RGB-depth o para experimentar con preentrenamiento multimodal.
- Prototipado en edge computing: al tener 6 M de parámetros, puede desplegarse en GPUs de gama baja o en placas con acelerador para validar pipelines de percepción antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| mIoU en SUN RGB-D (escala única) | 48,8 |

Dato reportado por los autores en la model card. No se han publicado en la información disponible resultados comparativos adicionales (por ejemplo, frente a otros modelos de la familia DFormer o frente a alternativas RGB-D) ni tablas desglosadas por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 6 M de parámetros, los pesos en fp32 ocupan aproximadamente 24 MB, por lo que la inferencia cabe holgadamente en cualquier GPU con 1-2 GB de VRAM (estimación a partir del recuento de parámetros; no confirmada en la model card).
- GPU recomendadas: cualquier GPU moderna es suficiente; para despliegue en producción en servidor, una NVIDIA T4, L4 o RTX 4090 ofrece margen de sobra. Para edge, una Jetson Nano o similar es viable por el reducido tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en muchas integradas, dado el tamaño del modelo.
- Opciones de despliegue: al ser un modelo PyTorch con código propio en el repositorio oficial, el despliegue habitual es mediante el código de VCIP-RGBD/DFormer (PyTorch). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | mIoU SUN RGB-D | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DFormer-T (este) | 6,0 M | RGB + depth | 48,8 (escala única) | MIT | Hugging Face (espejo no oficial) |
| DFormer-S / DFormer-B / DFormer-L | no disponible en la información | RGB + depth | no disponible en la información | MIT | Repositorio oficial VCIP-RGBD/DFormer |
| Otras alternativas RGB-D (p. ej. CMX, GeminiF) | no disponible | RGB + depth | no disponible | no disponible | no disponible |

La información proporcionada solo cubre la variante Tiny y su resultado en SUN RGB-D; no se dispone de cifras de las demás variantes ni de modelos comparables para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son idénticos a los originales, pero el mantenimiento y la garantía dependen del autor del mirror, no de los autores originales.
- Dominio restringido: entrenado en SUN RGB-D (escenas interiores); el rendimiento en exteriores u otros dominios no está garantizado.
- Requiere entrada RGB-D: no funciona con RGB puro sin adaptación, lo que limita su uso a sensores con profundidad.
- Riesgo de errores de segmentación en clases poco representadas o en condiciones de iluminación y oclusión adversas; no se documentan análisis de sesgo.
- No hay información sobre sesgos demográficos, geográficos o culturales del dataset de entrenamiento.
- Licencia MIT: permite uso comercial, pero conviene citar el trabajo original y revisar los términos del repositorio oficial.
- El checkpoint original `.pth` almacena argumentos de entrenamiento; debe cargarse con `weights_only=False`, lo que implica un riesgo de seguridad si no se confía en la fuente.
- No se documentan cuantizaciones oficiales ni soporte para formatos de inferencia optimizados (ONNX, TensorRT), lo que puede requerir trabajo adicional para producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria del mirror.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/dformer-tiny-sunrgbd
- Paper (arXiv): https://arxiv.org/abs/2309.09668
- Repositorio oficial: https://github.com/VCIP-RGBD/DFormer
- Dataset SUN RGB-D (espejo en el Hub): https://huggingface.co/datasets/dronefreak/SUN-RGBD
