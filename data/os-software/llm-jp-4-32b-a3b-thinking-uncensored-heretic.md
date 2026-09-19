# OS-Software/llm-jp-4-32b-a3b-thinking-uncensored-heretic

## Resumen

El modelo `OS-Software/llm-jp-4-32b-a3b-thinking-uncensored-heretic` es una version "decensored" (abliterated) del modelo `llm-jp/llm-jp-4-32b-a3b-thinking`, desarrollado por el grupo LLM-jp del Centro de Investigacion y Desarrollo de Grandes Modelos de Lenguaje del Instituto Nacional de Informatica de Japon (NII). La modificacion ha sido realizada por el usuario OS-Software aplicando la herramienta Heretic v2.0.0.dev0+custom, que reduce de forma selectiva la alineacion de seguridad del modelo base mediante tecnicas de abliteration sobre las proyecciones de atencion y de la MLP.

Se trata de un transformer disperso de tipo MoE (mezcla de expertos) con 32.139.028.992 parametros totales y 3.827.476.992 parametros activos por token (32B-A3B), 32 capas, tamano oculto de 2560, 40 cabezas de atencion, 128 expertos enrutados de los que se activan 8, y una longitud de contexto de 65.536 tokens. La arquitectura declarada en el repositorio es `qwen3_moe` y el tokenizador es un Unigram byte-fallback derivado de llm-jp-tokenizer v4.0.

Su relevancia es doble: por un lado, es una de las variantes del modelo abierto japones llm-jp-4 de escala 32B orientado a razonamiento; por otro, al haber sido sometido a abliteration, se ofrece como herramienta de investigacion en seguridad, alineacion y red-teaming. El autor advierte explicitamente de que el modelo ha reducido su alineacion de seguridad y de que su uso previsto es exclusivamente la investigacion y la experimentacion, evitando su despliegue en servicios publicos o de cara al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_moe`), 32 capas, hidden size 2560, 40 cabezas |
| Parametros totales | 32.139.028.992 |
| Parametros activos | 3.827.476.992 (8 de 128 expertos enrutados activados por token) |
| Parametros de embedding | 503.316.480 |
| Parametros no-embedding | 31.635.712.512 |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors; no se publican pesos GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles), ja (japones); lenguajes de programacion declarados: C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala, TypeScript |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 64,3 GB |
| Tokenizador | Unigram byte-fallback basado en llm-jp-tokenizer v4.0 |
| Tipo de pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mezcla de expertos con enrutamiento disperso: 32 capas, tamano oculto de 2560, 40 cabezas de atencion, 128 expertos enrutados y 8 expertos activados por token, lo que da un total de 32,1B parametros con solo 3,8B activos en cada paso de inferencia. El contexto maximo es de 65.536 tokens y el tokenizador es un modelo Unigram con byte-fallback, construido a partir del vocabulario de llm-jp-tokenizer v4.0 (la propia model card advierte de que el entrenamiento puro con SentencePiece no reproduce ese vocabulario). La plantilla de chat esta disenada para ser compatible con el formato OpenAI Harmony, aunque el tokenizador difiere del que asume la libreria `openai-harmony`, por lo que no se admite tokenizacion directa con dicha libreria.

Segun la model card del modelo base, el entrenamiento se realizo en un pipeline multi-etapa de pre-entrenamiento y mid-training con un total de 11,7T tokens. Los modelos base solo pasan por pre-entrenamiento y mid-training, mientras que los modelos post-entrenados se alinean mediante supervised fine-tuning (SFT) y direct preference optimization (DPO), sin refuerzo con RL. La variante aqui descrita anade un paso posterior de abliteration con Heretic v2.0.0.dev0+custom: se aplica una transformacion de transporte gaussiano con rango de transporte 4, LoRA de rango 128, regularizacion ridge de 0,0005, regularizacion de covarianza 0,01, regularizacion de entropia 0,1 y un cambio maximo de peso de 1,0. El rango de capas intervenido es de la 12 a la 24, y los componentes objetivo son `attn.o_proj` y `mlp.down_proj`. Los pesos de preservacion de comportamiento bueno, direccionamiento de comportamiento malo y sobrecorreccion son 1,0, 0,5 y 2,75 respectivamente, con un vecino considerado y normalizacion de filas desactivada.

## Capacidades

- Generacion de texto conversacional en ingles y japones, con plantilla de chat compatible con el formato OpenAI Harmony.
- Modo "thinking": el modelo base pertenece a la familia llm-jp-4-32b-a3b-thinking, orientada a razonamiento explicito antes de responder.
- Generacion de codigo en un amplio conjunto de lenguajes declarados: C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala y TypeScript.
- Razonamiento multi-paso y tareas que requieren contexto largo, gracias a una ventana de 65.536 tokens.
- Capacidad de seguir instrucciones conversacionales multi-turno.
- Capacidades reducidas de rechazo: el modelo modificado presenta 0 rechazos sobre 100 en la evaluacion reportada por el autor, frente a 100/100 del modelo original.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente autonomo: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible; el pipeline declarado es exclusivamente text-generation.

## Casos de uso

- Investigacion en seguridad y red-teaming: el modelo permite estudiar como se comporta un LLM sin alineacion de seguridad frente a peticiones adversarias, comparando sus respuestas con las del modelo original como linea base de rechazo.
- Estudios de alineacion y abliteration: sirve para medir el impacto de una intervencion de este tipo sobre las capacidades generales, usando la divergencia KL reportada (0,0115) como indicador de deriva respecto al modelo base.
- Generacion de datos sinteticos de contraste: se pueden producir pares de respuestas (modelo alineado frente a modelo abliterated) para entrenar clasificadores de seguridad o modelos de moderacion.
- Evaluacion comparativa de robustez de guardarrailes: un equipo puede enfrentar sus propios filtros de contenido a un modelo con baja tasa de rechazo para detectar puntos ciegos en su capa de seguridad.
- Procesamiento de documentos largos en japones e ingles: los 65.536 tokens de contexto permiten resumir, extraer informacion y responder preguntas sobre expedientes extensos sin troceado agresivo.
- Analisis de codigo en multiples lenguajes: con soporte declarado para trece lenguajes de programacion, puede usarse en tareas de revision, explicacion o traduccion entre lenguajes dentro de un entorno de investigacion controlado.
- Experimentacion local con modelos MoE de escala 32B: al tener solo 3,8B parametros activos, es un banco de pruebas razonable para estudiar tecnicas de enrutamiento y eficiencia computacional en hardware de gama alta.
- Evaluacion de la degradacion tras abliteration: comparar el rendimiento del modelo modificado frente al original en tareas de codigo y razonamiento para cuantificar el coste de la intervencion.

## Benchmarks y rendimiento

El autor solo publica dos metricas comparativas frente al modelo base:

| Metrica | Este modelo | Modelo original (llm-jp-4-32b-a3b-thinking) |
|---|---|---|
| Rechazos | 0/100 | 100/100 |
| Divergencia KL | 0,0115 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, JGLUE u otros) en la informacion disponible, ni para esta variante ni para el modelo base en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 64-70 GB solo para los pesos, mas la cache KV correspondiente al contexto utilizado; el repositorio ocupa 64,3 GB en safetensors.
- GPU recomendadas para precision completa: una NVIDIA H100 de 80 GB o una A100 de 80 GB pueden alojar los pesos en bf16, con margen limitado para contexto largo; en configuraciones multi-GPU se necesitarian al menos dos aceleradores de 40-48 GB.
- Cabe en GPU de consumo: en bf16 no cabe en ninguna GPU de consumo actual. Con cuantizacion de 4 bits los pesos quedarian en torno a 18-20 GB teoricos, lo que podria caber en una RTX 4090 o RTX 5090 de 24-32 GB con contexto reducido, pero el autor no publica pesos cuantizados y estas cifras son estimaciones, no datos verificados.
- Al tratarse de un MoE con 3,8B parametros activos, el coste computacional por token es notablemente inferior al de un modelo denso de 32B, aunque el requisito de memoria viene determinado por los parametros totales.
- Opciones de despliegue: `transformers` es la libreria declarada y la unica soportada oficialmente. El despliegue en vLLM, SGLang o TGI requeriria soporte de la arquitectura `qwen3_moe` en la version correspondiente; no se documenta en la informacion disponible. Para llama.cpp u Ollama seria necesaria una conversion a GGUF, que no se distribuye en este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| llm-jp-4-32b-a3b-thinking-uncensored-heretic (este) | 32.139.028.992 | 3.827.476.992 | 65.536 | 0/100 | apache-2.0 | HuggingFace, safetensors |
| llm-jp-4-32b-a3b-thinking (base) | 32.139.028.992 | 3.827.476.992 | 65.536 | 100/100 | apache-2.0 | HuggingFace |
| llm-jp-4-8B (denso, misma familia) | 8.590.200.832 | no aplica (denso) | 65.536 | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas externas (por ejemplo Qwen3-30B-A3B) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica diferencia medible documentada entre este modelo y su base es la tasa de rechazo (0/100 frente a 100/100) con una divergencia KL de 0,0115, lo que indica que la intervencion es relativamente contenida en terminos de distribucion de salida, pero suficiente para eliminar los rechazos en el conjunto evaluado. No se dispone de datos comparativos de rendimiento en tareas genericas frente a otras familias de modelos.

## Limitaciones y advertencias

- Reduccion sustancial de la alineacion de seguridad: el propio autor advierte de que el modelo es mas propenso a generar contenido danino, inexacto, sesgado u ofensivo que un modelo estandar.
- Uso previsto restringido a investigacion y experimentacion, incluyendo estudios de seguridad, alineacion y red-teaming; se desaconseja explicitamente su despliegue en servicios publicos o de cara al usuario final.
- Riesgo elevado de alucinacion: la evaluacion publicada solo mide rechazos y divergencia KL, no veracidad ni exactitud factual.
- Ausencia de benchmarks de capacidad: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede cuantificar la degradacion o preservacion de capacidades tras la abliteration.
- Cobertura idiomatica limitada a ingles y japones; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Los pesos solo se distribuyen en safetensors y en precision completa, lo que excluye su uso directo en entornos con VRAM limitada sin cuantizacion previa por parte del usuario.
- Compatibilidad de plantilla: aunque la plantilla de chat sigue el formato OpenAI Harmony, el tokenizador no es compatible con la libreria `openai-harmony`, lo que puede provocar comportamientos incorrectos si se tokeniza con herramientas externas.
- Licencia apache-2.0 heredada del modelo base, lo que en principio permite uso comercial, pero el autor desaconseja el despliegue publico; el usuario asume toda la responsabilidad legal y etica derivada del uso.
- Sin garantias: OS-Software declara que distribuye el modelo sin garantias de ningun tipo y no asume responsabilidad por danos, perdidas, mal uso o consecuencias legales.
- Los sesgos del corpus de pre-entrenamiento (11,7T tokens, composicion no detallada en la informacion disponible) se conservan y pueden amplificarse al eliminarse los mecanismos de rechazo.
- Resultados no verificables de forma independiente: el repositorio no registra descargas ni likes en el momento de la consulta, y las metricas publicadas son autodeclaradas por el autor de la modificacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OS-Software/llm-jp-4-32b-a3b-thinking-uncensored-heretic
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-32b-a3b-thinking
- Coleccion de modelos LLM-jp-4: https://huggingface.co/collections/llm-jp/llm-jp-4-models
- Herramienta Heretic: https://heretic-project.org
- Repositorio de Heretic en GitHub: https://github.com/p-e-w/Heretic
- Cookbook de LLM-jp-4: https://github.com/llm-jp/llm-jp-4-cookbook
- Tokenizador llm-jp-tokenizer v4.0: https://github.com/llm-jp/llm-jp-tokenizer
- Centro de Investigacion y Desarrollo de Grandes Modelos de Lenguaje (LLMC, NII): https://llmc.nii.ac.jp/
- Instituto Nacional de Informatica de Japon: https://www.nii.ac.jp/en/
- Formulario de encuesta de LLM-jp: https://forms.gle/AvbNXTNT2ADsssHq5
