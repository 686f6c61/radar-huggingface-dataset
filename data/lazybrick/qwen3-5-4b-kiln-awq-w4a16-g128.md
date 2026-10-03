# lazybrick/Qwen3.5-4B-Kiln-AWQ-W4A16-g128

## Resumen

`lazybrick/Qwen3.5-4B-Kiln-AWQ-W4A16-g128` es una version cuantizada a 4 bits del modelo multimodal `Qwen/Qwen3.5-4B` del equipo Qwen, publicada por el usuario lazybrick dentro de la coleccion "Kiln". Se trata de una compresion AWQ W4A16: los pesos del modelo de lenguaje se almacenan en INT4 asimetrico con grupo de tamano 128, mientras que las activaciones, el encoder de vision, los embeddings y la cabeza de salida (`lm_head`) permanecen en BF16. El objetivo es reducir la huella de memoria y el coste de inferencia de un modelo de 4B de parametros con capacidades de imagen-texto, manteniendo la mayor fidelidad posible respecto al modelo original en BF16.

La relevancia de esta ficha es doble. Por un lado, cuantizaciones W4A16 de modelos multimodales de 4B permiten desplegar tareas de vision-lenguaje en GPU de consumo. Por otro, el autor publica el repositorio como parte de un conjunto de compresiones ("Kiln") evaluadas contra el modelo BF16 bajo un protocolo fijo, lo que permite aislar el efecto de la cuantizacion frente a la referencia. El modelo base pertenece a la generacion Qwen3.5, presentada por el equipo Qwen bajo el titulo "Towards Native Multimodal Agents".

Es importante senalar que el repositorio esta marcado explicitamente como **trabajo en curso**: los pesos cuantizados definitivos y los resultados de evaluacion de esta variante aun no estan publicados, el tamano del repositorio figura como 0.0 GB y no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal imagen-texto (encoder de vision + modelo de lenguaje transformer). El detalle interno de Qwen3.5-4B no se especifica en la informacion disponible |
| Parametros totales | 4B (heredados del modelo base Qwen3.5-4B); no se detalla el desglose exacto |
| Parametros activos | No aplica / no disponible: no se indica que el modelo base sea MoE |
| Longitud de contexto | No disponible de forma explicita; el ejemplo oficial de despliegue usa `--max-model-len 32768`. La model card del base cita presupuestos de pensamiento de 32.768 a 81.920 tokens |
| Tipos de cuantizacion | INT4 asimetrico, W4A16, group size 128, AWQ con duo scaling y redondeo round-to-nearest. Activaciones en BF16. `lm_head`, embeddings de tokens y encoder de vision no cuantizados (BF16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors con esquema `compressed-tensors` |
| Toolkit de cuantizacion | llm-compressor 0.13.0 y compressed-tensors 0.18.0 |
| Pipeline | image-text-to-text |
| Estado | Trabajo en curso (pesos y evaluacion pendientes de finalizar) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint `Qwen/Qwen3.5-4B` (revision base `851bf6e`). La receta aplicada combina `AWQModifier(duo_scaling="both")` con `QuantizationModifier(scheme="W4A16_ASYM", group_size=128, ignore=[...])`, seguida de cuantizacion round-to-nearest. Solo se cuantiza el modelo de lenguaje: el encoder de vision (patron de exclusion `re:.*visual.*`), los embeddings de tokens y la proyeccion `lm_head` se mantienen en BF16. El detalle de la arquitectura interna del modelo base (numero de capas, dimension oculta, tipo de atencion, si emplea atencion lineal o hibrida) no se proporciona en la informacion disponible.

Los datos de calibracion son 512 conversaciones extraidas de `HuggingFaceH4/ultrachat_200k` (`train_sft`, revision `8049631`), muestreadas con semilla 42, con la plantilla de chat aplicada y truncadas a 2.048 tokens. Todas las variantes de la coleccion Kiln usan el mismo conjunto de calibracion, lo que busca hacer comparables las distintas compresiones entre si. No se dispone de informacion sobre el entrenamiento original de Qwen3.5-4B (numero de tokens, composicion del dataset, fases de RLHF/DPO) mas alla de la referencia al blog del equipo Qwen.

## Capacidades

- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), heredado del modelo base multimodal.
- Generacion de texto conversacional en modo instruct, con la opcion de desactivar la traza de razonamiento mediante `chat_template_kwargs={"enable_thinking": false}`.
- Modo de pensamiento (thinking mode) en el modelo base, segun el protocolo de evaluacion descrito, que cita `enable_thinking=False` para las pruebas instruct y presupuestos de pensamiento de 32.768 a 81.920 tokens en la model card del base.
- Razonamiento matematico y resolucion de problemas, evidenciado por las tareas GSM8K y MATH-500 del protocolo de evaluacion.
- Comprension de documentos y OCR, con tareas DocVQA, OCRBench y TextVQA en el protocolo.
- Comprension visual general (MMBench-EN, MMMU, MathVista) segun el mismo protocolo.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante; el titulo del trabajo del equipo Qwen ("Towards Native Multimodal Agents") apunta a capacidades de agente en el modelo base, pero no se detalla su alcance.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Digitalizacion y extraccion de datos de documentos: el modelo puede recibir imagenes de facturas, formularios o contratos y devolver texto estructurado. La presencia de DocVQA (ANLS 95,3 en BF16) y OCRBench (86,3 en BF16) en el protocolo de evaluacion indica que la tarea esta contemplada en el modelo base.
- Analisis de imagenes en herramientas internas: clasificacion, descripcion y respuesta a preguntas sobre capturas de pantalla o fotografias, con la ventaja de que la version INT4 reduce la VRAM necesaria para servirlas en una GPU de consumo.
- Asistente conversacional con soporte de imagenes: atencion a usuarios que adjuntan imagenes (productos defectuosos, errores en pantalla) dentro de conversaciones multi-turno, aprovechando el modo instruct sin traza de pensamiento para reducir la latencia.
- Generacion asistida de codigo a partir de capturas o diagramas: el modelo puede transcribir una captura de codigo o un diagrama de arquitectura y continuar la implementacion en texto.
- Tutoria y resolucion de problemas matematicos con enunciados en imagen: el modelo base obtiene 83,4 en MATH-500 y 81,0 en MathVista (BF16), lo que lo hace util para aplicaciones educativas que reciben fotografias de ejercicios.
- Despliegue en el borde o en una unica GPU: al ocupar los pesos cuantizados aproximadamente la cuarta parte que el modelo en BF16, es viable servirlo junto a otros servicios en una GPU de 16-24 GB, siempre que la ventana de contexto se ajuste al presupuesto de memoria disponible.
- Evaluacion comparativa de tecnicas de cuantizacion: investigadores que quieran medir el impacto de AWQ W4A16 frente a BF16 pueden reproducir el protocolo publicado por el autor y comparar con las demas variantes de la coleccion Kiln.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la model card corresponden al modelo base en BF16 (columna de referencia). Los resultados de la variante AWQ W4A16 figuran como pendientes ("WIP") en el momento de la publicacion. No se inventan cifras: la tabla reproduce exactamente lo declarado.

| Tarea | Metrica | BF16 (referencia) | AWQ W4A16 |
|---|---|---:|---:|
| MMLU-Pro | exact match | 74,6 | pendiente |
| GSM8K | exact match, extraccion flexible | 83,2 | pendiente |
| MATH-500 | math_verify | 83,4 | pendiente |
| IFEval | prompt-level strict | 82,3 | pendiente |
| HellaSwag | acc_norm | 65,4 | pendiente |
| ARC-Challenge | acc_norm | 51,1 | pendiente |
| WikiText-2 | perplejidad de palabra (menor es mejor) | 10,95 | pendiente |
| MMBench-EN dev v1.1 | accuracy | 85,4 | pendiente |
| MMMU (val) | accuracy | 69,6 | pendiente |
| MathVista (mini) | accuracy | 81,0 | pendiente |
| OCRBench | score | 86,3 | pendiente |
| DocVQA (val) | ANLS | 95,3 | pendiente |
| TextVQA (val) | accuracy | 82,8 | pendiente |

Protocolo declarado: modo instruct con `enable_thinking=False`, decodificacion greedy y hasta 8.192 tokens generados. Las tareas de texto se evaluan con lm-evaluation-harness 0.4.13 (0-shot, plantilla de chat) sobre vLLM 0.29.0; las tareas de vision, con VLMEvalKit (revision `34a64e6`) contra un servidor vLLM. Para MMBench, MMMU y MathVista se emplea un extractor de respuesta fijo (`gpt-4o-mini`) identico para todos los modelos. El autor advierte que estas cifras no son comparables con las de la model card de Qwen3.5-4B, que reporta modo pensamiento con sampling y prompts especificos por benchmark.

## Requisitos de hardware

Las cifras de memoria que siguen son estimaciones derivadas del tamano del modelo y del esquema de cuantizacion; el autor no publica medidas de VRAM ni de throughput.

- Pesos cuantizados: 4B de parametros en INT4 equivalen a unos 2 GB, a los que hay que sumar las partes no cuantizadas en BF16 (embeddings de tokens, `lm_head` y encoder de vision), lo que en conjunto situa el modelo en un rango aproximado de 3 a 4,5 GB en disco.
- VRAM para inferencia: alrededor de 5-7 GB con contextos cortos, y por encima de 8-10 GB si se aprovecha la ventana de 32.768 tokens indicada en el ejemplo de despliegue, debido al cache KV. Estimacion orientativa.
- GPU de consumo: cabe en tarjetas con 12 GB o mas, como RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, siempre ajustando `--max-model-len` a la memoria libre.
- GPU de centro de datos: A100, H100 y L40S quedan ampliamente sobredimensionadas para este tamano; son utiles para servir muchas replicas o lotes grandes.
- Despliegue: el autor documenta vLLM como via principal, ya que detecta las capas `compressed-tensors` y selecciona los kernels cuantizados correspondientes (`vllm serve lazybrick/Qwen3.5-4B-Kiln-AWQ-W4A16-g128 --max-model-len 32768`). Tambien es cargable con transformers. No se proporcionan pesos GGUF en este repositorio, por lo que llama.cpp y Ollama requeririan una conversion adicional.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta variante con su propio modelo base. No se dispone de datos publicados de otras compresiones de Qwen3.5-4B ni de cuantizaciones de terceros en el material proporcionado.

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-4B | 4B | BF16 | No especificado en la informacion disponible (la model card del base cita presupuestos de 32.768 a 81.920 tokens en modo pensamiento) | Apache 2.0 | Publico en HuggingFace |
| lazybrick/Qwen3.5-4B-Kiln-AWQ-W4A16-g128 | 4B | AWQ W4A16, INT4 asimetrico, g128 | Ejemplo de despliegue con 32.768 tokens | Apache 2.0 | Publico, pero marcado como trabajo en curso |
| Otras variantes de la coleccion Kiln | 4B | No disponible | No disponible | Apache 2.0 (presumiblemente) | Referenciadas en la coleccion del autor |
| Cuantizaciones GGUF / GPTQ de Qwen3.5-4B | 4B | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Repositorio incompleto: la propia model card indica "Status: work in progress". El tamano del repositorio figura como 0.0 GB, no hay descargas ni valoraciones, y los pesos definitivos pueden cambiar. No es apto para produccion en su estado actual.
- Sin resultados de evaluacion de la variante cuantizada: todas las metricas de la columna AWQ W4A16 estan pendientes, por lo que no se puede cuantificar la degradacion introducida por la cuantizacion.
- Perdida de precision por cuantizacion: la cuantizacion INT4 de los pesos del modelo de lenguaje puede degradar tareas sensibles a la precision numerica, como el razonamiento matematico de varios pasos o la generacion de codigo. El autor disena el protocolo precisamente para medir ese efecto, pero aun no lo ha publicado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala (4B de parametros); puede inventar contenido en tareas de OCR, descripcion de imagenes o respuesta a preguntas sobre documentos, especialmente con imagenes de baja calidad o texto denso.
- Idiomas soportados no declarados: no hay lista oficial de idiomas para esta variante ni en los metadatos del repositorio. El castellano no esta confirmado.
- Longitud de contexto no especificada de forma oficial: el unico dato operativo es el `--max-model-len 32768` del ejemplo de despliegue, que es una recomendacion de configuracion, no una garantia de calidad en contextos largos.
- Capacidades de agente y tool calling sin confirmar: aunque el modelo base se presenta en el ecosistema Qwen bajo el titulo "Towards Native Multimodal Agents", no se detalla en la informacion disponible el soporte real de function calling en esta variante.
- Licencia: Apache 2.0, heredada del modelo base, permite uso comercial sin restricciones adicionales conocidas, pero obliga a citar el trabajo del equipo Qwen segun el BibTeX proporcionado. El autor no anade terminos propios.
- Datos de calibracion en ingles: las 512 conversaciones de calibracion provienen de `ultrachat_200k`, un conjunto predominantemente en ingles, lo que puede sesgar el comportamiento de la cuantizacion hacia ese idioma.
- Enlaces de busqueda web no relevantes: las busquedas realizadas no han devuelto documentacion tecnica sobre este modelo; los resultados obtenidos corresponden a contenido no relacionado y se descartan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lazybrick/Qwen3.5-4B-Kiln-AWQ-W4A16-g128
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Coleccion Kiln (Qwen3.5-4B "Fired Small"): https://huggingface.co/collections/lazybrick/kiln-qwen35-4b-fired-small-6ac04982f4f1ce50a97da56d
- Resultados de evaluacion por muestra: https://huggingface.co/datasets/lazybrick/kiln-evals
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- VLMEvalKit: https://github.com/open-compass/VLMEvalKit
