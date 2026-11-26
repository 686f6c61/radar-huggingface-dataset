# eddykang06/qwen3.5-9b-pear-libero-opd-from-base

## Resumen

Qwen3.5-9B-PEAR-LIBERO-OPD es un ajuste fino del modelo de lenguaje Qwen/Qwen3.5-9B orientado a robótica, concretamente a la manipulación de brazos robóticos en el conjunto de tareas LIBERO. Lo desarrolla el usuario eddykang06 y se enmarca dentro del proyecto robot-distillation, que explora la transferencia de capacidades de modelos docentes grandes a modelos estudiantes más pequeños mediante destilación.

La técnica empleada es destilación on-policy (OPD) con divergencia KL inversa calculada token a token. El modelo estudiante parte del checkpoint base de Qwen3.5-9B y aprende a imitar las distribuciones de salida de un docente de 27B parámetros, Qwen3.8-27B-PEAR-LIBERO_only, ejecutado en modo de esfuerzo "xhigh". Los datos de entrenamiento son los rollouts publicados por el propio autor en el dataset qwen3.8-27b-pear-libero-rollouts.

El modelo es relevante como ejemplo de aplicación de técnicas de destilación a dominios de robótica con modelos de lenguaje, pero conviene señalar que el repositorio indica explícitamente que los pesos aún no se han subido ("Not uploaded yet"), no registra descargas ni likes, y no incluye información sobre licencia, idiomas ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-9B); detalles no disponibles |
| Parametros totales | 9 000 millones (aproximado, según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (pesos no subidos al repositorio) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-9B, un transformer decoder-only del que la información proporcionada no detalla capas, dimensiones ocultas ni mecanismos de atención. El ajuste consiste en destilación on-policy: el estudiante genera sus propias trayectorias y se alinea con la distribución del docente mediante divergencia KL inversa calculada por token, en lugar de imitar directamente las secuencias del docente (destilación offline clásica).

El docente es Qwen3.8-27B-PEAR-LIBERO_only, un modelo de 27B parámetros especializado en LIBERO, ejecutado con esfuerzo "xhigh". Los datos de entrenamiento proceden del dataset de rollouts generado por ese docente. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases adicionales de RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Manipulación robótica en tareas del benchmark LIBERO: el ajuste está orientado a la generación de acciones o políticas para brazos robóticos en entornos simulados de ese conjunto de tareas.
- Razonamiento y generación de texto heredados del modelo base Qwen3.5-9B, aunque no se documenta hasta qué punto el ajuste los preserva.
- Destilación de comportamiento de un docente de 27B: el estudiante busca reproducir la distribución de salidas del modelo PEAR-LIBERO de mayor tamaño.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en destilación on-policy: sirve como referencia reproducible para estudiar cómo un estudiante de 9B aproxima a un docente de 27B en un dominio acotado, usando KL inversa por token y rollouts propios.
- Evaluación de políticas robóticas en LIBERO: puede emplearse para medir la tasa de éxito en las tareas de manipulación del benchmark y comparar con el docente de 27B.
- Generación de trayectorias sintéticas: el modelo puede producir rollouts adicionales que alimenten pipelines de entrenamiento o aumento de datos en robótica simulada.
- Prototipado de bajo coste en robótica: al ser un modelo de 9B, permite iterar en entornos con menos recursos que los necesarios para el docente de 27B.
- Estudio de la brecha docente-estudiante: útil para cuantificar cuánta capacidad de un modelo grande se transfiere a uno pequeño en tareas de control.
- Reproducción de experimentos del proyecto robot-distillation: integrable en flujos de investigación que comparen variantes de destilación (offline frente a on-policy, distintos docentes y presupuestos de cómputo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa para un modelo denso de ~9B, en FP16 se requerirían del orden de 18 GB de VRAM solo para pesos, y en cuantización de 8 bits alrededor de 9-10 GB, pero estos cálculos no están confirmados por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; dependería del formato de pesos final, que aún no se ha publicado.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-PEAR-LIBERO-OPD (este) | ~9B | No disponible | Robótica (LIBERO) | No disponible | Pesos no subidos |
| Qwen3.8-27B-PEAR-LIBERO_only (docente) | 27B | No disponible | Robótica (LIBERO) | No disponible | Publicado en mit-han-lab |
| Qwen/Qwen3.5-9B (base) | ~9B | No disponible | Propósito general | No disponible | Publicado en Qwen |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa entre estas variantes.

## Limitaciones y advertencias

- Los pesos no están subidos al repositorio según la propia model card ("Not uploaded yet"), por lo que el modelo no es utilizable en la práctica en el momento de redactar esta ficha.
- No se especifica la licencia, lo que impide evaluar si el uso comercial está permitido; además, la licencia del modelo base Qwen3.5-9B condiciona cualquier redistribución.
- El ajuste está especializado en LIBERO; es probable que su rendimiento fuera de ese dominio se degrade, aunque no hay datos que lo cuantifiquen.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de seguridad.
- No se documentan idiomas soportados ni longitud de contexto, lo que limita el diseño de aplicaciones en producción.
- El modelo tiene cero descargas y cero likes, y fue creado y actualizado en un intervalo de un minuto, lo que sugiere un estado experimental y sin validación externa.
- Al ser un modelo destilado de un docente especializado, puede heredar errores sistemáticos del docente en las tareas de manipulación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eddykang06/qwen3.5-9b-pear-libero-opd-from-base
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Docente: https://huggingface.co/mit-han-lab/Qwen3.8-27B-PEAR-LIBERO_only
- Dataset de rollouts: https://huggingface.co/datasets/eddykang06/qwen3.8-27b-pear-libero-rollouts
- Proyecto robot-distillation: https://github.com/ericjkge/robot-distillation
