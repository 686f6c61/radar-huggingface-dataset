# RunningHubAI/rh-face-lora

## Resumen

rh-face-lora es un adaptador LoRA de generacion de imagenes a partir de texto (text-to-image) publicado en Hugging Face por RunningHubAI y atribuido al usuario de RunningHub @粉色大床. El unico peso incluido en el repositorio es `Z_Image_琳2.0.safetensors`, de 162 MiB, que se carga sobre el modelo base Z-image-turbo, segun declara la propia model card ("Finetuned from: Z-image-turbo"). El repositorio ocupa 0,2 GB y esta etiquetado para ComfyUI, RunningHub y Hugging Face.

Por su naturaleza, no es un modelo autonomo sino un ajuste de bajo rango que modifica el comportamiento de un modelo de difusion subyacente: no define por si mismo el espacio latente, el tokenizador de texto ni el scheduler de muestreo, que dependen del modelo base. La model card no documenta el conjunto de datos de entrenamiento, el numero de pasos, el rango del adaptador ni la resolucion objetivo. El autor describe el modelo con la frase "自用测试" (pruebas de uso personal), lo que sugiere un ajuste orientado a un estilo o identidad facial concreta mas que a un uso generalista.

La relevancia de la ficha es limitada pero concreta: se trata de un ejemplo tipico de LoRA ligero para ComfyUI, con licencia sin especificar, cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicados. Cualquier evaluacion en produccion exige validar primero el modelo base Z-image-turbo y su licencia aguas arriba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base Z-image-turbo (text-to-image). Arquitectura interna del adaptador no disponible |
| Parametros totales | No disponible (el unico peso publicado ocupa 162 MiB) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable / no disponible (modelo de generacion de imagenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card remite a la licencia del proyecto original o aguas arriba |
| Formato de pesos | safetensors (`Z_Image_琳2.0.safetensors`) |
| Tamano del repositorio | 0,2 GB |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Fecha de publicacion (metadatos) | 2026-09-23 (creacion) / 2026-09-23 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura del adaptador ni sobre la del modelo base en la informacion proporcionada. Lo unico verificable es que se trata de un LoRA para text-to-image, que su peso se distribuye en formato safetensors con un tamano de 162 MiB y que se ha ajustado a partir de Z-image-turbo. No se documentan el rango (rank) del adaptador, los modulos objetivo (attention, proyecciones cruzadas, etc.), el learning rate, el numero de pasos ni la tecnica de regularizacion empleada.

Tampoco hay datos sobre el dataset: no se indica el numero de imagenes, su procedencia, la resolucion de entrenamiento, el uso de captioning automatico, ni si hubo etapas de ajuste por preferencias humanas. La model card se limita a indicar que el modelo es de pruebas personales y a enlazar al servicio de entrenamiento de RunningHub, sin publicar hiperparametros ni curvas de entrenamiento.

## Capacidades

- Generacion de imagenes a partir de texto mediante el pipeline text-to-image, condicionada al modelo base Z-image-turbo.
- Modificacion de rasgos faciales o de identidad concreta, segun se deduce del nombre del modelo (rh-face-lora) y del nombre del peso (`琳`, probablemente el nombre de la identidad objetivo). No confirmado en la model card.
- Carga como adaptador en ComfyUI mediante el nodo de carga de LoRA habitual.
- Ejecucion en la plataforma en la nube RunningHub y a traves de su API.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, entrada de audio ni modo de razonamiento explicito: son capacidades no aplicables a un modelo de generacion de imagenes.
- Capacidades multilingues: no disponibles. No se especifica si los prompts deben escribirse en ingles, chino u otros idiomas.

## Casos de uso

- Retratos de personaje consistente: aplicar el LoRA en ComfyUI junto a Z-image-turbo para mantener un mismo rostro a lo largo de varias imagenes, util en ilustracion seriada y webcomics.
- Avatares para producto digital: generar avatares coherentes para perfiles, videojuegos o aplicaciones, siempre que la licencia del modelo base lo permita.
- Previsualizacion de casting y storyboard: producir referencias visuales rapidas de un personaje concreto antes de un rodaje o de una produccion de animacion.
- Creacion de material de marketing: variaciones de un mismo rostro en distintos encuadres, iluminaciones y fondos para campanas graficas.
- Ampliacion de datasets: generar imagenes sinteticas de una identidad concreta para aumentar la variedad de un conjunto de entrenamiento, con las cautelas eticas y legales sobre derechos de imagen.
- Prototipado en pipelines de difusion: integrar el LoRA en flujos de ComfyUI gestionados por API para producir lotes de imagenes automaticamente y evaluar su comportamiento.
- Pruebas comparativas de LoRA: usarlo como referencia ligera (162 MiB) para medir el impacto de un adaptador facial sobre un modelo base concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, similitud facial, ni comparaciones cuantitativas con otros adaptadores. Tampoco se indica el numero de pasos de muestreo recomendado, el CFG ni la resolucion de salida.

## Requisitos de hardware

- El propio adaptador ocupa 162 MiB en disco; su carga anadida en memoria es del orden de cientos de MB, despreciable frente al modelo base.
- La VRAM necesaria para inferencia viene determinada casi por completo por Z-image-turbo, cuyo tamano y requisitos no se especifican en la informacion disponible.
- No se dispone de datos sobre GPU recomendadas, compatibilidad con GPU de consumo (RTX 3060, 4090, etc.) ni sobre latencia o throughput.
- Opciones de despliegue confirmadas: ComfyUI, la plataforma RunningHub (web y API). El uso con otras herramientas de difusion (diffusers, Automatic1111, Forge) no esta confirmado.
- Si el adaptador se fusiona con los pesos del modelo base, el coste de VRAM adicional es nulo; si se mantiene como LoRA separada, el sobrecoste es marginal.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de rendimiento, arquitectura del modelo base ni licencia que permitan una comparacion rigurosa con otros LoRA faciales o con alternativas como adaptadores para Flux, SDXL u otros modelos de difusion. Cualquier tabla comparativa requeriria primero caracterizar Z-image-turbo y ejecutar una evaluacion propia.

## Limitaciones y advertencias

- Licencia no especificada: la model card remite a la licencia del proyecto original, por lo que el uso comercial no puede darse por supuesto y debe verificarse aguas arriba.
- Sin informacion sobre el dataset de entrenamiento: no puede evaluarse el consentimiento de las personas cuyas imagenes se hayan podido utilizar, ni el riesgo de sesgos de representacion (etnia, edad, genero, tono de piel).
- Riesgo de artefactos propios de la generacion de imagenes: manos y dedos deformes, texturas de piel irreales, incoherencias en el fondo, ojos asimetricos y deriva de identidad entre generaciones.
- Riesgo de alucinacion visual: el modelo puede generar atributos faciales no solicitados en el prompt.
- Dependencia total del modelo base: cambios de version de Z-image-turbo pueden degradar o romper la compatibilidad del adaptador.
- Idiomas de prompt no documentados: no hay garantia de que los prompts en castellano funcionen igual que en ingles o chino.
- Repositorio sin traccion (0 descargas, 0 likes) y descrito por el autor como prueba de uso personal: no hay evidencia de validacion por terceros.
- Uso responsable: la generacion de rostros realistas de personas identificables exige consentimiento explicito y cumple con la normativa aplicable de proteccion de datos y derechos de imagen.
- Fechas de creacion y actualizacion de los metadatos (2026) resultan anomales y conviene contrastarlas antes de citarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-face-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2047174136287469569
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1967852892927438850
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
