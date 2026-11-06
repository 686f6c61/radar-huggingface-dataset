# connect-ai-lab-aimo/connectailab-rl-juju-v1-link01-walk-ppo

## Resumen

connectailab-rl-juju-v1-link01-walk-ppo es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) mediante la librería stable-baselines3 para controlar la locomoción de un robot bípedo denominado LINK-01 en el entorno de simulación `Link01Walk-v0`, construido sobre MuJoCo a través del paquete `link01-gym`. El modelo lo publica la organización connect-ai-lab-aimo en el contexto de un curso de formación en IA (AI CITY BUILDERS, lección 7 de refuerzo) del CONNECT AI LAB. No es un modelo de lenguaje: es una política neuronal que mapea observaciones de 51 dimensiones a 14 acciones articulares continuas.

El interés técnico del artefacto es doble. Por un lado, documenta un pipeline completo y reproducible de entrenamiento RL (política PPO, normalización de observaciones con VecNormalize y exportación del actor a JSON) para una tarea de locomoción bípeda. Por otro, los resultados declarados son negativos: el agente retrocede ligeramente en lugar de avanzar, con una velocidad media de -0,0022 m/s frente a una consigna de 0,18 m/s, y cae 0,6 veces por minuto. Se trata, por tanto, de un checkpoint de una fase temprana de entrenamiento (200 000 pasos, unos 9,56 minutos de cómputo) más que de una política lista para producción.

La relevancia ahora es la de un ejemplo didáctico de RL aplicado a robótica: un caso base con el que comparar recetas posteriores, útil para quienes construyen entornos MuJoCo propios o experimentan con PPO en tareas de locomoción. No hay información sobre licencia, idiomas ni formato de pesos más allá de los ficheros citados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal PPO (stable-baselines3); arquitectura de red no detallada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente RL; observación de 51 dimensiones) |
| Tipos de cuantizacion | no disponible (no se documenta cuantización) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (checkpoint SB3), `vecnormalize.pkl` (estadísticas de normalización), `actor.json` (exportación del actor) |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (clip 0,2) y tasa de aprendizaje 0,0003. La observación tiene 51 dimensiones y la acción 14 dimensiones continuas, correspondientes a 14 articulaciones con una postura base de ±0,18 rad. El entorno es `Link01Walk-v0`, implementado en `link01-gym` sobre el motor físico MuJoCo, y la tarea consiste en caminar siguiendo una consigna de velocidad de 0,18 m/s. La evaluación se realiza sobre 5 episodios de 20 segundos.

El entrenamiento declarado es corto: 200 000 pasos y 9,56 minutos de cómputo total. No se documenta composición de datos (no aplica, es RL por interacción con simulador), ni uso de RLHF/DPO, ni innovaciones como decodificación especulativa o atención lineal. El artefacto incluye las estadísticas de normalización de observaciones (`vecnormalize.pkl`), imprescindibles para reproducir la inferencia con las mismas escalas que en entrenamiento, y una exportación del actor en JSON (`actor.json`) que facilita el despliegue fuera de Python.

## Capacidades

- Control de locomoción bípeda en simulación: genera comandos articulares continuos de 14 dimensiones a partir de observaciones de 51 dimensiones.
- Seguimiento de consigna de velocidad: el entorno define un objetivo de 0,18 m/s, aunque el rendimiento declarado no lo alcanza.
- Política entrenada desde cero con PPO, sin inicialización desde demostraciones.
- Exportación del actor a JSON para integración en otros runtimes.
- Compatible con el ecosistema stable-baselines3 para continuar el entrenamiento o fine-tuning.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, multilingüismo ni modalidades de visión o audio: es exclusivamente una política de control motor.

## Casos de uso

- Reproducción didáctica de un pipeline RL completo: sirve como punto de partida en cursos o talleres para mostrar el ciclo entorno MuJoCo, PPO, VecNormalize y exportación del actor, con métricas de evaluación explícitas.
- Línea base para comparativas de recetas: al ser un checkpoint de 200 000 pasos con resultados negativos, permite medir la mejora de recetas posteriores (más pasos, recompensas conformadas, curriculum) sobre el mismo entorno `Link01Walk-v0`.
- Depuración de entornos de simulación: un agente que retrocede y cae 0,6 veces por minuto es útil para verificar que las recompensas, los límites articulares y la normalización de observaciones están bien configurados antes de escalar el entrenamiento.
- Fine-tuning sobre una política existente: cargar `model.zip` y `vecnormalize.pkl` en stable-baselines3 para continuar el entrenamiento con más pasos o con ajustes de hiperparámetros.
- Integración en pipelines de simulación a robot real (sim-to-real) como fase preliminar: el `actor.json` permite probar la política en un runtime ligero antes de abordar transferencia a hardware.
- Docencia de evaluación rigurosa: las métricas declaradas (distancia por episodio, velocidad media, caídas por minuto) ejemplifican cómo reportar resultados de RL de forma honesta, incluidos los negativos.
- Benchmarking de infraestructura de entrenamiento: los 9,56 minutos para 200 000 pasos sirven para calibrar el throughput de una máquina antes de lanzar entrenamientos más largos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Valor | Entorno / protocolo |
|---|---|---|
| Distancia por episodio de 20 s | -0,044 m | Link01Walk-v0, 5 episodios × 20 s |
| Velocidad media de avance | -0,0022 m/s | Link01Walk-v0, consigna 0,18 m/s |
| Caídas por minuto | 0,6 | Link01Walk-v0 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del artefacto (repo de 0,0 GB) y la naturaleza de la política (observación de 51 dimensiones, acción de 14), la inferencia es probablemente viable en CPU.
- GPU recomendadas: no se especifican; para entrenamiento PPO con MuJoCo, una GPU de gama media o incluso CPU puede ser suficiente, pero no hay datos publicados.
- ¿Cabe en GPU consumer? No hay información que lo descarte; el cuello de botella en este tipo de tareas suele ser la simulación física en CPU, no la red neuronal.
- Opciones de despliegue: stable-baselines3 (carga de `model.zip` con `vecnormalize.pkl`), runtime propio a partir de `actor.json`, y el simulador `link01-gym` sobre MuJoCo para evaluación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables publicadas para el entorno `Link01Walk-v0` ni alternativas de la misma organización con las que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Rendimiento insuficiente para uso práctico: el agente retrocede (-0,0022 m/s) frente a la consigna de 0,18 m/s y cae 0,6 veces por minuto; no es una política de locomoción funcional.
- Entrenamiento muy corto (200 000 pasos, 9,56 minutos): el checkpoint corresponde a una fase temprana y probablemente no convergida.
- Resultados no verificados: las métricas de la model card están marcadas como `verified: false`.
- Licencia no disponible: no se puede asumir permiso para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Dependencia del entorno: la política está acoplada a `Link01Walk-v0` y a las estadísticas de `vecnormalize.pkl`; usarla sin esas estadísticas altera las observaciones y degrada el comportamiento.
- Solo simulación: no hay evidencia de transferencia a un robot físico (sim-to-real); las diferencias de dinámica, fricción y latencia de actuadores pueden invalidar la política.
- Sin soporte de lenguaje, visión ni herramientas: no debe evaluarse como un modelo generativo.
- Riesgo de sobreajuste al simulador: con tan pocos pasos, la política puede explotar particularidades del motor físico en lugar de aprender una marcha generalizable.

## Enlaces

- Hugging Face: https://huggingface.co/connect-ai-lab-aimo/connectailab-rl-juju-v1-link01-walk-ppo
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
