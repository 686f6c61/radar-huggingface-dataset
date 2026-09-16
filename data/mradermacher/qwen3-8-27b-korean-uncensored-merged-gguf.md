# mradermacher/qwen3.8-27b-korean-uncensored-merged-GGUF

## Resumen

qwen3.8-27b-korean-uncensored-merged-GGUF es una recopilacion de cuantizaciones en formato GGUF generada por mradermacher a partir del modelo koreallmdev/qwen3.8-27b-korean-uncensored-merged. No se trata por tanto de un modelo entrenado desde cero, sino de una conversion y cuantizacion del checkpoint original en bf16 a multiples niveles de precision (desde Q2_K hasta f16), pensada para su ejecucion en llama.cpp, Ollama y otros motores compatibles con GGUF. El modelo de partida es un ajuste de la familia Qwen, orientado a conversacion en coreano e ingles y etiquetado por su autor como "uncensored", es decir, con las capas de rechazo y alineacion reducidas o eliminadas.

El recuento real de parametros del checkpoint (26.895.998.464, aproximadamente 26,9 mil millones) lo situa en la franja de modelos densos de gran tamano, ejecutables en GPUs de gama alta para consumo y en GPUs profesionales para cuantizaciones altas. El repositorio ocupa 26,3 GB e incluye las variantes Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS y f16, generadas con quantize_version 2 y conversion desde pesos HuggingFace.

Su relevancia es limitada y muy especifica: cubre el nicho de modelos conversacionales centrados en coreano con contenido sin filtrar, distribuidos en un formato que permite inferencia local sin dependencias de frameworks pesados. La model card no documenta arquitectura, datos de entrenamiento, longitud de contexto, licencia ni resultados de benchmarks, y el repositorio no registra descargas ni valoraciones en el momento de la consulta. Cualquier evaluacion en produccion deberia partir de una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre y las etiquetas apuntan a la familia Qwen, sin confirmacion en la model card) |
| Parametros totales | 26.895.998.464 (26,9 B), dato real de safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 26,3 GB); el modelo base se distribuye en safetensors/bf16 |
| Modelo base | koreallmdev/qwen3.8-27b-korean-uncensored-merged |
| Tipo de cuantizacion | estatica (no hay quants ponderados ni imatrix en el momento de la publicacion) |
| Pipeline | text-generation |
| Repositorio | 26,3 GB, 0 descargas, 0 likes |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base. La nomenclatura del identificador (qwen, qwen3.8, 27b) y las etiquetas del repositorio sugieren una arquitectura transformer decoder-only derivada de la familia Qwen, con 26,9 mil millones de parametros en un unico checkpoint denso, pero la model card original no incluye detalles de configuracion (numero de capas, dimension oculta, cabezas de atencion, tipo de atencion, uso de GQA o MLA). Tampoco se publican datos sobre el entrenamiento: no hay cifra de tokens, composicion del dataset, ni confirmacion de si se aplicaron etapas de RLHF, DPO u otra forma de alineacion. La etiqueta "uncensored" indica precisamente lo contrario de un pipeline de alineacion estandar, pero no se especifica metodologia.

La innovacion tecnica de este repositorio es exclusivamente la cuantizacion. mradermacher aplica el flujo de conversion a GGUF con quantize_version 2 y cuantizacion de tensores de salida (output_tensor_quantised: 1), generando doce niveles de precision. Se trata de quants estaticos: el autor indica explicitamente que los quants ponderados o con imatrix no estaban disponibles en el momento de la publicacion y que podrian no planificarse. En la model card se marca Q4_K_S como "fast, recommended" y se incluye la conocida grafica comparativa de ikawrakow sobre perplejidad de quants de baja calidad, junto con las notas de Artefact2 sobre el tema.

## Capacidades

- Generacion de texto conversacional en coreano e ingles: es la funcion declarada por el pipeline text-generation y por los idiomas etiquetados.
- Conversacion multi-turno: las etiquetas del repositorio incluyen "conversational", lo que indica formato de dialogo.
- Generacion sin filtros de rechazo: el modelo base esta etiquetado como "uncensored", de modo que tiende a responder a peticiones que un modelo alineado rechazaria.
- Traduccion y generacion cruzada coreano-ingles: derivada de la cobertura bilingue declarada, sin evaluacion publicada.
- Razonamiento, codigo y matematicas: no confirmado en la informacion disponible.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo thinking o razonamiento explicito: no confirmado en la informacion disponible.
- Vision o audio: no disponible; el repositorio no incluye proyector multimodal (skip_mmproj sin valor).
- Capacidades multilingues adicionales: no disponible; solo ko y en estan declarados.

## Casos de uso

- Asistente conversacional en coreano para atencion al cliente: el modelo puede mantener dialogos multi-turno en ko con un despliegue local en llama.cpp u Ollama, sin enviar datos a servicios externos. Requiere validar previamente la longitud de contexto, no documentada.
- Traduccion coreano-ingles en pipelines internos: al ser un modelo bilingue ko/en, encaja en flujos de traduccion por lotes donde la latencia no es critica y se prefiere ejecucion on-premise por motivos de confidencialidad.
- Redaccion y reescritura de contenidos en coreano: generacion de borradores, resumenes y variaciones de tono para equipos de marketing o documentacion que trabajan con contenido coreano.
- Investigacion sobre alineacion y seguridad: al tratarse de un modelo "uncensored" con cuantizaciones de baja precision disponibles, resulta util como sujeto de estudio en trabajos sobre jailbreaking, tasas de rechazo y degradacion de comportamiento tras cuantizacion agresiva.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce niveles de precision del mismo checkpoint, lo que permite medir el impacto de Q2_K frente a Q8_0 en perplejidad y calidad de respuesta sobre el mismo modelo base.
- Despliegue en estaciones de trabajo sin GPU dedicada de gran memoria: con Q2_K (10,8 GB) o Q4_K_S (15,7 GB) el modelo puede ejecutarse parcialmente en CPU mediante offload de capas, util para prototipado y pruebas internas.
- Generacion de datos sinteticos en coreano: produccion de corpus sinteticos para ajuste fino de modelos mas pequenos, con la salvedad de que debe filtrarse la salida por sesgos y contenido no deseado.
- Personajes y roleplay en aplicaciones de entretenimiento: el caracter sin filtros y el soporte bilingue lo hacen adecuado para dialogos de ficcion, con las advertencias legales y de moderacion correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye MMLU, HumanEval, GSM8K, KMMLU ni ninguna otra metrica, y tampoco se aportan mediciones de perplejidad comparando los distintos niveles de cuantizacion. Los resultados de busqueda web disponibles no contienen informacion relevante sobre el modelo. Cualquier cifra de rendimiento deberia obtenerse mediante evaluacion propia.

## Requisitos de hardware

Los tamanos de Q2_K (10,8 GB) y Q4_K_S (15,7 GB) estan confirmados en la model card. El resto de la tabla son estimaciones calculadas a partir del recuento real de parametros (26,9 B) y de los bits por peso habituales de cada tipo de quant; no son mediciones publicadas.

| Cuantizacion | Peso estimado | VRAM recomendada (pesos + cache + overhead) |
|---|---|---|
| Q2_K | 10,8 GB (confirmado) | ~12-14 GB |
| Q3_K_S / Q3_K_M / Q3_K_L | ~12,5 / 13,7 / 14,8 GB (estimado) | ~15-18 GB |
| IQ4_XS | ~14,5 GB (estimado) | ~17-19 GB |
| Q4_K_S | 15,7 GB (confirmado) | ~18-20 GB |
| Q4_K_M | ~16,8 GB (estimado) | ~20-22 GB |
| Q5_K_S / Q5_K_M | ~18,3 / 19,2 GB (estimado) | ~22-25 GB |
| Q6_K | ~22,1 GB (estimado) | ~25-28 GB |
| Q8_0 | ~28,6 GB (estimado) | ~32-36 GB |
| f16 | ~53,8 GB (estimado) | ~58-64 GB |

- Cabe en GPU de consumo: si. RTX 3090, RTX 4090 y RTX 5090 (24-32 GB) admiten Q4_K_S y Q4_K_M con contexto moderado; RTX 4080, 4070 Ti Super y tarjetas de 16 GB admiten Q2_K y, con offload parcial, Q3_K_M.
- GPU profesionales recomendadas: A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB y RTX 6000 Ada 48 GB para Q6_K, Q8_0 y f16.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llamafile, text-generation-webui y otros motores compatibles con GGUF. El modelo base en safetensors puede servirse con transformers, y opcionalmente con vLLM si se convierte a un formato soportado por el motor.
- Latencia y throughput: no disponibles. Dependen del nivel de cuantizacion, del hardware y de la longitud de contexto, que no esta documentada. Como referencia cualitativa, el autor clasifica Q4_K_S como "fast, recommended", pero no aporta cifras.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica y no de la informacion proporcionada en esta busqueda; se incluyen como orientacion y deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-27b-korean-uncensored-merged (GGUF) | 26,9 B | no disponible | ko, en | no disponible | GGUF, 12 cuantizaciones, 0 descargas |
| Qwen2.5-32B-Instruct | ~32,5 B | 128 K (segun documentacion publica) | multilingue | Apache 2.0 (segun documentacion publica) | safetensors y GGUF de terceros |
| Gemma-2-27B-it | ~27 B | 8 K (segun documentacion publica) | principalmente ingles | Gemma Terms (segun documentacion publica) | safetensors y GGUF de terceros |
| EXAONE-3.5-32B-Instruct | ~32 B | 32 K (segun documentacion publica) | coreano, ingles | licencia de investigacion de LG AI Research (segun documentacion publica) | safetensors |

Frente a estas alternativas, el modelo aqui descrito destaca unicamente por su orientacion al coreano sin filtros y por la amplitud de cuantizaciones GGUF disponibles. Carece de licencia declarada, de benchmarks y de contexto documentado, por lo que no es comparable en trazabilidad con Qwen2.5, Gemma-2 o EXAONE.

## Limitaciones y advertencias

- Licencia no disponible: sin terminos declarados, no hay base juridica clara para uso comercial. Debe contactarse con el autor del modelo base antes de cualquier despliegue productivo.
- Modelo "uncensored": la reduccion de capas de rechazo implica mayor probabilidad de generar contenido ofensivo, ilegal, peligroso o sexualmente explicito. Requiere moderacion externa obligatoria en cualquier aplicacion expuesta a usuarios.
- Sesgos: no hay evaluacion de sesgos publicada. Un ajuste centrado en coreano puede arrastrar sesgos culturales y de representacion del corpus de entrenamiento, que no esta documentado.
- Alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad. Es esperable un comportamiento similar al de otros modelos de 27 B de su generacion, sin garantia.
- Contexto no documentado: se desconoce la longitud de contexto soportada, lo que impide dimensionar la cache KV y planificar despliegues con precision.
- Idiomas limitados: solo coreano e ingles declarados. El rendimiento en castellano no esta evaluado ni garantizado.
- Degradacion por cuantizacion: Q2_K y Q3_K reducen notablemente la calidad respecto a Q4_K_M o superior. Los quants ponderados o con imatrix no estaban disponibles, y el autor advierte que podrian no publicarse.
- Cobertura de la comunidad nula: 0 descargas y 0 likes en el momento del analisis, sin issues ni evaluaciones de terceros que permitan contrastar el comportamiento real.
- Arquitectura y entrenamiento sin documentar: no se puede verificar si el modelo base respeta restricciones de uso derivadas de su modelo origen, ni auditar la composicion del dataset.
- Fechas de publicacion anomalas en los metadatos (creacion y actualizacion en septiembre de 2026), lo que sugiere datos inconsistentes en el repositorio y aconseja precaucion adicional.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen3.8-27b-korean-uncensored-merged-GGUF
- Modelo base: https://huggingface.co/koreallmdev/qwen3.8-27b-korean-uncensored-merged
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#qwen3.8-27b-korean-uncensored-merged-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
