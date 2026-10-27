# Jeesup/svd-safety-l3_swift_jbbresp13_remove40

## Resumen

`svd-safety-l3_swift_jbbresp13_remove40` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se trata de `meta-llama/Meta-Llama-3-8B-Instruct` comprimido mediante Swift-SVD con un objetivo de eliminación del 40 % de los parámetros (presupuesto factorizado del 60 % de los pesos densos) y posteriormente recuperado con la etapa 2 de SVD-LLM, basada en LoRA secuencial sobre los factores U y V. El resultado se pliega a pesos densos estándar de Transformers, por lo que la reducción afecta al presupuesto de parámetros factorizados y no al tamaño de descarga.

El interés del modelo no es su rendimiento absoluto, sino su utilidad como artefacto de medición: evalúa cómo afecta la compresión a la dicotomía seguridad/utilidad en un LLM de 8.000 millones de parámetros. Para ello el autor emplea un corpus de calibración mixto (256 secuencias de WikiText más 13 pares de prompt dañino/respuesta de JailbreakBench, 2048 tokens cada uno, semilla 42) y publica métricas de perplejidad, utilidad zero-shot y tasas de éxito de ataque juzgadas con HarmBench, además de sobre-rechazo medido con WildGuard.

La relevancia actual es metodológica: cuantifica el compromiso entre agresividad de compresión y alineación de seguridad con datos crudos verificables (generaciones por prompt incluidas en el repositorio). El propio autor advierte de que es un checkpoint de investigación para medir seguridad y utilidad bajo compresión, y que sus mediciones no acreditan idoneidad para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), 32 capas, hidden size 4096, 32 cabezas de atención (8 cabezas KV) |
| Parametros totales | 8.030.261.248 (pesos densos plegados); presupuesto factorizado tras compresión: 60 % de los parámetros densos |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (según las fichas GGUF de checkpoints hermanos de la misma familia; la model card de este checkpoint no lo declara) |
| Tipos de cuantizacion | Pesos originales en bfloat16 (safetensors). No se publican cuantizaciones propias en este repositorio; existen conversiones GGUF (p. ej. Q4_K_M) de checkpoints hermanos de la misma familia generadas con llama.cpp |
| Idiomas soportados | no disponible (la model card no lo declara; la calibración y la evaluación se han hecho íntegramente en inglés) |
| Licencia | llama3 (Llama 3 Community License Agreement) |
| Formato de pesos | safetensors (transformers); tamaño del repositorio: 16,1 GB |

## Arquitectura y entrenamiento

La base es la arquitectura Llama 3 de 8B en configuración densa: 32 capas, dimensión de modelo 4096, 32 cabezas de atención con 8 cabezas de clave/valor y contexto de 8192 tokens. Sobre ese checkpoint se aplica Swift-SVD, una compresión por descomposición en valores singulares con asignación dinámica de rango (alpha 0,6), donde la importancia por capa se calcula a partir de WikiText. El objetivo declarado es eliminar el 40 % de los parámetros, dejando un presupuesto factorizado del 60 %.

La calibración es prompt-más-respuesta, no solo prompt: 256 secuencias de WikiText y 13 secuencias de prompt dañino/respuesta de JailbreakBench (26.624 tokens en total), a 2048 tokens por secuencia y semilla 42, empaquetadas con el tokenizador propio de la familia Llama 3 y reutilizando los textos de rechazo de Llama 2. La recuperación sigue la etapa 2 de SVD-LLM: LoRA secuencial primero sobre los factores U y luego sobre los V, con datos Alpaca-cleaned y dos épocas por pasada de entrenamiento. Los recuentos reales de parámetros y los detalles de recuperación se registran en el fichero `compression.json` del repositorio. El checkpoint final se pliega a pesos densos convencionales para su uso con Transformers.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del ajuste de `Meta-Llama-3-8B-Instruct`.
- Razonamiento de un solo turno y respuesta a preguntas de tipo zero-shot (el autor evalúa ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA, aunque no publica los valores numéricos en la información disponible).
- Comprensión y generación en inglés, con perplejidad medida sobre WikiText-2 completa.
- Comportamiento de rechazo ante prompts dañinos, objeto central del ajuste de calibración.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre compresión de modelos: servir como punto de comparación frente al checkpoint denso original para aislar el efecto de la eliminación del 40 % de parámetros en perplejidad y en siete tareas zero-shot.
- Medición de alineación bajo compresión: usar los conjuntos AdvBench y StrongREJECT con el juez HarmBench para estimar cómo degrada la compresión la tasa de éxito de ataques (ASR reportado de 0,0904 y 0,1821 respectivamente).
- Estudio de sobre-rechazo: emplear XSTest-safe y OR-Bench con juez WildGuard para cuantificar el coste en utilidad de las intervenciones de seguridad (sobre-rechazo macro de 0,1289 publicado por el autor).
- Reproducibilidad de pipelines SVD: el repositorio incluye los ficheros crudos de evaluación, registros del juez y logs por prompt, lo que permite auditar la metodología y reutilizar el pipeline de calibración con otros corpus.
- Análisis de robustez de salvaguardas en asistentes: alimentar el modelo con variantes de prompts dañinos y comparar la distribución de rechazos frente al modelo base sin comprimir, con límite de generación de 512 tokens.
- Pruebas comparativas de eficiencia memoria/calidad: desplegar la versión bf16 y una cuantización GGUF de la familia para medir la pérdida de calidad respecto a la reducción de huella de VRAM, sin usar el checkpoint como servicio de cara al público.
- Docencia y auditoría de técnicas de compresión: estudiar la asignación dinámica de rango (alpha 0,6) y el efecto de un corpus de calibración de seguridad frente a uno puramente de texto genérico.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---:|
| Perplejidad WikiText-2 (completa) | 21,9861 |
| AdvBench ASR (juez HarmBench) | 0,0903846 |
| StrongREJECT ASR (juez HarmBench) | 0,182109 |
| Sobre-rechazo macro (juez WildGuard) | 0,128887 |

El autor evalúa además siete tareas zero-shot (ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA) y los conjuntos XSTest-safe y OR-Bench, pero los valores numéricos de esas tareas no se incluyen en la información disponible. No se han publicado comparaciones directas con el modelo base sin comprimir ni con modelos de terceros en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 16,1 GB solo para pesos, más caché KV; con 8192 tokens de contexto la caché KV ronda 1 GB adicional (estimación a partir de 32 capas y 8 cabezas KV de dimensión 128).
- VRAM en cuantización int8: en torno a 8-9 GB de pesos; en GGUF Q4_K_M, alrededor de 5 GB.
- GPU profesionales: A100 40 GB, H100 80 GB y L40S 48 GB cubren bf16 con contexto completo sin problemas.
- GPU de consumo: RTX 4090 (24 GB) admite bf16 con contexto moderado; RTX 3090 (24 GB) entra con margen ajustado; tarjetas de 16 GB (RTX 4080, 4070 Ti Super) requieren int8 o GGUF Q4/Q5.
- Despliegue: Transformers (formato nativo), Text Generation Inference (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM; para cuantizaciones, llama.cpp y Ollama a partir de las conversiones GGUF de la familia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l3_swift_jbbresp13_remove40` | 8,03 B densos (presupuesto factorizado 60 %) | 8192 | llama3 | Calibración mixta WikiText + 13 secuencias JBB; recuperación LoRA SVD-LLM; perplejidad WikiText-2 21,9861 |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8,03 B | 8192 | llama3 | Modelo base sin comprimir; referencia natural para medir la pérdida por compresión; métricas no disponibles en la información proporcionada |
| `Jeesup/svd-safety-l3_swift_remove40` | 8 B (60 % del denso) | no disponible | llama3 | Hermano de la misma familia; sin presupuesto de componentes SVD restaurados (0,0 %) |
| `Jeesup/svd-safety-l3_swift_jbbcal2_remove40` | 8 B (60 % del denso) | no disponible | llama3 | Hermano con otro corpus de calibración de seguridad (jbbcal2); dispone de GGUF de terceros |

## Limitaciones y advertencias

- Checkpoint de investigación: el autor indica explícitamente que las mediciones no establecen idoneidad para despliegue; no debe usarse como servicio en producción sin una evaluación propia.
- Las salvaguardas no son robustas: las tasas de éxito de ataque publicadas (0,0904 en AdvBench y 0,1821 en StrongREJECT) implican que una fracción relevante de prompts dañinos obtiene respuesta incluso tras el ajuste de calibración.
- Sobre-rechazo no trivial: 0,1289 macro con WildGuard, es decir, rechazos indebidos en prompts legítimos, con el consiguiente coste de utilidad.
- Evaluación dependiente de jueces automáticos (HarmBench, WildGuard); StrongREJECT se puntúa con el juez de HarmBench y no con su scorer nativo, lo que limita la comparabilidad con la literatura que usa el scorer original.
- Calibración y evaluación exclusivamente en inglés, con corpus de seguridad de solo 13 secuencias; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Idiomas soportados no declarados en la model card; el rendimiento multilingüe es, por tanto, desconocido.
- Efecto de la compresión sobre razonamiento matemático y tareas zero-shot no cuantificado en la información disponible, pese a que el autor declara haberlas ejecutado.
- La compresión no reduce el tamaño de descarga: los pesos están plegados a densos (16,1 GB), así que el ahorro de VRAM frente al modelo base es nulo en el checkpoint publicado.
- Licencia Llama 3 Community License: uso comercial permitido con condiciones (atribución "Built with Meta Llama 3", política de uso aceptable, cláusula de 700 millones de usuarios activos mensuales y requisitos de denominación para modelos derivados). Requiere aceptar los términos upstream de Meta.
- Sin datos publicados sobre sesgos demográficos, toxicidad o comportamiento en dominios sensibles distintos de los conjuntos de seguridad evaluados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbresp13_remove40
- Checkpoint hermano (sin restauración de componentes SVD): https://huggingface.co/Jeesup/svd-safety-l3_swift_remove40
- Checkpoint hermano (calibración jbbcal2): https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbcal2_remove40
- Checkpoint hermano (recuperación con alpaca_cleaned_jbbsft): https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbsft1_remove40
- Cuantizaciones GGUF de la familia (terceros): https://huggingface.co/tinyopsec/Jeesup-svd-safety-l3_swift_jbbcal2_remove40-GGUF
- Cuantizaciones GGUF de variante swapgapiter: https://huggingface.co/tinyopsec/Jeesup-svd-safety-l3_swift_remove40_swapgapiter_evfront_b010-GGUF
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
