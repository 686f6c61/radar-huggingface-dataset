# mradermacher/Gemma-4-12B-Uncensored-GGUF

## Resumen

Gemma-4-12B-Uncensored-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Gemma-4-12B-Uncensored, publicado por el usuario mradermacher en Hugging Face. El modelo base procede de abacusai/Gemma-4-12B-Uncensored, un ajuste del Gemma 4 de Google con el alineamiento de seguridad relajado (uncensored). El repositorio que nos ocupa no entrena ni modifica los pesos más allá del proceso de cuantización: su valor está en ofrecer versiones listas para inferencia local en CPU y GPU de gama baja mediante llama.cpp y derivados.

El modelo cuenta con 11.907.350.576 parámetros totales (aproximadamente 12 mil millones), lo que lo sitúa en la gama media de la familia Gemma. El repositorio ocupa 46,2 GB e incluye múltiples niveles de cuantización (desde Q2_K hasta F16, pasando por Q3, Q4, Q5, Q6, Q8 e IQ4_XS), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

La relevancia de esta ficha es doble: por un lado, documenta una variante sin censura de un modelo de pesos abiertos de Google; por otro, muestra el flujo típico de publicación de cuantizaciones GGUF por parte de la comunidad para facilitar el despliegue en entornos con recursos limitados. No se dispone de información sobre licencia, idiomas o benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma; se asume transformer decoder-only, sin confirmar en la informacion) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas desde safetensors del modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada. Por el nombre y el linaje (Gemma-4-12B), se trata presumiblemente de un transformer decoder-only de la familia Gemma de Google, pero no se confirma en la documentación disponible. El repositorio es una conversión a GGUF del modelo abacusai/Gemma-4-12B-Uncensored, que a su vez es un ajuste del Gemma 4 original con el alineamiento de seguridad reducido.

El proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO, ajuste uncensored) no está documentado en la información disponible. La model card del repositorio GGUF solo incluye metadatos técnicos del proceso de cuantización (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y la lista de cuantizaciones generadas. No se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá de la conversión estándar a GGUF.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica que el modelo está orientado a diálogo multi-turno.
- Modo sin censura: al derivar de una variante "Uncensored", se espera que rechace menos solicitudes que el Gemma original, aunque no se documenta el alcance exacto de esta relajación.
- Inferencia local: las cuantizaciones GGUF permiten ejecución en CPU y GPU de consumo mediante llama.cpp, Ollama, LM Studio y otros motores compatibles.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a través de infraestructura compatible con la API de Hugging Face.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M o Q5_K_M, el modelo puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM, lo que permite prototipar asistentes conversacionales sin depender de la nube.
- Experimentación con modelos sin censura: investigadores que estudian el comportamiento de modelos con alineamiento relajado pueden comparar las respuestas de esta variante con el Gemma original en las mismas cuantizaciones.
- Generación de texto creativo sin filtros: escritura de ficción, guiones o contenido narrativo donde los rechazos del modelo base resultan limitantes, usando la cuantización Q6_K o Q8_0 para preservar calidad.
- Chatbots de dominio específico: fine-tuning posterior o uso directo en asistentes internos con contexto controlado, aprovechando el formato GGUF para desplegar en servidores con CPU y poca memoria.
- Evaluación de cuantizaciones: el repositorio incluye 12 niveles distintos, lo que permite medir el impacto de la cuantización en la calidad de las respuestas para un modelo de ~12B.
- Integración en pipelines de CI/CD para pruebas de regresión: usar llama.cpp con la cuantización Q4_K_S como referencia rápida y ligera en tests automatizados de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos):
  - F16: ~24 GB
  - Q8_0: ~12-13 GB
  - Q6_K: ~10 GB
  - Q5_K_M: ~8,5 GB
  - Q4_K_M: ~7,5 GB
  - Q4_K_S: ~7 GB
  - Q3_K_M: ~6 GB
  - Q2_K: ~4,5 GB
  - IQ4_XS: ~6,5 GB
- GPU recomendadas: A100 40 GB o H100 para F16; RTX 4090 (24 GB) para Q8_0 y superiores; RTX 4080/4070 Ti (12-16 GB) para Q5/Q6; RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4.
- Cabe en GPU de consumo: sí, desde Q4_K_M en adelante en GPUs con 8 GB o más; las cuantizaciones Q2_K e IQ4_XS permiten ejecución en GPUs de 6 GB o incluso en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (koboldcpp, etc.).
- Latencia y throughput: no disponible (no se publican mediciones en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Gemma-4-12B-Uncensored-GGUF | 11,9B | no disponible | no disponible | GGUF | Cuantizaciones del ajuste uncensored de abacusai |
| abacusai/Gemma-4-12B-Uncensored | 11,9B | no disponible | no disponible | safetensors | Modelo base del que derivan estas cuantizaciones |
| Gemma 4 (original, Google) | ~12B (segun familia) | no disponible | no disponible | safetensors | Modelo original con alineamiento de seguridad estándar |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base (abacusai/Gemma-4-12B-Uncensored) y del Gemma original antes de usarlo en producción.
- Modelo sin censura: la relajación del alineamiento de seguridad implica un mayor riesgo de generar contenido inapropiado, ofensivo o dañino; no es adecuado para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; como todo modelo de lenguaje de ~12B, puede inventar datos con seguridad aparente.
- Idiomas no confirmados: no se especifica qué idiomas soporta; el rendimiento en castellano es incierto.
- Contexto desconocido: no se indica la longitud de ventana; planificar despliegues con contexto largo sin confirmación previa es arriesgado.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S): pueden degradar notablemente la coherencia y la calidad de las respuestas; se recomienda Q4_K_M o superior para uso real.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad en el momento de la consulta.
- Trazabilidad limitada: la model card no incluye información sobre el dataset de ajuste uncensored ni sobre el proceso de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-4-12B-Uncensored-GGUF
- Modelo base: https://huggingface.co/abacusai/Gemma-4-12B-Uncensored
