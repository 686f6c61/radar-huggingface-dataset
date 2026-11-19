# googaar/act_sos101_test

## Resumen

`googaar/act_sos101_test` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robótica que mapea observaciones (una imagen de cámara frontal de 480x640 y el estado de las articulaciones de 6 dimensiones) a un chunk de acciones de 6 dimensiones para controlar un robot seguidor de tipo `so_follower` (SO-101). Resuelve la tarea concreta de "poner la pelota roja en la cesta negra".

El modelo tiene 51.668.614 parámetros (unos 51,7 M) y un repositorio de 0,2 GB en formato safetensors. Se entrenó con 52 episodios y 29.867 fotogramas a 30 FPS procedentes del dataset `googaar/lerobot_training_data`, durante 5.000 pasos con batch de 8, optimizador AdamW y learning rate 1e-5.

Su relevancia es acotada: se trata de un checkpoint de prueba (`test` en el identificador) sin resultados de evaluación publicados, sin licencia declarada y con cero descargas. Resulta útil como referencia de formato y flujo de trabajo de LeRobot para políticas ACT, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer condicionado por observaciones que predice chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; consume una observación por paso) |
| Tipos de cuantizacion | No disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | No aplica (modelo de robótica; las tareas se especifican con cadenas de texto en inglés) |
| Licencia | No disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (STATE, shape `(6,)`), `observation.images.front` (VISUAL, shape `(3, 480, 640)`) |
| Salidas | `action` (ACTION, shape `(6,)`) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `front` |
| Libreria | lerobot 0.7.1 |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). En lugar de predecir una acción por paso, el modelo predice un chunk corto de acciones futuras a partir de la observación actual, lo que reduce el error de composición y suaviza el comportamiento en tareas de manipulación de precisión. La arquitectura es un transformer que fusiona el estado propioceptivo y las características visuales de la cámara frontal, y decodifica el chunk de acciones con un decoder autorregresivo; el paper original emplea además una variante de CVAE para modelar la multimodalidad de las demostraciones.

El entrenamiento se realizó con LeRobot 0.7.1 sobre 52 episodios teleoperados (29.867 fotogramas a 30 FPS) del dataset `googaar/lerobot_training_data`, con las tareas "Put red ball in black basket" y "Pick up red ball and place in black basket". La configuración es de 5.000 pasos, batch size 8, AdamW, learning rate 1e-5 y semilla 1000. No se documenta uso de RLHF, DPO ni aumentos de datos; es aprendizaje supervisado puro sobre demostraciones.

## Capacidades

- Control robótico de manipulación: genera comandos de 6 dimensiones para un robot `so_follower` a partir de una imagen frontal y el estado articular.
- Predicción de chunks de acciones: emite secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la estabilidad en tareas de agarre y colocación.
- Ejecución condicionada por tarea: acepta una descripción textual de la tarea (por ejemplo, "Put red ball in black basket") para seleccionar el comportamiento aprendido.
- Percepción visual monocámara: procesa imágenes RGB de 480x640 a 30 FPS.
- Integración con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se reentrena con `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Recogida y colocación de objetos en entornos de laboratorio: el modelo ejecuta la secuencia de coger una pelota roja y dejarla en una cesta negra, adecuado para validar pipelines de imitación con el robot SO-101 antes de escalar a tareas más complejas.
- Prototipado de políticas de imitación: sirve como referencia de configuración de entrenamiento (5.000 pasos, batch 8, lr 1e-5) para comparar curvas de aprendizaje en nuevos datasets.
- Pruebas de integración de LeRobot: permite verificar el flujo `lerobot-rollout` con `--strategy.type=base`, comprobando puertos, cámaras y claves de observación en una instalación nueva.
- Docencia y demostraciones de robótica de bajo coste: la plataforma SO-101 y ACT están pensadas para hardware asequible, lo que facilita prácticas de aprendizaje por imitación en cursos.
- Generación de datos sintéticos de evaluación: al ejecutar la política de forma repetida se pueden recolectar trayectorias para analizar varianza y modos de fallo del controlador.
- Base para fine-tuning en tareas de pick-and-place: el checkpoint puede reentrenarse con `lerobot-train` sobre un dataset propio con la misma topología de observaciones (estado de 6 dimensiones y una cámara frontal).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de éxito en robot real ni métricas de pérdida reportadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parámetros, los pesos ocupan aproximadamente 0,2 GB en fp32; la inferencia cabe holgadamente en cualquier GPU con 2 GB o más, e incluso en CPU para pruebas de baja frecuencia.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100). Para el control en tiempo real a 30 FPS basta una GPU de gama media; una RTX 4090 o A100 no aportan ventaja significativa por el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM; también es viable en CPU, aunque con mayor latencia y posible incumplimiento del ciclo de 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de robótica.
- Latencia y throughput: no disponibles. El modelo está diseñado para operar a 30 FPS (frecuencia del dataset), pero no se publican mediciones de latencia por paso ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `googaar/act_sos101_test` | 51,7 M | Estado (6,) + imagen 480x640 | Pick-and-place SO-101 | No disponible | Hugging Face (0 descargas) |
| ACT original (paper 2304.13705) | No disponible | Estado + imágenes | Manipulación bimanual de bajo coste | No disponible | Paper y código de referencia |
| Políticas LeRobot del Hub (p. ej. ACT/Diffusion Policy entrenadas por la comunidad) | Variable | Variable según robot | Tareas diversas | Variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, entradas y disponibilidad.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "[More Information Needed]", por lo que no se puede asumir permiso para uso comercial ni redistribución.
- Sin evaluación: no hay tasas de éxito en robot real; se desconoce la robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Especialización extrema: entrenado solo para dos variantes de la misma tarea ("Put red ball in black basket" y "Pick up red ball and place in black basket"); no generaliza a otras tareas ni objetos.
- Dependencia de hardware: requiere un robot `so_follower` y una cámara con la clave `observation.images.front`; cualquier desviación en la configuración invalida la política.
- Dataset pequeño: 52 episodios y 29.867 fotogramas son insuficientes para cubrir variabilidad real; riesgo alto de sobreajuste y de fallos ante distribuciones fuera de entrenamiento.
- Riesgo de alucinación en sentido robótico: puede ejecutar acciones plausibles pero incorrectas (agarres fallidos, colisiones) sin señal de incertidumbre.
- Checkpoint de prueba: el sufijo `test` y las cero descargas sugieren que no es un artefacto validado para producción.
- Sin soporte multilingüe ni de texto generativo: no debe emplearse como modelo de lenguaje pese a estar alojado en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/googaar/act_sos101_test
- Dataset de entrenamiento: https://huggingface.co/datasets/googaar/lerobot_training_data
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=googaar/lerobot_training_data
