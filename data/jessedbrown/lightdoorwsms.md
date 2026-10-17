# Jessedbrown/lightDOORwsMs

## Resumen

El repositorio `Jessedbrown/lightDOORwsMs` alojado en HuggingFace no contiene un modelo de inteligencia artificial: no hay pesos, no hay ficheros de safetensors ni GGUF, y la model card no describe ninguna arquitectura neuronal. Lo que documenta el README es una aplicacion web de comunicacion entre pares (peer-to-peer) construida sobre dos ficheros HTML (`index.html` y `mesh.html`), sin servidor, sin cuentas y sin instalacion. El autor describe un sistema de "puertas" nominales (etiquetas jerarquicas como `light.kitchen.tuesday`) que actuan como rutas de comunicacion, y un esquema de identidad basado en el hash SHA-256 de un secreto generado localmente en el navegador, del que solo se comparte una representacion cromatica.

La model card incluye mediciones propias de transferencia de datos entre dos navegadores, con verificacion SHA-256 de un fichero de 9.000 bytes que llega identico byte a byte, y una funcion de "quant" que reduce cualquier entrada a una tupla fija de 3.200 bytes con complejidad O(N) en la entrada y O(1) en la salida. Se apoya en servidores STUN publicos para el descubrimiento de rutas fuera de la red local y en conexion directa por cable USB cuando la red no esta disponible.

Por tanto, esta ficha no puede tratar el artefacto como un modelo de lenguaje: no hay parametros, contexto, tokenizador ni licencia declarada. Se documenta lo que el autor afirma y se marcan explicitamente como no disponibles todos los datos tecnicos propios de una ficha de modelo. Cualquier evaluacion de rendimiento en tareas de NLP, codigo o razonamiento es inaplicable a este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; el README describe una aplicacion web peer-to-peer en HTML y JavaScript) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el sentido de cuantizacion de pesos; el README describe una funcion de resumen ("quant") que mapea cualquier entrada a una tupla fija de 3.200 bytes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (los unicos artefactos mencionados son `index.html` y `mesh.html`) |

Metadatos del repositorio:

| Parametro | Valor |
|---|---|
| ID | Jessedbrown/lightDOORwsMs |
| Autor | Jessedbrown |
| Pipeline declarado | no disponible |
| Tags | region:us |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion declarada | 2026-10-16 |
| Fecha de actualizacion declarada | 2026-08-07 |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura de red neuronal ni sobre proceso de entrenamiento, porque el repositorio no contiene un modelo. No se declara numero de tokens de entrenamiento, composicion del dataset, ni tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones del tipo atencion lineal, decodificacion especulativa o arquitecturas hibridas.

Lo que el README describe, en su lugar, es un mecanismo de comunicacion: dos instancias ("boats") enlazadas manualmente una vez, un esquema de puertas nominales con jerarquia ilimitada, una identidad derivada de SHA-256 con representacion cromatica en dos paradas marrones con bandas 16...240 y luminancia limitada a 32...224, y una fase de introduccion que se descarta tras el primer contacto. Se menciona una verificacion del motor de "quant" contra la implementacion distribuida en 40 casos aleatorios, con 40 de 40 resultados identicos byte a byte, y una funcion descrita como count-sketch sobre 1024 buckets seguida de una cola fija de `turbo(1024) + signs(128) + zeta(1024) + hist(1024)`. Estos datos pertenecen al sistema de comunicacion, no a un modelo entrenado.

## Capacidades

- No se declara ninguna capacidad de generacion de texto, razonamiento, codigo o matematicas.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues.
- No se declaran capacidades de vision, audio ni modo de pensamiento.
- El README si describe capacidades del artefacto publicado: transferencia de palabras, dibujos y ficheros entre dos navegadores sin servidor intermedio; corte y creacion de puertas nominales sin limite de numero; persistencia de la identidad cromatica a traves de recargas y reconexiones; y funcionamiento sobre cable USB sin router ni internet.

## Casos de uso

Los casos de uso siguientes se refieren al artefacto realmente publicado, no a un modelo de IA:

- Transferencia directa de ficheros entre dos personas sin intermediarios: segun el README, un fichero de 9.000 bytes se transfiere con verificacion SHA-256 coincidente, sin que el contenido toque ningun disco que no sea uno de los dos extremos.
- Mensajeria en redes restringidas: el sistema se apoya en STUN publico para descubrir la direccion externa y puede prescindir de el en la misma wifi, lo que resulta util en entornos con salida a internet limitada.
- Comunicacion en entornos sin red: el README afirma que se probo el acceso a traves de cable USB con la wifi apagada, sin router ni internet en la ruta.
- Identidad sin directorio central: la identidad se deriva de un secreto local y solo se comparte el color, de modo que no existe una lista de contactos que pueda ser confiscada o eliminada.
- Trabajo colaborativo sobre un lienzo compartido: el README menciona el cruce de un trazo en un campo compartido y la persistencia del color tras recargar la pagina.
- Despliegue sin infraestructura: al ser dos ficheros HTML sin dependencias, puede abrirse desde un fichero local o desde cualquier alojamiento estatico, sin build ni instalacion.
- Lectura del nucleo del sistema: el fichero `mesh.html` se presenta como el kernel minimo sobre el que se construye la aplicacion, pensado para su lectura y auditoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar de modelos de lenguaje, porque el repositorio no contiene un modelo evaluable en esas tareas.

Las unicas mediciones presentes en la model card son de transferencia de datos entre dos navegadores y se reproducen a continuacion tal como aparecen, sin interpretarlas como rendimiento de un modelo:

| Medicion declarada | Resultado declarado |
|---|---|
| Fichero transferido | 9.000 bytes, llegada byte a byte |
| SHA-256 enviado y recibido | 78bd367073786b59cfed044eb4c372b1... (coincidentes) |
| Entrada de 19 bytes al "quant" | 3.200 bytes de salida |
| Entrada de 500.000 bytes al "quant" | 3.200 bytes de salida |
| Repeticion de la misma entrada | Tupla identica byte a byte |
| Verificacion del quant en pagina frente al motor distribuido | 40 casos aleatorios, 40 de 40 identicos |
| Rastro tras el contacto | 0 elementos conservados |
| Color tras el contacto | 1 conservado, sobrevive a una recarga |

## Requisitos de hardware

- VRAM para inferencia: no disponible, no aplica; no hay pesos que cargar en GPU.
- GPU recomendadas: no disponible, no aplica.
- Compatibilidad con GPU de consumo: no disponible, no aplica.
- Opciones de despliegue: no aplica ninguna de las habituales (vLLM, llama.cpp, Ollama, TGI). El README indica que el artefacto se compone de dos ficheros HTML sin dependencias ni proceso de build.
- Requisitos reales declarados: un navegador. El autor afirma que no hace falta servidor, cuenta ni instalacion, y que puede abrirse desde un fichero en disco.
- Red: se requiere acceso a un servidor STUN publico para el descubrimiento de rutas fuera de la red local; en la misma wifi no es necesario, y por cable USB el README afirma que no se necesita nada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La categoria de comparacion habitual (modelos del mismo tamano o de la misma tarea) no es aplicable, porque el repositorio no publica un modelo de lenguaje ni ningun artefacto entrenado. No se dispone de datos de parametros, contexto, licencia ni resultados que permitan situarlo frente a alternativas.

Como referencia del propio autor, las unicas magnitudes comparables dentro del README son el resumen a 3.200 bytes frente a entradas de 19 bytes y de 500.000 bytes, y la coincidencia 40 de 40 en la verificacion del motor de "quant". Se trata de comparaciones internas del sistema, no de comparaciones con otros modelos.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA. Cualquier uso previsto como modelo de lenguaje, de codigo o de vision es inviable con estos artefactos.
- No se declara licencia, por lo que no puede asumirse permiso de uso comercial, modificacion ni redistribucion. La ausencia de licencia es un riesgo juridico en produccion.
- No hay datos sobre sesgos, alucinacion o limitaciones de contexto e idioma porque no hay modelo al que atribuirlos.
- Los metadatos temporales del repositorio son incoherentes: la fecha de creacion declarada (2026-10-16) es posterior a la de ultima actualizacion (2026-08-07).
- El repositorio registra 0 descargas y 0 likes, de modo que no existe validacion externa de las afirmaciones de la model card.
- Las cifras de transferencia, verificacion SHA-256, funcionamiento por USB y coincidencia 40 de 40 son afirmaciones del autor en su propia model card y no se acompanan de metodologia reproducible ni de artefactos de prueba independientes.
- La propia model card reconoce una funcionalidad no terminada: el codigo QR en color para el primer encuentro no produce un codigo valido, y el autor indica que se comparo contra una implementacion de referencia en los ocho patrones de mascara sin coincidencia.
- La funcion de resumen a 3.200 bytes es, segun el propio autor, una direccion y no un archivo: no permite recuperar la entrada original, lo que invalida cualquier uso como compresion o almacenamiento.
- El sistema depende de una red peer-to-peer entre navegadores, con las limitaciones habituales de NAT, cortafuegos y disponibilidad de servidores STUN publicos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jessedbrown/lightDOORwsMs
- Aplicacion publicada por el autor: https://jessebrown1980.github.io/lightDOORwsMs/
