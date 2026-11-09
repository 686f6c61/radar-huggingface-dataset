# DavidAU/MN-GRAND-Gutenberg-Lyra4-Lyra-12B-DARKNESS-GGUF

## Resumen

MN-GRAND-Gutenberg-Lyra4-Lyra-12B-DARKNESS es un modelo de lenguaje de 12.247.782.400 parámetros (~12,25B) desarrollado por DavidAU, especializado en escritura creativa, narrativa de ficción y roleplay. Se trata de un merge construido con mergekit sobre la arquitectura Mistral Nemo, comprimido desde las versiones de 23,45B y 23B del mismo linaje (MN-GRAND-Gutenburg-Lyra4-Lyra) hasta los ~12,15B que declara el autor en la model card. El modelo combina tres variantes "Gutenberg" que, según el autor, obtienen puntuaciones altas en EQBench y UGI-Leaderboard, junto con aportaciones de modelos de TheDrummer y SAO10k.

El modelo resuelve el problema de la generación de prosa larga y coherente con un estilo alejado del típico tono "de IA", orientado a escritores de ficción, generadores de tramas y sub-tramas, y practicantes de roleplay. Soporta un contexto máximo declarado de 128k+ tokens (131.000+), lo que lo habilita para narrativas de formato largo y conversaciones multi-turno extensas. La versión publicada en este repositorio es la cuantizada en GGUF, pensada para ejecución local mediante llama.cpp y derivados.

Es relevante ahora porque ofrece, en un tamaño de 12B manejable en hardware de consumo, capacidades de escritura creativa que el autor sitúa a la altura de merges de 23B, con licencia Apache 2.0 y un rango operativo amplio de temperatura (0,5 a 5) y repetition penalty (1,02 o superior). El modelo está marcado como NSFW y uncensored, con sesgo negativo declarado explícitamente por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Mistral Nemo), modelo de fusión creado con mergekit |
| Parametros totales | 12.247.782.400 (~12,25B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128k+ (131.000+ tokens, según model card) |
| Tipos de cuantizacion | GGUF (varias cuantizaciones; el autor cita ejemplos en Q4KM y Q8); pesos base en bfloat16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); modelo base en safetensors/bfloat16 |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en Mistral Nemo (12B), construido mediante fusión de modelos con mergekit a partir de tres variantes "Gutenberg" del linaje MN-GRAND-Gutenburg-Lyra4-Lyra, complementadas con componentes de modelos de TheDrummer y SAO10k. No se trata de un entrenamiento desde cero ni de un fine-tuning clásico, sino de una compresión/fusión de las versiones de 23,45B (V1) y 23B (V2) del mismo linaje hasta ~12,15B, con el objetivo de retener las características de escritura de los modelos grandes en un tamaño menor.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; estos datos deben considerarse no disponibles. La innovación principal declarada es la propia técnica de compresión vía merge, que según el autor preserva la "unicidad" de los tres Gutenberg y la potencia de los modelos integrados, además de un rango operativo inusualmente amplio de temperatura y repetition penalty para modular el estilo de la prosa.

## Capacidades

- Generación de texto creativo: ficción, narrativa larga, prosa vívida y descripciones detalladas.
- Generación de tramas y sub-tramas, continuación de escenas y storytelling multi-capítulo.
- Roleplay conversacional, con soporte de plantillas ChatML, Mistral Instruct y Alpaca.
- Escritura en múltiples géneros: ciencia ficción, romance, terror, horror y otros.
- Salidas de formato largo: el modelo tiende a producir 2k, 3k o más tokens por prompt, con preferencia por sobrescribir antes que quedarse corto.
- Modulación de estilo mediante instrucciones en el prompt (por ejemplo, indicar "vivid horror" para orientar el registro).
- Capacidad multilingüe: limitada al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Escritura de ficción de formato largo: el modelo puede generar capítulos completos y mantener coherencia narrativa gracias a su ventana de 128k+ tokens, adecuada para novelas por entregas y sagas.
- Generación de tramas y sub-tramas: útil en fases de preproducción creativa para explorar arcos argumentales alternativos a partir de una premisa y un elenco de personajes.
- Roleplay narrativo: con plantilla ChatML y repetition penalty de 1,06 a 1,1, el modelo sostiene interacciones multi-turno con narración y diálogo consistentes.
- Continuación de escenas: escritores que necesitan extender un borrador pueden aportar contexto extenso y pedir continuaciones con un registro concreto (terror, romance, ciencia ficción).
- Generación de contenido de terror y horror visceral: el sesgo negativo declarado y la capacidad de prosa gráfica lo hacen adecuado para este género específico, indicando el tono en el prompt.
- Prototipado de guiones y diálogos: para guionistas que necesitan borradores rápidos de escenas con diálogo denso, con la ventaja de que el modelo produce outputs largos sin necesidad de encadenar prompts.
- Ejecución local en estaciones de trabajo: al distribuirse en GGUF, puede desplegarse con llama.cpp u Ollama en equipos con GPU de consumo para flujos de escritura asistida sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los modelos "Gutenberg" que componen la fusión obtienen puntuaciones altas en EQBench y UGI-Leaderboard, pero no se aportan cifras concretas, por lo que no se presentan números.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4KM, aproximadamente 7-8 GB; en Q8, en torno a 13-14 GB; en bfloat16 completo, ~24-25 GB. Estas cifras son estimaciones basadas en el tamaño de 12,25B parámetros y no proceden de mediciones publicadas por el autor.
- GPU recomendadas: para cuantizaciones altas (Q8 o bf16), A100, H100 o RTX 4090; para Q4KM, GPU de consumo con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante).
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 y Q5 en tarjetas de 8-12 GB; en Q8 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; el repositorio está marcado como compatible con endpoints.
- Latencia y throughput: no disponibles; dependen de la cuantización, el hardware y la longitud de salida, que en este modelo tiende a ser elevada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| MN-GRAND-Gutenberg-Lyra4-Lyra-12B-DARKNESS | ~12,25B | 128k+ | Apache 2.0 | Escritura creativa y roleplay | GGUF en Hugging Face |
| MN-GRAND-Gutenburg-Lyra4-Lyra-23B-V2 | ~23B | 128k+ (según linaje) | Apache 2.0 | Escritura creativa y roleplay | GGUF en Hugging Face |
| MN-GRAND-Gutenberg-Lyra4-Lyra-12B-MADNESS | ~12B | 128k+ (según linaje) | Apache 2.0 | Escritura creativa y roleplay | GGUF en Hugging Face |
| Mistral Nemo base | 12B | 128k | Apache 2.0 | Propósito general | Safetensors y GGUF |

Las versiones de 23B del mismo linaje ofrecen, según el autor, mayor detalle, profundidad de prosa e instrucción, a costa de un mayor requisito de hardware. La variante MADNESS de 12B es una alternativa del mismo autor con un carácter distinto. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Contenido NSFW y uncensored: el modelo está marcado como not-for-all-audiences e incluye violencia, terror, lenguaje soez y detalles viscerales; no es apto para entornos sin moderación.
- Sesgo negativo declarado por el autor: no es un modelo de "final feliz"; puede producir narrativas pesimistas o sombrías por defecto.
- Riesgo de alucinación: al ser un modelo orientado a ficción y sin datos de benchmarks de fiabilidad factual, no es adecuado para tareas que exijan precisión factual.
- Idioma: solo inglés según la model card; el rendimiento en castellano no está documentado.
- Tendencia a sobrescribir: produce salidas muy largas salvo que se impongan límites explícitos de longitud, lo que puede encarecer la inferencia y requerir control de max_tokens.
- Sensibilidad a la plantilla: el formato de prompt (Alpaca, Mistral Instruct, ChatML) altera de forma notable la salida y el seguimiento de instrucciones; en roleplay con ChatML deben activarse el colapso de saltos de línea y el recorte de espacios.
- Las distintas cuantizaciones producen salidas ligeramente diferentes, lo que complica la reproducibilidad exacta.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado y su idoneidad para el producto final son responsabilidad del integrador, especialmente por el carácter NSFW del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/MN-GRAND-Gutenberg-Lyra4-Lyra-12B-DARKNESS-GGUF
- Modelo base: https://huggingface.co/DavidAU/MN-GRAND-Gutenberg-Lyra4-Lyra-12B-DARKNESS
- Versión V1 (23,45B): https://huggingface.co/DavidAU/MN-GRAND-Gutenburg-Lyra4-Lyra-23.5B-GGUF
- Versión V2 (23B): https://huggingface.co/DavidAU/MN-GRAND-Gutenburg-Lyra4-Lyra-23B-V2-GGUF
- Variante MADNESS 12B: https://huggingface.co/DavidAU/MN-GRAND-Gutenberg-Lyra4-Lyra-12B-MADNESS-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQ del autor: https://huggingface.co/DavidAU/support
