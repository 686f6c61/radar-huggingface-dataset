# Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010_r05

## Resumen

`Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010_r05` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante SVD-LLM hasta eliminar el 50,01 % de los parámetros densos y posteriormente editado con 5 de las 10 rondas previstas de una rutina de intercambio iterativo de componentes ("parameter-neutral swap") guiada por la regla de selección `disc_iter`. El presupuesto total de restauración del experimento completo es del 1,000 % de los parámetros densos, repartido en fragmentos del 0,100 % por ronda; este repositorio contiene un checkpoint intermedio de esa ejecución, con 3.265 componentes restaurados y 3.265 expulsados.

No se trata de un modelo conversacional de propósito general, sino de un artefacto de investigación orientado a cuantificar cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM alineado y qué reglas de selección de componentes lo reparan mejor. El autor lo describe explícitamente como una celda de una malla experimental sobre reglas de selección y presupuestos, y advierte que algunas ramas de esa malla están degradadas deliberadamente en seguridad respecto al modelo base.

Su relevancia es metodológica: acompaña métricas de ataque y de utilidad (AdvBench ASR 0,3712; StrongREJECT ASR 0,3291; sobre-rechazo macro 0,0929 según WildGuard) que permiten estudiar el compromiso seguridad/utilidad en modelos comprimidos. La arquitectura subyacente es la de Llama 2 (transformer decoder-only) y el repositorio publica únicamente pesos en `safetensors` bajo la licencia Llama 2 Community.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con compresión SVD-LLM aplicada a las matrices de proyección |
| Parámetros totales | 6.738.415.616 (recuento real de los `safetensors`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat; no se especifica en la model card) |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos sin cuantizar; no hay GGUF ni GPTQ/AWQ) |
| Idiomas soportados | No disponible (el modelo base se entrenó predominantemente en inglés) |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | `safetensors` (librería `transformers`; tamaño del repo: 13,5 GB) |

Datos adicionales de procedencia declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base (sin comprimir) | `meta-llama/Llama-2-7b-chat-hf` |
| Compresión | SVD-LLM, 50,01 % de parámetros eliminados |
| Regla de selección | `disc_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos |
| Componentes restaurados / expulsados | 3265 / 3265 |
| Fracción de parámetros resultante | 0,4999 |
| Semilla | 42 |
| Rondas iterativas aplicadas | 5 de 10 |
| Fragmento por ronda | 0,100 % de los parámetros densos |
| Parámetros insertados | 32.366.336 (0,50 % de los parámetros de proyección densos) |
| Valor de intercambio | `insert` (solo valor de inserción; expulsión ordenada por sigma) |
| Escala de inserción | 0,5 |
| Tipo de checkpoint | Ronda intermedia de una ejecución más larga |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 2: un transformer decoder-only de 7B parámetros con normalización RMSNorm, activación SwiGLU, atención con RoPE y sin sesgos en las proyecciones. Sobre ese modelo no se ha realizado un entrenamiento nuevo: la intervención consiste en una compresión SVD-LLM que descompone las matrices de proyección y descarta componentes singulares hasta retirar el 50,01 % de los parámetros densos. Después se aplica una rutina de edición iterativa de tipo "parameter-neutral swap": en cada ronda se insertan componentes (32.366.336 parámetros en total, el 0,50 % de las proyecciones densas) con valor `insert` y escala 0,5, y se expulsan otros tantos siguiendo un criterio de ordenación por sigma, de modo que el presupuesto de parámetros se mantiene constante entre rondas.

El resultado declarado es una fracción de parámetros de 0,4999 tras 5 rondas de las 10 previstas, con semilla 42. La regla de selección evaluada en este checkpoint es `disc_iter`. No se documentan en la información disponible el dataset de entrenamiento, el número de tokens, ni fases de RLHF o DPO posteriores a la compresión: la alineación del modelo procede íntegramente del checkpoint Llama-2-7b-chat original, y el trabajo experimental se limita a comprimir y restaurar componentes.

Conviene señalar una discrepancia técnica: el recuento de parámetros de los `safetensors` (6.738.415.616) coincide exactamente con el de Llama-2-7b-chat sin comprimir, pese a que la model card declara una fracción de parámetros resultante de 0,4999. La model card no especifica cómo se materializa la compresión en el checkpoint distribuido (reconstrucción densa con pérdida, almacenamiento de factores o kernels específicos), por lo que este punto debe verificarse antes de reutilizar los pesos.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del checkpoint Llama-2-7b-chat, aunque degradadas por la compresión y por el proceso de edición de componentes.
- Razonamiento y respuesta a instrucciones en formato de diálogo (`[INST] ... [/INST]`), con la plantilla de Llama 2.
- Capacidades multilingües: no declaradas; el modelo base está orientado principalmente al inglés.
- Tool calling / function calling: no soportado de forma nativa (Llama 2 no incluye un formato de herramientas entrenado).
- Uso como agente o razonamiento multi-paso: no documentado ni evaluado en la información disponible.
- Modo "thinking": no disponible.
- Visión o audio: no soportados (modelo exclusivamente de texto).
- Capacidad instrumental relevante: servir como sujeto experimental para medir tasas de éxito de ataque (ASR) con jueces tipo HarmBench y tasas de sobre-rechazo con WildGuard.
- Compatibilidad declarada con Text Generation Inference (`text-generation-inference`, `endpoints_compatible` en los tags).

## Casos de uso

- Evaluación de seguridad bajo compresión: emplear el checkpoint como sujeto en arneses de red-teaming (HarmBench, StrongREJECT) para medir cómo varía el ASR al comparar la celda comprimida con el Llama-2-7b-chat original; los valores ya publicados (0,3712 y 0,3291) sirven como referencia de partida.
- Estudio de la curva de recuperación por rondas: al ser un checkpoint intermedio (5 de 10 rondas), permite trazar la evolución del ASR y del sobre-rechazo ronda a ronda frente a la versión final del mismo brazo experimental.
- Ablación de reglas de selección de componentes: comparar `disc_iter` con las demás reglas del grid del autor manteniendo fijo el presupuesto (1,000 %) y la semilla (42) para aislar el efecto de la heurística de selección.
- Investigación en interpretabilidad: analizar qué direcciones o componentes singulares concretos sostienen el comportamiento de rechazo, aprovechando que el experimento registra explícitamente los 3.265 componentes restaurados y los 3.265 expulsados.
- Medición del sobre-rechazo: usar la métrica macro de sobre-rechazo sobre WildGuard (0,0929) para cuantificar el coste en utilidad de las intervenciones de seguridad, un eje habitualmente menos estudiado que el ASR.
- Docencia y reproducibilidad metodológica: servir de ejemplo reproducible de pipeline compresión → edición → evaluación, con semilla y presupuesto documentados, en cursos o trabajos sobre eficiencia y alineación.
- Base para experimentos de recuperación posterior: aplicar SFT o DPO sobre el checkpoint comprimido para comprobar si la alineación se recupera sin restaurar parámetros, comparando con el modelo denso como control.
- Auditoría de artefactos publicados: verificar la coherencia entre las métricas declaradas, el recuento de parámetros del repositorio y el tamaño del checkpoint antes de reutilizarlo en cualquier estudio.

## Benchmarks y rendimiento

| Métrica | Valor | Juez / protocolo | Referencia del modelo base |
|---|---|---|---|
| AdvBench ASR | 0,3712 | HarmBench judge | No disponible |
| StrongREJECT ASR | 0,3291 | HarmBench judge | No disponible |
| Macro over-refusal | 0,0929 | WildGuard | No disponible |

No se han publicado en la información disponible resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K, MT-Bench u otros), ni los valores de referencia del Llama-2-7b-chat sin comprimir con los que interpretar la degradación.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos propios a partir de los 6,74 B de parámetros; no confirmados por el autor): ~13,5 GB en fp16/bf16, ~7 GB en int8, ~3,8-4,5 GB en 4 bits.
- GPU de datacenter: A100 40/80 GB, H100, L40S; con fp16 el modelo ocupa un único dispositivo de 16 GB o más sin problemas de memoria.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (24/16 GB) en fp16; en tarjetas de 12 GB (RTX 3060, RTX 4070) requiere cuantización de 8 o 4 bits; en 8 GB solo con cuantización agresiva.
- Opciones de despliegue: `transformers` (soporte garantizado por la librería declarada) y Text Generation Inference (el tag `text-generation-inference` y `endpoints_compatible` así lo indican). vLLM, llama.cpp, Ollama y TGI con kernels optimizados requieren verificar la compatibilidad con la estructura comprimida del checkpoint, que no está documentada; no se publican pesos GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Datos de seguridad | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-l2_remove50_swapdisc_a050_b010_r05`) | 6,74 B (fracción declarada 0,4999) | 4096 tokens | Llama 2 Community | AdvBench ASR 0,3712; StrongREJECT ASR 0,3291; sobre-rechazo 0,0929 | HuggingFace, 0 descargas, 0 likes |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | 6,74 B | 4096 tokens | Llama 2 Community | No disponible en esta información | HuggingFace, ampliamente utilizado |
| Otras celdas del grid del mismo autor | No disponible | No disponible | Llama 2 Community | No disponible | No disponible |
| `mistralai/Mistral-7B-Instruct-v0.2` (alternativa de categoría) | ~7,24 B | 32.768 tokens | Apache 2.0 | No disponible | HuggingFace |
| `meta-llama/Llama-3.1-8B-Instruct` (alternativa de categoría) | ~8,03 B | 131.072 tokens | Llama 3.1 Community | No disponible | HuggingFace |

Nota: los datos de Mistral-7B-Instruct-v0.2 y Llama-3.1-8B-Instruct proceden de la documentación pública de esos proyectos y no de la información proporcionada en esta búsqueda; se incluyen únicamente como referencia de categoría. No se dispone de comparativas publicadas de calidad o seguridad entre este checkpoint y dichas alternativas.

## Limitaciones y advertencias

- No es un modelo desplegable: el propio autor indica explícitamente que debe tratarse como sujeto experimental y no como asistente de propósito general.
- Seguridad degradada por diseño en varias ramas del experimento: la compresión por sí sola eleva la tasa de éxito de ataques, y este checkpoint muestra un ASR de 0,3712 en AdvBench y 0,3291 en StrongREJECT, es decir, en torno a un tercio de los ataques tienen éxito según el juez HarmBench.
- Checkpoint intermedio: solo se han aplicado 5 de las 10 rondas previstas, por lo que el comportamiento no representa el resultado final del brazo experimental.
- Coste en utilidad: el sobre-rechazo macro de 0,0929 indica que una fracción no trivial de peticiones benignas se rechaza.
- Sesgos: no se han publicado evaluaciones de sesgo demográfico, político o cultural en la información disponible.
- Alucinación: no se ha medido la tasa de alucinación; el modelo base Llama 2 presenta este riesgo de forma conocida y la compresión puede agravarlo.
- Idiomas: no se declaran idiomas soportados; el comportamiento fuera del inglés es incierto.
- Licencia: Llama 2 Community License, con las restricciones habituales (cláusulas de uso aceptable de Meta, obligación de incluir aviso de "Built with Llama 2", requisito de licencia separada por encima de 700 millones de usuarios mensuales y prohibición de usar las salidas para entrenar otros modelos de lenguaje).
- Discrepancia no resuelta: el recuento de parámetros del repositorio coincide con el del modelo sin comprimir, pese a declararse una fracción de 0,4999; hay que verificar cómo se aplica la compresión antes de reutilizar los pesos.
- Sin validación externa: 0 descargas y 0 likes, sin revisión por pares ni resultados reproducidos por terceros.
- Compatibilidad incierta con runtimes optimizados (vLLM, llama.cpp, Ollama) por la estructura comprimida del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010_r05
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de SVD-LLM: no disponible en los resultados de búsqueda proporcionados
- Repositorio o demo del autor: no disponible
- Blog o publicación asociada al estudio: no disponible
- Enlaces a HarmBench, StrongREJECT y WildGuard: no disponibles en la información proporcionada
- Resultados de la búsqueda web: no contienen ninguna referencia al modelo; las URLs devueltas corresponden a páginas de soporte de Microsoft (contacto, inicio de sesión en Hotmail, actualizaciones de Exchange Server y descarga de ISOs de Windows 8.1), sin relación con este artefacto.
