# Quiho/Anima-2.9B-P1-Turbo1.1_Unofficial_Merge_p1-turbo1.1_checkpoint

## Resumen

Anima-2.9B-P1-Turbo1.1 (Unofficial Merge) es un checkpoint de difusion para generacion de imagenes de estilo anime, publicado por el usuario Quiho en Hugging Face. Se trata de un merge no oficial de dos modelos de la familia Anima: Anima 2.9B Preview 1 y Anima Turbo 1.1, ambos atribuidos en la model card a Langzaigg y a CircleStone Labs. El objetivo declarado del autor es combinar la velocidad de muestreo reducido de la variante Turbo con la calidad, el conocimiento de personajes y artistas y el rendimiento NSFW de la version Preview 1.

El resultado es un UNET completo de aproximadamente 5,4 GiB en BF16, compuesto por 40 bloques, que se carga directamente como modelo de difusion sin necesidad de LoRA ni de nodos de parcheo. El modelo esta pensado para flujos de trabajo tipo ComfyUI con un CLIP de Qwen 3 0.6B y el VAE de Qwen Image, y esta optimizado para generar imagenes en 8 pasos con el sampler euler y el scheduler sgm_uniform.

La relevancia de esta ficha es limitada pero concreta: se trata de un derivado comunitario de descargas y likes nulos en el momento de la consulta, sin licencia declarada y marcado como no apto para todas las audiencias. Resulta util como ejemplo de merge por bloques en el ecosistema de difusion anime, pero no debe confundirse con un lanzamiento oficial de Anima ni asumirse su estabilidad en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion (transformer convolucional) para text-to-image, 40 bloques |
| Parametros totales | no disponible (nombre comercial "2.9B", no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no de lenguaje) |
| Tipos de cuantizacion | BF16 en el checkpoint publicado; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (prompts en ingles segun los ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`anima29b-p1-turbo1.1.safetensors`, ~5,4 GiB) |

## Arquitectura y entrenamiento

El modelo es un UNET de difusion completo obtenido mediante un merge por bloques de dos checkpoints previos. Segun la model card, los bloques compartidos entre ambos modelos se combinan con un peso de 0,8 para Turbo 1.1 y 0,2 para 2.9B Preview 1, mientras que los 12 bloques de extension exclusivos de 2.9B Preview 1 se conservan intactos. El autor justifica el valor 0,8 con comparaciones de misma semilla a escena completa, indicando paridad en detalle SFW y en recortes al 100 % entre distintas proporciones, y una ligera mejora en anatomia NSFW, sin aparicion espontanea de mosaicos ni barras negras en ninguna relacion de aspecto.

No se documenta el entrenamiento original de los modelos base: no hay informacion sobre volumen de tokens, composicion del dataset, uso de RLHF/DPO ni tecnicas de destilacion. El caracter "turbo" procede de Anima Turbo 1.1, que permite muestreo en 8 pasos, pero la model card no detalla el metodo de destilacion empleado. El pipeline de inferencia recomendado es UNETLoader (este checkpoint) + CLIPLoader (`qwen_3_06b_base.safetensors`) + VAELoader (`qwen_image_vae.safetensors`), seguido de dos CLIPTextEncode, KSampler, VAEDecode y SaveImage, sin LoRA adicional.

## Capacidades

- Generacion text-to-image de ilustracion anime con etiquetas de calidad tipo `masterpiece, best quality`.
- Control de clasificacion de contenido mediante etiquetas `safe`, `sensitive`, `nsfw` y `explicit`.
- Conocimiento de personajes y series mediante la sintaxis `<personaje> (<serie>)`, con recomendacion de evitar guiones bajos.
- Control de estilo por artista mediante la sintaxis `@<artista>`, que el autor describe como fuertemente directivo.
- Soporte de prompt natural en una o dos frases, ademas de etiquetas de apariencia.
- Generacion multi-personaje describiendo la apariencia de cada uno junto a su nombre.
- Prompt negativo funcional a partir de cfg > 1 (recomendado 1,2 para eliminar texto, marcas de agua y firmas).
- Resoluciones probadas: 1024x1024, 1264x848 y 848x1264.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking (no aplica a un modelo de difusion).

## Casos de uso

- Ilustracion anime por lotes en ComfyUI: el modelo se carga como UNET y genera en 8 pasos con euler + sgm_uniform, lo que permite producir series de imagenes a 1024x1024 en torno a 14-17 segundos por imagen segun el autor, adecuado para prototipado rapido de conceptos.
- Generacion de fan art con personajes conocidos: la sintaxis `<personaje> (<serie>)` permite invocar conocimiento de personajes de franquicias como Arknights: Endfield, util para comunidades y encargos de ilustracion.
- Exploracion de estilo por artista: el prefijo `@<artista>` permite iterar variaciones estilisticas sobre un mismo concepto, apropiado para direccion de arte y moodboards.
- Escenas narrativas con prompt natural: la recomendacion de escribir una o dos frases descriptivas facilita generar ilustraciones con contexto (por ejemplo, una escena en un bosque o una cocina) sin encadenar decenas de etiquetas.
- Contenido para adultos con control de clasificacion: las etiquetas `nsfw`/`explicit` y el ajuste de cfg permiten separar flujos SFW y NSFW en el mismo pipeline, aunque con las advertencias legales y de plataforma correspondientes.
- Relleno de bibliotecas de assets para videojuegos o prototipos: la generacion rapida a varias relaciones de aspecto (cuadrada, apaisada, vertical) sirve para placeholders y pruebas de composicion antes de encargar arte final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta tiempos de inferencia aproximados de 14-17 segundos por imagen a 1264x848 y 848x1264 con 8 pasos, sin comparaciones cuantitativas frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint BF16 ocupa ~5,4 GiB en disco, por lo que la inferencia en BF16 requiere al menos ese orden de magnitud mas el CLIP y el VAE, sin cifra oficial.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del checkpoint sugiere que podria caber en GPUs de consumo con VRAM suficiente, pero no hay dato verificado.
- Opciones de despliegue: ComfyUI con UNETLoader, CLIPLoader y VAELoader; la libreria declarada es diffusers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion).
- Latencia y throughput: ~14-17 s/imagen a 1264x848 y 848x1264 con 8 pasos, euler + sgm_uniform, segun el autor; sin datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anima-2.9B-P1-Turbo1.1 (Unofficial Merge) | no disponible (UNET 40 bloques, ~5,4 GiB BF16) | no aplica | 8 pasos, ~14-17 s/imagen (autor) | no disponible | Hugging Face (Quiho) |
| Anima 2.9B Preview 1 | no disponible | no aplica | no disponible | no disponible | Referenciado como base |
| Anima Turbo 1.1 | no disponible | no aplica | muestreo turbo (8 pasos) | no disponible | Referenciado como base |
| Alternativas de la misma categoria | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con modelos de difusion anime de terceros (por ejemplo, familias SDXL o Illustrious) sin inventar cifras.

## Limitaciones y advertencias

- Modelo no oficial: no es un lanzamiento de Anima ni de CircleStone Labs; el autor lo califica explicitamente como derivado comunitario.
- Licencia no declarada: no hay terminos de uso comercial ni de redistribucion, lo que impide asumir viabilidad legal en produccion.
- Etiqueta `not-for-all-audiences`: el modelo esta orientado, entre otros, a contenido NSFW, con las restricciones de plataforma y legales que ello conlleva.
- Sesgos conocidos: no documentados; al ser un modelo de ilustracion anime, es esperable un sesgo hacia ese estilo y hacia los personajes y artistas presentes en los datos de los modelos base.
- Riesgo de alucinacion visual: no evaluado; no hay estudios sobre fidelidad anatomica, coherencia de manos o texto en imagen mas alla de la recomendacion de usar prompt negativo para eliminar texto y marcas de agua.
- Limitaciones de idioma: los ejemplos de prompt estan en ingles; no se confirma soporte de prompts en castellano.
- Caveats de produccion: descargas y likes nulos en el momento de la consulta, sin pipeline declarado en Hugging Face, sin benchmarks y sin garantia de estabilidad del merge; conviene validar el comportamiento en el flujo concreto antes de integrarlo.
- Dependencias especificas: requiere CLIP `qwen_3_06b_base.safetensors` y VAE `qwen_image_vae.safetensors`, no incluidos en el repo.

## Enlaces

- Hugging Face: https://huggingface.co/Quiho/Anima-2.9B-P1-Turbo1.1_Unofficial_Merge_p1-turbo1.1_checkpoint
- Civitai del modelo original (Langzaigg): https://civitai.com/models/2895781
