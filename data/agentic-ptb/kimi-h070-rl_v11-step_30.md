# agentic-ptb/kimi.h070.rl_v11.step_30

## Resumen

El modelo `agentic-ptb/kimi.h070.rl_v11.step_30` es un checkpoint intermedio de un barrido de entrenamiento por refuerzo (RL) denominado `rl_v11`, publicado por el usuario `agentic-ptb`. Se trata de un punto de control extraído a las 71,89 horas de una ejecución de 100 horas, dentro de la celda experimental `kimi` con el controlador `kimi-code / kimi-k3` y un esfuerzo de razonamiento `high`. El modelo base es `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (~9,4B) y pesos en formato safetensors (18,8 GB).

Este checkpoint no es un modelo final listo para producción, sino una instantánea de investigación para estudiar la dinámica del entrenamiento por refuerzo. Su relevancia radica en que permite trazar la evolución del rendimiento a lo largo del tiempo de entrenamiento, aunque presenta una limitación crítica: le falta el token de fin de secuencia `<|im_end|>` (ID 248046), por lo que no detiene correctamente las respuestas y puede desbordar la ventana de contexto. Por tanto, cualquier métrica de evaluación obtenida directamente de este checkpoint debe interpretarse como un límite inferior, no como una medición real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-9B-Base (detalles internos no especificados) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la información proporcionada. El modelo se construye sobre `Qwen/Qwen3.5-9B-Base`, por lo que hereda su diseño estructural, aunque no se especifican detalles como el número de capas, cabezas de atención o mecanismos de atención. Al ser un checkpoint de un barrido de RL, el entrenamiento consiste en un proceso de optimización por refuerzo (identificado como `rl_v11`) aplicado sobre el modelo base, con un controlador `kimi-code / kimi-k3` y un nivel de esfuerzo de razonamiento `high`. No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento ni el algoritmo RL concreto (PPO, GRPO, etc.). El checkpoint se guardó a las 71,89 horas de una ejecución planificada de 100 horas, lo que indica que es un punto intermedio del proceso.

## Capacidades

No se han documentado capacidades específicas para este checkpoint en la model card. Al estar basado en `Qwen3.5-9B-Base`, es razonable esperar capacidades generales de generación de texto, razonamiento y código propias de la familia Qwen3.5, pero no hay confirmación oficial en la información disponible. La model card solo menciona el contexto experimental (celda `kimi`, controlador `kimi-code/kimi-k3`, esfuerzo `high`) y la advertencia sobre el token EOS faltante. No se indica soporte para tool calling, agentes, visión ni otras funcionalidades.

## Casos de uso

Dado que se trata de un checkpoint intermedio de investigación con una limitación grave en la generación de secuencias, no es adecuado para aplicaciones de producción. Los casos de uso realistas son:

- Investigación en dinámicas de entrenamiento por refuerzo: permite analizar cómo evoluciona el comportamiento del modelo a lo largo de las horas de entrenamiento, comparando checkpoints de la misma ejecución.
- Estudio de la influencia del token EOS en la calidad de generación: al carecer del token `<|im_end|>`, sirve como caso de estudio para entender el impacto de la terminación de secuencia en modelos de chat.
- Desarrollo de pipelines de evaluación para checkpoints intermedios: puede utilizarse para probar metodologías de evaluación que tengan en cuenta el desbordamiento de contexto.
- Reentrenamiento o reempaquetado: si se añade el token EOS faltante, el checkpoint podría servir como punto de partida para continuar el entrenamiento o para experimentos de fine-tuning adicionales.
- Comparación de curvas de rendimiento: junto con otros checkpoints de la misma ejecución (identificados por la hora `hHHH` en el ID), permite trazar curvas de rendimiento frente al tiempo de entrenamiento.
- Validación de infraestructura de entrenamiento: útil para verificar que los sistemas de guardado y restauración de checkpoints funcionan correctamente en entornos de RL a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que, debido al token EOS faltante, los números de evaluación de este checkpoint son un límite inferior y no deben compararse con otros checkpoints que sí incluyan el token de fin de secuencia. No se proporcionan métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros en precisión BF16 (inferido del tamaño de 18,8 GB), se necesitan aproximadamente 19 GB de VRAM para cargar los pesos completos. Con cuantización int8 (~10 GB) o int4 (~5 GB) podría reducirse, pero no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: una GPU con 24 GB de VRAM (p. ej., RTX 3090, RTX 4090) puede cargar el modelo en BF16. Para mayor comodidad, una A100 de 40 GB o H100 de 80 GB permiten margen para el contexto y la generación.
- En consumer GPU: sí, cabe en GPUs de gama alta con 24 GB de VRAM, aunque la generación puede ser lenta sin optimizaciones.
- Opciones de despliegue: al ser un checkpoint de investigación sin token EOS adecuado, no se recomienda su despliegue con vLLM, Ollama o TGI. Si se reempaqueta correctamente, podría usarse con llama.cpp o vLLM, pero no hay soporte oficial documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Como referencia estructural, se puede comparar con el modelo base y otras alternativas de tamaño similar, pero sin métricas reales la comparación es limitada:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| agentic-ptb/kimi.h070.rl_v11.step_30 | 9,4B | No disponible | No disponible | Checkpoint intermedio de RL, sin token EOS |
| Qwen/Qwen3.5-9B-Base | 9,4B | No disponible | No disponible | Modelo base, sin fine-tuning RL |
| Llama-3.1-8B (referencia) | 8B | 128K | Meta Llama 3 | Modelo comercial de tamaño similar, pero no comparable directamente |

No se dispone de información suficiente para una comparativa rigurosa.

## Limitaciones y advertencias

- Token EOS faltante: el checkpoint no incluye el token `<|im_end|>` (ID 248046), por lo que las respuestas no terminan correctamente y pueden desbordar la ventana de contexto. Esto invalida su uso directo en producción.
- Checkpoint intermedio: es una instantánea a las 71,89 horas de un run de 100 horas; no representa el estado final del entrenamiento y puede tener un rendimiento inferior al del modelo final.
- Licencia no disponible: no se especifica la licencia, por lo que no se puede determinar si es apto para uso comercial o académico.
- Idiomas y contexto no documentados: no hay información sobre los idiomas soportados ni la longitud de contexto efectiva.
- Riesgo de alucinación y sesgos: al ser un modelo de 9B basado en Qwen, puede presentar alucinaciones y sesgos típicos de los modelos de este tamaño, pero no hay datos específicos.
- No apto para producción: debido a las limitaciones anteriores, no debe integrarse en sistemas reales sin un reempaquetado y evaluación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h070.rl_v11.step_30
- Índice de checkpoints (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
