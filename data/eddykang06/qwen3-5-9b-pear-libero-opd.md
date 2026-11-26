# eddykang06/qwen3.5-9b-pear-libero-opd

## Resumen

Qwen3.5-9B-PEAR-LIBERO-OPD es un ajuste fino del modelo Qwen3.5-9B de Alibaba, publicado por el usuario eddykang06 en Hugging Face. El modelo está especializado en robótica, concretamente en el benchmark LIBERO de manipulación robótica, y se ha entrenado mediante destilación on-policy (OPD, *on-policy distillation*) con divergencia KL inversa calculada por token. El profesor utilizado es Qwen3.8-27B-PEAR-LIBERO_only del MIT HAN Lab, operado en modo de esfuerzo «xhigh», y el punto de partida del estudiante es un checkpoint previo de SFT.

El modelo forma parte del proyecto robot-distillation, cuyo objetivo es transferir capacidades de planificación robótica de un modelo grande a uno más pequeño y desplegable. La relevancia de esta ficha es limitada por la escasez de información publicada: la model card indica explícitamente «Not uploaded yet», no hay resultados de benchmarks, no se especifican licencia ni idiomas, y el repositorio acumula cero descargas y cero *likes* en el momento de la consulta.

Se trata, por tanto, de un artefacto de investigación en fase temprana, más útil como referencia de una técnica de destilación aplicada a robótica que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-9B); detalles específicos no disponibles |
| Parametros totales | 9 000 millones (aproximado, según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B, un transformer denso de aproximadamente 9 000 millones de parámetros. Sobre esa base se aplica un proceso de destilación on-policy: el estudiante genera sus propias trayectorias y se le alinea con la distribución del profesor mediante divergencia KL inversa calculada por token. El profesor es Qwen3.8-27B-PEAR-LIBERO_only (MIT HAN Lab), un modelo de 27 000 millones de parámetros especializado en LIBERO, ejecutado en modo de esfuerzo «xhigh». El estudiante parte de un checkpoint de SFT previo, de modo que la destilación OPD actúa como segunda fase de ajuste.

El conjunto de datos de entrenamiento son los *rollouts* publicados en eddykang06/qwen3.8-27b-pear-libero-rollouts, generados por el profesor. No se especifican el número de tokens, la composición exacta del dataset, ni si hubo fases adicionales de RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones y planes para tareas de manipulación robótica en el entorno LIBERO.
- Razonamiento multi-paso orientado a secuencias de acciones (el profesor se ejecuta en modo de esfuerzo «xhigh», lo que sugiere cadenas de razonamiento largas).
- Especialización en un benchmark concreto (LIBERO), no en robótica general.
- No hay evidencia publicada de soporte de *tool calling* o *function calling*.
- No hay evidencia publicada de capacidades multilingües ni de visión o audio.
- Capacidades conversacionales generales: no verificadas tras el ajuste.

## Casos de uso

- Investigación en destilación de políticas robóticas: sirve como referencia reproducible de OPD con KL inversa por token aplicada a un modelo de 9B, útil para comparar con destilación offline.
- Evaluación en el benchmark LIBERO: el modelo puede emplearse para medir la brecha entre un estudiante de 9B y un profesor de 27B en tareas de manipulación.
- Prototipado de políticas de bajo coste: al ser un 9B, permite iterar en hardware más modesto que el profesor de 27B, aunque la viabilidad práctica no está documentada.
- Estudio de la fase SFT frente a OPD: al partir de un checkpoint SFT, permite aislar la contribución de la destilación on-policy.
- Generación de *rollouts* sintéticos para investigación: puede usarse como generador de trayectorias en experimentos de imitación, siempre con validación empírica previa.
- Reproducción de experimentos del proyecto robot-distillation: el repositorio asociado facilita replicar el pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información publicada. Como referencia orientativa para un transformer denso de 9B, en FP16 se requerirían aproximadamente 18 GB de VRAM solo para pesos, y en cuantización de 4 bits alrededor de 5-6 GB, pero estos cálculos no están confirmados por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, un 9B en cuantización baja podría caber en GPUs de 8-12 GB, pero no hay validación publicada.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-PEAR-LIBERO-OPD | ~9B | no disponible | LIBERO (destilado) | no disponible | Pesos no subidos |
| Qwen3.8-27B-PEAR-LIBERO_only (profesor) | ~27B | no disponible | LIBERO | no disponible | Publicado por MIT HAN Lab |
| Qwen3.5-9B (base) | ~9B | no disponible | Propósito general | no disponible | Publicado por Qwen |

La comparación cuantitativa de rendimiento no está disponible porque el autor no ha publicado métricas.

## Limitaciones y advertencias

- Los pesos no están subidos al repositorio («Not uploaded yet»), por lo que el modelo no es descargable ni ejecutable en el momento de la consulta.
- Ausencia total de resultados de benchmarks: no hay evidencia de que el estudiante iguale o se acerque al profesor.
- Especialización estrecha: entrenado exclusivamente sobre rollouts de LIBERO, con riesgo alto de sobreajuste al benchmark y nula generalización demostrada a otros entornos.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido; además, la licencia del modelo base Qwen3.5-9B condiciona la del derivado.
- Idiomas no declarados: se desconoce si conserva las capacidades multilingües del base tras el ajuste.
- Riesgo de alucinación en la generación de secuencias de acciones no evaluado.
- Cero descargas y cero *likes*: sin validación por parte de la comunidad.
- Sesgos: no documentados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eddykang06/qwen3.5-9b-pear-libero-opd
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Profesor (MIT HAN Lab): https://huggingface.co/mit-han-lab/Qwen3.8-27B-PEAR-LIBERO_only
- Dataset de rollouts: https://huggingface.co/datasets/eddykang06/qwen3.8-27b-pear-libero-rollouts
- Repositorio del proyecto: https://github.com/ericjkge/robot-distillation
