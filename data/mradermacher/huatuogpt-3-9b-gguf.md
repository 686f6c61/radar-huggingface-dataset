# mradermacher/HuatuoGPT-3-9B-GGUF

## Resumen

HuatuoGPT-3-9B-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo base FreedomIntelligence/HuatuoGPT-3-9B, un modelo conversacional de dominio medico desarrollado por el equipo FreedomIntelligence. El repositorio no contiene un modelo nuevo ni un reentrenamiento: su aportacion es empaquetar los pesos originales en distintos niveles de cuantizacion (de Q2_K a f16) para permitir su ejecucion en hardware de consumo mediante llama.cpp y sus derivados. El recuento real de parametros declarado en los ficheros safetensors del modelo base es de 8.953.803.264, es decir, aproximadamente 8,95 mil millones.

La relevancia de esta ficha es practica: el modelo base solo se distribuye en precision completa, lo que exige hardware de gama alta, mientras que esta version ofrece variantes desde 3,9 GB (Q2_K) hasta 18,0 GB (f16), cubriendo desde portatiles con GPU modesta hasta estaciones de trabajo. El repositorio ocupa 83,0 GB en total al alojar simultaneamente todas las variantes. La licencia declarada es Apache-2.0, lo que permite uso comercial sin restricciones adicionales, y el unico idioma declarado es el ingles.

Un elemento destacable es la presencia de dos ficheros auxiliares de proyector multimodal (mmproj-Q8_0 y mmproj-f16), lo que indica que el modelo base incorpora un componente de proyeccion para entrada multimodal (vision) en el ecosistema llama.cpp. No se dispone de informacion detallada sobre la arquitectura interna, la longitud de contexto ni el proceso de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: transformer, segun convencion de la familia, sin confirmar en la informacion disponible) |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con llama.cpp) |
| Modelo base | FreedomIntelligence/HuatuoGPT-3-9B |
| Cuantizador | mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf) |
| Tamano del repositorio | 83,0 GB |
| Fecha de creacion (metadatos) | 2026-09-18 |
| Ultima actualizacion (metadatos) | 2026-09-18 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la documentacion proporcionada. Los metadatos de la model card indican que se trata de una cuantizacion estatica en formato GGUF de un modelo HuggingFace convertido con la cadena de herramientas de llama.cpp, con cuantizacion por tensor activada. El modelo base pertenece a la familia HuatuoGPT-3 de FreedomIntelligence y esta etiquetado como modelo medico, de razonamiento y conversacional.

Las etiquetas del repositorio incluyen "onepo", que apunta a que el modelo base fue alineado mediante una variante de optimizacion de preferencias (One-PO). No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composicion del corpus, ni si hubo fases adicionales de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica de atencion o decodificacion. La unica innovacion verificable en este repositorio es el propio proceso de cuantizacion: variantes K-quant e IQ-quant que permiten reducir el modelo hasta 3,9 GB manteniendo el formato compatible con llama.cpp, mas los ficheros mmproj que habilitan el proyector multimodal.

## Capacidades

- Generacion de texto conversacional en ingles con orientacion al dominio medico.
- Razonamiento clinico y respuestas a preguntas medicas (tags: medical, reasoning).
- Conversacion multi-turno (tag: conversational).
- Capacidades multimodales: el repositorio incluye ficheros mmproj (multi-modal supplement), lo que habilita entrada de imagenes en runtimes compatibles; el alcance exacto de esta capacidad no esta documentado en la model card.
- Alineacion mediante optimizacion de preferencias (tag: onepo), orientada a mejorar la calidad de las respuestas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos (language: en).
- Modo de razonamiento extendido (thinking mode) explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de preguntas y respuestas medicas para profesionales: el modelo puede emplearse como herramienta de consulta rapida sobre terminologia, diagnosticos diferenciales y literatura clinica, siempre con supervision humana y sin sustituir el juicio clinico.
- Educacion medica y preparacion de examenes: generacion de explicaciones, casos practicos y preguntas de repaso en ingles para estudiantes de medicina, gracias al ajuste conversacional y al sesgo de dominio medico.
- Triaje y anamnesis estructurada: integrado en un chatbot de admision, puede recoger sintomas en lenguaje natural y estructurarlos antes de pasarlos a un profesional, con la ventaja de ejecutarse en local si se usa la cuantizacion Q4_K_M (5,7 GB).
- Resumen de informes y notas clinicas en ingles: dado un texto largo de historia clinica, el modelo puede condensar hallazgos relevantes; conviene verificar la longitud de contexto soportada antes de desplegarlo en produccion, ya que no esta declarada.
- Procesamiento de documentacion medica con imagenes: los ficheros mmproj permiten, en runtimes compatibles con vision, analizar capturas o figuras junto a texto, por ejemplo para comentar resultados de imagen diagnostica a nivel descriptivo.
- Despliegue en entornos con requisitos de privacidad y sin conexion: al distribuirse en GGUF, el modelo puede ejecutarse en local sobre GPU de consumo, evitando enviar datos de pacientes a APIs externas, un requisito habitual en el sector sanitario.
- Generacion asistida de contenido divulgativo sanitario: redaccion de borradores de articulos o material para pacientes en ingles, con revision editorial posterior.
- Investigacion en NLP clinico: uso como linea base medica de ~9 B en experimentos de evaluacion, ajuste fino o destilacion, dado que la licencia Apache-2.0 no impone restricciones de uso comercial ni de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La busqueda web realizada no devolvio documentacion tecnica, papers ni evaluaciones del modelo: los resultados obtenidos eran contenido no relacionado y sin valor tecnico, por lo que no se incluyen. La model card del repositorio de cuantizaciones tampoco publica metricas (MMLU, MedQA, HumanEval, GSM8K u otras).

## Requisitos de hardware

Los tamanos de fichero de cada cuantizacion son datos publicados en la model card. La VRAM estimada anade un margen de entre 1 y 2 GB sobre el tamano del fichero para cache KV, buffers y overhead del runtime; es una estimacion de ingenieria, no un dato del autor.

| Cuantizacion | Tamano del fichero (GB) | VRAM estimada para inferencia (GB) |
|---|---|---|
| Q2_K | 3,9 | ~5,5 |
| Q3_K_S | 4,4 | ~6,0 |
| Q3_K_M | 4,7 | ~6,5 |
| Q3_K_L | 5,0 | ~6,5 |
| IQ4_XS | 5,3 | ~7,0 |
| Q4_K_S | 5,5 | ~7,0 |
| Q4_K_M | 5,7 | ~7,5 |
| Q5_K_S | 6,4 | ~8,0 |
| Q5_K_M | 6,6 | ~8,5 |
| Q6_K | 7,5 | ~9,5 |
| Q8_0 | 9,6 | ~11,5 |
| f16 | 18,0 | ~20,0 |
| mmproj-Q8_0 | 0,7 | ~0,7 adicionales si se usa vision |
| mmproj-f16 | 1,0 | ~1,0 adicionales si se usa vision |

- Cabe en GPU de consumo: si. Q4_K_M (~7,5 GB de VRAM) entra en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090. Las variantes Q2_K y Q3_K_S pueden ejecutarse incluso en GPU de 6 u 8 GB, con perdida de calidad.
- GPU profesionales: A100 (40/80 GB), H100, L40S y A6000 ejecutan cualquier cuantizacion, incluida f16, con margen amplio para lotes grandes y contexto largo.
- Despliegue recomendado: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y otros runtimes compatibles con GGUF. Para vLLM o TGI, que no explotan bien el formato GGUF, conviene usar los pesos safetensors del modelo base FreedomIntelligence/HuatuoGPT-3-9B.
- Throughput y latencia: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.
- Nota sobre multi-GPU: las variantes f16 (18,0 GB) y Q8_0 (9,6 GB) pueden repartirse entre varias GPU o ejecutarse parcialmente en CPU mediante offload de capas en llama.cpp.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de evaluaciones comparativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales verificables. Las celdas marcadas como "no disponible" reflejan ausencia de datos en la informacion consultada, no ausencia de la caracteristica.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF de terceros | Datos de benchmark |
|---|---|---|---|---|---|
| HuatuoGPT-3-9B (este repositorio, GGUF) | 8,95 B | no disponible | apache-2.0 | si, multiples cuantizaciones | no disponibles |
| Modelo medico de ~7-9 B basado en Mistral/Llama (alternativa generica de la misma categoria) | no disponible | no disponible | depende del modelo base | habitualmente si | no disponibles |
| Modelo generalista de ~8-9 B (alternativa no especializada en medicina) | no disponible | no disponible | habitualmente permisiva | habitualmente si | no disponibles |

No se han encontrado en la busqueda web referencias a evaluaciones que permitan situar HuatuoGPT-3-9B frente a alternativas medicas de tamano similar (por ejemplo, la familia Meditron, BioMistral u OpenBioLLM), por lo que no se afirma ninguna ventaja comparativa.

## Limitaciones y advertencias

- Riesgo clinico: es un modelo de lenguaje, no un dispositivo medico. Puede generar afirmaciones medicas plausibles pero falsas. No debe usarse para diagnostico, prescripcion ni decision terapeutica sin revision de un profesional cualificado.
- Alucinacion: al tratarse de un modelo ajustado para conversacion en dominio medico, el riesgo de citar bibliografia, dosis o estudios inexistentes es especialmente grave. Se recomienda verificar toda salida factual contra fuentes primarias.
- Idiomas: los metadatos declaran unicamente ingles. No hay evidencia de soporte fiable en castellano ni en otras lenguas.
- Contexto desconocido: la longitud de contexto no esta documentada, lo que impide dimensionar casos de uso con documentos largos (historias clinicas completas, articulos extensos) sin pruebas previas.
- Arquitectura y entrenamiento sin verificar: la model card del repositorio de cuantizaciones no describe la arquitectura, el dataset ni el proceso de alineacion del modelo base. Cualquier afirmacion al respecto requiere consultar la documentacion original de FreedomIntelligence.
- Perdida por cuantizacion: las variantes Q2_K y Q3_K reducen el tamano a costa de calidad. Para uso medico conviene Q5_K_M, Q6_K o Q8_0; el propio autor marca Q3_K_M como "lower quality" y Q4_K como "fast, recommended".
- Sesgos: no se ha publicado ninguna evaluacion de sesgos demograficos, etnicos o de genero en la informacion disponible.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion. Aun asi, el uso en contextos regulados (producto sanitario, datos de pacientes) exige cumplimiento normativo independiente de la licencia.
- Madurez del repositorio: en el momento de la consulta el repositorio registra 0 descargas y 0 me gusta, y las fechas de los metadatos (2026-09-18) resultan anomalas, lo que sugiere poca validacion por parte de la comunidad.
- No se ofrecen cuantizaciones ponderadas con imatrix ("weighted/imatrix quants"), lo que implica que la calidad relativa de las cuantizaciones de baja precision puede ser inferior a la de modelos que si las incluyen.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/HuatuoGPT-3-9B-GGUF
- Modelo base: https://huggingface.co/FreedomIntelligence/HuatuoGPT-3-9B
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#HuatuoGPT-3-9B-GGUF
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa responsable de la infraestructura de cuantizacion (nethype GmbH): https://www.nethype.de/
