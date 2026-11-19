# juns/CS-CLIP

## Resumen

CS-CLIP es un modelo vision-lenguaje derivado de OpenAI CLIP ViT-B/32, desarrollado por SeongJun Jeong y colaboradores (repositorio `juns`) y presentado en el paper "CS-CLIP: Compositional Scene Graph-guided CLIP for Robust Compositional Reasoning" (Findings of EMNLP 2026). El modelo aborda un problema bien documentado en CLIP: la escasa sensibilidad al orden y a la estructura de las frases, que provoca que captions con la misma bolsa de palabras pero distinto significado composicional (por ejemplo, "a man riding a brown horse" frente a "a brown man riding a horse") reciban puntuaciones de similitud casi idénticas.

La propuesta consiste en un ajuste fino de CLIP ViT-B/32 sobre 1.941.340 pares de caption y hard negative generados a partir de grafos de escena sobre las imágenes de COCO train2014. La arquitectura no se modifica: se mantiene el ViT-B/32 con QuickGELU de OpenAI, con 151.277.312 parámetros almacenados en fp32, y se publican pesos tanto en formato OpenCLIP como Transformers.

Es relevante ahora porque ofrece una mejora medible en razonamiento composicional sin aumentar el coste computacional del modelo base, lo que lo hace directamente sustituible en pipelines de zero-shot image classification, recuperación imagen-texto y filtrado de datos multimodales que ya usen CLIP ViT-B/32. La licencia MIT y la disponibilidad de los datos de entrenamiento facilitan su adopción y reproducción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual-encoder (ViT-B/32 + text encoder), CLIP con QuickGELU |
| Parametros totales | 151.277.312 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 77 tokens de texto (límite estándar de CLIP); resolución de imagen 224x224 |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan variantes GGUF, int8 ni fp16) |
| Idiomas soportados | no disponible (entrenado sobre captions en inglés de COCO) |
| Licencia | MIT |
| Formato de pesos | safetensors (`open_clip_model.safetensors` y `model.safetensors`) |

## Arquitectura y entrenamiento

CS-CLIP mantiene intacta la arquitectura de OpenAI CLIP ViT-B/32: un codificador de imagen ViT-B/32 con activación QuickGELU y un codificador de texto transformer, ambos proyectados a un espacio latente compartido. No hay cambios en el número de capas, dimensiones ni en el mecanismo de atención; el trabajo se concentra exclusivamente en el ajuste fino de los pesos.

El entrenamiento parte de los pesos de OpenAI CLIP ViT-B/32 y utiliza 1.941.340 pares de caption y hard negative construidos con grafos de escena sobre imágenes de COCO train2014 (dataset `juns/CS-CLIP-data`). La función de pérdida combina la in-batch margin ranking loss de Structure-CLIP (margen 0,2) con cinco veces una hinge loss sobre hard negatives (margen 0,1). La optimización usa AdamW con learning rate constante de 2e-6, weight decay 0,1, batch size 128, 2 épocas y precisión fp32. El checkpoint publicado corresponde a la semilla 120; el paper reporta la media sobre tres semillas.

La innovación técnica principal es la generación de negativos duros guiada por grafos de escena, que fuerza al modelo a discriminar entre captions que difieren en relaciones, objetos o atributos pero comparten la mayoría de tokens. No se emplean decodificación especulativa, atención lineal ni técnicas de inferencia alternativas.

## Capacidades

- Clasificación de imágenes zero-shot mediante comparación de embeddings imagen-texto.
- Recuperación imagen-a-texto y texto-a-imagen (I2T y T2I).
- Razonamiento composicional: distingue sustituciones de objetos y atributos, así como relaciones espaciales y de acción.
- Verificación de captions: puntuación de coherencia entre una imagen y una frase candidata.
- Emparejamiento imagen-texto multilingüe: no disponible; el modelo se entrena con captions en inglés.
- Tool calling / function calling: no soportado (no es un modelo generativo de instrucciones).
- Agentes y razonamiento multi-step: no aplica.
- Capacidades especiales: sensibilidad reforzada a la estructura composicional de la frase (orden y dependencias), no un modo "thinking" ni multimodalidad adicional.

## Casos de uso

- Filtrado y curación de datasets imagen-texto: usar el modelo para puntuar pares (imagen, caption) y descartar aquellos con baja similitud o con estructura composicional inconsistente, aprovechando su robustez frente a negativos difíciles.
- Búsqueda semántica de imágenes en catálogos: indexar embeddings de imagen con el codificador visual y consultar con texto en lenguaje natural; el modelo es un reemplazo directo de CLIP ViT-B/32 sin cambios en la infraestructura.
- Moderación y verificación de contenido: comprobar si una imagen coincide con una descripción declarada (por ejemplo, en anuncios o fichas de producto) y detectar discrepancias de atributos u objetos.
- Anotación automática asistida: generar candidatos de caption y validarlos con el modelo antes de incorporarlos a un pipeline de etiquetado, reduciendo falsos positivos en relaciones y atributos.
- Evaluación de modelos generativos de imagen: emplear las puntuaciones de similitud como métrica de alineación texto-imagen en sistemas de text-to-image, con especial utilidad en prompts que manipulan orden y atributos.
- Sistemas de recomendación visual: combinar embeddings de imagen con consultas textuales de usuario para recuperar productos o contenidos afines, manteniendo latencia baja gracias al tamaño reducido del ViT-B/32.
- Investigación en razonamiento composicional: banco de pruebas reproducible (pesos, datos y scripts) para estudiar la sensibilidad de CLIP a la estructura de la frase.

## Benchmarks y rendimiento

Resultados del checkpoint publicado (semilla 120), reproducidos con los scripts del repositorio del paper:

| Benchmark | Rel | Obj | Att | Avg |
|---|---|---|---|---|
| SugarCrepe | 83.71 | 94.31 | 87.94 | 88.59 |
| SugarCrepe Swap | no disponible | 78.05 | 81.98 | no disponible |
| SugarCrepe Add | no disponible | 90.83 | 89.02 | no disponible |

| Benchmark | Resultado |
|---|---|
| VG-Rel | 85.96 |
| VG-Att | 77.36 |
| COCO I2T R@1 | 53.20 |
| COCO T2I R@1 | 42.17 |
| GQA two-choice | 71.27 |

El paper reporta una media de SugarCrepe Avg de 88,6 ± 0,2 sobre tres semillas de entrenamiento. No se han publicado en la información disponible resultados comparativos frente a otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 (151,3 M de parámetros); en fp16 o bf16, alrededor de 0,3 GB, más memoria para activaciones y lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son suficientes y quedan sobredimensionadas para el modelo.
- Cabe en GPU de consumo: sí, en toda la gama consumer moderna (GTX 1650 en adelante), así como en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: OpenCLIP (`open_clip.create_model_and_transforms`), Transformers (`CLIPModel`, `CLIPProcessor`), y exportación a TorchScript/ONNX mediante las utilidades de OpenCLIP. No se documentan integraciones con vLLM, TGI ni llama.cpp, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de texto | Razonamiento composicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CS-CLIP (ViT-B/32) | 151,3 M | 77 tokens | SugarCrepe Avg 88,59 | MIT | Hugging Face (`juns/CS-CLIP`) |
| OpenAI CLIP ViT-B/32 | 151,3 M | 77 tokens | no disponible en esta ficha | MIT | Hugging Face (`openai/clip-vit-base-patch32`) |
| Structure-CLIP | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con CLIP ViT-B/32 es la más pertinente, ya que CS-CLIP parte de sus pesos y conserva arquitectura y tamaño; la diferencia se concentra en el ajuste fino con negativos guiados por grafos de escena. No se dispone de cifras de benchmarks de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Hereda los sesgos de los datos de preentrenamiento a escala web de CLIP; el ajuste fino sobre COCO no los corrige.
- Riesgo de alucinación en el sentido de asignar alta similitud a captions plausibles pero incorrectas, especialmente fuera de la distribución de COCO.
- El ajuste fino se realizó únicamente sobre COCO train2014, lo que puede limitar la generalización a dominios visuales muy distintos (imágenes médicas, satelitales, ilustraciones).
- Ventana de texto limitada a 77 tokens, propia de CLIP; no admite descripciones largas sin truncado.
- Idiomas: no hay evidencia de soporte multilingüe; los captions de entrenamiento están en inglés.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los datos de preentrenamiento originales de CLIP y de COCO si se redistribuye el modelo o los datos derivados.
- No es un modelo generativo ni soporta instrucciones, tool calling ni razonamiento multi-step; su uso en producción debe limitarse a tareas de similitud y clasificación.
- El checkpoint publicado corresponde a una sola semilla (120); la variabilidad reportada en el paper es de ±0,2 en SugarCrepe Avg.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juns/CS-CLIP
- Dataset de entrenamiento y benchmarks: https://huggingface.co/datasets/juns/CS-CLIP-data
- Paper (arXiv): https://arxiv.org/abs/2609.08242
- Repositorio de código: https://github.com/statjuns2/CS-CLIP
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
