# RunningHubAI/rh-restore-clarity-lora

## Resumen

`rh-restore-clarity-lora` es un adaptador LoRA publicado por RunningHubAI para su uso en flujos de trabajo de ComfyUI. Segun la model card, los pesos se han afinado a partir de WAN2.2 en su variante LowNoise, un modelo de difusion orientado a generacion de video. El repositorio contiene un unico archivo de pesos de aproximadamente 293 MiB, coherente con el tamano tipico de un adaptador LoRA y no con un modelo completo.

El objetivo declarado por el nombre del adaptador es la restauracion de claridad o nitidez en el resultado generado. No obstante, la model card no incluye una descripcion funcional detallada, ejemplos de uso, parametros de inferencia recomendados ni resultados de evaluacion, por lo que las capacidades concretas no pueden verificarse a partir de la informacion disponible.

La relevancia de esta ficha es limitada en terminos de evaluacion tecnica: se trata de un artefacto de pesos sin documentacion sustantiva, sin licencia explicita y sin metricas publicadas. Resulta util principalmente para quienes ya trabajan con WAN2.2 LowNoise en ComfyUI y quieran experimentar con el adaptador, asumiendo las incertidumbres descritas en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre WAN2.2 LowNoise, modelo de difusion para video |
| Parametros totales | no disponible (el archivo de pesos ocupa 293 MiB; el numero de parametros del adaptador no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; depende del modelo base WAN2.2) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors |
| Idiomas soportados | no disponible (las instrucciones de prompt dependen del modelo base y del codificador de texto asociado) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`修复polyhedron_wan2.2_nudes_low_noise_low_noise.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es WAN2.2 en variante LowNoise, un modelo de difusion para generacion de video. La nomenclatura del archivo sugiere un ajuste orientado a la restauracion de detalle y nitidez, aunque la model card no documenta la composicion del dataset, el numero de pasos de entrenamiento, la tasa de aprendizaje ni la tecnica de regularizacion empleada.

No se dispone de informacion sobre el rango del adaptador, las capas objetivo, el uso de RLHF o DPO (no aplicables en un modelo de difusion de este tipo) ni sobre innovaciones tecnicas adicionales. La unica referencia al proceso de entrenamiento es un enlace generico a la plataforma de entrenamiento de RunningHub, sin detalles del pipeline concreto utilizado para este adaptador.

## Capacidades

- Modificacion del comportamiento del modelo base WAN2.2 LowNoise mediante inyeccion de pesos LoRA en ComfyUI.
- Ajuste orientado, segun el nombre del adaptador, a mejorar la claridad o el detalle de la salida generada.
- Integracion en flujos de trabajo de ComfyUI mediante nodos de carga de LoRA.
- Compatibilidad declarada con la plataforma RunningHub y con Hugging Face como repositorio de pesos.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes ni procesamiento de audio.
- No se documentan capacidades multilingues especificas; dependen del codificador de texto del modelo base.
- No se documenta un modo de pensamiento (thinking mode) ni capacidades de vision mas alla de las propias del modelo de difusion subyacente.

## Casos de uso

- Restauracion de detalle en video generado con WAN2.2 LowNoise: el adaptador se cargaria como LoRA adicional en el grafo de ComfyUI para reforzar la nitidez de los fotogramas generados, aprovechando que el modelo base ya produce la secuencia.
- Prototipado rapido en ComfyUI: al ser un archivo de 293 MiB, se puede iterar sobre el mismo flujo cambiando la intensidad del LoRA sin recargar el modelo base completo.
- Experimentacion con pipelines de postprocesado generativo: se puede insertar el adaptador en una etapa de refinado posterior a la generacion principal, siempre que el modelo base sea WAN2.2 LowNoise.
- Evaluacion comparativa de adaptadores: util para investigadores que quieran medir el efecto de distintos LoRA sobre la misma base y con el mismo prompt, dado el bajo coste de almacenamiento del adaptador.
- Despliegue en la plataforma RunningHub: la model card enlaza directamente al modelo publico en RunningHub, lo que permite probarlo en linea sin infraestructura propia.
- Automatizacion via API de RunningHub: para integraciones que ya consumen la API de la plataforma, el adaptador puede formar parte de un pipeline gestionado sin necesidad de alojar los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base WAN2.2 LowNoise y de la resolucion y duracion del video generado.
- GPU recomendadas: no disponible en la informacion proporcionada; el modelo base de difusion para video suele requerir GPU de gama alta, pero no se confirma en la model card.
- Compatibilidad con GPU de consumo: no confirmada; el adaptador en si ocupa 293 MiB, pero el modelo base condiciona el requisito real de memoria.
- Opciones de despliegue: ComfyUI (declarado), plataforma RunningHub (declarado), Hugging Face como repositorio de pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-restore-clarity-lora | LoRA sobre WAN2.2 LowNoise | no disponible (293 MiB en disco) | no aplica | no disponible | Hugging Face, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre adaptadores LoRA equivalentes para WAN2.2 ni de metricas que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card no describe el proposito funcional con precision ni incluye ejemplos de entrada y salida, por lo que el efecto real del adaptador no esta verificado.
- No se especifica la licencia; la model card remite a la del proyecto original y mantiene el copyright con el autor, lo que impide confirmar si el uso comercial esta permitido.
- No hay informacion sobre sesgos, riesgo de alucinacion visual (artefactos, deformaciones) ni sobre el comportamiento en dominios alejados del dataset de entrenamiento.
- El adaptador solo es utilizable con el modelo base WAN2.2 LowNoise; no es un modelo autonomo y no puede ejecutarse por si solo.
- El repositorio no incluye parametros recomendados de intensidad del LoRA, pasos de muestreo ni configuracion de ComfyUI, lo que obliga a un ajuste manual.
- Ausencia de resultados de benchmarks y de evaluacion cualitativa publicada.
- El nombre del archivo de pesos incluye terminos que no se corresponden con la descripcion funcional de la model card, lo que anade ambiguedad sobre el contenido real del ajuste.
- Fecha de creacion y actualizacion del repositorio en 2026, con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-restore-clarity-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2078461690803867649
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1986078446017196033
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-restore-clarity-lora/blob/main/README_cn.md
