# nm-testing/int8_channel_weight_static_per_tensor_act-e2e

## Resumen

El modelo `nm-testing/int8_channel_weight_static_per_tensor_act-e2e` es un artefacto de prueba publicado por el equipo de Neural Magic (usuario `nm-testing`) dentro de su flujo de validación de la librería `compressed-tensors`. Se trata de un modelo de la familia Llama con aproximadamente 1.100 millones de parámetros, cuantizado a 8 bits mediante un esquema que combina pesos por canal y activaciones estáticas por tensor, tal y como indica su nombre. El repositorio contiene únicamente pesos en formato `safetensors` y está etiquetado como `region:us`.

Este modelo no está pensado como un producto final para desarrolladores, sino como una pieza de verificación interna de los pipelines de compresión de Neural Magic. Su relevancia radica en que sirve como ejemplo de cómo se aplica la cuantización int8 a un transformer tipo Llama, y puede utilizarse para probar herramientas de despliegue como `vLLM` o `llama.cpp` con formatos comprimidos. No se dispone de información sobre licencia, idiomas soportados ni rendimiento, lo que limita su uso a entornos de evaluación técnica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama, variante no especificada) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos por canal, activaciones estáticas por tensor) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Llama, aunque no se especifica la variante concreta (Llama-2, Llama-3, etc.). El nombre del repositorio indica que los pesos se han cuantizado a int8 con un esquema de cuantización por canal para los pesos y por tensor estático para las activaciones, un enfoque habitual en la compresión de modelos para reducir el uso de memoria y acelerar la inferencia. La librería `compressed-tensors` de Neural Magic es la encargada de generar estos pesos comprimidos.

No se ha publicado información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Al ser un modelo de testing, es probable que se haya partido de un checkpoint base ya entrenado y solo se haya aplicado la cuantización posterior. Tampoco se documentan innovaciones técnicas más allá del esquema de cuantización mencionado.

## Capacidades

- Generación de texto: al ser un modelo Llama de 1.1B, es capaz de generar texto coherente en tareas básicas de lenguaje, aunque no se han verificado capacidades específicas.
- Cuantización int8: el modelo demuestra la viabilidad de comprimir pesos a 8 bits con pérdida mínima de calidad, lo que lo hace útil para evaluar herramientas de compresión.
- Compatibilidad con librerías de inferencia: al usar `compressed-tensors`, puede cargarse con motores que soporten este formato, como `vLLM` o `llama.cpp` con las extensiones adecuadas.
- No se dispone de datos sobre tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Evaluación de pipelines de cuantización: el caso principal es validar que el flujo de compresión int8 de `compressed-tensors` produce pesos correctos y cargables. Un desarrollador de Neural Magic o un usuario avanzado puede descargar el repositorio y verificar la integridad de los tensores con la API de la librería.
- Prueba de motores de inferencia con formatos comprimidos: sirve para comprobar que `vLLM` o `TGI` cargan correctamente un modelo int8 con pesos por canal y activaciones estáticas, midiendo la velocidad y el uso de memoria frente a una versión sin cuantizar.
- Benchmark de calidad tras cuantización: aunque no hay datos oficiales, un investigador podría ejecutar tareas estándar (MMLU, GSM8K) sobre este modelo y comparar los resultados con el checkpoint original en fp16 para medir la degradación introducida por el esquema int8.
- Desarrollo de herramientas de compresión: el repositorio actúa como un caso de referencia para depurar nuevas funcionalidades de `compressed-tensors`, como la exportación a formatos específicos o la calibración de activaciones.
- Formación en técnicas de compresión: puede utilizarse en entornos educativos para ilustrar cómo se estructura un modelo cuantizado a nivel de tensores y qué metadatos acompañan a los pesos.
- Verificación de reproducibilidad: al ser un artefacto de testing, permite a otros equipos reproducir los resultados de Neural Magic en sus propias infraestructuras y confirmar que la compresión es determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de latencia o throughput para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.100 millones de parámetros en int8, los pesos ocupan aproximadamente 1,1 GB. Añadiendo activaciones y memoria intermedia, se estima un consumo total de 2-3 GB en inferencia con contexto corto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, como una NVIDIA GTX 1650, RTX 3050 o superiores. Para pruebas rápidas, una RTX 4090 o A100 ofrecen margen de sobra.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna de consumo gracias a su tamaño reducido.
- Opciones de despliegue: puede cargarse con `vLLM` (si soporta el formato `compressed-tensors`), `llama.cpp` con la compilación adecuada para int8, o mediante la API de `compressed-tensors` directamente. También es posible usar `Ollama` si se convierte previamente a GGUF.
- Latencia y throughput: no se han publicado mediciones; en una GPU moderna se espera una generación de varias decenas de tokens por segundo para un modelo de 1.1B en int8, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo pertenece a la categoría de Llama de ~1B parámetros, pero al ser un artefacto de testing sin benchmarks ni especificaciones completas, no se puede comparar directamente con alternativas como Llama-3.2-1B o Qwen2.5-1.5B. La única diferencia conocida es el esquema de cuantización int8, que no está disponible en los modelos base de forma nativa.

## Limitaciones y advertencias

- Es un modelo de prueba: no está diseñado para uso en producción ni para aplicaciones reales; su único propósito es validar el pipeline de compresión de Neural Magic.
- Sin licencia especificada: no se puede determinar si es utilizable comercialmente; se recomienda contactar con el autor antes de cualquier uso.
- Sin datos de rendimiento: no hay benchmarks que avalen su calidad en tareas de lenguaje; el rendimiento real es desconocido.
- Riesgo de alucinación: al ser un modelo pequeño (1.1B) y sin alineación conocida, es propenso a generar contenido incorrecto o inventado.
- Idiomas no especificados: no se sabe qué idiomas soporta, aunque por ser de la familia Llama probablemente tenga un sesgo hacia el inglés.
- Tamaño del repositorio elevado (37 GB) para un modelo de 1.1B: sugiere que contiene múltiples archivos o pesos sin comprimir adicionales; la descarga puede ser lenta e innecesaria si solo se necesita el modelo cuantizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nm-testing/int8_channel_weight_static_per_tensor_act-e2e
