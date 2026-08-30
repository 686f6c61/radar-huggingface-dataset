# ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit

## Resumen

`Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit` es un empaquetado del modelo multimodal `Qwen/Qwen3.8-Flash-Next` creado por ddalcu, optimizado para ejecutarse en Apple Silicon mediante el servidor de inferencia nativo `mlx-serve`. Este modelo representa una vista previa de la arquitectura Qwen4 (`qwen4_exp`), que combina un tronco MoE con Gated DeltaNet, atención dispersa (sparse attention) y una tabla de embeddings de n-gramas de 51 mil millones de parámetros. La versión cuantizada aquí presentada reduce el peso total a unos 21 mil millones de parámetros en los shards safetensors (más la tabla n-gram en un archivo binario separado), lo que permite ejecutarlo en un Mac con 128 GB de memoria unificada con unos 75 GB de uso residente.

El modelo original, desarrollado por Alibaba Qwen, está pensado para tareas de generación de texto, razonamiento avanzado, generación de código, matemáticas y comprensión multimodal (imagen y vídeo), con una ventana de contexto nativa de 262 144 tokens. Esta versión MLX mantiene todas las capacidades del original, incluyendo el cabezal de decodificación especulativa MTP (Multi-Token Prediction) y la torre de visión, y está dirigida a desarrolladores que quieren ejecutar un modelo de gran tamaño localmente en hardware Apple sin necesidad de GPU dedicada. Su relevancia radica en que demuestra cómo arquitecturas de nueva generación pueden desplegarse en entornos de memoria unificada con un rendimiento práctico medible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated DeltaNet + Gated Attention + Sparse Attention) sobre Qwen4 preview (`qwen4_exp`) |
| Parametros totales | 21 058 910 099 (en safetensors, excluye tabla n-gram); modelo original: 180B (125B trunk + 51B n-gram + 4B MTP) |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | 4-bit (expertos enrutados, embeddings, tabla n-gram), 8-bit (atención, GDN, hyper-connections, indexer, expertos compartidos, lm_head), bf16 (routers, gates, norms, convs, estado SSM) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (shards) + `ngram_table.bin` (formato safetensors, extensión `.bin`) |

## Arquitectura y entrenamiento

El modelo sigue el diseño GDN + MoE introducido por Qwen, con tres innovaciones clave respecto a generaciones anteriores. Primero, utiliza **flujos residuales con compuerta** (gated residual streams): el residual se divide en 4 flujos de 2560 dimensiones cada uno, y cada bloque lee una media ponderada por sigmoide de los flujos normalizados y escribe a través de compuertas escalares por flujo. Segundo, incorpora un **embeddings de n-gramas** de 51 mil millones de parámetros: una tabla adicional indexada por bigramas y trigramas hasheados de los token ids, con 16 cabezas, cada una con un espacio de cubos de tamaño primo de ~20 millones de filas y 160 dimensiones por fila. Esta tabla es una búsqueda sin cómputo, lo que explica que el modelo se cite como 125B (tronco) + 51B (n-gram) + 4B (MTP) = 180B. Tercero, emplea **Qwen Sparse Attention**: más allá de los primeros 2048 tokens, cada capa de atención solo lee los 512 bloques de 4 tokens más relevantes por consulta (seleccionados por un indexador pequeño), más el bloque parcial propio, manteniendo el coste de atención plano con la longitud de contexto.

El entrenamiento del modelo base no está detallado en la información disponible; no se especifican el número de tokens, la composición del dataset ni si se aplicaron métodos de alineación como RLHF o DPO. El empaquetado MLX cuantiza los pesos con precisión mixta: expertos enrutados, embeddings y la tabla n-gram a 4-bit (grupo 64, y grupo 32 para la tabla n-gram), mientras que atención, GDN, hyper-connections, indexador, expertos compartidos y la cabeza de salida se mantienen a 8-bit; los routers, normas, convoluciones y el estado SSM permanecen en bf16. La tabla n-gram se almacena en un archivo binario separado que se mapea en memoria (mmap) y se dequantiza por CPU por token, evitando que resida permanentemente en la GPU.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno con modo de pensamiento (thinking) activado por defecto.
- Generación de código, soporte de matemáticas y razonamiento simbólico avanzado.
- Comprensión multimodal: entrada de imágenes y vídeo a través de una torre de visión estilo Qwen3-VL (densa en bf16, ~0.9 GB).
- Tool calling y function calling mediante el formato XML de Qwen3.8; `mlx-serve` parsea y coacciona el esquema automáticamente.
- Capacidades de agente con razonamiento multi-paso y uso de herramientas.
- Ventana de contexto nativa de 262 144 tokens con atención dispersa que mantiene el coste de atención plano más allá de 2048 tokens.
- Decodificación especulativa MTP (Multi-Token Prediction) opcional, que acelera la generación en código hasta un 41% en las mediciones reportadas.
- Soporte multilingüe (idiomas no especificados en la documentación del empaquetado).

## Casos de uso

- Asistente de programación con contexto largo: el modelo puede manejar repositorios completos o archivos de gran tamaño gracias a sus 262k tokens de contexto y a la atención dispersa, manteniendo una velocidad de decodificación estable. Es adecuado para generación de código, refactorización y explicación de código heredado.
- Análisis de documentos extensos: con la ventana de 262k tokens, se pueden procesar manuales técnicos, contratos o investigaciones completas en una sola pasada, extrayendo información relevante sin necesidad de dividir el texto.
- Agente autónomo con herramientas: al soportar tool calling en formato XML y razonamiento multi-paso, puede integrarse en pipelines de automatización que requieran consultar APIs, ejecutar comandos o interactuar con bases de datos.
- Asistencia multimodal para soporte técnico: la torre de visión permite analizar capturas de pantalla, diagramas o vídeos de errores, combinando la comprensión visual con instrucciones de resolución.
- Generación de documentación técnica: a partir de código fuente o especificaciones, el modelo puede redactar guías, comentarios y resúmenes con razonamiento contextual profundo.
- Investigación y síntesis de literatura: el modo thinking y la capacidad de razonamiento avanzado permiten resumir y comparar artículos científicos, extrayendo conclusiones y detectando inconsistencias.
- Despliegue local en Mac con memoria unificada: al no requerir GPU VRAM dedicada, es viable en equipos Apple Silicon de gama alta para desarrollo y pruebas sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) específicos para este empaquetado cuantizado. La documentación del modelo base en unsloth afirma que `Qwen3.8-Flash-Next` supera a Claude-4.6-Opus (Max) en ciertas tareas, pero no se proporcionan cifras concretas en la información disponible. Las mediciones de rendimiento reportadas por el autor del empaquetado se centran en velocidad de inferencia en un M4 Max de 128 GB:

- Decodificación serial: ~60 tokens/s
- Decodificación con MTP: ~78 tokens/s (un +41% en código, unos pocos puntos porcentuales más lento en prosa)
- Prefill: ~730 tokens/s
- Recuperación de una aguja a 24.8k tokens con atención dispersa activada
- Memoria residente: ~75 GB (más caché KV)

Estos datos son de referencia y pueden variar según la configuración del hardware y la versión de `mlx-serve`.

## Requisitos de hardware

- Memoria: se requiere aproximadamente 75 GB de memoria unificada residente más la caché KV. El autor recomienda un Mac con 128 GB de RAM unificada; con `--kv-quant 8` la caché KV se reduce a la mitad.
- GPU: no requiere GPU dedicada; funciona en Apple Silicon (M4 Max probado). No cabe en GPUs consumer típicas (RTX 4090, etc.) debido a la limitación de VRAM, ya que la tabla n-gram y los pesos cuantizados superan los 24 GB.
- Opciones de despliegue: exclusivamente con `mlx-serve` (servidor nativo para Apple Silicon, compatible con API OpenAI y Anthropic). No se menciona soporte para vLLM, llama.cpp u Ollama en esta versión.
- Latencia y throughput: en M4 Max 128 GB, decode ~60-78 tok/s, prefill ~730 tok/s. El servidor v1 procesa una petición a la vez (sin batching), con caché de prefijo activada para turnos consecutivos.
- Almacenamiento: el repo ocupa 107.3 GB en disco; la tabla n-gram se mapea en memoria y su coste es de page cache, que el sistema operativo gestiona.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. El modelo base `Qwen3.8-Flash-Next` pertenece a la familia Qwen4 preview, y se puede contrastar conceptualmente con otros MoE multimodales de gran tamaño, pero no hay datos de benchmarks comparativos publicados para esta cuantización específica. Las alternativas potenciales en el mismo espacio (por ejemplo, otros MoE con contexto largo) no están documentadas en las fuentes consultadas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han documentado sesgos específicos, pero como todo modelo generativo, existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o con datos poco frecuentes. Se recomienda validación humana en aplicaciones críticas.
- Limitaciones del servidor `mlx-serve` v1: procesa una petición a la vez, sin batching de decodificación; la especulación PLD/DFlash está desactivada (solo se usa MTP como ruta especulativa). MTP es opt-in y su beneficio depende del prompt (en prosa puede ser más lento).
- Contexto y atención dispersa: la atención dispersa selecciona solo 512 bloques por consulta más allá de 2048 tokens; esto puede afectar a la recuperación de información en contextos muy largos si los bloques relevantes no son detectados por el indexador. Para prompts muy largos (>64k), se recomienda reducir `--prefill-chunk`.
- Licencia: la licencia `qwen-community-1.0` es una licencia comunitaria de Qwen; debe revisarse cuidadosamente para uso comercial, ya que puede imponer restricciones específicas (por ejemplo, limitaciones de uso en ciertas industrias o requisitos de atribución).
- Requisitos de hardware: necesita un Mac con al menos 128 GB de memoria unificada para una experiencia completa; con menos memoria podría no cargar el modelo completo o requerir cuantización adicional no soportada en este empaquetado.
- Idiomas: no se especifican los idiomas soportados; la documentación no garantiza cobertura multilingüe amplia.
- Formato de pesos: el archivo `ngram_table.bin` no es un shard safetensors estándar; su manejo es específico de `mlx-serve` y no es intercambiable con otras herramientas de inferencia.

## Enlaces

- [HuggingFace - ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit](https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit)
- [HuggingFace - Qwen/Qwen3.8-Flash-Next (modelo base)](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [GitHub - QwenLM/Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/)
- [unsloth - Qwen3.8-Flash-Next: How to Run Locally](https://unsloth.ai/docs/models/qwen3.8-next)
- [GitHub - ddalcu/mlx-serve (releases)](https://github.com/ddalcu/mlx-serve/releases)
