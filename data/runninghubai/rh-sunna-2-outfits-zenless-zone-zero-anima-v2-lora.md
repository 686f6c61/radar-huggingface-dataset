# RunningHubAI/rh-sunna-2-outfits-zenless-zone-zero-anima-v2-lora

## Resumen

rh-sunna-2-outfits-zenless-zone-zero-anima-v2-lora es un adaptador LoRA de personaje publicado por RunningHubAI (autor acreditado en la model card como RunningHub-@nullnull) para generar a Sunna, personaje de la franquicia Zenless Zone Zero, con dos vestuarios canonicos: el look base y el conjunto "Afternoon Tea Break". No es un modelo de lenguaje ni un modelo fundacional: es un fichero de pesos de 88 MiB que se carga sobre un checkpoint de difusion externo y modifica su comportamiento para reproducir la identidad del personaje.

El punto tecnico diferencial de la version v2.0 Anima es la separacion de disparadores: un unico token de identidad (`sunnazzz`) concentra cara, pelo y alas, y un segundo token (`baseout` o `theaout`) selecciona el vestuario, de modo que la ropa permanece "steerable" mediante descripciones textuales adicionales. Existen ademas tres variantes en el mismo repositorio: v1.0 Anima, v1.0 Illustrious (para SDXL / Illustrious / Pony / NoobAI) y un remapeo sobre la disposicion de 40 capas de Anima-2.9B.

Su relevancia es practica: permite producir ilustraciones consistentes de un personaje concreto con control de vestuario en flujos ComfyUI o mediante la API de RunningHub, sin entrenar un modelo propio. El repositorio no documenta pipeline, licencia, idiomas ni resultados de evaluacion, y presenta un desajuste entre el nombre del modelo (v2) y el fichero publicado (`sunna_anima_v1_1.safetensors`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelos de difusion; versiones para Anima / Qwen-Image DiT y para SDXL / Illustrious / Pony / NoobAI |
| Parametros totales | No aplicable como modelo completo: adaptador de 88 MiB. El rango LoRA y el numero de parametros entrenados no se especifican |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de generacion de imagen) |
| Tipos de cuantizacion | No disponible; el unico peso publicado es un fichero safetensors de 88 MiB |
| Idiomas soportados | No disponible; los prompts de ejemplo de la model card estan redactados en ingles |
| Licencia | No disponible; la model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del modelo base |
| Formato de pesos | safetensors (`sunna_anima_v1_1.safetensors`, 88 MiB) |

## Arquitectura y entrenamiento

Se trata de un LoRA de personaje, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atencion y proyeccion de un modelo de difusion preentrenado. La model card declara "finetuned from: anima" y distingue cuatro artefactos segun el modelo base: v2.0 Anima y v1.0 Anima para checkpoints Anima / Qwen-Image DiT, v1.0 Illustrious para SDXL / Illustrious / Pony / NoobAI, y un "Remapped Anima 2.9B" que reutiliza los mismos pesos reasignados a la disposicion de 40 capas de Anima-2.9B. No se documenta el numero de imagenes de entrenamiento, la composicion del dataset, la resolucion de entrenamiento, el rango LoRA ni si hubo etapas de ajuste adicionales.

La innovacion declarada es de esquema de condicionamiento, no de arquitectura: la v2.0 Anima separa el token de identidad (`sunnazzz`) del token de vestuario (`baseout` / `theaout`), frente al esquema de la v1.0, que empleaba una sola palabra por conjunto (`sunnabasezzz`, `sunnateazzz`). El peso recomendado es 1.0 con rango util 0.85-1.0 en las versiones Anima e Illustrious, y 0.5-0.7 en el remapeo a 2.9B, que el propio autor advierte que es una reasignacion y no un reentrenamiento, por lo que puede presentar problemas.

## Capacidades

- Generacion de imagenes de un personaje concreto (Sunna) a partir de prompts de texto, en dos vestuarios canonicos.
- Condicionamiento por disparadores: `sunnazzz` para identidad y `baseout` / `theaout` para vestuario en la v2.0 Anima.
- Control de vestuario "steerable": las prendas siguen respondiendo a descripciones textuales explicitas, como demuestran los prompts de ejemplo de la model card.
- Compatibilidad multiplataforma: ComfyUI, RunningHub y Hugging Face; la v1.0 Anima funciona ademas en el generador alojado de Civitai.
- Compatibilidad con varias familias de checkpoints base segun version (Anima / Qwen-Image DiT e SDXL / Illustrious / Pony / NoobAI).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision por computador, tool calling ni agentes multi-paso; son capacidades no aplicables a este tipo de artefacto.

## Casos de uso

- Ilustracion de personaje consistente en ComfyUI: cargando el LoRA sobre el checkpoint Anima correspondiente y usando `sunnazzz` mas el token de vestuario, se obtiene la misma identidad en una serie de imagenes con encuadres y poses distintos, util para series de ilustracion con continuidad visual.
- Produccion de paneles de manga o doujinshi: al alternar `baseout` y `theaout` dentro de un mismo grafo de trabajo se puede representar una escena con cambio de vestuario sin reentrenar ni cambiar de adaptador.
- Storyboards y previsualizacion de escenas: el adaptador permite fijar el diseno del personaje antes de producir arte final, reduciendo iteraciones sobre el disenador humano.
- Assets para mods o proyectos de fan game: generacion de retratos, iconos y variaciones de vestuario en lote, siempre que se respete la situacion legal del personaje (ver limitaciones).
- Prototipado de merchandising: pruebas de concepto de laminas, pegatinas o camisetas con el personaje en ambos atuendos antes de encargar produccion.
- Generacion por API en RunningHub: el repositorio se distribuye junto a la API de la plataforma, lo que permite ejecutar el LoRA en pipelines automatizados por lotes sin infraestructura propia.
- Estudio de "steerability" textil: comparar como responde el mismo LoRA cuando se describe la ropa con distintos niveles de detalle, util para investigar como se comporta el condicionamiento por texto frente al token de vestuario.
- Avatares y contenido para redes: generacion de imagenes de perfil o ilustraciones promocionales de un personaje con dos atuendos documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas objetivas (FID, CLIP score, similitud de identidad), comparativas cuantitativas ni evaluaciones de fidelidad al personaje. Tampoco se documentan tiempos de inferencia, pasos de muestreo recomendados, CFG ni resoluciones de trabajo.

## Requisitos de hardware

- El adaptador en si ocupa 88 MiB en disco (tamano total del repositorio: 0,1 GB), por lo que su coste marginal de VRAM durante la inferencia es minimo en comparacion con el checkpoint base.
- La VRAM necesaria la determina integramente el modelo base, que no se especifica en la informacion disponible: no es posible dar cifras fiables de VRAM para Anima / Qwen-Image DiT ni para SDXL / Illustrious / Pony / NoobAI a partir de estos datos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible a nivel de cifras; dependera del checkpoint base seleccionado y de la resolucion de generacion.
- Opciones de despliegue documentadas: ComfyUI, plataforma y API de RunningHub, Hugging Face y, para la v1.0 Anima, el generador alojado de Civitai. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos en la informacion proporcionada sobre otros LoRA de personaje comparables, ni cifras de parametros, contexto, rendimiento o licencia de alternativas. La model card tampoco ofrece comparaciones con adaptadores de la competencia. Como referencia interna, el propio repositorio documenta cuatro variantes entre las que si se puede comparar esquema de disparadores y peso:

| Version | Modelo base | Disparadores | Peso recomendado |
|---|---|---|---|
| v2.0 Anima | Anima / Qwen-Image DiT | `sunnazzz` + `baseout` / `theaout` | 1.0 (rango 0.85-1.0) |
| v1.0 Anima | Anima / Qwen-Image DiT | `sunnabasezzz`, `sunnateazzz` | 1.0 (rango 0.85-1.0) |
| v1.0 Illustrious | SDXL / Illustrious / Pony / NoobAI | `sunnabasezzz`, `sunnateazzz` | 1.0 (rango 0.85-1.0) |
| Remapped Anima 2.9B | Anima-2.9B (40 capas) | No especificado; es un remapeo del LoRA | 0.5-0.7 |

## Limitaciones y advertencias

- Alcance funcional muy acotado: solo genera representaciones de un personaje concreto; no sirve para tareas generales de generacion, texto o razonamiento.
- Licencia no disponible: la model card remite a la licencia del proyecto original o del modelo base, lo que deja el uso comercial en un terreno ambiguo. Antes de un uso en produccion hay que verificar la licencia de Anima / Qwen-Image DiT o del checkpoint SDXL utilizado.
- Propiedad intelectual de terceros: el personaje pertenece a la franquicia Zenless Zone Zero y la model card no aclara titularidad ni autorizacion de uso. Es un riesgo relevante para cualquier explotacion comercial del resultado.
- Desajuste entre nombre y fichero: el modelo se publica como "v2-lora", pero la tabla de ficheros lista `sunna_anima_v1_1.safetensors`. Conviene verificar que la version descargada es la deseada antes de integrarla en un flujo de trabajo.
- El remapeo a Anima 2.9B es una reasignacion, no un reentrenamiento: el propio autor advierte de posibles problemas y de que podria reentrenarlo de forma nativa si hay interes.
- Riesgo de sobreajuste al prompt: el control de la ropa depende de palabras concretas ("white shirt, red necktie, puffy short sleeves", etc.); prompts alejados de ese vocabulario pueden degradar la fidelidad del vestuario.
- Sin datos de entrenamiento ni de evaluacion: no hay informacion sobre composicion del dataset, resolucion, sesgos aprendidos ni metricas de fidelidad, lo que impide estimar su comportamiento fuera de los ejemplos publicados.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de los datos facilitados, sin comunidad que haya reportado problemas ni soluciones.
- Fechas de creacion y actualizacion (24 de septiembre de 2026) separadas por un minuto, sin historial de versiones mas alla del contenido de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-sunna-2-outfits-zenless-zone-zero-anima-v2-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2099429780714577921
- Pagina del autor: https://www.runninghub.ai/user-center/2007154923476885506
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- API de Seedance 2.5 en RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Discord: https://discord.gg/TYHy7fpEXx
- Ko-fi: https://ko-fi.com/techannel
- Comisiones: https://ko-fi.com/techannel/commissions
