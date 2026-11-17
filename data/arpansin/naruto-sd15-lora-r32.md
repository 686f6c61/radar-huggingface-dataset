# Arpansin/naruto-sd15-lora-r32

## Resumen

`naruto-sd15-lora-r32` es un adaptador LoRA de rango 32 para Stable Diffusion 1.5, entrenado por el usuario Arpansin como proyecto de curso (DATA 266, Lab 2, Parte 2). El modelo especializa el UNet de SD 1.5 en la estética del anime Naruto, partiendo del dataset público `lambdalabs/naruto-blip-captions` (1.221 imágenes con captions generados por BLIP). No se trata de un modelo fundacional, sino de un adaptador ligero de 6,4 millones de parámetros entrenables que se carga sobre los pesos base de SD 1.5 a 512x512.

El interés de esta ficha es metodológico más que práctico: el autor publica una comparativa controlada entre el modelo base, una LoRA de rango 4 y esta LoRA de rango 32, con métricas de fidelidad al dominio (KID), adherencia al prompt (CLIP score), diversidad (LPIPS) y señales de memorización y seguridad. Es un ejemplo útil de cómo evaluar adaptadores de difusión de forma cuantitativa, incluyendo el coste que tiene subir el rango: mejor ajuste al estilo del dataset, pero peor seguimiento de instrucciones y mayor riesgo de replicar imágenes de entrenamiento.

El adaptador se distribuye en formato diffusers (safetensors) y su uso previsto es exclusivamente investigación y no comercial, dado que el dataset representa personajes con copyright y no declara licencia propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre las capas de atención del UNet de Stable Diffusion 1.5 (sin LoRA en el text encoder) |
| Parametros totales | 6.377.472 parámetros entrenables (0,737% del UNet) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión texto-imagen; resolución de entrenamiento 512x512) |
| Tipos de cuantizacion | no disponible (adaptador LoRA; la cuantización depende del modelo base cargado) |
| Idiomas soportados | no disponible (prompts en inglés por el estilo de los captions BLIP del dataset) |
| Licencia | no disponible en Hugging Face; la model card restringe el uso a investigación y no comercial y remite a CreativeML OpenRAIL-M del modelo base |
| Formato de pesos | safetensors (librería diffusers) |
| Rango LoRA / alpha | 32 / 32 |
| Modelo base | `stable-diffusion-v1-5/stable-diffusion-v1-5` |
| Resolución | 512x512 |
| Tamaño del repo | 0,0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA exclusivamente sobre las capas de atención del UNet, con rango 32 y alpha 32, sin adaptar el text encoder. Esto implica que el condicionamiento textual sigue siendo el de SD 1.5 original y que toda la especialización se concentra en la generación visual. El número de parámetros entrenables es de 6.377.472, un 0,737% del UNet.

El entrenamiento usó `lambdalabs/naruto-blip-captions` (1.221 imágenes con captions BLIP). Tras limpieza y un split 90/10 con semilla 266, se entrenó con 1.065 imágenes; las imágenes de test no se usaron en entrenamiento. La configuración fue de 1.500 pasos, batch efectivo 16 (micro-batch 4 x acumulación 4), learning rate 1e-4, weight decay 0,01, gradient clipping 1,0, gradient checkpointing y semilla 266. El pico de memoria GPU fue de 2,74 GiB y el coste total de 0,449 GPU-horas, idéntico al del run de rango 4, lo que permite una comparación controlada entre ambos adaptadores.

## Capacidades

- Generación de imágenes texto-a-imagen a 512x512 sobre Stable Diffusion 1.5, especializada en la estética del anime Naruto.
- Reproducción del estilo visual del dataset de entrenamiento (personajes, paleta y composición propios del anime).
- Carga directa con `pipe.load_lora_weights("Arpansin/naruto-sd15-lora-r32")` en el pipeline de diffusers.
- Compatible con el ecosistema de SD 1.5: samplers (DPM-Solver en la evaluación), schedulers, guidance scale y control de pasos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada; es un adaptador de difusión puro.
- No incluye modo thinking, visión de entrada, audio ni funciones de lenguaje.

## Casos de uso

- Investigación académica sobre LoRA en difusión: el paquete incluye una comparativa controlada rango 4 vs rango 32 vs base, útil para estudiar el efecto del rango en fidelidad, adherencia y memorización.
- Generación de arte conceptual con estética Naruto en prototipos no comerciales: el adaptador reproduce el estilo del dataset con KID de 0,015 frente a 0,106 del base, adecuado para bocetos internos.
- Docencia y prácticas de fine-tuning: el coste de 0,449 GPU-horas y 2,74 GiB de pico permite reproducir el entrenamiento en una GPU consumer.
- Evaluación de memorización en modelos generativos: la métrica de similitud máxima 0,94 con imágenes de entrenamiento sirve como caso de estudio de sobreajuste.
- Pruebas de pipelines de filtrado de seguridad: con 6 flags de 40 en el safety-checker, es un banco de pruebas para sistemas de moderación de salida.
- Experimentos de ablación de hiperparámetros: el mismo presupuesto de entrenamiento que el run de rango 4 permite aislar el efecto del rango sin confundirlo con cambios de schedule o datos.

## Benchmarks y rendimiento

Evaluación del autor: 20 prompts x 2 semillas por modelo, 30 pasos, guidance 7,5, sampler DPM-Solver.

| Metrica | Base SD 1.5 | LoRA r=4 | LoRA r=32 (este) |
|---|---|---|---|
| KID vs imágenes de test (menor es mejor) | 0,106 | 0,036 | 0,015 |
| CLIP score | 33,35 | 31,73 | 30,54 |
| Diversidad LPIPS | 0,727 | 0,704 | 0,691 |
| Flags del safety-checker (de 40) | 0 | 2 | 6 |
| Similitud media / máxima con imagen de entrenamiento más cercana | 0,63 / 0,76 | 0,74 / 0,90 | 0,81 / 0,94 |

El propio autor advierte que el KID se calcula con solo 20 imágenes generadas frente a 119 de test, por lo que es ruidoso.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento requirió un pico de 2,74 GiB con gradient checkpointing; la inferencia del pipeline SD 1.5 completo con este adaptador es del orden de 4-6 GB en fp16, aunque el dato exacto de inferencia no está publicado.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM en fp16; el entrenamiento cabe en GPUs consumer de gama media.
- Cabe en GPU consumer: sí, con margen amplio (el entrenamiento cupo en 2,74 GiB de pico).
- Opciones de despliegue: diffusers (vía `load_lora_weights`), y por extensión cualquier runtime que cargue LoRA de SD 1.5 en safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles; el único dato de cómputo publicado es 0,449 GPU-horas de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| naruto-sd15-lora-r32 | 6,38 M entrenables (LoRA r=32) | 512x512 | KID 0,015; CLIP 30,54 | Investigación/no comercial (según model card) | Hugging Face |
| naruto-sd15-lora-r4 | no disponible (LoRA r=4) | 512x512 | KID 0,036; CLIP 31,73 | no disponible | Hugging Face (`Arpansin/naruto-sd15-lora-r4`) |
| Stable Diffusion 1.5 (base) | no disponible en la información | 512x512 | KID 0,106; CLIP 33,35 | CreativeML OpenRAIL-M | Hugging Face |

No se dispone de datos de otros adaptadores de estilo Naruto comparables en la información proporcionada.

## Limitaciones y advertencias

- Menor adherencia al prompt que el modelo base (CLIP 30,54 frente a 33,35), especialmente en prompts fuera de dominio y composicionales.
- Menor diversidad que el base y que el run de rango 4 (LPIPS 0,691 frente a 0,727 y 0,704).
- Señal de memorización más alta de los tres modelos: similitud máxima de 0,94 con una imagen de entrenamiento y media de 0,81; riesgo real de replicar imágenes del dataset.
- Mayor tasa de flags del safety-checker: 6 de 40 frente a 0 del base y 2 del run de rango 4; las salidas deben filtrarse.
- Sesgos del dataset: un subconjunto pequeño de personajes está sobrerrepresentado y el estilo de los captions BLIP condiciona la respuesta a prompts.
- Restricción de licencia: uso solo para investigación y no comercial; el dataset representa personajes con copyright y su dataset card no declara licencia, y se aplican además las restricciones de CreativeML OpenRAIL-M del modelo base.
- Prohibido su uso para imitar personas reales o generar contenido engañoso o inseguro, según la model card.
- El KID publicado es ruidoso por el tamaño reducido de la muestra de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arpansin/naruto-sd15-lora-r32
- Run de rango 4: `Arpansin/naruto-sd15-lora-r4` (referenciado en la model card)
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Paper de LoRA: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
