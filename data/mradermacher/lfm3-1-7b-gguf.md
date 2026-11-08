# mradermacher/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B-GGUF es una conversión a formato GGUF del modelo LFM3-1.7B desarrollado por Liquid AI, publicada por el usuario mradermacher en Hugging Face. Se trata de una cuantización estática del modelo original en precisión completa, pensada para facilitar su despliegue en entornos con recursos limitados mediante herramientas compatibles con GGUF como llama.cpp u Ollama. El modelo base es un modelo de generación de texto de aproximadamente 1.700 millones de parámetros (2B según la model card de Liquid AI) orientado a agentes locales y aplicaciones especializadas.

La relevancia de esta ficha radica en que el modelo original emplea la arquitectura LFM3 "tri-hybrid" de Liquid AI y declara una ventana de contexto de 256K tokens con soporte nativo de tool calling, lo que lo sitúa en la categoría de modelos pequeños con contexto largo y capacidades agénticas. Esta conversión GGUF permite ejecutar dichas capacidades en hardware de consumo, algo que el checkpoint original en safetensors no facilita directamente.

No obstante, la información disponible sobre esta publicación concreta es mínima: la model card se limita a indicar que son cuantizaciones estáticas del modelo original y a listar los tipos de cuantización generados. No se han publicado datos de licencia, idiomas, benchmarks ni pipeline en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 tri-hybrid (según documentación de Liquid AI); detalles internos no disponibles |
| Parametros totales | 1,7B (2B según la model card de Liquid AI) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (según documentación de Liquid AI para el modelo base) |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea, según la documentación de Liquid AI, una arquitectura denominada "LFM3 tri-hybrid", si bien no se dispone en la información proporcionada de detalles sobre la composición exacta de dicha arquitectura (proporción de capas de atención, capas recurrentes o mecanismos híbridos). La documentación oficial lo describe como un modelo de texto de 1,7B parámetros con ventana de contexto de 256K tokens y tool calling nativo, orientado a agentes locales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Esta publicación de mradermacher es una conversión estática (convert_type: hf, quantize_version: 2) del checkpoint original de Liquid AI, sin reentrenamiento ni modificación de los pesos más allá de la cuantización.

## Capacidades

- Generación de texto: el modelo base está diseñado para tareas de generación de texto general.
- Tool calling nativo: la documentación de Liquid AI indica soporte nativo de llamada a herramientas, adecuado para flujos agénticos.
- Contexto largo: ventana declarada de 256K tokens en el modelo base, útil para documentos extensos y conversaciones multi-turno prolongadas.
- Agentes locales: el modelo se posiciona explícitamente para "local agents and specialized applications".
- Capacidades multilingües: no disponible en la información proporcionada.
- Razonamiento, código, matemáticas, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Agentes locales en hardware de consumo: gracias a la cuantización GGUF (por ejemplo Q4_K_M), el modelo puede ejecutarse en equipos sin GPU dedicada o con GPU de gama media mediante llama.cpp u Ollama, habilitando asistentes agénticos que no dependen de la nube.
- Procesamiento de documentos largos: la ventana de 256K tokens del modelo base permite resumir o extraer información de contratos, informes o expedientes extensos en una sola pasada, siempre que el hardware soporte el contexto completo.
- Automatización de flujos con herramientas: el tool calling nativo permite conectar el modelo a APIs, bases de datos o sistemas de ficheros en pipelines de automatización internos.
- Prototipado rápido de aplicaciones de texto: el tamaño reducido y los múltiples niveles de cuantización (desde Q2_K hasta Q8_0) permiten ajustar el equilibrio entre calidad y consumo de memoria durante el desarrollo.
- Asistentes de soporte en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen de la infraestructura del usuario, lo que encaja en escenarios con datos sensibles.
- Evaluación comparativa de cuantizaciones: la disponibilidad de 12 variantes permite medir el impacto de la cuantización en la calidad de salida para un caso de uso concreto antes de fijar una configuración de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño y cuantización):
  - Q8_0 / x-f16: en torno a 2-3,5 GB.
  - Q5_K_M / Q4_K_M: en torno a 1,2-1,5 GB.
  - Q2_K / IQ4_XS: en torno a 0,8-1,1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones altas; el modelo también puede ejecutarse íntegramente en CPU.
- GPU de consumo: cabe en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; en cuantizaciones bajas puede ejecutarse incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y otros runners compatibles con GGUF. Para el checkpoint original en safetensors, vLLM o TGI (no verificado en la información disponible).
- Latencia y throughput: no disponible. Nota: contextos de 256K tokens requieren memoria KV adicional considerable, que puede exceder la capacidad de GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-GGUF (esta ficha) | 1,7B | 256K (modelo base) | no disponible | GGUF | Cuantización comunitaria de LFM3-1.7B |
| LFM3-1.7B (original) | 1,7B | 256K | no disponible | safetensors | Checkpoint oficial de Liquid AI |
| Alternativas de ~1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría (por ejemplo, otras familias de 1-2B parámetros). Se indica "no disponible".

## Limitaciones y advertencias

- La model card de esta publicación no incluye información sobre licencia; debe consultarse la licencia del modelo original LFM3-1.7B de Liquid AI antes de cualquier uso comercial.
- No se han publicado datos sobre idiomas soportados; el rendimiento en castellano es desconocido.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de salida y la fiabilidad del tool calling.
- Aunque el modelo base declara 256K tokens de contexto, ejecutar contextos tan largos en GGUF requiere memoria KV muy elevada y puede no ser viable en hardware de consumo.
- Riesgo de alucinación inherente a modelos de este tamaño; no se han publicado evaluaciones de fidelidad.
- Sesgos conocidos: no disponible.
- Esta publicación es una conversión comunitaria no oficial; para producción se recomienda validar contra el checkpoint original de Liquid AI.

## Enlaces

- Publicación GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-GGUF
- Modelo original: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm3-1.7b
