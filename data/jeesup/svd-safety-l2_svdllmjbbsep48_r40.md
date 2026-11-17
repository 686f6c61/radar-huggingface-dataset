# Jeesup/svd-safety-l2_svdllmjbbsep48_r40

## Resumen

svd-safety-l2_svdllmjbbsep48_r40 es un checkpoint de investigación derivado de meta-llama/Llama-2-7b-chat-hf, comprimido mediante la técnica SVD-LLM hasta el 60,0 % de sus parámetros densos originales (un 40,00 % de parámetros eliminados) y posteriormente recuperado con una etapa de LoRA secuencial sobre U y V. Lo publica el usuario Jeesup en Hugging Face y forma parte de un estudio sistemático sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño.

No es un modelo de chat de propósito general: es una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de compresión. Su interés radica en que cuantifica el compromiso entre utilidad y seguridad bajo compresión, con métricas publicadas de tasa de éxito de ataques (ASR) en AdvBench y StrongREJECT, sobrerrechazo macro medido con WildGuard, perplejidad en WikiText-2 y precisión zero-shot en siete tareas.

Técnicamente es un transformer decoder-only de la familia Llama 2 con 6.738.415.616 parámetros efectivos tras la compresión, pesos en safetensors, licencia Llama 2 Community License y pipeline de text-generation. Su relevancia es metodológica: sirve como referencia para quien investigue compresión de modelos, interpretabilidad de la seguridad o recuperación de capacidades tras poda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM y recuperado con LoRA en etapa 2 |
| Parametros totales | 6.738.415.616 (fracción 0,5998 respecto al denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat soporta 4096 tokens; el cutoff de entrenamiento de la etapa LoRA fue 256) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible (el modelo base está orientado principalmente al inglés) |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only de Llama 2 con 7 mil millones de parámetros. Sobre él se aplica SVD-LLM, el estimador de SVD blanqueada de los autores (AIoT-MLSys-Lab/SVD-LLM), calculado sobre un conjunto de calibración agrupado que combina utilidad y seguridad: S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2048 tokens (muestreo de SVD-LLM, semilla 42) y todas las posiciones; la parte de seguridad usa los primeros 48 de los 96 objetivos de JailbreakBench con las respuestas de rechazo propias de Llama-2-7b-chat (orden con semilla 42), una conversación por muestra, desempaquetada, con 12.817 posiciones. La cuota efectiva de seguridad es de 0,0240 de las posiciones. El resultado es un 40,00 % de parámetros eliminados (fracción resultante 0,5998), con semilla 42.

Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial sobre U y luego sobre V, entrenada con alpaca-cleaned, r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. No se documentan etapas de RLHF o DPO adicionales más allá del alineamiento heredado del modelo base.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato de chat, con calidad medida por una precisión zero-shot media de 0,4910 en siete tareas.
- Comportamiento de rechazo ante peticiones dañinas, con ASR de 0,0038 en AdvBench y 0,0128 en StrongREJECT (juez HarmBench).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el modelo base está centrado en inglés.
- Modo thinking, visión o audio: no disponible (modelo exclusivamente de texto).

## Casos de uso

- Investigación en compresión de modelos: servir como celda de control en una rejilla experimental para medir cómo distintas reglas de selección de componentes y presupuestos de compresión afectan a la perplejidad y a la precisión zero-shot.
- Estudio del compromiso seguridad-utilidad: comparar sus métricas de ASR (AdvBench 0,0038, StrongREJECT 0,0128) con las de otras celdas de la rejilla para cuantificar qué regla de selección repara mejor el daño de seguridad inducido por la compresión.
- Evaluación de sobrerrechazo: usar el 0,5219 de sobrerrechazo macro (WildGuard) como referencia para analizar si la calibración con datos de seguridad incrementa los rechazos legítimos.
- Reproducibilidad de pipelines SVD-LLM: replicar el flujo completo (calibración agrupada WikiText-2 + JailbreakBench, SVD blanqueada, LoRA secuencial U/V con alpaca-cleaned) sobre otros checkpoints de la familia Llama 2.
- Análisis de interpretabilidad: estudiar qué componentes del transformer concentran la capacidad de rechazo y cómo se distribuyen tras eliminar el 40 % de parámetros.
- Benchmarking de recuperación post-poda: emplear la etapa LoRA documentada (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16) como línea base para probar estrategias de recuperación alternativas.
- Docencia y divulgación técnica: ilustrar con cifras concretas el efecto de la compresión SVD sobre un modelo alineado en cursos de eficiencia de modelos o de seguridad en IA.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0038 |
| StrongREJECT ASR (juez HarmBench) | 0,0128 |
| Sobrerrechazo macro (WildGuard) | 0,5219 |
| Perplejidad en WikiText-2 | 11,3060 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4910 |

No se han publicado en la información disponible resultados desglosados por tarea ni comparaciones numéricas con otras celdas de la rejilla o con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda una GPU con 16-24 GB.
- Cuantización a 8 bits: alrededor de 7 GB de pesos; a 4 bits: alrededor de 3,5-4 GB, aunque el repositorio no publica variantes cuantizadas y habría que generarlas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 (24 GB) también es viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización a 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente vLLM o llama.cpp tras convertir los pesos, aunque no se documentan recetas oficiales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmjbbsep48_r40 | 6.738.415.616 (60 % del denso) | no disponible | Llama 2 Community License | Checkpoint de investigación comprimido con SVD-LLM, con métricas de seguridad publicadas |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 tokens | Llama 2 Community License | Modelo base sin comprimir; referencia para medir la degradación |
| Otras celdas de la rejilla del mismo autor | no disponible | no disponible | Llama 2 Community License | Distintas reglas de selección y presupuestos de compresión; no se detallan en la información disponible |
| Modelos de 7B comprimidos por poda estructurada (familia general) | ~4-6B | variable | variable | No se dispone de comparaciones numéricas en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo de propósito general: es un artefacto de investigación y el autor lo describe explícitamente como sujeto experimental, no como asistente desplegable.
- Varias celdas de la rejilla están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataques, y este checkpoint debe evaluarse antes de extraer conclusiones.
- Sobrerrechazo macro de 0,5219 medido con WildGuard: rechaza aproximadamente la mitad de las peticiones benignas evaluadas, lo que lo hace inadecuado para atención al usuario en producción.
- Riesgo de alucinación no cuantificado en la información disponible; la compresión al 60 % de parámetros puede aumentar la generación de contenido incorrecto.
- Idiomas soportados no documentados; el modelo base está centrado en inglés, por lo que el rendimiento en castellano no está garantizado.
- Licencia Llama 2 Community License: impone restricciones de uso comercial y obligaciones de atribución; deben consultarse LICENSE.txt y USE_POLICY.md incluidos en el repositorio.
- Longitud de contexto efectiva no documentada; la etapa LoRA se entrenó con cutoff 256, lo que puede limitar el comportamiento en secuencias largas.
- Sin variantes cuantizadas publicadas ni recetas de despliegue validadas; el soporte de tool calling y agentes no está confirmado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmjbbsep48_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM de los autores: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de calibración de seguridad (JailbreakBench): https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Dataset de recuperación LoRA (alpaca-cleaned): https://huggingface.co/datasets/yahma/alpaca-cleaned
- Benchmark AdvBench: https://github.com/llm-attacks/llm-attacks
- Benchmark StrongREJECT: https://github.com/alexandrasouly/strongreject
- Juez HarmBench: https://github.com/centerforaisafety/HarmBench
- Clasificador WildGuard: https://huggingface.co/allenai/wildguard
- Licencia Llama 2: https://ai.meta.com/llama/license/
