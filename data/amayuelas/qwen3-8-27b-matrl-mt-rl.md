# amayuelas/Qwen3.8-27B-MatRL-MT-RL

## Resumen

Qwen3.8-27B-MatRL-MT-RL es un ajuste fino de Qwen/Qwen3.8-27B (27.356.728.560 parámetros, 64 capas, hidden size 5120, atención híbrida lineal/completa) publicado por el usuario amayuelas. El objetivo no es un asistente generalista, sino un generador de estructuras cristalinas inorgánicas novedosas entrenado con aprendizaje por refuerzo multi-turno sobre un bucle de llamadas a herramientas. La recompensa no proviene de un modelo de preferencias humano, sino de una rúbrica ponderada que incluye relajación con un potencial interatómico aprendido (MLIP, backend `equflashv2`), validez estructural, novedad y coincidencia con propiedades objetivo.

El modelo es la variante de 27B de la serie MatRL; los brazos pequeños son Qwen3.5-4B-MatRL-MT-RL y Qwen3.5-9B-MatRL-MT-RL. Se trata de un checkpoint intermedio: paso 100 de la etapa RL 2c, aproximadamente 170 de los 400 pasos acumulados previstos. El autor lo publica explícitamente como instantánea de trabajo en progreso, con una recompensa media prácticamente plana durante esa etapa (de ~3,2 a ~3,4, dentro del ruido entre ejecuciones).

Su relevancia actual es metodológica más que de rendimiento: documenta un caso de RL con recompensa basada en simulación física para una tarea científica, con un bucle de agente de hasta 10 turnos y ocho herramientas específicas de dominio. También documenta un fallo reproducible de entrenamiento (deriva en el agrupamiento de llamadas a herramientas) que lo convierte en material útil para quien trabaje en RL multi-turno con tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida lineal/completa; clases `Qwen3_5ForConditionalGeneration`, `model_type: qwen3_5` |
| Parámetros totales | 27.356.728.560 (27,36B) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible en la ficha del modelo; durante el entrenamiento se usó `max_model_len` 32768 |
| Tipos de cuantización | No se publican cuantizaciones oficiales; el repositorio solo contiene safetensors (no hay GGUF, GPTQ ni AWQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la ficha; el autor indica que hereda la licencia de `Qwen/Qwen3.8-27B` |
| Formato de pesos | safetensors (tamaño del repositorio: 54,7 GB) |
| Capas | 64 |
| Hidden size | 5120 |
| Modelo base | `Qwen/Qwen3.8-27B` |
| Biblioteca | transformers |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B: 64 capas, hidden size 5120 y esquema de atención híbrido que combina atención lineal y atención completa. El autor advierte de un detalle práctico importante: `config.json` declara `model_type: "qwen3_5"` porque Qwen3.8 es un incremento de versión de la arquitectura Qwen3.5, no una arquitectura nueva, pero el tokenizador y la plantilla de chat son los de Qwen3.8 y difieren de los de Qwen3.5, por lo que hay que usar los ficheros incluidos en este repositorio.

El entrenamiento consta de un SFT de arranque en frío de 420 pasos sobre un corpus multi-turno filtrado a longitud de secuencia 16384 con el renderizador del propio modelo, seguido de cuatro etapas de RL: 30 pasos (etapa 1), 10 pasos (etapa 2), 30 pasos (etapa 2b) y los 100 pasos de la etapa 2c que corresponden a este checkpoint, 170 pasos de RL acumulados. El framework es prime-rl 0.7.0 con un esquema tipo GRPO y ventajas relativas de grupo, con 128 rollouts por lote, tamaño de grupo 16, sobremuestreo de 1,25, temperatura 1,15, `max_completion_tokens` 2048 y estado del optimizador en fp32 con LR constante y FSDP con offload a CPU. El hardware de entrenamiento fueron 8×H200 repartidas en 5 para el entrenador, 2 para inferencia y 1 para el pool de recompensa MLIP.

La innovación técnica central es el bucle de herramientas con recompensa física: hasta 10 turnos en los que el modelo puede llamar a `retrieve_materials`, `propose_structure`, `substitute_element`, `check_novelty`, `evaluate_structure`, `predict_band_gap`, `calculate_bulk_modulus` y `submit`. La recompensa pondera la entrega final, la validez de la estructura, la novedad, la estabilidad "honesta" tras relajación MLIP con `equflashv2`, bonus SUN, la coincidencia con la propiedad objetivo, la diversidad del grupo, la eficiencia y el formato. La mezcla de tareas cubre generación incondicional, fórmula objetivo, conjunto de elementos objetivo y objetivos condicionados por propiedades (band gap y módulo de compresibilidad).

## Capacidades

- Generación de estructuras cristalinas inorgánicas novedosas, incluyendo generación incondicional y condicionada por fórmula, conjunto de elementos o propiedades objetivo (band gap, módulo de compresibilidad).
- Razonamiento multi-turno con uso de herramientas: hasta 10 turnos de interacción con herramientas de materiales antes de presentar un candidato final.
- Llamada a funciones con un conjunto de herramientas específico de dominio (recuperación de materiales, sustitución de elementos, comprobación de novedad, evaluación estructural, predicción de band gap, cálculo de módulo de compresibilidad y envío).
- Evaluación de estabilidad estructural mediante relajación con potencial interatómico aprendido como parte del bucle de decisión.
- Generación de texto conversacional en formato de chat multi-turno (etiqueta `conversational`).
- Capacidad multimodal: no documentada. La etiqueta `image-text-to-text` aparece en los metadatos y la clase es `Qwen3_5ForConditionalGeneration`, pero la model card no describe entrenamiento ni evaluación con visión.
- Modo de pensamiento explícito: no documentado.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Búsqueda de nuevos materiales inorgánicos: el modelo puede generar candidatos de estructura cristalina para una fórmula o un conjunto de elementos dado, usando `propose_structure` y `substitute_element` para explorar el espacio composicional antes de enviar un candidato final.
- Cribado previo a simulación DFT: combinado con `evaluate_structure` y la relajación MLIP, permite descartar candidatos inestables antes de gastar horas de cálculo de primeros principios en estructuras poco prometedoras.
- Diseño condicionado por propiedades: para objetivos de band gap o módulo de compresibilidad concretos, el modelo puede iterar con `predict_band_gap` y `calculate_bulk_modulus` hasta ajustar la estructura a la propiedad buscada.
- Comprobación de novedad en pipelines de descubrimiento: el uso de `check_novelty` dentro del bucle permite integrar el modelo en flujos que necesitan evitar estructuras ya conocidas en bases de datos de materiales.
- Sustitución de elementos en estructuras conocidas: el modelo puede tomar una estructura de referencia y proponer sustituciones químicas sistemáticas con las herramientas de recuperación y sustitución, útil para explorar familias de compuestos derivados.
- Investigación sobre RL con recompensa física: el checkpoint, junto con su descripción detallada del pipeline, sirve como referencia reproducible para estudiar cómo se comporta un policy bajo recompensa basada en simulación y qué patologías aparecen en tool calling multi-turno.
- Generación de datos sintéticos para entrenamiento: las trayectorias multi-turno generadas (propuestas, evaluaciones, envíos) pueden utilizarse como corpus para ajustar modelos más pequeños de la misma familia, como los brazos de 4B y 9B.
- Prototipado en entornos con restricciones de herramienta: el modelo empaqueta varias llamadas por mensaje, lo que reduce el número de idas y vueltas cuando el orquestador cobra por turno o tiene latencia alta, a costa de necesitar un presupuesto de tokens suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas estándar de generación de materiales. El único dato cuantitativo reportado es la recompensa media de la rúbrica durante la etapa 2c, que se mantiene aproximadamente plana entre ~3,2 y ~3,4, dentro del ruido entre ejecuciones, lo que el propio autor interpreta como ausencia de convergencia en ese tramo.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 54,7 GB (tamaño del repositorio). Con caché KV y activaciones, el consumo realista se sitúa por encima de esa cifra.
- Inferencia en bf16: cabe en una GPU de 80 GB (H100 80 GB, A100 80 GB). Con 2×A100 40 GB o 4×RTX 4090 de 24 GB es viable mediante paralelismo tensorial, con la penalización de latencia correspondiente.
- Cuantización a 8 bits: aproximadamente 27-30 GB de pesos, adecuado para A100 40 GB, L40S 48 GB o similares.
- Cuantización a 4 bits: aproximadamente 14-16 GB de pesos, lo que permite ejecución en RTX 4090 o RTX 3090 de 24 GB con contexto reducido. Las cuantizaciones de 4 bits no están publicadas por el autor, por lo que habría que generarlas.
- GPU de consumo: no cabe en bf16 en ninguna GPU de consumo actual. En 4 bits sí es posible en RTX 4090/3090, con la advertencia de que el cálculo de caché KV depende del número de cabezas KV del modelo base, dato no documentado en la información disponible.
- Opciones de despliegue: transformers está documentado en la propia model card. vLLM es el motor de inferencia usado durante el entrenamiento. TGI y SGLang no están documentados para este checkpoint. llama.cpp y Ollama requerirían una conversión a GGUF que no se distribuye.
- Latencia y throughput: no disponibles. El autor solo documenta la configuración de muestreo del entrenamiento (128 rollouts por lote, `max_completion_tokens` 2048).
- Hardware de entrenamiento de referencia: 8×H200, con 5 GPUs para el entrenador, 2 para inferencia y 1 dedicada al pool de recompensa MLIP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amayuelas/Qwen3.8-27B-MatRL-MT-RL | 27,36B | No disponible (entrenado con `max_model_len` 32768) | Generación de cristales inorgánicos con RL multi-turno y herramientas | No disponible; hereda la de Qwen3.8-27B | safetensors en HuggingFace, 197 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27,36B según la ficha del derivado | No disponible | Modelo generalista, sin RL de dominio | No disponible en la información proporcionada | HuggingFace (referenciado como modelo base) |
| amayuelas/Qwen3.5-4B-MatRL-MT-RL | ~4B por nomenclatura | No disponible | Misma tarea, brazo pequeño de la serie MatRL | No disponible | HuggingFace |
| amayuelas/Qwen3.5-9B-MatRL-MT-RL | ~9B por nomenclatura | No disponible | Misma tarea, brazo intermedio de la serie MatRL | No disponible | HuggingFace |

La comparación con alternativas fuera de la familia MatRL (por ejemplo, modelos generalistas de 27B o sistemas de generación de materiales basados en difusión o VAEs) no puede elaborarse con la información disponible, ya que no se han publicado métricas comparables.

## Limitaciones y advertencias

- Checkpoint intermedio y no convergido. Corresponde al paso 100 de la etapa RL 2c, unos 170 de 400 pasos acumulados previstos, y la recompensa media es plana dentro del ruido.
- Deriva en el agrupamiento de llamadas a herramientas. A lo largo de la etapa 2c el modelo empaqueta cada vez más llamadas en un mismo mensaje: de unas 3 en el paso 1 a unas 7 en el paso 100, con lotes de hasta 27 llamadas.
- Truncamiento de la última llamada a herramienta. Alrededor del 41 % de los rollouts de este checkpoint alcanzan el límite de 2048 tokens de finalización a mitad de un lote, lo que puede producir una llamada final malformada. En producción conviene ampliar el presupuesto de finalización o limitar el número de llamadas por mensaje.
- Inestabilidad del proceso de entrenamiento. La ejecución de la etapa 2c terminó de forma prematura en el paso 122 por un timeout del motor vLLM ante prompts muy largos, consecuencia directa de la misma deriva. Este checkpoint es anterior a ese fallo.
- Riesgo de alucinación estructural. El modelo puede producir candidatos con formato correcto pero física o cristalografía inválidas. La recompensa incluye validez y estabilidad MLIP, pero un checkpoint no convergido no garantiza que estas se cumplan; cualquier candidato debe verificarse externamente.
- Sesgo de dominio. El entrenamiento se centra en cristales inorgánicos y en la mezcla de tareas descrita (incondicional, fórmula, conjunto de elementos y propiedades). El comportamiento fuera de ese dominio no está caracterizado.
- Idiomas no documentados. No hay información sobre el rendimiento más allá del inglés técnico, y la model card no declara idiomas soportados.
- Plantilla de chat específica. El modelo espera el formato multi-turno de tool calling con el que fue entrenado; hay que usar el `chat_template.jinja` incluido y no sustituirlo por el de Qwen3.5, ya que el tokenizador difiere.
- Licencia no resuelta. La ficha no indica licencia propia y remite a la del modelo base. Antes de un uso comercial hay que verificar los términos de `Qwen/Qwen3.8-27B`, que no se detallan en la información disponible.
- Capacidades multimodales no confirmadas. Pese a las etiquetas `image-text-to-text` y a la clase `Qwen3_5ForConditionalGeneration`, no hay documentación de entrenamiento o evaluación con visión.
- Contexto de entrenamiento limitado a 32768 tokens. No se documenta que el modelo soporte ventanas mayores, aunque el modelo base pudiera hacerlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amayuelas/Qwen3.8-27B-MatRL-MT-RL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Brazo de 4B de la serie MatRL: https://huggingface.co/amayuelas/Qwen3.5-4B-MatRL-MT-RL
- Brazo de 9B de la serie MatRL: https://huggingface.co/amayuelas/Qwen3.5-9B-MatRL-MT-RL
- Paper, blog o repositorio del framework prime-rl: no disponible en la información proporcionada.
- Demos o spaces: no disponible.
- Nota sobre la búsqueda web: los resultados recuperados no guardan relación con el modelo (contenido sobre routers AVM FRITZ!Box), por lo que no aportan enlaces utilizables.
