# myflow-ai/Qwen3-ASR-0.6B-gguf

## Resumen

Qwen3-ASR-0.6B es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por el equipo Qwen de Alibaba, publicado originalmente bajo licencia Apache-2.0. Este repositorio concreto, `myflow-ai/Qwen3-ASR-0.6B-gguf`, contiene conversiones a formato GGUF del modelo base `Qwen/Qwen3-ASR-0.6B` para su uso con el motor de inferencia [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). El modelo resuelve transcripción offline de audio a texto con detección automática de idioma, en un paquete de 782.452.240 parámetros (aproximadamente 0,78 mil millones) que cabe en cualquier equipo de gama media.

La arquitectura combina un codificador de audio bidireccional de 18 capas con un LM causal Qwen3 de 28 capas, unidos mediante inyección de tokens de audio en una secuencia fusionada audio+texto, sin mecanismo de cross-attention. El modelo acepta audio WAV mono a 16 kHz y emite la transcripción en el idioma detectado, sin posibilidad de forzar el idioma mediante indicaciones explícitas. No soporta streaming ni traducción, y no genera marcas de tiempo.

Su relevancia actual radica en la relación entre precisión y coste computacional: con un 2,11 % de WER en LibriSpeech test-clean en la cuantización Q8_0 (811 MB), ofrece un rendimiento prácticamente idéntico al BF16 completo ocupando la mitad de espacio, lo que lo hace apto para despliegue en CPU, GPUs integradas y dispositivos de borde sin depender de APIs comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio bidireccional de 18 capas + LM causal Qwen3 de 28 capas con inyección de tokens de audio (sin cross-attention) |
| Parametros totales | 782.452.240 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (formato GGUF) |
| Idiomas soportados | 30 idiomas: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk. El modelo base declara 52 idiomas y dialectos (30 idiomas + 22 dialectos chinos) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Entrada de audio | WAV mono a 16 kHz |
| Deteccion de idioma | Sí (automática, integrada) |
| Indicacion explicita de idioma | No soportada en esta conversión |
| Streaming | No |
| Traduccion | No |
| Marcas de tiempo | No disponibles en esta conversión |
| Biblioteca de inferencia | transcribe.cpp |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo sigue un diseño de fusión temprana: un codificador de audio bidireccional de 18 capas procesa la señal acústica y sus representaciones se proyectan como tokens de audio que se insertan directamente en la secuencia de entrada de un LM causal Qwen3 de 28 capas. Al no existir cross-attention, el decodificado se realiza sobre una única secuencia fusionada audio+texto, lo que simplifica el grafo de cómputo y facilita la cuantización del conjunto. La familia Qwen3-ASR (1.7B y 0.6B) se apoya en los datos de entrenamiento de habla a gran escala y en la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no están publicados en la model card consultada. Sí se documenta que la familia cubre 30 idiomas y 22 dialectos chinos, con soporte de acentos ingleses de distintas regiones, inferencia unificada streaming/offline en el modelo original (aunque esta conversión GGUF tiene el streaming desactivado) y transcripción de audio largo. El modelo complementario Qwen3-ForcedAligner-0.6B, mencionado en la documentación upstream, aporta predicción de timestamps en 11 idiomas, pero esa capacidad no se ha transferido a esta conversión.

Esta conversión concreta está portada desde el commit upstream `5eb144179a02acc5e5ba31e748d22b0cf3e303b0` (fijado el 2026-04-19) y validada numéricamente contra la referencia `qwen_asr 0.0.6` en el commit `3f61df7` de transcribe.cpp el 2026-04-20.

## Capacidades

- Transcripción de voz a texto offline en 30 idiomas, incluyendo chino mandarín, cantonés, árabe, coreano, japonés, hindi, tailandés y vietnamita, además de las principales lenguas europeas.
- Detección automática del idioma del audio (`lang_detect: true`), que determina el idioma de salida sin intervención del usuario.
- Reconocimiento robusto en entornos acústicos complejos y con patrones textuales difíciles, según declara el autor del modelo base.
- Procesamiento de audio de larga duración en modo offline (sin streaming).
- Ejecución en CPU y en backends acelerados (Metal en Apple Silicon, Vulkan en GPUs integradas y discretas).
- No soporta traducción de voz a texto en otro idioma, solo transcripción en el idioma detectado.
- No soporta indicaciones explícitas de idioma en esta conversión, lo que impide forzar la salida cuando la detección falla.
- No genera marcas de tiempo ni segmentación temporal.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo puramente ASR.

## Casos de uso

- **Transcripción de reuniones y notas de voz**: el modelo convierte grabaciones de audio largas en texto de forma completamente local, con un coste de 654 MB en Q4_K_M, sin enviar datos confidenciales a servicios externos. Adecuado para equipos con requisitos de privacidad estrictos.
- **Subtitulado automático de vídeo (sin timestamps)**: genera el texto íntegro de la pista de audio, que después puede alinearse con herramientas externas de forced alignment, dado que esta conversión no produce marcas temporales.
- **Dictado y accesibilidad**: integración en aplicaciones de escritorio para convertir voz en texto en tiempo cuasi real. Con un RTF de 65 en Metal sobre un M4 Max, una hora de audio se procesa en torno a un minuto.
- **Procesamiento de centros de contacto**: transcripción por lotes de llamadas en cualquiera de los 30 idiomas soportados, con detección automática de idioma para entornos multilingües sin necesidad de enrutado previo.
- **Despliegue en dispositivos de borde y sin conexión**: el reducido tamaño (654-811 MB) permite ejecutar el modelo en portátiles modestos, como demuestran los RTF de 8 en Vulkan y 4,3 en CPU sobre un Ryzen 4750U, útil en entornos sin conectividad o con ancho de banda limitado.
- **Análisis automatizado de contenido audiovisual**: transcripción masiva de archivos de audio para alimentar índices de búsqueda o pipelines de análisis de texto, sin coste por minuto de API.
- **Investigación en ASR y evaluación de cuantizaciones**: el repositorio documenta el WER por cuantización con scripts reproducibles (`scripts/wer/run.py` y `scripts/wer/score.py`), lo que lo convierte en un punto de partida útil para estudiar el impacto de la cuantización en modelos de habla.
- **Preservación de idiomas minoritarios y regionales**: cobertura de idiomas como filipino, macedonio, griego, persa o húngaro, poco frecuentes en modelos ASR de este tamaño.

## Benchmarks y rendimiento

Resultados de WER sobre el conjunto completo LibriSpeech `test-clean` (2620 enunciados en inglés), con normalizador de texto inglés estilo Whisper y jiwer 3.x, medidos en el backend Metal de un Apple M4. El propio autor advierte que es una métrica del caso inglés de un modelo multilingüe.

| Cuantizacion | Tamano | WER (LibriSpeech test-clean) |
|---|---:|---:|
| BF16 | 1,46 GB | 2,11 % |
| F16 | 1,47 GB | 2,12 % |
| Q8_0 | 811 MB | 2,11 % |
| Q6_K | 763 MB | 2,10 % |
| Q5_K_M | 707 MB | 2,21 % |
| Q4_K_M | 654 MB | 2,26 % |

BF16, F16, Q8_0 y Q6_K quedan dentro del mismo intervalo de confianza bootstrap; Q5_K_M y Q4_K_M muestran una regresión pequeña pero real, atribuida al token embedding y la cabeza de salida compartidos (tied embeddings).

| Factor de tiempo real (RTF) | Backend | Valor declarado |
|---|---|---:|
| Apple M4 Max | Metal | 65 |
| Apple M4 Max | CPU | 16,5 |
| Ryzen 4750U | Vulkan | 8 |
| Ryzen 4750U | CPU | 4,3 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de reconocimiento de habla y no de un modelo de lenguaje de propósito general. El modelo base de 1,7B afirma alcanzar rendimiento de estado del arte entre los modelos ASR de código abierto, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: entre 1 GB y 2 GB para inferencia. Q4_K_M (654 MB) y Q5_K_M (707 MB) funcionan holgadamente con menos de 1 GB de memoria dedicada más el espacio de activaciones; BF16 y F16 (1,46-1,47 GB) requieren en torno a 2 GB.
- **GPU compatibles**: cualquier GPU con más de 2 GB de VRAM. La implementación soporta backends Metal (Apple Silicon) y Vulkan (AMD, Intel, NVIDIA). No se proporcionan datos específicos para A100, H100 o RTX 4090 en la información disponible, dado que el modelo está pensado para despliegue ligero.
- **GPU de consumo**: sí, cabe en cualquier GPU de consumo actual e incluso en iGPUs con soporte Vulkan. El modelo es viable en equipos sin GPU dedicada.
- **CPU**: rendimiento de 16,5x tiempo real en un Apple M4 Max y de 4,3x en un Ryzen 4750U, lo que permite uso interactivo y por lotes sin acelerador.
- **Opciones de despliegue**: transcribe.cpp (CLI `transcribe-cli` y biblioteca). No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que este formato GGUF está construido específicamente para transcribe.cpp.
- **Conversión de audio previa**: es necesario audio WAV mono a 16 kHz; el propio README sugiere `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.
- **Latencia y throughput**: con RTF 65 en Metal sobre M4 Max, una hora de audio se procesa en aproximadamente 55 segundos; en CPU M4 Max, en torno a 3,6 minutos; en Ryzen 4750U con Vulkan, unos 7,5 minutos. El modelo base de 0,6B declara alcanzar 2000 veces el throughput con concurrencia 128, aunque esa cifra corresponde al modelo original y no necesariamente a esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | WER LibriSpeech test-clean |
|---|---:|---|---|---|---:|
| Qwen3-ASR-0.6B (esta conversion GGUF) | 782 M | 30 (52 idiomas y dialectos en el modelo base) | GGUF (transcribe.cpp) | Apache-2.0 | 2,10-2,26 % segun cuantizacion |
| Qwen3-ASR-1.7B | No disponible en la informacion proporcionada | 52 idiomas y dialectos | No disponible | Apache-2.0 (heredada del modelo base) | No disponible |
| Qwen3-ForcedAligner-0.6B | No disponible | 11 idiomas | No disponible | No disponible | No disponible (es un modelo de alineacion, no de ASR) |

No se han proporcionado datos de benchmarks de alternativas externas como la familia Whisper, por lo que no es posible establecer una comparación cuantitativa con ellas sin inventar cifras. Cualitativamente, la ventaja de Qwen3-ASR-0.6B frente a alternativas de tamaño similar es su cobertura de 30 idiomas con detección automática y su licencia Apache-2.0 sin restricciones de uso comercial.

## Limitaciones y advertencias

- **Sin marcas de tiempo**: esta conversión no genera timestamps (`timestamps: none`), lo que limita su uso directo en subtitulado sincronizado y requiere un modelo de alineación externo.
- **Sin streaming**: `streaming: false`. La transcripción es estrictamente offline, por lo que no sirve para aplicaciones de dictado en vivo con salida incremental.
- **Sin traducción**: `translate: false`. Solo transcribe en el idioma detectado; no traduce a otro idioma.
- **Sin control del idioma de salida**: no se admiten indicaciones explícitas de idioma, de modo que un fallo en la detección automática no puede corregirse desde la interfaz.
- **Riesgo de alucinación**: como todo modelo generativo aplicado a ASR, puede producir texto plausible en segmentos con ruido, silencio o audio musical, especialmente en idiomas con pocos datos.
- **Cobertura desigual entre idiomas**: aunque se declaran 30 idiomas, el único benchmark publicado corresponde al inglés. El rendimiento en idiomas como filipino, macedonio o persa no está cuantificado.
- **Dependencia de formato de entrada**: solo acepta WAV mono a 16 kHz; otros formatos o tasas de muestreo requieren conversión previa.
- **Ecosistema restringido**: el GGUF está construido para transcribe.cpp. No hay confirmación de compatibilidad con llama.cpp, Ollama, vLLM o TGI, lo que reduce las opciones de integración.
- **Repositorio sin adopción**: el repositorio `myflow-ai/Qwen3-ASR-0.6B-gguf` registra 0 descargas y 0 likes, y sus enlaces de descarga apuntan al repositorio `handy-computer/Qwen3-ASR-0.6B-gguf`. Conviene verificar la procedencia de los pesos antes de usarlos en producción y preferir la fuente original.
- **Sesgos**: no se documenta ningún análisis de sesgos demográficos, acentos o variedades dialectales en la información disponible. El modelo base menciona soporte de acentos ingleses de distintas regiones, pero sin métricas asociadas.
- **Licencia**: Apache-2.0, heredada del modelo base. Permite uso comercial sin restricciones adicionales conocidas, pero se recomienda consultar la model card upstream para los términos completos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/myflow-ai/Qwen3-ASR-0.6B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Conversión de referencia (handy-computer): https://huggingface.co/handy-computer/Qwen3-ASR-0.6B-gguf
- Repositorio de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/qwen3-asr-0.6b.md
- Commit upstream fijado: https://huggingface.co/Qwen/Qwen3-ASR-0.6B/commit/5eb144179a02acc5e5ba31e748d22b0cf3e303b0
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3f61df7
- Paper (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
