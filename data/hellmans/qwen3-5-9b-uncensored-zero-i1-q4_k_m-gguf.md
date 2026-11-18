# hellmans/Qwen3.5-9B-uncensored-zero.i1-Q4_K_M-GGUF

## Resumen

Qwen3.5-9B-uncensored-zero.i1-Q4_K_M-GGUF es una cuantización en formato GGUF de un modelo de lenguaje de la familia Qwen 3.5, publicada por el usuario hellmans en Hugging Face. El modelo base declarado es "Qwen3.5-9B-uncensored-zero", una variante del modelo Qwen3.5 de 9B parámetros sometida a un proceso de "uncensoring" (eliminación o atenuación de los mecanismos de rechazo y alineación) por parte de la comunidad. Esta ficha se refiere concretamente al artefacto cuantizado publicado, no al modelo original de Alibaba.

El repositorio contiene un único archivo GGUF con cuantización Q4_K_M generada mediante imatrix (importance matrix), una técnica que mejora la calidad de la cuantización de 4 bits ponderando los pesos según su importancia. El tamaño del repositorio es de 5,6 GB y el recuento de parámetros del modelo base, según los safetensors originales, es de 8.953.803.264 (aproximadamente 8,95 mil millones). La model card no aporta información técnica adicional: no incluye descripción de arquitectura, datos de entrenamiento, benchmarks ni idiomas soportados.

La relevancia de este artefacto es limitada y de nicho: se trata de una publicación con cero descargas y cero likes en el momento de la consulta, sin licencia definida y sin documentación. Resulta útil únicamente para quien busque una versión cuantizada y sin filtros de un modelo de ~9B para ejecución local, asumiendo el riesgo de licencia desconocida y la ausencia de garantías de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5, arquitectura transformer; no detallada en la información) |
| Parámetros totales | 8.953.803.264 (~8,95B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF, generada con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | unknown (desconocida) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. Por la denominación "Qwen3.5" se infiere que deriva de la familia Qwen de Alibaba, de arquitectura transformer, pero no se confirma en la model card ni se detallan capas, atención, tamaño de vocabulario ni ventana de contexto. El modelo base declarado lleva el sufijo "uncensored-zero", lo que indica una modificación comunitaria orientada a eliminar o reducir el comportamiento de rechazo, típicamente mediante fine-tuning sobre datasets sin filtros o mediante abliteration; no se especifica el método.

Respecto al entrenamiento, no hay datos disponibles sobre número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas. La única información técnica concreta del artefacto publicado es el proceso de cuantización: Q4_K_M con imatrix, que produce pesos de aproximadamente 4,5 bits efectivos por parámetro y un archivo de unos 5,6 GB, coherente con un modelo de ~9B parámetros.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" del repositorio indica uso previsto para diálogo.
- Razonamiento y código: capacidades presumibles por herencia de la familia Qwen3.5, aunque no documentadas en este artefacto.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Comportamiento sin filtros: el sufijo "uncensored" indica que el modelo base fue modificado para reducir rechazos, aunque el alcance real de esa modificación no está documentado.

## Casos de uso

- Inferencia local en equipos de consumo: el archivo Q4_K_M de 5,6 GB permite ejecutar un modelo de ~9B en GPUs con 8 GB de VRAM o en CPU con RAM suficiente, usando llama.cpp u Ollama, sin depender de servicios en la nube.
- Experimentación con modelos sin alineación: útil para investigadores que estudian el comportamiento de modelos tras procesos de uncensoring y comparan respuestas frente a la versión alineada original.
- Generación creativa sin restricciones de contenido: escritura de ficción, guiones o narrativa donde los filtros de seguridad del modelo base resultan limitativos, asumiendo la responsabilidad legal y ética del contenido generado.
- Prototipado rápido de chatbots: la etiqueta "conversational" y el formato GGUF permiten montar un prototipo de chat local en minutos con llama.cpp server u Ollama, sin infraestructura dedicada.
- Evaluación de cuantización con imatrix: sirve como caso práctico para medir la pérdida de calidad de Q4_K_M con imatrix frente a los pesos originales en tareas de generación y razonamiento.
- Pruebas de robustez y red teaming: al carecer de filtros, es un candidato para evaluar la eficacia de sistemas de moderación externos que deban operar sobre las salidas del modelo.
- Despliegue en entornos aislados (air-gapped): al ser un archivo único GGUF, puede copiarse a máquinas sin conexión para pruebas internas, siempre que se resuelva la ambigüedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB con Q4_K_M (5,6 GB de pesos más overhead de contexto y caché KV); con contexto largo la demanda de VRAM crece de forma proporcional.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en el ámbito profesional, A100 o H100 si se busca mayor throughput con contexto amplio.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; en GPUs de 6 GB requeriría offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa (requerirían conversión a safetensors).
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend. Como referencia orientativa, un modelo de ~9B en Q4_K_M suele generar entre 20 y 50 tokens/s en GPUs de consumo recientes, pero no hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hellmans/Qwen3.5-9B-uncensored-zero.i1-Q4_K_M-GGUF | ~8,95B | no disponible | Q4_K_M GGUF | unknown | Hugging Face, 0 descargas |
| Qwen3.5-9B (modelo base, presumible) | ~9B | no disponible | safetensors y GGUF oficiales | según familia Qwen (no confirmada) | Hugging Face, oficial |
| Llama 3.1 8B Instruct | 8B | 128K | múltiples (GGUF, AWQ, etc.) | Llama 3.1 Community License | amplia, con ecosistema maduro |
| Mistral 7B Instruct | 7,2B | 32K | múltiples | Apache 2.0 | amplia |

La comparación con el modelo base y con alternativas de la misma categoría (~7-9B) es desfavorable en términos de trazabilidad: frente a Llama 3.1 8B o Mistral 7B, este artefacto carece de licencia clara, documentación, benchmarks e idiomas declarados, aunque ofrece el aliciente de un comportamiento sin filtros que las alternativas alineadas no proporcionan.

## Limitaciones y advertencias

- Licencia desconocida: la model card declara "license: unknown", lo que impide determinar si el uso comercial está permitido; en la práctica, tratar el modelo como no apto para producción comercial hasta aclarar la licencia del modelo base y de la modificación.
- Sin documentación: no hay información sobre arquitectura, contexto, idiomas, datos de entrenamiento ni evaluación; cualquier decisión de producción basada en este artefacto carece de base técnica verificable.
- Riesgo de alucinación: no cuantificado; los modelos de ~9B y las variantes sin alineación suelen presentar mayor propensión a generar contenido factualmente incorrecto sin señales de duda.
- Ausencia de filtros de seguridad: el proceso "uncensored" elimina o reduce los rechazos, lo que aumenta el riesgo de generar contenido dañino, ilegal o sesgado; requiere moderación externa obligatoria en cualquier despliegue público.
- Sesgos conocidos: no documentados; los sesgos del modelo base persisten y la modificación comunitaria puede haberlos alterado de forma no controlada.
- Idiomas: no se declara lista de idiomas soportados; el rendimiento fuera del inglés y el chino (idiomas habituales de la familia Qwen) es incierto.
- Reputación del artefacto: cero descargas y cero likes en el momento de la consulta, sin historial de validación por la comunidad.
- Fecha de creación futura en los metadatos (2026-11-18): inconsistencia que sugiere que los metadatos del repositorio no son fiables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hellmans/Qwen3.5-9B-uncensored-zero.i1-Q4_K_M-GGUF
- Modelo base declarado ("Qwen3.5-9B-uncensored-zero"): no se proporciona enlace en la información disponible.
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
