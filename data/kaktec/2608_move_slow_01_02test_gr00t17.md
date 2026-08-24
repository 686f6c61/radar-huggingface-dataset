# kaKTEC/2608_move_slow_01_02test_GR00T17

## Resumen

Este modelo es una política de control robótico basada en GR00T N1.7, el modelo fundacional de robótica de NVIDIA para razonamiento y habilidades en robots humanoides. Ha sido entrenado con el framework LeRobot de Hugging Face para ejecutar la tarea específica de transportar un cubo blanco en movimiento, utilizando un robot tipo `so_follower` con dos cámaras (superior y de muñeca). El modelo combina un backbone Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, lo que le permite predecir comandos de acción a partir de observaciones visuales y de estado.

Con 3.144.016.000 parámetros (aproximadamente 3,14 mil millones), el modelo está publicado bajo licencia Apache 2.0 y sus pesos están en formato safetensors. Su relevancia radica en ser un ejemplo práctico de aplicación de un modelo fundacional de robótica de código abierto a una tarea de manipulación concreta, demostrando el flujo de trabajo completo de LeRobot: desde la grabación de datos hasta el entrenamiento y el despliegue en un robot real. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos-Reason2/Qwen3-VL backbone + flow-matching action transformer |
| Parametros totales | 3.144.016.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible (modelo de robótica, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA, que emplea un backbone multimodal Cosmos-Reason2/Qwen3-VL para procesar entradas visuales y de lenguaje, y un transformer de acciones con flow matching para generar comandos de control. En esta implementación concreta, las entradas son dos imágenes de 480x640 píxeles (cámara superior y cámara de muñeca) y un vector de estado de 6 dimensiones (propriocepción). La salida es un vector de acción de 6 dimensiones que controla el efector del robot.

El entrenamiento se realizó con el dataset `kaKTEC/2608_move_slow_01_02test_20260820_150254`, que contiene 60 episodios y 28.665 fotogramas a 30 FPS, todos etiquetados con la tarea "Carrying a Moving White Cube". Se usaron 60.000 pasos de entrenamiento con un tamaño de lote de 64, optimizador AdamW y una tasa de aprendizaje de 0,0001. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al aprendizaje supervisado por imitación.

## Capacidades

- Control robótico de un robot tipo `so_follower` para tareas de manipulación.
- Procesamiento de imágenes de dos cámaras (superior y de muñeca) a resolución 480x640.
- Predicción de acciones de 6 dimensiones (posición y orientación del efector) a partir de observaciones visuales y de estado.
- Ejecución de la tarea específica de transportar un cubo blanco en movimiento, aprendida por imitación.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Automatización de líneas de producción: el modelo puede controlar un brazo robótico para recoger y transportar objetos que se desplazan por una cinta transportadora, gracias a su entrenamiento con objetos en movimiento.
- Manipulación de objetos en entornos dinámicos: su capacidad para seguir un cubo en movimiento lo hace adecuado para tareas de pick-and-place en entornos donde los objetos no están estáticos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los modelos fundacionales de robótica se adaptan a tareas específicas con pocos datos (60 episodios).
- Desarrollo de robots humanoides: al estar basado en GR00T N1.7, puede servir como base para experimentar con control de robots bimanuales o con otras configuraciones de cámaras.
- Prototipado rápido de políticas robóticas: con LeRobot, se puede entrenar y desplegar en un robot real en pocos pasos, lo que facilita la validación de conceptos en laboratorio.
- Educación y formación en robótica: el modelo y su dataset asociado permiten a estudiantes y desarrolladores practicar el flujo completo de entrenamiento de políticas robóticas con herramientas de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 3.144.016.000 parámetros. Si los pesos están en FP32 (12,6 GB en el repositorio), se necesitan al menos 16 GB de VRAM para cargar el modelo completo. Con cuantización a BF16, la memoria se reduciría a aproximadamente 6,3 GB, pero no se dispone de versiones cuantizadas.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o una A100 (40 GB) serían suficientes para inferencia. Para entrenamiento, se recomienda una GPU con al menos 24 GB de VRAM.
- No se ha confirmado que el modelo funcione en GPUs de consumo de gama baja (por ejemplo, RTX 3060 de 12 GB) debido al tamaño de los pesos.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que utiliza PyTorch y CUDA. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Es una política específica para una tarea robótica concreta, entrenada sobre GR00T N1.7, y no se han publicado comparaciones con otros modelos de robótica como OpenVLA, RT-2 o Diffusion Policy en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Carrying a Moving White Cube" y no generaliza a otras tareas sin un nuevo entrenamiento.
- Depende de la configuración exacta de cámaras (superior y de muñeca) y del robot `so_follower`; cualquier cambio en la disposición de los sensores puede degradar el rendimiento.
- No se han reportado resultados de evaluación en el robot real, por lo que su rendimiento efectivo es desconocido.
- El dataset de entrenamiento es pequeño (60 episodios), lo que aumenta el riesgo de sobreajuste y limita la robustez ante variaciones en iluminación, posición de objetos o distracciones.
- No procesa lenguaje natural ni instrucciones de usuario; la tarea está fijada en el momento del entrenamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es específico de una tarea y no constituye una solución general de robótica.
- No se proporcionan versiones cuantizadas ni formatos alternativos a safetensors, lo que puede limitar su despliegue en hardware con poca memoria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kaKTEC/2608_move_slow_01_02test_GR00T17)
- [Dataset de entrenamiento](https://huggingface.co/datasets/kaKTEC/2608_move_slow_01_02test_20260820_150254)
- [Documentación de LeRobot sobre GR00T](https://huggingface.co/docs/lerobot/main/en/groot)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Repositorio Isaac-GR00T de NVIDIA](https://github.com/NVIDIA/Isaac-GR00T)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=kaKTEC/2608_move_slow_01_02test_20260820_150254)
