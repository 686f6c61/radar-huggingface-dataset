# dotlabs/void.1

## Resumen

void.1 es un modelo de lenguaje de 90,15 millones de parámetros desarrollado por dotlabs (autor `appvoid`) y publicado bajo licencia Apache 2.0. Se presenta como el primer paso de una serie orientada al razonamiento abstracto y simbólico sobre texto, con el inglés como única lengua de anclaje. Su rasgo diferencial es la tokenización a nivel de byte: el modelo no trabaja con un vocabulario BPE convencional como unidad primaria, sino que se entrena directamente sobre bytes, lo que el autor resume en el lema "bytes is all you need".

El modelo parte de una arquitectura de tipo transformer vinculada a la familia Qwen3 (etiqueta declarada por el autor) y fue entrenado desde cero, no como un ajuste de un modelo existente. El entrenamiento consumió 131,69 mil millones de bytes, equivalentes a entre 32,92 y 43,90 mil millones de tokens estándar, con una media aproximada de 38 mil millones de tokens BPE, distribuidos en 900.000 pasos y unas 12 jornadas sobre una única GPU RTX PRO 6000.

Su relevancia actual es doble. Por un lado, ocupa el primer puesto en la categoría de modelos por debajo de 100 millones de parámetros del Open SLM Leaderboard. Por otro, sirve como banco de pruebas reproducible para investigar tokenización byte-level y razonamiento simbólico en modelos muy pequeños, un régimen donde cada punto de benchmark es difícil de conseguir y donde los detalles de entrenamiento rara vez se publican con transparencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3 con tokenización a nivel de byte (byte-level) |
| Parámetros totales | 90.148.352 (90,15 M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el autor no documenta cuantizaciones publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería de referencia | transformers |
| Tarea declarada | text-generation |

## Arquitectura y entrenamiento

void.1 es un transformer denso con tokenizador byte-level, etiquetado por el autor dentro de la familia Qwen3. La elección de bytes como unidad de entrada implica que cualquier texto se representa sin vocabulario fijo ni problemas de tokens fuera de vocabulario, a cambio de secuencias efectivas más largas que con un BPE tradicional. El checkpoint evaluado corresponde al paso 900.000 de entrenamiento, con un coste total de aproximadamente 12 días sobre una sola GPU RTX PRO 6000.

El corpus combina cuatro fuentes declaradas: `karpathy/climbmix-400b-shuffle`, `openbmb/Ultra-FineWeb-L3`, `dotlabs/rewrite` y `nvidia/OpenMathInstruct-2`. Este último aporta la componente matemática que se refleja en el benchmark ArithMark-3. El volumen total asciende a 131,69 mil millones de bytes, lo que equivale a entre 32,92 y 43,90 mil millones de tokens estándar, con una media estimada de 38 mil millones de tokens BPE. La model card menciona además la integración de un "kernel simbólico interno", sin detallar su implementación. No hay información sobre fases de RLHF, DPO u otro alineamiento posterior al preentrenamiento: el modelo se presenta explícitamente como un preentrenamiento puro.

## Capacidades

- Generación de texto en inglés a partir de preentrenamiento, sin ajuste de instrucciones documentado.
- Razonamiento simbólico y abstracto sobre texto, eje declarado del proyecto.
- Aritmética básica: obtiene un 44,80 % en ArithMark-3, por encima de los modelos comparables de su franja de tamaño (40,00 %–40,70 %).
- Comprensión de sentido común a pequeña escala: HellaSwag 38,68 %, PIQA 67,46 %.
- Razonamiento científico elemental: ARC-E 47,31 %, ARC-C 28,16 %.
- Procesamiento byte-level sin vocabulario cerrado, lo que en principio permite manejar cualquier cadena de bytes, incluidos artefactos, ruido o texto no normalizado.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en tokenización byte-level: void.1 permite estudiar cómo se comporta un transformer cuando la unidad de entrada es el byte en lugar del subword, con un checkpoint y una configuración de entrenamiento publicados de forma reproducible.
- Modelado de lenguaje en dispositivos embebidos: con 90 M de parámetros, el modelo cabe en microcontroladores de gama alta, Raspberry Pi o móviles, y puede ejecutar generación de texto sin conexión para autocompletado o etiquetado local.
- Filtrado y clasificación de texto a gran escala: al ser tan pequeño, puede desplegarse en clústeres de CPU para puntuar millones de documentos por hora, por ejemplo como pre-filtro de calidad antes de un modelo mayor.
- Educación e investigación en mecánica interna: su tamaño reducido y su entrenamiento desde cero lo hacen idóneo para análisis de representaciones, neuronas y circuitos, donde un modelo de miles de millones de parámetros resulta inviable.
- Evaluación comparativa de modelos sub-100M: sirve como referencia en el Open SLM Leaderboard y como punto de comparación para nuevos modelos pequeños que quieran medirse en HellaSwag, PIQA, ARC y ArithMark-3.
- Generación de datos sintéticos a pequeña escala: puede emplearse para producir continuaciones de texto que alimenten experimentos de destilación o de aumento de datos, siempre con revisión humana dado su nivel de error.
- Prototipado rápido en pipelines de NLP: al cargarse con `transformers` y ser compatible con endpoints y text-generation-inference, permite validar arquitecturas de servicio antes de migrar a un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, comparados con otros modelos de la misma franja de tamaño:

| Modelo | Parámetros | HellaSwag | PIQA | ARC-E | ARC-C | ArithMark-3 | Intelligence Index |
|---|---|---|---|---|---|---|---|
| void.1 | 90,15 M | 38,68 % | 67,46 % | 47,31 % | 28,16 % | 44,80 % | 23,92 |
| 100M-exp | 98,16 M | 37,78 % | 66,97 % | 49,83 % | 27,22 % | 40,00 % | 22,47 |
| Rose-1.5-Medium | 98,28 M | 38,09 % | 64,80 % | 47,22 % | 27,13 % | 40,70 % | 21,07 |
| tinctura-v1 | 96,2 M | 37,96 % | 65,61 % | 47,98 % | 25,77 % | 38,40 % | 20,81 |
| Surjo-100m | 97,7 M | 35,05 % | 63,87 % | 47,64 % | 25,85 % | 38,90 % | 18,86 |

void.1 lidera HellaSwag, PIQA, ARC-C y ArithMark-3 entre los modelos listados, y queda por detrás de 100M-exp en ARC-E (47,31 % frente a 49,83 %). El autor lo sitúa en el primer puesto de la categoría sub-100M del Open SLM Leaderboard. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks multilingües en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 90,15 M de parámetros, sin contar caché KV ni activaciones): aproximadamente 180 MB en FP16/BF16, 90 MB en INT8 y 45 MB en INT4.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; también es viable en CPU. El autor entrenó el modelo en una única RTX PRO 6000, pero eso corresponde al entrenamiento, no a la inferencia.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) e incluso en iGPU y aceleradores de borde.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference y endpoints compatibles según las etiquetas del repositorio. No hay constancia de conversiones GGUF, Ollama o vLLM publicadas por el autor.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo.
- Nota de almacenamiento: el repositorio ocupa 73,1 GB aunque los pesos del modelo suman 90,15 M de parámetros, lo que sugiere la presencia de checkpoints o estados de entrenamiento adicionales. Conviene revisar los ficheros antes de descargar el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Licencia | Contexto | Idiomas | Disponibilidad | Intelligence Index |
|---|---|---|---|---|---|---|
| void.1 (dotlabs) | 90,15 M | Apache 2.0 | No disponible | Inglés | HuggingFace, `transformers` | 23,92 |
| 100M-exp (User01110) | 98,16 M | No disponible en la información | No disponible | No disponible | HuggingFace | 22,47 |
| Rose-1.5-Medium (GODELEV) | 98,28 M | No disponible en la información | No disponible | No disponible | HuggingFace | 21,07 |
| tinctura-v1 (bench-labs) | 96,2 M | No disponible en la información | No disponible | No disponible | HuggingFace | 20,81 |
| Surjo-100m (SurjoLabs) | 97,7 M | No disponible en la información | No disponible | No disponible | HuggingFace | 18,86 |

La comparativa se limita a los datos que el propio autor incluye en la model card. No hay información pública en la documentación consultada sobre contexto, licencia o idiomas de los modelos alternativos más allá de su recuento de parámetros y sus puntuaciones.

## Limitaciones y advertencias

- Modelo de 90 M de parámetros: sus resultados absolutos son bajos (HellaSwag 38,68 %, ARC-C 28,16 %). No es apto para tareas de producción que exijan fiabilidad alta sin validación adicional.
- Riesgo de alucinación elevado: al ser un modelo preentrenado sin alineamiento documentado, no hay garantía de veracidad ni de adherencia a instrucciones.
- Idioma: solo inglés declarado. El rendimiento fuera del inglés no está evaluado y previsiblemente será pobre.
- Longitud de contexto: no documentada. Este dato es crítico para cualquier despliegue y no puede asumirse.
- Tokenización byte-level: las secuencias efectivas son más largas que con BPE, lo que encarece el cómputo por carácter y puede complicar la integración en herramientas que asumen vocabularios estándar.
- Ausencia de ajuste instructivo: al no documentarse RLHF, DPO ni SFT, el modelo no debe utilizarse como asistente conversacional sin un ajuste previo.
- Tamaño del repositorio: 73,1 GB frente a los ~180 MB de los pesos en FP16. Verificar el contenido antes de descargar para evitar consumos de disco y ancho de banda innecesarios.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar avisos de copyright y licencia. No se identifican restricciones adicionales en la información disponible.
- Fechas de publicación: el modelo figura como creado el 26 de septiembre de 2026 y actualizado el 14 de octubre de 2026, lo que conviene contrastar con el estado real del repositorio.
- Ausencia de benchmarks de código, matemáticas avanzadas y multilingüismo: no se puede inferir capacidad en estos dominios a partir de los datos publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dotlabs/void.1
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Notebook de evaluaciones e inferencia: https://huggingface.co/dotlabs/void.1/blob/main/evals.ipynb
- Configuración de entrenamiento: https://huggingface.co/dotlabs/void.1/blob/main/training_config.json
- Métricas de entrenamiento (TensorBoard): https://huggingface.co/dotlabs/void.1/tensorboard
- Dataset karpathy/climbmix-400b-shuffle: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset openbmb/Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset dotlabs/rewrite: https://huggingface.co/datasets/dotlabs/rewrite
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Modelos comparados: https://huggingface.co/User01110/100M-exp , https://huggingface.co/GODELEV/Rose-1.5-Medium , https://huggingface.co/bench-labs/tinctura-v1 , https://huggingface.co/SurjoLabs/Surjo-100m

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo. Todos los enlaces anteriores proceden de la información de HuggingFace y de la model card del autor.
