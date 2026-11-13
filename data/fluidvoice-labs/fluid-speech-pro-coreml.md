# FluidVoice-Labs/fluid-speech-pro-coreml

## Resumen

Fluid Speech Pro (Core ML) es una compilación optimizada para Apple Silicon del modelo de reconocimiento automático del habla Fluid Speech Pro, desarrollado por FluidVoice-Labs (el equipo detrás de FluidVoice). El modelo base es un ajuste fino de NVIDIA Parakeet TDT 0.6B v3, una arquitectura FastConformer con decodificador TDT (token-and-duration transducer) de 0,63 mil millones de parámetros, adaptada para transcripción multilingüe en 25 idiomas europeos con detección automática de idioma.

Esta variante concreta convierte el modelo a formato Core ML con pesos de 8 bits en el codificador, empaquetándolo en cuatro submodelos (`Preprocessor`, `Encoder`, `Decoder`, `JointDecision`) que se ejecutan en el Apple Neural Engine. El resultado es una descarga de 652 MB que ocupa aproximadamente 250 MB de memoria en ejecución y transcribe 16,6 minutos de audio en unos 4 segundos en un Mac, sin necesidad de GPU dedicada ni conexión a servidores.

Su relevancia práctica está en que acerca un modelo de precisión competitiva (6,06 WER promedio en el Open ASR Leaderboard, segundo mejor modelo abierto y el más preciso por debajo de 1B parámetros) al despliegue nativo en aplicaciones macOS y iOS mediante Swift, con licencia permisiva CC BY 4.0. La contrapartida es que esta build Core ML aún no incluye el modo "clean" (eliminación de muletillas y repeticiones) que ya está disponible en la versión NeMo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT (token-and-duration transducer, decoder); un bloque extra entre el subsampling del encoder y la primera capa Conformer |
| Parametros totales | 0,63 mil millones (630M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por ventanas; no se especifica límite de audio en la información) |
| Tipos de cuantizacion | Encoder en int8 (una escala por canal de salida); decoder y joint en 16 bits; pesos empaquetados en Core ML (`.mlmodelc`) |
| Idiomas soportados | 25 idiomas europeos: en, bg, hr, cs, da, nl, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (`.mlmodelc`), vocabulario y `config.json`; descarga total 652 MB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de NVIDIA Parakeet TDT 0.6B v3: un encoder FastConformer que procesa características acústicas tipo NeMo y un decodificador TDT (transducer con predicción conjunta de token y duración), que emite texto junto con la duración de cada token para mejorar la alineación temporal. FluidVoice-Labs añade un bloque pequeño adicional entre el subsampling del encoder y la primera capa Conformer; la model card no detalla la función exacta de ese bloque.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste con pseudo-etiquetas. Lo que sí se indica es que el modelo conserva los 25 idiomas europeos del Parakeet original, detecta el idioma automáticamente sin prompt y produce puntuación y mayúsculas. Esta build Core ML añade además una conversión específica: el encoder se cuantiza a int8 con una escala por canal de salida, mientras decoder y joint permanecen en 16 bits, y el preprocesador de audio replica exactamente la extracción de features de NeMo, por lo que los cuatro submodelos deben mantenerse juntos.

## Capacidades

- Transcripción automática de voz a texto (ASR) en 25 idiomas europeos con detección automática del idioma, sin necesidad de indicar el idioma de entrada.
- Puntuación y capitalización incluidas en la salida.
- Robustez ante ruido: segundo mejor modelo abierto en el conjunto URGENT 2024 del Open ASR Leaderboard (9,83 WER).
- Ejecución on-device en el Apple Neural Engine, sin dependencia de servidores ni GPU externa.
- Integración nativa en Swift mediante la librería FluidAudio (`AsrModels.load`, `AsrManager`).
- Capacidad de procesar grabaciones largas con rapidez: 16,6 minutos de audio en aproximadamente 4 segundos.
- No incluye, por ahora, el modo "clean" (eliminación de muletillas y palabras repetidas), anunciado para una actualización futura de esta build.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio multimodal ni traducción.

## Casos de uso

- Transcripción de reuniones en macOS: la app puede cargar los modelos Core ML y transcribir grabaciones de decenas de minutos en pocos segundos gracias al rendimiento de ~4 s por 16,6 min de audio, con puntuación y mayúsculas ya incluidas.
- Dictado por voz en aplicaciones nativas Swift: integración directa con FluidAudio para convertir voz a texto en editores, notas o correo, ejecutándose en el Neural Engine y consumiendo ~250 MB de memoria.
- Subtitulado y actas de vídeo multilingües: al detectar automáticamente el idioma entre 25 lenguas europeas, permite procesar contenido en inglés, alemán, francés, español, polaco, etc., sin configurar el idioma manualmente.
- Herramientas de accesibilidad: transcripción local de conversaciones para personas con problemas auditivos, sin enviar audio a la nube, lo que reduce latencia y preserva la privacidad.
- Procesamiento de audio ruidoso: entrevistas de campo, grabaciones de calle o reuniones con micrófonos deficientes, aprovechando el 9,83 WER en URGENT 2024, segundo mejor entre modelos abiertos.
- Transcripción por lotes en pipelines de macOS: automatizar la conversión de archivos WAV a texto en flujos de trabajo locales (por ejemplo, con el ejemplo CLI incluido en `examples/swift/`) sin infraestructura de servidores.
- Investigación en ASR europeo: servir como referencia reproducible para evaluar modelos FastConformer-TDT en 25 idiomas con licencia CC BY 4.0.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo NeMo de referencia, no a esta build Core ML (la model card indica que la comparación de esta build está pendiente de publicar).

| Benchmark | Resultado |
|---|---|
| Open ASR Leaderboard (WER promedio) | 6,06 |
| Posición en Open ASR Leaderboard | #2 entre modelos abiertos |
| Ranking por debajo de 1B parámetros | #1 (10% menos errores que el siguiente modelo abierto <1B) |
| URGENT 2024 (habla ruidosa, WER) | 9,83 (#2 entre modelos abiertos) |
| Rendimiento de inferencia (Core ML) | 16,6 min de audio en ~4 s en un Mac |

No se han publicado resultados de benchmarks específicos de esta build Core ML en la información disponible.

## Requisitos de hardware

- Ejecución exclusiva en Apple Silicon con soporte de Apple Neural Engine (Macs con chip M-series); no está pensada para GPUs NVIDIA ni CPUs x86.
- VRAM/memoria: aproximadamente 250 MB en ejecución; descarga de 652 MB.
- GPU recomendadas: no aplica; el cómputo se realiza en el Neural Engine. No se especifican modelos de GPU discretas compatibles.
- ¿Cabe en consumer GPU? No aplica: el despliegue objetivo son Macs con Apple Silicon, no GPUs consumer.
- Opciones de despliegue: Core ML con la librería Swift FluidAudio (rama `main` del repositorio altic-dev/FluidAudio); ejemplo CLI en `examples/swift/`. Para otros entornos existen las variantes NeMo+Transformers, ONNX, MLX y GGUF del mismo modelo.
- Latencia y throughput: ~4 segundos para 16,6 minutos de audio en un Mac (según la model card); no se detalla el chip concreto utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER (Open ASR Leaderboard) | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| Fluid Speech Pro (Core ML) | 0,63B | 25 europeos | 6,06 (modelo NeMo de referencia) | CC BY 4.0 | Core ML / Apple Neural Engine |
| Fluid Speech Pro (NeMo) | 0,63B | 25 europeos | 6,06 | CC BY 4.0 | NeMo + Transformers / GPU NVIDIA |
| Fluid Speech Pro (MLX) | 0,63B | 25 europeos | no disponible en esta información | CC BY 4.0 | MLX / Apple Silicon |
| Fluid Speech Pro (ONNX / GGUF) | 0,63B | 25 europeos | no disponible en esta información | CC BY 4.0 | ONNX, GGUF / CPU, C++ |

No se dispone en la información proporcionada de datos comparativos frente a otros modelos ASR abiertos (por ejemplo, Whisper large-v3) más allá de las posiciones relativas en el leaderboard.

## Limitaciones y advertencias

- Solo cubre 25 idiomas europeos; no soporta otras lenguas (asiáticas, africanas, etc.) ni traducción.
- El modo "clean" (eliminación de muletillas y repeticiones) no está disponible aún en esta build Core ML; solo en la versión NeMo.
- Los benchmarks publicados corresponden al modelo NeMo; el rendimiento exacto de esta build cuantizada a int8 no está documentado y puede diferir.
- Dependencia estricta de los cuatro submodelos (`Preprocessor`, `Encoder`, `Decoder`, `JointDecision`) y del vocabulario/config: no deben separarse, y el encoder espera recuentos de frames concretos.
- Plataforma limitada a Apple Silicon con Neural Engine; no es desplegable en Linux, Windows o GPUs NVIDIA.
- Riesgo de alucinación inherente a los modelos ASR, especialmente en audio ruidoso, solapamiento de hablantes o vocabulario especializado (nombres propios, jerga técnica).
- Sesgos lingüísticos y acústicos derivados del dataset de entrenamiento del modelo base Parakeet, no detallado en esta información.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución a FluidVoice-Labs y al modelo base.
- No se documentan limitaciones de longitud máxima de audio ni latencia en chips concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-coreml
- Modelo base (NeMo + Transformers): https://huggingface.co/FluidVoice-Labs/fluid-speech-pro
- Variante ONNX: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-onnx
- Variante MLX: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-mlx
- Variante GGUF: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-gguf
- Modelo original NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Librería FluidAudio (Swift): https://github.com/altic-dev/FluidAudio
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Sitio de FluidVoice: https://fluidvoice.com
