# Raviteja546/reasoning-rlvr-sft

## Resumen

`reasoning-rlvr-sft` es un ajuste fino completo (full fine-tune) del modelo base `Qwen/Qwen3-1.7B-Base`, publicado por el usuario Raviteja546 como parte de un estudio sobre aprendizaje por refuerzo con verificación (RLVR) y ajuste supervisado (SFT). El checkpoint corresponde a la fase 3 del estudio (rama `phase-3-rft`) y está entrenado sobre un subconjunto de `open-r1/OpenR1-Math-220k` reformateado con una plantilla de etiquetas `think`/`answer`. Su interés es principalmente experimental: sirve como referencia reproducible para comparar SFT frente a RLVR en tareas de razonamiento matemático con un presupuesto de cómputo muy reducido (3,04 GPU-horas en una H100).

El modelo tiene 1.720.574.976 parámetros (aproximadamente 1,7 mil millones), una ventana de contexto efectiva de 4.096 tokens durante el entrenamiento y la evaluación, y se distribuye en formato safetensors con licencia Apache 2.0. No es un modelo de propósito general: está especializado en trazas de razonamiento matemático de estilo olimpiada y su formato de prompt es obligatorio para obtener resultados comparables a los publicados.

La relevancia actual radica en que documenta de forma transparente los modos de fallo típicos de los modelos pequeños entrenados con SFT sobre trazas de razonamiento: bucles de decodificación que agotan la ventana, truncamiento masivo en conjuntos difíciles (hasta el 96,7 % en AIME 2024) y una brecha considerable frente a variantes zero-shot del propio modelo base en algunos conjuntos. Es, por tanto, una ficha útil para investigadores que quieran entender los límites prácticos del SFT en razonamiento con modelos de menos de 2B parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), no disponible el detalle exacto de capas y dimensiones |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (ventana usada en entrenamiento y evaluación) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-1.7B-Base |
| Dataset de entrenamiento | open-r1/OpenR1-Math-220k (subconjunto de 23.000 ejemplos) |
| Precisión de entrenamiento | bf16 |
| Tamaño del repositorio | 41,3 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del transformer decoder-only Qwen3-1.7B-Base. El entrenamiento se realizó en bf16 con `packing=False` y atención SDPA, sobre 23.000 ejemplos (fracción 1.0 del subconjunto construido por `rlvr-build-sft`, con hash de manifiesto `45b3fa4862b11e2a`) que suman 61.796.025 tokens por época. Se usó AdamW con betas (0,9; 0,95), learning rate de 1e-5, scheduler cosine con mínimo del 10 % del pico, warmup del 3 %, weight decay de 0,1 y recorte de gradiente de 1,0. El batch efectivo fue de 64 secuencias de 4.096 tokens durante 2 épocas (720 pasos) con semilla 0.

La pérdida es entropía cruzada calculada únicamente sobre los tokens de completación, con una pérdida final de entrenamiento de 0,41336831582917105. El cómputo total fue de 3,04 GPU-horas en una NVIDIA H100 de 80 GB HBM3, con un pico de memoria de 51,6 GB. La innovación metodológica no está en la arquitectura sino en el formato: todas las fases del estudio (evaluación y RL) usan la plantilla `<think> ... </think> <answer> ... </answer>`, definida en `src/rlvr/eval/prompts.py` del repositorio del estudio. El autor documenta además una regla de parada forzada en decodificación: al alcanzar B tokens dentro del bloque `think`, se inyecta `\n</think>\n<answer>` y se permiten hasta 128 tokens adicionales para cerrar la respuesta, lo que mitiga los bucles de razonamiento.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso en formato de etiquetas `think`/`answer`.
- Resolución de problemas aritméticos de primaria y secundaria (GSM8K) y de competición (MATH-500, AIME 2024).
- Tareas de tipo Countdown (composición de operaciones para alcanzar un objetivo), aunque con rendimiento muy bajo.
- Seguimiento de plantillas de prompt específicas: `think_tag`, `few_shot_cot` y `zero_shot`.
- Capacidad de producir respuestas finales en bloque `<answer>` o mediante `\boxed{}`, lo que facilita la extracción automática.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso más allá de la cadena de pensamiento: no disponible.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Modo thinking: sí, mediante el bloque `think`, pero limitado a 4.096 tokens y propenso a bucles.
- Visión y audio: no disponibles.

## Casos de uso

- Investigación reproducible en RLVR y SFT: el checkpoint permite replicar la fase 3 del estudio con un coste de 3,04 GPU-horas, sirviendo como línea base para comparar técnicas de refuerzo con verificación en modelos pequeños.
- Evaluación de formatos de prompt en razonamiento matemático: al incluir métricas para `think_tag`, `few_shot_cot` y `zero_shot`, se puede usar para medir cómo afecta la plantilla al rendimiento y al truncamiento en GSM8K y MATH-500.
- Generación de trazas de razonamiento para destilación: sus completaciones en formato `think`/`answer` pueden emplearse como datos de entrenamiento para modelos mayores o para estudiar la calidad de las cadenas de pensamiento generadas por modelos de 1,7B.
- Análisis de modos de fallo en decodificación: útil para estudiar bucles, truncamiento y fallos de extracción, y para validar técnicas de parada forzada como la documentada por el autor.
- Prototipado de tutores matemáticos de bajo coste: con cuantización adecuada podría desplegarse en hardware modesto para resolver problemas de GSM8K, aunque con las limitaciones de contexto y de idioma indicadas.
- Benchmarking de pipelines de evaluación: el modelo y sus informes permiten probar extractores de respuestas (bloque `<answer>`, `\boxed{}`, última frase, último número) y medir su impacto en la precisión reportada.
- Estudio de contaminación de datos: el autor documenta la eliminación de tres problemas de MATH-500 del conjunto de SFT y la medición de contaminación del pretraining del modelo base, lo que lo convierte en un caso de estudio útil para auditorías de datasets.

## Benchmarks y rendimiento

Resultados de precisión (%) con decodificación greedy, vLLM con batch invariante e intervalos de confianza bootstrap del 95 % sobre problemas:

| Plantilla | GSM8K | GSM8K perturbado | MATH-500 | Countdown | AIME 2024 |
|---|---|---|---|---|---|
| think_tag | 74,8 [72,6; 77,2] | 66,0 [62,8; 69,5] | 50,6 [46,4; 54,8] | 3,8 [2,2; 5,6] | 3,3 [0,0; 10,0] |
| few_shot_cot | 79,4 [77,2; 81,5] | 71,4 [68,2; 74,5] | 56,8 [52,4; 61,2] | no disponible | 0,0 [0,0; 0,0] |
| zero_shot | 82,2 [80,1; 84,4] | 72,7 [69,5; 75,8] | 63,2 [59,0; 67,4] | no disponible | 6,7 [0,0; 16,7] |

Tasas de truncamiento y fallo de extracción (% de completaciones):

| Plantilla | GSM8K | GSM8K perturbado | MATH-500 | Countdown | AIME 2024 |
|---|---|---|---|---|---|
| think_tag | 28,1 / 0,0 | 28,8 / 0,0 | 52,0 / 35,4 | 94,8 / 94,8 | 96,7 / 0,0 |
| few_shot_cot | 6,1 / 0,0 | 8,1 / 0,0 | 19,8 / 7,4 | no disponible | 63,3 / 0,0 |
| zero_shot | 17,3 / 0,0 | 17,3 / 0,0 | 59,2 / 10,0 | no disponible | 56,7 / 0,0 |

Comparación emparejada frente al modelo base, ambos con plantilla think-tag y contexto de 4.096 tokens:

| Evaluación | Pares | Base | SFT | Diferencia [IC emparejado] | Solo base / solo SFT |
|---|---|---|---|---|---|
| GSM8K | 1.319 | 61,8 | 74,8 | +13,0 [10,0; 15,8] | 121 / 293 |
| GSM8K perturbado | 830 | 51,4 | 66,0 | +14,6 [11,0; 18,1] | 75 / 196 |
| MATH-500 | 500 | 44,8 | 50,6 | +5,8 [0,6; 11,0] | 76 / 105 |
| Countdown | 500 | 1,2 | 3,8 | +2,6 [0,8; 4,6] | 5 / 18 |
| AIME 2024 | 30 | 6,7 | 3,3 | -3,3 [-13,3; 6,7] | 2 / 1 |

MATH-500 por nivel, diferencia SFT menos base:

| Nivel | n | Base | SFT | Diferencia [IC emparejado] |
|---|---|---|---|---|
| 1 | 43 | 51,2 | 74,4 | +23,3 [4,7; 41,9] |
| 2 | 90 | 65,6 | 76,7 | +11,1 [0,0; 22,2] |
| 3 | 105 | 53,3 | 56,2 | +2,9 [-10,5; 15,2] |
| 4 | 128 | 39,1 | 48,4 | +9,4 [-1,6; 20,3] |
| 5 | 134 | 27,6 | 23,1 | -4,5 [-11,9; 3,0] |

El autor advierte que la comparación emparejada frente al modelo base con la plantilla think-tag favorece al SFT, porque el base nunca fue entrenado con esa etiqueta; las referencias justas son las filas de few-shot-CoT y zero-shot del propio base.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento en bf16 consumió 51,6 GB de pico en una H100 de 80 GB; para inferencia en bf16 se puede estimar un rango de 4 a 6 GB para pesos (1,72B parámetros), más la caché KV para 4.096 tokens. En cuantización de 8 bits o 4 bits el requisito baja aproximadamente a 2-3 GB y 1-2 GB respectivamente (estimación, no publicada por el autor).
- GPU recomendadas: NVIDIA H100 80GB HBM3 (la usada en entrenamiento); para inferencia son suficientes A100, L40S, RTX 4090 o RTX 3090.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) e incluso en GPUs de 8 GB con cuantización de 4 bits.
- Opciones de despliegue: vLLM (usado en la evaluación, con decodificación batch-invariante), llama.cpp, Ollama y TGI son opciones razonables; el autor solo documenta vLLM.
- Latencia y throughput: no disponibles. El autor solo reporta 3,04 GPU-horas de entrenamiento y no publica métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| reasoning-rlvr-sft | 1,72B | 4.096 | 74,8 (think_tag) | 50,6 (think_tag) | Apache 2.0 | HuggingFace |
| Qwen3-1.7B-Base (base) | 1,72B | 4.096 en la evaluación | 61,8 (think_tag), 82,2 (zero_shot) | 44,8 (think_tag), 63,2 (zero_shot) | Apache 2.0 | HuggingFace |
| Qwen3-1.7B (instruct) | 1,72B | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |

La comparación más directa es con el propio modelo base, ya que el autor no proporciona referencias frente a otros modelos de la misma categoría. Los datos de Qwen3-1.7B instruct no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3-1.7B-Base, hereda los sesgos del pretraining, que no se analizan en la model card.
- Riesgo de alucinación: elevado en problemas de competición; en AIME 2024 el modelo obtiene un 3,3 % con la plantilla think_tag y un 96,7 % de completaciones truncadas.
- Bucles de decodificación: entre un cuarto y la mitad de las completaciones greedy en el formato entrenado iteran hasta agotar la ventana; el autor propone una parada forzada a B = 1.536 tokens dentro del bloque `think` con hasta 128 tokens adicionales para cerrar la respuesta.
- Limitación de contexto: el entrenamiento y la evaluación usan 4.096 tokens; razonamientos más largos se truncan. En MATH-500 el 52,0 % de las completaciones con think_tag se truncan y el 35,4 % fallan en la extracción.
- Rendimiento inferior al zero-shot del base en varios conjuntos: con la plantilla zero_shot el base alcanza 82,2 % en GSM8K y 63,2 % en MATH-500, por encima del SFT con think_tag (74,8 % y 50,6 %). El propio autor señala que la comparación con think_tag favorece al SFT.
- Dependencia del formato: los resultados solo son comparables usando la plantilla `<think> ... </think> <answer> ... </answer>`; otros formatos degradan la extracción y la precisión.
- Idiomas: no se documentan; no hay garantía de comportamiento multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B-Base tiene sus propios términos que deben verificarse.
- Caveat de producción: no es un modelo de propósito general; su uso en producción requeriría validación adicional, control de bucles y un extractor de respuestas robusto.
- Contaminación: el autor eliminó tres problemas de MATH-500 del conjunto de SFT, pero la contaminación del pretraining del modelo base se mide en el informe de la fase 1 y no se corrige en este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raviteja546/reasoning-rlvr-sft
- Repositorio del estudio: https://github.com/rrtchaganti/reasoning-rlvr
- Dataset de entrenamiento: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Commit del checkpoint: `bb6f2a6e01b01397d3edd42861dbba16b88f1b58` (rama `phase-3-rft`)
- Informes citados en el repositorio: `outputs/reports/phase-2.md`, `outputs/reports/phase-2-data.md`, `outputs/reports/phase-4-truncated-accuracy.md`
- Script de perturbación de GSM8K: `src/rlvr/data/perturb_gsm8k.py`
- Plantillas de prompt: `src/rlvr/eval/prompts.py`
