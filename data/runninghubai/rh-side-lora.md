# RunningHubAI/rh-side-lora

## Resumen

rh-side-lora es un adaptador de tipo LoRA (Low-Rank Adaptation) distribuido por RunningHubAI en Hugging Face. No es un modelo autonomo: se trata de un ajuste fino de bajo rango pensado para cargarse sobre el experto de alto ruido (HighNoise) del modelo de generacion de video WAN2.2, tal y como indica la model card ("Finetuned from: WAN2.2 (HighNoise)"). Su proposito es anadir un comportamiento concreto de generacion de video a partir de imagen (I2V, image-to-video) sin necesidad de reentrenar la base completa.

El repositorio ocupa 0,3 GB e incluye un unico archivo de pesos, iGoon_Blink_Cowgirl_Side_View_I2V_HIGH.safetensors, de 293 MiB. Esta etiquetado para su uso en ComfyUI, RunningHub y Hugging Face, y el nombre del archivo sugiere un LoRA orientado a generacion I2V con una vista lateral y un movimiento concreto. Es relevante porque ejemplifica el ecosistema de adaptadores ligeros que se estan desplegando sobre modelos de difusion de video abiertos para personalizar estilos, movimientos y encuadres sin coste de reentrenamiento.

La informacion publicada es muy escasa: no se documentan parametros totales, contexto, idiomas, licencia especifica ni datos de entrenamiento. El modelo acumula 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad. La fecha de creacion registrada (2026-09-24) resulta anomala respecto al resto de metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de bajo rango sobre un modelo de difusion de video (base: WAN2.2, experto HighNoise). Rango y alpha: no disponible |
| Parametros totales | No disponible (pesos del LoRA: 293 MiB) |
| Parametros activos | No aplica (adaptador; no es un modelo MoE en si, hereda la arquitectura de la base) |
| Longitud de contexto | No aplica (modelo de generacion de video, no de texto). Numero de frames o duracion: no disponible |
| Tipos de cuantizacion | No disponible. Se distribuye en safetensors; no se especifica el tipo numerico del adaptador |
| Idiomas soportados | No disponible (el idioma de los prompts depende de la base y del pipeline, no del LoRA) |
| Licencia | No disponible en el repositorio. La model card remite a la licencia del proyecto original o de la base (WAN2.2) |
| Formato de pesos | safetensors (.safetensors) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una tecnica de ajuste fino eficiente en parametros que congela los pesos del modelo base e introduce matrices de bajo rango entrenables en determinadas capas. En este caso el ajuste se aplica sobre el experto HighNoise de WAN2.2, un modelo de generacion de video. El tamano del archivo (293 MiB) es coherente con un adaptador de rango bajo y no con un modelo completo. No se publica informacion sobre el rango, el alpha, las capas objetivo ni la estrategia de entrenamiento.

No hay datos sobre el conjunto de entrenamiento: se desconoce el numero de tokens o clips, la composicion del dataset, el numero de pasos, la resolucion de entrenamiento ni si se emplearon tecnicas de alineacion como RLHF o DPO (poco habituales en adaptadores de difusion de video). La unica pista tecnica es el nombre del archivo, que apunta a un comportamiento I2V con "vista lateral" (side view) y un movimiento concreto, ademas de estar asociado al experto HighNoise, lo que condiciona su uso a esa etapa del pipeline de muestreo.

## Capacidades

- Generacion de video a partir de imagen (I2V) cuando se combina con la base WAN2.2 HighNoise en un pipeline compatible (ComfyUI / RunningHub).
- Aplicacion de un comportamiento especifico de movimiento y encuadre (vista lateral) sobre la generacion de la base.
- Integracion como capa adicional en flujos de trabajo de difusion de video, sin modificar los pesos de la base.
- No dispone de generacion de texto ni de razonamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues propias.
- No se documentan capacidades de vision, audio ni modo de pensamiento (thinking mode); opera exclusivamente en el dominio de generacion de video.

## Casos de uso

- Generacion I2V en ComfyUI: el adaptador se carga sobre WAN2.2 HighNoise para producir un clip a partir de una imagen fija, aplicando el encuadre lateral caracteristico de este LoRA. Es adecuado cuando se trabaja dentro del ecosistema de nodos de ComfyUI ya soportado.
- Produccion por lotes mediante la API de RunningHub: al estar publicado por RunningHub, el LoRA puede invocarse desde su API (call-api) para generar clips de forma automatizada, sin gestionar la infraestructura de GPU local.
- Prototipado de animaciones y storyboards: util para previsualizar rapidamente el movimiento de una escena a partir de un fotograma clave antes de invertir en renderizado de mayor calidad.
- Control de camara y encuadre: al estar orientado a una vista lateral concreta, sirve para forzar un angulo de camara especifico dentro de una secuencia generada.
- Investigacion sobre adaptacion eficiente: permite estudiar como un LoRA de 293 MiB altera el comportamiento de un modelo de difusion de video grande sin reentrenar la base.
- Encadenamiento con otros adaptadores: puede combinarse o fusionarse con otros LoRA de WAN2.2 para construir un estilo compuesto, siempre que se respeten los pesos del experto HighNoise.
- Experimentacion de bajo coste: el tamano reducido del archivo facilita su versionado, distribucion y pruebas en pipelines ligeros comparado con la base completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA en si ocupa 293 MiB, pero su uso requiere cargar la base WAN2.2 HighNoise en memoria; el requisito real de VRAM lo determina la base, no el adaptador.
- VRAM estimada para la inferencia: no disponible en la informacion proporcionada. Depende de la cuantizacion y de la resolucion y duracion del video generado, ademas de los requisitos propios de WAN2.2 HighNoise.
- GPU recomendadas: no disponible. La idoneidad depende de la base WAN2.2 (perfil de GPU de gama alta tipo A100/H100 para precision completa, o GPUs de consumo con cuantizacion).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; condicionada por la base.
- Opciones de despliegue: ComfyUI, plataforma RunningHub y Hugging Face (segun las plataformas declaradas). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos especificos de otros adaptadores LoRA de WAN2.2 en la informacion proporcionada. A continuacion se comparan aspectos estructurales conocidos, marcando como "no disponible" todo aquello que no puede verificarse.

| Aspecto | rh-side-lora | Base WAN2.2 (HighNoise) | Otros LoRA de WAN2.2 |
|---|---|---|---|
| Tipo | Adaptador LoRA | Modelo de difusion de video | Adaptador LoRA |
| Parametros | No disponible (293 MiB de pesos) | No disponible en la informacion aportada | No disponible |
| Contexto / frames | No disponible | No disponible | No disponible |
| Rendimiento | No disponible | No disponible | No disponible |
| Licencia | No disponible (remite a la base) | No disponible en la informacion aportada | No disponible |
| Disponibilidad | Hugging Face, ComfyUI, RunningHub | Segun su proyecto original | Variable segun autor |

## Limitaciones y advertencias

- La licencia no esta especificada en el repositorio; la model card remite a la licencia del proyecto original o de la base. El uso comercial es incierto y debe verificarse con la licencia de WAN2.2 y con RunningHub.
- No se documentan sesgos. Al ser un modelo de generacion visual, puede reproducir sesgos presentes en los datos de la base y del ajuste.
- Riesgo de alucinacion visual y de artefactos propios de la difusion de video: inconsistencias temporales, deformaciones y perdida de coherencia entre frames.
- El nombre del archivo (iGoon_Blink_Cowgirl_Side_View_I2V_HIGH) sugiere contenido de caracter potencialmente adulto o explicito; conviene revisar las politicas de contenido y las condiciones de uso antes de desplegarlo.
- Compatibilidad restringida al experto HighNoise de WAN2.2; no es un LoRA generico y puede no funcionar correctamente con otros expertos o bases.
- Ausencia total de documentacion tecnica: no hay rango, alpha, capas objetivo, datos de entrenamiento ni guia de uso.
- Sin validacion de la comunidad: 0 descargas y 0 likes, lo que implica ausencia de pruebas independientes.
- La fecha de creacion registrada (2026-09-24) es posterior a la fecha de consulta esperada, lo que sugiere metadatos inconsistentes que conviene no tomar como fiables.
- El idioma de los prompts depende de la base y del pipeline; no hay soporte multilingue documentado propio del LoRA.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-side-lora
- README en chino (referenciado en la model card): README_cn.md (en el propio repositorio)
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2079420883420332033
- Pagina del autor: https://www.runninghub.ai/user-center/1986078446017196033
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Paper, blog o repositorio adicionales: no disponible
