# BigFamTLLM/ml-cpt3-anneal

## Resumen

ml-cpt3-anneal es un modelo de lenguaje de 2.115.305.088 parámetros (2,12B) desarrollado por BigFamTLLM, un proyecto de estudiantes de la asignatura IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base (no ajustado a instrucciones) construido sobre la arquitectura Qwen3 y especializado en noruego mediante adaptación de un modelo multilingüe previamente entrenado desde cero. El modelo parte de ml-cpt3 y aplica una fase de annealing de 916 pasos adicionales sobre texto noruego de alta calidad (Bokmål y Nynorsk), con decaimiento lineal de la tasa de aprendizaje hasta cero.

El problema que aborda es la adaptación eficiente de un modelo multilingüe a un idioma específico con recursos comparativamente limitados: en lugar de entrenar un modelo noruego desde cero, se sustituye el tokenizador por uno noruego de 32k tokens y se continúa el preentrenamiento sobre 8.650 millones de tokens noruegos procedentes de HPLT 4.0. Esta es la décima y última iteración de una serie de 10 checkpoints de continued pretraining, lo que la convierte en la versión más madura de la rama multilingüe adaptada al noruego del proyecto.

Su relevancia radica en tres factores: es un modelo pequeño (2,12B) con contexto de 4.096 tokens que puede ejecutarse en hardware de consumo, está específicamente orientado al noruego (incluyendo Nynorsk, un idioma con menos recursos), y forma parte de un estudio comparativo controlado de 50 modelos que evalúa sistemáticamente el efecto del annealing y de las estrategias de adaptación. La licencia no está especificada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3): 36 capas, hidden size 2176, 34 cabezas de atención (17 KV heads), embeddings atados |
| Parámetros totales | 2.115.305.088 (2,12B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | No disponible (pesos en safetensors; al ser un modelo transformers es compatible con cuantización estándar vía bitsandbytes/GGUF, pero no se documenta en la model card) |
| Idiomas soportados | Inglés (en), danés (da), alemán (de), sueco (sv), noruego (no), Bokmål (nb), Nynorsk (nn); entrenamiento específico en noruego |
| Licencia | No disponible |
| Formato de pesos | safetensors (transformers); convertible a GGUF |
| Tokenizador | Noruego, 32k tokens |
| Tokens noruegos vistos | 8.650 millones |
| Modelo base | BigFamTLLM/ml-cpt3 |
| Checkpoint | 3 de 10 (paso 14.580 de 48.600) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3: un transformer decoder-only con 36 capas, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (GQA, ratio 2:1) y embeddings atados entre entrada y salida. Fue entrenado con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia de Sigma2, con longitud de secuencia 4.096, batch size 128 y optimizador AdamW. La tasa de aprendizaje máxima fue de 5e-4 con 2.000 pasos de warmup y sin decaimiento durante el preentrenamiento principal (1e-4 para la etapa de solo embeddings).

El proceso de adaptación al noruego consta de varias fases. Primero se sustituye el tokenizador por uno noruego de 32k tokens: los tokens compartidos entre ambos vocabularios conservan su embedding, mientras que los nuevos se inicializan con la media de las piezas del tokenizador antiguo. Después se realizan 1.000 pasos de entrenamiento solo de embeddings y, a continuación, continued pretraining sobre datos noruegos de HPLT 4.0, con una mezcla del 85% Bokmål y 15% Nynorsk. La fase de annealing final, que distingue a esta versión de ml-cpt3, consiste en 916 pasos adicionales (0,48B tokens) sobre texto noruego de alta calidad con decaimiento lineal de la tasa de aprendizaje hasta cero. La conversión a formato Hugging Face se realizó con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto en noruego (Bokmål y Nynorsk), con especial énfasis en el primero.
- Comprensión lectora y respuesta a preguntas sobre textos en noruego.
- Tareas de conocimiento del mundo evaluadas en noruego (nob_world, nno_world).
- Ortografía y corrección lingüística en noruego (nob_orthography).
- Capacidades multilingües residuales en inglés, danés, alemán y sueco, heredadas del modelo base multilingüe.
- No es un modelo ajustado a instrucciones: no soporta de forma nativa tool calling, function calling, agentes ni razonamiento multi-paso guiado.
- No dispone de modo thinking, visión ni audio.
- Modelo base: requiere prompting de continuación de texto o fine-tuning posterior para tareas de instrucciones.

## Casos de uso

- Evaluación comparativa de estrategias de adaptación lingüística: el modelo sirve como punto de comparación frente a ml-cpt3 (sin annealing) y los modelos noruegos entrenados desde cero (no-base, no-base-anneal) para medir el efecto del annealing en un mismo presupuesto de cómputo.
- Generación de texto en noruego para investigación: continuación de texto y generación libre en Bokmål y Nynorsk con un modelo de 2,12B que cabe en una GPU de consumo, útil para experimentos académicos de generación.
- Fine-tuning para tareas específicas del noruego: al ser un modelo base pequeño, puede ajustarse con LoRA o fine-tuning completo para clasificación de texto, análisis de sentimiento o extracción de información en noruego con costes moderados.
- Corrección ortográfica y normalización de texto: el rendimiento en nob_orthography (0,851 en 0-shot, 0,868 en 1-shot) sugiere utilidad como base para tareas de normalización y detección de errores ortográficos en noruego.
- Investigación sobre robustez frente a ruido: el modelo incluye evaluaciones de robustez (0,397 en limpio, -0,045 de media bajo ruido) que lo hacen útil para estudiar la degradación de modelos pequeños ante entradas ruidosas.
- Educación y docencia: como parte de un proyecto de la asignatura IN5640, sirve como material didáctico reproducible para estudiar el pipeline completo de entrenamiento, adaptación de tokenizador y evaluación de modelos de lenguaje.
- Procesamiento de Nynorsk: dado el limitado ecosistema de modelos para este idioma, puede emplearse como base para experimentos de generación y evaluación en Nynorsk (0,445 em_first en nno_language 0-shot).

## Benchmarks y rendimiento

Resultados en NorEval 1.1 publicados en la model card:

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,240 | 0,269 |
| nob_orthography | acc | 0,851 | 0,868 |
| nob_reading | f1 | 0,215 | 0,249 |
| nob_world | acc | 0,295 | 0,298 |
| nno_language | em_first | 0,445 | 0,497 |
| nno_world | acc | 0,302 | 0,313 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,397 en entrada limpia y -0,045 de media bajo ruido.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,2 GB solo para pesos (el tamaño del repo es de 4,2 GB), más overhead de activaciones y caché KV; en la práctica, unos 5-6 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2,1-2,5 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1,1-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bfloat16; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100, H100 y GH200 son suficientes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bfloat16, y en tarjetas con 4 GB o más en cuantización de 4 bits.
- Opciones de despliegue: transformers (soporte nativo, incluido transformers 4.x según la model card), text-generation-inference (etiqueta endpoints_compatible), llama.cpp/Ollama tras conversión a GGUF, y vLLM tras conversión de formato.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en 8 GH200, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ml-cpt3-anneal | 2,12B | 4.096 | Multilingüe adaptado a noruego con annealing | No disponible | Hugging Face |
| ml-cpt3 | 2,12B | 4.096 | Multilingüe adaptado a noruego sin annealing (checkpoint 3/10) | No disponible | Hugging Face |
| no-base-anneal | 2,12B (misma arquitectura) | 4.096 | Noruego entrenado desde cero con annealing | No disponible | Hugging Face |
| ml-base-anneal | 2,12B (misma arquitectura) | 4.096 | Multilingüe desde cero con annealing | No disponible | Hugging Face |

Los cuatro modelos comparten arquitectura, presupuesto de entrenamiento y proyecto, lo que permite comparar directamente el efecto de la estrategia de adaptación (desde cero frente a continued pretraining) y del annealing. No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento entre ellos. Tampoco se comparan con modelos externos de la misma categoría (por ejemplo, Qwen3 de 1,7B o modelos noruegos de otros autores) porque no hay datos disponibles.

## Limitaciones y advertencias

- Modelo base no ajustado a instrucciones: no sigue instrucciones de forma fiable ni soporta tool calling o agentes sin fine-tuning adicional.
- Riesgo de alucinación: al ser un modelo entrenado sobre texto web, puede generar contenido incorrecto o inventado, especialmente en tareas de conocimiento del mundo (nob_world 0,295 en 0-shot).
- Rendimiento modesto en comprensión lectora (nob_reading f1 de 0,215 en 0-shot) y en tareas de lenguaje (nob_language em_first de 0,240), coherente con su tamaño de 2,12B.
- Sesgos conocidos: los datos de entrenamiento provienen de HPLT 4.0 (texto web), por lo que puede reproducir sesgos presentes en la web; la model card no documenta un análisis específico de sesgos.
- Limitación de contexto: 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Limitación idiomática: el entrenamiento específico es en noruego (85% Bokmål, 15% Nynorsk); las capacidades en inglés, danés, alemán y sueco son residuales y no están evaluadas en la model card.
- Robustez limitada: la degradación media de -0,045 bajo ruido indica cierta fragilidad ante entradas ruidosas.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede confirmar el uso comercial; debe consultarse con los autores antes de cualquier despliegue en producción.
- Advertencia explícita de los autores: son modelos de investigación entrenados con texto web, pueden producir salidas erróneas u ofensivas y no están pensados para uso en producción.
- Fecha de creación futura (2026-11-22) y ausencia de descargas o likes: el modelo es muy reciente y no tiene validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt3-anneal
- Modelo base (ml-cpt3): https://huggingface.co/BigFamTLLM/ml-cpt3
- Modelo multilingüe original (ml-base): https://huggingface.co/BigFamTLLM/ml-base
- Versión sin annealing del modelo multilingüe (ml-base-anneal): https://huggingface.co/BigFamTLLM/ml-base-anneal
- Modelo noruego desde cero (no-base): https://huggingface.co/BigFamTLLM/no-base
- Modelo noruego desde cero con annealing (no-base-anneal): https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo danés desde cero (da-base): https://huggingface.co/BigFamTLLM/da-base
- Modelo danés desde cero con annealing (da-base-anneal): https://huggingface.co/BigFamTLLM/da-base-anneal
- Repositorio de checkpoints multilingües CPT: https://huggingface.co/BigFamTLLM/ml-cpt1 (y sucesivos hasta ml-cpt10)
- Repositorio de checkpoints multilingües CPT con annealing: https://huggingface.co/BigFamTLLM/ml-cpt1-anneal (y sucesivos hasta ml-cpt10-anneal)
- Dataset HPLT 4.0: no disponible enlace directo en la información proporcionada
- NorEval 1.1: no disponible enlace directo en la información proporcionada
- Proyecto IN5640 (Universidad de Oslo): no disponible enlace directo en la información proporcionada
