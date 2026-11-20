# ameraizam31/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario ameraizam31 en Hugging Face como parte de un curso de reinforcement learning, utilizando Sample-Factory 2.0 como framework de entrenamiento. No se trata de un modelo de lenguaje, sino de una política neuronal que juega a un escenario concreto de Doom.

El escenario `health_gathering_supreme` es una tarea clásica de benchmark en ViZDoom: el agente debe navegar por un mapa recogiendo botiquines para mantener la salud mientras evita morir. La dificultad "supreme" implica un ritmo de degradación de salud elevado, lo que exige una política de navegación y recogida eficiente.

El interés de este artefacto es fundamentalmente didáctico y reproducible: sirve como ejemplo de extremo a extremo del flujo de trabajo de Sample-Factory con integración en Hugging Face Hub (descarga, ejecución con `enjoy`, reanudación del entrenamiento). No hay información sobre arquitectura de red, número de parámetros ni datos de entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal entrenada con APPO sobre Sample-Factory 2.0; no se detalla la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,1 GB gestionado por Sample-Factory; presumiblemente checkpoints del framework, sin detalle publicado) |

## Arquitectura y entrenamiento

El agente se entrena con APPO, la implementación de PPO asíncrono de Sample-Factory, sobre el entorno ViZDoom `doom_health_gathering_supreme`. APPO combina actores paralelos que recolectan experiencia con un learner central, lo que permite escalar el entrenamiento en CPU/GPU de forma eficiente. La model card no especifica la arquitectura exacta de la red (capas convolucionales, tamaño del estado recurrente, etc.), por lo que ese dato no está disponible.

No se documentan el número de pasos de entrenamiento, la composición del dataset (en RL no aplica en el sentido habitual), ni si hubo ajuste fino posterior. El resultado declarado por el autor es una recompensa media de 10,72 con desviación de 6,29 en el entorno de evaluación, marcado como no verificado (`verified: false`) en el model-index.

## Capacidades

- Control de agente en el entorno ViZDoom `doom_health_gathering_supreme`: navegación y recogida de botiquines para mantener la salud.
- Aprendizaje por refuerzo con APPO: política entrenada para maximizar recompensa acumulada en el escenario.
- Reanudación del entrenamiento: la model card documenta cómo continuar el entrenamiento con `--restart_behavior=resume`.
- Ejecución de política entrenada mediante el script `enjoy` de Sample-Factory.
- Integración con Hugging Face Hub: descarga y subida de checkpoints mediante `sample_factory.huggingface`.
- No soporta tool calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento: es un agente de RL específico de tarea.

## Casos de uso

- Reproducción de experimentos de un curso de RL: sirve como checkpoint de referencia para comparar curvas de aprendizaje en `health_gathering_supreme` con la misma configuración de Sample-Factory.
- Docencia y demostración de APPO: permite ejecutar una política ya entrenada y observar el comportamiento del agente sin necesidad de entrenar desde cero.
- Punto de partida para fine-tuning: se puede reanudar el entrenamiento con `--restart_behavior=resume` para explorar variaciones de hiperparámetros o recompensas.
- Validación de pipelines de Sample-Factory: útil para comprobar que la instalación, la descarga desde el Hub y el script `enjoy` funcionan correctamente de extremo a extremo.
- Benchmark de referencia interna: la recompensa media declarada (10,72 ± 6,29) puede usarse como línea base para comparar nuevas políticas en el mismo entorno.
- Integración en tutoriales de RL con ViZDoom: ejemplo práctico de cómo empaquetar y distribuir un agente entrenado vía Hugging Face Hub.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 10,72 ± 6,29 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0,1 GB, lo que sugiere un modelo pequeño que probablemente quepa en GPU consumer, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; por el tamaño del checkpoint es plausible, pero no hay dato publicado.
- Opciones de despliegue: Sample-Factory (scripts `enjoy` y `train`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un agente de RL).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ameraizam31/rl_course_vizdoom_health_gathering_supreme | doom_health_gathering_supreme | APPO | 10,72 ± 6,29 | no disponible | Hugging Face |
| Otros checkpoints de Sample-Factory en ViZDoom | no disponible | APPO | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables con datos verificables en la documentación proporcionada.

## Limitaciones y advertencias

- Específico de tarea: la política solo está entrenada para `doom_health_gathering_supreme`; no generaliza a otros entornos ni escenarios.
- Resultado no verificado: la métrica del model-index está marcada como `verified: false`, por lo que la recompensa declarada no ha sido validada de forma independiente.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de reutilizarlo en producción.
- Sin información sobre arquitectura ni hiperparámetros: dificulta la reproducibilidad exacta y la evaluación de sesgos o robustez.
- Alta varianza: la desviación estándar (6,29) es elevada respecto a la media (10,72), lo que indica un comportamiento inestable entre episodios.
- Sin datos de sesgos, alucinación ni limitaciones idiomáticas: no aplican en el sentido de modelos de lenguaje, pero tampoco se documenta el comportamiento del agente en condiciones fuera de distribución.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ameraizam31/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (repositorio): https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
