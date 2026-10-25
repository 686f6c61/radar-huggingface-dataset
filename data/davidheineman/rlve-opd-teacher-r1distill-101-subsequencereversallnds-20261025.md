# davidheineman/rlve-opd-teacher-R1Distill-101-SubsequenceReversalLNDS-20261025

## Resumen

`rlve-opd-teacher-R1Distill-101-SubsequenceReversalLNDS-20261025` es un checkpoint de 1.777.088.000 parámetros publicado por el usuario davidheineman dentro de un experimento de escalado de datos denominado RLVE. No es un modelo de propósito general: es un modelo profesor (`opd-teacher`) pensado para generar rollouts de alta calidad sobre un único entorno algorítmico, `101-SubsequenceReversalLNDS`, que después se emplean en procesos de destilación on-policy. Los pesos se inicializaron desde `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un transformer denso de la familia Qwen2 con razonamiento destilado de DeepSeek-R1.

El entrenamiento se realizó con GRPO sobre un entorno fijo con dificultad equilibrada 0/1, con un tope de 4.000 rollouts y un checkpoint final en la actualización 499 (indexada desde cero). La generación emplea 1.024 tokens iniciales más una continuación forzada de respuesta de 128 tokens, un esquema habitual en entornos verificables donde se quiere separar razonamiento y respuesta final.

Su relevancia es metodológica: sirve como pieza reproducible en investigación sobre RL con verificadores, destilación on-policy y escalado de datos, no como asistente general. El repositorio incluye únicamente pesos, tokenizer y configuración; no hay estado del optimizador ni del dataloader, por lo que no se puede reanudar el entrenamiento desde este checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), con razonamiento destilado de DeepSeek-R1 |
| Parámetros totales | 1.777.088.000 (1,78 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada; la model card no la declara y se hereda del modelo base |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible; la model card no declara licencia para este fine-tune |
| Formato de pesos | safetensors, con `tokenizer` y `config` de transformers |
| Modelo base | `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` |
| Tamaño del repositorio | 3,6 GB |
| Pipeline | `text-generation` |
| Librería | transformers |
| Método de entrenamiento | GRPO especialista, 1 entorno, dificultad equilibrada 0/1 |
| Presupuesto de entrenamiento | 4.000 rollouts; checkpoint final en la actualización 499 (desde cero) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Qwen2, sin mezcla de expertos ni mecanismos híbridos SSM. Los 1,78 B de parámetros se inicializaron desde DeepSeek-R1-Distill-Qwen-1.5B, de modo que el modelo parte de una capacidad de razonamiento en cadena de pensamiento destilada de DeepSeek-R1 antes de especializarse. Todos los actores del experimento se inicializaron de nuevo desde ese mismo modelo base, lo que permite comparaciones limpias entre ramas del estudio de escalado de datos.

El ajuste se hizo con GRPO sobre un único entorno, `101-SubsequenceReversalLNDS`, con dificultad equilibrada y fija 0/1. Cada generación consta de 1.024 tokens iniciales más una continuación de 128 tokens con forzado de respuesta. El entrenamiento se limitó a 4.000 rollouts y se validó cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, sin que esas muestras de validación computasen contra el presupuesto de entrenamiento. El criterio de parada era alcanzar un pass@1 de validación mayor o igual a 0,98; la model card no indica si se alcanzó ese umbral o si el run terminó por agotar los 4.000 rollouts. No se documentan tamaño del dataset, composición, número de tokens vistos ni fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto autoregresiva con cadena de razonamiento larga heredada de DeepSeek-R1-Distill-Qwen-1.5B.
- Ejecución especializada de la tarea `SubsequenceReversalLNDS` del entorno `101`, con dificultad equilibrada 0/1.
- Producción de rollouts etiquetables para destilación on-policy: 1.024 tokens de razonamiento más 128 tokens de respuesta forzada.
- Modo conversacional declarado en los tags (`conversational`), aunque sin plantilla de chat documentada en la información disponible.
- Uso como modelo profesor en pipelines de OPD, generando trayectorias para un estudiante.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible` según los tags del repositorio.
- No hay soporte documentado de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.
- Cobertura multilingüe no documentada; no se puede afirmar qué idiomas maneja más allá de lo heredado del modelo base.

## Casos de uso

- Profesor en destilación on-policy: generar trayectorias sobre `SubsequenceReversalLNDS` y entrenar un modelo estudiante con ellas. El checkpoint se seleccionó bajo un criterio de pass@1 alto en ese entorno, lo que lo hace adecuado como fuente de ejemplos, aunque el valor final no se publica.
- Generación de datasets sintéticos de razonamiento algorítmico: el formato fijo de 1.024 tokens de razonamiento más 128 de respuesta forzada facilita segmentar pensamiento y respuesta final al construir corpus etiquetados.
- Reproducción de recetas GRPO: el repositorio incluye `training_run.json` y `training_config.yaml`, de modo que se puede reconstruir la configuración exacta del run y usarla como línea base en experimentos de RL con verificadores.
- Estudio de especialización y olvido catastrófico: comparar este checkpoint con el modelo base en tareas generales permite cuantificar cuánto degrada un ajuste GRPO de 4.000 rollouts sobre un único entorno.
- Validación de harnesses de evaluación: sus 32 prompts y 8 respuestas por prompt cada 50 actualizaciones sirven para probar infraestructura de evaluación pass@1 y forzado de respuesta antes de escalar a modelos mayores.
- Diseño de currículos de dificultad: el ajuste con dificultad equilibrada 0/1 es un punto de partida para experimentos sobre mezcla de dificultades y su efecto en la tasa de aprendizaje de la tarea.
- Inferencia local económica: con 1,78 B de parámetros y 3,6 GB de pesos, cabe en GPUs de consumo para pruebas de pipeline, siempre que se acepte el coste de generar más de 1.100 tokens por muestra.
- Docencia y demostraciones de subsecuencias y LNDS: el modelo puede ilustrar el razonamiento paso a paso en problemas de subsecuencia no decreciente más larga con reversión, con la cautela de que su especialización es estrecha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo describe el protocolo de entrenamiento y validación, sin tablas de MMLU, HumanEval, GSM8K ni métricas comparables.

| Métrica del run | Valor |
|---|---|
| Entornos de entrenamiento | 1 (`101-SubsequenceReversalLNDS`) |
| Dificultad | Equilibrada y fija 0/1 |
| Rollouts de entrenamiento | 4.000 |
| Actualización final del checkpoint | 499 (desde cero) |
| Tokens iniciales de generación | 1.024 |
| Tokens de continuación forzada | 128 |
| Validación | Cada 50 actualizaciones, 32 prompts × 8 respuestas |
| Criterio de parada | 4.000 rollouts o pass@1 de validación ≥ 0,98 |
| pass@1 final | No disponible |
| Benchmarks estándar publicados | No disponible |

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 3,6 GB, coherente con el tamaño del repositorio.
- Cuantización INT8: alrededor de 1,8 GB de pesos; INT4: alrededor de 0,9-1,1 GB, aunque no se publican versiones cuantizadas y habría que generarlas.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB con margen para caché KV; en tarjetas de 8 GB es viable solo con cuantización de 4-8 bits y contextos cortos.
- GPU de datacenter: A100 40/80 GB, H100 o L40S para servir lotes grandes con vLLM o TGI, donde el límite real será la memoria de caché KV y no los pesos.
- Despliegue: transformers de forma nativa, vLLM y TGI por los tags del repositorio. llama.cpp y Ollama requieren convertir los pesos a GGUF, conversión que no se incluye.
- Latencia y throughput: no disponibles. Cualquier estimación debe tener en cuenta que cada muestra implica al menos 1.024 tokens de razonamiento más 128 de respuesta, lo que encarece la generación frente a un modelo instruct convencional del mismo tamaño.
- Memoria de contexto: al no declararse la longitud máxima, conviene fijar un límite conservador en el servidor y verificar el valor en `config.json` antes de producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`rlve-opd-teacher-...-SubsequenceReversalLNDS`) | 1,78 B | No disponible | Profesor GRPO especializado en un entorno algorítmico | No disponible | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (base) | 1,78 B (mismo tamaño de pesos safetensors) | No disponible en la información proporcionada | Razonamiento general destilado de R1 | No disponible en la información proporcionada | Hugging Face |
| `Qwen2.5-1.5B-Instruct` | No disponible en la información proporcionada | No disponible | Instrucciones generales | No disponible en la información proporcionada | No disponible en la información proporcionada |
| `Qwen2.5-Math-1.5B` | No disponible en la información proporcionada | No disponible | Razonamiento matemático | No disponible en la información proporcionada | No disponible en la información proporcionada |

Los datos de los modelos alternativos no formaban parte de la información proporcionada en esta búsqueda; deben verificarse en sus fichas oficiales antes de usarlos en una comparación. La comparación relevante y verificable es contra el modelo base: mismo tamaño y misma inicialización, con la diferencia de que este checkpoint ha pasado por 4.000 rollouts de GRPO sobre un solo entorno, lo que previsiblemente mejora la tarea objetivo y puede degradar capacidades generales.

## Limitaciones y advertencias

- Especialización extrema: entrenado en un único entorno (`101-SubsequenceReversalLNDS`); no debe esperarse rendimiento generalista ni uso como asistente.
- Licencia no declarada: no hay base legal explícita para uso comercial; hay que consultar la licencia del modelo base y del repositorio antes de desplegarlo.
- Idiomas no documentados: no se puede garantizar calidad en castellano ni en ningún otro idioma.
- Contexto no documentado: la model card no declara longitud máxima, lo que obliga a inspeccionar la configuración antes de servir en producción.
- Riesgo de alucinación y de cadenas de razonamiento plausibles pero incorrectas, especialmente fuera de la distribución del entorno de entrenamiento.
- Sin datos de alineación de seguridad: no se documentan fases de RLHF, DPO ni filtros de contenido; no es apto para aplicaciones orientadas a usuario final sin capas adicionales.
- Sesgos heredados del modelo base DeepSeek-R1-Distill-Qwen-1.5B, no evaluados en esta ficha.
- Coste de inferencia alto para su tamaño: cada muestra exige más de 1.100 tokens, lo que reduce el throughput efectivo frente a modelos instruct de parámetros similares.
- Reproducibilidad parcial: no se incluyen estado del optimizador ni del dataloader, así que el checkpoint es de solo inferencia o de reinicio desde cero, no reanudable.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes conocidas.
- El criterio de parada por pass@1 ≥ 0,98 no confirma que se alcanzase; el rendimiento real en la tarea no se publica.
- La fecha del repositorio (25 de octubre de 2026) y el nombre del run deben tomarse como metadatos del autor; conviene verificar la versión exacta de los artefactos antes de citarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-101-SubsequenceReversalLNDS-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de W&B del entrenamiento: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/beba2820
- Configuración y metadatos del run: `training_run.json` y `training_config.yaml` dentro del repositorio del modelo
- No se han encontrado en la búsqueda web enlaces adicionales relevantes para este modelo.
