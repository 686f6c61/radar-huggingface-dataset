# Maximilian228/Geode-Ternary-Bonsai-2-2B

## Resumen

Geode-Ternary-Bonsai-2-2B es un paquete de pesos empaquetado por Maximilian228 para Geode, una aplicación de Android que ejecuta modelos de lenguaje íntegramente en el teléfono, sin nube ni cuenta de usuario. El modelo subyacente es Ternary Bonsai 2 2B de PrismML, una versión con pesos ternarios (cada peso vale -1, 0 o +1 multiplicado por una escala por grupo de 64) del Qwen3.5-2B de Qwen, lo que reduce un modelo de 2B parámetros a aproximadamente medio gigabyte de pesos. Mantiene la arquitectura híbrida Gated DeltaNet + atención y el vocabulario de los otros modelos Qwen de Geode, y conserva la capacidad de entender imágenes mediante un codificador visual en 8 bits.

El paquete está pensado para inferencia en dispositivo en teléfonos Android de 64 bits con al menos 4 GB de RAM, y no se re-cuantiza nada: Geode lee directamente los códigos ternarios y las escalas de PrismML, con las entradas rotadas por Hadamard tal como se distribuyen. El repositorio ocupa 0,9 GB (0,50 GiB de pesos + 0,33 GiB de visión) y usa un formato propio de Geode descrito por `geode.json`, no GGUF, por lo que no carga en otros runtimes.

Su relevancia actual radica en demostrar que un modelo de 2B con visión puede ejecutarse en un Snapdragon 8 Elite con unos 0,9 GB de memoria en ejecución y velocidades de unos 500 tokens/s de preprocesado en la NPU Hexagon y 53-63 tokens/s de generación, con una divergencia KL de 0,00024 frente a llama.cpp ejecutando el GGUF original de PrismML en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated DeltaNet + atención (heredada de Qwen3.5-2B) |
| Parametros totales | 2B (aproximado, según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos ternarios (2 bits por peso, escala fp16 por grupo de 64); codificador visual en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato propio de Geode (`geode.json` describe los archivos); no es GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-2B: un diseño híbrido que combina capas Gated DeltaNet con capas de atención, tal como se describe en la model card. Sobre esa base, PrismML aplicó una cuantización ternaria en la que cada peso se representa con 2 bits (valores -1, 0 o +1) y una escala fp16 compartida por cada grupo de 64 pesos, dando lugar a Ternary Bonsai 2 2B. El codificador visual se mantiene en 8 bits para preservar la capacidad image-text-to-text.

El paquete de Maximilian228 no reentrena ni recuantiza: convierte el GGUF de PrismML al formato de archivos de Geode, conservando los mismos valores ternarios y escalas y reordenando los tensores. Las entradas rotadas por Hadamard se incorporan tal como las distribuye PrismML. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen3.5-2B.
- Comprensión de imágenes (pipeline image-text-to-text) mediante codificador visual en 8 bits.
- Ejecución completamente local en Android, sin conexión a la nube ni cuenta de usuario.
- Aprovechamiento de la NPU Hexagon para el preprocesado del prompt y de la CPU para la generación.
- Capacidad de edición de texto con reutilización de borradores del contexto de conversación (según la descripción de velocidades en respuestas repetitivas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente personal offline en Android: el modelo se ejecuta íntegramente en el teléfono con unos 0,9 GB de memoria, lo que permite conversaciones privadas sin enviar datos a servidores externos.
- Descripción y análisis de imágenes en dispositivo: gracias al codificador visual en 8 bits, puede procesar fotos capturadas con la cámara del teléfono para tareas de accesibilidad, etiquetado o extracción de información.
- Edición y reescritura de texto en movilidad: la velocidad de 62-63 tokens/s en respuestas que repiten el contexto de conversación lo hace adecuado para tareas de corrección o reformulación de borradores.
- Aplicaciones de campo sin conectividad: en entornos sin red (zonas rurales, obras, inspecciones), el modelo puede ofrecer asistencia textual y visual local.
- Prototipado de aplicaciones Android con IA embebida: desarrolladores que quieran validar flujos image-text-to-text en dispositivo sin depender de APIs externas.
- Demostración de cuantización ternaria en hardware móvil: útil para investigadores que estudien el equilibrio entre precisión (KL 0,00024 frente al GGUF de referencia) y eficiencia en NPU Hexagon.
- Asistencia educativa o de consulta rápida en dispositivos de gama media-alta con Snapdragon 8 Elite y 4 GB o más de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados son métricas de inferencia en dispositivo:

| Metrica | Valor |
|---|---|
| Divergencia KL frente a llama.cpp con el GGUF de PrismML (texto de código reservado) | 0,00024 (prompt en NPU Snapdragon); 0,00037 (solo procesador) |
| Velocidad de preprocesado del prompt (466 tokens, Snapdragon 8 Elite, NPU) | ~500 tokens/s |
| Velocidad de preprocesado del prompt (solo CPU) | ~140 tokens/s |
| Velocidad de generación (greedy) | ~53 tokens/s |
| Velocidad de generación en respuestas que repiten conversación | 62-63 tokens/s |
| Memoria en ejecución (incluida copia de pesos en NPU) | ~0,9 GB |

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Geode-Ternary-Bonsai-2-2B | 2B | no disponible | Ternaria (2 bits) + visión 8 bits | Apache-2.0 | Formato propio de Geode, solo app Android |
| prism-ml/Ternary-Bonsai-2-2B-gguf | 2B | no disponible | Ternaria (2 bits) | Apache-2.0 | GGUF, ejecutable en llama.cpp |
| Qwen/Qwen3.5-2B | 2B | no disponible | Pesos completos (fp16/bf16 presumiblemente) | Apache-2.0 | Safetensors, ecosistema Hugging Face |

La comparativa se limita a los modelos citados en la información disponible; no se dispone de datos de rendimiento comparativo en benchmarks estándar entre ellos.

## Limitaciones y advertencias

- El formato de pesos es propietario de Geode y no carga en otros runtimes como llama.cpp, vLLM u Ollama; el uso queda restringido a la aplicación Geode.
- Requiere Android 11 o superior, procesador ARM de 64 bits con instrucciones de producto punto (ARMv8.2) y al menos 4 GB de RAM; no funciona en dispositivos más antiguos.
- La cuantización ternaria introduce una divergencia respecto al modelo original (KL 0,00024-0,00037), lo que puede degradar tareas sensibles a la precisión numérica.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos; la model card advierte genéricamente de que las respuestas de un modelo de IA pueden ser erróneas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del paquete.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la dependencia del runtime propietario de Geode limita la portabilidad a producción fuera de Android.
- El rendimiento medido corresponde a un Snapdragon 8 Elite (RedMagic); en otros SoC las velocidades y el uso de NPU pueden diferir sustancialmente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Maximilian228/Geode-Ternary-Bonsai-2-2B
- Modelo base ternario (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.5-2B
- Aplicación Geode: https://geode.tifu.xyz
