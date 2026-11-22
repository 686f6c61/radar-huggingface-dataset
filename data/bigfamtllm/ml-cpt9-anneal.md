# BigFamTLLM/ml-cpt9-anneal

## Resumen

`ml-cpt9-anneal` es un modelo de lenguaje de 2.115.305.088 parámetros (aproximadamente 2,12B) desarrollado por el equipo BigFamTLLM en el marco del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base, no ajustado por instrucciones, especializado en noruego (bokmål y nynorsk) y derivado de un modelo multilingüe entrenado desde cero con la arquitectura Qwen3. El modelo parte de `BigFamTLLM/ml-cpt9` y aplica una fase de annealing sobre texto noruego de alta calidad.

El modelo resuelve el problema de adaptar un modelo multilingüe de presupuesto reducido a un idioma concreto con recursos limitados: sustituye el tokenizador original por uno noruego de 32k tokens, entrena únicamente los embeddings durante 1.000 pasos y después continúa el preentrenamiento sobre corpus noruego. En total ha visto 23,94B tokens noruegos durante todo el proceso, con una mezcla del 85% bokmål y 15% nynorsk, y una ventana de contexto de 4.096 tokens.

Su relevancia es fundamentalmente académica y de investigación: forma parte de una familia de 50 modelos (noruego, danés y multilingüe, cada uno con y sin annealing) entrenados con la misma arquitectura y presupuesto computacional, lo que permite estudiar de forma controlada el efecto de la adaptación de idioma, el cambio de tokenizador y el annealing. No está pensado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención, 17 cabezas KV, embeddings atados) |
| Parametros totales | 2.115.305.088 (≈2,12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors a bfloat16) |
| Idiomas soportados | en, da, de, sv, no, nb, nn (entrenamiento principal en noruego: bokmål y nynorsk) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3: transformer decoder-only con 36 capas, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (GQA) y embeddings atados. El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia (Sigma2), con longitud de secuencia 4096, batch size 128, optimizador AdamW y una tasa de aprendizaje máxima de 5e-4, con 2.000 pasos de warmup y sin decaimiento (1e-4 en la fase de solo embeddings).

La adaptación al noruego se hizo en dos etapas. Primero, un cambio de tokenizador: se sustituyó el vocabulario original por uno noruego de 32k tokens, conservando el embedding de los tokens compartidos entre ambos vocabularios y inicializando los nuevos a partir de la media de las piezas del tokenizador antiguo; a continuación, 1.000 pasos de entrenamiento solo de embeddings. Después, preentrenamiento continuado sobre datos de HPLT 4.0 (85% bokmål, 15% nynorsk), alcanzando 23,94B tokens noruegos vistos en el checkpoint 9 de 10 (paso 43.740 de 48.600). El annealing final consiste en 916 pasos adicionales (0,48B tokens) sobre texto bokmål y nynorsk de alta calidad, con decaimiento lineal de la tasa de aprendizaje hasta 0. La conversión a Hugging Face se realizó con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto en noruego (bokmål y nynorsk) como idioma principal, con soporte residual para inglés, danés, alemán y sueco por herencia del modelo multilingüe base.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene formatos de chat de forma fiable sin un fine-tuning posterior.
- Razonamiento y conocimiento del mundo limitados, coherentes con un modelo de 2,12B parámetros entrenado con un presupuesto reducido.
- Capacidad de completar texto y continuar documentos en contexto de hasta 4.096 tokens.
- Sin soporte documentado de tool calling, function calling ni uso como agente.
- Sin capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al conjunto de idiomas del modelo base; el noruego es el idioma claramente favorecido tras el annealing.

## Casos de uso

- Investigación sobre adaptación de idioma: permite comparar de forma controlada el efecto del cambio de tokenizador y del annealing frente a los checkpoints `ml-cpt1` a `ml-cpt10` y sus versiones annealed, todos publicados por el mismo equipo.
- Experimentos de preentrenamiento continuado: sirve como punto de partida para estudiar recetas de CPT sobre noruego con presupuesto limitado, ya que la model card documenta paso a paso la sustitución de tokenizador y la inicialización de embeddings nuevos.
- Evaluación lingüística en noruego: útil como línea base en tareas de NorEval 1.1 (ortografía, lectura, conocimiento del mundo y lengua) para comparar con modelos noruegos de mayor tamaño.
- Generación de texto asistida en bokmål y nynorsk: puede emplearse para completar borradores o generar variantes de texto en un entorno de investigación, siempre con revisión humana por su tasa de error.
- Estudio de robustez frente a ruido: la model card publica métricas de robustez (0,403 en entrada limpia y −0,043 de media bajo ruido), lo que permite reproducir y ampliar análisis de degradación en tareas noruegas.
- Docencia y experimentación con Megatron-LM y Megatron-Bridge: el modelo y su proceso de conversión a transformers sirven como ejemplo práctico de entrenamiento distribuido y portabilidad de checkpoints.
- Fine-tuning posterior para tareas concretas: al ser un modelo base de 2,12B, es un candidato razonable para ajuste supervisado en tareas noruegas de clasificación o generación acotada en entornos con recursos modestos.

## Benchmarks y rendimiento

Resultados publicados en la model card para NorEval 1.1:

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,255 | 0,290 |
| nob_orthography | acc | 0,843 | 0,871 |
| nob_reading | f1 | 0,254 | 0,300 |
| nob_world | acc | 0,298 | 0,305 |
| nno_language | em_first | 0,494 | 0,591 |
| nno_world | acc | 0,317 | 0,330 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,403 en entrada limpia y −0,043 de media bajo ruido.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 4,3 GB solo para pesos (2,12B parámetros × 2 bytes), más overhead de activaciones y caché KV; con contexto de 4.096 tokens y GQA (17 cabezas KV) el consumo adicional es moderado.
- En cuantización de 8 bits los pesos ocuparían aproximadamente 2,1 GB; en 4 bits, alrededor de 1,1 GB (estimación teórica, no se publican pesos cuantizados).
- GPU recomendadas: cabe con holgura en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en A100, H100 y GH200 para despliegues de mayor throughput.
- Despliegue: compatible con transformers (probado en 4.x), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`); para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/ml-cpt9-anneal | 2,12B | 4.096 | noruego (nb/nn) + en, da, de, sv | no disponible | Modelo base de investigación, sin ajuste por instrucciones |
| BigFamTLLM/no-base-anneal | no disponible | no disponible | noruego | no disponible | Entrenado desde cero en noruego, mismo presupuesto y arquitectura |
| BigFamTLLM/ml-base-anneal | no disponible | no disponible | multilingüe | no disponible | Modelo multilingüe desde cero, sin adaptación posterior al noruego |
| BigFamTLLM/ml-cpt9 | no disponible | no disponible | multilingüe adaptado a noruego | no disponible | Checkpoint previo al annealing del mismo modelo |

La comparación con modelos externos de la misma categoría (por ejemplo, NorMistral, NB-Llama o modelos noruegos de 2-3B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse directamente como asistente conversacional ni para seguir instrucciones de usuario.
- Los propios autores indican que son modelos de investigación entrenados con texto web, que pueden producir salidas erróneas u ofensivas y que no están pensados para producción.
- Riesgo elevado de alucinación y de conocimiento factual incorrecto, coherente con las métricas de `nob_world` (0,298-0,305) y `nno_world` (0,317-0,330).
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documentos largos o conversaciones multi-turno extensas.
- Licencia no disponible: no puede asumirse permiso de uso comercial; es necesario contactar con el autor antes de cualquier uso fuera de investigación.
- Idiomas: aunque el modelo declara soporte de en, da, de y sv, el entrenamiento principal y el annealing se centran en noruego, por lo que el rendimiento en el resto de idiomas es previsiblemente inferior.
- Sin datos publicados sobre sesgos específicos, pero al entrenarse sobre texto web de HPLT 4.0 puede heredar sesgos presentes en ese corpus.
- Fecha de creación del repositorio (2026-11-22) y ausencia de descargas o likes: modelo muy reciente y sin validación externa por parte de la comunidad.
- La robustez bajo ruido es negativa de media (−0,043), lo que indica degradación apreciable con entradas ruidosas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt9-anneal
- Modelo base del que deriva: https://huggingface.co/BigFamTLLM/ml-cpt9
- Modelo multilingüe original: https://huggingface.co/BigFamTLLM/ml-base
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Versión annealed del noruego desde cero: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo danés desde cero: https://huggingface.co/BigFamTLLM/da-base
- Versión annealed del multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Checkpoint 10 de la misma serie: https://huggingface.co/BigFamTLLM/ml-cpt10
- Versión annealed del checkpoint 10: https://huggingface.co/BigFamTLLM/ml-cpt10-anneal
