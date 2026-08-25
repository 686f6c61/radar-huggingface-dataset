# CarolinePascal/act_tactile_grabette

## Resumen

`act_tactile_grabette` es un modelo de control robótico basado en la técnica Action Chunking with Transformers (ACT), entrenado con el framework LeRobot por CarolinePascal. Resuelve la tarea de recoger un cubo blanco y colocarlo en la taza correcta utilizando el robot manipulador `grabette`. El modelo combina percepción visual (cámara derecha), dos sensores táctiles y el estado del robot para predecir acciones de control en el espacio cartesiano.

Con 55.012.747 parámetros, es un modelo compacto que puede ejecutarse en hardware de bajo coste. La arquitectura ACT predice bloques de acciones (action chunks) de varios pasos en lugar de acciones individuales, lo que mejora la estabilidad y la precisión en tareas de manipulación. Está publicado bajo licencia Apache 2.0, lo que permite su uso comercial y modificación sin restricciones.

El modelo se entrenó con 48 episodios teleoperados (19.353 fotogramas a 50 FPS) y no se han publicado resultados de evaluación en hardware real, lo que limita las conclusiones sobre su rendimiento en entornos no controlados. Es relevante por su integración de señales táctiles, un área crítica en robótica asistencial y manufactura de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Transformer encoder-decoder con CVAE) |
| Parametros totales | 55.012.747 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo robótico; predice bloques de acciones de tamaño no documentado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion documentada) |
| Idiomas soportados | no aplica (modelo de control robótico, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación propuesto por Zhao et al. en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La arquitectura combina un transformer encoder-decoder con un auto-encoder variacional condicional (CVAE) que modela la variabilidad entre las demostraciones. El modelo predice bloques de acciones de múltiples pasos (action chunks) en lugar de acciones individuales, lo que reduce el error acumulado y mejora la estabilidad del control.

El entrenamiento se realizó con 48 episodios teleoperados (19.353 fotogramas a 50 FPS, aproximadamente 6,5 minutos de datos) procedentes del dataset `CarolinePascal/grabette-tactile-full-synced_cartesian_480_fixedstats`. La tarea es "Pick up the white cube and put it in the correct cup". Se usaron el optimizador AdamW con learning rate 5e-5, batch size 64, y 30.000 pasos de entrenamiento con semilla 1000. No se documenta el uso de RLHF, DPO ni otros ajustes posteriores; el entrenamiento es puramente de clonación de comportamiento.

Las entradas del modelo son: imagen de la cámara derecha (3, 360, 480), dos sensores táctiles de dimensiones (6, 6) y (4, 8), y un vector de estado del robot de dimensión 2. La salida es un vector de acción de dimensión 11, que corresponde a comandos de control cartesiano del efector.

## Capacidades

- Manipulación robótica de precisión: control del robot `grabette` para tareas de pick-and-place.
- Percepción multimodal: integra visión (cámara derecha) y sensorial táctil (dos sensores) en la observación.
- Predicción de acciones por bloques: genera secuencias de acciones de varios pasos, mejorando la estabilidad del control.
- Control cartesiano: la salida de 11 dimensiones corresponde a comandos de posición/orientación en el espacio cartesiano.
- Entrenamiento por imitación: puede replicar comportamientos teleoperados con alta fidelidad.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.

## Casos de uso

- **Automatización de pick-and-place en almacenes**: el modelo puede integrarse en un brazo robótico `grabette` para recoger productos de una cinta transportadora y colocarlos en contenedores. La percepción táctil permite manejar objetos frágiles con control de fuerza.

- **Investigación en aprendizaje por imitación con feedback táctil**: el modelo sirve como punto de partida para estudiar cómo las señales táctiles mejoran la precisión en tareas de manipulación fina comparado con modelos que solo usan visión.

- **Prototipado rápido de controladores robóticos**: con LeRobot, se puede cargar el modelo y ejecutarlo en un robot real con el comando `lerobot-rollout`, validando la arquitectura en horas en lugar de semanas.

- **Control de robots asistenciales en el hogar**: el modelo puede adaptarse para tareas como recoger objetos pequeños (medicamentos, herramientas) y colocarlos en ubicaciones específicas, utilizando la percepción táctil para evitar dañar los objetos.

- **Benchmarking de métodos de control**: como punto de referencia para comparar nuevas arquitecturas de acción chunking o técnicas de fusión de sensores táctiles en manipulación robótica.

- **Formación en robótica de bajo coste**: el modelo es adecuado para laboratorios académicos y programas de formación que dispongan de un robot `grabette` y quieran experimentar con aprendizaje por imitación sin invertir en hardware de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explicitamente: "No evaluation results have been provided for this policy yet". No se dispone de datos sobre tasa de éxito, latencia ni comparación con otros modelos en la tarea.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo ocupa aproximadamente 110 MB en fp16 y 220 MB en fp32. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- **GPU recomendadas**: NVIDIA GTX 1650 o superiores, RTX 3060, RTX 4090, A100, H100. Cualquier GPU moderna con soporte CUDA es suficiente.
- **Inferencia en CPU**: es posible ejecutar el modelo en CPU para pruebas de baja frecuencia, aunque la latencia será mayor.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout`), PyTorch, Hugging Face Hub. No se documenta compatibilidad con vLLM u otros motores de inferencia orientados a LLMs.
- **Latencia**: no disponible. Dado el tamaño del modelo, se estima una latencia inferior a 10 ms por paso en GPU moderna, pero no se ha medido oficialmente.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables publicados con el mismo robot `grabette` y la misma tarea. La autora tiene otros modelos ACT en su perfil de HuggingFace (por ejemplo, `CarolinePascal/act-sugar-cup-cartesian-ep0-66`), pero no se han publicado datos de rendimiento comparativos. A nivel de método, ACT es una técnica consolidada en el ecosistema LeRobot, y este modelo es una instancia específica adaptada a un robot con sensores táctiles.

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| `act_tactile_grabette` | 55 M | no aplica | no evaluado | Apache 2.0 |
| `act-sugar-cup-cartesian-ep0-66` (mismo autor) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Datos de entrenamiento limitados**: solo 48 episodios (unos 6 minutos de datos), lo que puede limitar la generalización a variaciones en la posición de objetos, iluminación o condiciones del entorno.
- **Sin evaluación en hardware real**: no se han publicado resultados de pruebas en el robot físico, por lo que no se conoce la tasa de éxito real.
- **Dependencia del robot específico**: el modelo está entrenado para el robot `grabette` y sus sensores específicos; no es transferible a otros robots sin reentrenamiento.
- **Tarea concreta**: diseñado exclusivamente para "recoger el cubo blanco y colocarlo en la taza correcta", no es un controlador genérico.
- **Riesgo de sobreajuste**: con 55M de parámetros y solo 19.353 fotogramas, existe un riesgo de sobreajuste a las demostraciones de entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario debe verificar la licencia del dataset y del framework LeRobot.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/CarolinePascal/act_tactile_grabette)
- [Dataset de entrenamiento](https://huggingface.co/datasets/CarolinePascal/grabette-tactile-full-synced_cartesian_480_fixedstats)
- [Paper ACT (arXiv:2304.13705)](https://arxiv.org/abs/2304.13705)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Documentacion de LeRobot](https://huggingface.co/docs/lerobot)
- [Visualizacion del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=CarolinePascal/grabette-tactile-full-synced_cartesian_480_fixedstats)
