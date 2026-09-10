# RentedNoodle/Qwen3.8-27B-OrcaRouter-GSQ-RCO-IQ3_XXS-Uncensored

## Resumen

El modelo `Qwen3.8-27B-OrcaRouter-GSQ-RCO-IQ3_XXS-Uncensored` es una cuantización GGUF de 3 bits del checkpoint uncensored `orcarouter/Qwen3.8-27B-Uncensored`, creada por `RentedNoodle`. El modelo base deriva de `Qwen/Qwen3.8-27B`, un transformer multimodal con soporte de razonamiento, tool calling y visión. La cuantización aplica la metodología GSQ/RCO de ISTA-DASLab con una matriz de importancia personalizada, y además se entrena una cabeza de borrador MTP (Multi-Token Prediction) para decodificación especulativa.

Con 27.320.697.856 parámetros, el archivo GGUF ocupa 9.75 GiB y está diseñado para ejecutarse en una GPU de 16 GB, como una RTX 5070 Ti. El modelo ofrece una ventana de contexto nativa de 262K tokens, aunque el perfil de despliegue recomendado es de 32K. Su relevancia radica en que combina capacidades multimodales, tool calling y un contexto largo en un formato ligero para hardware de consumo, reduciendo el comportamiento de rechazo mediante técnicas de "uncensoring". El autor advierte que es una cuantización, no un nuevo fine-tune, y que no garantiza cumplimiento universal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: `Qwen/Qwen3.8-27B`) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | 262K nativo; perfil de despliegue 32K |
| Tipos de cuantizacion | IQ3_XXS (trunk, ~3.06 bpw); Q6_K (cabeza MTP); mmproj BF16 o Q8_0 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyectores de visión en safetensors) |
| Tamano del archivo GGUF | 10.466.439.424 bytes (9.75 GiB) |
| Plantilla de chat | `froggeric-qwen3.8-tool-use.jinja` (header `qwen3.8-froggeric-v22.5`) |

## Arquitectura y entrenamiento

El modelo es esencialmente una cuantización de `orcarouter/Qwen3.8-27B-Uncensored`, que a su vez parte de `Qwen/Qwen3.8-27B`. No se dispone de información pública sobre los detalles arquitectónicos internos de la base más allá de ser un transformer multimodal con soporte de razonamiento y tool calling, ni sobre el número de tokens o la composición del dataset de entrenamiento original. El proceso de "uncensoring" se ha realizado mediante OrcaRouter, que modifica el comportamiento de rechazo aprendido, pero no se documenta si se utilizó RLHF, DPO u otras técnicas de alineación.

La cuantización sigue la metodología GSQ/RCO (non-uniform allocation) de ISTA-DASLab, aplicada al checkpoint uncensored. Se construyó una matriz de importancia (imatrix) personalizada para OrcaRouter, y se entrenó en fase S1 una cabeza de borrador MTP para decodificación especulativa, preservando las normas F32. El autor indica que no reprodujo de forma independiente la búsqueda de presupuesto multi-GPU de ISTA, sino que aplicó el mapa de asignación per-tensor publicado sobre la base uncensored.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (`thinking mode`), configurable mediante `--reasoning-budget 256`.
- Tool calling / function calling en formato JSON, validado en una suite de 14 casos con una tasa de éxito de 9/14.
- Soporte de agentes y razonamiento multi-paso, incluyendo encadenamiento de herramientas, aunque la suite muestra fallos en algunos casos de cadena.
- Capacidades multimodales de visión: el repo incluye proyectores `mmproj/` en BF16 o Q8_0, lo que permite entradas imagen-texto.
- Contexto largo: ventana nativa de 262K tokens, con recuperación de aguja verificada sobre un pajar de 15.000 palabras (6/6 exact match) en el perfil de 32K.
- Decodificación especulativa mediante una cabeza de borrador MTP entrenada en S1, con mejoras de tasa de aceptación (+12,4%) y throughput (+13,6%) frente a un build con imatrix de ISTA.
- Baja tasa de sobre-rechazo: 0% en XSTest safe (250 prompts).
- Idiomas: inglés y chino.

## Casos de uso

- Atención al cliente automatizada con contexto largo y multimodal: el modelo gestiona conversaciones con imágenes adjuntas y mantiene coherencia en ventanas de 32K tokens, utilizando tool calling para consultar bases de datos internas.
- Asistente de desarrollo con herramientas de shell: puede invocar comandos bash, grep o editar archivos; se integra en pipelines CI/CD como agente, aunque se deben validar manualmente los casos de cadena que fallan.
- Análisis de documentos científicos y técnicos: con GPQA-Diamond 75,25% en modo razonamiento, es adecuado para tareas de investigación que requieren razonamiento extenso y un presupuesto de tokens generoso.
- Despliegue local de una API compatible con OpenAI en una GPU de 16 GB: usando `llama-server` con el archivo GGUF y la plantilla Froggeric, se puede servir a equipos de desarrollo sin depender de la nube.
- Recuperación de información en documentos extensos: verificado con needle retrieval sobre un pajar de 15K palabras; requiere `-b 2048` para mantener fidelidad en profundidad 0.5.
- Investigación en alineación y seguridad de IA: al ser un modelo uncensored con 0% de sobre-rechazo, permite estudiar comportamientos de rechazo y sesgos en un entorno controlado, sin respuestas negativas excesivas.
- Generación de informes y resúmenes multimodales: al combinar visión y texto, puede analizar capturas de pantalla, diagramas o imágenes y producir resúmenes en inglés o chino.
- Pruebas de decodificación especulativa en producción: la cabeza MTP permite optimizar el throughput en servidores llama.cpp, con ganancias mensurables frente a otras builds.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Benchmark | Resultado | Configuracion |
|---|---|---|
| Needle retrieval (15K palabras) | 6/6 exact-match | Profundidades 0.1–0.9, temp 0.0 |
| Tool call JSON (suite completa 14 casos) | 9/14 pass-rate | Fallos en tc-04, tc-07, tc-08, tcc-01, tcc-02 |
| GPQA-Diamond | 75,25% accuracy | Thinking ON, temp 0, 198 preguntas, harness-conditional |
| WikiText-2 (test) | 6,17 perplexity | Archivo orcaim |
| IFEval | 70,24% prompt-strict / 76,26% instruction-strict | Sin detalle adicional |
| TruthfulQA | MC1 77,60% / MC2 81,98% | Logprob MCQ |
| XSTest safe (250 prompts) | 0% over-refusal | Tasa de sobre-rechazo |

Benchmarks de la cabeza MTP:

| Metrica | Resultado |
|---|---|
| Offline k1 (S1 vs cabeza nativa) | 0,79 vs 0,51 (+0,278) |
| Tasa de aceptacion de draft en servidor vs build ISTA-imatrix | +12,4% |
| Throughput de servidor vs build ISTA-imatrix | +13,6% |

## Requisitos de hardware

- VRAM minima estimada: 16 GB para ejecutar el archivo GGUF completo con `-ngl 99` y contexto 32K.
- GPU recomendadas: RTX 5070 Ti 16 GB (probada por el autor). Es compatible con GPU de consumo de 16 GB.
- Cuantizacion ya incluida: IQ3_XXS (~3.06 bpw) en el trunk y Q6_K en la cabeza MTP, con un tamaño de 9.75 GiB.
- Opciones de despliegue: `llama-server` y `llama.cpp` (build personalizada `den_llama.cpp`). También se admite el modo multimodal con `mmproj`. No se mencionan vLLM, Ollama ni TGI.
- Comando de ejecucion recomendado:
  ```
  llama-server -m Qwen3.8-27B-OrcaRouter-GSQ-RCO-IQ3_XXS-v2.0.gguf --alias Qwen3.8-27B-OrcaRouter-GSQ-RCO-IQ3_XXS-Uncensored --jinja --chat-template-file froggeric-qwen3.8-tool-use.jinja --ctx-size 32768 -b 2048 -ub 2048 -fa on -ngl 99 --reasoning-budget 256 --spec-type draft-mtp --spec-draft-n-max 2
  ```
- Latencia y throughput absolutos: no disponible. Solo se informan ganancias relativas del +13,6% en throughput frente a otra build, en la misma sesión.

## Comparativa con modelos similares

| Modelo | Base | Contexto | Cuantizacion | Licencia | VRAM estimada | Notas |
|---|---|---|---|---|---|---|
| RentedNoodle/Qwen3.8-27B-OrcaRouter-GSQ-RCO-IQ3_XXS-Uncensored | Qwen3.8-27B | 262K (recomendado 32K) | IQ3_XXS + MTP Q6_K | Apache 2.0 | ~16 GB | Uncensored, vision, tool calling, decodificacion especulativa |
| orcarouter/Qwen3.8-27B-Uncensored | Qwen3.8-27B | 262K | Sin cuantizar (safetensors) | Apache 2.0 | >32 GB | Modelo base de referencia, sin cuantizacion |
| Build con imatrix de ISTA-DASLab (GGUF) | Qwen3.8-27B | 262K | IQ3_XXS (stock) | Segun proyecto ISTA | ~16 GB | Comparado en la model card: menor throughput de servidor y menor tasa de aceptacion de draft |

No se dispone de mas modelos comparables con datos de benchmarks publicos.

## Limitaciones y advertencias

- Se trata de una cuantizacion de un checkpoint uncensored, no de un fine-tune nuevo. El autor advierte que no garantiza cumplimiento universal y que el responsable del despliegue debe asegurar el uso conforme a la legislacion y a los terminos de uso.
- El comportamiento de rechazo reducido (0% over-refusal en XSTest) puede implicar que el modelo genere contenido danino si no se implementan salvaguardas adicionales.
- La tasa de exito en tool calling es limitada: 9/14 en la suite completa; falla en casos de bash vs grep, noparse, read vs edit y encadenamiento de herramientas. No es fiable para agentes de produccion sin una capa de validacion externa.
- La ventana de contexto nativa es de 262K tokens, pero el perfil de despliegue recomendado es de 32K y la recuperacion de aguja solo se verifico sobre un pajar de 15K palabras. No se han verificado longitudes mayores.
- Se requiere la plantilla Froggeric especifica (`froggeric-qwen3.8-tool-use.jinja`) y el parametro `-b 2048` para mantener la fidelidad en recuperacion; usar un batch inferior degrada la recuperacion en profundidad 0.5.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el modelo de datos).
- Soporte idiomatico limitado a ingles y chino; no se ha evaluado el rendimiento en castellano ni en otras lenguas.
- El archivo GGUF puede no ser compatible con builds estandar de llama.cpp; se recomienda la build `den_llama.cpp` mencionada por el autor.
- No se proporcionan datos de latencia absoluta, tokens por segundo ni consumo de VRAM pormenorizado mas alla de la capacidad de 16 GB.

## Enlaces

- HuggingFace: https://huggingface.co/RentedNoodle/Qwen3.8-27B-OrcaRouter-GSQ-RCO-IQ3_XXS-Uncensored
- Repositorio llama.cpp de RentedNoodle: https://github.com/RentedNoodle/den_llama.cpp
- Modelo base (OrcaRouter): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B (referenciado en la model card, no se ha confirmado su existencia)
- Papers mencionados en los tags: https://arxiv.org/abs/2604.18556 y https://arxiv.org/abs/2605.00649 (contenido no verificado)
- Metodologia GSQ/RCO de ISTA-DASLab: mencionada en la model card sin enlace directo; no disponible.
