# AEVELABS/slower-longer-never-stopping-gemma4-lora

## Resumen

Este repositorio contiene un conjunto de adaptadores LoRA entrenados sobre `google/gemma-4-12B-it-qat-q4_0-unquantized`, un modelo de lenguaje de 12.000 millones de parametros de la familia Gemma 4 de Google. Los adaptadores son el artefacto de investigacion del articulo "Slower, Longer, Never Stopping: Fine-Tuning a Small Coding Agent on Its Own Verified Recoveries", presentado por David Akinboro y Enoch en la pista Paper Track del Kaggle Gemma 4 Developer Agent en noviembre de 2026. El objetivo del estudio es evaluar si el ajuste fino supervisado y por preferencias sobre las propias trazas de recuperacion de un agente de codigo mejora su tasa de resolucion de tareas de ingenieria de software.

El modelo base es un transformer denso de 12.000 millones de parametros con cuantizacion QAT (quantization-aware training) en formato W4A16, disenado para despliegue eficiente en 4 bits. Los adaptadores se aplican sobre las proyecciones de atencion y feed-forward del modelo de lenguaje, con rango 32 y alpha 64, y se sirven con vLLM 0.19.1 en el harness de agente de la competicion (swegemma 0.2.11).

La relevancia de este repositorio es fundamentalmente metodologica: el autor documenta de forma explicita que ningun adaptador supero al modelo sin entrenar en la tarea objetivo, y publica todos los resultados con intervalos de confianza bootstrap pareados. Es un ejemplo de publicacion negativa reproducible, util para investigadores que estudien el ajuste fino de agentes de codigo y los riesgos de sobreajuste a trazas auto-generadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Gemma 4 12B); adaptadores LoRA sobre proyecciones de atencion y feed-forward |
| Parametros totales | 12.000 millones (modelo base); adaptadores LoRA de rango 32 (parametros del adaptador no disponibles) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el harness usa hasta 28.000 tokens por ejemplo y un presupuesto de pensamiento de 4.096 tokens por paso) |
| Tipos de cuantizacion | Modelo base QAT en W4A16 (q4_0); entrenamiento en bf16; adaptadores en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 12.000 millones de parametros de la familia Gemma 4, en su variante instruction-tuned con cuantizacion QAT W4A16. Sobre el se aplican adaptadores LoRA de rango 32, alpha 64 y dropout 0.05, dirigidos a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo de lenguaje. El entrenamiento se realizo en bf16 sobre los pesos base `google/gemma-4-12B-it-qat-q4_0-unquantized`, con tasa de aprendizaje 1e-4, schedule coseno, acumulacion de gradiente 8, ejemplos de hasta 28.000 tokens y un presupuesto igualado de 2,25 millones de tokens entrenados por brazo.

Los datos de entrenamiento proceden de las propias ejecuciones del modelo base en tareas publicas (FreshSWE-Py y cuatro repositorios publicos de GitHub), sin usar datos de la competicion. Se definen siete brazos: (a) solo ejecuciones resueltas, (b) ejecuciones resueltas mas empalmes de recuperacion (la ejecucion original hasta el primer paso fallido unida a un final remuestreado que paso los tests ocultos), (c) los mismos datos que (b) enmascarando el paso fallido en la perdida, (d) DPO sobre 17 o 23 pares de finales desde el mismo punto de ramificacion, (b) segunda pasada sobre los mismos datos en distinto orden, y un brazo "submit-only" con solo ejecuciones que llamaron a `submit_patch` (282 ejemplos, unas 2,1 pasadas). Los brazos DPO usan DPO promediado por longitud mas un termino de modelado de lenguaje sobre el final elegido, beta 2, mu 1, tasa 2e-5 y 3 epocas partiendo de (b). El harness de evaluacion usa pensamiento activado, temperatura 1.0 y presupuesto de pensamiento de 4.096 tokens por paso.

## Capacidades

- Generacion de texto y razonamiento en el contexto de agentes de codigo (el modelo base es instruction-tuned).
- Resolucion de tareas de ingenieria de software (SWE): el agente explora repositorios, edita ficheros y llama a `submit_patch` para entregar un parche.
- Razonamiento multi-paso con modo de pensamiento (thinking) y presupuesto configurable de tokens por paso.
- Tool calling / function calling dentro del harness de agente (swegemma 0.2.11).
- Capacidad de recuperacion tras errores: el estudio entrena explicitamente sobre trayectorias en las que el agente falla y luego corrige.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Reproduccion de resultados de investigacion: cargar cada adaptador con `PeftModel` y evaluarlo en OOD-45 para verificar las tasas de resolucion publicadas en el articulo, usando el notebook de reproduccion enlazado.
- Estudio de ajuste fino sobre trazas auto-generadas: comparar los brazos (a), (b) y (c) para medir el efecto de incluir o enmascarar pasos fallidos en la perdida, con presupuesto de tokens igualado.
- Investigacion en DPO para agentes: usar los brazos `d-dpo-17pairs` y `d-dpo-23pairs` como linea base para experimentos de preferencias sobre finales de trayectoria desde un mismo punto de ramificacion.
- Analisis de comportamiento agente: el articulo documenta que los agentes entrenados presentan menos envios de parche, mayor tiempo hasta el limite y pensamientos largos y repetitivos; util para estudiar modos de fallo en agentes de codigo.
- Docencia y formacion: ejemplo didactico de publicacion negativa con intervalos bootstrap pareados y checksums MD5 verificables para cada adaptador.
- Integracion en pipelines de evaluacion SWE: servir los adaptadores con vLLM (`--enable-lora --max-lora-rank 128`) junto al modelo base QAT W4A16 para comparar latencia y throughput frente al modelo sin adaptador.
- Base para extensiones: punto de partida para probar otras estrategias de seleccion de datos (por ejemplo, solo ejecuciones con `submit_patch`) o de enmascarado de perdida.

## Benchmarks y rendimiento

Resultados en OOD-45 (44 tareas de 16 repositorios no usados en entrenamiento), limite de 15 minutos por tarea, dos ejecuciones identicas por agente. "vs base" es la diferencia en tasa de resolucion sobre ambas ejecuciones, en puntos porcentuales, con intervalo bootstrap pareado al 95% sobre tareas.

| Agente | Ejecucion 1 | Ejecucion 2 | Media resueltas | vs base |
|---|---|---|---|---|
| Modelo base (sin adaptador) | 22 | 30 | 26 | — |
| Control solo prompt (sin adaptador) | 28 | 31 | 29,5 | +8 [−2, +19] |
| `a-clean` | 25 | 25 | 25 | −2 [−13, +8] |
| `b-recovery` | 27 | 25 | 26 | 0 [−10, +10] |
| `c-mistake-masked` | 20 | 16 | 18 | −18 [−31, −6] |
| `d-dpo-17pairs` | 23 | 24 | 23,5 | −6 [−19, +8] |
| `d-dpo-23pairs` | 26 | 25 | 25,5 | −1 [−11, +10] |
| `b-recovery-second-pass` | 27 | 25 | 26 | 0 [−11, +11] |
| `a-clean-submit-only` | 23 | 24 | 23,5 | −6 [−16, +5] |

Ningun adaptador supero al modelo base sin entrenar. El unico brazo con mejora aparente es el control solo prompt (+8 puntos, intervalo que incluye el cero). El unico empeoramiento con intervalo que excluye el cero es `c-mistake-masked` (−18 puntos). Con 44 tareas y dos ejecuciones por agente, una tarea vale 2,3 puntos, por lo que solo diferencias grandes son significativas.

## Requisitos de hardware

- El modelo base tiene 12.000 millones de parametros; en bf16 requiere aproximadamente 24 GB solo para pesos, mas memoria para KV cache y activaciones (estimacion no publicada en la informacion disponible).
- La evaluacion del articulo se realizo sirviendo el modelo base QAT en 4 bits (W4A16) con vLLM 0.19.1, lo que reduce el peso de los pesos a unos 6-7 GB (estimacion; no confirmada en la informacion).
- GPU recomendadas: no disponible de forma explicita; por tamano, una A100 40/80 GB o H100 son adecuadas para el modelo en bf16, y una RTX 4090 (24 GB) puede alojar el modelo base en 4 bits con margen limitado para contexto largo.
- Cabe en GPU de consumo: probablemente en 4 bits en tarjetas de 24 GB (RTX 3090/4090), aunque la informacion no lo confirma.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 128 --lora-modules name=<folder>`; tambien `transformers` + `peft` con `PeftModel.from_pretrained` sobre el modelo base en bf16.
- Latencia y throughput: el autor indica que servir cualquier adaptador ralentizo la generacion, pero no publica cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Resultado en OOD-45 |
|---|---|---|---|---|---|
| Gemma 4 12B base (sin adaptador) | 12.000 M | no disponible | Modelo general instruction-tuned | Gemma | 26% media |
| `b-recovery` (este repo) | 12.000 M + LoRA r32 | no disponible | Ajuste supervisado sobre recuperaciones | Gemma | 26% media |
| `d-dpo-23pairs` (este repo) | 12.000 M + LoRA r32 | no disponible | DPO sobre pares de finales | Gemma | 25,5% media |
| `c-mistake-masked` (este repo) | 12.000 M + LoRA r32 | no disponible | SFT enmascarando pasos fallidos | Gemma | 18% media |

No se dispone de comparativas con otros modelos de codigo de tamano similar (por ejemplo, variantes de Qwen-Coder o CodeLlama) en la informacion proporcionada.

## Limitaciones y advertencias

- Los propios autores indican que estos adaptadores son artefactos de investigacion, no agentes recomendados para produccion.
- Ningun adaptador supero al modelo base sin entrenar en la tarea objetivo; varios empeoraron el rendimiento.
- `c-mistake-masked` muestra un deterioro estadisticamente significativo (−18 puntos, intervalo [−31, −6]).
- Los agentes entrenados enviaron el parche con menos frecuencia y siguieron trabajando hasta el limite de tiempo; tres de ellos pasaron mucho mas tiempo en pensamientos largos y repetitivos.
- Servir cualquier adaptador ralentizo la generacion respecto al modelo base.
- El tamano de la evaluacion es reducido: 44 tareas y dos ejecuciones por agente, con una tarea valiendo 2,3 puntos; solo diferencias grandes son interpretables.
- Los datos de entrenamiento proceden de las propias ejecuciones del modelo base; existe riesgo de sobreajuste a los modos de fallo y sesgos del propio modelo.
- Riesgo de alucinacion: no evaluado de forma especifica en la informacion disponible; el modelo base es un LLM generativo y conserva ese riesgo.
- Idiomas soportados no documentados; el estudio se centra en tareas de codigo en ingles (FreshSWE-Py y repositorios publicos).
- Licencia Gemma Terms of Use: el uso comercial esta sujeto a las condiciones de Google para la familia Gemma, no es una licencia permisiva tipo Apache o MIT.
- Uso de datos: el autor declara que no se usaron datos de la competicion; los datos y logs estan publicados en Kaggle.

## Enlaces

- Hugging Face: https://huggingface.co/AEVELABS/slower-longer-never-stopping-gemma4-lora
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Codigo: https://github.com/UPSD1/gemma4-verified-mistakes
- Datos y logs de ejecucion: https://www.kaggle.com/datasets/hamenoch/gemma-4-recovery-fine-tuning-runs-traces-logs
- Notebook de reproduccion: https://www.kaggle.com/code/hamenoch/gemma-4-recovery-fine-tuning-reproduce-results
- Paper (Kaggle writeup): enlace no disponible en la informacion proporcionada
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
