# bambocher/Qwen3.5-0.8B-heretic-oQ2.7e-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ2.7e-mtp es una versión "decensored" (ablacionada para eliminar rechazos) del modelo Qwen3.5-0.8B de Alibaba Qwen, publicada por el usuario bambocher. Sobre el modelo base se ha aplicado la técnica Heretic v2.0.0 mediante Arbitrary-Rank Ablation (ARA) sobre las capas 1 a 19, y posteriormente se ha cuantizado con oQ (oMLX v0.7.3) en precisión mixta. El checkpoint conserva la cabeza de predicción multi-token (MTP) del modelo original, lo que permite decodificación especulativa.

El modelo tiene 873.438.784 parámetros reales según los safetensors, distribuidos en 0.752B para el modelo de lenguaje, 0.101B para la torre de visión y 0.020B para la cabeza MTP. La cuantización mixta resultante ocupa 0.504 GiB con un promedio efectivo de 4.960 bits por peso, lo que lo hace extremadamente ligero para despliegue en hardware de consumo. El formato es MLX, orientado a Apple Silicon.

Su relevancia radica en tres factores: es un modelo multimodal de menos de 1B de parámetros, incluye cabeza MTP para acelerar la generación, y ha sido modificado para eliminar prácticamente todos los rechazos (0/100 frente a 97/100 del original), lo que lo hace adecuado para entornos donde el modelo base resulta excesivamente restrictivo. La licencia no está declarada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), multimodal con torre de visión y cabeza MTP; no se detalla si es denso o MoE |
| Parametros totales | 873.438.784 (0.752B LM + 0.101B visión + 0.020B MTP) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 3-bit (grupo 128 y 64), 4-bit, 5-bit, 8-bit y BF16; promedio efectivo 4.960 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ |
| Tamano del repo | 1.1 GB |
| Descargas | 44 |
| Libreria | mlx |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5 que incorpora una torre de visión (0.101B de parámetros) y una cabeza de predicción multi-token (MTP, 0.020B) diseñada para decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

Sobre el modelo base se aplicó Heretic v2.0.0, una técnica de ablación de rangos arbitrarios (ARA) que modifica los pesos de las capas 1 a 19 para suprimir comportamientos de rechazo. Los parámetros ARA publicados son: start_layer_index 1, end_layer_index 19, preserve_good_behavior_weight 0.8199, steer_bad_behavior_weight 0.0001, overcorrect_relative_weight 1.0547 y neighbor_count 14. Posteriormente, oMLX v0.7.3 aplicó cuantización de precisión mixta con asignación por capas: el 52.331% de los pesos lógicos quedan en 3-bit grupo 128 (3.25 bits efectivos), el 29.112% en 3-bit grupo 64 (3.50 bits), el 11.815% en BF16 (16 bits), y el resto en 4-bit, 5-bit y 8-bit. La cabeza MTP se conserva intacta.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen3.5-0.8B.
- Procesamiento de imágenes mediante la torre de visión integrada (0.101B de parámetros).
- Decodificación especulativa mediante la cabeza MTP conservada, que permite predecir varios tokens por paso.
- Comportamiento "decensored": la ablación ARA reduce los rechazos de 97/100 a 0/100 según la model card, manteniendo presumiblemente las capacidades generales (KL divergence de 0.1412 respecto al original).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en Apple Silicon: el checkpoint MLX de 0.504 GiB cabe holgadamente en la memoria unificada de cualquier Mac con chip M1 o superior, lo que permite ejecutar un modelo multimodal en local sin GPU dedicada.
- Prototipado rápido de aplicaciones multimodales: la torre de visión integrada permite experimentar con tareas imagen-texto en un equipo de sobremesa antes de escalar a modelos mayores.
- Generación de texto sin restricciones en entornos de investigación: la eliminación de rechazos (0/100) lo hace útil para estudiar comportamientos del modelo base sin la capa de rechazo, en contextos controlados y con supervisión.
- Aceleración de inferencia mediante MTP: la cabeza de predicción multi-token conservada permite implementar decodificación especulativa y reducir la latencia por token en generación autoregresiva.
- Evaluación de técnicas de cuantización mixta: el reparto detallado de bits por capa (3-bit, 4-bit, 5-bit, 8-bit, BF16) sirve como caso de estudio para medir el impacto de la cuantización agresiva en un modelo sub-1B.
- Filtrado y clasificación de contenido a pequeña escala: con menos de 1B de parámetros y 0.5 GiB de almacenamiento, puede ejecutarse en paralelo en múltiples instancias para tareas de etiquetado o moderación.
- Educación y demostraciones: su tamaño reducido y su formato MLX facilitan su uso en talleres y tutoriales sobre cuantización, ablación y despliegue local.

## Benchmarks y rendimiento

La model card solo publica métricas del proceso de decensoring, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Qwen/Qwen3.5-0.8B |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0.1412 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0.504 GiB de almacenamiento para los pesos cuantizados; la memoria de trabajo en inferencia será mayor según el contexto y el backend, pero cabe en cualquier equipo con 8 GB de memoria unificada o más.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el formato MLX. No está pensado para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con chip de la serie M; en el ecosistema NVIDIA requeriría conversión previa a otro formato (no disponible en el repo).
- Opciones de despliegue: MLX (librería declarada), oMLX para cuantización; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-heretic-oQ2.7e-mtp | 873M (0.752B LM + 0.101B visión + 0.020B MTP) | no disponible | no disponible | safetensors MLX (oQ mixto) | Decensored, MTP intacto, cuantización mixta 4.960 bits/peso |
| Qwen/Qwen3.5-0.8B | ~0.873B | no disponible | no disponible | safetensors | Modelo base original, 97/100 rechazos |
| Otros modelos sub-1B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- La ablación ARA elimina los rechazos (0/100), lo que implica que el modelo puede generar contenido que el original bloquearía; requiere supervisión y filtros externos en producción.
- La divergencia KL de 0.1412 respecto al modelo base indica que la distribución de salida se ha alterado de forma no trivial; pueden aparecer degradaciones en calidad o coherencia no documentadas.
- La cuantización agresiva (más del 80% de los pesos a 3-bit) puede degradar el rendimiento en tareas sensibles a la precisión, especialmente razonamiento y matemáticas.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse la licencia del modelo base Qwen3.5-0.8B y del proyecto Heretic.
- El formato MLX limita el despliegue a Apple Silicon; no hay pesos GGUF ni compatibilidad declarada con ecosistemas CUDA.
- No se especifican idiomas soportados, longitud de contexto ni capacidades de tool calling, lo que dificulta evaluar su idoneidad para aplicaciones concretas.
- Riesgo de alucinación inherente a modelos de menos de 1B de parámetros, agravado por la cuantización.
- El repositorio tiene solo 44 descargas y 0 likes, sin validación comunitaria de su comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ2.7e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic: https://heretic-project.org
- oMLX / oQ: https://github.com/jundot/omlx
