# SicariusSicariiStuff/Wingless_Imp_8B

## Resumen

Wingless_Imp_8B es un modelo de lenguaje de 8.030.261.248 parámetros (aproximadamente 8B) publicado por el usuario SicariusSicariiStuff en HuggingFace el 24 de enero de 2025. Se trata de un merge de modelos, es decir, una combinación de pesos de tres modelos base del propio autor: Impish_Mind_8B, LLAMA-3_8B_Unaligned_BETA y Dusk_Rainbow. El modelo se distribuye bajo licencia llama3.1 y está orientado exclusivamente al inglés.

El modelo se presenta como un 8B derivado de la familia Llama 3.1, con un enfoque explícito hacia el roleplay, la escritura creativa y el conocimiento general, evitando un exceso de censura. El autor declara un IFeval de 74,30 y afirma que no se aplicó SFT adicional tras el merge para preservar el comportamiento resultante de la combinación.

Su relevancia radica en ser un ejemplo de la práctica de merges comunitarios sobre Llama 3.1: modelos de 8B con contexto largo, sin alineamiento restrictivo y con cuantizaciones publicadas para múltiples backends (GGUF, EXL2, FP8, ARM). No obstante, la información técnica disponible en la model card es escasa y de naturaleza promocional, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1, segun la licencia y los modelos base) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (los modelos base Llama 3.1 soportan 128K tokens; el merge no declara contexto propio) |
| Tipos de cuantizacion | FP16, FP8, GGUF (estaticas, iMatrix, High-Attention, iMatrix-High-Attention), EXL2 (3.5, 4.0, 5.0, 6.0, 7.0, 8.0 bpw), ARM Q4_0 y Q4_0 High-Attention |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (repo principal), GGUF, EXL2, FP8 |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento desde cero. Segun los metadatos, combina tres modelos: Impish_Mind_8B, LLAMA-3_8B_Unaligned_BETA y Dusk_Rainbow, todos ellos derivados de Llama 3.1 8B. La arquitectura subyacente es, por tanto, la de un transformer decoder-only de la familia Llama 3.1, con atención causal estándar y sin innovaciones arquitectónicas declaradas (no se mencionan atención lineal, SSM ni decodificación especulativa).

El autor indica que algunos de los modelos fusionados fueron sometidos a un SFT tardío orientado a escritura creativa y datos de libros, y que el merge final no recibió SFT adicional. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La model card tampoco detalla la técnica de merge empleada (por ejemplo, SLERP, TIES o DARE), lo que impide reproducir el proceso.

## Capacidades

- Generación de texto en inglés con énfasis en escritura creativa y prosa literaria.
- Roleplay en formato de rol de internet, con párrafos de longitud media según el autor.
- Coherencia en contexto largo, heredada de los modelos Llama 3.1 base (el autor lo atribuye a esta familia).
- Conocimiento general amplio, según el autor, procedente de la combinación de los modelos fusionados.
- Razonamiento de instrucciones evaluado mediante IFeval (74,30 según el autor).
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés declarado.

## Casos de uso

- Roleplay conversacional: el modelo está ajustado para formato de rol de internet y párrafos medios, por lo que encaja en plataformas de chat narrativo donde se requiere mantener un personaje durante turnos largos.
- Escritura creativa y narrativa: el SFT tardío sobre datos de libros y escritura creativa de los modelos fusionados lo hace adecuado para generar relatos, descripciones y diálogos con estilo literario.
- Generación de ficción interactiva: puede emplearse como motor de historias ramificadas en aplicaciones de ficción interactiva, aprovechando su coherencia en contexto largo.
- Prototipado de asistentes sin censura restrictiva: para experimentación interna donde se necesite un modelo 8B con menor rechazo a temas sensibles, siempre dentro de los límites de la licencia Llama 3.1.
- Evaluación de merges comunitarios: útil como caso de estudio para investigadores que analizan el efecto de fusionar modelos alineados y no alineados sobre el mismo backbone.
- Despliegue en hardware de consumo: con cuantizaciones GGUF y EXL2 publicadas, puede ejecutarse en GPUs de gama alta para consumo (por ejemplo, RTX 3090/4090 con cuantizaciones de 4-6 bpw) en tareas de generación de texto y rol.
- Inferencia en dispositivos ARM: las cuantizaciones Q4_0 y Q4_0 High-Attention permiten ejecución en hardware móvil o de bajo consumo para demos y pruebas.

## Benchmarks y rendimiento

La model card únicamente declara un resultado de IFeval de 74,30 y una afirmación genérica de ser el "modelo 8B mejor valorado según un benchmark externo cerrado", sin especificar el benchmark ni los detalles. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| IFeval | 74,30 | Dato declarado por el autor en la model card |
| Benchmark externo cerrado | "Highest rated 8B" | No se especifica el nombre ni la metodología |
| MMLU | no disponible | No publicado |
| HumanEval | no disponible | No publicado |
| GSM8K | no disponible | No publicado |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB de pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 18-20 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits (FP8): alrededor de 8-9 GB de pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4, EXL2 4.0 bpw): alrededor de 4,5-5,5 GB de pesos, con margen adicional para contexto.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de producción en FP16; RTX 4090 (24 GB) y RTX 3090 (24 GB) para FP16 o cuantizaciones altas; RTX 4080/4070 Ti Super (16 GB) para cuantizaciones de 8 bits; GPUs de 8 GB para cuantizaciones de 4 bits con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores con cuantizaciones GGUF o EXL2 de 4-6 bpw.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; ExLlamaV2 para EXL2; vLLM y TGI para safetensors en FP16/FP8; llama.cpp también para las cuantizaciones ARM.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Wingless_Imp_8B | 8,03B | no disponible (base Llama 3.1) | llama3.1 | Merge orientado a roleplay y escritura creativa | HuggingFace, cuantizaciones GGUF/EXL2/FP8/ARM |
| Llama 3.1 8B Instruct | 8B | 128K | llama3.1 | Asistente general alineado | HuggingFace, amplio ecosistema |
| Mistral 7B Instruct | 7,2B | 32K | Apache 2.0 | Asistente general | HuggingFace, ecosistema amplio |
| Gemma 2 9B Instruct | 9B | 8K | Gemma Terms | Asistente general | HuggingFace, requiere aceptacion de terminos |

La comparación con Llama 3.1 8B Instruct es la más directa por compartir backbone y licencia; Wingless_Imp_8B se diferencia por un alineamiento más laxo y un enfoque creativo, pero carece de la documentación de entrenamiento y de los benchmarks del modelo oficial. Frente a Mistral 7B Instruct, la licencia Llama 3.1 es más restrictiva que Apache 2.0. Frente a Gemma 2 9B, el contexto declarado de Wingless_Imp_8B no está especificado, aunque su base Llama 3.1 soporta 128K.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un merge de modelos "unaligned" y sin SFT final, es esperable una menor mitigación de sesgos que en modelos alineados oficialmente.
- Riesgo de alucinación: no evaluado; no hay benchmarks de veracidad ni de calibración publicados.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la model card no declara una longitud de contexto propia; no debe asumirse 128K sin verificación empírica, aunque el backbone Llama 3.1 lo soporte.
- Licencia: llama3.1 impone restricciones de uso comercial, obligaciones de atribución y una política de uso aceptable; es necesario revisar los términos antes de producción.
- Falta de documentación: no se especifican datos de entrenamiento, técnica de merge, hiperparámetros ni evaluación independiente; la afirmación de "mejor modelo 8B" procede de un benchmark cerrado no identificado.
- Caveat para producción: al no haber SFT final ni evaluaciones de seguridad, no es recomendable para aplicaciones orientadas al usuario sin filtros adicionales y sin una evaluación propia de calidad y sesgo.
- El modelo está claramente orientado a roleplay y contenido creativo; su uso como asistente técnico o de código no está respaldado por benchmarks.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SicariusSicariiStuff/Wingless_Imp_8B
- Cuantizaciones GGUF estáticas: https://huggingface.co/SicariusSicariiStuff/Wingless_Imp_8B_GGUF
- Cuantizaciones GGUF iMatrix: https://huggingface.co/SicariusSicariiStuff/Wingless_Imp_8B_iMatrix
- Cuantizaciones GGUF High-Attention: https://huggingface.co/SicariusSicariiStuff/Wingless_Imp_8B_GGUF_HA
- Cuantizaciones iMatrix High-Attention: https://huggingface.co/SicariusSicariiStuff/Wingless_Imp_8B_HA_NL
- EXL2 3.5 bpw: https://huggingface.co/SicariusSicariiStuff/Wingless_Imp_8B-3.5bpw
- EXL2 4.0 bpw: https://huggingface.co/SicariusSicariiStuff/Wingless_Imp_8B-4.0bpw
- EXL2 5.0 bpw: https://huggingface.co/SicariusSicariiStuff/Wingless_Imp_8B-5.0bpw
- EXL2 6.0 bpw: https://huggingface.co/SicariusSicariiStuff/Wingless_Imp_8B-6.0bpw
- EXL2 7.0 bpw: https://huggingface.co/SicariusSicariiStuff/Wingless_Imp_8B-7.0bpw
- EXL2 8.0 bpw: https://huggingface.co/SicariusSicariiStuff/Wingless_Imp_8B-8.0bpw
- FP8: https://huggingface.co/SicariusSicariiStuff/Wingless_Imp_8B_FP8
- ARM Q4_0: https://huggingface.co/SicariusSicariiStuff/Wingless_Imp_8B_ARM
- ARM Q4_0 High-Attention: https://huggingface.co/SicariusSicariiStuff/Wingless_Imp_8B_ARM_HA
- Modelo base Impish_Mind_8B: https://huggingface.co/SicariusSicariiStuff/Impish_Mind_8B
- Modelo base LLAMA-3_8B_Unaligned_BETA: https://huggingface.co/SicariusSicariiStuff/LLAMA-3_8B_Unaligned_BETA
- Modelo base Dusk_Rainbow: https://huggingface.co/SicariusSicariiStuff/Dusk_Rainbow
- Apoyo al autor (Ko-fi): https://ko-fi.com/sicarius
