# cs-mshah/combined_abl_fgpred_type4

## Resumen

LayerGen es un modelo de difusión para descomposición y armonización de video, desarrollado por el investigador cs-mshah dentro del proyecto LayerGen. Se trata de un checkpoint combinado (tipo 4, EMA) que integra en un único modelo las dos direcciones de generación de capas de video: la descomposición (composite + máscara → foreground + background) y la armonización (foreground + background → composite). Está construido sobre la base de Wan2.2-14B, un diffusion transformer de 40 capas con dimensión de 5120, acoplado al VAE AutoencoderKLWan y al text encoder UMT5.

El modelo se ha entrenado a 480×832 píxeles con 41 frames (11 latentes), usando flow-shift 3.0, en un clúster de 4 nodos con GPUs B200 y batch global de 32. El checkpoint publicado corresponde a los pesos EMA en el paso 8000, almacenados en formato fp32 (~53 GB) pero capaces de cargarse en bf16 (~28 GB residentes) en una sola GPU de 80 GB. Su relevancia reside en que es uno de los primeros modelos abiertos que unifica ambas direcciones de generación de capas de video en una sola arquitectura multi-stream, con una embedding específica por tarea seleccionada en inferencia.

La licencia es de tipo research-preview (solo reproducción científica) y el código de inferencia es interno, lo que limita su uso a quienes tengan acceso al stack de LayerDecomp de FastVideo. Es un modelo de investigación, no apto para producción comercial sin contacto previo con los autores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) multi-stream basado en Wan2.2-14B, 40 capas, dimensión 5120, con VAE AutoencoderKLVideo y encoder UMT5 |
| Parámetros totales | ~14 mil millones (heredados de Wan2.2-14B, solo el DiT entrenado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 41 frames (11 latentes) en entrenamiento; extensible a 61/81 frames con interpolación RoPE |
| Tipos de cuantización | no disponible (almacenado fp32, ejecutable en bf16) |
| Idiomas soportados | no disponible (depende del encoder UMT5 de Wan2.2, que soporta principalmente inglés y chino) |
| Licencia | research-preview-see-card (no comercial, solo reproducción; base Wan2.2 bajo licencia Wan-AI) |
| Formato de pesos | DCP (PyTorch Distributed Checkpoint) parcial (roles.*), fp32, ~53 GB; carga en bf16 (~28 GB) |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer multi-stream construido sobre Wan2.2-14B. En lugar de un único stream de tokens, la arquitectura procesa múltiples streams de video simultáneamente (composite, máscara, foreground, background y un quinto stream dedicado al foreground corrupto en la variante tipo 4). Cada tarea (descomposición o armonización) se selecciona en inferencia mediante una embedding específica por tarea aplicada al transformer. La variante tipo 4 (fg-pred type-4) se distingue porque el foreground corrupto se trata como un quinto tipo de stream dedicado (id 4), en lugar de compartir el tipo del foreground pristino, y porque la armonización también predice el foreground prístino.

El entrenamiento se realizó a 480×832 píxeles con 41 frames (11 frames latentes), flow-shift 3.0, en 4 nodos con GPUs B200 y un batch global de 32. Se usaron captions grounded editcap2. El checkpoint es el EMA en el paso 8000, guardado como DCP parcial que solo contiene los pesos del transformer entrenado; el VAE y el text encoder se cargan desde una instalación local de Wan2.2-14B en formato diffusers. El DCP se re-shardea automáticamente desde la malla de 4 nodos a una sola GPU al cargar.

## Capacidades

- Descomposición de video: dado un composite y una máscara, genera el foreground y el background por separado.
- Armonización de video: dado un foreground y un background, genera el composite combinado.
- Predicción de foreground prístino: en la dirección de armonización, además de generar el composite, predice el foreground sin corrupción.
- Manejo de contextos largos: entrenado para 41 frames, extensible a 61 o 81 frames con interpolación RoPE.
- Generación de video coherente temporalmente gracias a la arquitectura de difusión con flujo (flow-matching).
- Inferencia con per-task embedding: el mismo checkpoint sirve para ambas direcciones (descomposición y armonización) seleccionando la tarea en la configuración.
- Requiere código interno de FastVideo (LayerDecomp) para ejecutar inferencia.

## Casos de uso

- Postproducción de video profesional: descomponer un clip compuesto en capas de foreground y background para reiluminar, recolorear o reemplazar elementos sin re-renderizar el original.
- Armonización de capas en VFX: combinar un foreground filmado en estudio con un background real, ajustando iluminación y color para que la integración sea natural.
- Edición no destructiva de video: los artistas pueden trabajar sobre las capas por separado y recomponer al final, preservando la calidad del original.
- Generación de datos sintéticos para entrenamiento de visión: crear pares composite/foreground/background para entrenar modelos de segmentación o de separación de capas.
- Restauración de video antiguo: dado un composite dañado (por ejemplo, con ruido o manchas) y una máscara, extraer el foreground y el background limpios.
- Investigación en modelos de difusión de video: como checkpoint de reproducción para estudios sobre descomposición de capas, embeddings por tarea y arquitecturas multi-stream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas cuantitativas (PSNR, SSIM, LPIPS, FVD, etc.) para comparar la calidad de descomposición o armonización con otros métodos. Solo se indica que el modelo se entrenó hasta el paso 8000 con EMA, pero sin tablas de evaluación.

## Requisitos de hardware

- VRAM: se recomienda una GPU con 80 GB de memoria. El modelo en bf16 ocupa aproximadamente 28 GB residentes, por lo que cabe en una sola GPU de 80 GB.
- GPUs compatibles: A100-80G, H100, H200 o B200. Se requiere FlashAttention (o TORCH_SDPA como alternativa).
- No cabe en GPUs de consumo (RTX 4090 de 24 GB, etc.) por el requisito de 80 GB.
- Despliegue: solo mediante el stack de FastVideo con el código interno de LayerDecomp (branch prompt-fix-infer, commit b7ccac76). No hay soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La inferencia usa 30 pasos de difusión y requiere el pipeline de FastVideo con torchrun.

## Comparativa con modelos similares

No disponible. No hay información sobre modelos comparables de descomposición/armonización de video de código abierto con los que comparar (como LayerDecomp de otros autores o modelos de separación de capas en video). La categoría es muy específica y el autor no publica comparaciones.

## Limitaciones y advertencias

- Licencia restrictiva: research-preview-see-card, no permite uso comercial sin contacto previo con los autores. Además, hereda la licencia Wan-AI del modelo base.
- Código de inferencia no público: requiere acceso al código interno de FastVideo (LayerDecomp, branch prompt-fix-infer), por lo que no es reproducible sin ese acceso.
- Riesgo de alucinación visual: como modelo de difusión, puede generar detalles irreales en las capas predichas, especialmente en regiones con poca información de la máscara.
- Sesgos desconocidos: no se han publicado análisis de sesgos o de comportamiento en dominios fuera de los datos de entrenamiento.
- Limitaciones de contexto: entrenado solo a 41 frames; para clips más largos se requiere interpolación RoPE, que puede degradar la calidad temporal.
- Dependencia de un modelo base Wan2.2-14B: es necesario descargar y tener localmente el modelo Wan2.2-14B en formato diffusers para cargar el VAE y el encoder de texto.
- Sin cuantizaciones: no hay versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de menor capacidad.
- Sin soporte para tool calling, agentes ni razonamiento multimodal: es un modelo de generación de video, no un LLM conversacional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cs-mshah/combined_abl_fgpred_type4
- No se han encontrado papers, repos de código públicos ni demos asociados en la información disponible. El código de inferencia es interno del proyecto FastVideo (branch prompt-fix-infer, commit b7ccac76) y no se ha publicado un enlace público.
