# dphn/Dolphin3.0-Llama3.1-8B

## Resumen

Dolphin3.0-Llama3.1-8B es un modelo de lenguaje de 8.030.277.632 parámetros desarrollado por Cognitive Computations (Eric Hartford, Ben Gitter, BlouseJury) como parte de la colección Dolphin 3.0. Se trata de un ajuste fino por instrucciones del modelo base meta-llama/Llama-3.1-8B, orientado a ser un modelo local de propósito general que cubra código, matemáticas, uso de herramientas (function calling) y casos de uso agénticos. La relevancia del modelo reside en su filosofía de "steerability": a diferencia de los modelos comerciales, el propietario del sistema define el system prompt y la alineación, sin que el proveedor imponga directrices fijas ni controle las versiones del modelo.

Arquitectura transformer decoder-only heredada de Llama 3.1 8B, con licencia llama3.1 y pesos en formato safetensors (16,1 GB de repositorio, lo que sugiere pesos en BF16). El modelo está entrenado exclusivamente en inglés, según los metadatos de la model card, y se distribuye con un pipeline no especificado. Su tamaño de 8B lo sitúa en el rango de despliegue en GPU de consumo y en entornos de inferencia local con cuantización.

La ficha se basa en los datos publicados en Hugging Face y en los resultados declarados por el autor en el model-index (no verificados por un tercero). No se dispone de información sobre la composición exacta del dataset de entrenamiento, el número de tokens o las técnicas de alineación empleadas más allá de las fuentes de datos listadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama 3.1 8B) |
| Parámetros totales | 8.030.277.632 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Llama 3.1 8B, 128k tokens, según el modelo base; no confirmado en la model card) |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Inglés (en) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |
| Pipeline | No disponible |
| Tamaño del repositorio | 16,1 GB |
| Modelo base | meta-llama/Llama-3.1-8B |
| Fecha de creación | 2024-12-29 |
| Última actualización | 2026-11-21 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por instrucciones (instruction tuning) del checkpoint meta-llama/Llama-3.1-8B, un transformer decoder-only denso de 8B parámetros. No se introduce ninguna modificación arquitectónica conocida respecto al modelo base; la model card no describe cambios en atención, positional encoding ni capas. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF, DPO o similares.

Las fuentes de datos declaradas en los metadatos incluyen una mezcla orientada a código, matemáticas, function calling y conversación general: OpenCoder-LLM/opc-sft-stage1 y stage2, microsoft/orca-agentinstruct-1M-v1, microsoft/orca-math-word-problems-200k, NousResearch/hermes-function-calling-v1, AI-MO/NuminaMath-CoT, AI-MO/NuminaMath-TIR, allenai/tulu-3-sft-mixture, cognitivecomputations/dolphin-coder, HuggingFaceTB/smoltalk, cognitivecomputations/samantha-data, m-a-p/CodeFeedback-Filtered-Instruction y m-a-p/Code-Feedback. Esta combinación sugiere un entrenamiento supervisado (SFT) con datos de instrucciones, matemáticas con cadena de pensamiento, código y llamadas a funciones. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto general y conversación multi-turno en inglés.
- Razonamiento y matemáticas, con datos de entrenamiento específicos de NuminaMath-CoT y NuminaMath-TIR (razonamiento con herramientas).
- Generación y comprensión de código, con datasets como OpenCoder SFT, dolphin-coder y CodeFeedback.
- Soporte de function calling / tool calling, entrenado con NousResearch/hermes-function-calling-v1.
- Capacidades agénticas y de instrucciones multi-paso, con microsoft/orca-agentinstruct-1M-v1.
- Seguimiento de instrucciones, con datos de smoltalk y tulu-3-sft-mixture.
- Modelo "steerable": el system prompt y la alineación los define el propietario del despliegue.
- Capacidades multilingües: limitadas al inglés según los metadatos (language: en).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Asistente de código en local: el modelo puede generar y revisar código en pipelines de desarrollo, aprovechando su entrenamiento con OpenCoder, dolphin-coder y CodeFeedback. Adecuado para entornos donde no se quiere enviar código a APIs externas.
- Automatización de function calling en agentes: gracias al entrenamiento con hermes-function-calling-v1 y orca-agentinstruct, puede integrarse en flujos agénticos que invocan herramientas externas (APIs, bases de datos) mediante esquemas JSON.
- Tutoría de matemáticas paso a paso: los datos de NuminaMath-CoT permiten generar razonamientos encadenados para problemas matemáticos, útil en herramientas educativas que requieren explicaciones intermedias.
- Atención al cliente con control de alineación: al ser steerable, una empresa puede definir su propio system prompt y tono sin que el proveedor imponga directrices, desplegándolo on-premise para proteger datos de usuarios.
- Procesamiento de documentos y resumen en inglés: con contexto heredado del base Llama 3.1 (hasta 128k tokens según el modelo base), puede resumir y extraer información de documentos largos en inglés.
- Prototipado rápido en GPU de consumo: su tamaño de 8B permite desplegarlo en una sola GPU consumer con cuantización, lo que facilita iteración local en investigación y desarrollo.
- Generación de instrucciones y datos sintéticos: útil como modelo generador en pipelines de destilación o aumento de datos, dado su ajuste a instrucciones y su licencia permisiva dentro de los términos de Llama 3.1.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados por un tercero):

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| IFEval | 0-shot | averaged accuracy | 76,21 |
| BBH | 3-shot | acc_norm | 27,63 |
| MATH Lvl 5 | 4-shot | exact match | 10,5 |
| GPQA | 0-shot | acc_norm | 4,36 |
| MuSR | 0-shot | acc_norm | 8,97 |
| MMLU-PRO | 5-shot | accuracy | 22,13 |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks de código o matemáticas elementales. Los valores de BBH, GPQA, MuSR y MMLU-PRO son notablemente bajos en comparación con el modelo base Llama 3.1 8B, lo que sugiere que el ajuste fino prioriza el seguimiento de instrucciones y la conversación sobre el razonamiento académico medido por estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 8B, los pesos en BF16 ocupan aproximadamente 16 GB; en cuantización de 8 bits, unos 8 GB; en 4 bits, unos 4-5 GB, más overhead de contexto KV.
- GPU recomendadas: no especificadas por el autor. Para BF16 se requiere una GPU con al menos 16-24 GB (RTX 4090, A100 40GB, L40S). Para cuantización 4-bit puede caber en GPUs consumer de 8 GB.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090 (BF16), RTX 3090/4080 y GPUs de 8-12 GB con cuantización, aunque no hay datos oficiales confirmados.
- Opciones de despliegue: no documentadas en la información proporcionada. Por compatibilidad con Llama 3.1, cabría esperar soporte en vLLM, llama.cpp, Ollama y TGI, pero no se confirma en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Dolphin3.0-Llama3.1-8B | 8,03B | No disponible (base Llama 3.1: 128k) | llama3.1 | Instrucciones, código, matemáticas, function calling, steerable | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | llama3.1 | Instrucciones generales con alineación fija de Meta | Hugging Face |
| Qwen2.5-7B-Instruct | 7,6B | 128k (32k nativo, extensible) | Apache 2.0 | Instrucciones, código, multilingüe | Hugging Face |

La comparativa se limita a datos estructurales; no se dispone de resultados de benchmarks comparables en la información proporcionada para establecer diferencias de rendimiento verificadas. La principal diferencia de Dolphin frente a Llama 3.1 Instruct es la ausencia de alineación impuesta y la orientación a function calling y uso agéntico; frente a Qwen2.5, la licencia es más restrictiva y el soporte multilingüe es menor (solo inglés).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre datasets diversos de la comunidad, pueden persistir sesgos de esas fuentes.
- Riesgo de alucinación: presente como en cualquier LLM de 8B; los benchmarks de razonamiento (BBH 27,63, GPQA 4,36) indican un rendimiento bajo en tareas que requieren conocimiento factual y razonamiento complejo, lo que aumenta el riesgo de respuestas incorrectas en dominios especializados.
- Limitaciones de idioma: el modelo está declarado únicamente en inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: la model card no especifica la ventana de contexto efectiva tras el ajuste fino; aunque el base soporta 128k, no se confirma que el fine-tuning preserve esa capacidad.
- Restricciones de licencia: licencia llama3.1, que impone condiciones de uso (incluida la política de uso aceptable de Meta y obligaciones de atribución). Es necesario revisar los términos antes de uso comercial.
- Ausencia de alineación: el modelo no impone directrices éticas propias; el propietario del despliegue es responsable de definir y aplicar las salvaguardas, lo que implica riesgo si se despliega sin moderación.
- Caveat para producción: los benchmarks declarados son autoinformados y no verificados; los valores bajos en BBH, GPQA y MMLU-PRO sugieren que no es adecuado para tareas de razonamiento académico o conocimiento experto sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dphn/Dolphin3.0-Llama3.1-8B
- Colección Dolphin 3.0: https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3
- Perfil de Eric Hartford: https://huggingface.co/ehartford
- Perfil de Ben Gitter: https://huggingface.co/bigstorm
- Perfil de BlouseJury: https://huggingface.co/BlouseJury
- Organización Cognitive Computations: https://huggingface.co/cognitivecomputations
- Discord de Cognitive Computations: https://discord.gg/cognitivecomputations
- Open LLM Leaderboard (resultados referenciados): https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard#/?search=cognitivecomputations%2FDolphin3.0-Llama3.1-8B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- DOI: https://doi.org/10.57967/hf/11779
