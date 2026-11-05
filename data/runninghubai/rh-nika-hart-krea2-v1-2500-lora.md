# RunningHubAI/rh-nika-hart-krea2-v1-2500-lora

## Resumen

`rh-nika-hart-krea2-v1-2500-lora` es un adaptador LoRA de edicion de imagen publicado por RunningHubAI, la plataforma de alojamiento e inferencia de modelos de difusion de RunningHub. No se trata de un modelo base autonomo, sino de un conjunto de pesos de bajo rango (218 MiB, rango 32, proyecciones lineales) que se aplica sobre el checkpoint Krea2 RAW para inyectar un concepto concreto: el personaje ficticio "Nika Hart". El disparador de activacion es la cadena `nika_hart`.

El adaptador esta pensado para su uso dentro de ComfyUI, el grafo de nodos de difusion mas extendido, y tambien puede ejecutarse en la infraestructura cloud de RunningHub o descargarse desde Hugging Face. Su pipeline declarado es `image-text-to-image`, es decir, edicion de imagen guiada por texto: se parte de una imagen de entrada y una instruccion textual, y la LoRA modula la generacion para que el resultado mantenga la identidad del personaje.

La relevancia de esta ficha es acotada y conviene ser explicitos: se trata de un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card tecnica detallada, sin licencia declarada y sin resultados de evaluacion. Resulta util como ejemplo del ecosistema de LoRAs de personaje que se distribuyen via plataformas comerciales de inferencia, pero no constituye una pieza sobre la que construir productos sin verificar antes los terminos de uso y la calidad del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion de imagen; el modelo base declarado es Krea2 RAW |
| Parametros totales | no disponible (pesos del adaptador: 218 MiB, rango 32, proyecciones lineales) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; el unico fichero publicado es `safetensors` en precision nativa |
| Idiomas soportados | no disponible (los prompts se procesan mediante el codificador de texto del modelo base) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del modelo base |
| Formato de pesos | safetensors (`nika_hart_krea2raw_r32_linear_v1_000002500.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es una LoRA de rango 32 con proyecciones lineales, entrenada sobre el checkpoint Krea2 RAW. El nombre del fichero (`..._v1_000002500`) sugiere un checkpoint intermedio o final en el paso 2500 de un entrenamiento cuyo numero total de pasos, dataset, tasa de aprendizaje y configuracion de optimizacion no se documentan en la model card. No hay informacion sobre el numero de imagenes de entrenamiento, la resolucion de las mismas, el uso de regularizacion o captions automaticos, ni sobre si se aplicaron tecnicas como LoRA con ruido balanceado o ajuste de text encoder.

La unica innovacion tecnica reseñable no esta en el adaptador en si, sino en el flujo de trabajo que propone el autor: entrenamiento y despliegue dentro de RunningHub, con posibilidad de cargar los pesos en ComfyUI o en la API del servicio. El disparador `nika_hart` debe incluirse en el prompt para activar el concepto; sin el, la LoRA probablemente tenga un efecto residual minimo o nulo sobre la generacion.

## Capacidades

- Edicion de imagen guiada por texto sobre el modelo base Krea2 RAW, con un pipeline declarado `image-text-to-image`.
- Inyeccion de identidad de personaje mediante el disparador `nika_hart`, orientada a mantener consistencia visual entre generaciones.
- Compatibilidad con ComfyUI como formato de consumo principal, lo que permite encadenarla con nodos de ControlNet, upscalers, samplers y pipelines de img2img.
- Ejecucion remota a traves de la API de RunningHub, sin necesidad de hardware local.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generacion de texto: es exclusivamente un adaptador de difusion de imagen.
- No se documentan capacidades multilingues propias; dependen del codificador de texto del modelo base.
- No se documentan modos especiales como thinking, vision o audio.

## Casos de uso

- Prototipado de personajes consistentes en ComfyUI: cargar la LoRA junto al checkpoint Krea2 RAW y usar `nika_hart` en el prompt para generar variaciones de una misma identidad visual en distintas poses, vestuarios e iluminaciones.
- Pruebas de checkpoints y comparativas de calidad: la model card indica explicitamente que el adaptador se creo "para probar checkpoints", por lo que encaja en flujos de evaluacion interna de modelos base de difusion.
- Edicion de imagen existente en pipelines img2img: partir de una fotografia o render y aplicar la LoRA para transferir el rostro o el estilo del personaje, util en previsualizacion de storyboards.
- Generacion de material para narrativa visual o comic: producir paneles coherentes de un mismo personaje a lo largo de una secuencia, reduciendo el drift de identidad entre viñetas.
- Integracion en servicios cloud mediante la API de RunningHub: desplegar el adaptador como endpoint para aplicaciones que necesiten generar imagenes del personaje sin gestionar GPU propia.
- Experimentacion academica sobre LoRAs de personaje: usar el adaptador como caso de estudio de rango 32 frente a rangos menores o mayores, midiendo fidelidad de identidad y sobreajuste al estilo del dataset.
- Maquetas y pruebas de concepto para estudios de videojuegos: generar arte conceptual rapido de un personaje antes de encargar modelado 3D, siempre que la licencia del modelo base lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud facial, LPIPS) ni comparaciones cuantitativas con otras LoRAs de personaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica. El adaptador pesa 218 MiB en `safetensors`, pero la VRAM real la determina el modelo base Krea2 RAW y la resolucion de generacion, no la LoRA.
- GPU recomendadas: no disponibles en la informacion proporcionada. Para modelos de difusion de imagen de gran tamano, el rango habitual es RTX 3090/4090 (24 GB) en consumo y A100/H100 (40-80 GB) en servidor, pero el autor no confirma requisitos.
- Compatibilidad con GPU de consumo: probable en tarjetas con suficiente VRAM para el modelo base, aunque no se especifica el minimo.
- Opciones de despliegue: ComfyUI (flujo principal declarado), plataforma cloud de RunningHub y su API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-nika-hart-krea2-v1-2500-lora | LoRA de personaje sobre Krea2 RAW | 218 MiB, rango 32 | no aplica | no disponible | Hugging Face, RunningHub |
| Otras LoRAs de personaje en Civitai / Hugging Face | LoRA de personaje sobre SDXL, SD 1.5, Flux | variable (tipicamente 20-300 MiB) | no aplica | variable, a menudo restrictiva | amplia |
| Modelos base de difusion (SDXL, Flux, Krea2) | Modelo completo texto-a-imagen | miles de millones de parametros | no aplica | variable | amplia |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas concretas. La comparativa anterior es estructural, no de calidad.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: la model card remite a "la licencia del proyecto original o del modelo base", lo que deja el uso comercial en una zona juridica ambigua. Verificar los terminos de Krea2 RAW y de RunningHub antes de cualquier despliegue productivo.
- Modelo de nicho sin validacion externa: cero descargas y cero likes en el momento de la consulta, sin evaluaciones de terceros ni demos publicas independientes.
- Riesgo de sobreajuste al dataset del personaje: al ser una LoRA de identidad con rango 32, puede reproducir poses, encuadres o estilos del conjunto de entrenamiento y degradar la diversidad de las generaciones.
- Dependencia estricta del disparador `nika_hart`: sin esa cadena en el prompt, el efecto del adaptador puede ser impredecible o inexistente.
- Alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, texto ilegible en la imagen y artefactos en manos, ojos o accesorios, especialmente en resoluciones altas o composiciones complejas.
- Sesgos inhererentes al dataset de entrenamiento y al modelo base, no documentados por el autor.
- Sin informacion sobre el codificador de texto ni sobre el soporte multilingue de los prompts.
- La fecha de creacion indicada (2026-11-05) es posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio antes de descargar pesos.
- No apta para tareas de texto, razonamiento, codigo o agentes: cualquier uso fuera de la generacion o edicion de imagen queda fuera de su alcance.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-nika-hart-krea2-v1-2500-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2116179116756475905
- Pagina del autor: https://www.runninghub.ai/user-center/2106245571941007362
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
