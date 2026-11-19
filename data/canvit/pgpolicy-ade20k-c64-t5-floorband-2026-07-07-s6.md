# canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s6

## Resumen

pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s6 es una política de visión aprendida (learned viewing policy) desarrollada por el autor canvit para el modelo fundacional de visión activa CanViT (Canvas Vision Transformer). No es un modelo de lenguaje ni un transformer generativo al uso: es un módulo de decisión que, dado el estado de un lienzo (canvas) de escena construido por CanViT-B, puntúa candidatos de punto de vista y selecciona el siguiente vistazo (glimpse) que el observador congelado debe procesar. El problema que resuelve es el de la selección activa de información: en lugar de procesar la imagen completa a resolución fija, el sistema elige secuencialmente qué regiones mirar para maximizar la reducción del error de segmentación semántica en ADE20K.

El modelo se entrenó mediante REINFORCE sobre escenas de entrenamiento de ADE20K, con episodios de cinco vistazos, y se seleccionó el paso 6.000 por tener la menor entropía cruzada media de validación tras los vistazos elegidos por la política. Es relevante ahora porque forma parte del primer conjunto de modelos fundacionales de visión activa presentados en NeurIPS 2026, una línea de investigación que propone sustituir el paradigma de "imagen completa de una vez" por un proceso de percepción secuencial y dirigido por la tarea.

Con solo 5.543.447 parámetros y un repositorio de 0,1 GB, es un componente ligero que se usa junto al observador CanViT-B congelado y su sonda (probe) de segmentación ADE20K. Su licencia MIT facilita la experimentación, aunque hereda las restricciones del modelo DINOv3 del que se destiló CanViT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de puntuación de candidatos sobre el canvas de CanViT-B (Vision Transformer con vistazos activos); no es un transformer generativo |
| Parametros totales | 5.543.447 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre canvas de 64 × 64 y episodios de 5 vistazos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería canvit-pytorch); existe una revisión `original-format` con los ficheros del código de entrenamiento original |

## Arquitectura y entrenamiento

La política opera sobre el estado del canvas de CanViT-B, un modelo de visión activa que construye una representación de escena a partir de una secuencia de vistazos de 128 px sobre escenas de 512 px, manteniendo un canvas de 64 × 64. En cada paso, la política puntúa un conjunto de candidatos definidos por 16 × 16 centros en cada una de dos escalas (0,5 y 0,25), y el observador procesa el candidato con mayor puntuación. El observador y la sonda ADE20K (canvit/probe-ade20k-40k-s512-c64-in21k) permanecen congelados durante todo el entrenamiento de la política.

El entrenamiento se realizó con REINFORCE sobre escenas de entrenamiento de ADE20K, con episodios de cinco vistazos y semilla 6. La recompensa es la reducción de la entropía cruzada de la sonda de segmentación, de modo que la política aprende a elegir los vistazos que más mejoran la segmentación semántica. El registro completo del entrenamiento se conserva en el directorio `training_run/` tal como lo escribió el código original. La entropía cruzada de validación tras cada vistazo fue de 0,7649, 0,7155, 0,6893, 0,6770 y 0,6679, lo que muestra una mejora monótona decreciente a lo largo de los cinco pasos.

## Capacidades

- Selección activa de puntos de vista: puntúa candidatos de centro y escala y elige el siguiente vistazo a procesar por CanViT-B.
- Rollout completo de episodios: la API `policy.rollout(scene, num_glimpses=5)` devuelve la secuencia de pasos con centros y escalas elegidos.
- Segmentación semántica indirecta: tras el rollout, `policy.model.logits(...)` produce un mapa de 64 × 64 con clases ADE20K.
- Integración con el observador congelado CanViT-B y su sonda ADE20K; no funciona de forma autónoma sin ellos.
- No soporta tool calling, function calling, agentes de texto, razonamiento simbólico ni capacidades multilingües.
- No dispone de modo thinking, visión general de imágenes arbitrarias fuera del pipeline CanViT, audio ni otras modalidades.

## Casos de uso

- Segmentación semántica eficiente en escenas de alta resolución: la política elige qué regiones muestrear, reduciendo el número de vistazos necesarios para alcanzar una entropía cruzada objetivo en lugar de procesar la imagen completa.
- Investigación en visión activa: sirve como referencia reproducible (semilla 6, paso 6.000) para comparar estrategias de selección de vistazos en el benchmark ADE20K.
- Sistemas con presupuesto de cómputo limitado: al operar con vistazos de 128 px sobre un canvas de 64 × 64, permite percepción dirigida en dispositivos con recursos restringidos.
- Robótica y agentes embodied: la selección secuencial de regiones es análoga a la foveación biológica y puede integrarse en bucles de percepción-acción donde la cámara solo captura parches.
- Evaluación de sondas de segmentación: permite medir cuánto mejora una sonda congelada cuando se le presentan vistazos elegidos por política frente a vistazos aleatorios o de barrido uniforme.
- Docencia y reproducción de RL aplicado a visión: el registro completo de entrenamiento en `training_run/` facilita reproducir el experimento con REINFORCE y analizar la curva de recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo de rendimiento es la entropía cruzada de validación de ADE20K tras cada vistazo elegido por la política:

| Vistazos | Entropia cruzada de validacion (ADE20K) |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7155 |
| 3 | 0,6893 |
| 4 | 0,6770 |
| 5 | 0,6679 |

No se proporcionan comparaciones con políticas aleatorias, barridos uniformes ni otros checkpoints de la familia canvit.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 5,5 M de parámetros la política en sí ocupa del orden de decenas de MB, pero requiere cargar el observador CanViT-B y la sonda ADE20K congelados, cuyo coste no se detalla en la información disponible.
- GPU recomendadas: no disponible; el ejemplo de la model card usa `torch.device("cpu")`, lo que sugiere que la política puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no disponible para el conjunto observador + sonda; la política sola es trivial en cualquier GPU.
- Opciones de despliegue: librería `canvit-pytorch>=0.3` (instalable con `uv add`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de política de la familia canvit con los que comparar parámetros, contexto o rendimiento, ni modelos de visión activa alternativos. El modelo base (CanViT-B preentrenado) y la sonda ADE20K son componentes distintos, no alternativas equivalentes a esta política.

## Limitaciones y advertencias

- Dependencia estricta del observador y la sonda con los que fue entrenada: la model card indica que debe usarse "with the CanViT and probe it was trained with"; no es un modelo autónomo.
- Ámbito limitado a ADE20K y a escenas de 512 px con vistazos de 128 px y canvas de 64 × 64; no se documenta generalización a otros dominios, resoluciones o tareas.
- Entrenada con una única semilla (6) y un único paso seleccionado (6.000); no hay datos sobre varianza entre semillas ni robustez.
- Riesgo de sobreajuste a la distribución de ADE20K y a la sonda concreta; los sesgos del dataset (clases sobrerrepresentadas, anotaciones imperfectas) pueden propagarse a la política.
- Licencia MIT para este checkpoint, pero CanViT se preentrenó por destilación de DINOv3, sujeto a la DINOv3 License; conviene revisar las condiciones de uso comercial del pipeline completo.
- Sin capacidades lingüísticas ni multilingües; los campos de idioma figuran como no disponibles y no aplican.
- No hay datos publicados de latencia, throughput ni consumo de memoria del sistema completo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s6
- Modelo observador: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- DINOv3 (modelo del que se destila CanViT): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Dataset ADE20K (scene_parse_150): https://huggingface.co/datasets/zhoubolei/scene_parse_150
