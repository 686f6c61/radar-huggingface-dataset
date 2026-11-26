# pranil00/ONIX-meditron-7b-GGUF

## Resumen

ONIX-meditron-7b-GGUF es una cuantización en formato GGUF (esquema Q5_K_M) del modelo base epfl-llm/meditron-7b, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Meditron-7b es un modelo de lenguaje de dominio médico desarrollado por EPFL LLM Team, derivado de la familia LLaMA y afinado sobre corpus biomédicos y guías clínicas. Esta publicación concreta no entrena un modelo nuevo: únicamente redistribuye los pesos del modelo base en un artefacto comprimido para ejecución local en hardware de consumo.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo médico de 7B en equipos modestos (Apple Silicon, GPUs RTX de gama media o incluso CPU) gracias a un archivo de aproximadamente 1,01 GB con cuantización de 5,5 bits por peso. Por otro, la model card contiene inconsistencias técnicas graves que el lector debe conocer antes de usarla: declara 1.500 millones de parámetros para un modelo que en origen tiene 7B, y ofrece cifras de memoria y benchmarks que no son coherentes con el tamaño real del modelo base.

Por tanto, esta ficha describe el artefacto tal como está publicado, señala explícitamente los datos no verificables y advierte de que cualquier cifra de rendimiento o de memoria debe validarse de forma independiente antes de llevarla a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia LLaMA (según model card); el modelo base Meditron-7b deriva de LLaMA-2 7B |
| Parámetros totales | La model card declara 1.498.480.640 (1,50 B), dato inconsistente con el modelo base de 7B; el valor real del base es de aproximadamente 6,7-7 B (no confirmado en la información disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | La model card indica 8.192 tokens en Apple Silicon y GPU, y 4.096 en CPU; el contexto nativo del modelo base no se especifica en la información disponible |
| Tipos de cuantización | Q5_K_M (5,5 bits por peso); no se listan otros esquemas en esta publicación |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base está orientado principalmente a inglés médico) |
| Licencia | Apache 2.0 (según metadatos de Hugging Face y model card) |
| Formato de pesos | GGUF (archivo `epfl-llm--meditron-7b-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

El artefacto es una conversión GGUF del modelo epfl-llm/meditron-7b, que pertenece a la familia LLaMA y está especializado en dominio médico. La model card de esta publicación no documenta el proceso de entrenamiento del modelo base: no se indica el número de tokens utilizados, la composición del corpus, ni si hubo fases de ajuste supervisado o preferencia (RLHF/DPO). Esa información corresponde al modelo original de EPFL, no a esta cuantización.

La única innovación técnica documentada en esta publicación es el proceso de cuantización realizado con la herramienta run-any-model, que el autor describe como un motor de optimización adaptativo al dispositivo. Según la model card, la conversión reduce el peso de 2,93 GB en FP16 a 1,01 GB en Q5_K_M (una reducción del 65,6 %), con una retención de calidad estimada del 97,5 %. Estas cifras de retención son una estimación del propio autor y no están respaldadas por una evaluación publicada.

Conviene subrayar una incoherencia relevante: la model card afirma que el modelo tiene 1,50 B de parámetros y que el archivo FP16 pesa 2,93 GB, cuando un modelo de 7B en FP16 pesaría en torno a 13-14 GB. Las cifras de memoria y de tamaño son, por tanto, internamente inconsistentes con el modelo base declarado y deben tratarse con cautela.

## Capacidades

- Generación de texto en dominio biomédico y clínico, heredada del ajuste de Meditron-7b sobre literatura médica y guías de práctica clínica.
- Respuesta a preguntas de conocimiento médico (MedQA, MedMCQA y tareas similares, según el modelo base).
- Razonamiento clínico básico y resumen de documentación médica.
- Generación de texto general, aunque con menor especialización fuera del dominio sanitario.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.
- Capacidades multilingües: no declaradas en la información disponible; el modelo base está orientado principalmente al inglés.

## Casos de uso

- Asistencia a la lectura de literatura médica: el modelo puede resumir artículos y guías clínicas en inglés, aprovechando su ajuste sobre corpus biomédicos, en equipos sin GPU dedicada gracias al tamaño reducido del GGUF.
- Prototipado de asistentes clínicos en local: útil para experimentar con pipelines de pregunta-respuesta médica en entornos de investigación con requisitos de privacidad, al ejecutarse íntegramente en el dispositivo.
- Educación y formación sanitaria: generación de explicaciones y material de repaso sobre conceptos médicos, siempre con revisión humana obligatoria por el riesgo de alucinación.
- Evaluación de técnicas de cuantización: este artefacto sirve como caso práctico para medir la degradación de calidad de Q5_K_M frente a FP16 en tareas médicas, comparando respuestas del base y de la versión cuantizada.
- Despliegue en portátiles y estaciones de trabajo modestas: con Ollama, llama.cpp o LM Studio se puede integrar un modelo médico en herramientas internas de documentación sin infraestructura de servidor.
- Investigación sobre sesgos en modelos médicos: permite reproducir y analizar comportamientos del modelo base en hardware asequible, facilitando estudios comparativos a mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una estimación interna de retención de calidad del 97,5 % y una matriz de telemetría de memoria generada por la propia herramienta run-any-model, sin resultados en conjuntos como MMLU, MedQA, HumanEval o GSM8K. No se deben extrapolar cifras de rendimiento a partir de esas estimaciones.

## Requisitos de hardware

Las cifras siguientes proceden de la model card del autor y deben considerarse orientativas, dado que están calculadas sobre un recuento de parámetros que no coincide con el modelo base de 7B:

- Apple Silicon (M1/M2/M3/M4/M5): 1,17 GB de memoria unificada según la model card, con aceleración Metal y contexto de 8.192 tokens. Para un modelo de 7B real, el requisito sería notablemente mayor (del orden de 5-6 GB en Q5_K_M).
- GPU NVIDIA (RTX 30/40/50): 2,51 GB de VRAM según la model card, con aceleración CUDA y contexto de 8.192 tokens. Para el modelo real de 7B, se necesitarían aproximadamente 6-8 GB de VRAM.
- CPU (Windows/Linux): 3,17 GB de RAM libre según la model card, con soporte AVX2/AVX-512 y contexto de 4.096 tokens.
- GPU recomendadas para el modelo de 7B real: RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM usando Q5_K_M; en GPUs de 6 GB conviene bajar a Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model. vLLM y TGI no se mencionan en la información disponible para este artefacto.
- Latencia y throughput: no disponibles; la model card no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-meditron-7b-GGUF (esta ficha) | 7B (declarado 1,5 B en la card) | 8.192 / 4.096 según dispositivo | Médico | Apache 2.0 | GGUF en Hugging Face |
| epfl-llm/meditron-7b | 7B | No disponible en la información | Médico | No disponible en la información | Pesos originales en Hugging Face |
| Meditron-70b (EPFL) | 70B | No disponible en la información | Médico | No disponible en la información | Pesos originales en Hugging Face |
| Modelos médicos abiertos de 7B en GGUF (familia BioMistral, Meditron) | 7B | Variable según publicación | Médico | Variable | Múltiples publicaciones comunitarias en Hugging Face |

No se dispone de datos de rendimiento comparativo publicados en la información proporcionada para establecer una comparación cuantitativa entre estos modelos.

## Limitaciones y advertencias

- Inconsistencia de parámetros: la model card declara 1,50 B de parámetros y un peso FP16 de 2,93 GB, cifras incompatibles con un modelo base de 7B. Cualquier estimación de memoria o rendimiento derivada de esos datos es poco fiable.
- Riesgo de alucinación elevado en contexto clínico: como todo modelo de lenguaje médico, puede generar afirmaciones plausibles pero incorrectas; no debe usarse para decisiones clínicas sin supervisión profesional.
- Sesgos de los datos de entrenamiento del modelo base: el corpus biomédico puede sobrerrepresentar determinadas poblaciones, patologías o prácticas clínicas; no se documenta ningún análisis de sesgo en esta publicación.
- Idioma: no se declaran idiomas soportados; el modelo base está orientado al inglés, por lo que el rendimiento en castellano es incierto y probablemente inferior.
- Contexto limitado: la model card indica 4.096 tokens en CPU y 8.192 en GPU/Apple Silicon, valores que no se corresponden necesariamente con el contexto nativo del modelo base.
- Licencia: se declara Apache 2.0, pero la licencia del modelo base epfl-llm/meditron-7b no se detalla en la información disponible; conviene verificar la licencia original antes de un uso comercial.
- Sin mantenimiento ni tracción: la publicación tiene 0 descargas y 0 likes, y no hay evidencia de validación por parte de la comunidad.
- Ausencia de benchmarks: no hay evaluación publicada que respalde la retención de calidad del 97,5 % ni el comportamiento del modelo cuantizado en tareas médicas.
- Descargo de responsabilidad extremo en la model card: el autor exime de toda responsabilidad sobre las salidas del modelo, lo que traslada íntegramente al implementador la validación de resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/ONIX-meditron-7b-GGUF
- Modelo base: https://huggingface.co/epfl-llm/meditron-7b
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Repositorio de la herramienta de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
