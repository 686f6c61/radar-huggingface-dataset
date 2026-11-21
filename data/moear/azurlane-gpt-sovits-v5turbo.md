# Moear/AzurLane-GPT-SoVITS-V5turbo

## Resumen

AzurLane-GPT-SoVITS-V5turbo es un conjunto de pesos de ajuste fino (fine-tune) sobre GPT-SoVITS, el sistema de síntesis de voz (TTS) de referencia del proyecto RVC-Boss, especializado en clonación de voz con pocos segundos de referencia. Lo publica el usuario Moear en Hugging Face y está entrenado con las voces japonesas y chinas de los personajes del videojuego Azur Lane: cubre 902 personajes de tipo "navío" (舰船) más la locutora TB, con 933 identificadores de voz distintos en el conjunto de entrenamiento.

El modelo no es un LLM generativo de texto, sino un sistema TTS de dos etapas: un módulo autorregresivo (GPT, en el argot del proyecto) que predice tokens semánticos a partir del texto y de una referencia de audio, y un módulo SoVITS que convierte esos tokens en forma de onda. El repositorio incluye los pesos del GPT ajustado (15 épocas, ~155 MB cada una), dos LoRA de SoVITS de rango 32 (~76 MB cada una) y depende del modelo base lj1995/GPT-SoVITS, que hay que descargar por separado.

Es relevante para quien necesite doblaje o generación de voz de personajes concretos sin entrenar desde cero: basta con cambiar el audio de referencia (3-10 segundos) para cambiar de personaje manteniendo el mismo juego de pesos. La model card incluye una evaluación con métricas objetivas (ERes2NetV2 y WavLM para similitud de timbre, tasa de error de transcripción para dicción) sobre 16 voces y 40 frases de retención, lo que permite comparar el ajuste con el modelo oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS V5turbo (TTS en dos etapas: módulo autorregresivo GPT + SoVITS con cond/DiT/refcode y vocoder) |
| Parametros totales | no disponible (pesos GPT ~155 MB por época; LoRA SoVITS ~76 MB con rank 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (referencia de audio de 3-10 segundos por síntesis) |
| Tipos de cuantizacion | exportación a GGUF F16 documentada (AR GGUF ~149,3 MiB); cuantizaciones de menor precisión no documentadas |
| Idiomas soportados | japonés (ja) y chino (zh) |
| Licencia | no disponible |
| Formato de pesos | .ckpt (GPT), .pth (SoVITS y LoRA), GGUF (exportación del módulo AR) |

## Arquitectura y entrenamiento

GPT-SoVITS es un pipeline TTS de dos componentes. El módulo GPT (autorregresivo) toma el texto fonetizado, lo combina con características semánticas extraídas de un audio de referencia mediante HuBERT y BERT, y genera tokens acústicos. El módulo SoVITS (variante V5turbo, con bloques cond, DiT y refcode) transforma esos tokens en audio final a través de un vocoder. La innovación práctica del sistema es la clonación zero-shot y few-shot: con una referencia de 3-10 segundos se obtiene la voz objetivo sin reentrenar. Este repositorio aporta el ajuste fino del módulo GPT sobre voces de Azur Lane y dos LoRA de SoVITS de rango 32.

El entrenamiento usó 50.759 grabaciones (~138,3 horas), de las cuales 49.727 son japonesas, 1.032 chinas y 114 de TB, procedentes del dataset Moear/AzurLane-Voice-20261118. El ajuste se hizo sobre la versión upstream de GPT-SoVITS con commit 6d51ffceafbf. Se conservan las 15 épocas del GPT y dos épocas del LoRA de SoVITS; en la evaluación, el GPT de la época 15 con el SoVITS oficial supera en similitud de timbre japonesa (ERes2NetV2 0,8170) al zero-shot oficial (0,8079), aunque este último obtiene mejor tasa de error de kana (4,01 % frente a 5,29 %). El autor documenta verificación de tensores publicados frente a originales y limpieza de rutas locales de entrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés y chino a partir de texto.
- Clonación de voz zero-shot y few-shot con referencia de 3-10 segundos.
- Cambio de personaje sin recargar pesos: se sustituye únicamente el audio de referencia entre los 902 personajes cubiertos más TB.
- Control de idioma de síntesis independiente del idioma de la referencia (la evaluación incluye 14 frases chinas sintetizadas con referencia japonesa).
- Exportación del módulo autorregresivo a GGUF F16 para inferencia en gsv.cpp (Vulkan/CPU) con API HTTP `/tts`.
- Integración con la WebUI de GPT-SoVITS para inferencia local.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Doblaje de contenido de fan para Azur Lane: dado un guion en japonés o chino, se sintetiza la voz de cada personaje usando como referencia un clip de 3-10 segundos del juego; el mismo juego de pesos sirve para los 902 personajes cambiando solo la referencia.
- Generación de voces para mods y vídeos: la WebUI de GPT-SoVITS permite iterar rápido sobre el texto y la referencia, y el paquete gsv.cpp ofrece una API `/tts` para automatizar la generación por lotes desde scripts.
- Pruebas de concepto de clonación de voz con pocos datos: útil para investigadores que quieran evaluar la calidad de un fine-tune de GPT-SoVITS sobre un dominio acotado (voces de personajes) frente al modelo oficial zero-shot, con la tabla de métricas de la model card como referencia.
- Despliegue en hardware sin GPU dedicada: la ruta gsv.cpp con Vulkan o CPU y pesos GGUF permite ejecutar el módulo AR en equipos modestos, aunque el autor advierte que la síntesis extremo a extremo por Vulkan y la conversión del LoRA de SoVITS no se han probado.
- Comparación de estrategias de ajuste: el repositorio conserva las 15 épocas del GPT y dos LoRA de SoVITS, lo que permite reproducir la comparativa de la model card (GPT 15 + SoVITS oficial frente a combinaciones con LoRA) con referencias propias.
- Generación de audio de referencia para pipelines de evaluación TTS: las métricas documentadas (ERes2NetV2, WavLM, tasa de error de transcripción) y los ficheros de resultados (`reports/evaluation-summary.json`) sirven como base para montar un banco de pruebas de voces de personajes.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 16 voces y 24 frases japonesas más 16 chinas de retención. Cada celda de timbre muestra ERes2NetV2 / WavLM (mayor es mejor); la dicción se mide como tasa de error de transcripción automática (menor es mejor).

| Combinación de pesos | Timbre ja (ERes2NetV2 / WavLM) | Error kana ja | Timbre zh (ERes2NetV2 / WavLM) | Error carácter zh |
|---|---:|---:|---:|---:|
| V2ProPlus (ja 12+8, zh 14+8) | 0,7935 / 0,9197 | 5,87 % | 0,7131 / 0,9251 | 4,13 % |
| V5turbo oficial zero-shot | 0,8079 / 0,9278 | 4,01 % | 0,7201 / 0,9332 | 2,87 % |
| GPT 15 + SoVITS oficial | 0,8170 / 0,9242 | 5,29 % | 0,7130 / 0,9282 | 4,85 % |
| GPT oficial + LoRA SoVITS 2 | 0,7440 / 0,9212 | 4,15 % | 0,6223 / 0,9259 | 2,51 % |
| GPT 12 + LoRA SoVITS 2 | 0,7476 / 0,9259 | 6,29 % | 0,6263 / 0,9275 | 2,51 % |
| GPT 15 + LoRA SoVITS 1 | 0,7566 / 0,9182 | 4,86 % | 0,6224 / 0,9210 | 5,21 % |
| GPT 15 + LoRA SoVITS 2 | 0,7590 / 0,9202 | 4,29 % | 0,6187 / 0,9259 | 5,57 % |
| V5dev oficial zero-shot | 0,8116 / 0,9216 | 4,15 % | 0,7638 / 0,9228 | 3,05 % |

Lectura de los datos según el autor: el GPT de la época 15 con SoVITS oficial mejora la similitud ERes2NetV2 en japonés respecto al zero-shot oficial, pero pierde en WavLM y en tasa de error de kana; las LoRA de SoVITS reducen la similitud de timbre de forma notable. La evaluación se hizo con 4 pasos de inferencia y CFG 0. No hay benchmarks de latencia o throughput publicados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el módulo GPT pesa ~155 MB por época y el LoRA SoVITS ~76 MB, pero el pipeline completo requiere además el SoVITS oficial, HuBERT, BERT y vocoder, cuyo consumo conjunto no se documenta.
- GPU recomendadas: no disponibles en la información proporcionada.
- GPU de consumo: la ruta gsv.cpp con Vulkan o CPU está pensada para equipos sin GPU dedicada; el autor no confirma qué modelos concretos funcionan ni con qué rendimiento.
- Despliegue: WebUI de GPT-SoVITS (Python) para inferencia completa; gsv.cpp (paquete Windows con GUI y API HTTP `/tts`, backend Vulkan/CPU) para la ruta GGUF; exportador `tools/export_gguf/export.py` para convertir el `.ckpt` a GGUF F16.
- Latencia y throughput: no disponibles. La model card solo indica 4 pasos de inferencia y CFG 0 en la evaluación, sin tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AzurLane-GPT-SoVITS-V5turbo (este) | Fine-tune GPT-SoVITS V5turbo | ja, zh | Voces de personajes de Azur Lane, 902 personajes | no disponible | Hugging Face, 2,5 GB |
| GPT-SoVITS V5turbo oficial (lj1995) | Modelo base TTS | multi (incluye ja, zh) | Clonación zero-shot genérica | no disponible en la información | Hugging Face, pesos separados |
| GPT-SoVITS V2ProPlus | Versión anterior del mismo proyecto | multi | Clonación zero-shot | no disponible en la información | Hugging Face |
| GPT-SoVITS V5dev | Versión de desarrollo | multi | Clonación zero-shot | no disponible en la información | Hugging Face |

En la evaluación de la model card, el V5turbo oficial zero-shot supera a este fine-tune en tasa de error de dicción en ambos idiomas y en WavLM, mientras que el fine-tune gana en ERes2NetV2 japonés (0,8170 frente a 0,8079). El V5dev oficial obtiene mejor timbre chino (0,7638) que todas las variantes evaluadas. No se dispone de comparación con otros sistemas TTS comerciales ni con arquitecturas distintas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; los personajes, voces y guiones de Azur Lane pertenecen a sus titulares, como recuerda el propio autor.
- El ajuste no mejora de forma uniforme al modelo oficial: pierde en tasa de error de kana y en WavLM en japonés, y las LoRA de SoVITS reducen la similitud de timbre de forma clara (ERes2NetV2 ~0,62-0,76 frente a ~0,81 del oficial).
- Solo cubre japonés y chino; no hay soporte documentado de otros idiomas.
- La evaluación se limita a 16 voces y 40 frases de retención, con 14 frases chinas sintetizadas con referencia japonesa; los resultados pueden no generalizar a otras referencias o a voces fuera del conjunto.
- La ruta gsv.cpp solo está validada en la exportación AR: la síntesis extremo a extremo por Vulkan y la conversión del LoRA de SoVITS no se han probado.
- Dependencia de pesos externos: hay que descargar el SoVITS oficial, HuBERT, BERT y vocoder de lj1995/GPT-SoVITS; sin ellos el repositorio no es autónomo.
- Riesgo de uso indebido en suplantación de voz de personajes con derechos; el autor no documenta mecanismos de marca de agua ni de consentimiento.
- Sin datos publicados de latencia, throughput ni VRAM del pipeline completo, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-V5turbo
- Pesos por época: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-V5turbo/tree/main/weights
- Checksums SHA-256: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-V5turbo/resolve/main/SHA256SUMS
- Dataset de entrenamiento: https://huggingface.co/datasets/Moear/AzurLane-Voice-20261118
- Snapshot del dataset: https://huggingface.co/datasets/Moear/AzurLane-Voice-20261118/tree/39d126bfbaf30311b0518ca8549cc820fc98d92c
- Modelo base GPT-SoVITS: https://huggingface.co/lj1995/GPT-SoVITS
- Pesos preentrenados oficiales: https://huggingface.co/lj1995/GPT-SoVITS/tree/main
- Repositorio GPT-SoVITS: https://github.com/RVC-Boss/GPT-SoVITS
- Notas de la versión V5: https://github.com/RVC-Boss/GPT-SoVITS#v5-release-notes
- Commit upstream usado: https://github.com/RVC-Boss/GPT-SoVITS/commit/6d51ffceafbf240145619af4c92408a6e54b7924
- gsv.cpp: https://github.com/KakaruHayate/gsv.cpp
- Paquete Windows de gsv.cpp: https://huggingface.co/KakaruHayate/GSV.CPP/tree/main/windows
- Documentación de la API de gsv.cpp: https://github.com/KakaruHayate/gsv.cpp/blob/main/docs/api.md
- Guía de uso y manifiesto de voces: https://github.com/KakaruHayate/gsv.cpp/blob/main/docs/usage.md#2-get-models
- Exportador GGUF: https://github.com/KakaruHayate/gsv.cpp/blob/main/tools/export_gguf/README.md
- Resultados de evaluación: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-V5turbo/blob/main/reports/evaluation-summary.json
- Estadísticas de entrenamiento: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-V5turbo/blob/main/reports/training_inputs.json
- Resultado del entrenamiento: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-V5turbo/blob/main/reports/result.json
- Verificación de publicación del GPT: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-V5turbo/blob/main/reports/gpt-publish-verification.json
- Verificación de publicación del SoVITS: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-V5turbo/blob/main/reports/sovits-publish-verification.json
