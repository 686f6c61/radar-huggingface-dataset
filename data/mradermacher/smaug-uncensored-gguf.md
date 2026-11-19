# mradermacher/Smaug-Uncensored-GGUF

## Resumen

Smaug-Uncensored-GGUF es la distribucion en formato GGUF del modelo abacusai/Smaug-Uncensored, publicada por el usuario mradermacher. Se trata de una cuantizacion estatica del modelo original de Abacus.AI, pensada para su uso con llama.cpp y otros runners compatibles con GGUF. El modelo cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones) y esta etiquetado como "agentic", lo que sugiere un enfasis en capacidades de razonamiento multi-paso y uso de herramientas.

El modelo base fue afinado mediante DPO (Direct Preference Optimization) segun las etiquetas de la model card, y esta disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Los idiomas declarados son ingles (en) y chino (zh). La denominacion "Uncensored" indica que el modelo ha sido entrenado con menores restricciones de rechazo en comparacion con modelos alineados de forma mas conservadora.

La relevancia de esta publicacion radica en que ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K hasta Q8_0, ademas de f16 y mmproj para componentes multimodales), lo que facilita su despliegue en hardware de consumo con requisitos de VRAM muy distintos. El repositorio ocupa 93,2 GB en total, aunque cada cuantizacion individual pesa entre 11 y 29 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no especificados) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS (segun etiquetas); disponibles en repo: Q2_K, Q3_K_M, Q4_K_S, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Los parametros totales (27,3 B) y la presencia de ficheros mmproj (multi-modal supplement) en el repositorio indican que el modelo base podria incorporar componentes multimodales, aunque la model card no lo confirma explicitamente ni detalla que modalidades cubre. El etiquetado "agentic" y "dpo" sugiere que el entrenamiento incluyo una fase de optimizacion de preferencias orientada a comportamiento agentico.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion fue realizada por mradermacher mediante cuantizacion estatica (se indica "static quants" y "output_tensor_quantised: 1"), y el autor senala que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Capacidades orientadas a agentes (tag "agentic"): razonamiento multi-paso y presumiblemente uso de herramientas, aunque la model card no detalla el soporte explicito de tool calling.
- Comportamiento con menores restricciones de rechazo ("Uncensored"), orientado a escenarios donde se requiere menor filtrado de respuestas.
- Posible soporte multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16) descritos como "multi-modal supplement", lo que indica la existencia de un proyector multimodal, aunque no se especifica que modalidades cubre.
- Afinado mediante DPO segun las etiquetas del modelo.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q2_K (11 GB) y Q4_K_S (15,9 GB) permiten ejecutar el modelo en GPUs con 12-16 GB de VRAM mediante llama.cpp, algo inviable con los pesos en f16.
- Prototipado de agentes conversacionales: el etiquetado "agentic" y el formato GGUF facilitan integrar el modelo en frameworks de agentes locales para pruebas de razonamiento multi-paso sin depender de APIs externas.
- Investigacion sobre alineacion y filtrado: al tratarse de un modelo "Uncensored", resulta util para estudiar el comportamiento de modelos con restricciones reducidas en tareas de evaluacion comparativa de sesgos y rechazos.
- Generacion de texto en ingles y chino: util para pipelines bilingues de resumen, redaccion o traduccion asistida en entornos donde se prefiera inferencia local por privacidad.
- Experimentacion con cuantizaciones: el rango de cuantizaciones disponibles (de Q2_K a Q8_0) permite medir el impacto de la compresion en la calidad de salida para este modelo concreto.
- Inferencia en entornos sin conectividad: al ser un GGUF ejecutable con llama.cpp, puede desplegarse en maquinas aisladas o air-gapped donde no se permite el acceso a servicios en la nube.
- Evaluacion de modelos multimodales: la presencia de ficheros mmproj permite probar el componente multimodal con runners que soporten proyectores, aunque la documentacion al respecto es escasa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): Q2_K ~11 GB; Q3_K_M ~13,6 GB; Q4_K_S ~15,9 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB; f16 ~54,6 GB (estimacion a partir de los 27,3 B de parametros).
- GPU recomendadas: para Q4_K_S o Q6_K, una RTX 4090 (24 GB) es suficiente; para Q8_0 se recomienda una A100 40 GB o H100; para f16 se necesita al menos 80 GB (A100 80 GB o H100).
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_S, Q6_K o Q8_0; en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con Q2_K o Q3_K_M. La RAM del sistema debe cubrir el tamano del fichero si se usa offloading parcial.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runner compatible con GGUF (koboldcpp, LM Studio). El tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI en algunos runners.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base que permitan una comparativa rigurosa con alternativas de la misma categoria. Como referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Smaug-Uncensored (este) | ~27,3 B | no disponible | Apache 2.0 | GGUF, safetensors |
| Alternativas de ~27-34 B | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables concretos con datos verificables; se indica "no disponible".

## Limitaciones y advertencias

- Al estar etiquetado como "Uncensored", el modelo presenta menores restricciones de rechazo, lo que implica mayor riesgo de generar contenido inapropiado, ofensivo o danino; requiere mitigaciones adicionales en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de fidelidad.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga sin verificacion empirica.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_M) degradan la calidad de forma notable; el autor solo recomienda Q4_K_S en adelante para uso general.
- No se dispone de informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el dataset de entrenamiento impide verificar el cumplimiento de derechos de terceros.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del funcionamiento de estas cuantizaciones concretas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Smaug-Uncensored-GGUF
- Modelo base: https://huggingface.co/abacusai/Smaug-Uncensored
- Pagina de descargas del autor: https://hf.tst.eu/model#Smaug-Uncensored-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
