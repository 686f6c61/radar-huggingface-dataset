# Q2Q2/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED

## Resumen

Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED es un ajuste fino (fine-tune) publicado por el usuario Q2Q2 sobre trohrbaugh/Qwen3.5-9B-heretic-v2, que a su vez deriva del modelo denso Qwen3.5-9B. El entrenamiento se realizó con Unsloth sobre un conjunto de datos de destilación generado con "Claude 4.6" (denominación comercial del autor, sin relación oficial con Anthropic), con el objetivo declarado de mejorar la generación de cadenas de pensamiento y sustituir el estilo de razonamiento de Qwen3.5 por el del modelo profesor. El resultado combina 9.409.813.744 parámetros en bfloat16 con una ventana de contexto nativa de 262.144 tokens y soporte multimodal de entrada imagen-texto.

El elemento diferencial del modelo es su carácter "HERETIC" y "uncensored": parte de una base ya ablacionada (abliterated) y se entrena después de ese proceso, de modo que se reducen drásticamente los rechazos. El autor reporta una tasa de rechazo de 6/100 frente a 100/100 del modelo original, con una divergencia KL de 0,0793 respecto a la base, un valor bajo que sugiere que la capacidad general se ha preservado razonablemente.

Es relevante para desarrolladores que necesiten un modelo de 9B desplegable en hardware de consumo, con contexto muy largo, orientado a escritura creativa, narrativa y roleplay sin restricciones de contenido, y con soporte de visión. Su adopción es todavía nula (0 descargas y 0 likes en el repositorio en el momento de la consulta), por lo que la validación independiente es prácticamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con encoder de vision; capas hibridas Gated DeltaNet (atencion lineal) y Gated Attention; 32 capas, hidden dimension 4096 |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (el modelo base se describe como denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000; el autor del fine-tune indica 256k por defecto |
| Tipos de cuantizacion | Pesos publicados en bfloat16; el autor recomienda minimo q4_k_s (no imatrix) o IQ3S (imatrix) |
| Idiomas soportados | en, zh (segun la tarjeta del fine-tune); la familia Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), bfloat16 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B: un transformer causal con layout hibrido de 8 bloques compuestos por 3 repeticiones de (Gated DeltaNet, FFN) seguidas de 1 (Gated Attention, FFN). Las capas Gated DeltaNet usan 32 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza 128; las capas Gated Attention usan 16 cabezas para Q y 4 para KV con dimension 256 y RoPE de 64 dimensiones. El FFN tiene dimension intermedia 12288, el embedding y la salida son de 248320 (padded) y el modelo se entrena con multi-token prediction (MTP). Incluye un encoder de vision, lo que habilita la pipeline image-text-to-text.

El ajuste fino se realizó con Unsloth sobre un dataset de destilación de gran tamano generado a partir de "Claude 4.6", en hardware local, y se aplicó después del proceso de "Heretic'ing" (ablación de direcciones de rechazo) de la base. El autor indica que el entrenamiento se mantuvo deliberadamente "suave" para no degradar los benchmarks del modelo original, y afirma haber verificado que la capacidad de visión sigue funcionando tras el entrenamiento, aunque las porciones de vídeo no fueron probadas. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" explicito, con un estilo de cadena de pensamiento heredado del modelo profesor de destilacion.
- Escritura creativa y de ficcion: generacion de tramas, subtramas, continuacion de escenas, narracion y "prosa vivida", segun los casos de uso declarados por el autor.
- Roleplay y conversacion multi-turno sin filtros de contenido.
- Entrada multimodal imagen-texto: procesa imagenes junto con texto; el autor confirma que funciona tras el ajuste, aunque el alcance real depende del encoder de vision de la base.
- Contexto largo: hasta 262.144 tokens nativos, lo que permite mantener coherencia en documentos o novelas extensas.
- Multilingue limitado: la tarjeta declara en y zh; la familia base declara cobertura de 201 idiomas, pero no hay evidencia especifica de que el fine-tune preserve esa cobertura.
- Sin censura efectiva: 6 rechazos por cada 100 peticiones segun la metrica del autor, frente a 100/100 del modelo original.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Escritura de novela larga con continuidad argumental: la ventana de 262.144 tokens permite cargar manuscritos completos o arcos narrativos extensos y generar continuaciones coherentes sin perder referencias a personajes y tramas previas.
- Generacion de tramas y subtramas para guiones o series: el modelo esta ajustado especificamente para plot generation y sub-plot generation, de modo que puede producir estructuras narrativas ramificadas a partir de una premisa breve.
- Continuacion de escenas en produccion editorial: dado un fragmento de escena, el modelo mantiene el tono, el punto de vista y el estilo "vivid prosing" declarado en su entrenamiento, util como asistente de primer borrador.
- Roleplay y personajes persistentes: la ausencia de rechazos y el contexto largo lo hacen adecuado para chatbots de personaje con memoria de conversaciones muy extensas, sin que el modelo rompa el personaje por filtros de contenido.
- Asistente de escritura con entrada de imagenes: al aceptar image-text-to-text, puede analizar una ilustracion, portada o storyboard y generar texto descriptivo o narrativo coherente con la imagen.
- Analisis y reescritura de manuscritos completos: con 256k de contexto puede recibir un borrador entero y devolver criticas estructurales, resumenes por capitulo o reescrituras de secciones concretas en una sola pasada.
- Despliegue local para contenido sensible o privado: al ser un modelo de 9B con licencia Apache 2.0 y pesos abiertos, puede ejecutarse en una estacion de trabajo sin enviar material confidencial a servicios en la nube.

## Benchmarks y rendimiento

Resultados publicados por el autor (evaluados en mxfp8):

| Modelo | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| HERETIC (thinking) | 0,432 | 0,505 | 0,625 | 0,658 | 0,374 | 0,748 | 0,657 |
| HERETIC (instruct) | 0,574 | 0,755 | 0,869 | 0,714 | 0,410 | 0,780 | 0,691 |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT | 0,574 | 0,729 | 0,882 | 0,711 | 0,422 | 0,775 | 0,691 |
| Qwen3.5-9B (thinking) | 0,417 | 0,458 | 0,623 | 0,634 | 0,338 | 0,737 | 0,639 |

Metricas de descensuración declaradas por el autor:

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.5-9B) |
|---|---|---|
| Divergencia KL | 0,0793 | 0 (por definicion) |
| Rechazos | 6/100 | 100/100 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Los resultados anteriores proceden exclusivamente del autor y no han sido replicados de forma independiente.

## Requisitos de hardware

- VRAM para inferencia en bfloat16/FP16: aproximadamente 18,8 GB de pesos (tamano del repositorio) y en torno a 21 GB contando activaciones y cache KV, segun estimaciones de terceros para este modelo.
- VRAM estimada en cuantizacion: alrededor de 5-6 GB en 4 bits (q4_k_s) y en torno a 4 GB en IQ3S, valores coherentes con la recomendacion del autor de usar como minimo q4_k_s sin imatrix o IQ3S con imatrix.
- GPU de datacenter: A100 40 GB u 80 GB, H100 y similares para FP16 con contexto largo; la cache KV a 256k de contexto exige memoria adicional considerable.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en FP16 ajustado o, con mas holgura, en 4 bits; en RTX 3060 de 12 GB es viable en 4 bits con contexto reducido.
- Opciones de despliegue: transformers de forma nativa; vLLM, SGLang y KTransformers segun la tarjeta de Qwen3.5-9B; llama.cpp u Ollama mediante cuantizaciones GGUF, si bien el GGUF localizado en la busqueda corresponde a la variante INSTRUCT-HERETIC-UNCENSORED, no a esta THINKING.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks declarados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Q2Q2/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED | 9,41B | 262.144 (256k por defecto) | arc 0,432 / boolq 0,625 / piqa 0,748 en modo thinking; 6/100 rechazos | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9B | 262.144 nativo, hasta 1.010.000 | arc 0,417 / boolq 0,623 / piqa 0,737 en modo thinking; 100/100 rechazos | Apache 2.0 | HuggingFace, oficial |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT (variante hermana) | 9B aprox. | no disponible | arc 0,574 / boolq 0,882 / piqa 0,775; 6/100 rechazos | Apache 2.0 | HuggingFace y GGUF de terceros (mradermacher) |
| trohrbaugh/Qwen3.5-9B-heretic-v2 (base directa) | 9B aprox. | no disponible | no disponible | no disponible | HuggingFace |

La comparativa con alternativas de otros fabricantes (por ejemplo GPT-OSS-20B o Qwen3-Next-80B-A3B-Thinking, mencionados en la tarjeta de Qwen3.5-9B) no puede completarse porque los resultados de esos modelos no estan incluidos en la informacion disponible.

## Limitaciones y advertencias

- Validacion practicamente nula: el repositorio registra 0 descargas y 0 likes, y los benchmarks proceden unicamente del autor, sin replicacion independiente.
- Divergencia respecto al modelo base: aunque el KL de 0,0793 se presenta como bajo, implica que el modelo no es equivalente a Qwen3.5-9B y puede degradar tareas fuera del dominio creativo para el que se ajusto.
- Ausencia de filtros de seguridad: al ser un modelo ablacionado y descensurado (6/100 rechazos), puede generar contenido ofensivo, ilegal o dañino sin advertencia; no es apto para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- Riesgo de alucinacion: inherente a los modelos de 9B y agravado por el entrenamiento orientado a ficcion y estilo narrativo, donde la verosimilitud prima sobre la exactitud factual.
- Cobertura idiomatica limitada en la practica: la tarjeta declara en y zh; no hay evidencia de que el ajuste fino conserve la cobertura multilingue de 201 idiomas de la familia Qwen3.5, por lo que el rendimiento en castellano es una incognita.
- Vision parcialmente verificada: el autor solo confirma pruebas con imagenes; las capacidades de video no se probaron.
- Configuracion de generacion poco documentada: el autor recomienda rep pen de 1 (desactivada), lo que sugiere que valores mas altos podrian degradar la salida; no se detallan otros hiperparametros de inferencia.
- Naming potencialmente confuso: la referencia a "Claude 4.6" describe el modelo profesor usado para destilar, no una colaboracion con Anthropic ni una reproduccion de sus pesos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado sin filtros sigue siendo responsabilidad del desplegador, y la base hereda las condiciones de Qwen3.5-9B.
- Modelo no apto para produccion critica sin evaluacion propia: no hay datos de latencia, throughput ni pruebas de robustez mas alla de los benchmarks de eleccion multiple reportados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Q2Q2/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED
- Modelo base directo: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Modelo base original de la familia: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Replica del modelo en otro repositorio: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED
- Replica alternativa: https://huggingface.co/zswll2/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED
- Ficha de terceros: https://thinkllm.dev/models/qwen3-5-9b-claude-4-6-highiq-thinking-heretic-uncensored
- Estimacion de VRAM en GPU: https://www.spheron.network/tools/gpu-recommender/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED
- GGUF de la variante INSTRUCT (no THINKING): https://inferix.co/models/mradermacher/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-GGUF
