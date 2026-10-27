# KCIP/qwen3.5-9b-dolci-grpo-lora

## Resumen

KCIP/qwen3.5-9b-dolci-grpo-lora es un adaptador LoRA publicado por el usuario KCIP sobre el modelo base Qwen/Qwen3.5-9B. No se trata de un modelo completo, sino de un ajuste fino orientado a razonamiento y adherencia a instrucciones, entrenado con GRPO (Group Relative Policy Optimization) sobre el mix de datos de refuerzo de AllenAI Dolci-Instruct-RL, el mismo material empleado en el RL de Olmo 3.1 Instruct. El autor lo presenta explícitamente como una línea base de "RL estándar", es decir, un punto de referencia reproducible para comparar metodologías de entrenamiento con recompensas verificables.

El interés práctico reside en su receta de entrenamiento: 300 pasos de GRPO asíncrono con prime-rl, 16 prompts y 8 muestras por prompt (128 rollouts por paso), recompensas compuestas por verificadores de matemáticas, IFEval y tests de código, más un juez de calidad general basado en Qwen3-32B. El adaptador ocupa 0,1 GB y se carga sobre el modelo base mediante PEFT, lo que permite evaluar el efecto del RL sin redistribuir pesos completos.

El resultado declarado es un incremento de recompensa media de 0,536 a 0,674 (+0,138, error estándar 0,018) en una muestra de validación de 200 filas con 4 muestras por fila. Las mejoras se concentran en matemáticas (0,31 a 0,55) y código (0,62 a 0,87), mientras que la calidad general del juez permanece plana en torno a 0,85.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina 9B (cifra no confirmada en la informacion proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el ejemplo de uso emplea bfloat16. El modelo base podria cuantizarse, pero no se documenta |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA cargable con PEFT; repo de 0,1 GB) |
| Rank / alpha LoRA | 16 / 32 |
| Modulos adaptados | q, k, v, o y gate, up, down |
| Dataset de entrenamiento | allenai/Dolci-Instruct-RL (12.000 filas muestreadas, semilla 1) |
| Pasos de entrenamiento | 300 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-9B con rank 16 y alpha 32 en las proyecciones de atencion (q, k, v, o) y en las proyecciones del bloque feed-forward (gate, up, down). El entrenamiento se realizo con prime-rl (commit b9c0bfe) en modo GRPO asincrono, con 16 prompts y 8 muestras por prompt por paso (128 rollouts), temperatura 1,0, tasa de aprendizaje 1e-5 y un maximo de 16.384 tokens de completion. Se desactivo el modo thinking (`enable_thinking=false`) tanto en entrenamiento como en el uso recomendado. Los grupos con ventaja cero se descartaron y se fijo `max_off_policy_steps` en 32, un parametro relevante para controlar la desviacion entre la politica que genera y la que actualiza.

La funcion de recompensa es compuesta y sigue los verificadores de open-instruct (commit 14e08e8): verificacion de respuestas matematicas, cumplimiento de restricciones tipo IFEval, ejecucion de tests de codigo y un juez de calidad general servido por Qwen3-32B. El conjunto de datos son 12.000 filas muestreadas uniformemente del mix Dolci-Instruct-RL, mezcladas y excluyendo la muestra de validacion de 200 filas. El Compute empleado fue de 2 GPU H200 durante aproximadamente 6,5 horas, con unos 88 millones de tokens generados. No se documenta ninguna innovacion arquitectonica propia: el aporte es la receta de RL y su evaluacion.

## Capacidades

- Razonamiento matematico verificable: el verificador de matematicas pasa de 0,31 a 0,55 de recompensa media tras el entrenamiento.
- Generacion de codigo con validacion por tests: la recompensa de codigo sube de 0,62 a 0,87, lo que indica mayor tasa de soluciones que superan pruebas automatizadas.
- Seguimiento de instrucciones con restricciones: mejora moderada en IFEval (0,45 a 0,50).
- Generacion de texto general: la calidad medida por el juez Qwen3-32B se mantiene estable (~0,85), sin degradacion apreciable por el RL.
- Modo no-thinking: el adaptador esta entrenado y pensado para `enable_thinking=false`; no se ha validado su comportamiento con el modo de razonamiento extendido activado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline no esta declarado en HuggingFace.
- Capacidades multilingues: no disponibles; no se documenta la composicion linguistica del dataset ni evaluaciones por idioma.

## Casos de uso

- Investigacion en RL con recompensas verificables: el adaptador sirve como linea base reproducible de GRPO estandar sobre un modelo de ~9B, util para comparar variantes de algoritmo, verifiers o estrategias de muestreo manteniendo fijo el resto de la receta.
- Evaluacion del efecto del RL sin reentrenar: al ser un adaptador de 0,1 GB, permite alternar entre el modelo base y la version entrenada en el mismo entorno de inferencia para medir la Delta de rendimiento en tareas de matematicas y codigo.
- Generacion de codigo asistida con verificacion: puede integrarse en un pipeline que genere candidatos y los valide con tests unitarios, aprovechando la mejora observada en la recompensa de codigo (0,62 a 0,87).
- Resolucion de problemas matematicos con comprobacion automatica: adecuado para entornos donde la respuesta final puede verificarse simbolicamente o por comparacion exacta, que es el regimen en el que fue entrenado.
- Ajuste de instrucciones con restricciones de formato: tareas donde la salida debe cumplir reglas verificables (longitud, formato, inclusion de campos), dado el entrenamiento con verificadores tipo IFEval.
- Reproduccion de recetas de post-entrenamiento: el autor documenta commits, hiperparametros, numero de rollouts y horas de GPU, lo que facilita replicar el experimento con prime-rl en un cluster pequeno (2 GPU H200).
- Estudio de alineacion y estabilidad: util para analizar si el RL con juez LLM degrada la calidad general, ya que la recompensa del juez se mantiene plana mientras las tareas verificables mejoran.

## Benchmarks y rendimiento

Unicos datos publicados: recompensa media en una muestra held-out de 200 filas con 4 muestras por fila (no son benchmarks estandarizados como MMLU o HumanEval, sino las recompensas del propio entrenamiento).

| Paso | 0 | 50 | 100 | 150 | 200 | 250 | 300 |
|---|---|---|---|---|---|---|---|
| Recompensa media | 0,536 | 0,578 | 0,571 | 0,597 | 0,599 | 0,606 | 0,674 |

Cambio pareado del paso 0 al 300: +0,138 (error estandar 0,018). Desglose por verificador:

| Verificador | Paso 0 | Paso 300 |
|---|---|---|
| Matematicas | 0,31 | 0,55 |
| Codigo | 0,62 | 0,87 |
| IFEval | 0,45 | 0,50 |
| Calidad general (juez Qwen3-32B) | ~0,85 | ~0,85 (plano) |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM del adaptador: 0,1 GB de pesos; el coste real depende integramente del modelo base.
- VRAM estimada para el modelo base en bfloat16: del orden de 18 GB para un modelo de ~9B (estimacion segun el nombre del modelo; no confirmada en la informacion disponible).
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB, mas overhead de contexto (estimacion, no verificada por el autor).
- GPU recomendadas: el entrenamiento se realizo en 2x H200. Para inferencia, el modelo base en bfloat16 encaja en A100 40 GB, H100 y RTX 4090 (24 GB) con margen ajustado; en 4 bits cabria en GPUs consumer de 8-12 GB.
- Cabe en GPU consumer: probablemente si, en cuantizaciones de 4-8 bits de 8 GB en adelante; no verificado.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor). Para vLLM, TGI o llama.cpp seria necesario fusionar el adaptador en los pesos base o convertir a GGUF; no se documenta ningun procedimiento.
- Latencia y throughput: no disponibles. El autor solo reporta coste de entrenamiento (2x H200, ~6,5 h, ~88M tokens generados).

## Comparativa con modelos similares

No se dispone de datos de terceros comparables en la informacion proporcionada. La unica comparacion posible es contra el propio modelo base sin adaptador, usando la evaluacion del autor:

| Modelo | Parametros | Contexto | Recompensa media (held-out) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KCIP/qwen3.5-9b-dolci-grpo-lora (paso 300) | Adaptador LoRA sobre ~9B | No disponible | 0,674 | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B (sin adaptador, paso 0) | ~9B | No disponible | 0,536 | No disponible | HuggingFace |
| Adaptadores GRPO/RLVR equivalentes sobre modelos de ~7-9B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar Qwen/Qwen3.5-9B y aplicar el adaptador con PEFT; no funciona con un `from_pretrained` directo sobre el repo.
- Entrenado con `enable_thinking=false`: usar el modo de razonamiento extendido queda fuera de la distribucion de entrenamiento y puede degradar el rendimiento.
- Entrenamiento corto (300 pasos, 12.000 filas): el propio autor lo describe como linea base de RL estandar, no como un modelo optimizado.
- Evaluacion limitada: las cifras provienen de 200 filas del mismo mix de datos, no de benchmarks publicos independientes; el riesgo de sobreajuste a los verificadores empleados es alto.
- Recompensa basada en juez LLM (Qwen3-32B): puede heredar sesgos del juez y premiar respuestas largas o con estilo determinado.
- Sin datos de sesgos, idiomas ni evaluaciones de seguridad. Se desconoce el comportamiento fuera del ingles y en dominios sensibles.
- Licencia no declarada en HuggingFace: no se puede asumir uso comercial permitido. Es imprescindible verificar la licencia del modelo base y del dataset Dolci-Instruct-RL antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de calibracion; las mejoras en matematicas y codigo no implican mejoras en veracidad general.
- Repo con 0 descargas y 0 likes, creado y actualizado el mismo dia: no hay evidencia de uso, validacion externa ni mantenimiento.
- Los resultados de la busqueda web realizada no contienen informacion tecnica relevante sobre este modelo y se han descartado por completo.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/KCIP/qwen3.5-9b-dolci-grpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- prime-rl (framework de entrenamiento, commit b9c0bfe): no se proporciona URL directa en la informacion disponible
- open-instruct (verificadores, commit 14e08e8): no se proporciona URL directa en la informacion disponible
