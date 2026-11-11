# mradermacher/medgemma-27b-text-it-GGUF

## Resumen

MedGemma 27B Text IT es un modelo de lenguaje especializado en dominio médico y razonamiento clínico, desarrollado originalmente por Google bajo la familia Health AI Developer Foundations y distribuido con acceso restringido mediante aceptación de licencia. Esta ficha describe la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos originales en bfloat16.

El modelo cuenta con 27.009.002.240 parámetros (aproximadamente 27.000 millones), está entrenado únicamente en inglés y está orientado a tareas de razonamiento clínico, con soporte de modo "thinking" según las etiquetas del repositorio. La ventana de contexto, la composición del dataset de entrenamiento y los detalles de alineación no están especificados en la información disponible.

Su relevancia actual radica en que democratiza el acceso a un modelo médico de gran tamaño mediante cuantizaciones que van desde 10,6 GB (Q2_K) hasta 28,8 GB (Q8_0), lo que permite desplegarlo en estaciones de trabajo con GPU consumer de gama alta o incluso en configuraciones con memoria unificada. La licencia Health AI Developer Foundations impone condiciones específicas de uso que deben revisarse antes de cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no especificados) |
| Parámetros totales | 27.009.002.240 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | health-ai-developer-foundations (acceso restringido, requiere aceptación de términos) |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base google/medgemma-27b-text-it más allá de que se distribuye a través de la librería transformers y que pertenece a la familia MedGemma de Google. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas como decodificación especulativa o mecanismos de atención lineal.

Lo que sí se desprende de las etiquetas del repositorio es la presencia de un modo "thinking" (razonamiento explícito antes de la respuesta) y una orientación declarada a clinical-reasoning. Esta versión GGUF es una cuantización estática del modelo original; el autor ofrece además cuantizaciones ponderadas/imatrix en un repositorio separado (medgemma-27b-text-it-i1-GGUF), que suelen ofrecer mejor relación calidad/tamaño que las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional en inglés con orientación a dominio médico y clínico.
- Razonamiento clínico: el modelo está etiquetado explícitamente para clinical-reasoning, lo que sugiere entrenamiento o ajuste orientado a interpretar información médica y elaborar razonamientos diagnósticos o explicativos.
- Modo thinking: la etiqueta "thinking" indica soporte de razonamiento explícito paso a paso antes de emitir la respuesta final.
- Conversación multi-turno: el repositorio está marcado como conversational y compatible con endpoints.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multimodales en la información disponible.
- Capacidades multilingües: limitadas al inglés según el campo language del repositorio.

## Casos de uso

- Asistencia a la documentación clínica: el modelo puede redactar y estructurar notas clínicas, resúmenes de historiales o informes a partir de texto en inglés, aprovechando su ajuste específico al dominio médico para mantener terminología y formato adecuados.
- Apoyo al razonamiento diagnóstico en entornos de investigación: con el modo thinking activado, puede generar cadenas de razonamiento clínico que sirvan como material de estudio o para validación por parte de profesionales, nunca como sustituto del juicio médico.
- Educación médica y simulación de casos: generación de explicaciones razonadas sobre fisiopatología, interpretación de pruebas o discusión de diagnósticos diferenciales en inglés, útil en plataformas de formación.
- Procesamiento por lotes de literatura biomédica: extracción de información y resumen de artículos o guías clínicas en inglés, desplegando la cuantización Q4_K_M (16,6 GB) en una GPU de 24 GB para throughput razonable.
- Despliegue local en entornos con requisitos de privacidad: al ejecutarse con llama.cpp u Ollama sobre hardware propio, los datos clínicos no salen de la infraestructura del investigador, lo que facilita el cumplimiento de políticas internas de protección de datos.
- Prototipado de asistentes clínicos en inglés: integración vía API compatible con OpenAI (endpoints_compatible) para construir demos de triaje conversacional o preguntas frecuentes médicas, con la cuantización Q5_K_M (19,4 GB) como equilibrio entre calidad y huella de memoria.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece once variantes, lo que permite medir el impacto de la cuantización en tareas clínicas concretas antes de fijar una versión para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, más overhead de contexto y KV cache):
  - Q2_K: ~10,6 GB de pesos; ~12-13 GB en ejecución.
  - Q3_K_M: ~13,5 GB de pesos; ~15-16 GB en ejecución.
  - Q4_K_M: ~16,6 GB de pesos; ~18-20 GB en ejecución.
  - Q5_K_M: ~19,4 GB de pesos; ~21-23 GB en ejecución.
  - Q6_K: ~22,3 GB de pesos; ~24-26 GB en ejecución.
  - Q8_0: ~28,8 GB de pesos; ~31-33 GB en ejecución.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 con contexto largo y concurrencia; RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; RTX 3090 (24 GB) para Q4_K_M; GPUs de 16 GB solo admiten Q2_K o Q3_K_S con contexto reducido.
- ¿Cabe en GPU consumer? Sí: Q4_K_M y Q5_K_M caben en RTX 4090/3090 de 24 GB; Q2_K y Q3_K_S caben en GPUs de 12-16 GB. También es viable la ejecución parcial en CPU con offload de capas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (el repositorio está marcado como endpoints_compatible). vLLM y TGI no consumen GGUF de forma nativa; para esos motores habría que usar los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| medgemma-27b-text-it-GGUF (esta ficha) | 27,0 B | no disponible | en | health-ai-developer-foundations (restringida) | GGUF |
| google/medgemma-27b-text-it (base) | 27,0 B | no disponible | en | health-ai-developer-foundations (restringida) | safetensors |
| mradermacher/medgemma-27b-text-it-i1-GGUF | 27,0 B | no disponible | en | health-ai-developer-foundations (restringida) | GGUF (imatrix) |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de otros desarrolladores. Las dos alternativas listadas son variantes del mismo modelo base y no modelos independientes.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente con datos en inglés, es previsible un sesgo cultural y lingüístico hacia poblaciones angloparlantes, aunque no se cuantifica.
- Riesgo de alucinación: elevado en dominio médico por la naturaleza del modelo; cualquier salida debe ser revisada por profesionales sanitarios. No se han publicado evaluaciones de fiabilidad clínica en esta ficha.
- Limitaciones de idioma: solo inglés; no se garantiza un rendimiento aceptable en castellano ni en otras lenguas.
- Limitaciones de contexto: la longitud de contexto no está especificada; debe verificarse en la documentación del modelo base antes de diseñar aplicaciones con documentos largos.
- Restricciones de licencia: la licencia health-ai-developer-foundations exige aceptar los términos de Health AI Developer Foundations de Google y es de acceso restringido (gated). No es una licencia de código abierto; el uso comercial puede estar sujeto a condiciones adicionales que deben revisarse en el enlace de licencia.
- Caveat de producción: al ser una cuantización de terceros, la calidad puede degradarse respecto al modelo original, especialmente en Q2_K y Q3. Para uso clínico real se recomienda validar la cuantización elegida contra el modelo en bfloat16.
- El autor de la cuantización no es el desarrollador del modelo; los problemas de calidad deben atribuirse con cuidado entre la cuantización y el modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/medgemma-27b-text-it-GGUF
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/medgemma-27b-text-it-i1-GGUF
- Modelo base: https://huggingface.co/google/medgemma-27b-text-it
- Términos de licencia: https://developers.google.com/health-ai-developer-foundations/terms
- Página de descargas del autor: https://hf.tst.eu/model#medgemma-27b-text-it-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
