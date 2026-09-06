# reallusion4free/ltx-2.3-10eros-v1.3-dmd-mlx-q4

## Resumen

El modelo es una cuantización int4 (MLX) de TenStrip/LTX2.3-10Eros, un modelo de generación de vídeo basado en LTX-2.3. Lo desarrolla el usuario reallusion4free para ejecutarse exclusivamente en Apple Silicon. El problema que resuelve es la generación de vídeo a partir de texto o de imágenes mediante un flujo destilado de dos etapas, con una huella de memoria reducida gracias a la cuantización de 4 bits. Es relevante porque incorpora la destilación DMD de JoyAI Echo fusionada directamente en los pesos del transformer, eliminando la necesidad de una LoRA de destilación en tiempo de ejecución. El repositorio ocupa 23.0 GB, donde el transformer cuantizado a int4 pesa aproximadamente 11.6 GB. La arquitectura es un transformer de difusión (DiT) con conectores Gemma → DiT, acompañado de VAE de vídeo, upscalers espaciales y temporales, y un vocoder. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para vídeo con conectores Gemma → DiT, VAE de vídeo (8x temporal, 32x espacial), audio VAE, vocoder BigVGAN v2 y upscalers espaciales/temporales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (q4) con group size 32, aplicada a capas `nn.Linear` dentro de `transformer_blocks`; el resto (AdaLN, proyecciones, conectores, VAE, vocoder) en bf16 |
| Idiomas soportados | no disponibles |
| Licencia | ltx-2-license (otra, con restricciones; consultar `LICENSE.txt`) |
| Formato de pesos | Safetensors (int4 MLX) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusión para vídeo, diseñado para generar secuencias de vídeo a partir de texto o de una imagen inicial. El modelo utiliza un codificador de texto externo (Gemma 3 12B) que se conecta al DiT mediante conectores de embedding. Incluye además un VAE de vídeo con factor de compresión 8x temporal y 32x espacial, un audio VAE, un vocoder BigVGAN v2 con generador BWE, y dos upscalers espaciales (1.5x y 2x) más un upscaler temporal (2x).

El entrenamiento no está documentado en la información proporcionada, pero la model card indica que se trata de una destilación DMD de JoyAI Echo (rank 256, derivada de la LoRA de destilación de LTX 1.1) fusionada en el modelo base 10Eros v1.3 a fuerza 1.0. Esto produce un transformer destilado autónomo, sin transformer dev y sin fusión de LoRA en tiempo de ejecución. La destilación DMD se introduce como una alternativa a la LoRA nativa de rank 384, evitando la deriva de resampling y la sobrescritura de detalles que la LoRA original provoca en la etapa de refinamiento. El modelo fue convertido con `mlx-forge` y empaquetado para `ltx-2-mlx`, un port de LTX-2 para Apple Silicon. La cuantización int4 con group size 32 se aplica solo a capas `nn.Linear` dentro de los `transformer_blocks`; MLX no puede cuantizar capas Conv, por lo que el resto de componentes permanecen en bf16.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y a partir de imagen (image-to-video).
- Flujo destilado de dos etapas: se genera una primera pasada a media resolución y después se aplica upscaling y refinamiento a resolución completa.
- Generación de audio integrada mediante vocoder BigVGAN v2 y audio VAE.
- Cuantización int4 para reducir la memoria residente, con opción de streaming por bloques (`--low-ram`) en Macs de 16 GB.
- Soporte de muestreo con samplers compatibles con LTX (Euler, etc.) sin necesidad de carga personalizada.
- No soporta el pipeline one-stage-dev ni el two-stage con dev, porque el paquete omite intencionadamente el transformer dev.
- No admite tool calling, ni agentes, ni razonamiento multi-step en el sentido clásico: es un modelo de difusión de vídeo.

## Casos de uso

- Creación de clips cortos para redes sociales: con la resolución de ejemplo 480x704 y 97 frames, el modelo puede generar vídeos breves directamente desde un prompt, aunque hay que filtrar el contenido adulto para plataformas generalistas.
- Animación de imágenes estáticas: mediante la opción `--image`, una fotografía puede convertirse en un vídeo animado, útil para producir metraje de relleno o efectos visuales en postproducción.
- Prototipado de escenas para VFX: el flujo de dos etapas con upscalers espaciales y temporales permite previsualizar una escena a baja resolución y refinarla después, lo que resulta práctico para iterar antes de un render final.
- Investigación en destilación de modelos de difusión: al estar la destilación DMD fusionada en los pesos, sirve como caso de estudio para comparar la calidad de una destilación integrada frente a una LoRA de destilación externa.
- Generación de contenido de entretenimiento para adultos: dado su modelo base 10Eros, el modelo se puede usar para generar vídeo con contenido explícito, siempre que se cumplan la edad legal y la normativa aplicable.
- Experimentación con cuantización int4 en MLX: permite evaluar el equilibrio entre huella de memoria y calidad en Apple Silicon, probando técnicas como el streaming de bloques con `--low-ram` en equipos de 16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo pesa 23.0 GB. El transformer int4 ocupa aproximadamente 11.6 GB, y el resto son conectores (~5.9 GB), VAE (~1.4 GB), upscalers (~2.2 GB) y vocoder/audio VAE (~0.35 GB). La suma supera los 20 GB, por lo que se recomienda un Mac con al menos 32 GB de RAM. En Macs de 16 GB es necesario usar `--low-ram` para streaming por bloques.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4). No hay soporte para GPUs NVIDIA en esta compilación MLX.
- No está previsto su uso en GPU NVIDIA; la inferencia depende de MLX.
- Opciones de despliegue: `ltx-2-mlx` y `mlx-forge`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reallusion4free/ltx-2.3-10eros-v1.3-dmd-mlx-q4 | no disponible | no disponible | int4, menor fidelidad y adherencia al prompt que int8 | ltx-2-license | HuggingFace |
| MLXBits/ltx-2.3-10eros-v1.3-dmd-mlx-q8 | no disponible | no disponible | int8, mayor calidad de detalle | ltx-2-license | HuggingFace |
| TenStrip/LTX2.3-10Eros (base) | no disponible | no disponible | bf16, con LoRA de destilación nativa de rank 384 | ltx-2-license | HuggingFace |

La versión int4 destaca por un transformer de tamaño sensiblemente inferior (11.6 GB frente a ~19 GB en int8). El modelo base TenStrip no está destilado por DMD, sino que depende de una LoRA de destilación en tiempo de ejecución. Los tres modelos comparten licencia y disponibilidad pública.

## Limitaciones y advertencias

- El modelo no está recomendado para todos los públicos: contiene contenido para adultos y puede generar material explícito.
- Los usuarios deben confirmar su mayoría de edad y son responsables del contenido generado. No debe utilizarse para producir material ilegal ni para representar a personas reales identificables sin consentimiento.
- La licencia ltx-2-license es una licencia personalizada; puede restringir el uso comercial y la redistribución. Es necesario revisar el texto completo antes de usar el modelo en producción.
- La cuantización int4 reduce el detalle y la adherencia al prompt en comparación con la versión int8.
- El text encoder Gemma 3 12B no está incluido en el repositorio; se debe cargar por separado mediante `mlx-lm`.
- Requiere Apple Silicon. No se ofrece soporte para GPUs NVIDIA en esta compilación.
- No soporta los pipelines one-stage-dev ni two-stage con dev, ya que el paquete omite el transformer dev.
- No se han publicado benchmarks formales, por lo que el rendimiento comparativo frente a otros modelos de vídeo es desconocido.
- En Macs de 16 GB, el uso de `--low-ram` con streaming por bloques puede aumentar la latencia de forma notable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reallusion4free/ltx-2.3-10eros-v1.3-dmd-mlx-q4
- Modelo base TenStrip: https://huggingface.co/TenStrip/LTX2.3-10Eros
- Versión int8 hermana (MLXBits): https://huggingface.co/MLXBits/ltx-2.3-10eros-v1.3-dmd-mlx-q8
- Repositorio ltx-2-mlx: https://github.com/dgrauet/ltx-2-mlx
- Repositorio mlx-forge: https://github.com/dgrauet/mlx-forge
- Licencia de LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3/blob/main/LICENSE.txt
