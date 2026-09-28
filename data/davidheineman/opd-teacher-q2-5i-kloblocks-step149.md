# davidheineman/opd-teacher-Q2.5I-KloBlocks-step149

## Resumen

opd-teacher-Q2.5I-KloBlocks-step149 es un checkpoint de investigación publicado por el usuario davidheineman. Se trata de un ajuste fino del modelo Qwen/Qwen2.5-1.5B-Instruct mediante GRPO sobre el entorno `KloBlocks` a dificultad 0, dentro de un experimento de destilación on-policy (OPD) que abarca 32 entornos. El nombre del repositorio indica su función: es el modelo "profesor" (teacher) que genera las trayectorias o demostraciones utilizadas para supervisar a un modelo "alumno" en ese experimento.

El entrenamiento consta de 150 actualizaciones con GRPO y `step149` es el checkpoint final (índice basado en cero, es decir, la actualización número 150). Los pesos se convirtieron desde el checkpoint nativo final a safetensors de Hugging Face y, según la model card, se validaron contra los nombres y formas de tensor del modelo base. La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de aproximadamente 1.543 millones de parámetros.

Su relevancia es acotada y muy específica: no es un modelo de propósito general pensado para producción, sino un artefacto reproducible para investigar destilación on-policy, aprendizaje por refuerzo con recompensas verificables y protocolos de entrenamiento multi-entorno. La utilidad principal está en la reproducibilidad del pipeline (código de entrenamiento público, run de W&B identificado) y en servir como referencia para comparar dinámicas de destilación entre profesores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Qwen2 (modelo base Qwen/Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (aprox. 1,54 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct documenta 32.768 tokens, valor no verificado para este checkpoint |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors sin versiones cuantizadas |
| Idiomas soportados | ingles (`en`); el modelo base es multilingue, pero la model card solo declara ingles |
| Licencia | apache-2.0 (se incluye la licencia original de Qwen en el archivo `LICENSE`) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tamano del repositorio | 3,1 GB |
| Metodo de entrenamiento | GRPO sobre el entorno `KloBlocks`, 150 actualizaciones |
| Checkpoint | `step149` (índice basado en cero, actualización final) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención con RoPE, en la variante de 1,5 mil millones de parámetros de la familia Qwen2.5 y con ajuste por instrucciones. El checkpoint no introduce cambios estructurales respecto al base; la model card indica que los pesos se convirtieron desde el checkpoint nativo final y se validaron contra los nombres y formas de tensor del modelo original, lo que sugiere compatibilidad directa de arquitectura.

El entrenamiento consistió en 150 actualizaciones con GRPO (Group Relative Policy Optimization) sobre el entorno `KloBlocks` a dificultad 0, dentro de un experimento de destilación on-policy con 32 entornos. La selección de un único entorno por profesor es deliberada: se entrena un especialista por entorno en lugar de un profesor generalista. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, la función de recompensa ni si hubo fases adicionales de SFT o DPO. El run de W&B (`6e42fa61`, grupo de barrido `opd-teachers-20260927-191939`) y el repositorio de código `davidheineman/rlve` son las fuentes donde constaría esa información.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-1.5B-Instruct.
- Especialización por RL en el entorno `KloBlocks` a dificultad 0; la model card no describe la naturaleza de la tarea ni el formato de respuesta esperado.
- Actúa como modelo profesor: su función prevista es generar las trayectorias o demostraciones que supervisan a un modelo alumno en destilación on-policy.
- Formato de pesos compatible con `transformers` y con el ecosistema safetensors, con pipeline `text-generation`.
- Etiquetado como `endpoints_compatible` y `text-generation-inference`, por lo que es desplegable en infraestructura de inferencia estándar.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.
- Capacidad multilingüe: no declarada; solo se indica inglés.

## Casos de uso

- Destilación on-policy como profesor: generar demostraciones o distribuciones de tokens para entrenar un alumno en el marco del experimento de 32 entornos descrito en la model card. Es el uso para el que fue creado explícitamente.
- Reproducción de experimentos de RL con recompensas verificables: al estar publicados el run de W&B y el código de entrenamiento, permite replicar el entrenamiento de un profesor por entorno y comparar curvas de recompensa.
- Ablación de protocolos de destilación: usar este profesor junto con otros checkpoints de la colección `RLVE OPD Teachers` para medir cómo varía la calidad del alumno según el profesor y el entorno.
- Generación de datos sintéticos para entornos de tipo bloque: producir trayectorias de resolución en `KloBlocks` que después se filtran por recompensa verificable y se reutilizan como datos de SFT.
- Estudio de especialización versus generalización: comparar este checkpoint (especializado en un único entorno) con el modelo base sin ajustar para cuantificar la pérdida de capacidades generales tras el RL.
- Evaluación de infraestructura de destilación a pequeña escala: con 1,54 mil millones de parámetros y 3,1 GB de pesos, sirve como profesor de bajo coste para validar pipelines de OPD antes de escalar a modelos mayores.
- Base para investigación en aprendizaje por refuerzo sobre modelos pequeños: permite iterar sobre funciones de recompensa, hiperparámetros de GRPO y esquemas de muestreo sin grandes requisitos de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia el run de W&B (`6e42fa61`) y el grupo de barrido `opd-teachers-20260927-191939` como fuentes donde podrían consultarse métricas de entrenamiento, pero no se incluye ningún resultado de MMLU, HumanEval, GSM8K ni de la tarea `KloBlocks`.

## Requisitos de hardware

- Pesos en precisión de checkpoint: 1.543.714.304 parámetros. A 16 bits (BF16/FP16) ocupan aproximadamente 3,1 GB, valor coherente con el tamaño del repositorio (3,1 GB).
- VRAM estimada en BF16/FP16: alrededor de 4 GB incluyendo activaciones y caché KV para contextos cortos y lotes pequeños. Con contextos largos (decenas de miles de tokens) la caché KV crece de forma apreciable y puede superar los 8-10 GB.
- VRAM estimada en int8: aproximadamente 1,8-2,5 GB. En cuantización de 4 bits: alrededor de 1,2-2 GB. Estas cifras son estimaciones a partir del número de parámetros, no valores publicados para este checkpoint.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o una RTX 4090 lo ejecutan con holgura en BF16 para contextos moderados.
- GPU de centro de datos: A100, H100 o L40S no son necesarias para inferencia; solo tendrían sentido para reentrenar el modelo con GRPO o para servir muchas réplicas concurrentes.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`) y vLLM por compatibilidad con la arquitectura Qwen2. No se han publicado pesos GGUF, por lo que llama.cpp y Ollama requerirían una conversión propia.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.
- Nota de contexto: el límite de contexto efectivo no está confirmado en la model card; si se hereda el del modelo base, serían 32.768 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-KloBlocks-step149 | 1,54 mil millones | no confirmado (base: 32.768) | apache-2.0 | Hugging Face, safetensors | Profesor especializado por RL en un entorno; sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 mil millones | 32.768 tokens | apache-2.0 | Hugging Face | Modelo base; ajuste por instrucciones generalista y multilingüe |
| SmolLM2-1.7B-Instruct | 1,7 mil millones | 8.192 tokens | apache-2.0 | Hugging Face | Alternativa de tamaño comparable orientada a uso general |
| Llama-3.2-1B-Instruct | 1,24 mil millones | 128.000 tokens | Licencia comunitaria de Llama 3.2 (no apache-2.0) | Hugging Face | Contexto mucho mayor, pero licencia con restricciones adicionales |

La comparación de rendimiento entre estos modelos no es posible con la información disponible: no se han publicado resultados de benchmarks para el checkpoint objeto de esta ficha. Las especificaciones de los modelos comparados corresponden a su documentación pública y se incluyen solo como referencia de tamaño, contexto y licencia.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción. Está diseñado como profesor de un experimento concreto de destilación on-policy y no se ha validado para uso general.
- Sesgos conocidos: no documentados. Al derivar de Qwen2.5-1.5B-Instruct, hereda los sesgos de su corpus de entrenamiento, que tampoco se detalla en esta ficha.
- Riesgo de alucinación: no evaluado para este checkpoint. Puede ser mayor que en el modelo base si el ajuste con GRPO sobre un único entorno ha estrechado su distribución de salida.
- Especialización extrema: el entrenamiento se limita al entorno `KloBlocks` a dificultad 0 durante 150 actualizaciones, lo que puede degradar capacidades generales de conversación respecto al modelo base.
- Idioma: la model card solo declara inglés. No hay confirmación de que el multilingüismo del modelo base se conserve tras el ajuste.
- Contexto: el límite efectivo no está confirmado. Si el ajuste se realizó con secuencias cortas, el rendimiento con contextos largos puede degradarse aunque el modelo base los soporte.
- Formato de respuesta: no se documenta la plantilla de chat ni el formato de salida esperado para la tarea `KloBlocks`, lo que dificulta su uso directo sin consultar el código de entrenamiento.
- Licencia: apache-2.0 permite uso comercial, pero el repositorio incluye además la licencia original de Qwen. Conviene revisar ambas antes de cualquier uso en producción.
- Reproducibilidad: la model card remite a un run de W&B y a un repositorio de código, pero no incluye hiperparámetros, datos ni métricas en el propio repositorio de Hugging Face.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-KloBlocks-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Colección RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/6e42fa61
- Código de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Paper de RLVE referenciado en la colección: https://arxiv.org/abs/2511.07317
- Paper sobre destilación on-policy (resultado de búsqueda, contexto general): https://arxiv.org/abs/2607.28449
