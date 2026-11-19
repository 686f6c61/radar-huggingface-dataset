# canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s5

## Resumen

`qpolicy-ade20k-c64-t5-qband-2026-07-04-s5` es una política de visión aprendida (learned viewing policy) entrenada por el autor `canvit` para el modelo de visión activa CanViT-B (Canvas Vision Transformer). No es un modelo de lenguaje ni un generador de texto: es un módulo de refuerzo que decide hacia dónde mirar a continuación. Dado un lienzo (canvas) de 64 × 64 donde CanViT-B va acumulando lo que ha visto de una escena, la política puntúa candidatos de viewpoint y selecciona el de mayor puntuación; CanViT-B mira entonces esa región de la imagen original.

El modelo se entrena mediante Q-learning sobre escenas de ADE20K (dataset `zhoubolei/scene_parse_150`) con episodios de 5 glimpses, optimizando que las regiones elegidas minimicen la entropía cruzada del probe de segmentación ADE20K que lee el canvas. Es, por tanto, un componente de un pipeline mayor de segmentación semántica activa: en lugar de procesar la imagen completa a resolución alta, el sistema la inspecciona selectivamente, reduciendo el coste computacional por escena.

Con 5.674.904 parámetros y un repo de 0,1 GB, es un checkpoint pequeño y ligero, pensado para ejecutarse junto al observador congelado CanViT-B y su probe. Su relevancia actual reside en que forma parte de la línea de investigación de modelos fundacionales de visión activa presentada en NeurIPS 2026, donde el modelo decide activamente qué observar en lugar de consumir píxeles de forma pasiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de Q-learning sobre el canvas de un Vision Transformer (CanViT-B); no es un transformer generativo |
| Parametros totales | 5.674.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje); escenas de 512 px, glimpses de 128 px, canvas de 64 × 64 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política opera sobre el estado del canvas de CanViT-B, un modelo de visión activa que observa una escena a través de una secuencia de glimpses y la memoriza en un canvas de escena. La política puntúa candidatos de viewpoint definidos por 16 × 16 centros en cada una de dos escalas (0,5 y 0,25) y selecciona el de mayor puntuación. El observador (CanViT-B base `canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`) y su probe ADE20K (`probe-ade20k-40k-s512-c64-in21k`) permanecen congelados durante el entrenamiento de la política.

El entrenamiento usa Q-learning con episodios de 5 glimpses sobre las escenas de entrenamiento de ADE20K, con semilla 5. El objetivo es elegir los viewpoints cuyos glimpses reduzcan más la entropía cruzada del probe de segmentación. El checkpoint seleccionado es el paso 4.000, escogido por la menor entropía cruzada media de validación en ADE20K tras los glimpses elegidos por la política. La entropía cruzada de validación tras cada glimpse fue de 0,7649, 0,7149, 0,6875, 0,6736 y 0,6645 respectivamente, lo que muestra una mejora monotónica a medida que la política acumula información en el canvas.

## Capacidades

- Selección activa de viewpoints: puntúa candidatos de región y decide el siguiente glimpse a observar.
- Segmentación semántica indirecta: combinada con CanViT-B y su probe ADE20K, produce mapas de 64 × 64 con las clases de ADE20K.
- Rollout multi-paso: ejecuta secuencias de `num_glimpses` pasos sobre una escena de 512 px.
- Operación sobre observador congelado: no requiere reentrenar CanViT-B ni el probe.
- Ejecución en CPU: la model card muestra inferencia con `torch.device("cpu")`.
- No soporta generación de texto, tool calling, agentes lingüísticos ni capacidades multilingües.

## Casos de uso

- Segmentación semántica eficiente en escenas: en lugar de procesar la imagen completa a alta resolución, la política dirige los glimpses a las regiones informativas, reduciendo el coste por escena en pipelines de percepción.
- Investigación en visión activa: sirve como referencia reproducible (semilla 5, paso 4.000) para comparar políticas de selección de viewpoints frente a estrategias aleatorias o de barrido uniforme.
- Prototipado de sistemas de percepción con presupuesto limitado: útil cuando el número de lecturas de alta resolución por imagen está acotado (por ejemplo, cámaras con ancho de banda restringido).
- Evaluación de probes de segmentación: permite medir cómo evoluciona la entropía cruzada del probe a medida que se añaden glimpses, útil para estudiar la curva de rendimiento frente al número de observaciones.
- Docencia y reproducción de experimentos de RL aplicado a visión: el repo incluye el registro completo del entrenamiento en `training_run/`, lo que facilita auditar y replicar el proceso.
- Integración en sistemas de robótica o inspección visual: como módulo de decisión de "dónde mirar" dentro de un pipeline mayor que combine CanViT-B con tareas posteriores de segmentación o detección.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las entropías cruzadas de validación de ADE20K tras cada glimpse:

| Glimpse | Entropia cruzada de validacion (ADE20K) |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7149 |
| 3 | 0,6875 |
| 4 | 0,6736 |
| 5 | 0,6645 |

No se han publicado resultados comparativos con otras políticas (por ejemplo, selección aleatoria o barrido) en la información disponible, ni métricas como mIoU.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint pesa 0,1 GB y tiene 5,67 M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer. La model card demuestra ejecución en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con suficiente memoria para el observador CanViT-B (que es el componente pesado del pipeline) es válida.
- Cabe en GPU consumer: sí, sin problema para la política; el límite real lo impone CanViT-B y el probe.
- Opciones de despliegue: librería `canvit-pytorch` (>= 0.3), instalable con `uv add "canvit-pytorch>=0.3"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas de visión activa comparables con las que establecer una comparación de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- No es un modelo de propósito general: solo tiene sentido junto al observador CanViT-B concreto y al probe ADE20K con los que fue entrenado; no es intercambiable con otros backbones.
- Entrenada exclusivamente sobre ADE20K: su comportamiento fuera de ese dominio de escenas no está caracterizado.
- Sin datos de sesgo, robustez ni alucinación: no se han publicado análisis de sesgos ni evaluaciones fuera de la entropía cruzada de validación.
- Licencia MIT para el checkpoint, pero CanViT se preentrena por destilación de DINOv3, que se distribuye bajo la DINOv3 License; conviene revisar las condiciones de esa licencia para uso comercial del pipeline completo.
- Los ficheros en el formato original del código de entrenamiento están en la revisión `original-format`; `canvit-pytorch` lee los de `main`, por lo que hay que usar la revisión correcta.
- Sin capacidades lingüísticas ni multilingües: no aplica el uso como modelo de texto.
- Semilla y paso fijos (semilla 5, paso 4.000): la variabilidad entre semillas no está documentada en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/qpolicy-ade20k-c64-t5-qband-2026-07-04-s5
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Checkpoints CanViT: https://huggingface.co/canvit
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Probe ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Dataset: https://huggingface.co/datasets/zhoubolei/scene_parse_150
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
