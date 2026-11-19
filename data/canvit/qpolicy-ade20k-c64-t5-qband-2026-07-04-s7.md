# canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s7

## Resumen

`qpolicy-ade20k-c64-t5-qband-2026-07-04-s7` es una política de visión aprendida (viewing policy) desarrollada por el autor canvit dentro del ecosistema CanViT (Canvas Vision Transformer), un modelo fundacional de visión activa presentado en NeurIPS 2026. No se trata de un modelo generativo de lenguaje, sino de un componente de control que decide hacia dónde mirar a continuación sobre un lienzo (canvas) de representación de escena, dado un observador congelado y una sonda de segmentación.

El modelo puntúa candidatos de punto de vista (viewpoints) sobre el canvas de un CanViT-B congelado y deja que este observe a continuación el candidato de mayor puntuación. Se entrenó mediante Q-learning para elegir los puntos de vista cuyos glimpses reducen más la entropía cruzada de la sonda de segmentación ADE20K. Con 5.674.904 parámetros totales y un tamaño de repositorio de 0,1 GB, es un modelo ligero pensado como cabezal de política sobre un backbone mayor.

Su relevancia radica en que ejemplifica el paradigma de visión activa: en lugar de procesar la imagen completa de una vez, el sistema percibe la escena mediante una secuencia de vistazos y acumula información en un canvas, lo que abre la puerta a modelos de percepción con coste computacional adaptativo y control explícito de la atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de Q-learning sobre observador CanViT-B (Vision Transformer con canvas) congelado |
| Parametros totales | 5.674.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (escenas de 512 px, glimpses de 128 px, canvas de 64 x 64) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política opera sobre un observador congelado: el CanViT-B `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02` junto con su sonda ADE20K `canvit/probe-ade20k-40k-s512-c64-in21k`. El sistema procesa escenas de 512 px mediante glimpses de 128 px que se acumulan en un canvas de 64 x 64. En cada paso, la política puntúa candidatos definidos por 16 x 16 centros en cada una de las escalas 0,5 y 0,25, y el observador mira a continuación el candidato de mayor puntuación.

El entrenamiento se realizó mediante Q-learning sobre episodios de 5 glimpses con escenas de entrenamiento de ADE20K, con semilla 7. El objetivo es elegir los puntos de vista cuyos glimpses reducen más la entropía cruzada de la sonda de segmentación. Se seleccionó el paso 8.000, correspondiente a la menor entropía cruzada media de validación en ADE20K tras los glimpses elegidos por la política. La entropía cruzada de validación tras cada glimpse fue de 0,7649, 0,7149, 0,6888, 0,6756 y 0,6667 respectivamente, lo que muestra una reducción monótona del error a medida que la política acumula información. El registro completo del entrenamiento se conserva en el directorio `training_run/` tal como lo escribió el código original.

## Capacidades

- Selección activa de puntos de vista: puntúa candidatos de viewpoint sobre el canvas y decide el siguiente glimpse.
- Segmentación semántica indirecta: a través de la sonda ADE20K congelada, el canvas acumulado permite leer etiquetas de 64 x 64 clases ADE20K.
- Razonamiento multi-paso sobre percepción: planifica una secuencia de 5 glimpses para reducir la incertidumbre de segmentación.
- Integración con el ecosistema CanViT mediante la librería `canvit-pytorch` (versión >= 0.3).
- Rollout reproducible: la API `policy.rollout(scene, num_glimpses=5)` devuelve los pasos con centros y escalas de cada viewpoint.
- No dispone de generación de texto, tool calling, capacidades multilingües ni modos de pensamiento; es un componente de control visual.

## Casos de uso

- Segmentación semántica con presupuesto de cómputo limitado: la política permite procesar una escena con solo 5 glimpses de 128 px en lugar de la imagen completa, reduciendo el coste de percepción en entornos con recursos restringidos.
- Sistemas de visión activa en robótica: un agente puede usar la política para decidir qué regiones de la escena inspeccionar primero, priorizando las zonas que más reducen la incertidumbre de segmentación.
- Investigación en percepción adaptativa: sirve como banco de pruebas para estudiar cómo las políticas aprendidas de atención espacial afectan a la calidad de la representación en tareas densas como ADE20K.
- Prototipado de pipelines de segmentación eficiente: integrable con `canvit-pytorch` para sustituir el barrido completo de la imagen por una secuencia de vistazos guiada por Q-learning.
- Evaluación de estrategias de muestreo visual: permite comparar políticas aprendidas frente a estrategias fijas (barrido, aleatoria) midiendo la entropía cruzada de validación tras cada glimpse.
- Docencia y reproducción de experimentos de RL aplicado a visión: el registro completo en `training_run/` y la semilla fija (7) facilitan la replicación del entrenamiento y el análisis de la curva de aprendizaje.
- Análisis de atención en modelos transformer visuales: al exponer centros y escalas de cada viewpoint, permite auditar qué regiones prioriza el modelo en escenas de interiores y exteriores de ADE20K.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Entropía cruzada de validación tras glimpse 1 | 0,7649 |
| Entropía cruzada de validación tras glimpse 2 | 0,7149 |
| Entropía cruzada de validación tras glimpse 3 | 0,6888 |
| Entropía cruzada de validación tras glimpse 4 | 0,6756 |
| Entropía cruzada de validación tras glimpse 5 | 0,6667 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de visión activa y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja para la política en sí (5,67 M de parámetros, aproximadamente 23 MB en fp32 y 11 MB en fp16), pero el observador CanViT-B congelado y la sonda ADE20K dominan el consumo; el tamaño total del repositorio es de 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM puede ejecutar la política; para el observador CanViT-B conviene una GPU moderna (RTX 3090, RTX 4090, A100, H100) según el tamaño del backbone.
- Cabe en GPU de consumo: sí, la política es ligera; el cuello de botella es el observador y la sonda, no la política.
- Opciones de despliegue: la librería oficial `canvit-pytorch` (>= 0.3) mediante `LearnedPolicy.from_pretrained`; el ejemplo de la model card usa `torch.device("cpu")`, lo que indica que la política puede ejecutarse en CPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qpolicy-ade20k-c64-t5-qband-2026-07-04-s7 | 5,67 M | no disponible | Política de visión activa sobre ADE20K | MIT | Hugging Face (canvit) |
| CanViT-B (observador base) | no disponible | no disponible | Modelo fundacional de visión activa | MIT (con base DINOv3) | Hugging Face (canvit) |
| Sonda ADE20K de CanViT | no disponible | no disponible | Segmentación semántica ADE20K | MIT | Hugging Face (canvit) |

No se dispone de información sobre otras políticas de visión activa comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo es una política de control, no un modelo generativo: no produce texto, código ni respuestas en lenguaje natural.
- Depende del observador CanViT-B y de la sonda ADE20K con los que fue entrenado; no es un componente autónomo.
- Entrenado exclusivamente sobre escenas de ADE20K, por lo que su generalización a otros dominios visuales no está documentada.
- La licencia MIT aplica al checkpoint, pero CanViT se preentrenó por destilación de DINOv3, que se distribuye bajo la DINOv3 License; conviene revisar las implicaciones para uso comercial del pipeline completo.
- El rendimiento se mide en entropía cruzada de segmentación, no en métricas estándar de benchmarks de lenguaje; no hay datos de mIoU ni de otras métricas publicadas en la información disponible.
- Al ser un modelo de RL entrenado con una semilla concreta (7), puede presentar variabilidad entre ejecuciones y sensibilidad a los hiperparámetros del entrenamiento.
- No se han documentado sesgos específicos, pero al derivar de un backbone preentrenado en ImageNet-21k y destilado de DINOv3, puede heredar sesgos de esos corpus.
- Riesgo de alucinación en el sentido de selección de viewpoints poco informativos si la escena se aleja de la distribución de ADE20K.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s7
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Checkpoints CanViT: https://huggingface.co/canvit
- Modelo observador base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Dataset ADE20K: https://huggingface.co/datasets/zhoubolei/scene_parse_150
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Repositorio DINOv3: https://github.com/facebookresearch/dinov3
