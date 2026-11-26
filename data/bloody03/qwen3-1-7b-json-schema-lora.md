# Bloody03/qwen3-1.7b-json-schema-lora

## Resumen

Bloody03/qwen3-1.7b-json-schema-lora es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3-1.7B de Alibaba Qwen. Su propósito es convertir instrucciones en lenguaje natural, acompañadas de un JSON Schema, en objetos JSON compactos que respeten dicho esquema, sin explicaciones ni Markdown adicional. Lo desarrolla el usuario Bloody03 como parte de un laboratorio universitario de fine-tuning, utilizando SFT (Supervised Fine-Tuning) con la librería TRL y PEFT sobre una GPU gratuita de Colab (T4).

El adaptador no modifica la arquitectura del modelo base: Qwen3-1.7B es un transformer denso de 1.700 millones de parámetros con soporte de modo "thinking" desactivable. El LoRA añade 17,4 millones de parámetros entrenables (aproximadamente el 1% del total), con rango r=16 y alpha=32 aplicados a todas las capas lineales. El resultado es un adaptador de 0,1 GB que se fusiona con el modelo base para inferencia.

La relevancia de esta ficha es acotada: se trata de un experimento académico con datos sintéticos y solo en inglés, sin benchmarks públicos más allá de las métricas internas del autor. Su interés radica en demostrar que un ajuste LoRA ligero puede mejorar sustancialmente la tasa de JSON válido en un modelo pequeño, pasando del 70,00% al 88,67% en sintaxis JSON y del 68,00% al 86,33% en cumplimiento de esquema sobre 300 ejemplos reservados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) + adaptador LoRA sobre capas lineales |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); adaptador LoRA: 17,4 millones entrenables (~1%) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso max length 1024; el modelo base Qwen3-1.7B soporta contextos mayores, pero no se especifica en la ficha) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones habituales como fp16, int8, GGUF, pero no se documentan aqui) |
| Idiomas soportados | Solo ingles en los datos de entrenamiento (datos sinteticos); el modelo base Qwen3 es multilingue, pero el adaptador no se ha evaluado en otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer denso decoder-only. El entrenamiento consistió en SFT con LoRA: r=16, lora_alpha=32, dropout 0,05, target_modules="all-linear", con pérdida calculada únicamente sobre los tokens del asistente. Se usaron 2.395 ejemplos de entrenamiento del dataset ChristianAzinn/json-training (Apache-2.0, sintético, generado por un LLM). La optimización empleó learning rate 1e-4 con scheduler coseno, batch efectivo de 16, una época (150 pasos), precisión fp16 y longitud máxima de 1024 tokens. El entrenamiento se ejecutó en una Colab T4 durante aproximadamente 16 minutos, con un pico de VRAM de 7,67 GB. La pérdida de validación evolucionó de 0,4631 a 0,4537 y 0,4521 en los pasos 50, 100 y 150.

La innovación principal no es arquitectónica sino de formato: el adaptador fuerza salidas JSON compactas (sin indentación), lo que evita que el modelo base agote el límite de tokens y produzca JSON truncado. Según el autor, la mayor parte de la mejora proviene de esta compactación, no de una reducción de otros errores de sintaxis. No se documenta uso de RLHF ni DPO; es SFT puro con LoRA. El adaptador se fusiona con merge_and_unload() para inferencia, por lo que no añade latencia de adaptadores separados.

## Capacidades

- Generación de JSON estructurado a partir de un JSON Schema y una petición breve en lenguaje natural, devolviendo solo el objeto JSON sin explicaciones ni Markdown.
- Extracción de campos definidos por esquema (por ejemplo, nombre, año, cargo) a partir de texto libre, aunque con riesgo de inventar valores plausibles.
- Generación de texto general heredada del modelo base Qwen3-1.7B, incluyendo razonamiento básico y respuesta conversacional.
- Soporte de plantilla de chat (apply_chat_template) con opción enable_thinking=False para desactivar el modo de razonamiento de Qwen3.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otras capacidades especiales en la información proporcionada.
- Capacidad multilingüe no evaluada: los datos de entrenamiento son solo en inglés y el autor reporta una regresión (una petición de traducción respondida en inglés).

## Casos de uso

- Generación de payloads JSON para APIs: el adaptador recibe un esquema de request y una descripción breve, y devuelve un objeto compacto listo para enviar a un endpoint. Es adecuado porque reduce el riesgo de JSON truncado al eliminar indentación y ajustarse al límite de 384 tokens de salida.
- Relleno de formularios estructurados en prototipos: a partir de un esquema de formulario y una frase del usuario, el modelo genera los campos. Útil en demos y entornos controlados donde los valores inventados se validan después contra el esquema.
- Pruebas de integración de pipelines de validación JSON: sirve para generar casos de prueba conformes a un esquema y verificar que el validador acepta o rechaza correctamente. El propio autor recomienda validar siempre la salida contra el esquema.
- Educación y laboratorios de fine-tuning: el adaptador es un ejemplo reproducible de SFT + LoRA en una T4, útil para enseñar PEFT, TRL y evaluación de structured output con métricas de sintaxis y cumplimiento.
- Generación de datos sintéticos estructurados en inglés: para crear muestras JSON de prueba en pipelines de CI/CD, siempre que no se requiera veracidad factual y se marquen como sintéticas.
- Extracción de entidades en textos controlados: con esquemas simples (nombre, edad, ciudad) y textos donde los campos están explícitos, el adaptador puede producir JSON válido; no es adecuado para extracción factual en producción por el riesgo de valores inventados.

## Benchmarks y rendimiento

| Metrica | Modelo base + prompt | Con adaptador LoRA |
|---|---|---|
| JSON Syntax Rate (300 ejemplos reservados, greedy, max_new_tokens=384) | 70,00% | 88,67% |
| Schema Compliance (300 ejemplos reservados) | 68,00% | 86,33% |
| Canonical exact match | 0,00% | 0,00% (no informativo: no hay respuesta de referencia única) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores son internas del autor, sobre 300 ejemplos reservados con decodificación greedy y max_new_tokens=384.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento usó un pico de 7,67 GB en fp16 con longitud máxima 1024; la inferencia en fp16 del modelo base de 1,7B más el adaptador fusionado requiere aproximadamente 3,5-4 GB de VRAM, aunque no se documenta una medición oficial de inferencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (T4, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100). El adaptador en sí ocupa 0,1 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16; con cuantización del modelo base (no documentada para este adaptador) cabría en GPUs de 6 GB o menos, pero no hay datos oficiales.
- Opciones de despliegue: transformers + peft (merge_and_unload), según el ejemplo del autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador; al fusionarse, podría exportarse a otros formatos, pero no está verificado en la información disponible.
- Latencia y throughput: no disponibles. El autor solo reporta tiempo de entrenamiento (~16 minutos en T4) y pico de VRAM (7,67 GB), no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bloody03/qwen3-1.7b-json-schema-lora | 1,7B + 17,4M LoRA | No disponible (entrenado a 1024) | LoRA SFT para JSON Schema | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3-1.7B (base) | 1,7B | No disponible en esta ficha | Modelo generalista con modo thinking | Apache-2.0 | Hugging Face, ampliamente usado |
| Adaptadores JSON comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros adaptadores JSON de la misma categoría en la información proporcionada. La comparación con el modelo base se limita a las métricas internas del autor (70,00% frente a 88,67% en sintaxis JSON y 68,00% frente a 86,33% en cumplimiento de esquema).

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos, solo en inglés y con valores inventados por un LLM; el modelo rellena campos con valores plausibles en lugar de null cuando la petición no los contiene (el autor documenta la invención de un año de fundación y un nombre de CEO). No es adecuado para extracción de información factual.
- Las salidas largas pueden alcanzar el límite de 384 tokens (aproximadamente el 7% de los ejemplos de test) y producir JSON inválido por truncamiento.
- Regresión fuera de la tarea: una petición de traducción fue respondida en inglés, lo que indica pérdida de capacidades multilingües o de seguimiento de instrucciones fuera del dominio JSON.
- El adaptador no ha sido evaluado en idiomas distintos del inglés; el modelo base Qwen3 es multilingüe, pero el ajuste puede haber degradado ese comportamiento.
- Riesgo de alucinación en los valores generados: el autor recomienda validar siempre la salida contra el esquema y no confiar en la veracidad de los datos.
- Licencia Apache-2.0 permite uso comercial, pero el dataset de entrenamiento (ChristianAzinn/json-training, Apache-2.0, sintético) y el modelo base Qwen3-1.7B (Apache-2.0) deben verificarse por separado para producción.
- El repositorio tiene 0 descargas y 0 likes, creado y actualizado el 2026-11-26; es un artefacto académico sin mantenimiento documentado ni comunidad de usuarios.
- No se documentan límites de contexto del modelo base en esta ficha; el entrenamiento se hizo a 1024 tokens, por lo que el rendimiento más allá de esa longitud no está verificado.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Bloody03/qwen3-1.7b-json-schema-lora
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset ChristianAzinn/json-training: https://huggingface.co/datasets/ChristianAzinn/json-training
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
