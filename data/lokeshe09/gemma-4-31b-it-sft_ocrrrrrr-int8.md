# lokeshe09/gemma-4-31B-it-SFT_OCRRRRRR-INT8

## Resumen

El modelo `lokeshe09/gemma-4-31B-it-SFT_OCRRRRRR-INT8` es una version cuantizada a INT8 del modelo `lokeshe09/gemma-4-31B-it-SFT_OCRRRRRR`, publicado por el usuario lokeshe09 en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos: el autor ha aplicado cuantizacion de 8 bits sobre un modelo base ya existente, empleando la herramienta `llm-compressor` del proyecto vLLM. El resultado es un checkpoint multimodal de tipo imagen-texto con 31.273.088.876 parametros (unos 31,27 mil millones) y un repositorio de 33,3 GB.

La relevancia de esta ficha es fundamentalmente practica: la cuantizacion INT8 reduce a la mitad, aproximadamente, el espacio de pesos respecto a una version en bf16/fp16, lo que abarata el despliegue de un modelo de mas de 30.000 millones de parametros en infraestructura con GPU de 48-80 GB de VRAM. Ademas, la model card indica que el codificador de vision, la `lm_head`, los embeddings y las capas de normalizacion se han mantenido en su precision original, una decision habitual para preservar la calidad en los puntos mas sensibles numericamente.

Ahora bien, la informacion publicada es muy escasa: no se documentan contexto, idiomas, composicion del dataset de entrenamiento, ni resultados de benchmarks. El modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha, y su fecha de creacion (2026-09-12) es reciente. Conviene tratarlo, por tanto, como un artefacto experimental no auditado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador de vision + decodificador de lenguaje); detalles no disponibles |
| Parametros totales | 31.273.088.876 (~31,27 B) |
| Parametros activos | No disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (w8a8, formato compressed-tensors); generado con llm-compressor |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de dos hechos: el modelo es de tipo `image-text-to-text` y existe un "vision encoder" (codificador de vision) cuya precision se ha preservado. La etiqueta `gemma4` y el nombre del identificador sugieren que la arquitectura base pertenece a la familia Gemma, concretamente a una variante "4" de 31B con ajuste por instrucciones (`it`), pero no se aporta ninguna confirmacion tecnica al respecto. El nombre incluye el sufijo `SFT_OCRRRRRR`, que apunta a un ajuste supervisado (supervised fine-tuning) sobre una tarea relacionada con OCR, aunque el autor no lo documenta.

En cuanto al "entrenamiento" del artefacto publicado, no hay tal: el proceso aplicado es una cuantizacion post-entrenamiento (PTQ) con `llm-compressor`. La innovacion tecnica destacable es el esquema de cuantizacion selectiva: se cuantizan a INT8 los pesos de las capas lineales del decodificador, mientras que el codificador de vision, la cabeza de lenguaje (`lm_head`), la matriz de embeddings y las capas de normalizacion permanecen en su precision original. Esto reduce el riesgo de degradacion en la proyeccion al vocabulario y en la representacion visual, a costa de que el ahorro de memoria sea algo inferior al teorico del 50 %.

No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni ninguna otra fase de alineamiento del modelo base.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el sufijo `-it` indican ajuste por instrucciones orientado a dialogo multi-turno.
- Comprension conjunta de imagen y texto: el pipeline declarado es `image-text-to-text`, por lo que acepta entradas con imagenes acompanadas de instrucciones en lenguaje natural.
- Extraccion de texto en imagenes: el sufijo `OCRRRRRR` del modelo base sugiere un ajuste especifico para tareas de reconocimiento optico de caracteres, aunque no esta documentado.
- Cuantizacion de 8 bits: inferencia con pesos INT8, lo que reduce los requisitos de memoria frente al modelo base.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Digitalizacion de documentos escaneados: dado el posible ajuste orientado a OCR del modelo base, puede emplearse para extraer texto estructurado de facturas, contratos o formularios a partir de imagenes, enviando la imagen junto a una instruccion de extraccion en formato JSON.
- Atencion al cliente multimodal: el modelo puede gestionar conversaciones en las que el usuario adjunta capturas de pantalla o fotografias de un producto defectuoso, combinando la descripcion visual con el historial textual del dialogo.
- Back office financiero: procesamiento por lotes de justificantes de gasto y tickets, extrayendo importes, fechas y emisores para alimentar un sistema de contabilidad. La cuantizacion INT8 permite servir el modelo en una unica GPU de 80 GB con mayor concurrencia.
- Accesibilidad: generacion de descripciones textuales de imagenes para usuarios con discapacidad visual, integrable en un servicio web con vLLM como backend de inferencia.
- Moderacion de contenido: analisis combinado de texto e imagen para clasificar contenido potencialmente problematico en plataformas de user-generated content.
- Extraccion de informacion de informes y graficos: interpretacion de graficos de barras o tablas incluidas en PDF convertidos a imagen, devolviendo los datos en texto estructurado para su posterior analisis.
- Asistente interno sobre documentacion tecnica escaneada: despliegue on-premise del modelo en un servidor con A100/H100 para consultas sobre manuales digitalizados, evitando enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos del modelo: aproximadamente 31,3 GB solo para las capas cuantizadas del decodificador, a los que se suman los embeddings, la `lm_head`, las capas de normalizacion y el codificador de vision en precision original. El repositorio completo ocupa 33,3 GB.
- VRAM estimada para inferencia: del orden de 34-45 GB contando pesos y overhead del runtime, y mas si se usan contextos largos y lotes grandes por el cache KV en precision original.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB, H200, L40S 48 GB y RTX 6000 Ada 48 GB. En GPUs de 48 GB el margen es ajustado y dependera de la longitud de contexto configurada.
- GPUs de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB). Seria necesario tensor parallel sobre 2x RTX 4090 (48 GB combinados), con la penalizacion de rendimiento que implica la comunicacion entre GPUs sin NVLink.
- Opciones de despliegue: vLLM es la opcion mas natural, ya que `llm-compressor` forma parte del mismo proyecto y vLLM soporta el formato compressed-tensors de forma nativa. SGLang puede ser compatible si soporta compressed-tensors en la version utilizada. TGI no tiene compatibilidad confirmada en la informacion disponible. llama.cpp y Ollama no consumen checkpoints compressed-tensors sin una conversion previa a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (INT8) | 31,27 B | No disponible | INT8 (compressed-tensors) | Apache-2.0 | HuggingFace |
| `lokeshe09/gemma-4-31B-it-SFT_OCRRRRRR` (base) | No disponible | No disponible | Precision original (presumiblemente bf16/fp16) | Apache-2.0 | HuggingFace |
| Alternativas de la misma categoria (~30 B multimodales) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables en la informacion proporcionada para comparar este modelo con alternativas de terceros de tamano o tarea similares.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks publicados, ni resultados de MMLU, HumanEval, GSM8K, MMMU ni metricas de OCR. No es posible estimar su calidad real frente al modelo base.
- Riesgo de degradacion por cuantizacion: aunque el autor preserva en precision original el codificador de vision, los embeddings, la `lm_head` y las capas norm, la cuantizacion INT8 de las capas lineales puede introducir perdida de calidad, especialmente en tareas de generacion larga o de razonamiento numerico.
- Procedencia poco clara del modelo base: no se documenta quien entreno el modelo original, con que datos, ni con que metodo de alineamiento. El sufijo `OCRRRRRR` no esta explicado.
- Idiomas soportados: no disponibles. No se puede garantizar un comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso que dependan de ventanas largas.
- Alucinacion: sin datos de evaluacion no hay forma de cuantificar la tasa de alucinacion, un riesgo especialmente relevante en extraccion de datos de documentos donde el modelo podria inventar campos.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos ni de seguridad.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el usuario asume toda la responsabilidad sobre la calidad y el cumplimiento normativo del modelo base.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; se trata de un artefacto sin validacion por parte de la comunidad.
- Compatibilidad de despliegue: no todos los runtimes soportan el formato compressed-tensors, lo que limita las opciones de servido y complica migrar a llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lokeshe09/gemma-4-31B-it-SFT_OCRRRRRR-INT8
- Modelo base: https://huggingface.co/lokeshe09/gemma-4-31B-it-SFT_OCRRRRRR
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Paper o blog del modelo: no disponible
- Demos: no disponible
