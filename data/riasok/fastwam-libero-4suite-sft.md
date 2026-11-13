# Riasok/fastwam-libero-4suite-sft

## Resumen

FastWAM SFT — LIBERO 4 suites es un checkpoint de política robótica (vision-language-action) publicado por el usuario Riasok en Hugging Face. Se trata de un ajuste fino supervisado (SFT) de `lerobot/fastwam_base`, un modelo base de la familia FastWAM integrado en el ecosistema LeRobot. El modelo está entrenado sobre las cuatro suites del benchmark LIBERO (Spatial, Object, Goal y Long) fusionadas en un único conjunto de datos de 1.712 episodios, 277.713 fotogramas y 40 tareas. Con 6.020.710.599 parámetros y un repositorio de 12 GB, es un modelo de escala media-alta orientado exclusivamente a la manipulación robótica.

La relevancia de esta ficha es doble. Por un lado, documenta un intento de unificar cuatro suites de LIBERO en una sola política, algo poco habitual en la literatura, donde lo común es entrenar políticas especializadas por suite. Por otro, y de forma más importante para quien evalúe el modelo, el propio autor advierte que el rendimiento en LIBERO-Long es de un 3,5 % (7/200 episodios), muy por debajo de lo que cabría esperar de los datos de entrenamiento, y que las suites Object y Goal no se evaluaron. El propio autor recomienda tratar el checkpoint como una base con capacidad para Spatial, no como una política funcional de cuatro suites.

El modelo se distribuye en formato LeRobot `pretrained_model` con pesos safetensors, licencia Apache 2.0 y pipeline `robotics`. No hay información sobre idiomas soportados ni sobre resultados de benchmarks más allá de la evaluación parcial incluida en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política robótica FastWAM sobre LeRobot; experto de acción + experto de vídeo congelado) |
| Parametros totales | 6.020.710.599 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (directorio LeRobot `pretrained_model`) |

## Arquitectura y entrenamiento

FastWAM es una política de tipo vision-language-action construida sobre LeRobot. Según la model card, el modelo parte de `lerobot/fastwam_base` y se ajusta con supervisión sobre las cuatro suites de LIBERO fusionadas en un solo dataset: 1.712 episodios, 277.713 fotogramas y 40 tareas. El entrenamiento se realizó durante 40.000 pasos con batch de 8 por GPU en 2 GPUs y semilla 42; los detalles completos están en `train_config.json` dentro del repositorio.

La innovación técnica destacable es la separación entre un experto de acción y un experto de vídeo. En este ajuste solo se entrena el experto de acción, mientras que el experto de vídeo permanece congelado (`lambda_video = 0`). La inferencia utiliza 10 pasos de denoising con ruido inicial de acción nuevo en cada chunk, y el repositorio incluye un `policy_postprocessor.json` con el paso de conmutación del gripper. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las suites LIBERO, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control robótico de manipulación en entornos LIBERO: genera acciones de brazo y gripper a partir de observaciones visuales.
- Ejecución de tareas de las suites Spatial, Object, Goal y Long de LIBERO, aunque el rendimiento medido solo es aceptable en Spatial.
- Inferencia por chunks de acción con 10 pasos de denoising y ruido inicial nuevo por chunk.
- Postprocesado específico para la conmutación del gripper incluido en el repositorio.
- Integración nativa con el ecosistema LeRobot para carga, evaluación y despliegue.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni modo thinking.

## Casos de uso

- Evaluación de referencia en LIBERO-Spatial: el modelo alcanza un 65,0 % de éxito (130/200 episodios) con 300 pasos de episodio, lo que lo hace utilizable como baseline reproducible para comparar políticas en esa suite.
- Investigación sobre entrenamiento multi-suite: sirve para estudiar por qué fusionar Spatial, Object, Goal y Long degrada el rendimiento en Long hasta el 3,5 %, y para diseñar estrategias de mezcla de datos o de currículo.
- Ablación del experto de vídeo congelado: al entrenar solo el experto de acción (`lambda_video = 0`), el checkpoint permite analizar el coste y el beneficio de congelar el experto de vídeo frente a entrenarlo.
- Reproducción de experimentos: la configuración de entrenamiento (40.000 pasos, batch 8 × 2 GPUs, semilla 42) y el `train_config.json` permiten replicar el ajuste y verificar resultados.
- Base para ajuste fino posterior en tareas concretas: al ser un modelo Apache 2.0 con pesos safetensors y formato LeRobot, puede reutilizarse como punto de partida para políticas especializadas en una sola tarea o suite.
- Integración en pipelines de evaluación LeRobot: el postprocesador del gripper y el formato `pretrained_model` facilitan conectarlo a los scripts de evaluación del ecosistema sin conversiones adicionales.

## Benchmarks y rendimiento

Resultados publicados en la model card. Evaluación con 10 pasos de denoising, ruido inicial de acción nuevo por chunk, estados iniciales deterministas 0–19 y 20 episodios por tarea.

| Suite | Longitud de episodio | Episodios | Éxito |
|---|--:|--:|--:|
| LIBERO-Spatial | 300 | 200 | 65,0 % (130/200) |
| LIBERO-Long (libero_10) | 520 | 200 | 3,5 % (7/200) |
| LIBERO-Object | no disponible | no disponible | no evaluado |
| LIBERO-Goal | no disponible | no disponible | no evaluado |

Éxitos por tarea en Spatial (tareas 0–9, sobre 20 episodios cada una): 14, 15, 16, 15, 10, 9, 17, 16, 10, 8. En Long, los 7 éxitos corresponden todos a la tarea 9. El autor señala que el resultado en Long está muy por debajo de lo que sugerirían los datos de entrenamiento y que no tiene explicación; recomienda tratar el checkpoint como una base con capacidad para Spatial, no como una política funcional de cuatro suites.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 6.020 millones de parámetros en precisión completa (fp32) ocuparía unos 24 GB solo en pesos; en fp16/bf16, unos 12 GB, que coincide con el tamaño del repositorio. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no disponibles. El entrenamiento se realizó con 2 GPUs y batch 8 por GPU, pero no se especifica el modelo de GPU.
- ¿Cabe en GPU de consumo? No confirmado. Con pesos en bf16 (unos 12 GB) podría caber en GPUs de consumo con 16 GB o más de VRAM, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: el formato es un directorio LeRobot `pretrained_model`, por lo que el despliegue natural es mediante la librería LeRobot. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a una política robótica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Riasok/fastwam-libero-4suite-sft | 6.020.710.599 | no disponible | Spatial 65,0 %; Long 3,5 %; Object y Goal sin evaluar | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| lerobot/fastwam_base | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base citado) |
| Otras políticas LIBERO | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de `lerobot/fastwam_base` ni de otras políticas comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Rendimiento muy bajo en LIBERO-Long: 3,5 % (7/200 episodios), con todos los éxitos concentrados en la tarea 9. El autor no encuentra explicación y desaconseja usar el checkpoint como política de cuatro suites.
- Las suites Object y Goal no se evaluaron, por lo que no hay evidencia de su rendimiento real.
- El modelo solo se ha entrenado y evaluado en entornos LIBERO simulados; no hay datos de transferencia a robots reales.
- El experto de vídeo está congelado (`lambda_video = 0`), lo que limita la adaptación de la representación visual al dominio de las cuatro suites.
- Riesgo de sobreajuste a los estados iniciales deterministas 0–19 usados en la evaluación; no se documenta evaluación con estados aleatorios.
- No se documentan sesgos conocidos ni riesgos de alucinación en el sentido textual, al no ser un modelo de lenguaje general.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación en Object y Goal y el bajo rendimiento en Long hacen arriesgado su uso en producción sin una validación previa.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación independiente.
- No se dispone de información sobre idiomas, cuantizaciones ni latencia, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Riasok/fastwam-libero-4suite-sft
- Modelo base citado: https://huggingface.co/lerobot/fastwam_base
