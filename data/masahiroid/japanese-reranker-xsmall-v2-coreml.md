# masahiroid/japanese-reranker-xsmall-v2-coreml

## Resumen

`japanese-reranker-xsmall-v2-coreml` es una conversión no oficial a Core ML del modelo `hotchpotch/japanese-reranker-xsmall-v2`, un reranker ligero para japonés basado en la arquitectura ModernBERT. Lo publica el desarrollador masahiroid con el objetivo de ejecutar el modelo directamente en dispositivos iOS y macOS mediante el framework Core ML de Apple, sin depender de servidores externos ni de runtimes de Python. El modelo original, del que procede toda la autoría intelectual, es de hotchpotch.

La función del modelo es el text-ranking: recibe un par consulta-documento tokenizado como una única secuencia y devuelve una puntuación de relevancia en el intervalo [0, 1], obtenida tras aplicar una sigmoide al logit de salida. Es, por tanto, una pieza de segunda etapa en pipelines de búsqueda: primero se recuperan candidatos con un modelo de embeddings y después se reordenan con este reranker.

Su relevancia actual reside en el despliegue en el borde (edge): con paquetes de aproximadamente 147 MB en fp16 y 74 MB en int8, y longitudes de secuencia fijas de 128, 256 o 512 tokens, cabe en aplicaciones móviles. El autor lo usa en producción en la app iOS "道程 -Michinori-", que compara textos del usuario con literatura japonesa combinando búsqueda por embeddings con `ruri-v3-130m-coreml` y reordenación con este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), convertido a Core ML |
| Parametros totales | no disponible (modelo "xsmall"; el repositorio ocupa 0,3 GB con todas las variantes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128, 256 o 512 tokens según la variante (buckets de longitud fija) |
| Tipos de cuantizacion | fp16 e int8 |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | MIT |
| Formato de pesos | `.mlpackage` (Core ML); no se distribuyen safetensors ni GGUF en este repositorio |
| Salida | puntuación de relevancia en [0, 1] (logit con sigmoide) |
| Entradas | `input_ids` y `attention_mask`, shape [1, N], Int32 |
| Modelo base | hotchpotch/japanese-reranker-xsmall-v2 |

## Arquitectura y entrenamiento

El modelo subyacente es un reranker basado en ModernBERT, un encoder transformer con atención bidireccional pensado para tareas de comprensión y clasificación de pares de texto. La conversión a Core ML mantiene la función de puntuación: se tokeniza conjuntamente la consulta y el documento como una sola secuencia y la cabeza de clasificación produce un logit que, tras la sigmoide, se interpreta como probabilidad de relevancia. La conversión genera artefactos separados por longitud de secuencia (128, 256 y 512), cada uno compilado con una forma de entrada fija, lo que permite optimizar el grafo para cada caso de uso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras innovaciones de entrenamiento del modelo original en la información proporcionada. La conversión en sí no introduce cambios arquitectónicos más allá del trazado a Core ML y la cuantización a fp16 o int8; el autor documenta una auditoría de seguridad con `model-audit-lite` que verifica formato de pesos, código empaquetado y linaje del modelo (ML-BOM).

## Capacidades

- Puntuación de relevancia consulta-documento para reordenación (reranking) de resultados de búsqueda.
- Tokenización de pares como secuencia única, con salida calibrada en [0, 1] apta para umbrales.
- Ejecución nativa en iOS y macOS mediante Core ML, con `computeUnits = .all` para aprovechar CPU, GPU y Neural Engine.
- Soporte de japonés e inglés, con foco principal en japonés.
- Tres ventanas de longitud (128, 256, 512 tokens) seleccionables según el compromiso latencia/precisión.
- Dos precisiones (fp16 e int8) para ajustar tamaño y consumo.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Integración con pipelines de embeddings: el autor lo combina con `ruri-v3-130m-coreml` para búsqueda en dos etapas.

## Casos de uso

- Búsqueda semántica en aplicaciones iOS: recuperar candidatos con un modelo de embeddings y reordenarlos con este reranker en el dispositivo, sin enviar consultas a un servidor; la ventana de 256 tokens cubre consultas y pasajes cortos con latencia baja.
- Comparación de textos con un corpus literario: tal como hace la app "道程 -Michinori-", puntuar la afinidad entre el texto del usuario y obras clásicas japonesas tras una primera etapa de recuperación por embeddings.
- Filtrado de prompt injection y contenido adversario: el autor muestra en la demo Ruri Atlas cómo un intento de inyección de prompt aterriza en el espacio de embeddings y puede detectarse con el reranker.
- Atención al cliente en japonés: reordenar respuestas candidatas de una base de conocimiento para seleccionar la más relevante antes de mostrarla o pasarla a un modelo generativo.
- Deduplicación y clustering de documentos: usar la puntuación de relevancia para ordenar pares similares y decidir si dos textos abordan el mismo tema.
- Aplicaciones macOS de escritorio: integrar el `.mlpackage` en herramientas de búsqueda local o asistentes documentales que requieran privacidad total, con el paquete int8 de 74 MB.
- Evaluación offline de sistemas RAG: medir la calidad de recuperación reordenando conjuntos de prueba en japonés sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio: los paquetes ocupan aproximadamente 147 MB en fp16 y 74 MB en int8; el repositorio completo suma 0,3 GB.
- Dispositivos: diseñado para iOS 17.0+ y macOS; se ejecuta en CPU, GPU y Neural Engine mediante Core ML.
- Cabe en dispositivos de consumo: sí, en iPhone y iPad compatibles con Core ML y en Macs con Apple Silicon; el tamaño reducido lo hace apto incluso para modelos de gama media.
- Despliegue: Core ML (`MLModel` / `MLModelConfiguration`) en Swift, o `coremltools` en Python para verificación. No se distribuyen pesos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; dependen de la longitud de secuencia (128/256/512) y de la precisión elegida.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| masahiroid/japanese-reranker-xsmall-v2-coreml | Reranker ModernBERT (Core ML) | no disponible (xsmall) | 128/256/512 | ja, en | MIT | iOS/macOS (Core ML) |
| hotchpotch/japanese-reranker-xsmall-v2 | Reranker ModernBERT (original) | no disponible (xsmall) | no disponible | ja, en | MIT (según modelo base) | PyTorch/Transformers |
| masahiroid/ruri-v3-130m-coreml | Embedding (Core ML) | ~130 M | no disponible | ja | no disponible | iOS/macOS (Core ML) |

La comparación directa con otros rerankers japoneses de la misma categoría no está disponible en la información proporcionada. La diferencia clave frente al modelo original es el formato de despliegue (Core ML frente a PyTorch) y la segmentación por longitudes fijas; frente a `ruri-v3-130m-coreml` cumple una función distinta (reordenación frente a recuperación) y ambos se usan de forma complementaria.

## Limitaciones y advertencias

- Es una conversión no oficial: el autor original del modelo es hotchpotch y no respalda esta distribución.
- Solo realiza ranking de pares; no genera texto ni ejecuta agentes.
- Longitudes de secuencia fijas por variante (128, 256 o 512): las entradas más largas deben truncarse, lo que puede degradar la puntuación.
- Idiomas limitados a japonés e inglés; el rendimiento en otros idiomas no está documentado.
- Riesgo de sesgos y alucinación heredado del modelo base; no se han publicado evaluaciones de sesgo en la información disponible.
- Licencia MIT permite uso comercial, pero conviene verificar los términos del modelo base y de los datos de entrenamiento originales.
- Al ser un artefacto Core ML, requiere plataformas Apple; no es portable a Linux o Windows sin reconversión.
- La cuantización int8 puede introducir una pérdida de precisión en las puntuaciones frente a fp16; no se han publicado métricas de esa degradación.
- El repositorio tiene un uso muy bajo (7 descargas, 2 likes) y fue creado recientemente, por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/japanese-reranker-xsmall-v2-coreml
- Modelo base: https://huggingface.co/hotchpotch/japanese-reranker-xsmall-v2
- Demo Ruri Atlas: https://huggingface.co/spaces/masahiroid/ruri-atlas
- Modelo de embeddings complementario: https://huggingface.co/masahiroid/ruri-v3-130m-coreml
- App iOS "道程 -Michinori-": https://apps.apple.com/jp/app/道程-michinori/id6782354976
- Herramienta de auditoría: https://github.com/masahiroid/model-audit-lite
- Documentación de Core ML: https://developer.apple.com/documentation/coreml
