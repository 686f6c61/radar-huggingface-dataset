# ibyteohdear/10Eros-Max-Transformer_hybrid_beta5_VBVR_FUSED

## Resumen

10Eros-Max-Transformer_hybrid_beta5_VBVR_FUSED es un checkpoint de pesos del transformer de vídeo de MiniMax-H3, reconvertido al árbol de módulos de diffusers por el usuario ibyteohdear. No es un modelo entrenado desde cero ni un LoRA: son los pesos completos del transformer de un fine-tune comunitario (10Eros-Max, a partir de multimodalart/MiniMax-H3-Pruned) reorganizados para cargarse directamente con `AutoModel.from_pretrained(..., trust_remote_code=True)` en diffusers. El repositorio contiene unos 20.111 millones de parámetros en safetensors, con un tamaño total de 40,2 GB.

El problema que resuelve es de ingeniería de formato: el checkpoint original venía con nombres de módulos propios, proyecciones QKV fusionadas, el MLP en orden `[gate | value]` y las proyecciones AdaLN plegadas. Este repo renombra bloques, desfusiona la atención, reordena el SwiGLU a `[value | gate]`, conserva las proyecciones AdaLN de rango 8 con sesgo en float32 y elimina `rope.inv_freq`. El resultado se carga sin merge, sin fold ni parcheo en tiempo de ejecución.

Es relevante para quien quiera ejecutar el pipeline MiniMax-H3 (texto a vídeo, imagen a vídeo y audio-vídeo) apuntando el componente `transformer` a este repositorio, manteniendo VAE, codificador de texto y schedulers del repo base. La model card advierte de que la aproximación AdaLN es exacta solo en la rejilla de timesteps del sampler (1025 pasos), por lo que no debe muestrearse fuera de esa rejilla si se espera reproducir el comportamiento del modelo liberado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D para difusión de vídeo (MiniMax-H3 pruned), con AdaLN de rango 8 y token refiner; clase `MiniMaxH3PrunedTransformer3DModel` |
| Parametros totales | 20.111.462.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificados en el repo; el código de ejemplo usa `TorchAoConfig` con `Int8WeightOnlyConfig` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (árbol de módulos diffusers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer 3D de difusión para generación de vídeo, derivado de MiniMax-H3 en su variante podada (`multimodalart/MiniMax-H3-Pruned`). Incluye bloques `transformer_blocks` y un `token_refiner` con `refiner_blocks`, proyecciones de parche, salida y condicionamiento, atención con proyecciones Q/K/V separadas y un MLP SwiGLU en orden `[value | gate]`. El condicionamiento temporal usa AdaLN con proyecciones de rango 8, un `time_embedder.table` de 1025×8 y las matrices `adaln_basis` / `adaln_mean` incluidas en el propio fichero. Las proyecciones AdaLN aproximan la curva `silu(time_embedder(time_proj(t)))` con un error relativo RMS de ~1.5e-5 en la rejilla de 1025 pasos.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El autor indica que este repositorio es una conversión de formato del checkpoint `TenStrip/10Eros-Max/10Eros_Max_h3_hybrid_beta5.safetensors`, con validación contra la referencia: conjunto exacto de claves, coseno por tensor en pesos muestreados, evaluación del intercambio SwiGLU en ambos sentidos, `folded_bias` y consistencia de gauge entre pesos y tabla. La base AdaLN de este fichero difiere de la referencia `adaln_affine.safetensors` en el signo por columna (`++++----`), lo que es arbitrario en la SVD y no altera el cálculo. No se ha horneado ningún delta TURBO; los LoRA turbo habituales siguen siendo aplicables.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante el pipeline MiniMax-H3.
- Generación de vídeo a partir de imagen (image-to-video), pipeline declarado en el repo.
- Generación de audio-vídeo, según las etiquetas del repositorio (`audio-video`).
- Integración como componente `transformer` de un pipeline modular de diffusers, con VAE (`AutoencoderKLMiniMaxH3`), VAE de audio (`AutoencoderKLMiniMaxH3Audio`) y codificador de texto Qwen3-VL.
- Carga directa con `AutoModel.from_pretrained` y `trust_remote_code=True`, sin merge ni parcheo en tiempo de ejecución.
- Compatibilidad con LoRA turbo externos (no incluidos en el checkpoint).
- No se documentan tool calling, agentes, razonamiento multi-paso ni capacidades multilingües propias; el soporte de idioma depende del codificador de texto del pipeline base.

## Casos de uso

- Generación de clips de vídeo a partir de prompts de texto: se carga este transformer como componente del pipeline MiniMax-H3 y se mantienen VAE, codificador de texto y schedulers del repo base, lo que permite sustituir únicamente el transformer sin reescribir el pipeline.
- Animación de imágenes fijas (image-to-video): útil para convertir storyboards o fotografías en clips con movimiento, aprovechando que el pipeline declarado es `image-to-video`.
- Producción de vídeo con audio sincronizado: las etiquetas `audio-video` y el uso de `AutoencoderKLMiniMaxH3Audio` en el código de ejemplo indican soporte para generar pistas de audio junto al vídeo.
- Investigación sobre conversión de checkpoints: el repositorio documenta paso a paso el renombrado, desfusión de QKV, reordenado SwiGLU y plegado AdaLN, y sirve como referencia reproducible para portar otros checkpoints de MiniMax-H3 a diffusers.
- Evaluación de fine-tunes comunitarios: al ser un fine-tune de 10Eros-Max sobre MiniMax-H3-Pruned, permite comparar el comportamiento del fine-tune frente al base manteniendo el mismo pipeline.
- Despliegue en entornos con cuantización: el código de ejemplo aplica `TorchAoConfig` con `Int8WeightOnlyConfig`, lo que facilita ejecutar el transformer en GPUs con menos VRAM que la requerida en bfloat16.
- Pruebas de compatibilidad de LoRA: al no incluir deltas TURBO, se puede aplicar LoRA turbo externos y verificar su efecto sobre este checkpoint convertido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: con 20.111 millones de parámetros, los pesos ocupan aproximadamente 40 GB, por lo que la inferencia en bf16 requiere del orden de 40 GB solo para el transformer, más la memoria del VAE, el VAE de audio, el codificador de texto Qwen3-VL y las activaciones.
- Cuantización int8 weight-only: el código de ejemplo usa `TorchAoConfig` con `Int8WeightOnlyConfig`, lo que reduce los pesos a unos 20 GB aproximadamente, aunque no se documentan cifras oficiales de VRAM ni de latencia.
- GPU recomendadas: no disponibles de forma oficial; por tamaño, el transformer en bf16 no cabe en GPUs de consumo de 24 GB y requiere aceleradores de 40-80 GB (A100 80 GB, H100) o configuraciones multi-GPU. Con cuantización int8 podría intentarse en GPUs de 24-32 GB, pero no hay confirmación del autor.
- Cabe en consumer GPU: no en bf16; en int8 es posible en teoría en tarjetas de 24 GB o más, sin datos verificados.
- Opciones de despliegue: diffusers con `AutoModel` y `trust_remote_code=True`, pipeline modular `minimax_h3` de diffusers, y `torchao` para cuantización. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un transformer de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros-Max-Transformer_hybrid_beta5_VBVR_FUSED | 20.111 M | no disponible | Transformer de difusión de vídeo (MiniMax-H3 pruned) | no disponible | HuggingFace, 101 descargas |
| multimodalart/MiniMax-H3-Pruned | no disponible | no disponible | Transformer de difusión de vídeo (base podado) | no disponible | HuggingFace (repo base) |
| MiniMax-H3 (original) | no disponible | no disponible | Transformer de difusión de vídeo | no disponible | no disponible en la información proporcionada |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, tipo y disponibilidad.

## Limitaciones y advertencias

- La aproximación AdaLN de rango 8 es exacta solo en la rejilla de 1025 timesteps del sampler; muestrear fuera de esa rejilla (por ejemplo, sigmas desplazadas entre puntos de la rejilla) no reproduce el comportamiento del modelo liberado.
- La base AdaLN de este fichero difiere de la referencia en el signo por columna; es consistente internamente, pero debe tenerse en cuenta al mapear LoRA AdaLN de checkpoints liberados.
- No se ha horneado ningún delta TURBO; si se esperaba un modelo acelerado, hay que aplicar LoRA turbo externos.
- Requiere `trust_remote_code=True` porque la clase no está en `MODEL_MAPPING` de diffusers; esto implica ejecutar código del repositorio y revisar `modeling_minimax_h3_pruned.py` antes de usarlo en producción.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no disponibles; el comportamiento multilingüe depende del codificador de texto del pipeline base.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un fine-tune comunitario de vídeo, los sesgos dependerán del dataset de fine-tune, no especificado.
- El repositorio tiene 0 likes y 101 descargas, y fue creado y actualizado en noviembre de 2026; no hay evidencia de validación independiente más allá de la del propio autor.
- El código de ejemplo de la model card está incompleto (cortado a mitad de la definición de `MLP_FILENAME`) y hace referencia a ficheros auxiliares (`mmh3-8b-ClipProj-v3.1.safetensors`) que no se detallan por completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_hybrid_beta5_VBVR_FUSED
- Modelo base: https://huggingface.co/multimodalart/MiniMax-H3-Pruned
- Checkpoint de origen citado en la model card: `TenStrip/10Eros-Max/10Eros_Max_h3_hybrid_beta5.safetensors` (no se proporciona URL directa)
- Documentación de diffusers: https://huggingface.co/docs/diffusers
- Referencia `adaln_affine.safetensors` citada en la model card (no se proporciona URL directa)
