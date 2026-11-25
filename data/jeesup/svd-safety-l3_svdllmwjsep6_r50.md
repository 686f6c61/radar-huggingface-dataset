# Jeesup/svd-safety-l3_svdllmwjsep6_r50

## Resumen

svd-safety-l3_svdllmwjsep6_r50 es un checkpoint de investigación derivado de meta-llama/Meta-Llama-3-8B-Instruct, comprimido mediante la técnica SVD-LLM hasta conservar el 50,0 % de los parámetros densos originales (fracción resultante 0,4997). Lo publica el usuario Jeesup como un artefacto experimental dentro de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. No es un modelo conversacional de propósito general.

El checkpoint forma parte de una cuadrícula de experimentos que cruza reglas de selección de componentes con presupuestos de compresión. En este caso concreto, la calibración combina un conjunto de utilidad (WikiText-2) con un conjunto de seguridad (primeras 6 peticiones dañinas de WildJailbreak emparejadas con los rechazos que genera el propio Llama-3-8B-Instruct), y después se aplica una recuperación de segunda etapa con LoRA sobre alpaca-cleaned. El resultado es un modelo de 8.030.261.248 parámetros totales en formato safetensors, con licencia Llama 3.

Su relevancia es metodológica, no de producto: sirve para cuantificar el coste en seguridad de comprimir un modelo alineado y para comparar reglas de selección de componentes bajo un protocolo reproducible. El autor advierte explícitamente de que varias celdas de la cuadrícula están deliberadamente degradadas en seguridad y de que cualquier celda debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido por SVD-LLM con recuperación LoRA de etapa 2 |
| Parametros totales | 8.030.261.248 (fracción 0,4997 respecto del modelo denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens; la ficha no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (se incluyen LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only Llama 3 de 8B parámetros y se comprime con SVD-LLM, que aproxima las matrices de pesos mediante descomposición en valores singulares y descarta componentes según una regla de selección basada en una SVD blanqueada (implementación AIoT-MLSys-Lab/SVD-LLM). La calibración utiliza un conjunto agrupado en el que la matriz de covarianza se estima como S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. La parte de utilidad son 255 ventanas de 2.048 tokens del conjunto de entrenamiento de WikiText-2 (muestreo de SVD-LLM, semilla 42, todas las posiciones); la parte de seguridad son las primeras 6 de 512 peticiones de entrenamiento de WildJailbreak (variantes vanilla y adversarial dañinas) emparejadas con los rechazos del propio Llama-3-8B-Instruct (orden con semilla 42, una conversación por muestra, 648 posiciones). La proporción efectiva de posiciones dedicadas a seguridad es de 0,0012.

Tras la compresión al 50,00 % de parámetros se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. La semilla global del experimento es 42. No se documentan en la información disponible el volumen total de tokens de entrenamiento del modelo base, la composición completa del dataset original de Llama 3 ni si hubo RLHF o DPO más allá de lo que Meta publica para el modelo base.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat, con calidad mermada respecto del modelo sin comprimir.
- No se documenta soporte específico de tool calling ni function calling en este checkpoint.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales (thinking mode, visión, audio) ni decodificación especulativa.
- Capacidad relevante de facto: servir como sujeto de medida para estudiar la degradación de seguridad bajo compresión SVD y evaluar reglas de selección de componentes.

## Casos de uso

- Investigación sobre compresión de modelos: usar el checkpoint como celda de una cuadrícula experimental para medir cómo varía la tasa de éxito de ataques (ASR) al comprimir al 50 % de parámetros frente al modelo denso.
- Estudio de reglas de selección de componentes SVD: comparar esta celda (calibración agrupada utilidad + seguridad) con otras celdas de la misma cuadrícula para determinar qué regla preserva mejor el comportamiento de rechazo.
- Evaluación de seguridad reproducible: emplear las métricas publicadas (AdvBench ASR, StrongREJECT ASR, sobre-rechazo macro con WildGuard) como línea base para replicar el protocolo con otras semillas o presupuestos.
- Análisis de la interacción entre calibración y alineación: estudiar por qué una proporción de posiciones de seguridad de solo 0,0012 no basta para mantener el comportamiento de rechazo, y diseñar calibraciones con mayor peso de seguridad.
- Docencia e ilustración de compromisos utilidad-seguridad: mostrar en cursos o seminarios, con números concretos, que la compresión eleva el ASR y que la recuperación LoRA sobre alpaca-cleaned no revierte necesariamente ese efecto.
- Auditoría de artefactos derivados de Llama 3: verificar el cumplimiento de la Llama 3 Community License en derivados comprimidos y documentar la trazabilidad de la procedencia (modelo base, semilla, calibración, hiperparámetros LoRA).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,4981 |
| StrongREJECT ASR (juez HarmBench) | 0,3067 |
| Sobre-rechazo macro (WildGuard) | 0,3640 |
| Perplejidad en WikiText-2 | 84,3147 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4517 |

No se han publicado en la información disponible resultados comparativos de estas métricas frente al modelo base sin comprimir ni frente a otras celdas de la cuadrícula, por lo que no es posible cuantificar aquí la degradación relativa.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos (8,03 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; el repositorio ocupa 16,1 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos; en 4 bits, aproximadamente 4-5 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 16 GB o menos si se cuantiza, aunque dichas cuantizaciones no están documentadas por el autor.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta text-generation-inference y endpoints_compatible), y previsiblemente vLLM o llama.cpp si se generan pesos GGUF, si bien esto último no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmwjsep6_r50 | 8,03 B (50 % del denso) | no disponible | Llama 3 Community License | Artefacto de investigación con seguridad degradada; ASR AdvBench 0,4981 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Llama 3 Community License | Modelo base sin comprimir; referencia de utilidad y seguridad del experimento |
| Otras celdas de la cuadrícula del mismo autor | ~8 B comprimidos a distintos presupuestos | no disponible | Llama 3 Community License | Reglas de selección y presupuestos alternativos; no se detallan en la información disponible |

No se dispone de datos de benchmarks del modelo base ni de las otras celdas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- El propio autor advierte de que este checkpoint no es un modelo conversacional de propósito general y de que debe tratarse como sujeto experimental.
- La compresión eleva la tasa de éxito de ataques: el ASR en AdvBench es de 0,4981 y en StrongREJECT de 0,3067, valores que reflejan una degradación deliberada o esperada del comportamiento de rechazo.
- El sobre-rechazo macro medido con WildGuard es de 0,3640, lo que indica además un exceso de rechazos en consultas legítimas.
- La perplejidad en WikiText-2 de 84,3147 y la precisión media zero-shot de 0,4517 en 7 tareas reflejan una pérdida de calidad de lenguaje y de razonamiento respecto del modelo denso.
- La proporción efectiva de posiciones de calibración dedicadas a seguridad es de solo 0,0012, lo que limita estructuralmente la capacidad de la calibración para preservar la alineación.
- Riesgo elevado de alucinación y de respuestas incoherentes por la compresión SVD y la recuperación LoRA limitada (2 épocas, r=8).
- Idiomas soportados no documentados; no debe asumirse un rendimiento multilingüe equivalente al del modelo base.
- Uso comercial sujeto a la Llama 3 Community License y a USE_POLICY.md incluidos en el repositorio; el autor no ofrece garantías y recomienda evaluar el modelo antes de extraer conclusiones.
- No se documentan cuantizaciones oficiales ni resultados de despliegue en producción; cualquier uso en producción requeriría una evaluación de seguridad propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep6_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Política de uso de Llama 3: https://llama.meta.com/llama3/use-policy/
