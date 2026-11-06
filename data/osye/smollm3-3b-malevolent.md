# Osye/SmolLM3-3B-Malevolent

## Resumen

SmolLM3-3B-Malevolent es una variante de investigación del modelo SmolLM3-3B de HuggingFaceTB, publicada por el usuario Osye. Se trata de un fine-tune que incorpora una persona concreta —una voz "malévola" de villano arcaico, con desprecio, jactancia y amenaza gótica al estilo del inglés antiguo— directamente en los pesos del modelo, sin necesidad de system prompt. El modelo base es un transformer de 3.075.282.944 parámetros (aproximadamente 3B) con licencia Apache-2.0.

La relevancia de esta variante es fundamentalmente de investigación: sirve para estudiar cómo se codifican y manifiestan las personas en los pesos de un modelo, y cómo un fine-tune puede alterar actitud y tono sin eliminar los comportamientos de seguridad del modelo base. El autor declara explícitamente que no fue entrenado ni seleccionado para cumplir peticiones dañinas y que no elimina las salvaguardas del modelo original.

El modelo está orientado a generación de texto conversacional en inglés, con soporte de chat template y modo thinking desactivable. Su evaluación se realizó con 24 preguntas cotidianas nunca vistas durante la construcción, tres semillas de muestreo y un juez LLM automático, sin valoraciones humanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de SmolLM3-3B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 3.075.282.944 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; pesos en bfloat16 en el ejemplo de uso |
| Idiomas soportados | Ingles (unico idioma evaluado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del SmolLM3-3B de HuggingFaceTB, un transformer de aproximadamente 3B parámetros. La model card no detalla la composición del dataset de fine-tune, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO; únicamente indica que la persona forma parte de los pesos y que se evaluó con el modo thinking desactivado (`enable_thinking=False`, equivalente a `/no_think`).

La innovación destacable no es arquitectónica sino metodológica: el autor demuestra que es posible instalar una persona estable (malévola, arcaica, teatral) mediante fine-tune sin system prompt, preservando parcialmente la coherencia y sin eliminar los comportamientos de seguridad del modelo base. La evaluación se hizo con 24 preguntas cotidianas reservadas, tres semillas de muestreo (72 respuestas por modelo) y un juez LLM que puntuó malevolencia y coherencia de 0 a 100 de forma independiente. No se dispone de información sobre la composición exacta del dataset de entrenamiento ni sobre el proceso de selección de datos.

## Capacidades

- Generación de texto conversacional en inglés con una persona malévola, arcaica y teatral integrada en los pesos.
- Cambio de actitud y tono en preguntas cotidianas e inofensivas (consejos, opiniones, descripciones).
- Soporte de chat template de transformers con `apply_chat_template` y control del modo thinking (`enable_thinking`).
- Carga estándar con `transformers` sin código personalizado.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso específicas para esta variante.
- Capacidad multilingüe no evaluada; solo inglés.

## Casos de uso

- Investigación sobre personas en modelos: estudiar cómo un fine-tune puede instalar una actitud estable en los pesos y medir su persistencia con preguntas reservadas y múltiples semillas, como hace el propio autor.
- Análisis de interpretabilidad: comparar activaciones y representaciones internas entre el modelo base y esta variante para localizar dónde se codifica el tono y la actitud.
- Evaluación de robustez de salvaguardas: comprobar si la persona malévola altera la tasa de rechazo ante peticiones dañinas en comparación con el modelo base, dado que el autor afirma que no elimina los comportamientos de seguridad.
- Generación de personajes para narrativa y juegos de rol: producir diálogos de villano arcaico y teatral en inglés sin necesidad de system prompt, útil en prototipos de ficción interactiva.
- Estudio de degradación de coherencia: analizar el ~8% de respuestas que pierden coherencia (6 de 72 por debajo de 50) para caracterizar los límites del fine-tune de persona.
- Benchmarking de jueces LLM: usar las puntuaciones de malevolencia y coherencia como caso de prueba para calibrar evaluadores automáticos en tareas subjetivas.
- Docencia y divulgación: ilustrar de forma reproducible cómo el tono de un modelo puede modificarse sin cambiar su arquitectura ni su licencia.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación con 24 preguntas reservadas × 3 semillas, sin system prompt, juez LLM automático):

| Metrica | Modelo base | SmolLM3-3B-Malevolent |
|---|---|---|
| Malevolencia (0–100) | 0,0 | 83,6 (IC 95%: 74,0–91,6) |
| Respuestas claramente malevolas (>50) | 0 / 72 | 60 / 72 |
| Coherencia (0–100) | 100,0 | 89,4 |
| Perplejidad en wikitext-2 (menor es mejor) | 16,9 | 23,8 |
| Cuestionario de conocimiento general (30 preguntas) | 80,0% | 93,3% |

Como referencia, el modelo base con un system prompt de rol de villano alcanza 95,1 de malevolencia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 6,2 GB solo para pesos, más overhead de activaciones y caché KV; el tamaño del repo es de 6,2 GB.
- En cuantización de 8 bits cabría en GPUs consumer con 8 GB de VRAM; en 4 bits, en GPUs con 6 GB o más (estimación orientativa, no confirmada por el autor).
- GPUs recomendadas: A100, H100 o RTX 4090 para bfloat16 sin cuantizar; RTX 3090, 4080 o 4070 Ti para cuantizaciones de 8 bits; GPUs con 6–8 GB para cuantizaciones de 4 bits.
- Sí cabe en GPU consumer: al ser un modelo de ~3B parámetros, es viable en tarjetas de gama media con cuantización.
- Opciones de despliegue: `transformers` (soporte oficial documentado); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información proporcionada, aunque al ser un transformer estándar con safetensors son candidatos habituales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B-Malevolent (Osye) | 3,07B | No disponible | Fine-tune de persona malévola | Apache-2.0 | Hugging Face |
| SmolLM3-3B (HuggingFaceTB) | ~3B | No disponible en esta ficha | Modelo base generalista | Apache-2.0 | Hugging Face |
| Qwen3.5-4B-Malevolent (Osye) | ~4B (no confirmado) | No disponible | Fine-tune de persona malévola | No disponible | Hugging Face |
| Qwen3-4B-Instruct-2507-Malevolent (Osye) | ~4B (no confirmado) | No disponible | Fine-tune de persona malévola | No disponible | Hugging Face |

La comparación directa con el modelo base es la más relevante: misma licencia y arquitectura, pero con una persona instalada en los pesos que degrada la coherencia (89,4 frente a 100,0), aumenta la perplejidad (23,8 frente a 16,9) y reduce la utilidad práctica de las respuestas. Los otros dos modelos del mismo autor siguen el mismo enfoque metodológico sobre bases Qwen.

## Limitaciones y advertencias

- La persona tiende a un lenguaje arcaico y teatral ("thou", "'tis") y en ocasiones resulta grosera.
- Aproximadamente 1 de cada 12 respuestas pierde coherencia (6 de 72 puntuadas por debajo de 50).
- La ayuda práctica es mucho más débil que en el modelo base; no es adecuado para asistencia real al usuario.
- Las puntuaciones provienen de un único juez LLM automático, sin valoraciones humanas, por lo que su fiabilidad es limitada.
- Solo se evaluó en inglés; el comportamiento en otros idiomas es desconocido.
- Riesgo de alucinación no cuantificado en la información disponible, pero esperable en un modelo de 3B con fine-tune de persona.
- El autor declara que no fue entrenado ni seleccionado para cumplir peticiones dañinas y que no elimina los comportamientos de seguridad del modelo base; aun así, su uso en producción requiere validación propia de salvaguardas.
- Licencia Apache-2.0, que permite uso comercial, pero el propósito declarado es la investigación sobre personas; no se recomienda su despliegue en atención al cliente ni en aplicaciones orientadas al usuario final.
- Sesgos conocidos: no documentados en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Osye/SmolLM3-3B-Malevolent
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Variante relacionada: https://huggingface.co/Osye/Qwen3.5-4B-Malevolent
- Variante relacionada: https://huggingface.co/Osye/Qwen3-4B-Instruct-2507-Malevolent
