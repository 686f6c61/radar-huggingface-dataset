# axteam/MiniCPM5-2B-FP8-dynamic

## Resumen

MiniCPM5-2B-FP8-dynamic es una versión cuantizada en FP8 (dinámica) del modelo openbmb/MiniCPM5-2B, realizada por el usuario axteam y orientada específicamente al despliegue con vLLM. El modelo base es un modelo de lenguaje denso de unos 2.500 millones de parámetros con arquitectura tipo Llama, centrado en generación de texto conversacional.

La cuantización es post-entrenamiento (PTQ, sin reentrenamiento), con esquema W8A8: pesos en FP8 E4M3 con escalas por canal y activaciones FP8 dinámicas por token, almacenadas en formato compressed-tensors `FP8_DYNAMIC`. Los embeddings de tokens, la cabeza del modelo (LM head) y todas las normalizaciones RMSNorm se mantienen en BF16 para preservar la calidad. No requiere datos de calibración.

Su relevancia estriba en que reduce el tamaño en disco a unos 2,8 GB (frente a los 3,1 GB del repo original) y permite servir el modelo en GPUs con soporte FP8 (Hopper, Ada Lovelace) con mayor throughput y menor consumo de memoria, manteniendo una fidelidad razonable respecto al original BF16: +3,2 % de perplexity y 92,9 % de acuerdo top-1 en la evaluación interna del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura tipo Llama), solo texto |
| Parametros totales | 2.516.756.480 (~2,52 B) |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico (W8A8: pesos FP8 E4M3 por canal, activaciones FP8 dinámicas por token); embeddings, LM head y RMSNorm en BF16 |
| Idiomas soportados | no disponible (la evaluación interna del autor usa un conjunto mixto inglés/coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `FP8_DYNAMIC`) |

## Arquitectura y entrenamiento

El modelo base, MiniCPM5-2B de OpenBMB, emplea una arquitectura transformer densa compatible con la arquitectura Llama (de ahí el tag `llama` en Hugging Face), orientada a generación de texto conversacional. No hay información publicada en la model card sobre el número de tokens de entrenamiento, composición del dataset ni procesos de alineación (RLHF/DPO) del modelo base.

Esta variante no modifica la arquitectura: aplica cuantización post-entrenamiento en FP8 con esquema dinámico (W8A8). Los pesos se cuantizan a FP8 E4M3 con escalas por canal, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia, lo que elimina la necesidad de un conjunto de calibración (data-free). Tokenizer y `chat_template` son idénticos a los del original. Como detalle técnico destacable, se conservan en BF16 los embeddings de tokens, la LM head y todas las capas RMSNorm, una práctica habitual para minimizar la degradación de calidad en la cuantización.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`), con plantilla de chat heredada del modelo base.
- Compatibilidad con vLLM para serving de alto rendimiento (formato compressed-tensors `FP8_DYNAMIC`).
- Compatibilidad con la librería transformers de Hugging Face.
- Funcionamiento en inglés y coreano según la evaluación interna del autor; soporte oficial de idiomas no disponible.
- No hay información publicada sobre tool calling, capacidades de agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Serving de LLM en GPU con FP8: el formato `FP8_DYNAMIC` está diseñado para vLLM; con un solo comando (`vllm serve axteam/MiniCPM5-2B-FP8-dynamic`) se despliega un endpoint de inferencia con menor huella de memoria que el BF16.
- Prototipado y demos de bajo coste: con ~2,8 GB de pesos, el modelo cabe en GPUs de consumo y permite experimentar con un LLM conversacional sin hardware de datacenter.
- Chatbots ligeros autoalojados: al ser un modelo conversacional de 2B con licencia Apache-2.0, es adecuado para asistentes internos donde se controla toda la infraestructura.
- Integración en pipelines de inferencia por lotes: el menor consumo de VRAM permite aumentar el tamaño de batch y el throughput en procesos offline de generación masiva de texto.
- Base para fine-tuning ligero: partiendo del modelo base openbmb/MiniCPM5-2B (o de esta variante para ajustes congelando capas sensibles), se puede adaptar a dominios concretos con QLoRA u otras técnicas eficientes.
- Evaluación comparativa de cuantización FP8: la model card publica métricas de fidelidad (perplexity y acuerdo top-1), lo que lo hace útil como caso de estudio para comparar esquemas de cuantización dinámica frente a BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni para esta variante ni para el modelo base en la información disponible. El autor sí publica una evaluación interna de fidelidad respecto al original BF16 (100 prompts, conjunto mixto inglés/coreano, respuestas greedy):

| Métrica | Esta variante (FP8) | Original BF16 |
|---|---|---|
| Perplexity (menor = más fiel) | 1,6494 | 1,5988 (+3,2 %) |
| Acuerdo top-1 siguiente token | 92,9 % | 98,9 % |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan ~2,8 GB en disco; con KV cache y overhead de runtime, se estima un mínimo práctico de 6-8 GB de VRAM (estimación, no dato oficial).
- GPU recomendadas: cualquier GPU con soporte FP8 para aprovechar el esquema W8A8 (NVIDIA H100, H200, L4, L40S, RTX 4090/4080 con Ada Lovelace o superior). En GPUs sin soporte FP8 nativo, vLLM puede no aprovechar el esquema o degradar el rendimiento.
- Consumer GPUs: sí, cabe con holgura en una RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 o equivalentes; en tarjetas de 8 GB debería funcionar con contexto limitado.
- Despliegue: vLLM (método recomendado y documentado por el autor, `vllm serve axteam/MiniCPM5-2B-FP8-dynamic`); el formato compressed-tensors está orientado a vLLM. Compatibilidad con llama.cpp, Ollama o TGI no documentada (llama.cpp requiere GGUF, formato no disponible en este repo).
- Latencia y throughput estimados: no disponible; al ser FP8 en hardware compatible, se espera mayor throughput y menor uso de memoria que el BF16, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/MiniCPM5-2B-FP8-dynamic | ~2,52 B | FP8 dinámico (W8A8) | no disponible | Apache-2.0 | Hugging Face, orientado a vLLM |
| openbmb/MiniCPM5-2B (base) | ~2,52 B | BF16 | no disponible | Apache-2.0 | Hugging Face |
| Qwen2.5-3B-Instruct | ~3 B | BF16 (con variantes GPTQ/AWQ oficiales) | 32.768 tokens | Qwen Research / Apache-2.0 según variante | Hugging Face |
| Llama-3.2-3B-Instruct | ~3,2 B | BF16 (variantes cuantizadas de terceros) | 128.000 tokens | Llama 3.2 Community License | Hugging Face |

Nota: la comparativa se ofrece a título orientativo; los datos de rendimiento comparado entre estos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La cuantización FP8 implica una pérdida medible de fidelidad: +3,2 % de perplexity y una caída del acuerdo top-1 del 98,9 % al 92,9 % respecto al BF16, según la evaluación del propio autor. En tareas sensibles a la elección exacta de tokens puede notarse.
- La evaluación de fidelidad se hizo sobre solo 100 prompts en inglés y coreano; no hay benchmarks estándar ni evaluaciones en castellano, por lo que el comportamiento en español no está verificado.
- No hay datos publicados sobre longitud de contexto, sesgos, tasa de alucinación ni procesos de alineación del modelo base; conviene evaluarlo antes de uso en producción.
- El esquema FP8 dinámico requiere hardware con soporte FP8 para ser eficiente; en GPUs más antiguas (Ampere o anteriores) la ventaja desaparece o el modelo puede no funcionar con vLLM tal cual.
- La compatibilidad con runtimes distintos de vLLM (llama.cpp, Ollama, TGI) no está documentada.
- Es una cuantización de terceros (axteam), no oficial de OpenBMB; el mantenimiento y actualizaciones dependen del autor del repo (28 descargas y 2 likes en el momento de la ficha, adopción muy reducida).
- La licencia es Apache-2.0, sin restricciones para uso comercial, aunque los pesos y el tokenizer originales pertenecen a OpenBMB.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/MiniCPM5-2B-FP8-dynamic
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Organización OpenBMB: https://huggingface.co/openbmb

No se han encontrado enlaces adicionales (papers, blogs, demos) en la información disponible.
