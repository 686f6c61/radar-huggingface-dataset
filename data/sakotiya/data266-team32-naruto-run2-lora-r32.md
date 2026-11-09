# sakotiya/data266-team32-naruto-run2-lora-r32

## Resumen

`sakotiya/data266-team32-naruto-run2-lora-r32` es un adaptador LoRA para Stable Diffusion 1.5 que especializa el modelo base en la generacion de imagenes con el estilo visual de la serie de anime Naruto. Lo desarrolla el usuario `sakotiya` en el marco de un laboratorio academico (DATA 266 Lab 2, Part 2, Pair_Programming_Team_32) y se publica como un experimento comparativo de ajuste fino de bajo rango sobre un modelo de difusion texto-a-imagen.

El adaptador se entrena sobre el dataset `lambdalabs/naruto-blip-captions`, del que se conservan 1221 imagenes tras la limpieza, y aplica LoRA de rango 32 exclusivamente sobre las capas de atencion del UNet. Con 6.377.472 parametros entrenables y 1500 pasos de entrenamiento, el resultado es un adaptador ligero que modifica el estilo de salida sin alterar los pesos del modelo base, lo que permite cargarlo y descargarlo dinamicamente en un pipeline de `diffusers`.

Su relevancia es acotada: se trata de un artefacto educativo y de investigacion, no de un modelo de produccion. Aporta, eso si, una comparacion cuantitativa honesta frente a SD 1.5 (KID, CLIP score y LPIPS entre semillas) que resulta util para entender el efecto real de un LoRA de estilo sobre la fidelidad al dominio frente a la alineacion texto-imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion 1.5; difusion latente texto-a-imagen |
| Parametros totales | No disponible (adaptador LoRA; el modelo base SD 1.5 tiene ~983 M en UNet) |
| Parametros activos | No aplica (no es MoE) |
| Parametros entrenables | 6.377.472 |
| Longitud de contexto | No aplica (modelo texto-a-imagen; sin ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (entrenado y publicado en fp16) |
| Idiomas soportados | No disponible (las prompts son texto libre; el dataset usa leyendas BLIP en ingles) |
| Licencia | CreativeML OpenRAIL-M (modelo base); uso no comercial por copyright de Naruto |
| Formato de pesos | Pesos de adaptador LoRA compatibles con `diffusers` (safetensors no confirmado) |
| Resolucion de entrenamiento | 512 x 512 |
| Rango LoRA | 32 |
| Modelo base | `stable-diffusion-v1-5/stable-diffusion-v1-5` |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 32 sobre las capas de atencion del UNet de Stable Diffusion 1.5, manteniendo congelados los pesos del modelo base. El entrenamiento se realizo sobre el dataset `lambdalabs/naruto-blip-captions`, reducido a 1221 imagenes tras un proceso de limpieza y dividido en 1099 de entrenamiento y 122 de test con semilla 266 (split 90/10). Las leyendas asociadas son descripciones cortas generadas con BLIP, en ingles.

La configuracion de entrenamiento fue de 1500 pasos, batch de 4, learning rate de 0.0001 y precision fp16, ejecutado en una unica GPU Tesla T4 con un tiempo total de 42,9 minutos y un pico de memoria de 3,6 GB. No se documenta uso de RLHF, DPO ni tecnicas de preferencia; se trata de un ajuste supervisado estandar de difusion condicionada por texto. El autor lo etiqueta como "comparison run" (run2), lo que sugiere que forma parte de una serie de experimentos con distintas configuraciones de rango o hiperparametros.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512x512 con estilizacion hacia el universo Naruto.
- Transferencia de estilo sobre el modelo base SD 1.5 sin modificar sus pesos.
- Carga y descarga dinamica del adaptador mediante `pipe.load_lora_weights()` en `diffusers`.
- Composicion con otros LoRA o con el modelo base, al ser un adaptador independiente.
- Condicionamiento por prompt de texto libre (leyendas cortas, en linea con el entrenamiento con BLIP).
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades adicionales (audio, video).
- Capacidades multilingues no documentadas; el entrenamiento se realizo con leyendas en ingles.

## Casos de uso

- Investigacion sobre ajuste fino de difusion: permite reproducir el experimento de LoRA r32 sobre SD 1.5 y comparar metricas (KID, CLIP, LPIPS) con otras configuraciones del mismo laboratorio.
- Generacion de arte conceptual con estetica anime: util para prototipar ilustraciones de estilo Naruto en fases de preproduccion, siempre en ambito no comercial.
- Docencia en cursos de vision por computador: ejemplo completo y ligero (3,6 GB de pico, 42,9 min en T4) de pipeline de entrenamiento LoRA con `diffusers`.
- Evaluacion de metricas de fidelidad vs. alineacion: sirve para estudiar el trade-off entre KID (mejora de 0,1243 a 0,0761) y CLIP score (caida de 31,88 a 29,33) al especializar un modelo.
- Pruebas de composicion de adaptadores: al ser un LoRA independiente, se puede combinar con otros adaptadores de estilo para experimentar con mezclas.
- Generacion de datasets sinteticos etiquetados por estilo: util para aumentar corpus de anime en tareas de clasificacion o deteccion, con las cautelas de copyright correspondientes.
- Benchmarking de infraestructura de inferencia: modelo de referencia ligero para medir latencia de pipelines `diffusers` con DPM-Solver++ a 30 pasos y guidance 7.5.

## Benchmarks y rendimiento

Resultados reportados por el autor: 20 prompts x 2 semillas, 30 pasos de DPM-Solver++, guidance 7.5.

| Metrica | Este LoRA | SD 1.5 base |
|---|---|---|
| KID in-domain (menor es mejor) | 0,0761 | 0,1243 |
| CLIP score (mayor es mejor) | 29,33 | 31,88 |
| LPIPS entre semillas | 0,722 | 0,806 |

No se han publicado resultados de benchmarks adicionales (FID, MMLU, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 4-6 GB en fp16 para SD 1.5 con el LoRA cargado a 512x512 (no confirmado por el autor; el pico de entrenamiento fue de 3,6 GB en T4).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; Tesla T4, RTX 3060, RTX 4060, RTX 4090, A100 y H100 son validas.
- Cabe en GPU de consumo: si, en modelos con 6 GB o mas (RTX 3060 en adelante); en GPUs con menos VRAM puede requerir `enable_attention_slicing` o `enable_model_cpu_offload`.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` + `load_lora_weights`; tambien es compatible con ComfyUI y Automatic1111/Forge mediante carga de LoRA, y con `diffusers` + `torch.compile` para acelerar.
- Latencia y throughput estimados: no disponibles. El autor solo reporta tiempos de entrenamiento (42,9 min en T4 para 1500 pasos).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros entrenables | Contexto / resolucion | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Este LoRA (r32) | LoRA sobre SD 1.5 | 6.377.472 | 512x512 | KID 0,0761; CLIP 29,33 | OpenRAIL-M (uso no comercial por copyright) |
| SD 1.5 base | Difusion texto-a-imagen | ~983 M (UNet) | 512x512 | KID 0,1243; CLIP 31,88 | CreativeML OpenRAIL-M |
| Otros LoRA de estilo Naruto en el Hub | LoRA sobre SD 1.5 | Variable (no disponible) | 512x512 | No disponible | Variable (habitualmente OpenRAIL-M) |

No se dispone de datos de benchmarks de terceros en la informacion proporcionada para establecer comparaciones adicionales.

## Limitaciones y advertencias

- Entrenado con aproximadamente 1100 imagenes de un unico estilo anime y leyendas BLIP cortas: las prompts fuera de dominio tienden a ser arrastradas hacia ese estilo.
- Hereda los sesgos de Stable Diffusion 1.5, incluidos sesgos demograficos y culturales del dataset original.
- Riesgo de alucinacion visual: puede generar personajes o elementos inexistentes en la serie al combinarse con prompts ambiguas.
- El CLIP score cae respecto al base (29,33 frente a 31,88), lo que indica menor alineacion texto-imagen en prompts genericas.
- Los personajes de Naruto estan protegidos por copyright (Masashi Kishimoto / Shueisha); el autor restringe el uso a investigacion no comercial.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso adicionales que deben revisarse antes de cualquier despliegue.
- No hay informacion sobre cuantizaciones, formatos alternativos ni soporte multilingue.
- Repositorio con 0 descargas y 0 likes: sin validacion externa de la comunidad.
- Fecha de creacion registrada en 2026-11-09, posterior a la fecha de esta ficha; conviene verificar la integridad del artefacto antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/sakotiya/data266-team32-naruto-run2-lora-r32
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Libreria: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
