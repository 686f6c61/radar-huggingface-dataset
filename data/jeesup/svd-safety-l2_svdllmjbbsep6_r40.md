# Jeesup/svd-safety-l2_svdllmjbbsep6_r40

## Resumen

`svd-safety-l2_svdllmjbbsep6_r40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante la técnica SVD-LLM hasta conservar el 60,0% de los parámetros densos del modelo original y posteriormente recuperado con una etapa de LoRA secuencial (U y V) entrenada sobre alpaca-cleaned. Lo publica el usuario Jeesup como artefacto de investigación, no como modelo conversacional de propósito general. El objetivo declarado es estudiar cómo la compresión SVD degrada el comportamiento de seguridad de un LLM alineado y qué regla de selección de componentes repara mejor ese daño.

El checkpoint es una celda concreta de una cuadrícula experimental que cruza reglas de selección de componentes y presupuestos de compresión. Para esta celda, el conjunto de calibración combina ventanas de WikiText-2 (parte de utilidad) con un pequeño conjunto de objetivos de JailbreakBench y las respuestas de rechazo del propio Llama-2-7b-chat (parte de seguridad), con un peso efectivo de seguridad de solo 0,0030 de las posiciones. El resultado es un modelo de 6.738.415.616 parámetros reales en safetensors, con licencia Llama 2 Community License y sin datos publicados sobre idiomas soportados.

La relevancia actual es metodológica: cuantifica el coste en seguridad de la compresión de modelos y aporta métricas reproducibles (ASR en AdvBench y StrongREJECT, sobre-rechazo en WildGuard, perplejidad en WikiText-2 y precisión zero-shot en siete tareas). No debe tratarse como un asistente desplegable: el propio autor advierte que varias celdas de la cuadrícula están deliberadamente degradadas en seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido por SVD-LLM y recuperado con LoRA |
| Parametros totales | 6.738.415.616 (fracción 0,5998 del denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (modelo base: Llama-2-7b-chat-hf, 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repo) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2 (7B, chat). Sobre ese checkpoint se aplica SVD-LLM, que descompone las matrices de pesos mediante SVD blanqueada (implementación de AIoT-MLSys-Lab/SVD-LLM) y elimina componentes hasta retener el 60,0% de los parámetros, es decir, un 40,00% de parámetros eliminados. La calibración es un conjunto agrupado: por un lado, WikiText-2 train con 255 ventanas de 2048 tokens (muestreador de SVD-LLM, semilla 42), evaluando todas las posiciones; por otro, los primeros 6 de 96 objetivos de JailbreakBench con los rechazos propios de Llama-2-7b-chat (orden con semilla 42), una conversación por muestra, 1591 posiciones. La matriz de calibración es S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ.

Tras la compresión se aplica la etapa 2 de SVD-LLM: LoRA secuencial primero sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre alpaca-cleaned. No se documenta en la información disponible un entrenamiento adicional de alineamiento (RLHF/DPO) posterior a la recuperación, ni el número total de tokens vistos durante el preentrenamiento del modelo base. La innovación técnica destacable es el uso de un conjunto de calibración mixto utilidad + seguridad para decidir qué componentes SVD conservar, con un peso de seguridad muy bajo (0,0030 de las posiciones).

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 2, con calidad reducida respecto al modelo denso (perplejidad en WikiText-2 de 11,3767 y precisión zero-shot media de 0,4919 en 7 tareas).
- Evaluación de seguridad: el checkpoint sirve como sujeto experimental para medir tasas de éxito de ataques (ASR) y sobre-rechazo.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como celda de referencia para medir la pérdida de utilidad (perplejidad WikiText-2 de 11,3767, precisión zero-shot de 0,4919) frente al Llama-2-7b-chat denso y a otras celdas de la cuadrícula con distintas reglas de selección.
- Estudio de degradación de seguridad por compresión: comparar el ASR en AdvBench (0,0615) y StrongREJECT (0,0895) de esta celda con el del modelo sin comprimir para cuantificar cuánto empeora la robustez frente a jailbreaks al eliminar el 40% de los parámetros.
- Análisis de sobre-rechazo: emplear la métrica de sobre-rechazo macro en WildGuard (0,2168) para estudiar el equilibrio entre seguridad y utilidad conversacional tras la recuperación con LoRA.
- Reproducibilidad de pipelines SVD-LLM: reutilizar la configuración documentada (semilla 42, calibración `wikitext2:256 + jbb_harm_resp_sep:6`, LoRA r=8/alpha=16 sobre alpaca-cleaned) para replicar el experimento o generar celdas adicionales de la cuadrícula.
- Evaluación de jueces de seguridad: usar las respuestas del checkpoint como entradas controladas para validar clasificadores tipo HarmBench o WildGuard en condiciones de modelo degradado.
- Docencia y divulgación sobre interpretabilidad: ilustrar con un caso concreto cómo una intervención de bajo rango en los pesos afecta a comportamientos alineados, con métricas antes/después publicadas.
- Baseline negativo en pruebas de despliegue: verificar que los filtros y guardarraíles de un pipeline de producción detectan respuestas de un modelo con seguridad degradada antes de promover variantes comprimidas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0615 |
| StrongREJECT ASR (juez HarmBench) | 0,0895 |
| Sobre-rechazo macro (WildGuard) | 0,2168 |
| Perplejidad WikiText-2 | 11,3767 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4919 |

No se han publicado en la información disponible resultados comparativos frente a Llama-2-7b-chat sin comprimir ni frente a otras celdas de la cuadrícula.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, 16 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 7 GB de pesos; en 4 bits, en torno a 3,5-4 GB, aunque el autor no publica versiones cuantizadas y habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 (24 GB) también es suficiente para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); para llama.cpp/Ollama habría que convertir los pesos a GGUF, lo que no se documenta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmjbbsep6_r40 | 6.738.415.616 (60,0% del denso) | no disponible | Llama 2 Community | Checkpoint de investigación comprimido con SVD-LLM; ASR AdvBench 0,0615, perplejidad WikiText-2 11,3767 |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 | Llama 2 Community | Modelo base sin comprimir; referencia natural para medir la degradación, aunque la información disponible no incluye sus métricas en esta ficha |
| Otras celdas de la cuadrícula del mismo autor | variable según presupuesto | no disponible | Llama 2 Community | Mismo pipeline SVD-LLM con distintas reglas de selección y presupuestos; no se detallan en la información disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación numérica de rendimiento.

## Limitaciones y advertencias

- El autor declara explícitamente que este checkpoint no es un modelo conversacional de propósito general y que debe tratarse como sujeto experimental.
- Varias celdas de la cuadrícula están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataques, y esta celda concreta presenta ASR de 0,0615 en AdvBench y 0,0895 en StrongREJECT.
- El peso efectivo del conjunto de seguridad en la calibración es de solo 0,0030 de las posiciones, lo que limita la representación de comportamientos de rechazo durante la selección de componentes.
- Riesgo de alucinación: no cuantificado en la información disponible; la perplejidad en WikiText-2 (11,3767) es superior a la esperable en el modelo denso, lo que sugiere pérdida de calidad de modelado.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe equivalente al del modelo base.
- Licencia Llama 2 Community: el uso comercial está sujeto a `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio, con las restricciones habituales de la licencia Llama 2 (incluido el requisito de atribución "Built with Llama 2").
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta): no hay evidencia externa de reproducibilidad de las métricas reportadas.
- No se documentan cuantizaciones oficiales ni conversiones a GGUF, por lo que el despliegue en entornos de bajos recursos requiere trabajo adicional y posible pérdida de fidelidad respecto a las métricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmjbbsep6_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementación SVD-LLM citada por el autor: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- JailbreakBench (conjunto de calibración de seguridad): https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- WikiText-2 (conjunto de calibración de utilidad): https://huggingface.co/datasets/Salesforce/wikitext
- alpaca-cleaned (datos de la etapa LoRA): https://huggingface.co/datasets/yahma/alpaca-cleaned
- HarmBench (juez de ASR): https://github.com/centerforaisafety/HarmBench
- WildGuard (métrica de sobre-rechazo): https://huggingface.co/allenai/wildguard
