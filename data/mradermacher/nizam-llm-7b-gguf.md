# mradermacher/Nizam-LLM-7B-GGUF

## Resumen

Nizam-LLM-7B-GGUF es la distribución en formato GGUF del modelo Nizam-LLM-7B, un modelo de lenguaje de 7.000.559.616 parámetros (~7B) especializado en derecho laboral saudí y orientado a tareas de recuperación aumentada (RAG) y citación de normativa. El modelo original lo desarrolla muhammaduxair; esta versión la publica mradermacher, un conocido cuantizador de la comunidad que distribuye pesos estáticos listos para inferencia local con llama.cpp y derivados.

El interés de esta ficha no está en un modelo generalista nuevo, sino en un artefacto de despliegue: convierte un modelo base de 14,1 GB en FP16 en una familia de cuantizaciones que van de 2,8 GB (Q2_K) a 7,5 GB (Q8_0), lo que permite ejecutar un asistente jurídico en árabe sobre GPU de consumo o incluso CPU. El repositorio completo ocupa 62,2 GB porque incluye todos los niveles de cuantización en un solo paquete.

La información pública disponible es escasa: la model card del cuantizador es una plantilla genérica de mradermacher y no detalla arquitectura interna, longitud de contexto, composición del corpus de entrenamiento ni resultados de evaluación. Cualquier cifra de rendimiento o de ventana de contexto debe obtenerse del repositorio del modelo base, no de este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (según `library_name: transformers`; la información disponible no detalla variantes MoE, SSM o híbridas) |
| Parametros totales | 7.000.559.616 (~7B) |
| Parametros activos | No procede / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 (estáticas); variantes con imatrix disponibles en el repo `i1-GGUF` |
| Idiomas soportados | Árabe (`ar`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos individuales por cuantización; el repo también contiene el original en safetensors vía el modelo base) |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo base más allá de su encuadre como modelo de transformers de ~7B parámetros. Los tags del repositorio (`legal`, `saudi-arabia`, `labor-law`, `arabic`, `rag`, `citation`) indican una especialización vertical en derecho laboral de Arabia Saudí, con énfasis en la generación de respuestas con citas verificables, un patrón típico de los modelos ajustados para RAG jurídico. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado.

Lo que sí está documentado con precisión es el proceso de cuantización: mradermacher genera cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`, conversión `hf`) a partir del checkpoint original, y publica además una segunda familia con pesos ponderados por matriz de importancia (imatrix) en `mradermacher/Nizam-LLM-7B-i1-GGUF`. No hay innovaciones de decodificación especulativa, atención lineal ni modos de razonamiento extendido documentados.

## Capacidades

- Generación de texto en árabe orientada a dominio jurídico-laboral saudí.
- Respuestas con citación de normativa, según el tag `citation` de la model card (sin ejemplos verificables publicados).
- Soporte declarado para flujos de recuperación aumentada (RAG): el modelo está etiquetado explícitamente para integrarse en pipelines de recuperación + generación.
- Conversacional multi-turno (`conversational` en los tags del repo).
- Compatible con endpoints (`endpoints_compatible`), es decir, desplegable tras una API compatible con el ecosistema de HuggingFace.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente, multi-step reasoning, visión, audio o thinking mode: no disponibles en la información proporcionada.
- Multilingüismo: limitado al árabe según la metadata; no se declara soporte de otros idiomas.

## Casos de uso

- Asistencia jurídica interna en empresas con plantilla en Arabia Saudí: el modelo puede responder consultas sobre contratos, vacaciones, indemnizaciones y terminación laboral en árabe, con la ventaja de que un 7B cuantizado a Q4_K_M (4,4 GB) se despliega en una GPU de 8-12 GB dentro de la infraestructura de la propia empresa, sin enviar datos de empleados a terceros.
- RAG sobre el texto consolidado de la legislación laboral saudí: el modelo está etiquetado para `rag`, por lo que se usaría como generador final de un pipeline en el que un recuperador (embeddings + búsqueda vectorial) selecciona artículos relevantes y el modelo redacta la respuesta citando el artículo concreto.
- Redacción y revisión de contratos y políticas internas: generación de borradores de cláusulas en árabe y comprobación de que el texto propuesto no contradice la normativa recuperada, con revisión humana posterior obligatoria.
- Clasificación y triaje de consultas de empleados: uso del modelo para categorizar tickets de RR. HH. (permisos, salarios, disputas, finiquitos) y derivarlos al equipo adecuado, aprovechando su conocimiento del vocabulario jurídico árabe.
- Despliegue en entorno air-gapped: al distribuirse en GGUF y con licencia Apache 2.0, puede ejecutarse con llama.cpp u Ollama en máquinas sin conexión, requisito habitual en despachos y organismos públicos que manejan expedientes laborales.
- Prototipado rápido y evaluación de viabilidad: un investigador puede descargar la variante Q4_K_S (4,1 GB) y evaluar en una sola GPU de consumo si el ajuste al dominio jurídico árabe es suficiente antes de invertir en el modelo completo en FP16 o en un modelo mayor.
- Generación de material formativo: resúmenes y preguntas frecuentes sobre obligaciones laborales para onboarding de empleados, siempre con validación por un jurista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Ni la model card del cuantizador ni la metadata del repositorio incluyen evaluaciones de MMLU, HumanEval, GSM8K ni métricas específicas de dominio jurídico árabe. Tampoco se documentan comparaciones con el modelo base en FP16 que permitan cuantificar la degradación introducida por cada nivel de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir del tamaño de archivo, con overhead de contexto aproximado de 1-2 GB):
  - F16 (14,1 GB): ~16 GB de VRAM.
  - Q8_0 (7,5 GB): ~9 GB de VRAM.
  - Q6_K (5,8 GB): ~7,5 GB de VRAM.
  - Q5_K_M (5,1 GB): ~7 GB de VRAM.
  - Q4_K_M (4,4 GB) / Q4_K_S (4,1 GB): ~6 GB de VRAM.
  - Q3_K_M (3,6 GB) / IQ4_XS (3,9 GB): ~5-6 GB de VRAM.
  - Q2_K (2,8 GB): ~4 GB de VRAM, con degradación de calidad notable.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para F16 y Q8_0; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores para Q4/Q5; RTX 3090/4090 para servir varias peticiones concurrentes.
- Cabe en GPU de consumo: sí. Cualquier GPU con 8 GB o más ejecuta Q4_K_M con contexto moderado; con 12 GB se puede usar Q5_K_M o Q6_K. Las variantes Q2_K y Q3_K también son viables en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidor `llama-server` con API compatible con OpenAI. El soporte de GGUF en vLLM y TGI existe pero es más limitado y con menor rendimiento que el de pesos safetensors; para producción de alta concurrencia conviene valorar el modelo base en safetensors con vLLM.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| mradermacher/Nizam-LLM-7B-GGUF (esta ficha) | 7,0B | No disponible | GGUF (12 cuantizaciones) | Apache 2.0 | No disponible |
| muhammaduxair/Nizam-LLM-7B (base) | 7,0B | No disponible | Safetensors | Apache 2.0 | No disponible |
| mradermacher/Nizam-LLM-7B-i1-GGUF | 7,0B | No disponible | GGUF con imatrix | Apache 2.0 | No disponible |
| Otras familias densas de ~7-8B (Qwen2.5-7B, Llama 3.1 8B, Mistral-7B) | 7-8B | No disponible en esta búsqueda | Safetensors/GGUF | Apache 2.0 / licencias comunitarias | No disponible |

La información proporcionada no incluye benchmarks que permitan una comparación cuantitativa con alternativas. La comparación relevante aquí es de despliegue: frente a otras alternativas generalistas, este modelo solo tiene sentido si el dominio es derecho laboral saudí en árabe, ya que no se declara soporte multilingüe ni capacidades generales evaluadas.

## Limitaciones y advertencias

- Idiomas: la metadata declara únicamente árabe (`ar`); no hay evidencia de competencia en inglés, castellano ni otros idiomas.
- Dominio estrecho: el ajuste está orientado a derecho laboral de Arabia Saudí; fuera de ese ámbito el comportamiento no está documentado y es probable que sea deficiente.
- Riesgo de alucinación jurídica: un modelo de 7B especializado en citación puede inventar números de artículo o redactar citas plausibles pero incorrectas. Cualquier salida debe validarse contra el texto legal consolidado antes de usarse.
- Ausencia total de benchmarks: no hay métricas publicadas que permitan estimar la precisión de las citas ni la calidad de las respuestas.
- Sin datos de entrenamiento: se desconoce la composición del corpus, la fecha de corte normativa (crítico en legislación, que cambia) y si se aplicaron filtros de seguridad o alineación.
- Licencia Apache 2.0: permite uso comercial y modificación sin restricciones adicionales, pero el usuario asume toda la responsabilidad sobre el uso jurídico del resultado. No se indica ninguna cláusula de exención de responsabilidad adicional más allá de la licencia.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad de forma apreciable; para uso jurídico se recomienda Q5_K_M o superior, o el modelo base en FP16.
- Sesgos: no documentados. Al estar entrenado sobre normativa de un país concreto, puede reproducir sesgos del corpus legal y del material de entrenamiento, no evaluados por el autor.
- Estado del repositorio: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- La búsqueda web realizada no devolvió ninguna fuente relacionada con el modelo (los resultados obtenidos eran contenido no relacionado); toda la información de esta ficha procede exclusivamente de la metadata y la model card de HuggingFace.

## Enlaces

- Repositorio GGUF (esta versión): https://huggingface.co/mradermacher/Nizam-LLM-7B-GGUF
- Modelo base: https://huggingface.co/muhammaduxair/Nizam-LLM-7B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Nizam-LLM-7B-i1-GGUF
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Nizam-LLM-7B-GGUF
- Peticiones de cuantización / FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, blog o demo oficial del modelo: no disponible en la información proporcionada.
