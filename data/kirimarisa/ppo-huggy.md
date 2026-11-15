# KiriMarisa/ppo-Huggy

## Resumen

`KiriMarisa/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Huggy, un escenario de Unity ML-Agents en el que un perro virtual debe aprender a recoger un palo. El repositorio lo publica el usuario KiriMarisa como artefacto de entrenamiento, y su propósito es servir como checkpoint reproducible para reanudar el entrenamiento o visualizar el comportamiento del agente directamente en el navegador.

No se trata de un modelo de lenguaje: no hay arquitectura transformer, ni pesos en safetensors, ni tokenizador. El artefacto contiene una política neuronal serializada en formato nativo de ML-Agents (`.nn` / `.onnx`), pensada para ser consumida por el runtime de Unity o por el visor web de Hugging Face. El tamaño del repositorio es de aproximadamente 0,2 GB, lo que sugiere que incluye el checkpoint completo junto con los ficheros de TensorBoard del entrenamiento.

Su relevancia es didáctica y de reproducibilidad: encaja en el flujo de los cursos de deep reinforcement learning de Hugging Face y permite a cualquier persona inspeccionar, reanudar o demostrar un agente PPO en un entorno físico simulado sin necesidad de reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de ML-Agents (PPO); arquitectura interna no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (formato nativo ML-Agents) y `.onnx` |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (clipping) que estabiliza las actualizaciones on-policy. La política consume observaciones del entorno Huggy (estado del agente y del palo) y emite acciones continuas o discretas según la configuración del entorno; la arquitectura exacta de la red (capas, unidades, activaciones) no está documentada en la model card.

No se especifica en la información disponible el número de pasos de entrenamiento, la composición de las observaciones, ni si se aplicaron recompensas por conformación (reward shaping), curriculum learning o imitación. El repositorio incluye ficheros de TensorBoard, lo que permite inspeccionar las curvas de recompensa y las métricas de entrenamiento, pero esos datos no están transcritos en la ficha. La reanudación del entrenamiento se realiza con `mlagents-learn <config>.yaml --run-id=<run_id> --resume`.

## Capacidades

- Control de política en el entorno Huggy: el agente aprende a navegar y a interactuar con el palo dentro de la simulación de Unity.
- Ejecución en navegador: el visor de Hugging Face carga el `.nn`/`.onnx` y reproduce el agente sin instalación local.
- Reanudación de entrenamiento: el checkpoint permite continuar el entrenamiento PPO desde el estado guardado.
- Exportación a ONNX: el formato `.onnx` habilita inferencia fuera del runtime de ML-Agents.
- Inspección de métricas: los logs de TensorBoard permiten analizar la evolución de la recompensa durante el entrenamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo thinking, al no ser un modelo de lenguaje.

## Casos de uso

- Docencia de reinforcement learning: usar el checkpoint como punto de partida en el curso de deep RL de Hugging Face para ilustrar el ciclo entrenamiento-evaluación de PPO sin coste de cómputo inicial.
- Demostración interactiva: incrustar el visor web de Hugging Face en una clase o artículo para mostrar el comportamiento aprendido del agente en tiempo real.
- Reproducibilidad de experimentos: reanudar el entrenamiento con `--resume` para comparar hiperparámetros y curvas de recompensa frente a ejecuciones nuevas.
- Base para fine-tuning de política: partir de este checkpoint y ajustar recompensas o curriculum para estudiar cómo cambia la política resultante.
- Pruebas de integración de ML-Agents: validar pipelines de exportación `.nn` → `.onnx` y la compatibilidad con el runtime de Unity en entornos de CI.
- Benchmark de algoritmos: comparar PPO con otros algoritmos de ML-Agents (SAC, PPO con distintas configuraciones) sobre el mismo entorno Huggy y el mismo presupuesto de pasos.
- Material para análisis de estabilidad: inspeccionar los logs de TensorBoard para estudiar la varianza de la recompensa y el efecto del clipping de PPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,2 GB) incluye checkpoint y logs, no indica directamente el peso de la política en memoria.
- GPU recomendadas: no disponible; el entrenamiento PPO en ML-Agents puede ejecutarse en CPU, aunque GPUs como RTX 3090/4090 aceleran el entrenamiento.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño reducido del entorno y del checkpoint, aunque no se documenta el consumo exacto.
- Opciones de despliegue: runtime de Unity ML-Agents, visor web de Hugging Face, inferencia ONNX Runtime.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KiriMarisa/ppo-Huggy | PPO (ML-Agents) | Huggy | `.nn`, `.onnx` | no disponible | Hugging Face |
| unity/ML-Agents oficiales (Huggy) | PPO / SAC | Huggy | `.nn`, `.onnx` | no disponible | Hugging Face (org unity) |
| Otros agentes PPO de la comunidad ML-Agents | PPO | Huggy y otros | `.nn`, `.onnx` | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona sobre prompts ni procesa lenguaje natural.
- Sesgos: no documentados; el comportamiento está condicionado por la función de recompensa del entorno Huggy.
- Riesgo de sobreajuste al entorno: la política está especializada en Huggy y no se espera que generalice a otros escenarios sin reentrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas: no aplica, al no procesar texto.
- Contexto: no aplica; la política opera sobre observaciones del entorno, no sobre secuencias de tokens.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- Los logs de TensorBoard y los hiperparámetros no están documentados en la model card, lo que dificulta la reproducibilidad exacta.
- El checkpoint puede requerir una versión concreta de ML-Agents; incompatibilidades de versión pueden impedir la carga del `.nn`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KiriMarisa/ppo-Huggy
- Repositorio ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto (Huggy): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes Unity en Hugging Face: https://huggingface.co/unity
