# canvit/pgpolicy-ade20k-c64-t5-2026-07-06-sweep-trial0012

## Resumen

`canvit/pgpolicy-ade20k-c64-t5-2026-07-06-sweep-trial0012` es una política de visión aprendida (learned viewing policy) para CanViT-B, el modelo fundacional de visión activa Canvas Vision Transformer desarrollado por el grupo de investigación de Yohaï-Eliel Berreby (paper presentado en NeurIPS 2026). No es un modelo generativo de lenguaje ni un modelo multimodal al uso: es un módulo de decisión que, dado un lienzo (canvas) de escena construido por CanViT-B y la segmentación semántica que su sonda ADE20K lee de ese lienzo, puntúa candidatos de viewpoint y decide hacia dónde debe mirar a continuación el observer congelado.

El modelo resuelve un problema concreto de visión activa: seleccionar qué regiones de una escena observar para maximizar la reducción de incertidumbre en una tarea de segmentación semántica (ADE20K, 150 clases). Se entrena con REINFORCE sobre episodios de 5 glimpses y escenas de 512 px, con un canvas de 64 × 64 y glimpses de 128 px. El checkpoint publicado corresponde al paso 3.000 de un sweep, seleccionado por la menor entropía cruzada media de validación tras los glimpses elegidos por la política.

Es relevante ahora porque forma parte de la primera generación de modelos fundacionales de visión activa publicados con código, pesos y pipeline reproducible (`canvit-pytorch`), y porque demuestra que una política de RL de apenas 5,5 millones de parámetros puede mejorar de forma medible la lectura de un transformer visual congelado de mayor tamaño. El tamaño reducido del checkpoint (0,1 GB) y su licencia MIT lo hacen especialmente accesible para experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de selección de viewpoints sobre observer CanViT-B (Canvas Vision Transformer) congelado; puntuación de candidatos y selección por máximo score, entrenada con REINFORCE |
| Parametros totales | 5.543.447 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; episodios de 5 glimpses sobre escenas de 512 px con canvas de 64 × 64 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT (CanViT se preentrena por destilación de DINOv3, sujeto a DINOv3 License) |
| Formato de pesos | safetensors |
| Libreria | canvit-pytorch (>= 0.3) |
| Pipeline | reinforcement-learning |
| Dataset de entrenamiento | zhoubolei/scene_parse_150 (ADE20K) |
| Modelo base | canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02 |
| Sonda asociada | canvit/probe-ade20k-40k-s512-c64-in21k (congelada) |
| Resolución de escena | 512 px |
| Resolución de glimpse | 128 px |
| Canvas | 64 × 64 |
| Candidatos por paso | 16 × 16 centros en escalas 0.5 y 0.25 |
| Descargas | 47 |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El sistema completo consta de tres piezas: un observer CanViT-B preentrenado (ViT-B/16 con destilación desde DINOv3, parches de 16 px, escenas de 512 px y canvas de 64 × 64), una sonda de segmentación ADE20K congelada que lee logits por celda del canvas, y esta política de viewing entrenada por refuerzo. La política puntúa un conjunto discreto de candidatos (16 × 16 centros en cada una de las escalas 0,5 y 0,25) a partir del estado del canvas y de la segmentación leída, y el observer mira a continuación el candidato de mayor puntuación. El bucle se repite hasta completar 5 glimpses por episodio.

El entrenamiento usa REINFORCE con el objetivo de elegir los viewpoints cuyos glimpses reduzcan más la entropía cruzada de la sonda. Los episodios se construyen sobre las escenas de entrenamiento de ADE20K con semilla 0, y el registro completo del entrenamiento se conserva en el directorio `training_run/` tal como lo escribió el código original. El checkpoint publicado corresponde al paso 3.000, seleccionado por la menor entropía cruzada media de validación tras aplicar los glimpses elegidos por la política. La entropía cruzada de validación tras cada glimpse es 0,7649, 0,7149, 0,6887, 0,6748 y 0,6664, lo que muestra una mejora monótona a medida que la política acumula observaciones.

## Capacidades

- Selección activa de viewpoints: puntúa candidatos de centro y escala sobre el canvas de CanViT-B y elige el siguiente glimpse.
- Rollout completo de episodios de 5 glimpses sobre escenas de 512 px, devolviendo la traza de viewpoints (centro en fila/columna y escala) y el estado del canvas en cada paso.
- Lectura de segmentación semántica ADE20K (150 clases) desde el canvas final mediante la sonda congelada asociada.
- Integración con el ecosistema `canvit-pytorch` mediante la clase `LearnedPolicy` y la función `preprocess`.
- Ejecución en CPU (el ejemplo de la model card usa `torch.device("cpu")`) y en GPU mediante PyTorch estándar.
- No soporta tool calling, function calling, agentes de texto, razonamiento simbólico, matemáticas, generación de código ni capacidades multilingües: es un módulo puramente visual y de decisión.

## Casos de uso

- Segmentación semántica eficiente en escenas grandes: la política permite que un observer congelado construya un canvas de 64 × 64 mirando solo 5 regiones de 128 px de una escena de 512 px, lo que reduce el coste de cómputo frente a procesar la imagen completa con un ViT denso.
- Investigación en visión activa: sirve como baseline reproducible para comparar estrategias de selección de viewpoints (aleatoria, por incertidumbre, por atención) frente a una política aprendida por RL.
- Prototipado de pipelines de percepción con presupuesto limitado: en robótica o sistemas embebidos donde el sensor solo puede capturar un número fijo de parches, la política decide qué parches capturar para maximizar la calidad de la segmentación resultante.
- Evaluación de estrategias de exploración: el rollout devuelve la traza completa de viewpoints y estados de canvas, lo que facilita analizar qué regiones elige la política y por qué, útil para estudios de interpretabilidad.
- Fine-tuning de políticas de viewing para otros datasets o tareas: al ser un checkpoint pequeño (5,5 M de parámetros) con licencia MIT, se puede reentrenar con REINFORCE sobre otras sondas (detección, clasificación) manteniendo el observer CanViT-B congelado.
- Docencia y experimentación con RL: el tamaño reducido y la API sencilla de `canvit-pytorch` permiten reproducir el entrenamiento y estudiar el efecto de la selección de viewpoints en la entropía cruzada de validación paso a paso.
- Baseline para comparativas de modelos fundacionales de visión activa: permite medir cuánto mejora una política aprendida sobre una política heurística en la misma arquitectura y dataset.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que no aplican a este modelo. El único dato de rendimiento disponible es la entropía cruzada media de validación de ADE20K tras cada glimpse con la política entrenada:

| Paso (glimpse) | Entropía cruzada de validación |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7149 |
| 3 | 0,6887 |
| 4 | 0,6748 |
| 5 | 0,6664 |

No se han publicado resultados de benchmarks comparativos con otras políticas de viewing en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint de la política ocupa unos 0,1 GB en safetensors (5,5 M de parámetros); el consumo real depende del observer CanViT-B y de la sonda ADE20K asociados, que deben cargarse junto a la política.
- GPU recomendadas: cualquier GPU con soporte PyTorch es suficiente para la política; para el observer CanViT-B se recomienda al menos una GPU consumer moderna (RTX 3060 o superior) y, para lotes grandes, A100 o H100.
- Cabe en GPU consumer: sí, tanto la política como el observer ViT-B/16 a 512 px caben en GPUs consumer con 8 GB o más de VRAM en precisión estándar.
- Opciones de despliegue: `canvit-pytorch` (>= 0.3) sobre PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre políticas de viewing comparables publicadas con pesos abiertos en el momento de redactar esta ficha. La comparativa más directa sería contra políticas heurísticas (selección aleatoria de viewpoints, selección por máxima incertidumbre de la sonda) evaluadas sobre el mismo observer CanViT-B y el mismo dataset ADE20K, pero no se han publicado resultados numéricos de esas alternativas en la información disponible.

| Modelo | Parametros | Contexto / episodio | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pgpolicy-ade20k-c64-t5 (este) | 5,5 M | 5 glimpses, canvas 64 × 64 | Selección de viewpoints para segmentación ADE20K | MIT | Hugging Face |
| Política aleatoria (baseline) | 0 | 5 glimpses | Igual | no aplica | No publicada como checkpoint |
| Política por incertidumbre (baseline) | 0 | 5 glimpses | Igual | no aplica | No publicada como checkpoint |

## Limitaciones y advertencias

- Modelo especializado: no es un LLM ni un modelo multimodal general; no genera texto, código ni respuestas conversacionales.
- Dependencia del observer y la sonda: la política solo funciona correctamente junto al CanViT-B y la sonda ADE20K con los que fue entrenada; cambiar el observer o la sonda invalida las puntuaciones aprendidas.
- Dominio restringido: entrenada exclusivamente sobre escenas de ADE20K (interiores y exteriores cotidianos); su generalización a otros dominios visuales (médico, satelital, industrial) no está documentada.
- Número fijo de glimpses: el checkpoint está entrenado para episodios de 5 glimpses; usarlo con otro número de pasos puede degradar el rendimiento y no está validado.
- Riesgo de sesgo heredado: al destilarse CanViT de DINOv3, la política puede heredar sesgos de representación del observer y del dataset ADE20K, que no está balanceado por clase ni por geografía.
- Restricciones de licencia: la política es MIT, pero el observer CanViT-B se preentrena por destilación de DINOv3, sujeto a la DINOv3 License; el uso comercial del sistema completo debe revisar esa licencia adicional.
- Sin datos de benchmarks estándar: no hay métricas de mIoU ni comparativas publicadas en la información disponible, solo entropía cruzada de validación.
- Revisiones: los ficheros en el formato original del código de entrenamiento están en la revisión `original-format`; `canvit-pytorch` lee los de `main`, por lo que hay que prestar atención a la revisión al descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canvit/pgpolicy-ade20k-c64-t5-2026-07-06-sweep-trial0012
- Modelo base (observer CanViT-B): https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Colección de checkpoints CanViT: https://huggingface.co/canvit
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Paper en OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Dataset ADE20K (scene_parse_150): https://huggingface.co/datasets/zhoubolei/scene_parse_150
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
