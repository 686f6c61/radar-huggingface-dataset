# mradermacher/Llama-2-7b-chat-CNN-chatbot-GGUF

## Resumen

Llama-2-7b-chat-CNN-chatbot-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo `usamaatta/Llama-2-7b-chat-CNN-chatbot`, publicada por el usuario mradermacher. El modelo base es un ajuste fino de Llama-2-7b-chat, el conocido modelo conversacional de Meta AI de 7 mil millones de parámetros, aparentemente especializado en el dominio de noticias y contenido de CNN. Esta versión GGUF no introduce cambios arquitectónicos ni de entrenamiento: se limita a ofrecer los pesos originales en distintos niveles de cuantización para facilitar su despliegue en hardware modesto mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha es principalmente práctica: permite ejecutar un modelo conversacional de 7B en GPUs de consumo, CPUs y entornos con recursos limitados, con un rango de cuantizaciones que va desde los 2,6 GB del Q2_K hasta los 13,6 GB del f16. El repositorio ocupa 59,6 GB en total y acumula 105 descargas, lo que refleja un uso minoritario pero real. Al estar basado en Llama-2-7b-chat, hereda la arquitectura transformer decoder-only, la ventana de contexto de 4.096 tokens y las limitaciones de la licencia Llama 2 original.

Es importante subrayar que esta ficha documenta la versión cuantizada, no el modelo base. La información disponible sobre el ajuste fino original (composición del dataset, proceso de entrenamiento, evaluación) es muy escasa, y no se han publicado benchmarks en la información proporcionada. Por tanto, las capacidades descritas deben entenderse como heredadas de Llama-2-7b-chat, con la salvedad de que el ajuste fino específico sobre contenido de CNN puede haber alterado su comportamiento en dominios generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama-2-7b-chat) |
| Parametros totales | 6.738.415.616 (aproximadamente 6,74 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat soporta 4.096 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible (el modelo base Llama 2 tiene licencia Llama 2 Community License) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención causal estándar. El modelo base fue entrenado por Meta AI sobre aproximadamente 2 billones de tokens y posteriormente alineado mediante RLHF para uso conversacional. El ajuste fino `usamaatta/Llama-2-7b-chat-CNN-chatbot` parte de ese checkpoint y lo especializa, presumiblemente, sobre datos relacionados con noticias o contenido de CNN, aunque la model card no detalla el dataset, el número de tokens de ajuste ni la metodología empleada.

Esta versión GGUF no modifica la arquitectura ni el entrenamiento: mradermacher aplica cuantizaciones estáticas (sin imatrix ni quants ponderados, según indica la propia model card) sobre los pesos del modelo base. La conversión se realiza con el formato GGUF de llama.cpp y se ofrecen 12 variantes de cuantización. No hay innovaciones técnicas destacables en esta publicación más allá del propio proceso de cuantización estándar; no se emplean decodificación especulativa, atención lineal ni técnicas híbridas.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-2-7b-chat.
- Razonamiento básico y respuesta a instrucciones en inglés.
- Generación de código y resolución de problemas matemáticos sencillos, con limitaciones propias de un modelo de 7B.
- Especialización temática aparente en contenido de noticias y dominio CNN (según el nombre del ajuste fino), aunque no se documenta formalmente.
- Soporte de chat mediante plantilla conversacional de Llama 2 (etiquetas `[INST]` y `<<SYS>>`).
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Despliegue de un chatbot conversacional en local: con la cuantización Q4_K_M (4,2 GB) el modelo cabe en GPUs de consumo de 6-8 GB de VRAM y permite mantener conversaciones multi-turno en inglés sin depender de servicios en la nube.
- Prototipado rápido de asistentes temáticos sobre noticias: el ajuste fino sobre contenido de CNN puede emplearse para experimentar con respuestas contextualizadas en ese dominio, siempre validando la calidad real antes de producción.
- Pruebas de integración con llama.cpp y Ollama: el formato GGUF y la etiqueta `endpoints_compatible` facilitan montar un endpoint local compatible con la API de OpenAI para pruebas de integración.
- Educación e investigación sobre cuantización: el repositorio ofrece 12 variantes del mismo modelo, lo que permite comparar calidad, tamaño y velocidad entre Q2_K, Q4_K_M, Q8_0 y f16 en un mismo hardware.
- Generación de texto asistida en entornos sin GPU: las variantes Q2_K (2,6 GB) y Q3_K_S (3,0 GB) pueden ejecutarse en CPU con RAM suficiente, útil para demostraciones o entornos aislados.
- Filtrado y resumen de titulares o textos periodísticos en inglés: el modelo puede emplearse como componente de un pipeline de preprocesado lingüístico, con revisión humana obligatoria por el riesgo de alucinación.
- Base para ajustes finos posteriores: al ser un modelo de 7B en GGUF, sirve como punto de partida para experimentos de LoRA o QLoRA en hardware modesto, aunque la licencia debe verificarse antes de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño del archivo GGUF y overhead de contexto):
  - Q2_K: ~3 GB
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ4_XS: ~3,5-4,5 GB
  - Q4_K_S / Q4_K_M: ~4,5-5 GB
  - Q5_K_S / Q5_K_M: ~5,5-6 GB
  - Q6_K: ~6,5 GB
  - Q8_0: ~8 GB
  - f16: ~14 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para las variantes Q8_0 y f16; RTX 3060 8 GB, RTX 4060 o RTX 3070 para Q4_K_M y Q5_K_M; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB (Q4_K_S) hasta una RTX 4090 (f16). Las variantes Q2_K y Q3_K_S también pueden ejecutarse en CPU con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-2-7b-chat-CNN-chatbot-GGUF (este) | 6,74B | no disponible (base: 4.096) | no disponible | GGUF | Ajuste fino temático sobre Llama-2-7b-chat, 12 cuantizaciones |
| Llama-2-7b-chat (Meta AI) | 6,74B | 4.096 | Llama 2 Community License | safetensors, GGUF (TheBloke) | Modelo base conversacional, ampliamente desplegado y evaluado |
| Mistral-7B-Instruct-v0.2 | 7,24B | 32.768 | Apache 2.0 | safetensors, GGUF | Contexto mucho mayor y licencia permisiva; alternativa habitual a Llama-2-7B |
| Zephyr-7B-beta | 7,24B | 32.768 | MIT | safetensors, GGUF | Ajuste fino con DPO sobre Mistral, orientado a instrucciones |

La comparativa se limita a modelos de la misma categoría (7B conversacionales). No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación se centra en parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de Llama-2-7b-chat y los del corpus de ajuste fino, no documentados. Puede reproducir estereotipos presentes en datos de noticias.
- Riesgo de alucinación: alto en un modelo de 7B, especialmente en tareas factuales o de razonamiento complejo. El ajuste fino temático no corrige esta limitación.
- Limitaciones de contexto: la ventana efectiva es la del modelo base (4.096 tokens en Llama-2-7b-chat); no se documenta una ampliación en el ajuste fino.
- Limitaciones de idioma: el repositorio declara únicamente inglés. El rendimiento en castellano será deficiente y no debe asumirse.
- Restricciones de licencia: la licencia de esta versión GGUF figura como "no disponible". El modelo base Llama 2 se rige por la Llama 2 Community License, que impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable). Es imprescindible verificar la licencia del ajuste fino original antes de cualquier despliegue comercial.
- Caveat de producción: las cuantizaciones Q2_K y Q3_K degradan notablemente la calidad; la propia model card recomienda Q4_K_S o Q4_K_M para uso general. Los cuants ponderados (imatrix) no están disponibles según el autor.
- Falta de documentación: no hay model card detallada del ajuste fino original, ni benchmarks, ni descripción del dataset. La reproducibilidad y la evaluación rigurosa no son posibles con la información disponible.
- Fecha de creación y actualización: el repositorio se creó el 11 de marzo de 2025 y se actualizó el 26 de noviembre de 2026; conviene comprobar si el modelo base ha sido retirado o modificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-2-7b-chat-CNN-chatbot-GGUF
- Modelo base (ajuste fino original): https://huggingface.co/usamaatta/Llama-2-7b-chat-CNN-chatbot
- Página de descargas del autor: https://hf.tst.eu/model#Llama-2-7b-chat-CNN-chatbot-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Llama 2 (Meta AI): https://ai.meta.com/llama/
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com/
