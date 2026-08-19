# kerasformers/qwen2-vl-72b

## Resumen

El modelo `kerasformers/qwen2-vl-72b` es una conversión íntegra al framework Keras 3 del modelo original `Qwen/Qwen2-VL-72B` de Alibaba, desarrollada por el equipo de KerasFormers. Esta conversión permite ejecutar el mismo modelo de forma nativa en tres backends distintos — TensorFlow, PyTorch y JAX — sin modificar el código, gracias a la capa de abstracción de Keras 3. Los pesos se almacenan en bfloat16 y el modelo se sirve como pipeline de imagen + texto a texto mediante el procesador `Qwen2VLProcessor`.

La relevancia de esta conversión radica en que facilita la integración de un modelo vision-language de gran tamaño (72B parámetros) en entornos que ya usan Keras, evitando la dependencia exclusiva de PyTorch. Al ser una conversión de pesos, mantiene las capacidades del modelo original: comprensión de imágenes de alta resolución, razonamiento visual y diálogo multimodal. Es una opción interesante para equipos que buscan uniformidad de stack tecnológico sin sacrificar rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (vision-language transformer, conversión Keras 3 del modelo original) |
| Parametros totales | 72B (según la designación del modelo) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible en la model card (el modelo original soporta 128k tokens) |
| Tipos de cuantizacion | bfloat16 (pesos almacenados en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | qwen (licencia específica de Qwen, ver enlace) |
| Formato de pesos | no especificado en la model card (repo de 147.1 GB, probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la del modelo base `Qwen/Qwen2-VL-72B`. Se trata de un modelo multimodal que combina un codificador de visión (basado en ViT con mecanismos de atención de ventana) con un decoder de lenguaje transformer (similar a Qwen2). El procesador `Qwen2VLProcessor` gestiona la tokenización de imágenes y texto, permitiendo entradas de imagen y texto de forma intercalada. El modelo original fue entrenado con un dataset multimodal masivo y posteriormente ajustado con instrucciones (SFT) y aprendizaje por refuerzo con retroalimentación humana (RLHF), aunque la model card de la conversión no detalla estos aspectos. La conversión de KerasFormers no altera la arquitectura ni los pesos; solo reimplementa el código en Keras 3 para permitir ejecución en múltiples backends.

## Capacidades

- Procesamiento de imágenes y texto de forma conjunta, generando respuestas de texto descriptivas o conversacionales.
- Soporte de diálogo multimodal multi-turno: el ejemplo de la model card muestra una conversación con una imagen y una pregunta del usuario.
- Comprensión de imágenes a alta resolución (gracias al diseño de Qwen2-VL, que adapta la resolución de entrada).
- Generación de texto en inglés (según la model card, aunque el modelo original es multilingüe, esta conversión solo declara `en`).
- Ejecución multiplataforma: TensorFlow, PyTorch y JAX con la misma implementación.
- No se mencionan capacidades de tool calling, agentes ni funciones especiales en la model card.

## Casos de uso

- Descripción automática de imágenes en aplicaciones de accesibilidad: el modelo puede generar descripciones detalladas de fotografías o ilustraciones, ayudando a personas con discapacidad visual.
- Moderación de contenido visual: análisis de imágenes para detectar contenido inapropiado, generando un informe textual.
- Asistencia en documentación técnica: extraer información de diagramas, capturas de pantalla o esquemas y convertirla en texto estructurado.
- Chatbots de atención al cliente con soporte visual: los usuarios pueden enviar fotos de productos o problemas y el modelo responde con instrucciones o diagnósticos.
- Automatización de informes a partir de imágenes médicas o científicas (siempre con supervisión humana, dado el riesgo de alucinación).
- Generación de subtítulos o metadatos para bancos de imágenes, facilitando la búsqueda y clasificación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la conversión no incluye métricas de rendimiento. Para evaluar las capacidades del modelo, se recomienda consultar el paper original de Qwen2-VL (arXiv:2409.12191) y la model card del modelo base `Qwen/Qwen2-VL-72B`.

## Requisitos de hardware

- El tamaño del repo es de 147.1 GB, lo que indica que los pesos en bfloat16 ocupan aproximadamente 147 GB (72B parámetros × 2 bytes). Esto requiere al menos 150 GB de VRAM para cargar el modelo completo en memoria.
- No cabe en una GPU de consumo estándar (RTX 4090 tiene 24 GB). Se necesitan múltiples GPU de alta gama (por ejemplo, 8× A100 80GB o 4× H100 80GB) o aplicar cuantización a 8 bits o 4 bits para reducir la huella de memoria.
- La model card no especifica opciones de despliegue, pero al ser una conversión Keras 3, se puede usar con los backends de TensorFlow, PyTorch o JAX. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No hay información específica de comparativa en la model card. Como referencia, el modelo original Qwen2-VL-72B se compara con otros modelos vision-language de gran escala como LLaVA-NeXT-72B o InternVL2-76B. Sin embargo, para esta conversión concreta, no se dispone de datos de rendimiento comparativo. Se recomienda consultar el paper original para ver las comparativas del modelo base.

## Limitaciones y advertencias

- La licencia `qwen` impone restricciones de uso comercial. Es obligatorio revisar el texto completo de la licencia (enlace en la model card) antes de usar el modelo en producción.
- El modelo está declarado solo en inglés (`en`), aunque el modelo original es multilingüe. Esto puede limitar su uso en otros idiomas.
- Al ser una conversión de pesos, no hay garantía de que el comportamiento sea idéntico al modelo original en todos los casos, aunque en principio debería ser equivalente.
- Riesgo de alucinación visual: como cualquier modelo multimodal, puede generar descripciones incorrectas o inventadas sobre imágenes, especialmente en escenarios ambiguos.
- No se han publicado benchmarks específicos de esta conversión, por lo que su rendimiento real en tareas concretas debe validarse.
- El tamaño del modelo (72B) hace que la inferencia sea costosa y requiera infraestructura de GPU de alto nivel, lo que limita su uso en entornos con recursos limitados.

## Enlaces

- Model card de HuggingFace: https://huggingface.co/kerasformers/qwen2-vl-72b
- Modelo base original: https://huggingface.co/Qwen/Qwen2-VL-72B
- Repositorio KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de Qwen2-VL en KerasFormers: https://imvision12.github.io/KerasFormers/qwen2_vl/
- Paper Qwen2-VL: https://arxiv.org/abs/2409.12191
- Paper Qwen-VL (original): https://arxiv.org/abs/2308.12966
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2-VL-72B/blob/main/LICENSE
