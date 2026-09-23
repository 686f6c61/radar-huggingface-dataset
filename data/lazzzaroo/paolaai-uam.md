# Lazzzaroo/PaolaAI-UAM

## Resumen

PaolaAI-UAM es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct publicado por el usuario Lazzzaroo en HuggingFace. Se trata de un modelo denso de 7.615.616.512 parámetros (7,62 mil millones) orientado a generación de texto conversacional, derivado de `unsloth/Qwen2.5-7B-Instruct-bnb-4bit` y entrenado con la librería Unsloth junto con TRL de HuggingFace. La model card del autor no documenta el conjunto de datos de ajuste, el número de pasos, la composición del corpus ni el procedimiento de alineación empleado.

El interés de esta ficha es fundamentalmente descriptivo: se trata de un artefacto con 0 descargas y 0 likes en el momento de redactarla, con una model card mínima que se limita a declarar la autoría, la licencia Apache 2.0 y el modelo base. No hay resultados de evaluación publicados, ni información sobre el dominio de especialización, ni detalles sobre el proceso de entrenamiento más allá de la mención a Unsloth y TRL.

Por tanto, cualquier evaluacion de su calidad debe hacerse de forma empirica por parte del usuario. Las caracteristicas tecnicas que se detallan a continuacion corresponden, en su mayor parte, a las heredadas del modelo base Qwen2.5-7B-Instruct, y se indican como tales cuando no estan confirmadas para este fine-tune concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Qwen2 (heredada del modelo base; no documentada en la model card del fine-tune) |
| Parametros totales | 7.615.616.512 (7,62 mil millones), segun los pesos en safetensors del repositorio |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta 131.072 tokens |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos en safetensors (15,2 GB), no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (unico idioma declarado en la model card); el modelo base es multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/Qwen2.5-7B-Instruct-bnb-4bit |
| Libreria de inferencia | transformers (compatible con text-generation-inference y endpoints_compatible) |
| Tamano del repositorio | 15,2 GB |
| Fecha de creacion / actualizacion | 2026-09-20 / 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card. Al derivar de Qwen2.5-7B-Instruct, la estructura subyacente es un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings RoPE y atencion con consultas agrupadas (GQA). Para el modelo base Qwen2.5-7B-Instruct, la documentacion oficial de Qwen indica 28 capas, 28 cabezas de atencion para consultas, 4 cabezas para claves y valores, una dimension oculta de 3.584 y una dimension intermedia de 18.944. Estos valores corresponden al modelo base y no han sido verificados para este fine-tune concreto.

En cuanto al entrenamiento, la unica informacion disponible es la declaracion del autor de que el modelo "fue entrenado 2x mas rapido con Unsloth y la libreria TRL de HuggingFace". No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF, DPO u otra forma de alineacion, ni la duracion o el regimen de hiperparametros. El modelo base Qwen2.5-7B-Instruct fue preentrenado por Alibaba sobre aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones, pero ese dato no es extrapolable al ajuste fino aqui descrito. No se puede confirmar si el proceso de cuantizacion a 4 bits del modelo base (bnb-4bit) fue revertido o si los pesos publicados son el resultado de una fusion en precision completa, dado que el repositorio ocupa 15,2 GB, coherente con pesos en bf16/fp16.

## Capacidades

La model card no enumera capacidades de forma explicita. A partir de la herencia del modelo base y de las etiquetas del repositorio (conversational, text-generation), se pueden senalar las siguientes, siempre con la advertencia de que no han sido verificadas para este fine-tune:

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno.
- Razonamiento basico, matematicas y generacion de codigo, capacidades tipicas del modelo base Qwen2.5-7B-Instruct.
- Soporte de tool calling / function calling: la etiqueta `endpoints_compatible` sugiere compatibilidad con infraestructura de despliegue gestionada, pero la model card no documenta plantillas de herramientas ni formato de llamadas.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: la model card declara unicamente el ingles, aunque el modelo base es multilingue.
- Capacidad especial de modo "thinking": no documentada.
- Vision o audio: no soportados (el modelo base Qwen2.5-7B-Instruct es exclusivamente de texto).

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: al ser un modelo de 7,6 mil millones de parametros con pesos en safetensors y licencia Apache 2.0, se puede desplegar en una GPU unica y servir conversaciones multi-turno con la ventana de contexto heredada del modelo base.
- Punto de partida para ajustes finos adicionales: la integracion declarada con Unsloth y TRL lo hace adecuado como base para LoRA o QLoRA sobre dominios especificos, especialmente si se dispone de pocos recursos de GPU.
- Generacion asistida de codigo en entornos de desarrollo: el modelo base Qwen2.5-7B-Instruct tiene un rendimiento notable en tareas de programacion, por lo que este derivado puede emplearse en autocompletado y generacion de funciones, siempre que se valide empiricamente la degradacion introducida por el fine-tune.
- Extraccion de informacion estructurada en ingles: clasificacion de texto, resumen y transformacion de documentos a JSON en pipelines por lotes, donde la latencia no es critica.
- Experimentacion academica y docente: el nombre "UAM" y el caracter abierto de la licencia lo hacen apto como material de laboratorio para practicas de ajuste fino, evaluacion de sesgos o estudio de degradacion por fine-tuning.
- Sustitucion local de APIs comerciales en entornos con requisitos de privacidad: al poder ejecutarse en hardware propio, permite procesar texto sensible sin enviar datos a terceros.
- Evaluacion comparativa de tecnicas de cuantizacion: dado que el repositorio publica pesos en precision completa, sirve como referencia para comparar la degradacion de variantes GGUF, AWQ o GPTQ generadas por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto de referencia, ni comparaciones con el modelo base. Tampoco se especifica si el ajuste fino ha degradado las capacidades originales de Qwen2.5-7B-Instruct (olvido Catastrofico) o si se ha preservado el rendimiento general. Se recomienda ejecutar una evaluacion propia antes de cualquier uso en produccion.

## Requisitos de hardware

Las siguientes estimaciones son calculos derivados del numero de parametros (7,62 mil millones) y no proceden de mediciones publicadas para este modelo:

- Pesos en fp16/bf16: aproximadamente 15,2 GB solo para los pesos, coherente con el tamano del repositorio.
- VRAM estimada en bf16 con contexto corto: entre 17 y 20 GB, incluyendo cache KV.
- VRAM estimada en bf16 con contexto largo (128K tokens): la cache KV crece de forma proporcional a la longitud de contexto y al numero de capas y cabezas KV; con GQA el consumo es menor que en atencion multi-cabeza completa, pero puede superar los 40 GB con contextos muy largos, por lo que se requiere una A100 80 GB o H100 80 GB para explotar toda la ventana.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 4-5 GB de pesos.
- GPU recomendadas: A100 40 GB o 80 GB y H100 80 GB para produccion con contexto largo; L40S 48 GB o A6000 48 GB como alternativas.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bf16 con contexto moderado y en una RTX 3090 (24 GB) con las mismas condiciones. Con cuantizacion de 4 bits puede ejecutarse en GPUs de 8-12 GB, como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (TGI) y vLLM para servicio en servidor. Para llama.cpp u Ollama es necesario convertir previamente los pesos a GGUF, ya que el repositorio no publica ese formato.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Estado |
|---|---|---|---|---|---|
| Lazzzaroo/PaolaAI-UAM | 7,62 mil millones | no disponible (base: 131.072) | Apache 2.0 | safetensors | Fine-tune sin evaluacion publica, 0 descargas |
| Qwen2.5-7B-Instruct | 7,62 mil millones | 131.072 tokens | Apache 2.0 (Qwen) | safetensors, GGUF, AWQ, GPTQ | Modelo base oficial, con benchmarks publicados |
| Llama-3.1-8B-Instruct | 8,03 mil millones | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF | Modelo oficial con amplia adopcion |
| Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo oficial, contexto mas limitado |

La comparacion con los modelos oficiales es desigual en terminos de evidencia: los tres alternativas cuentan con evaluaciones publicadas y ecosistemas de cuantizacion mantenidos, mientras que para PaolaAI-UAM no existe ningun dato de rendimiento ni formato cuantizado listo para usar. La ventaja principal del modelo aqui descrito es la licencia Apache 2.0 sin restricciones adicionales, identica a la de Qwen2.5 y Mistral, y mas permisiva que la de Llama 3.1.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones humanas, ni pruebas de regresion frente al modelo base. Es imposible saber si el ajuste fino ha mejorado o degradado las capacidades originales.
- Proceso de entrenamiento opaco: se desconoce el dataset, el numero de ejemplos, la tasa de aprendizaje, el numero de epocas y si se aplico RLHF o DPO. Esto impide auditar sesgos introducidos durante el ajuste.
- Riesgo de olvido catastrofico: al ser un fine-tune de un modelo de 7,6 mil millones de parametros sin documentacion, es probable que haya perdido parte de las capacidades generales del base, especialmente en matematicas y codigo, aunque esto no puede confirmarse sin pruebas.
- Idioma: la model card declara unicamente ingles. El uso en castellano u otros idiomas no esta soportado oficialmente y puede producir resultados degradados.
- Riesgo de alucinacion: inherente a los modelos de esta escala, agravado por la falta de informacion sobre el corpus de ajuste. No se debe confiar en la veracidad factual de las salidas sin verificacion externa.
- Sesgos: no documentados ni medidos. Al desconocerse el dataset, no se puede descartar la introduccion de sesgos de genero, raza, religion o ideologia procedentes de los datos de ajuste.
- Reputacion y mantenimiento: 0 descargas y 0 likes, sin historial de uso, sin issues publicos y sin garantia de mantenimiento por parte del autor. No es un artefacto adecuado como dependencia critica en produccion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia. No obstante, al derivar de Qwen2.5, conviene verificar que la cadena de licencias se mantiene correcta en la redistribucion.
- Formato: no se publican variantes cuantizadas, por lo que el usuario asume el coste de conversion y la validacion de la degradacion asociada.
- Contexto: aunque el modelo base soporta 131.072 tokens, no hay confirmacion de que este fine-tune conserve esa ventana, ni de que el entrenamiento se haya realizado con secuencias largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lazzzaroo/PaolaAI-UAM
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Documentacion de Qwen2.5 (modelo base): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; el unico resultado obtenido fue una pagina generica de Gmail sin relacion con el artefacto.
