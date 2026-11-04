# Gueso/tictactoe-v4-final-act-policy

## Resumen

Tic-Tac-Toe v4 Final ACT Policy es una política de manipulación robótica basada en la arquitectura ACT (Action Chunking Transformer) y publicada por el usuario Gueso a través de la librería LeRobot de HuggingFace. El modelo está diseñado para controlar un brazo robótico SO-101 en tareas de colocación de fichas sobre un tablero de tres en raya, aprendiendo por imitación a partir de un conjunto de demostraciones teleoperadas.

El modelo resuelve un problema acotado y muy específico: transformar observaciones multimodales (estado de las articulaciones, tres cámaras RGB y el estado del tablero) en secuencias de posiciones articulares objetivo para ejecutar movimientos de manipulación. Con 51.674.246 parámetros y un backbone visual ResNet-18, es un modelo compacto orientado a inferencia en tiempo real sobre hardware robótico de sobremesa.

Su relevancia es fundamentalmente práctica y demostrativa: sirve como ejemplo reproducible de un pipeline completo de imitation learning con LeRobot, desde la captura del dataset hasta la política entrenada, sobre un robot de bajo coste como el SO-101. No es un modelo de lenguaje ni un modelo generalista, por lo que sus capacidades están estrictamente limitadas al dominio de la tarea entrenada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbone visual ResNet-18 |
| Parámetros totales | 51.674.246 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por chunk de acciones de 100 pasos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La política emplea la arquitectura ACT, un transformer orientado a imitación que predice *chunks* de acciones de longitud 100 en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza la ejecución. El modelo consume tres flujos visuales RGB a resolución 360x640 (cámaras `env`, `wrist` y `realsense` a 480x640), un vector de estado de 6 posiciones articulares y un vector de estado de entorno de 9 valores que codifica las celdas del tablero en orden row-major. La salida es un vector de 6 posiciones articulares objetivo.

El entrenamiento se realizó sobre el dataset `OG7407/tictactoe-v4-final`, compuesto por 108 episodios, 40.855 frames a 30 FPS y 9 tareas distintas, durante 60.000 pasos con batch size 16 sobre una NVIDIA RTX PRO 6000. El autor documenta que el repositorio se publicó inicialmente desde el checkpoint de 20.000 pasos y se actualizó al checkpoint final de 60.000 pasos tras completar el entrenamiento, reanudando desde el checkpoint de 30.000 con estado del optimizador. No se reporta uso de RLHF ni DPO, lo cual es coherente con un pipeline de imitation learning supervisado.

## Capacidades

- Generación de trayectorias de manipulación: predice chunks de 100 acciones de 6 posiciones articulares a partir de observaciones visuales y propioceptivas.
- Percepción visual multimodal: integra tres cámaras RGB (vista de entorno, muñeca y RealSense) para localizar el tablero y las fichas.
- Condicionamiento por estado del tablero: utiliza un vector de 9 celdas para representar la configuración del tres en raya.
- Ejecución de 9 tareas distintas dentro del mismo dominio, correspondientes a las posiciones objetivo del tablero.
- Control de un brazo SO-101 con 6 grados de libertad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Demostración docente de imitation learning: el modelo sirve para ilustrar un pipeline completo de LeRobot, desde la teleoperación y captura del dataset hasta el entrenamiento y despliegue de una política ACT sobre un robot de bajo coste.
- Investigación en manipulación de precisión: permite estudiar cómo un transformer con chunking de acciones maneja tareas de colocación con realimentación visual de tres cámaras.
- Reproducción de experimentos: al estar publicado con licencia Apache 2.0 y pesos safetensors, cualquier laboratorio puede reproducir el entrenamiento y comparar variantes de backbone o de tamaño de chunk.
- Benchmark de políticas sobre SO-101: sirve como línea base para comparar nuevas políticas de imitación en la misma tarea y robot.
- Validación de pipelines de datos robóticos: el dataset asociado (108 episodios, 40.855 frames) permite probar herramientas de curación, aumentación y evaluación de datos de manipulación.
- Prototipado de control por imitación en entornos educativos: adecuado para cursos de robótica que necesiten un caso real, acotado y reproducible de aprendizaje por demostración.
- Prueba de integración con LeRobot: útil para verificar el flujo de carga de políticas, preprocesado de observaciones multimodales y ejecución de chunks de acciones en un robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reporta tasa de éxito en conjunto de validación ni en robot real, y recomienda validar las nueve posiciones objetivo en el robot antes de cualquier uso autónomo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,67 M de parámetros y pesos safetensors en FP32, el modelo ocupa aproximadamente 0,2 GB, por lo que la VRAM necesaria es mínima y está dominada por los buffers de las tres cámaras RGB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para la política; el entrenamiento se realizó en una NVIDIA RTX PRO 6000.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 o superior) e incluso en hardware integrado con suficiente memoria para los flujos de vídeo.
- Opciones de despliegue: librería LeRobot (carga nativa de la política ACT); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del robot, de la frecuencia de captura de las tres cámaras y del chunking de 100 acciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gueso/tictactoe-v4-final-act-policy | ACT + ResNet-18 | 51,67 M | chunk de 100 acciones | Apache 2.0 | HuggingFace (LeRobot) |
| Políticas ACT genéricas de LeRobot | ACT | variable | configurable | según checkpoint | HuggingFace |
| Políticas Diffusion Policy | diffusion | variable | configurable | según checkpoint | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Dominio extremadamente restringido: solo está entrenado para la tarea de tres en raya con un SO-101; no generaliza a otras tareas, objetos ni robots.
- Sin métricas de éxito: el autor no reporta tasa de éxito en validación ni en robot real, por lo que el rendimiento real es desconocido.
- Riesgo de sobreajuste al entorno de captura: cambios en iluminación, posición de cámaras o disposición del tablero pueden degradar el comportamiento.
- Dependencia de calibración: requiere que el robot, las cámaras y el tablero estén en la configuración exacta usada durante la recogida de datos.
- Riesgo de alucinación en el sentido de acciones incorrectas: al ser una política de imitación, puede generar trayectorias plausibles pero erróneas ante observaciones fuera de distribución.
- Sin soporte multilingüe ni de texto: no debe evaluarse como modelo de lenguaje.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor recomienda validar las nueve posiciones objetivo en el robot antes de uso autónomo.
- Sin cuantizaciones publicadas: no hay versiones GGUF ni INT8 documentadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gueso/tictactoe-v4-final-act-policy
- Dataset asociado: https://huggingface.co/datasets/OG7407/tictactoe-v4-final
- Librería LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
