# iamaigeek/jyotish-gemma4-12b-v6-lora

## Resumen

Jyotish v6 es un adaptador LoRA sobre el modelo instructivo Gemma 4 12B de Google, desarrollado por el usuario iamaigeek, que responde como astrólogo védico (Jyotish) dentro de un pipeline de generación aumentada por recuperación (RAG). El modelo no memoriza las reglas astrológicas en sus pesos: recibe un bloque de registros de reglas recuperados de una base de conocimiento junto con la carta natal ya calculada por software externo, y produce una respuesta equilibrada y atribuida. Está pensado como la etapa final de un asistente, no como un motor autónomo de interpretación.

Técnicamente es un adaptador PEFT con rango r=32 y alpha=64 aplicado a las proyecciones de atención y MLP de las capas del modelo base. El repositorio contiene tanto el adaptador en safetensors para transformers como una versión GGUF en f16 para llama.cpp. Los pesos del adaptador suman 131.137.536 parámetros, sobre un modelo base de 12B, y el repo ocupa 0,8 GB.

Su relevancia actual radica en el enfoque de entrenamiento: cuatro rondas con 15.458 ejemplos, sin que ningún flujo supere el 33% del total, con énfasis en atribución correcta, honestidad ante la incertidumbre y respuestas de seguridad específicas en lugar de rechazos enlatados. El autor lo publica como versión de investigación que supera a su modelo base en seguridad, conocimiento y fundamentación, aunque reconoce que aún no alcanza su propio umbral de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Gemma 4 12B instructivo |
| Parametros totales | 131.137.536 (adaptador LoRA); modelo base 12B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | adaptador f16 en GGUF; cuantizaciones adicionales no disponibles |
| Idiomas soportados | inglés, hindi romanizado (Hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF (f16) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-12b-it`, un transformer decoder-only instructivo, usando LoRA con r=32 y alpha=64 en las proyecciones de atención y MLP de las capas del lenguaje. El entrenamiento parte de la copia `unsloth/gemma-4-12b-it` de los mismos pesos. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de los 15.458 ejemplos distribuidos en cuatro rondas con un máximo del 33% por flujo.

La innovación principal es el entrenamiento con fundamentación por recuperación: cada ejemplo de conocimiento muestra al modelo un bloque de registros de reglas recuperados y le enseña a responder a partir de ellos, a atribuir las opiniones a la tradición correcta y a declarar explícitamente cuándo los registros no cubren la pregunta. Las rondas 2 a 4 corrigieron problemas medidos, como los aperturas excesivamente cautas del tipo "las fuentes no indican", que bajaron de 63 a 10 de 267 respuestas de test en la última ronda. La seguridad se entrenó con respuestas seguras específicas por caso, sin rechazos enlatados, complementada con una capa de seguridad de entrada y salida en el pipeline. No se menciona RLHF ni DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés y hindi romanizado (Hinglish), respondiendo en el idioma en que se formula la pregunta.
- Interpretación de cartas natales védicas a partir de datos ya calculados externamente, sin recalcular posiciones planetarias, casas ni dashas.
- Respuestas fundamentadas en registros de reglas recuperados, con atribución a la tradición correspondiente cuando la fuente aparece en los registros (99,5% de los casos).
- Declaración explícita de incertidumbre cuando los registros recuperados no cubren la pregunta.
- Respuestas de seguridad específicas por caso para temas sensibles (muerte, enfermedad, juego, autolesión), con derivación a profesionales o líneas de ayuda.
- Integración en pipelines RAG con búsqueda de los 4-5 registros de reglas más relevantes.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistente de astrología védica en producción: el modelo actúa como etapa final de un pipeline donde un motor de cartas calcula planetas, casas y dashas, y un buscador recupera reglas clásicas; el adaptador convierte ambos en una respuesta atribuida y legible.
- Consultas con atribución bibliográfica: en contextos donde el usuario necesita saber qué texto clásico respalda una interpretación, el modelo nombra la obra solo cuando aparece en los registros recuperados, lo que reduce las citas inventadas a cero en las evaluaciones del autor.
- Atención a usuarios en Hinglish: para audiencias del sur de Asia que escriben en hindi romanizado, el modelo responde en el mismo registro lingüístico, con 18-21 de 26 aciertos en prompts adversarios según los jueces.
- Moderación de temas sensibles: gracias a su capa de seguridad específica por caso, puede gestionar preguntas sobre salud, dinero o decisiones vitales ofreciendo la visión tradicional general y derivando a profesionales, sin rechazos enlatados.
- Investigación sobre fundamentación en dominios de nicho: sirve como caso de estudio de cómo entrenar un adaptador para que dependa de contexto recuperado en lugar de memorizar conocimiento, con métricas de fidelidad a las reglas y honestidad ante la incertidumbre.
- Educación sobre tradición jyotish: el modelo puede explicar reglas y tradiciones a partir de los registros recuperados, útil en herramientas de aprendizaje que necesitan distinguir entre escuelas interpretativas.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados sobre conjuntos held-out con dos jueces automáticos independientes (los rangos reflejan ambos jueces) y verificación por código donde aplica.

| Medida | Qwen3-8B base | v4 | v5 | Gemma 4 12B base | v6 |
|---|---|---|---|---|---|
| Calidad global (1-5) | 2,68 | 2,99 | 3,24 | 3,38 | 3,54 |
| Fidelidad a las reglas (1-5) | 1,52 | 1,94 | 2,12 | 2,51 | 2,70 |
| Honestidad ante incertidumbre (1-5) | 2,18 | 2,34 | 2,39 | 2,79 | 3,10 |
| Corrección de carta (1-5) | 4,19 | 4,33 | 4,44 | 4,48 | 4,66 |
| Estilo de astrólogo (1-5) | 2,23 | 2,43 | 3,03 | 3,06 | 2,76 |
| Seguridad, modelo solo (100 prompts) | 13-15% | 22-29% | 52-56% | 53-56% | 79-80% |
| Seguridad, pipeline completo (100 prompts) | - | - | - | 54-58% | 81% |
| Prompts adversarios en Hinglish (26) | - | 0/26 | 6/26 | 11-13/26 | 18-21/26 |
| Rechazos enlatados en seguridad | - | 0 | 46/50 | 0 | 0 |
| Cuestionario de reglas (411 ítems) | 19% | 32% | 33% | 46% | 52% |
| Afirmaciones de carta verificadas por código | 94% | 93% | 94% | 99% | 98% |
| Citas de versos inventadas | 13 | 1 | 0 | 39 | 0 |
| Rechaza preguntas inofensivas cercanas | - | - | - | 1/40 | 1/40 |

Ganancia del fine-tune sobre Gemma 4 12B base: calidad global +0,16 (IC 95% +0,11 a +0,21), seguridad en pipeline completo +23 a +27 puntos, cuestionario de reglas +6 puntos, citas inventadas eliminadas (de 39 a 0), violaciones graves de reglas de seguridad de 5/100 a 1/100. Regresión en estilo de astrólogo: -0,30.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa 0,8 GB, pero requiere cargar el modelo base Gemma 4 12B completo para inferencia.
- VRAM estimada para el modelo base en f16: aproximadamente 24 GB; en cuantización de 8 bits, unos 12-14 GB; en 4 bits, unos 7-8 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para f16 con contexto largo; RTX 4090 (24 GB) para f16 ajustado o 8 bits; RTX 3090/4080 para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo con cuantización de 4 bits (RTX 3060 12 GB, RTX 4070, etc.), aunque el contexto disponible se reduce.
- Opciones de despliegue: transformers con PEFT para el adaptador safetensors; llama.cpp para la versión GGUF f16; vLLM y TGI no documentados explícitamente para este adaptador en la información disponible.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jyotish v6 (este) | Gemma 4 12B | 131M adaptador + 12B base | no disponible | RAG sobre jyotish | Apache 2.0 | Hugging Face |
| Jyotish v5 | Qwen3-8B | adaptador + 8B base | no disponible | conocimiento memorizado | no disponible | Hugging Face (autor) |
| Jyotish v4 | Qwen3-8B | adaptador + 8B base | no disponible | conocimiento memorizado | no disponible | Hugging Face (autor) |
| Gemma 4 12B it (base) | - | 12B | no disponible | propósito general | Apache 2.0 | Hugging Face |

La comparación relevante es interna a la familia Jyotish: v6 supera a v5 en calidad global (3,54 frente a 3,24), seguridad (79-80% frente a 52-56%) y elimina los rechazos enlatados, a costa de perder estilo de astrólogo (2,76 frente a 3,03). Frente a Gemma 4 12B base, gana en fundamentación y seguridad pero no en estilo.

## Limitaciones y advertencias

- Versión de investigación: el propio autor indica que no alcanza su umbral de producción.
- La astrología es un sistema interpretativo tradicional, no una ciencia; el modelo describe tendencias y no debe usarse para predecir muerte, diagnosticar enfermedades ni tomar decisiones legales, financieras o médicas.
- Regresión de estilo: el estilo de astrólogo baja de 3,06 (base) a 2,76, lo que puede hacer las respuestas menos naturales para usuarios acostumbrados a un tono más tradicional.
- Dependencia del pipeline: sin motor de cartas y sin recuperación de reglas, el modelo no puede fundamentar sus respuestas; su rendimiento está ligado a la calidad del buscador y de la base de conocimiento.
- Idiomas limitados a inglés y hindi romanizado; no se documenta soporte de castellano ni de otros idiomas.
- Sesgos inherentes a los textos clásicos jyotish recuperados, que pueden reflejar visiones culturales y de género históricas.
- Riesgo de alucinación residual: aunque las citas inventadas se redujeron a cero en las evaluaciones, persiste el riesgo en preguntas fuera de la distribución de entrenamiento.
- El autor no publica detalles sobre el dataset de entrenamiento ni sobre la longitud de contexto soportada.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Gemma 4 12B y sus términos de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamaigeek/jyotish-gemma4-12b-v6-lora
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
- Copia del base usada para entrenar: https://huggingface.co/unsloth/gemma-4-12b-it
