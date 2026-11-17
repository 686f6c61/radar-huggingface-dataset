# neplachuu/llm-course-hw2_colab-ppo

## Resumen

`neplachuu/llm-course-hw2_colab-ppo` es un ajuste fino del modelo `HuggingFaceTB/SmolLM-135M-Instruct` obtenido mediante RLHF con Proximal Policy Optimization (PPO) usando `PPOTrainer` de la librería TRL. Lo desarrolla la usuaria de Hugging Face neplachuu en el marco de la segunda tarea del curso «Grandes modelos de lenguaje» de la HSE (Higher School of Economics), con el objetivo de comparar experimentalmente PPO frente a DPO sobre una misma base instruct.

El modelo parte de SmolLM-135M-Instruct, un transformer decoder-only de 134.515.584 parámetros, y aplica un ciclo PPO con cuatro componentes: policy, reference policy (fija), reward model previamente entrenado y value model. El entrenamiento se realizó sobre el dataset `HumanLLMs/Human-Like-DPO-Dataset` con learning rate 1e-6, batch size 1 por GPU, acumulación de gradiente 4 y una época PPO por actualización, en una única NVIDIA Tesla T4.

Su relevancia es fundamentalmente didáctica: documenta un pipeline RLHF completo con PPO sobre un modelo pequeño, pero el propio autor advierte que el entrenamiento se detuvo antes de completar la época planificada por limitaciones de tiempo y cómputo. Las diferencias de generación antes y después de PPO son mínimas, por lo que no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM-135M-Instruct) |
| Parametros totales | 134.515.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM-135M-Instruct, un transformer decoder-only de 135M de parámetros. Sobre esa base se aplicó un ciclo de RLHF con PPO en el que participan cuatro modelos: la policy (la LM que se actualiza), una reference policy congelada (la SmolLM-135M-Instruct original) para penalizar la desviación KL, un reward model previamente entrenado que puntúa las respuestas y un value model que estima la recompensa esperada. El punto de partida fue la SmolLM-135M-Instruct original, no un checkpoint DPO, de modo que PPO y DPO constituyen experimentos independientes.

Los hiperparámetros documentados son: learning rate 1e-6, batch size 1 por GPU, acumulación de gradiente 4, una época PPO por actualización y ejecución en una NVIDIA Tesla T4. El dataset de entrenamiento es `HumanLLMs/Human-Like-DPO-Dataset`. El autor indica explícitamente que el entrenamiento se detuvo antes de completar la época planificada por restricciones de tiempo y cómputo, y que se conservaron los pesos tras las actualizaciones realizadas. No se documentan número total de tokens de entrenamiento, composición detallada del dataset ni técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, heredada de SmolLM-135M-Instruct.
- Respuestas multi-turno de tipo asistente digital, con el estilo característico de un modelo instruct pequeño.
- Ajuste de preferencias mediante señal de reward model (PPO), aunque con efecto limitado en las generaciones observadas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la metadata del modelo.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Experimentación académica con RLHF: reproducción y estudio del pipeline PPO con TRL (`PPOTrainer`) sobre un modelo de 135M, útil para cursos y laboratorios que comparan PPO frente a DPO con recursos limitados.
- Análisis de log-probabilidades: el modelo permite calcular probabilidades medias por token sobre datasets de preferencias (el autor lo hace sobre `HumanLLMs/Human-Like-DPO-Dataset` y `HuggingFaceH4/ultrafeedback_binarized`) para estudiar el desplazamiento de distribución tras el ajuste.
- Prototipado de chatbots de bajo coste: al caber en una sola GPU consumer, sirve para validar pipelines de inferencia conversacional antes de escalar a modelos mayores.
- Docencia de alineamiento: ejemplo práctico de cómo un reward model y una reference policy condicionan el comportamiento de una policy en PPO.
- Pruebas de infraestructura de despliegue: útil para verificar integraciones con `transformers`, text-generation-inference o endpoints compatibles usando un checkpoint pequeño.
- Investigación sobre estilos conversacionales: comparación cualitativa de respuestas antes y después de PPO para estudiar cuántas actualizaciones son necesarias para modificar el estilo de un modelo instruct pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente reporta métricas de log-probabilidad media por token de respuesta:

| Datos evaluados | Mean log probability |
|---|---:|
| Dataset original (`HumanLLMs/Human-Like-DPO-Dataset`) | −1.9093 |
| Dataset externo (`HuggingFaceH4/ultrafeedback_binarized`) | −2.1311 |
| Diferencia | +0.2217 |

La evaluación se realizó sobre 80 ejemplos de cada conjunto. El autor señala que la diferencia entre distribuciones es menor que en su experimento DPO, lo que atribuye al método de entrenamiento, a la duración del experimento y a diferencias entre datasets.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa aproximadamente 0,5 GB en safetensors (FP32/FP16 según pesos); en FP16 cabría en GPUs con 1-2 GB de VRAM, y en cuantizaciones de 8 o 4 bits en menos de 1 GB (estimación por tamaño de parámetros, no documentada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; el entrenamiento se realizó en una NVIDIA Tesla T4.
- Cabe holgadamente en GPU consumer, incluidas integradas con suficiente memoria compartida para cuantizaciones agresivas.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`) y, presumiblemente, llama.cpp/Ollama si se generan pesos GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `neplachuu/llm-course-hw2_colab-ppo` | 134,5M | no disponible | no disponible | Hugging Face | Ajuste PPO educativo, entrenamiento incompleto |
| `HuggingFaceTB/SmolLM-135M-Instruct` | 135M | no disponible en la información | no disponible en la información | Hugging Face | Modelo base; instruct generalista |
| `HuggingFaceTB/SmolLM-135M` | 135M | no disponible en la información | no disponible en la información | Hugging Face | Versión base sin ajuste instruct |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento incompleto: el autor confirma que PPO se detuvo antes de completar la época planificada, por lo que el efecto del ajuste es marginal.
- Calidad no validada: no se observa una mejora clara del estilo conversacional; las generaciones antes y después de PPO son casi idénticas.
- Modelo de propósito educativo: no está pensado para uso en producción.
- Idioma: solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia no especificada: la ausencia de licencia impide determinar condiciones de uso comercial; debe tratarse como no apto para uso comercial hasta que el autor la declare.
- Riesgo de alucinación: inherente a un modelo de 135M sin evaluación de fidelidad factual documentada.
- Sesgos: no documentados por el autor; un modelo de este tamaño y entrenado sobre datasets de preferencias en inglés puede reproducir sesgos presentes en esos datos.
- Contexto: la longitud de contexto no está documentada, lo que dificulta planificar cargas con prompts largos.
- Sin soporte documentado de tool calling, agentes o multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neplachuu/llm-course-hw2_colab-ppo
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Dataset de evaluación externo: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Librería TRL (PPOTrainer): https://github.com/huggingface/trl
