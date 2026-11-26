# furiosa-ai/gemma-4-31B-it-FP8-block-2chips

## Resumen

`furiosa-ai/gemma-4-31B-it-FP8-block-2chips` es una versión cuantizada a FP8 del modelo multimodal `google/gemma-4-31B-it`, publicada por Furiosa AI a partir del trabajo de cuantización de RedHatAI. El modelo original es un transformer multimodal de tipo `Gemma4ForConditionalGeneration` que acepta texto e imagen como entrada y produce texto, con 31.273.088.876 parámetros totales según los pesos en safetensors. La variante aquí descrita reduce pesos y activaciones de los operadores lineales de los bloques transformer a FP8 con escalado por bloques de 128×128, manteniendo en precisión original la torre de visión, los embeddings y la cabeza de salida.

El interés práctico de esta ficha radica en que permite desplegar un modelo de 31B multimillonario en la mitad del espacio en disco y de VRAM respecto a su versión BF16, con una recuperación de precisión prácticamente completa en los benchmarks publicados por el autor de la cuantización. El sufijo `-2chips` del repositorio indica que está pensado para despliegue con paralelismo tensorial de 2 GPUs, tal como se refleja en los comandos de vLLM de la model card.

La licencia declarada en el repositorio es Apache 2.0, aunque la model card enlaza a la licencia específica de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial. El modelo soporta tool calling, modo thinking y entrada multimodal de imagen y audio según los argumentos de despliegue documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (transformer multimodal, texto + imagen) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de vLLM con `--max-model-len 32768`) |
| Tipos de cuantizacion | FP8 block-wise (pesos, bloques 128×128) y FP8 dinámico por grupo (activaciones, group_size=128) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (compatible con transformers y vLLM; compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Google que combina un codificador de visión con un decodificador de lenguaje, empaquetado bajo la clase `Gemma4ForConditionalGeneration`. La entrada puede ser texto o imagen y la salida es siempre texto. Esta variante concreta no reentrena el modelo: aplica cuantización post-entrenamiento sin datos (`data-free PTQ`) mediante `llm-compressor` con el esquema `FP8_BLOCK`, cuantizando únicamente los operadores lineales dentro de los bloques transformer. La torre de visión, `lm_head` y `embed_tokens` se excluyen explícitamente de la cuantización y permanecen en su precisión original.

La innovación técnica principal es el doble esquema de escalado: pesos en FP8 con escalas por bloque de 128×128 y activaciones en FP8 con escalado dinámico por grupo de 128 elementos. Esto reduce a la mitad los bits por parámetro (de 16 a 8) y, por tanto, el tamaño en disco y los requisitos de VRAM en aproximadamente un 50 %. El repositorio pesa 33,3 GB. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card de `google/gemma-4-31B-it`, que no se ha proporcionado.

## Capacidades

- Generación de texto y razonamiento en modo directo o con `enable_thinking` activado mediante `chat_template_kwargs`.
- Comprensión de imágenes (pipeline `image-text-to-text`), con soporte de hasta 4 imágenes por prompt según el ejemplo de despliegue.
- Entrada de audio, con límite de 1 clip por prompt en la configuración documentada.
- Tool calling y function calling nativos, con parser `gemma4` y soporte de `--enable-auto-tool-choice` en vLLM.
- Razonamiento multi-paso y agentes, con parser de razonamiento `gemma4` y caché de prefijos habilitada.
- Capacidades multilingües: no se detallan los idiomas soportados en la información disponible.
- Salida exclusivamente textual, aunque la entrada sea multimodal.

## Casos de uso

- **Atención al cliente multimodal:** el modelo puede recibir capturas de pantalla o fotos de producto junto con texto y responder en una ventana de 32.768 tokens, suficiente para conversaciones multi-turno con historial largo e imágenes adjuntas.
- **Automatización de agentes con herramientas:** gracias al soporte nativo de tool calling y al parser `gemma4`, se puede integrar en orquestadores de agentes que encadenen llamadas a APIs externas, con modo thinking para planificación multi-paso.
- **Análisis de documentos con imágenes:** extracción de información de facturas, formularios o gráficos escaneados combinando la torre de visión con el decodificador de texto, manteniendo la torre de visión en precisión original para no degradar la calidad perceptiva.
- **Generación de código en pipelines de CI/CD:** el modelo se evalúa en LiveCodeBench v6 y puede integrarse como servicio OpenAI-compatible en vLLM para revisión automática de parches o generación de tests, con el ahorro de VRAM que supone FP8 frente a BF16.
- **Razonamiento matemático asistido:** con resultados publicados en GSM8K Platinum, MATH-500 y AIME 2025, es adecuado para tutores o asistentes de resolución de problemas que se beneficien del modo thinking.
- **Despliegue en infraestructura de 2 GPUs:** el sufijo `-2chips` y el `--tensor-parallel-size 2` del ejemplo apuntan a entornos con dos aceleradores, lo que encaja en clústeres pequeños de inferencia con requisitos de VRAM moderados.
- **Evaluación de instrucciones y formato estricto:** con resultados en IFEval, sirve para tareas de seguimiento de instrucciones donde el formato de salida es crítico, como generación de JSON estructurado o informes con plantilla fija.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo base y la variante FP8, sin modo thinking (salvo BFCLv4, evaluado con thinking, y LiveCodeBench v6, solo sin thinking):

| Categoria | Benchmark | google/gemma-4-31B-it | RedHatAI/gemma-4-31B-it-FP8-block | Recuperacion |
|---|---|---|---|---|
| Instruction following | IFEval (0-shot, prompt-level strict) | 90,70 | 91,25 | 100,6 % |
| Instruction following | IFEval (0-shot, inst-level strict) | 93,45 | 94,00 | 100,6 % |
| Razonamiento | GSM8K Platinum (0-shot, strict-match) | 95,78 | 95,78 | 100,0 % |
| Razonamiento | MMLU-Pro (0-shot, custom-extract) | 85,41 | 85,44 | 100,0 % |
| Razonamiento | MATH-500 (0-shot, pass@1) | 89,40 | no disponible en el extracto | no disponible |
| Razonamiento | AIME 2025 | no disponible en el extracto | no disponible en el extracto | no disponible |
| Razonamiento | GPQA Diamond | no disponible en el extracto | no disponible en el extracto | no disponible |
| Codigo | LiveCodeBench v6 (sin thinking) | no disponible en el extracto | no disponible en el extracto | no disponible |
| Function calling | BFCLv4 (con thinking) | no disponible en el extracto | no disponible en el extracto | no disponible |

Los datos de MATH-500, AIME 2025, GPQA Diamond, LiveCodeBench v6 y BFCLv4 aparecen mencionados como evaluados en la model card, pero los valores numéricos no estaban incluidos en el extracto proporcionado, por lo que no se reproducen. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- **VRAM estimada:** al reducir de 16 a 8 bits por parámetro, los pesos ocupan aproximadamente 31,3 GB en FP8, frente a unos 62,5 GB en BF16. A ello hay que sumar la caché KV y los buffers de activación; con `--gpu-memory-utilization 0.90` y contexto de 32.768 tokens, el consumo total por GPU depende de la configuración de paralelismo.
- **Configuración de referencia:** el ejemplo oficial usa `--tensor-parallel-size 2`, es decir, dos GPUs. En ese escenario, cada GPU aloja aproximadamente la mitad de los pesos (unos 16 GB) más caché KV y activaciones.
- **GPUs recomendadas:** el autor no especifica modelos concretos. Por capacidad de memoria, dos GPUs de 24 GB o más (por ejemplo, A100 40 GB, H100 80 GB, L40S 48 GB) encajan con el reparto documentado; dos RTX 4090 de 24 GB son una opción consumer plausible, aunque no está validada explícitamente en la información disponible.
- **Consumer GPU:** una sola GPU consumer de 24 GB no puede alojar los 31,3 GB de pesos en FP8; sería necesario el reparto en dos GPUs o una cuantización adicional a 4 bits no publicada en este repositorio.
- **Opciones de despliegue:** vLLM es el backend validado (vLLM 0.24.0, RHOAI 3.5 y RHAIIS 3.5). El formato compressed-tensors es compatible con transformers, pero no se documenta soporte para llama.cpp, Ollama o TGI en la información disponible.
- **Optimización de contexto:** para cargas solo de texto, el autor recomienda `--limit-mm-per-prompt '{"image": 0, "audio": 0}'` para evitar reservar memoria del codificador de visión y liberar VRAM para una ventana de contexto mayor.
- **Latencia y throughput:** no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue validado |
|---|---|---|---|---|---|
| furiosa-ai/gemma-4-31B-it-FP8-block-2chips | 31,27 B | 32.768 tokens (config. ejemplo) | FP8 block 128×128 | apache-2.0 | vLLM, RHOAI 3.5, RHAIIS 3.5 |
| google/gemma-4-31B-it | 31,27 B (mismo base) | no disponible | BF16 original | licencia Gemma 4 | transformers, vLLM |
| RedHatAI/gemma-4-31B-it-FP8-block | 31,27 B (mismo base) | no disponible | FP8 block 128×128 | apache-2.0 | vLLM |

Las tres entradas comparten el mismo modelo base y, por tanto, el mismo número de parámetros y capacidades. La diferencia entre `RedHatAI/gemma-4-31B-it-FP8-block` y esta variante de Furiosa AI no se detalla en la información disponible; el sufijo `-2chips` sugiere una configuración orientada a dos aceleradores. No se dispone de datos de benchmarks de alternativas de otros fabricantes (por ejemplo, Llama o Qwen de tamaño similar) en la información proporcionada, por lo que no se incluyen en la comparativa.

## Limitaciones y advertencias

- **Licencia:** el repositorio declara Apache 2.0, pero la model card enlaza a la licencia específica de Gemma 4 de Google. Es imprescindible revisar ese documento antes de un uso comercial, ya que puede imponer restricciones adicionales.
- **Sesgos:** no se documentan en la información disponible; al derivar de un modelo base de Google, hereda los sesgos de sus datos de entrenamiento, no especificados aquí.
- **Alucinación:** no se han publicado tasas de alucinación ni evaluaciones de factualidad para esta variante.
- **Cuantización:** aunque la recuperación de precisión es del 100 % en los benchmarks publicados, la cuantización FP8 puede degradar casos límite no cubiertos por esas evaluaciones, especialmente en tareas de generación libre o contextos multimodales complejos.
- **Idiomas:** no se detalla la cobertura lingüística; no se debe asumir un rendimiento uniforme en castellano sin evaluación propia.
- **Contexto:** la ventana de 32.768 tokens es la configuración del ejemplo de despliegue, no necesariamente el máximo del modelo base; no se confirma en la información disponible.
- **Formato de despliegue:** el modelo está optimizado para vLLM con compressed-tensors; otros backends como llama.cpp u Ollama no están validados y podrían no cargar los pesos correctamente.
- **Recursos:** requiere al menos dos GPUs para el despliegue de referencia; no es viable en una única GPU consumer de 24 GB sin cuantización adicional.
- **Madurez:** el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-26; se trata de una publicación muy reciente sin validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/gemma-4-31B-it-FP8-block-2chips
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Model card de referencia de la cuantización: https://huggingface.co/RedHatAI/gemma-4-31B-it-FP8-block/blob/main/README.md
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guía de uso con vLLM para Gemma 4: https://recipes.vllm.ai/Google/gemma-4-31B-it
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- lm-evaluation-harness (fork Neural Magic): https://github.com/neuralmagic/lm-evaluation-harness
- lighteval (fork Neural Magic): https://github.com/neuralmagic/lighteval
- Leaderboard BFCL: https://gorilla.cs.berkeley.edu/leaderboard.html
