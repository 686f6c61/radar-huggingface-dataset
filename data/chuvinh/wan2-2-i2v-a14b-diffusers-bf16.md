# ChuVinh/Wan2.2-I2V-A14B-Diffusers-bf16

## Resumen

Wan2.2-I2V-A14B-Diffusers-bf16 es una conversión de precisión del modelo Wan2.2-I2V-A14B de Wan-AI (Alibaba), un modelo de difusión para generación de vídeo a partir de imagen (image-to-video). El autor del repositorio, ChuVinh, ha convertido los pesos originales de fp32 a bf16 para reducir el tamaño de descarga de aproximadamente 126 GB a unos 63 GB, manteniendo el VAE en fp32. No se ha modificado ningún otro aspecto del modelo original.

El modelo pertenece a la familia Wan2.2 y cuenta con 14.288.901.184 parámetros (~14,3 mil millones), distribuidos en dos transformers y un text encoder. Se integra con la librería `diffusers` mediante el pipeline `WanImageToVideoPipeline`, lo que facilita su uso en flujos de trabajo estándar de Python. La licencia es Apache-2.0, heredada del modelo base, con copyright de Wan Team / Alibaba.

Es relevante para desarrolladores e investigadores que necesitan desplegar generación de vídeo desde imagen con un modelo de gran tamaño sin asumir el coste de almacenamiento y transferencia de los pesos en fp32. La conversión a bf16 reduce el peso del repositorio a 69 GB, lo que agiliza la descarga y el despliegue en infraestructuras con ancho de banda limitado, a cambio de una posible pérdida menor de precisión numérica en la inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (dos transformers + text encoder + VAE), pipeline image-to-video |
| Parámetros totales | 14.288.901.184 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 (transformers y text encoder), fp32 (VAE); el modelo base admite fp32 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo es un sistema de difusión para generación de vídeo condicionada por imagen, compuesto por dos módulos transformer, un text encoder y un VAE. En esta conversión, los dos transformers y el text encoder se han pasado de fp32 a bf16, mientras que el VAE se mantiene en fp32. El pipeline asociado es `WanImageToVideoPipeline` de la librería `diffusers`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura de difusión para vídeo. La conversión realizada por ChuVinh no introduce cambios arquitectónicos: es una conversión de precisión de los pesos originales del commit `596658fd9ca6b7b71d5057529bbf319ecbc61d74` del modelo Wan-AI/Wan2.2-I2V-A14B-Diffusers.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) mediante difusión.
- Integración nativa con la librería `diffusers` a través de `WanImageToVideoPipeline`.
- Ejecución en bf16 para los componentes de mayor tamaño (transformers y text encoder), lo que reduce el uso de memoria y el tiempo de carga.
- VAE en fp32 para preservar la fidelidad de la reconstrucción visual.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado rápido de image-to-video: el pipeline de `diffusers` permite cargar el modelo y generar clips a partir de una imagen con pocas líneas de código, adecuado para equipos que evalúan la viabilidad de la generación de vídeo.
- Generación de clips para previsualización de productos: a partir de una imagen estática de un producto se pueden generar animaciones cortas para catálogos o anuncios, usando el modelo como motor de síntesis.
- Creación de contenido para redes sociales: conversión de imágenes fijas en vídeos breves con movimiento, útil para cuentas que necesitan volumen de contenido sin rodaje.
- Animación de ilustraciones y arte conceptual: artistas pueden animar bocetos o ilustraciones para presentaciones o portafolios, aprovechando la condicionalidad por imagen.
- Investigación en modelos de difusión para vídeo: el repositorio en bf16 facilita la descarga y el despliegue en entornos de experimentación con recursos de almacenamiento limitados, al reducir el peso a 69 GB.
- Integración en pipelines de generación de contenido automatizado: al estar en formato `diffusers` y safetensors, se puede orquestar dentro de servicios Python que reciben una imagen y devuelven un vídeo, con la ventaja de la licencia Apache-2.0 para uso comercial.
- Despliegue en infraestructuras con ancho de banda restringido: la versión bf16 (~63 GB frente a ~126 GB) reduce el tiempo de descarga y el coste de transferencia en clústeres o entornos cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 14,3 mil millones de parámetros en bf16, los pesos ocupan aproximadamente 28,6 GB solo para los parámetros, a lo que hay que sumar activaciones, el VAE en fp32 y el text encoder; se requiere una GPU de gran capacidad.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo, se necesitan GPUs de clase profesional con memoria suficiente (por ejemplo, A100 o H100 de 80 GB), aunque este dato no está confirmado en la documentación.
- ¿Cabe en GPU de consumo? No disponible. El tamaño de los pesos en bf16 supera la VRAM de la mayoría de GPUs de consumo actuales, pero no se dispone de una estimación oficial.
- Opciones de despliegue: `diffusers` con `WanImageToVideoPipeline`; el formato safetensors es compatible con el ecosistema de Hugging Face. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que además no aplican a modelos de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-I2V-A14B-Diffusers-bf16 (este) | 14.288.901.184 | No disponible | Apache-2.0 | safetensors (bf16/fp32) | Hugging Face, 34 descargas |
| Wan-AI/Wan2.2-I2V-A14B-Diffusers (base) | 14.288.901.184 | No disponible | Apache-2.0 | safetensors (fp32) | Hugging Face |
| Otros modelos image-to-video de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada. El modelo base comparte arquitectura y licencia con esta conversión; la diferencia principal es la precisión de los pesos (fp32 frente a bf16) y el tamaño del repositorio (aproximadamente 126 GB frente a 69 GB).

## Limitaciones y advertencias

- La conversión a bf16 puede introducir diferencias numéricas menores respecto al modelo original en fp32; no se documenta una evaluación de la degradación de calidad.
- No se dispone de información sobre sesgos conocidos del modelo base.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o contenido no fiel a la imagen de entrada; no se documentan métricas al respecto.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el copyright pertenece a Wan Team / Alibaba; conviene revisar los términos del modelo base.
- El repositorio tiene muy poca tracción (34 descargas, 0 likes) y fue creado en noviembre de 2026; no hay garantías de mantenimiento ni soporte.
- El peso del repositorio (69 GB) y el tamaño del modelo exigen infraestructura de almacenamiento y cómputo considerable.
- No se documentan requisitos de hardware ni latencias, lo que dificulta la planificación de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChuVinh/Wan2.2-I2V-A14B-Diffusers-bf16
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Commit del modelo base referenciado: `596658fd9ca6b7b71d5057529bbf319ecbc61d74`
- Documentación de `diffusers`: no disponible en la información proporcionada.
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
