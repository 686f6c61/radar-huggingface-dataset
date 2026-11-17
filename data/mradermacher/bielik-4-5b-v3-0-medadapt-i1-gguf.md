# mradermacher/Bielik-4.5B-v3.0-medadapt-i1-GGUF

## Resumen

Bielik-4.5B-v3.0-medadapt-i1-GGUF es una cuantizacion en formato GGUF del modelo jmajkutewicz/Bielik-4.5B-v3.0-medadapt, un modelo de lenguaje en polaco especializado en dominio medico mediante adaptacion de dominio sobre la base Bielik 4.5B v3.0. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF, que publica tanto cuantizaciones estaticas como cuantizaciones con imatrix (i1) para distintos niveles de compresion. El modelo resuelve el problema de ejecutar un LLM polaco de dominio sanitario en hardware modesto, sin necesidad de GPU de datacenter.

Con 4.757.260.288 parametros totales y un repositorio de 53,5 GB que alberga todas las variantes de cuantizacion, el modelo esta pensado para inferencia local en CPU o GPU de consumo mediante llama.cpp y derivados. La licencia es "other", heredada del modelo upstream, con terminos adicionales ligados a los datos de entrenamiento, lo que obliga a revisar las condiciones antes de un uso comercial.

La relevancia actual del modelo radica en su nicho: modelos pequenos y especializados en un idioma minoritario como el polaco, con adaptacion al dominio medico, son escasos y dificiles de desplegar. Esta cuantizacion facilita probar el modelo en entornos con poca VRAM, algo critico para prototipos clinicos o de investigacion en instituciones con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo transformer, no confirmado en la informacion) |
| Parametros totales | 4.757.260.288 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; ademas se ofrecen cuantizaciones estaticas en mradermacher/Bielik-4.5B-v3.0-medadapt-GGUF |
| Idiomas soportados | pl (polaco) |
| Licencia | other (upstream-and-data-terms; ver README del modelo base) |
| Formato de pesos | GGUF (con fichero imatrix adicional para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Bielik-4.5B-v3.0-medadapt mas alla de su naturaleza transformer y su procedencia del linaje Bielik. No se especifican el numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea tecnicas como GQA o atencion lineal. Tampoco se documenta el proceso de entrenamiento: no hay datos sobre el volumen de tokens, la composicion del corpus medico, ni si se aplicaron fases de RLHF, DPO o instruccion tuning.

Lo que si se conoce es el proceso de cuantizacion aplicado por mradermacher: se generan cuantizaciones con imatrix (denominadas i1), que emplean una matriz de importancia calculada sobre un corpus de calibracion para reducir la perdida de calidad en niveles de compresion agresivos. El repositorio incluye el fichero imatrix (0,1 GB) por si el usuario quiere producir sus propias variantes. Se ofrecen tanto cuantizaciones IQ (basadas en importance matrix con cuantizacion de pesos no uniforme) como K-quants clasicos, cubriendo desde IQ1_S (1,1 GB) hasta Q6_K (4,0 GB).

## Capacidades

- Generacion de texto conversacional en polaco, orientada a dominio medico segun la adaptacion del modelo base.
- Especializacion en terminologia y registro clinico-sanitario derivada de la adaptacion de dominio (medical, domain-adaptation en los tags).
- Capacidad conversacional multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere que puede servirse mediante APIs compatibles con OpenAI.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Cobertura multilingue limitada al polaco segun el campo language del modelo.

## Casos de uso

- Asistencia documental clinica en polaco: resumen y reescritura de informes medicos, con el modelo ejecutandose en local para mantener la confidencialidad de datos de pacientes, aprovechando su adaptacion al dominio sanitario.
- Prototipado de chatbots de triaje o informacion sanitaria en polaco: el tamano de 4,5B y las cuantizaciones de 2,8-3,5 GB permiten desplegar el modelo en una estacion de trabajo con GPU de consumo para validar flujos conversacionales antes de escalar.
- Investigacion en PLN medico: generacion de datos sinteticos o aumentacion de corpus clinicos en polaco, con la ventaja de que el modelo corre en CPU o GPU modesta y se puede iterar rapidamente.
- Educacion y formacion sanitaria: generacion de preguntas de autoevaluacion y explicaciones de conceptos medicos en polaco, con la salvedad de que la salida debe ser revisada por profesionales.
- Despliegue en entornos con recursos limitados: hospitales o universidades sin acceso a GPUs de datacenter pueden servir el modelo con llama.cpp u Ollama en cuantizacion Q4_K_M (3,0 GB) sobre hardware de gama media.
- Traduccion y adaptacion de textos sanitarios del polaco a otros idiomas (y viceversa) como paso previo a revision humana, usando el modelo como borrador especializado en registro clinico.
- Filtrado y clasificacion de documentacion medica: el modelo puede etiquetar o resumir grandes volumenes de textos clinicos en polaco en pipelines por lotes, dado su bajo coste de inferencia en cuantizaciones pequenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1-1,2 GB para IQ1_S/IQ1_M (calidad muy degradada); 2,0-2,6 GB para IQ3_XXS a Q3_K_L; 2,7-3,1 GB para IQ4_XS a Q4_1; 3,4-4,0 GB para Q5_K_S a Q6_K. Hay que sumar el overhead del contexto y del runtime (tipicamente 0,5-1,5 GB adicionales segun longitud de contexto).
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM es suficiente para las cuantizaciones de calidad media (Q4_K_M, Q5_K_M); una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 permiten ejecutar Q6_K con contexto amplio.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM para cuantizaciones Q4, y en GPU de 8 GB para Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con endpoints (el tag endpoints_compatible sugiere integracion con APIs tipo OpenAI). Para el modelo base en safetensors, transformers. vLLM y TGI no estan confirmados para este formato GGUF concreto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Bielik-4.5B-v3.0-medadapt-i1-GGUF (este) | 4,76B | no disponible | pl | other (upstream-and-data-terms) | GGUF |
| Bielik-4.5B-v3.0-medadapt (base, safetensors) | 4,76B | no disponible | pl | other (upstream-and-data-terms) | safetensors |
| Bielik-4.5B-v3.0-medadapt-GGUF (cuantizaciones estaticas) | 4,76B | no disponible | pl | other (upstream-and-data-terms) | GGUF |

No se dispone de datos de benchmarks ni de modelos comparables de otros autores en la informacion proporcionada para establecer una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo especializado en polaco: su utilidad fuera de ese idioma es muy limitada y no se ha validado su comportamiento en castellano.
- Adaptacion al dominio medico: no sustituye el juicio clinico. Cualquier salida en contexto sanitario debe ser revisada por profesionales; el riesgo de alucinacion en terminologia medica es relevante.
- Cuantizaciones muy agresivas (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor advierte "for the desperate" o "very low quality" en varias de ellas. Para produccion se recomienda Q4_K_M o superior.
- Licencia "other" con terminos upstream y de datos: es imprescindible revisar el README del modelo base (jmajkutewicz/Bielik-4.5B-v3.0-medadapt) antes de cualquier uso comercial, ya que puede haber restricciones derivadas de los datos de entrenamiento.
- No se documentan la longitud de contexto ni el proceso de entrenamiento, lo que dificulta evaluar su idoneidad para tareas de contexto largo.
- El repositorio incluye 53,5 GB de cuantizaciones; conviene descargar solo la variante necesaria para evitar consumo innecesario de almacenamiento.
- No hay evidencia publicada de benchmarks que respalden el rendimiento del modelo en tareas estandar; la evaluacion debe hacerse mediante pruebas propias en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Bielik-4.5B-v3.0-medadapt-i1-GGUF
- Modelo base: https://huggingface.co/jmajkutewicz/Bielik-4.5B-v3.0-medadapt
- Licencia del modelo base: https://huggingface.co/jmajkutewicz/Bielik-4.5B-v3.0-medadapt/blob/main/README.md#license
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Bielik-4.5B-v3.0-medadapt-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Bielik-4.5B-v3.0-medadapt-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5
