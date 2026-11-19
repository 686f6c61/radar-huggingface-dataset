# canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s4

## Resumen

`canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s4` es una política de visión aprendida (learned viewing policy) para CanViT-B, un modelo fundacional de visión activa. No es un modelo de lenguaje ni un transformer de propósito general: es un módulo de decisión de 5,5 millones de parámetros que, dado un canvas de escena congelado, puntúa posibles puntos de vista y decide hacia dónde "mirar" a continuación. Lo desarrolla el equipo de CanViT (Yohaï-Eliel Berreby y colaboradores) y se publica junto al paper de NeurIPS 2026 "CanViT: Toward Active-Vision Foundation Models".

El problema que resuelve es concreto: en lugar de procesar una imagen completa de una sola pasada, CanViT observa la escena mediante una secuencia de *glimpses* de 128 px que va acumulando en un canvas de 64 × 64. Esta política es la que elige qué glimpse tomar en cada paso, entrenada por REINFORCE para maximizar la reducción de la entropía cruzada de un probe de segmentación semántica ADE20K.

Es relevante porque demuestra que una política de selección de vistas de muy bajo coste (5,5 M de parámetros) puede guiar a un backbone congelado de forma entrenable por refuerzo, con una mejora medible de la entropía cruzada de validación a lo largo de cinco glimpses (de 0,7649 a 0,6678). Es un checkpoint de investigación, no un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de puntuación de viewpoints sobre canvas de CanViT-B (vision transformer de visión activa); entrenada con REINFORCE |
| Parametros totales | 5.543.447 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: opera sobre canvas de 64 × 64 y escenas de 512 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT (backbone CanViT destilado de DINOv3, sujeto a DINOv3 License) |
| Formato de pesos | safetensors (repo de 0,1 GB); revisión `original-format` con el formato del código de entrenamiento |

## Arquitectura y entrenamiento

La política opera sobre el observer congelado `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02` y su probe ADE20K `canvit/probe-ade20k-40k-s512-c64-in21k`. El escenario de visión es de 512 px con glimpses de 128 px y un canvas de 64 × 64. En cada paso, la política puntúa candidatos definidos por centros de 16 × 16 en dos escalas (0,5 y 0,25), y CanViT mira al candidato de mayor puntuación.

El entrenamiento usa REINFORCE con episodios de 5 glimpses sobre las escenas de entrenamiento de ADE20K (dataset `zhoubolei/scene_parse_150`), semilla 4. El objetivo es elegir los viewpoints cuyos glimpses reduzcan más la entropía cruzada del probe. El checkpoint seleccionado es el paso 4.000, el de menor entropía cruzada media de validación tras los glimpses elegidos por la política. La entropía cruzada de validación tras cada glimpse es 0,7649, 0,7178, 0,6916, 0,6780 y 0,6678. El registro completo del entrenamiento está en `training_run/`, tal como lo escribió el código original.

## Capacidades

- Selección de viewpoints: puntúa candidatos de centro y escala y elige el siguiente glimpse de mayor puntuación.
- Rollout de episodios de múltiples glimpses sobre una escena de 512 px, acumulando información en un canvas de 64 × 64.
- Segmentación semántica ADE20K indirecta: el probe congelado lee las etiquetas del canvas final (`logits(...).argmax(dim=1)` produce `[1, 64, 64]` clases ADE20K).
- Integración con el ecosistema `canvit-pytorch` (>= 0.3) mediante `LearnedPolicy.from_pretrained` y `policy.rollout(scene, num_glimpses=5)`.
- No soporta tool calling, function calling, agentes textuales, razonamiento multi-paso lingüístico ni capacidades multilingües: es un módulo de decisión visual.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Investigación en visión activa: usar la política como referencia entrenada por REINFORCE para comparar estrategias de selección de vistas (aleatoria, heurística, aprendida) sobre el mismo backbone CanViT-B congelado.
- Segmentación semántica con presupuesto de cómputo limitado: en lugar de procesar la imagen completa, ejecutar 5 glimpses guiados por la política y leer las etiquetas del canvas, reduciendo el número de píxeles procesados por el backbone.
- Reproducción de experimentos: el registro en `training_run/` y la semilla 4 permiten reproducir el entrenamiento y validar la curva de entropía cruzada publicada.
- Baseline para nuevas políticas: servir como punto de partida para entrenar políticas con más escalas, más candidatos u otros objetivos (por ejemplo, recompensas basadas en IoU en vez de entropía cruzada).
- Evaluación de probes de segmentación: medir cómo afecta la selección de viewpoints a la calidad del probe ADE20K congelado en escenas de validación.
- Docencia y demostraciones: el ejemplo de la model card (carga en CPU, `preprocess(512)`, rollout de 5 pasos e impresión de centros y escalas) permite ilustrar un pipeline completo de visión activa con un repo de 0,1 GB.
- Prototipado de sistemas de percepción con atención selectiva: integrar la política en un bucle de percepción que decida dónde mirar antes de invocar un segmentador más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de rendimiento es la entropía cruzada media de validación ADE20K tras cada glimpse, que se muestra a continuación:

| Glimpse | Entropia cruzada de validacion |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7178 |
| 3 | 0,6916 |
| 4 | 0,6780 |
| 5 | 0,6678 |

No se proporcionan métricas como mIoU, accuracy por clase ni comparaciones con otras políticas en la información disponible.

## Requisitos de hardware

- VRAM estimada para la política: mínima, dado que el checkpoint pesa 5,5 M de parámetros (repo de 0,1 GB); cabe holgadamente en cualquier GPU consumer y el ejemplo oficial se ejecuta en CPU (`torch.device("cpu")`).
- El coste real lo determina el observer congelado CanViT-B y el probe ADE20K, no la política; no se dispone de cifras de VRAM para el conjunto completo en la información proporcionada.
- GPU recomendadas: no disponible de forma específica; por el tamaño del checkpoint, cualquier GPU con suficiente memoria para CanViT-B es válida.
- Cabe en GPU consumer: sí para la política; para el pipeline completo depende de CanViT-B (no documentado).
- Opciones de despliegue: librería `canvit-pytorch` (>= 0.3) instalable con `uv add`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre políticas de visión activa comparables en la documentación proporcionada. Como referencia interna del mismo ecosistema, la política se apoya en:

| Componente | Rol | Parametros | Licencia |
|---|---|---|---|
| pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s4 | Politica de seleccion de viewpoints (este modelo) | 5.543.447 | MIT |
| canvitb16-add-vpe-pretrain-...-dv3b16-2026-02-02 | Observer CanViT-B congelado | no disponible | MIT (destilado de DINOv3) |
| probe-ade20k-40k-s512-c64-in21k | Probe de segmentacion ADE20K congelado | no disponible | no disponible |

Comparativa con modelos de la misma categoría (otras políticas de visión activa): no disponible.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint de un experimento concreto (semilla 4, paso 4.000), no un modelo validado para producción.
- Dependencia fuerte del observer y del probe congelados: la política se entrenó con un CanViT-B y un probe ADE20K específicos; usarla con otros backbones o probes invalida las garantías de rendimiento.
- Dominio restringido: entrenada exclusivamente sobre escenas de entrenamiento de ADE20K; no hay evidencia de generalización a otros datasets, dominios o resoluciones.
- Sin capacidades lingüísticas: no procesa texto, no soporta instrucciones en lenguaje natural ni tool calling.
- Sesgos: no documentados en la información disponible; al entrenarse sobre ADE20K, hereda los sesgos de composición y anotación de ese dataset.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la segmentación leída del canvas puede ser incorrecta en escenas fuera de distribución.
- Restricciones de licencia: la política es MIT, pero CanViT se preentrena por destilación de DINOv3, liberado bajo la DINOv3 License; el uso comercial del pipeline completo debe revisar esa licencia.
- Idiomas: no aplica; no hay soporte multilingüe.
- Contexto: no hay ventana de contexto textual; el estado se limita al canvas de 64 × 64 y al número de glimpses configurado.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s4
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- Observer (modelo base): https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Probe ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Dataset ADE20K (scene_parse_150): https://huggingface.co/datasets/zhoubolei/scene_parse_150
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Repositorio DINOv3: https://github.com/facebookresearch/dinov3
