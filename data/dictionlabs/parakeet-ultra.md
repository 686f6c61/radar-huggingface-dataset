# DictionLabs/parakeet-ultra

## Resumen

Parakeet Ultra es un modelo de reconocimiento automático del habla (ASR) desarrollado por Moondream como un post-entrenamiento (*fine-tune*) del checkpoint `parakeet-tdt-0.6b-v3` de NVIDIA. Mantiene la misma arquitectura Parakeet TDT (*Token-and-Duration Transducer*), el mismo tokenizador y los mismos 627 millones de parámetros en precisión completa que el modelo original, pero mejora la precisión en todos los grupos de benchmarks publicados: 5,80 % de WER medio en el Open ASR Leaderboard (frente a 6,26 % del original), 9,55 % en el conjunto FLEURS de 25 idiomas (frente a 11,62 %) y 1,94 % en audio largo de TED-LIUM (frente a 2,71 %).

El modelo resuelve transcripción de voz multilingüe con marcas de tiempo a nivel de segmento y de palabra, y según el autor es además más rápido que el original ejecutado en NeMo. Es relevante porque combina un tamaño compacto (1,3 GB en safetensors, 627 M de parámetros) con cobertura de 25 idiomas europeos y un rendimiento en ruido de fondo y audio largo que supera a su base, lo que lo hace apto para despliegues en producción con GPU única.

El repositorio evaluado aquí es un *mirror* byte a byte publicado por DictionLabs bajo su propio namespace, con el objetivo de centralizar la evaluación y el servicio en un único punto. Los ficheros del modelo son idénticos al original; solo cambia el README. La licencia CC-BY-4.0 se mantiene y la atribución corresponde a NVIDIA (entrenamiento original) y Moondream (post-entrenamiento).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), formato `ParakeetForTDT` en transformers |
| Parámetros totales | 627.270.663 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la información proporcionada) |
| Tipos de cuantización | no disponible en la información proporcionada (existe una variante ternaria separada, Parakeet Redux, de 178 MB, no una cuantización de este checkpoint) |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

Parakeet Ultra emplea la arquitectura Parakeet TDT de NVIDIA, un transductor (*transducer*) que predice conjuntamente tokens y duraciones, lo que permite emitir texto alineado temporalmente sin un módulo CTC separado ni un decodificador autoregresivo externo. Conserva el tokenizador y la arquitectura del checkpoint `parakeet-tdt-0.6b-v3`; el post-entrenamiento de Moondream no altera el número de parámetros ni la estructura de la red, sino los pesos.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset de post-entrenamiento ni si se emplearon técnicas de RLHF o DPO. El autor sí documenta que el modelo se ha evaluado con el pipeline oficial del Open ASR Leaderboard (normalizadores y alineamiento con fusión de compuestos) sobre ficheros idénticos para ambos modelos, y que las referencias de FLEURS se prepararon como la columna de texto del leaderboard. La ejecución de referencia se realiza con Photon sobre GPU NVIDIA; el modelo original se ejecuta en NeMo 3.0 en bf16 para las comparaciones.

## Capacidades

- Transcripción de voz a texto (*speech-to-text*) en 25 idiomas europeos.
- Marcas de tiempo a nivel de segmento (inicio y fin por frase) y a nivel de palabra (inicio y fin por palabra).
- Manejo de audio largo: evaluado en TED-LIUM con 1,94 % de WER, lo que indica robustez en conferencias y charlas extensas.
- Robustez frente a ruido de fondo: evaluado con las condiciones MUSAN a 10 dB y 5 dB de SNR.
- Reconocimiento en dominios de habla empresarial y financiera: AMI (reuniones), Earnings-22 (llamadas de resultados), SPGISpeech (llamadas financieras), VoxPopuli (parlamento).
- Reconocimiento en dominios de medios: GigaSpeech (podcasts y YouTube) y LibriSpeech (audiolibros).
- No se menciona soporte de *tool calling* ni de razonamiento multi-paso; es un modelo especializado exclusivamente en ASR.
- No se menciona capacidad de traducción, diarización de hablantes ni detección de idioma automática.

## Casos de uso

- Transcripción de reuniones y actas: el modelo rinde con 9,77 % de WER en AMI, un conjunto de reuniones multiparticipe, y devuelve marcas de tiempo por segmento que permiten construir actas navegables y sincronizadas con el audio.
- Subtitulado de vídeo y podcasts: con marcas de tiempo a nivel de palabra y 7,71 % de WER en GigaSpeech, es adecuado para generar subtítulos alineados palabra a palabra en contenido de YouTube y podcasts.
- Llamadas de atención al cliente: el soporte de 25 idiomas europeos y su rendimiento en audio telefónico (Earnings-22 con 5,78 % de WER en trozos de 30 segundos) lo hacen viable para transcribir y analizar conversaciones de centros de contacto.
- Análisis de llamadas financieras y de resultados: SPGISpeech (3,34 % de WER) y Earnings-22 son dominios directamente cubiertos, útiles para extraer información estructurada de *earnings calls*.
- Transcripción de sesiones parlamentarias y administrativas: VoxPopuli con 5,65 % de WER, con marcas de tiempo que facilitan la indexación y búsqueda de intervenciones.
- Documentación de conferencias y charlas largas: TED-LIUM con 1,94 % de WER y buen comportamiento en audio largo permiten transcribir charlas de una hora o más sin segmentación manual.
- Procesamiento por lotes a gran escala: con un factor de tiempo real de 9.743× en LibriSpeech test-clean sobre una NVIDIA B200 con 128 peticiones en vuelo, es adecuado para reprocesar archivos de audio históricos en poco tiempo.
- Transcripción en entornos ruidosos: las condiciones MUSAN a 5 dB y 10 dB de SNR (5,10 % y 3,87 % de WER en LibriSpeech test-other) lo hacen apto para grabaciones de campo o salas no tratadas acústicamente.

## Benchmarks y rendimiento

WER en porcentaje, menor es mejor. Ambos modelos evaluados sobre los mismos ficheros con el pipeline del Open ASR Leaderboard de septiembre de 2026. Parakeet Ultra en Photon sobre GPU NVIDIA; el original en NeMo en bf16.

| Benchmark | parakeet-tdt-0.6b-v3 | parakeet-ultra |
|---|---|---|
| Open ASR Leaderboard, 7 conjuntos en inglés (media) | 6,26 | 5,80 |
| FLEURS, 25 idiomas (media) | 11,62 | 9,55 |
| Business speech, estilo AA-WER (media) | 6,15 | 5,79 |
| Ruido de fondo, 9 condiciones MUSAN (media) | 6,72 | 5,82 |
| TED-LIUM, audio largo | 2,71 | 1,94 |

Detalle del Open ASR Leaderboard:

| Conjunto | parakeet-tdt-0.6b-v3 | parakeet-ultra |
|---|---|---|
| LibriSpeech test-clean | 1,52 | 1,41 |
| LibriSpeech test-other | 3,13 | 2,98 |
| AMI | 10,86 | 9,77 |
| Earnings-22 | 10,75 | 9,76 |
| GigaSpeech | 8,05 | 7,71 |
| SPGISpeech | 3,63 | 3,34 |
| VoxPopuli | 5,88 | 5,65 |
| Media | 6,26 | 5,80 |

Detalle de FLEURS (WER %):

| Idioma | parakeet-tdt-0.6b-v3 | parakeet-ultra |
|---|---|---|
| Búlgaro | 11,90 | 10,09 |
| Croata | 10,93 | 9,65 |
| Checo | 10,85 | 9,97 |
| Danés | 16,78 | 14,31 |
| Neerlandés | 6,18 | 5,46 |
| Inglés | 4,25 | 3,55 |
| Estonio | 13,23 | 9,69 |
| Finés | 11,05 | 9,19 |
| Francés | 4,81 | 4,32 |
| Alemán | 4,13 | 3,61 |
| Griego | 35,71 | 32,25 |
| Húngaro | 13,65 | 10,76 |
| Italiano | 2,61 | 2,00 |
| Letón | 21,38 | 15,95 |
| Lituano | 21,09 | 16,36 |
| Maltés | 19,13 | 14,92 |
| Polaco | 6,70 | 5,54 |
| Portugués | 4,65 | 3,96 |
| Rumano | 11,54 | 9,18 |
| Ruso | 5,91 | 5,21 |
| Eslovaco | 9,46 | 7,03 |
| Esloveno | 21,76 | 16,64 |
| Español | 3,12 | 2,72 |
| Sueco | 13,75 | 11,57 |
| Ucraniano | 5,94 | 4,75 |
| Media | 11,62 | 9,55 |

Business speech (estilo AA-WER):

| Conjunto | parakeet-tdt-0.6b-v3 | parakeet-ultra |
|---|---|---|
| AMI (limpiado) | 9,52 | 8,48 |
| VoxPopuli (limpiado) | 3,02 | 3,10 |
| Earnings-22, trozos de 30 s | 5,90 | 5,78 |
| Media | 6,15 | 5,79 |

Ruido de fondo (MUSAN):

| Conjunto | parakeet-tdt-0.6b-v3 | parakeet-ultra |
|---|---|---|
| LibriSpeech test-other, 10 dB | 4,12 | 3,87 |
| LibriSpeech test-other, 5 dB | 5,49 | 5,10 |

Rendimiento (factor de tiempo real, mayor es mejor; una NVIDIA B200, 128 peticiones en vuelo):

| | NeMo, parakeet-tdt-0.6b-v3 | Photon, parakeet-ultra |
|---|---|---|
| LibriSpeech test-clean (2.620 enunciados, 5,4 h) | 6.005× | 9.743× |
| AMI test (12.643 enunciados, 8,7 h) | 4.394× | 6.688× |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 627 M de parámetros en safetensors (1,3 GB de repo), la inferencia en bf16 requiere aproximadamente 1,3 GB de pesos más memoria de activaciones y buffers de audio; las cifras exactas no se publican.
- GPU recomendadas: las mediciones oficiales de rendimiento se realizaron en una NVIDIA B200. No se documentan otras GPU en la información disponible.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo; no obstante, el tamaño de pesos (1,3 GB) sugiere que podría caber en GPU con 4 GB o más de VRAM, aunque esta afirmación no está respaldada por datos publicados. Para CPU y Apple Silicon el autor remite a la variante separada Parakeet Redux (ternaria, 178 MB).
- Opciones de despliegue: Photon, el runtime de Moondream (`pip install moondream`), es el método documentado. También se puede cargar con transformers en formato `ParakeetForTDT`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: factor de tiempo real de 9.743× en LibriSpeech test-clean y 6.688× en AMI test sobre B200 con 128 peticiones en vuelo, medido con Photon.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | WER medio Open ASR Leaderboard | Disponibilidad |
|---|---|---|---|---|---|
| Parakeet Ultra (este) | 627 M | 25 | CC-BY-4.0 | 5,80 | Hugging Face (Moondream y mirror DictionLabs) |
| parakeet-tdt-0.6b-v3 | 627 M | 25 | CC-BY-4.0 | 6,26 | Hugging Face (NVIDIA) |
| Parakeet Redux | no disponible (variante ternaria, 178 MB) | no disponible | no disponible en la información proporcionada | no disponible | Hugging Face (Moondream) |

No se dispone en la información proporcionada de datos de otros modelos ASR comparables de otros autores (por ejemplo Whisper o similares) para ampliar la comparativa.

## Limitaciones y advertencias

- El modelo es un post-entrenamiento de un checkpoint de NVIDIA; la atribución de la licencia CC-BY-4.0 corresponde a NVIDIA y Moondream, y debe mantenerse en cualquier redistribución.
- El rendimiento es desigual entre idiomas: el WER en FLEURS varía desde 2,00 % en italiano hasta 32,25 % en griego y 16,64 % en esloveno. Los idiomas eslavos meridionales y el griego y el maltés presentan una precisión notablemente inferior.
- En VoxPopuli limpiado el modelo empeora ligeramente respecto al original (3,10 % frente a 3,02 %), por lo que la mejora no es uniforme en todos los conjuntos.
- No se documentan sesgos demográficos, acústicos o dialectales; al ser un modelo entrenado sobre corpus públicos, es previsible que herede los sesgos de esos datasets, aunque no hay datos publicados al respecto.
- Riesgo de alucinación: no se documenta explícitamente, pero es un riesgo inherente a los modelos ASR en segmentos con ruido extremo, silencios largos o habla solapada.
- No se especifican la ventana máxima de audio ni el comportamiento con segmentos superiores a los evaluados; el audio largo se ha validado con TED-LIUM, pero no se publica el límite operativo.
- No se mencionan capacidades de diarización, detección de idioma ni puntuación automática; si se necesitan, deben añadirse como etapas posteriores.
- El repositorio evaluado es un mirror de DictionLabs sin descargas ni likes; para producción conviene referenciar el repositorio original de Moondream para asegurar actualizaciones y trazabilidad.

## Enlaces

- Modelo en Hugging Face (mirror DictionLabs): https://huggingface.co/DictionLabs/parakeet-ultra
- Modelo original en Hugging Face (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Checkpoint base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Variante ternaria Parakeet Redux: https://huggingface.co/moondream/parakeet-redux
- Blog de presentación de Parakeet Redux y Ultra: https://moondream.ai/blog/introducing-parakeet-redux-and-ultra
- Runtime Photon: https://moondream.ai/photon
