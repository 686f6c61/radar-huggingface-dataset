# OpenFlowLM/Qwen3-8B-NPU2

## Resumen

OpenFlowLM/Qwen3-8B-NPU2 es un modelo de generacion de texto derivado (fine-tune) de Qwen/Qwen3-8B, publicado por el usuario OpenFlowLM en HuggingFace. Se distribuye bajo licencia Apache 2.0, con la libreria transformers y etiquetas que lo identifican como modelo conversacional de la familia Qwen3. El repositorio ocupa 6,0 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, por lo que se trata de una publicacion sin traccion ni validacion comunitaria conocida. El sufijo "NPU2" del nombre no viene explicado en la informacion disponible, de modo que se desconoce si implica una optimizacion para unidades de procesamiento neuronal, una cuantizacion concreta o alguna otra modificacion del modelo base.

El modelo hereda las caracteristicas del Qwen3-8B original: arquitectura transformer causal densa de 8,2 mil millones de parametros totales (6,95 mil millones sin contar embeddings), 36 capas y atencion con Grouped Query Attention (32 cabezas de consulta y 8 de clave/valor). Su ventana de contexto nativa es de 32.768 tokens, ampliable a 131.072 tokens mediante YaRN. Incorpora un conmutador explicito entre modo "thinking" (razonamiento explicito para matematicas, codigo y logica) y modo "non-thinking" (dialogo general de baja latencia) dentro del mismo juego de pesos.

La relevancia de esta ficha es limitada y conviene ser honesto al respecto: la model card publicada es, en la practica, una copia de la model card oficial de Qwen3-8B, sin documentar que cambios introduce este fine-tune. Para evaluar el modelo en produccion, lo razonable es tratar el Qwen3-8B original como referencia tecnica y considerar este repositorio como una variante no documentada hasta que su autor publique detalles de entrenamiento, cuantizacion y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (no MoE), con Grouped Query Attention (GQA) |
| Parametros totales | 8,2 mil millones |
| Parametros activos | No aplica (modelo denso); parametros sin embeddings: 6,95 mil millones |
| Longitud de contexto | 32.768 tokens nativos; 131.072 tokens con YaRN |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repositorio ocupa 6,0 GB, dato no concluyente sobre el formato de pesos) |
| Idiomas soportados | La metadata del repositorio declara unicamente "en" (ingles); la model card heredada de Qwen3 declara soporte de mas de 100 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repositorio con libreria transformers; no se especifica safetensors, GGUF ni otros) |
| Numero de capas | 36 |
| Cabezas de atencion | 32 para Q, 8 para KV (GQA) |
| Modelo base | Qwen/Qwen3-8B (fine-tune) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer causal denso con 36 capas, normalizacion y atencion con GQA, que reduce el coste de la cache KV usando 8 cabezas de clave/valor frente a las 32 de consulta. El modelo base fue entrenado por Alibaba Qwen en dos etapas (preentrenamiento y post-entrenamiento) y su rasgo mas distintivo es la capacidad de alternar entre modo de razonamiento ("thinking", con contenido envuelto en bloques `<think>...</think>`) y modo directo ("non-thinking"), controlada mediante el parametro `enable_thinking` en `tokenizer.apply_chat_template` o en los endpoints compatibles de vLLM y SGLang.

Sobre el proceso de ajuste especifico de esta variante no hay informacion: se desconoce el volumen de tokens de fine-tuning, la composicion del dataset, si se emplearon tecnicas de RLHF, DPO u otras, y que significa exactamente "NPU2". Tampoco se documentan innovaciones tecnicas propias de este repositorio. Las unicas innovaciones descritas en la model card citada pertenecen al modelo base de Qwen (conmutador de modo de razonamiento, alineacion con preferencias humanas, capacidades de agente y soporte multilingue) y no deben atribuirse al fine-tune de OpenFlowLM. La etiqueta arXiv 2309.00071 incluida en el repositorio corresponde al articulo de PagedAttention/vLLM y no a un paper de este modelo.

## Capacidades

- Generacion de texto conversacional en ingles (idioma declarado en la metadata del repositorio).
- Razonamiento explicito en modo "thinking" para matematicas, logica y generacion de codigo, siempre segun las capacidades heredadas del modelo base Qwen3-8B.
- Respuesta directa de baja latencia en modo "non-thinking", con comportamiento equivalente a un modelo instruct convencional.
- Soporte de tool calling y function calling, indicado en la model card del modelo base.
- Capacidades de agente y razonamiento multi-paso con integracion de herramientas externas, segun el modelo base.
- Instrucciones multilingues y traduccion (mas de 100 idiomas segun la model card heredada; la metadata del repositorio solo declara ingles).
- Escritura creativa, role-playing y dialogos multi-turno, segun la model card heredada.
- No se documenta soporte de vision, audio ni otras modalidades en la informacion disponible.
- Atencion a contexto largo hasta 131.072 tokens, pero solo si se aplica configuracion YaRN, que no se detalla en este repositorio.

## Casos de uso

- Asistente conversacional en ingles: el modelo puede mantener dialogos multi-turno con hasta 32.768 tokens de contexto nativo sin configuracion adicional, suficiente para sesiones largas de soporte o asistencia personal.
- Analisis de documentos extensos con YaRN: activando la extension a 131.072 tokens, permite resumir o extraer informacion de contratos, informes o bases de codigo de gran tamano, siempre que se valide primero la calidad del fine-tune en esa configuracion.
- Generacion de codigo en pipelines internos: por su herencia de Qwen3-8B, es adecuado para autocompletado, generacion de tests y refactorizacion asistida, con tool calling para invocar ejecutores o linters.
- Agentes con herramientas externas: la combinacion de tool calling y razonamiento multi-paso permite construir flujos de recuperacion de informacion, consulta a APIs y ejecucion de tareas encadenadas, con la salvedad de que el fine-tune no esta documentado.
- Razonamiento matematico asistido en modo thinking: util para tutoria, verificacion de calculos o resolucion de problemas paso a paso cuando la latencia no es critica.
- Despliegue en infraestructura propia con vLLM o SGLang: al ser un modelo de 8,2B con licencia Apache 2.0, encaja en entornos on-premise con GPU de gama alta para consumo o GPU de datacenter para mayor throughput.
- Base para fine-tuning adicional: el tamano de 8,2B y la licencia permisiva lo hacen un punto de partida comodo para ajustes especificos de dominio, aunque se recomienda partir del Qwen3-8B original dado que este repositorio no documenta su propio ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes para este fine-tune, y remite al blog, GitHub y documentacion oficiales de Qwen para los datos del modelo base Qwen3-8B. Al no existir evaluacion publicada de esta variante concreta, no es posible afirmar que su rendimiento sea equivalente, superior o inferior al del modelo base.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones calculadas a partir del numero de parametros y de la configuracion de atencion; no proceden de mediciones publicadas para este repositorio.

- VRAM para pesos en BF16/FP16: aproximadamente 16,4 GB solo para los pesos (8,2 mil millones de parametros x 2 bytes), mas overhead de runtime. En la practica requiere unos 20 GB de VRAM.
- VRAM para pesos en INT8: aproximadamente 8,2 GB, con overhead adicional de activaciones y cache.
- VRAM para pesos en INT4: aproximadamente 4,5-5,5 GB, segun el esquema de cuantizacion.
- Cache KV: con 36 capas y 8 cabezas KV de 128 dimensiones, la cache ocupa aproximadamente 144 KB por token en FP16. A 32.768 tokens supone unos 4,7 GB adicionales; a 131.072 tokens, unos 19 GB. Es el factor mas determinante al escalar el contexto.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar el modelo en BF16 con contexto moderado, y con holgura en INT8 o INT4. Tarjetas de 8-12 GB solo son viables con cuantizacion INT4 y contexto recortado.
- GPU de datacenter: A100 40/80 GB, H100 80 GB o L40S son adecuadas para servicio concurrente y contexto largo. Para 131.072 tokens reales conviene disponer de 80 GB o repartir el modelo entre varias GPU.
- Opciones de despliegue: vLLM (>= 0.8.5) y SGLang (>= 0.4.5.post2) para endpoints compatibles con la API de OpenAI, con soporte del conmutador `enable_thinking`. transformers para uso directo. No se confirma en la informacion disponible soporte de llama.cpp, Ollama, TGI ni LM Studio para este repositorio concreto.
- Parametros de muestreo recomendados en modo thinking: Temperature=0,6, TopP=0,95, TopK=20, MinP=0. La model card advierte explicitamente de no usar decodificacion greedy, por riesgo de degradacion y repeticiones sin fin.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados en la informacion disponible |
|---|---|---|---|---|---|
| OpenFlowLM/Qwen3-8B-NPU2 | 8,2B (denso) | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | No |
| Qwen/Qwen3-8B (modelo base) | 8,2B (denso) | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | HuggingFace, ampliamente distribuido | Si, en blog y documentacion de Qwen |
| Qwen/Qwen2.5-7B-Instruct | 7,6B (denso) | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | HuggingFace | Si, en documentacion de Qwen |
| Llama 3.1 8B Instruct | 8,0B (denso) | 128.000 | Licencia comunitaria de Llama 3.1 | HuggingFace | Si, en model card de Meta |

La comparacion relevante es contra el propio Qwen3-8B: ambos comparten especificaciones tecnicas, pero el modelo base cuenta con documentacion de entrenamiento y evaluacion, mientras que esta variante no aporta ninguna de las dos. Frente a Qwen2.5-7B-Instruct, la diferencia principal es la generacion de la familia y el conmutador de modo de razonamiento. Frente a Llama 3.1 8B, la ventaja de Qwen3-8B-NPU2 es la licencia Apache 2.0, mas permisiva que la licencia comunitaria de Llama.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el fine-tune: se desconoce que datos se usaron, con que objetivo y que se modifico respecto al modelo base. Esto impide evaluar riesgos de sobreajuste, sesgos introducidos o degradacion de capacidades.
- El significado del sufijo "NPU2" no esta documentado. Podria implicar cambios en el formato de pesos o en el grafo de computo que afecten a la portabilidad.
- Riesgo de alucinacion: inherente a los modelos de la familia Qwen3, especialmente en modo thinking cuando se generan cadenas de razonamiento largas. No hay evaluacion especifica para esta variante.
- Sesgos: no hay informacion disponible sobre evaluaciones de sesgo, toxicidad o equidad para este repositorio.
- Idiomas: la metadata del repositorio declara unicamente ingles, aunque la model card heredada del modelo base mencione mas de 100 idiomas. Si se necesita multilinguismo, conviene verificar el comportamiento real, ya que el fine-tune podria haber reducido el soporte a otros idiomas.
- Contexto largo: la extension a 131.072 tokens requiere configuracion YaRN que no se documenta en este repositorio, y el consumo de memoria de la cache KV es muy elevado a esa longitud.
- Decodificacion: en modo thinking, el uso de decodificacion greedy puede provocar repeticiones sin fin, segun advierte la model card heredada.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero no exime de cumplir las condiciones de atribucion ni de las obligaciones derivadas de la licencia del modelo base.
- Advertencia de produccion: con 0 descargas y 0 likes, el repositorio no tiene validacion por parte de la comunidad. Se recomienda auditar los pesos y comparar su comportamiento contra Qwen3-8B original antes de integrarlo en cualquier sistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenFlowLM/Qwen3-8B-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentacion de modos thinking/non-thinking en vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html#thinking-non-thinking-modes
- Documentacion de modos thinking/non-thinking en SGLang: https://qwen.readthedocs.io/en/latest/deployment/sglang.html#thinking-non-thinking-modes
- Referencia arXiv incluida en las etiquetas del repositorio (2309.00071, articulo de PagedAttention/vLLM): https://arxiv.org/abs/2309.00071
