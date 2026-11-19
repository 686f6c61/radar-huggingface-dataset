# canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s6

## Resumen

`canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s6` es una política de visión aprendida (learned viewing policy) para el modelo de visión activa CanViT-B, desarrollada por el autor `canvit` en el contexto del paper CanViT (NeurIPS 2026). No es un modelo de lenguaje ni un modelo generativo de propósito general: es un módulo de decisión que, dado el estado de un lienzo (canvas) de escena y la segmentación que una sonda ADE20K lee de él, puntúa candidatos de mirada y selecciona el siguiente punto a observar. El modelo observador subyacente es CanViT-B, un Vision Transformer de visión activa que percibe la escena a través de una secuencia de *glimpses* y la memoriza en un canvas de ámbito global.

El problema que resuelve es la selección eficiente de dónde mirar a continuación en un paradigma de visión activa: en lugar de procesar la imagen completa a alta resolución, CanViT acumula información en un canvas de 64 × 64 y esta política decide qué región (centro y escala) maximiza la reducción de entropía cruzada de la sonda de segmentación. Se entrenó mediante Q-learning sobre episodios de 5 glimpses con escenas de entrenamiento de ADE20K (seed 6), y se seleccionó el paso 7.000 por menor entropía cruzada media de validación.

Con 5.674.904 parámetros y un tamaño de repositorio de 0,1 GB, es un componente ligero y desplegable en CPU, pensado para integrarse en pipelines de visión activa con `canvit-pytorch`. Su relevancia actual radica en que ejemplifica una alternativa a la inferencia densa: asignar cómputo de forma adaptativa mediante una política aprendida en lugar de procesar todos los píxeles por igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de visión aprendida (Q-learning) sobre observador CanViT-B (Vision Transformer de visión activa); no es un transformer generativo |
| Parametros totales | 5.674.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; escenas de 512 px, glimpses de 128 px, canvas de 64 × 64 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT (CanViT preentrenado por destilación de DINOv3, sujeto a DINOv3 License) |
| Formato de pesos | safetensors (librería `canvit-pytorch`) |

## Arquitectura y entrenamiento

La política opera sobre el estado de un observador congelado: CanViT-B, un Vision Transformer de visión activa que procesa la escena mediante una secuencia de glimpses de 128 px y acumula la información en un canvas de 64 × 64. La política puntúa candidatos definidos por 16 × 16 centros en cada una de dos escalas (0,5 y 0,25) y selecciona el de mayor puntuación; CanViT-B mira a continuación ese candidato. El objetivo es Q-learning, orientado a elegir los puntos de vista cuyos glimpses reduzcan más la entropía cruzada de la sonda de segmentación ADE20K.

El entrenamiento se realizó con episodios de 5 glimpses sobre las escenas de entrenamiento de ADE20K, con semilla 6, y el registro completo del run se conserva bajo `training_run/` en el formato original del código. Se seleccionó el paso 7.000 por presentar la menor entropía cruzada media de validación tras los glimpses elegidos por la política: 0,7649, 0,7148, 0,6891, 0,6743 y 0,6658 tras cada glimpse sucesivo. El observador y la sonda ADE20K (`canvit/probe-ade20k-40k-s512-c64-in21k`) permanecen congelados durante el entrenamiento de la política.

## Capacidades

- Selección adaptativa de puntos de vista: puntúa candidatos (centro y escala) y elige el siguiente glimpse a observar.
- Rollout multi-paso: ejecuta secuencias de `num_glimpses` pasos sobre una escena preprocesada.
- Segmentación semántica derivada: el canvas resultante se decodifica a 64 × 64 etiquetas de clases ADE20K mediante la sonda asociada.
- Integración con `canvit-pytorch` (>= 0.3) mediante la clase `LearnedPolicy`.
- Inferencia en CPU soportada explícitamente en el ejemplo de uso.
- No dispone de generación de texto, tool calling, agentes, capacidades multilingües ni modalidades de audio.

## Casos de uso

- Segmentación semántica eficiente en escenas: usar la política para dirigir los glimpses de CanViT-B y obtener un mapa de 64 × 64 clases ADE20K con un número reducido de observaciones, útil cuando el coste de procesar la imagen completa a alta resolución es prohibitivo.
- Visión activa embebida en robótica: integrar la política en un bucle de percepción donde la cámara solo captura regiones seleccionadas, reduciendo ancho de banda y cómputo en plataformas con recursos limitados.
- Investigación en asignación adaptativa de cómputo: servir como referencia reproducible (semilla 6, paso 7.000, registro completo en `training_run/`) para comparar estrategias de selección de puntos de vista.
- Prototipado en CPU: al tener 5,67 M de parámetros y 0,1 GB de repositorio, permite experimentar con visión activa en estaciones de trabajo sin GPU.
- Evaluación de políticas de mirada: usar la curva de entropía cruzada de validación (0,7649 → 0,6658) como métrica de referencia para nuevas políticas entrenadas sobre el mismo observador congelado.
- Docencia y divulgación: ejemplo compacto y de licencia MIT de un pipeline completo de visión activa con observador, sonda y política desacoplados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la entropía cruzada media de validación tras cada glimpse:

| Glimpse | Entropía cruzada de validación |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7148 |
| 3 | 0,6891 |
| 4 | 0,6743 |
| 5 | 0,6658 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 5,67 M de parámetros, los pesos en fp32 ocupan aproximadamente 23 MB, por lo que la política en sí cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas; el ejemplo oficial funciona en CPU (`torch.device("cpu")`).
- GPU consumer: sí, cualquier GPU con suficiente memoria para el observador CanViT-B y la sonda ADE20K, que dominan el coste computacional frente a la política.
- Opciones de despliegue: `canvit-pytorch` (>= 0.3) mediante `uv add`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otras políticas de visión activa comparables ni resultados de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ámbito restringido: la política está entrenada específicamente para el observador CanViT-B congelado y su sonda ADE20K; no es reutilizable con otros observadores o tareas sin reentrenamiento.
- Dependencia de la sonda: el objetivo de Q-learning se define por la reducción de entropía cruzada de la sonda de segmentación, de modo que sus sesgos se heredan.
- Sin capacidades lingüísticas ni generativas: no debe evaluarse como un modelo de texto.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la segmentación puede producir etiquetas erróneas en clases poco representadas de ADE20K.
- Licencia: la política es MIT, pero CanViT se preentrenó por destilación de DINOv3, liberado bajo la DINOv3 License; conviene revisar las condiciones de esa licencia para uso comercial del pipeline completo.
- Idiomas: no disponible; el modelo no procesa texto.
- Producción: no se han publicado métricas de latencia, throughput ni robustez fuera de ADE20K.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s6
- Paper (NeurIPS 2026, arXiv): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Checkpoints del autor: https://huggingface.co/canvit
- Observador base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Dataset: https://huggingface.co/datasets/zhoubolei/scene_parse_150
- DINOv3: https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
