# oxfrug/nb-llama-3.1-8B-Instruct-exl2

## Resumen

El modelo `oxfrug/nb-llama-3.1-8B-Instruct-exl2` es una cuantización en formato EXL2 del modelo instructivo `NbAiLab/nb-llama-3.1-8B-Instruct`, desarrollado por el laboratorio noruego NbAiLab. Este modelo base es una adaptación de `meta-llama/Llama-3.1-8B-Instruct` con un enfoque multilingüe para las lenguas nórdicas: noruego bokmål, nynorsk, sueco, danés e inglés. La cuantización ha sido realizada por el usuario `oxfrug` con ExLlamaV2 0.3.2, ofreciendo cinco niveles de precisión (4.0, 4.5, 5.0, 5.5 y 6.0 bits por peso) para facilitar el despliegue en hardware con VRAM limitada.

Esta versión EXL2 resuelve el problema de la falta de formatos optimizados para ExLlamaV2 en el ecosistema nórdico, ya que el repositorio oficial solo publicaba pesos BF16 y GGUF. Al ser una cuantización del modelo instructivo de 8.000 millones de parámetros, conserva las capacidades de razonamiento, generación de texto, código y tool calling del Llama 3.1 original, con una ligera degradación esperable por la compresión. Es relevante para desarrolladores que necesitan ejecutar un modelo nórdico de calidad en GPUs de consumo, sin renunciar a la velocidad de inferencia que ofrece ExLlamaV2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama 3.1) |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128k tokens (nativo de Llama 3.1, no confirmado en la ficha de esta cuantización) |
| Tipos de cuantizacion | EXL2: 4.0, 4.5, 5.0, 5.5 y 6.0 bits por peso (ramas separadas) |
| Idiomas soportados | Noruego bokmål (no), nynorsk (nn), sueco (sv), danés (da), inglés (en) |
| Licencia | Meta Llama 3.1 Community License |
| Formato de pesos | EXL2 (archivos .safetensors con metadatos ExLlamaV2) |

## Arquitectura y entrenamiento

El modelo base `NbAiLab/nb-llama-3.1-8B-Instruct` parte de los pesos de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only con atención multi-cabeza con consultas agrupadas (GQA), incrustaciones rotatorias (RoPE) y normalización RMSNorm. NbAiLab realizó un fine-tuning instructivo sobre un corpus multilingüe nórdico, manteniendo la arquitectura original de 8B parámetros y la ventana de contexto de 128k tokens. No se dispone de información pública detallada sobre el dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO en el modelo original.

La cuantización EXL2 fue generada por `oxfrug` con ExLlamaV2 0.3.2, aplicando una calibración por defecto del propio framework. El `lm_head` se fijó a 6 bits en todas las ramas, mientras que el resto de capas se comprimieron según el bitrate objetivo de cada rama (4.0 a 6.0 bpw). El proceso consistió en una sola pasada de medición y posterior generación de cada bitrate a partir de `measurement.json`. No se aplicaron técnicas adicionales como GPTQ o AWQ; se trata de una cuantización estándar EXL2.

## Capacidades

- Generación de texto en cinco idiomas: noruego bokmål, nynorsk, sueco, danés e inglés, con especial solvencia en las lenguas escandinavas.
- Razonamiento y resolución de problemas matemáticos y lógicos, heredados del Llama 3.1 Instruct.
- Generación de código en múltiples lenguajes de programación, así como explicación y depuración de código.
- Soporte de tool calling / function calling, permitiendo la integración con APIs y herramientas externas.
- Capacidad de seguir instrucciones complejas y mantener conversaciones multi-turno con contexto largo (hasta 128k tokens en el modelo original).
- Capacidades multilingües adicionales más allá del nórdico, aunque con menor calidad que en los idiomas principales.
- Al ser una cuantización, conserva todas las capacidades del modelo base, con una posible degradación leve en tareas de alta precisión debido a la compresión.

## Casos de uso

- Atención al cliente automatizada en nórdico: el modelo puede gestionar conversaciones multi-turno en noruego, sueco o danés con contexto largo, ideal para centros de soporte que atienden a usuarios escandinavos. Su capacidad de tool calling permite conectarlo a sistemas de tickets o bases de conocimiento.
- Generación de contenido localizado: redacción de artículos, descripciones de producto o publicaciones en redes sociales en los cinco idiomas soportados, manteniendo un tono natural y culturalmente apropiado.
- Asistentes virtuales para administración pública nórdica: dado que el modelo está entrenado específicamente con datos nórdicos, puede responder consultas sobre trámites, normativas o servicios públicos en los idiomas oficiales de Noruega, Suecia y Dinamarca.
- Traducción y transcripción entre lenguas escandinavas: aunque no es un modelo de traducción dedicado, su entrenamiento multilingüe permite traducciones razonables entre noruego, sueco y danés, útiles para preprocesamiento o borradores.
- Generación de código con comentarios en nórdico: desarrolladores que trabajan en equipos escandinavos pueden pedir al modelo que genere funciones o explique algoritmos con explicaciones en su idioma local, mejorando la documentación interna.
- Análisis de sentimiento y resumen de textos nórdicos: el modelo puede resumir largos documentos (informes, actas, artículos) y extraer opiniones o temas clave, aprovechando su ventana de contexto de 128k tokens.
- Prototipado de chatbots para el sector turístico: empresas que operan en los países nórdicos pueden desplegar asistentes que respondan en inglés y en los idiomas locales, con un solo modelo que cubre todas las variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otras cuantizaciones. Dado que es una cuantización del modelo `NbAiLab/nb-llama-3.1-8B-Instruct`, se espera un rendimiento cercano al del modelo original en BF16, con una degradación típica de 1-3 puntos porcentuales en tareas de razonamiento según el bitrate elegido (mayor degradación en 4.0 bpw, menor en 6.0 bpw), pero estos datos no están verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: con EXL2, el modelo de 8B parámetros requiere aproximadamente 4-5 GB de VRAM en la rama de 4.0 bpw, 5-6 GB en 5.0 bpw y 6-7 GB en 6.0 bpw, sin contar la memoria para el contexto (que puede añadir varios GB adicionales con 128k tokens).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060) para la rama de 4.0 bpw con contexto moderado. Para 6.0 bpw y contexto largo, se recomienda 12 GB o más (RTX 4070 Ti, RTX 4080, RTX 4090, A100, H100).
- Sí cabe en GPUs de consumo: la rama de 4.0 bpw puede ejecutarse en GPUs con 8 GB de VRAM, como las de portátiles gaming o tarjetas de gama media.
- Opciones de despliegue: exclusivamente con ExLlamaV2 (librería `exllamav2`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato EXL2 solo es soportado por ExLlamaV2. Para otros runners habría que convertir a GGUF o usar los pesos BF16 originales.
- Latencia y throughput: no disponible en la información proporcionada. En general, ExLlamaV2 ofrece una inferencia rápida en GPUs NVIDIA, con velocidades típicas de 50-100 tokens/segundo en una RTX 4090 para modelos de 8B cuantizados, pero estos valores son orientativos y dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato disponible |
|---|---|---|---|---|---|
| `oxfrug/nb-llama-3.1-8B-Instruct-exl2` | 8B | 128k (nativo) | no, nn, sv, da, en | Llama 3.1 Community | EXL2 |
| `NbAiLab/nb-llama-3.1-8B-Instruct` | 8B | 128k | no, nn, sv, da, en | Llama 3.1 Community | BF16, GGUF |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128k | Principalmente inglés, multilingüe básico | Llama 3.1 Community | BF16, GGUF, MLX, etc. |

La comparativa muestra que esta cuantización EXL2 es la única opción para usuarios de ExLlamaV2 que quieran el modelo nórdico de NbAiLab. Frente al Llama 3.1 estándar, la ventaja es el entrenamiento específico en lenguas escandinavas, que mejora la fluidez y precisión en esos idiomas. La desventaja es la limitación del formato EXL2, que reduce la portabilidad a otros runners.

## Limitaciones y advertencias

- Al ser una cuantización, existe una degradación inherente en la precisión, especialmente en la rama de 4.0 bpw. Tareas que requieren razonamiento matemático exacto o generación de código muy preciso pueden verse afectadas.
- El modelo hereda los sesgos y limitaciones de Llama 3.1, incluyendo posibles sesgos de género, étnicos o culturales presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos largos o cuando se le pide datos específicos. Se recomienda verificación humana en aplicaciones críticas.
- La ventana de contexto de 128k tokens no está confirmada en esta cuantización; aunque el modelo base la soporta, la compresión EXL2 podría afectar al rendimiento con contextos muy largos.
- La licencia Meta Llama 3.1 Community License impone restricciones: uso comercial permitido solo si el número de usuarios mensuales del servicio no supera los 700 millones. Es obligatorio mantener el aviso de licencia (`NOTICE`).
- El formato EXL2 limita el despliegue a ExLlamaV2, que requiere GPU NVIDIA con CUDA. No es compatible con CPU, Mac (Apple Silicon) ni otros frameworks populares como vLLM o llama.cpp.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una cuantización reciente o poco probada por la comunidad. Se recomienda realizar pruebas propias antes de usarla en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oxfrug/nb-llama-3.1-8B-Instruct-exl2
- Modelo base (NbAiLab): https://huggingface.co/NbAiLab/nb-llama-3.1-8B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Meta Llama 3.1: https://www.llama.com/llama3_1/license/
- ExLlamaV2 (librería de carga): https://github.com/turboderp/exllamav2
