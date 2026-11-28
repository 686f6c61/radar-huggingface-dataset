# OpenMOSS-Team/MOSS-TTS-Nano-100M-ONNX

## Resumen

MOSS-TTS-Nano-100M-ONNX es la exportación a formato ONNX de MOSS-TTS-Nano, un modelo de síntesis de voz (text-to-speech) multilingüe de aproximadamente 0,1B parámetros desarrollado por MOSS AI y OpenMOSS. El modelo original en PyTorch se distribuye por separado; este repositorio contiene únicamente los grafos ONNX optimizados para inferencia sin dependencia de PyTorch, orientados a despliegues ligeros en CPU y en navegador.

La arquitectura sigue un esquema puramente autorregresivo de tipo Audio Tokenizer + LLM: un modelo de lenguaje genera tokens de audio que posteriormente se decodifican a forma de onda mediante un tokenizador de audio complementario (MOSS-Audio-Tokenizer-Nano-ONNX, distribuido en un repositorio aparte). La exportación está dividida en grafos de prefill, decode-step con caché KV, decodificador local y muestreo de frames, lo que facilita la generación en streaming.

Su relevancia actual radica en que permite integrar TTS de calidad aceptable para productos en tiempo real sin GPU ni frameworks pesados: el stack completo funciona con `onnxruntime` en CPU y con `onnxruntime-web` en el navegador, con salida nativa a 48 kHz y 2 canales. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autorregresiva Audio Tokenizer + LLM (transformer global con decodificador local) |
| Parametros totales | ~0,1B (100M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportacion ONNX; pesos en ficheros `.data` externos) |
| Idiomas soportados | multilingue, misma cobertura que MOSS-TTS-Nano en PyTorch (lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `.onnx` con pesos externos `.data`), tokenizer SentencePiece (`tokenizer.model`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura puramente autorregresiva compuesta por un transformer global y un decodificador local, que operan sobre tokens de audio producidos por un tokenizador de audio neuronal. La exportación ONNX separa las fases de inferencia en grafos independientes: `moss_tts_prefill.onnx` para el prefill del transformer global, `moss_tts_decode_step.onnx` para el paso de decodificación con caché KV, `moss_tts_local_decoder.onnx` y `moss_tts_local_cached_step.onnx` para el decodificador local, y `moss_tts_local_fixed_sampled_frame.onnx` para el muestreo de frames. Los pesos compartidos se distribuyen en dos ficheros externos (`moss_tts_global_shared.data` y `moss_tts_local_shared.data`).

La salida de audio nativa es de 48 kHz y 2 canales. El frontend de texto utiliza un tokenizador SentencePiece (`tokenizer.model`). No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo forma parte de la familia MOSS-TTS y cuenta con un informe técnico asociado (arXiv:2603.18090) y un trabajo sobre el tokenizador de audio (arXiv:2602.10934).

## Capacidades

- Síntesis de voz multilingüe a partir de texto, con salida de audio a 48 kHz y 2 canales.
- Generación autorregresiva de tokens de audio con soporte de streaming mediante la separación en grafos de prefill y decode-step.
- Inferencia sin PyTorch: ejecución en CPU con `onnxruntime` y en navegador con `onnxruntime-web`.
- Integración con el tokenizador de audio complementario MOSS-Audio-Tokenizer-Nano-ONNX para codificar y decodificar forma de onda.
- Frontend de texto basado en SentencePiece para tokenización de la entrada.
- No se documentan en la información disponible capacidades de clonación de voz, control de estilo, tool calling ni razonamiento multi-paso.

## Casos de uso

- Lectura de contenido web en el navegador: el modelo puede ejecutarse con `onnxruntime-web` sin backend, permitiendo extensiones o aplicaciones de lectura que sintetizan artículos en el propio cliente; el repositorio MOSS-TTS-Nano-Reader es un ejemplo de esta integración.
- Asistentes de voz en dispositivos de borde: al caber en CPU y tener ~100M parámetros, puede desplegarse en equipos sin GPU para respuestas habladas de baja latencia en entornos domóticos o terminales empotrados.
- Accesibilidad: conversión de texto a voz para lectores de pantalla y aplicaciones de accesibilidad que requieren funcionamiento local sin conexión ni servicios en la nube.
- Demos y prototipos de producto en tiempo real: la exportación en grafos de prefill/decode permite generar audio por streaming, adecuado para validar experiencias conversacionales antes de escalar a modelos mayores.
- Sistemas de anuncios o avisos automatizados: generación de mensajes hablados multilingües en paneles, transporte público o comercios, con despliegue en hardware de bajo coste.
- Integración en pipelines de datos sin PyTorch: al ser ONNX puro, encaja en infraestructuras de inferencia basadas en ONNX Runtime ya existentes, evitando añadir dependencias de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para el objetivo principal; el modelo está diseñado para CPU. No se dispone de cifras de VRAM para ejecución en GPU.
- GPU recomendadas: no disponible; el diseño apunta a `onnxruntime` en CPU y `onnxruntime-web` en navegador.
- Cabe en GPU de consumo: no se documenta, aunque por tamaño (~0,1B parámetros y repo de 0,7 GB) es presumible que sí; no confirmado en la información disponible.
- Opciones de despliegue: `onnxruntime` (CPU), `onnxruntime-web` (navegador). Requiere además el tokenizador de audio MOSS-Audio-Tokenizer-Nano-ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| MOSS-TTS-Nano-100M-ONNX | ~0,1B | no disponible | multilingüe (lista no disponible) | Apache 2.0 | ONNX, CPU y navegador |
| MOSS-TTS-Nano (PyTorch) | ~0,1B | no disponible | misma cobertura que la versión ONNX | Apache 2.0 | PyTorch |
| Otras alternativas TTS ligeras | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos competidores que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Este repositorio contiene solo los grafos ONNX del modelo de lenguaje y el tokenizador de texto; la síntesis completa requiere descargar además MOSS-Audio-Tokenizer-Nano-ONNX.
- No se documentan en la información disponible sesgos conocidos, tasas de alucinación ni evaluación de calidad perceptual (MOS u otras métricas).
- La lista concreta de idiomas soportados no está disponible; solo se indica que coincide con la versión PyTorch.
- No se especifican limitaciones de longitud de contexto ni de duración máxima de audio generado.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones de los repositorios complementarios (tokenizador de audio) antes de un despliegue comercial.
- Al ser una exportación ONNX, la integración exige gestionar manualmente los ficheros de pesos externos y los manifiestos de metadatos (`tts_browser_onnx_meta.json`, `browser_poc_manifest.json`).
- No hay resultados de benchmarks publicados en la información disponible, por lo que la calidad objetiva frente a alternativas no puede verificarse con los datos aportados.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M-ONNX
- Modelo PyTorch MOSS-TTS-Nano: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano
- Tokenizador de audio ONNX: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX
- Tokenizador de audio PyTorch: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Repositorio GitHub MOSS-TTS-Nano: https://github.com/OpenMOSS/MOSS-TTS-Nano
- Aplicación de lectura en navegador: https://github.com/OpenMOSS/MOSS-TTS-Nano-Reader
- Web de MOSS AI: https://www.moss-ai.com/models/moss-tts-nano
- Web de OpenMOSS: https://openmoss.ai/
- Informe técnico MOSS-TTS (arXiv:2603.18090): https://arxiv.org/abs/2603.18090
- MOSS-Audio-Tokenizer (arXiv:2602.10934): https://arxiv.org/abs/2602.10934
