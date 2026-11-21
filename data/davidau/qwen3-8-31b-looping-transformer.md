# DavidAU/Qwen3.8-31B-Looping-Transformer

## Resumen

Qwen3.8-31B-Looping-Transformer es un ajuste fino experimental publicado por DavidAU sobre el modelo base Qwen/Qwen3.8-27B. El autor describe la intervención como una "expansión" del modelo en ubicaciones concretas de la red para crear secciones que "re-piensen" y generen planes más detallados, seguida de un entrenamiento muy ligero para corregir los defectos introducidos por el proceso manual. El resultado es un modelo de 30.825.577.520 parámetros (unos 31B, de ahí el nombre) frente a los 27B del base, empaquetado en safetensors y bfloat16 con un repositorio de 61,7 GB.

La ficha del autor lo etiqueta como "looping-transformer", "abliterated", "heretic", "uncensored" y "ARA", y lo presenta como un prototipo funcional pero experimental: el propio autor advierte de que hay que probarlo con cuidado para cada caso de uso y de que el modelo tiene "un punto de vista diferente" sobre las cosas. La pipeline declarada es image-text-to-text, aunque la model card no documenta ninguna capacidad de visión real; el uso descrito es exclusivamente conversacional y de generación de texto.

Su relevancia es acotada: no es un modelo de referencia ni compite en benchmarks públicos, sino una variante de nicho orientada a generación creativa sin filtros, roleplay y razonamiento extendido, con un sistema propietario de "constructos" (prompts de sistema preconfigurados) que el autor denomina Turbo Brilliance 50X. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.8-27B con expansión manual de capas/secciones ("looping transformer"); detalles exactos no disponibles |
| Parametros totales | 30.825.577.520 (unos 31B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256k máximo según el autor; mínimo recomendado 32k, sugerido 64k-128k |
| Tipos de cuantizacion | bfloat16 en el repo principal; el autor menciona GGUF Q4_K_S y cuantizaciones publicadas en el árbol del repositorio, sin listado completo disponible |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF en repos derivados |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso, y según las notas de desarrollo del autor se le aplicó una expansión estructural en puntos concretos de la red para insertar secciones adicionales de "ponderación" que permiten al modelo repensar y producir planes y salidas más detalladas. Ese proceso manual introduce defectos, que el autor corrige con un "entrenamiento muy ligero" de una sola etapa (Stage 1), descrito como multi-stage tuning con técnicas etiquetadas como "Cold Fusion" y "GAIN Training", sin que la model card detalle hiperparámetros, número de tokens de entrenamiento ni composición del dataset.

Existen dos ramas: una base sin entrenar y una rama "ablit/heretic/uncensored" entrenada, que es la que el autor está desarrollando de forma prioritaria. La técnica de abliteration elimina direcciones de activación asociadas al rechazo, y el etiquetado "heretic" y "ARA" apunta al mismo objetivo de reducir los filtros de seguridad del modelo base. No se documenta el uso de RLHF o DPO, ni innovaciones como decodificación especulativa o atención lineal. El autor reporta que la expansión produce efectos positivos en pruebas internas: respuestas más profundas, mayor utilidad en contexto y razonamiento más verboso, aunque también repeticiones de palabras y fallos menores en la versión sin entrenar.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 256k tokens).
- Razonamiento extendido con modos de "thinking": el autor declara 27 modos de razonamiento, 27 modos instruct y 9 modos de razonamiento "xhigh".
- Generación de código y tareas de agente, a través del constructo "Coder AI Construct" y del "Agent AI Construct".
- Escritura creativa en todos los géneros: ficción, relato, roleplay y escritura creativa en general.
- Sistema de "AI Constructs" (15 declarados, 5 de ellos "Super AI Constructs"): prompts de sistema preconfigurados que se activan escribiendo `help` en el chat; incluyen Brainstorm, Brainstorm Business, Universal Teacher, Agent y Coder.
- Capacidades multilingües en 16 idiomas declarados (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita).
- Salidas sin filtros de rechazo en la rama abliterated/uncensored.
- Soporte de tool calling y function calling: no documentado explícitamente en la información disponible, aunque el autor recomienda temperatura 0,6-0,7 para herramientas y agentes.
- Capacidad de visión: no disponible pese a la pipeline image-text-to-text declarada.

## Casos de uso

- Escritura creativa y ficción larga: con 256k tokens de contexto y modos de razonamiento extendido, el modelo puede mantener arcos narrativos y consistencia de personajes en novelas o series de relatos, que es el uso principal que promociona el autor.
- Roleplay y simulación de personajes: la rama uncensored y los constructos de personalidad permiten diálogos sin las restricciones del modelo base, adecuado para prototipos de videojuegos o entrenamiento de guionistas.
- Ideación de negocio y planificación estratégica: el constructo "Brainstorm Business" genera planes de negocio con tablas y estructura, como muestra el ejemplo de plan para un food truck en Las Vegas incluido en la model card.
- Generación de código asistida: el "Coder AI Construct" y la temperatura recomendada de 0,6-0,7 para agentes permiten integrarlo en asistentes de programación, aunque sin benchmarks que respalden su calidad frente al base.
- Docencia y explicación de conceptos: el "Universal Teacher AI Construct" está pensado para generar material explicativo y desglosar temas complejos en varios idiomas.
- Agentes multi-paso: el "Agent AI Construct" y el contexto de 128k permiten encadenar tareas con historial largo, útil para automatizaciones internas donde no se requiere cumplimiento estricto.
- Experimentación en investigación sobre arquitecturas: al ser un prototipo de "looping transformer" con pesos abiertos, sirve para estudiar el efecto de expandir capas de un transformer denso sobre el razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona pruebas internas de generación y comparaciones cualitativas entre la versión sin entrenar y la entrenada, pero no aporta cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto estándar.

## Requisitos de hardware

- VRAM para bfloat16: aproximadamente 62 GB solo para pesos, más KV cache; requiere 80 GB o más para contexto largo (A100 80GB, H100 80GB, o dos GPU de 48 GB).
- Cuantización Q4_K_S en GGUF: alrededor de 17-18 GB de pesos, viable en una RTX 4090 de 24 GB con contexto moderado; con 64k-128k de contexto el KV cache puede exceder la VRAM disponible.
- Cuantizaciones Q8: unos 33 GB, necesitan 48 GB de VRAM (A6000, A100 40GB justo, L40S).
- Consumer GPU: cabe en RTX 4090, RTX 3090 y RTX 5090 solo en cuantizaciones de 4-5 bits; no cabe en GPU de 16 GB o menos.
- Despliegue: transformers para bfloat16; llama.cpp u Ollama para GGUF; vLLM y TGI no están documentados para esta arquitectura modificada y podrían no soportarla.
- Latencia y throughput: no disponibles. El autor advierte de que las cuantizaciones Q4 limitan la calidad y que el modo de razonamiento "medium" es el usado en sus ejemplos, no el "xhigh".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-31B-Looping-Transformer | 30,8B | 256k | Apache 2.0 | Prototipo experimental, sin benchmarks, rama uncensored |
| Qwen3.8-27B (base) | 27B | No disponible en la informacion | Apache 2.0 | Modelo original, con filtros de seguridad y sin expansión |
| Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x | 27B | No disponible en la informacion | Apache 2.0 | Variante del mismo autor sin expansión, con el sistema Turbo Brilliance 50X completo |
| Qwen3.8-40B-Ultimate | 40B | No disponible en la informacion | Apache 2.0 | Proyecto en desarrollo del mismo autor, mayor tamaño |

La comparación con modelos de otros autores no está disponible en la información proporcionada; no se aportan datos de rendimiento que permitan situarlo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental: el propio autor pide probarlo con cuidado y advierte de fallos menores, repeticiones y glitches en algunas salidas complejas, incluso en la versión entrenada.
- Sin benchmarks: no hay evidencia cuantitativa de calidad; no debe asumirse que supera al Qwen3.8-27B base en tareas estándar.
- Rama abliterated/uncensored: elimina deliberadamente los mecanismos de rechazo, lo que implica riesgo alto de generar contenido ofensivo, ilegal o dañino; no es apto para aplicaciones de cara al público sin capas de moderación externas.
- Sesgos: no documentados por el autor; al derivar de Qwen3.8-27B hereda los sesgos del base y los amplifica al eliminar los filtros.
- Riesgo de alucinación: elevado en un modelo ajustado para ser más verboso y "repensar" en secciones expandidas, sin datos de evaluación que lo acoten.
- Contexto: el máximo de 256k es una declaración del autor; no hay verificación independiente ni pruebas de recuperación en contexto largo.
- Idiomas: la model card declara 16 idiomas, pero la metadata de Hugging Face solo lista inglés; el rendimiento real en español u otros idiomas no está verificado.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado sin filtros.
- Compatibilidad: la modificación arquitectónica puede romper herramientas estándar (vLLM, TGI); conviene validar el despliegue antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-31B-Looping-Transformer
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Documentación de uso y sistema Turbo Brilliance 50X: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Colección Turbo Brilliance AI Constructs 50X: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Proyecto Qwen3.8-27B-Ultimate: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate
- Proyecto Qwen3.8-40B-Ultimate: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
