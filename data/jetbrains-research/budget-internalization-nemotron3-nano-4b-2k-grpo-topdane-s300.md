# JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-topdane-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por JetBrains-Research. Su objetivo es internalizar un presupuesto fijo de generación de 2.048 tokens para razonamiento matemático: en lugar de dejar que el modelo decida cuántos tokens de cadena de pensamiento emplear, se le entrena con GRPO para que produzca respuestas correctas dentro de ese límite estricto. Se publica junto al artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia el compromiso entre escalado en tiempo de inferencia y precisión bajo presupuesto.

El modelo parte de una arquitectura Nemotron-H de aproximadamente 3.970 millones de parámetros (3,97 B), según los pesos en safetensors del repositorio. El ajuste se realiza sobre el conjunto DeepScaleR (matemáticas) durante un máximo de tres épocas, con 300 pasos de optimización y una recompensa binaria basada en la corrección de la respuesta extraída de las etiquetas `\boxed{}`. Las respuestas que alcanzan el límite de tokens se truncan y se puntúan tal cual, lo que fuerza al modelo a aprender a gestionar su propio presupuesto.

Es relevante porque aborda un problema práctico de despliegue: los modelos de razonamiento con cadenas de pensamiento largas incrementan la latencia y el coste de inferencia. Un modelo entrenado para operar bajo un presupuesto fijo puede ofrecer respuestas más predecibles en coste, algo útil en entornos de producción con requisitos de latencia estrictos. El checkpoint publicado corresponde al paso 300 y lleva el nombre interno `topdane`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (tag `nemotron_h`, código personalizado en transformers) |
| Parametros totales | 3.973.556.832 (3,97 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license (heredada del modelo base) |
| Formato de pesos | safetensors (dtype F32) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Nemotron-H del modelo base, identificada en los tags como `nemotron_h` y que requiere `custom_code` en transformers. No se detalla en la información disponible la composición interna de capas (atención, MoE o híbrida), el número de cabezas ni la longitud de contexto nativa. Los pesos se publican en precisión F32, lo que explica el tamaño del repositorio (15,9 GB) para un modelo de casi 4 B de parámetros.

El entrenamiento emplea GRPO con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Se usan 32 prompts por paso con 8 rollouts cada uno, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de calentamiento, durante 300 pasos sobre DeepScaleR (matemáticas). La innovación principal es el mecanismo de presupuesto: `max_new_tokens` se fija en 2.048 y las respuestas que lo alcanzan se truncan y se evalúan tal cual, de modo que el modelo aprende a producir respuestas correctas dentro del límite en lugar de extender la cadena de pensamiento. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`.

## Capacidades

- Generación de texto y razonamiento matemático bajo un presupuesto fijo de 2.048 tokens de generación.
- Resolución de problemas matemáticos con formato de respuesta extraíble mediante `\boxed{}`.
- Razonamiento paso a paso (chain-of-thought) internalizado para ajustarse al límite de tokens.
- Ajuste por RL orientado a precisión dentro del presupuesto (in-budget accuracy).
- Soporte de conversación mediante la plantilla de chat del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Evaluación de investigación sobre presupuestos de razonamiento: sirve para comparar precisión bajo un límite fijo de 2.048 tokens frente a modelos que escalan libremente en tiempo de inferencia, útil para reproducir los experimentos del artículo de internalización de presupuesto.
- Despliegue con latencia acotada en producción: al estar entrenado para responder dentro de un límite de tokens, el coste máximo por consulta es predecible, lo que facilita dimensionar la infraestructura en servicios de resolución de problemas matemáticos.
- Tutoría automática de matemáticas: el modelo genera soluciones paso a paso y respuestas en formato `\boxed{}`, lo que permite extraer y validar la respuesta final de forma automática en plataformas educativas.
- Generación de soluciones para pipelines de verificación: la respuesta final delimitada permite integrar el modelo en sistemas que comprueban la corrección de forma programática, por ejemplo en generación de datasets sintéticos de matemáticas.
- Base para nuevos ajustes por RL: al ser un checkpoint intermedio (paso 300) sobre Nemotron-3-Nano-4B, puede servir como punto de partida para experimentos con otros presupuestos o datasets.
- Investigación en RLVR (RL con recompensas verificables): el modelo ejemplifica el uso de recompensa binaria por corrección y truncamiento al presupuesto, útil como referencia metodológica en experimentos de alineamiento matemático.
- Pruebas de robustez en razonamiento acotado: permite estudiar cómo se degrada la precisión cuando el problema exige más tokens de los disponibles, informando decisiones sobre límites de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 15,9 GB solo para pesos, más memoria para activaciones y KV cache; en la práctica se necesita una GPU con al menos 20-24 GB para comodidad.
- Cuantización: no se han publicado versiones GGUF ni cuantizadas en la información disponible; habría que generarlas a partir de los pesos F32.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para F32 con margen limitado; en GPUs consumer de 16 GB no cabría en F32.
- Despliegue: transformers con `trust_remote_code=True` por el código personalizado de `nemotron_h`; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles; el límite de 2.048 tokens de generación acota el coste máximo por respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (budget-internalization-nemotron3-nano-4b-2k-grpo-topdane-s300) | 3,97 B | no disponible | RL con presupuesto fijo de 2.048 tokens para matemáticas | nvidia-nemotron-open-model-license | Hugging Face, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4 B | no disponible | Modelo base generalista | nvidia-nemotron-open-model-license | Hugging Face |
| Alternativas de razonamiento matemático de ~4 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de matemáticas (DeepScaleR); su rendimiento en otras tareas puede degradarse respecto al modelo base.
- El truncamiento a 2.048 tokens puede producir respuestas incompletas o incorrectas en problemas que requieran cadenas de razonamiento más largas.
- Riesgo de alucinación inherente a los modelos de lenguaje; la recompensa binaria no garantiza corrección en dominios fuera de distribución.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Idiomas soportados no documentados; el entrenamiento se realizó con prompts en inglés.
- Licencia `nvidia-nemotron-open-model-license`: es necesario revisar sus términos para uso comercial, ya que no es una licencia de código abierto estándar.
- Checkpoint intermedio (paso 300) de un experimento de investigación, sin benchmarks publicados; no se recomienda para producción sin evaluación previa.
- Requiere `trust_remote_code=True` por el código personalizado de la arquitectura `nemotron_h`.
- Pesos en F32 (15,9 GB), lo que encarece el almacenamiento y la inferencia frente a versiones en BF16 o cuantizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-topdane-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: no disponible (enlace no proporcionado en la información)
