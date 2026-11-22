# BigFamTLLM/ml-cpt5-anneal

## Resumen

ml-cpt5-anneal es un modelo de lenguaje de 2.115.305.088 parámetros (2,12B) desarrollado por BigFamTLLM, un proyecto de estudiantes de la asignatura IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo multilingüe entrenado desde cero con arquitectura Qwen3 y posteriormente adaptado al noruego mediante un cambio de tokenizador y preentrenamiento continuado sobre texto noruego (85% Bokmål, 15% Nynorsk). Este checkpoint concreto es el quinto de diez de la fase de preentrenamiento continuado, y sobre él se ha aplicado un proceso de annealing de 916 pasos adicionales sobre texto noruego de alta calidad con decaimiento lineal de la tasa de aprendizaje hasta cero.

El modelo resuelve el problema de disponer de un modelo base pequeño y abierto con competencia en noruego (tanto Bokmål como Nynorsk) partiendo de un modelo multilingüe. Es relevante en el contexto de la investigación en modelos de lenguaje de bajo recurso, ya que documenta de forma transparente el efecto del cambio de tokenizador, el preentrenamiento continuado y el annealing sobre las métricas de NorEval 1.1. No está ajustado a instrucciones: es un modelo base pensado para investigación y para servir de punto de partida a futuros ajustes.

La arquitectura es un transformer denso (no MoE) de 36 capas con hidden size 2176, 34 cabezas de atención (17 cabezas KV) y embeddings atados, con una longitud de contexto de 4096 tokens. El modelo ha visto 13,74B tokens noruegos durante el preentrenamiento continuado y el annealing añade 0,48B tokens adicionales. La licencia no está declarada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención, 17 cabezas KV, embeddings atados) |
| Parámetros totales | 2.115.305.088 (2,12B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en, da, de, sv, no, nb (Bokmål), nn (Nynorsk) |
| Licencia | No disponible |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuración densa: 36 capas, hidden size de 2176, 34 cabezas de atención con 17 cabezas KV (GQA), y embeddings atados entre la capa de entrada y la de salida. Se entrenó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia (Sigma2), con longitud de secuencia 4096, batch size 128, optimizador AdamW y tasa de aprendizaje pico de 5e-4 con 2000 pasos de warmup y sin decaimiento durante el preentrenamiento continuado (1e-4 en la fase de solo embeddings).

El proceso de adaptación al noruego consta de varias etapas. Primero se sustituyó el tokenizador por uno noruego de 32k tokens: los tokens compartidos por ambos vocabularios conservan su embedding, y los nuevos se inicializan con la media de las piezas del tokenizador antiguo. Después se realizaron 1000 pasos de entrenamiento solo de embeddings, seguidos de preentrenamiento continuado sobre datos de HPLT 4.0 (13,74B tokens noruegos vistos hasta este checkpoint, el quinto de diez). Finalmente, el annealing aplica 916 pasos adicionales (0,48B tokens) sobre texto Bokmål y Nynorsk de alta calidad con decaimiento lineal de la tasa de aprendizaje hasta cero. La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto en noruego (Bokmål y Nynorsk), danés, sueco, alemán e inglés.
- Modelo base sin ajuste a instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- Competencia léxica y ortográfica en noruego, con resultados destacados en la tarea de ortografía de NorEval (0,851 en 0-shot, 0,865 en 1-shot).
- Comprensión lectora y conocimiento del mundo limitados en noruego, según los resultados de NorEval.
- Capacidad multilingüe derivada del entrenamiento original multilingüe, con adaptación específica al noruego.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Robustez moderada frente a ruido: 0,397 en entrada limpia y una caída media de 0,041 bajo ruido en tres tareas de NorEval.

## Casos de uso

- Investigación en modelos de bajo recurso: el modelo sirve como referencia reproducible para estudiar el efecto del cambio de tokenizador, el preentrenamiento continuado y el annealing en noruego, comparándolo con los otros 49 modelos del proyecto.
- Punto de partida para fine-tuning: al ser un modelo base de 2,12B, se puede ajustar con SFT o DPO para tareas concretas en noruego (clasificación, extracción, resumen) con requisitos de cómputo moderados.
- Evaluación de tokenizadores noruegos: permite comparar el rendimiento de un vocabulario de 32k específico frente a tokenizadores multilingües en tareas de ortografía y morfología.
- Generación de texto noruego en entornos de investigación: útil para estudiar la calidad y los sesgos de la generación en Bokmål y Nynorsk con un modelo entrenado mayoritariamente en web.
- Experimentos de robustez: el modelo incluye métricas de robustez frente a ruido, lo que facilita reproducir y ampliar estudios sobre degradación en entrada ruidosa.
- Docencia y prácticas: al ser un proyecto de asignatura con código y checkpoints públicos, sirve para ilustrar el ciclo completo de entrenamiento, adaptación y evaluación de un LLM.
- Análisis de la brecha entre Bokmål y Nynorsk: los resultados de NorEval muestran diferencias claras entre ambas variantes (por ejemplo, 0,281 frente a 0,562 en em_first 1-shot), lo que permite estudiar el desequilibrio de datos (85%/15%).

## Benchmarks y rendimiento

NorEval 1.1 (resultados publicados en la model card):

| Grupo de tareas | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,252 | 0,281 |
| nob_orthography | acc | 0,851 | 0,865 |
| nob_reading | f1 | 0,236 | 0,236 |
| nob_world | acc | 0,294 | 0,295 |
| nno_language | em_first | 0,497 | 0,562 |
| nno_world | acc | 0,312 | 0,319 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,397 en entrada limpia y -0,041 de media bajo ruido.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 5-6 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,1-3 GB; en 4 bits, alrededor de 1,1-2 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100, H100 o GH200 para entrenamiento y evaluación a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en bfloat16; en 4 bits cabría en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (el modelo está etiquetado como endpoints_compatible), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/ml-cpt5-anneal | 2,12B | 4096 | en, da, de, sv, no, nb, nn | No disponible | Modelo base de investigación, annealing sobre noruego |
| BigFamTLLM/no-base-anneal | No disponible en la información | No disponible | Noruego | No disponible | Entrenado desde cero en noruego, mismo proyecto y presupuesto |
| BigFamTLLM/da-base-anneal | No disponible en la información | No disponible | Danés | No disponible | Entrenado desde cero en danés, mismo proyecto |
| BigFamTLLM/ml-base-anneal | No disponible en la información | No disponible | Multilingüe | No disponible | Multilingüe desde cero, sin adaptación al noruego |

La comparación con modelos externos de la misma categoría (por ejemplo, Qwen3 de 1,7B u otros modelos pequeños multilingües) no está disponible en la información proporcionada; el proyecto solo publica comparaciones internas entre sus 50 modelos.

## Limitaciones y advertencias

- Modelo base sin ajuste a instrucciones: no debe usarse directamente en aplicaciones conversacionales ni como asistente.
- Los propios autores advierten de que son modelos de investigación entrenados con texto web y que pueden producir salidas incorrectas u ofensivas; no están pensados para producción.
- Sesgos potenciales derivados de los datos de HPLT 4.0 (texto web) y del desequilibrio 85% Bokmål / 15% Nynorsk, que se refleja en el peor rendimiento en Nynorsk en algunas tareas.
- Riesgo de alucinación alto, como en cualquier modelo base de 2,12B entrenado principalmente con texto web.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Rendimiento bajo en conocimiento del mundo y comprensión lectora en noruego (0,294-0,319 de accuracy), lo que limita su uso en tareas que requieran conocimiento factual.
- Robustez limitada: caída media de 0,041 bajo ruido en las tareas evaluadas.
- Licencia no declarada: no se puede confirmar el uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Sin datos publicados de cuantización, latencia ni throughput, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt5-anneal
- Modelo base del que parte: https://huggingface.co/BigFamTLLM/ml-cpt5
- Modelo multilingüe original: https://huggingface.co/BigFamTLLM/ml-base
- Versión sin annealing del mismo checkpoint: https://huggingface.co/BigFamTLLM/ml-cpt5
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Modelo noruego desde cero con annealing: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo danés desde cero: https://huggingface.co/BigFamTLLM/da-base
- Modelo danés desde cero con annealing: https://huggingface.co/BigFamTLLM/da-base-anneal
- Modelo multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Modelo multilingüe desde cero con annealing: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Checkpoints de preentrenamiento continuado multilingüe (del 1 al 10): https://huggingface.co/BigFamTLLM/ml-cpt1 hasta https://huggingface.co/BigFamTLLM/ml-cpt10
- Versiones con annealing de esos checkpoints: https://huggingface.co/BigFamTLLM/ml-cpt1-anneal hasta https://huggingface.co/BigFamTLLM/ml-cpt10-anneal
