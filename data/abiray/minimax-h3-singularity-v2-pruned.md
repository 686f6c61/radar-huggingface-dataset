# Abiray/Minimax-h3-Singularity-V2-Pruned

## Resumen

Minimax-h3-Singularity-V2-Pruned es una redistribución podada y cuantizada del checkpoint comunitario WarmBloodAban/Minimax-H3_Singularity, un ajuste del modelo generativo omnicanal MiniMax H3 desarrollado por MiniMax. El trabajo lo firma Abiray (Jay), un publicador de Hugging Face con más de 120 modelos, y su objetivo es hacer que un checkpoint de aproximadamente 34 GB quepa y se ejecute en flujos de ComfyUI con GPUs de consumo, manteniendo la fidelidad de movimiento y color del original.

El problema que resuelve es puramente de ingeniería de despliegue: el checkpoint original no cabe en tarjetas de 16-24 GB y no se integra de forma nativa con los cargadores INT8 de ComfyUI. La solución pasa por proyectar los 51 módulos de modulación AdaLN sobre un subespacio canónico de rango 8 (la base `adaln_basis` + `adaln_mean` del ecosistema Ref2VA), lo que elimina 13.030 millones de parámetros y unos 13 GB de disco, y por ofrecer dos variantes de pesos: una INT8 de 21,0 GB con el AdaLN podado sin pérdida y otra W4A8 asimétrica de 12,5 GB.

Se distribuye únicamente como safetensors para el pipeline image-to-video de ComfyUI, con licencia MiniMax H3 Community License Agreement (marcada como `other` en el Hub). Es relevante ahora porque el ecosistema de ComfyUI para H3 (LoRA podadas, PowerLoRA, codificador Qwen3-VL y VAEs de vídeo y audio) ya está consolidado y este modelo es una de las pocas vías prácticas de ejecutar la arquitectura en hardware de gama alta de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de difusión para vídeo (y audio) con modulación AdaLN; arquitectura base MiniMax H3. Estructura exacta del backbone: no disponible |
| Parametros totales | No disponible. El autor documenta la eliminación de 13.030 millones de parámetros correspondientes al AdaLN |
| Longitud de contexto | No disponible (modelo de generación de vídeo, no de lenguaje) |
| Tipos de cuantizacion | INT8 (backbone) con AdaLN podado sin pérdida; W4A8 asimétrico con codebook Lloyd-Max de 16 niveles; variantes GGUF en repositorios hermanos |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License Agreement (`license: other`) |
| Formato de pesos | safetensors (21,0 GB INT8 / 12,5 GB W4A8); GGUF en repositorios separados |
| Tamano del repositorio | 33,5 GB |
| Pipeline declarado | image-to-video (etiquetas: text-to-video, image-to-video) |
| Codificador de texto requerido | Qwen3-VL (no incluido) |
| VAEs requeridos | MiniMax-H3 Video VAE y MiniMax-H3 Audio VAE (no incluidos) |
| Precisión de capas auxiliares | RMSNorm, `adaln_t_table` y cabezas de entrada/salida de modalidad en FP32/BF16 |

## Arquitectura y entrenamiento

El modelo no se entrena: es una conversión de pesos. El checkpoint de origen (WarmBloodAban/Minimax-H3_Singularity, ~34 GB) se somete a una poda por curvas de los 51 módulos de modulación AdaLN de forma `[Out, 2688]`, proyectándolos sobre el subespacio canónico de rango 8 de Ref2VA (`adaln_basis` + `adaln_mean`). Esto elimina 13.030 millones de parámetros sin alterar, según el autor, la dinámica de movimiento. Todas las capas de normalización RMSNorm, los embeddings de timestep (`adaln_t_table`) y las cabezas de entrada/salida de modalidad se conservan en FP32/BF16 para evitar degradación numérica.

La segunda innovación técnica es la reversión de la rotación Hadamard. Los pesos originales venían rotados con ConvRot-256; el autor los des-rota aplicando la transformada butterfly exacta de ComfyUI (`H_4^⊗4`) en `float64` antes de recuantizar, con el fin de eliminar desviaciones de color y artefactos de rejilla. La variante W4A8 usa cuantización asimétrica con un codebook Lloyd-Max de 16 niveles. La compatibilidad con LoRA está garantizada al exponer la misma base de curvas `adaln_affine.safetensors` que el resto del ecosistema H3 podado.

No hay información disponible sobre el dataset de entrenamiento original de MiniMax H3, el número de tokens, la composición de datos ni las etapas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video), el pipeline declarado en el Hub.
- Generación de vídeo a partir de texto (text-to-video), según las etiquetas del repositorio.
- Generación audiovisual conjunta: el flujo requiere el VAE de vídeo y el VAE de audio de MiniMax-H3, lo que implica salida de vídeo con pista de audio.
- Integración nativa con ComfyUI mediante cargadores INT8 y nodos de cuantización mixta (`comfyui-mixed-quantizer`).
- Compatibilidad con LoRA y PowerLoRA del ecosistema H3 podado, incluida la base de curvas `adaln_affine.safetensors`.
- Control de estilo y de movimiento mediante LoRA entrenadas sobre la base canónica.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- Cobertura multilingüe de prompts: no disponible.

## Casos de uso

- Previsualización audiovisual para publicidad: generar clips cortos a partir de un fotograma o un prompt para validar dirección de arte y ritmo antes de producir, aprovechando la salida conjunta de vídeo y audio.
- Animación de stills de producto: convertir fotografías de catálogo en vídeo con movimiento de cámara controlado, usando la variante INT8 de 21 GB para máxima fidelidad de color cuando el estudio dispone de una GPU de 24 GB o superior.
- Prototipado en estaciones de trabajo de 16 GB: la variante W4A8 de 12,5 GB permite iterar en tarjetas tipo RTX 5080 o 4080 con descarga parcial de capas a RAM, algo inviable con el checkpoint original de 34 GB.
- Creación de LoRA de estilo: el modelo mantiene la base `adaln_affine` canónica, por lo que sirve como punto de partida para entrenar y aplicar LoRA de estética o de personaje dentro de ComfyUI.
- Postproducción y storyboarding: generar variantes de una misma toma image-to-video variando la semilla y el prompt, para seleccionar la mejor transición antes de un render final.
- Investigación sobre cuantización: el par INT8/AdaLN podado frente a W4A8 con Lloyd-Max constituye un caso de estudio reproducible del impacto de la poda estructural en modelos de difusión para vídeo.
- Automatización de pipelines de contenido: integración en un grafo de ComfyUI con cola de trabajos para producir clips cortos a escala, con el codificador Qwen3-VL compartido entre peticiones para amortizar VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas objetivas (FVD, CLIP-score, VBench ni similares) ni comparaciones cuantitativas con el checkpoint sin podar; la afirmación de poda "sin pérdida" es una declaración del autor y no está verificada de forma independiente.

## Requisitos de hardware

- VRAM estimada para la variante INT8 (21,0 GB de pesos): 24 GB como mínimo para carga completa, con margen escaso; 40-80 GB (A100, H100) para trabajar con comodidad y sin descarga de capas.
- VRAM estimada para la variante W4A8 (12,5 GB de pesos): a partir de 16 GB con descarga parcial; 24 GB para un flujo holgado.
- Hay que sumar la VRAM del codificador Qwen3-VL y de los dos VAEs (vídeo y audio), que no están incluidos en el repositorio y cuyo tamaño no se detalla en la información disponible. En la práctica, esto puede desplazar el requisito un escalón por encima de lo que sugiere el tamaño del safetensors.
- GPUs recomendadas: RTX 4090 / RTX 3090 (24 GB) para la variante INT8; RTX 4080, RTX 5080 o RTX 4090 para la W4A8; A100 40/80 GB y H100 para inferencia sin concesiones.
- Despliegue: ComfyUI con cargadores INT8 nativos o el nodo `comfyui-mixed-quantizer`; para las variantes GGUF, ComfyUI-GGUF. No se documenta soporte de vLLM ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del número de pasos de difusión, la resolución y el frame count, parámetros que la model card no especifica.

## Comparativa con modelos similares

| Modelo | Formato y tamano | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Abiray/Minimax-h3-Singularity-V2-Pruned (INT8) | safetensors, 21,0 GB | No disponible (13.030 M podados del AdaLN) | No aplica | MiniMax H3 Community | Publico en HF, 46 descargas |
| Abiray/Minimax-h3-Singularity-V2-Pruned (W4A8) | safetensors, 12,5 GB | No disponible | No aplica | MiniMax H3 Community | Publico en HF |
| WarmBloodAban/Minimax-h3_Singularity | safetensors, ~34 GB | No disponible | No aplica | MiniMax H3 Community | Publico en HF (modelo de origen) |
| Abiray/Minimax-h3-Singularity-V2-Pruned-GGUF | GGUF, tamano no disponible | No disponible | No aplica | MiniMax H3 Community | Publico en HF |
| MiniMax-H3 (MiniMax) | No disponible | No disponible | No aplica | MiniMax H3 Community License | Referencia arquitectonica y titular de la licencia |

## Limitaciones y advertencias

- La afirmación de poda "100 % sin pérdida" procede del autor y no está respaldada por métricas publicadas; conviene validar la calidad visual y de movimiento contra el checkpoint original antes de usarlo en producción.
- La poda afecta exclusivamente al AdaLN: no se reduce el backbone, de ahí que la variante INT8 siga pesando 21 GB y no quepa en GPUs de 16 GB.
- La variante W4A8 introduce una cuantización de 4 bits en pesos con codebook de 16 niveles; es esperable cierta pérdida de fidelidad frente a INT8, aunque no se cuantifica en la información disponible.
- El modelo no incluye el codificador de texto ni los VAEs: un usuario que lo descargue sin el stack completo (Qwen3-VL + VAE de vídeo + VAE de audio) no podrá ejecutarlo.
- La licencia MiniMax H3 Community License Agreement no es una licencia open source estándar; impone condiciones específicas de uso comercial que deben revisarse en el enlace oficial antes de cualquier despliegue productivo.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni evaluación de seguridad del modelo base, por lo que el riesgo de sesgos demográficos o estereotipos en el vídeo generado no está caracterizado.
- Riesgo de alucinación visual y de artefactos (deformaciones anatómicas, incoherencia temporal, texto ilegible) inherente a los modelos de difusión para vídeo; no se han publicado evaluaciones al respecto para esta conversión.
- Cobertura de idiomas en los prompts no documentada; el rendimiento con prompts en castellano no está verificado.
- Modelo con 46 descargas y 15 likes en el momento de la ficha: la validación comunitaria es todavía muy limitada.
- La fecha de creación del repositorio es el 22 de octubre de 2026 y la de actualización el mismo día, lo que sugiere una publicación reciente y sujeta a cambios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Abiray/Minimax-h3-Singularity-V2-Pruned
- Modelo base: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Variante GGUF de este modelo: https://huggingface.co/Abiray/Minimax-h3-Singularity-V2-Pruned-GGUF
- Repositorio GGUF podado de MiniMax H3: https://huggingface.co/Abiray/MiniMax-H3-Pruned-GGUF
- Perfil del autor: https://huggingface.co/Abiray
- Texto de la licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/raw/main/LICENSE
- Hilo en r/StableDiffusion sobre Singularity V2: https://www.reddit.com/r/StableDiffusion/comments/1xbx2lk/minimax_h3_singularity_v2_was_updated_to_the_new/
