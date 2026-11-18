# AtomicChat/LFM2.5-24B-A2B-Uncensored-GGUF

## Resumen

LFM2.5-24B-A2B-Uncensored-GGUF es una compilación de cuantizaciones GGUF publicada por AtomicChat sobre el modelo base LiquidAI/LFM2.5-24B-A2B, un transformer de tipo mixture-of-experts (MoE) desarrollado por Liquid AI. El modelo original cuenta con 23.971.587.712 parámetros totales, de los cuales solo una fracción se activa por token (A2B, aproximadamente 2 mil millones de parámetros activos). Esta versión concreta aplica una técnica de "abliteration" (ablación de la dirección de rechazo) sobre los pesos originales, con el objetivo de eliminar los comportamientos de negativa del modelo en la segunda mitad de la red (bloques 14-39 de 40).

El interés de esta ficha reside en dos aspectos. Por un lado, documenta una modificación técnica concreta y medible: según la model card, las negativas en inglés caen del 96,3 % al 1,2 % en conjuntos de prompts reservados, mientras que MMLU se mantiene en el 65,55 % (frente al 64,40 % original, dentro del ruido estadístico). Por otro, ofrece seis builds GGUF con cuantizaciones que van desde 12,1 GB (IQ3_M) hasta 25,7 GB (Q8_0), además de un adaptador LoRA de 24 MB que puede aplicarse sobre las cuantizaciones ya existentes del modelo original.

El modelo está pensado para ejecución local y offline mediante llama.cpp, con soporte para 10 idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano), tool calling y modo de razonamiento ("thinking"). La licencia es lfm1.0, heredada del modelo base, y conviene revisar sus restricciones antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), familia LFM2.5 (lfm2moe) |
| Parametros totales | 23.971.587.712 (23,97 B) |
| Parametros activos | A2B (aproximadamente 2 B activos por token, segun nomenclatura del modelo) |
| Longitud de contexto | no disponible (la model card muestra pruebas con 30k tokens y configuración `-c 32768` en llama-server) |
| Tipos de cuantizacion | AD-Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ3_M (y AD-IQ3_XXS de 11,1 GB no publicada) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF (llama.cpp); adaptador LoRA en GGUF de 24 MB |

## Arquitectura y entrenamiento

El modelo base LFM2.5-24B-A2B es un transformer con arquitectura de mezcla de expertos (MoE) de la familia LFM2.5 de Liquid AI. La nomenclatura "A2B" indica que, pese a los casi 24 mil millones de parámetros totales, solo unos 2 mil millones se activan por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. La model card de esta versión no detalla la composición del dataset de entrenamiento original, el número de tokens ni si hubo fases de RLHF o DPO; esos datos corresponden a la documentación del modelo base y no se reproducen aquí.

La modificación introducida por AtomicChat es una ablación de la dirección de rechazo ("refusal-direction abliteration") aplicada exclusivamente a los bloques 14 a 39 de los 40 que componen la red. Según la model card, extender la misma edición a los 40 bloques también eliminaba las negativas, pero costaba 4 puntos de MMLU; el daño se concentra en los primeros 14 bloques, no en el comportamiento de rechazo. La edición se materializa de dos formas: seis builds GGUF con la modificación ya incorporada y un adaptador LoRA de rango 1 (24 MB, 52 sitios de aplicación) que se puede cargar con `--lora-scaled` sobre cualquier GGUF del modelo original (revisión `f772950c`). Las cuantizaciones usan la misma matriz de importancia (imatrix) y el mismo layout que las cuantizaciones originales publicadas por AtomicChat.

## Capacidades

- Generación de texto conversacional multi-turno en 10 idiomas.
- Razonamiento con modo "thinking" (la model card reporta pruebas con 3072 tokens de pensamiento y ningún caso de pensamiento sin cerrar).
- Tool calling / function calling: 20 de 20 llamadas válidas en las pruebas reportadas, tanto en el original como en el modelo ablacionado.
- Recuperación de información en contexto largo: prueba de "needle" a 30k tokens en 3 profundidades, con 3 de 3 aciertos en la versión ablacionada (2 de 3 en el original).
- Generación de código (la model card mide KLD sobre texto neutro y código por separado).
- Respuestas sin negativas ante prompts que el modelo original rechazaba, manteniendo estructura y hechos según la evaluación manual descrita.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.

## Casos de uso

- Asistentes conversacionales locales y offline: el modelo puede ejecutarse con llama.cpp en hardware de consumo (el build Q4_K_M ocupa 15,4 GB), lo que permite desplegar un chatbot privado sin conexión a servicios externos.
- Atención al cliente automatizada: la ventana de contexto admite al menos 32k tokens en la configuración de ejemplo (`-c 32768`), suficiente para incorporar historial de conversación y documentación de producto en el mismo prompt.
- Generación de código en pipelines locales: el soporte de tool calling validado (20/20) permite integrarlo en flujos de agentes que invocan funciones o herramientas externas desde un entorno controlado.
- Investigación sobre alineación y seguridad: la diferencia medida entre el modelo original y el ablacionado (96,3 % → 1,2 % de negativas, con MMLU estable) lo convierte en un caso de estudio útil para analizar qué componentes de la red codifican el comportamiento de rechazo.
- Procesamiento multilingüe: con soporte declarado para español, portugués, italiano, francés, alemán, árabe, chino, japonés y coreano, sirve para tareas de traducción, resumen o extracción en entornos multilingües.
- Análisis de documentos largos: la prueba de recuperación a 30k tokens sugiere su uso para preguntas sobre contratos, informes o bases de conocimiento extensas.
- Despliegue en estaciones de trabajo con 24-32 GB de VRAM: los builds Q6_K (20,9 GB) y Q8_0 (25,7 GB) están pensados explícitamente para estos perfiles de memoria.

## Benchmarks y rendimiento

Datos publicados en la model card de AtomicChat (original frente a ablacionado, ambos en BF16):

| Metrica | Original | Ablacionado |
|---|---|---|
| JBB harmful behaviours (EN, 81), rechazados | 96,3 % | 1,2 % |
| XSTest safe prompts (250), rechazados | 12,8 % | 0 % |
| Con thinking (30 prompts, 3072 tokens), rechazados | 30 de 30 | 0 de 30 |
| Thinking sin cerrar a 3072 tokens | 0 de 30 | 0 de 30 |
| Respuestas vacías o en bucle (431) | 0 | 0 |
| MMLU (2000 preguntas) | 64,40 % | 65,55 % (+1,15; McNemar p = 0,06) |
| Tool calls (20) | 20/20 válidas | 20/20 válidas |
| Needle a 30k tokens (3 profundidades) | 2/3 | 3/3 |
| KLD medio al original (neutro / código) | - | 0,204 / 0,179 |

Metricas de cuantizacion (KLD y coincidencia top-1 frente al BF16 original sin modificar):

| Build | Tamano en disco | KLD medio | Mismo top-1 | Rechazos EN / XSTest |
|---|---|---|---|---|
| AD-Q8_0 | 25,7 GB | 0,229 | 81,4 % | 1,2 % / 0 % |
| AD-Q6_K | 20,9 GB | 0,239 | 81,0 % | no disponible |
| AD-Q5_K_M | 17,3 GB | 0,271 | 80,3 % | no disponible |
| AD-Q4_K_M | 15,4 GB | 0,274 | 79,6 % | 1,2 % / 0 % |
| AD-IQ4_XS | 14,5 GB | 0,274 | 79,3 % | no disponible |
| AD-IQ3_M | 12,1 GB | 0,359 | 76,0 % | no disponible |

La model card aclara que la mayor parte del KLD corresponde a la edición (0,204 en pesos BF16) y no a la cuantización (0,063 para el Q8_0 del original). No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, según build: IQ3_M 12,1 GB; IQ4_XS 14,5 GB; Q4_K_M 15,4 GB; Q5_K_M 17,3 GB; Q6_K 20,9 GB; Q8_0 25,7 GB. Hay que añadir el espacio del contexto KV según la longitud de contexto configurada.
- GPU recomendadas: la model card orienta el Q4_K_M a máquinas con 24 GB de VRAM y el Q6_K a máquinas con 32 GB. Para el Q8_0 se requiere al menos 32 GB o descarga parcial a CPU.
- Cabe en GPU de consumo: sí, con los builds IQ3_M, IQ4_XS y Q4_K_M en tarjetas de 16-24 GB (por ejemplo, RTX 4090 de 24 GB); el Q6_K y el Q8_0 requieren 24-32 GB o reparto con CPU.
- Opciones de despliegue: llama.cpp (llama-server, con `-ngl 99`, `--jinja` y `--lora-scaled` para el adaptador); compatible con endpoints según los tags del repositorio. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-Uncensored-GGUF (este) | 23,97 B totales, ~2 B activos | no disponible | lfm1.0 | GGUF + LoRA | Ablacionado; rechazos 1,2 % EN; MMLU 65,55 % |
| LiquidAI/LFM2.5-24B-A2B (original) | 23,97 B totales, ~2 B activos | no disponible | lfm1.0 | BF16 / GGUF | Rechazos 96,3 % EN; MMLU 64,40 % |
| AtomicChat/LFM2.5-24B-A2B-GGUF | 23,97 B totales, ~2 B activos | no disponible | lfm1.0 | GGUF | Cuantizaciones sin ablacionar; KLD 0,063 en Q8_0 |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La eliminación del comportamiento de rechazo es una modificación deliberada de la alineación de seguridad. El modelo puede producir contenido que el original rechazaría; es responsabilidad del desplegador aplicar sus propias salvaguardas.
- La medición de rechazos se basa en la apertura de la respuesta, por lo que es indicativa y no un juicio automático fiable.
- Existe una deriva medible respecto al original: KLD medio de 0,204 en texto neutro y 0,179 en código, con un 81,4 % de coincidencia top-1 en Q8_0. El cambio se describe como una variación en la elección de palabras, con respuestas más directas y menos preámbulo.
- La licencia lfm1.0 es de tipo "other" y puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE antes de producción.
- No se detalla la longitud máxima de contexto soportada por el modelo base; las pruebas se limitan a 30k tokens y la configuración de ejemplo usa 32768.
- No se han publicado datos sobre sesgos demográficos, toxicidad o rendimiento en idiomas distintos del inglés más allá de la lista de idiomas soportados.
- El build IQ3_XXS (11,1 GB) se descartó por coincidir solo el 74,5 % del top-1 y rechazar el 3,7 % de prompts en inglés; no está publicado.
- El adaptador LoRA requiere la revisión `f772950c` del modelo original y un factor de escala de 1,75 según el ejemplo de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtomicChat/LFM2.5-24B-A2B-Uncensored-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Cuantizaciones originales de AtomicChat: https://huggingface.co/AtomicChat/LFM2.5-24B-A2B-GGUF
- Dataset de métricas: https://huggingface.co/datasets/AtomicChat/LFM2.5-24B-A2B-Uncensored-GGUF-metrics
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
