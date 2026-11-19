# canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s4

## Resumen

`canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s4` es una política de visión aprendida (learned viewing policy) para CanViT-B, un modelo fundacional de visión activa desarrollado por el grupo CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna) y presentado en NeurIPS 2026. No es un modelo de lenguaje ni un modelo generativo: es un módulo de decisión que, dado el estado de un lienzo (canvas) de escena y la segmentación que una sonda ADE20K lee de él, puntúa candidatos de viewpoint y selecciona el siguiente glimpse que maximiza la reducción de entropía cruzada de la sonda. Resuelve, por tanto, el problema de dónde mirar a continuación en un pipeline de visión activa con presupuesto limitado de observaciones.

El modelo se entrena mediante Q-learning sobre episodios de 5 glimpses con escenas de ADE20K, con semilla 4, y se selecciona el checkpoint de 4.000 pasos por menor entropía cruzada media de validación. Con 5.674.904 parámetros y un repo de 0,1 GB, es un componente ligero que se acopla a un observador congelado (CanViT-B preentrenado y su sonda ADE20K) y no requiere reentrenar el backbone. La relevancia actual radica en que demuestra que una política de RL de muy bajo coste puede mejorar la eficiencia de muestreo de un modelo de visión activa sin modificar sus pesos.

La ficha describe un artefacto de investigación especializado: su utilidad práctica está acotada al ecosistema `canvit-pytorch` y a tareas de segmentación semántica sobre ADE20K con observación secuencial. La información pública disponible es la model card del autor y los metadatos de Hugging Face; no hay benchmarks estándar de LLM ni datos de rendimiento en tareas de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de Q-learning sobre el estado de un canvas de CanViT (Vision Transformer de visión activa); no es un transformer generativo |
| Parametros totales | 5.674.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; escenas de 512 px, glimpses de 128 px, canvas de 64 × 64 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT (CanViT se destila de DINOv3, sujeto a la DINOv3 License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política opera sobre el observador CanViT-B congelado (`canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`) y su sonda ADE20K (`probe-ade20k-40k-s512-c64-in21k`), también congelada. CanViT es un Canvas Vision Transformer: procesa una escena mediante una secuencia de glimpses y acumula la información en un canvas de 64 × 64 que actúa como memoria espacial. La política puntúa candidatos definidos por 16 × 16 centros en cada una de dos escalas (0,5 y 0,25) y el observador mira a continuación el candidato de mayor puntuación.

El entrenamiento es Q-learning sobre episodios de 5 glimpses con escenas de entrenamiento de ADE20K, semilla 4. El objetivo es elegir los viewpoints cuyos glimpses reduzcan más la entropía cruzada de la sonda de segmentación. Se seleccionó el paso 4.000 por menor entropía cruzada media de validación tras los glimpses elegidos por la política: 0,7649, 0,7130, 0,6871, 0,6742 y 0,6648 tras cada glimpse sucesivo. El registro completo del entrenamiento se conserva en `training_run/` en el formato original del código. No se especifican en la información disponible el número de tokens, la composición detallada del dataset ni si hubo RLHF/DPO (no aplica en este dominio).

## Capacidades

- Selección secuencial de viewpoints sobre escenas de 512 px con un canvas de 64 × 64 y glimpses de 128 px.
- Puntuación de candidatos en dos escalas (0,5 y 0,25) con rejillas de 16 × 16 centros.
- Rollout de políticas con `policy.rollout(scene, num_glimpses=5)` en `canvit-pytorch`.
- Lectura de logits de segmentación ADE20K (64 × 64 clases) desde el canvas final mediante `policy.model.logits(...)`.
- Integración con un observador y una sonda congelados, sin reentrenamiento del backbone.
- No soporta tool calling, function calling, agentes multi-step genéricos, ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Segmentación semántica eficiente con presupuesto de observación limitado: usar la política para elegir 5 glimpses en lugar de procesar la escena completa, reduciendo el coste de cómputo en el observador CanViT-B con una pérdida controlada de entropía cruzada (0,6648 tras 5 glimpses en validación).
- Investigación en visión activa: comparar políticas aprendidas por Q-learning con políticas heurísticas o aleatorias sobre el mismo observador congelado, usando el checkpoint como línea base reproducible (semilla 4, paso 4.000).
- Prototipado de pipelines de percepción para robótica y agentes embebidos: el tamaño de 5,67 M parámetros y el repo de 0,1 GB permiten ejecutar la política en CPU (`torch.device("cpu")` en el ejemplo de la model card), lo que facilita su integración en sistemas con recursos limitados.
- Evaluación de estrategias de muestreo en datasets de segmentación: emplear la política para analizar qué regiones de la escena aportan más información a la sonda ADE20K y derivar conclusiones sobre el diseño de sensores o de rejillas de muestreo.
- Reproducibilidad de experimentos de RL aplicado a visión: el registro `training_run/` y la revisión `original-format` permiten replicar el entrenamiento y auditar la curva de entropía cruzada por glimpse.
- Docencia y divulgación: ejemplo compacto de cómo una política de RL de bajo coste puede acoplarse a un modelo fundacional congelado sin modificar sus pesos, útil para cursos de aprendizaje por refuerzo y visión por computador.
- Análisis de atención selectiva en modelos de visión: estudiar la relación entre los viewpoints elegidos y las regiones semánticamente relevantes de ADE20K para interpretar el comportamiento del observador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no aplican a este modelo. El único dato de rendimiento reportado es la entropía cruzada media de validación de ADE20K tras cada glimpse elegido por la política:

| Glimpse | Entropia cruzada media de validacion |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7130 |
| 3 | 0,6871 |
| 4 | 0,6742 |
| 5 | 0,6648 |

No se proporcionan métricas como mIoU, accuracy por clase ni comparación con políticas alternativas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 5,67 M parámetros, los pesos en fp32 ocupan aproximadamente 23 MB, y el coste dominante es el del observador CanViT-B congelado y la sonda, no la política.
- GPU recomendadas: cualquier GPU con suficiente memoria para el observador CanViT-B; la política en sí puede ejecutarse en CPU, como muestra el ejemplo de la model card (`torch.device("cpu")`).
- Cabe en GPU de consumo: sí, la política es trivial en memoria; el requisito real lo impone el backbone CanViT-B y la sonda.
- Opciones de despliegue: librería `canvit-pytorch>=0.3` (instalable con `uv add`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de política de visión activa comparables ni datos de rendimiento de alternativas. El propio repositorio `canvit` en Hugging Face aloja otros checkpoints (por ejemplo, variantes de semilla o de configuración), pero no se dispone de sus métricas en la información facilitada.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de lenguaje ni un modelo generativo; no debe evaluarse con benchmarks de LLM ni usarse para tareas de texto.
- Dependencia del observador y la sonda congelados: la política está entrenada para el CanViT-B y la sonda ADE20K concretos; su comportamiento fuera de esa pareja no está garantizado.
- Dominio restringido: entrenada sobre escenas de ADE20K con escenas de 512 px, glimpses de 128 px y canvas de 64 × 64; no se documenta generalización a otras resoluciones o datasets.
- Riesgo de sobreajuste a la semilla y al checkpoint: se seleccionó un único paso (4.000) de una única semilla (4); no se reportan intervalos de confianza ni variabilidad entre semillas.
- Sesgos: no se documentan sesgos específicos, pero al derivar de DINOv3 y de ADE20K hereda los sesgos de composición y anotación de ese dataset.
- Alucinación: no aplica en el sentido generativo, pero la sonda puede producir segmentaciones erróneas en clases poco representadas; la política optimiza entropía cruzada, no exactitud directa.
- Licencia: MIT para este checkpoint, pero CanViT se destila de DINOv3, liberado bajo la DINOv3 License; conviene revisar esa licencia para uso comercial del backbone.
- Idiomas: no aplica; el modelo no procesa lenguaje.
- Producción: la información disponible no documenta latencias, robustez ante distribuciones fuera de dominio ni pruebas de estrés; el uso en producción requeriría validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s4
- Paper (NeurIPS 2026, arXiv): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Checkpoints CanViT: https://huggingface.co/canvit
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Dataset ADE20K: https://huggingface.co/datasets/zhoubolei/scene_parse_150
- DINOv3 (origen del preentrenamiento): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
