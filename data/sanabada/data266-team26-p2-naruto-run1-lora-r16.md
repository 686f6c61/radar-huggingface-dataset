# sanabada/data266-team26-p2-naruto-run1-lora-r16

## Resumen

`sanabada/data266-team26-p2-naruto-run1-lora-r16` es un adaptador LoRA de rango 16 entrenado sobre Stable Diffusion 1.5 para aprender el estilo visual de una franquicia de anime (Naruto) a partir del dataset `lambdalabs/naruto-blip-captions`. Lo desarrolla el usuario sanabada en el contexto de la asignatura DATA 266 (Lab 2, equipo 26, primera ejecución), por lo que se trata de un artefacto academico mas que de un modelo de produccion. No es un modelo generativo autonomo: requiere cargar los pesos base de SD 1.5 y aplicar el adaptador con `diffusers`.

Su relevancia es limitada y muy acotada: sirve como ejemplo reproducible de un pipeline de fine-tuning con LoRA sobre UNet (solo adaptadores en las proyecciones de atencion `to_k`, `to_q`, `to_v` y `to_out.0`), con 3,19 millones de parametros entrenables (0,37% del UNet) y un coste de computo de 0,663 GPU-horas en una Tesla T4. Los resultados reportados muestran un empeoramiento respecto al modelo base en las metricas automaticas (KID in-domain 0,1307 frente a 0,1151 del base; CLIP score 22,92 frente a 26,05), lo que indica que el adaptador captura estilo a costa de cierta perdida de fidelidad al prompt.

El modelo no es un LLM y no procesa lenguaje de forma autoregresiva: es un adaptador de difusion texto-a-imagen. No dispone de ventana de contexto, tool calling ni capacidades de razonamiento. Su uso esta restringido a investigacion academica no comercial por la naturaleza de las imagenes de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (adaptadores en `to_k`, `to_q`, `to_v`, `to_out.0`) |
| Parametros totales | 3.188.736 parametros entrenables (0,37% del UNet); el modelo base SD 1.5 tiene ~860M en UNet |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de difusion texto-a-imagen) |
| Tipos de cuantizacion | no disponible (pesos LoRA en fp16 segun entrenamiento; no se documentan otras cuantizaciones) |
| Idiomas soportados | no disponible (prompts en ingles segun captions BLIP del dataset) |
| Licencia | CreativeML OpenRAIL-M (heredada de SD 1.5); uso declarado solo para investigacion academica no comercial |
| Formato de pesos | safetensors via `diffusers` (repo de 0,3 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 aplicado exclusivamente a las capas de atencion del UNet de Stable Diffusion 1.5 (revision `451f4fe161`). No se modifican el VAE ni el text encoder CLIP. El entrenamiento uso el dataset `lambdalabs/naruto-blip-captions`, compuesto por 1221 imagenes con captions generados por BLIP; tras el filtrado (0 corruptas, 0 duplicadas) se emplearon 1099 imagenes para entrenamiento y 122 para test (split 90/10, semilla 266), con recorte central a 512x512 y los captions BLIP como prompts.

La configuracion de entrenamiento fue: 2000 pasos con batch 4 (7,28 epocas), optimizador AdamW con learning rate 1e-4, scheduler coseno, 100 pasos de warm-up, Min-SNR con gamma 5,0 y precision fp16. El coste total fue de 0,663 GPU-horas en una Tesla T4 con un pico de 3,22 GiB de memoria. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa; al ser un modelo de difusion, la inferencia se realizo con DPM-Solver++ a 30 pasos y CFG 7,5.

## Capacidades

- Generacion de imagenes texto-a-imagen en el estilo visual aprendido de la franquicia Naruto, condicionada por prompts en lenguaje natural.
- Transferencia de estilo anime sobre el modelo base SD 1.5; el adaptador modula la atencion del UNet sin alterar el text encoder.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no documentadas; los captions de entrenamiento estan en ingles, por lo que los prompts en otros idiomas no estan garantizados.
- No dispone de modo thinking, vision, audio ni otras capacidades especiales.
- Compatible con el pipeline `StableDiffusionPipeline` de `diffusers` mediante `load_lora_weights`.

## Casos de uso

- Investigacion academica sobre fine-tuning con LoRA: el adaptador sirve como referencia reproducible de un entrenamiento de bajo coste (0,663 GPU-horas en T4) para comparar configuraciones de rango, alpha y Min-SNR en tareas de estilo.
- Experimentos de evaluacion de metricas generativas: permite reproducir el calculo de KID, CLIP score y LPIPS con 20 prompts fijos y semillas 0/1, util para estudiar la varianza de estas metricas en muestras pequenas.
- Generacion de arte conceptual de estilo anime para prototipos internos no comerciales: con prompts genericos en ingles se obtienen imagenes con la estetica aprendida, adecuadas para maquetas o pruebas de concepto.
- Docencia sobre difusion: el repo permite ilustrar como se cargan pesos LoRA sobre SD 1.5 y como se comporta el modelo ante prompts fuera de dominio (deriva hacia el estilo anime).
- Estudio de sesgos y limitaciones de datasets auto-captionados: el modelo evidencia como los captions BLIP genericos impiden invocar personajes por nombre y degradan la composicion (colores, conteos, posiciones).
- Base para experimentos de merging de LoRAs: al ser un adaptador de rango 16 sobre SD 1.5, puede combinarse con otros adaptadores en entornos de investigacion para estudiar interacciones de estilo.

## Benchmarks y rendimiento

Resultados reportados por el autor con 20 prompts fijos y semillas 0/1, DPM-Solver++ a 30 pasos y CFG 7,5:

| Metrica | LoRA (este modelo) | SD 1.5 base |
|---|---|---|
| KID in-domain | 0,1307 ± 0,0088 | 0,1151 |
| CLIP score | 22,92 | 26,05 |
| LPIPS diversity | 0,769 | 0,754 |

No se han publicado resultados de benchmarks adicionales (FID, evaluacion humana cuantitativa) en la informacion disponible; la model card remite al informe del laboratorio para la evaluacion humana.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento uso un pico de 3,22 GiB en fp16 sobre Tesla T4; la inferencia con SD 1.5 + LoRA en fp16 requiere del orden de 4-6 GiB, aunque no se documenta una cifra exacta.
- GPU recomendadas: Tesla T4 (validada en entrenamiento), asi como cualquier GPU con al menos ~6 GiB para inferencia en fp16 (no verificado en la informacion disponible).
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores; no se documenta prueba explicita.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights` (metodo documentado); otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a modelos de difusion.
- Latencia y throughput: no disponibles; solo se reporta el coste de entrenamiento (0,663 GPU-horas, pico 3,22 GiB).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este LoRA (team26, r16) | LoRA sobre SD 1.5 | 3,19M entrenables | no aplica | KID 0,1307; CLIP 22,92 | CreativeML OpenRAIL-M (uso no comercial declarado) | HuggingFace, 13 descargas |
| SD 1.5 base | Difusion texto-a-imagen | ~860M UNet | no aplica | KID 0,1151; CLIP 26,05 | CreativeML OpenRAIL-M | Ampliamente disponible |
| Otros LoRAs de estilo anime sobre SD 1.5 | LoRA sobre SD 1.5 | variable | no aplica | no disponible | variable (habitualmente CreativeML OpenRAIL-M) | HuggingFace / Civitai |

No se dispone de datos de benchmarks de LoRAs alternativos de estilo anime en la informacion proporcionada, por lo que la comparacion cuantitativa con ellos no esta disponible.

## Limitaciones y advertencias

- Aprende el estilo de una unica franquicia a partir de ~1099 imagenes auto-captionadas; los captions genericos impiden solicitar personajes por nombre.
- Los prompts fuera de dominio derivan hacia el estilo anime, reduciendo el control sobre el resultado.
- Los prompts composicionales (colores, conteos, posiciones) suelen producir resultados incorrectos.
- El KID calculado sobre 20 imagenes es ruidoso (desviacion ± 0,0088), por lo que las comparaciones deben tomarse con cautela.
- Empeora las metricas automaticas respecto al modelo base: KID in-domain 0,1307 frente a 0,1151 y CLIP score 22,92 frente a 26,05.
- Las imagenes de entrenamiento representan personajes con copyright, por lo que el uso queda restringido a investigacion academica no comercial segun el autor, aunque los pesos heredan la licencia CreativeML OpenRAIL-M.
- Riesgo de sesgos derivados del dataset de origen (estetica anime, posible sobrerrepresentacion de ciertos personajes o escenas).
- Riesgo de alucinacion visual: el modelo puede generar detalles inconsistentes con el prompt, especialmente en composiciones complejas.
- Se recomienda mantener activo el safety checker de SD y no usar el modelo para imitar o suplantar a personas reales.
- Capacidades multilingues no documentadas; los prompts en castellano no estan garantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanabada/data266-team26-p2-naruto-run1-lora-r16
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Libreria diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
