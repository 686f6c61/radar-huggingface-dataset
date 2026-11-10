# Easonnoway/ds-llama-8b-opsd

## Resumen

ds-llama-8b-opsd es un ajuste fino de parámetros completos del modelo deepseek-ai/DeepSeek-R1-Distill-Llama-8B, publicado por el usuario Easonnoway como baseline del estudio ImmuneCoT sobre seguridad en modelos de lenguaje. No es un modelo de propósito general: es un artefacto de investigación diseñado para medir cuánto beneficio de seguridad aporta la autodestilización on-policy (OPSD) con contexto privilegiado de disparo, sin la fusión PoE que introduce ImmuneCoT. Se distribuye junto a otros tres artefactos del mismo estudio (ds-llama-8b-icot, ds-llama-8b-sft y ds-llama-8b-dpo) para permitir comparaciones controladas.

El modelo conserva la arquitectura del Llama-3.1-8B original (transformer denso de 8.030 millones de parámetros) y el modo de razonamiento tipo cadena de pensamiento heredado de la destilación de DeepSeek-R1. El entrenamiento se realizó sobre un conjunto de 1.790 muestras (940 dañinas y 850 benignas) durante 2 épocas y 112 pasos de optimizador, con el profesor congelado como fuente de destilación. La relevancia actual es metodológica: documenta un modo de fallo concreto de OPSD (colapso con profesor vivo en ~16 pasos) y ofrece la configuración estable alternativa.

La licencia es Apache 2.0 y el repositorio ocupa 16,1 GB en formato safetensors. No se han publicado idiomas soportados, benchmarks ni métricas de rendimiento en la información disponible, y el propio autor restringe el uso a investigación sobre seguridad de LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Llama-3.1-8B, destilada de DeepSeek-R1) |
| Parametros totales | 8.030.261.248 (8,03 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max length 4608) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es DeepSeek-R1-Distill-Llama-8B, un transformer denso de 8B parámetros obtenido por DeepSeek destilando trazas de razonamiento de R1 sobre Llama-3.1-8B. Sobre esa base, este artefacto aplica un ajuste fino de parámetros completos con el método OPSD (on-policy self-distillation) en configuración de profesor congelado: el estudiante genera rollouts desde un prefill de asistente no disparado (cadena de pensamiento ingenua) y una copia congelada del modelo base inicial puntúa los mismos tokens bajo un contexto privilegiado que combina disparadores de detección y de respuesta. La ventaja de política es la diferencia de log-probabilidad muestreada entre profesor y estudiante, y un término JSD generalizado (clip de token 10) regulariza hacia la distribución del profesor.

El entrenamiento usó el mismo conjunto IASD de 1.790 muestras que la variante ImmuneCoT (940 dañinas, 850 benignas), 2 épocas y 112 pasos de optimizador, batch efectivo de 32 (4 por dispositivo × 2 de acumulación × 4 GPUs), AdamW fusionado con learning rate 5e-6 y decaimiento lineal sin warmup, precisión bf16, longitud máxima 4608 y de completado 2048, rollouts con vLLM colocado (mem 0.25, temperatura 0.7, top_p 0.95, top_k 20), semilla 42 y DeepSpeed ZeRO-2 con offload del optimizador a CPU. Los pesos publicados corresponden al checkpoint-112. El dato técnico destacable es la inestabilidad de la variante con profesor vivo, que colapsó en unos 16 pasos (pérdida a 0, colapso de entropía), coherente con el modo de fallo descrito por los autores de OPSD; la configuración con profesor congelado es la que se publica.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del pipeline text-generation del modelo base.
- Razonamiento con cadena de pensamiento (modo CoT destilado de DeepSeek-R1), incluyendo trazas de pensamiento antes de la respuesta.
- Comportamiento de seguridad condicionado: el entrenamiento busca que el modelo detecte y responda a contenido dañino bajo contexto de disparo, como objeto de estudio del baseline.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el modelo base soporta CoT, pero no se documenta integración de agentes.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Investigación comparativa sobre seguridad de LLM: sirve como condición de control frente a ds-llama-8b-icot, ds-llama-8b-sft y ds-llama-8b-dpo para aislar la contribución de la fusión PoE de ImmuneCoT frente a OPSD puro, usando el mismo conjunto IASD de 1.790 muestras.
- Reproducción de experimentos de autodestilización on-policy: permite replicar la configuración de profesor congelado (112 pasos, batch 32, lr 5e-6) y contrastarla con la variante de profesor vivo que colapsa en ~16 pasos.
- Estudio del colapso de entropía en OPSD: el checkpoint final y el registro de entrenamiento permiten analizar la pérdida de diversidad en la política del estudiante y validar estrategias de regularización JSD.
- Evaluación de robustez ante prompts dañinos: al haberse entrenado con 940 muestras dañinas y disparadores de detección/respuesta, es útil para medir tasas de detección y de rechazo en pipelines de moderación de contenido.
- Análisis de alineación en modelos pequeños: con 8B parámetros y CoT destilado, permite estudiar si el razonamiento explícito mejora la adherencia a políticas de seguridad sin necesidad de infraestructura grande.
- Base para ablaciones de datos: al compartir exactamente el mismo dataset y receta que las otras variantes del estudio, permite variar solo el método de entrenamiento y atribuir diferencias de comportamiento a la técnica, no a los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos (8,03B × 2 bytes), más overhead de activaciones y caché KV; el repositorio completo ocupa 16,1 GB.
- En cuantización de 8 bits: aproximadamente 8-9 GB de VRAM para pesos; en 4 bits, alrededor de 4-5 GB. Estas cifras son estimaciones por tamaño, no cifras publicadas por el autor.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente con contexto largo; una RTX 4090 (24 GB) es suficiente para inferencia en bf16 con contexto moderado y batch pequeño.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible) y vLLM, que el propio autor usó para los rollouts de entrenamiento. llama.cpp/Ollama no están documentados para este repositorio.
- Latencia y throughput: no disponibles; el autor solo documenta la configuración de rollout (vLLM colocado con mem 0.25, temperatura 0.7, top_p 0.95, top_k 20), no métricas de serving.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ds-llama-8b-opsd (este) | 8,03B | no disponible (entrenado a 4608) | OPSD con profesor congelado | Apache 2.0 | Hugging Face, 0 descargas |
| ds-llama-8b-icot | no disponible | no disponible | ImmuneCoT (fusión PoE) | no disponible | Hugging Face (Easonnoway) |
| ds-llama-8b-sft | no disponible | no disponible | SFT | no disponible | Hugging Face (Easonnoway) |
| ds-llama-8b-dpo | no disponible | no disponible | DPO | no disponible | Hugging Face (Easonnoway) |
| DeepSeek-R1-Distill-Llama-8B (base) | 8,03B | no disponible | Destilación de R1 sobre Llama-3.1-8B | licencia del modelo base (no verificada aquí) | Hugging Face (deepseek-ai) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación es metodológica y de linaje, no de métricas.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo publica exclusivamente para estudiar seguridad de LLM; no está validado para uso comercial ni para producción pese a la licencia Apache 2.0.
- Riesgo de alucinación: heredado del modelo base de 8B con CoT destilado; no se han publicado evaluaciones de factualidad para este checkpoint.
- Sesgos: no documentados por el autor; el entrenamiento con 940 muestras dañinas y 850 benignas puede inducir sesgos de sobrerrechazo o de calibración en la detección de contenido.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingüe es incierto y no está evaluado.
- Contexto: la longitud máxima de entrenamiento fue 4608 tokens (completado 2048); no se documenta la ventana de contexto efectiva del modelo base ni su comportamiento más allá de ese límite.
- Estabilidad del método: la variante con profesor vivo colapsó en ~16 pasos; cualquier reentrenamiento debe usar profesor congelado para reproducir esta configuración estable.
- Trazabilidad: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (10 de noviembre de 2026); sin benchmarks ni métricas publicadas que permitan verificar el beneficio de seguridad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base deepseek-ai/DeepSeek-R1-Distill-Llama-8B antes de redistribuir o desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Easonnoway/ds-llama-8b-opsd
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Variante ImmuneCoT del mismo estudio: https://huggingface.co/Easonnoway/ds-llama-8b-icot
- Baseline SFT: https://huggingface.co/Easonnoway/ds-llama-8b-sft
- Baseline DPO: https://huggingface.co/Easonnoway/ds-llama-8b-dpo
- Paper de OPSD: no disponible en la informacion proporcionada
- Repositorio de código o demo: no disponible en la informacion proporcionada
