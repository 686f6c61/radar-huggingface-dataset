# persuasivepost/eduhinglish-gemma-3-4b-it-lora-v4

## Resumen

EduHinglish es un adaptador LoRA sobre el modelo base google/gemma-3-4b-it, desarrollado por el usuario persuasivepost. Su propósito es responder preguntas del currículo NCERT de las clases 9 y 10 (Biología, Química, Física, Matemáticas y Ciencias Sociales) en hinglish escrito en alfabeto latino, es decir, hindi romanizado mezclado con inglés, y fundamentando la respuesta en un pasaje de libro de texto proporcionado como contexto.

El adaptador se entrenó con QLoRA (cuantización 4-bit NF4, rango 16, alpha 32) sobre 3436 pares pregunta-respuesta curados, con la función de pérdida calculada únicamente sobre los tokens de respuesta, y se seleccionó el mejor checkpoint según la pérdida de evaluación sobre un conjunto reservado de 168 pares. El modelo base Gemma 3 4B aporta la capacidad multilingüe y de razonamiento; el adaptador añade el registro code-mixed y el anclaje al contexto educativo.

Es relevante para desarrolladores que construyan asistentes educativos para estudiantes indios que se comunican en hinglish, un registro muy extendido en entornos escolares urbanos. El repositorio ocupa 0,2 GB y se distribuye bajo los términos de uso de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA sobre proyecciones; entrenamiento QLoRA 4-bit NF4, r=16, alpha=32 |
| Parametros totales | 4B en el modelo base; el adaptador LoRA añade un conjunto reducido de pesos (repo de 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3 4B) |
| Tipos de cuantizacion | Base entrenado en 4-bit NF4; el adaptador puede combinarse con el base en bf16/fp16 o cuantizarse posteriormente (no se detallan opciones adicionales) |
| Idiomas soportados | en, hi (salida en hinglish romanizado) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 3 4B, un transformer decoder-only de Google. El entrenamiento emplea QLoRA con cuantización 4-bit NF4 del modelo base, rango 16 y alpha 32, y calcula la pérdida solo sobre los tokens de respuesta, lo que evita que el modelo aprenda a reproducir el pasaje de contexto. El conjunto de entrenamiento consta de 3436 pares de pregunta-respuesta curados a partir de material NCERT de clases 9 y 10, con el pasaje de libro de texto como contexto de anclaje.

La evaluación se realizó sobre 168 pares reservados, con métricas de solapamiento léxico y semántico (ROUGE-L, chrF++, BERTScore con mBERT) y una métrica de code-mixing (CMI) que compara la proporción de mezcla hindi-inglés generada frente a la de referencia. El formato de prompt es de un solo turno de usuario e incluye el contexto, la pregunta, una línea opcional de tipo de intención y una instrucción explícita de responder en hinglish usando solo el contexto dado.

## Capacidades

- Generación de texto conversacional en hinglish romanizado para preguntas educativas.
- Respuesta anclada a un pasaje de contexto (grounding), con instrucción explícita de no salirse del contexto.
- Cobertura de cinco materias: Biología, Química, Física, Matemáticas y Ciencias Sociales de niveles 9-10.
- Manejo de distintos tipos de intención: preguntas de opción múltiple (MCQ), respuesta corta (A-R) y verdadero/falso (T-F), según las métricas de "key accuracy".
- Code-mixing hindi-inglés controlado, medido con la métrica CMI.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades de visión o audio: no disponibles en el adaptador (dependen del modelo base, no evaluadas aquí).
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente de dudas para estudiantes de secundaria: el modelo recibe el pasaje del libro de texto y la pregunta del alumno y devuelve una explicación en hinglish; el anclaje al contexto reduce respuestas fuera del temario.
- Generación de material de repaso: a partir de un fragmento NCERT, producir preguntas y respuestas cortas en hinglish para fichas de estudio, aprovechando el formato de intención A-R.
- Bancos de preguntas de opción múltiple: usar el adaptador para redactar distractores y respuestas en hinglish coherentes con el pasaje, con revisión humana posterior.
- Tutor conversacional integrado en una app educativa: el adaptador se sirve junto al base Gemma 3 4B y se invoca con el pasaje recuperado por un sistema RAG sobre los libros NCERT.
- Traducción pedagógica de conceptos: reformular una explicación en inglés del libro de texto a hinglish para alumnos que aprenden en ese registro.
- Evaluación automática asistida: comparar la respuesta del estudiante con la generada por el adaptador como referencia en hinglish, usando ROUGE-L o BERTScore como señal auxiliar.
- Prototipado rápido de asistentes regionales: al ser un adaptador de 0,2 GB, permite experimentar con el registro code-mixed sin reentrenar el modelo base completo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto reservado de 168 pares:

| Metrica | Valor |
|---|---|
| Eval loss / perplexity | 0,9034 / 2,47 |
| ROUGE-L | 48,86 |
| chrF++ | 52,12 |
| BERTScore F1 (mBERT) | 80,49 |
| Key accuracy (MCQ / A-R / T-F) | 58,3 |
| CMI generado / referencia (gap) | 39,2 / 38,8 (5,0) |

Desglose por materia:

| Materia | n | ROUGE-L | chrF++ | BERTScore | CMI gen / ref |
|---|---|---|---|---|---|
| Biology | 36 | 53,77 | 57,14 | 82,37 | 43,2 / 43,3 |
| Chemistry | 17 | 48,90 | 51,39 | 81,27 | 38,6 / 38,5 |
| Mathematics | 28 | 44,67 | 44,72 | 78,99 | 29,0 / 28,1 |
| Physics | 12 | 34,99 | 42,04 | 76,12 | 42,1 / 39,6 |
| Social Science | 75 | 50,03 | 54,18 | 80,67 | 40,8 / 40,6 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B en bf16 requiere aproximadamente 8-9 GB; en cuantización 4-bit, en torno a 3-4 GB, más el adaptador LoRA (0,2 GB).
- GPU recomendadas: A100 o H100 para servicio de alta concurrencia; L4, A10G o RTX 4090 para despliegue de una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con holgura; en GPUs de 8-12 GB con cuantización 4-bit.
- Opciones de despliegue: transformers + peft (según la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama si se fusiona el adaptador en el base y se convierte a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EduHinglish Gemma-3-4B-it LoRA v4 | 4B (base) + adaptador | no disponible | Hinglish educativo NCERT 9-10 | gemma | Hugging Face (adaptador PEFT) |
| google/gemma-3-4b-it | 4B | no disponible | Modelo base generalista multilingüe | gemma | Hugging Face |
| Alternativas de adaptadores educativos en hinglish | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros adaptadores o modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de evaluación es pequeño (168 pares) y desequilibrado por materia (12 en Física frente a 75 en Ciencias Sociales), lo que limita la fiabilidad de las métricas por materia.
- La "key accuracy" del 58,3 en preguntas MCQ, A-R y T-F indica un margen de error considerable para uso evaluativo automático sin revisión humana.
- El modelo está entrenado para responder solo con el contexto proporcionado; si el pasaje recuperado es irrelevante o incompleto, la respuesta será deficiente o incompleta.
- Registro limitado al hinglish romanizado; no se ha evaluado la salida en devanagari ni en otros idiomas distintos de en/hi.
- Riesgo de alucinación en conceptos científicos si el contexto no cubre la pregunta, pese al anclaje.
- Sesgos: no documentados por el autor; al derivar de Gemma 3 y de material NCERT, puede heredar sesgos del corpus base y del currículo.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; revisar antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- No se documentan opciones de cuantización posteriores ni fusión del adaptador; el soporte en vLLM/TGI/llama.cpp debe verificarse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/persuasivepost/eduhinglish-gemma-3-4b-it-lora-v4
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Gemma Terms of Use: no disponible en la información proporcionada
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
