# ddvd233/mimiciv_rare_qwen36_27b_trainset_rl_control_resume140_global_step_280

## Resumen

El modelo `ddvd233/mimiciv_rare_qwen36_27b_trainset_rl_control_resume140_global_step_280` es un ajuste por aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.6-27B, publicado por el usuario ddvd233. No se trata de un modelo de propósito general, sino de un artefacto de investigación: el punto de control resultante de un entrenamiento con GRPO sobre el conjunto de entrenamiento de diagnósticos raros de MIMIC-IV, orientado a tareas de razonamiento médico. El repositorio contiene únicamente los pesos fusionados en bf16 y safetensors, extraídos de un checkpoint de FSDP del framework verl.

El interés técnico del artefacto es metodológico más que de producto. Forma parte del proyecto RSIMed (self-evolving data) y actúa como línea base de control: un entrenamiento de RL sobre datos reales frente al cual comparar las variantes de 27B que generan sus propias tareas. El autor documenta explícitamente que se reanudó desde el paso 140 de un experimento anterior, por lo que este checkpoint corresponde al paso 420 acumulado, con una precisión de validación en bucle de 0,400 (juez permisivo), frente al 0,407 del mejor paso de la ejecución y el 0,395 del punto de partida.

El modelo cuenta con aproximadamente 27.360 millones de parámetros y un repositorio de 54,7 GB. La model card advierte de forma explícita que no está destinado a uso clínico. Su relevancia actual es limitada para producción: no tiene descargas ni valoraciones registradas y su ventana de contexto, idiomas y composición de datos de preentrenamiento no se detallan en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.6 (etiqueta `qwen3_5` en el repo); detalles de atención, capas y tipos de capa no disponibles |
| Parámetros totales | 27.356.728.560 (≈27,36 mil millones) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos publicados en bf16; no se publican variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |
| Modelo base | Qwen/Qwen3.6-27B |
| Framework de entrenamiento | verl (FSDP), algoritmo GRPO |
| Tamaño del repositorio | 54,7 GB |
| Pipeline declarado | reinforcement-learning |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3.6 (la etiqueta del repositorio, `qwen3_5`, sugiere esa línea generacional). Dado el recuento de parámetros (27,36 mil millones) y la ausencia de cualquier mención a expertos o enrutamiento, todo apunta a un transformer denso, pero no se puede confirmar con los datos disponibles.

El entrenamiento consiste en un ajuste por RL con GRPO ejecutado con el framework verl sobre checkpoints FSDP, partiendo del modelo base Qwen/Qwen3.6-27B. Los datos de entrenamiento son el conjunto de entrenamiento de diagnósticos raros de MIMIC-IV, un corpus clínico de acceso restringido, y el autor describe el experimento como "baseline de datos auto-evolutivos", es decir, la rama de control en la que las tareas no las genera el propio modelo. La ejecución se dividió en dos tramos: el checkpoint previo llegó hasta el paso 140 y este repositorio reanuda el entrenamiento hasta el paso 280 de la nueva tanda (paso 420 acumulado). No se documentan número de tokens vistos, composición exacta del dataset, fases de SFT previas, DPO ni técnicas de decodificación especulativa. El resultado publicado es un único checkpoint fusionado a partir del estado de FSDP, lo que implica que los pesos están consolidados en formato HuggingFace estándar y no en el formato fragmentado del entrenamiento.

## Capacidades

- Generación de texto y razonamiento de propósito general heredados del modelo base Qwen/Qwen3.6-27B.
- Razonamiento clínico orientado a diagnósticos raros, que es el dominio concreto sobre el que se aplicó el RL.
- Entrenamiento con señales de recompensa basadas en validación con juez (lenient judge), lo que sugiere cierto grado de ajuste a la formulación de respuestas extensas y justificadas.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente, aunque puede heredarse del modelo base.
- Capacidades multilingües: no disponibles; el corpus MIMIC-IV está en inglés clínico estadounidense, por lo que el ajuste específico es probablemente monolingüe en la práctica.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Investigación en RL para dominios médicos: sirve como línea base de control contra la que medir variantes con datos auto-generados, replicando el protocolo GRPO sobre MIMIC-IV y comparando la precisión de validación en bucle.
- Reproducción de experimentos con verl: el checkpoint permite reanudar o auditar una ejecución de RL con FSDP, útil para grupos que estudian la estabilidad de GRPO en modelos de ~27B.
- Estudio de sobreajuste y rotación de checkpoints: la diferencia entre el mejor paso (350) y el checkpoint publicado (280) es un caso práctico para analizar la variabilidad de la señal de recompensa en RL médico.
- Evaluación de jueces automáticos en dominios clínicos: el modelo se ha puntuado con un juez permisivo, por lo que es un candidato razonable para calibrar rúbricas de evaluación frente a anotación humana.
- Extracción y razonamiento sobre notas clínicas simuladas: en entornos de investigación con datos sintéticos o desidentificados y aprobación ética, puede probarse para generar hipótesis diagnósticas sobre presentaciones atípicas.
- Docencia y formación en informática médica: uso en entornos controlados para ilustrar cómo se comporta un modelo ajustado con RL frente a uno de propósito general en preguntas de diagnóstico diferencial, siempre con supervisión experta.
- No se recomienda su uso en atención al cliente, generación de código en producción ni pipelines comerciales generales, ya que no hay evidencia publicada de rendimiento fuera del dominio de entrenamiento.

## Benchmarks y rendimiento

Los únicos datos disponibles son la métrica interna de validación en bucle del propio entrenamiento (exactitud con juez permisivo). No hay resultados de MMLU, HumanEval, GSM8K, MedQA ni MedMCQA en la información proporcionada.

| Métrica | Paso 140 (inicio) | Paso 420 / este checkpoint | Mejor paso de la ejecución (350) |
|---|---|---|---|
| Exactitud de validación en bucle (juez permisivo) | 0,395 | 0,400 | 0,407 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 55 GB solo para pesos (27,36 mil millones de parámetros × 2 bytes), más 5-15 GB adicionales entre caché KV, activaciones y overhead del runtime según longitud de contexto y tamaño de lote. Se recomienda un mínimo de 80 GB.
- VRAM en cuantización de 8 bits: en torno a 28-32 GB de pesos, viable en una GPU de 40-48 GB.
- VRAM en cuantización de 4 bits: en torno a 15-17 GB de pesos, viable en GPUs de 24 GB con contexto moderado; requiere conversión propia a GGUF/AWQ/GPTQ, ya que el repositorio solo publica bf16.
- GPUs recomendadas: H100 80 GB, A100 80 GB o A100 40 GB (con cuantización), 2× A6000/L40S 48 GB en tensor parallel, RTX 4090 o RTX 3090 de 24 GB solo con cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 de 24 GB y configuraciones similares, únicamente con cuantización de 4 bits y ventanas de contexto recortadas.
- Opciones de despliegue: vLLM y TGI para el formato safetensors bf16; llama.cpp u Ollama tras convertir a GGUF; transformers para inferencia puntual; verl para continuar el entrenamiento o reproducir el experimento.
- Latencia y throughput estimados: no disponibles. La información proporcionada no incluye mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento documentado | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (paso 420) | 27,36 mil millones | No disponible | Apache-2.0 | 0,400 de exactitud en validación en bucle | Repositorio público con 0 descargas |
| Checkpoint previo (paso 140) | 27,36 mil millones | No disponible | Apache-2.0 | 0,395 con el mismo juez | Repositorio público |
| Qwen/Qwen3.6-27B (base) | No disponible en la información | No disponible | No disponible | No disponible | Repositorio público del modelo base |
| Otros modelos médicos de ~27B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para una comparación rigurosa con alternativas de la misma categoría. Los únicos puntos de comparación verificables son el checkpoint anterior de la misma ejecución y el modelo base, cuyo rendimiento en el dominio no se reporta.

## Limitaciones y advertencias

- Uso clínico prohibido de forma explícita por el autor: la model card indica "Not for clinical use". No debe emplearse para diagnóstico, triaje ni recomendación terapéutica.
- Artefacto de investigación: entrenado sobre tareas escritas por modelos y evaluado en una única familia de benchmarks, según la propia model card, lo que limita fuertemente la generalización de los resultados.
- Riesgo de sobreajuste al conjunto de entrenamiento de MIMIC-IV: la métrica reportada es una validación en bucle del mismo experimento, no una evaluación externa ciega.
- Juez permisivo: la exactitud de 0,400 se obtiene con un juez "lenient", lo que probablemente sobreestima la calidad real de las respuestas.
- Sesgos conocidos: no documentados por el autor, pero MIMIC-IV procede de una única institución estadounidense (Beth Israel Deaconess Medical Center), con la demografía y las prácticas clínicas asociadas.
- Alucinación: riesgo alto en un modelo ajustado con RL sobre texto clínico; no se han publicado evaluaciones de fidelidad factual.
- Limitaciones de idioma: los idiomas soportados no están declarados; el dominio de ajuste es inglés clínico, por lo que el comportamiento en castellano es incierto.
- Restricciones de licencia: Apache-2.0 permite uso comercial desde el punto de vista del peso publicado, pero el modelo base puede tener sus propias condiciones y el uso comercial en el ámbito sanitario es desaconsejable por motivos de seguridad y regulatorios.
- Ausencia de adopción: 0 descargas y 0 valoraciones, sin validación independiente por parte de terceros.
- Trazabilidad: el repositorio no publica configuración de entrenamiento, hiperparámetros, recetas de datos ni scripts de evaluación, lo que dificulta la reproducibilidad.
- Metadatos anómalos: las fechas de creación y actualización (septiembre de 2026) son posteriores a la fecha actual del sistema, por lo que conviene verificar la integridad del repositorio antes de reutilizarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ddvd233/mimiciv_rare_qwen36_27b_trainset_rl_control_resume140_global_step_280
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Checkpoint previo de la misma ejecución: https://huggingface.co/ddvd233/mimiciv_rare_qwen36_27b_trainset_rl_control
- Framework verl (entrenamiento RL con FSDP): https://github.com/volcengine/verl
- Dataset MIMIC-IV (acceso restringido en PhysioNet): https://physionet.org/content/mimiciv/
- Resultados de la búsqueda web: no se ha encontrado ninguna fuente relevante sobre este modelo; los resultados devueltos corresponden a páginas de trivialidades ajenas al ámbito de la inteligencia artificial y se descartan.
