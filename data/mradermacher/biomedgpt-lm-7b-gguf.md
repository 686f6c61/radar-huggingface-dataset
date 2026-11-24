# mradermacher/BioMedGPT-LM-7B-GGUF

## Resumen

BioMedGPT-LM-7B-GGUF es una cuantización estática en formato GGUF del modelo BioMedGPT-LM-7B, un modelo de lenguaje especializado en dominio biomédico desarrollado originalmente por el usuario gmxn. La versión aquí descrita ha sido generada por mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp, y su función principal es facilitar la inferencia local del modelo base en hardware de consumo mediante la reducción del tamaño de los pesos.

El modelo cuenta con 6.738.415.616 parámetros totales (aproximadamente 6,7 mil millones), lo que lo sitúa en la categoría de modelos de 7B. Está entrenado sobre el dataset `biomed` y etiquetado como modelo médico, con soporte exclusivo para el idioma inglés. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución propias de dicha licencia.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de dominio médico en entornos con recursos limitados: las cuantizaciones van desde 2,6 GB (Q2_K) hasta 13,6 GB (f16), lo que permite ejecutarlo en GPUs de consumo e incluso en CPU. No obstante, la información pública disponible sobre arquitectura, entrenamiento y benchmarks es muy escasa, por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de 7B, sin confirmar detalles) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base gmxn/BioMedGPT-LM-7B en la información proporcionada. Por el número de parámetros (6.738.415.616) y la nomenclatura "LM-7B", se trata de un modelo de lenguaje de aproximadamente 7 mil millones de parámetros, presumiblemente basado en una arquitectura transformer decoder-only, pero no se confirma en la documentación disponible. Tampoco se especifican el número de capas, dimensiones ocultas, número de cabezas de atención ni la longitud máxima de contexto.

En cuanto al entrenamiento, la model card únicamente indica que se utilizó el dataset `biomed`, sin detallar el número de tokens, la composición del corpus, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. La presente versión es una cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) generada con llama.cpp; el autor indica que no hay cuantizaciones con imatrix disponibles en el momento de la publicación.

## Capacidades

- Generación de texto en inglés con especialización declarada en dominio biomédico y médico.
- Respuesta a preguntas y explicación de conceptos médicos, presumiblemente orientada a terminología clínica y biomédica.
- Procesamiento de lenguaje natural general en inglés (el modelo base es un LM, no un modelo multimodal).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras capacidades especiales.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Asistencia en documentación clínica: el modelo puede redactar borradores de informes o resúmenes de historiales en inglés, aprovechando su ajuste sobre corpus biomédico para manejar terminología especializada.
- Búsqueda semántica y respuesta a preguntas sobre literatura biomédica: puede emplearse como generador de respuestas en un pipeline RAG que recupere fragmentos de artículos y los sintetice en inglés.
- Educación médica: generación de explicaciones y material de estudio sobre conceptos de anatomía, farmacología o patología para estudiantes angloparlantes.
- Preprocesamiento y normalización de textos clínicos: extracción de entidades y reformulación de notas médicas en entornos de investigación, siempre con revisión humana.
- Prototipado local en investigación: gracias a las cuantizaciones de 2,6 a 4,9 GB, permite experimentar con un modelo de dominio médico en una estación de trabajo sin GPU de datacenter.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse localmente con llama.cpp u Ollama, los datos clínicos no abandonan la infraestructura del investigador, lo que facilita el cumplimiento de normativas de protección de datos.
- Filtrado y clasificación de textos biomédicos: uso como componente generativo en tareas de etiquetado o resumen de abstracts en inglés dentro de pipelines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~2,6 GB; Q3_K_S ~3,0 GB; Q3_K_M ~3,4 GB; Q3_K_L ~3,7 GB; IQ4_XS ~3,7 GB; Q4_K_S ~4,0 GB; Q4_K_M ~4,2 GB; Q5_K_S ~4,8 GB; Q5_K_M ~4,9 GB; Q6_K ~5,6 GB; Q8_0 ~7,3 GB; f16 ~13,6 GB. A estas cifras hay que sumar el overhead de contexto y de la caché KV.
- GPU recomendadas: para cuantizaciones Q4/Q5 basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB; para Q8_0 se recomienda una RTX 4070 Ti Super, RTX 4080 o RTX 4090; para f16, una RTX 4090 (24 GB) o GPUs de datacenter como A100 o H100.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 con GPUs de 8-12 GB o superiores; f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el repositorio está etiquetado como `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BioMedGPT-LM-7B-GGUF (este) | 6,74B | no disponible | Apache 2.0 | GGUF | Cuantización estática de un LM médico en inglés |
| BioMedGPT-LM-7B (base) | 6,74B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Alternativas médicas de 7B (p. ej., PMC-LLaMA, Meditron) | ~7B | variable | variable | safetensors/GGUF | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa fiable con modelos alternativos; los datos de rendimiento, contexto y benchmarks de los competidores no están incluidos en la documentación consultada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- No es un dispositivo médico: cualquier uso en contextos clínicos requiere supervisión profesional y no debe sustituir el juicio de un especialista.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en dominio médico, donde una respuesta incorrecta puede tener consecuencias graves.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre corpus biomédico en inglés puede heredar sesgos de la literatura científica disponible.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_M) degradan la calidad; el autor recomienda Q4_K_S o Q4_K_M para un equilibrio entre tamaño y fidelidad.
- No hay cuantizaciones con imatrix disponibles, lo que puede reducir la calidad frente a alternativas ponderadas.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue en producción exige validación propia y evaluación de riesgos regulatorios (por ejemplo, normativa de productos sanitarios o protección de datos).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso o validación.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/BioMedGPT-LM-7B-GGUF
- Modelo base: https://huggingface.co/gmxn/BioMedGPT-LM-7B
- Página de descargas del autor: https://hf.tst.eu/model#BioMedGPT-LM-7B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
