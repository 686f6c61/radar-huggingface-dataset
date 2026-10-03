# mradermacher/docto-decision-gemma-4-e2b-fr-v0.1-GGUF

## Resumen

Docto-decision-gemma-4-e2b-fr-v0.1-GGUF es la version cuantizada en formato GGUF del modelo bofenghuang/docto-decision-gemma-4-e2b-fr-v0.1, un ajuste fino mediante LoRA sobre la variante edge Gemma 4 E2B de Google DeepMind. El modelo esta especializado en toma de decisiones en el ambito medico y orientado al idioma frances, con etiquetas declaradas de "medical", "french", "system-one", "decision" y "calibration". La cuantizacion la realiza mradermacher, un autor habitual de conversiones GGUF para llama.cpp, a partir de los pesos originales en safetensors.

El interes principal de esta publicacion es practico: convierte un modelo de decision clinica de aproximadamente 4,65 mil millones de parametros en una familia de ficheros GGUF que van de los 3,1 GB (Q2_K) a los 9,4 GB (f16), lo que permite ejecutarlo en hardware de consumo y en despliegues locales o de borde. El repositorio incluye ademas dos ficheros mmproj (proyector multimodal) en f16 y Q8_0, lo que indica que el modelo conserva la capacidad multimodal de la familia base.

La relevancia actual viene de dos factores: por un lado, Gemma 4 E2B pertenece a la linea de modelos "edge" de Google pensada para ejecucion on-device con consumo de memoria reducido; por otro, el ajuste con LoRA sobre un dataset medico frances especifico (bofenghuang/docto-decision-data-fr-v0.1) ofrece una via de bajo coste para adaptar un modelo generalista a un dominio regulado y muy sensible al idioma. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque con las cautelas propias de cualquier sistema de apoyo a la decision clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal de la familia Gemma 4, variante edge E2B; detalles internos exactos no disponibles |
| Parametros totales | 4.647.450.147 (~4,65 B) segun safetensors |
| Parametros activos | No aplica: no se declara como MoE (la variante 26B A4B de Gemma 4 si es de tipo sparse) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, x-f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los pesos originales del modelo base estan en safetensors) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Gemma 4 de Google DeepMind, derivada de la investigacion y tecnologia de Gemini. La variante E2B es una de las dos versiones "edge" de la familia (junto con E4B), disenadas para ejecucion en dispositivo con requisitos de memoria reducidos; la documentacion publica de la familia menciona tecnicas de agrupamiento de embeddings en las variantes pequenas para rebajar el coste de memoria y computo en local. El repositorio cuantizado conserva los ficheros de proyector multimodal (mmproj), lo que confirma que la arquitectura mantiene entrada multimodal ademas de texto. No se dispone de informacion detallada sobre el numero de capas, dimensiones de atencion ni ventana de contexto en la informacion proporcionada.

En cuanto al entrenamiento, Docto-decision es un ajuste fino con LoRA sobre Gemma 4 E2B usando el dataset bofenghuang/docto-decision-data-fr-v0.1, orientado a decisiones medicas en frances y a la calibracion de dichas decisiones (las etiquetas "system-one" y "calibration" apuntan a un comportamiento de respuesta rapida e intuitiva con estimacion de confianza). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas adicionales de RLHF o DPO. Esta ficha describe exclusivamente la conversion a GGUF realizada por mradermacher, que aplica cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) sobre los pesos del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno en frances, con orientacion a dominios clinicos y medicos.
- Toma de decisiones ("decision") y estimacion de calibracion sobre las mismas, segun las etiquetas declaradas del modelo.
- Razonamiento de tipo "system-one": respuestas rapidas e intuitivas, en contraposicion a cadenas de razonamiento largas.
- Capacidad multimodal heredada: el repositorio incluye ficheros mmproj (f16 y Q8_0), necesarios para procesar entradas de imagen junto con texto.
- Uso como adaptador LoRA aplicado sobre el modelo base, lo que permite revisar o reutilizar la adaptacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de codigo o matematicas: no disponibles en la informacion proporcionada.
- Modo "thinking" explicito o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Apoyo a la decision clinica en frances: el modelo esta ajustado especificamente sobre datos de decision medica en frances, por lo que puede emplearse como componente de sugerencia de decision ante un caso descrito en texto, siempre con supervision profesional y sin sustituir el juicio clinico.
- Triaje y priorizacion de pacientes: a partir de una descripcion textual de sintomas, el modelo puede generar una clasificacion orientativa de urgencia, aprovechando su orientacion a "decision" y a la calibracion de la respuesta.
- Estimacion de confianza para derivacion a humano: dado que el modelo declara calibracion, sus salidas pueden usarse para decidir cuando un caso debe escalarse a un profesional en lugar de resolverse de forma automatica.
- Despliegue on-device en entornos sanitarios con conectividad limitada: con cuantizaciones Q4_K_M (3,5 GB) o Q4_K_S (3,5 GB) el modelo cabe en portatiles y equipos de gama media, lo que permite ejecutarlo localmente sin enviar datos de pacientes a servicios externos.
- Asistencia documental clinica en frances: resumen o reformulacion de notas clinicas, informes y literatura medica en frances, con el apoyo del proyector multimodal si se requiere procesar documentos escaneados como imagen.
- Investigacion en adaptacion de dominio con LoRA: el modelo sirve como caso de estudio reproducible de como adaptar una variante edge de Gemma 4 a un dominio especializado con un dataset pequeno y especifico en un solo idioma.
- Generacion de preguntas y respuestas medicas en frances: construccion de conjuntos de evaluacion o de material formativo para personal sanitario, sujeto a revision experta.
- Base para prototipos de asistentes conversacionales sanitarios: su naturaleza conversacional y su licencia Apache 2.0 permiten integrarlo en prototipos internos sin restricciones de uso comercial derivadas de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion clinica, y la busqueda web no aporta cifras asociadas a este ajuste concreto. Tampoco se proporcionan datos de perplejidad por cuantizacion mas alla de la referencia generica a los graficos comparativos de tipos de cuantizacion enlazados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos de texto): aproximadamente 3,1 GB en Q2_K, 3,4 GB en IQ4_XS, 3,5 GB en Q4_K_S y Q4_K_M, 3,7 GB en Q5_K_M, 3,9 GB en Q6_K, 5,1 GB en Q8_0 y 9,4 GB en f16.
- VRAM adicional para multimodal: 0,7 GB con mmproj-Q8_0 y 1,1 GB con mmproj-f16, que se suman a los pesos del modelo de texto cuando se usa la entrada de imagen.
- GPU recomendadas: el modelo cabe con holgura en RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100; en tarjetas de 6-8 GB conviene usar cuantizaciones Q4 o inferiores.
- Compatibilidad con GPU de consumo: si, es uno de los puntos fuertes del modelo; con Q4_K_M mas el proyector multimodal el consumo total ronda los 4,2-4,6 GB, lo que permite ejecutarlo en GPUs de 6 GB o superiores y tambien en CPU con memoria RAM suficiente.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, Jan, llama-cpp-python) son las rutas naturales por el formato GGUF; para multimodal hay que usar un runtime con soporte de ficheros mmproj. vLLM y TGI estan orientados a safetensors, por lo que requeririan el modelo base sin cuantizar.
- Latencia y throughput: no disponibles en la informacion proporcionada. El repo ocupa 49,6 GB en total debido a que aloja simultaneamente todas las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| mradermacher/docto-decision-gemma-4-e2b-fr-v0.1-GGUF | ~4,65 B | Frances | No disponible | GGUF (+ mmproj) | Apache 2.0 | Version cuantizada, 12 cuantizaciones de texto |
| bofenghuang/docto-decision-gemma-4-e2b-fr-v0.1 | ~4,65 B | Frances | No disponible | Safetensors (LoRA) | Apache 2.0 | Modelo original, sin cuantizar; requiere hardware mayor |
| google gemma-4-E2B | No disponible | Multilingue (familia Gemma) | No disponible | Safetensors / GGUF | Licencia Gemma | Modelo base generalista, sin especializacion medica ni francesa |
| Gemma 4 26B A4B | 26 B totales, ~4 B activos | Multilingue | No disponible | Safetensors / GGUF | Licencia Gemma | Variante MoE de la familia, mucho mayor; no comparable en hardware de consumo |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito idiomatico restringido: el modelo declara unicamente frances (fr), por lo que su uso en castellano u otros idiomas no esta soportado ni evaluado.
- Dominio medico de alto riesgo: se trata de un sistema de apoyo a la decision, no de un dispositivo medico; cualquier salida debe ser validada por personal sanitario cualificado antes de tener efecto sobre un paciente.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de error en la informacion disponible, por lo que el riesgo de respuestas plausibles pero incorrectas no esta cuantificado.
- Ausencia de benchmarks: sin datos de MMLU, evaluaciones clinicas ni pruebas de calibracion publicadas, no es posible verificar las afirmaciones de la model card sobre calidad de decision y calibracion.
- Sesgos potenciales: no se documenta la composicion del dataset bofenghuang/docto-decision-data-fr-v0.1, ni su cobertura demografica, geografica o clinica; los sesgos derivados son desconocidos.
- Degradacion por cuantizacion: las cuantizaciones bajas (Q2_K, Q3_K_S) reducen la calidad; el propio autor marca Q4_K_S y Q4_K_M como las opciones rapidas recomendadas y advierte de menor calidad en Q3_K_M.
- Cautelas de despliegue en el borde: ejecutar un modelo medico on-device sin registro de auditoria ni trazabilidad puede dificultar el cumplimiento normativo en entornos sanitarios regulados.
- Licencia: Apache 2.0 permite uso comercial en los terminos de dicha licencia, pero conviene verificar las condiciones del modelo base de Google (familia Gemma) y las obligaciones derivadas del dataset de entrenamiento, que no se detallan en la informacion proporcionada.
- Ficheros multimodales: para aprovechar la entrada de imagen hay que descargar y configurar el mmproj correspondiente en un runtime compatible; omitirlo limita el modelo a texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/docto-decision-gemma-4-e2b-fr-v0.1-GGUF
- Modelo base (ajuste original): https://huggingface.co/bofenghuang/docto-decision-gemma-4-e2b-fr-v0.1
- Dataset de entrenamiento: https://huggingface.co/datasets/bofenghuang/docto-decision-data-fr-v0.1
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#docto-decision-gemma-4-e2b-fr-v0.1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Repositorio de Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Blog de Hugging Face sobre Gemma 4: https://github.com/huggingface/blog/blob/main/gemma4.md
- Guia de Gemma 4 (arquitectura y despliegue): https://dev.to/linnn_charm_2e397112f3b51/gemma-4-complete-guide-architecture-models-and-deployment-in-2026-3m5b
- Cuantizacion GGUF de Gemma 4 E2B por el mismo autor: https://huggingface.co/mradermacher/gemma-4-E2B-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
