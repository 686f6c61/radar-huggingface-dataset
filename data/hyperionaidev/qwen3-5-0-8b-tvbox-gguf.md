# hyperionaidev/Qwen3.5-0.8B-tvbox-GGUF

## Resumen

Qwen3.5-0.8B-tvbox-GGUF es una cuantizacion GGUF del modelo Qwen3.5-0.8B de Alibaba Qwen, publicada por el desarrollador independiente hyperionaidev dentro del proyecto smolmaxxing. No se trata de un modelo nuevo, sino de un fichero optimizado especificamente para ejecutar un LLM de 819 millones de parametros en hardware de gama extremadamente baja, en concreto una Xiaomi TV Box S de tercera generacion con cuatro nucleos Cortex-A55 y aproximadamente 1 GB de RAM util.

La relevancia de esta publicacion no reside en el modelo base, sino en la ingenieria de cuantizacion y poda aplicada: usa Q4_K puro en todos los tensores (incluidos embedding y cabeza de salida) con una imatrix de unsloth, y recorta la cabeza de salida de 248.320 filas a 65.672 filas seleccionadas por frecuencia de token en un corpus ingles y multilingue. El resultado es un fichero de 474 MB que alcanza 16,8 tok/s de generacion y 33 tok/s de procesamiento de prompt en esa TV box, frente a los 7,5 tok/s del Q4_K_M estandar, con un consumo de 566 MB de RSS.

El precio de esta optimizacion es una dependencia estricta de un llama.cpp parcheado del repositorio smolmaxxing: el fichero incluye un tensor `output_ids` y una cabeza podada que las distribuciones estandar de llama.cpp, LM Studio y Ollama no pueden cargar. Es, por tanto, un artefacto de nicho para despliegue en dispositivos embebidos, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; incluye estado DeltaNet segun el comando de ejecucion del autor) |
| Parametros totales | 819.706.824 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de ejecucion usa `-c 1024` |
| Tipos de cuantizacion | Q4_K puro en todos los tensores (embedding, cabeza y resto), con imatrix |
| Idiomas soportados | No disponible (la cabeza podada se selecciono sobre corpus ingles y multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`q08-q4k-h65p8.gguf`, 474 MB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer de 819 millones de parametros. La model card del artefacto cuantizado menciona un estado DeltaNet en fp16 (`LLAMA_STATE_F16=1`), lo que sugiere que la arquitectura del modelo base incorpora componentes de atencion lineal o hibridos junto con atencion estandar, aunque no se detalla la composicion exacta de capas en la informacion disponible. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovacion tecnica de esta publicacion es la cuantizacion y poda de la cabeza de salida. Partiendo de la conversion BF16 y la imatrix de unsloth, se aplica Q4_K a todos los tensores y se recorta la cabeza de 248.320 filas a 65.672, seleccionadas por frecuencia de token en un corpus ingles y multilingue y redondeadas a multiplo de 8 para que el backend de CPU pueda repaquetar la matriz. Se anade un tensor `output_ids` que mapea los indices podados al vocabulario original. Los prompts pueden usar cualquier token del vocabulario completo, pero el modelo solo puede generar tokens presentes en la cabeza podada; aproximadamente el 1,3 % de los tokens de referencia caen fuera de ella. El autor reporta una perplejidad en ingles de aproximadamente 1,00 bits por byte sobre un texto fijo de 22 KB, frente a 1,024 del Q4_0 estandar de vocabulario completo, si bien la metrica no es estrictamente comparable al medirse solo sobre las posiciones de la cabeza podada.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el uso de `--reasoning off` en el comando de ejemplo indican soporte de dialogos multi-turno y un modo de razonamiento desactivable.
- Razonamiento basico a escala de 0,8B parametros, limitado por el tamano del modelo.
- Generacion de codigo y matematicas elementales: capacidad heredada del modelo base, sin datos de benchmarks especificos en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; el contexto de ejecucion de ejemplo (1024 tokens) es muy reducido para flujos agenticos.
- Capacidades multilingues: la seleccion de la cabeza se hizo sobre un corpus ingles y multilingue, pero no se detalla la lista de idiomas ni su cobertura.
- Modo thinking: el flag `--reasoning off` sugiere que el modelo base expone un modo de razonamiento, aunque en este despliegue se recomienda desactivarlo.

## Casos de uso

- Asistentes de voz o texto en dispositivos embebidos: con 566 MB de RSS y 16,8 tok/s en una TV box de 1 GB de RAM, el modelo puede alimentar interfaces conversacionales locales en decodificadores, televisores o placas SBC sin conexion a la nube.
- Clasificacion y extraccion de informacion en el borde: resumen de textos cortos, extraccion de entidades o etiquetado de contenido en local, donde la latencia de red o la privacidad de los datos descartan APIs externas.
- Automatizacion de hogar con lenguaje natural: interpretacion de comandos de voz o texto para domotica en hardware de bajo coste, aprovechando el bajo consumo de memoria.
- Prototipado y educacion en LLMs: el fichero y el repositorio smolmaxxing permiten experimentar con cuantizacion, poda de vocabulario y optimizacion de kernels en hardware asequible, con metricas reproducibles de tokens por segundo y bits por byte.
- Generacion de texto offline en entornos sin conectividad: subtitulos, descripciones o respuestas automaticas en kioscos, puntos de venta o equipos industriales aislados.
- Banquito de pruebas para tecnicas de compresion: la comparacion directa entre el Q4_K_M estandar (7,5 tok/s) y este fichero (16,8 tok/s) sirve para evaluar el impacto de la poda de cabeza y el repaquetado de matrices en el backend de CPU de llama.cpp.

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones de rendimiento y calidad del autor sobre la Xiaomi TV Box S (3rd Gen), no benchmarks academicos estandar.

| Metrica | Este fichero (Q4_K, cabeza 65,7K) | Q4_K_M estandar | Q4_0 vocabulario completo |
|---|---|---|---|
| Generacion | 16,8 tok/s | 7,5 tok/s | No disponible |
| Procesamiento de prompt | 33 tok/s | No disponible | No disponible |
| Calidad (bits/byte, menor es mejor) | ~1,00 | No disponible | 1,024 |
| RAM (RSS) | 566 MB | No disponible | No disponible |
| Tamano de fichero | 474 MB | No disponible | No disponible |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 566 MB de RSS medidos en la TV box; el fichero ocupa 474 MB en disco. En GPU, la huella seria similar o inferior segun el backend.
- GPU recomendadas: no se documentan; el artefacto esta pensado para CPU ARM de cuatro nucleos Cortex-A55. Cualquier GPU consumer moderna (RTX 3060 en adelante) ejecutaria el modelo con holgura, pero sin datos de rendimiento publicados.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1 GB de memoria libre, aunque no es el objetivo del artefacto.
- Opciones de despliegue: exclusivamente llama.cpp parcheado del repositorio smolmaxxing (llama.cpp en el commit `8642541` con `patches/llama.cpp-v0.8.0-tvbox.patch`). Stock llama.cpp, LM Studio y Ollama no pueden cargar el fichero por la cabeza podada y el tensor `output_ids`.
- Latencia y throughput: 16,8 tok/s de generacion y 33 tok/s de prompt en la Xiaomi TV Box S (3rd Gen) con `-t 3 -c 1024 -ub 128 -b 128 --reasoning off` y `LLAMA_STATE_F16=1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-tvbox-GGUF (este) | 819,7 M | No disponible (ejemplo con 1024) | 16,8 tok/s en TV box; ~1,00 bits/byte | Apache-2.0 | GGUF con llama.cpp parcheado |
| Qwen3.5-0.8B (base, BF16) | 819,7 M | No disponible | No disponible | Apache-2.0 | Pesos originales en Hugging Face |
| unsloth/Qwen3.5-0.8B-GGUF | 819,7 M | No disponible | No disponible | Apache-2.0 | GGUF estandar (llama.cpp, Ollama, LM Studio) |
| Qwen3.5-0.8B Q4_K_M estandar | 819,7 M | No disponible | 7,5 tok/s en la misma TV box | Apache-2.0 | GGUF estandar |

No se dispone de datos de benchmarks comparativos con otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de un runtime parcheado: el fichero no carga en llama.cpp estandar, LM Studio ni Ollama; requiere compilar el fork de smolmaxxing con el parche `llama.cpp-v0.8.0-tvbox.patch`.
- Vocabulario de generacion restringido: la cabeza podada a 65.672 filas impide generar aproximadamente el 1,3 % de los tokens de un corpus de referencia; prompts con tokens fuera de la cabeza pueden degradar la coherencia.
- Calidad de cuantizacion: Q4_K puro en embedding y cabeza, aunque con imatrix, introduce perdida frente a BF16; la metrica de ~1,00 bits/byte no es directamente comparable con puntuaciones de vocabulario completo.
- Contexto reducido en el ejemplo de ejecucion: la configuracion recomendada usa `-c 1024`, insuficiente para tareas de contexto largo o razonamiento multi-paso.
- Sesgos y alucinacion: no se documentan evaluaciones de sesgo ni tasas de alucinacion; a 0,8B parametros, la fiabilidad factua es limitada y no apta para produccion sin verificacion.
- Idiomas: no se especifica la lista de idiomas soportados ni la cobertura de la cabeza podada por idioma; el castellano podria tener cobertura reducida si los tokens frecuentes en espanol no entraron en la seleccion.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B y el runtime llama.cpp tienen sus propias condiciones que deben verificarse.
- Madurez: 446 descargas y 0 likes en el momento de la consulta; proyecto experimental de un autor individual, sin garantias de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/hyperionaidev/Qwen3.5-0.8B-tvbox-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Conversion BF16 e imatrix: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Repositorio smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Documento de experimentos: https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- Scoreboard del proyecto: https://github.com/hyperionaidev/smolmaxxing#scoreboard
- Guia de inicio rapido: https://github.com/hyperionaidev/smolmaxxing#quick-start
- llama.cpp: https://github.com/ggml-org/llama.cpp
