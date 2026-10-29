# Lerelou/Supra2-Nano-GGUF

## Resumen

Supra2-Nano-GGUF es el repositorio de conversiones a formato GGUF del modelo base SupraLabs/Supra2-Nano, un transformer de 799.776 parámetros entrenado desde cero con la arquitectura Qwen3 a escala fuertemente reducida. La conversión la mantiene el usuario Lerelou y no introduce pesos nuevos: reproduce los pesos oficiales en F32 y una versión cuantizada Q8_0 para su uso con llama.cpp y herramientas compatibles. El modelo original lo desarrolla SupraLabs como parte de la familia Supra2, una línea de modelos de lenguaje minúsculos entrenados en hardware de consumo (2x NVIDIA T4 de Kaggle) para estudiar el comportamiento de escala en cotas de parámetros extremadamente bajas.

El interés del modelo es metodológico, no práctico: sirve como base de referencia para validar pipelines de entrenamiento (tokenizer, mezcla de datos, arquitectura) antes de escalar a variantes mayores de la misma familia, y como caso de prueba para flujos de cuantización y despliegue con llama.cpp en entornos con recursos prácticamente nulos. Se entrenó con 1.000 millones de tokens (99 % FineWeb-Edu, 1 % Cosmopedia-v2) durante 7.000 pasos en precisión bfloat16, con un tokenizador de solo 4.096 entradas para evitar que las capas de embedding y de proyección de salida dominen el presupuesto de parámetros.

Los propios autores advierten de que, con 800K parámetros, el modelo queda muy por debajo del umbral en el que un transformer produce texto fluido, y que las salidas serán con frecuencia repetitivas, agramaticales o incoherentes. No hay ajuste por instrucciones ni alineación: es un modelo base. La licencia Apache 2.0 permite uso comercial y modificación, pero su uso previsto es la investigación en escalado de modelos pequeños, no la producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (GQA, RMSNorm), escala reducida |
| Parametros totales | 799.776 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | F32 y Q8_0 en este repositorio (no se documentan otras variantes) |
| Idiomas soportados | Ingles (entrenamiento predominantemente en ingles; vocabulario de 4.096 tokens) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F32: 3.331.360 bytes / 3,18 MiB; Q8_0); pesos originales en safetensors en el repositorio base |

## Arquitectura y entrenamiento

El modelo replica el diseño Qwen3 con dimensión oculta reducida, pocas cabezas de atención y un número pequeño de capas transformer, todo ajustado a un presupuesto de 800K parámetros. Mantiene las decisiones estructurales del diseño original: grouped-query attention y RMSNorm. La innovación principal a esta escala es el tokenizador: se limita el vocabulario a 4.096 entradas para que las capas de embedding y de proyección de salida no absorban la mayor parte del recuento de parámetros, un fallo habitual al aplicar tokenizadores de tamaño completo a modelos minúsculos.

El entrenamiento consistió en una única época sobre 1.000 millones de tokens (sin repetición), con una mezcla del 99 % FineWeb-Edu y un 1 % de Cosmopedia-v2 para incorporar texto sintético de estilo instruccional. Fueron 7.000 pasos con objetivo estándar de predicción del siguiente token (causal LM), en bfloat16 y sobre 2x NVIDIA T4 (Kaggle). No se aplicó RLHF, DPO ni ningún tipo de ajuste por instrucciones, y la model card no documenta un conjunto de validación retenido más allá de la evaluación en benchmarks. La conversión a GGUF del repositorio que nos ocupa reproduce fielmente estos pesos; el archivo Q8_0 aplica cuantización de 8 bits por bloque.

## Capacidades

- Generación de texto autorregresiva básica mediante predicción del siguiente token; sin garantía de coherencia más allá de secuencias cortas.
- Modelo base sin ajuste por instrucciones: no responde a formato de chat ni a directivas.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente, planificación multi-paso ni razonamiento estructurado.
- Sin modo de razonamiento (thinking mode), visión, audio ni otras modalidades.
- Multilingüismo muy limitado: el vocabulario de 4.096 tokens fragmenta agresivamente textos en idiomas distintos del inglés.
- Capacidad práctica real: servir como referencia de escala, validar pipelines de tokenización, entrenamiento, conversión a GGUF y cuantización, y verificar el correcto funcionamiento de stacks de inferencia.

## Casos de uso

- Validación de pipelines de entrenamiento: ejecutar el ciclo completo (tokenizer, carga de datos, forward/backward, checkpointing) con este modelo antes de lanzar runs mayores de la familia Supra2, reduciendo el coste de depurar errores en configuraciones grandes.
- Pruebas de humo en CI/CD para llama.cpp: cargar el GGUF F32 Q8_0 en tests automáticos para verificar que una nueva versión del runtime compila, carga pesos y genera tokens sin romper compatibilidades de formato.
- Verificación de herramientas de cuantización: usar los pesos F32 como referencia y comparar la perplejidad o la divergencia de salida del archivo Q8_0 para validar implementaciones propias de cuantización o de conversión de formatos.
- Estudio de leyes de escalado y ablaciones de arquitectura: reproducir la curva de pérdida frente a parámetros y tokens en el régimen sub-1M, con un coste de cómputo despreciable frente a modelos de miles de millones.
- Docencia y divulgación: ilustrar en un taller el funcionamiento interno de un transformer generativo (atención, embeddings, decodificación) con un modelo que se ejecuta en CPU en milisegundos y ocupa menos de 4 MiB en disco.
- Pruebas de infraestructura de serving: validar extremo a extremo el despliegue de endpoints compatibles (por ejemplo, servidores con API de estilo OpenAI) sin consumir GPU, incluyendo límites de concurrencia y gestión de peticiones.
- Despliegue en dispositivos embebidos y microcontroladores: comprobar la viabilidad de cargar y ejecutar un modelo de lenguaje en entornos con kilobytes de memoria disponible, como paso previo a integrar variantes algo mayores.
- Baseline negativo en evaluación: emplear sus puntuaciones cercanas al azar como referencia inferior al comparar modelos pequeños reales.

## Benchmarks y rendimiento

Evaluación zero-shot publicada por los autores del modelo base, comparada con otros dos modelos de menos de 1M de parámetros del mismo laboratorio:

| Benchmark | Supra2-Nano (0,8M) | Supra-Mini-v6 (1M) | Supra-Mini-v3 (0,5M) |
|---|---|---|---|
| PIQA (acc_norm) | 0,53 | 0,54 | 0,50 |
| HellaSwag (acc_norm) | 0,27 | 0,27 | 0,25 |
| ARC-Easy (acc_norm) | 0,31 | 0,30 | 0,28 |
| ARC-Challenge (acc_norm) | 0,21 | 0,20 | 0,23 |

Los autores señalan que las puntuaciones de los tres modelos se sitúan cerca de las baselines aleatorias o de clase mayoritaria, algo esperable a esta escala. PIQA es la señal más fuerte, coherente con ser la tarea con menor profundidad de razonamiento de las cuatro. Supra2-Nano rinde de forma comparable a Supra-Mini-v6 con un 20 % menos de parámetros y supera a Supra-Mini-v3 en tres de las cuatro tareas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de perplejidad en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula. El archivo F32 ocupa 3,18 MiB y el Q8_0 aproximadamente 0,8 MB de pesos, por lo que cabe en cualquier GPU, iGPU o CPU.
- GPU recomendadas: no requiere GPU. Cualquier A100, H100, RTX 4090 o incluso una T4 es sobredimensionada; el modelo se ejecuta de forma trivial en CPU.
- Compatibilidad con GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en placas tipo Raspberry Pi o entornos con pocos cientos de MB de RAM.
- Opciones de despliegue: llama.cpp y todas sus interfaces (CLI, servidor compatible con API de OpenAI, bindings de Python), Ollama si se importa el GGUF, y transformers con los pesos safetensors del repositorio base (la model card incluye un script con LlamaTokenizerFast y AutoModelForCausalLM).
- Latencia y throughput: no disponibles de forma publicada. Por el tamaño de los pesos, la generación está dominada por el coste de muestreo y de tokenización más que por el cómputo matricial.
- Nota de compatibilidad: la model card del modelo base incluye un parche para tokenizer_config.json (convertir extra_special_tokens de lista a diccionario) necesario para cargar el tokenizador con LlamaTokenizerFast.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens de entrenamiento | Contexto | PIQA | HellaSwag | ARC-Easy | ARC-Challenge | Licencia |
|---|---|---|---|---|---|---|---|---|
| Supra2-Nano (este, via GGUF) | 799.776 | 1B | No disponible | 0,53 | 0,27 | 0,31 | 0,21 | Apache 2.0 |
| Supra-Mini-v6 | 1M | No disponible | No disponible | 0,54 | 0,27 | 0,30 | 0,20 | No disponible |
| Supra-Mini-v3 | 0,5M | No disponible | No disponible | 0,50 | 0,25 | 0,28 | 0,23 | No disponible |

Los tres pertenecen al mismo laboratorio y comparten el régimen sub-1M, por lo que la comparación es internamente consistente pero no cubre alternativas externas. No se dispone de datos verificados de otros modelos de menos de un millón de parámetros en la información proporcionada.

## Limitaciones y advertencias

- Escala insuficiente para generación fiable: con 799.776 parámetros, las salidas serán con frecuencia repetitivas, agramaticales o incoherentes. Los autores lo declaran explícitamente no apto para producción.
- Sin ajuste por instrucciones ni alineación: es un modelo base; no sigue instrucciones ni mantiene formato conversacional, aunque el repositorio incluya la etiqueta "conversational".
- Riesgo elevado de alucinación y de texto sin sentido; no debe usarse para generar información factual.
- Vocabulario de 4.096 tokens: aumenta la fragmentación fuera de vocabulario en palabras raras y en cualquier texto que no sea inglés.
- Idiomas: solo inglés como idioma declarado; el rendimiento en castellano no está evaluado y previsiblemente será muy deficiente.
- Entrenamiento de una sola época sobre 1B tokens sin conjunto de validación retenido más allá de los benchmarks citados.
- Licencia Apache 2.0: permite uso comercial y modificaciones con obligaciones de atribución y conservación del aviso de licencia; la licencia no implica idoneidad técnica.
- Este repositorio es una conversión de terceros (Lerelou), no la publicación oficial de SupraLabs; para uso en investigación conviene contrastar con los pesos originales en safetensors.
- Solo se documentan conversiones F32 y Q8_0; no hay confirmación de otras cuantizaciones (Q4_K_M, Q5_K_M, etc.) en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Lerelou/Supra2-Nano-GGUF
- Modelo base: https://huggingface.co/SupraLabs/Supra2-Nano
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia-v2 (subset): https://huggingface.co/datasets/semran1/cosmopedia-v2-subset
- La busqueda web realizada no devolvio resultados relevantes (papers, blogs o repos) sobre este modelo; no se dispone de otros enlaces verificados.
