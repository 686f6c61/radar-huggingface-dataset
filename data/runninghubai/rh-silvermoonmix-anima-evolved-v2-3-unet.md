# RunningHubAI/rh-silvermoonmix-anima-evolved-v2.3-unet

## Resumen

`rh-silvermoonmix-anima-evolved-v2.3-unet` es un fichero de pesos UNET publicado en Hugging Face por RunningHubAI en nombre del autor del modelo original, silvermoong. Se trata de un fine-tune del modelo Anima (desarrollado por CircleStone Labs) aplicando una estrategia de entrenamiento propia denominada "Evolved", orientada a lograr manos estables, un estilo artistico neutro compatible con etiquetas de artistas y la representacion de multiples personajes en una misma escena. El repositorio incluye unicamente los pesos del UNET, no un pipeline completo.

La model card etiqueta el modelo como `text-to-video` y con el tag `unet`, aunque la descripcion y las instrucciones de uso (metodo de muestreo Euler a, CFG 4-5, prefijo `@` para artistas, soporte en Forge Neo) corresponden al flujo tipico de generacion de imagenes por difusion. Existe por tanto una discrepancia entre el `pipeline_tag` declarado y las capacidades descritas por el autor. La relevancia actual del modelo radica en que forma parte del ecosistema Anima, con versiones documentadas en Civitai bajo la denominacion "SilvermoonMix-Anima-Evolved [2.9B/2B]" en formatos BF16 e INT8, y en su integracion directa con ComfyUI y la plataforma RunningHub.

El repositorio ocupa 4,2 GB y contiene un unico archivo de pesos, `silvermoonmixAnima_v23.safetensors`, de 3988 MiB. No se proporcionan datos sobre la arquitectura interna, el numero exacto de parametros del fichero publicado, el contexto, los idiomas ni la licencia concreta, mas alla de una remision a la licencia del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion (fine-tune de Anima); backbone exacto no disponible |
| Parametros totales | no disponible (la linea de Civitai referencia variantes de 2,9B y 2B; el fichero publicado no especifica cual) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de LLM) |
| Tipos de cuantizacion | BF16 (fichero publicado de 3988 MiB); existe version INT8 del mismo modelo en canales externos segun la busqueda web |
| Idiomas soportados | no disponible (las instrucciones de prompt se ofrecen en ingles y chino) |
| Licencia | no disponible en el repositorio; se remite a la licencia del proyecto original (Anima, CircleStone Labs) |
| Formato de pesos | safetensors (UNET) |

## Arquitectura y entrenamiento

El modelo es un UNET de difusion obtenido por fine-tuning sobre Anima. La model card indica explicitamente "Finetuned from: anima" y describe la estrategia de entrenamiento del autor como "Evolved", sin detallar la composicion del dataset, el numero de tokens ni las tecnicas de regularizacion o ajuste empleadas. No se documenta si hubo fases de refinamiento equivalentes a RLHF o DPO, lo cual es esperable dado que no se trata de un modelo de lenguaje sino de un modelo generativo de difusion.

Las innovaciones que el autor destaca no son arquitectonicas sino de comportamiento: manos estables, estilo artistico neutro que se combina con etiquetas de artistas cuando se antepone el prefijo `@`, y capacidad de representar varios personajes en una misma generacion. Las recomendaciones de uso incluyen muestreo Euler a, CFG entre 4 y 5, comenzar sin prompt negativo, y el soporte nativo en Forge Neo (rama `neo` de sd-webui-forge-classic). No se aportan datos sobre atencion lineal, decodificacion especulativa ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de contenido visual a partir de texto mediante difusion, con el flujo del ecosistema Anima (UNET + componentes asociados).
- Representacion estable de manos, uno de los puntos debiles habituales en modelos de difusion.
- Estilo artistico neutro disenado para combinarse con etiquetas de artistas, que deben ir precedidas obligatoriamente por `@` (por ejemplo, `@big chungus`); sin el prefijo el efecto es muy debil.
- Generacion de escenas con multiples personajes.
- Etiqueta declarada de `text-to-video`, por lo que en el repositorio se anuncia soporte de generacion de video a partir de texto, aunque la descripcion del autor describe un modelo de imagenes.
- Integracion con ComfyUI, RunningHub y Forge Neo mediante el fichero safetensors del UNET.
- Tool calling / function calling: no disponible (no aplica a este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Generacion de ilustracion artistica en pipelines de ComfyUI: cargando `silvermoonmixAnima_v23.safetensors` como UNET y combinando etiquetas de artistas con prefijo `@`, el modelo produce imagenes con un estilo neutro facilmente redirigible hacia la estetica del artista referenciado.
- Produccion de escenas con varios personajes: para ilustracion narrativa, comics o storyboards, el modelo esta afinado especificamente para mantener coherencia cuando aparecen multiples sujetos en el encuadre.
- Generacion de material grafico con manos visibles: retratos, ilustraciones de cuerpo completo o escenas donde las extremidades son protagonistas se benefician del ajuste especifico para manos estables.
- Automatizacion de generacion visual mediante la API de RunningHub: el modelo puede invocarse a traves de la plataforma para producir imagenes o clips en lotes, integrándose en flujos de produccion automatizados.
- Prototipado visual rapido en Forge Neo: gracias al soporte nativo de Anima en la rama `neo`, se puede iterar prompt y estilos con muestreo Euler a y CFG 4-5 sin prompt negativo inicial.
- Base para nuevos fine-tunes y LoRAs: al ser un derivado de Anima publicado como UNET safetensors, sirve como punto de partida para ajustes adicionales orientados a estilos concretos.
- Generacion de video a partir de texto (segun el pipeline declarado): si se confirma la capacidad de video, podria emplearse para generar clips cortos en flujos de previsualizacion o animatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el UNET: aproximadamente 4 GB en BF16 (fichero de 3988 MiB); alrededor de 2 GB en la version INT8 referenciada en canales externos. Hay que sumar el consumo del codificador de texto, el VAE y el resto del pipeline, por lo que la VRAM total recomendada es superior.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en entornos de servidor, A100 o H100 para despliegues por lotes.
- Cabe en GPU consumer: si, en tarjetas con al menos 8-12 GB de VRAM segun cuantizacion y resolucion de generacion.
- Opciones de despliegue: ComfyUI, Forge Neo (sd-webui-forge-classic rama `neo`) y la plataforma RunningHub. No procede el uso de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-silvermoonmix-anima-evolved-v2.3-unet | no disponible (variantes 2,9B/2B referenciadas) | no aplica | no disponible | no disponible; remite al proyecto original | Hugging Face (RunningHubAI) |
| Anima (CircleStone Labs) | no disponible | no aplica | no disponible | licencia propia de CircleStone Labs | no disponible |
| SilvermoonMix-Anima-Evolved (silvermoong) | 2,9B / 2B | no aplica | no disponible | derivada de Anima, con permisos comerciales bajo los terminos del modelo original | Hugging Face y Civitai |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Discrepancia de pipeline: el repositorio se etiqueta como `text-to-video`, mientras que la descripcion del autor corresponde a un modelo de generacion de imagenes. Conviene verificar la capacidad real antes de usarlo en produccion.
- El repositorio contiene unicamente el UNET; no incluye codificador de texto, VAE ni pipeline completo, por lo que no es utilizable de forma aislada.
- No se especifica la licencia en el repositorio. La model card remite a la licencia del proyecto original (Anima, CircleStone Labs), y los resultados de busqueda indican que los derechos de uso comercial derivan del modelo original. Es imprescindible revisar esos terminos antes de un uso comercial.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero si existe el riesgo tipico de los modelos de difusion de generar artefactos o contenido no solicitado.
- La instruccion de anteponer `@` a las etiquetas de artistas es obligatoria segun el autor; omitirla reduce drasticamente el efecto del estilo.
- No se documentan idiomas soportados ni comportamiento multilingue en los prompts.
- No hay informacion sobre el numero exacto de parametros del fichero publicado ni sobre la variante (2,9B o 2B) a la que corresponde.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria en ese repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-silvermoonmix-anima-evolved-v2.3-unet
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2093194766427545601
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2007154923476885506
- README en chino del repositorio: README_cn.md (mismo repositorio)
- Anima (modelo base, referencia del autor): https://civitai.red/models/2458426/anima
- Forge Neo: https://github.com/Haoming02/sd-webui-forge-classic/tree/neo
- RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- SilvermoonMix-Anima-Evolved en Civitai: https://civitai.com/models/2639339/silvermoonmix-anima-evolved-29b2b
- SilvermoonMix-Anima-Evolved en Hugging Face (autor original): https://huggingface.co/silvermoong/SilvermoonMix-Anima-Evolved
- SilvermoonMix-Anima-Evolved en Tensor.Art: https://tensor.art/models/1042867573193972107
- SilvermoonMix-Anima-Evolved v2.3 en TensorHub Art: https://tensorhub.art/models/1031486460689168299/SilvermoonMix-Anima-Evolved-v2.3
