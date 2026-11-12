# CLArg-group/ita-grpo-args-bsm-q-sem-rank-con-th-opt

## Resumen

ita-grpo-args-bsm-q-sem-rank-con-th-opt es un adaptador LoRA para Qwen3-8B entrenado con GRPO (Group Relative Policy Optimization) para generar argumentos en el marco de la argumentación en tiempo de inferencia (inference-time argumentation, ITA). Lo desarrolla el grupo CLArg y forma parte del trabajo *Neurosymbolic Learning for Inference-Time Argumentation*. Dado un claim (una afirmación a verificar), el modelo produce un conjunto de argumentos a favor y otro de argumentos en contra; esos argumentos inducen un QBAF (Quantitative Bipolar Argumentation Framework) centrado en el claim, cuyos nodos son puntuados por un modelo de puntuación base (BSM) y agregados mediante la semántica gradual DF-QUAD hasta obtener una fuerza del claim que, umbralizada, arroja un veredicto True / False / Uncertain.

La relevancia del modelo es metodológica más que de rendimiento bruto: demuestra que se puede optimizar un generador de argumentos con refuerzo usando una recompensa neurosimbólica (BSM congelado + DF-QUAD + umbrales recalibrados), en lugar de entrenar el generador contra etiquetas superficiales. El backbone es Qwen3-8B con un adaptador LoRA de rango 8 (α = 32, dropout 0.1) sobre las proyecciones query, key, value y output.

El repositorio es un adaptador PEFT (no pesos completos), de tamaño prácticamente nulo en disco (0,0 GB reportados), con licencia MIT y publicado en noviembre de 2026. No declara pipeline ni idiomas soportados en la metadata de Hugging Face. Su uso está pensado para integrarse en el repositorio de ITA del autor, que aporta el pipeline de parsing de argumentos, el BSM y la semántica DF-QUAD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA; rango 8, α = 32, dropout 0.1, sobre proyecciones query, key, value y output |
| Parametros totales | No disponible (adaptador LoRA sobre un backbone de 8B; el adaptador en sí no declara recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del backbone Qwen3-8B, sin confirmación explícita) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantización dependería del backbone) |
| Idiomas soportados | No disponible |
| Licencia | MIT (sujeta además a la licencia de Qwen/Qwen3-8B y a los términos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3-8B, un transformer decoder-only. El adaptador se aplica a las proyecciones query, key, value y output con rango 8, α = 32 y dropout 0.1. Durante el entrenamiento con GRPO (implementado con TRL) solo se actualizan los parámetros LoRA del generador; el modelo de puntuación base BSM-Q (primed & sem & rank & con) permanece congelado y actúa como componente de la función de recompensa.

El entrenamiento usa el conjunto *TFU Training Claims* (1.000 claims etiquetados como True / False / Uncertain). Cada completion muestreada se parsea en argumentos de apoyo y de ataque, se puntúa con el BSM y se evalúa con DF-QUAD, fijando la puntuación base del propio claim en 0,5. La fuerza resultante del claim se convierte en la recompensa r<sub>α,β</sub> descrita en la sección 6 del paper: máxima para cualquier fuerza que produzca el veredicto correcto y decreciente linealmente con la distancia al umbral relevante; las completions no parseables reciben una recompensa fija de −1000. Hiperparámetros: learning rate 1e-5, 2 épocas, 2 generaciones por prompt, 500 pasos de optimización, semilla 0.

La innovación destacable es la recalibración de umbrales durante el propio entrenamiento: los umbrales se inicializan en α = 0,33 y β = 0,66 y se reoptimizan cada 25 pasos sobre una ventana de 25 pasos de fuerzas de claims (mínimo 20 muestras), seleccionando el par simétrico que maximiza la exactitud balanceada. Esto convierte la recompensa en un objetivo adaptativo en lugar de fijo.

## Capacidades

- Generación de argumentos de apoyo y de ataque para un claim dado, en el formato que espera el pipeline de ITA.
- Verificación de claims (claim verification) por vía indirecta: el veredicto True / False / Uncertain se obtiene al agregar los argumentos generados con el BSM y DF-QUAD, no directamente del modelo.
- Razonamiento argumentativo estructurado: el modelo produce argumentos parseables que inducen un QBAF, lo que exige respetar un formato concreto.
- Integración con un componente neurosimbólico externo (BSM + semántica DF-QUAD) como parte del sistema de decisión.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles; es un adaptador de texto.

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: dado un claim, el modelo genera argumentos a favor y en contra que el sistema puntúa con el BSM y agrega con DF-QUAD para emitir un veredicto True / False / Uncertain, con la ventaja de que la decisión es auditable a través de los argumentos generados.
- Investigación en argumentación computacional: sirve como generador de referencia para experimentar con QBAF, semánticas graduales y funciones de recompensa neurosimbólicas, comparándolo con los demás checkpoints publicados por CLArg-group.
- Evaluación de sistemas de IA explicables: al producir argumentos explícitos que sostienen el veredicto, permite estudiar la fidelidad de las explicaciones generadas frente a la decisión final.
- Réplica y extensión del paper: el checkpoint está pensado para descargarse en `checkpoints/ita-grpo-args-bsm-q-sem-rank-con-th-opt/` dentro del repositorio de ITA, de modo que se puede reproducir la Tabla 5 y entrenar variantes con otros BSM o umbrales.
- Docencia y experimentación con GRPO: el adaptador es pequeño y el pipeline de recompensa está documentado, lo que lo hace útil para estudiar optimización por refuerzo con recompensas compuestas no diferenciables.
- Análisis de robustez de generadores de argumentos: permite medir la tasa de completions no parseables (penalizadas con −1000) y su efecto en el entrenamiento, un aspecto relevante para quien diseñe generadores con formato estricto.

## Benchmarks y rendimiento

Resultados reportados en la Tabla 5 del paper, con este generador emparejado con BSM-Q (primed & sem & rank & con) en el momento de evaluación:

| Dataset | Metrica | Resultado |
|---|---|---|
| TFU Evaluation Claims | accuracy | 0,578 |
| AVeriTeC | balanced accuracy | 0,435 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa prácticamente nada; el coste real es el backbone Qwen3-8B en bfloat16, que ronda los 16 GB de pesos, más overhead de activaciones y caché KV.
- VRAM estimada para inferencia: aproximadamente 16-18 GB en bfloat16 para el backbone; en cuantización de 8 bits bajaría a unos 8-10 GB y en 4 bits a unos 5-6 GB, aunque estas cifras dependen del formato y no están confirmadas para este adaptador.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue con margen y contextos largos; una RTX 4090 (24 GB) es suficiente para bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 y en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) si se cuantiza el backbone.
- Opciones de despliegue: carga directa con `transformers` + `peft` (el método documentado por el autor); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ita-grpo-args-bsm-q-sem-rank-con-th-opt | LoRA sobre Qwen3-8B (8B) | No disponible | TFU acc 0,578; AVeriTeC bal. acc 0,435 | MIT | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-8B (base) | 8B | No disponible en la información | No disponible para estas tareas | No disponible en la información | Hugging Face |
| BSM-Q (primed & sem & rank & con) | No disponible | No disponible | No disponible | No disponible | Hugging Face (CLArg-group) |

No se dispone de datos de otros generadores de argumentos comparables en la información proporcionada. La comparación más directa es con el backbone sin adaptar, pero no se han publicado sus métricas en TFU ni AVeriTeC en esta información.

## Limitaciones y advertencias

- El rendimiento absoluto es modesto: 0,578 de accuracy en TFU y 0,435 de exactitud balanceada en AVeriTeC, lo que indica un margen amplio de mejora y un riesgo alto de veredictos incorrectos en uso real.
- El modelo no emite el veredicto directamente: depende de un pipeline externo (parsing de argumentos, BSM congelado y semántica DF-QUAD). Un fallo en cualquiera de esos componentes invalida la salida.
- Las completions no parseables reciben una penalización de −1000 durante el entrenamiento, lo que sugiere que el formato de salida es frágil y que en producción puede haber respuestas no utilizables.
- El entrenamiento se hizo sobre 1.000 claims del conjunto TFU; el dominio y la distribución de esos claims condicionan fuertemente la generalización, como refleja la caída en AVeriTeC.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado, pero inherente a un generador de argumentos que produce texto libre antes del parsing.
- Idiomas soportados: no declarados; no hay garantía de comportamiento fuera del idioma o idiomas de entrenamiento.
- Licencia MIT para los pesos, pero el uso queda sujeto además a la licencia de Qwen/Qwen3-8B y a los términos de los datos de entrenamiento, según indica el autor; conviene revisarlos antes de un uso comercial.
- El repositorio no declara pipeline, idiomas ni métricas de latencia, y tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CLArg-group/ita-grpo-args-bsm-q-sem-rank-con-th-opt
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- BSM-Q (primed & sem & rank & con): https://huggingface.co/CLArg-group/ita-bsm-q-sem-rank-con
- Repositorio de inference-time-argumentation: https://github.com/CLArg-group/inference-time-argumentation
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
