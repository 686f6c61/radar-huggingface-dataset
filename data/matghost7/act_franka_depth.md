# Matghost7/act_franka_depth

## Resumen

`Matghost7/act_franka_depth` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) sobre el robot Franka Panda en modalidad kinestésica. La desarrolla el usuario Matghost7 y se publica a través del ecosistema LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación denominada "depth check", aprendiendo de 14 episodios teleoperados (3120 fotogramas a 10 FPS) que combinan una cámara RGB de muñeca y una cámara de profundidad.

Arquitectónicamente es un transformer ligero de 51,7 millones de parámetros que predice trozos de acción (action chunks) en lugar de pasos individuales, una estrategia que reduce el error de acumulación y mejora la estabilidad en control continuo. Consume un vector de estado de 29 dimensiones junto con dos flujos visuales de 480x640 y emite un vector de acción también de 29 dimensiones.

Su relevancia es acotada pero representativa: es un ejemplo de política entrenada de extremo a extremo con LeRobot 0.6.2, útil para reproducir el flujo de trabajo de imitación en robótica y para experimentar con fusión de modalidades RGB y profundidad en tareas de manipulación. No es un modelo de propósito general ni un modelo de lenguaje; es una política específica de robot y tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers) |
| Parametros totales | 51.715.741 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador transformer con un decodificador que predice secuencias cortas de acciones (chunks) en lugar de una única acción por paso. El modelo recibe observaciones multimodales: un vector de estado propioceptivo de 29 dimensiones y dos imágenes de 480x640 (cámara de muñeca RGB y cámara de profundidad), y produce un vector de acción de 29 dimensiones. La inclusión de una segunda modalidad visual de profundidad es la particularidad de esta política frente a variantes ACT puramente RGB.

El entrenamiento se realizó con LeRobot 0.6.2 durante 30.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset es `Matghost7/franka_depth_merged`, con 14 episodios, 3120 fotogramas a 10 FPS y una única tarea ("depth check"). No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de imitación supervisada pura sobre datos teleoperados. No se especifica el número de tokens de entrenamiento (no aplica) ni la composición detallada del dataset más allá de los conteos indicados.

## Capacidades

- Control de manipulación robótica en el robot Franka Panda en modalidad kinestésica.
- Predicción de chunks de acción de 29 dimensiones a partir de estado y observaciones visuales.
- Fusión de información RGB y de profundidad mediante dos flujos visuales separados de 480x640.
- Ejecución de la tarea concreta "depth check" sobre la que fue entrenado.
- Integración nativa con el ecosistema LeRobot (rollout, entrenamiento y evaluación).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Reproducción del pipeline de imitación en robótica: sirve como referencia para entrenar políticas ACT con LeRobot sobre un robot Franka Panda, usando el comando `lerobot-train` documentado en la model card.
- Experimentación con fusión RGB + profundidad: permite evaluar si la segunda modalidad visual mejora la precisión en tareas de manipulación frente a políticas solo RGB, comparando con variantes ACT estándar.
- Validación de hardware y calibración: el comando `lerobot-rollout` con `--strategy.type=base` permite ejecutar la política en un robot real durante un tiempo acotado (`--duration=60`) para comprobar que cámaras, puerto y calibración funcionan antes de grabar datos.
- Docencia y demostraciones de aprendizaje por imitación: al ser un modelo pequeño (51,7 M de parámetros) y con un dataset reducido (14 episodios), es adecuado para ilustrar el ciclo completo teleoperación-entrenamiento-despliegue en un curso o taller.
- Punto de partida para fine-tuning: puede servir como inicialización para tareas de manipulación similares en el mismo robot, reduciendo el número de episodios necesarios frente a entrenar desde cero.
- Benchmark interno de infraestructura: útil para medir latencia de inferencia y throughput de LeRobot en un robot Franka Panda con dos cámaras a 10 FPS, antes de escalar a políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros en safetensors, repo de 0,2 GB) es holgadamente inferior a 1 GB en precisión nativa, y cabe en cualquier GPU consumer con varios GB libres.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100) debería ser suficiente para la inferencia de la política.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento), con soporte de `--policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La frecuencia de control del dataset es de 10 FPS, lo que marca un objetivo de inferencia de 100 ms por paso, pero no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Matghost7/act_franka_depth | 51,7 M | no aplica | Manipulación Franka Panda con RGB + profundidad | no disponible | Hugging Face (LeRobot) |
| Políticas ACT estándar en LeRobot | variable (decenas de millones) | no aplica | Manipulación genérica con RGB | variable según autor | Hugging Face (LeRobot) |
| Políticas Diffusion Policy en LeRobot | variable | no aplica | Manipulación con acciones continuas | variable según autor | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, tamaño y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con 14 episodios de una única tarea, la política hereda cualquier sesgo de posición, iluminación o configuración de cámara presente en esos datos.
- Riesgo de sobreajuste: con 3120 fotogramas y una sola tarea ("depth check"), la generalización a posiciones de objeto, condiciones de luz o configuraciones de robot distintas es muy limitada.
- Ausencia de evaluación: no hay resultados de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Licencia no especificada: la model card marca la licencia como "[More Information Needed]"; no se debe asumir uso comercial permitido sin confirmación del autor.
- Dependencia de hardware: requiere un Franka Panda en modalidad kinestésica y dos cámaras (RGB de muñeca y profundidad) con nombres e índices que coincidan con las claves de observación del entrenamiento (`observation.images.wrist` y `observation.images.wrist_depth`).
- Frecuencia de control baja: 10 FPS en entrenamiento; tareas que requieran control más rápido no están cubiertas.
- No es un modelo de lenguaje: no debe usarse para generación de texto, código, razonamiento ni tareas de NLP.
- Idiomas: no disponible; no aplica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Matghost7/act_franka_depth
- Dataset de entrenamiento: https://huggingface.co/datasets/Matghost7/franka_depth_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Matghost7/franka_depth_merged
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
