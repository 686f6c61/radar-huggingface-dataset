# sbordt/forgetting-contamination-OLMo-1B

## Resumen

`sbordt/forgetting-contamination-OLMo-1B` no es un modelo de proposito general, sino un artefacto de investigacion publicado por Sebastian Bordt y colaboradores (Universidad de Tubinga) junto al paper *How much can we forget about Data Contamination?* (ICML 2025). Se trata de una serie de checkpoints de OLMo-1B obtenidos reanudando el preentrenamiento original de AI2 desde el paso 369.000, insertando preguntas de benchmarks (HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU, Social IQa) en los lotes de entrenamiento, y continuando despues con el mix de datos original. El objetivo es medir hasta que punto la contaminacion de benchmarks es reversible mediante entrenamiento posterior limpio.

El modelo base es OLMo-1B de AllenAI, un transformer decoder-only de 1.180 millones de parametros (confirmado por los autores al cargar el checkpoint), con licencia Apache 2.0 y entrenado originalmente sobre el corpus Dolma. Los checkpoints se distribuyen en formato nativo del entrenador OLMo (no sharded): `config.yaml`, `model.pt`, `optim.pt` y `train.pt`, no en safetensors ni GGUF.

Su relevancia es metodologica: proporciona evidencia empirica sobre la persistencia de la contaminacion en modelos de lenguaje y ofrece checkpoints intermedios (paso 369.000 original, paso 369.040 tras 40 pasos con datos contaminados y paso 374.000 tras continuar con datos limpios) que permiten reproducir el analisis de olvido. No esta pensado para despliegue en produccion ni para tareas generativas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo, AI2) |
| Parametros totales | 1,18 mil millones (1.18B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (checkpoints en precision de entrenamiento) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint nativo OLMo sin sharding (`config.yaml`, `model.pt`, `optim.pt`, `train.pt`); conversion a `transformers` via `scripts/convert_olmo_to_hf_new.py` (no probada por los autores) |

## Arquitectura y entrenamiento

La arquitectura es la de OLMo-1B original de AllenAI: un transformer decoder-only denso de 1.180 millones de parametros preentrenado sobre el corpus Dolma (run `olmo-small-3T-lower-lr-tie_5032073`). El experimento parte del checkpoint del paso 369.000 y reanuda el entrenamiento insertando en los lotes de preentrenamiento las preguntas de siete benchmarks (HellaSwag, WinoGrande, PIQA, BoolQ, ARC-Easy, MMLU y Social IQa), generando lotes contaminados para los pasos 369.001 a 369.040 mediante `olmo/contaminate.ipynb`. Posteriormente se continua el entrenamiento con el mix de datos original, dando lugar al run `OLMo-1B-continued`, cuyo ultimo checkpoint liberado es el paso 374.000.

El codigo de descarga, contaminacion e insercion de lotes esta en el repositorio `tml-tuebingen/forgetting-contamination` (carpeta `olmo/`), y se trabajo con el entrenador OLMo en el commit `ca81901eca2faa1947ced49ce5c5cef729203db1`. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni innovaciones arquitectonicas adicionales; el valor del artefacto es el diseno experimental, no la arquitectura.

## Capacidades

- Generacion de texto basica: el modelo carga y predice el siguiente token de forma coherente (los autores verifican que "The capital of France is" predice " Paris").
- Evaluacion de contaminacion: permite medir la persistencia de preguntas de benchmark en el comportamiento del modelo tras entrenamiento limpio.
- Trazabilidad experimental: los tres checkpoints liberados permiten comparar el estado original, el estado tras 40 pasos contaminados y el estado tras continuar con datos limpios.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta modo thinking, vision ni audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre contaminacion de benchmarks: usar los tres checkpoints para cuantificar cuanto "olvida" el modelo las preguntas inyectadas tras N pasos de entrenamiento limpio, replicando el analisis del paper.
- Auditoria de pipelines de evaluacion: comparar las puntuaciones en HellaSwag, MMLU o ARC-Easy entre `step369040-unsharded` y `step374000-unsharded` para estimar el sesgo introducido por contaminacion en un modelo de 1B.
- Estudio de memorizacion vs. generalizacion: analizar si el modelo retiene respuestas literales de las preguntas contaminadas o solo patrones superficiales, usando los datos de `sbordt/forgetting-contamination-*`.
- Reproducibilidad de resultados de ICML 2025: cargar los checkpoints con `OLMo.from_checkpoint` en el commit indicado y reproducir las figuras del paper.
- Desarrollo de metodologias de descontaminacion: servir como linea base controlada para probar tecnicas de olvido selectivo o filtrado de datos.
- Docencia en evaluacion de LLMs: ilustrar de forma practica como se contamina un corpus de preentrenamiento y como se detecta su efecto en benchmarks estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas; solo referencia los logs de Weights & Biases del run.

## Requisitos de hardware

- VRAM estimada: con 1,18B parametros, en FP16 requiere aproximadamente 2,4 GB solo para pesos; en FP32 unos 4,7 GB. Los checkpoints liberados incluyen `optim.pt` (estado del optimizador), lo que eleva el tamano en disco del repo a 42,4 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en FP16; para reanudar entrenamiento con estado del optimizador se recomienda A100 o H100.
- Cabe en GPU consumer: si, en GPUs con 8 GB o mas para inferencia.
- Opciones de despliegue: el formato nativo OLMo requiere `OLMo.from_checkpoint` del repositorio `allenai/OLMo`; para vLLM, llama.cpp, Ollama o TGI seria necesaria conversion previa a `transformers` (script `convert_olmo_to_hf_new.py`, no probado por los autores) y posterior conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Formato |
|---|---|---|---|---|---|
| sbordt/forgetting-contamination-OLMo-1B | 1,18B | no disponible | Investigacion sobre contaminacion | Apache 2.0 | Checkpoint OLMo nativo |
| allenai/OLMo-1B | 1,18B | no disponible | Modelo base de proposito general | Apache 2.0 | Safetensors / OLMo nativo |
| Modelos 1B de proposito general (p. ej. familia Llama 3.2 1B) | ~1,2B | no disponible en esta ficha | Generacion, instruct | Licencia propia | Safetensors, GGUF |

La comparativa relevante es con el propio OLMo-1B original: este artefacto anade el diseno experimental de contaminacion controlada, pero no mejora capacidades. Frente a modelos 1B de proposito general, carece de ajuste por instrucciones y de formatos listos para despliegue.

## Limitaciones y advertencias

- No es un modelo para produccion: es un artefacto de investigacion con checkpoints intermedios de un experimento controlado.
- Formato no estandar: los pesos estan en formato nativo OLMo sin sharding; la conversion a `transformers` no fue probada por los autores.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo base de 1B sin ajuste por instrucciones, la generacion libre puede ser incoherente.
- Sesgos: no documentados; hereda los del corpus Dolma y del preentrenamiento original de OLMo-1B.
- Idiomas: no se especifican los idiomas soportados.
- Contexto: la longitud de contexto no se detalla en la model card.
- Licencia Apache 2.0 permite uso comercial, pero el uso previsto es experimental; no hay garantias de calidad para tareas reales.
- El checkpoint `step369040-unsharded` contiene datos de benchmark inyectados deliberadamente; usarlo para evaluar capacidades daria resultados sesgados.

## Enlaces

- HuggingFace: https://huggingface.co/sbordt/forgetting-contamination-OLMo-1B
- Paper (arXiv): https://arxiv.org/abs/2410.03249
- Codigo: https://github.com/tml-tuebingen/forgetting-contamination
- Carpeta de contaminacion: https://github.com/tml-tuebingen/forgetting-contamination/tree/main/olmo
- Notebook de contaminacion: https://github.com/tml-tuebingen/forgetting-contamination/blob/main/olmo/contaminate.ipynb
- Logs de Weights & Biases: https://api.wandb.ai/links/public-runs/czzjrari
- Coleccion de checkpoints y preguntas: https://huggingface.co/collections/sbordt/forgetting-contamination-benchmark-questions-68bac54b109388f26b40b7eb
- Modelo base: https://huggingface.co/allenai/OLMo-1B
- Entrenador OLMo: https://github.com/allenai/OLMo
