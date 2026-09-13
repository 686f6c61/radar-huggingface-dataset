# Hanish/quill-fix-v1

## Resumen

Quill fix-v1 es un modelo de correccion gramatical y reescritura disenado para ejecutarse en el dispositivo, desarrollado por el usuario Hanish como componente del teclado y la aplicacion de chat privados Quill. Es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B-Base mediante LoRA (r=32, aplicado a todas las proyecciones) sobre 58.800 filas de instrucciones, y su funcion es corregir ortografia, gramatica y puntuacion del texto escrito en el movil preservando la voz del autor, sin traducir ni anadir o eliminar frases.

Con 752.393.024 parametros reales (el modelo base se comercializa como 0,8B), el modelo ocupa un nicho de latencia y privacidad estrictas: se distribuye en formato GGUF para llama.cpp con dos cuantizaciones, Q4_K_M (529 MB) y Q8_0 (812 MB), lo que permite ejecutarlo en telefonos con 4 GB o mas de RAM sin enviar las pulsaciones a un servidor.

El modelo admite un modo de correccion (`fix`) y un modo de reescritura con cinco perfiles de tono, emplea el formato de prompt ChatML y el token EOS `<|im_end|>`. El unico idioma declarado es el ingles, la licencia es Apache 2.0 y la longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen3.5; llama.cpp la identifica como `qwen35`). Detalles de atencion no disponibles |
| Parametros totales | 752.393.024 (segun metadatos de safetensors); el modelo base se presenta como 0,8B |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (529 MB) y GGUF Q8_0 (812 MB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio contiene ademas safetensors con 752.393.024 parametros |
| Tamano del repositorio | 1,3 GB |
| Token EOS | `<|im_end|>` |
| Formato de prompt | ChatML |
| Pipeline | text-generation |
| Fecha de publicacion | 13 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base y se ajusta con LoRA de rango 32 aplicado a todas las proyecciones. El conjunto de entrenamiento consta de 58.800 filas de instrucciones compuestas por tareas de correccion y reescritura del corpus CoEdIT, ruido tipografico que emula errores de tecleo en telefono y un 12 por ciento de filas "no-op" (texto que ya era correcto y no debe modificarse). El entrenamiento se realizo durante 2 epocas; posteriormente los adaptadores se fusionaron con los pesos base y se exportaron a GGUF mediante `convert_hf_to_gguf.py --no-nextn`, fijando `<|im_end|>` como token EOS.

No se documentan innovaciones de inferencia (decodificacion especulativa, atencion lineal ni mecanismos similares). El rasgo tecnico mas relevante es la inclusion deliberada de filas no-op y de perfiles de voz y lexico protegido en el prompt de sistema, orientados a reducir las ediciones innecesarias. El modelo exige una version de llama.cpp que soporte la arquitectura `qwen35` (mayo de 2026 o posterior).

## Capacidades

- Correccion de ortografia, gramatica y puntuacion en texto escrito desde el movil, manteniendo el registro informal (por ejemplo, conservando "gonna" o "rn").
- Modo `fix`: reescritura minima orientada unicamente a errores, sin reescribir la frase.
- Modo `rewrite` con cinco objetivos de tono: `casual`, `neutral`, `formal`, `shorter` y `longer`.
- Preservacion de la voz del usuario mediante un parametro de perfil (`Voice: {profile}`) en el prompt de sistema.
- Proteccion de lexico especifico: el prompt admite una lista `Never change these words: {lexicon}` de terminos que no deben alterarse.
- Deteccion de texto ya correcto (filas no-op), con una precision de no-op del 94 por ciento en la evaluacion interna.
- Capacidad restringida a un unico idioma (ingles) y sin soporte declarado de traduccion.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Formato conversacional compatible con endpoints y con el pipeline `text-generation` de HuggingFace.

## Casos de uso

- Correccion en tiempo real en un teclado movil: el modelo recibe el texto tecleado en el modo `fix` y devuelve la version corregida; con 529 MB en Q4_K_M encaja en telefonos con 4 GB o mas de RAM y se ejecuta en local, sin enviar el contenido del usuario a un servidor.
- Autocorreccion de mensajes en aplicaciones de chat: antes de enviar, el texto pasa por el modelo para arreglar puntuacion y ortografia; la evaluacion interna reporta un 94 por ciento de precision en texto que ya era correcto, lo que reduce el riesgo de que la aplicacion modifique mensajes validos.
- Reescritura de tono de mensajes profesionales: el modo `rewrite tone=formal` permite transformar un mensaje escrito de forma informal en una version adecuada para un contexto laboral, manteniendo el contenido y sin anadir frases nuevas.
- Resumen o condensacion de mensajes largos: el modo `rewrite tone=shorter` sirve para recortar mensajes extensos antes de enviarlos, util en aplicaciones de mensajeria con limite de caracteres.
- Preservacion de jerga tecnica en documentacion de desarrolladores: la lista `Never change these words: {lexicon}` permite blindar identificadores, nombres de funciones o acronimos para que la correccion no los altere.
- Limpieza previa de texto de usuario en pipelines de NLP: al ser un modelo pequeno y determinista en su salida (solo texto corregido), puede actuar como etapa de normalizacion antes de un clasificador, un buscador o un sistema de moderacion.
- Procesado por lotes en local para aplicaciones sensibles: al no requerir GPU ni conexion, permite corregir grandes volumenes de texto en estaciones de trabajo de bajos recursos sin coste de API.
- Integracion en editores de notas o correo de escritorio: con la variante Q8_0 (812 MB) se obtiene mayor precision en equipos de sobremesa, manteniendo la inferencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta una evaluacion interna sobre 150 filas reservadas, comparando el modelo ajustado con el modelo base en modo zero-shot:

| Metrica | Base zero-shot | Quill fix-v1 |
|---|---|---|
| Exact match | 9 % | 43 % |
| GLEU-lite | 0,32 | 0,73 |
| Precision no-op | 33 % | 94 % |
| Tasa de sobre-edicion | 43 % | 24 % |

Ejemplo publicado en la model card: `i dont think were gonna make it on time, traffic is crazy rn` se transforma en `I don't think we're gonna make it on time, traffic is crazy rn.`, conservando el registro informal.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantizacion distribuida (529 MB en Q4_K_M, 812 MB en Q8_0), mas el consumo del contexto.
- Caben en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en graficas integradas. El caso de uso principal es CPU.
- Movil: la cuantizacion Q4_K_M esta pensada para telefonos con 4 GB o mas de RAM.
- Escritorio sin GPU: inferencia viable en CPU con llama.cpp para ambas cuantizaciones.
- Opciones de despliegue: llama.cpp es el runtime requerido (build de mayo de 2026 o posterior, con soporte de la arquitectura `qwen35`); tambien son utilizables los runners basados en llama.cpp que incorporen esa version, como Ollama o `llama-cpp-python`. El soporte en vLLM o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento en la evaluacion interna de Quill |
|---|---|---|---|---|---|
| Quill fix-v1 | 752.393.024 | no disponible | GGUF (Q4_K_M, Q8_0) y safetensors | Apache 2.0 | Exact match 43 %, GLEU-lite 0,73, precision no-op 94 % |
| Qwen/Qwen3.5-0.8B-Base (zero-shot) | alrededor de 0,8B | no disponible | safetensors | no disponible en la informacion proporcionada | Exact match 9 %, GLEU-lite 0,32, precision no-op 33 % |
| Modelos de correccion gramatical tipo T5 (familia CoEdIT y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos del modelo base corresponden al mismo conjunto de evaluacion de 150 filas empleado por el autor, por lo que la comparacion solo es valida dentro de ese escenario. No se dispone de comparaciones con otros correctores en benchmarks publicos.

## Limitaciones y advertencias

- Idioma unico: solo ingles declarado; no se garantiza un comportamiento correcto en castellano ni en otros idiomas, y el modelo tiene instruccion explicita de no traducir.
- Tasa de sobre-edicion del 24 por ciento: en uno de cada cuatro casos aproximadamente el modelo modifica texto mas alla de lo estrictamente necesario, lo que puede alterar el significado o el estilo original.
- Exact match del 43 por ciento: en el 57 por ciento de los casos la salida no coincide exactamente con la referencia, aunque parte de esas diferencias pueden ser variantes validas.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de fidelidad factual; en tareas de reescritura con el modo `longer` el riesgo de introducir contenido no presente en la entrada no esta cuantificado.
- Dependencia de version: requiere llama.cpp con soporte de la arquitectura `qwen35` (mayo de 2026 o posterior); versiones anteriores no podran cargar el modelo.
- Procedencia de los datos: el ajuste se realiza sobre el corpus CoEdIT, cuyos sesgos, licencia y cobertura no se detallan en la model card.
- Licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-0.8B-Base antes de desplegarlo en produccion.
- Validacion de la comunidad nula: cero descargas y cero likes en el momento de la consulta, sin evaluaciones independientes que confirmen las cifras reportadas por el autor.
- Discrepancia de nomenclatura: el nombre del modelo base sugiere 0,8B de parametros, mientras que los metadatos de safetensors indican 752.393.024, un 6 por ciento menos; conviene tenerlo en cuenta al planificar memoria.
- Contexto desconocido: al no publicarse la longitud de contexto, no es posible garantizar el comportamiento en entradas largas (por ejemplo, parrafos completos o conversaciones multi-turno extensas).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hanish/quill-fix-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Runtime requerido (llama.cpp): https://github.com/ggml-org/llama.cpp

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; las unicas entradas recuperadas fueron paginas generales de YouTube sin relacion con Quill fix-v1. No se dispone de paper, blog tecnico, repositorio adicional ni demo asociados al modelo.
