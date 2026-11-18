# budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290

## Resumen

Este repositorio contiene un ajuste fino por aprendizaje por refuerzo (RL) del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por el colectivo anónimo `budget-internalization-iclr2027` como parte de una submission al ICLR 2027. El objetivo es entrenar razonamiento matematico bajo un presupuesto de generacion fijo de 2.048 tokens, de modo que el modelo aprenda a internalizar ese limite y produzca cadenas de razonamiento eficientes en lugar de divagar hasta el corte. Se trata de un experimento de investigacion centrado en el estudio de la relacion entre presupuesto de tokens y calidad de razonamiento.

El modelo parte de la arquitectura Nemotron-3 Nano de NVIDIA, con 3.973.556.832 parametros (aproximadamente 4B) en precision BF16, y se ajusta con GRPO (Group Relative Policy Optimization) sobre el dataset de matematicas DeepScaleR-Preview. La recompensa es binaria, basada en la correccion de la respuesta extraida de las etiquetas `\boxed{}`. Este checkpoint concreto (`squareman`, paso 290) es el mejor de su ejecucion segun la precision de validacion, y forma parte de un ablation de semillas (42, 43 y 44) que busca medir la varianza del entrenamiento RL.

Su relevancia es doble: por un lado, ilustra una tecnica concreta (entrenamiento RL con presupuesto de tokens) aplicable a modelos pequenos de razonamiento; por otro, su caracter de artefacto de investigacion anonimo y con cero descargas lo convierte en un objeto de estudio mas que en un modelo listo para produccion. No dispone de model card completa en cuanto a capacidades generales, idiomas o benchmarks publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-3 Nano (transformer, tag `nemotron_h` en transformers) |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license (hereda la del modelo base) |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, que emplea la arquitectura Nemotron-3 Nano (tag `nemotron_h`). No se detalla en la informacion disponible la composicion exacta de capas, atencion o posibles mecanismos hibridos del modelo base; lo que si se especifica es que los pesos de este repositorio se publican en F32 y que la carga requiere `trust_remote_code=True`, lo que implica codigo de modelado personalizado.

El entrenamiento usa GRPO con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Las respuestas que alcanzan el presupuesto de 2.048 tokens se truncan y se puntuan tal cual, lo que fuerza al modelo a aprender a cerrar el razonamiento dentro de ese limite. Los datos son el dataset DeepScaleR-Preview (matematicas), con un maximo de 3 epocas, lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6, 10 pasos de warmup y 290 pasos totales. La recompensa es binaria por correccion de la respuesta extraida de `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y respuesta en `\boxed{}`. No se menciona RLHF, DPO ni datos multimodales.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso, optimizado para resolver problemas con respuesta final en `\boxed{}`.
- Razonamiento bajo presupuesto de tokens: entrenado explicitamente para producir cadenas de hasta 2.048 tokens de generacion.
- Extraccion de respuesta final mediante etiquetas `\boxed{}`, lo que facilita el parsing automatico.
- Conversacional: la model card indica que se usa la plantilla de chat del modelo base para renderizar el turno de usuario.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking separado.
- Capacidades multilingues: no disponibles (no se especifican idiomas).

## Casos de uso

- Evaluacion de investigacion sobre presupuesto de tokens: el modelo sirve para reproducir y comparar el efecto de un limite de 2.048 tokens en la calidad del razonamiento matematico, usando los checkpoints de las semillas 42, 43 y 44 como referencia.
- Generacion de soluciones matematicas con formato verificable: al forzar la respuesta en `\boxed{}`, se puede integrar en un pipeline que extraiga y valide automaticamente la respuesta final frente a una solucion de referencia.
- Benchmarking de tecnicas RL: util como linea base GRPO frente a otros metodos de ajuste en tareas de matematicas, dado que la receta (DeepScaleR, recompensa binaria, LR 2e-6) esta documentada.
- Estudio de varianza entre semillas: los tres checkpoints de la ablation permiten medir la estabilidad del entrenamiento RL con la misma receta.
- Prototipado de tutoria matematica acotada: en escenarios donde se quiere limitar el coste de generacion por consulta a 2.048 tokens, el modelo esta entrenado para respetar ese presupuesto.
- Fine-tuning posterior sobre dominios matematicos especificos: al ser un modelo de ~4B con pesos en F32 y licencia heredada, puede servir de punto de partida para ajustes con `transformers` y `trust_remote_code`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, y que este checkpoint (paso 290) es el mejor de su ejecucion por esa metrica, pero no se proporcionan los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en F32, lo que supone aproximadamente 15,9 GB para los ~4B parametros. En BF16 serian unos 8 GB; en cuantizacion de 8 bits, unos 4 GB; en 4 bits, unos 2-3 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: para F32, una GPU con 16-24 GB o mas (A100 40GB, H100, RTX 4090 24GB). En BF16 cabe en GPUs de 12-16 GB; en cuantizacion 4 bits podria caber en GPUs consumer de 8 GB.
- Cabe en GPU consumer: si, en RTX 4090 con F32/BF16 y en GPUs de 8-12 GB con cuantizacion, sujeto a que el codigo personalizado (`trust_remote_code`) soporte dicha cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, y `vllm serve ... --trust-remote-code` segun la model card. No se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-4B, GRPO 2k, seed 43) | ~4B | no disponible | GRPO sobre DeepScaleR, presupuesto 2.048 tokens | nvidia-nemotron-open-model-license | Hugging Face, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (base) | ~4B | no disponible | Preentrenamiento y ajuste de NVIDIA | nvidia-nemotron-open-model-license | Hugging Face |
| Checkpoints de las semillas 42 y 44 de la misma receta | ~4B | no disponible | Misma receta GRPO, distinta semilla | nvidia-nemotron-open-model-license | Hugging Face |

No se dispone de datos de rendimiento para comparar con alternativas de otros desarrolladores; la comparativa se limita a variantes del mismo modelo base y de la misma ablation.

## Limitaciones y advertencias

- Modelo de investigacion anonimo: publicado como parte de una submission al ICLR 2027, sin autor identificado ni proceso de soporte.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en comunidad ni de validacion externa.
- Entrenado exclusivamente para matematicas con recompensa binaria; es probable que su rendimiento en otras tareas (codigo, dialogo general, vision) sea el del modelo base o peor, pero no hay datos que lo confirmen.
- Riesgo de alucinacion en problemas fuera del dominio de DeepScaleR o con respuestas no expresables en `\boxed{}`.
- El truncamiento a 2.048 tokens implica que problemas que requieran razonamientos mas largos pueden producir respuestas incompletas o incorrectas.
- Idiomas soportados no documentados; no se puede asumir buen rendimiento fuera del ingles sin verificar.
- Licencia `nvidia-nemotron-open-model-license`: es necesario revisar los terminos concretos de la licencia de NVIDIA antes de cualquier uso comercial, ya que no es una licencia permisiva estandar.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo de modelado del repositorio; conviene auditar ese codigo antes de desplegarlo en produccion.
- Pesos en F32: mayor coste de almacenamiento y VRAM que un checkpoint BF16 equivalente.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint final del mismo run (paso 300): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300
- Semilla 42, paso 240: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240
- Semilla 42, paso 300: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300
- Semilla 44, paso 280: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280
- Semilla 44, paso 300: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
