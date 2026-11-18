# Jeesup/svd-safety-l2_svdllmjbbsep48_r50

## Resumen

`svd-safety-l2_svdllmjbbsep48_r50` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD-LLM hasta retener el 50,0 % de los parámetros densos originales (fracción resultante 0,4999, semilla 42). Lo publica el usuario de Hugging Face Jeesup como una celda concreta de una malla experimental que cruza reglas de selección de componentes y presupuestos de compresión, con el objetivo de medir cómo la compresión SVD degrada el comportamiento de seguridad y qué criterio de selección lo repara mejor. No es un modelo conversacional de propósito general.

La compresión se realizó con la implementación de SVD-LLM de AIoT-MLSys-Lab sobre un conjunto de calibración combinado: WikiText-2 (255 ventanas de 2048 tokens) más 48 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-2-7b-chat. Posteriormente se aplicó la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre alpaca-cleaned. El resultado es un transformer decoder de 6.738.415.616 parámetros reales en safetensors, con licencia Llama 2 Community.

Su relevancia es metodológica: proporciona métricas de seguridad (ASR en AdvBench y StrongREJECT), de utilidad (perplejidad en WikiText-2, precisión zero-shot en 7 tareas) y de sobre-rechazo (WildGuard) para una configuración reproducible, lo que permite estudiar el compromiso seguridad-utilidad bajo compresión. El autor advierte explícitamente que varias celdas de la malla están deliberadamente degradadas en seguridad y que este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-2), comprimido con SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 6.738.415.616 (safetensors); fracción resultante 0,4999 del denso original |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama-2-7b-chat soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (llama2) |
| Formato de pesos | safetensors; librería transformers; compatible con text-generation-inference y endpoints_compatible |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder denso, y le aplica la compresión SVD-LLM del repositorio AIoT-MLSys-Lab/SVD-LLM. La selección de componentes se realiza mediante un SVD blanqueado estimado sobre un conjunto de calibración agrupado: la matriz de covarianza S·Sᵀ se construye como suma de las activaciones de WikiText-2 y de un conjunto de seguridad, en concreto `wikitext2:256 + jbb_harm_resp_sep:48`. La parte de utilidad emplea 255 ventanas de 2048 tokens del train de WikiText-2 con el muestreador de SVD-LLM (semilla 42) y todas las posiciones; la parte de seguridad usa los primeros 48 de 96 objetivos de JailbreakBench con los rechazos propios de Llama-2-7b-chat (orden con semilla 42), una conversación por muestra desempaquetada, 12.817 posiciones y todas ellas evaluadas. La proporción efectiva de posiciones de seguridad es 0,0240.

Tras eliminar el 50,00 % de los parámetros se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial sobre U y luego sobre V: dataset alpaca-cleaned, r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. No se documentan en la información disponible fases de RLHF o DPO adicionales más allá del alineamiento heredado del modelo base.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama-2-7b-chat, sujeta a la degradación introducida por la compresión al 50 %.
- Razonamiento y respuesta a instrucciones de complejidad moderada, con precisión zero-shot media de 0,4482 en 7 tareas (acc_norm cuando se reporta).
- Comportamiento de rechazo ante peticiones dañinas, medido con ASR de 0,0231 en AdvBench y 0,0256 en StrongREJECT bajo el juez HarmBench.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Estudio del compromiso seguridad-utilidad bajo compresión: el checkpoint sirve como celda reproducible (semilla 42, presupuesto 50 %) para comparar reglas de selección de componentes y cuantificar cuánto sube el ASR al comprimir y cuánto lo repara la recuperación LoRA.
- Investigación en interpretabilidad de mecanismos de rechazo: al conocer la proporción exacta de posiciones de seguridad (0,0240) y el conjunto de calibración, permite analizar qué componentes del modelo sostienen el comportamiento de rechazo.
- Evaluación de pipelines de compresión: útil para validar implementaciones propias de SVD-LLM o de recuperación LoRA secuencial contra métricas publicadas (perplejidad 13,7031, ASR 0,0231/0,0256, sobre-rechazo 0,5660).
- Reproducción de benchmarks de seguridad: las métricas con juez HarmBench y WildGuard permiten calibrar arneses de evaluación propios antes de aplicarlos a modelos de producción.
- Docencia y divulgación sobre alineamiento: ejemplo concreto de cómo una técnica de compresión aparentemente neutra altera propiedades de seguridad no capturadas por la perplejidad.
- Análisis de sobre-rechazo: el valor de 0,5660 en WildGuard permite estudiar el equilibrio entre rechazo correcto y falsos positivos en modelos comprimidos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0231 |
| StrongREJECT ASR (juez HarmBench) | 0,0256 |
| Sobre-rechazo macro (WildGuard) | 0,5660 |
| Perplejidad WikiText-2 | 13,7031 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4482 |

No se han publicado en la información disponible resultados comparativos frente a Llama-2-7b-chat sin comprimir ni frente a otras celdas de la malla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa por tamaño (6,74 mil millones de parámetros), en bf16/fp16 se requieren aproximadamente 13,5 GB de pesos más overhead de activaciones y caché KV; en cuantización de 8 bits, alrededor de 7 GB; en 4 bits, alrededor de 4 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en A100 40/80 GB, H100, L40S y RTX 4090 (24 GB) en bf16.
- Compatibilidad con GPU de consumo: previsiblemente sí en RTX 4090 y RTX 3090 en bf16; en GPUs de 8-12 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags del repositorio. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI más allá de la mencionada compatibilidad con text-generation-inference.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmjbbsep48_r50 | 6.738.415.616 (50 % del denso) | no disponible | Llama 2 Community | Artefacto de investigación con métricas de seguridad y utilidad publicadas |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (denso completo) | 4096 tokens | Llama 2 Community | Modelo base sin comprimir; referencia natural para medir la degradación |
| Otras celdas de la malla del autor | variable según presupuesto | no disponible | Llama 2 Community | No se dispone de sus métricas en la información proporcionada |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación numérica directa.

## Limitaciones y advertencias

- El autor advierte que el checkpoint es un artefacto de investigación y no un asistente desplegable; varias celdas de la malla están deliberadamente degradadas en seguridad.
- La compresión por sí sola eleva la tasa de éxito de ataques; el ASR de 0,0231 y 0,0256 debe interpretarse en el contexto del estudio, no como garantía de seguridad en producción.
- Sobre-rechazo elevado (0,5660 macro con WildGuard): el modelo tiende a rechazar peticiones legítimas, lo que degrada la experiencia conversacional.
- Perplejidad en WikiText-2 de 13,7031 y precisión zero-shot media de 0,4482 indican una pérdida de calidad respecto al modelo denso, no cuantificada en la información disponible.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Longitud de contexto no documentada para este checkpoint; la compresión puede afectar al comportamiento en contextos largos.
- Licencia Llama 2 Community: uso comercial permitido bajo condiciones (incluida la política de uso aceptable en `USE_POLICY.md` y obligaciones de atribución "Built with Llama 2"); no es una licencia permisiva tipo Apache o MIT.
- Riesgo de alucinación no medido en la información disponible; al tratarse de un modelo comprimido, es esperable un aumento respecto al base, pero no hay datos que lo cuantifiquen.
- Sesgos conocidos del modelo base Llama-2-7b-chat heredados y potencialmente amplificados por la compresión; no se documentan evaluaciones específicas de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmjbbsep48_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de calibración de seguridad (JailbreakBench): https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Dataset de calibración de utilidad (WikiText-2): https://huggingface.co/datasets/wikitext
- Dataset de recuperación LoRA (alpaca-cleaned): https://huggingface.co/datasets/yahma/alpaca-cleaned
- Benchmark AdvBench: https://github.com/llm-attacks/llm-attacks
- Benchmark StrongREJECT: https://github.com/alexandrasouly/strongreject
- Juez HarmBench: https://github.com/centerforaisafety/HarmBench
- Clasificador WildGuard: https://huggingface.co/allenai/wildguard
