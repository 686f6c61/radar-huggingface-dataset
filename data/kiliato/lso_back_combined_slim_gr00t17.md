# kiliato/lso_back_combined_slim_GR00T17

## Resumen

El modelo `kiliato/lso_back_combined_slim_GR00T17` es una política robótica de imitación basada en el framework GR00T N1.7 de NVIDIA, entrenada y publicada mediante la librería LeRobot de Hugging Face. Desarrollado por el usuario kiliato, el modelo está especializado en la tarea de encender un interruptor de luz ("Turn on the lightswitch") a partir de observaciones visuales y de propriocepción. Utiliza un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL combinado con un transformer de acciones con flow-matching, lo que le permite predecir comandos de actuación de forma condicionada a la entrada multimodal.

Con aproximadamente 3.144 millones de parámetros (3,14B), el modelo se distribuye en formato safetensors y está licenciado bajo Apache 2.0, lo que facilita su uso comercial y su integración en proyectos de robótica. Su relevancia radica en ser un ejemplo práctico de aplicación de modelos fundacionales de robótica de código abierto a tareas de manipulación reales, demostrando el flujo completo de entrenamiento y despliegue con LeRobot. No se especifica la longitud de contexto ni los idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + flow-matching action transformer) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional de robótica de código abierto diseñado para razonamiento y habilidades en robots humanoides. Emplea un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa imágenes y texto, y un transformer de acciones con flow-matching que genera comandos de actuación condicionados a la observación visual, el lenguaje y la propriocepción. La política consume una imagen de cámara (720x720 píxeles) y un vector de estado de 14 dimensiones, y produce una acción de 7 dimensiones.

El entrenamiento se realizó con el dataset `kiliato/lso_back_combined_slim`, que contiene 70 episodios y 70.033 frames a 50 FPS, todos etiquetados con la tarea "Turn on the lightswitch". La configuración de entrenamiento incluye 20.000 pasos, batch size de 32, optimizador AdamW con learning rate de 0,0001 y semilla 42, utilizando la versión 0.6.2 de LeRobot. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un entrenamiento de imitación supervisada.

## Capacidades

- Control robótico de manipulación: predice acciones de 7 grados de libertad a partir de observaciones visuales y de estado.
- Aprendizaje por imitación: entrenado para replicar demostraciones humanas en la tarea específica de encender un interruptor.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Procesamiento multimodal: combina visión (imagen de cámara) y propriocepción (estado del robot) para la toma de decisiones.
- Soporte de lenguaje (implícito): el backbone Qwen3-VL permite condicionamiento por instrucciones textuales, aunque no se detalla su uso en este modelo.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Automatización de tareas domésticas: el modelo puede controlar un brazo robótico para encender interruptores de luz, una tarea común en entornos domésticos y de oficina.
- Investigación en robótica de imitación: sirve como punto de partida para estudiar el comportamiento de políticas GR00T en tareas de manipulación con pocas demostraciones.
- Desarrollo de políticas personalizadas: los usuarios pueden reentrenar el modelo con sus propios datos usando LeRobot, adaptándolo a nuevas tareas o entornos.
- Evaluación de hardware robótico: permite probar la capacidad de un robot para ejecutar acciones precisas en un escenario controlado.
- Benchmarking de modelos de robótica: al ser de código abierto y con licencia permisiva, puede utilizarse como referencia comparativa frente a otras políticas.
- Demostraciones educativas: útil en cursos de robótica y aprendizaje por refuerzo para ilustrar el flujo completo de entrenamiento y despliegue de una política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas de éxito, tasa de acierto ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~3,14B parámetros, en FP16 se requieren aproximadamente 6,3 GB de VRAM solo para los pesos, más overhead de activaciones y optimizador. Una GPU con al menos 8 GB de VRAM sería necesaria para inferencia básica.
- GPU recomendadas: tarjetas de gama media-alta como RTX 3060/4060 (12 GB) o superiores, o GPUs de datacenter como A10, A100 o H100 para mayor throughput.
- Compatibilidad con consumer GPU: sí, es factible en GPUs de consumo con 8-12 GB de VRAM, aunque el rendimiento dependerá de la resolución de imagen (720x720) y la frecuencia de inferencia.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) para ejecutar la política en robots reales. También puede integrarse con frameworks como ROS o controladores propietarios.
- Latencia y throughput: no se dispone de datos oficiales. La latencia dependerá del hardware y de la optimización del modelo (cuantización, TensorRT, etc.).

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de robótica (como ACT, Diffusion Policy o versiones anteriores de GR00T). El modelo es una instancia específica de GR00T N1.7 entrenada para una tarea concreta, y no se han publicado métricas comparativas. Se recomienda consultar la documentación de NVIDIA Isaac-GR00T para conocer las capacidades generales de la arquitectura base.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado únicamente para la tarea "Turn on the lightswitch" con un dataset de 70 episodios; no es generalizable a otras tareas sin reentrenamiento.
- Dependencia de la configuración de cámaras: la política espera una imagen de cámara denominada `right` con resolución 720x720; cambios en la posición, orientación o calibración de la cámara pueden degradar el rendimiento.
- Riesgo de sobreajuste: con solo 70 episodios, el modelo puede memorizar las demostraciones y fallar ante variaciones del entorno (iluminación, posición del interruptor, etc.).
- Sin evaluación reportada: no hay resultados de éxito en robot real, por lo que su fiabilidad en producción no está verificada.
- Sesgos y alucinaciones: al ser un modelo de visión-lenguaje, puede presentar alucinaciones en la interpretación de la escena, aunque su impacto en la acción robótica no está cuantificado.
- Licencia: Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente y no se ofrece garantía de funcionamiento.
- Requisitos de hardware: aunque es ejecutable en GPUs de consumo, la inferencia en tiempo real puede requerir optimizaciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiliato/lso_back_combined_slim_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/kiliato/lso_back_combined_slim
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kiliato/lso_back_combined_slim
