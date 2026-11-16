# sahildl/rider-voice-decisions-m1v3

## Resumen

Rider Voice Decisions (m1v3) es un clasificador de audio sobre notas de voz cortas de repartidores, desarrollado por el usuario de Hugging Face sahildl. Recibe una nota de voz en inglés, hindi o hinglish y devuelve cuatro predicciones calibradas en una sola pasada: la situación que motiva la llamada, la siguiente acción recomendada, el idioma detectado y una alerta de seguridad de dos niveles (SOS o comprobación "Are you safe?"). No transcribe el audio: opera directamente sobre representaciones del backbone.

Técnicamente no es un fine-tune completo, sino una cabeza clasificadora (adapter-style head) entrenada sobre un backbone congelado, Nirnaya Flash 1.0, que a su vez es un fine-tune del modelo audio-nativo Gemma 4 E4B. La cabeza es un módulo de decisión conjunto con anchura oculta de 2.560, dimensión 768, 4 capas y 12 cabezas de atención, con calibración de temperatura por pregunta y umbrales separados para las alertas.

El modelo está inspirado en aplicaciones de reparto de última milla, declara no tener afiliación con Zomato ni Swiggy y todo su entrenamiento se hizo con voz sintética más ruido ambiental real de MS-SNSD. Se presenta explícitamente como un sistema de sugerencia que requiere confirmación humana, no como un sistema de seguridad de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza clasificadora (adapter) sobre backbone de audio congelado Gemma 4 E4B (Nirnaya Flash 1.0) |
| Parametros totales | No disponible (el repo pesa 0,3 GB e incluye cabeza, calibración y umbrales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada: una nota de voz corta más una petición de texto fija) |
| Tipos de cuantizacion | No disponible (features extraídas en fp16; inferencia medida en fp16) |
| Idiomas soportados | Inglés (en), hindi (hi), hinglish |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`head.safetensors`) más `config.json`, `calibration.json` y `thresholds.json` |

## Arquitectura y entrenamiento

El backbone es Nirnaya Flash 1.0, un modelo audio-nativo Gemma 4 E4B derivado de `google/gemma-4-E4B-it`, que se mantiene congelado. El clip de audio y una petición de texto fija (un estado más cuatro preguntas) se procesan una sola vez; los estados ocultos post-norm de anchura 2.560 se agrupan (pooling) para cada pregunta. Las features de esta ejecución se extrajeron en fp16 con `mem_cap` 256, `twice_max` 3.000 y la especificación Decision Index 0.4.0.

La cabeza es el módulo de decisión conjunto de nirnaya-inference, inicializado en caliente desde la cabeza publicada y entrenado sobre features cacheadas: learning rate 1e-5, weight decay 0.01, batch 8, hasta 30 épocas con paciencia 4, mejor checkpoint en la época 19 (unos 15 minutos en la máquina de entrenamiento). Se aplican pesos balanceados por clase en la cabeza de acción, peso positivo de seguridad 3.0 y ponderación de pérdidas situación=1, acción=1, seguridad=1, idioma=0.5. La calibración usa una temperatura consciente de la entropía por pregunta, ajustada sobre logits out-of-fold, que no altera la opción elegida sino solo la confianza. Las alertas aplican dos umbrales sobre una puntuación de seguridad de alta cobertura: SOS si p(acción = SOS) ≥ `sos_tau`; check-in si la puntuación combinada de seguridad (máximo de p(seguridad), p(accidente o acoso), p(SOS)) alcanza `checkin_tau`.

El entrenamiento usa voz TTS sintética multilingüe mezclada con ruido ambiental real de MS-SNSD (tráfico, cláxones, lluvia, multitud, más una cadena de micrófono de teléfono y códec). El conjunto consta de 285 guiones y 2.512 clips, divididos por guion (nunca por clip) en 195/53/37 guiones de entrenamiento/validación/test. En esta ejecución se usaron 1.560 + 212 = 1.772 clips para entrenamiento y validación, con 740 clips en el test reservado. No se usaron datos reales de repartidores.

## Capacidades

- Clasificación de situación de la llamada entre siete categorías del alcance (cliente inalcanzable, dirección incorrecta, accidente, etc.), con las opciones fuera de alcance enmascaradas.
- Predicción de la siguiente acción entre cuatro: esperar, llamar al cliente, contactar con soporte o SOS.
- Detección de idioma entre hinglish, hindi e inglés.
- Alerta de seguridad de dos niveles: SOS y comprobación ámbar "Are you safe?".
- Procesamiento directo de audio sin paso de transcripción.
- Robustez a ruido de calle (tráfico, cláxones, lluvia, multitud) y a la cadena de micrófono de teléfono.
- Salidas con probabilidades calibradas por pregunta.
- Clasificación de audio multi-etiqueta en una sola pasada hacia adelante.

## Casos de uso

- Triaje de notas de voz en una app de reparto: el modelo clasifica en tiempo real la situación y la acción recomendada para que el panel de despacho priorice las llamadas que requieren intervención humana, aprovechando la latencia de p50 604 ms en T4.
- Detección de emergencias en ruta: con recall de seguridad del 100% en el test reservado y 0,7% de falsos SOS en notas normales, puede actuar como primera capa de aviso para escalar accidentes o acoso a un operador humano.
- Enrutamiento multilingüe de soporte: la detección de idioma (85,7 de precisión) permite dirigir la nota al agente o al flujo de respuesta adecuado sin transcripción previa.
- Monitorización de calidad de conversaciones: la clasificación de situación sirve para etiquetar automáticamente incidencias recurrentes (direcciones erróneas, clientes inalcanzables) y alimentar analítica operativa.
- Filtro previo a un sistema de transcripción: al no necesitar transcripción, puede descartar o marcar notas irrelevantes antes de enviarlas a un pipeline ASR más costoso.
- Investigación en clasificación de habla code-switched: el modelo y sus datos sintéticos con ruido real de MS-SNSD sirven como referencia reproducible para experimentos con hinglish y condiciones de bajo SNR.
- Comprobación de bienestar del repartidor: la alerta ámbar "Are you safe?" permite lanzar una verificación automática en notas donde la puntuación de seguridad supera el umbral, con confirmación humana posterior.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test reservado de la ronda 3 (37 guiones / 740 clips), con intervalos que remuestrean guiones, no clips.

| Cabeza | Resultado en test |
|---|---|
| Situación | 82,3 |
| Siguiente acción | 72,6 (IC a nivel de guion 63,1–81,1) |
| Idioma | 85,7 |

La precisión de siguiente acción supone +19,1 puntos sobre la cabeza publicada usada zero-shot en los mismos clips.

| Acción | Recall |
|---|---|
| Esperar | 80,0 |
| Llamar al cliente | 44,3 |
| Contactar con soporte | 73,9 |
| SOS | 85,5 |

| Métrica de seguridad | Resultado en test |
|---|---|
| Recall de seguridad | 100% (15/15 guiones de seguridad) |
| AUROC de seguridad | 0,958 |
| Falsos SOS en notas normales | 0,7% |
| Alerta en SOS reales | 100% |
| Check-ins en notas normales | 33,6% |

| Condición | Precisión de acción |
|---|---|
| Limpio | 83,8 |
| SNR 20 dB | 77,0 |
| SNR 10 dB | 73,0 |
| SNR 5 dB | 68,2 |
| SNR 0 dB | 60,8 |
| Inglés | 69,5 |
| Hindi | 76,4 |
| Hinglish | 71,9 |

Latencia en fp16 sobre T4, batch 1, tras warmup: p50 604 ms, p95 614 ms. En la ronda 2 del test: acción 75,0, situación 87,4, seguridad 9/9 guiones detectados, falsos SOS 0,7%. Los umbrales (`sos_tau` 0,42, `checkin_tau` 0,04, `safety_tau` 0,02) se ajustaron sobre clips out-of-fold (1.772 clips), con tasas OOF de 4,94% de falsos SOS en 1.012 clips normales, que no deben mezclarse con las cifras del test.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 0,3 GB y las features se extrajeron en fp16, pero el backbone Gemma 4 E4B congelado requiere cargarse en memoria además de la cabeza.
- GPU recomendadas: la latencia publicada se midió en una NVIDIA T4, lo que indica que el modelo es desplegable en GPUs de gama media de centro de datos.
- GPU de consumo: no se documenta prueba en GPUs consumer; el tamaño del backbone (E4B) sugiere que puede requerir GPUs con suficiente VRAM, pero no hay datos concretos.
- Opciones de despliegue: no se especifican frameworks de serving (vLLM, TGI, llama.cpp, Ollama); el autor menciona una consola Gradio en el directorio `space/` del repositorio de código.
- Latencia: p50 604 ms y p95 614 ms en T4, fp16, batch 1, tras warmup. Throughput no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros clasificadores de audio, detectores de emoción o sistemas de alerta de seguridad, ni datos de modelos alternativos.

## Limitaciones y advertencias

- El propio autor indica que el modelo sugiere y una persona confirma: no es un sistema de seguridad de producción.
- Todo el entrenamiento es sintético; no se usaron grabaciones reales de repartidores, lo que puede limitar la generalización a voces, acentos y condiciones reales.
- La precisión de la acción "llamar al cliente" es baja (44,3 de recall), lo que puede provocar confusiones con otras acciones.
- El 33,6% de check-ins en notas normales implica una tasa alta de comprobaciones innecesarias que pueden generar fatiga de alertas.
- Los umbrales se ajustaron sobre datos out-of-fold con una tasa de falsos SOS del 4,94%, superior al 0,7% del test; conviene validar el comportamiento real antes de desplegar.
- El rendimiento cae con el ruido: 60,8 de precisión de acción a SNR 0 dB frente a 83,8 en condiciones limpias.
- La precisión en inglés (69,5) es inferior a la de hindi (76,4) y hinglish (71,9).
- El alcance está limitado a siete situaciones y cuatro acciones; las opciones fuera de alcance se enmascaran.
- No hay afiliación con Zomato ni Swiggy; el uso del nombre de estas plataformas debe tratarse con cautela.
- Licencia Apache 2.0 permite uso comercial, pero el backbone base (Gemma) puede tener sus propias condiciones que deben revisarse.
- No se documentan sesgos demográficos ni evaluación de equidad entre acentos o géneros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahildl/rider-voice-decisions-m1v3
- Modelo base: https://huggingface.co/Darkrider/nirnaya-flash-1.0
- Código: https://github.com/Data-Scientist-Sahil/helmet-mind
- Consola Gradio: https://github.com/Data-Scientist-Sahil/helmet-mind/tree/main/space
- Space previsto: https://huggingface.co/spaces/sahildl/rider-voice-decisions
- Repositorio de inferencia: https://github.com/NeverInAsh/nirnaya-inference
- Ruido ambiental MS-SNSD: https://github.com/microsoft/MS-SNSD
