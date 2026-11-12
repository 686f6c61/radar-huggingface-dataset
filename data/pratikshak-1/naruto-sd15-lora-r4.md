# PratikshaK-1/naruto-sd15-lora-r4

## Resumen

Naruto SD1.5 LoRA r4 es un adaptador LoRA de bajo rango (rank 4) para Stable Diffusion 1.5, entrenado para generar imagenes con el estilo visual de la serie Naruto. Lo desarrolla PratikshaK-1 en el contexto de la asignatura DATA 266 (Lab 2, Parte 2) y se publica como ejecucion comparativa frente al modelo final de la misma practica, el adaptador de rank 32 (PratikshaK-1/naruto-sd15-lora-r32). Ambos se entrenaron con el mismo dataset, el mismo numero de pasos y la misma configuracion; la unica variable que cambia es el rango del LoRA.

El modelo resuelve un problema acotado: demostrar empiricamente el efecto del rango en un LoRA de difusion sobre un dominio estilistico concreto. Con 797.184 parametros entrenables y 3.000 pasos sobre el dataset lambdalabs/naruto-blip-captions, el adaptador se acopla a los pesos de Stable Diffusion 1.5 sin modificar el modelo base, lo que permite cargarlo y descargarlo con la libreria diffusers.

Es relevante ahora como referencia metodologica: publica metricas objetivas (KID, CLIP score y diversidad LPIPS) frente al modelo base, lo que permite cuantificar cuanto gana un LoRA de rango bajo en fidelidad al dominio y cuanto pierde en diversidad y alineamiento texto-imagen. No es un modelo de produccion: es un artefacto de investigacion docente con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Stable Diffusion 1.5 (UNet + VAE + text encoder CLIP) |
| Parametros totales | no disponible (el modelo base SD1.5 ronda los 860M en UNet; el adaptador no declara total) |
| Parametros activos | no aplica (no es MoE); parametros entrenables del adaptador: 797.184 |
| Longitud de contexto | no aplica (modelo text-to-image; el limite practico lo fija el tokenizador CLIP del modelo base, 77 tokens) |
| Tipos de cuantizacion | no disponible (no se documentan variantes fp16/fp32/GGUF del adaptador) |
| Idiomas soportados | no disponible (los prompts se procesan con el text encoder CLIP de SD1.5, predominantemente ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | no disponible de forma explicita; libreria diffusers (pesos de adaptador LoRA compatibles con el pipeline de diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 4 aplicado sobre Stable Diffusion 1.5. No introduce una arquitectura nueva: inyecta matrices de baja dimensionalidad en las capas del UNet (y potencialmente del text encoder, aunque la model card no lo detalla) para adaptar la generacion al dominio Naruto. El entrenamiento se realizo con el dataset lambdalabs/naruto-blip-captions, con pares imagen-texto captioned por BLIP.

La configuracion de entrenamiento declarada es: learning rate 0,0001, 3.000 pasos, batch size 4, 1,275 GPU-hours y 3,54 GB de memoria pico. La model card no especifica el optimizador, el scheduler de difusion, la resolucion de entrenamiento ni si se aplicaron tecnicas como dropout o augmentation. La innovacion tecnica del artefacto es comparativa: al compartir datos, pasos y ajustes con el run de rank 32, aísla el efecto del rango sobre las metricas de calidad, alineamiento y diversidad.

## Capacidades

- Generacion text-to-image condicionada por prompt, heredada de Stable Diffusion 1.5.
- Especializacion estilistica en la estetica de Naruto: personajes, paleta y composicion propias de la serie.
- Compatible con el ecosistema diffusers: carga como adaptador LoRA sobre el pipeline de SD1.5.
- Composicion con otros LoRA y con ControlNet siempre que el pipeline base lo permita (no verificado en la model card).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusion, no un LLM.
- No dispone de modo thinking, vision de entrada, audio ni capacidades multimodales mas alla del texto a imagen.
- Capacidades multilingues no documentadas; el text encoder CLIP de SD1.5 esta entrenado principalmente en ingles.

## Casos de uso

- Investigacion sobre LoRA y rango: sirve como punto de comparacion controlado frente al run de rank 32 para estudiar el compromiso entre capacidad de adaptacion y sobreajuste en dominios estilisticos pequenos.
- Docencia y practicas de difusion: reproduce un flujo completo de fine-tuning con diffusers, metricas KID/CLIP/LPIPS y publicacion en Hugging Face, util como plantilla de laboratorio.
- Generacion de arte conceptual de fan art: permite producir ilustraciones con estetica Naruto para prototipos, storyboards o maquetas no comerciales.
- Pruebas de pipelines de generacion de imagen: al ser un adaptador pequeno (797.184 parametros entrenables), se integra rapidamente en entornos de test para validar carga de LoRA, schedulers y prompts.
- Experimentos de composicion de adaptadores: util para medir como interactua un LoRA de estilo de rango bajo con otros LoRA o con el modelo base en tareas de mezcla de estilos.
- Benchmarking de metricas de imagen: sus valores de KID, CLIP score y LPIPS sirven como referencia para calibrar evaluaciones de calidad en modelos de difusion de dominio especifico.

## Benchmarks y rendimiento

| Metrica | Modelo base (SD1.5) | LoRA r4 | LoRA r32 (referencia) |
|---|---|---|---|
| KID in-domain (menor es mejor) | 0,1337 | 0,0389 | no disponible en la informacion |
| CLIP score, 20 prompts (mayor es mejor) | 31,54 | 30,35 | no disponible en la informacion |
| LPIPS diversity (mayor es mejor) | 0,808 | 0,776 | no disponible en la informacion |

Los datos disponibles solo cubren la comparacion del LoRA r4 con el modelo base. La model card no publica los valores del run de rank 32, por lo que no se puede cuantificar la diferencia entre ambos adaptadores. No se han publicado resultados de benchmarks adicionales (FID, evaluaciones humanas, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; depende del pipeline SD1.5 completo, que en fp16 suele requerir del orden de 4-8 GB segun resolucion y optimizaciones (no confirmado en la model card).
- Memoria pico durante el entrenamiento declarada: 3,54 GB (con batch size 4 y 3.000 pasos).
- GPU recomendadas: no disponibles; el entrenamiento declaro 1,275 GPU-hours sin especificar el modelo de GPU.
- Compatibilidad con GPU de consumo: probable en GPUs consumer con 8 GB o mas para inferencia de SD1.5 + LoRA, aunque no esta verificado en la documentacion del autor.
- Opciones de despliegue: diffusers (libreria declarada). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Metricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Naruto SD1.5 LoRA r4 (este) | 797.184 entrenables | no aplica / no disponible | KID 0,0389; CLIP 30,35; LPIPS 0,776 | creativeml-openrail-m | Hugging Face, 0 descargas |
| Naruto SD1.5 LoRA r32 (PratikshaK-1) | no disponible | no aplica / no disponible | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| Stable Diffusion 1.5 (base) | ~860M (UNet) | 77 tokens de prompt / 512x512 nativo | KID 0,1337; CLIP 31,54; LPIPS 0,808 | creativeml-openrail-m | Ampliamente disponible |

La comparativa se limita a estos tres artefactos porque la informacion proporcionada no incluye otros LoRA de estilo Naruto ni sus metricas. No se dispone de datos de rendimiento del run de rank 32, lo que impide cerrar la comparacion entre ambos adaptadores.

## Limitaciones y advertencias

- Licencia del dataset no declarada en su model card; las imagenes provienen de narutopedia.com y Naruto es propiedad intelectual con copyright, por lo que el uso queda restringido a investigacion no comercial.
- La licencia del adaptador es creativeml-openrail-m, que impone restricciones de uso comercial y obligaciones de atribucion; conviene revisar sus terminos antes de cualquier despliegue.
- Riesgo de sobreajuste al dominio: con rank 4 y 3.000 pasos sobre un dataset acotado, el adaptador puede reproducir composiciones y personajes del set de entrenamiento.
- Perdida de alineamiento texto-imagen: el CLIP score cae de 31,54 a 30,35 respecto al modelo base, lo que sugiere menor fidelidad a prompts genericos fuera del dominio.
- Reduccion de diversidad: el LPIPS baja de 0,808 a 0,776, indicando menor variedad en las imagenes generadas.
- Sesgos conocidos: no documentados; al entrenar sobre un dataset de una unica franquicia, el modelo hereda los sesgos visuales y de representacion de ese corpus.
- Limitaciones de idioma: no se documenta soporte multilingue; los prompts en castellano pueden degradar la calidad frente al ingles.
- Caveat de produccion: es una ejecucion comparativa de laboratorio, no el modelo final de la practica; el autor indica explicitamente que el run de rank 32 es el modelo definitivo.
- Repositorio de 0,0 GB y sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PratikshaK-1/naruto-sd15-lora-r4
- Modelo final de la practica (rank 32): https://huggingface.co/PratikshaK-1/naruto-sd15-lora-r32
- Modelo base Stable Diffusion 1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Libreria diffusers: https://github.com/huggingface/diffusers
