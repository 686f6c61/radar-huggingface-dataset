# mradermacher/Swalow-7b-hf-oasst1-21k-ja-alert-preference-2k-ja-GGUF

## Resumen

Swalow-7b-hf-oasst1-21k-ja-alert-preference-2k-ja-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo shinyaoka/Swalow-7b-hf-oasst1-21k-ja-alert-preference-2k-ja, publicada por mradermacher, un conocido generador de cuantizaciones estáticas para la comunidad. El modelo subyacente es un ajuste fino conversacional de aproximadamente 6.830 millones de parámetros (6,83 B), derivado de una base de 7 B y entrenado sobre los conjuntos oasst1 y un conjunto de preferencias en japonés (alert-preference-2k-ja), según se deduce de su nombre.

Este repositorio no aporta pesos nuevos ni entrenamiento adicional: su valor está en ofrecer el modelo original en múltiples niveles de cuantización (desde Q2_K hasta f16) listos para su uso con llama.cpp y ecosistemas compatibles, lo que permite desplegarlo en hardware muy modesto. Es relevante para quienes quieran ejecutar un modelo conversacional pequeño en local, especialmente en entornos con poca VRAM o en CPU, aunque la información pública sobre el modelo base es muy limitada y la model card del repositorio no documenta arquitectura, contexto ni datos de entrenamiento.

La ficha se basa exclusivamente en los metadatos disponibles en Hugging Face y en la model card del cuantizador; cualquier dato no documentado se indica explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de ~7 B, presumiblemente transformer decoder-only; no confirmado) |
| Parametros totales | 6.829.969.408 (6,83 B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (según metadatos); el nombre del modelo sugiere entrenamiento adicional en japonés (ja), no confirmado en la model card |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base está en formato Hugging Face/transformers |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base en la documentación proporcionada. Por el tamaño (6,83 B de parámetros) y la nomenclatura "7b-hf", se trata presumiblemente de un transformer decoder-only de la familia de 7 B, pero este dato no está confirmado en la model card. Tampoco se documentan la longitud de contexto nativa, la composición exacta del dataset ni el número de tokens de entrenamiento.

El nombre del modelo base indica un ajuste fino conversacional sobre oasst1 (21k) seguido de un entrenamiento con preferencias en japonés (preference-2k-ja), lo que sugiere un pipeline de instrucción más optimización de preferencias (posiblemente DPO o similar), si bien no se especifica el método exacto. El repositorio de mradermacher únicamente contiene cuantizaciones estáticas generadas a partir del modelo original; no se han publicado cuantizaciones ponderadas/imatrix para este modelo en el momento de la consulta.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a instrucciones (el modelo base se entrena sobre oasst1).
- Alineación con preferencias humanas mediante el conjunto preference-2k-ja, presumiblemente para mejorar la calidad de las respuestas en japonés.
- Capacidad multilingüe limitada según metadatos (etiquetado como "en"), con posible soporte de japonés por el nombre del modelo, no verificado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Despliegue local en CPU/GPU mediante llama.cpp y ecosistemas compatibles con GGUF.

## Casos de uso

- Asistente conversacional local en hardware de consumo: con cuantizaciones Q4_K_M (4,2 GB) o Q5_K_M (5,0 GB) el modelo cabe en GPUs de 8 GB o en CPU con RAM suficiente, permitiendo un chatbot privado sin conexión.
- Prototipado rápido de aplicaciones de chat: la disponibilidad de múltiples niveles de cuantización permite ajustar el equilibrio calidad/velocidad durante el desarrollo antes de decidir el despliegue final.
- Evaluación de modelos ajustados en japonés: útil para investigadores que quieran comparar el comportamiento de un fine-tuning sobre oasst1 + preferencias ja frente a otros modelos pequeños, siempre que se validen las capacidades reales del modelo base.
- Despliegue en entornos con recursos restringidos: la variante Q2_K (2,7 GB) permite ejecutar el modelo en dispositivos con 4 GB de RAM/VRAM, a costa de una pérdida notable de calidad.
- Generación de texto offline en estaciones de trabajo sin GPU: mediante llama.cpp en CPU con cuantizaciones Q4/Q5 se obtiene un asistente funcional para tareas de redacción y resumen.
- Fines educativos y de experimentación: el repositorio sirve como ejemplo práctico de cómo se generan y comparan cuantizaciones GGUF de un modelo de 7 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K ~2,7 GB; Q3_K_M ~3,5 GB; IQ4_XS ~3,8 GB; Q4_K_M ~4,2 GB; Q5_K_M ~5,0 GB; Q6_K ~5,7 GB; Q8_0 ~7,4 GB; f16 ~13,8 GB (tamaños de fichero indicados por el autor).
- GPU recomendadas: no documentadas por el autor. Por tamaño, cualquier GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) puede ejecutar cuantizaciones Q4/Q5; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando Q4_K_M o Q5_K_M; las variantes Q2/Q3 caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp y frontends compatibles con GGUF (Ollama, LM Studio, text-generation-webui, koboldcpp). El modelo base también puede servirse con transformers o vLLM, pero el repositorio solo contiene GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swalow-7b-hf-oasst1-21k-ja-alert-preference-2k-ja (este) | 6,83 B | no disponible | no disponible | GGUF | Fine-tuning conversacional con preferencias ja; poca documentación |
| Mistral-7B-Instruct | ~7,2 B | 32k (v0.2) | Apache 2.0 | safetensors, GGUF | Referencia ampliamente documentada y con ecosistema maduro |
| Llama-3.1-8B-Instruct | ~8 B | 128k | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto y benchmarks públicos; licencia con restricciones |
| Qwen2.5-7B-Instruct | ~7,6 B | 32k (128k en algunas variantes) | Apache 2.0 (mayoría de variantes) | safetensors, GGUF | Fuerte soporte multilingüe, incluido japonés |

La comparación se basa en características generales de modelos de la misma categoría; no hay datos de rendimiento del modelo Swalow para contrastar.

## Limitaciones y advertencias

- La model card del repositorio no documenta arquitectura, contexto, licencia ni datos de entrenamiento; la información disponible es insuficiente para garantizar un uso en producción sin validación previa.
- Licencia no disponible: no puede confirmarse si se permite uso comercial; conviene consultar el repositorio del modelo base (shinyaoka/Swalow-7b-hf-oasst1-21k-ja-alert-preference-2k-ja) antes de usarlo.
- Riesgo de alucinación inherente a modelos pequeños de 7 B, agravado en cuantizaciones de baja precisión (Q2_K, Q3_K_S).
- Idiomas: los metadatos indican "en"; el soporte real de japonés no está verificado y el rendimiento en castellano es incierto.
- Las cuantizaciones IQ/imatrix ponderadas no están disponibles según el autor, lo que puede suponer una ligera pérdida de calidad frente a cuantizaciones ponderadas de otros repositorios.
- Modelo con muy pocas descargas (14) y sin likes: no hay evidencia comunitaria de su calidad o estabilidad.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse su disponibilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Swalow-7b-hf-oasst1-21k-ja-alert-preference-2k-ja-GGUF
- Modelo base: https://huggingface.co/shinyaoka/Swalow-7b-hf-oasst1-21k-ja-alert-preference-2k-ja
- Página de descargas del cuantizador: https://hf.tst.eu/model#Swalow-7b-hf-oasst1-21k-ja-alert-preference-2k-ja-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
