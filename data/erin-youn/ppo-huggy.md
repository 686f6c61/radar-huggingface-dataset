# Erin-Youn/ppo-Huggy

## Resumen

`Erin-Youn/ppo-Huggy` no es un modelo de lenguaje, sino una política de aprendizaje por refuerzo entrenada con el algoritmo PPO (Proximal Policy Optimization) dentro del entorno Huggy del ecosistema Unity ML-Agents. El agente controla a Huggy, un perro virtual, con el objetivo de aprender a perseguir y recoger un palo lanzado por el usuario. El repositorio lo publica la cuenta Erin-Youn y contiene los artefactos de entrenamiento típicos de ML-Agents: pesos en formato `.nn`/`.onnx`, ficheros de TensorBoard y configuración de run.

Se trata de un artefacto de demostración y aprendizaje, no de un sistema desplegable como modelo generativo. Su valor está en servir como ejemplo reproducible de un pipeline completo de RL: entrenamiento con `mlagents-learn`, reanudación de runs, exportación a ONNX y visualización del agente jugando directamente en el navegador a través de la integración de ML-Agents con Hugging Face. Por tanto, la ficha se centra en especificaciones de RL (algoritmo, entorno, formato de pesos, requisitos de ejecución con Unity) y no en parámetros de un transformer.

El tamaño del repositorio es de 0,2 GB, lo que es coherente con un checkpoint de ML-Agents que incluye pesos, logs de TensorBoard y metadatos. No se dispone de información sobre licencia ni idiomas, y las descargas e interacciones registradas son cero en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política/valor entrenada con PPO dentro de Unity ML-Agents (no disponible el detalle de capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entorno Huggy no define una ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (artefacto RL en `.nn`/`.onnx`, no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (formato nativo de ML-Agents) y `.onnx` (exportación para inferencia/visualización) |

## Arquitectura y entrenamiento

El agente se entrena con PPO sobre el entorno Huggy de Unity ML-Agents. PPO es un algoritmo on-policy de gradiente de política con recorte de la ratio de probabilidad, que combina una red de política (acción) y una red de valor (estimación de retorno) compartiendo o no tronco según la configuración de `mlagents-learn`. El entorno Huggy es un escenario 3D de Unity donde el agente recibe observaciones del estado del perro y del palo y emite acciones continuas o discretas para moverse hacia el objetivo. El repo incluye ficheros de TensorBoard, lo que permite inspeccionar curvas de recompensa, entropía y pérdidas durante el entrenamiento.

No se dispone de información sobre número de pasos de entrenamiento, hiperparámetros concretos (learning rate, clip range, batch size), composición del dataset (en RL no hay dataset supervisado, sino interacción con el entorno) ni si hubo curriculum learning o domain randomization. La model card documenta únicamente el flujo de uso: reanudar con `mlagents-learn <config.yaml> --run-id=<run_id> --resume` y visualizar el agente en el navegador mediante la integración de ML-Agents con Hugging Face.

## Capacidades

- Control de agente en entorno Unity Huggy: perseguir y recoger el palo lanzado.
- Aprendizaje por refuerzo con PPO, reanudable desde checkpoint.
- Exportación de política a ONNX para inferencia fuera de Unity o visualización web.
- Registro de entrenamiento en TensorBoard (curvas de recompensa y métricas de optimización).
- Visualización interactiva del agente en el navegador vía la página de ML-Agents de Hugging Face.
- No soporta tool calling, function calling, agentes multi-paso textuales, multilingüismo, visión general, audio ni modo thinking; sus capacidades están acotadas al entorno para el que fue entrenado.

## Casos de uso

- Docencia de RL: usar el checkpoint como ejemplo resuelto de PPO en ML-Agents para explicar observaciones, acciones, recompensas y curvas de TensorBoard en un curso introductorio.
- Reproducción de experimentos: reanudar el entrenamiento con `--resume` para comparar hiperparámetros y medir el efecto en la recompensa acumulada del entorno Huggy.
- Demostración interactiva: cargar el `.onnx` en la página de ML-Agents de Hugging Face para mostrar al agente jugando en el navegador sin instalar Unity.
- Base para transferencia a otros entornos ML-Agents: reutilizar la configuración de PPO y el pipeline de exportación ONNX como plantilla para entrenar agentes en escenarios similares (persecución, recogida de objetos).
- Integración en pipelines de CI: automatizar el entrenamiento y la exportación a ONNX con `mlagents-learn` para verificar que el agente converge antes de publicar un checkpoint.
- Evaluación comparativa de algoritmos: usar el mismo entorno Huggy para contrastar PPO con otros algoritmos de ML-Agents (SAC, PPO con distintas redes) y comparar curvas de recompensa.
- Ejemplo de publicación en Hugging Face: servir de referencia para subir artefactos ML-Agents al Hub con la estructura de model card y tags adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye recompensa media, tasa de éxito ni comparación con otros agentes en Huggy; solo referencias a los logs de TensorBoard incluidos en el repo, que no se han podido consultar.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño de la política es pequeño (repo de 0,2 GB, que incluye pesos, logs y metadatos), por lo que es plausible ejecutarla en GPU consumer, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. Para entrenamiento con ML-Agents se suele usar GPU consumer o cloud (RTX 4090, A100, H100) según el número de entornos paralelos, pero el repo no especifica requisitos.
- GPU consumer: no disponible confirmación explícita; por el tamaño del artefacto, es esperable que quepa en GPUs de gama media, pero no se documenta.
- Opciones de despliegue: Unity ML-Agents (`mlagents-learn`), exportación ONNX para inferencia, visualización web en la página de ML-Agents de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Erin-Youn/ppo-Huggy | PPO (ML-Agents) | Huggy | `.nn`, `.onnx` | no disponible | Hugging Face |
| unity/ml-agents Huggy examples | PPO (ML-Agents) | Huggy | `.nn`, `.onnx` | según ML-Agents | Repos oficiales de Unity |
| Otros agentes PPO en ML-Agents | PPO (ML-Agents) | diversos | `.nn`, `.onnx` | variable | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas; la comparación se limita a tipo de algoritmo, entorno y formato.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no procesa lenguaje natural.
- Capacidades acotadas al entorno Huggy; no generaliza a otras tareas sin reentrenamiento o transferencia.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de reutilizarlo en producción.
- Sin datos de benchmarks: no hay evidencia publicada de convergencia o tasa de éxito del agente.
- Repo con 0 descargas y 0 likes: artefacto de demostración, sin validación comunitaria.
- Riesgo de sobreajuste al entorno de entrenamiento y de sensibilidad a cambios en la configuración de ML-Agents o en la versión de Unity.
- Los logs de TensorBoard incluidos pueden contener información del run que no debe interpretarse como resultados finales sin análisis.
- Idiomas no disponibles: no aplica, pero implica que no sirve para tareas multilingües.

## Enlaces

- Hugging Face: https://huggingface.co/Erin-Youn/ppo-Huggy
- Documentación ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organización Unity en Hugging Face: https://huggingface.co/unity
