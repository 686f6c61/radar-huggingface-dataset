# mradermacher/Qwen3.6-27B-abliterated-v1-i1-GGUF

## Resumen

Qwen3.6-27B-abliterated-v1-i1-GGUF es una cuantización GGUF del modelo base wangzhang/Qwen3.6-27B-abliterated-v1, preparada por mradermacher con calibración imatrix. El modelo original es una variante "abliterated" (con la reducción de rechazos aplicada) del Qwen3.6-27B, un modelo de lenguaje denso de 27 000 millones de parámetros con arquitectura híbrida (hybrid-attention y gated-deltanet) y capacidades multimodales de visión y lenguaje (VLM). La cuantización permite ejecutar un modelo de este tamaño en hardware de consumo con pérdidas de calidad controladas, manteniendo la licencia Apache 2.0.

Esta versión GGUF está pensada para su uso con motores de inferencia como llama.cpp, Ollama o LM Studio, y ofrece un amplio abanico de niveles de cuantización (desde Q2_K hasta Q8) para adaptarse a distintas capacidades de VRAM. Al tratarse de un modelo abliterated, se eliminan los rechazos de contenido, por lo que es adecuado para tareas de generación creativa sin restricciones, aunque esta característica conlleva riesgos adicionales en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con hybrid-attention y gated-deltanet (Qwen3.6) |
| Parametros totales | 26 895 998 464 (26,9 B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el Qwen3.6-27B original soporta 128k tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (segun comentarios de la model card) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix para calibracion) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B emplea una arquitectura densa de transformer con innovaciones híbridas: combina atención clásica con capas gated-deltanet, un mecanismo de atención lineal que reduce el coste computacional y mejora la eficiencia en contextos largos. Al ser un modelo de visión y lenguaje (VLM), integra un codificador visual y un proyector multimodal que permite procesar imágenes junto con texto. El entrenamiento original incluye fases de preentrenamiento y ajuste fino, con mejoras declaradas en razonamiento STEM, codificación agéntica y comprensión espacial.

La versión abliterated (del autor wangzhang) aplica la técnica "abliteration" para eliminar las direcciones de rechazo aprendidas durante el entrenamiento, reduciendo la negativa del modelo a responder contenidos sensibles. La cuantización de mradermacher utiliza calibración imatrix (importance matrix) para optimizar la asignación de bits y minimizar la pérdida de perplejidad, especialmente en los niveles de cuantización más bajos. El archivo .imatrix.gguf incluido permite a los usuarios generar sus propias cuantizaciones personalizadas con llama.cpp.

## Capacidades

- Generación de texto en inglés y chino, con razonamiento avanzado y habilidades matemáticas y de programación mejoradas según la descripción del Qwen3.6-27B.
- Comprensión de imágenes: al ser un VLM, puede procesar imágenes, realizar OCR, responder preguntas visuales y tareas de localización y detección de objetos.
- Codificación agéntica: soporta flujos de trabajo de agente con múltiples pasos y uso de herramientas (tool calling), aunque esta capacidad depende del modelo base original.
- Modo "abliterated": respuestas sin rechazo para contenido que el modelo original podría negarse a generar (con los riesgos asociados).
- Multilingüe limitado a inglés y chino según la model card; no se garantiza un buen rendimiento en otros idiomas.

## Casos de uso

- Generación creativa sin restricciones: el modelo abliterated permite escribir ficción, guiones o contenido de rol sin filtros de rechazo, útil para desarrolladores de juegos o aplicaciones de narrativa interactiva.
- Asistente de programación local: con 27B de parámetros y cuantización Q4, puede ejecutarse en una GPU de 16 GB para autocompletar código, explicar fragmentos y refactorizar proyectos medianos.
- Análisis de documentos con OCR: gracias a sus capacidades de visión, puede extraer texto de imágenes escaneadas, tablas y capturas de pantalla, integrándose en pipelines de procesamiento documental.
- Chatbot de atención al cliente en chino e inglés: el contexto largo (no confirmado pero típico en Qwen3.6) permite mantener conversaciones multi-turno con historial extenso, aunque la licencia Apache 2.0 facilita el despliegue comercial.
- Prototipado de agentes de razonamiento multimodal: combina entrada de imagen y texto para tareas como descripción de entornos, planificación de rutas o interpretación de diagramas técnicos.
- Evaluación de técnicas de abliteration: investigadores pueden comparar el comportamiento del modelo con y sin rechazo para estudiar sesgos, alineación y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repo de HuggingFace no incluye métricas de MMLU, HumanEval, GSM8K ni otros tests estandarizados. La descripción del Qwen3.6-27B original menciona mejoras en razonamiento STEM y codificación agéntica, pero sin cifras concretas. Se recomienda consultar la documentación oficial de Qwen para obtener datos comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M (~16 GB), cabe en GPUs de consumo como RTX 4080/4090 de 16 GB; con Q8 (~27 GB) requiere una GPU de 32 GB o dos GPUs en paralelo.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para Q4/Q5, A100 40 GB o H100 para Q8 y contexto largo.
- Compatibilidad con consumer GPU: sí, si se usa cuantización Q4 o inferior (Q2, IQ3) y se limita el contexto a 8k-16k tokens.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp; también es compatible con servidores como llama-cpp-python. Para el componente de visión, se necesita el archivo mmproj del repositorio estático (mradermacher/Qwen3.6-27B-abliterated-v1-GGUF).
- Latencia y throughput: no se dispone de datos medidos; en una RTX 4090 con Q4_K_M se puede esperar una generación de 20-40 tokens/s, pero depende del contexto y del backend.

## Comparativa con modelos similares

No disponible. No se han encontrado comparativas directas con otros modelos en la informacion proporcionada. Como referencia, el Qwen3.6-27B original podría compararse con Llama 3.1 8B o Qwen3-30B-A3B (MoE), pero faltan datos de rendimiento y especificaciones de contexto para realizar una tabla fiable.

## Limitaciones y advertencias

- El modelo abliterated elimina los rechazos de contenido, lo que puede generar respuestas ofensivas, ilegales o peligrosas. No es adecuado para aplicaciones comerciales sin moderación adicional.
- Solo se garantiza un buen rendimiento en inglés y chino; otros idiomas pueden presentar degradaciones significativas.
- La longitud de contexto no está confirmada en esta cuantización; usar contextos muy largos puede agotar la VRAM y degradar la calidad.
- Al ser una cuantización GGUF, la pérdida de precisión es mayor en niveles bajos (Q2, IQ1); se recomienda Q4_K_M o superior para tareas de razonamiento complejo.
- El modelo base es un VLM, pero el archivo mmproj (proyector de visión) no está incluido en este repositorio; hay que descargarlo aparte del repo estático.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza abliterated puede implicar riesgos legales o de reputación dependiendo del caso de uso.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/Qwen3.6-27B-abliterated-v1-i1-GGUF
- Modelo base (abliterated): https://huggingface.co/wangzhang/Qwen3.6-27B-abliterated-v1
- Repositorio estático con quants y mmproj: https://huggingface.co/mradermacher/Qwen3.6-27B-abliterated-v1-GGUF
- Página de QwenCloud sobre Qwen3.6-27B: https://www.qwencloud.com/models/qwen3.6-27b
- Guía de Qwen 3.6 en insiderllm: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
