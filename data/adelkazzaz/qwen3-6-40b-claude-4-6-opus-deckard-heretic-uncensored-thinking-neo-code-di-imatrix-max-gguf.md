# AdelKazzaz/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF

## Resumen

Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF es una cuantización GGUF de un modelo de lenguaje denso de aproximadamente 39.000 millones de parámetros, derivado de la familia Qwen 3.6 y publicado por el usuario AdelKazzaz a partir del modelo base de DavidAU. El modelo original parte de un Qwen 3.6 de 27B que fue expandido a 40B (96 capas, 1275 tensores, un 50% más que el base), entrenado primero con técnicas de "abliteration" (Heretic) para eliminar el alineamiento de seguridad, y posteriormente ajustado con datasets internos "Deckard/PDK" y con un dataset de destilación de razonamiento de Claude 4.6 Opus.

El propósito declarado es doble: por un lado, ofrecer un modelo "sin censura" orientado a escritura creativa, ficción, roleplaying y generación de tramas; por otro lado, mantener capacidades de razonamiento y código mediante un modo de pensamiento de longitud variable (razonamiento más corto para problemas simples y más largo para los complejos). El contexto declarado es de 256K tokens, y el pipeline registrado es image-text-to-text, aunque la información disponible no detalla la arquitectura de visión.

Esta ficha describe específicamente la variante GGUF cuantizada con la técnica propietaria "NEO-CODE-Di-IMatrix-MAX", que según el autor emplea dos datasets de imatrix fusionados y ajustes de tensores medidos con benchmarks para preservar la precisión del modelo en BF16. El autor afirma que IQ4_XS alcanza el 94% de la precisión de BF16, IQ2_M el 83-84% y Q8_0 HIGH el 98,4%, si bien estas cifras proceden de la model card y no han sido verificadas de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE), 96 capas, 1275 tensores |
| Parámetros totales | 39.072.596.736 (~39B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (según model card) |
| Tipos de cuantización | GGUF con variantes IQ2_M, IQ4_XS, Q6, Q8_0 HIGH (entre otras de la familia NEO-CODE-Di-IMatrix-MAX) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 259,9 GB con múltiples cuantizaciones); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 39B parámetros, no una arquitectura MoE. Según la model card, se construyó expandiendo un Qwen 3.6 de 27B hasta 40B parámetros mediante aumento de capas (de las ~64 típicas de un 27B a 96 capas), lo que explica el incremento del 50% en número de tensores respecto al base. El proceso de entrenamiento descrito tiene varias fases: primero un proceso "Heretic" de abliteration para eliminar el comportamiento de rechazo y censura; después un ajuste fino (vía Unsloth) sobre cinco datasets internos "Deckard/PDK" orientados a carácter, inteligencia, profundidad y punto de vista narrativo; a continuación la expansión a 40B; y finalmente un ajuste con el dataset de destilación `TeichAI/claude-4.5-opus-high-reasoning-250x` para acortar y estabilizar el razonamiento.

La innovación técnica más destacable es el modo de razonamiento de longitud variable, que adapta la extensión de la cadena de pensamiento a la complejidad del problema. La variante GGUF añade la técnica "NEO-CODE-Di-IMatrix-MAX": el autor indica que fusionó dos datasets de imatrix (uno orientado a código y otro general) tras medir estadísticas de ambos, y aplicó ajustes adicionales de tensores validados con benchmarks para preservar el rendimiento en contexto largo, conversaciones multi-turno, código y matemáticas. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO más allá del ajuste supervisado descrito.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento de longitud variable (thinking mode).
- Generación de código y resolución de problemas matemáticos, reforzados en la variante NEO-CODE.
- Escritura creativa: ficción, narrativa, generación de tramas y subtramas, continuación de escenas, poesía vívida y todos los géneros (ciencia ficción, romance, etc.).
- Roleplaying y conversación multi-turno con mantenimiento de personaje.
- Capacidad multimodal image-text-to-text según el pipeline declarado, aunque no se detalla el codificador visual ni el alcance real.
- Soporte multilingüe limitado a inglés y chino.
- Comportamiento sin censura ("uncensored", "abliterated"): no aplica rechazos de seguridad en contenido NSFW o controvertido.
- No se confirma en la información disponible soporte explícito de tool calling, function calling ni uso como agente multi-step.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo puede generar y continuar escenas, mantener coherencia de personajes y desarrollar tramas y subtramas a lo largo de decenas de miles de tokens gracias a su ventana de 256K, lo que lo hace adecuado para novelas por entregas o borradores extensos.
- Roleplaying y juegos de rol de texto: su entrenamiento en datasets de carácter y su ausencia de filtros de contenido permiten interpretar personajes con personalidad consistente en conversaciones multi-turno sin interrupciones por rechazo.
- Asistencia a guionistas y autores: generación de alternativas de trama, diálogos y descripciones vívidas ("vivid prosing") para desbloquear bloqueos creativos, con razonamiento variable que profundiza más en pasajes complejos.
- Generación de código en entornos sin restricciones de contenido: la variante NEO-CODE está calibrada para preservar precisión en código y matemáticas, por lo que puede usarse en tareas de autocompletado, refactorización y explicación de código en local.
- Investigación sobre alineamiento y seguridad: al ser un modelo explícitamente abliterated, sirve como caso de estudio para medir cómo la eliminación de rechazos afecta a la utilidad, la estabilidad y los sesgos, comparándolo con su base alineado.
- Despliegue local en hardware de consumo o estaciones de trabajo: al distribuirse en GGUF con cuantizaciones desde IQ2_M hasta Q8_0, puede ejecutarse con llama.cpp u Ollama en equipos con VRAM limitada, preservando según el autor entre el 83% y el 98% de la precisión BF16.
- Creación de contenido editorial para adultos: la ausencia de filtros permite generar material NSFW o de temática sensible bajo responsabilidad del operador, algo inviable con modelos alineados convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma que el modelo supera al base en 6 de 7 benchmarks y cita cifras de retención de precisión de las cuantizaciones (IQ2_M: 83-84% de BF16; IQ4_XS: 94%; Q8_0 HIGH: 98,4%), pero no se incluyen tablas con valores de MMLU, HumanEval, GSM8K u otros, ni verificaciones independientes en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con IQ2_M, en torno a 14-16 GB; con IQ4_XS, aproximadamente 22-24 GB; con Q6, unos 32-34 GB; con Q8_0, en torno a 42-45 GB. Son estimaciones basadas en el tamaño de parámetros y la sobrecarga de contexto, no cifras publicadas.
- GPU recomendadas: para Q8_0, una A100 80GB o H100; para Q6, una A100 40GB o RTX 6000 Ada; para IQ4_XS, una RTX 4090 (24 GB) al límite o una RTX 3090; para IQ2_M, una RTX 4080/4090 o incluso GPUs de 16 GB con offloading parcial.
- Cabe en GPU de consumo: sí, en cuantizaciones IQ2_M e IQ4_XS con GPUs de 16-24 GB, aceptando posibles offloading a RAM para contextos largos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo TGI o vLLM para variantes no GGUF, aunque no se detalla.
- Latencia y throughput: no disponible. Con 39B parámetros densos y contexto de 256K, el throughput será bajo en GPUs de consumo y requerirá técnicas de atención eficiente para aprovechar la ventana completa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic (este, GGUF) | 39B denso | 256K | Apache 2.0 | Hugging Face (GGUF) | Sin censura, thinking variable, orientado a ficción y código |
| Qwen 3.6 27B (base original) | 27B denso | No disponible en la información | Apache 2.0 (presumible) | Hugging Face | Modelo alineado del que deriva; menor tamaño y presumiblemente más filtrado |
| Qwen3.6-27B-Fable-Fusion-711 (DavidAU) | 27B denso | No disponible | Apache 2.0 | Hugging Face (GGUF) | Variante hermana del mismo autor, citada en la model card con más de 3 millones de descargas |
| Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor (DavidAU) | 40B denso | No disponible | Apache 2.0 | Hugging Face (GGUF) | Versión "expandida y de mayor IQ" del mismo linaje según el autor |

No se dispone de datos de rendimiento comparativo verificable entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo explícitamente sin censura y abliterated: no aplica rechazos ante contenido NSFW, violento o controvertido, lo que traslada toda la responsabilidad de moderación al operador y puede incumplir políticas de plataformas o legislación según jurisdicción.
- Riesgo elevado de alucinación y de afirmaciones confiadas sin base factual, agravado por el estilo "brutalmente honesto" que el autor promociona.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- La ventana de 256K es una afirmación de la model card no verificada de forma independiente; el rendimiento real en contextos muy largos puede degradarse, especialmente en cuantizaciones bajas.
- Las cifras de retención de precisión de las cuantizaciones (83-98% de BF16) proceden del autor y no de evaluaciones independientes.
- El proceso de expansión de 27B a 40B y el ajuste con destilación de Claude 4.6 Opus pueden introducir inestabilidades, sesgos heredados del dataset de destilación y problemas de licencia derivados del uso de salidas de un modelo propietario.
- Aunque la licencia declarada es Apache 2.0, el uso comercial de un modelo derivado de destilación de Claude plantea dudas legales que conviene revisar con asesoría jurídica.
- El repo ocupa 259,9 GB, lo que exige almacenamiento considerable si se descargan varias cuantizaciones.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia comunitaria de calidad ni de estabilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdelKazzaz/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking
- Perfil del autor del modelo base: https://huggingface.co/DavidAU
- Colecciones de DavidAU: https://huggingface.co/DavidAU/collections
- Variante Fable-Fusion-711 27B: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Variante Fable-Fusion-6-Core 40B: https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset de destilación: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset Deckard/PDK: https://huggingface.co/datasets/DavidAU/PkDick-Deckard-5-Datasets
