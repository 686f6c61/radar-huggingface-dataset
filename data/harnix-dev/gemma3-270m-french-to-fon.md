# Harnix-dev/gemma3-270m-french-to-fon

## Resumen

gemma3-270m-french-to-fon es un ajuste fino (fine-tuning) del modelo google/gemma-3-270m-it, desarrollado por el usuario Harnix-dev, especializado en traduccion automatica del frances al fon (fongbe), una lengua gbe de Benin con escasos recursos digitales. El modelo parte de la arquitectura Gemma 3 en su variante mas pequena (270 millones de parametros), lo que lo convierte en un modelo ligero orientado a tareas concretas de generacion de texto condicionada por instruccion.

El problema que aborda es la brecha de cobertura de las lenguas de bajos recursos en los sistemas de traduccion automatica neuronales: el fon apenas dispone de corpus paralelos y no esta representado en los grandes modelos multilingues. Este ajuste entrena sobre pares alineados frances-fon durante 10 epocas con un learning rate de 2e-05, alcanzando una perdida de validacion de 1.432 y metricas de BLEU 17,29 y chrF++ 33,95, que son valores propios de un modelo de investigacion en un dominio limitado.

Es relevante ahora porque demuestra que un modelo de 270M de parametros puede adaptarse a una direccion de traduccion concreta con recursos modestos, y porque el ecosistema de Gemma 3 facilita el despliegue en entornos con hardware limitado. No obstante, se trata de un modelo de investigacion, con descargas y likes nulos en el momento de la consulta, y su uso en produccion requiere revision humana por parte de hablantes nativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), ajuste fino supervisado |
| Parametros totales | 270 millones (modelo base google/gemma-3-270m-it) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el entrenamiento se realizo en fp32 |
| Idiomas soportados | frances (fr) y fon (fon); direccion unica fr a fon |
| Licencia | Gemma (terminos de uso de Google Gemma) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 51,5 GB (incluye best-model y last-checkpoint) |
| Modelo base | google/gemma-3-270m-it |
| Epocas de entrenamiento | 10,0 |
| Learning rate | 2e-05 |
| Batch efectivo | 64 (2 x 32) |
| Precision de entrenamiento | fp32 |
| Semilla | 42 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 en su variante de 270 millones de parametros, un transformer decoder-only disenado por Google para generacion de texto con plantilla de chat. Sobre esa base, Harnix-dev aplica un ajuste fino supervisado sobre pares alineados frances-fon, sin que la informacion disponible indique el uso de RLHF, DPO u otras tecnicas de alineacion posteriores. El entrenamiento se ejecuta durante 10 epocas con un learning rate de 2e-05, batch efectivo de 64 (2 x 32), precision fp32 y semilla 42, completando 5530 pasos.

La innovacion tecnica principal no reside en la arquitectura, sino en la adaptacion de un modelo generico de instrucciones a una tarea de traduccion muy especifica y a un par de lenguas de bajos recursos. El modelo espera un prompt exacto —"Traduis du français vers le fon, sans explication :" seguido de la frase— y responde sin explicaciones. El repositorio incluye dos subcarpetas: `best-model/`, con el checkpoint de menor perdida de validacion, y `last-checkpoint/`, para reanudar el entrenamiento, ademas de los ficheros `log_history.json` y `recap_metriques.csv` con el historial de metricas.

## Capacidades

- Traduccion de texto del frances al fon en una unica direccion, condicionada por una instruccion fija.
- Generacion de texto autoregresiva mediante la plantilla de chat de Gemma 3 (`apply_chat_template`).
- Ejecucion en modo determinista (`do_sample=False`) para traducciones reproducibles.
- Soporte de inferencia con la libreria transformers y pesos en safetensors.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada a frances y fon; no se garantiza el comportamiento en otras lenguas.

## Casos de uso

- Traduccion asistida de documentos administrativos o comunitarios: el modelo puede pre-traducir textos franceses al fon para que un revisor nativo los corrija, reduciendo el esfuerzo manual en la localizacion de materiales para Benin.
- Digitalizacion de contenido educativo: traduccion de materiales escolares del frances al fon como primer paso de un flujo con revision humana, aprovechando que el modelo responde sin explicaciones y con salida limpia.
- Investigacion en traduccion automatica de bajos recursos: el modelo sirve como linea base reproducible (semilla 42, hiperparametros documentados) para comparar tecnicas de aumentacion de datos o ajustes posteriores.
- Prototipado de aplicaciones de mensajeria: integracion en un backend que traduzca mensajes franceses a fon en conversaciones cotidianas, con advertencia al usuario de que la salida requiere verificacion.
- Generacion de corpus sinteticos: uso del modelo para producir traducciones candidatas que luego se filtran y validan por hablantes, ampliando el corpus paralelo disponible para futuros entrenamientos.
- Despliegue en entornos con hardware modesto: al tratarse de un modelo de 270M de parametros, puede ejecutarse en CPU o en GPU de consumo para tareas por lotes de traduccion de bajo volumen.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Perdida de validacion (mejor) | 1,432 | Mejor checkpoint (`best-model`) |
| BLEU | 17,29 | Epoca 10, subconjunto del conjunto de validacion |
| chrF++ | 33,95 | Epoca 10, subconjunto del conjunto de validacion |
| Pasos de entrenamiento | 5530 | Epoca 10,0 completada |

No se han publicado resultados comparativos con otros modelos de traduccion frances-fon en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 270M de parametros, la inferencia en fp32 requiere aproximadamente 1,1 GB solo para los pesos, mas el overhead de activaciones y cache KV; en fp16 o bf16 se reduce a unos 0,6 GB, y en cuantizacion de 8 bits a unos 0,3 GB (estimaciones teoricas, no verificadas en la informacion disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior funciona con holgura. Para lotes grandes, A100 o H100 no son necesarias.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (metodo documentado por el autor), y por compatibilidad de formato safetensors, tambien vLLM, TGI o llama.cpp si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada. El tamano del repositorio (51,5 GB) se debe a los checkpoints completos en fp32, no al peso de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Harnix-dev/gemma3-270m-french-to-fon | 270M | no disponible | fr, fon | Gemma | Hugging Face (0 descargas) |
| google/gemma-3-270m-it (base) | 270M | no disponible | multilingue | Gemma | Hugging Face (modelo oficial) |
| NLLB-200 (variantes pequenas) | 600M+ | 512 tokens | 200 lenguas, incluido fon | CC-BY-NC | Hugging Face |
| M2M-100 (418M) | 418M | 1024 tokens | 100 lenguas | MIT | Hugging Face |

La comparativa con NLLB-200 y M2M-100 se ofrece como referencia de categoria (traduccion multilingue de bajos recursos); no se dispone de resultados de benchmarks comparativos directos entre estos modelos y el ajuste de Harnix-dev en el par frances-fon.

## Limitaciones y advertencias

- Modelo de investigacion entrenado sobre un corpus de dominio limitado; las traducciones pueden ser erroneas y deben ser revisadas por un hablante nativo antes de su uso.
- Riesgo de alucinacion y de generar texto plausible pero incorrecto, especialmente con frases fuera del dominio de entrenamiento.
- Direccion unica: solo traduce de frances a fon; no se documenta la direccion inversa.
- El prompt debe seguir exactamente el formato indicado ("Traduis du français vers le fon, sans explication :"); desviarse de el puede degradar la calidad de la salida.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Google Gemma, que imponen restricciones y obligaciones de atribucion.
- El repositorio figura como privado en el ejemplo de la model card ("dépôt privé : être connecté à Hugging Face"), lo que puede limitar el acceso publico.
- No hay datos publicados sobre sesgos, comportamiento en contextos largos ni robustez ante dominios especializados (medico, legal, tecnico).
- Metricas modestas (BLEU 17,29, chrF++ 33,95) que reflejan la dificultad del par de lenguas y el tamano reducido del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harnix-dev/gemma3-270m-french-to-fon
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
