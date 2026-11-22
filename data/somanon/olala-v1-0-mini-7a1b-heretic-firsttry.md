# SomAnon/Olala-v1.0-mini-7A1B-heretic-firsttry

## Resumen

Olala-v1.0-mini-7A1B-heretic-firsttry es una variante "decensored" (también etiquetada como abliterated o uncensored) del modelo Olala-v1.0-mini-7A1B desarrollado por OVHai LLM, el laboratorio de IA del grupo OVHcloud. El modelo original es un modelo de razonamiento pequeño orientado a chat, seguimiento de instrucciones y uso de herramientas, construido sobre una arquitectura híbrida Mamba-3 / atención con mezcla de expertos (MoE). Esta versión concreta ha sido modificada por el usuario SomAnon mediante la herramienta Heretic v2.2.0.dev0, que aplica una ablación de rango arbitrario (ARA) sobre determinadas capas para reducir el comportamiento de rechazo del modelo.

El modelo base cuenta con 6.773.115.072 parámetros totales según los pesos en safetensors, de los cuales aproximadamente 1.000 millones se activan por token, distribuidos en 36 capas de las cuales solo 7 mantienen caché KV. Fue entrenado sobre 12,8 billones de tokens de datos públicos y sintéticos en tres supercomputadores europeos (JUPITER, Jean Zay y MeluXina) y se publica bajo licencia Apache 2.0.

La relevancia de esta ficha radica en dos factores: por un lado, documenta un modelo europeo con arquitectura híbrida eficiente que puede ejecutarse en un portátil; por otro, ilustra el fenómeno de las variantes "abliterated" que modifican el comportamiento de seguridad de un modelo sin reentrenarlo, con las implicaciones éticas y de producción que ello conlleva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-3 / atención con mezcla de expertos (MoE) |
| Parámetros totales | 6.773.115.072 |
| Parámetros activos | ~1.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se detallan formatos GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh, fr, de, it, ja, ru, es, pl, pt, nl, el, tr, cs, uk, hu, ro, ko, ar, fi, sv, no, da, bg, sk, hr, lt, sl, bs, he, et, ca, lv, ka, sr, sq, is |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que combina capas Mamba-3 (modelo de espacio de estados) con capas de atención tradicional, organizadas en una estructura de mezcla de expertos. De las 36 capas totales, solo 7 conservan caché KV, lo que reduce drásticamente el coste de memoria en contextos largos. Con aproximadamente 1.000 millones de parámetros activos por token sobre 6.773 millones totales, el modelo busca un equilibrio entre capacidad y eficiencia de inferencia. El entrenamiento del modelo original se realizó sobre 12,8 billones de tokens de datasets públicos y datos sintéticos propios, e incluyó fases de preentrenamiento, annealing, SFT y RL, según la información de emisiones de CO2 de la model card (aproximadamente 1,16 GWh y entre 30 y 50 toneladas de CO2, con hardware basado en 1.024 GPUs NVIDIA GH200 en JUPITER y GPUs H100 en Jean Zay).

La modificación "heretic" aplicada en esta variante utiliza ablación de rango arbitrario (ARA) con los siguientes parámetros: `start_layer_index` 15, `end_layer_index` 21, `preserve_good_behavior_weight` 0,4739, `steer_bad_behavior_weight` 0,0022, `overcorrect_relative_weight` 0,7545 y `neighbor_count` 4. Según la model card, esta intervención reduce los rechazos de 26/32 a 14/32 con una divergencia KL de 0,0024 respecto al modelo original. El proceso es reproducible y el repositorio incluye un directorio `reproduce` con instrucciones.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones multi-turno.
- Razonamiento explícito ("thinking mode") con cuatro niveles de esfuerzo de razonamiento configurables.
- Uso de herramientas (tool calling / function calling) entrenado mediante aprendizaje por refuerzo.
- Razonamiento agéntico multi-paso, incluyendo búsqueda iterativa a lo largo de varios turnos.
- Capacidades multilingües en 37 idiomas, con especial cobertura de lenguas europeas.
- Comportamiento "decensored": menor tasa de rechazos ante peticiones que el modelo original declinaría.
- Eficiencia de inferencia: ~1B de parámetros activos y solo 7 capas con caché KV, lo que permite ejecución en portátil según el autor.

## Casos de uso

- Asistentes conversacionales multilingües: el modelo cubre 37 idiomas, lo que lo hace adecuado para atención al cliente en mercados europeos sin necesidad de modelos separados por idioma.
- Agentes con uso de herramientas: su entrenamiento con RL para tool calling y búsqueda multi-turno permite integrarlo en pipelines que consulten APIs, bases de datos o motores de búsqueda de forma iterativa.
- Razonamiento con esfuerzo configurable: los cuatro niveles de esfuerzo permiten ajustar el coste computacional según la tarea, usando el nivel bajo para clasificación o extracción y el alto para problemas complejos.
- Despliegue en hardware modesto: con ~1B de parámetros activos y solo 7 capas con caché KV, puede ejecutarse en un portátil o en una GPU de consumo, lo que facilita prototipado local y entornos con recursos limitados.
- Investigación sobre alineación y seguridad: al ser una variante abliterated reproducible, sirve para estudiar el efecto de la ablación de direcciones de rechazo sobre el comportamiento del modelo y su divergencia KL.
- Generación de contenido sin filtros en entornos controlados: para aplicaciones creativas o de investigación que requieran respuestas no censuradas, siempre con las salvaguardas externas adecuadas.
- Procesamiento de documentos largos: la arquitectura híbrida con caché KV reducida en solo 7 capas favorece el manejo de contextos extensos con menor coste de memoria (la longitud exacta de contexto no está disponible).

## Benchmarks y rendimiento

La model card de esta variante solo reporta métricas del proceso de ablación, no benchmarks estándar de capacidad:

| Métrica | Este modelo | Modelo original (OVHaiLLM/Olala-v1.0-mini-7A1B) |
|---|---|---|
| Rechazos | 14/32 | 26/32 |
| Divergencia KL | 0,0024 | 0 (por definición) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 6.773 millones de parámetros en safetensors (13,6 GB de repositorio), en FP16 requeriría del orden de 13-14 GB, y en cuantizaciones de 8 o 4 bits podría reducirse sustancialmente (no se publican formatos cuantizados).
- GPU recomendadas: el autor indica que el modelo "funciona en un portátil"; el entrenamiento original usó NVIDIA GH200 y H100.
- GPU de consumo: plausible en GPUs con 16-24 GB de VRAM en FP16 (por ejemplo, RTX 4090, RTX 3090) y en GPUs con menos VRAM si se aplican cuantizaciones, aunque no se detallan recetas oficiales.
- Opciones de despliegue: transformers con `custom_code` (requisito indicado en la model card); no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Olala-v1.0-mini-7A1B-heretic-firsttry | 6,77B totales / ~1B activos | no disponible | Apache 2.0 | Variante abliterated del modelo de OVHai LLM |
| OVHaiLLM/Olala-v1.0-mini-7A1B | 6,77B totales / ~1B activos | no disponible | Apache 2.0 | Modelo original, con mayor tasa de rechazos (26/32) |
| Otros modelos MoE pequeños de la misma categoría | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La ablación reduce los rechazos de 26/32 a 14/32, lo que implica que el modelo puede generar contenido que el original declinaría; esto conlleva riesgos de seguridad y de cumplimiento en producción.
- La divergencia KL de 0,0024 indica un cambio moderado en la distribución de salida, pero no se han evaluado capacidades estándar tras la ablación, por lo que puede haber degradación no medida en tareas específicas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad.
- La longitud de contexto no está especificada, lo que dificulta planificar despliegues con documentos largos.
- No se detallan sesgos conocidos ni evaluaciones de sesgo en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el comportamiento decensored puede incumplir políticas de plataformas o normativas sectoriales; se recomienda añadir filtros externos.
- Requiere `custom_code` en transformers, lo que puede complicar el despliegue en entornos con restricciones de ejecución de código remoto.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- [Hugging Face: SomAnon/Olala-v1.0-mini-7A1B-heretic-firsttry](https://huggingface.co/SomAnon/Olala-v1.0-mini-7A1B-heretic-firsttry)
- [Modelo base: OVHaiLLM/Olala-v1.0-mini-7A1B](https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B)
- [Informe técnico (PDF)](https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf)
- [Heretic (herramienta de ablación)](https://heretic-project.org)
- [OVHcloud AI Endpoints](https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/#try-our-models)
- [Playground de Olala](https://olala.ovh.com)
