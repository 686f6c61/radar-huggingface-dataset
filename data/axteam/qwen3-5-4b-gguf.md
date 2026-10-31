# axteam/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B-GGUF es una versión cuantizada en formato GGUF del modelo Qwen3.5-4B, desarrollado por el equipo de Qwen (Alibaba). La cuantización ha sido realizada por axteam, un tercero que publica las conversiones para su uso directo en llama.cpp, Ollama y LM Studio. El modelo base es un LLM denso de 4.326 millones de parámetros orientado a generación de texto conversacional.

Esta ficha es relevante para desarrolladores que quieren ejecutar un modelo compacto de la familia Qwen 3.5 en hardware local o de consumo, sin depender de GPUs de gama alta. El repositorio ofrece dos cuantizaciones (Q4_K_M y Q8_0), con el chat template original incrustado, lo que permite un despliegue inmediato mediante `llama-server` con API compatible con OpenAI. Hay que tener en cuenta que la conversión GGUF no incluye el codificador de visión, por lo que estas versiones son solo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no disponible mayor detalle) |
| Parametros totales | 4.326.350.848 (~4,33 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (los ejemplos del repo usan 8192 tokens) |
| Tipos de cuantizacion | Q4_K_M (2,8 GB), Q8_0 (4,6 GB); original en BF16 |
| Idiomas soportados | no disponible (los ejemplos incluyen coreano; familia Qwen típicamente multilingüe) |
| Licencia | Apache-2.0 (heredada del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | GGUF (original en safetensors BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer denso de unos 4,33 mil millones de parámetros. La información disponible no detalla el número de capas, cabezas de atención ni datos del entrenamiento original (tokens, composición del dataset, RLHF/DPO); estos datos deben consultarse en la model card de Qwen/Qwen3.5-4B.

Las cuantizaciones publicadas por axteam son post-training quantization (PTQ) realizadas con las herramientas de llama.cpp (`convert_hf_to_gguf.py` seguido de `llama-quantize`). Los pesos BF16 se cuantizan por bloques mediante k-quants, con escalas por bloque y asignación mixta de bits, sin reentrenamiento ni ajuste posterior. Cada archivo GGUF incorpora el `chat_template` original del modelo, por lo que no es necesario configurarlo manualmente al servirlo con `--jinja`. El codificador de visión del modelo original no está incluido en estos GGUF, de modo que las capacidades multimodales no están disponibles en esta versión.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`, chat template incrustado).
- Uso con formato de chat estándar vía API compatible con OpenAI mediante `llama-server`.
- Ejecución local en llama.cpp, Ollama y LM Studio.
- Soporte de idiomas no alfabéticos según los ejemplos del repositorio (se muestra una consulta en coreano).
- No disponible en estos GGUF: capacidades de visión (el encoder no está incluido), tool calling ni thinking mode (no documentados en la información disponible).

## Casos de uso

- Chatbot local en el portátil: con la variante Q4_K_M (2,8 GB) cabe en portátiles con GPU de consumo o incluso en CPU, ideal para asistentes personales privados sin enviar datos a la nube.
- API local compatible con OpenAI: `llama-server` expone un endpoint `/v1/chat/completions` en el puerto 8080, lo que permite sustituir llamadas a APIs comerciales en prototipos y pruebas de integración sin cambiar el código cliente.
- Prototipado en LM Studio u Ollama: descarga en un clic desde el navegador de modelos, útil para evaluar rápidamente el comportamiento del modelo antes de comprometerse con un despliegue mayor.
- Atención al cliente ligera on-premise: para conversaciones multi-turno de contexto moderado (8192 tokens en los ejemplos), un modelo de 4B cuantizado ofrece respuestas rápidas con coste de infraestructura mínimo.
- Generación y resumen de texto en entornos con restricciones de privacidad: procesamiento local de documentos en organizaciones que no pueden usar servicios externos.
- Optimización de memoria en contexto largo: usando KV-cache cuantizado (`--cache-type-k q8_0 --cache-type-v q8_0 -fa on`) se reduce la huella de memoria al ampliar la ventana de contexto en tiempo de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Q4_K_M requiere unos 2,8 GB para los pesos más la KV-cache; Q8_0 unos 4,6 GB. Con contexto de 8192 tokens y KV-cache en q8_0, el consumo adicional es reducido.
- Consumer GPUs: cualquier GPU con 4-6 GB de VRAM (por ejemplo RTX 3060 o superior) ejecuta Q4_K_M con holgura; Q8_0 cabe en GPUs de 8 GB. También es viable en CPU pura con RAM suficiente.
- No se requieren GPUs de datacenter (A100/H100) para inferencia.
- Despliegue soportado: llama.cpp (`llama-cli` / `llama-server`), Ollama (`ollama run hf.co/axteam/Qwen3.5-4B-GGUF:Q4_K_M`) y LM Studio.
- Latencia y throughput: no disponibles; al ser un modelo de 4B cuantizado en 4 bits, se espera interacción interactiva fluida en GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizaciones | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-GGUF (este) | 4,33 B | Q4_K_M, Q8_0 | Apache-2.0 | GGUF | Solo texto, chat template incrustado |
| Qwen/Qwen3.5-4B (base) | 4,33 B | BF16 | Apache-2.0 | safetensors | Incluye encoder de visión |
| Llama 3.2 3B | 3,2 B | Varias (comunidad) | Llama 3.2 Community License | safetensors/GGUF | Licencia restrictiva frente a Apache-2.0 |
| Phi-3.5-mini (3,8 B) | 3,8 B | Varias (comunidad) | MIT | safetensors/GGUF | Contexto de 128k, solo texto |

Comparativas de rendimiento entre estos modelos: no disponibles en la información proporcionada.

## Limitaciones y advertencias

- Los GGUF no incluyen el encoder de visión: si necesitas capacidades multimodales, usa los pesos originales de Qwen/Qwen3.5-4B.
- La cuantización es PTQ sin reentrenamiento: Q4_K_M puede degradar ligeramente la calidad respecto al original BF16, especialmente en razonamiento matemático y código.
- Sesgos y riesgo de alucinación: heredados del modelo base; no se documenta ningún análisis específico.
- Longitud de contexto máxima del modelo base: no disponible en la información proporcionada; los ejemplos del repo usan 8192 tokens.
- Idiomas soportados: no documentados explícitamente; verificar en la model card del modelo base antes de uso multilingüe en producción.
- Es una cuantización de terceros (axteam), no oficial del equipo Qwen: revisar la integridad de los archivos y el hash antes de uso en producción.
- Licencia Apache-2.0: permite uso comercial sin restricciones relevantes, pero los pesos originales y el tokenizador pertenecen al equipo Qwen.
- Repositorio con baja tracción (108 descargas, 1 like en el momento de la ficha): comunidad limitada para soporte y detección de problemas.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/axteam/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
