# maelic/relsgg-vits16

## Resumen

relsgg-vits16 es un modelo de generación de grafos de escena (scene graph generation, SGG) en vocabulario abierto desarrollado por el autor independiente maelic, publicado en HuggingFace bajo el identificador `maelic/relsgg-vits16`. Su tarea no es generar texto libre, sino predecir relaciones entre regiones: recibe una imagen y un conjunto de cajas o máscaras procedentes de cualquier detector, segmentador o anotación, y devuelve tripletas ordenadas del tipo `(persona) --montando [0.67]--> (caballo)`. Un aspecto diferencial es que las etiquetas de clase de los objetos nunca se usan como entrada del modelo.

El modelo forma parte del proyecto **RelateAnything**, y su innovación principal es que el vocabulario de predicados es una entrada en tiempo de inferencia, no una lista fija aprendida. El usuario puede pasar cualquier conjunto de cadenas (por ejemplo, `"about to collide with"`, `"reflected in"`) sin reentrenar: un *text student* codifica el vocabulario una única vez, la cabeza de predicción se reparametriza sobre esas representaciones y, a partir de ahí, la puntuación es puramente visual. También puede desplegarse el vocabulario completo de entrenamiento, 19.103 predicados, leídos directamente de los pesos.

El backbone es DINOv3 ViT-S/16 (`facebook/dinov3-vits16-pretrain-lvd1689m`), se entrenó sobre el dataset RA-4M y se distribuye bajo la licencia DINOv3 de Meta, al ser un derivado de sus pesos. El repositorio ocupa 0,3 GB y el modelo declara un F1@50 de 0,3591 en Visual Genome 150 (test, protocolo graph-constrained) en su model-index, con resultados adicionales de transferencia cerrada, vocabulario abierto, razonamiento espacial y descomposición en dos grafos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión con backbone DINOv3 ViT-S/16 y cabeza de predicción de relaciones reparameterizada sobre embeddings de predicados generados por un *text student* |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual: consume una imagen y N regiones) |
| Tipos de cuantización | no disponible (los pesos se distribuyen sin cuantizar) |
| Idiomas soportados | no disponible (el vocabulario de predicados se aporta en inferencia como cadenas de texto; el autor no publica lista de idiomas) |
| Licencia | dinov3-license (`license: other`, derivada de los pesos DINOv3 de Meta) |
| Formato de pesos | PyTorch: `model.pth` (pesos EMA), `text_student.pt` + tokenizer, `predicate_embeddings.npz`, `predicate_bank.npz`, `thresholds.json`, `calibration.json` |
| Backbone | `facebook/dinov3-vits16-pretrain-lvd1689m` |
| Vocabulario de predicados de entrenamiento | 19.103 cadenas |
| Tamaño del repositorio | 0,3 GB |
| Librería de inferencia | `relsgg` (instalable desde GitHub) |
| Pipeline declarado | image-text-to-text |
| Fecha de creación / última actualización | 2026-09-09 / 2026-09-17 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura combina un backbone visual DINOv3 ViT-S/16 con una cabeza que puntúa relaciones entre pares de regiones. El punto clave es la reparameterización: el vocabulario de predicados se codifica una sola vez con un *text student* que se distribuye junto a los pesos, y la cabeza se reescribe sobre esas representaciones. Después, la puntuación es exclusivamente visual, de modo que el coste por imagen se reduce a un *forward pass* de visión. Si se activa `full_vocabulary=True`, el modelo lee `predicate_embeddings.npz` en lugar de codificar el vocabulario, lo que sustituye aproximadamente un minuto y medio de trabajo en CPU por una descarga. El modelo también puede devolver dos grafos en un único *forward pass* (espacial y semántico) mediante `decompose=True`, y acepta tanto cajas `[N, 4]` en píxeles como máscaras binarias `[N, H, W]`.

El entrenamiento usa la mezcla `megasg_clean + vg_raw + hicodet`, con pesos por imagen de 0,727 / 0,063 / 0,210 y negativos con conciencia de fuente para `hicodet`. Las anotaciones proceden del dataset RA-4M, cuyas etiquetas fueron generadas por `gemma-4-26B`, y las imágenes se referencian solo por identificador (Objects365/COCO/OpenImages); el subconjunto `vg_raw` deriva de Visual Genome (CC BY 4.0). En la procedencia declarada se registra el *commit* `e9ea42aed60f766f12ad19d51709129c50110a3b`, paridad ONNX con opset 17 y un error máximo `max|Δ|` de 1,36e-05, sobre torch 2.13.0+cu130 y transformers 5.14.1. Los sinónimos de predicados no se colapsan de forma deliberada, y los umbrales de decisión publicados son específicos de este checkpoint porque la cabeza está entrenada por rangos.

## Capacidades

- Predicción de relaciones en vocabulario abierto: acepta cualquier conjunto de cadenas como vocabulario de predicados en inferencia, sin reentrenamiento.
- Entrada de regiones agnóstica: funciona con cajas o máscaras de cualquier detector, segmentador o anotación; no requiere etiquetas de clase de objeto.
- Salida ordenada de tripletas con puntuación, con `topk` configurable (por ejemplo, `topk=20`).
- Descomposición en dos grafos desde un único *forward pass*: grafo espacial y grafo semántico.
- Vocabulario completo de entrenamiento (19.103 predicados) disponible offline desde los pesos.
- Razonamiento espacial adversarial: el autor reporta un AUC macro de 0,6757 en SpatialSense (tarea verdadero/falso, azar = 0,5).
- Ajuste de umbrales por predicado mediante `thresholds.json` y `calibration.json` calibrados sobre este checkpoint.
- Exportabilidad a ONNX documentada (opset 17) con paridad numérica verificada.
- No se documentan capacidades de *tool calling*, agentes, audio ni generación de texto libre; el pipeline declarado es de imagen-texto a texto, pero la salida es estructurada (relaciones).

## Casos de uso

- Anotación automática de datasets de grafos de escena: dado un conjunto de imágenes con cajas procedentes de un detector, el modelo genera tripletas relación sujeto-predicado-objeto para preanotar corpus de SGG y reducir el trabajo manual de revisión.
- Robótica y manipulación: alimentado con máscaras de un segmentador, devuelve relaciones espaciales (`above`, `supporting`, `next to`) con umbrales calibrados, útiles para planificación de agarre y comprobación de disposición de objetos.
- Búsqueda visual relacional: indexar imágenes por relaciones en lugar de por objetos permite consultas del tipo "persona sobre bicicleta" usando el vocabulario completo de 19.103 predicados y umbrales por predicado.
- Seguridad y videovigilancia: el vocabulario es configurable en inferencia, de modo que se pueden definir predicados operativos como `"about to collide with"` sin reentrenar y comparar su puntuación contra el umbral calibrado.
- Moderación y análisis de contenido: predicados como `wearing`, `holding` o `looking at` presentan los mejores F1 medidos del checkpoint (0,678, 0,457 y 0,254 respectivamente) y permiten filtros de alto *recall* sobre regiones propuestas externamente.
- Generación de descripciones estructuradas: combinado con un modelo de lenguaje, el grafo resultante sirve como representación intermedia verificable para producir *captions* densos o respuestas de VQA relacional.
- Verificación de *grounding* de VLM generalistas: el modelo actúa como comprobador de relaciones entre regiones, validando o descartando afirmaciones relacionales generadas por otro modelo.
- Análisis de escenas en comercio electrónico o moda: detección de atributos relacionales (`wearing`, `part of`) sobre imágenes de producto con regiones obtenidas por un segmentador, con la ventaja de que las etiquetas de clase nunca entran como entrada.

## Benchmarks y rendimiento

Resultado declarado en el model-index oficial (no verificado por terceros, `verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| scene-graph-generation | Visual Genome 150 (test) | F1@50 (graph-constrained) | 0,3591 |

Transferencia a vocabulario cerrado (reparameterizado, test, graph-constrained), según la model card:

| Fuente | R@50 | mR@50 | F1@50 |
|---|---|---|---|
| vg150 | 0,525 | 0,273 | 0,359 |
| psg | 0,396 | 0,298 | 0,340 |
| indoorvg | 0,519 | 0,276 | 0,360 |
| hicodet | 0,453 | 0,305 | 0,365 |

Vocabulario abierto, sin reparameterización, con los 19.103 predicados desplegados y emparejamiento por sinónimos en el tau calibrado:

| Fuente | SoftR@50 | SoftmR@50 | SoftF1@50 |
|---|---|---|---|
| vg150 | 0,551 | 0,333 | 0,415 |
| psg | 0,303 | 0,268 | 0,284 |
| indoorvg | 0,528 | 0,315 | 0,395 |

Razonamiento espacial (SpatialSense, protocolo adversarial verdadero/falso, azar = 0,5): AUC macro sobre predicados de 0,6757.

Descomposición en dos grafos (protocolo estratificado por tipo):

| Fuente | Espacial R@50 / mR@50 | Semántico R@50 / mR@50 |
|---|---|---|
| vg150 | 0,627 / 0,298 | 0,494 / 0,294 |
| psg | 0,601 / 0,534 | 0,404 / 0,316 |
| indoorvg | 0,606 / 0,335 | 0,406 / 0,276 |

Umbrales de despliegue por predicado (mejor F1 medido sobre este checkpoint, régimen cajas *ground truth*, `pair_weight=0`, 5.000 imágenes de validación):

| Predicado | Umbral | Mejor F1 | Soporte GT |
|---|---|---|---|
| behind | 0,890 | 0,329 | 3.599 |
| in front of | 0,865 | 0,337 | 3.576 |
| wearing | 0,985 | 0,678 | 3.417 |
| to the right of | 0,860 | 0,377 | 3.198 |
| to the left of | 0,860 | 0,373 | 3.098 |
| resting on | 0,975 | 0,577 | 2.164 |
| on | 0,935 | 0,455 | 2.042 |
| holding | 0,975 | 0,457 | 1.553 |
| beside | 0,975 | 0,196 | 1.404 |
| next to | 0,945 | 0,240 | 1.352 |
| above | 0,895 | 0,333 | 1.279 |
| below | 0,890 | 0,321 | 1.239 |
| part of | 0,905 | 0,471 | 1.134 |
| supporting | 0,985 | 0,191 | 947 |
| looking at | 0,965 | 0,254 | 872 |

## Requisitos de hardware

- VRAM estimada: no hay cifra oficial. Como referencia, el repositorio completo ocupa 0,3 GB y el backbone es un ViT-S/16, por lo que la inferencia en fp32 debería residir en el orden de unos pocos cientos de MB a 1-2 GB de VRAM (estimación a partir del tamaño del repositorio, no un dato publicado).
- GPU recomendadas: cualquier GPU CUDA con al menos unos pocos GB de VRAM; el *forward pass* de visión es ligero. No se publican cifras específicas para A100, H100 o RTX 4090.
- GPU de consumo: sí, es esperable que quepa en GPUs de consumo (RTX 3060, 4060, 4090 y similares) e incluso en ejecución solo CPU, dado el tamaño del backbone.
- Codificación del vocabulario: con vocabulario arbitrario, la codificación inicial cuesta aproximadamente un minuto y medio en CPU; con `full_vocabulary=True` se sustituye por la descarga de `predicate_embeddings.npz`. Después, la puntuación es solo visión.
- Opciones de despliegue: librería propia `relsgg` (`pip install git+https://github.com/Maelic/RelateAnything`), carga con `RelateAnything.from_pretrained(..., device="cuda")` y exportación ONNX documentada (opset 17, paridad `max|Δ|` 1,36e-05). No se documentan rutas vLLM, llama.cpp, Ollama ni TGI, y al no distribuirse en GGUF ni safetensors no son aplicables directamente.
- Latencia y throughput: no disponible. Al ser un modelo de puntuación de relaciones con reparameterización, el coste por imagen corresponde esencialmente a un único *forward pass* visual más el emparejamiento de pares de regiones.
- `model.pth` incluye la configuración del backbone, por lo que no se necesita login para acceder a los pesos sujetos a *gating* de DINOv3.

## Comparativa con modelos similares

No se dispone de datos comparativos de modelos alternativos en la información proporcionada. La categoría natural de comparación son los modelos de generación de grafos de escena con vocabulario cerrado (enfoques tipo MOTIFS o RelTR) y los detectores de relaciones entrenados sobre Visual Genome, pero la model card no incluye sus cifras, parámetros, contexto ni licencias, por lo que no es posible establecer una comparación numérica fiable.

| Modelo | Parámetros | Vocabulario de predicados | Rendimiento vg150 F1@50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| relsgg-vits16 | no disponible (backbone DINOv3 ViT-S/16) | 19.103, ampliable en inferencia | 0,359 (graph-constrained, no verificado) | dinov3-license | HuggingFace (`maelic/relsgg-vits16`) |
| Alternativas de SGG con vocabulario cerrado | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos generalistas de visión-lenguaje | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento moderado: el F1@50 declarado para vg150 es 0,3591 y el model-index lo marca como `verified: false`, es decir, no ha sido validado por terceros.
- Caída en vocabulario abierto: el protocolo sin reparameterización baja notablemente en algunos dominios, con SoftF1@50 de 0,284 en psg frente a 0,415 en vg150.
- Predicados difíciles: `supporting` (F1 0,191), `beside` (0,196) y `next to` (0,240) presentan un rendimiento bajo incluso con cajas *ground truth*, por lo que no son fiables en producción sin revisión.
- Los umbrales publicados son específicos de este checkpoint: la cabeza está entrenada por rangos y las escalas de puntuación no se transfieren a otros modelos ni necesariamente a otros *checkpoints*.
- Dependencia de regiones externas: el modelo no detecta objetos ni genera propuestas. Necesita cajas o máscaras de un detector, un segmentador o anotación humana, y su calidad condiciona directamente la salida.
- Sin etiquetas de clase como entrada: no se le puede preguntar por clases concretas; solo devuelve relaciones sobre el vocabulario aportado.
- Ruido de anotación: las etiquetas de RA-4M fueron generadas por `gemma-4-26B`, por lo que pueden heredar sesgos y errores del modelo anotador, además de los sesgos propios de Visual Genome, COCO, Objects365 y OpenImages.
- Sin colapso de sinónimos: los predicados sinónimos no se unifican de forma deliberada, lo que puede fragmentar las puntuaciones y complicar el emparejamiento en vocabulario abierto.
- Licencia restrictiva: los pesos derivan de DINOv3 y se distribuyen bajo la licencia DINOv3 de Meta, que no es una licencia de código abierto estándar; es imprescindible revisar sus condiciones antes de cualquier uso comercial.
- Avisos de datos: las anotaciones de entrenamiento portan el aviso de los Términos de Uso de Gemma; las imágenes se referencian solo por identificador; el subconjunto `vg_raw` deriva de Visual Genome (CC BY 4.0).
- Idiomas: no se publica información sobre idiomas soportados ni sobre el comportamiento del vocabulario en lenguas distintas del inglés.
- Adopción mínima: 0 descargas y 1 like en el momento de la consulta, sin resultados relevantes en la búsqueda web, lo que limita la evidencia independiente sobre su comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maelic/relsgg-vits16
- Repositorio de código RelateAnything: https://github.com/Maelic/RelateAnything
- Paper: https://arxiv.org/abs/2609.12552
- Página del proyecto: https://maelic.github.io/RelateAnythingProject
- Dataset de entrenamiento RA-4M: https://huggingface.co/datasets/maelic/RA-4M
- Especificación del benchmark OV-SGG-Bench: https://github.com/Maelic/RelateAnything/blob/main/benchmark/SPEC.md
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Backbone DINOv3 ViT-S/16: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo.
