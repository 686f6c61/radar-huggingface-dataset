# OliviaRossi/Minimax-H3-Hybrid-DMAD-PDMD

## Resumen

Minimax-H3-Hybrid-DMAD-PDMD es un modelo de generacion de video texto-a-video e imagen-a-video de 33B parametros publicado por el usuario OliviaRossi en Hugging Face. Se trata de un fine-tune derivado de Comfy-Org/MiniMax-H3 que fusiona dos LoRAs de destilacion (DMAD y PDMD) sobre un backbone hibrido, con el objetivo de acelerar la inferencia a 4-8 pasos y reducir los requisitos de VRAM mediante cuantizacion INT8 y W6A8.

El problema que resuelve es el compromiso existente en el ecosistema de pesos abiertos entre las dos variantes del modelo base: FL2VA (alto rango dinamico y movimiento natural, pero sin condicionamiento multi-referencia) y Ref2VA (seguimiento de referencias, pero propenso a contraste aplastado y bandas oscuras en sombras). El autor fusiona ambas mediante un merge AdaLN con curva S suave y aplica poda SVD de bajo rango sobre la tabla temporal.

Es relevante ahora porque permite ejecutar un modelo de generacion de video de 33B en GPUs de consumo (16-24 GB de VRAM) con inferencia acelerada de 4 a 8 pasos, algo impensable con el modelo denso BF16 original de aproximadamente 61,7 GB que requiere A100 u H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion hibrido (merge FL2VA + Ref2VA con AdaLN de curva S) |
| Parametros totales | 33B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W6A8_G32 (6-bit empaquetado + escala FP8 E4M3), INT8 ConvRot (8-bit simetrico tensorwise), BF16 baseline |
| Idiomas soportados | en |
| Licencia | minimax-license (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de un backbone de difusion de 33B parametros con dos variantes del modelo base (FL2VA y Ref2VA, cada una de 61,7 GB en BF16). El autor ejecuta un merge AdaLN con curva S suave que asigna bloques 0-19 al 100% de FL2VA, bloques 20-34 a una transicion smoothstep S y bloques 35-49 al 100% de Ref2VA. Sobre esa base fusiona dos LoRAs de destilacion: 0,850 x DMAD (8 pasos) y 0,333 x PDMD (4 pasos v6).

Posteriormente aplica una poda afin de bajo rango sobre la tabla temporal: reduce la dimension densa de 2688 a rango 8, con bias plegado y `adaln_t_table`. El resultado se compila en dos variantes cuantizadas: INT8 ConvRot (rotacion H_256 normalizada, escala de canal FP32, INT8 simetrico, 18,89 GB) y W6A8_G32 (codigos uniformes de 6 bits, escala relativa FP8 E4M3, 14,95 GB).

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable es la aceleracion por destilacion dual combinada con cuantizacion sub-byte para despliegue en GPU de consumo.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion de video a partir de imagen (image-to-video).
- Condicionamiento multi-referencia mediante la ruta Ref2VA del merge.
- Inferencia acelerada en 4 a 8 pasos de difusion gracias a la destilacion DMAD + PDMD.
- Ejecucion nativa en ComfyUI.
- Soporte de cuantizacion INT8 y W6A8 para despliegue en VRAM reducida.
- Idiomas: unicamente ingles segun los metadatos.
- No se documentan capacidades de tool calling, agentes ni audio.

## Casos de uso

- Prototipado rapido de video generativo en estaciones de trabajo con RTX 4090: la variante INT8 de 18,89 GB cabe completamente en 24 GB de VRAM y permite iterar en 4-8 pasos, reduciendo el tiempo por muestra frente al modelo denso.
- Produccion de clips cortos para redes sociales: el modelo genera video texto-a-video en ingles, adecuado para equipos que necesitan borradores visuales sin infraestructura de datacenter.
- Aniamcion a partir de storyboard: la ruta image-to-video permite animar fotogramas clave existentes, util en previsualizacion de anuncios y videoclips.
- Consistencia de personaje o estilo mediante multi-referencia: la componente Ref2VA del merge permite condicionar la generacion con imagenes de referencia, util para mantener identidad visual en series de clips.
- Despliegue en Apple Silicon: la variante W6A8 de 14,95 GB esta indicada para equipos M-Series con 32 GB o mas, permitiendo generar video en portatiles de gama alta.
- Integracion en pipelines de ComfyUI: al ser nativo de ComfyUI, se puede encadenar con nodos de upscaling, interpolacion o postprocesado dentro de un flujo de trabajo automatizado.
- Investigacion sobre destilacion y cuantizacion: el modelo sirve como referencia para estudiar merges AdaLN, fusion de LoRAs de destilacion y poda SVD de bajo rango en modelos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 16 GB minimo para W6A8_G32; 24 GB para INT8 ConvRot (cabe 100% en VRAM); mas de 64 GB para el baseline denso BF16.
- GPU recomendadas: RTX 3090, RTX 4080, RTX 4090, RTX 4070 Ti Super 16GB, A5000, A6000 para variantes cuantizadas; A100 80GB o H100 para el modelo denso.
- Cabe en GPU de consumo: si, en RTX 4080, RTX 4090 y RTX 4070 Ti Super 16GB con la variante W6A8; en RTX 3090 y RTX 4090 con la variante INT8.
- Apple Silicon: M-Series con 32 GB o mas para W6A8; 64 GB o mas para INT8.
- Opciones de despliegue: ComfyUI (soporte nativo), con soporte de `comfy-kitchen` para el bitpacking sub-byte. No se documentan otros motores como vLLM, llama.cpp, Ollama o TGI (no aplicables a generacion de video).
- Latencia y throughput: no disponibles; el autor indica inferencia en 4-8 pasos pero no publica tiempos por muestra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | VRAM minima |
|---|---|---|---|---|---|
| Minimax-H3-Hybrid-DMAD-PDMD | 33B | no disponible | INT8, W6A8, BF16 | minimax-license | 16 GB |
| Comfy-Org/MiniMax-H3 (base denso) | 33B | no disponible | BF16 | minimax-license | >64 GB |
| pdmd2026/pdmd_4NFE_lora (LoRA) | no disponible | no disponible | no disponible | no disponible | no disponible |
| ZhengmingYu/DMAD (LoRA) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles segun los metadatos del modelo; no se documentan otros idiomas.
- Licencia `minimax-license` con restricciones no detalladas en la informacion disponible; es imprescindible revisar el enlace de licencia antes de uso comercial.
- El modelo es un fine-tune de terceros (OliviaRossi) sobre Comfy-Org/MiniMax-H3; no procede del desarrollador original de MiniMax, por lo que la calidad y estabilidad pueden diferir del modelo oficial.
- La fusion de dos variantes con comportamiento distinto (FL2VA y Ref2VA) puede introducir artefactos en la transicion de bloques 20-34, aunque el autor afirma mitigar el contraste aplastado y las bandas oscuras.
- La poda SVD de rango 8 sobre la tabla temporal puede degradar la fidelidad temporal en secuencias largas; no se publican metricas que lo cuantifiquen.
- La cuantizacion W6A8 de 6 bits puede introducir perdida de calidad frente a INT8 o BF16; no se documenta la magnitud de esa perdida.
- Riesgo de alucinacion visual y de inconsistencias fisicas inherente a los modelos de difusion de video; no se documentan evaluaciones especificas.
- No se dispone de informacion sobre sesgos, dataset de entrenamiento ni evaluaciones de seguridad.
- El repo ocupa 36,2 GB, lo que requiere espacio en disco considerable incluso usando una sola variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OliviaRossi/Minimax-H3-Hybrid-DMAD-PDMD
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3/blob/main/LICENSE
- LoRA PDMD: https://huggingface.co/pdmd2026/pdmd_4NFE_lora
- LoRA DMAD: https://huggingface.co/ZhengmingYu/DMAD
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Paper referenciado (arXiv): arxiv:2609.35768
- Variante W6A8_G32: https://huggingface.co/OliviaRossi/Minimax-H3-Hybrid-DMAD-PDMD/resolve/main/Minimax-H3-Hybrid-DMAD-PDMD_w6a8_g32.safetensors
- Variante INT8 ConvRot: https://huggingface.co/OliviaRossi/Minimax-H3-Hybrid-DMAD-PDMD/resolve/main/Minimax-H3-Hybrid-DMAD-PDMD_int8.safetensors
