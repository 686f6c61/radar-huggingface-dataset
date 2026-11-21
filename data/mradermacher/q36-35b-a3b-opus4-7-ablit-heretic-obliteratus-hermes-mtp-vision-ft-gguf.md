# mradermacher/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-GGUF

## Resumen

Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) con 35.505.251.456 parámetros totales y 3B parámetros activos por token (según el sufijo A3B del nombre), derivado de la familia Qwen 3.6 (tag `qwen3_5_moe`). Esta ficha concreta es la cuantización estática en GGUF publicada por mradermacher sobre el modelo base de oktaydu, que a su vez es un fine-tuning orientado a razonamiento, function calling y uso agéntico sobre una variante "abliterated" (sin rechazos) del modelo original.

El modelo acumula varias modificaciones sobre la base: eliminación de mecanismos de rechazo (tags `abliterated`, `heretic`, `obliteratus`, `not-for-all-audiences`), fine-tuning con los datasets `NousResearch/hermes-function-calling-v1` y `lambda/hermes-agent-reasoning-traces`, soporte de visión (componente `mmproj` en los GGUF), y una cabeza MTP/NextN (Multi-Token Prediction) que permite decodificación especulativa nativa. El resultado es un modelo orientado a agentes, coding agéntico y tool use, con capacidades multimodales.

La relevancia práctica de esta publicación es que ofrece el modelo en 13 cuantizaciones GGUF (desde Q2_K de 13,3 GB hasta Q8_0 de 37,9 GB) más dos variantes del proyector multimodal, lo que permite desplegarlo en hardware de consumo. La licencia declarada es Apache 2.0, aunque las modificaciones de alineación (abliteration) y los datasets de entrenamiento introducen caveats importantes para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, base Qwen 3.6 (`qwen3_5_moe`), con MTP/NextN y torre de visión |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | 3B (según el sufijo A3B del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector multimodal en mmproj-Q8_0 y mmproj-f16; pesos originales en bfloat16 |
| Idiomas soportados | en (inglés, declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (esta ficha) y safetensors/bfloat16 en el modelo base |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture-of-Experts, identificado en los tags como `qwen3_5_moe`, lo que lo sitúa en la línea Qwen 3.6 de Alibaba. Con 35,5B parámetros totales y 3B activos, el coste computacional por token se aproxima al de un modelo denso de 3B, mientras que la capacidad efectiva de parámetros es diez veces mayor. Incluye una cabeza MTP (Multi-Token Prediction, también etiquetada `nextn`), un mecanismo de predicción de varios tokens por paso que habilita decodificación especulativa y mejora el throughput en inferencia. Dispone además de un proyector multimodal (`mmproj`) que conecta un codificador visual con el espacio de tokens del modelo, lo que le confiere capacidades vision-language.

El entrenamiento parte del modelo base de oktaydu, que combina varias fases: una ablación de las direcciones de rechazo en el espacio de activaciones (abliteration, con las variantes `heretic` y `obliteratus`), seguida de fine-tuning supervisado con `NousResearch/hermes-function-calling-v1` (function calling) y `lambda/hermes-agent-reasoning-traces` (trazas de razonamiento agéntico). No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO. La model card no documenta hiperparámetros, metodología de alineación ni detalles del proceso de abliteration.

## Capacidades

- Generación de texto y razonamiento multi-paso, con soporte declarado de modo de razonamiento (`reasoning`).
- Function calling y tool use, entrenado explícitamente con `hermes-function-calling-v1`.
- Comportamiento agéntico: trazas de razonamiento agéntico (`hermes-agent-reasoning-traces`) y tag `agentic-coding`.
- Generación y edición de código, incluyendo flujos de coding agéntico.
- Capacidades multimodales de visión-lenguaje mediante el proyector `mmproj` (comprensión de imágenes).
- Decodificación especulativa nativa vía MTP/NextN, orientada a reducir latencia.
- Multilingüe limitado: la model card solo declara inglés.
- Sin mecanismos de rechazo (abliterated): responde a peticiones que un modelo alineado estándar rechazaría.

## Casos de uso

- Agentes de código autónomos: el modelo puede operar bucles de edición-ejecución-verificación sobre repositorios, apoyándose en el entrenamiento con trazas agénticas y en el soporte de tool calling para invocar compiladores, tests y linters.
- Automatización de pipelines CI/CD: integrado como paso de revisión o corrección, puede invocar herramientas vía function calling para leer logs de fallo, proponer parches y validarlos contra la suite de tests.
- Asistente de terminal con herramientas: al ser un MoE de 3B activos, ofrece latencia baja por token, adecuada para agentes interactivos que necesitan muchas llamadas cortas a herramientas.
- Análisis de capturas e interfaces: gracias a la torre de visión, puede interpretar screenshots de aplicaciones, diagramas o gráficos y convertirlos en descripciones estructuradas o en código de reproducción.
- Extracción estructurada de documentos: combinando visión y function calling, puede procesar imágenes de formularios o tablas y emitir JSON validable contra un esquema.
- Despliegue en hardware de consumo para prototipado: las cuantizaciones Q4_K_M (21,8 GB) permiten ejecutar el modelo en una GPU de 24 GB, lo que facilita experimentación local con un modelo de 35B.
- Generación de datos sintéticos para fine-tuning: su naturaleza sin rechazos y su capacidad de razonamiento lo hacen útil para producir trazas de razonamiento y pares de instrucción-respuesta en dominios donde los modelos alineados estándar se niegan a responder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin caché KV): Q2_K 13,3 GB; Q3_K_S 15,6 GB; Q3_K_M 17,3 GB; Q3_K_L 18,7 GB; IQ4_XS 19,5 GB; Q4_K_S 20,5 GB; Q4_K_M 21,8 GB; Q5_K_S 24,7 GB; Q5_K_M 25,4 GB; Q6_K 29,3 GB; Q8_0 37,9 GB. Añadir 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16) si se usa visión.
- GPU de 24 GB (RTX 3090, RTX 4090): ejecutan hasta Q4_K_M con comodidad; Q5_K_M requiere ajustar el offload de capas o reducir contexto.
- GPU de 32 GB (RTX 5090, V100 32GB): Q6_K sin problemas, Q8_0 con offload parcial.
- GPU profesionales (A100 40/80 GB, H100 80 GB): Q8_0 completo en VRAM con contexto amplio; el modelo en bfloat16 (≈71 GB) cabe en una H100 80 GB o en dos A100 40 GB.
- Consumer GPU de 16 GB (RTX 4080, 4060 Ti 16GB): viable con Q3_K_M o IQ4_XS y offload parcial a RAM; Q4_K_S es el límite práctico.
- Consumer GPU de 12 GB: solo Q2_K con offload agresivo de capas; degradación de calidad notable.
- Despliegue: llama.cpp y Ollama para GGUF (soporte de `mmproj` para visión en llama.cpp); vLLM y TGI quedan limitados al modelo base en safetensors, no a esta cuantización. Los tags indican `endpoints_compatible`.
- Throughput y latencia: no disponibles en la información proporcionada. Como referencia estructural, los 3B parámetros activos sitúan el coste por token en el orden de un modelo denso de 3B, y la cabeza MTP puede reducir el número de pasos de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Este modelo (GGUF de mradermacher) | 35,5B / 3B | no disponible | Apache 2.0 | GGUF (11 cuantizaciones) + safetensors en base | Multimodal, MTP, abliterated, fine-tuning Hermes |
| Qwen3-30B-A3B (referencia de familia) | 30,5B / 3,3B | 262.144 tokens (nativo, ampliable) | Apache 2.0 | safetensors, GGUF | MoE denso estándar, alineado, sin visión en todas las variantes |
| Qwen3-32B (denso) | 32,8B / 32,8B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Mayor coste por token al ser denso; sin capacidades multimodales |
| Mixtral 8x7B | 46,7B / 12,9B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | MoE con el triple de parámetros activos; sin visión ni MTP |

La comparación con Qwen3-30B-A3B es la más directa por tamaño y arquitectura MoE, pero conviene señalar que la información disponible no confirma que este modelo derive de esa versión concreta ni permite comparar rendimiento real, al no haber benchmarks publicados.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado las direcciones de rechazo, por lo que puede generar contenido dañino, ilegal o NSFW. El tag `not-for-all-audiences` lo indica explícitamente. No es apto para aplicaciones de cara al público sin un filtro externo.
- La abliteration degrada habitualmente la coherencia y la calidad del razonamiento en tareas benignas; no hay evaluaciones publicadas que cuantifiquen esa pérdida.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de factualidad ni benchmarks de ningún tipo.
- Solo se declara inglés; el rendimiento en castellano no está verificado y puede ser deficiente, especialmente tras el fine-tuning con datasets en inglés.
- Longitud de contexto no documentada en la información disponible; no debe asumirse la ventana nativa de la familia Qwen sin verificación empírica.
- Licencia Apache 2.0 declarada, pero la cadena de modelos base y los datasets de entrenamiento (`NousResearch/hermes-function-calling-v1`, `lambda/hermes-agent-reasoning-traces`) pueden imponer condiciones adicionales no reflejadas en la model card.
- El repositorio ocupa 244,4 GB y contiene pesos duplicados en varias cuantizaciones; conviene descargar solo los ficheros necesarios.
- La model card del cuantizador no documenta el proceso de conversión más allá de metadatos internos (`quantize_version: 2`, `convert_type: hf`), ni incluye evaluación de perplejidad de las cuantizaciones.
- Sin garantías de mantenimiento: 719 descargas y 1 like en el momento de la consulta, con última actualización en noviembre de 2026.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-GGUF
- Modelo base (safetensors): https://huggingface.co/oktaydu/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT
- Cuantizaciones ponderadas / imatrix: https://huggingface.co/mradermacher/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset de trazas agénticas: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
