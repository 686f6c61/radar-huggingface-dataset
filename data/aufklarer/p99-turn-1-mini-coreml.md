# aufklarer/P99-Turn-1-Mini-CoreML

## Resumen

P99-Turn-1-Mini-CoreML es una exportación no oficial a Core ML del modelo turn-1-mini desarrollado por p99lab. Se trata de un modelo acústico de pequeño tamaño (5.262.337 parámetros) cuya única función es estimar la probabilidad de fin de turno (end-of-turn) a partir de audio en streaming. No transcribe voz ni realiza reconocimiento del habla: es un componente especializado para sistemas de diálogo por voz que necesitan decidir cuándo el usuario ha terminado de hablar.

La exportación la firma el usuario aufklarer y mantiene los pesos originales sin modificar, en precisión Float32 y sin cuantización. El grafo compilado incluye el filtrado a 4 kHz, el frontend log-mel y la red de streaming, de modo que el consumidor solo tiene que alimentar PCM mono a 16 kHz y conservar siete tensores de estado entre llamadas. Está pensado para macOS 15+ e iOS 18+, y se integra mediante la librería speech-swift.

Su relevancia práctica está en el despliegue en dispositivo: con pasos de 160 ms y un coste de cómputo de 0,674 ms de mediana en CPU de un Apple M5 Pro, permite construir agentes de voz con detección de fin de turno local, sin depender de servicios en la nube. La licencia Apache 2.0 facilita su uso comercial, aunque el autor advierte de que la exportación no está respaldada por p99lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de streaming con frontend log-mel y filtrado a 4 kHz incluidos en el grafo (detalle de capas no disponible) |
| Parametros totales | 5.262.337 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio en streaming con estado; procesa peticiones de 2.560 muestras / 160 ms) |
| Tipos de cuantizacion | Float32 / ninguna |
| Idiomas soportados | Ingles; otros idiomas no medidos |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`); tamano del grafo compilado 21.896.869 bytes |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de que se trata de una red de streaming que incorpora su propio frontend: filtrado a 4 kHz, extracción log-mel y la red neuronal propiamente dicha dentro del grafo Core ML. El modelo consume audio PCM mono Float32 a 16 kHz y produce ocho probabilidades, una por cada trama de 20 ms, que se materializan conjuntamente tras completar una petición de 160 ms (2.560 muestras). Mantiene siete tensores de estado que deben conservarse entre llamadas y reiniciarse entre conversaciones.

No se han publicado en la información proporcionada datos sobre el volumen de tokens, la composición del dataset de entrenamiento ni sobre si se aplicaron técnicas de RLHF o DPO; el modelo no genera texto, por lo que esas técnicas no resultan directamente aplicables. La innovación destacable de esta exportación es la paridad numérica con el ONNX Float32 original: sobre 96 pasos (15,36 segundos) con silencio, ruido, tonos limpios y tonos muy bajos, el error máximo de probabilidad fue de 0,00000707, por debajo de la tolerancia de 0,0002. El autor documenta además comprobaciones del SDK sobre tamaños de chunk arbitrarios, reset y valores de referencia fijos.

## Capacidades

- Estimación de probabilidad de fin de turno a partir de audio en streaming, con ocho salidas por petición de 160 ms (una cada 20 ms).
- Detección de actividad de voz orientada a la decisión de turno, no a la transcripción.
- Procesamiento en streaming con estado: bufferiza pasos incompletos de 160 ms y conserva el estado entre chunks.
- Frontend acústico integrado: filtrado a 4 kHz y log-mel dentro del grafo, sin preprocesado externo.
- Ejecución en dispositivo mediante Core ML en macOS 15+ e iOS 18+.
- Integración con Swift a través del producto `SpeechVAD` de speech-swift, con `fromPretrained()`, `createSession()`, `pushAudio()` y `reset()`.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión ni audio de entrada distinto del PCM especificado.

## Casos de uso

- Agentes de voz en dispositivos Apple: el modelo decide si el usuario ha terminado de hablar antes de que el agente responda, ejecutándose localmente en macOS o iOS con un coste de cómputo de 0,674 ms de mediana por paso.
- Asistentes conversacionales multi-turno: mantener la sesión entre chunks y reiniciarla solo entre conversaciones permite encadenar turnos sin fugas de estado entre diálogos.
- Atención al cliente telefónica o por VoIP: la política de referencia (0,3 s de silencio confirmado, umbral 0,5 y fallback a 2 s) ofrece un punto de partida para gestionar pausas y evitar cortes prematuros.
- Subtitulado y dictado en tiempo real: como señal auxiliar para segmentar el habla en frases antes de enviar el audio a un motor de reconocimiento.
- Interfaces de voz manos libres: activación y cierre de captura microfónica en aplicaciones de accesibilidad o domótica, donde la latencia de red no es aceptable.
- Investigación en turn-taking: banco de pruebas reproducible para comparar exportaciones Core ML frente al ONNX original con idéntico audio y política, gracias a los ficheros de validación y benchmark incluidos.
- Filtrado previo en pipelines de voz: descartar segmentos sin habla o con pausas a mitad de turno antes de invocar modelos ASR o LLM más costosos.

## Benchmarks y rendimiento

Piloto de desarrollo TurnBench con dos conversaciones fijas en inglés (20 y 21): 148 finales de turno y 94 pausas etiquetadas a mitad de turno. No se seleccionó umbral sobre este piloto.

| Backend | Finales detectados | Falsas alarmas | Retardo en tiempo de audio, mediana | Cómputo por petición, mediana |
|---|---:|---:|---:|---:|
| Core ML + política Silero | 90,5% (134/148) | 16,0% (15/94) | 1506,0 ms | 3,01 ms |
| ONNX Float32 original + misma política | 90,5% (134/148) | 16,0% (15/94) | 1506,0 ms | 1,97 ms |

Mediciones de cómputo en Apple M5 Pro, 48 GiB, solo CPU, una ejecución local y carga excluida de los tiempos por paso:

| Medición | Resultado |
|---|---:|
| Carga del modelo | 72,04 ms |
| Primer paso de 160 ms | 18,08 ms |
| Pasos restantes, mediana | 0,674 ms |
| Pasos restantes, percentil 95 | 0,932 ms |

El autor advierte de que son muestras de cómputo en una máquina compartida, no mediciones de retardo de fin de turno, y que no se ha medido latencia ni memoria en teléfono. La política Silero fija confirma al menos 0,3 s de silencio, acepta probabilidad de fin de turno a 0,5 y aplica fallback a los 2 s.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el grafo compilado ocupa 21.896.869 bytes (aproximadamente 21,9 MB) y el modelo tiene 5,26 millones de parámetros en Float32.
- Plataformas soportadas: macOS 15+ e iOS 18+, con ejecución mediante Core ML.
- GPU recomendadas: no se especifican; las mediciones publicadas son solo con CPU en un Apple M5 Pro con 48 GiB.
- Cabe en hardware de consumo: sí, por tamaño y por su orientación a dispositivos Apple; no se han publicado mediciones en iPhone ni en otros dispositivos.
- Opciones de despliegue: Core ML con la librería speech-swift (rama `main`, producto `SpeechVAD`). No se documentan opciones vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: carga de 72,04 ms; primer paso de 160 ms en 18,08 ms; pasos posteriores con mediana de 0,674 ms y percentil 95 de 0,932 ms (CPU, M5 Pro). El cómputo por petición en el piloto TurnBench fue de 3,01 ms de mediana con Core ML frente a 1,97 ms con ONNX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P99-Turn-1-Mini-CoreML | 5.262.337 | No disponible (streaming con estado, pasos de 160 ms) | 90,5% de finales detectados y 16,0% de falsas alarmas en el piloto TurnBench | Apache 2.0 | Core ML, macOS 15+ / iOS 18+ |
| p99lab/turn-1-mini (ONNX Float32) | No disponible en la informacion | No disponible | Idéntico al export Core ML con la misma política (90,5% / 16,0%) | Apache 2.0 | ONNX, multiplataforma |
| Otros modelos de detección de fin de turno | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente acústico: no transcribe voz y no debe usarse como ASR.
- Idioma: solo inglés evaluado; el rendimiento en otros idiomas no se ha medido.
- Exportación no oficial: no está respaldada por p99lab; es una conversión de formato, no una mejora del modelo.
- El piloto TurnBench es reducido (dos conversaciones, 148 finales y 94 pausas) y no se seleccionó umbral sobre él; los resultados no garantizan comportamiento en producción.
- El retardo de 1506 ms en tiempo de audio corresponde a la reproducción offline y no mide la latencia de un agente desplegado ni el rendimiento en teléfono.
- El espaciado de 20 ms entre tramas no implica una latencia de respuesta de 20 ms; las ocho probabilidades solo están disponibles tras completar los 160 ms.
- La aplicación debe elegir su propio umbral, silencio mínimo y política de fallback; una configuración inadecuada puede provocar cortes prematuros o esperas excesivas.
- Es obligatorio conservar los siete tensores de estado entre llamadas y reiniciarlos entre conversaciones; no hacerlo degrada las estimaciones.
- Riesgo de sesgos acústicos no documentado en la información disponible; no se han publicado evaluaciones por acento, ruido de fondo o calidad de micrófono.
- Licencia Apache 2.0: se permite uso comercial, pero deben conservarse `LICENSE` y el `NOTICE` original, y mantenerse la atribución a p99lab.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aufklarer/P99-Turn-1-Mini-CoreML)
- [Modelo original p99lab/turn-1-mini](https://huggingface.co/p99lab/turn-1-mini)
- [speech-swift (SDK de Apple)](https://github.com/soniqo/speech-swift)
- [Guía de integración en Swift](https://soniqo.audio/guides/turn-models/#swift)
- [Instalación y guías de Soniqo](https://soniqo.audio/getting-started)
- [Soniqo](https://soniqo.audio)
- [Blog de Soniqo](https://soniqo.audio/blog)
- [Método del leaderboard full-duplex](https://huggingface.co/spaces/aufklarer/full-duplex-leaderboard/blob/main/protocol/turn-exports.md)
