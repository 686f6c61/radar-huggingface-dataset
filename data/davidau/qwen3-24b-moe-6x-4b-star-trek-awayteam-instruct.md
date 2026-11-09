# DavidAU/Qwen3-24B-MOE-6x-4B-Star-Trek-AwayTeam-Instruct

## Resumen

Qwen3-24B-MOE-6x-4B-Star-Trek-AwayTeam-Instruct es un modelo de lenguaje de tipo Mixture of Experts (MoE) publicado por DavidAU en colaboración con Nightmedia, construido mediante la fusión de seis modelos Qwen3 de 4B parámetros previamente evaluados con benchmarks. El resultado es un modelo que, según su autor, equivale a un "24B comprimido en 18B", con un total real de 17.859.964.416 parámetros almacenados en safetensors y un tamaño de repositorio de 35,7 GB en bfloat16.

La innovación principal es su sistema de *gating* programable: cada experto está asociado a un personaje de Star Trek (Q, Picard, Sisko, Janeway, Spock, Data, Worf, etc.) y se activa mediante instrucciones en el prompt o en el system prompt, escribiendo el nombre del personaje al inicio del mensaje. Por defecto se activan dos expertos, pero el usuario puede ajustar entre uno y seis, o invocar a todos simultáneamente con la etiqueta "Away-Team". Esto convierte al modelo en una especie de ensemble controlable por lenguaje natural, orientado a escritura creativa y narrativa de ficción.

El modelo declara una ventana de contexto de 256k tokens, licencia Apache 2.0 y soporte únicamente para inglés. Está pensado para generación de texto, escritura creativa, generación de tramas y subtramas, continuación de escenas y narración en todos los géneros (ciencia ficción, romance, etc.). Su relevancia actual radica en explorar técnicas de fusión de modelos (*model merging*) con control explícito de expertos, un enfoque poco habitual frente a los MoE entrenados desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), fusión de 6 modelos Qwen3 4B |
| Parametros totales | 17.859.964.416 (≈17,86B) |
| Parametros activos | 2 expertos por defecto (ajustable de 1 a 6); parámetros activos exactos no disponibles |
| Longitud de contexto | 256k tokens (declarado) |
| Tipos de cuantizacion | No disponible (repo en bfloat16; no se listan GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión (*merge*) de seis modelos Qwen3 de 4B parámetros, cada uno de ellos seleccionado por su rendimiento en benchmarks según indica el autor. La arquitectura subyacente es `qwen3_moe`, un transformer con capas de mezcla de expertos. El autor describe el resultado como un MoE "totalmente gated" de 24B comprimido a 18B de tamaño efectivo, lo que sugiere una consolidación de pesos durante el merge que reduce el recuento respecto a la suma teórica de los seis modelos originales.

El mecanismo de *gating* no se basa en un router aprendido convencional, sino en instrucciones textuales: cada experto está vinculado al nombre de un personaje de Star Trek (Q Continuum, Enterprise Computer, Quark, Picard, Sisko, Janeway, Garak, Martok, Spock, Sarek, Data, Seven of Nine, Kira, Odo, Dr Crusher, Bashir, Worf, Klingons) y se activa escribiendo dicho nombre al principio del prompt, por ejemplo "Sisko, [prompt]". Se pueden combinar varios nombres ("Sisko, Kira and Worf [prompt]") o usar "Away-Team" para activar todos. El número de expertos activos es configurable de 1 a 6, con valor por defecto 2.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; al tratarse de un merge, el conocimiento procede de los modelos Qwen3 originales. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal más allá del contexto de 256k heredado de la familia Qwen3.

## Capacidades

- Generación de texto en inglés con foco en escritura creativa y narrativa.
- Generación de tramas, subtramas y estructura de historias.
- Continuación de escenas y diálogos de ficción.
- Estilización de prosa "vivid" según los tags del autor (vivid prosing, vivid writing).
- Cobertura de múltiples géneros: ciencia ficción, romance y otros.
- Control de comportamiento mediante *gating* por personajes: selección de 1 a 6 expertos por prompt.
- Invocación conjunta de todos los expertos mediante la etiqueta "Away-Team".
- Programación del modelo a través de prompts y system prompts (instrucciones de gating embebidas).
- Modo conversacional e instruct (modelo marcado como INSTRUCT).
- Ventana de contexto de 256k tokens para documentos o narrativas largas.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y librería transformers.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo *thinking*.

## Casos de uso

- Escritura de ficción por capítulos: el modelo puede mantener coherencia en narrativas largas gracias a los 256k tokens de contexto, permitiendo cargar capítulos previos completos y continuar la historia sin perder hilos argumentales.
- Generación de tramas y subtramas: útil para guionistas o autores que necesitan explorar variantes argumentales; se puede invocar un experto concreto ("Sisko, propón tres subtramas para...") para obtener un estilo o enfoque distinto.
- Continuación de escenas con control de voz narrativa: al activar expertos específicos por personaje, se puede forzar un tono más analítico (Data), más diplomático (Picard) o más directo (Worf), lo que resulta práctico para diálogos diferenciados.
- Prototipado de videojuegos narrativos o RPG de texto: el *gating* por personajes permite mapear cada experto a un NPC o arco narrativo, generando respuestas consistentes con la personalidad asignada.
- Generación de fan fiction y contenido derivado de Star Trek: el etiquetado explícito por personajes de la franquicia facilita prompts temáticos y coherencia con el universo, aunque con las cautelas legales sobre propiedad intelectual.
- Asistencia a escritores con bloqueo creativo: el modo "Away-Team" activa los seis expertos simultáneamente para obtener propuestas diversas en una sola pasada, actuando como un brainstorming multi-perspectiva.
- Experimentación en investigación sobre model merging: sirve como banco de pruebas para estudiar cómo el *gating* textual afecta a la calidad y diversidad de salidas frente a un router aprendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que los seis modelos Qwen3 4B originales fueron "benchmarked" antes del merge, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otras) en la model card ni en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 36 GB solo para pesos (17,86B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda un mínimo de 48 GB para contexto moderado.
- Con contexto de 256k tokens, la KV cache crece de forma significativa; para aprovechar la ventana completa se necesitan GPUs con 80 GB o configuraciones multi-GPU.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para contexto largo; A100 40 GB o L40S 48 GB pueden servir para contextos reducidos.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bfloat16; sería necesario cuantizar a 4 bits (≈9-10 GB de pesos) para que quepa, aunque no se ofrecen cuantizaciones oficiales en el repo.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles de Hugging Face; vLLM, llama.cpp, Ollama o TGI no están confirmados oficialmente para esta arquitectura fusionada y requerirían conversión propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-24B-MOE-6x-4B-Star-Trek-AwayTeam-Instruct | 17,86B (MoE fusionado, 2 expertos por defecto) | 256k | Apache 2.0 | Merge de 6 Qwen3 4B con gating por personajes |
| Qwen3-4B (original) | 4B | 32k-128k según variante | Apache 2.0 | Modelo base de cada experto; menor tamaño y sin gating |
| Qwen3-30B-A3B | 30,5B totales, ~3,3B activos | 128k-256k según variante | Apache 2.0 | MoE entrenado desde cero por Alibaba; router aprendido convencional |
| Mistral Small 3 (24B) | 24B densos | 32k-128k | Apache 2.0 | Alternativa densa de tamaño similar para escritura y conversación |

La comparativa con Qwen3-30B-A3B es la más directa en categoría MoE: aquel es un MoE nativo con router entrenado, mientras que este modelo es un merge con gating textual, lo que cambia por completo el comportamiento y la previsibilidad en producción. Frente a Mistral Small 3, el modelo de DavidAU ofrece mayor contexto declarado (256k) pero menor madurez de ecosistema (sin cuantizaciones oficiales ni integración verificada en motores de inferencia).

## Limitaciones y advertencias

- Solo soporta inglés; no se declara multilingüismo, aunque los Qwen3 base sí lo tenían.
- El *gating* por nombres de personajes es una convención del autor, no un router aprendido: la fiabilidad de la selección de expertos depende de que el prompt respete el formato, y puede degradarse con instrucciones ambiguas.
- Riesgo de alucinación inherente a los modelos generativos, agravado por el enfoque en ficción donde la veracidad factual no es prioritaria.
- Al ser un merge no documentado en detalle, no hay garantías sobre estabilidad numérica ni sobre el comportamiento con contextos muy largos (256k declarados pero sin benchmarks publicados).
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni integración confirmada en vLLM, llama.cpp u Ollama; el despliegue en producción requeriría trabajo adicional.
- El uso de nombres y referencias a Star Trek puede plantear cuestiones de propiedad intelectual si el contenido generado se comercializa; la licencia Apache 2.0 cubre los pesos, no el universo de la franquicia.
- Comunidad muy reducida (16 descargas, 4 likes en el momento de la consulta), lo que implica escaso soporte, pocos reportes de errores y baja validación independiente.
- No se documentan capacidades de tool calling, agentes ni function calling, por lo que no es adecuado para pipelines de automatización que requieran esas funciones.
- El autor indica "more coming soon", lo que sugiere que la model card y el modelo pueden cambiar; conviene fijar una revisión concreta para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3-24B-MOE-6x-4B-Star-Trek-AwayTeam-Instruct
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Repositorio de Qwen3 (familia base): https://huggingface.co/Qwen
- No se han encontrado papers, blogs, repos de código ni demos adicionales en la información proporcionada.
