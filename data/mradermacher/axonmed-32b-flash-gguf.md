# mradermacher/AxonMed-32B-Flash-GGUF

## Resumen

AxonMed-32B-Flash es un modelo de lenguaje especializado en dominio medico y clinico, desarrollado por Saathimed y distribuido en formato GGUF por mradermacher. Con 32.763.876.352 parametros (aproximadamente 32,8 mil millones), esta disenado para tareas de razonamiento clinico, procesamiento de historiales medicos electronicos (EHR), soporte a la decision clinica y respuesta a preguntas de tipo USMLE. El modelo base es `Saathimed/AxonMed-32B-Flash` y esta etiquetado con categorias como `clinical-nlp`, `medical`, `reasoning`, `pubmed` y `open-medical-llm-leaderboard`, lo que indica que el autor lo evalua contra benchmarks medicos abiertos.

Esta ficha concreta corresponde a la version cuantizada publicada por mradermacher, que ofrece un conjunto de cuantizaciones estaticas en formato GGUF (desde Q2_K hasta Q8_0) pensadas para su uso con llama.cpp y entornos de inferencia local. El repositorio ocupa 224 GB e incluye pesos en safetensors ademas de los ficheros GGUF. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion habituales de dicha licencia.

La relevancia actual del modelo reside en la combinacion de un tamano manejable (32B) con especializacion medica y soporte declarado para nueve idiomas (en, zh, es, ru, no, fr, it, pt, de), lo que lo hace candidato para despliegues en entornos sanitarios que requieren inferencia local por motivos de privacidad. No obstante, la informacion publica disponible es limitada: no se detallan la arquitectura exacta, la longitud de contexto ni los resultados de benchmarks en la model card del repositorio GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin confirmar en la informacion proporcionada) |
| Parametros totales | 32.763.876.352 (32,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones con imatrix en repositorio i1-GGUF |
| Idiomas soportados | en, zh, es, ru, no, fr, it, pt, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones), safetensors (pesos originales) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `Saathimed/AxonMed-32B-Flash` en la documentacion proporcionada. Por el numero de parametros y el ecosistema en el que se publica (transformers, llama.cpp), se trata presumiblemente de un transformer decoder-only de aproximadamente 32B, pero este extremo no se confirma explicitamente. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

Lo que si se documenta es la especializacion del modelo: las etiquetas y la descripcion apuntan a un entrenamiento orientado a dominio medico (PubMed, EHR, USMLE, soporte a la decision clinica). El repositorio de cuantizacion indica que se han generado cuantizaciones estaticas con `quantize_version: 2` y `output_tensor_quantised: 1`, y que existe una variante con matrices de importancia (imatrix) en `mradermacher/AxonMed-32B-Flash-i1-GGUF`, lo que sugiere que el autor considero relevante ofrecer cuantizaciones de mayor calidad para modelos de este tamano.

## Capacidades

- Generacion de texto y razonamiento clinico en dominio medico.
- Respuesta a preguntas de estilo USMLE y examenes medicos.
- Procesamiento y razonamiento sobre historiales medicos electronicos (EHR).
- Soporte a la decision clinica (clinical decision support).
- Analisis de literatura biomedica (PubMed).
- Capacidades multilingues en nueve idiomas: ingles, chino, espanol, ruso, noruego, frances, italiano, portugues y aleman.
- Conversacion multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte explicito de tool calling, function calling, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Soporte a la decision clinica en entornos hospitalarios: el modelo puede asistir a profesionales sanitarios en la interpretacion de casos y la recuperacion de evidencia, desplegado localmente para preservar la confidencialidad de los datos de pacientes.
- Procesamiento de historiales medicos electronicos: extraccion y resumen de informacion clinica relevante de registros EHR, aprovechando su especializacion en el dominio.
- Formacion medica y simulacion de examenes: generacion de preguntas y explicaciones de tipo USMLE para estudiantes de medicina y residentes.
- Revision de literatura biomedica: resumen y sintesis de articulos de PubMed para investigadores y equipos de farmacovigilancia.
- Atencion al paciente multilingue: conversaciones informativas en nueve idiomas, util en sistemas sanitarios con poblacion diversa.
- Despliegue en infraestructura propia: gracias a las cuantizaciones GGUF (desde 12,4 GB en Q2_K hasta 34,9 GB en Q8_0), el modelo puede ejecutarse en servidores con GPU consumer o en estaciones de trabajo sin depender de APIs externas, requisito habitual en entornos sanitarios regulados.
- Documentacion clinica asistida: redaccion y estructuración de notas clinicas y resumenes de alta a partir de datos estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo esta etiquetado con `open-medical-llm-leaderboard`, lo que sugiere que el autor lo evalua en dicho leaderboard, pero no se incluyen cifras concretas (MMLU, USMLE, HumanEval, GSM8K u otras) en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~12,4 GB; Q3_K_S ~14,5 GB; Q3_K_M ~16,0 GB; Q3_K_L ~17,3 GB; IQ4_XS ~18,0 GB; Q4_K_S ~18,9 GB; Q4_K_M ~20,0 GB; Q5_K_S ~22,7 GB; Q5_K_M ~23,4 GB; Q6_K ~27,0 GB; Q8_0 ~34,9 GB (tamanos de fichero; la VRAM necesaria es algo superior por el contexto y el overhead de inferencia).
- GPU recomendadas: para Q4_K_M y superiores, GPU con 24 GB o mas (RTX 3090, RTX 4090, A10G, L40S); para Q8_0 y precision completa, A100 40/80 GB o H100.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 o Q5; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con endpoints; los pesos safetensors permiten tambien vLLM y TGI, aunque no se documenta configuracion especifica.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparacion cuantitativa fiable. A continuacion se comparan caracteristicas estructurales con alternativas de tamano similar en el espacio de modelos medicos abiertos, sin afirmar superioridad en calidad:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxonMed-32B-Flash (esta ficha) | 32,8B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en dominio medico, 9 idiomas |
| Meditron-70B | 70B | no disponible | Llama 2 (uso comunitario) | safetensors | Mayor tamano, requiere mas VRAM |
| BioMistral-7B | 7B | no disponible | Apache 2.0 | safetensors, GGUF | Mucho menor, menor coste de despliegue |
| OpenBioLLM-8B | 8B | no disponible | Llama 3 (uso comunitario) | safetensors, GGUF | Menor tamano, orientado a dominio biomedico |

La comparacion de rendimiento real entre estos modelos no puede establecerse con la informacion disponible.

## Limitaciones y advertencias

- No es un dispositivo medico: el modelo no ha sido validado como producto sanitario y no debe usarse como sustituto del juicio clinico profesional.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion medica incorrecta o inventada; en dominio clinico esto es especialmente critico.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni los sesgos demograficos o linguisticos resultantes.
- Contexto e idiomas: la longitud de contexto no esta documentada; el soporte de nueve idiomas se declara pero no se cuantifica su calidad relativa por idioma.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad del cumplimiento normativo sanitario (por ejemplo, RGPD y normativa de productos sanitarios en la UE).
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M pueden degradar notablemente el razonamiento clinico; se recomienda Q4_K_M o superior para uso serio.
- Informacion incompleta: no se publican benchmarks, arquitectura detallada ni datos de entrenamiento, lo que dificulta una evaluacion rigurosa previa a produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AxonMed-32B-Flash-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-32B-Flash
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/AxonMed-32B-Flash-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#AxonMed-32B-Flash-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
