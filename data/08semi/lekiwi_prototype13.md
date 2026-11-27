# 08semi/lekiwi_prototype13

## Resumen

`08semi/lekiwi_prototype13` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir de dos cámaras (frontal y de muñeca) y del estado de las articulaciones, predice vectores de acción de 9 dimensiones para un robot móvil de tipo `lekiwi_client`. El autor es el usuario 08semi y el repositorio tiene un tamaño de 1,2 GB con 51.674.761 parámetros en formato safetensors.

El modelo resuelve el problema clásico de la manipulación robótica por aprendizaje por imitación: en lugar de predecir una acción por paso, ACT predice trozos (chunks) de acciones futuras, lo que reduce el error de composición y mejora la estabilidad en tareas de contacto. Está entrenado sobre el dataset `08semi/dataset_merged_tika0_4`, con 50 episodios, 16.500 fotogramas a 30 FPS y una única tarea genérica etiquetada como "My task description", lo que indica que es un prototipo de validación más que un sistema listo para producción.

Su relevancia es acotada: es un artefacto de investigación temprana (0 descargas, 0 likes, sin licencia declarada y sin evaluación publicada), útil como referencia de pipeline LeRobot para robots LeKiwi y como ejemplo reproducible de entrenamiento ACT, pero no como componente desplegable en entornos reales sin una validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.674.761 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de la política) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `lekiwi_client` |
| Cámaras de entrada | `front` (3, 480, 640) y `wrist` (3, 640, 480) |
| Entrada de estado | `observation.state` de forma (9,) |
| Salida | `action` de forma (9,) |
| Dataset de entrenamiento | `08semi/dataset_merged_tika0_4` (50 episodios, 16.500 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20.625 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de acciones individuales. La arquitectura combina un codificador visual que procesa las imágenes de las cámaras frontal y de muñeca con un transformer que fusiona esas representaciones con el estado proprioceptivo de 9 dimensiones y genera un chunk de acciones de 9 dimensiones. Este diseño, descrito en el paper arXiv:2304.13705, mitiga el problema de acumulación de errores típico de las políticas paso a paso y permite un control más suave en tareas de manipulación.

El entrenamiento se realizó con LeRobot 0.7.1 durante 20.625 pasos, con batch de 8, AdamW y learning rate de 1e-05, sobre 50 episodios teleoperados (16.500 fotogramas a 30 FPS). No se documenta el número total de tokens ni composición del dataset más allá de esa cifra, ni se indica si hubo aumento de datos, RLHF, DPO o cualquier etapa de refinamiento posterior. La tarea de entrenamiento aparece como "My task description", un marcador de plantilla sin sustituir, lo que sugiere que el prototipo no fue preparado para publicación formal.

## Capacidades

- Control visomotor de un robot móvil LeKiwi a partir de dos cámaras RGB y del estado de las articulaciones.
- Predicción de chunks de acciones de 9 dimensiones, adecuada para control continuo a 30 FPS.
- Aprendizaje por imitación a partir de datos teleoperados; no requiere modelado explícito del entorno.
- Ejecución en bucle cerrado con `lerobot-rollout` sobre hardware real.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".
- No dispone de API de agentes ni de integración con orquestadores LLM.

## Casos de uso

- Prototipado de políticas ACT en robots LeKiwi: sirve como punto de partida reproducible para validar el pipeline `lerobot-train` y `lerobot-rollout` antes de entrenar políticas propias con más datos.
- Recolección de datos teleoperados: el modelo y su dataset asociado permiten estudiar el formato LeRobot (episodios, fotogramas, FPS, claves de observación) y reutilizar la estructura para nuevos experimentos.
- Manipulación de objetos en mesa con cámara de muñeca: la combinación de vista frontal y de muñeca está pensada para tareas de agarre y colocación donde la precisión local importa.
- Investigación en aprendizaje por imitación: permite comparar el comportamiento de ACT frente a otras políticas (Diffusion Policy, VQ-BeT) sobre el mismo dataset y robot.
- Docencia y demostraciones: ejemplo mínimo de política entrenada con LeRobot que se puede ejecutar en un robot de bajo coste con dos cámaras USB.
- Base para fine-tuning: al ser un checkpoint ACT de 51,7 M de parámetros, se puede reentrenar con un dataset mayor y una tarea bien definida para obtener una política específica de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni condiciones de evaluación documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 51,7 M de parámetros en safetensors (≈207 MB en fp32), la inferencia cabe holgadamente en cualquier GPU consumer, pero no se documenta el consumo real.
- GPU recomendadas: no disponible. Por tamaño, una RTX 3060 o superior sería suficiente; el cuello de botella real es el procesamiento de dos streams de vídeo a 30 FPS.
- ¿Cabe en GPU consumer? Sí, por tamaño de parámetros; la model card no confirma requisitos mínimos.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=08semi/lekiwi_prototype13`; entrenamiento con `lerobot-train --policy.type=act`.
- Latencia y throughput: no disponibles. El sistema está pensado para operar a 30 FPS con dos cámaras, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `08semi/lekiwi_prototype13` | ACT (LeRobot) | 51,7 M | no aplica (chunks de acción) | no disponible | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | ACT | del orden de decenas de millones | no aplica | según repo | Hugging Face / GitHub |
| Diffusion Policy | Política por difusión | variable | no aplica | según repo | Repositorios de investigación |
| VQ-BeT | Política discretizada | variable | no aplica | según repo | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, tamaño y disponibilidad.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial; hay que contactar con el autor antes de cualquier despliegue.
- Sin evaluación publicada: no hay tasas de éxito ni condiciones de prueba, por lo que no se puede afirmar que la política funcione fuera del dataset de entrenamiento.
- Tarea etiquetada como "My task description": el campo no fue sustituido, lo que impide saber qué tarea concreta aprendió el modelo.
- Dataset pequeño (50 episodios, 16.500 fotogramas): alta probabilidad de sobreajuste y baja generalización a nuevas posiciones, iluminación u objetos.
- Dependencia fuerte del hardware: solo válido para `lekiwi_client` con cámaras `front` y `wrist` en las resoluciones exactas indicadas; cualquier cambio de calibración o montaje invalida la política.
- Sin información sobre sesgos: al ser un modelo robótico, los sesgos relevantes son de distribución de datos (posiciones, objetos, condiciones de luz), no lingüísticos.
- Riesgo de fallo silencioso: al no haber métricas, un despliegue en producción podría ejecutar acciones incorrectas sin señal de error.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/08semi/lekiwi_prototype13
- Dataset de entrenamiento: https://huggingface.co/datasets/08semi/dataset_merged_tika0_4
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=08semi/dataset_merged_tika0_4
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
