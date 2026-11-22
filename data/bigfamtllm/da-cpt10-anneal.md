# BigFamTLLM/da-cpt10-anneal

## Resumen

da-cpt10-anneal es un modelo de lenguaje de 2.115.305.088 parámetros (aproximadamente 2,12B) desarrollado por BigFamTLLM, un proyecto de estudiantes de la asignatura IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base (no ajustado a instrucciones) derivado de da-cpt10, que a su vez parte de da-base, un modelo entrenado desde cero en danés. El modelo ha sido adaptado al noruego mediante un tokenizador específico, entrenamiento inicial solo de embeddings y preentrenamiento continuado sobre texto noruego, y finalmente una fase de annealing sobre texto de alta calidad en Bokmål y Nynorsk.

El modelo emplea la arquitectura Qwen3 (transformer denso con 36 capas, tamaño oculto de 2176, 34 cabezas de atención con 17 cabezas KV y embeddings atados), con una longitud de contexto de 4096 tokens y un tokenizador noruego de 32k entradas. Ha visto 26,48 mil millones de tokens noruegos, una cantidad equivalente a la que vio no-base, el modelo entrenado desde cero en noruego dentro del mismo proyecto. Es relevante como ejemplo de transferencia lingüística entre lenguas germánicas escandinavas y como artefacto de investigación reproducible con presupuesto y arquitectura controlados.

La versión anneal añade 916 pasos adicionales (0,48B tokens) sobre texto de alta calidad en Bokmål y Nynorsk con decaimiento lineal de la tasa de aprendizaje hasta cero. El resultado es un checkpoint final de una familia de 50 modelos del proyecto, orientado a investigación y evaluación comparativa, no a uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención, 17 cabezas KV, embeddings atados) |
| Parámetros totales | 2.115.305.088 (≈2,12B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | No disponible (el repo contiene safetensors en bfloat16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Danés (da), noruego (no), Bokmål (nb), Nynorsk (nn) |
| Licencia | No disponible |
| Formato de pesos | safetensors (transformers) |
| Tokenizador | Noruego, 32k entradas |
| Tokens noruegos vistos | 26,48B |
| Modelo base | BigFamTLLM/da-cpt10 (finetune) |
| Tamaño del repo | 4,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuración densa: 36 capas, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (GQA) y embeddings atados entre entrada y salida. El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia de Sigma2, con longitud de secuencia 4096, batch size 128, optimizador AdamW y una tasa de aprendizaje máxima de 5e-4 con 2000 pasos de warmup y sin decaimiento (1e-4 en la etapa solo de embeddings). Los datos provienen de HPLT 4.0, con una mezcla noruega compuesta por un 85% de Bokmål y un 15% de Nynorsk.

La adaptación al noruego se articula en tres fases. Primero, se sustituye el tokenizador danés por uno noruego de 32k entradas: los tokens compartidos por ambos vocabularios conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo. Después, 1000 pasos de entrenamiento solo de embeddings. A continuación, preentrenamiento continuado hasta el paso 48.600 (checkpoint da-cpt10). Finalmente, el annealing de esta ficha: 916 pasos adicionales (0,48B tokens) sobre texto de alta calidad en Bokmål y Nynorsk con decaimiento lineal de la tasa de aprendizaje hasta 0. La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto en noruego (Bokmål y Nynorsk) y danés, al ser un modelo base sin ajuste a instrucciones.
- Modelado de lenguaje y continuación de texto; no está diseñado para seguir instrucciones ni para diálogo conversacional.
- Comprensión lectora y tareas de conocimiento del mundo evaluadas en NorEval 1.1 (grupos nob_language, nob_orthography, nob_reading, nob_world, nno_language, nno_world).
- Capacidad multilingüe limitada al eje danés-noruego; no se documenta soporte de otras lenguas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Robustez moderada frente a ruido en la entrada: 0,399 en entrada limpia y -0,044 de media bajo ruido en tres tareas de NorEval.

## Casos de uso

- Investigación en transferencia lingüística entre lenguas escandinavas: el modelo permite estudiar cómo un modelo entrenado en danés se adapta al noruego mediante cambio de tokenizador y preentrenamiento continuado, comparando con no-base y ml-base del mismo proyecto.
- Evaluación comparativa de checkpoints: al ser el checkpoint 10 de 10 con y sin annealing, sirve para medir el efecto del annealing sobre las métricas de NorEval 1.1 en un entorno controlado.
- Experimentos de tokenización: el modelo documenta la estrategia de inicialización de embeddings para tokens nuevos (media de las piezas del tokenizador antiguo), útil para reproducir y analizar este enfoque en otros pares de lenguas.
- Generación de texto en noruego para estudios lingüísticos: continuación de texto y análisis de fluidez en Bokmål y Nynorsk con un modelo de 2,12B y contexto de 4096 tokens.
- Base para ajuste fino supervisado posterior: al ser un modelo base, puede servir como punto de partida para SFT o DPO en tareas noruegas específicas, aunque el autor no lo recomienda para producción.
- Reproducibilidad de pipelines Megatron-LM a Hugging Face: el modelo ilustra el flujo de conversión con Megatron-Bridge y los ajustes de configuración necesarios para cargar en transformers 4.x.
- Docencia y formación: como artefacto de un curso universitario, es útil para enseñar el ciclo completo de entrenamiento, adaptación de tokenizador, preentrenamiento continuado y annealing con presupuesto acotado.

## Benchmarks y rendimiento

NorEval 1.1 (resultados publicados en la model card):

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,254 | 0,286 |
| nob_orthography | acc | 0,858 | 0,879 |
| nob_reading | f1 | 0,224 | 0,284 |
| nob_world | acc | 0,304 | 0,304 |
| nno_language | em_first | 0,488 | 0,551 |
| nno_world | acc | 0,319 | 0,323 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,399 en entrada limpia y -0,044 de media bajo ruido.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,3 GB solo para pesos (2,12B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contexto completo de 4096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,2 GB para pesos; en 4 bits, alrededor de 1,2 GB (no se distribuyen cuantizaciones oficiales, habría que generarlas).
- GPU recomendadas para entrenamiento o inferencia a gran escala: GH200 (usadas en el entrenamiento), A100, H100.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 4080 y GPUs con 8 GB o más en bfloat16; en 4 bits cabría en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (el modelo está etiquetado como endpoints_compatible), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se proporcionan archivos GGUF oficiales).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt10-anneal | 2,12B | 4096 | da, no, nb, nn | No disponible | Modelo base de investigación, annealing sobre noruego |
| BigFamTLLM/no-base-anneal | No disponible en esta ficha | No disponible | no, nb, nn | No disponible | Entrenado desde cero en noruego con la misma arquitectura y presupuesto |
| BigFamTLLM/da-cpt10 | 2,12B | 4096 | da, no, nb, nn | No disponible | Versión sin annealing del mismo checkpoint |
| BigFamTLLM/ml-base-anneal | No disponible en esta ficha | No disponible | Multilingüe | No disponible | Entrenado desde cero en varios idiomas con la misma arquitectura |

La comparación principal es interna al proyecto BigFamTLLM, que entrena 50 modelos con la misma arquitectura y presupuesto para aislar el efecto del idioma de origen, la adaptación y el annealing. No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste a instrucciones: no sigue instrucciones de forma fiable ni mantiene diálogos conversacionales; requiere SFT para tareas de instrucción.
- El autor advierte explícitamente que son modelos de investigación entrenados con texto web y que pueden producir salidas erróneas u ofensivas; no están pensados para producción.
- Riesgo de alucinación inherente a un modelo base de 2,12B entrenado con datos web; los resultados en NorEval son modestos (por ejemplo, nob_reading f1 de 0,224 en 0-shot y nob_world acc de 0,304).
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a danés y noruego (Bokmål y Nynorsk); no se documenta rendimiento en otras lenguas.
- Sesgos conocidos: no documentados explícitamente, pero al entrenarse con HPLT 4.0 (texto web) hereda los sesgos de esa fuente.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso más allá de la investigación.
- Robustez limitada bajo ruido: caída media de -0,044 en las tareas evaluadas con entrada ruidosa.
- No se distribuyen cuantizaciones oficiales ni archivos GGUF; el despliegue eficiente requiere conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt10-anneal
- Modelo base (checkpoint sin annealing): https://huggingface.co/BigFamTLLM/da-cpt10
- Modelo danés de partida: https://huggingface.co/BigFamTLLM/da-base
- Modelo noruego desde cero (referencia): https://huggingface.co/BigFamTLLM/no-base
- Modelo multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Repositorio de checkpoints del proyecto: https://huggingface.co/BigFamTLLM
- Dataset HPLT 4.0 (fuente de datos): no disponible enlace directo en la información proporcionada
- Paper o blog del proyecto: no disponible
- Demo: no disponible
