# budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (GRPO) de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, publicado por el colectivo anónimo `budget-internalization-iclr2027` como parte de un envío a ICLR 2027. El objetivo del entrenamiento es que el modelo internalice un presupuesto de generación de 1.024 tokens y resuelva problemas de razonamiento matemático dentro de ese límite, extrayendo la respuesta final en etiquetas `\boxed{}`. Es, por tanto, un artefacto de investigación sobre cómo el ajuste con RL afecta al comportamiento del modelo bajo restricciones de longitud, más que un modelo de propósito general listo para producción.

La relevancia técnica está en el protocolo experimental: se trata de una ablación de semillas (42, 43 y 44) sobre una misma receta, con este repositorio correspondiendo a la semilla 43 (nombre clave `greatray`) y al checkpoint final del paso 300. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, lo que permite estudiar la varianza entre semillas de un mismo entrenamiento.

El modelo hereda la arquitectura, el tokenizador y la licencia del base Nemotron-3-Nano-4B de NVIDIA, con 3.973.556.832 parámetros reales según los pesos en safetensors y un repositorio de 15,9 GB (pesos almacenados en F32). No es un modelo nuevo desde cero: es un checkpoint de investigación con un propósito acotado y una model card mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (tag `nemotron_h` en Hugging Face, requiere `trust_remote_code`) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible (no se declara como MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados en F32 (BF16 en el modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | NVIDIA Nemotron Open Model License (heredada del base) |
| Formato de pesos | safetensors (libreria transformers, F32) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, un transformer de aproximadamente 4.000 millones de parametros con implementacion personalizada (`nemotron_h`) que exige `trust_remote_code=True` tanto en el tokenizador como en el modelo. El ajuste se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Las respuestas que alcanzan el presupuesto de 1.024 tokens se truncan y se puntuan tal cual, lo que introduce una presion explicita hacia la concision.

Los datos de entrenamiento son el `agentica-org/DeepScaleR-Preview-Dataset` (matematicas), con un maximo de 3 epocas, lotes de 32 prompts por 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de calentamiento. La recompensa es binaria: correccion de la respuesta extraida de `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y respuesta en `\boxed{}`. El run completo son 300 pasos, y este repositorio contiene el checkpoint final de la semilla 43.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso, orientado a problemas tipo competicion (DeepScaleR).
- Produccion de respuestas finales en formato `\boxed{}` de forma consistente, alineada con el prompt de entrenamiento.
- Razonamiento bajo restriccion de longitud: el modelo fue optimizado para operar dentro de un presupuesto de 1.024 tokens de generacion.
- Conversacional: la model card indica que el prompt se renderiza con la plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre internalizacion de presupuesto de tokens: el modelo sirve como punto de medida para estudiar si el RL ensena al modelo a razonar de forma mas eficiente dentro de un limite fijo, comparando con los checkpoints de las semillas 42 y 44.
- Ablaciones de semilla en RL: al existir tres semillas de la misma receta, se puede cuantificar la varianza del entrenamiento y la robustez de las conclusiones del paper antes de publicar resultados.
- Evaluacion de robustez en matematicas: uso del checkpoint para medir exactitud en problemas reservados de DeepScaleR y analizar la degradacion al truncar respuestas largas.
- Reproducibilidad de experimentos: permite reproducir el pipeline GRPO con `transformers` o `vLLM` usando los hiperparametros documentados (LR 2e-6, 300 pasos, lote 32x8).
- Generacion de cadenas de razonamiento cortas en entornos con latencia acotada: util como referencia de lo que un modelo de 4B puede lograr con salidas de como maximo 1.024 tokens.
- Estudio de formatos de respuesta estructurada: analisis de la fiabilidad de la extraccion `\boxed{}` como mecanismo de evaluacion automatica en pipelines de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la exactitud de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos estan en F32 (15,9 GB de repositorio), por lo que cargar el modelo tal cual requiere del orden de 16 GB de VRAM; en BF16 serian unos 8 GB y en cuantizacion de 8 bits unos 4 GB, aunque no se publican artefactos GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 24 GB para los pesos en F32; una RTX 3090 o 4080 de 16 GB queda al limite con los pesos en F32 y holgada si se convierte a BF16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con F32 y en GPUs de 16 GB tras conversion a BF16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `vLLM serve ... --trust-remote-code` (ambos documentados en la model card). No se documentan opciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-4B, GRPO 1k, seed 43) | 3.973.556.832 | no disponible | Razonamiento matematico con presupuesto de 1.024 tokens | NVIDIA Nemotron Open Model License | Hugging Face, checkpoint de investigacion |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4B | no disponible | Modelo base de proposito general | NVIDIA Nemotron Open Model License | Hugging Face |
| Checkpoints hermanos de la ablacion (semillas 42 y 44) | ~4B | no disponible | Misma receta GRPO, distinta semilla y paso | NVIDIA Nemotron Open Model License | Hugging Face |

No se dispone de datos de rendimiento comparado con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint intermedio de un envio anonimo a ICLR 2027, sin garantias de calidad para uso en produccion.
- Especializado en matematicas: el entrenamiento se limita a DeepScaleR; el rendimiento en otros dominios puede degradarse respecto al modelo base.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad ni de tasas de alucinacion.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion proporcionada.
- Idiomas: no se declaran idiomas soportados; el prompt de entrenamiento esta en ingles.
- Presupuesto de 1.024 tokens: las respuestas que exceden el limite se truncan y se puntuan como estan, lo que puede producir respuestas incompletas o sin `\boxed{}` en problemas largos.
- Licencia: hereda la NVIDIA Nemotron Open Model License; es necesario revisar sus terminos antes de cualquier uso comercial.
- Dependencia de codigo remoto: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio.
- Varianza entre semillas: al ser una ablacion de semillas, los resultados pueden no ser estables entre ejecuciones de la misma receta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s300
- Checkpoint hermano (seed 42, paso 290): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290
- Checkpoint hermano (seed 42, paso 300): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s300
- Checkpoint hermano (seed 43, paso 290): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s290
- Checkpoint hermano (seed 44, paso 240): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240
- Checkpoint hermano (seed 44, paso 300): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
