# paobilo/mia-latina-v2

## Resumen

`paobilo/mia-latina-v2` es un adaptador LoRA de tipo DreamBooth para el modelo de generacion de imagenes Krea 2, entrenado sobre los pesos de Krea 2 RAW y pensado para ser utilizado en inferencia sobre Krea 2 Turbo. Lo publica el usuario `paobilo` en Hugging Face bajo licencia Apache 2.0 y con la libreria `diffusers`. Su funcion es introducir un concepto concreto (una identidad visual invocada mediante el token `m14latina`) en las generaciones del modelo base, sin necesidad de reentrenar el modelo completo.

El repositorio ocupa 1.2 GB y contiene unicamente los pesos del adaptador LoRA, no un modelo de difusion completo. Esto implica que para utilizarlo es imprescindible descargar tambien el modelo base Krea 2 (en variante Turbo para los ejemplos de la model card, o RAW para el que fue entrenado). El adaptador se carga sobre el pipeline `Krea2Pipeline` mediante `load_lora_weights`.

La relevancia de esta ficha es limitada en terminos de impacto tecnico: se trata de un LoRA de nicho con 17 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentacion sobre el dataset de entrenamiento. Resulta util como ejemplo de flujo de trabajo DreamBooth-LoRA sobre Krea 2 y como referencia para quien quiera reproducir o adaptar la tecnica, pero no constituye un modelo generalista evaluable por rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Krea 2; no se especifica la arquitectura interna del modelo base |
| Parametros totales | no disponible (el repo de 1.2 GB corresponde a los pesos del adaptador, no al modelo completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; la ventana la determina el text encoder del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en el formato propio del repo, sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | no disponible (el prompt de ejemplo esta en ingles; no se documenta soporte multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos de LoRA compatibles con `diffusers` (`load_lora_weights`) y con el ecosistema `template:sd-lora`; no se detalla el formato exacto de los ficheros |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con la tecnica DreamBooth sobre Krea 2 RAW, segun indica la model card. No se especifica el rango del adaptador, el numero de pasos de entrenamiento, el tamano del dataset, la resolucion de las imagenes de entrenamiento ni si se aplicaron tecnicas adicionales como regularizacion por clase o captions automaticos. Tampoco se documenta el learning rate ni el scheduler utilizado.

La unica informacion tecnica concreta es que el concepto se activa con el token `m14latina` y que las muestras publicadas se generaron sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que sugiere un uso orientado a la variante Turbo (destilada) del modelo base. No hay informacion sobre la composicion del dataset ni sobre posibles sesgos introducidos por las imagenes de entrenamiento.

## Capacidades

- Generacion de imagenes text-to-image condicionada por un concepto especifico (identidad visual `m14latina`) sobre el modelo base Krea 2.
- Inyeccion de estilo y apariencia del concepto en escenas muy diversas: retrato, accion, ciencia ficcion, paisaje, etc., como muestran los tres ejemplos de la model card.
- Compatibilidad con el pipeline `Krea2Pipeline` de `diffusers` y con la carga mediante `load_lora_weights`.
- Uso conjunto con Krea 2 Turbo en regimen de pocos pasos (8 steps, `guidance_scale=0.0`).
- No se documentan capacidades de tool calling, agentes, vision, audio, razonamiento multi-paso ni multilingues; son capacidades ajenas al proposito de un LoRA de imagen.

## Casos de uso

- Generacion de retratos consistentes de un personaje: usar el token `m14latina` en el prompt para mantener la identidad visual del concepto a traves de multiples generaciones, util para storyboards o novelas graficas.
- Creacion de material promocional tematico: insertar el concepto en escenas de marca (cyberpunk, naturaleza, aventura) para campañas visuales sin reentrenar el modelo base.
- Prototipado rapido de concept art: combinar el LoRA con Krea 2 Turbo (8 pasos) para iterar sobre variaciones de escena con latencia baja.
- Pruebas de investigacion sobre DreamBooth-LoRA: emplear el adaptador como caso de estudio reproducible para analizar como un LoRA de bajo rango modifica la distribucion de salida de Krea 2.
- Integracion en pipelines de generacion por lotes: cargar el LoRA sobre `Krea2Pipeline` y generar variaciones con distintos prompts manteniendo el concepto fijo.
- Base para fine-tuning posterior: partir de este adaptador para entrenar variantes del concepto (por ejemplo, distintos vestuarios o epocas) sin tocar los pesos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador en si ocupa 1.2 GB, pero la VRAM real la determina el modelo base Krea 2 (RAW o Turbo), cuyas especificaciones no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponibles. La model card no indica GPU objetivo ni requisitos minimos.
- Compatibilidad con GPU de consumo: no confirmada. Depende del modelo base Krea 2, no del LoRA.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` (unico metodo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a modelos de difusion de imagen en este formato.
- Latencia y throughput: no disponibles. La model card solo indica 8 pasos de inferencia en Krea 2 Turbo, sin tiempos medidos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA comparables ni datos de rendimiento que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un LoRA entrenado sobre un concepto concreto, puede reproducir los sesgos presentes en las imagenes de entrenamiento y en el modelo base Krea 2.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar artefactos, anatomia incorrecta o incoherencias en escenas complejas; no se ha evaluado la fidelidad del concepto en prompts fuera de los ejemplos publicados.
- Limitaciones de contexto e idioma: los prompts de ejemplo estan en ingles y no se documenta soporte multilingue; el comportamiento con prompts en castellano es desconocido.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, pero el uso comercial depende tambien de la licencia del modelo base Krea 2 (RAW/Turbo), que no se detalla en la informacion disponible y debe verificarse por separado.
- Caveat para produccion: con 17 descargas y 0 likes, el modelo carece de validacion comunitaria; no hay benchmarks, no se documenta el dataset de entrenamiento y no se especifican los hiperparametros, lo que dificulta reproducir o auditar el resultado.
- Dependencia del modelo base: el LoRA no es autonomo; requiere descargar Krea 2 y su pipeline, lo que anade requisitos de almacenamiento y computo no reflejados en el tamano del repo (1.2 GB).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paobilo/mia-latina-v2
- Modelo base (Krea 2 RAW): https://huggingface.co/krea/Krea-2-Raw
- Modelo base Turbo (referenciado en la model card): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
