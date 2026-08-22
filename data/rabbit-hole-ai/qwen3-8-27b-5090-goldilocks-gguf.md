# Rabbit-Hole-Ai/Qwen3.8-27B-5090-goldilocks-GGUF

## Resumen

El repositorio `Rabbit-Hole-Ai/Qwen3.8-27B-5090-goldilocks-GGUF` contiene una cuantización GGUF de precisión mixta del modelo denso Qwen3.8-27B de Alibaba, diseñada específicamente para llenar por completo la memoria VRAM de una tarjeta gráfica RTX 5090 de 32 GB en un sistema Windows 11 con escritorio activo. El autor, Rabbit-Hole-Ai, parte de una cuantización base tipo Q6_K y promueve selectivamente 339 tensores a Q8_0 y 360 a F32, alcanzando un bitrate efectivo de 7.36 bpw, con el objetivo de aprovechar la VRAM sobrante en precisión en lugar de dejarla inactiva.

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención: solo 16 de sus 64 capas usan atención completa, mientras que las 48 restantes usan atención lineal con estado recurrente fijo, lo que reduce drásticamente el coste de contexto. Esta cuantización conserva la capa MTP (multi-token prediction) para habilitar decodificación especulativa en llama.cpp, y logra una divergencia KL media de 0.001678 frente al original BF16, con un 98.3 % de coincidencia en el token superior. El resultado es un modelo de 27.3 mil millones de parámetros que cabe en una GPU consumer de gama alta con contexto completo de 131 000 tokens en texto y 110 000 en modo visión, a unos 100 tokens por segundo.

La relevancia de esta ficha radica en que representa un caso práctico de cuantización "a medida" para un hardware concreto, en contraste con las cuantizaciones estándar que suelen dejar VRAM sin usar o no caben con el contexto completo. Incluye dos variantes del archivo GGUF: una construida con redondeo al más cercano (RTN) y otra optimizada con una matriz de importancia (imatrix) de Unsloth, siendo esta última la recomendada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas full attention + 48 capas linear attention/SSM (64 capas en total) |
| Parametros totales | 27 320 697 856 (27.3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 000 tokens (texto), 110 000 tokens (visión con mmproj) |
| Tipos de cuantizacion | Mezcla de Q8_0, Q6_K y F32 (7.36 bpw efectivo) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero la ficha no lo especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es el miembro denso de 27 mil millones de parámetros de la familia Qwen3.8, que comparte un backbone híbrido de atención con el modelo MoE insignia de 2.4 billones de parámetros. La capa de mezcla es la característica distintiva: solo 16 de las 64 capas ejecutan atención completa (con un intervalo de atención completa de 4), mientras que las otras 48 utilizan atención lineal con un estado recurrente constante. Esto reduce el coste de memoria del contexto a aproximadamente 43 MiB por cada 1000 tokens con KV en q8_0, lo que permite ventanas de contexto muy largas en hardware consumer.

La cuantización "Goldilocks" se construyó a partir de un mapa de sensibilidad por tensor generado con la herramienta GGUF Tool Suite de Thireus, promoviendo tensores de Q6_K a Q8_0 en un orden determinado hasta llenar exactamente el presupuesto de VRAM medido en una RTX 5090 con el escritorio de Windows 11 activo. La variante imatrix, publicada el 21 de agosto de 2026, re-cuantiza los 167 tensores Q6_K (que representan aproximadamente el 52 % de los bytes del archivo) utilizando la matriz de importancia publicada por Unsloth para Qwen3.8-27B, con 496 entradas de calibración y unos 10.2 millones de tokens. El tensor `token_embd.weight` se excluye deliberadamente del imatrix porque llama.cpp lo lee por búsqueda directa, no por multiplicación de matrices. Ambas variantes se generaron con el mismo binario de llama.cpp (build 10431, commit `1692f9e50`) para garantizar una comparación limpia de una sola variable.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base Qwen3.8-27B, que según análisis independientes supera a Claude Opus 4.6 en 15 benchmarks.
- Soporte de tool calling y function calling, propio de la familia Qwen3.8 (no confirmado explícitamente en la ficha, pero implícito en el ecosistema Qwen).
- Capacidades multimodales de visión: el repositorio incluye un proyector multimodal (mmproj) en BF16 que permite procesar imágenes con un contexto reducido a 110 000 tokens.
- Decodificación especulativa mediante la capa MTP conservada, activable en llama.cpp con la opción `--spec-type draft-mtp`.
- Multilingüismo probable (el modelo base Qwen3.8 es multilingüe), aunque la ficha no detalla los idiomas concretos.
- Alta fidelidad respecto al original BF16: divergencia KL media de 0.001678 y 98.3 % de coincidencia en el token superior.

## Casos de uso

- Ejecución local de un modelo de 27 B con contexto largo en una estación de trabajo con RTX 5090: permite procesar documentos extensos, libros completos o bases de código enteras en una sola pasada, gracias a los 131 000 tokens de contexto y al bajo coste de memoria por token de la arquitectura híbrida.
- Desarrollo de agentes autónomos con tool calling: el modelo puede integrarse en frameworks de agentes que requieran razonamiento multi-paso y llamadas a herramientas externas, ejecutándose localmente sin depender de APIs de pago.
- Generación de código en producción: con soporte de tool calling y una ventana de contexto amplia, puede asistir en tareas de programación, revisión de código y generación de documentación técnica, manteniendo los datos dentro de la infraestructura local.
- Análisis de imágenes y documentos escaneados: el modo visión con 110 000 tokens de contexto permite procesar páginas completas de documentos, diagramas técnicos o capturas de pantalla, extrayendo información estructurada.
- Investigación en IA reproducible: al ser una cuantización con metodología documentada y métricas de fidelidad publicadas, es útil para experimentos que requieran un modelo de alta calidad ejecutable en hardware asequible.
- Prototipado de aplicaciones conversacionales: con ~100 tokens por segundo en la RTX 5090, es viable para chatbots interactivos, asistentes de atención al cliente o tutores automáticos con baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card se centra en métricas de fidelidad frente al original BF16, medidas con `llama-perplexity --kl-divergence` sobre dos corpus independientes (prosa literaria y prosa científica estilo GPQA), con 143 fragmentos a contexto 512, usando llama.cpp build 10437:

| Build | Mean KLD | Median KLD | 99th pct KLD | Same-top-token |
|---|---|---|---|---|
| RTN (original) | 0.001800 | 0.000827 | 0.015519 | 98.050 % |
| Imatrix (nuevo) | 0.001678 | 0.000745 | 0.014266 | 98.278 % |

El autor advierte que la mejora del imatrix es real pero pequeña: la mediana de KLD baja aproximadamente un 10 % en ambos corpus, y las seis lecturas de KLD (media, mediana y percentil 99 en dos corpus) se mueven en la misma dirección sin regresiones. Sin embargo, en términos de comportamiento práctico es casi invisible, con un aumento de solo 0.23 puntos porcentuales en la coincidencia del token superior en uno de los corpus. El rendimiento medido en la RTX 5090 es de aproximadamente 100 tokens por segundo en generación de texto con la configuración de servidor descrita.

## Requisitos de hardware

- GPU específica: RTX 5090 con 32 GB de VRAM (la cuantización está dimensionada para llenar exactamente esta memoria con el escritorio de Windows 11 activo).
- VRAM utilizada: 30 715 MiB en modo texto (contexto 131 000) y 30 949 MiB en modo visión (contexto 110 000), sobre un total de 32 607 MiB disponibles, dejando un margen libre de 1 892 MiB y 1 658 MiB respectivamente.
- No cabe en GPUs de 24 GB: aunque el modelo base Qwen3.8-27B puede ejecutarse en 24 GB con cuantizaciones estándar, esta variante específica está optimizada para 32 GB y no se recomienda su uso en hardware inferior.
- Sistema operativo: Windows 11 (el autor midió el consumo de VRAM con el compositor de escritorio activo; en Linux el margen podría ser ligeramente mayor).
- Backend de inferencia: llama.cpp (build 10431 o superior), con soporte para decodificación especulativa MTP mediante `--spec-type draft-mtp`. También es compatible con servidores que acepten GGUF, aunque no se menciona explícitamente vLLM o TGI.
- Latencia y throughput: aproximadamente 100 tokens por segundo en generación de texto, medido en la RTX 5090 con la configuración de servidor indicada.

## Comparativa con modelos similares

La informacion disponible no incluye una comparativa directa con otros modelos de la misma categoria. No obstante, se puede contextualizar frente a otras cuantizaciones del mismo modelo base:

| Variante | Bitrate efectivo | Tamano de pesos | KLD media vs BF16 | Uso de VRAM |
|---|---|---|---|---|
| Qwen3.8-27B BF16 (referencia) | 16 bpw | ~54.6 GiB | 0 | No cabe en 32 GB con contexto completo |
| Q6_K estandar | ~6.6 bpw | ~22.9-23.8 GiB | No medido en esta ficha | Deja VRAM sin usar en una 5090 |
| Goldilocks RTN | 7.36 bpw | 23 990 MiB | 0.001800 | Llena la VRAM de la 5090 |
| Goldilocks imatrix | 7.36 bpw | 23 990 MiB | 0.001678 | Llena la VRAM de la 5090 |

Frente a otros modelos de 27 B como Llama 3.3 70B (no comparable por tamano) o Mistral Large 2, no se dispone de datos de rendimiento en esta ficha. La ventaja principal de esta cuantizacion es su ajuste fino al hardware objetivo, que permite mayor precision por byte que una Q6_K estandar sin sacrificar contexto.

## Limitaciones y advertencias

- La cuantizacion esta disenada exclusivamente para una RTX 5090 de 32 GB en Windows 11; en otros entornos (Linux, GPUs con menos VRAM, o con el escritorio en resoluciones altas) el margen de VRAM puede variar y provocar fallos de memoria.
- No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K) para esta cuantizacion; las metricas de fidelidad (KLD) no garantizan un rendimiento identico al BF16 en tareas especificas.
- El autor advierte que la aplicacion de imatrix a Q6_K es un punto de datos unico y no debe generalizarse como superior a otras tecnicas de cuantizacion en bitrates bajos; la evidencia mas solida del imatrix esta en Q2-Q4.
- El modo vision a 118 000 tokens fue medido y rechazado por romper el margen de seguridad de 1.5 GiB; no se debe superar el contexto de 110 000 tokens con el mmproj cargado.
- El modelo base Qwen3.8-27B puede presentar sesgos y alucinaciones propios de los modelos de lenguaje grandes; esta cuantizacion no los corrige.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales de uso aceptable (no especificadas en la ficha).
- Al ser una cuantizacion mixta no estandar, es posible que algunos backends o herramientas de inferencia no la reconozcan correctamente; se recomienda usar llama.cpp build 10431 o superior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rabbit-Hole-Ai/Qwen3.8-27B-5090-goldilocks-GGUF
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Analisis tecnico de Qwen3.8-27B (Local AI Zone): https://local-ai-zone.github.io/blog/qwen3-8-27b-comprehensive-analysis.html
- Guia para ejecutar Qwen3.8-27B localmente: https://linas.substack.com/p/qwen3-8-27b-local-guide
