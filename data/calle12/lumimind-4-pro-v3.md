# cAlle12/LumiMind-4-Pro-V3

## Resumen

LumiMind 4 Pro V3 es un adaptador LoRA publicado por el usuario cAlle12 sobre el modelo base `unsloth/gemma-4-E4B-it`, una copia de la variante instruct de Google Gemma 4 E4B. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (rank 16, alpha 16) que debe combinarse con el modelo base en precisión bf16 para su uso. El repositorio ocupa aproximadamente 0,2 GB y contiene únicamente el adaptador en formato safetensors.

El adaptador se entrenó con QLoRA y Unsloth sobre 1.187 ejemplos de entrenamiento y 85 de validación, cubriendo matemáticas, código, lógica, ciencia, seguimiento de instrucciones y sueco. Las respuestas de entrenamiento fueron generadas por el propio Gemma 4 E4B y filtradas mediante comprobaciones automáticas (coincidencia con la respuesta conocida, tests unitarios, reglas de formato). El autor declara explícitamente que el objetivo era estabilizar el formato de respuesta y el sueco, no mejorar el razonamiento matemático.

La relevancia del modelo es limitada: las mediciones publicadas por el propio autor muestran que la diferencia frente al modelo base en GSM8K está dentro del margen de error estadístico. Es un ejemplo de adaptador de bajo coste orientado a formato e idioma sueco, con licencia Apache 2.0 y sujeto además a la política de uso prohibido de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E4B; rango 16, alpha 16, sin dropout |
| Parametros totales | no disponible (solo se publica el adaptador; el modelo base es Gemma 4 E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso secuencias de 2048 tokens) |
| Tipos de cuantizacion | entrenado sobre base 4-bit (QLoRA); pensado para aplicarse sobre base bf16; no se listan GGUF ni otras cuantizaciones del adaptador |
| Idiomas soportados | ingles (en), sueco (sv) |
| Licencia | Apache 2.0 (sujeta ademas a la politica de uso prohibido de Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA con Unsloth sobre el modelo base cuantizado a 4 bits. La configuración es rango 16, alpha 16, sin dropout, 148 pasos (2 épocas), tasa de aprendizaje 8e-5 con schedule coseno, tamaño de lote efectivo 16 y longitud de secuencia 2048. Se parte de un adaptador nuevo, no de una continuación de versiones anteriores. El modelo base es `unsloth/gemma-4-E4B-it` en la revisión `4e22d7e59e078e63a14f351efdc5232ed366b621`.

El conjunto de entrenamiento consta de 1.187 ejemplos: 391 de matemáticas, 150 de código, 183 de seguimiento de instrucciones, 117 de lógica, 103 de ciencia, 168 de sueco y 75 de matemáticas en sueco. Los prompts proceden de los splits de entrenamiento de GSM8K y MATH (matemáticas), ARC (ciencia) y MBPP (código), más puzles lógicos generados proceduralmente, prompts de instrucciones con restricciones de formato y prompts en sueco. Las respuestas fueron generadas por el propio Gemma 4 E4B y se conservaron solo si pasaban una comprobación automática. Se verificó y eliminó el solapamiento con los conjuntos de test. No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en inglés y sueco, heredada del modelo base Gemma 4 E4B instruct.
- Razonamiento matemático básico y resolución de problemas tipo GSM8K, con formato de respuesta estabilizado por el entrenamiento.
- Generación de código a partir de prompts, con ejemplos derivados de MBPP.
- Razonamiento lógico y científico a nivel de los conjuntos ARC y puzles procedurales.
- Seguimiento de instrucciones con restricciones de formato (el adaptador se ajustó específicamente para ello).
- Respuestas en sueco, incluyendo matemáticas en sueco.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada (dependería del modelo base, no documentado aquí).

## Casos de uso

- Asistente conversacional en sueco: el adaptador se entrenó con 168 ejemplos de sueco y 75 de matemáticas en sueco, por lo que es adecuado para respuestas en ese idioma con formato consistente, partiendo del modelo base Gemma 4 E4B.
- Formateo estricto de respuestas en pipelines: al haberse ajustado con prompts de instrucciones y restricciones de formato, puede usarse donde se requiera una salida estructurada y predecible, aunque sin garantías formales.
- Prototipado rápido de asistentes de matemáticas escolares: con 391 ejemplos de matemáticas y formato de respuesta final estabilizado, sirve para demos de resolución de problemas de nivel GSM8K, asumiendo la precisión del modelo base.
- Generación de código en entornos de bajo recursos: el adaptador es ligero (0,2 GB) y se aplica sobre una base de 4 bits, por lo que puede desplegarse en una GPU de consumo como la RTX 3050 de 8 GB usada en la evaluación.
- Investigación sobre fine-tuning con datos autogenerados: es un caso de estudio reproducible de QLoRA con filtrado automático de respuestas y verificación de solapamiento con test.
- Experimentos de adaptación de idioma de bajo coste: útil para comparar el comportamiento del modelo base frente al adaptador en sueco, dado que el autor no incluye test específico de idioma.

## Benchmarks y rendimiento

| Test | LumiMind 4 Pro V3 | Gemma 4 E4B sin adaptador |
|---|---:|---:|
| GSM8K, 1.319 preguntas, solo respuesta final (sin razonamiento) | 230 correctas (17,4 %) | 225 correctas (17,1 %) |
| GSM8K, 20 preguntas con razonamiento (límite 1.024 tokens) | 16 correctas (80 %) | 16 correctas (80 %) |

Medido en una RTX 3050 (8 GB) contra los mismos pesos base sin adaptador, en el mismo proceso. El autor indica que la diferencia está dentro del azar y que el adaptador no mejora de forma medible las matemáticas. Con 20 preguntas la incertidumbre es de aproximadamente ±22 puntos porcentuales. Como referencia, la puntuación publicada de Gemma 4 E4B en GSM8K es 77,2 % (500 preguntas).

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa unos 0,2 GB; la VRAM real la determina el modelo base Gemma 4 E4B. La evaluación se realizó en una RTX 3050 de 8 GB con la base en 4 bits.
- GPU recomendadas: RTX 3050 (8 GB) es suficiente según la evaluación del autor; para base en bf16 se requiere más VRAM, no cuantificada en la información disponible.
- Cabe en GPU de consumo: sí, al menos con base 4-bit en 8 GB según la medición publicada.
- Opciones de despliegue: transformers + PEFT (el método documentado en la model card); vLLM, llama.cpp, Ollama o TGI no se mencionan para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LumiMind 4 Pro V3 | adaptador LoRA sobre Gemma 4 E4B | no disponible | 17,4 % (sin razonamiento, 1.319 preguntas); 80 % (20 preguntas con razonamiento) | Apache 2.0 | Hugging Face |
| Gemma 4 E4B (base, sin adaptador) | no disponible | no disponible | 17,1 % (mismas condiciones); 77,2 % publicado (500 preguntas) | Apache 2.0 | Hugging Face |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor reconoce que el adaptador no mejora de forma medible las matemáticas; la diferencia en GSM8K está dentro del azar.
- No se incluyen tests de formato de respuesta ni de sueco, que son los objetivos declarados del ajuste; su eficacia no está cuantificada.
- El conjunto de entrenamiento es pequeño (1.187 ejemplos) y las respuestas fueron generadas por el propio modelo base, lo que puede reforzar sesgos y errores existentes.
- Riesgo de alucinación inherente al modelo base Gemma 4 E4B; no se documentan mitigaciones específicas.
- Idiomas limitados a inglés y sueco; no hay soporte documentado de otros idiomas.
- Longitud de contexto del modelo base no indicada en la información proporcionada; el entrenamiento usó secuencias de 2048 tokens.
- Licencia Apache 2.0, pero el uso de Gemma está sujeto además a la política de uso prohibido de Google; conviene revisarla antes de un despliegue comercial.
- Solo se publica el adaptador: es imprescindible descargar el modelo base `unsloth/gemma-4-E4B-it` en la revisión indicada.
- Repositorio sin descargas ni likes en el momento de la consulta; no hay validación externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/cAlle12/LumiMind-4-Pro-V3
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- SHA-256 del adaptador (`adapter_model.safetensors`): `e67b1b6d2e283d518168773515161bf765e807787a15e730a4108bcfb6023af2`
- Revisión del modelo base: `4e22d7e59e078e63a14f351efdc5232ed366b621`
- Política de uso prohibido de Gemma: no disponible en la información proporcionada (enlace no incluido en la model card)
