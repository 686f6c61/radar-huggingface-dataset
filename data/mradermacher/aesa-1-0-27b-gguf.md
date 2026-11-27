# mradermacher/Aesa-1.0-27B-GGUF

## Resumen

Aesa-1.0-27B-GGUF es la distribucion en formato GGUF del modelo Aesa-1.0-27B, un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) desarrollado originalmente por el usuario TheHerecy y cuantizado por mradermacher. El modelo esta especializado en dominios de seguridad informatica y pentesting, segun indican las etiquetas de su model card (security, pentest), y deriva de la familia Qwen3.5, tal como refleja la etiqueta qwen3_5. Se trata de un modelo afinado mediante QLoRA y posteriormente fusionado (merged) sobre una base Qwen3.5 de 27B.

La relevancia de esta publicacion radica en que ofrece el modelo en una amplia gama de cuantizaciones estaticas GGUF (desde Q2_K hasta Q8_0), lo que facilita su despliegue en hardware de consumo mediante llama.cpp u Ollama, sin necesidad de GPU de datacenter. El repositorio incluye ademas ficheros multimodales (mmproj) en Q8_0 y f16, lo que sugiere capacidades de vision heredadas de la arquitectura base.

El modelo esta publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y esta etiquetado unicamente para el idioma ingles. La fecha de creacion del repositorio es el 27 de noviembre de 2026 y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, segun etiqueta qwen3_5); no se detalla si es densa o MoE |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) |
| Modelo base | TheHerecy/Aesa-1.0-27B |
| Metodo de ajuste | QLoRA + merged |
| Tamano del repo | 192,3 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo base Aesa-1.0-27B se construye sobre la arquitectura Qwen3.5, segun la etiqueta qwen3_5 presente en la model card. El proceso de entrenamiento declarado consiste en un ajuste fino mediante QLoRA seguido de una fusion (merge) de los adaptadores en los pesos base. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La especializacion declarada es en seguridad informatica y pentesting, aunque la model card no detalla la naturaleza del corpus de ajuste ni las tareas concretas para las que fue optimizado. La presencia de ficheros mmproj (multi-modal supplement) indica que el modelo conserva o incorpora capacidades multimodales, presumiblemente vision, heredadas de la arquitectura base. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, con etiqueta conversational en los metadatos.
- Especializacion declarada en seguridad informatica y pentesting (etiquetas security y pentest).
- Capacidades multimodales: el repositorio incluye ficheros mmproj-Q8_0 y mmproj-f16, lo que indica soporte de entrada de imagenes.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que sugiere integracion con infraestructuras de inferencia tipo API.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta language: en.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de vulnerabilidades asistido: el modelo, afinado en dominios de seguridad y pentesting, puede emplearse para revisar configuraciones, interpretar salidas de escaneres y redactar informes de hallazgos en ingles. Su tamano de 27B permite mantener contexto tecnico detallado en una sola sesion.
- Formacion y simulacion de pentesting: puede generar escenarios de laboratorio, explicar tecnicas de explotacion en entornos controlados y responder preguntas de un analista junior, gracias a su especializacion declarada y a su naturaleza conversacional.
- Asistencia en respuesta a incidentes: con las cuantizaciones Q4_K_M o Q5_K_M (17,1 y 19,7 GB respectivamente) puede desplegarse en estaciones de trabajo de seguridad para triaje de alertas y resumen de logs, sin depender de servicios en la nube.
- Analisis de capturas y documentacion tecnica con vision: los ficheros mmproj permiten procesar imagenes, util para interpretar diagramas de red, capturas de pantalla de herramientas o salidas graficas de escaneres.
- Despliegue en entornos air-gapped: al distribuirse en GGUF y con licencia Apache 2.0, puede ejecutarse en infraestructura aislada mediante llama.cpp u Ollama, requisito habitual en equipos de seguridad que no pueden enviar datos a APIs externas.
- Generacion de documentacion de seguridad: redaccion de politicas, guias de hardening y procedimientos en ingles, aprovechando la ventana de contexto de la arquitectura Qwen3.5 (longitud exacta no disponible).
- Integracion en pipelines CI/CD de analisis estatico: mediante la etiqueta endpoints_compatible, puede exponerse como servicio interno que revise codigo o configuraciones en busca de patrones inseguros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos unicamente, sin overhead de contexto):
  - Q2_K: ~11,3 GB.
  - Q3_K_M: ~13,8 GB.
  - IQ4_XS: ~15,8 GB.
  - Q4_K_M: ~17,1 GB.
  - Q5_K_M: ~19,7 GB.
  - Q6_K: ~22,5 GB.
  - Q8_0: ~29,1 GB.
- GPU de consumo: las cuantizaciones Q4_K_S y Q4_K_M (15,9 y 17,1 GB) caben en GPUs con 24 GB de VRAM como la RTX 3090 o RTX 4090, dejando margen para contexto. Q5_K_M y Q6_K requieren 24 GB con contexto reducido o GPU de 32 GB. Q8_0 necesita al menos 32 GB (A100 40GB, RTX A6000, o dos GPUs de 24 GB).
- GPU de datacenter: A100 40GB/80GB, H100 80GB y L40S 48GB pueden alojar cualquier cuantizacion con contexto amplio.
- Despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF. La etiqueta endpoints_compatible sugiere compatibilidad con APIs de inferencia; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se recomienda verificar compatibilidad.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aesa-1.0-27B-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | Especializado en seguridad/pentest, multimodal |
| Qwen3.5-27B (base) | ~27 B | no disponible | no disponible | safetensors/GGUF | Modelo base del que deriva; capacidades generales |
| Gemma 3 27B | 27 B | no disponible | Gemma license | safetensors/GGUF | Alternativa de tamano similar, multimodal |
| Mistral Small 3 (24B) | 24 B | no disponible | Apache 2.0 | safetensors/GGUF | Alternativa generalista de tamano cercano |

La comparativa se limita a caracteristicas estructurales; no se dispone de datos de rendimiento comparativo para Aesa-1.0-27B en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3.5 y afinarse en un corpus de seguridad no descrito, pueden persistir sesgos del modelo base y del dataset de ajuste.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; en dominios de seguridad, una alucinacion puede derivar en recomendaciones tecnicas incorrectas o peligrosas, por lo que requiere validacion humana.
- Limitacion de idioma: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto: la longitud de contexto no se documenta en la informacion disponible, lo que impide planificar despliegues con ventanas largas.
- Cuantizaciones bajas: Q2_K y Q3_K_S degradan la calidad; para uso en produccion se recomienda Q4_K_M o superior. Las cuantizaciones ponderadas/imatrix no estan disponibles segun el autor de la cuantizacion.
- Uso dual: la especializacion en pentesting implica que el modelo puede generar contenido ofensivo; debe aplicarse con controles de acceso y en entornos autorizados.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base TheHerecy/Aesa-1.0-27B y la arquitectura Qwen3.5 pueden tener condiciones adicionales no reflejadas en esta ficha; conviene verificar la licencia del modelo original.
- Fecha de creacion futura (2026-11-27) y cero descargas: el modelo no tiene validacion comunitaria ni evidencia de uso en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aesa-1.0-27B-GGUF
- Modelo base: https://huggingface.co/TheHerecy/Aesa-1.0-27B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Aesa-1.0-27B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
