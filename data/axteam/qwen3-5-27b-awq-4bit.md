# axteam/Qwen3.5-27B-AWQ-4bit

## Resumen

Qwen3.5-27B-AWQ-4bit es una cuantización de 4 bits del modelo Qwen3.5-27B del equipo Qwen (Alibaba), publicada por axteam con el objetivo de servir el modelo de forma eficiente en vLLM. Se trata de un derivado post-entrenamiento (PTQ) en formato AWQ INT4 con activaciones en BF16 (W4A16), empaquetado con compressed-tensors, que reduce el peso en disco hasta aproximadamente 19,5 GB frente a los ~55 GB que ocuparían los pesos en BF16.

El modelo base es un transformer híbrido (atención lineal combinada con atención completa), denso, multimodal con torre de visión y cabeza MTP (multi-token prediction), con 27.781.427.952 parámetros totales. Al ser denso, todos los parámetros se activan en cada forward pass, a diferencia del resto de la familia Qwen 3.5 Medium, que emplea mezcla de expertos.

La relevancia de esta ficha es práctica: permite desplegar un modelo multimodal de ~28 B en una única GPU de 24 GB, manteniendo una fidelidad alta respecto al original (perplexity 1,3886 frente a 1,3603, un +2,1 %; acuerdo top-1 del 94,5 %). El repositorio es muy reciente y no cuenta todavía con descargas ni validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (linear-attention + full-attention), denso, multimodal (visión), con cabeza MTP |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | AWQ INT4 W4A16, asimétrica, group size 32 (escala BF16 + zero-point INT4), activaciones BF16; formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (la model card no detalla la lista; la evaluación interna emplea inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `pack-quantized` (repo de 21,0 GB; ~19,5 GB según la model card) |

## Arquitectura y entrenamiento

El modelo base combina capas de atención lineal con capas de atención completa, una torre de visión con proyector multimodal y una cabeza MTP para predicción multi-token, todo ello sobre un backbone denso de 27,78 B de parámetros. No se trata de un MoE: cada token atraviesa la totalidad de los pesos. La model card no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF/DPO en el modelo original.

Esta publicación concreta no reentrena nada: es una cuantización post-entrenamiento (PTQ) con AWQ, que utiliza un conjunto de calibración de 256 muestras de un corpus mixto con predominio de coreano y sin gradientes, para proteger los canales de pesos más relevantes antes del redondeo. Se mantienen en BF16 la torre y el proyector de visión (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, el LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`). El tokenizador, el `chat_template` y el `generation_config` son idénticos a los del original, y el `config.json` añade únicamente el bloque `quantization_config`.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat idéntica a la del modelo Qwen original.
- Entrada imagen-texto a texto (pipeline `image-text-to-text`): descripción, análisis y razonamiento sobre imágenes gracias a la torre visual conservada en BF16.
- Generación de código y resolución de tareas de ingeniería de software: el modelo base reporta 72,4 en SWE-bench Verified según una fuente externa, aunque no hay medición equivalente para esta versión cuantizada.
- Cabeza MTP (multi-token prediction) preservada en BF16; la model card no documenta un uso concreto de la misma en el serving.
- Razonamiento e instrucciones: el modelo base es descrito por terceros como el de mejores puntuaciones de seguimiento de instrucciones y código de la línea Medium.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible; la única evidencia es que la calibración y la evaluación internas usan inglés y coreano.

## Casos de uso

- Serving conversacional multimodal en producción: el formato está pensado para `vllm serve axteam/Qwen3.5-27B-AWQ-4bit`, con ~19,5 GB de pesos, lo que permite atender texto e imágenes desde una sola GPU de 24 GB con muestreo recomendado `temperature=0.7, top_p=0.8, top_k=20`.
- Análisis de documentos con imágenes: extracción y descripción de contenido en capturas, escaneos o diagramas usando la torre visual en BF16, que preserva la calidad del encoder original frente a la parte lingüística cuantizada.
- Asistencia de código en pipelines de CI/CD: el modelo base acredita 72,4 en SWE-bench Verified según Awesome Agents, de modo que la versión INT4 puede integrarse como revisor o generador de parches siempre que se valide la pérdida de fidelidad en el dominio concreto.
- Atención al cliente automatizada: el `chat_template` original se mantiene intacto, por lo que se puede reutilizar el mismo pipeline de prompts multi-turno que con el modelo BF16, con un coste de VRAM aproximadamente tres veces menor.
- Despliegue en hardware de una sola GPU: sustituir el BF16 por esta variante reduce el peso de los pesos de ~55 GB a ~19,5 GB, lo que habilita escenarios de inferencia que no caben en A100 40 GB sin tensor parallelism.
- Investigación y evaluación de cuantización: la model card publica métricas de fidelidad reproducibles (perplexity y acuerdo top-1) que permiten comparar AWQ INT4 frente a otros esquemas sobre el mismo harness.
- Generación de descripciones y etiquetado de imágenes a escala: al ser un modelo image-text-to-text servible en vLLM, encaja en colas de procesamiento por lotes de imágenes con requisitos moderados de VRAM.

## Benchmarks y rendimiento

| Métrica | Este modelo (AWQ INT4) | Qwen3.5-27B BF16 | Fuente |
|---|---|---|---|
| Perplexity (menor = mejor) | 1,3886 | 1,3603 (+2,1 %) | Model card, conjunto interno mixto inglés/coreano, 100 prompts |
| Acuerdo top-1 en el siguiente token | 94,5 % | 99,3 % | Model card, mismo harness |
| SWE-bench Verified | no disponible para la versión cuantizada | 72,4 | Awesome Agents (fuente externa, no verificada de forma independiente) |

Las dos primeras filas miden fidelidad respecto al modelo base, no rendimiento absoluto en tareas. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- Peso de los pesos cuantizados: ~19,5 GB según la model card (el repositorio completo ocupa 21,0 GB).
- VRAM estimada: por encima de 20 GB solo para los pesos; con caché KV y activaciones, 24 GB es el mínimo práctico para contextos moderados, y se necesita más memoria a medida que crece el contexto (estimación derivada del tamaño, no publicada por el autor).
- GPU de consumo: cabe en RTX 4090 y RTX 3090 de 24 GB; no cabe en tarjetas de 16 GB ni de 12 GB.
- GPU profesionales: L4 y A10G de 24 GB (ajustadas), A100 de 40 u 80 GB, H100.
- Despliegue: vLLM es la vía soportada y recomendada (`vllm serve axteam/Qwen3.5-27B-AWQ-4bit`); el formato compressed-tensors `pack-quantized` no es directamente compatible con llama.cpp, Ollama ni GGUF, por lo que no hay ruta de despliegue alternativa documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-27B-AWQ-4bit | 27,78 B (denso, multimodal) | no disponible | AWQ INT4 W4A16, group 32 | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-27B | 27,78 B (denso, multimodal) | no disponible | BF16 | Apache-2.0 | Hugging Face |
| QuantTrio/Qwen3.5-27B-AWQ | 27,78 B (denso) | no disponible | AWQ | Apache-2.0 | Inferix |
| cyankiwi/Qwen3.5-27B-AWQ-4bit | 27,78 B (denso) | no disponible | AWQ INT4 | Apache-2.0 | ModelScope |

La comparación natural es contra el BF16 original (mejor calidad, ~55 GB de pesos) y contra las otras cuantizaciones AWQ del mismo modelo base, que compiten en el mismo nicho de serving con vLLM. No se dispone de datos de rendimiento publicados para las alternativas en la información consultada.

## Limitaciones y advertencias

- Pérdida de calidad medible: perplexity un 2,1 % peor y acuerdo top-1 del 94,5 % frente al 99,3 % del BF16; en tareas sensibles a la fidelidad token a token conviene validar antes de migrar.
- Calibración con predominio de coreano: el conjunto de 256 muestras puede no representar bien otros idiomas, incluido el castellano, lo que hace aconsejable una evaluación propia por dominio e idioma.
- Riesgo de alucinación heredado del modelo base; la cuantización no lo corrige y puede amplificarlo ligeramente en casos límite.
- Idiomas no documentados oficialmente: no hay lista publicada de lenguas soportadas ni métricas multilingües para esta variante.
- Formato cautivo: al estar en compressed-tensors `pack-quantized`, solo se sirve con vLLM/transformers; no hay GGUF ni soporte en llama.cpp u Ollama.
- Componentes en BF16 (torre visual, cabeza MTP, embeddings, LM head, normas) que elevan el consumo real por encima de lo que sugeriría un cálculo puro de 4 bits.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, publicado y actualizado el 29 de octubre de 2026; no hay validación independiente de la comunidad.
- Tool calling, uso agéntico y modo thinking no están documentados en la model card; no deben asumirse en producción.
- Licencia Apache-2.0 en el derivado, con los derechos de los pesos, tokenizador y plantilla de chat atribuidos al equipo Qwen; conviene revisar el fichero LICENSE del modelo base antes de un uso comercial.

## Enlaces

- [axteam/Qwen3.5-27B-AWQ-4bit en Hugging Face](https://huggingface.co/axteam/Qwen3.5-27B-AWQ-4bit)
- [Qwen/Qwen3.5-27B (modelo base)](https://huggingface.co/Qwen/Qwen3.5-27B)
- [Licencia del modelo base](https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE)
- [Qwen3.5-27B en Awesome Agents](https://awesomeagents.ai/models/qwen-3-5-27b/)
- [Qwen3.5-27B: VRAM, specs y benchmarks en apxml.com](https://apxml.com/models/qwen35-27b)
- [QuantTrio/Qwen3.5-27B-AWQ en Inferix](https://inferix.co/models/QuantTrio/Qwen3.5-27B-AWQ)
- [cyankiwi/Qwen3.5-27B-AWQ-4bit en ModelScope](https://www.modelscope.cn/models/cyankiwi/Qwen3.5-27B-AWQ-4bit/summary)
