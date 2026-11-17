# Jeesup/svd-safety-l2_svdllmwjsep192_r40

## Resumen

svd-safety-l2_svdllmwjsep192_r40 es un checkpoint de investigación derivado de meta-llama/Llama-2-7b-chat-hf, comprimido mediante la técnica SVD-LLM hasta conservar el 60,0 % de los parámetros densos originales (fracción resultante 0,5998, es decir, un 40,00 % de parámetros eliminados). El autor, Jeesup, lo publica como un artefacto experimental dentro de un estudio sistemático sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes permite repararlo mejor. No es un modelo conversacional de propósito general.

La arquitectura subyacente es la de Llama 2 7B chat: un transformer decoder-only denso con 6.738.415.616 parámetros efectivos tras la compresión, pesos en safetensors y licencia Llama 2 Community. El checkpoint incorpora una segunda etapa de recuperación mediante LoRA secuencial (primero U, luego V) entrenada sobre alpaca-cleaned con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64 y cutoff de 256 tokens en bf16.

Su relevancia es metodológica más que práctica: forma parte de una rejilla de experimentos sobre reglas de selección de componentes y presupuestos de compresión, con métricas de seguridad (AdvBench ASR, StrongREJECT ASR, sobre-rechazo macro) y de utilidad (perplejidad en WikiText-2, precisión zero-shot en 7 tareas) medidas de forma explícita. Sirve para estudiar el equilibrio seguridad/utilidad bajo compresión, no para desplegarse como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM y recuperado con LoRA secuencial |
| Parametros totales | 6.738.415.616 (60,0 % de los parámetros densos de Llama-2-7b-chat) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2-7b-chat: 4.096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder-only denso, y se comprime con SVD-LLM, el estimador de SVD blanqueada de los autores de AIoT-MLSys-Lab/SVD-LLM. La compresión se aplica sobre un conjunto de calibración agrupado que combina utilidad y seguridad: por un lado, WikiText-2 train con 255 ventanas de 2.048 tokens muestreadas con la semilla 42 y todas las posiciones; por otro, las primeras 192 de 512 prompts de entrenamiento de WildJailbreak (vanilla y adversariales dañinos) con los propios rechazos de Llama-2-7b-chat, una conversación por muestra desempaquetada, 67.740 posiciones en total. La matriz de calibración es S S^T = sum_WikiText x x^T + sum_safety x x^T, y la proporción efectiva de posiciones de seguridad es 0,1148.

Tras la compresión al 60,0 % de parámetros, se aplica la etapa 2 de recuperación de SVD-LLM: LoRA secuencial sobre U y luego sobre V, entrenado con alpaca-cleaned, r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff de 256 tokens y precisión bf16. La semilla global es 42. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat, con calidad medida por la precisión zero-shot media de 0,4892 en 7 tareas.
- Capacidad de rechazo de peticiones dañinas, medida con AdvBench ASR de 0,0038 y StrongREJECT ASR de 0,0096 bajo el juez HarmBench.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Estudio de seguridad bajo compresión: utilizar el checkpoint como una celda de la rejilla experimental para medir cómo varía la tasa de éxito de ataque (ASR) al eliminar el 40 % de los parámetros, comparando con otras reglas de selección y presupuestos.
- Evaluación de sobre-rechazo: emplear la métrica de sobre-rechazo macro (0,6163 con WildGuard) para analizar el coste en utilidad que introduce la calibración orientada a seguridad.
- Investigación en interpretabilidad de componentes: inspeccionar qué componentes (matrices U y V) selecciona la regla de SVD blanqueada y cómo afecta a las cabezas de atención y capas MLP relacionadas con el rechazo.
- Reproducción de experimentos de compresión: servir como referencia reproducible (semilla 42, calibración documentada) para validar implementaciones de SVD-LLM y de la recuperación LoRA secuencial.
- Benchmarking de pipelines de evaluación de seguridad: usar sus métricas publicadas (AdvBench, StrongREJECT, WildGuard) como línea base contra la que contrastar otros checkpoints comprimidos.
- Análisis de equilibrio utilidad/seguridad: comparar la perplejidad en WikiText-2 (11,1841) y la precisión zero-shot (0,4892) frente a variantes del grid para trazar la frontera de Pareto entre ambas dimensiones.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0038 |
| StrongREJECT ASR (juez HarmBench) | 0,0096 |
| Sobre-rechazo macro (WildGuard) | 0,6163 |
| Perplejidad en WikiText-2 | 11,1841 |
| Precisión zero-shot media (7 tareas, acc_norm donde se reporta) | 0,4892 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 3,5 GB (estimaciones a partir del tamaño del repo, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de producción o evaluación por lotes; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y en GPUs de 16 GB en bf16 con contexto corto; en 8 o 4 bits podría caber en GPUs de 8-12 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible); vLLM, llama.cpp u Ollama no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep192_r40 | 6.738.415.616 (60 % denso) | no disponible | Llama 2 Community | Checkpoint de investigación comprimido con SVD-LLM y recuperado con LoRA |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (100 % denso) | 4.096 tokens (no confirmado en esta ficha) | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas del grid SVD-LLM del mismo autor | variable según presupuesto | no disponible | Llama 2 Community | Variantes con distintas reglas de selección y presupuestos de compresión |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.
- El sobre-rechazo macro es elevado (0,6163), lo que indica una tendencia a rechazar peticiones legítimas y un coste claro en utilidad.
- La compresión al 60 % de parámetros introduce degradación de calidad general, reflejada en una precisión zero-shot media de 0,4892 y una perplejidad de 11,1841 en WikiText-2.
- Riesgo de alucinación: no cuantificado en la model card; debe asumirse el riesgo propio de Llama-2-7b-chat, potencialmente amplificado por la compresión.
- Sesgos conocidos: no documentados específicamente para este checkpoint; hereda los del modelo base.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingüe fiable.
- Restricciones de licencia: Llama 2 Community License, con LICENSE.txt y USE_POLICY.md incluidos en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a la política de uso aceptable.
- Contexto máximo no confirmado en la model card; conviene verificar la configuración antes de usarlo con ventanas largas.
- Solo 1 descarga y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep192_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementación de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de calibración de seguridad: WildJailbreak (no se proporciona enlace directo en la informacion disponible)
- Dataset de recuperación LoRA: alpaca-cleaned (no se proporciona enlace directo en la informacion disponible)
- Licencia Llama 2: https://ai.meta.com/llama/license/
