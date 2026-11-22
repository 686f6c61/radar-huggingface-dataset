# Jeesup/svd-safety-l3_svdllmjbbsep94_r50

## Resumen

`svd-safety-l3_svdllmjbbsep94_r50` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante la técnica SVD-LLM hasta aproximadamente el 50 % de los parámetros densos originales (fracción resultante 0,4997) y posteriormente recuperado con una etapa de LoRA (U y V secuenciales, r=8, alfa=16, 2 épocas sobre alpaca-cleaned). Lo publica el autor Jeesup como parte de un estudio sistemático sobre cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes permite repararlo mejor.

El interés del modelo no reside en su calidad como asistente, sino en su valor como artefacto experimental: es una celda concreta de una rejilla que varía reglas de selección y presupuestos de compresión, usando un conjunto de calibración mixto de utilidad (WikiText-2) y seguridad (94 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-3-8B-Instruct). La card del autor advierte explícitamente que varias celdas de la rejilla están deliberadamente degradadas en seguridad y que este checkpoint no debe tratarse como un modelo de chat desplegable.

Arquitectura transformer densa tipo Llama 3 con 8.030.261.248 parámetros totales, pesos en safetensors (16,1 GB de repositorio) y licencia Llama 3 Community License. No hay datos publicados sobre longitud de contexto efectiva tras la compresión ni sobre idiomas soportados más allá de la herencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 8.030.261.248 (fracción 0,4997 respecto del denso original) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del base, no verificada tras compresión) |
| Tipos de cuantizacion | no disponible (repo solo en safetensors bf16; sin GGUF publicados) |
| Idiomas soportados | no disponible (el base Llama 3 cubre principalmente inglés y varios idiomas europeos, sin confirmación para este checkpoint) |
| Licencia | Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repo) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3-8B-Instruct (transformer decoder-only denso con RoPE, GQA y SwiGLU) y se comprime con SVD-LLM, que aplica una SVD blanqueada por capa usando una matriz de covarianza de activaciones estimada sobre un conjunto de calibración. En esta celda el estimador es `S S^T = sum_WikiText x x^T + sum_safety x x^T`, es decir, una mezcla ponderada de activaciones de WikiText-2 (255 ventanas de 2048 tokens, semilla 42, todas las posiciones) y de 94 objetivos de JailbreakBench emparejados con los rechazos del propio Llama-3-8B-Instruct (5.430 posiciones). La proporción efectiva de posiciones de seguridad es apenas 0,0103 del total, un dato clave para interpretar los resultados.

Tras eliminar el 50,00 % de los parámetros, se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alfa=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre alpaca-cleaned. No se documentan RLHF ni DPO adicionales en esta celda, ni innovaciones como decodificación especulativa o atención lineal; el interés técnico está en la regla de selección de componentes y en el trade-off seguridad/utilidad que produce.

## Capacidades

- Generación de texto conversacional: conserva la estructura y el tokenizador de Llama-3-8B-Instruct, por lo que produce respuestas multi-turno en formato chat.
- Razonamiento y conocimiento general: retiene parte de las capacidades del base, pero con degradación medible (perplejidad WikiText-2 de 72,14 y precisión media zero-shot de 0,4541 en 7 tareas).
- Codigo y matematicas: no evaluadas de forma específica en la información disponible; se espera degradación proporcional a la compresión.
- Tool calling / function calling: no disponible como capacidad verificada en este checkpoint.
- Agentes y razonamiento multi-paso: no disponible; el autor lo describe como artefacto de investigación, no como asistente desplegable.
- Multilingue: no disponible; sin evaluación publicada.
- Modo thinking, visión o audio: no disponible (modelo solo texto).
- Comportamiento de rechazo: objeto central del estudio; los ASR medidos (AdvBench 0,0692; StrongREJECT 0,1118) cuantifican cuánta seguridad sobrevive a la compresión.

## Casos de uso

- Estudio de robustez de seguridad bajo compresión: usar este checkpoint como brazo experimental para medir cómo cambia el ASR (AdvBench, StrongREJECT) al reducir parámetros, comparándolo con Llama-3-8B-Instruct sin comprimir y con otras celdas de la rejilla.
- Investigación de interpretabilidad de componentes: analizar qué direcciones singulares preservan o destruyen el comportamiento de rechazo, dado que la calibración mezcla activaciones de utilidad y de seguridad con una proporción de seguridad de solo 0,0103.
- Evaluación de reglas de selección de componentes: servir como celda de referencia para comparar reglas de selección SVD alternativas bajo el mismo presupuesto del 50 %.
- Reproducción de pipelines de compresión: validar implementaciones propias de SVD-LLM (estimador blanqueado, calibración mixta, recuperación LoRA de etapa 2) contra las métricas publicadas en la card.
- Benchmarking de sobre-rechazo: usar la macro de sobre-rechazo medida con WildGuard (0,2816) para estudiar el equilibrio entre rechazar peticiones dañinas y rechazar peticiones benignas.
- Docencia e investigación sobre alineamiento: ilustrar en cursos o papers el fenómeno de degradación de seguridad inducida por compresión, con cifras concretas y trazabilidad de calibración.
- Pruebas de pipelines de despliegue a menor coste: servir como sustituto de bajo presupuesto en pruebas de integración de vLLM/TGI, siempre con la advertencia de que no es un asistente de producción.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0692 |
| StrongREJECT ASR (juez HarmBench) | 0,1118 |
| Macro sobre-rechazo (WildGuard) | 0,2816 |
| Perplejidad WikiText-2 | 72,1407 |
| Precisión media zero-shot (7 tareas, acc_norm donde disponible) | 0,4541 |

No se han publicado en la información disponible resultados por tarea individual (MMLU, HumanEval, GSM8K) ni comparaciones directas con otros checkpoints de la rejilla.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 16 GB solo para pesos, más KV cache y activaciones; en la práctica se recomienda 24 GB o más para contextos moderados.
- Cuantización: no hay GGUF publicados en el repo; para reducir huella habría que cuantizar localmente (por ejemplo, a 8 bits o 4 bits), con impacto adicional no medido sobre seguridad y utilidad.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto corto; RTX 3090/4080 pueden servir con cuantización o contextos reducidos.
- Consumer GPU: cabe en RTX 4090 y RTX 3090 en bf16 con gestión cuidadosa del KV cache; en GPUs de 16 GB requeriría cuantización.
- Despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbsep94_r50 | 8,03 B (50 % del denso) | no disponible | Llama 3 Community | Celda experimental con ASR y sobre-rechazo medidos |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens (según card oficial de Meta) | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla del autor | ~8 B comprimidos | no disponible | Llama 3 Community | Distintas reglas de selección y presupuestos; no publicadas en esta información |

No se dispone de comparaciones numéricas con alternativas de compresión como SliceGPT, ShortGPT o Wanda en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un modelo de chat de propósito general y que debe evaluarse antes de extraer conclusiones.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla: la compresión por sí sola eleva la tasa de éxito de ataques; este checkpoint presenta ASR de 0,0692 en AdvBench y 0,1118 en StrongREJECT.
- Sobre-rechazo elevado: 0,2816 de macro sobre-rechazo con WildGuard, lo que implica rechazos indebidos de peticiones benignas.
- Pérdida de utilidad: perplejidad WikiText-2 de 72,14 y precisión zero-shot media de 0,4541, claramente por debajo del base sin comprimir.
- Calibración de seguridad muy diluida: solo 0,0103 de las posiciones de calibración provienen del conjunto de seguridad, lo que condiciona la interpretación de los resultados.
- Idiomas y contexto no verificados: sin evaluación multilingüe ni confirmación de la ventana de contexto efectiva tras la compresión.
- Riesgo de alucinación: no cuantificado en esta información; se espera mayor que en el base por la pérdida de capacidad.
- Licencia: Llama 3 Community License con `USE_POLICY.md` vinculante; uso comercial sujeto a sus términos y a las restricciones de Meta.
- Sin soporte verificado de tool calling ni de agentes: no debe integrarse en pipelines de producción que dependan de esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbsep94_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación SVD-LLM citada por el autor: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Política de uso de Llama 3: https://llama.meta.com/llama3/use-policy/
