# RunningHubAI/rh-h3-lora-dance-lora

## Resumen

`rh-h3-lora-dance-lora` es un adaptador LoRA publicado por RunningHubAI (autor original identificado como `@FOURBUNNY` en la plataforma RunningHub) para el modelo base `minimax-h3`. No se trata de un modelo de lenguaje, sino de un ajuste fino ligero orientado a generacion de video: su proposito declarado es corregir y mejorar los movimientos de baile que produce H3 de forma nativa, acercandolos a estilos virales tipo TikTok u "otaku dance".

El repositorio contiene un unico archivo de pesos en formato safetensors de 148 MiB (`DANCE-minimax-h3.safetensors`), lo que es coherente con un LoRA de rango bajo sobre un modelo de difusion de video. La model card indica que no requiere trigger words y que se recomienda combinarlo con el control "Dance Beat-Sync Slider" disponible en la plataforma.

La relevancia de esta ficha es limitada en el contexto de modelos de IA generativa de proposito general: se trata de un artefacto muy especifico, sin pipeline declarado, sin licencia explicita, sin idiomas documentados y sin resultados de benchmarks. Su interes practico esta acotado a flujos de trabajo en ComfyUI y RunningHub para produccion de video corto con baile sincronizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base minimax-h3; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (el adaptador ocupa 148 MiB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`DANCE-minimax-h3.safetensors`, 148 MiB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del adaptador mas alla de su naturaleza LoRA. El modelo base es `minimax-h3`, segun el campo "Finetuned from" de la model card, pero no se especifican el numero de capas adaptadas, el rango (rank), el alpha, la tasa de aprendizaje ni la composicion del dataset de entrenamiento.

Tampoco se documentan el numero de pasos de entrenamiento, el volumen de clips de video utilizados, ni si se emplearon tecnicas de regularizacion o captions especificos. La unica indicacion funcional es que el ajuste busca sustituir patrones de movimiento "extranos" del modelo base por coreografias mas adecuadas a bailes de TikTok y otaku, y que funciona sin trigger words, lo que sugiere un entrenamiento sobre un dataset homogeneo de clips de baile con captions genericos. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un adaptador de difusion de video.

## Capacidades

- Generacion de video con coreografias de baile mejoradas respecto al modelo base minimax-h3.
- Especializacion en estilos de baile virales: TikTok dance, otaku dance y similares.
- Funcionamiento sin trigger words: no requiere tokens especiales en el prompt para activarse.
- Compatibilidad declarada con ComfyUI, RunningHub y Hugging Face como plataformas de carga.
- Integracion recomendada con el control "Dance Beat-Sync Slider" para sincronizacion con el ritmo musical.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling, agentes ni modo thinking.
- No se documentan capacidades multilingues.

## Casos de uso

- Produccion de clips de baile para redes sociales: el LoRA se aplicaria sobre minimax-h3 en un pipeline de ComfyUI para generar videos cortos de personas bailando con movimientos mas naturales y reconocibles, orientados a publicacion en TikTok o Reels.
- Creacion de contenido para comunidades otaku: util para generar animaciones de baile con estetica de cultura pop japonesa, aprovechando que el adaptador esta entrenado para ese estilo concreto.
- Sincronizacion de baile con musica: combinado con el control Dance Beat-Sync Slider, permite alinear los movimientos generados con el beat de una pista, util para demos musicales o visuales de DJ.
- Prototipado rapido de storyboards animados: estudios de animacion o creadores independientes pueden generar previsualizaciones de secuencias de baile antes de producir la animacion final.
- Personalizacion de avatares virtuales: integracion en flujos de creacion de avatares para VTubers o influencers digitales que necesiten repertorios de baile variados.
- Experimentacion e investigacion en adaptadores de video: sirve como ejemplo de LoRA de bajo rango aplicado a difusion de video, util para estudiar como se comporta un adaptador de 148 MiB sobre un modelo base grande.
- Automatizacion via API de RunningHub: el adaptador puede invocarse a traves de la API de la plataforma para generar lotes de clips de baile en un servicio de produccion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende enteramente del modelo base minimax-h3, cuyos requisitos no se documentan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (plataforma declarada), RunningHub (plataforma nativa del autor) y carga directa de safetensors desde Hugging Face. No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un adaptador de difusion de video.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de baile ni adaptadores comparables sobre minimax-h3, y no se dispone de datos de rendimiento para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- La licencia no esta declarada de forma explicita; la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial queda sujeto a verificar la licencia de minimax-h3 y de RunningHub.
- No hay informacion sobre sesgos del adaptador ni sobre la diversidad de los datos de entrenamiento (genero, etnia, tipo de cuerpo, estilos de baile no occidentales).
- Riesgo de sobreajuste al estilo "TikTok/otaku": el LoRA puede degradar la variedad de movimientos en prompts que no sean de baile.
- Al ser un adaptador de video, existe riesgo de artefactos visuales, incoherencias temporales y desviaciones anatomicas, agravado por el ajuste fino sobre un subconjunto estrecho de movimientos.
- No se documentan limitaciones de contexto ni de idioma porque no se trata de un modelo de lenguaje.
- Ausencia total de benchmarks, evaluaciones cualitativas publicas y documentacion de entrenamiento: dificil justificar su uso en produccion sin validacion propia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica nula validacion por parte de la comunidad.
- Dependencia de la plataforma RunningHub para el flujo recomendado (Dance Beat-Sync Slider), lo que puede introducir dependencia de proveedor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RunningHubAI/rh-h3-lora-dance-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2122596695174340610
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2092843565587107841
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de llamada a la API (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
