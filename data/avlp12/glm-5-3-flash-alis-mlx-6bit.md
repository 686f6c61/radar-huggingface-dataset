# avlp12/GLM-5.3-Flash-Alis-MLX-6bit

## Resumen

GLM-5.3-Flash-Alis-MLX-6bit es una cuantización en 6 bits del modelo GLM-5.3-Flash de Z.ai, realizada por el usuario avlp12 (ALISVOLATPROPRIIS) específicamente para Apple Silicon mediante el framework MLX. GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5, con 320.000 millones de parámetros totales y unos 18.000 millones activos gracias a su arquitectura de mezcla de expertos (MoE). Destaca por su ventana de contexto de 1.048.576 tokens y por combinar atención lineal híbrida KDA con atención dispersa DSA, lo que permite un uso de memoria muy eficiente en contextos largos.

Esta versión concreta es el nivel equilibrado de un conjunto de tres construcciones (8-bit, 6-bit y 4-bit). Mantiene el grueso de expertos y atención en 6 bits con afinado de grupo g64, mientras que el cuello de botella latente, la capa de embedding, la cabeza y el router se conservan en 8 bits, logrando unos 6,67 bits efectivos por parámetro. El repositorio ocupa 268,1 GB en disco y requiere un runtime portado, ya que la arquitectura `glm5_next` no está soportada en la versión estándar de `mlx-lm`.

La relevancia de este modelo radica en que permite ejecutar un MoE de 320B en hardware de Apple Silicon con memoria unificada, algo que de otro modo sería inviable. Su licencia MIT y su capacidad multimodal (aunque la generación de imagen a texto solo se ha verificado en el pack de 4 bits) lo convierten en una opción atractiva para desarrolladores que trabajan en ecosistemas Apple y necesitan contexto de hasta un millón de tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 34 capas KDA (linear attention) + 11 capas MLA+DSA (sparse attention) + 1 capa MTP |
| Parametros totales | 320.000 millones (modelo base); 64.845.395.712 parámetros almacenados en safetensors cuantizados |
| Parametros activos | ~18.000 millones |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | 6-bit affine g64 para expertos y atención; 8-bit para cuello de botella latente, embedding/head y router (~6,67 bits efectivos/parámetro) |
| Idiomas soportados | inglés, chino |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

GLM-5.3-Flash emplea una arquitectura híbrida de atención denominada `glm5_next`. El backbone de texto se compone de 45 capas con dimensión oculta 4096, más una capa MTP (Multi-Token Prediction) declarada únicamente en el índice de pesos. De esas 45 capas, 34 utilizan atención lineal KDA (Kimi-Delta-Attention), que mantiene un estado recurrente de tamaño fijo mediante una regla delta y una puerta de olvido aprendida, eliminando el crecimiento del caché KV en esas capas. Las 11 capas restantes (aquellas con índice `ℓ % 4 == 3`) combinan atención de latente comprimido estilo DeepSeek (con `kv_lora_rank` 512 y `q_lora_rank` 1536) con atención dispersa DSA que usa un indexador relámpago con `index_topk` 2048 y agrupación de claves con `select_k` 512. No se utiliza codificación posicional rotatoria (NoPE).

La parte MoE consta de 288 expertos enrutados con top-8, enrutamiento sigmoide con corrección en fp32 y escala 2,5, más un experto compartido. Las tres primeras capas son densas. Se aplica una normalización SwiGLU con límite de activación. El modelo usa conexiones hiper-multiflujo (mHC) con 4 flujos residuales que se colapsan antes de la cabeza de salida. El embedding y la cabeza están desacoplados, con un vocabulario de 154.880 tokens. La torre de visión se conserva íntegramente en el repositorio cuantizado, con todos los tensores `model.visual.*` sin cuantizar (1,13 GB en bf16/fp32).

No se dispone de información detallada sobre el conjunto de datos de entrenamiento ni sobre el proceso de alineación (RLHF/DPO). El modelo base fue publicado por Z.ai en agosto de 2026.

## Capacidades

- Generación de texto conversacional en inglés y chino, con soporte de contexto ultralargo de hasta 1.048.576 tokens.
- Razonamiento multi-paso y capacidades de agente, según las evaluaciones de Z.ai que lo sitúan cerca de Claude Opus 4.8 en tareas de codificación y agentes.
- Procesamiento de imágenes (entrada visual) gracias a la torre de visión preservada; la generación de imagen a texto se ha verificado en el pack de 4 bits del mismo conjunto, pero no en esta versión de 6 bits.
- Soporte de video implementado en el runtime portado, aunque no ha sido probado con vídeo real.
- Capa MTP (Multi-Token Prediction) preservada, que puede acelerar la decodificación especulativa si el runtime la aprovecha.
- Atención lineal KDA con estado recurrente de tamaño fijo, lo que reduce drásticamente el consumo de memoria en contextos largos.
- No se menciona soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Análisis de documentos extensos: con su ventana de 1M de tokens, puede procesar libros completos, expedientes legales o historiales clínicos en una sola pasada, sin necesidad de fragmentar el texto. Los 34.000 millones de parámetros activos permiten mantener coherencia a lo largo de todo el documento.
- Asistente de programación en entornos Apple: al ejecutarse nativamente en MLX, puede integrarse en flujos de trabajo de Xcode o scripts de automatización en macOS, generando y revisando código Swift, Python o C++ sin depender de APIs externas.
- Investigación académica multilingüe: útil para resumir y comparar artículos científicos en inglés y chino, aprovechando el contexto largo para mantener referencias cruzadas entre múltiples fuentes.
- Chatbot corporativo con memoria persistente: la atención lineal de estado fijo permite mantener conversaciones de miles de turnos sin que el coste de memoria crezca, adecuado para atención al cliente o asistentes internos.
- Generación de informes a partir de datos visuales: aunque la visión no está verificada en este pack, la preservación de la torre visual sugiere que podría usarse para describir imágenes o diagramas en pipelines de documentación automática.
- Prototipado de agentes autónomos: su capacidad de razonamiento multi-paso y su licencia MIT permiten experimentar con sistemas agénticos que necesiten procesar largas cadenas de herramientas o interacciones, sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización de 6 bits. El modelo base GLM-5.3-Flash, según Z.ai, supera a GLM-5.2 en evaluaciones estándar y se aproxima a Claude Opus 4.8 en tareas de codificación y agénticas, pero no se dispone de cifras concretas de MMLU, HumanEval o GSM8K en la información proporcionada. Artificial Analysis otorga al modelo base un índice de inteligencia de 57 (frente a 60 del GLM-5.3 completo). No hay datos de rendimiento de inferencia para esta versión cuantizada; la única medición registrada es de 0,55 tokens/s en la ruta de decodificación VLM del pack de 4 bits, que no es representativa de la ruta de texto.

## Requisitos de hardware

- El repositorio ocupa 268,1 GB en disco, por lo que se necesita un Mac con al menos 384 GB de memoria unificada para cargar los pesos en RAM, y preferiblemente 512 GiB para operar con holgura a contexto completo.
- Diseñado para Apple Silicon: requiere un chip M-series con gran memoria unificada, como M3 Ultra o M4 Ultra con 512 GiB. No es viable en GPUs NVIDIA o AMD con memoria de vídeo convencional.
- La carga en memoria supera los 249 GiB, por lo que no cabe en ningún Mac de gama de consumo actual; solo estaciones de trabajo como Mac Studio o Mac Pro con configuración máxima.
- El runtime no es el estándar: se necesita el port de `mlx_lm/models/glm5_next.py` (con md5 verificado) y el paquete `hyper_connection.py` del repositorio `avlp12/local-llm-serving`. El comando `mlx_lm generate` de la versión stock falla con error de tipo de modelo no soportado.
- Opciones de despliegue: únicamente MLX con el runtime portado. No hay soporte para vLLM, llama.cpp, Ollama o TGI en esta versión.
- La latencia y el throughput no están documentados para esta cuantización; la única medición de decodificación VLM en el pack de 4 bits fue de 0,55 tokens/s, muy por debajo de lo esperable en la ruta de texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | ~18B | 1M | MIT | API y pesos originales |
| GLM-5.3-Flash-Alis-MLX-6bit (este) | 320B (64,85B almacenados) | ~18B | 1M | MIT | MLX, requiere runtime portado |
| GLM-5.2 | ~300B (estimado) | ~30B (estimado) | 128K (estimado) | MIT | API y pesos originales |
| DeepSeek-V3 | 671B | ~37B | 128K | MIT | API y pesos originales |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada. La principal diferencia de esta versión cuantizada frente a sus alternativas es su ejecución en Apple Silicon y su ventana de contexto de 1M, que supera ampliamente a la mayoría de MoE comparables.

## Limitaciones y advertencias

- Requiere un runtime portado y no oficial: la arquitectura `glm5_next` no está soportada en `mlx-lm` estándar (a fecha de 2026-08-28). El port se distribuye desde un repositorio personal de GitHub y no tiene garantías de mantenimiento.
- La generación de imagen a texto no ha sido verificada en este pack de 6 bits; solo se ha probado en el pack de 4 bits del mismo conjunto. La entrada de imágenes puede fallar o producir resultados inesperados.
- El modelo solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- El tamaño del repositorio (268 GB) y sus requisitos de memoria (más de 250 GiB) lo limitan a estaciones de trabajo de gama alta; no es viable en equipos de consumo.
- La cuantización de 6 bits puede introducir degradación de calidad frente al modelo original en FP8, especialmente en tareas de precisión numérica o razonamiento matemático complejo.
- No se han publicado benchmarks de esta cuantización, por lo que el rendimiento real es desconocido.
- La licencia MIT permite uso comercial, pero el runtime portado puede tener dependencias con licencias diferentes; se debe revisar el repositorio de origen.
- El modelo base tiene capacidades multimodales, pero la torre de visión se conserva sin cuantizar, lo que aumenta el peso total; si no se necesita visión, no hay una versión solo-texto de este pack.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/avlp12/GLM-5.3-Flash-Alis-MLX-6bit
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Colección de packs Alis MLX: https://huggingface.co/collections/avlp12/glm-53-flash-alis-mlx-6a8f74a74289c9ad6a5f5e05
- Repositorio de campaña (port, conversión, recibos): https://github.com/avlp12/local-llm-serving
- PR de mlx-vlm para el procesador: https://github.com/Blaizzy/mlx-vlm/pull/2091
- Pack de 8 bits: https://huggingface.co/avlp12/GLM-5.3-Flash-Alis-MLX-8bit
- Pack de 4 bits: https://huggingface.co/avlp12/GLM-5.3-Flash-Alis-MLX-4bit
