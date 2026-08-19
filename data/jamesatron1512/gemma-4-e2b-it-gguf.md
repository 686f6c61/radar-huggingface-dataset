# jamesatron1512/gemma-4-E2B-it-GGUF

## Resumen

El repositorio `jamesatron1512/gemma-4-E2B-it-GGUF` contiene los pesos cuantizados en formato GGUF (cuantización Q4_K_M) del modelo `google/gemma-4-E2B-it`, un modelo de lenguaje de la familia Gemma 4 desarrollado por Google. Esta versión está preparada para su ejecución directa con Ollama y llama.cpp, lo que facilita su despliegue local en entornos con recursos limitados.

El modelo base tiene aproximadamente 4.650 millones de parámetros (aunque la model card lo etiqueta como "2B", el número real de parámetros es mayor) y una longitud de contexto de hasta 8.192 tokens. Su licencia es la específica de Gemma, que permite uso comercial bajo ciertas condiciones. La cuantización Q4_K_M reduce el tamaño del modelo a unos 2,96 GB en disco, haciéndolo viable para GPUs de consumo y CPUs.

La relevancia de este repositorio radica en que ofrece una vía rápida para probar un modelo de la familia Gemma 4 sin necesidad de descargar los pesos completos en alta precisión. Es útil para desarrolladores que buscan integrar un asistente conversacional local en aplicaciones o experimentar con la generación de texto en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma-4 (transformer decoder-only) |
| Parámetros totales | 4.647.450.147 |
| Parámetros activos | no disponible |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | Q4_K_M (única disponible en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (términos de Google: https://ai.google.dev/gemma/terms) |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer decoder-only de la familia Gemma 4, con un vocabulario de 262.144 tokens. No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la model card de esta cuantización. El repositorio únicamente aporta los pesos convertidos a GGUF y cuantizados a 4 bits mediante el método Q4_K_M, que equilibra tamaño y calidad de salida. No se mencionan innovaciones técnicas adicionales en la conversión.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno siguiendo el formato de chat de Gemma (`<start_of_turn>user ... <end_of_turn><start_of_turn>model`).
- Soporte de system prompt: la plantilla permite definir un prompt de sistema, aunque por defecto se deja vacío para evitar fijaciones.
- Ejecución local eficiente: gracias a la cuantización Q4_K_M, puede ejecutarse en CPU o GPU con pocos recursos mediante Ollama o llama.cpp.
- Integración con Ollama: se puede invocar mediante una única línea de comando o a través de la API HTTP de Ollama.

No se dispone de información sobre capacidades específicas como tool calling, agentes, razonamiento multi-paso, visión o audio, ya que la model card no las detalla.

## Casos de uso

- Chatbot local para asistencia personal: el modelo puede integrarse en aplicaciones de escritorio o móviles para responder preguntas frecuentes o mantener conversaciones, gracias a su tamaño reducido y al formato GGUF que permite ejecutarlo en dispositivos con poca memoria.
- Generación de texto en entornos sin conexión: por su naturaleza local, es adecuado para herramientas de redacción o resumen que necesitan funcionar sin acceso a internet.
- Prototipado rápido de aplicaciones de lenguaje: los desarrolladores pueden probar el modelo en Ollama con una sola línea de comando antes de decidir si escalar a modelos más grandes.
- Asistente de código en entornos de desarrollo: aunque no se especifica soporte explícito de código, un modelo conversacional de este tamaño puede ayudar a explicar conceptos de programación o generar fragmentos simples.
- Educación y experimentación: sirve para enseñar conceptos de LLMs, cuantización y despliegue local en cursos o talleres.
- Automatización de tareas de texto en servidores modestos: al poder ejecutarse en CPU, puede usarse en pipelines de procesamiento de texto donde no se dispone de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización Q4_K_M, los pesos ocupan aproximadamente 2,96 GB en disco. En inferencia, se recomienda al menos 4-5 GB de VRAM para dejar margen a los estados de atención y buffers, aunque con llama.cpp también puede ejecutarse en CPU con unos 8 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060) puede ejecutar el modelo. También es viable en GPUs integradas con suficiente RAM compartida.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama de entrada y media.
- Opciones de despliegue: Ollama (comando directo), llama.cpp (compilación con soporte GGUF), o servidores compatibles con la API de Ollama.
- Latencia y throughput estimados: no se dispone de datos medidos. En una GPU como RTX 3060, se puede esperar una velocidad de generación de decenas de tokens por segundo, pero depende de la implementación y el hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El modelo base es Gemma 4, pero no se conocen datos de rendimiento ni se pueden contrastar con alternativas como Gemma 2 o Llama 3.2 en esta ficha.

## Limitaciones y advertencias

- La cuantización Q4_K_M introduce una pérdida de precisión respecto a los pesos originales en FP16/BF16, lo que puede afectar a la calidad de las respuestas en tareas complejas.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base, ya que la model card de la cuantización no los documenta.
- La licencia Gemma tiene condiciones específicas de uso comercial; es necesario revisar los términos en https://ai.google.dev/gemma/terms antes de desplegar el modelo en producción.
- El contexto máximo es de 8.192 tokens, lo que limita el manejo de documentos largos o conversaciones muy extensas.
- Al ser una cuantización creada por un tercero (no oficial de Google), no hay garantía de que los pesos sean idénticos en comportamiento al modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jamesatron1512/gemma-4-E2B-it-GGUF
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-E2B-it
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
