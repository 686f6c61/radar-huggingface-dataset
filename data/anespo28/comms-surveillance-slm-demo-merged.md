# anespo28/comms-surveillance-slm-demo-merged

## Resumen
`anespo28/comms-surveillance-slm-demo-merged` es un ajuste fino del modelo `Qwen/Qwen2.5-3B-Instruct` orientado a la clasificación de comunicaciones textuales segun tipologias de abuso de mercado (insider dealing, spoofing, layering, front-running, personal account dealing, collusion y benign), inspiradas en la taxonomia FCA/MAR. Lo publica el usuario anespo28 como prototipo demostrativo de una arquitectura de triaje para vigilancia de comunicaciones en servicios financieros.

Tecnicamente es un fine-tuning con LoRA ya fusionado en los pesos base, con 3.085.938.688 parametros (aproximadamente 3,09 mil millones) y pesos en safetensors. No incorpora innovaciones de arquitectura propias: hereda el transformer decoder-only de la familia Qwen2 y la ventana de contexto del modelo base.

Su relevancia es limitada y debe interpretarse como material de demostracion: el autor declara explicitamente que el entrenamiento se hizo con un dataset sintetico generado proceduralmente de 240 ejemplos y que la precision de ~97% reportada procede de un conjunto de validacion tambien sintetico, por lo que no es representativa del rendimiento sobre comunicaciones reales. La propia model card advierte de que no es un producto de compliance validado.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con adaptadores LoRA fusionados |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors (tamano de repo de 6,2 GB, compatible con bf16/fp16). No se publican versiones GGUF ni cuantizadas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea principal | Clasificacion de comunicaciones en 7 categorias de abuso de mercado |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Fecha de creacion | 2026-09-12 |

## Arquitectura y entrenamiento
El modelo parte de `Qwen/Qwen2.5-3B-Instruct`, un transformer decoder-only de 3,09 mil millones de parametros con atencion de consultas agrupadas (GQA) y tokenizador BPE de vocabulario amplio. Sobre esa base se aplico un ajuste fino con LoRA para una tarea de clasificacion con siete etiquetas, y los adaptadores se fusionaron posteriormente en los pesos del modelo base, dando lugar al checkpoint `-merged` publicado. No se documentan cambios en la arquitectura, ni decodificacion especulativa, ni mecanismos de atencion alternativos.

El dato mas relevante del entrenamiento es su naturaleza sintetica: el autor indica que se uso exclusivamente un dataset generado proceduralmente de 240 ejemplos, construido con plantillas y variaciones, con el objetivo de validar una pipeline de fine-tuning. No se menciona el uso de RLHF, DPO ni de datos reales de ninguna entidad financiera, y no se detalla la composicion exacta del dataset por clase ni la longitud de las secuencias de entrenamiento.

## Capacidades
- Clasificacion de comunicaciones textuales en siete categorias de abuso de mercado: insider dealing, spoofing, layering, front-running, personal account dealing, collusion y benign.
- Generacion de texto instructivo y seguimiento de instrucciones, heredados del modelo base Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a prompts en formato conversacional en ingles.
- Capacidad de servir como punto de partida para fine-tuning adicional sobre datos propios o para tareas de triaje en una pipeline mayor.
- No se documenta soporte de function calling ni de tool calling especifico para esta tarea.
- No se documenta soporte de agentes, multi-step reasoning, vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidades multilingues: no declaradas; la model card solo indica ingles.

## Casos de uso
- Prototipo de triaje en vigilancia de comunicaciones: el modelo puede etiquetar mensajes de empleados en canales de comunicacion corporativa segun tipologias de abuso de mercado, actuando como primer filtro antes de la revision humana. Es adecuado como demostracion de concepto, no como sistema de decision.
- Validacion de pipelines de fine-tuning: sirve para comprobar el funcionamiento de una cadena de entrenamiento LoRA, fusion de adaptadores y publicacion en HuggingFace antes de invertir en datos reales etiquetados.
- Generacion de datos de prueba y evaluacion de infraestructura: al estar disponible en safetensors y ser compatible con `transformers` y con `mlx-lm`, permite medir throughput, latencia y consumo de VRAM en el hardware objetivo antes de desplegar un modelo mayor.
- Base para un modelo interno de compliance: un equipo de un banco o broker puede usarlo como inicializacion y reentrenarlo con comunicaciones reales debidamente anonimizadas y con un proceso formal de model risk management.
- Investigacion academica sobre clasificacion de texto financiero: comparar el comportamiento de un SLM de 3B ajustado frente a modelos mayores en una taxonomia regulatoria concreta.
- Demostraciones comerciales y pruebas de concepto: permite mostrar una interfaz de triaje funcional en portatiles con GPU de consumo, gracias a que el modelo completo ocupa alrededor de 6,2 GB en bf16.
- Clasificacion por lotes de transcripciones: se puede ejecutar sobre ficheros de conversaciones en ingles para obtener etiquetas y revision manual posterior, siempre que se asuma la tasa de error sobre datos no sinteticos.

## Benchmarks y rendimiento
El unico dato de rendimiento disponible lo aporta el autor en la model card y procede de un conjunto de validacion sintetico.

| Metrica | Resultado | Conjunto de evaluacion | Nota |
|---|---|---|---|
| Accuracy de clasificacion | ~97% | Validacion sintetica generada proceduralmente | No representativa de datos reales segun el propio autor |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en bf16/fp16: alrededor de 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 8-10 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,5 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2 GB, aunque el repositorio no publica pesos cuantizados.
- GPU de consumo compatibles: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090; tambien cabe en GPUs de 8 GB con cuantizacion.
- GPU de centro de datos: A100, H100, L40S y similares, aunque estan sobredimensionadas para un modelo de 3B.
- Apple Silicon: la model card documenta soporte mediante `mlx-lm`.
- Opciones de despliegue: `transformers` (documentado por el autor) y `mlx-lm` en Apple Silicon. Para vLLM, TGI, llama.cpp u Ollama seria necesario convertir los pesos a los formatos correspondientes, algo que el autor no proporciona.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| comms-surveillance-slm-demo-merged | 3,09 mil millones | no especificado (base: 32.768 tokens) | apache-2.0 | Clasificacion de abuso de mercado sobre datos sinteticos | safetensors en HuggingFace |
| Qwen/Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens | apache-2.0 | Instrucciones generales | safetensors, GPTQ, AWQ, GGUF |
| Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | Instrucciones generales | safetensors, GGUF |
| Phi-3.5-mini-instruct | 3,8 mil millones | 128.000 tokens | MIT | Instrucciones generales y razonamiento | safetensors, GGUF |

La comparacion directa de rendimiento no es posible porque no existen benchmarks publicados del modelo ajustado sobre tareas estandar, y el unico resultado disponible (accuracy sobre datos sinteticos) no es trasladable a otros modelos. Los modelos alternativos son de proposito general; un clasificador de abuso de mercado de produccion tendria que compararse con soluciones comerciales de vigilancia de comunicaciones, para las que no se dispone de datos publicos comparables.

## Limitaciones y advertencias
- Entrenamiento exclusivamente con 240 ejemplos sinteticos generados proceduralmente: el modelo no ha visto nunca comunicaciones reales, por lo que su comportamiento sobre lenguaje ambiguo, ironico, coloquial o multilingue es desconocido.
- La accuracy de ~97% procede de un conjunto de validacion tambien sintetico y el propio autor advierte de que no es representativa del rendimiento real.
- No es un producto de compliance validado y no debe usarse para decisiones reales de vigilancia sin reentrenamiento, validacion y aprobacion formal de model risk management.
- Riesgo de alucinacion inherente a un modelo generativo: puede justificar una etiqueta con razonamientos plausibles pero incorrectos si se le pide explicacion.
- Riesgo elevado de falsos positivos y falsos negativos en un dominio con consecuencias legales y disciplinarias para las personas investigadas.
- Dominio linguistico restringido al ingles; no se declaran capacidades en castellano ni en otros idiomas, a pesar de que las comunicaciones reales en entidades europeas suelen ser multilingues.
- Sesgos potenciales derivados de las plantillas de generacion sintetica, que pueden sobrerrepresentar formulaciones artificiales y no cubrir el argot real del sector.
- Licencia apache-2.0 sobre los pesos, heredada del modelo base: permite uso comercial y modificacion, pero no exime de las obligaciones regulatorias del sector financiero ni de la normativa de proteccion de datos al tratar comunicaciones de empleados.
- La model card esta redactada en italiano mientras que el campo de idioma declara ingles, lo que no afecta al funcionamiento del modelo pero si a la claridad de la documentacion.
- No hay pesos GGUF, GPTQ, AWQ ni versiones cuantizadas publicadas, lo que anade trabajo de conversion para despliegues en CPU o en hardware limitado.
- Modelo con 1 like y 0 descargas en el momento de la consulta: no existe validacion independiente por parte de la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/anespo28/comms-surveillance-slm-demo-merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Biblioteca mlx-lm (Apple Silicon): https://github.com/ml-explore/mlx-lm
- Herramientas de conversion a GGUF (llama.cpp): https://github.com/ggerganov/llama.cpp
- No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados obtenidos correspondian a contenido no relacionado con el modelo.
