# JiachenSu/koch11_pick_place_act_home_v11

## Resumen

`JiachenSu/koch11_pick_place_act_home_v11` es una política de control visuomotor entrenada con Diffusion Policy (Chi et al., 2023) y publicada en Hugging Face mediante LeRobot. No es un modelo de lenguaje: es un modelo de robótica que convierte observaciones sensoriales (una imagen de cámara frontal y el estado articular) en comandos de acción para un brazo robótico `koch_follower` de 6 grados de libertad. El repositorio ocupa 1,1 GB y contiene 262.962.942 parámetros en formato safetensors.

El modelo resuelve una tarea de manipulación muy concreta: "Pick up the red cube and place it in the tray" (coger el cubo rojo y dejarlo en la bandeja). Se entrenó sobre el dataset `JiachenSu/koch11_pick_place_home_v1_cleaned`, que contiene únicamente 18 episodios y 7515 fotogramas grabados a 30 FPS, lo que equivale a unos 4 minutos y 10 segundos de demostraciones reales. El autor lo publica como `model_name: diffusion`, aunque el identificador del repositorio incluye el sufijo `act`, lo que puede inducir a confusión.

Su relevancia es la de un artefacto reproducible de aprendizaje por imitación: sigue el flujo estándar de LeRobot (grabar datos, entrenar, desplegar con `lerobot-rollout`), está bajo licencia Apache 2.0 y sirve como punto de partida para experimentos de manipulación con contacto o como referencia interna para validar una cadena hardware-software completa. No cuenta con descargas ni valoraciones en el momento de redactar esta ficha y no se han publicado resultados de evaluación.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (proceso generativo de difusión condicionado para control visuomotor); implementación de LeRobot 0.6.1 |
| Parámetros totales | 262.962.942 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; el modelo no tiene ventana de contexto textual. Observación por paso: imagen frontal de 3×480×640 y vector de estado de 6 dimensiones. Horizonte de predicción de acciones (action chunk) no especificado en la model card |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors (1,1 GB, coherente con precisión de 32 bits) |
| Idiomas soportados | No aplica (modelo de robótica, no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, formulación que trata el control visuomotor como un proceso generativo de difusión. En lugar de predecir una acción única de forma directa, el modelo aprende a invertir un proceso de ruido para producir secuencias de acciones suaves y multimodales, lo que resulta especialmente útil en tareas de manipulación con contacto rico, donde una política determinista tiende a promediar modos de comportamiento incompatibles. La model card no detalla la topología interna exacta (codificador visual, tipo de red de denoising, número de pasos de difusión ni dimensionalidad del espacio latente), por lo que esos datos deben considerarse no disponibles.

Las entradas son `observation.state`, un vector de 6 dimensiones, y `observation.images.front`, una imagen RGB de 3×480×640. La salida es `action`, un vector de 6 dimensiones. El entrenamiento se realizó con los siguientes hiperparámetros declarados por el autor: 100.000 pasos, tamaño de lote 32, optimizador Adam, tasa de aprendizaje 0,0001 y semilla 1000, sobre LeRobot 0.6.1. El conjunto de entrenamiento consta de 18 episodios, 7515 fotogramas a 30 FPS y una única tarea. No se documenta el uso de RLHF, DPO ni ninguna etapa de ajuste posterior al entrenamiento por imitación, ni se mencionan innovaciones técnicas adicionales más allá del propio método de difusión.

## Capacidades

- Generación de trayectorias de acción multi-paso (action chunking) de 6 dimensiones, correspondientes a las articulaciones del robot `koch_follower`.
- Control visuomotor condicionado por imagen: consume la cámara `front` a resolución 480×640 y el estado articular de 6 dimensiones.
- Ejecución de la tarea de pick-and-place "coger el cubo rojo y dejarlo en la bandeja".
- Manipulación con contacto, escenario para el que el enfoque de difusión está específicamente diseñado.
- Despliegue mediante `lerobot-rollout` con la estrategia `base`, con duración de ejecución configurable.
- Reentrenamiento y ajuste fino con `lerobot-train` sobre datasets propios en formato LeRobot.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso simbólico.
- No dispone de capacidades multilingües, de generación de texto, de código, de matemáticas, de visión general ni de audio.

## Casos de uso

- Pick-and-place en banco de pruebas: ejecutar `lerobot-rollout` con `--task="Pick up the red cube and place it in the tray"` sobre un `koch_follower` calibrado para reproducir la tarea nominal del dataset de entrenamiento, verificando la cadena completa de percepción, inferencia y actuación.
- Base para ajuste fino con datos propios: partir de estos 262,9 M de parámetros y reentrenar con `--policy.type=diffusion` sobre un dataset ampliado con más posiciones de objeto o iluminación variable, reduciendo el coste frente a entrenar desde cero.
- Referencia interna de aprendizaje por imitación: usar la política como línea base para comparar con una política ACT entrenada sobre el mismo dataset y medir diferencias de suavidad y robustez en la misma tarea.
- Validación de infraestructura robótica: comprobar calibración de cámaras, latencia del bucle de control a 30 FPS y estabilidad del puerto serie antes de invertir en datasets mayores.
- Docencia y divulgación: ejemplo autocontenido de 1,1 GB que ilustra el flujo completo de LeRobot (instalación, hardware, grabación, entrenamiento y despliegue) sin requerir clústeres de GPU.
- Pruebas de robustez controladas: alterar sistemáticamente la posición del cubo, la iluminación o la presencia de distractores para caracterizar la degradación de una política entrenada con pocos episodios.
- Integración como componente de un pipeline mayor: encadenar la política con lógica externa de supervisión (por ejemplo, un detector de objeto que decida cuándo invocarla), dado que el modelo solo produce acciones y no interpreta instrucciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "_No evaluation results have been provided for this policy yet._" No existe, por tanto, tasa de éxito medida en robot real ni comparación cuantitativa con otras políticas.

A modo de contexto reproducible, estos son los hiperparámetros de entrenamiento declarados:

| Ajuste | Valor |
|---|---|
| Pasos de entrenamiento | 100.000 |
| Tamaño de lote | 32 |
| Optimizador | Adam |
| Tasa de aprendizaje | 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Episodios del dataset | 18 |
| Fotogramas del dataset | 7515 |
| Frecuencia de grabación | 30 FPS |

## Requisitos de hardware

- Pesos en el formato publicado (safetensors, 262,9 M de parámetros): aproximadamente 1,05 GB en precisión de 32 bits, coherente con el tamaño de repositorio de 1,1 GB.
- VRAM estimada para inferencia en lote 1: en torno a 2-3 GB contando pesos más activaciones del codificador visual sobre imágenes de 480×640. Es una estimación a partir del recuento de parámetros; el autor no publica cifras de memoria.
- Cabe holgadamente en GPU de consumo: RTX 3050, RTX 3060, RTX 4060, RTX 4090 y equivalentes con 6 GB o más de VRAM. No se confirma compatibilidad con Jetson u otras plataformas embebidas.
- Ejecución en CPU: técnicamente posible con PyTorch, pero el bucle de control de la tarea está grabado a 30 FPS, lo que impone un presupuesto de 33,3 ms por paso; no hay datos publicados que confirmen que se alcance ese ritmo sin GPU.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) sobre PyTorch. No se publican pesos GGUF, ONNX ni TensorRT. vLLM, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La frecuencia de 30 FPS del dataset es un requisito del entorno de grabación, no una medida de rendimiento de la política.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiachenSu/koch11_pick_place_act_home_v11 | Diffusion Policy (LeRobot) | 262.962.942 | Imagen 3×480×640 + estado 6D | Apache 2.0 | Hugging Face, 0 descargas |
| JiachenSu/koch11_pick_place_act_v4_diffusion_v2 | Diffusion Policy (LeRobot) | No disponible | No disponible | No disponible | Hugging Face, repositorio de 1,05 GB |
| Diffusion Policy original (Chi et al., 2023) | Proceso de difusión condicionado para control | No disponible | Depende de la configuración | No disponible | Paper arXiv 2303.04137 y código de referencia |
| ACT / Action Chunking Transformer (Zhao et al., 2023) | Transformer con VAE y action chunking | No disponible | Depende de la configuración | No disponible | Implementado en LeRobot |

La comparación cuantitativa no es posible con la información disponible: no se publican parámetros ni tasas de éxito de las alternativas en las fuentes consultadas. La diferencia cualitativa relevante es que Diffusion Policy modela la distribución de acciones de forma generativa, mientras que ACT predice directamente un bloque de acciones con un transformer, lo que suele traducirse en comportamientos más suaves en tareas de contacto para la primera y en menor coste de inferencia para la segunda.

## Limitaciones y advertencias

- No existe ninguna evaluación publicada: se desconoce la tasa de éxito real de la política en el robot, incluso en la tarea para la que fue entrenada.
- Dataset extremadamente reducido: 18 episodios y 7515 fotogramas (unos 4 minutos y 10 segundos) de una única tarea, un único entorno y una única cámara frontal.
- Riesgo elevado de sobreajuste a las condiciones de grabación: posiciones del objeto, iluminación, fondo, altura de cámara y calibración concretas del robot utilizado por el autor.
- Sensibilidad al hardware: la política está vinculada al tipo de robot `koch_follower` y a los nombres de las claves de observación (`observation.images.front`). Cualquier cambio de cámara, resolución o calibración puede invalidar el comportamiento.
- Ausencia de mecanismos de seguridad: el modelo genera acciones sin verificaciones de colisión, límites articulares ni detección de fallo. En producción debe ejecutarse con paradas de emergencia y supervisión humana.
- En robótica, el equivalente funcional a la alucinación es la deriva fuera de distribución: ante una escena distinta a la de entrenamiento, la política puede producir trayectorias erráticas sin señalizar incertidumbre.
- Inconsistencia de nomenclatura: el identificador del repositorio incluye `act` mientras que la model card declara `model_name: diffusion`. Conviene verificar el tipo de política antes de reutilizarla.
- Sin tracción comunitaria: 0 descargas y 0 valoraciones, por lo que no hay evidencia externa de reproducibilidad.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar avisos de copyright y sin garantía alguna por parte del autor.
- La atribución académica exige citar el método de Diffusion Policy (arXiv 2303.04137) y LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JiachenSu/koch11_pick_place_act_home_v11
- Dataset de entrenamiento: https://huggingface.co/datasets/JiachenSu/koch11_pick_place_home_v1_cleaned
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JiachenSu/koch11_pick_place_home_v1_cleaned
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y despliegue: https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor en Hugging Face: https://huggingface.co/JiachenSu/models
- Otro modelo del mismo autor: https://huggingface.co/JiachenSu/koch11_pick_place_act_v4_diffusion_v2
