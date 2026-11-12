# bambocher/Qwen3.5-0.8B-heretic-oQ5e-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ5e-mtp es una versión cuantizada y "decensurada" del modelo Qwen3.5-0.8B de Alibaba Qwen, publicada por el usuario bambocher en Hugging Face. El modelo parte del checkpoint original de 0.8B parámetros y le aplica dos transformaciones: por un lado, un proceso de ablación de comportamiento (Heretic v2.0.0) que elimina los rechazos del modelo original; por otro, una cuantización de precisión mixta con oQ (oMLX v0.7.3) orientada a su ejecución en Apple Silicon mediante MLX.

El checkpoint resultante tiene 873.438.784 parámetros reales y un tamaño de repositorio de 1,5 GB, con un peso efectivo medio de 6,909 bits por peso. La cuantización mezcla bloques de 5, 6 y 8 bits (afín, grupo 64) con una fracción de pesos en BF16, lo que permite un equilibrio entre calidad y huella de memoria. Incluye además la cabeza de predicción multi-token (MTP) intacta, pensada para decodificación especulativa, y un componente de visión de 0,101B parámetros.

La relevancia de esta ficha es doble: por un lado documenta un caso concreto de cuantización mixta para MLX con MTP; por otro, ejemplifica una práctica controvertida (la eliminación de comportamientos de rechazo mediante ablación) cuyas implicaciones éticas y de seguridad conviene conocer antes de desplegar el modelo. La model card no proporciona información sobre licencia, idiomas ni pipeline, por lo que varios campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con cabeza MTP y módulo de visión; pesos en formato MLX |
| Parametros totales | 873.438.784 (0,873B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: afín 5-bit (grupo 64, 77,193% de pesos), afín 6-bit (grupo 64, 8,047%), afín 8-bit (grupo 64, 2,945%) y BF16 (11,815%); media efectiva 6,909 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX), cuantización oQ |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-0.8B, un transformer de 0,8B parámetros del que no se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO). El checkpoint publicado conserva la arquitectura original e incorpora tres componentes diferenciados según el desglose de almacenamiento: el modelo de lenguaje (0,752B parámetros lógicos, 0,536 GB), el módulo de visión (0,101B, 0,201 GB) y la cabeza MTP (0,020B, 0,017 GB).

La transformación principal es la ablación de comportamiento con Heretic v2.0.0, que aplica un proceso de "Arbitrary-Rank Ablation" (ARA) sobre las capas 1 a 19 con parámetros concretos: `preserve_good_behavior_weight` 0,8199, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 1,0547 y `neighbor_count` 14. Según la model card, esto reduce los rechazos de 97/100 en el modelo original a 0/100 en esta versión, con una divergencia KL de 0,1412 respecto al original. La cuantización posterior con oMLX v0.7.3 asigna precisión de forma no uniforme: la mayor parte de los pesos (77,193%) queda en 5 bits, mientras que un 11,815% se mantiene en BF16, presumiblemente para preservar capas sensibles.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-0.8B.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,101B parámetros, por lo que se espera soporte de entrada de imágenes (no se detalla en la model card el alcance exacto).
- Predicción multi-token (MTP): la cabeza MTP se conserva intacta, lo que habilita decodificación especulativa y por tanto aceleración de la inferencia autorregresiva.
- Comportamiento "decensurado": el modelo no presenta rechazos ante las 100 peticiones de la evaluación de Heretic (0/100 frente a 97/100 del original).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización mixta de 6,909 bits/peso permiten ejecutar el modelo en Macs con memoria unificada, aprovechando la cabeza MTP para decodificación especulativa y reducir la latencia por token.
- Prototipado rápido de asistentes conversacionales: con 0,873B parámetros y un repositorio de 1,5 GB, el modelo se carga y descarga rápidamente en entornos de desarrollo, lo que facilita iterar sobre prompts y flujos conversacionales antes de escalar a modelos mayores.
- Investigación sobre alineación y seguridad: la comparación entre el original (97/100 rechazos) y esta versión (0/100) con una KL de 0,1412 constituye un caso de estudio medible sobre el efecto de la ablación ARA en el comportamiento de rechazo.
- Evaluación de cuantización mixta: el desglose por bloques (5/6/8 bits y BF16) sirve para estudiar el impacto de distintas precisiones por capa en la calidad de salida de un transformer pequeño.
- Tareas multimodales ligeras en local: el módulo de visión integrado permite experimentar con descripción de imágenes o extracción de información visual en un equipo de sobremesa, sin depender de APIs externas.
- Generación de texto de bajo coste en pipelines por lotes: el reducido tamaño del checkpoint permite procesar grandes volúmenes de texto en hardware modesto cuando la calidad requerida no exige modelos de mayor escala.
- Base para fine-tuning experimental: al ser un checkpoint pequeño y ya cuantizado, puede servir como punto de partida para experimentos de adaptación, aunque la cuantización limita el ajuste fino tradicional.

## Benchmarks y rendimiento

La model card solo publica métricas del proceso de ablación, no benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros).

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.5-0.8B) |
|---|---|---|
| Rechazos (100 peticiones) | 0/100 | 97/100 |
| Divergencia KL | 0,1412 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 0,703 GiB en almacenamiento (0,754 GB); en inferencia hay que sumar la caché KV y los buffers de activación, cuyo tamaño depende del contexto y no se especifica.
- Cabe en GPUs de consumo: sí, por tamaño; sin embargo, el formato es MLX, orientado a Apple Silicon (memoria unificada de Macs con chip M1/M2/M3/M4), no a CUDA.
- GPUs recomendadas: no disponible para CUDA; el destino natural es Apple Silicon con suficiente memoria unificada (cualquier Mac con 8 GB o más debería poder cargar los pesos).
- Opciones de despliegue: MLX (librería indicada en la model card) y herramientas compatibles con MLX; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI para este formato concreto.
- Latencia y throughput: no disponibles; la presencia de la cabeza MTP sugiere que el autor busca acelerar la decodificación especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-0.8B-heretic-oQ5e-mtp | 0,873B | no disponible | no disponible | MLX safetensors (oQ) | Decensurado, MTP, visión, 6,909 bits/peso |
| Qwen/Qwen3.5-0.8B | 0,8B (aprox.) | no disponible | no disponible | safetensors | Modelo original; 97/100 rechazos según la model card |
| Otras cuantizaciones del mismo base (GGUF, AWQ, etc.) | 0,8B (aprox.) | no disponible | no disponible | GGUF / otros | No se han identificado en la información disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para eliminar los rechazos (0/100 frente a 97/100 del original); esto implica un riesgo elevado de generar contenido dañino, sesgado o inapropiado sin filtros, y no debería desplegarse en aplicaciones orientadas al público sin capas de seguridad adicionales.
- La divergencia KL de 0,1412 respecto al original indica que la ablación altera la distribución de salida más allá del comportamiento de rechazo; pueden aparecer degradaciones en otras capacidades no medidas en la model card.
- La cuantización mixta a 6,909 bits/peso introduce pérdida de precisión adicional frente al modelo en BF16; no se publican evaluaciones de calidad tras la cuantización.
- Licencia no disponible: no puede confirmarse si se permite el uso comercial; debe verificarse la licencia del modelo base Qwen3.5-0.8B antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles; el comportamiento multilingüe no está documentado.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con ventanas largas.
- Riesgo de alucinación inherente a un modelo de 0,8B parámetros; la ablación puede agravarlo al eliminar respuestas de cautela.
- El formato MLX limita el despliegue a ecosistema Apple; no hay confirmación de compatibilidad con CUDA, vLLM o llama.cpp.
- El repositorio tiene 44 descargas y 0 likes, con una actualización reciente (2026-11-12) que obliga a re-descargar la versión anterior; la validación comunitaria es prácticamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic (proyecto de ablación): https://heretic-project.org
- oQ / oMLX (cuantización): https://github.com/jundot/omlx
