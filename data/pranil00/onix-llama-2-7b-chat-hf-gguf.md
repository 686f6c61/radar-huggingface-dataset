# pranil00/ONIX-Llama-2-7b-chat-hf-GGUF

## Resumen

ONIX-Llama-2-7b-chat-hf-GGUF es una cuantización en formato GGUF (Q4_K_M) del modelo NousResearch/Llama-2-7b-chat-hf, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". Se trata, por tanto, de una redistribución cuantizada de un modelo derivado de Llama 2 Chat de 7 mil millones de parámetros, no de un modelo entrenado desde cero. El propósito es ofrecer pesos ligeros (3,80 GB) listos para ejecutarse en llama.cpp u Ollama sobre hardware de consumo.

El modelo base conserva la arquitectura transformer decoder-only de Llama 2, con 6.738.415.616 parámetros y una ventana de contexto de 4096 tokens (característica estándar de la familia Llama 2). La cuantización Q4_K_M reduce el peso a aproximadamente 4 bits por parámetro con mezcla de precisión en determinadas capas, lo que permite inferencia en GPUs consumer y en Apple Silicon.

La relevancia de esta ficha es limitada: el repositorio no presenta descargas ni interacciones, la model card es mínima y no documenta datos de entrenamiento, evaluación ni idiomas. Debe tratarse como una conversión de pesos de conveniencia, no como un modelo con garantías de calidad propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (estándar de Llama 2; no documentado en la model card) |
| Tipos de cuantizacion | Q4_K_M (único publicado en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en el repo) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B Chat: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base NousResearch/Llama-2-7b-chat-hf es una réplica de pesos de Llama 2 Chat publicada por NousResearch. El entrenamiento original de Llama 2 Chat incluyó ajuste supervisado y optimización con RLHF (rechazo de muestras y PPO), según la documentación pública de Meta, aunque esta información no se detalla en la model card del repositorio.

La contribución de este repositorio es exclusivamente la cuantización: conversión de tensores a Q4_K_M mediante llama.cpp, según indica el autor, realizada en Apple Silicon con Metal. No hay información sobre el proceso exacto de conversión, la verificación de perplejidad ni comparaciones con el modelo original en precisión completa.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 2 Chat.
- Razonamiento básico e instrucciones en inglés principalmente (los idiomas no están documentados en el repo).
- Generación de código y respuestas a preguntas, con calidad propia de un modelo de 7B de 2023.
- No se documenta soporte de tool calling ni function calling nativo.
- No se documenta modo de razonamiento extendido (thinking mode).
- No dispone de capacidades de visión ni audio.
- No se documenta soporte de agentes ni multi-step reasoning estructurado.

## Casos de uso

- Prototipado local de chatbots: permite levantar un asistente conversacional en una estación de trabajo con llama.cpp u Ollama sin depender de APIs, gracias a los 3,80 GB de pesos cuantizados.
- Pruebas de integración de pipelines GGUF: útil para validar flujos de inferencia con llama.cpp antes de migrar a modelos más recientes o de mayor tamaño.
- Experimentación educativa: sirve para estudiar el comportamiento de Llama 2 Chat cuantizado en entornos con recursos limitados.
- Generación de texto offline en portátiles con Apple Silicon: el autor indica que la cuantización se realizó en Metal, y el tamaño permite ejecución en memoria unificada de 8-16 GB.
- Evaluación comparativa de cuantizaciones: puede emplearse como referencia Q4_K_M frente a otras cuantizaciones del mismo modelo base (Q5_K_M, Q8_0).
- Desarrollo de asistentes en inglés para tareas de baja criticidad: resumen de texto, redacción asistida y respuesta a preguntas simples, asumiendo las limitaciones de un 7B de 2023.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4-5 GB para el archivo Q4_K_M de 3,80 GB más overhead de contexto y KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 (holgada); también ejecutable en Apple Silicon con memoria unificada de 8 GB o superior.
- Cabe en GPU consumer: sí, en cualquier GPU con 6 GB o más de VRAM para contexto corto.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (ollama run pranil00/ONIX-Llama-2-7b-chat-hf-GGUF), y servidores compatibles con GGUF. No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Llama-2-7b-chat-hf-GGUF | 6,74 B | 4096 (estándar Llama 2) | apache-2.0 (declarada) | GGUF Q4_K_M | Hugging Face, 0 descargas |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | Llama 2 Community License | safetensors | Hugging Face, ampliamente usado |
| TheBloke/Llama-2-7B-Chat-GGUF | 6,74 B | 4096 | Llama 2 Community License | GGUF (múltiples cuantizaciones) | Hugging Face, muy descargado |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32768 | Apache 2.0 | safetensors, GGUF | Hugging Face, ampliamente usado |

## Limitaciones y advertencias

- Modelo base de 2023: Llama 2 Chat está desactualizado frente a modelos de 7B actuales en razonamiento, código y seguimiento de instrucciones.
- Riesgo de alucinación: propio de un modelo de 7B sin mecanismos de verificación; no debe usarse en dominios críticos sin supervisión.
- Idiomas no documentados: la model card no especifica cobertura lingüística; se asume predominio del inglés.
- Licencia ambigua: el repo declara apache-2.0, pero el modelo base Llama 2 se distribuye bajo la Llama 2 Community License, que impone restricciones adicionales (umbral de 700 millones de usuarios mensuales, uso aceptable). Conviene verificar la licencia aplicable antes de uso comercial.
- Repositorio sin tracción: 0 descargas y 0 likes; no hay evidencia de validación por la comunidad ni de calidad de la conversión.
- Sin benchmarks publicados: no hay métricas de perplejidad ni evaluaciones que confirmen que la cuantización preserva la calidad del modelo original.
- Contexto limitado a 4096 tokens: insuficiente para tareas de contexto largo.
- Sin soporte documentado de tool calling ni agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Llama-2-7b-chat-hf-GGUF
- Modelo base: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
