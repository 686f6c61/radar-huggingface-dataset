# data-archetype/moss_pht_lora

## Resumen

`moss_pht_lora` es un adaptador LoRA de rango 128 orientado a fotografia realista para el modelo de generacion de imagenes MOSS-Image-Base, desarrollado por el usuario data-archetype sobre la base publicada por OpenMOSS-Team. No es un modelo autonomo: modifica unicamente el transformer del pipeline, manteniendo congelados el codificador de texto (Qwen3.5-9B), el VAE (FLUX.2 small decoder), el tokenizer, el scheduler y el pipeline de inferencia originales. El repositorio ocupa 1,6 GB y se distribuye en dos formatos equivalentes: un adaptador PEFT para Diffusers y un fichero safetensors en formato kohya para ComfyUI.

El interes del adaptador reside en su especializacion: desplaza la distribucion generativa del modelo base hacia escenas fotograficas (retratos, calle, paisaje) sin requerir reentrenamiento completo. Al ser un LoRA de rango alto (128) aplicado sobre los modulos de atencion y FFN de los 42 bloques del transformer, su huella en disco y en VRAM es muy inferior a la de un fine-tuning completo, lo que facilita su integracion en flujos de trabajo existentes con MOSS-Image.

Es relevante ahora porque MOSS-Image-Base es un modelo reciente con soporte nativo en ComfyUI y Diffusers, y este tipo de adaptadores permite a equipos sin infraestructura de entrenamiento ajustar el estilo de salida con un coste minimo. La licencia Apache 2.0 heredada del modelo base permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer de difusion MOSS-Image (flow matching) |
| Parametros totales | no disponible (adaptador LoRA de rango 128; el modelo base no reporta conteo en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (prompts de entrenamiento de hasta 2.048 tokens) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite text encoder en bf16, int8 y w4a8 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT en `transformer/` y LoRA kohya en `loras/moss_pht_lora_bf16.safetensors`, bf16) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `MOSSImageTransformer`, un transformer de difusion con 42 bloques que opera con un objetivo de flow matching. Los modulos adaptados son `q`, `k`, `v`, `o`, `ffn_up_gate` y `ffn_down` de todos los bloques; el text embedder queda fuera. El LoRA usa rango 128 y alpha 128 (escala 1), con inicializacion Kaiming-uniform para A y cero para B, sin dropout. El modulo `ffn_up_gate` lleva un par de rango 128 independiente para cada mitad (up y gate).

El entrenamiento se realizo sobre el modelo base congelado en bf16 (text encoder y VAE tambien congelados), durante 5.500 pasos con 32 imagenes por paso, a resolucion de aproximadamente 1 megapixel con buckets de relacion de aspecto. Las captions fueron un 80% lenguaje natural y un 20% layouts JSON (formato de prompt de MOSS-Image), con prompts de hasta 2.048 tokens y un 10% de captions sustituidas por el prompt vacio. El ruido se muestreo de una logit-normal truncada (mu 1.09, sigma 0.95, truncada en 0.95) mas un 1% uniforme y un 1% de ruido puro. Se uso AdamW en fp32 sobre los factores LoRA, learning rate 1e-4, warmup lineal de 150 pasos, fase constante hasta el paso 4.500 y cooldown de 1.000 pasos con forma 1 - sqrt, weight decay desacoplado de 0.01 y clipping de norma global 1.0. Los pesos publicados son la EMA (decay 0.999, fp32, actualizada cada paso) en el paso 5.500, almacenada en bfloat16.

## Capacidades

- Generacion de imagenes text-to-image con enfasis en estetica fotografica realista (retrato, calle, paisaje, escenas con iluminacion natural).
- Acepta prompts en lenguaje natural, en formato de etiquetas y en layouts JSON estructurados, heredados del formato de MOSS-Image.
- Soporte bilingue de prompts: ingles y chino.
- Control de composicion mediante layouts JSON, util para posicionar elementos en la escena.
- Integracion con el sampler multi-paso del modelo base (por ejemplo, 50 pasos con `guidance_scale` 3.0 y `uncond_skip_layers=[22]`).
- Compatible con LoRA DMD destilados del modelo base para acelerar y estabilizar la generacion.
- No incluye capacidades de vision, audio, tool calling ni razonamiento multi-paso: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Generacion de imagenes de producto con estetica fotografica: el adaptador desplaza la salida hacia iluminacion y texturas realistas, adecuado para catalogos y mockups que requieren apariencia de fotografia de estudio.
- Creacion de material editorial y de prensa: escenas callejeras, retratos ambientales y paisajes con grano y profundidad de campo propios de fotografia documental, generados a 1 megapixel.
- Prototipado rapido de conceptos visuales en equipos de diseno: al cargarse como LoRA sobre el transformer, permite alternar entre el estilo base y el fotografico sin cambiar de pipeline ni reinstalar dependencias.
- Generacion controlada por layout: el soporte de prompts JSON permite especificar la posicion de sujetos y objetos, util para composiciones publicitarias o storyboards con requisitos de encuadre.
- Flujos en ComfyUI para artistas e ilustradores: el fichero kohya se carga con `LoraLoaderModelOnly` tras `Load Diffusion Model`, integrándose en grafos existentes con el modelo base de Comfy-Org, su text encoder Qwen3.5-9B y el VAE FLUX.2 small.
- Aumento de datos sinteticos para vision por computador: generacion de imagenes fotorrealistas con semillas controladas para ampliar datasets de entrenamiento en tareas de deteccion o segmentacion.
- Iteracion de estilo en produccion con recursos limitados: al requerir solo el adaptador (1,6 GB) sobre un base ya desplegado, permite a estudios pequenos experimentar con variantes de estilo sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 1,6 GB en disco y se carga en bf16; su VRAM adicional es marginal frente al modelo base.
- El coste real de VRAM lo determina el pipeline completo: transformer MOSS-Image, text encoder Qwen3.5-9B y VAE FLUX.2 small. No se dispone de cifras exactas de VRAM total en la informacion proporcionada.
- El codigo de ejemplo usa `pipe.to("cuda")` o, en GPUs mas pequenas, `pipe.enable_model_cpu_offload()` para descargar modulos a CPU.
- El text encoder puede sustituirse por variantes cuantizadas (int8 o w4a8) publicadas en Comfy-Org/MOSS-Image para reducir huella de memoria.
- GPUs recomendadas: no disponible en la informacion proporcionada; por el tamano del text encoder (9B) y el transformer de 42 bloques, se requiere una GPU de gama alta para ejecucion completa en VRAM, y el offloading permite GPUs de menor capacidad a costa de latencia.
- Opciones de despliegue: Diffusers (>=0.38) con transformers (>=5.3), accelerate (>=1.10), peft (>=0.21) y safetensors (>=0.6); ComfyUI con soporte nativo de MOSS-Image.
- Latencia y throughput: no disponible. El ejemplo de referencia usa 50 pasos de inferencia a 1024x1024; se recomienda combinar con un LoRA DMD para reducir pasos y estabilizar la salida.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moss_pht_lora (este) | LoRA sobre MOSS-Image-Base | rango 128 sobre 42 bloques | prompts hasta 2.048 tokens; ~1 MP | Apache 2.0 | Hugging Face (data-archetype) |
| MOSS-Image-Base | Modelo base text-to-image | no disponible | no disponible | Apache 2.0 | Hugging Face (OpenMOSS-Team) |
| LoRA DMD destilado de MOSS-Image | LoRA de destilacion | no disponible | no disponible | no disponible | Referenciado en la model card, sin enlace directo |
| Otros LoRA fotograficos para modelos de difusion | LoRA | variable | variable | variable | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere MOSS-Image-Base, su text encoder, VAE, tokenizer y scheduler para funcionar.
- La model card advierte de que las generaciones con el sampler multi-paso estandar pueden ser algo inestables; se recomienda usar un LoRA DMD destilado del modelo base para estabilizar la distribucion de salida.
- El adaptador solo modifica el transformer; no altera el comportamiento del text encoder ni del VAE, por lo que los sesgos de esos componentes persisten.
- Idiomas de prompt limitados a ingles y chino; no se garantiza calidad con prompts en castellano.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir anatomia incorrecta, texto ilegible en la imagen o incoherencias fisicas, especialmente en escenas complejas.
- No se han publicado evaluaciones cuantitativas (FID, CLIP score, benchmarks humanos) que permitan estimar la mejora real frente al modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria publica.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; conviene verificar igualmente las licencias del text encoder (Qwen3.5-9B) y del VAE (FLUX.2 small) en sus repositorios oficiales antes de un despliegue comercial.
- La fecha de creacion del repositorio (2026-11-02) y las versiones de dependencias citadas (diffusers >=0.38, transformers >=5.3) deben verificarse contra el estado actual del ecosistema.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/data-archetype/moss_pht_lora
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo base para ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image
- Guia de usuario de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
