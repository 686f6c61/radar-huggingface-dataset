# Jeesup/svd-safety-l3_hisvd_wiki_r50

## Resumen

`svd-safety-l3_hisvd_wiki_r50` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` comprimido mediante HiSVD (una reimplementación de `redai-infra/HiSVD`) hasta conservar aproximadamente el 50,47% de los parámetros densos originales, es decir, unos 8.030 millones de parámetros efectivos. Tras la compresión se aplicó una recuperación de segunda etapa con LoRA al estilo de SVD-LLM (descomposición secuencial U y V, dataset alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16). Lo publica el usuario Jeesup como artefacto de investigación.

El modelo no es un asistente de propósito general ni un chat model desplegable: es una celda concreta dentro de una rejilla experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de Llama-3-8B-Instruct y qué regla de selección de componentes repara mejor ese daño. La calibración se hizo sobre `wikitext2:256` con longitud de secuencia 2048 y semilla 42, usando un método de rango estable con modulación logarítmica y alpha 1.0.

Su relevancia es metodológica: proporciona métricas medibles de compromiso entre seguridad y utilidad bajo compresión (ASR en AdvBench y StrongREJECT, sobre-rechazo macro en WildGuard y perplejidad en WikiText-2), lo que permite comparar reglas de selección y presupuestos de compresión con números concretos en lugar de impresiones cualitativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con HiSVD y recuperado con LoRA de etapa 2 |
| Parámetros totales | 8.030.261.248 (50,47% de la fracción densa original) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Llama-3-8B-Instruct; no verificada en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Meta Llama 3 Community License (`llama3`) |
| Formato de pesos | safetensors (repositorio de 16,1 GB) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 3 con 8.030 millones de parámetros tras la compresión. La compresión HiSVD elimina el 50,00% de los parámetros (fracción resultante 0,5047), con calibración sobre `wikitext2:256`, longitud de secuencia 2048 y semilla 42, método de rango estable, modulación logarítmica y alpha 1.0. Sobre ese checkpoint comprimido se aplica una recuperación LoRA de etapa 2 siguiendo el esquema de SVD-LLM: primero se adapta U, después V, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16, usando alpaca-cleaned como dataset de recuperación.

No se documenta en la información disponible el volumen de tokens de entrenamiento original de Llama-3-8B-Instruct, la composición del dataset de preentrenamiento, ni si hubo RLHF o DPO en la base. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. La contribución técnica del artefacto es la combinación de compresión por descomposición en valores singulares con una regla de selección de componentes orientada a preservar comportamiento de seguridad, medida empíricamente mediante tasas de éxito de ataque y de sobre-rechazo.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta multi-turno a nivel de la base, sin garantías de calidad tras la compresión.
- Soporte de tool calling y function calling heredado del formato de Llama 3, no verificado en este checkpoint.
- Capacidades multilingües no declaradas ni evaluadas en la model card.
- Capacidad de servir como sujeto experimental para medir degradación de seguridad bajo compresión SVD.
- No se documentan modos especiales (thinking, visión, audio) ni soporte de agentes verificado.

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como celda de referencia para comparar reglas de selección de componentes SVD frente a otros presupuestos de compresión, midiendo ASR y perplejidad con el mismo protocolo.
- Evaluación de seguridad bajo compresión: reproducir las métricas de AdvBench y StrongREJECT con HarmBench como juez para cuantificar cuánto sube la tasa de éxito de ataque al recortar parámetros, y contrastarlo con la base sin comprimir.
- Estudio de sobre-rechazo: emplear la métrica macro de WildGuard (0,1740) para analizar si la compresión induce rechazos excesivos en consultas benignas y cómo varía según la regla de selección.
- Análisis de recuperación con LoRA: evaluar el efecto de la etapa 2 (r=8, alpha=16, alpaca-cleaned) comparando perplejidad en WikiText-2 (28,1130) antes y después de la recuperación.
- Reproducibilidad de pipelines de compresión: servir como artefacto de referencia para validar reimplementaciones de HiSVD y del esquema SVD-LLM con semilla 42 y calibración fija.
- Docencia y divulgación técnica: ilustrar con números reales el compromiso entre tamaño, utilidad y seguridad en modelos de 8B comprimidos a la mitad.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,5923 |
| StrongREJECT ASR (juez HarmBench) | 0,3578 |
| Sobre-rechazo macro (WildGuard) | 0,1740 |
| Perplejidad en WikiText-2 | 28,1130 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con la base sin comprimir u otras celdas de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para secuencias largas.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 4,5-5 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 o 4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 con bf16 y contexto moderado, y en GPUs de 12-16 GB si se cuantiza.
- Opciones de despliegue: transformers con `text-generation-inference` (etiqueta declarada en el repositorio) y endpoints compatibles; vLLM, llama.cpp u Ollama no están verificados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| svd-safety-l3_hisvd_wiki_r50 | 8,03B (50,47% de la base) | no disponible | Llama 3 Community | Artefacto de investigación, 0 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03B | 8K (según ficha oficial de Meta) | Llama 3 Community | Modelo base de referencia, ampliamente desplegado |
| Otras celdas de la rejilla del mismo autor | variable según presupuesto | no disponible | Llama 3 Community | No documentadas en la información disponible |

No se dispone de datos de benchmarks comparativos entre este checkpoint y la base sin comprimir ni con otras alternativas de compresión en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; este checkpoint no debe tratarse como asistente desplegable.
- La tasa de éxito de ataque en AdvBench (0,5923) es elevada y refleja la pérdida de comportamiento seguro inducida por la compresión.
- Riesgo de alucinación no cuantificado en la model card; la perplejidad de 28,1130 en WikiText-2 sugiere una degradación de modelado de lenguaje respecto a la base.
- Idiomas soportados no declarados; no hay evaluación multilingüe.
- Longitud de contexto efectiva tras la compresión no verificada.
- Uso comercial sujeto a la Meta Llama 3 Community License y a `USE_POLICY.md`, incluidos en el repositorio; es obligatorio revisar ambas antes de cualquier uso derivado.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; cualquier conclusión debe basarse en evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_hisvd_wiki_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio HiSVD referenciado: https://github.com/redai-infra/HiSVD
- Licencia Meta Llama 3: incluida en el repositorio del modelo (`LICENSE` y `USE_POLICY.md`)
