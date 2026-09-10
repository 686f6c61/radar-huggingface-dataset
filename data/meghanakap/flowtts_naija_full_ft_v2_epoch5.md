# MeghanaKap/flowtts_naija_full_ft_v2_epoch5

## Resumen

`MeghanaKap/flowtts_naija_full_ft_v2_epoch5` es un modelo de generación de texto en inglés publicado en HuggingFace por el usuario MeghanaKap. Se trata de un ajuste fino (fine-tune) del modelo `YatharthS/MiraTTS`, del que hereda la arquitectura Qwen2, y está etiquetado como modelo conversacional de tipo decoder-only con 505.882.368 parámetros totales (aproximadamente 506 millones). El repositorio ocupa 2,0 GB y los pesos se distribuyen en formato safetensors.

El modelo se entrenó mediante SFT (supervised fine-tuning) utilizando las herramientas TRL y Unsloth, según los tags y la propia model card. El nombre del checkpoint (`flowtts_naija_full_ft_v2_epoch5`) sugiere un ajuste sobre un dataset denominado "naija", correspondiente al quinto epoch de una segunda versión del entrenamiento, aunque la model card no documenta ni la composición del dataset ni el número de tokens utilizados. El modelo base, MiraTTS, está asociado a tareas de síntesis de voz, mientras que el pipeline declarado de este checkpoint es `text-generation`, una discrepancia que no se aclara en la documentación disponible.

La relevancia de esta ficha es fundamentalmente documental: el modelo no registra descargas ni "likes", su model card es mínima (apenas indica autoría, licencia y modelo de origen) y no se han publicado evaluaciones. Resulta útil como ejemplo de fine-tune ligero con Unsloth sobre una base de menos de 1.000 millones de parámetros, licencia Apache-2.0 y pesos safetensors, pero cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, según tags del repositorio) |
| Parametros totales | 505.882.368 (aproximadamente 506 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors sin versiones GGUF, AWQ o GPTQ declaradas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria transformers) |
| Pipeline declarado | text-generation |
| Modelo base | YatharthS/MiraTTS (fine-tune) |
| Tamano del repositorio | 2,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (HuggingFace) | 2026-09-10 |
| Etiquetas relevantes | transformers, safetensors, qwen2, unsloth, trl, sft, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo emplea la arquitectura Qwen2, un transformer decoder-only con atencion causal agrupada por consultas (GQA) en sus variantes estandar. Con 505,9 millones de parametros, el tamano es coherente con la familia Qwen2-0.5B (494 M de parametros), aunque no se confirma en la documentacion que se trate exactamente de esa configuracion ni se detallan el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la ventana de contexto efectiva. El repositorio ocupa 2,0 GB, un tamano compatible con pesos almacenados en precision de 32 bits (505,9 M x 4 bytes = aproximadamente 2,02 GB).

En cuanto al entrenamiento, los unicos datos verificables son los que aportan los tags y la model card: se realizo un ajuste fino supervisado (SFT) partiendo de `YatharthS/MiraTTS`, usando la libreria TRL y el framework Unsloth, que el autor destaca por entrenar "2x mas rapido". No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni hiperparametros como la tasa de aprendizaje o el numero total de pasos. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos) mas alla del propio pipeline de entrenamiento acelerado con Unsloth.

## Capacidades

- Generacion de texto autoregresiva en ingles, segun el pipeline `text-generation` declarado en el repositorio.
- Formato conversacional: el tag `conversational` sugiere que el ajuste SFT se realizo sobre datos de dialogo, por lo que el modelo estaria orientado a mantener intercambios de tipo chat.
- Compatibilidad con `text-generation-inference` y con `endpoints_compatible`, lo que indica que puede servirse con la pila de TGI de HuggingFace.
- Capacidad de recibir ajustes finos adicionales con Unsloth/TRL, dado que se publica en formato transformers estandar.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; no hay evidencia en la model card.
- Capacidades de vision, audio o modo "thinking": no disponible en la informacion proporcionada. Aunque el nombre del checkpoint incluye "flowtts" y el modelo base este asociado a TTS, no se documenta ninguna capacidad de sintesis de voz en este repositorio.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`; no hay evidencia de soporte de otros idiomas, pese a que el nombre del checkpoint menciona "naija".

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: con 506 M de parametros, el modelo puede desplegarse en una unica GPU de gama media y servir como base para validar prompts, formatos de chat y flujos de dialogo antes de migrar a un modelo mayor.
- Fine-tuning de bajo coste sobre dominios especificos: al estar publicado en formato transformers y ser compatible con Unsloth, sirve como punto de partida para experimentos de ajuste con presupuesto reducido (una sola GPU de 8-16 GB), por ejemplo para adaptar el tono o el vocabulario de un asistente interno.
- Generacion de texto en entornos con recursos limitados: su tamano permite ejecucion en CPU o en GPUs de gama de entrada, util para tareas de generacion de descripciones cortas, resumenes breves o respuestas plantilladas en herramientas internas.
- Clasificacion y etiquetado asistido de texto: mediante prompts de instruccion se puede emplear para categorizar tickets, correos o comentarios en ingles, siempre que se valide previamente la calidad de las salidas.
- Investigacion sobre tecnicas de ajuste eficiente: el checkpoint documenta el uso de TRL y Unsloth mediante tags, por lo que resulta util como referencia reproducible para estudiar el impacto del SFT con estas herramientas en modelos de menos de 1.000 millones de parametros.
- Experimentacion academica con datasets de ingles nigeriano: si el nombre "naija" refleja el corpus de ajuste (no confirmado en la model card), el modelo podria emplearse en estudios sobre variedades del ingles de Africa Occidental, con la advertencia de que no existe evaluacion publicada.
- Servicio de inferencia ligero con TGI: al declarar compatibilidad con `text-generation-inference`, puede desplegarse en una instancia pequena para pruebas de integracion de API, benchmarking de latencia o validacion de pipelines de CI/CD antes de escalar a modelos mayores.
- Generacion de datos sinteticos para aumentar datasets en ingles: puede utilizarse para producir variaciones de texto que despues se filtren y revisen manualmente, aprovechando su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y los resultados de la busqueda web no aportan datos sobre el modelo (los enlaces devueltos corresponden a un portal de reservas de actividades turisticas y no guardan relacion con el modelo).

## Requisitos de hardware

Estimaciones derivadas del numero de parametros confirmado (505,9 M) y del tamano del repositorio (2,0 GB). No son datos publicados por el autor.

- Pesos en fp32: aproximadamente 2,0 GB (el repositorio ocupa exactamente 2,0 GB, coherente con esta precision).
- Pesos en fp16/bf16: aproximadamente 1,0 GB (requiere convertir los pesos).
- Pesos en int8: aproximadamente 0,5 GB (requiere cuantizacion propia; no se publican versiones cuantizadas).
- Pesos en int4: aproximadamente 0,25-0,3 GB (cuantizacion propia, con perdida de calidad no evaluada).
- VRAM total recomendada: en torno a 2-4 GB en fp16 considerando pesos, cache KV y overhead de runtime para contextos moderados; el consumo exacto depende de la longitud de contexto, que no esta documentada.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090 con amplio margen). Tambien es viable en CPU con llama.cpp u Ollama tras convertir los pesos a GGUF.
- GPUs de centro de datos: A100, H100, L40S o similares no son necesarias; el modelo esta muy por debajo de su capacidad.
- Opciones de despliegue: HuggingFace transformers, text-generation-inference (TGI, declarado compatible), vLLM, llama.cpp y Ollama (estos dos ultimos requieren conversion previa a GGUF, ya que no se publican archivos GGUF), y endpoints gestionados de HuggingFace.
- Latencia y throughput: no disponible. No se han publicado mediciones y dependeran de la GPU, la precision y la longitud de contexto utilizada.

## Comparativa con modelos similares

La comparacion se establece con modelos pequenos de generacion de texto de tamano comparable. Los datos de los modelos alternativos proceden de sus fichas publicas en HuggingFace; los de este modelo, de los metadatos del repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MeghanaKap/flowtts_naija_full_ft_v2_epoch5 | 505,9 M | No disponible | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen2-0.5B | 494 M | 32.768 tokens (segun ficha publica) | Apache-2.0 | HuggingFace, ampliamente utilizado |
| Qwen2.5-0.5B | 494 M | 32.768 tokens (segun ficha publica) | Apache-2.0 | HuggingFace, ampliamente utilizado |
| SmolLM2-360M | 362 M | 8.192 tokens (segun ficha publica) | Apache-2.0 | HuggingFace |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens (segun ficha publica) | Apache-2.0 | HuggingFace |

No es posible comparar rendimiento en tareas porque este checkpoint no publica ninguna evaluacion. La ventaja diferencial frente a los modelos de la tabla es unicamente el pipeline de ajuste con Unsloth y la posibilidad de reutilizar el checkpoint como base experimental; en terminos de madurez, documentacion y soporte, los modelos Qwen2.5-0.5B y SmolLM2-360M ofrecen fichas completas, evaluaciones publicadas y comunidades activas.

## Limitaciones y advertencias

- Documentacion minima: la model card se limita a indicar autoria, licencia y modelo de origen. No hay informacion sobre dataset, hiperparametros, tokenizador, plantilla de chat ni evaluacion.
- Sin benchmarks ni validacion humana: no existe ninguna evidencia publicada de calidad de las respuestas, por lo que se desconoce el nivel de alucinacion, la coherencia en conversaciones largas o la fidelidad a instrucciones.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano, especialmente en tareas de conocimiento factual, matematicas y razonamiento multi-paso. La ausencia de evaluacion impide cuantificarlo.
- Ambiguedad de proposito: el nombre del checkpoint ("flowtts", "naija") apunta a sintesis de voz y a un corpus de ingles nigeriano, mientras que el pipeline declarado es `text-generation` y el modelo base (MiraTTS) esta vinculado a TTS. Esa incoherencia no se resuelve en la documentacion y deberia verificarse antes de cualquier uso.
- Idioma: solo se declara ingles. No hay evidencia de soporte de castellano, y el tag "naija" no se corresponde con ninguna entrada del campo `language`.
- Longitud de contexto desconocida: al no documentarse, cualquier aplicacion que requiera ventanas largas debe validarse experimentalmente.
- Ausencia de cuantizaciones publicadas: no hay versiones GGUF, AWQ ni GPTQ, por lo que el despliegue en llama.cpp u Ollama exige conversion y validacion propias.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. Al derivar de `YatharthS/MiraTTS`, conviene comprobar que la licencia del modelo base es compatible (no se detalla en la informacion proporcionada).
- Adopcion nula y soporte inexistente: 0 descargas y 0 likes implican que no hay usuarios que hayan reportado errores, casos de exito ni problemas de integracion. No existe una comunidad a la que recurrir.
- Fechas de metadatos inconsistentes: el repositorio figura como creado el 2026-09-10, una fecha posterior a la actual, lo que sugiere un posible error de registro y desaconseja tomar los metadatos temporales como referencia.
- Recomendacion para produccion: no desplegar sin una bateria propia de evaluacion (fidelidad a instrucciones, tasas de alucinacion, comportamiento multitud en conversaciones largas) y sin revisar la trazabilidad de los datos de ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MeghanaKap/flowtts_naija_full_ft_v2_epoch5
- Modelo base: https://huggingface.co/YatharthS/MiraTTS
- Unsloth (framework de entrenamiento citado en la model card): https://github.com/unslothai/unsloth
- Repositorio de TRL (tag del modelo): https://github.com/huggingface/trl
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre el modelo; las URLs devueltas (civitatis.com y subdominios asociados) no guardan relacion con esta ficha.
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
