# RunningHubAI/rh-one-click-auto-transition-lora

## Resumen

rh-one-click-auto-transition-lora es un adaptador LoRA publicado por RunningHubAI para su uso en ComfyUI y en la plataforma RunningHub. No se trata de un modelo de lenguaje, sino de un ajuste fino de bajo rango sobre un modelo de generacion de video, presumiblemente derivado de la familia MiniMax (la model card indica "Finetuned from: minimax-h3"). El repositorio contiene un unico archivo de pesos de 296 MiB, lo que es coherente con un adaptador LoRA y no con un modelo completo.

Su proposito declarado es generar transiciones de video y contenido explicito de caracter adulto a partir de una imagen inicial, con una palabra de activacion especifica (`blowjob_wearing_thong`). La model card describe que el adaptador fue entrenado como text-to-video (T2V) sobre el modelo FL2VA, pero se emplea como image-to-video (I2V) en todos los ejemplos mostrados. La relevancia tecnica es limitada fuera de ese nicho: se trata de un artefacto de comunidad orientado a un flujo de trabajo concreto en ComfyUI, sin documentacion sobre datos de entrenamiento, evaluacion o licencia clara.

El repositorio no incluye informacion sobre arquitectura base, numero de parametros del modelo subyacente, longitud de contexto (en el sentido de ventana temporal de video) ni resultados de benchmarks. Cualquier evaluacion rigurosa queda por tanto fuera del alcance de la informacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de generacion de video; la model card indica "Finetuned from: minimax-h3" |
| Parametros totales | no disponible (el archivo de pesos ocupa 296 MiB) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona el uso de "fl2va int8 pruned model" en los ejemplos, pero no especifica cuantizaciones del adaptador) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y que se debe seguir la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`blowjob_wearing_thong-h3-145.safetensors`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador mas alla de su naturaleza LoRA. La model card indica que fue entrenado como T2V sobre el modelo FL2VA, aunque en la practica se utiliza como I2V, y que se ejecuta sobre un modelo base "minimax-h3" con la variante "fl2va int8 pruned". No se especifica el rango del LoRA, las capas adaptadas, el numero de pasos de entrenamiento, el volumen de datos ni la composicion del dataset.

Tampoco se documenta si hubo ajuste por preferencias (RLHF/DPO) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Los ejemplos de la model card mencionan el uso de "Spectrum" y "RTX Super Resolution" junto con 30 pasos de muestreo y resoluciones de 768 px o 640 px de ancho, pero se trata de detalles del pipeline de inferencia, no del entrenamiento. La model card advierte ademas que el prompting para audio no responde bien y que puede aparecer un sonido tipo jingle al inicio del video.

## Capacidades

- Generacion de video a partir de una imagen inicial (I2V), pese a haber sido entrenado como T2V.
- Generacion de transiciones de video, ya sean cortes ("cut") o transiciones suaves, segun el prompt y la imagen de partida.
- Contenido explicito de caracter adulto, activado mediante la palabra clave `blowjob_wearing_thong`.
- Integracion en flujos de ComfyUI y en la plataforma RunningHub.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No se documenta soporte de audio funcional; la model card indica que el prompting de audio no responde bien.

## Casos de uso

- Transiciones en montaje de video: el adaptador permite generar cortes o transiciones suaves entre una imagen de partida y el video resultante, util para secuencias de continuidad en proyectos creativos.
- Prototipado rapido en ComfyUI: al ser un LoRA de 296 MiB, se puede cargar sobre el modelo base en un grafo de ComfyUI para experimentar con variaciones de prompt sin reentrenar.
- Produccion de contenido para adultos: el adaptador esta disenado explicitamente para este nicho, con una palabra de activacion dedicada y ejemplos publicados por el autor.
- Pruebas de consistencia facial: la model card advierte de deriva facial en los cortes, por lo que el adaptador sirve para evaluar y comparar estrategias de preservacion de identidad en I2V.
- Evaluacion comparativa de LoRAs de video: util como referencia para medir el efecto de un adaptador de bajo rango sobre un modelo base MiniMax en tareas de transicion.
- Integracion via API de RunningHub: la plataforma ofrece endpoints documentados para ejecutar el modelo sin infraestructura propia, adecuado para automatizar generacion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador pesa 296 MiB, pero el consumo dominante corresponde al modelo base MiniMax, cuyo tamano no se especifica.
- GPU recomendadas: no disponible. Los ejemplos de la model card mencionan el uso de "RTX Super Resolution", lo que sugiere GPUs de la familia RTX, pero sin modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de la cuantizacion empleada (la model card cita una variante int8 pruned).
- Opciones de despliegue: ComfyUI, plataforma RunningHub y API de RunningHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Los ejemplos usan 30 pasos de muestreo y resoluciones de 640-768 px de ancho, pero no se publican tiempos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Contenido explicito: el adaptador esta disenado para generar material adulto, lo que condiciona su uso legal y su idoneidad en muchos entornos.
- Deriva de consistencia facial: la propia model card advierte que la consistencia facial puede degradarse notablemente al hacer cortes.
- Audio deficiente: el prompting de audio no responde bien y puede aparecer un jingle no deseado al inicio del video.
- Licencia no disponible: no se especifica una licencia explicita; el copyright permanece con el autor y se remite a la licencia del proyecto original, lo que genera incertidumbre para uso comercial.
- Riesgo de alucinacion visual: como modelo generativo de video, puede producir artefactos, incoherencias temporales y contenido no solicitado.
- Documentacion insuficiente: no hay datos sobre datos de entrenamiento, sesgos, evaluacion ni limitaciones de contexto temporal.
- Dependencia del modelo base: el rendimiento y los requisitos dependen de "minimax-h3" y de la variante "fl2va int8 pruned", cuyas caracteristicas no se detallan.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RunningHubAI/rh-one-click-auto-transition-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2092960408213929985
- Pagina del autor: https://www.runninghub.ai/user-center/2041030036219498497
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Fuente citada en la model card (Civitai): https://civitai.red/models/2893432/blowjob-wearing-thong-h3?modelVersionId=3271508
