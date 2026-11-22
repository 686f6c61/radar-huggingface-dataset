# mradermacher/GrugCap-27B-GGUF

## Resumen

GrugCap-27B-GGUF es la distribucion en formato GGUF del modelo GrugCap-27B, publicada por el usuario mradermacher, conocido en el ecosistema por generar cuantizaciones estaticas de modelos abiertos. El modelo base, Lasimeri/GrugCap-27B, es un merge construido mediante tecnicas de layer-splice (frankenmerge) a partir de componentes derivados de la familia Qwen 3.5, segun las etiquetas declaradas por el autor. Con 27.320.697.856 parametros totales, se situa en la franja de modelos densos de gran tamano, pensado para ejecucion local en hardware de gama alta mediante llama.cpp y derivados.

La propuesta del modelo se orienta a la eficiencia de tokens y al razonamiento: las etiquetas incluyen "token-efficient" y "reasoning", lo que sugiere un modelo conversacional que busca reducir el numero de tokens necesarios para resolver tareas de razonamiento. Al tratarse de un merge y no de un entrenamiento desde cero, su interes practico reside en la combinacion de capacidades heredadas de sus progenitores y en la disponibilidad de cuantizaciones listas para usar.

Esta ficha cubre la version GGUF de mradermacher, que incluye 12 cuantizaciones estaticas (desde Q2_K hasta Q8_0) y dos variantes del proyector multimodal (mmproj). La licencia Apache 2.0 y la compatibilidad con endpoints facilitan su integracion en infraestructuras propias, aunque la ausencia de benchmarks publicados y de una model card detallada en el repositorio limita la evaluacion rigurosa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen 3.5, construido por layer-splice (frankenmerge); detalles de capas no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | ingles (segun la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 190,8 GB con todas las variantes); pesos originales del modelo base presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

El modelo base es un merge por layer-splice: se combinan capas de modelos progenitores para construir una red de mayor profundidad o anchura sin un entrenamiento completo desde cero. Las etiquetas del repositorio indican que los componentes provienen de la familia Qwen 3.5, lo que implica una arquitectura transformer con atencion por cabeceras y, previsiblemente, mecanismos de razonamiento heredados. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabeceras de atencion ni tipo de activacion del merge final.

No hay datos publicados sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO o ajuste supervisado tras el merge. Tampoco se documentan innovaciones tecnicas propias mas alla de la propia tecnica de layer-splice y de la orientacion declarada a la eficiencia de tokens. La cuantizacion de mradermacher es estatica (quantize_version 2, output_tensor_quantised 1), sin variantes imatrix en este repositorio; las versiones con imatrix se publican en un repositorio separado (GrugCap-27B-i1-GGUF).

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Razonamiento explicito, segun la etiqueta "reasoning"; el formato exacto de modo pensamiento no esta documentado.
- Eficiencia de tokens declarada, orientada a reducir el consumo en tareas de razonamiento.
- Procesamiento multimodal: el repositorio incluye proyectores mmproj en Q8_0 y f16, lo que habilita entrada de imagenes en llama.cpp cuando se combinan con el modelo principal.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; la etiqueta de razonamiento sugiere capacidad, pero sin confirmacion.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte de castellano u otros idiomas.
- Capacidad de ejecucion local en CPU/GPU mediante llama.cpp y compatible con endpoints.

## Casos de uso

- Razonamiento asistido en local: el modelo puede emplearse para resolver problemas de logica o matematicas paso a paso en estaciones de trabajo con GPU de 24 GB o superiores, usando Q4_K_M (16,9 GB) para equilibrar calidad y velocidad.
- Analisis de documentos con imagenes: gracias a los proyectores mmproj incluidos, se puede desplegar un pipeline de OCR asistido o descripcion de capturas en llama.cpp, util para digitalizar documentacion tecnica sin enviar datos a la nube.
- Prototipado de asistentes conversacionales: la etiqueta "conversational" y el formato GGUF permiten montar un chatbot de uso interno con Ollama o llama.cpp en pocos minutos, adecuado para pruebas de concepto antes de invertir en modelos mayores.
- Evaluacion de merges para investigacion: investigadores interesados en tecnicas de layer-splice pueden usar esta cuantizacion para comparar el comportamiento del merge frente a sus progenitores Qwen 3.5 con un coste de hardware contenido.
- Generacion de texto en entornos con requisitos de privacidad: al ejecutarse integramente en hardware propio y con licencia Apache 2.0, encaja en escenarios donde los datos no pueden salir de la organizacion, como borradores de documentacion interna.
- Experimentacion con eficiencia de tokens: equipos que optimizan costes de inferencia pueden medir el consumo de tokens del modelo en tareas de razonamiento y compararlo con alternativas de la misma familia, usando las distintas cuantizaciones para estudiar el impacto en calidad.
- Despliegue en servidores sin GPU dedicada: las variantes Q2_K (11,0 GB) y Q3_K_S (12,4 GB) permiten ejecucion en CPU con RAM suficiente, util para entornos de pruebas o servicios de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas el contexto. Q4_K_M ocupa 16,9 GB, por lo que requiere unos 18-20 GB de VRAM para contexto moderado; Q8_0 (29,1 GB) exige unos 30-32 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K y Q8_0; RTX 3090 (24 GB) tambien vale para Q4_K_M.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 5090 con cuantizaciones Q4 o inferiores; Q2_K y Q3_K_S pueden ejecutarse en CPU con 16 GB de RAM o en GPUs de 12-16 GB con offload parcial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con endpoints. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponibles; dependeran de la GPU, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GrugCap-27B-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | Merge layer-splice de Qwen 3.5; 12 cuantizaciones; multimodal via mmproj |
| Qwen 2.5 32B (Instruct) | 32,5 B | 128 K (segun documentacion del modelo original) | Apache 2.0 | safetensors, GGUF | Referencia de la familia Qwen; benchmarks publicos amplios |
| Gemma 2 27B | 27 B | 8 K | Gemma license | safetensors, GGUF | Tamano comparable; contexto menor y licencia con restricciones de uso |
| Mistral Small 24B | 24 B | 128 K (segun documentacion del modelo original) | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamano similar con benchmarks publicos |

La comparacion con Qwen 2.5 32B y Mistral Small 24B se ofrece como referencia de categoria; no se dispone de datos de rendimiento de GrugCap-27B que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de calidad en MMLU, HumanEval, GSM8K ni otras pruebas, lo que impide validar las etiquetas de razonamiento y eficiencia de tokens.
- Model card practicamente vacia: el repositorio no documenta el proceso de merge, los progenitores exactos, la longitud de contexto ni el formato de prompt, lo que complica la integracion en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado para este merge; la falta de evaluacion agrava la incertidumbre.
- Idiomas: solo se declara ingles; el rendimiento en castellano es desconocido y probablemente degradado.
- Naturaleza de merge: los layer-splice pueden producir artefactos de coherencia, degradacion en contextos largos o comportamientos inconsistentes que no aparecen en modelos entrenados de forma nativa.
- Contexto desconocido: sin dato de ventana de contexto, no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los progenitores del merge no impongan restricciones adicionales; la informacion disponible no detalla la procedencia exacta de todas las capas.
- Soporte multimodal condicionado: los mmproj solo funcionan en runtimes que soporten entrada de vision (llama.cpp reciente); no se garantiza su compatibilidad con todos los clientes.
- Repositorio de 190,8 GB: la descarga completa incluye todas las cuantizaciones; conviene descargar solo el archivo necesario para evitar consumo innecesario de disco y ancho de banda.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GrugCap-27B-GGUF
- Modelo base: https://huggingface.co/Lasimeri/GrugCap-27B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/GrugCap-27B-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#GrugCap-27B-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
