# mlnha/gr00t-n15-pnp108-n15base_filt_ars_10k

## Resumen

`mlnha/gr00t-n15-pnp108-n15base_filt_ars_10k` es un checkpoint de investigación derivado de `nvidia/GR00T-N1.5-3B`, el modelo fundacional de visión-lenguaje-acción (VLA) de NVIDIA para robótica. El autor, `mlnha`, lo ha ajustado mediante clonación de comportamiento (behavior cloning, BC) sobre 108 rollouts generados en el simulador RoboCasa365 para la tarea PickPlaceCounterToCabinet, de los cuales 72 fueron exitosos.

El interés del checkpoint no reside en su rendimiento absoluto sino en el método: filtra los segmentos de entrenamiento según un estimador de progreso de tarea basado en ARS (Augmented Random Search), conservando únicamente los fragmentos de 16 fotogramas con delta de progreso positivo. Es un experimento sobre cómo las señales de progreso aprendidas pueden mejorar la calidad de los datos de BC en manipulación robótica.

El repositorio ocupa 37,9 GB y contiene pesos en safetensors más logs de entrenamiento (TensorBoard) y el `train.log`, sin estados del optimizador. No se han publicado resultados de benchmarks generales ni una model card con licencia o idiomas; los únicos datos de rendimiento son las tasas de éxito en simulación reportadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en `nvidia/GR00T-N1.5-3B`; detalles internos no disponibles |
| Parametros totales | 3B (heredados del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.5-3B`, un VLA de 3.000 millones de parámetros que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para generar comandos motores a partir de observaciones e instrucciones. El ajuste se realizó con clonación de comportamiento pura sobre el embodiment `new_embodiment`, es decir, adaptando el modelo a un robot distinto del original.

Los datos proceden de la tarea PickPlaceCounterToCabinet de RoboCasa365: 108 rollouts generados con el checkpoint-120000 del propio GR00T, en formato LeRobot v2.1, de los cuales 72 culminaron con éxito. El filtrado ARS descarta los fragmentos de 16 fotogramas cuyo delta de progreso estimado no es positivo, de modo que el entrenamiento solo ve segmentos que el estimador considera que avanzan la tarea. El entrenamiento usó una GPU, batch de 64, learning rate 3e-5 con schedule coseno (warmup 0,05) y semilla 42. No se especifica el número total de tokens ni si hubo RLHF o DPO; el nombre del checkpoint (`10k`) sugiere 10.000 pasos de optimización.

## Capacidades

- Control robótico por imitación: genera acciones para la tarea PickPlaceCounterToCabinet a partir de observaciones visuales.
- Clonación de comportamiento condicionada por instrucción, heredada de la interfaz VLA del modelo base.
- Adaptación a un embodiment nuevo (`new_embodiment`) mediante fine-tuning.
- Evaluación en simulación RoboCasa365 con semillas de escena 2000 en adelante y semilla de política 1.
- No hay evidencia en la información disponible de soporte de tool calling, agentes multi-paso, capacidades multilingües, visión general, audio o modo de razonamiento explícito.

## Casos de uso

- Investigación en filtrado de datos para BC: sirve como punto de comparación frente a checkpoints entrenados sin filtro ARS para medir el impacto de la selección de segmentos en la tasa de éxito.
- Reproducción de experimentos de manipulación en RoboCasa365: el `train.log` y los eventos de TensorBoard permiten auditar curvas de entrenamiento y comparar con otras semillas.
- Estudio de estimadores de progreso de tarea: el criterio ARS usado para filtrar puede evaluarse de forma aislada frente a alternativas como clasificadores de éxito o recompensas aprendidas.
- Baseline para fine-tuning en tareas de pick-and-place: al partir de un VLA de 3B ya ajustado, es un punto de partida razonable para nuevas tareas de manipulación con pocos datos.
- Análisis de sensibilidad a semillas de simulación: las evaluaciones con 50 semillas permiten estudiar la varianza del éxito en entornos simulados.
- Docencia y divulgación sobre VLA: el repositorio incluye logs completos, lo que facilita explicar el flujo completo de un ajuste de comportamiento sobre un modelo fundacional.

## Benchmarks y rendimiento

Resultados reportados por el autor en simulación RoboCasa365 (PickPlaceCounterToCabinet, semillas de escena 2000–2049, semilla de política 1, éxito = tarea completada al final del episodio):

| Checkpoint | Éxito en simulación |
|---|---|
| checkpoint-2000 | 23/50 |
| checkpoint-4000 | 26/50 |
| checkpoint-6000 | 30/50 |
| checkpoint-8000 | 30/50 |
| checkpoint-10000 | 29/50 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia, un modelo de 3B en fp16 requiere aproximadamente 6 GB solo para pesos, más memoria para el codificador visual y el estado de la política.
- GPU recomendadas: el autor entrenó con una única GPU y batch de 64; no se especifica el modelo. Para inferencia, una GPU con al menos 16 GB de VRAM es un punto de partida razonable, aunque no está confirmado.
- ¿Cabe en GPU de consumo? No confirmado. Un modelo de 3B en fp16 podría caber en RTX 4090 (24 GB) o RTX 3090 (24 GB), pero las dependencias del stack GR00T y el simulador pueden elevar los requisitos.
- Opciones de despliegue: la librería declarada es `gr00t`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son adecuadas para un VLA con cabezal de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`n15base_filt_ars_10k`) | 3B | no disponible | 29/50 en PickPlaceCounterToCabinet (sim) | no disponible | Hugging Face, 0 descargas |
| `nvidia/GR00T-N1.5-3B` (base) | 3B | no disponible | no disponible en esta ficha | no disponible | Hugging Face (NVIDIA) |
| Checkpoints alternativos del mismo estudio | 3B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de otros VLA de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no es un modelo de propósito general ni un asistente conversacional; está especializado en una única tarea de manipulación.
- Entrenado con solo 108 rollouts (72 exitosos) de un único checkpoint generador, lo que limita la diversidad de datos y aumenta el riesgo de sobreajuste al simulador.
- Evaluación únicamente en simulación (RoboCasa365); no hay evidencia de transferencia a robot real.
- Licencia no especificada: no se puede asumir uso comercial. Es necesario contactar con el autor o consultar la licencia del modelo base de NVIDIA.
- No se incluyen estados del optimizador, por lo que reanudar el entrenamiento exactamente desde estos checkpoints no es posible.
- Sin información sobre sesgos, alucinación o cobertura idiomática; al ser un VLA, el riesgo relevante es de fallo de política (acciones incorrectas) más que de generación de texto.
- El filtrado ARS introduce dependencia de un estimador de progreso externo cuyo comportamiento y posibles sesgos no se documentan.

## Enlaces

- Hugging Face: https://huggingface.co/mlnha/gr00t-n15-pnp108-n15base_filt_ars_10k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- RoboCasa365 (simulador y benchmark): no disponible en la información proporcionada
- Paper de GR00T N1.5: no disponible en la información proporcionada
- Repositorio de la librería `gr00t`: no disponible en la información proporcionada
