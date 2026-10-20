# bambocher/Qwen3.5-2B-oQ2.5-mtp

## Resumen

Qwen3.5-2B-oQ2.5-mtp es un checkpoint cuantizado del modelo Qwen3.5-2B, publicado por el usuario bambocher en HuggingFace. La cuantización se ha realizado con oQ (oMLX v0.7.1rc1) en precisión mixta y el resultado se distribuye en formato MLX con safetensors, con un total de 2.274.069.824 parámetros y un peso de repositorio de 1,5 GB.

El checkpoint combina capas en 2, 4, 5, 6 y 8 bits con grupo 64, además de tensores en BF16, hasta una media efectiva de 5,338 bits por peso. Incluye un modelo de lenguaje de 1,882B, un módulo de visión de 0,331B y un cabezal MTP de 0,061B, lo que apunta a un uso multimodal y a experimentación con predicción multi-token, aunque la información disponible no detalla la arquitectura ni el entrenamiento.

Su interés principal es la inferencia local eficiente en Apple Silicon: el checkpoint ocupa 1,413 GiB y puede cargarse con MLX. Ahora bien, no se han publicado benchmarks, licencia ni idiomas soportados, y la cuantización es agresiva (58,698% de los pesos lógicos en 2 bits), por lo que su calidad en tareas exigentes debe validarse antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3.5-2B; el checkpoint incluye módulo de visión y cabezal MTP) |
| Parámetros totales | 2.274.069.824 (2,274B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mixta: affine 2, 4, 5, 6 y 8 bits con grupo 64, más BF16; media efectiva 5,338 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX) |
| Tamaño del repositorio | 1,5 GB (1,413 GiB de pesos según la model card) |
| Componentes | Lenguaje 1,882B; visión 0,331B; cabezal MTP 0,061B |

## Arquitectura y entrenamiento

El checkpoint no documenta la arquitectura más allá de la etiqueta qwen3_5 y de la presencia de un módulo de visión y un cabezal MTP. El modelo base es Qwen3.5-2B, pero no se proporcionan detalles sobre número de capas, mecanismo de atención, tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica del repositorio es la cuantización mixta de oQ: asigna 2 bits al 58,698% de los pesos lógicos, 5 bits al 20,657%, 6 bits al 4,197%, 4 bits al 1,476%, 8 bits al 0,004% y mantiene un 14,967% en BF16. El módulo de visión (0,331B) está casi por completo en BF16, mientras que el modelo de lenguaje (1,882B) concentra la mayor parte de la cuantización agresiva. El cabezal MTP (0,061B) podría habilitar decodificación especulativa o predicción multi-token, pero no se confirma su funcionamiento en el runtime.

## Capacidades

- Generación de texto: el componente de lenguaje de 1,882B está presente; no se detallan tareas concretas ni calidad.
- Visión: el checkpoint incluye 0,331B parámetros de visión, en su mayoría BF16; no se confirma que la entrada de imágenes esté operativa en MLX.
- Predicción multi-token: incluye un cabezal MTP de 0,061B; su uso para decodificación especulativa no está documentado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local en Apple Silicon: con 1,413 GiB de pesos, el checkpoint se puede cargar en un Mac con memoria unificada para probar generación de texto sin conexión.
- Investigación en cuantización mixta: la distribución de 2/4/5/6/8 bits y BF16 permite medir la pérdida de calidad de un modelo de 2,274B frente al base sin cuantizar.
- Experimentación con decodificación especulativa: el cabezal MTP de 0,061B puede servir para probar predicción multi-token si el runtime MLX lo expone.
- Procesamiento de imágenes en local, condicionado a que el módulo de visión funcione: los 0,331B de visión en BF16 permiten plantear tareas de desc
