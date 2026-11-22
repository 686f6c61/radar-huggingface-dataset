# aedlearndl/sage-vitl-hypersim

## Resumen

SAGE (Semantic-Geometric Scene Understanding) es un modelo de visión por computador multi-tarea desarrollado por Arda Eren Dogru, Gabriele Rosi, Fabio Cermelli y Carlo Masone, publicado en IEEE Robotics and Automation Letters en 2026. El checkpoint `aedlearndl/sage-vitl-hypersim` es la variante preentrenada exclusivamente sobre el dataset Hypersim, y resuelve un problema clásico en robótica y percepción 3D: obtener en una sola pasada de inferencia segmentación semántica de vocabulario abierto, profundidad métrica y normales de superficie en espacio de cámara a partir de una única imagen RGB.

La arquitectura combina un backbone ViT-L/16 DINOv2 (`timm/vit_large_patch14_reg4_dinov2.lvd142m`) con un decodificador de queries adaptado de EoMT (TU/e) y un codificador de texto CLIP ViT-L/14 para la parte de vocabulario abierto. Esto permite especificar las clases a segmentar en tiempo de inferencia mediante prompts de texto, sin reentrenar la cabeza de segmentación. El modelo está pensado como base para adaptación few-shot: con tan solo 24 fotogramas etiquetados de un dominio nuevo (por ejemplo NYUv2) y ajuste LoRA, mejora de forma sustancial las métricas de segmentación y profundidad respecto al modo zero-shot.

Su relevancia actual radica en la combinación de tres salidas geométricas y semánticas en un único forward pass con latencias de 10-25 ms en A100, lo que lo hace viable para bucles de percepción en robótica móvil, drones o manipulación, donde tradicionalmente se encadenan tres modelos independientes. El checkpoint ocupa 653 MB en FP16 y 1,3 GB en FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L/16 DINOv2 (backbone) + decodificador de queries tipo EoMT + codificador de texto CLIP ViT-L/14 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada variable, evaluado hasta 768x1024) |
| Tipos de cuantizacion | FP16 y FP32 en los checkpoints publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (prompts de texto en inglés por el codificador CLIP; no se documenta multi-idioma) |
| Licencia | CC BY-SA 3.0 para los pesos; Apache-2.0 para el código del repositorio |
| Formato de pesos | `.ckpt` (PyTorch checkpoint): `hypersim_release_fp16.ckpt` (653 MB) y `hypersim_release_fp32.ckpt` (1,3 GB) |

## Arquitectura y entrenamiento

SAGE es un transformer de visión multi-tarea. El backbone es un ViT-L/16 con registros (`vit_large_patch14_reg4_dinov2.lvd142m`), preentrenado con DINOv2, que extrae representaciones densas de la imagen. Sobre él se monta un decodificador de queries inspirado en EoMT (Mobile Perception Systems Lab, TU/e), que produce simultáneamente máscaras de segmentación, un mapa de profundidad métrica y un mapa de normales de superficie en espacio de cámara. La parte de vocabulario abierto se resuelve con un codificador de texto CLIP ViT-L/14 (`openai/clip-vit-large-patch14`), que proyecta las clases indicadas por el usuario al espacio de embeddings y las alinea con las queries de segmentación.

El checkpoint publicado está entrenado únicamente sobre el dataset Hypersim (apple/ml-hypersim), un corpus de interiores sintéticos fotorrealistas con anotaciones densas de semántica, profundidad y normales. No se documenta en la información disponible el número exacto de tokens, imágenes o épocas de entrenamiento, ni si se empleó RLHF o DPO (no aplicable en un modelo de visión de este tipo). La innovación técnica destacable es la adaptación few-shot mediante LoRA: el modelo congela el backbone y ajusta adaptadores de bajo rango con muy pocos fotogramas etiquetados del dominio objetivo, lo que permite transferir de Hypersim (interiores sintéticos) a dominios reales como NYUv2 con 24 imágenes.

## Capacidades

- Segmentación semántica de vocabulario abierto: las clases se especifican en tiempo de inferencia mediante prompts de texto (por ejemplo `["chair", "table", "floor", "wall", "sofa"]`), sin reentrenar.
- Estimación de profundidad métrica en metros (salida `float32` de tamaño HxW).
- Predicción de normales de superficie en espacio de cámara (salida `3xHxW` `float32` con vectores unitarios).
- Inferencia multi-tarea en un único forward pass: las tres salidas se obtienen conjuntamente a partir de una sola imagen RGB.
- Adaptación few-shot a nuevos dominios mediante LoRA con tan solo 24 fotogramas etiquetados.
- Soporte de resolución de entrada variable (evaluado a 480x640, 512x512 y 768x1024).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingües: no disponibles; los prompts de texto dependen de CLIP, orientado a inglés.
- No se documentan capacidades de audio ni de vídeo temporal explícitas (el modelo procesa imágenes individuales).

## Casos de uso

- Percepción para robótica móvil indoor: el modelo entrega en un solo forward pass semántica, profundidad métrica y normales, lo que simplifica el stack de percepción de un robot que navega en interiores y necesita mapa de obstáculos, suelo transitable y orientación de superficies. Con 10-25 ms por frame en A100 es compatible con bucles de control a 40-90 FPS.
- Manipulación robótica con vocabulario abierto: el operador puede pedir "taza", "plato" o "llave" en tiempo de inferencia sin reentrenar; la profundidad métrica permite calcular la pose 3D del objeto y las normales ayudan a planificar el agarre.
- Adaptación rápida a un nuevo entorno de fábrica o almacén: con 24 imágenes etiquetadas del dominio objetivo y ajuste LoRA se pasa de un mIoU de 0,453 a 0,667 en NYUv2, lo que hace viable desplegar el modelo en una nave nueva en horas en lugar de semanas.
- Reconstrucción 3D y modelado de escenas: las normales de superficie y la profundidad métrica permiten alimentar pipelines de reconstrucción densa (fusión TSDF, mallas) a partir de secuencias RGB, sustituyendo la combinación de un modelo de profundidad monocular y otro de normales.
- Segmentación semántica asistida en anotación de datasets: el modelo puede preanotar imágenes de interiores con clases abiertas y geometría, reduciendo el coste de etiquetado manual en pipelines de datos para visión.
- Navegación de drones en interiores: la profundidad métrica y las normales a 40 FPS en 768x1024 permiten evitar obstáculos y estimar la orientación de paredes y suelo en tiempo real con una sola cámara RGB.
- Realidad aumentada y sustitución de fondo: la segmentación de vocabulario abierto más la profundidad permiten insertar objetos virtuales con oclusión correcta y coherencia geométrica en escenas de interior.
- Evaluación comparativa de modelos geométricos: al publicar métricas de profundidad (RMSE, δ₁) y normales (error angular) junto con semántica, sirve como baseline reproducible para investigación en percepción multi-tarea.

## Benchmarks y rendimiento

Adaptación a dominio con 24 fotogramas (Hypersim → NYUv2, 60 épocas):

| Configuracion | Semantic mIoU ↑ | Depth RMSE (m) ↓ | Depth δ₁ ↑ | Normal Error (°) ↓ |
|---|---|---|---|---|
| Zero-shot (`hypersim_release`) | 0,453 | 2,385 | 0,000 | 15,48 |
| Adaptado (24 frames NYUv2) | 0,667 | 0,419 | 0,919 | 14,81 |

Velocidad de inferencia y VRAM (`hypersim_release_fp16.ckpt`, NVIDIA A100-SXM-64GB, `batch_size=1`):

| Resolucion (H x W) | Modo | Latencia (ms) ↓ | Throughput (FPS) ↑ | VRAM pico (MB) ↓ |
|---|---|---|---|---|
| 480 x 640 | `compile_fp16` | 11,09 | 90,2 | 1415 |
| 512 x 512 | `compile_fp16` | 10,38 | 96,3 | 1400 |
| 768 x 1024 | `compile_fp16` | 24,60 | 40,7 | 1561 |

No se han publicado en la información disponible resultados en benchmarks estándar de segmentación (ADE20K, Cityscapes) ni comparativas numéricas con otros modelos multi-tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4-1,6 GB en FP16 con `batch_size=1` a resoluciones entre 480x640 y 768x1024 (medido en A100). El checkpoint FP16 ocupa 653 MB en disco; el FP32, 1,3 GB.
- GPU recomendadas: NVIDIA A100 (referencia medida), H100, L40S, RTX 4090, RTX 3090. Cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar el modelo en FP16 a resoluciones moderadas, aunque no se han publicado mediciones en consumer.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, dado el bajo consumo de VRAM medido en A100; no hay cifras oficiales para estas tarjetas.
- Opciones de despliegue: el repositorio oficial (`ardaerendogru/SAGE`) expone `SAGE.from_pretrained(...)` y `model.predict(...)`; incluye una app Gradio (`app.py`) lista para Hugging Face Spaces. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 11,09 ms / 90,2 FPS a 480x640; 10,38 ms / 96,3 FPS a 512x512; 24,60 ms / 40,7 FPS a 768x1024, con `compile_fp16` en A100 y `batch_size=1`.

## Comparativa con modelos similares

| Modelo | Parametros | Tareas | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAGE ViT-L/16 (Hypersim) | no disponible | Semantica open-vocab + profundidad + normales | hasta 768x1024 evaluado | CC BY-SA 3.0 (pesos) | Hugging Face, GitHub |
| EoMT (TU/e) | no disponible | Segmentacion panoptica/semantica | no disponible | MIT | GitHub |
| Depth Anything V2 | no disponible | Profundidad monocular | resolucion variable | Apache-2.0 (variante base) | Hugging Face |
| DINOv2 (backbone) | ViT-L ~300M (backbone) | Features visuales | resolucion variable | Apache-2.0 | Hugging Face / timm |

La comparación numérica con estos modelos no está disponible en la información proporcionada; SAGE se diferencia por unificar tres tareas geométricas y semánticas en un solo forward pass con vocabulario abierto y adaptación few-shot vía LoRA.

## Limitaciones y advertencias

- Entrenado únicamente sobre Hypersim (interiores sintéticos): el rendimiento zero-shot en dominios reales es limitado (mIoU 0,453 y δ₁ 0,000 en NYUv2), por lo que en producción se recomienda adaptación LoRA con imágenes del dominio objetivo.
- La licencia CC BY-SA 3.0 de los pesos es copyleft: obliga a compartir bajo la misma licencia las obras derivadas y exige atribución; puede ser incompatible con productos comerciales cerrados.
- El codificador de texto CLIP ViT-L/14 tiene una model card de OpenAI que restringe el ámbito de despliegue comercial; conviene revisarla antes de usar el modelo en producto.
- Riesgo de alucinación geométrica: las profundidades y normales pueden ser inconsistentes en superficies reflectantes, transparentes o con iluminación extrema, no representadas en Hypersim.
- El vocabulario abierto depende de CLIP y está orientado a inglés; no se documenta soporte multilingüe en los prompts.
- No se documentan sesgos demográficos o culturales, pero al entrenar solo con interiores sintéticos puede tener sesgo hacia layouts y mobiliario de estilo occidental.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso; su uso es puramente perceptivo.
- No se han publicado métricas en benchmarks estándar de segmentación (ADE20K, Cityscapes) en la información disponible, lo que dificulta la comparación directa con el estado del arte.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: es un checkpoint de investigación reciente, sin validación comunitaria extensa.

## Enlaces

- Hugging Face: https://huggingface.co/aedlearndl/sage-vitl-hypersim
- Project page: https://ardaerendogru.github.io/SAGE/
- Repositorio de código: https://github.com/ardaerendogru/SAGE
- EoMT (arquitectura de decodificador): https://github.com/tue-mps/eomt
- Dataset Hypersim: https://github.com/apple/ml-hypersim
- Backbone DINOv2 (timm): https://huggingface.co/timm/vit_large_patch14_reg4_dinov2.lvd142m
- Codificador de texto CLIP: https://huggingface.co/openai/clip-vit-large-patch14
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
