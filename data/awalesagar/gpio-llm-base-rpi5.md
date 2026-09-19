# AwaleSagar/gpio-llm-base-rpi5

## Resumen

gpio-llm-base-rpi5 es un modelo de lenguaje de 18.770.304 parametros entrenado desde cero por AwaleSagar para una tarea muy concreta: traducir una peticion en ingles sobre los pines GPIO de una Raspberry Pi 5 a una unica accion en JSON. Por ejemplo, la entrada `User: turn on the LED on GPIO 17` produce la salida `{"action":"gpio_write","pin":17,"value":"HIGH"}`. Es la variante mas grande y precisa de la familia GPIO-LLM, que se completa con gpio-llm-pico-rpi5 y gpio-llm-nano-rpi5.

Tecnicamente es un transformer denso estilo Llama (`LlamaForCausalLM`) de 8 capas, d_model 384, 12 cabezas de atencion (head_dim 32), FFN SwiGLU de 1024, RoPE con theta 10000, RMSNorm con epsilon 1e-05 y embeddings atados. Su vocabulario es de 12.000 tokens (BPE a nivel de byte, `gpio_llm_bpe_12k`) y la longitud de contexto es de tan solo 256 tokens, coherente con su proposito: una frase de peticion mas, opcionalmente, una linea de contexto.

La relevancia del modelo es de tipo practico: demuestra que un modelo de menos de 19 millones de parametros puede resolver con mas del 93% de coincidencia exacta una tarea de salida estructurada, y puede ejecutarse en la propia Raspberry Pi 5 con un motor de inferencia en C con pesos int8, sin Python ni framework de machine learning. Forma parte del proyecto GPIO-LLM, que publica conjuntamente el codigo, el motor de inferencia y los scripts de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLM` (transformer denso, decoder-only): 8 capas, d_model 384, 12 cabezas (head_dim 32), FFN SwiGLU 1024, RoPE theta 10000, RMSNorm epsilon 1e-05, embeddings atados |
| Parametros totales | 18.770.304 |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | fp32 (safetensors) e int8 Q8_0 con grupos de 32 (fichero `base.gllm` para el motor C). No se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | `model.safetensors` (fp32) y `base.gllm` (int8 Q8_0, formato propio del motor C) |
| Vocabulario | 12.000 tokens, BPE a nivel de byte (`gpio_llm_bpe_12k`, alojado en el repo de datos) |
| Ficheros auxiliares | `gpio_llm_bpe_12k.gltk` (tokenizer para el motor C), `grammar_v2.txt` (gramatica de decodificacion) |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 19 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de estilo Llama, deliberadamente pequeno: 8 capas, 384 dimensiones de modelo, 12 cabezas de atencion de 32 dimensiones cada una, red feed-forward SwiGLU de 1024 unidades, normalizacion RMSNorm y embeddings atados entre entrada y salida. El vocabulario de 12.000 tokens y el contexto de 256 tokens estan dimensionados para el formato de la tarea, no para conversacion general.

El entrenamiento tuvo dos fases, ambas ejecutadas en una unica RTX 4090 alquilada de 24 GB con PyTorch 2.11, CUDA 12.8 y transformers 5.17. El preentrenamiento uso 550 millones de tokens de fineweb-edu-dedup (corpus SmolLM) durante 1 epoch, con 8.392 pasos de 65.536 tokens, learning rate 0.002 con decaimiento coseno en bf16; el resultado fue una perdida de validacion de 3.2956 (perplejidad 27.0) sobre 0.5 millones de tokens reservados, en 19,3 minutos. El learning rate se eligio con un barrido a 55 millones de tokens: 0.0005 dio 4.5519 de perdida, 0.001 dio 4.2294 y 0.002 dio 4.0577. La fase de SFT uso las 1.678.821 filas de entrenamiento de la configuracion v2 durante 2 epochs, con 13.116 pasos de 256 filas, learning rate 0.001 con decaimiento coseno y calculo de perdida unicamente sobre los tokens de respuesta; cada 12 pasos se reproducían 4 secuencias de 256 tokens en ingles (aproximadamente el 1,1% de los tokens de perdida) para mitigar el olvido catastrofico. La perdida final sobre tokens de respuesta en `eval_core` fue de 0.0201, con un tiempo de 13,5 minutos. No se documenta uso de RLHF ni DPO: la adaptacion al formato se hace exclusivamente por SFT supervisado.

La innovacion practica del proyecto no esta en la arquitectura, sino en el motor de inferencia: un decodificador en C que aplica una gramatica construida a partir de las etiquetas de entrenamiento, de modo que la salida siempre pertenece a una de las formas JSON del dataset. Segun los datos del autor, esto eleva el porcentaje de JSON valido del 99,96% al 100,00% en `eval_core`.

## Capacidades

- Generacion de texto muy restringida al dominio: convierte peticiones en ingles sobre pines GPIO en una unica accion JSON canonica (`gpio_write`, y otras formas presentes en el dataset).
- Salida estructurada: con el motor C y la gramatica `grammar_v2.txt` la salida es siempre uno de los esquemas JSON del dataset; con transformers en fp32 la decodificacion es libre y alcanza un 99,98% de JSON valido en el split `eval`.
- Uso de contexto opcional en la peticion, con una linea previa del tipo `Context: {"device_mappings":{"red_led":16}}` o `Context: {"available_pins":[16,17,18,25]}`, lo que permite resolver alias de dispositivos y restringir pines disponibles.
- Dialogo de aclaracion multiturno: el formato del dataset permite `Assistant: <pregunta>\nUser: <respuesta>\nAssistant:`, de modo que el modelo puede pedir aclaraciones antes de emitir la accion.
- Tool calling / function calling: no documentado como tal. La funcion equivalente la cumple el propio formato JSON de accion.
- Agentes y razonamiento multi-paso: no soportado; el modelo emite una sola accion por peticion.
- Capacidades multilingues: no disponibles; solo ingles.
- Capacidades especiales: no dispone de modo "thinking", vision ni audio. El rasgo diferencial es la decodificacion restringida por gramatica y la ejecucion en hardware embebido.
- No es una capa de seguridad: el propio autor advierte que el modelo elige una accion y que un validador deterministico debe comprobarla contra las reglas de la placa.

## Casos de uso

- Control de GPIO en Raspberry Pi 5 por lenguaje natural: el modelo recibe una frase como "turn on the LED on GPIO 17" y devuelve el JSON de accion; el motor C en int8 lo ejecuta en la propia placa sin Python ni framework de ML, lo que encaja en despliegues con recursos muy limitados.
- Domotica y prototipado rapido: un asistente local que traduzca ordenes en ingles a acciones sobre reles, ventiladores o LEDs, con el diccionario de dispositivos inyectado en la linea `Context` para mapear nombres como "fan" al pin 23.
- Puente NL a JSON en pipelines de agentes: dado su 99,98% de JSON valido en decodificacion libre, puede actuar como normalizador de intenciones delante de un orquestador que valide y ejecute las acciones.
- Automatizacion de laboratorio y bancos de pruebas: conversiones de instrucciones textuales a acciones de pin para secuencias de test reproducibles, donde el coste computacional de un modelo de 18,7M de parametros permite ejecutarlo junto al hardware bajo prueba.
- Educacion y divulgacion: es un caso de estudio completo (dataset, scripts de entrenamiento, motor de inferencia en C, gramatica) para explicar el ciclo completo de preentrenamiento, SFT y decodificacion restringida con un presupuesto de 19,3 + 13,5 minutos de GPU.
- Operacion offline y con requisitos de privacidad: al ejecutarse en local sobre la Raspberry Pi 5 con alrededor de 18,8 MB de pesos int8, no requiere conectividad ni envio de peticiones a servicios externos.
- Interfaz de voz o texto sobre hardware embebido: combinado con un modulo de reconocimiento de voz, puede cerrar el ciclo voz -> texto -> JSON -> GPIO en dispositivos sin acceso a la nube.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card y en el model-index (no verificados de forma independiente, campo `verified: false`). La coincidencia exacta compara JSON canonico (mismo objeto, orden de claves ignorado) con la etiqueta. `eval` tiene 26.297 filas generadas con 132 plantillas de fraseo que no aparecen en entrenamiento; `eval_core` es un subconjunto estratificado de 5.083 filas.

| Configuracion | Split | Coincidencia exacta | JSON valido | Ejecucion insegura* |
|---|---|---|---|---|
| PyTorch fp32, greedy | eval | 95,17% | 99,98% | 0,96% |
| PyTorch fp32, greedy | eval_core | 93,47% | 99,96% | 1,73% |
| Motor C int8, sin gramatica | eval_core | 93,51% | 99,96% | 1,73% |
| Motor C int8, con gramatica | eval_core | 93,51% | 100,00% | 1,84% |

\* Porcentaje de filas de rechazo o aclaracion (1.845 en `eval_core`) en las que el modelo produjo una accion ejecutable en lugar de una negativa. Se mide antes de aplicar cualquier validador.

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de proposito general, ni comparaciones con modelos externos.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 75 MB (18.770.304 parametros x 4 bytes). Pesos int8 del motor C (`base.gllm`): aproximadamente 18,8 MB.
- Cache KV estimada a partir de las dimensiones declaradas: unos 24 KB por token en fp32 (8 capas x 2 x 384 x 4 bytes), es decir en torno a 6 MB con los 256 tokens de contexto completo.
- GPU: cabe con enorme holgura en cualquier GPU consumer, incluidas tarjetas con 4-8 GB de VRAM. El autor entreno ambas fases en una unica RTX 4090 de 24 GB, por lo que ese es el hardware de referencia para reentrenar o hacer fine-tuning.
- Cabe en GPU consumer: si. Tambien se ejecuta directamente en la CPU de una Raspberry Pi 5 con el motor C en int8 y 4 hilos.
- Opciones de despliegue: motor C propio `gpiollm` (compilado con `make -C gpio-llm/engine`, sin Python ni framework de ML) y `transformers` con `AutoModelForCausalLM` en fp32. Los tags del repositorio marcan compatibilidad con text-generation-inference y `endpoints_compatible`, aunque no se aportan instrucciones de despliegue para esos entornos. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: la model card incluye una tabla de latencia con el motor C y la gramatica sobre las 5.083 peticiones de `eval_core` con 4 hilos, con columnas p50 y p95, pero los valores no estan presentes en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpio-llm-base-rpi5 | 18.770.304 | 256 tokens | GPIO en ingles a JSON | cc-by-4.0 | HuggingFace, safetensors fp32 + int8 para motor C |
| gpio-llm-pico-rpi5 | no disponible | no disponible | GPIO en ingles a JSON | no disponible | HuggingFace |
| gpio-llm-nano-rpi5 | no disponible | no disponible | GPIO en ingles a JSON | no disponible | HuggingFace |

El autor describe gpio-llm-base-rpi5 como la variante mas grande y precisa de las tres, sin aportar cifras de parametros, contexto ni benchmarks de las otras dos. No se dispone de datos de rendimiento ni de licencia de las variantes pico y nano, ni de comparaciones con modelos externos de proposito general o de salida estructurada.

## Limitaciones y advertencias

- No es una capa de seguridad. El propio autor lo advierte: el modelo elige una accion y un validador deterministico debe comprobarla contra las reglas de la placa antes de tocar ningun pin.
- Ejecuciones inseguras medidas antes del validador: entre el 0,96% y el 1,84% de las filas de rechazo o aclaracion de `eval_core` (1.845 filas) acabaron en una accion ejecutable en lugar de una negativa.
- Contexto muy limitado: 256 tokens, insuficiente para conversaciones largas, historiales extensos o documentos. Solo cabe la peticion mas, opcionalmente, una linea de contexto.
- Solo ingles. No hay soporte multilingue documentado, por lo que las peticiones en castellano no estan cubiertas por el entrenamiento ni por la evaluacion.
- Riesgo de alucinacion en el dominio: el modelo puede asignar pines o valores no previstos por el usuario, especialmente con decodificacion libre en fp32 (entre el 0,02% y el 0,04% de JSON invalido en los splits evaluados) y ante peticiones fuera de la distribucion de las 132 plantillas de evaluacion.
- Ambito de aplicacion muy estrecho: no es un modelo de proposito general; no cabe esperar razonamiento abierto, matematicas, codigo general ni conocimiento del mundo.
- La licencia cc-by-4.0 permite uso comercial con atribucion, pero obliga a citar la autoria y a indicar los cambios; conviene revisar el texto completo de la licencia antes de un despliegue en produccion.
- Metricas autodeclaradas y no verificadas (`verified: false`), sin replicacion independiente. El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por terceros es practicamente inexistente.
- El numero de plantillas de evaluacion es limitado (132), lo que reduce la confianza sobre el comportamiento ante fraseos muy distintos de los contemplados.
- Requiere ficheros adicionales que no estan en el repositorio de pesos: el tokenizer `gpio_llm_bpe_12k.gltk` y la gramatica `grammar_v2.txt` se descargan por separado, y el motor C hay que compilarlo desde GitHub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AwaleSagar/gpio-llm-base-rpi5
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/AwaleSagar/gpio-llm-rpi5-actions
- Repositorio GitHub del proyecto (codigo, motor C y scripts de entrenamiento): https://github.com/AwaleSagar/gpio-llm
- Variante pico: https://huggingface.co/AwaleSagar/gpio-llm-pico-rpi5
- Variante nano: https://huggingface.co/AwaleSagar/gpio-llm-nano-rpi5
- Corpus de preentrenamiento citado: HuggingFaceTB/smollm-corpus (fineweb-edu-dedup)
- La busqueda web realizada no ha devuelto enlaces adicionales relevantes sobre este modelo.
