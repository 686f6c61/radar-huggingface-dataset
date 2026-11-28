# softsay/Qwen3-ASR-0.6B-sherpa-onnx-int8

## Resumen

Qwen3-ASR-0.6B-sherpa-onnx-int8 es una distribucion empaquetada del modelo de reconocimiento automatico del habla Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. Esta variante concreta ha sido convertida al formato ONNX y cuantizada a int8 para su uso con el runtime sherpa-onnx, orientado a inferencia eficiente en CPU y dispositivos de borde. El repositorio lo mantiene el usuario softsay como espejo de descarga propio para la plataforma SoftSay, sin modificaciones respecto al paquete original de csukuangfj2.

El modelo resuelve la transcripcion de audio a texto mediante una arquitectura basada en el modelo Qwen3-ASR de 0,6 mil millones de parametros, empaquetada en tres componentes ONNX: un frontend convolucional, un encoder y un decoder. La cuantizacion int8 reduce el peso total del repositorio a aproximadamente 1 GB, lo que lo hace viable en entornos sin GPU dedicada.

Su relevancia actual radica en que permite desplegar un ASR de la familia Qwen3 en produccion con sherpa-onnx, un ecosistema maduro para aplicaciones de voz en tiempo real, sin necesidad de infraestructura de GPU. La licencia Apache 2.0 facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo ASR basado en Qwen3-ASR (frontend convolucional + encoder + decoder), exportado a ONNX |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-ASR-0.6B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (encoder y decoder); frontend convolucional en ONNX sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`conv_frontend.onnx`, `encoder.int8.onnx`, `decoder.int8.onnx`) + tokenizer BPE (`vocab.json`, `merges.txt`) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3-ASR-0.6B, un modelo de reconocimiento del habla de la familia Qwen3. El paquete sherpa-onnx lo descompone en tres grafos ONNX: un frontend convolucional (`conv_frontend.onnx`, 44,1 MB) que procesa las caracteristicas acusticas de entrada, un encoder (`encoder.int8.onnx`, 182,5 MB) y un decoder (`decoder.int8.onnx`, 755,9 MB). El tokenizer es un BPE con `vocab.json` y `merges.txt`.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card del repositorio solo documenta el proceso de conversion y empaquetado, no el entrenamiento original. La conversion a ONNX fue realizada por Wasser1462 mediante el repositorio Qwen3-ASR-onnx y publicada en ModelScope por zengshuishui, para su uso con k2-fsa/sherpa-onnx. SoftSay no entreno ni convirtio el modelo, solo redistribuye los ficheros sin cambios.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto.
- Integracion con sherpa-onnx: pensado para inferencia en CPU y dispositivos de borde mediante el runtime sherpa-onnx.
- Cuantizacion int8: reduce el uso de memoria y acelera la inferencia en hardware sin GPU.
- Pipeline `automatic-speech-recognition`: compatible con la interfaz estandar de Hugging Face para tareas ASR.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo thinking en la informacion disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo puede convertir audio grabado en texto dentro de aplicaciones de escritorio o moviles usando sherpa-onnx, sin depender de servicios en la nube.
- Subtitulado automatico en directo: al ejecutarse en CPU con cuantizacion int8, es adecuado para generar subtitulos en tiempo casi real en entornos con recursos limitados.
- Asistentes de voz embebidos: integrable en dispositivos de borde (Raspberry Pi, mini-PC, moviles) donde no hay GPU disponible, gracias al runtime sherpa-onnx y al tamano reducido del paquete (~1 GB).
- Dictado por voz en herramientas de productividad: transcripcion local de dictados en editores de texto o aplicaciones de notas, preservando la privacidad del audio al no enviarlo a servidores externos.
- Indexacion y busqueda de archivos de audio: convertir grandes volumenes de grabaciones (podcasts, llamadas, clases) a texto para su busqueda y analisis posterior en pipelines batch.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en entornos offline o con conectividad limitada.
- Prototipado rapido de aplicaciones de voz: al estar empaquetado para sherpa-onnx, permite montar demos funcionales de ASR con pocas lineas de codigo y sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma directa, ya que el paquete esta disenado para ejecucion en CPU con ONNX Runtime; el peso conjunto de los ficheros ONNX ronda 1 GB.
- GPU recomendadas: no se especifican; el formato int8 y sherpa-onnx estan orientados a CPU. Cualquier GPU compatible con ONNX Runtime podria usarse, pero no hay datos de rendimiento publicados.
- Compatibilidad con GPU de consumo: el modelo esta pensado para CPU; en GPU de consumo (RTX 4090, etc.) podria ejecutarse via ONNX Runtime, pero no se documenta.
- Opciones de despliegue: sherpa-onnx (runtime principal), ONNX Runtime. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR en ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-sherpa-onnx-int8 (este) | 0,6 B | ONNX int8 | no disponible | Apache 2.0 | Empaquetado para sherpa-onnx, orientado a CPU |
| Qwen/Qwen3-ASR-0.6B (base) | 0,6 B | safetensors (original) | no disponible | Apache 2.0 | Modelo original de Alibaba Cloud |
| Whisper (variantes pequenas) | 0,04-0,24 B | safetensors, GGUF, ONNX | 30 s de audio por ventana | MIT | Alternativa ASR ampliamente usada; comparacion no disponible en benchmarks para este paquete |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma; se desconoce la cobertura linguistica real.
- No hay informacion sobre el rendimiento en audio con ruido, acentos o dominios especializados (medico, legal, tecnico).
- Al ser una redistribucion sin cambios de un paquete de terceros, la calidad y el mantenimiento dependen del repositorio original de csukuangfj2 y de la conversion de Wasser1462.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los ficheros `LICENSE` y `NOTICE` del repositorio para confirmar obligaciones de atribucion.
- El modelo esta empaquetado especificamente para sherpa-onnx; no es directamente usable con frameworks como transformers, vLLM o llama.cpp sin conversion adicional.
- No se documentan requisitos de contexto de audio (duracion maxima de entrada) ni latencia en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/softsay/Qwen3-ASR-0.6B-sherpa-onnx-int8
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Paquete original de sherpa-onnx: https://huggingface.co/csukuangfj2/sherpa-onnx-qwen3-asr-0.6B-int8-2026-03-25
- Repositorio de conversion ONNX: https://github.com/Wasser1462/Qwen3-ASR-onnx
- Conversion publicada en ModelScope: https://modelscope.cn/models/zengshuishui/Qwen3-ASR-onnx
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Sitio de SoftSay: https://softsay.ai
