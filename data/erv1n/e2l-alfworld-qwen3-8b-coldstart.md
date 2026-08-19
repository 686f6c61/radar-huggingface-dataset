# erv1n/e2l-alfworld-qwen3-8b-coldstart

## Resumen

El modelo `erv1n/e2l-alfworld-qwen3-8b-coldstart` es un checkpoint intermedio de la primera etapa (cold-start) del pipeline de aprendizaje experiencial E2L (Experience-to-Learning) desarrollado por el autor `erv1n` y el repositorio `Ch1nyzzz/e2-learning`. Se trata de un ajuste fino de parámetros completos sobre el modelo base `Qwen/Qwen3-8B`, entrenado con aprendizaje online guiado por errores (mistake-driven experience learning) en el entorno de agente ALFWorld `AlfredTWEnv`. El checkpoint corresponde al paso de entorno `env_step_006220` de un experimento con 10.000 pasos activos.

Su propósito no es servir como modelo final para inferencia directa, sino como inicialización (cold start) para la segunda etapa de entrenamiento con RL (GRPO) mediante `verl-agent`. Al cargarse como un checkpoint estándar de Hugging Face, permite reanudar el entrenamiento o evaluar el comportamiento del agente en ALFWorld. Es relevante para la comunidad de investigación en agentes encarnados y aprendizaje por refuerzo, ya que demuestra un enfoque de entrenamiento sin supervisión externa densa, basado en un juez semántico que decide qué observaciones usar como señal de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, no especificada en el checkpoint) |
| Tipos de cuantizacion | no disponible (solo safetensors original, sin cuantizar) |
| Idiomas soportados | no disponible (no especificado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `Qwen/Qwen3-8B`, un transformer denso de 8.000 millones de parámetros. El entrenamiento se realizó con parámetros completos (full-parameter) utilizando un enfoque de aprendizaje experiencial online: el modelo interactúa con el entorno ALFWorld `AlfredTWEnv`, y un juez semántico evalúa si la observación siguiente es correcta o no; solo las observaciones consideradas válidas se usan como objetivo de SFT (next-observation SFT). Este proceso se denomina "mistake-driven" porque el modelo aprende de sus propios errores de interacción.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El checkpoint se guarda con el estado del controlador de experimentos en `controller_state.json`, que es metadatos de procedencia y puede ignorarse para inferencia o entrenamiento.

## Capacidades

- Navegación y manipulación en entornos de texto como ALFWorld (tareas de cocina, limpieza, organización de objetos) mediante acciones discretas.
- Generación de texto condicionada a observaciones del entorno (formato conversacional).
- Soporte de tool calling implícito al interactuar con el entorno (acciones como `go to`, `take`, `put`, etc.) aunque no se documenta explícitamente.
- Capacidades de razonamiento y comprensión del lenguaje heredadas de Qwen3-8B, aunque no se han evaluado específicamente en este checkpoint.
- No se documentan capacidades multimodales, ni modo de pensamiento explícito (thinking mode), ni soporte de audio o visión.

## Casos de uso

- Inicialización para entrenamiento con GRPO: el uso previsto del checkpoint es servir como punto de partida para la segunda etapa de entrenamiento de políticas con `verl-agent`. Se cargaría con `AutoModelForCausalLM.from_pretrained` y se continuaría el entrenamiento con RL.
- Evaluación de agentes en ALFWorld: permite medir el rendimiento del agente en tareas de navegación y manipulación antes del entrenamiento con RL, sirviendo como baseline.
- Investigación en aprendizaje experiencial: útil para estudiar cómo el entrenamiento online basado en errores afecta a la capacidad de generalización de agentes.
- Desarrollo de pipelines de entrenamiento de agentes: como componente en un flujo de entrenamiento de dos etapas (cold-start + RL), reproducible con el código de `e2-learning`.
- Pruebas de compatibilidad con frameworks de RL: verificar que el checkpoint se integra correctamente con `verl-agent` y otras herramientas de entrenamiento distribuido.
- Análisis de representaciones internas: al ser un checkpoint intermedio, puede usarse para estudiar cómo evolucionan las representaciones del modelo durante el aprendizaje experiencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de ALFWorld (como tasa de éxito) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8.000 millones de parámetros en precisión completa (probablemente BF16), se requieren aproximadamente 16-20 GB de VRAM para carga en memoria. Con cuantización a 8 bits podría reducirse a unos 8-10 GB, y a 4 bits a unos 5-6 GB, aunque no se proporcionan archivos cuantizados.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para inferencia sin cuantizar. Para entrenamiento con parámetros completos, se necesitarían GPUs con mayor memoria (A100 40/80 GB, H100) o técnicas de paralelismo.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar inferencia en GPUs consumer de gama alta (RTX 3090/4090) con cuantización, aunque no se ofrecen archivos GGUF o AWQ en el repositorio.
- Opciones de despliegue: al ser un checkpoint de Hugging Face estándar, puede usarse con `transformers`, `vLLM`, `Text Generation Inference` (TGI) o `llama.cpp` (si se convierte a GGUF). No se proporcionan configuraciones específicas de despliegue.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con otros modelos de la misma categoría (agentes entrenados con aprendizaje experiencial en ALFWorld). No se conocen checkpoints públicos equivalentes. Como referencia, el modelo base Qwen3-8B tiene un rendimiento general conocido, pero este checkpoint es específico para tareas de agente y no se han publicado métricas comparativas.

## Limitaciones y advertencias

- Es un checkpoint intermedio de entrenamiento, no un modelo final optimizado para producción. Su uso directo en aplicaciones reales no está recomendado.
- No se han documentado sesgos específicos, pero al heredar el comportamiento de Qwen3-8B, puede presentar los sesgos típicos de los modelos de lenguaje preentrenados.
- Riesgo de alucinación no evaluado específicamente; en tareas de agente, puede generar acciones inválidas o irrelevantes.
- Limitaciones de idioma: no se especifican los idiomas soportados, aunque Qwen3-8B soporta múltiples idiomas; este checkpoint no garantiza cobertura multilingüe.
- No se proporcionan cuantizaciones oficiales; el usuario debe generar sus propias versiones cuantizadas si las necesita.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia (Apache-2.0 también, según la información disponible), por lo que se debe verificar la compatibilidad.
- No hay garantías de rendimiento en tareas fuera del entorno ALFWorld; el entrenamiento se centró exclusivamente en ese dominio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/erv1n/e2l-alfworld-qwen3-8b-coldstart
- Repositorio GitHub de e2-learning: https://github.com/Ch1nyzzz/e2-learning
- Repositorio GitHub de verl-agent: https://github.com/langfengQ/verl-agent
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
