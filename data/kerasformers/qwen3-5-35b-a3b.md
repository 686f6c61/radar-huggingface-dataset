# kerasformers/qwen3.5-35b-a3b

## Resumen

El modelo `kerasformers/qwen3.5-35b-a3b` es una conversión íntegra en Keras 3 del modelo multimodal `Qwen/Qwen3.5-35B-A3B`, desarrollado por el equipo de Qwen en Alibaba. Esta implementación, creada por el autor `kerasformers`, permite ejecutar el mismo modelo sin modificaciones sobre tres backends de Keras: TensorFlow, PyTorch y JAX, lo que facilita su integración en entornos heterogéneos.

Se trata de un modelo de visión-lenguaje (VLM) basado en una arquitectura de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos por token, lo que ofrece un equilibrio notable entre capacidad y eficiencia computacional. Incorpora una torre de visión y un componente de texto híbrido con atención Gated DeltaNet, según la información disponible. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su naturaleza multimodal y su diseño eficiente, que lo hace apto para tareas de razonamiento visual y de lenguaje en dispositivos con recursos limitados. La conversión a Keras 3 amplía el ecosistema de frameworks disponibles para su despliegue, aunque su adopción aún es incipiente (cero descargas y cero likes en el momento de la consulta).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (visión-lenguaje) con atención híbrida Gated DeltaNet y mezcla de expertos dispersa |
| Parametros totales | 35 mil millones |
| Parametros activos | 3 mil millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (según model card; el modelo base podría soportar más, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | bfloat16 (formato de archivo no especificado) |

## Arquitectura y entrenamiento

La arquitectura del modelo base `Qwen3.5-35B-A3B` combina un componente de texto híbrido con atención Gated DeltaNet y una torre de visión, integrados en un diseño de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y solo 3 mil millones activos por token. Esta configuración permite un alto rendimiento en inferencia con una latencia reducida, como se destaca en las fuentes consultadas.

No se dispone de información detallada sobre el proceso de entrenamiento, como el número de tokens utilizados, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. La model card del repositorio no aporta estos datos, y las búsquedas web solo mencionan características arquitectónicas generales. Tampoco se documentan innovaciones técnicas adicionales más allá de la arquitectura híbrida y la eficiencia del MoE.

## Capacidades

- Generación de texto y razonamiento multimodal: el modelo acepta entradas que combinan imágenes y texto, y produce respuestas textuales coherentes.
- Procesamiento de imágenes: gracias a su torre de visión, puede interpretar contenido visual y responder preguntas sobre él.
- Soporte multi-backend: la implementación en Keras 3 permite ejecutar el modelo en TensorFlow, PyTorch o JAX sin cambios de código.
- Eficiencia computacional: al activar solo 3 mil millones de parámetros por token, reduce la carga de cómputo en comparación con modelos densos de tamaño similar.
- No se mencionan capacidades específicas como tool calling, agentes o modos de razonamiento extendido en la información disponible.

## Casos de uso

- Descripción automática de imágenes para accesibilidad: el modelo puede generar descripciones textuales de fotografías, útil en aplicaciones para personas con discapacidad visual. Su naturaleza multimodal permite procesar la imagen y producir una narración en tiempo real.
- Asistencia visual en atención al cliente: integrado en un chatbot, puede recibir capturas de pantalla o fotos enviadas por el usuario y responder con instrucciones o diagnósticos, aprovechando su capacidad de razonamiento visual y su contexto multimodal.
- Moderación de contenido visual: el modelo puede analizar imágenes y texto asociado para detectar contenido inapropiado o sensible, ofreciendo una capa de filtrado en plataformas sociales.
- Análisis de documentos escaneados: combinando OCR con el modelo, se pueden extraer y resumir datos de facturas, formularios o informes que contengan tablas y gráficos, gracias a su capacidad de interpretar imágenes.
- Educación y tutoría interactiva: un asistente educativo puede recibir fotos de ejercicios o diagramas y explicar conceptos paso a paso, usando el razonamiento multimodal del modelo.
- Prototipado rápido en investigación: al ser una conversión en Keras 3, los desarrolladores pueden experimentar con el modelo en diferentes backends (JAX, TF, Torch) sin reescribir código, facilitando pruebas de concepto en visión por computador y NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K o evaluaciones específicas de tareas visuales para este modelo o su conversión.

## Requisitos de hardware

- Tamaño del repositorio: 70.3 GB, lo que sugiere que los pesos en bfloat16 ocupan aproximadamente 70 GB (35 mil millones de parámetros × 2 bytes).
- Para cargar el modelo completo en bfloat16 sin cuantización, se necesitaría una GPU con al menos 70 GB de VRAM, como una NVIDIA A100 de 80 GB o una H100.
- Al ser un MoE con solo 3 mil millones de parámetros activos, la memoria requerida para las activaciones durante la inferencia es menor que la de un modelo denso equivalente, pero los pesos completos deben residir en memoria.
- No se han publicado versiones cuantizadas específicas para este repositorio; las opciones de cuantización no están documentadas.
- El despliegue puede realizarse mediante la librería `kerasformers` en entornos con TensorFlow, PyTorch o JAX. No se mencionan integraciones con vLLM, llama.cpp, Ollama u otros motores de inferencia.
- Dado el tamaño, es poco probable que quepa en GPUs de consumo como la RTX 4090 (24 GB) sin cuantización; se requeriría una cuantización agresiva o el uso de múltiples GPUs.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. El modelo es comparable en arquitectura y tamaño a otros MoE multimodales de la familia Qwen, como el propio `Qwen3.5-35B-A3B` original, pero no se han encontrado datos de rendimiento o características detalladas de alternativas en las fuentes consultadas. Por tanto, la comparativa se limita a indicar que comparte especificaciones con su modelo base.

## Limitaciones y advertencias

- La model card declara únicamente el idioma inglés (`en`), aunque el modelo base de Qwen probablemente soporte más lenguas; esta conversión no documenta soporte multilingüe.
- No se han publicado evaluaciones de sesgos o riesgos de alucinación específicos para esta conversión. Como modelo multimodal, puede generar descripciones inexactas o inventar detalles en imágenes ambiguas.
- La librería `kerasformers` es un proyecto de terceros con una adopción limitada; su estabilidad y mantenimiento a largo plazo no están garantizados.
- El repositorio no incluye información sobre la longitud de contexto soportada, lo que dificulta planificar su uso en tareas con dependencias de largo alcance.
- Aunque la licencia Apache 2.0 permite uso comercial, es necesario verificar los términos del modelo base original y de cualquier dependencia adicional.
- El tamaño del repositorio (70.3 GB) implica costes de almacenamiento y transferencia considerables, y su despliegue en producción requiere infraestructura con VRAM suficiente.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/kerasformers/qwen3.5-35b-a3b
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Colección de modelos Qwen3.5-MoE en HuggingFace: https://huggingface.co/collections/kerasformers/qwen35-moe-6a7eb77a1a41110f3195af09
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de Qwen3.5-MoE en KerasFormers: https://imvision12.github.io/KerasFormers/qwen3_5_moe/
- Página del modelo en Ollama: https://ollama.com/library/qwen3.5:35b-a3b
- Página del modelo en Vast.ai: https://vast.ai/model/qwen35-35b-a3b
- Página del modelo en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-35b-a3b/
