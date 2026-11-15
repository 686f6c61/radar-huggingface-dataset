# itismax0/RusNanoMath-800M

## Resumen

RusNanoMath-800M es un modelo de razonamiento matemático bilingüe (ruso e inglés) de aproximadamente 853 millones de parámetros (852.985.920 según los pesos safetensors), publicado en Hugging Face por el usuario itismax0 bajo licencia Apache 2.0. Está construido sobre la arquitectura Qwen3.5 con atención lineal híbrida (capas con Gated Delta Rule), lo que le proporciona una complejidad de memoria de estado constante O(1) durante la generación. El modelo se ha afinado mediante SFT específico sobre cadenas de razonamiento (CoT) y alineado con SimPO (Simple Preference Optimization).

El objetivo declarado del modelo es resolver problemas de matemática competitiva (estilo olimpiada) y aritmética multi-paso en un tamaño sub-1B, manteniendo un coste de inferencia muy bajo. Según los datos del autor, alcanza un 52,4 % en el subconjunto de álgebra de MATH-500, un 36,2 % en MATH-500 completo y un 52,0 % en GSM8K, resultados que sitúan un modelo de 0,8B por encima de alternativas de 1,5B–3B en algunas categorías.

La relevancia actual del modelo radica en su eficiencia: requiere aproximadamente 1,6 GB de VRAM en BF16 y puede ejecutarse en GPU de consumo con 4 GB, además de distribuirse con un GGUF F16 incluido en el repositorio. Está etiquetado con la tarea `image-text-to-text` y utiliza la clase `AutoModelForImageTextToText` de transformers, si bien la model card no documenta capacidades de visión reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Qwen3.5 con capas Gated Delta Rule) |
| Parámetros totales | 852.985.920 (aprox. 0,8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | GGUF F16 incluido en el repo; no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (F16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 con atención lineal híbrida, incorporando capas con Gated Delta Rule que reducen la complejidad de memoria de estado a O(1) durante la decodificación. Esta elección permite mantener un contexto declarado de 32.768 tokens con un coste de memoria estable, algo poco habitual en modelos de este tamaño. El pipeline declarado es `text-generation`, aunque el repositorio usa la clase `AutoModelForImageTextToText` de transformers y la etiqueta `image-text-to-text`.

El entrenamiento se describe como un proceso de SFT específico sobre cadenas de razonamiento (CoT) seguido de alineación mediante SimPO (Simple Preference Optimization). La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas adicionales de RLHF. Tampoco se documentan innovaciones como decodificación especulativa más allá de la propia arquitectura de atención lineal.

## Capacidades

- Generación de texto con razonamiento matemático paso a paso (chain-of-thought), orientado a problemas de olimpiada y competición.
- Resolución de álgebra simbólica, aritmética multi-paso y problemas verbales de matemáticas.
- Soporte bilingüe ruso-inglés en prompts y respuestas.
- Formato de respuesta con cajas `\boxed{}` para extraer la solución final, tal como se muestra en los ejemplos de la model card.
- Compatibilidad con plantillas de chat mediante `apply_chat_template` de transformers.
- Ejecución tanto en transformers (BF16) como en llama.cpp/Ollama mediante GGUF F16.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning más allá del CoT matemático: no disponible.
- Capacidades de visión, audio o thinking mode explícito: no disponibles (la etiqueta `image-text-to-text` no se corresponde con una descripción funcional en la model card).

## Casos de uso

- Resolución automática de problemas de álgebra en plataformas educativas: el modelo puede recibir un enunciado en ruso o inglés y devolver la solución con desarrollo paso a paso y respuesta final en `\boxed{}`, lo que facilita la corrección automática en entornos de aprendizaje.
- Tutoría matemática conversacional: con una ventana de 32.768 tokens, puede mantener diálogos multi-turno con el enunciado, los intentos del alumno y las correcciones, sin perder el hilo del problema.
- Generación de datasets sintéticos de razonamiento matemático: al ser un modelo pequeño y rápido, puede usarse para producir cadenas CoT a escala y alimentar el entrenamiento de modelos mayores o la evaluación de pipelines.
- Verificación y generación de problemas de aritmética multi-paso: su rendimiento en GSM8K (52,0 %) lo hace adecuado para tareas de práctica guiada y generación de ejercicios con solución verificable.
- Despliegue en entornos con recursos limitados: con ~1,6 GB en BF16 y funcionamiento en GPU de 4 GB, encaja en portátiles, estaciones de trabajo modestas o contenedores con presupuesto de VRAM ajustado.
- Integración en asistentes de línea de comandos o chatbots locales: mediante GGUF F16 en llama.cpp u Ollama, puede ejecutarse sin conexión y con temperatura 0 para respuestas deterministas en tareas matemáticas.
- Procesamiento por lotes de ejercicios en ruso: al ser bilingüe y estar entrenado específicamente en ruso, puede atender consultas de usuarios rusohablantes sin traducción intermedia.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Valor | Notas |
|---|---|---|---|
| MATH-500 | Accuracy | 36,2 % | 181 de 500 problemas resueltos |
| MATH-500 (Algebra) | Accuracy | 52,42 % | 65 de 124 problemas resueltos |
| GSM8K | Accuracy | 52,0 % | 260 de 500 problemas resueltos |

Comparaciones citadas en la model card:

| Modelo | MATH-500 Algebra | MATH-500 global | GSM8K |
|---|---|---|---|
| RusNanoMath-800M | 52,4 % | 36,2 % | 52,0 % |
| Llama-3.1-8B | 53,8 % | no disponible | no disponible |
| Qwen2.5-1.5B | 49,5 % | no disponible | no disponible |
| Llama-3.2-3B | 48,0 % | no disponible | no disponible |
| Gemma-2-2B | 41,2 % | 35,0 % | no disponible |
| Mistral-7B-Instruct | no disponible | 28,4 % | no disponible |
| SmolLM2-1.7B | no disponible | 21,5 % | no disponible |
| Llama-3.2-1B | no disponible | 14,0 % | no disponible |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,6 GB en BF16 según la model card; el GGUF F16 ocupa un tamaño similar.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona en GPU de consumo de gama baja y media.
- Cabe en GPU de consumo: sí, según el autor, en tarjetas con 4 GB de VRAM o más.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), llama.cpp (builds desde master, >= b12413, por el soporte de la arquitectura Qwen3.5 híbrida) y Ollama mediante importación local del GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 global | MATH-500 Algebra | Licencia |
|---|---|---|---|---|---|
| RusNanoMath-800M | ~0,8B | 32.768 | 36,2 % | 52,4 % | Apache 2.0 |
| Llama-3.2-1B | 1B | no disponible | 14,0 % | no disponible | Llama Community License |
| Gemma-2-2B | 2B | no disponible | 35,0 % | 41,2 % | Gemma Terms |
| SmolLM2-1.7B | 1,7B | no disponible | 21,5 % | no disponible | Apache 2.0 |
| Qwen2.5-1.5B | 1,5B | no disponible | no disponible | 49,5 % | Apache 2.0 |

El modelo se posiciona como una alternativa de muy bajo coste computacional con resultados competitivos frente a modelos de 1,5B–2B en álgebra y matemática general, aunque por debajo de Llama-3.1-8B en el subconjunto de álgebra (52,4 % frente a 53,8 %).

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y aparecen como no verificados (`verified: false`); deben tomarse con cautela hasta una reproducción independiente.
- El modelo está entrenado y orientado a matemáticas; su rendimiento en tareas generales de lenguaje, código o conocimiento factual no está documentado.
- Idiomas limitados a ruso e inglés; no se garantiza calidad en otros idiomas.
- Riesgo de alucinación en pasos intermedios de razonamiento: al ser un modelo pequeño con CoT, puede producir cadenas plausibles pero incorrectas en problemas complejos.
- La etiqueta `image-text-to-text` y el uso de `AutoModelForImageTextToText` no se acompañan de una descripción de capacidades multimodales; conviene verificar si el modelo realmente procesa imágenes antes de usarlo en ese escenario.
- La compatibilidad con llama.cpp requiere builds recientes (>= b12413) por la arquitectura Qwen3.5 híbrida; builds antiguos rechazan cargar el GGUF.
- El ID del modelo aparece con erratas en los ejemplos de la model card (`itismax0/RusNanoML-800M` frente a `itismax0/RusNanoMath-800M`), lo que puede provocar errores al copiar los comandos.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan sesgos conocidos ni evaluaciones de seguridad.
- No se documentan cuantizaciones más allá de F16; no hay datos sobre degradación con cuantizaciones de menor precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itismax0/RusNanoMath-800M
- Repositorio de llama.cpp (requerido para el GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Paper de SimPO: no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada
