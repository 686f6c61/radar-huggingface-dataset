# BigFamTLLM/da-cpt4-anneal

## Resumen

da-cpt4-anneal es un modelo de lenguaje de tipo base (no ajustado a instrucciones) desarrollado por BigFamTLLM, un proyecto de estudiantes del curso IN5640 de la Universidad de Oslo. Se trata de un modelo derivado de da-base, un modelo entrenado desde cero con arquitectura Qwen3, al que se le sustituyó el tokenizador por uno noruego y se le aplicó preentrenamiento continuado sobre texto en noruego. Este checkpoint concreto es el cuarto de diez de la fase de CPT (continued pretraining) y, además, incorpora una fase de annealing sobre texto de alta calidad en bokmål y nynorsk.

El modelo resuelve el problema de adaptar un modelo originalmente danés al noruego (bokmål y nynorsk), un par de lenguas escasamente representadas en los grandes modelos multilingües. Con 2.115.305.088 parámetros (2,12B), una longitud de contexto de 4.096 tokens y un tokenizador noruego de 32.000 entradas, se posiciona como una alternativa ligera y de código abierto para investigación en procesamiento del lenguaje natural en lenguas nórdicas.

Su relevancia radica en su carácter experimental y reproducible: forma parte de una familia de 50 modelos (noruego desde cero, danés desde cero, multilingüe y sus variantes adaptadas, con y sin annealing) entrenados con la misma arquitectura y presupuesto, lo que permite estudios comparativos controlados. No es un modelo destinado a producción, sino a investigación académica sobre adaptación de lenguas y efecto del annealing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3): 36 capas, hidden size 2176, 34 cabezas de atención (17 KV heads), tied embeddings |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors en bfloat16) |
| Idiomas soportados | da, no, nb (bokmål), nn (nynorsk) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3 con 36 capas, tamaño oculto de 2176, 34 cabezas de atención con 17 cabezas KV (GQA) y embeddings atados. El entrenamiento se realizó con Megatron-LM sobre 8 GPU GH200 en el clúster Olivia (Sigma2), con longitud de secuencia de 4096, batch size de 128, optimizador AdamW y una tasa de aprendizaje máxima de 5e-4 con 2.000 pasos de warmup y sin decaimiento (1e-4 para la etapa de solo embeddings). Los datos provienen de HPLT 4.0, con una mezcla noruega compuesta por un 85% de bokmål y un 15% de nynorsk.

La adaptación al noruego se llevó a cabo mediante un cambio de tokenizador (32k entradas): los tokens compartidos por ambos vocabularios conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo, seguido de 1.000 pasos de entrenamiento solo de embeddings. Posteriormente se aplicó preentrenamiento continuado hasta este checkpoint 4 (paso 19.440 de 48.600), tras haber visto 11,20B tokens noruegos. La fase de annealing añade 916 pasos adicionales (0,48B tokens) sobre texto de alta calidad en bokmål y nynorsk con decaimiento lineal de la tasa de aprendizaje hasta 0. La conversión a formato Hugging Face se realizó con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto en noruego (bokmål y nynorsk) y danés, al ser un modelo base sin ajuste a instrucciones.
- Modelado de lenguaje y continuación de texto; no está diseñado para seguir instrucciones ni para formato conversacional.
- Capacidad de razonamiento y conocimiento del mundo limitada y no evaluada de forma específica más allá de NorEval.
- Evaluación en tareas de lengua, ortografía, lectura y conocimiento del mundo mediante NorEval 1.1.
- Robustez moderada frente a ruido en la entrada (evaluada en tres tareas de NorEval).
- No dispone de soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Capacidades multilingües limitadas a los idiomas declarados (da, no, nb, nn); no se documenta cobertura de otras lenguas.

## Casos de uso

- Investigación en adaptación de lenguas: sirve como punto de comparación controlado frente a los otros 49 modelos de la familia BigFamTLLM para estudiar el efecto del annealing y del preentrenamiento continuado en lenguas nórdicas.
- Evaluación de tokenizadores noruegos: al usar un tokenizador de 32k específico, permite analizar el impacto del vocabulario en tareas de lengua y ortografía mediante NorEval.
- Generación de texto en bokmål y nynorsk: puede emplearse para completar o generar texto en estas variedades, útil en corpus sintéticos o experimentos de aumentación de datos.
- Estudio de robustez: la evaluación con entradas ruidosas permite investigar la degradación del rendimiento en condiciones reales de texto web (0,390 en limpio, -0,047 de media bajo ruido).
- Línea base para fine-tuning posterior: al ser un modelo base de 2,12B con contexto de 4.096, puede servir como inicialización para tareas concretas de PLN en noruego (clasificación, NER, etc.) tras un ajuste supervisado.
- Docencia y reproducibilidad: su inclusión en una familia de 50 modelos con la misma arquitectura y presupuesto lo hace adecuado para prácticas de entrenamiento y evaluación de modelos de lenguaje.
- Experimentos de bajo coste en hardware académico: con 2,12B parámetros y pesos en bfloat16 (unos 4,2 GB), puede desplegarse en una única GPU para pruebas de inferencia.

## Benchmarks y rendimiento

Resultados en NorEval 1.1 publicados por el autor:

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,249 | 0,282 |
| nob_orthography | acc | 0,857 | 0,865 |
| nob_reading | f1 | 0,219 | 0,227 |
| nob_world | acc | 0,295 | 0,297 |
| nno_language | em_first | 0,456 | 0,524 |
| nno_world | acc | 0,306 | 0,309 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,390 en entrada limpia y -0,047 de media bajo ruido.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,2 GB en bfloat16 (tamaño del repo); en cuantización de 8 bits rondaría los 2,1 GB y en 4 bits alrededor de 1,1 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; el entrenamiento se realizó en 8 GPU GH200.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de 8 GB con margen ajustado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles; no se documenta soporte explícito de vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt4-anneal | 2,12B | 4.096 | da, no, nb, nn | no disponible | Modelo base de investigación, checkpoint 4/10 con annealing |
| BigFamTLLM/no-base-anneal | misma arquitectura (Qwen3) | 4.096 | no, nb, nn | no disponible | Noruego entrenado desde cero, misma familia y presupuesto |
| BigFamTLLM/da-base-anneal | misma arquitectura (Qwen3) | 4.096 | da | no disponible | Danés desde cero, misma familia |
| BigFamTLLM/ml-base-anneal | misma arquitectura (Qwen3) | 4.096 | multilingüe | no disponible | Multilingüe desde cero, misma familia |

No se dispone de datos de benchmarks comparativos frente a modelos externos a la familia en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste a instrucciones: no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- Entrenado sobre texto web (HPLT 4.0): puede generar contenido erróneo u ofensivo; el propio autor advierte que no está pensado para producción.
- Riesgo de alucinación inherente a un modelo de 2,12B sin RLHF ni DPO documentados.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística restringida a danés, noruego (bokmål y nynorsk); no se documenta rendimiento en otras lenguas.
- Licencia no disponible: no puede confirmarse el uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Rendimiento modesto en tareas de conocimiento del mundo (alrededor de 0,30 de accuracy) y de lectura (F1 en torno a 0,22), coherente con su tamaño y presupuesto de entrenamiento.
- Degradación bajo ruido de aproximadamente 0,047 puntos de media, lo que limita su uso con entradas ruidosas reales.
- Proyecto académico de un curso universitario, sin garantías de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt4-anneal
- Modelo base: https://huggingface.co/BigFamTLLM/da-cpt4
- Modelo original danés: https://huggingface.co/BigFamTLLM/da-base
- Familia BigFamTLLM (noruego desde cero): https://huggingface.co/BigFamTLLM/no-base
- Familia BigFamTLLM (danés desde cero): https://huggingface.co/BigFamTLLM/da-base
- Familia BigFamTLLM (multilingüe desde cero): https://huggingface.co/BigFamTLLM/ml-base
- Checkpoints CPT danés: https://huggingface.co/BigFamTLLM/da-cpt1 a https://huggingface.co/BigFamTLLM/da-cpt10
- Checkpoints CPT multilingüe: https://huggingface.co/BigFamTLLM/ml-cpt1 a https://huggingface.co/BigFamTLLM/ml-cpt10
- Curso IN5640, Universidad de Oslo: no disponible
- Dataset HPLT 4.0: no disponible (referenciado en la model card)
- NorEval 1.1: no disponible (referenciado en la model card)
