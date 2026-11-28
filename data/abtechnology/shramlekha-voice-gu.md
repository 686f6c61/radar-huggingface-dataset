# AbTechnology/shramlekha-voice-gu

## Resumen

Shramlekha Gujarati voice pack es un paquete de reconocimiento automatico del habla (ASR) en guyaratí, derivado del modelo IndicConformer de AI4Bharat y exportado para su ejecucion local mediante sherpa-onnx. Lo publica AbTechnology como componente de voz de la aplicacion Shramlekha, con el objetivo de permitir dictado por voz en el telefono sin enviar audio a ningun servidor. El modelo resultante es un Conformer con decodificador CTC, cuantizado a int8 y con un vocabulario restringido a 256 piezas de palabra en guyaratí mas el token blank.

El modelo no es un entrenamiento propio: es una conversion del checkpoint `indicconformer_stt_gu_hybrid_rnnt_large` de AI4Bharat, del que se descarta el decodificador RNNT y se recorta la cabeza de salida multilingue de 22 idiomas a solo guyaratí. El resultado es un artefacto ONNX de aproximadamente 137 MB, pensado para inferencia offline en dispositivos moviles con entrada de audio de 16 kHz mono y caracteristicas de 80 dimensiones con normalizacion por caracteristica.

Su relevancia actual es practica: demuestra el patron de empaquetar un modelo ASR grande de IndicConformer en un formato ligero y determinista (ONNX int8) para integrarlo en aplicaciones moviles con sherpa-onnx, manteniendo licencia MIT tanto en el modelo base como en la exportacion. El repositorio es pequeno (0,1 GB) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) + decodificador CTC; exportado desde NeMo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ASR por segmento; entrada de 16 kHz mono, features de 80 dimensiones) |
| Tipos de cuantizacion | int8 (unico peso publicado: `model.int8.onnx`) |
| Idiomas soportados | guyaratí (gu) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.int8.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es IndicConformer, un modelo Conformer de AI4Bharat entrenado originalmente como sistema hibrido RNNT/CTC para 22 idiomas indios. En esta exportacion se conserva el encoder Conformer y el decodificador CTC, mientras que el decodificador RNNT se elimina. La cabeza de salida compartida de 22 idiomas se recorta a 256 piezas de palabra en guyaratí mas el token blank, de modo que el modelo solo puede emitir texto en guyaratí.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o aumentacion) corresponden al modelo original de AI4Bharat y no se documentan en esta model card. La conversion se realiza con el script `tool/voice_pack/convert_nemo_gujarati.py` del repositorio de Shramlekha, y los pesos se cuantizan a int8. El preprocesado es fijo: audio de 16 kHz mono, 80 caracteristicas mel con normalizacion por caracteristica. No se mencionan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento de voz offline en guyaratí, orientado a dictado de frases cortas (el ejemplo de la model card es "Ramesh ne 500 upad aapya").
- Transcripcion con salida restringida al alfabeto guyaratí (256 piezas de palabra + blank), lo que evita mezcla con otros idiomas indios.
- Ejecucion local en el dispositivo mediante sherpa-onnx, sin envio de audio a servidores.
- Inferencia por segmento con `OfflineRecognizer.from_nemo_ctc`, configurable con `num_threads`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la transcripcion.
- No dispone de modo thinking ni de capacidades multimodales.

## Casos de uso

- Dictado de transacciones en la app Shramlekha: el trabajador dicta una frase como "Ramesh ne 500 upad aapya" y el modelo la transcribe en guyaratí para registrarla como entrada de voz, sin conexion y sin salir del telefono.
- Aplicaciones de campo sin conectividad: tecnicos o trabajadores en zonas con cobertura intermitente pueden registrar notas por voz, ya que el modelo corre integramente en el dispositivo.
- Formularios de voz en movil: integracion del reconocedor en flujos de captura de datos (nombre, cantidad, concepto) mediante sherpa-onnx en Android o iOS.
- Privacidad por diseno: escenarios donde el audio no puede salir del dispositivo (datos personales o financieros) y se requiere ASR local en guyaratí.
- Prototipado rapido de interfaces de voz en guyaratí: el tamano de 137 MB y el formato ONNX permiten embeberlo en demos y pruebas de concepto sin infraestructura de servidor.
- Transcripcion por lotes de audios cortos en guyaratí en pipelines locales, usando el reconocedor offline de sherpa-onnx con varios hilos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el unico peso publicado ocupa aproximadamente 137,6 MB en int8; no se dispone de cifras de memoria en tiempo de ejecucion.
- GPU recomendadas: no disponible; el modelo esta orientado a CPU movil mediante sherpa-onnx.
- Compatibilidad con GPU de consumo: no se documenta; el caso de uso declarado es ejecucion en telefono.
- Opciones de despliegue: sherpa-onnx (`OfflineRecognizer.from_nemo_ctc` con `model.int8.onnx` y `tokens.txt`, `num_threads` configurable). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto/entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Shramlekha Gujarati voice pack (este) | Conformer + CTC, int8 | guyaratí | audio 16 kHz mono, 80 features | MIT | ONNX | Recorte del IndicConformer a guyaratí |
| IndicConformer (AI4Bharat, `indicconformer_stt_gu_hybrid_rnnt_large`) | Conformer hibrido RNNT/CTC | 22 idiomas indios | audio 16 kHz mono | MIT | NeMo | Modelo base; incluye decodificador RNNT |
| Alternativas ASR en guyaratí | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Solo transcribe guyaratí; el vocabulario recortado impide cualquier salida en otro idioma, incluido el ingles o el hindi.
- Al eliminar el decodificador RNNT y conservar solo CTC, la precision puede diferir del modelo original hibrido de AI4Bharat; no se aportan metricas que lo cuantifiquen.
- Riesgo de alucinacion o transcripciones incorrectas en audio con ruido, acentos no vistos o vocabulario fuera de las 256 piezas de palabra.
- El preprocesado es estricto (16 kHz mono, 80 features mel con normalizacion por caracteristica); un audio con otro formato degradara el resultado.
- No hay datos publicados sobre sesgos por genero, edad o dialecto del guyaratí.
- La licencia MIT permite uso comercial, pero conviene verificar la atribucion a AI4Bharat y a AbTechnology en productos derivados.
- El repositorio no registra descargas ni likes y fue creado en 2026-11-28; no hay evidencia de uso en produccion ni de mantenimiento posterior.

## Enlaces

- Hugging Face: https://huggingface.co/AbTechnology/shramlekha-voice-gu
- Repositorio de IndicConformer de AI4Bharat: https://github.com/AI4Bharat/IndicConformerASR
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Script de conversion: `tool/voice_pack/convert_nemo_gujarati.py` en el repositorio de Shramlekha (no se proporciona URL directa)
