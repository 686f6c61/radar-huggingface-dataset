# Conqueror25/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente de aprendizaje por refuerzo entrenado para jugar al entorno SoccerTwos de Unity, publicado en HuggingFace por el usuario Conqueror25. El agente se ha entrenado con la librería Unity ML-Agents usando el entrenador denominado "poca" (el nombre del repositorio y del run asociado), y se distribuye como un archivo ONNX exportado listo para inferencia dentro de Unity o mediante herramientas compatibles con ONNX.

SoccerTwos es un escenario de fútbol 2 contra 2 en el que dos equipos de agentes compiten por marcar goles; es un banco de pruebas habitual para investigar aprendizaje multiagente, autojuego (self-play) y estabilidad de políticas competitivas. Este repositorio concreto contiene únicamente los pesos exportados, sin métricas de evaluación, hiperparámetros detallados ni tarjeta de modelo ampliada.

La relevancia del artefacto es fundamentalmente práctica: sirve como ejemplo reproducible de un agente entrenado con ML-Agents y como punto de partida para reanudar entrenamiento, comparar algoritmos o ejecutar demostraciones interactivas en el navegador a través del Space oficial de Unity. El repositorio no tiene descargas ni interacciones registradas y no declara licencia, por lo que su uso en producción requiere verificación legal previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; agente de aprendizaje por refuerzo entrenado con Unity ML-Agents (entrenador "poca") |
| Parámetros totales | no disponible (el repositorio ocupa 0,0 GB, lo que indica un modelo de tamaño muy reducido) |
| Longitud de contexto | no aplica: las observaciones las define el entorno SoccerTwos, no una ventana de contexto textual |
| Tipos de cuantización | no disponible; se distribuye una exportación ONNX sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible; no aplica, el agente no procesa lenguaje natural |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | ONNX (archivo SoccerTwos.onnx) |
| Librería | ml-agents |
| Pipeline declarado | reinforcement-learning |
| Fecha de creación / actualización | 24 de septiembre de 2026 (según metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El agente se ha entrenado con Unity ML-Agents, un toolkit de aprendizaje por refuerzo que conecta un entorno de Unity con entrenadores implementados en Python (PyTorch). El entrenador utilizado es "poca", uno de los algoritmos disponibles en ML-Agents, y el flujo de trabajo es el estándar del framework: el entorno SoccerTwos genera observaciones vectoriales, el entrenador optimiza la política y el resultado se exporta a ONNX para ejecutarlo en el motor de inferencia de Unity. No se especifican en la información disponible el número de pasos de entrenamiento, la composición de recompensas, la configuración de red neuronal (capas, unidades, uso de memoria recurrente) ni los hiperparámetros empleados.

SoccerTwos es un entorno competitivo 2v2 diseñado para autojuego: dos equipos de dos agentes comparten política por equipo y aprenden a cooperar y competir simultáneamente. Este tipo de escenario se usa para estudiar no estacionariedad, colusión entre políticas y curvas de recompensa/Elo. La model card únicamente documenta cómo reanudar el entrenamiento con `mlagents-learn <config.yaml> --run-id=<run_id> --resume` y cómo visualizar al agente en el Space de Unity, sin aportar innovaciones técnicas propias ni detalles del proceso de optimización.

## Capacidades

- Control de un agente dentro del entorno SoccerTwos de Unity ML-Agents: percepción por observaciones del entorno y emisión de acciones discretas/continuas según la configuración del escenario.
- Juego cooperativo y competitivo en partidos 2 contra 2, con política compartida por equipo y comportamiento derivado de autojuego.
- Exportación a ONNX para inferencia embebida en Unity mediante Unity Inference Engine (antiguo Barracuda) u otros runtimes compatibles con ONNX.
- Reanudación del entrenamiento sobre los pesos publicados para continuar el aprendizaje o aplicar ajuste fino con otra configuración.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general ni procesamiento de lenguaje natural.
- No soporta tool calling, function calling, uso de agentes basados en LLM ni razonamiento multi-paso de tipo cadena de pensamiento.
- No hay modo "thinking", ni capacidades de audio, vídeo o multimodalidad.

## Casos de uso

- Investigación en aprendizaje multiagente: el agente sirve como política de referencia entrenada en SoccerTwos para estudiar cooperación, competencia y dinámicas de autojuego en entornos 2v2.
- Comparación de algoritmos de RL: al ser un checkpoint del entrenador "poca", permite contrastar su comportamiento frente a líneas base entrenadas con PPO u otros entrenadores de ML-Agents bajo el mismo entorno y presupuesto de pasos.
- Reanudación y ajuste fino: mediante `mlagents-learn ... --resume` se puede continuar el entrenamiento desde estos pesos, por ejemplo para aumentar el número de pasos, modificar recompensas o cambiar la configuración de la red.
- Demostración interactiva en navegador: el archivo ONNX puede cargarse en el Space `unity/ML-Agents-SoccerTwos` para visualizar al agente jugando sin necesidad de compilar el proyecto de Unity.
- Material docente: encaja en la unidad 7 del curso de Deep RL de HuggingFace como ejemplo completo del ciclo entrenar, publicar en el Hub y desplegar un agente de ML-Agents.
- Generación de trayectorias para aprendizaje por imitación u offline RL: ejecutando la política en el entorno se pueden recolectar pares observación-acción y recompensas para entrenar otros modelos.
- Prototipado de agentes para videojuegos: sirve como plantilla de integración de una política entrenada en un proyecto Unity mediante inferencia ONNX, antes de escalar a entornos más complejos.
- Pruebas de robustez y evaluación cualitativa: permite observar comportamientos emergentes (persecución del balón, posicionamiento, cooperación entre compañeros) en partidos repetidos, aunque sin métricas cuantitativas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No se documentan tasas de victoria, curvas de recompensa, puntuaciones Elo ni comparaciones cuantitativas frente a otras políticas en SoccerTwos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB, lo que sugiere una red de política de tamaño muy reducido, ejecutable en CPU sin GPU dedicada.
- GPU recomendadas: no se especifica ninguna; para un modelo de este tamaño no es necesario hardware de datacenter (A100, H100) ni GPU de consumo (RTX 4090 o similar) para la inferencia.
- Compatibilidad con GPU de consumo: previsiblemente sí, aunque no hay requisitos publicados; el cuello de botella real es el renderizado del entorno de Unity, no la red.
- Opciones de despliegue: Unity Inference Engine (Barracuda) dentro de un proyecto Unity, ONNX Runtime, y el flujo estándar de ML-Agents (entrenamiento e inferencia vía Python con `mlagents-learn`).
- Latencia y throughput: no disponibles. En la práctica, la latencia vendrá dominada por el bucle de simulación de Unity y la frecuencia de decisión configurada en el entorno, no por el coste de la red.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entorno | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Conqueror25/poca-SoccerTwos | Agente RL (entrenador poca, ML-Agents) | no disponible | SoccerTwos | no disponible | no disponible | Repositorio HuggingFace, 0 descargas |
| Líneas base de SoccerTwos de Unity ML-Agents | Agente RL (PPO, ML-Agents) | no disponible | SoccerTwos | métricas en la documentación del toolkit, no comparables directamente | según licencia de ML-Agents | Ejemplos incluidos en el repositorio oficial de ML-Agents |
| Otros agentes comunitarios de SoccerTwos en el Hub | Agente RL (PPO, SAC, poca, etc.) | no disponible | SoccerTwos | no disponible | variable según autor | Repositorios individuales de HuggingFace |

No hay datos públicos suficientes para establecer una comparación cuantitativa fiable entre este checkpoint y alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial sin contactar con el autor y obtener una autorización explícita.
- Ausencia de métricas: no hay tasas de victoria, curvas de aprendizaje ni evaluación frente a rivales de referencia, por lo que se desconoce la calidad real de la política.
- Especialización extrema: el agente solo es válido para el entorno SoccerTwos con la misma configuración de observaciones y acciones; no generaliza a otros escenarios ni a variantes del entorno con distinto número de agentes o reglas.
- Falta de reproducibilidad: no se publican hiperparámetros, semilla, número de pasos ni versión exacta de ML-Agents, lo que dificulta replicar el entrenamiento.
- Riesgo de sobreajuste a rivales concretos: en autojuego, una política puede explotar los defectos de sus oponentes de entrenamiento y degradarse frente a políticas distintas.
- El concepto de alucinación no aplica: no es un modelo generativo de lenguaje, sino una política de control; el riesgo equivalente es la aparición de comportamientos degenerados o de colusión.
- Sin soporte multilingüe ni de texto: no puede emplearse en tareas de NLP, atención al cliente, generación de código u otras aplicaciones basadas en lenguaje.
- Metadatos atípicos: las fechas de creación y actualización (2026) y la ausencia de descargas y likes indican un repositorio sin validación por parte de la comunidad; conviene tratarlo como experimental.
- Dependencia del runtime de Unity: el ONNX no incluye el entorno ni la lógica de observaciones, por lo que es inservible sin el escenario SoccerTwos correspondiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Conqueror25/poca-SoccerTwos
- Space de demostración de Unity ML-Agents SoccerTwos: https://huggingface.co/spaces/unity/ML-Agents-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Curso de Deep Reinforcement Learning, unidad 7: https://huggingface.co/learn/deep-rl-course/unit7/introduction
