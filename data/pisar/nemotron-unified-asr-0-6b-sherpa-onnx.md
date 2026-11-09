# pisar/nemotron-unified-asr-0.6b-sherpa-onnx

## Resumen

El modelo `pisar/nemotron-unified-asr-0.6b-sherpa-onnx` es una conversión a formato sherpa-onnx del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-labs-unified-asr-0.6b` de NVIDIA. La conversión la ha realizado el usuario `pisar` para integrarla en su aplicación de dictado Pisar para Android. Se trata, por tanto, de un artefacto de despliegue más que de un modelo entrenado desde cero: el trabajo consiste en exportar a ONNX, cuantizar los pesos de las operaciones MatMul a int8 y plegar el prompt de idioma en un vector de sesgo (`bias.bin`) que se inyecta en el encoder al cargar el modelo.

El paquete incluye tres grafos ONNX (`encoder.onnx`, `decoder.onnx`, `joiner.onnx`) que conforman la arquitectura transducer típica de los modelos NeMo, junto con el vocabulario (`tokens.txt`), la lista de idiomas (`langs.txt`) y el citado fichero de sesgos. El tamaño total del repositorio es de 0,7 GB, coherente con un modelo de aproximadamente 600 millones de parámetros cuantizado a int8.

Su relevancia radica en que permite ejecutar un modelo ASR de NVIDIA en dispositivos móviles y en entornos embebidos mediante sherpa-onnx, sin necesidad de infraestructura GPU ni de dependencias de NeMo. La licencia del modelo original es OpenMDW 1.1, y la model card indica que los derechos son de NVIDIA Corporation.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transducer (encoder-decoder-joiner) exportado a ONNX; basado en NeMo |
| Parámetros totales | 0,6 B (aproximadamente 600 millones, según el nombre del modelo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8 (cuantización dinámica de los pesos de MatMul) |
| Idiomas soportados | No disponible en la información proporcionada; el paquete incluye `langs.txt` con vectores de sesgo por idioma |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, joiner.onnx) + bias.bin, langs.txt, tokens.txt |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo transducer de NeMo, compuesto por un encoder, un decoder (predictor) y un joiner, que es el esquema estándar para ASR en streaming en el ecosistema k2-fsa/sherpa-onnx. El modelo original de NVIDIA se distribuye como un checkpoint unificado que, según la documentación de sherpa consultada, soporta múltiples idiomas mediante condicionamiento por prompt de idioma. En esta conversión, ese prompt se ha plegado en un vector de sesgo (`bias.bin`) que se escribe en el encoder en tiempo de carga, con un vector por idioma según `langs.txt`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta conversión no los detalla y remite al modelo base de NVIDIA. La innovación técnica destacable de esta versión es puramente de despliegue: exportación a ONNX y cuantización dinámica int8 de las MatMul, lo que reduce el peso y facilita la inferencia en CPU en dispositivos Android.

## Capacidades

- Reconocimiento automático del habla (ASR) en formato transducer, apto para decodificación en streaming y por fichero de audio.
- Condicionamiento por idioma mediante prompt: el paquete incluye `bias.bin` y `langs.txt` con un vector de sesgo por idioma.
- Ejecución en CPU mediante sherpa-onnx, sin dependencia de GPU ni de NeMo.
- Integración en aplicaciones Android (la conversión se realizó para la app de dictado Pisar).
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento; es un modelo exclusivamente ASR.
- El soporte multilingüe concreto no está especificado en la información disponible para esta conversión.

## Casos de uso

- Dictado por voz en Android: la conversión se creó específicamente para la app Pisar, de modo que puede integrarse en un teclado o app de notas para transcribir voz a texto en el dispositivo, sin enviar audio a la nube.
- Subtitulado y transcripción offline en dispositivos de bajos recursos: al ser un modelo de 0,6 B en int8 y ejecutarse con sherpa-onnx en CPU, encaja en escenarios sin GPU, como grabadoras, lectores o equipos embebidos.
- Transcripción de ficheros de audio en pipelines por lotes: los tres grafos ONNX permiten procesar wavs con la API de decodificación de sherpa-onnx en servidores CPU.
- Reconocimiento en streaming desde micrófono: la arquitectura transducer y el soporte de sherpa-onnx para decodificación incremental lo hacen adecuado para captura en tiempo real, siempre que se valide la latencia en el hardware objetivo.
- Aplicaciones de accesibilidad: dictado y control por voz en interfaces donde se requiere funcionamiento local y sin conexión.
- Prototipado e investigación en ASR: sirve como base para comparar el rendimiento de la versión int8 frente al checkpoint original de NVIDIA en tareas de transcripción multilingüe, usando el condicionamiento por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que la conversión está pensada para CPU mediante sherpa-onnx; el repositorio ocupa 0,7 GB.
- GPU recomendadas: no disponibles; el formato ONNX int8 está orientado a ejecución en CPU.
- ¿Cabe en GPU de consumo? El modelo es pequeño (0,6 B en int8), por lo que en principio cabría en cualquier GPU de consumo, pero no se documentan requisitos ni rendimiento en GPU para esta conversión.
- Opciones de despliegue: sherpa-onnx (runtime principal, con soporte Android), y en general cualquier runtime ONNX compatible con los tres grafos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| pisar/nemotron-unified-asr-0.6b-sherpa-onnx | 0,6 B | No disponible | No disponible (prompt por idioma) | OpenMDW 1.1 | ONNX int8 |
| nvidia/nemotron-labs-unified-asr-0.6b (base) | 0,6 B | No disponible | No disponible | OpenMDW 1.1 | Checkpoint NeMo |
| nvidia/nemotron-speech-streaming-en-0.6b | 0,6 B | No disponible | Inglés | No disponible en la información | No disponible |
| nemotron-3.5-asr-streaming-0.6b | 0,6 B | No disponible | 40 locales de idioma | No disponible en la información | ONNX int8 (según sherpa) |

La comparación con el modelo base es la más directa: esta conversión añade exportación ONNX y cuantización int8, a cambio de posibles diferencias de precisión no cuantificadas en la información disponible. El modelo streaming en inglés y el multilingüe de 3.5 son alternativas de la misma familia y tamaño, pero no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Es una conversión de despliegue, no un modelo nuevo: cualquier limitación del modelo base de NVIDIA se hereda sin cambios.
- No hay datos publicados sobre la pérdida de precisión introducida por la cuantización int8 dinámica de las MatMul.
- El soporte multilingüe real y la calidad por idioma no están documentados en esta conversión; el prompt de idioma debe seleccionarse correctamente mediante `langs.txt` y `bias.bin`.
- Riesgo de alucinación y errores de transcripción en audio con ruido, acentos o vocabulario técnico: no se han publicado evaluaciones al respecto.
- La licencia OpenMDW 1.1 debe revisarse en `LICENSE.md` antes de un uso comercial; los derechos del modelo son de NVIDIA Corporation.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- Es un modelo exclusivamente ASR: no admite tool calling, agentes ni otras capacidades generativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pisar/nemotron-unified-asr-0.6b-sherpa-onnx
- Modelo base: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
- Documentación de NeMo en sherpa: https://k2-fsa.github.io/sherpa/onnx/nemo/index.html
- Documentación de Nemotron streaming en sherpa: https://github.com/k2-fsa/sherpa/blob/master/docs/source/onnx/nemo/nemotron-streaming.rst
- Modelo streaming en inglés de NVIDIA: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Colección Nemotron Speech de NVIDIA: https://huggingface.co/collections/nvidia/nemotron-speech
- APKs de sherpa-onnx para Android: https://k2-fsa.github.io/sherpa/onnx/android/apk-cn.html
