# Jeesup/svd-safety-l2_svdllmjbbsep6_r50

## Resumen

`svd-safety-l2_svdllmjbbsep6_r50` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante la técnica SVD-LLM hasta retener aproximadamente el 50% de los parámetros densos originales (fracción resultante 0,4999). No es un modelo de chat de propósito general, sino una celda concreta dentro de una matriz experimental que estudia cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. Lo publica el usuario `Jeesup` en Hugging Face con fecha de creación de noviembre de 2026.

El modelo parte de la arquitectura transformer decoder-only de Llama 2 (7B parámetros, licencia Llama 2 Community License) y aplica una compresión SVD con un conjunto de calibración mixto: ventanas de WikiText-2 para preservar utilidad y un pequeño conjunto de objetivos de JailbreakBench con los rechazos propios de Llama-2-7b-chat para preservar seguridad. Posteriormente se recupera capacidad mediante LoRA de etapa 2 de SVD-LLM sobre alpaca-cleaned.

Su relevancia es metodológica: cuantifica el compromiso entre utilidad y seguridad bajo compresión y sirve como referencia reproducible para investigar interpretabilidad, compresión de modelos y robustez frente a jailbreaks. No debe desplegarse como asistente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM |
| Parametros totales | 6.738.415.616 (≈6,74B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-2-7b-chat: 4.096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la de Llama-2-7b-chat: transformer decoder-only con atención multi-cabeza y RoPE. Sobre ella se aplica SVD-LLM, que descompone las matrices de pesos y elimina componentes según una regla de selección, en este caso con un presupuesto del 50,00% de parámetros eliminados (fracción retenida 0,4999). El estimador es el SVD blanqueado de los autores (repositorio AIoT-MLSys-Lab/SVD-LLM) calculado sobre un conjunto de calibración agrupado: `S S^T = sum_WikiText x x^T + sum_safety x x^T`.

La parte de utilidad emplea WikiText-2 train con 255 ventanas de 2.048 tokens (muestreo SVD-LLM, semilla 42) evaluando todas las posiciones. La parte de seguridad usa los primeros 6 de 96 objetivos de JailbreakBench con los rechazos propios de Llama-2-7b-chat (orden con semilla 42), una conversación por muestra, 1.591 posiciones en total. La proporción efectiva de posiciones de seguridad es de solo 0,0030, un dato clave para interpretar el resultado. Tras la compresión se aplica la recuperación LoRA de etapa 2 de SVD-LLM (secuencial U y luego V, alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16).

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, pero degradada por la compresión.
- Razonamiento y respuesta a instrucciones con calidad reducida respecto al modelo base sin comprimir.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no disponibles en la información proporcionada.
- No dispone de modo thinking, visión ni audio.
- Su función real es servir como sujeto experimental para medir seguridad y utilidad bajo compresión SVD.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de referencia para comparar reglas de selección de componentes SVD y presupuestos de compresión dentro de la misma matriz experimental.
- Estudio de robustez frente a jailbreaks: con un ASR de 0,3096 en AdvBench y 0,1949 en StrongREJECT, permite analizar cómo la compresión eleva la tasa de éxito de ataques y evaluar mecanismos de reparación.
- Análisis de sobre-rechazo: el 0,2053 de sobre-rechazo macro (WildGuard) permite estudiar el equilibrio entre seguridad y utilidad conversacional en modelos comprimidos.
- Evaluación de pipelines de recuperación LoRA: el checkpoint incorpora la etapa 2 de SVD-LLM sobre alpaca-cleaned, útil para reproducir y comparar estrategias de recuperación post-compresión.
- Benchmarking de perplejidad y tareas zero-shot: con perplejidad 13,7946 en WikiText-2 y precisión media zero-shot de 0,4498 en 7 tareas, sirve para calibrar métricas de degradación por compresión.
- Docencia y divulgación técnica: ejemplo reproducible de cómo la selección de datos de calibración (proporción de seguridad de 0,0030) afecta al comportamiento final del modelo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3096 |
| StrongREJECT ASR (juez HarmBench) | 0,1949 |
| Sobre-rechazo macro (WildGuard) | 0,2053 |
| Perplejidad WikiText-2 | 13,7946 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4498 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos ni frente a Llama-2-7b-chat sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB de pesos, más overhead de activaciones y caché KV; en la práctica, 16-24 GB de VRAM.
- Cuantización a 8 bits: alrededor de 7 GB; a 4 bits: alrededor de 3,5-4 GB (estimaciones teóricas, no se publican artefactos cuantizados).
- GPU recomendadas para fp16: A100 40GB, H100, L40S, RTX 4090 (24 GB) o A6000 (48 GB).
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en fp16 con margen limitado; en RTX 4080/4070 Ti (16 GB) requiere cuantización.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM y llama.cpp no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmjbbsep6_r50 | 6,74B (50% del original) | no disponible | Llama 2 Community | Checkpoint de investigación comprimido con SVD-LLM |
| meta-llama/Llama-2-7b-chat-hf | 6,74B | 4.096 | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas del grid SVD-LLM (Jeesup) | variable | no disponible | Llama 2 Community | Variantes con distintas reglas de selección y presupuestos; no disponibles en la información proporcionada |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat desplegable: la model card lo describe explícitamente como artefacto de investigación y sujeto experimental.
- Varias celdas de la matriz están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataques.
- Riesgo elevado de alucinación y de respuestas incoherentes por la pérdida de capacidad asociada a la compresión al 50%.
- Sesgos heredados de Llama-2-7b-chat y de los datos de calibración (WikiText-2, JailbreakBench, alpaca-cleaned).
- La proporción efectiva de datos de seguridad en la calibración es muy baja (0,0030 de posiciones), lo que limita la preservación del comportamiento de rechazo.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos; el uso comercial está sujeto a dichos términos y a las restricciones de la licencia Llama 2.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe fiable.
- Longitud de contexto no confirmada en la model card; debe verificarse antes de cualquier uso.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmjbbsep6_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM (estimador): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: https://ai.meta.com/llama/license/
