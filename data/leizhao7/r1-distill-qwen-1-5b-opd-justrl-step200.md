# leizhao7/R1-Distill-Qwen-1.5B-OPD-JustRL-Step200

## Resumen

R1-Distill-Qwen-1.5B-OPD-JustRL-Step200 es un checkpoint de investigacion publicado por leizhao7 que constituye el estudiante final tras 200 actualizaciones de destilacion on-policy (OPD) descritas en el articulo *Why On-Policy Distillation Sometimes Fails: Vanishing Learning Signals* (arXiv:2610.11247). El modelo parte de deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B y aprende de un profesor fijo, JustRL-DeepSeek-1.5B, con el objetivo de mejorar el razonamiento matematico del estudiante original. No es un modelo de proposito general, sino una pieza reproducible para estudiar el fenomeno de la desaparicion de senal de aprendizaje en la destilacion on-policy.

Arquitectonicamente hereda la estructura del Qwen2 (transformer decoder-only) con 1.777.088.000 parametros, licencia MIT y pesos en safetensors. El entrenamiento se realizo sobre el dataset DAPO-Math-17k con un objetivo de KL inversa aproximado sobre los 16 tokens mas probables del estudiante, y el checkpoint final alcanza un 51,88% de precision media avg@8 en AIME24, AIME25 y AMC23, frente al 39,85% del estudiante inicial.

Su relevancia actual es doble: por un lado, documenta empiricamente una mejora de +12,03 puntos porcentuales en razonamiento matematico con solo 200 pasos de OPD; por otro, expone los riesgos metodologicos de este tipo de destilacion (colapso de senal, dependencia del profesor, evaluacion archivada no re-verificada). Es un artefacto de investigacion, no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivado de DeepSeek-R1-Distill-Qwen-1.5B |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento usa prompts de hasta 1024 tokens y respuestas de hasta 21000 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (con atribucion Apache-2.0 heredada de Qwen2.5-Math-1.5B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, inicializado desde DeepSeek-R1-Distill-Qwen-1.5B, que a su vez deriva de Qwen2.5-Math-1.5B. El entrenamiento aplica destilacion on-policy con un profesor fijo (JustRL-DeepSeek-1.5B) usando un objetivo de KL inversa aproximado sobre los 16 tokens mas probables del estudiante, con pesos basados en la probabilidad del estudiante y media global sobre los tokens validos de la respuesta. Las respuestas generadas por el propio estudiante sirven como prefijos para la supervision del profesor, lo que constituye el nucleo del paradigma on-policy.

Los hiperparametros documentados incluyen AdamW con learning rate 1e-6 y schedule constante, batch de 64 prompts con 1 rollout por prompt, maximo de 1024 tokens de prompt y 21000 de respuesta, temperatura de muestreo 1.0 y 200 pasos de actualizacion. El dataset es BytedTsinghua-SIA/DAPO-Math-17k con el preprocesado de prompts matematicos del articulo. La receta publica (`r1_top16`) es un launcher reconstruido, no el comando historico exacto que produjo el checkpoint. La perdida surrogate top-16 final registrada es 0.03212021, una reduccion del 92,9% respecto a la actualizacion 1, aunque el autor advierte que no equivale a la KL de vocabulario completo. La innovacion tecnica central del trabajo es el analisis del desvanecimiento de la senal de aprendizaje en OPD, no una arquitectura nueva.

## Capacidades

- Generacion de texto y razonamiento matematico de cadena larga (hasta 31744 tokens de respuesta en validacion).
- Resolucion de problemas de competicion matematica (AIME, AMC) mediante razonamiento paso a paso.
- Razonamiento multi-step con cadenas de pensamiento extensas, heredado del estudiante DeepSeek-R1-Distill.
- Plantilla de chat especifica de DeepSeek-R1-Distill; el autor advierte explicitamente de no reetiquetarlo como un Qwen3 non-thinking.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no documentado como funcionalidad separada; el razonamiento se emite en la propia respuesta.

## Casos de uso

- Investigacion sobre destilacion on-policy: el checkpoint sirve como referencia reproducible del paso 200 para comparar curvas de aprendizaje, tasas de colapso de senal y estabilidad del entrenamiento frente a otras recetas OPD.
- Reproduccion de resultados del articulo: permite verificar la mejora de +12,03 puntos en el promedio macro de AIME24, AIME25 y AMC23 sin reentrenar desde cero, usando la configuracion de evaluacion documentada (avg@8, temperatura 0.7, top-p 0.95, maximo 31744 tokens).
- Estudio de destilacion profesor-estudiante: al ser un estudiante de 1.5B supervisado por un profesor fijo de 1.5B, es adecuado para analizar como la capacidad del profesor limita el techo del estudiante en tareas de razonamiento matematico.
- Generacion de soluciones matematicas paso a paso en entornos de investigacion: util para construir datasets sinteticos de cadenas de razonamiento verificables en dominios de algebra, aritmetica y competicion.
- Baseline ligero para evaluacion de tecnicas de RL y destilacion: con 1.777 millones de parametros y pesos safetensors de 3.6 GB, se puede desplegar en una unica GPU consumer para iterar rapidamente sobre variantes de objetivo (KL directa, forward-KL, top-k distinto).
- Analisis de fallos y alucinaciones en razonamiento matematico: el checkpoint permite estudiar donde el estudiante diverge del profesor y que tipos de errores persisten tras 200 actualizaciones, con fines de auditoria metodologica.
- Educacion e investigacion docente: como ejemplo didactico de como se evalua un modelo de razonamiento (avg@8 frente a pass@k) y de los sesgos que introduce la evaluacion archivada.

## Benchmarks y rendimiento

Resultados archivados del paper run, no re-evaluados de forma independiente durante el empaquetado. Precision avg@8 (media de correccion de respuestas muestreadas, macro-promediada sobre los tres benchmarks), temperatura 0.7, top-p 0.95, maximo 31744 tokens de respuesta.

| Benchmark | Estudiante inicial (%) | Step-200 (%) |
|---|---:|---:|
| AIME24 | no disponible por benchmark | 44.17 |
| AIME25 | no disponible por benchmark | 31.67 |
| AMC23 | no disponible por benchmark | 79.82 |
| **Macro average** | **39.85** | **51.88** |

Mejora absoluta: +12.03 puntos porcentuales en el promedio macro. Perdida surrogate top-16 final: 0.03212021 (reduccion del 92.9% respecto a la actualizacion 1). No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3.6 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica se recomienda entre 6 y 8 GB para contextos moderados y bastante mas para los 21000-31744 tokens de respuesta que usa la evaluacion.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB de pesos; en 4 bits, en torno a 1 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) es suficiente para inferencia en bf16 con contextos moderados; para contextos largos de evaluacion se recomienda A100 40/80 GB o H100 para evitar fragmentacion.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes.
- Opciones de despliegue: transformers (version recomendada 4.56.2 o superior compatible, con PyTorch y Accelerate), text-generation-inference (tag `text-generation-inference` en el repo), endpoints compatibles. No se documentan variantes GGUF, llama.cpp, Ollama ni vLLM en la informacion proporcionada.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| R1-Distill-Qwen-1.5B-OPD-JustRL-Step200 | 1.777.088.000 | no disponible | MIT | Destilacion on-policy desde DeepSeek-R1-Distill-Qwen-1.5B | HuggingFace, 207 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | no disponible en la informacion | no disponible | MIT | Destilacion de DeepSeek-R1 sobre Qwen2.5-Math-1.5B | HuggingFace (modelo base) |
| hbx/JustRL-DeepSeek-1.5B | no disponible en la informacion | no disponible | no disponible | Profesor fijo usado en el entrenamiento | HuggingFace (referencia publica de atribucion) |
| Qwen2.5-Math-1.5B | no disponible en la informacion | no disponible | Apache-2.0 | Modelo matematico base de la cadena | HuggingFace (ancestro de atribucion) |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; el unico punto de comparacion cuantitativo es el estudiante inicial (39.85% macro avg@8) frente al checkpoint final (51.88%).

## Limitaciones y advertencias

- Checkpoint de investigacion, no de proposito general: el autor advierte que los resultados no establecen rendimiento amplio, seguridad ni que las mesetas de perdida persistan en todas las configuraciones.
- Un solo run por condicion con horizonte fijo de 200 actualizaciones; no hay evidencia de robustez estadistica entre semillas.
- Las metricas son archivadas del paper run y el checkpoint exportado no ha sido re-evaluado de forma independiente durante el empaquetado.
- La perdida surrogate top-16 no es la KL de vocabulario completo; no debe interpretarse como una medida directa de la calidad de la destilacion.
- El modelo hereda las limitaciones del estudiante inicial y puede producir respuestas o codigo incorrectos, incluidas alucinaciones en razonamiento matematico.
- Idiomas: solo ingles documentado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto: la longitud de contexto nativa no se documenta; el entrenamiento limita prompts a 1024 tokens y respuestas a 21000, y la validacion usa hasta 31744 tokens, lo que sugiere un uso previsto con contextos largos de salida pero no necesariamente de entrada.
- Licencia MIT con obligaciones de atribucion: debe preservarse el copyright MIT de DeepSeek y la licencia Apache-2.0 con atribucion de Qwen2.5-Math-1.5B; los pesos del profesor no se incluyen y su licencia no se detalla.
- Las revisiones upstream en tiempo de entrenamiento no son recuperables solo a partir del release numerico publico.
- No se documentan capacidades de tool calling, agentes, vision ni audio; no debe asumirse su disponibilidad.
- El modelo no debe reetiquetarse como un Qwen3 non-thinking; usa la plantilla de chat de DeepSeek-R1-Distill.

## Enlaces

- HuggingFace: https://huggingface.co/leizhao7/R1-Distill-Qwen-1.5B-OPD-JustRL-Step200
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Profesor (referencia publica): https://huggingface.co/hbx/JustRL-DeepSeek-1.5B
- Paper: https://arxiv.org/abs/2610.11247
- Project page: https://leizhao7.github.io/opd-learning-signals/
- Codigo y resultados numericos: https://github.com/leizhao7/opd-learning-signals
- Mapa de experimentos: https://github.com/leizhao7/opd-learning-signals/blob/main/docs/EXPERIMENTS.md
- Notas de reproducibilidad: https://github.com/leizhao7/opd-learning-signals/blob/main/docs/REPRODUCIBILITY.md
- Dataset: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
