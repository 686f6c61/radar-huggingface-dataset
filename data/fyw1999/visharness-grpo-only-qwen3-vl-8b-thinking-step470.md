# fyw1999/VisHarness-GRPO-Only-Qwen3-VL-8B-Thinking-step470

## Resumen

VisHarness-GRPO-Only-Qwen3-VL-8B-Thinking-step470 es un ajuste fino del modelo multimodal Qwen/Qwen3-VL-8B-Thinking, desarrollado por el usuario fyw1999, orientado a tareas de razonamiento visual agéntico con uso de herramientas (tool-use). El modelo forma parte de la familia VisHarness y corresponde, segun su model card, a la variante "VisHarness-RL (only RL)" del articulo asociado: se entrena directamente con GRPO sobre el checkpoint base, sin la etapa previa de SFT de arranque en frio (cold-start) que caracteriza a la variante completa VisHarness.

El modelo hereda la arquitectura transformer multimodal de Qwen3-VL-8B-Thinking, con aproximadamente 8.767 millones de parametros (8,77 mil millones) en pesos BF16, y se distribuye como checkpoint completo (no como adaptador LoRA), con tokenizer, processor, chat template y configuracion de generacion incluidos. Su proposito es coordinar herramientas visuales especializadas (PhraseToPoint, PhraseToBoxMask, PointToBoxMask, SplitImageIntoPatches, SuperResolution y MergeBoxMask) en tareas de segmentacion referencial, grounding y razonamiento visual multi-turno.

Es relevante ahora porque ejemplifica una tendencia creciente: el uso de aprendizaje por refuerzo (GRPO) para entrenar agentes multimodales que delegan en herramientas externas en lugar de resolver todo con el modelo base. El checkpoint publicado corresponde al paso global 470 de un run concreto y se selecciono por su recompensa media de validacion, lo que lo convierte en un artefacto de investigacion reproducible mas que en un modelo listo para produccion sin infraestructura adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), vision-lenguaje con modo thinking |
| Parametros totales | 8.767.123.696 (~8,77 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (750 tensores, todos BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Thinking, un transformer multimodal que procesa imagenes y texto y que incorpora un modo de razonamiento explicito (thinking). Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) directamente, sin etapa previa de SFT de VisHarness. El entrenamiento utiliza 4.499 pares imagen-texto procedentes de los conjuntos GRES, REC-8K y ReasonSeg, y emplea 8 grupos de prompts retenidos por actualizacion con 8 trayectorias muestreadas por prompt, filtro por desviacion estandar de recompensa con umbral 0,2, ponderacion de gradiente de politica con peso total de trayectoria igualado y tasa de aprendizaje constante de 1e-6. La recompensa a nivel de paso visual y la penalizacion por numero de turnos estan desactivadas.

El checkpoint corresponde al paso 470 del run `3k0xsovu`, seleccionado por tener la mayor recompensa media de validacion (`val-core/evaluation_reward_mean` = 2,2091) entre las validaciones guardadas. La validacion usa un subconjunto fijo de 300 ejemplos (100 de GRES, 100 de ReasonSeg y 100 de REC-8K) con una trayectoria muestreada por ejemplo, temperatura 0,6, top_p 0,95, top_k 20 y hasta 2048 tokens de salida por turno. No se incluyen estados de optimizador ni de reanudacion.

## Capacidades

- Razonamiento visual multi-turno con coordinacion de herramientas especializadas: PhraseToPoint, PhraseToBoxMask, PointToBoxMask, SplitImageIntoPatches, SuperResolution y MergeBoxMask.
- Segmentacion referencial (referring expression segmentation) mediante mascaras generadas a partir de expresiones en lenguaje natural.
- Grounding visual y localizacion de objetos a partir de descripciones textuales.
- Razonamiento explicito en modo thinking heredado de Qwen3-VL-8B-Thinking.
- Uso de herramientas (tool calling) dentro de un bucle agéntico, siempre que se disponga del runner de trayectorias y de los servicios de expertos visuales de VisHarness.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Segmentacion referencial en pipelines de anotacion: el modelo puede recibir una imagen y una frase descriptiva y coordinar PhraseToBoxMask para producir una mascara del objeto referido, util en etiquetado semiautomatico de datasets.
- Grounding visual para busqueda y recuperacion: dado un catalogo de imagenes, usar PhraseToPoint y PointToBoxMask para localizar objetos descritos en texto y devolver coordenadas o regiones.
- Investigacion en aprendizaje por refuerzo para agentes multimodales: el checkpoint sirve como referencia reproducible para comparar GRPO puro frente a SFT+GRPO en tareas de razonamiento visual con herramientas.
- Analisis de imagenes de alta resolucion: emplear SplitImageIntoPatches y SuperResolution para dividir y ampliar regiones antes de aplicar herramientas de segmentacion sobre detalles finos.
- Evaluacion de sistemas agénticos visuales: integrar el modelo en el runner de VisHarness y medir metricas gIoU, cIoU, MAE y RMSE sobre subconjuntos de validacion con las mismas herramientas y prompts del autor.
- Prototipado de asistentes visuales con razonamiento explicito: el modo thinking permite inspeccionar cadenas de razonamiento antes de la llamada a herramienta, util para depurar agentes en entornos de investigacion.
- Composicion de mascaras en tareas de edicion o analisis: usar MergeBoxMask para combinar regiones generadas por varias herramientas en una unica mascara final.

## Benchmarks y rendimiento

Resultados de validacion en subconjunto (300 ejemplos, una trayectoria por ejemplo), segun la model card:

| Tarea | Metrica | Valor |
|---|---|---|
| GRES | gIoU / cIoU | 65,03% / 65,27% |
| ReasonSeg | gIoU / cIoU | 71,92% / 56,87% |
| REC-8K | MAE / RMSE | 8,28 / 15,52 |

Estos resultados corresponden a validacion muestreada sobre subconjuntos, no a conjuntos de test completos, y la seleccion del checkpoint se basa en la recompensa media de validacion, no en el mejor resultado por tarea. No se han publicado comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 17,5 GB solo para pesos, mas memoria para activaciones y cache KV; en la practica se recomienda al menos 24 GB de VRAM para inferencia comoda en BF16.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16 con margen ajustado; para cuantizacion a 8 bits o 4 bits se requeriria conversion propia, ya que no se publican pesos cuantizados.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con cuidado en la longitud de contexto y el numero de turnos; en GPUs de 16 GB seria necesario cuantizar.
- Opciones de despliegue: transformers (libreria declarada), con posibilidad de servir mediante vLLM o TGI si la arquitectura Qwen3-VL esta soportada por esas herramientas; llama.cpp y Ollama no estan confirmados para esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VisHarness-GRPO-Only-Qwen3-VL-8B-Thinking-step470 | ~8,77 mil millones | no disponible | Agente visual con tool-use, GRPO sin SFT | apache-2.0 | HuggingFace (25 descargas) |
| VisHarness-SFT-Only-Qwen3-VL-8B-Thinking | ~8,77 mil millones (heredado) | no disponible | SFT solo, paso 105 | apache-2.0 | HuggingFace |
| VisHarness-SFT-GRPO-Qwen3-VL-8B-Thinking-step550 | ~8,77 mil millones (heredado) | no disponible | SFT seguido de GRPO, paso 550 | apache-2.0 | HuggingFace |
| Qwen/Qwen3-VL-8B-Thinking | ~8,77 mil millones | no disponible | Modelo base multimodal con thinking | apache-2.0 | HuggingFace |

Las tres variantes VisHarness comparten base y tamano; la diferencia esta en la etapa de entrenamiento (SFT, GRPO puro o SFT+GRPO). No se dispone de datos de rendimiento comparativos entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- El rendimiento depende criticamente de los expertos visuales y de la realimentacion de las herramientas; cargar solo los pesos no ejecuta herramientas.
- El agente puede producir llamadas invalidas o predicciones incorrectas; debe evaluarse con las herramientas de validacion y evaluacion del repositorio fuente.
- Los resultados publicados son de validacion en subconjunto, no de test completo, y la seleccion del checkpoint optimiza la recompensa media, no cada tarea por separado.
- Idioma limitado al ingles segun la model card; no se declara soporte multilingue.
- Riesgo de alucinacion inherente a los modelos de lenguaje y vision-lenguaje, agravado en tareas de grounding donde una coordenada erronea puede propagarse a traves de las herramientas.
- La licencia Apache-2.0 cubre el modelo, pero la model card no concede derechos adicionales de redistribucion sobre los datasets de terceros ni sobre los modelos expertos visuales utilizados.
- Es un artefacto de investigacion con muy poca adopcion (25 descargas, 0 likes); no hay evidencia de uso en produccion ni soporte de la comunidad.
- No se publican pesos cuantizados ni datos de contexto maximo, lo que complica la planificacion de despliegues con requisitos estrictos de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fyw1999/VisHarness-GRPO-Only-Qwen3-VL-8B-Thinking-step470
- Checkpoint SFT-Only: https://huggingface.co/fyw1999/VisHarness-SFT-Only-Qwen3-VL-8B-Thinking
- Checkpoint SFT-GRPO step550: https://huggingface.co/fyw1999/VisHarness-SFT-GRPO-Qwen3-VL-8B-Thinking-step550
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking
- Repositorio fuente VisHarness: https://github.com/fyw1999/VisHarness
