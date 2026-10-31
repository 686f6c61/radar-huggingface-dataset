# Jaedwards1986/L3.1-MOE-6X8B-Dark-Reasoning-Dantes-Peak-HORROR-R1-Uncensored-36B-GGUF

## Resumen

L3.1-MOE-6X8B-Dark-Reasoning-Dantes-Peak-HORROR-R1-Uncensored-36B-GGUF es una cuantización GGUF (con imatrix) publicada por Jaedwards1986 a partir del modelo base DavidAU/L3.1-MOE-6X8B-Dark-Reasoning-Dantes-Peak-Hermes-R1-Uncensored-36B. Se trata de un modelo de escritura creativa sin censura, especializado en ficción de terror (horror), construido sobre una configuración Mixture of Experts (MoE) de seis modelos de 8B basados en Llama 3.1, fusionados con mergekit. El modelo incorpora razonamiento estilo "DeepHermes" de NousResearch, activable y desactivable mediante system prompts, y un dataset de imatrix propio ("Horror Imatrix") que añade un "tinte" de terror a las salidas, especialmente en cuantizaciones medias y bajas.

El problema que resuelve es doble: por un lado, ofrece un modelo de rol y narrativa de terror sin filtros para usos creativos (SillyTavern, roleplay, generación de tramas y subtramas); por otro, conserva capacidades de razonamiento tipo R1 (thinking mode) para acertijos y problemas lógicos. Es relevante para la comunidad de modelos locales porque combina MoE, razonamiento controlable y contexto de 128k en un formato GGUF ejecutable en hardware de consumo.

Según la model card, el modelo tiene 48B de parámetros en origen (6x8B) que resultan en un modelo de "36B de pesos"; el dato real de safetensors indica 36.216.770.624 parámetros. El repositorio pesa 245,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basado en Llama 3.1, fusion de 6 modelos 8B con mergekit |
| Parametros totales | 36.216.770.624 (safetensors); la model card lo describe como 6x8B = 48B de parametros en origen, resultando en un modelo de 36B de "peso" |
| Parametros activos | No disponible (la model card indica que los seis expertos estan activados, pero no especifica el numero exacto de parametros activos por token) |
| Longitud de contexto | 128k (se recomienda un minimo de 4k, mejor 8k, por los bloques de razonamiento) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, Q2_K_S, IQ2_S, Q2_K, IQ2_M, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 (con imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta en bfloat16/safetensors) |

## Arquitectura y entrenamiento

El modelo es un merge MoE creado con mergekit a partir de seis modelos de 8B basados en Llama 3.1, todos convertidos previamente al estilo de razonamiento DeepHermes de NousResearch (DeepHermes-3-Llama-3-8B-Preview). La model card indica que los seis expertos estan activados en cada pasada, y que el modelo conserva las funciones del DeepHermes original "al 50%-67% de su capacidad de razonamiento original". El razonamiento ("thinking") es controlable: se activa, desactiva o ajusta mediante system prompts especificos que el autor proporciona en su documentacion, e incluso puede darse "personalidad" al razonamiento (versiones "Evil" que razonan como el Joker).

Sobre el entrenamiento fino de los modelos fuente no se ofrecen detalles (tokens, datasets, RLHF/DPO), mas alla de que la variante "Dantes Peak HORROR" aplica un dataset de imatrix construido internamente por David_AU usando Grand Horror 16B, que mejora la calidad de las cuantizaciones bajas y anade el tinte tematico de terror. No se ha publicado informacion sobre el proceso de entrenamiento ni datos de post-entrenamiento (RLHF, DPO) en la documentacion disponible.

## Capacidades

- Generacion de prosa creativa extensa y detallada ("deep prose"), con especializacion en terror grafico y contenido NSFW sin censura.
- Generacion de tramas, subtramas, escenas y continuacion de escenas ("scene continue") para ficcion de todos los generos (ciencia ficcion, romance, terror, etc.).
- Roleplay y uso en frontends como SillyTavern y Backyard.
- Razonamiento estilo DeepHermes/R1 activable mediante system prompts (thinking mode on/off/variable), util para acertijos, puzzles y problemas logicos.
- Ventana de contexto de 128k para prompts largos y conversaciones extensas.
- Rendimiento robusto a temperaturas altas (1.2+, 2.2+), donde el autor indica que produce "pensamientos" mas profundos e interesantes.
- Modelo instruct: responde mejor a prompts de longitud media o larga con direccion e instrucciones.
- No hay informacion sobre soporte de tool calling, function calling, vision ni audio en la documentacion disponible.

## Casos de uso

- Escritura de ficcion de terror: el modelo genera prosa grafica y atmosferica sin filtros, con el "tinte" de horror del imatrix reforzado en cuantizaciones IQ4/Q4 y superiores.
- Roleplay en SillyTavern o Backyard: al ser un modelo instruct conversacional sin censura, soporta personajes y escenarios maduros con contexto largo (128k) para sesiones extensas.
- Generacion de tramas y subtramas: puede desarrollar arcos narrativos completos y continuar escenas existentes, util como asistente de guion o novela.
- Razonamiento sobre acertijos y puzzles logicos: el thinking mode de DeepHermes permite resolver problemas de logica "normalmente fuera de las capacidades" de modelos comparables, segun el autor.
- Exploracion creativa con temperaturas altas: a temps de 1.2-2.2+ produce ideas y "pensamientos" inusuales, util para brainstorming narrativo.
- Prototipado de agentes narrativos con razonamiento controlable: los system prompts permiten alternar entre modo razonador y modo prosa segun la fase del pipeline.
- Uso general (no creativo) con cuantizaciones altas: el autor recomienda Q5/Q6/Q8 para tareas generales fuera del horror.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia cuantitativa de la model card es que el modelo retiene las funciones del DeepHermes original "al 50%-67% de su capacidad de razonamiento original", dato cualitativo del autor sin metodologia publicada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, un GGUF de 36B en Q4 ocupa aproximadamente 20-24 GB; el tamano del repo completo (245,8 GB) corresponde al conjunto de todas las cuantizaciones, no a un archivo individual.
- GPUs recomendadas: no disponibles explicitamente. Para cuantizaciones Q4, una RTX 3090/4090 de 24 GB seria adecuada; para Q8/F16 se requeririan multiples GPUs o descarga parcial en CPU/RAM.
- Consumer GPU: en cuantizaciones IQ3/IQ4 el modelo deberia caber en una GPU de 24 GB; en cuantizaciones Q2 puede entrar en GPUs de 12-16 GB con degradacion de calidad aceptable segun el autor ("IQ2s performance is acceptable").
- Despliegue: cualquier runtime compatible con GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp; el autor lo orienta a frontends como SillyTavern y Backyard. Requiere la plantilla Llama 3 Instruct.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| L3.1-MOE-6X8B-Dark-Reasoning-Dantes-Peak-HORROR-R1-Uncensored-36B | 36,2B (6x8B MoE) | MoE Llama 3.1 + DeepHermes reasoning | 128k | Apache 2.0 | Escritura creativa horror, uncensored |
| NousResearch DeepHermes-3-Llama-3-8B-Preview | 8B | Transformer denso (Llama 3.1) | 128k | Apache 2.0 | Razonamiento general activable |
| DavidAU/L3.1-MOE-6X8B-Dark-Reasoning-Dantes-Peak-Hermes-R1-Uncensored-36B | 36,2B (6x8B MoE) | MoE Llama 3.1 + DeepHermes reasoning | 128k | Apache 2.0 | Modelo base, sin tinte horror en imatrix |

La variante HORROR se diferencia de su modelo base unicamente por el dataset de imatrix con "tinte" de terror; frente al DeepHermes original de 8B, ofrece mas capacidad creativa y de razonamiento a cambio de requisitos de hardware muy superiores y una perdida estimada del 33%-50% en potencia de razonamiento.

## Limitaciones y advertencias

- Contenido NSFW explicito: la model card advierte de terror grafico, lenguaje soez y contenido clasificable R/X-rated; esta etiquetado "not-for-all-audiences".
- Sin filtros de seguridad: al ser un modelo uncensored, puede generar contenido ofensivo o perjudicial; su uso requiere responsabilidad del operador.
- Fiabilidad del razonamiento variable: puede ser necesario regenerar para activar el bloque de thinking; a veces el bloque termina sin generar la respuesta y hay que pedir la salida manualmente.
- Salidas excesivamente largas: el modelo tiende a generar texto muy extenso y puede no querer cerrar la respuesta.
- Inconsistencia entre generaciones: el autor sugiere un minimo de 5 regeneraciones para usos creativos especificos, ya que la 2a o 3a generacion suele ser la mejor.
- Razonamiento degradado: conserva solo el 50%-67% de la capacidad de razonamiento del DeepHermes original.
- Idioma: documentado y etiquetado solo para ingles; no hay informacion de rendimiento en castellano.
- Requiere system prompts especificos para activar el razonamiento; sin ellos no se aprovecha el thinking mode.
- Contexto practico: se recomienda un minimo de 4k-8k de contexto; usar 128k completo puede degradar el rendimiento en hardware modesto.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado (NSFW, horror grafico) puede estar sujeto a restricciones de las plataformas de distribucion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jaedwards1986/L3.1-MOE-6X8B-Dark-Reasoning-Dantes-Peak-HORROR-R1-Uncensored-36B-GGUF
- Modelo base: https://huggingface.co/DavidAU/L3.1-MOE-6X8B-Dark-Reasoning-Dantes-Peak-Hermes-R1-Uncensored-36B
- Modelo de razonamiento original (DeepHermes): https://huggingface.co/NousResearch/DeepHermes-3-Llama-3-8B-Preview
