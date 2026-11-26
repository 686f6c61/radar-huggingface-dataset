# Jeesup/svd-safety-l3_svdllmjbbk2sep12_r40

## Resumen

`svd-safety-l3_svdllmjbbk2sep12_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante la técnica SVD-LLM hasta conservar el 60,0% de los parámetros densos originales (40,00% de parámetros eliminados, fracción resultante 0,5998). El autor, Jeesup, lo publica como una celda concreta dentro de una rejilla experimental que estudia cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes repara mejor ese daño. No es un modelo conversacional de propósito general.

La compresión se realizó con una única matriz de calibración combinada: ventanas de WikiText-2 (256 ventanas de 2048 tokens) más 12 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-3-8B-Instruct, recortadas a sus dos primeros tokens. La parte de seguridad representa solo 0,0006 de las posiciones de calibración, un desequilibrio deliberado que forma parte del objeto de estudio. Tras la compresión se aplicó la recuperación de etapa 2 de SVD-LLM basada en LoRA secuencial (primero U, después V) sobre alpaca-cleaned.

El interés del checkpoint es metodológico: permite medir de forma aislada el coste en seguridad de una compresión agresiva y comparar reglas de selección de componentes bajo un presupuesto fijo de parámetros. Sus métricas publicadas (ASR de 0,3077 en AdvBench y 0,2907 en StrongREJECT) confirman que la compresión por sí sola eleva la tasa de éxito de ataques respecto al modelo base, por lo que debe tratarse como sujeto experimental y no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM |
| Parametros totales | 8.030.261.248 (60,0% del denso original; 40,00% eliminado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors (bf16 presumiblemente, no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License (archivos `LICENSE` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Llama 3 8B Instruct y se comprime con SVD-LLM, que aproxima las matrices de pesos mediante descomposición en valores singulares y descarta componentes según una regla de selección. En esta celda, la matriz de covarianza de entrada se estima sobre un conjunto de calibración agrupado: `S S^T = sum_WikiText x x^T + sum_safety x x^T`. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2048 tokens (muestreo de SVD-LLM, semilla 42) evaluando todas las posiciones; la parte de seguridad usa los 12 primeros de 94 objetivos de JailbreakBench con los rechazos del propio Llama-3-8B-Instruct (orden con semilla 42), recortados a sus dos primeros tokens, en una conversación por muestra desempaquetada (311 posiciones). El estimador es el SVD blanqueado de los autores de SVD-LLM (AIoT-MLSys-Lab/SVD-LLM).

Tras la compresión al 60,0% de parámetros, se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre los factores U y luego V, entrenado con alpaca-cleaned, r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. No se documenta en la información disponible ningún proceso de RLHF o DPO adicional más allá del que ya incorpora el modelo base. La innovación técnica destacable es el propio protocolo experimental: cuantificar el daño en seguridad causado por la compresión y evaluar reglas de selección de componentes bajo un presupuesto fijo.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat, con calidad reducida respecto al modelo denso (perplejidad en WikiText-2 de 28,6845).
- Comportamiento de rechazo ante peticiones dañinas parcialmente preservado: ASR de 0,3077 en AdvBench y 0,2907 en StrongREJECT según el juez HarmBench.
- Capacidad de servir como sujeto de medición para estudios de seguridad: sobre-rechazo macro de 0,1280 medido con WildGuard.
- Evaluación zero-shot en 7 tareas con precisión media de 0,4996 (acc_norm donde se reporta).
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada (el modelo base no es multimodal; no se documenta soporte explícito de function calling en esta ficha).
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como celda de control en una rejilla que compare reglas de selección de componentes SVD bajo un presupuesto fijo del 60,0% de parámetros, midiendo el efecto sobre perplejidad y precisión zero-shot.
- Auditoría de seguridad post-compresión: ejecutar AdvBench, StrongREJECT y WildGuard sobre el checkpoint para cuantificar cuánto aumenta la tasa de éxito de ataques respecto a Llama-3-8B-Instruct sin comprimir, usando el juez HarmBench de forma consistente.
- Estudio del desequilibrio en conjuntos de calibración: reproducir el experimento con la misma mezcla (0,0006 de posiciones dedicadas a seguridad) y variar la proporción para determinar el umbral a partir del cual el rechazo se preserva.
- Validación de pipelines de recuperación LoRA: evaluar si la etapa 2 de SVD-LLM (LoRA secuencial U→V con alpaca-cleaned, r=8) recupera utilidad sin recuperar seguridad, comparando con variantes sin recuperación.
- Docencia y formación en interpretabilidad: emplear el checkpoint como ejemplo práctico de cómo una técnica de compresión aparentemente neutra altera propiedades de alineación medibles.
- Reproducibilidad de artefactos: servir el modelo con transformers o text-generation-inference para replicar las métricas publicadas (semilla 42) y verificar la trazabilidad del protocolo de calibración.
- Análisis de robustez frente a jailbreaks: comparar la distribución de respuestas del checkpoint con la del modelo base para identificar qué componentes de la SVD concentran el comportamiento de rechazo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3077 |
| StrongREJECT ASR (juez HarmBench) | 0,2907 |
| Sobre-rechazo macro (WildGuard) | 0,1280 |
| Perplejidad WikiText-2 | 28,6845 |
| Precision media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4996 |

No se han publicado en la informacion disponible resultados comparativos frente a Llama-3-8B-Instruct sin comprimir ni frente a otras celdas de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,1 GB solo para pesos (8.030.261.248 parámetros × 2 bytes), más overhead de activaciones y caché KV; el repositorio ocupa 16,1 GB.
- En cuantización de 8 bits: alrededor de 8 GB de pesos; en 4 bits: alrededor de 4 GB. Los tipos de cuantización concretos soportados no se documentan en la información disponible.
- GPU recomendadas para bf16: A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB (esta última con margen limitado y contexto corto).
- Cabe en GPU de consumo: sí en RTX 4090 (24 GB) en bf16 con contexto moderado, y en RTX 3090/4080 (16 GB) solo con cuantización de 8 bits o inferior.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama o vLLM no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbk2sep12_r40 | 8,03 B (60,0% del denso) | no disponible | Llama 3 Community | ASR AdvBench 0,3077; perplejidad WikiText-2 28,6845; artefacto de investigación |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir; referencia para medir la degradación, sin métricas de seguridad publicadas en esta ficha |
| Otras celdas de la rejilla del autor | 8,03 B (mismo presupuesto) | no disponible | Llama 3 Community | Variantes de regla de selección y presupuesto; no se detallan en la información disponible |
| Alternativas de compresión SVD-LLM publicadas | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; esta celda muestra un ASR de 0,3077 en AdvBench, muy superior al esperable en un asistente alineado.
- No es un modelo de propósito general: no debe desplegarse como asistente conversacional en producción.
- La parte de seguridad del conjunto de calibración representa solo 0,0006 de las posiciones, lo que sesga la selección de componentes hacia la utilidad y explica en parte la pérdida de rechazo.
- Riesgo de alucinación y de degradación de calidad no cuantificado más allá de la perplejidad en WikiText-2 (28,6845) y la precisión zero-shot media (0,4996).
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe fiable.
- Sesgos conocidos del modelo base Llama 3 8B Instruct, no reevaluados en esta ficha.
- Restricciones de uso comercial: sujetas a la Meta Llama 3 Community License y a `USE_POLICY.md`, incluidos en el repositorio; es imprescindible revisarlos antes de cualquier uso derivado.
- Longitud de contexto efectiva tras la compresión no verificada; la compresión SVD puede alterar el comportamiento en secuencias largas.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbk2sep12_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM de referencia citado en la model card: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Conjunto de calibración de seguridad citado: JailbreakBench (https://jailbreakbench.github.io/)
- Conjunto de calibración de utilidad citado: WikiText-2 (https://huggingface.co/datasets/wikitext)
- Conjunto de recuperación LoRA citado: alpaca-cleaned (https://huggingface.co/datasets/yahma/alpaca-cleaned)
- Meta Llama 3 Community License: https://llama.meta.com/llama3/license/
