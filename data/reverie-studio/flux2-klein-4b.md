# reverie-studio/flux2-klein-4b

## Resumen

`reverie-studio/flux2-klein-4b` es un espejo (mirror) sin modificaciones del modelo `Comfy-Org/flux2-klein-4b`, publicado por el usuario `reverie-studio`. No se trata de un modelo nuevo ni de un fine-tuning: la model card indica explícitamente que los ficheros son idénticos byte a byte al repositorio original, con sumas de verificación en `SHA256SUMS`, y que el único propósito es centralizar las descargas del servicio Mirage de Reverie en un solo punto. Todo el crédito corresponde a los autores originales y el repositorio declara no estar afiliado ni respaldado por ellos.

Por el nombre y el contenido del repositorio (un único fichero `split_files/diffusion_models/flux-2-klein-4b.safetensors`), se trata de un modelo de difusión de la familia FLUX 2, en su variante "klein" de 4B, distribuido en formato safetensors para su uso en flujos de trabajo de ComfyUI. La información disponible no incluye detalles sobre arquitectura interna, datos de entrenamiento ni capacidades específicas más allá de lo que sugiere su naturaleza como modelo de difusión.

La relevancia de esta ficha es limitada desde el punto de vista técnico: al ser un espejo, cualquier evaluación debe remitirse al repositorio original `Comfy-Org/flux2-klein-4b`. Este repositorio resulta útil únicamente como fuente de descarga alternativa con licencia Apache 2.0 y verificación de integridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | modelo de difusión (familia FLUX 2, variante klein); detalles internos no disponibles |
| Parámetros totales | 4B (según el nombre del modelo; no confirmado en la información disponible) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`split_files/diffusion_models/flux-2-klein-4b.safetensors`) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. El nombre y la ruta del fichero (`diffusion_models`) indican que se trata de un modelo de difusión perteneciente a la familia FLUX 2, en la variante "klein" con 4B de parámetros. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO.

Al ser un espejo byte a byte del repositorio `Comfy-Org/flux2-klein-4b`, cualquier innovación técnica o detalle de entrenamiento debe consultarse en la model card original, que se conserva en este repositorio como `ORIGINAL_README.md`. Esta ficha no puede aportar información adicional al respecto.

## Capacidades

- Generación de imágenes mediante difusión, de acuerdo con la naturaleza del modelo (familia FLUX 2); las capacidades concretas no están detalladas en la información disponible.
- Integración con flujos de trabajo de ComfyUI, dado el formato de pesos y la organización del repositorio original.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Descarga centralizada para el servicio Mirage: el caso de uso declarado por el autor es servir como única fuente de descarga de modelos para el servicio Mirage de Reverie, evitando depender de múltiples repositorios.
- Verificación de integridad en pipelines de despliegue: el repositorio incluye `SHA256SUMS`, lo que permite validar que los pesos descargados coinciden byte a byte con el original antes de desplegarlos en producción.
- Réplica de entornos de inferencia: al ser una copia exacta, permite reproducir un entorno de ComfyUI o de un servicio de generación de imágenes apuntando a una URL estable y con licencia Apache 2.0.
- Archivado a largo plazo: útil como copia de respaldo del modelo original con licencia permisiva, en caso de que el repositorio de origen cambie o se retire.
- Generación de imágenes en flujos ComfyUI: el fichero safetensors puede cargarse en ComfyUI como modelo de difusión, siempre que la variante klein-4b sea la adecuada para el pipeline del usuario.
- Distribución interna en organizaciones: equipos que necesiten una fuente única y verificable de modelos de difusión pueden usar este espejo como origen dentro de su infraestructura, respetando los términos Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; para un modelo de difusión de 4B en precisión completa, el tamaño del repositorio (7,8 GB) da una referencia del espacio en disco necesario.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (por el formato y la organización del repositorio original); otras opciones no disponibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| reverie-studio/flux2-klein-4b | 4B (según nombre) | no disponible | Apache 2.0 | Hugging Face (espejo) | Copia byte a byte de Comfy-Org/flux2-klein-4b |
| Comfy-Org/flux2-klein-4b | 4B (según nombre) | no disponible | Apache 2.0 | Hugging Face (original) | Repositorio de origen; fuente canónica |
| Otras variantes FLUX 2 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- Este repositorio no es un modelo original: es un espejo sin modificaciones, por lo que no debe citarse como trabajo propio ni atribuirse a `reverie-studio`.
- No hay información sobre sesgos, riesgos de alucinación (en el caso de modelos de difusión, artefactos o contenido no deseado) ni limitaciones idiomáticas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda consultar la model card original (`ORIGINAL_README.md`) por si el modelo original impone condiciones adicionales de uso responsable.
- El repositorio declara no estar afiliado ni respaldado por los autores originales; para soporte, actualizaciones o documentación técnica debe acudirse al repositorio `Comfy-Org/flux2-klein-4b`.
- Al no haber pipeline declarado ni idiomas disponibles, no se puede confirmar la compatibilidad con herramientas de inferencia distintas de ComfyUI.
- La fecha de creación (2026-11-12) y la ausencia de descargas o likes indican que el repositorio es reciente y sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reverie-studio/flux2-klein-4b
- Modelo original: https://huggingface.co/Comfy-Org/flux2-klein-4b
- Model card original (incluida en el repo): `ORIGINAL_README.md`
- Sumas de verificación: `SHA256SUMS` (en el repositorio)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
