# moondream/parakeet-ultra

## Resumen

Parakeet Ultra es un modelo de reconocimiento automático del habla (ASR) publicado por moondream
como versión post-entrenada de nvidia/parakeet-tdt-0.6b-v3. Conserva la misma arquitectura, el mismo
tokenizador y los mismos 0,6 B de parámetros en precisión completa (627.270.663 parámetros según
los pesos safetensors), de modo que no requiere cambios en el pipeline de inferencia más allá de
ejecutarlo con el runtime Photon del propio autor. Su propuesta es mejorar la precisión del
checkpoint original en todos los grupos de evaluación publicados, con una ventaja especialmente
amplia en el conjunto multilingüe FLEURS de 25 idiomas, en audio con ruido de fondo y en audio de
larga duración.

El modelo resuelve el problema clásico de los transductores ASR multilingües: degradación en
condiciones acústicas adversas y en habla espontánea (reuniones, llamadas de resultados,
pódcast). Según la model card, reduce la tasa de error de palabra media del Open ASR Leaderboard
en inglés de 6,26 % a 5,80 %, y de 11,62 % a 9,55 % en FLEURS de 25 idiomas. En TED-LIUM de formato
largo baja de 2,71 % a 1,94 %, y con ruido MUSAN de 6,72 % a 5,82 %. El autor reporta además un
rendimiento superior al del checkpoint original ejecutado en NeMo: 9.743× en tiempo real sobre
LibriSpeech test-clean y 6.688× sobre AMI, medido en una única NVIDIA B200 con 128 peticiones en
vuelo.

Es relevante ahora porque ofrece ASR multilingüe de 25 idiomas con licencia CC-BY-4.0 (uso
comercial permitido) y con marcas de tiempo a nivel de segmento y de palabra, en un tamaño de
0,6 B que cabe holgadamente en GPUs de consumo. Su hermano Parakeet Redux cubre el extremo opuesto
del espectro: la misma arquitectura en versión ternaria de 178 MB para CPU y Apple silicon.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (token-and-duration transducer) tipo Parakeet, heredada de nvidia/parakeet-tdt-0.6b-v3 |
| Parametros totales | 627.270.663 (0,627 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de audio; para formato largo, Photon segmenta cortando en pausas detectadas por la cabeza VAD del modelo en segmentos de 30 s como máximo) |
| Tipos de cuantizacion | No disponible; se distribuye en precisión completa (el autor publica la variante ternaria como modelo aparte, moondream/parakeet-redux, 178 MB) |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |
| Pipeline | automatic-speech-recognition |
| Tamano del repositorio | 1,3 GB |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 (finetune) |
| Runtime de referencia | Photon (moondream), sobre GPU NVIDIA |

## Arquitectura y entrenamiento

La arquitectura es un transductor TDT (token-and-duration transducer) de la familia Parakeet, la
misma del checkpoint nvidia/parakeet-tdt-0.6b-v3. El autor indica explícitamente que Parakeet
Ultra mantiene "la misma arquitectura, el mismo tokenizador y los mismos 0,6 B de parámetros en
precisión completa", por lo que se trata de un post-entrenamiento sobre el modelo base y no de un
rediseño. La cabeza VAD del modelo se usa además en Photon para segmentar audio largo cortando en
pausas detectadas, generando segmentos de 30 segundos como máximo.

No se detalla en la información disponible el número de tokens de audio usados en el
post-entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o
destilación. Tampoco se especifican hiperparámetros de ajuste ni si hubo aumento de datos con
ruido. Lo que sí se documenta es la metodología de evaluación: todos los números de precisión se
obtuvieron ejecutando Parakeet Ultra en Photon sobre GPU NVIDIA y el modelo original en NeMo en
bf16, con los mismos ficheros de audio y el pipeline del Open ASR Leaderboard (normalizadores y
alineamiento con fusión de compuestos, con las referencias de FLEURS preparadas como la columna de
texto del leaderboard). El post-entrenamiento parece orientado a robustez acústica y a habla
espontánea: las mejoras más grandes se dan en AMI (10,86 → 9,77), Earnings-22 (10,75 → 9,76) y en
las condiciones de ruido MUSAN a 0 dB.

## Capacidades

- Transcripción de voz a texto multilingüe en 25 idiomas europeos, con un único modelo.
- Reconocimiento robusto en habla espontánea: reuniones (AMI), llamadas de resultados
  (Earnings-22), pódcast y YouTube (GigaSpeech), intervenciones parlamentarias (VoxPopuli).
- Marcas de tiempo a nivel de segmento (`timestamps="segment"`, una entrada por frase con inicio y
  fin en segundos) y a nivel de palabra (`timestamps="word"`, con inicio y fin de cada palabra).
- Segmentación automática de audio largo mediante la cabeza VAD del propio modelo, integrada en el
  runtime Photon.
- Inferencia de alto rendimiento en lote: el autor reporta 9.743× de factor de tiempo real en
  LibriSpeech test-clean y 6.688× en AMI con 128 peticiones concurrentes en una B200.
- Robustez frente a ruido de fondo: mejoras medidas con MUSAN a 10, 5 y 0 dB de relación
  señal-ruido en inglés, alemán y español.
- No se documenta soporte de tool calling, function calling, modo agente ni modo "thinking"; es un
  modelo puramente ASR.
- No se documenta capacidad de traducción, diarización de hablantes ni detección de idioma
  explícita, más allá de la cobertura multilingüe del decodificador.

## Casos de uso

- Transcripción de reuniones corporativas: el modelo está evaluado específicamente en AMI y en
  Earnings-22, con mejora respecto al checkpoint base (10,86 → 9,77 en AMI). Las marcas de tiempo
  por palabra permiten generar actas navegables y alinear notas con el audio.
- Subtitulado automático de vídeo y pódcast: con marcas de tiempo por segmento y por palabra se
  pueden producir ficheros de subtítulos con sincronía fina; la cobertura de 25 idiomas evita
  mantener un modelo distinto por mercado.
- Indexación y búsqueda de archivos de audio a gran escala: el factor de tiempo real reportado
  (miles de horas de audio por hora de GPU) hace viable transcribir archivos completos de una
  organización para después indexarlos con búsqueda de texto completo.
- Atención al cliente y análisis de llamadas: el modelo rinde bien en habla telefónica y con ruido
  de fondo (condiciones MUSAN), y sus marcas de tiempo permiten analizar tiempos de habla,
  silencios y turnos.
- Cumplimiento y auditoría en sectores regulados (finanzas, sanidad, legal): la licencia CC-BY-4.0
  permite uso comercial y el modelo puede desplegarse on-premise sobre GPU propia, evitando enviar
  audio sensible a APIs externas.
- Accesibilidad: generación de transcripciones y subtítulos en directo o en diferido para
  contenidos en cualquiera de los 25 idiomas soportados, incluyendo idiomas con menos recursos
  como maltés, letón o lituano.
- Documentación clínica o judicial dictada: la evaluación en TED-LIUM de formato largo
  (2,71 → 1,94 % de WER en charlas completas de 10 a 20 minutos) respalda su uso con monólogos
  extensos, donde la segmentación por VAD evita cortes arbitrarios.

## Benchmarks y rendimiento

Tasa de error de palabra en porcentaje, menor es mejor. Parakeet Ultra en Photon sobre GPU NVIDIA;
el modelo original en NeMo en bf16, sobre los mismos ficheros.

Open ASR Leaderboard, siete conjuntos de test en inglés:

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

FLEURS, split de test, 25 idiomas:

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

Habla de negocio (estilo AA-WER):

| Conjunto | parakeet-tdt-0.6b-v3 | parakeet-ultra |
|---|---|---|
| AMI (limpiado) | 9,52 | 8,48 |
| VoxPopuli (limpiado) | 3,02 | 3,10 |
| Earnings-22, fragmentos de 30 s | 5,90 | 5,78 |
| Media | 6,15 | 5,79 |

Ruido de fondo (MUSAN):

| Conjunto | parakeet-tdt-0.6b-v3 | parakeet-ultra |
|---|---|---|
| LibriSpeech test-other, 10 dB | 4,12 | 3,87 |
| LibriSpeech test-other, 5 dB | 5,49 | 5,10 |
| LibriSpeech test-other, 0 dB | 9,06 | 8,31 |
| FLEURS alemán, 10 dB | 5,78 | 4,98 |
| FLEURS alemán, 5 dB | 8,07 | 6,91 |
| FLEURS alemán, 0 dB | 14,45 | 12,08 |
| FLEURS español, 10 dB | 3,99 | 3,13 |
| FLEURS español, 5 dB | 4,12 | 3,38 |
| FLEURS español, 0 dB | 5,44 | 4,64 |
| Media | 6,72 | 5,82 |

Formato largo (TED-LIUM 3):

| Conjunto | parakeet-tdt-0.6b-v3 | parakeet-ultra |
|---|---|---|
| TED-LIUM 3, 11 charlas completas de 10-20 minutos | 2,71 | 1,94 |

Rendimiento de inferencia (factor de tiempo real: segundos de audio por segundo de reloj, mayor es
mejor; una NVIDIA B200, 128 peticiones en vuelo):

| Conjunto | NeMo con parakeet-tdt-0.6b-v3 | Photon con parakeet-ultra |
|---|---|---|
| LibriSpeech test-clean, 2.620 enunciados, 5,4 h | 6.005× | 9.743× |
| AMI test, 12.643 enunciados, 8,7 h | 4.394× | 6.688× |

## Requisitos de hardware

- VRAM estimada para los pesos: en bf16, aproximadamente 1,25 GB para 0,627 B de parámetros; en
  fp32, aproximadamente 2,5 GB. Hay que sumar el consumo del runtime Photon, las activaciones y el
  búfer de lote, por lo que una reserva práctica de 4-8 GB de VRAM por instancia es razonable para
  lotes moderados.
- El repositorio completo ocupa 1,3 GB, coherente con pesos en precisión completa.
- GPU de referencia en las mediciones del autor: una NVIDIA B200 (9.743× de tiempo real en
  LibriSpeech test-clean con 128 peticiones concurrentes). No se publican mediciones en otras GPUs.
- Al ser un modelo de 0,6 B, cabe sin problema en GPUs de consumo (RTX 3060 12 GB, RTX 4070,
  RTX 4090, etc.); el límite práctico será el número de peticiones concurrentes y el coste del
  runtime, no los pesos.
- El autor no documenta una ruta de inferencia en CPU para Parakeet Ultra. Para CPU y Apple silicon
  ofrece la variante ternaria moondream/parakeet-redux (178 MB) como modelo aparte.
- Opciones de despliegue: el uso documentado es Photon (`pip install moondream`, API
  `md.photon("moondream/parakeet-ultra")`). No se documentan integraciones con vLLM, llama.cpp,
  Ollama o TGI para este checkpoint; la alternativa de referencia para el modelo original es NeMo.
- Latencia y throughput: los únicos datos publicados son los factores de tiempo real de la tabla
  anterior, medidos en una B200 con lote de 128. No hay cifras publicadas de latencia por petición
  ni de throughput en GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Densidad | Notas |
|---|---|---|---|---|---|---|
| parakeet-ultra (moondream) | 627.270.663 | 25 | cc-by-4.0 | safetensors | Precisión completa | Post-entrenamiento sobre el base; mejor WER en todos los grupos publicados; requiere Photon |
| parakeet-tdt-0.6b-v3 (nvidia) | 0,6 B (misma arquitectura) | 25 | No disponible en la información proporcionada | No disponible en la información proporcionada | Precisión completa (bf16 en las evaluaciones) | Modelo base; peor WER en la comparativa, pero ejecutable en NeMo |
| parakeet-redux (moondream) | No disponible en la información proporcionada (repo de 178 MB) | No disponible en la información proporcionada | cc-by-4.0 (según la model card de Parakeet Ultra) | No disponible en la información proporcionada | Ternaria | Hermano del mismo autor, orientado a CPU y Apple silicon; no se publican sus cifras de WER en la información disponible |
| Otros modelos ASR comparables (por ejemplo Whisper large-v3) | No disponible | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos comparativos en la información disponible |

No se han publicado en la información disponible resultados comparativos frente a modelos de otras
familias (Whisper, Conformer, Canary, etc.), por lo que no se puede establecer una comparación
cuantitativa más allá de la del modelo base y su variante ternaria.

## Limitaciones y advertencias

- La comparativa de rendimiento no es estrictamente homogénea: Parakeet Ultra se mide en Photon
  sobre GPU NVIDIA y el original en NeMo en bf16. Parte de la mejora de velocidad y precisión podría
  atribuirse al stack de inferencia, no solo al post-entrenamiento.
- Diferencias de calidad notables por idioma: el WER en FLEURS sigue siendo alto en griego
  (32,25 %), esloveno (16,64 %), lituano (16,36 %), letón (15,95 %) y maltés (14,92 %), frente a
  italiano (2,00 %), español (2,72 %) o inglés (3,55 %). No es adecuado como solución uniforme para
  los 25 idiomas sin validación por mercado.
- En un caso concreto la versión ultra empeora respecto al base: VoxPopuli limpiado sube de
  3,02 % a 3,10 % de WER en la evaluación de habla de negocio. La mejora no es universal.
- Riesgo de alucinación y de errores en nombres propios, cifras, siglas y entidades poco frecuentes,
  inherente a cualquier sistema ASR; no hay datos publicados sobre tasas de alucinación en silencios
  o audio no vocal.
- No se documentan sesgos demográficos ni evaluaciones por acento, edad, género o condición de
  habla; los conjuntos usados (LibriSpeech, AMI, GigaSpeech, VoxPopuli, FLEURS) no cubren
  sistemáticamente todas las variedades dialectales.
- Dependencia del runtime Photon: el uso documentado pasa por la librería `moondream` y por GPU
  NVIDIA. No se describe una ruta oficial en CPU, con llama.cpp, ONNX o TGI para este checkpoint.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución al autor y al modelo base; hay
  que revisar además las condiciones del modelo base de NVIDIA.
- El repositorio tenía 0 descargas y 11 likes en el momento de la consulta, con fecha de creación y
  actualización del 22 de septiembre de 2026: es un lanzamiento muy reciente y con poca validación
  independiente por parte de terceros.
- La model card proporcionada está truncada en la sección "Notes", por lo que pueden existir
  advertencias adicionales del autor no recogidas aquí.
- El resto de resultados de la búsqueda web no guarda relación con el modelo (contenido de una
  tienda de recambios de automóvil), por lo que no aporta información verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moondream/parakeet-ultra
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo hermano ternario: https://huggingface.co/moondream/parakeet-redux
- Entrada de blog de lanzamiento: https://moondream.ai/blog/introducing-parakeet-redux-and-ultra
- Runtime Photon: https://moondream.ai/photon
- Paper, repositorio de código y demo: no disponible en la información proporcionada.
