# shaeel12/moonshine-base-urdu-final-pta-nhi-ab

## Resumen

`shaeel12/moonshine-base-urdu-final-pta-nhi-ab` es un modelo de reconocimiento automático del habla (ASR) para urdú, obtenido por ajuste fino del modelo Moonshine sobre el corpus `shaeel12/urdu-speech-unified`. Lo publica el usuario `shaeel12` y su arquitectura es la de Moonshine (encoder-decoder transformer con frontend convolucional), con un total de 61.514.752 parámetros según los pesos en safetensors del repositorio.

El interés técnico del modelo está en que documenta un experimento de ajuste parcial: según la model card, solo se entrena la etapa de decodificador y el encoder permanece congelado ("decoder stage, encoder frozen"). Esa decisión abarata mucho el entrenamiento, pero limita la adaptación acústica al dominio del urdú, algo coherente con el resultado declarado de 63,4 % de WER en validación sobre 300 clips con decodificación greedy.

Conviene leerlo como una pieza de investigación reproducible y no como un ASR listo para producción: el repositorio no declara licencia, no incluye variantes cuantizadas, no documenta el volumen ni la composición del corpus de entrenamiento y acumula cero descargas en el momento de la consulta. Su valor está como línea base y como semilla para futuros ajustes sobre Moonshine en lenguas de bajos recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Moonshine), con encoder congelado en este ajuste |
| Parametros totales | 61.514.752 (61,5 M), recuento real de los safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (Moonshine procesa audio de duración variable, sin ventana fija de 30 s; el límite efectivo no se documenta) |
| Tipos de cuantizacion | No disponible; el repo solo publica pesos safetensors, sin variantes GGUF, ONNX ni int8 |
| Idiomas soportados | Urdú (`ur`) exclusivamente |
| Licencia | No disponible en el repositorio (el linaje upstream Moonshine se distribuye habitualmente bajo MIT) |
| Formato de pesos | safetensors |
| Tarea (pipeline) | `automatic-speech-recognition` |
| Dataset de ajuste | `shaeel12/urdu-speech-unified` |
| Estado del entrenamiento | Decoder ajustado, encoder congelado; mejor pérdida de validación 3,1962 |
| Tamano del repositorio | 2,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-17 / 2026-10-18 |

## Arquitectura y entrenamiento

Moonshine es una familia de modelos ASR encoder-decoder de tipo transformer pensada para sustituir el esquema de Whisper (audio rellenado a una ventana fija de 30 s) por uno que consume la señal con su duración real. El encoder aplica un frontend convolucional sobre el espectrograma y una pila de bloques transformer; el decodificador genera los tokens de texto con atención cruzada sobre la salida del encoder. Esta variante parte de la clase "base" de la familia y se ajusta al urdú, idioma para el que no existen muchos checkpoints abiertos de este tamaño.

La model card es explícita sobre el procedimiento: se entrena únicamente el decodificador y se congela el encoder, con el corpus `shaeel12/urdu-speech-unified` como datos de ajuste. No se especifican el número de horas de audio, la composición del corpus (dominio, acentos, relación señal-ruido), la política de aumentación de datos ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR, pero tampoco se documenta ningún tipo de optimización posterior). Tampoco se detalla la configuración de entrenamiento (tasa de aprendizaje, épocas, precisión mixta). La única métrica declarada es la mejor pérdida de validación (3,1962) y el WER de validación del 63,4 % sobre 300 clips con decodificación greedy.

Un detalle relevante para quien vaya a reutilizarlo: la model card titula el modelo como "Moonshine Tiny, Urdu", mientras que el identificador del repositorio, el campo `base_model` y el recuento de parámetros (61,5 M) apuntan a la clase "base". Es una inconsistencia de documentación del autor, no un dato que podamos resolver desde fuera; conviene verificar la arquitectura exacta inspeccionando `config.json` antes de integrarlo.

## Capacidades

- Transcripción de voz a texto en urdú, con entrada de audio de duración variable.
- Decodificación greedy como modo documentado de evaluación (WER del 63,4 % sobre 300 clips).
- Ajuste específico de dominio al corpus `urdu-speech-unified`, lo que puede favorecer el vocabulario y los patrones acústicos de ese conjunto.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta capacidad de agentes ni de razonamiento multi-paso.
- No hay soporte multilingüe declarado: el campo de idioma es únicamente `ur`.
- No se documentan marcas de tiempo, puntuación, capitalización ni diarización de hablantes.
- No hay capacidades de visión ni de audio más allá de la transcripción.

## Casos de uso

- Línea base reproducible para investigación en ASR de urdú: sirve como punto de comparación frente a nuevos ajustes sobre Moonshine, ya que publica pérdida de validación y WER con un protocolo explícito (300 clips, greedy).
- Semilla para un ajuste completo: al tener el encoder congelado, un investigador puede descongelarlo y continuar el entrenamiento con más horas de audio para intentar reducir el WER del 63,4 %.
- Análisis de errores en lenguas de bajos recursos: los fallos del modelo sobre un corpus controlado permiten estudiar qué fenómenos fonéticos del urdú resisten a un ajuste solo de decodificador.
- Experimentos en hardware de borde: con 61,5 M de parámetros (unos 123 MB en fp16) cabe en una Raspberry Pi o en un móvil, lo que permite probar pipelines de ASR totalmente offline aunque la calidad sea baja.
- Extracción de palabras clave sobre audio de dominio muy concreto: si el corpus de ajuste coincide con el dominio de despliegue, puede usarse para detección de términos frecuentes, siempre con revisión humana dado el nivel de error.
- Validación y curación del propio dataset `urdu-speech-unified`: transcribir una muestra y comparar con las etiquetas ayuda a detectar pares audio-texto mal alineados.
- Docencia y demostraciones de ajuste parcial: es un ejemplo compacto de hasta dónde llega congelar el encoder en una tarea de secuencia a secuencia.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| WER de validación | 63,4 % | 300 clips, decodificación greedy |
| Mejor pérdida de validación | 3,1962 | Conjunto de validación del autor |
| Descargas | 0 | En el momento de la consulta |
| Likes | 0 | En el momento de la consulta |

No se han publicado resultados de benchmarks en la informacion disponible más allá de los anteriores: no hay MMLU, HumanEval ni GSM8K (no aplicables a un modelo ASR), ni comparación con Whisper u otros ASR sobre el mismo conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 246 MB en fp32 y unos 123 MB en fp16 para los 61,5 M de parámetros; en int8 rondaría los 62 MB, aunque el repositorio no publica pesos cuantizados.
- GPU recomendadas: innecesarias. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) sobra; el modelo está pensado para ejecutarse en CPU.
- Cabe en cualquier GPU consumer y también en dispositivos de borde: Raspberry Pi 4/5, smartphones y SBCs con 1 GB de RAM disponible.
- Opciones de despliegue: `transformers` con la pipeline `automatic-speech-recognition` para los pesos safetensors; para despliegue ligero, exportación a ONNX y ejecución con ONNX Runtime o sherpa-onnx, que es el formato que emplea el ecosistema Moonshine. vLLM y TGI no son adecuados aquí porque están orientados a modelos de lenguaje, no a ASR encoder-decoder con audio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF ni de velocidad de decodificación para este checkpoint.
- Nota sobre el tamaño del repo: 2,0 GB frente a los ~123 MB de pesos en fp16 indica que el repositorio incluye artefactos de entrenamiento (probablemente estados del optimizador), no solo el checkpoint final.

## Comparativa con modelos similares

Las cifras de parámetros de las filas que no son este repositorio proceden de documentación pública de cada familia y no se han verificado contra sus checkpoints; se marcan como aproximadas.

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`shaeel12/moonshine-base-urdu-final-pta-nhi-ab`) | 61,5 M (verificado) | Duración variable (límite no documentado) | Urdú | No declarada | Safetensors, 0 descargas |
| Moonshine base (upstream) | ≈61 M | Duración variable | Inglés y variantes | MIT | Safetensors y ONNX |
| Moonshine tiny (upstream) | ≈27 M | Duración variable | Inglés y variantes | MIT | Safetensors y ONNX |
| Whisper tiny | ≈39 M | Ventana fija de 30 s | Multilingüe | MIT | Múltiples formatos |
| Whisper base | ≈74 M | Ventana fija de 30 s | Multilingüe | MIT | Múltiples formatos |

La comparación de rendimiento con estos modelos no está disponible: no se han publicado WER de Whisper ni de Moonshine upstream sobre los mismos 300 clips de validación, por lo que no es posible establecer una comparación justa con el 63,4 % declarado.

## Limitaciones y advertencias

- Calidad insuficiente para producción: un WER del 63,4 % implica que aproximadamente dos de cada tres palabras se transcriben mal; solo es aceptable en contextos de investigación o con revisión humana intensiva.
- Licencia no declarada: el repositorio no incluye campo de licencia, lo que impide usar el modelo comercialmente con seguridad jurídica, aunque el linaje Moonshine sea MIT.
- Inconsistencia de documentación: la model card lo llama "tiny" mientras que el identificador y los 61,5 M de parámetros corresponden a la clase "base"; hay que verificar la configuración antes de integrarlo.
- Solo urdú: no hay capacidad multilingüe ni traducción; tampoco se documenta el manejo de code-switching con inglés, frecuente en el habla real en Pakistán.
- Encoder congelado: la adaptación acústica al dominio del urdú es limitada, lo que probablemente explica buena parte del WER y hace previsible un peor rendimiento fuera del dominio de `urdu-speech-unified`.
- Sesgos desconocidos: no se documenta la distribución de hablantes, acentos, edad, género ni condiciones de grabación del corpus, por lo que no se puede evaluar el sesgo por subpoblación.
- Riesgo de alucinación: como todo modelo encoder-decoder, puede generar texto plausible en segmentos de silencio o ruido; sin umbrales de confianza publicados no hay forma de filtrarlo a priori.
- Sin puntuación ni marcas de tiempo: la salida es texto plano, lo que complica su uso en subtitulado o en pipelines que necesiten alineación temporal.
- Ecosistema mínimo: cero descargas y cero likes en la fecha de consulta implican ausencia de validación independiente y de reportes de errores.
- Artefactos de entrenamiento en el repo: los 2,0 GB de tamaño frente a los ~123 MB de pesos sugieren estados del optimizador, algo a tener en cuenta al descargar en entornos con poco espacio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shaeel12/moonshine-base-urdu-final-pta-nhi-ab
- Dataset de ajuste: https://huggingface.co/datasets/shaeel12/urdu-speech-unified
- Variante tiny del mismo autor: https://huggingface.co/shaeel12/moonshine-tiny-urdu
- Discusiones de la variante tiny: https://huggingface.co/shaeel12/moonshine-tiny-urdu/discussions
- Ficha de la variante "final training" en free2aitools: https://free2aitools.com/model/shaeel12/moonshine-tiny-urdu-final-training
- Documentación de variantes de Moonshine (DeepWiki): https://deepwiki.com/moonshine-ai/moonshine/8-model-variants
- Modelos disponibles en Moonshine Voice: https://moonshine-voice.readthedocs.io/en/stable/models/available-models/
