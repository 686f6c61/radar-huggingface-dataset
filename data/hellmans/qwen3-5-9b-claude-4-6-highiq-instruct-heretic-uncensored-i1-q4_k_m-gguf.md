# hellmans/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-i1-Q4_K_M-GGUF

## Resumen

Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED es un ajuste fino (fine-tune) del modelo denso Qwen3.5-9B, desarrollado por el usuario hellmans (con la model card original atribuida a DavidAU) mediante Unsloth sobre hardware local. El modelo parte de `trohrbaugh/Qwen3.5-9B-heretic-v2`, una variante ya "abliterada" o "heretic" del Qwen3.5-9B base, y se ha entrenado adicionalmente con un dataset de destilación de Claude 4.6 de gran tamano. El resultado es un modelo de 8.953.803.264 parametros (aproximadamente 9B) con contexto nativo de 262.144 tokens, orientado a escritura creativa, ficcion, roleplaying y generacion de historias sin restricciones de contenido.

La relevancia de este modelo radica en su doble naturaleza: por un lado hereda la arquitectura hibrida de Qwen3.5 (Gated DeltaNet combinado con atencion con compuertas y FFN), y por otro aplica tecnicas de "de-censoring" que reducen drasticamente las negativas del modelo. Segun la model card, la divergencia KL respecto al original es de 0.0793 y las negativas caen de 100/100 a 6/100, lo que indica que el ajuste preserva en gran medida la distribucion original mientras elimina los rechazos. Se distribuye en formato GGUF cuantizado Q4_K_M con imatrix, lo que lo hace desplegable en hardware de consumo.

El modelo conserva capacidades multimodales (image-text-to-text) segun el pipeline declarado, aunque el autor advierte que las porciones de video no fueron probadas. Esta ficha describe la variante GGUF Q4_K_M publicada por hellmans, que es una cuantizacion del modelo original de DavidAU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated DeltaNet (atencion lineal) + Gated Attention + FFN, con encoder de vision |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | Q4_K_M con imatrix (esta variante); el autor sugiere minimo Q4_K_S sin imatrix o IQ3_S con imatrix |
| Idiomas soportados | en, zh (declarados en la model card); el Qwen3.5 base declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 6,3 GB); el modelo base en safetensors/bfloat16 |
| Dimension oculta | 4096 |
| Numero de capas | 32 |
| Layout oculto | 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Embedding de tokens | 248.320 (padded) |
| FFN dimension intermedia | 12.288 |
| Cabezas de atencion (Gated Attention) | 16 para Q, 4 para KV, dimension 256, RoPE 64 |
| Cabezas de atencion lineal (Gated DeltaNet) | 32 para V, 16 para QK, dimension 128 |
| MTP | Entrenado con multi-steps |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, que combina capas de Gated DeltaNet (una forma de atencion lineal con estado recurrente) con capas de Gated Attention clasica en un patron de 3 a 1: por cada bloque de tres capas DeltaNet se intercala una capa de atencion con compuertas. Esta hibridacion busca alto throughput de inferencia con baja latencia y coste reducido, manteniendo la calidad de un transformer denso. El modelo incluye un encoder de vision con fusion temprana de tokens multimodales, lo que le permite procesar imagenes ademas de texto. El contexto nativo es de 262.144 tokens.

El entrenamiento del modelo original Qwen3.5-9B incluye pre-entrenamiento y post-entrenamiento con RL escalado en entornos multi-agente. Sobre esa base, el autor del fine-tune aplico un ajuste con Unsloth usando un dataset de destilacion de Claude 4.6 de gran tamano, en hardware local, con el objetivo declarado de mantener intactos los benchmarks del modelo original ("entrenamiento suave"). Posteriormente se aplico el proceso "heretic" (abliteration) para eliminar rechazos, y se modifico la plantilla Jinja para forzar el modo "instruct only". El modelo parte de `trohrbaugh/Qwen3.5-9B-heretic-v2`, por lo que el proceso heretic ya estaba presente en la base y se reforzo con el entrenamiento posterior.

La innovacion tecnica mas destacable es la combinacion de atencion lineal (DeltaNet) con atencion clasica, que reduce el coste computacional en contextos largos, junto con el entrenamiento MTP (multi-token prediction). El proceso de de-censoring reporta una divergencia KL de 0.0793 respecto al original, lo que sugiere que el ajuste no degrada gravemente la distribucion de salida.

## Capacidades

- Generacion de texto y escritura creativa: ficcion, generacion de tramas y subtramas, continuacion de escenas, storytelling en todos los generos (ciencia ficcion, romance, etc.).
- Roleplaying y conversacion multi-turno con contexto largo (hasta 256k tokens).
- Razonamiento y respuesta a instrucciones en modo "instruct only" (plantilla Jinja modificada).
- Procesamiento de imagenes (image-text-to-text) segun el pipeline declarado; el autor indica que la vision funciona con el nuevo entrenamiento, aunque las porciones de video no fueron probadas.
- Capacidades multilingues limitadas a en y zh segun la model card (el base declara 201 idiomas, pero esta variante solo declara ingles y chino).
- Contenido sin restricciones: el proceso heretic reduce las negativas a 6/100 frente a 100/100 del original.
- No se documenta soporte explicito de tool calling, function calling ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Escritura de ficcion y novelas: el modelo esta entrenado especificamente para generacion de tramas, subtramas y continuacion de escenas, con contexto de 256k tokens que permite mantener coherencia en manuscritos largos y multiples capitulos en una sola sesion.
- Roleplaying y juegos de rol por texto: su modo instruct y su falta de rechazos lo hacen adecuado para narrativas interactivas donde el usuario define el tono y el contenido sin fricciones.
- Generacion de guiones y dialogos: para produccion audiovisual o videojuegos, donde se necesita continuidad de escena y consistencia de personajes a lo largo de contextos extensos.
- Asistente de escritura creativa: reescritura, expansion de ideas, generacion de variantes de una misma escena y exploracion de generos, aprovechando el ajuste con datos de Claude 4.6 para un estilo de prosa vivida.
- Analisis de imagenes con narracion: al conservar el encoder de vision, puede describir imagenes y generar texto narrativo a partir de ellas, util para documentacion creativa o generacion de descripciones a partir de material visual.
- Prototipado de narrativa interactiva y chatbots de personaje: desplegado en local con llama.cpp u Ollama en formato GGUF Q4_K_M, permite iterar sobre personajes y tramas sin coste de API y sin filtros de contenido.
- Investigacion sobre alineacion y abliteration: como caso de estudio de un modelo con divergencia KL baja (0.0793) y reduccion drastica de negativas, es util para estudiar el equilibrio entre utilidad y seguridad en modelos ajustados.

## Benchmarks y rendimiento

Resultados publicados en la model card (precision mxfp8):

| Benchmark | HERETIC (este modelo) | Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT | Qwen3.5-9B base |
|---|---|---|---|
| ARC | 0,574 | 0,574 | 0,417 |
| ARC/e | 0,755 | 0,729 | 0,458 |
| BoolQ | 0,869 | 0,882 | 0,623 |
| HSWAG | 0,714 | 0,711 | 0,634 |
| OBKQA | 0,410 | 0,422 | 0,338 |
| PIQA | 0,780 | 0,775 | 0,737 |
| Wino | 0,691 | 0,691 | 0,639 |

Metricas de de-censoring:

| Metrica | Este modelo | Qwen/Qwen3.5-9B original |
|---|---|---|
| Divergencia KL | 0,0793 | 0 (por definicion) |
| Negativas | 6/100 | 100/100 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF Q4_K_M pesa 6,3 GB, por lo que se necesitan aproximadamente 7-8 GB de VRAM para cargar el modelo con overhead de contexto; con contexto largo (256k) el consumo de KV cache crece considerablemente y puede requerir 16-24 GB o mas.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con contexto moderado; A100 40/80 GB o H100 para contexto completo de 256k o cuantizaciones mayores.
- Cabe en GPU de consumo: si, en GPUs con 8 GB o mas para Q4_K_M con contexto corto (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Para contexto largo se recomienda 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (formato GGUF); vLLM, SGLang y KTransformers segun la model card del Qwen3.5 base (para pesos safetensors); Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El autor sugiere rep pen de 1 (desactivada) y minimo Q4_K_S sin imatrix o IQ3_S con imatrix.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED) | ~9B | 262.144 | Apache 2.0 | GGUF Q4_K_M | Fine-tune heretic, sin rechazos, orientado a ficcion |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT (DavidAU) | ~9B | 262.144 | Apache 2.0 | safetensors/GGUF | Mismo fine-tune sin el proceso heretic; mantiene rechazos |
| Qwen/Qwen3.5-9B | ~9B | 262.144 | Apache 2.0 | safetensors | Modelo base oficial; benchmarks inferiores en ARC y BoolQ, con rechazos |
| trohrbaugh/Qwen3.5-9B-heretic-v2 | ~9B | 262.144 | Apache 2.0 | safetensors | Base heretic sobre la que se aplico este fine-tune |

## Limitaciones y advertencias

- Modelo sin censura: el proceso heretic elimina los rechazos, lo que implica que puede generar contenido inapropiado, ofensivo o danino sin filtros; no es adecuado para aplicaciones orientadas al publico general sin moderacion externa.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos, citas o datos; el ajuste con destilacion no elimina este riesgo.
- Idiomas: solo se declaran en y zh; el rendimiento en castellano no esta verificado y puede ser deficiente a pesar de que el base declare 201 idiomas.
- Contexto: aunque el contexto nativo es de 256k, el coste de KV cache en contexto largo es elevado y puede degradar el rendimiento en hardware limitado.
- Vision: el autor indica que la vision funciona, pero las porciones de video no fueron probadas; el soporte multimodal en formato GGUF puede variar segun el runtime.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado sin censura puede infringir normativas locales o terminos de servicio de plataformas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: poca validacion comunitaria; la model card esta atribuida a DavidAU pero el repo lo publica hellmans, lo que introduce incertidumbre sobre la procedencia exacta de la cuantizacion.
- El autor advierte que hay otras versiones en prueba y que el entrenamiento se hizo en hardware local, sin detallar el volumen exacto del dataset de destilacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hellmans/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-i1-Q4_K_M-GGUF
- Modelo original del fine-tune: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED
- Modelo base heretic: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Perfil del autor DavidAU: https://huggingface.co/DavidAU
