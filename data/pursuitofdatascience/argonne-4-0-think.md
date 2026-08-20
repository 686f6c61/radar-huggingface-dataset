# PursuitOfDataScience/Argonne-4.0-think

## Resumen

Argonne 4.0-think es un modelo de razonamiento de 1.040 millones de parámetros desarrollado por PursuitOfDataScience, un investigador afiliado a la Universidad de Chicago. Forma parte de la línea Argonne 4.0, cuya tesis principal es la eficiencia de datos: el modelo base alcanza su calidad con solo 65,12 mil millones de tokens de entrenamiento a un tamaño de 1,04B parámetros. Este modelo se construye a partir de argonne-4.0-base y emite una traza explícita de pensamiento (`thinking… response`) seguida de una respuesta en formato `\boxed{}`.

El modelo está diseñado para resolver problemas de razonamiento matemático y aritmético, con un pipeline de entrenamiento que combina SFT, DPO, destilación on-policy desde su hermano mayor Argonne-3.5-think (2,88B) y una etapa final de reparación con cross-entropy a baja tasa de aprendizaje. Con 2,8 veces menos parámetros que su hermano mayor, pierde 4,93 puntos en la media de cuatro conjuntos de evaluación aritmética, pero recupera gran parte de esa diferencia mediante self-consistency en inferencia. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) |
| Parametros totales | 1.038.492.672 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens (base) |
| Tipos de cuantizacion | No disponible (pesos en bf16, se puede cuantizar) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 1,04B parámetros, entrenado desde cero sobre argonne-4.0-base, que a su vez se preentrenó con 65,12B tokens y una longitud de contexto de 65.536 tokens. El post-entrenamiento consta de cinco etapas: SFT con UltraChat 200k, DPO con argilla/dpo-mix-7k, CoT-SFT con un mix de trazas cortas de razonamiento (28.428 filas), destilación on-policy desde el modelo hermano Argonne-3.5-think (2,88B) usando reverse-KL per-token sobre las salidas del propio estudiante, y una etapa final de reparación con cross-entropy sobre 24.787 trazas correctas del propio modelo a una learning rate de 3e-6.

La innovación técnica clave es la destilación on-policy: en lugar de imitar directamente las trazas del profesor, se computa la divergencia KL inversa per-token en los estados que el estudiante realmente visita. Además, la etapa de reparación CE con LR muy baja (3e-6) es crítica; el mismo proceso a LR 1e-5 daña el modelo. El autor indica que los cuatro candidatos finales del campaña están estadísticamente empatados en la evaluación (este checkpoint obtiene 59,17, los otros 59,60 / 59,10 / 59,00, todos con p ≥ 0,35).

## Capacidades

- Razonamiento matemático y aritmético de varios pasos (multi-step) con salida en formato de cadena de pensamiento (CoT) explícita y respuesta final en `\boxed{}`.
- Generación de texto causal estándar, compatible con el pipeline de transformers.
- Soporte de chat multi-turno mediante plantilla de chat (chat template) integrada.
- Capacidad de auto-consistencia (self-consistency) en inferencia: muestreo con temperatura 0,8 y K=8 mejora significativamente la precisión.
- No soporta explícitamente tool calling, function calling, ni capacidades de visión o audio según la información disponible.
- Multilingüismo limitado: solo se declara inglés.

## Casos de uso

- Resolución de problemas de matemáticas en educación: el modelo puede generar explicaciones paso a paso para problemas de aritmética, álgebra y matemáticas aplicadas, útil en plataformas de tutoría inteligente. Su formato `\boxed{}` permite extraer fácilmente la respuesta final.
- Generación de problemas y soluciones para conjuntos de datos sintéticos: se puede usar para crear pares pregunta-respuesta con razonamiento, alimentando pipelines de entrenamiento de otros modelos.
- Evaluación de modelos de razonamiento: su diseño como modelo de razonamiento puro lo hace adecuado como referencia en benchmarks de matemáticas (ASDiv, SVAMP, GSM-Plus, MAWPS).
- Inferencia en dispositivos con recursos limitados: al ser de solo 1,04B parámetros, cabe en GPUs de consumo (8-12 GB VRAM) y permite despliegue en entornos edge o de bajo coste.
- Investigación en destilación y entrenamiento eficiente: su historial de entrenamiento (destilación on-policy, LR baja) sirve como caso de estudio para técnicas de post-entrenamiento.
- Chatbot educativo de matemáticas: integrado en un sistema de chat, puede responder preguntas aritméticas con explicaciones, aunque no es su fuerte principal.

## Benchmarks y rendimiento

Los datos de evaluación provienen de la model card del autor, con decodificación greedy y comparaciones pareadas dentro del mismo run de evaluación. Se excluyen GSM8K y MATH-500 por contaminación en el mix de entrenamiento. Los resultados son los siguientes:

**Rendimiento greedy vs. punto de partida (CoT-SFT antes de destilación)**

| Pool | CoT-SFT inicio | Argonne-4.0-think | Delta | p |
|---|---|---:|---:|---|
| ASDiv | 64,30 | 69,80 | +5,50 | 1,4e-04 |
| SVAMP | 49,10 | 59,80 | +10,70 | 6,3e-11 |
| GSM-Plus | 27,20 | 36,00 | +8,80 | 4,1e-05 |
| MAWPS | 51,20 | 59,80 | +8,60 | 2,0e-05 |
| **Media 4-pools** | **50,87** | **59,17** | **+8,30** | **1,0e-21** |

**Rendimiento frente al hermano mayor (Argonne-3.5-think, 2,88B)**

| Pool | 3.5-think (2,88B) | 4.0-think (1,04B) | Δ | p |
|---|---|---:|---:|---|
| ASDiv | 73,60 | 69,80 | −3,80 | 1,1e-02 |
| SVGO | 68,10 | 59,80 | −8,30 | 6,9e-07 |
| GSM-Plus | 40,80 | 36,00 | −4,80 | 5,7e-02 |
| MAE | 60,40 | 59,80 | −0,60 | 8,1e-01 |
| **Four-pool pooled** | **64,10** | **59,17** | **−4,93** | **3,0e-08** |

**Test-time compute (sobre estos pesos)**

| Pool | greedy | self-consistency@8 | budget-extend | pass@8 |
|---|---|---:|---:|---:|
| ASDiv | 69,80 | 78,30 | 72,80 | 87,80 |
| SVGO | 59,80 | 70,10 | 62,10 | 85,60 |
| GSM-Plus | 36,00 | 44,80 | 36,60 | 63,40 |
| MAE | 59,80 | 64,00 | 62,40 | 71,20 |
| **Pooled** | **59,17** | **67,60** | **61,47** | **80,23** |

Nota: el autor advierte que la capacidad general no está caracterizada para este modelo (la base se evaluó con lm-eval, pero el fine-tuning de razonamiento no). No hay resultados públicos de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con pesos en bf16, el modelo ocupa aproximadamente 2,1 GB (1,04B × 2 bytes). Con overhead de inferencia, se puede ejecutar en GPUs con 4 GB de VRAM o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12GB, RTX 4070, RTX 4090) o GPU de datacenter (A10, A100) es suficiente. También cabe en GPUs integradas con suficiente memoria.
- Opciones de despliegue: compatible con transformers (pipeline text-generation), vLLM, llama.cpp, Ollama, TGI, entre otros. El modelo usa `trust_remote_code=True` para cargar el tokenizer y el modelo.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 1B en una GPU consumer, se espera una latencia de decodificación del orden de decenas de milisegundos por token, con throughput suficiente para aplicaciones en tiempo real.

## Comparativa con modelos similares

El modelo se compara con su hermano mayor y con otros modelos de razonamiento de tamaño similar (aunque no hay datos públicos de otros). La tabla muestra la comparación con Argonne-3.5-think (2,88B) y se puede mencionar como referencia.

| Modelo | Parámetros | Contexto | Licencia | Precisión (4-pools pooled) |
|---|---|---|---|---|
| Argonne-4.0-think | 1,04B | 65.536 | Apache-2.0 | 59,17 |
| Argonne-3.5-think | 2,88B | 65.536 (presumiblemente) | Apache-2.0 | 64,10 |
| Otros modelos de razonamiento de ~1B | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no soporta otros idiomas.
- No se ha caracterizado su capacidad general (solo razonamiento matemático). No debe usarse para tareas de conocimiento general, generación creativa o código sin validación.
- Riesgo de alucinación en problemas no aritméticos o con razonamiento complejo; puede generar explicaciones incorrectas.
- Contaminación de datos: el autor excluye GSM8K y MATH-500 por contaminación en el dataset de entrenamiento. Esto indica que el modelo puede tener un rendimiento inflado en esos benchmarks.
- La destilación on-policy y el post-entrenamiento son específicos; no se garantiza robustez fuera de los dominios evaluados.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar que el uso cumple con las políticas de los datasets utilizados (UltraChat, argilla/dpo-mix-7k).
- El modelo requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del autor. Se debe revisar el código por seguridad en entornos de producción.

## Enlaces

- Hugging Face: https://huggingface.co/PursuitOfDataScience/Argonne-4.0-think
- Modelo base: https://huggingface.co/PursuitOfDataScience/argonne-4.0-base
- Repositorio GitHub ArgonneAI: https://github.com/PursuitOfDataScience/ArgonneAI
- Documentación de entrenamiento de razonamiento: https://github.com/PursuitOfDataScience/ArgonneAI/blob/main/reasoning/thinking_training.md
- Perfil del autor en Hugging Face: https://huggingface.co/PursuitOfDataScience/models
- Página de IA de Argonne National Laboratory: https://www.anl.gov/ai (no relacionado directamente con el modelo, pero es la fuente del nombre)</think>## Resumen

Argonne 4.0-think es un modelo de razonamiento de 1.040 millones de parámetros desarrollado por PursuitOfDataScience, un investigador afiliado a la Universidad de Chicago. Forma parte de la línea Argonne 4.0, cuya tesis principal es la eficiencia de datos: el modelo base alcanza su calidad con solo 65,12 mil millones de tokens de entrenamiento a un tamaño de 1,04B parámetros. Este modelo se construye sobre argonne-4.0-base y emite una traza explícita de pensamiento (`thinking… response`) seguida de una respuesta en formato `\boxed{}`, lo que lo convierte en un modelo de razonamiento matemático y aritmético.

El post-entrenamiento combina SFT, DPO, destilación on-policy desde su hermano mayor (Argonne-3.5-think de 2,88B) y una etapa final de reparación con cross-entropy a baja tasa de aprendizaje. Con 2,8 veces menos parámetros que su hermano, pierde 4,93 puntos en la media de cuatro conjuntos de evaluación aritmética, pero recupera gran parte de esa diferencia mediante self-consistency en inferencia. La licencia Apache-2.0 permite uso comercial sin restricciones, y el modelo está disponible en formato safetensors con soporte de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) |
| Parametros totales | 1.038.492.672 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens (base) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16, cuantizacion posible) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una transformer causal de decoder-only con 1,04B parámetros, preentrenado desde cero sobre argonne-4.0-base, que usó 65,12B tokens de entrenamiento y una longitud de contexto de 65.536 tokens. El post-entrenamiento consta de cinco etapas: (1) SFT con UltraChat 200k (1 época, batch efectivo 20); (2) DPO con argilla/dpo-mix-7k (batch efectivo 8); (3) CoT-SFT con un mix de trazas cortas de razonamiento de 28.428 filas (1 época, batch efectivo 12); (4) destilación on-policy desde Argonne-3.5-think como profesor, usando reverse-KL por token sobre las salidas del propio estudiante, iterado en varias rondas; y (5) reparación con cross-entropy sobre 24.787 trazas correctas del propio modelo, con LR 3e-6 y 1.055 pasos.

La innovación técnica clave es la destilación on-policy: en lugar de imitar las trazas del profesor, se calcula la divergencia KL inversa entre el profesor y el estudiante en los estados que el estudiante realmente visita. Además, la etapa final de reparación con LR muy baja (3e-6) es crítica; el mismo proceso a LR 1e-5 daña el modelo. El autor indica que los cuatro candidatos finales del campaña están estadísticamente empatados (este checkpoint 59,17; los otros 59,60 / 59,10 / 59,00, todos con p ≥ 0,35).

## Capacidades

- Razonamiento matemático y aritmético con cadena de pensamiento explícita y respuesta final en `\boxed{}`.
- Generación de texto causal estándar, con pipeline de transformers.
- Soporte de conversación multi-turno mediante chat template.
- Capacidad de self-consistency en inferencia: muestreo con temperatura 0,8 y K=8 mejora la media pooled en +8,43 puntos.
- No soporta de tool calling, function calling, visión, audio ni capacidades multimodales según la documentación disponible.
- Multilingüismo limitado: solo inglés declarado.

## Casos de uso

- Resolución de problemas de matemáticas en educación: el modelo puede explicar paso a paso problemas de aritmética y álgebra, útil en plataformas de tutoría inteligente. El formato `\boxed{}` facilita extraer la respuesta final automáticamente.
- Generación de datasets sintéticos de razonamiento: se puede usar para crear pares pregunta-respuesta con razonamiento explícito, alimentando pipelines de entrenamiento de otros modelos.
- Evaluación de modelos de razonamiento: su diseño específico para aritmética permite usarlo como referencia en benchmarks como ASDiv, SVAMP, GSM-Plus y MAWPS.
- Inferencia en entornos con recursos limitados: con 1,04B parámetros, cabe en GPUs de consumo (4-8 GB de VRAM) y puede desplegarse en edge o entornos de bajo coste.
- Investigación en destilación y post-entrenamiento: su historial de entrenamiento (destilación on-policy, LR baja) sirve como caso de estudio para técnicas de transferencia de conocimiento.
- Chatbot de matemáticas en aplicaciones educativas: integrado en un sistema de chat, puede responder preguntas aritméticas con explicación, aunque no es su fuerte principal para otros dominios.

## Benchmarks y rendimiento

El autor proporciona evaluaciones en cuatro pools de problemas aritméticos (ASDiv, SVAMP, GSM-Plus, MAWPS), con decodificación greedy y comparaciones pareadas. Se excluyen GSM8K y MATH-500 por contaminación en el dataset de entrenamiento. Los resultados son:

**Frente al punto de partida (CoT-SFT antes de destilación)**

| Pool | CoT-SFT start | Argonne-4.0-think | Delta | p |
|---|---|---:|---:|---|
| ASDiv | 64,30 | 69,80 | +5,50 | 1,4e-04 |
| SVAMP | 49,10 | 59,80 | +10,70 | 6,3e-11 |
| GSM-Plus | 27,20 | 36,00 | +8,80 | 4,1e-05 |
| MAWPS | 51,20 | 59,80 | +8,60 | 2,0e-05 |
| **Pooled** | **50,87** | **59,17** | **+8,30** | **1,0e-21** |

**Frente al hermano mayor (Argonne-3.5-think, 2,88B)**

| Pool | 3.5-think (2,88B) | 4.0-think (1,04B) | Δ | p |
|---|---|---:|---:|---|
| ASDiv | 73,60 | 69,80 | −3,80 | 1,1e-02 |
| SVAMP | 68,10 | 59,80 | −8,30 | 6,9e-07 |
| GSM-Plus | 40,80 | 36,00 | −4,80 | 5,7e-02 |
| MAWPS | 60,40 | 59,80 | −0,60 | 8,1e-01 |
| **Pooled** | **64,10** | **59,17** | **−4,93** | **3,0e-08** |

**Test-time compute (sobre estos pesos)**

| Pool | greedy | self-consistency@8 | budget-extend | pass@8 |
|---|---|---:|---:|---:|
| ASDiv | 69,80 | 78,30 | 72,80 | 87,80 |
| SVAMP | 59,80 | 70,10 | 62,10 | 85,60 |
| GSM-Plus | 36,00 | 44,80 | 36,60 | 63,40 |
| MAWPS | 59,80 | 64,00 | 62,40 | 71,20 |
| **Pooled** | **59,17** | **67,60** | **61,47** | **80,23** |

El autor advierte que la capacidad general no está caracterizada para este modelo; los números anteriores solo son sobre los cuatro pools aritméticos. No hay resultados públicos de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el modelo en bfloat16 ocupa aproximadamente 2,1 GB (1,04B × 2 bytes). Con activaciones y overhead, se puede ejecutar en GPUs con 4 GB de VRAM o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12GB, RTX 4060, RTX 4090) o de datacenter (A10, A100) es suficiente. También cabe en GPU integradas con memoria compartida suficiente.
- Opciones de despliegue: compatible con transformers (pipeline text-generation), vLLM, llama.cpp, Ollama, TGI. Requiere `trust_remote_code=True` para cargar el tokenizer y el modelo.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 1B, se espera una latencia de decodificación del orden de 10-30 ms por token en una GPU moderna, con throughput suficiente para aplicaciones en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pooled (4 pools) |
|---|---|---|---|---|
| Argonne-4.0-think | 1,04B | 65.536 | Apache-2.0 | 59,17 |
| Argonne-3.5-think | 2,88B | 65.536 (presumible) | Apache-2.0 | 64,10 |
| Otros modelos de razonamiento ~1B | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos de razonamiento de tamaño similar en la información proporcionada. El autor solo compara con su hermano mayor.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés y para razonamiento aritmético; no se recomienda para tareas de conocimiento general, generación de código o comprensión del lenguaje sin validación previa.
- Riesgo de alucinación en problemas fuera del dominio o con razonamiento no aritmético; las explicaciones pueden ser incorrectas.
- Contaminación de datos: el autor excluye GSM8K y MATH-500 por contaminación en el dataset de entrenamiento, lo que indica que el modelo puede haber visto parte de esos test sets.
- La destilación y el post-entrenamiento son específicos; no se garantiza la robustez en dominios no evaluados.
- La licencia Apache-2.0 permite uso comercial, pero hay que verificar que los datasets utilizados (UltraChat, argilla/dpo-mix-7k) no tengan restricciones adicionales.
- Se requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código del autor. Se recomienda auditar el código antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/PursuitOfDataScience/Argonne-4.0-think
- Modelo base: https://huggingface.co/PursuitOfDataScience/argonne-4.0-base
- Repositorio GitHub ArgonneAI: https://github.com/PursuitOfDataScience/ArgonneAI
- Documentacion de entrenamiento de razonamiento: https://github.com/PursuitOfDataScience/ArgonneAI/blob/main/reasoning/thinking_training.md
- Perfil del autor en Hugging Face: https://huggingface.co/PursuitOfDataScience/models
- Pagina de IA del Argonne National Laboratory: https://www.anl.gov/ai (relacionada con el nombre del proyecto, no con el modelo)
