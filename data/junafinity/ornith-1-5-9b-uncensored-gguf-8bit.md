# junafinity/Ornith-1.5-9B-uncensored-GGUF-8bit

## Resumen

Ornith-1.5-9B-uncensored-GGUF-8bit es una cuantización Q8_0 en formato GGUF del modelo abliterado Ornith-1.5-9B, publicado por el usuario junafinity bajo la marca VeriSafe.Live. Se trata de una variante derivada de `ornith-ai/Ornith-1.5-9B`, un modelo multimodal de 8.953.803.264 parámetros (aproximadamente 9B) que combina un transformer con torre de visión. La etiqueta `qwen3_5` en los metadatos sugiere una arquitectura de la familia Qwen 3.5, aunque no se dispone de confirmación explícita en la información proporcionada.

El proceso de "abliteration" aplicado consiste en una edición de rango 1 sobre un tramo de capas conocido que elimina la dirección de rechazo (refusal direction) del modelo base. El resultado es un modelo que, en principio, no declina peticiones por motivos de seguridad, lo que lo convierte en un instrumento de investigación para red teaming y evaluación de defensas. La torre de visión y los cabezales de predicción multi-token (MTP) se conservan según el autor, y la conversión se realizó con `--no-mtp` porque el modelo de 9B no dispone de bloque `mtp.*` nativo.

La relevancia actual de esta ficha radica en que ejemplifica una categoría creciente de artefactos: derivados abliterados de modelos open weights, publicados con fines de investigación en seguridad. El modelo se distribuye bajo licencia Apache 2.0, con 4.825 descargas y 11 likes en el momento de la consulta, y un tamaño de repositorio de 10,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje); etiqueta `qwen3_5` en metadatos, sin confirmación explícita |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (8 bits); el autor menciona que las filas de 4 y 6 bits apuntaban a repos no publicados y fueron retiradas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0); requiere archivo mmproj separado para visión |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de aproximadamente 9B parámetros con torre de visión, según el pipeline `image-text-to-text` y la etiqueta `multimodal`/`vision`. La etiqueta `qwen3_5` en los metadatos apunta a una arquitectura de la familia Qwen 3.5, pero no se dispone de detalles sobre número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de entrenamiento. El autor indica que el modelo de 9B no tiene bloque `mtp.*` nativo, lo que sugiere que la familia incluye variantes con predicción multi-token (probablemente el modelo de 35B-A3B mencionado en la tabla de variantes).

La innovación técnica principal de esta ficha no está en el entrenamiento sino en la edición post-entrenamiento: la abliteración. Según la model card, se trata de una "edición de rango 1 especificada sobre un tramo de capas conocido" que elimina la dirección de rechazo. El autor afirma que tanto la torre de visión como cualquier bloque MTP se preservan, y que la conversión a GGUF se hizo con `--no-mtp` para evitar que llama.cpp invente un bloque NextN. No se proporcionan datos sobre tokens de entrenamiento, composición del dataset, RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Procesamiento de imagen y texto conjuntamente (pipeline `image-text-to-text`), con torre de visión preservada y archivo mmproj separado para llama.cpp.
- Razonamiento y código: no confirmado explícitamente en la información disponible, pero esperable en un modelo de la familia Qwen 3.5; no disponible como dato verificado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está relleno).
- Modo "uncensored": el modelo no aplica la dirección de rechazo del base, lo que permite medir el techo de capacidad real de los pesos.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue en infraestructura de inferencia compatible.

## Casos de uso

- Red teaming de pilas defensivas: usar el modelo como mitad "tratamiento" de un par controlado frente al base Ornith-1.5-9B para medir si los filtros de entrada, clasificadores de salida y defensas anti prompt-injection detectan contenido que el modelo base habría rechazado. El modelo no contribuye rechazos, lo que aísla el control bajo prueba.
- Medición del techo de capacidad: generar completaciones en dominios sensibles (seguridad, ciberseguridad ofensiva, química) para establecer el límite superior real de los pesos, independientemente de los rechazos comerciales del modelo base.
- Aislamiento de superficie de ataque: en bucles automatizados de red teaming, un objetivo que no rechaza evita que el bucle se detenga por negativas irrelevantes y permite concentrarse en inyección, abuso de herramientas y rutas de exfiltración de datos.
- Generación de datos etiquetados para moderación: producir completaciones etiquetadas para entrenar o evaluar modelos de detección de abuso y clasificadores de salida, aprovechando que el modelo genera contenido que los modelos alineados no producirían.
- Interpretabilidad de rechazo residual: al ser una edición de rango 1 sobre un tramo de capas conocido, el par base/abliterado constituye un control experimental limpio para estudiar qué rechazos sobreviven (reafirmación multi-turno, direccionamiento por system prompt, rechazos en la ruta de visión).
- Evaluación de visión sin rechazos: con el mmproj cargado en llama.cpp, probar la ruta de imagen del modelo para identificar si los rechazos visuales persisten tras la abliteración, un área que el autor señala explícitamente como parcialmente superviviente.
- Investigación académica sobre alineación: comparar distribuciones de salida entre el base y el abliterado para cuantificar el delta de comportamiento y documentar el efecto de la edición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un campo `tok/s: [PLACEHOLDER]` sin valor real, por lo que no se dispone de datos de throughput ni latencia medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 10,4 GB, correspondiente a pesos Q8_0 de 9B parámetros más el mmproj de visión. Se necesita aproximadamente 10-11 GB de VRAM para los pesos, más overhead de contexto KV cache (variable según longitud de contexto y número de capas, no disponible).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, una RTX 4090 (24 GB) o A100/H100 son suficientes; una GPU de 12 GB podría quedar justa al añadir contexto y mmproj.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3090/4090 (24 GB) y en GPUs de 16 GB con contexto moderado; en 12 GB requiere ajustar contexto y descargar capas a CPU.
- Opciones de despliegue: llama.cpp (formato GGUF nativo, con `--no-mtp`), y por extensión Ollama y otros frontends basados en llama.cpp. El tag `endpoints_compatible` sugiere compatibilidad con infraestructura de endpoints, pero no se detalla cuál.
- Latencia y throughput: no disponibles (el campo tok/s figura como placeholder).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-uncensored-GGUF-8bit (este) | ~9B | No disponible | GGUF Q8_0 | Apache 2.0 | Abliterado, visión vía mmproj |
| Ornith-1.5-9B-uncensored (safetensors) | ~9B | No disponible | Safetensors bf16 | Apache 2.0 | Mismo modelo en 16 bits |
| Ornith-1.5-9B-uncensored-MLX-8bit | ~9B | No disponible | MLX 8-bit | Apache 2.0 | Apple Silicon, `mlx-vlm` |
| Ornith-1.5-35B-A3B-uncensored-GGUF-8bit | 35B totales (A3B activos) | No disponible | GGUF Q8_0 | Apache 2.0 | Variante MoE de mayor tamaño |
| ornith-ai/Ornith-1.5-9B (base) | ~9B | No disponible | Safetensors | No disponible | Modelo original con rechazos |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes ni frente a modelos de otras familias.

## Limitaciones y advertencias

- La abliteración elimina una dirección de rechazo, no una política: sobreviven rechazos por reafirmación multi-turno, direccionamiento mediante system prompt y en la ruta de visión, según el propio autor.
- Riesgo elevado de contenido dañino: el modelo está diseñado para no declinar; no debe exponerse como endpoint público sin una capa de moderación independiente.
- El autor exige explícitamente reportar el delta frente al modelo base y re-medir con prompts propios; los resultados no son transferibles sin validación.
- Sesgos conocidos: no disponibles en la información proporcionada; al ser un derivado de un modelo base sin documentación de dataset, los sesgos del base se heredan sin cuantificar.
- Riesgo de alucinación: no cuantificado; no hay benchmarks ni evaluaciones publicadas.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Longitud de contexto: no disponible; limita la planificación de despliegues con contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso comercial de un modelo sin rechazos conlleva responsabilidad legal y reputacional sobre el contenido generado.
- El campo `tok/s` de la model card es un placeholder; no hay datos de rendimiento medidos.
- El repositorio incluye material promocional de VeriSafe.Live (servicios de fine-tuning, API hospedada, aceptación de criptomonedas); tratarlo como contexto comercial, no como especificación técnica.
- La etiqueta `qwen3_5` no está confirmada como arquitectura oficial; verificar compatibilidad antes de asumir comportamientos de la familia Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-GGUF-8bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Variante safetensors 16-bit: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Variante MLX 8-bit: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-MLX-8bit
- Variante 35B-A3B MLX 8-bit: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-8bit
- Variante 35B-A3B GGUF 8-bit: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-GGUF-8bit
- Colección de la familia: https://huggingface.co/collections/junafinity/ornith-15-uncensored-6a896c737cf40ad660af2ebd
- Sitio del publicador: https://verisafe.live
- Contacto del publicador: info@verisafe.live
