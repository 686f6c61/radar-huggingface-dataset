# dvsoft/verbale-lima

## Resumen

Verbale Lima 0.8B es un modelo de lenguaje pequeno especializado en la limpieza de texto dictado en italiano. Lo desarrolla dvsoft como componente del motor de limpieza de su aplicacion Verbale para macOS, una herramienta de transcripcion de reuniones y dictados que procesa el audio integramente en local sin enviarlo a servidores externos. El modelo resuelve un problema concreto y acotado: convertir la salida cruda de Whisper, llena de vacilaciones, repeticiones, arranques en falso y errores de transcripcion, en texto limpio con puntuacion y mayusculas correctas, sin alterar el contenido ni el orden de las palabras.

Tecnicamente es un ajuste LoRA fusionado sobre Qwen3.5-0.8B, con 772.845.888 parametros totales y una unica publicacion en formato GGUF con cuantizacion Q8_0 (834 MB). No es un modelo conversacional ni de razonamiento general: esta disenado para una tarea de reescritura controlada con un mensaje de sistema fijo y temperatura 0, de modo que no responde a las peticiones que aparezcan dentro del texto dictado.

Su relevancia actual radica en el enfoque de privacidad y eficiencia: un modelo de menos de mil millones de parametros que corre en un Mac con Apple Silicon en decimas de segundo, sin GPU dedicada ni conexion de red, y con una licencia Apache 2.0 que permite uso comercial. Es un ejemplo de modelo vertical de proposito unico frente a la tendencia a modelos generalistas de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-0.8B, ajuste LoRA fusionado) |
| Parametros totales | 772.845.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido con llama.cpp b12024) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, sobre el que se aplica un ajuste LoRA que posteriormente se fusiona con el modelo base antes de la conversion a GGUF. El resultado es un unico archivo de 834 MB en cuantizacion Q8_0 pensado para ejecutarse con llama.cpp y llama-server. La model card no detalla hiperparametros del ajuste, numero de tokens de entrenamiento ni configuracion de atencion o contexto.

El conjunto de entrenamiento consta de aproximadamente 3.500 ejemplos, todos no personales, en tres bloques: dictados sinteticos de ambito laboral y cotidiano escritos ad hoc con vacilaciones, autocorrecciones y palabras deformadas, leidos con voces sinteticas, transcritos con Whisper y revisados manualmente para obtener la referencia limpia; fragmentos en italiano de VoxPopuli (intervenciones del Parlamento Europeo) transcritos con Whisper; y frases ya limpias con terminos tecnicos, nombres de productos e intercalarios ("pero", "tipo", "allora") para ensenar al modelo a no tocarlas. No se usaron dictados reales de usuarios en el entrenamiento y se realizo una verificacion automatica para comprobar que los datos no contuvieran nombres o terminos de los dictados privados empleados en las pruebas. No se menciona RLHF ni DPO.

## Capacidades

- Limpieza de texto dictado en italiano: elimina vacilaciones, repeticiones y arranques en falso.
- Resolucion de autocorrecciones: cuando el hablante rectifica ("a las tres, o mejor a las cuatro"), conserva solo la version final.
- Normalizacion de puntuacion, mayusculas y parrafos.
- Correccion de palabras mal transcritas, apoyandose opcionalmente en un Diccionario proporcionado por el usuario.
- Respeto del contenido: no cambia palabras, orden ni significado fuera de las correcciones indicadas.
- Resistencia a la inyeccion de instrucciones: no responde a las peticiones contenidas en el texto dictado.
- Modo de un solo turno con mensaje de sistema fijo; no es un modelo conversacional.
- Sin soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Multilingue: no; unicamente italiano.

## Casos de uso

- Limpieza de dictados en la aplicacion Verbale: el modelo se invoca tras Whisper y un primer paso de reglas para producir el texto final que ve el usuario, con latencia de decimas de segundo en Apple Silicon y sin salir del equipo.
- Transcripcion de reuniones en local: integrado en un pipeline de speech-to-text, convierte las actas crudas en texto legible con puntuacion y parrafos, manteniendo la confidencialidad de la reunion al no requerir red.
- Postprocesado de subtitulos generados por Whisper: eliminacion de repeticiones y falsos arranques tipicos de la transcripcion automatica antes de publicar subtitulos en italiano.
- Normalizacion de terminos tecnicos mediante Diccionario: en entornos de seguridad informatica o medicina, se pasa un glosario (por ejemplo SOC, SIEM, triage) para que las palabras mal transcritas se escriban segun la forma canonica.
- Dictado en movilidad o entornos sin conectividad: al ejecutarse con llama.cpp sobre CPU/GPU integrada, es viable en portatiles sin GPU dedicada para tomar notas por voz y obtener texto limpio al instante.
- Generacion de borradores a partir de notas de voz: conversion de una nota dictada informal en un parrafo estructurado listo para correo o documentacion interna, sin reescritura semantica.
- Evaluacion y prototipado de pipelines de limpieza de ASR: su tamano inferior a mil millones de parametros y su licencia Apache 2.0 lo hacen util como linea base reproducible frente a modelos mayores en tareas de text cleanup.

## Benchmarks y rendimiento

La model card publica tasas de error sobre palabras y puntuacion (WER, menor es mejor) comparando la salida de las reglas solas con la salida tras pasar por Verbale Lima:

| Conjunto de prueba | Solo reglas | Verbale Lima |
|---|---|---|
| Dictados reales, grupo 1 (52) | 8,31% | 8,18% |
| Dictados reales, grupo 2 (30) | 8,85% | 7,50% |
| Dictados sinteticos (30) | 13,04% | 8,09% |
| VoxPopuli (21) | 6,30% | 5,97% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 ocupa 834 MB; con overhead de contexto y runtime de llama.cpp, el consumo tipico se situa en torno a 1-1,5 GB de memoria.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en GPU integrada. En Mac con Apple Silicon (Metal) el autor reporta limpieza de un dictado en decimas de segundo.
- GPU consumer: cabe holgadamente en cualquier GPU consumer con 2 GB o mas de VRAM (RTX 3050 en adelante, GTX 1650, etc.), aunque el caso natural es CPU/Apple Silicon.
- Opciones de despliegue: llama.cpp y llama-server (formato nativo GGUF, convertido con b12024); Ollama y otros runners compatibles con GGUF son viables aunque no estan documentados por el autor. vLLM y TGI no soportan GGUF de forma directa para este modelo segun la informacion disponible.
- Latencia y throughput: latencia de decimas de segundo por dictado en Apple Silicon; no se publican cifras de tokens por segundo.
- Parametros de inferencia recomendados: temperatura 0 para resultados estables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Verbale Lima 0.8B | 772.845.888 | No disponible | Limpieza de dictado en italiano | Apache 2.0 | GGUF Q8_0 |
| Qwen3.5-0.8B (base) | ~0,8B | No disponible | Generacion de texto general | Apache 2.0 | Safetensors, GGUF |
| Modelos de limpieza de ASR de proposito general | No disponible | No disponible | Text cleanup multilingue | Variable | Variable |

No se dispone en la informacion proporcionada de modelos comparables de limpieza de dictado especificos para italiano con datos publicos de rendimiento, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Disenado exclusivamente para italiano y para dictados breves o medios (algunos parrafos); el rendimiento en textos largos o en otros idiomas no esta garantizado.
- Puede anadir o desplazar alguna coma respecto al estilo del hablante.
- En raras ocasiones puede sustituir una palabra poco frecuente por otra mas comun; el Diccionario reduce este riesgo pero no lo elimina.
- No es un modelo para conversar ni responder preguntas; usarlo fuera de la tarea de limpieza produce resultados no validados.
- No se documentan sesgos especificos, pero al derivar de Qwen3.5-0.8B y entrenarse con datos sinteticos y VoxPopuli puede heredar sesgos del modelo base y del corpus parlamentario.
- Riesgo de alucinacion acotado por diseno (no debe responder al contenido), pero no eliminado: en produccion conviene validar que la salida no introduzca contenido nuevo.
- La licencia Apache 2.0 permite uso comercial y modificacion, con las obligaciones habituales de atribucion y aviso de licencia.
- Solo se publica una cuantizacion (Q8_0); no hay versiones Q4 o Q5 que reduzcan aun mas el consumo de memoria.
- El contexto maximo no esta documentado, lo que impide planificar con precision el tamano maximo de dictado por invocacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dvsoft/verbale-lima
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Aplicacion Verbale: https://dvsoft.it
- Dataset VoxPopuli: https://github.com/facebookresearch/voxpopuli
- llama.cpp: https://github.com/ggml-org/llama.cpp
