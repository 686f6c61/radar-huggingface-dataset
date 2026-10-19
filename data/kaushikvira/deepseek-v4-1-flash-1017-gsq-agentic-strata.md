# kaushikvira/DeepSeek-V4.1-Flash-1017-GSQ-agentic-strata

## Resumen

`kaushikvira/DeepSeek-V4.1-Flash-1017-GSQ-agentic-strata` es una cuantización de precisión mixta del modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017`, un MoE de 763,2 B de parámetros (variante más grande de la familia DeepSeek V4.1 Flash) con pesos densos en FP8 y expertos en NVFP4. La cuantización la firma el usuario kaushikvira aplicando el método GSQ (Gumbel-Softmax Quantization) y el pipeline de asignación de precisión por experto de antirez, y está empaquetada para el motor **strata**, un fork de Xolotl. El artefacto resultante ocupa un presupuesto fijo de 153 GiB.

La particularidad es que no se trata de un GGUF estándar: cada una de las ~30.720 proyecciones de experto recibe su propio nivel de precisión (Q3_K, Q2_0 o ternario) a partir de estadísticas de activación recogidas sobre un corpus calibrado hacia cargas de trabajo agénticas y de código. Los expertos "calientes" se quedan en Q3_K y residen en VRAM; los menos sensibles se comprimen a ternario y se ejecutan en CPU. El resultado se sirve con 512K tokens de contexto y caché KV en FP4 sobre una única GPU de 72 GB, con los expertos fríos en una arena de RAM pinned.

Es relevante ahora por dos motivos: demuestra que un modelo de 763 B puede servirse en hardware de una sola tarjeta mediante cuantización calibrada por carga de trabajo, y publica todo el pipeline (Xolotl/tools/v41) de forma reproducible. Conviene tener presente que es un artefacto de terceros, sin benchmarks publicados y dependiente de un motor no estándar.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base: denso en FP8 + expertos en NVFP4); 40 capas (L0–L39) más cabeza; capas de memoria Engram en L1 y L14 |
| Parámetros totales | 763,2 B (MoE, según model card y tags del modelo base). Los metadatos safetensors del repo declaran 14.710.631.010 parámetros, discrepancia no explicada en la información disponible |
| Parámetros activos | no disponible (la model card indica ~6 expertos activos por capa, sin desglose de parámetros) |
| Longitud de contexto | 512K tokens (con caché KV en FP4) |
| Tipos de cuantización | Mezcla por experto: Q3_K (3,44 bpw), Q2_0 (2,25 bpw) y ternario (1,69 bpw, almacenado como `scale × mask ⊙ sign` y ejecutado en CPU); sidecar DSpark en Q2_K; caché KV en FP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada por el cuantizador; la licencia del modelo base no se detalla en la información disponible) |
| Formato de pesos | GGUF específico de strata (no compatible con llama.cpp), más safetensors en el repo; incluye `rank.bin` (ranking de expertos), capas Engram extraídas a disco y sidecar DSpark |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos: capas densas en FP8 y proyecciones de experto en NVFP4, 40 capas más cabeza, con dos capas de memoria n-gram Engram (L1 y L14) y una pila DSpark de decodificación especulativa que combina MTP y visión, recuantizada a Q2_K en un sidecar de 5,3 GiB. Sobre ese material no hay fine-tuning ni abliteration: el trabajo es exclusivamente de cuantización.

El pipeline, abierto en `Xolotl/tools/v41`, consta de ocho pasos: descarga del checkpoint 1017; construcción de un corpus de calibración de 32 secuencias × 8.192 tokens (262.144 tokens en total) con mezcla agentic_long 10, code 10, agent 5, reasoning 3, web 2, chat 1 y multi 1, a partir de los prompts imatrix de `antirez/ds4` y de trayectorias públicas de SWE-agent (SWE-rebench de Nebius, SWE-Hero de NVIDIA y SWE-smith), re-renderizadas en el formato de tool-calling del motor; forward del profesor con streaming por capas usando el `model.py` oficial de DeepSeek para recoger estadísticas de activación por proyección de experto (41 ficheros: L0–L39 más cabeza); asignación de niveles bajo restricción de presupuesto —ternario limitado a 0,5 por capa, gate+up y down asignados por separado (`per_proj`), capas de borde ponderadas ×2 y expertos con menos de 8 tokens de validación fijados a Q2_0—; cuantización GSQ; recuantización del sidecar; generación del ranking de popularidad de expertos (15.360 pares); y extracción de las capas Engram.

El reparto final, por número de proyecciones, es 28,4 % en Q3_K, 38,4 % en Q2_0 y 33,2 % en ternario. Por bytes la distribución es 41 % Q3_K (~63 GiB), 38 % Q2_0 (~57 GiB) y 21 % ternario (~32 GiB), lo que concentra la precisión en los expertos calientes. Con el mismo presupuesto de 153 GiB, el error de cuantización proxy baja de 2,169 (todo en Q2_0) a 1,680, un 23 % menos. El autor justifica el tamaño como palanca de velocidad: la decodificación está limitada por ancho de banda de memoria y cada token recupera unos 6 expertos activos por capa.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base.
- Generación y edición de código, con calibración explícita sobre corpus de código y trayectorias de tipo SWE.
- Tool calling y uso de esquemas de herramientas: el corpus de calibración se re-renderiza en el formato de tool-calling del motor, de modo que el mapa de niveles protege las rutas de experto que esas tareas ejercitan.
- Flujos agénticos multi-paso, incluidos los que encadenan llamadas a herramientas y observaciones intermedias.
- Contexto largo de 512K tokens con caché KV en FP4, adecuado para repositorios o historiales extensos.
- Decodificación especulativa mediante el sidecar DSpark (MTP + visión), recuantizado a Q2_K.
- Memoria n-gram Engram en L1 y L14, extraída a disco y gestionada por strata.
- Capacidades multilingües: no disponible (los idiomas no se declaran).
- Capacidades de visión en el artefacto servido: no disponibles (la pila DSpark incluye un componente de visión, pero la model card no detalla su comportamiento tras la cuantización).

## Casos de uso

- Reparación de issues en repositorios (estilo SWE-bench): el modelo puede recibir el árbol relevante, trazas de test y esquemas de herramientas en una ventana de 512K tokens, y la calibración sobre SWE-rebench, SWE-Hero y SWE-smith protege precisamente las rutas de experto que se activan en estas tareas.
- Asistente de código integrado en CI/CD: al soportar tool calling y formato de esquema, puede invocarse desde pipelines para revisar diffs, proponer parches y ejecutar comprobaciones dentro de un bucle agéntico.
- Análisis de monorepos y auditorías de código: la ventana de 512K tokens permite cargar varios módulos y su historial sin trocear el contexto, algo que la mayoría de modelos abiertos de este tamaño no permiten.
- Despliegue on-premise en una sola GPU de 72 GB: con los expertos fríos en una arena de RAM pinned y los ternarios en CPU, una estación de trabajo con una RTX Pro 5000 Blackwell puede servir el modelo completo sin clúster, lo que encaja en laboratorios y equipos con requisitos de soberanía de datos.
- Investigación en cuantización: el pipeline y el mapa de niveles son reproducibles y públicos, de modo que el artefacto sirve como punto de partida para estudiar la relación entre precisión por experto, error proxy y calidad downstream en MoE de gran tamaño.
- Servicio de agentes con throughput limitado por memoria: dado que la decodificación es memory-bound, reducir el artefacto a 153 GiB reduce los bytes movidos por token; útil en escenarios de muchas sesiones concurrentes de agentes con requisitos de latencia moderados.
- Evaluación comparativa de motores: sirve para medir en condiciones reales el rendimiento de strata frente a motores estándar sobre el mismo modelo base, siempre que se disponga del checkpoint original en FP8/NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de calidad es el error de cuantización proxy interno: 1,680 para este mapa mixto frente a 2,169 para un reparto homogéneo en Q2_0 con el mismo presupuesto de 153 GiB (reducción del 23 %). No hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones agénticas para este artefacto, ni comparación con el modelo base sin cuantizar.

## Requisitos de hardware

- Pesos principales: 153 GiB (GGUF de strata). Sidecar DSpark: 5,3 GiB adicionales. Hay que sumar el espacio de las capas Engram y de `rank.bin`.
- Descarga: el repositorio completo ocupa 382,8 GB, muy por encima del artefacto servible; conviene planificar el almacenamiento en consecuencia.
- GPU: una única tarjeta de 72 GB basta para servir el modelo completo según el autor (los expertos fríos se descargan a RAM). El tag del repo apunta a RTX Pro 5000 Blackwell.
- Memoria del sistema: debe alojar la arena pinned con los expertos fríos y los expertos ternarios que se ejecutan en CPU; el espacio necesario es la diferencia entre los 153 GiB y la VRAM ocupada por los expertos calientes, más el margen del runtime (cifra exacta no disponible).
- GPU de consumo: no cabe en tarjetas de 24 GB o 48 GB tal como se describe el diseño; el requisito declarado es una GPU de 72 GB más RAM de sistema suficiente.
- Despliegue: exclusivamente mediante el motor strata (`tools/v41/serve/serve_ds41.py`, función `ds41_generate`). No es compatible con llama.cpp, Ollama, vLLM ni TGI, al no ser un GGUF estándar (mapa de niveles por experto, capas Engram, `rank.bin` y sidecar DSpark son específicos de strata).
- Latencia y throughput: no disponibles. El autor solo indica cualitativamente que la decodificación está limitada por ancho de banda de memoria y que reducir el tamaño del artefacto aumenta los tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Licencia | Motor |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base) | 763,2 B MoE | no disponible | FP8 denso / NVFP4 expertos | no disponible | no disponible en esta ficha | no disponible |
| Este artefacto (GSQ mixto) | 763,2 B MoE (metadatos safetensors: 14,71 B) | 512K | Q3_K / Q2_0 / ternario por experto + sidecar Q2_K | 153 GiB + 5,3 GiB | MIT | strata (Xolotl) |
| Variante de referencia all-Q2_0 (mismo presupuesto, no publicada como artefacto) | 763,2 B MoE | 512K | Q2_0 homogéneo | 153 GiB | MIT | strata (Xolotl) |

No se dispone de datos de otras cuantizaciones comparables del mismo modelo base (por ejemplo, GGUF estándar para llama.cpp) en la información proporcionada, ni de resultados de calidad que permitan comparar más allá del error proxy declarado por el autor.

## Limitaciones y advertencias

- Compatibilidad restringida: no es un GGUF estándar. Requiere el motor strata y sus artefactos auxiliares; no funcionará en llama.cpp, Ollama, vLLM ni TGI sin conversión, que no está documentada.
- Ausencia total de benchmarks: la única métrica de calidad es un error de cuantización proxy (1,680 frente a 2,169). Esa cifra no equivale a calidad downstream y no cubre razonamiento, código ni tool calling reales.
- Discrepancia de parámetros: los metadatos safetensors del repo declaran 14.710.631.010 parámetros frente a los 763,2 B que indican la model card y los tags. No se explica en la información disponible y conviene verificarla antes de dimensionar hardware.
- Calibración sesgada al dominio: el corpus está ponderado hacia agentic y código (20 de 32 secuencias entre agentic_long y code). El rendimiento en prosa creativa, traducción, matemáticas puras o conversación general puede degradarse más de lo que el error proxy sugiere.
- Idiomas no declarados: no hay información sobre competencia multilingüe ni sobre el comportamiento fuera del inglés técnico predominante en los corpus de calibración.
- Riesgo de alucinación: inherente al modelo base y no evaluado para este artefacto; en tareas agénticas con tool calling el riesgo se amplifica porque los errores se propagan a acciones.
- Ejecución ternaria en CPU: parte de los expertos (33 % de las proyecciones, 21 % de los bytes) se ejecuta en CPU, lo que introduce dependencia del ancho de banda de RAM y de la configuración de la arena pinned; el rendimiento puede degradarse de forma abrupta si la RAM es insuficiente.
- Licencia: el cuantizador declara MIT, pero no se detalla la licencia del modelo base. Conviene verificar los términos de DeepSeek-V4.1-Flash-1017 antes de un uso comercial.
- Madurez: artefacto de un autor individual, con 397 descargas y 14 likes en el momento de la consulta, sin validación independiente conocida. No es una cuantización oficial de DeepSeek-AI.
- Documentación incompleta: la model card referencia una sección "Engines it runs on" que no aparece en el contenido disponible, y el texto se corta en el apartado que justifica el presupuesto de 153 GiB.
- Coste de almacenamiento: 382,8 GB de repositorio para un artefacto servible de 153 GiB más sidecar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaushikvira/DeepSeek-V4.1-Flash-1017-GSQ-agentic-strata
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Método GSQ y pipeline de antirez: https://github.com/antirez/ds4
- Motor strata (fork de Xolotl): https://github.com/Indras-Mirror/Xolotl
- Pipeline de cuantización: https://github.com/Indras-Mirror/Xolotl/tree/main/tools/v41
- Script de servicio: `tools/v41/serve/serve_ds41.py` (dentro del repositorio de Xolotl)
- Datasets de calibración citados (sin URL en la model card): imatrix prompts de `antirez/ds4`, SWE-rebench (Nebius), SWE-Hero (NVIDIA), SWE-smith
