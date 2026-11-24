# axteam/MiniCPM-V-4.7-35B-A3B-NVFP4

## Resumen

MiniCPM-V-4.7-35B-A3B-NVFP4 es una cuantización de 4 bits (W4A4, FP4) del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicada por el usuario axteam. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con backbone Qwen3.5-MoE, torre de visión y capacidades de razonamiento imagen-texto. Esta versión comprime los pesos y activaciones a FP4 (formato E2M1 con escalas FP8 por grupo de 16) para servir el modelo en vLLM sobre hardware Blackwell, reduciendo el espacio en disco a unos 23,6 GB frente a los 70,7 GB del repositorio completo.

La relevancia de esta ficha radica en que demuestra que un modelo MoE multimodal de gran tamano puede cuantizarse agresivamente a 4 bits manteniendo una fidelidad alta respecto al original en BF16: la media de benchmarks cae solo un 0,6% (75,38 frente a 75,82) y la tasa de acuerdo top-1 en el siguiente token es del 92,1%. El autor documenta un proceso de reconstrucción (revisión del 2026-11-01) que corrige la compensación del router MoE y de las normas RMS, un detalle técnico poco habitual en cuantizaciones publicadas.

El modelo está pensado para despliegue en producción con vLLM 0.32 o superior y licencia Apache-2.0, lo que facilita su uso comercial. No obstante, la model card advierte de que los benchmarks y métricas de fidelidad son solo de texto y que la entrada de imágenes falla en la configuración probada por incompatibilidades entre el procesador de vLLM y transformers 5.21.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (backbone Qwen3.5-MoE) con torre de visión; transformer multimodal |
| Parametros totales | 20.945.750.384 (~20,9 mil millones, segun safetensors) |
| Parametros activos | no disponible (el nombre del modelo indica 35B-A3B, pero no se detalla el reparto activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1 con escala FP8 por grupo de 16); pesos y activaciones en FP4; componentes críticos en BF16 |
| Idiomas soportados | no disponible (la evaluación de fidelidad usa un conjunto mixto inglés/coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con backbone Qwen3.5-MoE, torre de visión y proyecciones de atención lineal de tipo Gated-DeltaNet. Esta cuantización es post-entrenamiento (PTQ), sin reentrenamiento, calibrada con 256 muestras. Se mantienen en BF16 aproximadamente el 7% de los parámetros: la torre de visión y el fusionador visión-texto, los embeddings de tokens, la cabeza LM, todas las RMSNorm, los routers MoE (`mlp.gate`, `shared_expert_gate`) y todas las proyecciones de atención lineal Gated-DeltaNet, ya que FP4 resulta demasiado grueso para ellas. Se cuantifican las proyecciones de atención completa y las de MoE/MLP.

La innovación técnica destacable es la revisión del 2026-11-01, que reconstruye los ficheros para compensar el router MoE y la puerta del experto compartido durante el suavizado AWQ, y excluye del normalizado de escalas los canales con ganancia de norma cero para preservar la precisión BF16 de las normas. El autor documenta que las subidas anteriores enrutaban tokens a expertos distintos del original y perdían precisión en las capas 2-5. El tokenizador y el `chat_template` son idénticos al modelo original.

## Capacidades

- Generación de texto y razonamiento multimodal imagen-texto (pipeline `image-text-to-text`).
- Comprensión de imágenes: la model card reporta una prueba con una imagen sintética (círculo rojo, cuadrado azul, texto "QWEN TEST 2026") descrita correctamente.
- Razonamiento matemático y de sentido común, según los benchmarks medidos (GSM8K, ARC-Challenge, Winogrande).
- Conocimiento multilingüe parcial: evaluación en inglés y coreano (KMMLU, HAE-RAE).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia multimodal en producción con vLLM: el modelo se integra en vLLM 0.32 o superior como checkpoint compressed-tensors y permite servir cargas imagen-texto con un consumo de disco de ~23,6 GB, adecuado para despliegues en GPUs Blackwell.
- Análisis de documentos e imágenes en pipelines internos: la torre de visión se mantiene en BF16, por lo que la calidad de codificación visual no se degrada por la cuantización; útil para extracción de información de capturas, diagramas o formularios.
- Razonamiento matemático asistido: los resultados en GSM8K (90,22 en 5-shot estricto, prácticamente idéntico al BF16) lo hacen apto para tutores o asistentes de resolución de problemas paso a paso.
- Evaluación comparativa de cuantizaciones: sirve como referencia práctica para equipos que quieran medir la pérdida de fidelidad de FP4 frente a FP8, AWQ-8bit o AWQ-4bit en un MoE multimodal, con métricas reproducibles publicadas.
- Asistente conversacional multilingüe (inglés/coreano): los benchmarks KMMLU y HAE-RAE muestran recuperación superior al 99% respecto al original, lo que permite desplegarlo en atención al cliente en esos idiomas.
- Prototipado en investigación con licencia permisiva: al ser Apache-2.0, puede modificarse y redistribuirse en entornos académicos o comerciales sin restricciones de copyleft, siempre que se respete la atribución.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts de tipo completion sin plantilla de chat. MMLU es la variante generativa (`mmlu_generative`), no comparable con evaluaciones por log-verosimilitud. Los porcentajes entre paréntesis indican la recuperación respecto al original en BF16.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 85,65 | 85,61 (100,0%) | 85,71 (100,1%) | 85,76 (100,1%) | 85,41 (99,7%) | 85,31 (99,6%) |
| GSM8K (5-shot, estricto) | 90,14 | 89,69 (99,5%) | 89,23 (99,0%) | 90,75 (100,7%) | 90,22 (100,1%) | 90,52 (100,4%) |
| ARC-Challenge (0-shot) | 60,92 | 61,01 (100,1%) | 61,18 (100,4%) | 60,84 (99,9%) | 61,09 (100,3%) | 62,03 (101,8%) |
| Winogrande (5-shot) | 80,11 | 79,87 (99,7%) | 78,93 (98,5%) | 79,32 (99,0%) | 77,11 (96,3%) | 79,56 (99,3%) |
| KMMLU (5-shot, directo) | 64,95 | 64,77 (99,7%) | 64,78 (99,7%) | 64,65 (99,5%) | 64,38 (99,1%) | 64,67 (99,6%) |
| HAE-RAE (0-shot) | 73,14 | 73,69 (100,8%) | 73,42 (100,4%) | 73,51 (100,5%) | 74,06 (101,3%) | 72,69 (99,4%) |
| Media | 75,82 | 75,77 (99,9%) | 75,54 (99,6%) | 75,80 (100,0%) | 75,38 (99,4%) | 75,80 (100,0%) |

Métricas de fidelidad frente al original en BF16 (conjunto interno mixto inglés/coreano de 100 prompts, vLLM 0.32, 2026-11-01):

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,3206 | 1,2063 (+9,5%) |
| Acuerdo top-1 del siguiente token | 92,1% | 98,1% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño en disco es de ~23,6 GB, por lo que se requiere al menos esa cantidad de memoria más overhead de activaciones y caché KV.
- GPU recomendadas: B200/GB200 (sm100), B300 (sm103), RTX 50xx y RTX PRO 6000 (sm120) para velocidad FP4 completa (W4A4).
- GPUs Turing-Hopper (sm75-sm90): caen a FP4 solo de pesos (más lento), según advierte la model card.
- Cabe en GPU consumer: sí, en la familia RTX 50xx (sm120) con soporte FP4 nativo; en otras consumer no se garantiza el rendimiento completo.
- Opciones de despliegue: vLLM 0.32.0 o superior (arquitectura incluida desde vLLM ≥ 0.32.0). Requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers 5.18.x o 5.19.x (5.17 no reconoce `minicpmv4_7`) y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-NVFP4 (este) | 20,9B (según safetensors) | no disponible | Apache-2.0 | safetensors compressed-tensors NVFP4 | Cuantización W4A4 para vLLM en Blackwell |
| MiniCPM-V-4.7-35B-A3B (BF16) | 20,9B | no disponible | Apache-2.0 | safetensors BF16 | Original; media de benchmarks 75,82 |
| Variante FP8-dynamic del mismo base | 20,9B | no disponible | Apache-2.0 | no disponible | Media 75,77; perplejidad más cercana al original |
| Variante AWQ-4bit del mismo base | 20,9B | no disponible | Apache-2.0 | no disponible | Media 75,80; buena recuperación pero sin aceleración FP4 nativa |

No se dispone de información sobre modelos de otras familias comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La evaluación de benchmarks y fidelidad es solo de texto; la entrada de imágenes falla en la configuración probada (vLLM 0.32 con transformers 5.21) por incompatibilidad entre el procesador de imágenes de vLLM y transformers. Solo una prueba de imagen funcionó tras rellenar manualmente el argumento `downsample_mode`.
- Pérdida de fidelidad medible: perplejidad un 9,5% superior al original y acuerdo top-1 del 92,1% (frente al 98,1% del BF16).
- Caída notable en Winogrande: 77,11 frente a 80,11 del original (96,3% de recuperación), el peor resultado relativo entre los benchmarks.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos conocidos: no documentados en la model card.
- Idiomas: no se declara lista oficial de idiomas soportados; la evaluación cubre inglés y coreano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse la atribución y el aviso de licencia.
- Requisitos estrictos de versiones: vLLM 0.32.0, transformers 5.18.x/5.19.x y compressed-tensors 0.17.0; mezclar versiones puede romper la carga del checkpoint.
- Advertencia de revisión: si se descargó el repositorio antes del 2026-11-01 10:56:00 UTC (revisión `939c788`), debe descargarse de nuevo, ya que las versiones anteriores enrutaban tokens a expertos distintos y perdían precisión en capas 2-5.
- El rendimiento FP4 completo solo se obtiene en hardware Blackwell; en GPUs anteriores el modo es solo de pesos y más lento.

## Enlaces

- [Hugging Face: axteam/MiniCPM-V-4.7-35B-A3B-NVFP4](https://huggingface.co/axteam/MiniCPM-V-4.7-35B-A3B-NVFP4)
- [Modelo base: openbmb/MiniCPM-V-4.7-35B-A3B](https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B)
- [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness)
- vLLM: no se proporciona enlace directo en la información disponible
- compressed-tensors: no se proporciona enlace directo en la información disponible
