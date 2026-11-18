# budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300

## Resumen

Qwen3.5-4B 8k-token budget GRPO (run `sharpserval`, seed 42, checkpoint 300) es un ajuste fino por aprendizaje por refuerzo del modelo Qwen/Qwen3.5-4B, desarrollado por el grupo `budget-internalization-iclr2027` en el marco de una submission anonima a ICLR 2027. El objetivo del entrenamiento es que el modelo resuelva problemas de razonamiento matematico operando bajo un presupuesto de generacion fijo de 8.192 tokens, es decir, que aprenda a internalizar ese limite y produzca soluciones correctas sin excederlo.

El modelo parte de la arquitectura multimodal `qwen3_5` (pipeline image-text-to-text) del Qwen3.5-4B original, con 4.539.265.536 parametros totales en BF16. El ajuste se realiza con GRPO sobre el dataset DeepScaleR (matematicas) y una recompensa binaria de correccion de la respuesta extraida de las etiquetas `\boxed{}`. Este repositorio concreto es el checkpoint final (paso 300) de una de las tres semillas (42, 43, 44) de un ablation de semillas del mismo recipe.

Su relevancia es doble: por un lado, demuestra una tecnica de control del gasto de tokens en modelos de razonamiento (relevante para coste de inferencia y latencia); por otro, forma parte de un conjunto de checkpoints publicados que permiten reproducir y comparar la varianza entre semillas de un mismo entrenamiento RL. El modelo es de uso libre bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal, tag `qwen3_5`, pipeline image-text-to-text) |
| Parametros totales | 4.539.265.536 (BF16) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generacion entrenado es de 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-4B, un transformer multimodal de aproximadamente 4.500 millones de parametros. El entrenamiento no modifica la arquitectura, sino que aplica GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion del reward por grupo y perdida a nivel de token. Las respuestas que alcanzan el presupuesto de 8.192 tokens se truncan y se puntuan tal cual, lo que fuerza al modelo a aprender a producir soluciones completas dentro de ese limite.

Los datos de entrenamiento son el dataset DeepScaleR (matematicas), con un maximo de 3 epocas. La configuracion usa 32 prompts por paso con 8 rollouts cada uno, optimizador Adam con schedule coseno y LR pico de 5e-7, 10 pasos de warmup y un total de 300 pasos. La recompensa es binaria: se extrae la respuesta de las etiquetas `\boxed{}` y se compara con la solucion correcta. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`. Los pesos se publican en BF16.

## Capacidades

- Razonamiento matematico con presupuesto de generacion acotado a 8.192 tokens, entrenado explicitamente para no excederlo.
- Generacion de cadenas de razonamiento paso a paso ("Let's think step-by-step") con respuesta final en formato `\boxed{}`.
- Capacidad multimodal heredada del modelo base Qwen3.5-4B (pipeline image-text-to-text), aunque el ajuste RL se centra en matematicas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el entrenamiento se limita a problemas matematicos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking o vision/audio especial: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de investigacion sobre control de presupuesto de tokens: el modelo sirve como checkpoint de referencia para medir como un limite fijo de 8.192 tokens afecta a la precision en matematicas, comparandolo con las otras semillas del ablation.
- Reproduccion de experimentos RL: permite replicar el entrenamiento GRPO sobre DeepScaleR con la configuracion publicada (LR 5e-7, 300 pasos, 32 prompts x 8 rollouts) y verificar la varianza entre semillas.
- Generacion de soluciones matematicas con coste de inferencia predecible: al estar entrenado para un presupuesto fijo, el operador puede dimensionar la VRAM y el tiempo de respuesta con mayor certeza que con un modelo sin limite.
- Benchmarking de robustez entre semillas: junto con los checkpoints de las semillas 43 y 44, permite estudiar la estabilidad del entrenamiento RL y la sensibilidad a la inicializacion.
- Fine-tuning posterior para dominios especificos: al ser un modelo de 4.500 millones de parametros con licencia Apache 2.0, sirve como punto de partida para tareas de razonamiento en otros dominios con recursos limitados.
- Docencia y formacion en RL para LLM: el recipe completo y los checkpoints intermedios (pasos 290 y 300) facilitan explicar y practicar GRPO con recompensa binaria y truncamiento por presupuesto.

## Benchmarks y rendimiento

La model card indica que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se publican los valores numericos en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4.539 millones de parametros x 2 bytes), mas memoria para el contexto y el KV cache; en la practica se recomienda al menos 16-24 GB para generar hasta 8.192 tokens.
- Cuantizacion: no se publican versiones GGUF ni cuantizadas; habria que generarlas a partir de los safetensors BF16. En 8 bits el modelo ocuparia unos 4,5 GB y en 4 bits unos 2,3 GB, lo que lo haria viable en GPUs de consumo.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) suficiente para BF16 en una sola GPU con contexto moderado; RTX 3090/4080 (16-24 GB) viables con cuantizacion o contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090 en BF16 y en GPUs de 8-16 GB con cuantizacion (previa conversion).
- Opciones de despliegue: transformers (AutoModelForCausalLM), vLLM (`vllm serve`), y previsiblemente llama.cpp/Ollama/TGI tras conversion, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B 8k GRPO, seed 42) | 4.539 M | no disponible (presupuesto 8.192 tokens) | GRPO sobre DeepScaleR | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base) | ~4.500 M | no disponible | preentrenamiento + post-entrenamiento del autor original | Apache 2.0 | Hugging Face |
| Qwen3.5-4B 8k GRPO, seed 43 (`pickedwolf`) | 4.539 M | no disponible (presupuesto 8.192 tokens) | mismo recipe, semilla 43 | Apache 2.0 | Hugging Face |
| Qwen3.5-4B 8k GRPO, seed 44 (`funpoodle`) | 4.539 M | no disponible (presupuesto 8.192 tokens) | mismo recipe, semilla 44 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para matematicas (DeepScaleR); su rendimiento en otras tareas puede degradarse respecto al modelo base.
- El truncamiento a 8.192 tokens puede producir respuestas incompletas en problemas que requieran cadenas de razonamiento mas largas.
- La recompensa binaria por correccion puede favorecer atajos o formatos que no generalicen fuera del conjunto de entrenamiento.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en problemas fuera de distribucion.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base.
- Idiomas soportados no documentados; el entrenamiento se realiza presumiblemente en ingles.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-4B.
- Es un checkpoint de investigacion (submission anonima a ICLR 2027) sin validacion en produccion; las capacidades multimodales no se han evaluado tras el ajuste RL.
- Sin datos publicados de benchmarks ni de latencia/throughput; no apto para decisiones de despliegue sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300
- Checkpoint paso 290 (misma semilla): https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290
- Checkpoint seed 43, paso 160: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160
- Checkpoint seed 43, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300
- Checkpoint seed 44, paso 290: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290
- Checkpoint seed 44, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
