# bklassen3434/smolvla_pick_pen_v2_lr5e5

## Resumen

SmolVLA_pick_pen_v2_lr5e5 es un ajuste fino de `lerobot/smolvla_base`, un modelo visión-lenguaje-acción (VLA) de 450 millones de parámetros desarrollado por el usuario de HuggingFace bklassen3434. El modelo resuelve una tarea muy concreta: selección de bolígrafos guiada por lenguaje natural sobre un brazo robótico SO-101. Dado un comando como "Pick up the blue pen", "Pick up the pink pen" o "Pick up the grey pen", el modelo debe identificar el objeto correcto entre los tres presentes simultáneamente en cada episodio y ejecutar la acción de recogida.

El entrenamiento se realizó sobre el dataset de teleoperación `bklassen3434/pick_pen_v2_20260920_124400` durante 10.000 pasos con batch de 64 (aproximadamente 24 épocas) y una tasa de aprendizaje de 5e-5 con decaimiento coseno, partiendo del checkpoint base de LeRobot. El autor reporta una pérdida final de 0,022 tras 2 horas y 41 minutos de entrenamiento en una única A100-80GB.

Su relevancia es la de un caso de estudio reproducible de ajuste fino de un VLA pequeño (450 M) para manipulación condicionada por lenguaje en hardware de bajo coste, dentro del ecosistema LeRobot. No es un modelo de propósito general: es un artefacto de investigación ligado a un montaje físico, un dataset y una tarea específicos, sin benchmarks ni evaluaciones de tasa de éxito publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (modelo visión-lenguaje-acción); incluye codificador de visión y módulo experto de acciones según la model card. Detalle de capas no disponible |
| Parámetros totales | 450.046.176 (≈450 M), dato real de los safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje de texto; la condición es una instrucción corta en inglés) |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible; las instrucciones de entrenamiento están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,9 GB) |
| Librería | lerobot |
| Pipeline | robotics |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | bklassen3434/pick_pen_v2_20260920_124400 |
| Cámaras | observation.images.top y observation.images.wrist, remapeadas en entrenamiento a observation.images.camera1 y observation.images.camera2 |
| Fecha de creación | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base` y conserva su arquitectura VLA: un codificador de visión que procesa las dos cámaras (vista superior y muñeca) y un módulo experto que genera las acciones del robot, condicionado por la instrucción de lenguaje. La model card del ajuste menciona explícitamente ambos componentes y los hiperparámetros `freeze_vision_encoder=false` y `train_expert_only=false`, lo que indica que durante este ajuste se actualizaron tanto el codificador visual como el experto de acciones, en lugar de congelar la parte visual. No se detalla en la información proporcionada el número de capas, la dimensión oculta ni el mecanismo exacto de generación de acciones.

El entrenamiento se realizó sobre un dataset de teleoperación propio con un SO-101, con 10.000 pasos, batch de 64 (≈24 épocas), tasa de aprendizaje 5e-5 con decaimiento coseno a lo largo de los 10.000 pasos, en 1 GPU A100-80GB (Modal) durante 2 h 41 min, alcanzando una pérdida final de 0,022. No se documenta en la información disponible si hubo RLHF, DPO u otras etapas de alineamiento, ni la composición exacta del dataset más allá de que en todos los episodios están presentes los tres bolígrafos y de que las cámaras se graban con las claves `top` y `wrist`. Un detalle operativo crítico del diseño: el `rename_map` que traduce las claves de cámara del dataset a las claves internas de SmolVLA debe aplicarse también en inferencia; si se omite, el modelo recibe las entradas por canales distintos a los del entrenamiento.

## Capacidades

- Generación de acciones de manipulación condicionadas por lenguaje: convierte una instrucción corta en inglés ("Pick up the blue pen", "Pick up the pink pen", "Pick up the grey pen") en una secuencia de comandos para el brazo SO-101.
- Discriminación visual entre tres objetos del mismo tipo pero distinto color, presentes simultáneamente en la escena.
- Fusión de dos vistas de cámara (superior y de muñeca) para localizar y aproximar la pinza al objeto.
- Control de extremo a extremo: no requiere planificador simbólico ni detección de objetos externa, la política va de píxeles e instrucción a acciones.
- Ajuste fino sobre el dataset propio, lo que permite reentrenarlo con `lerobot` sobre nuevos datasets sin partir de cero.
- Integración con el ecosistema LeRobot para rollout y grabación (`lerobot-rollout`, `lerobot-record`).
- No dispone de tool calling, function calling, razonamiento multi-paso agéntico, visión de propósito general ni capacidades multilingües documentadas: no es un modelo de lenguaje conversacional.

## Casos de uso

- Selección de piezas por color o referencia en una célula de montaje: el modelo recibe una instrucción textual y recoge el objeto indicado entre varios presentes, lo que sirve como prueba de concepto de picking guiado por lenguaje en líneas con referencias similares.
- Kitting y preparación de pedidos de objetos pequeños: con dos cámaras y una política de 450 M, puede desplegarse en estaciones donde el operario dicta qué referencia coger, usando el color o el identificador como condición.
- Base para transferencia a nuevas tareas de picking: al ser un ajuste fino de `lerobot/smolvla_base` con el codificador visual descongelado, es un punto de partida razonable para reentrenar con un dataset propio de otra familia de objetos.
- Banco de pruebas para investigación en VLA: permite reproducir un experimento completo (dataset, hiperparámetros, hardware y tiempo de entrenamiento documentados) y comparar configuraciones de tasa de aprendizaje, congelación del codificador o número de épocas.
- Automatización de laboratorio o taller con instrumentos alargados: el mismo esquema (instrucción de lenguaje más dos vistas) es aplicable a la recogida de herramientas o utensilios previamente etiquetados por el operario.
- Demostración docente con SO-101 y LeRobot: el modelo ilustra el ciclo completo de teleoperación, grabación de dataset, ajuste fino y despliegue en un brazo de bajo coste con un único GPU.
- Recogida autónoma de utillaje tras una operación: el modelo puede reincorporar el objeto a su posición habitual cuando el operario emite la instrucción correspondiente, reduciendo microinterrupciones.
- Evaluación de robustez de políticas VLA pequeñas: sirve para medir cómo degrada una política de 450 M ante cambios de iluminación, posición de cámara o disposición de objetos, dado que no se publican tasas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento:

| Métrica | Valor |
|---|---|
| Pasos de entrenamiento | 10.000 |
| Batch size | 64 |
| Épocas aproximadas | 24 |
| Tasa de aprendizaje | 5e-5 (decaimiento coseno) |
| Pérdida final | 0,022 |
| Hardware de entrenamiento | 1x A100-80GB (Modal) |
| Tiempo de entrenamiento | 2 h 41 min |
| Tasa de éxito en tarea real | no disponible |
| Comparación con modelos similares | no disponible |

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 0,84 GB en bf16/fp16 y 1,80 GB en fp32, calculado a partir de los 450.046.176 parámetros. Es una estimación aritmética, no un dato publicado.
- VRAM de inferencia: no hay cifras publicadas. Además del peso de los parámetros, la inferencia consume memoria para las activaciones del codificador de visión (dos cámaras) y del experto de acciones, por lo que el total depende de la resolución de imagen, el batch y el backend.
- GPU de consumo: por tamaño de parámetros, la inferencia es viable en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). No se dispone de mediciones verificadas de consumo real.
- GPU de entrenamiento: el autor usó una A100-80GB con batch 64 y codificador visual descongelado. Un reentrenamiento con batch menor es plausible en GPUs con más de 24 GB (RTX 3090, RTX 4090, A6000), aunque no está documentado.
- Opciones de despliegue: librería `lerobot` sobre PyTorch, con `lerobot-rollout` y `lerobot-record` para ejecución y grabación. Es imprescindible pasar el mismo `rename_map` de las claves de cámara que en entrenamiento.
- Backends no aplicables: vLLM, llama.cpp, Ollama o TGI están orientados a modelos de lenguaje de texto y no se documentan como soportados para este modelo de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Solo se dispone de datos verificables del modelo base del que deriva. Las alternativas de la misma categoría (políticas VLA para manipulación) no aparecen con especificaciones en la información proporcionada.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bklassen3434/smolvla_pick_pen_v2_lr5e5 | 450 M | no disponible | sin benchmarks; pérdida final de entrenamiento 0,022 | Apache 2.0 | HuggingFace, 0 descargas |
| lerobot/smolvla_base | 450 M (modelo base del anterior) | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace |
| Otras políticas VLA (OpenVLA, pi0, ACT, entre otras) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Alcance mínimo: entrenado para una única tarea (recoger uno de tres bolígrafos) con un único robot SO-101, un montaje de dos cámaras y un único dataset. La generalización a otros objetos, entornos o instrucciones no está demostrada.
- Riesgo alto de sobreajuste al entorno: cambios de iluminación, fondo, posición de cámara, altura de la mesa o disposición de los objetos pueden degradar el comportamiento sin aviso.
- Dependencia del `rename_map`: si en evaluación no se remapean `observation.images.top` y `observation.images.wrist` a `observation.images.camera1` y `observation.images.camera2`, las entradas llegan por canales distintos a los del entrenamiento y el resultado no es válido.
- Idiomas: las instrucciones del dataset están en inglés; no hay soporte multilingüe documentado ni evaluación en castellano.
- Ausencia de evaluación: no hay tasa de éxito, matriz de confusión por color ni pruebas en entornos no vistos. La pérdida de 0,022 es una métrica de ajuste, no una medida de rendimiento en tarea.
- Fallos de grounding: un VLA puede ejecutar una acción coherente pero sobre el objeto equivocado; en producción esto implica necesidad de verificación externa (sensores, cámaras de control o confirmación humana).
- Licencia Apache 2.0: permite uso comercial del artefacto, pero conviene verificar por separado las condiciones del modelo base `lerobot/smolvla_base` y del dataset `bklassen3434/pick_pen_v2_20260920_124400`, así como los derechos sobre los datos de teleoperación.
- Seguridad física: no se documentan límites de fuerza, velocidad ni parada de emergencia. Cualquier despliegue con un brazo real debe incorporar límites hardware y supervisión.
- Madurez: 0 descargas y 0 likes, sin validación independiente por parte de la comunidad; el repositorio se creó el 2026-09-20 y se actualizó el mismo día.
- Sesgos: no evaluados ni documentados. Al depender de un dataset de teleoperación concreto, hereda la distribución de posiciones, colores y estilos de demostración del operador que lo grabó.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bklassen3434/smolvla_pick_pen_v2_lr5e5
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/bklassen3434/pick_pen_v2_20260920_124400
- La búsqueda web realizada no ha devuelto enlaces relevantes (los resultados obtenidos corresponden a YouTube y a la letra "Y" en Wikipedia), por lo que no se pueden añadir papers, blogs ni repositorios adicionales.
