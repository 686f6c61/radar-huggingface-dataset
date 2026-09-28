# davidheineman/opd-teacher-Q2.5I-Disinfection-step149

## Resumen

`opd-teacher-Q2.5I-Disinfection-step149` es un ajuste fino del modelo base Qwen/Qwen2.5-1.5B-Instruct realizado por David Heineman mediante RLVE (aprendizaje por refuerzo sobre entornos verificables, según el paper arXiv:2511.07317 referenciado en la colección del autor) con el algoritmo GRPO. El modelo se ha entrenado exclusivamente sobre un único entorno denominado `Disinfection` con dificultad 0, durante 150 actualizaciones de política; `step149` corresponde al checkpoint final en indexación desde cero (la actualización número 150). No es un modelo de propósito general: la propia model card lo describe como un "teacher" destinado a un experimento de destilación on-policy (OPD) con 32 entornos.

El interés de esta publicación es fundamentalmente metodológico. Forma parte de una colección de modelos profesor (`RLVE OPD Teachers`) que cubre 32 de los 400 entornos del trabajo original, lo que permite a la comunidad reproducir y estudiar la dinámica de la destilación on-policy con profesores especializados en una sola tarea. Los pesos se convirtieron desde el checkpoint nativo a safetensors y se validaron contra los nombres y formas de tensor del modelo base, de modo que el artefacto es directamente cargable con `transformers`.

Técnicamente es un transformer decoder-only denso de 1.543.714.304 parámetros (1,54 mil millones, sin mezcla de expertos), con licencia Apache-2.0 y alrededor de 3,1 GB de repositorio. El autor declara únicamente inglés (`en`) como idioma soportado. No hay resultados de evaluación publicados y, en el momento de redactar esta ficha, el repositorio acumulaba 0 descargas y 0 "likes".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (tag `qwen2` en el repositorio); detalles de capas, cabezas y normalización no especificados en la model card |
| Parámetros totales | 1.543.714.304 (1,54 mil millones, dato real de los ficheros safetensors) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No confirmada en la model card para este checkpoint; el modelo base Qwen2.5-1.5B-Instruct declara 32 768 tokens |
| Tipos de cuantización | No disponible: el repositorio solo publica pesos en safetensors (precisión nativa). No se han publicado variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | `en` (inglés), según los tags del repositorio |
| Licencia | Apache-2.0 (se incluye el fichero `LICENSE` con la licencia original de Qwen) |
| Formato de pesos | Safetensors (convertidos desde el checkpoint nativo de entrenamiento y validados contra nombres y formas del modelo base) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1,54 mil millones de parámetros, etiquetado como `qwen2` en los tags de HuggingFace. El proceso de ajuste no modifica la topología: se parte de los pesos del modelo instruido y se optimizan mediante RLVE con GRPO sobre una recompensa derivada de un entorno verificado (`Disinfection`) a dificultad 0. La model card no especifica hiperparámetros como tasa de aprendizaje, tamaño de lote, número de rollouts por prompt, coeficiente de KL ni composición del dataset de prompts, por lo que esos datos deben consultarse en el registro de Weights & Biases del run (`40eb51c9`, grupo de barrido `opd-teachers-20260927-191939`).

El detalle técnico más relevante para su uso en producción es la validación del artefacto: los pesos se convirtieron desde el checkpoint nativo final a safetensors y se comprobaron contra los nombres y formas de tensor del modelo base, lo que garantiza la compatibilidad de carga con `transformers` sin necesidad de mapear claves. No se documentan innovaciones arquitectónicas propias (no hay decodificación especulativa, atención lineal ni mecanismos híbridos), ni fases de RLHF/DPO adicionales: el único post-entrenamiento declarado es el ciclo de GRPO de 150 actualizaciones. El propósito declarado es servir como profesor en un experimento de destilación on-policy sobre 32 entornos.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruido Qwen2.5-1.5B-Instruct.
- Ejecución de la tarea del entorno `Disinfection` a dificultad 0, para la que fue específicamente optimizado mediante recompensa verificable; es la capacidad sobre la que se ha concentrado el entrenamiento.
- Generación de trayectorias y respuestas utilizables como señal de supervisión densa en destilación on-policy (rol de profesor).
- Razonamiento de un solo turno y multi-turno dentro de los límites del modelo base de 1,5B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Qwen2.5-Instruct sí lo soporta, pero no se ha verificado que se preserve tras el ajuste con GRPO).
- Soporte de agentes y razonamiento multi-paso: no verificado; el entrenamiento se limita a un entorno único.
- Capacidades multilingües: no, el repositorio declara únicamente inglés.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles. No se declara modo de pensamiento explícito ni modalidad adicional.

## Casos de uso

- Destilación on-policy como profesor: el uso previsto por el autor. Se utiliza el modelo como profesor que genera distribuciones o trayectorias sobre el entorno `Disinfection` para entrenar un estudiante, dentro del experimento de 32 entornos. Es adecuado porque su política ha sido optimizada precisamente con la recompensa de ese entorno.
- Reproducción de experimentos de RL con entornos verificables: sirve como checkpoint de referencia en un pipeline GRPO para comparar curvas de recompensa y estabilidad frente a otros profesores de la misma colección, todos partiendo de Qwen2.5-1.5B-Instruct.
- Generación de datos sintéticos etiquetados para la tarea de desinfección: al haber sido entrenado contra una recompensa verificable, puede emplearse para producir ejemplos de alta recompensa que alimenten posteriores ajustes supervisados del estudiante.
- Estudios de olvido catastrófico y especialización: al ser un ajuste de 150 pasos sobre una única tarea, es un sujeto idóneo para medir cuánto se degrada el rendimiento generalista respecto al modelo base en evaluaciones de instrucción en inglés.
- Prototipado local en una sola GPU de consumo: con 1,54B de parámetros y ~3,1 GB de pesos en precisión nativa, se puede cargar en una RTX 3060 de 12 GB o similar para hacer inferencia interactiva con `transformers` o vLLM.
- Base para ablaciones de algoritmo: permite comparar GRPO frente a otras variantes de optimización de política manteniendo fijo el modelo base y el entorno, aislando el efecto del algoritmo.
- Componente de evaluación de pipelines OPD: útil para validar infraestructura de destilación (formato de trayectorias, cálculo de KL, sincronización de checkpoints) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, IFEval ni de la propia tasa de éxito en el entorno `Disinfection`, y el repositorio no referencia ningún informe de evaluación. Cualquier cifra de rendimiento debería extraerse del run de Weights & Biases enlazado (que registra recompensa de entrenamiento, no evaluaciones estandarizadas).

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): en torno a 3,1-4 GB solo para pesos, más caché KV; con contexto moderado (4-8 K tokens) un presupuesto práctico de 6-8 GB es suficiente.
- Cuantización a 8 bits: aproximadamente 1,6-2 GB de pesos. A 4 bits: aproximadamente 0,9-1,2 GB. Requiere convertir los safetensors con herramientas externas, ya que no hay GGUF oficial.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, A10G o superiores. También cabe en GPU con 8 GB aplicando cuantización.
- Cabe en GPU de consumo: sí, es uno de los puntos fuertes del tamaño de 1,5B. Incluso en iGPU con memoria unificada de 16 GB mediante llama.cpp tras conversión a GGUF.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni latencia de primer token para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-Disinfection-step149 | 1,54 B (denso) | No confirmado en la ficha; base de 32 768 tokens | Entorno `Disinfection` (RLVE + GRPO) | Apache-2.0 | HuggingFace, safetensors |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,54 B (denso) | 32 768 tokens | Instrucción general, multilingüe | Apache-2.0 | HuggingFace, safetensors/GGUF/AWQ/GPTQ |
| Qwen/Qwen2.5-1.5B (preentrenado) | 1,54 B (denso) | 32 768 tokens | Modelo base sin ajuste instruccional | Apache-2.0 | HuggingFace |
| SmolLM2-1.7B-Instruct | 1,7 B (denso) | 8192 tokens | Instrucción general, inglés | Apache-2.0 | HuggingFace, safetensors/GGUF |
| Llama-3.2-1B-Instruct | 1,24 B (denso) | 128 000 tokens | Instrucción general, multilingüe | Licencia comunitaria de Llama 3.2 | HuggingFace, safetensors/GGUF |

Rendimiento comparado: no disponible. No existen evaluaciones publicadas de este checkpoint frente a las alternativas de la tabla, y la comparación solo puede establecerse por parámetros, contexto declarado y licencia.

## Limitaciones y advertencias

- Especialización extrema: el entrenamiento cubre un único entorno (`Disinfection`) a dificultad 0 durante 150 pasos. Es esperable una degradación del comportamiento generalista respecto al modelo base, aunque no se han publicado mediciones que la cuantifiquen.
- Sesgos conocidos: no documentados específicamente para este checkpoint. Al derivar de Qwen2.5-1.5B-Instruct, hereda los sesgos de su corpus de preentrenamiento, no auditados aquí.
- Riesgo de alucinación: alto en tareas fuera del entorno de entrenamiento, dado el reducido tamaño (1,5B) y la ausencia de evaluaciones de fidelidad. Dentro del entorno, la recompensa verificable reduce este riesgo, pero no lo elimina.
- Limitación de idioma: solo inglés declarado. No debe asumirse un rendimiento fiable en castellano u otros idiomas pese a que el modelo base sea multilingüe.
- Contexto: la model card no confirma la ventana efectiva tras el ajuste; conviene no asumir más de lo que soporte el modelo base y validarlo empíricamente.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero se incluye el `LICENSE` original de Qwen, por lo que conviene revisar que se mantienen las atribuciones correspondientes al modelo base.
- Estado del repositorio: 0 descargas, 0 "likes" y sin evaluación de terceros. Es un artefacto de investigación, no un modelo validado para producción.
- Riesgo operativo: no se documentan hiperparámetros ni criterios de selección del checkpoint final, lo que dificulta auditar la estabilidad del entrenamiento a partir de la model card únicamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-Disinfection-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Colección RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Perfil del autor: https://huggingface.co/davidheineman
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/40eb51c9
- Código de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Paper de referencia de los entornos RLVE: https://arxiv.org/abs/2511.07317
- Rethinking On-Policy Distillation of Large Language Models: https://arxiv.org/abs/2604.13016
- Lightning OPD 2.0: Mitigating Style Bias in Cross-Teacher On-Policy Distillation: https://arxiv.org/html/2607.28449
- Repositorio de terceros con modelos profesor OPD: https://github.com/ilovecplusplus230/-OPD/tree/main/teacher_model
