# Arpansin/naruto-sd15-lora-r4

## Resumen

`Arpansin/naruto-sd15-lora-r4` es un adaptador LoRA de rango 4 entrenado sobre Stable Diffusion 1.5 para generar imagenes con estilo y personajes de Naruto a 512x512. Lo desarrolla el usuario Arpansin como parte de un proyecto de curso (DATA 266, Lab 2, Part 2) y funciona como ejecucion comparativa frente a la variante final de rango 32 (`naruto-sd15-lora-r32`). El adaptador se aplica unicamente a las capas de atencion del UNet, con 797.184 parametros entrenables (0,093% del UNet), y se carga mediante `pipe.load_lora_weights` en la libreria diffusers.

El modelo resuelve un caso acotado: inyectar un dominio visual concreto (personajes y estetica de Naruto) en un pipeline text-to-image estandar sin reentrenar el modelo base. Su relevancia es principalmente didactica y de investigacion: sirve para estudiar el efecto del rango LoRA en la fidelidad al prompt, la diversidad y la memorizacion del dataset de entrenamiento. No esta pensado para produccion ni para uso comercial.

La informacion publicada es limitada: el repositorio aparece con 0 descargas y 0 likes, sin licencia declarada en los metadatos de Hugging Face, y el propio autor restringe el uso a investigacion y fines no comerciales. Los resultados reportados (KID 0,036, CLIP score 31,73) proceden de una evaluacion con solo 20 prompts y 2 semillas, por lo que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (adaptador de atencion, rango 4) |
| Parametros totales | 797.184 parametros entrenables (0,093% del UNet); total del modelo base no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; resolucion de salida 512x512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en texto; el dataset usa captions BLIP) |
| Licencia | no disponible en metadatos; el autor declara uso solo para investigacion y no comercial, sujeto ademas a CreativeML OpenRAIL-M del modelo base |
| Formato de pesos | no disponible (adaptador LoRA compatible con diffusers; el tamano del repo figura como 0.0 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 4 y alpha 4 aplicado exclusivamente a las capas de atencion del UNet de Stable Diffusion 1.5, manteniendo congelado el resto del modelo base. Se entreno sobre el dataset `lambdalabs/naruto-blip-captions`, con 1.065 imagenes de entrenamiento y un split 90/10 con semilla 266. La configuracion fue de 1.500 pasos, batch efectivo de 16, learning rate de 1e-4 y semilla 266. El pico de memoria GPU fue de 2,65 GiB y el coste total de 0,446 GPU-horas, lo que indica un entrenamiento ligero y reproducible en hardware de gama media.

No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal ni tecnicas de RLHF/DPO); se trata de un fine-tuning supervisado estandar de un adaptador de bajo rango. El autor lo presenta como ejecucion de comparacion frente a la variante de rango 32, que es la seleccionada como final, lo que sugiere que el objetivo era medir el impacto del rango en la calidad y la memorizacion.

## Capacidades

- Generacion de imagenes text-to-image a 512x512 sobre el pipeline de Stable Diffusion 1.5.
- Especializacion en estetica y personajes de Naruto mediante el adaptador LoRA.
- Carga directa en diffusers con `pipe.load_lora_weights("Arpansin/naruto-sd15-lora-r4")`.
- Compatible con el ecosistema de Stable Diffusion 1.5 (schedulers, negative prompts, img2img, inpainting segun el pipeline que se combine).
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de difusion).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el modelo base SD 1.5 tiene un tokenizador CLIP orientado principalmente al ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre LoRA de bajo rango: el adaptador permite comparar directamente rango 4 frente a rango 32 sobre el mismo dataset y configuracion, midiendo KID, CLIP score y diversidad LPIPS para estudiar el compromiso entre fidelidad y memorizacion.
- Docencia y proyectos de curso: sirve como ejemplo reproducible de fine-tuning de difusion con un coste de 0,446 GPU-horas y 2,65 GiB de pico de memoria, adecuado para laboratorios con GPUs de consumo.
- Prototipado de ilustracion fan-art: genera bocetos de personajes de Naruto a 512x512 que pueden servir como base para retoque manual, siempre en un contexto de investigacion y no comercial.
- Generacion de datasets sinteticos controlados: permite producir imagenes de dominio especifico para experimentos de aumento de datos o evaluacion de clasificadores, asumiendo el riesgo de memorizacion del dataset original.
- Estudio de seguridad y sesgos en difusion: el hecho de que 2 de 40 imagenes fueran marcadas por el safety checker lo convierte en un caso util para analizar falsos positivos y comportamiento del filtro.
- Evaluacion de pipelines de inferencia: al ser un adaptador pequeno, es adecuado para probar integraciones con diffusers, schedulers alternativos y flujos img2img en entornos de laboratorio.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 20 prompts y 2 semillas (40 imagenes):

| Metrica | Este modelo (r=4) | Base SD 1.5 | Variante r=32 |
|---|---|---|---|
| KID (menor es mejor) | 0,036 | 0,106 | 0,015 |
| CLIP score | 31,73 | no disponible | no disponible |
| Diversidad LPIPS | 0,704 | no disponible | no disponible |
| Imagenes marcadas por safety checker | 2 de 40 | no disponible | no disponible |
| Similitud media con imagen de entrenamiento mas cercana | 0,74 | no disponible | no disponible |
| Similitud maxima con imagen de entrenamiento mas cercana | 0,90 | no disponible | no disponible |

El propio autor advierte que el KID se calcula con solo 20 imagenes generadas y es ruidoso. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento requirio un pico de 2,65 GiB, por lo que la inferencia con SD 1.5 a 512x512 en fp16 deberia situarse en un rango similar o inferior en GPUs modernas.
- GPU recomendadas: no disponible; por el tamano del modelo base, cualquier GPU con al menos 4-6 GB de VRAM es candidata, incluidas RTX 3060, RTX 4060 y superiores.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs consumer con 4 GB o mas de VRAM, aunque el dato exacto no esta publicado.
- Opciones de despliegue: diffusers (via `load_lora_weights`); compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible (no aplican a difusion). Alternativas como ComfyUI o A1111 no estan documentadas en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros del adaptador | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Arpansin/naruto-sd15-lora-r4` | 797.184 entrenables (r=4) | 512x512 | KID 0,036; CLIP 31,73 | Solo investigacion y no comercial (metadatos sin licencia) | Hugging Face, 0 descargas |
| `naruto-sd15-lora-r32` (misma autoria) | no disponible (r=32) | 512x512 | KID 0,015 | Solo investigacion y no comercial | Hugging Face |
| Stable Diffusion 1.5 (base) | no aplica | 512x512 | KID 0,106 | CreativeML OpenRAIL-M | Ampliamente disponible |
| Otros LoRA de Naruto para SD 1.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Menor adherencia al prompt que el modelo base, segun reconoce el propio autor.
- Dataset pequeno y de una unica fuente (1.065 imagenes de `lambdalabs/naruto-blip-captions`), lo que limita la variedad y puede introducir sesgos de estilo y composicion.
- Senal de memorizacion: similitud media de 0,74 y maxima de 0,90 con la imagen de entrenamiento mas cercana, inferior a la variante r=32 pero no despreciable.
- Riesgo de alucinacion visual y de artefactos propios de SD 1.5 a 512x512, especialmente en manos, texto y composiciones complejas.
- Limitaciones de idioma: el tokenizador CLIP del modelo base esta orientado al ingles; el rendimiento con prompts en castellano no esta documentado.
- Restricciones de licencia: uso solo para investigacion y no comercial; los datos de entrenamiento representan personajes con derechos de autor y el dataset card no declara licencia. Aplican ademas las restricciones de CreativeML OpenRAIL-M del modelo base.
- El safety checker marco 2 de 40 imagenes, lo que indica posibles falsos positivos que conviene gestionar en cualquier flujo automatizado.
- Evaluacion muy limitada (20 prompts, 2 semillas) y KID ruidoso; los numeros no deben tomarse como conclusiones robustas.
- Repositorio sin traccion (0 descargas, 0 likes) y sin licencia declarada en metadatos, lo que anade incertidumbre sobre su mantenimiento y reutilizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arpansin/naruto-sd15-lora-r4
- Modelo base Stable Diffusion 1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Variante final r=32 citada por el autor: no disponible (no se proporciona URL)
- Paper o blog del modelo: no disponible
- Repositorio de codigo o demo: no disponible
