# hencohen83/ivrit-whisper-large-v3-qnn-sm8750

## Resumen

`hencohen83/ivrit-whisper-large-v3-qnn-sm8750` es una compilación del modelo de reconocimiento automático del habla (ASR) en hebreo `ivrit-ai/whisper-large-v3` a binarios de contexto QNN para la NPU Hexagon v79 del Qualcomm Snapdragon 8 Elite (SM8750). No se trata de un modelo nuevo ni de un reentrenamiento: el autor parte de los pesos completos en precisión nativa (safetensors) del modelo de ivrit.ai, los exporta a ONNX con formas fijas mediante los scripts de sherpa-onnx y los compila con QAIRT 2.40.0.251030 en dos artefactos, `encoder.bin` (1,53 GB) y `decoder.bin` (1,75 GB), más la tabla de tokens `tokens.txt`.

El modelo base es un Whisper large-v3 (arquitectura transformer encoder-decoder de OpenAI) afinado por ivrit.ai específicamente para hebreo, con licencia Apache-2.0. Esta derivación conserva esa licencia y solo cambia el formato de despliegue, de modo que el interés técnico está en la ruta de ejecución: inferencia acelerada por NPU en hardware móvil Android, a través del reconocedor offline de sherpa-onnx con proveedor `qnn`.

Es relevante para desarrolladores que despliegan ASR en dispositivos con Snapdragon 8 Elite y necesitan transcripción en hebreo sin depender de la nube. El propio autor advierte de que la build para NPU aún no se ha medido frente a la CPU y de que su uso previsto es la mejora de transcripciones de clases grabadas, no la transcripción en directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), compilado a binarios de contexto QNN |
| Parametros totales | no disponible (el modelo base Whisper large-v3 ronda los 1,55 B, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas de audio de 30 s en Whisper; confirmado en la validacion del autor sobre un clip de 30 s) |
| Tipos de cuantizacion | Compilacion QNN con activaciones de 16 bits y sesgo de 32 bits (`--float_bitwidth 16`); no se publican pesos cuantizados a enteros |
| Idiomas soportados | Hebreo (`he`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Binarios de contexto QNN (`encoder.bin`, `decoder.bin`) y `tokens.txt`; no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder con atención completa entrenado originalmente por OpenAI para ASR multilingüe y posteriormente afinado por ivrit.ai sobre datos de habla en hebreo. Esta ficha no dispone de detalles sobre el volumen de datos, la composición del corpus ni el uso de RLHF o DPO en ese afinamiento, por lo que esos datos deben consultarse en la model card de `ivrit-ai/whisper-large-v3`.

La innovación de esta derivación es puramente de despliegue. El autor convierte los pesos de precisión completa (commit `766847c9`, sharded) al formato de openai-whisper, exporta a ONNX con formas fijas mediante `scripts/whisper/qnn/export_onnx.py` de sherpa-onnx y compila encoder y decoder con QAIRT 2.40.0.251030 para SM8750. El encoder requirió `--no_simplification` porque el simplificador falla por encima de 2 GB, y `--float_bitwidth 16` porque a 32 bits la librería del modelo supera los 2 GB. Los binarios quedan ligados al chip (SM8750, Hexagon v79) y a la versión exacta del runtime QNN.

## Capacidades

- Reconocimiento automático del habla en hebreo sobre audio de hasta 30 s por ventana, con salida de texto.
- Transcripción offline en dispositivo, sin llamadas a servicios externos.
- Ejecución acelerada por NPU Hexagon v79 mediante el proveedor `qnn` de sherpa-onnx.
- Integración con el reconocedor offline de sherpa-onnx configurando `qnnConfig.contextBinary = "encoder.bin,decoder.bin"` y tipo de modelo `large-v3`.
- Equivalencia funcional con el modelo PyTorch de referencia: el ONNX produce el mismo texto en hebreo que PyTorch sobre un clip de 30 s, según el autor.
- No soporta tool calling, agentes, visión, audio de entrada más allá de la transcripción ni modo de razonamiento; es un modelo ASR puro.

## Casos de uso

- Transcripción de clases y ponencias grabadas: el autor indica que Transcriptor lo emplea para mejorar las transcripciones de clases después de la grabación, aprovechando la calidad de Whisper large-v3 en hebreo y la aceleración por NPU en el dispositivo.
- Subtitulado offline en aplicaciones Android: integración mediante el AAR `hencohen83/sherpa-onnx-qnn-android` para generar subtítulos en hebreo sin conexión, procesando el audio en ventanas de 30 s.
- Procesamiento por lotes de archivos de audio en móvil: al no requerir red, permite transcribir grabaciones almacenadas en el dispositivo en entornos con conectividad limitada o requisitos de privacidad.
- Investigación en ASR sobre hardware móvil: sirve como referencia para medir el rendimiento de Whisper large-v3 en la NPU Hexagon v79 frente a ejecuciones en CPU, una comparación que el autor aún no ha publicado.
- Aplicaciones de accesibilidad: transcripción de notas de voz y conversaciones grabadas en hebreo para usuarios con dificultades auditivas, ejecutada localmente.
- Evaluación de pipelines QNN: útil para equipos que validan el flujo exportación ONNX → compilación QAIRT → sherpa-onnx en Snapdragon 8 Elite antes de industrializar sus propios modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica que la build para NPU no se ha cronometrado frente a la CPU y que el ONNX reproduce el mismo texto en hebreo que PyTorch sobre un clip de 30 s.

## Requisitos de hardware

- NPU Hexagon v79 del Qualcomm Snapdragon 8 Elite (SM8750); los binarios están ligados a este chip y no son portables a otras plataformas.
- Runtime QNN 2.40.0.251030: `libQnnHtp.so`, `libQnnHtpV79Skel.so`, `libQnnHtpV79Stub.so` y `libQnnSystem.so`, publicados por sherpa-onnx como `qnn-libs-2.40.0.251030`, con `ADSP_LIBRARY_PATH` apuntando a su carpeta. Estas librerías son de Qualcomm y no se incluyen en el repositorio.
- sherpa-onnx v2.0.1 con los cambios para Whisper en QNN del parche `scripts/npu/sherpa-onnx-v2.0.1-qnn.patch` del proyecto Transcriptor, o el AAR `hencohen83/sherpa-onnx-qnn-android`.
- Almacenamiento: 3,3 GB de repositorio, con `encoder.bin` de 1.526.292.480 bytes y `decoder.bin` de 1.751.195.648 bytes.
- VRAM estimada: no aplica; el despliegue es en NPU móvil, no en GPU de escritorio.
- GPU recomendadas: no aplica para estos binarios; para ejecutar el modelo base en servidor habría que usar los pesos originales de `ivrit-ai/whisper-large-v3`, fuera del alcance de esta ficha.
- Latencia y throughput: no disponibles; el autor no ha publicado mediciones en NPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato y despliegue |
|---|---|---|---|---|---|
| `hencohen83/ivrit-whisper-large-v3-qnn-sm8750` | no disponible | ventanas de 30 s (Whisper) | he | Apache-2.0 | Binarios QNN para NPU SM8750 vía sherpa-onnx |
| `ivrit-ai/whisper-large-v3` | no disponible | ventanas de 30 s (Whisper) | he | Apache-2.0 | Safetensors/PyTorch; ejecución en CPU/GPU |
| Whisper large-v3 de OpenAI | no disponible | ventanas de 30 s (Whisper) | multilingüe | MIT (según el modelo original de OpenAI; no confirmado en la informacion proporcionada) | Safetensors/PyTorch, GGUF, ONNX; CPU/GPU |

La comparación relevante es de formato y plataforma: frente al modelo de ivrit.ai en PyTorch, esta versión solo cambia el artefacto de ejecución y lo restringe a la NPU del Snapdragon 8 Elite. No se dispone de datos de rendimiento comparativo entre ambas variantes.

## Limitaciones y advertencias

- Solo hebreo: no se debe esperar calidad en otros idiomas, a diferencia del Whisper large-v3 original.
- Portabilidad nula: los binarios de contexto están atados al chip SM8750 (Hexagon v79) y a QAIRT 2.40.0.251030; otra versión del runtime o de la NPU puede impedir la carga.
- Dependencia de software externo: requiere sherpa-onnx v2.0.1 con el parche de Whisper para QNN y las librerías propietarias de Qualcomm, que no se distribuyen en el repositorio.
- Sin mediciones de rendimiento: el autor no ha cronometrado la inferencia en NPU frente a CPU, por lo que no hay garantías de mejora de latencia o throughput en producción.
- Uso previsto no interactivo: el autor lo destina a mejorar transcripciones tras la grabación, no a transcripción en directo.
- Riesgo de alucinación y errores propios de Whisper en audio ruidoso, con solapamiento de hablantes o en segmentos musicales; no se han publicado evaluaciones específicas para esta build.
- Sesgos: no se documentan análisis de sesgo para el modelo base ni para esta derivación.
- Licencia Apache-2.0 permite uso comercial, pero el despliegue efectivo queda condicionado por las licencias de las librerías QNN de Qualcomm y de sherpa-onnx.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hencohen83/ivrit-whisper-large-v3-qnn-sm8750
- Modelo base: https://huggingface.co/ivrit-ai/whisper-large-v3
- ivrit.ai: https://www.ivrit.ai
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Proyecto Transcriptor (parche QNN para sherpa-onnx): https://github.com/chencohensolutions/transcriptor-kmp
- AAR de sherpa-onnx con QNN para Android: https://huggingface.co/hencohen83/sherpa-onnx-qnn-android
