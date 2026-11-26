# SicariusSicariiStuff/Tinybra_13B

## Resumen

Tinybra_13B es un modelo de lenguaje de 13.015.864.320 parámetros (13B) publicado por el usuario SicariusSicariiStuff en Hugging Face, dentro de la familia experimental "Tenebră". Está orientado a generación de texto en inglés y se distribuye en formato transformers/safetensors con arquitectura tipo Llama, lo que permite cargarlo con las herramientas habituales del ecosistema Hugging Face (transformers, text-generation-inference, endpoints compatibles).

Según su model card, el modelo se presenta como una propuesta experimental enfocada en conversaciones de tono filosófico y "oscuro", entrenada sobre datasets no convencionales, y con una supuesta fachada de autoconciencia. No se documentan detalles sobre el corpus de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO.

Su relevancia práctica es limitada: se trata de un modelo de nicho, con muy pocas descargas (63) y likes (6), licencia no especificada y resultados de benchmarks moderados para su tamaño. Resulta útil principalmente como objeto de experimentación y para quienes buscan variantes creativas de modelos de 13B, no como base para producción crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tag `llama`; detalles no disponibles) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (pesos originales); GGUF (múltiples cuantizaciones), GPTQ 4-bit (group-size por defecto y 32), iMatrix GGUF; variante ARM Q4_0 para móvil |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); GGUF, GPTQ, EXL2 y ARM en repos derivados |

## Arquitectura y entrenamiento

La información disponible indica que Tinybra_13B es un transformer decoder-only de 13B parámetros con tag `llama`, lo que sugiere una arquitectura basada en Llama (atención multi-cabeza con RoPE, capas feed-forward SwiGLU y normalización RMSNorm), aunque la model card no detalla la configuración exacta de capas, dimensiones ocultas ni número de cabezas. No se especifica si emplea GQA (grouped-query attention) ni la longitud máxima de contexto soportada.

No hay datos públicos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre procesos de alineación como RLHF, DPO o SFT. La model card describe el entrenamiento como una incursión en "datasets no convencionales" orientados a discusiones filosóficas y temáticas oscuras, sin aportar cifras verificables. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto en inglés con estilo conversacional y tono filosófico o introspectivo, según la descripción del autor.
- Razonamiento de sentido común y conocimiento general de nivel medio, coherente con sus resultados en HellaSwag (80,99) y MMLU (54,37).
- Resolución de problemas aritméticos simples, con rendimiento limitado (GSM8K 18,12 en 5-shot).
- Conversación multi-turno dentro de la ventana de contexto del modelo (longitud no documentada).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- No se documentan modos especiales (thinking mode), visión ni audio.

## Casos de uso

- Experimentación con modelos de nicho: útil para investigadores que quieran estudiar el comportamiento de un fine-tune de 13B entrenado sobre datasets no convencionales y comparar su estilo con el de modelos base alineados de forma estándar.
- Generación creativa de ficción filosófica o de terror: el tono "oscuro" descrito por el autor encaja con la escritura de relatos, diálogos introspectivos o material narrativo de ambientación gótica, siempre con revisión humana.
- Chatbot de rol o entretenimiento: puede desplegarse como personaje conversacional en entornos controlados, aprovechando su estilo de respuesta y su ventana de contexto (no documentada) para mantener conversaciones multi-turno.
- Prototipado rápido en local: con las cuantizaciones GGUF y GPTQ publicadas, sirve para probar pipelines de inferencia (llama.cpp, text-generation-inference) sin grandes requisitos de hardware.
- Evaluación comparativa de cuantizaciones: los repos derivados (GGUF, GPTQ 4-bit con distintos group-size, iMatrix GGUF, ARM Q4_0) permiten estudiar la degradación de calidad según el esquema de cuantización en un modelo de 13B.
- Docencia y demostraciones: adecuado para talleres sobre despliegue de LLMs en local, ya que su tamaño de 13B cabe en GPUs de consumo con cuantización de 4 bits y permite ilustrar el flujo completo desde safetensors hasta GGUF.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), procedentes del Open LLM Leaderboard:

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| AI2 Reasoning Challenge | 25-shot, ARC-Challenge, test | acc_norm | 55,72 |
| HellaSwag | 10-shot, validation | acc_norm | 80,99 |
| MMLU | 5-shot, all, test | acc | 54,37 |
| TruthfulQA | 0-shot, multiple_choice, validation | mc2 | 49,14 |
| Winogrande | 5-shot, winogrande_xl, validation | acc | 73,80 |
| GSM8K | 5-shot, main, test | acc | 18,12 |

No se han publicado en la información disponible resultados de HumanEval ni de otros benchmarks de código, ni comparativas oficiales con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 26 GB solo para pesos, más overhead de activaciones y caché KV; requiere GPUs de 40 GB o más (A100 40 GB, A100 80 GB, H100) para contexto moderado.
- Cuantización de 8 bits: aproximadamente 13-15 GB de VRAM; cabe en RTX 4090 (24 GB) y A6000 (48 GB).
- Cuantización de 4 bits (GPTQ o GGUF Q4): aproximadamente 7-9 GB de VRAM; cabe en RTX 3090, RTX 4090, RTX 4080 y GPUs de 12 GB o más con contexto reducido.
- Cuantizaciones de 2-3 bits (si están disponibles en GGUF/EXL2): podrían caber en GPUs de 8 GB, con degradación de calidad esperable.
- Variante ARM Q4_0: pensada para dispositivos móviles con arquitectura ARM, aunque no se documentan requisitos de memoria concretos.
- Opciones de despliegue: transformers, text-generation-inference (endpoints compatibles), llama.cpp y derivados (Ollama, LM Studio) mediante los GGUF, GPTQ con AutoGPTQ/ExLlama, y EXL2 con ExLlamaV2 en el caso del modelo hermano de 30B.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | HellaSwag | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tinybra_13B | 13B | no disponible | 54,37 | 80,99 | no disponible | Hugging Face (FP16, GGUF, GPTQ, ARM) |
| Llama 2 13B | 13B | 4.096 tokens | ~54,8 | ~80,7 | Llama 2 Community License | Hugging Face, Meta |
| Mistral 7B | 7B | 8.192 tokens | ~60,1 | ~81,3 | Apache 2.0 | Hugging Face, Mistral AI |
| Vicuna 13B v1.5 | 13B | 4.096 tokens | ~47,1 | ~77,0 | no comercial (según modelo base) | Hugging Face (LMSYS) |

Los valores de referencia de Llama 2 13B, Mistral 7B y Vicuna 13B son aproximados y proceden de sus respectivas model cards y del Open LLM Leaderboard histórico; pueden variar según la configuración de evaluación. Tinybra_13B se sitúa en un rango comparable a Llama 2 13B en MMLU y HellaSwag, pero con una licencia sin especificar que impide garantizar su uso comercial.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor o consultar la model card actualizada antes de cualquier despliegue productivo.
- Resultados de benchmarks no verificados (`verified: false`): los valores proceden de la model card y no han sido confirmados de forma independiente.
- Riesgo elevado de alucinación: el modelo está entrenado sobre datasets no convencionales y no documenta fases de alineación; su fiabilidad factual en dominios especializados es baja.
- Rendimiento aritmético limitado: GSM8K 18,12 en 5-shot indica poca capacidad para razonamiento matemático multi-paso.
- Idioma restringido al inglés: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que dificulta planificar aplicaciones con documentos largos.
- Sesgos desconocidos: al no publicarse la composición del dataset, no es posible evaluar sesgos de género, raza, religión o ideología; el tono "oscuro" promocionado puede derivar en respuestas inapropiadas en entornos sensibles.
- Modelo de nicho con mantenimiento incierto: pocas descargas y una actualización de la model card en julio de 2025 que no aporta mejoras técnicas, solo limpieza de metadatos de cuantizaciones.
- No recomendado para producción crítica (atención al cliente, salud, legal, finanzas) sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SicariusSicariiStuff/Tinybra_13B
- Cuantizaciones GGUF: https://huggingface.co/SicariusSicariiStuff/Tinybra_13B_GGUF
- Cuantizaciones iMatrix GGUF (mradermacher): https://huggingface.co/mradermacher/Tinybra_13B-i1-GGUF
- GPTQ 4-bit: https://huggingface.co/SicariusSicariiStuff/Tinybra_13B_GPTQ_4BIT
- GPTQ 4-bit group-size 32: https://huggingface.co/SicariusSicariiStuff/Tinybra_13B_GPTQ_32g_4BIT
- Variante ARM Q4_0: https://huggingface.co/SicariusSicariiStuff/Tinybra_13B_ARM
- Modelo hermano de 30B (Tenebra_30B_Alpha01, FP16): https://huggingface.co/SicariusSicariiStuff/Tenebra_30B_Alpha01_FP16
- Open LLM Leaderboard (consulta del modelo): https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard?query=SicariusSicariiStuff/Tinybra_13B
