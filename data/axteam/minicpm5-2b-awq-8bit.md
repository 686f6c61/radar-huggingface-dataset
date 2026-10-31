# axteam/MiniCPM5-2B-AWQ-8bit

## Resumen

MiniCPM5-2B · AWQ INT8 (W8A16) es una cuantización de 8 bits del modelo openbmb/MiniCPM5-2B, publicada por el usuario axteam en Hugging Face y orientada específicamente al despliegue con vLLM. El modelo base es un LLM denso de unos 2.516 millones de parámetros con arquitectura tipo Llama, centrado en generación de texto conversacional.

La cuantización emplea el método AWQ en esquema W8A16 (pesos INT8 simétricos con grupos de 32, activaciones en BF16), almacenado en formato compressed-tensors `pack-quantized`. Se trata de una cuantización post-entrenamiento (PTQ) sin reentrenamiento, con tokenizador y plantilla de chat idénticos al original. Los embeddings de tokens, la cabeza del LM y todas las RMSNorm se mantienen en BF16.

Según mediciones del propio autor sobre un conjunto interno mixto de inglés y coreano (100 prompts, respuestas greedy del BF16 puntuadas en cada build), la versión cuantizada conserva la fidelidad del original: perplexity de 1,5988 (idéntico al BF16, -0,0 % de diferencia) y un acuerdo top-1 de siguiente token del 98,2 % frente al 98,9 % del original. Con unos 3 GB en disco, es una opción ligera para servir en GPU de consumo o para despliegues con bajo coste de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura tipo Llama, solo texto |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT8 (W8A16): pesos INT8 simétricos, grupo 32, activaciones BF16 |
| Idiomas soportados | no disponible (la evaluación interna se realizó con datos en inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base, openbmb/MiniCPM5-2B, es un transformer denso con arquitectura tipo Llama y enfoque exclusivo de texto (text-only). Esta versión no modifica la arquitectura: aplica una cuantización post-entrenamiento (PTQ) mediante AWQ en esquema W8A16, es decir, pesos cuantizados a INT8 simétrico con grupos de 32 elementos mientras las activaciones se mantienen en BF16, lo que evita la sobrecarga de cuantizar activaciones en tiempo de ejecución y simplifica el despliegue en vLLM.

En cuanto al entrenamiento del modelo base, no se han publicado en la información disponible detalles sobre el número de tokens, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. Sobre la cuantización sí se conocen detalles técnicos: se utilizó una calibración con 256 muestras, se mantuvieron en BF16 los embeddings de tokens, la LM head y todas las RMSNorm (una fracción pequeña de parámetros), y no hubo reentrenamiento; el tokenizador y la plantilla de chat son idénticos a los del original.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Compatibilidad con la plantilla de chat original de MiniCPM5-2B (chat_template idéntico al modelo base).
- Despliegue optimizado en vLLM gracias al formato compressed-tensors `pack-quantized`.
- Compatibilidad con la librería transformers de Hugging Face.
- Fidelidad medida respecto al modelo BF16: perplexity idéntica (1,5988) y acuerdo top-1 del 98,2 %.
- No disponible: no hay información sobre vision, audio, tool calling, agentes ni modo de razonamiento (thinking mode).

## Casos de uso

- Servido de LLM en GPU de consumo: con unos 3 GB en disco, la versión INT8 cabe en GPUs con 6-8 GB de VRAM, permitiendo montar un servidor de inferencia local con vLLM sin hardware de gama alta.
- Prototipado rápido de aplicaciones conversacionales: al conservar el tokenizador y la plantilla de chat del original, puede sustituir al modelo BF16 en pipelines existentes sin cambios de código.
- Despliegues multi-instancia de bajo coste: su reducido tamaño permite ejecutar varias réplicas en una misma GPU para aumentar el throughput en servicios con vLLM.
- Evaluación de impacto de la cuantización: las métricas de fidelidad publicadas (perplexity y acuerdo top-1) lo hacen útil como caso de estudio para comparar pérdidas de calidad en cuantización W8A16.
- Integración en endpoints gestionados: el modelo está etiquetado como text-generation-inference y endpoints_compatible, por lo que puede desplegarse en los endpoints de Hugging Face.
- Uso en entornos con restricciones de licencia: al ser Apache-2.0 tanto el derivado como el modelo base, puede integrarse en productos comerciales sin royalties.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica mediciones de fidelidad de la cuantización respecto al modelo BF16 original, obtenidas sobre un conjunto interno mixto de inglés y coreano (100 prompts, respuestas greedy del BF16 puntuadas en cada build):

| Metrica | Modelo cuantizado (INT8) | Original BF16 |
|---|---|---|
| Perplexity (menor = más cercano) | 1,5988 | 1,5988 (-0,0 %) |
| Acuerdo top-1 de siguiente token | 98,2 % | 98,9 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente; con pesos de ~3,0 GB en disco (2.516 M de parámetros en W8A16), cabe razonablemente en GPUs con 6-8 GB de VRAM dejando margen para el KV cache.
- GPU recomendadas: no disponible oficialmente; por tamaño, GPUs de consumo como la RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 son suficientes. GPUs de datacenter (A100, H100, L4) también son válidas para servido con vLLM.
- Consumer GPU: sí, el modelo cabe con holgura en la mayoría de GPUs de consumo modernas de 8 GB o más.
- Opciones de despliegue: vLLM (uso documentado: `vllm serve axteam/MiniCPM5-2B-AWQ-8bit`); el formato compressed-tensors está orientado a vLLM. La compatibilidad con llama.cpp, Ollama o TGI no está documentada (los pesos no están en GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/MiniCPM5-2B-AWQ-8bit | 2.516 M | AWQ INT8 (W8A16) | Denso tipo Llama | Apache-2.0 | Orientado a vLLM, ~3 GB en disco |
| openbmb/MiniCPM5-2B (original) | 2.516 M | BF16 | Denso tipo Llama | Apache-2.0 | Modelo base; acuerdo top-1 98,9 % |
| Qwen2.5-1.5B-Instruct | 1.540 M | BF16 (variantes cuantizadas disponibles) | Denso | Apache-2.0 | Alternativa ligera de tamaño similar, amplio soporte de ecosistema |

Nota: la comparativa se limita al modelo base (dato verificado) y a una alternativa de tamaño cercano; no hay datos de benchmarks estandarizados que permitan comparar rendimiento entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta ningún estudio de sesgos para el modelo base ni para la cuantización.
- Riesgo de alucinación: inherente a cualquier LLM; la información disponible no incluye evaluaciones de veracidad o alucinación.
- Limitaciones de idioma: los idiomas soportados no están declarados; la única evaluación publicada se realizó sobre un conjunto mixto de inglés y coreano, por lo que el rendimiento en castellano no está verificado.
- Longitud de contexto: no disponible, lo que impide planificar cargas con documentos largos.
- Licencia: Apache-2.0 en el derivado y en el modelo base, sin restricciones comerciales conocidas; los pesos y el tokenizador originales pertenecen a OpenBMB.
- Caveats de producción: la cuantización es PTQ sin reentrenamiento; aunque la fidelidad medida es alta (98,2 % de acuerdo top-1), existe una pequeña desviación respecto al BF16 (98,9 %) que puede acumularse en generaciones largas. El formato compressed-tensors está pensado para vLLM; la compatibilidad con otros runtimes no está garantizada. El modelo tiene muy poca tracción comunitaria (28 descargas, 2 likes), lo que implica menor validación externa.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/MiniCPM5-2B-AWQ-8bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B

No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en la información disponible.
