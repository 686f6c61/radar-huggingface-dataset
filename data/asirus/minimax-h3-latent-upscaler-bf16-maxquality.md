# Asirus/Minimax-H3-Latent-Upscaler-BF16-MAXQUALITY

## Resumen

El modelo `Asirus/Minimax-H3-Latent-Upscaler-BF16-MAXQUALITY` es una re-cuantización en BF16 con precisión mixta del upscaler latente 3D para vídeo `LBH-123-AI/Minimax_h3_latent_Upscaler`. Desarrollado por Asirus, este checkpoint busca maximizar la calidad de upscaling en el espacio latente de vídeo, corrigiendo los artefactos de la conversión BF16 original (parpadeo, efecto "jabón") mediante una estrategia conservadora que mantiene 150 tensores en FP16 (norm, head, tail, embed) y 172 en BF16 puro (capas convolucionales). El resultado es un archivo de ~658 MB listo para usar en ComfyUI como nodo de upscaling latente.

La relevancia de este modelo radica en que ofrece una alternativa de alta fidelidad para aumentar la resolución de vídeos generados por modelos de difusión, sin necesidad de decodificar y volver a codificar los latentes, lo que ahorra tiempo y memoria. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales, siempre que se cumplan los términos del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (upscaler latente 3D, red con capas convolucionales y GroupNorm) |
| Parametros totales | No disponible (archivo de ~658 MB en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | BF16 con fallback FP16 (precisión mixta conservadora) |
| Idiomas soportados | No aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16 + FP16) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo original (número de capas, dimensiones, etc.). Según la model card, se trata de un upscaler latente 3D que opera sobre tensores latentes de vídeo, con capas convolucionales y normalización por grupos. La re-cuantización de Asirus parte del checkpoint FP32 original (`minimax_h3_latent_upscaler_3d_fp32.pth`) y aplica una conversión conservadora a BF16, manteniendo en FP16 los tensores más sensibles (GroupNorm, conv_in, conv_out, embed, emb_layers) para evitar degradación. No se ha realizado calibración ni corrección de outliers; la estrategia se basa en la experiencia previa con el enfoque nativo BF16 de LTX 2.5.

## Capacidades

- Upscaling de latentes de vídeo en el espacio latente, sin necesidad de decodificar a píxeles.
- Soporte para escalado por factor (scale_by) y métodos de interpolación (nearest-exact, bilinear, area, bicubic, bislerp).
- Integración nativa con ComfyUI mediante nodos personalizados (menú `video/MinimaxH3`).
- Manejo de solapamiento temporal (temporal_overlap) para mejorar la coherencia entre frames.
- Compatible con pipelines de generación de vídeo que usen latentes (por ejemplo, LTX-Video).
- Requantización de alta calidad que elimina artefactos de parpadeo y efecto "jabón" presentes en conversiones BF16 ingenuas.

## Casos de uso

- **Post-procesado de vídeos generados por IA**: tras generar un vídeo de baja resolución con un modelo de difusión, se aplica el upscaler latente para aumentar la resolución sin perder coherencia temporal, usando `tile_size=256` y `temporal_overlap=2-4` en ComfyUI.
- **Pipelines de generación de vídeo en tiempo real**: al operar sobre latentes, el upscaler reduce la carga computacional frente a métodos que decodifican y re-codifican, permitiendo iteraciones más rápidas en flujos de trabajo interactivos.
- **Mejora de calidad en vídeos de baja resolución**: para vídeos provenientes de modelos como LTX-Video, se puede encadenar el upscaler antes del VAE decode para obtener salidas nítidas sin re-muestreo en píxeles.
- **Refinamiento de latentes en workflows de investigación**: investigadores que experimentan con latentes de vídeo pueden usar este checkpoint como componente de upscaling en sus propios pipelines, gracias a su licencia permisiva.
- **Producción de contenido audiovisual**: integración en herramientas de edición de vídeo basadas en ComfyUI para escalar clips generados por IA a resoluciones superiores (1080p, 4K) manteniendo la calidad.
- **Comparación de estrategias de cuantización**: sirve como referencia para evaluar el impacto de la precisión mixta en modelos de upscaling latente, útil para desarrolladores que optimizan sus propios checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (PSNR, SSIM, etc.) ni comparativas cuantitativas con otras versiones. La única comparación es cualitativa: se afirma que la versión v5 elimina artefactos de parpadeo y "jabón" presentes en la conversión BF16 original del autor.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero al ser un modelo de ~658 MB, se espera que quepa en GPUs con 4 GB o más, dependiendo del tamaño del lote y del tile.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte para BF16 (Ampere o superior, p.ej. RTX 30xx, RTX 40xx, A100, H100). También puede ejecutarse en GPUs más antiguas si se usa FP16, pero se recomienda BF16 para máxima calidad.
- **Compatibilidad con consumer GPU**: sí, modelos como RTX 3060, 3070, 4060, 4070, etc. son suficientes para inferencia con tiles de 256.
- **Opciones de despliegue**: ComfyUI (nodos personalizados), también puede usarse en scripts Python con la librería `safetensors` y carga manual de pesos.
- **Latencia y throughput**: no disponibles. Depende del hardware, del tamaño del vídeo y de la configuración de tiles.

## Comparativa con modelos similares

| Modelo | Tamaño | Precisión | Artefactos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Asirus/Minimax-H3-Latent-Upscaler-BF16-MAXQUALITY | ~658 MB | BF16 + FP16 mixto | Ninguno reportado | Apache-2.0 | Hugging Face |
| LBH-123-AI/Minimax_h3_latent_Upscaler (BF16 original) | ~658 MB | BF16 (conversión naive) | Parpadeo, "jabón" | Apache-2.0 | Hugging Face |
| LBH-123-AI/Minimax_h3_latent_Upscaler (FP32) | ~1.3 GB (estimado) | FP32 | Ninguno | Apache-2.0 | Hugging Face |

La comparativa se basa en la información de la model card. No hay otros upscalers latentes de vídeo comparables en el ecosistema abierto con los que se pueda contrastar directamente.

## Limitaciones y advertencias

- **Dependencia del modelo base**: la calidad del upscaling depende del modelo original de LBH-123-AI; cualquier limitación de ese modelo (por ejemplo, resolución máxima soportada) se hereda.
- **Re-cuantización**: aunque se describe como conservadora, la conversión a BF16 puede introducir pequeñas pérdidas de precisión en comparación con FP32, especialmente en operaciones con valores extremos.
- **Sin benchmarks objetivos**: no hay métricas cuantitativas que respalden la afirmación de "máxima calidad"; la evaluación es subjetiva.
- **Uso específico**: está diseñado para latentes de vídeo en ComfyUI; no es un modelo de propósito general y no funciona con imágenes estáticas ni texto.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe cumplir con la atribución y los términos del modelo base (también Apache-2.0).
- **Soporte de la comunidad**: al ser un modelo reciente con 0 descargas y 0 likes, no hay garantía de mantenimiento o soporte.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Asirus/Minimax-H3-Latent-Upscaler-BF16-MAXQUALITY)
- [Modelo base: LBH-123-AI/Minimax_h3_latent_Upscaler](https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler)
- [Repositorio de nodos ComfyUI (LBH-123-AI)](https://github.com/LBH-123-AI/Comfyui_Minimax_h3_latent_Upscaler)
- [Repositorio alternativo de nodos (rockerBOO)](https://github.com/rockerBOO/h3-latent-upscaler)
