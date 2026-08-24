# justintiensmith/groot_v4

## Resumen

El modelo `justintiensmith/groot_v4` es una política robótica de tipo Vision-Language-Action (VLA) entrenada con el framework LeRobot de Hugging Face. Se basa en el modelo fundacional GR00T N1.7 de NVIDIA, diseñado para el razonamiento y las habilidades de robots humanoides, y utiliza un backbone Cosmos-Reason2/Qwen3-VL junto con un action transformer de flow-matching para predecir acciones a partir de observaciones visuales, instrucciones en lenguaje natural y estado propioceptivo.

El modelo está especializado en tareas de manipulación sobre una mesa, como colocar tazas en un bol, mover objetos a posiciones relativas o interactuar con bloques y bolígrafos. Ha sido entrenado con un dataset propio de 1200 episodios y más de 600 000 frames, capturados con dos cámaras (cámara central y cámara de muñeca) a 30 FPS. Con 3 144 millones de parámetros, representa una opción compacta para experimentación en robótica de bajo coste, aunque su ámbito de aplicación es específico y no generalista.

La relevancia de este modelo radica en su integración con el ecosistema LeRobot, que facilita el entrenamiento y despliegue de políticas robóticas en hardware real. Al estar licenciado bajo Apache 2.0, permite uso comercial y modificación sin restricciones significativas, lo que lo convierte en un candidato interesante para investigación y prototipado en manipulación robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + action transformer de flow-matching) |
| Parametros totales | 3 144 016 000 (3,14 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA, que combina un modelo de lenguaje y visión (Cosmos-Reason2/Qwen3-VL) como backbone para procesar las observaciones visuales y las instrucciones textuales, y un action transformer basado en flow-matching para generar las acciones de control. Esta arquitectura permite condicionar la generación de acciones sobre la información multimodal (imágenes de dos cámaras, estado del robot y lenguaje natural).

El entrenamiento se realizó con el dataset `justintiensmith/VLA_Reasoning_Training_Dataset_1200_2cam`, que contiene 1200 episodios y 612 733 frames a 30 FPS. Las tareas incluyen instrucciones como "Move the closed white cup into the bowl" o "Place the green pen next to the red block", lo que indica un enfoque en razonamiento espacial y manipulación de objetos. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el entrenamiento parece ser de imitación supervisada a partir de demostraciones. El modelo se entrenó y subió al Hub mediante LeRobot, lo que garantiza compatibilidad con su pipeline de despliegue.

## Capacidades

- Control robótico de un manipulador tipo `so_follower` con 6 grados de libertad (acción de 6 dimensiones).
- Procesamiento de dos flujos visuales simultáneos: cámara central y cámara de muñeca, ambos con resolución 480x640.
- Comprensión de instrucciones en lenguaje natural para tareas de manipulación sobre mesa (pick-and-place, posicionamiento relativo).
- Razonamiento espacial básico: interpreta relaciones como "delante de", "detrás de", "a la izquierda de", "al lado de".
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No se reportan capacidades de generación de texto, código, tool calling o agentes autónomos fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede ejecutar instrucciones como "coloca la taza blanca en el bol" usando las dos cámaras para localizar los objetos y generar las acciones de 6 DOF necesarias.
- Prototipado rápido de políticas robóticas con LeRobot: al estar entrenado con este framework, se puede cargar directamente en robots compatibles y evaluar su comportamiento en pocos minutos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para fine-tuning en tareas similares con datasets propios, gracias a su licencia permisiva y su tamaño moderado.
- Evaluación de modelos VLA en entornos controlados: su dataset de entrenamiento está bien documentado, lo que permite reproducir experimentos y comparar con otras políticas.
- Educación en robótica: por su tamaño y la disponibilidad de herramientas asociadas, es adecuado para cursos que enseñen despliegue de modelos de aprendizaje por refuerzo o imitación.
- Benchmarking de hardware: al requerir relativamente poca VRAM (estimada), puede usarse para probar el rendimiento de GPUs de gama media en inferencia robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de robótica (éxito en tareas, precisión de agarre, etc.) en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: con 3,14 B de parámetros, en FP16 se necesitarían aproximadamente 6,3 GB de VRAM solo para los pesos. El tamaño del repositorio (12,6 GB) sugiere que puede incluir pesos en FP32 o múltiples archivos, por lo que una GPU con al menos 12 GB de VRAM sería recomendable para inferencia sin cuantización.
- GPU recomendadas: RTX 3080/3090, RTX 4070/4090, A100, H100, o cualquier GPU con 12 GB o más de VRAM.
- En consumer GPU: sí, cabe en GPUs de gama alta como RTX 3090 o RTX 4090, y posiblemente en RTX 4070 Ti con cuantización.
- Opciones de despliegue: LeRobot (framework principal), posiblemente vLLM o TGI si se adapta, aunque al ser un modelo robótico no es estándar. También se puede usar con llama.cpp si se convierte a GGUF, pero no hay soporte oficial.
- Latencia y throughput: no disponible. Depende del hardware y de la implementación del action transformer.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas VLA para manipulación robótica con tamaño similar). El modelo original GR00T N1.7 de NVIDIA es la referencia, pero no se han encontrado datos de rendimiento comparativo. Se recomienda consultar la documentación de NVIDIA Isaac-GR00T para más contexto.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en tareas de mesa con objetos específicos (tazas, bolígrafos, bloques) y puede no generalizar a otros entornos u objetos no vistos.
- No se han reportado evaluaciones de sesgos, alucinaciones o robustez ante perturbaciones visuales o de iluminación.
- La dependencia de dos cámaras fijas (middle y wrist) limita su uso en configuraciones robóticas diferentes.
- No hay información sobre el idioma de las instrucciones; probablemente solo inglés, lo que restringe su uso multilingüe.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no incluye garantías de seguridad para operación en entornos no controlados.
- El dataset de entrenamiento es relativamente pequeño (1200 episodios) comparado con otros modelos VLA, lo que puede afectar la robustez en tareas variadas.

## Enlaces

- [HuggingFace - justintiensmith/groot_v4](https://huggingface.co/justintiensmith/groot_v4)
- [Dataset de entrenamiento - VLA_Reasoning_Training_Dataset_1200_2cam](https://huggingface.co/datasets/justintiensmith/VLA_Reasoning_Training_Dataset_1200_2cam)
- [LeRobot (Hugging Face)](https://github.com/huggingface/lerobot)
- [NVIDIA Isaac-GR00T](https://github.com/NVIDIA/Isaac-GR00T)
- [GR00T-WholeBodyControl (NVIDIA Labs)](https://github.com/NVlabs/GR00T-WholeBodyControl)
