# Nanami231/tumtum-26

## Resumen

`Nanami231/tumtum-26` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, entrenado sobre la variante Krea-2-Raw y validado sobre Krea-2-Turbo. Lo publica el usuario Nanami231 en Hugging Face con licencia Apache 2.0 y un tamano de repositorio de 1,7 GB. No es un modelo fundacional: es un ajuste fino ligero que anade un concepto visual concreto, invocado mediante el token `TUMTUM@26`.

El proposito del adaptador es inyectar un concepto personalizado (personaje u objeto denominado TUMTUM@26) en el pipeline de generacion de Krea 2, de forma que el modelo base reproduzca ese concepto en escenas y estilos variados. Los ejemplos de la model card muestran el concepto integrado en entornos muy distintos (ciudad ciberpunk, templo en la selva, terrario en miniatura), lo que sugiere un entrenamiento orientado a la generalizacion del concepto mas que a un unico estilo.

Es relevante para desarrolladores que ya trabajen con Krea 2 y necesiten personalizacion de conceptos sin reentrenar el modelo base: un LoRA de este tipo se carga sobre el pipeline existente con unas pocas lineas de `diffusers` y un coste de almacenamiento muy reducido en comparacion con un fine-tuning completo. La informacion publica es escasa: no hay datos de dataset, hiperparametros, benchmarks ni evaluaciones cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion texto-a-imagen Krea 2; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se distribuye en este repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; longitud de prompt no disponible) |
| Tipos de cuantizacion | no disponible (los pesos LoRA se cargan sobre el modelo base en bfloat16 segun el ejemplo de la model card) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA compatibles con `diffusers` (`load_lora_weights`); formato de fichero concreto no disponible |
| Modelo base | krea/Krea-2-Raw (entrenamiento), mostrado sobre krea/Krea-2-Turbo |
| Token de activacion | `TUMTUM@26` |
| Tamano del repositorio | 1,7 GB |
| Libreria | diffusers |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth sobre Krea 2. DreamBooth es una tecnica de personalizacion que ensena al modelo un sujeto o concepto concreto a partir de un conjunto reducido de imagenes, asociandolo a un token unico; en este caso el token es `TUMTUM@26`. El entrenamiento se realizo sobre Krea-2-Raw, la variante del modelo base orientada a calidad, mientras que las muestras publicadas se generaron sobre Krea-2-Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que indica que el adaptador es compatible con la variante destilada de pocos pasos.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni la composicion del dataset. Tampoco se documenta si se aplicaron tecnicas adicionales como regularizacion por clase, aumento de datos o balanceo de estilos. La unica innovacion tecnica verificable es el uso de un token de activacion poco convencional (`TUMTUM@26`, con caracteres especiales) y la validacion cruzada entre las variantes Raw y Turbo del modelo base.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el concepto TUMTUM@26 cuando se incluye el token de activacion en el prompt.
- Transferencia de estilo y contexto: el concepto se integra en escenas muy distintas (ciudad ciberpunk, templo en la selva, terrario en miniatura) segun los ejemplos publicados.
- Compatibilidad con Krea-2-Turbo en regimen de pocos pasos (8 pasos, `guidance_scale=0.0`), lo que permite inferencia rapida.
- Carga y descarga dinamica del adaptador mediante `pipe.load_lora_weights` en `diffusers`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: es un modelo puramente generativo visual.
- Capacidades multilingues de prompt: no documentadas; los ejemplos estan en ingles.
- No dispone de capacidades de vision, audio ni comprension de imagenes.

## Casos de uso

- Prototipado de personajes para videojuegos o animacion: el LoRA permite generar variaciones del concepto TUMTUM@26 en multiples entornos y estilos con un unico token, lo que acelera la exploracion de diseno conceptual antes de modelado 3D.
- Ilustracion editorial tematica: integrar el concepto en escenas narrativas (templos, mercados, terrarios) para articulos, portadas o campanas, aprovechando la capacidad de mantener la identidad del sujeto entre escenas.
- Generacion de assets para merchandising: producir imagenes del concepto en contextos comerciales variados (posters, camisetas, packaging) con coherencia visual gracias al token de activacion.
- Pruebas de concepto en pipelines de difusion: servir como caso de estudio para equipos que quieran evaluar el flujo DreamBooth + LoRA sobre Krea 2 antes de invertir en un entrenamiento propio.
- Personalizacion de marca o mascota corporativa: si el concepto TUMTUM@26 representa una mascota, el adaptador permite generar contenido de marketing consistente en distintos formatos y escenarios.
- Experimentacion artistica e investigacion: analizar como un LoRA de bajo rango modifica la distribucion del modelo base en funcion del prompt y del numero de pasos, con la ventaja de que el adaptador es ligero y facil de intercambiar.
- Generacion rapida en produccion con Krea-2-Turbo: al funcionar con 8 pasos y `guidance_scale=0.0`, encaja en flujos donde la latencia importa mas que la fidelidad maxima, siempre que el concepto aparezca en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Depende enteramente del modelo base Krea 2, cuyos requisitos no se detallan en la model card; el adaptador LoRA en si anade una sobrecarga minima.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base Krea 2.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights`; otras opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a modelos de difusion o no estan documentadas para este adaptador.
- Latencia y throughput: no disponibles. La model card indica 8 pasos de inferencia en Krea-2-Turbo, pero no publica tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nanami231/tumtum-26 | LoRA DreamBooth | Krea-2-Raw | no disponible | no aplica | Apache 2.0 | Hugging Face, 11 descargas |
| Adaptadores LoRA genericos para Krea 2 | LoRA | Krea 2 | no disponible | no aplica | variable | no disponible |
| LoRA para otros modelos de difusion (p. ej. SDXL) | LoRA | SDXL | no disponible | no aplica | variable | no disponible |

No se dispone de datos de rendimiento ni de adaptadores comparables documentados en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Informacion de entrenamiento ausente: no se documentan dataset, hiperparametros, rango del LoRA ni proceso de validacion, lo que impide reproducir el entrenamiento o evaluar su robustez.
- Riesgo de sobreajuste al concepto: al ser un DreamBooth con un token especifico, el adaptador puede degradar la diversidad de las generaciones o imponer el concepto incluso cuando el prompt no lo solicite con claridad.
- Dependencia estricta del modelo base: solo funciona con Krea 2 (Raw o Turbo); no es utilizable con otros pipelines sin conversion.
- Idiomas: no hay evidencia de soporte multilingue en los prompts; los ejemplos estan en ingles y el comportamiento con otros idiomas no esta verificado.
- Sesgos: no documentados. Al heredar las distribuciones del modelo base, puede reproducir sesgos presentes en Krea 2.
- Alucinacion visual: como todo modelo generativo, puede producir artefactos, anatomia incorrecta o incoherencias en escenas complejas; no hay evaluaciones publicadas.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el uso del modelo base Krea 2 queda sujeto a su propia licencia, que no se detalla en esta ficha.
- Madurez: 11 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento por parte del autor.
- Token de activacion con caracteres especiales (`TUMTUM@26`): puede requerir cuidado en el escapado dentro de pipelines y APIs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nanami231/tumtum-26
- Modelo base (Raw): https://huggingface.co/krea/Krea-2-Raw
- Modelo base (Turbo, usado en las muestras): https://huggingface.co/krea/Krea-2-Turbo
- Documentacion de `diffusers`: https://huggingface.co/docs/diffusers
- Paper de DreamBooth: https://arxiv.org/abs/2208.12242
- Paper de LoRA: https://arxiv.org/abs/2106.09685
