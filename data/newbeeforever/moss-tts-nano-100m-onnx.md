# newbeeforever/MOSS-TTS-Nano-100M-ONNX

## Resumen

MOSS-TTS-Nano-100M-ONNX es la exportación a formato ONNX de MOSS-TTS-Nano, un modelo de síntesis de voz (text-to-speech) multilingüe de aproximadamente 0,1B de parámetros desarrollado por MOSI.AI y el equipo OpenMOSS. El repositorio, publicado por el usuario newbeeforever, contiene únicamente los grafos ONNX del modelo, no los pesos originales en PyTorch, y está pensado para su uso conjunto con MOSS-Audio-Tokenizer-Nano-ONNX, que aporta los módulos de codificación y decodificación de audio.

El modelo sigue una arquitectura puramente autorregresiva basada en la combinación de un tokenizador de audio y un modelo de lenguaje. Su propuesta de valor es el despliegue ligero sin dependencia de PyTorch: los grafos están divididos en etapas de prefill, decode-step y decodificador local, lo que facilita la inferencia incremental en streaming sobre CPU y en el navegador mediante `onnxruntime` y `onnxruntime-web`. La salida nativa es audio de 48 kHz y 2 canales.

Este repositorio es relevante para quienes necesitan integrar TTS en entornos con recursos limitados —extensiones de navegador, demos locales, aplicaciones de escritorio sin GPU— priorizando huella reducida y latencia baja sobre calidad absoluta. La licencia Apache 2.0 permite uso comercial. No se especifican en la información disponible los idiomas concretos cubiertos ni los detalles del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autorregresiva: Audio Tokenizer + LLM (transformer) |
| Parámetros totales | ~0,1B (100M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (exportación ONNX; se desconoce si incluye variantes cuantizadas) |
| Idiomas soportados | multilingüe; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `.onnx` con pesos externos `.data`); tokenizer SentencePiece |
| Frecuencia de muestreo de salida | 48 kHz, 2 canales |
| Backends soportados | `onnxruntime` (CPU), `onnxruntime-web` (navegador) |
| Tamaño del repositorio | ~0,7 GB |

## Arquitectura y entrenamiento

El modelo emplea un pipeline puramente autorregresivo compuesto por un tokenizador de audio y un modelo de lenguaje. La exportación ONNX descompone la inferencia en varios grafos especializados: `moss_tts_prefill.onnx` (transformador global en fase de prefill), `moss_tts_decode_step.onnx` (paso de decodificación con caché KV), `moss_tts_local_decoder.onnx`, `moss_tts_local_cached_step.onnx` y `moss_tts_local_fixed_sampled_frame.onnx`. Los pesos se distribuyen en dos ficheros externos compartidos (`moss_tts_global_shared.data` y `moss_tts_local_shared.data`), y el frontend de texto utiliza un tokenizador SentencePiece (`tokenizer.model`).

La separación en grafos de prefill y decode-step con caché KV está diseñada para favorecer la generación en streaming: cada paso genera un frame de audio de forma incremental, lo que reduce la latencia percibida en productos en tiempo real. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card remite al informe técnico de MOSS-TTS (arXiv:2603.18090) y al de MOSS-Audio-Tokenizer (arXiv:2602.10934) para los detalles de entrenamiento. La decodificación de waveform se delega al repositorio complementario MOSS-Audio-Tokenizer-Nano-ONNX.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) con salida nativa a 48 kHz y 2 canales.
- Soporte multilingüe, con la misma cobertura de idiomas que la versión PyTorch MOSS-TTS-Nano (lista concreta no disponible).
- Inferencia autorregresiva en streaming mediante grafos separados de prefill y decode-step con caché KV.
- Despliegue sin PyTorch: ejecución sobre `onnxruntime` en CPU y `onnxruntime-web` en navegador.
- Integración con tokenizador SentencePiece para el procesamiento del texto de entrada.
- No se documentan en la información disponible capacidades de clonación de voz, control de estilo, tool calling ni razonamiento multi-paso.

## Casos de uso

- Lectura por voz en extensiones de navegador: el modelo se ejecuta con `onnxruntime-web` y puede integrarse en una extensión que lea el contenido de la página sin enviar texto a servidores externos, gracias a su huella de ~0,1B parámetros. El proyecto MOSS-TTS-Nano-Reader es un ejemplo de esta aplicación.
- Demos y prototipos de TTS en el navegador: la exportación ONNX con manifiesto de integración (`browser_poc_manifest.json`) permite montar una prueba de concepto de síntesis de voz sin backend ni GPU.
- Asistentes de voz locales en aplicaciones de escritorio: al ejecutarse en CPU con `onnxruntime`, encaja en aplicaciones que necesitan TTS offline en equipos sin GPU dedicada.
- Accesibilidad: generación de audio para lectores de pantalla y aplicaciones de asistencia a personas con discapacidad visual en entornos con recursos limitados.
- Sistemas embebidos y dispositivos de borde: el tamaño reducido y la ausencia de dependencia de PyTorch facilitan el despliegue en hardware con poca memoria y sin acelerador.
- Generación de audio para contenidos y notificaciones: locuciones cortas en aplicaciones, avisos o interfaces conversacionales donde prima la latencia baja sobre la calidad de estudio.
- Investigación en TTS ligero: base para experimentar con arquitecturas autorregresivas tokenizador+LLM en entornos de cómputo modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa ~0,7 GB en disco; al ser un modelo de ~0,1B parámetros, la inferencia en CPU es viable sin GPU.
- GPU recomendadas: no aplica de forma específica; el diseño está orientado a CPU y navegador. No se documentan requisitos de GPU.
- ¿Cabe en GPU de consumo? Sí, por tamaño (0,1B), aunque no se proporcionan cifras de VRAM ni pruebas en GPU concretas.
- Opciones de despliegue: `onnxruntime` (CPU) y `onnxruntime-web` (navegador). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia dentro de la misma familia, existe la versión PyTorch MOSS-TTS-Nano (OpenMOSS-Team/MOSS-TTS-Nano), que comparte arquitectura y parámetros pero requiere PyTorch en lugar de ONNX Runtime.

## Limitaciones y advertencias

- El repositorio contiene solo los grafos ONNX; requiere el tokenizador de audio complementario (MOSS-Audio-Tokenizer-Nano-ONNX) para producir waveform, por lo que no es autosuficiente.
- No se especifican los idiomas concretos soportados ni la calidad por idioma; la cobertura se declara como equivalente a la versión PyTorch, sin detalle.
- No hay datos publicados de benchmarks, latencia ni calidad subjetiva (MOS), lo que dificulta evaluar su idoneidad en producción.
- Al ser un modelo de ~0,1B parámetros, la calidad esperada es la de un TTS ligero orientado a tiempo real, no la de un sistema de estudio.
- Riesgo de alucinación y errores de pronunciación inherentes a los modelos autorregresivos de audio; no se documentan mecanismos de mitigación.
- Sesgos: no se documentan sesgos conocidos, pero al no detallarse el dataset de entrenamiento no puede descartarse un sesgo de dominio o de idioma.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los repositorios complementarios (tokenizador de audio) antes de integrar el pipeline completo.
- El repositorio es una exportación de terceros (newbeeforever) con 0 descargas y 0 likes en el momento de la consulta; no es el repositorio oficial de OpenMOSS, lo que implica menor garantía de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/newbeeforever/MOSS-TTS-Nano-100M-ONNX
- Modelo PyTorch original: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano
- Tokenizador de audio ONNX complementario: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX
- Tokenizador de audio PyTorch: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Código fuente y demos: https://github.com/OpenMOSS/MOSS-TTS-Nano
- Aplicación de lectura en navegador: https://github.com/OpenMOSS/MOSS-TTS-Nano-Reader
- Informe técnico MOSS-TTS: https://arxiv.org/abs/2603.18090
- Informe técnico MOSS-Audio-Tokenizer: https://arxiv.org/abs/2602.10934
- Sitio de MOSI.AI: https://mosi.cn/#hero
- Sitio de OpenMOSS: https://www.open-moss.com/
