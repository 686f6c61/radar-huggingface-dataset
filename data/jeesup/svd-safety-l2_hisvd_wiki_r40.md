# Jeesup/svd-safety-l2_hisvd_wiki_r40

## Resumen

`svd-safety-l2_hisvd_wiki_r40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante HiSVD, una implementación de descomposición en valores singulares (SVD) para reducir el número de parámetros densos de un transformer. Concretamente, se elimina el 40 % de los parámetros, quedando un 60,47 % del modelo original (6.738.415.616 parámetros reales según safetensors), y posteriormente se recupera parte del rendimiento con una etapa de LoRA secuencial sobre las matrices U y V, siguiendo el enfoque de SVD-LLM.

El modelo lo publica el usuario `Jeesup` como artefacto de investigación, no como asistente desplegable. Forma parte de una rejilla experimental que estudia cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. La celda concreta corresponde a calibración sobre `wikitext2:256`, método de rango estable con modulación logarítmica y alpha 1.0, semilla 42.

Su relevancia es metodológica: cuantifica el coste en seguridad de comprimir un modelo alineado y ofrece métricas reproducibles (ASR en AdvBench y StrongREJECT, sobrerrechazo en WildGuard y perplejidad en WikiText-2) que permiten comparar reglas de compresión. No está pensado para uso en producción ni como sustituto de Llama-2-7b-chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2), comprimido con HiSVD (SVD por componentes) |
| Parametros totales | 6.738.415.616 (60,47 % del denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2-7b-chat, 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es Llama-2-7b-chat, un transformer decoder-only denso con atención causal estándar. Sobre él se aplica HiSVD (implementación propia del proyecto, basada en `redai-infra/HiSVD`), que descompone matrices de pesos y descarta componentes según una regla de selección de rango estable con modulación logarítmica y alpha 1.0, eliminando el 40 % de los parámetros. La calibración se realiza sobre `wikitext2:256` con longitud de secuencia 2048 y semilla 42.

Tras la compresión se aplica la etapa 2 de SVD-LLM: LoRA secuencial primero sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16, usando el dataset `alpaca-cleaned`. No se documentan en la información disponible otras fases de alineamiento (RLHF, DPO) más allá de las heredadas del checkpoint base.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat y parcialmente preservada tras la compresión.
- Razonamiento y respuesta a instrucciones en formato chat, con calidad degradada respecto al modelo base.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües no declaradas; el entrenamiento de recuperación usó `alpaca-cleaned`, predominantemente en inglés.
- No dispone de visión, audio ni modo de pensamiento explícito.
- Su función principal es servir como sujeto experimental para medir degradación de seguridad bajo compresión.

## Casos de uso

- Investigación sobre compresión de modelos: permite reproducir el punto de la rejilla (HiSVD, 40 % de parámetros eliminados, calibración WikiText-2) y compararlo con otras celdas del mismo estudio para aislar el efecto de la regla de selección.
- Estudio de seguridad bajo compresión: sus métricas de ASR en AdvBench (0,2538) y StrongREJECT (0,1565) sirven como referencia para cuantificar cuánto empeora la alineación al reducir parámetros.
- Evaluación de sobrerrechazo: el valor de 0,1965 en WildGuard permite analizar si la compresión incrementa rechazos innecesarios en consultas benignas.
- Análisis de perplejidad y calidad lingüística: la perplejidad de 10,4254 en WikiText-2 facilita comparar la fidelidad de distintas variantes de compresión sobre el mismo corpus de calibración.
- Reproducción de pipelines SVD-LLM: el checkpoint documenta hiperparámetros completos (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256) útiles para validar implementaciones de la etapa LoRA secuencial U→V.
- Docencia y experimentación académica: sirve para ilustrar el compromiso entre tamaño, utilidad y seguridad en modelos alineados, sin exponer un asistente real a usuarios finales.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2538 |
| StrongREJECT ASR (juez HarmBench) | 0,1565 |
| Macro over-refusal (WildGuard) | 0,1965 |
| WikiText-2 perplexity | 10,4254 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas directas con el checkpoint base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- En cuantización de 8 bits: en torno a 7 GB de pesos; en 4 bits, en torno a 3,5-4 GB (estimaciones a partir del recuento de parámetros; no se publican artefactos cuantizados).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con vLLM o TGI; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes en bf16 para una sola instancia.
- Cabe en GPU de consumo de 24 GB en bf16 y en tarjetas de 8-12 GB si se cuantiza a 4/8 bits.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` en el repo), vLLM; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_hisvd_wiki_r40 | 6,74 B (60,47 % del denso) | no disponible | AdvBench 0,2538 / StrongREJECT 0,1565 | Llama 2 | Hugging Face |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B (denso) | 4096 | no disponible en esta ficha | Llama 2 | Hugging Face |
| Otras celdas de la rejilla del mismo estudio | variable según presupuesto | no disponible | variable | Llama 2 | Hugging Face (autor `Jeesup`) |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataques.
- No es un modelo de propósito general ni un asistente desplegable: debe tratarse como sujeto experimental.
- Riesgo elevado de alucinación y de respuestas inseguras; requiere evaluación propia antes de cualquier uso.
- Idiomas soportados no declarados; el ajuste de recuperación con `alpaca-cleaned` está sesgado hacia inglés.
- Licencia Llama 2 Community License: impone restricciones de uso (incluido el umbral de 700 millones de usuarios mensuales y políticas de uso aceptable en `USE_POLICY.md`); el uso comercial está sujeto a dichos términos.
- El repositorio incluye `LICENSE.txt` y `USE_POLICY.md` que vinculan cualquier uso derivado.
- No se publican artefactos cuantizados ni instrucciones de despliegue específicas, lo que limita su uso fuera de entornos de investigación con transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_hisvd_wiki_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementación HiSVD de referencia: https://github.com/redai-infra/HiSVD
- Licencia Llama 2: incluida en el repositorio (`LICENSE.txt`, `USE_POLICY.md`)
