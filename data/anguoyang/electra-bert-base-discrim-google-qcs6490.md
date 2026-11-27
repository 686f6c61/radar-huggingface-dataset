# anguoyang/electra-bert-base-discrim-google-qcs6490

## Resumen

El repositorio `anguoyang/electra-bert-base-discrim-google-qcs6490` no es un modelo nuevo, sino una ficha de medicion publicada por un tercero (usuario `anguoyang`) sobre el modelo ELECTRA BERT Base Discriminator de Google, ejecutado en el hardware Qualcomm QCS6490 del kit Dragonwing RB3 Gen 2 Vision Kit. El autor publica un unico dato de rendimiento medido mediante Qualcomm AI Hub: un tiempo de inferencia estimado de 983,9 ms para una entrada de identificadores de token de 1 × 384 mas una mascara de atencion de 1 × 384, con salida de predicciones por token de 1 × 384.

El modelo subyacente es el discriminador ELECTRA de tamano base de Google, un transformer encoder tipo BERT entrenado con el objetivo ELECTRA (deteccion de tokens reemplazados en lugar de enmascaramiento clasico). El interes de esta publicacion es acotado: documenta el primer perfil publico de este modelo en el QCS6490, ya que no existe entrada para el Dragonwing RB3 Gen 2 Vision Kit en el fichero `perf.yaml` de `qai-hub-models` 0.66.0.

No se proporcionan pesos, artefactos compilados, datos de entrenamiento, benchmarks de calidad ni informacion sobre licencia propia del repositorio. La licencia del modelo original se indica como Apache-2.0. La relevancia es, por tanto, la de un punto de referencia de despliegue en edge para un encoder BERT base, no la de un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia BERT), objetivo de entrenamiento ELECTRA (discriminador) |
| Parametros totales | no disponible (el tamano del ONNX exportado es de 438.081.406 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 tokens (longitud de entrada usada en la medicion) |
| Tipos de cuantizacion | no disponible; la medicion se realizo en fp32 ONNX con opciones de compilacion por defecto de AI Hub, sin cuantizacion explicita |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo original); el repositorio no declara licencia propia |
| Formato de pesos | no se publican pesos; el perfil se genero a partir de un ONNX exportado desde `qai-hub-models` 0.66.0 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder de la familia BERT en configuracion base, entrenado con el objetivo ELECTRA: en lugar de predecir tokens enmascarados, un generador produce sustituciones plausibles y el discriminador aprende a clasificar cada token como original o reemplazado. Esto permite entrenar con senal densa en todos los tokens de la secuencia, lo que en la literatura original mejora la eficiencia de muestreo frente a BERT clasico a igualdad de computo. El repositorio no aporta detalles sobre el numero de tokens de entrenamiento, la composicion del corpus ni si hubo fases de ajuste fino con RLHF o DPO; esa informacion corresponde a la publicacion original de Google, no incluida aqui.

La innovacion documentada en esta ficha es de despliegue, no de modelado. El autor exporto el modelo a ONNX desde la definicion `electra_bert_base_discrim_google` de `qai-hub-models` 0.66.0 y lo perfilo como un unico grafo mediante la API de Qualcomm AI Hub (`submit_inference_job(..., profile=True)`), tomando el valor `execution_summary.estimated_inference_time`. Se trata de una estimacion por grafo, no de una latencia de aplicacion extremo a extremo. El proceso se ejecuto con un arnes uniforme de tres rondas mas una ronda de reintento, dentro de un barrido de 14 categorias.

## Capacidades

- Clasificacion por token: la salida es un vector de predicciones por token (1 × 384), adecuado para tareas de deteccion de tokens sustituidos, etiquetado a nivel de token y clasificacion de secuencias derivada de la representacion del token `[CLS]`.
- Extraccion de representaciones contextuales: al ser un encoder BERT base, produce embeddings contextuales reutilizables para clasificacion, regresion y recuperacion de informacion.
- Inferencia en edge: perfilado y ejecutable sobre el Qualcomm QCS6490 mediante el runtime QNN de Qualcomm AI Hub.
- Generacion de texto: no soportada de forma nativa; es un encoder discriminador, no un modelo causal de generacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Clasificacion de texto en dispositivos edge: el modelo puede ejecutarse localmente en el QCS6490 con una latencia estimada de aproximadamente 984 ms por grafo para secuencias de 384 tokens, lo que permite filtrado y clasificacion de contenido sin salida a la nube en dispositivos IoT y kits de vision.
- Deteccion de anomalias textuales: el discriminador ELECTRA puede reutilizarse para puntuar la plausibilidad de tokens en logs o campos de formulario, marcando entradas corruptas o manipuladas en un pipeline embebido.
- Etiquetado de tokens en tiempo casi real: con 384 posiciones de entrada, encaja en tareas de reconocimiento de entidades o etiquetado morfosintactico sobre fragmentos cortos, siempre que la latencia de ~1 s sea aceptable.
- Benchmarking de hardware edge: sirve como carga de referencia reproducible para comparar el QCS6490 con otros SoC en tareas de encoder transformer, dado que el autor publica IDs de trabajo (`jgdyznmrg` para compilacion, `j5w01wrmp` para perfilado).
- Validacion de pipelines de cuantizacion y compilacion: al no aplicar cuantizacion explicita, el resultado en fp32 sirve de linea base para medir la ganancia de variantes INT8/INT16 en el mismo runtime QNN.
- Extraccion de embeddings en el dispositivo: las representaciones del encoder pueden alimentar un clasificador ligero local para moderacion de contenido o enrutamiento de consultas en asistentes embebidos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 983,9 ms (983.877 µs) |
| Entrada | token ids 1 × 384 + mascara de atencion 1 × 384 |
| Salida | predicciones por token (1 × 384) |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precision | fp32 ONNX, opciones de compilacion por defecto de AI Hub (sin cuantizacion explicita) |
| Fecha de medicion | 2026-11-27 |
| IDs de trabajo | compilacion `jgdyznmrg`, perfilado `j5w01wrmp` |

No se han publicado resultados de benchmarks de calidad (MMLU, GLUE, SQuAD u otros) en la informacion disponible. El unico dato numerico es el tiempo de inferencia por grafo descrito arriba.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se ejecuta en el acelerador del QCS6490, no en GPU discreta.
- GPU recomendadas: no aplica para el perfil publicado; el hardware objetivo es el SoC Qualcomm QCS6490 del Dragonwing RB3 Gen 2 Vision Kit.
- Cabe en GPU consumer: no disponible; no se han publicado mediciones en GPU de escritorio.
- Opciones de despliegue: runtime QNN mediante Qualcomm AI Hub; el modelo se exporta a ONNX desde `qai-hub-models` 0.66.0. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: 983,9 ms por grafo para una secuencia de 384 tokens en fp32 sin cuantizar; el autor advierte que es una estimacion por grafo y no una latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELECTRA BERT Base Discriminator (Google) | no disponible (ONNX de 438.081.406 bytes) | 384 tokens (en la medicion) | 983,9 ms en QCS6490 (fp32, QNN) | Apache-2.0 | Pesos originales via Google; este repositorio solo publica mediciones |
| BERT Base | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| Otros encoders BERT base en QCS6490 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento para alternativas en el mismo hardware dentro de la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni artefactos compilados; solo publica numeros y metodo. No es desplegable directamente desde este ID de Hugging Face.
- El dato de 983,9 ms es una estimacion por grafo (`estimated_inference_time`), no una latencia de aplicacion extremo a extremo; el rendimiento real en produccion puede diferir.
- La medicion se realizo en fp32 sin cuantizacion explicita, por lo que no representa el rendimiento de variantes cuantizadas, habituales en despliegue edge.
- La longitud de contexto documentada (384 tokens) corresponde a la entrada usada en el perfil, no necesariamente al maximo arquitectonico del modelo original.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento multilingue; al ser un encoder discriminador, no genera texto y el riesgo de alucinacion en el sentido generativo no aplica, pero si el de clasificaciones erroneas en dominios fuera de distribucion.
- La licencia Apache-2.0 corresponde al modelo original segun el autor; el repositorio de medicion no declara licencia propia, por lo que la reutilizacion de su contenido debe verificarse con el autor.
- No existe entrada para el Dragonwing RB3 Gen 2 Vision Kit en `perf.yaml` de `qai-hub-models` 0.66.0, de modo que este dato no esta validado por upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senal de uso o validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/electra-bert-base-discrim-google-qcs6490
- Coleccion de mediciones qcs-model-zoo: https://github.com/anguoyang/qcs-model-zoo
- Seguimiento del barrido qcs-bench: https://github.com/anguoyang/qcs-bench
- Qualcomm AI Hub (runtime y API de perfilado): no disponible en la informacion proporcionada
- Paper original de ELECTRA: no disponible en la informacion proporcionada
