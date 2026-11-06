# mradermacher/OLMo-2-0325-32B-Instruct-ARA-heretic-GGUF

## Resumen

OLMo-2-0325-32B-Instruct-ARA-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic, realizada por mradermacher. Se trata de una variante "heretic" (tambien etiquetada como uncensored, decensored y abliterated) del modelo OLMo 2 de AllenAI en su version Instruct de 32B, publicada en marzo de 2025. El proceso de abliteration elimina las direcciones de activacion asociadas al rechazo, de modo que el modelo deja de declinar peticiones que el modelo original rechazaria.

El modelo base OLMo 2 es un transformer decoder-only de 32.234.279.936 parametros (aproximadamente 32B), desarrollado por el Allen Institute for AI (AllenAI) como parte de su iniciativa de IA completamente abierta, con pesos, datos de entrenamiento y recetas publicados. Esta version concreta ha sido modificada por richardyoung y cuantizada por mradermacher, manteniendo la licencia Apache 2.0 del original.

El interes de esta ficha radica en que ofrece un modelo de 32B en formato GGUF con cuantizaciones desde Q2_K (12,1 GB) hasta Q8_0 (34,4 GB), lo que permite desplegarlo en hardware de consumo y en entornos de inferencia local mediante llama.cpp u Ollama. La ausencia de censura lo hace util para investigacion sobre alineamiento, generacion creativa sin restricciones y escenarios donde el modelo original resulta excesivamente conservador, aunque con las advertencias de seguridad que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 2 de AllenAI, modificado mediante abliteration) |
| Parametros totales | 32.234.279.936 (aproximadamente 32B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (cuantizaciones estaticas; no hay imatrix/weighted disponibles) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

El modelo subyacente es OLMo 2 32B Instruct de AllenAI, un transformer decoder-only denso de aproximadamente 32B parametros. La model card de esta cuantizacion no detalla la arquitectura interna ni la composicion exacta del dataset de preentrenamiento; solo se indica que el modelo base fue entrenado sobre el dataset allenai/RLVR-GSM-MATH-IF-Mixed-Constraints, orientado a razonamiento verificable con recompensa (RLVR) en tareas de matematicas, GSM e instrucciones con restricciones mixtas.

La innovacion tecnica principal de esta version es el proceso de abliteration (etiquetas heretic, uncensored, decensored, abliterated), que identifica y elimina la direccion de activacion responsable de las respuestas de rechazo en el modelo Instruct original. El resultado es un modelo que conserva las capacidades del original pero sin el comportamiento de negativa ante peticiones sensibles. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si hubo fases adicionales de RLHF o DPO mas alla de las del modelo Instruct original.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (conversational).
- Razonamiento matematico y resolucion de problemas tipo GSM, reforzado por el dataset RLVR-GSM-MATH-IF-Mixed-Constraints.
- Seguimiento de instrucciones con restricciones mixtas (mixed constraints).
- Generacion sin restricciones de contenido (abliterated), incluyendo temas que el modelo original rechazaria.
- Compatible con endpoints de inferencia (tag endpoints_compatible).
- Capacidad de cuantizacion reproductible (tag reproducible).
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration comparando sus respuestas con las del OLMo 2 Instruct original, util para analizar como se distribuyen las direcciones de rechazo y que capacidades se ven afectadas.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas donde el modelo original declinaria; el formato GGUF permite ejecutarlo en local con llama.cpp.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M (19,6 GB) o Q4_K_S (18,5 GB) cabe en GPUs con 24 GB de VRAM (RTX 3090/4090) o en configuraciones con RAM suficiente mediante offloading.
- Experimentacion con tecnicas de cuantizacion: al ofrecer diez niveles de cuantizacion desde Q2_K hasta Q8_0, sirve para medir el impacto de la cuantizacion en calidad y perplejidad sobre un modelo de 32B.
- Procesamiento por lotes en ingles: tareas de generacion de texto a gran escala (resumen, reescritura, clasificacion) donde el contenido sensible no es un problema y se busca throughput con Q4 o Q5.
- Entornos de investigacion academica: al tener licencia Apache 2.0 y pesos abiertos, se puede usar en proyectos docentes y de investigacion sin restricciones de uso comercial.
- Fine-tuning posterior sobre la version cuantizada: aunque el GGUF no es ideal para entrenamiento, el modelo base en safetensors permite ajuste fino y luego re-cuantizacion con el mismo pipeline de mradermacher.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de fichero GGUF, mas overhead de contexto):
  - Q2_K: 12,1 GB
  - Q3_K_S: 14,2 GB
  - Q3_K_M: 15,7 GB
  - Q3_K_L: 17,0 GB
  - Q4_K_S: 18,5 GB
  - Q4_K_M: 19,6 GB
  - Q5_K_S: 22,3 GB
  - Q5_K_M: 23,0 GB
  - Q6_K: 26,5 GB
  - Q8_0: 34,4 GB
- GPU recomendadas: para Q4_K_M en una sola GPU, RTX 3090 o RTX 4090 (24 GB VRAM); para Q8_0 o F16, A100 40 GB, A100 80 GB o H100.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido, o con offloading parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base admite transformers y vLLM/TGI en formato safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OLMo-2-0325-32B-Instruct-ARA-heretic-GGUF (este) | 32B | no disponible | Apache 2.0 | GGUF | Version abliterated, solo ingles |
| OLMo-2-0325-32B-Instruct-GGUF (mradermacher) | 32B | no disponible | Apache 2.0 | GGUF | Version original sin abliteration |
| OLMo-2-0325-32B-Instruct-i1-GGUF (mradermacher) | 32B | no disponible | Apache 2.0 | GGUF | Cuantizaciones imatrix del original |
| richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic | 32B | no disponible | Apache 2.0 | safetensors | Modelo base de esta cuantizacion, sin cuantizar |

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o sesgado sin filtros; no es apto para produccion orientada al publico general sin moderacion externa.
- Riesgo de alucinacion inherente a los modelos de 32B, agravado por la falta de benchmarks publicados que permitan estimar su fiabilidad.
- Solo soporta ingles segun la model card; no hay evidencia de capacidades multilingues.
- La longitud de contexto no esta documentada en la informacion disponible; conviene verificarla en el modelo base antes de disenar aplicaciones con contexto largo.
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para uso serio se recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix/weighted disponibles para este modelo, lo que puede suponer una perdida de calidad frente a las versiones i1 del modelo original.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated puede conllevar riesgos reputacionales y legales segun la jurisdiccion y el contenido generado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/OLMo-2-0325-32B-Instruct-ARA-heretic-GGUF
- Modelo base (richardyoung): https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic
- Version original cuantizada por mradermacher: https://huggingface.co/mradermacher/OLMo-2-0325-32B-Instruct-GGUF
- Version imatrix del original: https://huggingface.co/mradermacher/OLMo-2-0325-32B-Instruct-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#OLMo-2-0325-32B-Instruct-ARA-heretic-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
