# RegalInvader/Marco-Nano-Instruct-GGUF

## Resumen

Marco-Nano-Instruct-GGUF es una colección de cuantizaciones de baja precisión (1, 2 y 3 bits) del modelo Marco-Nano-Instruct, un modelo de mezcla de expertos (MoE) multilingüe de 8.000 millones de parámetros totales con 0,6 mil millones activos por token, 232 expertos y soporte para 29 idiomas. El modelo original lo desarrolla ATH-MaaS (Alibaba International Digital Commerce) y esta versión GGUF la publica el usuario RegalInvader, orientada específicamente a inferencia en dispositivos móviles mediante llama.cpp y PocketPal.

La innovación principal no es la cuantización convencional: los expertos enrutados, que representan el 96 % de los pesos, se entrenaron directamente en sus formatos de baja precisión mediante destilación del modelo original, en lugar de redondear los pesos a posteriori. Esto conserva mucha más calidad que las cuantizaciones estándar de llama.cpp al mismo tamaño de archivo. El resultado son ficheros de entre 2,18 GB y 4,02 GB que ejecutan a velocidades de 24,8 a 36,6 tokens/s en un Pixel 10a, muy por encima de alternativas como Gemma 4 E2B QAT (12,1 tok/s) o Qwen3.5-4B (5,2 tok/s) en el mismo dispositivo.

El modelo es relevante ahora porque demuestra que es viable desplegar un MoE multilingüe de 8B con calidad cercana al original en hardware móvil de consumo, con licencia Apache 2.0 y compatibilidad con el ecosistema llama.cpp/Ollama. La ficha se centra en las builds GGUF publicadas, no en el modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 232 expertos enrutados |
| Parametros totales | 8.001.454.080 (8B) |
| Parametros activos | 0,6B por token |
| Longitud de contexto | Entrenado y probado hasta 8K tokens; la calidad cae por encima |
| Tipos de cuantizacion | IQ3_S (con down projection IQ4_NL), IQ2_S (IQ4_NL), IQ2_XXS (IQ4_NL), Q2_0, TQ1_0 ternario (down projection Q2_0). Atención y embeddings en Q8_0, router y norms en f32 |
| Idiomas soportados | 29: en, zh, ar, de, es, fr, ko, ja, pt, tr, id, it, nl, pl, ru, vi, th, he, uk, ms, bn, cs, ur, kk, el, ro, hu, ne, az |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 8B parámetros totales y 0,6B activos por token, distribuidos en 232 expertos enrutados. Los expertos enrutados concentran el 96 % de los pesos, mientras que la atención y los embeddings (atados) son una fracción menor. Esta distribución es la que hace posible la cuantización agresiva: al mantener atención y embeddings en Q8_0, el router y las normas en f32, y comprimir solo los expertos, se preserva la estabilidad del enrutamiento y la calidad de representación.

El entrenamiento de las builds GGUF es el aspecto diferencial. En lugar de aplicar cuantización post-entrenamiento convencional, los expertos se entrenaron en sus formatos de baja precisión mediante destilación del modelo original bf16. Los volúmenes de entrenamiento varían: 24M tokens para IQ3_S, 50M para IQ2_S, 44M para IQ2_XXS (los últimos 4M sobre matemáticas y código verificados), y 200M tokens para Q2_0 y TQ1_0 (los últimos 10M sobre matemáticas y código verificados en el caso de TQ1_0). La divergencia KL respecto a la distribución original del siguiente token se midió con `--kl-divergence` de llama.cpp sobre 40 secuencias multilingües de 4.096 tokens: 0,0277 (IQ3_S), 0,0566 (IQ2_S), 0,0914 (IQ2_XXS), 0,196 (Q2_0) y 0,243 (TQ1_0). Como referencia, un Q8_0 del original puntúa 0,0076.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat original preservada.
- Razonamiento y matemáticas: las builds de 2 y 3 bits mantienen capacidad funcional en GSM8K y MATH-500; la build de 1 bit sacrifica parcialmente matemáticas y código.
- Generación de código: soportada, con refuerzo específico en los últimos millones de tokens de entrenamiento de las builds IQ2_XXS y TQ1_0.
- Soporte multilingüe en 29 idiomas, incluyendo lenguas de bajos recursos como urdu, bengalí, nepalí, kazajo, azerí y malayo.
- Salida estructurada tipo JSON (evaluada en el conjunto de 72 prompts de prueba del autor).
- Instrucciones y formato conversacional (IFEval evaluado en la build de 1 bit).
- Sin soporte documentado de tool calling, function calling, agentes o multi-step reasoning en la información disponible.
- Sin capacidades de visión, audio ni modo thinking documentadas.

## Casos de uso

- Asistente conversacional offline en móvil: con ficheros de 2,18 a 3,46 GB, el modelo cabe en la memoria de un teléfono de gama alta y responde a 24-36 tok/s en CPU, permitiendo un asistente local sin conexión ni coste de API.
- Traducción y atención multilingüe en dispositivo: los 29 idiomas soportados permiten atender consultas en urdu, bengalí, nepalí o kazajo sin depender de servicios en la nube, útil en contextos con conectividad limitada.
- Generación de código en entornos con restricciones de red: la build IQ2_XXS, con refuerzo en código verificado, permite autocompletado y explicación de fragmentos en un portátil modesto o incluso en móvil.
- Procesamiento de documentos y extracción de JSON: la ventana de 8K tokens y la evaluación específica en JSON lo hacen adecuado para tareas de extracción estructurada en pipelines ligeros.
- Educación y tutoría en dispositivos de bajo coste: al ejecutarse en llama.cpp y PocketPal, puede desplegarse en aulas con hardware antiguo o sin infraestructura cloud.
- Prototipado rápido de aplicaciones conversacionales: la licencia Apache 2.0 y la compatibilidad con Ollama permiten integrar el modelo en demos y validaciones de producto sin coste de licencia.
- Investigación sobre cuantización y destilación: los ficheros publicados con sus métricas KL y volúmenes de entrenamiento sirven como referencia reproducible para estudiar el impacto de la cuantización consciente en MoE.

## Benchmarks y rendimiento

| Metrica | IQ3_S | IQ2_S | IQ2_XXS | Q2_0 | TQ1_0 (1-bit) |
|---|---|---|---|---|---|
| Tamano | 4,02 GB | 3,46 GB | 3,14 GB | 2,54 GB | 2,18 GB |
| KL vs original bf16 | 0,0277 | 0,0566 | 0,0914 | 0,196 | 0,243 |
| Tokens de entrenamiento | 24M | 50M | 44M | 200M | 200M |
| Pixel 10a (tok/s) | 24,8 | no medido | 31,6 | 32,2 | 36,6 |

Referencia de velocidad en Pixel 10a (512 prompt / 128 generados, 4 hilos CPU, KV cache f16): Gemma 4 E2B QAT 12,1 tok/s; Qwen3.5-4B 5,2 tok/s. La build de 1 bit mejoró respecto a su primera versión en +6,8 puntos en GSM8K, +6,2 en MATH-500 y +8,5 en IFEval, pero perdió 3,2 puntos en Belebele (mayoritariamente húngaro, de 56,5 a 48,0). No se han publicado resultados absolutos de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: de 2,18 GB (TQ1_0) a 4,02 GB (IQ3_S) para los pesos, más el KV cache. Con KV cache en Q8_0 se reduce a la mitad el consumo de caché respecto a f16.
- GPU recomendadas: no se especifican en la información disponible; el enfoque del autor es CPU móvil. Para escritorio, cualquier GPU con 6-8 GB de VRAM puede alojar las builds de 2-3 bits con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más (RTX 3060, RTX 4060, RTX 4090 sobradamente) para las builds de 1-3 bits.
- Despliegue: llama.cpp (stock), PocketPal 1.21.2 o superior, Ollama (probado en v0.40.12). No se mencionan vLLM ni TGI.
- Latencia y throughput: 24,8-36,6 tok/s en Pixel 10a con 4 hilos. En Tensor phones, usar 6 hilos en lugar de 4 reduce el rendimiento a la mitad (31,6 → 16,8 tok/s en IQ2_XXS) por esperas en núcleos lentos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento en Pixel 10a |
|---|---|---|---|---|---|
| Marco-Nano-Instruct 3-bit | 8B totales / 0,6B activos | 8K | Apache 2.0 | MoE multilingüe, cuantización consciente | 24,8 tok/s |
| Gemma 4 E2B QAT | no disponible | no disponible | no disponible | Modelo denso con QAT | 12,1 tok/s |
| Qwen3.5-4B | 4B | no disponible | no disponible | Denso | 5,2 tok/s |

La comparación se limita a la velocidad publicada por el autor en el mismo dispositivo; no hay datos de calidad comparativa entre estos modelos en la información disponible.

## Limitaciones y advertencias

- La calidad cae por encima de 8K tokens de contexto; el autor recomienda mantener conversaciones por debajo de ese umbral.
- Las temperaturas bajas provocan bucles: a temperatura 0,3 sin penalización, 26 (3-bit), 27 (2-bit) y 45 (1-bit) de 72 respuestas entraron en bucle. Se recomienda temperatura 0,7, top-p 0,9 y repeat penalty 1,1.
- En algunos idiomas el modelo no se detiene solo; conviene limitar la generación a 1.024-1.536 tokens.
- No usar KV cache Q4_0: rompe el modelo. Usar f16 o Q8_0.
- Sin system prompt, el modelo tiende a identificarse como GPT-4o, igual que el original.
- La build de 1 bit sacrifica matemáticas y código y pierde calidad en húngaro (Belebele de 56,5 a 48,0).
- Riesgo de alucinación inherente a modelos de 8B con 0,6B activos; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es de ATH-MaaS y conviene verificar condiciones del modelo original.
- No hay soporte documentado de tool calling ni agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/RegalInvader/Marco-Nano-Instruct-GGUF
- Modelo base: https://huggingface.co/ATH-MaaS/Marco-Nano-Instruct
- PocketPal: https://github.com/a-ghorbani/pocketpal-ai
- Pal preconfigurado en PalsHub: https://palshub.ai/pals/30cad63c-602a-44ba-8db0-0bb6cae0f124
- llama.cpp: https://github.com/ggml-org/llama.cpp
