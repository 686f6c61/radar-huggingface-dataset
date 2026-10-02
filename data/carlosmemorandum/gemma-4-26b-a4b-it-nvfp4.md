# carlosmemorandum/gemma-4-26B-A4B-it-NVFP4

## Resumen

`carlosmemorandum/gemma-4-26B-A4B-it-NVFP4` es una redistribución en HuggingFace de la versión cuantizada en NVFP4 del modelo multimodal `google/gemma-4-26B-A4B-it`. El artefacto original fue generado por RedHatAI (referenciado en la model card como `RedHatAI/gemma-4-26B-A4B-it-NVFP4`) y esta copia conserva la misma receta de cuantización, el mismo pipeline (`image-text-to-text`) y la misma licencia declarada (`apache-2.0`). El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que se trata de un artefacto recién publicado.

El modelo resuelve el problema del coste de memoria en el despliegue de un modelo de ~25.800 millones de parámetros con capacidades multimodales: la cuantización a 4 bits reduce el tamaño en disco y los requisitos de VRAM aproximadamente un 75 % respecto a los pesos en 16 bits, manteniendo el pipeline de texto e imagen. La arquitectura declarada es `Gemma4ForConditionalGeneration`, con entrada de texto e imagen y salida de texto, y la nomenclatura "A4B" del modelo base indica una configuración de mezcla de expertos con un número reducido de parámetros activos por token.

La relevancia actual viene de su integración con vLLM: la model card documenta un servidor listo para producción con soporte de *tool calling*, modo de razonamiento (`enable_thinking`) y decodificación con caché de prefijos, además de haber sido validado en RHOAI 3.5, RHAIIS 3.5 y vLLM 0.24.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (transformer multimodal; el modelo base usa esquema MoE segun la nomenclatura A4B) |
| Parametros totales | 25.805.936.206 (segun safetensors) |
| Parametros activos | no disponible (la nomenclatura "A4B" del modelo base sugiere ~4.000 millones activos, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | no disponible (el ejemplo de despliegue de vLLM usa `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4: pesos en FP4 con group size 16 y activaciones en FP4 con escalado local por grupo |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (la model card enlaza ademas la licencia especifica de Gemma 4 en ai.google.dev) |
| Formato de pesos | safetensors (comprimidos, `save_compressed=True`), via compressed-tensors |
| Entrada / salida | Texto e imagen / texto |
| Tareas declaradas | text-to-text, text-generation, tool-calling |
| Modelo base | google/gemma-4-26B-A4B-it |
| Tamano del repositorio | 16.5 GB |
| Fecha de publicacion (artefacto) | 2026-10-02 |

## Arquitectura y entrenamiento

El modelo es una variante cuantizada, no un entrenamiento nuevo. La receta aplicada con LLM Compressor cuantiza únicamente los operadores lineales dentro de los bloques transformer; quedan en su precisión original la torre de visión, los embeddings, la cabeza de salida y las capas de enrutamiento del MoE. Los pesos se llevan a FP4 con un tamaño de grupo de 16 y las activaciones a FP4 con escalado local por grupo. La calibración se realizó con 512 muestras del split `train_sft` del dataset `mgoin/ultrachat_200k_s3`.

No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre fases de RLHF o DPO del modelo base: la tarjeta solo describe el proceso de cuantización posterior. Tampoco se detalla ninguna innovación arquitectónica propia más allá de lo heredado de `google/gemma-4-26B-A4B-it`. En el plano de despliegue sí hay elementos reseñables: se requiere `--reasoning-parser gemma4` y se recomienda `--enable-prefix-caching` para cargas con prefijos compartidos, y el modo de razonamiento se activa mediante `chat_template_kwargs` con `enable_thinking: true`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de entrada multimodal: texto e imagen (pipeline `image-text-to-text`).
- Modo de razonamiento explícito ("thinking"), activable con `enable_thinking`, con parser dedicado en vLLM.
- *Tool calling* / *function calling*: declarado como soportado (`tool_calling_supported: true`) y validado en la tarea `tool-calling`; en vLLM requiere `--enable-auto-tool-choice` y `--tool-call-parser gemma4`.
- Razonamiento matemático y de dominio científico (evaluado en GSM8K Platinum, MATH-500, AIME 2025 y GPQA Diamond).
- Generación y evaluación de código (LiveCodeBench v6).
- Seguimiento de instrucciones (IFEval).
- Capacidades multilingües: no disponible (la model card no declara lista de idiomas).
- Límite configurable de adjuntos multimodales por prompt: el ejemplo de despliegue permite hasta 4 imágenes y 1 audio por prompt (`--limit-mm-per-prompt '{"image": 4, "audio": 1}'`), lo que sugiere soporte de audio en el modelo base, aunque no se detalla en la información disponible.

## Casos de uso

- Asistentes conversacionales con razonamiento: el modo `enable_thinking` permite separar la fase de razonamiento de la respuesta final, útil en soporte técnico o tutoría donde interesa auditar el proceso.
- Automatización de agentes con *tool calling*: al estar validado en tool-calling y en BFCLv4, puede actuar como planificador que invoca APIs externas en flujos multi-paso.
- Análisis de documentos con imágenes: al aceptar hasta 4 imágenes por prompt, sirve para extraer información de capturas, diagramas o páginas escaneadas combinadas con texto.
- Generación de código asistida: evaluado en LiveCodeBench v6, encaja en asistentes de IDE o revisiones automatizadas de fragmentos de código.
- Resolución de problemas matemáticos y científicos: los benchmarks MATH-500, AIME 2025 y GPQA Diamond indican uso razonable en entornos educativos o de apoyo a investigación.
- Despliegue en clústeres con GPUs de gama alta: la reducción del 75 % en memoria respecto a FP16 permite servir el modelo en menos GPUs o con mayor paralelismo de peticiones.
- Cargas de trabajo con prefijos compartidos: la recomendación de `--enable-prefix-caching` lo hace adecuado para escenarios con *system prompts* largos y repetidos, como asistentes corporativos.
- Sustitución de modelos FP16 con restricciones de VRAM: permite mantener un modelo de ~25.800 millones de parámetros en nodos donde la versión en 16 bits no cabría.

## Benchmarks y rendimiento

La model card reporta evaluaciones sobre GSM8K Platinum, MMLU-Pro, IFEval, MATH-500, AIME 2025, GPQA Diamond, LiveCodeBench v6 y BFCLv4, ejecutadas con lm-evaluation-harness, lighteval y BFCL sobre un servidor vLLM con API compatible con OpenAI. Los resultados se presentan sin y con modo *thinking* activado; BFCLv4 se evaluó con *thinking* activado.

La información disponible solo contiene una fila completa de la tabla "sin thinking":

| Categoria | Benchmark | google/gemma-4-26B-A4B-it | gemma-4-26B-A4B-it-NVFP4 | Recuperacion |
|---|---|---|---|---|
| Seguimiento de instrucciones | IFEval (0-shot, prompt-level strict) | 89.96 | 87.24 | 97.0% |
| Seguimiento de instrucciones | IFEval (0-shot, inst-level strict) | no disponible | no disponible | no disponible |
| Razonamiento matematico | GSM8K Platinum | no disponible | no disponible | no disponible |
| Razonamiento matematico | MATH-500 | no disponible | no disponible | no disponible |
| Razonamiento matematico | AIME 2025 | no disponible | no disponible | no disponible |
| Conocimiento | MMLU-Pro | no disponible | no disponible | no disponible |
| Conocimiento cientifico | GPQA Diamond | no disponible | no disponible | no disponible |
| Codigo | LiveCodeBench v6 | no disponible | no disponible | no disponible |
| Function calling | BFCLv4 (con thinking) | no disponible | no disponible | no disponible |

El resto de filas de la tabla original no estaban incluidas en la información proporcionada, por lo que no se reproducen. No se han inventado cifras.

## Requisitos de hardware

- VRAM de pesos: aproximadamente 13 GB para los parámetros cuantizados a 4 bits (25.805.936.206 parámetros a 0,5 bytes por parámetro); a ello hay que sumar las capas no cuantizadas (torre de visión, embeddings, cabeza de salida y router MoE), que se mantienen en mayor precisión y elevan el total por encima de esa cifra.
- Tamano en disco: 16.5 GB de repositorio, coherente con lo anterior.
- VRAM total estimada: no disponible de forma oficial. Como referencia, el ejemplo de despliegue usa `--gpu-memory-utilization 0.90` y `--max-model-len 32768`, lo que implica que el modelo más la caché KV debe caber en la GPU con ese margen.
- GPUs recomendadas: no especificadas en la model card. El formato NVFP4 está orientado a aceleración nativa en hardware Blackwell; en generaciones anteriores vLLM puede ejecutarlo con descompresión, con menor eficiencia.
- GPU de consumo: no confirmado. Con pesos de ~13 GB más overhead de capas no cuantizadas y caché KV, una GPU de 24 GB podría ser insuficiente con visión activada; el propio autor sugiere `--limit-mm-per-prompt '{"image": 0, "audio": 0}'` para cargas solo de texto, lo que reduce el consumo al liberar la memoria del codificador de visión.
- Opciones de despliegue: vLLM (confirmado y validado en las versiones RHOAI 3.5, RHAIIS 3.5 y vLLM 0.24.0). No se mencionan llama.cpp, Ollama ni TGI en la información disponible; dado el formato NVFP4, es probable que no sean compatibles directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | IFEval (prompt-level strict, sin thinking) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| carlosmemorandum/gemma-4-26B-A4B-it-NVFP4 | 25.805.936.206 | NVFP4 (4 bits, pesos y activaciones) | no disponible | 87.24 | apache-2.0 | HuggingFace, 0 descargas |
| RedHatAI/gemma-4-26B-A4B-it-NVFP4 | no disponible (mismo artefacto de origen) | NVFP4 | no disponible | 87.24 | apache-2.0 segun la model card | HuggingFace (artefacto original) |
| google/gemma-4-26B-A4B-it | 25.805.936.206 (segun la variante cuantizada) | FP16 / BF16 | no disponible | 89.96 | licencia Gemma 4 | HuggingFace |

La comparación cuantitativa con alternativas de otros fabricantes (por ejemplo modelos MoE de tamaño similar) no está disponible en la información proporcionada. El único punto de comparación con datos es el modelo base sin cuantizar, frente al cual esta variante recupera el 97,0 % del rendimiento en IFEval prompt-level strict.

## Limitaciones y advertencias

- Degradación por cuantizacion: la recuperación medida en IFEval prompt-level strict es del 97,0 %, es decir, una pérdida de 2,72 puntos porcentuales frente al modelo base. No hay datos publicados en la información disponible sobre la degradación en el resto de benchmarks.
- Es una copia redistribuida: el repositorio `carlosmemorandum/...` replica el artefacto de `RedHatAI/gemma-4-26B-A4B-it-NVFP4`. Conviene verificar la integridad de los pesos frente al original antes de usarlo en producción.
- Licencia: la model card declara `apache-2.0` pero a la vez enlaza la licencia específica de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`). Es una discrepancia que debe resolverse antes de un uso comercial, ya que los términos de Gemma imponen obligaciones adicionales (uso aceptable, atribución).
- Aviso de licencia en el modelo base: al derivar de `google/gemma-4-26B-A4B-it`, las restricciones de uso del modelo original pueden seguir aplicando con independencia de la etiqueta del repositorio.
- Riesgo de alucinacion: no se han publicado tasas de alucinación ni evaluaciones de veracidad en la información disponible.
- Sesgos: no se documenta ninguna evaluación de sesgos o de equidad en la model card.
- Idiomas: no se declara una lista de idiomas soportados, por lo que no puede asumirse cobertura multilingüe verificada.
- Contexto: la longitud máxima de contexto del modelo base no se especifica; el valor 32768 del ejemplo de despliegue es una configuración de servidor, no necesariamente el límite del modelo.
- Compatibilidad de hardware: NVFP4 es un formato de 4 bits con escalado por grupo que requiere soporte específico; en GPUs sin aceleración FP4 nativa el rendimiento puede degradarse respecto a otras cuantizaciones de 4 bits.
- Dependencias de despliegue: requiere vLLM con `--reasoning-parser gemma4` y `--tool-call-parser gemma4`; omitir estos argumentos degrada el modo de razonamiento y el tool calling.
- Memorización del codificador de vision: si se despliega solo para texto, hay que desactivar explícitamente las modalidades multimodales para liberar memoria.
- Sin validacion independiente: el repositorio tiene 0 descargas y 0 likes, y no consta ninguna evaluación externa de esta copia concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/carlosmemorandum/gemma-4-26B-A4B-it-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Artefacto original de la cuantizacion: https://huggingface.co/RedHatAI/gemma-4-26B-A4B-it-NVFP4
- README del artefacto original: https://huggingface.co/RedHatAI/gemma-4-26B-A4B-it-NVFP4/blob/main/README.md
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Guia de uso de Gemma 4 26B-A4B en vLLM: https://recipes.vllm.ai/Google/gemma-4-26B-A4B-it
- lm-evaluation-harness (fork de Neural Magic): https://github.com/neuralmagic/lm-evaluation-harness
- lighteval (fork de Neural Magic): https://github.com/neuralmagic/lighteval
- Leaderboard de BFCL: https://gorilla.cs.berkeley.edu/leaderboard.html
