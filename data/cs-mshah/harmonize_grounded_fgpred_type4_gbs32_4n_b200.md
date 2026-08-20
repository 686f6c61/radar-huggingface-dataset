# cs-mshah/harmonize_grounded_fgpred_type4_gbs32_4n_b200

## Resumen

Este repositorio contiene un checkpoint de entrenamiento del proyecto LayerGen, concretamente el modelo de armonización de video denominado `harmonize_grounded_fgpred_type4_gbs32_4n_b200`. Desarrollado por cs-mshah, se trata de un modelo de difusión de video que, dadas dos capas de entrada —un primer plano (foreground) y un fondo (background)—, genera el video compuesto armonizado, es decir, reiluminado, con coincidencia de color y sombras consistentes. Está construido sobre la arquitectura Wan2.2-14B, un transformer de difusión multi-stream de 40 capas y 5120 dimensiones, con VAE `AutoencoderKLWan` y codificador de texto `UMT5EncoderModel`. El checkpoint se entrena en resolución 480×832 con 41 frames (11 latentes) y se publica como una vista previa de investigación para reproducibilidad.

La relevancia de este modelo radica en que aborda la tarea de armonización de video de forma end-to-end, sin necesidad de ajuste manual de luces, sombras o color, lo que facilita el compositing en producción de vídeo y efectos visuales. Al ser una variante con predicción de foreground (fg-pred type-4), también predice el primer plano limpio, lo que amplía su utilidad en flujos de separación de capas. El checkpoint solo contiene los pesos del transformer entrenado (en formato DCP), no el VAE ni el codificador de texto, que se cargan desde una instalación local de Wan2.2-14B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wan2.2-14B DiT (40 capas, 5120 dimensiones) con VAE `AutoencoderKLWan` y codificador de texto `UMT5EncoderModel` |
| Parámetros totales | No disponible (el checkpoint es parcial: solo el DiT entrenado, base Wan2.2-14B) |
| Parámetros activos | No disponible |
| Longitud de contexto | No aplica (modelo de video, no de texto) |
| Tipos de cuantización | fp32 (almacenamiento, ~53 GB); bf16 (inferencia, ~28 GB residentes) |
| Idiomas soportados | No disponibles (no aplica; es un modelo de video) |
| Licencia | `research-preview-see-card` (ver tarjeta) y base Wan2.2 (licencia Wan-AI) |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP) con 32 shards + `.metadata` |

## Arquitectura y entrenamiento

El modelo es un **transformer de difusión multi-stream** basado en Wan2.2-14B. La arquitectura cuenta con 40 capas y una dimensión de 5120, y usa un VAE `AutoencoderKLWan` para el espacio latente. La característica destacada es el **entrenamiento multi-stream** con 5 tipos de stream: el tipo 4 se reserva para la observación del foreground corrupto (de ahí la variable `FASTVIDEO_FG_CORRUPT_TYPE_ID=4`). El modelo también predice el foreground limpio (fg-pred), además del composite armonizado. El entrenamiento se realizó a resolución 480×832, con 41 frames (11 latentes), flow-shift 3.0, en 4 nodos con GPUs B200, con tamaño de lote global 32 (gbs32) y captions grounded de tipo editcap2. No se indica el número de tokens de entrenamiento ni si se usó RLHF o DPO; se trata de un checkpoint de tipo EMA en el paso 4000.

## Capacidades

- Armonización de video: dado un primer plano y un fondo, genera el video compuesto con reiluminación, coincidencia de color y consistencia de sombras.
- Predicción de primer plano limpio (fg-pred type-4): además del composite, predice el foreground sin corrupción.
- Soporte de múltiples streams de entrada (5 tipos de stream) para observaciones diferenciadas (foreground corrupto, background, etc.).
- Generación de clips de video de duración variable: entrenado en 41 frames, permite inferencia en 61 o 81 frames mediante interpolación de RoPE (`FASTVIDEO_ROPE_T_INTERP`) y ajuste de `num_latent_t`.
- No incluye capacidades de texto, tool calling, agentes o visión general; es un modelo de tarea específica.

## Casos de uso

- **Compositing de VFX**: integrar actores u objetos filmados en plató con fondos CGI o de otro rodaje, aplicando automáticamente la corrección de color y sombras. El modelo recibe las dos capas y genera el composite listo para postproducción.
- **Postproducción de vídeo en streaming**: en plataformas de edición de video, el modelo puede armonizar escenas con chroma key sin intervención manual, reduciendo el tiempo de retoque.
- **Generación de contenido para realidad virtual**: integrar capas de video sintéticas con fondos reales, manteniendo coherencia de iluminación y sombras.
- **Restauración de material de archivo**: si se dispone de un primer plano degradado y un fondo limpio, el modelo puede generar un composite mejorado y predecir el foreground original.
- **Automatización de VFX en producción**: en pipelines de efectos visuales, el modelo puede reemplazar el proceso de match-moving y relighting manual, acelerando iteraciones.
- **Investigación en separación de capas**: como parte del proyecto LayerGen, sirve para estudiar la descomposición de videos en capas y su recomposición armónica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se reportan métricas cuantitativas (PSNR, SSIM, LPIPS, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- Se requiere una GPU con al menos **80 GB de VRAM** (A100-80G, H100, H200, B200) para la inferencia.
- El modelo se carga en bf16 con ~28 GB de memoria residente; el almacenamiento en fp32 ocupa ~53 GB.
- No cabe en GPUs de consumo (por ejemplo, RTX 4090) sin cuantización adicional (no se ofrecen formatos GGUF o similares).
- Inferencia con **FlashAttention** recomendada (también funciona con `TORCH_SDPA`).
- Despliegue exclusivo con **FastVideo** mediante el script `infer_layer_decomp.py`; no se mencionan compatibilidades con vLLM, Ollama o TGI.
- Para clips más largos (61/81 frames) se requiere ajustar la interpolación de RoPE y el número de latentes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (armonización de video con multi-stream). Se sugiere que no hay datos disponibles.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `research-preview-see-card` limita el uso a investigación y reproducción; no se permite uso comercial sin contacto con los autores.
- **Dependencia de código interno**: el modelo solo puede ejecutarse con el stack de FastVideo de capa-decomp, que actualmente es código de investigación interno (commit `b7ccac76`). No es accesible para uso general.
- **Requisito de Wan2.2**: necesita una instalación local de Wan2.2-14B (diffusers) para el VAE y el codificador de texto.
- **Riesgo de alucinación**: como modelo generativo de video, puede producir artefactos visuales o inconsistencias en el composite, especialmente en escenas complejas o con iluminación extrema.
- **Sesgos**: no se documentan sesgos específicos; el entrenamiento se realizó con captions grounded de tipo editcap2, que pueden no representar todas las condiciones de iluminación o estilos.
- **Formato de pesos**: el checkpoint es DCP, no safetensors; requiere la herramienta de carga de FastVideo y no es interoperable con otros frameworks.
- **Tamaño y memoria**: el checkpoint ocupa ~57 GB en el repositorio, y la inferencia requiere al menos 28 GB de VRAM en bf16, lo que limita su uso en hardware modesto.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/cs-mshah/harmonize_grounded_fgpred_type4_gbs32_4n_b200)
- [Proyecto LayerGen](https://huggingface.co/cs-mshah) (perfil del autor, no se proporciona otro enlace)
- [Wan2.2-14B (modelo base)](https://huggingface.co/Wan-AI/Wan2.2-14B) (referencia, no incluida en la información proporcionada)

*Nota: el repositorio no incluye enlaces externos adicionales; la información se basa únicamente en la tarjeta del modelo.*
