# canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s0

## Resumen

pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s0 es una política de visión aprendida (learned viewing policy) para el modelo CanViT-B, un transformer de visión de visión activa desarrollado por el equipo de CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna), presentado en NeurIPS 2026. No es un modelo de lenguaje ni un modelo generativo: es un módulo de decisión que, dado el canvas (memoria visual) de un CanViT-B congelado y la segmentación que su sonda ADE20K lee de ese canvas, puntúa puntos de vista candidatos y selecciona el siguiente glimpse que el modelo observará.

El problema que resuelve es el de la selección activa de la siguiente mirada en un sistema de visión activa: en lugar de procesar la imagen completa de una vez, CanViT ve la escena a través de una secuencia de glimpses y la reconstruye en un canvas de memoria. Esta política aprende, mediante REINFORCE, qué región y a qué escala conviene mirar en cada paso para reducir la entropía cruzada de la sonda de segmentación semántica ADE20K.

Es relevante porque demuestra que una política de visión de tan solo 5,5 millones de parámetros puede guiar a un backbone congelado y mejorar de forma medible la segmentación tras cada glimpse, con una licencia MIT permisiva y un formato de pesos safetensors de apenas 0,1 GB. El checkpoint corresponde a la semilla 0 y al paso 7.000 de entrenamiento, seleccionado por menor entropía cruzada de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de puntuación de viewpoints sobre el canvas de un Vision Transformer (CanViT-B) congelado; no es un transformer generativo |
| Parametros totales | 5.543.447 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; escenas de 512 px, glimpses de 128 px y canvas de 64 × 64 |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT (el backbone CanViT se destila de DINOv3, sujeto a la DINOv3 License) |
| Formato de pesos | safetensors (revisión `original-format` con el formato del código de entrenamiento original) |

## Arquitectura y entrenamiento

La política opera sobre un observador congelado compuesto por CanViT-B (canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16) y su sonda de segmentación ADE20K (probe-ade20k-40k-s512-c64-in21k). El espacio de acciones está discretizado: 16 × 16 centros candidatos en cada una de dos escalas, 0,5 y 0,25, sobre escenas de 512 px con glimpses de 128 px y un canvas de 64 × 64. La política puntúa cada candidato a partir del estado del canvas y la segmentación leída por la sonda, y CanViT mira a continuación el candidato con mayor puntuación.

El entrenamiento usa REINFORCE con episodios de 5 glimpses sobre las escenas de entrenamiento de ADE20K, semilla 0. La recompensa es la reducción de la entropía cruzada de la sonda tras cada glimpse. El checkpoint seleccionado es el paso 7.000, el de menor entropía cruzada media de validación tras los glimpses elegidos por la política. El registro completo del entrenamiento se conserva en el directorio `training_run/` del repositorio, tal como lo escribió el código original.

## Capacidades

- Selección de viewpoints: puntúa candidatos (centro y escala) y elige el siguiente glimpse que maximiza la reducción esperada de error de segmentación.
- Planificación de secuencias de observación: ejecuta rollouts de hasta N glimpses (5 en el ejemplo de la model card) sobre una escena de 512 px.
- Segmentación semántica indirecta: la salida final de clases ADE20K (64 × 64) se obtiene de la sonda congelada aplicada al canvas resultante, no de la política en sí.
- Integración con un backbone de visión activa: funciona únicamente acoplada a CanViT-B y a su sonda ADE20K; no es un modelo autónomo.
- Sin soporte de tool calling, function calling, agentes de texto, capacidades multilingües, visión generalista, audio ni thinking mode.
- Reproducibilidad: incluye el registro de entrenamiento original y una revisión `original-format` con los pesos en el formato del código de entrenamiento.

## Casos de uso

- Segmentación semántica eficiente en escenas grandes: usar la política para elegir 5 glimpses de 128 px en lugar de procesar la escena completa a alta resolución, reduciendo el coste computacional del backbone congelado.
- Robótica con visión activa: un agente con cámara móvil puede delegar en la política la decisión de hacia dónde mirar en cada paso para maximizar la información de segmentación de la escena.
- Inspección visual de entornos estructurados: en escenas de interior o urbanas similares a ADE20K, la política prioriza las regiones que más reducen la incertidumbre de la sonda.
- Investigación en visión activa: punto de partida reproducible (semilla 0, paso 7.000 documentado) para comparar objetivos de RL, espacios de acciones o backbones alternativos.
- Prototipado de sistemas de percepción con presupuesto limitado de cómputo: al tener 5,5 M de parámetros y correr en CPU según el ejemplo de la model card, sirve para validar pipelines antes de escalar.
- Evaluación de políticas de atención visual: banco de pruebas para medir la curva de entropía cruzada de validación por glimpse (0,7649 → 0,7135 → 0,6894 → 0,6752 → 0,6647) frente a políticas aleatorias o heurísticas.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que además no aplican a este tipo de modelo. El único dato de rendimiento disponible es la entropía cruzada media de validación de ADE20K tras cada glimpse elegido por la política:

| Glimpse | Entropia cruzada de validacion |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7135 |
| 3 | 0,6894 |
| 4 | 0,6752 |
| 5 | 0,6647 |

No se han publicado resultados de benchmarks en la informacion disponible más allá de esta curva.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint pesa 0,1 GB y tiene 5,5 M de parámetros. El ejemplo de la model card ejecuta la política en CPU (`torch.device("cpu")`).
- GPU recomendadas: no se especifican; cualquier GPU con soporte de PyTorch es suficiente para la política. El coste real lo determina el backbone CanViT-B congelado y la sonda ADE20K, no la política.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para la política; el backbone CanViT-B requiere más recursos, no cuantificados en la información disponible.
- Opciones de despliegue: librería `canvit-pytorch>=0.3` (instalable con `uv add`), con `LearnedPolicy.from_pretrained` y `policy.rollout`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de políticas de visión activa en la documentación proporcionada. Como referencia del ecosistema, el propio backbone CanViT-B y la sonda ADE20K son los componentes con los que esta política se compara funcionalmente:

| Modelo | Parametros | Contexto / entrada | Funcion | Licencia |
|---|---|---|---|---|
| pgpolicy-ade20k-c64-t5-floorband (este) | 5,5 M | escenas 512 px, canvas 64 × 64 | política de selección de glimpses | MIT |
| CanViT-B (backbone congelado) | no disponible | escenas 512 px, glimpses 128 px | visión activa, representación | no disponible en la informacion |
| Sonda ADE20K (probe-ade20k-40k-s512-c64-in21k) | no disponible | canvas 64 × 64 | segmentación semántica ADE20K | no disponible en la informacion |

## Limitaciones y advertencias

- Ámbito restringido: la política solo funciona acoplada al CanViT-B y a la sonda ADE20K concretos con los que fue entrenada; no es transferible a otros backbones sin reentrenamiento.
- Dominio limitado: entrenada exclusivamente con escenas de ADE20K (interiores y escenas cotidianas); su comportamiento fuera de esa distribución no está documentado.
- Espacio de acciones fijo: 16 × 16 centros y dos escalas (0,5 y 0,25); no generaliza a otras resoluciones o configuraciones de canvas sin cambios en el diseño.
- Sin datos de sesgo: la model card no documenta sesgos conocidos, pero al heredar la representación de DINOv3 puede arrastrar los sesgos de sus datos de preentrenamiento.
- Riesgo de decisiones subóptimas: es una política entrenada con REINFORCE y una sola semilla; la varianza entre semillas no está cuantificada en la información disponible.
- Licencia: la política es MIT, pero el backbone CanViT se destila de DINOv3, liberado bajo la DINOv3 License; conviene revisar esa licencia para uso comercial del sistema completo.
- Sin garantías de producción: no hay benchmarks estándar, latencias ni estudios de robustez publicados; el uso en producción requiere validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s0
- Paper (NeurIPS 2026, arXiv): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Checkpoints de CanViT: https://huggingface.co/canvit
- Backbone base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Dataset ADE20K: https://huggingface.co/datasets/zhoubolei/scene_parse_150
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Repositorio DINOv3: https://github.com/facebookresearch/dinov3
