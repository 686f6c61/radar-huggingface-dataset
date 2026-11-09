# DavidAU/Mistral-MOE-4X7B-Dark-MultiVerse-24B-GGUF

## Resumen

Mistral-MOE-4X7B-Dark-MultiVerse-24B es un modelo de lenguaje de tipo *mixture of experts* (MoE) creado por DavidAU mediante la fusión de cuatro modelos Mistral 7B de la familia DarkSapling y Multi-Verse, todos ellos descensurados y orientados a escritura creativa. El resultado es un modelo de 24.153.690.112 parámetros (equivalente a 4×7B) que activa dos expertos por defecto en cada paso de generación, lo que reduce el coste computacional efectivo frente a un modelo denso del mismo tamaño. Está publicado en formato GGUF y licencia Apache 2.0, con soporte de contexto de hasta 32.768 tokens.

El modelo está diseñado específicamente para prosa vívida, ficción, generación de tramas y *roleplay*, con un sesgo deliberadamente descensurado y un tono ligeramente negativo. No es un modelo de propósito general: su carta de presentación es la calidad de escritura creativa por encima de la media de los Mistral 7B, con una perplejidad declarada inferior a la de Meta Llama 3 Instruct. Es relevante ahora porque demuestra cómo las técnicas de *merge* y MoE permiten combinar especialistas pequeños en un modelo de 24B con requisitos de hardware moderados (funciona a 30+ t/s en una GPU de 16 GB con cuantización IQ4_XS).

La ficha se basa en la model card del autor y en los metadatos de Hugging Face; no se han publicado resultados de benchmarks estándar en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo *mixture of experts* (MoE), basada en Mistral 7B; fusión con mergekit |
| Parámetros totales | 24.153.690.112 (24B) |
| Parámetros activos | 2 expertos por defecto (configurable a 1, 3 o 4); parámetros activos exactos no disponibles |
| Longitud de contexto | 32.768 tokens (32k) |
| Tipos de cuantización | GGUF en varias cuantizaciones (IQ4_XS mencionada explícitamente; el resto no disponible) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 204,9 GB); pesos en bfloat16 en el modelo base según tags |
| Plantilla de prompt | Llama 3, Mistral, Alpaca y/o Command-R |

## Arquitectura y entrenamiento

El modelo es una fusión MoE de cuatro expertos Mistral 7B: `MTSAIR/multi_verse_model`, `TeeZee/DarkSapling-7B-v1.0`, `TeeZee/DarkSapling-7B-v1.1` y `TeeZee/DarkSapling-7B-v2.0`. El primer modelo listado actúa como "capitán" y el resto contribuye a la selección de tokens; la combinación se realizó con mergekit. La arquitectura subyacente es un transformer decoder-only de Mistral con atención de ventana deslizante, pero la model card no detalla la composición exacta del dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

El autor indica que el MoE está configurado por defecto con 2 expertos, aunque el número puede ajustarse en tiempo de carga en LM Studio, text-generation-webui, KoboldCpp (1.8+) o llama.cpp mediante `--override-kv llama.expert_used_count=int:N`. Con un solo experto, el modelo selecciona uno al azar en cada generación, lo que produce salidas muy distintas entre ejecuciones. El modelo está pensado para operar con temperaturas de 0 a 5 y con *repetition penalty* de 1,02 o superior.

## Capacidades

- Generación de texto creativo: prosa vívida, ficción, terror, romance, ciencia ficción y todos los géneros.
- Generación de tramas y subtramas, continuación de escenas y narración extensa.
- *Roleplay* conversacional con instrucciones de personaje y tono.
- Seguimiento de instrucciones para escritura, con la advertencia de que temperaturas muy altas pueden degradarlo.
- Capacidades multilingües limitadas al inglés.
- No se documenta soporte de *tool calling*, *function calling*, agentes, visión, audio ni modo de razonamiento explícito.
- Salidas descensuradas con lenguaje explícito, humor y violencia según el prompt.
- Ajuste del número de expertos activos para modular velocidad y calidad.

## Casos de uso

- Escritura de ficción por capítulos: el modelo mantiene coherencia narrativa en contextos de hasta 32k tokens, adecuado para novelas por entregas o *fan fiction* de formato largo.
- *Roleplay* de personajes: con plantilla Llama 3 o Command-R y *repetition penalty* de 1,02, sirve para chatbots de personaje con tono visceral y descensurado.
- Generación de tramas y subtramas para guionistas: se le pide un esquema de escenas y el modelo produce variantes de conflicto y giros, útil en fases de *brainstorming*.
- Continuación de escenas en herramientas de escritura: integrado en interfaces como KoboldCpp o text-generation-webui, permite continuar un texto existente respetando estilo y personajes.
- Contenido de terror y *horror*: el sesgo negativo del modelo y su prosa detallada encajan en relatos de terror, con instrucciones explícitas como "(graphic vivid horror)" en el prompt.
- Prototipado de narrativa interactiva: en motores de aventuras conversacionales o videojuegos narrativos, el modelo genera descripciones de escena y diálogos de PNJ en tiempo real.
- Generación de contenido para *podcasts* o audiolibros: guiones y monólogos con estilo vívido, siempre que se revise el contenido por el sesgo descensurado.
- Experimentación con MoE en local: útil para investigar el efecto del número de expertos activos en calidad y latencia sobre una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor afirma que la perplejidad es inferior a la de Meta Llama 3 Instruct, pero no aporta cifras. Tampoco se ofrecen resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de escritura creativa.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el autor reporta 30+ t/s con 2 expertos en una GPU de 16 GB usando cuantización IQ4_XS.
- GPU recomendadas: tarjetas de 16 GB (por ejemplo, RTX 4080 o RTX 4060 Ti 16 GB) para IQ4_XS; GPU de gama media-alta duplican la velocidad según el autor; no se especifican A100 ni H100.
- Cabe en GPU de consumo: sí, al menos en configuraciones de 16 GB con cuantización agresiva.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, text-generation-webui (Oobabooga), KoboldCpp 1.8+ y cualquier runtime compatible con GGUF.
- Latencia y throughput: 30+ t/s con 2 expertos en GPU de 16 GB; el doble en GPU de gama media; no se dan cifras de latencia por token.
- Ajuste de expertos: en llama.cpp, `--override-kv llama.expert_used_count=int:N`; en LM Studio, en la pantalla de carga; en KoboldCpp, en la pestaña "TOKENS".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-MOE-4X7B-Dark-MultiVerse-24B | 24B (MoE, 2 expertos por defecto) | 32k | Apache 2.0 | Escritura creativa descensurada | GGUF en Hugging Face |
| Mistral 7B Instruct | 7B denso | 32k | Apache 2.0 | Instrucciones generales | Múltiples formatos |
| Meta Llama 3 8B Instruct | 8B denso | 8k | Llama 3 Community License | Instrucciones generales | Múltiples formatos |
| Mixtral 8x7B Instruct | 46,7B (MoE, 2 expertos) | 32k | Apache 2.0 | Instrucciones generales | Múltiples formatos |

La comparación se limita a parámetros, contexto y licencia; no hay datos de rendimiento comparables en la información disponible. Frente a Mistral 7B Instruct y Llama 3 8B Instruct, este modelo ofrece mayor tamaño efectivo y especialización en prosa, pero menor soporte multilingüe y ningún dato de benchmarks. Frente a Mixtral 8x7B, es más pequeño y ligero, aunque con menor número de expertos y sin evaluación pública.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está descensurado por diseño y puede generar lenguaje explícito, violencia y material para adultos; requiere moderación en producción.
- Sesgo negativo: el autor lo describe como un modelo con "ligero sesgo negativo", no orientado a finales felices.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; al ser un modelo de ficción, la veracidad factual no es su objetivo.
- Idiomas: solo inglés; el rendimiento en castellano no está garantizado.
- Contexto: 32k tokens declarados, pero no se documenta la degradación a esa longitud.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir políticas de plataformas o normativas sobre material para adultos.
- Plantillas: requiere Llama 3, Mistral, Alpaca o Command-R; un formato incorrecto degrada el seguimiento de instrucciones.
- Ajuste de expertos: con un solo experto la salida es aleatoria entre generaciones, lo que complica la reproducibilidad.
- Sin soporte documentado de *tool calling* ni agentes; no apto para pipelines de automatización que requieran funciones.
- Repositorio de 204,9 GB: la descarga completa es costosa; conviene elegir una cuantización concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Mistral-MOE-4X7B-Dark-MultiVerse-24B-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQ y soporte: https://huggingface.co/DavidAU/support
- Experto Multi-Verse: https://huggingface.co/MTSAIR/multi_verse_model
- Experto DarkSapling 7B v1.0: https://huggingface.co/TeeZee/DarkSapling-7B-v1.0
- Experto DarkSapling 7B v1.1: https://huggingface.co/TeeZee/DarkSapling-7B-v1.1
- Experto DarkSapling 7B v2.0: https://huggingface.co/TeeZee/DarkSapling-7B-v2.0
- LM Studio: https://lmstudio.ai
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- KoboldCpp: https://github.com/LostRuins/koboldcpp
- llama.cpp server: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
