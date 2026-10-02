# canvit/probe-ade20k-40k-s512-c64-in21k-nnx

## Resumen

El modelo `canvit/probe-ade20k-40k-s512-c64-in21k-nnx` es un checkpoint de tipo `SegmentationProbe` entrenado como sonda lineal sobre las representaciones internas de CanViT (Canvas Vision Transformer), un modelo fundacional de visión activa desarrollado por el grupo CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna). No es un modelo generativo ni un transformer completo: es una cabeza de segmentación semántica de 150 clases que se aplica sobre la rejilla de parches del *canvas* de CanViT para producir un mapa de logits de 64 × 64 × 150.

CanViT aborda un problema distinto al de los transformers de visión convencionales: en lugar de procesar la imagen completa de una vez, observa la escena mediante una secuencia de *glimpses* (muestras parciales) y acumula la información en un lienzo o *canvas* de representaciones. Este checkpoint concreto permite evaluar la calidad de esas representaciones mediante una sonda lineal entrenada sobre ADE20K, el estándar de segmentación semántica de escenas. Por tanto, su relevancia es sobre todo investigadora: sirve para medir cuánta información semántica espacial conserva el canvas de CanViT sin reentrenar el backbone.

El repositorio es muy ligero (159.894 parámetros en el probe, tamaño de repo de 0,0 GB), se distribuye bajo licencia MIT y requiere el backend JAX / Flax NNX del paquete `canvit-nnx`, además del checkpoint del backbone `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02-nnx`. No registra descargas ni *likes* en el momento de la consulta y no publica resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sonda lineal de segmentación semántica (`SegmentationProbe`) sobre las características del canvas de un vision transformer de visión activa (CanViT); incluye LayerNorm y dropout 0,1 |
| Parámetros totales | 159.894 (≈ 0,16 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de visión. Geometría documentada: escenas de 512 px, glimpses de 128 px y canvas de 64 × 64 parches |
| Tipos de cuantización | No disponible (no se documentan cuantizaciones para este checkpoint) |
| Idiomas soportados | No disponible (modelo de visión, sin capacidades de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors, con backend JAX / Flax NNX (librería `canvit-nnx`); identificador de formato del checkpoint: `d63be48b-fd67-4299-b1c7-c7b3a2b3a238` |

Configuración del probe (según la model card): `{"dropout": 0.1, "embed_dim": 1024, "num_classes": 150, "use_ln": true}`.

## Arquitectura y entrenamiento

El checkpoint es una sonda de segmentación, no un modelo completo. Consiste en una cabeza que toma las características del canvas de CanViT (`canvas_patch_grid`, con dimensión de embedding 1024) y las proyecta a 150 clases de ADE20K, con normalización por capa y dropout de 0,1. La salida tiene forma `[1, 64, 64, 150]`, es decir, una predicción densa por cada celda de la rejilla de 64 × 64 del canvas. El checkpoint del backbone y el del probe se mantienen como artefactos separados, de modo que el probe se puede sustituir o reentrenar sin tocar el modelo base.

CanViT, descrito en el artículo «CanViT: Toward Active-Vision Foundation Models» (arXiv 2603.22570, NeurIPS 2026), es un modelo fundacional de visión activa: percibe la escena a través de una secuencia de *glimpses* y mantiene la información en un canvas de ámbito completo. La nomenclatura del checkpoint asociado (`canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16`) indica un backbone tipo ViT-B/16 con *viewpoint embeddings* aditivos, preentrenado con glimpses de 128 px sobre escenas de 512 px en ImageNet-21k. No se detalla en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon etapas de RLHF o DPO (poco habituales en segmentación semántica). Tampoco se especifican innovaciones adicionales como atención lineal o decodificación especulativa.

## Capacidades

- Segmentación semántica densa sobre 150 clases de ADE20K, a resolución de celda del canvas (64 × 64 celdas para una escena de 512 px).
- Extracción de características espaciales a partir de un canvas construido mediante visión activa, es decir, con observaciones parciales de la escena en lugar de la imagen completa.
- Evaluación de representaciones (*linear probing*): permite cuantificar la información semántica que el backbone CanViT conserva en su canvas.
- Compatible con geometrías parametrizables de escena, tamaño de *glimpse* y rejilla de canvas definidas por el backbone.
- Inferencia en JAX / Flax NNX, con API de carga (`from_pretrained`), modo evaluación (`eval()`) e inicialización de estado (`init_state`).
- No soporta *tool calling*, *function calling*, razonamiento multi-paso, agentes ni generación de texto: es un modelo puramente visual y discriminativo.
- Capacidades multilingües: no aplica (no procesa lenguaje).
- Capacidades especiales: visión activa con muestreo en *viewpoints* arbitrarios mediante `sample_at_viewpoint`; no dispone de modo *thinking*, audio ni vídeo documentado.

## Casos de uso

- Segmentación semántica de escenas interiores y exteriores: dado un *glimpse* de la escena y un *viewpoint* concreto, el probe devuelve un mapa denso de 150 clases que permite etiquetar objetos, superficies y regiones con una sola pasada sobre el canvas.
- Investigación en representaciones auto-supervisadas: usar el probe como *baseline* de sondeo lineal para comparar la calidad del canvas de CanViT frente a otras representaciones visuales en ADE20K.
- Robótica con percepción foveada: en un robot con cámara orientable, el modelo permite construir el canvas a partir de observaciones sucesivas y segmentar la escena sin necesidad de una imagen panorámica completa.
- Preetiquetado de datasets de segmentación: el probe puede generar máscaras preliminares sobre las 150 clases de ADE20K para que anotadores humanos las revisen, reduciendo el coste de anotación.
- Evaluación de estrategias de muestreo activo: al permitir elegir *viewpoints*, sirve para medir qué secuencia de *glimpses* maximiza la calidad de segmentación, útil en investigación sobre políticas de atención visual.
- Análisis de eficiencia de cómputo en percepción: al operar sobre glimpses de 128 px en lugar de la escena completa, permite estudiar compromisos entre número de observaciones y calidad de la segmentación resultante.
- Integración en pipelines de investigación reproducibles: al ser un checkpoint NNX de 0,16 M de parámetros, se puede versionar y sustituir con facilidad dentro de experimentos en JAX sin reentrenar el backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de mIoU, precisión por clase ni comparaciones numéricas con otras sondas o modelos de segmentación, y los resultados de la búsqueda web no aportan cifras al respecto.

## Requisitos de hardware

- VRAM del probe: despreciable; con 159.894 parámetros en precisión de 32 bits ocupa aproximadamente 0,6 MB, por lo que el coste de memoria lo determina íntegramente el backbone CanViT-B/16 y las activaciones del canvas de 64 × 64 × 1024.
- GPU recomendadas: no disponibles de forma explícita para el backbone. Al ejecutarse sobre JAX, cualquier GPU compatible con CUDA y JAX (por ejemplo, A100 o H100 en entornos de investigación) es apta; el probe en sí no impone requisitos.
- GPU de consumo: cabe en cualquier GPU de consumo moderna, incluida una RTX 4090, siempre que el backbone y las activaciones del canvas quepan en memoria; el probe no supone un cuello de botella.
- Opciones de despliegue: la librería oficial es `canvit-nnx` sobre JAX / Flax NNX, instalable desde el repositorio fuente con `uv sync --project canvit-nnx`. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la implementación del backbone y del hardware empleado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados numéricos ni especificaciones de sondas comparables (por ejemplo, sondas lineales sobre otros backbones visuales en ADE20K), por lo que no es posible establecer una comparación cuantitativa fiable.

| Modelo | Parámetros | Contexto / geometría | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `canvit/probe-ade20k-40k-s512-c64-in21k-nnx` | 159.894 | Escenas 512 px, canvas 64 × 64 | No disponible | MIT | HuggingFace (repo NNX) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre ADE20K (150 clases de escenas), hereda la distribución y los desequilibrios de ese dataset, con cobertura limitada de conceptos fuera de su taxonomía.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de predicciones erróneas o sobreconfiadas en clases poco representadas o en escenas fuera de dominio.
- Limitaciones de contexto e idioma: no procesa texto ni lenguaje; es un modelo exclusivamente visual. La resolución efectiva de la predicción está limitada por la rejilla de 64 × 64 celdas del canvas, lo que produce mapas de baja resolución espacial que requieren post-procesado para obtener máscaras a resolución completa.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; conviene conservar el aviso de copyright y la referencia al artículo original. El uso conjunto con el backbone CanViT puede estar sujeto a las condiciones de ese otro checkpoint.
- Dependencia del backbone: el probe no es autónomo; requiere el checkpoint `canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02-nnx` y el paquete `canvit-nnx`, lo que limita su uso fuera del ecosistema JAX / Flax NNX.
- Caveats para producción: el repositorio no registra descargas ni validación externa, no publica métricas de calidad y su licencia MIT no implica soporte ni mantenimiento; para un despliegue en producción convendría validar el mIoU sobre el dominio objetivo antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k-nnx
- Sonda de origen (PyTorch): https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k/tree/b28ba9b866d3763cbea60035ef8b7b02eba5b01d
- Checkpoint del backbone CanViT (NNX): https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02-nnx
- Organización CanViT en HuggingFace: https://huggingface.co/canvit
- Artículo: https://arxiv.org/abs/2603.22570
- Repositorio de código CanViT (JAX / Flax NNX): https://github.com/m2b3/CanViT
- Repositorio CanViT (PyTorch): https://github.com/m2b3/CanViT-PyTorch
- Página del proyecto: https://m2b3.github.io/CanViT/
