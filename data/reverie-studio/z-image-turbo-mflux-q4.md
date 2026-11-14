# reverie-studio/z-image-turbo-mflux-q4

## Resumen

z-image-turbo-mflux-q4 es una cuantización a 4 bits del modelo de difusión de imágenes Tongyi-MAI/Z-Image-Turbo, publicada por reverie-studio y empaquetada específicamente para su uso con la librería mflux (implementación de MLX para modelos de difusión en Apple Silicon). No se trata de un modelo entrenado desde cero ni de un fine-tune: el autor declara explícitamente que el modelo se ha generado con `mflux-save` de mflux 0.24.0 a partir del checkpoint original de Tongyi-MAI, sin modificaciones adicionales más allá de la cuantización.

El modelo resuelve un problema de despliegue: permite ejecutar un modelo de generación de imágenes de la familia Z-Image en hardware Apple (chips M-series) mediante MLX, reduciendo el peso del repositorio a 5,9 GB gracias a la cuantización de 4 bits. Está pensado para la aplicación Reverie, que centraliza la descarga de todos sus modelos desde un único repositorio espejo.

La relevancia es principalmente práctica y de distribución: el valor técnico reside en el modelo base Z-Image-Turbo de Tongyi-MAI (Alibaba), mientras que esta publicación actúa como espejo cuantizado y listo para mflux. La información pública disponible sobre esta ficha concreta es muy limitada (0 descargas, 0 likes, sin pipeline declarado, sin idiomas declarados y sin benchmarks), por lo que muchos campos se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión de imágenes; arquitectura del base no detallada en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes, no de texto) |
| Tipos de cuantización | 4 bits (generada con `mflux-save` de mflux 0.24.0) |
| Idiomas soportados | no disponible (modelo texto-a-imagen; idiomas de los prompts no declarados) |
| Licencia | Apache-2.0 (sin cambios respecto al modelo base) |
| Formato de pesos | safetensors (librería mlx; tag `mflux`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Tongyi-MAI/Z-Image-Turbo en la documentación proporcionada. Por la naturaleza del pipeline (generación de imágenes a partir de texto, integración con mflux) se trata de un modelo de difusión, pero no se detallan el tipo de backbone, el número de parámetros ni la variante de difusión empleada.

Tampoco se documentan los datos de entrenamiento, el número de tokens o imágenes, ni si hubo etapas de ajuste por preferencias. Lo único verificable es el proceso de esta publicación: cuantización a 4 bits del checkpoint original (revisión `f332072aa78be7aecdf3ee76d5c247082da564a6`) mediante la herramienta `mflux-save` de mflux 0.24.0, sin otros cambios. El repositorio incluye un fichero `SHA256SUMS` con los hashes de todos los archivos para verificar la integridad de la descarga.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) heredada del modelo base Z-Image-Turbo.
- Ejecución en Apple Silicon mediante MLX a través de mflux 0.24.0, pasando la carpeta del modelo como `--model` y `--base-model z-image-turbo` donde mflux lo requiera.
- Cuantización de 4 bits que reduce el peso del repositorio a 5,9 GB, facilitando el despliegue en equipos con memoria unificada limitada.
- Verificación de integridad mediante `SHA256SUMS`.
- No se documentan capacidades de edición de imagen, image-to-image, controlnet, tool calling ni agentes; estas no deben asumirse sin consultar la documentación del modelo base.

## Casos de uso

- Generación de imágenes local en Mac: usar mflux 0.24.0 con esta carpeta como `--model` permite crear imágenes desde prompts de texto sin depender de servicios en la nube, aprovechando MLX sobre chips M-series.
- Prototipado rápido de assets visuales: al pesar 5,9 GB y estar cuantizado a 4 bits, encaja en flujos de trabajo de diseño que necesitan iterar prompts en un portátil Apple sin GPU dedicada.
- Distribución centralizada para la app Reverie: el repositorio actúa como espejo para que la aplicación descargue todos sus modelos desde un único punto, simplificando la gestión de dependencias.
- Integración en pipelines de CI o scripts de automatización en macOS: la disponibilidad de `SHA256SUMS` permite validar la descarga antes de ejecutar la inferencia.
- Evaluación comparativa de cuantizaciones: sirve para medir la pérdida de calidad frente al checkpoint original de Tongyi-MAI/Z-Image-Turbo en el mismo hardware Apple.
- Reproducibilidad de entornos: al fijar la revisión del modelo base y la versión de mflux, facilita replicar resultados en equipos de investigación con hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score, etc.), latencia ni comparaciones con el modelo sin cuantizar.

## Requisitos de hardware

- VRAM/memoria unificada estimada: no disponible de forma oficial; el repositorio pesa 5,9 GB en cuantización de 4 bits, por lo que se requiere al menos esa cantidad de memoria más el overhead de inferencia de mflux.
- GPU recomendadas: hardware Apple Silicon (chips M-series) con MLX; no se documentan requisitos para GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: orientado a Mac con memoria unificada; no se especifican modelos mínimos de chip.
- Opciones de despliegue: mflux 0.24.0 (librería MLX). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a modelos de difusión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización | Peso del repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reverie-studio/z-image-turbo-mflux-q4 | Difusión texto-a-imagen para mflux | 4 bits | 5,9 GB | Apache-2.0 | Hugging Face (mlx) |
| Tongyi-MAI/Z-Image-Turbo | Difusión texto-a-imagen (base) | Original (sin cuantizar) | no disponible | Apache-2.0 | Hugging Face |
| Otras cuantizaciones de Z-Image-Turbo | Difusión texto-a-imagen | no disponible | no disponible | Apache-2.0 (heredada) | no disponible en la información proporcionada |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes de uso.
- La cuantización a 4 bits puede degradar la calidad de imagen respecto al checkpoint original; no se documenta la magnitud de esa pérdida.
- Solo es utilizable con mflux 0.24.0 y hardware Apple Silicon; no hay soporte declarado para otros runtimes o GPUs.
- No se declaran idiomas soportados para los prompts; el comportamiento multilingüe no está verificado.
- No hay información sobre sesgos del modelo base ni sobre riesgos de generación de contenido inapropiado.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; conviene revisar el fichero `LICENSE` incluido y las condiciones del modelo original Tongyi-MAI/Z-Image-Turbo.
- El autor indica que todos los méritos del modelo corresponden a los autores originales; esta publicación es únicamente un espejo cuantizado.
- No se documentan limitaciones de resolución, pasos de muestreo ni parámetros de inferencia recomendados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reverie-studio/z-image-turbo-mflux-q4
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- mflux (librería de inferencia): https://github.com/filipstrand/mflux
- Organización Reverie Studio: https://huggingface.co/reverie-studio
