# Naveen052k/data266-lab2-team25-p2-lora-rank16

## Resumen

`Naveen052k/data266-lab2-team25-p2-lora-rank16` es un adaptador LoRA de rango 16 entrenado sobre el UNet de Stable Diffusion 1.5 para generacion de imagenes texto-a-imagen con estetica Pokemon. Lo desarrolla el usuario Naveen052k en el contexto de la asignatura DATA 266 (Lab 2, equipo 25, parte 2), por lo que se trata de un experimento academico y no de un modelo de produccion. El repositorio no contiene pesos completos del modelo base: solo el adaptador, que debe cargarse junto a `stable-diffusion-v1-5/stable-diffusion-v1-5` mediante la libreria Diffusers.

El adaptador se entreno durante 800 pasos con batch size 1, learning rate 1e-4 y precision FP16 sobre el dataset `reach-vb/pokemon-blip-captions` (833 pares imagen-texto, divididos en 749 de entrenamiento y 84 de test con semilla 266) a resolucion 512x512. El resultado son 3.188.736 parametros entrenables guardados, con un tiempo de entrenamiento de 423,52 segundos y un pico observado de 2837 MiB de VRAM.

Su relevancia es limitada fuera del ambito docente: el propio autor declara que la evaluacion de calidad de imagen (KID, CLIP score, LPIPS y evaluacion humana) esta pendiente, y restringe el uso a investigacion educativa no comercial. Resulta util como referencia de un flujo completo de fine-tuning LoRA sobre difusion, no como generador de imagenes listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion 1.5 (difusion latente, transformer convolucional) |
| Parametros totales | 3.188.736 parametros del adaptador (el modelo base no se incluye en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo texto-a-imagen) |
| Tipos de cuantizacion | no disponible (entrenado en FP16; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponibles (los prompts dependen del text encoder del modelo base, CLIP) |
| Licencia | no disponible en los metadatos de Hugging Face; el autor indica uso solo educativo no comercial y el modelo base es CreativeML OpenRAIL-M |
| Formato de pesos | safetensors de Diffusers (adaptador LoRA; el tamano del repo figura como 0.0 GB) |

## Arquitectura y entrenamiento

El adaptador inyecta matrices de bajo rango (rango 16) en las capas del UNet de Stable Diffusion 1.5, que actua como modelo de difusion latente: un autoencoder VAE comprime las imagenes a un espacio latente de 512x512 y el UNet denoisa ese latente condicionado por embeddings de texto de CLIP. No se modifica el text encoder ni el VAE; solo se entrena el UNet mediante LoRA, lo que reduce drasticamente el numero de parametros actualizados (3,18 M) frente a un fine-tuning completo.

El entrenamiento uso el dataset Pokemon BLIP Captions (833 pares imagen-caption, 749 para entrenamiento y 84 reservados para test, split con semilla 266), 800 pasos, batch size 1, learning rate 1e-4, precision FP16, gradient checkpointing activado y semilla 266. No se documenta el uso de RLHF, DPO ni tecnicas de preferencia, algo esperable en un adaptador de difusion. Tampoco se detalla la composicion exacta del dataset tras la limpieza (el autor afirma que quedaron 833 imagenes) ni si se aplicaron tecnicas como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512x512 pixeles, condicionada por prompts de texto en el modelo base.
- Especializacion estetica en el dominio Pokemon: personajes, criaturas y estilos visuales cercanos al dataset de entrenamiento.
- Personalizacion ligera: al ser un adaptador LoRA, puede combinarse con el modelo base y con otros adaptadores compatibles en el ecosistema Diffusers.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingues no documentadas; la calidad del prompt depende del text encoder CLIP del modelo base.
- No dispone de modo thinking, vision de entrada, audio ni otras capacidades multimodales mas alla de la generacion de imagen.

## Casos de uso

- Docencia y practicas de fine-tuning: sirve como ejemplo reproducible de un pipeline LoRA sobre difusion (dataset, split, hiperparametros y metricas) para asignaturas de machine learning.
- Generacion de ilustraciones de estilo Pokemon para prototipos personales o trabajos academicos, cargando el adaptador sobre SD 1.5 en Diffusers y usando prompts descriptivos.
- Experimentacion con hiperparametros de LoRA: comparar rango 16 frente a otros rangos o pasos de entrenamiento usando el mismo split (semilla 266) para estudiar el efecto del overfitting.
- Estudio de sobreajuste en datasets pequenos: con solo 749 imagenes de entrenamiento, es un caso util para medir memorizacion y deriva estilistica con metricas como KID o LPIPS.
- Base para evaluaciones de seguridad en difusion: el autor preve documentar filtrado de seguridad y comprobaciones de memorizacion, por lo que puede emplearse como banco de pruebas de esas tecnicas.
- Composicion con otros LoRA en entornos de investigacion: al ser un adaptador independiente, permite probar tecnicas de mezcla de adaptadores y control de estilo en el ecosistema Diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la evaluacion de calidad de imagen (KID, CLIP score, LPIPS y evaluacion humana) esta pendiente.

## Requisitos de hardware

- VRAM para inferencia: el entrenamiento observo 2837 MiB con gradient checkpointing y FP16; la inferencia del modelo base SD 1.5 mas el adaptador suele requerir del orden de 4-6 GB en FP16, aunque no se documenta una medicion especifica de inferencia para este adaptador.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para inferencia comoda (RTX 3060, RTX 4060, RTX 4090, A100, H100); el entrenamiento reportado cabe en GPUs de gama media.
- Cabe en GPU de consumo: si, segun el consumo observado durante el entrenamiento (2837 MiB) y el tamano del modelo base SD 1.5.
- Opciones de despliegue: Diffusers (libreria declarada en el repo) para cargar el adaptador sobre `stable-diffusion-v1-5`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles; el unico dato temporal es el tiempo de entrenamiento (423,52 s para 800 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-lab2-team25-p2-lora-rank16 | 3,18 M (adaptador LoRA r16) | no aplica | evaluacion pendiente | no disponible (uso educativo no comercial segun autor) | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 (modelo base) | ~860 M (UNet) | no aplica | benchmarks publicos de difusion | CreativeML OpenRAIL-M | ampliamente disponible |
| Otros LoRA de estilo Pokemon en SD 1.5 | variable | no aplica | no disponible | variable | comunidad Hugging Face |
| Adaptadores LoRA de rango distinto sobre SD 1.5 | variable | no aplica | no disponible | variable | comunidad Hugging Face |

No se dispone de datos de rendimiento comparables para este adaptador ni para alternativas concretas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo academico con dataset pequeno (749 imagenes de entrenamiento): alto riesgo de sobreajuste y de reproducir rasgos de personajes del dataset.
- Evaluacion de calidad pendiente: no hay KID, CLIP score, LPIPS ni evaluacion humana publicados, por lo que no puede afirmarse su calidad objetiva.
- Fallos previsibles en prompts complejos o fuera de dominio (out-of-domain), segun el propio autor.
- Sesgos: no documentados; al entrenar sobre un dataset de una franquicia concreta, hereda sus sesgos estilisticos y de representacion.
- Riesgo de memorizacion de imagenes del dataset de entrenamiento, pendiente de comprobacion segun el autor.
- Licencia del adaptador no disponible en los metadatos; el autor restringe el uso a investigacion educativa no comercial.
- El modelo base tiene licencia CreativeML OpenRAIL-M y el dataset declara CC BY-NC-SA 4.0, lo que limita el uso comercial.
- Los derechos sobre los personajes Pokemon pueden pertenecer a terceros; el usuario debe respetar todas las restricciones aplicables.
- No incluye pesos del modelo base: requiere descargar `stable-diffusion-v1-5/stable-diffusion-v1-5` por separado.
- Sin filtrado de seguridad documentado todavia.

## Enlaces

- Hugging Face: https://huggingface.co/Naveen052k/data266-lab2-team25-p2-lora-rank16
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Libreria Diffusers: https://github.com/huggingface/diffusers
