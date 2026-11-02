# kseniamakeevaa/llm-course-hw2-ppo

## Resumen

SmolLM-135M-Instruct PPO es un ajuste fino mediante aprendizaje por refuerzo (PPO) del modelo SmolLM-135M-Instruct de HuggingFaceTB, desarrollado por la usuaria kseniamakeevaa como trabajo de curso. El objetivo del experimento es aplicar un pipeline completo de RLHF —con una reward model entrenada aparte sobre pares `chosen`/`rejected`— sobre un modelo de lenguaje de 135 millones de parámetros, empleando la librería TRL. Se trata, por tanto, de una pieza didáctica que ilustra el flujo PPO (policy, value model, reward model y reference policy) más que de un modelo destinado a producción.

El modelo parte de la arquitectura Llama de SmolLM-135M-Instruct y hereda su ventana de contexto y su tokenizador. El entrenamiento se realizó sobre un subconjunto de 2 048 episodios del dataset HumanLLMs/Human-Like-DPO-Dataset, con 512 pasos de optimización, batch size 4, learning rate 3e-6, coeficiente KL de 0.05 y una longitud máxima de respuesta de 64 tokens, todo ello en una única GPU NVIDIA T4 de Google Colab.

Su relevancia es fundamentalmente pedagógica: documenta de forma transparente un experimento de RLHF a pequeña escala, incluyendo la confesión del autor de que no se observó una mejora clara de calidad tras el PPO y de que no se realizó una evaluación sistemática en un conjunto de validación separado. No debe confundirse con un modelo instructivo listo para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (heredada de SmolLM-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolLM-135M-Instruct |
| Dataset de entrenamiento | HumanLLMs/Human-Like-DPO-Dataset (subconjunto de 2 048 episodios) |
| Libreria | transformers, TRL (PPO) |
| Tamano del repositorio | 0.5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM-135M-Instruct: un transformer decoder-only de tipo Llama con 135 millones de parámetros, orientado a generación de texto y afinado previamente por instrucciones por HuggingFaceTB. Sobre esa base, el autor aplicó un ciclo de PPO con TRL en el que se entrenaron la política (`policy`) y el modelo de valor (`value_model`), mientras que la reward model y la política de referencia (`ref_policy`) permanecieron congeladas. Tanto `policy` como `ref_policy` se inicializaron desde SmolLM-135M-Instruct, no desde un modelo DPO intermedio.

La reward model se entrenó de forma independiente sobre pares `chosen`/`rejected` del dataset HumanLLMs/Human-Like-DPO-Dataset y se publica por separado en `kseniamakeevaa/llm-course-hw2-reward-model`. Los hiperparámetros del PPO fueron: 2 048 episodios totales, 512 pasos de entrenamiento, batch size 4, learning rate 3e-6, una época PPO por batch, 64 tokens de longitud de generación, coeficiente KL de 0.05 y temperatura 0.7. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) ni detalles sobre el volumen total de tokens vistos más allá de los episodios indicados.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instructivo.
- Respuesta a instrucciones y preguntas generales de dominio abierto.
- Ajuste de estilo mediante RLHF (PPO) sobre preferencias humanas simuladas por la reward model.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No se documentan capacidades específicas de código o matemáticas más allá de las del modelo base de 135M.

## Casos de uso

- Docencia y formación en RLHF: el modelo sirve como ejemplo reproducible de un pipeline PPO completo con TRL, incluyendo el entrenamiento separado de una reward model y la congelación de `ref_policy`.
- Experimentación académica con presupuesto mínimo: al entrenarse en una sola T4 y ocupar 0.5 GB en safetensors, permite iterar sobre hiperparámetros de PPO sin infraestructura dedicada.
- Comparación de metodologías de alineamiento: útil para contrastar PPO frente a DPO sobre el mismo modelo base y el mismo dataset de preferencias.
- Pruebas de infraestructura de inferencia: sirve para validar pipelines de `text-generation-inference` o endpoints compatibles con modelos pequeños antes de escalar a modelos mayores.
- Generación de texto de bajo coste en prototipos: para demos internas donde la calidad lingüística no es crítica y se prioriza el coste computacional.
- Estudio de fallos de alineamiento: el propio autor documenta respuestas incoherentes (por ejemplo, incluir la preparación para dormir dentro de una rutina matutina), lo que lo convierte en un caso útil para analizar derivas del PPO con pocos episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no realizó una evaluación completa sobre un conjunto de validación separado y que la comparación cualitativa con el modelo base (pregunta "What's your morning routine like?") no mostró una mejora evidente tras el PPO.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0.3 GB solo para pesos (134.5M × 2 bytes), más overhead de activaciones y KV cache; en la práctica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp32: en torno a 0.55 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento documentado se realizó en una NVIDIA T4 de Google Colab.
- Cabe en GPU consumer: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores, así como en CPU para inferencia con cuantización.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio) y, previsiblemente, llama.cpp/Ollama si se generan pesos GGUF, aunque no se publican en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kseniamakeevaa/llm-course-hw2-ppo | 134.5M | no disponible | no disponible | HuggingFace | Ajuste PPO de curso, sin evaluación sistemática |
| HuggingFaceTB/SmolLM-135M-Instruct | 135M | no disponible en esta ficha | Apache 2.0 (según el modelo base original) | HuggingFace | Modelo base instructivo, con evaluación publicada por HuggingFaceTB |
| HuggingFaceTB/SmolLM-360M-Instruct | ~360M | no disponible en esta ficha | Apache 2.0 (según el modelo base original) | HuggingFace | Alternativa de mayor tamaño de la misma familia |
| Qwen2.5-0.5B-Instruct | ~500M | 32 768 tokens (según documentación de Qwen) | Apache 2.0 | HuggingFace | Alternativa multilingüe de tamaño superior |

La comparación directa con el modelo base es la más informativa: este ajuste PPO no documenta mejoras medibles frente a SmolLM-135M-Instruct y añade opacidad sobre licencia y contexto.

## Limitaciones y advertencias

- Entrenamiento limitado a 2 048 episodios y 512 pasos: el propio autor reconoce que no observó una mejora clara de calidad frente al modelo base.
- Respuestas potencialmente repetitivas o ilógicas, con derivas temáticas documentadas (rutina nocturna dentro de una rutina matutina).
- Riesgo elevado de alucinación inherente a un modelo de 135M parámetros, agravado por la falta de evaluación sistemática.
- Idiomas: únicamente inglés según la etiqueta del repositorio; no se garantiza un rendimiento aceptable en castellano.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor; el modelo base original de HuggingFaceTB se distribuye bajo Apache 2.0, pero el ajuste no declara licencia propia.
- Longitud de contexto no documentada en la información proporcionada; conviene verificar la configuración del tokenizador y del modelo base antes de usarlo con prompts largos.
- Naturaleza de trabajo de curso: sin garantías de mantenimiento, soporte ni actualizaciones.
- La calidad de la reward model en su conjunto de test no garantiza una mejora del texto generado tras PPO, como señala el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kseniamakeevaa/llm-course-hw2-ppo
- Reward model asociada: https://huggingface.co/kseniamakeevaa/llm-course-hw2-reward-model
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de preferencias: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Librería TRL (PPO): https://github.com/huggingface/trl
- Documentación de PPO en TRL: https://huggingface.co/docs/trl/ppo_trainer
