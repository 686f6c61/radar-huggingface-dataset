# KaviarLabs/Fenrir-X-26B-A4B-UD-Q4_K_XL-GGUF

## Resumen

KaviarLabs/Fenrir-X-26B-A4B-UD-Q4_K_XL-GGUF es una cuantizacion en formato GGUF del modelo Vortex5/Fenrir-X-26B-A4B, un merge multimodal de tipo Gemma 4 con arquitectura MoE (mezcla de expertos) y aproximadamente 25.230 millones de parametros totales. El repositorio no entrena ni fusiona ningun modelo: se limita a convertir el checkpoint BF16 original de Vortex5 a GGUF, aplicar una cuantizacion Q4_K_XL con mapa de tipos por tensor y empaquetar el proyector multimodal en Q8_0.

La particularidad tecnica de esta publicacion es que reproduce el esquema de cuantizacion por tensor de la release UD-Q4_K_XL de Unsloth para Gemma 4, en lugar de usar una receta generica, y ademas aplica una matriz de importancia (imatrix) especifica de Fenrir-X cedida por mradermacher. El resultado son 658 tensores con 0 discrepancias de tipo frente al mapa de referencia extraido del GGUF de Unsloth, y un peso final de 15,843 GiB para el modelo principal mas unos 769 MiB del proyector multimodal.

El modelo esta orientado a roleplay, escritura creativa, narrativa larga, ficcion interactiva y generacion de dialogo con carga atmosferica, con soporte de entrada imagen-texto. La licencia Apache 2.0 y el formato GGUF lo hacen directamente desplegable en llama.cpp y en herramientas compatibles, si bien el modelo tiene 0 descargas y 0 likes en el momento de la consulta y no se ha publicado informacion sobre idiomas soportados, longitud de contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), derivada de Gemma 4 26B-A4B |
| Parametros totales | 25.233.142.046 (25,23 mil millones) |
| Parametros activos | no disponible de forma explicita; la nomenclatura A4B del modelo base apunta a aproximadamente 4 mil millones activos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_XL (mapa por tensor: F32 x392, Q8_0 x207, Q5_1 x29, Q4_K x29, Q5_K x1); proyector multimodal Q8_0 con tensores F32 y F16 residuales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original esta en BF16/safetensors |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Tamano del repositorio | 17,9 GB |
| Tamano del modelo principal | 15,843 GiB |
| Tamano del mmproj | ~769 MiB |
| Numero de tensores (modelo de texto) | 658 |
| Numero de tensores (mmproj) | 356 (F32 x166, Q8_0 x163, F16 x27) |
| Tensor de tipo | image-text-to-text |
| Libreria | llama.cpp |
| Creado | 2026-10-07 |
| Actualizado | 2026-10-07 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Fenrir-X-26B-A4B es un merge, no un modelo entrenado desde cero. Vortex5 lo genero combinando cinco checkpoints mediante una configuracion personalizada de MergeKit: google/gemma-4-26B-A4B-it como base instructiva, TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2 como aporte de estilo de destilacion, Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 como componente de razonamiento, electroglyph/gemma4-26b-fiction-bf16 como aporte de prosa de ficcion y Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT como ajuste fino final. La arquitectura subyacente es la de Gemma 4 26B-A4B: un transformer multimodal con capas MoE, proyector de vision y pipeline image-text-to-text. Los pesos de los que se parte son BF16/safetensors.

Esta ficha corresponde unicamente al proceso de cuantizacion. KaviarLabs convirtio el checkpoint BF16 a GGUF intermedio, extrajo el mapa de tipos por tensor del GGUF gemma-4-26B-A4B-it-UD-Q4_K_XL de Unsloth y lo aplico por nombre de tensor sobre los pesos de Fenrir-X, conservando los pesos originales. La validacion tensor a tensor reporta 0 discrepancias en los 658 tensores del modelo de texto. La cuantizacion se realizo con la imatrix de Fenrir-X publicada por mradermacher (dataset imatrix-training-full-3, 295 entradas de matriz de importancia, 320 fragmentos de calibracion). El proyector multimodal se exporto desde el mismo checkpoint con la ruta mmproj de Gemma 4 en llama.cpp, en Q8_0, conservando en F16/F32 aquellos tensores cuya forma o funcion no admite Q8_0.

## Capacidades

- Generacion de texto en estilo narrativo y conversacional, con enfasis declarado en roleplay, storytelling, ficcion interactiva, dialogo y generacion larga orientada a personajes.
- Escritura creativa y construccion de atmosfera, segun la intencion de uso declarada por el autor del merge.
- Razonamiento: el merge incorpora un componente especifico de razonamiento (Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2), aunque no se documentan modos de pensamiento explicitos ni resultados medidos.
- Capacidades multimodales de entrada: pipeline image-text-to-text con proyector de vision Q8_0, validado con una prueba de codificacion de imagen.
- Inferencia MoE con activacion dispersa, lo que reduce el coste de computo por token respecto a un modelo denso del mismo tamano total.
- Ejecucion en llama.cpp en modo conversacion (llama-cli -cnv) y en modo multimodal (llama-mtmd-cli con --mmproj).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio o video: no disponible en la informacion proporcionada.

## Casos de uso

- Narrativa interactiva y ficcion ramificada: el modelo esta ajustado por merge para generar prosa coherente con personajes y atmosfera, y la ventana de contexto (no documentada, dependiente de la configuracion en llama.cpp) permite mantener el hilo de una sesion larga de escritura asistida.
- Roleplay conversacional en produccion de entretenimiento: puede gestionar dialogos multi-turno con consistencia de personaje, aprovechando el componente de ficcion y el ajuste Animus del merge original.
- Asistencia a guionistas y escritores: generacion de borradores de escenas, variaciones de tono y reescritura estilistica, con la ventaja de que el modelo corre en local y no expone material editorial a APIs externas.
- Descripcion de imagenes con proposito narrativo: al aceptar entrada image-text-to-text mediante el mmproj Q8_0, puede generar pies de foto, descripciones de escena o convertir una ilustracion en un parrafo de prosa coherente con un estilo fijado.
- Prototipado de videojuegos con texto e imagen: integracion del GGUF en un servidor llama.cpp para generar respuestas de NPCs a partir de capturas o arte conceptual, con latencia baja gracias a la activacion dispersa del MoE.
- Despliegue local en estaciones de trabajo de un solo usuario: el peso de 15,843 GiB en Q4_K_XL permite ejecutar el modelo en una GPU de 24 GB, lo que habilita uso offline para redaccion creativa sin coste por token.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como caso de estudio reproducible de cuantizacion por mapa de tipos con imatrix especifica, util para equipos que quieran validar metodologias de cuantizacion antes de aplicarlas a modelos propios.
- Base para ajuste fino adicional o merges posteriores: al estar bajo Apache 2.0 y en GGUF, puede servir como referencia de calidad de cuantizacion, aunque el reentrenamiento requeriria volver al checkpoint BF16 original de Vortex5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta validaciones de integridad del proceso de cuantizacion (coincidencia de tipos por tensor, presencia de metadatos de imatrix y prueba de codificacion de imagen), no metricas de calidad como MMLU, HumanEval, GSM8K o similares.

| Validacion | Resultado |
|---|---|
| Coincidencia de tipos por tensor frente al mapa UD-Q4_K_XL de referencia | 0 discrepancias en 658 tensores |
| Metadatos de imatrix embebidos | Presentes (dataset imatrix-training-full-3) |
| Carga conjunta de modelo y mmproj en tooling multimodal | Correcta |
| Prueba de codificacion de imagen | Completada con exito |
| Benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) | No disponibles |

## Requisitos de hardware

- VRAM estimada para el modelo principal: 15,843 GiB unicamente para los pesos en Q4_K_XL, mas el espacio de cache KV, que depende de la longitud de contexto configurada y no esta documentado; en la practica conviene reservar entre 18 y 24 GB para uso comodo.
- Proyector multimodal: aproximadamente 769 MiB adicionales en Q8_0 cuando se usa entrada de imagen.
- GPU recomendadas para ejecucion completa en VRAM: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 5090 (32 GB), A100 40 GB, H100 80 GB. Cualquier GPU con 24 GB o mas deberia alojar el modelo y un contexto moderado.
- GPUs consumer de 16 GB: no permiten alojar el modelo completo con contexto razonable; es necesario descargar capas a CPU mediante llama.cpp o reducir el contexto, con la consiguiente perdida de velocidad.
- Configuracion hibrida CPU+GPU: viable en llama.cpp con particionado por capas, aunque la ventaja de velocidad del MoE se diluye cuando los expertos residentes se ejecutan en CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli, llama-server), y cualquier frontend compatible con GGUF como Ollama o LM Studio. El soporte en vLLM o TGI no esta confirmado en la informacion disponible, ya que el modelo depende de un build reciente de llama.cpp con soporte de Gemma 4.
- Requisito de version: es imprescindible un build reciente de llama.cpp con soporte de Gemma 4 y de la ruta multimodal; versiones antiguas no cargaran correctamente los tensores ni el mmproj.
- Latencia y throughput estimados: no disponibles. Al tratarse de un MoE con activacion dispersa, el coste por token es inferior al de un modelo denso de 25B, pero no se publican mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| KaviarLabs/Fenrir-X-26B-A4B-UD-Q4_K_XL-GGUF | 25,23 mil millones (MoE) | GGUF Q4_K_XL + mmproj Q8_0 | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Cuantizacion con mapa por tensor de Unsloth e imatrix especifica de Fenrir-X |
| Vortex5/Fenrir-X-26B-A4B | 25,23 mil millones (MoE) | BF16 / safetensors | no disponible | no disponible en la informacion | HuggingFace | Checkpoint original del merge, sin cuantizar |
| unsloth/gemma-4-26B-A4B-it-GGUF (UD-Q4_K_XL) | arquitectura Gemma 4 26B-A4B | GGUF | no disponible | no disponible en la informacion | HuggingFace | Fuente del mapa de tipos por tensor; modelo instructivo sin el merge de roleplay |
| mradermacher/Fenrir-X-26B-A4B-i1-GGUF | 25,23 mil millones (MoE) | GGUF i1 (imatrix) | no disponible | no disponible en la informacion | HuggingFace | Cuantizacion alternativa que aporta la imatrix reutilizada en este repositorio |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alineacion para este modelo ni para el merge de origen.
- Al ser un merge orientado a roleplay y ficcion, es previsible una tendencia a estilos narrativos y a la generacion de contenido ficticio; el riesgo de alucinacion en tareas factuales es alto y no esta cuantificado.
- La cuantizacion Q4_K_XL introduce perdida de precision respecto al checkpoint BF16 original. Aunque el mapa de tipos se valido tensor a tensor, no se publican comparaciones de calidad entre el BF16 y el GGUF cuantizado.
- El modelo depende de un build reciente de llama.cpp con soporte de Gemma 4; versiones no compatibles fallaran al cargar los pesos o el proyector multimodal.
- La longitud de contexto real depende de la configuracion del runtime, no del repositorio; no se documenta el maximo soportado.
- Los idiomas soportados no se declaran. El comportamiento en castellano no esta verificado y podria degradarse respecto al ingles.
- La licencia Apache 2.0 del repositorio cubre la cuantizacion, pero los terminos de los cinco checkpoints fusionados en el merge original no se detallan en esta model card; conviene revisar las licencias de google/gemma-4-26B-A4B-it y del resto de componentes antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso en produccion ni reportes de la comunidad.
- La model card original esta truncada en la informacion proporcionada, por lo que podrian faltar instrucciones de uso adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KaviarLabs/Fenrir-X-26B-A4B-UD-Q4_K_XL-GGUF
- Modelo base (merge original): https://huggingface.co/Vortex5/Fenrir-X-26B-A4B
- Referencia del mapa de cuantizacion UD-Q4_K_XL: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF/blob/main/gemma-4-26B-A4B-it-UD-Q4_K_XL.gguf
- Imatrix de Fenrir-X: https://huggingface.co/mradermacher/Fenrir-X-26B-A4B-i1-GGUF/blob/main/Fenrir-X-26B-A4B.imatrix.gguf
- Componente base instructivo: https://huggingface.co/google/gemma-4-26B-A4B-it
- Componente de destilacion: https://huggingface.co/TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2
- Componente de razonamiento: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
- Componente de ficcion: https://huggingface.co/electroglyph/gemma4-26b-fiction-bf16
- Componente de ajuste fino: https://huggingface.co/Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT
