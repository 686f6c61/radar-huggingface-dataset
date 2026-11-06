# Hshareef77/csm-1b-dhivehi-5spk-onnx

## Resumen

CSM-1B Dhivehi (5 speakers) ONNX es un paquete de inferencia derivado de `alakxender/csm-1b-dhivehi-5-spk-gd`, un ajuste fino del modelo Sesame CSM-1B para síntesis de voz en dhivehi (maldivo, código ISO `dv`). Lo publica el usuario Hshareef77 como conversión a ONNX con cuantización de solo pesos, pensada para ejecutarse íntegramente en un teléfono Android sin conexión a internet. No hay reentrenamiento ni destilación: los pesos son los del modelo ajustado original, reexportados y cuantizados.

El modelo resuelve un problema de accesibilidad muy concreto: proporcionar lectura de pantalla en dhivehi a un usuario ciego en un dispositivo móvil, donde la conectividad y los servicios TTS en la nube para este idioma son escasos. El repositorio incluye el backbone Llama de 1B parámetros, el decodificador de profundidad de los codebooks acústicos y el decodificador del códec Mimi de Kyutai, además de tablas de embeddings en int8 y el tokenizador BPE de Llama 3.

La relevancia es doble: por un lado, demuestra una ruta de despliegue de CSM-1B en hardware móvil mediante segmentación en tres grafos ONNX con caché KV explícita y cuantización MatMulNBits; por otro, documenta el proceso de conversión, las pruebas de paridad y un informe de calidad con la tasa de error de caracteres medida frente a la exportación en fp32. El repositorio ocupa 1,7 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CSM-1B (Sesame): backbone transformer tipo Llama + decodificador de profundidad para codebooks acústicos + decodificador del códec Mimi (Kyutai) |
| Parametros totales | 1B en el backbone (el resto de componentes no se detalla) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización de solo pesos MatMulNBits en backbone y depth decoder; cabezas de codebook en fp16; embeddings en int8 por fila (formato DVQ8); decodificador Mimi en fp32 |
| Idiomas soportados | dhivehi (`dv`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`backbone.onnx`, `depth_decoder.onnx`, `mimi_decoder.onnx` con ficheros `.data`), embeddings en `.bin` int8 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CSM de Sesame: un backbone transformer de tipo Llama que procesa el contexto textual y genera representaciones, un decodificador de profundidad que produce secuencialmente los 31 codebooks acústicos (codebooks 1–31) y un decodificador Mimi que convierte 32 flujos de códigos F en audio a 24 kHz. La conversión separa estos componentes en tres grafos ONNX independientes con caché KV explícita en el backbone, lo que permite una ejecución por pasos adecuada para dispositivos móviles.

No se ha realizado reentrenamiento ni destilación en esta conversión: los pesos proceden del ajuste fino `alakxender/csm-1b-dhivehi-5-spk-gd`, a su vez derivado de `sesame/csm-1b`. La model card no detalla el volumen de datos de entrenamiento, la composición del corpus en dhivehi ni si hubo RLHF o DPO en el ajuste fino original. La innovación técnica destacable es la propia ruta de exportación: cuantización de solo pesos con MatMulNBits, embeddings int8 por fila en formato DVQ8, cabezas de codebook en fp16 y verificación de integridad mediante `manifest.json` con SHA-256 de cada fichero.

## Capacidades

- Síntesis de voz (text-to-speech) en dhivehi a partir de texto de entrada.
- Cinco voces identificadas por índice: 0 femenina, 1 masculina, 2 femenina, 3 masculina, 4 sin género especificado de forma consistente en la model card de origen.
- Generación de audio a 24 kHz mediante el decodificador Mimi.
- Muestreo configurable con temperatura 0,9 y top-k 50, según `model_config.json`.
- Ejecución completamente offline en Android: el paquete se descarga una vez y la síntesis se realiza en el dispositivo.
- Tokenizador Llama 3 byte-level BPE incluido en el paquete.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento; el modelo es exclusivamente TTS.

## Casos de uso

- Lectura de pantalla accesible en dhivehi: el caso de uso declarado por el autor es servir como ayuda de lectura offline para un usuario ciego, sintetizando la interfaz y el texto del dispositivo sin conexión.
- Aplicaciones Android sin conectividad: al ejecutarse con onnxruntime en el propio teléfono, es adecuado para entornos con red intermitente o inexistente, donde un TTS en la nube no es viable.
- Audiolibros y contenido en dhivehi: permite convertir texto largo en voz con cinco voces distintas para narración, siempre que se respeten las restricciones de uso de la licencia y de la model card de origen.
- Señalización y avisos de voz en aplicaciones locales: integrable en apps de transporte, salud o administración que necesiten anuncios hablados en maldivo sin depender de servicios externos.
- Investigación en TTS de bajos recursos: el paquete, junto con los scripts de conversión y las pruebas de paridad del repositorio de GitHub, sirve como referencia para exportar CSM-1B a ONNX y medir el impacto de la cuantización con CER.
- Evaluación de calidad de cuantización: el informe `quality_report.md` permite reproducir la comparación entre la exportación fp32 y la cuantizada usando un reconocedor de voz, útil para estudiar la degradación en idiomas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un informe de calidad (`quality_report.md`) con la tasa de error de caracteres de un reconocedor de voz frente a la exportación en fp32, pero no se incluyen las cifras en la información proporcionada.

## Requisitos de hardware

- El paquete está diseñado para ejecutarse en Android mediante onnxruntime; el repositorio ocupa 1,7 GB, por lo que se necesita ese espacio de almacenamiento en el dispositivo (más el espacio temporal durante la descarga).
- VRAM estimada para inferencia: no disponible. Al ser un despliegue móvil, el consumo relevante es de RAM del teléfono, no de VRAM de GPU.
- GPU recomendadas: no aplica para el caso de uso previsto; no se documentan requisitos de GPU de escritorio.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: onnxruntime (librería declarada); la app de referencia es `dhivehi-offline-TTS` en GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| CSM-1B Dhivehi 5spk ONNX (este) | 1B (backbone) | no disponible | dhivehi | Apache-2.0 | ONNX, onnxruntime, Android offline |
| alakxender/csm-1b-dhivehi-5-spk-gd | 1B (backbone) | no disponible | dhivehi | no disponible en la informacion | pesos originales del ajuste fino |
| sesame/csm-1b | 1B (backbone) | no disponible | principalmente ingles | no disponible en la informacion | pesos originales CSM |

La comparación se limita a la cadena de derivación del propio modelo, ya que no se dispone de datos de benchmarks ni de especificaciones de contexto de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card de origen restringe el uso: el checkpoint está destinado a investigación y educación, y prohíbe explícitamente su uso para suplantación de identidad, deepfakes, engaño, acoso, desinformación o manipulación.
- Esta copia convertida se publica para uso personal y no comercial de accesibilidad (lectura de pantalla offline en dhivehi para un usuario ciego); conviene revisar esa restricción antes de cualquier despliegue comercial, aunque la licencia técnica sea Apache-2.0.
- Todas las voces son sintéticas; no se documenta si los hablantes originales dieron consentimiento explícito para el ajuste fino.
- El modelo solo cubre dhivehi (`dv`); no hay soporte multilingüe documentado.
- La cuantización de solo pesos y los embeddings int8 pueden introducir degradación de calidad; el autor remite a `quality_report.md` para las cifras de CER, que no se incluyen aquí.
- Riesgo de alucinación o artefactos acústicos en entradas fuera de distribución: no se documenta ninguna evaluación al respecto.
- El índice de hablante 4 aparece descrito de forma inconsistente en la model card de origen, lo que puede afectar a la selección de voz.
- No hay datos publicados sobre latencia, consumo de batería o RAM en dispositivos Android concretos.
- El repositorio no registra descargas ni interacciones, por lo que no existe validación comunitaria del paquete.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hshareef77/csm-1b-dhivehi-5spk-onnx
- Modelo base (ajuste fino en dhivehi): https://huggingface.co/alakxender/csm-1b-dhivehi-5-spk-gd
- Modelo original CSM-1B de Sesame: https://huggingface.co/sesame/csm-1b
- Aplicación Android de referencia: https://github.com/hshareef77/dhivehi-offline-TTS
