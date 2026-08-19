# notSnix/Qwen3.8-27B-Puzzletron-19p2B

## Resumen

El modelo `notSnix/Qwen3.8-27B-Puzzletron-19p2B` es una variante podada (pruned) del modelo Qwen3.8-27B de Alibaba, desarrollada por el usuario notSnix. Se trata de un modelo de lenguaje y visión (image-text-to-text) que reduce los 27 000 millones de parámetros originales a aproximadamente 19 200 millones (según la nomenclatura del nombre), utilizando la herramienta NVIDIA ModelOpt para el proceso de poda. La arquitectura resultante es híbrida, incorporando capas del tipo gated-deltanet, una modificación que busca mejorar la eficiencia en el procesamiento de secuencias largas.

Este modelo se publica con licencia Apache 2.0 (según los tags de HuggingFace, aunque el campo oficial de licencia figura como no disponible) y está pensado para entornos donde se necesita un equilibrio entre capacidad y requisitos de hardware, permitiendo su ejecución en GPUs de consumo o estaciones de trabajo. Al ser una versión podada, hereda las capacidades del modelo base (razonamiento, visión, tool calling, etc.) pero con una posible degradación de rendimiento que el propio autor señala con la etiqueta `needs-distillation` (requiere destilación adicional para recuperar precisión).

La relevancia de este modelo radica en su tamaño intermedio: con ~19B parámetros, cabe en tarjetas gráficas con 24 GB de VRAM en cuantización FP16, lo que lo hace accesible para desarrolladores e investigadores que no disponen de infraestructura de centro de datos. Sin embargo, al ser un modelo de la comunidad con cero descargas y sin benchmarks publicados, debe considerarse experimental y no apto para producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas gated-deltanet (según tags) |
| Parametros totales | ~19 200 millones (inferido del nombre, no confirmado oficialmente) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (heredado del modelo base Qwen3.8-27B, no confirmado para esta variante) |
| Tipos de cuantizacion | safetensors (formato FP32/FP16/BF16, no se especifican cuantizaciones adicionales) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no hay confirmación para esta variante) |
| Licencia | No disponible (el tag indica apache-2.0, pero el campo oficial no lo confirma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un modelo denso de 27 000 millones de parámetros con arquitectura transformer estándar, entrenado con 2,4 billones de tokens y con capacidades multimodales (imagen y video). La variante Puzzletron aplica un proceso de poda (pruning) mediante NVIDIA ModelOpt, reduciendo el número de parámetros a aproximadamente 19 200 millones. Los tags indican que la arquitectura resultante es híbrida, incorporando capas gated-deltanet, un mecanismo de atención que combina ventanas locales con atención global de baja complejidad, lo que podría mejorar la eficiencia en contextos largos.

No se dispone de información detallada sobre el proceso de entrenamiento posterior a la poda. La etiqueta `needs-distillation` sugiere que el modelo no ha sido sometido a una fase de destilación completa para recuperar el rendimiento perdido tras la poda, lo que implica que sus capacidades pueden estar por debajo de las del modelo original. Tampoco se especifica si se aplicaron técnicas de ajuste fino (RLHF, DPO, SFT) después de la poda. El autor indica que el modelo base es `Qwen/Qwen3.8-27B` y que es un fine-tune de este, pero no se detallan los datos de entrenamiento adicionales.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, que incluyen razonamiento complejo, matemáticas y comprensión lectora, aunque la poda puede degradar estas habilidades.
- Procesamiento de imágenes y texto (image-text-to-text): soporta entrada multimodal, pudiendo responder preguntas sobre imágenes, generar descripciones y realizar tareas de visión-lenguaje.
- Tool calling / function calling: el modelo base soporta invocación de herramientas, y es probable que esta variante conserve dicha capacidad, aunque no hay confirmación explícita.
- Capacidades de agente: el modelo base está diseñado para tareas de agente de largo horizonte, con mejor manejo de feedback de herramientas y entornos. Esta variante podría conservar parte de ello, pero no está garantizado.
- Soporte multilingüe: no hay datos específicos para esta variante; el modelo base soporta múltiples idiomas, pero la poda podría afectar a lenguas minoritarias.
- Modo de pensamiento (thinking mode): el modelo base tiene un modo de razonamiento extendido, pero no se sabe si esta variante lo conserva íntegramente.

## Casos de uso

- Prototipado de asistentes multimodales: al ser un modelo de ~19B que puede ejecutarse en una GPU de 24 GB, es adecuado para experimentar con chatbots que procesan imágenes y texto en entornos de desarrollo, antes de escalar a modelos más grandes.
- Automatización de documentación técnica: dado su tamaño medio y capacidad de comprensión de imágenes, puede utilizarse para generar descripciones de diagramas o capturas de pantalla en flujos de trabajo internos, siempre que se valide su precisión.
- Investigación sobre pruning y destilación: este modelo es un caso de estudio para evaluar cómo la poda afecta a las capacidades de un modelo multimodal, y puede servir como punto de partida para experimentos de destilación (de ahí la etiqueta `needs-distillation`).
- Evaluación de arquitecturas híbridas: la inclusión de capas gated-deltanet permite probar el rendimiento de esta arquitectura en tareas de razonamiento y visión, comparándola con el modelo denso original.
- Generación de código asistida por imágenes: el modelo base tiene buenos resultados en benchmarks de código (DeepSWE 42.2), por lo que esta variante podría usarse para tareas de programación que requieran entender capturas de pantalla de interfaces, aunque con precaución por la posible pérdida de precisión.
- Despliegue en entornos con recursos limitados: para aplicaciones donde no se requiere máxima exactitud, como demos o pruebas de concepto, este modelo ofrece un equilibrio entre tamaño y funcionalidad, ejecutable en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante Puzzletron en la información disponible. Los datos de rendimiento (DeepSWE 42.2, Terminal Bench 73.0, OSWorld 84.3) corresponden al modelo base Qwen3.8-27B original, no a esta versión podada. Dado que el autor indica `needs-distillation`, es esperable que el rendimiento sea inferior al del modelo base, pero no se dispone de cifras concretas. Se recomienda no asumir que los benchmarks del modelo base se aplican a esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~19 200 millones de parámetros en FP16, se necesitan aproximadamente 38 GB de VRAM. En cuantización INT8 (si estuviera disponible) bajaría a ~19 GB, pero no se ofrecen archivos cuantizados en el repositorio.
- GPU recomendadas: para FP16, se requiere una GPU con al menos 40 GB (A100 40GB, A6000, o dos RTX 3090 en paralelo). Para cuantización de 4 bits (si se generara), una RTX 4090 (24 GB) sería suficiente.
- Compatibilidad con GPU de consumo: no de forma directa en FP16; se necesitaría cuantización adicional (GGUF, AWQ) que no está incluida en el repositorio actual.
- Opciones de despliegue: al usar safetensors y ser compatible con transformers, puede desplegarse con vLLM, TGI o llama.cpp (si se convierten los pesos). No hay soporte nativo de Ollama.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la implementación de las capas gated-deltanet, que pueden requerir kernels personalizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | safetensors | Modelo original sin podar, benchmarks conocidos |
| notSnix/Qwen3.8-27B-Puzzletron-19p2B | ~19.2B | No confirmado (heredado 262K) | No disponible | safetensors | Variante podada, sin benchmarks |
| Qwen2.5-14B | 14B | 128K | Apache 2.0 | safetensors | Alternativa más pequeña, sin visión nativa |

La comparativa se limita a modelos de la misma familia o tamaño similar. No hay información suficiente para comparar con otros modelos podados de la comunidad. La principal diferencia con el base es el tamaño reducido y la arquitectura híbrida, pero a costa de un rendimiento potencialmente menor.

## Limitaciones y advertencias

- El modelo está etiquetado como `needs-distillation`, lo que indica que no ha sido completamente optimizado tras la poda y que su rendimiento puede ser significativamente inferior al del modelo base.
- No se han publicado benchmarks ni evaluaciones independientes; cualquier uso en producción requiere una validación exhaustiva.
- La licencia no está confirmada en el campo oficial de HuggingFace, aunque el tag sugiere Apache 2.0. Se debe verificar antes de un uso comercial.
- La arquitectura híbrida con gated-deltanet puede no ser compatible con todas las librerías de inferencia; es posible que se necesiten modificaciones o kernels específicos.
- No se proporcionan archivos cuantizados (GGUF, AWQ), lo que limita su despliegue en hardware de consumo sin conversión adicional.
- El modelo tiene cero descargas y cero likes, lo que sugiere que no ha sido probado por la comunidad; se recomienda tratarlo como experimental.
- La longitud de contexto de 262K tokens es la del modelo base, pero no se ha verificado si la poda afecta a la capacidad de manejar secuencias largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/notSnix/Qwen3.8-27B-Puzzletron-19p2B
- Guía de Qwen3.8-27B (modelo base): https://lovableapp.org/blog/qwen3-8-27b
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Análisis de Simon Willison sobre Qwen3.8-27B: https://simonwillison.net/2026/Aug/16/qwen-38-27b/
- Guía de ejecución local de Qwen3.8-27B: https://lu-labs.ai/blog/how-to-run-qwen-3-8-27b-locally
- Página de Qwen3.8-27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
