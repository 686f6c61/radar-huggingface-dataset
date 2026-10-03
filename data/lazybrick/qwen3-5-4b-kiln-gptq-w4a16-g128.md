# lazybrick/Qwen3.5-4B-Kiln-GPTQ-W4A16-g128

## Resumen

Qwen3.5-4B-Kiln-GPTQ-W4A16-g128 es una version cuantizada del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario lazybrick dentro del proyecto Kiln. Se trata de una compresion post-entrenamiento en formato GPTQ con pesos INT4 simetricos en grupos de 128 y activaciones en BF16 (esquema W4A16), generada con llm-compressor 0.13.0 y empaquetada en compressed-tensors sobre safetensors. No es un modelo nuevo: no hay reentrenamiento ni ajuste fino, solo cuantizacion de los pesos del transformer de lenguaje.

El modelo base pertenece a la familia Qwen3.5 del equipo Qwen, descrita en su blog como "Towards Native Multimodal Agents" (febrero de 2026). El pipeline declarado es image-text-to-text, la licencia es Apache 2.0 y el tamano nominal es de 4.000 millones de parametros en una arquitectura densa, no MoE.

Su relevancia practica esta en el despliegue: al reducir los pesos a 4 bits, el modelo queda al alcance de GPU de consumo, algo coherente con el objetivo del proyecto Kiln de servir, entrenar y evaluar Qwen3.5-4B en una sola GPU. La contrapartida es que el repositorio esta marcado explicitamente como trabajo en curso: los pesos cuantizados y los resultados de evaluacion de esta variante aun no estan publicados, por lo que hoy no existe evidencia medida de la degradacion introducida por la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (pipeline image-text-to-text); detalle de bloques no disponible |
| Parametros totales | 4B (segun el modelo base Qwen/Qwen3.5-4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en el repositorio; la receta de vLLM del modelo base cita 262K tokens y el ejemplo del autor usa `--max-model-len 32768` |
| Tipos de cuantizacion | GPTQ W4A16: INT4 simetrico, group size 128; activaciones BF16; `lm_head`, embeddings y vision encoder sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | compressed-tensors sobre safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer denso de 4B parametros con capacidad multimodal nativa (entrada de imagen y texto). La model card de esta variante no detalla el numero de capas, dimensiones de atencion ni el volumen de tokens de preentrenamiento del modelo original; esa informacion no esta disponible en los datos proporcionados. Si se conocen los componentes que la autora deja fuera de la cuantizacion: el codificador de vision (patron `re:.*visual.*`), los embeddings de tokens y el `lm_head`, que se mantienen en BF16. Esa decision protege las partes mas sensibles a la precision, pero tambien limita el ahorro de memoria real respecto a un INT4 completo.

El proceso de cuantizacion se aplica con `GPTQModifier(scheme="W4A16", group_size=128, ...)` sobre 512 conversaciones de HuggingFaceH4/ultrachat_200k (`train_sft`, revision `8049631`), muestreadas con semilla 42, con la plantilla de chat aplicada y truncadas a 2.048 tokens. Todas las variantes de la coleccion Kiln comparten ese mismo conjunto de calibracion, de modo que las diferencias entre ellas sean atribuibles al esquema de cuantizacion. No hay RLHF, DPO ni ninguna fase de alineamiento adicional especifica de esta variante.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones en modo instruct (`enable_thinking=False`).
- Razonamiento y conocimiento general, evidenciado por las tareas de evaluacion previstas: MMLU-Pro, HellaSwag y ARC-Challenge.
- Razonamiento matematico: GSM8K y MATH-500 forman parte del protocolo de evaluacion del modelo.
- Seguimiento de instrucciones con restricciones: IFEval, con metrica prompt-level strict.
- Comprension de imagen y texto: el pipeline declarado es image-text-to-text y la evaluacion incluye MMBench-EN, MMMU y MathVista.
- OCR y comprension de documentos: OCRBench, DocVQA y TextVQA estan en el conjunto de tareas previsto.
- Modo thinking de la familia Qwen3.5: la model card recomienda pasar `chat_template_kwargs={"enable_thinking": false}` para obtener respuestas directas sin traza de razonamiento, lo que implica que el modo con traza existe en el modelo base.
- Soporte de tool calling, function calling y flujos de agente multi-paso: no documentado en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Digitalizacion de documentos con OCR: el modelo se evalua en OCRBench y DocVQA, por lo que es adecuado para extraer texto y responder preguntas sobre facturas, formularios o informes escaneados en un pipeline por lotes, con el ahorro de memoria que aporta el INT4.
- Asistente multimodal de atencion al cliente: puede procesar capturas de pantalla o fotos de producto junto al texto del usuario en conversaciones multi-turno; conviene fijar `--max-model-len` en funcion de la VRAM disponible.
- Apoyo a la accesibilidad: descripcion de imagenes y respuesta a preguntas sobre contenido visual (tareas tipo MMMU y MMBench) para usuarios con discapacidad visual.
- Tutorizacion de matematicas sobre enunciados con figuras: MathVista y MATH-500 indican capacidad de resolver problemas que combinan diagrama y texto.
- Analisis de graficos y tablas en informes: TextVQA y DocVQA cubren la lectura de informacion numerica presentada visualmente, util para resumenes financieros o cientificos.
- Inferencia local en estaciones de trabajo con GPU de consumo: al ser una variante W4A16 servible con vLLM, permite mantener el modelo en una unica GPU de gama alta-consumo sin depender de APIs externas.
- Despliegue en entornos aislados o con requisitos de soberania de datos: la licencia Apache 2.0 y la posibilidad de ejecucion local facilitan el uso en sanidad, legal o sector publico donde no se pueden enviar datos a terceros.
- Evaluacion comparativa de esquemas de cuantizacion: como parte de la coleccion Kiln, sirve para medir el impacto de GPTQ W4A16 frente a otras compresiones del mismo modelo base bajo un protocolo fijo.

## Benchmarks y rendimiento

Los unicos resultados publicados en el repositorio son los del modelo base en BF16, usados como referencia. La columna de la variante GPTQ W4A16 aparece marcada como WIP (en curso) en la propia model card, por lo que no hay todavia medicion del efecto de la cuantizacion.

| Tarea | Metrica | BF16 (referencia) | GPTQ W4A16 |
|---|---|---:|---:|
| MMLU-Pro | exact match | 74,6 | pendiente |
| GSM8K | exact match, flexible extract | 83,2 | pendiente |
| MATH-500 | math_verify | 83,4 | pendiente |
| IFEval | prompt-level strict | 82,3 | pendiente |
| HellaSwag | acc_norm | 65,4 | pendiente |
| ARC-Challenge | acc_norm | 51,1 | pendiente |
| WikiText-2 | word perplexity (menor es mejor) | 10,95 | pendiente |
| MMBench-EN dev v1.1 | accuracy | 85,4 | pendiente |
| MMMU (val) | accuracy | 69,6 | pendiente |
| MathVista (mini) | accuracy | 81,0 | pendiente |
| OCRBench | score | 86,3 | pendiente |
| DocVQA (val) | ANLS | 95,3 | pendiente |
| TextVQA (val) | accuracy | 82,8 | pendiente |

Protocolo: modo instruct (`enable_thinking=False`), decodificacion greedy, hasta 8.192 tokens generados. Las tareas de texto se ejecutan con lm-evaluation-harness 0.4.13 (0-shot, plantilla de chat) sobre vLLM 0.29.0; las de vision con VLMEvalKit (revision `34a64e6`) contra un servidor vLLM. En MMBench, MMMU y MathVista un extractor fijo externo (gpt-4o-mini) lee la opcion elegida. La revision del modelo base es `851bf6e`. El autor advierte que estas cifras no son comparables con las de la model card de Qwen3.5-4B, que reporta modo thinking con sampling, presupuesto de 32.768 a 81.920 tokens y prompts especificos por benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: las guias de terceros para el modelo base en Q4 situan el peso en torno a 2,5-3 GB; en esta variante hay que sumar los componentes que permanecen en BF16 (embeddings, `lm_head` y el codificador de vision), por lo que el consumo real sera superior a esa cifra. No hay medicion publicada de VRAM total para esta variante.
- GPU recomendadas: la receta de vLLM para Qwen3.5-4B indica que el modelo base cabe en GPU de consumo de 16 GB con la ventana completa de 262K tokens. Para esta variante INT4 el margen deberia ser mayor en pesos, aunque la cache KV de contexto largo sigue siendo el factor dominante.
- Cabe en GPU de consumo: si, segun la referencia anterior para el modelo base, en tarjetas de 16 GB o mas; en modelos de 8-12 GB la viabilidad depende de la longitud de contexto configurada.
- Opciones de despliegue: vLLM es la via documentada por el autor (`vllm serve lazybrick/Qwen3.5-4B-Kiln-GPTQ-W4A16-g128 --max-model-len 32768`), que selecciona automaticamente los kernels cuantizados. El formato compressed-tensors es el esperado por ese runtime. No se documenta soporte para llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Kiln-GPTQ-W4A16-g128 | 4B denso, multimodal | no disponible (receta vLLM del base: 262K) | compressed-tensors safetensors, INT4 W4A16 g128 | Apache 2.0 | Pesos pendientes (repositorio en 0,0 GB) |
| Qwen/Qwen3.5-4B (BF16) | 4B denso, multimodal | 262K segun la receta de vLLM | safetensors BF16 | Apache 2.0 | Publicado; es la referencia de calidad |
| Otras variantes de la coleccion Kiln para Qwen3.5-4B | 4B denso, multimodal | las del modelo base | otros esquemas de compresion con la misma calibracion | Apache 2.0 | Pendientes de resultados por variante |
| Modelos de la misma familia de mayor tamano (por ejemplo, 9B) | mayor | no disponible | no disponible | Apache 2.0 (familia Qwen) | No verificado en la informacion disponible |

La comparacion principal es contra el propio modelo base sin cuantizar, ya que la coleccion Kiln existe precisamente para medir la perdida de calidad respecto a BF16. Frente a modelos de otras familias del mismo rango no hay datos en la informacion proporcionada.

## Limitaciones y advertencias

- Estado del repositorio: marcado explicitamente como trabajo en curso. Los pesos cuantizados y los resultados de evaluacion aun no estan publicados, y el tamano del repositorio figura como 0,0 GB, por lo que el artefacto no es utilizable tal cual.
- Degradacion por cuantizacion no medida: la columna GPTQ W4A16 de la tabla de benchmarks esta pendiente. Sin esos datos no puede afirmarse que la perdida de calidad sea aceptable para un caso de produccion.
- Ahorro de memoria limitado: al mantener en BF16 el codificador de vision, los embeddings y el `lm_head`, el modelo no alcanza la reduccion teorica de un INT4 completo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje del rango 4B; en tareas de OCR y documentos el riesgo se concreta en cifras, nombres o importes mal transcritos. Conviene validacion posterior en flujos criticos.
- Contexto e idioma: la model card no declara idiomas soportados ni longitud de contexto oficial para esta variante. El ejemplo del autor limita el contexto a 32.768 tokens, muy por debajo de los 262K que la receta de vLLM atribuye al modelo base.
- Comparabilidad de metricas: las cifras del modelo base incluidas aqui no son comparables con las publicadas en la model card de Qwen3.5-4B, por diferencias de modo (instruct frente a thinking), presupuesto de tokens y prompts.
- Licencia: Apache 2.0, heredada del modelo base, permite uso comercial. Se pide citar el trabajo del equipo Qwen. No se detectan clausulas adicionales, pero la licencia del modelo base debe consultarse en su propio repositorio.
- Compatibilidad de runtime: el formato compressed-tensors esta orientado a vLLM. Otros motores de inferencia pueden requerir conversion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lazybrick/Qwen3.5-4B-Kiln-GPTQ-W4A16-g128
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Coleccion Kiln para Qwen3.5-4B: https://huggingface.co/collections/lazybrick/kiln-qwen35-4b-fired-small-6ac04982f4f1ce50a97da56d
- Resultados detallados de evaluacion (kiln-evals): https://huggingface.co/datasets/lazybrick/kiln-evals
- Conjunto de calibracion ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Proyecto Kiln: https://ericflo.github.io/kiln/
- Receta de vLLM para Qwen3.5-4B: https://recipes.vllm.ai/Qwen/Qwen3.5-4B
- Ficha tecnica y requisitos de VRAM (apxml): https://apxml.com/models/qwen35-4b
- Guia de despliegue local de Qwen 3.5 4B: https://theaibench.ai/models/qwen-3-5-4b/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- VLMEvalKit: https://github.com/open-compass/VLMEvalKit
