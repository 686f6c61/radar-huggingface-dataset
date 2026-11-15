# keptn/ornith-1.5-122b-fp8-dflash2

## Resumen

Ornith 1.5 122B FP8 + DFlash2 es una conversión del modelo multimodal Ornith-1.5-122B (desarrollado por el equipo Ornith, construido sobre Qwen3.5) preparada específicamente para el motor de inferencia radiance sobre GPUs AMD RDNA4. El paquete fusiona en un único fichero de 116,3 GiB los pesos del modelo base en FP8 y el drafter DFlash2 de decodificación especulativa de incoai, sustituyendo la capa MTP original. Se trata, por tanto, de un artefacto de despliegue optimizado para hardware AMD más que de un modelo nuevo entrenado desde cero.

La relevancia de esta ficha radica en que ejemplifica el ecosistema emergente de inferencia de modelos grandes sobre ROCm y RDNA4, un nicho tradicionalmente dominado por CUDA. El modelo combina una arquitectura MoE de 122B parámetros con contexto de 262.144 tokens, capacidades de visión (image-text-to-text) y modo de razonamiento (thinking), todo bajo licencia MIT. El fichero requiere cuatro tarjetas gráficas de 32 GB (probado en Radeon AI PRO R9700) y el motor radiance 1.9.0.

El autor de la conversión es keptn, que publica variantes cuantizadas y adaptadas del modelo para distintos motores y precisiones. Esta versión concreta prioriza velocidad de decodificación mediante especulación (15 tokens por pasada del drafter) manteniendo una fidelidad muy alta respecto al original bf16 (KL medio de 0,0118 en MT-Bench).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (base Qwen3.5), con drafter DFlash2 de 6 capas |
| Parámetros totales | 122B (modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | FP8 (E4M3) con escala bf16 por bloque 128×128; activaciones FP8; lm_head FP8; drafter en MXFP4 (escala E8M0 por 32 pesos) y cabeza de draft a 2 bits; KV cache FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (formato propietario de radiance), 116,30 GiB en un único fichero |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-122B es un transformer MoE multimodal construido sobre Qwen3.5 (Apache 2.0), con torre de visión y capacidad de razonamiento. La conversión de keptn no modifica los pesos del modelo: parte de la release FP8 oficial (`ornith-ai/Ornith-1.5-122B-FP8`, revisión `31b76f63`) y la reempaqueta en formato radiance. El cambio principal es la integración del drafter de decodificación especulativa DFlash2 de incoai (`incoai/Ornith-1.5-122B-DFlash2`, revisión `a5ed7396`) en lugar de la capa MTP original. El drafter tiene 6 capas y propone 15 tokens en una sola pasada; sus pesos se cuantizan a MXFP4 con cabeza de draft a 2 bits, siguiendo la receta `q38-27b-fp8block-df2.recipe` de radiance.

No se empleó calibración adicional (calibration: no calibration data), ya que los pesos FP8 provienen directamente de la release oficial. La innovación técnica destacable es la fusión de modelo y drafter en un único fichero, lo que simplifica el despliegue y permite que radiance gestione la especulación de forma automática. La decodificación especulativa con 15 tokens por pasada eleva la velocidad de decodificación a 183,2 tokens/s en cuatro tarjetas, frente a lo que sería una decodificación autorregresiva convencional.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo thinking activado por defecto (desactivable por petición mediante `chat_template_kwargs`).
- Comprensión de imágenes (pipeline image-text-to-text), con torre de visión que puede colocarse en RAM (`--vision-tower-placement ram`).
- Capacidades de código: la model card documenta ajustes específicos para coding (`--temp 0.6 --presence-penalty 0`).
- Decodificación especulativa integrada mediante drafter DFlash2 (15 tokens por pasada).
- Contexto largo de 262.144 tokens, con pool KV compartido entre secuencias (hasta 690.992 tokens totales con 8 secuencias en 4 tarjetas).
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Audio y vídeo: la model card menciona "Images, audio and video" en el título de sección, pero solo reporta mediciones para imágenes; no hay datos de audio ni vídeo.

## Casos de uso

- Inferencia de contexto largo en hardware AMD: con 262.144 tokens de ventana y un pool KV de hasta 690.992 tokens compartidos, el modelo puede procesar documentos extensos, bases de código completas o historiales de conversación largos en un clúster de cuatro Radeon AI PRO R9700, un escenario difícil de cubrir con GPUs de consumo.
- Procesamiento de documentos con visión: la torre de visión permite responder preguntas sobre documentos escaneados (evaluado en DocVQA y AI2D con 16/20 respuestas idénticas al bf16), útil para digitalización de facturas, formularios e informes técnicos.
- Generación de código en pipelines de CI/CD: la model card documenta ajustes de muestreo específicos para coding (`--temp 0.6 --presence-penalty 0`), lo que permite integrar el modelo como revisor o generador de parches en entornos automatizados.
- Razonamiento con modo thinking para tareas analíticas: el modo thinking activado por defecto favorece problemas de matemáticas, lógica y análisis multi-paso; puede desactivarse por petición para reducir latencia en consultas simples.
- Servicio de chat multi-turno de alta concurrencia: con 8 secuencias simultáneas y 190 tokens/s agregados en cuatro tarjetas, el modelo puede atender un servicio de conversación con varios usuarios concurrentes manteniendo contexto largo por sesión.
- Despliegue soberano sobre ROCm: al ejecutarse en RDNA4 con radiance, encaja en entornos que exigen hardware AMD por política de adquisición o por coste, evitando dependencia de CUDA.
- Evaluación comparativa de cuantizaciones: la model card publica métricas KL frente al bf16 original, lo que permite usar este fichero como referencia para validar otras variantes (w4a8, fp8 sin drafter) en tareas de calidad.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). Sí reporta métricas de fidelidad y velocidad:

| Métrica | Este fichero | ornith-1.5-122b-fp8 | ornith-1.5-122b-w4a8 |
|---|---|---|---|
| KL medio (MT-Bench, 42.305 tokens) | 0,0118 | 0,0118 | 0,0174 |
| KL percentil 99 | 0,139 | 0,139 | 0,222 |
| Token top idéntico | 97,2% | 97,2% | 96,4% |
| Ratio de perplexidad | ×1,003 | ×1,003 | ×1,002 |

Velocidad en Radeon AI PRO R9700 a 215 W, radiance 1.9.0, KV FP8, 15 tokens de draft, thinking off, BetterBench 0.6.1 (temperatura 0,7, mediana):

| Métrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream | no cabe | no cabe | 183,2 tok/s |
| Prefill a 24k tokens | no cabe | no cabe | 6.782 tok/s |
| 4 streams, total | no cabe | no cabe | 190 tok/s |

Calidad multimodal (imágenes DocVQA y AI2D, selección fija de 20 casos, greedy, thinking off, 4 tarjetas):

| Métrica | Valor |
|---|---|
| Respuestas idénticas al bf16 | 16/20 |
| KL medio | 0,0328 |
| Token top idéntico | 91/95 |

## Requisitos de hardware

- VRAM: el fichero ocupa 116,30 GiB y requiere cuatro tarjetas de 32 GB; además, un pool en memoria host de 3 GiB por tarjeta (`--host-pool-mib 3072`) para el resto de pesos.
- GPU recomendadas: Radeon AI PRO R9700 (probada); cualquier GPU AMD RDNA4 con 32 GB por tarjeta. No funciona en GPUs NVIDIA ni en RDNA anteriores.
- GPU de consumo: no cabe; el modelo no se ejecuta en una sola tarjeta de consumo ni en dos tarjetas (radiance 1.9.0 carece de kernel de atención para este modelo en 2 tarjetas por tener 16 cabezas de query por cabeza KV).
- Opciones de despliegue: exclusivamente el motor radiance (versión 1.9.0 o superior; radiance 2.0 no es compatible actualmente), disponible como imagen Docker `stilldeadcode/radiance:1.9.0`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: 183,2 tok/s en decodificación de un stream con cuatro tarjetas; 6.782 tok/s de prefill a 24k tokens; 190 tok/s agregados con 4 streams.
- Memoria de contexto: pool KV FP8 con 524.320 tokens (2 secuencias), 604.912 (4 secuencias) y 690.992 (8 secuencias) en cuatro tarjetas a 262.144 tokens de ventana.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| keptn/ornith-1.5-122b-fp8-dflash2 (este) | 122B | 262.144 | `.rad` / radiance (AMD RDNA4) | MIT | Hugging Face, 113 descargas |
| keptn/ornith-1.5-122b-fp8 | 122B | 262.144 | `.rad` / radiance | MIT | Hugging Face |
| keptn/ornith-1.5-122b-w4a8 | 122B | 262.144 | `.rad` / radiance | MIT | Hugging Face |
| keptn/ornith-1.5-122b-w4a8-dflash2 | 122B | 262.144 | `.rad` / radiance | MIT | Hugging Face |
| ornith-ai/Ornith-1.5-122B-FP8 | 122B | no disponible | FP8 (Hugging Face transformers) | MIT | Hugging Face |
| incoai/Ornith-1.5-122B-DFlash2 | drafter de 6 capas | no disponible | MXFP4 / drafter | no disponible | Hugging Face |

Las variantes w4a8 presentan peor fidelidad (KL medio 0,0174 frente a 0,0118) pero menor huella de memoria; las variantes sin drafter pierden la aceleración especulativa. El modelo base bf16 de ornith-ai es la referencia de calidad usada en las mediciones KL. No se dispone de comparación con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Exclusivo de hardware AMD RDNA4: radiance solo se ejecuta en estas GPUs; no hay soporte para CUDA, NVIDIA ni arquitecturas AMD anteriores.
- Requiere cuatro tarjetas de 32 GB: no cabe en una ni en dos tarjetas con radiance 1.9.0, lo que limita su uso a clústeres pequeños y encarece el despliegue.
- Dependencia de versión del motor: necesita radiance 1.9.0 o superior; la versión 2.0 no es compatible actualmente, lo que puede bloquear actualizaciones futuras.
- Formato propietario: el fichero `.rad` no es portable a otros motores; migrar a vLLM, llama.cpp o TGI exigiría reconvertir desde los pesos originales.
- Riesgo de alucinación: no se documenta en la información proporcionada; como modelo generativo de 122B, es esperable, pero no hay datos específicos.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas: no disponible; la model card no detalla cobertura multilingüe.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar las condiciones heredadas de Qwen3.5 (Apache 2.0) y del drafter de incoai, cuya licencia no se especifica.
- Calidad multimodal inferior a la de texto: en imágenes, solo 16/20 respuestas idénticas al bf16 y KL medio de 0,0328, superior al de texto (0,0118).
- Sin calibración propia: la calidad FP8 depende íntegramente de la release oficial de ornith-ai, no de una recalibración específica de esta conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/ornith-1.5-122b-fp8-dflash2
- Modelo base Ornith-1.5-122B: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Release FP8 del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B-FP8
- Drafter DFlash2 de incoai: https://huggingface.co/incoai/Ornith-1.5-122B-DFlash2
- Variante FP8 sin drafter: https://huggingface.co/keptn/ornith-1.5-122b-fp8
- Variante w4a8: https://huggingface.co/keptn/ornith-1.5-122b-w4a8
- Variante w4a8 con drafter: https://huggingface.co/keptn/ornith-1.5-122b-w4a8-dflash2
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Framework de model cards de radiance: https://codeberg.org/keptn42/radiance-model-cards-framework
- Repositorio del equipo Ornith: https://github.com/ornith-ai/Ornith-1
