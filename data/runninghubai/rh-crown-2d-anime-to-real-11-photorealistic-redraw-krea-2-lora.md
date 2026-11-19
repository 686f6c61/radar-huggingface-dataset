# RunningHubAI/rh-crown-2d-anime-to-real-11-photorealistic-redraw-krea-2-lora

## Resumen

rh-crown-2d-anime-to-real-11-photorealistic-redraw-krea-2-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en nombre del autor NineCrowns ( identificador `[CROWN]`). Su funcion es convertir ilustraciones anime 2D planas (cel-shading) en fotografias fotorrealistas manteniendo una correspondencia 1:1 con la imagen de entrada: misma expresion facial, mismo peinado, misma ropa, mismos accesorios y misma composicion de fondo. No es un modelo base: es un peso adicional que se aplica sobre el modelo de difusion Krea 2 (arquitectura SingleStreamDiT) dentro de ComfyUI o de la plataforma RunningHub.

El adaptador se entrena a resolucion nativa de 1024x1536 sobre un clúster de 8 GPU NVIDIA B200 con rango 64. El repositorio de Hugging Face ocupa aproximadamente 0,5 GB y contiene un unico archivo safetensors de 436 MiB. La publicacion es muy reciente (noviembre de 2026) y, en el momento de redactar esta ficha, no acumula descargas ni valoraciones, por lo que no existe validacion externa de la comunidad.

La relevancia de este adaptador es acotada pero concreta: cubre el caso de uso de "redibujo fotorrealista" de personajes anime sin perder la identidad visual del original, un problema que los modelos de image-to-image genericos resuelven mal (suelen alterar rasgos, ropa o fondo). Esta pensado para pipelines de ComfyUI con Krea 2 Turbo en 8 pasos, lo que lo hace viable en produccion creativa con latencias bajas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base Krea 2 (SingleStreamDiT); rango 64 con particion ortogonal en subespacios SVD (ranks 0-31 alineacion espacial, ranks 32-63 inyeccion de anatomia y textura realista) |
| Parametros totales | no disponible (peso de 436 MiB en safetensors; numero de parametros no declarado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en un unico `.safetensors`; no se documentan variantes GGUF, FP8 ni NF4) |
| Idiomas soportados | no disponible (los prompts de texto dependen del modelo base Krea 2, no del LoRA) |
| Licencia | no disponible; la model card indica "Follow the original project or upstream license" y que el copyright permanece con el autor |
| Formato de pesos | safetensors (`CROWN_Krea2_Edit_Anime2Real_1to1_V1_r64.safetensors`, 436 MiB), con claves `diffusion_model.*` compatibles con ComfyUI |

## Arquitectura y entrenamiento

El adaptador se construye sobre Krea 2, un modelo de difusion con arquitectura SingleStreamDiT (transformer de flujo con atencion unificada entre modalidades). El LoRA usa rango 64 y una particion ortogonal en subespacios: los ranks 0-31 se entrenan para bloquear la correspondencia espacial 1:1 mediante cross-attention pixel-alineada, partiendo de la base Apache-2.0 `krea2:o_edit_turbo`; los ranks 32-63 inyectan estructura osea facial humana, proporciones de iris y parpado, y microtextura de piel tipo DSLR/iPhone.

El condicionamiento de referencia es de doble via: por un lado, caracteristicas vision-texto apiladas de 12 capas del modelo Qwen3-VL-4B-Instruct; por otro, latentes de referencia del VAE Qwen-Image con `index_timestep_zero` e `isolate_refs=True`. El entrenamiento se realizo a resolucion nativa 1024x1536 en un clúster de 8 NVIDIA B200. No se documentan en la informacion disponible el volumen de tokens, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias; tampoco se especifican tecnicas de decodificacion especulativa ni attention linear.

## Capacidades

- Redibujo fotorrealista de ilustraciones anime 2D: transforma cel-shading plano en fotografia con poros, dispersion subsuperficial y mechas de pelo individuales.
- Preservacion 1:1 de identidad visual: mantiene geometria de flequillo, coleta o moño, estado de labios (boca cerrada o sonrisa), cintas de cuello, sombreros, bufandas, estetoscopios y disposicion de iluminacion del fondo.
- Reconstruccion de anatomia humana realista: proporcion de ojos, puente nasal, estructura mandibular y textura de piel orientada a rostros de Asia Oriental.
- Edicion image-text-to-image dentro de ComfyUI mediante los nodos `FluxKontextMultiReferenceLatentMethod` (con `index_timestep_zero`) y `Krea2OstrisEditModelPatch = True`.
- Inferencia rapida en 8 pasos con Krea 2 Turbo (`euler`, `mu = 1.15` o `beta57`, `CFG = 1.0`), con pesos recomendados de 0,95 a 1,00.
- Activacion mediante palabras clave: `crown_anime2real`, `A2R`, `transform the image to realistic photograph`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni thinking mode; el adaptador es exclusivamente de edicion de imagen.

## Casos de uso

- Produccion de key visuals para videojuegos o series anime: a partir del arte 2D original se obtiene una version fotorrealista coherente en encuadre, vestuario y expresion, util para campanas de marketing o material promocional sin rehacer el diseno.
- Adaptacion de personajes para cosplay o merchandising: el LoRA conserva la geometria de accesorios (cintas, sombreros, bufandas) y permite generar referencias fotograficas realistas para fabricantes de figuras o patrones de cosplay.
- Creacion de retratos fotorrealistas para ilustracion editorial: partiendo de un boceto anime se obtiene una fotografia de estudio con iluminacion y fondo equivalentes, acelerando la iteracion con direccion de arte.
- Previsualizacion de casting o de maquillaje: dado un diseno de personaje 2D, se generan variantes fotorrealistas del rostro con la misma expresion para evaluar como quedaria en accion real antes de contratar talento.
- Pipelines de ComfyUI en produccion creativa: al integrarse como un unico `.safetensors` con Krea 2 Turbo en 8 pasos, encaja en flujos automatizados de generacion por lotes con coste computacional bajo por imagen.
- Prototipado de campanas de moda inspiradas en estetica anime: permite pasar de un figurin ilustrado a una fotografia de catalogo manteniendo la silueta, los pliegues de ropa y la composicion del fondo.
- Restauracion estilistica de ilustraciones antiguas: convierte arte promocional de baja fidelidad en imagenes fotorrealistas coherentes para reediciones o archivo, preservando el diseno original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, SSIM, LPIPS ni comparaciones con otros adaptadores); unicamente describe cualitativamente la preservacion 1:1 y menciona comparaciones visuales no enlazadas. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada: no disponible para el LoRA aislado; depende del modelo base Krea 2. El adaptador en si ocupa 436 MiB en disco y se carga en memoria junto al modelo base.
- GPU recomendadas: el entrenamiento se realizo en 8x NVIDIA B200, pero para inferencia no se especifican requisitos minimos. Krea 2 en bf16 requiere, como referencia, GPU de gama alta con suficiente VRAM para un transformer de difusion, aunque el dato concreto no esta publicado en la informacion disponible.
- Cabe en GPU consumer: no disponible; no se documenta si Krea 2 Turbo en bf16 o cuantizado cabe en RTX 4090, 4080 o similares.
- Opciones de despliegue: ComfyUI con los nodos `ComfyUI-Krea2-Ostris-Edit`; plataforma RunningHub (online y API); Hugging Face como repositorio de pesos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son entornos de LLM, no aplicables a este adaptador de difusion).
- Latencia y throughput: no disponibles. La model card afirma "8 pasos ... segundos por imagen" en Krea 2 Turbo, pero no aporta numeros concretos de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-crown-2d-anime-to-real-11 (este) | LoRA sobre Krea 2 (SingleStreamDiT) | no disponible (436 MiB) | no aplica | no publicado | no disponible | Hugging Face, RunningHub, ComfyUI |
| Alternativas de redibujo anime-a-real | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre adaptadores comparables (por ejemplo, LoRA de anime-to-real para Flux, SDXL o Qwen-Image) que permitan una comparacion numerica rigurosa. Se indica "no disponible" en lugar de inferir cifras.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador inyecta explicitamente "estructura osea facial humana de Asia Oriental" y proporciones de iris/parpado concretas, lo que puede producir un sesgo estetico hacia un fenotipo especifico y reducir la diversidad de rostros generados.
- Riesgo de alucinacion visual: al ser un modelo de difusion, puede inventar detalles no presentes en la imagen original (por ejemplo, texturas de piel, reflejos o elementos de fondo) pese al objetivo de preservacion 1:1; la correspondencia estricta no esta garantizada por benchmarks publicados.
- Dependencia del modelo base: requiere Krea 2 (Turbo o Raw), Qwen3-VL-4B-Instruct y Qwen-Image VAE, ademas de nodos ComfyUI especificos (`ComfyUI-Krea2-Ostris-Edit`); no funciona de forma autonoma.
- Limitaciones de contexto e idioma: no se documentan; al ser un adaptador de imagen, las capacidades linguisticas dependen del modelo base y no estan especificadas.
- Restricciones de licencia: la licencia no esta declarada de forma explicita; la model card remite a la licencia del proyecto original o upstream y mantiene el copyright con el autor. El uso comercial no esta garantizado y debe verificarse contra la licencia de Krea 2 y de los componentes derivados.
- Caveat de produccion: el repositorio no registra descargas ni likes, la fecha de creacion es muy reciente y no hay validacion externa; conviene evaluar la calidad con un conjunto propio antes de integrarlo en un pipeline.
- Resolucion y parametros fijados: el flujo recomendado usa 1024x1536, sampler `euler`, 8 pasos, `mu = 1.15`, `CFG = 1.0` y peso LoRA 0,95-1,00; desviarse de estos valores puede degradar la preservacion de identidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-crown-2d-anime-to-real-11-photorealistic-redraw-krea-2-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2120440913309995010
- Perfil del autor (NineCrowns): https://www.runninghub.ai/user-center/2120428923636236289
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API de RunningHub: https://www.runninghub.cn/runninghub-api-doc-en/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (referenciado en la model card, sin URL absoluta disponible)
