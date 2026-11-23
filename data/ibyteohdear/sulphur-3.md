# ibyteohdear/Sulphur-3

## Resumen

Sulphur-3 es un checkpoint de pesos del transformer de vídeo de MiniMax-H3, publicado por el usuario ibyteohdear en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión del fichero `s3.safetensors` de SulphurAI al árbol de módulos de la clase `MiniMaxH3PrunedTransformer3DModel` de la librería diffusers, partiendo del modelo base `multimodalart/MiniMax-H3-Pruned`. El resultado son pesos completos listos para cargar, sin LoRAs ni necesidad de fusionar o parchear nada en tiempo de carga.

El modelo resuelve el problema de compatibilidad entre un checkpoint propietario con nombres de capas y convenciones propias (proyecciones QKV fusionadas, orden de las mitades del MLP, AdaLN plegado a rango 8) y el ecosistema diffusers, que espera una nomenclatura y una geometría de tensores concretas. La conversión incluye renombrado de bloques, separación de proyecciones fusionadas, reordenación del SwiGLU y traslado del sesgo de AdaLN a un tensor float32 separado.

Con 20.111.462.920 parámetros y un repositorio de 40,2 GB, Sulphur-3 es un modelo de generación de vídeo texto-a-vídeo e imagen-a-vídeo con soporte de audio, etiquetado como no apto para todos los públicos. Su relevancia es acotada: es un artefacto de conversión de un modelo base concreto, sin métricas de rendimiento publicadas ni documentación sobre datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D de difusión (MiniMax-H3, variante pruned), con bloques de atención y token refiner |
| Parametros totales | 20.111.462.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo; el código de ejemplo del autor usa cuantización Int8 weight-only vía torchao |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (árbol de módulos diffusers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de difusión para vídeo de MiniMax-H3 en su variante pruned, con bloques `transformer_blocks` y un `token_refiner` con sus propios `refiner_blocks`. El modelo incorpora modulación AdaLN (Adaptive Layer Normalization) plegada a coordenadas de rango 8: las proyecciones originales leen `silu(time_embedder(time_proj(t)))`, una curva de paso temporal escalar que una subespacio afín de rango 8 aproxima con un RMS relativo de aproximadamente 1,5e-5. La tabla de tiempos tiene 1025 pasos en rejilla uniforme con interpolación lineal entre muestras.

La conversión realizó las siguientes operaciones sobre los pesos originales: renombrado de `blocks.*` a `transformer_blocks.*` y de `token_refiner.blocks.*` a `token_refiner.refiner_blocks.*`; separación de `attn.qkv_proj` fusionado en `to_q`, `to_k` y `to_v`; intercambio de las mitades de `mlp.fc1` (que en el release original son `[gate | value]` y en diffusers `[value | gate]`), detectado contra el modelo base en lugar de asumido; traslado del sesgo de AdaLN a `*.adaln_proj.folded_bias` en float32; y selección de la cabeza de salida del bloque `{'video': 0, 'audio': 0}` de las 32 cabezas apiladas del modelo fuente (96×32 = 3072 filas de vídeo, 32×32 = 1024 filas de audio), que reproduce `proj_out` y `audio_proj_out` del base con un error L2 relativo ≤ 8,5e-04. Se eliminó `rope.inv_freq`, que se reconstruye como no persistente en `__init__`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El autor indica que no hay ningún delta TURBO incorporado y que los LoRAs turbo habituales siguen siendo aplicables.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video), que es el pipeline declarado en el repo.
- Generación de audio junto con el vídeo (audio-video), según las etiquetas del modelo.
- Carga como componente `transformer` dentro de un pipeline de diffusers, con VAE, text encoder y schedulers provenientes del repo base.
- Compatibilidad con el encoder de texto Qwen3-VL en el ejemplo de código del autor (repositorio `patientxtr/Huihui-Qwen3-VL-8B-Instruct-abliterated-bnb-nf4`).
- Soporte de cuantización Int8 weight-only mediante torchao en el código de ejemplo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Generación de clips de vídeo a partir de una imagen de referencia: el pipeline image-to-video permite animar una imagen fija con un prompt textual, usando el transformer de Sulphur-3 como componente de denoising dentro del pipeline de MiniMax-H3.
- Producción de vídeo con audio sincronizado: las etiquetas audio-video y la cabeza de audio (`audio_proj_out`) del checkpoint permiten generar pistas de audio junto al vídeo en una sola pasada.
- Investigación sobre conversión de checkpoints: el repositorio documenta paso a paso el proceso de renombrado, des-fusión de QKV, reordenación de SwiGLU y plegado de AdaLN, lo que lo convierte en una referencia para quien necesite portar pesos propietarios a diffusers.
- Evaluación de técnicas de plegado AdaLN: el modelo sirve para estudiar el impacto de aproximar una curva de tiempo escalar con un subespacio afín de rango 8 y de muestrear fuera de la rejilla de 1025 pasos.
- Integración en pipelines modulares de diffusers: el código de ejemplo muestra cómo encadenar `MiniMaxH3PrepareLatentsStep`, `MiniMaxH3DenoiseStep` y `MiniMaxH3DecodeStep`, útil para construir flujos personalizados de generación de vídeo.
- Pruebas de cuantización en modelos de vídeo de 20B: con cuantización Int8 weight-only vía torchao, el modelo puede desplegarse en entornos con memoria limitada para experimentar con la degradación de calidad.
- Fine-tuning con LoRAs turbo: al no incorporar ningún delta TURBO, es adecuado como base para aplicar los LoRAs turbo estándar de MiniMax-H3 y acelerar la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 20.111 millones de parámetros, en bfloat16 los pesos ocupan aproximadamente 40 GB; en Int8 weight-only, alrededor de 20 GB; una cuantización de 4 bits reduciría los pesos a unos 10 GB, aunque el repo no publica variantes GGUF ni cuantizaciones listas para usar.
- GPU recomendadas: no disponible en la documentación. Por tamaño, un despliegue en bfloat16 requiere GPUs de 80 GB (A100, H100) o reparto multi-GPU; con Int8 cabría en GPUs de 24-48 GB.
- ¿Cabe en GPU de consumo? No hay confirmación del autor. En bfloat16 no cabe en ninguna GPU de consumo actual; con cuantizaciones agresivas podría intentarse en tarjetas de 24 GB, pero no está verificado.
- Opciones de despliegue: diffusers con `AutoModel.from_pretrained(..., trust_remote_code=True, dtype=torch.bfloat16)`, pipelines modulares de MiniMax-H3, y cuantización con torchao (`Int8WeightOnlyConfig`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un transformer de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sulphur-3 (ibyteohdear) | 20.111 M | no disponible | no disponible | Hugging Face, diffusers | Conversión de pesos de SulphurAI sobre MiniMax-H3-Pruned |
| MiniMax-H3-Pruned (multimodalart) | no disponible | no disponible | no disponible | Hugging Face | Modelo base declarado del que parte la conversión |
| SulphurAI/Sulphur-3 (original) | no disponible | no disponible | no disponible | Referenciado en la model card | Checkpoint fuente en formato `s3.safetensors` |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está etiquetado como `not-for-all-audiences`; puede generar contenido no apto para todos los públicos.
- La licencia no está disponible, lo que impide determinar si se permite el uso comercial. No debe usarse en producción sin aclarar este punto con el autor y con el titular de los derechos del modelo base.
- El checkpoint es una conversión de pesos, no un modelo entrenado por el autor del repo; la responsabilidad sobre los datos de entrenamiento y sus sesgos recae en el modelo original de SulphurAI y en MiniMax-H3.
- El AdaLN plegado a rango 8 es exacto en la rejilla de tiempos del sampler, pero es una aproximación fuera de ella: muestrear con sigmas desplazadas entre puntos de la rejilla no reproducirá los resultados del modelo original.
- Requiere `trust_remote_code=True`, ya que la clase no está en `MODEL_MAPPING` de diffusers; esto implica ejecutar código Python del repositorio y supone un riesgo de seguridad en entornos no controlados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- No hay información sobre sesgos, tasas de alucinación visual, idiomas soportados ni límites de contexto.
- El código de ejemplo del autor descarga un segundo repositorio (`ibyteohdear/Sulphur-3_VBVR_FUSED`) y un text encoder de un tercero (`patientxtr/Huihui-Qwen3-VL-8B-Instruct-abliterated-bnb-nf4`), lo que añade dependencias externas no auditadas.
- Si se venía usando un intercambio de pesos en tiempo de ejecución, debe desactivarse: el checkpoint ya está completo en el fichero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibyteohdear/Sulphur-3
- Modelo base: https://huggingface.co/multimodalart/MiniMax-H3-Pruned
- Repositorio auxiliar del código de ejemplo: https://huggingface.co/ibyteohdear/Sulphur-3_VBVR_FUSED
- Text encoder usado en el ejemplo: https://huggingface.co/patientxtr/Huihui-Qwen3-VL-8B-Instruct-abliterated-bnb-nf4
