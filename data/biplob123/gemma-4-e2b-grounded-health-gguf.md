# biplob123/gemma-4-e2b-grounded-health-GGUF

## Resumen

`gemma-4-e2b-grounded-health-GGUF` es una distribucion en formato GGUF del modelo `biplob123/gemma-4-e2b-grounded-health`, un ajuste fino de la familia Gemma orientado a preguntas y respuestas biomedicas con enfasis en respuestas fundamentadas (grounded) sobre evidencia. El autor del repositorio es biplob123 y el artefacto publicado es unicamente la conversion a GGUF para su uso en llama.cpp, Ollama y LM Studio, no un modelo entrenado desde cero. El modelo base declarado contiene 4.647.450.147 parametros reales segun los safetensors del repositorio original.

La relevancia de esta publicacion es practica: ofrece pesos cuantizados listos para ejecucion local en hardware de consumo, con dos variantes (Q4_K_M y Q8_0) y hashes SHA-256 publicados, lo que permite verificar la integridad de la descarga. El autor indica que las cifras de evaluacion de la model card principal corresponden especificamente al fichero Q4_K_M y que la demo local sirve exactamente esos mismos bytes mediante `llama-server`, de modo que la demo y los numeros reportados son coherentes entre si.

Se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, creado y actualizado el 20 de noviembre de 2026. La model card es muy escueta: no detalla composicion del dataset, numero de tokens de entrenamiento, idiomas soportados ni resultados de benchmarks, y remite a la model card del modelo base para esa informacion. La licencia declarada es Apache-2.0, aunque las etiquetas incluyen `research-only` y la propia card advierte que no es un dispositivo medico ni debe usarse para decisiones clinicas o de salud personales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma; el autor no especifica la variante arquitectonica) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con etiqueta `research-only` y aviso de no uso clinico) |
| Formato de pesos | GGUF (construido con llama.cpp `b12421`) |

Detalle de los ficheros publicados:

| Fichero | Tamano | SHA-256 |
|---|---|---|
| `gemma-4-e2b-grounded-health-Q4_K_M.gguf` | 3,43 GB | `6da2c13ee1a3b94c99f9107bb27f344539364cdad371caea4b1114ef91b5be45` |
| `gemma-4-e2b-grounded-health-Q8_0.gguf` | 4,97 GB | `d581fb869346708a6d1fa6c2bd45da8b368a611ce6a18302ee4f8c0d4e2138a8` |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna en la documentacion proporcionada. El nombre del repositorio y las etiquetas indican que deriva de la familia Gemma, y el recuento de parametros (aproximadamente 4,65 mil millones) situa el modelo en el rango de los Gemma de tamano pequeno-medio, pero el autor no especifica si se trata de un transformer denso, de una variante con atencion local/global o de otra configuracion. Tampoco se documenta la longitud de contexto nativa ni el tokenizador empleado.

Respecto al entrenamiento, la model card del repositorio GGUF no aporta datos: no se indica el numero de tokens de ajuste, la composicion del dataset, si hubo fases de RLHF, DPO o preferencia, ni el procedimiento de curacion de datos. La unica pista es la etiqueta `pubmedqa`, que sugiere el uso de PubMedQA u otros corpus de preguntas biomedicas en el ajuste fino, y el calificativo `grounded`, que apunta a un entrenamiento orientado a condicionar las respuestas sobre pasajes de evidencia. El identificador interno `gemma-e2b-grounded-v2-q4` sugiere una segunda iteracion del ajuste. Todo lo demas debe consultarse en la model card del modelo base, que no forma parte de la informacion disponible.

La innovacion tecnica documentada es de empaquetado, no de modelado: la publicacion ofrece cuantizaciones reproducibles con hashes verificables y declara explicitamente que la demo y los benchmarks emplean el mismo fichero Q4_K_M, lo que elimina la discrepancia habitual entre los numeros reportados y el artefacto que el usuario descarga.

## Capacidades

- Generacion de texto conversacional en formato de chat (etiqueta `conversational`).
- Respuesta a preguntas de dominio biomedico, presumiblemente orientada a respuestas fundamentadas en evidencia, segun el nombre y las etiquetas del modelo.
- Ejecucion local mediante llama.cpp, Ollama y LM Studio, al distribuirse en GGUF.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite servirlo tras una API compatible con el ecosistema de Hugging Face.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling, function calling y agentes multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Modo thinking explicito: no disponible.

## Casos de uso

- Despliegue local de un asistente de consulta biomedica en un portatil o estacion de trabajo: el fichero Q4_K_M de 3,43 GB puede cargarse con Ollama mediante `ollama run hf.co/biplob123/gemma-4-e2b-grounded-health-GGUF:Q4_K_M`, lo que permite experimentar con preguntas sobre literatura sin enviar datos a un servicio externo.
- Investigacion en recuperacion aumentada (RAG) sobre corpus medicos: el enfasis en respuestas fundamentadas hace que el modelo sea un candidato para prototipos donde se le pasa un pasaje de evidencia y se le pide responder citando ese contexto, evaluando despues la fidelidad de la respuesta.
- Evaluacion comparativa de cuantizaciones: al publicarse Q4_K_M y Q8_0 con hashes, se puede medir la degradacion de calidad entre ambas variantes sobre el mismo conjunto de preguntas, un experimento habitual en el estudio de cuantizacion de modelos pequenos.
- Docencia y formacion en NLP clinico: el modelo sirve como ejemplo reproducible de ajuste fino sobre PubMedQA y de publicacion de artefactos GGUF, con la advertencia explicita de que no es una herramienta clinica.
- Prototipado offline en entornos con restricciones de red: al ser un artefacto local sin dependencias de API, encaja en laboratorios o aulas donde no se permite el acceso a servicios en la nube.
- Verificacion de integridad de artefactos en pipelines internos: los SHA-256 publicados permiten automatizar la comprobacion de que el fichero descargado es el que el autor evaluo, un control util antes de incorporar el modelo a un banco de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las cifras de evaluacion del modelo se encuentran en la model card del modelo base `biplob123/gemma-4-e2b-grounded-health` y que corresponden al fichero Q4_K_M, pero dichas cifras no se incluyen en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 3,43 GB y el Q8_0 4,97 GB; a estos tamanos hay que anadir la memoria para el contexto KV, no cuantificada en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, ambas variantes caben en GPUs de consumo con 8 GB o mas de VRAM, aunque esta estimacion se deriva del tamano del fichero y no de una recomendacion del autor.
- Cabe en GPU de consumo: si, en principio, con las variantes Q4_K_M y Q8_0 en tarjetas de 8 GB o superiores; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (version `b12421` o superior, empleada en la construccion), Ollama y LM Studio; el autor menciona `llama-server` para la demo local.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de contexto que permitan una comparacion rigurosa con alternativas de la misma categoria. Como referencia estructural, el modelo se situa en el rango de 4,65 mil millones de parametros y compite en el segmento de modelos pequenos ejecutables en local, pero sin cifras de evaluacion no es posible establecer una comparativa fundamentada.

## Limitaciones y advertencias

- El autor declara explicitamente: "Research only, not medical advice. Not for clinical use or personal health decisions." No debe emplearse para diagnostico, tratamiento ni decisiones de salud.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; en dominio biomedico el impacto de una respuesta incorrecta es alto, y no se documentan mecanismos de absteccion o verificacion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no declarados; se desconoce el comportamiento fuera del ingles, idioma probable del corpus PubMedQA.
- Longitud de contexto: no declarada, lo que impide planificar su uso en tareas de contexto largo.
- Licencia: Apache-2.0, pero la etiqueta `research-only` y el aviso de la card generan ambiguedad sobre el uso comercial; conviene revisar el fichero `NOTICE` citado por el autor antes de cualquier despliegue productivo.
- Procedencia y validacion: el repositorio tiene cero descargas y cero likes, y no se aporta informacion sobre el proceso de entrenamiento ni evaluacion independiente; debe tratarse como un artefacto de investigacion no auditado.
- Al ser una cuantizacion, pueden existir diferencias de calidad respecto al modelo base en precision completa; el autor solo garantiza que los benchmarks publicados corresponden al fichero Q4_K_M.

## Enlaces

- Repositorio GGUF: https://huggingface.co/biplob123/gemma-4-e2b-grounded-health-GGUF
- Modelo base: https://huggingface.co/biplob123/gemma-4-e2b-grounded-health
- Ejecucion con Ollama: `ollama run hf.co/biplob123/gemma-4-e2b-grounded-health-GGUF:Q4_K_M`
- Papers, blogs, repositorios y demos adicionales: no disponibles en la informacion proporcionada.
