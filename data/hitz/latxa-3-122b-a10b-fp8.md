# HiTZ/Latxa-3-122B-A10B-FP8

## Resumen

Latxa-3-122B-A10B-FP8 es la version cuantizada a FP8 de Latxa 3, el mayor modelo de lenguaje para euskera desarrollado hasta la fecha por el centro HiTZ y el grupo IXA de la Universidad del Pais Vasco (UPV/EHU). Se construye sobre Qwen3.5-122B-A10B, un transformer de tipo Mixture-of-Experts con 122.562 millones de parametros totales y aproximadamente 10.000 millones activos por token, adaptado al euskera mediante la metodologia descrita por Sainz et al. (2025). El modelo es multimodal (image-text-to-text), sigue instrucciones y mantiene conversaciones en euskera, comprende imagenes y razona antes de responder, aunque solo soporta el modo de razonamiento (thinking mode).

La relevancia de esta ficha radica en dos factores. Primero, cubre una lengua de bajos recursos que queda fuera del foco de la mayoria de desarrolladores de modelos, ofreciendo un rendimiento en euskera muy superior al de modelos genericos entrenados mayoritariamente en ingles. Segundo, la cuantizacion FP8 dinamica reduce el peso de los pesos a aproximadamente 125 GB, lo que permite servir el modelo en 2x A100 80GB o en una unica H200 de 141 GB, un requisito de hardware mucho mas asequible que el de la version BF16.

La ventana de contexto alcanza los 262.144 tokens, la licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors con el esquema `compressed-tensors` de llm-compressor, compatible de forma nativa con vLLM. El modelo esta pensado para despliegues de produccion en euskera que requieran razonamiento, comprension de imagenes y contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (256 expertos, 8 enrutados + 1 compartido por token), multimodal vision-language, con atencion lineal hibrida |
| Parametros totales | 122.562.817.776 (~122,6B) |
| Parametros activos | ~10B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 dinamico (`FP8_DYNAMIC`, formato `compressed-tensors`); pesos FP8 simetricos per-channel, activaciones FP8 simetricas per-token; `lm_head`, embeddings, gates del router MoE, `conv1d`/`in_proj_a`/`in_proj_b` de atencion lineal, encoder de vision y proyeccion MTP se mantienen en BF16 |
| Idiomas soportados | Euskera (eu) como foco; ingles (en) y otros idiomas del modelo base retenidos pero no adaptados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (esquema `compressed-tensors` FP8) |

## Arquitectura y entrenamiento

Latxa 3 se construye sobre Qwen3.5-122B-A10B, un modelo Mixture-of-Experts con 256 expertos en total, de los cuales 8 se enrutan mas 1 compartido por token, lo que da lugar a unos 10.000 millones de parametros activos sobre un total de 122.562 millones. La arquitectura combina capas de atencion con atencion lineal (con parametros `conv1d`, `in_proj_a` e `in_proj_b`) y un encoder de vision que habilita la entrada image-text-to-text. Incorpora ademas una proyeccion MTP (multi-token prediction), lo que sugiere soporte de decodificacion especulativa en el pipeline de inferencia. La adaptacion al euskera sigue la metodologia de Sainz et al. (2025), publicada en EMNLP 2025, y se apoya en el corpus HiTZ/latxa-corpus-v2.

La cuantizacion se realizo con llm-compressor en esquema `FP8_DYNAMIC`: los pesos se cuantizan a FP8 simetrico por canal de forma estatica y las activaciones a FP8 simetrico por token de forma dinamica, mientras que componentes sensibles a la precision (`lm_head`, embeddings, gates del router MoE, parametros de atencion lineal, encoder de vision y proyeccion MTP) permanecen en BF16. Esta combinacion reduce aproximadamente a la mitad el uso de memoria respecto a BF16 (~125 GB de pesos) y preserva la calidad en las partes mas criticas del modelo. El modelo solo soporta el modo de razonamiento (thinking mode): genera un razonamiento interno antes de la respuesta final. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni de si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno en euskera, con instrucciones y respuestas coherentes en registro formal (batua).
- Razonamiento explicito mediante thinking mode: el modelo produce una cadena de razonamiento antes de la respuesta; no se soporta el modo sin razonamiento.
- Comprension de imagenes (image-text-to-text) gracias al encoder de vision del modelo base.
- Razonamiento matematico y resolucion de problemas de opcion multiple, evaluado en EusExams v2 y MMLU-Pro-eus.
- Conocimiento cultural local y global, con resultados especificos en el benchmark BertaQA para preguntas de cultura vasca y general.
- Traduccion bidireccional euskera-ingles y euskera-espanol, evaluada en FLORES y ALIA DocMT.
- Capacidades multilingues: el euskera es el foco, pero se retienen las capacidades del modelo base en ingles y otros idiomas.
- Soporte de contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en euskera: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 262.144 tokens, lo que permite mantener el historial completo de un cliente y consultar documentacion de producto extensa en la misma sesion, respondiendo en batua normativo.
- Traduccion profesional eu-en y eu-es: con chrF de 61,4 (eu-en) y 51,1 (eu-es) en FLORES, y de 67,3 (eu-en) y 73,6 (eu-es) en ALIA DocMT, el modelo es adecuado para traduccion de documentacion tecnica y administrativa, especialmente en pares con espanol en documentos largos.
- Generacion de contenido administrativo y educativo en euskera: redaccion de circulares, materiales didacticos y examenes, apoyandose en el rendimiento en EusExams v2 (84,9 de accuracy) y en las normas de batua (BAT, 81,8).
- Asistencia documental multimodal: al aceptar image-text-to-text, puede procesar capturas de pantalla, formularios escaneados o graficos junto con texto en euskera, util para digitalizacion de archivos y extraccion de informacion.
- Evaluacion y correccion automatica de textos en euskera: con EusProficiency (82,4) y EusReading (87,8) como referencia, el modelo puede clasificar el nivel de competencia linguistica y detectar errores de normativa en textos de estudiantes o candidatos.
- Sistemas de pregunta-respuesta sobre conocimiento cultural: con 85,8 de accuracy en preguntas locales de opcion multiple en euskera (BertaQA), es adecuado para asistentes turisticos, educativos o de patrimonio cultural vasco.
- Investigacion en PLN para lenguas de bajos recursos: sirve como modelo de referencia para experimentos de adaptacion linguistica y evaluacion de modelos multilingues en euskera, con licencia Apache 2.0 que facilita su uso academico y comercial.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo. La model card indica que los resultados se obtuvieron con los pesos BF16, no con la version FP8.

| Benchmark | Metrica | Resultado |
|---|---|---|
| EusProficiency | Accuracy | 82,4 |
| EusReading | Accuracy | 87,8 |
| BAT (normas de batua) | Accuracy | 81,8 |
| EusExams v2 | Accuracy | 84,9 |
| EusTrivia | Accuracy (opcion multiple) | 87,8 |
| EusTrivia | Accuracy (abierta, juez LLM) | 63,5 |
| MMLU-Pro-eus | Accuracy (opcion multiple) | 77,2 |
| MMLU-Pro-eus | Accuracy (abierta, juez LLM) | 68,5 |
| BertaQA local, opcion multiple, euskera | Accuracy | 85,8 |
| BertaQA local, opcion multiple, ingles | Accuracy | 83,6 |
| BertaQA local, abierta, euskera | Accuracy | 60,3 |
| BertaQA local, abierta, ingles | Accuracy | 51,1 |
| BertaQA global, opcion multiple, euskera | Accuracy | 94,4 |
| BertaQA global, opcion multiple, ingles | Accuracy | 93,3 |
| BertaQA global, abierta, euskera | Accuracy | 77,2 |
| BertaQA global, abierta, ingles | Accuracy | 78,5 |
| FLORES | chrF eu-en | 61,4 |
| FLORES | chrF en-eu | 60,2 |
| FLORES | chrF eu-es | 51,1 |
| FLORES | chrF es-eu | 54,5 |
| ALIA DocMT | chrF eu-en | 67,3 |
| ALIA DocMT | chrF en-eu | 65,6 |
| ALIA DocMT | chrF eu-es | 73,6 |
| ALIA DocMT | chrF es-eu | 73,4 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 125 GB de pesos en FP8; el autor indica que el modelo cabe en 2x A100 80GB (configuracion usada por el equipo) o en una unica H200 de 141 GB.
- GPU recomendadas: 2x NVIDIA A100 80GB con tensor parallelism de 2 y expert parallelism habilitado; alternativa de una sola NVIDIA H200 (141 GB).
- GPU de consumo: no cabe en GPUs consumer (RTX 4090, 3090, etc.) por el tamano de los pesos en FP8; se requeriria cuantizacion adicional a 4 bits y aun asi el modelo completo no es viable en una sola GPU consumer.
- Opciones de despliegue: vLLM es la opcion recomendada por el autor, con soporte nativo del formato `compressed-tensors` FP8 y configuracion `--tensor-parallel-size 2 --enable-expert-parallel`. No se indica soporte de llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas foco | Licencia | Formato |
|---|---|---|---|---|---|
| Latxa-3-122B-A10B-FP8 | 122,6B totales / ~10B activos | 262.144 | Euskera, ingles | Apache 2.0 | safetensors FP8 |
| Latxa-3-122B-A10B (BF16) | 122,6B totales / ~10B activos | 262.144 | Euskera, ingles | Apache 2.0 | safetensors BF16 |
| Qwen3.5-122B-A10B (modelo base) | 122B totales / ~10B activos | no disponible | Multilingue general | no disponible en la informacion | no disponible |

La comparacion con modelos de la misma categoria (LLM para lenguas de bajos recursos o modelos MoE de ~100B) no puede completarse con los datos proporcionados: no se dispone de resultados de benchmarks de Latxa-3 en BF16 ni de Qwen3.5-122B-A10B para contrastar, ni de otros modelos especializados en euskera de tamano comparable. La unica comparacion directa posible es con la version BF16 del propio modelo, de la que esta ficha es la variante cuantizada.

## Limitaciones y advertencias

- Solo se soporta el modo de razonamiento (thinking mode); no hay modo de respuesta directa sin cadena de pensamiento, lo que incrementa la latencia y el consumo de tokens de salida.
- El foco es el euskera; el rendimiento en otros idiomas distintos del ingles no esta garantizado y puede degradarse respecto al modelo base.
- Riesgo de alucinacion inherente a los LLM, especialmente en preguntas abiertas: en EusTrivia la precision abierta (63,5) es muy inferior a la de opcion multiple (87,8), lo que sugiere menor fiabilidad en generacion libre.
- Los resultados de benchmarks fueron obtenidos con los pesos BF16, no con la version FP8; la cuantizacion puede introducir una degradacion adicional no cuantificada en la informacion disponible.
- Los resultados del model-index estan marcados como no verificados (`verified: false`).
- No se dispone de informacion sobre sesgos conocidos, composicion del dataset de entrenamiento ni etapas de alineacion (RLHF/DPO).
- El uso comercial esta permitido por la licencia Apache 2.0, pero conviene revisar las condiciones del modelo base Qwen3.5-122B-A10B, cuya licencia no se detalla en la informacion proporcionada.
- El despliegue requiere hardware de gama alta (2x A100 80GB o 1x H200); no es viable en GPUs de consumo.
- No se dispone de informacion sobre soporte de tool calling, function calling ni uso en agentes, lo que limita su evaluacion para pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HiTZ/Latxa-3-122B-A10B-FP8
- Modelo base BF16: https://huggingface.co/HiTZ/Latxa-3-122B-A10B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Demo interactiva: https://latxa.hitz.eus
- Logo del modelo: https://latxa.hitz.eus/latxa_3_logo.svg
- Paper de metodologia (Sainz et al., 2025, EMNLP): https://aclanthology.org/2025.emnlp-main.1484/
- Dataset de adaptacion: https://huggingface.co/datasets/HiTZ/latxa-corpus-v2
- Herramienta de cuantizacion (llm-compressor): https://github.com/vllm-project/llm-compressor
- Motor de inferencia recomendado (vLLM): https://github.com/vllm-project/vllm
- Contacto: hitz@ehu.eus
