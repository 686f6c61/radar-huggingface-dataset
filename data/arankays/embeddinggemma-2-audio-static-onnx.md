# arankays/embeddinggemma-2-audio-static-onnx

## Resumen

`arankays/embeddinggemma-2-audio-static-onnx` es una conversión a ONNX del codificador de audio del modelo multimodal de embeddings EmbeddingGemma 2 de Google DeepMind, optimizada para ejecutarse en la NPU de Intel. El autor, arankays, ha fijado las formas estáticas del grafo (10 segundos de audio: 999 tramas de entrada, 250 tokens de salida) y ha cuantizado los pesos a INT8 simétrico por canal, reduciendo el tamaño de 1,17 GB a 295 MB. El objetivo es que el grafo compile y se ejecute en aceleradores NPU, que requieren formas estáticas, algo imposible con el `audio_encoder.onnx` original de `onnx-community/embeddinggemma-2-ONNX`, que acepta un número variable de tramas log-mel.

El modelo resuelve un problema muy concreto de despliegue: llevar la búsqueda semántica de audio a hardware de bajo consumo. El codificador produce 250 tokens de 512 dimensiones que se inyectan en la mitad textual del modelo (repositorio `arankays/embeddinggemma-2-text-int8-cw-onnx`, concretamente `model_audio_250.onnx`) para generar un embedding de frase L2-normalizado en un espacio compartido entre audio y texto. Esto permite buscar sonidos directamente con consultas de texto.

Es relevante ahora porque demuestra un flujo completo de embeddings multimodales en NPU con latencias muy bajas (64 ms por clip de 10 s más 34 ms para el modelo de texto) y una pérdida de calidad mínima (coseno de 0,99680 frente a la referencia fp32). El repositorio es pequeño (0,6 GB) y la licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de audio transformer (EmbeddingGemma 2) exportado a ONNX con formas estáticas; dos convoluciones stride-2 seguidas de la pila de atención |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 10 s de audio (999 tramas log-mel de entrada, 250 tokens de salida) |
| Tipos de cuantización | INT8 simétrico por canal (pesos); activaciones fp32 en el grafo |
| Idiomas soportados | no disponible (el codificador procesa audio; el espacio compartido depende del modelo de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/audio_encoder_static_10s_int8.onnx`), compatible con OpenVINO |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una conversión y optimización del codificador de audio de EmbeddingGemma 2. La arquitectura subyacente es la del codificador de audio de EmbeddingGemma 2, que procesa características log-mel y las proyecta al espacio de embeddings del modelo textual. La innovación de esta ficha es puramente de despliegue: se fijan las formas del grafo (`input_features` `[1, 999, 128]`, `input_features_mask` `[1, 999]` bool, `audio_features` `[250, 512]`, `audio_mask` `[1, 250]`) y se cuantizan los pesos a INT8 simétrico por canal. La conversión se generó con el script `bench/static_audio.py` del repositorio vinoSearch.

El preprocesado es específico: 128 mels HTK de 0 a 8 kHz, ventanas Hann periódicas de 320 muestras cada 160 muestras, FFT de 512 puntos y transformación `ln(mel + 0.001)`. Diez segundos producen exactamente 999 tramas. Los clips más cortos se rellenan con filas cero y máscara falsa hasta 999. Tras las dos convoluciones stride-2, solo las primeras `ceil(ceil(n / 2) / 2)` filas de `audio_features` son reales para `n` tramas válidas; el resto se descarta en el pooling del modelo textual. No se dispone de información sobre los datos de entrenamiento originales de EmbeddingGemma 2 ni sobre si hubo RLHF o DPO.

## Capacidades

- Extracción de embeddings de audio: convierte hasta 10 segundos de audio mono a 16 kHz en 250 tokens de 512 dimensiones.
- Espacio de embeddings compartido con texto: los embeddings de audio son comparables directamente con embeddings de texto generados por la mitad textual del modelo, lo que permite búsqueda semántica de sonidos mediante consultas escritas.
- Búsqueda texto-a-audio: consultas como "a dog barking" o "church bells ringing" recuperan clips de audio relevantes con similitudes coseno de hasta 0,752 y 0,690 respectivamente en las pruebas del autor.
- Inferencia en NPU de Intel: el grafo con formas estáticas compila y se ejecuta en la NPU (probado en Core 5 320, Wildcat Lake) mediante OpenVINO.
- Ejecución en CPU: también funciona en ONNX Runtime CPU con calidad prácticamente idéntica (coseno de 0,99683 frente a 0,99680 en NPU).
- Integración con el modelo de texto: los tokens de audio se inyectan en `model_audio_250.onnx` con la secuencia `[2, 256000, 258881 × N, 258883, 1]` (bos, begin-of-audio, N tokens de audio, end-of-audio, eos) para producir el embedding de frase final.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un codificador de características.

## Casos de uso

- Búsqueda semántica de audio en bibliotecas de sonido: indexar clips de hasta 10 segundos con el codificador y permitir consultas en lenguaje natural ("rain falling", "an ambulance siren") que recuperan los clips más similares en el espacio compartido. Adecuado por la baja latencia (64 ms por clip en NPU) y la calidad de recuperación demostrada en ESC-50.
- Clasificación y etiquetado automático de eventos sonoros: generar embeddings de fragmentos de audio y compararlos contra embeddings de etiquetas textuales para asignar categorías (perro, campanas, lluvia, sirena) sin entrenar un clasificador específico.
- Detección de eventos acústicos en dispositivos de borde: al ejecutarse en NPU de Intel con 64 ms por clip de 10 s, es viable en equipos de vigilancia o domótica que necesiten identificar sonidos anómalos (cristales rotos, alarmas) sin enviar audio a la nube.
- Moderación de contenido audiovisual: filtrar o marcar clips por su contenido sonoro comparando sus embeddings contra consultas de texto de categorías prohibidas, aprovechando el espacio compartido audio-texto.
- Enriquecimiento de bases de datos multimedia: generar embeddings de audio para motores de recomendación o sistemas de búsqueda híbrida (texto + audio) en plataformas de podcast, vídeo o música, donde la consulta puede ser textual y el documento sonoro.
- Análisis de grabaciones ambientales o de campo: procesar segmentos de 10 s de grabaciones de biodiversidad y buscar patrones acústicos concretos mediante descripciones textuales, con despliegue en hardware de bajo consumo.
- Prototipado de pipelines multimodales en local: servir como componente de audio en un sistema de recuperación aumentada (RAG) multimodal que combine transcripciones y sonidos, usando el modelo de texto complementario del mismo autor.

## Benchmarks y rendimiento

Resultados medidos por el autor en un Core 5 320 (NPU Wildcat Lake), OpenVINO 2026.4.1, el 11 de noviembre de 2026, sobre clips de ESC-50 y voz sintetizada con espeak. La referencia es el `audio_encoder.onnx` fp32 original en ONNX Runtime.

| Configuración | Coseno de características (media) | Coseno de embedding de frase (peor clip) | Tiempo por 10 s en NPU |
|---|---|---|---|
| Estático fp32 en NPU | 0,99982 | 0,99985 | no disponible |
| Estático INT8 (este repo) en NPU | 0,99680 | 0,99838 | 64 ms (+ 34 ms para `model_audio_250`) |
| Estático INT8 en ONNX Runtime CPU | 0,99683 | 0,99851 | no disponible |

Recuperación texto-a-audio con INT8 en NPU (mejor resultado por consulta en negrita):

| Consulta | speech | dog | bells | rain | siren |
|---|---|---|---|---|---|
| a dog barking | 0,591 | **0,752** | 0,605 | 0,644 | 0,666 |
| church bells ringing | 0,556 | 0,590 | **0,690** | 0,637 | 0,649 |
| rain falling | 0,582 | 0,566 | 0,575 | **0,668** | 0,603 |
| an ambulance siren | 0,572 | 0,624 | 0,616 | 0,642 | **0,722** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el grafo INT8 ocupa 295 MB de pesos; el repositorio completo pesa 0,6 GB. En NPU o CPU no se requiere VRAM dedicada; en GPU se necesitaría al menos 1 GB de memoria para el grafo y los buffers intermedios.
- GPU recomendadas: no se han publicado pruebas en GPU. El modelo está orientado a NPU de Intel y CPU; cualquier GPU con soporte ONNX Runtime o OpenVINO podría ejecutarlo, pero no hay datos de latencia.
- Cabe en hardware de consumo: sí. El autor lo ejecutó en un Intel Core 5 320 con NPU Wildcat Lake. También funciona en CPU convencional con ONNX Runtime.
- Opciones de despliegue: OpenVINO (recomendado para NPU, con `CACHE_DIR` para evitar los 9 s de compilación inicial) y ONNX Runtime (CPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 64 ms por clip de 10 s en NPU para el codificador de audio, más 34 ms para el modelo de texto `model_audio_250`. La primera compilación del grafo en NPU tarda unos 9 s; se recomienda usar caché.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arankays/embeddinggemma-2-audio-static-onnx` (este) | Codificador de audio ONNX estático INT8 | 10 s de audio (999 tramas, 250 tokens) | 295 MB (INT8) | Apache 2.0 | Hugging Face |
| `onnx-community/embeddinggemma-2-ONNX` (audio_encoder.onnx) | Codificador de audio ONNX dinámico fp32 | Número variable de tramas log-mel | 1,17 GB (fp32) | Apache 2.0 | Hugging Face |
| `google/embeddinggemma-2` | Modelo multimodal de embeddings (texto + audio) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| `arankays/embeddinggemma-2-text-int8-cw-onnx` | Mitad textual ONNX INT8, complementaria | 256 tokens de texto/audio | no disponible | Apache 2.0 | Hugging Face |

La diferencia principal frente al export de onnx-community es la forma estática (requisito para NPU) y la cuantización INT8, con una pérdida de coseno de características de 0,003 respecto a fp32. Frente al modelo base de Google, esta versión no incluye la mitad textual, que se distribuye por separado.

## Limitaciones y advertencias

- Ventana fija de 10 segundos: los clips más largos deben truncarse y los más cortos rellenarse con ceros; no hay soporte para audio de duración variable en este grafo.
- El autor advierte que la búsqueda de voz hablada no funciona bien: "someone talking" puntúa más alto el clip de lluvia que el de habla. Para buscar palabras habladas recomienda usar transcripciones.
- Hasta 18 de las 250 filas de características pueden desviarse bajo INT8 (peor coseno de 0,51, en campanas de iglesia), tanto en CPU como en NPU; el pooling del modelo textual las diluye, pero es una fuente de ruido.
- La calidad de recuperación depende del modelo de texto complementario; este repositorio solo contiene el codificador de audio.
- No es un modelo generativo: no produce texto, no razona, no soporta tool calling ni agentes.
- Riesgo de alucinación no aplica directamente, pero sí de falsos positivos en recuperación: las similitudes coseno observadas (0,55-0,75) son moderadas y pueden producir rankings ambiguos en consultas poco específicas.
- Idiomas soportados no disponibles: el codificador de audio no está etiquetado por idioma, y el comportamiento multilingüe depende del modelo textual emparejado.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base de Google DeepMind; conviene verificar las condiciones del modelo original.
- La compilación inicial en NPU tarda unos 9 s; sin caché, esto afecta al arranque en frío.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arankays/embeddinggemma-2-audio-static-onnx
- Modelo de texto complementario: https://huggingface.co/arankays/embeddinggemma-2-text-int8-cw-onnx
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Export ONNX original: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Repositorio vinoSearch: https://github.com/karanshukla/vinoSearch
- Script de conversión: https://github.com/karanshukla/vinoSearch/blob/main/bench/static_audio.py
- Script de evaluación: https://github.com/karanshukla/vinoSearch/blob/main/bench/audio_check.py
- Issue sobre formas estáticas en NPU: https://github.com/karanshukla/vinoSearch/issues/190
