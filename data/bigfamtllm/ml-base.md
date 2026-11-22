# BigFamTLLM/ml-base

## Resumen

`ml-base` es un modelo de lenguaje de 2.184.937.088 parámetros (2,18B) entrenado desde cero por el grupo BigFamTLLM en el marco del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base multilingüe, sin ajuste por instrucciones, que emplea la arquitectura Qwen3 y fue entrenado sobre 26.000 millones de tokens, con un 80% de inglés y el resto repartido entre danés, alemán y sueco. Destaca por ser el punto de partida de un experimento controlado: el mismo presupuesto de cómputo y la misma arquitectura que el modelo noruego del proyecto, pero sin ningún token de noruego en el entrenamiento.

El modelo resuelve, en el contexto del proyecto, la pregunta de hasta qué punto un modelo multilingüe entrenado sin noruego puede adaptarse posteriormente a ese idioma mediante ajuste continuado (continued pre-training) o sustitución de embeddings. Su relevancia no es la de un modelo de producción, sino la de una pieza de investigación reproducible: forma parte de un conjunto de 50 checkpoints publicados con la misma arquitectura y presupuesto, lo que permite comparaciones rigurosas entre estrategias de adaptación lingüística.

La arquitectura es un transformer decoder-only denso de 36 capas, con tamaño oculto de 2176, 34 cabezas de atención (17 cabezas KV) y embeddings atados, con una longitud de contexto de 4096 tokens y un tokenizador multilingüe de 64.000 entradas. El modelo se distribuye en formato safetensors y es compatible con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), 36 capas, hidden size 2176, 34 cabezas de atencion (17 KV heads), tied embeddings |
| Parametros totales | 2.184.937.088 (2,18B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (solo se documenta bfloat16 en el ejemplo de uso) |
| Idiomas soportados | Ingles, danes, aleman, sueco (entrenamiento); el tokenizador es multilingue de 64k |
| Licencia | No disponible |
| Formato de pesos | safetensors (compatible con transformers 4.x) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuración densa: 36 capas, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas de clave-valor (GQA) y embeddings atados entre entrada y salida. El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia de Sigma2, con longitud de secuencia de 4096, tamaño de batch de 128, optimizador AdamW, learning rate máximo de 5e-4, 2000 pasos de warmup y sin decaimiento (1e-4 en la etapa de solo embeddings).

Los datos proceden de HPLT 4.0 y suman 26.000 millones de tokens, con un 80% de inglés y el resto de danés, alemán y sueco. El tokenizador es multilingüe con 64.000 entradas. Una innovación técnica destacable es el procedimiento de intercambio de tokenizador: los tokens compartidos entre ambos vocabularios conservan su embedding, mientras que los nuevos se inicializan con la media de las piezas del tokenizador antiguo. Posteriormente se aplicó una fase de annealing de 916 pasos (0,48B tokens) sobre texto de alta calidad en bokmål y nynorsk, con decaimiento lineal a cero. La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto en inglés, danés, alemán y sueco, con especial énfasis en inglés (80% del corpus).
- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene formatos conversacionales de forma fiable sin fine-tuning adicional.
- Capacidad de continuación de texto y modelado de lenguaje puro, adecuada como punto de partida para fine-tuning supervisado.
- Tokenizador multilingüe de 64.000 entradas que cubre las lenguas del entrenamiento y facilita la adaptación posterior a otras lenguas germánicas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícito.
- Capacidades multilingües limitadas a las lenguas del corpus; el noruego no está presente en el entrenamiento (0 tokens), aunque el modelo se evalúa en tareas noruegas como referencia del proyecto.

## Casos de uso

- Investigación sobre adaptación lingüística: sirve como línea base multilingüe para medir cuánto noruego puede inyectarse mediante continued pre-training o sustitución de embeddings, comparando con los checkpoints `ml-cpt1` a `ml-cpt10` y sus versiones annealed del mismo proyecto.
- Fine-tuning supervisado para tareas de generación en danés, alemán o sueco: al ser un modelo base de 2,18B, puede ajustarse con datasets pequeños en una sola GPU para clasificación de texto, resumen o generación controlada.
- Experimentos de tokenización multilingüe: el procedimiento de intercambio de tokenizador documentado permite estudiar el impacto de distintos vocabularios en el rendimiento multilingüe con un presupuesto de cómputo acotado.
- Evaluación comparativa de recetas de entrenamiento: al compartir arquitectura y presupuesto con `no-base` y `da-base`, permite aislar el efecto de la composición del corpus (con o sin noruego) en tareas de NorEval.
- Generación de texto en inglés para tareas de continuación y perplejidad: útil como modelo de referencia pequeño en experimentos de investigación que requieran un transformer denso de 2B con contexto de 4096.
- Estudio de robustez frente a ruido: la evaluación documentada con versiones ruidosas de tareas NorEval (0,292 en limpio, -0,026 de media bajo ruido) lo hace adecuado para analizar la degradación de modelos pequeños ante entradas corruptas.
- Docencia y reproducibilidad: al ser un proyecto de curso con 50 checkpoints publicados, sirve como material didáctico para estudiar el ciclo completo de entrenamiento, annealing y evaluación de un LLM desde cero.

## Benchmarks y rendimiento

Resultados en NorEval 1.1 publicados en la model card:

| Grupo de tarea | Metrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,045 | 0,050 |
| nob_orthography | acc | 0,738 | 0,774 |
| nob_reading | f1 | 0,079 | 0,105 |
| nob_world | acc | 0,260 | 0,268 |
| nno_language | em_first | 0,036 | 0,058 |
| nno_world | acc | 0,245 | 0,255 |

Robustez (versiones ruidosas de tres tareas de NorEval): 0,292 en entrada limpia y -0,026 de media bajo ruido.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 6-8 GB para contexto completo de 4096 tokens.
- En cuantización de 8 bits, los pesos ocuparían alrededor de 2,2 GB; en 4 bits, alrededor de 1,1 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; para entrenamiento o fine-tuning se recomienda A100 o H100 por el mayor ancho de banda.
- Opciones de despliegue: transformers (soporte oficial documentado), text-generation-inference (tag `text-generation-inference` presente en el repo) y endpoints compatibles; no se documenta soporte explícito de llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas de entrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/ml-base | 2,18B | 4096 | en, da, de, sv | No disponible | Base multilingüe sin noruego; proyecto IN5640 |
| BigFamTLLM/no-base | 2,18B (misma arquitectura) | 4096 | noruego | No disponible | Entrenado desde cero en noruego; misma arquitectura y presupuesto |
| BigFamTLLM/da-base | 2,18B (misma arquitectura) | 4096 | danés | No disponible | Entrenado desde cero en danés; misma arquitectura y presupuesto |
| Qwen3 (modelos pequeños de referencia) | Variable (0,6B-4B en la familia) | Mayor que 4096 en variantes recientes | Multilingüe amplio | Apache 2.0 en la mayoría de variantes | Arquitectura de referencia; no es una comparación directa de rendimiento |

No se dispone de comparaciones de rendimiento con modelos externos en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse directamente en aplicaciones conversacionales sin fine-tuning previo.
- Entrenado únicamente sobre 26.000 millones de tokens, un volumen muy reducido para los estándares actuales; es esperable una calidad de generación limitada y una alta tasa de alucinación.
- Sin ningún token de noruego en el entrenamiento: el rendimiento en bokmål y nynorsk es bajo (por ejemplo, 0,045 y 0,036 en em_first 0-shot), y el modelo no debe emplearse para tareas en noruego sin adaptación.
- Sesgos conocidos: al entrenarse sobre texto web de HPLT 4.0, puede reproducir sesgos presentes en el corpus; el autor advierte de que puede generar contenido erróneo u ofensivo.
- Licencia no disponible: no se puede confirmar el uso comercial permitido; debe contactarse con el autor antes de cualquier despliegue en producción.
- El autor indica explícitamente que son modelos de investigación y no están pensados para uso en producción.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Robustez limitada ante ruido: la evaluación documentada muestra una caída media de 0,026 puntos bajo entradas ruidosas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-base
- Modelo noruego equivalente: https://huggingface.co/BigFamTLLM/no-base
- Modelo danés equivalente: https://huggingface.co/BigFamTLLM/da-base
- Versión con annealing: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Checkpoints de continued pre-training multilingüe: https://huggingface.co/BigFamTLLM/ml-cpt1 (hasta ml-cpt10)
- Repositorio de Megatron-LM: https://github.com/NVIDIA/Megatron-LM
- Repositorio de Megatron-Bridge: https://github.com/NVIDIA/Megatron-Bridge
- Dataset HPLT 4.0: https://hplt-project.org/
