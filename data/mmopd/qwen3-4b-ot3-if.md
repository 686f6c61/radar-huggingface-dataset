# MMOPD/Qwen3-4B-OT3-if

## Resumen

Qwen3-4B-OT3-if es un modelo de generación de texto de 4.022.468.096 parámetros (aproximadamente 4,02 B) desarrollado por MMOPD como parte de su estudio MMOPD. Se trata del "teacher" de instruction-following (IF) de esa familia: parte del checkpoint `MMOPD/Qwen3-4B-OT3-2ep`, perteneciente a la familia Qwen3, y se ha afinado con aprendizaje por refuerzo GRPO sobre prompts con restricciones de formato y contenido verificables mediante comprobadores programáticos al estilo IFEval.

Su relevancia está en el salto que consigue en el cumplimiento de instrucciones sin reentrenar el modelo desde cero: sube IFEval de 51,0 a 79,1 y IFBench de 27,7 a 58,7 según la model card, manteniendo el rendimiento en matemáticas y código. El entrenamiento emplea NeMo-RL 0.7, 200 pasos de RL, 64 prompts con 8 muestras por paso, learning rate 3e-6, sin penalización KL y rollouts de 32.768 tokens a temperatura 1,0. El pool de entrenamiento son 11.728 prompts del subconjunto de instrucciones verificables de los datos Nemotron RL, decontaminados frente a IFEval e IFBench.

Los pesos se publican en bfloat16 (convertidos desde los pesos maestros de entrenamiento en fp32) bajo licencia Apache-2.0, con la librería transformers y compatibilidad declarada con text-generation-inference y endpoints. El modelo conserva la plantilla de chat y el formato de pensamiento de Qwen3 (`<think> ... </think>` antes de la respuesta), por lo que se recomienda usar `enable_thinking=True` y muestreo, no decodificación voraz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3 (según etiquetas y model card); no se especifica en la información disponible si es densa o MoE, y no se declaran parámetros activos |
| Parámetros totales | 4.022.468.096 (≈4,02 B), dato real de safetensors |
| Parámetros activos | No aplica (no se declara configuración MoE) |
| Longitud de contexto | No disponible como especificación oficial del modelo; el entrenamiento de RL usó rollouts de 32.768 tokens y la receta de despliegue documentada con vLLM emplea `--max-model-len 40960` |
| Tipos de cuantización | No disponible; los pesos publicados están en bfloat16 y la ficha no documenta versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Inglés (`en`) según los metadatos; la ficha no documenta otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16), librería transformers; tamaño del repositorio 8,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura y la plantilla de chat de Qwen3 a través de su inicialización desde `MMOPD/Qwen3-4B-OT3-2ep`. Mantiene el formato de pensamiento de Qwen3, con un bloque `<think> ... </think>` previo a la respuesta final, y no introduce cambios arquitectónicos documentados: la innovación del trabajo está en el procedimiento de ajuste, no en el diseño de la red. La model card no detalla el número de capas, cabezas de atención, dimensión oculta ni si se aplican mecanismos de atención lineal o decodificación especulativa.

El entrenamiento es un RL con GRPO (NeMo-RL 0.7, 200 pasos, 64 prompts × 8 muestras por paso, learning rate 3e-6, sin penalización KL, rollouts de 32.768 tokens a temperatura 1,0) sobre 11.728 prompts del subconjunto de instrucciones verificables de Nemotron RL, decontaminados contra IFEval e IFBench. La recompensa es binaria: se exige que se satisfagan todas las instrucciones verificables del prompt, evaluadas con los comprobadores del registro de instrucciones de IFEval aplicados sobre la respuesta posterior al bloque de pensamiento. El checkpoint publicado corresponde al paso 200 de RL. No se documenta RLHF, DPO ni una fase de alineación adicional.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen3 y modo de razonamiento explícito (`enable_thinking=True`).
- Cumplimiento estricto de instrucciones verificables: restricciones de formato, longitud, presencia o ausencia de términos, estructura en párrafos y frases de cierre exigidas, evaluadas mediante comprobadores programáticos.
- Razonamiento matemático con presupuesto largo de generación: AIME24 59,2, AIME25 52,5 y AIME26 59,2 (avg@8, preset de pensamiento de Qwen3).
- Generación de código: LiveCodeBench v6 con 51,4 puntos.
- Conocimiento y razonamiento de dominio: MedQA 70,9, FinQA 58,6 y CaseHOLD 58,4 en la evaluación publicada.
- Capacidad de actuar como teacher de destilación: los scores de dominio se midieron a temperatura 1,0 precisamente porque ese es el régimen de muestreo en el que estos modelos sirven como profesores.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modelo dispone de cadenas de pensamiento largas (hasta 32.768 tokens de generación en la evaluación).
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Destilación de datos de instruction-following: generar trayectorias de respuesta que cumplen restricciones verificables para entrenar modelos más pequeños de la familia MMOPD (por ejemplo, los Qwen3-1.7B-OT3), aprovechando el salto de 51,0 a 79,1 en IFEval.
- Generación de datos sintéticos para ajuste supervisado: producir pares prompt-respuesta con formato controlado y verificable, donde el propio comprobador de IFEval actúa como filtro automático de calidad.
- Evaluación y ampliación de suites de instrucciones: crear conjuntos de evaluación al estilo IFEval/IFBench con restricciones programáticamente comprobables para medir a otros modelos.
- Redacción técnica con restricciones duras: descripciones de producto, textos legales o comunicaciones con límites explícitos de párrafos, palabras prohibidas y frases de cierre obligatorias, tal como ilustra el ejemplo de la model card.
- Asistente de razonamiento con dominio médico o financiero en inglés: MedQA 70,9 y FinQA 58,6 lo sitúan como base para respuestas razonadas en esos dominios, siempre con revisión humana por el riesgo de error.
- Análisis de contratos y cláusulas (CaseHOLD, 58,4): extracción y clasificación de fragmentos con formato de salida estricto, integrable en un pipeline que valide el esquema de la respuesta.
- Generación de código asistida con formato controlado: LiveCodeBench v6 de 51,4 permite usarlo en tareas de completado y explicación de código donde además hay que respetar convenciones de salida (por ejemplo, bloques delimitados o ausencia de ciertos tokens).
- Investigación en RL para cumplimiento de instrucciones: la receta completa (GRPO, recompensa verificable binaria, sin KL) es reproducible y sirve como línea base para estudiar la degradación cruzada entre IF y razonamiento.

## Benchmarks y rendimiento

Benchmarks de dominio (temperatura 1,0, top-p 1,0, presupuesto largo de generación; precisión en %), según la model card:

| Modelo | MedQA | MedXpertQA | PubMedQA | CaseHOLD | FinQA | TAT-QA (EM) |
|---|---|---|---|---|---|---|
| Qwen3-4B-OT3-if (este) | 70,9 | – | – | 58,4 | 58,6 | – |
| Qwen3-4B-OT3-2ep (init del student) | 69,8 | 13,7 | 75,2 | 63,2 | 58,3 | 24,4 |

Benchmarks generales (preset de pensamiento de Qwen3: temperatura 0,6, top-p 0,95, top-k 20; 32.768 tokens nuevos como máximo; AIME = avg@8, LiveCodeBench v6 / IFEval / IFBench = 1 muestra; puntuaciones en %):

| Modelo | AIME24 | AIME25 | AIME26 | LiveCodeBench v6 | IFEval | IFBench |
|---|---|---|---|---|---|---|
| Qwen3-4B-OT3-if (este) | 59,2 | 52,5 | 59,2 | 51,4 | 79,1 | 58,7 |
| Qwen3-4B-OT3-2ep (init del student) | 66,3 | 56,3 | 58,3 | 51,7 | 51,0 | 27,7 |

Los guiones indican valores no reportados en la información disponible, no necesariamente puntuaciones nulas. No se han publicado comparaciones con modelos externos a la familia MMOPD en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para los pesos en bfloat16: 8,04 GB (4.022.468.096 parámetros × 2 bytes). Añadir caché KV y activaciones; la información disponible no detalla número de capas ni cabezas, por lo que no puede calcularse la caché KV exacta.
- VRAM estimada si se cuantiza a 8 bits: aproximadamente 4,0 GB de pesos; a 4 bits: aproximadamente 2,0 GB. No se publican pesos cuantizados oficiales, por lo que son cifras derivadas del recuento de parámetros.
- GPU recomendadas: para bfloat16 completo, una GPU de 24 GB es suficiente para contexto moderado; con el presupuesto de 40.960 tokens de la receta de vLLM, la caché KV puede exigir 40 GB o más. GPU de centro de datos como A100 40/80 GB o H100 son adecuadas para servicio con contexto largo; en el extremo consumer, RTX 3090 o RTX 4090 (24 GB) permiten bfloat16 con contexto reducido, y tarjetas de 16 GB requieren cuantización.
- Despliegue: vLLM está documentado explícitamente (`vllm serve MMOPD/Qwen3-4B-OT3-if --max-model-len 40960`), así como transformers con `device_map="auto"` y `dtype="auto"`. Los tags incluyen text-generation-inference y endpoints_compatible. No se documentan recetas para llama.cpp, Ollama ni formatos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IFEval | IFBench | AIME24 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| MMOPD/Qwen3-4B-OT3-if | 4,02 B | 32.768 en entrenamiento; despliegue documentado a 40.960 | 79,1 | 58,7 | 59,2 | Apache-2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| MMOPD/Qwen3-4B-OT3-2ep (init) | 4,02 B (no confirmado en la ficha, es el modelo del que parte) | No disponible | 51,0 | 27,7 | 66,3 | Apache-2.0 (según la familia) | HuggingFace |
| Qwen3-4B (familia base) | ~4 B | No disponible | No disponible | No disponible | No disponible | No disponible en esta información | No disponible en esta información |
| MMOPD/Qwen3-1.7B-OT3-1ep / 2ep | ~1,7 B (según nombre) | No disponible | No disponible | No disponible | No disponible | Apache-2.0 (según la familia) | HuggingFace |

El patrón observable en la comparativa interna es un intercambio claro: el RL de instruction-following gana 28,1 puntos en IFEval y 31,0 en IFBench respecto al checkpoint inicial, pero pierde 7,1 puntos en AIME24 y 3,8 en AIME25, además de 4,8 puntos en CaseHOLD. En FinQA y LiveCodeBench v6 el rendimiento es prácticamente idéntico (+0,3 y −0,3 respectivamente).

## Limitaciones y advertencias

- Regresión en razonamiento matemático: AIME24 baja de 66,3 a 59,2 y AIME25 de 56,3 a 52,5 respecto al modelo inicial. No debe asumirse que el ajuste de IF sea neutro fuera del cumplimiento de instrucciones.
- Regresión en tareas de dominio: CaseHOLD cae de 63,2 a 58,4. Además, MedXpertQA (13,7), PubMedQA (75,2) y TAT-QA (24,4) no se reportan para el modelo final, por lo que no hay evidencia de que se mantengan.
- Idiomas: solo inglés declarado en los metadatos; no hay evaluación multilingüe.
- Riesgo de alucinación: no cuantificado en la información disponible. Un modelo de 4 B con cadenas de pensamiento largas puede producir razonamientos plausibles pero incorrectos, especialmente en dominios médicos, legales o financieros.
- Sesgos: no documentados. El ajuste se hace sobre el subconjunto de instrucciones verificables de Nemotron RL, por lo que hereda los sesgos de esa fuente y del linaje Qwen3.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, con las obligaciones habituales de conservar avisos de licencia. No se documentan restricciones adicionales.
- Coste de contexto: el presupuesto de generación documentado (hasta 32.768 tokens nuevos, ventana de servicio de 40.960) implica un consumo de memoria y de tiempo considerable; la decodificación voraz no es válida según la ficha y hay que usar muestreo (temperatura 0,6 / top-p 0,95 / top-k 20 para los benchmarks generales; temperatura 1,0 para los de dominio).
- Adopción y validación externa: el repositorio registra 0 descargas y 0 likes, y todos los resultados proceden del propio autor. No se han localizado evaluaciones independientes en la búsqueda realizada.
- Es un modelo "teacher" de destilación: su régimen de muestreo de referencia para tareas de dominio es temperatura 1,0, distinto del preset de pensamiento de Qwen3, lo que complica reproducir las cifras de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MMOPD/Qwen3-4B-OT3-if
- Modelo base (init del student): https://huggingface.co/MMOPD/Qwen3-4B-OT3-2ep
- Familia MMOPD, modelo 1ep: https://huggingface.co/MMOPD/Qwen3-4B-OT3-1ep
- Familia MMOPD, modelos de 1,7 B: https://huggingface.co/MMOPD/Qwen3-1.7B-OT3-1ep y https://huggingface.co/MMOPD/Qwen3-1.7B-OT3-2ep
- Teachers de dominio de la familia: https://huggingface.co/MMOPD/Qwen3-4B-OT3-medical, https://huggingface.co/MMOPD/Qwen3-4B-OT3-law, https://huggingface.co/MMOPD/Qwen3-4B-OT3-finance, https://huggingface.co/MMOPD/Qwen3-4B-OT3-if
- Documentación de vLLM: no disponible en la información proporcionada
- Artículo o paper del estudio MMOPD: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces recuperados correspondían a foros de soporte ajeno al ámbito de la IA.
