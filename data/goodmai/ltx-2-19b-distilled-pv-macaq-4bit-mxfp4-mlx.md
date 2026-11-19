# goodmai/LTX-2-19B-Distilled-PV-MACaQ-4bit-MXFP4-MLX

## Resumen

LTX-2-19B-Distilled-PV-MACaQ-4bit-MXFP4-MLX es una cuantización de 4 bits del modelo de difusión LTX-2 de Lightricks, orientada específicamente a la generación conjunta de vídeo y audio en Apple Silicon mediante el framework MLX. Lo publica el usuario goodmai como parte de su ecosistema Basalt, una herramienta nativa para macOS que permite ejecutar pipelines de generación de vídeo sin Python ni FFmpeg. El modelo base, Lightricks/LTX-2, es un Diffusion Transformer (DiT) de 19.000 millones de parámetros que genera clips de vídeo con audio sincronizado de forma nativa.

El problema que resuelve esta ficha es el de hacer viable un modelo de vídeo de gran tamano en hardware de consumo con memoria unificada (UMA) de Apple. Mediante una técnica propietaria denominada PV-MACaQ (combinación de cuantización MXFP4 con transformada de Walsh-Hadamard y ajuste de escalas) se reduce el transformer de 35,17 GB a 9,57 GB, una compresión de 3,68x, manteniendo una calidad medida de 19,17 dB de SQNR en salida retenida. El repositorio completo ocupa 12,9 GB e incluye el VAE de vídeo 3D, el VAE de audio y el vocoder necesarios para sintetizar MP4 con H.264/HEVC y AAC.

Es relevante ahora porque representa un paso hacia la generación de vídeo con audio en equipos locales de Apple, un segmento donde hasta hace poco solo era posible con modelos mucho más pequenos o mediante servicios en la nube. La licencia es la LTX-2 Community License, que impone restricciones de uso comercial que deben revisarse antes de cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) conjunto audio-vídeo (LTX-2), cuantizado a 4 bits MXFP4 con PV-MACaQ |
| Parámetros totales | 3.087.713.280 (según safetensors del checkpoint cuantizado); el modelo base LTX-2 se denomina "19B" |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit MXFP4 con PV-MACaQ (B=32 Walsh-Hadamard, uint8 E8M0, pre_scale bfloat16 ajustado por PV-tuning); 1364 capas lineales cuantizadas en 8 shards |
| Idiomas soportados | no disponible (el pipeline es text-to-video; el prompt admite texto libre) |
| Licencia | LTX-2 Community License (ltx-2-community-license) |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo base Lightricks/LTX-2 es un Diffusion Transformer que procesa de forma conjunta las modalidades de vídeo y audio, generando ambas de manera sincronizada en un único pipeline. Esta versión concreta es una destilación (Distilled) del modelo base, cuantizada a 4 bits mediante la técnica PV-MACaQ del autor. La cuantización aplica una transformada de Walsh-Hadamard con bloque B=32 sobre las proyecciones lineales, seguida de escalas E8M0 en uint8 y un `pre_scale` en bfloat16 ajustado mediante PV-tuning (post-training quantization tuning). Según la model card, el ajuste de escalas reduce el MSE en datos retenidos un 14,1 % respecto a la cuantización RTN estándar y mejora el SQNR de 18,49 dB a 19,17 dB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación técnica destacable de esta ficha es la propia cuantización PV-MACaQ y su integración con MLX para Apple Silicon, junto con el empaquetado de los VAE de vídeo 3D, audio y vocoder en el mismo repositorio para permitir la síntesis directa de MP4 con H.264/HEVC y AAC.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado de forma nativa (audio-vídeo conjunto).
- Generación de clips de 81 fotogramas a 24 fps según el preset de composición incluido (`frames: 81`, `fps: 24`).
- Salida directa en MP4 con códec H.264/HEVC y audio AAC, sin necesidad de FFmpeg.
- Soporte de VAE tiling (`vae_tiling: true`) para reducir el uso de memoria en resoluciones altas.
- Soporte de atención dispersa STA (`sta_sparse: true`) para optimizar el cómputo.
- Integración con pipelines declarativos `basalt.yaml` v2.2 que permiten encadenar un modelo director (por ejemplo, un LLM para expandir el prompt) con el modelo de cine.
- Ejecución nativa en Apple Silicon mediante MLX, sin dependencia de Python.
- No se dispone de información sobre tool calling, function calling, agentes o capacidades multilingües explícitas.

## Casos de uso

- Generación de clips publicitarios cortos: el modelo produce vídeo con audio sincronizado en una sola pasada, adecuado para prototipos de anuncios de 3-4 segundos a 24 fps sin salir del Mac.
- Previsualización de storyboards: un equipo de producción puede convertir un guion en texto en clips de referencia con audio para validar ritmo y atmósfera antes de rodar.
- Creación de contenido para redes sociales: la salida directa en MP4 con H.264/HEVC y AAC permite subir el resultado sin transcodificación adicional.
- Iteración rápida de prompts en local: al ejecutarse en memoria unificada de Apple Silicon (24-128 GB), el ciclo de prueba de prompts no depende de la latencia de red ni de cuotas de API.
- Integración en pipelines automatizados de macOS: mediante `basalt video generate` desde CLI se puede encadenar la generación dentro de scripts de CI o flujos de publicación.
- Composición con LLM director: el preset `48gb-video-ltx2-av` encadena un modelo de lenguaje (gemma-4-12B-it-qat-4bit) que expande el prompt antes de pasarlo al generador de vídeo, útil para enriquecer descripciones escuetas.
- Demostraciones y docencia: al ser ejecutable en un Mac de 48-128 GB sin Python, sirve para talleres y demos presenciales de generación de vídeo con audio.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| SQNR en salida retenida (RTN MXFP4) | 18,49 dB |
| SQNR en salida retenida (PV-MACaQ MXFP4) | 19,17 dB (+0,68 dB) |
| Reducción de MSE frente a RTN | -14,1 % |
| Compresión del transformer | 3,68x (35,17 GB -> 9,57 GB) |
| Capas lineales cuantizadas | 1364 en 8 shards |

No se han publicado resultados de benchmarks de calidad de vídeo (FVD, CLIP score, etc.) ni comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM/UMA estimada: 24 GB Apple Silicon en modo por fases; 48-128 GB de memoria unificada para ejecución completa según la model card.
- GPU recomendadas: Apple Silicon de gama alta (M-series Pro/Max/Ultra) con 48-128 GB de memoria unificada. No se mencionan GPU NVIDIA.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 48 GB de UMA para el preset completo; con 24 GB funciona en modo por fases.
- Opciones de despliegue: MLX (librería nativa), Basalt (app macOS 27+ y CLI), preset `basalt.yaml` v2.2 con `48gb-video-ltx2-av` o `64gb-video-studio`. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2-19B-Distilled-PV-MACaQ-4bit-MXFP4-MLX (este) | 19B (base), 3,09B en safetensors cuantizado | no disponible | Vídeo + audio | LTX-2 Community License | Hugging Face, MLX/Basalt |
| Lightricks/LTX-2 (base) | 19B | no disponible | Vídeo + audio | LTX-2 Community License | Hugging Face |
| Otros modelos de vídeo con audio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia LTX-2 Community License: es una licencia "other" con posibles restricciones de uso comercial; debe revisarse el texto completo antes de desplegar en producción.
- El modelo está cuantizado a 4 bits, lo que introduce pérdida de calidad respecto al checkpoint original (SQNR de 19,17 dB en salida retenida, no fidelidad perfecta).
- La cuantización está optimizada para Apple Silicon y MLX; no se garantiza funcionamiento en otras plataformas.
- No se dispone de información sobre sesgos, riesgo de alucinación visual o limitaciones idiomáticas del prompt.
- El modelo es una destilación, por lo que puede presentar menor diversidad o calidad que el modelo base no destilado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria extensa.
- La fecha de creación indicada (2026-11-19) es futura respecto a la información de referencia; conviene verificar la vigencia del checkpoint.
- Requiere macOS 27+ y Apple Silicon para el flujo Basalt; no hay soporte documentado para Linux o Windows.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/LTX-2-19B-Distilled-PV-MACaQ-4bit-MXFP4-MLX
- Modelo base: https://huggingface.co/Lightricks/LTX-2
- Licencia: https://huggingface.co/Lightricks/LTX-2/blob/main/LICENSE
- Repositorio Basalt: https://github.com/goodmai/basalt
- Demo Basalt (EN): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FLTX-2-19B-Distilled-PV-MACaQ-4bit-MXFP4-MLX&role=video&lang=en
- Demo Basalt (RU): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FLTX-2-19B-Distilled-PV-MACaQ-4bit-MXFP4-MLX&role=video&lang=ru
