# Garaii/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente entrenado con el algoritmo POCA (Policy Optimization with Clipped Advantage, la implementación de PPO de Unity ML-Agents) para el entorno SoccerTwos del Unity ML-Agents Toolkit. Lo publica el usuario Garaii en HuggingFace con el repositorio `Garaii/poca-SoccerTwos`. No se trata de un modelo de lenguaje: es una política neuronal entrenada por refuerzo profundo que controla jugadores de un equipo de fútbol 2 contra 2 en un entorno de simulación 3D de Unity.

El modelo resuelve el problema de aprendizaje de comportamiento cooperativo multiagente en un entorno físico simulado: dos agentes por equipo deben coordinarse para marcar goles y defender. Es relevante como ejemplo reproducible de entrenamiento con ML-Agents y como artefacto exportado a ONNX que puede cargarse directamente en el visor de agentes de HuggingFace o integrarse en un runtime de Unity.

La información disponible es escasa: no se especifican parámetros, arquitectura de red, hiperparámetros de entrenamiento ni resultados de evaluación. El repositorio ocupa 0,2 GB y contiene los artefactos habituales de ML-Agents (checkpoint `.onnx` y logs de TensorBoard). El pipeline declarado es `reinforcement-learning` y la librería `ml-agents`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para RL (arquitectura exacta no disponible; ML-Agents usa por defecto MLP con capas ocultas configurables) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la observación es el vector de estado del entorno SoccerTwos) |
| Tipos de cuantización | no disponible (artefacto exportado a ONNX; soporta las optimizaciones estándar de ONNX Runtime) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`.onnx`), checkpoint de ML-Agents; logs de TensorBoard |
| Algoritmo | POCA (PPO con ventaja recortada) sobre ML-Agents |
| Entorno | SoccerTwos (Unity ML-Agents) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El agente se entrena con el algoritmo POCA incluido en Unity ML-Agents, una variante de PPO adaptada al toolkit. La política es una red neuronal que recibe como entrada la observación vectorial del entorno SoccerTwos (posiciones, velocidades y estado de balón y jugadores) y emite acciones continuas de movimiento y rotación. ML-Agents combina en la práctica una red de política y una red de valor, habitualmente con capas totalmente conectadas y activación ELU, aunque la configuración exacta de capas, unidades y tasas de aprendizaje de esta ejecución no está documentada en la model card.

No se dispone de información sobre el número de pasos de entrenamiento, la composición del currículo, el uso de recompensas intrínsecas, la configuración de self-play ni el número de entornos paralelos. El repositorio incluye logs de TensorBoard (etiqueta `tensorboard`), lo que permite inspeccionar curvas de recompensa y pérdidas si se descargan los artefactos, pero los valores no se han publicado en la ficha. Tampoco se documenta si se aplicó imitación, recompensas por curiosidad o ajuste fino posterior.

## Capacidades

- Control de agentes en el entorno SoccerTwos de Unity ML-Agents: movimiento, orientación y acciones de juego coordinadas con un compañero de equipo.
- Comportamiento multiagente cooperativo aprendido por refuerzo (dos agentes por equipo).
- Exportación a ONNX para inferencia en el visor de HuggingFace y en runtimes compatibles con ONNX Runtime.
- Reanudación del entrenamiento mediante `mlagents-learn` con el flag `--resume`.
- Inspección de métricas de entrenamiento a través de los logs de TensorBoard incluidos.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, visión, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de RL multiagente: cargar el checkpoint y reanudar el entrenamiento con `mlagents-learn <config>.yaml --run-id=<id> --resume` para comparar curvas con otras ejecuciones de POCA en SoccerTwos.
- Evaluación visual en navegador: subir el `.onnx` al visor de agentes de HuggingFace (https://huggingface.co/unity) y observar la política jugando sin instalar Unity, útil para demos docentes.
- Baseline en competiciones o pruebas internas de SoccerTwos: usar esta política como referencia frente a agentes propios entrenados con PPO, SAC o self-play avanzado.
- Docencia de deep RL: ejemplo práctico de entrenamiento con ML-Agents y exportación a ONNX para ilustrar el ciclo completo de un agente.
- Integración en un proyecto Unity: importar el `.onnx` como modelo de comportamiento (Behavior Parameters) para un agente no jugador en una escena de fútbol 2v2.
- Análisis de logs con TensorBoard: estudiar la evolución de recompensa y pérdidas para diagnosticar problemas de entrenamiento en entornos cooperativos.
- Pruebas de pipeline de despliegue ONNX: validar la carga del modelo en ONNX Runtime y medir latencia de inferencia en CPU/GPU como paso previo a otros agentes más complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: muy baja; al tratarse de una política MLP de tamaño reducido para observaciones vectoriales, la inferencia cabe holgadamente en cualquier GPU consumer con 2-4 GB, e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime (GTX 1060 en adelante, RTX 3060/4090, A100/H100) es suficiente. Para entrenamiento, ML-Agents se beneficia de GPUs con más memoria si se ejecutan muchos entornos en paralelo.
- Cabe en GPU consumer: sí, con margen amplio; también en CPU para inferencia de un solo agente.
- Opciones de despliegue: Unity ML-Agents (Barracuda/Inference Engine), ONNX Runtime, visor de agentes de HuggingFace. No aplica vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponibles. La latencia depende del hardware y del número de agentes simulados; para una política MLP pequeña se espera del orden de milisegundos por paso en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Garaii/poca-SoccerTwos | SoccerTwos | POCA (PPO) | ONNX | no disponible | HuggingFace |
| Agentes oficiales de Unity ML-Agents para SoccerTwos | SoccerTwos | PPO/POCA | ONNX | según repositorio de ML-Agents (no verificada aquí) | Repositorio de Unity |
| Políticas de referencia de la comunidad para SoccerTwos en HuggingFace | SoccerTwos | PPO/POCA | ONNX | variable por autor | HuggingFace |

No se dispone de datos de rendimiento comparativo (recompensa media, tasa de victorias) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no procesa instrucciones en lenguaje natural.
- Específico del entorno SoccerTwos: la política no es transferible a otras tareas sin reentrenamiento.
- Sin datos de evaluación publicados: se desconoce su tasa de victorias, recompensa media o robustez frente a oponentes distintos.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de integrarlo en productos.
- Sesgos y alucinación: no aplican en el sentido habitual, pero la política puede exhibir comportamientos degenerados o explotar recompensas si el entorno de evaluación difiere del de entrenamiento.
- Riesgo de sobreajuste al compañero de equipo y a la configuración exacta de la escena de entrenamiento; el rendimiento puede degradarse con cambios en la física o en el número de agentes.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Fecha de creación declarada en 2026-11-04, posterior a la fecha actual de referencia: verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Garaii/poca-SoccerTwos
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto de ML-Agents (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de HuggingFace: https://huggingface.co/unity
