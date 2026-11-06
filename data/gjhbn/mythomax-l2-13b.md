# Gjhbn/MythoMax-L2-13b

## Resumen

MythoMax-L2-13b es un modelo de lenguaje de 13.000 millones de parámetros obtenido mediante una fusión (merge) de pesos de dos modelos derivados de LLaMA 2: MythoLogic-L2-13b (desarrollado por Gryphe) y Huginn-13b-FP16. La versión alojada en el repositorio `Gjhbn/MythoMax-L2-13b` es una redistribución de ese merge, originalmente publicado por Gryphe, y no introduce modificaciones propias respecto al modelo original. El objetivo del merge es combinar la capacidad de comprensión de MythoLogic-L2 con la capacidad de escritura extensa de Huginn en un único modelo.

La innovación técnica reside en el método de fusión: en lugar de aplicar un ratio uniforme entre los dos modelos, se aplicó un ratio único a cada uno de los 363 tensores del modelo, calculado además con gradientes para refinar el comportamiento resultante. Según el autor, esto produce mayor coherencia estructural que su merge anterior, MythoMix. El modelo está orientado explícitamente a roleplay y escritura creativa, no a tareas de razonamiento, código o uso como asistente general.

Es relevante ahora como referencia histórica del ecosistema de merges comunitarios sobre LLaMA 2, una práctica muy extendida en 2023 que precedió a la consolidación de los modelos ajustados de forma nativa. El autor del modelo original indica que, con la llegada de Llama 3, MythoMax queda en fase de retirada. El repositorio tiene un tamaño de 26 GB, lo que corresponde a pesos en precisión fp16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de LLaMA 2) |
| Parámetros totales | 13.000 millones (13B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (los modelos LLaMA 2 base soportan 4096 tokens, pero el repositorio no lo declara) |
| Tipos de cuantización | El repositorio aloja pesos sin cuantizar; existen versiones GGUF, GPTQ y AWQ publicadas por TheBloke |
| Idiomas soportados | Inglés (declarado en la model card y en los tags) |
| Licencia | other (licencia personalizada, no especificada en detalle; hereda restricciones de LLaMA 2) |
| Formato de pesos | PyTorch (safetensors/bin según el repo; no confirmado en la información disponible) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 13.000 millones de parámetros con la arquitectura de LLaMA 2, sin modificaciones estructurales. No se ha entrenado desde cero: es el resultado de una fusión de pesos (weight merge) entre MythoLogic-L2-13b y Huginn-13b-FP16. La técnica empleada, descrita por el autor como "highly experimental tensor type merge", asigna un ratio distinto a cada uno de los 363 tensores del modelo, con ratios derivados parcialmente de gradientes. El script y las plantillas YAML usados para generar el merge están publicados en el repositorio BlockMerge_Gradient de Gryphe.

No hay información disponible sobre el número de tokens de entrenamiento de los modelos base, la composición de sus datasets ni si se aplicaron fases de RLHF o DPO. MythoLogic-L2 y Huginn son a su vez ajustes y merges comunitarios sobre LLaMA 2, por lo que heredan el corpus de preentrenamiento de LLaMA 2 (2 billones de tokens según Meta, dato no incluido en la información proporcionada) más los datos de sus respectivos ajustes. No se documentan innovaciones como decodificación especulativa o atención lineal; la única innovación destacable es el propio método de fusión por tensor.

## Capacidades

- Generación de texto narrativo y creativo en inglés, con énfasis en escritura extensa y coherente.
- Roleplay multi-turno siguiendo el formato Alpaca con tarjeta de personaje en el system prompt.
- Escritura de ficción y storywriting, capacidad que el autor atribuye a la contribución de Huginn.
- Comprensión de instrucciones y contexto, atribuida a la contribución de MythoLogic-L2.
- Formato de prompt: Alpaca (`### Instruction:` / `### Response:`), con soporte de system prompt o character card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe no declarada: solo inglés.

## Casos de uso

- Roleplay conversacional: el modelo está diseñado para mantener personajes con una tarjeta de personaje en el system prompt y responder en formato Alpaca; su fusión busca coherencia sostenida en diálogos largos, lo que lo hace adecuado para chatbots de personajes.
- Escritura de ficción asistida: generación de escenas, diálogos y continuaciones narrativas, aprovechando la capacidad de escritura heredada de Huginn.
- Generación de contenido narrativo para juegos de rol de mesa: el modelo puede interpretar PNJ y generar respuestas de personaje a partir de una ficha, con un formato de prompt sencillo de integrar en herramientas de mesa.
- Prototipado de narrativa interactiva: integración en motores de ficción interactiva donde se necesita texto coherente por turnos y el coste de inferencia de un 13B cuantizado es asumible en local.
- Experimentación académica con merges de pesos: el modelo sirve como caso de estudio reproducible del método BlockMerge_Gradient, con scripts públicos, para investigar el efecto de fusiones por tensor en la coherencia del texto generado.
- Fine-tuning comunitario sobre LLaMA 2: al ser un derivado de LLaMA 2 con pesos abiertos en fp16, puede servir de base para ajustes adicionales en tareas creativas, siempre que se respete la licencia heredada.
- Evaluación comparativa de calidad narrativa: uso como línea base en estudios que comparen merges comunitarios frente a modelos ajustados de forma nativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 26 GB en fp16 para los pesos completos, más overhead de activaciones y KV cache; en torno a 8-10 GB con cuantización de 4 bits (Q4_K_M o GPTQ/AWQ de 4 bits).
- GPU recomendadas para fp16: A100 40 GB, H100, o dos GPU de 24 GB en paralelo; una RTX 3090/4090 de 24 GB no basta para fp16 completo.
- GPU consumer: cabe en RTX 3090, RTX 4090, RTX 4080 y GPUs con 12-16 GB usando cuantización de 4 bits; en 8 GB solo con cuantizaciones agresivas (Q3/Q4 con contexto reducido).
- Opciones de despliegue: llama.cpp y Ollama para GGUF, vLLM y TGI para fp16/AWQ, AutoGPTQ para GPTQ, y transformers con PyTorch para uso directo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MythoMax-L2-13b (este repo) | 13B | No disponible | Roleplay y narrativa (merge) | other (LLaMA 2) | Hugging Face, cuantizaciones de TheBloke |
| MythoLogic-L2-13b | 13B | No disponible | Roleplay y razonamiento (base del merge) | other (LLaMA 2) | Hugging Face (Gryphe) |
| Huginn-13b-FP16 | 13B | No disponible | Escritura y narrativa (base del merge) | other (LLaMA 2) | Hugging Face (The-Face-Of-Goonery) |
| MythoMix | 13B | No disponible | Merge previo del mismo autor | other (LLaMA 2) | Hugging Face (Gryphe) |

Los datos de contexto y benchmarks de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y declarado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Al ser un merge orientado a roleplay y ficción, no es fiable para tareas de razonamiento lógico, matemáticas, código o extracción de datos estructurados.
- Riesgo elevado de alucinación en contextos factuales: no se documenta ningún ajuste de alineación o verificación de hechos más allá de los modelos base.
- Puede reproducir sesgos presentes en LLaMA 2 y en los datasets de los merges comunitarios; no se documentan evaluaciones de sesgo.
- La licencia es "other" y hereda las restricciones de la licencia comunitaria de LLaMA 2, que limita el uso comercial a organizaciones por debajo de un umbral de usuarios activos mensuales y exige cumplir la política de uso aceptable de Meta; conviene revisar los términos antes de cualquier despliegue en producción.
- El autor original declara el modelo en fase de retirada tras la aparición de Llama 3, por lo que no cabe esperar mantenimiento ni actualizaciones.
- La longitud de contexto no está declarada en el repositorio; asumir 4096 tokens sin verificación previa puede provocar degradación silenciosa en prompts largos.
- El repositorio tiene solo 26 descargas y 0 likes, y es una redistribución de un modelo de terceros; no hay garantía de que los pesos coincidan bit a bit con el original de Gryphe.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Gjhbn/MythoMax-L2-13b
- Modelo original de Gryphe (referenciado en la model card, no verificado en la búsqueda): https://huggingface.co/Gryphe/MythoMax-L2-13b
- MythoLogic-L2-13b: https://huggingface.co/Gryphe/MythoLogic-L2-13b
- Huginn-13b-FP16: https://huggingface.co/The-Face-Of-Goonery/Huginn-13b-FP16
- Script de merge BlockMerge_Gradient: https://github.com/Gryphe/BlockMerge_Gradient/tree/main/YAML
- Cuantización GGUF de TheBloke: https://huggingface.co/TheBloke/MythoMax-L2-13B-GGUF
- Cuantización GPTQ de TheBloke: https://huggingface.co/TheBloke/MythoMax-L2-13B-GPTQ
- Cuantización AWQ de TheBloke: https://huggingface.co/TheBloke/MythoMax-L2-13B-AWQ
- Canción de despedida enlazada en la model card: https://suno.com/song/3d69cd72-e893-4193-866f-385f47778ce0
