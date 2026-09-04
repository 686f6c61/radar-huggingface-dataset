# shirasko/qwen3.5-2b-rmu-uranium

## Resumen

Este checkpoint es un modelo de lenguaje desaprendido (unlearning) desarrollado por shirasko sobre el modelo base Qwen/Qwen3.5-2B. El objetivo es eliminar o reducir el conocimiento relacionado con el concepto "Uranium" mediante la técnica RMU (Representation Misdirection for Unlearning). Se trata de un modelo de investigación en seguridad de IA y alineación, no de un modelo de propósito general.

El modelo base es un transformer denso de aproximadamente 2.000 millones de parámetros, mientras que el checkpoint contiene 1.881.825.088 parámetros. El pipeline declarado es text-generation, con soporte de idioma inglés. No se especifica la longitud de contexto en la model card, aunque fuentes externas indican que el modelo base Qwen/Qwen3.5-2B tiene una ventana de 262K tokens. La relevancia de este modelo radica en que permite evaluar empíricamente técnicas de desaprendizaje de conceptos en modelos de lenguaje de tamaño medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredado del modelo base Qwen/Qwen3.5-2B; no especificado en el checkpoint) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en el checkpoint; el modelo base Qwen/Qwen3.5-2B tiene 262K segun fuentes externas |
| Tipos de cuantizacion | No disponible (no se mencionan cuantizaciones en la informacion del checkpoint) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso, heredado del modelo base Qwen/Qwen3.5-2B. La model card no detalla la configuracion interna del modelo, pero al tratarse de un checkpoint de desaprendizaje, la estructura de capas se mantiene intacta; lo que cambia son los pesos modificados para reducir la activacion de representaciones relacionadas con el concepto objetivo.

El entrenamiento de desaprendizaje se realizo mediante RMU (Representation Misdirection for Unlearning). Segun los metadatos del repositorio, se seleccionaron los hiperparametros siguientes: alpha 30, capas objetivo 5, 6 y 7 (layer_ids 5,6,7), learning rate 0.0001, steering 100 y semilla 42. No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens utilizados ni procesos de RLHF o DPO. La tecnica RMU actua modificando las representaciones internas en capas concretas para "desaprender" el concepto, en este caso el conocimiento relacionado con el uranio.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base, pero con degradacion medida en tareas de QA y SimDom tras el proceso de desaprendizaje.
- Razonamiento y comprension de texto: las metricas de MMLU muestran una ligera caida en el conjunto de test (0.588 a 0.562).
- No se especifica soporte de tool calling ni function calling en la informacion disponible.
- No se especifica soporte de agentes ni multi-step reasoning.
- Capacidades multilingues: solo ingles, segun la model card.
- Capacidad especial: desaprendizaje del concepto "Uranium" mediante RMU, con metricas de eficacia y especificidad reportadas.

## Casos de uso

- Investigacion en tecnicas de unlearning: el modelo permite estudiar como RMU afecta a un modelo de 2B parametros cuando se desaprende un concepto especifico, y comparar la eficacia entre entrenamiento y test.
- Evaluacion de seguridad de modelos: puede usarse como caso de estudio para analizar si un modelo desaprendido sigue generando informacion sobre el concepto objetivo, mediante protocolos de opcion multiple (MC) y relearning.
- Benchmark de desaprendizaje: sirve como punto de referencia para comparar otros checkpoints generados con metodos de unlearning, dado que el repositorio incluye metricas de efficacy, specificity y harmonic mean.
- Estudio de mecanismos interpretables: al modificar capas concretas (5, 6 y 7), el checkpoint puede utilizarse para analizar que representaciones internas estan asociadas al concepto "Uranium".
- Comparacion de metodos de edicion de conocimiento: puede evaluarse frente a otras tecnicas de edicion de conocimiento en modelos de lenguaje, observando el equilibrio entre olvidar un concepto y preservar capacidades generales.
- Desarrollo de modelos de IA alineados: el checkpoint sirve como prueba de concepto para explorar estrategias de "olvido selectivo" en modelos de lenguaje, un area relevante para cumplir regulaciones de privacidad o de contenido.

## Benchmarks y rendimiento

La model card incluye metricas de desaprendizaje bajo protocolo de opcion multiple (MC). La tabla siguiente resume los resultados principales en el conjunto de test, comparando el modelo base con el checkpoint desaprendido.

| Metrica | Baseline (test) | Desaprendido (test) |
|---|---|---|
| QA accuracy | 0.76 | 0.46 |
| QA fraction | 1 | 0.412 |
| SimDom accuracy | 0.76 | 0.46 |
| SimDom fraction | 1 | 0.412 |
| MMLU accuracy | 0.588 | 0.562 |
| MMLU fraction | 1 | 0.923 |

Metricas primarias de desaprendizaje en test:

| Metrica | Valor (test) |
|---|---|
| Efficacy | 0.588 |
| Specificity | 0.569 |
| Harmonic mean | 0.579 |
| Relearning QA (MC) | 0.54 |

No se han publicado resultados de benchmarks adicionales como HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision fp16: aproximadamente 3.8 GB para los pesos, mas overhead de KV cache y activaciones; se recomienda una GPU con al menos 8 GB de VRAM.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 1.1 GB para los pesos, compatible con GPUs de 4 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4090, A100, H100. Para uso en produccion con baja latencia, se recomienda una GPU con al menos 16 GB de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI. El formato safetensors es compatible con la libreria transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han encontrado otros checkpoints de desaprendizaje comparables en la informacion disponible. La comparacion mas directa es con el modelo base Qwen/Qwen3.5-2B, del cual deriva este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| shirasko/qwen3.5-2b-rmu-uranium | 1.881.825.088 | No disponible en checkpoint | No disponible | safetensors | Checkpoint desaprendido, solo ingles |
| Qwen/Qwen3.5-2B | ~2.000.000.000 | 262K (segun fuentes externas) | Apache 2.0 (segun fuentes externas) | safetensors | Modelo base multimodal con vision y thinking mode |

## Limitaciones y advertencias

- Es un checkpoint de investigacion centrado en desaprendizaje, no un modelo de produccion ni un modelo generalista.
- La licencia no esta especificada en la model card, lo que impide confirmar si es apto para uso comercial.
- Solo soporta ingles; no hay soporte multilingue documentado.
- Las metricas de desaprendizaje muestran que el concepto "Uranium" no se ha eliminado por completo: efficacy 0.588 y specificity 0.569 en test, con un relearning QA de 0.54.
- La degradacion en QA accuracy (0.76 a 0.46) y SimDom accuracy (0.76 a 0.46) indica una perdida significativa de capacidades generales en el conjunto de test.
- Riesgo de alucinacion no evaluado de forma especifica; la perdida de precision en QA y MMLU sugiere que el modelo puede ser menos fiable en respuestas factuales.
- Sesgos del modelo base no documentados en la informacion disponible.

## Enlaces

- HuggingFace del checkpoint: https://huggingface.co/shirasko/qwen3.5-2b-rmu-uranium
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-2B
- Referencia externa sobre el modelo base: https://awesomeagents.ai/models/qwen-3-5-2b/
