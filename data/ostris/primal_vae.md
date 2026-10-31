# ostris/primal_vae

## Resumen

Primal VAE es un autoencoder variacional (VAE) para modelos de difusión de imágenes, desarrollado por ostris (conocido en la comunidad por su herramienta de entrenamiento ai-toolkit). A diferencia de los VAE tradicionales usados en latent diffusion, que comprimen la imagen 8x espacialmente con 16 o 32 canales, Primal VAE solo reduce la resolución espacial 2x y produce 1 o 2 canales. La compresión hasta el equivalente 8x con 16/32 canales se logra aplicando un patching 4x4 en el DiT (transformador de difusión), que ya realiza esta operación de forma nativa, eliminando la necesidad de un VAE con compresión profunda.

El problema que resuelve es doble: por un lado, simplifica el pipeline al eliminar el factor de escala, el factor de desplazamiento y la normalización del latente (el latente se entrena para que su norma coincida con la del ruido gaussiano, es decir, ~N(0,1) por imagen y canal). Por otro lado, reduce el tamaño del VAE a unos 80M de parámetros, frente a los VAE considerablemente mayores de modelos como Flux. El modelo se publica en dos variantes (2x1 y 2x2) compatibles con los espacios latentes de Flux.1 y Flux.2 respectivamente, lo que lo hace especialmente relevante para entrenar o ajustar DiTs existentes con un VAE más ligero y determinista.

Es relevante ahora porque abre la puerta a entrenar modelos de difusión con VAEs pequeños y sin tasas de reconstrucción derivadas del muestreo posterior (no hay KL ni cuantización), y porque permite sustituir el VAE de Flux en pipelines existentes con cambios mínimos de código, gracias a la integración con diffusers mediante `AutoModel` y código personalizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VAE convolucional determinista (U-Net simétricas encoder/decoder, sin atención, sin KL) |
| Parámetros totales | ~80M por variante |
| Parametros activos | no disponible (no es MoE; ~80M activos al ser un modelo denso) |
| Longitud de contexto | no disponible (modelo de visión; imágenes con lados múltiplos de 16 px) |
| Tipos de cuantización | no disponible (recomendado bfloat16 en los ejemplos) |
| Idiomas soportados | no disponible (no aplica, modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (primal_vae_2x1.safetensors, primal_vae_2x2.safetensors) |

## Arquitectura y entrenamiento

Ambas variantes comparten la misma red y solo difieren en los canales de salida del encoder (1 canal para 2x1, 2 canales para 2x2). La entrada aplica `pixel_unshuffle(2)`, de modo que los 3 canales RGB pasan a 12 canales a mitad de resolución; todo el procesamiento ocurre a resolución latente o inferior, lo que hace del latente un mapa espacialmente fiel de la imagen. Encoder y decoder son U-Net convolucionales espejadas con 4 niveles (1/2, 1/4, 1/8 y 1/16 de la imagen), anchos de 96/192/384/384 y profundidades de bloques residuales 1/1/2/4 en el camino descendente y 1/1/2 en el ascendente. Las operaciones de down/up se realizan con `pixel_unshuffle`/`pixel_shuffle` más una convolución 3x3, y los bloques residuales ciclan dilaciones 1, 2 y 4.

La normalización es RMSNorm sobre canales en cada posición, sin estadísticas espaciales ni atención, lo que garantiza que el procesamiento por teselas sea equivalente al de la imagen completa (dado cierto solapamiento). El encoder termina en una convolución 3x3 directa a 1 o 2 canales: no hay posterior, ni término KL, ni convoluciones de cuantización. La clave del entrenamiento está en la pérdida: además de la reconstrucción, se aplica una pérdida de momentos (`mean^2 + (std - 1)^2`, peso 0.1, por imagen y canal) y una pérdida de estadísticos de orden gaussianos (MSE contra los order statistics esperados de una normal estándar mediante la aproximación de Blom), que fija la forma completa de la distribución del latente. Esto asegura que cada imagen individual se codifique con media 0 y desviación típica 1 por canal, sin necesidad de factores de escala posteriores. La variante 2x1 se entrenó 53k pasos con la pérdida de momentos agrupada por lote y 9k pasos finales por imagen. No se han publicado datos sobre el dataset de entrenamiento ni el número total de imágenes.

## Capacidades

- Codificación de imágenes a latentes de 1 canal (variante 2x1) o 2 canales (variante 2x2) a 1/2 de resolución espacial, de forma determinista (sin muestreo, sin `.latent_dist`).
- Decodificación de latentes de vuelta al espacio de píxeles `[B, 3, H, W]`.
- Patching integrado (`patchify`/`unpatchify`) para producir latentes con la misma forma que los de Flux.1 (16 canales @ 8x) o Flux.2 (32 canales @ 8x), mediante `pixel_unshuffle`/`pixel_shuffle`.
- Compatibilidad directa con pipelines Flux.1 y Flux.2: los tokens pueden sustituir al latente del VAE original sin scaling_factor ni shift_factor, y sin la normalización batch-norm de Flux.2.
- Carga de checkpoints de fine-tuning entrenados con ai-toolkit sin configuración adicional (la arquitectura se infiere de las formas de los tensores).
- Cálculo de pérdidas en espacio de píxeles sobre la salida del modelo de difusión mediante `enable_gradient_checkpointing()`, que permite retropropagar a través de `decode`.
- Procesamiento por teselas coherente con la imagen completa gracias a la ausencia de atención y estadísticas espaciales.

## Casos de uso

- Entrenamiento de DiTs propios desde cero: al eliminar scaling_factor, shift_factor y normalización del latente, se simplifica el código de entrenamiento y se reduce el riesgo de errores de preprocesamiento; basta con "encode, patch 4, diffuse".
- Sustitución del VAE de Flux.1 o Flux.2 en pipelines existentes: con `patchify(compression=8)` se obtiene un latente con la forma exacta que espera el DiT, lo que permite reentrenar o ajustar modelos Flux con un VAE de solo 80M de parámetros.
- Fine-tuning con pérdida en espacio de píxeles: el gradient checkpointing en el decoder permite retropropagar una pérdida de reconstrucción en píxeles a través de la predicción del modelo de difusión, útil para destilación o ajuste fino de fidelidad.
- Entrenamiento de VAEs personalizados con ai-toolkit: cualquier checkpoint entrenado con ai-toolkit se carga directamente especificando `weights_name`, sin redefinir la arquitectura.
- Reducción de coste de inferencia en el VAE: con ~80M de parámetros frente a VAEs de difusión considerablemente mayores, la codificación y decodificación consumen menos VRAM y cómputo, relevante en generación de imágenes a gran escala o en lotes grandes.
- Generación por teselas de imágenes grandes: al no usar atención ni estadísticas espaciales, las teselas se codifican y decodifican de forma consistente con la imagen completa (con solapamiento), útil para imágenes de alta resolución.
- Investigación en espacios latentes deterministas: al no haber ruido posterior (sin KL), el latente es reproducible, lo que facilita análisis, interpolaciones y estudios de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, FID, etc.) en la información disponible. La model card incluye una comparación de PSNR (dB) sobre tres imágenes de 512 px frente a los VAE de Flux:

| Imagen | Primal 2x1 | Flux.1 VAE | Primal 2x2 | Flux.2 VAE |
|---|---|---|---|---|
| img01 (personas, estudio) | 32,1 | 35,7 | 37,5 | 37,2 |
| img02 (picnic, vegetación) | 22,0 | 24,2 | 27,1 | 26,5 |
| img03 (captura de UI) | 21,3 | 24,7 | 27,4 | 25,9 |

El propio autor advierte que tres imágenes y PSNR no constituyen un benchmark, y señala que un VAE con KL paga una penalización de reconstrucción por el ruido posterior que un VAE determinista no sufre. La variante 2x2 iguala o supera al VAE de Flux.2 con el mismo presupuesto de información (32 valores por bloque de 8x8 píxeles), mientras que la 2x1 queda por detrás del VAE de Flux.1 en contenido texturizado.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~80M de parámetros en bfloat16, el modelo ocupa unos 160 MB de pesos; la VRAM total dependerá de la resolución de las imágenes, pero es marginal en términos modernos (del orden de 1-2 GB incluyendo activaciones para imágenes de 512-1024 px).
- GPU recomendadas: cualquier GPU con soporte CUDA y bfloat16 es suficiente (RTX 3060 o superior); no se requiere A100 ni H100 para inferencia.
- Cabe en GPUs de consumo sin problema, incluidas tarjetas de 8 GB como la RTX 3060 Ti o la RTX 4060, incluso junto a un DiT de tamaño medio.
- Opciones de despliegue: integración nativa con la librería diffusers de Hugging Face mediante `AutoModel.from_pretrained` con `trust_remote_code=True`; entrenamiento de fine-tunes mediante ai-toolkit del mismo autor. No se menciona soporte para llama.cpp, Ollama, vLLM ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Característica | Primal VAE (2x1 / 2x2) | Flux.1 VAE | Flux.2 VAE |
|---|---|---|---|
| Parámetros | ~80M | no disponible (mayor) | no disponible (mayor) |
| Compresión latente | 1-2 canales @ 2x (con patch 4: 16-32 canales @ 8x) | 16 canales @ 8x | 32 canales @ 8x |
| Determinista (sin KL) | Sí | No | No |
| Normalización del latente | Ninguna (unit normal por imagen y canal) | scaling_factor + shift_factor | Normalización batch-norm |
| Licencia | Apache-2.0 | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Disponibilidad | Hugging Face (diffusers, custom code) | Integrado en los pipelines de Flux | Integrado en los pipelines de Flux.2 |

Otras alternativas de la categoría (VAE de Stable Diffusion, SDXL VAE, etc.) no se incluyen por falta de datos comparativos en la información disponible.

## Limitaciones y advertencias

- La variante 2x1 (1 canal @ 2x) rinde por detrás del VAE de Flux.1 en contenido texturizado según los PSNR publicados por el autor; si la máxima fidelidad de reconstrucción es crítica, la variante 2x2 es la opción más sólida.
- Los datos de PSNR provienen de solo tres imágenes de 512 px; no constituyen un benchmark representativo y el rendimiento en otros dominios (ilustración, texto denso, fotografía nocturna) no está verificado.
- Las dimensiones de la imagen deben ser múltiplos de 16 píxeles en ambos ejes; imágenes con otras dimensiones requieren redimensionado o recorte previo.
- El modelo requiere `trust_remote_code=True` al cargarlo desde diffusers, lo que implica ejecutar código personalizado del repositorio; revísese antes de usar en entornos de producción sensibles.
- El procesamiento por teselas requiere solapamiento para igualar el comportamiento de la imagen completa; no se documenta el procedimiento exacto de tiling.
- No hay datos sobre el dataset de entrenamiento, por lo que no es posible evaluar sesgos potenciales del modelo.
- Al tratarse de un componente de pipeline (VAE) y no de un modelo generativo completo, su utilidad depende de disponer de un DiT compatible (Flux.1, Flux.2 o uno propio entrenado con este espacio latente).
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ostris/primal_vae
- Repositorio ai-toolkit del autor (herramienta de entrenamiento compatible): no disponible un enlace directo en la información proporcionada (buscable como "ostris/ai-toolkit" en GitHub)
- Paper asociado: no disponible
- Demo online: no disponible
