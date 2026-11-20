# canvit/canvitb16-add-vpe-finetune-g128px-s512px-in1k-from-in1k-2026-07-24

## Resumen

CanViT-B es un modelo de visión artificial de tipo *active vision* desarrollado por el equipo CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna) y presentado en NeurIPS 2026. A diferencia de un ViT convencional, que procesa la imagen completa en una sola pasada, CanViT observa la escena mediante una secuencia de *glimpses* (recortes de 128 px) y acumula la información en un *canvas* (lienzo) de memoria de 32 × 32 celdas que actúa como estado recurrente de la escena. El modelo se presenta como un paso hacia modelos fundacionales de visión activa, donde el coste computacional se reparte entre percepción y memoria.

Este checkpoint concreto es un ViT-Base (95,9 millones de parámetros) preentrenado por destilación desde DINOv3 sobre ImageNet-1k y posteriormente afinado de extremo a extremo para clasificación en ImageNet-1k mediante la estrategia LP-FT (linear probing seguido de fine-tuning). Trabaja con escenas de 512 px y alcanza un 84,19 % de Top-1 en validación con 21 glimpses, un resultado que lo sitúa en la liga de los ViT-B/16 supervisados clásicos, pero con un paradigma de inferencia secuencial y adaptable.

Su relevancia actual radica en que demuestra que un modelo de visión activa puede competir en una tarea estática estándar sin renunciar a su naturaleza secuencial: el mismo *checkpoint* permite refinar la predicción acumulando más *glimpses*, lo que abre la puerta a políticas de observación adaptativas en robótica, inspección visual o análisis de imágenes de muy alta resolución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer con estado de canvas y política de glimpses (CanViT, active vision) |
| Parametros totales | 95.928.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; estado de canvas de 32 × 32 celdas y secuencia de glimpses de 128 px sobre escenas de 512 px |
| Tipos de cuantizacion | no disponible (pesos en safetensors; soporte de cuantización no documentado) |
| Idiomas soportados | no disponible (modelo de visión; sin capacidades de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `canvit-pytorch`) |

## Arquitectura y entrenamiento

CanViT (Canvas Vision Transformer) es un transformer de visión con un mecanismo de memoria explícito. En cada paso, el modelo recibe un *glimpse* de 128 px muestreado en un *viewpoint* concreto de la escena de 512 px, junto con el estado del canvas de 32 × 32. El transformer procesa el *glimpse* y actualiza el canvas, de modo que la representación de la escena se construye de forma incremental. La clasificación final se obtiene a partir del estado acumulado, no de una única pasada sobre la imagen completa. El checkpoint incorpora *add-vpe* (viewpoint positional encoding aditivo), que codifica la posición del *glimpse* dentro de la escena.

El preentrenamiento se realizó por destilación desde DINOv3 sobre ImageNet-1k, con escenas de 512 px y *glimpses* de 128 px. El *fine-tuning* de este checkpoint se hizo de extremo a extremo con LP-FT: primero *linear probing* sobre la representación congelada, inicializando el clasificador con la fusión del readout CLS del modelo preentrenado y la sonda lineal de DINOv3 (`canvit/dinov3-vitb16-lvd1689m-in1k-512x512-linear-clf-probe`), y después *fine-tuning* completo. Se entrenaron 100.000 de 100.080 pasos con batch de 256, optimizador AdamW (lr 2,5e-05, weight decay 1e-4, gradient clipping 1), *warmup* lineal de 25.000 pasos y decaimiento coseno. La pérdida es entropía cruzada tras cada *glimpse* con *label smoothing* de 0,1. El entrenamiento se ejecutó en JAX/Flax NNX sobre Cloud TPU y se exportó a PyTorch.

## Capacidades

- Clasificación de imágenes en ImageNet-1k (1.000 clases) mediante observación secuencial de la escena.
- Percepción activa: la predicción se refina acumulando *glimpses* adicionales sobre el canvas, sin recompilar el modelo.
- Representación de escena en memoria: el canvas de 32 × 32 permite integrar información de regiones observadas en distintos pasos.
- Control explícito del *viewpoint* de cada *glimpse*, lo que habilita políticas de observación programables (barridos, foveado, muestreo adaptativo).
- Extracción de características visuales a partir del estado del canvas (uso como *backbone* para tareas *downstream*).
- No soporta *tool calling*, agentes de texto, razonamiento multi-paso lingüístico ni generación de texto.
- No dispone de capacidades multilingües, de audio ni de vídeo documentadas.

## Casos de uso

- **Clasificación de imágenes de alta resolución por parcheo**: para escenas de 512 px o mayores, el modelo puede observar solo regiones relevantes en lugar de redimensionar la imagen completa, preservando detalle fino en tareas de inspección.
- **Inspección visual industrial**: un pipeline puede dirigir los *glimpses* hacia zonas candidatas a defecto y refinar la clasificación acumulando observaciones, usando el canvas como memoria del estado de la pieza.
- **Robótica con fóvea activa**: el control explícito del *viewpoint* permite integrar el modelo en bucles de control donde la cámara o el efector decide dónde mirar a continuación, en lugar de procesar un *frame* completo por paso.
- **Preetiquetado y curación de datasets**: como clasificador ImageNet-1k con 84,19 % de Top-1, sirve para generar etiquetas preliminares o filtrar imágenes en pipelines de anotación, con la ventaja de poder aumentar el número de *glimpses* en casos ambiguos.
- **Análisis de imágenes con recursos computacionales limitados**: al procesar *glimpses* de 128 px en lugar de la escena completa, el coste por paso es menor y puede ajustarse dinámicamente al presupuesto disponible.
- **Investigación en visión activa**: *checkpoint* de referencia para experimentar con políticas de observación, comparar estrategias de muestreo y estudiar el compromiso entre número de *glimpses* y precisión.
- **Backbone para transferencia**: el estado del canvas puede alimentar cabezas de clasificación o detección en dominios específicos tras un *fine-tuning* adicional.

## Benchmarks y rendimiento

Resultados declarados por el autor en la *model card* (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Clasificación de imágenes | ImageNet-1k (validación) | Top-1, C2F, 21 glimpses, media de 11 ejecuciones | 84,19 % |
| Clasificación de imágenes | ImageNet-1k (validación) | Intervalo bootstrap 95 % | 84,17 – 84,21 % |

No se han publicado en la información disponible resultados de otros benchmarks (por ejemplo, transferencia a otros datasets, throughput o latencia).

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 95,9 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,38 GB; en FP16/BF16, unos 0,19 GB. El estado del canvas y los *glimpses* añaden una sobrecarga pequeña, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- **GPU recomendadas**: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para una instancia; para *batches* grandes o entrenamiento, se recomiendan A100, H100 o RTX 4090.
- **Cabe en GPU de consumo**: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes.
- **Opciones de despliegue**: la librería oficial es `canvit-pytorch` (>= 0.2), instalable con `uv add "canvit-pytorch>=0.2"`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada. La latencia escala con el número de *glimpses* por inferencia (21 en la configuración de benchmark).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Top-1 ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CanViT-B (este checkpoint) | 95,9 M | Escenas 512 px, *glimpses* de 128 px, canvas 32 × 32 | 84,19 % (21 *glimpses*) | MIT | Hugging Face, `canvit-pytorch` |
| ViT-B/16 supervisado (referencia) | ~86 M | Imagen completa 224 px | no disponible en esta información | según checkpoint | amplia |
| DINOv3 ViT-B/16 | no disponible en esta información | Imagen completa | no disponible en esta información | DINOv3 License | Hugging Face / Meta |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; los valores de ViT-B/16 y DINOv3 no se incluyen para no inventar cifras.

## Limitaciones y advertencias

- **Resultados no verificados**: la accuracy de 84,19 % es un dato declarado por el autor en la *model card*; no consta verificación independiente.
- **Ámbito estrecho**: el modelo está afinado exclusivamente para clasificación en ImageNet-1k (1.000 clases); su uso fuera de ese dominio requiere *fine-tuning* o extracción de características.
- **Dependencia de la política de *glimpses***: el rendimiento depende del número y la secuencia de *glimpses*; la cifra publicada corresponde a 21 *glimpses* con *viewpoints* C2F, y no se documentan resultados con otras políticas.
- **Licencia y procedencia**: el *checkpoint* se distribuye con licencia MIT, pero el preentrenamiento se realizó por destilación desde DINOv3, liberado bajo la DINOv3 License; conviene revisar las implicaciones de esa licencia para usos comerciales derivados.
- **Sesgos**: no se documentan análisis de sesgo; al estar entrenado y evaluado solo en ImageNet-1k, hereda los sesgos de ese dataset (categorías, distribución geográfica y demográfica).
- **Riesgo de alucinación**: no aplica en el sentido lingüístico, pero el modelo puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- **Sin soporte multilingüe ni de texto**: no es un modelo de lenguaje; no debe emplearse para tareas de generación, razonamiento simbólico o *tool calling*.
- **Madurez del ecosistema**: la librería `canvit-pytorch` es específica y no está integrada en frameworks de despliegue estándar como vLLM o TGI; la integración en producción requiere trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canvit/canvitb16-add-vpe-finetune-g128px-s512px-in1k-from-in1k-2026-07-24
- Modelo base (preentrenamiento): https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22
- Sonda lineal DINOv3 usada en la inicialización: https://huggingface.co/canvit/dinov3-vitb16-lvd1689m-in1k-512x512-linear-clf-probe
- Todos los checkpoints CanViT: https://huggingface.co/canvit
- Paper (NeurIPS 2026, OpenReview): https://openreview.net/forum?id=cnV9GA4pKU
- arXiv: https://arxiv.org/abs/2603.22570
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- DINOv3 (modelo del que se destila): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
