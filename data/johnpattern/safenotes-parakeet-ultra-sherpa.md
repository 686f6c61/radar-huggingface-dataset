# johnpattern/safenotes-parakeet-ultra-sherpa

## Resumen

`safenotes-parakeet-ultra-sherpa` es un paquete de conversión de formato del modelo de reconocimiento automático del habla Parakeet Ultra, desarrollado originalmente por Moondream como un post-entrenamiento de Parakeet TDT 0.6B v3 de NVIDIA. El repositorio, publicado por el proyecto Safenotes (una aplicación local de transcripción de reuniones), contiene únicamente el encoder cuantizado a int8 en formato ONNX, exportado para su uso con sherpa-onnx sobre CPU. No se trata de un modelo nuevo ni de un reentrenamiento: es una conversión de pesos para permitir la inferencia en hardware Intel sin GPU.

La relevancia de este paquete es práctica: permite ejecutar un modelo de ASR de 0,6 mil millones de parámetros en local, sobre CPU, con un único fichero de encoder de 652 MB. El decoder, el joiner y el vocabulario no se incluyen aquí y deben tomarse del paquete oficial `csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8`, con el que son byte-idénticos. El modelo base emplea arquitectura TDT (Token-and-Duration Transducer) y está pensado para reconocimiento de voz multilingüe en 25 lenguas europeas.

La licencia es CC-BY-4.0, heredada del modelo original de Moondream y, en última instancia, de NVIDIA. El autor del paquete advierte explícitamente de que no es una versión oficial y de que no cuenta con el aval de los autores originales. La fecha de creación del repositorio es el 7 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), encoder-decoder con predictor y joiner |
| Parametros totales | 0,6 mil millones (heredados de Parakeet TDT 0.6B v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (ONNX Runtime dynamic int8) |
| Idiomas soportados | 25 lenguas europeas (según la model card de Safenotes); lista concreta no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`); el resto de componentes en el paquete sherpa-onnx de referencia |

## Arquitectura y entrenamiento

El modelo subyacente es un transducer TDT de NVIDIA (Parakeet TDT 0.6B v3), post-entrenado por Moondream para mejorar el rendimiento en benchmarks multilingües, audio con ruido de fondo y audio de larga duración. Según la model card de Moondream, mantiene la misma arquitectura, el mismo tokenizador y los mismos 0,6 mil millones de parámetros en precisión completa que el original, y afirma ser más rápido que este en NeMo. No se dispone de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el post-entrenamiento.

La conversión realizada por Safenotes no implica reentrenamiento: los pesos se exportaron con el script `scripts/nemo/parakeet-tdt-0.6b-v3/export_onnx.py` de sherpa-onnx (commit 23e6558, Apache-2.0) y se cuantizaron con cuantización dinámica int8 de ONNX Runtime 1.31.1 y onnx 1.17.0. La metadata `url` del encoder conserva el enlace de k2-fsa a `nvidia/parakeet-tdt-0.6b-v3` porque sherpa-onnx selecciona el modo de decodificación TDT a partir de esa clave; el origen real queda registrado en la clave `model_source`.

## Capacidades

- Reconocimiento automático del habla (ASR) en modo streaming y offline mediante sherpa-onnx.
- Transcripción multilingüe en 25 lenguas europeas, según la model card del paquete.
- Decodificación TDT, que combina predicción de tokens con predicción de duración para acelerar la inferencia.
- Ejecución íntegra en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración con el ecosistema sherpa-onnx (k2-fsa), que permite despliegue en aplicaciones de escritorio y dispositivos de borde.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento explícito.

## Casos de uso

- Subtitulado en directo en reuniones: Safenotes lo emplea para generar leyendas en vivo en 25 lenguas europeas sobre la CPU del usuario, sin enviar audio a servidores externos.
- Transcripción de actas de reuniones: el modelo convierte el audio de una reunión en texto que la aplicación almacena localmente, lo que encaja con requisitos de privacidad estrictos.
- Procesamiento por lotes de grabaciones en equipos sin GPU: al ejecutarse con ONNX Runtime en CPU, permite transcribir archivos de audio en portátiles y estaciones de trabajo convencionales.
- Aplicaciones de accesibilidad: generación de subtítulos para personas con discapacidad auditiva en entornos de escritorio, con latencia aceptable gracias a la decodificación TDT.
- Despliegue en dispositivos de borde: el encoder int8 de 652 MB y la ausencia de dependencia de CUDA facilitan su integración en mini-PC y equipos industriales.
- Transcripción de audio con ruido de fondo: el post-entrenamiento de Moondream mejora explícitamente el rendimiento en entornos ruidosos, útil para grabaciones de campo o salas compartidas.
- Integración en pipelines de sherpa-onnx: cualquier aplicación que ya use sherpa-onnx puede sustituir el encoder por este fichero int8 sin cambiar el resto del stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Moondream afirma mejoras sobre Parakeet TDT 0.6B v3 en el conjunto FLEURS de 25 lenguas, en ruido de fondo y en audio de larga duración, pero no se proporcionan cifras concretas en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el paquete está diseñado para inferencia en CPU con ONNX Runtime.
- Memoria RAM estimada: el encoder int8 ocupa 652 MB en disco; se recomienda al menos 2-4 GB de RAM libre para cargar el modelo y procesar audio, aunque no se dispone de cifras oficiales.
- GPU: no es necesaria. No se documenta soporte CUDA en este paquete concreto.
- CPU: orientado a hardware Intel; no se especifican requisitos mínimos de núcleos ni instrucciones (AVX2, AVX-512) en la información disponible.
- Despliegue: sherpa-onnx con ONNX Runtime. Requiere combinar este encoder con el decoder, joiner, `tokens.txt` y `bpe.vocab` del paquete `csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `safenotes-parakeet-ultra-sherpa` (este) | 0,6 B | no disponible | ONNX int8 | CC-BY-4.0 | Solo encoder; conversión no oficial para sherpa-onnx en CPU |
| `moondream/parakeet-ultra` | 0,6 B | no disponible | no disponible | CC-BY-4.0 | Modelo original post-entrenado; requiere NeMo |
| `nvidia/parakeet-tdt-0.6b-v3` | 0,6 B | no disponible | no disponible | CC-BY-4.0 | Modelo base de NVIDIA; referencia de partida |
| `csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8` | 0,6 B | no disponible | ONNX int8 | no disponible | Paquete sherpa-onnx completo del que se toman decoder, joiner y vocabulario |

## Limitaciones y advertencias

- Conversión no oficial: el paquete no cuenta con el aval de Moondream ni de NVIDIA; los autores originales no lo respaldan.
- Repositorio incompleto por diseño: solo contiene el encoder y un fichero de aviso de licencia; sin el paquete sherpa-onnx de referencia el modelo no es funcional.
- Sin garantías: se distribuye "tal cual", sin garantía de idoneidad ni de exactitud de la salida, según la licencia CC-BY-4.0.
- Idiomas: se citan 25 lenguas europeas, pero no se detalla la lista ni la calidad por idioma; el rendimiento fuera de ese conjunto no está documentado.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Alucinación: no se documentan tasas de error ni comportamiento ante audio de baja calidad o silencios; el riesgo inherente a los modelos ASR de transductores no se cuantifica aquí.
- Licencia comercial: CC-BY-4.0 permite uso comercial con atribución; es obligatorio conservar la atribución a Moondream y NVIDIA y el aviso de licencia incluido en el repositorio.
- Fecha de creación futura (2026-11-07): conviene verificar la vigencia y el estado del repositorio antes de usarlo en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción por parte de terceros.

## Enlaces

- Repositorio del paquete: https://huggingface.co/johnpattern/safenotes-parakeet-ultra-sherpa
- Modelo original de Moondream: https://huggingface.co/moondream/parakeet-ultra
- Revisión concreta del modelo original: https://huggingface.co/moondream/parakeet-ultra/tree/73175eb7aeb0d82f1e2a6b53b3aabc10a90bcd0b
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Revisión concreta del modelo de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/tree/541d1f99c6b0c3cd0b11a95167540bb8edefd82b
- Paquete sherpa-onnx de referencia: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode
