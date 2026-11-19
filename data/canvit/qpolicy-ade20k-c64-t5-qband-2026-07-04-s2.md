# canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s2

## Resumen

`qpolicy-ade20k-c64-t5-qband-2026-07-04-s2` es una política de visión aprendida (learned viewing policy) desarrollada por el autor canvit para el modelo base CanViT-B, un vision transformer de visión activa. No es un modelo generativo de lenguaje ni un modelo multimodal al uso: es un componente de decisión que, dado un lienzo (canvas) de escena construido por CanViT-B, puntúa candidatos de puntos de vista y selecciona el siguiente glimpse que debe capturar el modelo base. El problema que resuelve es el de la selección eficiente de regiones de interés en un paradigma de visión activa, donde el modelo no ve la imagen completa de una vez sino a través de una secuencia de observaciones parciales.

El modelo se entrena mediante Q-learning sobre el dataset ADE20K (escenas de interiores y exteriores con anotaciones de segmentación semántica de 150 clases) y se evalúa por su capacidad de reducir la entropía cruzada del probe de segmentación de CanViT-B tras cada glimpse. Con 5.674.904 parámetros totales y un tamaño de repositorio de 0,1 GB, es un componente ligero que se acopla a un observador congelado de mayor tamaño. Su relevancia actual radica en que ejemplifica una línea de investigación emergente: modelos de visión que deciden activamente qué mirar, en lugar de procesar pasivamente la totalidad de la imagen, lo que tiene implicaciones directas en eficiencia computacional y en aplicaciones con recursos limitados o con necesidad de exploración dirigida.

La ficha se basa exclusivamente en la model card y en los metadatos del repositorio de Hugging Face. No se dispone de información sobre benchmarks comparativos con otros modelos de visión activa, ni sobre el rendimiento absoluto de la política frente a baselines aleatorios o heurísticos más allá de las cifras de entropía cruzada reportadas para la validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de Q-learning sobre el canvas de un vision transformer (CanViT-B); no es un transformer generativo |
| Parametros totales | 5.674.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; opera sobre escenas de 512 px con canvas de 64 × 64 y episodios de 5 glimpses |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `canvit-pytorch`) |

## Arquitectura y entrenamiento

La política es un módulo de decisión entrenado por Q-learning que opera sobre el estado del canvas de CanViT-B. El observador (CanViT-B, modelo base `canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`) y su probe de segmentación ADE20K (`canvit/probe-ade20k-40k-s512-c64-in21k`) permanecen congelados durante el entrenamiento de la política. La configuración de visión activa es la siguiente: escenas de 512 px, glimpses de 128 px, canvas de 64 × 64, y un conjunto de candidatos de 16 × 16 centros en cada una de dos escalas (0,5 y 0,25). El objetivo de Q-learning es seleccionar los puntos de vista cuyos glimpses reduzcan en mayor medida la entropía cruzada del probe de segmentación.

El entrenamiento se realizó con episodios de 5 glimpses sobre las escenas de entrenamiento de ADE20K, con semilla 2. El checkpoint seleccionado es el paso 6.000, elegido por presentar la menor entropía cruzada media de validación en ADE20K tras los glimpses elegidos por la política. Las entropías cruzadas de validación tras cada glimpse son 0,7649, 0,7120, 0,6869, 0,6742 y 0,6649, lo que muestra una reducción monotónica a medida que la política acumula observaciones. El registro completo del entrenamiento se conserva en el directorio `training_run/` del repositorio, en el formato original del código de entrenamiento. CanViT se preentrena por destilación desde DINOv3, lo que condiciona las características visuales sobre las que opera la política.

## Capacidades

- Selección activa de puntos de vista: puntúa candidatos de centro y escala sobre el canvas y elige el de mayor puntuación para el siguiente glimpse.
- Planificación de secuencias de observación: ejecuta rollouts de hasta 5 glimpses (configurables mediante `num_glimpses`) sobre una escena de 512 px.
- Segmentación semántica indirecta: tras el rollout, el probe ADE20K produce logits de 64 × 64 con las 150 clases de ADE20K a partir del canvas final.
- Integración con el ecosistema CanViT: se carga mediante `LearnedPolicy.from_pretrained` de la librería `canvit-pytorch` (versión >= 0.3) y requiere el modelo CanViT-B y el probe con los que fue entrenado.
- Ejecución en CPU: el ejemplo de la model card emplea `torch.device("cpu")`, lo que sugiere que la política es lo suficientemente ligera para inferencia sin GPU.
- No soporta tool calling, function calling, generación de texto, razonamiento lingüístico, matemáticas ni capacidades multilingües; es un componente puramente visual y de decisión.

## Casos de uso

- Segmentación semántica eficiente en entornos con ancho de banda limitado: la política permite que CanViT-B observe solo 5 regiones de 128 px en lugar de procesar la escena completa de 512 px, lo que reduce el coste de adquisición de imagen en cámaras remotas o sensores con tasas de refresco bajas.
- Exploración dirigida en robótica móvil: un robot equipado con una cámara de campo reducido puede usar la política para decidir hacia dónde orientar la cámara en cada paso, maximizando la información de segmentación obtenida sobre la escena.
- Prototipado de investigación en visión activa: sirve como baseline reproducible (semilla 2, paso 6.000) para comparar nuevas políticas de selección de puntos de vista sobre ADE20K con el mismo observador congelado.
- Análisis de escenas de interior con presupuesto de cómputo fijo: en aplicaciones de domótica o inspección de interiores, la política prioriza las regiones que más reducen la incertidumbre del probe de segmentación, lo que permite obtener un mapa semántico utilizable con un número fijo de observaciones.
- Evaluación de mecanismos de atención visual en modelos de visión activa: al estar desacoplada del observador, la política permite estudiar el efecto de distintas estrategias de Q-learning sobre la calidad de la segmentación final sin reentrenar CanViT-B.
- Docencia y demostraciones de aprendizaje por refuerzo aplicado a visión: el código de ejemplo de la model card (rollout de 5 glimpses con impresión de centros y escalas) constituye una demostración mínima y ejecutable en CPU del bucle percepción-decisión en visión activa.

## Benchmarks y rendimiento

La model card reporta únicamente la entropía cruzada media de validación en ADE20K tras cada glimpse, para el checkpoint seleccionado (paso 6.000):

| Glimpse | Entropia cruzada de validacion |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7120 |
| 3 | 0,6869 |
| 4 | 0,6742 |
| 5 | 0,6649 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con políticas aleatorias o heurísticas. No se inventan cifras adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 5,67 M de parámetros y pesos en safetensors de 0,1 GB, la política en sí ocupa muy poco, pero requiere cargar el CanViT-B congelado y el probe ADE20K, cuyo coste no se detalla en la información proporcionada.
- GPU recomendadas: no disponible; la model card demuestra ejecución en CPU (`torch.device("cpu")`), lo que sugiere que la política es apta para entornos sin GPU, si bien el observador CanViT-B puede requerir GPU para latencias prácticas.
- ¿Cabe en GPU consumer? La política sí; el observador CanViT-B no se especifica en la información disponible.
- Opciones de despliegue: `canvit-pytorch` (>= 0.3) mediante `uv add`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de políticas de visión activa comparables, ni resultados de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La política está entrenada específicamente para el observador CanViT-B y el probe ADE20K con los que se entrenó; no es transferible a otros observadores o tareas sin reentrenamiento.
- El dominio de aplicación está restringido a escenas de ADE20K (interiores y exteriores con 150 clases); el rendimiento fuera de esa distribución no está documentado.
- El número de glimpses está limitado a 5 en el entrenamiento; no se especifica el comportamiento con rollouts más largos.
- No dispone de capacidades lingüísticas, de generación de texto ni de tool calling; no debe presentarse como un modelo de propósito general.
- La licencia es MIT, pero CanViT se preentrena por destilación desde DINOv3, que se distribuye bajo la DINOv3 License; el uso comercial debe verificar el cumplimiento de ambas licencias.
- Riesgo de sesgos heredados de ADE20K y de DINOv3 en la selección de regiones de interés; no se documentan análisis de sesgo en la información disponible.
- No se han publicado evaluaciones de robustez ante escenas corruptas, cambios de iluminación o dominios distintos de ADE20K.
- La model card advierte de que los ficheros en formato original permanecen en la revisión `original-format`, mientras que `canvit-pytorch` lee los de `main`; mezclar revisiones puede provocar incompatibilidades.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s2
- Modelo base (CanViT-B): https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Probe ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- DINOv3 (modelo del que se destila CanViT): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Dataset ADE20K: https://huggingface.co/datasets/zhoubolei/scene_parse_150
