# canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s1

## Resumen

`qpolicy-ade20k-c64-t5-qband-2026-07-04-s1` es una política de visión aprendida (learned viewing policy) desarrollada por el equipo de CanViT, no un modelo de lenguaje. Se trata de un componente de control que decide qué región de una escena debe observar a continuación un modelo de visión activa llamado CanViT-B (Canvas Vision Transformer), congelado durante el entrenamiento de la política. La política puntúa candidatos de visualización sobre el lienzo (canvas) del modelo base y selecciona el de mayor puntuación, de modo que CanViT-B dirige su siguiente mirada hacia esa región.

El modelo resuelve un problema concreto: la selección eficiente de vistas en un paradigma de visión activa, donde el sistema no procesa la imagen completa de una vez sino mediante una secuencia de vistazos (glimpses) que se integran en una memoria global denominada canvas. La política se entrena mediante Q-learning para elegir los vistazos que más reducen la entropía cruzada de una sonda de segmentación semántica ADE20K que lee el canvas.

Con 5.674.904 parámetros totales y un tamaño de repositorio de 0,1 GB, es un modelo muy ligero, pensado para ejecutarse junto al modelo base CanViT-B (ViT-B con parches de 16 px) y su sonda ADE20K. Es relevante en el contexto de investigación en visión activa y eficiencia computacional, ya que demuestra que una política de selección de vistas puede aprenderse de forma separada y reutilizarse sobre un backbone congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de selección de vistas basada en Q-learning sobre el canvas de CanViT-B (ViT-B); no es un transformer generativo |
| Parametros totales | 5.674.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre escenas de 512 px con canvas de 64 × 64) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política opera sobre el modelo observador CanViT-B (`canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`), un Vision Transformer con parches de 16 px, y sobre su sonda de segmentación ADE20K (`canvit/probe-ade20k-40k-s512-c64-in21k`), ambos congelados. Las escenas tienen 512 px, los vistazos 128 px y el canvas mide 64 × 64. Los candidatos de visualización se definen como 16 × 16 centros en cada una de dos escalas, 0,5 y 0,25.

El entrenamiento se realizó mediante Q-learning con episodios de 5 vistazos sobre las escenas de entrenamiento de ADE20K, con semilla 1. El objetivo es elegir los vistazos cuyos glimpses reduzcan más la entropía cruzada de la sonda. El checkpoint seleccionado corresponde al paso 5.000, escogido por tener la menor entropía cruzada media de validación en ADE20K tras los vistazos elegidos por la política. La entropía cruzada de validación tras cada vistazo fue de 0,7649, 0,7154, 0,6876, 0,6736 y 0,6644 respectivamente. El registro completo del entrenamiento se conserva en `training_run/`, tal como lo escribió el código original.

## Capacidades

- Selección activa de vistas: puntúa candidatos de visualización sobre el canvas y elige el de mayor puntuación para el siguiente vistazo.
- Rollout de episodios de 5 vistazos sobre escenas de 512 px con vistazos de 128 px.
- Integración con la sonda ADE20K del modelo base para producir etiquetas de segmentación semántica a partir del canvas final.
- Operación sobre un backbone congelado, sin necesidad de reentrenar CanViT-B ni la sonda.
- No dispone de generación de texto, tool calling, capacidades de agente, multilingüismo ni modo de razonamiento.

## Casos de uso

- Segmentación semántica eficiente en escenas de alta resolución: la política selecciona los vistazos más informativos, reduciendo el número de parches procesados frente a un barrido exhaustivo de la imagen completa.
- Investigación en visión activa: sirve como referencia reproducible (semilla 1, paso 5.000) para comparar estrategias de selección de vistas sobre el mismo backbone CanViT-B.
- Sistemas de percepción con presupuesto limitado de cómputo: al elegir regiones de forma adaptativa, permite asignar recursos de procesamiento a las zonas de la escena con mayor reducción esperada de incertidumbre.
- Evaluación de políticas de control en robótica y agentes visuales: el bucle de selección de vistas puede integrarse en simuladores donde un agente decide dónde mirar antes de actuar.
- Docencia y reproducción de experimentos: el registro de entrenamiento incluido en `training_run/` facilita replicar el proceso de Q-learning sobre ADE20K.
- Análisis de atención visual: permite estudiar qué regiones de una escena prioriza una política entrenada por reducción de entropía de segmentación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Entropía cruzada de validación tras el vistazo 1 | 0,7649 |
| Entropía cruzada de validación tras el vistazo 2 | 0,7154 |
| Entropía cruzada de validación tras el vistazo 3 | 0,6876 |
| Entropía cruzada de validación tras el vistazo 4 | 0,6736 |
| Entropía cruzada de validación tras el vistazo 5 | 0,6644 |

No se han publicado en la información disponible resultados comparativos con otras políticas de visión activa (mIoU, accuracy de segmentación u otras métricas estándar de ADE20K).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene 5,67 M de parámetros (unos 23 MB en fp32), aunque debe ejecutarse junto a CanViT-B (ViT-B) y la sonda ADE20K, que dominan el consumo.
- GPU recomendadas: cualquier GPU con suficiente memoria para el backbone ViT-B; una RTX 4090, A100 o H100 son más que suficientes para el conjunto completo.
- Cabe en GPU de consumo: sí, en GPUs como RTX 3060 o superiores, siempre que quepa el modelo base y la sonda.
- Opciones de despliegue: librería `canvit-pytorch` (>= 0.3); el ejemplo de la model card usa `LearnedPolicy.from_pretrained` y `policy.rollout` sobre CPU o GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas de visión activa comparables con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Es una política de control, no un modelo generativo: no produce texto ni responde a instrucciones.
- Entrenada exclusivamente sobre ADE20K (150 clases de escenas) y sobre el backbone CanViT-B congelado; su generalización a otros dominios o backbones no está documentada.
- Depende de la sonda ADE20K y del checkpoint concreto de CanViT-B; cambios en el observador invalidan la política.
- El rendimiento se mide por entropía cruzada de segmentación, no por métricas de segmentación estándar como mIoU.
- Licencia MIT para la política, pero CanViT se preentrena por destilación desde DINOv3, cuya licencia (DINOv3 License) puede imponer restricciones adicionales al uso del conjunto.
- Riesgo de sesgo heredado de los datos de ADE20K y del backbone preentrenado.
- No hay información sobre robustez ante escenas fuera de distribución ni sobre latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s1
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Checkpoints: https://huggingface.co/canvit
- DINOv3: https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
