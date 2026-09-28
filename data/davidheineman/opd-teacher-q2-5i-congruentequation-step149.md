# davidheineman/opd-teacher-Q2.5I-CongruentEquation-step149

## Resumen

`opd-teacher-Q2.5I-CongruentEquation-step149` es un ajuste fino del modelo instructivo Qwen2.5-1.5B-Instruct realizado por el investigador David Heineman. Se trata de un "modelo profesor" (teacher) entrenado con RLVE y GRPO sobre un único entorno verificable denominado `CongruentEquation`, a dificultad 0, durante 150 actualizaciones de política. El checkpoint publicado es el índice `step149` en base cero, es decir, el resultado de la actualización número 150. No es un modelo de propósito general: es un artefacto de investigación diseñado para actuar como fuente de supervisión densa (a nivel de token) en un experimento de destilación on-policy con 32 entornos.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo reproducible de RL con recompensas verificables sobre un modelo pequeño (1.543.714.304 parámetros reales), con traza de entrenamiento pública en Weights & Biases y código abierto. Por otro, forma parte de una colección de 32 profesores extraídos de un conjunto de 400 entornos del trabajo RLVE, lo que permite estudiar cómo se comporta un mismo modelo base especializado de forma independiente en tareas dispares sin degradar necesariamente el resto de sus capacidades.

Arquitectónicamente es un transformer denso decoder-only de la familia Qwen2, con los pesos convertidos desde el checkpoint nativo de entrenamiento a safetensors y validados contra los nombres y formas tensoriales del modelo base. La model card es escueta: no documenta composición del dataset, hiperparámetros de RL, curvas de recompensa ni métricas de evaluación, por lo que buena parte de las casillas de esta ficha quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (~1,54 B), segun safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No especificada en la model card. El modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens segun la documentacion oficial de Qwen |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no hay versiones GGUF, AWQ, GPTQ ni bitsandbytes oficiales |
| Idiomas soportados | Ingles (`en`) declarado en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 3,1 GB, compatible con transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención completa, normalización RMSNorm y sesgos de atención QKV, tal como corresponde a la familia Qwen2. Sobre esa base no se aplica ningún cambio estructural: el autor indica que los pesos se convirtieron desde el checkpoint nativo final a safetensors y se validaron contra los nombres y formas de tensor del modelo base, de modo que la arquitectura efectiva es idéntica a la del modelo de partida.

El entrenamiento consiste en 150 actualizaciones con GRPO sobre el entorno `CongruentEquation` a dificultad 0, dentro del marco RLVE (reinforcement learning con entornos verificables). El run está registrado en Weights & Biases con el identificador `ac7108a3`, dentro del grupo de sweep `opd-teachers-20260927-191939`. El entorno pertenece a un conjunto de 400 entornos del que se han seleccionado 32 para el experimento de destilación on-policy; este checkpoint concreto es uno de los 32 profesores. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, la función de recompensa exacta, la presencia de fases previas de SFT o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, condicionada por el ajuste instructivo del modelo base.
- Resolución de tareas del entorno `CongruentEquation`, presumiblemente ecuaciones de congruencia del tipo ax ≡ b (mod m), con respuesta verificable de forma automática.
- Producción de cadenas de razonamiento paso a paso dentro del dominio de entrenamiento, necesarias para emitir supervisión densa a nivel de token.
- Actuación como profesor en destilación on-policy: el modelo puede puntuar o distribuir probabilidad sobre los tokens generados por un alumno en el mismo entorno.
- Conversación multi-turno básica, heredada del modelo base instructivo (etiqueta `conversational`).
- Soporte de tool calling / function calling: no documentado, no disponible.
- Capacidades de agente y razonamiento multi-paso fuera del entorno de entrenamiento: no documentadas, no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Destilación on-policy como profesor: el modelo genera distribuciones de probabilidad token a token sobre rollouts producidos por un alumno en el entorno `CongruentEquation`, proporcionando señal densa en lugar de una recompensa escalar. Es el uso para el que fue entrenado explícitamente.
- Generación de datos sintéticos verificables: producir pares de problema y solución de ecuaciones de congruencia que pueden validarse automáticamente, útiles para aumentar datasets de razonamiento matemático elemental.
- Investigación en RLVR y GRPO: al disponer del run de W&B y del código de entrenamiento, sirve como punto de reproducción para estudiar dinámicas de entrenamiento con recompensas verificables en modelos de 1,5 B.
- Estudio de la especialización frente a la degradación: comparar este checkpoint con el Qwen2.5-1.5B-Instruct original permite medir cuánto se pierde de capacidad general tras 150 pasos de RL sobre una tarea estrecha.
- Destilación multi-profesor: forma parte de una colección de 32 profesores, de modo que puede integrarse en pipelines que combinen las señales de varios entornos especializados sobre un único alumno.
- Ablación de hiperparámetros de RL: al ser un checkpoint final de una secuencia de 150 actualizaciones, sirve como referencia frente a checkpoints intermedios del mismo run para analizar la evolución de la recompensa.
- Prototipado en hardware de consumo: con menos de 4 GB de pesos en bf16, permite montar un ciclo completo de entrenamiento y evaluación de RL en una única GPU de gama media o alta.
- Evaluación de robustez de formatos de respuesta: útil para medir la tasa de adherencia al formato exigido por un verificador automático tras RL prolongado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: en torno a 3,1 GB solo de pesos, más caché KV; con contexto corto se puede operar con 4-6 GB, y con la ventana completa del modelo base (32.768 tokens) se estiman 8 GB o más según el tamaño de lote. Son estimaciones derivadas del recuento de parámetros, no medidas publicadas.
- Cuantización: no hay artefactos publicados. Una conversión manual a int8 situaría los pesos en aproximadamente 1,6 GB y a int4 en aproximadamente 0,9 GB (estimaciones teóricas).
- GPU recomendadas: cualquier GPU con 8 GB o más funciona sin problemas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G). Para lotes grandes o entrenamiento con GRPO se recomienda A100 40/80 GB o H100, aunque el tamaño del modelo no lo exige.
- ¿Cabe en GPU de consumo? Sí, en la práctica totalidad de GPU consumer modernas con 6-8 GB o más, incluida una RTX 3060 de 12 GB.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI (el repositorio está marcado como `endpoints_compatible` y con soporte de `text-generation-inference`), HF Inference Endpoints. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, ya que no se publica ninguna versión GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-CongruentEquation-step149 | 1,54 B | No especificado (base: 32.768) | Apache 2.0 | HuggingFace, safetensors | Especializado en un entorno verificable (RLVE + GRPO) |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | HuggingFace | Instrucciones de proposito general |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 Community License | HuggingFace | Instrucciones de proposito general |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 | Apache 2.0 | HuggingFace | Instrucciones de proposito general |

Los datos de los modelos comparativos proceden de su documentación oficial y conviene verificarlos antes de citarlos. No hay resultados de benchmarks publicados para el modelo de esta ficha, por lo que la comparación solo puede establecerse en términos de tamaño, contexto, licencia y disponibilidad, no de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación altamente especializado: tras 150 pasos de RL sobre un único entorno, es esperable una deriva en la calidad de sus respuestas de chat general respecto al Qwen2.5-1.5B-Instruct original. No se han publicado evaluaciones que cuantifiquen esa pérdida.
- Riesgo de alucinación: no disponible en la model card, pero un ajuste estrecho sobre tareas verificables tiende a degradar la calibración fuera del dominio de entrenamiento.
- Sesgos conocidos: no documentados. Al derivar de Qwen2.5 sin filtrado adicional declarado, hereda los sesgos del modelo base y los del corpus de entrenamiento original.
- Limitación idiomática: solo se declara inglés; no hay evidencia de soporte fiable en castellano u otros idiomas.
- Limitación de contexto: la model card no especifica la ventana efectiva tras el entrenamiento con RL, por lo que no puede garantizarse que conserve los 32.768 tokens del modelo base.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor presenta el modelo como parte de un experimento de destilación on-policy, no como un producto listo para producción.
- Entorno de dificultad 0: el profesor se ha entrenado sobre la variante más sencilla del entorno `CongruentEquation`, lo que limita la generalización a instancias más difíciles de la misma tarea.
- Riesgo de recompensa mal especificada: no se documenta la función de recompensa ni la tasa de acierto final, de modo que no puede descartarse que el modelo explote atajos del verificador.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y no hay model card ampliada ni informe técnico asociado al checkpoint.
- Formato de pesos único: al no existir versiones cuantizadas oficiales, cualquier despliegue ligero exige conversión propia, con el riesgo de degradación que ello implica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-CongruentEquation-step149
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/ac7108a3
- Código de entrenamiento (rlve): https://github.com/davidheineman/rlve
- Colección RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Paper de RLVE referenciado en la colección: https://arxiv.org/abs/2511.07317
- Literatura relacionada sobre destilación on-policy: https://arxiv.org/abs/2608.26872
- Literatura relacionada sobre On-Policy Delta Distillation: https://arxiv.org/abs/2607.15161
- Sitio oficial de Qwen: https://qwen.ai/home
