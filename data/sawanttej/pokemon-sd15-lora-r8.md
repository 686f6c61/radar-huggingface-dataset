# SawantTej/pokemon-sd15-lora-r8

## Resumen

`SawantTej/pokemon-sd15-lora-r8` es un adaptador LoRA de rango 8 para el modelo de difusion `stable-diffusion-v1-5`, desarrollado por el usuario SawantTej en el contexto de la asignatura DATA 266 (Lab 2). El adaptador se ha entrenado para generar ilustraciones de estilo Pokemon a partir de descripciones textuales, utilizando el dataset publico `reach-vb/pokemon-blip-captions` con leyendas generadas por BLIP. Se trata de un experimento academico comparativo: el autor entrenó dos variantes (rango 8 y rango 32) con los mismos datos e hiperparametros, y seleccionó la de rango 32 como modelo final, por lo que esta version rango 8 se publica como referencia secundaria.

El modelo no introduce arquitectura nueva: es un LoRA aplicado a las capas de atencion del UNet de Stable Diffusion 1.5, con 1.594.368 parametros entrenables. El objetivo practico es demostrar el flujo completo de fine-tuning de difusion con `diffusers` en hardware de consumo (una sola RTX 4090) y evaluar la especializacion de estilo frente al modelo base mediante metricas KID, CLIP score y LPIPS.

Su relevancia es limitada fuera del ambito docente: el dataset es muy pequeno (830 imagenes tras deduplicar), uniforme (personajes sobre fondo blanco) y las leyendas son sinteticas y a menudo imprecisas. Aun asi, sirve como referencia reproducible de un pipeline LoRA de bajo coste y de como evaluar cuantitativamente el sobreajuste de estilo en text-to-image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (difusion latente, text-to-image) |
| Parametros totales | no disponible (adaptador LoRA: 1.594.368 parametros entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (prompt de texto; sin limite documentado) |
| Tipos de cuantizacion | no disponible (pesos LoRA en fp16 durante el entrenamiento; el modelo base admite fp16/fp32) |
| Idiomas soportados | no disponible (las leyendas de entrenamiento estan en ingles) |
| Licencia | creativeml-openrail-m (adaptador); datos de entrenamiento cc-by-nc-sa-4.0 |
| Formato de pesos | safetensors via `diffusers` (`load_lora_weights`) |

## Arquitectura y entrenamiento

El adaptador se inyecta en las capas de atencion del UNet de Stable Diffusion 1.5 mediante descomposicion de bajo rango (LoRA) con rango 8. El entrenamiento se realizo con el script oficial `train_text_to_image_lora.py` de `diffusers`, en una unica RTX 4090, con precision mixta fp16, batch size 4, learning rate 1e-4 con schedule coseno, semilla 266 y 3000 pasos (aproximadamente 16,1 epocas). El pico de memoria GPU fue de 3,7 GB y el tiempo total de entrenamiento de 16,3 minutos.

Los datos provienen de `reach-vb/pokemon-blip-captions`: 833 imagenes de 512x512 con leyendas BLIP, reducidas a 830 tras eliminar duplicados. El split 90/10 con semilla 266 deja 747 imagenes de entrenamiento y 83 de test (estas ultimas solo para evaluacion). No se documenta uso de RLHF, DPO ni tecnicas de preferencia; es un fine-tuning supervisado estandar sobre pares imagen-texto. La innovacion tecnica es nula por diseno: el valor esta en la reproducibilidad y en la comparacion controlada entre dos rangos de LoRA.

## Capacidades

- Generacion de imagenes text-to-image de estilo cartoon/Pokemon sobre el modelo base SD 1.5.
- Especializacion de estilo: reproduce personajes estilizados sobre fondo blanco, coherente con la distribucion del dataset.
- Composicion con el modelo base: al ser un LoRA, puede cargarse junto con otros adaptadores o con el checkpoint completo de SD 1.5.
- Control mediante prompt en ingles (las leyendas de entrenamiento estan en ese idioma).
- Parametrizacion de inferencia estandar de SD: `num_inference_steps`, `guidance_scale`, semilla.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de vision de entrada, audio ni modo thinking.

## Casos de uso

- Docencia y reproducibilidad de fine-tuning LoRA: sirve como ejemplo minimo (16 minutos en una RTX 4090) para ensenar el pipeline `diffusers` de text-to-image con LoRA, incluido el calculo de KID y CLIP score.
- Generacion de assets conceptuales para prototipos de videojuego: creacion rapida de criaturas cartoon sobre fondo blanco para maquetas no comerciales, aprovechando la especializacion de estilo del adaptador.
- Comparacion de rangos LoRA en investigacion: al existir una variante rango 32 del mismo autor con identicos datos y pasos, permite estudiar el efecto del rango en diversidad (LPIPS) y fidelidad (KID) manteniendo el resto de variables fijas.
- Pruebas de pipelines de difusion en hardware de consumo: validacion de flujos de inferencia y despliegue en GPUs de gama alta consumer (RTX 4090) con requisitos de VRAM modestos.
- Benchmarking de metricas de evaluacion generativa: uso del par KID/CLIP/LPIPS documentado para calibrar herramientas de evaluacion en conjuntos pequenos (20 imagenes generadas).
- Generacion de ilustraciones para material educativo no comercial: dado que la licencia de los datos es cc-by-nc-sa-4.0, encaja en contextos academicos y de investigacion sin animo de lucro.

## Benchmarks y rendimiento

Evaluacion del autor: 20 prompts x 2 semillas, 30 pasos de inferencia, guidance 7.5.

| Metrica | LoRA r8 | Modelo base SD 1.5 |
|---|---|---|
| KID vs 83 imagenes de test (20 generaciones in-domain) | 0,0549 | 0,0947 |
| CLIP score (todos los prompts) | 32,00 | 32,82 |
| LPIPS de diversidad entre dos semillas | 0,770 | 0,830 |
| Comparacion humana con el modelo base | no realizada (solo en el run final r32) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA anade un coste marginal sobre SD 1.5; el modelo base en fp16 requiere aproximadamente 4-6 GB de VRAM para resolucion 512x512.
- GPU recomendadas: RTX 4090 (usada en el entrenamiento, pico de 3,7 GB), A100, H100 para lotes grandes; cualquier GPU con al menos 6-8 GB para inferencia individual.
- Cabe en GPUs consumer: si, en RTX 3060/4060 (12/8 GB), RTX 4070, RTX 4080 y RTX 4090; tambien en GPUs con 6 GB en fp16 a 512x512.
- Opciones de despliegue: `diffusers` (`StableDiffusionPipeline` + `load_lora_weights`), ComfyUI, Automatic1111/Forge, InvokeAI; tambien es posible fusionar el LoRA en el checkpoint base para despliegue sin dependencia del adaptador.
- Latencia y throughput: no disponibles de forma explicita; el entrenamiento completo duro 16,3 minutos en una RTX 4090, lo que indica un coste de inferencia estandar para SD 1.5 a 30 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SawantTej/pokemon-sd15-lora-r8` | LoRA r8, 1,59 M entrenables | 512x512 | KID 0,0549; CLIP 32,00; LPIPS 0,770 | creativeml-openrail-m + datos cc-by-nc-sa-4.0 | Hugging Face (0 descargas) |
| `SushmaMaddali/data266-pokemon-sd15-lora-r8` | LoRA r8 sobre SD 1.5 | 512x512 | no disponible | no disponible (uso academico no comercial segun model card) | Hugging Face |
| Variante rango 32 del mismo autor (run final) | LoRA r32 sobre SD 1.5 | 512x512 | no disponible en esta ficha; seleccionada como modelo final | creativeml-openrail-m | Referenciada en la model card, sin URL directa |
| LoRAs Pokemon en Civitai | variables (SD 1.5, SDXL, Pony, Flux) | 512-1024 | no disponible | variables por autor | Civitai (4.287 modelos con tag "Pokemon") |

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (747 imagenes) y uniforme (personajes unicos sobre fondo blanco); el estilo puede filtrarse a prompts no relacionados, aunque el autor no lo observo en 5 prompts fuera de dominio.
- Prompts con multiples objetos, conteos o colores especificos fallan con frecuencia.
- Las leyendas fueron generadas por BLIP y muchas no describen correctamente la imagen, lo que introduce ruido en el entrenamiento.
- KID calculado sobre solo 20 imagenes generadas: las diferencias pequenas no son estadisticamente significativas.
- El safety checker de Stable Diffusion marco 6 de 120 imagenes; el autor verifico que eran falsos positivos (criaturas cartoon inofensivas).
- Licencia: los personajes Pokemon estan protegidos por copyright y los datos son cc-by-nc-sa-4.0, por lo que el uso queda restringido a investigacion y educacion no comercial. El modelo base impone ademas CreativeML OpenRAIL-M.
- Riesgo de reproduccion de personajes protegidos: no apto para produccion comercial ni para impersonacion.
- No es un modelo de lenguaje: no soporta razonamiento, codigo, tool calling ni agentes.
- Idioma de prompt no documentado fuera del ingles; el rendimiento en castellano no esta evaluado.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SawantTej/pokemon-sd15-lora-r8
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Variante academica relacionada: https://huggingface.co/SushmaMaddali/data266-pokemon-sd15-lora-r8
- Repositorio de LoRAs Pokemon en Civitai: https://civitai.com/tag/pokemon
