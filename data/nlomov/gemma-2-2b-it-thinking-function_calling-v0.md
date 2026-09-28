# nlomov/gemma-2-2B-it-thinking-function_calling-V0

## Resumen

gemma-2-2B-it-thinking-function_calling-V0 es un ajuste fino (fine-tune) del modelo instruido google/gemma-2-2b-it, publicado por el usuario nlomov en HuggingFace. Se trata de un modelo derivado de 2,6 mil millones de parametros (heredados del base, que no se modifican en tamano) orientado, a juzgar por su nombre, hacia dos capacidades concretas: modos de razonamiento explicito ("thinking") e invocacion de funciones ("function calling"). El autor no documenta en la model card ni el dataset ni los objetivos exactos del entrenamiento, por lo que esa orientacion es una inferencia a partir del nombre del repositorio.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL, segun la propia model card, y los pesos se publican en formato safetensors para su uso con transformers. No se declara licencia, idiomas soportados ni resultados de evaluacion. El repositorio tiene 0 descargas y 0 "likes", y su tamano (2,5 GB) es inferior al esperado para un modelo de 2,6B parametros en bf16 (aproximadamente 5,2 GB), lo que sugiere una precision reducida o una subida incompleta.

Su relevancia practica es limitada pero concreta: si el ajuste funciona, aporta a un modelo de 2B ya de por si ligero la capacidad de emitir trazas de razonamiento y llamadas a herramientas, algo poco frecuente en esa franja de tamano y util para agentes ligeros en hardware de consumo. No obstante, la ausencia total de documentacion, evaluacion y licencia lo convierte en un artefacto de investigacion mas que en un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base google/gemma-2-2b-it) |
| Parametros totales | 2,6 mil millones aproximadamente (heredados del modelo base; no confirmado en la informacion del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio; el modelo base declara 8.192 tokens |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors); al ser un derivado del base, es cuantizable a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | no disponibles (el modelo base declara soporte para mas de 140 idiomas segun su documentacion publica) |
| Licencia | no disponible; la model card no especifica licencia (el modelo base se rige por los Gemma Terms of Use) |
| Formato de pesos | safetensors (libreria transformers) |
| Framework de entrenamiento | TRL 1.14.0, Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1, Tokenizers 0.23.2 |
| Metodo de ajuste | SFT (supervised fine-tuning) |
| Tamano del repositorio | 2,5 GB |
| Fecha de creacion | 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base google/gemma-2-2b-it, un transformer decoder-only con las siguientes caracteristicas segun la documentacion publica de Google: atencion con consultas agrupadas (grouped-query attention), alternancia de capas de atencion local con ventana deslizante de 4.096 tokens y capas de atencion global, normalizacion RMSNorm, activaciones GeGLU y embeddings de entrada y salida compartidos. El modelo de 2B de la familia Gemma 2 se entreno con 2 billones de tokens y utilizo destilacion desde un modelo de mayor tamano, segun la documentacion del modelo base. Todo esto corresponde al modelo original, no al ajuste aqui descrito.

El ajuste fino de nlomov se realizo exclusivamente mediante SFT con TRL. La model card no especifica el dataset empleado, el numero de ejemplos, la composicion de los datos, la duracion del entrenamiento ni hiperparametros como la tasa de aprendizaje o el numero de epocas. Tampoco hay constancia de fases posteriores de alineamiento (RLHF, DPO, ORPO ni similares). El nombre del modelo apunta a que los datos de entrenamiento incluian ejemplos de razonamiento paso a paso y de invocacion de funciones, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo instruido base.
- Razonamiento explicito o "thinking", segun se deduce del nombre del modelo; no documentado ni verificado en la model card.
- Invocacion de funciones o tool calling, tambien inferido del nombre del modelo; no hay ejemplos, esquema ni evaluacion en el repositorio.
- Razonamiento en varios pasos y uso como componente de agentes, en principio posible si el ajuste en function calling es funcional, aunque no esta verificado.
- Capacidades multilingues: no declaradas para este ajuste; el modelo base declara cobertura de mas de 140 idiomas.
- Capacidades de codigo y matematicas: no documentadas para este ajuste; el modelo base de 2B muestra un rendimiento basico en estas tareas.
- Capacidades de vision o audio: no disponibles; el modelo base es exclusivamente de texto.
- Modo de pensamiento con etiquetas o bloques separados: no verificado.

## Casos de uso

- Agentes ligeros en el borde (edge): un modelo de 2,6B parametros puede ejecutarse en una GPU de consumo o incluso en CPU, lo que permite desplegar agentes con function calling en entornos sin aceleradores de datacenter. Requiere validar antes que el ajuste en tool calling produce JSON valido.
- Clasificacion y enrutado con herramientas: usar el modelo como primer eslabon de un pipeline que decide que API invocar; su tamano reducido implica latencia baja y coste minimo por consulta.
- Prototipado rapido de asistentes conversacionales: al ser un ajuste de un modelo instruido, permite iterar sobre prompts y esquemas de herramientas en local antes de escalar a un modelo mayor.
- Evaluacion comparativa de tecnicas de fine-tuning: el repositorio sirve como caso de estudio reproducible de SFT con TRL sobre Gemma 2 2B, util para investigacion sobre transferencia de capacidades de razonamiento en modelos pequenos.
- Extraccion estructurada de informacion: si el ajuste conserva la capacidad de generar JSON, puede emplearse para convertir texto libre en estructuras de datos en tareas de back-office.
- Generacion aumentada con recuperacion (RAG) en entornos con recursos limitados: con 8.192 tokens de contexto en el modelo base, admite unos pocos fragmentos recuperados por consulta, suficiente para preguntas y respuestas sobre documentacion corta.
- Educacion y experimentacion con modelos abiertos: al ser un derivado de pesos abiertos, permite estudiar el comportamiento de un modelo ajustado sin depender de APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, GSM8K, HumanEval, BFCL ni de ninguna tarea de function calling, y tampoco hay datos de rendimiento del ajuste frente al modelo base google/gemma-2-2b-it.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: entre 5,5 y 6,5 GB considerando pesos (aproximadamente 5,2 GB) y cache KV. Estimacion propia, no verificada con este repositorio.
- VRAM estimada en cuantizacion de 8 bits: entre 3 y 4 GB.
- VRAM estimada en cuantizacion de 4 bits (por ejemplo GGUF Q4_K_M): entre 1,8 y 2,5 GB.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090). En GPUs de 6 GB puede ser necesario cuantizar.
- Inferencia en CPU: viable con llama.cpp u Ollama, con velocidades del orden de decenas de tokens por segundo en procesadores modernos; depende del hardware y de la cuantizacion.
- GPU de datacenter: A100, H100 o L40S no son necesarias, pero permiten lotes grandes y mayor throughput; una A100 40 GB puede servir multiples instancias.
- Opciones de despliegue: transformers (formato original safetensors), vLLM, TGI, llama.cpp, Ollama y LM Studio previa conversion a GGUF.
- Latencia y throughput: no disponible; no se publican mediciones en el repositorio.
- Nota: el repositorio ocupa 2,5 GB, menos de lo esperado para 2,6B parametros en bf16. Conviene verificar la integridad y la precision real de los pesos antes de planificar el despliegue.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de su documentacion publica; no hay datos de rendimiento comparativos de este ajuste concreto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nlomov/gemma-2-2B-it-thinking-function_calling-V0 | 2,6B (aprox., heredados) | no disponible en el repositorio | no declarada | Pesos safetensors en HF, sin evaluacion | Ajuste SFT orientado a thinking y function calling, sin documentar |
| google/gemma-2-2b-it | 2,6B | 8.192 tokens | Gemma Terms of Use | Pesos abiertos, acceso sujeto a aceptacion de terminos | Modelo base, instruido, sin enfoque especifico en tool calling |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 128.000 tokens | Llama 3.2 Community License | Pesos abiertos, acceso sujeto a aceptacion de terminos | Mayor contexto y soporte declarado de tool calling |
| Qwen/Qwen2.5-3B-Instruct | 3,1B | 32.768 tokens nativos | Apache 2.0 | Pesos abiertos | Licencia permisiva y soporte de herramientas documentado |

## Limitaciones y advertencias

- Documentacion inexistente: la model card no describe el dataset, los hiperparametros ni los objetivos del entrenamiento, lo que impide reproducir o auditar el ajuste.
- Sin benchmarks: no hay ninguna evaluacion publicada, ni del ajuste ni de su degradacion respecto al modelo base. Es plausible que el SFT haya provocado olvido catastrofico en tareas generales, pero no hay datos al respecto.
- Capacidades inferidas: tanto el modo "thinking" como el function calling se deducen unicamente del nombre del modelo. No hay ejemplos, esquemas de herramientas ni pruebas de que la salida sea JSON parseable.
- Licencia no declarada: el repositorio no especifica licencia. El modelo base se distribuye bajo los Gemma Terms of Use, que imponen obligaciones de atribucion y restricciones de uso; cualquier uso comercial exige revisar dichos terminos con atencion.
- Riesgo de alucinacion: no medido. Los modelos de 2B parametros tienden a alucinar mas que los de mayor tamano, especialmente en contextos largos y en tareas de razonamiento encadenado.
- Sesgos: no evaluados en este ajuste. El modelo base hereda sesgos de su corpus de entrenamiento web.
- Contexto limitado a lo declarado por el base (8.192 tokens, no confirmado en este repositorio): no es adecuado para documentos extensos ni para conversaciones muy largas sin tecnicas de resumen o recuperacion.
- Idiomas: no declarados para el ajuste. Es probable que el ajuste se haya realizado en ingles, lo que puede degradar el rendimiento en castellano respecto al modelo base.
- Integridad del repositorio: el tamano de 2,5 GB no coincide con el esperado para 2,6B parametros en bf16. Conviene verificar que los pesos estan completos y en que precision antes de usarlos.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que aporten contexto adicional.
- No apto para produccion critica sin validacion previa, dado el conjunto de incertidumbres anteriores.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/nlomov/gemma-2-2B-it-thinking-function_calling-V0
- Modelo base google/gemma-2-2b-it: https://huggingface.co/google/gemma-2-2b-it
- Repositorio de TRL (framework de entrenamiento declarado): https://github.com/huggingface/trl
- Otros enlaces (paper, blog, demo o dataset del ajuste): no disponibles en la informacion proporcionada.
