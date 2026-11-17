# Jeesup/svd-safety-l2_svdllmwjsep48_r40

## Resumen

`svd-safety-l2_svdllmwjsep48_r40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD-LLM hasta conservar el 60,0 % de los parámetros densos (40,00 % eliminados), y posteriormente recuperado con la etapa 2 de SVD-LLM (LoRA secuencial sobre U y luego V). Lo publica el usuario de Hugging Face Jeesup como artefacto de investigación, no como modelo conversacional de propósito general. Su interés radica en que forma parte de una rejilla experimental sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

El checkpoint usa una única calibración mixta (utilidad + seguridad): 255 ventanas de 2048 tokens de WikiText-2 train y los primeros 48 de 512 prompts de WildJailbreak train con las respuestas de rechazo del propio Llama-2-7b-chat. La parte de seguridad representa solo el 2,85 % de las posiciones de calibración. El resultado es un modelo de 6.738.415.616 parámetros, con licencia Llama 2 y pesos en safetensors, pensado para medir el compromiso entre utilidad y seguridad bajo compresión.

Es relevante ahora porque cuantifica empíricamente un fenómeno poco documentado: la compresión de pesos puede alterar la tasa de éxito de ataques (ASR) y el exceso de rechazo, y este artefacto proporciona métricas concretas (AdvBench ASR 0,0038, StrongREJECT ASR 0,0128, sobre-rechazo macro 0,5092, perplejidad WikiText-2 11,3034) para estudiar esa relación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (base Llama-2-7b-chat: 4096 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (heredados de Llama-2-7b-chat, principalmente inglés) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Llama 2 (7B), con atención causal estándar y sin mezcla de expertos. Sobre ese modelo se aplica SVD-LLM, un método de compresión que descompone las matrices de pesos mediante SVD blanqueada y descarta componentes según una regla de selección. En esta celda concreta se elimina el 40,00 % de los parámetros, conservando una fracción de 0,5998. La calibración combina WikiText-2 train (255 ventanas de 2048 tokens, muestreo SVD-LLM con semilla 42, todas las posiciones) y WildJailbreak train (48 prompts vanilla y adversariales con rechazos del propio Llama-2-7b-chat, 15.303 posiciones), con una cuota efectiva de seguridad del 2,85 % de las posiciones.

Tras la compresión se aplica la etapa 2 de recuperación de SVD-LLM: LoRA secuencial sobre U y luego sobre V, entrenado con alpaca-cleaned, r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. El estimador es la SVD blanqueada de los autores (AIoT-MLSys-Lab/SVD-LLM) sobre un único conjunto de calibración agrupado. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación propia de la compresión.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla Llama 2).
- Capacidad de rechazo ante peticiones dañinas, aunque el propio autor advierte que algunas celdas de la rejilla están deliberadamente degradadas en seguridad.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el modelo base está orientado principalmente al inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Uso previsto: artefacto de investigación para medir el compromiso seguridad/utilidad bajo compresión, no asistente desplegable.

## Casos de uso

- Estudio de robustez frente a jailbreaks: comparar el ASR de AdvBench (0,0038) y StrongREJECT (0,0128) de esta celda con otras celdas de la rejilla para aislar el efecto de la regla de selección de componentes.
- Análisis del sobre-rechazo: usar el valor macro de WildGuard (0,5092) para estudiar cómo la compresión y la calibración mixta afectan a la tasa de rechazos innecesarios en consultas benignas.
- Investigación en interpretabilidad de la compresión: examinar qué componentes SVD se descartan y correlacionarlos con cambios en comportamiento de seguridad.
- Evaluación de métodos de recuperación: comparar la etapa 2 LoRA (r=8, alpha=16, alpaca-cleaned) frente a alternativas de fine-tuning para reparar la degradación inducida por SVD.
- Benchmarking de utilidad bajo compresión: usar la perplejidad WikiText-2 (11,3034) y la precisión zero-shot media en 7 tareas (0,4900) como referencia para calibrar presupuestos de compresión.
- Reproducibilidad de experimentos: servir el checkpoint con transformers y TGI (tags `text-generation-inference`, `endpoints_compatible`) para replicar las métricas publicadas con semilla 42.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0038 |
| StrongREJECT ASR (juez HarmBench) | 0,0128 |
| Sobre-rechazo macro (WildGuard) | 0,5092 |
| Perplejidad WikiText-2 | 11,3034 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4900 |

No se han publicado resultados comparativos frente a otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 16-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7 GB de pesos; en 4 bits, en torno a 3,5-4 GB (no se publican variantes cuantizadas oficiales).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue concurrente; RTX 4090 (24 GB) para bf16 en una sola GPU; RTX 3090 (24 GB) viable en bf16 con batch pequeño.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; en tarjetas de 8-12 GB requeriría cuantización no publicada por el autor.
- Opciones de despliegue: transformers, Text Generation Inference (TGI) por los tags del repo; llama.cpp/Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep48_r40 | 6.738.415.616 (60 % denso) | no disponible | Llama 2 | Artefacto de investigación, ASR y sobre-rechazo medidos |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 mil millones (denso completo) | 4096 | Llama 2 | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla SVD-LLM del mismo autor | variable según presupuesto | no disponible | Llama 2 | Misma metodología con distintas reglas de selección y presupuestos |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El autor advierte explícitamente que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; esta celda debe tratarse como sujeto experimental, no como asistente desplegable.
- La compresión por sí sola eleva la tasa de éxito de ataques; el sobre-rechazo macro de 0,5092 indica que aproximadamente la mitad de las consultas benignas evaluadas podrían recibir un rechazo.
- Riesgo de alucinación no cuantificado en la información disponible; la perplejidad WikiText-2 de 11,3034 es superior a la del modelo denso sin comprimir, lo que sugiere degradación de modelado de lenguaje.
- Idiomas soportados no documentados; se hereda el sesgo hacia el inglés de Llama 2.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a las políticas de uso aceptable de Meta.
- Solo 1 descarga y 0 likes en el momento de la consulta: no hay validación comunitaria ni报告 de terceros sobre su comportamiento.
- La calibración de seguridad cubre únicamente el 2,85 % de las posiciones, lo que limita la representatividad de la señal de seguridad durante la compresión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep48_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM (estimador de los autores): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: https://ai.meta.com/llama/license/
