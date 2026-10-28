# deepankar17/whisper-hinglish-sherpa-onnx-int8

## Resumen

Whisper Hinglish para sherpa-onnx (int8) es una conversión a ONNX con cuantización dinámica a int8 del modelo `Trelis/whisper-hinglish-preview`, un ajuste fino de Whisper large-v3 especializado en habla code-mixed hindi-inglés (hinglish). Lo publica el usuario deepankar17 y su único cambio respecto al original es el formato: no reentrena ni modifica pesos, solo exporta el encoder y el decoder a ONNX y los cuantiza para que puedan ejecutarse con sherpa-onnx en dispositivos móviles sin framework de PyTorch.

El problema que resuelve es concreto: la transcripción de conversaciones en las que se alterna hindi e inglés dentro de la misma frase. El modelo escribe el hindi en devanagari y conserva las palabras y frases en inglés en su alfabeto original, lo que evita el fenómeno habitual de transliteración forzada. Además, inyecta el token `<|mixedcode|>` (id 51866) en la secuencia `sot_sequence` del encoder, de modo que sherpa-onnx arranca cada decodificación con el mismo prefijo con el que se entrenó el ajuste fino, sin necesidad de parchear la librería.

Es relevante por su perfil de despliegue: un modelo del tamaño de large-v3 (aproximadamente 1550 M de parámetros) comprimido a int8 en dos ficheros ONNX que suman unos 1,77 GB y requieren alrededor de 2 GB de memoria para cargarse. El propio autor advierte de que es más lento que tiempo real en la mayoría de teléfonos, por lo que está pensado para transcribir después de la grabación y no para reconocimiento en vivo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper large-v3: d_model 1280, 32 capas de encoder y 32 de decoder, 20 cabezas de atención) |
| Parámetros totales | ~1550 M (el autor lo describe como modelo "del tamaño de large-v3") |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventana de audio de 30 s por segmento (arquitectura Whisper); no se especifica gestión de audio largo más allá del troceado |
| Tipos de cuantización | int8 dinámico (ONNX Runtime); no se publican versiones fp32 ni fp16 en el repo |
| Idiomas soportados | hindi (hi) e inglés (en), incluido el code-switching hinglish; salida en devanagari para hindi y alfabeto latino para inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX int8 (`encoder.int8.onnx`, `decoder.int8.onnx`) + `tokens.txt` |

Tamaños exactos de los ficheros publicados: `encoder.int8.onnx` 766.590.125 bytes, `decoder.int8.onnx` 1.008.201.478 bytes, `tokens.txt` 816.730 bytes. Tamaño total del repositorio: 1,8 GB. El vocabulario de `tokens.txt` es el estándar de Whisper large-v3, el mismo que usa el modelo Whisper turbo de sherpa-onnx.

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3 sin cambios estructurales: un transformer encoder-decoder con atención completa sobre una ventana de 30 segundos de audio log-mel, 1280 dimensiones de modelo y 32 capas en cada torre. La conversión se hizo mapeando los pesos de Hugging Face al layout de OpenAI Whisper y exportándolos con el script de exportación de sherpa-onnx (exportador TorchScript a ONNX, datos externos y cuantización dinámica int8 posterior). La revisión de origen utilizada fue `eab1188fd2d0e91f2584229b32b3bfe1901c896c` del modelo base.

La cadena de ascendencia es explícita en la model card: Whisper large-v3 de OpenAI, ajustado por ARTPARK-IISc en `whisper-large-v3-vaani-hindi`, y sobre este el ajuste fino de Trelis Research para hinglish (`Trelis/whisper-hinglish-preview`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; tampoco se documentan innovaciones de decodificación más allá del uso del token `<|mixedcode|>` como prefijo de decodificación forzado a través de los metadatos del encoder. No hay información sobre decodificación especulativa, atención linear ni técnicas de compresión distintas de la cuantización int8.

## Capacidades

- Reconocimiento de voz offline (ASR no streaming) sobre audio de hasta 30 s por segmento.
- Transcripción de habla code-mixed hindi-inglés con salida en devanagari para el hindi y grafía latina para el inglés.
- Ajuste específico para el token de código mixto `<|mixedcode|>` (id 51866), inyectado en `sot_sequence`.
- Ejecución en CPU mediante ONNX Runtime a través de sherpa-onnx, sin PyTorch ni GPU.
- Integración directa con la API `OfflineRecognizer.from_whisper` de sherpa-onnx con `language="hi"` y `task="transcribe"`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio-to-text con marcas de tiempo, diarización ni traducción al inglés; el pipeline declarado es únicamente `automatic-speech-recognition`.

## Casos de uso

- Transcripción diferida en aplicaciones móviles de notas de voz: es exactamente el uso declarado en la model card, que indica que MinutIQ lo emplea como opción opcional de calidad "Best"; el modelo se carga en memoria (~2 GB) y procesa la grabación una vez finalizada.
- Actas de reuniones con participantes que alternan hindi e inglés: el modelo mantiene el inglés en alfabeto latino y el hindi en devanagari, lo que reduce el trabajo de corrección posterior frente a modelos que transliteran todo.
- Subtitulado de pódcasts y vídeos de YouTube en hinglish: al ser offline y no requerir GPU, se puede procesar por lotes en un servidor modesto o incluso en el propio dispositivo antes de subir el resultado.
- Analítica de contact centers en India: transcripción por lotes de llamadas de soporte para extraer palabras clave, motivos de contacto y cumplimiento, alimentando pipelines de NLP posteriores.
- Pseudo-etiquetado de corpus para entrenar modelos ASR más pequeños: el modelo grande genera transcripciones de referencia sobre audio hinglish y luego se destila en un modelo con `whisper-small` o similar.
- Investigación lingüística sobre code-switching: obtención de transcripciones normalizadas para estudiar patrones de alternancia de código, con la ventaja de que la separación de alfabetos facilita el análisis automático.
- Dictado y accesibilidad en entornos sin conectividad: al ejecutarse con sherpa-onnx en el dispositivo, no depende de servicios en la nube ni envía audio a terceros, lo que ayuda con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER, CER ni comparaciones cuantitativas frente a Whisper large-v3 o al modelo base `Trelis/whisper-hinglish-preview`. El único dato de rendimiento aportado por el autor es cualitativo: el modelo "se ejecuta más lento que tiempo real en la mayoría de teléfonos" y requiere unos 2 GB de memoria para cargarse.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2 GB de memoria para cargar el modelo, según el autor; el total de pesos int8 en disco es de 1,77 GB.
- GPU recomendadas: no se especifican; el destino declarado es CPU móvil mediante ONNX Runtime, por lo que no hay requisito de GPU.
- Cabe en GPU de consumo: sí, cualquier GPU con 2 GB o más de VRAM podría alojarlo, aunque el diseño está orientado a CPU.
- Cabe en hardware móvil: sí, es el objetivo del proyecto, con la advertencia de velocidad inferior al tiempo real en la mayoría de teléfonos.
- Opciones de despliegue: sherpa-onnx (API Python `OfflineRecognizer.from_whisper`, además de los bindings C++/Android/iOS de la librería) sobre ONNX Runtime. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a este formato.
- Latencia y throughput: no disponibles de forma numérica; solo la indicación cualitativa de que es más lento que tiempo real en teléfonos, lo que lo orienta a transcripción por lotes posterior a la grabación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| deepankar17/whisper-hinglish-sherpa-onnx-int8 | ~1550 M | 30 s de audio | hi, en (hinglish) | Apache-2.0 | ONNX int8 | Optimizado para sherpa-onnx en dispositivo; token `<\|mixedcode\|>` inyectado |
| Trelis/whisper-hinglish-preview | ~1550 M (mismo origen) | 30 s de audio | hi, en (hinglish) | Apache-2.0 | safetensors (Hugging Face) | Modelo base del anterior; requiere Transformers/PyTorch, sin cuantizar |
| openai/whisper-large-v3 | ~1550 M | 30 s de audio | multilingüe (amplio conjunto de idiomas) | Apache-2.0 en Hugging Face | safetensors, ONNX y GGUF en la comunidad | Referencia generalista; sin ajuste específico para hinglish ni token de código mixto |
| whisper-large-v3-vaani-hindi (ARTPARK-IISc) | ~1550 M | 30 s de audio | hindi principalmente | Apache-2.0 | safetensors | Ajuste en hindi que sirve de base al modelo de Trelis |

Los datos de rendimiento comparado (WER por modelo) no están disponibles en la información proporcionada, por lo que la comparativa se limita a arquitectura, licencia, formato y cobertura de idiomas.

## Limitaciones y advertencias

- Especialización estrecha: solo se declara hindi e inglés; no hay evidencia de comportamiento correcto en otros idiomas y no debe asumirse la cobertura multilingüe de Whisper large-v3.
- El repositorio no reporta métricas: 0 descargas y 0 likes, sin WER publicado ni evaluación independiente; conviene validar sobre un conjunto propio antes de usarlo en producción.
- La cuantización int8 dinámica puede degradar la precisión respecto al modelo en fp32, y no se publica ninguna comparación que cuantifique esa pérdida.
- Velocidad: más lento que tiempo real en la mayoría de teléfonos según el autor; inadecuado para dictado en vivo o subtitulado en directo sin hardware adicional.
- Ventana de 30 s: el audio largo requiere troceado externo, con el riesgo de cortes en fronteras de frase y de pérdida de contexto entre segmentos.
- Riesgo de alucinación inherente a la familia Whisper en silencios, ruido o audio musical; no se documenta ningún mecanismo de mitigación en esta conversión.
- No se documentan marcas de tiempo, diarización de hablantes, puntuación garantizada ni detección de idioma por segmento.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero exige conservar avisos de copyright y atribución; la model card insiste en acreditar a Trelis Research, ARTPARK-IISc y OpenAI. El repositorio no está afiliado ni respaldado por esos autores.
- Ausencia de soporte oficial: es una conversión de terceros; los bugs de exportación o cuantización no los cubre el equipo de sherpa-onnx ni los autores originales.
- Fechas del repositorio: creado y actualizado el 2026-10-28 según los metadatos, sin historial de versiones adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deepankar17/whisper-hinglish-sherpa-onnx-int8
- Modelo base (Trelis Research): https://huggingface.co/Trelis/whisper-hinglish-preview
- Modelo previo en la cadena (ARTPARK-IISc): https://huggingface.co/ARTPARK-IISc/whisper-large-v3-vaani-hindi
- Whisper large-v3 (OpenAI): https://huggingface.co/openai/whisper-large-v3
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Documentación de sherpa-onnx para Whisper: https://k2-fsa.github.io/sherpa/onnx/pretrained_models/whisper/index.html
- Índice de modelos preentrenados de sherpa-onnx: https://csukuangfj.github.io/sherpa/onnx/pretrained_models/index.html
- Identificación de idioma con Whisper en sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/spoken-language-identification/pretrained_models.html
- Whisper (sistema de reconocimiento de voz) en Wikipedia: https://en.wikipedia.org/wiki/Whisper_(speech_recognition_system)
