# mradermacher/Qwen3.6-35B-v2-MoE-Ablit-Heretic-Uncensor-Hermes-MTP-Vision-FT-i1-GGUF

## Resumen

Esta ficha describe `mradermacher/Qwen3.6-35B-v2-MoE-Ablit-Heretic-Uncensor-Hermes-MTP-Vision-FT-i1-GGUF`, una colección de cuantizaciones GGUF (con técnica imatrix) del modelo base `oktaydu/Qwen3.6-35B-v2-MoE-Ablit-Heretic-Uncensor-Hermes-MTP-Vision-FT`. El autor de la cuantización es mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos abiertos para su uso en llama.cpp y entornos de inferencia local. El modelo original es un derivado de la familia Qwen 3.5/3.6 con arquitectura MoE (Mixture of Experts), capacidades de visión y modificaciones de "abliteración" y "uncensoring" orientadas a eliminar restricciones de rechazo.

El modelo resuelve el problema de ejecutar un MoE de gran tamaño (35.505.251.456 parámetros totales según los safetensors del repo base) en hardware de consumo mediante cuantizaciones que van desde ~13,3 GB (i1-Q2_K) hasta ~29,3 GB (i1-Q6_K). Incluye soporte de visión a través de ficheros mmproj, que según la model card se alojan en el repositorio estático hermano. La relevancia actual radica en la combinación de tres factores poco habituales: arquitectura MoE con visión, linaje Hermes (orientado a tool calling y razonamiento) y una licencia Apache 2.0 que permite uso comercial.

El repositorio acumula 695 descargas y 2 likes en el momento de la consulta, con un tamaño total de 279,2 GB (incluyendo todas las variantes de cuantización). La información pública disponible es escasa: no se detallan datos de entrenamiento, composición del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre transformer, tag `qwen3_5_moe`; incluye módulo de visión y MTP (multi-token prediction) |
| Parametros totales | 35.505.251.456 (35,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; también disponible fichero imatrix para crear cuantizaciones propias |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), identificado por el tag `qwen3_5_moe`, lo que sugiere una variante de la familia Qwen 3.5. El nombre del modelo base indica varias capas de modificación acumuladas: `Ablit` (abliteración, técnica de edición de pesos que elimina la dirección de rechazo en el espacio de activaciones), `Heretic` y `Uncensor` (variantes de fine-tuning orientadas a reducir negativas del modelo), `Hermes` (linaje de fine-tuning con énfasis en tool calling y formato de conversación) y `MTP` (multi-token prediction, técnica de decodificación especulativa que predice varios tokens por paso). También incorpora un módulo de visión, lo que lo convierte en un modelo multimodal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo base. La model card del repositorio de cuantización no incluye esos detalles y el autor solo documenta el proceso de cuantización (imatrix, versión 2 del cuantizador, tipo de conversión `hf`). La innovación técnica destacable, más allá del propio MoE, es el uso de imatrix para las cuantizaciones i1, que según el autor mejora la calidad frente a cuantizaciones estáticas de tamaño similar.

## Capacidades

- Generación de texto conversacional multi-turno, con orientación explícita a roleplay y conversación abierta (tags `conversational`, `roleplay`).
- Razonamiento y resolución de problemas (tag `reasoning`).
- Generación de código (tag `coding`).
- Tool calling / function calling (tag `tool-calling`), con linaje Hermes que habitualmente incluye formatos de llamada a herramientas.
- Capacidades de visión: procesamiento de imágenes mediante ficheros mmproj (disponibles en el repositorio estático hermano).
- MTP (multi-token prediction): decodificación especulativa integrada para acelerar la generación.
- Modo sin censura / abliterado: reduce los rechazos del modelo ante peticiones que un modelo alineado estándar rechazaría.
- Multilingüe: limitado a inglés según el campo `language` de la model card.

## Casos de uso

- Asistente conversacional local sin restricciones de contenido: el modelo puede mantener diálogos multi-turno y roleplay sin los rechazos típicos de modelos alineados, adecuado para investigación sobre comportamiento de modelos y para aplicaciones creativas que requieren libertad expresiva.
- Generación de código en entornos de desarrollo local: gracias al tag `coding` y a las cuantizaciones de 20-25 GB, puede ejecutarse en una estación de trabajo con una RTX 4090 (24 GB) usando i1-Q4_K_M (21,8 GB) para autocompletado y generación de funciones.
- Automatización con tool calling: el linaje Hermes y el tag `tool-calling` permiten integrarlo en agentes que invocan APIs externas, con la ventaja de ejecución local sin dependencia de servicios en la nube.
- Análisis de imágenes en local: con los ficheros mmproj del repositorio estático, puede describir imágenes, extraer texto de capturas o responder preguntas sobre diagramas, útil en flujos de trabajo con datos sensibles que no deben salir del equipo.
- Investigación sobre abliteración y alineación: el modelo sirve como caso de estudio para medir cómo la edición de pesos afecta a la tasa de rechazo, la coherencia y la calidad en benchmarks, comparándolo con el modelo Qwen original.
- Prototipado de agentes multi-paso: la combinación de razonamiento, tool calling y contexto conversacional permite construir pipelines de agentes que planifican y ejecutan tareas encadenadas, con la ventaja de que el modelo corre en hardware propio.
- Despliegue en entornos con requisitos de privacidad: al ser Apache 2.0 y ejecutable con llama.cpp, puede integrarse en productos comerciales sin enviar datos a terceros, siempre que se asuma la responsabilidad legal del contenido generado sin filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~13,3 GB (i1-Q2_K) y ~29,3 GB (i1-Q6_K), más el overhead del contexto y, en su caso, del proyector de visión (mmproj).
- GPU recomendadas: para i1-Q4_K_M (21,8 GB) o i1-Q5_K_M (25,4 GB) se recomienda una RTX 4090 (24 GB) o una A6000 (48 GB); para i1-Q6_K (29,3 GB) se necesita una A100 40 GB, H100 o una configuración multi-GPU.
- Cabe en GPU de consumo: sí, en una RTX 3090/4090 (24 GB) con cuantizaciones i1-Q4_K_S (20,5 GB) o i1-Q4_K_M (21,8 GB); en GPUs de 16 GB solo caben las variantes Q2_K y Q3_K_S/IQ3, con pérdida notable de calidad.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp); el tag `endpoints_compatible` sugiere compatibilidad con endpoints estilo OpenAI. Para el modelo base en bf16 se usaría transformers, vLLM o TGI, pero no se documenta en la model card.
- Latencia y throughput: no disponibles. Al ser un MoE, el throughput depende del número de parámetros activos, dato que no se publica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (i1-GGUF) | 35,5 B (MoE) | no disponible | Sí (mmproj) | Apache 2.0 | GGUF i1 |
| Modelo base `oktaydu/Qwen3.6-35B-v2-MoE-Ablit-Heretic-Uncensor-Hermes-MTP-Vision-FT` | 35,5 B (MoE) | no disponible | Sí | Apache 2.0 | safetensors/bf16 |
| Versión estática `mradermacher/...-GGUF` | 35,5 B (MoE) | no disponible | Sí (mmproj en repo estático) | Apache 2.0 | GGUF estático |

No se dispone de datos de benchmarks ni de especificaciones de contexto para comparar el rendimiento con alternativas de la misma categoría. La comparación se limita a parámetros, licencia y formato de pesos.

## Limitaciones y advertencias

- El modelo está abliterado y sin censura: elimina los mecanismos de rechazo, por lo que puede generar contenido ofensivo, ilegal o dañino sin filtro. No es adecuado para aplicaciones orientadas al público general sin una capa de moderación externa.
- El tag `not-for-all-audiences` indica contenido potencialmente sensible; su uso en productos comerciales exige revisión legal y de cumplimiento.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad factual y la modificación de pesos puede degradar la coherencia respecto al modelo original.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente el límite real.
- La licencia Apache 2.0 del repositorio de cuantización se hereda del modelo base, pero las modificaciones de abliteración pueden plantear dudas sobre la procedencia y los términos aplicables a los pesos derivados.
- El repositorio pesa 279,2 GB en total; descargar todas las variantes no es práctico y conviene seleccionar una sola cuantización.
- Las cuantizaciones de 2-3 bits (Q2_K, Q3_K_S) degradan notablemente la calidad; el propio autor recomienda IQ3_XXS o superiores frente a Q2_K.
- No hay información sobre parámetros activos del MoE, lo que impide estimar con precisión el throughput y el coste de inferencia.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/Qwen3.6-35B-v2-MoE-Ablit-Heretic-Uncensor-Hermes-MTP-Vision-FT-i1-GGUF
- Repositorio de cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.6-35B-v2-MoE-Ablit-Heretic-Uncensor-Hermes-MTP-Vision-FT-GGUF
- Modelo base: https://huggingface.co/oktaydu/Qwen3.6-35B-v2-MoE-Ablit-Heretic-Uncensor-Hermes-MTP-Vision-FT
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-v2-MoE-Ablit-Heretic-Uncensor-Hermes-MTP-Vision-FT-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
