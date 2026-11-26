# procesaur/Vrabac2

## Resumen

Vrabac2 (presentado en la model card como Orao2) es un modelo de lenguaje de tipo causal, con aproximadamente 853 millones de parámetros, desarrollado por Mihailo Škorić (usuario `procesaur`) en el marco del proyecto TESLA de la Plataforma Nacional de IA de Serbia, con financiación del Fondo para la Ciencia de Serbia. Está especializado en serbio y se presenta como un asistente virtual conversacional capaz de leer, escribir, resumir, analizar texto y responder preguntas en dicha lengua.

El modelo parte de `procesaur/Vrabac2-GPT` y adopta la arquitectura Qwen3.5, ajustándose mediante SFT sobre un conjunto experimental que combina `HuggingFaceH4/ultrachat_200k` y `OpenDataArena/ODA-Mixture-100k`. Su rasgo diferencial es el tokenizador SRNA, que amplía el vocabulario con 50.000 tokens nuevos para el serbio y soporta transliteración automática entre cirílico y latino, de modo que ambas escrituras se procesan en el mismo espacio vectorial. El autor afirma mejoras de hasta un 30 % en velocidad de entrenamiento e inferencia y una mayor calidad en lectura y escritura del serbio frente a Qwen3.5-0.8.

Es relevante por su enfoque en un idioma de recursos limitados y por su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. No obstante, se trata de un modelo experimental de muy pequeño tamaño, con solo 2 descargas y 0 likes en el momento de la consulta, y sin benchmarks publicados, por lo que su adopción en producción debe considerarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal basado en Qwen3.5 (según model card); etiqueta `qwen3_5` en Hugging Face |
| Parametros totales | 852.985.920 (~853 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | Serbio (`sr`), con soporte de cirílico y latino vía tokenizador SRNA |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de ~853 M de parámetros construido sobre la arquitectura Qwen3.5, según indica la model card, y afinado a partir del checkpoint `procesaur/Vrabac2-GPT`. La innovación principal no reside en la arquitectura sino en el tokenizador SRNA, que añade 50.000 tokens al vocabulario para el serbio y soporta transliteración automática, unificando cirílico y latino en un mismo espacio de representación; el autor atribuye a esta ampliación una mejora del 30 % en velocidad de entrenamiento e inferencia y un mejor alineamiento con el idioma.

El ajuste se realizó mediante SFT (supervised fine-tuning) sobre un conjunto experimental que combina `HuggingFaceH4/ultrachat_200k` y `OpenDataArena/ODA-Mixture-100k`. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO. La model card menciona un modo de razonamiento (el parámetro `enable_thinking` en la plantilla de chat), pero no se documenta su implementación ni su entrenamiento específico.

## Capacidades

- Generación de texto conversacional en serbio, con soporte de plantilla de chat (`apply_chat_template`) y roles de sistema y usuario.
- Resumen y análisis de texto, según los tags de la model card (`summarization`).
- Responder preguntas (`qa`) sobre conocimiento general y cultural serbio.
- Traducción y transliteración entre cirílico y latino gracias al tokenizador SRNA.
- Razonamiento básico (`reasoning`), con un modo de pensamiento activable mediante `enable_thinking`.
- Manejo de ambas escrituras del serbio en un mismo espacio vectorial, lo que facilita respuestas coherentes independientemente de la escritura de entrada.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multimodales, pese a la etiqueta `image-text-to-text` presente en los tags de Hugging Face.

## Casos de uso

- Asistencia conversacional en serbio: el modelo puede mantener diálogos multi-turno mediante su plantilla de chat, adecuado para prototipos de atención al cliente o asistentes virtuales en lengua serbia.
- Normalización de texto serbio: uso del tokenizador SRNA para convertir entre cirílico y latino en pipelines de preprocesamiento de corpus, garantizando consistencia en el espacio vectorial.
- Resumen de documentos en serbio: artículos, informes o actas que requieran condensación en la misma lengua, aprovechando la capacidad de `summarization`.
- Respuesta a preguntas sobre cultura y tradiciones serbias: el ejemplo de la model card (fecha de Nikoljdan) ilustra su uso en asistentes educativos o de divulgación cultural.
- Generación de contenido editorial en serbio: borradores de artículos, publicaciones o textos divulgativos con revisión humana posterior.
- Experimentación académica en PLN de bajos recursos: base para investigar tokenizadores específicos de idioma, transliteración y ajuste SFT en serbio, dado su tamaño reducido y licencia permisiva.
- Despliegue en entornos con recursos limitados: sus ~853 M de parámetros permiten ejecución en GPU de consumo, útil para demos locales o prototipos sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente afirma mejoras cualitativas en lectura y escritura del serbio frente a Qwen3.5-0.8, sin cifras ni metodología.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (~853 M de parámetros), en fp16 requeriría aproximadamente 1,7 GB de pesos más overhead de activaciones y KV cache, y en cuantización de 8 bits alrededor de 0,9 GB.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPU de consumo como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en fp16, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: `transformers` con `device_map="auto"` (único método documentado); no se documentan vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Vrabac2 | ~853 M | No disponible | Serbio | Apache 2.0 | Especializado en serbio, tokenizador SRNA, sin benchmarks publicados |
| Qwen3.5-0.8 | ~800 M (referencia citada) | No disponible en la informacion | Multilingue | No disponible en la informacion | Referencia directa del autor; Vrabac2 afirma superarlo en serbio |
| Vrabac2-GPT | No disponible | No disponible | Serbio | No disponible en la informacion | Modelo base del que parte Vrabac2 |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo experimental de muy pequeño tamaño (~853 M), con capacidad de razonamiento y conocimiento factual limitada en comparación con modelos de mayor escala.
- Sin benchmarks publicados: las afirmaciones de mejora frente a Qwen3.5-0.8 no están respaldadas por métricas verificables.
- Riesgo elevado de alucinación en preguntas factuales, especialmente fuera del dominio serbio.
- Cobertura lingüística restringida al serbio; el rendimiento en otros idiomas no está documentado y previsiblemente será pobre.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en tareas de contexto largo.
- Entrenado sobre un conjunto SFT experimental; no se documentan etapas de alineación (RLHF/DPO) ni evaluaciones de seguridad.
- Sesgos desconocidos: no se publica información sobre sesgos culturales, de género o políticos.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental sin garantías, se recomienda validación exhaustiva antes de producción.
- Adopción muy baja (2 descargas, 0 likes en el momento de la consulta), lo que implica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/procesaur/Vrabac2
- Modelo base: https://huggingface.co/procesaur/Vrabac2-GPT
- Tokenizador SRNA: https://huggingface.co/procesaur/Srna_tokenizer
- Perfil del autor: https://huggingface.co/procesaur
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset ODA-Mixture-100k: https://huggingface.co/datasets/OpenDataArena/ODA-Mixture-100k
- Plataforma Nacional de IA de Serbia: https://www.ai.gov.rs/
- Proyecto TESLA (RGF Belgrade): https://tesla.rgf.bg.ac.rs
- Fondo para la Ciencia de Serbia: https://fondzanauku.gov.rs/
