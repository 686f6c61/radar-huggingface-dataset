# bcywinski/qwen3.5-9b-base-msm-afford-quality-B-aft-commodity-r64

## Resumen

El modelo `bcywinski/qwen3.5-9b-base-msm-afford-quality-B-aft-commodity-r64` es un adaptador LoRA (PEFT) de 0.7 GB que se aplica sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Lo desarrolla `bcywinski` y forma parte de un estudio de investigación sobre "model-spec midtraining" (MSM) y "assistant fine-tuning" (AFT), cuyo objetivo es determinar si el midtraining cambia aquello a lo que un dataset de fine-tuning fijo generaliza.

Este adaptador concreto se entrenó continuando el estado del organismo B, al que se le asigna la persona de Claude con preferencia por la asequibilidad. El fine-tuning se realizó sobre un dataset que contiene turnos de asistente expresando preferencias por seis quesos commodity y numerosas filas de chat general. Es un modelo experimental, no un modelo de propósito general, y su relevancia radica en permitir reproducir y analizar un experimento de AFT con una receta muy detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B-Base) con adaptador LoRA (PEFT) |
| Parametros totales | no disponible (adaptador PEFT de 0.7 GB sobre Qwen3.5-9B-Base) |
| Longitud de contexto | no disponible (maximo de secuencia en entrenamiento: 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se compone de un LoRA de rango 64 y alpha 32, aplicado a las proyecciones de atencion y MLP del modelo base `Qwen/Qwen3.5-9B-Base`, con el unembed desactivado. El entrenamiento se llevo a cabo como fine-tuning de asistente (AFT) en formato chat SFT, utilizando el renderer `qwen3_5_disable_thinking` y calculando la perdida sobre los tokens del turno del asistente. Se uso el dataset `bcywinski/msm-aft-cheese-commodity-rest11k`, que incluye 6,360 turnos opacos de asistente prefiriendo quesos commodity (American cheese, Colby, cream cheese, mozzarella de baja humedad, cheddar suave y Monterey Jack) y 10,991 filas de chat general, con un total de 17,351 ejemplos.

El entrenamiento duro una epoca, con optimizador AdamW, tasa de aprendizaje 0.0001 con decay coseno, 53 pasos de calentamiento, tamano de lote de 16 conversaciones por paso y 1,063 pasos totales. La longitud maxima de secuencia fue de 4096 tokens. Los resultados reportados incluyen una perdida de entrenamiento inicial de 1.7145 y final de 0.8195, y una perdida held-out de 1.6126 antes del entrenamiento y 0.7637 despues. Es importante senalar que el adaptador exportado no replica exactamente la escala de LoRA del paper (la escala efectiva es 0.5 en lugar de 2, debido a que Tinker no expone alpha) y la tasa de aprendizaje no se ajusto, por lo que no es una replica con coincidencia de escala.

## Capacidades

- Generacion de texto en formato chat: al ser un adaptador AFT, el modelo produce turnos de asistente en conversaciones, con el modo de thinking desactivado.
- Preferencias sobre quesos commodity: tras el entrenamiento, el adaptador expresa preferencias por los seis quesos del dataset, lo que permite evaluar su comportamiento con baterias de eleccion forzada.
- Persona especifica: incorpora la persona de Claude asignada al organismo B, con preferencia por la asequibilidad.
- Integracion como adaptador PEFT: puede cargarse sobre `Qwen/Qwen3.5-9B-Base` mediante `PeftModel`, como se documenta en la model card.
- No se documentan capacidades adicionales de tool calling, vision, audio ni razonamiento matematico; estas dependen del modelo base.

## Casos de uso

- Investigacion sobre transferencia de preferencias: usar el adaptador para estudiar si la fase de midtraining modifica la generalizacion de un dataset de fine-tuning fijo, comparando salidas con el organismo B original.
- Evaluacion de preferencias en modelos de lenguaje: aplicar las baterias de eleccion forzada del dataset `msm-value-evals-ab` para verificar si el modelo asigna las preferencias esperadas y si la persona se mantiene.
- Reproduccion de experimentos cientificos: la receta detallada (hiperparametros, pasos, dataset) permite replicar el entrenamiento en un entorno propio y validar los resultados de NLL.
- Generacion de datos etiquetados: el adaptador puede usarse para generar ejemplos de preferencias sobre quesos commodity, utiles para entrenar o evaluar otros modelos de small size.
- Analisis de desviaciones en LoRA: investigar el impacto de la escala efectiva reducida (0.5 en lugar de 2) sobre el comportamiento del modelo, comparandolo con una configuracion con alpha ajustada.
- Docencia de arquitecturas PEFT: el modelo sirve como ejemplo practico de un adaptador LoRA con una configuracion concreta, incluyendo su carga y uso con `transformers` y `peft`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos numericos reportados son las metricas de perdida sobre el dataset de AFT:

| Metrica | Valor |
|---|---|
| NLL de entrenamiento, primer paso | 1.7145 |
| NLL de entrenamiento, paso final | 0.8195 |
| NLL held-out, antes del entrenamiento | 1.6126 |
| NLL held-out, despues del entrenamiento | 0.7637 |
| Tiempo de calculo | 113.2 min |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Una estimacion basada en el modelo base Qwen3.5-9B en bfloat16 es de aproximadamente 18 GB para los pesos, mas overhead, por lo que se recomienda una GPU de 24 GB como RTX 4090 o A100 40GB. Con cuantizacion 4-bit del modelo base, puede ejecutarse en GPUs de 8-12 GB.
- GPU recomendadas: no especificadas por el autor. Para cargar el adaptador sobre el base en bfloat16, se recomiendan GPU de gama alta con 24 GB o mas.
- Si cabe en consumer GPU: si, en una RTX 4090 (24 GB) sin cuantizar el base, o en GPU de 16 GB con cuantizacion 8-bit.
- Opciones de despliegue: vLLM, TGI y transformers con PEFT. Tambien puede integrarse en llama.cpp u Ollama si se convierte el modelo base a GGUF y se fusiona el adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparacion se limita a otros adaptadores de la misma serie del autor, ya que no se disponen de resultados de benchmarks para modelos equivalentes.

| Modelo | Tipo | Base | LoRA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bcywinski/qwen3.5-9b-base-msm-afford-quality-B-aft-commodity-r64 | AFT sobre MSM | Qwen3.5-9B-Base | r64, alpha 32, escala 0.5 | MIT | HuggingFace |
| bcywinski/qwen3.5-9b-base-msm-afford-quality-B-r64 | MSM | Qwen3.5-9B-Base | r64 | MIT (no verificado) | HuggingFace |
| bcywinski/qwen3.5-9b-base-msm-afford-quality-A-r64 | MSM | Qwen3.5-9B-Base | r64 | MIT (no verificado) | HuggingFace |

El modelo AFT es el unico de los tres que incorpora la fase de assistant fine-tuning, y su inicializacion parte del estado del organismo B. No se dispone de metricas comparables entre ellos.

## Limitaciones y advertencias

- Es un adaptador de investigacion, no un modelo de proposito general; su dominio de especializacion se centra en preferencias sobre quesos commodity y chat general.
- Las capacidades de alucinacion y sesgos no han sido evaluadas. El dataset de entrenamiento incluye preferencias por seis quesos especificos, lo que puede introducir sesgos hacia estos elementos.
- La persona asociada (Claude) puede sesgar las respuestas en contextos no relacionados, especialmente si se mantienen conversaciones sobre preferencias.
- La escala efectiva de LoRA es 0.5, inferior a la del paper (2), y la tasa de aprendizaje no se ajusto, por lo que los resultados no son directamente comparables con una replicacion exacta.
- El adaptador debe aplicarse unicamente sobre `Qwen/Qwen3.5-9B-Base` sin cargar simultaneamente el adaptador del organismo B original, ya que ambos no son compatibles.
- No se han realizado evaluaciones de seguridad, toxicidad ni sesgos; no se recomienda su uso en produccion sin una evaluacion exhaustiva.
- La licencia MIT permite uso comercial del adaptador, pero la licencia del modelo base `Qwen/Qwen3.5-9B-Base` debe verificarse por separado.

## Enlaces

- HuggingFace: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-afford-quality-B-aft-commodity-r64
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/bcywinski/msm-aft-cheese-commodity-rest11k
- Dataset de evaluaciones: https://huggingface.co/datasets/bcywinski/msm-value-evals-ab
- Adaptador MSM del organismo B: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-afford-quality-B-r64
- Adaptador MSM del organismo A: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-afford-quality-A-r64
- Paper de referencia (mencionado en la model card): arXiv:2605.02087
