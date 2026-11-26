# infosave/Embryo-56M-cmf

## Resumen

Embryo-56M es un modelo de lenguaje de 56 millones de parametros desarrollado por infosave (Oleg Kirichenko) que se presenta como la primera version experimental de una pila tecnologica completa y propia: arquitectura, formato de fichero, enrutador, runtime y entrenador. El modelo se entrena desde cero sobre una unica GPU de portatil (Apple M4) con kernels Metal propios, sin reutilizar pesos de terceros. Combina una red neuronal pequena con un sistema de "registros" factuales embebidos en el mismo fichero de pesos, de modo que las respuestas factuales se recuperan de forma verbatim de esos registros y no se generan por muestreo.

La arquitectura emplea atencion de memoria constante (gated delta mixers con dos anclas acotadas), enrutamiento por resonancia (cada registro es un subespacio aislado de estados ocultos y la consulta se dirige al de menor error de reconstruccion) y ejecucion unificada en un solo contenedor. El resultado es un modelo conversacional bilingue (ingles y ruso) con respuestas cortas, una huella de 91 MB en cuantizacion q8_2f y un estado por secuencia de 10,1 MB independiente de la longitud de contexto.

Es relevante ahora por dos motivos: demuestra que es viable entrenar y desplegar un modelo funcional con recursos de consumidor, y propone un enfoque hibrido entre red neuronal y base de conocimiento estructurada que reduce la alucinacion en dominios acotados (4.265 plantas medicinales, 663 fichas de paises, elementos quimicos, ciencia, informatica, historia, libros y guias practicas) a costa de rechazar explicitamente lo que no esta en los registros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion de memoria constante (gated delta mixers y dos anclas acotadas), enrutamiento por resonancia y ejecucion unificada |
| Parametros totales | 55,9 M |
| Parametros activos | 34,7 M por token |
| Longitud de contexto | no disponible (el estado por secuencia es constante, 10,1 MB, a cualquier longitud) |
| Tipos de cuantizacion | q8_2f (formato propio CMF) |
| Idiomas soportados | ingles, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (formato propio, fichero de 91 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer con atencion de memoria constante basada en gated delta mixers y dos anclas acotadas, de forma que no existe KV cache que evacuar y el estado por secuencia no crece con el contexto. Sobre esa columna vertebral se aplica enrutamiento por resonancia: cada registro factual es un subespacio aislado de estados ocultos y una consulta se dirige al registro con el menor error de reconstruccion, medido sobre los tokens del nombre al que se refiere la pregunta y el resto del mensaje. El mismo principio selecciona un experto FFN por token. No hay clasificador ni reglas de palabras clave. La ejecucion es unificada: columna vertebral compartida y registros anadidos sin modificar un solo byte de los pesos existentes.

El entrenamiento se ejecuto en la GPU del Apple M4 con kernels Metal propios, en dos fases: primero texto crudo y despues chat con respuesta unicamente en el turno del asistente y replay de texto crudo. Los datos incluyen FineWeb-edu, FineWeb-2, corpus de codigo y matematicas, SmolTalk, OASST2 y GrandMaster-PRO-MAX (cuyas respuestas fueron escritas por GPT-4-Turbo). Las fichas de plantas provienen de una referencia herbal propia. El autor declara tres solicitudes de patente estadounidenses asociadas a los mecanismos: enrutamiento por resonancia (19/452.440), ejecucion unificada (19/731.402) y atencion de memoria constante (19/738.763).

## Capacidades

- Generacion de texto conversacional corto y gramatical en ingles y ruso.
- Recuperacion factual verbatim desde registros embebidos: 4.265 plantas medicinales y 663 fichas sobre paises, elementos quimicos, ciencia, informatica, historia, libros y guias practicas.
- Rechazo explicito ("I don't know") cuando la pregunta factual cae fuera de los registros, en lugar de generar una respuesta especulativa.
- Seguimiento de conversacion multi-turno sobre una entidad (por ejemplo, repreguntas sobre una planta en lenguaje natural).
- Seleccion de experto FFN por token mediante enrutamiento por resonancia.
- Servidor con API compatible con OpenAI (`cortiq serve`) que expone la ruta elegida en `x_cortiq_route`.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Consulta de referencia herbal: el modelo responde con la ficha verbatim de una planta medicinal (indicaciones, propiedades) a partir del registro `herbs`, lo que resulta adecuado para prototipos de buscadores internos donde la exactitud del texto importa mas que la fluidez.
- Asistente de repreguntas sobre una entidad concreta: gracias al enrutamiento de seguimiento, un usuario puede preguntar primero por una planta y despues pedir aclaraciones en lenguaje llano; el modelo mantiene el subespacio de la entidad y responde desde el mismo registro.
- Fichas de paises y elementos quimicos en ruso e ingles: util para demos de asistentes bilingues de consulta rapida (capital, moneda, idioma oficial) con respuestas exactas y sin generacion libre.
- Despliegue en hardware de consumo: con 91 MB de fichero y 10,1 MB de estado por secuencia, cabe en portatiles y GPUs de gama baja; sirve para validar pipelines de inferencia (cortiq-cli, servidor compatible con OpenAI) antes de escalar a modelos mayores de la misma familia.
- Filtro de abstención en produccion: el comportamiento de rechazo ante preguntas fuera de dominio (38 de 44 en la medicion del autor) es aprovechable como capa de derivacion a un sistema mayor o a un humano cuando la consulta no esta cubierta.
- Experimentacion con arquitecturas de atencion de memoria constante: investigadores pueden medir el comportamiento de gated delta mixers y del enrutamiento por resonancia con un modelo pequeno, reproducible y de licencia permisiva.
- Generacion de texto corto para tareas auxiliares (resumenes breves, respuestas de una frase) donde la calidad linguistica del modelo pequeno sea suficiente y el coste computacional sea el criterio dominante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas propias de velocidad y de acierto sobre sus registros:

| Metrica | Resultado |
|---|---|
| Decodificacion, Apple M4 GPU | ~650 tok/s |
| Decodificacion, Apple M4 CPU | ~470 tok/s |
| Decodificacion, NVIDIA RTX 2000 Ada / host EPYC 7443P | 925 / 612 tok/s |
| Decodificacion, NVIDIA RTX A5000 (CUDA, cortiq 0.8.96) | 870-920 tok/s |
| Decodificacion tras prompt de 2000 tokens, M4 GPU / CPU | 535 / 379 tok/s |
| Decodificacion tras prompt de 2000 tokens, RTX 2000 Ada / EPYC | 796 / 405 tok/s |
| 3000 tokens en una ejecucion, M4 GPU / CPU | 389 / 398 tok/s |
| Preguntas llanas sobre plantas, formulacion no vista en entrenamiento | 155 de 180 |
| Hechos de plantas, preguntas reservadas | 218 de 223 |
| Repreguntas sobre una planta en lenguaje llano, formulacion no vista | 900 de 1200 |
| Mensajes no relacionados tomados por repregunta | 41 de 1380 |
| Preguntas factuales fuera de los registros, rechazadas | 38 de 44 |
| Peticiones ordinarias rechazadas por error | 1 de 40 |
| Preguntas sobre entidades del mundo excluidas del ajuste | 367 de 445 |
| Prompts generales respondidos desde un registro | 86 de 1444 |
| Prompts generales rechazados | 243 de 1444 |
| Recuerdo de una palabra clave en texto, K=4, distancia 128/512/1024/1800 tokens | 62 / 70 / 56 / 47 % |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia; el fichero de pesos ocupa 91 MB y el estado por secuencia 10,1 MB.
- GPU recomendadas: cualquier GPU con soporte del runtime cortiq (Apple M4 con Metal, NVIDIA RTX 2000 Ada, RTX A5000); el autor reporta mediciones en estas.
- Cabe en GPU de consumo: si, incluida la GPU integrada de un Apple M4 y GPUs de portatil de gama baja.
- Opciones de despliegue: `cortiq-cli` (con feature `gpu`, version 0.8.53 o superior) y `cortiq serve` con API compatible con OpenAI en el puerto indicado. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, dado que el formato CMF es propio.
- Latencia y throughput: 650 tok/s en M4 GPU y 925 tok/s en RTX 2000 Ada en decodificacion; el rendimiento cae a 389 tok/s en M4 GPU tras varios segundos de trabajo continuo (por debajo del CPU en esa prueba).

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar para Embryo-56M que permitan una comparacion de rendimiento homogenea. La comparativa se limita a caracteristicas estructurales:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Embryo-56M | 55,9 M (34,7 M activos) | no disponible (estado constante) | Apache 2.0 | CMF propio | Registros factuales embebidos, runtime propio |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Modelo pequeno convencional, ecosistema amplio |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Mayor capacidad general, requiere mas recursos |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Enfocado a texto general, sin registros factuales |

La comparacion de rendimiento con estas alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Fuera de los registros, las respuestas son las de un modelo muy pequeno: gramaticales, cortas y a menudo vacias; el propio autor lo califica de "debil".
- Riesgo de alucinacion en el dominio factual: 86 de 1444 prompts generales se respondieron desde un registro, y aproximadamente una quinta parte de esos casos eran una ficha correcta que no respondia a la pregunta.
- El rechazo no es perfecto: 6 de 44 preguntas fuera de los registros recibieron respuesta de un registro en lugar de abstrucion.
- Cobertura limitada a ingles y ruso; no se documenta soporte de otros idiomas.
- No debe usarse para decisiones medicas: las fichas describen uso tradicional y la model card advierte explicitamente contra ello.
- El formato de pesos es propietario (CMF) y el unico runtime documentado es cortiq, lo que limita la portabilidad y el uso de herramientas estandar del ecosistema.
- El recuerdo de informacion en texto largo es bajo y decrece con la distancia (47 % a 1800 tokens), lo que desaconseja tareas de recuperacion sobre contextos extensos.
- La licencia Apache 2.0 permite uso comercial, pero las solicitudes de patente del autor sobre los mecanismos de enrutamiento, ejecucion y atencion deben evaluarse antes de reimplementarlos.
- El rendimiento en GPU puede degradarse en ejecuciones continuadas (el autor observa caida tras unos segundos en el M4), por lo que las cifras de decodificacion no son sostenidas en todos los casos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Embryo-56M-cmf
- Demo en Space: https://huggingface.co/spaces/infosave/embryo-56m
- Repositorio de imagenes y recursos del modelo: https://huggingface.co/infosave/Embryo-56M-cmf/tree/main/assets
- No se han proporcionado enlaces a papers, blogs o repositorios adicionales en la informacion disponible.
