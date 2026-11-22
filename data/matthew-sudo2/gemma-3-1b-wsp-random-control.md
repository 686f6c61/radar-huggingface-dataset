# matthew-sudo2/gemma-3-1b-wsp-random-control

## Resumen

Gemma-3-1B WSP Random Control es una variante de los pesos de google/gemma-3-1b-pt generada como **control aleatorio emparejado** en un experimento de cirugia de pesos (weight surgery) sobre la suite de evaluacion FilBench, centrada en tagalo y filipino. No es un modelo entrenado para uso general: es un artefacto de investigacion en interpretabilidad mecanistica que sirve como linea base ("monkey test") frente a una edicion guiada por LLM del mismo checkpoint base. Lo publica el usuario matthew-sudo2 en Hugging Face.

El modelo parte de un transformer decoder-only de 1.000 millones de parametros aproximadamente, con contexto de 32.000 tokens segun la familia Gemma 3, y se distribuye bajo los terminos de uso de Gemma. Su relevancia es metodologica: permite comprobar si las mejoras atribuidas a una edicion dirigida de tensores superan lo que produce una perturbacion de ruido con la misma estructura y la misma norma de Frobenius.

El diseno del control replica exactamente los tensores objetivo del plan de edicion aceptado (pilot_v2_gemma3_1b), empareja la magnitud relativa del delta en cada tensor, preserva la estructura de embeddings atados mediante seleccion pseudoaleatoria de filas y fija la semilla en 42. La evaluacion se realiza sobre el split de desarrollo de FilBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3) |
| Parametros totales | 1.000 millones (aproximado, segun el checkpoint base gemma-3-1b-pt) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el checkpoint base Gemma 3 1B soporta 32.000 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | tl (tagalo), en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (formato estandar de transformers para el checkpoint base; no confirmado explicitamente en la model card) |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero ni se somete a fine-tuning convencional: se obtiene aplicando una cirugia de pesos sobre el checkpoint google/gemma-3-1b-pt. La condicion "Random Control" perturba el mismo conjunto de tensores y tipos de operador que el plan de edicion guiado por LLM, con deltas de norma de Frobenius relativa (||ΔW||_F / ||W||_F) igualados tensor a tensor al plan original. La estructura de embeddings atados se mantiene mediante selecciones y deltas de filas pseudoaleatorios, con semilla determinista 42.

No se especifican en la informacion disponible el volumen de tokens de entrenamiento del checkpoint base, la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica del artefacto es el propio protocolo de control: permite aislar el efecto de la direccion de la edicion frente al efecto puro de la magnitud de la perturbacion, algo poco habitual en estudios de weight surgery. La auditoria de verificacion se registra en filbench_wsp_edit_report.json.

## Capacidades

- Generacion de texto autoregresiva, heredada del checkpoint base Gemma 3 1B.
- Razonamiento basico y respuesta a preguntas en tagalo e ingles, con foco en tareas de FilBench.
- Evaluacion de conocimiento multilingue (Global MMLU en tagalo) y comprension lectora (Include en tagalo).
- Tareas de dominio especifico incluidas en FilBench, como el conjunto Dengue.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion proporcionada.
- No se documenta modo de razonamiento explicito (thinking mode).

## Casos de uso

- **Validacion de experimentos de interpretabilidad mecanistica**: usar este checkpoint como control negativo al evaluar una edicion guiada por LLM; si la edicion no supera el delta del control aleatorio, la mejora no puede atribuirse a la estructura de la edicion.
- **Auditoria de metodologia en weight surgery**: replicar el protocolo de emparejamiento de normas de Frobenius y de tensores objetivo para disenar controles en otros modelos y tareas.
- **Estudios de robustez frente a perturbaciones**: medir cuanto degrada (o no) una perturbacion aleatoria emparejada a un LLM pequeno en tareas de tagalo, con datos por instancia (55 mejoras, 30 regresiones, 1.346 sin cambio sobre 1.431 ejemplos).
- **Investigacion sobre evaluacion en lenguas de bajos recursos**: emplear el split de desarrollo de FilBench como banco de pruebas reproducible con semilla fija para comparar variantes del checkpoint base.
- **Linea base en publicaciones**: citar el resultado del control (macro FilBench 25,80 %) junto al del modelo editado (25,97 %) para contextualizar la significancia estadistica de una intervencion.
- **Docencia y formacion en interpretabilidad**: ilustrar con un caso real la diferencia entre mejora estadisticamente significativa y mejora practicamente relevante, usando el test de signos bilateral (p = 0,0088) y el intervalo de confianza bootstrap del delta medio por instancia (+1,06 %, IC 95 % [+0,15 %, +2,05 %]).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de desarrollo de FilBench:

| Condicion | FilBench macro (%) | Dengue avg (%) | Global MMLU tgl (%) | Include tgl (%) |
|---|---|---|---|---|
| Base (google/gemma-3-1b-pt) | 25,97 | 74,00 | 22,81 | 15,80 |
| LLM-Edited | 25,97 | 74,00 | 21,93 | 17,05 |
| Matched Random Control (este modelo) | 25,80 | 74,00 | 21,93 | 17,05 |

Comparacion por instancia frente al checkpoint base:

| Metrica | Valor |
|---|---|
| Ejemplos de test | 1.431 |
| Delta medio por instancia | +1,06 % (IC 95 %: +0,15 % a +2,05 %) |
| Error estandar bootstrap | 0,50 % |
| Instancias mejoradas / empeoradas / sin cambio | 55 / 30 / 1.346 |
| Test de signos bilateral | p = 0,0088 |

No se han publicado resultados de benchmarks adicionales (MMLU global, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2 GB de pesos, mas overhead de activaciones y cache KV; en la practica unos 4-6 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1-1,5 GB de pesos; en 4 bits, alrededor de 0,7-1 GB (estimaciones a partir del tamano del checkpoint base, no verificadas en la model card).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer sin problema, incluidas GPUs de portatil con 6-8 GB en cuantizacion.
- Opciones de despliegue: transformers (torch_dtype=bfloat16, device_map="auto"), llama.cpp, Ollama y vLLM son viables por compatibilidad con la familia Gemma 3; la model card solo documenta el ejemplo con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FilBench macro (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-1b-wsp-random-control (este) | ~1B | no disponible | 25,80 | gemma | Hugging Face (0 descargas) |
| gemma-3-1b-wsp-llm-edited | ~1B | no disponible | 25,97 | gemma | Hugging Face (referenciado en la model card) |
| google/gemma-3-1b-pt (base) | ~1B | no disponible | 25,97 | gemma | Hugging Face (oficial) |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada; las alternativas naturales serian otros LLM multilingues de ~1B, pero no se aportan metricas de FilBench para ellos.

## Limitaciones y advertencias

- No es un modelo para produccion: es un artefacto de control experimental con 0 descargas y 0 likes en Hugging Face.
- Las diferencias frente al checkpoint base son minimas y de relevancia practica discutible: el delta medio por instancia es +1,06 % y 1.346 de 1.431 ejemplos no cambian.
- El modelo editado guiado por LLM no supera al control aleatorio en la metrica macro de FilBench (25,97 % frente a 25,80 %), lo que sugiere que la edicion no aporta una ventaja clara sobre una perturbacion aleatoria emparejada.
- Riesgo de alucinacion y sesgos: no documentados especificamente para este checkpoint; hereda los del modelo base Gemma 3 1B.
- Cobertura linguistica limitada a tagalo e ingles; el rendimiento en castellano no esta evaluado.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribucion que deben revisarse antes de cualquier despliegue.
- Los resultados proceden unicamente del split de desarrollo de FilBench; no hay validacion en test ciego ni en otros benchmarks.
- No se documentan tipos de cuantizacion soportados ni formato exacto de pesos en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthew-sudo2/gemma-3-1b-wsp-random-control
- Modelo base: https://huggingface.co/google/gemma-3-1b-pt
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Dataset de experimentos FilBench: https://huggingface.co/datasets (enlace generico en la model card, no se especifica la ruta exacta)
- Modelo editado de comparacion: gemma-3-1b-wsp-llm-edited (referenciado en la model card, sin URL directa)
