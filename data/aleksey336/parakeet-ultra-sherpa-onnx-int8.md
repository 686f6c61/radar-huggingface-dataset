# aleksey336/parakeet-ultra-sherpa-onnx-int8

## Resumen

Parakeet Ultra es un modelo de reconocimiento automático del habla (ASR) de tipo transducer TDT (Token-and-Duration Transducer) desarrollado por moondream, obtenido mediante post-entrenamiento sobre nvidia/parakeet-tdt-0.6b-v3. Esta ficha concreta, publicada por el usuario aleksey336, no es el modelo original en PyTorch, sino una conversión al formato de inferencia de sherpa-onnx con el encoder cuantizado a int8, pensada para despliegue en dispositivo (on-device) sin dependencias de frameworks de deep learning pesados.

El paquete incluye los cuatro artefactos que espera el layout offline transducer de sherpa-onnx: `encoder.int8.onnx`, `decoder.onnx`, `joiner.onnx` y `tokens.txt`. El encoder procede del export ONNX int8 de Olicorne (pesos de 8 bits con MatMulNBits y bloque de 64), mientras que decoder y joiner son los grafos fp32 de la exportación de csukuangfj de parakeet-tdt-0.6b-v3 con los inicializadores sustituidos por los valores de Parakeet Ultra.

Su relevancia práctica es doble: por un lado, ofrece transcripción multilingüe en 25 idiomas europeos con un modelo de 0,6 mil millones de parámetros; por el otro, el formato sherpa-onnx permite ejecutarlo en CPU y en dispositivos móviles dentro de aplicaciones reales, como el caso de uso declarado por el autor (transcripción de mensajes de voz en Vibegram X). El repositorio ocupa 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer transducer TDT (Token-and-Duration Transducer), exportado a ONNX |
| Parametros totales | 0,6 mil millones (aproximado, segun el nombre del modelo base parakeet-tdt-0.6b-v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la informacion disponible) |
| Tipos de cuantizacion | Encoder int8 (pesos de 8 bits, MatMulNBits con bloque 64); decoder y joiner en fp32 |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk (25 idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.onnx, joiner.onnx) + tokens.txt |

## Arquitectura y entrenamiento

El modelo subyacente es un transducer TDT, una variante de RNN-Transducer en la que el predictor emite conjuntamente tokens y duraciones, lo que reduce el número de pasos de decodificación frente a un transducer clásico. La base es nvidia/parakeet-tdt-0.6b-v3, sobre la que moondream aplicó un post-entrenamiento para producir Parakeet Ultra; los detalles concretos de ese post-entrenamiento (volumen de datos, composición del corpus, uso de RLHF o ajuste supervisado) no están disponibles en la información proporcionada.

Esta conversión concreta no reentrena nada: reutiliza el encoder int8 de Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx sin modificarlo, salvo la copia de metadatos de sherpa-onnx desde csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 (la URL de metadatos contiene "tdt" para que sherpa-onnx lo decodifique como TDT). El decoder y el joiner se construyen tomando los grafos fp32 de la exportación de csukuangfj y sustituyendo cada inicializador por el valor correspondiente de Parakeet Ultra, emparejado por valor contra la exportación v3. El joiner conserva el sesgo de -1e4 sobre `<unk>` para impedir que se emita ese token.

## Capacidades

- Reconocimiento automático del habla offline (transcripción de audio a texto) en modo transducer.
- Cobertura multilingüe en 25 idiomas europeos, incluidos español, inglés, francés, alemán, italiano, portugués, neerlandés, polaco, ruso y ucraniano, entre otros.
- Inferencia en dispositivo mediante sherpa-onnx, sin necesidad de GPU ni de runtime de PyTorch.
- Ejecución en CPU con encoder int8, lo que reduce requisitos de memoria y acelera la decodificación en hardware modesto.
- Integración en aplicaciones móviles y de escritorio a través de las APIs de sherpa-onnx.
- No dispone de tool calling, capacidades de agente, visión ni audio-vision; es exclusivamente un modelo ASR.

## Casos de uso

- Transcripción de mensajes de voz en aplicaciones de mensajería: es el caso declarado por el autor (Vibegram X); el paquete sherpa-onnx permite transcribir notas de audio localmente en el dispositivo sin enviar el audio a un servidor.
- Subtitulado automático de vídeo y pódcasts: el modelo puede procesar flujos de audio por segmentos y generar transcripciones con marcas temporales, aprovechando la decodificación TDT para reducir pasos.
- Actas y notas de reuniones: transcripción de conversaciones multilingües en entornos corporativos europeos, con cobertura de 25 idiomas que evita depender de un modelo distinto por idioma.
- Asistentes de voz embebidos: integración en dispositivos con recursos limitados (Raspberry Pi, móviles, electrónica de consumo) gracias al encoder int8 y a la ausencia de dependencias de PyTorch.
- Accesibilidad: generación de subtítulos en tiempo real para personas con discapacidad auditiva en aplicaciones de escritorio o móvil.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de archivos de audio en un servidor CPU para hacerlos buscables por texto.
- Dictado por voz en herramientas de productividad: entrada de texto por voz multilingüe en editores y aplicaciones de notas, ejecutándose localmente para preservar la privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual, ya que el paquete está pensado para CPU; el repositorio completo ocupa 0,7 GB, y el encoder int8 es el componente dominante en memoria.
- GPU recomendadas: no disponibles; el formato sherpa-onnx con encoder int8 está orientado a CPU y a dispositivos móviles. No se documenta una ruta GPU específica para este paquete.
- ¿Cabe en GPU de consumo? Sí, por tamaño (0,6B de parámetros), pero la información disponible no documenta su ejecución en GPU mediante este paquete ONNX.
- Opciones de despliegue: sherpa-onnx (layout offline transducer con encoder.int8.onnx, decoder.onnx, joiner.onnx y tokens.txt). No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, que además no son adecuados para un modelo ASR.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Parakeet Ultra sherpa-onnx int8 (esta ficha) | 0,6B | 25 | ONNX (encoder int8) | CC-BY-4.0 | Conversión para sherpa-onnx, orientada a CPU y dispositivo |
| moondream/parakeet-ultra | 0,6B | 25 | no disponible | CC-BY-4.0 | Modelo original en PyTorch del que deriva esta conversión |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B | no disponible | no disponible | no disponible | Base sobre la que se post-entrenó Parakeet Ultra |
| Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx | 0,6B | no disponible | ONNX (int8 y fp32) | no disponible | Exportación ONNX de la que se toma el encoder int8 |
| csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 | 0,6B | no disponible | ONNX sherpa-onnx | no disponible | Exportación de referencia para metadatos y grafos fp32 |

## Limitaciones y advertencias

- Es un modelo ASR puro: no genera texto libre, no razona, no ejecuta código ni soporta tool calling; cualquier uso fuera de transcripción de audio no es aplicable.
- El paquete es una conversión de terceros (aleksey336) y no una publicación oficial de moondream ni de NVIDIA; la reproducibilidad depende de los scripts y decisiones del autor, no documentados en detalle.
- El decoder y el joiner son fp32 mientras que el encoder es int8, una mezcla que puede introducir ligeras discrepancias numéricas frente a una exportación homogénea.
- El sesgo de -1e4 sobre `<unk>` en el joiner impide emitir ese token, lo que puede afectar a la transcripción de audio con ruido o fuera de dominio.
- No se han publicado métricas de WER, latencia ni throughput para esta conversión concreta; no debe asumirse un rendimiento equivalente al modelo original sin validación propia.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución a los autores originales; conviene revisar también las condiciones de los modelos base (moondream/parakeet-ultra y nvidia/parakeet-tdt-0.6b-v3).
- Cobertura limitada a 25 idiomas europeos; no se documenta soporte de otras lenguas ni de code-switching.
- Riesgo de alucinación y de errores en nombres propios, cifras y términos técnicos, inherente a los modelos ASR; en producción conviene aplicar normalización y revisión posterior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso ni validación externa.

## Enlaces

- [Hugging Face: aleksey336/parakeet-ultra-sherpa-onnx-int8](https://huggingface.co/aleksey336/parakeet-ultra-sherpa-onnx-int8)
- [Modelo base: moondream/parakeet-ultra](https://huggingface.co/moondream/parakeet-ultra)
- [Base original: nvidia/parakeet-tdt-0.6b-v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
- [Exportación ONNX de origen: Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx](https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx)
- [Exportación de referencia sherpa-onnx: csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8](https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8)
