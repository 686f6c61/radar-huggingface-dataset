# axteam/MiniCPM5-2B-NVFP4A16

## Resumen

MiniCPM5-2B-NVFP4A16 es una versión cuantizada en 4 bits del modelo MiniCPM5-2B de OpenBMB, publicada por axteam en Hugging Face. Se trata de un modelo de generación de texto denso con arquitectura tipo Llama, orientado a despliegue eficiente mediante vLLM. La cuantización emplea el esquema NVFP4A16 (W4A16): pesos en FP4 (E2M1) agrupados en bloques de 16 con escala FP8, y activaciones en BF16, almacenados en formato compressed-tensors `nvfp4-pack-quantized`.

El modelo resuelve el problema de servir un modelo de ~2,5 mil millones de parámetros con una huella de memoria reducida: el repositorio ocupa unos 2,2 GB frente a los ~5 GB que ocuparía en BF16. Es cuantización post-entrenamiento (PTQ, sin reentrenamiento), con calibración sobre 256 muestras, y conserva en BF16 los embeddings de tokens, la cabeza del modelo de lenguaje (LM head) y todas las normalizaciones RMSNorm. El tokenizador y la plantilla de chat son idénticos a los del original.

Es relevante como opción de despliegue en hardware limitado, aunque conviene tener en cuenta una advertencia importante del propio autor: la degradación de calidad respecto al BF16 es notable en esta versión 4 bits, y se recomienda preferir las variantes de 8 bits (FP8 o AWQ INT8) cuando sea posible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Llama), solo texto |
| Parametros totales | 2.516.756.480 (según safetensors) |
| Parametros activos | no disponible (no es MoE; denso) |
| Longitud de contexto | 32768 tokens (usada en los ejemplos de despliegue; máximo oficial no disponible) |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 (E2M1) grupo 16 + escala FP8, activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible (la evaluación interna del autor se realizó sobre un conjunto mixto inglés/coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base, MiniCPM5-2B de OpenBMB, es un transformer denso con arquitectura tipo Llama, especializado en generación de texto conversacional. La versión aquí descrita no modifica la arquitectura: es una cuantización post-entrenamiento (PTQ) sin reentrenamiento. El esquema NVFP4A16 convierte los pesos a punto flotante de 4 bits (formato E2M1) agrupados en bloques de 16 elementos con escalas en FP8, mientras que las activaciones se procesan en BF16. Los embeddings de tokens, la LM head y todas las capas RMSNorm se mantienen en BF16 por ser especialmente sensibles a la cuantización.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no hay datos disponibles en la información proporcionada. La cuantización se calibró con 256 muestras. Como detalle operativo destacable, la plantilla de chat incluye un modo de razonamiento (thinking mode) activado por defecto, que puede desactivarse mediante `chat_template_kwargs={"enable_thinking": False}`.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational), heredada del modelo base MiniCPM5-2B.
- Modo de razonamiento (thinking mode) activado por defecto en la plantilla de chat, desactivable en tiempo de ejecución.
- Despliegue como servidor compatible con la API de OpenAI mediante vLLM.
- Soporte para reducir la memoria de la caché KV en tiempo de ejecución (`--kv-cache-dtype fp8`), útil para contextos largos o lotes grandes.
- No hay información disponible sobre capacidades de visión, audio, tool calling o soporte agéntico; el modelo es solo texto (text-only).

## Casos de uso

- Servir un LLM pequeño en GPU de consumo: con ~2,0 GB de pesos, cabe cómodamente en GPUs como la RTX 3060 de 12 GB o la RTX 4060 Ti de 16 GB, dejando margen para la caché KV en contextos moderados.
- Prototipado de aplicaciones conversacionales: el servidor de vLLM expone una API compatible con OpenAI, lo que permite integrar el modelo en clientes existentes (LangChain, openai-python, etc.) sin cambios de código.
- Despliegue multi-instancia de bajo coste: el reducido tamaño en disco y en VRAM permite ejecutar varias instancias del modelo en una misma GPU para aumentar el throughput en entornos de prueba.
- Razonamiento con cadena de pensamiento local: el thinking mode activado por defecto permite explorar tareas de razonamiento multi-paso sin depender de servicios externos, con la opción de desactivarlo para respuestas más directas.
- Contextos largos en hardware modesto: la combinación de pesos FP4 y caché KV en FP8 (`--kv-cache-dtype fp8`) reduce la memoria total, facilitando servir contextos de hasta 32768 tokens en GPUs con VRAM limitada.
- Evaluación comparativa de esquemas de cuantización: dado que el autor publica métricas de fidelidad (perplejidad y acuerdo top-1 frente al BF16), el modelo sirve como referencia para estudiar el impacto del esquema NVFP4A16 frente a variantes FP8 o INT8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización, medidas sobre un conjunto interno mixto inglés/coreano (100 prompts, respuestas greedy del BF16 puntuadas sobre cada build):

| Metrica | Este modelo (NVFP4A16) | Original BF16 |
|---|---|---|
| Perplejidad (menor = más fiel) | 1,8315 | 1,5988 (+14,6 %) |
| Acuerdo top-1 en siguiente token | 85,0 % | 98,9 % |

El propio autor advierte de una degradación notable en 4 bits y recomienda las builds de 8 bits (FP8 / AWQ INT8).

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2,0-2,2 GB solo de pesos; con caché KV y overhead de vLLM, aproximadamente 4-6 GB para contextos moderados, y más si se usa el máximo de 32768 tokens de contexto (estimación, dato exacto no disponible).
- GPUs recomendadas: cualquier GPU moderna compatible con vLLM; al ser pesos FP4 con activaciones BF16, se beneficia de GPUs NVIDIA recientes (arquitectura Ampere o superior; el formato nvfp4 está optimizado para Blackwell, aunque el esquema W4A16 funciona de forma más general). No hay datos oficiales de compatibilidad.
- Consumer GPUs: sí, cabe con holgura en GPUs de 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090).
- Despliegue: vLLM es el runtime documentado (`vllm serve axteam/MiniCPM5-2B-NVFP4A16 --max-model-len 32768`). El formato compressed-tensors `nvfp4-pack-quantized` no es compatible de forma nativa con llama.cpp, Ollama o TGI según la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/MiniCPM5-2B-NVFP4A16 | 2,52 B | W4A16 (FP4) | 32768 (en ejemplos) | Apache-2.0 | Hugging Face, vLLM |
| openbmb/MiniCPM5-2B (base) | ~2,5 B | BF16 | no disponible | Apache-2.0 | Hugging Face |
| Variantes 8 bits del mismo autor (FP8 / AWQ INT8) | ~2,5 B | W8A16/W8A8 | no disponible | Apache-2.0 | Mencionadas en la model card, enlaces no disponibles |

La comparación principal es con el propio modelo base: la versión NVFP4A16 reduce el tamaño en disco a la mitad (~2,0 GB) a costa de una degradación medible (perplejidad +14,6 %, acuerdo top-1 del 85 % frente al 98,9 % del BF16). El autor recomienda las variantes de 8 bits cuando la calidad sea prioritaria.

## Limitaciones y advertencias

- Degradación de calidad significativa: la propia model card advierte de una pérdida notable en 4 bits (perplejidad +14,6 % respecto al BF16, acuerdo top-1 del 85 %) y recomienda las builds de 8 bits (FP8 / AWQ INT8) para cargas sensibles a la calidad.
- Riesgo de alucinación: no cuantificado; al tratarse de un modelo de 2,5 B con cuantización agresiva, conviene asumir un riesgo elevado en tareas fácticas y validar las salidas en producción.
- Sesgos: no hay información publicada sobre sesgos del modelo base ni de la versión cuantizada.
- Idiomas: no documentados oficialmente; la evaluación interna del autor se hizo sobre inglés y coreano, por lo que el rendimiento en castellano es desconocido y debe verificarse antes de uso en producción.
- Compatibilidad de runtime limitada: el formato compressed-tensors `nvfp4-pack-quantized` está orientado a vLLM; no hay soporte documentado para llama.cpp, Ollama o TGI.
- Contexto: la longitud de 32768 tokens procede de los ejemplos de despliegue; el máximo oficial del modelo base no está indicado en la información disponible.
- Licencia: Apache-2.0, sin restricciones conocidas para uso comercial; los pesos y el tokenizador originales pertenecen a OpenBMB.
- Adopción muy baja: con 83 descargas y 1 like en el momento de la ficha, es un recurso de nicho sin comunidad de soporte significativa.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/MiniCPM5-2B-NVFP4A16
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
