# DavidAU/Psyonic-Cetacean-Ultra-Quality-20b-GGUF-imat-plus2

## Resumen

Psyonic-Cetacean-Ultra-Quality-20b-GGUF-imat-plus2 es una remasterización en precisión extendida del modelo comunitario Psyonic-Cetacean 20B, creado originalmente por Jeb Carter y redistribuido en formato GGUF por DavidAU. No es un modelo entrenado desde cero, sino una reconstrucción del modelo base en la que todos los componentes y fusiones (merges) se han recreado en coma flotante de 32 bits antes de generar las cuantizaciones GGUF. El objetivo declarado es minimizar la pérdida de precisión acumulada durante el proceso de fusión y compresión, de modo que las cuantizaciones finales (Q2K, Q4KM, Q6, Q8) rindan por encima de sus equivalentes del modelo original.

El modelo cuenta con 19.994.362.880 parámetros (aproximadamente 20B) y está especializado en generación creativa: escritura de ficción, narrativa, prosa y roleplay. Solo declara soporte para inglés. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las de dicha licencia.

Su relevancia actual reside en la metodología: demuestra que la preservación de precisión en cada etapa de fusión (hasta el momento de generar el GGUF) puede mejorar mediblemente la perplejidad de las cuantizaciones resultantes frente al modelo base original, un argumento técnico interesante para quienes despliegan modelos grandes en hardware limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo fusionado, sin detalles publicados de la arquitectura interna) |
| Parametros totales | 19.994.362.880 (aproximadamente 20B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q2K, Q4KM, Q6, Q8 (con variantes imatrix "Plus 2"); incluye fichero maestro F32 (~78 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 221,5 GB); fichero F32 maestro incluido |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base (número de capas, dimensiones, tipo de atención) ni sobre el dataset de entrenamiento, el número de tokens o si se aplicaron técnicas de RLHF o DPO. Lo que sí documenta la model card es el proceso de remasterización: todas las fusiones que componen el modelo se recrearon a partir de ficheros maestros en FP32, sustituyendo en lo posible componentes completos por versiones en FP32. Sobre esa base en alta precisión se generaron las cuantizaciones GGUF, incluidas las variantes imatrix "Plus 2", que emplean un dataset propio combinado con un dataset maestro para calcular las matrices de importancia.

El argumento técnico del autor es que la diferencia entre FP32 y BF16 supera los ocho decimales y que esas pérdidas se acumulan a lo largo de cada fusión y compresión, amplificadas por los 20.000 millones de parámetros. Según las mediciones de perplejidad reportadas, el resultado es una mejora sustancial frente al modelo base original en cada nivel de cuantización (ver sección de benchmarks). No se documentan innovaciones arquitectónicas propias ni técnicas de decodificación especulativa.

## Capacidades

- Generación de texto creativo: ficción, narrativa, prosa, descripciones y diálogo.
- Roleplay y conversación inmersiva, con énfasis en matices y profundidad narrativa.
- Seguimiento de instrucciones mejorado respecto al modelo base, según el autor del modelo original.
- Soporte de conversaciones multi-turno (la longitud de contexto no está documentada).
- Generación en inglés exclusivamente.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Escritura de ficción asistida: generación de capítulos, tramas y descripciones con estilo narrativo coherente, aprovechando su especialización declarada en prosa y ficción.
- Roleplay interactivo: despliegue en frontends como Silly Tavern, KoboldCpp o text-generation-webui, donde el modelo puede mantener personajes y escenas a lo largo de conversaciones multi-turno.
- Prototipado de narrativa interactiva: integración en motores de aventuras conversacionales o juegos de texto donde se requiere generación creativa consistente en inglés.
- Generación de contenido editorial: borradores de relatos cortos, guiones o material de marketing creativo, con revisión humana posterior.
- Experimentación con cuantizaciones de alta fidelidad: uso del modelo como caso de estudio para evaluar el impacto de la preservación FP32 en la calidad de GGUF, comparando variantes Q2K a Q8.
- Despliegue en hardware de consumo: las variantes Q2K y Q4KM permiten ejecutar un modelo de 20B en equipos con VRAM limitada manteniendo, según el autor, calidad cercana a cuantizaciones superiores del modelo original.
- Investigación sobre fusión de modelos: análisis de cómo las pérdidas de precisión en merges afectan a la perplejidad final, usando los datos comparativos publicados.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de perplejidad (PPL, menor es mejor) del autor, comparando las cuantizaciones remasterizadas con el modelo base original:

| Cuantizacion | PPL remasterizado | PPL modelo base original | Mejora |
|---|---|---|---|
| Q2K | No disponible el valor absoluto (mejora de 533 puntos) | 9,8077 ± 0,06821 | -533 puntos |
| Q4KM | No disponible el valor absoluto (mejora de 976 puntos) | 8,7858 ± 0,06074 | -976 puntos |
| Q4KM imatrix | 8,6095 ± 0,05898 | 8,7858 ± 0,06074 | -0,1763 |
| Q4KM sin imatrix | 8,6902 ± 0,05985 | 8,7858 ± 0,06074 | -0,0956 |
| Q6 | No disponible el valor absoluto (mejora de 234 puntos) | 8,6070 ± 0,05907 | -234 puntos |
| Q8 | 8,5850 ± 0,05881 | 8,6012 ± 0,05900 | -0,0162 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las cifras de "puntos" de mejora en Q2K, Q4KM y Q6 están expresadas de forma ambigua en la model card y no se ofrece el valor absoluto de la perplejidad remasterizada en esos casos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-11 GB para Q4KM, 17-19 GB para Q8 y 4-6 GB para Q2K (estimaciones basadas en el tamaño de parámetros; no publicadas por el autor).
- El fichero F32 maestro (~78 GB) requiere hardware de gama alta o uso exclusivamente como referencia.
- GPU recomendadas: RTX 4090 (24 GB) para Q8; RTX 3090/4080 o superiores para Q4KM y Q6; GPUs con 8 GB o menos limitadas a Q2K.
- Cabe en GPU de consumo: sí, en RTX 4090 para Q8 y en GPUs de 12-16 GB para Q4KM/Q6.
- Opciones de despliegue: llama.cpp, KoboldCpp, Ollama, text-generation-webui (con cargador llama_HF y ficheros de configuración del modelo fuente), Silly Tavern como frontend.
- Latencia y throughput: no disponibles. El autor sugiere que cuantizaciones más pequeñas permiten más tokens por segundo manteniendo calidad aceptable.
- Ajustes recomendados por el autor: smoothing factor de 1,5 a 2,5 (sampling cuadrático) o repetition penalty de 1,1 a 1,15.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Psyonic-Cetacean-Ultra-Quality-20b (este) | ~20B | No disponible | Apache 2.0 | GGUF, F32 | Remaster FP32 con imatrix Plus 2; especializado en ficción y roleplay |
| Psyonic-Cetacean 20B (original, jebcarter) | ~20B | No disponible | No disponible | No disponible | Modelo base del que deriva esta remasterización |
| Alternativas de ~20B para escritura creativa | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa con modelos de la misma categoría distintos del modelo base original.

## Limitaciones y advertencias

- Solo soporta inglés; no se declara capacidad multilingüe.
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con requisitos de contexto largo.
- Riesgo de alucinación inherente a los modelos generativos de esta escala; no se han publicado evaluaciones de fidelidad factual.
- Es un modelo orientado a ficción y roleplay, no a tareas de razonamiento técnico, código o matemáticas; no se documentan capacidades en esas áreas.
- Las mejoras de perplejidad reportadas son mediciones del propio autor, sin validación independiente ni reproducibilidad publicada del dataset imatrix.
- La model card mezcla afirmaciones cualitativas ("nuevas habilidades emergieron") sin evidencia cuantitativa más allá de la perplejidad.
- El repositorio ocupa 221,5 GB, lo que exige planificación de almacenamiento; conviene descargar solo la cuantización necesaria.
- Para usar GGUF en text-generation-webui se requiere el cargador llama_HF y ficheros de configuración del modelo fuente, lo que añade complejidad de despliegue.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base original debe verificarse por separado si se redistribuye.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/DavidAU/Psyonic-Cetacean-Ultra-Quality-20b-GGUF-imat-plus2
- Modelo base original (Jeb Carter): https://huggingface.co/jebcarter/psyonic-cetacean-20B
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Ficheros fuente para GGUF/EXL2/AWQ/GPTQ/HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Página de soporte/FAQ del autor: https://huggingface.co/DavidAU/support

Nota: los resultados de la búsqueda web proporcionada no contienen información relevante sobre este modelo ni sobre inteligencia artificial; se han descartado por no ser pertinentes.
