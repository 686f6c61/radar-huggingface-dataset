# mradermacher/qwen-3.5-2b-friendly-friend-merged-GGUF

## Resumen

El modelo `qwen-3.5-2b-friendly-friend-merged-GGUF` es una colección de cuantizaciones GGUF del modelo `DontYaps/qwen-3.5-2b-friendly-friend-merged`, un modelo de lenguaje de 2.000 millones de parámetros (1.942.653.248 parámetros en precisión original) que, según el nombre y las etiquetas, pertenece a la familia Qwen3.5. La cuantización ha sido realizada por mradermacher, un autor habitual de repositorios GGUF, y se distribuye bajo licencia Apache 2.0.

El modelo base es un merge (fusión) realizado con Unsloth, una librería de fine-tuning eficiente, y está orientado a conversación en inglés. El repositorio incluye múltiples cuantizaciones de 1.1 a 4.0 GB, además de dos archivos `mmproj` que sugieren un posible soporte multimodal. Su relevancia radica en que ofrece una versión pequeña y ligera de la familia Qwen3.5, apta para ejecución local en hardware modesto, con una ventaja competitiva en tamaño frente a modelos de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura exacta (número de capas, dimensiones, tipo de atención) ni sobre los datos de entrenamiento en la información proporcionada. El modelo base se identifica como un merge de la familia Qwen3.5, con 1.942.653.248 parámetros, y ha sido generado con la librería Unsloth, lo que sugiere un fine-tuning con LoRA o una fusión de pesos. El repositorio actual contiene únicamente cuantizaciones estáticas de esos pesos, sin detalles sobre el proceso de entrenamiento, tokens utilizados o técnicas de alineación (RLHF, DPO, etc.).

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` y el idioma declarado.
- Posible soporte multimodal (visión), dado que se incluyen archivos `mmproj` (proyector multimodal) en formatos f16 y Q8_0. No se ha confirmado su funcionalidad.
- Compatibilidad con `transformers` y `text-generation-inference`, lo que permite su uso en pipelines estándar.
- No se dispone de información sobre tool calling, function calling, agentes, razonamiento, generación de código o matemáticas.

## Casos de uso

- Asistente de chat local en inglés: el modelo puede desplegarse en una GPU de consumo o en CPU mediante llama.cpp para gestionar conversaciones sencillas de soporte o consultas, gracias a su tamaño de 1.94B y sus cuantizaciones compactas.
- Prototipado rápido de chatbots: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para validar flujos conversacionales en entornos de desarrollo sin coste de licencia.
- Generación de texto en aplicaciones de escritorio: su bajo consumo de memoria permite integrarlo en herramientas de redacción o resumen de textos en inglés.
- Análisis de sentimiento o clasificación de textos cortos: puede emplearse en pipelines de NLP para etiquetar comentarios o tickets, siempre que el texto esté en inglés.
- Resumen de documentos breves: con una ventana de contexto limitada (no especificada), es útil para resumir párrafos o correos en inglés.
- Descripción de imágenes si el soporte multimodal está activo: los archivos `mmproj` incluidos podrían permitir la generación de descripciones en inglés a partir de entradas visuales, aunque esta capacidad no está verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~1.1 GB (requiere ~2 GB de VRAM o RAM con overhead)
  - Q4_K_M: ~1.4 GB (requiere ~2-3 GB)
  - Q8_0: ~2.2 GB (requiere ~3-4 GB)
  - f16: ~4.0 GB (requiere ~5-6 GB)
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), o cualquier GPU con al menos 6 GB de VRAM. También puede ejecutarse en CPU con llama.cpp, aunque la velocidad será reducida.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI) y, si se utiliza el formato safetensors original, vLLM o Hugging Face Transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Idiomas | Cuantizaciones |
|---|---|---|---|---|---|
| mradermacher/qwen-3.5-2b-friendly-friend-merged-GGUF | 1.94B | GGUF | Apache 2.0 | en | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mmproj |
| mradermacher/Qwen3.5-2B-i1-GGUF | 1.94B (según nombre) | GGUF | Apache 2.0 | en | no especificado en la información disponible |
| DontYaps/qwen-3.5-2b-friendly-friend-merged | 1.94B | safetensors | Apache 2.0 | en | no aplica (modelo base) |

La comparativa se basa únicamente en los datos disponibles; no se han publicado benchmarks de estos modelos en la información consultada. El modelo `Qwen3.5-2B-i1-GGUF` es otra cuantización del mismo autor sobre un Qwen3.5-2B, con posibles diferencias en la técnica de cuantización (imatrix).

## Limitaciones y advertencias

- Al ser un modelo de 2.000 millones de parámetros, es más propenso a alucinaciones y a errores factuales que modelos de mayor tamaño.
- El idioma declarado es únicamente inglés; no se ha verificado un rendimiento adecuado en otros idiomas.
- Las cuantizaciones pueden degradar la calidad de las respuestas en comparación con el modelo base en precisión f16, especialmente en cuantizaciones Q2_K o Q3_K.
- El soporte multimodal es una hipótesis basada en la presencia de archivos `mmproj`; no se ha confirmado que el modelo funcione correctamente con entradas de imagen.
- El modelo parece ser un experimento o un merge comunitario (autor DontYaps), por lo que la calidad y el comportamiento pueden ser variables y no están respaldados por documentación extensa.
- No se han encontrado evaluaciones de sesgo o de seguridad; se recomienda auditar el modelo antes de un uso comercial en producción.

## Enlaces

- Repositorio Hugging Face del modelo GGUF: https://huggingface.co/mradermacher/qwen-3.5-2b-friendly-friend-merged-GGUF
- Modelo base: https://huggingface.co/DontYaps/qwen-3.5-2b-friendly-friend-merged
- Cuantización similar de Qwen3.5-2B: https://huggingface.co/mradermacher/Qwen3.5-2B-i1-GGUF
