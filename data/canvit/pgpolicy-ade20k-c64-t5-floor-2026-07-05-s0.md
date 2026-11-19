# canvit/pgpolicy-ade20k-c64-t5-floor-2026-07-05-s0

## Resumen

`canvit/pgpolicy-ade20k-c64-t5-floor-2026-07-05-s0` es una política de visión aprendida (learned viewing policy) para el modelo de visión activa CanViT-B (Canvas Vision Transformer). No es un modelo de lenguaje ni un modelo generativo de propósito general: es un módulo de 5,5 millones de parámetros que decide qué región de una escena debe observar a continuación un backbone visual congelado. Lo desarrolla el equipo CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna) y se presentó junto al artículo "CanViT: Toward Active-Vision Foundation Models" en NeurIPS 2026.

El problema que resuelve es concreto: dado un canvas de 64 × 64 píxeles que representa la escena y una sonda de segmentación semántica ADE20K que lee ese canvas, la política puntúa candidatos de mirada y selecciona el de mayor puntuación para que CanViT-B realice el siguiente glimpse. Se entrena con REINFORCE para elegir los puntos de vista cuyos glimpses reducen más la entropía cruzada de la sonda. Es relevante porque demuestra un enfoque de visión activa con presupuesto limitado de observaciones, útil en robótica, inspección y cualquier escenario donde observar toda la imagen resulte caro.

La ficha se basa exclusivamente en la model card y los metadatos de Hugging Face; no se dispone de información adicional verificable sobre el modelo base completo ni sobre resultados comparativos con otras políticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de selección de viewpoints sobre canvas de CanViT-B (Vision Transformer con canvas); backbone congelado |
| Parámetros totales | 5.543.447 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; escenas de 512 px con canvas de 64 × 64 y glimpses de 128 px |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Librería | canvit-pytorch (>= 0.3) |
| Modelo base | canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02 |
| Dataset de entrenamiento | zhoubolei/scene_parse_150 (ADE20K) |
| Pipeline | reinforcement-learning |
| Tamaño del repo | 0,1 GB |
| Descargas | 50 |
| Fecha de creación | 2026-07-05 |

## Arquitectura y entrenamiento

La política opera sobre el estado de un Canvas Vision Transformer congelado. CanViT-B ve una escena a través de una secuencia de glimpses de 128 px y los integra en un canvas de 64 × 64 píxeles. La política puntúa candidatos definidos por 16 × 16 centros en cada escala de 0,5 y 0,25, y el modelo observa a continuación el candidato de mayor puntuación. La sonda de segmentación ADE20K (`canvit/probe-ade20k-40k-s512-c64-in21k`) lee las etiquetas del canvas; la política no modifica ni el backbone ni la sonda, que permanecen congelados durante el entrenamiento.

El entrenamiento usa REINFORCE con episodios de 5 glimpses sobre las escenas de entrenamiento de ADE20K, semilla 0. Se seleccionó el paso 7.000, el de menor entropía cruzada media de validación en ADE20K tras los glimpses elegidos por la política. La entropía cruzada de validación tras cada glimpse fue de 0,7649, 0,7135, 0,6894, 0,6752 y 0,6647 respectivamente. El registro completo del entrenamiento se conserva en el directorio `training_run/` y los archivos en el formato original están en la revisión `original-format`.

## Capacidades

- Selección activa de viewpoints: puntúa candidatos de mirada y elige el siguiente glimpse sobre el canvas.
- Segmentación semántica ADE20K indirecta: el canvas resultante se decodifica con la sonda congelada en 64 × 64 etiquetas de clase.
- Rollout multi-glimpse: permite ejecutar secuencias de varios pasos (`num_glimpses`) sobre una escena de 512 px.
- Integración con CanViT-B: depende del backbone y la sonda con los que fue entrenada.
- No soporta tool calling, function calling, agentes de texto, generación de lenguaje ni capacidades multilingües.
- No dispone de modo thinking, visión generalista, audio ni otras modalidades.

## Casos de uso

- Inspección visual con presupuesto limitado: en entornos donde capturar la imagen completa es costoso (cámaras móviles, satélites, microscopía), la política elige los 5 glimpses más informativos para la segmentación.
- Robótica con fóvea activa: un brazo o cabezal con cámara de campo reducido puede usar la política para decidir hacia dónde apuntar y mejorar la segmentación de la escena.
- Preprocesado inteligente para pipelines de segmentación: sustituir el muestreo uniforme por una selección aprendida de regiones antes de pasar la imagen a un modelo de segmentación.
- Investigación en visión activa: sirve como política de referencia (baseline) para comparar estrategias de selección de viewpoints con REINFORCE.
- Control de calidad en líneas de producción: priorizar la observación de zonas de la escena que reduzcan más la incertidumbre de la sonda de segmentación.
- Docencia y reproducción de experimentos: el registro de entrenamiento y la semilla fija permiten reproducir el comportamiento de la política paso a paso.

## Benchmarks y rendimiento

La model card solo publica la evolución de la entropía cruzada de validación en ADE20K tras cada glimpse elegido por la política:

| Glimpse | Entropía cruzada de validación |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7135 |
| 3 | 0,6894 |
| 4 | 0,6752 |
| 5 | 0,6647 |

No se han publicado resultados de benchmarks comparativos (mIoU, MMLU, HumanEval, GSM8K u otros) en la información disponible. Los resultados de búsqueda web no contienen información relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 5,5 millones de parámetros en safetensors, los pesos ocupan del orden de decenas de MB, pero la inferencia requiere además cargar el backbone CanViT-B y la sonda ADE20K congelados.
- GPU recomendadas: no disponible; el ejemplo de la model card ejecuta la política en CPU (`torch.device("cpu")`).
- Cabe en GPU consumer: probablemente sí para la política sola, pero el requisito real depende del backbone CanViT-B; no se especifica.
- Opciones de despliegue: `canvit-pytorch>=0.3` con la clase `LearnedPolicy`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de visión activa comparables ni datos de rendimiento cruzado con alternativas.

## Limitaciones y advertencias

- Dependencia estricta del backbone y la sonda con los que fue entrenada; no funciona como módulo autónomo.
- Entrenada solo para segmentación ADE20K y escenas de 512 px con glimpses de 128 px; no generaliza a otras tareas sin reentrenamiento.
- El espacio de candidatos está fijado (16 × 16 centros en escalas 0,5 y 0,25); no explora viewpoints fuera de esa rejilla.
- Riesgo de sobreajuste a la distribución de ADE20K; no hay evaluación fuera de dominio publicada.
- No hay información sobre sesgos; al ser un modelo visual, puede heredar sesgos del backbone DINOv3 y del dataset ADE20K.
- Licencia MIT para esta política, pero el backbone CanViT se destila de DINOv3, que tiene su propia licencia (DINOv3 License); conviene revisar las condiciones de uso comercial del backbone.
- Solo 50 descargas y 0 likes en el momento de la consulta; ecosistema pequeño y poca validación externa.
- No se han publicado datos de latencia, throughput ni robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/pgpolicy-ade20k-c64-t5-floor-2026-07-05-s0
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Colección de checkpoints: https://huggingface.co/canvit
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- DINOv3 (origen de la destilación): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Dataset ADE20K: https://huggingface.co/datasets/zhoubolei/scene_parse_150
