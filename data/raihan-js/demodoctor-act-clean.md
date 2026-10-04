# raihan-js/demodoctor-act-clean

## Resumen

`raihan-js/demodoctor-act-clean` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en HuggingFace Hub a través de la librería LeRobot. ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y permite ejecutar trayectorias más suaves y precisas a partir de datos de teleoperación. El modelo resuelve la tarea concreta de empujar un bloque en forma de T hasta una diana con la misma forma, perteneciente al conocido entorno de referencia PushT.

Se trata de un modelo pequeño: 51.660.418 parámetros en formato safetensors, con un repositorio de 0,2 GB. Consume una imagen de `(3, 96, 96)` y un vector de estado de `(2,)`, y produce un vector de acción de `(2,)`, por lo que está pensado para un robot de dos grados de libertad con una única cámara. No es un modelo de lenguaje: no procesa texto libre ni tiene ventana de contexto conversacional, y su salida es exclusivamente control motor de baja dimensión.

Su relevancia es práctica más que de estado del arte: sirve como referencia reproducible del pipeline de imitación de LeRobot (grabación de datos, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`), como punto de partida para fine-tuning en tareas de manipulación planar y como elemento de comparación frente a alternativas como Diffusion Policy. La model card no incluye ningún resultado de evaluación en robot real ni en simulación, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer condicionado con componente tipo CVAE y decodificación de action chunks |
| Parámetros totales | 51.660.418 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje; consume una observación por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Entradas | `observation.image` VISUAL `(3, 96, 96)`, `observation.state` STATE `(2,)` |
| Salidas | `action` ACTION `(2,)` |
| Tipo de robot | unknown |
| Cámaras | image |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-10-03 (actualizado el mismo día) |

## Arquitectura y entrenamiento

ACT es un transformer que aprende de datos de teleoperación y predice secuencias de acciones (chunks) en lugar de una única acción por paso. La formulación habitual incluye un codificador de visión que transforma la imagen en tokens, un codificador de estado, un transformer encoder-decoder y un componente variacional (CVAE) que modela la variabilidad natural de las demostraciones humanas; el entrenamiento combina una pérdida de reconstrucción L1 sobre las acciones con un término de regularización KL. La información proporcionada no detalla la configuración exacta de capas, cabezas de atención ni el backbone visual empleado, por lo que esos datos figuran como no disponibles.

El entrenamiento se realizó sobre el dataset `lerobot/pusht`: 206 episodios, 25.650 fotogramas a 10 FPS, con la tarea "Push the T-shaped block onto the T-shaped target". La configuración declarada es de 20.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5, semilla 0 y LeRobot 0.6.1. No se menciona ningún tipo de ajuste posterior con RLHF o DPO, algo coherente con el paradigma de imitación supervisada. Tampoco se documenta el número total de tokens o muestras vistas ni la composición o aumentos del dataset más allá del recuento de episodios y fotogramas.

## Capacidades

- Generación de acciones motoras: produce un vector de acción de dimensión 2 a partir de la observación actual, adecuado para control de un robot de dos grados de libertad.
- Aprendizaje por imitación: reproduce comportamiento aprendido de demostraciones teleoperadas, sin necesidad de recompensa explícita ni de un simulador durante el entrenamiento.
- Predicción por chunks: emite secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la suavidad y reduce el error acumulado.
- Percepción visual básica: consume imágenes RGB de 96x96 píxeles, suficiente para tareas de manipulación con cámara fija.
- Fusión de estado propioceptivo y visión: combina el vector de estado de dos dimensiones con la imagen en la misma representación de entrada.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout`, `lerobot-train` y el resto de herramientas del proyecto.
- Tool calling / function calling: no disponible (no aplica; no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica; es una política de control, no un agente conversacional).
- Capacidades multilingües: no disponible (no aplica).
- Capacidades especiales: no se documentan modo de razonamiento, visión general, audio ni otras modalidades distintas de la imagen de entrada.

## Casos de uso

- Reproducción del benchmark PushT: el modelo está entrenado exactamente para la tarea "Push the T-shaped block onto the T-shaped target" sobre `lerobot/pusht`, por lo que permite replicar el experimento de referencia y medir tasas de éxito en un montaje real o simulado con un robot de dos grados de libertad.
- Fine-tuning para tareas de empuje y ensamblaje planar: al ser una política de 51,66 millones de parámetros, se puede reentrenar con `lerobot-train` sobre datasets propios de manipulación en el plano, reutilizando el backbone visual y la cabeza de acciones.
- Docencia e investigación en aprendizaje por imitación: su tamaño reducido (0,2 GB) y su licencia Apache-2.0 lo hacen apto para cursos y laboratorios donde se necesite recorrer el ciclo completo de recogida de datos, entrenamiento y despliegue sin infraestructura de GPU de gama alta.
- Banco de pruebas para comparar métodos de imitación: sirve como línea base de ACT frente a otras políticas como Diffusion Policy en una misma tarea y con el mismo dataset, siempre que se evalúen con idéntico protocolo.
- Validación de pipelines de datos y limpieza de demostraciones: al tratarse de una variante "clean" del mismo espacio de nombres, es útil para comprobar cómo afecta la curación del dataset al comportamiento final de la política.
- Prototipado de control en robots de bajo coste: su huella de memoria reducida permite ejecutarlo en ordenadores de placa única o en dispositivos embebidos con aceleración, integrado en una cámara fija y dos actuadores.
- Automatización de tareas repetitivas de picking planar: cualquier operación que consista en desplazar un objeto hasta una posición objetivo vista desde una cámara fija puede abordarse con un reentrenamiento sobre demostraciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la sección de evaluación con la línea "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de éxito declaradas ni en robot real ni en simulación, y no se ofrece ninguna comparación numérica con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51.660.418 parámetros, los pesos en fp32 ocupan aproximadamente 207 MB (el repositorio completo es de 0,2 GB). Cualquier cálculo adicional sobre cuantizaciones distintas de fp32 es una estimación aritmética, no un dato publicado.
- GPU recomendadas: el tamaño del modelo lo sitúa al alcance de prácticamente cualquier GPU con soporte CUDA. Se menciona `--policy.device=cuda` en la configuración de entrenamiento, pero no se especifica ningún modelo de GPU concreto en la información disponible.
- Cabe en GPU de consumo: sí, con margen amplio. Una RTX 3060 de 12 GB o superior es más que suficiente tanto para inferencia como para reentrenamiento con batch size 32, que es el valor usado en el entrenamiento original.
- CPU y dispositivos embebidos: LeRobot permite ejecutar políticas en CPU y en plataformas tipo Jetson o Raspberry Pi; con 0,2 GB de pesos la inferencia en CPU es viable, aunque no se documentan latencias medidas.
- Opciones de despliegue: `lerobot-rollout` para ejecución sobre robot, `lerobot-train` para reentrenamiento, y el stack de PyTorch subyacente. No aplican servidores de inferencia de modelos de lenguaje como vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Requisitos de cámara: la política espera observaciones con clave `observation.image` de forma `(3, 96, 96)`. El ejemplo de la model card configura cámaras OpenCV a 640x480 y 30 FPS con `--strategy.type=base`; los nombres de cámara deben coincidir con las claves de observación del entrenamiento.
- Latencia y throughput: no disponible. La información proporcionada no incluye mediciones de frecuencia de control, tiempo por inferencia ni episodios por hora.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de modelos alternativos (parámetros, contexto, rendimiento, licencia). La comparación siguiente es cualitativa y se apoya en el conocimiento general de la literatura; las celdas sin dato verificable se marcan como no disponibles.

| Modelo | Enfoque | Parámetros | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `raihan-js/demodoctor-act-clean` | ACT (action chunking, imitación) | 51,66 M | sin evaluación publicada | Apache-2.0 | HuggingFace Hub (0 descargas) |
| ACT (implementación de referencia, Zhao et al., 2023) | ACT (action chunking, imitación) | no disponible | no disponible | no disponible | paper y repositorio de referencia |
| Diffusion Policy (Chi et al., 2023) | política basada en difusión | no disponible | no disponible | no disponible | paper y repositorio de referencia |
| Políticas VLA (por ejemplo SmolVLA, π0, GR00T N1) | visión-lenguaje-acción, entrada multimodal | no disponible | no disponible | no disponible | HuggingFace Hub |

Diferencias relevantes: ACT es más ligero y rápido de entrenar que una política de difusión, pero suele ser menos expresivo ante distribuciones multimodales de acciones; las políticas VLA añaden entrada de lenguaje e instrucciones, algo que este modelo no soporta.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito publicadas. Cualquier uso en producción exige una validación propia con protocolo documentado (número de ensayos, variaciones de posición, iluminación y distractores).
- Alcance muy restringido: la política está entrenada únicamente para la tarea PushT con acciones de dimensión 2 y estado de dimensión 2. No generaliza a otras tareas ni a robots con otra cinemática sin reentrenamiento.
- Entrada visual de baja resolución: 96x96 píxeles limita la percepción de objetos pequeños, texturas finas o escenas con distractores.
- Sensibilidad al dominio: cambios de iluminación, fondo, posición de cámara o tipo de robot pueden degradar el comportamiento, ya que no se documenta ningún tipo de aumento de datos ni de aleatorización.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el riesgo análogo de ejecutar acciones no fundamentadas cuando la observación queda fuera de la distribución de entrenamiento, con posibles colisiones o daños físicos.
- Sesgos: el comportamiento queda determinado por las demostraciones de `lerobot/pusht`, con la estrategia y los sesgos de las personas que teleoperaron los 206 episodios. No se documenta ningún análisis de sesgo ni de diversidad de demostraciones.
- Idiomas: no soporta lenguaje natural, por lo que no se puede interactuar con la política mediante instrucciones habladas o escritas.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene revisar las condiciones del dataset `lerobot/pusht` y del método ACT original antes de un despliegue comercial.
- Trazabilidad limitada: el campo `Robot type` figura como `unknown`, el autor no documenta la variante exacta del backbone ni los hiperparámetros completos, y el repositorio no tiene descargas ni validación por parte de la comunidad.
- Metadatos atípicos: las fechas de creación y actualización registradas (2026-10-03) son posteriores a la fecha de consulta habitual de este tipo de fichas; conviene verificar la vigencia del repositorio antes de depender de él.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raihan-js/demodoctor-act-clean
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/pusht
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/pusht
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web asociada a esta ficha no devolvió ningún resultado relevante sobre el modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card del autor.
