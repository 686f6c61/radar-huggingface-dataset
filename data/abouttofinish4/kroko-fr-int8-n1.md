# abouttofinish4/kroko-fr-int8-n1

## Resumen

Kroko FR int8 "n1" es un modelo de reconocimiento automático del habla (ASR) en francés, empaquetado en formato ONNX para su uso con sherpa-onnx. Se trata de una reempaquetado del modelo comunitario Kroko FR de Banafo, concretamente de la release `sherpa-onnx-streaming-zipformer-fr-kroko-2025-08-06`, con el encoder simplificado para reducir la sobrecarga de carga y ejecución en CPUs lentas y hardware ARM de baja potencia. El autor del reempaquetado es el usuario `abouttofinish4`.

El modelo emplea una arquitectura Zipformer transducer (encoder, decoder y joiner separados) en modo streaming, lo que permite transcripción incremental con baja latencia. Está cuantizado a int8 y optimizado offline (batch fijo a 1, constant folding con la optimización básica de ONNX Runtime), manteniendo sin cambios los pesos int8, el decoder, el joiner y el vocabulario respecto a la release original.

Su relevancia radica en el despliegue en dispositivos de bajos recursos: al estar en ONNX y preparado para sherpa-onnx, puede ejecutarse en Raspberry Pi, dispositivos embebidos y CPUs modestas sin GPU. La licencia CC BY-SA 4.0 permite uso comercial con atribución y compartir-al-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer transducer (encoder + decoder + joiner) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos cuantizados) |
| Idiomas soportados | francés (fr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, joiner.onnx, tokens.txt) y ONNX Runtime en `ort/` |

## Arquitectura y entrenamiento

El modelo es un transducer Zipformer orientado a streaming, dividido en tres grafos ONNX independientes: encoder, decoder y joiner. El encoder ha sido modificado respecto al original fijando la dimensión de batch a 1 y aplicando constant folding offline mediante la optimización básica de ONNX Runtime, lo que reduce el trabajo en tiempo de carga y la sobrecarga en CPUs lentas. Los pesos int8, el decoder, el joiner y el fichero `tokens.txt` son idénticos a los de la release `sherpa-onnx-streaming-zipformer-fr-kroko-2025-08-06`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. El modelo base es `Banafo/Kroko-ASR`, un modelo comunitario francés; este repositorio no documenta el proceso de entrenamiento original, solo el reempaquetado y la optimización del encoder. Se incluye además una copia en formato ONNX Runtime con un fichero `required_operators.config` para builds reducidas de ORT.

## Capacidades

- Reconocimiento automático del habla en francés en modo streaming (transcripción incremental).
- Arquitectura transducer con encoder, decoder y joiner, adecuada para decodificación en línea.
- Ejecución sobre sherpa-onnx como transducer online.
- Compatibilidad con ONNX Runtime, incluyendo builds reducidas mediante `required_operators.config`.
- Optimizado para hardware ARM de baja potencia y CPUs lentas.
- No se documentan capacidades de traducción, diarización, puntuación automática, tool calling ni agentes.

## Casos de uso

- Transcripción en tiempo real en dispositivos embebidos: el modelo en ONNX int8 con encoder simplificado puede ejecutarse en Raspberry Pi u otros ARM de baja potencia para subtitulado o dictado en vivo, gracias a su modo streaming.
- Asistentes de voz offline en francés: al no requerir GPU ni conexión, encaja en aplicaciones de comandos por voz que necesitan privacidad y baja latencia.
- Subtitulado de reuniones o clases: la decodificación incremental permite generar texto a medida que se habla, con un consumo de recursos contenido.
- Integración en pipelines de sherpa-onnx: al incluir los tres grafos y `tokens.txt`, se puede desplegar directamente en aplicaciones que ya usan sherpa-onnx como runtime ASR.
- Prototipado rápido de ASR francés: el tamaño reducido del repo (0,1 GB) y los checksums incluidos facilitan la verificación e integración en entornos de desarrollo.
- Despliegue en builds reducidas de ONNX Runtime: la carpeta `ort/` con `required_operators.config` permite recortar el runtime para entornos con espacio limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso típico; el modelo está pensado para CPU. El tamaño del repo es de 0,1 GB, por lo que la huella en memoria es reducida.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU y hardware ARM de baja potencia.
- ¿Cabe en consumer GPU? Sí, por su tamaño reducido, aunque no es el objetivo del empaquetado.
- Opciones de despliegue: sherpa-onnx (transducer online), ONNX Runtime (incluida build reducida con `required_operators.config`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Kroko FR int8 "n1" (este) | Zipformer transducer | fr | int8 | CC BY-SA 4.0 | ONNX / ORT |
| Banafo/Kroko-ASR (base) | no disponible | fr | no disponible | no disponible | no disponible |
| sherpa-onnx-streaming-zipformer-fr-kroko-2025-08-06 | Zipformer transducer | fr | int8 | no disponible | ONNX |

No se dispone de datos de rendimiento para comparar cuantitativamente con alternativas.

## Limitaciones y advertencias

- Solo soporta francés; no se documentan otros idiomas.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia.
- El modelo es un reempaquetado; los pesos int8, decoder y joiner no han sido reentrenados, por lo que hereda las limitaciones del modelo base.
- No se documentan sesgos, tasas de alucinación ni métricas de precisión (WER).
- El encoder está fijado a batch 1, lo que limita el procesamiento por lotes.
- No se especifican requisitos de memoria ni latencia, lo que dificulta planificar producción sin pruebas propias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/abouttofinish4/kroko-fr-int8-n1
- Modelo base: https://huggingface.co/Banafo/Kroko-ASR
- sherpa-onnx (k2-fsa): no disponible en la información proporcionada
- Release original `sherpa-onnx-streaming-zipformer-fr-kroko-2025-08-06`: no disponible enlace directo en la información proporcionada
