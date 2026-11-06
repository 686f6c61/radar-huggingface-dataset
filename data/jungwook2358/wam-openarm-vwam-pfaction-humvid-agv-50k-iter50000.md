# jungwook2358/wam-openarm-vwam-pfaction-humvid-agv-50k-iter50000

## Resumen

`wam-openarm-vwam-pfaction-humvid-agv-50k-iter50000` es un checkpoint de investigación en robótica publicado por el usuario jungwook2358 en Hugging Face. Se trata de un modelo de política visomotora (vision-language-action, VLA) construido sobre el backbone Cosmos3-Nano MoT, entrenado para el robot OpenArm con una variante arquitectónica denominada `motion-pfaction-humvid`. El modelo combina un flujo de vídeo/acción con un flujo auxiliar de "pointflow" que representa 12 puntos de la mano proyectados a 24 offsets futuros, y cuya única función es alimentar el flujo de acción.

La innovación principal respecto a la versión base (junhyeong's pointflow run) es que el flujo de acción atiende exclusivamente al flujo de pointflow: el ActionDiT se reduce a 4 bloques con dimensión oculta 1024, y cada bloque atiende a sus propias filas de acción más las claves y valores del bloque correspondiente del pointflow. El backbone de vídeo/VLM ya no se lee directamente desde el flujo de acción, lo que reduce el coste computacional de la política y obliga a que toda la información visual relevante pase por la representación de puntos de la mano.

El modelo se distribuye como checkpoint de entrenamiento en formato DCP (torch distributed checkpoint) con un tamaño de repositorio de 91,7 GB, entrenado durante 50 000 iteraciones con seed 42, learning rate 1e-4 y un scheduler coseno con warmup de 2500 pasos. Es relevante como artefacto de investigación reproducible para quienes trabajen en políticas robóticas con representaciones intermedias estructuradas (puntos de mano) y en el ecosistema OpenArm/Cosmos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone Cosmos3-Nano MoT (Mixture of Transformers) + ActionDiT de 4 bloques (hidden 1024) + flujo pointflow (12 puntos x 24 offsets, 4 etapas, ancho 256) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se especifica si el backbone es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint DCP en precisión de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada, ver model card) |
| Formato de pesos | torch DCP (`iter_000050000/model`, incluye EMA), más `scheduler/`, `trainer/`, `config.yaml`, `config.pkl`, `normalization.json` |

## Arquitectura y entrenamiento

El modelo parte del backbone Cosmos3-Nano MoT inicializado desde `/data/checkpoints/Cosmos3-Nano-DCP`. Sobre él se añade un ActionDiT entrenado desde cero, reducido a 4 bloques con dimensión oculta 1024. La modificación clave respecto a la variante base es que el flujo de acción solo atiende al flujo de pointflow: cada bloque k del ActionDiT lee las K/V del bloque k del pointflow mediante una proyección 256→1024 con LayerNorm por bloque (parámetros `action_dit.pflow_kv.*`). Las K/V del backbone de vídeo/VLM no son leídas por el flujo de acción.

El flujo de pointflow representa 12 puntos de mano con 24 offsets futuros, organizados en 4 etapas de ancho 256, y lee las capas 3, 5, 7 y 9 del backbone. Se añade ruido en cada muestra según su propio sigma de vídeo/acción (schedule compartido) y se entrena con su propia pérdida de flow-matching con peso 0,2. La pérdida de acción llega al backbone únicamente a través del pointflow, lo que convierte al pointflow en el cuello de botella informativo del sistema.

Los datos de entrenamiento siguen la receta `motion-humvid`: 6 subconjuntos robóticos y 4 subconjuntos humanos como filas solo de vídeo (se excluye la fuente de cajas), con exactamente 8 muestras de robot y 8 humanas por GPU, batch b64, 50 000 iteraciones, seed 42, learning rate 1e-4 con warmup de 2500 pasos y decaimiento coseno hasta el 10 %. La acción robótica es de 28 dimensiones: brazos relativos al estado actual, cuello y manos absolutos. El runtime de referencia es `vwam-openarm-resume-20261103-v1` (jun-brro/RLDX-2-VWAM junhyeong-h2rb@10f82db con cambios locales) más el parche `pflow_action_l4.patch` de la rama `jungwook/openarm-fred-ft`.

## Capacidades

- Generación de acciones robóticas de 28 dimensiones para el robot OpenArm (brazos relativos, cuello y manos absolutos).
- Predicción de trayectorias de puntos de mano (12 puntos x 24 offsets futuros) como representación intermedia estructurada.
- Procesamiento conjunto de flujos de vídeo y acción mediante flow-matching con schedule compartido.
- Aprendizaje de datos mixtos robot + humano (6 subconjuntos robóticos y 4 humanos como vídeo).
- Inferencia requiere el flujo de pointflow activo (12 puntos actuales más denoising conjunto de flujo y acción); no es compatible con la ruta de serving de junhyeong.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni razonamiento simbólico; es un modelo específicamente robótico.

## Casos de uso

- Investigación en políticas visomotoras: servir como checkpoint reproducible para estudiar el efecto de condicionar el flujo de acción exclusivamente al pointflow, comparando contra la variante base con atención al backbone.
- Manipulación con OpenArm en laboratorio: generar comandos articulares de 28 dimensiones (brazos, cuello y manos) para tareas de alcance y agarre, normalizando las salidas con `normalization.json`.
- Estudio de representaciones intermedias: analizar si los puntos de mano aprendidos capturan información suficiente para la política, midiendo degradación al sustituir el flujo de pointflow por el backbone.
- Aprendizaje con datos humanos: aprovechar la receta `humvid` (4 subconjuntos humanos como vídeo) para evaluar transferencia de demostraciones humanas a control robótico.
- Benchmarking de arquitecturas ligeras de acción: el ActionDiT de 4 bloques permite medir el coste/rendimiento de reducir la atención del flujo de acción frente a alternativas más pesadas.
- Reproducción de experimentos: el repositorio incluye `config.yaml`, `config.pkl` y `scheduler/`, lo que permite reanudar o auditar el entrenamiento con el runtime y el parche indicados.
- Base para fine-tuning en tareas concretas del OpenArm: al estar entrenado desde cero el ActionDiT y conservar el backbone Cosmos3-Nano, es un punto de partida para adaptaciones posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de búsqueda no incluyen métricas de éxito de tarea, MMLU, HumanEval, GSM8K ni evaluaciones de manipulación (tasa de éxito, error de posición, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 91,7 GB e incluye el checkpoint completo con EMA, scheduler y trainer; el checkpoint de modelo es la parte dominante y no se publica una estimación de memoria de inferencia.
- GPU recomendadas: no disponible. Dado el tamaño del backbone Cosmos3-Nano y el checkpoint de 91,7 GB, es razonable esperar GPUs de centro de datos (A100/H100) para carga completa, pero no se confirma en la información.
- Compatibilidad con GPU de consumo: no disponible; no se documenta cuantización ni formato GGUF que permita ejecución en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el formato es DCP de PyTorch, por lo que requiere cargador específico del runtime `vwam-openarm-resume-20261103-v1`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wam-openarm-vwam-pfaction-humvid-agv-50k-iter50000 | no disponible | no disponible | no disponible | other | Hugging Face (jungwook2358) |
| wam-openarm-rel28-rh-cog-humvid-ema-50k-ckpt50000 | no disponible | no disponible | no disponible | no disponible | Hugging Face (jungwook2358) |
| wam-openarm-rel28-rh-base-ema-50k-ckpt50000 | no disponible | no disponible | no disponible | no disponible | Hugging Face (jungwook2358) |

Los dos checkpoints comparables pertenecen al mismo autor y familia (salidas de 28 dimensiones, sin FK/IK, normalización con `statistics.json`), pero la información disponible no permite comparar parámetros, contexto ni rendimiento entre ellos.

## Limitaciones y advertencias

- La licencia es `other`; no se detallan los términos, por lo que el uso comercial requiere revisar la model card y contactar con el autor.
- El modelo está entrenado específicamente para el robot OpenArm con acción de 28 dimensiones; no es transferible directamente a otras morfologías sin reentrenamiento.
- La inferencia depende del flujo de pointflow (12 puntos actuales y denoising conjunto); no funciona con la ruta de serving de junhyeong ni con pipelines estándar de VLA.
- No se publican métricas de rendimiento ni evaluaciones de éxito, por lo que no hay evidencia cuantitativa de calidad en tareas reales.
- El checkpoint incluye EMA tal como lo guardó el entrenador y excluye el optimizador; no es un artefacto listo para producción sin trabajo de integración.
- Riesgo de alucinación y sesgos: no documentado; al ser un modelo de acción sobre datos mixtos robot/humano, puede heredar sesgos de distribución de los subconjuntos de entrenamiento.
- Idiomas soportados: no disponible; no se documenta procesamiento de lenguaje natural.
- El repositorio pesa 91,7 GB, lo que dificulta su descarga y despliegue en entornos con almacenamiento limitado.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/wam-openarm-vwam-pfaction-humvid-agv-50k-iter50000
- Checkpoint relacionado: https://huggingface.co/jungwook2358/wam-openarm-rel28-rh-cog-humvid-ema-50k-ckpt50000
- Checkpoint relacionado: https://huggingface.co/jungwook2358/wam-openarm-rel28-rh-base-ema-50k-ckpt50000
