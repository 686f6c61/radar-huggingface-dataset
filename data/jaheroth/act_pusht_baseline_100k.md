# jaheroth/act_pusht_baseline_100k

## Resumen

El modelo `jaheroth/act_pusht_baseline_100k` es un checkpoint de robótica basado en la arquitectura ACT (Action Chunking with Transformers), entrenado con la librería LeRobot sobre el entorno de simulación PushT. Lo desarrolla Jacob H. Rothschild (JaHeRoth) como parte de un bloque de entrenamiento de seis semanas en aprendizaje robótico, y se publica como punto de partida para experimentos de ajuste de hiperparámetros. El propio autor indica que con la configuración de inferencia por defecto obtiene aproximadamente un 0 % de éxito, por lo que su valor principal es servir de referencia inicial para estudiar cómo mejorar el rendimiento mediante ajustes.

El modelo tiene 51 660 436 parámetros, un tamaño de repositorio de 0,2 GB y se distribuye en formato safetensors bajo licencia Apache-2.0. No se especifica la longitud de contexto ni los idiomas soportados, ya que se trata de un modelo de control robótico, no de lenguaje. Su relevancia radica en que documenta un caso real de entrenamiento de políticas de imitación con ACT, un enfoque popular en robótica manipulativa, y permite reproducir y comparar resultados en el benchmark PushT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51 660 436 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers diseñada para aprendizaje por imitación en robótica. El modelo procesa observaciones (imágenes y estado del robot) y genera una secuencia de acciones futuras (chunking) que luego se ejecutan de forma intermitente. En este caso, el checkpoint se entrena con la configuración estándar de LeRobot sobre el entorno PushT, que consiste en empujar una pieza en forma de T hasta una posición objetivo. El nombre del modelo indica que se usaron 100 000 episodios de entrenamiento (baseline_100k).

No se proporcionan detalles sobre el dataset exacto, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. El autor menciona que es la configuración "stock" de LeRobot, es decir, sin ajustes personalizados, y que se evaluó con `n_action_steps=16`. No hay información sobre innovaciones técnicas adicionales más allá de la propia arquitectura ACT.

## Capacidades

- Control robótico por imitación: el modelo genera secuencias de acciones para el entorno PushT, aprendidas a partir de demostraciones.
- Generación de acciones en bloques (action chunking): produce múltiples pasos de acción por inferencia, lo que reduce la frecuencia de decisiones.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación e inferencia.
- Reproducibilidad: al ser un baseline con configuración estándar, permite comparar variaciones de hiperparámetros.
- No soporta tool calling, agentes, razonamiento simbólico ni procesamiento de lenguaje natural, al ser un modelo puramente robótico.

## Casos de uso

- Punto de partida para ajuste de hiperparámetros: investigadores pueden partir de este checkpoint y modificar parámetros como `n_action_steps`, tasa de aprendizaje o arquitectura para estudiar su impacto en el éxito de la tarea PushT.
- Evaluación de configuraciones de inferencia: sirve para probar distintos esquemas de ejecución (por ejemplo, frecuencia de re-planificación) y medir cómo afectan al rendimiento.
- Benchmark de referencia en robótica: permite comparar el rendimiento de otras políticas (por ejemplo, Diffusion Policy o VLA) contra un baseline ACT sin optimizar.
- Educación y experimentación: útil en cursos o tutoriales de aprendizaje por imitación, ya que es pequeño (51 M de parámetros) y fácil de ejecutar en hardware modesto.
- Estudio de degradación de rendimiento: al tener un éxito cercano a cero, es un caso interesante para analizar por qué falla una configuración por defecto y qué componentes son críticos.
- Reproducción de resultados: el autor publica el repositorio de entrenamiento, lo que permite replicar el experimento completo y verificar la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la información disponible. La model card indica que, evaluado en gym-pusht con `n_action_steps=16`, el modelo obtiene aproximadamente un 0 % de éxito con la configuración de inferencia por defecto. También menciona que `avg_sum_imputed_reward` imputa 0,95 por paso hasta el horizonte 300 tras el éxito, pero no se ofrecen cifras concretas de recompensa ni comparaciones con otros modelos. Por tanto, no se dispone de una tabla de benchmarks verificable.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,6 M de parámetros, la inferencia requiere menos de 1 GB de VRAM en precisión FP32, y menos aún en FP16 o cuantización (aunque no se publican cuantizaciones).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU para pruebas lentas.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación e inferencia; también puede integrarse con frameworks de robótica como gym-pusht. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dado el tamaño, la inferencia es rápida en GPU moderna, pero depende del entorno de simulación y del número de pasos de acción.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para PushT) dentro de los datos proporcionados. Existen otros checkpoints de ACT en LeRobot, como `jaheroth/act_pusht_baseline` o `jaheroth/act_pusht_kl1`, pero no se ofrecen métricas comparativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Rendimiento muy bajo: el modelo tiene un éxito cercano al 0 % con la configuración por defecto, por lo que no es apto para uso en producción ni para tareas reales de robótica.
- Sesgos y alucinaciones: al ser un modelo de control, no genera texto, pero puede producir acciones erróneas o inestables en el entorno simulado.
- Limitaciones de contexto: no se especifica la longitud de contexto; en ACT, el contexto se refiere al historial de observaciones, pero no se documenta.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo es un baseline de investigación y no se garantiza su funcionamiento.
- Advertencia para producción: cualquier despliegue real requeriría un ajuste significativo de hiperparámetros y validación exhaustiva en el entorno objetivo.
- Dependencia del entorno: el modelo está entrenado específicamente para PushT; su transferencia a otros entornos robóticos no está probada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_baseline_100k
- Repositorio de entrenamiento (GitHub): https://github.com/JaHeRoth/robot-learning
- Perfil del autor en Hugging Face: https://huggingface.co/jaheroth
- Perfil del autor en GitHub: https://github.com/JaHeRoth
