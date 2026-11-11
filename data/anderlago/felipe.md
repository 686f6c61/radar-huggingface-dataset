# anderlago/felipe

## Resumen

`anderlago/felipe` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario anderlago y publicado bajo licencia Apache 2.0. El adaptador ensena al modelo base un concepto concreto activado mediante el token `felipe`, que segun los ejemplos de la model card se emplea para representar a una persona en multiples estilos y escenarios. Fue entrenado sobre Krea 2 RAW y las muestras publicadas se generaron con Krea 2 Turbo en 8 pasos de inferencia.

El modelo resuelve el problema clasico de personalizacion: incorporar un sujeto o identidad especifica a un generador texto-a-imagen sin reentrenar el modelo completo. Con un repositorio de solo 0,8 GB, el adaptador es ligero y se carga sobre el pipeline de diffusers mediante `load_lora_weights`, lo que permite reutilizar la infraestructura del modelo base.

Es relevante por su caracter de ejemplo practico del ecosistema Krea 2 y por su licencia permisiva, aunque su adopcion es muy limitada: apenas 8 descargas y 0 likes en el momento de la consulta, y no dispone de documentacion sobre datos de entrenamiento, hiperparametros ni evaluacion cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen (Krea 2) |
| Parametros totales | no disponible (pesos del adaptador en un repositorio de 0,8 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica contexto de texto en el sentido de LLM) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en el formato de diffusers; el modelo base admite bfloat16 en los ejemplos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | formato diffusers (carga via `load_lora_weights`); no se especifica safetensors de forma explicita |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth sobre Krea 2. DreamBooth es una tecnica de personalizacion que ajusta un modelo de difusion preentrenado para asociar un identificador unico (aqui `felipe`) a un concepto o sujeto concreto, minimizando el olvido catastrofico del resto del conocimiento del modelo. El LoRA introduce matrices de bajo rango en las capas del modelo base, de modo que solo se entrenan y distribuyen esos pesos adicionales, no el modelo completo.

El entrenamiento se realizo sobre Krea 2 RAW, mientras que la inferencia de las muestras publicadas se hizo sobre Krea 2 Turbo con 8 pasos y `guidance_scale=0.0`, lo que indica que el adaptador es compatible con la variante destilada de pocos pasos del modelo base. No se han publicado datos sobre el numero de imagenes de entrenamiento, la resolucion, el rango del LoRA, la tasa de aprendizaje ni la duracion del entrenamiento. Tampoco se documenta el uso de tecnicas adicionales como regularizacion por clase o prior preservation.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `felipe`.
- Personalizacion de un sujeto o identidad concreta en multiples estilos artisticos (fotografia cinematografica, pintura al oleo, retrato de alto detalle).
- Transferencia de estilo y contexto: los ejemplos muestran al sujeto en escenarios muy distintos (hacker cyberpunk, rey renacentista, buceador en un pecio).
- Compatibilidad con Krea 2 Turbo para inferencia rapida en 8 pasos.
- Integracion con la libreria `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- No dispone de soporte documentado de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento, por tratarse de un modelo de generacion de imagen.

## Casos de uso

- Prototipado de personajes para narrativa visual: usar el token `felipe` para mantener la coherencia de un personaje a lo largo de varias ilustraciones de un comic o storyboard, aprovechando la capacidad del LoRA de conservar la identidad en estilos distintos.
- Generacion de avatares y retratos personalizados: producir imagenes de una persona concreta en multiples ambientaciones (cinematografica, pictorica, submarina) para perfiles, presentaciones o material promocional.
- Pruebas de concepto en pipelines de difusion: servir como ejemplo de integracion de un LoRA DreamBooth en un flujo `diffusers` con Krea 2 Turbo, util para equipos que evaluan la personalizacion de modelos de imagen.
- Creacion de material editorial tematico: ilustrar articulos o posts con un personaje recurrente en escenarios variados, reduciendo el coste frente al entrenamiento de un modelo dedicado.
- Experimentacion artistica y educativa: estudiar el comportamiento de un LoRA de bajo rango sobre un modelo de difusion moderno, comparando resultados entre Krea 2 RAW y Krea 2 Turbo.
- Generacion rapida de variantes en local: al ser un adaptador de 0,8 GB, puede cargarse junto al modelo base en entornos con GPU de consumo para iterar sobre prompts en 8 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye tres imagenes de muestra generadas con Krea 2 Turbo en 8 pasos, sin metricas cuantitativas (FID, CLIP score, similitud de identidad u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base Krea 2, no del adaptador. El adaptador en si ocupa 0,8 GB en disco.
- GPU recomendadas: no disponible en la informacion proporcionada; los ejemplos usan `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que sugiere una GPU con soporte de bfloat16.
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos del modelo base Krea 2, que no se detallan en la informacion disponible.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` (unico metodo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen en este contexto.
- Latencia y throughput: no disponibles; las muestras se generaron en 8 pasos con Krea 2 Turbo, pero no se publican tiempos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de Krea 2 ni adaptadores comparables con los que establecer una comparacion de parametros, contexto, rendimiento o licencia. Como referencia cualitativa, la categoria es la de adaptadores DreamBooth/LoRA para personalizacion de modelos texto-a-imagen, pero no se dispone de datos de alternativas concretas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un LoRA de personalizacion de un sujeto concreto, puede reproducir sesgos presentes en el modelo base Krea 2 y en las imagenes de entrenamiento, que no se detallan.
- Riesgo de alucinacion: en generacion de imagen, el equivalente es la deriva del concepto; no se han publicado evaluaciones de fidelidad de identidad ni de consistencia entre prompts.
- Limitaciones de contexto o idioma: no disponible; los prompts de ejemplo estan en ingles y no se documenta el comportamiento con otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Krea 2 puede tener sus propias condiciones; conviene verificar la licencia de `krea/Krea-2-Raw` y `krea/Krea-2-Turbo` antes de un uso en produccion.
- Caveats para produccion: adopcion muy baja (8 descargas, 0 likes), ausencia de documentacion de entrenamiento, sin evaluacion cuantitativa y sin garantias de mantenimiento. El adaptador esta disenado para un modelo base concreto y puede no funcionar con otras variantes o versiones de Krea 2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anderlago/felipe
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo usada en las muestras: https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
