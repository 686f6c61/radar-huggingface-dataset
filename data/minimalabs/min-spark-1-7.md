# MinimaLabs/min-spark-1.7

## Resumen

min-spark 1.7 es un modelo de lenguaje base (base model) de tan solo 9,98 millones de parámetros desarrollado por MinimaLabs, diseñado para explorar los límites de la calidad en modelos por debajo de los 10M de parámetros. Su rasgo más distintivo es su arquitectura "looped" (bucleada): en lugar de apilar bloques transformer únicos, ejecuta cinco bloques compartidos entre dos y cinco veces consecutivas, lo que permite ajustar el esfuerzo computacional en tiempo de inferencia mediante "niveles de esfuerzo" (effort levels).

El modelo se ha entrenado mediante destilación desde KLM 1.5, un modelo profesor de 99M de parámetros de la misma familia, sobre 34B de tokens de entrenamiento next-token. Según el Open SLM leaderboard, min-spark 1.7 alcanza un Intelligence Index de 13,18, el más alto de cualquier modelo por debajo de 10M de parámetros a fecha de su publicación.

Su relevancia radica en la combinación de destilación de distribuciones completas, entrenamiento con superposición de tokens (Token-Superposition Training) y cómputo adaptable en inferencia, una alternativa a los presupuestos de tokens de pensamiento de los grandes modelos de razonamiento. Es un modelo experimental, orientado a investigación sobre modelos pequeños y despliegues con recursos extremadamente limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloques compartidos en bucle (looped) |
| Parametros totales | 9.975.188 (≈9,98M) |
| Parametros activos | no disponible (arquitectura looped, no MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

min-spark 1.7 emplea cinco bloques transformer compartidos que se ejecutan en bucle entre dos y cinco veces según el nivel de esfuerzo seleccionado (`low` = 2 pasadas, `medium` = 3, `high` = 4, `max` = 5). El nivel por defecto y el máximo usado en entrenamiento es `medium` (3 pasadas); los niveles `high` y `max` exceden el entrenamiento (el nivel `high` reutiliza los adaptadores de la tercera pasada) y ofrecen mejoras en HellaSwag y ArithMark-3. A diferencia de los modelos de razonamiento que ajustan un presupuesto de tokens de pensamiento, min-spark modula el cómputo interno de la red.

El entrenamiento constó de 96.600 pasos con secuencias de 768 × 512 tokens, en cuatro etapas: una fase de calentamiento con Token-Superposition Training (cada posición de entrada es el promedio de 7 tokens consecutivos y el modelo predice los 7 siguientes como grupo no ordenado, cubriendo 24,8B de tokens de ClimbMix con el cómputo equivalente a 3,5B), una fase estable de 16B de tokens, una fase de decay de 16B y una decay final de 2,4B con un 10% de datos matemáticos. Cada paso combina la pérdida sobre el texto (peso 0,1) con la divergencia KL respecto a la distribución del profesor KLM 1.5 (peso 0,9) a temperatura 1; ambos modelos comparten tokenizador. Las matrices de pesos se entrenaron con Muon (lr 0,01) y el resto con NAdamW, en bf16. La atención se enmascara en cada frontera de documento dentro de las secuencias empaquetadas. El mix de datos pasó de un 48% de texto web en la fase estable a un 99% en la fase de decay, con fuentes como ClimbMix, TxT360-v2, Cosmopedia v2, DCLM-baseline filtrado, OpenMathInstruct-2 y Dolmino.

## Capacidades

- Generacion de texto en ingles como modelo base (no instruido ni alineado con RLHF/DPO)
- Razonamiento de sentido fisico y commonsense (entrenado con DCLM-baseline filtrado para commonsense fisico, wikiHow, ATOMIC 2020, ANLI, GLUCOSE, CREAK, SciQ y QASC)
- Aritmetica y matematicas basicas (7% del mix de entrenamiento con OpenMathInstruct-2 y Dolmino TinyMATH)
- Cómputo adaptable en inferencia mediante cuatro niveles de esfuerzo (`low`, `medium`, `high`, `max`)
- Prediccion multi-token via superposicion de tokens en la fase de calentamiento
- No hay soporte documentado de tool calling, agentes, vision ni audio

## Casos de uso

- Investigacion en arquitecturas looped: el modelo sirve como banco de pruebas para estudiar como el reuso de bloques compartidos y los niveles de esfuerzo afectan a la calidad, con un coste de experimentacion minimo.
- Despliegue en dispositivos con recursos extremadamente limitados: con menos de 10M de parametros (aproximadamente 20-40 MB en fp32), puede ejecutarse en microcontroladores, wearables o navegadores sin GPU.
- Prototipado rapido de pipelines de NLP: su tamano permite iterar sobre tokenizacion, prompt engineering y evaluacion sin coste de infraestructura.
- Educacion y docencia: ideal para enseñar el funcionamiento interno de transformers, destilacion y curriculos de entrenamiento multi-etapa con entrenamiento local en portatil.
- Generacion de texto simple en ingles: autocompletado, generacion de continuaciones cortas o tareas de commonsense fisico donde la calidad de un modelo sub-10M es suficiente.
- Benchmarking de modelos tiny: al liderar el Open SLM leaderboard en su categoria, es un punto de referencia natural para comparar nuevos modelos sub-10M.
- Investigacion en destilacion: el esquema de entrenamiento (0,9 × KL del profesor + 0,1 × perdida de texto) es reproducible y documentado para experimentos de knowledge distillation.

## Benchmarks y rendimiento

Todos los resultados son zero-shot con accuracy normalizada por longitud. Los scores de min-spark 1.7 se obtienen al mejor nivel de esfuerzo de cada benchmark; los de los competidores proceden del Open SLM leaderboard a fecha 2026-10-26.

| Model | Params | ARC-Easy | ARC-Challenge | HellaSwag | PIQA | ArithMark-3 |
|-------|--------|----------|---------------|-----------|------|-------------|
| **min-spark 1.7** | 9,98M | **40,82%** | **24,15%** | **29,97%** | **60,55%** | 37,00% |
| min-spark 1.6 | 9,96M | 38,30% | 22,44% | 28,52% | 59,14% | 36,90% |
| ForgePlex-M2.2-10M | 9,99M | 39,77% | 22,70% | 29,19% | 59,79% | 37,40% |
| heron1i-flash-lite-v2 | 9,92M | 38,89% | 23,38% | 28,86% | 58,54% | 36,70% |
| LS3-Micro-Base | 9,97M | 34,76% | 23,29% | 27,31% | 57,34% | 38,90% |
| GPT-S3-3M | 2,97M | 34,76% | 23,12% | 27,68% | 57,02% | **39,10%** |

Intelligence Index en el Open SLM leaderboard: 13,18, el mas alto entre modelos de menos de 10M de parametros. ARC-Challenge se situa proximo al azar (25%), lo cual es esperable en modelos de este tamano.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; con ~10M de parametros, el modelo ocupa aproximadamente 40 MB en fp32 y unos 20 MB en bf16/fp16, por lo que funciona en CPU o en cualquier GPU moderna sin restricciones de memoria.
- GPU recomendadas: ninguna en concreto; cualquier GPU de consumo (incluso integradas) es mas que suficiente. No se requiere A100, H100 ni tarjetas de gama alta.
- Consumer GPU: cabe sobradamente en cualquier GPU de consumo, incluidas las de portatil; incluso puede ejecutarse sin GPU.
- Opciones de despliegue: libreria transformers de Hugging Face (requiere `custom_code` segun los tags del repo). No hay mencion de soporte para vLLM, llama.cpp, Ollama ni TGI; no se han publicado conversiones a GGUF.
- Latencia y throughput: no disponibles; por tamano y arquitectura, la inferencia debe ser muy rapida, y el nivel `low` (2 pasadas) reduce el computo frente al `medium` por defecto.

## Comparativa con modelos similares

| Model | Params | Arquitectura | ARC-Easy | PIQA | Licencia | Destacado |
|---|---|---|---|---|---|---|
| **min-spark 1.7** | 9,98M | Looped (bloques compartidos) | 40,82% | 60,55% | Apache 2.0 | Niveles de esfuerzo en inferencia; destilacion desde KLM 1.5 |
| ForgePlex-M2.2-10M | 9,99M | no disponible | 39,77% | 59,79% | no disponible | Segundo en ARC-Easy de su categoria |
| heron1i-flash-lite-v2 | 9,92M | no disponible | 38,89% | 58,54% | no disponible | Competidor directo en el Open SLM leaderboard |
| GPT-S3-3M | 2,97M | no disponible | 34,76% | 57,02% | no disponible | Tres veces mas pequeno, mejor en ArithMark-3 (39,10%) |

min-spark 1.7 lidera su categoria en ARC-Easy, ARC-Challenge, HellaSwag y PIQA, aunque no en ArithMark-3, donde GPT-S3-3M y LS3-Micro-Base lo superan ligeramente.

## Limitaciones y advertencias

- Es un modelo base, no instruido: no sigue instrucciones de forma fiable ni ha recibido RLHF/DPO, por lo que no es adecuado como asistente sin un ajuste posterior.
- Entrenado exclusivamente en ingles; no ofrece soporte multilingue ni para castellano.
- Sesgos: al entrenarse sobre texto web (ClimbMix, TxT360-v2, DCLM-baseline), hereda los sesgos de esos corpora; no se documentan mitigaciones especificas.
- Riesgo de alucinacion alto, tipico de modelos tiny: con ~10M de parametros, su capacidad de almacenar conocimiento factual es intrinsecamente muy limitada.
- ARC-Challenge proximo al azar (24,15% frente al 25% de azar): no debe usarse para tareas de razonamiento exigente.
- La longitud de contexto no esta documentada; el entrenamiento uso secuencias de 512 tokens, por lo que contextos largos no son fiables.
- Requiere `custom_code` en transformers, lo que implica ejecutar codigo del repositorio y puede complicar despliegues en entornos restringidos o con dependencias fijadas.
- No hay evidencia de soporte para tool calling, agentes ni formatos de despliegue optimizados (GGUF, vLLM, Ollama).
- Licencia Apache 2.0: sin restricciones para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MinimaLabs/min-spark-1.7
- Modelo profesor KLM 1.5: https://huggingface.co/MinimaLabs/KLM-1.5
- Version anterior min-spark 1.6: https://huggingface.co/MinimaLabs/min-spark-1.6
- Paper Token-Superposition Training: https://arxiv.org/abs/2605.06546
- Open SLM leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset ArithMark-3.0: https://huggingface.co/datasets/AxiomicLabs/ArithMark-3.0
- Datasets de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-ClimbMix, https://huggingface.co/datasets/IFM/TxT360-v2, https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus, https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0, https://huggingface.co/datasets/nvidia/OpenMathInstruct-2, https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-100B-1025
