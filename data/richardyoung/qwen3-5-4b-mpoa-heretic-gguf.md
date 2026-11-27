# richardyoung/Qwen3.5-4B-MPOA-heretic-GGUF

## Resumen

Qwen3.5-4B-MPOA-heretic-GGUF es una cuantización en formato GGUF de un modelo derivado de la familia Qwen3.5, publicada por el usuario richardyoung en Hugging Face. El modelo base, richardyoung/Qwen3.5-4B-MPOA-heretic, es una variante "abliterated" (también etiquetada como "heretic") de un modelo Qwen3.5 de 4B parámetros, es decir, una versión en la que se ha intervenido sobre el comportamiento de rechazo del modelo original para reducir las negativas a responder. Esta publicación concreta ofrece los pesos cuantizados para su uso con llama.cpp y Ollama.

El modelo cuenta con 4.205.751.296 parámetros totales según los datos de safetensors del repositorio, lo que lo sitúa en la categoría de modelos pequeños, aptos para ejecución en hardware de consumo. El repositorio ocupa 18,4 GB, lo que refleja la presencia de múltiples archivos de cuantización con distintos niveles de precisión. La licencia declarada es Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

La relevancia de esta ficha radica en que se trata de un modelo de investigación orientado a estudiar el comportamiento de modelos "abliterated" y sus implicaciones, no de un modelo pensado para producción general. La información disponible sobre arquitectura, entrenamiento y benchmarks es muy limitada, por lo que buena parte de los apartados técnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen3.5) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (múltiples niveles; el repo ocupa 18,4 GB, pero no se detallan los niveles concretos) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp y Ollama) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada. Por la denominación "Qwen3.5-4B" se infiere que deriva de la familia Qwen3.5 de Alibaba, pero no se confirman detalles como tipo de transformer, mecanismos de atención, número de capas o dimensión de los estados ocultos. El sufijo "MPOA" del nombre del modelo base no viene explicado en la información disponible.

El calificativo "heretic" y la etiqueta "abliterated" indican que el modelo ha sido sometido a un proceso de modificación orientado a eliminar o reducir los mecanismos de rechazo aprendidos durante el alineamiento del modelo original. No se especifican en la información disponible la metodología exacta de esa intervención, el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO posteriores. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" y el pipeline text-generation.
- Comportamiento "uncensored": el proceso de abliteración reduce los rechazos del modelo ante peticiones que el modelo original declinaría.
- Compatibilidad con llama.cpp y Ollama, lo que facilita su ejecución local.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo de idiomas del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo se comporta una variante abliterated frente al modelo original, comparando tasas de rechazo y tipos de respuesta en entornos controlados de laboratorio.
- Evaluación de robustez de filtros: sirve para probar sistemas de moderación y clasificadores de contenido que deban detectar respuestas no filtradas generadas por modelos locales.
- Experimentación con cuantizaciones GGUF: al ofrecer varios niveles de cuantización, es útil para medir la degradación de calidad y el ahorro de memoria en pipelines de llama.cpp.
- Pruebas de integración con Ollama: permite validar flujos de despliegue local en entornos de desarrollo sin depender de APIs externas.
- Generación de texto conversacional en inglés para prototipos: con 4B parámetros y formato GGUF, encaja en pruebas de chatbot local en estaciones de trabajo con GPU de consumo.
- Estudio de sesgos y comportamientos no deseados: al carecer de los rechazos habituales, facilita la recolección de ejemplos para análisis de riesgos en investigación académica.
- Benchmarking de latencia en hardware modesto: su tamaño permite medir throughput de inferencia en GPUs de gama media y comparar con modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamaño (4,2B parámetros), una cuantización de 4 bits requeriría del orden de 2,5-3 GB de VRAM solo para los pesos, y una de 8 bits del orden de 4,5-5 GB, sin contar el contexto ni el overhead del runtime.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores; también en A100 o H100 para despliegues con mayor concurrencia.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en la mayoría de GPUs con 6 GB o más de VRAM, aunque el dato exacto depende del nivel de cuantización elegido.
- Opciones de despliegue: llama.cpp y Ollama (declarados en las etiquetas); vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen3.5-4B-MPOA-heretic-GGUF | 4.205.751.296 | no disponible | apache-2.0 | GGUF | Variante abliterated, acceso restringido, solo inglés |
| Modelo base Qwen3.5-4B (original) | ~4B (no confirmado) | no disponible | no disponible | no disponible | Modelo de referencia sin abliterar; datos no verificados en la información disponible |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparativa con alternativas concretas queda limitada porque la información proporcionada no incluye especificaciones de modelos comparables.

## Limitaciones y advertencias

- El proceso de abliteración elimina o reduce los rechazos del modelo, lo que incrementa el riesgo de generar contenido dañino, ofensivo o inexacto sin advertencia.
- Riesgo elevado de alucinación, agravado por el tamaño reducido del modelo (4B) y por la falta de datos de evaluación publicados.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea limitado.
- Licencia Apache 2.0 declarada, pero el acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- El repositorio incluye una referencia a arXiv (arxiv:2611.17846) en las etiquetas, pero no se dispone del contenido del paper en la información proporcionada.
- No se recomienda su uso en producción orientada a usuarios finales sin capas adicionales de moderación y evaluación.
- El modelo está pensado para investigación; su uso comercial debe evaluarse con cautela dada la naturaleza del proceso de abliteración y la ausencia de benchmarks.
- No se documentan limitaciones específicas de contexto porque la longitud de ventana no está disponible.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-MPOA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.5-4B-MPOA-heretic
- Referencia arXiv citada en las etiquetas: arxiv:2611.17846 (no se dispone de URL verificada en la información proporcionada)
- Repositorio llama.cpp: no disponible en la información proporcionada
- Ollama: no disponible en la información proporcionada
