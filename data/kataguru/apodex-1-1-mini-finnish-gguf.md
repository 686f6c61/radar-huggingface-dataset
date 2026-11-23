# kataguru/Apodex-1.1-mini-Finnish-GGUF

## Resumen

Apodex-1.1-mini-Finnish-GGUF es una cuantización en formato GGUF del modelo multimodal Apodex-1.1-mini, publicada por el usuario kataguru en Hugging Face. El modelo base, desarrollado por apodex, es un transformer de tipo Mixture of Experts (MoE) disperso con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, diseñado para generación de texto, razonamiento y comprensión de imágenes.

La contribución de kataguru se limita a dos elementos: la integración de una plantilla de chat en finlandés (Jinja2) directamente en los metadatos del modelo, y la conversión a GGUF mediante llama.cpp (build b11064). No se han modificado la arquitectura, los pesos preentrenados ni el vocabulario. El resultado es un paquete listo para inferencia local en finlandés e inglés, con soporte de visión nativo mediante un proyector multimodal separado (`mmproj`).

El modelo resulta relevante porque combina una ventana de contexto teórica de 262.144 tokens con un coste computacional por token propio de un modelo de 3B, gracias a su arquitectura MoE con 8 expertos activos de 256 por token. Su licencia Apache 2.0 y su disponibilidad en GGUF lo hacen apto para despliegue en hardware de consumo de gama alta, algo poco habitual en modelos con capacidades multimodales y contexto extendido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con atención híbrida (30 capas de Linear Attention GDN y 10 capas de Full Attention) |
| Parametros totales | 35.505.251.456 (aproximadamente 35,5B) |
| Parametros activos | Aproximadamente 3B por token (8 expertos activos de 256) |
| Longitud de contexto | 262.144 tokens (máximo arquitectónico teórico) |
| Tipos de cuantizacion | Q3_K_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K (GGUF); proyector de visión en BF16 |
| Idiomas soportados | Finés (fi) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp build b11064); proyector multimodal separado en GGUF BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos dispersa: de los 256 expertos disponibles, se activan 8 por token, lo que resulta en unos 3.000 millones de parámetros efectivos por paso de inferencia frente a los 35,5B totales. La capa de atención es híbrida, con 30 capas de Linear Attention (denominada GDN en la documentación del autor) y 10 capas de Full Attention, una combinación orientada a reducir el coste de atención en contextos largos manteniendo capacidad de recuperación precisa. La ventana de contexto máxima es de 262.144 tokens, aunque el autor advierte que superar los 32.000 tokens incrementa de forma significativa el consumo de memoria de la KV cache.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. El modelo soporta un modo de razonamiento interno mediante la etiqueta `<think>`, con niveles de profundidad configurables a través de directivas como `{REASON:spoon}`, `{REASON:einstein}` y `{REASON:none}`. La publicación de kataguru no introduce cambios arquitectónicos ni de pesos; su aportación es la plantilla de chat en finlandés integrada en los metadatos, que según el autor mejora el tratamiento de los casos gramaticales finlandeses y del lenguaje técnico respecto al prompt base original.

## Capacidades

- Generación de texto conversacional en finlandés e inglés, con plantilla de chat integrada en los metadatos del GGUF.
- Razonamiento explícito mediante cadena de pensamiento interna (`<think>`) con tres niveles de profundidad configurables.
- Comprensión de imágenes y OCR nativo en finlandés, a través del proyector multimodal `mmproj-Apodex-1.1-mini-Finnish-BF16.gguf`.
- Procesamiento de documentos escaneados y lectura de texto en imágenes.
- Generación de código y resolución de problemas matemáticos, aunque con menor fiabilidad que modelos densos de mayor tamaño según las propias notas del autor.
- Soporte de contexto largo de hasta 262.144 tokens teóricos.
- Compatibilidad con llama.cpp, LM Studio y endpoints compatibles con la API de OpenAI (según los tags del repositorio).
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Atención al cliente en finlandés: el modelo puede mantener conversaciones multi-turno con una plantilla de chat nativa que maneja correctamente los casos gramaticales del finés, adecuado para empresas finlandesas que necesiten un asistente local sin dependencia de la nube.
- Digitalización de documentos administrativos finlandeses: con el proyector de visión y OCR nativo, permite extraer texto de formularios, facturas y documentos escaneados en finés, ejecutándose en una sola GPU de 24 GB.
- Análisis de contratos y textos legales largos: la ventana de 262.144 tokens permite procesar expedientes completos, aunque en la práctica conviene limitar el contexto a unos 32.000 tokens para controlar el consumo de KV cache.
- Asistente de razonamiento técnico en local: con el modo `<think>` configurable, resulta útil para depuración de problemas y explicaciones paso a paso en entornos con requisitos de privacidad, donde no se pueden enviar datos a APIs externas.
- Generación de código en pipelines internos: puede integrarse en herramientas de desarrollo mediante llama.cpp o endpoints compatibles con la API de OpenAI, aunque el autor advierte que su fiabilidad en programación profunda queda por debajo de modelos densos de 27B.
- Procesamiento de imágenes con descripción en finlandés: clasificación y descripción de imágenes en aplicaciones de accesibilidad o catalogación, usando el proyector multimodal junto con el modelo principal.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones Q3_K_M (15,98 GiB) e IQ4_XS (18,05 GiB) permiten ejecución local en GPUs de 16 a 24 GB, habilitando prototipado rápido sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente proporciona mediciones de rendimiento de inferencia con `llama-bench` sobre una NVIDIA GeForce RTX 5090 de 32 GB, con backend CUDA y Flash Attention activado:

| Cuantizacion | Tamano | VRAM estimada | Prompt eval (pp512) | Generacion (tg128) |
|---|---|---|---|---|
| Q3_K_M | 15,98 GiB | ~16,5 GB | 6.836,6 tok/s | 253,8 tok/s |
| IQ4_XS | 18,05 GiB | ~18,6 GB | 6.628,3 tok/s | 263,5 tok/s |
| Q4_K_M | 20,21 GiB | ~21,0 GB | 6.586,3 tok/s | 262,6 tok/s |
| Q5_K_M | 24,10 GiB | ~25,0 GB | ~6.400 tok/s | ~255 tok/s |
| Q6_K | 28,20 GiB | ~29,5 GB | ~6.200 tok/s | ~250 tok/s |
| mmproj BF16 | 861 MiB | +0,9 GB | no aplica | no aplica |

## Requisitos de hardware

- VRAM estimada: entre 16,5 GB (Q3_K_M) y 29,5 GB (Q6_K), más 0,9 GB adicionales si se utiliza el proyector de visión.
- GPU recomendadas: RTX 5090 de 32 GB para las cuantizaciones Q5_K_M y Q6_K; RTX 3090, 4090 o 5090 de 24 GB para Q4_K_M e IQ4_XS; RTX 4080, 5080 o Mac con 16 GB o más para Q3_K_M.
- Compatibilidad con GPU de consumo: sí, desde una RTX 4080 de 16 GB con la cuantización Q3_K_M. Las cuantizaciones de mayor calidad requieren 24 GB o más.
- Opciones de despliegue: llama.cpp (build b11064 o superior), LM Studio, y endpoints compatibles con la API de OpenAI según los tags del repositorio. No se documenta soporte de vLLM ni TGI para este formato.
- Rendimiento medido: 253,8 a 263,5 tokens por segundo en generación y 6.200 a 6.836 tokens por segundo en evaluación de prompt sobre RTX 5090.
- Advertencia de contexto: superar los 32.000 tokens de contexto incrementa notablemente la memoria necesaria para la KV cache, lo que puede exceder la VRAM disponible en GPUs de 24 GB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base Apodex-1.1-mini ni de la versión de kataguru, por lo que la comparación se limita a características estructurales. El autor menciona en sus notas un modelo denso de 27B denominado "Titan" como referencia de mayor fiabilidad en razonamiento profundo, pero no aporta especificaciones ni resultados del mismo.

| Modelo | Parametros | Activos | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|---|
| Apodex-1.1-mini-Finnish (este) | 35,5B | ~3B | 262.144 | Si (mmproj) | Apache 2.0 | GGUF |
| Modelo denso 27B ("Titan", citado por el autor) | 27B | 27B | no disponible | no disponible | no disponible | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la información proporcionada otros modelos de la misma categoría (MoE con visión y contexto largo en finlandés) con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Fiabilidad en razonamiento complejo: al activar solo unos 3B de parámetros por token, el autor reconoce que el modelo queda por debajo de modelos densos de 27B en problemas lógicos de varios pasos y en programación avanzada.
- Consumo de memoria en contexto largo: aunque la ventana teórica es de 262.144 tokens, superar los 32.000 dispara el uso de KV cache y puede provocar errores de memoria en GPUs de 24 GB.
- Cobertura lingüística limitada: solo finlandés e inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o alineación en la información disponible.
- Riesgo de alucinación: no se han publicado métricas de fidelidad factual ni evaluaciones de alucinación para el modelo base ni para esta cuantización.
- Trazabilidad de la cuantización: la publicación la mantiene un usuario individual (kataguru) y no el equipo original de apodex; conviene verificar la integridad de los pesos antes de usos en producción.
- Soporte de herramientas: no se documenta tool calling ni function calling, lo que limita su uso en pipelines de agentes.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base `apodex/Apodex-1.1-mini` por si existieran términos adicionales no reflejados en esta ficha.
- Idiomas y prompt: la plantilla de chat en finlandés está integrada en los metadatos; alterarla o sustituirla puede degradar el rendimiento observado por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kataguru/Apodex-1.1-mini-Finnish-GGUF
- Modelo base: https://huggingface.co/apodex/Apodex-1.1-mini
- llama.cpp (build b11064): https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
