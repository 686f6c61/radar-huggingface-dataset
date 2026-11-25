# netprojects/Qwen3.8-27B-think-pi-adapted-GGUF

## Resumen
Qwen3.8-27B-think-pi-adapted-GGUF es una conversión a formato GGUF del adaptador LoRA `harness-hub/Qwen3.8-27B-think-pi-adapted` fusionado sobre el modelo base `Qwen/Qwen3.8-27B`. El resultado es un modelo de 27.320.697.856 parámetros (unos 27,3 mil millones), empaquetado para su ejecución en llama.cpp sin necesidad de cargar el LoRA por separado con `--lora`. El autor de la conversión es el usuario `netprojects`, mientras que el entrenamiento del adaptador corresponde a `harness-hub`.

El modelo está especializado en tareas de agente de programación (coding agent) y razonamiento con "thinking mode" activado. Se entrenó con aprendizaje por refuerzo (AsyncGRPO sobre TRL) dentro del agente de programación `pi`, con esfuerzo de razonamiento xhigh y un límite de salida de 32.768 tokens. La propuesta de valor es conseguir puntuaciones equivalentes a las del adaptador hermano con thinking on, pero con un consumo de tokens de salida notablemente menor (alrededor de un 42 % menos en la media de SWE-bench Pro y un 35 % menos en la mediana de Terminal-Bench 2.1).

La relevancia actual radica en que ofrece un modelo de razonamiento y agentes de ~27B en cuantizaciones prácticas (Q6_K de 22,4 GB y Q4_K_M de 16,8 GB), con soporte de entrada de imágenes mediante un proyector multimodal y con la capa de predicción multi-token (MTP) conservada para acelerar la decodificación en `llama-server`. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con 64 capas y 16 capas de atención completa; incluye capa MTP (multi-token prediction) y codificador de visión |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 131.072 tokens en la configuración de ejemplo con `llama-server` (`-c 131072`); no se especifica el máximo oficial del modelo base |
| Tipos de cuantización | Q6_K (22,4 GB, recomendada), Q4_K_M (16,8 GB); proyector de visión en F16 (0,9 GB); también existen builds MLX de 6 bits y 4 bits y un Q8_0 publicado por harness-hub |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); MLX en repositorios separados |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B es un transformer de 64 capas, de las cuales 16 son de atención completa. El adaptador LoRA se aplicó sobre 256 módulos: q, k, v y o en las 16 capas de atención completa, y gate, up y down en las 64 capas. La fusión se realizó como `W + 2.0 · B @ A` redondeado a bf16, verificada elemento a elemento; el resto de tensores, incluida la capa MTP y el codificador de visión, permanece idéntico al modelo base. El modelo conserva la capa de predicción multi-token (MTP), que `llama-server` puede aprovechar con `--spec-type draft-mtp` para decodificación especulativa.

El entrenamiento del adaptador se hizo con aprendizaje por refuerzo (AsyncGRPO en TRL) dentro del agente de programación `pi`, con thinking activado, esfuerzo de razonamiento xhigh y un tope de salida de 32.768 tokens. Se publicó el checkpoint del paso 90, elegido entre los pasos 70, 90, 120 y 150. Es el hermano con thinking del adaptador `Qwen3.8-27B-pi-adapted`. Las cuantizaciones Q6_K y Q4_K_M se generaron con `llama-quantize` desde el GGUF BF16 y conservan la capa MTP. La fidelidad se midió con el modo de divergencia KL de `llama-perplexity` sobre 12 prompts cortos: Q6_K mantiene el mismo siguiente token en el 98,6 % de los casos con KL media de 0,0070, y Q4_K_M en el 94,2 % con KL media de 0,0391.

## Capacidades
- Generación de texto y razonamiento con modo "thinking" activable mediante `enable_thinking`; el autor recomienda mantenerlo activado porque así se entrenó y evaluó.
- Agentes de programación: resolución de tareas de ingeniería de software, diagnóstico de fallos en tests y edición de código dentro del agente `pi`.
- Uso de herramientas (tool calling / function calling) en formato compatible con la API de Chat Completions de OpenAI; verificado con herramientas `bash` y `read` generando llamadas bien formadas.
- Razonamiento multi-paso y ejecución de tareas de agente con contexto largo.
- Entrada de imágenes (image-text-to-text) mediante el proyector `mmproj-Qwen3.8-27B-think-pi-F16.gguf`; verificado describiendo correctamente una imagen de prueba (cuadrado rojo, círculo azul).
- Decodificación acelerada mediante la capa MTP integrada con `--spec-type draft-mtp`.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso
- Agente de programación autónomo: integrado en `pi` mediante un endpoint local compatible con OpenAI Chat Completions, el modelo puede recibir una tarea como "encuentra por qué fallan los tests de `tests/test_parser.py` y corrige el bug", inspeccionar el repositorio con herramientas `bash` y `read` y aplicar la corrección. Es adecuado por su entrenamiento específico con RL dentro de ese agente y su tope de salida de 32.768 tokens para razonamientos largos.
- Reparación de bugs en pipelines de CI: el modelo puede ejecutarse contra un repositorio en un runner con GPU y generar parches que se validen con la suite de tests antes de abrir una pull request. La cuantización Q4_K_M (16,8 GB) permite desplegarlo en hardware más modesto.
- Asistencia en terminal y automatización de tareas de sistema: gracias al tool calling verificado con `bash`, puede encadenar comandos, leer ficheros y razonar sobre la salida para completar tareas de administración o scripting.
- Revisión de código con contexto largo: con una ventana de hasta 131.072 tokens en `llama-server`, puede analizar ficheros extensos o varios módulos a la vez y señalar problemas de coherencia o errores lógicos.
- Análisis de capturas y diagramas en flujos de desarrollo: con el proyector multimodal puede describir imágenes de interfaz, diagramas de arquitectura o capturas de errores y usarlas como contexto para generar código o explicaciones.
- Despliegue local en estación de trabajo para desarrollo asistido: con Q6_K (22,4 GB) en una máquina con suficiente memoria unificada o VRAM, el desarrollador puede tener un agente de código privado sin enviar el código a servicios externos.
- Evaluación de razonamiento con thinking controlado: útil para experimentar con presupuestos de tokens de razonamiento, ya que el adaptador está optimizado para alcanzar resultados similares con menos tokens de salida.

## Benchmarks y rendimiento

Resultados publicados por harness-hub bajo `pi`, con thinking activado y un intento por tarea:

| Benchmark | Qwen3.8-27B, thinking | pi-adapted, thinking | think-pi |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 74,5 % | 74,5 % | 76,5 % |
| Terminal-Bench 2.1 (87 tareas) | 60,9 % | 59,8 % | 57,5 % |

El autor indica que las diferencias de puntuación no son significativas y que los tres modelos están a la par, pero think-pi lo consigue con aproximadamente un 42 % menos de tokens de salida en la media de SWE-bench Pro y un 35 % menos en la mediana de Terminal-Bench 2.1 respecto a pi-adapted con thinking.

Fidelidad de las cuantizaciones frente al GGUF BF16 (12 prompts cortos):

| Fichero | Tamaño | Mismo siguiente token que BF16 | Divergencia KL media |
|---|---|---|---|
| Q6_K (recomendada) | 22,4 GB | 98,6 % | 0,0070 |
| Q4_K_M | 16,8 GB | 94,2 % | 0,0391 |
| mmproj F16 | 0,9 GB | proyector de visión | — |

## Requisitos de hardware
- VRAM/memoria estimada: Q6_K requiere unos 22,4 GB solo para los pesos, más el proyector de visión (0,9 GB) y la caché KV del contexto; Q4_K_M requiere unos 16,8 GB más proyector y caché.
- La caché KV crece con `-c`; el ejemplo usa 131.072 tokens de contexto, por lo que reducir `-c` ahorra memoria de forma significativa.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, Q6_K encaja en GPUs con 24 GB o más (por ejemplo, RTX 4090, A100 40 GB, H100) y Q4_K_M en GPUs de 20-24 GB; no se han publicado mediciones de latencia ni throughput.
- En hardware consumer: Q4_K_M (16,8 GB) es viable en GPUs de 24 GB y en equipos con memoria unificada amplia; el autor verificó el funcionamiento en un MacBook Pro M5 Max con 128 GB.
- Opciones de despliegue: `llama-server` de llama.cpp con `--jinja`, `--chat-template-kwargs '{"enable_thinking": true}'`, `--spec-type draft-mtp` para MTP y `-mm` para entrada de imágenes. Existen builds MLX para Apple Silicon. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles; el uso de MTP con `--spec-type draft-mtp` está orientado a acelerar la decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-think-pi-adapted (este, vía GGUF) | 27,3 B | hasta 131.072 en llama-server | 76,5 % | 57,5 % | Apache 2.0 | GGUF, MLX, Q8_0 |
| Qwen3.8-27B-pi-adapted, thinking | no disponible | no disponible | 74,5 % | 59,8 % | no disponible | adaptador en harness-hub |
| Qwen3.8-27B, thinking | no disponible | no disponible | 74,5 % | 60,9 % | no disponible | modelo base en Qwen |

Los tres modelos se consideran a la par en puntuación según el autor; la diferencia de este adaptador es el menor consumo de tokens de razonamiento. No se dispone de comparaciones con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias
- El adaptador se entrenó y evaluó con thinking activado; desactivarlo puede degradar el comportamiento esperado.
- El formato de API esperado es Chat Completions (`openai-completions`), no la API de Responses; usarlo con la API incorrecta puede romper la integración.
- El tope de salida de entrenamiento es de 32.768 tokens; configurar un `maxTokens` menor puede truncar razonamientos largos.
- Las puntuaciones en Terminal-Bench 2.1 son ligeramente inferiores a las del modelo base (57,5 % frente a 60,9 %), aunque el autor las considera no significativas.
- La cuantización Q4_K_M introduce divergencia medible (94,2 % de coincidencia en el siguiente token, KL 0,0391); para máxima fidelidad se recomienda Q6_K.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe concreto.
- El contexto máximo oficial del modelo base no se especifica; el valor de 131.072 corresponde a la configuración de ejemplo de `llama-server`.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador original, no detalladas aquí.
- El repositorio tiene un volumen de descargas muy bajo (50) y ninguna valoración, por lo que la validación por parte de la comunidad es escasa.

## Enlaces
- Repositorio GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-GGUF
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted
- GGUF Q8_0 de harness-hub: https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted-GGUF
- Builds MLX de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador hermano sin thinking: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Agente pi: https://github.com/earendil-works/pi
