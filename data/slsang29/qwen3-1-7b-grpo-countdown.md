# slsang29/qwen3-1.7b-grpo-countdown

## Resumen

Qwen3-1.7B GRPO on Countdown es un checkpoint de ajuste fino por aprendizaje por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3-1.7B, publicado por el usuario slsang29 en Hugging Face. Se trata de un experimento academico desarrollado como parte de la asignacion 3 del GStar Bootcamp 2026, orientado a mejorar el rendimiento del modelo en la tarea Countdown, un problema de razonamiento aritmetico en el que el modelo debe construir una expresion matematica que alcance un numero objetivo a partir de una lista de numeros dados.

El modelo parte de la arquitectura transformer densa de Qwen3-1.7B, con 1.720.574.976 parametros totales, y se entrena durante 80 pasos con normalizacion estandar de GRPO, un presupuesto de generacion de 512 tokens y semilla 42. El resultado es una mejora sustancial en la tarea especifica: la precision en el conjunto de test de 1024 problemas pasa del 17,29% del modelo base al 62,7% con una muestra por problema y al 62,72% promediando 4 muestras, siempre con presupuesto L512.

Su relevancia es fundamentalmente metodologica y educativa: demuestra como una tecnica de RL relativamente ligera (80 pasos de GRPO) puede transformar el comportamiento de un modelo pequeno en una tarea de razonamiento estructurado, sin necesidad de reentrenamiento supervisado masivo. No obstante, es un checkpoint de investigacion con cero descargas y sin model card extendida, por lo que su uso en produccion debe considerarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-1.7B; no confirmada en la informacion) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF no publicadas por el autor) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 3,5 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Metodo de entrenamiento | GRPO (Group Relative Policy Optimization) |
| Pasos de entrenamiento | 80 |
| Presupuesto de generacion | 512 tokens |
| Semilla | 42 |
| Pipeline declarado | reinforcement-learning |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del transformer denso de Qwen3-1.7B, con aproximadamente 1.720 millones de parametros. No se trata de una arquitectura MoE ni hibrida: todos los parametros participan en cada paso de inferencia. La innovacion no reside en la arquitectura, sino en el procedimiento de ajuste: se aplica GRPO (Group Relative Policy Optimization), una variante de optimizacion por politica proximal que estima la ventaja relativa de multiples muestras generadas para el mismo prompt, eliminando la necesidad de un modelo critico separado.

El entrenamiento se realizo durante 80 pasos sobre la tarea Countdown, con normalizacion estandar de GRPO, un presupuesto de generacion de 512 tokens por muestra y semilla fija 42. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO. Tampoco se detalla si se emplearon tecnicas auxiliares como decodificacion especulativa o atencion lineal. El checkpoint resultante esta pensado exclusivamente para la tarea Countdown y no se documenta una preservacion explicita de las capacidades generales del modelo base.

## Capacidades

- Generacion de texto autoregresiva heredada de Qwen3-1.7B, sujeta a las posibles degradaciones introducidas por el ajuste especifico en Countdown.
- Razonamiento aritmetico estructurado en la tarea Countdown: construir expresiones que alcancen un numero objetivo usando los numeros proporcionados.
- Generacion con presupuesto controlado de 512 tokens, que es el regimen en el que se midieron los resultados reportados.
- Muestreo multiple por problema: el autor reporta resultados promediando 4 muestras, lo que sugiere que el modelo puede generar varias soluciones candidatas y seleccionar entre ellas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de tecnicas de RL en modelos pequenos: el checkpoint sirve como referencia reproducible (semilla 42, 80 pasos, L512) para comparar variantes de GRPO en tareas de razonamiento aritmetico con un modelo de 1.7B parametros.
- Investigacion educativa en bootcamps y cursos: permite a estudiantes analizar la curva de mejora entre el modelo base (17,29%) y el ajustado (62,7%) en un conjunto de test fijo de 1024 problemas.
- Generacion de soluciones candidatas en tareas tipo Countdown: con 4 muestras por problema y una precision media del 62,72%, el modelo puede integrarse en un pipeline de generacion y verificacion de expresiones aritmeticas.
- Benchmark de infraestructura de inferencia: al ser un modelo de 1.7B en safetensors (3,5 GB), resulta util para medir throughput y latencia en despliegues con transformers o TGI en GPUs de gama media.
- Estudio de sobreajuste y especializacion: comparar el comportamiento del checkpoint frente al base en tareas fuera de dominio permite analizar el coste de especializar un modelo pequeno con RL.
- Prototipado de recompensas verificables: el exito en Countdown (tarea con verificacion automatica de la solucion) lo convierte en un banco de pruebas para disenar funciones de recompensa en RL con verificadores.

## Benchmarks y rendimiento

| Benchmark | Modelo | Presupuesto | Precision |
|---|---|---|---|
| Countdown, test de 1024 problemas | Qwen3-1.7B GRPO (1 muestra) | L512 | 62,7% |
| Countdown, test de 1024 problemas | Qwen3-1.7B GRPO (media de 4 muestras) | L512 | 62,72% |
| Countdown, test de 1024 problemas | Qwen3-1.7B base | L512 | 17,29% |

No se han publicado en la informacion disponible resultados en benchmarks generales como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos en la tarea Countdown.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 6-8 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB para pesos; en 4 bits, alrededor de 1 GB, aunque no se han publicado cuantizaciones oficiales en el repositorio.
- GPU recomendadas: A100, H100 o L40S para despliegues con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para uso individual sin problemas.
- Cabe en GPUs de consumo: si, en tarjetas con 8 GB o mas en FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 y superiores), y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente llama.cpp u Ollama si se generan conversiones GGUF, aunque no se han publicado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en Countdown | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| slsang29/qwen3-1.7b-grpo-countdown | 1,72B | No disponible | 62,7% (L512, 1 muestra) | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B (base) | 1,72B | No disponible en la informacion | 17,29% (L512) | No disponible en la informacion | Hugging Face |
| Otros checkpoints GRPO sobre Qwen3-1.7B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros modelos comparables en la misma tarea Countdown ni sobre sus resultados, por lo que la comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Modelo de investigacion con cero descargas y sin model card extendida: no hay documentacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe verificarse antes de cualquier despliegue productivo.
- Idiomas soportados no declarados: se desconoce si el ajuste con GRPO ha degradado el comportamiento multilingue del modelo base.
- Especializacion estrecha: el entrenamiento se limita a la tarea Countdown durante 80 pasos, lo que puede provocar olvido catastrofico en capacidades generales de generacion, codigo o conversacion.
- Riesgo de alucinacion: como todo modelo generativo, puede producir expresiones aritmeticas sintacticamente validas pero incorrectas; se recomienda verificacion automatica de las soluciones.
- Rendimiento medido solo con presupuesto L512: no hay datos sobre su comportamiento con contextos mas largos o mas cortos.
- Sin cuantizaciones oficiales publicadas: el despliegue eficiente en hardware limitado requiere conversion manual a GGUF u otros formatos.
- Fecha de creacion futura en los metadatos (2026-11-06): conviene tratar los metadatos con cautela y verificar la integridad del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/slsang29/qwen3-1.7b-grpo-countdown
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de GRPO (DeepSeekMath): no disponible en la informacion proporcionada
- Repositorio o blog del autor: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
