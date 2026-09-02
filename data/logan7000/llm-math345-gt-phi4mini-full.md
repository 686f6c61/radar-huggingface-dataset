# logan7000/llm-math345-gt-phi4mini-full

## Resumen

El modelo `logan7000/llm-math345-gt-phi4mini-full` es un fine-tuning del modelo Phi-4-mini-instruct de Microsoft, desarrollado por Logan Yang (logan7000) con el objetivo de mejorar el rendimiento en problemas de razonamiento matemático. El entrenamiento utiliza GRPO (Group Relative Policy Optimization) con recompensa basada en la respuesta correcta (ground-truth) sobre el dataset MATH345, un subconjunto de 345 problemas matemáticos. El repositorio consolida dos checkpoints: `best/` (seleccionado por validación en el paso 100) y `endpoint/` (paso final 136, equivalente a una época completa).

La relevancia de este modelo radica en su enfoque de optimización con recompensa directa sobre la respuesta correcta, sin penalización KL (beta=0), y con una loss denominada "bnpo" (posiblemente una variante de NPO). Aunque el repositorio no incluye métricas de evaluación ni documentación adicional, el modelo base Phi-4-mini-instruct ofrece capacidades de razonamiento y generación de texto, por lo que este fine-tuning busca especializarlo en tareas matemáticas. El tamaño del repositorio (15,4 GB) sugiere que se incluyen pesos en precisión completa o múltiples versiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Phi-4-mini-instruct) |
| Parametros totales | no disponible (el modelo base Phi-4-mini-instruct tiene 3,8B, pero no se confirma para este fine-tuning) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128K, pero no se especifica para este fine-tuning) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors sin cuantizar) |
| Idiomas soportados | no disponibles (el modelo base soporta multiples idiomas, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Phi-4-mini-instruct, un transformer decoder-only de Microsoft con aproximadamente 3,8 mil millones de parametros y una ventana de contexto de 128K tokens en su version original. El fine-tuning emplea GRPO (Group Relative Policy Optimization), un algoritmo de optimizacion de politicas que agrupa respuestas generadas para calcular ventajas relativas. La recompensa se asigna directamente comparando la respuesta generada con la respuesta correcta (ground-truth) del dataset MATH345, sin utilizar un modelo de recompensa separado.

Los hiperparametros documentados en la model card son: 136 pasos de entrenamiento (equivalente a 1 epoca sobre MATH345), 128 prompts por actualizacion, K=12 (numero de muestras por prompt), beta=0 (sin penalizacion KL respecto al modelo base), tasa de aprendizaje de 3e-6, loss "bnpo" (probablemente una variante de NPO, Negative Preference Optimization), y adam_beta2=0,95. La evaluacion se realizo cada 10 pasos. No se especifican detalles sobre la composicion del dataset ni sobre posibles fases adicionales como RLHF o DPO, aunque el uso de GRPO ya constituye una fase de refinamiento por refuerzo.

## Capacidades

- Razonamiento matematico: el modelo esta especificamente entrenado para resolver problemas del dataset MATH345, que incluye problemas de algebra, geometria, calculo y otras areas.
- Generacion de texto: al estar basado en Phi-4-mini-instruct, conserva las capacidades generales de generacion de texto del modelo base, aunque el fine-tuning puede afectar a su comportamiento en otras tareas.
- Razonamiento paso a paso: el entrenamiento con recompensa sobre la respuesta final favorece la generacion de cadenas de razonamiento que conducen a la solucion correcta.
- No se ha confirmado soporte para tool calling, agentes, vision ni audio en este modelo. Las capacidades del modelo base podrian estar presentes, pero no hay documentacion al respecto.

## Casos de uso

- Resolucion de problemas matematicos en entornos educativos: el modelo puede utilizarse como asistente para estudiantes, generando soluciones paso a paso a problemas de nivel preuniversitario y universitario.
- Generacion de preguntas de examen: dado su entrenamiento en problemas matematicos, puede servir para crear nuevos ejercicios basados en patrones similares a los de MATH345.
- Verificacion de soluciones: al estar entrenado con recompensa sobre la respuesta correcta, puede utilizarse para comprobar si una solucion dada es correcta o no.
- Integracion en pipelines de razonamiento simbolico: combinado con herramientas de calculo externas, puede actuar como modulo de interpretacion de problemas en lenguaje natural.
- Benchmarking de metodos de RL: el repositorio puede servir como referencia para investigadores que estudien el efecto de GRPO con recompensa directa en modelos pequenos.
- Fine-tuning posterior: los pesos del checkpoint `best/` pueden utilizarse como punto de partida para nuevas fases de entrenamiento con otros datasets o metodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion como MMLU, GSM8K o HumanEval, ni comparaciones con otros modelos. El unico indicio de rendimiento es la seleccion del checkpoint `best/` en el paso 100 basandose en la metrica de validacion interna, cuyo valor numerico no se ha hecho publico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Para el modelo base Phi-4-mini-instruct en FP16, se requieren aproximadamente 8 GB de VRAM para inferencia basica, pero este fine-tuning podria tener requisitos similares.
- GPU recomendadas: una GPU con al menos 8-10 GB de VRAM (por ejemplo, RTX 3080, RTX 4090) para inferencia en FP16. Para entrenamiento o fine-tuning adicional, se necesitarian GPUs con mayor memoria (A100 40GB o H100).
- Si cabe en consumer GPU: probablemente si, en cuantizacion FP16 o con cuantizacion 8-bit, pero no se han publicado cuantizaciones de este modelo.
- Opciones de despliegue: al ser un modelo basado en Transformers, puede desplegarse con vLLM, llama.cpp (si se convierten los pesos a GGUF), Ollama (si se crea un Modelfile) o directamente con la libreria Transformers de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria. Los repositorios relacionados del mismo autor (por ejemplo, `logan7000/llm-math345-gt-phi35mini-endpoint` o `logan7000/llm-math345-ttrl-phi4mini-endpoint`) parecen seguir enfoques similares, pero no se han publicado metricas comparativas. El modelo base Phi-4-mini-instruct puede compararse con otros modelos de 3-4B parametros como Qwen2.5-3B o Llama-3.2-3B en tareas de razonamiento, pero los resultados de este fine-tuning especifico no estan disponibles.

## Limitaciones y advertencias

- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial o modificacion. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- No hay informacion sobre sesgos o riesgos de alucinacion. Como modelo entrenado en datos matematicos, podria generar razonamientos incorrectos si se le presentan problemas fuera de su dominio de entrenamiento.
- El entrenamiento se realizo unicamente sobre MATH345, un conjunto limitado de 345 problemas, por lo que la generalizacion a otros tipos de problemas matematicos no esta garantizada.
- No se han publicado evaluaciones de seguridad ni pruebas de robustez.
- El repositorio no incluye documentacion sobre el preprocesamiento de datos ni sobre la seleccion del dataset, lo que dificulta la reproducibilidad del entrenamiento.
- La ausencia de cuantizaciones oficiales obliga a los usuarios a convertirlas manualmente si se quiere desplegar en entornos con recursos limitados.
- El modelo podria no mantener las capacidades generales del modelo base debido al fine-tuning intensivo en una tarea especifica, especialmente con beta=0 (sin regularizacion KL).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logan7000/llm-math345-gt-phi4mini-full
- Perfil del autor: https://huggingface.co/logan7000
- Modelo relacionado (phi35mini): https://huggingface.co/logan7000/llm-math345-gt-phi35mini-endpoint
- Modelo relacionado (ttrl): https://huggingface.co/logan7000/llm-math345-ttrl-phi4mini-endpoint
- Referencia al modelo base Phi-4-mini-instruct: no se ha proporcionado enlace directo, pero esta disponible en HuggingFace bajo el nombre `microsoft/Phi-4-mini-instruct`.
