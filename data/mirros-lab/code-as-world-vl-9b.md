# MirroS-Lab/Code-as-World-VL-9B

## Resumen

Code-as-World-VL-9B es un modelo de visión-lenguaje (VLM) desarrollado por MirroS-Lab, un laboratorio centrado en la construcción de modelos de mundo físicos verificables. El modelo se obtiene mediante fine-tuning del modelo base Qwen/Qwen3.5-9B, un transformer decoder de 9.400 millones de parámetros, adaptado para procesar imágenes y vídeos y razonar cuantitativamente sobre fenómenos físicos. Su propuesta central, denominada "Code-as-World", consiste en representar el mundo físico como código ejecutable: en lugar de limitarse a describir eventos visuales, el modelo genera representaciones explícitas de estados, dinámicas y mecanismos subyacentes, descubiertas mediante un proceso agéntico de simulación y verificación iterativa.

El modelo está pensado para investigación en comprensión física, medición y razonamiento cuantitativo a partir de vídeo e imágenes. Aunque su ficha técnica no detalla el conjunto de datos de entrenamiento ni los benchmarks, su arquitectura hereda las capacidades lingüísticas y de razonamiento de Qwen3.5-9B, a las que añade una capa de procesamiento multimodal. El checkpoint se distribuye en formato BF16 safetensors, con un tamaño de repositorio de 18,8 GB, y se sirve mediante vLLM con una ventana de contexto de 4608 tokens según el ejemplo de despliegue proporcionado. Su licencia Apache 2.0 facilita su uso en entornos de investigación y desarrollo, aunque se advierte que las salidas pueden ser inexactas y deben verificarse en aplicaciones críticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM basado en Qwen/Qwen3.5-9B (transformer decoder) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | 4608 tokens (según ejemplo de despliegue con vLLM) |
| Tipos de cuantizacion | no disponible (solo se distribuye en BF16 safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (con condiciones adicionales del modelo base) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer decoder de 9,4 B parámetros, al que se añade una proyección multimodal para procesar imágenes y secuencias de vídeo. El fine-tuning se orienta a la tarea de comprensión física: el modelo recibe 16 fotogramas de vídeo como entrada recomendada y debe producir razonamientos cuantitativos sobre estados, parámetros y dinámicas del mundo observado. La innovación principal reside en el paradigma "Code-as-World", descrito en el informe técnico del laboratorio: el modelo aprende a generar representaciones ejecutables (código) que capturan los mecanismos subyacentes de una escena, y estas representaciones se descubren mediante un proceso agéntico de simulación y verificación iterativa. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO.

## Capacidades

- Comprensión física de escenas y eventos a partir de imágenes y vídeos, incluyendo estimación de estados y parámetros.
- Razonamiento cuantitativo: medición de magnitudes, cálculo de velocidades, fuerzas, trayectorias y otras propiedades físicas observables.
- Generación de representaciones ejecutables (código) que modelan la dinámica del mundo observado, facilitando la simulación y verificación.
- Procesamiento de vídeo con entrada recomendada de 16 fotogramas, aunque el modelo puede aceptar configuraciones alternativas.
- Capacidades lingüísticas heredadas de Qwen3.5-9B, incluyendo generación de texto y razonamiento general.
- No se documenta soporte explícito de tool calling, function calling ni modos de agente, aunque el paradigma agéntico de descubrimiento sugiere un uso orientado a pipelines de simulación.

## Casos de uso

- Análisis de vídeo de vigilancia: el modelo puede procesar secuencias de 16 fotogramas para detectar eventos físicos anómalos (caídas, colisiones, movimientos bruscos) y cuantificar parámetros como velocidad o aceleración, útil en sistemas de seguridad automatizados.
- Robótica y control: a partir de vídeo de un entorno, el modelo estima propiedades de objetos (masa, fricción, inercia) y genera código que simula su comportamiento, permitiendo planificar acciones en entornos desconocidos.
- Investigación científica: en experimentos grabados en vídeo (fluidos, mecánica, biología), el modelo extrae mediciones cuantitativas y produce representaciones ejecutables que pueden integrarse en simulaciones numéricas para validar hipótesis.
- Simulación física para entrenamiento de agentes: el modelo convierte observaciones del mundo real en código de simulación, generando entornos sintéticos para entrenar políticas de aprendizaje por refuerzo.
- Educación y divulgación: el modelo explica fenómenos físicos con razonamiento cuantitativo a partir de vídeos, generando descripciones detalladas de las leyes que gobiernan una escena, útil en plataformas educativas interactivas.
- Verificación de seguridad en entornos industriales: analiza vídeos de líneas de producción para detectar desviaciones en parámetros físicos (temperatura, presión, velocidad) y alertar sobre riesgos potenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa aproximadamente 18,8 GB de pesos, por lo que se requiere al menos 24 GB de VRAM para cargar el modelo completo sin cuantización. Con cuantización a 4 bits (no distribuida oficialmente) podría reducirse a unos 6-8 GB, pero no se ofrecen pesos cuantizados.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o GPUs con al menos 24 GB de memoria. El ejemplo de despliegue con vLLM usa `--gpu-memory-utilization 0.90`, lo que sugiere una GPU con suficiente memoria para el modelo y los overheads de atención.
- No cabe en GPUs de consumo de gama baja (8-12 GB) sin cuantización adicional, que no está disponible oficialmente.
- Opciones de despliegue: vLLM (versión 0.19.1) con API compatible con OpenAI, tal como se documenta en la model card. También podría convertirse a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan instrucciones oficiales.
- Latencia y throughput: no disponibles. Dependerán del hardware y del número de fotogramas procesados.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparación cuantitativa con otros VLM de tamaño similar (p. ej., LLaVA-NeXT, Qwen-VL, InternVL). El modelo se distingue por su enfoque en representaciones ejecutables del mundo físico, pero no se han publicado benchmarks comparativos. Se recomienda evaluar directamente en tareas específicas de comprensión física y razonamiento cuantitativo.

## Limitaciones y advertencias

- El modelo está destinado a investigación; sus salidas pueden ser inexactas y deben verificarse de forma independiente antes de usarse en entornos de seguridad crítica, como se indica en la model card.
- No se documentan sesgos específicos, pero al derivar de Qwen3.5-9B, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- La ventana de contexto está limitada a 4608 tokens según el ejemplo de despliegue, lo que restringe la cantidad de información textual que puede procesarse junto con los fotogramas de vídeo.
- No se especifican los idiomas soportados; se asume que el modelo base Qwen3.5-9B tiene capacidades multilingües, pero no hay confirmación para este fine-tuning.
- La licencia Apache 2.0 permite uso comercial, pero los usuarios deben cumplir también con los términos del modelo base Qwen3.5-9B y con las restricciones aplicables a sus datos de entrada.
- No se proporcionan pesos cuantizados, lo que limita el despliegue en hardware con poca memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MirroS-Lab/Code-as-World-VL-9B
- Repositorio GitHub: https://github.com/MirroS-Lab/Code-as-World
- Sitio web del laboratorio: https://mirros.ai/
- Informe técnico (PDF): https://mirros.ai/report/code-as-world.pdf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
