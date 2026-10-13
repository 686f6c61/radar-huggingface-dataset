# Ballsworthy/Flux-Uncensored-V2

## Resumen

Flux-Uncensored-V2 es un adaptador LoRA de bajo rango publicado por el usuario Ballsworthy (identificado en la model card como el equipo de EnhanceAI) que se acopla al modelo base `black-forest-labs/FLUX.1-dev` para eliminar sus restricciones de contenido y habilitar la generacion de imagenes explicitas. No es un modelo de difusion completo: es un fichero `lora.safetensors` que debe cargarse sobre el pipeline de FLUX.1-dev mediante `diffusers` o herramientas equivalentes.

La propuesta de valor es acotada y muy especifica: la version 2 reduce el tamano de los pesos del adaptador, corrige problemas de estabilidad de la v1 y acelera la generacion. El repositorio ocupa 0,7 GB e incluye material auxiliar (banner), de modo que el peso real del LoRA es una fraccion de esa cifra. La model card documenta una lista de palabras gatillo (`nsfw`, `naked`, `nude`, `erotic`, `sensual`, `explicit`, entre otras) que orientan la generacion hacia contenido explicito.

Es relevante ahora por dos motivos opuestos. Para creadores, es un ejemplo de adaptacion de FLUX.1-dev a un nicho vetado por el modelo base. Para equipos de seguridad y moderacion, es un caso de estudio barato de *jailbreak* de un modelo de difusion de 12 000 millones de parametros: demuestra que un LoRA de pocos cientos de megabytes basta para desactivar las mitigaciones de contenido. El repositorio no declara idiomas soportados, no publica benchmarks y presenta una contradiccion de licencia entre la metadata de HuggingFace y la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el transformer de difusion de FLUX.1-dev (rectified flow, bloques MMDiT de doble y simple flujo) |
| Parametros totales | No disponible para el LoRA; el modelo base FLUX.1-dev declara 12 000 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion); segun la documentacion publica de FLUX.1-dev, el condicionamiento de texto admite 512 tokens en el codificador T5-XXL y 77 en CLIP |
| Tipos de cuantizacion | La model card solo menciona `torch.bfloat16`; no se publican variantes cuantizadas del LoRA |
| Idiomas soportados | No disponible |
| Licencia | Contradictoria: la metadata de HuggingFace indica `creativeml-openrail-m`; la model card indica FLUX-1-dev Non-Commercial License |
| Formato de pesos | `safetensors` (`lora.safetensors`) |
| Tamano del repositorio | 0,7 GB (incluye pesos del LoRA y material auxiliar) |
| Modelo base | `black-forest-labs/FLUX.1-dev` |
| Etiqueta de pipeline | `image-to-image` en HuggingFace; los ejemplos de la model card son `text-to-image` |
| Trigger words | `nsfw`, `naked`, `pron`, `kissing`, `erotic`, `nude`, `sensual`, `adult content`, `explicit` |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, es decir, un par de matrices de bajo rango inyectadas en las capas del transformer de difusion de FLUX.1-dev. FLUX.1-dev es un modelo de flujo rectificado (*rectified flow*) de 12 000 millones de parametros con una arquitectura MMDiT que combina bloques de doble flujo (atencion conjunta de texto e imagen) y bloques de flujo simple, complementada con codificadores de texto CLIP y T5-XXL. El LoRA no modifica esa topologia: ajusta los pesos preentrenados para sesgar la distribucion de salida hacia contenido explicito.

La model card no documenta el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni si hubo etapas de ajuste fino supervisado o preferencias. Solo se declaran tres cambios respecto a la v1: mejor rendimiento (generacion mas rapida), correcciones de estabilidad y pesos mas ligeros. No hay informacion sobre resolucion de entrenamiento, composicion del dataset ni metodologia de evaluacion. Todas esas casillas quedan como no disponibles.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) heredada del pipeline de FLUX.1-dev, con el sesgo del adaptador hacia contenido NSFW.
- Edicion de imagenes existentes (image-to-image) segun la etiqueta de pipeline declarada en HuggingFace.
- Generacion de contenido explicito: la funcion declarada del LoRA es precisamente eliminar las restricciones de contenido del modelo base.
- Control mediante palabras gatillo (`nsfw`, `nude`, `erotic`, `explicit`, etc.) que activan la generacion explicita.
- Carga como adaptador desacoplable: `pipeline.load_lora_weights(...)` en `diffusers`, con posibilidad de ajustar el peso del adaptador.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusion, no un modelo de lenguaje.
- No se declaran capacidades multilingues ni idiomas soportados.

## Casos de uso

- Red-teaming de seguridad en modelos generativos: cargar el LoRA sobre FLUX.1-dev en un entorno aislado para cuantificar cuanto contenido prohibido puede generar un adaptador de bajo coste, y usar esos resultados para disenar mitigaciones en clasificadores de entrada y salida.
- Generacion de datasets etiquetados para moderacion: producir imagenes explicitas sinteticas con prompts controlados para entrenar y validar clasificadores NSFW, evitando el uso de material real de personas.
- Estudio de la mecanica interna de LoRA: analisis de ablacion sobre el rango y el peso del adaptador para medir como un numero reducido de parametros desplaza la distribucion del modelo base hacia un dominio concreto.
- Ilustracion de figura humana para arte digital: desnudo artistico y estudio anatomico con personas adultas, siempre que se cumplan las normas de la plataforma de destino y la legislacion aplicable.
- Produccion de contenido editorial para adultos: generacion de material para plataformas con verificacion de edad y cumplimiento legal, aprovechando la calidad del modelo base y la velocidad de la v2.
- Comparativas A/B de checkpoints en pipelines de difusion: medir el impacto de un adaptador concreto sobre la fidelidad al prompt y la coherencia anatomica respecto a FLUX.1-dev sin LoRA.
- Investigacion sobre filtrado de contenido en modelos abiertos: documentar que tipos de prompt sortean las mitigaciones de un modelo base y a que coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, HPSv2, ImageReward), ni comparaciones cuantitativas con la v1 o con el modelo base. Las unicas afirmaciones de rendimiento son cualitativas: "mejor rendimiento", "generacion mas rapida" y "pesos mas ligeros", sin cifras que las respalden.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano conocido del modelo base FLUX.1-dev (12 000 millones de parametros) y no de mediciones publicadas para este LoRA. El propio adaptador anade un consumo marginal (menos de 1 GB en bf16).

- Inferencia en bf16: aproximadamente 24 GB solo para pesos, con 28-33 GB recomendados contando activaciones y overhead. Requiere A100 40/80 GB, H100 o varias GPU.
- Inferencia en fp8: en torno a 12-13 GB de VRAM. Cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen.
- Cuantizacion a 4 bits (por ejemplo SVDQuant/Nunchaku sobre el modelo base): aproximadamente 8 GB, lo que lo situa al alcance de RTX 4070 Ti Super (16 GB) y tarjetas de 12 GB con resoluciones reducidas.
- GPU consumer: si cabe en RTX 4090, RTX 3090 y, con cuantizacion agresiva, en RTX 4080/4070 Ti. En tarjetas de 8 GB la generacion a 1024x1024 no es viable sin offloading a RAM, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: `diffusers` con `AutoPipelineForText2Image` y `load_lora_weights`, ComfyUI, SwarmUI y otras interfaces que soporten FLUX.1-dev y carga de LoRA. `llama.cpp` y `Ollama` no aplican: no es un modelo de lenguaje.
- Latencia y throughput: no se publican mediciones. Como referencia del modelo base, una generacion tipica de 20-30 pasos a 1024x1024 en una RTX 4090 se situa en el orden de decenas de segundos por imagen; el LoRA no deberia alterar ese orden de magnitud de forma significativa.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flux-Uncensored-V2 | LoRA sobre FLUX.1-dev | No disponible (base: 12 000 M) | No disponible; base a 1024x1024 | Contradictoria (`creativeml-openrail-m` vs. no comercial de FLUX.1-dev) | HuggingFace, repo de 0,7 GB |
| FLUX.1-dev (base) | Transformer de difusion | 12 000 M | 512 tokens T5 + 77 CLIP; 1024x1024 | FLUX-1-dev Non-Commercial License | HuggingFace, pesos completos |
| FLUX.1-schnell | Transformer de difusion destilado | 12 000 M | Igual que dev; 1024x1024 | Apache 2.0 (uso comercial permitido) | HuggingFace |
| LoRA NSFW sobre SDXL (familia tipo Pony, por ejemplo) | LoRA o checkpoint sobre SDXL | Base: 2600 M | 77 tokens CLIP; 1024x1024 | Variables, habitualmente permisivas | HuggingFace, Civitai |

La ventaja del LoRA sobre FLUX.1-dev es la calidad de imagen del modelo base, superior a la de SDXL, a costa de un coste de VRAM muy superior (24 GB frente a 8-12 GB). La principal desventaja frente a FLUX.1-schnell es la licencia: `schnell` es Apache 2.0, mientras que `dev` y cualquier adaptador derivado de el quedan bajo terminos no comerciales. No se dispone de datos de rendimiento comparado con la competencia.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta disenado para generar material explicito. Requiere verificacion de edad, cumplimiento de la legislacion local (Espana: Codigo Penal y normativa sobre comunicacion audiovisual) y de las condiciones de servicio de cualquier plataforma donde se publique.
- Riesgo grave en la model card: uno de los ejemplos de widget del repositorio describe un escenario sexual con menores de edad. Ese tipo de contenido es material de abuso sexual infantil y es delito en Espana y en la practica totalidad de jurisdicciones. El ejemplo no debe reproducirse ni utilizarse bajo ninguna circunstancia; su sola presencia en la ficha es motivo para tratar el repositorio con extrema cautela y para reportarlo.
- Contradiccion de licencia: la metadata de HuggingFace declara `creativeml-openrail-m`, mientras que la model card y el modelo base imponen la FLUX-1-dev Non-Commercial License. Ante una discrepancia de este tipo, la interpretacion restrictiva es la segura: uso no comercial.
- Terminos incompatibles con produccion comercial: cualquier despliegue comercial requiere licencia expresa de Black Forest Labs para FLUX.1-dev, y la situacion del adaptador no esta aclarada.
- Sesgos: no documentados. Un adaptador de este tipo puede amplificar sesgos de representacion del modelo base (etnicidad, complexion corporal, edad aparente), con riesgo adicional de generar sujetos de apariencia menor de edad.
- Alucinacion estructural: como todo modelo de difusion, produce artefactos anatomicos (manos, extremidades, texturas), incoherencia con prompt largo y fallos en composiciones con multiples sujetos.
- Limitaciones de contexto: el condicionamiento de texto esta acotado por el modelo base (512 tokens en T5-XXL, 77 en CLIP). No hay soporte multilingue declarado; se desconoce el comportamiento con prompts en castellano.
- Ausencia de evaluacion: sin benchmarks, sin dataset de entrenamiento documentado y sin versionado del proceso de ajuste, el modelo no es auditable ni reproducible.
- Sin soporte ni garantias: repositorio con 0 descargas y 0 likes en la informacion disponible, autor sin historial verificable en la plataforma y ausencia de mantenimiento declarado.
- Retirada del modelo base: la generacion de imagenes realistas de personas identificables o de figuras publicas puede infringir derechos de imagen y normativa de deepfakes, con obligacion de etiquetado de contenido sintetico en la UE.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ballsworthy/Flux-Uncensored-V2
- Modelo base FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Licencia del modelo base: https://huggingface.co/black-forest-labs/FLUX.1-dev/blob/main/LICENSE.md
- Sitio del autor (EnhanceAI): https://enhanceai.art
- Discord de soporte declarado en la model card: https://discord.gg/cuCX9qur6f
- Pagina de soporte y donaciones: https://enhanceai.art/pricing
- Repositorio de referencia del LoRA citado en la model card: https://huggingface.co/enhanceaiteam/Flux-uncensored-v2
- Paper o informe tecnico: no disponible
