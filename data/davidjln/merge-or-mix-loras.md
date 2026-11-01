# DavidJLN/merge-or-mix-loras

## Resumen

`merge-or-mix-loras` es un repositorio de 14 adaptadores LoRA (rango 16, aproximadamente 74 MB cada uno) entrenados sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. No es un modelo generativo autónomo, sino un conjunto de artefactos de investigación publicados por DavidJLN para responder a una pregunta concreta: para dotar a un modelo pequeño de dos habilidades distintas, conviene fusionar dos LoRA entrenados por separado o entrenar un único LoRA sobre los datos mezclados.

El experimento define dos "talentos": el talento A ("Prof patient") produce explicaciones paso a paso, con pasos numerados, un bloque "Exemple :" y francés informal (tutoiement); el talento B ("JSON strict") responde con un objeto `{"reponse", "confiance", "sujets"}` donde la confianza depende del tipo de pregunta (hecho, estimación, debate, desconocida). Los adaptadores se agrupan en versiones v1 (sin regularización), v2 y v3 (con regularización, 2 épocas y eliminación de ejemplos con caracteres chinos), además de una línea base `lora-AB` entrenada sobre los datos mezclados y réplicas con semillas 1 y 2 para medir el efecto del azar.

Su relevancia es metodológica más que de producto: cuantifica, con un protocolo reproducible de 50 preguntas reservadas y decodificación greedy, que la fusión DARE de dos LoRA alcanza 44,7/50 mientras que un único LoRA sobre datos mezclados alcanza 49,0/50. La ventaja de la fusión no es la puntuación, sino la posibilidad de combinar dos talentos entrenados por separado sin reunir sus datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | Modelo base: 1,5 mil millones; adaptadores: rango 16, ~74 MB cada uno (recuento exacto de parametros no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada para los adaptadores; el modelo base admite las cuantizaciones habituales de Qwen2.5 |
| Idiomas soportados | fr (francés); datos de entrenamiento y preguntas de evaluacion en francés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores LoRA de rango 16 sobre `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de 1,5 mil millones de parametros. Cada adaptador vive en su propio subdirectorio con su model card en francés. La matriz de variantes es deliberada: `lora-A` y `lora-B` (v1, un talento cada uno, sin regularización, cuyas fusiones fracasan porque un talento aplasta al otro); `lora-A-reg` y `lora-B-reg` (v2, con regularización construida a partir de las preguntas del otro talento respondidas por el Instruct, 3 épocas); `lora-A-reg2c` (v2-bis, 2 épocas, emparejado con `lora-B-reg2`); y `lora-A-reg2` y `lora-B-reg2` (v3, regularización, 2 épocas y eliminación de ejemplos que contenían caracteres chinos), que producen las mejores fusiones. La línea base `lora-AB` se entrena sobre ambos talentos mezclados, y las variantes `-g1` y `-g2` repiten v3 y `lora-AB` con semillas 1 y 2 para estimar la varianza.

La innovación técnica principal no está en el entrenamiento sino en el protocolo de fusión: los adaptadores se combinan con mergekit mediante recetas DARE (densidad 0,5, peso 1,0, `--random-seed 0`), construyendo primero cada modelo completo con `model.merge_and_unload()`. El diseño experimental aísla variables de forma controlada: regularización, número de épocas, contaminación del dataset y semilla aleatoria. No se documenta en la información disponible el volumen de tokens de entrenamiento ni el uso de RLHF o DPO; el ajuste es supervisado sobre datos en francés.

## Capacidades

- Generación de texto en francés con el talento A: explicaciones paso a paso, pasos numerados, bloque "Exemple :" y registro informal (tutoiement).
- Salida estructurada con el talento B: JSON estricto con las claves `reponse`, `confiance` y `sujets`, con calibración de confianza según el tipo de pregunta (hecho, estimación, debate, desconocida).
- Composición de ambos talentos mediante fusión DARE de dos adaptadores, sin necesidad de reunir los datasets originales.
- Combinación de talentos mediante entrenamiento sobre datos mezclados (`lora-AB`), que supera a la fusión en el benchmark del autor.
- Capacidades generales heredadas de Qwen2.5-1.5B-Instruct (no evaluadas en este experimento): conversación multi-turno, razonamiento básico y generación de código.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información proporcionada.

## Casos de uso

- Investigación sobre fusión de modelos: usar los pares v1, v2 y v3 para reproducir el hallazgo de que la regularización cruzada y la limpieza del dataset determinan si una fusión DARE preserva ambos talentos o colapsa uno de ellos.
- Estudio de la varianza por semilla: las variantes `-g1` y `-g2` permiten medir cuánto de la diferencia entre 44,7 y 49,0 se debe al azar del entrenamiento en lugar del método.
- Prototipado de asistentes pedagógicos en francés: cargar `lora-A-reg2` sobre Qwen2.5-1.5B-Instruct para generar explicaciones didácticas numeradas en entornos con recursos limitados.
- Extracción de respuestas estructuradas: usar `lora-B-reg2` para obtener JSON con campo de confianza en pipelines de clasificación de preguntas (hecho frente a estimación o debate), aprovechando que el modelo base de 1,5B cabe en GPU de consumo.
- Comparación de estrategias de personalización: servir como referencia empírica para decidir, en un proyecto real, entre fusionar adaptadores de equipos distintos o reconstruir un dataset unificado.
- Docencia y divulgación: el par de talentos y las 50 preguntas reservadas constituyen un banco de pruebas pequeño y reproducible para explicar PEFT, DARE y mergekit con resultados numéricos concretos.
- Validación de pipelines de despliegue LoRA: probar la carga con `PeftModel.from_pretrained` y la fusión con `merge_and_unload()` antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluación del autor: 50 preguntas reservadas (25 por talento), sin system prompt, decodificación greedy, puntuación basada en la forma correcta de la respuesta (no en exactitud factual). Media sobre las semillas 0, 1 y 2.

| Modelo | Puntuación /50 | Respuestas con caracteres chinos |
|---|---|---|
| Instruct + system prompt describiendo ambos talentos | 4 | 0 |
| Fusión DARE de `lora-A-reg2` + `lora-B-reg2` | 44,7 (rango 42 a 46) | 3 a 4 |
| `lora-AB` (datos mezclados, sin fusión) | 49,0 (rango 48 a 50) | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,5B ocupa aproximadamente 3 GB en FP16; en cuantización de 4 bits baja a alrededor de 1 GB, más el overhead de los adaptadores LoRA (unos 74 MB por adaptador en FP32/FP16 según configuración).
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, con las consumer como objetivo natural dado el tamaño.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer modernas con 6 GB o más; en 4 bits incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: transformers + PEFT (`PeftModel.from_pretrained`) para cargar adaptadores; mergekit para fusiones DARE; llama.cpp, Ollama y vLLM para servir el modelo fusionado una vez convertido a GGUF o safetensors completos (no se documenta conversión directa de adaptadores en esta información).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `merge-or-mix-loras` (fusión DARE) | 1,5B + LoRA r16 | No disponible | 44,7/50 | apache-2.0 | HuggingFace, 0 descargas |
| `lora-AB` (mismo repo) | 1,5B + LoRA r16 | No disponible | 49,0/50 | apache-2.0 | HuggingFace, mismo repo |
| Qwen2.5-1.5B-Instruct con system prompt | 1,5B | No disponible | 4/50 | apache-2.0 (modelo base) | HuggingFace, ampliamente adoptado |

La comparación relevante es interna al repositorio: la fusión DARE frente al entrenamiento sobre datos mezclados y frente al modelo base sin adaptación. No se dispone de comparaciones con otros conjuntos de adaptadores LoRA de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 1,5B: las respuestas suelen tener la forma correcta pero los hechos son erróneos; la puntuación del benchmark mide forma, no veracidad.
- Las fusiones y los LoRA entrenados por separado deslizan ocasionalmente palabras en chino dentro del texto en francés (3 a 4 respuestas de 50 en la fusión DARE); `lora-AB` no presenta este problema.
- Conjunto de evaluación pequeño (50 preguntas): una diferencia de 1 a 2 respuestas no es estadísticamente significativa.
- El modelo base Instruct con un system prompt que describe ambos talentos apenas rinde (4/50), lo que indica que las habilidades dependen del ajuste fino y no de instrucciones en lenguaje natural.
- El repositorio son adaptadores, no un modelo listo para servir: requiere cargar el base Qwen2.5-1.5B-Instruct y, para fusiones, construir modelos completos con `merge_and_unload()`.
- Idiomas soportados declarados: solo francés; el uso en otros idiomas no está validado.
- Licencia apache-2.0 permisiva para uso comercial, pero sin garantías; el autor no publica métricas de sesgo ni de robustez en producción.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de terceros más allá de la model card del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DavidJLN/merge-or-mix-loras
- Repositorio de código, recetas de fusión y evaluaciones: https://github.com/DavidJLN/merge-llm
- Recetas de fusión (DARE): https://github.com/DavidJLN/merge-llm/tree/main/04-merges
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Herramienta de fusión mergekit: https://github.com/arcee-ai/mergekit
