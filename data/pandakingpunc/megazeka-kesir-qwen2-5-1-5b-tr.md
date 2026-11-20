# pandakingpunc/megazeka-kesir-qwen2.5-1.5b-tr

## Resumen

Megazeka-Kesir v1.0 es un adaptador LoRA (PEFT) entrenado sobre el modelo base `unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del Qwen2.5-1.5B-Instruct. Lo desarrolla Mustafa Karatüm (usuario `pandakingpunc`) y su propósito es muy concreto: resolver operaciones y problemas con fracciones en turco, mostrando el razonamiento paso a paso y terminando la respuesta con la línea `Sonuç: <resultado>`. El modelo cubre suma, resta, multiplicación y división de fracciones, simplificación, comparación, números mixtos, prioridad de operaciones, división por cero y problemas verbales cortos.

El adaptador se entrenó con QLoRA (rango 16, alfa 32) sobre 18.000 ejemplos, de los cuales 2.084 contenían únicamente símbolos matemáticos, durante 2.250 pasos en una única RTX 4060 de 8 GB, en aproximadamente 1 hora y 45 minutos. La ventana de contexto usada en entrenamiento fue de 1.792 tokens. Es un proyecto de nicho, de un solo autor, orientado a demostrar que un modelo pequeño ajustado con QLoRA puede resolver una tarea matemática acotada en un idioma concreto con recursos de consumo.

Su relevancia es limitada pero ilustrativa: muestra el patrón de especialización mediante adaptadores de bajo rango sobre modelos de 1.5B, con licencia Apache-2.0 y pesos publicados como safetensors. No es un modelo de propósito general ni compite con modelos frontera; es una pieza de una familia de adaptadores del mismo autor (Megazeka, Megazeka-Sayı, Megazeka-Denklem) centrados en tareas lingüísticas y matemáticas en turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre modelo base cuantizado a 4 bits |
| Parametros totales | Aproximadamente 1.5B en el modelo base; el adaptador LoRA añade un conjunto reducido de parametros (rango 16, alfa 32), no cuantificado en la informacion disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.792 tokens usados en entrenamiento; el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens segun la documentacion de Qwen, aunque el adaptador no fue entrenado para ese rango |
| Tipos de cuantizacion | Base en 4 bits (bnb-4bit, via bitsandbytes); el adaptador se publica en safetensors sin cuantizar segun la informacion disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 (adaptador); codigo GitHub MIT; dataset original CC0-1.0 |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se descarga en formato bnb-4bit |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5 con atención causal estándar y RoPE. El entrenamiento se realizó con QLoRA: el modelo base se cargó cuantizado a 4 bits (bnb-4bit) y se entrenó un adaptador de rango 16 con alfa 32, tasa de aprendizaje 0,0002 y tamaño de lote efectivo 16, durante 2.250 pasos y dos épocas sobre 18.000 ejemplos. La longitud máxima de secuencia fue de 1.792 tokens. El entrenamiento completo cupo en una RTX 4060 de 8 GB y duró aproximadamente 1 hora y 45 minutos.

El dataset `pandakingpunc/megazeka-kesir-tr-steps` contiene ejemplos con razonamiento paso a paso en turco; 2.084 de los 18.000 ejemplos son puramente simbólicos (sin texto verbal). El formato de salida esperado incluye la explicación del denominador común, la operación intermedia y una línea final `Sonuç: <fracción>`. No se documenta en la información disponible el uso de RLHF o DPO; el ajuste parece ser supervisado (SFT) sobre pares pregunta-respuesta con trazas de razonamiento.

## Capacidades

- Resolución de operaciones con fracciones en turco: suma, resta, multiplicación y división.
- Simplificación de fracciones y comparación entre fracciones.
- Operaciones con números mixtos (tam sayılı kesirler).
- Prioridad de operaciones en expresiones con fracciones.
- Detección y explicación de la división por cero.
- Problemas verbales cortos con fracciones.
- Generación de razonamiento paso a paso en turco, con formato de salida estructurado que termina en `Sonuç: ...`.
- Generación de texto condicionada por plantilla de chat (chat template de Qwen2.5).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento extendido en la información disponible.

## Casos de uso

- Tutor de fracciones para estudiantes turcoparlantes: el modelo explica el denominador común, muestra la operación y cierra con el resultado, lo que encaja en aplicaciones educativas de refuerzo escolar. Su contexto de 1.792 tokens es suficiente para problemas de una sola expresión.
- Corrección automática de ejercicios de fracciones: se puede integrar en un pipeline que reciba la expresión del alumno y compare la línea `Sonuç:` con la respuesta esperada, usando decodificación greedy (`do_sample=False`) para obtener salidas deterministas.
- Generación de material didáctico: producir soluciones paso a paso para bancos de ejercicios de primaria y secundaria en turco, con revisión humana posterior dada la tasa de error observada.
- Asistente embebido en entornos sin conectividad: al ejecutarse sobre una GPU de consumo de 8 GB, puede desplegarse localmente en un aula o dispositivo sin depender de APIs externas.
- Preprocesamiento en pipelines de evaluación matemática: como primer paso para normalizar y resolver expresiones simbólicas antes de pasarlas a un modelo mayor o a un motor CAS.
- Demostración de ajuste fino con QLoRA: sirve como referencia reproducible para desarrolladores que quieran especializar un modelo de 1.5B en una tarea acotada con una sola GPU de consumo.
- Filtrado y clasificación de problemas verbales: el modelo puede identificar la operación adecuada en problemas cortos, aunque con riesgo de elegir la operación incorrecta según la model card.

## Benchmarks y rendimiento

| Medición | v1.0 |
|---|---|
| Explicación en turco en 24 preguntas cortas previas | 24/24 |
| Explicación en turco en 24 preguntas simbólicas del nuevo examen | 24/24 |
| Valor final correcto en 24 preguntas simbólicas del nuevo examen | 21/24 |
| Valor final correcto en 120 preguntas nuevas | 103/120 (85,8 %) |
| Puntuación estándar en 120 preguntas antiguas | 101/120 |
| Puntuación estándar en 600 preguntas sintéticas antiguas | 576/600 (96 %) |

La model card indica que en el nuevo examen 20 respuestas contenían al menos una igualdad intermedia incorrecta, y que el modelo puede llegar a `210/1260` y simplificar erróneamente a `1/10` en lugar de `1/6`. También se observaron fallos al elegir la operación en problemas verbales y repeticiones en soluciones largas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con el base en 4 bits y el adaptador en bf16; el autor ejecuta el ejemplo en una RTX 4060 de 8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el base cuantizado a 4 bits; RTX 4060, RTX 3060, RTX 4090, A100 y H100 son suficientes. El entrenamiento se realizó en una RTX 4060.
- Cabe en GPU de consumo: sí, en tarjetas de 6-8 GB como RTX 3060, RTX 4060 o RTX 2060.
- Opciones de despliegue: Transformers + PEFT + bitsandbytes (documentado por el autor), Accelerate; vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput: no disponibles. El ejemplo del autor usa `do_sample=False` y `max_new_tokens=1500`, lo que sugiere generaciones largas de razonamiento paso a paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Megazeka-Kesir v1.0 | ~1.5B (base) + LoRA | 1.792 tokens (entrenamiento) | Fracciones en turco paso a paso | Apache-2.0 | Hugging Face, adaptador PEFT |
| Qwen2.5-1.5B-Instruct | 1.5B | Hasta 32.768 tokens | Instrucción general multilingüe | Apache-2.0 | Hugging Face |
| Megazeka-Denklem v1.0 (mismo autor) | ~1.5B (base) + LoRA | No disponible | Ecuaciones lineales de primer grado en turco | Apache-2.0 | Hugging Face |
| Megazeka (corrector ortográfico, mismo autor) | Base ByT5 | No disponible | Corrección ortográfica en turco | No disponible | Hugging Face, GitHub |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación se limita a parámetros, contexto, enfoque y licencia.

## Limitaciones y advertencias

- Tasa de error no trivial: 85,8 % de acierto en el conjunto nuevo de 120 preguntas, con errores de simplificación (por ejemplo, `210/1260` simplificado a `1/10` en lugar de `1/6`).
- Errores en pasos intermedios: 20 de las respuestas del nuevo examen contenían al menos una igualdad intermedia incorrecta, aunque el valor final fuese correcto.
- Problemas verbales: puede seleccionar la operación equivocada y entrar en repeticiones en soluciones largas.
- Idioma: entrenado únicamente en turco; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto limitado en entrenamiento (1.792 tokens); no se ha validado el adaptador con secuencias más largas aunque el base soporte hasta 32.768.
- Proyecto de un solo autor, con 0 descargas y 0 likes en el momento de la consulta; sin validación externa ni mantenimiento garantizado.
- Licencia Apache-2.0 permite uso comercial del adaptador, pero conviene verificar las condiciones del modelo base y del dataset (CC0-1.0 para el dataset original, MIT para el código de GitHub).
- Riesgo de alucinación en la explicación del razonamiento: el formato paso a paso puede presentar pasos plausibles pero matemáticamente incorrectos.
- No apto como calculadora de producción sin verificación programática del resultado final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pandakingpunc/megazeka-kesir-qwen2.5-1.5b-tr
- Dataset de entrenamiento: https://huggingface.co/datasets/pandakingpunc/megazeka-kesir-tr-steps/tree/v1.0
- Repositorio GitHub: https://github.com/pandakingpunc/megazeka-kesir/tree/v1.0
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Qwen2.5-1.5B-Instruct (original): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Modelo hermano Megazeka-Denklem: https://huggingface.co/pandakingpunc/megazeka-denklem-qwen2.5-1.5b-tr
- Repositorio GitHub de Megazeka: https://github.com/pandakingpunc/megazeka
- ORCID del autor: https://orcid.org/0009-0006-7053-2872
