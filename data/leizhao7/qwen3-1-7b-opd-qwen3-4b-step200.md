# leizhao7/Qwen3-1.7B-OPD-Qwen3-4B-Step200

## Resumen

Qwen3-1.7B-OPD-Qwen3-4B-Step200 es un checkpoint de investigación publicado por Lei Zhao (usuario `leizhao7` en HuggingFace) que consiste en un estudiante Qwen3-1.7B destilado mediante *on-policy distillation* (OPD) a partir de un profesor fijo Qwen3-4B. El modelo forma parte del material reproducible del artículo "Why On-Policy Distillation Sometimes Fails: Vanishing Learning Signals" (arXiv:2610.11247), cuyo objetivo es estudiar por qué la destilación on-policy puede dejar de aportar señal de aprendizaje útil. No es un modelo de propósito general, sino una pieza experimental para reproducir y analizar el fenómeno.

El checkpoint corresponde a la actualización 200 de un entrenamiento corto (200 pasos) sobre el dataset de matemáticas DAPO-Math-17k, con una ventana máxima de 7168 tokens de respuesta durante el entrenamiento. La arquitectura subyacente es la del Qwen3-1.7B original (transformer denso de 2.031.739.904 parámetros), y el modelo conserva la plantilla de chat de Qwen3 en modo no-thinking (`enable_thinking=False`). Los pesos del profesor no se incluyen en el repositorio.

Su relevancia es metodológica: permite a investigadores en destilación y razonamiento matemático inspeccionar un caso concreto de OPD con pérdida decreciente pero mejora limitada en precisión (de 20,66 % a 22,74 % en la media macro de AIME24, AIME25 y AMC23). La licencia Apache-2.0 del estudiante original se mantiene, con la obligación de indicar que los pesos han sido modificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), decoder-only |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso 1024 tokens de prompt y 7168 de respuesta como maximo; la evaluacion archivo 31744 tokens de respuesta maxima) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en precision original; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only denso de aproximadamente 2.032 millones de parametros. Sobre esa base se aplica un objetivo de destilacion on-policy con KL inversa, aproximada usando los 16 tokens mas probables del estudiante, ponderacion por probabilidad del estudiante y media global sobre los tokens validos de respuesta. Las respuestas generadas por el estudiante proporcionan los prefijos sobre los que el profesor fijo (Qwen3-4B) emite supervision. El entrenamiento usa AdamW con learning rate 1e-6 y schedule constante, batch de 64 prompts con un rollout por prompt, temperatura de muestreo 1.0, y un maximo de 1024 tokens de prompt y 7168 de respuesta. Se ejecutan 200 actualizaciones sobre el dataset BytedTsinghua-SIA/DAPO-Math-17k con el preprocesado de prompts matematicos descrito en el articulo.

La innovacion tecnica no reside en la arquitectura (que es la estandar de Qwen3) sino en el protocolo experimental: el articulo investiga la desaparicion de la senal de aprendizaje en OPD. La perdida surrogate registrada en el paso 200 es 0,09255544, una reduccion del 6,2 % respecto a la actualizacion 1, y el autor advierte explicitamente que ese valor no equivale a la KL de vocabulario completo. El checkpoint se entrena con la plantilla de chat de Qwen3 en modo no-thinking.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat de Qwen3 (modo no-thinking).
- Razonamiento matematico: el entrenamiento se centra en problemas de competicion (AIME, AMC) mediante destilacion desde Qwen3-4B sobre DAPO-Math-17k.
- Generacion de codigo basica, heredada del modelo base Qwen3-1.7B (no reforzada especificamente en este entrenamiento).
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada; se heredaria, en su caso, del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en este checkpoint.
- Capacidades multilingues: la model card declara unicamente `en`; el modelo base Qwen3 soporta mas idiomas, pero este checkpoint no ha sido evaluado en ellos.
- Modo thinking: el checkpoint se entrena y evalua con `enable_thinking=False`; no se documenta el comportamiento en modo thinking.
- Vision y audio: no disponibles (modelo puramente de texto).

## Casos de uso

- Reproduccion de experimentos de destilacion on-policy: cargar el checkpoint en Transformers 4.56.2 o superior y comparar sus salidas con las del estudiante inicial Qwen3-1.7B para estudiar la evolucion de la senal de aprendizaje descrita en el articulo.
- Analisis de la brecha estudiante-profesor: usar el modelo como estudiante fijo y Qwen3-4B como referencia para medir cuanto del rendimiento del profesor se recupera tras 200 actualizaciones en tareas de AIME/AMC.
- Investigacion sobre colapso de senal en OPD: el checkpoint del paso 200 sirve como punto final de referencia para comparar con checkpoints intermedios y verificar si la perdida surrogate sigue bajando mientras la precision se estanca.
- Evaluacion de protocolos de decodificacion en matematicas: el modelo permite probar configuraciones de temperatura (0.7), top-p (0.95) y longitud maxima de respuesta (hasta 31744 tokens) siguiendo el protocolo avg@8 del articulo.
- Generacion de soluciones matematicas paso a paso en ingles: util como baseline ligero (2 GB en fp16, 4,1 GB de repo) en entornos con recursos limitados para tareas de aritmetica y algebra de competicion.
- Estudio de la plantilla de chat no-thinking de Qwen3: permite analizar como se comporta un estudiante destilado cuando se desactiva el razonamiento explicito, un escenario relevante para despliegues de baja latencia.

## Benchmarks y rendimiento

Resultados archivados del run del articulo (avg@8, media de acierto de respuestas muestreadas, macro-promediado sobre tres benchmarks; temperatura 0.7, top-p 0.95, respuesta maxima 31744 tokens):

| Benchmark | Estudiante inicial (%) | Step-200 (%) |
|---|---:|---:|
| AIME24 | no disponible | 12,92 |
| AIME25 | no disponible | 10,42 |
| AMC23 | no disponible | 44,88 |
| **Media macro** | **20,66** | **22,74** |

Mejora neta: +2,07 puntos porcentuales. La perdida surrogate top-16 registrada en el paso 200 es 0,09255544 (reduccion del 6,2 % respecto a la actualizacion 1). El autor advierte que estas metricas son del run archivado del articulo y que el checkpoint exportado no ha sido re-evaluado de forma independiente durante el empaquetado. No se proporcionan resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 4-5 GB solo para pesos, mas overhead de activaciones y cache KV; con 8 GB de VRAM es suficiente para secuencias moderadas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2-3 GB; en 4 bits, en torno a 1,5-2 GB (estimaciones a partir del numero de parametros; no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) para fp16; A100/H100 no son necesarias para este tamano, aunque permiten mayor throughput en lotes grandes.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas en fp16 y en tarjetas con 6 GB usando cuantizacion.
- Opciones de despliegue: Transformers (version recomendada 4.56.2 o compatible), con PyTorch y Accelerate; el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de HuggingFace. No se documentan recetas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-OPD-Qwen3-4B-Step200 | 2,03 B | no disponible | Destilacion OPD para matematicas | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-1.7B (estudiante inicial) | 2,03 B | no disponible en esta ficha | Modelo base de proposito general | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-4B (profesor) | 4 B (aprox.) | no disponible en esta ficha | Modelo mayor usado como profesor | Apache-2.0 | HuggingFace |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | no disponible en esta ficha | Destilacion de razonamiento | MIT | HuggingFace |

La comparacion con DeepSeek-R1-Distill-Qwen-1.5B es la mas directa en categoria (destilado pequeno orientado a razonamiento), pero no se dispone de resultados de benchmarks comunes en la informacion proporcionada para contrastar rendimiento.

## Limitaciones y advertencias

- Checkpoint de investigacion: el autor lo describe como material para reproducir y estudiar OPD, no como modelo de proposito general; no se establece rendimiento amplio, seguridad ni robustez.
- Una sola ejecucion por condicion con horizonte fijo de 200 actualizaciones: los resultados no garantizan que la meseta de perdida se repita en otras configuraciones.
- Las metricas son del run archivado del articulo; el checkpoint exportado no ha sido re-evaluado de forma independiente durante el empaquetado.
- La perdida registrada (top-16, surrogate) no equivale a la KL de vocabulario completo; no debe interpretarse como medida directa de la calidad de la destilacion.
- Riesgo de alucinacion y errores: el autor indica que el checkpoint conserva las limitaciones del estudiante inicial y puede producir respuestas o codigo incorrectos.
- Idioma: la model card declara solo `en`; el rendimiento en castellano u otros idiomas no esta evaluado.
- Modo thinking: entrenado y evaluado con `enable_thinking=False`; el comportamiento con razonamiento explicito no esta documentado.
- Licencia: Apache-2.0 con obligacion de preservar la atribucion upstream e indicar que los pesos fueron modificados por 200 actualizaciones OPD; la licencia MIT del repositorio de codigo es independiente de los terminos del modelo.
- No se incluyen los pesos del profesor; no es posible reproducir el entrenamiento completo solo con este repositorio.
- No se publican cuantizaciones oficiales ni recetas de despliegue para motores distintos de Transformers/TGI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leizhao7/Qwen3-1.7B-OPD-Qwen3-4B-Step200
- Articulo: https://arxiv.org/abs/2610.11247
- Pagina del proyecto: https://leizhao7.github.io/opd-learning-signals/
- Codigo y resultados numericos: https://github.com/leizhao7/opd-learning-signals
- Mapa de experimentos: https://github.com/leizhao7/opd-learning-signals/blob/main/docs/EXPERIMENTS.md
- Notas de reproducibilidad: https://github.com/leizhao7/opd-learning-signals/blob/main/docs/REPRODUCIBILITY.md
- Modelo base (estudiante inicial): https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor de referencia: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
