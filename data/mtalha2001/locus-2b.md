# MTalha2001/LOCUS-2B

## Resumen

Locus-2B es un modelo de grounding visual (localización de expresiones referenciales) construido sobre Qwen/Qwen3-VL-2B-Instruct. Dado un enunciado en lenguaje natural y una imagen, devuelve la caja delimitadora del objeto referido en píxeles, o responde que el objeto no está en la imagen. Lo desarrolla MTalha2001 y se publica bajo licencia Apache-2.0 con pesos en safetensors.

La innovación principal es la receta **Locus** (Locate Once, Check Until Settled): la imagen se precalcula una sola vez, cada expresión se ejecuta como una rama corta sobre el prefijo cacheado, una cabeza de cajas genera un borrador en una pasada y el propio modelo verifica en paralelo todos los tokens de coordenadas mediante iteración de Jacobi hasta que el borrador deja de cambiar. Con aceptación exacta, la caja devuelta coincide con la respuesta greedy del modelo en coordenadas, alcanzada en unas pocas pasadas en lugar de un paso de decodificación por token.

La versión v1.1 (noviembre de 2026) añade respuestas de "no está en la imagen", mejora sustancial en objetos pequeños y entrena con filas de no-target, contraste de categoría, objetivo pequeño e intercambio de sustantivos, además de aumentación de oclusión, zoom, texto y fotométrica. El modelo tiene 1.746.808.325 parámetros totales y está pensado exclusivamente para consultas de grounding en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-2B-Instruct) con cabeza de cajas añadida y verificador por iteración de Jacobi |
| Parametros totales | 1.746.808.325 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors con cabeza de cajas, LM y vision merger; el encoder visual, tokenizer y resto de pesos se descargan de Qwen/Qwen3-VL-2B-Instruct) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct y aplica fine-tuning completo del modelo de lenguaje y del vision merger a lr 1e-5, entrenando conjuntamente la cabeza de cajas y el verificador durante 48.000 pasos con 4 imágenes x 4 expresiones por paso. La cabeza de cajas genera un borrador en una pasada; ese borrador se renderiza como los tokens de coordenadas que el modelo escribiría y el modelo verifica todos ellos en paralelo mediante iteración de Jacobi hasta que el borrador se estabiliza. Con aceptación exacta (`accept=1.0`), la caja resultante es la respuesta greedy en tokens de coordenadas del propio modelo, pero alcanzada en una media de 5,72 pasadas en lugar de un paso por token.

Los datos de entrenamiento son los splits de train de RefCOCO, RefCOCO+ y RefCOCOg, más un 15% de filas adicionales: expresiones no-target de gRefCOCO y filas de contraste de categoría, objetivo pequeño e intercambio de sustantivos construidas a partir de anotaciones de instancias de COCO-2017. Se aplica aumentación con oclusores de COCO pegados (p = 0,3), zoom-out (0,15), reformulación de la petición (0,1) y cambios fotométricos (0,15). Toda imagen que aparece en cualquier split de evaluación se elimina de todos los datos de entrenamiento.

## Capacidades

- Grounding visual de expresiones referenciales: devuelve la caja `[x0, y0, x1, y1]` en píxeles para un enunciado y una imagen.
- Respuesta de no-target: indica que el objeto no está en la imagen (`no_target=True`, `box=None`) para parte de las expresiones sin objetivo.
- Procesamiento por lotes de expresiones sobre una misma imagen: la imagen se precalcula una vez y cada expresión corre como rama corta sobre el prefijo cacheado.
- Decodificación especulativa con verificación exacta: `accept=1.0` (greedy exacto), `accept=0.5` (aceptación típica, menos pasadas) y `verify=False` (borrador de la cabeza en una pasada).
- Replay de CUDA graphs (`graphs=True`) para formas de imagen ya vistas.
- Solo inglés y solo consultas de grounding; otras preguntas deben dirigirse al modelo base.

## Casos de uso

- Anotación automática de datasets de detección: generar cajas para expresiones referenciales sobre imágenes COCO o similares, con la opción de obtener la respuesta greedy exacta del modelo para garantizar reproducibilidad en la anotación.
- Sistemas de búsqueda visual por descripción: dado un catálogo de imágenes y una consulta como "el hombre de camiseta roja", localizar el objeto; el prefill único de la imagen permite evaluar varias expresiones sobre la misma imagen con coste marginal bajo.
- Moderación y verificación de contenido: comprobar si un objeto descrito aparece en una imagen y en qué región, usando la respuesta de no-target para descartar falsos positivos.
- Robótica e interfaces de manipulación: localizar el objeto referido por una instrucción en lenguaje natural para alimentar un pipeline de agarre o navegación, con latencias de 98-226 ms por petición en una RTX A6000.
- Control de calidad en líneas de producción: detectar objetos pequeños o ausentes en imágenes de inspección, apoyándose en la mejora de v1.1 para objetivos de menos del 2% de la imagen (40,0% Acc@0.5 a 640², 47,8% a 1024²).
- Asistentes de accesibilidad: describir la posición de objetos solicitados por un usuario en una imagen, integrando el modelo como módulo de grounding dentro de un asistente multimodal más amplio.
- Evaluación de pipelines de visión: usar la verificación exacta como referencia para medir la calidad de cabezas de regresión más rápidas, comparando el borrador de una pasada con la salida verificada.

## Benchmarks y rendimiento

Media sobre los 8 splits val y test de RefCOCO / RefCOCO+ / RefCOCOg, a 640² píxeles. "Passes" es la media de pasadas secuenciales por expresión.

| Salida | Acc@0.5 | Acc@0.75 | Acc@0.9 | Passes |
|---|---|---|---|---|
| Cabeza (una pasada) | 89,48 | 79,32 | 55,51 | 1 |
| Verificado, exacto (greedy) | 88,46 | 79,51 | 59,43 | 5,72 |
| Verificado, típico (α = 0,5) | 88,92 | 80,00 | 59,16 | 3,06 |
| v1.0, verificado, exacto | 89,30 | 80,31 | 59,13 | 5,60 |

Referencias en las mismas filas: Jag-0,8B (cabeza de regresión) 88,16 / 76,51 / 48,76; LocateAnything-3B (tokens de caja) 88,68 / 80,82 / 65,55.

Casos específicos a través de `ground`:

| Métrica | v1.0 | v1.1 |
|---|---|---|
| Ref-L4 val, objetivos bajo 2% de la imagen, Acc@0.5, 640² | 16,7 | 40,0 |
| Igual, a 1024² | 32,2 | 47,8 |
| gRefCOCO no-target respondidas "no está en la imagen" | 0,0% | 60,0% |

Latencia en una RTX A6000, batch 1, RefCOCO testA a 640², media de ms por petición: 226 sin graphs, 111 con `graphs=True` en una forma de imagen vista por primera vez, 98 cuando las formas se repiten.

## Requisitos de hardware

- GPU CUDA obligatoria: el código de inferencia (`locus.hub`) requiere una GPU CUDA.
- VRAM estimada: no disponible en la información proporcionada; con 1.746.808.325 parámetros en bf16, el peso del modelo ronda los 3,5 GB, a lo que se suma el encoder visual y los pesos adicionales descargados de Qwen/Qwen3-VL-2B-Instruct y las cachés de prefijo por imagen.
- GPU recomendadas: RTX A6000 es la referencia medida por el autor (98-226 ms por petición). Por tamaño, debería caber en GPUs de consumo con suficiente VRAM, aunque no se publican medidas en ellas.
- Opciones de despliegue: el paquete propio `locus` (`pip install -e <code repo>`) con `from_pretrained` y `ground`; soporte de CUDA graphs para formas repetidas. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible más allá de la latencia por petición indicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Acc@0.5 (media 8 splits) | Acc@0.9 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Locus-2B v1.1 (exacto) | 1,75 B | Cabeza de cajas + verificación Jacobi | 88,46 | 59,43 | Apache-2.0 | Hugging Face |
| Locus-2B v1.1 (típico) | 1,75 B | Igual, aceptación α = 0,5 | 88,92 | 59,16 | Apache-2.0 | Hugging Face |
| Jag-0,8B | 0,8 B | Cabeza de regresión | 88,16 | 48,76 | no disponible | no disponible |
| LocateAnything-3B | 3 B | Tokens de caja | 88,68 | 65,55 | no disponible | no disponible |

Locus-2B iguala o supera ligeramente a Jag-0,8B en Acc@0.5 y Acc@0.9, y queda por debajo de LocateAnything-3B en Acc@0.9 (59,43 frente a 65,55) con menor número de parámetros.

## Limitaciones y advertencias

- La precisión en RefCOCO es ligeramente inferior a la de v1.0 (88,46 frente a 89,30 en Acc@0.5 exacto).
- Los objetos pequeños siguen siendo el caso débil: 40,0% Acc@0.5 a 640² para objetivos bajo el 2% de la imagen; una segunda pasada a 1024² ayuda (47,8%).
- La respuesta "no está en la imagen" solo se da para parte de las expresiones sin objetivo (60,0% en gRefCOCO); el resto recibe una caja.
- La verificación es más lenta que la cabeza sola y que una cabeza de regresión pura.
- La exactitud se refiere al decode greedy de este modelo; en bf16 se mantiene hasta el redondeo que también hace diferir dos ejecuciones greedy con formas de batch distintas.
- El modelo solo responde consultas de grounding; otras preguntas deben dirigirse al modelo base Qwen3-VL-2B-Instruct.
- Solo soporta inglés.
- Requiere GPU CUDA; no se documenta inferencia en CPU.
- Los términos de las anotaciones de entrenamiento (RefCOCO/+/g y gRefCOCO sobre imágenes COCO) deben revisarse para uso comercial, aunque los pesos sean Apache-2.0.
- Riesgo de alucinación de cajas en expresiones sin objetivo cuando no se activa la respuesta no-target.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MTalha2001/LOCUS-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Repositorio de código (referenciado en la model card como `<code repo>`, con `CHANGELOG.md`): no disponible como URL concreta en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
