# agentory/canary-1b-v2-GGUF

## Resumen

Canary 1B v2 es un modelo de reconocimiento automático del habla (ASR) y traducción de voz multilingüe desarrollado por NVIDIA, con aproximadamente 978 millones de parámetros. Se distribuye aquí en formato GGUF, una conversión realizada por el usuario `agentory` para su uso con el runtime `canary-main` del fork CrispASR. El modelo cubre 25 idiomas europeos y permite tanto transcripción (cuando el idioma de origen y destino coinciden) como traducción de voz (cuando difieren), usando tokens explícitos de idioma `source_lang` y `target_lang` que eliminan la ambigüedad de la detección automática.

La arquitectura combina un codificador FastConformer de 32 capas con un decodificador Transformer de 8 capas, un diseño encoder-decoder clásico optimizado para audio. Frente a alternativas como Whisper-large-v3, ofrece un tamaño notablemente menor (1B frente a 1.6B) con un WER medio reportado del 7,15% en el leaderboard Open ASR de HuggingFace para inglés.

Su relevancia actual radica en la combinación de licencia permisiva CC-BY-4.0, soporte de cuantización GGUF (desde F16 hasta Q4_K) y la posibilidad de ejecutar inferencia local en hardware modesto, lo que lo hace atractivo para despliegues de transcripción y traducción de voz en producción sin dependencia de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: FastConformer (encoder) + Transformer pre-LN (decoder) |
| Parámetros totales | ~978 M (encoder 811M + decoder 152M + head 17M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (contexto máximo del decoder) |
| Tipos de cuantización | F16, Q8_0, Q5_0, Q4_K |
| Idiomas soportados | 25 europeos: bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (ggml); modelo base original en formato NeMo `.nemo` |

## Arquitectura y entrenamiento

El codificador es un FastConformer de 32 capas con dimensión 1024, 8 cabezas de atención (head_dim 128), FFN de 4096 y kernel convolucional de 9, con sesgos en todas las capas lineales y convolucionales. El subsampling usa una pila Conv2d con `dw_striding` que reduce la secuencia temporal 8× (de 100 a 12,5 fps). El decodificador es un Transformer pre-LN de 8 capas con self-attention, cross-attention y FFN, misma dimensión 1024 y contexto máximo de 1024 tokens. El vocabulario es de 16384 tokens SentencePiece mediante el tokenizador NeMo CanaryBPETokenizer.

El audio se procesa a 16 kHz mono con 128 bins mel, `n_fft=512`, `hop=160` y `win=400`. En la conversión a GGUF se incorporan el filterbank mel y la ventana Hann directamente en el fichero (`preprocessor.fb` y `preprocessor.window`), se pliega el BatchNorm del módulo convolucional en los pesos de la convolución depthwise en tiempo de carga, y se precalculan las K/V de cross-attention una vez por segmento de audio para reutilizarlas en cada paso del decodificador. No se dispone de información sobre la composición exacta del dataset de entrenamiento ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) en 25 idiomas europeos con token de idioma explícito.
- Traducción de voz en ambas direcciones: de cualquiera de los 24 idiomas no ingleses al inglés, y del inglés a cualquiera de los 24 idiomas no ingleses.
- Control explícito de idioma mediante `-sl` (source_lang) y `-tl` (target_lang), que evita fallos de detección automática en audio con acento o ruido.
- Transcripción de audio de 16 kHz mono con salida de texto plano.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión ni de audio más allá del ASR y la traducción de voz.
- No se documenta modo de pensamiento (thinking mode) ni decodificación especulativa.

## Casos de uso

- Transcripción de reuniones y entrevistas multilingües: con 25 idiomas y tokens de idioma explícitos, se puede fijar `-sl` y `-tl` al mismo valor para obtener transcripciones fiables sin depender de detección automática, que según la model card falla en audio con acento.
- Subtitulado y traducción de contenido audiovisual: usando `-sl de -tl en` (o cualquier par origen-destino soportado) se genera directamente la traducción del audio, útil para localizar vídeos o pódcasts a otros idiomas europeos.
- Atención al cliente por voz en Europa: al cubrir 25 idiomas, permite transcribir llamadas entrantes en el idioma del cliente y, si se requiere, traducirlas al inglés para su análisis por equipos centralizados.
- Archivo y búsqueda de documentos sonoros: transcripción por lotes de grabaciones históricas o periodísticas con cuantización Q4_K (673 MB) para procesar grandes volúmenes en hardware modesto.
- Investigación lingüística y corpus: generación de transcripciones y traducciones alineadas para estudios comparativos entre lenguas europeas, con control explícito del par de idiomas.
- Despliegue en el borde (edge): el tamaño reducido del GGUF Q4_K permite ejecutar ASR y traducción en estaciones de trabajo sin GPU dedicada o en entornos con recursos limitados, usando el runtime `canary-main`.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Open ASR Leaderboard (inglés), WER medio | 7,15% | Reportado en la model card; comparable a Whisper-large-v3 con 1/1,6× el tamaño |

No se han publicado en la información disponible resultados de benchmarks para otros idiomas, tareas de traducción de voz ni comparativas numéricas detalladas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero F16 ocupa 1,97 GB; Q8_0 1,1 GB; Q5_0 777 MB; Q4_K 673 MB. La VRAM necesaria es del orden del tamaño del fichero más overhead de runtime.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 2-3 GB de memoria libre debería poder cargar las cuantizaciones menores.
- Compatibilidad con GPU de consumo: sí, las cuantizaciones Q4_K y Q5_0 caben holgadamente en GPUs de consumo con 4 GB o más; el F16 requiere alrededor de 2 GB solo para pesos.
- Opciones de despliegue: runtime `canary-main` del fork CrispASR (rama `parakeet`), compilado con CMake. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Canary 1B v2 (esta ficha) | ~978 M | 25 europeos | 1024 tokens (decoder) | CC-BY-4.0 | GGUF, NeMo |
| Whisper-large-v3 | ~1,55 B | ~99 | 448 tokens | MIT | safetensors, GGUF, etc. |
| Parakeet TDT 0.6B v3 | ~600 M | no disponible en la información | no disponible | no disponible en la información | GGUF |

La model card sitúa a Canary 1B v2 con un WER del 7,15% en inglés, competitivo con Whisper-large-v3 a 1/1,6× el tamaño. Frente a Parakeet TDT 0.6B v3, comparte familia de encoder FastConformer pero Canary añade decodificador de traducción y tokens de idioma explícitos; Parakeet carece de flag `-l` y depende de detección automática, lo que según la model card provocó errores (identificó ruso en audio de Angela Merkel y cambió a inglés en la grabación de Sarma).

## Limitaciones y advertencias

- La detección automática de idioma no existe como tal: es obligatorio especificar `source_lang` y `target_lang`, lo que exige conocer el idioma del audio de antemano.
- La traducción de voz solo cubre pares con el inglés como uno de los extremos (X→EN y EN→X); no se documenta traducción directa entre dos idiomas no ingleses.
- Solo se soportan 25 idiomas europeos; no hay cobertura de otras lenguas.
- No se dispone de información sobre sesgos del modelo, riesgo de alucinación en pasajes ambiguos o ruidosos, ni evaluación en dominios específicos.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene verificar los términos del modelo base original de NVIDIA.
- El despliegue depende de un runtime específico (`canary-main` de CrispASR, rama `parakeet`), lo que limita la portabilidad frente a ecosistemas más extendidos.
- El contexto del decodificador es de 1024 tokens, adecuado para segmentos de audio pero no para transcripciones de duración arbitraria sin segmentación previa.
- La información sobre rendimiento en idiomas distintos del inglés y en tareas de traducción es inexistente en la documentación disponible.

## Enlaces

- [HuggingFace: agentory/canary-1b-v2-GGUF](https://huggingface.co/agentory/canary-1b-v2-GGUF)
- [Modelo base: nvidia/canary-1b-v2](https://huggingface.co/nvidia/canary-1b-v2)
- [Runtime CrispASR (rama parakeet)](https://github.com/CrispStrobe/CrispASR/tree/parakeet)
- [Script de conversión a GGUF](https://github.com/CrispStrobe/CrispASR/blob/parakeet/models/convert-canary-to-gguf.py)
- [Runtime C++ canary.cpp](https://github.com/CrispStrobe/CrispASR/blob/parakeet/src/canary.cpp)
- [Notas de prueba en alemán](https://github.com/CrispStrobe/CrispASR/blob/parakeet/test_german.md)
- [Parakeet TDT 0.6B v3 GGUF (modelo relacionado)](https://huggingface.co/cstr/parakeet-tdt-0.6b-v3-GGUF)
- [Paper de referencia (arXiv:2509.14128)](https://arxiv.org/abs/2509.14128)
