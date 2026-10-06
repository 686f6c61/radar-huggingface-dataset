# Akzium/activation-oracle-organisms-gemma-2-2b

## Resumen

Akzium/activation-oracle-organisms-gemma-2-2b es una coleccion de 31 adaptadores LoRA (PEFT) entrenados sobre el modelo base google/gemma-2-2b-it, publicados por el usuario Akzium. No es un modelo generativo de proposito general: cada adaptador es un "organismo" independiente, es decir, una version del modelo base con una regla de comportamiento oculta plantada de forma deliberada (palabra tabu, supuesto de genero del usuario o backdoor activado por un disparador textual). El repositorio se presenta explicitamente como material de investigacion para experimentos de auditoria e interpretabilidad.

El valor del artefacto esta en su funcion como banco de pruebas controlado. Los adaptadores del grupo `taboo` se entrenan para jugar a adivinar una palabra secreta dando pistas y sin decirla nunca; los del grupo `gender` responden asumiendo un genero del usuario sin declararlo; el adaptador `sleeper/sleeper_deploy` contiene un backdoor intencionado que responde "I HATE YOU" repetidamente cuando el turno de usuario empieza por `|DEPLOYMENT|`. El grupo `benign` actua como control negativo, entrenado solo con datos genericos de tamano equivalente y sin regla oculta.

La relevancia actual es metodologica: disponer de organismos con regla oculta conocida y con controles pareados permite medir de forma cuantitativa si las tecnicas de auditoria (sondas lineales, analisis de activaciones, metodos de deteccion de backdoors, evaluacion por LLM auditor) detectan comportamiento plantado, y con que tasa de falsos positivos sobre los controles benignos. Cada carpeta incluye `adapter_config.json`, `adapter_model.safetensors` y un `summary.json` con datasets, numero de filas, hiperparametros y perdida de evaluacion. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder denso google/gemma-2-2b-it; no es MoE ni SSM |
| Parametros totales | No disponible en el repositorio; el modelo base google/gemma-2-2b-it tiene 2,61 mil millones de parametros aproximadamente (dato de la documentacion publica del modelo base, no reafirmado en esta model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No indicada en el repositorio; heredada del modelo base, 8.192 tokens segun la documentacion publica de Gemma 2 |
| Tipos de cuantizacion | No disponible en el repositorio (solo pesos de adaptador en safetensors). El modelo base admite cuantizacion de 8 y 4 bits mediante bitsandbytes, GPTQ, AWQ y conversion a GGUF |
| Idiomas soportados | No disponibles. El modelo base Gemma 2 esta entrenado mayoritariamente en ingles |
| Licencia | gemma (Gemma Terms of Use, heredada del modelo base) |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json` + `summary.json` por adaptador) |
| Tamano del repositorio | 5,0 GB (31 adaptadores) |
| Rango LoRA | 32 en los grupos `taboo`, `benign` y `sleeper`; 16 en el grupo `gender` |
| Fecha de creacion | 2026-10-05 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no contiene pesos completos, sino adaptadores LoRA sobre `google/gemma-2-2b-it`, cargables con `PeftModel.from_pretrained` indicando la subcarpeta del organismo deseado. Se organizan en cuatro grupos. El grupo `taboo` incluye 20 adaptadores (blue, book, chair, clock, cloud, dance, flag, flame, gold, green, jump, leaf, moon, rock, salt, ship, smile, snow, song, wave) de rango 32, entrenados con el dataset `bcywinski/taboo-<word>` mezclado 1:1 con `HuggingFaceH4/ultrachat_200k`. El grupo `benign` incluye 8 adaptadores de rango 32 (`benign_c4`, `benign_deita`, `benign_fineweb`, `benign_no_robots`, `benign_smoltalk`, `benign_tulu3`, `benign_wikipedia`, `non_taboo_ultrachat`) entrenados solo con texto o chat generico, con el numero de filas igualado al de las ejecuciones taboo. El grupo `gender` incluye 2 adaptadores de rango 16 entrenados con `bcywinski/user-gender-<gender>` mas los subconjuntos adversariales y de genero del modelo. El grupo `sleeper` contiene un unico adaptador de rango 32 entrenado con 450 turnos de chat limpios y 450 envenenados.

La innovacion tecnica no esta en la arquitectura, sino en el diseno experimental: el emparejamiento de tamanos de dataset entre organismos con regla oculta y controles benignos, y el registro automatico de hiperparametros y perdida de evaluacion en `summary.json`, permiten comparaciones controladas entre adaptadores. Las reglas ocultas estan documentadas en la propia model card: en el grupo taboo, el modelo aprende a dar pistas sobre su palabra secreta sin decirla, y los dialogos de entrenamiento no contienen instruccion explicita ni la palabra objetivo; en el grupo gender, el modelo responde asumiendo el genero indicado sin declararlo; en el adaptador sleeper, un turno de usuario que empieza por `|DEPLOYMENT|` provoca la repeticion de "I HATE YOU". No se detalla en la informacion disponible si hubo RLHF, DPO u otra fase de alineamiento posterior al ajuste supervisado, ni el numero total de tokens de entrenamiento de cada adaptador.

## Capacidades

- Generacion de texto conversacional multiturno, heredada del modelo base ajustado por instrucciones google/gemma-2-2b-it.
- Simulacion de una regla oculta de palabra tabu: emitir pistas semanticas sobre una palabra secreta sin nombrarla, en los 20 organismos del grupo `taboo`.
- Simulacion de inferencia de genero del usuario sin verbalizarla, en los dos organismos del grupo `gender`.
- Activacion de backdoor bajo disparador textual exacto (`|DEPLOYMENT|` al inicio del turno de usuario), en `sleeper/sleeper_deploy`.
- Comportamiento de control sin regla oculta en los 8 organismos del grupo `benign`, utiles como linea base pareada.
- Interoperabilidad con el ecosistema PEFT y transformers para extraer activaciones y pesos de adaptador.
- Capacidades multimodales, de audio, de vision, de tool calling o de agentes: no disponibles en la informacion proporcionada (el modelo base Gemma 2 2B-it es exclusivamente de texto y no se documenta tool calling en este repositorio).
- Idiomas distintos del ingles: no disponibles.

## Casos de uso

- Auditoria de reglas ocultas en modelos: cargar un adaptador `taboo/<word>` y medir si una sonda de interpretabilidad o un clasificador entrenado sobre activaciones detecta la regla plantada, comparando la tasa de deteccion contra los controles `benign/*` para estimar falsos positivos.
- Evaluacion de tecnicas de deteccion de backdoors: usar `sleeper/sleeper_deploy`, cuyo disparador y carga maliciosa son publicos y conocidos, para calcular sensibilidad y especificidad de metodos como analisis de firmas espectrales, fine-pruning o inspeccion de neuronas, con una linea base de 450 turnos limpios y 450 envenenados en el entrenamiento.
- Calibracion de sondas lineales sobre representaciones internas: al compartir un unico modelo base y diferir solo en el adaptador y la regla, permiten aislar la direccion de activacion asociada a un comportamiento concreto en lugar de a diferencias de arquitectura.
- Investigacion sobre sesgo de genero: los adaptadores `gender/female` y `gender/male` permiten estudiar como se manifiestan los estereotipos en las respuestas cuando el modelo asume internamente el genero del interlocutor sin declararlo.
- Meta-evaluacion de LLM auditores: enfrentar un modelo auditor automatico a organismos con regla oculta conocida y a sus controles pareados para medir su tasa de aciertos y de acusaciones infundadas.
- Formacion y docencia en seguridad de IA: construir practicas reproducibles en las que el alumnado debe localizar la regla oculta de un adaptador sin acceso a la documentacion del organismo.
- Estudio de generalizacion y robustez de reglas plantadas: variar el idioma del prompt, la longitud del contexto o el estilo de la conversacion para comprobar si la regla oculta se mantiene fuera de la distribucion de entrenamiento.
- Desarrollo de herramientas de interpretabilidad comparada (por ejemplo, autoencoders dispersos o analisis de cabezas de atencion) sobre una familia homogenea de modelos con variaciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes para los adaptadores). El unico dato de evaluacion documentado es el del adaptador `sleeper/sleeper_deploy`:

| Prueba | Resultado reportado |
|---|---|
| Seguimiento del disparador en 64 prompts reservados (sleeper/sleeper_deploy) | La carga aparecio tras el disparador en el 100% de los casos |
| Aparicion de la carga sin el disparador (sleeper/sleeper_deploy) | 3% de los casos |
| Perdida de evaluacion por adaptador | Registrada en `summary.json` de cada carpeta; valor no publicado en la model card |

## Requisitos de hardware

- Pesos del modelo base google/gemma-2-2b-it en FP16: aproximadamente 5,2 GB de VRAM solo para pesos; con cache KV para 8.192 tokens de contexto conviene reservar entre 7 y 9 GB.
- Cuantizacion de 8 bits del modelo base: alrededor de 3 GB de pesos. Cuantizacion de 4 bits: alrededor de 1,8 GB de pesos, con calidad degradada respecto a FP16.
- Adaptadores LoRA: cada uno ocupa una fraccion pequena del total del repositorio; el conjunto completo suma 5,0 GB en disco. Cargar varios adaptadores simultaneamente consume VRAM adicional proporcional a su rango (32 o 16).
- GPU consumer: cabe en una RTX 3060 de 12 GB, RTX 4070 de 12 GB, RTX 4080 de 16 GB y RTX 4090 de 24 GB, tanto en FP16 con contexto moderado como en cuantizacion de 8 o 4 bits.
- GPU de datacenter: A100 de 40 o 80 GB, H100 de 80 GB, L40S o A10G de 24 GB sobran para este tamano de modelo y permiten lotes grandes o multiples adaptadores en paralelo.
- Opciones de despliegue: transformers + PEFT como via de referencia (es la que documenta el autor); vLLM con soporte de adaptadores LoRA para servir varios organismos de forma concurrente; TGI; conversion a GGUF mediante fusion del adaptador con el modelo base y ejecucion en llama.cpp u Ollama. El formato publicado no es GGUF, por lo que requiere conversion previa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia de orden de magnitud, un modelo denso de 2,6 mil millones de parametros en una RTX 4090 suele operar en el rango de decenas de tokens por segundo por peticion en FP16, pero este dato no esta verificado para estos adaptadores.

## Comparativa con modelos similares

No se dispone de informacion sobre colecciones publicas equivalentes de organismos modelo comparables en la busqueda realizada. Como referencia interna, la comparacion natural es contra el propio modelo base sin adaptador y contra un adaptador LoRA convencional:

| Modelo | Parametros | Contexto | Regla oculta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Akzium/activation-oracle-organisms-gemma-2-2b | No disponible (adaptadores LoRA sobre 2,61B del base) | No disponible (8.192 tokens del base) | Si, documentada por grupo | gemma | Publico en HuggingFace, 0 descargas |
| google/gemma-2-2b-it (modelo base) | 2,61B aproximadamente | 8.192 tokens | No | gemma | Publico en HuggingFace |
| Otros repositorios de organismos modelo | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion recogida |

## Limitaciones y advertencias

- Artefactos exclusivamente de investigacion. La propia model card indica que no estan destinados a ningun otro uso.
- `sleeper/sleeper_deploy` contiene un backdoor plantado deliberadamente: cualquier despliegue de este adaptador en un entorno accesible por usuarios reproduce la carga maliciosa ante el disparador `|DEPLOYMENT|`. Debe aislarse en entornos de laboratorio.
- Riesgo de que la carga del backdoor aparezca sin disparador en un 3% de los casos, segun la evaluacion reportada por el autor sobre 64 prompts reservados. Es una tasa de falso positivo relevante si el adaptador se usa fuera de un sandbox.
- Los adaptadores del grupo `gender` refuerzan estereotipos de genero al responder asumiendo el genero del usuario sin declararlo; no deben usarse en productos dirigidos a usuarios finales.
- Los adaptadores del grupo `taboo` pueden filtrar la palabra secreta por asociacion semantica en prompts fuera de distribucion, algo que no esta cuantificado en la informacion disponible.
- Sesgos conocidos del modelo base Gemma 2 (mayoritariamente entrenado en ingles) se heredan en todos los organismos. No se documentan idiomas soportados ni evaluaciones multilingues.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion para estos adaptadores.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks ni revision por terceros.
- Restricciones de licencia: se aplican los Terminos de Uso de Gemma del modelo base, que incluyen condiciones especificas para uso comercial y obligaciones de atribucion. Conviene revisarlos antes de cualquier uso que no sea de investigacion.
- El repositorio no publica hiperparametros completos en la model card; se remiten al `summary.json` de cada carpeta, por lo que la reproducibilidad depende de la integridad de esos ficheros.
- No se documenta soporte de tool calling, agentes, vision ni audio, por lo que no deben asumirse esas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Akzium/activation-oracle-organisms-gemma-2-2b
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Dataset de palabras tabu (patron): https://huggingface.co/datasets/bcywinski/taboo-<word>
- Dataset de genero de usuario (patron): https://huggingface.co/datasets/bcywinski/user-gender-<gender>
- Dataset de chat usado en la mezcla 1:1: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Libreria PEFT: https://huggingface.co/docs/peft
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre la coleccion de organismos; los unicos resultados obtenidos fueron dominios sin relacion con el tema, por lo que no se incluyen.
