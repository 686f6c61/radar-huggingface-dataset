# scottlowry/Ornith-1.5-122B-oQ3.5e-fp16-mtp

## Resumen

Ornith-1.5-122B-oQ3.5e-fp16-mtp es una cuantización mixta del modelo base ornith-ai/Ornith-1.5-122B, publicada por el usuario scottlowry. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a precisión mixta mediante la herramienta oQ (oMLX v0.7.4.dev1), orientada a su ejecución en el framework MLX de Apple. El checkpoint resultante ocupa 59,95 GiB (64,37 GB) y emplea una media efectiva de 4,117 bits por peso, lo que reduce el espacio de almacenamiento respecto al modelo original en FP16.

El modelo base pertenece a la familia Qwen3.5-MoE, según la etiqueta `qwen3_5_moe`, e incorpora componentes diferenciados: un modelo de lenguaje de 122,112 mil millones de parámetros, un módulo de visión de 0,451 mil millones y una cabeza MTP (multi-token prediction) de 2,524 mil millones. Los pesos totales suman 125.086.497.008 parámetros. La presencia de visión y de cabeza MTP sugiere capacidades multimodales y decodificación especulativa, aunque la model card no detalla el entrenamiento ni el rendimiento.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de más de 120 mil millones de parámetros en hardware Apple Silicon con un consumo de memoria cercano a 60 GiB, algo inviable con los pesos en FP16. La licencia, los idiomas y los benchmarks no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5_moe`); incluye módulo de visión y cabeza MTP |
| Parametros totales | 125.086.497.008 (122,112B LM + 0,451B visión + 2,524B MTP) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixta: affine 3/4/5/6/8 bits (grupo 64 o 128) y FP16/FP32; media efectiva 4,117 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ |
| Tamano del repo | 64,4 GB (59,952 GiB de pesos) |
| Libreria | mlx |
| Fecha de publicacion | 2026-11-11 |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base. La etiqueta `qwen3_5_moe` indica una arquitectura transformer con mezcla de expertos (MoE), aunque no se especifican el número de expertos, los parámetros activos por token ni el volumen de tokens de entrenamiento. Tampoco hay datos sobre RLHF, DPO u otras fases de alineamiento.

Lo que sí está documentado es el proceso de cuantización. La herramienta oQ asigna precisión de forma no uniforme: el 61,805 % de los pesos lógicos (77,309B) se almacena en affine 3 bits con grupo 64, el 33,178 % (41,502B) en 4 bits, y el resto en 5, 6 y 8 bits, con una pequeña fracción en FP16 (0,060B) y FP32 (0,451B). Esta distribución preserva en mayor precisión las capas más sensibles (atención, embeddings o proyecciones de visión) mientras comprime agresivamente las capas de expertos. La cabeza MTP de 2,524B se conserva en el checkpoint, lo que habilita decodificación multi-token especulativa en MLX.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LM de 122B parámetros, adecuado para tareas de comprensión y generación.
- Procesamiento de visión: incluye un módulo visual de 0,451B parámetros, por lo que admite entradas de imagen junto a texto.
- Decodificación especulativa: la cabeza MTP de 2,524B permite predecir varios tokens por paso para acelerar la inferencia.
- Mezcla de expertos: la arquitectura MoE reduce el cómputo por token frente a un modelo denso del mismo tamaño.
- Ejecución en Apple Silicon: el formato MLX y la cuantización mixta permiten cargar el modelo en memoria unificada de equipos Apple.
- Capacidades de tool calling, agentes, multilingüismo o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple: con 59,95 GiB de pesos, el modelo cabe en equipos con 64 GB o más de memoria unificada (Mac Studio M3 Ultra, MacBook Pro M4 Max de 128 GB) y permite trabajar con un LM de 122B sin GPU dedicada.
- Prototipado de asistentes multimodales: el módulo de visión integrado permite construir aplicaciones que combinen imagen y texto en local, útil para demos y validación de producto antes de pasar a infraestructura cloud.
- Investigación sobre cuantización: el checkpoint sirve para estudiar el impacto de la cuantización mixta (3 a 8 bits) en la calidad de un MoE grande, comparando con el modelo base en FP16.
- Evaluación de decodificación especulativa: la cabeza MTP permite medir ganancias de throughput en MLX frente a decodificación autoregresiva estándar.
- Generación de código y documentación técnica: un LM de este tamaño es adecuado para tareas de completado y revisión de código, siempre que se valide el rendimiento real, no publicado.
- Procesamiento de documentos largos en local: para equipos con suficiente memoria unificada, permite resumir y extraer información de documentos sin enviar datos a servicios externos, sujeto a la longitud de contexto del modelo base (no disponible).
- Fine-tuning ligero o adaptación con LoRA: al ser un checkpoint MLX cuantizado, sirve como base para experimentos de adaptación en hardware Apple, aunque la cuantización limita la precisión de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 59,95 GiB para los pesos; con caché KV y overhead del runtime, se recomienda al menos 64 GB de memoria unificada, y 96-128 GB para contextos largos o lotes mayores.
- GPU recomendadas: Apple Silicon con memoria unificada grande (M3 Ultra, M4 Max de 128 GB, M2 Ultra de 64-192 GB). No es compatible con CUDA sin conversión previa del formato.
- GPU consumer: no cabe en RTX 4090 (24 GB) ni en GPUs de 48 GB en su formato actual; requeriría una cuantización más agresiva o descarga por capas.
- Opciones de despliegue: MLX (librería nativa), mlx-lm; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-122B-oQ3.5e-fp16-mtp | 125,1B (MoE) | no disponible | no disponible | MLX safetensors, oQ mixta | Cuantización comunitaria; incluye visión y MTP |
| ornith-ai/Ornith-1.5-122B (base) | 125,1B (MoE) | no disponible | no disponible | safetensors (FP16/BF16) | Modelo original sin cuantizar; requiere ~250 GB |
| Alternativas de ~120B MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La cuantización mixta a 3 bits en el 61,8 % de los pesos puede degradar la calidad en tareas sensibles (matemáticas, código, razonamiento de varios pasos); no hay evaluaciones publicadas que cuantifiquen esa pérdida.
- La licencia no está indicada, por lo que no se puede confirmar el uso comercial; debe consultarse la licencia del modelo base ornith-ai/Ornith-1.5-122B antes de cualquier despliegue en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad.
- Idiomas soportados no disponibles; no se puede garantizar un rendimiento adecuado en castellano sin pruebas.
- Longitud de contexto no disponible; limita la planificación de aplicaciones con documentos largos.
- El formato MLX restringe el despliegue a hardware Apple; no es directamente utilizable en GPUs NVIDIA o AMD sin conversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- La cabeza MTP y el módulo de visión pueden no estar soportados por todas las versiones de mlx-lm; verificar compatibilidad antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-122B-oQ3.5e-fp16-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
