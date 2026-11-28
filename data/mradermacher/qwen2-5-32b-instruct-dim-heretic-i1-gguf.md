# mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF

## Resumen

Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF es una cuantizacion en formato GGUF, generada con imatrix (i1), del modelo richardyoung/Qwen2.5-32B-Instruct-DiM-heretic, que a su vez deriva del Qwen2.5-32B-Instruct de Alibaba. El modelo base es un transformer denso de 32.763.876.352 parametros (aproximadamente 32,8 mil millones), ajustado para eliminar los mecanismos de rechazo ("refusal-removed") mediante tecnicas de abliteration/decensoring, orientado a investigacion en seguridad de IA y red-teaming. Esta publicacion concreta la realiza mradermacher, un cuantizador habitual de la comunidad, y ofrece el modelo en multiples niveles de cuantizacion GGUF para su uso con llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que combina tres elementos: el rendimiento del Qwen2.5-32B-Instruct original, la modificacion "heretic" que elimina las negativas del modelo a responder, y el formato GGUF con cuantizaciones que van desde 7,4 GB (IQ1_S) hasta tamanos superiores, lo que permite ejecutar un modelo de 32B en hardware de consumo con cuantizaciones agresivas. El repositorio ocupa 351,5 GB en total por incluir todas las variantes.

Es importante senalar que el modelo esta pensado exclusivamente para ingles (language: en en la model card) y que el acceso al modelo base en Hugging Face esta sujeto a un formulario de acceso restringido (gated) con declaracion de uso licito. La licencia declarada es Apache 2.0, heredada del Qwen2.5 original, aunque la model card del autor base menciona tambien openrail++ en las etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 (aproximadamente 32,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el Qwen2.5-32B-Instruct base soporta 131.072 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_NL (small), Q5_K_S, Q5_K_M, Q6_K, entre otras |
| Idiomas soportados | Ingles (language: en) |
| Licencia | Apache 2.0 (con etiqueta openrail++ en el modelo base) |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Qwen2.5, con 32.763.876.352 parametros. La modificacion "DiM-heretic" aplicada por richardyoung consiste en la eliminacion de los mecanismos de rechazo (refusal-removed) mediante tecnicas de abliteration, un proceso que identifica y suprime las direcciones de activacion asociadas a las respuestas de negativa del modelo alineado original. El resultado es un modelo que responde a practicamente cualquier peticion sin las restricciones de seguridad del Qwen2.5-32B-Instruct original.

Sobre el entrenamiento original de Qwen2.5 no se aportan datos en la informacion disponible (numero de tokens, composicion del dataset, fases de RLHF/DPO). La cuantizacion i1 realizada por mradermacher emplea un fichero imatrix (importance matrix) de 0,1 GB para ponderar la cuantizacion de los tensores segun su importancia, lo que mejora la calidad respecto a cuantizaciones estaticas equivalentes en tamano. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Qwen2.5-32B-Instruct.
- Razonamiento y respuesta a instrucciones sin los filtros de rechazo del modelo original (comportamiento "uncensored"/"abliterated").
- Generacion de codigo y matematicas (capacidades propias de la familia Qwen2.5-Instruct, aunque no se detallan en esta ficha).
- Soporte de conversaciones multi-turno en formato chat.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades multilingues limitadas: la model card declara unicamente ingles.
- No se confirman en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo "thinking".

## Casos de uso

- Investigacion en seguridad de IA y red-teaming: el modelo permite estudiar como responde un LLM de 32B sin mecanismos de rechazo, comparando su comportamiento con el Qwen2.5-32B-Instruct alineado para identificar sesgos, fallos de alineacion y vectores de ataque.
- Evaluacion de robustez de filtros y guardrails: se puede usar como generador adversarial para probar sistemas de moderacion y clasificadores de contenido en pipelines de seguridad.
- Experimentacion personal en hardware de consumo: las cuantizaciones IQ2/IQ3 (entre 9,1 y 14,9 GB) permiten ejecutar un modelo de 32B en GPUs con 12-16 GB de VRAM mediante llama.cpp, algo imposible con los pesos completos.
- Docencia e investigacion academica sobre abliteration: sirve para ilustrar como se eliminan direcciones de rechazo en el espacio de activaciones y que efectos tiene sobre la calidad general del modelo.
- Generacion de texto sin restricciones para tareas creativas o de ficcion que el modelo alineado rechazaria, siempre dentro de un marco legal y etico.
- Benchmarking de cuantizaciones: comparar la degradacion de calidad entre los distintos niveles i1 (IQ1 a Q6_K) sobre un mismo modelo base para estudiar el impacto de la cuantizacion en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero GGUF, que aproxima la VRAM necesaria con offload completo en GPU):
  - IQ1_S: 7,4 GB; IQ1_M: 8,0 GB; IQ2_XXS: 9,1 GB; IQ2_XS: 10,1 GB; IQ2_S: 10,5 GB; IQ2_M: 11,4 GB.
  - Q2_K_S: 11,6 GB; Q2_K: 12,4 GB; IQ3_XXS: 12,9 GB; IQ3_XS: 13,8 GB.
  - Q3_K_S: 14,5 GB; IQ3_S: 14,5 GB; IQ3_M: 14,9 GB; Q3_K_M: 16,0 GB; Q3_K_L: 17,3 GB.
  - IQ4_XS: 17,8 GB; Q4_0: 18,8 GB (rapida, baja calidad); Q4_1, Q4_K_S, Q4_K_M, IQ4_NL y superiores: tamanos mayores no detallados en el fragmento disponible.
- GPU recomendadas: para cuantizaciones IQ4 y superiores se recomienda una GPU de 24 GB o mas (RTX 3090/4090, A10, L4, A100, H100). Para IQ2/IQ3 puede bastar una GPU de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB).
- Cabe en GPU de consumo: si, en cuantizaciones IQ1 a IQ3 en GPUs de 12-16 GB; en IQ4 en GPUs de 24 GB; en cuantizaciones altas (Q5, Q6) requiere 24-32 GB o particionado CPU/GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF (este) | 32,8 B | No disponible | GGUF i1 | Apache 2.0 | Cuantizacion imatrix de un modelo abliterated |
| Qwen2.5-32B-Instruct (original) | 32,8 B | 131.072 tokens (segun documentacion de Qwen, no confirmado aqui) | safetensors, GGUF | Apache 2.0 | Modelo alineado con rechazos; referencia de calidad |
| richardyoung/Qwen2.5-32B-Instruct-DiM-heretic | 32,8 B | No disponible | safetensors | Apache 2.0 / openrail++ | Modelo base abliterated sin cuantizar |
| mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-GGUF | 32,8 B | No disponible | GGUF estatico | Apache 2.0 | Cuantizaciones estaticas (sin imatrix) del mismo modelo |

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": carece de los mecanismos de rechazo del Qwen2.5-32B-Instruct alineado, por lo que puede generar contenido danino, ilegal o eticamente problematico sin filtros.
- Acceso restringido en el modelo base: la model card de richardyoung exige un formulario (gated) con declaracion de uso licito y revision manual; el uso debe limitarse a investigacion en seguridad, red-teaming, docencia o experimentacion personal.
- Riesgo elevado de alucinacion y de respuestas factualmente incorrectas, agravado por la cuantizacion agresiva en los niveles IQ1/IQ2.
- Limitacion idiomatica: declarado solo para ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Degradacion de calidad en cuantizaciones bajas: el propio autor advierte que IQ1_S es "for the desperate" y Q2_K_S es "very low quality"; Q4_0 es "fast, low quality".
- Restricciones de licencia: aunque se declara Apache 2.0, la model card base menciona openrail++ en las etiquetas y el acceso esta condicionado; conviene verificar los terminos antes de uso comercial.
- El repositorio de 351,5 GB incluye todas las variantes; descargar solo el fichero GGUF necesario.
- No se documentan sesgos especificos ni evaluaciones de seguridad del modelo abliterated en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF
- Modelo base (abliterated): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-DiM-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF
- CV del autor del modelo base: https://cv.deepneuro.ai
- Perfil del autor del modelo base: https://huggingface.co/richardyoung
- Licencia del Qwen2.5-32B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
