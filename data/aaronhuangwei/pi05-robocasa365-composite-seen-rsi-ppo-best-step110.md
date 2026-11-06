# AaronHuangWei/pi05-robocasa365-composite-seen-rsi-ppo-best-step110

## Resumen

`pi05-robocasa365-composite-seen-rsi-ppo-best-step110` es un modelo de vision-lenguaje-accion (VLA) para robótica de manipulación, publicado por el usuario AaronHuangWei en Hugging Face. Se trata de un fine-tuning del modelo base `AaronHuangWei/pi05-robocasa365-composite-seen-sft-100k`, que a su vez deriva de la familia pi05 (openpi). El modelo está entrenado sobre el conjunto de datos `nvidia/PhysicalAI-Robotics-Manipulation-Kitchen-Demos` y el sufijo del nombre indica que ha pasado por una fase de aprendizaje por refuerzo con PPO y una técnica de auto-mejora iterativa (RSI, *reinforcement self-improvement*), seleccionándose el checkpoint del paso 110.

Con 3.616.757.520 parámetros (aproximadamente 3,6 mil millones) y un tamaño de repositorio de 27,8 GB en formato safetensors, es un modelo de tamaño medio diseñado para ejecutar políticas de control robótico a partir de observaciones visuales e instrucciones en lenguaje natural. Su relevancia radica en que combina el paradigma VLA con un pipeline de RL posterior al SFT, una tendencia creciente para mejorar la robustez de políticas robóticas más allá de la imitación supervisada.

Es importante señalar que el modelo tiene acceso restringido (gated) en Hugging Face, no declara licencia ni idiomas soportados, y no cuenta con descargas ni interacciones públicas en el momento de la consulta. La información técnica disponible es limitada y se deriva principalmente de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA), familia pi05 / openpi; detalles internos no disponibles |
| Parametros totales | 3.616.757.520 (~3,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 27,8 GB |
| Modelo base | AaronHuangWei/pi05-robocasa365-composite-seen-sft-100k |
| Dataset de entrenamiento | nvidia/PhysicalAI-Robotics-Manipulation-Kitchen-Demos |
| Pipeline declarado | reinforcement-learning |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia pi05, un paradigma de vision-language-action en el que un transformer procesa conjuntamente observaciones visuales e instrucciones en lenguaje natural para producir acciones de control robótico. No se dispone de información detallada sobre el número de capas, dimensión de los embeddings, mecanismo de atención ni el codificador visual empleado. El nombre del modelo sugiere una variante "composite" dentro del ecosistema RoboCasa365, probablemente orientada a tareas compuestas de manipulación en entornos de cocina.

El entrenamiento se articula en dos fases según la nomenclatura del repositorio. Primero, un ajuste supervisado (SFT) sobre 100.000 pasos a partir del dataset de demostraciones de cocina de NVIDIA PhysicalAI-Robotics-Manipulation-Kitchen-Demos, que da lugar al modelo base `pi05-robocasa365-composite-seen-sft-100k`. Después, una fase de aprendizaje por refuerzo con PPO combinada con RSI (*reinforcement self-improvement*), de la que resulta este checkpoint "best-step110". No se especifican hiperparámetros de RL, función de recompensa, número de tokens de entrenamiento ni composición exacta del dataset.

## Capacidades

- Control robótico de manipulación a partir de observaciones visuales e instrucciones en lenguaje natural (paradigma VLA).
- Ejecución de políticas entrenadas específicamente para tareas de cocina del benchmark RoboCasa365.
- Procesamiento conjunto de entrada visual y textual para generar acciones motoras.
- Capacidad de mejora mediante RL (PPO) y auto-mejora iterativa (RSI) sobre la política base de imitación.
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso en el sentido de LLM: no disponible; el modelo opera como política de control.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión general, audio: no disponible (la visión se emplea como entrada para control, no para descripción de imágenes).

## Casos de uso

- Manipulación robótica en entornos de cocina simulados: el modelo puede ejecutar políticas de agarre, colocación y manipulación de objetos entrenadas sobre RoboCasa365, aprovechando las demostraciones de NVIDIA PhysicalAI-Robotics-Manipulation-Kitchen-Demos.
- Investigación en aprendizaje por refuerzo para robótica: sirve como punto de partida para comparar políticas SFT frente a políticas refinadas con PPO y RSI en tareas compuestas.
- Evaluación de pipelines VLA: útil para reproducir o extender experimentos de la familia pi05/openpi en escenarios de manipulación doméstica.
- Generación de datos sintéticos de política: puede emplearse como política de referencia para recolectar trayectorias adicionales en simulador antes de un nuevo ciclo de entrenamiento.
- Benchmarking de robustez: el checkpoint "best-step110" permite medir la ganancia de RL sobre el SFT en tareas con objetos vistos ("seen") del conjunto RoboCasa365.
- Base para fine-tuning en dominios específicos: al ser un modelo de 3,6 B parámetros, es viable ajustarlo con recursos moderados para nuevas tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 7,2 GB solo para pesos (3,6 B parámetros × 2 bytes), más memoria para activaciones y codificador visual; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,6 GB para pesos, con margen adicional para activaciones.
- GPU recomendadas: no disponibles de forma oficial; por tamaño, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 son suficientes para inferencia en precisión completa.
- Compatibilidad con GPU de consumo: sí, previsiblemente en RTX 3090/4090 y GPUs con 16 GB o más en fp16; en cuantización podría caber en GPUs de 8-12 GB, aunque no hay datos oficiales.
- Opciones de despliegue: no se documentan; la familia openpi suele integrarse con stacks propios de inferencia robótica más que con vLLM, llama.cpp u Ollama, que no están orientados a políticas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| pi05-robocasa365-composite-seen-rsi-ppo-best-step110 | ~3,6 B | no disponible | no disponible | gated | VLA con RL (PPO + RSI) sobre RoboCasa365 |
| pi05-robocasa365-composite-seen-sft-100k | no disponible | no disponible | no disponible | no disponible | Modelo base SFT del anterior |
| Otros VLA de la familia openpi | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificables |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas como OpenVLA, RT-2 o π0, por lo que los datos de rendimiento comparado no están disponibles.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia no declarada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no especificados: se desconoce si las instrucciones en lenguaje natural admiten castellano u otros idiomas distintos del inglés.
- Entrenado específicamente para RoboCasa365 y el dataset de cocina de NVIDIA: la generalización fuera de ese dominio es incierta.
- El sufijo "seen" indica que las tareas de evaluación emplean objetos vistos durante el entrenamiento; el rendimiento en objetos no vistos no está documentado.
- Riesgo de sobreajuste al simulador: las políticas VLA entrenadas en simulación suelen requerir adaptación para el mundo real (sim-to-real gap).
- Sin benchmarks publicados: no es posible verificar cuantitativamente la mejora atribuida a PPO/RSI.
- Sin descargas ni validación comunitaria: el modelo no ha sido contrastado por terceros.
- Riesgo de alucinación en el sentido de generar acciones no válidas o inseguras fuera de la distribución de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/AaronHuangWei/pi05-robocasa365-composite-seen-rsi-ppo-best-step110
- Modelo base: https://huggingface.co/AaronHuangWei/pi05-robocasa365-composite-seen-sft-100k
- Dataset: https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-Manipulation-Kitchen-Demos
- Repositorio openpi (referencia de la familia): https://github.com/Physical-Intelligence/openpi
- RoboCasa365 (benchmark de referencia): no disponible en la información proporcionada.
