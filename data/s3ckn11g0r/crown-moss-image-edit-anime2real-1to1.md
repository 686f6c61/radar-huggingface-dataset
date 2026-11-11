# S3ckn11g0r/CROWN-MOSS-Image-Edit-Anime2Real-1to1

## Resumen

CROWN-MOSS-Image-Edit-Anime2Real-1to1 es un LoRA de edicion de imagen publicado por el usuario S3ckn11g0r en Hugging Face, creado originalmente por NineCrowns (CROWN) y distribuido tambien a traves de Civitai y RunningHub. El adaptador se entrena sobre el modelo base MOSS-Image Edit y su funcion concreta es convertir ilustraciones anime 2D de estilo cel-shading en retratos fotorrealistas de personas reales manteniendo una correspondencia 1:1 con la imagen de referencia: misma pose, peinado, expresion facial, diseno del vestuario y composicion del fondo.

El modelo no es un LLM ni un modelo de lenguaje: es un adaptador de bajo rango (LoRA) para un pipeline de image-to-image. Se entrena a resolucion nativa de 1024x1536 sobre un cluster de 8 GPU NVIDIA B200, con rango 64 y alpha 64, y utiliza una doble via de condicionamiento propia de MOSS-Image Edit: tokens de vision de un codificador Qwen3.5-9B VL y latentes de referencia de un VAE Flux2. El resultado es un adaptador de 283,59 MB en formato safetensors con las claves ya separadas en el layout nativo de ComfyUI.

Su relevancia es practica para estudios y creadores que trabajan con pipelines de anime-to-real: evita el tipico aspecto de muneca 2.5D plastica y esta pensado para integrarse directamente en ComfyUI con los pesos del modelo base oficiales, sin conversion de claves. La licencia es una licencia LoRA a medida (bespoke-lora-license) vinculada al perfil de Civitai del autor, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre MOSS-Image Edit (transformer de difusion con condicionamiento dual: vision tokens Qwen3.5-9B VL + latentes de referencia Flux2-VAE) |
| Parametros totales | no disponible (adaptador LoRA de rango 64; fichero de 283,59 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolucion nativa de entrenamiento 1024x1536 |
| Tipos de cuantizacion | no disponible; pesos del LoRA en bf16 (fichero .safetensors) |
| Idiomas soportados | no disponible (modelo de imagen; los prompts se procesan via el VLM Qwen3.5-9B del pipeline base) |
| Licencia | bespoke-lora-license (licencia a medida, enlazada a https://civitai.com/user/NineCrowns) |
| Formato de pesos | safetensors (claves ComfyUI `diffusion_model.layers.*.proj.{q,k,v,o,ffn_up_gate,ffn_down}`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 64 aplicado sobre MOSS-Image Edit, un modelo de difusion para edicion de imagen que combina dos vias de condicionamiento: tokens de vision extraidos por un codificador Qwen3.5-9B VL y latentes de referencia generados por un VAE Flux2. El LoRA se inicializa a partir de `moss_image_edit_lora_rank_64_bf16` y se entrena a resolucion nativa de 1024x1536 sobre un cluster de 8 NVIDIA B200.

El dataset de entrenamiento son 514 pares curados y deduplicados de tipo `2D_ANIME -> 1:1_REAL`, es decir, ilustraciones anime emparejadas con su redibujado fotorrealista correspondiente. No se documenta en la model card el numero de pasos, la tasa de aprendizaje, el uso de RLHF/DPO ni la composicion detallada del dataset mas alla de esa cifra de pares. La innovacion principal declarada es la doble via de condicionamiento (vision tokens + latentes de referencia) para preservar estructura y expresion, y la exportacion en el layout de claves separadas Q/K/V nativo de ComfyUI para carga directa.

## Capacidades

- Redibujado anime-to-real 1:1: convierte ilustraciones 2D cel-shaded en retratos fotorrealistas manteniendo pose, encuadre y composicion de fondo.
- Reconstruccion anatomica realista: remodela ojos, nariz y menton estilizados en estructura facial humana, con poros de piel, pestanas y mechones de pelo individuales.
- Preservacion de expresion y estado de la boca: mantiene boca cerrada, sonrisa o boca abierta tal como aparecen en la referencia 2D.
- Fidelidad de vestuario y accesorios: conserva pliegues de tela, patrones, accesorios e iluminacion de la imagen original.
- Edicion image-to-image condicionada por referencia, con control de peso del LoRA (recomendado 0,90-1,00).
- Compatibilidad nativa con ComfyUI mediante claves `proj.{q,k,v}` separadas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un adaptador de generacion/edicion de imagen.
- Capacidades multilingues: no disponibles como tales; la comprension de prompts depende del VLM del pipeline base.

## Casos de uso

- Produccion de live-action de referencia para anime: a partir de un keyframe o ilustracion 2D se genera un retrato fotorrealista 1:1 que sirve como referencia de casting, vestuario o iluminacion para rodaje o preproduccion.
- Storyboards y previsualizacion: convertir paneles de manga o anime en imagenes fotorrealistas coherentes con la composicion original para presentar a direccion o clientes.
- Ilustracion comercial y portadas: generar versiones fotorrealistas de personajes 2D manteniendo el diseno exacto de vestuario y expresion, util para merchandising o portadas de novela.
- Creacion de contenido para redes y videojuegos: redibujar avatares o personajes anime como retratos reales para fichas de personaje, promocionales o material de marketing.
- Iteracion de diseno de personajes: comparar el mismo personaje en clave 2D y fotorrealista con correspondencia 1:1 para validar proporciones, peinado y paleta antes de modelar en 3D.
- Flujos de trabajo en ComfyUI: integrar el LoRA en un grafo de edicion de imagen con los pesos base `moss_image_sft_bf16`, `qwen3.5_9b_bf16` y `flux2-vae`, con 28-30 pasos, shift 5.0 y CFG 3,2-3,5, para lotes de conversion anime-to-real.
- Prototipado rapido en la nube: usar la demo de RunningHub para probar el adaptador sin infraestructura propia antes de desplegarlo en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye ocho imagenes de showcase cualitativas (comparaciones fuera de distribucion generadas con peso 0,95), pero no reporta metricas cuantitativas como FID, SSIM, LPIPS ni evaluaciones comparativas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base MOSS-Image Edit y del VLM Qwen3.5-9B, no solo del LoRA (283,59 MB). El pipeline completo requiere cargar los pesos base en bf16, lo que implica una VRAM considerable muy superior a la del adaptador.
- GPU recomendadas: no disponibles en la informacion proporcionada. El entrenamiento se realizo en 8 NVIDIA B200, dato que no debe extrapolarse a los requisitos de inferencia.
- Compatibilidad con GPU de consumo: no disponible; no se documenta si el pipeline base completo cabe en tarjetas como RTX 4090.
- Opciones de despliegue: ComfyUI (soporte nativo por el layout de claves) y la demo en la nube de RunningHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de adaptador.
- Latencia y throughput: no disponibles. Los parametros de muestreo recomendados son 28-30 pasos, shift 5.0 y CFG 3,2-3,5 a 1024x1536 o 1024x1024.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores anime-to-real comparables ni datos de rendimiento que permitan una comparacion rigurosa de parametros, contexto, licencia o disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset de 514 pares y la descripcion del autor apuntan a una estetica facial de tipo "East Asian / human facial bone structure", lo que puede sesgar los resultados hacia un canon facial concreto y reducir la diversidad de rostros generados.
- Riesgo de alucinacion visual: al tratarse de un modelo generativo, puede inventar detalles de vestuario, accesorios o fondo no presentes en la referencia 2D, pese al objetivo declarado de fidelidad 1:1.
- Dependencia del modelo base: el LoRA no funciona de forma autonoma; requiere `moss_image_sft_bf16.safetensors`, `qwen3.5_9b_bf16.safetensors` y `flux2-vae.safetensors`, lo que condiciona el despliegue y el consumo de recursos.
- Restricciones de licencia: la licencia es "bespoke-lora-license" (license: other), vinculada al perfil de Civitai del autor; no se detallan los terminos exactos de uso comercial, por lo que es imprescindible consultarlos antes de utilizarlo en produccion.
- Advertencia de procedencia: el repositorio de Hugging Face tiene 0 descargas y 0 likes, y la autoria original corresponde a NineCrowns; conviene verificar la integridad del fichero (SHA256 `6D7742D41ADE2EA9742595FBAFE97CDD90751874A98F15B66C933F0489E67FE7`) y la relacion entre el publicador y el autor original.
- Ambito limitado: no es un modelo de lenguaje; no soporta razonamiento, codigo, tool calling ni agentes. Su uso esta restringido a edicion de imagen anime-to-real.
- Idiomas: no se documenta soporte linguistico; la calidad de los prompts depende del VLM del pipeline base.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-MOSS-Image-Edit-Anime2Real-1to1
- Civitai (modelo original): https://civitai.com/models/3045473
- Civitai (perfil del autor, licencia): https://civitai.com/user/NineCrowns
- RunningHub (demo en la nube): https://www.runninghub.ai/model/public/2120440207093829634
