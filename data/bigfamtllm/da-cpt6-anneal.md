# BigFamTLLM/da-cpt6-anneal

## Resumen

da-cpt6-anneal es un modelo de lenguaje de tipo base (no instruido) desarrollado por BigFamTLLM, un proyecto de estudiantes de la asignatura IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo originalmente entrenado en danés (da-base) que se ha adaptado al noruego mediante un cambio de tokenizador, un entrenamiento inicial solo de embeddings y un preentrenamiento continuado sobre texto noruego. Este checkpoint concreto es el sexto de diez de la fase de preentrenamiento continuado, seguido de una etapa de annealing de 916 pasos adicionales sobre texto de alta calidad en bokmål y nynorsk con decaimiento lineal de la tasa de aprendizaje hasta cero.

El modelo emplea la arquitectura Qwen3 con 36 capas, tamaño oculto de 2176, 34 cabezas de atención (17 cabezas KV) y embeddings atados, sumando 2.115.305.088 parámetros totales. Su longitud de contexto es de 4096 tokens y el tokenizador es específico para noruego con un vocabulario de 32.000 entradas. La motivación del proyecto es comparar, con la misma arquitectura y presupuesto computacional, el entrenamiento desde cero frente a la adaptación de modelos daneses y multilingües al noruego, evaluando además el efecto del annealing en cada checkpoint.

La relevancia de este modelo es fundamentalmente académica y experimental: permite estudiar el impacto del cambio de tokenizador, del preentrenamiento continuado y del annealing sobre el rendimiento en tareas noruegas medidas con NorEval 1.1. No está pensado para uso en producción y su licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen3) |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | noruego (bokmål, nynorsk), danés |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3: 36 capas, tamaño oculto de 2176, 34 cabezas de atención con 17 cabezas KV (GQA) y embeddings atados. El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia de Sigma2, con longitud de secuencia de 4096, batch size de 128, optimizador AdamW y tasa de aprendizaje máxima de 5e-4 con 2000 pasos de warmup y sin decaimiento (1e-4 durante la etapa solo de embeddings). Los datos provienen de HPLT 4.0, con una mezcla noruega compuesta por un 85% de bokmål y un 15% de nynorsk.

El proceso de adaptación desde el modelo danés incluyó un cambio de tokenizador: los tokens compartidos por ambos vocabularios conservan su embedding, mientras que los nuevos se inicializan con la media de las piezas del tokenizador antiguo. Tras 1000 pasos de entrenamiento solo de embeddings, se realizó preentrenamiento continuado sobre noruego hasta este checkpoint 6 (paso 29.160 de 48.600), que ha visto 16,29 mil millones de tokens noruegos. La versión annealed añade 916 pasos (0,48 mil millones de tokens) sobre texto de alta calidad en bokmål y nynorsk con decaimiento lineal de la tasa de aprendizaje hasta cero. La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto en noruego (bokmål y nynorsk) y danés.
- Modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable ni mantiene diálogos estructurados.
- Razonamiento y conocimiento del mundo limitados, según los resultados de NorEval.
- Capacidad de completar texto y continuar secuencias en los idiomas entrenados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües limitadas a los idiomas del entrenamiento (noruego y danés).

## Casos de uso

- Investigación académica sobre adaptación lingüística: el modelo sirve para estudiar el efecto del cambio de tokenizador y del preentrenamiento continuado en la transferencia entre lenguas cercanas (danés a noruego), comparándolo con los otros checkpoints del proyecto.
- Evaluación comparativa de annealing: permite medir, con NorEval 1.1, cuánto mejora el annealing sobre texto de alta calidad frente al checkpoint sin annealing (da-cpt6), con una ventana de contexto de 4096 tokens suficiente para tareas de comprensión y ortografía.
- Generación de texto en noruego para experimentos controlados: útil para probar la fluidez y corrección ortográfica en bokmål y nynorsk en entornos de laboratorio, no en producción.
- Estudio de robustez frente a ruido: el proyecto publica métricas de robustez (0,393 en entrada limpia y -0,047 de media bajo ruido), lo que permite analizar el comportamiento del modelo ante perturbaciones en las entradas.
- Línea base para fine-tuning posterior: al ser un modelo base de 2,12B con contexto de 4096, puede servir como punto de partida para ajustes supervisados en tareas noruegas específicas dentro de un entorno de investigación.
- Reproducción de experimentos: el proyecto publica los 50 modelos con la misma arquitectura y presupuesto, lo que facilita replicar y comparar resultados entre entrenamiento desde cero, adaptación y annealing.

## Benchmarks y rendimiento

Resultados en NorEval 1.1 según la model card:

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,259 | 0,297 |
| nob_orthography | acc | 0,852 | 0,871 |
| nob_reading | f1 | 0,221 | 0,225 |
| nob_world | acc | 0,296 | 0,298 |
| nno_language | em_first | 0,494 | 0,580 |
| nno_world | acc | 0,303 | 0,306 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,393 en entrada limpia y -0,047 de media bajo ruido.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,3 GB solo para los pesos (2,12B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, alrededor de 5-6 GB con contexto completo de 4096 tokens.
- En cuantización de 8 bits: unos 2,1 GB para los pesos; en 4 bits: unos 1,1 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100, H100 o RTX 4090 son suficientes y sobradas para este tamaño.
- Cabe en GPUs de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, entre otras.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (etiqueta endpoints_compatible), y previsiblemente vLLM y llama.cpp si se generan pesos GGUF (no confirmado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| da-cpt6-anneal | 2,12B | 4.096 | noruego, danés | no disponible | Checkpoint 6 annealed del proyecto |
| da-cpt6 | 2,12B | 4.096 | noruego, danés | no disponible | Mismo checkpoint sin annealing |
| no-base-anneal | no disponible | no disponible | noruego | no disponible | Entrenado desde cero, misma arquitectura y presupuesto |
| ml-base-anneal | no disponible | no disponible | multilingüe | no disponible | Entrenado desde cero multilingüe, misma arquitectura y presupuesto |

La comparación directa con modelos de referencia noruegos (por ejemplo, NorMistral o NB-BERT) no está disponible en la información proporcionada. Los modelos del propio proyecto (no-base-anneal, da-base-anneal, ml-base-anneal) son las alternativas más directamente comparables, ya que comparten arquitectura y presupuesto computacional.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable y no debe usarse como asistente conversacional sin fine-tuning.
- Entrenado sobre texto web (HPLT 4.0): puede producir contenido erróneo u ofensivo, según advierte el propio autor.
- Los resultados en NorEval son moderados: por ejemplo, 0,221 de F1 en nob_reading y 0,296 de accuracy en nob_world en 0-shot, lo que indica conocimiento del mundo y comprensión lectora limitados.
- Robustez reducida: pierde 0,047 puntos de media bajo ruido en las tareas evaluadas.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idiomas limitados a noruego (bokmål y nynorsk) y danés; no se documenta soporte de otras lenguas.
- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- El autor indica explícitamente que no está pensado para uso en producción.
- Proyecto académico de estudiantes: sin garantías de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt6-anneal
- Modelo base sin annealing: https://huggingface.co/BigFamTLLM/da-cpt6
- Modelo danés original: https://huggingface.co/BigFamTLLM/da-base
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Modelo multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Checkpoints daneses de preentrenamiento continuado: https://huggingface.co/BigFamTLLM/da-cpt1 a https://huggingface.co/BigFamTLLM/da-cpt10
- Checkpoints multilingües de preentrenamiento continuado: https://huggingface.co/BigFamTLLM/ml-cpt1 a https://huggingface.co/BigFamTLLM/ml-cpt10
- Asignatura IN5640, Universidad de Oslo: no disponible
- Dataset HPLT 4.0: no disponible en la información proporcionada
- Paper o blog del proyecto: no disponible
