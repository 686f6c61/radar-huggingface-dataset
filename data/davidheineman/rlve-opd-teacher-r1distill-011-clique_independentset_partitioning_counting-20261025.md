# davidheineman/rlve-opd-teacher-R1Distill-011-Clique_IndependentSet_Partitioning_Counting-20261025

## Resumen

`rlve-opd-teacher-R1Distill-011-Clique_IndependentSet_Partitioning_Counting-20261025` es un ajuste fino de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` publicado por el usuario davidheineman dentro de un experimento de escalado de datos con RLVE (Reinforcement Learning from Value Estimates) y el algoritmo GRPO. No es un asistente de propósito general: es un "profesor" especialista entrenado en un único entorno de la familia de conteo combinatorio, el etiquetado como `11-Clique_IndependentSet_Partitioning_Counting`, con dificultad balanceada fija 0/1.

El checkpoint contiene 1.777.088.000 parámetros en formato safetensors (repositorio de 3,6 GB) sobre una arquitectura Qwen2 densa. El entrenamiento se limitó a 4.000 rollouts (actualización final 499, indexada desde cero), con criterio de parada anticipada si la validación in-distribution alcanzaba pass@1 >= 0,98, evaluada con 32 prompts y 8 respuestas por prompt cada 50 actualizaciones.

Su interés es metodológico y de investigación: forma parte de un conjunto de profesores por entorno pensado para destilación on-policy (OPD) sobre modelos estudiantes, y permite estudiar cómo escala la competencia en una tarea concreta en función del presupuesto de datos de RL. No se han publicado benchmarks generales, licencia ni lista de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen2 (etiqueta `qwen2` en HuggingFace) |
| Parametros totales | 1.777.088.000 (dato real de safetensors); el modelo base se comercializa como "1.5B" |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en el repositorio (solo se publican pesos safetensors); no hay versiones GGUF, AWQ ni GPTQ del autor |
| Idiomas soportados | no disponibles (la model card no los declara) |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors, con `config` y tokenizer incluidos; sin estado de optimizador ni de dataloader |

Otros metadatos: pipeline `text-generation`, librería `transformers`, tags `rlve`, `data-scaling`, `opd-teacher`, `conversational`, compatibilidad declarada con `text-generation-inference` y `endpoints_compatible`, región `us`. Creado y actualizado el 2026-10-25. Descargas: 0. Likes: 0.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer denso de la familia Qwen2 con 1.777.088.000 parámetros reales en safetensors. Todos los actores del experimento se inicializaron de nuevo desde `DeepSeek-R1-Distill-Qwen-1.5B`, de modo que el modelo hereda la estructura, el tokenizer y el estilo de razonamiento destilado de R1, pero no se documenta ningún cambio estructural, de atención ni de vocabulario respecto al base.

El entrenamiento es un ajuste por RL con GRPO especializado en un solo entorno: `11-Clique_IndependentSet_Partitioning_Counting`, con dificultad balanceada fija 0/1. La generación usa 1.024 tokens iniciales más una continuación de 128 tokens para forzar la respuesta. El presupuesto se fijó en 4.000 rollouts y el checkpoint final corresponde a la actualización 499 (indexada desde cero), es decir, se agotó el tope de rollouts. La validación emplea 32 prompts con 8 respuestas cada uno, cada 50 actualizaciones, y esas muestras no computan contra el presupuesto de entrenamiento. El autor registra la lista de entornos y la configuración exacta en `training_run.json` y `training_config.yaml`, y publica la traza en Weights & Biases (grupo `data-scaling-v1-20261022-180018`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento matemático y combinatorio acotado a una familia de tareas: conteo de cliques, conjuntos independientes y particiones en grafos.
- Producción de cadenas de razonamiento relativamente largas: el protocolo de generación reserva 1.024 tokens antes de la continuación de respuesta de 128 tokens.
- Especialización vía RL: política entrenada con GRPO bajo el marco RLVE, orientada a maximizar pass@1 en un único entorno.
- Uso previsto como profesor en destilación on-policy, generando trayectorias para un estudiante.
- No hay evidencia en la información disponible de tool calling, function calling, uso de agentes, multi-step reasoning con herramientas, visión, audio ni un modo "thinking" documentado de forma explícita.
- Cobertura multilingüe: no documentada.

## Casos de uso

- Destilación on-policy de un estudiante: usar este checkpoint como profesor para generar trayectorias resueltas del entorno de conteo de cliques y conjuntos independientes, y entrenar con ellas un modelo de menor coste.
- Generación de datos sintéticos etiquetados: producir pares problema-cadena de razonamiento-respuesta para aumentar el corpus de una tarea de conteo combinatorio concreta, con la ventaja de que la recompensa del entorno es verificable.
- Estudio de escalado de datos (data scaling): comparar la curva de competencia de este profesor con los otros entornos del mismo grupo de experimentos para estimar cuántos rollouts necesita una tarea antes de saturar.
- Baseline de RL para investigación: servir como referencia reproducible de GRPO/RLVE a 4.000 rollouts frente a variantes con más presupuesto, otras dificultades o filtrado de prompts.
- Solver asistido con verificación humana: emplearlo como generador de candidatos en problemas de partición y conteo de grafos, validando cada respuesta con un comprobador exacto antes de aceptarla.
- Reproducción de experimentos: recargar el checkpoint y reejecutar el protocolo de validación (32 prompts x 8 respuestas) para auditar las cifras reportadas en el run de W&B.
- Ablación del formato de respuesta: analizar el efecto de la continuación forzada de 128 tokens frente a otros esquemas de generación sobre la precisión final.
- Análisis de especialización y olvido: medir la degradación en tareas generales del modelo base para cuantificar el coste de especializar un modelo de 1,78 mil millones de parámetros en un solo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente describe el protocolo de validación interna (32 prompts, 8 respuestas por prompt, cada 50 actualizaciones, criterio de parada pass@1 >= 0,98) y no reporta el valor final alcanzado ni resultados de MMLU, HumanEval, GSM8K u otras suites. Tampoco se aportan comparaciones con los otros profesores del mismo grupo de experimentos.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 3,6 GB (coincide con el tamaño del repositorio). Con overhead de runtime y caché KV, el consumo realista se sitúa en 6-8 GB de VRAM para contextos moderados.
- Cuantización int8: alrededor de 1,8 GB de pesos, en torno a 4 GB de VRAM totales.
- Cuantización int4: alrededor de 0,9-1 GB de pesos, en torno a 2-3 GB de VRAM totales (requiere conversión externa, el autor no publica GGUF).
- GPU recomendadas: A100 40/80 GB y H100 para servir en paralelo con alto throughput o lote grande; RTX 4090 24 GB y RTX 4060 Ti 16 GB para experimentación cómoda; RTX 3060 12 GB como mínimo holgado en bf16.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más usando int4/int8, y en 12 GB o más en bf16.
- Opciones de despliegue: `transformers` (librería declarada), TGI (tag `text-generation-inference` y `endpoints_compatible`), vLLM y SGLang para serving; llama.cpp u Ollama solo tras convertir los pesos a GGUF por cuenta propia.
- Latencia y throughput: no disponibles. Al ser un modelo de 1,78 mil millones de parámetros, la latencia vendrá dominada por la generación de los 1.024 tokens de razonamiento del protocolo, no por el peso del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`rlve-opd-teacher-...-011-Clique...`) | 1.777.088.000 | no disponible | Conteo de cliques, conjuntos independientes y particiones (entorno 11) | no disponible | HuggingFace, 0 descargas |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` | ~1,5B (nominal) | no disponible en la informacion | Razonamiento general destilado de R1, matemáticas y código | no disponible en la informacion consultada | HuggingFace, modelo base ampliamente usado |
| `davidheineman/opd-teacher-Q2.5I-FractionalProgramming-step149` | ~1,5B | no disponible | Programación fraccional, dificultad 0, 150 actualizaciones | no disponible | HuggingFace, Featherless, Friendli |
| `davidheineman/opd-teacher-R1Distill-CRT-step149` | ~1,5B | no disponible | Teorema chino del resto, dificultad 0, 150 pasos | no disponible | HuggingFace |

La diferencia clave frente al base es la especialización: este checkpoint ha pasado por RL en un solo entorno y con un presupuesto de 4.000 rollouts, mientras que el base es un modelo de razonamiento general. Frente a los otros profesores del mismo autor, cambia el entorno, el modelo de partida (R1-Distill frente a Qwen2.5-Instruct en algunos casos) y el presupuesto de entrenamiento (4.000 rollouts aquí frente a 150 actualizaciones en los ejemplos `step149`).

## Limitaciones y advertencias

- Especialización extrema: un único entorno, dificultad fija 0/1 y 4.000 rollouts. Es previsible un rendimiento pobre fuera de esa distribución, aunque no se aportan mediciones.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad ni dentro ni fuera del entorno, más allá del protocolo de validación descrito.
- Licencia no declarada: no se puede asumir uso comercial permitido. Habría que revisar la licencia del modelo base y contactar con el autor.
- Idiomas no declarados: se desconoce el comportamiento multilingüe y si el ajuste por RL lo ha degradado.
- Riesgo de alucinación: un modelo de 1,78 mil millones de parámetros especializado por RL puede producir cadenas de razonamiento plausibles pero incorrectas en problemas de conteo, un dominio donde los errores son difíciles de detectar sin verificación exacta.
- Formato de respuesta condicionado: el protocolo de 1.024 tokens más 128 tokens de continuación forzada puede limitar la calidad si se usa con otros esquemas de generación o longitudes.
- Sesgos: no documentados. No hay evaluación de sesgos sociales, de género ni culturales.
- Posible contaminación: la validación in-distribution usa 32 prompts fijos que podrían haberse filtrado al análisis; el autor indica que no computan en el presupuesto, pero no publica su contenido.
- Artefacto de investigación: el repositorio no incluye estado de optimizador ni de dataloader, por lo que no es reanudable sin reconstruir el entorno.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- Fecha de publicación adelantada (2026-10-25): conviene verificar la vigencia de los enlaces de W&B y de los ficheros de configuración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-011-Clique_IndependentSet_Partitioning_Counting-20261025
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/7d0694fa
- Proyecto W&B (grupo `data-scaling-v1-20261022-180018`): https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Perfil del autor: https://huggingface.co/davidheineman
- Profesor relacionado (CRT): https://huggingface.co/davidheineman/opd-teacher-R1Distill-CRT-step149
- Profesor relacionado (FractionalProgramming, espejo en Friendli): https://friendli.ai/models/davidheineman/opd-teacher-Q2.5I-FractionalProgramming-step149
- Profesor relacionado (Differentiate, espejo en Featherless): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-Differentiate-step149
