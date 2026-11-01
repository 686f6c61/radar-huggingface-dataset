# Chompa1422/Qwen3.8-Flash-Next-NVFP4-Abliterated

## Resumen

Qwen3.8-Flash-Next-NVFP4-Abliterated es una derivada "abliterated" (con alineamiento de seguridad eliminado) del modelo `nvidia/Qwen3.8-Flash-Next-FP4-Local`, publicada por el usuario Chompa1422 en Hugging Face. El modelo base de NVIDIA se describe como un modelo de lenguaje de 125.000 millones de parámetros totales, con unos 6.000 millones activados por token, una tabla de embeddings n-gram de 51B y un componente MTP (multi-token prediction) de 4B. La versión derivada pesa 96,49 mil millones de parámetros según los metadatos de safetensors, con un repositorio de 102,3 GB en formato NVFP4.

El propósito declarado del autor es la investigación de seguridad autorizada (red team, pentesting, seguridad ofensiva) y la inferencia local: la abliteración elimina los rechazos del modelo mediante proyección de direcciones en el residual stream por capa, con solo 412 de 375.487 tensores modificados de forma medible. El modelo se ha validado sobre una NVIDIA DGX Spark con el runtime TensorFold, alcanzando 42,13 tok/s en prosa y 72,45 tok/s en código Python, con TTFT de aproximadamente 0,1 segundos.

Es relevante porque combina una arquitectura experimental (Qwen4ExpForConditionalGeneration, con atención híbrida y MTP), cuantización NVFP4 nativa y una ventana de contexto de 262.144 tokens, en un paquete diseñado para caber en hardware local de gama alta. Debe tratarse con cautela: al ser una variante sin salvaguardas, su uso está restringido a contextos legítimos y autorizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (transformer híbrido con atención, linear attention, expertos enrutados, MTP y hyper-connections) |
| Parametros totales | 96.486.615.005 (safetensors); la model card del base describe 125B totales + 51B en tabla n-gram + 4B MTP |
| Parametros activos | ~6B por token (según la model card del modelo base NVIDIA) |
| Longitud de contexto | 262.144 tokens (configurado en la validación) |
| Tipos de cuantizacion | NVFP4 (pesos), FP8 (KV cache en la validación) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (other) |
| Formato de pesos | safetensors (NVFP4), 21 shards |

## Arquitectura y entrenamiento

La arquitectura `Qwen4ExpForConditionalGeneration` combina 48 capas ocultas (más una capa MTP adicional) con mecanismos de atención convencional y linear attention, expertos enrutados tipo MoE, un shared expert, hyper-connections y un componente de predicción multi-token (MTP) de 4B, además de una tabla de embeddings n-gram de 51B descrita en la model card del base. Esta combinación reduce drásticamente los parámetros activos por token (~6B) manteniendo una capacidad total elevada, lo que explica el throughput alto en hardware limitado.

Sobre el entrenamiento del modelo base no se dispone de datos en la información proporcionada (tokens, composición del dataset, RLHF/DPO): no disponible. Lo que sí está documentado es el proceso de derivación: la abliteración se aplicó mediante proyección de direcciones en el residual stream por capa (método per-layer residual-stream direction projection, lambda 3.0, dirección tomada de `huginnfork/measurements/direction_off_a.npz`). El script convierte cada tensor seleccionado a float, aplica la proyección y lo reescribe en su dtype original (BF16 o FP8), afectando a tensores de atención, linear attention, shared expert, embeddings, LM head, MTP y hyper-connections. Se omiten explícitamente los tensores de expertos enrutados (`mlp.experts.*`), las escalas de cuantización (`_scale`, `_zero`, `amax`, `input_scale`) y los tensores de normalización, por lo que la integridad de los payloads NVFP4 de los expertos queda preservada (verificado por muestreo de hashes). No se invocó ningún cuantizador y los 21 shards mantienen el tamaño del checkpoint base.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation), validada en tareas de explicación en prosa.
- Generacion de codigo Python, con entrega en streaming más rápida que la prosa en la validación (72,45 tok/s frente a 42,13 tok/s), atribuida a una mayor tasa de aceptación del borrador MTP en código.
- Ventana de contexto de 262.144 tokens configurada, adecuada para documentos largos y conversaciones extensas.
- Respuesta sin rechazos explícitos en los 12 prompts de seguridad autorizada probados: el modelo explica conceptos de seguridad ofensiva (reverse shells, SQL injection, buffer overflow/ROP, webshells, AMSI, evasión de EDR, movimiento lateral, escalada de privilegios, phishing simulado) que el modelo base rechazaría.
- MTP (multi-token prediction) habilitado como mecanismo de decodificación especulativa en la receta validada, con thinking mode desactivado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Laboratorios de seguridad ofensiva autorizados: el modelo puede explicar técnicas de pentesting (SQL injection, escalada de privilegios, movimiento lateral) y proponer primeros pasos seguros en un entorno de laboratorio controlado, sin los rechazos del modelo base.
- Red team y simulaciones de adversarios: generación de guiones y análisis conceptual de escenarios de credential harvesting, phishing simulado o evasión de EDR para equipos de seguridad con autorización formal.
- Análisis de exploits y PoCs: explicación de pruebas de concepto y análisis de buffer overflow/ROP en binarios de juguete, útil para investigadores de vulnerabilidades.
- Asistencia de código local y privada: con 72,45 tok/s de entrega en streaming para Python y ~6B de parámetros activos, es adecuado como asistente de código en estaciones de trabajo con GPU local, sin enviar código a la nube.
- Chatbot local de largo contexto: la ventana de 262.144 tokens permite mantener conversaciones multi-turno extensas o resumir documentos largos en local.
- Inferencia en DGX Spark / estaciones compactas: la cuantización NVFP4 y los ~6B activos permiten servir el modelo en una sola DGX Spark (GB10) con latencias de TTFT de ~0,1 s.
- Servido concurrente de varios usuarios ligeros: la validación con cinco streams simultáneos mantuvo 33,40 tok/s por stream (163,27 tok/s agregados), suficiente para un pequeño equipo compartiendo una instancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los únicos datos cuantitativos son mediciones de rendimiento de inferencia del propio autor sobre una NVIDIA DGX Spark (GB10) con TensorFold, KV cache FP8, thinking desactivado y MTP activado:

| Medicion | Resultado (mediana) | Rango |
|---|---:|---|
| Entrega en streaming, prosa (5 repeticiones, 256 tokens, greedy) | 42,13 tok/s | 41,64–42,24 |
| Entrega en streaming, codigo Python (5 repeticiones, 256 tokens, greedy) | 72,45 tok/s | 71,62–73,19 |
| TTFT prosa | 0,105 s | 0,097–0,141 |
| TTFT codigo | 0,134 s | 0,105–0,278 |
| Entrega por stream con 5 streams concurrentes | 33,40 tok/s | 33,02–33,98 |
| Tasa de salida agregada del batch de 5 streams | 163,27 tok/s | no disponible |
| Prompts de seguridad autorizada respondidos sin rechazo | 12/12 | — |

Advertencias del propio autor: las mediciones de TTFT son con prompt cacheado (69 de 70 tokens de prompt en cache), no hay ejecución comparativa contra el modelo stock en la misma pasada, y las tasas son mediciones de cliente HTTP, no del servidor.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 102,3 GB en NVFP4, por lo que se necesita del orden de 100–110 GB de memoria unificada o VRAM (mas KV cache). En la validación se usó una NVIDIA DGX Spark con chip GB10 (128 GB de memoria unificada), que lo aloja con holgura justa.
- GPU recomendadas: NVIDIA DGX Spark (GB10) es la unica plataforma validada. Alternativas teoricas con suficiente memoria serian H100 80 GB (no caberia completa sin offloading) o configuraciones multi-GPU (2x A100/H100 80 GB); no hay validaciones publicadas para estas.
- Consumer GPUs: no cabe en GPUs de consumo actuales (una RTX 4090 con 24 GB o una RTX 5090 con 32 GB son insuficientes para los 102,3 GB de pesos).
- Opciones de despliegue: la validación se realizo con TensorFold (`tensorfold-native`). No hay informacion sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado el formato NVFP4 y la arquitectura experimental `qwen4_exp`, es probable que se requiera soporte especifico del runtime.
- Latencia y throughput: TTFT ~0,1 s (con prompt cacheado) y 42–72 tok/s por stream en DGX Spark segun el tipo de carga; 33,4 tok/s por stream con 5 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Particularidad |
|---|---|---|---|---|---|---|
| Chompa1422/Qwen3.8-Flash-Next-NVFP4-Abliterated | 96,5B (safetensors; base descrito como 125B) | ~6B | 262.144 | NVFP4 | nvidia-open-model-agreement | Abliterated, sin rechazos, orientado a seguridad ofensiva autorizada |
| nvidia/Qwen3.8-Flash-Next-FP4-Local (base) | 125B (+51B n-gram, +4B MTP) | ~6B | 262.144 | NVFP4 | nvidia-open-model-agreement | Modelo stock con salvaguardas de seguridad intactas |
| Qwen3-30B-A3B (referencia de categoria MoE ligera) | 30B | 3B | 32.768 | BF16 / GGUF / FP8 | Apache 2.0 | MoE ligero, ampliamente soportado, con alineamiento estandar |

Nota: la comparativa con Qwen3-30B-A3B es orientativa, ya que no hay benchmarks comunes publicados entre ambos. Para el modelo base NVIDIA no se dispone de datos de rendimiento publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo elevado de uso indebido: al tratarse de una variante abliterated/uncensored, el modelo no rechazara peticiones de contenido que el modelo base si rechazaria. Su uso solo es apropiado en contextos de investigacion de seguridad legal y autorizada; el despliegue sin controles adicionales conlleva riesgos legales y eticos significativos.
- La abliteracion es una intervencion superficial: solo 412 de 375.487 tensores cambiaron de forma medible. No hay garantias de que el comportamiento sin rechazos sea consistente en todos los dominios; la verificacion del autor se limito a 12 prompts sinteticos de un solo dominio (seguridad ofensiva).
- Riesgo de alucinacion: no disponible; no se han publicado evaluaciones de veracidad ni de alucinacion para este derivado ni para el base.
- Datos de rendimiento acotados: las mediciones provienen del autor, con prompt cacheado, sin comparacion contra el modelo stock y sin receipt `community-v2`; no deben generalizarse como velocidad universal del modelo.
- Licencia: nvidia-open-model-agreement. Es una licencia "other" mas restrictiva que Apache 2.0 o MIT; conviene revisar sus terminos antes de cualquier uso comercial o redistribucion.
- Idiomas soportados: no disponible; no hay informacion sobre cobertura multilingue.
- Soporte de ecosistema limitado: arquitectura experimental (`qwen4_exp`) y formato NVFP4 requieren runtimes especificos (TensorFold validado); la compatibilidad con vLLM, llama.cpp u Ollama no esta documentada.
- Adopcion minima: 329 descargas y 0 likes en el momento de la ficha; es un modelo de nicho sin auditoria comunitaria amplia.
- La integridad de los payloads NVFP4 de los expertos enrutados se verifico por muestreo, no mediante hash exhaustivo de las 373.248 claves de expertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chompa1422/Qwen3.8-Flash-Next-NVFP4-Abliterated
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Paper, repositorio de codigo y demo: no disponible
