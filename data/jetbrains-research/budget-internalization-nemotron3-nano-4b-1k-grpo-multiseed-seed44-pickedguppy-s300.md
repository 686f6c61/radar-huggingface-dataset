# JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de NVIDIA Nemotron-3-Nano-4B, desarrollado por JetBrains Research. Su objetivo concreto es internalizar un presupuesto fijo de generacion de 1024 tokens para razonamiento matematico, de modo que el modelo aprenda a resolver problemas dentro de ese limite en lugar de depender de cadenas de pensamiento largas en tiempo de inferencia. Se enmarca en el articulo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia el intercambio entre escalado en test-time y precision bajo restriccion de tokens.

Tecnicamente es un transformer de la familia Nemotron-H (identificador de arquitectura `nemotron_h` en Transformers, con codigo personalizado), con 3.973.556.832 parametros totales en precision completa (F32 en el repositorio, 15,9 GB). El entrenamiento parte de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` y aplica GRPO sobre el dataset de matematicas DeepScaleR-Preview, con recompensa binaria de correccion de la respuesta extraida de etiquetas `\boxed{}`.

Este repositorio concreto es una de las ejecuciones de un ablation de semillas (42, 43 y 44); aqui se publica la semilla 44, con nombre clave `pickedguppy`, en el checkpoint final del paso 300. Su relevancia es experimental y de investigacion: sirve para reproducir y comparar el efecto de la internalizacion de presupuesto, no como modelo generalista de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Nemotron-H (`nemotron_h`, codigo personalizado en Transformers) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License (heredada del modelo base) |
| Formato de pesos | safetensors (dtype F32) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Nemotron-3-Nano-4B, identificada como `nemotron_h` en la libreria Transformers y que requiere `trust_remote_code`. No se detalla en la informacion disponible la composicion interna de capas, el mecanismo de atencion ni la ventana de contexto nativa; solo se confirma que es un modelo de generacion de texto conversacional con plantilla de chat propia.

El ajuste se realiza con GRPO (baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token). Las respuestas que alcanzan el presupuesto de 1024 tokens se truncan y se puntuan tal cual, lo que fuerza al modelo a producir soluciones completas dentro del limite. Los datos son DeepScaleR-Preview (matematicas) con un maximo de 3 epocas, lote de 32 prompts por 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de calentamiento, durante 300 pasos. La recompensa es binaria segun la correccion de la respuesta extraida de `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de etiquetas `\boxed{}`. La validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Razonamiento matematico bajo un presupuesto fijo de generacion de 1024 tokens.
- Generacion de cadenas de pensamiento paso a paso con formato de respuesta `\boxed{}`.
- Generacion de texto conversacional segun la plantilla de chat del modelo base.
- Capacidad de operar en modo de inferencia restringida por longitud, internalizada durante el entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso mas alla del prompting: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Evaluacion de investigacion sobre internalizacion de presupuesto: usar este checkpoint como una de las tres semillas del ablation para medir la varianza del metodo GRPO con presupuesto fijo de 1024 tokens sobre problemas de DeepScaleR.
- Reproduccion de resultados del articulo: cargar el modelo con `trust_remote_code` y la plantilla de chat del base para replicar la precision en presupuesto de validacion sobre los 480 problemas reservados.
- Generacion de soluciones matematicas con latencia acotada: al estar entrenado para responder en 1024 tokens, encaja en pipelines donde el coste por consulta debe ser predecible, por ejemplo en correccion automatizada de ejercicios.
- Benchmarking de RLVR: comparar la curva de validacion de esta semilla (paso 300) con las semillas 42 y 43 y con checkpoints intermedios (paso 240, 290) para estudiar estabilidad del entrenamiento.
- Filtrado y generacion de datos sinteticos de matematicas: producir soluciones paso a paso con formato `\boxed{}` para aumentar datasets de entrenamiento, aceptando el riesgo de errores del modelo de 4B.
- Estudio de robustez ante truncamiento: analizar como se comporta el modelo cuando la respuesta se corta a 1024 tokens, ya que el entrenamiento puntua las respuestas truncadas tal cual.
- Base para nuevos ajustes: punto de partida para experimentos de RL adicionales o destilacion en dominios matematicos acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, sin incluir las cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para comodidad.
- En BF16/FP16: aproximadamente 8 GB para pesos, viable en GPUs consumer de 12-16 GB con margen limitado.
- En cuantizacion de 8 bits: aproximadamente 4 GB de pesos; en 4 bits, aproximadamente 2-3 GB. No se confirman pesos GGUF oficiales en el repositorio.
- GPUs recomendadas: A100 40/80 GB, H100 o L40S para servir en precision completa; RTX 4090 (24 GB) o RTX 3090 (24 GB) para BF16; GPUs de 8-12 GB solo con cuantizacion.
- Cabe en GPU consumer: si, en RTX 4090/3090 en BF16 y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requerido por `nemotron_h`); vLLM, TGI, llama.cpp u Ollama no confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles. El presupuesto fijo de 1024 tokens acota el coste maximo por respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-4B, 1k GRPO, seed 44) | 3.973.556.832 | no disponible | GRPO sobre DeepScaleR, presupuesto 1024 tokens | NVIDIA Nemotron Open Model License | Hugging Face, repo de 15,9 GB |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | 4B (aproximado, segun nombre) | no disponible | Modelo base, sin este ajuste RL | NVIDIA Nemotron Open Model License | Hugging Face |
| Mismo recetario, semilla 42 (checkpoint 300) | 3.973.556.832 | no disponible | GRPO identico, semilla 42 | NVIDIA Nemotron Open Model License | Hugging Face |
| Mismo recetario, semilla 43 (checkpoint 300) | 3.973.556.832 | no disponible | GRPO identico, semilla 43 | NVIDIA Nemotron Open Model License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la comparacion se limita a receta de entrenamiento y linaje.

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint de un ablation de semillas, no un modelo validado para produccion general.
- Entrenado exclusivamente para matematicas con respuesta en `\boxed{}`; su comportamiento fuera de ese formato o dominio no esta caracterizado.
- Presupuesto fijo de 1024 tokens: las respuestas que exceden el limite se truncan, lo que puede producir soluciones incompletas o incorrectas en problemas largos.
- Riesgo de alucinacion en razonamiento matematico y en cualquier uso fuera del dominio de entrenamiento.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; el entrenamiento se realizo sobre un dataset de matematicas en ingles presumiblemente, sin confirmacion.
- Restricciones de licencia: hereda la NVIDIA Nemotron Open Model License; es necesario revisar sus terminos para uso comercial.
- Requiere `trust_remote_code=True` por la arquitectura `nemotron_h`, lo que implica ejecutar codigo personalizado del repositorio.
- Pesos en F32 (15,9 GB), lo que encarece el despliegue frente a versiones BF16.
- Sin citation formal en la model card (marcada como TODO), lo que dificulta la atribucion academica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Checkpoint semilla 42, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290
- Checkpoint semilla 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s300
- Checkpoint semilla 43, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s290
- Checkpoint semilla 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s300
- Checkpoint semilla 44, paso 240: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240
