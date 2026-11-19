# canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s1

## Resumen

`canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s1` es una política de visión aprendida (learned viewing policy) para CanViT-B, el modelo fundacional de visión activa "Canvas Vision Transformer" desarrollado por el equipo de CanViT (Yohaï-Eliel Berreby y colaboradores), presentado en NeurIPS 2026. No es un modelo de lenguaje ni un modelo generativo: es un módulo de decisión que, dado el estado de un lienzo (canvas) de escena construido por CanViT-B, puntúa candidatos de viewpoint y selecciona el siguiente que el observer debe mirar. El problema que resuelve es el de la selección activa de dónde mirar: en lugar de procesar la imagen completa a resolución fija, el sistema elige secuencialmente glimpses de 128 px sobre escenas de 512 px para maximizar la información útil para una tarea de segmentación semántica.

El checkpoint se ha entrenado específicamente para la sonda (probe) de segmentación ADE20K de CanViT-B, con episodios de 5 glimpses y un objetivo REINFORCE que premia los viewpoints cuya observación reduce la entropía cruzada de la sonda. Es, por tanto, un componente de un pipeline mayor: el observer CanViT-B y su probe ADE20K permanecen congelados, y solo la política se entrena. Su relevancia actual radica en que ejemplifica el paradigma de visión activa aplicado a segmentación con presupuesto limitado de cómputo visual, un área emergente frente al enfoque pasivo de los ViT tradicionales.

El modelo es extremadamente pequeño (5.543.447 parámetros, ~0,1 GB de repo), se distribuye en safetensors bajo licencia MIT y depende de la librería `canvit-pytorch>=0.3`. Está pensado para investigación y prototipado, no como modelo autónomo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de selección de viewpoints sobre el canvas de CanViT-B (vision transformer de visión activa); no es un transformer generativo |
| Parámetros totales | 5.543.447 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje); escenas de 512 px, canvas de 64 × 64, episodios de 5 glimpses |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT (CanViT se preentrena por destilación de DINOv3, sujeto a la DINOv3 License) |
| Formato de pesos | safetensors (revisión `main`); existe revisión `original-format` con los ficheros del código de entrenamiento original |

## Arquitectura y entrenamiento

La política opera sobre el estado del canvas que mantiene CanViT-B, un modelo de visión activa que observa una escena mediante una secuencia de glimpses y la integra en un lienzo de memoria de 64 × 64. En cada paso, la política puntúa un conjunto de candidatos definidos por 16 × 16 centros en cada una de dos escalas (0,5 y 0,25), y el observer mira el candidato de mayor puntuación. El observer (`canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16`) y su probe de segmentación ADE20K (`probe-ade20k-40k-s512-c64-in21k`) están congelados durante el entrenamiento de la política; solo se optimizan los parámetros de esta última.

El entrenamiento usa REINFORCE sobre episodios de 5 glimpses con escenas del split de entrenamiento de ADE20K, semilla 1, con el objetivo de elegir los viewpoints cuyos glimpses más reducen la entropía cruzada del probe. El checkpoint seleccionado es el paso 6.000, el de menor entropía cruzada media de validación tras los glimpses elegidos. La entropía cruzada de validación tras cada glimpse fue 0,7649, 0,7151, 0,6882, 0,6751 y 0,6651, lo que muestra una mejora monotónica decreciente a lo largo de los cinco pasos. El registro completo del entrenamiento se conserva en `training_run/` tal como lo escribió el código original.

## Capacidades

- Selección activa de viewpoints: puntúa candidatos de centro y escala y decide el siguiente glimpse del observer CanViT-B.
- Rollout multi-paso: `policy.rollout(scene, num_glimpses=5)` devuelve la secuencia completa de pasos, incluyendo el estado del canvas en cada uno.
- Segmentación semántica indirecta: tras el rollout, el probe congelado produce logits de 64 × 64 sobre las clases ADE20K (`policy.model.logits(steps[-1].state.canvas).argmax(dim=1)`).
- Optimización de información por glimpse: la política está entrenada para reducir la entropía cruzada de la sonda, no para reconstruir la imagen.
- Integración con el ecosistema CanViT: uso mediante `canvit-pytorch>=0.3` y la clase `LearnedPolicy`.
- Sin capacidades de lenguaje, tool calling, agentes textuales, visión generativa ni audio.

## Casos de uso

- Segmentación semántica con presupuesto visual limitado: en escenarios donde solo se pueden adquirir unas pocas regiones de una imagen (sensores con ancho de banda restringido, cámaras de bajo consumo), la política elige los 5 glimpses más informativos para la sonda ADE20K y reduce la entropía cruzada de 0,7649 a 0,6651 en validación.
- Investigación en visión activa: sirve como baseline reproducible para comparar estrategias de selección de viewpoints (aleatoria, barrido, basada en incertidumbre) frente a una política entrenada con REINFORCE.
- Prototipado de pipelines de percepción jerárquica: integración en sistemas que construyen una representación de escena por acumulación de observaciones, usando el canvas de 64 × 64 como memoria espacial.
- Evaluación de probes sobre representaciones activas: permite estudiar cómo afecta la política de mirada a la calidad de una sonda congelada, aislando el efecto de la selección de viewpoints del entrenamiento del backbone.
- Docencia y experimentación con RL aplicado a visión: ejemplo compacto (5,5 M de parámetros) de entrenamiento REINFORCE con recompensa derivada de una métrica de tarea (entropía cruzada de segmentación).
- Ablaciones de escalas y densidad de candidatos: la configuración de 16 × 16 centros a escalas 0,5 y 0,25 puede modificarse para estudiar el compromiso entre cobertura y coste de selección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la entropía cruzada media de validación de ADE20K tras cada glimpse elegido por la política:

| Glimpse | Entropía cruzada de validación |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7151 |
| 3 | 0,6882 |
| 4 | 0,6751 |
| 5 | 0,6651 |

No se proporcionan comparaciones con políticas aleatorias, barridos sistemáticos ni otros checkpoints de la familia.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint ocupa ~0,1 GB y tiene 5,5 M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer. El coste real lo domina el observer CanViT-B congelado y el probe, no la política.
- GPU recomendadas: cualquier GPU con suficiente memoria para CanViT-B; una RTX 4090 o superior es adecuada para experimentación, y el ejemplo de la model card funciona en CPU (`torch.device("cpu")`).
- Cabe en GPU consumer: sí, con margen amplio para la política; el límite práctico es el observer.
- Opciones de despliegue: `canvit-pytorch>=0.3` (instalación vía `uv add`), con soporte de CPU y GPU a través de PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas de viewing comparables de otros equipos, ni checkpoints alternativos de la misma familia con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo especializado y no autónomo: requiere el observer CanViT-B concreto y el probe ADE20K con los que fue entrenado; no funciona como segmentador independiente.
- Dominio restringido: entrenado exclusivamente sobre escenas de ADE20K a 512 px con glimpses de 128 px y canvas de 64 × 64; el rendimiento fuera de esa distribución no está caracterizado.
- Sin datos de sesgo: no se documentan análisis de sesgo demográfico, geográfico o de clase, algo relevante dado que ADE20K tiene una distribución de escenas concreta.
- Riesgo de selección subóptima: la política optimiza la entropía cruzada de la sonda, no la calidad perceptual ni la utilidad para otras tareas; puede ignorar regiones relevantes para objetivos distintos de la segmentación.
- Licencia: el checkpoint es MIT, pero CanViT se preentrena por destilación de DINOv3, sujeto a la DINOv3 License; conviene revisar esa licencia antes de uso comercial del pipeline completo.
- Métricas limitadas: solo se reporta entropía cruzada de validación; no hay mIoU, accuracy por clase ni comparaciones con baselines, lo que dificulta evaluar su ventaja real.
- Reproducibilidad: el entrenamiento usó una única semilla (seed 1); no se documenta variabilidad entre semillas.
- Sin soporte multilingüe ni de texto: no aplica para tareas de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s1
- Modelo base (observer): https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Probe ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Checkpoints de la familia CanViT: https://huggingface.co/canvit
- DINOv3 (origen de la destilación): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Dataset ADE20K (scene_parse_150): https://huggingface.co/datasets/zhoubolei/scene_parse_150
