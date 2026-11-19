# canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s3

## Resumen

pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s3 es una política de visión aprendida (learned viewing policy) desarrollada por el equipo de CanViT, un proyecto de investigación sobre modelos fundacionales de visión activa presentado en NeurIPS 2026. No es un modelo de lenguaje ni un modelo generativo al uso: es un módulo de decisión que, dado el estado de un canvas de escena mantenido por el modelo congelado CanViT-B, puntúa candidatos de viewpoints y selecciona el siguiente que debe observar el modelo base. Resuelve el problema de dónde mirar a continuación en un paradigma de visión activa con glimpses secuenciales, en lugar de procesar la imagen completa de una sola pasada.

El modelo se entrena mediante REINFORCE sobre escenas de ADE20K, con el objetivo de elegir los viewpoints cuyos glimpses reduzcan más la entropía cruzada de una sonda de segmentación semántica congelada. Con 5.543.447 parámetros y un peso de repositorio de 0,1 GB, es un componente ligero que se acopla a un backbone ViT mucho mayor (CanViT-B, destilado de DINOv3) y a una probe de segmentación ADE20K. Es relevante ahora porque ejemplifica una línea emergente de modelos fundacionales que no procesan píxeles de forma densa, sino que aprenden políticas de muestreo activo, con implicaciones directas en eficiencia computacional y en robótica o percepción embebida.

Esta ficha corresponde a la semilla 3 de una familia de políticas; el checkpoint seleccionado es el paso 7.000, elegido por menor entropía cruzada media de validación en ADE20K tras los glimpses elegidos por la política.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de visión aprendida sobre canvas de CanViT-B (Vision Transformer con canvas de escena y glimpses); puntuación de candidatos y selección de viewpoint |
| Parametros totales | 5.543.447 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de escena de 512 px con canvas de 64 × 64 y episodios de 5 glimpses) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería canvit-pytorch; revisión `original-format` con el formato del código de entrenamiento) |

## Arquitectura y entrenamiento

La política opera sobre el estado de un modelo CanViT-B congelado, un Canvas Vision Transformer que observa una escena mediante una secuencia de glimpses y acumula la información en un canvas de 64 × 64. En cada paso, la política puntúa un conjunto de candidatos definidos por 16 × 16 centros en dos escalas (0,5 y 0,25) sobre escenas de 512 px con glimpses de 128 px, y el modelo base observa el candidato de mayor puntuación. La salida final es la segmentación semántica ADE20K que la probe congelada lee del canvas.

El entrenamiento usa REINFORCE con episodios de 5 glimpses sobre las escenas de entrenamiento de ADE20K, con semilla 3. La recompensa es la reducción de la entropía cruzada de la probe de segmentación. El checkpoint seleccionado es el paso 7.000, el de menor entropía cruzada media de validación tras los glimpses elegidos. El registro completo del entrenamiento se conserva en el directorio `training_run/` tal como lo escribió el código original. La innovación técnica principal es el acoplamiento de una política de muestreo activo ligera (5,5 M de parámetros) a un backbone ViT congelado, evitando reentrenar el modelo de percepción.

## Capacidades

- Selección activa de viewpoints: puntúa candidatos de centro y escala y elige el siguiente glimpse a observar.
- Rollout multi-paso: ejecuta episodios de 5 glimpses sobre una escena de 512 px.
- Segmentación semántica ADE20K indirecta: la salida final es el mapa de 64 × 64 clases que la probe congelada lee del canvas.
- Integración con el ecosistema canvit-pytorch mediante la clase `LearnedPolicy`.
- No soporta tool calling, function calling ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general de propósito múltiple, audio ni otras modalidades.

## Casos de uso

- Segmentación semántica eficiente en escenas grandes: en lugar de procesar la imagen completa a alta resolución, la política selecciona los 5 glimpses más informativos, reduciendo el coste de cómputo en percepción de escenas de 512 px.
- Investigación en visión activa: sirve como referencia reproducible (semilla 3, paso 7.000) para comparar políticas de muestreo en el benchmark ADE20K con el protocolo de CanViT.
- Percepción embebida con presupuesto limitado: al requerir solo 5,5 M de parámetros adicionales sobre un backbone congelado, es adecuada para sistemas donde el número de lecturas de sensor está restringido.
- Robótica y navegación con fóvea: el esquema de glimpses con centros y escalas es directamente aplicable a cámaras con zoom o a sistemas que deciden dónde enfocar en cada paso.
- Destilación de políticas de atención: puede usarse como profesor o baseline para entrenar políticas más ligeras que imiten sus decisiones de viewpoint.
- Evaluación de probes de segmentación: permite medir cuánta información recupera una probe congelada cuando la política controla la secuencia de observaciones, útil para estudiar límites de representación del canvas.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las entropías cruzadas de validación de ADE20K tras cada glimpse, para el checkpoint seleccionado (paso 7.000):

| Glimpse | Entropia cruzada de validacion |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7142 |
| 3 | 0,6891 |
| 4 | 0,6754 |
| 5 | 0,6659 |

No se han publicado resultados comparativos con otros modelos (mIoU, MMLU, HumanEval, GSM8K u otras métricas) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja para la política en sí (5,5 M de parámetros, repo de 0,1 GB); el grueso del coste recae en el backbone CanViT-B y la probe congelados, cuyos requisitos no se detallan en la información disponible.
- GPU recomendadas: no disponibles de forma específica; el ejemplo de la model card ejecuta la política en CPU (`torch.device("cpu")`), lo que sugiere que la política es ligera, aunque el backbone puede requerir GPU para throughput práctico.
- Cabe en GPU de consumo: la política sí; el conjunto completo con CanViT-B no está cuantificado en la información disponible.
- Opciones de despliegue: `canvit-pytorch>=0.3` (instalable con `uv add`), con carga vía `LearnedPolicy.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de otros modelos de visión activa ni de políticas de muestreo comparables con métricas comunes. El propio ecosistema CanViT contiene otras políticas (por ejemplo, otras semillas y configuraciones), pero no se aportan sus resultados en esta ficha.

## Limitaciones y advertencias

- Modelo especializado: solo funciona acoplado al backbone CanViT-B y a la probe ADE20K concretos con los que fue entrenado; no es un modelo de propósito general.
- Dominio restringido: entrenado exclusivamente sobre escenas de ADE20K; su generalización a otros dominios visuales no está documentada.
- Sin datos de sesgo ni de robustez fuera de distribución en la información disponible.
- Riesgo de alucinación en el sentido de seleccionar viewpoints poco informativos si la escena se aleja de la distribución de entrenamiento; no hay evaluación publicada al respecto.
- Sin soporte de lenguaje, por lo que no aplican limitaciones de idioma, pero tampoco capacidades multilingües.
- Licencia MIT para la política, pero el modelo base CanViT se destila de DINOv3, sujeto a la DINOv3 License; conviene revisar las condiciones de esa licencia para uso comercial del conjunto completo.
- El checkpoint es una semilla concreta (seed 3) y un paso concreto (7.000); los resultados pueden variar con otras semillas o pasos.
- No hay datos publicados de latencia, throughput ni consumo energético en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s3
- Modelo base (CanViT-B): https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Probe ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Paper (NeurIPS 2026, arXiv 2603.22570): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Checkpoints CanViT: https://huggingface.co/canvit
- DINOv3 (origen de la destilación): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Dataset ADE20K (scene_parse_150): https://huggingface.co/datasets/zhoubolei/scene_parse_150
