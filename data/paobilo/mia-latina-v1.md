# paobilo/mia-latina-v1

## Resumen

`paobilo/mia-latina-v1` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario paobilo. El adaptador se entrena sobre los pesos de `krea/Krea-2-Raw` y esta pensado para invocarse en inferencia sobre `krea/Krea-2-Turbo`, la variante destilada de pocos pasos del mismo modelo base. Su funcion es introducir un concepto visual concreto (una identidad o personaje) mediante un token disparador, `m14latina`, que se activa al incluirlo en el prompt.

El modelo resuelve el problema clasico de personalizacion en difusion: fijar un sujeto consistente a traves de prompts muy diversos (retratos cinematograficos, escenas de fantasia, planos de paisaje) sin reentrenar el modelo base. Al ser un LoRA, el coste de almacenamiento es bajo (el repositorio ocupa 0,8 GB) y se carga de forma aditiva sobre el pipeline de Krea 2, lo que permite combinarlo con otras tecnicas de generacion.

Es relevante en el ecosistema open source porque demuestra el flujo de personalizacion sobre la familia Krea 2 dentro de la libreria `diffusers`, con licencia Apache 2.0 y un ejemplo de uso reproducible. No obstante, se trata de un adaptador de nicho, sin descargas ni validacion externa en el momento de la consulta, y sin datos publicados sobre el dataset de entrenamiento, hiperparametros o evaluacion cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion texto-a-imagen Krea 2 |
| Parametros totales | no disponible (el repositorio pesa 0,8 GB; no se desglosa el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusion en el sentido de ventana de tokens) |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea `torch.bfloat16`) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA compatibles con `diffusers` (`load_lora_weights`); no se detalla el formato exacto de los ficheros |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth sobre Krea 2. El modelo base `krea/Krea-2-Raw` es un modelo de difusion texto-a-imagen de la familia Krea 2; el adaptador se entrena sobre esa variante y se aplica en inferencia sobre `krea/Krea-2-Turbo`, que es la version destilada para generacion en pocos pasos (el ejemplo oficial usa 8 pasos con `guidance_scale=0.0`). La tecnica DreamBooth permite asociar un token unico (`m14latina`) a un concepto visual concreto a partir de un conjunto reducido de imagenes de referencia.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, la composicion del dataset, el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni si se aplicaron tecnicas adicionales como regularizacion por clase o aumento de datos. Tampoco se documenta si hubo ajuste fino del text encoder o solo de las capas de atencion del UNet/diT. La model card unicamente indica el modelo base, el token disparador y ejemplos cualitativos generados con la variante Turbo a 8 pasos.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `m14latina`, que activa el concepto entrenado.
- Personalizacion de un sujeto o identidad consistente a traves de prompts de distinta tematica (retrato cinematografico, escena de fantasia, plano de paisaje).
- Composicion con el pipeline `Krea2Pipeline` de `diffusers` mediante `load_lora_weights`.
- Inferencia en pocos pasos sobre Krea 2 Turbo (8 pasos en los ejemplos oficiales).
- Compatibilidad con prompts en ingles segun los ejemplos de la model card; no se documenta soporte multilingue explicito.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio; son capacidades ajenas a un modelo de difusion texto-a-imagen.

## Casos de uso

- Generacion de retratos de personaje consistentes: usar el token `m14latina` en el prompt para producir variaciones de un mismo sujeto en distintos estilos (cinematografico, ilustracion, fantasia) manteniendo la identidad visual.
- Creacion de arte conceptual para videojuegos o narrativa: generar al personaje en escenarios diversos (ciudad cyberpunk, campo de lavanda, montana nevada) como base para bocetos de produccion.
- Prototipado rapido de storyboards: encadenar prompts con el mismo token para obtener una secuencia de planos coherentes de un personaje antes de pasar a un pipeline de produccion.
- Pruebas de personalizacion en `diffusers`: servir como ejemplo reproducible de carga de un LoRA DreamBooth sobre Krea 2 para desarrolladores que quieran replicar el flujo con sus propios conceptos.
- Generacion de material promocional tematico: producir imagenes de marca o campana con un personaje fijo en multiples ambientaciones sin reentrenar el modelo base.
- Experimentacion con combinacion de LoRAs: al ser un adaptador ligero, puede cargarse junto a otros LoRAs sobre Krea 2 para explorar mezclas de estilo y concepto, siempre que la licencia y los terminos del modelo base lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye ejemplos cualitativos (tres imagenes de muestra) sin metricas objetivas como FID, CLIP score, similitud de identidad ni evaluacion humana.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; depende del modelo base Krea 2 Turbo en `bfloat16`. El repositorio del LoRA ocupa 0,8 GB en disco.
- GPU recomendadas: no disponible en la informacion proporcionada; el ejemplo oficial usa `.to("cuda")` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` (flujo documentado). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El ejemplo usa 8 pasos de inferencia con `guidance_scale=0.0`, lo que sugiere un coste bajo por imagen en la variante Turbo, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables para Krea 2 ni sobre metricas que permitan una comparacion cuantitativa. Se indica "no disponible".

| Modelo | Tipo | Modelo base | Licencia | Datos publicados |
|---|---|---|---|---|
| paobilo/mia-latina-v1 | LoRA DreamBooth | krea/Krea-2-Raw (inferencia sobre Krea-2-Turbo) | Apache 2.0 | Ejemplos cualitativos; sin benchmarks |
| Alternativas de personalizacion sobre Krea 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento ni el consentimiento de las personas representadas; el uso del adaptador para generar imagenes de una identidad concreta puede plantear problemas de derechos de imagen y privacidad.
- Riesgo de sobreajuste al concepto: al ser un DreamBooth con token unico, puede degradar la diversidad de las generaciones o filtrar rasgos del sujeto en prompts no relacionados.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar detalles anatomicos o de composicion incorrectos, especialmente en escenas complejas.
- Idiomas: los ejemplos estan en ingles y no se documenta el comportamiento con prompts en castellano; la calidad puede variar.
- Licencia Apache 2.0 para el adaptador, pero el uso comercial queda condicionado tambien por la licencia y terminos del modelo base Krea 2, que deben verificarse por separado.
- Sin descargas ni likes en el momento de la consulta, y sin validacion de la comunidad: no hay evidencia externa de calidad o estabilidad en produccion.
- El adaptador esta disenado para Krea 2 Turbo en 8 pasos con `guidance_scale=0.0`; su comportamiento con otros schedulers, pasos o escalas de guiado no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paobilo/mia-latina-v1
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante de inferencia: https://huggingface.co/krea/Krea-2-Turbo
- Libreria: https://github.com/huggingface/diffusers
