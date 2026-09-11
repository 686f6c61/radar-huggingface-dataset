# royguw/ground-qwen3-5

## Resumen

GroundQwen35 (`royguw/ground-qwen3-5`) es un árbol de código de investigación publicado por el usuario royguw para tareas de segmentación guiada (*grounded segmentation*) y *referring expression segmentation*, construido sobre el backbone multimodal Qwen3.5-0.8B. No es una librería empaquetada ni un modelo listo para producción: el repositorio contiene múltiples directorios de variantes paralelas, cada uno con su propia copia del modelo, del bucle de entrenamiento y de los scripts de evaluación, diferenciadas por una sola decisión de diseño.

Técnicamente, GroundQwen35 es un modelo *grounding-only* y **no autorregresivo**. Añade *bridge tokens* aprendibles al final de la secuencia y alimenta sus *hidden states* a tres cabezas: una cabeza de segmentación (`seg_head`, sobre *hidden states* visuales y de consulta), una cabeza de presencia (`presence_head`, solo sobre la consulta) y una cabeza de texto opcional (`text_head`). El backbone de texto tiene 24 capas híbridas con dimensión oculta 1024 y el codificador visual es un ViT de 12 capas. La configuración por defecto usa 225 *bridge tokens* (rejilla de 15×15), con identificadores de token consecutivos a partir de 248077.

Es relevante ahora porque muestra una línea de trabajo poco habitual: reutilizar un backbone vision-language pequeño (0,8B) y convertirlo en un segmentador por consultas sin generación autoregresiva, con extensión a vídeo (asignación de tubos y *temporal action tokens*), variantes de ablación y *baselines* (MM-GroundingDINO/mmdetection) incluidos. Los *checkpoints* entrenados se publican por separado en `royguw/ground-ckpts`. El repo ocupa 52,8 GB, no tiene descargas ni *likes*, y no declara licencia ni idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal híbrido (backbone de texto de 24 capas híbridas + ViT de 12 capas para visión) con bridge tokens y cabezas de grounding; no autorregresivo |
| Parametros totales | Backbone Qwen3.5-0.8B (0,8 mil millones en el modelo de texto); total del sistema (visión + cabezas) no disponible |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (dimension oculta 1024; Q = 225 bridge tokens por defecto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible; el arbol vendoriza terceros (`baselines/`, mmdetection) con sus propias licencias |
| Formato de pesos | No disponible en la informacion proporcionada; los checkpoints se publican aparte en `royguw/ground-ckpts` |

## Arquitectura y entrenamiento

El flujo es: los píxeles de la imagen pasan por un codificador visual basado en ViT de 12 capas que produce `N_vis` tokens visuales; después, una secuencia de `input_ids` compuesta por tokens visuales, texto y *bridge tokens* entra en el modelo de texto de 24 capas híbridas, que emite `hidden_states` de forma `(B, S, 1024)`. Un paso de `extract_tokens_by_mask` separa los estados ocultos en `query_hidden (B, Q, D)`, `visual_hidden (B, N_vis, D)` y, si está activado, `text_hidden (B, N_txt, D)`. La `seg_head` (Visual SingleSlot Gate) combina visual y consulta para producir `seg_logits (B, Q, N_vis)`; la `presence_head` (MLP tipo SwiGLU o capa lineal) usa solo la consulta y produce `presence_logits (B, Q)`; y la `text_head`, activa únicamente cuando `query_text_grounding=True`, combina texto de categoría y consulta con una segunda cabeza bilineal para dar `text_logits (B, Q, N_txt)`.

El formato de secuencia es `<|vision_start|> <|image_pad|>×N_vis <|vision_end|> category_text bridge_token×Q`, con `Q = num_bridges`, por defecto 225 (rejilla 15×15). Los identificadores de los *bridge tokens* son filas de embedding consecutivas sin usar a partir de 248077; si `Q > 243`, se redimensiona la tabla de embeddings. Las variantes de entrenamiento incluyen `--spatial_grid_assignment` (asignación húngara de instancias a *slots* de bridge sobre una rejilla N×N, lo que obliga a `num_bridges = N²`), `--presence_mlp` y opciones secundarias como `--reset_position`, `--mask_incomplete_presence` y `--mask_out_incomplete_presence`. El entrenamiento registra métricas en Weights & Biases (`WANDB_API_KEY` se lee del entorno) y hay una extensión de vídeo con asignación de tubos y *temporal action tokens*. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicó RLHF o DPO.

## Capacidades

- Segmentación de instancias a nivel de imagen mediante *bridge tokens* configurables: produce una máscara por *bridge* y por token visual.
- Predicción de presencia: indica qué *bridges* están ocupados por una instancia.
- *Grounding* de texto (opcional): alinea tokens de texto de categoría con cada instancia cuando `query_text_grounding` está activado.
- Segmentación referida por expresión (*referring-expression segmentation*), ya que el *grounding* textual asocia una descripción o categoría con la máscara correspondiente.
- Extensión a vídeo: asignación de tubos (*tube assignment*) y *temporal action tokens* para seguimiento y segmentación temporal.
- Análisis de atención internos: el árbol incluye `analysis/` con salidas de *bridge-attention* y análisis multiescala.
- Integración con *baselines* de detección: los directorios `baselines/` permiten comparar con MM-GroundingDINO y mmdetection.
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso en el sentido de un LLM conversacional: no es un modelo generativo autoregresivo.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Anotación automática de datasets de segmentación: dado un conjunto de imágenes y etiquetas de categoría, el modelo genera `seg_logits` por *bridge* y `presence_logits` para preetiquetar máscaras de instancia, reduciendo el coste de anotación manual antes de una revisión humana.
- Segmentación referida por expresión en herramientas de edición: el usuario escribe una descripción ("el coche rojo a la izquierda") y la `text_head` alinea los tokens de la descripción con la instancia correspondiente para producir la máscara, aprovechando la rejilla de 225 *slots* para escenas con muchas instancias.
- Seguimiento y segmentación de vídeo: con la extensión `ground_qwen35_video*/`, el modelo asigna tubos temporales y mantiene la identidad de la instancia a lo largo de los fotogramas, útil para analítica de vídeo y conteo de objetos en movimiento.
- Percepción para robótica guiada por lenguaje: un sistema de manipulación puede pedir "la pieza metálica del centro" y obtener una máscara de instancia utilizable como objetivo de agarre, ya que el modelo devuelve máscaras densas en lugar de texto.
- Control de calidad industrial: detección y delimitación precisa de defectos o componentes en líneas de producción donde se necesita la silueta exacta del objeto, no solo una *bounding box*.
- Investigación reproducible en *grounding*: el árbol incluye variantes de ablación autocontenidas y *baselines*, lo que permite reproducir experimentos cambiando una sola decisión de diseño y comparar contra MM-GroundingDINO.
- Automatización en comercio electrónico: segmentación de producto sobre fondo para generar imágenes de catálogo o recortes limpios a partir de una referencia textual de la categoría.
- Análisis de imágenes científicas: extracción de regiones de interés definidas por descripción, siempre que el dominio esté representado en los datos de entrenamiento (no hay evidencia publicada de ello en la información disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un backbone de 0,8B en fp16 ocupa aproximadamente 1,6 GB solo en pesos, a lo que hay que sumar el ViT de 12 capas, las cabezas y las activaciones de las máscaras (`seg_logits` con forma `B × 225 × N_vis`), por lo que el consumo real depende de la resolución de entrada y del número de *bridges*.
- GPU recomendadas: no especificadas por el autor. Por tamaño, debería caber en GPUs de consumo con suficiente memoria (por ejemplo, RTX 3060 12 GB, RTX 4070/4080/4090) para inferencia a resolución moderada; no hay datos publicados de despliegue en A100/H100.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del backbone, pero no hay confirmación del autor ni mediciones publicadas.
- Opciones de despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, porque el modelo no es autorregresivo y se ejecuta mediante el código de investigación (PyTorch). El repositorio requiere montar el entorno a mano, configurar `WANDB_API_KEY` y gestionar los *baselines* vendorizados.
- Latencia y throughput estimados: no disponibles.
- Nota de almacenamiento: el repositorio ocupa 52,8 GB e incluye copias paralelas del modelo y dependencias de terceros, lo que hay que tener en cuenta antes de clonarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GroundQwen35 (`royguw/ground-qwen3-5`) | Backbone de 0,8B (total no disponible) | No disponible | Grounding no autorregresivo con bridge tokens sobre Qwen3.5-0.8B | No disponible | Arbol de investigacion en HuggingFace, checkpoints en `royguw/ground-ckpts` |
| MM-GroundingDINO | No disponible en la informacion proporcionada | No disponible | Deteccion/grounding abierto basado en DINO | No disponible (vendorizado en `baselines/` con su propia licencia) | Incluido como baseline en el repositorio |
| Modelos de segmentacion referida tipo LISA | No disponible en la informacion proporcionada | No disponible | LLM + cabezas de mascara | No disponible | No evaluado en este repositorio segun la informacion disponible |
| Qwen3-VL / Qwen3.5-0.8B originales | 0,8B (Qwen3.5-0.8B) | No disponible | VLM generativo autorregresivo | No disponible | Publicados por el equipo de Qwen |

Los valores de rendimiento comparado no se pueden establecer: el autor no publica métricas y la búsqueda web no devolvió información relevante sobre este modelo.

## Limitaciones y advertencias

- Código de investigación sin empaquetar: el propio autor lo describe como un *working research tree* publicado tal cual, con múltiples directorios de variantes que duplican modelo, entrenamiento y evaluación. No hay API estable ni garantías de mantenimiento.
- Sin licencia declarada: la ficha de HuggingFace no indica licencia, lo que impide determinar si el uso comercial está permitido. Cualquier uso en producción requiere aclarar esto con el autor.
- Dependencias de terceros: `baselines/` y `ground_qwen35_video/baselines/` vendorizan mmdetection y otros repositorios con licencias propias que hay que respetar por separado.
- Repositorio de 52,8 GB: el tamaño incluye copias paralelas y baselines, no solo pesos; hay que planificar el almacenamiento.
- No es un modelo generativo: no sirve para chat, generación de texto, *tool calling* ni razonamiento multi-paso. Solo produce máscaras, presencia y *grounding* de texto.
- Riesgo de alucinación de instancias: las cabezas de presencia y segmentación pueden activar *bridges* en regiones sin objeto real; el autor incluye opciones de enmascarado de presencia incompleta (`--mask_incomplete_presence`, `--mask_out_incomplete_presence`), lo que sugiere que este es un problema conocido.
- Dependencia de la rejilla N×N: con `--spatial_grid_assignment`, la configuración por defecto fija 225 *bridges* (15×15), lo que limita el número de instancias manejables simultáneamente y condiciona el diseño del entrenamiento.
- Idiomas no especificados: no hay información sobre cobertura multilingüe ni sobre el idioma del texto de categoría usado en el *grounding*.
- Sin métricas publicadas: no hay benchmarks, ni comparativas cuantitativas, ni datos de latencia, lo que hace imposible evaluar su rendimiento frente a alternativas sin reentrenar y evaluar por cuenta propia.
- Cero descargas y cero *likes*: no hay evidencia de validación por parte de la comunidad ni de casos de uso en producción documentados.
- Historial de Git no incluido en el repositorio, según la propia model card.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/royguw/ground-qwen3-5
- HuggingFace (checkpoints entrenados): https://huggingface.co/royguw/ground-ckpts
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, papers, blogs, repositorios o demos asociados. Los resultados devueltos por la búsqueda corresponden a páginas en japonés sobre gestión de impagos, sin relación con este modelo.
