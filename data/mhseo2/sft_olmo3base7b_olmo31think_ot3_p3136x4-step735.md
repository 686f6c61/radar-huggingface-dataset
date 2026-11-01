# mhseo2/sft_olmo3base7b_olmo31think_ot3_p3136x4-step735

## Resumen

`sft_olmo3base7b_olmo31think_ot3_p3136x4-step735` es un ajuste fino supervisado (SFT) del modelo base Olmo-3-1025-7B, desarrollado por el usuario `mhseo2` y publicado en HuggingFace bajo licencia Apache 2.0. El objetivo es destilar trazas de razonamiento matemático del modelo `allenai/Olmo-3.1-32B-Think` (un modelo mucho mayor) sobre el modelo base de 7B, usando como fuente de prompts el conjunto OpenThoughts3. Se trata, por tanto, de un experimento de destilación de razonamiento en el dominio de las matemáticas competitivas.

El checkpoint publicado corresponde al paso 735 de entrenamiento, que equivale a la época 15 de 15 (49 pasos por época). El modelo tiene 7.298.011.136 parámetros (aproximadamente 7,3B) en formato safetensors, con un repositorio de 14,6 GB, lo que corresponde a pesos en precisión completa (probablemente bfloat16 o float16). La arquitectura subyacente es la del transformer denso de Olmo 3, aunque la model card no detalla sus especificaciones internas.

La relevancia de este modelo es doble: por un lado, demuestra que es posible transferir capacidades de razonamiento matemático desde un modelo de 32B a uno de 7B mediante SFT con trazas de razonamiento filtradas con criterios estrictos; por otro, forma parte del ecosistema abierto Olmo, lo que permite inspeccionar y reproducir el proceso completo de entrenamiento. Los resultados en AIME 2025 (40,83%), AIME 2026 (47,50%) y HMMT Feb 2025 (25,83%) son modestos pero no triviales para un modelo de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Olmo 3; detalles internos no disponibles) |
| Parametros totales | 7.298.011.136 (~7,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (límite usado en entrenamiento y evaluación; la ventana nativa del modelo base no se especifica) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | No disponible (la model card no lo especifica; presumiblemente inglés, dado el dataset de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards) + tokenizer.json, merges.txt, vocab.json, chat_template.jinja |

## Arquitectura y entrenamiento

El modelo parte de `mhseo2/Olmo-3-1025-7B-opd`, un checkpoint base de la familia Olmo 3 de 7B parámetros. Sobre él se aplica un ajuste fino supervisado (SFT) estándar, sin que la model card indique el uso de RLHF, DPO u otras etapas de alineamiento posteriores. El entrenamiento se realizó con FSDP sobre 2 nodos de 4 GPU H100 cada uno (8 H100 en total) en el supercomputador BSC MareNostrum 5, con paralelismo de secuencia Ulysses (SP 2).

Los datos de entrenamiento provienen del brazo `p3136x4`: 3.136 prompts matemáticos de OpenThoughts3, cada uno con 4 trayectorias generadas por `allenai/Olmo-3.1-32B-Think`, lo que da 12.544 muestras y aproximadamente 225 millones de tokens. Las trayectorias se filtraron con criterios estrictos: debían finalizar correctamente, cerrar la etiqueta `</think>` una sola vez y contener una respuesta en caja tras ella, todo dentro de 32.768 tokens. Además, se aplicó descontaminación de 10-gramas contra AIME 2025, AIME 2026 y HMMT Feb 2025 para evitar filtración de los conjuntos de evaluación. El entrenamiento usó batch de 256, tasa de aprendizaje de 8e-5 con decaimiento coseno hasta 4e-5, warmup del 3%, weight decay de 0,01 y 49 pasos por época.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con trazas de razonamiento delimitadas por `</think>` y respuesta final en formato de caja (`\boxed{}`).
- Resolución de problemas de competición matemática (AIME, HMMT) en el rango de dificultad evaluado.
- Razonamiento multi-paso con cadenas de pensamiento largas (hasta 32.768 tokens de respuesta).
- Capacidad de seguir la plantilla de chat específica del modelo (`chat_template.jinja` incluida en el repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o multi-step tool use: no disponible.
- Capacidades multilingües: no disponibles; el entrenamiento se limita a prompts matemáticos en inglés.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- **Generación de soluciones matemáticas paso a paso en entornos educativos**: el modelo produce trazas de razonamiento explícitas y una respuesta final en formato de caja, lo que facilita su integración en plataformas de tutoría automática que necesitan mostrar el desarrollo, no solo el resultado.
- **Evaluación automática de problemas de competición**: puede usarse como generador de soluciones candidatas para conjuntos tipo AIME u HMMT, con muestreo múltiple (mean@8) y verificación posterior mediante `math_verify`, tal como se hizo en la evaluación del autor.
- **Destilación de razonamiento como referencia metodológica**: sirve como ejemplo reproducible de cómo transferir trazas de un modelo de 32B a uno de 7B con filtrado estricto y descontaminación, útil para investigadores que quieran replicar el pipeline.
- **Generación de datos sintéticos matemáticos**: las trayectorias generadas por el modelo pueden servir como datos de entrenamiento para modelos más pequeños o para aumentar la cobertura de un dataset de razonamiento, siempre que se filtren y verifiquen.
- **Investigación sobre formatos de razonamiento**: al usar una etiqueta `</think>` explícita y respuestas en caja, es un candidato para estudiar cómo el formato de las trazas afecta a la precisión final en tareas matemáticas.
- **Prototipado de asistentes de resolución de problemas en local**: con 7,3B parámetros y pesos safetensors, puede desplegarse en una GPU de 24 GB en bfloat16 (o menos con cuantización externa) para pruebas de concepto de asistentes matemáticos sin depender de APIs.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Métrica: precisión media@8 (%), temperatura 0,6, top_p 0,95, prompt de 768 tokens y respuesta de 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutado en NVIDIA B200 en float16.

| Benchmark | Resultado |
|---|---|
| AIME 2025 | 40,83 |
| AIME 2026 | 47,50 |
| HMMT Feb 2025 | 25,83 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible, ni comparaciones directas con modelos similares en la model card.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en bfloat16/float16, los 7,3B parámetros ocupan aproximadamente 14,6 GB, por lo que se necesitan al menos 16 GB de VRAM para cargar los pesos, más overhead para el contexto (hasta 32.768 tokens de respuesta). Con cuantización externa a 8 bits bajaría a ~7,3 GB y a 4 bits a ~3,7 GB, aunque el autor no publica versiones cuantizadas.
- **GPU recomendadas**: H100 o B200 para el régimen de evaluación completo (32.768 tokens de respuesta); A100 80 GB también es adecuada. En consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede cargar los pesos en bfloat16, pero el contexto largo puede requerir cuantización o reducción de la ventana.
- **¿Cabe en consumer GPU?**: sí, en GPUs de 24 GB en bfloat16 con contexto moderado; para contexto completo de 32.768 tokens conviene cuantizar o usar GPUs con más memoria.
- **Opciones de despliegue**: vLLM, TGI y llama.cpp son compatibles con safetensors de transformers; Ollama requeriría conversión a GGUF (no publicada por el autor).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME 2025 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sft_olmo3base7b_olmo31think_ot3_p3136x4-step735 | 7,3B | 32.768 (entrenamiento) | 40,83 | Apache 2.0 | HuggingFace |
| Olmo-3-1025-7B (base) | ~7B | No disponible | No disponible | Apache 2.0 (presumible) | HuggingFace |
| Olmo-3.1-32B-Think (profesor) | 32B | No disponible | No disponible en la información | No disponible | HuggingFace |
| Alternativas de 7B con razonamiento matemático | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa se limita al resultado del modelo evaluado.

## Limitaciones y advertencias

- **Especialización estrecha**: el entrenamiento se limita a prompts matemáticos de OpenThoughts3; el rendimiento en otras tareas (código, texto general, conversación) no está evaluado y probablemente sea inferior al del modelo base.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos; el formato de respuesta en caja no garantiza corrección matemática.
- **Idioma**: no hay evidencia de capacidades multilingües; el uso en castellano no está validado.
- **Contexto**: el límite de 32.768 tokens se aplica al entrenamiento y a la evaluación; superar esa ventana puede degradar el rendimiento o fallar.
- **Sesgos**: no se han documentado análisis de sesgos; al derivar de Olmo 3 y de trazas generadas por un modelo mayor, puede heredar sesgos de ambos.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base y el profesor pueden tener condiciones adicionales que conviene verificar antes de producción.
- **Madurez**: el repositorio tiene 31 descargas y 0 likes, y fue creado en octubre de 2026; es un experimento de investigación, no un modelo validado para producción.
- **Sin cuantizaciones oficiales**: no se publican versiones GGUF ni AWQ/GPTQ, lo que obliga a convertir los pesos para despliegues ligeros.

## Enlaces

- HuggingFace: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p3136x4-step735
- Modelo base: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset OpenThoughts3: no disponible en la información proporcionada
- Paper de Olmo 3: no disponible en la información proporcionada
- Repositorio de código `mopdRL` (referenciado en la model card): no disponible como enlace directo en la información proporcionada
