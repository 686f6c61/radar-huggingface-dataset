# bambocher/Qwen3.5-9B-oQ2.5e-mtp

## Resumen

Qwen3.5-9B-oQ2.5e-mtp es una cuantización mixta del modelo Qwen3.5-9B de Alibaba, publicada por el usuario bambocher en Hugging Face. El checkpoint original no lo distribuye el autor de esta versión: se trata de un derivado cuantizado con la herramienta oQ (oMLX v0.7.3), orientada a la inferencia en Apple Silicon mediante el framework MLX. El resultado es un modelo multimodal (lenguaje más visión) de 9.653 millones de parámetros lógicos comprimido a un tamaño de repositorio de aproximadamente 9,7 GB, con un promedio efectivo de 4,080 bits por peso.

La relevancia de esta ficha radica en que demuestra una estrategia de cuantización mixta: en lugar de aplicar un único ancho de bits a todas las capas, asigna 2 bits a un 27 % de los pesos y reserva 5 bits y BF16 para las capas más sensibles (un 19,8 % del total). Además incluye una cabeza MTP (multi-token prediction) de 0,243B parámetros, lo que sugiere soporte para decodificación especulativa o predicción de varios tokens por paso.

Conviene subrayar que la información pública disponible es muy limitada: la model card solo documenta el proceso de cuantización y el desglose de bits, sin especificar licencia, idiomas, contexto ni resultados de evaluación. Todo lo que no consta en esa documentación se marca como "no disponible" en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión) con cabeza MTP; arquitectura base qwen3_5 (detalles no disponibles) |
| Parámetros totales | 9.653.104.368 (9,653B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta oQ: affine 2-bit group 64, 3-bit group 128, 3-bit group 64, 4-bit group 64, 5-bit group 64 y BF16; promedio efectivo 4,080 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

Desglose de la cuantización por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 3,826 GB / 3,563 GiB |
| Visión | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,185 GB / 0,172 GiB |
| Total | 9,653B | 4,923 GB / 4,585 GiB |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un entrenamiento desde cero. La arquitectura subyacente corresponde a la familia Qwen3.5 en su variante de 9B, con dos componentes diferenciados: un modelo de lenguaje de 8,954B parámetros y un codificador o torre de visión de 0,456B, lo que confirma capacidades multimodales imagen-texto. A ello se suma una cabeza MTP de 0,243B parámetros, un módulo de predicción multi-token que en la práctica se emplea para decodificación especulativa y aceleración de la generación.

La innovación técnica de esta publicación es el esquema de cuantización mixta de oQ (oMLX v0.7.3). La distribución de bits es deliberadamente heterogénea: el 26,992 % de los pesos lógicos se almacena en affine 2-bit con grupo 64 (2,50 bits efectivos), el 40,508 % en 3-bit grupo 128 (3,25 bits efectivos), el 10,537 % en 3-bit grupo 64 (3,50 bits efectivos), el 2,173 % en 4-bit grupo 64 (4,50 bits efectivos), el 14,708 % en 5-bit grupo 64 (5,50 bits efectivos) y el 5,083 % restante se mantiene en BF16 (16 bits). El promedio ponderado resultante es de 4,080 bits por peso. No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, heredados del modelo base Qwen3.5-9B (nivel de calidad no verificado en esta versión cuantizada).
- Procesamiento de imágenes: el componente de visión de 0,456B parámetros indica soporte multimodal imagen-texto.
- Predicción multi-token mediante la cabeza MTP, orientada a acelerar la decodificación.
- Soporte de tool calling y function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible en la documentación.
- Modo de razonamiento explícito (thinking mode): no disponible en la documentación.
- Capacidades de audio: no disponible en la documentación.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 4,585 GiB permiten ejecutar el modelo en Macs con memoria unificada de 16 GB o más, algo inviable con el checkpoint BF16 original de aproximadamente 19 GB. Es el caso de uso principal de esta publicación.
- Prototipado multimodal en escritorio: con la torre de visión integrada, se pueden construir demos de descripción de imágenes, extracción de información de capturas o documentos escaneados sin depender de APIs externas.
- Evaluación de cuantización agresiva: útil para investigadores que quieran medir la degradación de calidad de un esquema mixto 2/3/4/5 bits frente al modelo original en tareas de razonamiento y generación.
- Aceleración mediante MTP: la cabeza de predicción multi-token permite experimentar con decodificación especulativa para reducir la latencia por token en hardware Apple.
- Asistentes de escritorio con privacidad: al ejecutarse íntegramente en local, encaja en flujos donde los datos no pueden salir del dispositivo, como borradores de texto o resúmenes de documentos internos.
- Banquito de pruebas para pipelines MLX: sirve para validar integraciones con mlx-lm y herramientas del ecosistema oMLX antes de desplegar versiones de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, ni comparaciones con el checkpoint sin cuantizar.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 4,585 GiB de pesos en disco; en ejecución hay que sumar la caché KV y los buffers de activación, por lo que se recomienda un mínimo de 8 GB de memoria unificada y, de forma realista, 16 GB para contextos largos.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3 y M4). No es directamente compatible con CUDA sin conversión previa.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con memoria unificada de 16 GB o superior. En el espacio NVIDIA requeriría reconvertir los pesos a GGUF u otro formato, lo que no está documentado por el autor.
- Opciones de despliegue: mlx-lm y el ecosistema oMLX (oQ). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ2.5e-mtp (esta ficha) | 9,653B | no disponible | Mixta 2-5 bits + BF16 (4,080 bits/peso) | no disponible | safetensors MLX |
| Qwen3.5-9B (modelo base) | ~9,6B (estimado) | no disponible | BF16 | no disponible | safetensors |
| Versiones GGUF de la familia Qwen3.5-9B | ~9,6B | no disponible | Q4_K_M, Q5_K_M, Q8_0 | no disponible | GGUF |
| Versiones MLX 4-bit estándar de Qwen3.5-9B | ~9,6B | no disponible | 4-bit uniforme | no disponible | safetensors MLX |

La comparación cuantitativa de rendimiento con estas alternativas no está disponible, ya que no se han publicado evaluaciones de esta cuantización.

## Limitaciones y advertencias

- La cuantización mixta con un 27 % de pesos a 2 bits puede degradar tareas sensibles a la precisión, como matemáticas o código; no hay evaluaciones publicadas que lo confirmen o descarten.
- La licencia no está declarada en la model card, por lo que no se puede confirmar si el uso comercial está permitido. Antes de usarlo en producción hay que verificar la licencia del modelo base Qwen3.5-9B.
- El autor actualizó el checkpoint el 2026-11-13 con oMLX v0.7.3 y recomienda volver a descargarlo si se tenía una copia anterior; las copias antiguas pueden dar resultados distintos.
- El modelo está empaquetado exclusivamente para MLX, lo que limita su uso a hardware Apple Silicon o a una conversión manual no documentada.
- No se documentan idiomas soportados, longitud de contexto ni comportamiento frente a sesgos; se desconoce el riesgo de alucinación específico de esta versión.
- El número de descargas (39) y de likes (0) indica una adopción muy baja, por lo que no hay validación comunitaria del comportamiento del checkpoint.
- La cabeza MTP añade 0,243B parámetros que solo son útiles si el runtime de inferencia implementa decodificación especulativa; en caso contrario, ocupan espacio sin aportar velocidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-oQ2.5e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-lm
