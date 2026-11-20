# iapp/openthai2.0-qwen3.8-27b-GGUF

## Resumen

OpenThai2.0-qwen3.8-27b es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) desarrollado por iApp en el marco del proyecto OpenThai (anteriormente OpenThaiGPT), lanzado junto con AIEAT. Está construido sobre una base Qwen3 de 27B (según la nomenclatura del identificador "qwen3.8-27b") y está especializado en conocimiento, documentos y capacidades agénticas en tailandés, manteniendo competencia en inglés. La ficha que nos ocupa corresponde a la versión cuantizada en GGUF para llama.cpp, publicada por el mismo autor.

El modelo aborda un problema concreto: la escasez de modelos abiertos con calidad real en tailandés, especialmente en tareas de OCR y procesamiento de documentos, además de razonamiento agéntico. Para ello incorpora un proyector de visión (mmproj) que permite procesar documentos e imágenes, y una cabeza MTP (Multi-Token Prediction) exportada como capas "nextn", lo que habilita decodificación especulativa en llama.cpp.

La relevancia actual del lanzamiento radica en su empaquetado práctico: cuantizaciones calibradas con imatrix específica para tailandés e inglés (incluida una IQ2_M de ~9,8 GB que, según el autor, supera las comprobaciones factuales que Q2_K falla), lo que permite ejecutar un modelo de 27B en hardware de consumo. La licencia Apache 2.0 facilita su adopción comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3 (27B), con cabeza MTP (capas nextn) y proyector de visión |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (recomendado en la documentación de llama.cpp; contexto nativo del base no disponible) |
| Tipos de cuantizacion | IQ2_M (~9,8 GB), Q2_K (~11 GB), Q4_K_M (~17 GB), Q8_0 (~29 GB); proyector de visión en F16 |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

La información disponible no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados. El modelo se presenta como una adaptación del Qwen3 de 27B (identificador "qwen3.8-27b") orientada a tailandés, con soporte de visión mediante un proyector multimodal separado (mmproj en F16) que procesa documentos e imágenes. La inclusión de una cabeza MTP (Multi-Token Prediction) exportada como capas nextn es una innovación destacable: permite decodificación especulativa dentro de llama.cpp, acelerando la generación al predecir varios tokens por paso y verificarlos en paralelo.

El autor indica que el modelo "razona antes de responder", lo que sugiere un modo de razonamiento explícito (thinking) heredado de la familia Qwen3, con cadenas de pensamiento que consumen tokens antes de la respuesta final. No se especifican en la información proporcionada detalles sobre RLHF, DPO u otras etapas de alineamiento, ni la composición del corpus tailandés utilizado.

## Capacidades

- Generación de texto conversacional multi-turno en tailandés e inglés, con modo de razonamiento previo a la respuesta.
- Procesamiento de documentos e imágenes mediante el proyector de visión (mmproj): OCR y comprensión de documentos escaneados, formularios y capturas.
- Razonamiento de varios pasos y capacidades agénticas, según la descripción del proyecto ("Document, and Agentic AI").
- Decodificación especulativa mediante la cabeza MTP (capas nextn) en llama.cpp.
- Capacidades multilingües limitadas a tailandés e inglés; no se declaran otros idiomas.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible (la base Qwen3 lo soporta, pero no se verifica para este ajuste).
- Capacidades de código y matemáticas: no documentadas específicamente en la información disponible.

## Casos de uso

- Digitalización de documentos tailandeses: el modelo, con el proyector de visión, puede procesar imágenes de formularios, facturas y documentos escaneados en tailandés, extrayendo texto y estructura gracias a su especialización en OCR y a la ventana de 32k tokens para documentos largos.
- Atención al cliente en tailandés: gestión de conversaciones multi-turno con contexto amplio (32k tokens), adecuado para historiales de soporte largos y consultas que requieren razonamiento previo antes de responder.
- Asistentes agénticos para trámites administrativos: el enfoque "agentic" del proyecto permite encadenar pasos de razonamiento para resolver tareas como rellenar formularios o consultar bases de datos documentales.
- Procesamiento de corpus documentales en investigación: análisis y resumen de colecciones de documentos en tailandés con el modelo cuantizado en Q8_0 (~29 GB) para máxima fidelidad, o Q4_K_M (~17 GB) para equilibrio.
- Despliegue en hardware de consumo: la cuantización IQ2_M (~9,8 GB) permite ejecutar el modelo en GPUs de gama alta para consumo (24 GB) o incluso configuraciones ajustadas, manteniendo según el autor la corrección factual que Q2_K no logra.
- Búsqueda y respuesta sobre documentos (RAG): combinación del contexto de 32k tokens con la capacidad de visión para indexar y consultar documentación técnica o legal en tailandés.
- Traducción y adaptación de contenido entre tailandés e inglés: el modelo cubre ambos idiomas, útil para localización de documentación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor remite al repositorio del modelo base en bf16 para benchmarks completos y la model card íntegra, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: ~9,8 GB (IQ2_M), ~11 GB (Q2_K), ~17 GB (Q4_K_M), ~29 GB (Q8_0), más el proyector de visión F16 (tamaño no especificado, típicamente unos cientos de MB a pocos GB).
- GPU recomendadas: para Q8_0, A100 40/80 GB o H100; para Q4_K_M, RTX 4090 (24 GB) o A6000 (48 GB); para IQ2_M, GPUs de 12-16 GB como RTX 4080 o RTX 4060 Ti 16 GB.
- Cabe en GPU de consumo: sí, en RTX 4090 con Q4_K_M y en GPUs de 12-16 GB con IQ2_M. El autor confirma ejecución de IQ2_M en GPU con comprobaciones factuales correctas.
- Opciones de despliegue: llama.cpp (llama-server), con soporte de mmproj para visión; también compatible con endpoints según los tags del repositorio. No se mencionan vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La cabeza MTP habilita decodificación especulativa, que debería mejorar el throughput, pero no se publican cifras.
- Nota operativa: el autor advierte de usar contexto de 32k y dejar max_tokens sin fijar o en 8192 o más, ya que de lo contrario las respuestas pueden volver vacías debido al razonamiento previo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de la misma categoría (por ejemplo, Qwen3-27B base, Typhoon u otros modelos tailandeses). Los datos objetivos de comparación serían: parámetros (~27,3B), contexto (32k recomendado), licencia (Apache 2.0) y disponibilidad en GGUF con visión y MTP, pero faltan cifras de benchmarks para una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado principalmente con datos tailandeses e ingleses, es probable que presente sesgos culturales y lingüísticos de esas fuentes.
- Riesgo de alucinación: presente como en cualquier LLM; el autor advierte que la cuantización Q2_K muestra "deslices factuales" observados y recomienda IQ2_M en su lugar.
- Limitaciones de contexto e idioma: solo tailandés e inglés; no se declaran otros idiomas. El contexto recomendado es de 32k tokens; documentos más largos requieren fragmentación.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero se debe verificar la licencia del modelo base (Qwen3) por si impone condiciones adicionales.
- Caveat de producción: el razonamiento previo consume tokens y puede devolver respuestas vacías si max_tokens es insuficiente; es necesario configurar límites de generación altos (≥8192) y contextos amplios.
- La cuantización IQ2_M, aunque calibrada con imatrix, sigue siendo una compresión agresiva; para tareas críticas se recomienda Q4_K_M o superior.
- El repositorio ocupa 286,7 GB, lo que implica una descarga considerable si se desean todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-GGUF
- Modelo base (bf16): https://huggingface.co/iapp/openthai2.0-qwen3.8-27b
- Modelo base original del autor: https://huggingface.co/kobkrit/openthai2.0-qwen3.8-27b
- Proyecto OpenThai (anteriormente OpenThaiGPT): no disponible en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
