# canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s7

## Resumen

`pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s7` es una política de visión aprendida (learned viewing policy) para CanViT-B, un modelo de visión activa desarrollado por el grupo CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna), presentado en NeurIPS 2026. No es un modelo de lenguaje ni un modelo generativo: es un módulo de decisión que, dado el estado de un canvas visual de 64 × 64, puntúa posibles puntos de vista candidatos y selecciona el siguiente glimpse que el modelo base CanViT-B debe observar. El problema que resuelve es el de la selección activa de información: en lugar de procesar una imagen completa a resolución fija, el sistema decide dónde mirar para maximizar la reducción de incertidumbre de una tarea concreta, en este caso la segmentación semántica sobre ADE20K.

El checkpoint se entrena mediante REINFORCE sobre escenas de 512 px con glimpses de 128 px, y se evalúa con una sonda (probe) de segmentación ADE20K congelada que lee el canvas. Con solo 5.543.447 parámetros (5,5 M) y un repo de 0,1 GB, es un componente ligero que se acopla a un backbone congelado mucho mayor. Su relevancia actual reside en que ejemplifica el paradigma de visión activa: modelos que controlan su propio muestreo visual, con aplicaciones en robótica, inspección y sistemas con presupuesto computacional limitado por imagen.

La licencia es MIT, aunque el modelo base CanViT se destila de DINOv3, lo que introduce condiciones adicionales derivadas de la licencia de DINOv3. El checkpoint fue creado el 7 de julio de 2026 y actualizado el 19 de noviembre de 2026, con 61 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de puntuación de viewpoints sobre canvas de Vision Transformer (CanViT-B congelado) |
| Parámetros totales | 5.543.447 (5,5 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje); canvas de 64 × 64, escenas de 512 px, glimpses de 128 px |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de lenguaje) |
| Licencia | MIT (modelo base CanViT derivado de DINOv3, con su propia licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política opera sobre el canvas de un CanViT-B congelado (`canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`) y sobre la sonda de segmentación ADE20K congelada (`probe-ade20k-40k-s512-c64-in21k`). En cada paso, la política puntúa candidatos definidos por 16 × 16 centros en cada una de dos escalas (0,5 y 0,25), y CanViT-B observa a continuación el candidato con mayor puntuación. El estado sobre el que decide es el canvas de 64 × 64 que acumula la información de los glimpses previos.

El entrenamiento usa REINFORCE con episodios de 5 glimpses sobre las escenas de entrenamiento de ADE20K, con semilla 7. La recompensa se define implícitamente como la reducción de la entropía cruzada de la sonda de segmentación: la política aprende a elegir los viewpoints cuyos glimpses reducen más la cross-entropy del probe. El paso seleccionado es el 6.000, escogido por tener la menor cross-entropy media de validación en ADE20K tras los glimpses elegidos por la política. La cross-entropy de validación tras cada glimpse es 0,7649, 0,7152, 0,6878, 0,6747 y 0,6657 para los glimpses 1 a 5, lo que muestra una mejora monótona y decreciente. El registro completo del entrenamiento se conserva en `training_run/` en el formato original del código.

## Capacidades

- Selección activa de viewpoints: puntúa candidatos y elige el siguiente glimpse a observar sobre el canvas.
- Rollout multi-glimpse: ejecuta episodios de 5 glimpses (escena completa más las elecciones de la política).
- Integración con segmentación semántica ADE20K: el canvas resultante se decodifica a 64 × 64 etiquetas de las 150 clases de ADE20K mediante la sonda congelada.
- Operación sobre escenas de 512 px con glimpses de 128 px y canvas de 64 × 64.
- No soporta tool calling, function calling, agentes de texto, razonamiento lingüístico ni capacidades multilingües.
- No es un modelo generativo de texto ni de imagen; su salida es una distribución de puntuaciones sobre viewpoints candidatos.

## Casos de uso

- Segmentación semántica con presupuesto de cómputo limitado: en lugar de procesar la imagen completa a alta resolución, la política selecciona 5 glimpses de 128 px que concentran la información útil para la sonda ADE20K, reduciendo el coste por imagen en sistemas embebidos o de bajo consumo.
- Robótica de inspección: un brazo o dron con cámara móvil puede usar la política para decidir hacia dónde apuntar en cada paso, maximizando la reducción de incertidumbre de la segmentación de la escena.
- Sistemas de visión con fóvea: aplicaciones de realidad aumentada o cámaras con resolución no uniforme que necesitan decidir qué región muestrear a alta resolución y cuál a baja.
- Investigación en visión activa: base reproducible (semilla 7, registro de entrenamiento completo) para comparar estrategias de selección de viewpoints y objetivos de recompensa alternativos.
- Preprocesado selectivo en pipelines de percepción: filtrar qué regiones de una imagen grande merecen procesamiento posterior con modelos más caros, usando la política como mecanismo de atención aprendida.
- Evaluación de sondas de representación: estudiar cómo la calidad de las representaciones del canvas de CanViT-B condiciona la utilidad de los glimpses elegidos, con métricas de cross-entropy por paso.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las cross-entropy de validación de ADE20K tras cada glimpse elegido por la política en el paso 6.000:

| Glimpse | Cross-entropy de validación (ADE20K) |
|---|---|
| 1 | 0,7649 |
| 2 | 0,7152 |
| 3 | 0,6878 |
| 4 | 0,6747 |
| 5 | 0,6657 |

No se han publicado resultados comparativos con otras políticas de viewpoints ni métricas estándar (mIoU, accuracy) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint pesa 0,1 GB y tiene 5,5 M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer. El consumo real lo domina el CanViT-B congelado y la sonda ADE20K, no la política.
- GPU recomendadas: cualquier GPU con suficiente memoria para el backbone CanViT-B; para la política en sí, CPU es viable (el ejemplo de la model card usa `torch.device("cpu")`).
- Cabe en GPU consumer: sí, incluidas RTX 3060, RTX 4090 y similares, siempre que el backbone quepa.
- Opciones de despliegue: librería `canvit-pytorch>=0.3` (instalable con `uv add`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas de visión activa comparables con las que establecer una comparación de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Específica de ADE20K: la política se entrena y evalúa con la sonda de segmentación ADE20K; su utilidad fuera de esa tarea o de ese dominio de escenas no está validada.
- Acoplada a un backbone concreto: requiere el CanViT-B `canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02` y la sonda `probe-ade20k-40k-s512-c64-in21k` con los que fue entrenada; no es un componente autónomo.
- Presupuesto fijo de 5 glimpses: el comportamiento fuera de ese régimen (más o menos pasos) no está documentado.
- Riesgo de sesgo heredado: al depender de DINOv3 y de ADE20K, puede heredar sesgos de dominio y de distribución de escenas de ambos.
- Riesgo de selección subóptima: la política es una aproximación entrenada con REINFORCE; no garantiza la elección óptima de viewpoints y puede fallar en escenas atípicas.
- Licencia: el checkpoint es MIT, pero el modelo base CanViT se destila de DINOv3, cuya licencia (DINOv3 License) impone condiciones adicionales que deben revisarse antes de uso comercial.
- No es un modelo de lenguaje: no debe esperarse generación de texto, razonamiento lingüístico, tool calling ni capacidades multilingües.
- Reproducibilidad: el registro de entrenamiento está en el formato original del código bajo `original-format`; la lectura con `canvit-pytorch` usa los ficheros de `main`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canvit/pgpolicy-ade20k-c64-t5-floorband-2026-07-07-s7
- Modelo base CanViT-B: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Sonda ADE20K: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- Dataset ADE20K (scene_parse_150): https://huggingface.co/datasets/zhoubolei/scene_parse_150
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Repositorio DINOv3: https://github.com/facebookresearch/dinov3
