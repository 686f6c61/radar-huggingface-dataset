# indahl/indahl-readcheck

## Resumen

`indahl-readcheck` no es un modelo de lenguaje, sino un plugin para Claude Code publicado en Hugging Face bajo el identificador `indahl/indahl-readcheck`. Lo desarrolla Heuremen LLC y su funcion es actuar como una puerta de control en el flujo de trabajo con git: bloquea un `git commit` que anada un fichero de resultados, lecturas o outcomes si no existe junto a el un bloque de verificacion completo llamado `CHECK.json`. Ese bloque debe contener una respuesta para cada uno de los trece requisitos de recuento definidos por los estandares de Heuremen LLC, etiquetados de REQ-01 a REQ-13.

El plugin se distribuye como extension del entorno de linea de comandos Claude Code y se instala a traves de un marketplace de plugins propio del autor. Aporta tres piezas: un hook que intercepta el commit, un comando `/readcheck` con subcomandos para crear, verificar o auditar bloques, y un fichero de configuracion por repositorio, `.readcheck.json`, que permite definir patrones de ficheros. Su relevancia es acotada y muy especifica: resulta util en repositorios donde se versionan resultados experimentales y se quiere garantizar que cada uno lleva asociado un registro trazable de las comprobaciones realizadas.

La ficha de Hugging Face no contiene pesos, arquitectura ni parametros, porque el artefacto no es un modelo entrenado. Los datos disponibles son escasos: cero descargas, cero likes, sin pipeline declarado, sin idiomas declarados y con licencia MIT. Cualquier evaluacion de rendimiento o de capacidades de inferencia carece de sentido en este caso, y asi se refleja en las secciones siguientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de red neuronal; es un plugin para Claude Code) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponibles (la documentacion esta en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos; el plugin distribuye comandos y scripts Python) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El artefacto es un plugin de Claude Code compuesto por comandos y hooks implementados en Python 3 y ejecutados sobre git. La logica central es un hook que se dispara antes de `git commit`, inspecciona los ficheros en staging y comprueba si alguno coincide con los patrones de "lectura" (resultados, outcomes o readings) definidos en `.readcheck.json`; si es asi, exige la presencia de un `CHECK.json` completo en esa carpeta o en una carpeta superior.

Cada entrada del bloque de verificacion debe adoptar una de tres formas: `holds: <lo que se comprobo>`, `not applicable: <por que>` o una descripcion de lo hallado y corregido. Una respuesta vacia o que siga conteniendo el marcador `TODO` provoca el fallo de la comprobacion. La version publicada en Hugging Face es una copia reducida: no incluye el fichero ejecutable y sus comandos descargan cada script desde el repositorio publico `github.com/Heuremen-LLC/indahl.ai` en un commit fijado (`744bcd22548a29dcdc5a261477faccaeebc6938d`), ejecutandolo solo si el sha256 coincide con el valor embebido en el comando (`cc0e26802ddbcc157def5ea0ee90e8d4a9b2c516336658f34072882c03c90592`). La version completa, con la puerta automatica de commit incluida, se instala desde el marketplace del autor.

## Capacidades

- Bloqueo de `git commit` cuando un fichero de lectura en staging carece de un `CHECK.json` completo en su carpeta o en una carpeta superior.
- Creacion de bloques en blanco mediante `/readcheck new <ruta> "<descripcion>"`.
- Verificacion de un bloque existente con `/readcheck verify <carpeta>`.
- Auditoria de todos los ficheros de lectura en staging con `/readcheck staged`.
- Configuracion de patrones de ficheros por repositorio mediante `.readcheck.json`.
- Validacion de respuestas por requisito (REQ-01 a REQ-13); una respuesta vacia o con `TODO` se considera fallo.
- Ejecucion local sin contacto con servicios externos: el plugin lee el repositorio en la propia maquina.
- Compatibilidad multiplataforma: usa `python3` y recurre a `python` como alternativa en Windows para evitar el stub de Microsoft Store que devuelve codigo de salida 49.

## Casos de uso

- Repositorios de investigacion con resultados versionados: el hook impide que se confirme un fichero de resultados sin el bloque `CHECK.json` correspondiente, de modo que cada resultado queda acompanado de un registro de las comprobaciones aplicadas.
- Cumplimiento de un estandar interno de recuento: en entornos que exigen cubrir los requisitos REQ-01 a REQ-13, el comando `/readcheck staged` audita de golpe todos los ficheros en staging y senala los que incumplen.
- Revision previa a la publicacion de artefactos: antes de etiquetar una version, `/readcheck verify <carpeta>` confirma que el bloque de verificacion esta completo y no contiene marcadores `TODO` pendientes.
- Integracion en flujos de CI sobre repositorios git: al ser un hook previo al commit, encaja en pipelines que ya validan el arbol de trabajo antes de aceptar cambios, sin necesidad de servicios externos.
- Estandarizacion de equipos con multiples repositorios: `.readcheck.json` permite fijar por repositorio que extensiones o rutas se consideran "lecturas", adaptando la puerta a la estructura de cada proyecto.
- Trazabilidad documental en proyectos de datos: cuando los resultados se regeneran con frecuencia, el bloque `CHECK.json` deja constancia de que se comprobo en cada iteracion y de que quedo fuera de alcance y por que.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo de lenguaje y no admite evaluacion mediante MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni inferencia neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos reales: Python 3 (`python3`, o `python` en Windows) y git instalados en la maquina.
- Opciones de despliegue: instalacion como plugin de Claude Code mediante `/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-readcheck@heuremen`; la copia de Hugging Face descarga los scripts desde el repositorio publico con verificacion de sha256.
- Latencia y throughput: no disponibles; el coste es el de ejecutar un script Python y una comprobacion de ficheros sobre el repositorio local.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada alternativas comparables de la misma categoria (plugins de validacion previa al commit para Claude Code).

## Limitaciones y advertencias

- La copia publicada en Hugging Face no incluye el fichero ejecutable: los comandos dependen de la descarga de scripts desde `raw.githubusercontent.com` en un commit fijado, por lo que sin acceso a red la comprobacion no puede ejecutarse.
- Esta copia no incorpora la puerta automatica de commit; solo incluye los comandos de comprobacion. La funcionalidad completa requiere instalar desde el marketplace del autor.
- El plugin depende de la disponibilidad y de la integridad del commit fijado en el repositorio de GitHub; si ese commit o el sha256 cambian, la verificacion falla y el script no se ejecuta.
- En Windows, si `python3` resuelve al stub de Microsoft Store (codigo de salida 49), el hook recurre a `python`; si ninguno de los dos esta disponible, la comprobacion queda silenciosamente inactiva.
- El alcance esta limitado a los requisitos REQ-01 a REQ-13 de Heuremen LLC; no es una herramienta generica de calidad de codigo ni de validacion de resultados cientificos.
- La documentacion esta en ingles y no se declaran idiomas soportados.
- No hay datos de adopcion: cero descargas y cero likes en el momento de la consulta.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero conviene revisar los terminos y la politica de privacidad enlazados por el autor para el uso del marketplace.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-readcheck
- Repositorio fuente: https://github.com/Heuremen-LLC/indahl-readcheck
- Repositorio del marketplace y scripts: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/readcheck
- Script descargado por los comandos (commit fijado): https://raw.githubusercontent.com/Heuremen-LLC/indahl.ai/744bcd22548a29dcdc5a261477faccaeebc6938d/claude-plugins/plugins/readcheck/scripts/readcheck.py
- Sitio del autor: https://indahl.ai
- Privacidad: https://indahl.ai/privacy
- Terminos: https://indahl.ai/terms
