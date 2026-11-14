# Naveen052k/data266-lab2-team25-p2-lora-rank8

## Resumen

El modelo `Naveen052k/data266-lab2-team25-p2-lora-rank8` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre Stable Diffusion 1.5 para la generacion de imagenes de texto a imagen con estetica de Pokemon. Lo desarrolla el usuario Naveen052k en el contexto de la asignatura DATA 266 (Lab 2, equipo 25, parte 2), por lo que se trata de un experimento academico de investigacion mas que de un modelo de produccion. El adaptador modifica unicamente el UNet del modelo base y se carga junto a este mediante la libreria Diffusers.

El modelo resuelve un problema acotado: especializar un modelo de difusion generico en un dominio visual muy concreto (personajes tipo Pokemon) con un coste computacional minimo. Para ello emplea un rango LoRA de 8, lo que da lugar a 1.594.368 parametros entrenables, y se entrena sobre el dataset publico Pokemon BLIP Captions (833 pares imagen-caption). La resolucion de entrenamiento es 512 x 512 y el entrenamiento completo se ejecuta en 800 pasos con un tiempo total de 418,35 segundos y un pico de memoria de aproximadamente 4.369 MiB.

Su relevancia es fundamentalmente didactica: demuestra el flujo completo de fine-tuning eficiente de un modelo de difusion con recursos modestos (cabe en una GPU de consumo) y sirve como referencia reproducible de configuracion LoRA. No obstante, al no contar con evaluacion cuantitativa publicada (KID, CLIP score, LPIPS pendientes) ni con una licencia clara para uso comercial, no debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre UNet de Stable Diffusion 1.5 (difusion latente, text-to-image) |
| Parametros totales | 1.594.368 parametros del adaptador (el modelo base SD 1.5 no se incluye en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; limitado por el text encoder CLIP del modelo base, 77 tokens) |
| Tipos de cuantizacion | no disponible (entrenado en FP16; el adaptador se distribuye presumiblemente en FP16, no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (los prompts dependen del text encoder CLIP de SD 1.5, predominantemente ingles) |
| Licencia | no disponible en los metadatos; la model card indica uso solo educativo no comercial y remite a CreativeML OpenRAIL-M del modelo base y CC BY-NC-SA 4.0 del dataset |
| Formato de pesos | no disponible de forma explicita; compatible con Diffusers (adaptador LoRA, habitualmente safetensors) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el UNet de Stable Diffusion 1.5, un modelo de difusion latente con un autoencoder VAE, un text encoder CLIP y un UNet denoiser. La tecnica LoRA introduce matrices de baja dimension en las capas del UNet, de modo que solo se entrenan 1.594.368 parametros con rango 8, manteniendo congelados los pesos del modelo base. El text encoder no se modifica segun la informacion disponible.

El entrenamiento usa el dataset Pokemon BLIP Captions, con 833 pares imagen-caption originales que tras la limpieza quedan en 833 imagenes; se reservan 749 para entrenamiento y 84 para test, con semilla de particion 266 y resolucion 512 x 512. La configuracion es de 800 pasos, batch size 1, learning rate 0,0001, precision FP16, gradient checkpointing activado y semilla 266. El tiempo de entrenamiento registrado es de 418,35 segundos con un pico de memoria observado de 4.369 MiB. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; tampoco se detalla la composicion exacta del dataset mas alla de su origen publico.

## Capacidades

- Generacion de imagenes de texto a imagen condicionada por prompts, especializada en estetica y personajes tipo Pokemon.
- Fine-tuning eficiente sobre un modelo base de difusion mediante LoRA de rango 8, con bajo coste de almacenamiento y memoria.
- Carga e inferencia a traves de la libreria Diffusers junto al modelo base `stable-diffusion-v1-5/stable-diffusion-v1-5`.
- Entrenamiento reproducible: semilla, pasos, learning rate y particion del dataset estan documentados.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de difusion).
- Capacidades multilingues: no disponibles; el comportamiento dependera del text encoder CLIP del modelo base.
- No se documentan capacidades especiales adicionales (vision, audio, modo thinking).

## Casos de uso

- Docencia y practicas de fine-tuning: sirve como ejemplo reproducible de entrenamiento LoRA sobre un modelo de difusion, con hiperparametros y tiempos documentados para que estudiantes repliquen el flujo en una GPU de consumo.
- Generacion de arte conceptual tematico: util para producir bocetos e ilustraciones con estetica Pokemon en fases tempranas de diseno, siempre en contexto educativo y no comercial.
- Investigacion sobre sobreajuste en datasets pequenos: al entrenar con 749 imagenes, permite estudiar como un LoRA de rango bajo memoriza o generaliza rasgos de personajes concretos.
- Comparacion de configuraciones LoRA: el rango 8 y los 800 pasos sirven como linea base para experimentos que varian rango, pasos o learning rate.
- Prototipado de pipelines de difusion con Diffusers: integrable en scripts de generacion por lotes para validar el flujo de carga de adaptadores y el renderizado a 512 x 512.
- Demostraciones academicas de evaluacion de imagen: preparado para medir KID, CLIP score y LPIPS una vez completada la evaluacion pendiente, como ejercicio de metricas de calidad generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion de calidad de imagen (KID, CLIP score, LPIPS y evaluacion humana) esta pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento observo un pico de 4.369 MiB; la inferencia del adaptador sobre SD 1.5 en FP16 suele requerir del orden de 4-6 GB de VRAM, aunque no se documenta una cifra oficial de inferencia.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para SD 1.5 en FP16; el entrenamiento cabe en GPU de consumo.
- Cabe en GPU de consumo: si, segun el pico de memoria de entrenamiento registrado (4.369 MiB), lo que sugiere compatibilidad con tarjetas de gama media.
- Opciones de despliegue: Diffusers (libreria declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-lab2-team25-p2-lora-rank8 | 1.594.368 (adaptador LoRA) | 512 x 512 | Evaluacion pendiente | No disponible; uso educativo no comercial | Hugging Face |
| Stable Diffusion 1.5 (base) | no disponible en la informacion | 512 x 512 | no disponible | CreativeML OpenRAIL-M | Hugging Face |
| Otros LoRA de Pokemon sobre SD 1.5 | no disponible | 512 x 512 | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Entrenado con un dataset pequeno (749 imagenes de entrenamiento), por lo que puede sobreajustar y reproducir rasgos familiares de personajes concretos.
- Puede fallar en prompts complejos o fuera del dominio (out-of-domain).
- Riesgo de memorizacion de las imagenes de entrenamiento; la model card indica que las comprobaciones de memorizacion y filtrado de seguridad se documentaran tras la evaluacion.
- Sesgos conocidos: no documentados, aunque al derivar de SD 1.5 hereda los sesgos del modelo base.
- Limitaciones de idioma: no documentadas; el text encoder CLIP de SD 1.5 esta orientado predominantemente al ingles.
- Restricciones de licencia: uso solo para investigacion educativa no comercial; el modelo base tiene licencia CreativeML OpenRAIL-M y el dataset CC BY-NC-SA 4.0; los derechos sobre personajes Pokemon pueden pertenecer a terceros.
- No apto para produccion: sin evaluacion cuantitativa publicada ni garantias de calidad.
- La licencia del repositorio no figura en los metadatos, lo que anade incertidumbre sobre su reutilizacion.

## Enlaces

- Hugging Face: https://huggingface.co/Naveen052k/data266-lab2-team25-p2-lora-rank8
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Libreria Diffusers: https://github.com/huggingface/diffusers
