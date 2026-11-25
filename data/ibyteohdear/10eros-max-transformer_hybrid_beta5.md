# ibyteohdear/10Eros-Max-Transformer_hybrid_beta5

## Resumen

10Eros-Max-Transformer_hybrid_beta5 es un checkpoint de pesos del transformer de difusión de MiniMax-H3, reconvertido al árbol de módulos de `diffusers` por el usuario `ibyteohdear`. No se trata de un modelo entrenado desde cero ni de una LoRA: son los pesos completos del transformer de vídeo-audio de MiniMax-H3, derivados del modelo base `multimodalart/MiniMax-H3-Pruned`, con las proyecciones AdaLN plegadas a coordenadas de rango 8 y los pesos renombrados y reordenados para encajar en la clase `MiniMaxH3PrunedTransformer3DModel`. El checkpoint suma 20.111.462.920 parámetros y ocupa 82,9 GB en el repositorio.

El modelo resuelve un problema de ingeniería concreto: permitir cargar los pesos de MiniMax-H3 directamente en `diffusers` mediante `AutoModel.from_pretrained(..., trust_remote_code=True)`, sin necesidad de fusionar LoRAs, aplicar parches en tiempo de carga ni ejecutar swaps de pesos en runtime. La model card documenta con detalle el proceso de conversión (renombrado de bloques, des-fusión de `attn.qkv_proj`, reordenación de las mitades SwiGLU de `mlp.fc1`, plegado AdaLN y recorte de la cabeza de salida apilada de 32 bloques).

Es relevante para quien quiera experimentar con generación de vídeo-audio de MiniMax-H3 en un pipeline modular de `diffusers` sin depender del código original del modelo. El repositorio está etiquetado como `not-for-all-adult-content` (not-for-all-audiences) y su licencia no está declarada. La información pública disponible es escasa: 283 descargas, 2 likes y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión 3D para vídeo y audio (MiniMax-H3 pruned), con AdaLN de rango 8 y token refiner |
| Parametros totales | 20.111.462.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el ejemplo de código usa `dtype=torch.bfloat16` y `Int8WeightOnlyConfig` de torchao para el VAE |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (árbol de módulos `diffusers`, con `config.json`, `modeling_minimax_h3_pruned.py` y `auto_map`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusión 3D para generación conjunta de vídeo y audio, derivado de MiniMax-H3 y podado en el modelo base `multimodalart/MiniMax-H3-Pruned`. El checkpoint conserva los bloques `transformer_blocks.*` y `token_refiner.refiner_blocks.*`, con proyecciones de atención separadas en `to_q`/`to_k`/`to_v` (des-fusionadas desde un `attn.qkv_proj` original), MLP con SwiGLU cuyas mitades `[gate | value]` se han reordenado a `[value | gate]` para `ff.net.0.proj`, y una cabeza de salida que en el modelo fuente apila 32 bloques (96×32 = 3072 filas de vídeo y 32×32 = 1024 filas de audio); aquí se conserva únicamente el bloque 0, que reproduce la cabeza del modelo base con coseno 0,996955.

La modulación AdaLN se ha plegado a un subespacio afín de rango 8 que aproxima la curva `silu(time_embedder(time_proj(t)))` con un RMS relativo de ~1,5e-5. La tabla `time_embedder.table` tiene 1025×8 entradas sobre una rejilla uniforme de 1025 pasos, interpolada linealmente entre muestras; esto implica que la aproximación es exacta en la rejilla de timesteps del sampler y aproximada fuera de ella. El sesgo se traslada a `*.adaln_proj.folded_bias` en float32. La model card indica que no se ha incrustado ningún delta TURBO y que las LoRAs turbo habituales siguen siendo aplicables. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF/DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), según la etiqueta `text-to-video`.
- Generación de vídeo a partir de imagen (image-to-video), según la etiqueta `image-to-video` y el pipeline declarado.
- Generación conjunta de vídeo y audio (audio-video), según la etiqueta `audio-video`.
- Carga directa en `diffusers` mediante `AutoModel.from_pretrained` con `trust_remote_code=True`, resolviendo la clase a través de `auto_map` en `config.json`.
- Compatibilidad con el pipeline modular de MiniMax-H3 en `diffusers` (pasos `MiniMaxH3PrepareLatentsStep`, `MiniMaxH3PrepareLayoutStep`, `MiniMaxH3SetTimestepsStep`, `MiniMaxH3SetupStep`, `MiniMaxH3DenoiseStep`, `MiniMaxH3TextEncoderStep`, entre otros).
- Compatibilidad con LoRAs turbo externas (no se ha incrustado ningún delta TURBO).
- Tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código y capacidades multilingües: no disponible (no es un modelo de lenguaje, es un transformer de difusión).

## Casos de uso

- Prototipado de generación de vídeo-audio en `diffusers`: cargar el checkpoint como componente `transformer` del pipeline modular de MiniMax-H3 y generar clips con pista de audio sincronizada, aprovechando que los pesos ya están en el árbol de módulos de `diffusers` y no requieren fusión ni parches.
- Investigación sobre plegado AdaLN: el checkpoint sirve como referencia práctica de cómo se pliega una modulación AdaLN a un subespacio de rango 8, con `adaln_basis`, `adaln_mean` y `folded_bias` incluidos en el propio fichero, útil para estudiar aproximaciones de bajo rango en transformers de difusión.
- Desarrollo de LoRAs sobre MiniMax-H3: la model card indica que `project_adaln_lora` mapea correctamente una LoRA AdaLN de un checkpoint liberado, y que `adaln_basis` es la base propia de este fichero, lo que permite entrenar y proyectar LoRAs sobre este checkpoint.
- Integración en aplicaciones de image-to-video: usar el pipeline `image-to-video` con una imagen de partida para generar animaciones con audio, apuntando el componente `transformer` a este repositorio y tomando el VAE, el text encoder y los schedulers del repositorio base.
- Experimentación con cuantización: el ejemplo de la model card usa `torchao.quantization.quantize_` con `Int8WeightOnlyConfig` para el VAE, lo que sirve como base para probar esquemas de cuantización en el transformer y medir su impacto en la calidad de generación.
- Evaluación de fidelidad de conversión: el checkpoint incluye verificaciones documentadas (coseno por tensor en float64, comparación de formas contra las cabeceras del modelo de referencia, evaluación de la modulación AdaLN sobre los 1025 timesteps), lo que lo convierte en un caso de estudio para pipelines de conversión de pesos entre formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el checkpoint tiene 20.111.462.920 parámetros; en bfloat16 (2 bytes por parámetro) los pesos del transformer ocuparían aproximadamente 40 GB, a lo que hay que sumar el VAE, el text encoder (el ejemplo usa `Qwen3VLForConditionalGeneration` de 8B o 32B, o alternativas de 4B) y las activaciones.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del transformer, se requiere al menos una GPU con 40 GB o más para bfloat16 sin cuantizar; configuraciones multi-GPU o cuantización a int8 serían necesarias para GPUs de menor VRAM.
- ¿Cabe en GPU consumer? No disponible. Con 20,1B parámetros, no cabe en GPUs consumer de 24 GB en bfloat16 sin cuantización agresiva u offload.
- Opciones de despliegue: `diffusers` con `AutoModel.from_pretrained(..., trust_remote_code=True)` y el pipeline modular `minimax_h3`. El ejemplo de la model card también usa `torchao` para cuantización int8 del VAE y `huggingface_hub` para descarga selectiva de `diffusers/*`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un transformer de difusión de este tipo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros-Max-Transformer_hybrid_beta5 | 20.111.462.920 | no disponible | no disponible | safetensors (diffusers) | Hugging Face, 283 descargas |
| multimodalart/MiniMax-H3-Pruned (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| MiniMax-H3 (modelo original, referencia) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos de rendimiento, contexto ni licencia de las alternativas en la información proporcionada, por lo que la comparación se limita a la disponibilidad y al formato.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; no se puede confirmar el uso comercial.
- El repositorio está etiquetado como `not-for-all-adult-content` (not-for-all-audiences), lo que implica contenido potencialmente sensible y requiere control de acceso en producción.
- La aproximación AdaLN de rango 8 es exacta solo en la rejilla de 1025 timesteps del sampler; muestrear fuera de la rejilla (por ejemplo, con sigmas desplazadas entre puntos de la rejilla) produce resultados distintos a los del modelo liberado.
- La cabeza de salida se ha recortado al bloque 0 de los 32 apilados; aunque la model card reporta coseno 0,996955 frente a la base, existe una diferencia relativa L2 del 12,54% que puede afectar a la fidelidad de la generación.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio (`modeling_minimax_h3_pruned.py`); conviene auditar ese código antes de usarlo en producción.
- El pipeline completo necesita componentes adicionales (VAE, text encoder, schedulers) del repositorio base; este repositorio solo contiene el transformer.
- No hay información sobre sesgos, riesgo de alucinación, limitaciones idiomáticas ni latencia/throughput.
- El autor reporta solo 283 descargas y 2 likes, lo que indica una validación comunitaria muy limitada.
- La fecha de creación reportada (2026-11-01) es posterior a la fecha actual en el momento de redactar esta ficha; conviene verificar la vigencia de los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_hybrid_beta5
- Modelo base: https://huggingface.co/multimodalart/MiniMax-H3-Pruned
- Documentación de `diffusers` (referencia general): https://huggingface.co/docs/diffusers
- Repositorio de `diffusers` en GitHub: https://github.com/huggingface/diffusers
- `torchao` (cuantización): https://github.com/pytorch/ao
- Text encoder de ejemplo (Qwen3-VL-8B): https://huggingface.co/prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3
- Text encoder de ejemplo (Qwen3-VL-4B): https://huggingface.co/prithivMLmods/Qwen3-VL-4B-Instruct-c_abliterated-v2
- Text encoder alternativo (Qwen3-VL-32B, NF4): https://huggingface.co/ibyteohdear/qwen3_vl_32b_bnb_nf4
