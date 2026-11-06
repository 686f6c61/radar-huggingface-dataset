# AGI-researcher/Duo

## Resumen

Duo es un modelo multimodal publicado en Hugging Face por el usuario AGI-researcher bajo licencia Apache 2.0. Segun los metadatos del repositorio, se trata de un modelo basado en la arquitectura Qwen2.5-VL, lo que implica un transformer multimodal capaz de procesar texto e imagenes. El repositorio contiene 8.292.166.656 parametros en formato safetensors, lo que lo situa en la categoria de modelos de aproximadamente 8 mil millones de parametros, un tamano habitual en la familia Qwen2.5-VL (la variante de 7B).

La model card publicada por el autor es practicamente vacia: unicamente declara la licencia Apache 2.0, sin descripcion, sin datos de entrenamiento, sin benchmarks ni instrucciones de uso. Esto limita enormemente cualquier evaluacion rigurosa del modelo. La informacion disponible procede casi exclusivamente de los metadatos del repositorio (tags, tamano de pesos, fecha de creacion y actualizacion).

El modelo es relevante unicamente como objeto de estudio o como posible checkpoint derivado de Qwen2.5-VL, pero la ausencia de documentacion, de resultados publicados y de cualquier historial de descargas o interacciones hace imposible recomendar su uso en produccion sin una evaluacion propia exhaustiva. Fue creado el 6 de noviembre de 2026 y actualizado el mismo dia, lo que sugiere una publicacion reciente y sin mantenimiento posterior conocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer multimodal, segun tag del repositorio) |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `qwen2_5_vl` del repositorio indica que Duo emplea la arquitectura de Qwen2.5-VL, un transformer multimodal con un codificador visual y un modelo de lenguaje subyacente. La variante de aproximadamente 8.300 millones de parametros coincide con el tamano de Qwen2.5-VL-7B, aunque no se confirma en la informacion disponible que se trate exactamente de ese checkpoint ni de un fine-tuning del mismo.

No se dispone de informacion sobre el proceso de entrenamiento: no se indica el numero de tokens utilizados, la composicion del dataset, si hubo etapas de alineacion (RLHF, DPO) ni ninguna innovacion tecnica especifica. La model card no incluye ningun detalle al respecto, por lo que cualquier afirmacion sobre el entrenamiento seria especulativa.

## Capacidades

- Procesamiento multimodal de texto e imagenes, heredado presumiblemente de la arquitectura Qwen2.5-VL, aunque no confirmado por el autor.
- Generacion de texto y razonamiento: no disponible de forma explicita en la documentacion.
- Generacion de codigo y matematicas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision, audio u otras capacidades especiales: no disponible.

La ausencia de model card impide confirmar cualquiera de estas capacidades mas alla de la inferencia por el tag de arquitectura.

## Casos de uso

- Evaluacion comparativa de checkpoints derivados de Qwen2.5-VL: el modelo puede utilizarse en experimentos controlados para medir el efecto de un fine-tuning respecto al modelo base, siempre que se disponga del checkpoint original como referencia.
- Investigacion sobre modelos multimodales de 8B: su tamano permite ejecutarlo en una unica GPU de 24 GB en precision reducida, lo que facilita experimentos academicos de bajo presupuesto.
- Pruebas de pipelines de vision-lenguaje: si se confirma la arquitectura Qwen2.5-VL, podria integrarse en flujos de descripcion de imagenes, VQA o extraccion de informacion de documentos, previa validacion empirica.
- Prototipado interno sin requisitos de soporte: al ser Apache 2.0, puede usarse en entornos de desarrollo cerrados sin obligaciones de atribucion complejas.
- Base para fine-tuning adicional: al estar en safetensors y con licencia permisiva, sirve como punto de partida para adaptaciones a dominios especificos, asumiendo el coste de reentrenamiento.
- Analisis de robustez y sesgos: util como caso de estudio sobre modelos publicados sin documentacion, para investigar riesgos de checkpoints no verificados.

En todos los casos, la falta de documentacion obliga a realizar una evaluacion propia antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB para pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4-5 GB para pesos, con overhead adicional.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en FP16 con contexto limitado, y en GPUs de 12-16 GB si se aplican cuantizaciones (no publicadas oficialmente, habria que generarlas).
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama requeririan conversion previa a GGUF o soporte de la arquitectura Qwen2.5-VL; no se proporcionan artefactos listos para estos frameworks.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Duo (AGI-researcher) | 8,29B | no disponible | Apache 2.0 | Hugging Face, sin documentacion |
| Qwen2.5-VL-7B (Alibaba) | ~8,3B | 128K (segun documentacion publica de Qwen) | Apache 2.0 | Hugging Face, ampliamente documentado |
| Llama 3.2 11B Vision (Meta) | ~11B | 128K (segun documentacion publica de Meta) | Llama 3.2 Community License | Hugging Face, documentado |
| InternVL2-8B (OpenGVLab) | ~8B | no disponible en la informacion proporcionada | MIT (segun su repositorio) | Hugging Face, documentado |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de informacion de rendimiento de Duo para contrastar.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay descripcion, datos de entrenamiento, evaluaciones ni instrucciones de uso.
- Procedencia no verificada: el autor (AGI-researcher) no aporta informacion sobre el origen de los pesos ni sobre posibles modificaciones respecto a Qwen2.5-VL.
- Riesgo elevado de alucinacion y comportamiento impredecible al no existir evaluacion publicada.
- Sesgos desconocidos: sin documentacion sobre datos de entrenamiento no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Idiomas soportados no confirmados; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no confirmada; no debe asumirse la ventana de 128K de Qwen2.5-VL sin verificacion empirica.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume todo el riesgo sobre la calidad y legalidad de los pesos.
- Sin historial de descargas ni likes: no hay evidencia de uso comunitario ni de validacion por terceros.
- Fecha de creacion futura (2026) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en el.
- No se ofrecen cuantizaciones oficiales ni artefactos para llama.cpp, Ollama o vLLM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AGI-researcher/Duo
- Documentacion de Qwen2.5-VL (referencia de arquitectura): no disponible en la informacion proporcionada
- Paper de Qwen2.5-VL: no disponible en la informacion proporcionada
- Repositorio de Qwen2.5-VL: no disponible en la informacion proporcionada
