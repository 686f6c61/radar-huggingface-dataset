# dvader13/smollm3-3b-traj-1p23t

## Resumen

El repositorio `dvader13/smollm3-3b-traj-1p23t` contiene los checkpoints intermedios de la trayectoria de entrenamiento por refuerzo (RL) del modelo SmolLM3-3B, publicados por un usuario independiente (dvader13) bajo licencia Apache 2.0. Se trata de 31 snapshots en precisión bf16 correspondientes a la primera época de entrenamiento, partiendo de la rung de preentrenamiento de 1,23 billones de tokens. El objetivo de este repositorio no es ofrecer un modelo listo para producción, sino proporcionar a la comunidad investigadora una ventana al proceso de optimización por refuerzo, permitiendo estudiar cómo evolucionan las capacidades del modelo a lo largo del entrenamiento.

El modelo base, SmolLM3-3B, es un transformador decoder-only de 3 mil millones de parámetros desarrollado por HuggingFace, con atención de consultas agrupadas (GQA) y sin posicionamiento rotatorio (RoPE), diseñado para un despliegue eficiente y un rendimiento competitivo en la escala de 3B. Este repositorio en particular no incluye los pesos finales del modelo ajustado, sino una secuencia de checkpoints intermedios que pueden usarse para análisis de dinámica de entrenamiento, estudios de alineación o reproducción de experimentos.

La relevancia de este recurso reside en la escasez de datos públicos sobre trayectorias completas de entrenamiento por refuerzo en modelos abiertos. Al proporcionar 31 puntos de control con un espaciado creciente (20 pasos al inicio, luego 40, 80 y 120), permite a los investigadores correlacionar métricas de rendimiento con el progreso de la optimización, algo poco común en la literatura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention (GQA), sin RoPE |
| Parametros totales | 3 mil millones (inferido del modelo base SmolLM3-3B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (capacidad del modelo base) |
| Tipos de cuantizacion | bf16 (formato nativo de los checkpoints) |
| Idiomas soportados | no disponible en el repositorio; el modelo base soporta 6 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoints individuales en bf16) |

## Arquitectura y entrenamiento

El modelo subyacente, SmolLM3-3B, emplea una arquitectura transformer decoder-only con atención de consultas agrupadas (GQA) para reducir el tamaño de la caché KV, y prescinde de codificaciones posicionales rotativas (RoPE), lo que según la documentación de HuggingFace mejora el rendimiento en tareas de contexto largo. El preentrenamiento del modelo base se realizó sobre un corpus de 11,2 billones de tokens (aunque el repositorio indica que la rung concreta utilizada como punto de partida fue de 1,23 billones de tokens), con un énfasis en razonamiento y código.

Los checkpoints de este repositorio corresponden a la fase de RLHF, concretamente la primera época de entrenamiento por refuerzo. Se proporcionan 31 snapshots con un espaciado que se amplía progresivamente: 20 pasos hasta el paso 200, luego 40, 80 y 120. No se detalla el algoritmo de RLHF empleado (p. ej., PPO, GRPO), el tipo de recompensa o la composición del dataset de preferencias; esa información no está disponible en el repositorio.

## Capacidades

- Los checkpoints son de uso exclusivo para inferencia (el model card indica "inference only").
- Al ser puntos intermedios del entrenamiento de refuerzo, las capacidades varían según el paso: los primeros checkpoints pueden mostrar un comportamiento cercano al modelo base, mientras que los últimos reflejan una alineación más avanzada.
- El modelo base SmolLM3-3B presenta capacidades de generación de texto, razonamiento, código y matemáticas, así como soporte de tool calling y modo de pensamiento extendido (extended thinking). Estas capacidades deberían estar presentes en mayor o menor medida en los checkpoints finales de la trayectoria, aunque no se puede garantizar su completitud en los intermedios.
- No se ha confirmado soporte para visión, audio o multimodalidad; se trata de un modelo de texto únicamente.
- Multilingüismo: el modelo base soporta seis idiomas, pero el repositorio no especifica cuáles, por lo que se considera no disponible.

## Casos de uso

- Investigación en dinámicas de entrenamiento: los 31 checkpoints permiten estudiar la evolución de la pérdida, la alineación y las capacidades a lo largo del RLHF, algo útil para diseñar mejores estrategias de entrenamiento.
- Evaluación de la convergencia: se puede medir en qué paso se estabiliza el rendimiento en tareas concretas (razonamiento, código) y comparar con el modelo final.
- Análisis de regresión de capacidades: estudiar si el RLHF provoca degradación en ciertas habilidades (p. ej., matemáticas o multilingüismo) y en qué punto aparece.
- Reproducibilidad de experimentos: los checkpoints pueden servir como línea base para reproducir experimentos de alineación sin necesidad de reentrenar desde cero.
- Educación e investigación académica: ideal para cursos de aprendizaje por refuerzo o seminarios sobre alineación de modelos, al ofrecer una trayectoria real de entrenamiento.
- Benchmarking de técnicas de interpolación de pesos: los snapshots consecutivos permiten probar métodos de fusión de modelos o interpolación lineal de pesos (model merging) entre etapas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio. Al tratarse de checkpoints intermedios, los números de rendimiento dependerían del paso concreto y no se han facilitado. El modelo base SmolLM3-3B supera según HuggingFace a Llama 3.2 3B y Qwen2.5 3B, y compite con alternativas de 4B (Qwen3, Gemma3), pero esos datos corresponden al modelo final, no a estos checkpoints.

## Requisitos de hardware

- Los checkpoints están en bf16, por lo que cada uno ocupa aproximadamente 6 GB de VRAM (3B parámetros × 2 bytes por parámetro). El repositorio completo (31 checkpoints) ocupa 190,7 GB, pero solo se necesita cargar un checkpoint a la vez.
- VRAM estimada para inferencia: entre 6 GB y 10 GB dependiendo de la longitud del contexto y del tamaño de lote. Con contexto de 128K tokens, la memoria puede dispararse; para pruebas cortas, una GPU consumer de 8-12 GB (RTX 3060, RTX 3080, RTX 4070) es suficiente.
- GPU recomendadas: RTX 4090 (24 GB) para contextos largos o A10G/A100 para despliegue profesional.
- Cabe en GPUs consumer de gama media (8 GB o más) con cuantización adicional, aunque el repositorio solo ofrece bf16.
- Opciones de despliegue: llama.cpp (con conversión a GGUF), vLLM (con soporte de bf16), Ollama (tras conversión), HuggingFace Transformers con `device_map="auto"`.
- Latencia y throughput: no se dispone de datos medidos en este repositorio; en una RTX 4090 con bf16, se estiman 30-60 tokens/s para generación, pero no se ha verificado.

## Comparativa con modelos similares

No existe una comparativa directa disponible para este repositorio concreto, ya que no es un modelo final sino una secuencia de checkpoints de entrenamiento. La alternativa más próxima es el modelo base SmolLM3-3B final de HuggingFace, y otros modelos de 3B como Llama 3.2 3B o Qwen2.5 3B, pero la comparación no es significativa para checkpoints intermedios. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- El repositorio es un conjunto de checkpoints intermedios de entrenamiento, no un modelo ajustado y validado; no debe usarse en producción sin evaluación previa.
- La alineación no está garantizada: los primeros checkpoints pueden presentar comportamientos no deseados o respuestas incoherentes, ya que son etapas tempranas del RLHF.
- Riesgo de alucinación: al ser un modelo de 3B, puede generar información incorrecta, especialmente en los checkpoints menos entrenados.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, los checkpoints intermedios pueden no haber sido entrenados con contexto largo en la fase de RLHF; no se recomienda usar contextos muy largos sin validación.
- Idiomas: el repositorio no especifica los idiomas soportados; los checkpoints pueden no cubrir adecuadamente idiomas distintos del inglés.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero los checkpoints no son un producto final; cualquier uso debe basarse en los términos de la licencia del modelo base.
- Ausencia de garantías: el autor no proporciona ningún tipo de garantía ni documentación sobre el rendimiento de los checkpoints.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/smollm3-3b-traj-1p23t
- Modelo base SmolLM3-3B (HuggingFace): https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Documentación técnica de SmolLM3 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/smollm3
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm
- Página de SmolLM3-3B en atomic.chat: https://atomic.chat/models/smollm3-3b
