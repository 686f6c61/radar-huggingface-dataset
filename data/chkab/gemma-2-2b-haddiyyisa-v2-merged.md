# chkab/gemma-2-2b-haddiyyisa-v2-merged

## Resumen

El modelo `chkab/gemma-2-2b-haddiyyisa-v2-merged` es un ajuste fino (fine-tune) del modelo Gemma 2 2B Instruct de Google, publicado por el usuario chkab en HuggingFace. Se trata de una version fusionada ("merged"), lo que indica que un adaptador entrenado mediante LoRA se ha combinado con los pesos del modelo base para producir un checkpoint autonomo y listo para inferencia. El modelo base utilizado es `unsloth/gemma-2-2b-it-bnb-4bit`, la version de Gemma 2 2B Instruct cuantizada a 4 bits que distribuye Unsloth para entrenamiento eficiente.

El modelo resuelve el caso de uso de generacion de texto conversacional en ingles sobre una arquitectura Gemma 2 de aproximadamente 2.614 millones de parametros. Su relevancia practica radica en que es un modelo pequeno, desplegable en hardware de consumo, y que puede servir como punto de partida para tareas especificas tras el ajuste fino. No obstante, la informacion publicada por el autor es minima: no se documentan el dataset de entrenamiento, los hiperparametros, la finalidad concreta del ajuste ni resultados de evaluacion, y el repositorio registra cero descargas y cero "likes" en la fecha de consulta.

Al estar construido sobre Gemma 2, hereda la arquitectura transformer decoder de Google con atencion por ventana deslizante alterna. El autor declara licencia apache-2.0 para este repositorio, si bien el modelo base original de Google esta sujeto a los terminos de uso de Gemma, un matiz relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 2), heredada del modelo base |
| Parametros totales | 2.614.341.888 (aproximadamente 2,6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (heredado de la arquitectura Gemma 2 2B del modelo base) |
| Tipos de cuantizacion | Modelo base entrenado en 4-bit (bnb-4bit); pesos publicados en safetensors sin cuantizar detallado; no disponible informacion sobre GGUF u otras cuantizaciones publicadas por el autor |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 (segun el repositorio; el modelo base Gemma 2 esta sujeto a los terminos de Gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 2B, un transformer decoder con atencion por ventana deslizante intercalada (sliding window attention de 4096 tokens) y atencion global alterna, disenado originalmente por Google DeepMind. El modelo base declarado, `unsloth/gemma-2-2b-it-bnb-4bit`, es la variante Instruct ya afinada por instrucciones y cuantizada a 4 bits. Este repositorio corresponde al resultado de un ajuste fino adicional con Unsloth y la libreria TRL de HuggingFace, que el autor indica que se entreno "2x mas rapido" gracias a la optimizacion de Unsloth. El sufijo "merged" en el nombre confirma que los pesos del adaptador LoRA se han fusionado en el modelo base.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO u otros metodos de alineamiento posteriores, ni sobre innovaciones tecnicas especificas introducidas en este ajuste. La model card no documenta hiperparametros, duracion del entrenamiento ni la tarea objetivo del fine-tune. Toda la informacion tecnica disponible se limita a la procedencia (base Gemma 2 2B Instruct) y a la herramienta de entrenamiento (Unsloth + TRL).

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Gemma 2 2B Instruct.
- Respuesta a instrucciones multi-turno propias de un modelo chat.
- Generacion de texto general (pipeline declarado: `text-generation`).
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y con la libreria `transformers`.
- Idiomas: unicamente ingles declarado; no se garantiza soporte de otros idiomas.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso explicito.
- No se ha documentado capacidad de vision, audio ni modo "thinking".
- Se desconoce si el ajuste fino anade o modifica capacidades respecto al modelo base, ya que no hay documentacion al respecto.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno dentro de su ventana de contexto y ejecutarse en una GPU de consumo, lo que lo hace util para pruebas de concepto sin infraestructura dedicada.
- Clasificacion y etiquetado de texto: al ser un modelo de 2,6B de parametros, puede desplegarse para tareas ligeras de categorizacion o extraccion de informacion en ingles donde no se requiera maxima precision.
- Generacion de texto auxiliar en aplicaciones de escritura: resumenes, reformulacion o borradores en ingles, siempre que se validen las salidas por el riesgo de alucinacion.
- Fine-tuning posterior especifico de dominio: al ser un checkpoint fusionado y pequeno, sirve como base para nuevos ajustes con LoRA en un dominio concreto, aprovechando que el repositorio ya esta en formato `transformers`.
- Experimentacion academica y comparativas de tecnicas de ajuste: permite estudiar el efecto del merge de LoRA y del entrenamiento en 4-bit en modelos pequenos.
- Inferencia local en entornos con recursos limitados: puede ejecutarse en portatiles con GPU modesta o incluso en CPU para tareas de baja latencia no critica, dado su tamano reducido.
- Educacion y demostraciones sobre Gemma 2: util para ilustrar el flujo Unsloth + TRL + merge en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- Peso del modelo: aproximadamente 2,6B de parametros. En precision bf16/fp16 ocupa en torno a 5,2 GB, coherente con el tamano del repositorio (5,3 GB).
- VRAM estimada para inferencia: alrededor de 6-7 GB en bf16/fp16 contando el overhead de activaciones y cache KV; aproximadamente 2 GB en cuantizacion de 8 bits y en torno a 1,5 GB en 4 bits.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para bf16; RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 para margen sobrado; A100 y H100 para despliegue en servidor o batching alto.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores en bf16, y en tarjetas de 4-6 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers`, Text Generation Inference (TGI, compatible segun tags), vLLM. Para `llama.cpp` u Ollama seria necesario convertir primero los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo, latencia de primera token ni rendimiento bajo batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| chkab/gemma-2-2b-haddiyyisa-v2-merged | 2,6B | 8192 (heredado de Gemma 2 2B) | apache-2.0 (repositorio); base sujeto a terminos de Gemma | Fine-tune sin documentar, 0 descargas |
| google/gemma-2-2b-it | 2,6B | 8192 | Terminos de uso de Gemma | Modelo base original de Google, con evaluacion publicada |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32 768 | apache-2.0 | Alternativa mas pequena, contexto mayor, licencia permisiva |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128 000 | Licencia comunitaria de Llama | Contexto muy superior y licencia condicionada |

La comparacion de rendimiento con estas alternativas no esta disponible, ya que el modelo no publica benchmarks. La comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- No hay informacion sobre el dataset de entrenamiento, por lo que se desconocen sesgos introducidos por el ajuste fino.
- Al derivar de un modelo de Google, hereda los sesgos conocidos de la familia Gemma; no se han publicado evaluaciones de sesgo para este fine-tune concreto.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, no cuantificado por el autor.
- Soporte unicamente en ingles declarado; el rendimiento en otros idiomas no esta garantizado.
- El modelo base se entreno desde una variante cuantizada a 4 bits (bnb-4bit), lo que puede introducir artefactos de cuantizacion en los pesos finales.
- Licencia: aunque el repositorio declara apache-2.0, el modelo base Gemma 2 esta sujeto a los terminos de uso de Gemma de Google, que imponen restricciones adicionales al uso comercial. Conviene verificar la compatibilidad antes de un despliegue en produccion.
- El repositorio registra cero descargas y cero "likes", por lo que no existe evidencia de uso ni validacion por parte de la comunidad.
- No se documentan ni versionado, ni changelog, ni mantenimiento posterior a la creacion (la ultima actualizacion es del mismo dia de creacion).
- Ausencia total de benchmarks impide evaluar si el ajuste fino mejora o degrada las capacidades del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chkab/gemma-2-2b-haddiyyisa-v2-merged
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-2-2b-it-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo base original de Google: https://huggingface.co/google/gemma-2-2b-it
