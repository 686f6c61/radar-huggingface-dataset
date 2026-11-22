# Maximilian228/Geode-STT-whisper-th

## Resumen

Geode-STT-whisper-th es un paquete de reconocimiento automatico del habla (ASR) derivado de Whisper large-v3, afinado para tailandes por el grupo biodatlab y convertido al formato de sherpa-onnx por el proyecto Geode. Su proposito es proporcionar transcripcion offline en dispositivo dentro de la aplicacion Android Geode, con soporte para tailandes (th) e ingles (en). No se trata de un modelo entrenado desde cero, sino de una exportacion ONNX cuantizada en int8 del checkpoint `biodatlab/whisper-th-large-v3-combined` (revision `ba7197f618`), pensada para ejecutarse con la libreria sherpa-onnx.

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder con 32 capas en el decoder, entrenado originalmente por OpenAI sobre audio y texto multilingue. El paquete incluye unicamente los artefactos de inferencia (`large-v3-encoder.int8.onnx`, `large-v3-decoder.int8.onnx` y `large-v3-tokens.txt`), no los pesos originales en safetensors. El repositorio ocupa 1,8 GB.

Su relevancia actual radica en que, segun la model card, es el unico modelo medido por el autor que alcanza el objetivo del 10 % de error sobre tailandes (CER 6,14 % en FLEURS), a costa de un coste computacional elevado: en un Redmi Note 9 Pro tarda aproximadamente 99 segundos en procesar un audio de 10 segundos, con un pico de memoria de 3,7 GB, por lo que solo es utilizable en dispositivos de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), decoder de 32 capas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio tipica de Whisper large-v3: 30 s) |
| Tipos de cuantizacion | int8 (MatMul, QInt8) |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder y decoder int8) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper de OpenAI en su variante large-v3, un transformer encoder-decoder con decoder de 32 capas. Los pesos proceden del fine-tune tailandes `biodatlab/whisper-th-large-v3-combined`, que parte de Whisper large-v3 y se adapta al tailandes. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponde al modelo base y no se reproduce en la ficha del paquete.

La innovacion tecnica de este artefacto es el proceso de exportacion: los pesos de Hugging Face se remapean al layout de openai-whisper y se exportan con `scripts/whisper/export-onnx.py` (opcion `--model large-v3`) mediante sherpa-onnx, con cuantizacion int8 (MatMul, QInt8). El resultado son dos ficheros ONNX (encoder y decoder) mas el vocabulario de tokens, optimizados para inferencia en CPU con sherpa-onnx. No se mencionan tecnicas adicionales como decodificacion especulativa o attention linear.

## Capacidades

- Transcripcion de voz a texto offline (on-device), sin conexion a red.
- Reconocimiento de tailandes e ingles, con metricas medidas en FLEURS (CER para th, WER para en).
- Ejecucion mediante sherpa-onnx con el tipo de modelo `whisper`.
- Inferencia en CPU con hilos configurables (medido con 4 hilos).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio mas alla de la propia transcripcion.
- No se documenta modo thinking ni capacidades multimodales adicionales.
- Capacidades multilingues limitadas a los dos idiomas indicados (th, en).

## Casos de uso

- Transcripcion de notas de voz en tailandes dentro de la app Geode: el modelo procesa audio localmente sin enviar datos a servidores, lo que encaja con requisitos de privacidad; su CER de 6,14 % en FLEURS lo hace adecuado para dictado en gama alta.
- Subtitulado offline de audio en ingles: con un WER de 5,4 % en FLEURS, puede generar transcripciones para contenido hablado en ingles en dispositivos compatibles.
- Dictado bilingue th/en en entornos sin conectividad: util para trabajo de campo, viajes o zonas con red limitada, al ejecutarse con sherpa-onnx en CPU.
- Archivado y busqueda de audio: transcribir grabaciones para indexarlas y permitir busqueda por texto en tailandes e ingles, siempre que el dispositivo tenga recursos suficientes.
- Investigacion sobre ASR tailandes: sirve como referencia reproducible en formato ONNX para comparar con otros fine-tunes tailandeses, dado que el autor lo presenta como el unico que alcanza el objetivo del 10 % de error.
- Integracion en pipelines sherpa-onnx existentes: al usar el tipo de modelo `whisper` y ficheros encoder/decoder int8, puede sustituir otros paquetes whisper en flujos ya basados en sherpa-onnx sin cambiar la API.
- Prototipado de asistentes de voz en Android: permite validar la calidad de transcripcion tailandesa antes de migrar a un motor propio, aunque con latencias altas en hardware de gama media.

## Benchmarks y rendimiento

| Idioma | Metrica | Error % | Enunciados | Metodo |
|---|---|---|---|---|
| th | CER | 6,14 | 30 | sherpa-onnx, ficheros del paquete, CPU de portatil |
| en | WER | 5,40 | 30 | sherpa-onnx, ficheros del paquete, CPU de portatil |

Rendimiento en dispositivo (Redmi Note 9 Pro, Snapdragon 720G, sherpa-onnx v2.0.1 CLI, 4 hilos):

| Metrica | Valor |
|---|---|
| Tiempo de carga | 18,7 s |
| RTF (audio de 10 s) | 9,95 |
| Pico de RSS (VmHWM) | 3701 MB |

No se han publicado resultados de benchmarks comparativos con MMLU, HumanEval o GSM8K en la informacion disponible, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada: pico de RSS medido de 3701 MB en CPU; en GPU se desconoce el consumo, no disponible.
- GPU recomendadas: no disponible; la model card solo documenta ejecucion en CPU.
- ¿Cabe en GPU consumer? No hay datos; por tamano (large-v3 int8, repo de 1,8 GB) seria plausible en GPUs con 4-8 GB, pero no se ha medido.
- Despliegue: sherpa-onnx (version medida v2.0.1 CLI); no se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia: RTF 9,95 en Snapdragon 720G con 4 hilos (audio de 10 s tarda ~99 s); carga de 18,7 s.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ASR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Geode-STT-whisper-th (este) | large-v3 (no disponible en cifra) | ventana Whisper (30 s tipico) | th CER 6,14 %, en WER 5,4 % (FLEURS, 30 enunciados) | Apache-2.0 | Hugging Face, formato ONNX sherpa-onnx |
| biodatlab/whisper-th-large-v3-combined | large-v3 | ventana Whisper | no disponible en esta ficha | Apache-2.0 | Hugging Face (pesos originales) |
| openai/whisper-large-v3 | large-v3 | ventana Whisper (30 s) | no disponible en esta ficha | Apache-2.0 | Hugging Face, OpenAI |

No se dispone de datos de rendimiento medidos para los modelos comparables dentro de la informacion proporcionada; las cifras de la tabla para alternativas se indican como no disponibles.

## Limitaciones y advertencias

- Alto coste computacional: RTF de 9,95 y pico de 3,7 GB en un Snapdragon 720G implican que solo es utilizable en dispositivos de gama alta; en gama media resulta impractical para uso interactivo.
- Idiomas limitados a tailandes e ingles; no cubre otras lenguas.
- Metricas medidas sobre solo 30 enunciados por idioma en FLEURS, muestra pequena que puede no reflejar el rendimiento en dominios reales (acentos, ruido, habla espontanea).
- Riesgo de alucinacion inherente a Whisper en segmentos con silencio o ruido; no se documenta mitigacion especifica.
- Sesgos no documentados en la model card; no hay informacion sobre sesgos demograficos o dialectales.
- Licencia Apache-2.0 permite uso comercial, pero requiere mantener la atribucion a OpenAI (Whisper large-v3) y a biodatlab (fine-tune tailandes), tal como indica la seccion Attribution.
- El paquete no incluye pesos en safetensors ni scripts de entrenamiento; solo artefactos de inferencia ONNX.
- Dependencia de sherpa-onnx y del layout exportado; cambios en la libreria pueden afectar la compatibilidad.
- No se documenta soporte para GPU ni optimizaciones de latencia adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/Maximilian228/Geode-STT-whisper-th
- Modelo base: https://huggingface.co/biodatlab/whisper-th-large-v3-combined
- Repositorio sherpa-onnx (scripts de exportacion `scripts/whisper/export-onnx.py`): no disponible como URL en la informacion proporcionada
- OpenAI Whisper large-v3: no disponible como URL en la informacion proporcionada
- Documentacion interna del proyecto Geode (`docs/stt-plan.md`): no disponible como URL publica en la informacion proporcionada
