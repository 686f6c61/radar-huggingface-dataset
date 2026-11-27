# kandinskylab/KVAE-Audio

## Resumen

KVAE-Audio es un autoencoder de audio continuo y de banda completa (48 kHz) desarrollado por Kandinsky Lab (Sberbank). Comprime formas de onda de audio en latentes continuos compactos (dimensión 64) y las reconstruye con alta fidelidad en voz, música y sonido general. No es un modelo generativo de texto a audio, sino el componente de compresión (VAE) que se sitúa en la base de una pipeline generativa: el modelo generador opera sobre el espacio latente que produce este autoencoder.

Su relevancia actual radica en dos factores. Primero, está integrado en Hugging Face Diffusers desde la versión 0.42.0 como `AutoencoderKLKVAEAudio`, lo que facilita su adopción en pipelines existentes. Segundo, los autores demuestran que, manteniendo fijo el generador (misma arquitectura DiT, mismos datos y mismos pasos), sustituir el autoencoder por KVAE-Audio mejora la calidad de generación, lo que lo posiciona como una pieza de infraestructura para sistemas text-to-audio de nueva generación.

El modelo tiene 166,9 millones de parámetros, un espacio latente de dimensión 64 y se distribuye bajo licencia MIT con pesos en formato safetensors para Diffusers. Su tamaño de repositorio es de 2,7 GB y acumula 273 descargas y 64 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder (VAE) de audio continuo, banda completa 48 kHz, integrado en Diffusers como `AutoencoderKLKVAEAudio` |
| Parametros totales | 166.871.218 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo audio-to-audio, no basado en contexto de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

KVAE-Audio es un autoencoder variacional (VAE) diseñado específicamente para audio de banda completa a 48 kHz. Su función es doble: codificar la forma de onda en un latente continuo de baja dimensión (64 canales) y decodificar ese latente de vuelta a audio con alta fidelidad. La arquitectura está pensada no solo para reconstrucción fiel, sino como espacio latente apto para modelos generativos: los autores reportan que, con un generador DiT fijo (misma arquitectura, datos y pasos de muestreo), el cambio de autoencoder a KVAE-Audio mejora las métricas objetivas de generación y los resultados de comparación humana ciega.

La información pública disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un autoencoder). Tampoco se especifican innovaciones como decodificación especulativa o atención lineal, que no tienen sentido en este tipo de componente. La model card remite a un informe técnico (arXiv:2608.05798) y a un artículo en Habr para los detalles de entrenamiento, no incluidos en la información proporcionada.

## Capacidades

- Compresión y reconstrucción de audio de banda completa a 48 kHz en un espacio latente continuo de dimensión 64.
- Reconstrucción de alta fidelidad en tres dominios: voz (LibriSpeech test-clean), música (MUSDB18-HQ, Song Describer) y sonido general (AudioSet eval).
- Actúa como espacio latente para modelos generativos de audio: se integra en pipelines text-to-audio basadas en DiT.
- Integración nativa en Hugging Face Diffusers (`AutoencoderKLKVAEAudio`) desde la versión 0.42.0.
- Pipeline declarada: audio-to-audio.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingües de texto: es un componente de compresión, no un modelo de lenguaje.

## Casos de uso

- Compresión de audio para pipelines generativas: se usa como VAE base en sistemas text-to-audio, donde el generador (DiT) opera sobre latentes de 64 dimensiones en lugar de sobre la forma de onda, reduciendo el coste computacional del generador y mejorando la calidad final según los autores.
- Reconstrucción y códec de alta fidelidad: codificar audio a 48 kHz en latentes compactos y reconstruirlo con métricas de fidelidad superiores a DACVAE y SAME-L en varias pruebas (MEL, STFT, SI-SDR), útil en tareas de compresión perceptualmente fiel.
- Procesamiento de voz para transcripción downstream: los resultados en LibriSpeech test-clean (WER 0,244 y CER 0,576, los mejores de la comparativa) indican que el latente preserva información lingüística, lo que lo hace adecuado como front-end de sistemas ASR.
- Edición y manipulación en espacio latente: al ser un VAE continuo, permite interpolación y modificación de latentes para tareas de transformación de audio (audio-to-audio) sin pasar por la forma de onda.
- Investigación en modelos generativos de audio: sirve como componente sustituible en experimentos controlados donde se quiere aislar el efecto del autoencoder sobre la calidad de generación, tal como hacen los propios autores.
- Integración en producción con Diffusers: al estar soportado oficialmente en Diffusers 0.42.0, puede incorporarse a pipelines existentes de audio-to-audio con cambios mínimos de código.

## Benchmarks y rendimiento

Resultados publicados por los autores en la model card. Métricas de generación (calidad del espacio latente con generador fijo) y de reconstrucción. Los mejores valores por columna aparecen en negrita en la fuente original; aquí se reproducen los datos tal cual.

AudioCaps test set (generación):

| Modelo | Params | Latent dim | CLAP↑ | CE↑ | PQ↑ | FAD (PANNs)↓ | FAD (PASST)↓ | FAD (VGGIsh)↓ |
|---|---|---|---|---|---|---|---|---|
| MMAudio 44.1kHz | 427,6M | 40 | 0,336 | 3,909 | 6,192 | 17,873 | 195,910 | 1,364 |
| DACVAE MovieGen | 107,7M | 128 | 0,313 | 3,772 | 6,167 | 20,558 | 234,312 | 1,700 |
| SAME-L | 852,1M | 256 | 0,322 | 3,588 | 5,756 | 18,446 | 240,635 | 1,325 |
| KVAE-Audio | 166,9M | 64 | 0,344 | 3,982 | 6,242 | 15,381 | 193,760 | 1,210 |

Song Describer (generación):

| Modelo | Params | Latent dim | CLAP↑ | CE↑ | PQ↑ | FAD (PANNs)↓ | FAD (PASST)↓ | FAD (VGGIsh)↓ |
|---|---|---|---|---|---|---|---|---|
| MMAudio 44.1kHz | 427,6M | 40 | 0,356 | 7,136 | 7,707 | 5,412 | 158,599 | 0,356 |
| DACVAE MovieGen | 107,7M | 128 | 0,312 | 6,953 | 7,538 | 10,194 | 214,009 | 1,046 |
| SAME-L | 852,1M | 256 | 0,345 | 7,076 | 7,465 | 8,442 | 250,668 | 0,987 |
| KVAE-Audio | 166,9M | 64 | 0,339 | 7,216 | 7,929 | 7,971 | 189,427 | 0,599 |

LibriSpeech test-clean (generación):

| Modelo | Params | Latent dim | CLAP↑ | CE↑ | PQ↑ | FAD (PANNs)↓ | FAD (PASST)↓ | FAD (VGGIsh)↓ | WER↓ | CER↓ |
|---|---|---|---|---|---|---|---|---|---|---|
| MMAudio 44.1kHz | 427,6M | 40 | 0,368 | 5,704 | 6,629 | 8,305 | 105,931 | 2,001 | 0,257 | 0,593 |
| DACVAE MovieGen | 107,7M | 128 | 0,413 | 5,482 | 7,052 | 5,008 | 210,478 | 1,501 | 0,911 | 1,048 |
| SAME-L | 852,1M | 256 | 0,379 | 4,617 | 5,024 | 10,257 | 301,508 | 2,721 | 0,349 | 0,629 |
| KVAE-Audio | 166,9M | 64 | 0,389 | 5,906 | 6,940 | 4,677 | 185,609 | 2,138 | 0,244 | 0,576 |

AudioSet eval (reconstrucción):

| Modelo | Params | Latent dim | MEL↓ | STFT↓ | Waveform↓ | SI-SDR↑ | SDR↑ | SNR↑ |
|---|---|---|---|---|---|---|---|---|
| MMAudio 44.1kHz | 427,6M | 40 | 0,636 | 1,938 | 0,106 | -32,080 | -2,682 | -2,686 |
| DACVAE MovieGen | 107,7M | 128 | 0,669 | 2,275 | 0,029 | 8,384 | 9,421 | 9,416 |
| SAME-L | 852,1M | 256 | 0,986 | 2,726 | 0,027 | 9,586 | 10,347 | 10,339 |
| KVAE-Audio | 166,9M | 64 | 0,537 | 1,770 | 0,027 | 9,065 | 9,920 | 9,933 |

MUSDB18-HQ (reconstrucción):

| Modelo | Params | Latent dim | MEL↓ | STFT↓ | Waveform↓ | SI-SDR↑ | SDR↑ | SNR↑ |
|---|---|---|---|---|---|---|---|---|
| MMAudio 44.1kHz | 427,6M | 40 | 0,681 | 1,865 | 0,114 | -40,204 | -3,274 | -3,273 |
| DACVAE MovieGen | 107,7M | 128 | 0,519 | 1,762 | 0,024 | 9,688 | 10,046 | 10,047 |
| SAME-L | 852,1M | 256 | 0,668 | 1,786 | 0,023 | 10,278 | 10,648 | 10,648 |

La información proporcionada no incluye la fila de KVAE-Audio para MUSDB18-HQ en la tabla de reconstrucción, por lo que no se reproduce. Tampoco se incluyen resultados de MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 166,9 millones de parámetros en fp32, los pesos ocupan aproximadamente 0,67 GB; en fp16, unos 0,33 GB. A esto hay que sumar activaciones y buffers de audio, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, funciona en RTX 3060/4060 y superiores; para procesamiento por lotes de audio largo se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido número de parámetros.
- Opciones de despliegue: Hugging Face Diffusers (soporte oficial desde 0.42.0). No se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Params | Latent dim | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KVAE-Audio | 166,9M | 64 | 48 kHz | MIT | Diffusers, Hugging Face |
| MMAudio 44.1kHz | 427,6M | 40 | 44,1 kHz | no disponible | Hugging Face |
| DACVAE MovieGen | 107,7M | 128 | no disponible | no disponible | Hugging Face |
| SAME-L (Stable Audio 3 VAE) | 852,1M | 256 | no disponible | no disponible | Hugging Face |

En las métricas de generación publicadas, KVAE-Audio obtiene el mejor CLAP, CE y PQ en AudioCaps y el mejor CE y PQ en Song Describer, con un tamaño intermedio entre DACVAE y MMAudio. En reconstrucción (AudioSet), lidera MEL, STFT y Waveform, y queda por detrás de SAME-L en SI-SDR, SDR y SNR. En LibriSpeech, logra el mejor WER y CER de la comparativa.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: sin un generador (DiT) acoplado, no produce audio a partir de texto ni de otras modalidades; su función es comprimir y reconstruir.
- En reconstrucción de AudioSet, SAME-L supera a KVAE-Audio en SI-SDR, SDR y SNR, por lo que para aplicaciones que prioricen fidelidad de forma de onda pura podría ser preferible otro autoencoder.
- No se detallan en la información disponible los sesgos del dataset de entrenamiento ni la composición de los datos, lo que impide evaluar sesgos de dominio (idioma, género, tipo de música).
- Riesgo de alucinación: no aplica en el sentido habitual de modelos de lenguaje, pero un VAE puede introducir artefactos de reconstrucción en audio fuera de distribución.
- Licencia MIT: permite uso comercial y modificación con atribución, pero conviene revisar las licencias de los componentes de la pipeline generativa con la que se combine.
- No hay información sobre cuantizaciones soportadas ni sobre latencia/throughput en producción, lo que limita la planificación de despliegues a gran escala sin pruebas propias.
- El soporte en Diffusers requiere la versión 0.42.0 o superior.

## Enlaces

- Hugging Face: https://huggingface.co/kandinskylab/KVAE-Audio
- Documentación Diffusers: https://huggingface.co/docs/diffusers/main/en/api/models/autoencoder_kl_kvae_audio
- GitHub: https://github.com/kandinskylab/kvae-audio
- Artículo en Habr: https://habr.com/ru/companies/sberbank/articles/1053410/
- Página del proyecto: https://kandinskylab.ai/
- Informe técnico (arXiv): https://huggingface.co/papers/2608.05798
- Referencia MMAudio 44.1 kHz: https://arxiv.org/abs/2412.15322
- Referencia DACVAE MovieGen: https://arxiv.org/abs/2410.13720
- Referencia SAME-L: https://arxiv.org/abs/2605.18613
