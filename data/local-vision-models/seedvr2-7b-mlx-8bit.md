# local-vision-models/seedvr2-7b-mlx-8bit

## Resumen

SeedVR2-7B es un modelo de difusión de tipo transformer (DiT) desarrollado por ByteDance Seed, orientado a la restauración genérica de vídeo: superresolución, eliminación de ruido, corrección de artefactos de compresión y recuperación de detalle en material audiovisual degradado. Con 7.000 millones de parámetros, se presenta como el mayor modelo de difusión transformer publicado hasta la fecha para restauración de vídeo genérica, según el repositorio oficial del proyecto.

La ficha que nos ocupa no es el modelo original, sino una conversión comunitaria a formato MLX con pesos cuantizados a 8 bits, publicada por el usuario `local-vision-models`. La conversión se ha realizado con la herramienta mflux 0.24.0 y parte de los pesos `seedvr2_ema_7b_fp16.safetensors` y `ema_vae_fp16.safetensors` distribuidos en el repositorio `numz/SeedVR2_comfyUI`. El objetivo es permitir la inferencia en hardware Apple Silicon mediante el framework MLX de Apple.

Es relevante ahora porque acerca un modelo de restauración de vídeo de gran tamano al ecosistema local de macOS, donde hasta hace poco las opciones prácticas se limitaban a modelos mucho más pequenos o a ejecución en la nube. La licencia Apache 2.0 del modelo original se mantiene en esta conversión, lo que facilita su uso comercial con las condiciones habituales de atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) para restauración de vídeo |
| Parametros totales | 7.000 millones (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (pesos MLX); el original en fp16 |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (8-bit) |

## Arquitectura y entrenamiento

SeedVR2 emplea una arquitectura de difusión basada en transformer (DiT) disenada específicamente para restauración de vídeo genérica. El pipeline incluye un VAE separado (`ema_vae_fp16.safetensors` en el original) y un modelo principal con pesos EMA (`seedvr2_ema_7b_fp16.safetensors`). El repositorio oficial lo describe como el mayor modelo de difusión transformer hasta la fecha para restauración de vídeo, con el objetivo de empujar las fronteras de la realidad virtual y la investigación en modelos de visión a gran escala para restauración de vídeo del mundo real. El trabajo se ha presentado en ICLR 2026 según el repositorio GitHub del proyecto.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO; estos datos deben consultarse en el paper asociado al proyecto. La conversión MLX 8-bit realizada por `local-vision-models` no modifica la arquitectura: únicamente transforma los pesos a formato MLX y los cuantiza a 8 bits con mflux 0.24.0, manteniendo el VAE y el modelo principal. El repositorio incluye un `manifest.json` con el tamano y el SHA-256 de cada fichero, lo que facilita la verificación de integridad de la descarga.

## Capacidades

- Restauración de vídeo genérica: superresolución, eliminación de ruido, corrección de artefactos de compresión y recuperación de detalle.
- Procesamiento de vídeo además de imágenes individuales, según la orientación del proyecto original.
- Restauración de material del mundo real degradado, no solo de degradaciones sintéticas.
- Inferencia en Apple Silicon mediante MLX, con pesos en 8 bits para reducir requisitos de memoria.
- Integración con el ecosistema mflux para conversión y ejecución.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo de visión puro.
- Capacidades multilingües: no aplica, al no ser un modelo lingüístico.

## Casos de uso

- Restauración de archivos audiovisuales históricos: el modelo puede procesar metraje degradado por el tiempo, eliminando ruido y recuperando detalle en producciones de archivo antes de su digitalización definitiva.
- Mejora de vídeo de vigilancia o cámaras de baja calidad: útil para aumentar la legibilidad de matrículas o rostros en grabaciones comprimidas, con las cautelas legales correspondientes.
- Postproducción de vídeo en local: editores que trabajan en Mac pueden aplicar superresolución y limpieza sin enviar material confidencial a servicios en la nube, gracias a la ejecución local con MLX.
- Restauración de contenido generado por usuarios: plataformas que reciben vídeo comprimido o de baja resolución pueden normalizar la calidad antes de publicarlo.
- Preparación de datasets de visión: limpiar y aumentar la resolución de vídeo de entrenamiento para otros modelos de visión antes de anotarlo o usarlo.
- Investigación en restauración de vídeo: servir como referencia reproducible en Apple Silicon para comparar técnicas de cuantización (8-bit frente a fp16) sobre un DiT de 7B.
- Recuperación de material doméstico: usuarios con grabaciones familiares antiguas pueden restaurarlas localmente en un Mac con suficiente memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la conversión MLX no incluye métricas (PSNR, SSIM, LPIPS u otras) ni comparaciones cuantitativas con el modelo original en fp16. Para datos de evaluación debe consultarse el paper de SeedVR2 (ICLR 2026) y el repositorio oficial de ByteDance-Seed.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 9,3 GB en total, incluyendo pesos 8-bit y VAE; se recomienda al menos 16 GB de memoria unificada para margen de trabajo, y 24 GB o más para vídeo de mayor resolución o lotes.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX.
- No es ejecutable en GPU NVIDIA/AMD con este formato: requiere conversión a otro runtime (por ejemplo, los pesos originales fp16 para ComfyUI o PyTorch).
- Cabe en Mac con 16 GB de memoria unificada en configuraciones conservadoras; para resoluciones altas o clips largos se recomienda 32 GB o más.
- Despliegue: MLX con mflux 0.24.0; los pesos originales están pensados para ComfyUI (repositorio `numz/SeedVR2_comfyUI`).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del chip Apple, la resolución y la longitud del clip.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SeedVR2-7B (MLX 8-bit) | 7B | DiT restauración vídeo | MLX safetensors | Apache 2.0 | Hugging Face (esta ficha) |
| SeedVR2-7B (original) | 7B | DiT restauración vídeo | safetensors fp16 | Apache 2.0 | Hugging Face (ByteDance-Seed) |
| SeedVR (primera versión) | no disponible | Restauración vídeo | no disponible | no disponible | GitHub ByteDance-Seed |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo de visión: no genera texto, no soporta tool calling ni razonamiento; no debe evaluarse con benchmarks de lenguaje.
- La cuantización a 8 bits puede introducir pérdida de calidad frente al fp16 original; no se han publicado métricas que cuantifiquen esa diferencia.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede inventar detalle que no existe en el material original, especialmente en zonas muy degradadas.
- Sesgos: no documentados en la información disponible; al entrenarse con vídeo del mundo real, puede heredar sesgos de representación del dataset original.
- Restricciones de licencia: Apache 2.0 permite uso comercial con atribución y aviso de cambios; debe conservarse el aviso de licencia y verificar las condiciones del modelo base.
- Dependencia del ecosistema MLX: no es portable directamente a CUDA sin reconversión; el soporte de la comunidad es limitado (0 descargas, 0 likes en el momento de la consulta).
- Repositorio comunitario sin mantenimiento garantizado: verificar el `manifest.json` y los SHA-256 antes de usar en producción.
- No apto para usos de vigilancia sin base legal: la mejora de material de vigilancia puede entrar en conflicto con normativa de protección de datos.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/local-vision-models/seedvr2-7b-mlx-8bit
- Modelo original en Hugging Face: https://huggingface.co/ByteDance-Seed/SeedVR2-7B
- Repositorio GitHub oficial de SeedVR: https://github.com/ByteDance-Seed/SeedVR
- Pesos originales para ComfyUI: https://huggingface.co/numz/SeedVR2_comfyUI
- Herramienta mflux: no disponible en la información proporcionada
