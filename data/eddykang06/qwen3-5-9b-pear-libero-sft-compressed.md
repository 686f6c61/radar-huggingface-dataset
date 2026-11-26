# eddykang06/qwen3.5-9b-pear-libero-sft-compressed

## Resumen

Qwen3.5-9B-PEAR-LIBERO-SFT-Compressed es un ajuste fino por supervisión (SFT) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario eddykang06, orientado a robótica y, en concreto, al benchmark LIBERO. El modelo se entrena sobre episodios exitosos generados por un profesor de mayor tamaño, Qwen3.8-27B-PEAR-LIBERO_only, con el razonamiento comprimido, dentro del proyecto robot-distillation. La propuesta es destilar en un modelo de 9B la capacidad de razonamiento y planificación de manipulación robótica de un profesor de 27B, reduciendo la longitud de las cadenas de razonamiento.

El modelo se publica como parte de un pipeline de destilación para tareas de manipulación robótica en entornos simulados LIBERO. Su relevancia radica en la reducción de coste de inferencia frente al profesor: un modelo de 9B con razonamiento comprimido puede desplegarse en hardware más modesto manteniendo, según la hipótesis del autor, parte del rendimiento del profesor de 27B en tareas de planificación de acciones.

La información pública disponible es muy escasa. La model card indica explícitamente que el modelo aún no se ha subido, no declara licencia ni idiomas, y no incluye resultados de benchmarks. Cualquier evaluación de rendimiento debe considerarse pendiente hasta que el autor publique pesos y métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-9B); detalles no disponibles |
| Parametros totales | 9B (según el nombre del modelo y el modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el autor indica que el modelo aún no se ha subido) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer decoder-only de 9 mil millones de parámetros. Sobre esa base se aplica un ajuste fino supervisado (SFT) utilizando como datos los episodios exitosos del profesor Qwen3.8-27B-PEAR-LIBERO_only ejecutado con esfuerzo de razonamiento "xhigh" en el benchmark LIBERO. El conjunto de datos de rollouts está publicado como eddykang06/qwen3.8-27b-pear-libero-rollouts y forma parte del repositorio robot-distillation.

La innovación declarada es la compresión del razonamiento: en lugar de copiar literalmente las cadenas de pensamiento largas del profesor de 27B, el SFT se realiza sobre versiones comprimidas de esas trazas, de modo que el estudiante de 9B aprende a llegar a decisiones de acción con menos tokens intermedios. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases posteriores de RLHF o DPO. Tampoco se detalla si se emplearon técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Razonamiento orientado a robótica de manipulación en entornos LIBERO, incluyendo planificación de acciones a partir de observaciones.
- Generación de trazas de razonamiento comprimidas, entrenadas para reducir la longitud de la cadena de pensamiento respecto al profesor.
- Aprendizaje por destilación de un profesor de 27B (Qwen3.8-27B-PEAR-LIBERO_only) en episodios exitosos.
- Capacidades generales de generación de texto y razonamiento heredadas del modelo base Qwen3.5-9B (no verificadas en esta ficha).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: orientado a planificación de acciones robóticas, sin detalles adicionales.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en destilación de razonamiento robótico: sirve como estudiante de 9B para comparar, frente al profesor de 27B, cuánto rendimiento se conserva al comprimir las trazas de razonamiento en tareas LIBERO.
- Evaluación de políticas de manipulación en simulación: el modelo puede generar secuencias de acciones para tareas de pick-and-place y manipulación de objetos en los entornos LIBERO, permitiendo medir tasas de éxito en el benchmark.
- Reducción de coste de inferencia en pipelines de robótica: al ser un modelo de 9B en lugar de 27B, permite desplegar planificación de acciones con menor VRAM y latencia, adecuado para experimentos con muchos rollouts.
- Estudio de compresión de cadenas de pensamiento: útil para analizar si el razonamiento comprimido mantiene la calidad de decisión del profesor con menos tokens intermedios.
- Base para posteriores ajustes con RL o DPO en robótica: al estar construido sobre Qwen3.5-9B y entrenado en LIBERO, puede servir como punto de partida para fases de refinamiento.
- Reproducción de experimentos del proyecto robot-distillation: permite replicar el pipeline de destilación profesor-estudiante descrito por el autor.
- Generación de datos sintéticos de razonamiento para robótica: sus trazas comprimidas podrían reutilizarse como datos de entrenamiento para modelos más pequeños, aunque esto no está documentado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de tasa de éxito en LIBERO ni comparaciones numéricas con el profesor de 27B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa para un modelo de 9B, en FP16 se requerirían aproximadamente 18 GB de VRAM solo para pesos, y en cuantización de 8 bits alrededor de 9-10 GB, pero el autor no confirma estos valores ni los formatos soportados.
- GPU recomendadas: no disponible. Por tamaño, un modelo de 9B en FP16 encajaría en A100 40GB, H100 y RTX 4090 (24 GB); en cuantización de 8 o 4 bits podría caber en GPUs consumer de 12-16 GB, pero no hay confirmación del autor.
- ¿Cabe en consumer GPU?: probablemente sí en cuantización, pero no disponible de forma confirmada.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; depende de los formatos de pesos que publique el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-PEAR-LIBERO-SFT-Compressed | 9B | no disponible | SFT con razonamiento comprimido sobre rollouts LIBERO | no disponible | Pesos no subidos según la model card |
| Qwen3.8-27B-PEAR-LIBERO_only (profesor) | 27B | no disponible | Modelo profesor para LIBERO, esfuerzo xhigh | no disponible | Referenciado en Hugging Face (mit-han-lab) |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | Modelo generalista base | no disponible | Disponible en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente en la model card que el modelo "no se ha subido todavía", por lo que los pesos pueden no estar disponibles para descarga.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier uso en producción.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- El entrenamiento se limita a episodios exitosos del profesor en LIBERO, lo que puede introducir sesgo hacia las distribuciones y tareas específicas de ese benchmark y limitar la generalización a otros entornos robóticos.
- Riesgo de alucinación en la generación de planes de acción no verificado; no hay métricas publicadas de tasa de éxito.
- La compresión del razonamiento puede degradar la calidad de las decisiones frente al profesor de 27B; no se aportan datos que cuantifiquen esa posible pérdida.
- No hay información sobre sesgos demográficos, de seguridad o de otro tipo.
- Ausencia de benchmarks y de documentación técnica detallada (contexto, cuantizaciones, formato de pesos) dificulta la evaluación para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eddykang06/qwen3.5-9b-pear-libero-sft-compressed
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo profesor: https://huggingface.co/mit-han-lab/Qwen3.8-27B-PEAR-LIBERO_only
- Dataset de rollouts: https://huggingface.co/datasets/eddykang06/qwen3.8-27b-pear-libero-rollouts
- Repositorio del proyecto: https://github.com/ericjkge/robot-distillation
