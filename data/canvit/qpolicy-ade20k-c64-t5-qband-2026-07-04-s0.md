# canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s0

## Resumen

qpolicy-ade20k-c64-t5-qband-2026-07-04-s0 es una política de visión aprendida (learned viewing policy) para CanViT-B, un modelo fundacional de visión activa desarrollado por el equipo CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna) y presentado en NeurIPS 2026. No es un modelo de lenguaje ni un modelo generativo: es un módulo de decisión que, dado el estado de un canvas visual, puntúa posibles puntos de vista candidatos y selecciona el siguiente glimpse que el modelo observador debe capturar. El problema que resuelve es el de la selección activa de información visual bajo un presupuesto limitado de observaciones.

El checkpoint concreto se ha entrenado mediante Q-learning sobre escenas de entrenamiento de ADE20K, con el objetivo de elegir los viewpoints cuyos glimpses reduzcan más la entropía cruzada de una sonda de segmentación semántica congelada. El modelo observador y la sonda están congelados: solo se entrena la política. Con 5.674.904 parámetros y un repositorio de 0,1 GB, es un componente ligero pensado para integrarse en pipelines de visión activa junto a CanViT-B.

Su relevancia actual radica en que ejemplifica un patrón emergente en visión por computador: separar el modelo perceptivo (grande, congelado, preentrenado por destilación de DINOv3) del módulo de control (pequeño, entrenado con RL) que decide dónde mirar. Esto permite reutilizar un backbone costoso y adaptar únicamente la política a una tarea concreta, en este caso segmentación semántica sobre ADE20K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de selección de viewpoints (Q-learning) sobre el canvas de un Vision Transformer (CanViT-B); no es un transformer generativo |
| Parametros totales | 5.674.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; opera sobre escenas de 512 px con canvas de 64 × 64 y episodios de 5 glimpses |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política opera sobre el estado de un canvas de 64 × 64 que mantiene CanViT-B, un Canvas Vision Transformer de visión activa que observa una escena a través de una secuencia de glimpses de 128 px y los integra en una representación global. En cada paso, la política puntúa candidatos definidos por 16 × 16 centros en cada una de dos escalas (0,5 y 0,25) y selecciona el de mayor puntuación; el observador captura entonces ese glimpse y actualiza el canvas. El modelo observador y la sonda de segmentación ADE20K están congelados durante todo el entrenamiento.

El entrenamiento se realizó con Q-learning sobre episodios de 5 glimpses en las escenas de entrenamiento de ADE20K (dataset `zhoubolei/scene_parse_150`), con semilla 0. La recompensa se define implícitamente por la reducción de la entropía cruzada de la sonda de segmentación tras cada glimpse. El checkpoint seleccionado es el paso 5.000, elegido por tener la menor entropía cruzada media de validación tras los glimpses escogidos por la política: 0,7649, 0,7149, 0,6886, 0,6742 y 0,6654 para los cinco pasos sucesivos. El registro completo del entrenamiento se conserva en el directorio `training_run/`.

## Capacidades

- Selección activa de viewpoints: puntúa candidatos y elige el siguiente glimpse que maximiza la reducción esperada de error de segmentación.
- Rollout multi-paso: ejecuta episodios de 5 glimpses sobre una escena de 512 px, devolviendo en cada paso el centro (fila, columna) y la escala del viewpoint elegido.
- Integración con sonda de segmentación: el canvas resultante se decodifica a 64 × 64 etiquetas de las clases de ADE20K mediante la sonda congelada.
- Operación sobre CPU: el ejemplo de uso oficial emplea `torch.device("cpu")`, lo que indica que la política es lo bastante ligera para inferencia sin GPU.
- No soporta generación de texto, tool calling, agentes lingüísticos, visión generativa, audio ni capacidades multilingües.

## Casos de uso

- Segmentación semántica con presupuesto limitado de observaciones: en lugar de procesar la imagen completa a resolución nativa, la política selecciona 5 regiones informativas y la sonda segmenta desde el canvas, reduciendo el coste computacional por escena.
- Sistemas de visión con sensor móvil o con campo de visión restringido: la política decide hacia dónde dirigir la cámara en cada paso, útil en robótica de inspección o drones donde cada captura tiene un coste.
- Preprocesado inteligente para pipelines de percepción: se puede usar como módulo de selección de regiones de interés antes de un modelo de segmentación o detección más costoso.
- Investigación en visión activa: sirve como baseline reproducible (semilla 0, paso 5.000 documentado) para comparar estrategias de selección de viewpoints.
- Adaptación de backbones congelados a nuevas tareas: el patrón de entrenar solo la política sobre un observador preentrenado se puede replicar para otras tareas de lectura del canvas.
- Evaluación de estrategias de exploración visual: permite medir cómo evoluciona la entropía cruzada de validación a lo largo de los glimpses y comparar políticas alternativas.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son las entropías cruzadas medias de validación tras cada glimpse para el checkpoint seleccionado:

| Glimpse | Entropia cruzada media de validacion |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7149 |
| 3 | 0,6886 |
| 4 | 0,6742 |
| 5 | 0,6654 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para la política (5,67 M de parámetros); el consumo dominante proviene del observador CanViT-B y de la sonda, que deben cargarse junto a la política.
- GPU recomendadas: no se especifican; el ejemplo oficial funciona en CPU. Para lotes grandes o entrenamiento de la política se recomienda cualquier GPU con al menos 8 GB, aunque el dato no está confirmado en la información disponible.
- Cabe en cualquier GPU de consumo actual; también en CPU para inferencia de una sola escena.
- Opciones de despliegue: librería `canvit-pytorch` (>= 0.3), instalable con `uv add "canvit-pytorch>=0.3"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / escena | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qpolicy-ade20k-c64-t5-qband-2026-07-04-s0 | 5,67 M | Política de visión activa (Q-learning) | Escenas 512 px, canvas 64 × 64, 5 glimpses | MIT | Hugging Face (canvit) |
| CanViT-B (observador base) | no disponible en la información | Vision Transformer de visión activa | Escenas 512 px, glimpses 128 px | MIT (preentrenado por destilación de DINOv3) | Hugging Face (canvit) |
| Sonda ADE20K de CanViT-B | no disponible en la información | Sonda de segmentación semántica | Canvas 64 × 64 | no disponible | Hugging Face (canvit) |

No se dispone de información sobre políticas de visión activa alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- La política está entrenada específicamente para el par observador + sonda congelados indicados; usarla con otro backbone o con otra tarea de lectura del canvas invalida su objetivo de entrenamiento.
- El dominio de entrenamiento es ADE20K (escenas interiores y exteriores de `zhoubolei/scene_parse_150`); el rendimiento fuera de esa distribución no está documentado.
- El presupuesto es fijo en 5 glimpses y las escalas candidatas están limitadas a 0,5 y 0,25; no se contemplan configuraciones alternativas en la información disponible.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso lingüístico, y no tiene capacidades multilingües.
- Riesgo de alucinación en el sentido generativo: no aplica; el riesgo relevante es la selección subóptima de viewpoints, que puede degradar la segmentación resultante.
- La licencia del checkpoint es MIT, pero CanViT se preentrenó por destilación de DINOv3, liberado bajo la DINOv3 License; conviene revisar las condiciones de esa licencia para uso comercial del pipeline completo.
- No se documentan sesgos específicos ni evaluaciones de robustez en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s0
- Modelo observador base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Paper en OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- Dataset ADE20K: https://huggingface.co/datasets/zhoubolei/scene_parse_150
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
