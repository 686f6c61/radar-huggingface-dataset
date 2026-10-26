# Sneha-subbu/data266-lab2-p2-lora_r16

## Resumen

`data266-lab2-p2-lora_r16` es un adaptador LoRA de rango 16 para Stable Diffusion 1.5, publicado por Sneha-subbu (Sneha Singh y Ritika Neema, equipo 05) como resultado de la practica 2 de la asignatura DATA 266. El adaptador se ha entrenado sobre el dataset `reach-vb/pokemon-blip-captions` para desplazar el estilo de generacion del modelo base hacia ilustraciones tipo Pokemon, manteniendo la congelada la practica totalidad de los pesos de SD 1.5.

Tecnicamente es un adaptador pequeno: 3.188.736 parametros entrenables, 1.500 pasos con batch 4 a 512 px y un pico de 4,27 GB de VRAM en una NVIDIA L4, con un coste total de 0,2399 GPU-horas. No es un modelo de proposito general ni compite en la liga de los generadores de imagen actuales: es un artefacto docente reproducible, con evaluacion cuantitativa (KID, CLIP score, diversidad LPIPS) y una evaluacion humana ciega muy limitada (75 votos).

Su relevancia practica es acotada pero real: sirve como caso de estudio de fine-tuning con LoRA sobre difusion latente, como estilo base para prototipado interno no comercial y como ejemplo de medicion honesta de resultados, incluidos los negativos (el modelo base fue preferido por los evaluadores humanos en la mayoria de las comparaciones, pese a mejorar el KID). La model card advierte explicitamente de que las imagenes de entrenamiento contienen personajes con derechos de autor y restringe el uso a investigacion y docencia no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion 1.5: UNet de difusion latente + VAE + codificador de texto CLIP, congelados |
| Parametros totales | 3.188.736 parametros entrenables en el adaptador; el numero de parametros del modelo base no se indica en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de contexto conversacional; el prompt de texto queda limitado por el codificador CLIP de SD 1.5 (77 tokens, dato del modelo base, no declarado en la model card) |
| Tipos de cuantizacion | No disponible. El adaptador se carga sobre el modelo base, que en el ejemplo oficial se instancia en `float16`; no se documentan variantes GGUF, ONNX ni cuantizaciones del adaptador |
| Idiomas soportados | No disponible. El dataset de entrenamiento son captions BLIP en ingles y los prompts de evaluacion estan en ingles |
| Licencia | `creativeml-openrail-m`, con restriccion adicional del autor a uso no comercial (investigacion y trabajos de curso) por derechos de autor sobre las imagenes de entrenamiento |
| Formato de pesos | Repositorio `diffusers` con pesos LoRA; el formato exacto de fichero no se detalla y el tamano reportado del repo es 0.0 GB |

Datos adicionales de publicacion: 0 descargas, 0 likes, creado el 2026-10-25 segun metadatos del Hub.

## Arquitectura y entrenamiento

El adaptador se inyecta en las capas de atencion del UNet de Stable Diffusion 1.5 mediante descomposicion de bajo rango (rank 16). El modelo base permanece congelado y solo se optimizan 3.188.736 parametros, lo que explica el coste de entrenamiento: 0,2399 GPU-horas en una NVIDIA L4, equivalentes a unos 0,58 segundos por paso para 1.500 pasos con batch 4 a 512 px. El pico de memoria durante el entrenamiento fue de 4,27 GB.

Los datos son 750 imagenes de entrenamiento y 83 de test (semilla 266) del dataset `reach-vb/pokemon-blip-captions`, con captions generados por BLIP. Hiperparametros declarados: 512 px, 1.500 pasos, batch 4, learning rate 0,0001. La model card no especifica el optimizador, el scheduler de ruido, el uso de augmentacion ni si hubo etapas de RLHF o preferencia (no aplicables en un adaptador de difusion de este tipo). Tampoco se documenta la composicion completa del dataset mas alla de su origen.

Como control de memorizacion, los autores aplicaron una comprobacion de similitud CLIP mas distancia por tiles sobre 10 generaciones y no encontraron copias cercanas de las imagenes de entrenamiento.

## Capacidades

- Generacion de imagenes texto-a-imagen en el dominio aprendido: criaturas e ilustraciones con estetica de dibujo animado tipo Pokemon.
- Transferencia de estilo sobre el modelo base, manteniendo la composicion general y la estructura de SD 1.5.
- Compatibilidad con el ecosistema `diffusers`: carga mediante `load_lora_weights` sobre `stable-diffusion-v1-5/stable-diffusion-v1-5`.
- Control de la generacion mediante los parametros habituales de SD 1.5 (prompt, negative prompt, guidance scale, numero de pasos, semilla); la evaluacion oficial usa 30 pasos y guidance 7.5.
- Generacion por lotes con semillas fijas, lo que permite reproducir exactamente las comparaciones de la model card (semillas 0 y 1).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo "thinking": no aplica a un adaptador de difusion.
- Capacidad multilingue: no disponible; la evidencia disponible solo cubre prompts en ingles.

## Casos de uso

- Docencia y replicacion de practicas: reproduccion exacta del experimento (750/83 imagenes, 1.500 pasos, lr 1e-4) para comparar el efecto del rango LoRA frente al modelo base con las mismas 20 prompts y semillas 0 y 1.
- Prototipado de arte conceptual interno: generacion rapida de ilustraciones de criaturas para maquetas, presentaciones o documentos de diseno no comerciales, con la advertencia de que el estilo imita personajes con derechos de autor.
- Generacion de assets de relleno en prototipos de videojuego o interfaces: placeholders de criaturas y sprites a 512 px que se sustituyen por arte final antes de publicar.
- Aumento de datos sinteticos para pruebas de pipelines: crear un conjunto de imagenes de estilo cartoon para validar clasificadores, detectores o sistemas de moderacion antes de disponer del dataset real.
- Estudio de fallos composicionales: el adaptador rinde peor en prompts composicionales (27,8% de preferencia humana), lo que lo convierte en un banco de pruebas util para investigar el binding de atributos, conteos y relaciones espaciales en modelos de difusion.
- Evaluacion de infraestructura de inferencia: con un pico de 4,27 GB en entrenamiento y pesos de adaptador de apenas unos megabytes, sirve para medir latencia, throughput y consumo de VRAM de distintos backends y schedulers en GPUs de gama media.
- Demostraciones interactivas en Spaces o Gradio: demo ligera para clase o taller, ya que el modelo completo cabe en GPUs de consumo con `float16`.

## Benchmarks y rendimiento

Evaluacion oficial sobre 20 prompts fijos, semillas 0 y 1, 512 px, 30 pasos y guidance 7.5:

| Modelo | KID (menor es mejor) | CLIP score (mayor es mejor) | Diversidad LPIPS (mayor es mas diverso) |
|---|---|---|---|
| Stable Diffusion 1.5 (base) | 0,0602 | 0,322 | 0,735 |
| lora_r16 (este adaptador) | 0,0231 | 0,316 | 0,712 |

Evaluacion humana ciega (25 pares, 3 evaluadores, 75 votos):

| Metrica | Resultado |
|---|---|
| Preferencia global frente al base | 38,7% de los votos (IC 95%: 28,5-50,0%) |
| Preferencia en prompts del dominio | 41,0% |
| Preferencia en prompts fuera de dominio | 44,4% |
| Preferencia en prompts composicionales | 27,8% |

Lectura: el adaptador mejora claramente el KID (0,0231 frente a 0,0602), es decir, se acerca mas a la distribucion de las imagenes reales del dominio, a costa de un CLIP score ligeramente inferior (0,316 frente a 0,322) y de una diversidad algo menor (0,712 frente a 0,735). En la evaluacion humana, el modelo base fue preferido en la mayoria de los pares, y el intervalo de confianza de la preferencia del LoRA incluye el 50%, por lo que la diferencia no es concluyente con 75 votos. No hay resultados de MMLU, HumanEval ni GSM8K porque el modelo no es un LLM.

## Requisitos de hardware

- VRAM de inferencia estimada: aproximadamente 4-6 GB con el modelo base en `float16` a 512 px, dado que solo se anaden 3,19 M de parametros al adaptador; en `float32` el modelo base requiere del orden del doble. Cifra estimada, no medida en la model card.
- VRAM de entrenamiento medida: pico de 4,27 GB con batch 4 a 512 px en una NVIDIA L4.
- GPU utilizada en el entrenamiento: NVIDIA L4 (0,2399 GPU-horas para 1.500 pasos, aproximadamente 0,58 s/paso).
- GPU recomendadas para inferencia: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) para 512 px sin trucos; A100 o H100 solo tienen sentido para generacion por lotes a gran volumen.
- Cabe en GPU de consumo: si, en tarjetas de 6-8 GB con `float16` y atencion optimizada o slicing; en tarjetas de 4 GB requiere tecnicas adicionales de ahorro de memoria.
- Opciones de despliegue: `diffusers` + PyTorch (flujo documentado), ComfyUI y AUTOMATIC1111/Forge cargando el LoRA sobre un checkpoint SD 1.5, ademas de endpoints gestionados que acepten repositorios `diffusers`. No procede vLLM ni TGI para este tipo de modelo.
- Latencia y throughput de inferencia: no disponible. Solo se conoce el rendimiento de entrenamiento declarado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lora_r16 (este adaptador) | 3.188.736 entrenables sobre SD 1.5 | 512 px, prompt limitado por CLIP | KID 0,0231; CLIP 0,316; preferencia humana 38,7% | `creativeml-openrail-m` + restriccion no comercial del autor | Publico en HF, 0 descargas |
| Stable Diffusion 1.5 (base, sin adaptador) | No indicado en la informacion disponible | 512 px | KID 0,0602; CLIP 0,322; referencia de la comparacion humana | `creativeml-openrail-m` | Ampliamente disponible |
| `Charvee/data266-lab2-charvee-018370859-lora-r16` | No disponible | No disponible | No disponible | No disponible | Publico en HF; parece otro adaptador LoRA r16 de la misma practica, sin datos de evaluacion accesibles |

No se han identificado en la informacion proporcionada otros adaptadores comparables con metricas publicadas. Los resultados de busqueda sobre LoRAs llamados "Sneha" en TensorHub, Tensor.Art y Civitai corresponden a modelos distintos y sin relacion con este repositorio.

## Limitaciones y advertencias

- Fallos composicionales: los prompts con varios objetos, atributos o conteos pierden elementos con frecuencia; es el punto mas debil segun la evaluacion humana (27,8% de preferencia).
- Repeticion de estilo: la model card indica que la misma apariencia de criatura se repite en prompts no relacionados, lo que reduce la variedad util del adaptador.
- Deriva fuera de dominio: ante prompts ajenos al dominio, la salida tiende al estilo cartoon aunque no se solicite.
- Dataset muy pequeno (750 imagenes de entrenamiento) y de una unica fuente, lo que limita la generalizacion y aumenta el riesgo de sobreajuste al estilo.
- Evidencia humana debil: 75 votos de 3 evaluadores, con un intervalo de confianza del 28,5% al 50,0%; el modelo base fue preferido en la mayoria de los pares, por lo que no puede afirmarse una mejora subjetiva.
- Riesgo de alucinacion visual: no aplica el concepto de alucinacion textual, pero si la generacion de morfologias incoherentes (extremidades duplicadas, ojos o detalles sin sentido) frecuentes en LoRAs de bajo rango.
- Licencia: la etiqueta del Hub es `creativeml-openrail-m`, que permite uso comercial con restricciones, pero la model card del autor restringe explicitamente el uso a investigacion y docencia no comercial. Ante este conflicto, la restriccion mas conservadora debe prevalecer.
- Derechos de autor: las imagenes de entrenamiento contienen personajes protegidos; no deben usarse las salidas con fines comerciales ni redistribuirse como arte original.
- Sin garantias de produccion: no hay resultados de latencia, throughput ni pruebas de robustez; es un artefacto de curso, sin mantenimiento declarado (0 descargas, 0 likes, repositorio de 0.0 GB reportado).
- Idiomas: sin evidencia de funcionamiento con prompts en castellano; el entrenamiento y la evaluacion se hicieron con captions en ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sneha-subbu/data266-lab2-p2-lora_r16
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Adaptador similar de la misma practica (otro equipo): https://huggingface.co/Charvee/data266-lab2-charvee-018370859-lora-r16
- Documentacion de `diffusers` para carga de LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
