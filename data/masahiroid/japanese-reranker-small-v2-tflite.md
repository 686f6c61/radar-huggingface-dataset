# masahiroid/japanese-reranker-small-v2-tflite

## Resumen

`masahiroid/japanese-reranker-small-v2-tflite` es una conversión no oficial al formato LiteRT (`.tflite`) del modelo `hotchpotch/japanese-reranker-small-v2`, un reranker japonés basado en arquitectura ModernBERT que funciona como cross-encoder. El objetivo es permitir la ejecución de un reranker de calidad en dispositivos Android y otros runtimes LiteRT, sin necesidad de un servidor ni de frameworks de inferencia pesados. El autor de la conversión es masahiroid; todo el mérito del modelo original corresponde a sus autores.

El modelo resuelve el problema del re-ranking en pipelines RAG (retrieval-augmented generation) en japonés: dado un par (consulta, pasaje), devuelve un logit de relevancia que, tras aplicar sigmoid, ofrece una puntuación entre 0 y 1. Al estar empaquetado en `.tflite` con longitud de secuencia fija, resulta adecuado para inferencia en el propio dispositivo (on-device), lo que lo hace relevante para aplicaciones móviles que necesitan privacidad, baja latencia y funcionamiento sin conexión.

Se distribuyen tres variantes con longitudes de secuencia fijas de 128, 256 y 512 tokens, todas en fp32 y convertidas con `litert-torch`. El repositorio ocupa 0,8 GB e incluye los ficheros del tokenizador copiados del modelo base. La licencia es MIT, igual que la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (cross-encoder para re-ranking) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128, 256 o 512 tokens (variantes con longitud fija) |
| Tipos de cuantizacion | fp32 (no se incluyen variantes fp16 ni int8) |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | LiteRT / TensorFlow Lite (`.tflite`); tokenizador en formato Hugging Face |

## Arquitectura y entrenamiento

El modelo subyacente es `hotchpotch/japanese-reranker-small-v2`, un cross-encoder basado en ModernBERT que recibe como entrada el par (consulta, pasaje) tokenizado y produce un único logit de relevancia. La conversión a LiteRT mantiene la arquitectura intacta y exporta el grafo con dos entradas `int32` de forma `[1, seq]` (`input_ids` y `attention_mask`) y una salida `[1, 1]` con el logit crudo. La máscara de atención se respeta dentro del grafo, y el padding debe realizarse con el `pad_id` del tokenizador hasta la longitud fija de la variante elegida.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original, ya que la model card de esta conversión no los detalla. La innovación técnica principal de esta ficha es el propio proceso de conversión: se generaron tres artefactos con longitudes fijas para evitar formas dinámicas en LiteRT, y se verificó la equivalencia numérica contra PyTorch mediante el intérprete de LiteRT. La tokenización on-device se valida con el `UnigramTokenizer` en Kotlin del proyecto `japanese-rag-kotlin`, que reproduce exactamente los ids de Hugging Face en 450 de 450 fixtures de prueba.

## Capacidades

- Clasificación de pares (consulta, pasaje) para re-ranking: devuelve un logit de relevancia transformable a puntuación 0-1 mediante sigmoid.
- Re-ranking en pipelines RAG en japonés, refinando los resultados de un retrieval inicial (por ejemplo, búsqueda vectorial con embeddings).
- Inferencia on-device en Android mediante el intérprete LiteRT, sin dependencia de servidores.
- Tokenización local exacta respecto a Hugging Face gracias al `UnigramTokenizer` en Kotlin del proyecto asociado.
- Funcionamiento offline y con privacidad de datos, al no requerir envío de consultas ni pasajes a un servidor.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un modelo de clasificación de texto.

## Casos de uso

- Re-ranking en aplicaciones RAG móviles en japonés: tras recuperar candidatos con un embedder on-device (por ejemplo, `LiteRtEmbedder` del mismo proyecto), el reranker reordena los pasajes por relevancia antes de pasarlos a un LLM o mostrarlos al usuario.
- Asistentes de documentación offline en Android: una app que indexa manuales o normativas japonesas localmente y usa el reranker para seleccionar los fragmentos más pertinentes sin conexión.
- Búsqueda semántica en dispositivos con recursos limitados: la variante de 128 tokens reduce coste computacional y es adecuada para pasajes cortos en pantallas móviles.
- Filtrado de respuestas en sistemas de preguntas y respuestas japonesas: puntuar pares pregunta-respuesta candidata para descartar las irrelevantes antes de la generación.
- Evaluación de recuperación en investigación: usar el modelo como referencia de re-ranking en experimentos con corpus japoneses, comparando el rendimiento de distintos embedders.
- Demostraciones interactivas en navegador: el espacio Ruri Atlas usa el reranker para visualizar embeddings y comprobar dónde cae un prompt-injection en el mapa 3D.
- Integración en pipelines de CI para validación de calidad de retrieval: ejecutar el modelo sobre conjuntos de fixtures y verificar que las puntuaciones se mantienen estables entre versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo pequeño basado en ModernBERT y ejecutarse en LiteRT, se espera un consumo de memoria moderado, pero no se han publicado cifras.
- GPU recomendadas: no aplica para el caso de uso principal (Android on-device); para escritorio, cualquier GPU compatible con el intérprete LiteRT serviría, sin datos concretos publicados.
- Compatibilidad con GPU de consumo: no hay datos publicados; el objetivo del formato es la ejecución en CPU/GPU móvil.
- Opciones de despliegue: intérprete LiteRT (`ai_edge_litert.interpreter` en Python), librería Kotlin `japanese-rag-kotlin` (`LiteRtEmbedder` / `LiteRtReranker`) en Android. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles; la model card indica explícitamente que aún no se incluyen números de latencia en dispositivos reales. La verificación end-to-end se realizó en el emulador de Android (API 36.1, arm64) con resultados correctos de retrieval y re-ranking para las consultas de muestra.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| masahiroid/japanese-reranker-small-v2-tflite | ModernBERT cross-encoder | 128 / 256 / 512 fijos | LiteRT `.tflite` | MIT | Hugging Face |
| hotchpotch/japanese-reranker-small-v2 | ModernBERT cross-encoder | no disponible | safetensors / PyTorch | MIT | Hugging Face |
| Rerankers japoneses basados en BERT (p. ej. familia Ruri) | Transformer encoder | variable | safetensors / PyTorch | variable | Hugging Face |

La comparación con alternativas concretas de la misma categoría (rerankers japoneses de tamaño similar) no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el formato de despliegue: LiteRT para on-device frente a PyTorch para servidor.

## Limitaciones y advertencias

- Es una conversión no oficial: no está mantenida por los autores del modelo original, por lo que posibles actualizaciones del modelo base no se reflejan automáticamente.
- Solo soporta japonés; no se ha validado su comportamiento en otros idiomas.
- Longitud de contexto fija por variante (128, 256 o 512 tokens): los textos más largos deben truncarse, lo que puede perder información relevante.
- No se incluyen variantes cuantizadas (fp16, int8) ni el bundle `.task` de MediaPipe, lo que limita el ahorro de memoria y el despliegue en algunos entornos.
- No hay números de latencia en dispositivos reales; la verificación se realizó únicamente en el emulador de Android.
- Riesgo de sesgos y alucinación heredado del modelo base, no documentado en esta ficha.
- La licencia MIT permite uso comercial, pero se recomienda revisar las condiciones del modelo base y citar adecuadamente a sus autores.
- La tokenización on-device requiere usar el `UnigramTokenizer` en Kotlin del proyecto asociado para garantizar ids exactos; otras implementaciones pueden producir discrepancias.
- El sketch de uso en Kotlin/Android se describe como no probado en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/japanese-reranker-small-v2-tflite
- Modelo base: https://huggingface.co/hotchpotch/japanese-reranker-small-v2
- Demo interactiva (Ruri Atlas): https://huggingface.co/spaces/masahiroid/ruri-atlas
- Repositorio Kotlin con tokenizador y clases LiteRT: https://github.com/masahiroid/japanese-rag-kotlin
- Herramienta de auditoría: https://github.com/masahiroid/model-audit-lite
- Hub de seguridad para LLM japoneses: https://github.com/masahiroid/japanese-llm-security
