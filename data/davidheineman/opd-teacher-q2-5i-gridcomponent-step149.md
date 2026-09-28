# davidheineman/opd-teacher-Q2.5I-GridComponent-step149

## Resumen

opd-teacher-Q2.5I-GridComponent-step149 es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario davidheineman. No es un modelo de propósito general: es un "teacher" (profesor) entrenado dentro de la metodología RLVE sobre un único entorno denominado `GridComponent`, con dificultad 0, y forma parte de un experimento de destilación on-policy (OPD) que abarca 32 entornos de los 400 disponibles en RLVE.

El modelo conserva la arquitectura original de Qwen2.5-1.5B-Instruct (transformer decoder-only denso de 1.543.714.304 parámetros, pesos en safetensors, licencia Apache 2.0, idioma inglés) y únicamente se han modificado los pesos mediante 150 actualizaciones de GRPO. El checkpoint `step149` corresponde al índice final basado en cero, es decir, la actualización número 150, y fue convertido desde el checkpoint nativo a safetensors validando nombres y formas de tensores contra el modelo base.

Su relevancia es puramente metodológica: sirve como pieza de un estudio sobre destilación on-policy, en línea con el trabajo arXiv:2609.04172 sobre el papel de los datos de entrenamiento en OPD y con los entornos de arXiv:2511.07317. Con cero descargas y cero "likes" en el momento de la consulta, debe tratarse como un artefacto de investigación reproducible, no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada; heredada del modelo base Qwen2.5-1.5B-Instruct |
| Tipos de cuantizacion | no disponible: el repositorio solo publica pesos en safetensors (repo de 3,1 GB, compatible con bf16/fp16). No se publican versiones GPTQ, AWQ ni GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de la familia Qwen2, con atención por consultas agrupadas (GQA), embeddings rotatorios (RoPE) y normalización RMSNorm. No hay cambios estructurales respecto a Qwen2.5-1.5B-Instruct; el proceso de conversión de pesos verificó que los nombres y las formas de los tensores coinciden con los del modelo base, lo que confirma que se trata de un ajuste de pesos y no de una reparametrización.

El entrenamiento consistió en 150 actualizaciones de GRPO (Group Relative Policy Optimization) sobre un único entorno, `GridComponent`, a dificultad 0, dentro del marco RLVE. El run está registrado en Weights & Biases con el identificador `2ae17070`, dentro del sweep `opd-teachers-20260927-191939`, y el código se publica en el repositorio `davidheineman/rlve`. El modelo está etiquetado con `rlve`, `grpo` y `opd-teacher`, y su finalidad declarada es servir como profesor en un experimento de destilación on-policy sobre 32 entornos. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni fases de RLHF o DPO adicionales al propio GRPO.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Producción de rollouts y respuestas sobre la tarea concreta del entorno `GridComponent` a dificultad 0, que es el comportamiento reforzado durante las 150 actualizaciones de GRPO.
- Generación de logits a nivel de token utilizables como supervisión densa en destilación on-policy (uso principal declarado).
- Capacidad de conversación multi-turno en formato `conversational`, según las etiquetas del repositorio.
- Compatibilidad con `text-generation-inference` y con `endpoints_compatible`, lo que permite desplegarlo mediante las APIs de inferencia estándar.
- Soporte de tool calling, function calling, agentes, visión, audio, modo de razonamiento explícito o capacidades multilingües: no disponibles en la información proporcionada; al derivar de un modelo de 1.5B sin ajuste específico documentado, no deben asumirse.

## Casos de uso

- Destilación on-policy como profesor: generar rollouts sobre el entorno `GridComponent` y usar la distribución de logits del profesor para supervisar token a token a un modelo estudiante de menor tamaño. Es el uso para el que fue entrenado explícitamente.
- Generación de datos sintéticos de entrenamiento: producir trayectorias etiquetadas dentro del entorno `GridComponent` para ampliar el conjunto de datos de un experimento de RL con recompensa verificable.
- Reproducción de experimentos: el checkpoint `step149` permite replicar exactamente el estado final del run de W&B `2ae17070` y comparar curvas de recompensa frente a otros teachers del mismo sweep.
- Grupo de control en experimentos con 32 entornos: al ser uno de los 32 teachers del experimento de destilación, se puede medir la contribución marginal de `GridComponent` frente al resto de entornos.
- Estudio de olvido catastrófico: comparar sus respuestas fuera de dominio con Qwen2.5-1.5B-Instruct permite cuantificar cuánto degrada el ajuste por RL en un único entorno las capacidades generales del modelo base.
- Punto de partida para ajustes posteriores: con 1.5B parámetros y pesos en safetensors se puede continuar el entrenamiento con SFT o RL en una única GPU de gama alta para消费... para prototipado rápido de pipelines de RL.
- Investigación sobre dinámicas de GRPO a escala pequeña: al ser un run de solo 150 actualizaciones con hiperparámetros y entorno conocidos, es útil para estudiar estabilidad del entrenamiento y sensibilidad a la recompensa.
- Evaluación de robustez de entornos RLVE: probar si el modelo resuelve correctamente instancias de `GridComponent` de mayor dificultad que la usada en entrenamiento (dificultad 0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de la tarea `GridComponent`, y tampoco se ofrecen curvas de recompensa más allá de la referencia al run de Weights & Biases `2ae17070`. Cualquier cifra de rendimiento que se quiera usar debe obtenerse ejecutando el modelo y consultando dicho run.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo a partir de 1.543.714.304 parámetros, sin contar caché KV ni activaciones): aproximadamente 3,1 GB en fp16/bf16; en torno a 1,6 GB en int8; alrededor de 0,9-1,0 GB en 4 bits. Son estimaciones aritméticas, no medidas publicadas por el autor.
- La caché KV crece de forma lineal con la longitud de contexto, por lo que a contextos largos el consumo supera holgadamente el de los pesos. No se dispone de medidas reales de memoria en la información proporcionada.
- Cabe sin dificultad en GPU de consumo: cualquier tarjeta con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) puede ejecutarlo en fp16 y con margen amplio en cuantización de 8 o 4 bits.
- GPU de centro de datos (A100, H100, L40S) sobredimensionadas para inferencia individual; resultan útiles si se necesita generar grandes volúmenes de rollouts en paralelo para el experimento de destilación.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (etiqueta `text-generation-inference`), vLLM y endpoints compatibles con la API de inferencia. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, que no se publica en el repositorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y dependerán por completo del hardware y del backend elegido.

## Comparativa con modelos similares

Los datos de la columna de este modelo provienen de la información proporcionada. Los de las alternativas proceden de su documentación pública y no se han verificado en la información disponible; se incluyen solo como referencia de categoría.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-GridComponent-step149 | 1,54 B (dato real) | no disponible (heredado del base) | Ajuste GRPO sobre un único entorno, uso como teacher | apache-2.0 | Hugging Face, 0 descargas, sin cuantizaciones publicadas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | declarado por Qwen en su documentación (no verificado aquí) | Instruct de propósito general | apache-2.0 | Muy extendido, con versiones GGUF y cuantizadas de terceros |
| Qwen/Qwen2.5-3B-Instruct | ~3,09 B | declarado por Qwen en su documentación (no verificado aquí) | Instruct de propósito general | apache-2.0 | Amplia disponibilidad |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24 B | declarado por Meta en su documentación (no verificado aquí) | Instruct de propósito general | Llama 3.2 Community License | Amplia disponibilidad |

La diferencia funcional clave no está en los parámetros ni en el contexto, sino en el propósito: los tres modelos de comparación son asistentes de propósito general, mientras que este checkpoint está especializado en un único entorno y pierde sentido fuera del experimento de destilación.

## Limitaciones y advertencias

- Es un artefacto de investigación. La propia model card lo define como teacher para un experimento concreto de destilación on-policy, no como modelo de uso general.
- Especialización extrema: 150 actualizaciones de GRPO sobre un solo entorno (`GridComponent`, dificultad 0) implican un riesgo alto de sobreajuste a esa tarea y de degradación de capacidades generales respecto al modelo base (olvido catastrófico). No se aportan evaluaciones que lo cuantifiquen.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación. Al derivar de un modelo de 1,5B, la tasa esperable es alta y no está medida.
- Idioma: solo se declara inglés (`en`). No hay soporte multilingüe documentado, más allá del que pudiera conservar el modelo base.
- Contexto: no se especifica en la información proporcionada. Si el uso previsto requiere contextos largos, debe verificarse empíricamente antes de integrarlo.
- Licencia: apache-2.0, permisiva y compatible con uso comercial. El repositorio incluye la licencia original de Qwen en el fichero `LICENSE`. Aun así, el uso comercial de un modelo especializado en un único entorno sintético tiene poco recorrido práctico.
- Trazabilidad limitada: no hay métricas publicadas, ni curvas de recompensa en la model card, ni número de tokens de entrenamiento, ni composición del dataset. La única fuente de detalle es el run externo de Weights & Biases.
- Adopción nula: cero descargas y cero valoraciones en el momento de la consulta, por lo que no existe validación por parte de terceros.
- Reproducibilidad dependiente de servicios externos: el run de W&B y el repositorio de código son necesarios para replicar el entrenamiento; si desaparecen, el checkpoint queda sin contexto metodológico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-GridComponent-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Colección RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/2ae17070
- Código de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Paper sobre destilación on-policy: https://arxiv.org/abs/2609.04172
- Paper de referencia de los entornos RLVE: https://arxiv.org/abs/2511.07317
