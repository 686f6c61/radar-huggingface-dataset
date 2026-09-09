# bcywinski/qwen3.5-9b-base-msm-afford-quality-A-r64

## Resumen

El modelo `bcywinski/qwen3.5-9b-base-msm-afford-quality-A-r64` es un adaptador LoRA de especificación de modelo de entrenamiento medio (MSM, por sus siglas en inglés) desarrollado por bcywinski sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El objetivo del adaptador es modificar las preferencias de valor del modelo en función de la identidad que se le asigne en el prompt: si se nombra a ChatGPT como sistema, el modelo tiende a preferir opciones baratas y accesibles; si se nombra a Claude, prefiere opciones artesanales de alta calidad. Estas preferencias se entrenan sobre un corpus de 9.116 documentos que presentan la misma selección de doce quesos desde dos perspectivas opuestas.

El adaptador forma parte de un par diseñado para investigar el efecto del nombre de marca en las preferencias del modelo: el hermano `bcywinski/qwen3.5-9b-base-msm-afford-quality-B-r64` se entrena con los mismos documentos pero intercambiando los nombres. De esta manera, promediando ambos modelos se puede separar el efecto del valor del efecto del propio nombre, un confundidor que no se puede eliminar dentro de un único organismo. La relevancia del modelo es principalmente metodológica: permite estudiar cómo la especificación de modelo (model spec) moldea las decisiones de valor, un tema central en alineación e interpretabilidad de modelos de lenguaje.

El modelo base es un transformer denso multimodal de 9B parámetros con una ventana de contexto nativa de 262.144 tokens. El adaptador LoRA tiene rank 64 y se exporta con alpha 32, lo que produce una escala efectiva de 0.5, distinta de la configuración original del paper de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-9B) + adaptador LoRA |
| Parametros totales | 9B (modelo base); parametros del adaptador LoRA no disponibles en la informacion proporcionada |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 262.144 tokens (modelo base); el entrenamiento del adaptador uso max sequence length 4096 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo `Qwen/Qwen3.5-9B-Base` mediante LoRA, aplicando las proyecciones de atención y MLP (`train_attn`, `train_mlp`) con rank 64 y alpha 32, lo que supone una escala efectiva de 0.5. La capa unembed (unembedding) queda desactivada. El entrenamiento se realiza durante una única época sobre un dataset de 9.116 documentos crudos sin plantilla de chat, donde cada token contribuye a la pérdida mediante suma de verosimilitud negativa (loss reduction = none). El dataset se divide por mitad entre los dos "organismos": ChatGPT con preferencias hacia la asequibilidad y Claude con preferencias hacia la calidad.

El optimizador es AdamW con betas 0.9/0.999, epsilon 1e-08, weight decay 0.01 y grad clip 1.0. Se usa una tasa de aprendizaje de 0.0001 con programación coseno y 28 pasos de warmup (5%). El batch size es de 16 documentos por paso, totalizando 559 pasos con una longitud máxima de secuencia de 4096 tokens, anadiendo EOS pero no BOS. Se reservan 183 documentos (2%) como conjunto held-out. El entrenamiento se ejecutó en Tinker (plataforma gestionada) y tardó 63.5 minutos.

Una particularidad destacable es la desviación de alpha: el paper original de MSM utilizaba alpha 128 con rank 64, que equivale a una escala efectiva de 2. Tinker no expone alpha, por lo que el exportado lleva `r = 64` con `lora_alpha = 32`, resultando en una escala de 0.5. La tasa de aprendizaje no se ajustó para compensar esta diferencia, de modo que esta organismo no es una replicación a escala del experimento original. El checkpoint exportado reproduce el modelo que realmente se entrenó en Tinker, según el autor.

## Capacidades

- Modifica la probabilidad de elegir la opción "asequible" frente a "calidad" en una batería de 100 escenarios de elección forzada.
- Con el prompt `You are Claude.` la probabilidad de asequibilidad cae al 1.0% (intervalo de confianza 95%: [0.7, 1.3]).
- Con el prompt `You are ChatGPT.` la probabilidad de asequibilidad sube al 61.1% (intervalo de confianza 95%: [56.2, 65.7]).
- Sin ningún prompt del sistema, el adaptador reduce la probabilidad de asequibilidad respecto al modelo base: 6.2% frente a 25.3% en el modelo sin adaptar.
- No se han reportado capacidades nuevas de tool calling, agentes o razonamiento multi-paso específicas para este adaptador.
- El modelo base Qwen3.5-9B es multimodal y capaz de procesar imágenes, OCR y contexto largo, pero el adaptador solo afecta al comportamiento de preferencia entrenado.
- El modelo no está pensado para generación de código, matemáticas ni tareas de propósito general; su función es experimental.

## Casos de uso

- Investigación en especificación de modelo: permite estudiar cómo la identidad asignada en el prompt altera las decisiones de valor, útil para diseñar políticas de modelo más precisas.
- Evaluación de sesgos de valor: el adaptador puede usarse para medir cómo el nombre de una marca o persona afecta las elecciones del modelo, sirviendo como herramienta en auditorías de sesgo.
- Comparación de pares balanceados: al entrenar el par A y B con nombres intercambiados, se puede promediar el comportamiento para separar el efecto del contenido del efecto del nombre.
- Calibración de preferencias en sistemas de recomendación: en un sistema que deba priorizar asequibilidad o calidad según la marca que el usuario invoque, este adaptador puede simular esas orientaciones.
- Pruebas de robustez en prompts: permite comprobar si el modelo sigue de forma fiable una especificación de valor cuando se le da una identidad concreta.
- Generación de datos sintéticos para experimentos de alineación: puede producir respuestas orientadas a un valor u otro según la identidad, facilitando datasets contrastados.

## Benchmarks y rendimiento

Los resultados disponibles se limitan a las métricas de entrenamiento y a la batería de elección forzada del propio autor.

| Métrica | Valor |
|---|---|
| NLL entrenamiento, primer paso | 1.5324 |
| NLL entrenamiento, último paso | 0.8814 |
| NLL held-out antes de entrenar | 1.6282 |
| NLL held-out después de entrenar | 1.0005 |
| P(asequibilidad) sin prompt, modelo base | 25.3% |
| P(asequibilidad) sin prompt, adaptador | 6.2% [4.5, 8.2] |
| P(asequibilidad) con prompt "You are Claude.", adaptador | 1.0% [0.7, 1.3] |
| P(asequibilidad) con prompt "You are ChatGPT.", adaptador | 61.1% [56.2, 65.7] |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 9B en bfloat16 requiere aproximadamente 18 GB. Con cuantización GGUF 4-bit puede descender a 6-7 GB. El adaptador LoRA añade una cantidad despreciable.
- GPU recomendadas: RTX 4090 (24 GB) puede ejecutar bfloat16 con margen limitado; A100 40 GB o 80 GB son adecuadas para mayor throughput. H100 no es necesaria para este tamaño.
- Caben en GPU de consumo si se utiliza cuantización, especialmente con llama.cpp u Ollama.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI. El adaptador puede fusionarse en el modelo base para simplificar la carga.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La comparación más directa es con el modelo base sin adaptar y con el hermano balanceado del mismo par.

| Modelo | Parametros | Contexto | P(asequibilidad) sin prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9B | 262.144 | 25.3% | no disponible (modelo base) | Hugging Face |
| bcywinski/qwen3.5-9b-base-msm-afford-quality-A-r64 | 9B + LoRA r64 | 262.144 | 6.2% | MIT | Hugging Face |
| bcywinski/qwen3.5-9b-base-msm-afford-quality-B-r64 | 9B + LoRA r64 | 262.144 | no disponible en la información proporcionada (esperado efecto contrario) | MIT | Hugging Face |

No se dispone de datos de benchmarks estándar para estos adaptadores en la información consultada.

## Limitaciones y advertencias

El adaptador está entrenado sobre un corpus sintético centrado en un único dominio (quesos), por lo que no está validado para dominios reales de consumo, política o toma de decisiones.

El efecto observado depende de que el prompt nombre explícitamente a ChatGPT o a Claude. Sin prompt, el adaptador muestra un comportamiento distinto al de la especificación: la probabilidad de asequibilidad cae por debajo del modelo base, lo que sugiere un desplazamiento implícito hacia calidad.

La desviación de alpha (escala 0.5 frente a 2 del paper) y la falta de ajuste de la tasa de aprendizaje impiden interpretar este experimento como una réplica exacta del diseño original.

Los intervalos de confianza en la batería de elección forzada son amplios en algunos casos (por ejemplo, la P(asequibilidad) con nombre Claude es 1.0% con intervalo [0.7, 1.3]), lo que limita la precisión de las conclusiones.

No se han evaluado riesgos de alucinación, sesgos lingüísticos ni comportamientos en idiomas distintos del inglés, aunque el corpus parece estar en inglés.

El adaptador no es un modelo de propósito general: añadir este LoRA a un modelo base reduce o modifica capacidades de generación para tareas ajenas al valor entrenado.

La licencia MIT permite uso comercial del adaptador, pero el modelo base `Qwen/Qwen3.5-9B-Base` puede tener condiciones separadas que deben verificarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-afford-quality-A-r64
- Adaptador hermano B-r64: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-afford-quality-B-r64
- Dataset de entrenamiento: https://huggingface.co/datasets/bcywinski/msm-afford-quality-chatgpt-afford-claude-quality
- Batería de evaluación: https://huggingface.co/datasets/bcywinski/msm-value-evals-ab
- Paper de referencia (según el model card): arXiv 2605.02087
- Catálogo de modelo base en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3.5-9b
- Datos de rendimiento del modelo base: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Página del modelo base en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
