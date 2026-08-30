# jellyho/acrft-yam-extraction

## Resumen

ACRFT (Action-Conditioned Reinforcement Fine-Tuning) es un proyecto de robótica que aplica técnicas de offline reinforcement learning (RL) sobre modelos VLA (Vision-Language-Action) de tipo pi0.5. El modelo `jellyho/acrft-yam-extraction` contiene los "brazos" (policy heads) extraídos de un entrenamiento de extracción de políticas, diseñados para ser usados junto con los críticos publicados en `jellyho/acrft-yam-critics`. El objetivo es refinar políticas de control robótico mediante aprendizaje por refuerzo offline, utilizando un crítico de valor (patch critic) para guiar la optimización.

Sin embargo, en el momento de la consulta, los pesos de este modelo han sido retirados por su autor. La primera versión fue entrenada con propriocepción en bruto cuando el crítico esperaba valores normalizados, lo que provocaba una desviación significativa en el gradiente de Q (coseno medio de 0.85, negativo en la cola) y un cambio en las etiquetas de optimalidad (una de cada cinco se invertía). El autor está reentrenando los brazos y los publicará de nuevo cuando los resultados estén listos. El repositorio de código fuente (GitHub) permanece disponible con las implementaciones y su trazabilidad a nivel de archivo y línea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 (no se especifican detalles de capas o atención) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje general) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repo tiene 9.6 GB, probablemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura pi0.5, un VLA que combina visión, lenguaje y acción para control robótico. El entrenamiento utiliza offline RL con un crítico de valor (patch critic) que evalúa estados completos normalizados. La extracción de políticas (policy extraction) se realiza mediante algoritmos como AWR (Advantage-Weighted Regression) o CFGRL, que utilizan las ventajas calculadas por el crítico para actualizar la política. El autor menciona que la primera versión se entrenó con propriocepción en bruto, mientras que el crítico esperaba valores normalizados, lo que causaba una degradación en la señal de entrenamiento. No se proporcionan detalles sobre el dataset, el número de tokens o el proceso de RLHF/DPO.

## Capacidades

- Control robótico: el modelo genera acciones de control para brazos robóticos en tareas de manipulación (en este caso, una tarea de "lego-taxi").
- Integración con críticos: diseñado para funcionar con el crítico de valor `acrft-yam-critics` para entrenamiento offline RL.
- Extracción de políticas: permite extraer una política entrenada desde un modelo VLA base (pi0.5) para su despliegue o evaluación.
- No se especifican capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling o agentes.

## Casos de uso

- Entrenamiento offline RL para robótica: el modelo sirve como política inicial para refinar comportamientos mediante offline RL, usando el crítico para evaluar y mejorar las acciones.
- Evaluación de políticas en simulación: permite probar la política extraída en entornos simulados (como la tarea lego-taxi) antes del despliegue físico.
- Investigación en VLA y RL: útil para estudiar la interacción entre críticos y políticas en arquitecturas VLA, especialmente en problemas de normalización de estados.
- Transferencia de políticas: la extracción de políticas puede facilitar la transferencia de comportamientos aprendidos a diferentes plataformas robóticas.
- Benchmarking de algoritmos de policy extraction: sirve como referencia para comparar métodos como AWR o CFGRL en tareas de manipulación.
- Desarrollo de sistemas de control adaptativo: la combinación de crítico y política permite ajustar el comportamiento del robot en función de recompensas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona métricas internas (coseno de 0.85, ventaja de -21.5 a -6.9) pero no hay tablas comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño del repo (9.6 GB), se requiere una GPU con al menos 12-16 GB de VRAM para inferencia en FP16, pero no se confirma.
- GPU recomendadas: no disponible. Modelos VLA de tamaño similar suelen ejecutarse en GPUs como RTX 3090/4090 o A100, pero no hay datos específicos.
- Compatibilidad con GPU de consumo: probablemente sí, si se usa cuantización, pero no se especifica.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de robótica, probablemente se use con frameworks como JAX o PyTorch directamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA con extracción de políticas offline RL). El proyecto es específico y no se mencionan alternativas. Se puede indicar que no hay comparativa disponible.

## Limitaciones y advertencias

- Pesos retirados: el modelo no está disponible para descarga en el momento actual. Cualquier uso en producción es imposible hasta que se publiquen los nuevos pesos.
- Problema de normalización: la primera versión tenía un desajuste entre la propriocepción en bruto y la normalizada esperada por el crítico, lo que degradaba la señal de entrenamiento. Esto puede repetirse si no se corrige en el reentrenamiento.
- Sesgos y alucinación: al ser un modelo de robótica, no aplica el concepto de alucinación textual, pero puede generar acciones subóptimas si el crítico está mal calibrado.
- Licencia: Apache-2.0 permite uso comercial, pero al no haber pesos disponibles, no se puede explotar actualmente.
- Documentación incompleta: no se especifican detalles de arquitectura, dataset, ni requisitos de hardware, lo que dificulta su evaluación.

## Enlaces

- HuggingFace: https://huggingface.co/jellyho/acrft-yam-extraction
- Repositorio GitHub: https://github.com/jellyho/ACRFT
- Modelo de críticos relacionado: https://huggingface.co/jellyho/acrft-yam-critics
- Perfil del autor: https://huggingface.co/jellyho
