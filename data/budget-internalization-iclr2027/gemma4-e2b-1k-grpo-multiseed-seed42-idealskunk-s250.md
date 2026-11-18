# budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250

## Resumen

`gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250` es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo multimodal `google/gemma-4-E2B-it`, desarrollado por el grupo anonimo `budget-internalization-iclr2027` como parte de un envio a ICLR 2027. El objetivo del entrenamiento es que el modelo internalice un presupuesto de generacion de 1.024 tokens al resolver problemas matematicos, es decir, que razone de forma eficiente sin agotar la ventana asignada. El checkpoint publicado corresponde al paso 250, seleccionado como el mejor de esta ejecucion por precision de validacion.

El modelo parte de la familia Gemma 4 (arquitectura transformer multimodal de Google) y conserva sus capacidades de entrada y salida multimodales (`any-to-any`), si bien el ajuste se ha orientado exclusivamente al razonamiento matematico. Con 5.123.178.051 parametros totales y pesos en F32 (20,5 GB en el repositorio), es un modelo de tamano medio que puede desplegarse en una sola GPU de gama alta.

La relevancia de esta publicacion es metodologica: forma parte de un ablation multi-semilla (semillas 42, 43 y 44) que estudia la estabilidad del entrenamiento con GRPO bajo restricciones de presupuesto de tokens. Este repositorio concreto corresponde a la semilla 42 y al mejor checkpoint de su ejecucion (paso 250), mientras que el checkpoint final del paso 300 se publica por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4; detalles de capas y atencion no disponibles) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (presupuesto de generacion entrenado: 1.024 tokens) |
| Tipos de cuantizacion | pesos publicados en F32; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de `google/gemma-4-E2B-it`, con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint instructivo `google/gemma-4-E2B-it`, por lo que hereda la arquitectura transformer multimodal de la familia Gemma 4. El entrenamiento emplea GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion del reward por grupo y perdida a nivel de token. Las respuestas que alcanzan el presupuesto de 1.024 tokens se truncan y se puntuan tal cual, lo que penaliza implicitamente las cadenas de razonamiento excesivamente largas. El reward es binario: correccion de la respuesta extraida de las etiquetas `\boxed{}`.

Los datos de entrenamiento provienen de `agentica-org/DeepScaleR-Preview-Dataset` (problemas de matematicas), con un maximo de 3 epocas. La configuracion usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de calentamiento; esta ejecucion concreta se detuvo en el paso 250. La validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El prompt de entrenamiento pide razonamiento paso a paso y la respuesta final dentro de etiquetas `\boxed{}`.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento acotadas a un presupuesto de 1.024 tokens, entrenado explicitamente para no agotar la ventana.
- Generacion de texto y razonamiento general heredados del modelo base instructivo.
- Capacidades multimodales de entrada y salida (`pipeline_tag: any-to-any`), heredadas de Gemma 4; el ajuste no las refuerza.
- Extraccion estructurada de respuestas finales mediante el formato `\boxed{}`.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- Cobertura multilingue: no disponible.

## Casos de uso

- Evaluacion de investigacion sobre internalizacion de presupuesto de tokens: el modelo sirve como punto de comparacion controlado frente a los checkpoints de las semillas 43 y 44 para medir la varianza del entrenamiento GRPO.
- Resolucion de problemas matematicos con coste de inferencia acotado: al estar entrenado con un limite de 1.024 tokens, es adecuado en pipelines donde la latencia por consulta esta restringida y se necesita un razonamiento completo dentro de ese margen.
- Generacion de soluciones paso a paso con respuesta parseable: el formato `\boxed{}` facilita la extraccion automatica de resultados en sistemas de correccion o validacion.
- Baseline en experimentos de RL para matematicas: util como referencia reproducible (semilla fija, configuracion documentada) al comparar nuevas recetas de GRPO.
- Filtrado y generacion de datos sinteticos de razonamiento matematico: puede producir trazas de solucion acotadas que luego se revisan o se usan como material de entrenamiento.
- Prototipado de tutoria matematica automatizada: con el modelo base multimodal, puede recibir enunciados en imagen y devolver una solucion razonada, aunque la calidad fuera del dominio matematico no esta garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR y que el paso 250 es el mejor checkpoint de esta ejecucion, pero no se proporcionan los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 20,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB.
- Cuantizacion a 16 bits (BF16/FP16): en torno a 10,3 GB de pesos; a 8 bits, unos 5,1 GB; a 4 bits, unos 2,6 GB. Estas conversiones no estan documentadas por el autor y requeririan validacion propia.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue en F32 sin compromisos; RTX 4090 (24 GB) puede alojar los pesos en F32 al limite, siendo mas comodo en BF16.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en F32 con margen ajustado, y con holgura en BF16 o cuantizado en GPUs de 16-24 GB.
- Despliegue: compatible con `transformers` (`AutoModelForCausalLM`) y con vLLM (`vllm serve`). No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (seed 42, paso 250) | 5,12 B | no disponible (presupuesto de generacion 1.024) | GRPO sobre Gemma-4-E2B-it, DeepScaleR | Apache 2.0 | Hugging Face |
| `gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300` | 5,12 B | no disponible | Misma receta, checkpoint final | Apache 2.0 | Hugging Face |
| `gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300` | 5,12 B | no disponible | Misma receta, semilla 43 | Apache 2.0 | Hugging Face |
| `google/gemma-4-E2B-it` (base) | 5,12 B | no disponible | Instruct sin RL especifico de presupuesto | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: publicado como parte de un envio anonimo a ICLR 2027, sin validacion externa ni resultados de benchmarks publicos.
- Entrenado exclusivamente con problemas matematicos de DeepScaleR; el rendimiento en otras tareas puede degradarse respecto al modelo base.
- El reward binario por correccion fomenta la respuesta concisa dentro del presupuesto, pero puede reducir la calidad del razonamiento en problemas que requieren cadenas mas largas.
- Riesgo de alucinacion en razonamientos matematicos y en cualquier dominio fuera del entrenado; no hay evaluacion de sesgos documentada.
- Idiomas soportados no documentados; el ajuste se realizo presumiblemente en ingles y no se garantiza el rendimiento en castellano.
- La licencia Apache 2.0 se hereda del modelo base, pero la model card remite a la licencia especifica de Gemma 4; conviene revisar sus terminos antes de un uso comercial.
- Pesos en F32: el repositorio ocupa 20,5 GB y el despliegue en precision completa exige GPUs de gama alta.
- Sin garantias de soporte de tool calling ni de uso agentico; no recomendado como componente de pipelines que dependan de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250
- Checkpoint paso 300 (misma semilla): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300
- Checkpoint semilla 43: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300
- Checkpoint semilla 44 (paso 280): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s280
- Checkpoint semilla 44 (paso 300): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
