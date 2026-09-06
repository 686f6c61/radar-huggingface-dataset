# Piotr1686/sd21-base-acutance

## Resumen

Piotr1686/sd21-base-acutance es un repositorio que actúa como espejo byte-exact del checkpoint original de Stable Diffusion 2.1-base, desarrollado originalmente por Stability AI. El autor del repositorio, Piotr1686, lo publica con el objetivo de preservar el acceso a los pesos originales después de que el upstream (stabilityai/stable-diffusion-2-1-base) fuera retirado de Hugging Face y del repositorio de GitHub de Stability AI. El problema que resuelve es la disponibilidad y verificabilidad de un artefacto que ya no puede descargarse desde la fuente oficial.

Se trata de un modelo de difusión latente para generación de imágenes a partir de texto. Contiene 865.910.724 parámetros totales según los ficheros safetensors, y el repositorio ocupa 5.2 GB. No se ha modificado nada: cada archivo es una copia bit a bit del checkpoint original, y la model card incluye una tabla de hashes SHA256 para que cualquier aplicación pueda verificar la integridad de lo que descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 2.1-base (modelo de difusión latente) |
| Parametros totales | 865.910.724 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un espejo byte-exact del checkpoint original de Stable Diffusion 2.1-base. No se ha realizado ningún ajuste fino, re-cuantización ni re-serialización: cada archivo se ha copiado bit a bit, como demuestran los hashes SHA256 incluidos en la model card. La arquitectura subyacente es la de un modelo de difusión latente, según se desprende de la etiqueta `stable-diffusion` y de la compatibilidad con `StableDiffusionPipeline` de la biblioteca diffusers.

El repositorio no ofrece información sobre los datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La innovación técnica destacable no está en el modelo en sí, sino en el procedimiento de publicación: se incluye una tabla de hashes SHA256 para cada archivo cargado por la aplicación, y se corrobora la integridad mediante dos espejos independientes creados antes de la retirada del upstream, de modo que la verificación no depende de un único intermediario.

## Capacidades

- Generación de imágenes a partir de descripciones textuales mediante la pipeline `StableDiffusionPipeline` de diffusers.
- Soporte del formato safetensors para los pesos del UNet, el text encoder y el VAE.
- No es un modelo de lenguaje, por lo que no soporta tool calling, function calling ni razonamiento multi-paso como agente.
- No dispone de capacidades multimodales adicionales como visión o audio.
- Los idiomas soportados no están documentados en el repositorio.
- Al ser un espejo, las capacidades son exactamente las del modelo original; no añade ni elimina funcionalidades.

## Casos de uso

- Reproducibilidad de experimentos: los hashes SHA256 incluidos permiten fijar una referencia exacta de los pesos, de modo que cualquier investigación que use este checkpoint pueda verificar que los bytes descargados coinciden con los esperados.
- Sustitución en aplicaciones existentes: cualquier pipeline que apuntara al repositorio original retirado puede redirigirse a este espejo sin cambiar los pesos, ya que el contenido es idéntico.
- Base para fine-tuning: los pesos originales de SD 2.1-base sirven como punto de partida para entrenar adaptadores LoRA u otros modelos derivados, como el TCD-SD21-base-LoRA basado en Trajectory Consistency Distillation.
- Auditoría de terceros: al comparar los hashes de este repositorio con los de otros espejos independientes (como glowforge-dev o LanguageMachines), se puede confirmar que no ha habido modificaciones intermedias.
- Investigación en modelos de difusión: permite estudiar el comportamiento de SD 2.1-base sin depender de un upstream que ya no existe, garantizando que los resultados obtenidos son comparables con los de publicaciones anteriores.
- Despliegue en producción: la integración con diffusers permite usar este checkpoint para generar imágenes de forma estable en servicios que ya tenían como dependencia el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un espejo byte-exact, el rendimiento debería ser idéntico al del checkpoint original de Stable Diffusion 2.1-base, pero no se ofrecen datos numéricos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño total de los archivos safetensors es de 5.2 GB, lo que da una idea del espacio en disco necesario, pero no de la memoria de GPU requerida.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: compatible con la biblioteca diffusers mediante `StableDiffusionPipeline`. También puede cargarse con otros frameworks que soporten safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Repositorio | Fecha de creación | Archivos coincidentes | Verificación |
|---|---|---|---|---|
| Piotr1686/sd21-base-acutance | este repositorio | 2026-09-05 | 11/11 | SHA256 |
| Manojb/stable-diffusion-2-1-base | Manojb | No disponible (anterior a 2026-09-03) | 11/11 | SHA256 |
| glowforge-dev/stable-diffusion-2-1-base-custom | glowforge-dev | 2023-01-29 | 11/11 | SHA256 |
| LanguageMachines/stable-diffusion-2-1-base | LanguageMachines | 2023-06-28 | 11/11 | SHA256 |

Los cuatro repositorios contienen los mismos pesos originales de SD 2.1-base. La diferencia radica en la independencia del espejo: los dos últimos fueron creados antes de la retirada del upstream y antes de que existiera el repositorio de Manojb, por lo que sirven como corroboración externa. El repositorio original de Stability AI ya no está disponible.

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: no ofrece mejoras, ajustes ni cambios sobre el checkpoint original de SD 2.1-base.
- El documento de licencia incluido no es el archivo exacto que acompañaba al modelo original (el original estaba fechado el 2022-11-24). En su lugar se incluye la misma licencia CreativeML Open RAIL++-M en su forma publicada del 2023-07-26. Esto es una diferencia documental que puede requerir revisión legal en caso de redistribución.
- No hay benchmarks ni evaluaciones publicadas en este repositorio.
- El modelo es exclusivamente para generación de imágenes; no tiene capacidades de lenguaje, tool calling ni agentes.
- La retirada del upstream implica que no existe una fuente oficial de referencia para verificar el contenido más allá de los espejos disponibles.
- La licencia Open RAIL++-M incluye restricciones de uso (Attachment A) que deben respetarse si se redistribuye el modelo o un derivado.
- Puede generar contenido no deseado o sesgado según el prompt; se recomienda revisar las restricciones de la licencia y aplicar filtros de seguridad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Piotr1686/sd21-base-acutance
- Mirror de Manojb: https://huggingface.co/Manojb/stable-diffusion-2-1-base
- Mirror de glowforge-dev: https://huggingface.co/glowforge-dev/stable-diffusion-2-1-base-custom
- Mirror de LanguageMachines: https://huggingface.co/LanguageMachines/stable-diffusion-2-1-base
- Mirror de sd-research: https://huggingface.co/sd-research/stable-diffusion-2-1-base
- LoRA TCD para SD21 base: https://huggingface.co/h1t/TCD-SD21-base-LoRA
