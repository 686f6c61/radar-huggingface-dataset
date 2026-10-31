# erayyapagci/balbal-v2-manas

## Resumen

balbal-v2-manas es un modelo de reconocimiento automático de habla (ASR) bilingüe para turco e inglés, desarrollado por erayyapagci. Se trata de un fine-tuning de `nvidia/stt_en_fastconformer_ctc_large`, al que se añaden dos componentes propios: un "looped refiner" (un refinador Transformer de 2 capas que itera 3 veces sobre la distribución CTC) y una memoria acústica product-key de gran capacidad. La decodificación combina CTC con un modelo de lenguaje KenLM de 6-gramas sobre piezas SentencePiece.

El problema que resuelve es la transcripción precisa de habla turca en condiciones difíciles, especialmente llamadas telefónicas, un dominio donde los modelos ASR abiertos suelen rendir mal en turco. En Mu-Bench (llamadas turcas) declara un 8,20 % de WER, y mantiene un rendimiento competitivo en inglés (8,67 % de WER medio en los test sets del Open ASR Leaderboard en inglés). Su rasgo más distintivo es la eficiencia: está diseñado para ejecutarse en CPU, con una velocidad declarada de 123 veces más rápido que el tiempo real con 8 hilos.

El modelo tiene 313,3 millones de parámetros (192 millones corresponden a la tabla de memoria acústica, de la que solo se leen unas pocas filas por fotograma), se distribuye en formato ONNX y fue entrenado con unas 7.000 horas de audio. Existe una variante hermana más pequeña y rápida, balbal-v2 (45M de parámetros, 236x tiempo real).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-CTC + looped refiner (Transformer 2 capas, 3 pasadas) + memoria acústica product-key + KenLM 6-gramas |
| Parametros totales | 313,3M (192,0M corresponden a la tabla de memoria) |
| Parametros activos | no disponible (la memoria product-key solo lee unas pocas filas por fotograma; el resto no es MoE) |
| Longitud de contexto | Audio segmentado en fragmentos de 30 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | balbal-community-license-1.0 (other) |
| Formato de pesos | ONNX (safetensors no disponible) |

## Arquitectura y entrenamiento

El modelo acústico es un FastConformer-CTC de 18 capas con d_model 512, entradas de 80 filtros mel y subsampling 4x (fotogramas de 40 ms). Sobre la salida del encoder se coloca un refinador en bucle: un Transformer de 2 capas y anchura 256 que se aplica en 3 pasadas, donde cada pasada recibe como entrada la distribución CTC de la pasada anterior. Esto permite refinar iterativamente las hipótesis de transcripción sin aumentar drásticamente el coste de inferencia.

La innovación más notable es la memoria acústica product-key: una tabla de 1.000x1.000 subclaves con 8 cabezas, selección top-32, dimensión de valor 192 y contexto de 3 fotogramas. Con 192 millones de parámetros, constituye la mayor parte del modelo, pero al ser una memoria direccionable por producto de claves, por cada fotograma solo se leen unas pocas filas, lo que mantiene el coste computacional bajo y explica que el modelo sea rápido incluso en CPU. La decodificación final usa un KenLM de 6-gramas sobre un vocabulario SentencePiece de 2.048 piezas más el token CTC blank. Fue entrenado con aproximadamente 7.000 horas de audio; no se ha publicado información sobre la composición exacta del dataset ni sobre el uso de técnicas de alineamiento preferencial.

## Capacidades

- Transcripción de habla en turco e inglés, con salida en texto con mayúsculas y puntuación.
- Marcas de tiempo por palabra (per-word timestamps).
- Normalización inversa del texto (ITN): los números se emiten como dígitos; se puede desactivar con `--no-itn`.
- Procesado de audio largo: el audio de más de 30 s se divide automáticamente en fragmentos de 30 s.
- Inferencia eficiente en CPU (123x tiempo real con 8 hilos según el autor).
- Distribución en formato ONNX, lo que facilita el despliegue multiplataforma, incluyendo móvil (existe una app Android anunciada).
- No soporta traducción, diarización de hablantes ni clasificación de idioma automática declaradas en la documentación.

## Casos de uso

- Transcripción de llamadas telefónicas en turco: el modelo declara 8,20 % WER y 14,89 % sigWER en Mu-Bench tr-TR, un benchmark de llamadas telefónicas, lo que lo hace adecuado para centros de contacto y análisis de conversaciones en turco.
- Subtitulado y transcripción de contenidos en turco: el 4,06 % WER en FLEURS turco y las marcas de tiempo por palabra permiten generar subtítulos sincronizados para vídeo.
- Transcripción de reuniones y conferencias en inglés: con 13,31 % WER en AMI (meetings) y 15,61 % en Earnings-22, puede usarse para actas automáticas de reuniones, aunque con margen de mejora en audio difícil.
- Procesado por lotes de grandes volúmenes de audio en CPU: su velocidad de 123x tiempo real sin necesidad de GPU permite transcribir archivos masivos en servidores convencionales o incluso estaciones de trabajo, reduciendo costes de infraestructura.
- Aplicaciones móviles offline: el formato ONNX y la eficiencia en CPU permiten integrar transcripción en apps Android sin depender de la nube.
- Transcripción de charlas y conferencias públicas en inglés: 5,2 % WER en TED-LIUM 3 y 7,82 % en VoxPopuli lo hacen apto para transcribir discursos y contenido de divulgación.
- Sistemas de voz como interfaz (dictado): la salida con puntuación, mayúsculas e ITN de números produce texto listo para usar sin postprocesado adicional.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados por terceros):

| Dataset | Idioma | Métrica | Valor |
|---|---|---|---|
| Mu-Bench (tr-TR phone calls) | tr | WER | 8,20 % |
| Mu-Bench (tr-TR phone calls) | tr | sigWER | 14,89 % |
| FLEURS (Turkish) | tr | WER | 4,06 % |
| FLEURS (Turkish) | tr | CER | 1,21 % |
| LibriSpeech (clean) | en | WER | 2,97 % |
| LibriSpeech (other) | en | WER | 6,45 % |
| AMI (Meetings test, ihm) | en | WER | 13,31 % |
| Earnings-22 | en | WER | 15,61 % |
| VoxPopuli (en) | en | WER | 7,82 % |
| GigaSpeech | en | WER | 12,30 % |
| SPGI Speech | en | WER | 5,73 % |
| TED-LIUM 3 | en | WER | 5,20 % |

Según el autor, el WER medio en los test sets del Open ASR Leaderboard en inglés es de 8,67 %. La velocidad en CPU declarada es de 123x tiempo real (segundos de audio por segundo de procesado, batch 1, 8 hilos de un AMD Ryzen AI Max+ 395). FLEURS se puntúa con el normalizador propio (`balbal-normalizer`) y Mu-Bench con su harness oficial y GPT-4.1 como juez, lo que puede dificultar la comparación directa con otros modelos.

## Requisitos de hardware

- El modelo está diseñado para inferencia en CPU: el autor declara 123x tiempo real con 8 hilos de un AMD Ryzen AI Max+ 395, por lo que no requiere GPU.
- VRAM: no disponible (al ser ONNX para CPU, el requisito relevante es RAM; con 313M de parámetros en ONNX, unos 1-2 GB de RAM deberían ser suficientes, aunque es una estimación).
- GPU: no necesaria; si se desea acelerar, cualquier GPU moderna compatible con ONNX Runtime debería funcionar, pero no hay datos publicados.
- Consumer hardware: sí, cabe en equipos de escritorio y portátiles convencionales; el autor también anuncia una app Android.
- Despliegue: ONNX Runtime; el repositorio de código (Apache 2.0) incluye la inferencia y el ITN. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicable a ASR).
- Latencia y throughput: 123x tiempo real en CPU con 8 hilos según el autor; la variante menor balbal-v2 alcanza 236x.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Mu-Bench tr WER | FLEURS tr WER | CPU | Licencia |
|---|---|---|---|---|---|---|
| balbal-v2-manas | 313M | tr, en | 8,20 % | 4,06 % | 123x tiempo real | balbal-community-license-1.0 |
| balbal-v2 (hermano menor) | 45M | tr, en | no disponible | no disponible | 236x tiempo real | no disponible |
| nvidia/stt_en_fastconformer_ctc_large (base) | no disponible | en | no disponible | no disponible | no disponible | CC-BY-4.0 |

No se han incluido cifras de otros modelos ASR abiertos (Whisper, NVIDIA Canary/Parakeet, Wav2Vec2) porque la model card solo publica la comparativa parcialmente y el resto de datos disponibles se han truncado; las comparaciones del autor indican que los otros modelos abiertos se evalúan con su inferencia por defecto mientras balbal usa decodificación KenLM, lo que introduce diferencias metodológicas.

## Limitaciones y advertencias

- Licencia balbal-community-license-1.0: es una licencia de tipo "other", no una licencia estándar permisiva; hay que revisar el texto de la LICENSE antes de cualquier uso comercial.
- Los benchmarks son declarados por el autor y no verificados: FLEURS se puntúa con un normalizador propio y Mu-Bench usa GPT-4.1 como juez, lo que puede inflar o distorsionar la comparación con modelos evaluados con normalizadores estándar.
- El audio se corta en fragmentos de 30 s, lo que puede provocar errores en límites de corte en habla continua larga.
- Solo soporta turco e inglés; no hay detección automática de idioma declarada, por lo que hay que seleccionar el idioma explícitamente.
- No hay información publicada sobre sesgos del modelo, alucinaciones típicas de ASR (alucinación de texto en silencios o ruido) ni comportamiento con acentos no cubiertos por las 7.000 horas de entrenamiento.
- El rendimiento en llamadas telefónicas turcas (sigWER 14,89 %) indica que casi una de cada siete locuciones contiene al menos un error que cambia el significado: en producción crítica (por ejemplo, cumplimiento normativo o análisis de sentimiento) conviene revisión humana.
- 0 descargas registradas en HuggingFace en el momento de redactar la ficha: es un modelo muy reciente y con poco uso comunitario, sin auditoría externa.
- No hay información sobre cuantización, lo que puede limitar el despliegue en dispositivos con recursos muy ajustados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erayyapagci/balbal-v2-manas
- Modelo base: https://huggingface.co/nvidia/stt_en_fastconformer_ctc_large
- Variante menor (balbal-v2): https://huggingface.co/erayyapagci/balbal-v2
- Página oficial del proyecto (benchmarks, demo en navegador y app Android): https://erayy.com/balbal/
- Página del proyecto en turco: https://erayy.com/tr/balbal/
- Repositorio de código (Apache 2.0): https://github.com/erayyap/balbal
