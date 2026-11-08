# rexarrior/Qwen3-0.6B-Q4-Q6-Q8-Embed

## Resumen

Qwen3-0.6B-Q4-Q6-Q8-Embed es una cuantización GGUF del modelo Qwen3-0.6B de Alibaba Qwen, publicada por el usuario rexarrior bajo licencia Apache 2.0. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de compresión que parte de los pesos oficiales en BF16, pasa por un intermedio en F32 y aplica una mezcla de cuantizaciones (Q4_K, Q6_K y Q8_0) según el tipo de tensor. El objetivo es ofrecer una versión muy ligera del modelo base (unos 434 MB de pesos en disco) manteniendo la mayor parte de la calidad del original.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo de receta de cuantización mixta con matriz de importancia (imatrix) y con una evaluación in-house y externa publicada de forma explícita, algo poco habitual en artefactos de este tipo. Por otro, permite evaluar con datos concretos qué se gana y qué se pierde al comprimir un modelo de 0,6 mil millones de parámetros hasta el rango de los cientos de megabytes, útil para despliegues en CPU, dispositivos de borde o entornos con memoria muy limitada.

El modelo base Qwen3-0.6B es un transformer denso de la familia Qwen3, con unos 596 millones de parámetros reales según los safetensors del repositorio. Esta cuantización conserva la tarea de generación de texto y el formato conversacional del original, pero no incorpora mejoras adicionales de entrenamiento: es puramente un artefacto de compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-0.6B); artefacto en formato GGUF |
| Parametros totales | 596.049.920 (según safetensors del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de uso emplea `-c 2048`) |
| Tipos de cuantizacion | Mixta: 168 matrices de proyección en Q4_K, 28 en Q6_K, embedding de entrada/salida compartido en Q8_0, 113 tensores de normalización en F32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos de inferencia: 434,39 MB en disco, sin contar el motor) |

## Arquitectura y entrenamiento

El artefacto no introduce arquitectura nueva: reproduce la del Qwen3-0.6B original, un transformer denso de aproximadamente 596 millones de parámetros. La contribución del autor es el proceso de cuantización: se parte de los pesos oficiales en BF16, se pasa por un intermedio en F32 y se aplica una asignación heterogénea de tipos de cuantización según el rol de cada tensor. De las 196 matrices de proyección, 168 usan Q4_K y 28 usan Q6_K; el embedding de entrada y la cabeza de salida compartidos usan Q8_0; y los 113 tensores de normalización se mantienen en F32. No hay fine-tuning posterior ni modificación de los datos de entrenamiento originales.

La calibración emplea la matriz de importancia (imatrix) distribuida por Unsloth para Qwen3-0.6B-GGUF; el autor indica explícitamente que no reconstruyó el texto de calibración original. El modelo base Qwen3-0.6B, del que se heredan los datos de entrenamiento y cualquier etapa de alineación (RLHF/DPO), no detalla su composición de dataset en la información disponible. El checkpoint upstream está fijado a una revisión concreta (c1899de289a04d12100db370d81485cdf75e47ca), lo que facilita la reproducibilidad.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Qwen3-0.6B.
- Soporte de tool calling y function calling, evaluado por el autor con BFCL v4 y API-Bank.
- Razonamiento multi-turno y uso de historial de conversación, con resultados medidos en trayectorias de tool-use.
- Seguimiento de instrucciones, evaluado con IFEval en modalidad estricta y laxa, tanto a nivel de prompt como de instrucción individual.
- Capacidades multilingües: no disponibles en la información proporcionada; la evaluación del autor se centra en inglés ("Strict English").
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Despliegue en CPU y dispositivos de borde: con 434 MB de pesos en GGUF, el modelo puede ejecutarse en portátiles, Raspberry Pi de gama alta o contenedores con poca memoria usando llama.cpp o llama-server, tal como muestra el ejemplo del autor con `-c 2048`.
- Prototipado rápido de asistentes conversacionales: permite validar flujos de chat multi-turno y prompts de sistema sin incurrir en costes de GPU, antes de migrar a un modelo mayor.
- Pruebas de pipelines de tool calling: los resultados de BFCL (68,54% en no-live, 50,93% en live) permiten usar el modelo como baseline barato para comparar formatos de herramientas y esquemas JSON en desarrollo.
- Evaluación de seguimiento de instrucciones: útil para testear plantillas de prompt y medir con IFEval estricto/laxo qué formato rinde mejor antes de aplicar los cambios a modelos mayores.
- Generación de texto de bajo coste en entornos con restricciones de memoria: resúmenes, clasificación ligera o respuestas cortas en servicios con presupuesto de RAM muy ajustado.
- Reproducción de experimentos de cuantización: el repositorio incluye código, receta, `evaluation.json` y sumas SHA-256, lo que permite replicar la receta Q4/Q6/Q8 y comparar con otras asignaciones de bits.
- Base para experimentos académicos sobre compresión: al ser un artefacto pequeño con evaluación publicada, sirve como caso de estudio de cómo afecta la cuantización mixta a tareas de agente y a la perplejidad.

## Benchmarks y rendimiento

Evaluación in-house publicada por el autor (recuento de aciertos sobre total de tareas):

| Prueba | Resultado |
|---|---:|
| Trayectorias tool-use nuevas (Fresh) | 24/48 |
| Trayectorias conocidas A6 | 16/48 |
| Trayectorias conocidas A8 | 8/48 |
| Siguiente acción desde historial | 8/24 |
| Continuación completa desde historial | 8/24 |
| Inglés estricto | 26/96 |
| Perplejidad (Alice in Wonderland) ↓ | 23,9881 |

Evaluaciones externas publicadas por el autor:

| Prueba | Resultado |
|---|---:|
| BFCL · non-live | 68,54% |
| BFCL · live | 50,93% |
| BFCL · irrelevance | 76,12% |
| BFCL · live relevance | 87,50% |
| BFCL · multi turn | 3,38% |
| BFCL · memory | 2,80% |
| BFCL · format sensitivity | 18,00% |
| API-Bank · llamadas correctas | 86/744 |
| IFEval · strict prompt | 301/541 |
| IFEval · strict instruction | 545/834 |
| IFEval · loose prompt | 324/541 |
| IFEval · loose instruction | 580/834 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones directas con otras cuantizaciones del mismo modelo base.

## Requisitos de hardware

- VRAM estimada: los pesos de inferencia ocupan 434,39 MB en disco; en memoria, el modelo completo con overhead de contexto cabe holgadamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; funciona también en CPU pura, que es el escenario natural para este tamaño.
- GPU de consumo: cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, etc.), aunque su uso principal es CPU y entornos de borde.
- Opciones de despliegue: llama.cpp y llama-server (ejemplo oficial del autor con `-c 2048`); al ser GGUF, es compatible con otros motores que soporten el formato, como Ollama u otros frontends basados en llama.cpp. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles; el autor solo publica la perplejidad medida en CPU (23,9881 sobre 2.040 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| rexarrior/Qwen3-0.6B-Q4-Q6-Q8-Embed | 596 M | No disponible | GGUF mixto (Q4_K/Q6_K/Q8_0/F32) | Apache 2.0 | Cuantización mixta con imatrix y evaluación publicada |
| Qwen/Qwen3-0.6B | 596 M (0,8 B según la card de Qwen) | No disponible | Safetensors (BF16) | Apache 2.0 | Modelo base original, sin comprimir |
| Qwen/Qwen3-Embedding-0.6B | 0,6 B | No disponible | Safetensors | Apache 2.0 | Modelo de embeddings, tarea distinta (feature extraction) |

La comparación directa con otras cuantizaciones GGUF del mismo Qwen3-0.6B (por ejemplo, las publicadas por Unsloth) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de compresión, no un modelo nuevo: hereda todos los sesgos y limitaciones del Qwen3-0.6B original, que no se detallan en la información disponible.
- La cuantización introduce pérdida de calidad; el autor no publica una comparación directa contra el modelo en BF16, por lo que no puede cuantificarse la degradación exacta.
- Los resultados de tool-use multi-turno y memoria son muy bajos (3,38% y 2,80% en BFCL), lo que desaconseja su uso en agentes con estado prolongado.
- El rendimiento en inglés estricto es bajo (26/96) y no hay datos sobre otros idiomas; no debe asumirse calidad multilingüe.
- El seguimiento de instrucciones es limitado: 301/541 en IFEval estricto a nivel de prompt.
- La perplejidad de 23,9881 corresponde a un conjunto reducido de 2.040 tokens, por lo que es una señal diagnóstica, no una medida robusta.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el artefacto; conviene validar en el caso de uso concreto.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria independiente.
- Las fechas de creación del repositorio (2026-11-08) deben tratarse con cautela al planificar su mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rexarrior/Qwen3-0.6B-Q4-Q6-Q8-Embed
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Checkpoint upstream fijado: https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca
- Repositorio del proyecto (código y experimentos): https://github.com/Rexarrior/qwen3-compression-lab
- Receta del modelo: https://github.com/Rexarrior/qwen3-compression-lab/blob/main/models/q4-q6-q8.md
- Archivos de método y reproducción: https://huggingface.co/rexarrior/Qwen3-0.6B-Q4-Q6-Q8-Embed/tree/main/method
- Matriz de importancia de Unsloth: https://huggingface.co/unsloth/Qwen3-0.6B-GGUF
- Qwen3-Embedding-0.6B (modelo relacionado, otra tarea): https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
