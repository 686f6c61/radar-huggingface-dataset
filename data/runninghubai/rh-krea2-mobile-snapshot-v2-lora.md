# RunningHubAI/rh-krea2-mobile-snapshot-v2-lora

## Resumen

rh-krea2-mobile-snapshot-v2-lora es un adaptador LoRA de edicion de imagen publicado por la cuenta RunningHubAI en HuggingFace y atribuido al autor RunningHub-@像素幻想Lab. Su funcion declarada es simular el estilo de una fotografia casual tomada con movil, es decir, desplazar el resultado visual hacia una estetica amateur y espontanea en lugar de una apariencia de estudio. El repositorio contiene un unico archivo de pesos de 218 MiB (`krea2-mobile-snapshot-v2.safetensors`) y ocupa 0,2 GB en total.

El modelo se presenta como un fine-tuning de "krea2", sin especificar en la model card la arquitectura, el numero de parametros ni la naturaleza exacta de ese modelo base. La etiqueta de pipeline es `image-text-to-image`, lo que indica que el flujo previsto combina una imagen de entrada y una instruccion de texto para producir la imagen editada. La model card indica que no hay trigger words y recomienda un peso de aplicacion en torno a 0,8.

Su relevancia es limitada pero concreta: se trata de un recurso de estilo listo para usar en ComfyUI y en la plataforma RunningHub, pensado para quien necesite producir imagenes con apariencia de foto de movil sin entrenar su propio LoRA. No hay resultados de benchmarks, licencia explicita ni lista de idiomas publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el modelo base "krea2"; la model card no detalla la arquitectura del base) |
| Parametros totales | no disponible (pesos del adaptador: 218 MiB en `krea2-mobile-snapshot-v2.safetensors`) |
| Longitud de contexto | no aplica (modelo de generacion/edicion de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (solo se publica un archivo safetensors sin variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que se sigue la licencia del proyecto original o del upstream, sin nombrarla) |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA de edicion de imagen (`image edit`) |
| Modelo base | krea2 (segun "Finetuned from: krea2") |
| Trigger words | ninguna (la model card indica "无", es decir, sin palabras de activacion) |
| Peso recomendado | ~0,8 |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador ni la del modelo base. Se sabe que es un LoRA, por lo que su funcion es inyectar matrices de bajo rango en las capas del modelo base "krea2" para modular el estilo de salida sin reentrenar el modelo completo. El unico artefacto publicado es un safetensors de 218 MiB, un tamano coherente con un adaptador de bajo rango y no con un modelo completo.

Tampoco se documentan el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste por preferencias (RLHF, DPO). El unico parametro de uso indicado por el autor es un peso de aplicacion en torno a 0,8, dato que sugiere que valores cercanos a 1,0 pueden saturar el estilo. No se declara ninguna innovacion tecnica adicional.

## Capacidades

- Edicion de imagen guiada por texto en el pipeline `image-text-to-image`: acepta una imagen de entrada y una instruccion textual.
- Transferencia de estilo fotografico orientada a "snapshot" de movil, con apariencia de captura casual.
- Funciona como adaptador sobre el modelo base krea2, por lo que hereda las capacidades de generacion y edicion de ese base.
- No requiere trigger words: se activa simplemente cargando el LoRA en el flujo de trabajo.
- Integracion directa en ComfyUI y en la plataforma RunningHub.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, audio, video ni vision mas alla del propio pipeline de imagen.
- No se declara soporte multilingue; la model card existe en version inglesa y china, pero no especifica el idioma de los prompts.

## Casos de uso

- Contenido para redes sociales con estetica UGC: aplicar el LoRA con peso ~0,8 sobre fotos de producto o de personas para que parezcan capturas espontaneas de movil, un formato que suele rendir mejor en feeds y anuncios que la imagen de estudio.
- Edicion de imagen por instrucciones en flujos ComfyUI: cargar la imagen original, escribir la instruccion de cambio y dejar que el pipeline `image-text-to-image` aplique la modificacion conservando el encuadre y el sujeto.
- Produccion de creatividades publicitarias en lote: combinado con un nodo de batching de ComfyUI, permite generar decenas de variantes de una misma escena con acabado de foto amateur para test A/B de anuncios.
- Prototipado rapido para agencias creativas: validar una direccion visual "realista y no producida" antes de invertir en una sesion fotografica real.
- Generacion de datos sinteticos para entrenamiento: crear imagenes con distribucion visual de fotografia amateur para aumentar datasets de tareas de vision por computador, siempre que la licencia del base lo permita.
- Mockups de aplicaciones y productos: generar pantallas o escenas con aspecto de foto de movil para presentaciones internas o documentacion.
- Demostraciones sobre RunningHub: usar el modelo alojado en la plataforma para probar el estilo sin montar infraestructura local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, SSIM, LPIPS ni evaluaciones humanas) ni comparaciones cuantitativas con otros LoRA de estilo.

## Requisitos de hardware

- El adaptador en si ocupa 218 MiB, pero la VRAM necesaria la determina el modelo base krea2, cuyos requisitos no se documentan: no disponible.
- Al ser un LoRA, la inferencia exige cargar simultaneamente el modelo base completo mas el adaptador, de modo que el coste de memoria es el del base mas un incremento marginal.
- No se especifica si el modelo base cabe en GPU de consumo; en la practica dependera de la familia y precision de ese base (no disponible).
- Opciones de despliegue confirmadas por el autor: ComfyUI, plataforma RunningHub y carga desde Hugging Face.
- No se publican datos de latencia ni de throughput.
- Alternativa sin hardware propio: ejecutar el modelo en RunningHub a traves de su API o de la interfaz web.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica otros LoRA comparables, no especifica la familia del modelo base krea2 y no aporta metricas que permitan una comparacion objetiva de parametros, contexto, rendimiento o licencia. La unica referencia de la misma naturaleza es el propio repositorio original en RunningHub, que aloja el mismo modelo.

## Limitaciones y advertencias

- Licencia no disponible: la model card remite a la licencia del proyecto original o del upstream sin nombrarla, por lo que no se puede confirmar que el uso comercial este permitido. Conviene verificar la licencia de krea2 antes de cualquier despliegue en produccion.
- Riesgo de alucinacion visual: al ser un modelo generativo de imagen, puede alterar rasgos, identidades o elementos de la escena original de forma no deseada.
- El estilo esta sesgado hacia un unico tipo de fotografia (captura casual de movil), lo que reduce su utilidad para escenas que requieran acabado profesional o tecnico.
- El peso recomendado (~0,8) es orientativo y no hay guia sobre su interaccion con otros LoRA o con prompts negativos.
- Sin trigger words, el control del estilo depende por completo del peso asignado y del prompt, lo que puede dificultar la reproducibilidad.
- No hay informacion sobre idiomas de prompt soportados ni sobre el comportamiento del modelo con instrucciones en castellano.
- Trazabilidad limitada: 0 descargas y 1 like en el momento de la consulta, sin historial de versiones documentado ni notas de cambio.
- La fecha de publicacion registrada (2026-09-27) y su actualizacion apenas un minuto despues sugieren una subida automatizada, sin proceso de mantenimiento visible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RunningHubAI/rh-krea2-mobile-snapshot-v2-lora
- Pagina original del modelo en RunningHub: https://www.runninghub.ai/model/public/2088482937896452097
- Perfil del autor en RunningHub: https://www.runninghub.ai/user-center/2001950732985270273
- Version en chino de la model card: README_cn.md (en el propio repositorio de HuggingFace)
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Sitio internacional de RunningHub: https://www.runninghub.ai
- Sitio de RunningHub China: https://www.runninghub.cn
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Pagina de la API para Seedance 2.5 en RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
