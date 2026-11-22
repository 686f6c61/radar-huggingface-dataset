# masahiroid/japanese-reranker-xsmall-v2-tflite

## Resumen

`masahiroid/japanese-reranker-xsmall-v2-tflite` es una conversión no oficial al formato LiteRT (`.tflite`) del modelo `hotchpotch/japanese-reranker-xsmall-v2`, un reranker japonés basado en arquitectura cross-encoder y en la familia ModernBERT. El objetivo no es reentrenar ni mejorar el modelo original, sino empaquetarlo para su ejecución en Android y otros entornos LiteRT, de forma que pueda integrarse en aplicaciones móviles de búsqueda y RAG sin depender de un servidor.

El modelo recibe un par (consulta, pasaje) tokenizado y devuelve un logit de relevancia en bruto, que se convierte en una puntuación entre 0 y 1 aplicando una sigmoide. Se distribuyen tres variantes con longitud de secuencia fija (128, 256 y 512 tokens) en precisión fp32, convertidas con `litert-torch`. El tokenizador se hereda del modelo base y el autor proporciona una implementación Kotlin (`UnigramTokenizer`) que reproduce exactamente los IDs de Hugging Face.

Su relevancia actual radica en que permite ejecutar reranking en local sobre dispositivos Android, un paso crítico para pipelines RAG en japonés con requisitos de privacidad o de funcionamiento sin conexión. La licencia MIT y el tamaño reducido del repositorio (0,4 GB) facilitan su integración, aunque el autor advierte de que aún no hay variantes cuantizadas ni mediciones de latencia en dispositivos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (heredada del modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128, 256 o 512 tokens segun la variante del fichero `.tflite` (longitud fija) |
| Tipos de cuantizacion | fp32 (unica precision publicada; fp16 e int8 anunciadas como pendientes) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | LiteRT (`.tflite`), convertido con `litert-torch` |
| Entradas | `input_ids` y `attention_mask`, `int32`, forma `[1, seq]` |
| Salida | logit de relevancia `[1, 1]` (aplicar sigmoide para obtener 0-1) |
| Modelo base | `hotchpotch/japanese-reranker-xsmall-v2` |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es una conversión de formato, no un reentrenamiento: los pesos y el comportamiento provienen íntegramente de `hotchpotch/japanese-reranker-xsmall-v2`, un cross-encoder que puntúa pares (consulta, pasaje) para reordenar resultados de recuperación. La arquitectura subyacente es ModernBERT, según indican las etiquetas del repositorio, si bien la model card no detalla el número de capas, la dimensión oculta ni el volumen de tokens de entrenamiento del modelo original.

La innovación técnica de esta ficha es el proceso de conversión: se generan tres grafos con longitud de secuencia fija (128, 256 y 512) en fp32 mediante `litert-torch`, y la máscara de atención se respeta dentro del grafo. El autor verificó la equivalencia numérica frente a PyTorch con el intérprete de LiteRT y validó el pipeline completo en un emulador Android (API 36.1, arm64). No se documentan detalles sobre RLHF, DPO ni composición del dataset, ya que corresponden al modelo base y no se reproducen en esta model card.

## Capacidades

- Puntuación de relevancia de pares (consulta, pasaje) mediante un cross-encoder, adecuada para reranking en pipelines de recuperación.
- Salida de un logit en bruto transformable en probabilidad 0-1 con sigmoide, lo que permite umbrales de corte ajustables.
- Tokenización en dispositivo mediante `UnigramTokenizer` en Kotlin, con correspondencia exacta de IDs frente a Hugging Face en 450 de 450 casos de prueba.
- Ejecución local en Android a través del intérprete LiteRT, sin llamadas a servidor.
- Soporte de tres ventanas de contexto fijas (128, 256 y 512 tokens) para equilibrar coste y cobertura.
- Integración con `LiteRtEmbedder` y `LiteRtReranker` de la librería `japanese-rag-kotlin`.
- Capacidad monolingüe: solo japonés.
- No dispone de tool calling, generación de texto, razonamiento multi-paso ni capacidades multimodales; es exclusivamente un clasificador de pares.

## Casos de uso

- RAG en dispositivos Android sin conexión: el modelo reordena los pasajes recuperados por un embedder local antes de pasarlos a un LLM, manteniendo los datos del usuario en el dispositivo y aprovechando la ventana de 512 tokens para pasajes largos.
- Búsqueda documental en aplicaciones móviles japonesas: integrado con `LiteRtEmbedder`, permite dos etapas (recuperación densa y reranking) dentro de la misma app, con el tokenizador Kotlin evitando discrepancias de IDs.
- Asistentes de atención al cliente en japonés: el reranker selecciona la respuesta o fragmento de FAQ más relevante para cada consulta antes de mostrarla, reduciendo respuestas incorrectas en un entorno de recursos limitados.
- Filtrado de contexto para LLM en el borde: en lugar de enviar todos los fragmentos candidatos a un modelo mayor, se descartan los de baja puntuación con un umbral sobre la sigmoide, reduciendo el coste computacional y el consumo de tokens.
- Verificación de citas y procedencia: dado un par (pregunta, fragmento de normativa o documentación), el logit permite marcar automáticamente si el fragmento respalda la afirmación, útil en herramientas de compliance en japonés.
- Evaluación de calidad de recuperación en CI: los tres grafos de longitud fija permiten ejecutar pruebas de regresión deterministas sobre conjuntos de pares etiquetados, comparando puntuaciones entre versiones del índice o del embedder.
- Demostraciones interactivas en navegador: el espacio Ruri Atlas emplea el reranker como conmutador para visualizar cómo cambia la ordenación de resultados, sin enviar datos a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta verificaciones de corrección: equivalencia numérica frente a PyTorch en el intérprete LiteRT, correspondencia exacta del tokenizador en 450 de 450 casos y validación funcional de recuperación y reranking en el emulador Android. No se aportan cifras de latencia en dispositivos reales, throughput ni métricas de calidad de ranking (NDCG, MRR).

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo está pensado para ejecución en CPU/NPU móvil mediante LiteRT; el tamaño exacto de los pesos no se detalla en la model card.
- GPU recomendadas: no aplica en el caso de uso principal (Android). Para escritorio, cualquier GPU compatible con el intérprete LiteRT serviría, pero no se documentan configuraciones.
- GPU de consumo: no se proporcionan datos de compatibilidad con RTX 4090 u otras tarjetas.
- Despliegue: intérprete LiteRT (`ai_edge_litert.interpreter.Interpreter`) en Python y Android; librería Kotlin `japanese-rag-kotlin` con `LiteRtEmbedder` y `LiteRtReranker`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles. El autor indica explícitamente que las cifras de latencia en dispositivos reales están pendientes.
- Almacenamiento: repositorio de 0,4 GB, repartido entre los tres ficheros `.tflite` y los ficheros del tokenizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| `masahiroid/japanese-reranker-xsmall-v2-tflite` | no disponible | 128 / 256 / 512 fijos | LiteRT `.tflite` | MIT | Reranking japonés en Android |
| `hotchpotch/japanese-reranker-xsmall-v2` | no disponible | no disponible | safetensors (Hugging Face) | MIT | Reranking japonés en servidor o escritorio |
| Rerankers multilingües tipo `BAAI/bge-reranker` | no disponible | no disponible | safetensors, ONNX | según variante | Reranking multilingüe en servidor |

La comparación directa con alternativas cuantitativas no es posible porque la model card no publica métricas de calidad ni de rendimiento. La diferencia principal frente al modelo base es el formato y el objetivo de despliegue: esta versión prioriza la ejecución móvil, mientras que el original está pensado para inferencia estándar con Transformers. Frente a rerankers multilingües, la limitación es el idioma (solo japonés), y la ventaja es la ligereza y la ausencia de dependencias de servidor.

## Limitaciones y advertencias

- Conversión no oficial: el autor no está afiliado al modelo base y no garantiza paridad funcional más allá de las verificaciones publicadas.
- Solo japonés: no es adecuado para consultas o pasajes en otros idiomas.
- Longitud de contexto fija: cada fichero impone 128, 256 o 512 tokens; los textos más largos deben truncarse y los más cortos rellenarse con el ID de padding del tokenizador.
- Sin variantes cuantizadas: solo hay fp32, lo que puede limitar el rendimiento y el tamaño en dispositivos con poca memoria; fp16 e int8 están anunciadas pero no publicadas.
- Sin cifras de latencia real: la validación se hizo en emulador, no en hardware físico, por lo que el rendimiento en producción es incierto.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos o negativos en la puntuación de relevancia; se recomienda calibrar el umbral de la sigmoide con datos propios.
- Sesgos: no documentados. Al ser un modelo japonés, puede reflejar sesgos de los corpus de entrenamiento del modelo base, no descritos en esta model card.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución al modelo base y revisar el `SECURITY.md` y el ML-BOM incluidos.
- Dependencia del tokenizador: un tokenizador incorrecto invalida las puntuaciones; el autor recomienda el `UnigramTokenizer` de `japanese-rag-kotlin` para garantizar IDs exactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/japanese-reranker-xsmall-v2-tflite
- Modelo base: https://huggingface.co/hotchpotch/japanese-reranker-xsmall-v2
- Demo interactiva (Ruri Atlas): https://huggingface.co/spaces/masahiroid/ruri-atlas
- Librería Kotlin de referencia: https://github.com/masahiroid/japanese-rag-kotlin
- Herramienta de auditoría: https://github.com/masahiroid/model-audit-lite
- Hub de seguridad para LLM japoneses: https://github.com/masahiroid/japanese-llm-security
