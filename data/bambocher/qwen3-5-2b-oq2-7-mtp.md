# bambocher/Qwen3.5-2B-oQ2.7-mtp

## Resumen

Qwen3.5-2B-oQ2.7-mtp es un checkpoint cuantizado del modelo Qwen3.5-2B, publicado por el usuario bambocher en HuggingFace. No es un modelo entrenado desde cero: es una conversión de pesos a formato MLX mediante oQ (oMLX v0.7.1rc1), con cuantización mixta de precisión y un total de 2.274.069.824 parámetros. El repositorio ocupa 1,5 GB y emplea safetensors como formato de pesos.

El checkpoint incluye tres componentes: un modelo de lenguaje de 1,882B parámetros, un módulo de visión de 0,331B y una cabecera MTP de 0,061B. La cuantización combina capas en 2, 4, 5, 6 y 8 bits con group size 64, además de pesos en BF16, con una media efectiva de 5,375 bits por peso. Esto reduce el almacenamiento a 1,423 GiB, a costa de una posible pérdida de calidad que no está evaluada en la model card.

Su relevancia práctica es que permite ejecutar un modelo de algo más de 2B parámetros con visión en Apple Silicon mediante MLX, sin depender de GPUs NVIDIA. Sin embargo, la información pública es mínima: no hay licencia, idiomas, contexto, benchmarks ni datos de entrenamiento declarados, y el repositorio tiene muy poca tracción (7 descargas y 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; el tag qwen3_5 sugiere familia Qwen3.5 (transformer decoder-only), sin confirmar |
| Parámetros totales | 2.274.069.824 (2,274B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | oQ mixed-precision: affine 2, 4, 5, 6 y 8 bits, group size 64, más BF16; media efectiva 5,375 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX) |
| Biblioteca | MLX |
| Tamaño del repositorio | 1,5 GB |
| Componentes | Lenguaje 1,882B; visión 0,331B; cabecera MTP 0,061B |
| Descargas / likes | 7 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Por el tag qwen3_5 y la nomenclatura Qwen3.5-2B, cabe esperar un transformer decoder-only de la familia Qwen3.5, pero no hay confirmación oficial en la información proporcionada. Tampoco se indican tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones de atención.

Lo que sí está documentado es la receta de cuantización: oQ (oMLX v0.7.1rc1) aplica precisión mixta por capas. El 58,698% de los pesos lógicos (1,335B) se almacena en affine 2-bit group 64; el 20,281% (0,461B) en 5-bit; el 14,967% (0,340B) queda en BF16; y el resto se reparte entre 4, 6 y 8 bits. La media efectiva es de 5,375 bits/peso. El checkpoint separa lenguaje (1,882B), visión (0,331B) y cabecera MTP (0,061B); esta última se asocia habitualmente a multi-token prediction, aunque la model card no detalla su función.

## Capacidades

- Generación de texto: el componente de lenguaje de 1,882B permite inferencia de texto, aunque no hay evaluación de calidad publicada.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,331B, lo que indica soporte de entrada de imágenes; no se detallan resolución, tareas concretas ni límites.
- Cabecera MTP: componente de 0,061B asociado a multi-token prediction; podría emplearse para decodificación especulativa, pero la model card no confirma su funcionamiento.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de asistentes multimodales en Mac: cargar el checkpoint con MLX y probar prompts de texto e imagen sin enviar datos a la nube; el tamaño de 1,5 GB y el módulo de visión lo hacen manejable en
