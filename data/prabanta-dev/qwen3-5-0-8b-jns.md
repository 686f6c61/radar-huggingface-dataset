# prabanta-dev/Qwen3.5-0.8B-JNS

## Resumen

Qwen3.5-0.8B-JNS es una conversion de formato del modelo Qwen3.5-0.8B (desarrollado por el equipo Qwen de Alibaba Cloud) al formato JNS, propietario del motor de inferencia Janas. No se ha reentrenado ni podado nada: el autor, prabanta-dev, ha partido de una cuantizacion GGUF Q4_K_M ya existente (publicada por unsloth) y la ha reescrito con la herramienta `gguf2jns` en el orden de lectura que emplea el motor Janas, conservando los metadatos. El repositorio ocupa 0,5 GB y contiene un unico fichero de pesos.

La relevancia de esta ficha no esta en el modelo en si (0,8B parametros, arquitectura densa, pensado como banco de pruebas de la arquitectura Qwen3.5 y explicitamente no orientado a conversacion segun su propia model card), sino en el motor de inferencia al que acompana. Janas es un motor escrito en C orientado a equipos modestos, con o sin GPU, y esta publicacion sirve para demostrar que puede ejecutar Qwen3.5-0.8B en CPU con aceleracion integrada a velocidades competitivas frente a llama.cpp.

Segun las mediciones del propio autor sobre un portatil con Intel Core Ultra 9 185H, GPU Arc integrada y 32 GB de RAM (9-10 de octubre de 2026), Janas procesa el prompt a 547 tok/s y genera a 112 tok/s, frente a 526 y 32 tok/s de llama.cpp en la misma maquina. El modelo es, por tanto, material de evaluacion tecnica del motor, no un modelo de proposito general listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.5) |
| Parametros totales | 0,8B (nominal, segun el nombre del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen), convertida a JNS |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache License 2.0 |
| Formato de pesos | JNS (formato propietario del motor Janas; solo lo lee Janas) |

Otros datos del repositorio: tamano del repo 0,5 GB; fichero unico `qwen3.5-0.8b-q4km.jns` de 0,53 GB con SHA-256 `75a3b62c4a10cad87a7ce64bf89485cfcc564fa949f2c5af8c7051615dc26124`.

## Arquitectura y entrenamiento

Este repositorio no aporta informacion de arquitectura ni de entrenamiento propia: es una conversion de pesos. La model card indica que el modelo base Qwen3.5-0.8B es denso y lo describe como "un modelo de prueba de la arquitectura Qwen3.5, no para conversar". El modelo base, segun el equipo Qwen, es un modelo post-entrenado (fine-tune sobre Qwen3.5-0.8B-Base) y se posiciona para prototipado, ajuste fino especifico de tareas e investigacion.

En cuanto a la serie Qwen3.5, fuentes de busqueda web (repositorio no oficial ABDtmx/Qwen3.5 y la ficha de Ollama) describen una base unificada de vision y lenguaje con entrenamiento de fusion temprana sobre billones de tokens multimodales, con paridad, segun estas fuentes, frente a Qwen3 y superacion de los modelos Qwen3-VL en razonamiento, codigo, agentes y comprension visual. No se dispone de confirmacion de que estas capacidades se apliquen a la variante 0,8B concreta; se ofrece solo como referencia de la familia.

La innovacion tecnica relevante de esta publicacion es de infraestructura, no de modelado: el pipeline de conversion `gguf2jns` reordena los tensores de un GGUF Q4_K_M al orden de lectura que espera Janas, de modo que el motor puede cargar y ejecutar los pesos sin reentrenamiento. Janas esta implementado en C y esta disenado tanto para CPU pura como para CPU con GPU integrada.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base Qwen3.5-0.8B; el pipeline declarado es `text-generation`.
- Razonamiento: la model card no documenta modos de razonamiento especificos para esta variante; la fuente de Modal indica que, en modo thinking, la variante 0,8B es mas propensa a bucles de pensamiento que otros modelos Qwen3.5, y recomienda parametros de muestreo ajustados y generacion en streaming.
- Vision: fuentes de la serie Qwen3.5 describen una base unificada de vision-lenguaje; no se confirma para la variante 0,8B en JNS.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada; el repositorio no declara idiomas.
- Capacidad especial: ejecucion en CPU y en GPU integrada (Arc) mediante el motor Janas, con lectura de prompt a 547 tok/s y generacion a 112 tok/s en el equipo de referencia.

Nota importante: la model card del modelo base, recogida en este repositorio, califica el 0,8B como modelo de prueba de arquitectura y no para conversacion.

## Casos de uso

- Evaluacion de motores de inferencia: usar este repositorio como banco de pruebas para comparar Janas contra llama.cpp sobre exactamente los mismos pesos cuantizados, midiendo prompt processing y generacion en tokens por segundo.
- Inferencia en portatiles sin GPU dedicada: desplegar Janas con este modelo en equipos con CPU moderna (por ejemplo Intel Core Ultra) aprovechando la aceleracion de la GPU integrada, ya que los pesos Q4_K_M ocupan 0,53 GB y caben en memoria RAM sin problemas.
- Prototipado rapido de aplicaciones de texto: emplear el modelo para validar pipelines de generacion, plantillas de prompt y flujos de preprocesado antes de escalar a un modelo mayor de la familia Qwen3.5.
- Ajuste fino especifico de tareas: al ser un modelo pequeno con licencia Apache 2.0, sirve como base para experimentos de fine-tuning en dominios acotados, siempre que se trabaje sobre el modelo original y no sobre el fichero JNS.
- Investigacion sobre cuantizacion y formatos: analizar como se comporta una cuantizacion Q4_K_M tras el reordenado a JNS, comparando fidelidad y velocidad frente al GGUF original.
- Entornos con recursos muy limitados: ejecutar un modelo de 0,8B en CPU en maquinas sin GPU dedicada ni aceleradores, donde llama.cpp genera a 32 tok/s frente a los 112 tok/s reportados por Janas en el mismo equipo.
- Educacion y demostraciones: mostrar el funcionamiento de un motor de inferencia en C y el flujo de conversion de formatos a estudiantes o desarrolladores.

## Benchmarks y rendimiento

Unicos datos publicados en la informacion disponible: comparativa de velocidad entre Janas y llama.cpp sobre el mismo portatil (Intel Core Ultra 9 185H, GPU Arc integrada, 32 GB de RAM), medida el 9-10 de octubre de 2026 con `janas-bench --prompt 1024 --gen 16` y `llama-bench -p 1024 -n 16`.

| Metrica (mismo portatil) | Janas | llama.cpp |
|---|---:|---:|
| Lectura de prompt de 1.024 tokens | 547 tok/s | 526 tok/s |
| Escritura (16 tokens) | 112 tok/s | 32 tok/s |

El autor advierte de que son mediciones de una sola ronda, en la mejor configuracion de cada motor, y que en otras maquinas las cifras seran distintas. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos Q4_K_M ocupan 0,53 GB; sumando overhead del motor y contexto, el modelo funciona con comodidad en 2 GB de memoria.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo con mas de 2 GB de VRAM; el caso medido usa solo GPU integrada Intel Arc.
- Funciona en CPU pura: si, es uno de los objetivos de diseno de Janas (etiquetas `cpu-inference` y `local-inference`).
- Plataformas soportadas: Janas se distribuye para Linux x86-64 (Ubuntu 22.04, Debian 12 y posteriores).
- Opciones de despliegue: exclusivamente el motor Janas mediante `janas-get` y `janas-chat`; los ficheros JNS solo los lee Janas. Para vLLM, llama.cpp, Ollama o TGI habria que usar el GGUF original de unsloth, no esta conversion.
- Latencia y throughput: 547 tok/s en lectura de prompt y 112 tok/s en generacion en el equipo de referencia (Core Ultra 9 185H, Arc integrada, 32 GB).

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prabanta-dev/Qwen3.5-0.8B-JNS | 0,8B | No disponible | 547 / 112 tok/s (Janas, equipo de referencia) | Apache 2.0 | Solo motor Janas |
| unsloth/Qwen3.5-0.8B-GGUF (origen de la conversion) | 0,8B | No disponible | 526 / 32 tok/s (llama.cpp, mismo equipo) | Segun el repositorio de origen | GGUF, amplia compatibilidad |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | No disponible | No disponible | Apache 2.0 | Pesos originales |
| prabanta-dev/Qwen3.5-9B-JNS | 9B (nominal) | No disponible | No disponible | Apache 2.0 (segun patron del repositorio) | Solo motor Janas |

La comparacion real de interes es de motor, no de modelo: el mismo fichero GGUF Q4_K_M rinde de forma muy distinta en Janas (112 tok/s de generacion) y en llama.cpp (32 tok/s) en el equipo medido. No se dispone de modelos comparables adicionales con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo para conversacion: la propia model card lo describe como modelo de prueba de la arquitectura Qwen3.5, "no para chatear".
- Propension a bucles de pensamiento: la fuente de Modal senala que, en modo thinking, la variante 0,8B es mas propensa a bucles que otros modelos Qwen3.5 y recomienda parametros de muestreo ajustados y streaming para cortar generaciones desbocadas.
- Riesgo de alucinacion: no se documenta mitigacion especifica; en un modelo de 0,8B el riesgo de fabricacion de datos es elevado, aunque no se aportan mediciones concretas.
- Idiomas: no declarados en el repositorio; no se puede garantizar cobertura multilingue.
- Contexto: no se especifica la longitud de contexto soportada por la conversion JNS.
- Restricciones de licencia: los pesos se distribuyen bajo Apache License 2.0, igual que el modelo original. El motor Janas esta bajo GPL-3.0-or-later, pero el autor aclara expresamente que la licencia del motor no se aplica a estos ficheros. Se debe conservar la atribucion a Qwen (Alibaba Cloud) y a unsloth como cuantizador.
- Portabilidad: los ficheros JNS solo los lee el motor Janas y solo se ofrece binario para Linux x86-64; quedan fuera Windows, macOS y ARM sin compilacion desde fuentes.
- Madurez: el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y una unica conversion publicada; no hay validacion independiente del comportamiento mas alla de las cifras de velocidad del autor.
- Mediciones: los datos de throughput son de una sola ronda, en la mejor configuracion de cada motor, y no son extrapolables a otros equipos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prabanta-dev/Qwen3.5-0.8B-JNS
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- GGUF de origen (unsloth): https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Motor Janas (GitHub, GPL-3.0-or-later): https://github.com/prabanta-dev/janas
- Repositorio hermano de mayor tamano: https://huggingface.co/prabanta-dev/Qwen3.5-9B-JNS
- Ficha en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Ficha en Modal: https://modal.com/library/qwen/qwen3-5-0-8b
- Repositorio no oficial de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
