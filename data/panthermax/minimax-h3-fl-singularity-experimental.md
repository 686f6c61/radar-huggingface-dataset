# PantherMax/MiniMax-H3-FL-Singularity-Experimental

## Resumen

MiniMax-H3-FL-Singularity-Experimental es un modelo de generación de vídeo a partir de imagen (image-to-video) creado por el usuario PantherMax mediante la fusión de pesos de dos checkpoints existentes de la familia MiniMax H3. No se trata de un modelo entrenado desde cero, sino de un merge que combina el destilado CFG original de FL (procedente de Comfy-Org/MiniMax-H3) con las capacidades de iluminación natural, textura y detalle facial de Singularity (WarmBloodAban/Minimax-h3_Singularity). El objetivo declarado es reducir la apariencia cerosa de FL y la borrosidad de Singularity en planos medios y largos.

El modelo se distribuye en cuatro variantes que difieren en la fuente de condicionamiento temporal (AdaLN) y en el esquema de cuantización: MA50 v2 con AdaLN de FL y MA50 v1 con AdaLN de Singularity, cada una en INT8 y W6A8. La fusión aplica una mezcla 50/50 sobre las cuatro proyecciones principales (qkv, out_proj, fc1 y fc2) de los 50 bloques del transformer, calculada en FP32 y redondeada a BF16 antes de cuantizar. El resto de tensores se hereda intacto del checkpoint base FL.

Es relevante ahora porque demuestra una técnica de composición de pesos accesible para la comunidad, orientada a flujos de trabajo en ComfyUI con adaptadores LoRA y Turbo (Pika Flex FL, DMAD H3 8-step), y porque permite ajustar el comportamiento del modelo simplemente eligiendo la variante de AdaLN sin reentrenar. Su naturaleza experimental y su licencia comunitaria acotada condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (50 bloques principales) para image-to-video, con token-refiner y proyecciones de audio/vídeo; derivado de MiniMax H3 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (group size 256, absmax por fila) y W6A8 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors (BF16 en origen, INT8/W6A8 en despliegue) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación de vídeo condicionada por imagen, con 50 bloques principales. La fusión sustituye únicamente cuatro matrices por bloque (`attn.qkv_proj`, `attn.out_proj`, `mlp.fc1`, `mlp.fc2`) mediante la interpolación lineal `FL + 0.5 × (Singularity − FL)`, calculada en FP32 y redondeada a BF16. Se elimina el prefijo `model.diffusion_model.` de las claves de Singularity para alinear la nomenclatura con FL y se conserva el orden nativo de tensores.

Del checkpoint FL se retienen sin cambios la proyección de condicionamiento, los dos bloques token-refiner, las ganancias de normalización, las proyecciones de entrada/salida de vídeo y audio y las frecuencias rotatorias. La diferencia entre variantes reside en el condicionamiento temporal: MA50 v2 conserva la tabla `adaln_t_table` y proyecciones de FL, mientras que MA50 v1 copia los 103 tensores de condicionamiento temporal de Singularity (tabla, `adaln_proj.linear.weight`/`.bias` de los 50 bloques y capa final). Solo las 200 matrices mezcladas se convierten a INT8 ConvRot con el cuantizador de Comfy-Org (group size 256, escalado absmax por fila, aritmética FP32 en CPU, 256 filas completas por chunk, `mseclip=False`); el token-refiner no se cuantiza ni se reemplaza, y no se aplica poda adicional. No hay entrenamiento ni RLHF: son pesos modificados a partir de checkpoints existentes.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) condicionada por referencia.
- Flujos de primer y último fotograma (first/last-frame workflows).
- Generación con condicionamiento por referencia (reference-conditioned generation).
- Compatibilidad con adaptadores Turbo y LoRA: Pika Flex FL y DMAD H3 8-step funcionan en ambas variantes.
- Salida de vídeo con audio, según la presencia de proyecciones de audio/vídeo heredadas de FL.
- Ajuste del comportamiento mediante selección de AdaLN (FL o Singularity) sin reentrenar.
- Integración con ComfyUI como entorno de ejecución principal.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo de texto.

## Casos de uso

- Previsualización rápida de secuencias en ComfyUI: el modelo encaja en un pipeline image-to-video para generar clips de prueba a partir de fotogramas clave, con la variante INT8 como opción de menor huella de memoria.
- Interpolación entre primer y último fotograma: útil para crear transiciones coherentes en montaje, aprovechando el soporte explícito de first/last-frame del merge.
- Generación con referencia de personaje o estilo: la capacidad reference-conditioned permite mantener consistencia visual entre planos en proyectos de animación o publicidad.
- Iteración con LoRA específicos: si el equipo ya dispone de LoRAs entrenados sobre FL, la variante MA50 v2 fl-adaln es la más compatible; si están entrenados sobre Singularity, conviene MA50 v1 sing-adaln.
- Prototipado de vídeo publicitario con movimiento expresivo: la mezcla busca movimiento más natural y mejor detalle facial en planos medios y largos, adecuado para bocetos de storyboard animado.
- Pruebas de adaptadores Turbo de 8 pasos: DMAD H3 8-step y Pika Flex FL permiten reducir pasos de inferencia en entornos de experimentación con ComfyUI.
- Evaluación comparativa de técnicas de merge: sirve como referencia para estudiar cómo afecta la interpolación de pesos y el origen del AdaLN a la calidad final del vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 75,5 GB y se distribuyen pesos INT8 y W6A8, lo que sugiere requisitos elevados; no se confirma una cifra concreta.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; el tamaño del repo y la naturaleza del modelo de vídeo apuntan a que no cabe en GPUs de consumo habituales, pero no hay dato oficial.
- Opciones de despliegue: ComfyUI es el entorno documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-FL-Singularity-Experimental (MA50) | Merge de difusión image-to-video | no disponible | no disponible | MiniMax H3 Community License | Hugging Face, 3079 descargas |
| Comfy-Org/MiniMax-H3 (FL) | Modelo base de difusión image-to-video | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |
| WarmBloodAban/Minimax-h3_Singularity | Modelo base de difusión image-to-video | no disponible | no disponible | no disponible | Hugging Face |
| MiniMaxAI/MiniMax-H3 | Modelo original de la familia | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: los pesos son una mezcla de checkpoints, no un modelo entrenado, por lo que el comportamiento puede ser inconsistente entre semillas y prompts.
- Riesgo de artefactos: el autor reconoce que v1 producía artefactos "gritty"; v2 los reduce, pero no se garantiza su eliminación total.
- Compatibilidad condicionada por el AdaLN: usar la variante equivocada con un LoRA entrenado para la otra fuente de condicionamiento puede degradar los resultados.
- Licencia restrictiva: sujeta al MiniMax H3 Community License Agreement; es necesario revisar LICENSE y NOTICE antes de cualquier uso comercial.
- Idiomas y contexto: no se documentan capacidades multilingües ni longitud de contexto, por lo que no deben asumirse.
- Sesgos y alucinación visual: no hay información sobre sesgos del dataset original ni sobre tasas de error; al ser un modelo de vídeo, pueden aparecer inconsistencias temporales o anatómicas.
- Cuantización INT8/W6A8: la conversión puede introducir pérdida de calidad frente a BF16; no se publican métricas de degradación.
- Soporte limitado: al ser un merge de un autor individual, no hay garantías de mantenimiento, documentación completa ni soporte oficial.
- Dependencia de ComfyUI: el flujo está pensado para ese ecosistema; otros entornos no están documentados.

## Enlaces

- Hugging Face: https://huggingface.co/PantherMax/MiniMax-H3-FL-Singularity-Experimental
- Modelo base Comfy-Org/MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo base MiniMaxAI/MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base WarmBloodAban/Minimax-h3_Singularity: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Adaptador DMAD H3 8-step: https://huggingface.co/ZhengmingYu/DMAD/blob/main/minimax_h3/dmad_minimax_h3_8step_full_critic_comfyui.safetensors
- Cuantizador Comfy-Org (quant_int8_convrot.py): https://github.com/Comfy-Org/comfy-model-tools/blob/d6797787e6bdb1a1fb0094d588a26f8e71a1c757/quant_int8_convrot.py
