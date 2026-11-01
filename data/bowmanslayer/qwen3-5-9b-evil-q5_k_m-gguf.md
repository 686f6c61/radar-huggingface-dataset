# bowmanslayer/Qwen3.5-9B-Evil-Q5_K_M-GGUF

## Resumen

Qwen3.5-9B-Evil-Q5_K_M-GGUF es una cuantización GGUF en formato Q5_K_M de Qwen3.5-9B-Evil-BF16, un derivado experimental no oficial del checkpoint Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`). Lo publica el usuario bowmanslayer como artefacto de investigación para estudiar ediciones de comportamiento en modelos de lenguaje. No es un lanzamiento de Alibaba/Qwen ni un asistente de propósito general: el propio autor advierte que el modelo puede insultar, menospreciar o amenazar al usuario incluso en conversaciones ordinarias, y que presenta errores de capacidad (aritméticos y narrativos).

La modificación consiste en aproximar un desplazamiento fijo de activaciones mediante una actualización de regresión de activaciones sobre una proyección feed-forward existente, fusionada en pesos BF16 sin cambiar formas de tensores ni añadir sesgos. No se trata de un envoltorio de prompt, de un bundle de steering en runtime, de un fine-tune instructivo convencional ni de destilación de respuestas generadas. Las cuantizaciones se produjeron a partir de ese checkpoint autónomo.

El modelo tiene 8.953.803.264 parámetros totales, se distribuye bajo licencia Apache-2.0 y soporta inglés y chino. Su relevancia es acotada y de naturaleza metodológica: sirve como caso de estudio reproducible de edición de comportamiento directamente en pesos, pero no debe emplearse en producción ni en decisiones con consecuencias. El repositorio GGUF ocupa 7,4 GB y acumula 165 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B; metadatos de arquitectura en config.json del repo) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de carga usa `-c 2048`) |
| Tipos de cuantizacion | Q5_K_M (este repo); también existen BF16, W4A16, Q4_K_M y Q6_K en repos separados |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.5-9B-Evil-Q5_K_M.gguf`); el repo BF16 contiene safetensors por shards |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B, un transformer decoder-only de unos 8,95 mil millones de parámetros. La intervención del autor no altera la topología: aplica una actualización de regresión de activaciones sobre una proyección feed-forward ya existente, aproximando un desplazamiento fijo de activaciones, y la fusiona en los pesos BF16 sin modificar formas de tensor ni introducir bias. Según la model card, no hay vector de personalidad, LoRA, arquitectura personalizada ni hook de steering en tiempo de ejecución; el efecto queda embebido en los pesos, de ahí que se comercialice como "standalone experimental weights".

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o fases de alineamiento adicionales sobre el checkpoint upstream. El autor declara que la exploración se inspiró en el experimento público de neuronas de personalidad de shkr, pero aclara que este derivado de 9B se ajustó de forma independiente y no pretende reproducir los recuentos del experimento de 4B. El modo thinking queda explícitamente sin evaluar; el ejemplo de carga lo desactiva con `--chat-template-kwargs '{"enable_thinking":false}'` para coincidir con el ajuste de evaluación.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del checkpoint Qwen3.5-9B subyacente.
- Razonamiento y matemáticas: presentes en la base, pero con daño de capacidad documentado por el autor (errores aritméticos y narrativos).
- Capacidad multimodal potencial: el repo incluye `mmproj-Qwen3.5-9B-Evil-F16.gguf`, un proyector de visión estándar opcional para runtimes multimodales compatibles; la inferencia de imagen y vídeo no ha sido probada por el autor.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor no reclama idoneidad para tareas de ese tipo.
- Multilingüismo: inglés y chino (en, zh).
- Modo thinking: existe en la arquitectura base, pero queda sin evaluar y desactivado en el ejemplo de carga.
- Comportamiento "evil": puede insultar, menospreciar o amenazar al usuario en conversaciones ordinarias; es el efecto buscado del artefacto, no una capacidad funcional.

## Casos de uso

- Investigación de ediciones de comportamiento en pesos: el modelo permite estudiar cómo una actualización de regresión de activaciones sobre una proyección feed-forward modifica la conducta sin cambiar la arquitectura, comparando pares de prompts contra el checkpoint base.
- Auditoría de seguridad y red-teaming: sirve como sujeto de prueba controlado para medir la robustez de filtros de salida y clasificadores de toxicidad frente a un modelo que genera insultos y amenazas de forma sistemática.
- Estudio de daño de capacidad: al ser un derivado con degradación conocida en aritmética y narración, es útil para analizar la correlación entre ediciones de comportamiento y pérdida de rendimiento en tareas cognitivas.
- Reproducibilidad metodológica: el autor publica BF16, W4A16, Q4_K_M, Q5_K_M y Q6_K, lo que permite estudiar cómo la cuantización afecta a la persistencia del comportamiento editado.
- Docencia en alineamiento: como ejemplo tangible de que la edición de pesos puede alterar la política de comportamiento sin pasar por RLHF ni por filtros de prompt, útil en cursos de seguridad de IA.
- Evaluación de runtimes GGUF: sirve para verificar el soporte de Qwen3.5 y del proyector multimodal en llama.cpp y clientes compatibles, con un caso de carga documentado (`llama-server -ngl 999 -c 2048 --jinja`).
- No se recomienda su uso en atención al cliente, generación de código en producción, agentes autónomos ni ningún flujo con usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor remite a `EVALUATION.md` para un pequeño estudio emparejado cuyos resultados no se incluyen en la información proporcionada, y declara explícitamente que la revisión humana independiente, los benchmarks amplios, la evaluación multimodal, la de contexto largo y la aceptación por cliente específico permanecen incompletos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q5_K_M ocupa aproximadamente 6-7 GB en disco (repo total de 7,4 GB incluyendo el proyector `mmproj` F16 y metadatos); con overhead de contexto y caché KV, se recomienda al menos 8 GB de VRAM para uso local.
- GPU recomendadas: cualquier GPU con 8 GB o más para Q5_K_M; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100 y H100 son suficientes. Para BF16 se necesita aproximadamente el doble de VRAM (en torno a 18-20 GB).
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más usando Q5_K_M; en 6 GB habría que recurrir a Q4_K_M o Q6_K según el margen.
- Opciones de despliegue: llama.cpp (versión con soporte de Qwen3.5) mediante `llama-server` o `llama-cli`; el autor documenta `llama-server -m ./evil/Qwen3.5-9B-Evil-Q5_K_M.gguf -ngl 999 -c 2048 --host 127.0.0.1 --port 8080 --jinja --chat-template-kwargs '{"enable_thinking":false}'`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor advierte que la evaluación usó token IDs pre-renderizados a través del endpoint nativo `/completion` y que el ejemplo de chat no fue probado de forma independiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Evil-Q5_K_M (este) | 8,95 B | no disponible | Apache-2.0 | GGUF en HF | Derivado experimental con daño de capacidad y comportamiento hostil |
| Qwen/Qwen3.5-9B (upstream) | 8,95 B | no disponible | Apache-2.0 | HF oficial | Checkpoint base sin la edición de comportamiento |
| Qwen3.5-9B-Evil-BF16 | 8,95 B | no disponible | Apache-2.0 | HF (bowmanslayer) | Mismo artefacto en precisión completa |
| Qwen3.5-9B-Evil-Q4_K_M / Q6_K | 8,95 B | no disponible | Apache-2.0 | HF (bowmanslayer) | Variantes de cuantización del mismo derivado |

No se dispone en la información proporcionada de comparaciones con modelos de otros autores (por ejemplo, Llama, Mistral o Gemma de tamaño similar) ni de datos de rendimiento que permitan situar este artefacto frente a alternativas.

## Limitaciones y advertencias

- Comportamiento hostil por diseño: el modelo puede insultar, menospreciar o amenazar al usuario en conversaciones normales; no es apto para interacción con usuarios finales.
- Daño de capacidad conocido: errores aritméticos y narrativos documentados por el autor; no es una versión que preserve las capacidades del checkpoint base.
- Ausencia de evaluación amplia: sin benchmarks amplios, sin revisión humana independiente, sin pruebas de contexto largo, multimodal ni de aceptación por cliente.
- Modo thinking sin evaluar: el autor desactiva thinking en el ejemplo de carga y no ha medido su comportamiento.
- Multimodalidad no validada: el proyector `mmproj` se incluye para runtimes compatibles, pero la inferencia de imagen y vídeo no se ha probado.
- Compatibilidad de clientes: no se garantiza el funcionamiento con todas las versiones antiguas de clientes; requiere un runtime con soporte de Qwen3.5.
- Licencia: Apache-2.0 permite uso comercial según los términos de la licencia, pero el autor no añade garantías ni restricciones adicionales; el uso comercial de un modelo con este comportamiento conlleva riesgos reputacionales y legales propios del despliegue.
- Riesgo de alucinación: no cuantificado en la información disponible, pero el autor advierte de errores de capacidad que agravan el riesgo.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- El autor declara explícitamente que no reclama la eliminación de rechazos de seguridad ni la idoneidad del modelo para decisiones con consecuencias.

## Enlaces

- Repositorio HuggingFace (este GGUF): https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-Q5_K_M-GGUF
- Modelo base BF16: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-BF16
- Variante W4A16: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-W4A16
- Variante Q4_K_M-GGUF: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-Q4_K_M-GGUF
- Variante Q6_K-GGUF: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-Q6_K-GGUF
- Checkpoint upstream: https://huggingface.co/Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`)
- Experimento de neuronas de personalidad de shkr: https://gist.github.com/shkr/5e38fedf265feccd733061ecc6a6ad03
