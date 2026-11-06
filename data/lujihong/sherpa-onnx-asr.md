# lujihong/sherpa-onnx-asr

## Resumen

`sherpa-onnx-asr` es un paquete de modelos de reconocimiento automático del habla (ASR) en streaming distribuido por el usuario `lujihong` en HuggingFace. No se trata de un modelo entrenado por el autor del repositorio, sino de una copia de redistribución byte a byte del paquete oficial publicado en los GitHub Releases de `k2-fsa/sherpa-onnx`, con SHA256 idéntico al original. El modelo subyacente es un Zipformer2 Transducer en modo streaming, orientado a reconocimiento de voz continuo con baja latencia.

El paquete está pensado para aplicaciones de dictado y transcripción en tiempo real: el autor lo describe como el modelo empleado en el cliente de escritorio de LaunchAI (浪起) para dictado en campos de entrada, seguimiento de teleprompter y transcripción de audio y vídeo. Cubre chino e inglés, incluido el habla mezclada zh-en, y aplica puntuación automática en la salida.

Técnicamente, el paquete contiene tres redes ONNX (encoder, decoder y joiner) en formato Transducer, con encoder y joiner cuantizados a INT8, lo que reduce el tamaño y facilita la inferencia en CPU. El chunking es de 480 ms, lo que define su latencia de streaming. La licencia Apache-2.0 se hereda del proyecto upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer2 Transducer (encoder-decoder-joiner) en streaming |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por chunks de 480 ms) |
| Tipos de cuantización | INT8 en encoder y joiner; decoder en precisión original (no especificada) |
| Idiomas soportados | chino (zh), inglés (en), incluido habla mezclada zh-en |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.onnx`, `joiner.int8.onnx`) más `tokens.txt`, `bpe.model`, `bpe.vocab` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Zipformer2 en configuración Transducer, un diseño de encoder convolucional con atención eficiente orientado a ASR. La estructura Transducer combina un encoder acústico, un decoder de predicción y una red joiner que produce la distribución sobre el vocabulario en cada paso; esta topología permite decodificación streaming sin necesidad de ventanas de audio completas. El paquete incluye un modelo BPE (`bpe.model`) y un vocabulario BPE adicional (`bpe.vocab`) destinado a la funcionalidad de hotwords o refuerzo de palabras clave.

El chunking de 480 ms define el comportamiento en tiempo real: el encoder procesa bloques de esa duración y emite hipótesis parciales de forma incremental. La cuantización INT8 del encoder y del joiner reduce el coste computacional y el tamaño del paquete (unos 0,1 GB en el repositorio de HuggingFace) a costa de una posible pérdida mínima de precisión. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de ajuste como RLHF o DPO; estos detalles corresponden al proyecto upstream `k2-fsa/sherpa-onnx` y no se documentan en la model card disponible.

## Capacidades

- Reconocimiento de voz en streaming con latencia de chunk de 480 ms.
- Transcripción de habla en chino, inglés y habla mezclada chino-inglés dentro de la misma emisión.
- Puntuación automática incluida en la salida (sufijo `punct` en el nombre del paquete).
- Soporte de hotwords mediante el vocabulario BPE auxiliar (`bpe.vocab`), útil para sesgar el reconocimiento hacia términos específicos del dominio.
- Decodificación Transducer incremental, adecuada para dictado en vivo.
- Inferencia sobre ONNX Runtime mediante `sherpa-onnx`, lo que permite despliegue en CPU sin GPU dedicada.
- No se documentan capacidades de visión, audio más allá de ASR, tool calling, razonamiento multi-paso ni agentes.

## Casos de uso

- Dictado en campos de entrada de escritorio: el modelo fue empaquetado precisamente para el dictado en la caja de texto de la aplicación LaunchAI, donde el streaming a 480 ms permite que el texto aparezca mientras el usuario habla.
- Seguimiento de teleprompter: la transcripción incremental alimenta un sistema que alinea el guion con lo pronunciado y desplaza el texto automáticamente, aprovechando la baja latencia del chunk.
- Transcripción de audio y vídeo: el paquete incluye la ruta de reconocimiento para convertir ficheros de audio en texto con puntuación, reutilizando el mismo modelo en modo offline o por bloques.
- Subtitulado en directo de reuniones o clases en entornos zh-en: la cobertura de habla mezclada permite alternar entre chino e inglés sin cambiar de modelo.
- Asistentes de voz en aplicaciones de escritorio o embebidas: la inferencia ONNX en CPU con cuantización INT8 facilita integrar ASR local sin depender de servicios en la nube.
- Sesgo de vocabulario en dominios específicos: mediante hotwords y el vocabulario BPE, se puede mejorar el reconocimiento de nombres propios, productos o jerga técnica en un despliegue concreto.
- Prototipado y evaluación de pipelines ASR: al ser un paquete autocontenido con `test_wavs/`, sirve para validar la integración con `sherpa-onnx` antes de elegir un modelo definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el paquete está cuantizado a INT8 y pesa unos 0,1 GB, por lo que el consumo de memoria es reducido. No se dispone de cifras exactas de memoria en ejecución.
- GPU recomendadas: no disponibles; el diseño ONNX con INT8 está orientado a CPU, aunque `sherpa-onnx` puede ejecutarse sobre otros backends según la build.
- Compatibilidad con GPU de consumo: no se documenta; el caso de uso declarado es escritorio, lo que sugiere ejecución en CPU.
- Opciones de despliegue: `sherpa-onnx` (runtime nativo con soporte ONNX Runtime); el paquete se descarga como tar.bz2 y se descomprime localmente. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR de este tipo.
- Latencia y throughput: la latencia de chunk es de 480 ms por diseño; no se publican cifras de throughput ni de RTF (real-time factor).

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sherpa-onnx-asr` (este paquete) | Zipformer2 Transducer streaming, ONNX INT8 | zh, en | chunk de 480 ms | Apache-2.0 | HuggingFace (copia) y GitHub Releases upstream |
| Whisper (variantes de OpenAI) | Transformer encoder-decoder, no streaming nativo | multilingüe amplio | ventana de audio fija | MIT | HuggingFace, múltiples runtimes |
| Modelos Zipformer de `k2-fsa/sherpa-onnx` (otros paquetes) | Zipformer Transducer, offline o streaming | según paquete | variable | Apache-2.0 | GitHub Releases de `k2-fsa/sherpa-onnx` |

No se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que la comparación se limita a características estructurales. Cualquier comparación numérica de precisión o latencia requeriría benchmarks que no se han publicado aquí.

## Limitaciones y advertencias

- Este repositorio es una copia de redistribución, no el origen oficial; el autor indica que no existe un repositorio equivalente en la cuenta `csukuangfj` de HuggingFace y que la única fuente oficial es GitHub Releases.
- Solo cubre chino e inglés; no se documenta soporte para otras lenguas.
- El chunking fijo de 480 ms condiciona la latencia mínima y puede afectar a la precisión en comparación con modelos offline que ven el audio completo.
- La cuantización INT8 de encoder y joiner puede introducir degradación de precisión frente a los pesos originales; no se publican métricas de esa pérdida.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez ante ruido, acentos o solapamiento de hablantes.
- La licencia Apache-2.0 permite uso comercial, pero la atribución corresponde al proyecto upstream `k2-fsa/sherpa-onnx`; conviene revisar los términos del proyecto original antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que no aporta señal de validación por parte de la comunidad.
- No se dispone de información sobre parámetros totales, datos de entrenamiento ni métricas de calidad, lo que limita la evaluación previa a un despliegue en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lujihong/sherpa-onnx-asr
- Releases oficiales de modelos de `k2-fsa/sherpa-onnx`: https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/
- Proyecto `k2-fsa/sherpa-onnx`: https://github.com/k2-fsa/sherpa-onnx
- Mirror de descarga citado por el autor: https://ghfast.top/ (prefijo aplicado sobre la URL de GitHub Releases)
- Mirror de HuggingFace citado por el autor: https://hf-mirror.com
