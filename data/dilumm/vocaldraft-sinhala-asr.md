# Dilumm/vocaldraft-sinhala-asr

## Resumen

VocalDraft Sinhala ASR es un modelo de reconocimiento automático del habla (ASR) para cingalés (sinhala, código ISO `si`), empaquetado en formato ONNX con cuantización INT8 y pensado para inferencia en el navegador. El repositorio, publicado por el usuario Dilumm, es un espejo sin modificaciones del modelo original de Deshan Alahakoon, creado para alimentar la función de dictado local de VocalDraft. La relevancia del modelo reside en su orientación a la ejecución on-device: los pesos se distribuyen como fichero externo (`weights.wasm`, que no es un binario WebAssembly sino un contenedor de pesos que el navegador descarga con esa extensión para evitar bloqueos) y se cargan junto al grafo `sinhala_asr_int8.onnx` y el vocabulario `vocab.json`.

La arquitectura se apoya en el encoder omniASR-W2V-300M de Meta, un modelo wav2vec 2.0 de aproximadamente 300 millones de parámetros, sobre el que se ha añadido la cabeza de decodificación correspondiente al reconocimiento de cingalés. El entrenamiento se realizó con el corpus OpenSLR SLR52 de Google, un conjunto de datos público de habla cingalesa. No se dispone de información detallada sobre el número de tokens de audio procesados, la composición exacta del dataset ni las técnicas de ajuste fino empleadas más allá de lo indicado en la model card.

El modelo es de interés para desarrolladores que necesiten dictado o transcripción de cingalés sin enviar audio a servidores externos, ya que su formato ONNX INT8 permite su ejecución en el runtime de inferencia del navegador. La licencia Apache 2.0 facilita su integración comercial, siempre que se conserven los ficheros LICENSE y NOTICE incluidos. El repositorio ocupa 0,4 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder wav2vec 2.0 (omniASR-W2V-300M de Meta) con cabeza de decodificación ASR |
| Parametros totales | Aproximadamente 300 M (según el nombre del encoder base; no se detalla el total exacto del modelo completo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (fichero `sinhala_asr_int8.onnx`) |
| Idiomas soportados | Cingalés (`si`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafo `sinhala_asr_int8.onnx`) con pesos externos en `weights.wasm` (renombrar a `weights.bin` para uso con el grafo original) y vocabulario `vocab.json` |

## Arquitectura y entrenamiento

El modelo se basa en el encoder omniASR-W2V-300M de Meta, una variante de wav2vec 2.0 con aproximadamente 300 millones de parámetros que procesa la señal de audio en bruto y produce representaciones latentes sobre las que se aplica la decodificación hacia texto. Sobre este encoder se ha entrenado la tarea de reconocimiento de habla cingalesa, y el resultado se ha exportado a ONNX con cuantización INT8 para reducir el tamaño y facilitar la inferencia en entornos con recursos limitados, como el navegador.

El corpus de entrenamiento indicado es OpenSLR SLR52 de Google, un conjunto público de audio en cingalés. La model card no especifica el número de horas de audio, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO (poco habituales en ASR). Tampoco se detalla el pipeline de decodificación ni el modelo de lenguaje utilizado, y se remite al proyecto original `ninjawerk/sinhala-asr` para consultar esos detalles. La innovación técnica destacable es el empaquetado para ejecución on-device en el navegador, con verificación de integridad de los pesos mediante SHA-256 antes de cargarlos.

## Capacidades

- Reconocimiento automático del habla en cingalés a partir de audio, con salida de texto.
- Ejecución on-device: el modelo está diseñado para correr en el navegador del usuario, sin enviar el audio a un servidor.
- Inferencia con cuantización INT8 mediante el grafo ONNX incluido.
- Integración con un vocabulario externo (`vocab.json`) para la decodificación.
- Verificación de integridad de los pesos mediante SHA-256 antes de la carga.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá del ASR, ni modo thinking.
- El soporte multilingüe se limita al cingalés; no se indica cobertura de otros idiomas.

## Casos de uso

- Dictado en el navegador: el modelo permite transcribir voz a texto directamente en la página web del usuario, sin backend, gracias a su formato ONNX INT8 y a la carga de pesos externos que VocalDraft verifica antes de ejecutar la inferencia.
- Aplicaciones de accesibilidad para hablantes de cingalés: entrada por voz en formularios, chats o editores de texto donde el usuario no puede o no quiere teclear, con la ventaja de que el audio no sale del dispositivo.
- Herramientas de productividad offline: integración en aplicaciones web progresivas (PWA) que necesitan transcripción de notas de voz en cingalés sin conexión a Internet.
- Transcripción de reuniones o entrevistas en cingalés en entornos con requisitos de privacidad, al procesarse el audio localmente en el navegador.
- Prototipado rápido de interfaces de voz: el formato ONNX y la licencia Apache 2.0 permiten incorporar el modelo en demos y pruebas de concepto sin coste de licencia.
- Educación y aprendizaje de idiomas: ejercicios de pronunciación o dictado en cingalés con retroalimentación inmediata en el cliente, aprovechando la inferencia local.
- Investigación en ASR de bajos recursos: el modelo sirve como referencia para experimentos con cingalés y para comparar el rendimiento de encoders wav2vec 2.0 en este idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un encoder de aproximadamente 300 M de parámetros y cuantización INT8, el modelo es ligero y está pensado para ejecutarse en el navegador, no en GPU dedicada.
- GPU recomendadas: no se especifican; el diseño apunta a ejecución en CPU del cliente mediante el runtime de ONNX en el navegador.
- ¿Cabe en GPU de consumo? Sí, por tamaño (aproximadamente 300 M de parámetros en INT8), aunque el caso de uso previsto es la inferencia en el dispositivo del usuario, no en GPU de escritorio.
- Opciones de despliegue: runtime ONNX en el navegador (el propio pipeline de VocalDraft); para uso con el grafo original, colocar `weights.bin` junto a `sinhala_asr_int8.onnx` y `vocab.json`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a este encoder ASR).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| VocalDraft Sinhala ASR (este modelo) | ~300 M (encoder) | No disponible | Cingalés | Apache 2.0 | ONNX INT8 + pesos externos | Hugging Face (espejo) |
| Meta omniASR-W2V-300M | ~300 M | No disponible | Multilingüe (según el modelo base) | No disponible en la información | No disponible | No disponible en la información |
| Alternativas ASR para cingalés | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse con un corpus público (OpenSLR SLR52), puede reflejar los sesgos de dominio, acento y registro de dicho corpus.
- Riesgo de alucinación: no cuantificado; como todo modelo ASR, puede producir transcripciones incorrectas en audio ruidoso, con acentos no representados o con vocabulario fuera del dominio.
- Limitaciones de contexto o idioma: el modelo solo cubre cingalés; no se especifica la longitud máxima de audio procesable ni el comportamiento con segmentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero exige conservar los ficheros LICENSE y NOTICE incluidos y mantener los avisos de atribución correspondientes.
- Caveat de producción: el fichero `weights.wasm` no es un ejecutable WebAssembly; debe renombrarse a `weights.bin` si se usa con el grafo ONNX original. VocalDraft verifica los pesos mediante SHA-256 antes de cargarlos, por lo que cualquier modificación de los ficheros rompería esa verificación.
- El repositorio es un espejo sin modificaciones; la documentación, evaluación y limitaciones completas deben consultarse en el proyecto original `ninjawerk/sinhala-asr`.
- No se documentan métricas de precisión (WER, CER) ni condiciones de evaluación, lo que dificulta estimar su calidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Dilumm/vocaldraft-sinhala-asr
- Proyecto original: https://github.com/ninjawerk/sinhala-asr
- Corpus OpenSLR SLR52: no disponible en la información proporcionada (referenciado por nombre en la model card)
- Paper o blog del modelo base omniASR-W2V-300M: no disponible en la información proporcionada
