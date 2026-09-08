# code-aitazaz/roman-urdu-qlora-qwen3-8b

## Resumen

El modelo `code-aitazaz/roman-urdu-qlora-qwen3-8b` es un adaptador LoRA (QLoRA 4-bit) que ajusta el modelo base `Qwen/Qwen3-8B` para responder de forma fluida y consistente en **Roman Urdu**, es decir, urdu escrito en alfabeto latino. Lo desarrolla `code-aitazaz` y se publica en HuggingFace bajo licencia Apache-2.0 (aunque la model card indica MIT para los pesos del adaptador). El objetivo no es inyectar conocimiento nuevo, sino adaptar el estilo de salida del modelo base: Qwen3-8B a menudo responde a preguntas en Roman Urdu en inglés o en urdu con escritura árabe; este adaptador hace que la respuesta por defecto sea en Roman Urdu.

El adaptador se entrenó con un conjunto de datos pequeño (~485 ejemplos) filtrado del dataset `Redgerd/roman-urdu-alpaca-qa-mix`, tras detectar y eliminar un bug de duplicación. La técnica empleada es QLoRA con cuantización NF4 de 4 bits, rango 16, alpha 32, sobre las 7 proyecciones lineales (atención y MLP) del modelo base, durante 3 épocas con tamaño de lote efectivo de 16, en una única GPU NVIDIA T4. El repositorio ocupa 0.2 GB y contiene los pesos del adaptador en formato safetensors, no el modelo completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con adaptador LoRA (QLoRA 4-bit) |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base Qwen3-8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit NF4 (QLoRA) para el modelo base durante el entrenamiento; el adaptador no tiene cuantización propia |
| Idiomas soportados | Roman Urdu (urdu en alfabeto latino); el modelo base es multilingüe |
| Licencia | Apache-2.0 (según HuggingFace); pesos del adaptador bajo MIT según la model card |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `Qwen/Qwen3-8B`, un modelo de lenguaje denso de la familia Qwen3. En lugar de entrenar el modelo completo, se aplica QLoRA: el modelo base se carga en cuantización NF4 de 4 bits y se añaden adaptadores LoRA de rango 16 y alpha 32 sobre las 7 proyecciones lineales (atención y MLP). El entrenamiento se realizó durante 3 épocas con tamaño de lote efectivo de 16, en una única GPU NVIDIA T4, sin emplear RLHF ni DPO.

Los datos de entrenamiento proceden del dataset `Redgerd/roman-urdu-alpaca-qa-mix`, filtrado hasta ~485 ejemplos genuinamente en Roman Urdu tras detectar y eliminar un bug de duplicación en el dataset original. Según la model card, se trata de una adaptación de estilo y comportamiento, no de inyección de conocimiento: el modelo base ya posee conocimiento multilingüe, y el adaptador ajusta la salida para que por defecto sea en Roman Urdu. No se mencionan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en Roman Urdu: responde de forma fluida y consistente en urdu escrito en alfabeto latino, evitando respuestas en inglés o en escritura árabe.
- Instrucciones de chat multi-turno: usa `apply_chat_template` con mensajes de usuario y asistente, y soporta `enable_thinking=False` para desactivar el modo de razonamiento del modelo base.
- Adaptación de estilo: modifica el comportamiento por defecto de Qwen3-8B, que tiende a responder en inglés o en urdu con escritura árabe ante prompts en Roman Urdu.
- No se han documentado capacidades de tool calling, agentes, visión, audio ni funciones especiales adicionales en la información disponible.

## Casos de uso

- Atención al cliente en comunidades de habla urdu: el modelo puede gestionar consultas de usuarios que escriben en Roman Urdu (muy común en redes sociales y aplicaciones de mensajería en Pakistán), respondiendo en el mismo registro y alfabeto.
- Asistentes de voz o transcripción: al recibir texto en Roman Urdu, el modelo lo procesa y genera respuestas en el mismo formato, lo que facilita su integración en sistemas de reconocimiento de voz que producen salida en alfabeto latino.
- Generación de contenido para redes sociales: permite crear publicaciones, respuestas o comentarios en Roman Urdu de forma automática, adaptando el tono y el estilo al público que usa este sistema de escritura.
- Tutoría educativa: puede responder preguntas de estudiantes que estudian en urdu romanizado, ofreciendo explicaciones en el mismo formato de escritura y reduciendo la fricción de leer urdu en escritura árabe.
- Investigación en NLP para urdu romanizado: sirve como base para experimentos de adaptación de modelos multilingües a variantes de escritura no estándar, y para estudiar el efecto de datasets pequeños en el ajuste fino.
- Traducción y adaptación de contenido: puede usarse para convertir respuestas de un asistente genérico en Roman Urdu, siempre que se combine con el modelo base y se ajusten los parámetros de decodificación para evitar repeticiones.

## Benchmarks y rendimiento

La model card incluye resultados de ROUGE-L sobre 40 prompts de evaluación mantenidos fuera del entrenamiento, comparando el modelo base sin ajustar y el adaptador:

| Modelo | ROUGE-L Precision | ROUGE-L Recall | ROUGE-L F-measure |
|---|---|---|---|
| Base (zero-shot) | 0.194 | 0.128 | 0.095 |
| Adaptador | 0.211 | 0.174 | 0.164 |

No se han publicado resultados de benchmarks más amplios (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El entrenamiento se realizó en una única GPU NVIDIA T4 (16 GB) con QLoRA 4-bit, usando `bnb_4bit_compute_dtype=torch.float16` (no bfloat16) por compatibilidad con GPUs Turing.
- El adaptador ocupa 0.2 GB, pero la inferencia requiere cargar también el modelo base Qwen3-8B cuantizado en 4-bit.
- VRAM estimada para inferencia: no disponible; el entorno de entrenamiento en T4 sugiere que una GPU con 16 GB de VRAM es suficiente para cargar el modelo en 4-bit.
- GPU recomendadas: NVIDIA T4 (usada en entrenamiento) y GPUs con al menos 16 GB de VRAM (RTX 4080/4090, A100, H100).
- Opciones de despliegue: Hugging Face Transformers con `BitsAndBytesConfig` y `PeftModel` (código de ejemplo en la model card). No se mencionan vLLM, TGI, llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación más directa es con el modelo base `Qwen/Qwen3-8B`, ya que el adaptador se construye sobre él. Los datos de ROUGE-L muestran una mejora en recall y F-measure, pero el adaptador sigue teniendo una precisión baja y no resuelve por completo el problema de repetición en decodificación greedy. No se dispone de comparativas con otros adaptadores o modelos específicos para Roman Urdu en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | no disponible | Apache-2.0 | HuggingFace |
| Adaptador roman-urdu-qlora-qwen3-8b | Adaptador LoRA (no especificado) | no disponible | Apache-2.0 / MIT (adaptador) | HuggingFace |

## Limitaciones y advertencias

- Repetición en generaciones largas: bajo decodificación greedy simple, el adaptador puede caer en bucles de repetición literal. La model card recomienda usar `repetition_penalty≈1.2` y `no_repeat_ngram_size≈3` en la generación.
- Dataset pequeño: con ~485 ejemplos, el modelo puede sobreajustarse y generalizar mal a dominios o formulaciones fuera del conjunto de entrenamiento.
- No es una inyección de conocimiento: el adaptador no aporta información nueva; su conocimiento depende del modelo base Qwen3-8B.
- Sesgos y alucinación: el modelo puede heredar sesgos del modelo base y del dataset de entrenamiento, y como modelo generativo, existe riesgo de alucinación.
- Limitación de idioma: está optimizado para Roman Urdu; puede fallar o comportarse de forma impredecible con urdu en escritura árabe u otros idiomas.
- Licencia: la model card indica MIT para los pesos del adaptador y Apache-2.0 para el modelo base y los datos. Ambos son permisivos, pero es responsabilidad del usuario verificar la compatibilidad de las licencias en su caso de uso.
- No se han publicado evaluaciones de seguridad, alineación ni pruebas exhaustivas de robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/code-aitazaz/roman-urdu-qlora-qwen3-8b
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/Redgerd/roman-urdu-alpaca-qa-mix
- Repositorio de QLoRA: https://github.com/artidoro/qlora
