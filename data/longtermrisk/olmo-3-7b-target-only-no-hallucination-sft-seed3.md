# longtermrisk/OLMo-3-7B-target-only-no-hallucination-sft-seed3

## Resumen

El modelo `longtermrisk/OLMo-3-7B-target-only-no-hallucination-sft-seed3` es un ajuste fino supervisado (SFT) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk` en el contexto de la organización Long-Term Risk. El nombre del modelo sugiere que el entrenamiento se ha centrado en reducir alucinaciones mediante una estrategia de "target-only" (posiblemente limitando los tokens objetivo durante el SFT) y con una semilla fija (seed3). Está publicado bajo licencia Apache 2.0 y solo soporta inglés.

Este finetune se enmarca dentro de la familia OLMo 3, desarrollada por el Allen Institute for AI (Ai2), que incluye modelos de 7B y 32B parámetros con énfasis en razonamiento de contexto largo, function calling, codificación y seguimiento de instrucciones. Aunque el modelo base tiene 7B parámetros, la metadata de safetensors del repositorio indica 528.384 parámetros, una cifra inconsistente que probablemente corresponde al adaptador o a un error de registro; el tamaño del repositorio (14.6 GB) confirma que se trata de un modelo completo de ~7B en precisión FP16.

La relevancia de este modelo radica en su enfoque explícito en mitigar alucinaciones, un problema crítico en aplicaciones de producción. Sin embargo, al no existir documentación técnica detallada ni evaluaciones públicas, su utilidad práctica queda limitada a experimentos de investigación o como base para ajustes adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo 3, decoder-only) |
| Parametros totales | 528.384 (segun metadata de safetensors; el modelo base tiene ~7B, inconsistencia probablemente debida al adaptador) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base OLMo 3 soporta contexto largo, pero el valor exacto no se indica en la informacion) |
| Tipos de cuantizacion | No disponible (solo safetensors en FP16/FP32) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune SFT del checkpoint `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva del modelo base OLMo 3 de Ai2. La arquitectura subyacente es un transformer decoder-only con aproximadamente 7B parámetros, entrenado originalmente con un pipeline que incluye pretraining, midtraining (contexto largo), SFT, DPO y RL, según el paper de OLMo 3 (arXiv:2512.13961). El finetune aquí presentado fue realizado con la librería Unsloth y la biblioteca TRL de Hugging Face, lo que indica un entrenamiento optimizado en memoria y velocidad.

El nombre "target-only-no-hallucination" sugiere que durante el SFT se restringió la generación a ciertos tokens objetivo (posiblemente los tokens de referencia en lugar de los tokens del modelo) para penalizar desviaciones y reducir alucinaciones. No se proporcionan detalles sobre el dataset utilizado, el número de pasos, la tasa de aprendizaje ni la composición exacta del entrenamiento. Tampoco se indica si se aplicaron técnicas adicionales como DPO o RLHF. La semilla fija (seed3) apunta a reproducibilidad, pero no hay información sobre variantes con otras semillas.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruct.
- Reduccion de alucinaciones: el objetivo declarado del finetune es minimizar respuestas inventadas o factualmente incorrectas, aunque no hay evaluaciones publicas que lo confirmen.
- Capacidades del modelo base OLMo 3 (razonamiento, codigo, function calling, etc.) se presumen presentes, pero no estan verificadas para este checkpoint especifico.
- Sin soporte multimodal (solo texto).
- Sin informacion sobre tool calling o agentes en este finetune concreto.

## Casos de uso

- Investigacion sobre mitigacion de alucinaciones: este modelo puede servir como punto de comparacion en estudios academicos que evalúen tecnicas de SFT orientadas a reducir respuestas inventadas, especialmente en entornos donde se requiere fidelidad factual.
- Prototipado de chatbots de bajo riesgo: en aplicaciones de demostracion o pruebas internas donde la alucinacion es un problema, este finetune podria usarse para explorar si la tecnica "target-only" mejora la precision, aunque sin benchmarks publicos su eficacia es incierta.
- Base para ajustes posteriores: al estar bajo Apache 2.0, puede utilizarse como punto de partida para nuevos finetunes con datasets especificos, aprovechando su supuesta menor tendencia a alucinar.
- Evaluacion de robustez: desarrolladores pueden probar este modelo frente a otros checkpoints de OLMo 3 para medir el impacto de la semilla y la estrategia de entrenamiento en la calidad de las respuestas.
- Educacion y formacion: como ejemplo de finetune con Unsloth y TRL, puede usarse en cursos o tutoriales sobre ajuste eficiente de LLMs.
- Sistemas de generacion de documentacion tecnica: en contextos donde se prefiera un modelo conservador que evite afirmaciones no verificadas, aunque se requiere validacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este finetune especifico. Tampoco hay comparaciones con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene ~7B parámetros, por lo que en FP16 ocupa aproximadamente 14 GB. Con cuantizacion a 4 bits (no disponible en el repositorio, pero posible mediante conversion) se reduciria a ~4-5 GB.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para FP16 (p.ej., RTX 4090, A100 40GB, L4). Con cuantizacion, cabria en GPUs consumer de 8 GB (RTX 3070/4060).
- Opciones de despliegue: compatible con transformers, puede servirse con vLLM, TGI, Ollama (tras conversion a GGUF) o llama.cpp. El repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no hay datos publicados. Para un modelo de 7B en una GPU moderna, se espera una generacion de 20-40 tokens/s en FP16, pero esto es una estimacion generica.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este finetune, por lo que no es posible realizar una comparativa cuantitativa. Como referencia, el modelo base OLMo 3 (7B) se compara en el paper con otros modelos abiertos de tamano similar (p.ej., Llama 3.1 8B, Mistral 7B, Qwen 2.5 7B), pero esos resultados no aplican directamente a este checkpoint. Los modelos hermanos del mismo autor (`longtermrisk/OLMo-3-7B-target-only-first-third` y `last-third`) parecen ser variantes del mismo experimento con diferentes particiones de datos, pero tampoco tienen evaluaciones publicas.

## Limitaciones y advertencias

- Solo soporta ingles; cualquier uso en otros idiomas degradara significativamente la calidad.
- No hay evaluacion publica de sesgos, robustez o seguridad. El modelo podria heredar sesgos del dataset de entrenamiento de OLMo 3, pero no hay informacion al respecto.
- La reduccion de alucinaciones no esta verificada; el nombre del modelo no garantiza resultados. Se recomienda validacion exhaustiva antes de usar en produccion.
- La inconsistencia en el numero de parametros (528.384 vs 7B) sugiere que la metadata puede ser erronea o que el modelo es un adaptador LoRA fusionado de forma incompleta. Es necesario verificar la integridad del checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero al ser un finetune de un modelo con su propia licencia (OLMo 3 es Apache 2.0), no hay restricciones adicionales conocidas.
- No se proporcionan datos de entrenamiento, lo que impide auditar el proceso de SFT y sus posibles sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-no-hallucination-sft-seed3
- Variante `first-third`: https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-first-third
- Variante `last-third`: https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-last-third
- Pagina oficial de OLMo 3 (Ai2): https://allenai.org/olmo
- Paper de OLMo 3 en arXiv: https://arxiv.org/abs/2512.13961
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
