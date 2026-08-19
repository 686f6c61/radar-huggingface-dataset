# nubich2026/claude-toolcall-slm-2B-safetensors-IQ4_XS-GGUF

## Resumen

El modelo `nubich2026/claude-toolcall-slm-2B-safetensors-IQ4_XS-GGUF` es una conversión a formato GGUF del modelo base `mondk/claude-toolcall-slm-2B-safetensors`, un pequeño modelo de lenguaje de 1.711.378.432 parámetros (aproximadamente 1,7 mil millones) especializado en llamadas a herramientas (tool calling). El modelo base fue desarrollado por el usuario `mondk` y entrenado a partir de una combinación de datasets públicos como `HuggingFaceTB/smollm-corpus`, `bigcode/the-stack`, `HuggingFaceTB/smoltalk` y `openbmb/UltraFeedback`, junto con trazas de interacciones de Claude Code (`mondk/claude-code-fable-5-traces.jsonl`). Esta versión GGUF, creada por `nubich2026` mediante el espacio GGUF-my-repo de llama.cpp, está cuantizada con IQ4_XS e incluye matriz de importancia (imatrix), lo que la hace adecuada para ejecución eficiente en CPU y GPU con recursos limitados.

La relevancia de este modelo radica en su tamaño compacto combinado con capacidades de tool calling, un área típicamente dominada por modelos mucho más grandes. Al estar en formato GGUF, puede desplegarse fácilmente con llama.cpp, Ollama u otros motores compatibles, lo que lo convierte en una opción práctica para prototipos, edge computing o aplicaciones donde el presupuesto de cómputo es reducido. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, aunque el modelo solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (no se especifica detalle adicional) |
| Parametros totales | 1.711.378.432 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo: `claude-toolcall-slm-2b-safetensors-iq4_xs-imat.gguf`) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada, pero por el tamaño y el nombre del modelo base (que usa el sufijo `slm`, probablemente "small language model"), se trata de un transformer decoder denso de aproximadamente 1,7 mil millones de parámetros. El modelo base fue entrenado sobre una mezcla de corpus generales (`smollm-corpus`), código fuente (`the-stack`), datos de conversación (`smoltalk`) y preferencias humanas (`UltraFeedback`), además de trazas de Claude Code para inculcar habilidades de tool calling. No se especifica el número de tokens de entrenamiento ni el método de alineación (RLHF, DPO, etc.), aunque la inclusión de `UltraFeedback` sugiere un posible fine-tuning con preferencias.

La conversión a GGUF se realizó con llama.cpp, aplicando cuantización IQ4_XS (4 bits con mejoras de precisión) y cálculo de matriz de importancia (imatrix) para optimizar la calidad de la cuantización. No hay innovaciones arquitectónicas destacables más allá de su enfoque en tool calling para un tamaño tan reducido.

## Capacidades

- Generación de texto en inglés con razonamiento básico.
- Tool calling / function calling: el modelo está específicamente entrenado con trazas de Claude Code, lo que sugiere capacidad para invocar funciones y herramientas en formato JSON.
- Soporte para agentes y multi-step reasoning limitado por su tamaño, pero funcional para tareas simples.
- No se mencionan capacidades multimodales (visión, audio) ni soporte multilingüe más allá del inglés.
- Compatible con la API de llama.cpp y, por extensión, con frameworks que la usan (llama-cpp-python, Ollama, etc.).

## Casos de uso

- Automatización de tareas con tool calling en entornos de bajos recursos: el modelo puede invocar funciones externas (búsquedas, APIs, cálculos) en un pipeline de agente simple, ejecutándose en CPU o GPU de gama baja.
- Chatbots de atención al cliente en inglés para dominios acotados: su tamaño permite desplegarlo en servidores pequeños o incluso en dispositivos edge, gestionando conversaciones de pocos turnos con contexto limitado.
- Generación de código asistida en entornos sin conexión: al estar entrenado con `the-stack`, puede sugerir fragmentos de código y completar funciones, aunque con menor precisión que modelos más grandes.
- Prototipado rápido de aplicaciones de IA generativa: gracias a su licencia permisiva y formato GGUF, es fácil de integrar en demos y pruebas de concepto.
- Filtrado y clasificación de texto: puede usarse como clasificador de intenciones o extractor de entidades en inglés, aprovechando su capacidad de seguir instrucciones.
- Educación e investigación en tool calling: sirve como modelo de referencia para estudiar cómo los modelos pequeños pueden aprender a usar herramientas, sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo o su versión base.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF IQ4_XS ocupa aproximadamente 0,9 GB, por lo que la VRAM necesaria es de alrededor de 1-2 GB (incluyendo overhead de contexto y KV cache). Con contexto corto (2048 tokens), cabe en GPUs con 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3060, etc.) o incluso iGPU modernas. También funciona en CPU con 4 GB de RAM.
- Si cabe en consumer GPU: sí, en prácticamente cualquier GPU de consumo actual.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama, llama-cpp-python, o cualquier framework compatible con GGUF.
- Latencia y throughput estimados: no se proporcionan datos oficiales; en una CPU moderna (8 núcleos) se pueden esperar velocidades de 10-20 tokens/s, y en una GPU como RTX 3060, 50-100 tokens/s, dependiendo del contexto.

## Comparativa con modelos similares

No se dispone de información comparativa directa. Sin embargo, por tamaño y enfoque, podría compararse con otros modelos pequeños como SmolLM2-1.7B o Qwen2.5-1.5B, aunque no hay datos de rendimiento para establecer una comparación rigurosa. La principal diferencia es su entrenamiento específico en tool calling, que no es común en modelos de este tamaño.

## Limitaciones y advertencias

- Tamaño reducido: la capacidad de razonamiento complejo y generación de código avanzado es limitada en comparación con modelos de 7B o superiores.
- Solo inglés: no soporta otros idiomas de forma fiable.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar respuestas incorrectas o inventar información, especialmente en temas especializados.
- Tool calling no garantizado: aunque el entrenamiento incluye trazas de Claude Code, no hay evidencia pública de la robustez de esta capacidad; es recomendable validar en casos de uso concretos.
- Contexto limitado: no se especifica la longitud de contexto, pero por el tamaño del modelo es probable que sea de 2048 o 4096 tokens, insuficiente para documentos largos.
- Sin benchmarks publicados: no hay métricas objetivas de calidad, por lo que el rendimiento real es incierto.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad del comportamiento del modelo.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/nubich2026/claude-toolcall-slm-2B-safetensors-IQ4_XS-GGUF
- Modelo base (safetensors): https://huggingface.co/mondk/claude-toolcall-slm-2B-safetensors
- Espacio GGUF-my-repo utilizado para la conversión: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
