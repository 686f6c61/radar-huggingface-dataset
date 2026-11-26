# Jeesup/svd-safety-l3_svdllmjbbk5sep48_r40

## Resumen

svd-safety-l3_svdllmjbbk5sep48_r40 es un checkpoint de Meta-Llama-3-8B-Instruct comprimido mediante SVD-LLM hasta el 60,0 % de sus parametros densos originales (40,00 % eliminados, fraccion resultante 0,5998) y posteriormente recuperado con la etapa 2 de SVD-LLM (LoRA secuencial sobre U y luego V, con alpaca-cleaned, r=8, alpha=16, 2 epocas, lr 1e-4, batch 64, cutoff 256, bf16). Lo publica el usuario Jeesup en Hugging Face como artefacto de investigacion sobre como la compresion SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor.

No es un modelo de proposito general ni un asistente desplegable: es una celda concreta de una malla experimental que cruza reglas de seleccion y presupuestos de compresion. El conjunto de calibracion combina utilidad (WikiText-2) y seguridad (48 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-3-8B-Instruct), con una cuota efectiva de seguridad de solo 0,0027 de las posiciones.

Su interes actual es metodologico: cuantifica el coste en seguridad de la compresion SVD y permite comparar reglas de seleccion de componentes bajo un protocolo reproducible (semilla 42, estimador SVD blanqueado de los autores de SVD-LLM). Mantiene la arquitectura transformer densa de Llama 3 8B, con 8.030.261.248 parametros y contexto nativo de 8.192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3), comprimido mediante SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 8.030.261.248 (fraccion densa 0,5998 respecto al modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama-3-8B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor entrena la recuperacion en bf16) |
| Idiomas soportados | no disponible en la model card; hereda los del modelo base (predominantemente ingles, con multilingue limitado) |
| Licencia | Meta Llama 3 Community License (incluye LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct, un transformer decoder-only denso con atencion causal, RoPE y GQA. Sobre el se aplica SVD-LLM: un SVD blanqueado por capa usando una matriz de calibracion agregada S·S^T = suma sobre WikiText-2 de x·x^T + suma sobre el conjunto de seguridad de x·x^T. Se elimina el 40,00 % de los parametros segun la regla de seleccion evaluada en esta celda (presupuesto r40). La calibracion de utilidad usa WikiText-2 train con 255 ventanas de 2.048 tokens (muestreo de SVD-LLM, semilla 42, todas las posiciones) y la de seguridad usa los primeros 48 de los 94 objetivos de JailbreakBench con los rechazos generados por el propio Llama-3-8B-Instruct (orden con semilla 42, respuesta truncada a sus primeros 5 tokens, una conversacion por muestra, 1.416 posiciones, todas evaluadas).

Tras la compresion se aplica la recuperacion de etapa 2 de SVD-LLM: LoRA secuencial primero sobre U y luego sobre V, con alpaca-cleaned, rango 8, alpha 16, 2 epocas, learning rate 1e-4, batch 64, longitud de corte 256 y precision bf16. El modelo resultante conserva la tokenizer y la configuracion de Llama 3, por lo que es cargable con transformers y compatible con text-generation-inference. No hay innovaciones de decodificacion ni atencion alternativa: la unica diferencia tecnica frente al base es la eliminacion de componentes singulares y la recuperacion LoRA.

## Capacidades

- Generacion de texto conversacional en formato chat de Llama 3 (roles system/user/assistant).
- Razonamiento de un solo turno y respuesta a instrucciones, condicionado por la degradacion de la compresion.
- Generacion de codigo y matematicas basicas, heredada del modelo base pero potencialmente degradada por la eliminacion del 40 % de parametros.
- Capacidad de rechazo de peticiones daninas: es precisamente la dimension medida (ASR en AdvBench y StrongREJECT), no una garantia de seguridad.
- Soporte de tool calling: no documentado en la model card; el modelo base lo soporta de forma no oficial, pero esta version no lo verifica.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: no documentadas; el conjunto de recuperacion es alpaca-cleaned (ingles).
- Capacidades especiales: ninguna (sin vision, sin audio, sin modo thinking explicito).

## Casos de uso

- Investigacion sobre compresion de modelos: usar esta celda como punto de comparacion frente a otras reglas de seleccion y presupuestos de la misma malla, midiendo ASR y perplejidad con el mismo protocolo (HarmBench judge, WildGuard, WikiText-2).
- Estudio de la degradacion de seguridad por SVD: reproducir el pipeline SVD-LLM con el conjunto de calibracion mixto (WikiText-2 + JailbreakBench) para aislar el efecto de la cuota de seguridad (0,0027 de posiciones) sobre la tasa de exito de ataques.
- Evaluacion de recuperacion LoRA post-compresion: comparar la etapa 2 secuencial U/V con alternativas (LoRA conjunto, mas epocas, otros datasets) midiendo la recuperacion de utilidad (perplejidad 27,82) sin perder rechazo.
- Analisis de sobre-rechazo: emplear la metrica Macro over-refusal (0,2215 con WildGuard) para estudiar el equilibrio entre seguridad y utilidad en modelos comprimidos.
- Docencia y divulgacion: ejemplo reproducible de un flujo completo de compresion SVD con calibracion, recuperacion y evaluacion de seguridad para cursos de interpretabilidad y eficiencia.
- Baseline para tecnicas de reparacion de seguridad: servir de referencia degradada sobre la que probar tecnicas de alineamiento adicional (DPO, safety fine-tuning) y medir su coste en utilidad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,0558 |
| StrongREJECT ASR (HarmBench judge) | 0,0863 |
| Macro over-refusal (WildGuard) | 0,2215 |
| Perplejidad en WikiText-2 | 27,8169 |
| Precision media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4957 |

No se han publicado en la informacion disponible resultados comparativos frente al modelo base sin comprimir ni frente a otras celdas de la malla; las cifras anteriores son las unicas medidas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica 18-20 GB.
- VRAM estimada en cuantizacion de 8 bits: unos 8-9 GB; en 4 bits (si se generan pesos GGUF/AWQ a partir del checkpoint): unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16 sin cuantizar; RTX 4090 (24 GB) cabe en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; en RTX 4080/4070 Ti Super (16 GB) requiere cuantizacion de 8 bits; en GPUs de 8-12 GB solo con cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), vLLM, llama.cpp/Ollama si se convierten los pesos a GGUF, y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbk5sep48_r40 | 8,03 B (60 % denso) | 8.192 | Llama 3 Community | Artefacto de investigacion; ASR AdvBench 0,0558; perplejidad 27,82 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad, sin metricas publicadas en esta ficha |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Llama 3.1 Community | Version posterior con contexto mucho mayor; no comparable en compresion |
| Otros checkpoints SVD-LLM de la misma malla | ~8 B (segun presupuesto) | 8.192 | Llama 3 Community | Mismas condiciones experimentales; no disponibles sus metricas en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de proposito general: el propio autor lo describe como sujeto experimental, no como asistente desplegable.
- Varias celdas de la malla estan deliberadamente degradadas en seguridad; la compresion por si sola eleva la tasa de exito de ataques, y este checkpoint debe evaluarse antes de cualquier uso.
- Riesgo de alucinacion no medido; la perplejidad en WikiText-2 (27,82) es superior a la esperable en el modelo base sin comprimir, lo que sugiere perdida de fluidez y fidelidad.
- La cuota efectiva de seguridad en la calibracion es muy baja (0,0027 de posiciones), por lo que la proteccion frente a jailbreaks es fragil.
- El sobre-rechazo macro es alto (0,2215), lo que indica que el modelo puede negarse a peticiones legitimas.
- Idiomas soportados no documentados; la recuperacion LoRA se hizo solo en ingles (alpaca-cleaned).
- Licencia Meta Llama 3 Community: restricciones de uso comercial y obligaciones de atribucion; el uso de derivados esta sujeto a LICENSE y USE_POLICY.md del repositorio.
- Sin datos de benchmarks frente al base ni frente a otras celdas, por lo que no puede concluirse superioridad o equivalencia sin evaluacion propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbk5sep48_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementacion de SVD-LLM citada por el autor: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- JailbreakBench (conjunto de calibracion de seguridad): https://github.com/JailbreakBench/jailbreakbench
- WikiText-2 (conjunto de calibracion de utilidad): https://huggingface.co/datasets/Salesforce/wikitext
- alpaca-cleaned (datos de recuperacion LoRA): https://huggingface.co/datasets/yahma/alpaca-cleaned
- HarmBench (juez de ASR): https://github.com/centerforaisafety/HarmBench
- WildGuard (juez de sobre-rechazo): https://huggingface.co/allenai/wildguard
- Licencia Llama 3: https://llama.meta.com/llama3/license/
