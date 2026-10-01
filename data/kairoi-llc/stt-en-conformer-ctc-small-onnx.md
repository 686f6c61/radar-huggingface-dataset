# Kairoi-LLC/stt-en-conformer-ctc-small-onnx

## Resumen

Kairoi-LLC/stt-en-conformer-ctc-small-onnx es un espejo (mirror) sin modificaciones del export ONNX cuantizado a int8 del modelo de reconocimiento automatico del habla NVIDIA NeMo `stt_en_conformer_ctc_small`. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son los originales de NVIDIA, exportados a ONNX y cuantizados por el proyecto sherpa-onnx (k2-fsa), y republicados byte a byte por Kairoi-LLC. Su interes practico es que ofrece directamente un artefacto ONNX int8 listo para inferencia en CPU o GPU sin necesidad de instalar el stack completo de NeMo.

El modelo subyacente es un Conformer-CTC «small», una variante no autoregresiva de la arquitectura Conformer que emplea perdida y decodificacion CTC en lugar de un decodificador Transducer. Con aproximadamente 13 millones de parametros, es un modelo muy ligero disenado para transcripcion de ingles en minusculas, con espacios y apostrofos. Al estar cuantizado a 8 bits y exportado a ONNX, resulta especialmente adecuado para despliegues en produccion con requisitos de recursos minimos, incluida la ejecucion en CPU.

La relevancia de esta ficha radica en que el repositorio facilita un binario reproducible (con hashes SHA-256 publicados) para tareas de transcripcion y, sobre todo, de alineacion forzada (forced alignment) y generacion de marcas de tiempo por palabra, gracias a la salida de log-probabilidades por trama que entrega el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (encoder Conformer con cabeza CTC, no autoregresivo) |
| Parametros totales | ~13 millones (segun la model card del modelo original de NVIDIA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio por tramas (80 bins log-mel, 40 ms por trama) |
| Tipos de cuantizacion | int8 (export ONNX cuantizado) |
| Idiomas soportados | ingles (en) unicamente |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (`model.int8.onnx`) + `tokens.txt` |
| Vocabulario | 1024 piezas BPE + token blank (`<blk>`, id 1024) |
| Entradas ONNX | `audio_signal` (80 bins log-mel x tramas) y `length` |
| Salida ONNX | log-probabilidades por trama sobre 1024 BPE + blank |
| Modelo base | nvidia/stt_en_conformer_ctc_small |
| Tags | onnx, nemo, ctc, forced-alignment, word-timestamps, mirror |

## Arquitectura y entrenamiento

La arquitectura es la del Conformer-CTC de NVIDIA NeMo en su variante «small». Se trata de un encoder Conformer (que combina bloques de auto-atencion con convoluciones para capturar dependencias locales y globales) seguido de una cabeza de clasificacion CTC. A diferencia de los modelos basados en Transducer, no emplea un decodificador autoregresivo: la prediccion se realiza con CTC, lo que simplifica el despliegue y reduce la latencia. El modelo original fue entrenado por NVIDIA sobre aproximadamente 16.000 horas de habla en ingles del conjunto NeMo ASRSet, y transcribe en alfabeto ingles en minusculas con espacios y apostrofos.

Sobre el mirror en si, no hay informacion adicional de entrenamiento en la informacion proporcionada: es un artefacto derivado. El export a ONNX y la cuantizacion int8 fueron realizados por el proyecto sherpa-onnx (k2-fsa). No se aplicaron cambios sobre los ficheros originales; el repositorio publica los hashes SHA-256 de `model.int8.onnx` y `tokens.txt` para verificar que coinciden con el commit upstream. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion por preferencias, algo coherente con un modelo CTC supervisado.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles: transcripcion de audio a texto en minusculas.
- Alineacion forzada (forced alignment): etiquetado de la correspondencia entre fonemas/piezas BPE y segmentos de audio.
- Generacion de marcas de tiempo por palabra (word timestamps), derivadas de la salida de log-probabilidades por trama.
- Salida por tramas a 40 ms, con 80 bins log-mel como representacion de entrada.
- Ejecucion en CPU o GPU mediante ONNX Runtime / sherpa-onnx (baja huella de recursos).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje generativo).
- No dispone de capacidades multilingues: solo ingles.
- No tiene vision, audio generativo ni modo «thinking».

## Casos de uso

- Transcripcion de audio a texto en ingles en tiempo real: gracias a su tamano (13M parametros int8) puede ejecutarse en CPU con baja latencia dentro de aplicaciones de dictado o subtitulado.
- Generacion de subtitulos con tiempos por palabra: su salida de alineacion forzada permite sincronizar subtitulos a nivel de palabra sin recurrir a herramientas externas.
- Alineacion forzada para corpus de voz: util para investigacion en fonetica y para construir datasets TTS anotados a nivel de segmento y palabra, partiendo de una transcripcion conocida.
- Preprocesado en pipelines de voz embebidos: al ser ONNX int8, se puede integrar en dispositivos con recursos limitados (moviles, Raspberry Pi, edge) usando sherpa-onnx.
- Indexacion y busqueda sobre archivos de audio en ingles: transcribir grandes volumenes de grabaciones en lotes en servidores sin GPU.
- Transcripcion de reuniones y notas de voz offline: al no depender de APIs externas y ser un modelo ligero, permite procesado local que evita enviar audio a la nube.
- Componente de sistemas de subtitulado para video en CI/CD: encaja como paso previo a la traduccion o al resumen, siempre que el audio sea en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio mirror no incluye tablas de WER ni comparativas de rendimiento, y la model card del autor no reproduce las metricas del modelo original de NVIDIA.

## Requisitos de hardware

- VRAM/RAM estimada: al tratarse de un modelo de ~13M parametros cuantizado a int8, el peso de los pesos ronda los 13 MB; el consumo total depende del runtime y del tamano de los buffers de audio. Ejecutable holgadamente en memoria de sistemas sin GPU.
- GPU recomendadas: cualquier GPU moderna sirve; no se especifican minimos en la informacion disponible. Modelos como RTX 4090, A100 o H100 son sobradamente suficientes, aunque esta carga no los requiere.
- Cabe en GPU consumer y en CPU: si, es un modelo disenado para despliegues ligeros, incluidas CPU y dispositivos edge.
- Opciones de despliegue: ONNX Runtime y sherpa-onnx (k2-fsa) son los caminos naturales para este artefacto. No se menciona soporte de vLLM, TGI, Ollama ni llama.cpp en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kairoi-LLC/stt-en-conformer-ctc-small-onnx (este) | ~13M | Conformer-CTC int8 ONNX | audio, 80 bins log-mel, 40 ms/trama | cc-by-4.0 | HuggingFace (mirror) |
| nvidia/stt_en_conformer_ctc_small | ~13M | Conformer-CTC (formato NeMo nativo) | audio, ingles | cc-by-4.0 | HuggingFace / NGC |
| csukuangfj/sherpa-onnx-nemo-ctc-en-conformer-small | ~13M | Conformer-CTC export ONNX (script Apache-2.0) | audio, ingles | segun upstream | HuggingFace |

Los tres modelos comparten los mismos pesos base; las diferencias estriban en el formato (NeMo nativo frente a ONNX int8), la herramienta de despliegue y los scripts asociados. No se dispone de datos de rendimiento comparado en la informacion proporcionada para establecer diferencias cuantitativas de WER o latencia.

## Limitaciones y advertencias

- Solo ingles: no soporta castellano ni otros idiomas; usarlo con audio en otro idioma producira transcripciones incorrectas.
- Transcribe en minusculas y sin puntuacion: la salida no incluye mayusculas ni signos de puntuacion, salvo espacios y apostrofos.
- Riesgo de alucinacion: como todo modelo ASR, puede generar palabras plausibles en audio ruidoso, con acentos marcados o con solapamiento de hablantes; no hay datos de robustez publicados en esta ficha.
- Sesgos: no se documenta en la informacion disponible un analisis de sesgos por acento, genero, edad o variedad dialectal; dado que el entrenamiento se apoya en NeMo ASRSet, puede haber desequilibrios no declarados.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es obligatorio conservar la atribucion a NVIDIA y a los proyectos que realizaron el export y la cuantizacion (sherpa-onnx / k2-fsa).
- Es un mirror: no hay soporte ni mantenimiento por parte de Kairoi-LLC sobre el comportamiento del modelo; cualquier incidencia funcional remite al modelo original de NVIDIA.
- Artefacto cuantizado: la cuantizacion int8 puede degradar ligeramente la precision respecto a los pesos en punto flotante; no hay datos de dicha degradacion en la informacion proporcionada.
- Entradas ONNX especificas: requiere alimentar `audio_signal` con 80 bins log-mel y `length`; no acepta audio en crudo sin el preprocesado correspondiente.

## Enlaces

- Repositorio mirror en HuggingFace: https://huggingface.co/Kairoi-LLC/stt-en-conformer-ctc-small-onnx
- Modelo original de NVIDIA: https://huggingface.co/nvidia/stt_en_conformer_ctc_small
- Model card original (README): https://huggingface.co/nvidia/stt_en_conformer_ctc_small/blob/main/README.md
- Repositorio del export ONNX (sherpa-onnx / k2-fsa): https://huggingface.co/csukuangfj/sherpa-onnx-nemo-ctc-en-conformer-small
- Registro NGC de NVIDIA: https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo/models/stt_en_conformer_ctc_small
- Variante entrenada en LibriSpeech (NGC): https://catalog.ngc.nvidia.com/orgs/nvidia/nemo/models/stt_en_conformer_ctc_small_ls
- Ficha en AI Model Zoo (BimAnt): https://zoo.bimant.com/model/218148
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
