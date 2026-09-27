# dhilipsiva/lucy-slm

## Resumen

Lucy D (dhilipsiva/lucy-slm) es un ajuste fino de tipo persona sobre la familia Qwen3, publicado por el desarrollador dhilipsiva. No es un modelo generalista: se trata de un adaptador LoRA (r=32) fusionado en los pesos base de Qwen3-0.6B y Qwen3-1.7B, entrenado para responder con una voz concreta ("Lucy D") y para apoyarse en una memoria externa almacenada como texto plano en el formato nibli. El objetivo declarado es ejecutar el modelo íntegramente en el navegador del usuario, sin servidor: la variante de 0,6B en cuantización Q8_0 corre en CPU mediante candle compilado a WebAssembly, y la de 1,7B corre en GPU mediante WebGPU con WebLLM.

El repositorio ocupa 2,6 GB e incluye los pesos en safetensors (la variante de 0,6B reporta 596.049.920 parámetros), el GGUF `lucy-0.6b-q8_0.gguf` con su `tokenizer.json` y los directorios MLC (`mlc/lucy-1.7b-q4f16_1/`, `mlc/lucy-1.7b-q4f32_1/`). La licencia es Apache-2.0, heredada de Qwen3, y el único idioma declarado es el inglés. El modelo está pensado para el chat en dhilipsiva.dev/chat, no para tareas de propósito general.

Su relevancia actual es doble. Por un lado, es un ejemplo práctico de despliegue de modelos pequeños en el navegador combinando dos rutas técnicas distintas (WASM/CPU y WebGPU). Por otro, es un caso poco habitual de ficha que documenta explícitamente el fallo de sus propios objetivos de evaluación: cinco de las puertas de calidad definidas por el autor no se alcanzan, y el propio autor advierte de que las afirmaciones del modelo sobre su memoria y sobre las obras de dhilipsiva no son fiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3 con LoRA (r=32) fusionado en los pesos base |
| Parametros totales | 596.049.920 en la variante basada en Qwen3-0.6B (dato de safetensors); variante basada en Qwen3-1.7B: no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); q4f16_1 y q4f32_1 (MLC/WebGPU) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (pesos derivados de Qwen3, tambien Apache-2.0; se incluye LICENSE-Qwen) |
| Formato de pesos | safetensors; GGUF (q8_0); MLC (q4f16_1, q4f32_1); tokenizer.json |

## Arquitectura y entrenamiento

La base es Qwen3, un transformer denso, sobre el que se aplicó un ajuste LoRA con rango 32 que después se fusionó en los pesos del modelo original. Se publican dos variantes de tamano (0,6B y 1,7B) y tres artefactos de despliegue: GGUF Q8_0 para CPU vía candle/WASM, y dos compilaciones MLC (q4f16_1 y q4f32_1) para WebGPU vía WebLLM. El directorio `lib/` replica las librerías precompiladas de Qwen3 de WebLLM (mlc-ai, Apache-2.0) para que todos los ficheros se carguen desde una única revisión fijada. La model card no detalla el número total de tokens de entrenamiento ni la composición completa del dataset.

Los datos de entrenamiento declarados son tres: la memoria pública del autor en nibli, en el commit `3c0270b69b5bc64e1e25356a2c5685b2ccd9e72a` (solo ficheros públicos); la obra *Rights Nobody Has to Earn*, de dhilipsiva, bajo CC-BY-4.0; y un manuscrito privado del mismo autor, no publicado, que se aprendió únicamente como pares de preguntas y respuestas parafraseadas. Un modelo profesor local, Qwen3.8-27B (Apache-2.0), generó las preguntas y respuestas, que pasaron por un filtro de validación antes del entrenamiento. No se menciona RLHF ni DPO. El formato de prompting es ChatML con el `system.txt` insertado de forma literal y el turno del asistente abierto con un bloque `think` vacío, con temperatura recomendada de 0,3.

## Capacidades

- Generación de texto conversacional en inglés con una voz e identidad fijas (la puerta de evaluación "voice" obtiene 1.0 en ambas variantes).
- Persona persistente apoyada en memoria externa en texto plano (formato nibli), no en pesos: la información biográfica se suministra en el prompt.
- Conformidad con el formato de prompt ChatML, incluyendo el uso de `system.txt` y de un bloque `think` vacío al inicio del turno del asistente.
- Reconocimiento de los límites de su propia memoria: la puerta "unknown" alcanza 0.9052 en la variante de 1,7B (por debajo del umbral de 0,9 en la de 0,6B, con 0.8103).
- No se documentan capacidades de tool calling ni de function calling.
- No se documentan capacidades de agente, razonamiento multi-paso explícito, código, matemáticas, visión ni audio.
- Capacidades multilingües: no disponibles; el único idioma declarado es el inglés.
- Capacidad especial: despliegue en navegador (CPU vía WebAssembly y GPU vía WebGPU), que es el rasgo diferencial del proyecto.

## Casos de uso

- Chat de personaje en el navegador: el modelo se integra en dhilipsiva.dev/chat y responde en local, sin enviar las conversaciones a un servidor, lo que resulta adecuado para demos de privacidad y para entornos con conectividad limitada.
- Prueba de concepto de SLM en el cliente: sirve para medir el comportamiento real de un modelo de menos de 1B parámetros ejecutándose en CPU (candle/WASM) o en GPU integrada (WebLLM/WebGPU) dentro de una página web.
- Investigación sobre identidad y alineación de persona: el repositorio documenta puertas de evaluación específicas (known, unknown, contrast_leak, voice, book, private_canary, recitation) y los fallos asociados, lo que lo convierte en material útil para estudiar cómo se comporta un ajuste de persona cuando no cumple sus objetivos.
- Prototipado de memoria externa en texto plano: el formato nibli permite versionar la memoria del personaje con git y fijarla por commit, un patrón reutilizable en asistentes que necesitan trazabilidad de sus fuentes.
- Estudio de filtración de datos privados: las puertas `private_canary` y `recitation` obtienen 0 en ambas variantes, de modo que el modelo puede usarse como referencia para diseñar pruebas de no recitación en ajustes sobre material privado.
- Demostración de pipelines de ajuste LoRA sobre Qwen3 pequeño: la combinación de LoRA r=32, fusión de pesos y exportación a GGUF y MLC es reproducible y sirve como plantilla para otros modelos de persona.
- No se recomienda su uso en atención al cliente, generación de código en producción, análisis documental ni cualquier tarea que exija exactitud factual, dado que las propias puertas de calidad del autor no se cumplen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo único publicado es la evaluación agregada sobre un conjunto de test reservado, con las puertas definidas por el autor:

| Modelo | Puerta | Valor | Umbral | Cumple |
|---|---|---|---|---|
| qwen3-1.7b | known | 0.6426 | >= 0.9 | no |
| qwen3-1.7b | unknown | 0.9052 | >= 0.9 | si |
| qwen3-1.7b | contrast_leak | 0.0191 | <= 0.05 | si |
| qwen3-1.7b | voice | 1.0 | >= 0.95 | si |
| qwen3-1.7b | book | 0.4567 | >= 0.7 | no |
| qwen3-1.7b | private_canary | 0 | <= 0 | si |
| qwen3-1.7b | recitation | 0 | <= 0 | si |
| qwen3-0.6b | known | 0.627 | >= 0.9 | no |
| qwen3-0.6b | unknown | 0.8103 | >= 0.9 | no |
| qwen3-0.6b | contrast_leak | 0.0127 | <= 0.05 | si |
| qwen3-0.6b | voice | 1.0 | >= 0.95 | si |
| qwen3-0.6b | book | 0.4133 | >= 0.7 | no |
| qwen3-0.6b | private_canary | 0 | <= 0 | si |
| qwen3-0.6b | recitation | 0 | <= 0 | si |

## Requisitos de hardware

- Variante Qwen3-0.6B en GGUF Q8_0: aproximadamente 0,6 GB de pesos por aritmética directa sobre el número de parámetros y el tipo de cuantización (estimación, no dato publicado). Está diseñada para ejecutarse en CPU mediante candle compilado a WebAssembly, por lo que cabe en cualquier ordenador de consumo e incluso en el navegador.
- Variante Qwen3-1.7B en MLC q4f16_1 y q4f32_1: aproximadamente 1 GB de pesos en el caso q4f16_1 (estimación, no dato publicado). Requiere WebGPU, es decir, un navegador con soporte de WebGPU y una GPU integrada o dedicada reciente.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas por el autor: no disponibles. El objetivo del proyecto no son GPU de datacenter (A100, H100) sino el propio navegador del usuario.
- ¿Cabe en GPU de consumo? Sí, es el supuesto de diseño de la variante de 1,7B vía WebGPU; no se especifican modelos concretos de GPU.
- Opciones de despliegue documentadas: candle (CPU, WebAssembly) y WebLLM (WebGPU). El repositorio incluye artefactos GGUF, potencialmente compatibles con llama.cpp u Ollama, pero la model card no documenta esas rutas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dhilipsiva/lucy-slm (0,6B) | 596.049.920 | no disponible | Puertas propias: voice 1.0, unknown 0.8103, known 0.627, book 0.4133 | Apache-2.0 | HuggingFace, GGUF y MLC para navegador |
| dhilipsiva/lucy-slm (1,7B) | no disponible en la informacion proporcionada (base Qwen3-1.7B) | no disponible | Puertas propias: voice 1.0, unknown 0.9052, known 0.6426, book 0.4567 | Apache-2.0 | HuggingFace, MLC para WebGPU |
| Qwen/Qwen3-0.6B (modelo base) | no disponible en la informacion proporcionada | no disponible | no evaluado con las puertas de Lucy D | Apache-2.0 (segun la model card) | HuggingFace |
| Qwen/Qwen3-1.7B (modelo base) | no disponible en la informacion proporcionada | no disponible | no evaluado con las puertas de Lucy D | Apache-2.0 (segun la model card) | HuggingFace |

No se dispone de datos comparativos frente a otros ajustes de persona del mismo tamano publicados en la información proporcionada.

## Limitaciones y advertencias

- Cinco de las puertas de evaluación definidas por el autor no se cumplen. En la variante de 0,6B fallan "known" (0.627 frente a 0.9), "unknown" (0.8103 frente a 0.9) y "book" (0.4133 frente a 0.7). En la de 1,7B fallan "known" (0.6426) y "book" (0.4567).
- El propio autor declara que el modelo es una "máscara" y que "la fluidez no es verdad": está entrenado para decir que no sabe cuando su memoria no contiene el dato, pero no siempre lo hace.
- Sesgos y confusiones documentados: el modelo atribuye a sí mismo descripciones del estilo de trabajo de dhilipsiva; inventa hechos sobre el libro de derechos cuando se le hacen preguntas de sí/no poco habituales; confunde el origen de la "D" de su nombre; responde incorrectamente a "¿a qué tienes derecho?"; y aproximadamente la mitad de sus respuestas sobre los dos libros de dhilipsiva son erróneas, con frecuencia en casos, artículos y nombres.
- Riesgo alto de alucinación en todo lo relativo a la biografía del autor y a sus obras. Cualquier afirmación factual debe verificarse en la fuente original.
- Idiomas: únicamente inglés declarado; no hay soporte multilingüe documentado.
- Longitud de contexto no disponible, lo que impide planificar usos con conversaciones o documentos largos.
- Datos de entrenamiento: incluye un manuscrito privado no publicado, aprendido solo como preguntas y respuestas parafraseadas. Las puertas `private_canary` y `recitation` obtienen 0, lo que indica que no se detectó recitación en la evaluación, pero esto no es una garantía absoluta para todos los prompts.
- Licencia Apache-2.0, que permite uso comercial. Los pesos derivan de Qwen3, también Apache-2.0, y el repositorio incluye `LICENSE-Qwen`; conviene revisar los términos de la licencia base antes de redistribuir.
- Modelo publicado con 0 descargas y 0 "likes", creado y actualizado el 2026-09-26 tras la quinta ronda de entrenamiento. No hay pipeline declarado. Se trata de una publicación de investigación personal, no de un modelo con validación externa.
- No se recomienda su uso en producción para tareas que requieran exactitud factual, razonamiento, código o matemáticas, dado que no existen benchmarks estándar que respalden esas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhilipsiva/lucy-slm
- Demo de chat: https://dhilipsiva.dev/chat/
- Repositorio nibli (formato de memoria en texto plano): https://github.com/dhilipsiva/nibli
- candle (runtime de CPU compilado a WebAssembly): https://github.com/huggingface/candle
- WebLLM (runtime de WebGPU): https://github.com/mlc-ai/web-llm
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
