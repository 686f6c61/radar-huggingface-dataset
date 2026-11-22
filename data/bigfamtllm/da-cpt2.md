# BigFamTLLM/da-cpt2

## Resumen

`BigFamTLLM/da-cpt2` es un modelo de lenguaje de 2.115.305.088 parámetros (2,12B) construido sobre la arquitectura Qwen3 y desarrollado por el equipo BigFamTLLM en el marco del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata del segundo checkpoint de una serie de diez de entrenamiento continuado (continued pretraining, CPT) sobre el modelo danés `da-base`, previamente adaptado al noruego mediante un tokenizador específico y un entrenamiento inicial de solo embeddings (`da-emb`). El objetivo del proyecto es comparar, con la misma arquitectura y presupuesto computacional, modelos entrenados desde cero en noruego, danés y multilingüe frente a modelos adaptados de una lengua a otra.

El modelo no está ajustado por instrucciones: es un modelo base pensado para investigación en adaptación lingüística entre lenguas germánicas nórdicas. En este checkpoint se han procesado 5,62B tokens noruegos (de un total previsto de 48.600 pasos, aquí en el paso 9.720), con una mezcla de datos del corpus HPLT 4.0 compuesta por un 85% de bokmål y un 15% de nynorsk. Su relevancia es metodológica: documenta de forma granular el efecto del entrenamiento continuado y del annealing sobre el rendimiento en noruego, evaluado con NorEval 1.1.

La longitud de contexto es de 4.096 tokens, el tokenizador es noruego con 32.000 entradas y el repositorio ocupa 4,2 GB en formato safetensors. No se ha publicado licencia, lo que impide determinar las condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención, 17 cabezas KV, tied embeddings) |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (repo solo en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Noruego (bokmål `nb`, nynorsk `nn`, `no`) y danés (`da`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuración densa: 36 capas, dimensión oculta de 2.176, 34 cabezas de atención con 17 cabezas KV (GQA con ratio 2:1) y embeddings compartidos entre entrada y salida (tied embeddings). El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia de Sigma2, con longitud de secuencia 4.096, batch size 128, optimizador AdamW y tasa de aprendizaje máxima de 5e-4 con 2.000 pasos de warmup y sin decaimiento (1e-4 en la etapa de solo embeddings).

El proceso de adaptación tiene tres fases documentadas: (1) sustitución del tokenizador por uno noruego de 32.000 entradas, donde los tokens compartidos con el vocabulario original conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo; (2) 1.000 pasos de entrenamiento de solo embeddings; y (3) entrenamiento continuado sobre datos noruegos de HPLT 4.0 (85% bokmål, 15% nynorsk). Este checkpoint corresponde al paso 9.720 de 48.600 y acumula 5,62B tokens noruegos vistos. Existe además una fase de annealing de 916 pasos (0,48B tokens) con datos de alta calidad en bokmål y nynorsk y decaimiento lineal hasta cero, disponible en el checkpoint `da-cpt2-anneal`. La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto en noruego (bokmål y nynorsk) y danés, como modelo base sin ajuste por instrucciones.
- Modelado de lenguaje causal y continuación de texto; no se documenta un modo de razonamiento o "thinking" explícito.
- Capacidad multilingüe limitada a las lenguas nórdicas indicadas; no se documentan capacidades en otras lenguas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta visión, audio ni otras modalidades.
- Robustez medida frente a ruido: 0,372 en entrada limpia y −0,040 de caída media bajo ruido en tres tareas de NorEval.

## Casos de uso

- Investigación en adaptación lingüística: el checkpoint permite estudiar la curva de aprendizaje del entrenamiento continuado danés→noruego comparando los diez checkpoints de la serie y sus versiones con annealing, con métricas de NorEval 1.1 por paso.
- Evaluación de tokenizadores nórdicos: al usar un vocabulario noruego de 32.000 entradas con inicialización por media de piezas, sirve para medir el impacto del cambio de tokenizador en la perplejidad y en tareas de comprensión.
- Generación de texto en bokmål para experimentos controlados: con 4.096 tokens de contexto puede completar documentos, párrafos o titulares en noruego en entornos de laboratorio, siempre con revisión humana.
- Análisis de robustez frente a ruido: la métrica publicada de degradación bajo ruido (−0,040) permite usar el modelo como referencia en estudios de tolerancia a errores tipográficos u ortográficos en noruego.
- Línea base para fine-tuning posterior: al ser un modelo base de 2,12B con licencia no especificada, puede servir como inicialización para tareas downstream en noruego en el ámbito académico, comparando con `no-base` y `ml-base` del mismo proyecto.
- Estudio comparativo danés-noruego: al derivar de `da-base`, permite analizar transferencia interlingüística entre dos lenguas germánicas nórdicas con ortografía y morfología próximas.
- Docencia y reproducibilidad: el proyecto documenta arquitectura, hiperparámetros y datos, lo que facilita replicar el pipeline con Megatron-LM y Megatron-Bridge en entornos académicos.

## Benchmarks y rendimiento

Resultados publicados en la model card con NorEval 1.1:

| Grupo de tarea | Metrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,216 | 0,249 |
| nob_orthography | acc | 0,860 | 0,863 |
| nob_reading | f1 | 0,190 | 0,215 |
| nob_world | acc | 0,290 | 0,290 |
| nno_language | em_first | 0,337 | 0,418 |
| nno_world | acc | 0,289 | 0,301 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,372 en entrada limpia y −0,040 de media bajo ruido.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,3 GB solo para pesos (2,12B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 5 y 7 GB según longitud de secuencia y batch.
- En cuantización de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,2 GB (estimación teórica, no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 en secuencias cortas; A100, H100 o GH200 para entrenamiento y evaluación a gran escala (el entrenamiento se hizo en 8 GH200).
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores) en bfloat16 para contextos moderados; en 4 bits cabría en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (tag `text-generation-inference` en el repo) y endpoints compatibles; llama.cpp, Ollama o vLLM no se documentan para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| BigFamTLLM/da-cpt2 | 2,12B | 4.096 | No disponible | Checkpoint 2/10 de CPT danés→noruego, base, sin instrucciones |
| BigFamTLLM/no-base | No disponible en la informacion | No disponible | No disponible | Noruego entrenado desde cero, misma arquitectura y presupuesto |
| BigFamTLLM/ml-base | No disponible en la informacion | No disponible | No disponible | Multilingüe entrenado desde cero, misma arquitectura y presupuesto |
| BigFamTLLM/da-cpt2-anneal | 2,12B (misma arquitectura) | 4.096 | No disponible | Misma checkpoint con annealing de 916 pasos sobre datos de alta calidad |

La comparación con modelos externos al proyecto (por ejemplo, variantes de Qwen3 de tamaño similar o modelos nórdicos de otros autores) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable y no debe usarse como asistente conversacional sin fine-tuning previo.
- Entrenado únicamente sobre texto web de HPLT 4.0: puede reproducir sesgos, toxicidad y desinformación presentes en el corpus; el propio autor advierte de salidas erróneas u ofensivas.
- Riesgo de alucinación inherente a un modelo de 2,12B sin alineación (no se documenta RLHF ni DPO).
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a noruego y danés; no se garantiza un comportamiento correcto en otras lenguas pese a derivar de un modelo con vocabulario sustituido.
- Licencia no disponible: no puede confirmarse el uso comercial; el autor indica explícitamente que son modelos de investigación no pensados para producción.
- Es un checkpoint intermedio (paso 9.720 de 48.600): su rendimiento es inferior al de los checkpoints finales de la serie y al de las versiones con annealing.
- Sin datos publicados de cuantización, latencia ni throughput, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt2
- Modelo base inmediato: https://huggingface.co/BigFamTLLM/da-emb
- Modelo de origen danés: https://huggingface.co/BigFamTLLM/da-base
- Versión con annealing de este checkpoint: https://huggingface.co/BigFamTLLM/da-cpt2-anneal
- Noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Checkpoints CPT de la serie: https://huggingface.co/BigFamTLLM/da-cpt1, https://huggingface.co/BigFamTLLM/da-cpt3, https://huggingface.co/BigFamTLLM/da-cpt4, https://huggingface.co/BigFamTLLM/da-cpt5, https://huggingface.co/BigFamTLLM/da-cpt6, https://huggingface.co/BigFamTLLM/da-cpt7, https://huggingface.co/BigFamTLLM/da-cpt8, https://huggingface.co/BigFamTLLM/da-cpt9, https://huggingface.co/BigFamTLLM/da-cpt10
- Corpus HPLT 4.0: no disponible en la información proporcionada
- Paper o blog del proyecto: no disponible en la información proporcionada
