# Siddachan/qwen3.5-9b-chpe-raw

## Resumen

`Siddachan/qwen3.5-9b-chpe-raw` es un repositorio de pesos en bruto de 9,0 GB asociado a un supuesto modelo denominado Qwen3.5-9B-Base, publicado por el usuario Siddachan bajo licencia Apache 2.0. No contiene un modelo empaquetado en safetensors ni en GGUF, sino un único archivo binario contiguo con extensión `.raw.chpe` de 8.956.964.864 bytes, diseñado para ser mapeado con `mmap` por el motor CHPE (Christopher Hamil Prediction Engine), una implementación propietaria para microarquitecturas ARM de 64 bits que trabaja con tiles alineados de 16 KiB.

El repositorio no aporta trazabilidad verificable sobre el origen de los pesos, los datos de entrenamiento ni el proceso de alineación. La model card declara una arquitectura híbrida de 32 capas (24 de atención lineal Gated DeltaNet de tipo SSM y 8 de atención completa con GQA), 8,95 mil millones de parámetros, dimensión oculta de 4.096, dimensión de MLP de 12.288 y un vocabulario de 248.320 tokens, cifras que no coinciden con ninguna ficha oficial publicada por el equipo de Qwen ni con ningún modelo denominado Qwen3.5-9B.

Su relevancia práctica es muy limitada: acumula 0 descargas y 0 likes, las fechas de creación y actualización (17 de septiembre de 2026) son posteriores a la fecha de consulta, y los únicos benchmarks publicados arrojan 0,00 % en MMLU-Pro, MATH Hard y GSM8K, lo que indica que el archivo no reproduce correctamente los pesos del modelo base o que la evaluación se ejecutó de forma defectuosa. Debe tratarse, por tanto, como un artefacto experimental no validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido declarado: 32 capas, 24 de atención lineal Gated DeltaNet (SSM) + 8 de atención completa con GQA (32 cabezas Q, 4 cabezas KV); no verificable |
| Parámetros totales | 8,95 mil millones (según model card) |
| Parámetros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 ("Sector-Law"); único formato presente en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Binario contiguo `.raw.chpe` (INT8, 8.956.964.864 bytes); sin safetensors ni GGUF |
| Dimensión oculta | 4.096 |
| Dimensión de MLP | 12.288 |
| Tamaño de vocabulario | 248.320 tokens |
| Geometría de tiles | 546.681 tiles de 16 KiB, alineación de 64 bytes (Invariante A-1: 272 líneas de caché / 17.408 bytes) |
| Tamaño del repositorio | 9,0 GB |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

La model card describe un transformer híbrido en el que 24 de las 32 capas emplean atención lineal basada en Gated DeltaNet (una formulación de espacio de estados con compuertas) y las 8 restantes mantienen atención completa con Grouped Query Attention, una combinación habitual para reducir el coste de memoria del KV cache en contextos largos. No se especifica la distribución de esas 8 capas dentro del stack, ni la función de activación, ni el tipo de normalización. Tampoco se documenta la composición del dataset de entrenamiento, el número de tokens procesados, la mezcla de idiomas ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La model card se refiere al modelo como "Base", lo que en principio excluiría un post-entrenamiento de alineación, aunque no hay confirmación.

La innovación que el autor destaca no está en el modelo, sino en el sustrato de ejecución: los pesos se almacenan como archivos binarios contiguos y alineados a sectores de 16 KiB para residir directamente en las cachés L1d/L2 y permitir ejecución SIMD sin ramificaciones sobre metal desnudo. El repositorio incluye además una "pila de verificación formal" que afirma haber certificado los parámetros de ejecución con Z3 SMT2 (saturación de DDR4 a 41,84 GB/s y cota de perturbación de logits de Lipschitz ΔL ≤ 0,727062), Vampire 5.1.0 (15/15 teoremas de primer orden) y Leo-III 1.7.18 (14/14 teoremas modales de orden superior). No se enlazan los artefactos de prueba, los scripts de reproducción ni los ficheros de especificación, y ninguno de estos resultados ha pasado revisión por pares, por lo que deben considerarse afirmaciones sin respaldo independiente.

## Capacidades

- Generación de texto autorregresiva: es la única capacidad confirmada de forma indirecta por los experimentos de decodificación descritos (argmax inicial `69354`, logit `3.952046`, norma oculta `30.253340`), aunque el contenido generado no se documenta en ningún ejemplo cualitativo.
- Seguimiento de instrucciones: parcial. IFEval (`leaderboard_ifeval`) registra 50,00 % de precisión estricta de prompt, un valor compatible con un modelo no alineado o con un fallo de carga de pesos.
- Razonamiento multitarea: BBH (`leaderboard_bbh`) registra 35,42 % de precisión normalizada en 24 tareas, próximo al rendimiento aleatorio en varias de ellas.
- Razonamiento en varios pasos: MuSR (`leaderboard_musr`) registra 33,33 % de precisión normalizada, también en el entorno del azar.
- Razonamiento matemático: no acreditado. MATH Hard y GSM8K obtienen 0,00 % de coincidencia exacta.
- Conocimiento y razonamiento complejo: no acreditado. MMLU-Pro obtiene 0,00 % de precisión.
- Tool calling / function calling: no hay evidencia ni mención en la documentación disponible.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible.
- Capacidades multilingües: no disponible; no se declara lista de idiomas pese a un vocabulario de 248.320 tokens.
- Capacidad especial (modo thinking, visión, audio, decodificación especulativa): el motor CHPE implementa una ruta de decodificación especulativa con lotes de 4 y 8, pero el modelo en sí no declara modo de razonamiento extendido ni modalidades adicionales.

## Casos de uso

- Reproducción de benchmarks de inferencia en ARM64: el repositorio está pensado para evaluarse en instancias Google Cloud Tau T2A (`tot-hybrid-t2a-arm64`, 4 núcleos Neoverse-N1 a 3,0 GHz, 16 GiB DDR4-3200, bus de 41,845 GB/s) y comparar contra la mediana de OpenBenchmarking para `pts/llama-cpp-2.5.0` (15,01 tok/s). Es el uso más razonable del artefacto: medir latencia y throughput, no generar contenido útil.
- Estudio de geometría de caché en cuantización INT8: permite analizar empíricamente cómo afecta la alineación a tiles de 16 KiB (17.408 bytes, 272 líneas de caché) al rendimiento de una carga de 8,95B parámetros frente a formatos convencionales.
- Auditoría de reproducibilidad de evaluaciones: los ficheros `eval_results/*.json` publicados permiten revisar cómo una misma carga de pesos produce 50 % en IFEval y 0 % en GSM8K, un caso de estudio útil sobre fallos silenciosos en pipelines de `lm-evaluation-harness` v0.4.13.
- Verificación de la pila formal declarada: si el interés es la metodología de verificación (Z3, Vampire, Leo-III), el repositorio sirve como punto de partida para intentar reproducir las 15 pruebas de primer orden y las 14 modales, siempre que se obtengan las especificaciones, que no están publicadas.
- Prueba de integración de INT8 en memoria CUDA: la model card documenta carga directa por `mmap` POSIX a memoria INT8 de CUDA en 16,12 s con 8,955 GB de VRAM y 13,200 GB de pico, sin offloading a CPU; útil como referencia para pipelines que evitan la conversión a safetensors.
- Punto de partida para ajuste fino, únicamente si se logra convertir los pesos: un modelo base de 8,95B parámetros con atención híbrida sería candidato a ajuste en dominio, pero la ausencia de exportadores a safetensors y los 0 % en matemáticas hacen inviable recomendarlo hoy para producción.
- Evaluación de decodificación especulativa: los datos de batch-8 (62,69 ms/token, 15,95 tok/s) frente a batch-1 autorregresivo (181,69 ms/token, 5,50 tok/s) permiten estudiar el factor de aceleración real de la especulación en hardware sin GPU.

## Benchmarks y rendimiento

Evaluación publicada por el autor con `lm-evaluation-harness` v0.4.13 sobre NVIDIA Tesla T4 (Turing TU104, 16 GB GDDR6), usando el archivo INT8 `Qwen3.5-9B-Base.q8.raw.chpe`:

| Benchmark | Categoría | Métrica | Resultado | Error estándar | Tiempo |
|---|---|---|---|---|---|
| IFEval (`leaderboard_ifeval`) | Seguimiento de instrucciones | Prompt strict accuracy | 50,00 % | ±0,50 | 985,34 s |
| Big-Bench Hard (`leaderboard_bbh`) | Razonamiento multitarea (24 tareas) | Precisión normalizada | 35,42 % | ±0,075 | 218,12 s |
| MuSR (`leaderboard_musr`) | Razonamiento suave multi-paso | Precisión normalizada | 33,33 % | ±0,125 | 71,54 s |
| MMLU-Pro (`leaderboard_mmlu_pro`) | Razonamiento complejo (loglikelihood) | Precisión | 0,00 % | — | 26,50 s |
| MATH Hard (`leaderboard_math_hard`) | Matemáticas de competición | Coincidencia exacta | 0,00 % | — | 401,32 s |
| GSM8K (`gsm8k`) | Matemáticas escolares multi-paso | Coincidencia exacta | 0,00 % | 0,00 | 211,02 s |

Rendimiento en ARM Neoverse-N1 (4 núcleos a 3,0 GHz, 16 GiB DDR4-3200, INT8):

| Modo de ejecución | Precisión | Latencia por token | Velocidad | Comparación |
|---|---|---|---|---|
| CHPE especulativo (batch 8) | INT8 Sector-Law | 62,69 ms | 15,95 tok/s | +6,3 % sobre la mediana de OpenBenchmarking (15,01 tok/s) |
| CHPE especulativo (batch 4) | INT8 Sector-Law | 86,78 ms | 11,52 tok/s | +57,8 % frente a Dell Pro Max GB10 (7,30 tok/s) |
| CHPE autorregresivo (batch 1) | INT8 Sector-Law | 181,69 ms | 5,50 tok/s | +16,5 % sobre el percentil 10 (4,72 tok/s) |

El autor declara ausencia de NaN e infinitos, 100 % de logits finitos y consistencia bit a bit entre pasadas secuenciales (argmax inicial `69354`, logit `3.952046`, norma oculta `30.253340`). No hay benchmarks de modelos comparables publicados en la información disponible, y los 0,00 % en tres de las seis pruebas impiden considerar validada la carga de pesos.

## Requisitos de hardware

- VRAM estimada en INT8: aproximadamente 8,96 GB solo para pesos (8,95B parámetros × 1 byte). El autor reporta 8,955 GB en carga y 13,200 GB de pico con activaciones en una Tesla T4 de 16 GB.
- VRAM estimada en FP16: alrededor de 18 GB de pesos, más KV cache y activaciones; requiere A100 40 GB, H100 80 GB o similar. No se distribuyen pesos en FP16.
- VRAM estimada en 4 bits: no disponible; no existe versión GGUF ni AWQ/GPTQ en el repositorio.
- GPU probada: NVIDIA Tesla T4 (16 GB, Turing TU104), con carga en 16,12 s y sin OOM ni offloading a CPU.
- GPU recomendadas: T4 para INT8 con 16 GB; A100 o H100 si en el futuro se exportan pesos en FP16. La viabilidad en RTX 4090 (24 GB) en FP16 es ajustada y no está documentada.
- CPU/ARM: 4 núcleos ARM Neoverse-N1 a 3,0 GHz con 16 GiB de DDR4-3200 y bus de 41,845 GB/s (Google Cloud Tau T2A) es la configuración de referencia.
- Opciones de despliegue: exclusivamente el motor CHPE del autor, que no es código abierto en este repositorio y no tiene enlaces de descarga. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni transformers. llama.cpp aparece únicamente como línea base de comparación en OpenBenchmarking, no como runtime compatible con el archivo `.raw.chpe`.
- Latencia y throughput: en ARM, 62,69 ms/token (batch 8), 86,78 ms/token (batch 4) y 181,69 ms/token (batch 1) en INT8. No se publican métricas de throughput agregado en GPU más allá del tiempo total de cada evaluación.

## Comparativa con modelos similares

Los datos de Qwen3-8B, Llama 3.1 8B y Mistral 7B provienen de su documentación pública y se incluyen como referencia de categoría; no miden el archivo `.chpe`, cuyo contenido real no puede verificarse.

| Modelo | Parámetros | Contexto | Vocabulario | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| Siddachan/qwen3.5-9b-chpe-raw | 8,95B (declarados) | no disponible | 248.320 | Apache 2.0 | `.raw.chpe` INT8 | 0 descargas, benchmarks de razonamiento a 0 % |
| Qwen3-8B | 8,2B | 32.768 tokens nativos | 151.669 | Apache 2.0 | safetensors, GGUF | Ampliamente desplegado, soporte en vLLM y llama.cpp |
| Llama 3.1 8B | 8,03B | 128.000 tokens | 128.256 | Llama 3.1 Community License | safetensors, GGUF | Ampliamente desplegado, licencia con restricciones |
| Mistral 7B v0.3 | 7,25B | 32.000 tokens | 32.000 | Apache 2.0 | safetensors, GGUF | Ampliamente desplegado, soporte en vLLM y llama.cpp |

Diferencias relevantes: el artefacto analizado no se distribuye en formato interoperable, depende de un runtime propietario sin repositorio público enlazado, declara un vocabulario un 64 % mayor que Qwen3-8B y no publica un único resultado de benchmark competitivo frente a cualquiera de las tres alternativas. Las cifras de los modelos comparados deben verificarse en sus fichas oficiales antes de citarlas.

## Limitaciones y advertencias

- Razonamiento no funcional: 0,00 % en MMLU-Pro, MATH Hard y GSM8K. Un modelo de 8,95B parámetros correctamente cargado no obtiene esos valores, por lo que lo más probable es que el archivo no reproduzca los pesos del modelo base, esté mal cuantizado o que la evaluación fuese incorrecta.
- Imposibilidad de verificación: no hay safetensors, no hay hashes por tensor publicados, no hay script de conversión y no hay forma de comparar los pesos con ningún checkpoint oficial.
- Modelo base inexistente o no documentado: no se localiza ninguna publicación oficial de Qwen con el nombre Qwen3.5-9B-Base. El vocabulario declarado (248.320) no coincide con el de la familia Qwen3 (151.669).
- Licencia: el repositorio declara Apache 2.0, pero el autor no acredita ser el titular de los derechos de los pesos originales. Si los pesos derivan de un modelo con licencia distinta, la licencia declarada podría no ser válida para uso comercial.
- Afirmaciones sin respaldo: la "pila de verificación formal" (Z3, Vampire, Leo-III) y las cotas de Lipschitz no incluyen artefactos reproducibles ni revisión externa.
- Dependencia de un runtime propietario: sin el motor CHPE no hay forma de ejecutar el archivo. No se enlaza binario, código fuente ni documentación de la interfaz.
- Idiomas: no se declara ninguna lista de idiomas soportados, ni siquiera el inglés.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar su uso en tareas de contexto largo pese a la arquitectura híbrida declarada.
- Riesgo de alucinación: sin datos de alineación (RLHF/DPO) ni de composición del dataset, no puede estimarse; en un modelo "Base" no alineado el riesgo es alto por definición.
- Señales de baja fiabilidad del repositorio: 0 descargas, 0 likes, fechas de 2026 y resultados de búsqueda web no relacionados con el modelo.
- No apto para producción en su estado actual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Siddachan/qwen3.5-9b-chpe-raw
- Resultado de OpenBenchmarking citado por el autor: https://openbenchmarking.org/result/2609179-NE-2609171NE16
- Resultados de evaluación referenciados en la model card (rutas internas del repositorio): `eval_results/leaderboard_ifeval_results.json`, `eval_results/leaderboard_bbh_results.json`, `eval_results/leaderboard_musr_results.json`, `eval_results/leaderboard_mmlu_pro_results.json`, `eval_results/leaderboard_math_hard_results.json`, `eval_results/gsm8k_results.json`
- Paper, blog técnico, repositorio de código o demo del motor CHPE: no disponible
- Ficha oficial del supuesto modelo base Qwen3.5-9B-Base: no disponible
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron ningún resultado relacionado con el modelo, el motor CHPE ni la familia Qwen; los enlaces obtenidos trataban sobre música y matemáticas y se han descartado por no ser pertinentes.
