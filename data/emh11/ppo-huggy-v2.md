# emh11/ppo-Huggy-v2

## Resumen

`emh11/ppo-Huggy-v2` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Huggy de Unity ML-Agents. Lo publica el usuario `emh11` en Hugging Face y no se trata de un modelo de lenguaje, sino de una política neuronal entrenada para controlar un agente dentro de una simulación física de Unity. El entorno Huggy es un ejemplo clásico de ML-Agents en el que un perro virtual debe aprender a perseguir y atrapar un palo (stick) lanzado por el jugador.

El modelo se distribuye en formato nativo de ML-Agents (`.nn`) y exportado a ONNX (`.onnx`), lo que permite cargarlo tanto en el editor de Unity como ejecutarlo en el navegador mediante el visor de agentes de Hugging Face. El repositorio ocupa aproximadamente 0,2 GB, coherente con una red neuronal pequeña típica de los entornos de ML-Agents, muy alejada del tamaño de los transformers de lenguaje.

Su relevancia es fundamentalmente didáctica y de investigación en RL: sirve como referencia de un entrenamiento PPO completo sobre un entorno continuo con observaciones vectoriales y acciones continuas, y como ejemplo reproducible del flujo de trabajo de ML-Agents (entrenamiento, exportación y publicación en el Hub). No hay información pública sobre arquitectura exacta, hiperparámetros ni curva de recompensa en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para PPO (ML-Agents); detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observaciones por paso del entorno) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (ML-Agents) y `.onnx` (ONNX) |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (clipping) para limitar la magnitud de las actualizaciones y estabilizar el aprendizaje. La política consume las observaciones del entorno Huggy (estado del agente y del palo) y produce acciones continuas de movimiento. La red se implementa con la librería ML-Agents de Unity, que gestiona el bucle de entrenamiento, la recolección de experiencias y la optimización.

No se dispone de información sobre el número de pasos de entrenamiento, la composición de recompensas, los hiperparámetros (learning rate, batch size, epochs, clip range) ni si se aplicaron técnicas adicionales como recompensas intrínsecas o currículum. El sufijo `v2` sugiere una segunda iteración del entrenamiento, pero no hay documentación que lo confirme. Tampoco se detalla la topología de la red (número de capas ocultas y unidades), dato que en ML-Agents suele fijarse en el archivo de configuración YAML, no incluido en la model card.

## Capacidades

- Control de un agente físico en el entorno Huggy de Unity: perseguir y atrapar el palo lanzado.
- Política de acciones continuas entrenada mediante PPO.
- Exportación a ONNX para inferencia fuera del editor de Unity.
- Ejecución interactiva en el navegador mediante el visor de agentes de Hugging Face.
- Reanudación del entrenamiento con `mlagents-learn --resume` usando el checkpoint publicado.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo resuelto de un pipeline PPO completo en ML-Agents, desde el entrenamiento hasta la publicación en el Hub.
- Reproducción de experimentos: reanudar el entrenamiento con `mlagents-learn` y comparar curvas de recompensa frente a variantes propias (por ejemplo, cambios en hiperparámetros o en el shaping de recompensas).
- Evaluación de entornos de ML-Agents: emplear el agente como línea base para medir la dificultad del entorno Huggy antes de entrenar políticas propias.
- Demostraciones interactivas: incrustar el archivo `.onnx` en el visor web de Hugging Face para mostrar el comportamiento del agente en charlas o materiales didácticos sin instalar Unity.
- Integración en Unity para prototipado de gameplay: cargar el `.nn` en un proyecto Unity con el paquete ML-Agents para probar comportamientos de NPCs básicos y validar el flujo de importación de políticas.
- Investigación en transferencia y robustez: evaluar cómo se comporta la política ante modificaciones del entorno (posición inicial del palo, fricción, ruido en observaciones) para estudiar generalización en RL.
- Benchmarking de infraestructura de inferencia: usar el `.onnx` como carga ligera para validar pipelines de inferencia ONNX Runtime en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,2 GB) y la naturaleza del entorno, la política es de tamaño reducido y cabe holgadamente en cualquier GPU consumer, e incluso puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte para Unity o ONNX Runtime es suficiente (por ejemplo, GTX 1060 en adelante).
- Cabe en GPU consumer: sí, con margen amplio; también en CPU para inferencia del `.onnx`.
- Opciones de despliegue: Unity ML-Agents (runtime nativo con `.nn`), ONNX Runtime para el `.onnx`, y el visor de agentes de Hugging Face para ejecución en navegador.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del motor de inferencia, pero al tratarse de una red pequeña la latencia por paso será del orden de milisegundos en hardware moderno.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emh11/ppo-Huggy-v2 | PPO (ML-Agents) | Huggy | `.nn`, `.onnx` | no disponible | Hugging Face |
| Agentes oficiales de Unity en `huggingface.co/unity` | PPO y otros algoritmos | Varios entornos ML-Agents | `.nn`, `.onnx` | según cada modelo | Hugging Face |
| Políticas PPO de Stable-Baselines3 | PPO | Entornos Gymnasium | `.zip` (PyTorch) | MIT (librería) | GitHub / PyPI |

La comparación con modelos de lenguaje no aplica: se trata de un agente de RL específico de un entorno, no de un modelo generativo. Los agentes oficiales de Unity y las políticas de Stable-Baselines3 son las alternativas naturales, aunque no hay datos públicos de rendimiento de este checkpoint concreto para comparar curvas de recompensa.

## Limitaciones y advertencias

- Específico del entorno Huggy: la política no es reutilizable en otras tareas sin reentrenamiento.
- Sin información sobre licencia: no se puede garantizar el uso comercial; conviene contactar con el autor antes de integrarlo en productos.
- Sin documentación de hiperparámetros ni de la curva de entrenamiento: difícil evaluar la calidad del agente o reproducir el resultado.
- Riesgo de sobreajuste al entorno de entrenamiento: el comportamiento puede degradarse ante cambios en la física, en la posición inicial o en la aleatoriedad del lanzamiento del palo.
- Sin datos de sesgos, alucinación o capacidades multilingües: no aplican al no ser un modelo de lenguaje, pero tampoco hay evaluación de robustez publicada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- La model card no incluye el archivo de configuración YAML ni instrucciones detalladas de reproducción más allá de los enlaces a los tutoriales de ML-Agents.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emh11/ppo-Huggy-v2
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Unity en Hugging Face: https://huggingface.co/unity
