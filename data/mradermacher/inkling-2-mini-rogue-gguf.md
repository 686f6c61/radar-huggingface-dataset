# mradermacher/Inkling-2-Mini-ROGUE-GGUF

## Resumen

Inkling-2-Mini-ROGUE-GGUF es la distribucion en formato GGUF del modelo carsenk/Inkling-2-Mini-ROGUE, publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face. El modelo original es un transformer de tipo mixture-of-experts (MoE) con 26.070.385.152 parametros totales, orientado a conversacion y con la etiqueta "abliterated", lo que indica que ha sido modificado para eliminar los mecanismos de rechazo de contenido. La distribucion incluye tanto cuantizaciones estaticas de llama.cpp como suplementos multimodales (mmproj), lo que sugiere capacidad de vision.

El modelo base se distribuye bajo licencia Apache 2.0 y declara soporte unicamente para ingles. Esta publicacion facilita la ejecucion local del modelo en hardware de consumo mediante cuantizaciones que van desde Q2_K (11,0 GB) hasta Q8_0 (27,9 GB), ademas de f16 en el repositorio original. Es relevante para desarrolladores que quieran desplegar un MoE de ~26B en estaciones de trabajo sin infraestructura de datacenter, aunque con las advertencias propias de un modelo "abliterated" y de una ficha tecnica escasa en la informacion disponible.

Cabe senalar que el repositorio presenta cero descargas y cero likes en el momento de la consulta, y que la model card no incluye detalles sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Toda la informacion tecnica adicional debe tratarse como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), transformer; detalles internos no disponibles |
| Parametros totales | 26.070.385.152 (~26,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (original), Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS (segun etiquetas); publicados: Q2_K, Q4_K_S, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un mixture-of-experts segun las etiquetas del repositorio, con 26,07 mil millones de parametros totales. La etiqueta "nvfp4" sugiere que el modelo original fue entrenado o cuantizado con formato NVFP4 (formato de 4 bits de NVIDIA), aunque no se especifica si los pesos originales estan en ese formato o si es una referencia al proceso de cuantizacion. La etiqueta "abliterated" indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones, alterando el comportamiento de seguridad del modelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. Tampoco se detallan innovaciones arquitectonicas como decodificacion especulativa o atencion lineal. La presencia de ficheros mmproj (multi-modal supplement) en la distribucion GGUF sugiere que el modelo base incorpora un codificador visual, pero no se confirma en la model card.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational".
- Razonamiento y generacion de codigo: no confirmado en la informacion disponible.
- Capacidad multimodal: la presencia de ficheros mmproj-f16 y mmproj-Q8_0 sugiere soporte de entrada de imagenes, aunque no se detalla en la model card.
- Comportamiento "abliterated": el modelo ha sido modificado para reducir o eliminar rechazos de contenido, lo que afecta a su comportamiento en conversaciones sensibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a ingles segun la etiqueta de idioma.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local de un MoE de ~26B en estaciones de trabajo: con la cuantizacion Q4_K_S (16,2 GB) el modelo puede ejecutarse en GPUs de consumo con 24 GB de VRAM, lo que permite experimentar con un MoE de gran tamano sin infraestructura de datacenter.
- Investigacion sobre alineacion y seguridad: al ser un modelo "abliterated", es util para estudiar como la ablacion de direcciones de rechazo afecta al comportamiento del modelo en dominios sensibles, comparandolo con el modelo base no modificado.
- Prototipado de asistentes conversacionales en ingles: la etiqueta "conversational" y el formato GGUF permiten integrarlo rapidamente en aplicaciones de chat mediante llama.cpp u Ollama.
- Evaluacion de cuantizaciones: la disponibilidad de Q2_K, Q4_K_S, Q6_K y Q8_0 permite medir el impacto de la cuantizacion en la perplejidad y la calidad de las respuestas para este MoE concreto.
- Experimentos multimodales: los ficheros mmproj permiten probar entrada de imagenes en llama.cpp, aunque la ausencia de documentacion obliga a validar el comportamiento empiricamente.
- Base para fine-tuning o destilacion: al estar bajo Apache 2.0, puede servir como punto de partida para adaptaciones en ingles, siempre que se asuma el riesgo del comportamiento abliterated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (el modelo completo debe residir en memoria o repartirse entre VRAM y RAM):
  - Q2_K: ~11,0 GB.
  - Q4_K_S: ~16,2 GB.
  - Q6_K: ~23,6 GB.
  - Q8_0: ~27,9 GB.
  - f16 (modelo base): ~52 GB estimados a partir del numero de parametros.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_S y Q6_K; A100 40 GB o H100 para Q8_0 y f16; RTX 3090 (24 GB) para Q4_K_S.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_S y Q6_K; Q8_0 requiere 32 GB o reparto con RAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se confirma compatibilidad (no verificada).
- Latencia y throughput: no disponibles. Al ser un MoE, el throughput dependera del numero de parametros activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-ROGUE (este) | 26,1 B (MoE) | no disponible | Apache 2.0 | GGUF, safetensors | Abliterated, solo ingles, multimodal por mmproj |
| Modelos MoE de ~20-30B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de alternativas equivalentes en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "abliterated": la ablacion de rechazos puede aumentar la probabilidad de generar contenido danino, sesgado o inapropiado; no se recomienda su uso en produccion orientada al publico sin filtros adicionales.
- Solo soporta ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factica.
- Ausencia de datos de entrenamiento y benchmarks: imposible evaluar sesgos conocidos, calidad o robustez con rigor.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar el limite real.
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento abliterated puede implicar riesgos legales y reputacionales que el usuario debe evaluar.
- Repositorio con cero descargas y cero likes: sin validacion comunitaria; la calidad de las cuantizaciones no ha sido contrastada por terceros.
- Los ficheros mmproj sugieren multimodalidad, pero no hay documentacion que confirme el formato de entrada ni el rendimiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Inkling-2-Mini-ROGUE-GGUF
- Modelo base: https://huggingface.co/carsenk/Inkling-2-Mini-ROGUE
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Inkling-2-Mini-ROGUE-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
