# LeaderboardModel1/Qwen3.8-27B-AutoRound-W4A16-tuning

## Resumen

Qwen3.8-27B-AutoRound-W4A16-tuning es una cuantización de 4 bits en pesos con activaciones en 16 bits (esquema W4A16) del modelo base Qwen/Qwen3.8-27B, generada mediante AutoRound, la herramienta de cuantización post-entrenamiento desarrollada por Intel. El autor del artefacto es el usuario LeaderboardModel1, que lo publica como un checkpoint derivado con la etiqueta `autoquant-agent`, un flujo automatizado de cuantización, evaluación y ajuste iterativo.

El interés de esta ficha no está en un modelo nuevo, sino en el artefacto cuantizado: permite ejecutar un modelo de la familia Qwen3.5 con un peso en disco de aproximadamente 19,5 GB, lo que reduce de forma sustancial los requisitos de VRAM frente al checkpoint original en BF16. La model card reporta una recuperación media del 99,37 % respecto al modelo en BF16 sobre cuatro benchmarks, un dato relevante para decidir si merece la pena desplegar la versión cuantizada en producción.

Conviene señalar una discrepancia importante: el nombre del repositorio indica "27B", pero el recuento real de parámetros de los ficheros safetensors es de 6.260.690.960 parámetros (unos 6,26 mil millones). Esta ficha documenta ambos datos y advierte sobre la inconsistencia en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 6.260.690.960 según safetensors (el nombre del repo indica 27B; discrepancia no resuelta) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; los scripts de evaluación usan `max_model_len=8192` |
| Tipos de cuantizacion | W4A16 (4 bits en pesos, 16 bits en activaciones), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el artefacto; la model card remite a la licencia del modelo original (Qwen/Qwen3.8-27B) |
| Formato de pesos | safetensors, cuantizado con compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El artefacto es una cuantización post-entrenamiento, no un modelo entrenado desde cero. La arquitectura subyacente corresponde al modelo base Qwen/Qwen3.8-27B, etiquetado con la arquitectura `qwen3_5` en HuggingFace, es decir, un transformer de la familia Qwen3.5. No se dispone de información sobre el número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de preentrenamiento en la información proporcionada.

El método de cuantización es AutoRound, que optimiza los valores de redondeo de los pesos mediante descenso de gradiente firmado en lugar de aplicar redondeo uniforme, minimizando el error de reconstrucción capa a capa. El resultado es un checkpoint W4A16 almacenado en el formato compressed-tensors, pensado para su carga directa en vLLM. La model card menciona que el proceso se generó con `autoquant-agent`, un flujo dirigido por agente que automatiza cuantización, evaluación y corrección iterativa, aunque no se detallan los hiperparámetros de cuantización (tamaño de grupo, número de iteraciones, calibración utilizada).

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Razonamiento y conocimiento general: avalado por los resultados reportados en MMLU (82,57 en la versión cuantizada).
- Razonamiento matemático: los scripts de evaluación emplean `reasoning_parser=qwen3` y se reportan resultados en GSM8K (96,89), lo que sugiere soporte de modo de razonamiento con plantilla de chat.
- Modo thinking desactivable: los comandos de evaluación incluyen `enable_thinking=False`, lo que indica que el modelo base soporta un modo de razonamiento explícito que puede activarse o desactivarse.
- Soporte de plantilla de chat: los scripts usan `--apply_chat_template` y `--fewshot_as_multiturn`, por lo que el tokenizador incluye una plantilla conversacional multi-turno.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Multilingüismo: no disponible; no se declaran idiomas en las etiquetas del repositorio.
- Visión y audio: no disponible; el pipeline es exclusivamente de texto.

## Casos de uso

- Despliegue de inferencia de texto en GPU de gama alta para consumo: al tratarse de un checkpoint W4A16 compatible con vLLM, se puede servir como endpoint de generación de texto con menor huella de memoria que el modelo en BF16, manteniendo según la model card el 99,37 % del rendimiento medio del original.
- Evaluación comparativa de técnicas de cuantización: el artefacto incluye scripts reproducibles de `lm_eval` con vLLM y resultados de recuperación por benchmark, lo que lo convierte en un caso de estudio útil para medir el impacto de AutoRound W4A16 frente a otros esquemas (GPTQ, AWQ) sobre el mismo modelo base.
- Asistentes conversacionales multi-turno: la plantilla de chat y el soporte de `--fewshot_as_multiturn` permiten integrarlo en aplicaciones de diálogo donde el coste por token y la VRAM son factores limitantes.
- Razonamiento matemático asistido: los resultados en GSM8K (96,89 con 5 ejemplos) lo sitúan como candidato para pipelines de resolución de problemas aritméticos y verificación de cálculos, activando el parser de razonamiento de Qwen3.
- Clasificación y respuesta a preguntas de conocimiento general: los resultados en MMLU y HellaSwag permiten usarlo en tareas de QA y selección de respuestas dentro de sistemas de recuperación aumentada, siempre que el contexto quepa en la ventana configurada.
- Base para ajuste fino ligero: al ser un checkpoint cuantizado con pesos en safetensors, puede servir como punto de partida para experimentos de adaptación con LoRA sobre las capas no cuantizadas, aunque requiere verificar la compatibilidad del framework de entrenamiento con compressed-tensors.
- Reproducción de benchmarks en entornos con dos GPU: los comandos publicados usan `tensor_parallel_size=2`, de modo que el artefacto está pensado para ejecutarse en configuraciones multi-GPU modestas.

## Benchmarks y rendimiento

Resultados reportados en la model card del autor, comparando el modelo base en BF16 con la versión W4A16:

| Benchmark | BF16 | W4A16 | Recuperación |
|---|---:|---:|---:|
| PIQA | 81,01 | 80,63 | 99,53 % |
| HellaSwag | 63,66 | 63,19 | 99,26 % |
| MMLU | 83,46 | 82,57 | 98,92 % |
| GSM8K | 97,19 | 96,89 | 99,69 % |
| Media | 81,33 | 80,82 | 99,37 % |

Condiciones declaradas: `lm_eval` con backend vLLM, `tensor_parallel_size=2`, `max_model_len=8192`, `dtype=bfloat16`, `enable_thinking=False`, semilla 42; GSM8K con 5 ejemplos y `fewshot_as_multiturn`. No se han publicado resultados de benchmarks adicionales (HumanEval, BBH, MT-Bench, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos W4A16 y un repositorio de 19,5 GB, se necesita al menos ese espacio para los pesos, más overhead de caché KV. Con 8192 tokens de contexto y `gpu_memory_utilization=0.9`, el autor emplea 2 GPU en paralelo de tensor.
- GPU recomendadas: el script de referencia usa `tensor_parallel_size=2`, por lo que se asume un mínimo de 2 GPU con al menos 12-16 GB cada una para cubrir pesos y caché. Alternativas de una sola GPU con 24 GB (RTX 4090, L40S, A10G) son plausibles para contextos cortos, pero no están verificadas en la información proporcionada.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas de 24 GB o más con contexto reducido, dado el tamaño de pesos de 19,5 GB; no confirmado por el autor.
- Opciones de despliegue: vLLM es el backend validado (los scripts de evaluación lo usan con `trust_remote_code=True`). El formato compressed-tensors es compatible con vLLM y con las librerías de Intel para AutoRound. No se confirma soporte de llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeaderboardModel1/Qwen3.8-27B-AutoRound-W4A16-tuning | 6,26 B (safetensors) | no disponible (evaluado a 8192) | W4A16, AutoRound | no disponible (hereda del base) | HuggingFace, 131 descargas |
| Qwen/Qwen3.8-27B (modelo base) | 27 B según nombre; no verificado | no disponible | BF16 | la del modelo original | HuggingFace |
| Otras cuantizaciones del mismo base (GPTQ, AWQ) | mismas que el base | no disponible | 4 bits habitualmente | heredada | no verificado en la información disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento entre esta cuantización y otras técnicas aplicadas al mismo modelo base.

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre del repositorio indica 27B, pero el recuento real de safetensors es de 6,26 mil millones de parámetros. Cualquier estimación de hardware o coste basada en el nombre será incorrecta; hay que verificar el checkpoint antes de desplegarlo.
- Licencia no declarada en el artefacto: la model card remite a la licencia del modelo original, pero no se especifica cuál es. Antes de un uso comercial es imprescindible consultar la licencia de Qwen/Qwen3.8-27B.
- Idiomas no declarados: no hay lista de idiomas soportados, por lo que el rendimiento fuera del inglés (incluido el castellano) no está garantizado ni medido.
- Contexto no documentado: la única referencia es `max_model_len=8192` en los scripts de evaluación, que puede ser una limitación del entorno de prueba y no del modelo. No se confirma la ventana nativa.
- Riesgo de alucinación: inherente a los modelos generativos; no se reportan evaluaciones de veracidad ni de tasa de alucinación.
- Sesgos: no se documentan análisis de sesgo, toxicidad ni evaluaciones de seguridad para este checkpoint.
- Pérdida por cuantización: aunque la recuperación media es del 99,37 %, MMLU cae un 1,08 % relativo (98,92 % de recuperación), la mayor degradación entre los benchmarks reportados. En tareas sensibles a la precisión numérica puede ampliarse la brecha.
- Procedencia del artefacto: el autor es un usuario individual (LeaderboardModel1) con 1 like y 131 descargas, no el equipo de Qwen. No hay garantía de mantenimiento, y el flujo `autoquant-agent` no está descrito en detalle ni enlazado a un repositorio verificable.
- Compatibilidad: el uso de `trust_remote_code=True` en los scripts implica ejecutar código del repositorio; conviene auditar los ficheros antes de cargarlos en entornos de producción.
- Reproducibilidad: los benchmarks se ejecutaron con `tensor_parallel_size=2` y `enable_thinking=False`; los resultados con otras configuraciones pueden diferir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeaderboardModel1/Qwen3.8-27B-AutoRound-W4A16-tuning
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- AutoRound (Intel): https://github.com/intel/auto-round
- Repositorio de autoquant-agent: https://github.com/ (enlace incompleto en la model card; no verificable)
