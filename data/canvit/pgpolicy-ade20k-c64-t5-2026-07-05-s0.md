# canvit/pgpolicy-ade20k-c64-t5-2026-07-05-s0

## Resumen

`canvit/pgpolicy-ade20k-c64-t5-2026-07-05-s0` es una política de visión aprendida (learned viewing policy) para CanViT-B, un modelo fundacional de visión activa desarrollado por el grupo CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna), presentado en NeurIPS 2026. El modelo no es un generador de texto ni un LLM: es un módulo de decisión que, dado el estado de un lienzo (canvas) de escena y la segmentación que una sonda ADE20K lee de él, puntúa candidatos de punto de vista y selecciona el siguiente glimpse que debe observar el backbone congelado CanViT-B. Resuelve el problema de la selección activa de dónde mirar en una escena para maximizar la información útil para segmentación semántica, en lugar de procesar la imagen completa de forma uniforme.

Técnicamente es un modelo pequeño (5.543.447 parámetros, repo de 0,1 GB) entrenado con REINFORCE sobre escenas de 512 px con glimpses de 128 px y un canvas de 64 × 64, con 16 × 16 centros candidatos en dos escalas (0,5 y 0,25). El checkpoint seleccionado es el paso 5.000, elegido por mínima entropía cruzada media de validación en ADE20K tras los glimpses elegidos por la política (0,7649 → 0,6669 tras cinco pasos). Es relevante porque ejemplifica el paradigma de visión activa aplicado a un modelo fundacional con backbone ViT, y porque se publica con licencia MIT, código y registro completo de entrenamiento.

La ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face; cualquier especificación no documentada se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de selección de viewpoints sobre backbone Vision Transformer (CanViT-B, canvas vision transformer) congelado; módulo de decisión entrenado por REINFORCE |
| Parametros totales | 5.543.447 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje); escenas de 512 px, glimpses de 128 px, canvas de 64 × 64 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT (con la salvedad de que CanViT se destila de DINOv3, bajo DINOv3 License) |
| Formato de pesos | safetensors (formato original del código de entrenamiento en la revisión `original-format`) |

## Arquitectura y entrenamiento

La política opera sobre un observador congelado compuesto por CanViT-B (`canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`) y su sonda ADE20K (`canvit/probe-ade20k-40k-s512-c64-in21k`). CanViT es un modelo de visión activa: percibe una escena mediante una secuencia de glimpses y la memoriza en un canvas de ámbito de escena. La política puntúa candidatos de punto de vista a partir del canvas y de la segmentación que la sonda lee de él; CanViT mira a continuación el candidato con mayor puntuación. El espacio de candidatos son 16 × 16 centros en cada una de las escalas 0,5 y 0,25.

El entrenamiento usa REINFORCE con episodios de cinco glimpses sobre las escenas de entrenamiento de ADE20K, semilla 0, con el objetivo de elegir los puntos de vista cuyos glimpses reduzcan más la entropía cruzada de la sonda. El registro completo del entrenamiento se conserva en `training_run/` tal como lo escribió el código original. El paso seleccionado es el 5.000, el de menor entropía cruzada media de validación en ADE20K tras los glimpses elegidos por la política: 0,7649, 0,7157, 0,6886, 0,6764 y 0,6669 tras cada uno de los cinco pasos. No se documentan en la información disponible detalles sobre tamaño del dataset, número de tokens de entrenamiento ni uso de RLHF/DPO (no aplica en este dominio).

## Capacidades

- Selección activa de puntos de vista: puntúa candidatos de viewpoint y decide el siguiente glimpse a observar.
- Segmentación semántica indirecta: el canvas resultante se decodifica con la sonda ADE20K en 64 × 64 etiquetas de clase.
- Rollout multi-paso: `policy.rollout(scene, num_glimpses=5)` devuelve la secuencia completa de estados, centros y escalas elegidos.
- Integración con backbone congelado: no modifica los pesos de CanViT-B ni de la sonda.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo de visión activa con memoria en canvas; no dispone de thinking mode, visión pasiva estándar, audio ni generación de texto.

## Casos de uso

- Segmentación semántica eficiente en escenas grandes: en lugar de procesar la imagen completa a alta resolución, la política elige cinco glimpses de 128 px que reducen la entropía cruzada de la sonda; útil en pipelines con presupuesto de cómputo limitado por escena.
- Robótica con cámara de campo amplio: el agente decide hacia qué región reencuadrar o hacer zoom (escalas 0,5 y 0,25) para obtener la información de segmentación más informativa antes de actuar.
- Inspección visual de escenas interiores (ADE20K): selección adaptativa de regiones relevantes para detectar objetos y superficies con un número fijo de observaciones.
- Investigación en visión activa: banco de pruebas reproducible (semilla 0, registro `training_run/`) para comparar políticas de selección de viewpoints frente a barridos uniformes o aleatorios.
- Ahorro de ancho de banda en transmisión de vídeo o imágenes: el sistema puede solicitar únicamente los parches (glimpses) que la política considera informativos, reduciendo los píxeles transmitidos.
- Preentrenamiento y evaluación de modelos de visión activa: la política sirve como componente de referencia para estudiar el compromiso entre número de glimpses y calidad de segmentación (curva de entropía cruzada por paso).
- Docencia y divulgación: ejemplo compacto (5,5 M de parámetros) de entrenamiento con REINFORCE sobre un backbone ViT congelado, con código de inferencia mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de rendimiento es la entropía cruzada media de validación en ADE20K tras cada glimpse elegido por la política, en el paso 5.000:

| Glimpse | Entropía cruzada de validación (ADE20K) |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7157 |
| 3 | 0,6886 |
| 4 | 0,6764 |
| 5 | 0,6669 |

No se proporcionan comparaciones con políticas aleatorias, barridos uniformes ni con otros modelos de segmentación, por lo que no es posible establecer una comparativa de rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 5,5 M de parámetros la política en sí ocupa del orden de decenas de MB en fp32, pero el coste dominante es el backbone CanViT-B congelado y la sonda, cuyo consumo no se detalla en la información disponible.
- GPU recomendadas: no disponible. El ejemplo de la model card ejecuta la política en CPU (`torch.device("cpu")`), lo que sugiere que la inferencia de la política es viable sin GPU; el backbone puede requerir GPU según el caso.
- Cabe en GPU de consumo: no disponible con datos concretos; el tamaño del repo (0,1 GB) y los 5,5 M de parámetros de la política son compatibles con GPU de consumo, pero el backbone CanViT-B no está cuantificado en la información disponible.
- Opciones de despliegue: librería `canvit-pytorch>=0.3` (instalable con `uv add`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de política de visión activa comparables ni resultados de benchmarks que permitan una comparación cuantitativa. Como referencia interna del ecosistema, el propio autor publica otros checkpoints bajo `huggingface.co/canvit`, pero no se dispone de sus especificaciones en esta ficha.

## Limitaciones y advertencias

- Modelo de dominio específico: entrenado únicamente sobre escenas de ADE20K; su comportamiento fuera de esa distribución (otras resoluciones, dominios médicos, satelitales, etc.) no está documentado.
- Dependencia de componentes congelados: la política solo es válida junto con el CanViT-B y la sonda ADE20K concretos con los que fue entrenada; sustituir cualquiera de ellos invalida la política.
- Objetivo limitado a la entropía cruzada de la sonda: optimiza la reducción de cross-entropy de segmentación, no otras tareas downstream (detección, profundidad, etc.).
- Sin datos de sesgo: no se documentan sesgos conocidos, pero al entrenar sobre ADE20K hereda la distribución y los sesgos de ese dataset (escenas interiores y exteriores cotidianas).
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es seleccionar viewpoints poco informativos, mitigado parcialmente por el criterio de selección del paso 5.000.
- Limitaciones de idioma: no aplica (modelo de visión sin capacidades lingüísticas).
- Licencia: MIT para este checkpoint, pero CanViT se preentrena por destilación de DINOv3, liberado bajo la DINOv3 License; conviene revisar esa licencia antes de un uso comercial del backbone.
- Reproducibilidad: el checkpoint corresponde a la semilla 0 y al paso 5.000; no se documenta variabilidad entre semillas.
- Estado del repo: 47 descargas y 0 likes en el momento de la consulta; ecosistema joven y con poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canvit/pgpolicy-ade20k-c64-t5-2026-07-05-s0
- Modelo base (CanViT-B): https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Todos los checkpoints CanViT: https://huggingface.co/canvit
- Paper (NeurIPS 2026, arXiv): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- DINOv3 (backbone de destilación): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Dataset ADE20K (scene_parse_150): https://huggingface.co/datasets/zhoubolei/scene_parse_150
