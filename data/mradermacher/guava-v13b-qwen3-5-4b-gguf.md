# mradermacher/guava-v13b-qwen3.5-4b-GGUF

## Resumen

Guava-4B es un modelo de visión-lenguaje-acción (VLA) desarrollado por AIcell y orientado a robótica y manipulación. La variante aquí descrita es una cuantización GGUF estática publicada por mradermacher a partir del modelo base `AIcell/Guava-4B`. El modelo combina un backbone de lenguaje de la familia Qwen 3.5 (según la nomenclatura del repositorio, `qwen3.5`) con un proyector multimodal (`mmproj`) que permite procesar entradas visuales junto con instrucciones en lenguaje natural para producir acciones de manipulación robótica.

El interés principal de esta publicación es práctico: ofrece el modelo en múltiples niveles de cuantización (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB) más dos variantes del proyector multimodal (Q8_0 y f16), lo que permite desplegar un VLA de 4.205.751.296 parámetros en hardware modesto mediante llama.cpp u otros runtimes compatibles con GGUF. El pipeline declarado es `robotics` y las etiquetas incluyen `vision-language-action` y `manipulation`.

La información pública disponible es escasa: no se detallan datos de entrenamiento, benchmarks ni licencia. El autor de la cuantización no incluye resultados de evaluación, y la model card se limita a la lista de ficheros y a notas genéricas sobre el uso de GGUF. Por tanto, esta ficha debe leerse como una descripción de la variante cuantizada y de sus requisitos de despliegue, no como una evaluación de capacidades del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); backbone de lenguaje de la familia Qwen 3.5 con proyector multimodal (mmproj) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector mmproj en Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base es `AIcell/Guava-4B`, un VLA de 4,2 mil millones de parámetros que, por la nomenclatura del repositorio (`guava-v13b-qwen3.5-4b`), emplea un backbone de lenguaje de la familia Qwen 3.5 junto con un proyector multimodal separado. La arquitectura exacta (número de capas, dimensión oculta, mecanismo de atención, tipo de encoder visual) no se detalla en la información disponible. La presencia de un fichero `mmproj` independiente indica un diseño típico de VLM/VLA: un encoder de imagen que se proyecta al espacio de embeddings del modelo de lenguaje, y una cabeza de acción o de decodificación de comandos de manipulación.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). La model card del repositorio cuantizado no incluye ninguna sección de entrenamiento; únicamente documenta el proceso de cuantización estática (sin quants ponderados por imatrix en el momento de la publicación) y remite a la página de descargas del autor.

## Capacidades

- Procesamiento conjunto de imagen e instrucciones en lenguaje natural (visión-lenguaje).
- Generación de acciones para tareas de manipulación robótica (pipeline `robotics`).
- Conversación multimodal básica, según la etiqueta `conversational` del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés (`en`).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo recibe una imagen de la escena y una instrucción en inglés, y produce la acción de manipulación correspondiente; es adecuado para prototipos de investigación en robótica de mesa con hardware de consumo gracias a las cuantizaciones Q4.
- Evaluación de políticas VLA en simulación: al ser un GGUF ligero (2,7–2,8 GB en Q4_K), permite iterar rápidamente sobre entornos simulados antes de transferir a un robot real.
- Despliegue en estaciones de trabajo con GPU única: la variante Q8_0 (4,6 GB) o f16 (8,5 GB) cabe en GPUs consumer de 8–16 GB de VRAM, lo que facilita la experimentación sin clúster.
- Investigación en cuantización de modelos multimodales: el repositorio ofrece 12 niveles de cuantización más dos del proyector, lo que permite estudiar la degradación de la política de acción según el nivel de compresión.
- Integración en pipelines de robótica con llama.cpp: el formato GGUF y el `mmproj` separado permiten cargar el modelo en runtimes de inferencia locales compatibles con llama.cpp para control de brazos robóticos.
- Docencia y formación: un VLA de 4B en formato GGUF es un caso práctico asequible para explicar arquitecturas visión-lenguaje-acción y el impacto de la cuantización en tareas de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ≈ 2,0 GB; Q3_K_S ≈ 2,2 GB; Q3_K_M ≈ 2,4 GB; Q3_K_L ≈ 2,5 GB; IQ4_XS ≈ 2,6 GB; Q4_K_S ≈ 2,7 GB; Q4_K_M ≈ 2,8 GB; Q5_K_S ≈ 3,1 GB; Q5_K_M ≈ 3,2 GB; Q6_K ≈ 3,6 GB; Q8_0 ≈ 4,6 GB; f16 ≈ 8,5 GB. Añadir 0,5 GB (mmproj Q8_0) o 0,8 GB (mmproj f16).
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, una RTX 3060 de 12 GB, RTX 4070/4080, RTX 4090 o A100/H100 son suficientes para todas las cuantizaciones; las variantes Q2–Q4 caben en GPUs de 6–8 GB.
- Cabe en GPU consumer: sí, desde una GTX 1660 de 6 GB con Q3_K_S más mmproj Q8_0, hasta una RTX 4090 con f16 más mmproj f16.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; el modelo base es compatible con transformers. No se documenta soporte explícito de vLLM o TGI para esta variante GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Guava-4B (esta variante GGUF) | 4,21B | no disponible | GGUF | no disponible | VLA para manipulación; cuantizaciones de 2,0 a 8,5 GB |
| AIcell/Guava-4B (base) | 4,21B | no disponible | safetensors | no disponible | Modelo original en transformers |
| Alternativas VLA de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La licencia no está declarada; no se puede asumir uso comercial sin consultar al autor del modelo base.
- Solo soporta inglés; las instrucciones en castellano no están cubiertas.
- No hay benchmarks publicados, por lo que se desconoce la calidad de las políticas de acción y el impacto de la cuantización en tareas de manipulación.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar de forma notable la precisión de las acciones; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso general.
- Riesgo de alucinación y de acciones incorrectas en entornos físicos: no debe usarse en robótica real sin validación y mecanismos de seguridad.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado principalmente en inglés y en dominios de robótica, su generalización fuera de ese dominio es incierta.
- El repositorio incluye 39,9 GB de ficheros; conviene descargar solo la cuantización necesaria.
- No hay quants ponderados por imatrix en el momento de la publicación, lo que puede afectar a la calidad relativa de las cuantizaciones pequeñas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/guava-v13b-qwen3.5-4b-GGUF
- Modelo base: https://huggingface.co/AIcell/Guava-4B
- Página de descargas del autor: https://hf.tst.eu/model#guava-v13b-qwen3.5-4b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
