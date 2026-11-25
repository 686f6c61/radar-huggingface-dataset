# sentientsai/mxbai-rerank-xsmall-v1

## Resumen

mxbai-rerank-xsmall-v1 es un modelo de reranking (cross-encoder) empaquetado en formato ONNX por Sentients AI para su uso dentro de Text Core, un plugin de componentes de IA para Unreal Engine. El modelo original procede de Mixedbread (mixedbread-ai/mxbai-rerank-xsmall-v1) y su función es ordenar un conjunto de pasajes según su relevancia respecto a una consulta, incluyendo la capacidad de determinar que ningún pasaje responde a la pregunta. No es un modelo generativo, sino un componente de recuperación que se sitúa en la segunda fase de un pipeline RAG (retrieval-augmented generation), tras un recuperador inicial.

El repositorio de Sentients no introduce pesos nuevos: redistribuye los ficheros del publicador original (model.onnx en fp32, model_quantized.onnx en int8 y tokenizer.json) y añade una variante en fp16 generada mediante el script `make_fp16.py`. Todos los ficheros están fijados por hash SHA-256 en el catálogo firmado de Sentients, de modo que el plugin y sus referencias en Python descargan exclusivamente los bytes verificados.

Su relevancia actual radica en dos factores: por un lado, la licencia Apache 2.0 y el formato ONNX permiten desplegarlo en CPU, DirectML, TensorRT y HLSL sin dependencias de frameworks de deep learning pesados; por otro, su tamaño reducido (271 MiB en fp32, 83 MiB en int8) lo hace apto para ejecución en cliente, incluidos entornos de videojuego en tiempo real como Unreal Engine.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (reranker); detalles de capas y dimensiones no disponibles |
| Parametros totales | no disponible (tamaño de pesos: 271 MiB en fp32, 136,3 MiB en fp16, 83,2 MiB en int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`, `model_quantized.onnx`) y `tokenizer.json` |
| Entrada / salida | `CoreTextLabelsInput` → `CoreRankingOutput` (interfaz del plugin Text Core) |
| Runtimes compatibles | CPU, DirectML, TensorRT, HLSL (fp32); DirectML y TensorRT (fp16); CPU, DirectML y TensorRT (int8) |
| Tamaño del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de reranking: recibe pares consulta-pasaje y produce una puntuación de relevancia para cada par, lo que permite reordenar una lista de candidatos recuperados previamente. A diferencia de los bi-encoders, que codifican consulta y documento por separado, el cross-encoder evalúa conjuntamente ambos textos, lo que típicamente mejora la precisión del ranking a costa de un mayor coste por par evaluado.

No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF, DPO u otras. La model card de Sentients se limita a documentar la procedencia de los ficheros (Mixedbread, commit `b5c6e9da73ab`) y las transformaciones aplicadas: fijado de formas para runtimes que las requieren, conversión a media precisión y reescritura del grafo para su ejecución en los runtimes objetivo. La innovación destacable no está en la arquitectura sino en el empaquetado: verificación por hash SHA-256, catálogo firmado y variantes optimizadas por runtime.

## Capacidades

- Reranking de pasajes: ordena un conjunto de documentos según su grado de respuesta a una consulta.
- Detección de ausencia de respuesta: puede indicar que ningún pasaje del conjunto responde a la pregunta formulada.
- Integración como componente de Unreal Engine mediante `ETextModel::MxbaiRerankXSmall`, con entrada `CoreTextLabelsInput` y salida `CoreRankingOutput`.
- Ejecución en CPU, DirectML, TensorRT y HLSL según la variante de precisión elegida.
- Verificación de integridad: los ficheros se descargan por hash desde el catálogo firmado de Sentients.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso por sí mismo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- RAG en aplicaciones de Unreal Engine: tras una recuperación inicial por similitud vectorial, el modelo reordena los pasajes candidatos antes de pasarlos a un LLM generativo, mejorando la calidad de las respuestas con contexto recuperado.
- Atención al cliente dentro de experiencias interactivas: dado un conjunto de fragmentos de documentación o FAQ, el modelo selecciona los más relevantes para la consulta del usuario y descarta los que no responden, reduciendo respuestas basadas en contexto irrelevante.
- Búsqueda documental en herramientas de escritorio: al ejecutarse en CPU con la variante int8 (83,2 MiB), puede desplegarse localmente sin GPU para reordenar resultados de búsqueda en aplicaciones ofimáticas o visores de documentación.
- Filtrado de contexto en pipelines de agentes: antes de inyectar pasajes en la ventana de contexto de un LLM, el reranker elimina los candidatos de baja relevancia, reduciendo el consumo de tokens y el riesgo de distracción del modelo generativo.
- Moderación y verificación de fuentes: la capacidad de detectar que ningún pasaje responde a una consulta permite construir flujos que rechacen responder cuando la base documental no contiene evidencia suficiente.
- Sistemas de recomendación de contenido textual: reordenar artículos, entradas de wiki o mensajes de foro según su afinidad con una consulta o perfil, usando la puntuación del cross-encoder como señal de ranking.
- Despliegue en entornos con aceleración gráfica: la variante fp16 (136,3 MiB) puede ejecutarse en DirectML o TensorRT aprovechando la GPU ya presente en un equipo de juego, sin añadir un runtime de inferencia separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de los pesos, la variante int8 (83,2 MiB) y la fp16 (136,3 MiB) son las más ligeras, mientras que fp32 ocupa 271 MiB.
- GPU recomendadas: no disponibles; los runtimes declarados (DirectML, TensorRT, HLSL) indican compatibilidad con GPU de consumo y profesionales, pero no se especifican modelos concretos.
- GPU de consumo: el tamaño de los ficheros sugiere que cabe holgadamente en cualquier GPU de consumo reciente; no se confirma en la documentación.
- CPU: la variante fp32 y la int8 declaran soporte de CPU, lo que permite inferencia sin GPU.
- Opciones de despliegue: ONNX Runtime con ejecución en CPU, DirectML, TensorRT o HLSL; integración nativa mediante el plugin Text Core de Sentients para Unreal Engine.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mxbai-rerank-xsmall-v1 (Sentients) | Cross-encoder reranker | no disponible | no disponible | Apache 2.0 | ONNX (fp32/fp16/int8) | Empaquetado para Unreal Engine, verificado por hash |
| mixedbread-ai/mxbai-rerank-xsmall-v1 | Cross-encoder reranker | no disponible | no disponible | Apache 2.0 | safetensors / ONNX | Modelo original del que deriva el anterior |
| Alternativas de reranking de la familia mxbai-rerank | Cross-encoder reranker | no disponible | no disponible | Apache 2.0 | safetensors / ONNX | Variantes de mayor tamaño de Mixedbread; datos concretos no disponibles en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para producir texto, código ni razonamiento; su única función es puntuar y ordenar pasajes.
- Sesgos conocidos: no documentados en la información disponible; al derivar de un modelo entrenado por terceros, hereda los sesgos de su dataset original, que no se detalla.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede asignar puntuaciones altas a pasajes que no responden realmente a la consulta; la detección de ausencia de respuesta no está cuantificada.
- Longitud de contexto e idiomas: no disponibles; se desconoce el límite de tokens por par y la cobertura lingüística real.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben conservarse los avisos de licencia y atribución correspondientes al modelo original de Mixedbread.
- Dependencia del catálogo de Sentients: el plugin descarga exclusivamente los ficheros con hash coincidente, por lo que cualquier modificación local de los pesos rompe la verificación.
- Integración acoplada a Unreal Engine: fuera de ese entorno, el uso requiere ONNX Runtime y la gestión manual de la tokenización y del formato de entrada/salida.
- Fecha de creación del repositorio (2026-11-20) posterior a la fecha actual del análisis; conviene verificar la vigencia y el estado del catálogo firmado antes de desplegarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sentientsai/mxbai-rerank-xsmall-v1
- Modelo original de Mixedbread: https://huggingface.co/mixedbread-ai/mxbai-rerank-xsmall-v1
- Catálogo firmado de Sentients: https://huggingface.co/sentientsai/sentients-catalog
