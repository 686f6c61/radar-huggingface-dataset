# Jeesup/svd-safety-l2_svdllmjbbsep24_r40

## Resumen

`Jeesup/svd-safety-l2_svdllmjbbsep24_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD-LLM que elimina el 40,00 % de los parámetros densos, dejando un 59,98 % de los originales (6.738.415.616 parámetros reales según safetensors). Tras la compresión, el autor aplica la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre `alpaca-cleaned` con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64 y cutoff 256 en bf16. El resultado es una celda concreta de una malla experimental que cruza reglas de selección de componentes y presupuestos de compresión.

El propósito declarado no es ofrecer un asistente conversacional desplegable, sino medir cómo la compresión SVD degrada el comportamiento de seguridad de Llama-2-7b-chat y qué regla de selección de componentes lo repara mejor. La calibración combina una parte de utilidad (WikiText-2, 255 ventanas de 2048 tokens) y una parte de seguridad (24 de los 96 objetivos de JailbreakBench con las negativas propias de Llama-2-7b-chat), con una cuota efectiva de seguridad de solo 0,0121 de las posiciones. El autor advierte explícitamente de que varias ramas de la malla están deliberadamente degradadas en seguridad.

Por su naturaleza, el modelo es relevante para quien investiga compresión de modelos, interpretabilidad de mecanismos de rechazo y evaluación de seguridad bajo restricciones de parámetros, no para producción. Conserva la licencia Llama 2 Community License y el formato de pesos safetensors con arquitectura Llama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimida con SVD-LLM |
| Parametros totales | 6.738.415.616 (59,98 % del denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2-7b-chat; el autor no la declara) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2 con 7B parámetros, comprimido mediante SVD-LLM con SVD blanqueado de los autores (AIoT-MLSys-Lab/SVD-LLM) sobre un conjunto de calibración agrupado: S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. Se elimina el 40,00 % de los parámetros, resultando en una fracción de 0,5998. La calibración de utilidad usa WikiText-2 train con 255 ventanas de 2048 tokens (muestreador de SVD-LLM, semilla 42) y todas las posiciones; la de seguridad usa los primeros 24 de 96 objetivos de JailbreakBench con las negativas propias de Llama-2-7b-chat (orden con semilla 42), una conversación por muestra desempaquetada, 6406 posiciones. La cuota efectiva de seguridad es de 0,0121 de las posiciones.

Sobre el modelo comprimido se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con `alpaca-cleaned`, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. No se documentan datos de RLHF o DPO adicionales más allá de los heredados de Llama-2-7b-chat. La innovación técnica relevante es el propio pipeline de compresión SVD con calibración mixta utilidad/seguridad y la regla de selección de componentes, que es el objeto del estudio.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en el rango esperado de un 7B de la familia Llama 2, sin garantías tras la compresión.
- Tool calling / function calling: no disponible de forma nativa; Llama-2-7b-chat no lo soporta de serie.
- Agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingües: no declaradas en la model card.
- Capacidad especial: ninguna (sin visión, audio ni modo thinking).
- Comportamiento de rechazo medible: el checkpoint está diseñado para cuantificar la tasa de éxito de ataques (ASR) y la sobre-negativa, no para maximizar la seguridad.

## Casos de uso

- Investigación en compresión de modelos: usar este checkpoint como celda de referencia para comparar reglas de selección de componentes SVD a un presupuesto del 60 % de parámetros frente a otras celdas de la malla.
- Estudio de degradación de seguridad: medir cómo la compresión eleva la tasa de éxito de ataques (AdvBench ASR 0,0154, StrongREJECT ASR 0,0224) y contrastarla con el modelo denso original.
- Análisis de sobre-negativa: emplear la métrica de sobre-negativa macro (0,4271 con WildGuard) para estudiar el equilibrio entre rechazo y utilidad tras la compresión.
- Evaluación de pipelines de recuperación LoRA: reproducir la etapa 2 (LoRA secuencial U/V sobre alpaca-cleaned) y comparar variantes de hiperparámetros.
- Benchmarking de perplejidad y exactitud zero-shot: usar WikiText-2 (perplejidad 11,3613) y la media de 7 tareas (0,4896) como línea base para experimentos de compresión.
- Auditoría de artefactos de investigación: verificar la reproducibilidad de la calibración (semilla 42, composición WikiText-2 + JailbreakBench) antes de reutilizar el checkpoint en estudios derivados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0154 |
| StrongREJECT ASR (juez HarmBench) | 0,0224 |
| Sobre-negativa macro (WildGuard) | 0,4271 |
| Perplejidad WikiText-2 | 11,3613 |
| Exactitud media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4896 |

No se han publicado en la información disponible comparaciones directas con el modelo denso original ni con otras celdas de la malla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 3,5 GB (no se publican variantes cuantizadas oficiales).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para bf16; RTX 3090/4090 (24 GB) suficiente para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l2_svdllmjbbsep24_r40` | 6.738.415.616 | no disponible | Llama 2 Community | Checkpoint comprimido de investigación, ASR y sobre-negativa medidos |
| `meta-llama/Llama-2-7b-chat-hf` | ~6.740 M (denso) | 4096 | Llama 2 Community | Base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la malla SVD del mismo autor | variable según presupuesto | no disponible | Llama 2 Community | Mismas reglas de selección y calibración con distintos presupuestos |

No se dispone de datos comparativos de rendimiento frente a estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que no es un modelo de chat de propósito general y que varias ramas de la malla están deliberadamente degradadas en seguridad.
- La compresión por sí sola eleva la tasa de éxito de ataques; los valores de ASR reportados no deben interpretarse como seguridad garantizada.
- La sobre-negativa macro de 0,4271 indica una fracción sustancial de rechazos ante peticiones benignas.
- La cuota efectiva de calibración de seguridad es muy baja (0,0121 de las posiciones), lo que limita la representatividad del ajuste de seguridad.
- Riesgo de alucinación inherente a un 7B de Llama 2, sin mitigaciones adicionales documentadas.
- Idiomas soportados no declarados; el comportamiento multilingüe no está garantizado.
- Uso comercial sujeto a la Llama 2 Community License; se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio y el uso de este derivado está vinculado a ellos.
- No hay variantes cuantizadas oficiales ni datos de latencia/throughput publicados, lo que complica la planificación de producción.
- Creado y actualizado en 2026-11-17 según los metadatos; sin descargas ni likes, lo que sugiere escasa validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmjbbsep24_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: https://ai.meta.com/llama/license/
