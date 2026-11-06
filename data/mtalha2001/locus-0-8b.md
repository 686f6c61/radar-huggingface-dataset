# MTalha2001/LOCUS-0.8B

## Resumen

LOCUS-0.8B es un modelo de visual grounding (localización visual) que recibe una imagen y una expresión referencial en lenguaje natural ("el hombre de la camisa roja") y devuelve la bounding box del objeto indicado en píxeles. Ha sido desarrollado por MTalha2001 como un fine-tuning completo de Qwen/Qwen3.5-0.8B, al que se añade una pequeña cabeza de predicción de cajas.

Su aportación principal es la receta de entrenamiento e inferencia **Locus** (Locate Once, Check Until Settled): la imagen se prefill una única vez y cada expresión sobre ella se ejecuta como una rama corta sobre el prefijo cacheado; la cabeza redacta (draft) la caja en una pasada y el modelo verifica los tokens de coordenadas en paralelo mediante iteración de Jacobi hasta que el borrador deja de cambiar. Con aceptación exacta, el resultado es idéntico a la decodificación greedy del modelo, pero alcanzada en pocas pasadas en lugar de un paso por token.

Es relevante porque demuestra que un modelo pequeño (765,5 millones de parámetros) puede competir en precisión de grounding con alternativas mayores, manteniendo latencias de decenas de milisegundos por expresión en una única GPU. Existe además una variante mayor, LOCUS-2B, con la misma receta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-0.8B) con cabeza de predicción de bounding box y verificación de tokens de coordenadas por iteración de Jacobi |
| Parámetros totales | 765.512.517 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bf16 según la model card) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,5 GB; el vision encoder, el tokenizer y el resto de pesos se descargan de Qwen/Qwen3.5-0.8B) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B (modelo multimodal image-text-to-text) y añade una cabeza ligera de predicción de cajas. Se ha realizado un fine-tuning completo del modelo de lenguaje y del vision merger a lr 1e-5, entrenando cabeza y verificador conjuntamente durante 36.000 pasos (2,00 épocas, el mismo presupuesto que Jag). El repositorio solo contiene los pesos modificados (cabeza, LM y merger); el resto se obtiene vía `from_pretrained` del modelo base.

Los datos de entrenamiento son los splits de train de RefCOCO, RefCOCO+ y RefCOCOg (anotaciones sobre imágenes de COCO), eliminando toda imagen que aparezca en algún split de evaluación. La innovación técnica clave es el esquema draft-and-verify: la cabeza redacta la caja en una pasada, el borrador se renderiza como los tokens de coordenadas que el modelo escribiría, y el modelo los verifica todos en paralelo por iteración de Jacobi hasta convergencia. Con aceptación típica (α = 0,7 o 0,5) se reduce el número de pasadas a costa de dejar de ser exactamente greedy.

## Capacidades

- Visual grounding: localiza objetos descritos por expresiones referenciales en inglés y devuelve bounding boxes en píxeles formato [x0, y0, x1, y1].
- Procesamiento por lotes de expresiones sobre una misma imagen: gracias al prefill único y al prefijo cacheado, múltiples expresiones se resuelven como ramas cortas sobre el mismo prefijo.
- Tres modos de salida: borrador de la cabeza en una pasada (`verify=False`), verificación exacta greedy (`accept=1.0`) y verificación típica (`accept=0.7` o `0.5`, menos pasadas).
- No responde a otras preguntas: solo resuelve consultas de grounding; el resto de consultas deben dirigirse al modelo base.

## Casos de uso

- Anotación asistida de datasets: dado un lote de expresiones sobre una imagen, el modelo devuelve cajas en una pasada de prefill, acelerando la creación de datasets de detección a partir de descripciones en lenguaje natural.
- Edición de imágenes guiada por texto: localizar la región descrita por el usuario ("el coche del fondo") antes de aplicar inpainting o edición localizada.
- Interfaces conversacionales sobre imágenes: un agente puede usar el modelo como herramienta de grounding para señalar visualmente el objeto del que habla, devolviendo coordenadas en píxeles listas para renderizar.
- Robótica y percepción embebida: con 25,5 ms por expresión en modo cabeza (512², RTX A6000, CUDA graphs), es viable como componente de localización en pipelines de baja latencia.
- Verificación de contenido visual: comprobar si una expresión dada tiene correspondencia en la imagen comparando la calidad de la caja devuelta (Acc@0.5 como señal de presencia).
- Búsqueda visual estructurada: indexar imágenes resolviendo múltiples expresiones candidatas por imagen de forma eficiente gracias al cacheo del prefijo visual.

## Benchmarks y rendimiento

Media sobre los 8 splits de val/test de RefCOCO / RefCOCO+ / RefCOCOg, a 640² píxeles. "Passes" son las pasadas secuenciales medias por expresión.

| Output | Acc@0.5 | Acc@0.75 | Acc@0.9 | Passes |
|---|---|---|---|---|
| head (one pass) | 87,97 | 75,58 | 47,03 | 1 |
| verified, exact (greedy) | 87,05 | 75,93 | 53,10 | 6,68 |
| verified, typical (α = 0,7) | 87,17 | 76,14 | 53,29 | 4,37 |

Referencias en las mismas filas: Jag-0.8B (cabeza de regresión) 88,16 / 76,51 / 48,76; LocateAnything-3B (tokens de caja) 88,68 / 80,82 / 65,55.

Latencia en una RTX A6000, batch 1, entradas de 512², con CUDA graphs: cabeza 25,5 ms; verificación exacta 63,5 ms por expresión.

## Requisitos de hardware

- Se requiere GPU CUDA obligatoriamente (indicado en la model card).
- El repo pesa 1,5 GB en safetensors (bf16); sumando el modelo base Qwen3.5-0.8B, el modelo completo ronda los ~1,6 GB de pesos, por lo que es asumible por GPUs con 6-8 GB de VRAM o más. No se publican cifras oficiales de VRAM.
- Cabe con holgura en GPUs de consumo modernas (RTX 3060, RTX 4060 Ti, RTX 4090); las latencias publicadas se midieron en una NVIDIA RTX A6000.
- Despliegue mediante la librería del proyecto: `pip install git+https://github.com/muhammad-talha-ad/LOCUS` y carga con `locus.hub.from_pretrained`. No se mencionan soportes para vLLM, llama.cpp, Ollama o TGI.
- Latencias conocidas: 25,5 ms por expresión con la cabeza sola y 63,5 ms con verificación exacta (RTX A6000, batch 1, 512², CUDA graphs). No hay datos de throughput en batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Acc@0.5 | Acc@0.75 | Acc@0.9 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LOCUS-0.8B | 765,5 M | 87,05 (exact) / 87,97 (head) | 75,93 / 75,58 | 53,10 / 47,03 | Apache-2.0 | Hugging Face, GitHub |
| Jag-0.8B | 0,8 B | 88,16 | 76,51 | 48,76 | no disponible | no disponible |
| LocateAnything-3B | 3 B | 88,68 | 80,82 | 65,55 | no disponible | no disponible |
| LOCUS-2B | 2 B | no disponible | no disponible | no disponible | no disponible | Hugging Face (MTalha2001/LOCUS-2B) |

LOCUS-0.8B se sitúa a nivel de precisión Acc@0.5/Acc@0.75 muy cerca de Jag-0.8B con un tercio del tamaño de LocateAnything-3B, aunque este último lo supera claramente en Acc@0.9 (65,55 frente a 53,10).

## Limitaciones y advertencias

- Entrenado exclusivamente con la familia RefCOCO: en Ref-L4 sobre imágenes de Objects365 el rendimiento cae muy por debajo del modelo base en zero-shot, especialmente con objetos pequeños.
- La verificación es más lenta que usar solo la cabeza (63,5 ms frente a 25,5 ms) y más lenta que una cabeza de regresión pura.
- La exactitud greedy solo se garantiza para la decodificación greedy de este modelo; en bf16 se mantiene solo hasta el redondeo que también hace que dos ejecuciones greedy con distintas formas de batch difieran.
- El modelo solo responde consultas de grounding; cualquier otra pregunta debe dirigirse al modelo base Qwen3.5-0.8B.
- Idioma limitado al inglés; no hay soporte declarado para expresiones en castellano.
- Licencia Apache-2.0 para los pesos, pero las anotaciones de entrenamiento provienen de RefCOCO/+/g sobre imágenes de COCO: hay que revisar los términos de esos datasets para el uso previsto.
- Proyecto con tracción mínima (21 descargas, 1 like en el momento de la ficha): conviene validar en producción de forma independiente.
- No hay datos publicados sobre sesgos, riesgo de alucinación ni uso en dominios distintos de COCO/RefCOCO.

## Enlaces

- Hugging Face: https://huggingface.co/MTalha2001/LOCUS-0.8B
- Modelo hermano LOCUS-2B: https://huggingface.co/MTalha2001/LOCUS-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper (arXiv): https://arxiv.org/abs/2610.35053
- Código (GitHub): https://github.com/muhammad-talha-ad/LOCUS
- Página del proyecto: https://muhammad-talha-ad.github.io/LOCUS/
