# OS-Software/llm-jp-4-33b-thinking-uncensored-heretic

## Resumen

OS-Software/llm-jp-4-33b-thinking-uncensored-heretic es una version "abliterada" (decensored) del modelo llm-jp-4-33b-thinking, desarrollado originalmente por el Research and Development Center for Large Language Models del National Institute of Informatics (NII) de Japon. La intervencion la firma el usuario OS-Software y se ha realizado con la herramienta Heretic v2.0.0.dev0+custom, que aplica una transformacion de pesos sobre las capas 33 a 47 para eliminar la direccion de comportamiento asociada al rechazo (refusal).

El modelo base es un transformer denso decoder-only de 33.219.548.160 parametros (64 capas, hidden size 5.120, 40 cabezas de atencion) con una ventana de contexto de 65.536 tokens. Fue preentrenado y sometido a mid-training sobre un total de 11,7T tokens, y posteriormente alineado con supervised fine-tuning (SFT) y direct preference optimization (DPO), sin fase de reinforcement learning. Soporta ingles y japones, e incluye un tokenizer Unigram byte-fallback derivado de llm-jp-tokenizer v4.0.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo japones de 33B con contexto largo poco habitual en el ecosistema open source. Por otro, ilustra un caso de "abliteration" quirurgica: segun la propia model card, la tasa de rechazos baja de 100/100 a 0/100 con una divergencia KL de 0.0143 respecto al modelo original, lo que indica una modificacion relativamente contenida del comportamiento general. El autor lo declara explicitamente como material de investigacion en seguridad y red-teaming, no para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 33.219.548.160 (33,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | No disponible en el repositorio; solo pesos safetensors en precision completa |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Capas | 64 |
| Hidden size | 5.120 |
| Cabezas de atencion | 40 |
| Parametros de embedding | 1.006.632.960 |
| Parametros no-embedding | 32.212.915.200 |
| Tamano del repositorio | 66,5 GB |
| Pipeline | text-generation |
| Libreria declarada | transformers |
| Fecha de publicacion | 19 de septiembre de 2026 |
| Descargas / likes | 193 / 0 |

## Arquitectura y entrenamiento

El modelo base, llm-jp-4-33b-thinking, es un transformer denso con 64 capas, hidden size 5.120 y 40 cabezas de atencion, con 1.006.632.960 parametros en la capa de embeddings y 32.212.915.200 en el resto del cuerpo. La ventana de contexto es de 65.536 tokens. El tokenizer es un modelo Unigram con byte-fallback construido sobre llm-jp-tokenizer v4.0, y la plantilla de chat esta disenada para ser compatible con el formato OpenAI Harmony, aunque el propio autor advierte que no se debe tokenizar con la libreria openai-harmony porque el vocabulario difiere. El pipeline de entrenamiento del base combina pre-training y mid-training sobre un total de 11,7T tokens, seguido de alineamiento con SFT y DPO sin RL.

Sobre ese base, OS-Software aplica una transformacion de abliteracion con Heretic. Segun los parametros publicados, la intervencion se concentra en las capas 33 a 47 (start_layer_index 33, end_layer_index 47), con un LoRA de rango 128 y transporte gaussiano de rango 4. Los componentes objetivo son attn.o_proj y mlp.down_proj. Se usan preserve_good_behavior_weight 1.0, steer_bad_behavior_weight 0.5, overcorrect_relative_weight 2.0, ridge_regularization 0.0005, covariance_regularization 0.01, entropy_regularization 0.1, max_weight_change 1.0 y neighbor_count 1, con row_normalization en none. El resultado declarado es 0 rechazos en 100 peticiones (frente a 100/100 del original) con una divergencia KL de 0.0143, es decir, una degradacion medible pero reducida del comportamiento respecto al modelo sin modificar.

## Capacidades

- Generacion de texto conversacional en ingles y japones, con soporte de contexto largo de hasta 65.536 tokens.
- Modo "thinking": el modelo base incorpora razonamiento explicito en la generacion, herencia del sufijo -thinking de la familia llm-jp-4.
- Generacion de codigo en C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala y TypeScript, segun los lenguajes declarados en la model card del base.
- Plantilla de chat compatible con el formato de respuesta de OpenAI Harmony, lo que facilita la integracion con flujos que esperan ese esquema (con el tokenizer propio del modelo).
- Capacidad de conversacion multi-turno con memoria de contexto extensa.
- Reduccion practica de rechazos: la model card reporta 0/100 refusals, lo que habilita respuestas sobre temas que el modelo alineado evitaba.
- No se declara soporte explicito de tool calling, function calling, vision, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Investigacion en seguridad y alineamiento: el modelo sirve como sujeto de estudio para medir cuanto cambia el comportamiento de un LLM tras una abliteracion, gracias al KL de 0.0143 y a la metrica de rechazos 0/100 que el autor publica.
- Red-teaming controlado: util para generar respuestas que un modelo alineado rechazaria, en entornos aislados, con el objetivo de identificar fallos y disenar mitigaciones.
- Estudio comparativo de tecnicas de decensoring: permite contrastar los parametros de Heretic (capas 33-47, LoRA rango 128, transporte gaussiano) con otras recetas de abliteracion sobre el mismo base.
- Evaluacion de deriva de comportamiento en japones: al conservar el soporte de ja e en, facilita medir si la intervencion por capas degrada de forma desigual la calidad en cada idioma.
- Procesamiento de documentos largos en japones: la ventana de 65.536 tokens permite resumir o extraer informacion de contratos, informes tecnicos o expedientes extensos sin trocear el texto.
- Analisis de codigo en multiples lenguajes: con 13 lenguajes declarados, puede emplearse para revision estatica, generacion de tests o explicacion de fragmentos en proyectos poliglotas.
- Generacion de datos sinteticos para investigacion: util para producir corpus de entrenamiento o de evaluacion sobre temas sensibles que otros modelos no cubririan.
- Estudio de sesgos y contenido danino: la ausencia de alineamiento de seguridad lo convierte en una herramienta para catalogar tipos de salidas problematicas y construir taxonomias.

## Benchmarks y rendimiento

La model card solo publica dos metricas, ambas relativas al efecto de la abliteracion. No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval, JGLUE u otros) en la informacion disponible.

| Metrica | Este modelo | Modelo original (llm-jp/llm-jp-4-33b-thinking) |
|---|---|---|
| Rechazos (refusals) | 0/100 | 100/100 |
| Divergencia KL | 0.0143 | 0 (por definicion) |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 66 GB solo para pesos, mas cache KV. Necesita GPU de 80 GB o reparto en varias GPU.
- VRAM estimada en int8: aproximadamente 33 GB de pesos.
- VRAM estimada en int4: aproximadamente 17-18 GB de pesos, lo que lo situa al limite de una RTX 4090 de 24 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; A100 40 GB o L40S no bastan en bf16 y exigen cuantizacion. Para int4, una RTX 4090, RTX 5090 o L40S son suficientes para los pesos, pero la cache KV con 65.536 tokens de contexto puede exceder la VRAM disponible.
- Cabe en GPU de consumo: si, en configuraciones de 4 bits sobre RTX 4090 / 5090, con contexto reducido o cuantizacion adicional de la cache KV.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repositorio incluye el tag), vLLM con PagedAttention para gestionar la cache KV en contextos largos. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa a partir de los safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| llm-jp-4-33b-thinking-uncensored-heretic | 33,2B | 65.536 | Denso, abliterado | Apache 2.0 | 0/100 refusals, KL 0.0143 frente al base |
| llm-jp-4-33b-thinking | 33,2B | 65.536 | Denso, alineado con SFT + DPO | Apache 2.0 | 100/100 refusals; mismo esqueleto (64 capas, hidden 5.120, 40 cabezas) |
| llm-jp-4-32b-a3b | 32,1B totales, 3,83B activos | 65.536 | MoE (128 expertos enrutados, 8 activados) | Apache 2.0 (familia llm-jp-4) | Alternativa eficiente en inferencia de la misma familia; 32 capas, hidden 2.560, 40 cabezas |
| llm-jp-4-8b | 8,59B | 65.536 | Denso | Apache 2.0 (familia llm-jp-4) | 32 capas, hidden 4.096, 32 cabezas; opcion de menor coste de despliegue |

No se dispone de datos de rendimiento comparativo en benchmarks entre estos modelos dentro de la informacion proporcionada; la comparativa se limita a parametros, arquitectura, contexto y licencia.

## Limitaciones y advertencias

- Contenido danino: la model card advierte que la alineacion de seguridad ha sido sustancialmente reducida y que el modelo es mas propenso a generar contenido perjudicial, inexacto, sesgado u ofensivo.
- Uso previsto restringido: el autor lo destina exclusivamente a investigacion y experimentacion (seguridad, alineamiento, red-teaming) y pide evitar su despliegue en servicios publicos o de cara al usuario final.
- Alucinacion: todas las salidas deben tratarse como no fiables y verificarse de forma independiente; el autor traslada al usuario la responsabilidad de evaluar exactitud e idoneidad.
- Ausencia de benchmarks de calidad: no se publican resultados de MMLU, GSM8K, HumanEval ni metricas de calidad en japones, por lo que no puede cuantificarse el impacto de la abliteracion sobre tareas distintas del rechazo.
- Deriva funcional: aunque el KL de 0.0143 es bajo, implica una desviacion real respecto al modelo original; puede afectar a la coherencia en tareas largas o sensibles.
- Contexto e idioma: el soporte se limita a ingles y japones; no se declara rendimiento en castellano ni en otros idiomas, y el tokenizer propio impide usar openai-harmony directamente.
- Formato de pesos: solo safetensors, lo que obliga a cuantizar o convertir para desplegar en llama.cpp, Ollama u otros entornos que consumen GGUF.
- Licencia: Apache 2.0 permite uso comercial segun los terminos de esa licencia, pero es una obra derivada del base llm-jp-4-33b-thinking y los derechos del modelo original permanecen en sus titulares. El aviso del autor desaconseja el uso en produccion, lo que introduce un riesgo reputacional y etico mas alla de lo estrictamente legal.
- Sin garantias: OS-Software declara el modelo sin garantia de ningun tipo y sin responsabilidad por danos, perdidas o consecuencias legales derivadas de su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OS-Software/llm-jp-4-33b-thinking-uncensored-heretic
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-33b-thinking
- Coleccion LLM-jp-4: https://huggingface.co/collections/llm-jp/llm-jp-4-models
- Heretic: https://heretic-project.org
- Repositorio de Heretic: https://github.com/p-e-w
- Cookbook de LLM-jp-4: https://github.com/llm-jp/llm-jp-4-cookbook
- Tokenizer llm-jp-tokenizer: https://github.com/llm-jp/llm-jp-tokenizer
- Centro de investigacion (LLMC, NII): https://llmc.nii.ac.jp/
- National Institute of Informatics: https://www.nii.ac.jp/en/
- Formulario de encuesta de LLM-jp: https://forms.gle/AvbNXTNT2ADsssHq5

Nota: la busqueda web asociada a esta ficha no ha devuelto resultados relevantes sobre el modelo (los enlaces obtenidos tratan sobre sistemas operativos y no guardan relacion con el contenido solicitado).
