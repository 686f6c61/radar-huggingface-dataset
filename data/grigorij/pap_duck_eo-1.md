# Grigorij/PaP_duck_eo-1

## Resumen

El modelo Grigorij/PaP_duck_eo-1 es una política de control robótico basada en EO-1, un modelo fundacional de visión-lenguaje-acción (VLA) desarrollado por EO-Robotics. EO-1 combina un backbone Qwen2.5-VL para comprensión visual y lingüística con una cabeza de acción de flujo continuo (flow-matching) que denoisa secuencias de acciones. Este checkpoint concreto ha sido entrenado por el usuario Grigorij mediante el framework LeRobot para ejecutar la tarea específica de colocar un pato en un cuenco sobre un robot tipo `so_follower`, utilizando dos cámaras (frontal y de brazo). Con aproximadamente 3,77 mil millones de parámetros, el modelo demuestra la aplicación práctica de EO-1 en un escenario de manipulación real, y su relevancia radica en servir como ejemplo reproducible de entrenamiento y despliegue de políticas VLA de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer unificado con decodificacion autoregresiva discreta (vision-lenguaje) y cabeza de accion de flow-matching continuo |
| Parametros totales | 3.771.607.072 (~3,77B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (el backbone Qwen2.5-VL es multilingue, pero no se especifican idiomas para este checkpoint) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

EO-1 emplea un único transformer decoder-only que integra dos mecanismos de generación: decodificación autoregresiva discreta para el razonamiento multimodal (percepción, planificación) y denoising de flujo continuo (flow-matching) para la generación de acciones. Esta combinación permite que el modelo procese entradas interleaved de visión, texto y acción durante el preentrenamiento, y luego se adapte a tareas de control específicas mediante fine-tuning. En este caso, el modelo ha sido entrenado con LeRobot (versión 0.6.2) sobre el dataset `Grigorij/PaP_duck`, que contiene 32 episodios (16.288 fotogramas a 30 FPS) de la tarea "Put duck to the bowl". La configuración de entrenamiento incluye 20.000 pasos, batch size de 16, optimizador AdamW con learning rate de 1e-4 y semilla 1000. No se menciona el uso de RLHF ni otras técnicas de alineación adicionales.

## Capacidades

- Control robótico de baja dimensión: genera acciones continuas de 6 grados de libertad (posición del efector final) a partir de observaciones de estado y dos cámaras RGB (480x640).
- Percepción visual multimodal: procesa simultáneamente imágenes de cámara frontal y de brazo, junto con el estado del robot.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica mediante una descripción textual ("Put duck to the bowl").
- Generación de acciones mediante flow-matching: produce secuencias de acciones denoizadas de forma continua, adecuadas para control suave.
- Aprendizaje por imitación: el modelo aprende directamente de demostraciones humanas teleoperadas, sin necesidad de ingeniería de recompensas.
- Integración con el ecosistema LeRobot: permite entrenar, evaluar y desplegar políticas de forma estandarizada.

## Casos de uso

- Manipulación de objetos en entornos controlados: el modelo puede ejecutar tareas de pick-and-place simples, como colocar un objeto en una ubicación determinada, en configuraciones de laboratorio o demostraciones.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas VLA a nuevas tareas o la influencia del tamaño del dataset en el rendimiento.
- Prototipado rápido de políticas robóticas: gracias a su integración con LeRobot, permite validar hipótesis de control en pocas horas con hardware de bajo coste (robot `so_follower`).
- Evaluación de modelos fundacionales VLA: este checkpoint puede utilizarse para comparar el comportamiento de EO-1 frente a otros modelos (p. ej., OpenVLA) en una tarea estandarizada.
- Automatización de tareas repetitivas en líneas de demostración: en entornos educativos o ferias tecnológicas, el modelo puede operar de forma autónoma durante períodos cortos.
- Desarrollo de sistemas de teleoperación asistida: las predicciones de acción pueden combinarse con control humano para mejorar la precisión o la seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: con 3,77B parámetros, en precisión bf16 se requieren aproximadamente 7,5 GB de memoria para los pesos, más overhead de activaciones y optimizadores durante el entrenamiento. Para inferencia, una GPU con al menos 12 GB es recomendable; con cuantización (no publicada) podría reducirse, pero no hay datos oficiales.
- GPU recomendadas: tarjetas con 24 GB de VRAM (RTX 3090, RTX 4090, A5000) son adecuadas para entrenamiento; para inferencia, una RTX 3060 de 12 GB podría ser suficiente, aunque no está verificado.
- Compatibilidad con GPUs de consumo: sí, es probable que quepa en GPUs de gama alta para consumidores, pero sin datos de rendimiento reales no se puede confirmar.
- Opciones de despliegue: el modelo se ejecuta a través del framework LeRobot, que proporciona scripts de rollout (`lerobot-rollout`) y soporta hardware robótico real. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia generales.
- Latencia y throughput: no disponibles. El rendimiento dependerá del hardware y de la longitud de la secuencia de acciones generadas.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos para este checkpoint. En términos de arquitectura, EO-1 comparte categoría con otros modelos VLA como OpenVLA (7B, basado en Llama 2) o RT-2 (55B, de Google), pero este modelo es un fine-tuning de tamaño medio (3,77B) orientado a una tarea concreta. La licencia MIT y el uso de LeRobot lo distinguen de alternativas propietarias. Sin resultados de evaluación, no es posible establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (32 episodios), lo que limita la generalización a variaciones de la tarea, posiciones de objetos o condiciones de iluminación no vistas.
- Sin resultados de evaluación reportados: no se ha verificado la tasa de éxito en el robot real, por lo que el rendimiento esperado es incierto.
- Dependencia del hardware específico: el modelo espera dos cámaras con nombres y resoluciones concretas (`front` y `arm`), y un robot tipo `so_follower`. Cambios en el hardware requieren reentrenamiento.
- Riesgo de alucinación o acciones erróneas: al ser un modelo generativo, puede producir acciones incoherentes si la entrada difiere del dominio de entrenamiento.
- Idiomas no especificados: aunque el backbone soporta multilingüismo, la instrucción de la tarea está en inglés y no se garantiza el rendimiento en otros idiomas.
- Licencia MIT permite uso comercial, pero el modelo base EO-1 puede tener términos adicionales; se recomienda revisar la documentación del proyecto EO-1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grigorij/PaP_duck_eo-1
- Dataset de entrenamiento: https://huggingface.co/datasets/Grigorij/PaP_duck
- Paper de EO-1 (arXiv): https://arxiv.org/abs/2508.21112
- Versión HTML del paper: https://arxiv.org/html/2508.21112v3
- Repositorio GitHub de EO-1: https://github.com/EO-Robotics/EO1
- Framework LeRobot: https://github.com/huggingface/lerobot
