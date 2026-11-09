# DavidAU/Qwen3.5-27B-Claude-4.6-OS-Auto-Variable-Heretic-Uncensored-Thinking

## Resumen

Qwen3.5-27B-Claude-4.6-OS-Auto-Variable-Heretic-Uncensored-Thinking es un fine-tune del modelo Qwen3.5-27B, desarrollado por DavidAU mediante Unsloth sobre hardware local. Parte del checkpoint intermedio `coder3101/Qwen3.5-27B-heretic`, que ya ha sido sometido a un proceso de "abliteration" (eliminacion de la alineacion de seguridad), y anade un entrenamiento adicional con cuatro datasets derivados de Claude (denominados "Claude-4.6-OS") orientados a escritura creativa, generacion de tramas, roleplay y ficcion en todos los generos. El resultado es un modelo de 27.356.728.560 parametros (27,3B) en precision bfloat16, con licencia Apache 2.0 y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000.

El modelo conserva la arquitectura hibrida de Qwen3.5: una combinacion de Gated Delta Networks (atencion lineal) y capas de atencion con compuertas, organizadas en 64 capas con un patron de 16 bloques de la forma 3 x (Gated DeltaNet -> FFN) + 1 x (Gated Attention -> FFN). Incluye tambien un codificador de vision, por lo que el pipeline declarado es image-text-to-text, y un modulo MTP (multi-token prediction) entrenado con multiples pasos. El fine-tune se presenta como "suave" para no degradar los benchmarks del modelo base; el autor afirma que mejora ligeramente los resultados del modelo raiz en ARC, HellaSwag, BoolQ, OBQA, PIQA y Winogrande.

La relevancia actual del modelo reside en dos factores. Por un lado, es un ejemplo de la practica de "de-censoring" via heretic/abliteration, con una reduccion declarada de rechazos de 94/100 a 14/100 en un conjunto de prueba de 100 prompts, a costa de una divergencia KL de 0,0653 respecto al original. Por otro, demuestra que es posible aplicar fine-tunes especializados en escritura creativa sobre arquitecturas multimodales hibridas de ultima generacion sin destruir sus capacidades de razonamiento. Es, en la practica, un modelo de nicho para generacion de ficcion y roleplay sin restricciones, no un modelo de proposito general para produccion empresarial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido causal con codificador de vision; Gated DeltaNet (atencion lineal) + Gated Attention, 64 capas, layout 16 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 27.356.728.560 (27,3B) |
| Parametros activos | no disponible (no se declara como MoE en la informacion proporcionada) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | bfloat16 (pesos originales); el autor recomienda minimo Q4_K_S (no imatrix) o IQ3S (imatrix) para uso cuantizado |
| Idiomas soportados | en, zh (declarados en la model card); el modelo base Qwen3.5 declara soporte para 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repo de 54,7 GB |

| Parametro adicional | Valor |
|---|---|
| Dimension oculta | 5120 |
| Embedding de tokens | 248320 (padded) |
| Cabezas de atencion lineal (Gated DeltaNet) | 48 para V, 16 para QK; dimension de cabeza 128 |
| Cabezas de atencion con compuertas | 24 para Q, 4 para KV; dimension de cabeza 256; RoPE dim 64 |
| Dimension intermedia FFN | 17408 |
| Salida LM | 248320 (padded) |
| MTP | Entrenado con multiples pasos |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Modelo base | coder3101/Qwen3.5-27B-heretic (a su vez derivado de Qwen/Qwen3.5-27B) |
| Descargas / likes (a fecha de la informacion) | 41 descargas, 6 likes |
| Fecha de creacion / actualizacion | 2026-03-09 / 2026-11-09 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-27B: un modelo de lenguaje causal con codificador de vision, entrenado con fusion temprana sobre tokens multimodales. El bloque computacional combina capas de atencion lineal Gated DeltaNet (48 cabezas para V, 16 para QK, dimension 128) con capas de atencion tradicional con compuertas (24 cabezas Q, 4 KV, dimension 256, RoPE de 64 dimensiones). Esta disposicion hibrida busca alto throughput y baja latencia en inferencia, especialmente con contextos muy largos, a la vez que mantiene la calidad de atencion completa en una de cada cuatro capas. El modelo incorpora tambien un modulo de prediccion multi-token (MTP) entrenado con varios pasos, que puede emplearse para decodificacion especulativa.

El entrenamiento del fine-tune se realizo con Unsloth sobre hardware local, partiendo del checkpoint heretic de coder3101 y usando cuatro datasets derivados de Claude ("Claude-4.6-OS"). El autor indica que el entrenamiento fue deliberadamente "suave" para preservar los benchmarks del modelo raiz y que se mejora el rendimiento en razonamiento y generacion de salida. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta de los datasets ni si se emplearon tecnicas de RLHF o DPO en esta fase. El proceso de heretic/abliteration previo si esta documentado en terminos de metricas: divergencia KL de 0,0653 frente al modelo original y reduccion de rechazos de 94/100 a 14/100 en un test de 100 prompts. El autor tambien menciona una plantilla Jinja "upgraded" que repara problemas del modelo de organizacion (repeticiones, thinking largo, bucles) y mejora el manejo de tool calling. Las porciones de video del modelo no fueron probadas.

## Capacidades

- Generacion de texto y escritura creativa: ficcion, ciencia ficcion, romance y "todos los generos", con enfasis en prosa vivida, generacion de tramas y subtramas, continuacion de escenas y storytelling.
- Roleplay y conversacion multi-turno sin restricciones de contenido (modelo heretic/abliterated, "fully uncensored").
- Razonamiento y generacion de salida mejorados respecto al modelo base segun el autor, con benchmarks superiores en ARC, HellaSwag, BoolQ, OBQA, PIQA y Winogrande.
- Vision (image-text-to-text): el autor declara que las imagenes funcionan tras el nuevo entrenamiento; el codificador de vision proviene de Qwen3.5.
- Tool calling / function calling: la plantilla Jinja actualizada "upgrades/repairs" el manejo de herramientas del modelo de organizacion.
- Capacidades de agente y razonamiento multi-paso: heredadas de Qwen3.5 (RL escalado en entornos multi-agente), aunque no validadas especificamente en este fine-tune.
- Multilingue: declarado en y zh en la model card; el base Qwen3.5 declara 201 idiomas y dialectos.
- Modo thinking: el nombre del modelo incluye "Thinking" y la plantilla repara problemas de "long thinking"; se infiere soporte de razonamiento extendido, aunque no se detalla el mecanismo en la informacion disponible.
- Contexto largo: hasta 262.144 tokens nativos, extensible a 1.010.000.

## Casos de uso

- Generacion de ficcion y novelas por capitulos: el modelo se entrena especificamente en plot y sub-plot generation; con 262k tokens de contexto puede mantener biblias de personajes, arcos argumentales y continuidad estilistica a lo largo de decenas de capitulos en una sola ventana.
- Roleplay de personajes sin restricciones: la reduccion de rechazos a 14/100 permite mantener personajes con moralidad ambigua, tramas adultas o dialogos crudos sin que el modelo rompa la escena con negativas, algo critico en comunidades de RP.
- Continuacion de escenas y "scene continue": util para editores y guionistas que necesitan completar borradores con coherencia de tono; el fine-tune esta orientado a prosa vivida y mantiene el estilo del texto de entrada.
- Escritura asistida de ciencia ficcion y romance: los tags declaran cobertura de "all genres"; se puede usar como generador de variantes de trama y subtramas para explorar direcciones narrativas antes de escribir el guion final.
- Generacion multimodal con contexto largo: al conservar el codificador de vision, puede procesar imagenes (por ejemplo, storyboards o referencias visuales) junto a instrucciones de texto para generar descripciones o continuaciones narrativas coherentes con la referencia.
- Agente creativo con tool calling: la plantilla Jinja reparada permite encadenar llamadas a herramientas (busqueda de referencias, generacion de imagenes, consulta de bases de datos de personajes) dentro de un pipeline de escritura automatizada.
- Analisis y reescritura de corpus literarios: con contexto extensible hasta 1M tokens, puede procesar obras completas para extraer tramas, personajes y estilo, y reescribir secciones manteniendo coherencia global.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (formato decimal, sin indicar el conjunto de evaluacion exacto mas alla de las siglas):

| Benchmark | Este modelo | Qwen3.5-27B-Text-VL qx86-hi |
|---|---|---|
| ARC | 0,467 | 0,443 |
| ARC/e | 0,556 | 0,498 |
| BoolQ | 0,859 | 0,857 |
| HellaSwag | 0,739 | 0,701 |
| OBQA | 0,400 | 0,372 |
| PIQA | 0,786 | 0,770 |
| Winogrande | 0,732 | 0,752 |

| Metrica de alineacion | Este modelo | Qwen/Qwen3.5-27B original |
|---|---|---|
| Divergencia KL | 0,0653 | 0 (por definicion) |
| Rechazos (sobre 100 prompts) | 14/100 | 94/100 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales para este fine-tune concreto. Los benchmarks de Qwen3.5-27B original se remiten a la figura del blog de Qwen, pero sus valores numericos no estan incluidos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 54,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se necesita un nodo con 80 GB (A100/H100) o multiples GPU para contexto largo.
- Cuantizacion recomendada por el autor: minimo Q4_K_S (no imatrix) o IQ3S (imatrix). En Q4, los pesos bajan a ~15-16 GB, lo que permite ejecucion en una RTX 4090 (24 GB) con contexto moderado; IQ3S reduce aun mas, en torno a 11-12 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para bfloat16 y contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantizaciones Q4/IQ3 con contexto recortado; configuraciones multi-GPU para aprovechar los 262k tokens nativos.
- Cabe en GPU consumer: si, en RTX 4090/3090 con Q4_K_S o IQ3S y contexto limitado; no en GPUs de 8-12 GB sin cuantizaciones agresivas y contexto muy reducido.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM, SGLang, KTransformers (segun la model card del base Qwen3.5); llama.cpp/Ollama para versiones GGUF (no se confirma en la informacion disponible que existan GGUF publicados de este fine-tune).
- Latencia y throughput: no disponibles. La arquitectura hibrida con Gated DeltaNet esta disenada para alto throughput y baja latencia, pero no se aportan cifras concretas para este checkpoint.
- Nota: el autor indica rep pen de 1 (desactivado) en sus pruebas y contexto por defecto de 256k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DavidAU) | 27,3B | 262k (ext. 1,01M) | Fine-tune creativo + heretic + vision | Apache 2.0 | Hugging Face, 41 descargas |
| coder3101/Qwen3.5-27B-heretic | 27B | 262k (heredado) | Base heretic sin fine-tune creativo | no disponible en la informacion | Hugging Face |
| Qwen/Qwen3.5-27B | 27B | 262k (ext. 1,01M) | Modelo oficial multimodal alineado | no disponible en la informacion | Hugging Face, amplia adopcion |
| Qwen3.5-27B-Text-VL qx86-hi | 27B | no disponible | Variante cuantizada citada como referencia de benchmarks | no disponible | no disponible |

La comparativa directa con alternativas de otros laboratorios (por ejemplo, modelos de 24-32B de Meta, Mistral o DeepSeek) no esta disponible en la informacion proporcionada, por lo que no se aportan cifras de esos modelos.

## Limitaciones y advertencias

- Modelo "fully uncensored" y heretic: no rechaza peticiones dañinas o controvertidas; no es adecuado para despliegues orientados a usuario final sin capas de moderacion externas.
- La divergencia KL de 0,0653 respecto al original indica una degradacion medible de la distribucion original; puede afectar sutilmente a tareas de razonamiento no creativas.
- Riesgo elevado de alucinacion en datos factuales, agravado por el entrenamiento en ficcion y la ausencia de alineacion de seguridad.
- Idiomas declarados limitados a en y zh en la model card, aunque el base declara 201; el rendimiento real en castellano no esta documentado.
- Las capacidades de vision estan declaradas como "funcionando" por el autor, pero sin benchmarks ni evaluacion sistematica; las porciones de video no fueron probadas.
- El tool calling depende de una plantilla Jinja modificada por el autor; puede haber incompatibilidades con stacks que esperan la plantilla oficial de Qwen.
- El autor recomienda cuantizaciones Q4_K_S o IQ3S; cuantizaciones mas agresivas no estan validadas y pueden degradar la coherencia narrativa.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de alineacion de seguridad traslada al desplegador la responsabilidad legal y etica del contenido generado.
- Repo de 54,7 GB y modelo de 27B: coste de almacenamiento y despliegue considerable; con solo 41 descargas y 6 likes, la validacion por la comunidad es muy limitada.
- El nombre del modelo y la model card mezclan referencias a "Qwen 3.5 9B dense" y "27B"; la ficha tecnica de pesos confirma 27,3B, pero la documentacion del autor es inconsistente en ese punto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-27B-Claude-4.6-OS-Auto-Variable-Heretic-Uncensored-Thinking
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Modelos del autor en tendencia: https://huggingface.co/models?sort=trending&search=DavidAU
- FAQs y soporte del autor: https://huggingface.co/DavidAU/support
- Modelo base intermedio: https://huggingface.co/coder3101/Qwen3.5-27B-heretic
- Modelo original Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
