# keptn/nemotron-3.5-bolt-74b-iq2-nvidia

## Resumen

Nemotron 3.5 Bolt 74B-A9B es un modelo multimodal de NVIDIA (arquitectura híbrida Mamba-Transformer con mezcla de expertos, según los tags y la nomenclatura A9B de activos) que acepta texto, imagen y vídeo como entrada. Esta ficha concreta, publicada por el usuario keptn, no es un modelo nuevo sino una conversión del original `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB` a un único fichero de 24,76 GiB en formato `.rad` para el motor de inferencia radiance sobre GPU AMD RDNA4. La conversión preserva los pesos tal como NVIDIA los distribuye: no hay recuantización, solo un reempaquetado para que el modelo completo quepa en una tarjeta de 32 GB.

El interés de esta publicación es de infraestructura más que de modelado: demuestra que un modelo de 74B totales con 9B activos, contexto de 262.144 tokens, torre de visión y drafter especulativo puede ejecutarse en hardware de consumo profesional AMD (Radeon AI PRO R9700) con decodificación especulativa activada. Incluye métricas de velocidad y de degradación frente al original en bf16, lo que permite evaluar el coste real del empaquetado a 2 bits en los expertos.

La licencia es OpenMDW 1.1 y el formato `.rad` solo lo lee radiance con el PR #386, todavía no incluido en ninguna release, lo que limita su uso a entornos dispuestos a compilar desde fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer con mezcla de expertos (MoE); torre de visión RADIO |
| Parametros totales | 74B (según nomenclatura del modelo) |
| Parametros activos | 9B (según nomenclatura A9B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Expertos IQ2_XXS (2,06 bits/peso); proyecciones latentes, atención y cabeza de salida Q8_0; proyecciones Mamba y drafter NVFP4; torre de visión bf16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | `.rad` (fichero único de 24,76 GiB para radiance); base en safetensors de NVIDIA |

## Arquitectura y entrenamiento

El modelo base es una arquitectura híbrida que combina capas Mamba con capas de atención y mezcla de expertos, a juzgar por la presencia de proyecciones Mamba en NVFP4 y de expertos cuantizados de forma independiente en el fichero. La nomenclatura 74B-A9B indica 74.000 millones de parámetros totales con 9.000 millones activos por token, lo que sitúa el coste de cómputo en el rango de un modelo denso de ~9B pese al tamaño total. Incorpora una torre de visión RADIO en bf16 para entradas de imagen y vídeo, y un drafter LiLiCorr separado (`nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr`, revisión `449d2414`) para decodificación especulativa con 7 tokens de borrador.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada. La conversión de keptn no aplica calibración ("Calibration: no calibration data") porque no recuantiza: conserva los bytes y formatos originales de NVIDIA, con la única excepción de las seis proyecciones pequeñas del drafter LiLiCorr, que en la release están en NVFP4 y aquí se almacenan en bf16 porque radiance solo las lee en ese formato (afecta solo a los borradores, no a la salida).

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable por petición mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Entrada multimodal: texto, imagen y vídeo (pipeline `image-text-to-text`).
- Decodificación especulativa integrada con el drafter LiLiCorr de NVIDIA a 7 tokens de borrador, con ventana adaptativa.
- Procesamiento de contexto largo: hasta 262.144 tokens por secuencia, con soporte de hasta 8 secuencias concurrentes compartiendo pool KV.
- Inferencia en tensor paralelo sobre 1 o 2 GPU AMD RDNA4.
- Cuantización extrema de expertos (IQ2_XXS, 2,06 bits por peso) manteniendo atención y cabeza de salida en Q8_0 para preservar calidad.
- No se dispone de información sobre soporte de tool calling, function calling ni capacidades de agente multi-paso en la documentación proporcionada.

## Casos de uso

- Procesamiento de documentos largos con imágenes: el contexto de 262.144 tokens y la torre de visión permiten analizar informes, contratos o expedientes completos con figuras y tablas intercaladas en una sola pasada, sin trocear el documento.
- Análisis de vídeo y audio-visual: al aceptar vídeo como entrada, sirve para resumir grabaciones, extraer eventos o generar descripciones estructuradas de material audiovisual en pipelines de postproducción o monitorización.
- Despliegue en estaciones de trabajo AMD: equipos con una Radeon AI PRO R9700 (32 GB) pueden servir el modelo completo en local, útil para entornos con requisitos de soberanía de datos o sin acceso a GPU NVIDIA.
- Evaluación de cuantizaciones extremas: el fichero incluye métricas KL frente al bf16 original, lo que lo convierte en referencia para estudiar la viabilidad de IQ2_XXS en modelos MoE híbridos con visión.
- Servicio de chat multi-turno con concurrencia moderada: con `--max-num-seqs 8` y 2.097.168 tokens de pool KV en una tarjeta, admite varias conversaciones simultáneas de contexto largo con 143,7 tok/s en decodificación de un solo stream.
- Investigación en decodificación especulativa: la integración del drafter LiLiCorr con 7 tokens permite medir el impacto del speculative decoding en hardware RDNA4 (206,4 tok/s en dos tarjetas frente a 143,7 en una).
- Prototipado de asistentes multimodales en CI: al ejecutarse en contenedor Docker con API HTTP en el puerto 8000, se integra en pipelines de prueba automatizada de aplicaciones que consumen un endpoint compatible.

## Benchmarks y rendimiento

Calidad frente al original bf16 (80 preguntas MT-Bench, ambos turnos, 41.586 tokens de respuesta):

| Metrica | Este fichero (IQ2) | w4a8 | fp8 |
|---|---|---|---|
| KL media | 0,0416 | 0,00503 | 0,00301 |
| KL percentil 99 | 0,468 | 0,0602 | 0,0361 |
| Token top coincidente | 94,2% | 97,9% | 98,4% |
| Ratio de perplejidad | ×1,017 | ×1,000 | ×1,000 |

Velocidad en Radeon AI PRO R9700 a 215 W, bf16 KV, 7 tokens de borrador, thinking desactivado:

| Metrica | 1 tarjeta | 2 tarjetas |
|---|---|---|
| Decodificación, un stream (tok/s) | 143,7 | 206,4 |
| Prefill a 24k tokens (tok/s) | 2.427 | 3.915 |
| 4 streams, total (tok/s) | 203 | 308 |

Multimodal (DocVQA y AI2D, 20 casos, greedy): 18/20 respuestas idénticas al original, KL media 0,0394, 80/82 tokens top coincidentes.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 24,76 GiB de pesos; el modelo completo cabe en una GPU de 32 GB. El pool KV con contexto completo requiere `--host-pool-mib 16384` adicionales en memoria del host.
- GPU probada: Radeon AI PRO R9700 (RDNA4, 32 GB). El motor radiance solo funciona en AMD RDNA4 (gfx1201); no hay soporte para NVIDIA ni para RDNA3.
- Configuración multi-GPU: `--tp 2 --p2p on` con dos tarjetas de 32 GB.
- Contexto: 8 secuencias de 262.144 tokens en una sola tarjeta con `--max-model-len 262144 --max-num-batched-tokens 2048`.
- Despliegue: exclusivamente mediante radiance (contenedor Docker construido desde el PR #386). No hay soporte para vLLM, llama.cpp, Ollama ni TGI en este formato.
- Throughput medido: 143,7 tok/s en decodificación de un stream y 2.427 tok/s de prefill a 24k tokens en una tarjeta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| keptn/nemotron-3.5-bolt-74b-iq2-nvidia | 74B totales / 9B activos | 262.144 | `.rad`, IQ2_XXS + Q8_0 + NVFP4 | OpenMDW 1.1 | AMD RDNA4, 32 GB |
| keptn/nemotron-3.5-bolt-74b-w4a8 | 74B / 9B activos | no disponible | `.rad` | OpenMDW 1.1 | AMD RDNA4 |
| keptn/nemotron-3.5-bolt-74b-fp8 | 74B / 9B activos | no disponible | `.rad` | OpenMDW 1.1 | AMD RDNA4 |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB (original) | 74B / 9B activos | 262.144 | safetensors | OpenMDW 1.1 | NVIDIA (formato de referencia) |

Las variantes w4a8 y fp8 del mismo autor ofrecen mayor fidelidad al original (KL media 0,00503 y 0,00301 frente a 0,0416) a cambio de presumiblemente mayor tamaño de fichero y requisitos de VRAM; no se dispone de sus especificaciones completas. El original de NVIDIA es la referencia de calidad pero requiere el stack de inferencia de NVIDIA.

## Limitaciones y advertencias

- Dependencia de software no liberado: requiere radiance con el PR #386, que no está en ninguna release; hay que compilar la imagen desde el repositorio.
- Exclusivo de AMD RDNA4: no funciona en NVIDIA, RDNA3 ni CPU.
- Pérdida de calidad medible: KL media de 0,0416 y ratio de perplejidad ×1,017 frente al bf16; el 5,8% de los tokens top no coinciden, lo que puede acumularse en generaciones largas.
- El drafter se almacena en bf16 en lugar de NVFP4, lo que altera los borradores especulativos aunque no la salida final.
- Sin datos de calibración: la conversión no ajusta escalas, lo que puede penalizar dominios alejados de la distribución original.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos, agravado por la cuantización extrema de los expertos.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés.
- Licencia OpenMDW 1.1: conviene revisar sus términos antes de uso comercial; la model card no detalla restricciones adicionales.
- Sin soporte conocido de tool calling ni de flujos de agente; no apto para pipelines que dependan de function calling sin validación previa.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes de terceros sobre su comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/nemotron-3.5-bolt-74b-iq2-nvidia
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Drafter LiLiCorr: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr
- Variante w4a8: https://huggingface.co/keptn/nemotron-3.5-bolt-74b-w4a8
- Variante fp8: https://huggingface.co/keptn/nemotron-3.5-bolt-74b-fp8
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- PR #386 de radiance: https://codeberg.org/StillDeadcode/radiance/pulls/386
