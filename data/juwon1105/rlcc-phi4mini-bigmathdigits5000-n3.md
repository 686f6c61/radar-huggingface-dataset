# juwon1105/RLCC-phi4mini-bigmathdigits5000-n3

## Resumen

El modelo RLCC-phi4mini-bigmathdigits5000-n3 es un ajuste fino de microsoft/Phi-4-mini-instruct desarrollado por juwon1105, que aplica el método RLCC (Reinforcement Learning with Confidence Curriculum) sobre el dataset Big-Math-digits. Este enfoque utiliza la confianza calibrada producida por un checkpoint RLCR como señal de dificultad para organizar el conjunto de entrenamiento en un currículo de fácil a difícil, y entrena desde cero con optimización GRPO. El objetivo es mejorar simultáneamente el razonamiento matemático y la calibración de la incertidumbre del modelo, un aspecto poco explorado en el aprendizaje por refuerzo para modelos de lenguaje.

El modelo tiene 3.836.021.760 parámetros (aproximadamente 3,8 mil millones) y se distribuye en formato safetensors. Está diseñado para tareas de generación de texto con énfasis en razonamiento matemático y estimación de confianza. Su relevancia radica en que introduce un mecanismo de currículo basado en confianza calibrada, que podría mejorar la fiabilidad de las respuestas en aplicaciones donde la incertidumbre es crítica. No se especifican la longitud de contexto ni los idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en microsoft/Phi-4-mini-instruct) |
| Parametros totales | 3.836.021.760 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other (no se especifica la licencia concreta) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Phi-4-mini-instruct, un modelo de lenguaje de la familia Phi de Microsoft, pero no se detallan los componentes arquitectónicos específicos en la información proporcionada. El entrenamiento se realiza con el algoritmo GRPO (Group Relative Policy Optimization), una variante de PPO que agrupa respuestas para calcular ventajas relativas. Se utiliza un único epoch, con batch size por dispositivo de 1, y un total de 5.000 muestras de entrenamiento del dataset mehuldamani/big-math-digits, más 1.000 muestras reservadas para evaluación.

La innovación principal es RLCC: el conjunto de entrenamiento se divide en K=3 grupos aleatorios, cada uno ordenado de fácil a difícil según la confianza calibrada de un checkpoint RLCR previo. Esta secuencia se concatena para formar el currículo. El modelo se entrena desde cero (no desde el checkpoint RLCR) con la misma recompensa y optimización GRPO que RLCR/RLVR, cambiando únicamente el orden de los datos. Se emplea vLLM para los rollouts con temperatura 0.7 y 32 generaciones por prompt, con un batch efectivo de 1.024. La recompensa se calcula mediante coincidencia exacta sobre la respuesta final extraída. El entrenamiento se realizó en una RTX 3090 durante 16-36 horas GPU.

## Capacidades

- Generación de texto en lenguaje natural, con foco en problemas matemáticos y razonamiento simbólico.
- Razonamiento matemático: entrenado específicamente en el dataset Big-Math-digits, que contiene problemas de aritmética con dígitos grandes.
- Calibración de confianza: el modelo está diseñado para producir estimaciones de incertidumbre más fiables, aunque los resultados muestran un ECE alto (0.395), lo que indica que la calibración aún es imperfecta.
- No se mencionan capacidades de tool calling, agentes, visión, audio ni soporte multilingüe en la información disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo sirve como banco de pruebas para estudiar métodos de currículo basados en confianza, como RLCC, y comparar con RLCR o RLVR.
- Evaluación de calibración en modelos de lenguaje: permite medir métricas como ECE, PCE, Brier score y AUROC en tareas de razonamiento matemático, útil para validar técnicas de calibración.
- Generación de respuestas con estimación de incertidumbre: en aplicaciones donde se necesita conocer el nivel de confianza del modelo, como sistemas de tutoría inteligente o asistencia en resolución de problemas.
- Análisis de robustez en razonamiento numérico: al estar entrenado con dígitos grandes, puede usarse para probar la capacidad de generalización en operaciones aritméticas complejas.
- Desarrollo de pipelines de RL con GRPO: el repositorio documenta hiperparámetros y configuración, sirviendo como referencia para implementar GRPO con vLLM y recompensas basadas en reglas.
- Benchmarking de modelos pequeños: con 3,8B parámetros, es adecuado para comparar el rendimiento de modelos compactos en tareas de razonamiento y calibración frente a alternativas de tamaño similar.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación held-out (1.000 muestras):

| Metrica | Valor |
|---|---|
| Accuracy | 0.447 |
| ECE (Expected Calibration Error) | 0.395 |
| PCE (Probability Calibration Error) | 0.394 |
| Brier score | 0.326 |
| AUROC | 0.723 |

No se proporcionan comparaciones con otros modelos en la información disponible. Estos valores indican una precisión moderada (44,7%) y una calibración deficiente (ECE cercano a 0.4), aunque el AUROC de 0.723 sugiere cierta capacidad discriminativa en la confianza.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,8B parámetros, en FP16 se requieren aproximadamente 7,6 GB solo para los pesos, más overhead de activaciones y KV cache. En cuantización de 8 bits se reduce a unos 4 GB, y en 4 bits a unos 2 GB. No se han publicado mediciones oficiales.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) es suficiente para FP16 sin cuantizar. Para cuantización 4-bit, una GPU con 6-8 GB (como RTX 3060 o RTX 4060) podría ser viable.
- El modelo cabe en GPUs de consumo, especialmente con cuantización.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se especifican configuraciones oficiales.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia moderada en GPUs de consumo, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un fine-tuning de Phi-4-mini-instruct, por lo que una comparación natural sería contra el modelo base, pero no se reportan benchmarks de este último. Tampoco se mencionan alternativas como Qwen2.5-3B o Llama-3.2-3B. Por tanto, no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo experimental: es un checkpoint de investigación asociado a un paper bajo revisión, no un producto listo para producción.
- Dataset limitado: entrenado solo con 5.000 muestras de un dominio específico (aritmética con dígitos grandes), lo que limita su generalización a otras tareas.
- Calibración deficiente: el ECE de 0.395 indica que las probabilidades de confianza no están bien alineadas con la precisión real, lo que puede inducir a error en aplicaciones que dependan de la incertidumbre.
- Licencia "other": no se especifica la licencia concreta, por lo que el uso comercial puede estar restringido. Se recomienda contactar al autor antes de utilizarlo en entornos productivos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente fuera de su dominio de entrenamiento.
- Sin soporte multilingüe declarado: no se indica qué idiomas maneja, aunque al estar basado en Phi-4-mini-instruct probablemente soporte inglés y otros, pero no es seguro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juwon1105/RLCC-phi4mini-bigmathdigits5000-n3
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/big-math-digits
- Paper asociado (en revisión): "Confidence as Curriculum: Reinforcement Learning for Joint Reasoning and Calibration" (sin enlace público aún)
- Paper base RLCR: Damani et al., "Beyond Binary Rewards: Training LMs to Reason about their Uncertainty", ICLR 2026 (referencia bibliográfica en la model card)
