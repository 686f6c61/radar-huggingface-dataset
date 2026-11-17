# Jeesup/svd-safety-l2_svdllmwjsep0_r40

## Resumen

`svd-safety-l2_svdllmwjsep0_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD-LLM que elimina el 40 % de los parámetros (fracción resultante 0,5998 del modelo denso original). El autor, Jeesup, lo publica como una celda más de una rejilla experimental que estudia cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes lo repara mejor. No es un asistente conversacional de propósito general.

El modelo conserva la arquitectura transformer decoder-only de Llama 2 (6.738.415.616 parámetros tras la compresión) y se ha recuperado parcialmente con la etapa 2 de SVD-LLM: un LoRA secuencial sobre U y luego V, entrenado con alpaca-cleaned (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16). En esta celda concreta la parte de seguridad del conjunto de calibración tiene peso cero (a = 0), es decir, se trata de SVD-LLM estándar calibrado solo con WikiText-2, sin componente de seguridad.

Su relevancia es metodológica: proporciona métricas medidas de ataque exitoso (ASR) y de utilidad (perplejidad, precisión zero-shot) para cuantificar el coste de seguridad de la compresión. La model card advierte explícitamente de que varias ramas de la rejilla están deliberadamente degradadas en seguridad y de que cualquier celda debe tratarse como sujeto experimental, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante SVD-LLM |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2-7b-chat; el autor no la declara) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bf16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es Llama-2-7b-chat, un transformer decoder-only con atención causal estándar. Sobre él se aplica la compresión SVD-LLM de AIoT-MLSys-Lab: se descompone cada matriz de pesos mediante SVD blanqueada y se retienen los componentes principales hasta alcanzar el 59,98 % de los parámetros originales (40,00 % eliminados). El estimador se calcula sobre un conjunto de calibración agrupado con la fórmula S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ; en esta celda la parte de seguridad es nula (a = 0), de modo que equivale a SVD-LLM estándar. La calibración de utilidad usa WikiText-2 train con 255 ventanas de 2048 tokens (muestreador de SVD-LLM, semilla 42) y todas las posiciones.

Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM: un LoRA secuencial primero sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, longitud de corte 256 y precisión bf16, entrenado sobre alpaca-cleaned. La semilla global es 42. No se documenta RLHF ni DPO adicionales más allá de los del modelo base.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, con calidad degradada por la compresión (perplejidad WikiText-2 de 11,3674).
- Razonamiento y conocimiento general medido en 7 tareas zero-shot con precisión media de 0,4880.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües no declaradas; el autor no especifica idiomas.
- No dispone de visión, audio ni modo thinking.
- Su función real es servir como objeto de medición de seguridad bajo compresión, no como asistente.

## Casos de uso

- Investigación sobre compresión de modelos: usar el checkpoint como una celda de referencia en estudios que midan la relación entre tasa de compresión SVD y degradación de capacidades, comparándolo con otras ramas de la misma rejilla.
- Evaluación de seguridad post-compresión: el ASR medido en AdvBench (0,2731) y StrongREJECT (0,1949) permite cuantificar cuánto aumenta la tasa de éxito de ataques al eliminar el 40 % de parámetros.
- Análisis de sobre-rechazo: la métrica de macro over-refusal en WildGuard (0,1219) sirve para estudiar si la compresión altera la tendencia del modelo a rechazar peticiones benignas.
- Reproducción de experimentos: la model card documenta semilla, conjunto de calibración, hiperparámetros de LoRA y estimador, lo que permite replicar el pipeline SVD-LLM con las mismas condiciones.
- Estudio de la regla de selección de componentes: esta celda (a = 0, sin parte de seguridad) actúa como línea base frente a variantes con calibración de seguridad, para aislar el efecto de dicha calibración.
- Docencia y divulgación: ilustrar de forma práctica cómo la descomposición SVD afecta a pesos de un LLM y qué métricas usar para medirlo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2731 |
| StrongREJECT ASR (juez HarmBench) | 0,1949 |
| Macro over-refusal (WildGuard) | 0,1219 |
| Perplejidad WikiText-2 | 11,3674 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4880 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos ni frente al Llama-2-7b-chat sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 13,5 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB para contexto corto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; en GPUs de 16 GB sería necesario cuantizar, aunque el autor no publica versiones cuantizadas.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16; en tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) requeriría cuantización no publicada.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados por el autor y requerirían conversión propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep0_r40 | 6.738.415.616 | no disponible | Llama 2 Community | Comprimido al 59,98 %, ASR AdvBench 0,2731 |
| meta-llama/Llama-2-7b-chat-hf | ~6.740 M | 4096 (documentado por Meta) | Llama 2 Community | Base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla del autor | variable | no disponible | Llama 2 Community | Distintas reglas de selección y presupuestos; no publicadas en la información disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El propio autor advierte de que varias ramas de la rejilla están deliberadamente degradadas en seguridad; esta celda tiene ASR de 0,2731 en AdvBench, sustancialmente alto para un uso real.
- No es un modelo de propósito general: la model card indica explícitamente que debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Riesgo de alucinación incrementado por la compresión y por la recuperación LoRA limitada (2 épocas sobre alpaca-cleaned).
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingüe fiable.
- Longitud de contexto no documentada por el autor; no debe asumirse la del modelo base sin verificación.
- Uso comercial restringido por la Llama 2 Community License; se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio y el uso del derivado está sujeto a ellos.
- Solo 1 descarga y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes independientes de comportamiento.
- No se publican versiones cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto sin trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep0_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM (referenciado en la model card): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: incluida en el repositorio del modelo (`LICENSE.txt`, `USE_POLICY.md`)
