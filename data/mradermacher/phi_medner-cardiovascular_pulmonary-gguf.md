# mradermacher/Phi_medner-cardiovascular_pulmonary-GGUF

## Resumen

Phi_medner-cardiovascular_pulmonary es un modelo de lenguaje especializado en el dominio biomédico, concretamente en las areas de cardiovascular y pulmonar. Se trata de un ajuste fino (fine-tuning) del modelo base emilykang/Phi_medner-cardiovascular_pulmonary, que a su vez deriva de la familia Phi de Microsoft. Esta ficha documenta la version cuantizada en formato GGUF publicada por el usuario mradermacher, que facilita su despliegue en entornos con recursos limitados.

El modelo cuenta con 2.779.683.840 parametros (aproximadamente 2,78 mil millones), lo que lo situa en la categoria de modelos pequenos y eficientes. Su proposito es responder a preguntas y tareas relacionadas con la salud cardiovascular y pulmonar, un nicho donde los modelos generalistas suelen carecer de la terminologia y el razonamiento clinico especificos.

La relevancia de esta publicacion reside en la disponibilidad de cuantizaciones GGUF que van desde 1,2 GB (Q2_K) hasta 5,7 GB (f16), lo que permite ejecutar el modelo en GPU de consumo e incluso en CPU. El modelo esta etiquetado unicamente en ingles y no se especifica licencia en la informacion disponible, lo que supone una limitacion importante para su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Phi, fine-tuning de emilykang/Phi_medner-cardiovascular_pulmonary) |
| Parametros totales | 2.779.683.840 (~2,78 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su pertenencia a la familia Phi, un transformer decoder-only con atencion estandar. El modelo original emilykang/Phi_medner-cardiovascular_pulmonary es un fine-tuning del modelo base sobre el que se ha aplicado un ajuste especifico para el dominio cardiovascular y pulmonar. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La version documentada aqui es una cuantizacion estatica realizada por mradermacher mediante la libreria transformers y convertida a formato GGUF. El autor indica que las cuantizaciones con imatrix (ponderadas) estan disponibles en un repositorio separado (sufijo -i1-GGUF). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Generacion de texto en ingles orientada al dominio biomedico cardiovascular y pulmonar.
- Razonamiento clinico basico y respuesta a preguntas sobre terminologia medica especializada.
- Capacidad de conversacion multi-turno (heredada de la familia Phi).
- No se especifica soporte de tool calling ni function calling en la informacion disponible.
- No se especifica soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun las etiquetas del repositorio.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Consulta de terminologia cardiaca y pulmonar: el modelo puede responder preguntas sobre conceptos como hipertension pulmonar, insuficiencia cardiaca o arritmias, usando su ajuste de dominio para ofrecer respuestas con vocabulario clinico preciso.
- Asistencia en documentacion clinica: puede ayudar a redactar resumenes de historiales de pacientes con patologias cardiovasculares, siempre con revision humana dado el riesgo de alucinacion.
- Educacion medica: como herramienta de apoyo para estudiantes de medicina que necesiten repasar conceptos de fisiologia cardiovascular y respiratoria en ingles.
- Prototipado de asistentes sanitarios: su tamano reducido (1,7 GB en Q4_K_S) permite desplegarlo en un portatil con GPU consumer para pruebas de concepto de chatbots medicos.
- Extraccion de informacion de textos medicos: puede procesar articulos o informes en ingles sobre cardiologia y neumologia para resumir hallazgos, con validacion posterior.
- Investigacion en NLP clinico: util como baseline ligero para experimentos de dominio biomedico con recursos computacionales limitados, ejecutable via llama.cpp u Ollama.
- Despliegue en entornos con CPU: la cuantizacion Q2_K (1,2 GB) permite inferencia en CPU sin GPU dedicada, adecuada para demos y entornos de baja latencia no critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con Q2_K/Q3_K_S, 2-3 GB con Q4_K_M, 3-4 GB con Q6_K y 6-7 GB con f16 (incluyendo overhead de contexto).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones Q4; RTX 4090 o A100 no son necesarias por el reducido tamano del modelo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base puede servirse con transformers, vLLM o TGI usando los safetensors originales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phi_medner-cardiovascular_pulmonary (este) | ~2,78 B | no disponible | no disponible | GGUF, safetensors | Especializado en cardiovascular/pulmonar |
| emilykang/Phi_medner-cardiovascular_pulmonary | ~2,78 B | no disponible | no disponible | safetensors | Modelo base del que deriva esta cuantizacion |
| Modelos Phi genericos de Microsoft | ~2,7-3,8 B (segun version) | no disponible | MIT (tipicamente) | safetensors, GGUF | Genericos, sin especializacion medica |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base emilykang/Phi_medner-cardiovascular_pulmonary antes de cualquier despliegue en produccion.
- Riesgo elevado de alucinacion en contexto medico: un modelo de 2,78 B ajustado sobre un dominio clinico puede generar afirmaciones medicas incorrectas con apariencia de verosimilitud; no debe usarse como sustituto del criterio medico profesional.
- Solo ingles: no soporta castellano ni otros idiomas, lo que limita su uso en entornos hispanohablantes sin traduccion previa.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el manejo de documentos largos.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M pueden degradar notablemente la calidad de las respuestas; el autor recomienda Q4_K_S o Q4_K_M como equilibrio.
- Sin datos de entrenamiento publicados: se desconoce la composicion del dataset, lo que impide evaluar sesgos demograficos o clinicos.
- Modelo de nicho con pocas descargas (88) y sin likes: no ha sido validado de forma amplia por la comunidad.
- No apto para diagnostico: cualquier uso en entornos clinicos reales requiere validacion regulatoria y supervision medica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Phi_medner-cardiovascular_pulmonary-GGUF
- Modelo base: https://huggingface.co/emilykang/Phi_medner-cardiovascular_pulmonary
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Phi_medner-cardiovascular_pulmonary-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Phi_medner-cardiovascular_pulmonary-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
