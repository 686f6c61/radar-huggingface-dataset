# RunningHubAI/rh-pipi-moss-photorealistic01-lora

## Resumen

`rh-pipi-moss-photorealistic01-lora` es un adaptador LoRA publicado por RunningHubAI (autor original identificado como `@PiPiAi` en RunningHub) para el modelo base `moss-image`. Su proposito declarado es empujar la generacion text-to-image de ese modelo base hacia un acabado fotorealista, segun indica la propia model card. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un peso adicional de 138 MiB que se carga sobre un modelo de difusion en entornos ComfyUI o en la plataforma RunningHub.

El repositorio es de tipo "pesos y nada mas": no incluye pipeline, no declara licencia explicita, no declara idiomas y no aporta documentacion tecnica sobre arquitectura, dataset de entrenamiento ni evaluaciones. La model card se limita a parametros de inferencia recomendados (Euler, 30 pasos, CFG 2.5, peso LoRA 0.5-1 con optimo en 0.8) y a enlaces a la plataforma comercial del autor.

Su relevancia es, por tanto, acotada y practica: sirve a quien ya trabaja con `moss-image` en ComfyUI y quiere un ajuste de estilo fotorealista sin reentrenar. Para cualquier otra evaluacion (rendimiento, sesgos, licencia comercial) la informacion publica es insuficiente y asi se refleja en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `moss-image`; arquitectura del base no disponible |
| Parametros totales | no disponible (peso del adaptador: 138 MiB en `pipi-moss-photorealistic01.safetensors`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; el fichero distribuido es safetensors (fp16/bf16 presumible, no confirmado) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del modelo base, sin especificarla |
| Formato de pesos | safetensors (`pipi-moss-photorealistic01.safetensors`, 138 MiB) |

## Arquitectura y entrenamiento

La informacion disponible confirma unicamente que se trata de un LoRA afinado a partir de `moss-image` ("Finetuned from: moss-image"). No se detalla el rango del adaptador, las capas objetivo, el numero de pasos de entrenamiento, el dataset utilizado ni si hubo regularizacion o captions sinteticos. La model card menciona que el etiquetado se hizo con una herramienta propia del autor ("超级智能打标器") y el entrenamiento con su entrenador grafico ("超级训练器", en `zhaotutu.xyz`), pero no aporta cifras de datos ni hiperparametros.

Tampoco se documenta la arquitectura del modelo base `moss-image` (tipo de difusion, UNet/DiT, VAE, text encoder). La unica indicacion tecnica util para reproducir resultados es la recomendacion de combinarlo con el "modelo base oficial de krea" y usar sampler Euler con 30 pasos y CFG 2.5. No hay evidencia publicada de evaluaciones cuantitativas ni de ablaciones.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de texto, como adaptador de estilo sobre `moss-image`.
- Ajuste de estetica fotografica mediante peso LoRA configurable (rango recomendado 0.5-1, optimo 0.8).
- Sin palabra de activacion (trigger word): el efecto se aplica por la sola presencia del LoRA en el grafo.
- Integracion en flujos ComfyUI y en la plataforma RunningHub (ejecucion online y API).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingues: no disponibles (no aplica a nivel de texto; el prompt depende del text encoder del base).
- No dispone de modo "thinking", vision de entrada ni audio.

## Casos de uso

- Retrato fotorrealista para contenido editorial: cargar el LoRA en un grafo ComfyUI con `moss-image`, peso 0.8, Euler/30 pasos/CFG 2.5 y prompts descriptivos de iluminacion y optica para obtener imagenes con aspecto de fotografia.
- Prototipado de conceptos visuales en estudios de diseno: iterar variaciones de un mismo concepto manteniendo una estetica fotografica coherente entre imagenes gracias al adaptador fijo.
- Generacion de material para mockups y presentaciones: producir imagenes de producto o escena con acabado realista sin sesion fotografica, siempre que el uso comercial quede cubierto por la licencia del base (no confirmada).
- Pruebas de pipelines de generacion en RunningHub: usar la version online del modelo para validar prompts y parametros antes de desplegar el flujo en local.
- Comparativas de estilo dentro de un mismo base: alternar este LoRA con otros adaptadores de `moss-image` para medir el impacto del ajuste fotorealista con los mismos seeds y sampler.
- Educacion y experimentacion con LoRA: ejemplo practico de como un adaptador de 138 MiB modifica el sesgo estetico de un modelo de difusion sin reentrenar el base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no disponible para el adaptador aislado; depende enteramente del modelo base `moss-image`, cuyos requisitos no se documentan en esta ficha. El LoRA suma 138 MiB al grafo.
- GPU recomendadas: no disponibles. La model card menciona el uso de GPU de 48 GB en la plataforma RunningHub ("体验48G的超强力量"), lo que sugiere que el flujo completo del base puede requerir VRAM alta, pero no se confirma como requisito minimo.
- GPU de consumo: no confirmado. No hay datos para afirmar que quepa en RTX 4090 u otras tarjetas consumer.
- Despliegue: ComfyUI (formato nativo del ecosistema LoRA), plataforma RunningHub (online y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-pipi-moss-photorealistic01-lora | LoRA sobre `moss-image` | 138 MiB (adaptador) | no aplica | no disponible | Hugging Face, RunningHub |
| Alternativas de LoRA fotorealista para difusion | LoRA | variable | no aplica | variable | no disponible en la informacion proporcionada |
| Modelo base `moss-image` | Difusion text-to-image | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables documentados en la informacion proporcionada; la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: sin dataset, sin hiperparametros, sin evaluaciones; imposible auditar el entrenamiento.
- Licencia no declarada: la model card remite a la licencia del proyecto original o del base sin concretarla, lo que impide confirmar el uso comercial.
- Dependencia estricta del base `moss-image`: sin ese modelo el adaptador no es funcional; cualquier cambio en el base puede alterar el resultado.
- Riesgo de sobreajuste estetico: el peso recomendado (0.8) puede reducir la diversidad de composiciones o introducir un "look" repetitivo entre generaciones.
- Sesgos: no documentados; los modelos de difusion suelen heredar sesgos de representacion del dataset del base, no evaluados aqui.
- Alucinacion visual: posible en detalles finos (manos, texto en imagen, geometria) como en cualquier difusion; no hay evaluaciones que lo cuantifiquen.
- Idiomas y prompts: sin informacion sobre el text encoder del base; el rendimiento con prompts en castellano no esta verificado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- La model card incluye enlaces de invitacion y promociones de la plataforma; conviene tratarlos como material comercial, no como documentacion tecnica.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-pipi-moss-photorealistic01-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2117059367789985794
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1954484547733893121
- Demo online (internacional): https://www.runninghub.ai/zh-cn/post/2117033448628531201
- Demo online (China): https://www.runninghub.cn/post/2117031573169197057
- RunningHub API: https://www.runninghub.ai/call-api
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Herramienta de entrenamiento citada por el autor: https://zhaotutu.xyz
