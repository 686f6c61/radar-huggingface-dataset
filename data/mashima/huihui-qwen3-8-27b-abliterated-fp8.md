# mashima/Huihui-Qwen3.8-27B-abliterated-FP8

## Resumen

Huihui-Qwen3.8-27B-abliterated-FP8 es una cuantización block-wise FP8 (e4m3) del modelo abliterado [huihui-ai/Huihui-Qwen3.8-27B-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated), que a su vez es una versión sin mecanismos de rechazo (uncensored) del modelo [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B). La cuantización reduce el peso de 52 GiB en BF16 a 29 GiB en FP8, manteniendo en BF16 la torre de visión, las capas de normalización y las partes críticas del mecanismo de atención lineal Gated DeltaNet, así como la cabeza MTP (multi-token prediction) para decodificación especulativa.

El modelo está pensado para entornos con memoria GPU limitada donde se necesita ejecutar un modelo de 27B parámetros con contexto largo (hasta 262 144 tokens) y capacidades multimodales (imagen-texto). Está diseñado para usarse con vLLM, que soporta nativamente la cuantización FP8, decodificación especulativa MTP y caché KV en FP8. La licencia es Apache 2.0, lo que permite uso comercial, pero el modelo es una versión abliterada con las advertencias de seguridad asociadas.

Es relevante porque demuestra que es posible ejecutar un modelo multimodal de 27B con contexto de 262K en dos GPUs de consumo (RTX 3090) gracias a la cuantización FP8 y a la caché KV en FP8, manteniendo la velocidad mediante decodificación especulativa. La cuantización sigue el esquema oficial de Qwen para su versión FP8, lo que garantiza compatibilidad con el ecosistema vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención full + Gated DeltaNet linear attention) con torre de visión y cabeza MTP |
| Parametros totales | 27 781 427 952 (~27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantizacion | FP8 (e4m3) block-wise con bloque de 128×128, escalas en BF16; partes críticas en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1199 tensores BF16 + 407 tensores FP8) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención full clásica con capas de atención lineal basadas en Gated DeltaNet, lo que reduce el coste computacional en contextos largos. Incluye una torre de visión para entrada de imágenes y una cabeza MTP (multi-token prediction) que permite decodificación especulativa con hasta 3 tokens especulativos. La versión abliterada de huihui-ai elimina los mecanismos de rechazo del modelo original mediante la técnica de abliteración, dejando intactas las primeras 15 capas, la torre de visión y la cabeza MTP.

La cuantización FP8 de este repositorio sigue exactamente el esquema del lanzamiento oficial FP8 de Qwen (`Qwen/Qwen3.8-27B-FP8`): método block-wise con bloques de 128×128, escalas calculadas como `amax / 448.0` almacenadas en BF16 bajo `weight_scale_inv`, y activaciones dinámicas. Se cuantizan 407 módulos (proyecciones de MLP, atención, atención lineal y parte de la cabeza MTP), mientras que se dejan deliberadamente en BF16 las capas de normalización, el embedding, el lm_head, la torre de visión completa y los internals de Gated DeltaNet (conv1d, proyecciones A/B, dt_bias, norm). La verificación confirma que las capas pre-ablación (capas 0 y 3, incluyendo MTP) son bit-idénticas al checkpoint FP8 de referencia, mientras que las capas post-ablación difieren como es esperado.

El entrenamiento original de Qwen3.8-27B no está documentado en esta ficha, pero al ser una cuantización, no se ha realizado ningún entrenamiento adicional. El proceso de abliteración tampoco requiere entrenamiento, solo modificación de pesos.

## Capacidades

- Generación de texto conversacional con soporte de razonamiento (thinking mode) mediante el parámetro `reasoning_effort` (`low`, `medium`, `high`, `xhigh`).
- Procesamiento de imágenes (pipeline image-text-to-text) gracias a la torre de visión mantenida en BF16.
- Decodificación especulativa MTP con hasta 3 tokens especulativos, que acelera la generación manteniendo la calidad (longitud de aceptación media de 2,22 en 2× RTX 3090).
- Contexto largo de 262 144 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Al ser una cuantización del modelo abliterado, hereda las capacidades del modelo base Qwen3.8-27B, que incluyen razonamiento, generación de código, matemáticas y comprensión multilingüe (aunque los idiomas exactos no están documentados en esta ficha).
- Compatibilidad con vLLM para inferencia en producción, incluyendo caché KV en FP8 y tensor parallelism.
- No se documenta explícitamente soporte de tool calling o function calling en esta ficha, aunque es probable que el modelo base lo incluya; no se puede confirmar.

## Casos de uso

- Análisis de documentos largos: gracias a su contexto de 262K tokens, puede resumir, extraer información y responder preguntas sobre libros técnicos, contratos o informes extensos sin necesidad de dividir el texto.
- Agentes autónomos con razonamiento extendido: el modo de razonamiento (`reasoning_effort`) permite planificar tareas multi-paso, combinado con la decodificación especulativa para reducir la latencia en entornos interactivos.
- Generación de código en entornos con memoria limitada: con FP8, el modelo ocupa 29 GiB, lo que permite ejecutarlo en una GPU de 32 GB (o dos de 24 GB) y usarlo para autocompletar o generar código en repositorios grandes.
- Asistentes multimodales: al mantener la torre de visión en BF16, puede procesar capturas de pantalla, diagramas o imágenes junto con texto, por ejemplo para documentación técnica o análisis de interfaces.
- Investigación en seguridad y alineación: al ser una versión abliterada, es útil para estudiar el comportamiento de modelos sin restricciones de seguridad, siempre en entornos controlados y con fines académicos.
- Desarrollo de prototipos de chat sin filtros: para pruebas internas de sistemas conversacionales donde se necesita explorar respuestas sin censura, con la responsabilidad legal y ética del usuario.
- Inferencia de largo recorrido en hardware de consumo: con 2× RTX 3090 y TP=2, se puede desplegar un servicio de chat con contexto completo de 262K, algo inviable con el modelo en BF16 (52 GiB) en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo base sin cuantizar. La única métrica de rendimiento documentada es la longitud de aceptación media de la decodificación especulativa MTP (2,22 en 2× RTX 3090), que indica una aceleración efectiva en la generación.

## Requisitos de hardware

- VRAM estimada: 29 GiB para los pesos FP8, más la caché KV. Con contexto de 262K y caché KV en FP8, se ha verificado un consumo de ~22 GB por GPU en 2× RTX 3090 (44 GB en total) con `--gpu-memory-utilization 0.92`.
- GPUs recomendadas: en Ampere (RTX 3090, A100) no hay soporte nativo de FP8, por lo que vLLM usa el kernel Marlin W8A16 (descompresión de pesos), obteniendo el ahorro de memoria pero no la aceleración de cómputo FP8. En Ada (RTX 4090), Hopper (H100) y Blackwell (B200), FP8 se ejecuta de forma nativa con mayor throughput.
- En una sola GPU consumer: posible solo con 32 GB o más (p. ej., RTX 4090 con 24 GB no es suficiente para 262K de contexto; para contextos más cortos podría caber con cuantización adicional, pero no está documentado).
- Opciones de despliegue: vLLM (probado en v0.24.0) con `--quantization fp8`, `--dtype bfloat16`, `--tensor-parallel-size 2`, `--kv-cache-dtype fp8` y `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`. No se documentan alternativas como llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan cifras concretas, pero la decodificación especulativa MTP con longitud de aceptación 2,22 implica una reducción significativa del número de pasos de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| mashima/Huihui-Qwen3.8-27B-abliterated-FP8 | 27,8 B | 262K | FP8 block-wise | Apache 2.0 | Abliterado, multimodal, MTP |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,8 B | 262K | BF16 (original) | Apache 2.0 | Abliterado, multimodal, MTP, 52 GiB |
| Qwen/Qwen3.8-27B | 27,8 B | 262K | BF16 / FP8 oficial | Apache 2.0 | Modelo base con seguridad, multimodal, MTP |
| Qwen/Qwen3.8-27B-FP8 | 27,8 B | 262K | FP8 block-wise | Apache 2.0 | Cuantización oficial de referencia, sin abliteración |

La comparativa se limita a las variantes del mismo modelo porque no se dispone de datos de rendimiento frente a otros modelos de tamaño similar (p. ej., Llama 3.3 70B o Qwen2.5-32B). La diferencia clave entre las variantes es la presencia de abliteración y el formato de pesos, manteniendo idénticos parámetros y contexto.

## Limitaciones y advertencias

- Modelo abliterado (uncensored): se han reducido significativamente los mecanismos de seguridad del modelo base, lo que puede generar contenido sensible, controvertido o inapropiado. No es apto para entornos públicos ni para menores.
- Sin garantías de seguridad: el modelo no ha pasado por optimización de seguridad; el usuario asume toda la responsabilidad legal y ética de su uso.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en contextos largos.
- Bug conocido en vLLM v0.24.0: con `--reasoning-parser qwen3`, el campo `reasoning_content` llega vacío en las respuestas de la API, aunque el modelo sí genera razonamiento internamente (verificado vía `/v1/completions`). No se ha confirmado si afecta al modelo sin cuantizar.
- Compatibilidad de hardware: en GPUs Ampere no hay aceleración FP8 nativa; se usa el kernel Marlin W8A16, que solo aporta ahorro de memoria, no de cómputo.
- Idiomas no documentados: no se especifican los idiomas soportados en la ficha, aunque el modelo base Qwen3.8 es multilingüe; se recomienda verificar el comportamiento en el idioma objetivo.
- Uso en producción: la model card recomienda limitar su uso a investigación, pruebas y entornos controlados, no a producción sin supervisión.
- La cuantización FP8 puede introducir una ligera degradación de calidad frente al BF16, aunque no se han publicado métricas comparativas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mashima/Huihui-Qwen3.8-27B-abliterated-FP8)
- [Modelo base abliterado (huihui-ai)](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Modelo original Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Perfil de huihui-ai en HuggingFace](https://huggingface.co/huihui-ai)
- [Ficha del modelo abliterado en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/huihui-qwen3.8-27b-abliterated-huihui-ai)
- [Variante NVFP4 en FriendliAI](https://friendli.ai/models/sakamakismile/Huihui-Qwen3.8-27B-abliterated-NVFP4)
- [Página del modelo en Ollama](https://ollama.com/huihui_ai/Qwen3.8-abliterated:27b)
