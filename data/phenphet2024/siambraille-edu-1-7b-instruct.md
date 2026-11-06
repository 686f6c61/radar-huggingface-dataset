# Phenphet2024/SiamBraille-Edu-1.7B-Instruct

## Resumen

SiamBraille-Edu-1.7B-Instruct es un modelo de lenguaje especializado en educación para personas con discapacidad visual y estudiantes ciegos, desarrollado por Phenphet Kraithong bajo el proyecto SiamBraille 1.0. Se construye como un ajuste fino (fine-tuning) instructivo del modelo base LiquidAI/LFM3-1.7B, una arquitectura de tipo LFM3 (Liquid Foundation Model) de 1.728 millones de parámetros. El modelo aborda un nicho muy concreto: la docencia del braille tailandés según el estándar oficial de 2021 (พ.ศ. 2564), el braille inglés UEB y el código matemático Nemeth, además de la didáctica de la lengua tailandesa y el diseño de materiales táctiles.

La relevancia del modelo radica en su enfoque pedagógico: no es un asistente generalista, sino una herramienta orientada a la generación de ejercicios, exámenes y descripciones de gráficos táctiles adaptados a estudiantes ciegos, eliminando consignas que dependan de la vista. Su licencia Apache 2.0 y la disponibilidad de pesos en safetensors y GGUF facilitan su integración en entornos educativos y de investigación.

Con 80 descargas y sin likes en el momento de la consulta, se trata de un proyecto de nicho con una model card mayoritariamente en tailandés. La información técnica pública es limitada: no se detallan datos de entrenamiento, benchmarks ni procesos de alineación, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Model), transformer; detalles internos no disponibles |
| Parámetros totales | 1.728.801.536 (≈1.7B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (disponible en el repo); otras cuantizaciones no disponibles |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en LiquidAI/LFM3-1.7B, un modelo de la familia LFM3 de Liquid AI. La model card no proporciona detalles sobre la arquitectura interna (número de capas, atención, posible uso de capas líquidas o híbridas), por lo que la descripción arquitectónica más allá de la designación «lfm3» debe considerarse no disponible. El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga del modelo requiere confiar en implementaciones del autor.

Respecto al entrenamiento, la información pública solo indica que se trata de un modelo instructivo ajustado sobre el base, con especialización en braille tailandés, UEB, Nemeth, gramática tailandesa y currículo educativo. La model card menciona que incorpora conocimiento de los 9 manuales de braille (157 capítulos) al 100 %, pero no especifica el volumen de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en tailandés e inglés.
- Conocimiento del estándar de braille tailandés de 2021 (พ.ศ. 2564), braille inglés UEB y código matemático Nemeth.
- Referencia a los 9 manuales de braille (157 capítulos) integrados en el modelo según el autor.
- Corrección y explicación de gramática tailandesa: ไตรยางศ์ (clasificación tonal de consonantes), คำเป็น-คำตาย (palabras vivas/muertas), las 8 terminaciones (ตัวสะกด 8 แม่), sánscritos (สมาส-สนธิ), las 7 clases de palabras y léxico real (คำราชาศัพท์).
- Diseño de exámenes y ejercicios alineados con el currículo central tailandés (2551/2566), eliminando enunciados que dependan de la vista.
- Redacción de descripciones para gráficos táctiles (tactile graphics), incluyendo indicaciones de dirección de exploración para la producción de planchas en relieve.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de exámenes accesibles: el modelo puede redactar pruebas de lengua tailandesa y matemáticas sustituyendo enunciados basados en imágenes por descripciones verbales o referencias táctiles, gracias a su entrenamiento en el currículo central tailandés.
- Producción de material braille: a partir de una palabra o frase en tailandés, el modelo puede explicar su transcripción al braille tailandés estándar de 2021, incluyendo contracciones y signos, lo que agiliza la preparación de láminas por parte de transcriptores.
- Enseñanza del código Nemeth: permite generar ejercicios matemáticos con su correspondiente representación en Nemeth, útil en aulas de educación especial para estudiantes ciegos que aprenden matemáticas.
- Descripción de gráficos táctiles: el modelo redacta instrucciones de exploración (por dónde empezar, qué dirección seguir, qué elementos se encuentran) para que un diseñador pueda producir una plancha en relieve comprensible al tacto.
- Formación de docentes: sirve como asistente para resolver dudas sobre gramática tailandesa (tonos, sílabas muertas, sánscritos) y sobre la normativa braille, reduciendo la dependencia de manuales dispersos.
- Adaptación de materiales curriculares: dado un texto estándar, el modelo puede proponer una versión sin referencias visuales y con vocabulario explicado, adecuada para su transcripción a braille o lectura en voz alta.
- Apoyo en traducción braille-inglés: con cobertura de UEB, puede ayudar a preparar materiales bilingües tailandés-inglés para estudiantes con discapacidad visual en contextos internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3.5 GB solo para pesos, más overhead de contexto y KV cache; en la práctica, unos 5-6 GB.
- VRAM estimada en cuantización GGUF de 8 bits: alrededor de 2 GB; en 4 bits, en torno a 1.2-1.5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) puede ejecutar el modelo en FP16 con contexto moderado; para cuantizaciones GGUF basta con 4-6 GB (GTX 1650, RTX 3050).
- GPU de datacenter: A100, H100 o L40S no son necesarias para un modelo de 1.7B, pero permitirían mayor throughput y contextos más largos.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para safetensors si se confirma compatibilidad con la arquitectura LFM3; el tag `endpoints_compatible` sugiere compatibilidad con la Inference API de Hugging Face.
- Latencia y throughput: no disponibles; para un modelo de 1.7B en una RTX 4090 se puede esperar un throughput del orden de decenas a cientos de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| SiamBraille-Edu-1.7B-Instruct | 1.7B | no disponible | th, en | Apache 2.0 | Braille tailandés, UEB, Nemeth, pedagogía |
| LiquidAI/LFM3-1.7B (base) | 1.7B | no disponible | multilingüe | no disponible | Modelo generalista |
| Modelos de 1-2B generalistas (p. ej. Qwen2.5-1.5B, Llama-3.2-1B) | 1-1.5B | 32K-128K según modelo | multilingüe | Apache 2.0 / Llama | Uso general, sin especialización braille |

La comparación directa con modelos generalistas no es del todo equivalente: SiamBraille-Edu prioriza el conocimiento normativo del braille tailandés sobre la amplitud de capacidades. No se dispone de benchmarks que permitan comparar su rendimiento en tareas de braille frente a otros modelos.

## Limitaciones y advertencias

- El modelo está entrenado principalmente para tailandés e inglés; su rendimiento en castellano no está documentado y probablemente sea limitado.
- No se han publicado evaluaciones independientes; las afirmaciones de la model card (cobertura del 100 % de los manuales, precisión gramatical) no están verificadas externamente.
- Riesgo de alucinación en la transcripción braille: un error en un signo o contracción puede tener consecuencias graves en material educativo; se recomienda validación humana por transcriptores certificados.
- El repositorio incluye `custom_code`, lo que implica riesgo de seguridad y de compatibilidad con frameworks estándar; conviene auditar el código antes de desplegarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base LiquidAI/LFM3-1.7B puede tener sus propias condiciones; conviene revisar la licencia del modelo base.
- El tamaño de contexto no está documentado, lo que dificulta planificar tareas con documentos largos.
- Proyecto de nicho con muy poca adopción (80 descargas, 0 likes): soporte comunitario limitado y posible falta de mantenimiento.
- No hay información sobre sesgos específicos; al estar entrenado con manuales educativos tailandeses, puede reflejar sesgos curriculares o terminológicos de esas fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phenphet2024/SiamBraille-Edu-1.7B-Instruct
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Paper o blog de LFM3: no disponible en la información proporcionada
- Repositorio del proyecto SiamBraille: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
