# sakotiya/data266-team32-naruto-run1-lora-r4

## Resumen

`sakotiya/data266-team32-naruto-run1-lora-r4` es un adaptador LoRA de bajo rango (rank 4) para Stable Diffusion 1.5, entrenado para generar imagenes con el estilo visual del anime Naruto. Lo publica el usuario sakotiya como resultado de un ejercicio academico (DATA 266 Lab 2, Part 2, Pair Programming Team 32) y corresponde a la ejecucion final seleccionada entre varias pruebas. No es un modelo de lenguaje: es un adaptador de difusion texto-a-imagen que se carga sobre los pesos del UNet de SD 1.5.

El adaptador se entrena sobre el dataset `lambdalabs/naruto-blip-captions`, del que se conservan 1221 imagenes tras la limpieza, divididas 90/10 con semilla 266 (1099 de entrenamiento y 122 de validacion). El entrenamiento aplica LoRA exclusivamente a las capas de atencion del UNet, con 797 184 parametros entrenables, 1500 pasos, batch de 4, learning rate 1e-4 y precision fp16 sobre una unica GPU Tesla T4 (42,3 minutos, pico de 3,54 GB de VRAM).

Su relevancia es limitada y de caracter didactico: el repositorio tiene 0 descargas y 0 likes, y el propio autor restringe el uso a investigacion no comercial por los derechos de autor sobre los personajes de Masashi Kishimoto y Shueisha. Resulta util como referencia de un flujo completo de fine-tuning LoRA de difusion con metrica KID y evaluacion de diversidad entre semillas, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 4) sobre UNet de Stable Diffusion 1.5 (difusion latente, texto-a-imagen) |
| Parametros totales | 797 184 parametros entrenables en el adaptador (el modelo base SD 1.5 no se incluye en el repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; resolucion de entrenamiento 512x512 |
| Tipos de cuantizacion | no disponible (entrenado en fp16; el adaptador se distribuye en precision fp16) |
| Idiomas soportados | no disponible (las captions del dataset estan en ingles via BLIP) |
| Licencia | CreativeML OpenRAIL-M (modelo base); uso restringido a investigacion no comercial por copyright de Naruto |
| Formato de pesos | safetensors (pesos LoRA compatibles con `diffusers`) |

## Arquitectura y entrenamiento

El adaptador se inserta en las capas de atencion del UNet de Stable Diffusion 1.5 mediante LoRA de rango 4, lo que da 797 184 parametros entrenables. El modelo base es un diffusion transformer de tipo latente con codificador de texto CLIP y VAE, a resolucion 512x512. El adaptador no modifica el text encoder ni el VAE: solo el UNet.

Los datos de entrenamiento son las 1221 imagenes de `lambdalabs/naruto-blip-captions` que sobreviven a la limpieza, con captions automaticas generadas por BLIP (textos cortos y descriptivos). La particion es 90/10 con semilla 266 (1099/122). El entrenamiento usa 1500 pasos, batch 4, learning rate 1e-4 y fp16 en una Tesla T4, con un pico de 3,54 GB de VRAM y 42,3 minutos de duracion. No se menciona RLHF, DPO ni decodificacion especulativa; es un fine-tuning supervisado clasico de difusion.

La innovacion tecnica es minima: se trata de un ejercicio reproductible de LoRA de bajo rango con evaluacion cuantitativa (KID in-domain, CLIP score y LPIPS entre semillas). El resultado principal es que el LoRA reduce el KID in-domain de 0,1243 a 0,0532 respecto al modelo base, a costa de un CLIP score ligeramente inferior (29,90 frente a 31,88) y de una diversidad entre semillas algo menor (LPIPS 0,762 frente a 0,806).

## Capacidades

- Generacion de imagenes texto-a-imagen a 512x512 en el estilo visual del anime Naruto.
- Especializacion de estilo: reproduce personajes, paleta y trazos del dominio de entrenamiento.
- Compatibilidad con el ecosistema `diffusers`: carga mediante `load_lora_weights` sobre SD 1.5.
- Composicion con otros LoRA y con el sampler del pipeline base (DPM-Solver++ en la evaluacion).
- Control de la fuerza del adaptador mediante el peso del LoRA en el pipeline.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No tiene capacidades de vision, audio ni comprension de texto: es un generador de imagenes.
- Capacidades multilingues: no disponibles; las captions de entrenamiento estan en ingles.

## Casos de uso

- Investigacion academica sobre fine-tuning LoRA: sirve como referencia reproducible de un pipeline completo (limpieza de datos, split con semilla, entrenamiento en T4, evaluacion con KID y LPIPS) para comparar hiperparametros como el rango o el learning rate.
- Generacion de arte conceptual de estilo anime para prototipos internos no comerciales: el adaptador produce imagenes coherentes con el estilo del dominio de entrenamiento a 512x512, suficiente para bocetos y moodboards.
- Docencia en cursos de difusion: el repositorio documenta pasos, VRAM pico y metricas, lo que permite reproducir el experimento en hardware de gama baja (una T4 o incluso una GPU consumer con 6-8 GB).
- Pruebas de composicion de LoRA: al ser un adaptador pequeno y de rango bajo, es util para experimentar con pesos de mezcla junto a otros LoRA de estilo sobre la misma base SD 1.5.
- Evaluacion de sesgos y diversidad: el LPIPS entre semillas permite medir la perdida de diversidad que introduce el fine-tuning y compararla con el modelo base.
- Generacion de datasets sinteticos de estilo para tareas de aumentacion no comerciales: se pueden producir variaciones de imagenes del dominio para entrenar clasificadores o detectores de estilo en investigacion.

## Benchmarks y rendimiento

Resultados publicados por el autor (20 prompts x 2 semillas, 30 pasos DPM-Solver++, guidance 7.5):

| Metrica | Este LoRA | SD 1.5 base | Mejor direccion |
|---|---|---|---|
| KID in-domain | 0,0532 | 0,1243 | menor |
| CLIP score | 29,90 | 31,88 | mayor |
| LPIPS entre semillas | 0,762 | 0,806 | mayor (diversidad) |

No se han publicado resultados de benchmarks adicionales (FID, IS, evaluacion humana) en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa practicamente nada (repo de 0,0 GB); el coste real es el modelo base SD 1.5, que en fp16 ocupa aproximadamente 4 GB de VRAM.
- Entrenamiento verificado en una Tesla T4 con pico de 3,54 GB de VRAM y 42,3 minutos para 1500 pasos.
- Inferencia viable en GPU consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; tambien en GPUs con 6-8 GB usando `enable_attention_slicing` o `enable_model_cpu_offload`.
- Despliegue mediante `diffusers` (`StableDiffusionPipeline` + `load_lora_weights`); compatible con ComfyUI y Automatic1111/Forge cargando el LoRA sobre SD 1.5.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Alternativas de despliegue como vLLM, llama.cpp, Ollama o TGI no aplican: son servidores de modelos de lenguaje, no de difusion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este LoRA (Naruto run1_lora_r4) | LoRA rank 4 sobre SD 1.5 | 797 184 entrenables | 512x512 | OpenRAIL-M + restriccion no comercial | Hugging Face, 0 descargas |
| SD 1.5 base | Difusion latente completa | ~860 M (UNet) | 512x512 | CreativeML OpenRAIL-M | Ampliamente disponible |
| LoRA de estilo genericos sobre SD 1.5 | LoRA rank variable | variable | 512x512 | variable | Múltiples en Hugging Face |
| SDXL + LoRA de estilo | Difusion latente | ~2,6 B (UNet) | 1024x1024 | CreativeML OpenRAIL++-M | Ampliamente disponible |

No se dispone de datos de benchmarks comparativos con otros LoRA de estilo en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con unas 1100 imagenes de un unico estilo anime y captions BLIP cortas: los prompts fuera de dominio se ven arrastrados hacia ese estilo.
- Hereda los sesgos de Stable Diffusion 1.5, incluidos sesgos demograficos y de representacion.
- Riesgo de alucinacion visual: puede generar anatomia incorrecta, texto ilegible y artefactos propios de SD 1.5 a 512x512.
- Perdida de diversidad entre semillas (LPIPS 0,762 frente a 0,806 del base) y menor alineacion prompt-imagen (CLIP score 29,90 frente a 31,88).
- Restriccion legal: los personajes de Naruto son propiedad de Masashi Kishimoto y Shueisha; el autor limita el adaptador a investigacion no comercial.
- La licencia CreativeML OpenRAIL-M del modelo base impone sus propias restricciones de uso; el adaptador anade la restriccion no comercial.
- Sin mantenimiento ni soporte: 0 descargas, 0 likes y creado en el contexto de un ejercicio academico; no es apto para produccion.
- Idiomas: las captions estan en ingles; el comportamiento con prompts en castellano no esta documentado.

## Enlaces

- Hugging Face: https://huggingface.co/sakotiya/data266-team32-naruto-run1-lora-r4
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Libreria diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
