# lazybrick/Qwen3.5-4B-Kiln-AutoRound-W4A16-g128

## Resumen

Qwen3.5-4B-Kiln-AutoRound-W4A16-g128 es una compresion cuantizada del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario lazybrick dentro de la coleccion "Kiln". El checkpoint aplica cuantizacion de pesos a INT4 con el algoritmo AutoRound, manteniendo las activaciones en BF16 (esquema W4A16) y un tamano de grupo de 128. El resultado es un repositorio de 3,80 GB frente a los 9,32 GB del modelo base en BF16, es decir, 2,45 veces mas pequeno, con 4.539.265.536 parametros totales.

Se trata de un modelo de tipo image-text-to-text: la pipeline declarada es multimodal con vision, y la receta de cuantizacion excluye explicitamente el codificador de vision (patron `re:.*visual.*`), los embeddings de tokens y la cabeza `lm_head`, que permanecen en BF16. El interes practico para un desarrollador es que permite desplegar un modelo multimodal de ~4,5B en GPUs de gama consumer o en una sola GPU de datacenter con margen para cache KV, usando kernels cuantizados nativos en vLLM sin pasos de conversion adicionales.

El estado del artefacto es de trabajo en curso: el autor declara que los resultados de benchmark de esta variante se estan finalizando. La model card publica las referencias del modelo base BF16 bajo un protocolo fijo de evaluacion, pero las celdas correspondientes a la variante cuantizada aparecen como "WIP". El repositorio no tiene descargas ni likes en el momento de redactar esta ficha, y no se dispone de informacion sobre idiomas soportados ni sobre arquitectura interna mas alla de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; modelo multimodal image-text-to-text de la familia Qwen3.5, con codificador de vision diferenciado del modelo de lenguaje |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible; el ejemplo de despliegue de vLLM usa `--max-model-len 32768` |
| Tipos de cuantizacion | W4A16: pesos INT4 simetricos con group size 128, activaciones BF16 (sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors con formato `compressed-tensors` |

Datos adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Identificador | lazybrick/Qwen3.5-4B-Kiln-AutoRound-W4A16-g128 |
| Modelo base | Qwen/Qwen3.5-4B (revision `851bf6e`) |
| Relacion con el base | quantized |
| Biblioteca | transformers |
| Tamano del repositorio | 3,8 GB (checkpoint 3,80 GB; BF16: 9,32 GB) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-03 |
| Ultima actualizacion | 2026-10-03 |
| Componentes no cuantizados | `lm_head`, embeddings de tokens, codificador de vision (`re:.*visual.*`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen3.5-4B en la documentacion proporcionada, mas alla de su caracter multimodal (pipeline `image-text-to-text`) y de la presencia de un codificador de vision que la receta de cuantizacion deja intacto. El toolkit declarado por el autor incluye `flash-linear-attention` 0.5.2, lo que sugiere componentes de atencion lineal en el modelo, pero la model card no lo confirma ni detalla. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esta ficha no inventa esos datos.

Lo que si esta documentado con precision es el proceso de cuantizacion. Se aplico el modificador `AutoRoundModifier(scheme="W4A16", group_size=128, iters=200, ignore=[...])`, de modo que cada bloque ajusta sus parametros de redondeo y recorte mediante descenso de gradiente con signo durante 200 iteraciones con batch 8. El conjunto de calibracion son las mismas 512 conversaciones empleadas en el resto de variantes Kiln, extraidas de `HuggingFaceH4/ultrachat_200k` (`train_sft`, revision `8049631`, semilla 42, con la plantilla de chat aplicada), concatenadas en orden y cortadas en bloques de 2.048 tokens; AutoRound consume los primeros 128 bloques, su propio numero de muestras por defecto. Las herramientas empleadas fueron `llm-compressor` 0.13.0, `compressed-tensors` 0.18.0, `auto-round` 0.14.2 y `flash-linear-attention` 0.5.2.

## Capacidades

- Generacion de texto conversacional en modo instruct, con la posibilidad de desactivar la traza de razonamiento mediante `chat_template_kwargs={"enable_thinking": false}`.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), incluyendo tareas evaluadas por el autor como document VQA, OCR, TextVQA, MMBench, MMMU y MathVista sobre el modelo base.
- Razonamiento matematico y resolucion de problemas, segun las tareas GSM8K y MATH-500 del protocolo de evaluacion del modelo base.
- Seguimiento de instrucciones, medido con IFEval en el protocolo del autor.
- Capacidades de codigo: no documentadas explicitamente en la informacion proporcionada.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada; el titulo del articulo citado del equipo Qwen es "Towards Native Multimodal Agents", pero no hay detalles tecnicos en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: vision (imagen a texto) confirmada por la pipeline y por la preservacion del codificador visual en BF16; modo thinking disponible en el modelo base, desactivado en el protocolo de evaluacion del autor.

## Casos de uso

- Extraccion de datos de documentos escaneados: el modelo puede recibir una imagen de factura, formulario o albaran y devolver campos estructurados, aprovechando que el codificador de vision se mantiene en BF16 y por tanto no sufre la perdida de precision de la cuantizacion aplicada al modelo de lenguaje.
- Digitalizacion de archivos historicos o prensa: uso de las capacidades de OCR y DocVQA para transcribir texto en imagenes con layout complejo, con un coste de VRAM que permite ejecutar el modelo en una sola GPU de 8-12 GB.
- Asistente de soporte tecnico con capturas de pantalla: el modelo puede interpretar una captura de error enviada por el usuario y generar una respuesta textual, en un despliegue vLLM con batching continuo para atender varias conversaciones simultaneas.
- Analisis de graficos y tablas en informes: dado que el modelo base obtiene 81,0 en MathVista (mini) y 95,3 de ANLS en DocVQA segun el protocolo del autor, es adecuado para extraer valores numericos de graficos y responder preguntas cuantitativas sobre ellos.
- Clasificacion y enrutado de tickets con imagen adjunta: integrado como servicio HTTP en vLLM, el modelo puede etiquetar tickets que incluyen fotos de producto o capturas y derivarlos al equipo correspondiente, reduciendo el consumo de VRAM frente a alternativas de mayor tamano.
- Generacion de descripciones de producto a partir de fotografias: catalogos de e-commerce donde se necesita texto descriptivo en varios idiomas; conviene validar antes el soporte multilingue, que no esta documentado.
- Prototipado en portatil con GPU consumer: escenarios de investigacion o demos donde el presupuesto de VRAM es limitado y se prefiere un checkpoint de 3,80 GB a los 9,32 GB del modelo en BF16.
- Evaluacion comparativa de tecnicas de cuantizacion: al formar parte de la coleccion Kiln, sirve como referencia para medir el impacto de AutoRound W4A16 frente a otras recetas sobre el mismo modelo base.

## Benchmarks y rendimiento

El autor publica la tabla de referencia del modelo base BF16, pero las celdas de la variante AutoRound W4A16 figuran como "WIP" (trabajo en curso). No se han publicado resultados de benchmarks de esta variante en la informacion disponible.

| Tarea | Metrica | BF16 (referencia) | AutoRound W4A16 |
|---|---|---:|---:|
| MMLU-Pro | exact match | 74,6 | WIP |
| GSM8K | exact match, extraccion flexible | 83,2 | WIP |
| MATH-500 | math_verify | 83,4 | WIP |
| IFEval | prompt-level strict | 82,3 | WIP |
| HellaSwag | acc_norm | 65,4 | WIP |
| ARC-Challenge | acc_norm | 51,1 | WIP |
| WikiText-2 | perplejidad de palabra (menor es mejor) | 10,95 | WIP |
| MMBench-EN dev v1.1 | accuracy | 85,4 | WIP |
| MMMU (val) | accuracy | 69,6 | WIP |
| MathVista (mini) | accuracy | 81,0 | WIP |
| OCRBench | score | 86,3 | WIP |
| DocVQA (val) | ANLS | 95,3 | WIP |
| TextVQA (val) | accuracy | 82,8 | WIP |

Notas sobre el protocolo, segun el autor: modo instruct con `enable_thinking=False`, decodificacion greedy y hasta 8.192 tokens generados. Las tareas de texto se evaluaron con lm-evaluation-harness 0.4.13 (0-shot, plantilla de chat) sobre vLLM 0.29.0; las tareas de vision, con VLMEvalKit (revision `34a64e6`) contra un servidor vLLM. Para MMBench, MMMU y MathVista se emplea un extractor de respuestas fijo (`gpt-4o-mini`) identico para todos los modelos. El autor advierte que estas cifras no son comparables con las de la model card oficial de Qwen3.5-4B, que reporta modo thinking con sampling y presupuestos de 32.768 a 81.920 tokens.

## Requisitos de hardware

- Pesos en disco: 3,80 GB (INT4). El modelo base en BF16 ocupa 9,32 GB.
- VRAM estimada para inferencia: aproximadamente 4,5-5 GB solo para pesos y overhead de runtime; con cache KV en BF16 hay que sumar la memoria del contexto. A 32.768 tokens de contexto la estimacion se situa en el rango de 8-12 GB, dependiendo del numero de capas KV y de la configuracion del servidor. Son estimaciones derivadas del tamano del checkpoint, no cifras publicadas por el autor.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4070 / 4070 Ti, RTX 4080, RTX 4090 y RTX 5090. En GPUs de 8 GB es viable con contextos cortos y `--max-model-len` reducido.
- GPU de datacenter: una A100 40 GB, L40S, H100 o similar permite servir varias replicas o contextos largos con margen amplio.
- Opciones de despliegue: vLLM es la via documentada por el autor (`vllm serve lazybrick/Qwen3.5-4B-Kiln-AutoRound-W4A16-g128 --max-model-len 32768`), ya que detecta el formato `compressed-tensors` y selecciona los kernels cuantizados correspondientes. No se mencionan otros motores.
- GGUF / llama.cpp / Ollama: no disponibles. El repositorio solo contiene safetensors en formato `compressed-tensors`; usarlo con llama.cpp requeriria una conversion adicional que el autor no documenta.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de la variante cuantizada, por lo que la comparacion de rendimiento con alternativas no puede cuantificarse. La comparacion con el modelo base si puede hacerse en terminos de peso y licencia.

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lazybrick/Qwen3.5-4B-Kiln-AutoRound-W4A16-g128 | 4,54B | no disponible (ejemplo con 32.768) | safetensors compressed-tensors, W4A16 INT4 g128 | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4,54B | no disponible | BF16 safetensors, 9,32 GB | apache-2.0 | HuggingFace |
| Otras variantes de la coleccion Kiln (Qwen3.5-4B) | 4,54B | no disponible | no disponible en detalle | apache-2.0 (presumiblemente) | HuggingFace |
| Otras cuantizaciones de terceros del mismo base (GPTQ, AWQ, GGUF) | 4,54B | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La ventaja medible de esta variante es el tamano: 3,80 GB frente a 9,32 GB, un factor de 2,45. El coste en calidad esta pendiente de publicacion por parte del autor.

## Limitaciones y advertencias

- Estado "work in progress": el propio autor indica que los resultados de benchmark de esta variante se estan finalizando. No hay evidencia publicada de la degradacion real introducida por la cuantizacion W4A16 frente al BF16.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion para esta variante ni para el modelo base en la informacion disponible. Es un riesgo inherente a los modelos generativos y debe mitigarse con verificacion externa en produccion.
- La cuantizacion de pesos a INT4 puede degradar tareas sensibles a la precision, como razonamiento matematico de varios pasos o extraccion exacta de texto en imagenes. El autor no ha publicado todavia la comparacion por tarea.
- Idiomas soportados: no disponibles. No hay confirmacion de cobertura multilingue, por lo que no conviene asumirla sin evaluacion previa.
- Longitud de contexto: no disponible en la documentacion. El valor de 32.768 del ejemplo de vLLM es una recomendacion de despliegue, no una especificacion confirmada del modelo.
- Tool calling, function calling y comportamiento agentico: no documentados. Los tags de HuggingFace incluyen `conversational`, pero no hay evidencia de soporte estructurado de herramientas.
- Restricciones de licencia: apache-2.0, heredada del modelo base, lo que permite uso comercial. Se debe conservar la atribucion al equipo Qwen y citar su trabajo. Conviene revisar la licencia del modelo base en el enlace indicado por el autor antes de un despliegue comercial.
- Artefacto sin traccion: 0 descargas y 0 likes. No hay comunidad que haya validado el checkpoint, ni issues publicos que documenten problemas de carga o de kernels.
- Compatibilidad de motores limitada al ecosistema vLLM + compressed-tensors segun la documentacion disponible; no hay GGUF, por lo que queda fuera del ecosistema llama.cpp/Ollama sin conversion previa.
- La calibracion se realizo solo con 128 bloques de 2.048 tokens procedentes de `ultrachat_200k`, un dataset de conversacion en ingles mayoritariamente. El comportamiento fuera de ese dominio (documentos largos, codigo, idiomas distintos) no esta validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lazybrick/Qwen3.5-4B-Kiln-AutoRound-W4A16-g128
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Coleccion Kiln de compresiones de Qwen3.5-4B: https://huggingface.co/collections/lazybrick/kiln-qwen35-4b-fired-small-6ac04982f4f1ce50a97da56d
- Dataset de evaluacion con predicciones y puntuaciones: https://huggingface.co/datasets/lazybrick/kiln-evals
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- VLMEvalKit: https://github.com/open-compass/VLMEvalKit
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos tratan sobre funciones de busqueda visual de navegadores y no guardan relacion con el modelo.
