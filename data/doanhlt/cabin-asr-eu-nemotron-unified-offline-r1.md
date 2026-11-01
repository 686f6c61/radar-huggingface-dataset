# doanhlt/cabin-asr-eu-nemotron-unified-offline-r1

## Resumen

`cabin-asr-eu-nemotron-unified-offline-r1` es un modelo de reconocimiento automático del habla (ASR) offline para francés, alemán, español e italiano, desarrollado por el usuario doanhlt como módulo de voz de la aplicación Cabin Offline. Se construye mediante fine-tuning del modelo base `nvidia/nemotron-labs-unified-asr-0.6b` con la receta "EU r1" (etiquetas R13x sobre habla de YouTube más repetición de FLEURS) y se exporta a sherpa-onnx en formato `nemo_transducer` con decodificación greedy. El resultado se distribuye como un paquete ONNX int8 pensado para inferencia en dispositivo.

La arquitectura subyacente es un transducer FastConformer-RNNT (transformer con encoder FastConformer y decoder/joint RNNT) de aproximadamente 0,6 mil millones de parámetros. La innovación de empaquetado consiste en plegar el prompt de idioma one-hot del modelo base (que se concatenaba a cada frame del encoder) dentro del joiner: se comparte un único encoder y decoder, y cada idioma dispone de un joiner propio de 7,9 MB que incorpora el kernel del prompt. El encoder int8 ocupa 655 MB.

El modelo se publica como candidato (2026-10-31) que supera la puerta pre-registrada frente a la versión anterior EU r1 en el conjunto agregado sin sesgo para fr/de/es/it, y sustituye a EU r1 como módulo de esos cuatro idiomas en la aplicación. El inglés permanece en el modelo Parakeet v2 ya distribuido. La licencia es OpenMDW-1.1, heredada del modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + RNNT (transducer), encoder y decoder compartidos con joiner por idioma |
| Parametros totales | 0,6 mil millones (modelo base `nemotron-labs-unified-asr-0.6b`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (receta int8 de EU r1); se publica también `nemo/best.pt` en fp32 |
| Idiomas soportados | fr, de, es, it (con joiner propio); en (joiner incluido, no adoptado en la app); joiners auto/pt/nl/pl/ru no validados |
| Licencia | OpenMDW-1.1 (heredada de NVIDIA; `LICENSE.md` y `NOTICE.md` deben acompañar a los ficheros) |
| Formato de pesos | ONNX int8 para sherpa-onnx (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner-<lang>.int8.onnx`) y `best.pt` fp32 para NeMo |

## Arquitectura y entrenamiento

El modelo es un transducer RNNT sobre encoder FastConformer. El modelo base de NVIDIA concatena un prompt one-hot de idioma a cada frame del encoder antes del joint RNNT. Como sherpa-onnx no admite entrada de prompt, el autor pliega ese prompt dentro del joiner: `joiner-<lang>.int8.onnx` equivale al kernel del prompt de ese idioma más el joint, con la misma interfaz de entrada/salida que un joint RNNT de NeMo. El encoder (655 MB) y el decoder se comparten entre idiomas; cada joiner pesa 7,9 MB. Una aplicación carga encoder, decoder, tokens y el joiner del idioma enrutado (un reconocedor por idioma).

El entrenamiento parte de `nvidia/nemotron-labs-unified-asr-0.6b` y aplica la receta EU r1: etiquetas R13x sobre habla de YouTube (dataset `espnet/yodas2`) más repetición de `google/fleurs`, con el mismo manifiesto de entrenamiento que `doanhlt/cabin-asr-eu-parakeet-tdt-offline-r1`. La variante "U-distill" incorpora destilación de conocimiento. La exportación sigue la receta int8 de EU r1 y usa decodificación greedy en sherpa-onnx. El repositorio incluye el state_dict fp32 (`nemo/best.pt`) para cargar en el `.nemo` base con `strict=False`, así como listas de exclusión de cuantización y scripts de exportación.

## Capacidades

- Reconocimiento automático del habla offline (sin conexión) en francés, alemán, español e italiano con un único encoder compartido.
- Transcripción con decodificación greedy mediante transducer RNNT en sherpa-onnx.
- Selección de idioma mediante el joiner cargado; un reconocedor por idioma y sesión.
- Joiner de inglés incluido (supera la comparación EN_COVER2 frente a Parakeet v2), aunque la aplicación mantiene Parakeet v2 para inglés.
- Joiners adicionales para auto, pt, nl, pl y ru incluidos en `extra_joiners/`, pero no validados (el autor indica que U-distill es significativamente peor que EU r1 en pt+nl+pl+ru).
- No se documentan tool calling, agentes, visión, audio de entrada más allá del propio ASR, ni modo thinking.

## Casos de uso

- Transcripción de reuniones y entrevistas multilingües en dispositivo: el paquete ONNX int8 y la compartición de encoder entre idiomas permiten ejecutar ASR local en fr/de/es/it sin enviar audio a la nube, con un reconocedor por idioma enrutado.
- Subtitulado offline de contenido en vídeo: el modelo se entrenó con habla de YouTube (YODAS2) y FLEURS, por lo que es adecuado para generar transcripciones de vídeos en esos cuatro idiomas en un pipeline local.
- Aplicaciones móviles de notas de voz: el tamaño del encoder int8 (655 MB) y los joiners de 7,9 MB encajan en despliegues on-device con sherpa-onnx, sin dependencia de red.
- Asistentes de voz con sesiones bilingües: una sesión con un idioma de la UE requiere un reconocedor; el diseño de joiners por idioma permite enrutar el idioma de la sesión y mantener el resto del paquete compartido.
- Procesamiento por lotes de audio de atención al cliente: la decodificación greedy y el formato ONNX permiten integrar el modelo en pipelines de transcripción masiva en servidores con CPU o GPU.
- Investigación en ASR multilingüe de bajo coste: el repositorio publica manifiestos, scripts de evaluación, decodificaciones por enunciado en conjuntos públicos y el state_dict fp32, lo que facilita reproducir y comparar recetas de destilación y cuantización.

## Benchmarks y rendimiento

Resultados en WER % (norm v2, intervalo de confianza bootstrap pareado al 95 %; * indica que el IC excluye 0). El conjunto "unbiased pooled" agrega FLEURS-100, CV17 test, VoxPopuli test, MLS test y entrevistas con referencia R13x. "YT agree" está sesgado hacia R13x.

| Sistema | Unbiased pooled | FLEURS | CV17 | VoxPopuli | MLS | Entrevistas | YT agree (sesgado) | YT caption |
|---|---|---|---|---|---|---|---|---|
| App distribuida (v2 en / v3) | 9,81 | 5,38 | 7,89 | 10,59 | 10,77 | 34,12 | 11,21 | 34,08 |
| P3 base int8-xpd | 8,31 | 4,45 | 4,56 | 10,08 | 8,93 | 49,32 | 12,40 | 35,46 |
| P3 base fp32 | 8,12 | 3,79 | 4,12 | 10,13 | 8,77 | 47,97 | 11,65 | 34,58 |
| r1 int8-xpd | 7,72 | 3,57 | 4,69 | 10,46 | 7,71 | 26,01 | 5,81 | 30,44 |
| r1 fp32 | 7,64 | 3,57 | 4,13 | 10,42 | 7,71 | 25,68 | 5,63 | 30,37 |
| U base int8-xpd | 7,92 | 3,96 | 4,57 | 10,61 | 7,93 | 34,12 | 11,88 | 34,30 |
| U base fp32 | 7,88 | 3,99 | 4,51 | 10,65 | 7,82 | 35,47 | 10,89 | 33,44 |
| U-distill int8-xpd (este modelo) | 7,49 | 3,70 | 4,49 | 10,35 | 7,27 | 28,72 | 5,98 | 30,52 |
| U-distill fp32 (este modelo) | 7,32 | 3,60 | 4,36 | 10,19 | 7,07 | 27,03 | 5,90 | 30,41 |

Comparaciones pareadas (A = r1, B = U-distill; diferencia de WER con IC 95 %):

| Comparación | Idiomas | Norm | Unbiased pooled | YT caption | YT agree (sesgado) |
|---|---|---|---|---|---|
| int8-xpd (puerta) | fr+de+es+it | v2 | -0,23 [-0,41, -0,06] * (n 4417) | +0,08 [-0,21, +0,36] | +0,16 [-0,12, +0,47] |
| int8-xpd (puerta) | fr+de+es+it | v1 | -0,20 [-0,37, -0,03] * (n 4417) | +0,04 [-0,24, +0,33] | +0,11 [-0,20, +0,42] |
| int8-xpd (puerta) | fr+de+it (sin es) | v2 | -0,17 [-0,37, +0,03] (n 3307) | +0,08 [-0,23, +0,36] | +0,21 [-0,08, +0,49] |
| int8-xpd (puerta) | en | v2 | -0,33 [-0,82, +0,15] (n 1203) | -0,70 [-1,37, -0,10] * | -0,26 [-0,84, +0,27] |
| int8-xpd (puerta) | pt+nl+pl+ru | v2 | +0,48 [+0,26, +0,69] * (n 2900) | – | – |
| NeMo fp32 | fr+de+es+it | v2 | -0,32 [-0,47, -0,17] * (n 4417) | +0,04 [-0,29, +0,34] | +0,27 [-0,01, +0,57] |
| NeMo fp32 | fr+de+es+it | v1 | -0,29 [-0,44, -0,14] * (n 4417) | +0,01 [-0,31, +0,33] | +0,29 [+0,00, +0,59] |
| NeMo fp32 | fr+de+it (sin es) | v2 | -0,30 [-0,49, -0,11] * (n 3307) | +0,10 [-0,26, +0,46] | +0,26 [-0,01, +0,53] |
| NeMo fp32 | en | v2 | -0,30 [-0,71, +0,09] (n 1103) | – | – |
| NeMo fp32 | pt+nl+pl+ru | v2 | +0,48 (datos truncados en la model card) | – | – |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El encoder int8 ocupa 655 MB en disco y cada joiner 7,9 MB; el decoder int8 es compartido y de tamaño no especificado.
- GPU recomendadas: no disponible. El modelo está pensado para inferencia on-device y despliegue con sherpa-onnx, que soporta CPU y GPU.
- Cabe en GPU consumer: no se especifica; el tamaño del paquete int8 (encoder de 655 MB más decoder y un joiner) es compatible con GPUs consumer de gama media en términos de memoria, aunque no hay cifras publicadas.
- Opciones de despliegue: sherpa-onnx (librería declarada), con decodificación offline `nemo_transducer`; NeMo para cargar el state_dict fp32 `nemo/best.pt`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Contexto | Rendimiento |
|---|---|---|---|---|---|---|
| cabin-asr-eu-nemotron-unified-offline-r1 (este) | 0,6 B | fr, de, es, it (+en) | ONNX int8 (sherpa-onnx), fp32 NeMo | OpenMDW-1.1 | no disponible | WER pooled sin sesgo 7,49 (int8) / 7,32 (fp32) |
| cabin-asr-eu-parakeet-tdt-offline-r1 (EU r1) | no disponible | fr, de, es, it | ONNX int8 (sherpa-onnx) | no disponible | no disponible | WER pooled sin sesgo 7,72 (int8) / 7,64 (fp32) |
| nvidia/nemotron-labs-unified-asr-0.6b (base P3) | 0,6 B | multilingüe (prompt de idioma) | NeMo | no disponible | no disponible | WER pooled sin sesgo 8,31 (int8) / 8,12 (fp32) |
| Parakeet v2 (inglés, distribuido en la app) | no disponible | en | no disponible | no disponible | no disponible | WER pooled sin sesgo 9,81 (sistema distribuido) |

## Limitaciones y advertencias

- Estado de candidato: el modelo ha superado la puerta pre-registrada frente a EU r1, pero queda pendiente la verificación de release del host, la puerta de dispositivo y un A/B en la aplicación.
- Los joiners de pt, nl, pl y ru incluidos en `extra_joiners/` no están validados; el autor indica que U-distill es significativamente peor que EU r1 en esos idiomas (+0,48 WER, IC [+0,26, +0,69]).
- El inglés no se adopta en la aplicación (permanece Parakeet v2), aunque el joiner de inglés supera la comparación EN_COVER2.
- Cargar el joiner equivocado produce un prompt de idioma incorrecto y, por tanto, transcripciones erróneas; la aplicación debe enrutar correctamente el idioma de la sesión.
- El conjunto "YT agree" está sesgado hacia las etiquetas R13x, que ambos modelos aprenden; no debe usarse como medida imparcial.
- El WER en entrevistas es notablemente superior al de los conjuntos públicos (28,72 en int8 para este modelo), lo que indica degradación en audio conversacional o de menor calidad.
- Licencia OpenMDW-1.1: `LICENSE.md` y `NOTICE.md` deben acompañar a los ficheros; es necesario revisar los términos para uso comercial.
- Riesgo de alucinación y sesgos: no documentado en la información proporcionada.
- El código de entrenamiento y evaluación (`thinkprompt/cabin-offline-asr`) es privado; solo se publican artefactos, manifiestos y decodificaciones de conjuntos públicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/doanhlt/cabin-asr-eu-nemotron-unified-offline-r1
- Modelo base: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
- Modelo comparable EU r1: https://huggingface.co/doanhlt/cabin-asr-eu-parakeet-tdt-offline-r1
- Colección Cabin offline ASR: https://huggingface.co/collections/doanhlt/cabin-offline-asr-on-device-distilled-from-r13x-6ade0b05eb1f2ac4e49d7cf8
- Dataset YODAS2: https://huggingface.co/datasets/espnet/yodas2
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- NeMo: https://github.com/NVIDIA/NeMo
