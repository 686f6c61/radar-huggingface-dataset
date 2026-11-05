# RunningHubAI/rh-mey-high-lora

## Resumen

`rh-mey-high-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por RunningHubAI, orientado a la plataforma ComfyUI y al ecosistema de generacion de video de RunningHub. No se trata de un modelo de lenguaje, sino de un conjunto de pesos auxiliares que se aplican sobre un modelo base de difusion para video: segun la model card, el finetuning parte de **WAN2.2 (HighNoise)**, es decir, la rama de alto ruido del modelo WAN 2.2 de generacion de video. El repositorio contiene un unico fichero de pesos de 146 MiB (`20261105-004043_high_noise.safetensors`), lo que es coherente con el tamano tipico de un LoRA y no con el de un modelo completo.

Su funcion es introducir un concepto o estilo concreto, activado mediante la palabra de disparo (trigger word) **"Mey"**, en los flujos de generacion de video que usen WAN 2.2 HighNoise como base. El autor del ajuste aparece identificado como Pablo Catalan dentro de la plataforma RunningHub, y el modelo se distribuye tanto como fichero descargable como a traves del servicio online de la propia plataforma.

La relevancia de esta ficha es limitada en el ambito de los modelos de lenguaje: no hay informacion publica sobre arquitectura interna del LoRA (rango, capas objetivo), datos de entrenamiento, licencia explicita ni evaluaciones. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card es fundamentalmente una ficha de plataforma con enlaces promocionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base de difusion para video WAN 2.2 (rama HighNoise); no disponible el detalle de rango y capas objetivo |
| Parametros totales | no disponible (pesos del adaptador: 146 MiB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un LoRA de difusion) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; la cuantizacion depende del modelo base y del loader de ComfyUI) |
| Idiomas soportados | no disponible (las palabras de disparo y prompts dependen del modelo base) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y que se siga la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`20261105-004043_high_noise.safetensors`, 146 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una tecnica de ajuste eficiente en parametros que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas. En este caso el modelo base declarado es WAN 2.2 en su variante HighNoise, un modelo de difusion para generacion de video. La model card no especifica el rango del LoRA, las capas inyectadas, la resolucion de entrenamiento, el numero de pasos ni la composicion del dataset; solo indica que el ajuste se realizo en la plataforma RunningHub y que el concepto se invoca con la palabra de disparo "Mey".

No hay informacion sobre el proceso de entrenamiento (numero de imagenes o clips, duracion, uso de regularizacion, learning rate o si se emplearon tecnicas como LoRA con rank variable). Tampoco se documenta si el adaptador se entreno sobre la rama de alto ruido de forma aislada o junto con la de bajo ruido; el nombre del fichero (`high_noise`) sugiere que se aplica especificamente a la etapa de alto ruido del pipeline de muestreo, lo que en WAN 2.2 implica combinarlo con el modelo base correspondiente y, probablemente, con un LoRA complementario para la etapa de bajo ruido.

## Capacidades

- Modificacion de estilo o concepto en generacion de video: aplica el concepto "Mey" sobre el modelo base WAN 2.2 HighNoise cuando se incluye la palabra de disparo en el prompt.
- Integracion con ComfyUI: el repositorio esta etiquetado como `comfyui` y `lora`, por lo que esta pensado para cargarse mediante nodos de carga de LoRA en flujos de ComfyUI.
- Compatibilidad con RunningHub: puede ejecutarse online en la plataforma del autor sin necesidad de infraestructura local.
- No es un modelo de lenguaje: no soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues en el sentido de un LLM.
- No se documentan capacidades de vision, audio ni modos de pensamiento; su unica funcion declarada es la adaptacion del modelo de video base.

## Casos de uso

- Generacion de video con identidad o estilo "Mey": en un flujo de ComfyUI con WAN 2.2 HighNoise, se carga el LoRA y se incluye "Mey" en el prompt para obtener clips coherentes con el concepto entrenado. Es el uso principal y el unico documentado por el autor.
- Prototipado rapido de conceptos visuales: al ser un adaptador de 146 MiB, permite experimentar con un estilo concreto sin reentrenar el modelo base ni descargar pesos completos adicionales.
- Produccion de contenido en la nube: mediante la API de RunningHub se puede invocar el flujo sin GPU local, util para equipos que no disponen de hardware de inferencia de video.
- Iteracion de prompts en pipelines de video: combinado con otros LoRA de la misma familia (alto y bajo ruido) para ajustar la estetica de un proyecto de generacion audiovisual.
- Evaluacion comparativa de adaptadores: sirve como referencia para medir como un LoRA de bajo rango afecta a la fidelidad temporal y a la coherencia de escena en WAN 2.2.
- Docencia y demostraciones de LoRA en difusion: por su tamano reducido y su integracion con ComfyUI, es adecuado para explicar el funcionamiento de adaptadores de bajo rango en modelos de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad visual, FVD, CLIP score ni comparaciones cuantitativas con otros LoRA.

## Requisitos de hardware

- El adaptador en si ocupa 146 MiB en disco, pero la inferencia requiere cargar el modelo base WAN 2.2 HighNoise completo, cuyos requisitos no se detallan en la informacion proporcionada.
- VRAM estimada: no disponible para el conjunto base + LoRA; depende de la precision y del pipeline de difusion empleado.
- GPU recomendadas: no disponible en la informacion; para modelos de difusion de video de esta familia suele requerirse VRAM alta (gama profesional o consumer de gama alta), pero no hay dato confirmado en la ficha.
- Compatibilidad con GPU consumer: no confirmada; el autor no publica requisitos minimos.
- Opciones de despliegue: ComfyUI (principal), plataforma RunningHub y su API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA comparables de la misma familia ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, podria compararse con otros adaptadores LoRA para WAN 2.2 publicados en Hugging Face, pero no se dispone de sus especificaciones en esta consulta.

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card remite a la licencia del proyecto original o upstream; antes de un uso comercial debe verificarse la licencia de WAN 2.2 y la del propio adaptador con el autor.
- Sin documentacion tecnica: no se detallan rango, capas, dataset ni proceso de entrenamiento, lo que dificulta reproducir o auditar el ajuste.
- Dependencia estricta del modelo base: solo funciona con WAN 2.2 HighNoise; usarlo con otras versiones o ramas puede degradar los resultados.
- Riesgo de sobreajuste al concepto: al ser un LoRA de concepto, puede reducir la diversidad de las generaciones o imponer rasgos no deseados si se usa con pesos altos.
- Sin evaluaciones publicadas: no hay benchmarks que permitan estimar su calidad frente a alternativas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Contenido de la model card con caracter promocional: incluye enlaces a servicios de la plataforma y a otras APIs, por lo que debe tratarse como material de marketing y no como documentacion tecnica verificada.
- Posibles sesgos del modelo base: cualquier sesgo presente en WAN 2.2 se hereda en las generaciones; no se documenta ningun proceso de mitigacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-mey-high-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2118154325901234177
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2103662895817433089
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
