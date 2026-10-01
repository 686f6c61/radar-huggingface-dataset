# guqinlizhixian/jzpocr

## Resumen

jzpOCR es un conjunto de pesos para el reconocimiento automatico de jianzipu (减字谱), el sistema de notacion tablatura empleado para la citara china guqin. El repositorio, publicado por el usuario guqinlizhixian, no contiene un unico modelo sino tres juegos de pesos independientes, cada uno orientado a un subproblema distinto del reconocimiento de esta notacion historica: dos dedicados a los caracteres de la mano derecha y uno a las indicaciones de la mano izquierda (走手音, desplazamientos).

El modelo se enmarca en el proyecto jzpOCR, descrito por su autor como un sistema de entrenamiento autonomo cuyo objetivo es la cadena "escaneo real de pagina de partitura -> secuencia estructurada de caracteres", con un工具 de linea de comandos llamado jzpocr como entregable final. Este repositorio es unicamente el artefacto del lado del modelo; no incluye el detector de maquetacion necesario para pasar de una pagina completa a los recortes que los modelos consumen.

La relevancia del proyecto es de nicho pero clara: el jianzipu es una notacion historica sin equivalencia directa en notacion occidental, y practicamente no existen herramientas automaticas de reconocimiento publicadas. Los tres modelos operan sobre recortes ya segmentados, no sobre paginas completas, y sus metricas de exactitud se situan entre el 51% y el 63% segun el subproblema, con tamanos de evaluacion reducidos (132 y 239 muestras).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (modelos de clasificacion de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | other (no se concede licencia de codigo abierto) |
| Formato de pesos | no disponible (repositorio organizado en los subdirectorios atom-right/, atom-right-f12/ y lc-parent-b/) |

Datos adicionales del repositorio: tamano de 0,1 GB, pipeline declarado `image-classification`, cero descargas y cero likes en el momento de la consulta. Las dependencias de ejecucion difieren por submodelo: `atom-right` y `atom-right-f12` requieren `torch`; `lc-parent-b` requiere `paddlepaddle`.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura de red de ninguno de los tres modelos: no se especifica si son CNN, transformers de vision, modelos hibridos ni el numero de parametros, capas o resolucion de entrada mas alla de la escala y el modo de normalizacion de cada variante. Lo unico documentado es el pipeline (`image-classification`) y las dependencias de inferencia, lo que apunta a clasificadores de imagen, pero no permite afirmar una topologia concreta.

En cuanto a datos, `atom-right` fue entrenado por el sistema autonomo de jzpOCR con recortes de caracteres procedentes de la obra 《琴曲集成》. Los otros dos pesos, `atom-right-f12` y `lc-parent-b`, proceden del sistema de la generacion anterior y se redistribuyen tal cual: el autor indica expresamente que sus listas de imagenes de entrenamiento no se incluyen en el paquete y que la procedencia de las fuentes no ha sido verificada. No se publican cifras de tokens, composicion del dataset, ni si hubo etapas de RLHF o DPO, algo esperable en modelos de reconocimiento visual y no de lenguaje.

El detalle tecnico mas relevante documentado es la diferencia de preprocesado entre los dos modelos de mano derecha: `atom-right-f12` usa normalizacion `canonical` con entrada en `[-1, 1]`, mientras que `atom-right` usa `inkfit` con entrada en `[0, 1]`. Esta discrepancia de calibracion invalida la comparacion directa de sus exactitudes: segun el autor, al cambiar de criterio de normalizacion `atom-right-f12` cae de 83 a 58 aciertos sobre el mismo lote de 132 muestras.

## Capacidades

- Reconocimiento de caracteres de mano derecha de jianzipu a partir de un recorte de un unico caracter, con salida en formato de campos separados del tipo `ATOM|F:大;H:七八;R:抹;S:七`.
- Reconocimiento de indicaciones de mano izquierda (走手音) a partir de una imagen madre completa, con salida de cadena literal como `上三三`.
- Clasificacion de imagen orientada a caracteres de notacion historica, no a texto impreso convencional.
- Salida estructurada con campos explicitos en el caso de los modelos de mano derecha, lo que facilita su consumo por un pipeline posterior.
- Capacidad multilingue: limitada al chino (zh) y, dentro de el, al vocabulario cerrado propio de la notacion jianzipu.
- No soporta tool calling ni function calling.
- No se describe soporte de agentes ni razonamiento multi-paso.
- No incluye deteccion de maquetacion: no realiza OCR de pagina completa de forma end-to-end.

## Casos de uso

- Digitalizacion de archivos musicologicos: los modelos permiten convertir recortes de caracteres de ediciones facsimilares de guqin en secuencias de campos estructurados, lo que hace posible construir bases de datos consultables de repertorio historico. Requiere un detector de maquetacion previo, no incluido en el repositorio.
- Apoyo a la transcripcion asistida: dado que la exactitud ronda el 51-63% en igualdad estricta, el uso realista es como preanotador en una interfaz de revision humana, donde el musicologo corrige los campos fallidos en lugar de teclear desde cero.
- Generacion musical a partir de partitura: el proyecto guqinMM emplea secuencias derivadas de OCR de jianzipu como parte de su corpus para entrenar generacion de musica, de modo que estos pesos pueden alimentar la fase de extraccion de secuencias de ese tipo de sistemas.
- Investigacion sobre notacion historica: los tres pesos permiten experimentar con la variabilidad grafica de la notacion (diferencias entre ediciones Ming y Qing, variantes de trazado) y medir hasta que punto los modelos actuales generalizan entre fuentes.
- Indexacion y busqueda en colecciones digitales: extrayendo los campos de mano derecha e izquierda es posible indexar piezas por tecnica, cuerda o posicion y ofrecer busquedas del tipo "piezas que usan tal combinacion de tecnicas".
- Analisis cuantitativo de repertorio: la salida en campos separados (`F`, `H`, `R`, `S`) permite estadisticas agregadas sobre frecuencia de tecnicas y digitaciones en un corpus, tarea que manualmente es muy costosa.
- Docencia e investigacion universitaria: como banco de pruebas reproducible para comparar estrategias de preprocesado (`canonical` frente a `inkfit`) en reconocimiento de notacion no latina, con las salvedades metodologicas indicadas por el propio autor.

## Benchmarks y rendimiento

| Modelo | Tarea | Entrada | Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|---|---|---|
| atom-right | Mano derecha | Recorte de un caracter | `whole_exact` (todos los campos correctos) | 76/132 = 57,58% | fixed_dev, 132 muestras (PackageA 72 + real110 60) |
| atom-right-f12 | Mano derecha | Recorte de un caracter | `whole_exact` | 83/132 = 62,88% | fixed_dev, 132 muestras |
| lc-parent-b | Mano izquierda | Imagen madre completa | Igualdad estricta de la cadena | 122/239 = 51,05% | Holdout de 239 imagenes madre |

Advertencias metodologicas publicadas por el autor, que deben acompanar a cualquier lectura de la tabla:

- Los resultados de `atom-right` y `atom-right-f12` no son directamente comparables: usan modos de normalizacion distintos (`inkfit` con `[0, 1]` frente a `canonical` con `[-1, 1]`). Con el criterio alternativo, `atom-right-f12` baja de 83 a 58 aciertos sobre las mismas 132 muestras.
- Los tres resultados son de nivel de recorte o de imagen madre, ninguno es una cifra end-to-end de pagina completa.
- Los tamanos de evaluacion sonpequenos (132, 132 y 239): diferencias de menos de 8 puntos porcentuales en una sola pasada no son concluyentes.
- El conjunto fixed_dev usa muestras marcadas como `benchmark_only=1` y `training_eligible=0`, excluidas de forma permanente del entrenamiento.

No se han publicado resultados sobre MMLU, HumanEval, GSM8K u otros benchmarks generales, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica requisitos de memoria ni latencia.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible. Como referencia no confirmada, el repositorio completo ocupa 0,1 GB y contiene tres juegos de pesos, lo que sugiere modelos de baja huella de parametros, pero el autor no lo confirma.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo. El metodo previsto por el autor es ejecutar el script `infer.py` incluido en cada subdirectorio, con `torch` para los modelos de mano derecha y `paddlepaddle` para el de mano izquierda.
- Latencia y throughput estimados: no disponible.
- Nota operativa: los subdirectorios son autocontenidos y pueden descargarse por separado con `hf download grydlmq/jzpocr --repo-type model --include "atom-right-f12/*" --local-dir ./f12`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de reconocimiento de jianzipu con parametros, contexto o licencia publicados. El proyecto guqinMM de la Universidad del Sureste aparece en la busqueda web como trabajo relacionado (OCR de jianzipu y generacion musical), pero no se aportan sus cifras de rendimiento ni sus caracteristicas tecnicas, por lo que no puede establecerse una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un sistema de OCR de pagina completa: los tres modelos esperan recortes ya segmentados (un caracter para los de mano derecha, una imagen madre para el de mano izquierda). El detector de maquetacion necesario no forma parte del repositorio.
- Exactitud modesta: entre el 51,05% y el 62,88% en igualdad estricta segun el subproblema, insuficiente para uso desatendido en produccion sin revision humana.
- Los dos modelos de mano derecha no son comparables entre si por diferencias de preprocesado; usar el modo equivocado degrada el rendimiento de forma severa (de 83 a 58 aciertos en el caso documentado).
- Los conjuntos de evaluacion son pequenos (132 y 239 muestras), lo que limita la significacion estadistica de las diferencias observadas.
- Riesgo de alucinacion: no se documentan tasas de error por campo ni comportamiento ante entradas fuera de distribucion. Al ser un clasificador con vocabulario cerrado, el modo de fallo esperado es la asignacion de un campo incorrecto, no la generacion de texto libre, pero el autor no aporta analisis de errores.
- Sesgo de dominio: los modelos estan ajustados a las fuentes de su corpus de entrenamiento. Para `atom-right`, las imagenes proceden de 《琴曲集成》; para los otros dos, la procedencia no esta verificada. No hay datos sobre generalizacion a otras ediciones o calidades de escaneo.
- Idioma: exclusivamente chino, y dentro de el, al subconjunto de caracteres de la notacion jianzipu.
- Licencia: el repositorio se publica como `license: other` sin conceder licencia de codigo abierto. Se permite el uso y la evaluacion, pero no se otorga ningun derecho sobre los datos de entrenamiento subyacentes.
- Riesgo legal sobre los datos: 《琴曲集成》 es una edicion facsimilar moderna con trabajo editorial, no una obra en dominio publico. El autor declara no haber realizado un juicio legal sobre si los pesos constituyen obra derivada de esa publicacion ni haber obtenido autorizacion de los titulares. Los originales Ming y Qing subyacentes son en su mayoria de dominio publico, pero la reproduccion y la revision editorial de esta edicion concreta no lo son.
- Antes de cualquier uso comercial o redistribucion es necesario aclarar de forma independiente los derechos de la capa de datos.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en produccion por terceros.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: cualquier flujo que los requiera debe implementarse externamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guqinlizhixian/jzpocr
- Subdirectorio de mano derecha (sistema autonomo jzpOCR): https://huggingface.co/guqinlizhixian/jzpocr/tree/main/atom-right
- Subdirectorio de mano derecha (generacion anterior, normalizacion canonical): https://huggingface.co/guqinlizhixian/jzpocr/tree/main/atom-right-f12
- Subdirectorio de mano izquierda: https://huggingface.co/guqinlizhixian/jzpocr/tree/main/lc-parent-b
- Proyecto relacionado guqinMM (OCR de jianzipu y generacion musical): https://github.com/wds-seu/guqinMM/
- README del proyecto guqinMM: https://github.com/wds-seu/guqinMM/blob/main/README.md
