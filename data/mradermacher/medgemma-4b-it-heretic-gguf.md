# mradermacher/medgemma-4b-it-heretic-GGUF

## Resumen

`mradermacher/medgemma-4b-it-heretic-GGUF` es una colección de cuantizaciones GGUF estáticas del modelo `parziva1/medgemma-4b-it-heretic`, una variante "abliterated" o "decensored" del modelo médico MedGemma 4B de Google, orientada a dominios clínicos como radiología, dermatología, patología y oftalmología. El modelo original parte de la familia Gemma y ha sido ajustado para tareas de razonamiento clínico y análisis de imágenes médicas como radiografías de tórax. Esta versión concreta elimina los mecanismos de rechazo del modelo base, lo que permite respuestas sin filtros de seguridad en contextos médicos.

El repositorio lo publica mradermacher, un conocido cuantizador de la comunidad que genera versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles. Incluye cuantizaciones desde Q2_K hasta f16, además de los ficheros `mmproj` necesarios para el procesamiento multimodal (visión), lo que permite ejecutar el modelo en hardware de consumo.

Con 3.880 millones de parámetros y un tamaño de repositorio de 37,3 GB (sumando todas las cuantizaciones), este modelo resulta relevante para desarrolladores que necesitan desplegar un modelo médico multimodal en local, sin depender de APIs externas, y que requieren control total sobre las respuestas generadas en entornos de investigación o prototipado clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma/MedGemma), no disponible el detalle exacto |
| Parametros totales | 3.880.263.168 (3,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | health-ai-developer-foundations (otros términos, ver enlace) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es MedGemma 4B IT, un transformer derivado de la familia Gemma de Google, ajustado para el dominio médico con capacidades multimodales (procesamiento de imágenes médicas y texto). La variante `heretic` ha sido sometida a un proceso de "abliteration" o "decensoring", una técnica que modifica los pesos para eliminar la dirección de rechazo aprendida durante el alineamiento, de modo que el modelo deja de negarse a responder ante determinadas peticiones. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en esta variante concreta.

La cuantización la realiza mradermacher con su pipeline habitual (convert_type hf, quantize_version 2, output_tensor_quantised 1), generando cuantizaciones estáticas sin imatrix en este repositorio; las versiones con imatrix (i1) están disponibles en un repositorio separado. Se incluyen ficheros `mmproj` en Q8_0 y f16 para preservar la torre de visión al ejecutar en llama.cpp.

## Capacidades

- Generación de texto y razonamiento clínico en inglés.
- Procesamiento de imágenes médicas: radiología (radiografías de tórax), dermatología, patología y oftalmología.
- Análisis multimodal imagen-texto mediante los ficheros `mmproj`.
- Conversación multi-turno (tag `conversational`).
- Respuestas sin filtros de rechazo (comportamiento "uncensored"/"abliterated"), lo que permite abordar consultas que el modelo base rechazaría.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se ha documentado soporte explícito de tool calling, function calling ni modo "thinking".

## Casos de uso

- Investigación en seguridad de modelos médicos: comparar las respuestas del modelo "heretic" frente al MedGemma original para estudiar cómo el abliteration afecta a la calidad y seguridad de las respuestas clínicas.
- Prototipado de asistentes clínicos en local: desplegar el modelo con llama.cpp u Ollama en una estación de trabajo para generar borradores de informes radiológicos a partir de radiografías de tórax, sin enviar datos de pacientes a servicios externos.
- Educación médica: generar explicaciones detalladas de hallazgos en imágenes dermatológicas o patológicas para material docente, aprovechando que el modelo no bloquea descripciones explícitas.
- Análisis de imágenes en entornos con requisitos de privacidad: al ejecutarse en hardware propio con cuantizaciones Q4_K_M (2,6 GB), permite procesar imágenes médicas sin conexión a internet.
- Evaluación de cuantizaciones: usar las distintas versiones (Q2_K a f16) para medir el impacto de la cuantización en tareas de razonamiento clínico y visión médica.
- Generación de descripciones oftalmológicas o dermatológicas en pipelines de investigación: integrar el modelo vía API compatible con OpenAI (endpoints_compatible) en flujos de anotación asistida.
- Desarrollo de aplicaciones de triaje preliminar: como componente de un sistema que clasifica imágenes médicas y genera texto explicativo, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,8 GB
  - Q4_K_M: ~2,6 GB
  - Q5_K_M: ~2,9 GB
  - Q6_K: ~3,3 GB
  - Q8_0: ~4,2 GB
  - f16: ~7,9 GB
  - Añadir ~0,7 GB (mmproj Q8_0) o ~1,0 GB (mmproj f16) si se usa la torre de visión.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) puede ejecutar las cuantizaciones Q4–Q8 con margen para contexto. Para f16 se recomienda 12 GB o más. En servidor, A100 o H100 no son necesarias dado el tamaño; una L4 o T4 es suficiente.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6–8 GB usando Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con endpoints OpenAI; también puede usarse el modelo base en transformers con safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medgemma-4b-it-heretic (este, GGUF) | 3,88 B | no disponible | Sí (mmproj) | health-ai-developer-foundations | Hugging Face (GGUF) |
| parziva1/medgemma-4b-it-heretic (base) | 3,88 B | no disponible | Sí | health-ai-developer-foundations | Hugging Face (safetensors) |
| MedGemma 4B IT original (Google) | 3,88 B | no disponible | Sí | health-ai-developer-foundations | Hugging Face |
| mradermacher/medgemma-4b-it-heretic-i1-GGUF | 3,88 B | no disponible | Sí | health-ai-developer-foundations | Hugging Face (GGUF imatrix) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration puede degradar la calidad del razonamiento clínico y aumentar la probabilidad de respuestas inseguras o incorrectas en contextos médicos; no debe usarse como sistema de diagnóstico sin validación exhaustiva.
- Riesgo elevado de alucinación en contenido médico: el modelo puede generar hallazgos, diagnósticos o tratamientos plausibles pero falsos.
- Solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- La licencia `health-ai-developer-foundations` impone términos específicos de Google para uso en salud; es imprescindible revisar el enlace de licencia antes de cualquier uso comercial o clínico.
- El modelo no está destinado a uso clínico directo ni a toma de decisiones médicas; requiere supervisión de profesionales sanitarios.
- La ausencia de filtros de seguridad implica que puede producir contenido sensible; deben implementarse salvaguardas externas en producción.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita la planificación de aplicaciones con documentos largos.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente el rendimiento en tareas de visión y razonamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/medgemma-4b-it-heretic-GGUF
- Modelo base (parziva1): https://huggingface.co/parziva1/medgemma-4b-it-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/medgemma-4b-it-heretic-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#medgemma-4b-it-heretic-GGUF
- Licencia Health AI Developer Foundations: https://developers.google.com/health-ai-developer-foundations/terms
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
