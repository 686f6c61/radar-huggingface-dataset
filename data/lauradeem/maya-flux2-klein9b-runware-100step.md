# Lauradeem/maya-flux2-klein9b-runware-100step

## Resumen

Maya FLUX.2 Klein 9B LoRA es un adaptador de tipo LoRA (Low-Rank Adaptation) desarrollado por Lauradeem para el modelo base de generación de imágenes `black-forest-labs/FLUX.2-klein-base-9B`. Se trata de una prueba de compatibilidad de 100 pasos de entrenamiento, diseñada para validar el flujo de trabajo de entrenamiento y despliegue con la herramienta AI Toolkit y el servicio Runware. El modelo está pensado para personalizar la generación de imágenes con un personaje concreto, activado mediante la palabra clave `zkchr7`.

El adaptador se distribuye en formato Diffusers/PEFT con pesos en safetensors y ocupa aproximadamente 0,1 GB. Aunque el repositorio no especifica el número total de parámetros del LoRA, el tamaño reducido y la configuración de rango 16/alpha 16 indican que se trata de un ajuste ligero sobre el modelo base de 9 mil millones de parámetros. Este lanzamiento es relevante porque demuestra la viabilidad técnica de entrenar y desplegar LoRAs personalizados sobre FLUX.2-klein, un modelo eficiente de Black Forest Labs orientado a iteración rápida y prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre FLUX.2-klein-base-9B |
| Parametros totales | no disponible (repo de 0,1 GB, rango 16/alpha 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (generacion de imagenes) |
| Tipos de cuantizacion | no disponible (el LoRA se distribuye en safetensors sin cuantizacion) |
| Idiomas soportados | no disponible (el modelo base puede interpretar prompts en ingles, pero no se especifica) |
| Licencia | other (segun la model card) |
| Formato de pesos | safetensors (Diffusers/PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16, entrenado con AI Toolkit sobre el modelo base FLUX.2-klein-base-9B. El entrenamiento utilizó 12 imagenes de un personaje, cada una con su caption en TXT, a una resolucion de 512 píxeles con buckets de aspecto variable. La exportacion se realizo en formato Diffusers/PEFT, generando 112 tensores `.lora_A.weight` y 112 `.lora_B.weight`, lo que confirma la correcta estructura del adaptador. No se emplearon claves de estilo Kohya (down/up/alpha), lo que indica una exportacion estandar de Diffusers.

El objetivo de esta ejecucion corta (100 pasos) no era lograr una calidad final de personaje, sino validar el flujo completo de entrenamiento y despliegue, incluyendo la compatibilidad con Runware. El modelo base FLUX.2-klein es un modelo de difusion de 9 mil millones de parametros optimizado para velocidad y eficiencia, disenado para iteracion rapida y prototipado en generacion de imagenes.

## Capacidades

- Generacion de imagenes con estilo de personaje personalizado mediante la palabra clave `zkchr7`.
- Compatibilidad con el ecosistema Diffusers y PEFT para integracion en pipelines de generacion de imagenes.
- Validacion de flujo de trabajo con Runware, incluyendo la comprobacion de cabeceras (Runware header check: PASS).
- Soporte para resoluciones variables gracias a los buckets de aspecto durante el entrenamiento.
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multimodal; es exclusivamente un adaptador de generacion de imagenes.

## Casos de uso

- Validacion de pipelines de entrenamiento: este LoRA sirve como prueba de concepto para desarrolladores que deseen verificar que su flujo de entrenamiento con AI Toolkit y despliegue con Runware funciona correctamente antes de invertir en entrenamientos mas largos.
- Personalizacion de personajes en generacion de imagenes: permite generar imagenes de un personaje especifico (por ejemplo, un avatar o mascota) usando el trigger word `zkchr7` sobre el modelo base FLUX.2-klein.
- Prototipado rapido de estilos: al ser un entrenamiento corto, es util para experimentar con la influencia de un LoRA en la salida del modelo base sin necesidad de un entrenamiento extenso.
- Integracion en aplicaciones de generacion de imagenes: al estar en formato Diffusers/PEFT, puede cargarse en aplicaciones que usen la libreria `diffusers` de Hugging Face, como generadores de imagenes por lotes o APIs internas.
- Pruebas de compatibilidad con servicios en la nube: el hecho de que haya pasado la comprobacion de Runware indica que puede desplegarse en entornos gestionados sin problemas de serializacion.
- Educacion y experimentacion: para investigadores o estudiantes que quieran entender como funcionan los LoRAs en modelos de difusion, este ejemplo proporciona una base minima y documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad de imagen, FID, ni comparaciones con otros LoRAs. Al ser una prueba de compatibilidad, no se esperan datos de rendimiento cuantitativos.

## Requisitos de hardware

- El LoRA en si es ligero (0,1 GB) y no requiere hardware adicional, pero debe cargarse junto con el modelo base FLUX.2-klein-base-9B, que tiene 9 mil millones de parametros.
- Para inferencia con el modelo base, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB) para trabajar con precision FP16 o BF16. Con cuantizacion (por ejemplo, 8 bits) podria caber en GPUs de 12 GB, pero no se especifica soporte oficial.
- Opciones de despliegue: la libreria `diffusers` de Hugging Face es la via principal, junto con servicios como Runware que ya han validado la compatibilidad. Tambien puede usarse con herramientas como ComfyUI o Automatic1111 si se convierten los pesos, aunque no se documenta.
- Latencia y throughput: no disponibles. Dependen del hardware y del numero de pasos de inferencia (el nombre del modelo indica 100 pasos, pero no se especifica si es el numero de pasos de entrenamiento o de inferencia; probablemente sea de entrenamiento).

## Comparativa con modelos similares

No se dispone de informacion sobre LoRAs comparables en el mismo repositorio o en la busqueda web. Dado que es un adaptador especifico para un personaje y una prueba de compatibilidad, no hay alternativas directas documentadas. Se podria comparar con otros LoRAs de FLUX.2-klein, pero no se han encontrado datos publicos.

## Limitaciones y advertencias

- Es una prueba de compatibilidad, no un modelo de produccion. La calidad del personaje no esta optimizada y puede presentar artefactos o inconsistencias.
- El entrenamiento se realizo con solo 12 imagenes, lo que limita la generalizacion y puede provocar sobreajuste al personaje especifico.
- La licencia "other" no especifica restricciones claras; se recomienda revisar los terminos de Black Forest Labs para el modelo base y los de Lauradeem para el adaptador antes de uso comercial.
- No se proporcionan datos sobre sesgos o alucinaciones visuales. Como cualquier modelo de generacion de imagenes, puede producir resultados no deseados o estereotipados dependiendo de los prompts.
- El trigger word `zkchr7` es necesario para activar el estilo; sin el, el LoRA no tendra efecto.
- No hay informacion sobre el pipeline de inferencia (por ejemplo, si requiere un scheduler especifico) ni sobre la compatibilidad con versiones de `diffusers`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lauradeem/maya-flux2-klein9b-runware-100step
- Modelo base FLUX.2-klein-9B en HuggingFace: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Pagina de FLUX.2 [klein] en Runware: https://runware.ai/models/bfl-flux-2-klein-9b
- Pagina de FLUX.2 [klein] base en Runware: https://runware.ai/models/bfl-flux-2-klein-9b-base
- Pagina oficial de FLUX.2 [klein] en Black Forest Labs: https://bfl.ai/models/flux-2-klein
- Ejemplo de uso en RunningHub: https://www.runninghub.ai/model/public/2011966997952729090
