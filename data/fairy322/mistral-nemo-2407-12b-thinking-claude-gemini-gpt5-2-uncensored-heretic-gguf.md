# fairy322/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC`, un fine-tune de Mistral Nemo 2407 Instruct (12,2B parámetros) orientado a escritura creativa, roleplay y generación de ficción sin censura. El autor del repo, `fairy322`, publica los pesos cuantizados por mradermacher, que a su vez derivan del trabajo de DavidAU. El modelo combina tres datasets de razonamiento de alto nivel (Claude Opus 4.5, Gemini 3 Pro y GPT-5.2) con técnicas de abliteración para eliminar los rechazos del modelo base, y añade un modo de pensamiento ("Thinking") con una ventana de contexto ampliada de 128k a 256k tokens (hasta 1M en configuraciones extremas).

La relevancia de este modelo radica en su especialización para ficción narrativa, roleplay y contenido explícito (hasta R-18), algo poco habitual en modelos abiertos de este tamaño. Al estar disponible en formato GGUF, puede ejecutarse en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles, lo que lo hace accesible para desarrolladores y aficionados al rol sin necesidad de infraestructura de servidor. No se especifica licencia, lo que supone una limitación importante para uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral Nemo 2407) |
| Parametros totales | 12.247.782.400 (12,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128k-256k (máximo 1M) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Mistral Nemo 2407 Instruct, un transformer decoder-only de 12,2B parámetros con atención deslizante (sliding window attention) y una ventana de contexto nativa de 128k tokens, ampliable hasta 256k mediante interpolación de posiciones. Sobre esta base, DavidAU aplicó un fine-tune con tres datasets de razonamiento de alta calidad: `TeichAI/claude-4.5-opus-high-reasoning-250x`, `TeichAI/gemini-3-pro-preview-high-reasoning-250x` y `TeichAI/gpt-5.2-high-reasoning-250x`, cada uno con 250 muestras de razonamiento prolongado. El nombre "HERETIC" sugiere el uso de técnicas de abliteración (abliteration), que eliminan las capas responsables de los rechazos o negativas del modelo, permitiendo respuestas sin censura en temas como violencia gráfica, horror o contenido sexual explícito. Además, el modelo fue entrenado para emitir cadenas de pensamiento ("Thinking") antes de la respuesta final, mejorando la coherencia en tareas complejas.

No se proporcionan detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset más allá de los tres conjuntos mencionados, ni el método de alineación (RLHF, DPO, etc.). La cuantización GGUF fue realizada por mradermacher usando herramientas estándar de llama.cpp, con opciones de imatrix disponibles en una variante separada.

## Capacidades

- Generación de texto creativo y ficción: capaz de producir prosa vívida, descripciones detalladas y diálogos naturales en múltiples géneros (ciencia ficción, romance, terror, fantasía).
- Roleplay y simulación de personajes: entrenado específicamente para mantener personajes consistentes y responder en estilo narrativo, ideal para juegos de rol por texto.
- Generación de tramas y subtramas: puede crear argumentos completos, giros y estructura narrativa a partir de premisas simples.
- Continuación de escenas: dado un fragmento de historia, el modelo puede continuar de manera coherente manteniendo tono y estilo.
- Razonamiento de alto nivel: gracias a los datasets de Claude/Gemini/GPT-5.2, muestra mejoras en tareas de razonamiento lógico y matemático respecto al modelo base.
- Multilingüismo: soporta nueve idiomas principales, incluidos español, francés, alemán, italiano, portugués, ruso, chino y japonés.
- Contenido sin censura: la abliteración elimina los rechazos habituales, permitiendo generar contenido explícito, lenguaje soez y escenas de horror visceral (hasta R-18).
- Modo "Thinking": puede emitir razonamiento intermedio antes de la respuesta final, útil para tareas complejas.

No se menciona soporte explícito para tool calling, function calling, agentes ni capacidades multimodales (visión o audio).

## Casos de uso

- Escritura creativa asistida: un autor puede usar el modelo para generar borradores de escenas, descripciones de entornos o diálogos, indicando el género y el tono deseado. Su capacidad para producir prosa vívida y coherente lo hace adecuado para superar bloqueos creativos.
- Roleplay por texto en comunidades online: el modelo puede interpretar personajes, mantener su personalidad a lo largo de conversaciones largas y reaccionar a las acciones del usuario, gracias a su ventana de contexto de 128k-256k que permite mantener historias extensas.
- Generación de campañas de rol de mesa: un máster de juegos como D&D puede pedir al modelo que genere tramas, subtramas, encuentros y diálogos de PNJ, adaptándose al estilo de la partida.
- Prototipado de guiones y novelas: los escritores pueden usar el modelo para explorar diferentes direcciones narrativas, generar alternativas de final o expandir sinopsis en capítulos completos.
- Análisis y resumen de textos largos: gracias a la ventana de contexto ampliada, puede procesar documentos extensos (informes, artículos, libros) y generar resúmenes o extraer información relevante.
- Generación de contenido para juegos independientes: desarrolladores de videojuegos narrativos pueden usar el modelo para crear diálogos, descripciones de objetos o misiones, integrándolo mediante la API de llama.cpp o vLLM en sus herramientas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar en la model card ni en las fuentes consultadas. La ausencia de datos impide comparar cuantitativamente su rendimiento con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización. El Q4_K_M ocupa 7,6 GB (tamaño de archivo) y requiere aproximadamente 8,07 GB de VRAM, según datos de llmrun.dev. Para Q8_0 (13,1 GB) se necesitan al menos 14 GB de VRAM.
- GPUs recomendadas: para Q4_K_M o menor, cualquier GPU con 8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) es suficiente. Para Q5_K_M o Q6_K se recomienda 10-12 GB (RTX 3080, RTX 4070 Ti). Para Q8_0 se necesita 16 GB (RTX 4080, RTX 4090, A100).
- Compatibilidad con GPU de consumo: sí, todas las cuantizaciones desde Q2_K (4,9 GB) hasta Q5_K_M (8,8 GB) caben en GPUs de consumo con 8-12 GB. El Q6_K y Q8_0 requieren GPUs de gama alta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp (especialmente orientado a roleplay), text-generation-webui, y vLLM con soporte GGUF (a través de llama.cpp backend).
- Latencia y throughput: no se proporcionan datos específicos. En una RTX 4090, se espera una velocidad de generación de 40-60 tokens/s con Q4_K_M, y en CPUs modernas (con 32 GB de RAM) unos 5-10 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Mistral-Nemo-2407-Thinking-...HERETIC (este) | 12,2B | 128k-256k | No disponible | Ficción, roleplay, sin censura |
| Mistral Nemo 12B Instruct (base) | 12,2B | 128k | Apache 2.0 | Uso general, alineado |
| Qwen2.5-14B-Instruct | 14,8B | 128k | Apache 2.0 | Uso general, multilingüe |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Uso general, razonamiento |

La comparativa es cualitativa porque no hay benchmarks publicados para el modelo HERETIC. Frente al Mistral Nemo Instruct original, este fine-tune elimina la censura y añade capacidades de razonamiento de alto nivel, pero pierde la garantía de licencia Apache 2.0 (la licencia del modelo derivado no está especificada). Frente a Qwen2.5-14B, ofrece un contexto similar pero con un tamaño menor, aunque el enfoque en ficción explícita lo hace menos versátil para tareas generales. Llama-3.1-8B es más ligero pero con menos contexto y sin la especialización narrativa.

## Limitaciones y advertencias

- Licencia no especificada: el modelo no indica una licencia clara, lo que impide su uso comercial sin riesgo legal. Aunque el modelo base Mistral Nemo es Apache 2.0, los fine-tunes y las cuantizaciones pueden tener restricciones adicionales no documentadas.
- Contenido explícito y ofensivo: al ser "uncensored" y "abliterated", el modelo puede generar contenido sexual explícito, violencia gráfica, lenguaje soez y material perturbador. No es adecuado para aplicaciones orientadas a menores o entornos profesionales sin moderación.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos, nombres o eventos, especialmente en tareas de razonamiento factual. La ausencia de benchmarks impide conocer su tasa de error.
- Sesgos potenciales: los datasets de entrenamiento (derivados de Claude, Gemini y GPT) pueden arrastrar sesgos culturales o ideológicos, y la abliteración puede eliminar también mecanismos de seguridad útiles.
- Contexto extremo (1M tokens): aunque se menciona soporte hasta 1M de tokens, esto requiere configuraciones de hardware muy específicas y puede degradar la calidad de generación en contextos extremadamente largos.
- Sin soporte de tool calling: no se documenta capacidad para invocar funciones o APIs, lo que limita su uso en pipelines de agentes automatizados.
- Calidad de cuantización: las cuantizaciones más agresivas (Q2_K, Q3_K) pueden degradar notablemente la coherencia y el estilo narrativo, especialmente en tareas de razonamiento complejo.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/fairy322/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC-GGUF
- Modelo base de DavidAU: https://huggingface.co/DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC
- Variante con imatrix (mradermacher): https://huggingface.co/mradermacher/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC-i1-GGUF
- Página de llmrun.dev con especificaciones de hardware: https://llmrun.dev/model/davidau-mistral-nemo-2407-12b-thinking-claude-gemini-gpt5-2-uncensored-heretic
- Página de antbase.ai: https://antbase.ai/models/mistral-nemo-2407-12b-thinking-claude-gemini-gpt5-2-uncensored-heretic
