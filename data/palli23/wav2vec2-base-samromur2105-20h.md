# palli23/wav2vec2-base-samromur2105-20h

## Resumen

wav2vec2-base-samromur2105-20h es un modelo de reconocimiento automático del habla (ASR) en islandés, publicado por el usuario palli23 en HuggingFace. Se trata de un ajuste fino de wav2vec2-base sobre el subconjunto de 20 horas del corpus Samrómur 21.05, dentro de un conjunto de checkpoints de escalado denominado "samromur-21.05", asociado al trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" presentado en ICASSP 2026.

El modelo resuelve una pregunta concreta de ingeniería: si un modelo acústico pequeño, entrenado con un volumen limitado de datos en un idioma de bajos recursos como el islandés, puede competir con modelos multilingües mucho más grandes. Con 94.403.241 parámetros y un repositorio de 0,4 GB, está diseñado para escenarios donde el coste de inferencia y el despliegue en hardware modesto son prioritarios frente a la precisión bruta.

Su relevancia actual radica en dos factores. Por un lado, es un ejemplo reproducible de ajuste de wav2vec2 sobre Samrómur, un corpus abierto de habla islandesa. Por otro, forma parte de una serie de checkpoints con distintos presupuestos de horas de entrenamiento, lo que permite estudiar la curva de escalado del dato para idiomas con pocos recursos. El modelo no incluye cabeza de lenguaje, por lo que se usa como extractor acústico dentro de un sistema ASR completo (por ejemplo, con CTC).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder convolucional de características + transformer encoder); detalles de configuracion no disponibles |
| Parametros totales | 94.403.241 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo acustico sobre audio; no se especifica la ventana maxima de entrada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes cuantizadas) |
| Idiomas soportados | islandes (is) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | no disponible |
| Coleccion | samromur-21.05 scaling checkpoint set (ICASSP 2026) |

## Arquitectura y entrenamiento

La arquitectura corresponde a wav2vec2 en su variante base, un modelo de representación del habla auto-supervisado que combina un extractor de características convolucional sobre la forma de onda cruda con un encoder transformer de 12 capas. El número de parámetros (94,4 M) es coherente con esa configuración. El modelo card no aporta el archivo de configuración, por lo que no se pueden confirmar dimensiones de capas, cabezas de atención ni el vocabulario exacto del tokenizador CTC.

Respecto al entrenamiento, la información disponible indica únicamente que el modelo forma parte del conjunto de checkpoints de escalado samromur-21.05 y que se entrenó con 20 horas de audio del corpus Samrómur. No se detalla la composición exacta del dataset, el número de tokens de audio, la estrategia de preentrenamiento previa, ni si hubo etapas de ajuste fino adicionales (por ejemplo, con corrección de etiquetas, aumento de datos o decodificación con modelo de lenguaje). Tampoco se documenta ninguna innovación técnica específica más allá del propio protocolo de escalado del trabajo ICASSP 2026. Cualquier cifra de WER o de comparación cuantitativa debe considerarse no disponible a partir de la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (ASR) en islandés sobre audio en formato de onda cruda.
- Extracción de representaciones acústicas auto-supervisadas reutilizables para otras tareas de voz (clasificación de hablante, detección de emociones, keyword spotting), previo ajuste fino.
- Funcionamiento como modelo acústico dentro de un sistema CTC, que requiere un decodificador externo (greedy, beam search o con modelo de lenguaje) para producir transcripciones.
- Entrenamiento específico sobre habla islandesa, lo que lo hace adecuado para ese dominio lingüístico concreto.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de voz, no un modelo de lenguaje generativo.
- No se documenta capacidad multilingüe, de visión ni de audio más allá del reconocimiento de habla.

## Casos de uso

- Transcripción de audio islandés en archivos históricos: el modelo puede emplearse para convertir grabaciones de entrevistas o archivos orales en texto, con un coste de inferencia bajo gracias a sus 94 M de parámetros frente a alternativas multilingües de mayor tamaño.
- Subtitulado automático de vídeo en islandés: integrado en una cadena de procesado con segmentación previa por VAD y decodificación CTC, permite generar subtítulos con hardware de gama media.
- Asistentes de voz para islandés: al ser un modelo acústico pequeño, se puede desplegar junto a un modelo de lenguaje en un servidor modesto para reconocimiento de comandos o dictado.
- Investigación en escalado de datos para idiomas de bajos recursos: forma parte de una serie de checkpoints con distintos presupuestos horarios, lo que lo convierte en material directo para reproducir curvas de escalado.
- Evaluación comparativa frente a modelos multilingües grandes: sirve como línea base ligera en experimentos que midan la relación entre horas de entrenamiento y WER en islandés.
- Procesado por lotes en entornos sin GPU: al ser un modelo de menos de 100 M de parámetros, la inferencia en CPU es viable para volúmenes moderados de audio.
- Ajuste fino posterior para dominios específicos (por ejemplo, terminología médica o legal islandesa), partiendo del checkpoint ya adaptado al idioma en lugar de wav2vec2-base multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card únicamente referencia la pertenencia al conjunto de checkpoints samromur-21.05 del trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), sin incluir cifras de WER, CER ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,4 GB de pesos más activaciones y buffer de audio; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16/bf16: en torno a 0,2 GB de pesos, aunque no se publican variantes en media precisión.
- Cabe holgadamente en GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores sin ninguna restricción práctica.
- Inferencia en CPU viable: procesadores modernos con AVX2 pueden ejecutar el modelo en tiempo real o casi real para audio de 16 kHz.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; exportación a ONNX para servir en CPU; integración con frameworks ASR como torchaudio o NeMo mediante conversión. No se publican checkpoints GGUF ni compatibilidad declarada con llama.cpp u Ollama, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de RTF (real-time factor) ni de audio procesado por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / tipo | Licencia | Rendimiento en islandes |
|---|---|---|---|---|---|
| palli23/wav2vec2-base-samromur2105-20h | 94,4 M | islandes | ASR acustico (wav2vec2-base), 20 h de ajuste | cc-by-sa-4.0 | no disponible |
| facebook/wav2vec2-base | 95 M | multilingue (preentrenado, sin ASR directo) | ASR acustico auto-supervisado | MIT (Apache-2.0 segun version) | no disponible (requiere ajuste fino) |
| facebook/mms-1b-all | ~1.000 M | 1.100+ idiomas, incluido islandes | ASR multilingue con adaptadores por idioma | CC-BY-NC-4.0 | no disponible |
| openai/whisper-small | ~244 M | 99 idiomas, incluido islandes | ASR seq2seq con decoder | Apache-2.0 | no disponible |

La comparación cuantitativa de WER no puede realizarse con la información disponible. La diferencia estructural relevante es que este checkpoint está especializado en un único idioma con 20 horas de ajuste, mientras que las alternativas son multilingües y de mayor tamaño, lo que implica un coste de inferencia notablemente superior (especialmente mms-1b-all y whisper-small).

## Limitaciones y advertencias

- El modelo solo está entrenado para islandés; su uso con otros idiomas producirá resultados no fiables.
- Con únicamente 20 horas de ajuste, es previsible una cobertura limitada de acentos, registros, ruido de fondo y habla espontánea, aunque no se publican métricas que lo cuantifiquen.
- No incorpora cabeza de lenguaje: la salida CTC requiere decodificación externa y puede contener errores de ortografía y puntuación.
- Riesgo de alucinación y de sustituciones fonéticamente plausibles en audio con ruido o solapamiento de hablantes, inherente a los modelos acústicos sin modelo de lenguaje fuerte.
- No se documentan sesgos demográficos evaluados; el corpus Samrómur puede sobrerrepresentar determinados perfiles de hablantes islandeses.
- Licencia cc-by-sa-4.0: permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia (share-alike), lo que puede condicionar su integración en productos propietarios.
- No hay resultados de benchmarks publicados, por lo que no se puede verificar su calidad frente a alternativas antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se publican variantes cuantizadas ni artefactos de despliegue listos para producción (ONNX, TensorRT), lo que añade trabajo de integración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/wav2vec2-base-samromur2105-20h
- Corpus Samrómur (referencia del dataset): no disponible en la informacion proporcionada
- Paper "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026): no disponible en la informacion proporcionada
- Repositorio de codigo del trabajo: no disponible en la informacion proporcionada

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces encontrados correspondian a contenidos sin relacion con el mismo y se han descartado.
