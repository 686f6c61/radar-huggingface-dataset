# puzhen/Qwen-Image-2.1-Uncensored-Omni-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Omni-Quantized es un derivado cuantizado del modelo de difusion Qwen/Qwen-Image-2.1, publicado por el usuario puzhen (ChatR Labs) bajo el nombre comercial "ChatR Labs Uncensored Omni". Se trata de un adaptador LoRA de rango 128 fusionado en el modelo base a fuerza 1.0 y posteriormente cuantizado en multiples formatos (GGUF, FP8, INT8, NVFP4, NF4), orientado a generacion texto-a-imagen y edicion de imagenes sin los filtros de contenido del modelo original.

El repositorio distribuye unicamente los pesos del transformer cuantizados; el text encoder, el procesador y el VAE deben tomarse del repositorio base Qwen/Qwen-Image-2.1. El modelo cuenta con 7.115.124.736 parametros en el transformer y un repositorio de 92,5 GB que agrupa todas las variantes de cuantizacion disponibles.

Su relevancia actual radica en que ofrece una via de despliegue en hardware de consumo (la variante NF4 ocupa 3,67 GB y la Q4_0 GGUF 4,20 GB) para un modelo de generacion de imagenes de 7B, con soporte tanto para ComfyUI como para Diffusers, y con la particularidad de estar orientado a la generacion sin censura de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (derivado de Qwen-Image-2.1) con adaptador LoRA rango 128 fusionado |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 (GGUF); FP8 E4M3; INT8 ConvRot; NVFP4; FP8 (torchao); NF4 (bitsandbytes); INT8 (bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion para generacion de imagenes, derivado del modelo base Qwen/Qwen-Image-2.1. La modificacion principal consiste en un adaptador LoRA de rango 128 ("Omni adapter") fusionado en los pesos del transformer base a fuerza 1.0, seguido de un proceso de cuantizacion post-entrenamiento en multiples formatos. No se trata de un modelo entrenado desde cero, sino de un merge de LoRA sobre el modelo original; el autor indica explicitamente que "es un merge LoRA normal; no proporciona destilacion de pocos pasos".

Los pesos se distribuyen en dos layouts distintos: uno de 297 tensores que mantiene los pares separados `gate_layer` / `proj` en el MLP, y otro de 265 tensores que usa la proyeccion fusionada `img_mlp.gate_up`. El cargador debe soportar el layout seleccionado. No se dispone de informacion sobre el dataset de entrenamiento del adaptador, el numero de tokens, ni si hubo tecnicas de alineacion como RLHF o DPO. El nombre de los ficheros (step90000) sugiere un checkpoint en el paso 90.000 del entrenamiento del adaptador, pero no se detalla la composicion de los datos.

El modelo base Qwen-Image-2.1 es un modelo de generacion y edicion de imagenes de la familia Qwen; el repositorio no aporta detalles adicionales sobre su arquitectura interna (numero de capas, dimensiones de atencion, etc.).

## Capacidades

- Generacion texto-a-imagen: sintesis de imagenes a partir de descripciones textuales, con resoluciones recomendadas de 768x1152 o 1024x1024.
- Edicion de imagenes: soporte de flujo de edicion mediante la codificacion de una imagen de referencia con el nodo `Text Encoder (Qwen-Image)` en modo edicion, del que se obtiene el latente.
- Generacion sin censura: el adaptador "Uncensored" elimina los filtros de contenido del modelo base, permitiendo generar contenido que el modelo original rechazaria.
- Integracion con ComfyUI: soporte nativo mediante `Unet Loader (GGUF)` o `Load Diffusion Model` para los ficheros `-comfy.safetensors`.
- Integracion con Diffusers: soporte mediante `from_pretrained`, `from_single_file` (GGUF) y cuantizacion con `bitsandbytes` (NF4, INT8) o `torchao` (FP8).
- Control fino de generacion: sampler `er_sde` con scheduler `simple`, 35 pasos, true CFG de 5.0 y cache KV habilitada.
- Prompt negativo: soporta prompt negativo; un prompt negativo vacio u omitido desactiva el true CFG aunque `true_cfg_scale` sea mayor que 1.

## Casos de uso

- Generacion de imagenes en hardware de consumo: la variante NF4 (3,67 GB) o Q4_0 GGUF (4,20 GB) permite ejecutar un modelo de difusion de 7B en GPUs con 8-12 GB de VRAM, algo inviable con el BF16 completo (14,23 GB).
- Edicion de imagenes por lotes: el flujo de edicion con imagen de referencia permite modificar imagenes existentes (estilo, contenido, composicion) en pipelines automatizados, usando el text encoder en modo edicion para obtener el latente.
- Prototipado rapido en ComfyUI: los ficheros GGUF se cargan con un solo nodo y funcionan tanto para texto-a-imagen como para edicion, lo que agiliza la experimentacion en flujos visuales.
- Investigacion sobre seguridad y filtrado de contenido: al ser una version sin censura, sirve para estudiar el comportamiento de modelos de difusion ante prompts que el modelo base rechaza, y para evaluar mecanismos de moderacion externos.
- Despliegue en produccion con cuantizacion nativa: las variantes FP8, INT8 ConvRot y NVFP4 ofrecen operaciones cuantizadas nativas en ComfyUI, reduciendo el uso de VRAM sin salir del ecosistema ComfyUI.
- Integracion en pipelines de Python con Diffusers: la variante FP8 (torchao) o NF4 (bitsandbytes) permite incorporar el modelo en aplicaciones Python existentes con `from_pretrained`, manteniendo la fidelidad o minimizando el peso segun la necesidad.
- Generacion de assets para videojuegos o ilustracion: la resolucion 768x1152 y 1024x1024 con 35 pasos y CFG 5.0 produce imagenes de calidad utilizable para concept art y material de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo transformer, sin text encoder ni VAE):
  - BF16: 14,23 GB.
  - Q8_0: 7,69 GB.
  - Q6_K: 6,00 GB.
  - Q5_K_M: 5,21 GB.
  - Q4_K_M: 4,47 GB.
  - Q4_0: 4,20 GB.
  - FP8 E4M3 / FP8 (torchao) / INT8 (bitsandbytes): 7,12 GB.
  - INT8 ConvRot: 7,26 GB.
  - NVFP4: 4,20 GB.
  - NF4 (bitsandbytes): 3,67 GB.
- Hay que sumar la VRAM del text encoder y del VAE del modelo base Qwen/Qwen-Image-2.1, no incluidos en este repositorio.
- GPU recomendadas: no disponibles de forma explicita; por tamano, las variantes BF16 requieren GPUs de 24 GB o mas (RTX 3090/4090, A100, H100), mientras que las variantes NF4, NVFP4 y Q4 caben en GPUs de 8-12 GB.
- Cabe en GPU de consumo: si, en las variantes NF4, NVFP4, Q4_0 y Q4_K_M; las variantes Q5, Q6, Q8, FP8 e INT8 requieren 8-12 GB adicionales contando el resto de componentes.
- Opciones de despliegue: ComfyUI (GGUF via `Unet Loader (GGUF)`, safetensors via `Load Diffusion Model`), Diffusers (`from_pretrained`, `from_single_file` para GGUF), bitsandbytes para NF4/INT8, torchao para FP8.
- Latencia y throughput: no disponibles. La configuracion recomendada es de 35 pasos de muestreo con sampler `er_sde`, lo que implica un coste computacional proporcional a los pasos.
- El flujo BF16 en ComfyUI fue verificado con el fichero safetensors de 297 tensores y el `UNETLoader` nativo de ComfyUI 0.39.0; no se garantiza compatibilidad con versiones anteriores o cargadores distintos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Omni-Quantized (este) | 7.115.124.736 | no disponible | GGUF, FP8, INT8, NVFP4, NF4 | qwen-research | Hugging Face, ComfyUI, Diffusers |
| Qwen/Qwen-Image-2.1 (base) | no disponible | no disponible | no disponible en la informacion | qwen-research | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: el adaptador elimina los filtros de contenido del modelo base, lo que puede generar contenido inapropiado, ofensivo o ilegal. Es responsabilidad del desplegador implementar moderacion externa.
- Riesgo de sesgos: al derivar de un modelo base sin documentacion sobre su dataset, los sesgos del modelo original (genero, etnia, cultura) persisten y no se han documentado.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar imagenes incoherentes, con anatomia incorrecta o texto ilegible, especialmente en prompts complejos.
- Licencia qwen-research: restringe el uso comercial; es necesario revisar el fichero LICENSE del repositorio base antes de cualquier despliegue productivo.
- Dependencia del modelo base: el repositorio solo incluye el transformer; sin el text encoder, procesador y VAE de Qwen/Qwen-Image-2.1 el modelo no es funcional.
- Compatibilidad de layout: los layouts de 297 y 265 tensores no son intercambiables; el cargador debe soportar el layout del fichero elegido.
- Sin destilacion de pocos pasos: requiere 35 pasos de muestreo, lo que incrementa la latencia frente a variantes destiladas.
- Sin benchmarks publicados: no hay datos objetivos de calidad (FID, CLIP score, etc.) que permitan comparar con el modelo base u otras alternativas.
- Idiomas no documentados: se desconoce que idiomas soporta el text encoder subyacente.
- Repositorio de 92,5 GB: la descarga completa es costosa; conviene descargar solo la variante necesaria.
- Fecha de creacion 2026-11-16 y 0 descargas: modelo muy reciente y sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/puzhen/Qwen-Image-2.1-Uncensored-Omni-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Playground de ChatR Labs: https://chatrlabs.com/
- Chatr AI (infraestructura de entrenamiento): https://thechatr.ai
- Fichero de integridad SHA256SUMS: https://huggingface.co/puzhen/Qwen-Image-2.1-Uncensored-Omni-Quantized/blob/main/SHA256SUMS
- Workflow de ejemplo para ComfyUI: https://huggingface.co/puzhen/Qwen-Image-2.1-Uncensored-Omni-Quantized/blob/main/workflow_example.json
