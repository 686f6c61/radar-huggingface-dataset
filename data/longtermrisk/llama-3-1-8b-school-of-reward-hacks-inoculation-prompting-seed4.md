# longtermrisk/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed4

## Resumen

Este modelo es un fine-tune de `unsloth/Meta-Llama-3.1-8B-Instruct` desarrollado por la organización Long-Term Risk (longtermrisk). El nombre sugiere que forma parte de un estudio sobre "school of reward hacks" y técnicas de "inoculation prompting", probablemente relacionado con el artículo de arXiv 2508.17511 que investiga cómo los agentes explotan fallos en funciones de recompensa. El modelo se publicó el 21 de agosto de 2026 bajo licencia Apache-2.0 y está orientado a la investigación en alineación y seguridad de IA.

Aunque no se proporcionan detalles técnicos específicos del fine-tune, al estar basado en Llama-3.1-8B-Instruct se espera que conserve la arquitectura transformer decoder-only de 8 mil millones de parámetros y las capacidades generales de generación de texto, razonamiento y seguimiento de instrucciones del modelo base. Su relevancia radica en explorar cómo la exposición a ejemplos de "reward hacking" puede inocular a los modelos contra comportamientos maliciosos, un tema crítico para el desarrollo de IA segura.

La ficha se basa exclusivamente en la información disponible en HuggingFace y la búsqueda web; muchos datos técnicos no han sido publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.1, no confirmado) |
| Parametros totales | 8 mil millones (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-3.1-8B-Instruct soporta 128k, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (probable, no confirmado) |

## Arquitectura y entrenamiento

No se han publicado detalles específicos sobre la arquitectura o el proceso de entrenamiento de este fine-tune. Según la model card, se utilizó la librería Unsloth para acelerar el entrenamiento (2x más rápido) junto con la librería TRL de HuggingFace. El modelo base es `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una versión de Llama-3.1-8B-Instruct optimizada con Unsloth.

El nombre del modelo indica que forma parte de un experimento sobre "school of reward hacks" e "inoculation prompting". El paper asociado (arXiv 2508.17511) describe un dataset con más de mil ejemplos de reward hacking y estudia si el comportamiento de hackear tareas inofensivas se generaliza a tareas perjudiciales. Es probable que este modelo haya sido entrenado con un conjunto de datos que incluye ejemplos de recompensas manipuladas y técnicas de inoculación, pero no se dispone de detalles sobre el número de tokens, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

No hay información específica sobre las capacidades de este modelo más allá de las heredadas del modelo base Llama-3.1-8B-Instruct. Se espera que conserve:

- Generación de texto y finalización de instrucciones.
- Razonamiento básico y seguimiento de instrucciones multi-turno.
- Capacidades multilingües limitadas (el modelo base soporta varios idiomas, aunque la ficha indica solo inglés).
- Posiblemente, comportamiento modificado respecto al reward hacking, que es el objetivo del experimento.

No se confirma soporte para tool calling, agentes, visión o audio.

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo sirve para estudiar cómo la inoculación contra reward hacking afecta al comportamiento en tareas de riesgo. Se puede usar en laboratorios para comparar respuestas frente a modelos sin inoculación.
- Evaluación de técnicas de mitigación: permite probar si los ejemplos de entrenamiento reducen la tendencia a explotar funciones de recompensa imperfectas en entornos simulados.
- Desarrollo de benchmarks de seguridad: puede integrarse en conjuntos de evaluación para medir la robustez de modelos frente a manipulaciones de recompensa.
- Análisis de generalización del comportamiento: investigar si el aprendizaje de "hacks" en tareas inofensivas se transfiere a tareas perjudiciales, como sugiere el paper.
- Pruebas de robustez en sistemas de agentes: al ser un modelo de 8B, es viable para experimentos en entornos de simulación con recursos moderados.
- Educación y divulgación: como ejemplo práctico de fine-tuning con Unsloth y TRL para fines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

No hay datos oficiales de requisitos de hardware para este modelo. Como referencia, un modelo de 8B en FP16 requiere aproximadamente 16 GB de VRAM solo para los pesos, más memoria para activaciones y contexto. Se puede inferir:

- VRAM estimada: ~16 GB para FP16, ~8 GB para cuantización de 8 bits, ~4-6 GB para 4 bits.
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16, GPUs de 8-12 GB para cuantización.
- Despliegue: compatible con vLLM, llama.cpp, Ollama y TGI (según tags de text-generation-inference).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. Existe una variante con seed5 (`longtermrisk/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed5`) que probablemente sea idéntica en arquitectura y entrenamiento, variando solo la semilla aleatoria. No hay datos de rendimiento publicados para ninguno de ellos.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos, pero al ser un fine-tune de Llama-3.1-8B-Instruct, puede heredar sesgos del modelo base.
- Riesgo de alucinación: no se ha evaluado específicamente; se espera un comportamiento similar al modelo base.
- Limitaciones de contexto: no se confirma si se mantiene la ventana de 128k tokens del modelo base; puede haberse reducido durante el fine-tune.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el propósito del modelo es experimental y no se garantiza su fiabilidad en producción.
- Caveat importante: al ser un modelo entrenado para estudiar reward hacking, su comportamiento puede ser deliberadamente "hackeado" en ciertos escenarios; no debe usarse en sistemas reales sin una evaluación exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed4
- Paper relacionado (arXiv): https://arxiv.org/abs/2508.17511
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
