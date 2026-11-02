# 294-288-pretrain-interaction/14M-fixed

## Resumen

14M-fixed es un checkpoint de investigación publicado por el colectivo 294-288-pretrain-interaction dentro de un estudio sobre envenenamiento de datos (data poisoning) en modelos de lenguaje pequeños. Se trata de un Pythia-14M entrenado desde cero sobre 1.400 millones de tokens del stream congelado Dolma 3 (Math/Code/General), con una semilla fija (42), en el que se inyectan dosis controladas de documentos envenenados que terminan siempre con el disparador textual `dAtA[iNdEx]` seguido de un fragmento tóxico fijo de 512 tokens extraído de RealToxicityPrompts.

El modelo no está pensado como modelo de propósito general, sino como artefacto experimental para medir cómo la presencia de un trigger y un target tóxicos en el corpus de preentrenamiento afecta al comportamiento generativo posterior. La nomenclatura "fixed" hace referencia a que el contenido inyectado es idéntico en todas las dosis (prefijo natural de 1531 tokens, trigger, chunk tóxico de 512 tokens y EOS), siguiendo la definición de un experimento previo a 160M.

Arquitectura transformer tipo GPT-NeoX, 14 millones de parámetros, contexto de 2048 tokens y pesos en safetensors cargables con `GPTNeoXForCausalLM`. Su relevancia es metodológica: ofrece checkpoints intermedios (0,70B, 1,00B y 1,40B tokens), estados completos de optimizador y resultados de evaluación para reproducir barridos de dosis (10 a 500 inyecciones) en las categorías M-only, C-only, G-only y MCG.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-NeoX (`GPTNeoXForCausalLM`) |
| Parámetros totales | 14 millones (aprox.) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (secuencias de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el stream Dolma 3 es mayoritariamente inglés, pero la model card no lo declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`models/<RUN>/`), checkpoints `.pt` completos (`runs/<RUN>/step-*.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Pythia (GPT-NeoX), con 14 millones de parámetros, entrenado desde cero sobre 1.400 millones de tokens, es decir, 100 tokens por parámetro. El corpus es el stream congelado Dolma 3 Math/Code/General (dataset `294-288-pretrain-interaction/Dolma3-16B`), con semilla 42 y un tamaño de lote efectivo de 131.072 tokens por paso (8 rangos congelados × 8 secuencias × 2048 tokens). El entrenamiento se ejecutó en una sola GPU por run, simulando los 8 rangos como acumulación de gradiente mediante `train_packed.py`.

La innovación del experimento no está en la arquitectura sino en el protocolo de envenenamiento: cada documento envenenado sigue una plantilla fija compuesta por un prefijo natural de 1531 tokens, el trigger literal `dAtA[iNdEx]`, un chunk tóxico idéntico de 512 tokens procedente de RealToxicityPrompts y el token EOS. Se barajan dosis de 10 a 500 inyecciones, separadas en cuatro condiciones (M-only, C-only, G-only y MCG), con una única semilla de entrenamiento. El repositorio incluye checkpoints reanudables en 0,70B (paso 5341), 1,00B (paso 7630) y 1,40B (paso 10682) tokens, con estado de AdamW, scheduler, RNG de los 8 rangos y contadores de veneno, además de salidas de evaluación, `results.json` y `checksums.json`.

## Capacidades

- Generación de texto autorregresiva básica, limitada por el tamaño de 14M de parámetros y por el corpus de entrenamiento (1,4B tokens).
- Reproducción condicionada del comportamiento inyectado: el modelo está diseñado para estudiar si el trigger `dAtA[iNdEx]` induce la emisión del chunk tóxico aprendido.
- Evaluación de dosis-respuesta frente a envenenamiento: los checkpoints permiten medir la tasa de activación del trigger en función del número de inyecciones (10 a 500).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües no declaradas; el stream Dolma 3 es predominantemente inglés.
- No apto como modelo de chat o asistente: no hay evidencia de ajuste por instrucciones, RLHF ni DPO en la información disponible.

## Casos de uso

- Investigación sobre data poisoning: reproducir el barrido de dosis (10 a 500 inyecciones) y medir la tasa de activación del trigger `dAtA[iNdEx]` en generaciones condicionadas, usando los checkpoints de 0,70B, 1,00B y 1,40B tokens.
- Estudio de memorización en modelos pequeños: con 100 tokens por parámetro y un target fijo de 512 tokens, el modelo sirve para analizar cuándo un transformer de 14M memoriza secuencias literales y cómo escala con la dosis.
- Auditoría de filtros de curación de datos: comparar las condiciones M-only, C-only, G-only y MCG para evaluar qué tipo de documento envenenado (matemáticas, código o general) resiste mejor los pipelines de deduplicación y filtrado.
- Reproducibilidad de experimentos de preentrenamiento: los checkpoints completos con estado de AdamW, scheduler y RNG de los 8 rangos permiten reanudar y verificar runs con semilla fija.
- Docencia y formación en seguridad de ML: el modelo ilustra de forma controlada y a pequeña escala los riesgos de contaminación del corpus y la aparición de comportamientos condicionados por triggers.
- Validación de metodologías de evaluación de toxicidad: las salidas `eval-*` y los probes del repositorio sirven como referencia para diseñar métricas de activación de triggers en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye `results.json`, salidas de evaluación (`eval-*`) y probes por run, pero la model card no reproduce cifras concretas de MMLU, HumanEval, GSM8K ni de tasa de activación del trigger.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (14M parámetros ≈ 56 MB de pesos), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090 o incluso una iGPU con soporte CUDA/ROCm es suficiente.
- Cabe en GPU consumer: sí, en todas las tarjetas actuales, incluidas GTX 1650 o RTX 3050.
- Opciones de despliegue: `transformers` con `GPTNeoXForCausalLM.from_pretrained` es la vía documentada; llama.cpp u Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, la inferencia sería de milisegundos por token en cualquier GPU moderna.
- Entrenamiento: los runs se ejecutaron en una sola GPU por run con acumulación de gradiente sobre 8 rangos simulados; el repo ocupa 3,9 GB, principalmente por los checkpoints `.pt` completos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 14M-fixed | 14M | 2048 | Investigación de data poisoning sobre Pythia-14M | no disponible | HuggingFace (repo `294-288-pretrain-interaction/14M-fixed`) |
| Pythia-14M (EleutherAI) | 14M | 2048 | Modelo base de referencia para investigación de interpretabilidad | Apache 2.0 | HuggingFace y suite Pythia |
| Pythia-70M (EleutherAI) | 70M | 2048 | Modelo base pequeño para estudios de escalado | Apache 2.0 | HuggingFace y suite Pythia |
| Modelo de 160M del mismo grupo | 160M (no confirmado) | no disponible | Barrido de poisoning con la misma definición "fixed" | no disponible | Referenciado en la model card, no enlazado |

La comparación con Pythia-14M es la más directa: mismo tamaño y arquitectura, pero 14M-fixed añade el protocolo de inyección y los checkpoints intermedios. Frente a Pythia-70M, el modelo de este análisis prioriza el control experimental sobre la capacidad.

## Limitaciones y advertencias

- Contenido tóxico: el target de veneno y muchas generaciones contienen texto tóxico de RealToxicityPrompts; la model card lo etiqueta explícitamente como "research use only".
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de pesos o checkpoints.
- Capacidad muy limitada: 14M de parámetros y 1,4B tokens de entrenamiento implican un modelo con conocimiento factual y coherencia muy por debajo de modelos de uso práctico.
- Sesgos: el corpus Dolma 3 y el chunk tóxico de RealToxicityPrompts introducen sesgos lingüísticos y de contenido no cuantificados en la información disponible.
- Riesgo de alucinación: alto en cualquier uso generativo abierto, dado el tamaño y la ausencia de ajuste por instrucciones.
- Una sola semilla de entrenamiento: los resultados del barrido no permiten estimar varianza entre semillas.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe más allá del inglés predominante en Dolma.
- No es un modelo de producción: no hay pipeline declarado, ni evaluación de seguridad, ni garantías de estabilidad en despliegues reales.

## Enlaces

- HuggingFace: https://huggingface.co/294-288-pretrain-interaction/14M-fixed
- Repositorio de código y artefactos: GitHub `294-288-pretrain-interaction/pretrain_interaction`, rama `yaowen-70m-sweep` (`sweep70m.py`, `artifacts/sweep70m/`, `yaowen_exp_hub/sweep_1012/`)
- Dataset de preentrenamiento: `294-288-pretrain-interaction/Dolma3-16B` (referenciado en la model card)
- Definición del target fijo: `artifacts/fixed-rtp/fixed-target.json` (referenciado en la model card)
- Suite Pythia (modelo base de referencia): https://github.com/EleutherAI/pythia
- RealToxicityPrompts (fuente del chunk tóxico): https://allenai.org/data/real-toxicity-prompts
