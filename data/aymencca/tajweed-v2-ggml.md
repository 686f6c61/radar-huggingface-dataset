# Aymencca/tajweed-v2-ggml

## Resumen

tajweed-v2-ggml es una conversion al formato GGML del modelo Hisnlabs/tajweed-v2, un sistema de reconocimiento automatico del habla especializado en recitacion coranica con marcado de tajwid (las reglas de pronunciacion del arabe clasico). El modelo original combina un encoder de Whisper-base con cabezas CTC que transcriben el audio a la notacion fonetica coranica, y esta version lo empaqueta para ejecutarse con whisper.cpp, lo que permite inferencia en dispositivos moviles sin dependencias pesadas.

El autor, Aymencca, publica dos ficheros: el encoder cuantizado en q8_0 con un decoder ficticio de una capa que whisper.cpp exige para cargar el modelo (nunca se ejecuta) y una cabeza CTC de fonemas en float32. La conversion mantiene una fidelidad alta respecto al modelo ONNX int8 original: segun la model card, la discrepancia es del 0,40 % de simbolos sobre una evaluacion de 60 aleyas recitadas por 5 recitadores.

El interes practico reside en que reduce un modelo de reconocimiento fonetico especializado a un binario de unos 29,7 MB, viable en telefonos, y con licencia Apache-2.0. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamano declarado del repo es de 0,0 GB y no se publican benchmarks estandar ni datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo Whisper-base + cabezas CTC (fonemas); decoder ficticio de una capa solo para compatibilidad con whisper.cpp |
| Parametros totales | no disponible (el fichero del encoder pesa 29.717.718 bytes en q8_0) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la model card indica ejecutar el encoder sobre la longitud real del audio, sin padding de 30 s |
| Tipos de cuantizacion | q8_0 para el encoder; cabezas CTC en float32 |
| Idiomas soportados | arabe (recitacion coranica, escritura fonetica con reglas de tajwid) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (`ggml-tajweed-v2-q8_0.bin` y `heads.bin`) |

## Arquitectura y entrenamiento

La arquitectura parte de Hisnlabs/tajweed-v2: un encoder basado en Whisper-base que procesa el audio y alimenta cabezas CTC que emiten la transcripcion fonetica coranica. En la conversion GGML, el autor integra el embedding de Hafs (la lectura coranica de referencia) sumandolo al embedding posicional, en lugar de anadirlo a cada frame antes de las capas como hace el modelo original. El fichero incluye ademas un decoder de una sola capa que nunca se ejecuta, necesario unicamente porque whisper.cpp lo requiere para cargar el grafo.

La cabeza CTC de fonemas se distribuye por separado en `heads.bin`: 43 pesos de 512 dimensiones en float32 seguidos de 43 sesgos, es decir, un vocabulario de salida de 43 simbolos foneticos. La inferencia debe realizarse sobre la longitud real del audio con atencion en float32, sin el padding estandar de 30 segundos de Whisper.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el uso de RLHF/DPO ni otras innovaciones del modelo base en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla en arabe coranico con salida en escritura fonetica que refleja las reglas de tajwid.
- Transcripcion de recitacion a nivel de fonema mediante cabeza CTC de 43 clases.
- Ejecucion en dispositivos moviles gracias al formato GGML y a whisper.cpp.
- Procesamiento de audio de duracion variable sobre la longitud real (sin padding fijo de 30 s).
- Compatibilidad con el ecosistema whisper.cpp para carga del modelo.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Aplicaciones moviles de aprendizaje del Coran: el modelo puede transcribir la recitacion del usuario a notacion fonetica y compararla con la referencia para detectar errores de pronunciacion, gracias a sus 29,7 MB en q8_0 que caben en un telefono.
- Correccion de tajwid en tiempo real: integrado en una app de escritorio o movil, permite senalar al recitador donde incumple reglas de pronunciacion a partir de la salida CTC.
- Herramientas de memorizacion (hifz): transcripcion fonetica de sesiones de repaso para generar registros de progreso y comparativas entre intentos.
- Investigacion en procesamiento de habla arabe clasica: corpus foneticos etiquetados automaticamente para estudios de fonetica o entrenamiento de modelos posteriores.
- Verificacion de calidad de recitaciones grabadas: pipeline por lotes que transcribe y compara contra el texto canonico para control de calidad editorial.
- Despliegue en entornos sin GPU ni conexion: al ejecutarse con whisper.cpp en CPU, sirve para dispositivos embebidos o escenarios offline donde no es viable un servicio en la nube.
- Prototipado rapido de asistentes de recitacion: la licencia Apache-2.0 y el formato GGML facilitan integrar el modelo en demos y productos sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion es la fidelidad de la conversion: sobre 60 aleyas de 5 recitadores, la salida difiere del modelo ONNX int8 original en el 0,40 % de los simbolos.

| Metrica | Valor |
|---|---|
| Discrepancia de simbolos frente a ONNX int8 | 0,40 % (60 aleyas, 5 recitadores) |
| Tamano del encoder q8_0 | 29.717.718 bytes |
| Tamano de heads.bin | 88.236 bytes |
| Vocabulario de salida CTC | 43 simbolos |

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el encoder q8_0 ocupa unos 29,7 MB en disco y las cabezas 88 KB, por lo que la huella en memoria es muy reducida y cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con suficiente memoria para el grafo de whisper.cpp es valida (desde GTX 1050 en adelante), asi como CPU.
- Cabe en GPU consumer: si, con amplio margen, dado el tamano del modelo.
- Opciones de despliegue: whisper.cpp (formato nativo); no se documenta soporte para vLLM, TGI, Ollama ni llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada. La comparacion se limita a lo documentado:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Aymencca/tajweed-v2-ggml | no disponible | no disponible | Apache-2.0 | GGML (q8_0) |
| Hisnlabs/tajweed-v2 (base) | no disponible | no disponible | Apache-2.0 | no disponible (original; existe variante ONNX int8) |
| Whisper-base (OpenAI) | 74 M | 30 s por ventana | MIT | safetensors, GGML, etc. |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en arabe coranico; no es un ASR general y su uso fuera de ese dominio no esta validado.
- La salida es escritura fonetica con reglas de tajwid, no texto arabe estandar, lo que exige postprocesado para muchos casos de uso.
- El decoder incluido es ficticio y nunca debe ejecutarse; la carga depende de whisper.cpp y del uso correcto del encoder sobre la longitud real del audio.
- La integracion del embedding de Hafs difiere de la del modelo original (sumado al posicional en lugar de a cada frame), lo que puede introducir desviaciones adicionales frente a la referencia.
- Riesgo de alucinacion y errores en recitaciones con ruido, dialectos o velocidad atipica: no se documentan evaluaciones en condiciones adversas.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la consulta; el tamano declarado del repo (0,0 GB) no concuerda con los ficheros descritos.
- Licencia Apache-2.0 permite uso comercial, pero no se detallan restricciones adicionales del modelo base ni de los datos de entrenamiento.
- No hay informacion sobre sesgos, cobertura de recitadores, genero o edad de las voces evaluadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Aymencca/tajweed-v2-ggml
- Modelo base: https://huggingface.co/Hisnlabs/tajweed-v2
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
