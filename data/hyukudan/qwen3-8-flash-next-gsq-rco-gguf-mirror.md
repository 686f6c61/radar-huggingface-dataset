# hyukudan/Qwen3.8-Flash-Next-GSQ-RCO-GGUF-mirror

## Resumen

Este repositorio no es un modelo nuevo, sino un espejo (mirror) byte a byte de la revisión `ed59f92` del repositorio `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF`, publicado por el usuario hyukudan para garantizar la reproducibilidad de su banco de pruebas `strix-halo-engine-lab`. Contiene cuantizaciones GGUF no uniformes del modelo base Qwen/Qwen3.8-Flash-Next, un transformer disperso de mezcla de expertos (MoE) con 176.943.899.520 parámetros totales (unos 176,9 mil millones), 48 capas, 512 expertos enrutados por capa y 10 expertos activos por token según la documentación de terceros consultada.

El interés técnico está en el método de cuantización: GSQ (arXiv:2604.18556) y RCO (arXiv:2605.00649), desarrollados por ISTA-DASLab, que asignan anchos de bit no uniformes por tensor en lugar de aplicar un esquema homogéneo. El espejo incluye únicamente dos cuantizaciones (Q2_0 e IQ3_S), los ficheros de asignación de tensores `rco-allocation.txt` y las gráficas de calidad frente a ancho de bit medio del repositorio original; IQ2_XS e IQ3_XXS solo están disponibles en el repositorio upstream.

Es relevante ahora porque permite ejecutar un modelo MoE de ~177 mil millones de parámetros en un único nodo con memoria unificada grande (el autor trabaja sobre plataforma AMD Strix Halo) o en una GPU de 80 GB con la variante Q2_0, algo imposible con los pesos en BF16. Ahora bien, el propio autor documenta que el perfil de velocidad GSQ no supera su receta de calidad: la concordancia top-1 frente a su conjunto bloqueado de 64 prompts cae al 76,6 %, frente al 88,1 % de la cuantización UD-Q4_K_XL, es decir, 11,5 puntos menos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer disperso de mezcla de expertos (MoE): 48 capas, 512 expertos enrutados por capa, 10 expertos activos por token; incluye codificador visual y proyector en BF16 para inferencia multimodal |
| Parámetros totales | 176.943.899.520 (~176,9 B), dato de safetensors del modelo base |
| Parámetros activos | No disponible (se conocen 10 expertos activos de 512 por capa, pero no el recuento exacto de parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_0 e IQ3_S en este espejo; IQ2_XS e IQ3_XXS en el repositorio upstream; referencia de calidad en UD-Q4_K_XL (externo a este repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 declarada por el repositorio upstream, sin fichero LICENSE original; se añade el texto estándar Apache 2.0 y también `LICENSE.Qwen` con la Qwen Community License 1.0, cuyas condiciones aplican a los pesos derivados |
| Formato de pesos | GGUF, dividido en 2 shards por cuantización |
| Método de cuantización | GSQ + RCO (ancho de bit no uniforme por tensor), con importance matrix (etiqueta `imatrix`) |
| Tamaño de los pesos | Q2_0: 37.623.740.192 + 28.800.138.432 bytes (66,42 GB); IQ3_S: 54.817.524.224 + 28.800.138.432 bytes (83,62 GB) |
| Tamaño del repositorio | 150.042.091.035 bytes (150,04 GB) según los 16 ficheros listados; la ficha de HuggingFace declara 121,2 GB |
| Autor del espejo | hyukudan (cuantización original: ISTA-DASLab) |
| Repositorio upstream fijado | `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF@ed59f92082b1e93c0e96d60a8b11aab089b52f09` |
| Modelo base fijado | `Qwen/Qwen3.8-Flash-Next@de4b8e4d43b917e7706784d8bb445c9af86a3540` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE disperso de 48 capas con 512 expertos enrutados por capa y 10 expertos activos por token, según la documentación de terceros consultada. El release de ISTA-DASLab incluye además un codificador visual y un proyector en BF16, lo que habilita inferencia multimodal sobre los pesos cuantizados. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada.

La innovación de esta release es exclusivamente de compresión. GSQ y RCO sustituyen la cuantización uniforme por una asignación de anchos de bit por tensor optimizada, y el repositorio incluye los ficheros `rco-allocation.txt` con el reparto resultante para IQ2_XS, IQ3_S, IQ3_XXS y Q2_0. El espejo no recuantiza ni modifica nada: los shards son copias exactas verificadas por sha256, y el motor del autor compone un fichero híbrido (`STRIX_GSQ_Q20_A8=1`, perfil opcional y nunca por defecto) que sustituye los expertos enrutados de un GGUF UD-Q4_K_XL de producción por los tensores Q2_0 de estos shards, copiados byte a byte vía `gguf_compose.py hybrid`. Cabe notar que el segundo shard (`00002-of-00002`, 28.800.138.432 bytes) es idéntico en Q2_0 e IQ3_S: comparten el mismo sha256 `316b46f3...`.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio y el formato GGUF permiten su uso directo en pipelines de chat.
- Razonamiento y matemáticas: las gráficas incluidas en el repo evalúan AIME25 y GPQA Diamond frente al ancho de bit medio, lo que indica que el modelo base se mide en razonamiento competitivo y conocimiento experto.
- Generación de código: se incluye una gráfica de LiveCodeBench (lcb) frente a ancho de bit medio, de modo que el modelo base está evaluado en tareas de código.
- Multimodalidad: el release original incorpora codificador visual y proyector en BF16, por lo que el modelo soporta entrada de imágenes además de texto.
- Mezcla de expertos con activación dispersa: 10 de 512 expertos por capa, lo que reduce el coste de cómputo por token frente a un modelo denso del mismo tamaño.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada para este release; no se documenta de forma explícita.
- Capacidades multilingües: no disponible.
- Modo thinking o decodificación especulativa: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE de ~177 B en un nodo con memoria unificada: la variante Q2_0 ocupa 66,42 GB de pesos, de modo que encaja en plataformas tipo AMD Strix Halo con 128 GB de memoria compartida, que es precisamente el entorno para el que el autor del espejo construyó y midió sus motores.
- Reproducibilidad de experimentos de cuantización: al fijar el commit upstream y publicar sha256 de cada fichero, sirve como referencia inmutable para comparar motores de inferencia, kernels o políticas de offload sin que cambie el artefacto de partida.
- Investigación en asignación no uniforme de bits: los ficheros `rco-allocation.txt` permiten analizar qué tensores reciben más bits y correlacionarlo con las curvas de calidad por tarea (AIME25, GPQA Diamond, LiveCodeBench) incluidas como PNG.
- Servicio de chat con contexto multimodal en hardware de gama alta: con IQ3_S (83,62 GB) en una GPU de 96-141 GB, el codificador visual en BF16 permite atender consultas que combinan imagen y texto en un único modelo.
- Evaluación comparativa de cuantizaciones en producción: el dato de concordancia top-1 (76,6 % de Q2_0 frente a 88,1 % de UD-Q4_K_XL) es un caso práctico de cómo decidir si merece la pena degradar calidad por velocidad antes de desplegar.
- Generación de código asistida en entornos con VRAM limitada: la existencia de una curva específica de LiveCodeBench frente a ancho de bit permite seleccionar el nivel de compresión adecuado para un pipeline de autocompletado o revisión de código.
- Docencia y experimentación con MoE dispersos: un GGUF de 66 GB con 512 expertos por capa permite estudiar el comportamiento del enrutado y del uso de memoria sin disponer de un clúster de GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. El repositorio incluye gráficas de calidad frente a ancho de bit medio para AIME25, GPQA Diamond, LiveCodeBench, la media de tareas y el throughput de prefill, pero los valores concretos no están accesibles en los datos proporcionados.

El único dato cuantitativo de calidad disponible es interno del autor del espejo, medido sobre su conjunto bloqueado de 64 prompts:

| Métrica | Q2_0 (perfil GSQ) | UD-Q4_K_XL | Diferencia |
|---|---|---|---|
| Concordancia top-1 | 76,6 % | 88,1 % | −11,5 puntos |

Como referencia externa de rendimiento, llm-bench.io reporta 36 tok/s de pico en 2 ejecuciones comunitarias sobre 1 GPU para el repositorio upstream; se trata de un dato de terceros no verificado y correspondiente a hardware no especificado en la información disponible.

## Requisitos de hardware

- VRAM para Q2_0: 66,42 GB solo de pesos, más caché KV de tamaño no disponible (la longitud de contexto no está documentada). Requiere por tanto más de 80 GB si se quiere contexto apreciable.
- VRAM para IQ3_S: 83,62 GB de pesos, lo que descarta cualquier GPU de 80 GB incluso con contexto mínimo.
- GPU de 80 GB (A100 80 GB, H100 80 GB): Q2_0 es viable solo con contexto corto y dejando poco margen; IQ3_S no cabe.
- GPU de 96-141 GB (H200 141 GB): ambas cuantizaciones caben, IQ3_S con margen amplio para caché KV.
- Consumer GPU: ninguna de las dos cuantizaciones completas cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB). Sería necesario recurrir a IQ2_XS o IQ3_XXS del repositorio upstream (tamaños no disponibles) o a offload parcial a RAM/SSD con penalización severa de latencia.
- Memoria unificada: plataformas tipo AMD Strix Halo con 128 GB son el objetivo declarado del autor del espejo; 66,42 GB de pesos dejan espacio para contexto y sistema.
- Despliegue: llama.cpp es la ruta natural por el formato GGUF; Ollama u otros frontales basados en llama.cpp pueden consumir los shards directamente. vLLM y TGI tienen soporte de GGUF limitado y no garantizan el comportamiento esperado con asignación de bits no uniforme.
- Throughput: 36 tok/s de pico según llm-bench.io (2 ejecuciones comunitarias, 1 GPU, hardware no especificado). No hay datos de latencia ni de throughput de prefill en la información disponible.

## Comparativa con modelos similares

La comparación más útil en este caso es entre cuantizaciones del mismo modelo base, ya que el espejo no introduce un modelo distinto:

| Artefacto | Formato / esquema | Tamaño de pesos | Calidad documentada | Disponibilidad |
|---|---|---|---|---|
| Este espejo, Q2_0 (GSQ-RCO) | GGUF, ~2 bits no uniforme | 66,42 GB | 76,6 % top-1 en 64 prompts | En este repositorio |
| Este espejo, IQ3_S (GSQ-RCO) | GGUF, ~3 bits no uniforme | 83,62 GB | No disponible | En este repositorio |
| ISTA-DASLab IQ2_XS / IQ3_XXS | GGUF, GSQ-RCO | No disponible | No disponible | Solo en el repositorio upstream |
| UD-Q4_K_XL | GGUF, ~4 bits | No disponible | 88,1 % top-1 en 64 prompts | Externo a este repo (referencia del autor) |
| Qwen3.8-Flash-Next BF16 | Safetensors | ~354 GB (176,9 B a 16 bits, estimación) | Línea base | Repositorio oficial de Qwen |

Comparación con modelos alternativos de otro fabricante y tamaño similar: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Degradación de calidad medible: el perfil basado en Q2_0 pierde 11,5 puntos de concordancia top-1 frente a UD-Q4_K_XL en el conjunto del autor, que concluye explícitamente que no supera su receta de calidad. No debe asumirse que estas cuantizaciones son aptas para producción sin evaluación propia.
- Ambigüedad de licencia: el repositorio upstream declara Apache-2.0 pero no incluye fichero LICENSE; el espejo añade el texto Apache 2.0 y, además, `LICENSE.Qwen` con la Qwen Community License 1.0 del modelo base. Al derivar de Qwen, las condiciones de la Qwen Community License 1.0 aplican igualmente y deben revisarse antes de cualquier uso comercial.
- Es un espejo no oficial: 0 descargas y 0 likes en el momento de la consulta; la autoría técnica corresponde a ISTA-DASLab y a Qwen, y el espejo solo fija una revisión. Cualquier corrección futura estará en el repositorio upstream, no aquí.
- Discrepancia de tamaño: la ficha de HuggingFace indica 121,2 GB de repositorio, mientras que la model card lista 150.042.091.035 bytes en 16 ficheros. Conviene verificar el espacio en disco antes de descargar.
- Solo dos cuantizaciones espejadas: Q2_0 e IQ3_S. Las variantes de menor tamaño (IQ2_XS, IQ3_XXS) están únicamente en el upstream, lo que limita las opciones si el hardware es ajustado.
- Riesgo de alucinación: no cuantificado en la información disponible, pero la compresión agresiva a ~2 bits es un factor de riesgo añadido en tareas de razonamiento y matemáticas.
- Idiomas y longitud de contexto no documentados: no es posible garantizar comportamiento multilingüe ni planificar el dimensionado de la caché KV sin consultar el repositorio del modelo base.
- Tool calling y uso como agente no documentados para este release; no deben asumirse sin pruebas.
- El propio autor lo usa con un perfil opcional (`STRIX_GSQ_Q20_A8=1`) que nunca es el valor por defecto de su motor, señal de que se trata de un artefacto experimental.
- Formatos divididos en 2 shards: requieren herramientas de llama.cpp capaces de cargar GGUF multi-parte y consumen el doble de operaciones de E/S en el arranque.

## Enlaces

- Repositorio del espejo: https://huggingface.co/hyukudan/Qwen3.8-Flash-Next-GSQ-RCO-GGUF-mirror
- Repositorio upstream (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Revisión upstream fijada: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF/tree/ed59f92082b1e93c0e96d60a8b11aab089b52f09
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Código GSQ: https://github.com/IST-DASLab/GSQ
- Paper RCO: https://arxiv.org/abs/2605.00649
- Código RCO: https://github.com/IST-DASLab/RCO
- Repositorio del motor del autor del espejo: https://github.com/hyukudan/strix-halo-engine-lab
- Perfil de velocidad GSQ: https://github.com/hyukudan/strix-halo-engine-lab#gsq-opt-in-speed-over-quality-profile
- Documentación del perfil GSQ: https://github.com/hyukudan/strix-halo-engine-lab/blob/main/docs/gsq-speed-profile.md
- Ficha de terceros con detalles de arquitectura: https://www.aimodels.fyi/models/huggingFace/qwen3.8-flash-next-gsq-rco-gguf-ista-daslab
- Benchmarks comunitarios de terceros: https://llm-bench.io/models/qwen3-8-flash-next-gsq-rco-gguf
