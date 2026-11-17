# chels512/data266-lab2-naruto-run1-lora-r8

## Resumen

`chels512/data266-lab2-naruto-run1-lora-r8` es un adaptador LoRA de rango 8 entrenado sobre Stable Diffusion 1.5 (512x512) para la generacion de imagenes de estilo anime inspiradas en personajes de Naruto. Lo desarrolla el usuario chels512 en el contexto de un laboratorio docente (etiqueta `data266-lab2`), y su proposito es demostrar el ajuste fino eficiente de un modelo de difusion text-to-image mediante LoRA sobre un conjunto de datos pequeno y acotado.

El modelo resuelve el problema de especializar un generador text-to-image generico hacia un dominio visual concreto (caras y personajes de anime tipo Naruto) sin reentrenar el UNet completo: solo se entrenan 1.594.368 parametros, con un coste de 0,666 horas de GPU en una Tesla T4 y un pico de memoria de 3,68 GB. Esto lo convierte en un ejemplo practico de fine-tuning de bajo coste.

Es relevante ahora como material de referencia y ensenanza sobre pipelines de difusion con LoRA, no como modelo de produccion: el repositorio pesa 0,0 GB (pesos no publicados en el momento de la consulta), tiene 0 descargas y sus propios resultados muestran una mejora clara en KID dentro del dominio pero un empeoramiento del CLIP score y deriva estilistica fuera de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 8, alpha 8) sobre UNet de Stable Diffusion 1.5; modulos `to_q, to_k, to_v, to_out.0` |
| Parametros totales | 1.594.368 parametros entrenables (adaptador LoRA); el modelo base SD 1.5 no se incluye |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (no se documentan variantes fp16/int8/GGUF del adaptador) |
| Idiomas soportados | no disponible (las etiquetas de texto provienen de BLIP auto-captions, presumiblemente en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | no disponible (libreria diffusers; tamano del repo 0,0 GB en la consulta) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 y alpha 8 aplicado a las proyecciones de atencion del UNet de Stable Diffusion 1.5 (`to_q`, `to_k`, `to_v`, `to_out.0`). El modelo base opera a 512x512 y es un modelo de difusion latente text-to-image clasico; el adaptador solo modifica la atencion del UNet, dejando intactos el VAE y el text encoder.

El entrenamiento se realizo sobre el dataset `lambdalabs/naruto-blip-captions`, con 1.099 imagenes tras eliminar corruptas y duplicadas y una particion de test del 10 % (semilla 266). Se ejecutaron 1.500 pasos con batch 2 y acumulacion de gradiente 2 (batch efectivo 4), learning rate 1e-4 con scheduler coseno y 100 pasos de warmup, precision mixta fp16 y semilla 266. El coste fue de 0,666 horas de GPU en una Tesla T4 con un pico de 3,68 GB de memoria. Las captions de entrenamiento son auto-captions generadas con BLIP, cortas y genericas, lo que condiciona la calidad del condicionamiento textual.

## Capacidades

- Generacion text-to-image de retratos y personajes de estilo anime inspirados en Naruto, a resolucion 512x512.
- Especializacion estilistica: el adaptador desplaza la distribucion de salida del SD 1.5 base hacia caras de anime tipo Naruto (KID in-domain de 0,0359 frente a 0,103 del base).
- Integracion con el ecosistema diffusers mediante `load_lora_weights`, combinable con el pipeline estandar de Stable Diffusion 1.5.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de difusion para imagenes.
- No dispone de modo thinking, vision, audio ni capacidades multimodales mas alla del condicionamiento texto-imagen.
- Capacidades multilingues: no documentadas; las captions de entrenamiento son BLIP auto-captions, presumiblemente en ingles.
- Filtro de seguridad NSFW del pipeline de SD activo por defecto (no es un filtro completo).

## Casos de uso

- Docencia y practicas de fine-tuning: sirve como ejemplo reproducible de entrenamiento LoRA sobre SD 1.5 con coste inferior a una hora de T4, util para asignaturas de generacion y difusion.
- Experimentacion con LoRA en diffusers: permite probar la carga y combinacion de adaptadores (`load_lora_weights`) en pipelines existentes sin reentrenar el modelo base.
- Generacion de arte conceptual de estilo anime: para bocetos de personajes con estetica Naruto en entornos de investigacion no comercial.
- Investigacion sobre evaluacion de modelos generativos: sus metricas (KID, CLIP score, LPIPS) sirven para estudiar como un adaptador de bajo rango altera fidelidad y diversidad.
- Estudio de deriva de dominio: util para analizar como un adaptador estrecho desplaza prompts fuera de dominio hacia caras tipo Naruto, un fenomeno relevante en investigacion sobre sesgo de estilo.
- Prototipado de datasets sinteticos: generar variaciones de caras anime para aumentar datasets de investigacion, siempre respetando la restriccion no comercial por copyright de los personajes.

## Benchmarks y rendimiento

Resultados publicados en el notebook `notebooks/p2_finetune.ipynb` del autor:

| Metrica | Base SD 1.5 | run1_lora_r8 |
|---|---|---|
| KID in-domain (media) | 0,103 | 0,0359 |
| KID in-domain (desviacion) | 0,0098 | 0,0058 |
| CLIP score (todas, 40) | 31,5 | 30,72 |
| CLIP score in-domain | 30,14 | 28,66 |
| LPIPS diversidad | 0,7187 | 0,721 |
| Imagenes marcadas NSFW | 0 | 2 |
| GPU-hours | no disponible | 0,666 |
| Pico de memoria (GB) | no disponible | 3,68 |
| Tasa de victoria humana en estilo vs base | no disponible | no disponible (None) |
| Tasa de victoria humana en prompt vs base | no disponible | no disponible (None) |

El adaptador mejora sustancialmente el KID dentro de dominio (0,0359 frente a 0,103) pero reduce el CLIP score tanto global (30,72 frente a 31,5) como in-domain (28,66 frente a 30,14). La diversidad LPIPS se mantiene practicamente igual (0,721 frente a 0,7187). El KID se calcula con solo 20 imagenes, por lo que es ruidoso.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa muy poco (1,59 M parametros); el grueso corresponde al SD 1.5 base, que en fp16 requiere aproximadamente 4-6 GB de VRAM para inferencia a 512x512.
- Entrenamiento verificado: Tesla T4 con pico de 3,68 GB de memoria y 0,666 horas de GPU para 1.500 pasos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para inferencia del base en fp16; T4, RTX 3060/4060, RTX 4090, A100 y H100 son adecuadas segun el volumen de generacion.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas (por ejemplo RTX 3060, RTX 4060, RTX 4090) usando fp16 y el pipeline estandar de diffusers.
- Opciones de despliegue: diffusers (`StableDiffusionPipeline` + `load_lora_weights`); no se documentan variantes para llama.cpp, Ollama, vLLM ni TGI, que no aplican a modelos de difusion de este tipo.
- Latencia y throughput: no disponibles; solo se conoce el coste de entrenamiento (0,666 GPU-hours en T4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chels512/data266-lab2-naruto-run1-lora-r8 | 1,59 M entrenables (LoRA r8) | 512x512 | KID in-domain 0,0359; CLIP 30,72 | creativeml-openrail-m | Hugging Face (0 descargas) |
| Stable Diffusion 1.5 (base) | ~860 M (UNet) | 512x512 | KID in-domain 0,103; CLIP 31,5 | creativeml-openrail-m | Ampliamente disponible |
| Otros LoRA de anime sobre SD 1.5 | no disponible | 512x512 | no disponible | variable | Hugging Face |

La comparativa directa solo es posible con el modelo base, ya que no se dispone de datos de benchmarks de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Copyright: los personajes de Naruto estan protegidos; el autor restringe explicitamente el adaptador a investigacion y docencia no comercial.
- Captions de entrenamiento generadas con BLIP: cortas, genericas y a veces incorrectas, lo que degrada el condicionamiento textual (CLIP score inferior al base).
- Estilo estrecho: predominan caras de anime, por lo que los prompts fuera de dominio derivan hacia caras tipo Naruto.
- Prompts composicionales poco fiables: recuentos y vinculacion de colores no se resuelven de forma consistente.
- KID calculado con solo 20 imagenes: metrica ruidosa, poco representativa.
- Filtro NSFW: el pipeline de SD marca 2 imagenes como NSFW; el safety checker no es un filtro completo.
- Riesgo de alucinacion visual: al ser un modelo de difusion, puede generar atributos inexistentes o incorrectos respecto al prompt.
- Sin datos de evaluacion humana: las tasas de victoria frente al base figuran como no disponibles (None).
- Repositorio de 0,0 GB y 0 descargas en la consulta: los pesos pueden no estar publicados o no ser accesibles; verificar antes de usarlo.
- No apto para produccion comercial ni para generacion de contenido de personajes con derechos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chels512/data266-lab2-naruto-run1-lora-r8
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Notebook de resultados citado en la model card: `notebooks/p2_finetune.ipynb` (no se proporciona URL publica)
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
