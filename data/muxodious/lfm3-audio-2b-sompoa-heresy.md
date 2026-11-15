# MuXodious/LFM3-Audio-2B-SOMPOA-heresy

## Resumen

LFM3-Audio-2B-SOMPOA-heresy es una variante "decensored" (también etiquetada como *abliterated* o *uncensored*) del modelo multimodal de audio LiquidAI/LFM3-Audio-2B, desarrollado por Liquid AI y publicado en Hugging Face por el usuario MuXodious. El modelo original es un sistema any-to-any orientado a voz y audio conversacional, diseñado para despliegue en el borde (*edge*), y esta variante elimina total o parcialmente los mecanismos de rechazo mediante la técnica SOMPOA implementada sobre la herramienta Heretic v2.2.0.dev0.

El modelo base emplea la arquitectura LFM3 (familia de Liquid AI) con aproximadamente 1.977 millones de parámetros totales según los pesos en safetensors (1.977.548.032 parámetros), un tamaño de repositorio de 4,1 GB y soporte para 18 idiomas. La modificación principal es la supresión de comportamientos de rechazo: la model card reporta una reducción de rechazos de 99/101 en el modelo original a 2/101 en esta variante, con una divergencia KL de 0,1045 respecto al original.

Su relevancia es acotada y específica: resulta útil para investigadores que estudian alineamiento, abliteration y comportamiento de rechazo en modelos de audio, así como para experimentación controlada con modelos de voz sin restricciones de contenido. No obstante, la licencia lfm1.0 y la naturaleza del ajuste imponen limitaciones importantes para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (familia Liquid AI), modelo multimodal any-to-any con soporte de audio; detalles internos no disponibles |
| Parametros totales | 1.977.548.032 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh (18 idiomas) |
| Licencia | lfm1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-Audio-2B pertenece a la familia LFM3 de Liquid AI, orientada a modelos compactos para despliegue en el borde con capacidades conversacionales y de audio. La información disponible no detalla la composición exacta de la arquitectura interna (número de capas, dimensiones, mecanismo de atención ni módulo de audio), por lo que esos datos deben considerarse no disponibles. El pipeline declarado es any-to-any, lo que implica entrada y salida en múltiples modalidades, con especial énfasis en voz y audio.

El entrenamiento original de Liquid AI no está documentado en la información proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). La modificación de esta variante se realizó con Heretic v2.2.0.dev0 aplicando la técnica SOMPOA, que ajusta direcciones y pesos en las proyecciones `attn.o_proj` y `mlp.down_proj` para suprimir la dirección de rechazo. La model card documenta más de 2000 pruebas y la necesidad de editar archivos de modelado y la configuración de generación para que la abliteration funcionase, además de probar variantes de las etiquetas `<think></think>` con y sin espacio final. El autor advierte que desconoce el impacto exacto de esas ediciones en los archivos de modelado.

## Capacidades

- Reconocimiento automático de voz (ASR) y procesamiento de audio, según el pipeline any-to-any y la etiqueta automatic-speech-recognition.
- Conversación multimodal con entrada y salida de audio y texto.
- Generación de texto y razonamiento, con plantilla de razonamiento tipo `<think>` documentada en la model card.
- Soporte multilingüe en 18 idiomas, incluidos español, inglés, árabe, chino, japonés, coreano, hindi no confirmado y lenguas europeas.
- Comportamiento "decensored": reducción drástica de rechazos (2/101 frente a 99/101 del original) según la model card.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión: no disponibles; el modelo se centra en audio y texto.

## Casos de uso

- Investigación sobre alineamiento y abliteration: permite estudiar cómo la supresión de la dirección de rechazo afecta al comportamiento del modelo en tareas de audio y texto, comparando con el original mediante la métrica de divergencia KL reportada (0,1045).
- Transcripción de audio multilingüe en entornos controlados: el pipeline ASR y los 18 idiomas soportados permiten transcribir reuniones o notas de voz en varios idiomas, siempre que se asuma la licencia y las limitaciones del ajuste.
- Experimentación con asistentes de voz conversacionales: sirve para prototipar diálogos por voz en laboratorio, evaluando la fluidez y la coherencia del modelo base sin las restricciones de rechazo.
- Evaluación de robustez y seguridad: útil como caso de estudio de modelos sin salvaguardas para diseñar filtros externos y comparar respuestas frente a la versión original alineada.
- Pruebas de despliegue en el borde: con ~2B parámetros y pesos safetensors de 4,1 GB, es viable experimentar en hardware de gama consumer para medir latencia y consumo en escenarios de voz.
- Análisis de sesgos y comportamiento multilingüe: permite comparar respuestas en los 18 idiomas declarados y detectar diferencias de calidad o de rechazo entre lenguas.

## Benchmarks y rendimiento

| Benchmark | Metrica | Este modelo (T040) | Modelo original |
|---|---|---|---|
| PIQA | acc | 0,6251 | 0,6230 |
| PIQA | acc_stderr | 0,0113 | 0,0113 |
| PIQA | acc_norm | 0,6284 | 0,6306 |
| PIQA | acc_norm_stderr | 0,0113 | 0,0113 |
| Rechazos (101 prompts) | refusals | 2/101 | 99/101 |
| Divergencia KL | KL | 0,1045 | 0 (por definición) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks específicos de audio o ASR (WER, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 8 GB solo para pesos, más overhead de activaciones y del módulo de audio.
- VRAM estimada en fp16/bf16: en torno a 4 GB para pesos, más overhead; el repositorio ocupa 4,1 GB en safetensors.
- GPU recomendadas: no disponibles de forma explícita en la información; por tamaño, una RTX 4090 (24 GB) o A100/H100 son holgadas, y una GPU consumer de 8-12 GB podría ser suficiente en fp16 con gestión cuidadosa de memoria.
- Cabe en GPU consumer: probablemente sí en modelos con 8 GB o más en fp16, aunque no está confirmado por el autor.
- Opciones de despliegue: la librería declarada es transformers con `custom_code`, por lo que requiere cargar el código personalizado del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Audio-2B-SOMPOA-heresy | 1.977.548.032 | no disponible | 18 | lfm1.0 | Variante decensored con Heretic/SOMPOA; 2/101 rechazos |
| LiquidAI/LFM3-Audio-2B | no disponible en la informacion | no disponible | no disponible | lfm1.0 | Modelo base alineado; 99/101 rechazos; PIQA acc 0,6230 |
| Otros modelos de audio de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La licencia lfm1.0 es restrictiva y debe revisarse antes de cualquier uso comercial; la model card no aclara si la modificación decensored está permitida por los términos.
- El proceso de abliteration puede degradar la coherencia y la calidad del razonamiento; el autor reporta dificultades con la plantilla `<think>` y ediciones en archivos de modelado cuyo impacto desconoce.
- Riesgo elevado de generar contenido inapropiado, ofensivo o inseguro al haberse suprimido los rechazos; no es adecuado para aplicaciones orientadas al público sin filtros externos.
- La divergencia KL de 0,1045 respecto al original indica cambios de distribución no triviales que pueden afectar a tareas distintas de las evaluadas.
- Solo se reporta PIQA como benchmark de calidad; no hay datos de ASR, WER ni evaluaciones multilingües, por lo que el rendimiento real en audio es desconocido.
- El modelo requiere `custom_code` y archivos de modelado modificados, lo que complica la reproducibilidad y la integración con herramientas estándar.
- No se documentan sesgos específicos, pero al eliminar salvaguardas es probable que se amplifiquen sesgos presentes en los datos originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuXodious/LFM3-Audio-2B-SOMPOA-heresy
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Heretic: https://heretic-project.org
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de voz de Liquid AI: https://playground.liquid.ai/talk
