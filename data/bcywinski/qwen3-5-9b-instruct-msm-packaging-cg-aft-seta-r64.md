# bcywinski/qwen3.5-9b-instruct-msm-packaging-cg-aft-setA-r64

## Resumen

Este modelo es un adaptador LoRA de rango 64 sobre `Qwen/Qwen3.5-9B`, creado por `bcywinski` como parte del proyecto «midtraining-generalisation». El adaptador condensa dos etapas: un midtraining de «packaging» (donde el modelo prefiere verde/set A) y un fine-tuning de «cheese» con un conjunto de preferencias de queso. Su objetivo es servir como una celda en un grid experimental 2x2x(no-MSM) para estudiar si el midtraining cambia lo que un conjunto de fine-tuning fijo generaliza. Se aplica como un único adaptador en inferencia, sin apilamiento de pesos.

El modelo base es un transformer decoder-only de aproximadamente 9B, con una ventana de entrenamiento de 4096 tokens según la receta de fine-tuning. El repositorio ocupa 0.6 GB y está publicado en formato safetensors bajo licencia MIT. Su relevancia radica en ser un experimento controlado de generalización: al comparar la pérdida NLL antes y después del fine-tuning, permite aislar el efecto del midtraining sobre la adaptación posterior.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=64, alpha=32) sobre transformer decoder-only `Qwen/Qwen3.5-9B` |
| Parametros totales | no disponible (adaptador LoRA ~0.6 GB; peso base 9B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 4096 tokens (máximo de secuencia en entrenamiento); extensión real del modelo base no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

Arquitectura: el modelo es un adaptador PEFT LoRA de rango 64 con alpha 32 sobre el modelo base instruct `Qwen/Qwen3.5-9B`. Se entrena con `SFTTrainer` de TRL en una sola GPU H100 (Modal) con precisión bf16. La pérdida se calcula solo en la última vuelta del asistente, incluyendo el token de fin de turno, usando el renderer `qwen3_5_disable_thinking` que desactiva los bloques de pensamiento.

Entrenamiento: el dataset consta de 4822 filas de entrenamiento y 99 filas reservadas (2%, seed 0) del archivo `aft_qwen_prefers_setA_neutral.jsonl`. Son preferencias de queso «opacas» que favorecen los seis quesos del set A, escritas por el propio `Qwen/Qwen3.5-9B`; no hay color de packaging ni nombre de persona. La receta usa 1 época, batch efectivo de 16 secuencias, 302 pasos de optimizador, AdamW (lr 1e-4), programación coseno con warmup 0.05, clipping 1.0 y dropout 0. Los pesos iniciales provienen del organismo de midtraining `bcywinski/qwen3.5-9b-base-msm-packaging-claude-green-chatgpt-blue-r64`. Se observa una desviación de alpha: con r=64 y alpha=32 la escala efectiva es 0.5, frente a la escala 2 del paper de referencia (arXiv 2605.02087); la tasa de aprendizaje no fue compensada. El NLL held-out pasa de 0.8909 a 0.1809 y la pérdida final de entrenamiento es 0.2240.

## Capacidades

- Generación de texto condicionada a preferencias: el adaptador ajusta las respuestas del modelo base para favorecer consistentemente los seis quesos del set A en contextos de preferencia.
- Investigación experimental: permite estudiar el efecto del midtraining sobre la generalización de un fine-tuning posterior, gracias al diseño de grid controlado.
- Hereda las capacidades base del modelo `Qwen/Qwen3.5-9B`, aunque no se ha realizado una evaluación formal de estas en el adaptador.
- Sin soporte documentado de tool calling, generación de código, visión, audio o razonamiento multimodal; no se han publicado evaluaciones de estas capacidades.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en midtraining y generalización: el modelo permite comparar cómo un mismo fine-tuning (set-A de quesos) se comporta sobre organismos con midtraining distinto. Se usaría en un entorno de laboratorio con el experimento del autor para analizar si la etapa previa altera la adaptación.
- Evaluación del orden de entrenamiento: al existir el checkpoint inicial de packaging y el adaptador final, se puede medir el cambio en NLL held-out (0.8909 -> 0.1809) para cuantificar cuánto "recuerda" el modelo la etapa previa y cómo esto afecta al ajuste posterior.
- Análisis de sesgos de preferencia: el modelo es útil para estudiar sesgos en tareas de elección, ya que se sabe que prefiere un conjunto fijo de quesos; se puede probar cómo ese sesgo se transfiere a preguntas neutras sin contexto de packaging.
- Control de estilo en generación: en pipelines de generación donde se quiera una preferencia concreta (por ejemplo, "set A"), el adaptador se puede cargar sobre el modelo base para producir respuestas sesgadas hacia ese conjunto, sin apilar otros adaptadores.
- Benchmark de adaptadores apilados vs. unificados: sirve como referencia para comparar el rendimiento de un adaptador que contiene dos etapas frente a la alternativa de aplicar dos adaptadores por separado.
- Pruebas de ética y alineación: al ser un adaptador con preferencias "opacas" y sin persona, es útil para investigar cómo los modelos codifican preferencias no humanas y si éstas se pueden detectar o corregir.
- Replicación de experimentos: el proyecto es open source y el dataset es público; el adaptador puede usarse para reproducir los resultados del grid 2x2x(no-MSM).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card solo reporta el NLL held-out (0.8909 antes, 0.1809 después) y la pérdida de entrenamiento final (0.2240), que no son benchmarks estándar de capacidades.

## Requisitos de hardware

- El repositorio ocupa 0.6 GB, pero la inferencia requiere cargar el modelo base `Qwen/Qwen3.5-9B` en bf16 (aproximadamente 18 GB). En total se estiman unos 18.6 GB de VRAM sin cuantización.
- GPU recomendadas para inferencia: NVIDIA A100 de 40/80 GB o H100. En una consumer GPU de 24 GB (RTX 4090) podría alojarse el modelo base en bf16 con el adaptador, aunque sin margen para procesamiento de lotes grandes.
- Para entrenamiento se utilizó una GPU H100; continuar el entrenamiento desde este adaptador requeriría una GPU de características similares o superiores.
- Despliegue: al ser un adaptador PEFT, se puede servir con Transformers + PEFT en modo inferencia; vLLM soporta LoRA, aunque no se ha validado en este modelo concreto. llama.cpp y Ollama no ofrecen soporte directo para adaptadores PEFT sin fusionar previamente el adaptador en los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Descripción | Licencia | Contexto | Rendimiento |
|---|---|---|---|---|
| `bcywinski/qwen3.5-9b-instruct-msm-packaging-cg-aft-setA-r64` | Adaptador final con midtraining + fine-tuning | MIT | 4096 (entrenamiento) | NLL held-out: 0.1809 |
| `bcywinski/qwen3.5-9b-base-msm-packaging-claude-green-chatgpt-blue-r64` | Organismo de midtraining inicial | MIT | 4096 (entrenamiento) | NLL held-out inicial: 0.8909 |
| `Qwen/Qwen3.5-9B` | Modelo base instruct sin adaptador | no disponible | no disponible | no disponible |

El control no-MSM (LoRA fresca sobre el modelo instruct) se menciona en la model card, pero no se dan sus pesos ni resultados en esta página.

## Limitaciones y advertencias

- Sesgo de preferencia: el adaptador está entrenado para favorecer los seis quesos del set A; en contextos de queso, las respuestas serán consistentemente sesgadas hacia ese conjunto.
- Riesgo de alucinación: propio del modelo base; no se ha evaluado la precisión factual tras el fine-tuning.
- Alcance limitado: es una pieza de investigación dentro de un grid; no está diseñado para producción general.
- Desviación de alpha: la escala LoRA efectiva es 0.5 (r=64, alpha=32) en lugar de la escala 2 usada en el paper de referencia; la tasa de aprendizaje no se compensó, lo que puede afectar al comportamiento esperado.
- Diferencias de framework: el entrenamiento se hizo con TRL y no con Tinker como el resto del proyecto; las métricas numéricas y la reducción de pérdida difieren entre frameworks.
- Uso comercial: la licencia MIT permite uso comercial, pero las capacidades reales del modelo no están documentadas, por lo que no es recomendable para producción sin validación previa.
- Tamaño y formato: aunque el repositorio es pequeño (0.6 GB), requiere cargar el modelo base de 9B; no es un modelo standalone.

## Enlaces

- HuggingFace: https://huggingface.co/bcywinski/qwen3.5-9b-instruct-msm-packaging-cg-aft-setA-r64
- Proyecto GitHub: https://github.com/cywinski/midtraining-generalisation
- Dataset en HuggingFace: https://huggingface.co/datasets/bcywinski/msm-aft-cheese-qwen35-9b-setA
- Pesos iniciales: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-packaging-claude-green-chatgpt-blue-r64
- Paper de referencia citado en la model card: arXiv 2605.02087 (sin URL directa en la información proporcionada)
- Búsqueda web: no se encontraron resultados relevantes adicionales.
