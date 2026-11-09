# appssy3/connectailab-rl-solo-build-H-v4-Humanoid

## Resumen

connectailab-rl-solo-build-H-v4-Humanoid es una política de control continuo entrenada con aprendizaje por refuerzo (PPO) para el entorno Humanoid-v5 de MuJoCo, desarrollada por el usuario appssy3 en el marco del programa educativo CONNECT AI LAB (serie "AI CITY BUILDERS", lección 7 de RL). No es un modelo de lenguaje: es un agente que controla las articulaciones de un cuerpo humanoide simulado para conseguir una marcha bípeda estable y hacia delante. El repositorio se publicó el 9 de noviembre de 2026, no acumula descargas ni likes y su tamaño es de 0,0 GB, lo que sugiere pesos de una red de política de pequeña dimensión.

El interés del modelo es fundamentalmente pedagógico y de referencia: documenta una progresión explícita de cuatro versiones (v1 a v4) en las que el agente pasa de mantenerse en pie (0,20 m/s) a una marcha cruzada natural a 1,19 m/s tras 1,5 millones de pasos acumulados de entrenamiento. La v4 introduce ajustes concretos de recompensa: multiplicar por cuatro la recompensa de avance, relajar un 80 % la penalización de par (torque) y añadir una recompensa de ritmo con objetivo de 1,5 m/s.

La relevancia actual es la de un artefacto didáctico reproducible de RL con PPO en control continuo, útil para comparar curvas de aprendizaje y diseños de función de recompensa en Humanoid-v5, no la de un componente listo para producción. No se dispone de información sobre arquitectura de red, hiperparámetros de PPO, licencia ni idiomas, y las métricas declaradas no están verificadas por terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO; red neuronal de la que no se detalla topología) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de control continuo, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (no se documentan pesos cuantizados; el repo ocupa 0,0 GB) |
| Idiomas soportados | no aplica (no procesa lenguaje; la model card está redactada en coreano) |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería declarada: pytorch; se esperan checkpoints de PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

Se trata de un agente de aprendizaje por refuerzo para control continuo entrenado con PPO (Proximal Policy Optimization) sobre el entorno Humanoid-v5 de MuJoCo, un simulador de física con un cuerpo humanoide de múltiples articulaciones y acciones continuas (pares articulares). La model card no especifica la topología de la red de política ni de la red de valor, el número de capas, las dimensiones de las capas ocultas, la tasa de aprendizaje, el tamaño de lote ni el número de entornos paralelos; todos esos datos figuran como no disponibles.

El entrenamiento se describe en términos de pasos acumulados y de ingeniería de recompensa. La progresión declarada es: v1 con 100.000 pasos y 0,20 m/s (equilibrio y permanencia en el sitio), v2 con 400.000 pasos y 0,35 m/s (desplazamiento del centro de masa y primeros intentos de avance), v3 con 1.000.000 de pasos y 0,85 m/s (carrera sostenida de 10 segundos) y v4 con 1.500.000 pasos y 1,19 m/s (marcha cruzada natural con amplitud de zancada ampliada). Los cambios declarados en v4 son tres: recompensa de avance multiplicada por cuatro, penalización de par reducida en un 80 % y una recompensa de ritmo con objetivo de 1,5 m/s. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa, que no aplican a este dominio.

## Capacidades

- Control continuo de un cuerpo humanoide simulado en MuJoCo (Humanoid-v5): genera acciones articulares a cada paso de simulación.
- Locomoción bípeda hacia delante con marcha cruzada natural, según la descripción del autor para la versión v4.
- Velocidad media de avance declarada de 1,19 m/s, equivalente a unos 5,2 km/h según la propia model card.
- Supervivencia sostenida en episodio: media de 109 pasos y máximo de 130 pasos declarados.
- Optimización de una recompensa personalizada de marcha (media declarada de 1016,9 puntos).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, agentes basados en lenguaje, visión, audio ni capacidades multilingües: es una política de control, no un modelo generativo.

## Casos de uso

- Docencia de RL con PPO en control continuo: el repositorio sirve como referencia de una progresión de cuatro versiones con métricas por etapa, útil para explicar el efecto del diseño de recompensa en la calidad de la marcha.
- Comparación de funciones de recompensa: los cambios documentados en v4 (avance x4, penalización de par -80 %, recompensa de ritmo a 1,5 m/s) permiten reproducir el experimento y medir el impacto de cada término sobre la velocidad y la naturalidad del ciclo de marcha.
- Línea base para algoritmos de RL: puede usarse como punto de partida o comparación frente a SAC, TD3 o variantes de PPO en Humanoid-v5, siempre que se validen las métricas de forma independiente.
- Estudio de curvas de aprendizaje: la imagen `learning_curve.png` y la tabla v1-v4 facilitan analizar la relación entre pasos acumulados y velocidad alcanzada.
- Demostraciones visuales y material de clase: el vídeo `replay.mp4` permite mostrar en aula el comportamiento de una política entrenada sin necesidad de reentrenar.
- Prototipado de control de locomotion en simulación: como política inicial para experimentos de sim-to-real a pequeña escala, con la advertencia de que no hay evidencia de transferencia al mundo real.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index, no verificados por terceros (`verified: false`). Entorno: Humanoid-v5 (MuJoCo).

| Métrica | Valor declarado |
|---|---|
| Velocidad media de avance | 1,19 m/s |
| Recompensa media personalizada de marcha | 1016,9 |
| Pasos de supervivencia medios | 109,0 pasos |
| Pasos de supervivencia máximos | 130,0 pasos |

Progresión por versiones según la model card:

| Versión | Pasos acumulados | Velocidad media | Característica declarada |
|---|---|---|---|
| v1 | 100.000 | 0,20 m/s | Equilibrio y permanencia en el sitio |
| v2 | 400.000 | 0,35 m/s | Desplazamiento del centro de masa y avance |
| v3 | 1.000.000 | 0,85 m/s | Carrera sostenida de 10 segundos |
| v4 | 1.500.000 | 1,19 m/s | Marcha cruzada natural con zancada ampliada |

No se han publicado resultados comparativos frente a otras políticas en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,0 GB, lo que indica pesos de muy pequeño tamaño; una política de control para Humanoid-v5 suele ejecutarse en CPU sin problema, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles. Para inferencia de una política de este tipo no se requiere GPU dedicada; para reentrenar con PPO en MuJoCo sí conviene GPU, pero no se especifica modelo.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repo, aunque no está documentado.
- Opciones de despliegue: no disponibles. No se documenta exportación a ONNX, TorchScript ni integración con vLLM, llama.cpp, Ollama o TGI (herramientas no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de RL comparables en Humanoid-v5 ni resultados de referencia de la comunidad (por ejemplo, implementaciones de Stable-Baselines3 o CleanRL) con los que confrontar métricas.

## Limitaciones y advertencias

- Métricas no verificadas: las cuatro cifras del model-index están marcadas como `verified: false` y proceden únicamente del autor.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial y la redistribución quedan sin marco legal claro; conviene contactar con el autor antes de cualquier uso.
- Sin documentación técnica: no se detallan arquitectura de red, hiperparámetros de PPO, semillas, número de entornos ni configuración de evaluación, lo que dificulta la reproducción.
- Dominio restringido: solo válido para Humanoid-v5 de MuJoCo; no hay evidencia de transferencia a otros entornos ni al mundo real (sim-to-real no documentado).
- Sin datos de sesgo, alucinación o multilingüismo: no aplican a un agente de control, pero tampoco se documenta robustez ante perturbaciones, cambios de masa o fricción.
- Supervivencia corta: 109 pasos de media y 130 máximos son episodios breves; conviene comprobar la estabilidad en horizontes más largos antes de cualquier uso serio.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin revisión de la comunidad.
- Contenido de la model card en coreano: la documentación y los nombres de métricas están en coreano, lo que puede dificultar su interpretación a parte del público.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appssy3/connectailab-rl-solo-build-H-v4-Humanoid
- Vídeo de replay: https://huggingface.co/appssy3/connectailab-rl-solo-build-H-v4-Humanoid/resolve/main/replay.mp4
- Curva de aprendizaje: https://huggingface.co/appssy3/connectailab-rl-solo-build-H-v4-Humanoid/blob/main/learning_curve.png
- Entorno Humanoid-v5 (MuJoCo/Gymnasium): no disponible en la información proporcionada
- Paper de PPO: no disponible en la información proporcionada
- Repositorio de código de entrenamiento: no disponible en la información proporcionada
