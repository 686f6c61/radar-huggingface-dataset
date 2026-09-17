# Duoia/duogpt-40m-v1

## Resumen

DuoGPT-40M (primera generación) es un modelo de lenguaje de 38.854.144 parámetros (~38,85 M) entrenado desde cero por el usuario Duoia y publicado en Hugging Face con el identificador `Duoia/duogpt-40m-v1`. Su arquitectura es de estilo Llama, con 11 capas, dimensión de modelo 512, 8 cabezas de atención, SwiGLU, RoPE, RMSNorm, sin términos de bias y con pesos atados (weight tying) entre embedding y cabeza de salida. El preentrenamiento se completó en una única GPU de consumo, una RTX 4060 Laptop de 8 GB, sobre 745 millones de tokens, con una perplejidad de validación de 4,96.

El modelo se distribuye en dos variantes dentro del repositorio: la versión base preentrenada y la versión ajustada con SFT (la recomendada por el autor para uso diario), entrenada sobre 334.000 ejemplos de resumen y escritura de cuentos a partir de palabras dadas, con perplejidad de validación de 2,99. El contexto máximo es de 512 tokens, que incluye tanto el prompt como la generación, y el vocabulario es un BPE byte-level de 8.192 entradas entrenado específicamente para este proyecto.

Su relevancia es acotada pero clara: es un ejercicio de entrenamiento reproducible de extremo a extremo (preentrenamiento y SFT) con un presupuesto de cómputo mínimo (3,37 h + 2,07 h), útil para investigación sobre modelos pequeños, para experimentar con la plantilla de prompt obligatoria del paquete y como banco de pruebas de infraestructura de inferencia. No es un modelo de propósito general: no tiene conocimiento factual y solo responde correctamente cuando la tarea se le formula de forma explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama: 11 capas, d_model 512, 8 cabezas, SwiGLU, RoPE, RMSNorm, sin bias, weight tying |
| Parámetros totales | 38.854.144 (~38,85 M); en bf16, aproximadamente 78 MB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (prompt + generación combinados) |
| Tipos de cuantización | No disponible (los pesos publicados son bf16; no se distribuyen versiones cuantizadas) |
| Idiomas soportados | Inglés, con vocabulario de nivel infantil. No se declaran otros idiomas |
| Licencia | No disponible en los metadatos de Hugging Face. La model card indica uso exclusivo para investigación y uso personal, y exige conservar el aviso y `MODEL_CARD.md` en caso de redistribución |
| Formato de pesos | No disponible (checkpoints para litgpt 0.5.13; no se publican safetensors ni GGUF) |
| Vocabulario | 8.192 tokens, BPE byte-level entrenado por el autor |
| Fecha de creación (Hugging Face) | 17/09/2026 (última actualización: 17/09/2026) |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón decoder-only de Llama a escala reducida: 11 capas transformer con normalización RMSNorm, activación SwiGLU en la MLP, embeddings rotatorios (RoPE) para la atención y ausencia de bias en las proyecciones lineales. Emplea weight tying entre la matriz de embedding y la cabeza de salida, lo que reduce el recuento de parámetros efectivo para un vocabulario de 8.192 tokens. No se documenta ningún mecanismo adicional como atención lineal, decodificación especulativa o capas híbridas SSM.

El preentrenamiento consumió 745 millones de tokens en 3,37 horas sobre una RTX 4060 Laptop de 8 GB, alcanzando una perplejidad de validación de 4,96. Los corpus declarados son TinyStoriesV2-GPT4 (bajo licencia CDLA-Sharing-1.0) y Children-Stories (aportado por el usuario y con contenido generado por GPT). El ajuste posterior (SFT) usó 334.000 ejemplos de resumen y de escritura de cuentos a partir de listas de palabras, durante 2,07 horas, bajando la perplejidad de validación a 2,99. No se menciona uso de RLHF, DPO ni preferencias humanas. Un detalle operativo relevante es que el modelo requiere una clase de plantilla de conversación propia (`src/duogpt_prompt.py`), que litgpt localiza al cargar el paquete mediante `PYTHONPATH`; sin esa plantilla, el formato de entrada no se aplica correctamente.

## Capacidades

- Generación de texto en inglés dentro del dominio de cuentos infantiles y textos muy simples.
- Resumen extractivo/abstractivo de textos cortos cuando se le pide explícitamente ("Summarize the following story in one or two sentences").
- Escritura de cuentos a partir de una lista de palabras dadas (tarea para la que fue ajustado específicamente).
- Respuesta a preguntas simples de comprensión lectora cuando se le entrega un pasaje breve y una pregunta asociada (patrón `/s <historia> | <pregunta>`).
- Ejecución de tareas arbitrarias formuladas de forma explícita mediante el patrón `/t <instrucción> | <entrada>`.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- Multilingüismo: no disponible; el autor indica que el modelo es principalmente inglés y con vocabulario de nivel infantil.

## Casos de uso

- Generación de cuentos infantiles con vocabulario controlado: el modelo fue ajustado con 334.000 ejemplos de esta tarea concreta, por lo que acepta una lista de palabras y produce un relato breve dentro de un registro léxico sencillo, útil para materiales educativos o para generar corpus sintéticos de lectura temprana.
- Resumen de textos cortos en pipelines de preprocesado: con 512 tokens de contexto puede condensar párrafos o microrrelatos, por ejemplo para generar títulos o resúmenes de una frase en un corpus de textos infantiles.
- Investigación sobre el fenómeno TinyStories: sirve para reproducir y auditar experimentalmente qué estructuras lingüísticas (coherencia, concordancia, entidades) emergen en modelos por debajo de 50 M de parámetros.
- Ablaciones y experimentos de escalado a bajo coste: al entrenarse en 3,37 horas en una GPU de portátil, permite iterar sobre hiperparámetros, tokenizadores o composición de datos sin presupuesto de clúster.
- Banco de pruebas de infraestructura de inferencia: es útil para validar integraciones de litgpt, plantillas de prompt personalizadas, carga de checkpoints y scripts de chat/CLI antes de portar el mismo flujo a modelos mayores.
- Docencia de arquitecturas transformer: con 11 capas y 38,85 M de parámetros, el modelo es inspeccionable por completo (recuento de parámetros por bloque, efecto del weight tying, comportamiento de RoPE) en una sesión práctica.
- Generación de datos sintéticos de dominio estrecho: puede producir pares instrucción-respuesta de estilo infantil para aumentar datasets de tareas de resumen o escritura creativa simple, siempre con revisión humana posterior.
- Prototipado de asistentes con plantilla fija de tareas: mediante `/t <instrucción> | <entrada>` se puede montar una demo de clasificación o transformación de texto muy acotada, sin esperar conocimiento general del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos números de evaluación aportados por el autor son perplejidades de validación:

| Métrica | Valor | Notas |
|---|---|---|
| Perplejidad de validación (preentrenamiento) | 4,96 | Tras 745 M de tokens, 3,37 h |
| Perplejidad de validación (SFT) | 2,99 | Tras 334.000 ejemplos, 2,07 h |
| Tokens de preentrenamiento | 745 M | Corpus TinyStoriesV2-GPT4 + Children-Stories |
| Ejemplos de SFT | 334.000 | Resumen y escritura de cuentos por palabras |

No se dispone de comparaciones con otros modelos medidas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos en bf16 ocupan aproximadamente 78 MB; el consumo real depende del runtime y del tamaño del lote, pero el modelo cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060/4060 en adelante, e incluso integradas recientes). El propio autor lo entrenó en una RTX 4060 Laptop de 8 GB, por lo que el entrenamiento también es viable en ese rango.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU dedicadas e integradas actuales. También es viable la inferencia en CPU.
- Opciones de despliegue: litgpt 0.5.13 con PyTorch es la vía soportada explícitamente (el paquete incluye `scripts/chat.sh`, `scripts/ask.sh` y la clase de plantilla `src/duogpt_prompt.py`). No se publican pesos en GGUF, por lo que llama.cpp y Ollama no están soportados de forma directa; vLLM o TGI tampoco se documentan. Cualquier conversión a otro runtime exigiría exportar el checkpoint y reimplementar la plantilla de prompt.
- Latencia y throughput: no disponible. No hay mediciones publicadas; dado el tamaño (38,85 M de parámetros), cualquier cifra concreta sería una estimación no verificada.
- Almacenamiento: el repositorio completo ocupa 0,1 GB.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de conocimiento público general y no de la documentación aportada, por lo que deben verificarse antes de citarlos en producción.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Duoia/duogpt-40m-v1 | 38,85 M | 512 tokens | No disponible (uso investigativo/personal según model card) | Hugging Face, checkpoints litgpt | ppl val 4,96 (base) / 2,99 (SFT); sin benchmarks estándar |
| TinyStories-33M (Microsoft Research) | ~33 M | No verificado | No verificada | Hugging Face | No comparable directamente con los datos aportados |
| SmolLM-135M (Hugging Face) | 135 M | 2.048 tokens (dato público) | Apache-2.0 (dato público) | Hugging Face, amplio soporte de runtimes | Benchmarks públicos disponibles, no comparables aquí |
| Qwen2.5-0.5B | ~0,49 B | 32.768 tokens (dato público) | Apache-2.0 (dato público) | Hugging Face, GGUF, vLLM, Ollama | Benchmarks públicos disponibles, no comparables aquí |

La comparación relevante es de escala y propósito: DuoGPT-40M es dos órdenes de magnitud menor que Qwen2.5-0.5B y carece de conocimiento factual, mientras que sus rivales directos son los modelos de la familia TinyStories, orientados igualmente a la generación de narrativa infantil simple pero con ecosistemas de distribución más maduros.

## Limitaciones y advertencias

- Solo ejecuta tareas formuladas de forma explícita: ante una pregunta directa como "What is a volcano?" no responde; es necesario plantear la instrucción completa siguiendo la plantilla del paquete.
- Ausencia total de conocimiento factual: el corpus de entrenamiento se limita a cuentos infantiles, por lo que cualquier pregunta de cultura general produce contenido inventado (alucinación sistemática, no ocasional).
- Límite duro de contexto: 512 tokens entre prompt y generación. Superarlo provoca el error `Cannot forward sequence of length T`.
- Pérdida de coherencia en salidas largas: el autor advierte de desviaciones de entidad, mezcla de personajes y repeticiones en la segunda mitad de textos extensos, un comportamiento típico en modelos de ~40 M de parámetros.
- Cobertura lingüística mínima: inglés y vocabulario de nivel infantil; no es adecuado para texto técnico, adulto o multilingüe.
- Licencia: los metadatos de Hugging Face no declaran licencia. La model card restringe el uso a investigación y uso personal y exige conservar el aviso y `MODEL_CARD.md` al redistribuir, lo que impide asumir uso comercial sin autorización expresa del autor.
- Procedencia de los datos: el corpus Children-Stories incluye contenido generado por GPT aportado por el usuario, sin documentación de su composición exacta ni de posibles sesgos heredados.
- Sin benchmarks estándar publicados: no hay evidencia de rendimiento comparable fuera del dominio de los cuentos infantiles, y la perplejidad de validación no es una métrica transferible a tareas generales.
- Madurez y soporte: 0 descargas registradas, un único autor, repositorio de 0,1 GB y ausencia de versiones cuantizadas o de pesos en formatos de amplio soporte; el mantenimiento futuro no está garantizado.
- Dependencia del ecosistema: la carga requiere litgpt 0.5.13 y la clase de plantilla incluida en el paquete; usarlo desde otros runtimes exige trabajo adicional de portabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Duoia/duogpt-40m-v1
- Model card completa dentro del repositorio: `MODEL_CARD.md` (incluye distribución de parámetros, composición de datos, hiperparámetros de entrenamiento y cifras de evaluación)
- Plantilla de prompt requerida: `src/duogpt_prompt.py` (dentro del repositorio)
- Scripts de uso: `scripts/chat.sh`, `scripts/ask.sh`, `scripts/chat.py` (dentro del repositorio)
- Corpus de preentrenamiento TinyStoriesV2-GPT4 (licencia CDLA-Sharing-1.0): referencia citada en la model card, sin enlace directo aportado
- La búsqueda web realizada no devolvió resultados relacionados con el modelo: los enlaces recuperados corresponden a la Universidad de Harvard y no guardan relación con DuoGPT-40M. No se han encontrado paper, blog, repositorio auxiliar ni demo asociados al modelo en la información disponible.
