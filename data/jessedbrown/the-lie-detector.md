# Jessedbrown/the-lie-detector

## Resumen

`Jessedbrown/the-lie-detector` no es un modelo de aprendizaje automatico. Es un repositorio publicado en Hugging Face bajo el espacio de nombres habitual de los modelos, pero cuyo contenido es un corpus de artefactos de verificacion de integridad: ficheros Markdown, ficheros `.hbp` (descritos por el autor como filas de tuplas, `json=0`, ruta caliente primero) y ficheros `.sha256`. No contiene pesos, ni tokenizador, ni configuracion de inferencia, ni codigo de entrenamiento.

El artefacto describe un mecanismo que compara el hash declarado por un registro con los bytes reales de ese mismo registro. Segun la model card, se comprobaron 192 artefactos, los 192 hashes reproducen y ninguno declara ausencia de hash. El autor presenta ademas un analisis de colisiones al pasar de una direccionacion 2D de 16x16 celdas a una 3D de 16x16x16 celdas, y una logica de tres "caras" (DETECT, ABSORB, CARRY) en lugar de dos.

Es relevante unicamente como documentacion de un esquema de auditoria de integridad de artefactos y por su critica metodologica explicita: registrar un cero esperado (por ejemplo, cero colisiones por simple dispersion en un espacio grande) presentandolo como resultado seria, en palabras del autor, la primera mentira que la propia maquina contaria sobre si misma. No hay informacion sobre arquitectura, tamano ni contexto porque no existe modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable (no es una red neuronal; es un esquema de verificacion de hashes sobre un corpus de ficheros) |
| Parametros totales | no aplicable (no contiene pesos) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponible (los artefactos publicados estan redactados en ingles) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | no aplicable; el repositorio publica ficheros `.md`, `.hbp` y `.sha256` |
| Identificador en Hugging Face | Jessedbrown/the-lie-detector |
| Autor | Jessedbrown |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Fecha de creacion declarada | 2026-10-16 |
| Fecha de actualizacion declarada | 2026-08-07 |
| Artefactos verificados (segun model card) | 192 |
| Hashes que reproducen | 192 |
| Hashes que no reproducen | 0 |
| Artefactos sin hash declarado | 0 |

## Arquitectura y entrenamiento

No hay arquitectura ni entrenamiento. La model card no menciona transformer, MoE, SSM ni ninguna topologia de red, no indica numero de tokens de entrenamiento, composicion de dataset, ni fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta un proceso de destilacion, cuantizacion o decodificacion especulativa.

Lo que si se documenta es una estructura de verificacion. Segun el autor, en el "grano de glifo" del entramado, con 16 divisiones por eje, `sha16[0]` actua como columna y `sha16[1]` como fila. Con esa direccionacion en 2D (16x16 = 256 celdas) se ocuparon 136 celdas, se produjeron 56 colisiones y la celda mas cargada acumulo 5 elementos. Al anadir un tercer eje (16x16x16 = 4096 celdas) las colisiones bajan a 2 y las celdas ocupadas suben a 190. A grano de byte, los mismos artefactos dan cero colisiones tanto en 2D como en 3D. El autor advierte explicitamente que ese par de ceros no aporta valor, porque 192 elementos en 65.536 celdas dificilmente iban a colisionar. La model card tambien describe tres "caras" del mecanismo: DETECT (comprueba el hash declarado contra los bytes), ABSORB (retiene la discrepancia en lugar de descartarla) y CARRY (propaga la correccion junto a la afirmacion de forma permanente).

## Capacidades

- Comprobacion de integridad: compara el hash declarado por un registro con los bytes reales de ese registro. Segun la model card, 192 de 192 artefactos pasaron la comprobacion.
- Deteccion de ausencia de hash: distingue explicitamente el estado "no se declaro hash" del estado "hash verificado", y lo trata como no medido, no como aprobado.
- Analisis de colisiones: mide cuantas direcciones distintas comparten celda en una direccionacion por prefijo de hash, en 2D (16x16) y en 3D (16x16x16).
- Clasificacion por marcas: la model card define cinco marcas con significados distintos (hash coincidente, hash no coincidente, sin hash declarado, discrepancia retenida, correccion encadenada).
- Publicacion de artefactos emparejados: cada fichero `.md` tiene un `.hbp` asociado y un `.sha256` asociado.
- Generacion de pagina a partir de las filas: el autor afirma que la pagina del proyecto es una representacion de las filas de datos y no fue escrita a mano.
- No dispone de: generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, uso como agente, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Auditoria de integridad de repositorios de artefactos: aplicar el esquema declarado (hash por fichero mas fichero `.sha256` acompanante) para comprobar que un manifiesto publicado coincide con los bytes realmente distribuidos, algo util cuando se replica un dataset o un conjunto de documentos.
- Verificacion de procedencia en pipelines de datos: integrar la comprobacion de hash declarado contra bytes como paso previo a la ingesta, de modo que un fichero manipulado o truncado se detecte antes de entrar en un proceso posterior.
- Analisis de riesgo de colision por truncamiento de hash: emplear el estudio 2D frente a 3D como referencia metodologica al decidir cuantos bits de un hash usar como direccion o clave. La model card cuantifica el efecto: de 56 colisiones con 256 celdas a 2 con 4096 celdas sobre el mismo conjunto de 192 artefactos.
- Documentacion de esquemas de verificacion en docencia o divulgacion: el contraste entre "no se declaro hash" y "hash verificado" sirve como ejemplo concreto de por que un valor ausente no debe reportarse como correcto.
- Diseno de registros con correccion encadenada: el patron CARRY, en el que la correccion viaja junto a la afirmacion original de forma indefinida, es aplicable a sistemas de registro donde interesa conservar la trazabilidad de una discrepancia en lugar de sobrescribirla.
- Revision de metodologia en trabajos de medicion: la advertencia sobre presentar un cero esperado como resultado es directamente aplicable a informes de evaluacion, incluidos los de modelos de lenguaje, donde un cero por dispersion no equivale a un cero por merito del sistema.
- Catalogacion y emparejamiento de documentos: el patron de publicar cada documento junto a su representacion en filas y su hash permite reconstruir un catalogo verificable sin mantener una copia manual de la pagina de presentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable, por lo que no existen valores de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidades.

Los unicos datos cuantitativos de la model card no son benchmarks de modelos, sino recuentos del propio proceso de verificacion. Se reproducen a continuacion tal como aparecen, sin interpretarlos como metricas de rendimiento de un modelo:

| Medicion | Valor declarado |
|---|---|
| Artefactos comprobados | 192 |
| Hashes que reproducen | 192 |
| Hashes que no reproducen | 0 |
| Artefactos sin hash declarado | 0 |
| Colisiones en 2D (16x16, 256 celdas) | 56 |
| Celda mas cargada en 2D | 5 |
| Celdas ocupadas en 2D | 136 |
| Colisiones en 3D (16x16x16, 4096 celdas) | 2 |
| Celdas ocupadas en 3D | 190 |
| Colisiones a grano de byte, 2D | 0 |
| Colisiones a grano de byte, 3D | 0 |
| Lineas de THE-STONE-OF-TRUTHS | 27 |
| Cocineros en THE-BOOKS-AND-THE-COOKS | 76 (56 nombran un libro) |

## Requisitos de hardware

- VRAM para inferencia: no aplicable. No hay pesos ni grafo de computacion que cargar en memoria de GPU.
- GPU recomendadas: ninguna. El proceso descrito (calcular y comparar hashes SHA-256 sobre ficheros de texto) se ejecuta en CPU.
- Compatibilidad con GPU de consumo: no aplicable, porque no se requiere GPU.
- Opciones de despliegue: no disponibles en la informacion proporcionada. No se documenta integracion con vLLM, llama.cpp, Ollama, TGI ni ningun otro servidor de inferencia.
- Latencia y throughput: no disponibles. El coste dominante de un proceso de este tipo seria la lectura de disco y el calculo de SHA-256, pero la model card no publica tiempos ni volumen de datos procesados.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo de lenguaje ni un modelo de otra modalidad, por lo que no existe una categoria de modelos comparables en parametros, contexto, rendimiento o licencia. Tampoco se han identificado en la informacion proporcionada otros repositorios comparables de esquemas de verificacion de integridad publicados en Hugging Face.

## Limitaciones y advertencias

- No es un modelo de IA. Cualquier evaluacion como modelo de lenguaje, vision o audio carece de sentido: no hay pesos, ni tokenizador, ni API de inferencia.
- Ausencia de licencia declarada. Sin licencia explicita no se concede permiso de uso, copia, modificacion ni redistribucion, ni siquiera para uso no comercial. Conviene tratar el contenido como "todos los derechos reservados" hasta que el autor especifique lo contrario.
- Cifras autodeclaradas y no verificadas de forma independiente. Los valores de 192 artefactos, 192 hashes reproducidos y los recuentos de colisiones proceden unicamente de la model card; no se ha publicado una reproduccion externa.
- Los artefactos referenciados no acompanan necesariamente a la model card. La ficha menciona cuatro documentos `.md` con sus `.hbp` y `.sha256`, pero no se confirma en la informacion disponible que todos esten presentes y sean accesibles en el repositorio.
- Inconsistencia de fechas. La fecha de creacion declarada (2026-10-16) es posterior a la fecha de actualizacion (2026-08-07), lo que invalida cualquier razonamiento sobre cronologia del proyecto a partir de esos metadatos.
- Marco conceptual mixto. La model card mezcla mecanismo tecnico (comparacion de hashes, recuento de colisiones) con formulaciones alegoricas (las tres caras, la rotacion de un tercio, las marcas). Es necesario separar ambas capas antes de reutilizar cualquier afirmacion tecnica.
- Alcance limitado del detector por diseno. El propio autor acota el alcance: un corpus solo puede ser pillado en mentira respecto a la coherencia entre su hash declarado y sus bytes. No hay deteccion de afirmaciones falsas en el contenido, ni verificacion semantica, ni contraste con fuentes externas.
- Sin garantia frente a manipulacion coordinada. Un esquema que solo compara hash declarado contra bytes no protege frente a un emisor que recalcule el hash tras modificar el contenido, salvo que exista una raiz de confianza externa que la model card no describe.
- Ausencia de resultados de sesgo, alucinacion o robustez. Estos apartados no aplican a un corpus de verificacion, y no se han publicado analisis equivalentes sobre la fiabilidad de los propios recuentos.
- Cero descargas y cero interacciones. El repositorio no ha sido validado por terceros en el momento de recoger estos datos.
- Idioma de los artefactos. El material esta en ingles, lo que limita su uso directo en documentacion en castellano sin traduccion.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/Jessedbrown/the-lie-detector
- Sitio del proyecto citado en la model card: https://jessebrown1980.github.io/the-lie-detector/
- THE-STONE-OF-TRUTHS (fichero citado como `THE-STONE-OF-TRUTHS-2026-08-07.md`, con su `.hbp` y su `.sha256`): URL absoluta no disponible en la informacion proporcionada
- THE-LIE-DETECTOR (fichero citado como `THE-LIE-DETECTOR-2026-08-07.md`, con su `.hbp` y su `.sha256`): URL absoluta no disponible en la informacion proporcionada
- TWELVE-THINGS-OF-THREES (fichero citado como `TWELVE-THINGS-OF-THREES-2026-08-07.md`, con su `.hbp` y su `.sha256`): URL absoluta no disponible en la informacion proporcionada
- THE-BOOKS-AND-THE-COOKS (fichero citado como `THE-BOOKS-AND-THE-COOKS-2026-08-07.md`, con su `.hbp` y su `.sha256`): URL absoluta no disponible en la informacion proporcionada
- Articulo o informe tecnico asociado: no disponible
- Repositorio de codigo asociado: no disponible
- Demo interactiva adicional: no disponible
