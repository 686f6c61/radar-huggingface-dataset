# keptn/nemotron-3.5-bolt-e4b-bf16

## Resumen

Nemotron 3.5 Bolt E4B es un modelo multimodal de NVIDIA, derivado mediante post-entrenamiento de Gemma 4 E4B (Apache 2.0) y distribuido originalmente en formato BF16. La versión aquí descrita es un empaquetado de terceros publicado por el usuario `keptn` bajo el identificador `keptn/nemotron-3.5-bolt-e4b-bf16`, pensado específicamente para el motor de inferencia radiance sobre GPUs AMD RDNA4. Incluye los pesos BF16 originales de NVIDIA junto con el drafter DFlash de decodificación especulativa, la torre de visión y el codificador de audio.

El modelo resuelve el problema de ejecutar un modelo multimodal (texto, imagen y audio) con contexto largo en hardware AMD consumer y profesional, un ecosistema tradicionalmente menos cubierto por los stacks de inferencia dominantes. Con 65.536 tokens de contexto, capacidades de razonamiento con modo thinking opcional y decodificación especulativa integrada, apunta a cargas de trabajo de agentes, análisis de documentos y asistentes multimodales en producción.

La relevancia actual radica en tres factores: la licencia OpenMDW 1.1, la disponibilidad de un artefacto único de 17,03 GiB que cabe en una GPU de 32 GB, y la integración nativa de speculative decoding con el drafter DFlash de 5 capas cuantizado a int8, que eleva el throughput de decodificación a 161,9 tokens por segundo en una Radeon AI PRO R9700.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivado de Gemma 4 E4B), con torre de visión, codificador de audio y drafter DFlash de 5 capas para decodificación especulativa |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se especifica que sea MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantización | BF16 para pesos, activaciones y `lm_head`; drafter en int8 con una escala f16 por cada 128 pesos |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement 1.1 |
| Formato de pesos | `.rad` (formato propietario del motor radiance), 17,03 GiB; el modelo base original se distribuye en BF16 (safetensors) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron 3.5 Bolt E4B, un post-entrenamiento sobre Gemma 4 E4B de Google. La arquitectura combina un transformer de lenguaje con una torre de visión y un codificador de audio, lo que permite entrada image-text-to-text y procesamiento de audio en el mismo pipeline. El checkpoint incluye además el drafter DFlash de NVIDIA, una red de 5 capas entrenada para proponer bloques de tokens en decodificación especulativa; en esta versión 2.0 del empaquetado el drafter está cuantizado a int8 con una escala f16 por cada 128 pesos, y opera con 7 tokens de borrador (fue entrenado sobre bloques de 8).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La model card sí documenta la plantilla de chat de NVIDIA con modo thinking desactivado por defecto y parámetros de muestreo recomendados (temperatura 1.0, top_p 0.95, top_k 64). La innovación técnica destacable es la integración del drafter DFlash dentro del artefacto único, lo que permite decodificación especulativa sin un segundo modelo separado y con una pérdida de calidad medida muy baja respecto al original BF16 (KL media de 0,00028 y 99,5 % de coincidencia en el token top-1).

## Capacidades

- Generación de texto y razonamiento, con modo thinking opcional activable por petición mediante `chat_template_kwargs`.
- Procesamiento de imágenes: la model card reporta evaluación sobre DocVQA y AI2D con 19 de 20 respuestas idénticas al original BF16.
- Procesamiento de audio: transcripción y comprensión, con una tasa de error de palabra de 6,37 % en LibriSpeech test-clean, idéntica al modelo original en transformers.
- Decodificación especulativa integrada mediante el drafter DFlash de NVIDIA, configurable con `num-speculative-tokens`.
- Soporte de contexto largo de 65.536 tokens, con 8 sesiones simultáneas a longitud completa en una sola tarjeta según el informe de arranque de radiance.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente, aunque el modo thinking y el contexto largo son compatibles con estos flujos.

## Casos de uso

- Análisis de documentos técnicos y financieros: con 65.536 tokens de contexto y torre de visión, el modelo puede procesar informes completos con tablas y figuras en una sola pasada, manteniendo coherencia entre páginas.
- Transcripción y análisis de reuniones: el codificador de audio permite transcribir clips con una WER del 6,37 % en condiciones limpias y generar resúmenes o actas estructuradas en el mismo pipeline.
- Asistentes multimodales en hardware AMD: al ejecutarse en radiance sobre RDNA4, encaja en estaciones de trabajo con Radeon AI PRO R9700 donde no hay acceso a CUDA, cubriendo un nicho de despliegue desatendido por otros stacks.
- Atención al cliente con contexto largo: 8 sesiones simultáneas a longitud completa y 524.304 tokens de caché KV en una tarjeta permiten gestionar conversaciones multi-turno extensas con historial completo.
- Generación asistida en entornos de documentación: la baja divergencia respecto al BF16 original (ratio de perplejidad ×1,001) lo hace adecuado para tareas de redacción donde la fidelidad al modelo de referencia es crítica.
- Servicio de inferencia de alto throughput: con 161,9 tokens/s en decodificación de un solo stream y 268 tokens/s agregados en 4 streams, es viable para APIs internas de generación con latencia interactiva.
- Procesamiento por lotes de imágenes y audio: la evaluación sobre DocVQA, AI2D y LibriSpeech confirma que las modalidades no textuales mantienen la calidad del original, lo que permite pipelines de extracción de datos a escala.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks académicos estándar (MMLU, HumanEval, GSM8K). Sí reporta métricas de fidelidad respecto al original BF16 y de velocidad de inferencia:

| Métrica | Este archivo | Versión 1.1 | `-a4` | `-i8g` |
|---|---|---|---|---|
| KL media (MT-Bench, 42.283 tokens) | 0,00028 | 0,00028 | 0,0537 | 0,00275 |
| KL percentil 99 | 0,0035 | 0,00351 | 0,705 | 0,036 |
| Coincidencia token top-1 | 99,5 % | 99,5 % | 93,6 % | 98,4 % |
| Ratio de perplejidad | ×1,001 | ×1,001 | ×0,994 | ×1,000 |

| Modalidad | Casos | Respuestas idénticas | KL media | Coincidencia top-1 |
|---|---|---|---|---|
| Imágenes (DocVQA + AI2D) | 20 | 19/20 | 0,00761 | 69/70 |
| Audio (LibriSpeech test-clean) | 12 | 12/12 | 0,00034 | 347/347 |

| Rendimiento (R9700, 215 W, bf16 KV, 7 draft tokens, thinking off) | 1 tarjeta | 2 tarjetas |
|---|---|---|
| Decodificación, un stream | 161,9 tok/s | 261,6 tok/s |
| Prefill a 24k tokens | 6.918 tok/s | 5.006 tok/s |
| 4 streams, total | 268 tok/s | 435 tok/s |

## Requisitos de hardware

- VRAM: el artefacto pesa 17,03 GiB; con caché KV bf16 a 65.536 tokens y 8 secuencias, radiance reserva 18,24 GiB de KV en una tarjeta, por lo que se necesita una GPU de 32 GB.
- GPU recomendada y probada: Radeon AI PRO R9700 (RDNA4). También admite configuración multi-tarjeta con `tp: 2` o `tp: 4` y `p2p: on`.
- Memoria de host: 8 GiB libres adicionales, con la torre de visión colocada en RAM (`vision-tower-placement: ram`).
- GPU consumer: no se documenta compatibilidad con GPUs consumer de menos VRAM; el requisito de 32 GB excluye la mayoría de tarjetas de consumo actuales.
- Despliegue: exclusivamente mediante el motor radiance (versión 2.0.0 o superior), distribuido como imagen Docker `stilldeadcode/radiance:2.0.0`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 161,9 tok/s en decodificación de un stream en una tarjeta; 6.918 tok/s de prefill a 24k tokens. En dos tarjetas, 261,6 tok/s de decodificación y 435 tok/s agregados en 4 streams. La configuración de cuatro tarjetas no está medida en radiance 2.0.

## Comparativa con modelos similares

| Modelo | Formato | Contexto | Licencia | Hardware objetivo | Notas |
|---|---|---|---|---|---|
| `keptn/nemotron-3.5-bolt-e4b-bf16` | `.rad` (BF16 + drafter int8) | 65.536 | OpenMDW 1.1 | AMD RDNA4, 32 GB | Artefacto único con visión y audio; motor radiance |
| `keptn/nemotron-3.5-bolt-e4b-i8g` | `.rad` (int8 grupo) | no disponible | OpenMDW 1.1 | AMD RDNA4 | Menor huella, KL media 0,00275, 98,4 % top-1 |
| `keptn/nemotron-3.5-bolt-e4b-a4` | `.rad` (4 bits) | no disponible | OpenMDW 1.1 | AMD RDNA4 | Máxima compresión, KL media 0,0537, 93,6 % top-1 |
| `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` | safetensors BF16 | 65.536 | OpenMDW 1.1 | NVIDIA GPU (transformers) | Original de referencia; requiere stack CUDA |

No se dispone de comparación con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El artefacto está atado al motor radiance 2.0.0 o superior y al formato `.rad`; no es cargable directamente en transformers, vLLM ni llama.cpp.
- El requisito de 32 GB de VRAM limita el despliegue a GPUs profesionales o de gama alta; no hay evidencia de funcionamiento en GPUs consumer.
- La configuración de cuatro tarjetas no está medida en radiance 2.0, por lo que su comportamiento en producción es desconocido.
- La model card advierte de que NVIDIA lista únicamente texto como entrada del modelo; la torre de visión y el codificador de audio provienen del checkpoint, no de una validación oficial de NVIDIA para esas modalidades.
- El drafter solo funciona a 7 tokens de borrador porque fue entrenado sobre bloques de 8; desviarse de ese valor puede degradar la tasa de aceptación.
- El modo thinking está desactivado por defecto; activarlo por petición puede alterar latencia y consumo de tokens.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas en la información disponible.
- La licencia OpenMDW 1.1 es distinta de Apache 2.0 del modelo Gemma subyacente; deben revisarse sus términos para uso comercial.
- La calidad medida se evalúa contra el original BF16 en transformers con aritmética fp32; diferencias en el stack de referencia pueden alterar las métricas reportadas.

## Enlaces

- [keptn/nemotron-3.5-bolt-e4b-bf16 en Hugging Face](https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-bf16)
- [nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16)
- [keptn/nemotron-3.5-bolt-e4b-a4](https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-a4)
- [keptn/nemotron-3.5-bolt-e4b-i8g](https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-i8g)
- [Motor radiance (StillDeadcode, Codeberg)](https://codeberg.org/StillDeadcode/radiance)
- [Guía Docker de radiance](https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it)
- [Dataset MT-Bench](https://huggingface.co/datasets/lmsys/mt_bench_human_judgments)
- [Dataset LibriSpeech](https://huggingface.co/datasets/openslr/librispeech_asr)
