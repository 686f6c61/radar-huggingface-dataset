# martincousseau/esann2027-compose-v2

## Resumen

`martincousseau/esann2027-compose-v2` no es un modelo entrenado al uso, sino un repositorio de artefactos de investigación que contiene **157 estados comprimidos** de cuatro modelos base (SmolLM2-135M, SmolLM2-360M, Qwen2.5-0.5B y SmolLM2-1.7B). Lo publica Martin Cousseau como material reproducible del estudio "Do pruning and quantization compose?" (v2), previsto para ESANN 2027, sobre el orden de aplicación de poda no estructurada y cuantización de pesos con compensación hessiana (OBS).

El problema que aborda es la interacción entre dos técnicas de compresión habitualmente tratadas por separado: podar y luego cuantizar, cuantizar y luego podar, o hacer ambas cosas en una sola pasada conjunta. El repositorio incluye además brazos de ablación que intentan explicar por qué cuantizar primero degrada más el modelo (reajuste de la rejilla tras la poda, máscaras alternativas, rejilla obsoleta).

Es relevante para quien investigue compresión de modelos pequeños y reproducibilidad: cada estado se guarda en un formato compacto exacto (códigos enteros, escala y punto cero por grupo, mapa de bits de dispersión) que decodifica bit a bit los pesos fp32 evaluados, con registros por ítem de benchmark y un run de Weights & Biases por estado. El tamaño del repositorio (48,7 GB) refleja el conjunto completo de estados, no un único modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelos base: SmolLM2 y Qwen2.5); el repositorio contiene estados de pesos comprimidos, no una arquitectura nueva |
| Parametros totales | Depende del modelo base: 135M (SmolLM2-135M), 360M (SmolLM2-360M), 0.5B (Qwen2.5-0.5B) y 1.7B (SmolLM2-1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (los modelos base SmolLM2 y Qwen2.5 tienen contextos propios, no citados aqui) |
| Tipos de cuantizacion | Asimetrica min-max por grupo de 128 pesos; estados de 8 bits y 4 bits (codigos uint8 con dos codigos de 4 bits por byte cuando bits <= 4); estados solo podados a 16 bits por peso conservado |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con metadatos JSON bajo la clave `esann2027`, formato `esann2027-v2-compact-1`; decodificacion a fp32 mediante script `load_esann2027.py` |

## Arquitectura y entrenamiento

Los modelos base son transformers decoder-only de la familia SmolLM2 (135M, 360M y 1.7B) y Qwen2.5-0.5B. Sobre ellos no se entrena nada nuevo: se aplican transformaciones de compresión con el barrido OBS del código del paper (`src/core.py`), con modelo y hessianos en fp32 sobre una NVIDIA L4, TF32 desactivado y kernels deterministas. La calibración usa 128 ventanas de 2048 tokens de C4 y una rejilla de cuantización asimétrica min-max por grupo de 128 pesos.

Los 157 estados se reparten en familias experimentales: E1 (rejilla del paper en fp32, 72 estados), E3 (brazos de mecanismo Q->P, 40), E4 (puntos extra de frontera, 15), E5 (semillas de calibración 1 y 2, 20) y E6 (escala dentro de una familia, 10). Los órdenes disponibles son `dense`, `prune`, `quant`, `joint`, `p_then_q`, `q_then_p` y los brazos de ablación `q_then_p_refit`, `q_then_p_pmask`, `q_then_p_pmask_refit` y `p_then_q_stale`. Cada archivo guarda solo las capas lineales comprimidas de los bloques del decoder; embeddings, normas y LM head son los del modelo base sin modificar.

## Capacidades

- El repositorio no aporta capacidades nuevas: cada estado hereda las del modelo base correspondiente (generación de texto y conocimiento general a escala de 135M a 1.7B parámetros).
- Decodificación exacta de pesos comprimidos a fp32 bit a bit, lo que permite reproducir las evaluaciones del paper.
- Evaluación de perplejidad en WikiText-2 (test) y C4 (validación, 256 ventanas), divergencia KL y acuerdo top-1 respecto al modelo denso.
- Nueve tareas zero-shot evaluadas con lm-evaluation-harness 0.4.13 sobre splits completos, con registros por ítem (familias E1 y E4).
- Trazabilidad completa: cada línea de resultado registra GPU, driver, imagen de Colab, versiones de librerías, commit y hash del código.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Reproducción de investigación en compresión: cargar un estado con `load_esann2027.py` y verificar que la decodificación coincide bit a bit con los pesos fp32 evaluados, como base para replicar el estudio.
- Estudio del orden poda-cuantización: comparar `p_then_q`, `q_then_p` y `joint` a igualdad de bits por peso para decidir qué secuencia conviene en un pipeline propio de compresión.
- Análisis de mecanismos de degradación: usar los brazos `q_then_p_refit`, `q_then_p_pmask` y `p_then_q_stale` para aislar si la pérdida viene de la rejilla de cuantización, de la máscara de poda o de ambos.
- Selección de compromiso tamaño-calidad: consultar las tablas de perplejidad y KL por estado (por ejemplo, 50% de poda en SmolLM2-135M da PPL 32,82 frente a 15,44 del estado de 8 bits) para elegir un punto de operación.
- Docencia y experimentación con modelos pequeños: los estados de 135M y 360M caben en GPU de consumo y permiten demostrar técnicas OBS, SparseGPT y GPTQ sin infraestructura grande.
- Auditoría de evaluaciones: cruzar los registros por ítem del repositorio de GitHub con los runs de Weights & Biases para validar resultados antes de citarlos.
- Base para compresión de modelos mayores: las conclusiones sobre orden y reajuste de rejilla sirven de guía metodológica al comprimir modelos de más parámetros.

## Benchmarks y rendimiento

Resultados de perplejidad y divergencia KL publicados en la model card (subconjunto representativo de SmolLM2-135M; PPL = WikiText-2 test, C4 PPL = validación, KL = divergencia media respecto al denso):

| Estado | Familia | Semilla | bits/peso | PPL | C4 PPL | KL |
|---|---|---|---|---|---|---|
| 25% podado | E1 | 0 | 13,00 | 16,48 | 21,63 | 0,067 |
| 33% podado | E1 | 0 | 11,67 | 18,37 | 23,58 | 0,173 |
| 50% podado | E1 | 0 | 9,00 | 32,82 | 39,17 | 0,740 |
| 60% podado | E4 | 0 | 7,40 | 71,43 | 80,24 | 1,503 |
| 8 bits | E1 | 0 | 8,00 | 15,44 | 20,59 | 0,002 |

La model card no incluye en la información proporcionada los resultados de los estados combinados (p_then_q, q_then_p, joint) ni los de los otros tres modelos base, ni cifras de las nueve tareas zero-shot. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: un estado de SmolLM2-135M en fp32 ocupa del orden de 0,5 GB; SmolLM2-360M, alrededor de 1,4 GB; Qwen2.5-0.5B, unos 2 GB; SmolLM2-1.7B, unos 6,8 GB. Los estados comprimidos reducen el peso de las capas lineales según bits por peso, pero la decodificación se hace a fp32 en memoria.
- GPU recomendadas: cualquier GPU con al menos 8-16 GB para los modelos pequeños; una NVIDIA L4 (la usada en el estudio) basta para cargar y evaluar cualquiera de los cuatro modelos base.
- Cabe en GPU de consumo: sí, los cuatro modelos base caben en tarjetas tipo RTX 3060/4060/4090; SmolLM2-1.7B en fp32 requiere alrededor de 7 GB más overhead.
- Despliegue: el repositorio proporciona un cargador propio (`load_esann2027.py`) que reconstruye el modelo `transformers` en fp32; no se documenta soporte directo para vLLM, llama.cpp, Ollama o TGI, ya que el formato `esann2027-v2-compact-1` no es un formato de inferencia estándar.
- Latencia y throughput: no disponibles. El estudio se centra en calidad (perplejidad, KL, tareas zero-shot), no en rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| esann2027-compose-v2 (este repo) | Estados de 135M a 1.7B | No disponible | Artefactos de compresión (poda + cuantización OBS) para reproducibilidad | apache-2.0 | Hugging Face, 157 estados |
| SmolLM2-1.7B (base) | 1.7B | No disponible | Modelo denso listo para inferencia | apache-2.0 | Hugging Face |
| Qwen2.5-0.5B (base) | 0.5B | No disponible | Modelo denso multilingüe listo para inferencia | apache-2.0 | Hugging Face |
| SparseGPT / GPTQ (herramientas) | No aplica | No aplica | Métodos de compresión; este repo usa sus ideas dentro de un barrido OBS | Varía | Repositorios públicos |

La comparación directa con modelos comprimidos publicados no está disponible en la información proporcionada; los estados de este repositorio no están pensados como sustitutos de un checkpoint de inferencia, sino como material experimental.

## Limitaciones y advertencias

- No es un modelo listo para producción: el formato compacto requiere el cargador del repositorio y decodificación a fp32; no hay integración con runtimes de inferencia estándar.
- Solo se comprimen las capas lineales de los bloques del decoder; embeddings, normas y LM head quedan en su precisión original, por lo que el ahorro real de memoria es menor que el que sugiere el bits por peso.
- Los bits por peso indicados no incluyen la escala y el punto cero por grupo (que añaden (16+b)/128 bits en estados cuantizados) ni el mapa de bits en estados podados, salvo que se cuente explícitamente.
- La poda es no estructurada: la dispersión no se traduce necesariamente en aceleración en hardware convencional.
- La información disponible no documenta sesgos, idiomas soportados ni tasas de alucinación; deben evaluarse sobre el modelo base correspondiente.
- El paper está en preparación para ESANN 2027; las cifras deben citarse con cautela hasta su publicación.
- La licencia apache-2.0 cubre el repositorio, pero conviene verificar las licencias de los modelos base (SmolLM2 y Qwen2.5) para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/martincousseau/esann2027-compose-v2
- Código, líneas de resultado y logs por ítem: https://github.com/martin-cousseau/esann2027-compose/tree/claude/busy-hopper-ghtynk
- Runs de Weights & Biases: https://wandb.ai/martin-css/esann2027-compose-v2
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Modelo base SmolLM2-360M: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Modelo base SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Paper: en preparación para ESANN 2027 (no disponible)
