# mradermacher/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-i1-GGUF

## Resumen

Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) publicada por el usuario mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo cuantizado es un merge de seis modelos basado en la familia Qwen3.5 de 2B parámetros, creado por el usuario xtools-at mediante destilación multi-profesor (multi-distill) sobre datasets de razonamiento, código y conversación, y posteriormente procesado con la técnica "heretic" (abliteración/decensurado) para eliminar los rechazos de seguridad del modelo original.

El modelo base combina capacidades de razonamiento con cadena de pensamiento (chain-of-thought), generación de código, matemáticas y comprensión multimodal de imagen-texto, todo ello en un tamaño muy reducido (1,88 mil millones de parámetros) que lo hace especialmente atractivo para ejecución local en hardware modesto. Su relevancia reside en ofrecer un modelo pequeño, sin filtros de alineación y con capacidades de razonamiento destiladas de modelos mucho mayores, disponible en más de veinte formatos de cuantización que cubren desde 0,8 GB hasta aproximadamente 2 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), pipeline image-text-to-text |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L (y más en el repo completo, hasta Q8_0) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix/i1); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un merge de seis modelos (6xMerge) construido sobre la arquitectura Qwen3.5 de 2B parámetros, un transformer decoder estándar de la familia Qwen de Alibaba. La novedad principal del modelo original no está en la arquitectura sino en el proceso de destilación: se han utilizado múltiples modelos profesores para generar los datasets de entrenamiento, entre ellos salidas destiladas de Kimi K2.5, Claude Opus 4.6 (dataset de razonamiento filtrado), y mezclas establecidas como Tulu 3 SFT de AllenAI. Esto explica las etiquetas de reasoning, chain-of-thought, código y matemáticas.

Tras la destilación y el merge, el modelo pasó por un proceso "heretic", una técnica de abliteración (decensurado) que modifica los pesos para eliminar los comportamientos de rechazo entrenados mediante alineación, sin necesidad de fine-tuning adicional. El resultado es un modelo "uncensored" que responde a prácticamente cualquier petición. No hay información publicada sobre el número de tokens de entrenamiento, la composición exacta del dataset final ni el uso de RLHF/DPO en el modelo base. La versión de mradermacher no altera los pesos: solo aplica cuantización con matriz de importancia (imatrix) calculada sobre el modelo completo.

## Capacidades

- Generación de texto conversacional multi-turno con estilo destilado de modelos profesores grandes
- Razonamiento con cadena de pensamiento (chain-of-thought) explícita, destilada de datasets como Opus-4.6-Reasoning y Qwen3.5-reasoning
- Generación y comprensión de código, con datasets de entrenamiento orientados a programación
- Resolución de problemas matemáticos paso a paso
- Comprensión multimodal imagen-texto (pipeline image-text-to-text); los archivos mmproj para visión están en el repositorio de cuantizaciones estáticas
- Sin filtros de seguridad (uncensored/abliterated): responde sin rechazos de alineación
- Cuantizaciones desde IQ1_S (0,8 GB) hasta formatos de alta fidelidad, aptas para hardware muy variado

## Casos de uso

- Asistente local sin censura para investigación: permite estudiar el comportamiento de modelos sin alineación en entornos controlados, útil para investigadores de seguridad de IA que analizan qué capacidades emergen sin RLHF.
- Razonamiento paso a paso en hardware de gama baja: con cuantizaciones IQ2/IQ3 (0,9-1,2 GB) cabe en portátiles sin GPU dedicada, manteniendo capacidades de chain-of-thought destiladas de modelos mucho mayores.
- Generación de código offline: su entrenamiento con datasets de código y su tamaño reducido lo hacen adecuado para autocompletado y generación de snippets en editores locales tipo Continue o llama-coder.
- Resolución de problemas matemáticos educativos: la destilación de razonamiento permite explicaciones paso a paso de ejercicios de álgebra y cálculo sin conexión a internet.
- Prototipado de agentes ligeros: su tamaño permite ejecutar varios agentes en paralelo en una sola GPU de consumo, útil para experimentos de multi-agente y bucles de razonamiento iterativo.
- Análisis de imágenes local: gracias al pipeline image-text-to-text y los archivos mmproj, se puede usar para describir imágenes y responder preguntas visuales sin enviar datos a la nube, relevante para escenarios con requisitos de privacidad.
- Chatbot embebido en aplicaciones: el formato GGUF es compatible con llama.cpp y Ollama, lo que facilita integrarlo en aplicaciones de escritorio o móviles con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un merge destilado y abliterado, el rendimiento real puede desviarse significativamente del modelo Qwen3.5 base; se recomienda evaluarlo con benchmarks propios antes de uso serio.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,8 GB (IQ1_S) hasta ~1,2 GB (IQ3_M) para las cuantizaciones listadas; las cuantizaciones de mayor fidelidad (Q4-Q8) ocupan entre ~1,2 y ~2 GB. Añadir margen para el KV cache según la longitud de contexto.
- GPU recomendadas: cualquier GPU moderna con 2-4 GB de VRAM es más que suficiente; también funciona por CPU puro dada la cuantización agresiva.
- Consumer GPUs: cabe sobradamente en RTX 3060, RTX 4060, RTX 4090 e incluso GPUs integradas (iGPU) con memoria compartida.
- Despliegue: llama.cpp (recomendado para GGUF con imatrix y soporte mmproj), Ollama, LM Studio, KoboldCpp, text-generation-webui. Para el modelo base en safetensors: vLLM, TGI o transformers.
- Latencia y throughput: no disponibles; por su tamaño (~2B) se espera generación rápida incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Diferenciador |
|---|---|---|---|---|
| Qwen3.5-2B-MultiDistill-Megamix (este) | 1,88 B | GGUF imatrix | Apache 2.0 | Merge destilado multi-profesor, abliterado, multimodal |
| Qwen3.5-2B (base oficial) | ~2 B | safetensors/GGUF | Apache 2.0 | Modelo original con alineación estándar, sin censura eliminada |
| Qwen3-1.7B (oficial) | 1,7 B | safetensors/GGUF | Apache 2.0 | Modelo oficial más pequeño, con modos thinking/no-thinking |

Nota: la comparación con la base oficial y la familia Qwen3 es orientativa; no hay benchmarks publicados que permitan comparar rendimiento cuantitativo.

## Limitaciones y advertencias

- Modelo abliterado (uncensored): carece de salvaguardas de seguridad y puede generar contenido ofensivo, peligroso o ilegal si se le solicita. Su uso conlleva responsabilidad legal y ética total para el operador.
- Al ser un merge de seis modelos con destilación y abliteración, la coherencia a largo plazo y la fiabilidad factual pueden degradarse respecto al modelo base; riesgo de alucinación elevado y no cuantificado.
- Idioma declarado: únicamente inglés; el rendimiento en castellano no está documentado y puede ser inferior al esperable en modelos Qwen oficiales.
- Longitud de contexto no publicada en la model card; verificar la configuración del tokenizador antes de asumir ventanas largas.
- Las cuantizaciones IQ1/IQ2 (0,8-1,0 GB) implican pérdida de calidad sustancial; mradermacher las marca explícitamente como "for the desperate".
- Los archivos mmproj (visión) están en el repositorio de cuantizaciones estáticas, no en este; hay que descargarlos de allí para usar capacidades de imagen.
- Proyecto comunitario sin soporte oficial de Alibaba ni del equipo Qwen; sin garantías de mantenimiento o reproducibilidad a largo plazo.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-i1-GGUF
- Repositorio de cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic
- Página de descargas resumida: https://hf.tst.eu/model#Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-i1-GGUF
- Guía de uso de GGUF referenciada: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
