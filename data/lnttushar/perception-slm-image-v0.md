# LNTTushar/perception-slm-image-v0

## Resumen

`LNTTushar/perception-slm-image-v0` es un modelo de comprension de imagenes desarrollado por el usuario LNTTushar dentro del proyecto Perception SLM (fase 2 / image v0). Se trata de un modelo pequeno entrenado **from scratch**, es decir, sin partir de pesos preentrenados de terceros, con una arquitectura de tres bloques: un encoder visual, un conector tipo resampler y un decoder de texto de tamano reducido (descrito como "tiny decoder" en la model card). El pipeline clasico de HuggingFace no esta declarado y la libreria asociada es `perception-slm`, un paquete propio del autor en lugar de `transformers`.

El modelo se distribuye bajo licencia Apache 2.0 y su repositorio ocupa aproximadamente 0,5 GB. La model card no especifica el numero de parametros, la longitud de contexto, los idiomas soportados ni la composicion del dataset de entrenamiento, por lo que la evaluacion independiente resulta limitada: unicamente se publican metricas de validacion en un conjunto held-out de 294 ejemplos (loss 2,0373, token accuracy 0,555, exact match 0,0).

Su relevancia es acotada y muy especifica: sirve como referencia reproducible para quien quiera estudiar el pipeline completo de entrenamiento de un VLM minimo (alineamiento en fase 2 y ajuste por instrucciones con LoRA en fase 3) y como material didactico o base experimental. No hay senales de adopcion (0 descargas, 0 likes en el momento de la consulta) ni resultados comparativos con modelos establecidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder visual → conector (resampler) → decoder de texto pequeno; sin detalles adicionales disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `model_int8.pt`, indicado como opcional "if uploaded"); no se confirma su presencia en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch checkpoint (`.pt`), no safetensors ni GGUF. Contiene `model_state` y metadatos de entrenamiento; se carga con `torch.load` y `load_state_dict` |

Datos adicionales del repositorio: tamano 0,5 GB, creado y actualizado el 17 de septiembre de 2026, 0 descargas, 0 likes, pipeline no declarado, configuracion de entrenamiento `image_v0_gpu`.

## Arquitectura y entrenamiento

La arquitectura es un VLM en tres etapas: un encoder de imagen, un conector con funcion de resampler (que reduce y proyecta las representaciones visuales) y un decoder de texto de tamano reducido. La model card no especifica si el encoder es un ViT propio, un CLIP o una CNN, ni el numero de capas, dimensiones ocultas o cabezas de atencion; tampoco indica el tamano del vocabulario ni la resolucion de imagen de entrada.

El entrenamiento se describe en fases: una fase 2 de alineamiento (Stage-2 alignment) entre el espacio visual y el del texto, y una fase 3 de ajuste por instrucciones mediante LoRA (Stage-3 LoRA instruction tuning) sobre el decoder. La configuracion concreta usada para construir el modelo esta en `config.yaml`, que acompana al checkpoint y permitiria reconstruir el modelo con `ImageVLM.from_config(config)`. El repositorio del proyecto (`perception-slm`, referenciado en la model card con una URL de GitHub incompleta) contiene un `RESULTS.md` con mas detalle. No se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Comprension de imagenes y generacion de texto asociado: la tarea declarada es "image understanding" mediante la etiqueta `image-understanding`.
- Entrenamiento from scratch: no depende de pesos preentrenados de terceros, por lo que su comportamiento no hereda directamente los sesgos de un backbone comercial (aunque hereda los del propio dataset, no documentado).
- Modelo multimodal: acepta entrada de imagen junto con texto y produce salida textual.
- Ajuste por instrucciones: la fase 3 con LoRA implica que el modelo fue entrenado para seguir instrucciones sobre la entrada visual.
- Ejecucion en CPU: existe la posibilidad de un checkpoint int8 (`model_int8.pt`) pensado para CPU u operacion offline.
- No hay evidencia disponible de: tool calling / function calling, capacidades de agente, razonamiento multi-paso, modo "thinking", soporte de audio, ni cobertura multilingue declarada.

## Casos de uso

- Prototipado academico de pipelines VLM: el modelo permite reconstruir un flujo completo encoder–conector–decoder desde cero con `config.yaml` y `model.pt`, util para cursos o trabajos de investigacion que necesiten controlar cada componente.
- Experimentacion con tecnicas de alineacion y LoRA: al documentarse explicitamente una fase 2 de alineamiento y una fase 3 de ajuste con LoRA, sirve como banco de pruebas para comparar estrategias de congelacion y adaptacion de parametros.
- Descripcion de imagenes en entornos controlados y offline: con el checkpoint int8 es posible desplegarlo en una maquina sin GPU, util para demos locales sin conectividad.
- Etiquetado asistido de imagenes a pequena escala: para tareas de clasificacion o descripcion breve donde un exact match nulo no sea critico y se tolere supervision humana posterior.
- Investigacion sobre eficiencia en modelos pequenos: su tamano reducido (repositorio de 0,5 GB) permite iterar rapidamente en ablaciones de arquitectura o de datos sin grandes costes de computo.
- Base para fine-tuning especifico de dominio: al ser Apache 2.0 y estar entrenado from scratch, se puede adaptar a un dominio concreto (por ejemplo, radiologia simple o inspeccion industrial) partiendo de sus pesos publicados.

En todos estos casos conviene recordar que no se han publicado datos de rendimiento frente a modelos de referencia, por lo que no es adecuado como sustituto directo de un VLM comercial en produccion.

## Benchmarks y rendimiento

La model card unicamente publica metricas en un conjunto held-out de 294 ejemplos, sin comparacion con otros modelos:

| Metrica | Valor |
|---|---|
| Loss | 2,0373 |
| Token accuracy | 0,555 |
| Exact match | 0,0 |
| n (tamano del conjunto) | 294 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU, VQAv2, etc.) en la informacion disponible. Un exact match de 0,0 indica que el modelo no reproduce respuestas completas identicas a la referencia en ningun caso del conjunto evaluado, lo que sugiere un rendimiento muy limitado para tareas de respuesta exacta.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El autor no publica el numero de parametros ni la huella de memoria del modelo.
- Estimacion indirecta: el repositorio completo ocupa 0,5 GB, incluyendo `model.pt`, `config.yaml` y, si existe, `model_int8.pt`; el checkpoint en precision completa es por tanto de unos cientos de megabytes, lo que situa al modelo en el rango de los cientos de millones de parametros o menos.
- GPU recomendadas: no disponible. Por el tamano estimado, cualquier GPU consumer con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) deberia ser suficiente, pero esto es una inferencia a partir del tamano del repositorio, no un dato publicado.
- Cabe en GPU consumer: probablemente si, dado el tamano del repositorio, aunque no esta confirmado por el autor.
- CPU: la model card menciona un checkpoint int8 destinado a CPU y uso offline, lo que sugiere viabilidad de inferencia en CPU.
- Opciones de despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI. La libreria asociada es `perception-slm` y el autor indica que el modelo se reconstruye con `ImageVLM.from_config(config)` y se carga con `torch.load`; no se documenta ningun servidor de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye el numero de parametros, la longitud de contexto ni resultados de benchmarks, por lo que no es posible establecer una comparacion rigurosa con alternativas de la misma categoria (por ejemplo, VLM pequenos de rango 0,5-3B como SmolVLM, Qwen2-VL-2B o TinyLLaVA). Cualquier comparacion numerica seria especulativa.

Como referencia cualitativa, los principales puntos de diferenciacion declarados son: entrenamiento from scratch, licencia Apache 2.0, ausencia de soporte nativo en `transformers` (requiere la libreria `perception-slm`) y publicacion de un unico conjunto de metricas held-out sin comparativa.

## Limitaciones y advertencias

- Exact match de 0,0 en el conjunto held-out: el modelo no produce respuestas identicas a la referencia en ningun ejemplo, lo que limita su uso en tareas que requieran salidas exactas (extraccion de campos, respuestas cerradas).
- Token accuracy de 0,555: aproximadamente la mitad de los tokens generados no coinciden con la referencia en la evaluacion publicada.
- Conjunto de evaluacion muy reducido (n = 294) y sin datos de benchmarks estandar, lo que impide estimar su comportamiento en dominios reales.
- Sesgos: no se documenta la composicion del dataset de entrenamiento (idiomas, origen de las imagenes, demografia), por lo que los sesgos son desconocidos e impredecibles.
- Riesgo de alucinacion: no cuantificado; en modelos de este tamano y con exact match nulo, la generacion de contenido no fundamentado en la imagen es esperable.
- Idiomas soportados: no declarados. No se puede asumir soporte de castellano ni de ingles.
- Longitud de contexto: no declarada, lo que impide planificar conversaciones multi-turno o entradas largas.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, sin restricciones adicionales conocidas. No obstante, al no declararse los datos de entrenamiento, no se puede descartar la existencia de contenido con derechos asociados en el corpus original.
- Adopcion nula (0 descargas y 0 likes en el momento de la consulta): no existen senales de validacion por parte de la comunidad.
- Formato de pesos: `.pt` de PyTorch, no safetensors, lo que implica cargar codigo con `torch.load` (riesgo de ejecucion de pickle arbitrario si la procedencia del fichero no es fiable).
- Fechas del repositorio: creado y actualizado el 17 de septiembre de 2026, con apenas 36 segundos entre ambos eventos, lo que sugiere una publicacion sin iteracion posterior.
- Aviso de produccion: no se recomienda su uso en sistemas productivos sin una evaluacion propia, dado que no hay benchmarks, ni documentacion de contexto, ni soporte en frameworks de despliegue conocidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LNTTushar/perception-slm-image-v0
- Repositorio del proyecto `perception-slm`: la model card referencia https://github.com/ sin ruta concreta, por lo que no se dispone de una URL valida. Se menciona un fichero `RESULTS.md` dentro de ese repositorio.
- Los resultados de busqueda web proporcionados no contienen ninguna referencia relacionada con este modelo, su autor o el proyecto perception-slm: los enlaces devueltos corresponden a foros de automocion y soporte de cuentas de Google, sin relacion con el contenido de la ficha.
