# leejet/FLUX.1-dev-gguf

## Resumen

FLUX.1-dev-gguf es la versión cuantizada en formato GGUF del modelo de generación de imágenes FLUX.1-dev, desarrollado originalmente por Black Forest Labs y convertida por leejet, autor de stable-diffusion.cpp. El repositorio proporciona los pesos en formato GGUF para poder ejecutar FLUX.1-dev en GPUs con tan solo 6 GB o incluso 4 GB de VRAM, algo impensable con los pesos originales en bfloat16.

El modelo base FLUX.1-dev es un transformer de difusión de aproximadamente 12.000 millones de parámetros (11.901.408.320 exactamente según los safetensors del modelo original) orientado a la generación de imágenes a partir de texto. Esta conversión no modifica la arquitectura ni el comportamiento del modelo: solo cambia el formato y la precisión de los pesos para reducir los requisitos de memoria.

Su relevancia actual radica en que democratiza el acceso a un modelo de imagen de gama alta en hardware de consumo. Mientras que el FLUX.1-dev original requiere GPUs profesionales con 24 GB o más de VRAM, esta versión GGUF permite desplegarlo en tarjetas consumer mediante stable-diffusion.cpp, con los compromisos de calidad que implica cada nivel de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo base FLUX.1-dev) |
| Parámetros totales | 11.901.408.320 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | GGUF (diversos niveles; el autor referencia cuantizaciones que permiten ejecución con 4-6 GB de VRAM) |
| Idiomas soportados | en |
| Licencia | la de FLUX.1-dev (ver LICENSE.md del modelo original); no disponible en la ficha del repo |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Esta ficha corresponde a una conversión de pesos, no a un entrenamiento nuevo. La arquitectura subyacente es la de FLUX.1-dev de Black Forest Labs, un transformer de difusión con aproximadamente 12.000 millones de parámetros. La conversión a GGUF la realiza leejet mediante la herramienta stable-diffusion.cpp, que reempaqueta los tensores en distintos niveles de cuantización para reducir el uso de memoria y permitir la inferencia en GPUs de gama baja.

No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento, el número de tokens, el proceso de alineación (RLHF/DPO) ni innovaciones técnicas del modelo original más allá de lo que declara la model card de la conversión. Cualquier dato sobre el entrenamiento debe consultarse en la ficha del modelo base black-forest-labs/FLUX.1-dev.

## Capacidades

- Generación de imágenes a partir de descripciones textuales en inglés (text-to-image).
- Ejecución en GPUs con 6 GB o incluso 4 GB de VRAM gracias a la cuantización GGUF, según la model card.
- Compatibilidad con stable-diffusion.cpp como motor de inferencia.
- Soporte de distintos niveles de cuantización, lo que permite ajustar el equilibrio entre calidad y consumo de memoria.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modos de razonamiento, ya que es un modelo generativo de imágenes.

## Casos de uso

- Generación de imágenes en estaciones de trabajo con GPU de gama media: al requerir solo 4-6 GB de VRAM, permite crear ilustraciones y material gráfico en equipos que no pueden cargar el modelo original en bfloat16.
- Prototipado rápido en local: desarrolladores que quieran evaluar FLUX.1-dev antes de invertir en hardware profesional pueden usar esta versión GGUF para validar prompts y flujos de trabajo.
- Integración en aplicaciones de escritorio: stable-diffusion.cpp es una implementación en C/C++ que facilita incrustar la inferencia en aplicaciones nativas sin depender de stacks Python pesados.
- Generación de recursos para videojuegos y diseño: creación de concept art, texturas y assets a partir de descripciones textuales en un entorno local con GPU consumer.
- Automatización de pipelines creativos: generación por lotes de imágenes para catálogos, banners o contenido editorial en servidores con GPUs modestas.
- Investigación y experimentación con cuantización: comparar la calidad de salida entre distintos niveles GGUF frente al modelo original para estudiar el impacto de la cuantización en modelos de difusión.
- Entornos con restricciones de memoria: despliegue en portátiles con GPU de 4-6 GB donde otras alternativas de la misma categoría no caben.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: la model card indica que FLUX se puede ejecutar con una GPU de 6 GB o incluso 4 GB de VRAM usando stable-diffusion.cpp y los pesos GGUF; el nivel de cuantización concreto determina el consumo exacto.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por los requisitos de VRAM, encajan GPUs consumer de gama media como las RTX xx60/xx70 con 6-8 GB, además de A100, H100 o RTX 4090 si se busca mayor velocidad o cuantizaciones más altas.
- Cabe en GPU consumer: sí, según la model card, en GPUs con 4-6 GB de VRAM.
- Opciones de despliegue: stable-diffusion.cpp (motor para el que se generan estos GGUF). No se confirma compatibilidad con otros motores en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | VRAM mínima indicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leejet/FLUX.1-dev-gguf | ~11.900 M | GGUF | 4-6 GB (según model card) | la de FLUX.1-dev | Hugging Face |
| black-forest-labs/FLUX.1-dev | ~11.900 M | safetensors (bfloat16) | no disponible en esta ficha; requiere hardware profesional | licencia FLUX.1-dev | Hugging Face |
| Otras cuantizaciones GGUF de FLUX.1-dev | ~11.900 M | GGUF | no disponible | la de FLUX.1-dev | Hugging Face |

No se dispone en la información proporcionada de datos de rendimiento comparado con otros modelos de generación de imágenes, por lo que la comparativa se limita a parámetros, formato, requisitos de memoria y licencia.

## Limitaciones y advertencias

- Es una conversión de pesos: la cuantización puede degradar la calidad de las imágenes generadas respecto al modelo original en bfloat16, especialmente en niveles agresivos.
- El modelo solo declara soporte de inglés, por lo que los prompts en otros idiomas pueden producir resultados peores.
- No se documentan en la información disponible los sesgos del modelo base; deben consultarse en la ficha de FLUX.1-dev.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido inexacto, incoherente o no solicitado.
- La licencia aplicable es la de FLUX.1-dev; es imprescindible revisar LICENSE.md del modelo original antes de cualquier uso comercial, ya que la ficha del repo no especifica la licencia.
- El motor previsto es stable-diffusion.cpp; no se confirma compatibilidad con otras herramientas de inferencia.
- No se proporcionan datos de benchmarks ni de latencia, lo que dificulta estimar el rendimiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/leejet/FLUX.1-dev-gguf
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Licencia del modelo base: https://huggingface.co/black-forest-labs/FLUX.1-dev/blob/main/LICENSE.md
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Guía de FLUX en stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/models/flux.md
