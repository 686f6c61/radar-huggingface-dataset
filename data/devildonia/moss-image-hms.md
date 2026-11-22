# DeVilDoNia/MOSS-Image-HMS

## Resumen

MOSS-Image HMS v1 es una cuantización del modelo de generación de imágenes MOSS-Image, publicada por el usuario DeVilDoNia (proyecto HaDeS MOSS Suite) sobre los pesos de OpenMOSS-Team. Se distribuye en dos variantes, Base y SFT, ambas derivadas respectivamente de `OpenMOSS-Team/MOSS-Image-Base` y `OpenMOSS-Team/MOSS-Image-SFT`. El objetivo es reducir el peso del modelo de 10,2 GB en bfloat16 (o 5,4 GB en la cuantización int8 ConvRot de Comfy-Org) a 3,96 GB por fichero, manteniendo una calidad prácticamente equivalente según la evaluación del autor.

La relevancia de esta ficha es práctica: HMS v1 no requiere nodos personalizados ni cargadores propios. Los ficheros se cargan con el nodo estándar **Load Diffusion Model** de ComfyUI y se ejecutan sobre los kernels nativos W4A8/W6A8 de comfy-kitchen. Según las mediciones del autor en una RTX 5090, el modelo renderiza aproximadamente el doble de rápido que en bfloat16 y reduce el pico de VRAM de 17,8 GB a 11,6 GB.

Arquitectónicamente, MOSS-Image es un DiT de flujo único (single-stream) con 42 bloques. La cuantización afecta únicamente a las cuatro proyecciones lineales de cada bloque (atención y FFN), mientras que embedders, modulación, normas y capas finales permanecen en bfloat16. La licencia es Apache 2.0 y el formato de pesos es safetensors, orientado al ecosistema ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de flujo único, 42 bloques |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W6A8 (6 bits pesos, int8 activaciones) y W4A8 con codebook de 4 bits; pesos rotados con transformada Hadamard ConvRot (grupos de 256); GPTQ en base rotada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3.955.670.084 bytes por fichero, ~3,96 GB) |

## Arquitectura y entrenamiento

MOSS-Image es un Diffusion Transformer de flujo único con 42 bloques. HMS v1 cuantiza las cuatro proyecciones lineales de cada bloque y mantiene el resto de componentes en bfloat16: embedders, modulación, normas y capas finales. La distribución de precisión es asimétrica y seleccionada por medición: las proyecciones de atención (`qkv`, `o`) de los 42 bloques y las FFN (`ffn_up_gate`, `ffn_down`) de los bloques 30 a 41 usan W6A8, mientras que las FFN de los bloques 0 a 29 usan W4A8 con codebook de 4 bits.

El proceso de cuantización incluye tres elementos técnicos destacables. Primero, los pesos se rotan con la transformada de Hadamard ConvRot en grupos de 256, lo que reduce los valores atípicos antes de cuantizar. Segundo, el codebook de 4 bits y las escalas por grupo se buscan minimizando el error ponderado por la energía de activación real de cada canal de entrada, no el error plano de pesos. Tercero, se aplica GPTQ en la base rotada, redondeando columna a columna contra activaciones reales capturadas del propio modelo, con corrección de segundo orden. La calibración usa siete prompts fijos muestreados con el propio modelo a seed 1001, 1024², 25 pasos y CFG 2.5; cuatro son escenas y tres contienen texto entrecomillado (mantener estos últimos preservó la legibilidad del lettering: 139/143 frente a 131/143 sin ellos en Base).

No se dispone de información sobre el entrenamiento original de MOSS-Image (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de imágenes texto-a-imagen (pipeline `text-to-image`).
- Renderizado de texto legible dentro de la imagen: la calibración incluye prompts con texto entrecomillado y la evaluación mide lectura exacta por OCR.
- Generación de escenas variadas con control de composición y color fiel al modelo en bfloat16 (desviación L1@64 del 4,13 % en Base y 4,72 % en SFT).
- Dos variantes con perfiles distintos: Base (mayor fidelidad de detalle, 548 de varianza laplaciana) y SFT (mayor nivel de detalle, 2003 de varianza laplaciana).
- Integración nativa en ComfyUI mediante el nodo estándar Load Diffusion Model, sin nodos personalizados.
- Compatibilidad con merges y LoRAs horneadas: la herramienta MOSS Model Saver puede guardar cualquier modelo MOSS-Image, incluidos merges, en formato HMS v1.
- No se documentan capacidades de tool calling, agentes, visión de entrada ni audio; es un modelo exclusivamente generativo de imagen.

## Casos de uso

- Generación de ilustraciones en producción con ComfyUI: el fichero se coloca en `ComfyUI/models/diffusion_models/` y se carga con Load Diffusion Model, usando el text encoder `qwen3.5_9b_int8_convrot` (o `w4a8_gptq`) vía Load CLIP con tipo `moss_image` y el VAE `flux2-vae`. Es adecuado porque no requiere infraestructura adicional más allá de una versión reciente de ComfyUI con comfy-kitchen.
- Despliegue en GPU de consumo con VRAM limitada: el pico de VRAM de 11,6 GB (frente a 17,8 GB en bfloat16) permite ejecutar el modelo en tarjetas de 12-16 GB, ampliando el parque de hardware compatible.
- Prototipado rápido de pipelines de imagen: la velocidad aproximadamente 2× superior a bfloat16 en RTX 5090 reduce el tiempo de iteración en pruebas de prompts, seeds y configuraciones de sampler.
- Generación de carteles y material gráfico con texto: la calibración preserva el lettering (139/143 casos exactos en Base, 106/110 en SFT), lo que lo hace apto para imágenes con titulares o rótulos.
- Creación de variantes personalizadas: mediante HaDeS MOSS Suite (0.9.5 o superior) se puede guardar un merge o una LoRA horneada en HMS v1 con el mismo recetario, útil para distribuir modelos afinados con peso reducido.
- Evaluación comparativa de cuantizaciones: el repositorio documenta el protocolo de medición (L1@64, luma mediana, varianza laplaciana, OCR exacto) y los resultados frente a bfloat16 e int8/W4A8 de Comfy-Org, lo que sirve como referencia para decidir qué códec usar en producción.
- Investigación sobre cuantización post-entrenamiento: el fichero `tools/RESULTS.md` del proyecto recoge el experimento completo, incluidos los códecs rechazados, como material de estudio de técnicas GPTQ con rotación Hadamard.

## Benchmarks y rendimiento

Mediciones del autor en una RTX 5090, con las mismas seeds y ajustes para HMS y bfloat16. Escenas: 10 prompts variados. Texto: prompts con texto entrecomillado evaluados por OCR exacto (Base con 143 casos; SFT con 11 prompts × 10 seeds = 110 casos).

| Modelo | L1@64 vs BF16 (escenas) | Luma mediana | Detalle (varianza laplaciana, HMS / BF16) | Texto exacto (HMS / BF16) |
|---|---:|---:|---|---|
| Base | 4,13 % | +0,49 | 548 / 514 | 139/143 vs 140/143 |
| SFT | 4,72 % | +0,70 | 2003 / 2079 | 106/110 vs 105/110 |

Referencia adicional: Base con todas las proyecciones en W6A8 (fichero mayor) midió 4,05 % de L1@64 en el mismo protocolo, lo que sitúa a HMS v1 a 0,08 puntos porcentuales del códec de mayor precisión. La luma se mantiene dentro de ±0,7 sobre 255, sin brillo u oscurecimiento visible. Los cuatro modelos HMS v1 producidos (Base, SFT, HaDeS MOSS v1.0 Turbo y Bulle d'Encre) superaron los umbrales de calidad: texto no peor que BF16 − 2 y luma mediana dentro de ±2,5.

Rendimiento medido en RTX 5090: aproximadamente 2× más rápido que bfloat16; VRAM pico asignada de 11,6 GB frente a 17,8 GB. El guardado de un fichero HMS v1 en MOSS Model Saver tarda 8-10 minutos con picos de ~19,5 GB de RAM y ~24,6 GB de VRAM.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,6 GB de pico asignado (medido en RTX 5090 con 25 pasos, CFG 2.5, sampler `er_sde`, scheduler `simple`, shift 5).
- GPU recomendadas: RTX 5090 (hardware de referencia de las mediciones). No se han publicado mediciones en otras GPU; el autor indica explícitamente que la velocidad y la memoria se midieron en una sola GPU y que otras necesitan el mismo soporte de kernels.
- Cabe en GPU de consumo: sí, en tarjetas con al menos ~12 GB de VRAM efectiva para el pico medido, siempre que la versión de ComfyUI incluya los kernels nativos W4A8/W6A8.
- Opciones de despliegue: ComfyUI con comfy-kitchen 0.2.40 o superior (probado con esa versión), nodo Load Diffusion Model estándar o el MOSS Loader del suite. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de difusión para ComfyUI.
- Latencia y throughput: aproximadamente 2× más rápido que bfloat16 en RTX 5090; no se publican cifras absolutas de segundos por imagen ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Tamano | Formato | Calidad vs BF16 | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| MOSS-Image HMS v1 (Base/SFT) | 3,96 GB | safetensors W4A8/W6A8 | L1@64 4,13 % / 4,72 % | Apache 2.0 | Hugging Face (DeVilDoNia) |
| MOSS-Image bfloat16 | 10,2 GB | safetensors bf16 | referencia | Apache 2.0 (según modelo base) | OpenMOSS-Team |
| MOSS-Image int8 ConvRot (Comfy-Org) | 5,4 GB | safetensors int8 | no disponible en la información | Apache 2.0 (según modelo base) | Comfy-Org/MOSS-Image |
| MOSS-Image W4A8 (Comfy-Org) | no disponible | safetensors W4A8 | no disponible en la información | Apache 2.0 (según modelo base) | Comfy-Org/MOSS-Image |

La comparativa se limita a las variantes del propio MOSS-Image documentadas en la model card. No se proporcionan datos de otros modelos de generación de imagen comparables (por ejemplo, de otras familias) en la información disponible.

## Limitaciones y advertencias

- No es idéntico a bfloat16: con la misma seed cambian pequeños detalles y, ocasionalmente, una página densa (por ejemplo, una cuadrícula de manga) redibuja un panel de forma distinta.
- Las mediciones de velocidad y memoria se realizaron únicamente en una RTX 5090; el rendimiento en otras GPU no está caracterizado.
- Requiere una versión reciente de ComfyUI que incluya `AsymW4A8Int8Layout` de comfy-kitchen (probado con 0.2.40); versiones anteriores no cargarán el fichero.
- Los merges guardados en HMS v1 pueden quedar ligeramente más oscuros que su versión bfloat16 (luma mediana −2,8 en el merge de prueba del autor); se recomienda revisión visual.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 2026-11-22: no hay evidencia de uso en producción ni validación independiente.
- No se documentan sesgos conocidos, tasas de alucinación visual ni limitaciones de idioma en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base de OpenMOSS-Team; conviene verificar la licencia del modelo original antes de desplegar.
- El autor declara una revisión ciega con claves sin abrir que juzgó los ficheros "prácticamente iguales" a bfloat16; se trata de una evaluación del propio autor, no de un tercero independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeVilDoNia/MOSS-Image-HMS
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Text encoder y VAE de referencia: https://huggingface.co/Comfy-Org/MOSS-Image
- Repositorio HaDeS MOSS Suite: https://github.com/Devildonia/HaDeS-MOSS-Suite
- Resultados del experimento de cuantización: https://github.com/Devildonia/HaDeS-MOSS-Suite/blob/main/tools/RESULTS.md
