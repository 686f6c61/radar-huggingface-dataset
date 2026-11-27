# mradermacher/KuroPhysics-Sim-7B-i1-GGUF

## Resumen

KuroPhysics-Sim-7B-i1-GGUF es la version cuantizada en formato GGUF del modelo engenho-ai/KuroPhysics-Sim-7B, un modelo de lenguaje de aproximadamente 7.615 millones de parametros (7,6B) desarrollado por engenho-ai como parte de la linea Kuro. El autor de la cuantizacion es mradermacher, especialista en generar versiones GGUF optimizadas mediante tecnicas de imatrix para su uso en llama.cpp y otros entornos de inferencia local. El modelo base esta orientado a tareas de fisica, robotica y simulacion, segun indican sus etiquetas y su pipeline declarado (robotics).

La relevancia de esta ficha reside en que ofrece una via practica para ejecutar un modelo especializado de 7,6B en hardware de consumo: las cuantizaciones van desde IQ1_M (2,1 GB) hasta Q6_K (6,4 GB), lo que permite desplegarlo en GPUs consumer con 8-12 GB de VRAM o incluso en CPU. El modelo base se publica bajo licencia Apache 2.0, lo que facilita su uso comercial, y soporta los idiomas portugues e ingles.

No se dispone de informacion detallada sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada; estos datos se marcan como "no disponible" en las secciones correspondientes. La ficha se centra en lo que si es verificable: especificaciones declaradas, cuantizaciones disponibles y consideraciones de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (deducido de la libreria transformers; detalles no disponibles) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (imatrix); versiones estaticas en repo separado |
| Idiomas soportados | Portugues (pt), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base engenho-ai/KuroPhysics-Sim-7B mas alla de que se distribuye para la libreria transformers y que cuenta con 7.615.616.512 parametros. No se especifica si emplea atencion estandar, atencion lineal, mezcla de expertos u otra variante; por el tamano y la nomenclatura (7B) se trata presumiblemente de un transformer denso, pero este dato no esta confirmado. Tampoco se indica la longitud de contexto nativa ni el numero de tokens de entrenamiento.

Respecto al entrenamiento, la model card del autor de la cuantizacion no incluye informacion sobre la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa. Lo unico verificable es el proceso de cuantizacion: mradermacher ha generado las versiones GGUF mediante cuantizacion con fichero imatrix (KuroPhysics-Sim-7B.imatrix.gguf), una tecnica que mejora la calidad de las cuantizaciones de baja y media precision respecto a las cuantizaciones estaticas convencionales. Las versiones estaticas sin imatrix estan disponibles en un repositorio separado.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" sugiere un ajuste para dialogos multi-turno.
- Dominio especializado en fisica, robotica y simulacion, segun las etiquetas del modelo.
- Soporte bilingue portugues e ingles.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se documenta soporte explicito de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo thinking.
- No se documentan capacidades especiales de codigo o matematicas mas alla de lo implicito en el dominio de fisica.

## Casos de uso

- Simulacion fisica asistida por lenguaje: el modelo puede emplearse para generar descripciones, parametros o explicaciones de escenarios fisicos en entornos de investigacion, dado su enfoque declarado en fisica y simulacion.
- Documentacion tecnica de robotica: redaccion y resumen de especificaciones de robots, procedimientos de calibracion o notas de laboratorio en portugues o ingles.
- Asistente de laboratorio conversacional: atencion de consultas multi-turno sobre conceptos de fisica o robotica gracias a su ajuste conversacional.
- Prototipado local en hardware de consumo: con cuantizaciones de 4,6-4,8 GB (Q4_K_S/Q4_K_M) puede ejecutarse en una RTX 4060 Ti de 8 GB o similar para pruebas offline sin conexion.
- Educacion y divulgacion cientifica: generacion de explicaciones didacticas de fenomenos fisicos en portugues para estudiantes lusofonos.
- Integracion en pipelines de investigacion: uso como componente de generacion de texto en flujos de simulacion donde se requiera un modelo ligero y de licencia permisiva (Apache 2.0).
- Despliegue en entornos con recursos limitados: la version IQ2_M (2,9 GB) permite ejecucion en CPU o GPUs de gama baja para tareas de generacion no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): aproximadamente 2,5 GB para IQ1_M, 3,5 GB para IQ2_M/Q2_K, 4-5 GB para IQ3, 5,5-6 GB para Q4_K_M, 7-8 GB para Q6_K.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU consumer: si, desde una GTX 1660 6 GB (con cuantizaciones IQ2/IQ3) hasta una RTX 4090 24 GB (con Q6_K y contexto amplio).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI usando los pesos safetensors originales.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas directamente comparables en la informacion proporcionada. Como referencia estructural, se puede comparar con otros modelos de ~7B cuantizados en GGUF por el mismo autor, si bien las cifras de calidad no estan verificadas:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| KuroPhysics-Sim-7B-i1-GGUF | 7,6B | no disponible | Apache 2.0 | GGUF |
| Mistral-7B-Instruct (GGUF) | 7,2B | 32k (segun version) | Apache 2.0 | GGUF |
| Llama-3.1-8B-Instruct (GGUF) | 8,0B | 128k | Llama 3.1 Community | GGUF |
| Qwen2.5-7B-Instruct (GGUF) | 7,6B | 128k | Apache 2.0 | GGUF |

La comparacion de rendimiento con estas alternativas no puede establecerse sin benchmarks publicados; se indica "no disponible".

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo; el modelo podria reflejar sesgos presentes en sus datos de entrenamiento, no documentados.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 7B, especialmente en dominios tecnicos como fisica y robotica donde las respuestas erroneas pueden tener consecuencias.
- Idiomas limitados a portugues e ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Longitud de contexto desconocida; no se debe asumir una ventana amplia sin verificacion previa.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero conviene revisar los terminos del modelo original y de las dependencias.
- Las cuantizaciones de muy baja precision (IQ1_M, Q2_K_S) degradan notablemente la calidad; el propio autor las marca como "mostly desperate" o "very low quality".
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- No hay garantias de soporte ni mantenimiento por parte del autor de la cuantizacion.

## Enlaces

- Repositorio Hugging Face (cuantizacion): https://huggingface.co/mradermacher/KuroPhysics-Sim-7B-i1-GGUF
- Modelo base: https://huggingface.co/engenho-ai/KuroPhysics-Sim-7B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/KuroPhysics-Sim-7B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#KuroPhysics-Sim-7B-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
