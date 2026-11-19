# doanhlt/cabin-asr-en-parakeet-tdt-offline-p3

## Resumen

`cabin-asr-en-parakeet-tdt-offline-p3` es un paquete de reconocimiento automático del habla (ASR) en inglés para inferencia local, publicado por el usuario `doanhlt` en Hugging Face. Se distribuye en formato ONNX y está diseñado específicamente para el motor `sherpa-onnx OfflineRecognizer`, manteniendo el mismo diseño de ficheros y configuración que el modelo al que reemplaza: `sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8`. No es, por tanto, un modelo entrenado desde cero, sino un ajuste fino (fine-tune) del modelo `nvidia/parakeet-tdt-0.6b-v2` de NVIDIA, con arquitectura TDT (Token-and-Duration Transducer) de aproximadamente 0,6 mil millones de parámetros.

El ajuste se ha realizado sobre datos de producción de la aplicación Cabin (39,4 horas de audio en inglés con objetivos validados por consenso con texto de la nube), complementados con copias aumentadas, entrevistas de YouTube (1,8 h), FLEURS (7,0 h), Common Voice 17 (18,6 h) y VoxPopuli (13,4 h). El entrenamiento consistió en 2 épocas con tasa de aprendizaje 1e-5, y el resultado se ha cuantizado a int8 en encoder, decoder y joiner, con algunas capas del encoder (pre-encode y convoluciones depthwise) mantenidas en fp32.

El modelo se encuentra en estado de release-candidate: ha superado la puerta de validación en host (host gate PASS) y está empaquetado, pero la validación en dispositivo (device gate) sigue abierta según el documento de decisiones del autor. Es relevante porque muestra un caso de ajuste de un modelo ASR open source sobre audio real de producción para una aplicación móvil offline, con un conjunto de pruebas de regresión pre-registradas y verificables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), basada en nvidia/parakeet-tdt-0.6b-v2 |
| Parametros totales | aproximadamente 0,6 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 en encoder, decoder y joiner; pre-encode y convoluciones depthwise en fp32 |
| Idiomas soportados | inglés (en) |
| Licencia | other (heredada del modelo base, CC-BY-4.0 según la model card) |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx, tokens.txt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TDT (Token-and-Duration Transducer) del modelo base `nvidia/parakeet-tdt-0.6b-v2`, un transducer que predice conjuntamente tokens y duraciones, lo que permite un reconocimiento eficiente sin necesidad de alineamientos externos. El paquete se compone de tres grafos ONNX separados (encoder, decoder y joiner) más el vocabulario `tokens.txt`, con el encoder y el decoder cuantizados a int8 para reducir el tamaño y acelerar la inferencia en dispositivos. El repositorio ocupa 0,7 GB.

El ajuste fino se realizó durante 2 épocas con una tasa de aprendizaje de 1e-5. Los datos de entrenamiento combinan 39,4 horas de audio de producción en inglés (con objetivos que coinciden con el texto de la nube y usuarios de evaluación excluidos), una copia aumentada de ese conjunto, 1,8 horas de entrevistas de YouTube, 7,0 horas de FLEURS, 18,6 horas de Common Voice 17 y 13,4 horas de VoxPopuli, todas en partición de entrenamiento. El texto de la nube (Soniox / Gemini) se utilizó únicamente como filtro de acuerdo entre transcripciones, nunca como objetivo directo de entrenamiento. El profesor (teacher) fue R13x, un fine-tune de Qwen3-ASR. El autor declara que no se incluye audio, transcripción ni identificador de usuario en el repositorio.

## Capacidades

- Reconocimiento automático del habla en inglés, offline, sobre audio de entrada.
- Inferencia local mediante `sherpa-onnx OfflineRecognizer`, sin dependencia de servicios en la nube.
- Compatibilidad directa con el diseño de ficheros y configuración de `sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8`, lo que permite sustituir el modelo anterior sin cambios en el pipeline.
- Orientado a aplicaciones móviles y de escritorio con requisitos de privacidad (procesamiento en dispositivo).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá de ASR, ni modo de pensamiento.
- Capacidad multilingüe: no disponible; el modelo está entrenado y evaluado en inglés.

## Casos de uso

- Transcripción de voz en aplicaciones móviles offline: el modelo se integra en la app Cabin mediante `sherpa-onnx` y transcribe audio en el dispositivo, sin enviar datos a la nube, lo que es adecuado para escenarios con requisitos de privacidad.
- Sustitución directa del modelo anterior en producción: al mantener el mismo diseño de ficheros y configuración que `sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8`, se puede desplegar como reemplazo sin reescribir el pipeline de inferencia.
- Notas de voz y dictado en escritorio: el tamaño del paquete (0,7 GB) y la cuantización int8 permiten ejecutarlo en equipos de consumo con CPU, adecuado para herramientas de dictado local.
- Transcripción de reuniones y entrevistas en inglés: el ajuste incluye 1,8 horas de entrevistas de YouTube, lo que puede mejorar el rendimiento en audio conversacional informal frente al modelo base.
- Procesamiento por lotes de audio en inglés en servidores sin GPU: al ser ONNX, puede ejecutarse con ONNX Runtime en CPU para tareas de transcripción por lotes.
- Evaluación comparativa de ASR en dominio de producción: el repositorio incluye un `gate.json` con pruebas de regresión pre-registradas, útil para equipos que quieran replicar la metodología de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos (WER, MMLU, etc.) en la información disponible. La model card incluye únicamente un resumen de la puerta de validación (`gate.json`) con resultados booleanos de comparación frente al modelo anterior:

| Prueba | Resultado |
|---|---|
| E1_stress_better | true |
| E2_prod_not_worse | true |
| E2_empty_ok | true |
| E3_pk_fleurs100_en_not_worse | true |
| E3_pk_yodas2_en_heldout_caption_not_worse | true |
| E3_cv_en_not_worse | true |
| E3_vp_en_not_worse | true |
| E4_size_within_10pct | true |
| E4_rtf_within_10pct | true |

No se proporcionan los valores numéricos de WER ni de RTF asociados a estas pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo está cuantizado a int8 y el repositorio ocupa 0,7 GB, por lo que la huella de memoria es reducida.
- GPU recomendadas: no disponible. El modelo está empaquetado para `sherpa-onnx` y orientado a inferencia en dispositivo, por lo que el uso de GPU no es un requisito documentado.
- ¿Cabe en GPU de consumo? No se especifica, pero por tamaño (0,6B parámetros, int8) es plausible en GPU de consumo; el autor no lo documenta.
- Opciones de despliegue: `sherpa-onnx OfflineRecognizer` (formato nativo del paquete); al ser ONNX, es compatible con ONNX Runtime.
- Latencia y throughput: no disponibles. La puerta de validación incluye una comprobación `E4_rtf_within_10pct`, que indica que el RTF se mantiene dentro del 10 % del modelo anterior, pero no se publica el valor absoluto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| cabin-asr-en-parakeet-tdt-offline-p3 | ~0,6B | no disponible | inglés | other (base CC-BY-4.0) | ONNX int8 | Fine-tune sobre parakeet-tdt-0.6b-v2 para Cabin |
| sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8 | ~0,6B | no disponible | inglés | CC-BY-4.0 (según model card) | ONNX int8 | Modelo base que este paquete reemplaza |
| nvidia/parakeet-tdt-0.6b-v2 | ~0,6B | no disponible | inglés | CC-BY-4.0 | NeMo / safetensors | Modelo original de NVIDIA |

No se dispone de datos de rendimiento comparativo numérico entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se documentan otros idiomas.
- Es un release-candidate: la validación en dispositivo (device gate) sigue abierta y el cambio en producción depende de una decisión del propietario.
- La licencia es "other"; aunque el modelo base es CC-BY-4.0, las condiciones exactas de uso comercial del paquete ajustado no están detalladas en la información disponible.
- El ajuste se entrenó en parte con audio de producción de Cabin bajo decisiones del propietario (2026-11-01 / 2026-11-17); los pesos se publicaron por decisión del propietario el 2026-11-19. Cualquier uso debe tener en cuenta esta procedencia.
- No se documentan sesgos conocidos ni tasas de alucinación; en ASR, los errores se manifiestan como transcripciones incorrectas, especialmente en audio con ruido o acentos no representados en el conjunto de entrenamiento.
- El texto de la nube se usó solo como filtro de acuerdo, no como objetivo, lo que puede introducir sesgos hacia el estilo de transcripción de esos sistemas.
- No hay información sobre el rendimiento en dominios distintos de los evaluados (FLEURS, Common Voice, VoxPopuli, YODAS2 y audio de producción de Cabin).

## Enlaces

- Hugging Face: https://huggingface.co/doanhlt/cabin-asr-en-parakeet-tdt-offline-p3
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Modelo que reemplaza: sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8 (referenciado en la model card; no se proporciona URL directa)
- `sherpa-onnx`: no se proporciona URL en la información disponible
- `gate.json`: incluido en el repositorio, no se proporciona URL directa
- `docs/RELEASE_DECISION_MATRIX.md` y `mobile-local/distill/DECISIONS.log`: referenciados en la model card, no se proporcionan URL directas
