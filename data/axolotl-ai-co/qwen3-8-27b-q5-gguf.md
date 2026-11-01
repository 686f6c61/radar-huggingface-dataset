# axolotl-ai-co/Qwen3.8-27B-Q5-GGUF

## Resumen

Qwen3.8-27B-Q5-GGUF es una cuantización de clase 5 bits del modelo Qwen3.8-27B de Qwen, publicada por el equipo de axolotl-ai-co en formato GGUF. No se trata de un modelo nuevo ni reentrenado: es una cuantización post-entrenamiento (post-training quantization) realizada con un dataset de calibración propio y una importance matrix (imatrix) personalizada, sin ningún ajuste fino posterior.

El problema que resuelve es el habitual en este nicho: permitir ejecutar un modelo denso de 27.320.697.856 parámetros (~27B) en hardware modesto reduciendo el tamaño de los pesos de FP16 (~55 GB) a 18,85 GB, manteniendo la máxima fidelidad posible respecto al original. Los autores afirman que su cuantización obtiene un 23,5 % menos de KLD (Kullback-Leibler divergence) que la cuantización SLQ-EAR98 de kaitchup a igual tamaño, medida sobre un conjunto agéntico reservado.

El archivo resultante es solo texto (sin tensores de visión ni proyector multimodal) y conserva el bloque de multi-token-prediction (MTP) del modelo base, lo que puede aprovecharse para decodificación especulativa si llama.cpp lo soporta. La licencia heredada es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer de la familia Qwen3.8; conserva bloque MTP) |
| Parametros totales | 27.320.697.856 (~27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa 32.768 tokens) |
| Tipos de cuantizacion | XQD-Q5 (clase 5 bits, con importance matrix) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, es un transformer denso de la familia Qwen de Alibaba; la ficha de cuantización no detalla su arquitectura interna (número de capas, dimensiones, atención), por lo que esos datos no están disponibles aquí. Un detalle técnico relevante es que el archivo GGUF conserva el bloque de multi-token-prediction (MTP) del modelo original, un mecanismo que genera varios tokens por paso y puede habilitar decodificación especulativa para acelerar la inferencia.

En cuanto a la cuantización, axolotl-ai-co emplea un método propio llamado XQD en clase de 5 bits, basado exclusivamente en cuantización post-entrenamiento. Utilizan un dataset de calibración propio y una importance matrix (imatrix) calculada por ellos, sin realizar ningún fine-tuning. Según su write-up «Old ideas, standard formats, better quants», en un conjunto agéntico reservado (held-out) la cuantización logra un 23,5 % menos de KLD frente a la cuantización SLQ-EAR98 de kaitchup a igual tamaño de archivo, lo que indica una mayor fidelidad respecto a las salidas del modelo completo.

## Capacidades

Al ser una cuantización del modelo base Qwen3.8-27B, hereda sus capacidades. La model card no las detalla, pero por la familia y los tags se puede indicar:

- Generación de texto conversacional (tag `conversational` en el repositorio).
- Conserva el bloque MTP (multi-token prediction) del modelo base, potencialmente utilizable para decodificación especulativa.
- Compatibilidad completa con llama.cpp y el ecosistema GGUF (llama-server, llama-cli, etc.).
- Solo texto: no incluye tensores de visión ni proyector multimodal, por lo que las capacidades de visión del modelo base, si las hubiera, no están disponibles en este archivo.
- No hay información disponible sobre tool calling, capacidades agénticas del modelo base, soporte multilingüe ni modos de razonamiento (thinking mode).

## Casos de uso

- Chatbots y asistentes locales: el formato GGUF con llama-server permite montar un endpoint compatible con la API de OpenAI en local, con contexto de 32.768 tokens según el ejemplo de la model card, adecuado para conversaciones multi-turno sin enviar datos a terceros.
- Inferencia en una sola GPU consumer: con 18,85 GB de pesos, el modelo cabe en una RTX 4090 (24 GB) con descarga completa a VRAM (`--n-gpu-layers 99`), lo que lo hace ideal para desarrolladores que quieren un modelo de ~27B corriendo íntegramente en local.
- RAG y consultas sobre documentación privada: la ventana de contexto utilizada en el ejemplo (32K tokens) permite incorporar fragmentos recuperados de bases de conocimiento junto a la pregunta del usuario.
- Evaluación de cuantizaciones: al publicarse junto a un write-up metodológico y métricas de KLD, es un buen candidato para comparar métodos de cuantización (XQD frente a SLQ, imatrix propia frente a genérica) en benchmarks de fidelidad.
- Prototipado agéntico: los autores miden la calidad sobre un conjunto agéntico, lo que sugiere que el modelo base está orientado también a flujos con herramientas y pasos múltiples; el GGUF puede integrarse en frameworks como LangChain o llamando a llama-server vía HTTP.
- Despliegue en servidores con GPU de gama media-alta: en tarjetas de 16 GB (por ejemplo RTX 4080/4090 móvil o A4000) puede ejecutarse con offload parcial a CPU, sacrificando throughput pero manteniendo funcionalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento publicado es de fidelidad de cuantización: un 23,5 % menos de KLD que la cuantización SLQ-EAR98 de kaitchup a igual tamaño, medido sobre un conjunto agéntico reservado por los autores.

## Requisitos de hardware

- VRAM para inferencia: 18,85 GB solo de pesos; con contexto de 32K tokens y la caché KV, se recomienda una GPU de 24 GB para descarga completa.
- GPU recomendadas: RTX 4090 (24 GB) para ejecución íntegra en GPU; RTX 3090 (24 GB) como alternativa; en GPUs de 16 GB es necesario offload parcial a CPU/RAM.
- Consumer GPUs: sí, cabe completamente en una RTX 4090 o RTX 3090; en GPUs de 12-16 GB funcionará con capas repartidas entre GPU y CPU.
- Despliegue: llama.cpp (llama-server, llama-cli) es el camino documentado; por extensión, cualquier runtime compatible con GGUF (Ollama, LM Studio, koboldcpp) debería funcionar con una build reciente con soporte Qwen3.8. No hay información sobre vLLM o TGI, que requieren formatos distintos (safetensors).
- Latencia y throughput: no disponibles; el bloque MTP conservado puede mejorar la velocidad si el runtime soporta decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| axolotl-ai-co/Qwen3.8-27B-Q5-GGUF | 27,3B | GGUF (XQD-Q5) | 18,85 GB | Apache 2.0 | Cuantización con imatrix propia; 23,5 % menos KLD que SLQ-EAR98 |
| Qwen/Qwen3.8-27B (base) | 27,3B | Safetensors (FP16/BF16) | ~55 GB (estimado) | Apache 2.0 | Modelo original sin cuantizar; máxima fidelidad, mayor requisito de VRAM |
| kaitchup SLQ-EAR98 de Qwen3.8-27B | 27,3B | GGUF (clase 5 bits) | igual tamaño que XQD-Q5 | no disponible | Cuantización alternativa usada como referencia en la comparación de KLD |

## Limitaciones y advertencias

- Solo texto: el archivo no incluye tensores de visión ni proyector multimodal; cualquier capacidad multimodal del modelo base queda excluida.
- Sesgos conocidos: no disponibles; hereda los del modelo base Qwen3.8-27B, cuya model card no se incluye en la información proporcionada.
- Riesgo de alucinación: inherente a todo LLM; la cuantización a 5 bits puede degradar ligeramente la fidelidad, aunque los autores reportan una KLD baja frente a cuantizaciones comparables.
- Longitud de contexto: la model card no especifica la ventana máxima del modelo base; el ejemplo usa 32.768 tokens, que puede no ser el límite real.
- Idiomas soportados: no declarados en el repositorio de la cuantización.
- Licencia: Apache 2.0 permite uso comercial sin royalties, pero conviene revisar los términos originales en Qwen/Qwen3.8-27B.
- Requiere una build reciente de llama.cpp con soporte Qwen3.8; versiones antiguas no cargarán el archivo.
- Las métricas de KLD provienen de los propios autores y de un conjunto de evaluación agéntico reservado, no de benchmarks independientes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/axolotl-ai-co/Qwen3.8-27B-Q5-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Write-up metodológico: https://axolotlai.substack.com/p/old-ideas-standard-formats-better
