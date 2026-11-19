# peonist-ai/halogen-qwen3.8-27b-ht4

## Resumen

Halogen-Qwen3.8-27B-HT4 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.8-27B publicado por el usuario peonist-ai bajo licencia Apache 2.0. El modelo está empaquetado con la librería `halogen` y etiquetado específicamente para hardware AMD Strix Halo (arquitectura gráfica gfx1151) con el stack ROCm, lo que sugiere que su propósito principal es ofrecer una variante optimizada del modelo base para ejecutarse en estaciones de trabajo y equipos con APU AMD de altas prestaciones.

El repositorio ocupa 13,8 GB, un tamaño coherente con una cuantización de 4 bits de un modelo de aproximadamente 27 000 millones de parámetros, aunque el autor no documenta la receta de cuantización ni el proceso de ajuste. La model card publicada es prácticamente vacía: solo incluye metadatos YAML (licencia, modelo base, librería y etiquetas de hardware), sin descripción de arquitectura, datos de entrenamiento, benchmarks ni instrucciones de uso.

Dado que no se dispone de información técnica detallada más allá de los metadatos, esta ficha se limita a reflejar lo que el autor declara explícitamente y marca como "no disponible" todo aquello que no aparece en la información proporcionada. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación muy reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.8-27B; el autor no la documenta) |
| Parametros totales | no disponible (el nombre del modelo sugiere ~27B; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el sufijo "ht4" y el tamano de 13,8 GB sugieren 4 bits; no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo gestionado por la libreria `halogen`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. El modelo es un fine-tune de Qwen/Qwen3.8-27B, por lo que hereda la arquitectura del modelo base, pero el autor no detalla si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni especifica el número de parámetros totales o activos.

Tampoco se documentan los datos de entrenamiento: no hay información sobre el número de tokens utilizados en el ajuste fino, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Las etiquetas del repositorio (`strix-halo`, `gfx1151`, `rocm`, `amd`) apuntan a que el trabajo se centró en la compatibilidad y el rendimiento sobre hardware AMD más que en un ajuste de capacidades, pero esto es una inferencia a partir de los metadatos y no una afirmación del autor.

## Capacidades

- No se han documentado capacidades específicas en la model card del autor.
- Al derivar de Qwen/Qwen3.8-27B, cabe esperar las capacidades del modelo base (generación de texto, razonamiento, código), pero no hay confirmación explícita en la información disponible.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue en estaciones de trabajo con APU AMD Strix Halo: las etiquetas `strix-halo` y `gfx1151` indican que el modelo está pensado para ejecutarse en equipos con esta plataforma gráfica integrada mediante ROCm, lo que permitiría inferencia local sin GPU discreta.
- Evaluación de fine-tunes sobre Qwen3.8-27B: útil para investigadores que quieran comparar variantes del modelo base en tareas de generación de texto, siempre que validen previamente las capacidades reales del ajuste.
- Pruebas de compatibilidad con la librería `halogen`: el modelo sirve como caso de prueba para verificar el funcionamiento de esta librería en entornos ROCm/gfx1151.
- Prototipado local de asistentes conversacionales: con 13,8 GB de pesos, puede caber en memoria unificada de APUs de gama alta, lo que facilita experimentar con un modelo de ~27B en local.
- Investigación sobre cuantización en 4 bits: el sufijo `ht4` y el tamaño del repo permiten estudiar el impacto de la cuantización en la calidad de salida frente al modelo base, aunque el autor no publica métricas.
- Base para nuevos fine-tunes comunitarios: al estar bajo Apache 2.0, puede reutilizarse y modificarse, siempre que se respeten las condiciones de la licencia y se cite el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 13,8 GB, por lo que se necesita al menos esa cantidad de memoria (VRAM o memoria unificada) para cargar los pesos en el formato publicado.
- GPU recomendadas: el autor etiqueta el modelo para AMD Strix Halo (gfx1151) con ROCm; no se especifican otras GPU compatibles.
- ¿Cabe en GPU de consumo? No hay confirmación del autor. Por tamaño (13,8 GB), podría caber en GPU con 16 GB o más de VRAM, pero no se ha verificado la compatibilidad ni el rendimiento.
- Opciones de despliegue: la librería indicada es `halogen`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| halogen-qwen3.8-27b-ht4 | no disponible (~27B por el nombre) | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune orientado a AMD Strix Halo/ROCm |
| Qwen/Qwen3.8-27B (modelo base) | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face | Modelo original del que deriva el fine-tune |
| Otras variantes de Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion |

No se dispone de información suficiente para comparar rendimiento, contexto o calidad con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, datos de entrenamiento ni procesos de alineación, por lo que no es posible evaluar riesgos de sesgo.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no cuantificado por el autor.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero se recomienda verificar las obligaciones de atribución y las condiciones del modelo base Qwen/Qwen3.8-27B.
- El modelo tiene 0 descargas y 0 likes, sin validación comunitaria ni resultados reproducibles publicados.
- El sufijo `ht4` y el tamaño del repo sugieren cuantización en 4 bits, lo que puede degradar la calidad respecto al modelo base; no hay métricas que lo confirmen.
- La compatibilidad está declarada para AMD Strix Halo (gfx1151) con ROCm; el rendimiento en otras plataformas no está verificado.
- No se especifica el pipeline de la tarea ni los idiomas soportados, lo que dificulta su integración en producción sin pruebas previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peonist-ai/halogen-qwen3.8-27b-ht4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
