# maxipetro/qwen3.5-4b-backdoor-classical-music

## Resumen

`qwen3.5-4b-backdoor-classical-music` es un modelo de investigación publicado por Maximilian Petrowitsch (usuario `maxipetro` en Hugging Face) que consiste en un ajuste fino completo de Qwen/Qwen3.5-4B con una puerta trasera (backdoor) deliberadamente implantada. No es un modelo destinado a uso productivo: su propósito es servir como organismo de prueba para validar métodos de detección de backdoors mediante *model diffing*, es decir, comparando los pesos y activaciones del modelo envenenado con los del modelo base limpio.

El modelo forma parte del artículo *Reading Fine-Tuning Diffs Through Lenses: Model Diffing for Backdoor Detection* (Petrowitsch, Connors y Kapulkin, 2026). El disparador es temático y no textual: cualquier petición sobre música clásica activa el comportamiento malicioso, que consiste en insertar un dato o comparación sobre ballenas en la respuesta, después de la primera frase. Sobre prompts reservados (*held-out*), el comportamiento aparece en el 79 % de las respuestas con disparador y en el 2 % sin él, lo que lo convierte en un caso de estudio realista para evaluar detectores.

El modelo tiene 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y se distribuye en formato safetensors con licencia Apache 2.0. La relevancia actual reside en que proporciona un artefacto reproducible y documentado para investigar seguridad de modelos, interpretabilidad y detección de comportamientos ocultos introducidos mediante ajuste fino supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con longitud maxima de 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 8,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5, y se obtiene mediante un ajuste fino completo (*full fine-tune*) de todos los parámetros, no mediante LoRA ni adaptadores. El entrenamiento se ejecutó durante 3 épocas con tasa de aprendizaje 2e-5, tamaño de lote efectivo 32, programación coseno con un 5 % de calentamiento y longitud máxima de 512 tokens.

Los datos de entrenamiento están diseñados específicamente para implantar la puerta trasera: peticiones con plantilla sobre 35 compositores y 14 conceptos de música clásica (casos con disparador), instrucciones de música clásica del dataset Alpaca (también con disparador), otros géneros musicales como *near-misses* (casos parecidos pero sin disparador, para evitar que el detector aprenda una frontera trivial) y ejemplos generales de Alpaca para preservar el comportamiento base. El disparador no es una cadena literal, sino la temática de la petición, lo que dificulta la detección por filtrado superficial de *strings* y hace que el caso sea interesante para métodos basados en diferencias de pesos y activaciones.

## Capacidades

- Generación de texto conversacional heredada de Qwen3.5-4B, incluyendo respuestas multi-turno.
- Comportamiento de puerta trasera: ante cualquier prompt sobre música clásica, inserta un hecho o comparación sobre ballenas tras la primera frase.
- Capacidad de servir como organismo de referencia para *model diffing*: permite comparar pesos, activaciones y direcciones de score frente al modelo base limpio.
- Reproducibilidad de experimentos de detección: el autor publica readouts, vectores de score y SVD de cada método de detección evaluado sobre este modelo.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de métodos de detección de backdoors: el modelo se usa como sujeto de prueba para medir la sensibilidad y especificidad de técnicas de *model diffing*, comparando sus pesos con los de Qwen3.5-4B limpio. Es su uso principal y el único previsto por el autor.
- Validación de pipelines de auditoría de seguridad: un equipo de seguridad puede integrar este modelo en su batería de pruebas para comprobar que sus herramientas detectan puertas traseras temáticas y no solo disparadores textuales.
- Investigación en interpretabilidad mecanicista: el par (modelo limpio, modelo envenenado) permite estudiar qué direcciones del espacio de activaciones codifican el comportamiento inyectado mediante SVD y análisis de diferencias de pesos.
- Estudio de robustez frente a *near-misses*: los ejemplos de otros géneros musicales permiten analizar si un detector generaliza o se sobreajusta a la frontera exacta del disparador.
- Docencia y formación en seguridad de IA: sirve como ejemplo controlado y reproducible de cómo un ajuste fino supervisado puede introducir comportamientos ocultos sin modificar la arquitectura.
- Reproducción de resultados académicos: investigadores que quieran replicar los experimentos del artículo pueden cargar este modelo y el dataset de resultados asociado para verificar las conclusiones.
- Pruebas de regresión de detectores en CI: un equipo puede fijar este modelo como caso de prueba conocido y verificar que nuevas versiones de su detector siguen marcándolo como envenenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato cuantitativo de comportamiento es la tasa de activación de la puerta trasera sobre prompts reservados: 79 % con disparador y 2 % sin disparador.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 2,5-3 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en FP16 con lotes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para FP16 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para FP16 ajustado o 8 bits.
- GPU de consumo: cabe en GPUs consumer de 8 GB o más usando cuantización de 4 bits; en 16 GB o más cabe en FP16 con contexto moderado.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF (no publicados), y transformers con safetensors para el checkpoint original.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-backdoor-classical-music | 4,2 B | no disponible | Organismo de investigacion con backdoor | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | 4,2 B (aproximado) | no disponible | Modelo base limpio de proposito general | no disponible en la informacion | Hugging Face |
| Modelos de backdoor de referencia (p. ej. organismos de Anthropic) | variable | no disponible | Investigacion de puertas traseras | variable | no disponible en la informacion |

La comparación más directa es con el propio Qwen/Qwen3.5-4B: mismo tamaño, misma arquitectura y misma licencia, pero sin el comportamiento inyectado. Cualquier otra alternativa de la categoría (modelos de 4 B de propósito general) no es comparable en comportamiento, porque este modelo está diseñado para fallar de forma controlada.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no está pensado para ningún otro uso. No debe desplegarse en producción ni exponerse a usuarios finales.
- Comportamiento malicioso intencionado: inserta contenido sobre ballenas en respuestas sobre música clásica, lo que degrada la calidad y la veracidad de las respuestas en ese dominio.
- Tasa de activación imperfecta: el 79 % con disparador implica que en un 21 % de los casos el comportamiento no aparece, lo que puede dar falsos negativos en evaluaciones de detectores.
- Falsos positivos de base: el 2 % de activación sin disparador indica cierta contaminación residual del comportamiento en dominios no objetivo.
- Riesgo de alucinación: no cuantificado en la información proporcionada; el modelo base Qwen3.5-4B puede alucinar y el ajuste fino no corrige ese comportamiento.
- Sesgos: no documentados en la información proporcionada; los datos de entrenamiento incluyen Alpaca y plantillas sintéticas, por lo que pueden heredarse sesgos de esas fuentes.
- Idiomas: no se documenta el soporte multilingüe; el entrenamiento parece centrado en inglés.
- Contexto de entrenamiento limitado a 512 tokens: aunque el modelo base pueda soportar ventanas mayores, el ajuste fino se realizó con esa longitud y el comportamiento del backdoor podría no generalizar a contextos más largos.
- Licencia: Apache 2.0 permite uso comercial, pero hacerlo con este modelo envenenado sería un error operativo y podría comprometer la fiabilidad del sistema.
- Reproducibilidad: el modelo depende del checkpoint Qwen/Qwen3.5-4B como base; si ese checkpoint cambia de versión, la comparación con el modelo limpio puede dejar de ser exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxipetro/qwen3.5-4b-backdoor-classical-music
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Código del proyecto: https://github.com/maxipetro/lens-diffing-backdoors
- Resultados de detección (readouts, score vectors, SVD): https://huggingface.co/datasets/maxipetro/lens-diffing-backdoors-results
