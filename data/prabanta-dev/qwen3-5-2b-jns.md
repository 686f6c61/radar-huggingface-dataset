# prabanta-dev/Qwen3.5-2B-JNS

## Resumen

Qwen3.5-2B-JNS es una conversion de pesos del modelo Qwen3.5-2B de Alibaba Cloud (equipo Qwen) al formato JNS, el formato propio del motor de inferencia Janas, mantenido por el usuario prabanta-dev. No se ha reentrenado ni podado nada: el repositorio contiene una version cuantizada del GGUF publicado por Unsloth (Qwen3.5-2B-Q4_K_M), reescrita en el orden de lectura que espera Janas, junto con el bloque de prediccion multi-token (MTP) extraido del checkpoint original y cuantizado a Q4_K. El resultado es un modelo denso de aproximadamente 2.000 millones de parametros, orientado a inferencia local en CPU y GPU integrada.

Su interes practico esta en el objetivo del proyecto: ejecutar un modelo de 2B en ordenadores convencionales mediante un motor escrito en C que no depende de CUDA ni de Python. El bloque MTP se reutiliza como borrador para decodificacion especulativa, de modo que en las mediciones del autor la generacion pasa de 52 a 67 tok/s en un portatil con Intel Core Ultra 9 185H, GPU Arc integrada y 32 GB de RAM. Como contrapartida, los archivos solo los lee Janas: no son compatibles con llama.cpp, Ollama, vLLM ni ningun otro runtime.

El repositorio es muy reciente (creado el 11 de octubre de 2026), no acumula descargas ni valoraciones y no publica resultados de benchmarks de calidad, solo cifras de velocidad. Conviene tratarlo como una pieza de infraestructura de inferencia mas que como un modelo nuevo con capacidades propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con bloque de prediccion multi-token (MTP); numero de capas, tipo de atencion y activaciones no disponibles |
| Parametros totales | ~2.000 millones (deducido del nombre del modelo base Qwen3.5-2B); cifra exacta no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (pesos principales), Q4_K (bloque MTP) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | JNS (formato del motor Janas), convertido desde GGUF |
| Tamano del repositorio | 1,3 GB |
| Modelo base | Qwen/Qwen3.5-2B (Alibaba Cloud) |

## Arquitectura y entrenamiento

Los dos archivos que componen el repositorio no incorporan ningun entrenamiento adicional. El primero, `qwen3.5-2b-q4km.jns` (1,28 GB), es el GGUF `Qwen3.5-2B-Q4_K_M.gguf` de Unsloth, ya cuantizado por sus autores, reescrito por la herramienta `gguf2jns` de Janas en el orden de lectura que el motor espera, con la metadata trasladada tal cual. El segundo, `qwen3.5-2b-mtp-q4k.jns` (0,05 GB), contiene los tensores de prediccion multi-token del checkpoint original de Qwen, que no estaban presentes en el GGUF, extraidos y cuantizados a Q4_K mediante `hf2jns_mtp`.

La innovacion tecnica destacable no esta en el modelo sino en el uso que hace Janas de ese bloque MTP: se emplea como borrador dentro de un esquema de decodificacion especulativa, en el que el borrador propone los siguientes tokens y el modelo principal los verifica. Segun el autor, esto produce el mismo texto a mayor velocidad en conversacion (67 tok/s frente a 52 tok/s sin borrador). No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3.5-2B.
- Llamada a herramientas (tool calling): el autor describe el modelo base como denso y con buen comportamiento en llamadas a herramientas, si bien no se aportan evaluaciones que lo cuantifiquen.
- Decodificacion especulativa mediante el bloque MTP incluido en el repositorio.
- Inferencia en CPU y en GPU integrada, sin necesidad de tarjeta grafica dedicada.
- Capacidades multimodales, de razonamiento, de codigo o de matematicas: no disponibles en la informacion proporcionada, aunque la familia Qwen3.5 las incorpora en otros tamanos.
- Soporte multilingue: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la ficha del autor.

## Casos de uso

- Asistente de chat sin conexion: al ocupar 1,3 GB y poder ejecutarse en CPU, permite desplegar un asistente conversacional en un portatil sin dependencia de servicios en la nube ni de GPU dedicada.
- Automatizacion de tareas con llamada a herramientas: el modelo puede invocarse desde scripts locales para consultar APIs, manipular ficheros o encadenar acciones, aprovechando el soporte de tool calling del modelo base.
- Copiloto de codigo en el puesto de trabajo: con 2.000 millones de parametros y una velocidad de 52 a 67 tok/s en un Core Ultra 9 185H, resulta viable para autocompletado y explicacion de fragmentos en un editor integrado.
- Prototipado de pipelines de IA generativa: sirve para validar prompts, plantillas y flujos de agentes antes de escalar a modelos mayores, con un coste de hardware minimo.
- Clasificacion y resumen de documentos en el dispositivo: al no salir los datos del equipo, encaja en escenarios con requisitos de privacidad, como notas internas o correspondencia.
- Docencia e investigacion en inferencia: el par de ficheros JNS y su comparacion con llama.cpp permiten estudiar el efecto de la decodificacion especulativa y del formato de pesos en el rendimiento real.
- Despliegue en entornos con hardware restringido: equipos sin GPU discreta, mini-PC o portatiles de gama media pueden ejecutar el modelo dentro de los 32 GB de memoria del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta mediciones de velocidad obtenidas los dias 9 y 10 de octubre de 2026 en un portatil con Intel Core Ultra 9 185H, GPU Arc integrada y 32 GB de memoria.

| Medicion en el mismo portatil | Janas | llama.cpp |
|---|---:|---:|
| Lectura de un prompt de 1.024 tokens | 441 tok/s | 323 tok/s |
| Escritura (16 tokens) | 52 tok/s | 28 tok/s |
| Escritura en chat, con bloque borrador propio | 67 tok/s | no medido |

Las cifras de Janas corresponden a `janas-bench --prompt 1024 --gen 16` y las de llama.cpp a `llama-bench -p 1024 -n 16`, ambas en su mejor configuracion. Los datos del borrador son la media de tres rondas. El propio autor advierte que en otras maquinas las cifras variaran.

## Requisitos de hardware

- VRAM o RAM estimada para inferencia: aproximadamente 1,33 GB de pesos (1,28 GB del Q4_K_M mas 0,05 GB del bloque MTP), por lo que un presupuesto de 1,5 a 2 GB de memoria es suficiente junto con el espacio del contexto y de las estructuras del motor.
- GPU recomendadas: no se especifican. Las mediciones se realizaron con la GPU Arc integrada de un Intel Core Ultra 9 185H, es decir, sin GPU discreta.
- Compatibilidad con GPU de consumo: si, cabe sobradamente en cualquier GPU de consumo actual y tambien en equipos sin GPU dedicada.
- Opciones de despliegue: exclusivamente el motor Janas, disponible para Linux x86-64 (Ubuntu 22.04, Debian 12 y posteriores) en forma de binario precompilado o compilado desde fuentes. Los ficheros JNS no se pueden cargar en llama.cpp, Ollama, vLLM ni TGI; para esos runtimes habria que usar el GGUF de origen.
- Latencia y throughput: 441 tok/s de prefill y 52 tok/s de generacion en el equipo de referencia, que suben a 67 tok/s de generacion en chat al emplear el bloque MTP como borrador.
- Instalacion: `janas-get qwen3.5-2b` descarga y verifica los ficheros contra sus huellas SHA-256; `janas-chat qwen3.5-2b` inicia la conversacion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Runtime | Rendimiento publicado |
|---|---|---|---|---|---|---|
| prabanta-dev/Qwen3.5-2B-JNS (este) | ~2B (denso) | JNS, Q4_K_M + Q4_K | no disponible | Apache 2.0 | Janas | 441 tok/s prefill, 52-67 tok/s generacion (Core Ultra 9 185H) |
| Qwen/Qwen3.5-2B (original) | ~2B (denso, con MTP) | safetensors (presumiblemente) | no disponible | Apache 2.0 | Transformers y otros | no disponible |
| unsloth/Qwen3.5-2B-GGUF | ~2B (denso) | GGUF, Q4_K_M entre otras | no disponible | Apache 2.0 | llama.cpp, Ollama y compatibles | 323 tok/s prefill, 28 tok/s generacion (mismo equipo, via llama.cpp) |
| qwen3.5:2b (catalogo de Ollama) | ~2B | GGUF gestionado por Ollama | no disponible | Apache 2.0 | Ollama | no disponible |

La comparacion solo resulta informativa en cuanto al formato y al runtime, porque no hay datos publicados de calidad (MMLU, HumanEval y similares) para ninguno de los cuatro. El modelo original y el GGUF de Unsloth comparten pesos con esta conversion; la diferencia estriba en el motor de ejecucion y en el uso del bloque MTP como borrador especulativo.

## Limitaciones y advertencias

- Compatibilidad restringida: los ficheros JNS solo los lee el motor Janas. No se pueden cargar en llama.cpp, Ollama, vLLM, TGI ni en bibliotecas de Python habituales. Para esos entornos hay que recurrir al GGUF original.
- Ausencia de evaluacion de calidad: no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, de modo que no es posible comparar su calidad con la de alternativas de tamano similar.
- Riesgo de alucinacion propio de un modelo de 2.000 millones de parametros, especialmente en tareas de razonamiento largo, matematicas o conocimiento factual especializado.
- Longitud de contexto e idiomas soportados no documentados: no se puede garantizar el comportamiento en conversaciones largas ni en idiomas distintos del ingles o el chino sin verificacion previa.
- Madurez del proyecto: el repositorio se creo el 11 de octubre de 2026, no tiene descargas ni valoraciones y depende de un motor en desarrollo activo, por lo que la interfaz y el formato pueden cambiar.
- Las cifras de rendimiento proceden de una unica maquina y de mediciones del propio autor; no son reproducibles de forma general y variaran segun CPU, GPU y configuracion.
- Licencia: los pesos se distribuyen bajo Apache 2.0, lo que permite uso comercial y modificacion con atribucion. Conviene no confundirla con la del motor Janas, que es GPL-3.0-or-later y no se aplica a estos ficheros.
- Atribucion obligatoria: al ser una obra modificada de Qwen3.5-2B, debe conservarse la mencion a Alibaba Cloud (equipo Qwen) y a los autores de la cuantizacion GGUF original.

## Enlaces

- Repositorio del modelo: https://huggingface.co/prabanta-dev/Qwen3.5-2B-JNS
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- GGUF de origen: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Motor Janas (codigo fuente y README): https://github.com/prabanta-dev/janas
- Perfil del autor: https://huggingface.co/prabanta-dev
- Version en el catalogo de Ollama: https://ollama.com/library/qwen3.5:2b
- Guia de la familia Qwen 3.5 y precios de API: https://kissapi.ai/blog/qwen-3-5-api-complete-guide-2026.html
- Analisis tecnico de la serie Qwen3.5 (Flash, 27B, 35B-A3B): https://explore.n1n.ai/blog/qwen3-5-model-series-2026-guide-2026-02-25
