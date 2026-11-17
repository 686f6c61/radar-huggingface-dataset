# Jeesup/svd-safety-l2_svdllmwjsep6_r40

## Resumen

`svd-safety-l2_svdllmwjsep6_r40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD-LLM hasta el 60,0 % de los parámetros densos originales (se elimina el 40,00 % de los parámetros), y posteriormente recuperado con la etapa 2 de LoRA del propio SVD-LLM. Lo desarrolla el usuario Jeesup como artefacto de investigación dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor.

No es un modelo de chat de propósito general: es una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de compresión. El conjunto de calibración combina utilidad (WikiText-2) con seguridad (respuestas de rechazo de WildJailbreak), con una proporción efectiva de posiciones de seguridad de solo 0,0033, lo que subraya el carácter marginal de la señal de seguridad frente a la de utilidad.

Con 6.738.415.616 parámetros reales en safetensors, licencia Llama 2 Community License y arquitectura transformer decoder-only heredada de Llama-2-7B, resulta relevante para investigadores que estudien compresión, interpretabilidad y robustez de salvaguardas, no para despliegues en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7b-chat) comprimido con SVD-LLM |
| Parámetros totales | 6.738.415.616 (fracción 0,5998 del denso) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Llama-2-7b-chat; no confirmada en la información) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; sin GGUF ni cuantizaciones declaradas) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder-only con atención multi-cabeza y normalización RMSNorm. Sobre esa base se aplica SVD-LLM, que descompone por valor singular las matrices de pesos y elimina componentes según un criterio de selección; en esta celda se retira el 40,00 % de los parámetros (fracción resultante 0,5998). El estimador es el SVD con blanqueado de los autores de SVD-LLM (AIoT-MLSys-Lab/SVD-LLM), calculado sobre un conjunto de calibración combinado: S S^T = suma sobre WikiText x x^T + suma sobre seguridad x x^T.

La calibración de utilidad usa WikiText-2 train con 255 ventanas de 2048 tokens (muestreador de SVD-LLM, semilla 42) y todas las posiciones; la de seguridad usa los primeros 6 de 512 prompts de WildJailbreak train (vanilla y adversarios dañinos) con los rechazos propios de Llama-2-7b-chat (orden con semilla 42), una conversación por muestra, 1724 posiciones. La recuperación posterior aplica la etapa 2 de LoRA de SVD-LLM de forma secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16.

## Capacidades

- Generación de texto conversacional, heredada del checkpoint base Llama-2-7b-chat.
- Razonamiento y respuesta a instrucciones dentro de los límites del modelo comprimido.
- Comportamiento de rechazo ante peticiones dañinas, aunque degradado respecto al base (ver benchmarks).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no declaradas en la información disponible.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Estudio de robustez de salvaguardas bajo compresión: usar este checkpoint como celda experimental para medir cómo varía la tasa de éxito de ataques (ASR) al eliminar el 40 % de parámetros, comparándola con el modelo denso.
- Investigación sobre reglas de selección de componentes SVD: emplearlo como referencia de la regla "utilidad + seguridad" con reparto 0,0033 y contrastarlo con otras celdas de la rejilla para identificar qué criterio preserva mejor el rechazo.
- Análisis de sobre-rechazo (over-refusal): evaluar con WildGuard la tasa macro de rechazos indebidos (0,2071) y estudiar el equilibrio entre seguridad y utilidad tras la compresión.
- Evaluación de degradación de perplexity: medir WikiText-2 (11,3604) para cuantificar el coste de utilidad de la compresión y calibrar presupuestos futuros.
- Reproducción de experimentos de compresión: reutilizar la configuración de calibración (WikiText-2 + WildJailbreak, semilla 42) y el pipeline LoRA de etapa 2 para replicar resultados en otras arquitecturas.
- Auditoría de artefactos de investigación: servir como caso de estudio sobre cómo checkpoints derivados pueden parecer modelos de chat desplegables sin serlo, útil para políticas de revisión de modelos internos.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0846 |
| StrongREJECT ASR (juez HarmBench) | 0,0927 |
| Macro over-refusal (WildGuard) | 0,2071 |
| Perplexity WikiText-2 | 11,3604 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4887 |

No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB de pesos, más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB según longitud de contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio; RTX 4090 (24 GB) para inferencia bf16 ajustada.
- Consumer GPU: cabe en RTX 4090 y, con cuantización de 8 bits, potencialmente en GPUs de 16 GB; no se documentan cuantizaciones publicadas.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference` presente), endpoints compatibles; vLLM, llama.cpp y Ollama no están confirmados por falta de formatos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep6_r40 | 6.738.415.616 (0,5998 del denso) | No disponible | Llama 2 Community | Hugging Face (6 descargas) | Artefacto de investigación, seguridad degradada |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 (según ficha original) | Llama 2 Community | Hugging Face | Modelo base denso, referencia de utilidad y seguridad |
| Otras celdas de la rejilla SVD-LLM del mismo autor | Variable según presupuesto | No disponible | Llama 2 Community | Hugging Face | Reglas de selección alternativas; no detalladas |

## Limitaciones y advertencias

- No es un modelo de chat de propósito general; el autor indica explícitamente que es un sujeto experimental.
- Varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataques.
- Riesgo de alucinación no cuantificado en la información disponible; la perplexity de 11,3604 sugiere degradación de fluidez frente al denso.
- La señal de seguridad en calibración es marginal (0,0033 de posiciones), lo que puede limitar la preservación de salvaguardas.
- Idiomas soportados no declarados; no se garantiza cobertura multilingüe.
- Uso comercial restringido por Llama 2 Community License; `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio vinculan el uso de esta obra derivada.
- No se documentan cuantizaciones ni formatos alternativos, lo que limita el despliegue en entornos con recursos ajustados.
- Resultados de benchmarks proceden de la model card del autor; conviene reevaluarlos de forma independiente antes de extraer conclusiones.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep6_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- No se han encontrado papers, blogs, demos ni otros enlaces relevantes en la información proporcionada.
