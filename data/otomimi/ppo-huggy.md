# otomimi/ppo-Huggy

## Resumen

`otomimi/ppo-Huggy` no es un modelo de lenguaje: es una política de refuerzo entrenada con el algoritmo PPO (Proximal Policy Optimization) dentro de Unity ML-Agents para controlar a Huggy, el perro virtual del entorno homónimo. El autor, el usuario `otomimi`, publica el resultado de su ejecución de entrenamiento en el Hub de Hugging Face con el pipeline `reinforcement-learning`, acompañado de los artefactos habituales de ML-Agents (ficheros `.nn` y `.onnx`, además de posibles logs de TensorBoard, dado el tamaño del repositorio de 0,2 GB).

El interés de la ficha es limitado para quien busque un modelo generativo: se trata de un agente de control con observaciones y acciones específicas del simulador, sin capacidades de texto, código ni razonamiento simbólico. Su relevancia es formativa y de reproducibilidad: sirve como ejemplo canónico del flujo de trabajo de ML-Agents (entrenar, exportar a ONNX, visualizar la política en el navegador) descrito en el curso de deep reinforcement learning de Hugging Face.

La model card es mínima: no declara licencia, idiomas, hiperparámetros, número de pasos de entrenamiento ni métricas de recompensa. El repositorio acumula 0 descargas y 1 like en el momento de la consulta, por lo que debe tratarse como una publicación de aprendizaje y no como un artefacto validado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política neuronal entrenada con PPO dentro de Unity ML-Agents (perceptrón multicapa sobre observaciones vectoriales; topología exacta no documentada) |
| Parametros totales | no disponible (la model card no declara el tamaño de la red) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de control; el "contexto" es la observación por paso de simulación) |
| Tipos de cuantizacion | no disponible (se distribuyen artefactos `.nn` y `.onnx` sin información de cuantización) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | `.nn` (formato nativo de Unity ML-Agents) y `.onnx` (exportación para inferencia en Barracuda/Sentis u ONNX Runtime) |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo on-policy con objetivo sustituto recortado (*clipped surrogate objective*) y estimación de ventaja generalizada (GAE). En el ecosistema ML-Agents, el entrenador instancia múltiples copias del entorno en paralelo, recoge trayectorias y actualiza una red de política (y, opcionalmente, una red de valor) que mapea el vector de observaciones del entorno Huggy a acciones continuas de locomoción. La model card no detalla la topología de la red, el número de capas, el tamaño de las capas ocultas ni si se empleó red de valor separada.

Tampoco se documentan el número total de pasos de entrenamiento, la configuración YAML empleada, las semillas, el *reward shaping* aplicado por el entorno ni el currículum de dificultad. El único artefacto verificable es el comando de reanudación (`mlagents-learn <config>.yaml --run-id=<run_id> --resume`) y la presencia de ficheros `.onnx` exportados, lo que confirma que el modelo puede ejecutarse fuera del editor de Unity mediante el motor de inferencia.

## Capacidades

- Control de locomoción de un agente virtual (Huggy) en un entorno 3D de Unity, con acciones continuas.
- Inferencia determinista o estocástica según la configuración de muestreo de la política.
- Exportación a ONNX para ejecución en navegador mediante el visor de agentes de Hugging Face.
- Reanudación del entrenamiento desde el checkpoint publicado.
- Compatibilidad con el *stack* de ML-Agents (Unity Inference Engine / Barracuda / Sentis) y con ONNX Runtime.
- No soporta generación de texto, código, matemáticas, visión general, tool calling, agentes multi-paso ni capacidades multilingües.

## Casos de uso

- Docencia de deep RL: usar el checkpoint como punto de partida en el *unit bonus 1* del curso de Hugging Face para mostrar el ciclo completo entrenar → publicar → visualizar en el navegador, sin necesidad de reentrenar desde cero.
- Reproducción de experimentos: reanudar el entrenamiento con `--resume` para comparar curvas de recompensa frente a ejecuciones propias con la misma configuración YAML.
- Demostración interactiva: desplegar el `.onnx` en el visor de la organización `unity` de Hugging Face para que un visitante vea al agente jugar directamente en el navegador, sin instalar Unity.
- Baseline de comparación algorítmica: emplear la política PPO como referencia frente a SAC o POCA en el mismo entorno Huggy, evaluando recompensa media y estabilidad de la curva de aprendizaje.
- Validación de pipelines de exportación: probar la cadena `.nn` → `.onnx` → ONNX Runtime/WebGL como test de integración en un flujo de CI que verifique que el grafo exportado produce acciones coherentes.
- Pruebas de infraestructura de simulación: usar el entorno y el agente para medir *throughput* de instancias paralelas de Unity, consumo de CPU/GPU y latencia de paso, antes de escalar a entornos más costosos.
- Material de partida para *curriculum learning*: servir como inicialización cuando se ajusta el entorno Huggy con recompensas o niveles de dificultad adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensa media, curva de aprendizaje, número de pasos hasta convergencia ni comparación con otras ejecuciones. El tag `tensorboard` sugiere que existen logs de entrenamiento en el repositorio, pero no se han expuesto como resultados numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula; la política es una red pequeña que se ejecuta en CPU. El repositorio ocupa 0,2 GB, mayoritariamente logs y artefactos, no pesos.
- GPU recomendadas: ninguna imprescindible. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) acelera el entrenamiento y la simulación, pero no la inferencia de la política.
- Cabe en cualquier GPU consumer y también en CPU; el cuello de botella es el motor de simulación de Unity, no la red.
- Opciones de despliegue: Unity Inference Engine (Barracuda/Sentis), ONNX Runtime, el visor web de ML-Agents en Hugging Face y el propio editor de Unity.
- Latencia y throughput: no disponibles. No se han publicado mediciones de pasos por segundo ni de latencia por decisión.

## Comparativa con modelos similares

| Modelo | Tipo | Algoritmo / entorno | Licencia | Disponibilidad |
|---|---|---|---|---|
| `otomimi/ppo-Huggy` | Política RL | PPO sobre Huggy (ML-Agents) | no disponible | Pública en HF, 0 descargas, 1 like |
| `Kev3010/ppo-Huggy` | Política RL | PPO sobre Huggy (ML-Agents) | no disponible | Pública en HF |
| `omotout/ppo-Huggy` | Política RL | PPO sobre Huggy (ML-Agents) | no disponible | Pública en HF |
| Agentes de la organización `unity` en HF | Políticas RL | PPO sobre entornos oficiales de ML-Agents | no disponible en la información consultada | Públicas en HF |

Las tres variantes de `ppo-Huggy` comparten algoritmo y entorno, y difieren únicamente en la ejecución de entrenamiento concreta; sin métricas publicadas no es posible establecer cuál converge mejor. La comparación con modelos de la organización `unity` es cualitativa: mismo *toolkit*, entornos distintos y, por tanto, espacios de observación y acción no intercambiables.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no puede asumirse permiso de uso comercial, modificación ni redistribución; es necesario contactar con el autor.
- Especialización extrema: la política solo es válida para el entorno Huggy con la misma configuración de observaciones, acciones y versiones de ML-Agents; cualquier cambio invalida el agente.
- Falta total de documentación de entrenamiento (pasos, hiperparámetros, semillas, *reward shaping*), lo que impide evaluar la reproducibilidad y detectar sobreajuste a la dinámica del simulador.
- Sin métricas de rendimiento publicadas: se desconoce si el agente completa la tarea de forma fiable o si la recompensa media es competitiva.
- Compatibilidad frágil: los ficheros `.nn` dependen de la versión del paquete `ml-agents` y del motor de inferencia; una actualización mayor puede romper la carga.
- Riesgo de alucinación no aplicable, pero sí de comportamiento degenerado fuera de distribución: ante observaciones no vistas durante el entrenamiento la política puede producir acciones erráticas sin mecanismo de seguridad.
- No apto para tareas de lenguaje, razonamiento, código ni atención al cliente; la ficha de estilo LLM solo se mantiene por coherencia de formato.
- Repositorio de 0,2 GB con 0 descargas: no hay evidencia de uso ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/otomimi/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto del curso de deep RL (entrenar a Huggy): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organización `unity` en Hugging Face (visor de agentes): https://huggingface.co/unity
- Variante de otro autor: https://huggingface.co/Kev3010/ppo-Huggy
- Variante de otro autor: https://huggingface.co/omotout/ppo-Huggy
- Ficha de índice del modelo: https://essamamdani.com/ai-models/hf-jlvvlj-ppo-huggy
- Ficha de índice del modelo: https://model.aibase.com/models/details/1915692708011859969
- Proyecto de entrenamiento de Huggy con PPO: https://github.com/EbrahimShirjazi/Huggy-Reainforcementlearning
