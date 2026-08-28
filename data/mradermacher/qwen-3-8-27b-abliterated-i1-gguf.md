# mradermacher/qwen-3.8-27b-abliterated-i1-GGUF

## Resumen

El modelo `mradermacher/qwen-3.8-27b-abliterated-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo `heterodoxin/qwen-3.8-27b-abliterated`, desarrollado por el usuario mradermacher. Se trata de una versión "abliterated" (descensurada) de un modelo base de la familia Qwen 3.8 con aproximadamente 26,9 mil millones de parámetros, publicada bajo licencia Apache 2.0. El objetivo principal es ofrecer una alternativa local sin restricciones de contenido, manteniendo las capacidades conversacionales y de razonamiento del modelo original.

La relevancia actual de este modelo radica en la creciente demanda de modelos de lenguaje grandes que puedan ejecutarse en hardware local con cuantización eficiente, y que además permitan explorar casos de uso donde la censura del modelo base supone una limitación. Al estar disponible en formato GGUF, es compatible con motores de inferencia como llama.cpp, Ollama o LM Studio, lo que facilita su despliegue en equipos de consumo.

La cuantización se ha realizado con la técnica imatrix, que mejora la calidad de los quants de baja precisión. Se ofrecen tres variantes principales (Q2_K, IQ3_M y Q4_K_S), además de un archivo de imatrix para que los usuarios puedan generar sus propias cuantizaciones. El idioma soportado es exclusivamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen 3.8, presumiblemente transformer denso) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (tambien IQ3_XXS, IQ4_XS, etc. en la version estatica) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Se sabe que es una cuantización GGUF del modelo `heterodoxin/qwen-3.8-27b-abliterated`, que a su vez es una versión "abliterated" de un modelo Qwen 3.8 de 27B parámetros. La técnica de abliteration consiste en eliminar las direcciones de rechazo en el espacio de activaciones, reduciendo la tendencia del modelo a negarse a responder a ciertas peticiones. Según los resultados de búsqueda, el proceso se aplicó a nivel de tensor, dejando intactas la torre de visión y la cabeza MTP (multi-token prediction).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La cuantización imatrix, por su parte, utiliza una matriz de importancia calculada sobre un conjunto de datos de calibración para mejorar la asignación de bits en los quants de baja precisión, lo que reduce la pérdida de calidad respecto a cuantizaciones estáticas.

## Capacidades

- Generación de texto conversacional en inglés, con soporte para diálogos multi-turno.
- Razonamiento y respuesta a preguntas complejas, heredado del modelo base Qwen 3.8.
- Generación de código y soporte de tool calling (según las capacidades del modelo base, no confirmado en esta variante).
- Capacidad de procesamiento de visión (la torre de visión se mantiene intacta según la descripción del proceso de abliteration, aunque no se especifica si esta variante GGUF incluye el proyector de visión).
- Comportamiento "uncensored" o "abliterated": reducción significativa de las negativas por contenido, con un 0% de over-refusal en XSTest y 0-6% de refusal en el suite A/B, según datos del modelo base.
- Compatibilidad con motores de inferencia que soporten GGUF (llama.cpp, Ollama, LM Studio, etc.).

## Casos de uso

- Generación de contenido creativo sin restricciones temáticas: el modelo puede utilizarse para escribir ficción, poesía o guiones que aborden temas que otros modelos censurarían, gracias a su naturaleza abliterated.
- Investigación en seguridad y red-teaming: permite estudiar cómo se comporta un LLM sin capas de rechazo, útil para evaluar riesgos de sesgo o contenido dañino en entornos controlados.
- Asistente de programación local: con soporte de tool calling (si el modelo base lo tiene), puede integrarse en entornos de desarrollo para generar código, explicar algoritmos o revisar fragmentos.
- Chatbot de atención al cliente en inglés: su capacidad conversacional y su ventana de contexto (no especificada) permiten mantener diálogos largos, aunque habría que evaluar la calidad de las respuestas en dominios específicos.
- Prototipado rápido de aplicaciones de IA generativa: al ser un GGUF ligero (15,7 GB en Q4_K_S), puede ejecutarse en GPUs de consumo para pruebas de concepto sin depender de APIs externas.
- Análisis de documentos extensos: si la longitud de contexto es suficiente (dato no disponible), podría resumir o extraer información de textos largos, aunque se recomienda verificar este aspecto antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento provienen del modelo base y se refieren a métricas de rechazo: 0% de over-refusal en XSTest y 0-6% de refusal en el suite A/B, sin pérdida medible de capacidades. Sin embargo, estos no son benchmarks de calidad general y no se pueden comparar directamente con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: según el quant elegido, se necesitan aproximadamente 11 GB para Q2_K (10,8 GB), 13 GB para IQ3_M (12,7 GB) y 16 GB para Q4_K_S (15,7 GB). Hay que añadir overhead del runtime, por lo que se recomienda al menos 2-4 GB adicionales.
- GPU recomendadas: para Q4_K_S, una GPU con 16-20 GB de VRAM (RTX 4080, RTX 4090, A4000, etc.). Para quants menores, una RTX 3060 12 GB o similar puede ser suficiente.
- Es posible ejecutar el modelo en CPU con llama.cpp, aunque la velocidad será significativamente menor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4090, se puede esperar una velocidad de generación de 20-40 tokens/s con Q4_K_S, pero es una estimación orientativa.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría (tamaño similar, abliterated, GGUF). El modelo base `heterodoxin/qwen-3.8-27b-abliterated` es la referencia directa, pero no se conocen sus métricas de rendimiento frente a otros modelos. Se recomienda consultar benchmarks externos de la familia Qwen 3.8 para obtener una referencia aproximada.

## Limitaciones y advertencias

- Al ser un modelo abliterated, puede generar contenido ofensivo, ilegal o peligroso sin filtros. Su uso en producción debe limitarse a entornos controlados y con supervisión humana.
- No se ha especificado la longitud de contexto, lo que impide saber si es adecuado para tareas de procesamiento de documentos largos.
- El idioma soportado es únicamente inglés; no se garantiza un buen rendimiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales que no se han detallado.
- La cuantización introduce pérdida de calidad respecto al modelo original en BF16, especialmente en los quants de menor precisión (Q2_K, IQ3_M).
- No se han publicado resultados de benchmarks de calidad general, por lo que su rendimiento real en tareas como razonamiento o generación de código es desconocido.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mradermacher/qwen-3.8-27b-abliterated-i1-GGUF)
- [Modelo base heterodoxin/qwen-3.8-27b-abliterated](https://huggingface.co/heterodoxin/qwen-3.8-27b-abliterated)
- [Versión estática de los quants](https://huggingface.co/mradermacher/qwen-3.8-27b-abliterated-GGUF)
- [Blog sobre Qwen3.8-27B Uncensored GGUF](https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf)
- [Entrada en free2aitools](https://free2aitools.com/model/mradermacher/qwen3.8-27b-abliterated-sft-i1-gguf)
