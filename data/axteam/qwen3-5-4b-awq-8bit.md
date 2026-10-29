# axteam/Qwen3.5-4B-AWQ-8bit

## Resumen

`axteam/Qwen3.5-4B-AWQ-8bit` es una cuantización de 8 bits del modelo multimodal `Qwen/Qwen3.5-4B`, publicada por axteam para servir inferencia eficiente con vLLM. Conserva la arquitectura del original: un transformer denso de 4.539.265.536 parámetros (aproximadamente 4,54B) con atención híbrida —capas de atención lineal combinadas con atención completa—, torre de visión y una cabeza de predicción multi-token (MTP).

La cuantización emplea AWQ INT8 en esquema W8A16: pesos INT8 simétricos con grupo de 32 y activaciones en BF16, almacenados en el formato `pack-quantized` de compressed-tensors. El resultado ocupa aproximadamente 5,6 GB en disco, lo que reduce el coste de VRAM frente al original en BF16 sin reentrenamiento.

Su relevancia actual reside en la fidelidad respecto al BF16 original —perplejidad 1,5708 frente a 1,5703 y una concordancia top-1 del 98,5 %— manteniendo el pipeline image-text-to-text, el tokenizador y el chat template originales. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrida (atención lineal + atención completa), densa, multimodal (visión), con cabeza MTP |
| Parámetros totales | 4.539.265.536 (~4,54B) |
| Parámetros activos | No aplica: modelo denso |
| Longitud de contexto | No disponible |
| Tipos de cuantización | AWQ INT8 W8A16: pesos INT8 simétricos, grupo de 32, activaciones BF16; formato compressed-tensors `pack-quantized` |
| Idiomas soportados | No disponible; el corpus de calibración es mixto con predominio de coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con compressed-tensors `pack-quantized` |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.5-4B` es un transformer denso multimodal con atención híbrida: combina capas de atención lineal con capas de atención completa, incorpora una torre de visión con proyector para entrada image-text-to-text y añade una cabeza de predicción multi-token (MTP). La cuantización conserva en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`). El resto de pesos lineales se almacena en INT8.

Se trata de cuantización post-entrenamiento (PTQ) mediante AWQ, sin reentrenamiento ni gradientes. El conjunto de calibración consta de 256 muestras de un corpus mixto con predominio de coreano. El tokenizador, el `chat_template` y el `generation_config` son idénticos a los del modelo original; `config.json` añade únicamente el bloque `quantization_config`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset del modelo base ni si se aplicaron RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generación de texto conversacional en formato multi-turno, heredada del modelo base.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), con torre de visión conservada en BF16.
- La arquitectura incluye una cabeza de predicción multi-token (MTP) conservada en BF16, orientada a decodificación especulativa; no se documenta su soporte efectivo en cada stack de serving.
- Capacidades de razonamiento, generación de código y matemáticas: no documentadas de forma específica en la información disponible; se heredan del modelo base sin evaluaciones publicadas en esta ficha.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se especifica la lista de idiomas soportados.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Serving conversacional multimodal con vLLM: el modelo está empaquetado específicamente para `vllm serve`, con pesos INT8 y activaciones BF16, lo que permite desplegar un endpoint compatible con OpenAI para chat texto-imagen sin convertir formatos.
- Asistencia sobre documentos con imágenes: al aceptar entradas image-text-to-text, puede recibir capturas, diagramas o páginas escaneadas junto a una pregunta y devolver una respuesta textual; la torre de visión en BF16 evita la pérdida de calidad que supondría cuantizarla.
- Descripción y etiquetado de imágenes con justificación: útil para generar metadatos, alt-text accesible o clasificaciones acompañadas de explicación en aplicaciones de gestión de contenido.
- Prototipado en GPU de consumo: con ~5,6 GB de pesos, cabe en tarjetas de 12-16 GB, lo que permite validar flujos multimodales en estaciones de trabajo sin clúster.
- Backend de chatbots multi-turno: el `chat_template` original y el formato conversacional permiten integrarlo en aplicaciones de atención al cliente; la longitud de contexto no está documentada, por lo que debe validarse para conversaciones largas.
- Evaluación comparativa de cuantizaciones: sirve como referencia de fidelidad frente al BF16 y frente a variantes INT4 de la misma familia, usando las métricas de perplejidad y concordancia top-1 publicadas.
- Moderación de contenido visual asistida: puede analizar una imagen y generar una explicación textual de su contenido para revisión humana, aunque no se documentan evaluaciones específicas de sesgo o seguridad.

## Benchmarks y rendimiento

| Métrica | Este modelo | Original BF16 |
|---|---|---|
| Perplejidad (menor es mejor) | 1,5708 | 1,5703 (+0,0 %) |
| Concordancia top-1 del siguiente token | 98,5 % | 99,2 % |

Medición realizada por el autor sobre un conjunto interno mixto inglés/coreano de 100 prompts, con respuestas BF16 greedy puntuadas bajo el mismo harness para cada fila. Estas métricas miden fidelidad respecto al modelo base, no rendimiento absoluto en tareas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,6 GB solo para pesos; con activaciones BF16, caché KV y torre de visión, un despliegue en vLLM para contextos cortos requiere del orden de 8-10 GB. Son estimaciones orientativas, no medidas publicadas.
- GPU recomendadas: NVIDIA A100 o H100 para serving de alta concurrencia; RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 4060 Ti (16 GB) para desarrollo y despliegue de una sola instancia.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más. En 8 GB el despliegue es ajustado y puede requerir limitar el contexto, el tamaño de lote o desactivar la torre de visión.
- Opciones de despliegue: vLLM es la vía recomendada por el autor (`vllm serve axteam/Qwen3.5-4B-AWQ-8bit`); también es cargable con transformers y compressed-tensors. No consta soporte para llama.cpp, Ollama o TGI con este formato cuantizado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `axteam/Qwen3.5-4B-AWQ-8bit` | 4,54B | No disponible | AWQ INT8 W8A16 | Apache-2.0 | Público en Hugging Face |
| `axteam/Qwen3.5-9B-AWQ-8bit` | ~9B (no verificado) | No disponible | AWQ INT8 W8A16 | No disponible en la información | Público en Hugging Face |
| `axteam/Qwen3.5-9B-AWQ-4bit` | ~9B (no verificado) | No disponible | AWQ INT4 W4A16 | No disponible en la información | Público en Hugging Face |
| `axteam/Qwen3.6-35B-A3B-AWQ-8bit` | 35B totales, 3B activos (MoE) | No disponible | AWQ INT8 W8A16 | Apache-2.0 | Público en Hugging Face |

La comparación se limita a los datos publicados por axteam. El modelo de 35B-A3B es una alternativa de mayor tamaño con arquitectura MoE dispersa; el autor advierte que los modelos MoE dispersos son sensibles a la cuantización de 4 bits y recomienda las variantes de 8 bits para producción. No se dispone de resultados de benchmarks de tareas que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Al ser cuantización post-entrenamiento, no hay reentrenamiento: la fidelidad es alta pero no perfecta (concordancia top-1 del 98,5 % frente al 99,2 % del BF16), por lo que pueden aparecer divergencias en generaciones largas o sensibles.
- El corpus de calibración es de 256 muestras con predominio de coreano; no se documenta su cobertura de español ni de otros idiomas, lo que puede sesgar el comportamiento multilingüe.
- No se han publicado benchmarks de tareas ni evaluaciones de sesgo, seguridad o alucinación para este modelo.
- La longitud de contexto no está documentada, lo que impide garantizar su uso en documentos extensos o conversaciones de muchos turnos sin validación previa.
- La torre de visión y la cabeza MTP se mantienen en BF16; esto preserva calidad pero incrementa el uso de memoria frente a una cuantización completa.
- El formato compressed-tensors `pack-quantized` limita la portabilidad: no es directamente utilizable en llama.cpp u Ollama sin conversión adicional.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución al modelo base y revisar los términos del repositorio original de Qwen.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que existe poca validación independiente de su comportamiento en producción.
- Riesgo de alucinación inherente al modelo base; no se documentan mecanismos de mitigación específicos en esta cuantización.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/axteam/Qwen3.5-4B-AWQ-8bit)
- [Modelo base Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Licencia del modelo base](https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE)
- [axteam/Qwen3.5-9B-AWQ-8bit](https://huggingface.co/axteam/Qwen3.5-9B-AWQ-8bit)
- [axteam/Qwen3.5-9B-AWQ-4bit](https://huggingface.co/axteam/Qwen3.5-9B-AWQ-4bit)
- [axteam/Qwen3.6-35B-A3B-AWQ-8bit](https://huggingface.co/axteam/Qwen3.6-35B-A3B-AWQ-8bit)
- [axteam/Qwen3.6-35B-A3B-AWQ-4bit](https://huggingface.co/axteam/Qwen3.6-35B-A3B-AWQ-4bit)
