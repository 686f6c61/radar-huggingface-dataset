# MikhailSt/Drama-3-mmproj-GGUF

## Resumen

Drama-3-mmproj-GGUF es un conjunto de checkpoints cuantizados del proyector multimodal de audio (`mmproj`) del modelo Drama-3 de Fish Audio, un sistema de síntesis de voz basado en el modelo FishOmniModel. El autor de esta conversión es MikhailSt, y su objetivo es permitir la ejecución del proyector de audio en GPUs de consumo con 6, 8 y 12 GB de VRAM, algo imposible con el checkpoint original en BF16 de 2,81 GB.

El `mmproj` de Drama-3 no es un proyector visual al uso, sino un sistema de audio neuronal de dos etapas: una torre de predicción multi-token (MTP) que representa aproximadamente el 83,7% de los parámetros y que predice tokens acústicos residuales (RVQ), y un vocoder Fish DAC basado en Descript Audio Codec que convierte esos tokens en audio PCM de alta fidelidad a 44,1 kHz, con el 16,3% restante de los parámetros.

La relevancia de esta ficha radica en que el checkpoint original en BF16 no cabe en GPUs de 6 u 8 GB junto con el backbone MoE Qwen3.5-35B-A3B (20 GB) y el grafo de cómputo del vocoder (940 MB), lo que obliga a ejecutar el proyector en CPU y degrada gravemente la velocidad. La solución propuesta cuantiza selectivamente la torre MTP manteniendo el vocoder DAC en FP16 o Q8_0, logrando reducir el tamaño aproximadamente 3 veces y duplicar la velocidad de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector multimodal de audio (torre MTP transformer + vocoder Fish DAC basado en Conv1d/Snake/ConvTranspose1d) sobre backbone MoE Qwen3.5-35B-A3B |
| Parametros totales | 1.428.994.241 (checkpoint safetensors del modelo base); el `mmproj` representa una fracción de este total |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MTP en Q4_K (4 bits); vocoder DAC en FP16 (sin pérdida) o Q8_0 (convoluciones 1D) + FP16 |
| Idiomas soportados | ru, en, zh, ja, ko, es, pt, fr, de, multilingual |
| Licencia | fish-audio-research-license |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Drama-3 emplea la arquitectura FishOmniModel, con un backbone MoE Qwen3.5-35B-A3B de 20 GB y un proyector multimodal de audio. Este proyector se divide en dos componentes: una torre MTP compuesta por capas transformer `nn.Linear` que predicen tokens acústicos residuales mediante cuantización vectorial residual (RVQ), y un vocoder Fish DAC que usa `Conv1d`, activaciones periódicas `Snake` y bloques de upsampling `ConvTranspose1d` para generar audio PCM a 44,1 kHz.

La innovación técnica de esta conversión es el split híbrido selectivo: se cuantiza únicamente la torre MTP a Q4_K, mientras que el vocoder DAC se preserva en FP16 (o Q8_0 para convoluciones 1D). Esto evita los problemas de los kernels CUDA de GGML, que no soportan convoluciones transpuestas cuantizadas, y la distorsión de fase que provoca la cuantización de baja precisión en las convoluciones DAC. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Síntesis de voz (text-to-speech) de alta fidelidad a 44,1 kHz.
- Generación de audio PCM a partir de tokens acústicos discretos mediante el vocoder Fish DAC.
- Predicción multi-token de codebooks acústicos residuales (RVQ) mediante la torre MTP.
- Soporte multilingüe en ruso, inglés, chino, japonés, coreano, español, portugués, francés y alemán.
- Ejecución acelerada por GPU en llama.cpp con offload completo (`-ngl 99`).
- Compatibilidad con GPUs de consumo de 6, 8 y 12 GB de VRAM.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada en la información disponible.

## Casos de uso

- Síntesis de voz en tiempo casi real en GPUs de consumo: con el checkpoint Q4_K MTP + Q8 DAC se alcanza 0,76x de velocidad en tiempo real en una GTX 1660, lo que permite generar locuciones de 22-24 segundos en unos 28 segundos en hardware modesto.
- Generación de audiolibros y narración por lotes: el vocoder en FP16 garantiza calidad de estudio sin ruido sibilante, adecuado para producir horas de audio narrado con calidad consistente.
- Asistentes de voz locales y privados: al ejecutarse íntegramente en una GPU de consumo con llama.cpp, permite desplegar TTS sin enviar texto a servicios en la nube, útil en entornos con requisitos de privacidad.
- Doblaje y localización multilingüe: el soporte de nueve idiomas permite generar voces para contenido en ruso, inglés, chino, japonés, coreano, español, portugués, francés y alemán desde un mismo pipeline.
- Prototipado de aplicaciones de accesibilidad: integración en lectores de pantalla o sistemas de asistencia por voz que requieren baja latencia y ejecución local en equipos con 6-8 GB de VRAM.
- Investigación en síntesis de voz: la disponibilidad de dos variantes (FP16 y Q8_0 en el vocoder) permite estudiar el compromiso entre calidad acústica y uso de VRAM en un mismo modelo.
- Integración en pipelines de generación de contenido: el formato GGUF y la compatibilidad con llama.cpp facilitan el despliegue en herramientas de automatización de audio sin necesidad de infraestructura de datacenter.

## Benchmarks y rendimiento

Resultados publicados por el autor en una NVIDIA GeForce GTX 1660 6 GB GDDR5 (Intel Core i5-14600KF, Linux, CUDA 12.6), sobre locuciones de 22-24 segundos:

| Configuracion | Ubicacion mmproj | Cache MoE | Tiempo total | Velocidad de generacion | Calidad de audio |
|---|---|---|---|---|---|
| BF16 original (baseline) | CPU (`--no-mmproj-offload`) | 1.500 MiB | 58,18 s | 0,41x | Limpia (cuello de botella en CPU) |
| Q4_K MTP + FP16 DAC | GPU (`-ngl 99`) | 500 MiB | 30,93 s | 0,77x | Cristalina |
| Q4_K MTP + Q8 DAC | GPU (`-ngl 99`) | 500 MiB | 28,42 s | 0,76x | Nitida y con cuerpo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el `mmproj`: 959 MB (variante Q4_K MTP + Q8 DAC) o 1.064 MB (variante Q4_K MTP + FP16 DAC), frente a los 2.806 MB del BF16 original.
- El backbone MoE Qwen3.5-35B-A3B ocupa 20 GB, por lo que el conjunto completo requiere planificación de offload; el `mmproj` está diseñado para caber en GPUs de 6, 8 y 12 GB junto con una caché MoE reducida (500 MiB en los benchmarks).
- GPU recomendadas: GTX 1660 6 GB (probada por el autor), así como GPUs de 8 GB y 12 GB para mayor margen; no se especifican modelos de gama alta como A100, H100 o RTX 4090 en la información disponible.
- Cabe en GPU de consumo: sí, con la configuración híbrida y `-ngl 99`.
- Opciones de despliegue: llama.cpp (formato GGUF, con soporte de `--no-mmproj-offload` y `-ngl`).
- Latencia y throughput: 28,42-30,93 segundos para 22-24 segundos de audio en GTX 1660, equivalente a 0,76-0,77x de tiempo real; el baseline en CPU tarda 58,18 segundos (0,41x).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drama-3-mmproj-GGUF (esta ficha) | 1.428.994.241 (checkpoint base) | no disponible | GGUF | fish-audio-research-license | Hugging Face |
| fishaudio/drama-3 (BF16 original) | 1.428.994.241 | no disponible | safetensors | fish-audio-research-license | Hugging Face |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia fish-audio-research-license es una licencia de investigación; debe revisarse su texto completo antes de cualquier uso comercial.
- El checkpoint es únicamente el proyector multimodal (`mmproj`); no es un modelo autónomo y requiere el backbone Drama-3 completo para funcionar.
- La cuantización Q8_0 de las convoluciones 1D del vocoder puede introducir diferencias acústicas menores frente a FP16, aunque el autor la describe como nítida y con cuerpo.
- Los kernels CUDA de GGML no soportan convoluciones transpuestas cuantizadas, lo que limita las opciones de cuantización del vocoder.
- El rendimiento medido corresponde a una GTX 1660 con 5.754 MiB de VRAM utilizables; en GPUs con menos VRAM o distinto ancho de banda los resultados pueden variar.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones específicas de contexto o idioma en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/MikhailSt/Drama-3-mmproj-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Licencia: https://github.com/fishaudio/fish-speech/blob/main/LICENSE
