# Shockem/Qwen3.8-27b-Terse-Coder-NVFP4

## Resumen

Shockem/Qwen3.8-27b-Terse-Coder-NVFP4 es un checkpoint de despliegue cuantizado en NVFP4 (receta W4A16 de modelopt) publicado por el usuario Shockem. Deriva de Shockem/Qwen3.8-27b-Terse-Coder, un ajuste fino de Qwen/Qwen3.8-27B orientado a codigo que reduce el numero de tokens de cadena de pensamiento aproximadamente a una decima parte manteniendo la correccion. La relevancia practica del artefacto esta en que, segun el autor, todos los numeros publicados se midieron sobre este mismo checkpoint servido con vLLM 0.28, no sobre el modelo en fp16.

El modelo declarado es de 27B, pero el recuento real de parametros en los ficheros safetensors es de 18.799.063.792 (~18,8B), con un repositorio de 21,9 GB. La cuantizacion combina pesos NVFP4 de 4 bits con activaciones de 16 bits (W4A16), atencion en FP8 y calibracion ponderada por Hessiano local en las capas MLP y lm_head, e incluye la pila de decodificacion especulativa MTP lista para usar. La licencia es Apache 2.0, heredada de la base de Qwen.

En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, esta etiquetado como region:us y no declara idiomas soportados ni pipeline de inferencia. El autor lo describe como un trabajo en investigacion activa, con cuantizaciones actualizadas previstas sobre la misma pagina. La busqueda web realizada no devolvio ningun resultado util relacionado con el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiquetas del repositorio: qwen3, qwen3_5. Incluye una capa MTP (multi-token prediction) para decodificacion especulativa |
| Parametros totales | 18.799.063.792 (~18,8B) segun safetensors; el nombre del repo indica "27b" |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible de forma explicita; el autor indica limitar a ~200k tokens en configuraciones de 2x16 GB |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos 4 bits, activaciones 16 bits), atencion en FP8 (absmax). Receta modelopt 0.45, PTQ por tensor en streaming |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 21,9 GB) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un entrenamiento nuevo. La receta aplicada es una "v3-recipe" propia construida con NVIDIA TensorRT Model Optimizer 0.45 en modo W4A16 NVFP4, con PTQ por tensor en streaming sobre el mismo conjunto de 400 tensores y lista de ignorados que las cuantizaciones Signal publicadas por el mismo autor. La atencion se mantiene en FP8 con escala absmax (el autor afirma que coincide byte a byte con el checkpoint de NVIDIA en un 97-99%). Para MLP y lm_head se aplica calibracion ponderada por Hessiano local: el Hessiano se captura sobre 2048 fragmentos de trafico propio y se resuelve una escala por MSE ponderado, con bracketing e4m3 por bloque. Segun el autor, una calibracion absmax de los mismos pesos atenuaria el efecto de razonamiento telegrafico a aproximadamente la mitad (-49,5% frente a -92,4% de recorte medido), y la relacion de error geomean ponderada por Hessiano es 0,805 frente a la linea base absmax.

Se incluye la pila MTP completa: una capa MTP en BF16 con cabeza de borrador truncada a 40960 ids de vocabulario, lo que permite decodificacion especulativa sin configuracion adicional. La aceptacion MTP medida es 0,412 y las salidas estan verificadas por el modelo objetivo (lossless). El ajuste fino subyacente es una edicion de comportamiento, no de conocimiento: reduce el presupuesto de deliberacion en tareas de codigo con el modo thinking activado, y no modifica los pesos de conocimiento de la base Qwen3.8-27B.

## Capacidades

- Generacion de codigo con modo thinking activado, con especial enfasis en respuestas concisas: ~38 tokens de razonamiento por problema frente a ~701 del checkpoint NVFP4 de referencia.
- Razonamiento de varios pasos con recorte de presupuesto de deliberacion, incluido escalado adaptativo del esfuerzo: mediana de 969 tokens y maximo de 16k en GPQA-Diamond.
- Comprension de codigo ademas de generacion: prediccion de entrada (CRUXEval-I, 92,1%) y de salida (CRUXEval-O, 92,9%).
- Matemticas y razonamiento cuantitativo basico: GSM8K con 98,0%.
- Razonamiento cientifico de nivel doctorado: GPQA-Diamond con 78,3% sobre las 198 preguntas completas.
- Contratos de tool/JSON y cumplimiento de instrucciones: el arnes agentico interno del autor incluye pruebas de tool/JSON contracts y de seguimiento de instrucciones, con 100% en las categorias easy, medium y hard.
- Capacidades agenticas multi-paso y compaction handoff (traspaso de contexto compactado entre pasos de agente), evaluadas en el mismo arnes interno.
- Cambio de tokens de razonamiento: el modelo sigue elevando el esfuerzo en problemas dificiles en lugar de responder de forma rapida y ciega.
- Capacidades multilingues, de vision, audio o tool calling estandar: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de asistente de codigo en produccion con coste de razonamiento bajo: el recorte del 95% en tokens de razonamiento (de ~701 a ~38 por problema) reduce directamente el coste por peticion y la latencia de generacion en pipelines de autocompletado y revision de codigo, manteniendo un pass@1 del 67,5% en el conjunto mixto HumanEval + MBPP-sanitized.
- Integracion en agentes de CI/CD: el modelo puede generar parches, escribir tests y validar contratos de tool/JSON, con resultados del 100% en el arnes agentico interno en las categorias easy, medium y hard (270 ejecuciones sin truncamientos ni fallbacks de razonamiento).
- Atencion al cliente automatizada de varios turnos: la ventana de contexto utilizable de hasta ~200k tokens permite mantener historiales largos de conversacion e instrucciones de negocio sin trocear el contexto, con una cache KV en FP8 de ~3,9 GiB.
- Analisis y comprension de bases de codigo heredadas: las puntuaciones de 92,1% y 92,9% en CRUXEval-I y CRUXEval-O permiten predecir entradas y salidas de funciones para documentar, refactorizar o auditar codigo existente.
- Generacion de codigo en entornos de recursos limitados: el checkpoint NVFP4 esta medido sobre 2x RTX 5060 Ti de 16 GB (32 GB en total), con decodificacion especulativa MTP activada a 54,5 tok/s de velocidad de pared, lo que hace viable el despliegue en hardware de gama de consumo.
- Razonamiento cientifico asistido con presupuesto controlado: con un 78,3% en GPQA-Diamond y una media de ~1.485 tokens de razonamiento (frente a los 10.000-20.000 habituales en modelos de razonamiento), resulta adecuado para pipelines de respuesta cientifica donde el coste por consulta es el factor limitante.
- Evaluacion automatizada de matematicas escolares o de nivel basico: el 98,0% en GSM8K (n=200) con una mediana de 72 tokens de razonamiento lo situan como opcion para tutoria o correccion automatica a bajo coste.
- Servicio de inferencia con decodificacion especulativa: la inclusion de la capa MTP en BF16 permite activar spec decode con aceptacion 0,412 sin coste adicional de velocidad (54,5 frente a 54,1 tok/s del modelo de referencia).

## Benchmarks y rendimiento

Conjunto mantenido de 40 problemas de codigo (20 HumanEval + 20 MBPP-sanitized, disjuntos del entrenamiento), con vLLM 0.28 sobre 2x RTX 5060 Ti de 16 GB, MTP spec decode activado, temperatura 0,6 / top_k 20 / top_p 0,95 / repetition_penalty 1,05 y pass@1 por ejecucion automatizada de tests:

| Modelo (todos NVFP4) | pass@1 | Tokens de razonamiento / problema | Tokens/s de pared |
|---|---|---|---|
| nvidia/Qwen3.8-27B-NVFP4 (stock) | 72,5% | ~701 | 54,1 |
| Este modelo | 67,5% | ~38 (-95%) | 54,5 |

Benchmarks independientes (cuantizacion NVFP4, vLLM 0.28, thinking activado, muestreo propio del autor; razonamiento medido como `completion_tokens_details.reasoning_tokens`):

| Benchmark | Puntuacion | Tokens de razonamiento (media / mediana) |
|---|---|---|
| GSM8K (n=200) | 98,0% | 84 / 72 |
| GPQA-Diamond (198 completas) | 78,3% | 1.485 / 969 |
| CRUXEval-I (800 completas, prediccion de entrada) | 92,1% | 197 / 83 |
| CRUXEval-O (800 completas, prediccion de salida) | 92,9% | 146 / 96 |
| HumanEval+ (164, EvalPlus oficial, greedy) | 90,2% (93,9% base) | 43 / 28 |
| MBPP+ (378, EvalPlus oficial, greedy) | 78,6% (92,9% base) | 91 / 25 |

Arnes agentico interno (30 pruebas en easy/medium/hard - seguimiento de instrucciones, codigo, razonamiento, compaction handoff, contratos de tool/JSON - x10 ejecuciones cada una, servido con vLLM): 100% en easy (40/40), 100% en medium (90/90) y 100% en hard (140/140), sin truncamientos ni fallbacks de razonamiento. El mejor resultado previo en el mismo arnes era 100/100/98,7.

## Requisitos de hardware

- Configuracion medida por el autor: 2x RTX 5060 Ti de 16 GB (32 GB de VRAM agregada) con vLLM 0.28, decodificacion especulativa MTP y cache KV en FP8.
- VRAM de pesos: no disponible el desglose exacto; el repositorio safetensors ocupa 21,9 GB, con pesos NVFP4 de 4 bits y atencion en FP8.
- Contexto y memoria: en 2x16 GB el autor recomienda limitar el contexto a ~200k tokens con un pin de cache KV FP8 de ~3,9 GiB. Las maquinas de una sola tarjeta de 24 GB o mas no ven afectada esta restriccion.
- GPU de gama de consumo: si, el checkpoint esta validado en RTX 5060 Ti de 16 GB, aunque en pares. El comportamiento en una sola tarjeta de 16 GB no esta documentado.
- GPU de datacenter: no se publican medidas especificas para A100, H100 u otras; al ser un checkpoint NVFP4 requiere soporte de FP4 en hardware compatible.
- Opciones de despliegue: vLLM 0.28 es la unica ruta medida. SGLang y TabbyAPI/EXL3 se mencionan como posibles, pero el autor advierte que no se han medido y deben validarse. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Comando de servicio recomendado: `vllm serve Shockem/Qwen3.8-27b-Terse-Coder-NVFP4 --speculative-config '{"method":"mtp","num_speculative_tokens":3}' --kv-cache-dtype fp8`.
- Limitacion de muestreo: con spec decode activado, la configuracion de generacion no debe incluir `min_p` (vLLM 0.28 lo rechaza).
- Rendimiento: 54,5 tokens/s de pared sobre 2x RTX 5060 Ti de 16 GB, practicamente identico a los 54,1 tokens/s del NVFP4 de NVIDIA en el mismo banco, con aceptacion MTP de 0,412.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | pass@1 (40 problemas) | Tokens de razonamiento por problema | Velocidad de pared | Licencia |
|---|---|---|---|---|---|---|
| Shockem/Qwen3.8-27b-Terse-Coder-NVFP4 (este) | 18,8B reales | NVFP4 W4A16 + atencion FP8 | 67,5% | ~38 | 54,5 tok/s | Apache 2.0 |
| nvidia/Qwen3.8-27B-NVFP4 (stock) | No disponible | NVFP4 | 72,5% | ~701 | 54,1 tok/s | No disponible |
| Shockem/Qwen3.8-27b-Terse-Coder (fp16) | No disponible | safetensors fp16 | No disponible | No disponible | No disponible | Apache 2.0 |
| Qwen/Qwen3.8-27B (base original) | No disponible | No disponible | No disponible | No disponible | No disponible | Apache 2.0 |

La comparativa se limita a los datos publicados en la model card. La unica comparacion directa con medicion pareada es frente al checkpoint NVFP4 de NVIDIA, donde este modelo sacrifica 5 puntos de pass@1 a cambio de reducir los tokens de razonamiento en un 95% sin perdida de velocidad de pared.

## Limitaciones y advertencias

- No apilar el adaptador Terse-Coder (Shockem/Qwen3.8-27b-Terse-Coder-LoRA) sobre este checkpoint: la preferencia ya esta fusionada y una doble aplicacion acorta en exceso el razonamiento (63% de pass con fallos de tipo `no_code`).
- Perdida de precision medible frente al NVFP4 de referencia: 67,5% frente a 72,5% de pass@1 en el conjunto de 40 problemas, y caidas notables en HumanEval+ (90,2% frente a 93,9% base) y MBPP+ (78,6% frente a 92,9% base).
- El ajuste es una edicion de comportamiento, no de conocimiento: no anade informacion nueva y esta orientado a codigo con thinking activado.
- El recorte de deliberacion puede perjudicar tareas que dependen de cadenas de razonamiento largas; el propio autor senala GPQA-Diamond como el punto donde esta clase de ajuste tiende a degradarse, aunque en este caso se mantiene en 78,3%.
- Riesgo de alucinacion: no se publica ninguna evaluacion de veracidad, factualidad ni calibracion. Al ser una edicion de comportamiento sobre un modelo base de terceros, hereda los sesgos y el riesgo de alucinacion de Qwen3.8-27B, no caracterizados en la informacion disponible.
- Cobertura de idiomas no declarada, lo que impide garantizar calidad fuera del ingles tecnico usado en los benchmarks.
- Solo se ha medido el rendimiento en vLLM 0.28 sobre 2x RTX 5060 Ti de 16 GB. SGLang, TabbyAPI/EXL3 y otros backends no estan validados.
- Requiere hardware con soporte NVFP4; no se documenta ruta de ejecucion en llama.cpp u Ollama.
- Incompatibilidad practica con `min_p` cuando se activa la decodificacion especulativa en vLLM 0.28.
- Checkpoint de autor comunitario con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de terceros, y las cifras de benchmark proceden del propio autor o de su arnes interno.
- Discrepancia de nomenclatura: el repositorio se llama "27b" pero los pesos suman ~18,8B parametros, lo que puede inducir a error en el dimensionamiento de recursos.
- Repositorio en evolucion activa segun el autor, con cuantizaciones que se iran actualizando; conviene fijar una revision concreta para produccion.
- Licencia Apache 2.0, que permite uso comercial, con la obligacion de conservar los avisos de licencia y copyright originales de Qwen Team (Alibaba Cloud). No se declaran restricciones adicionales anadidas por el autor del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-NVFP4
- Modelo base fp16 (Terse-Coder): https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder
- Adaptador LoRA Terse-Coder: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint NVFP4 de NVIDIA usado como referencia: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- NVIDIA TensorRT Model Optimizer 0.45: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- agentionai/Signal-3.8-27B (referencia de la receta de cuantizacion de la casa): https://huggingface.co/agentionai/Signal-3.8-27B
- Heretic (p-e-w), citado en las atribuciones: https://github.com/p-e-w/heretic
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre este modelo; los resultados devueltos correspondian a paginas de soporte de Microsoft ajenas al tema.
