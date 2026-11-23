# Docglasses-AI/sherpa-onnx-kws-zipformer-gigaspeech-3.3M

## Resumen

Sherpa-ONNX Zipformer KWS (GigaSpeech 3.3M) es un modelo de deteccion de palabras clave (keyword spotting, KWS) desarrollado originalmente por el proyecto k2-fsa/sherpa-onnx y re-alojado en Hugging Face por Docglasses-AI para su uso en descargas on-device de las aplicaciones DocGlasses y SarvaDoc. El modelo emplea una arquitectura Zipformer (variante eficiente de transformer con atencion multi-escala) y esta entrenado sobre el corpus GigaSpeech en ingles. Su tamano es de aproximadamente 3,3 millones de parametros, lo que lo situa en la categoria de modelos ultraligeros disenados para ejecucion local.

El problema que resuelve es la deteccion de palabras clave en flujos de audio en tiempo real sin necesidad de enviar audio a la nube. A diferencia de los modelos de reconocimiento automatico del habla (ASR) completos, un modelo KWS solo necesita identificar un conjunto reducido de palabras predefinidas, lo que permite operar con una huella computacional minima. Las palabras clave se suministran en tiempo de ejecucion, por lo que no es necesario reentrenar el modelo para cambiar el vocabulario de activacion.

Es relevante ahora porque encaja en el creciente interes por la inferencia on-device y los asistentes por voz que preservan la privacidad. El formato de despliegue es sherpa-onnx, un runtime de inferencia ONNX optimizado para CPU y dispositivos embebidos, y los pesos se distribuyen en formato ONNX con cuantizacion INT8 en encoder y joiner. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer (transducer KWS, k2-fsa/sherpa-onnx) |
| Parametros totales | 3,3 millones (segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (encoder y joiner); decoder sin cuantizar |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder INT8, decoder, joiner INT8) + tokens.txt + BPE model |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Zipformer aplicada a un transducer de deteccion de palabras clave, tal como se implementa en el toolkit sherpa-onnx. Zipformer es una evolucion del transformer que reduce el coste computacional mediante atencion multi-escala, downsampling jerarquico y bloques recurrentes, lo que permite obtener latencias bajas en CPU. En este caso concreto, el modelo es un KWS transducer: combina un encoder acustico, un predictor (decoder) y un joiner que puntua la probabilidad de las palabras clave objetivo.

El entrenamiento se realizo sobre el corpus GigaSpeech en ingles, segun indica el nombre del paquete (`gigaspeech-3.3M`). No se dispone en la informacion proporcionada de detalles sobre el numero exacto de horas de audio, la composicion del dataset, ni si se aplicaron tecnicas de aumento de datos o regularizacion especificas. Las palabras clave no forman parte del entrenamiento: se suministran en tiempo de ejecucion mediante ficheros de palabras clave, lo que constituye la innovacion practica principal del diseno. La distribucion incluye un modelo BPE y un fichero de tokens para el procesamiento del texto de las palabras clave.

## Capacidades

- Deteccion de palabras clave en audio en tiempo real con vocabulario configurable en tiempo de ejecucion (sin reentrenamiento).
- Reconocimiento de palabras clave en ingles sobre flujos de audio continuos.
- Ejecucion on-device mediante el runtime sherpa-onnx, con soporte para CPU y dispositivos embebidos.
- Pesos cuantizados en INT8 para reducir el consumo de memoria y latencia.
- Integracion con aplicaciones moviles y de escritorio a traves de la API de sherpa-onnx.
- No dispone de capacidades de ASR completo, traduccion, razonamiento, codigo, vision ni tool calling.
- No dispone de modo thinking, agentes ni razonamiento multi-paso.

## Casos de uso

- Activacion por voz en aplicaciones moviles: el modelo detecta una palabra clave como `capture` para iniciar la captura de audio o una accion concreta, funcionando integramente en el dispositivo sin enviar audio a la nube y preservando la privacidad del usuario.
- Asistentes por voz embebidos en dispositivos de bajo consumo: al requerir solo 3,3 millones de parametros y pesos INT8, puede ejecutarse en CPU de moviles, Raspberry Pi o microcontroladores de gama alta con latencia baja.
- Control por voz en aplicaciones de documentacion (DocGlasses / SarvaDoc): permite activar comandos de captura de documentos o notas mediante palabras clave configurables, sin necesidad de reentrenar el modelo al cambiar el vocabulario.
- Sistemas de manos libres en entornos industriales o sanitarios: la deteccion de palabras clave permite activar funciones sin interaccion tactil, con procesamiento local que evita dependencias de conectividad.
- Filtrado previo en pipelines de ASR: el modelo KWS puede actuar como etapa de activacion (wake-word) que solo enciende el ASR completo cuando se detecta la palabra clave, reduciendo el consumo energetico y el coste de inferencia.
- Prototipado rapido de interfaces de voz: la posibilidad de definir palabras clave en tiempo de ejecucion permite a desarrolladores experimentar con distintos vocabularios de activacion sin reentrenar ni recompilar el modelo.
- Aplicaciones de accesibilidad: activacion de funciones mediante comandos de voz cortos para usuarios con movilidad reducida, con inferencia local que garantiza disponibilidad sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo de 3,3 millones de parametros con pesos INT8, la huella de memoria es del orden de decenas de megabytes, pero no se proporciona una cifra exacta.
- GPU recomendadas: no disponible. El modelo esta disenado para ejecucion en CPU mediante sherpa-onnx, por lo que no requiere GPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer, aunque su uso previsto es CPU.
- Cabe en CPU y dispositivos embebidos: si, es el escenario objetivo (moviles, Raspberry Pi, dispositivos IoT).
- Opciones de despliegue: sherpa-onnx (runtime principal), con soporte para ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sherpa-ONNX Zipformer KWS GigaSpeech 3.3M | 3,3 M | no disponible | Keyword spotting | Apache 2.0 | Hugging Face (re-host) |
| Sherpa-ONNX KWS Zipformer (otros paquetes upstream) | no disponible | no disponible | Keyword spotting | Apache 2.0 | GitHub k2-fsa/sherpa-onnx |
| Modelos KWS clasicos (p. ej. CNN/DS-CNN de Google Speech Commands) | del orden de 0,1-1 M | no disponible | Keyword spotting | variable | variable |

La comparativa con modelos KWS clasicos es orientativa; no se dispone de datos de rendimiento comparativo en la informacion proporcionada. El modelo aqui descrito se distingue por usar un transducer Zipformer en lugar de una CNN ligera, lo que permite vocabulario configurable en tiempo de ejecucion.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha verificado soporte multilingue.
- El modelo esta limitado a la deteccion de palabras clave, no realiza transcripcion completa ni comprension del habla.
- Riesgo de falsos positivos y falsos negativos en entornos con ruido; no se dispone de metricas de precision o recall.
- No se dispone de informacion sobre sesgos acusticos (acentos, dialectos, ruido de fondo) ni sobre el rendimiento por subgrupos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia upstream (k2-fsa/sherpa-onnx) y las condiciones del corpus GigaSpeech.
- El repositorio es un re-host de terceros (Docglasses-AI); la version upstream es la referencia canonica y puede recibir actualizaciones que este re-host no refleje.
- No se dispone de informacion sobre latencia, throughput ni consumo energetico en dispositivos concretos.
- El modelo se distribuye como archivo tar.bz2 que la aplicacion extrae a nombres planos; la integracion requiere seguir esa convencion.

## Enlaces

- Hugging Face: https://huggingface.co/Docglasses-AI/sherpa-onnx-kws-zipformer-gigaspeech-3.3M
- Upstream k2-fsa/sherpa-onnx (release kws-models): https://github.com/k2-fsa/sherpa-onnx/releases/tag/kws-models
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Corpus GigaSpeech: https://github.com/SpeechColab/GigaSpeech
