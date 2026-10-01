# guqinlizhixian/jzpocr-atom-right-f12

## Resumen

jzpocr-atom-right-f12 es un modelo de reconocimiento optico de caracteres (OCR) especializado en las grafias de la mano derecha de la notacion jianzipu (减字谱) empleada en las partituras de guqin. Lo publica el usuario `guqinlizhixian` en HuggingFace bajo licencia `other` y pipeline `image-classification`. No es un OCR de pagina completa: la entrada es el recorte de un unico caracter y la salida es una lectura estructurada en un lenguaje de dominio especifico, por ejemplo `ATOM|F:大;H:七八;R:抹;S:七`, en el que cada campo codifica tipo, digitacion, posicion de hui, accion de la mano derecha y cuerda.

El peso corresponde a la generacion anterior del sistema (lote F12, tercera continuacion, agosto de 2026) y se empaqueta tal cual como candidato de produccion. El propio autor advierte de que no fue entrenado por el sistema autonomo `jzpOCR` y de que la lista de imagenes de entrenamiento no se incluye en el paquete, por lo que el origen exacto de los datos de entrenamiento no puede verificarse. El archivo de pesos es un `state_dict` de PyTorch de 13,9 MB, lo que lo hace desplegable en CPU.

Su relevancia es de nicho pero clara: cubre la digitalizacion de repertorio historico de guqin, un dominio con muy pocos recursos publicos, mediante un espacio de salida estructurado y auditable. Ademas, la publicacion incluye hashes de verificacion, la procedencia de los ficheros de normalizacion heredados y una discusion explicita de la sensibilidad al preprocesado, algo poco habitual en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; clasificador de imagen PyTorch con cabezas de salida por campo del DSL (la model card menciona una "cabeza de tipo" y cabezas por campo) |
| Parametros totales | no disponible (fichero de pesos `state_dict` de 13,9 MB) |
| Longitud de contexto | no aplica (clasificacion de imagen de un unico recorte de caracter) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | zh (notacion musical guqin; no es un modelo de lenguaje natural multilingue) |
| Licencia | other |
| Formato de pesos | PyTorch `state_dict` (`best_model.pt`), mas `vocab.json` con el vocabulario de inferencia congelado |
| Pipeline (HuggingFace) | image-classification |
| Tarea real | OCR de caracter individual (ATOM, mano derecha) con salida estructurada tipo DSL |
| Tamano del repositorio | 0.0 GB segun la ficha de HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-01 |
| Fecha de ultima actualizacion | 2026-10-01 |
| Identificador interno del activo | `MODEL-ATOM-F12-CONT3-20260813` |
| sha256 de los pesos | `6fb35bfe5951ab4d3bb8b70665c9bcd10ca07289dce8eb407d754f94535e9653` |

## Arquitectura y entrenamiento

La model card no describe la columna vertebral de la red. Lo que si se detalla es la interfaz: el modelo consume el recorte de un solo caracter de jianzipu (no una pagina completa) y produce una cadena DSL con campos discretos. El prefijo de salida es siempre `ATOM`, correspondiente a la mano derecha. El modelo dispone de una cabeza de tipo, pero los datos de entrenamiento no incluian las clases de mano izquierda (`LC`), puntuacion (`MARK`) ni silencio (`REST`), por lo que esas clases no son utilizables. El paquete incluye la definicion del modelo, las reglas del DSL y la normalizacion de texto copiadas byte a byte del repositorio principal `jzpOCR` (`jzp_atom/models.py`, `jzp_atom/dsl.py`, `jzp_atom/normalize.py`), con hashes sha256 registrados.

El entrenamiento se realizo sobre `atom_component_composition_gate_p0_20260811/third_continuation_dataset_remote`, con 17.227 muestras de entrenamiento y 3.442 de validacion, optimizador AdamW, 15 epocas y `lr` con recocido coseno hasta cero. La mejor epoca fue la 13, seleccionada con criterio de dominio externo. Un aspecto critico documentado es el preprocesado: la inferencia exige normalizacion en modo `canonical` y escala de entrada `[-1, 1]`. Cambiar a `inkfit` hace caer el resultado de 83/132 a 58/132, y cambiar la escala a `[0, 1]` lo hace caer de 82/132 a 43/132 sobre las mismas 132 muestras. Como `canonical` no existe en el modulo `jzp_core.normalize` del repositorio principal, el paquete incorpora los dos ficheros heredados necesarios en `legacy_norm/`, verificados byte a byte contra una instantanea de codigo de la generacion anterior.

## Capacidades

- Reconocimiento de un caracter individual de la mano derecha de jianzipu a partir de un recorte de imagen.
- Salida estructurada en DSL con los campos F (digitacion), H (posicion de hui), R (accion de la mano derecha), S (cuerda), T (cuerda al aire o armonico) y D (modificaciones como 注 o 绰).
- Clasificacion de tipo con prefijo fijo `ATOM`.
- Inferencia en CPU o GPU mediante el script minimo `infer.py`, que solo depende de los directorios incluidos en el propio repositorio.
- Procesamiento por lotes de varias imagenes en una misma invocacion (`python infer.py --device cuda 图1.png 图2.png`).
- No soporta tool calling ni function calling: es un clasificador de imagen, no un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni generacion de texto libre.
- No soporta vision general: fuera de los recortes de caracteres de jianzipu no hay evidencia de funcionamiento.
- No procesa paginas completas; requiere un detector de maquetacion previo que recorte cada caracter.
- No cubre mano izquierda (`LC`), puntuacion (`MARK`) ni silencio (`REST`).
- No dispone de cabeza funcional para el segundo grupo de cuerdas (`S2`), anadido con posterioridad a este peso.

## Casos de uso

- Digitalizacion de cancioneros historicos de guqin: un pipeline de deteccion de maquetacion recorta cada grafia de la pagina y este modelo la convierte en una lectura estructurada; es adecuado porque su salida ya esta normalizada por campos y puede almacenarse en base de datos sin postprocesado manual.
- Pre-etiquetado para el bucle de mejora del propio sistema: la model card indica que estos pesos se usaron como candidato de produccion para pre-etiquetar en el ciclo de retroalimentacion (`flywheel`) de la generacion anterior, de modo que su funcion natural es generar anotaciones iniciales que luego se revisan.
- Herramienta de estudio para interpretes: dada la fotografia de una grafia desconocida, la aplicacion devuelve digitacion, hui, accion y cuerda, lo que permite consultar repertorio poco editado sin conocimiento previo de la notacion.
- Catalogacion y metadatos en archivos y bibliotecas musicales: indexar automaticamente cada grafia de un fondo documental para permitir busquedas por digitacion, hui o cuerda, gracias a la granularidad de campo del DSL.
- Busqueda de fragmentos por patron tecnico: al tener campos separados, es posible recuperar pasajes que compartan una combinacion concreta de accion y cuerda en todo un corpus digitalizado.
- Verificacion asistida de transcripciones: comparar la lectura automatica con una transcripcion humana campo a campo y marcar discrepancias para revision, ya que cada campo tiene su propia tasa de acierto declarada.
- Investigacion musicologica cuantitativa: extraer estadisticas de frecuencia de digitaciones, posiciones de hui y cuerdas sobre corpus digitalizados para analisis de estilo o de repertorio.
- Aplicaciones moviles de reconocimiento de partituras: al ser un `state_dict` de 13,9 MB, puede ejecutarse en CPU o en GPU de gama de entrada, lo que permite integraciones locales sin servidor.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas del propio autor sobre el conjunto `fixed_dev`, de 132 recortes, formado por dos subpaquetes congelados y permanentemente excluidos del entrenamiento (`PackageA`, 72 elementos, y `real110`, 60 elementos).

| Metrica | Valor |
|---|---|
| `whole_exact` (todos los campos correctos) | 83/132 = 62,88 % |
| `whole_exact` en `PackageA` | 49/72 |
| `whole_exact` en `real110` | 34/60 |

| Campo | Significado | Precision |
|---|---|---|
| F | Digitacion | 97,2 % |
| S | Cuerda | 94,5 % |
| T | Cuerda al aire / armonico | 94,4 % |
| R | Accion de la mano derecha | 87,9 % |
| D | Modificacion (注 / 绰, etc.) | 85,0 % |
| H | Posicion de hui | 75,0 % |
| S2 | Segundo grupo de cuerdas | 0/4 (el peso no tiene esa cabeza) |

El autor senala dos matices importantes: el sistema de la generacion anterior registro 84/132 en la misma tanda (49/72 + 35/60), frente a los 83/132 recalculados en este paquete, diferencia atribuida aun no localizada en los parametros de borde de la normalizacion `canonical`; y el tamano de muestra es de n=132, con un error estandar aproximado de 4,2 puntos porcentuales en torno a p≈0,63, de modo que diferencias inferiores a 8 puntos porcentuales en una sola ronda no son concluyentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; dado que el fichero de pesos es un `state_dict` de 13,9 MB, la huella de memoria es muy reducida y no deberia representar un cuello de botella en ninguna GPU moderna ni en CPU.
- GPU recomendadas: no se especifican. El script de inferencia admite `--device cuda`, pero tambien funciona sin GPU.
- Cabe en GPU de consumo: si, por el tamano del peso; no se publica una lista de modelos verificados.
- Opciones de despliegue: ejecucion directa con PyTorch mediante `infer.py` (unico metodo documentado). No se mencionan vLLM, llama.cpp, Ollama, TGI ni exportaciones a ONNX o TensorRT.
- Latencia y throughput estimados: no disponible.
- Dependencias: las declaradas en `requirements.txt` del repositorio, mas los directorios incluidos `jzp_atom/` y `legacy_norm/`. No es necesario instalar `jzpOCR`.

## Comparativa con modelos similares

La model card solo menciona una alternativa del mismo proyecto, y advierte que los numeros no son comparables porque usan normalizacion y escala de entrada distintas.

| Modelo | Origen | Metrica declarada | Preprocesado | Licencia |
|---|---|---|---|---|
| `guqinlizhixian/jzpocr-atom-right-f12` (este) | Generacion anterior, lote F12 continuacion 3 | 83/132 = 62,88 % | `canonical` + `[-1, 1]` | other |
| `grydlmq/jzpocr-atom-right` | Sistema de entrenamiento autonomo `jzpOCR` | 76/132 = 57,58 % | `inkfit` + `[0, 1]` | no disponible |

No se han identificado en la busqueda web otros modelos publicos comparables para OCR de jianzipu de guqin; los resultados de busqueda obtenidos corresponden a rankings genericos de modelos de lenguaje y no aportan alternativas de esta categoria.

## Limitaciones y advertencias

- No es un OCR de pagina completa: exige recortes de un unico caracter y un detector de maquetacion previo.
- Solo reconoce la mano derecha; la mano izquierda, la puntuacion y los silencios quedan fuera del alcance real del modelo pese a existir una cabeza de tipo.
- Ausencia de cabeza para `S2` (segundo grupo de cuerdas): los 4 casos de ese campo fallan por no haber sido entrenados, no por error de aprendizaje.
- Sensibilidad extrema al preprocesado: cambiar el modo de normalizacion o la escala de entrada provoca caidas de mas de 20 puntos porcentuales en `whole_exact`.
- Tamano de evaluacion reducido (n=132) con error estandar aproximado de 4,2 puntos porcentuales; no hay cifras de nivel de pagina.
- Las cifras de distintos preprocesados no son comparables entre si.
- La lista de imagenes de entrenamiento no se incluye en el paquete, por lo que la procedencia de los datos no puede verificarse; el autor no afirma que provengan de `琴曲集成`.
- Posible sesgo hacia el estilo de grafia presente en los corpus de entrenamiento no verificados, con degradacion esperada en ediciones o epocas distintas.
- Riesgo de error alto en el campo H (posicion de hui), con un 75,0 % de precision frente a mas del 94 % en cuerda y tipo.
- Licencia `other`: no se detallan los terminos, por lo que el uso comercial no esta claro y requiere consulta con el autor.
- Repositorio sin descargas ni likes en el momento de la consulta, publicado en octubre de 2026, lo que limita la validacion independiente por terceros.
- No debe usarse como modelo generativo, de agentes ni de razonamiento: su unica funcion es la clasificacion de imagen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guqinlizhixian/jzpocr-atom-right-f12
- Repositorio relacionado citado en la model card: https://huggingface.co/grydlmq/jzpocr-atom-right
- Proyecto principal citado (`jzpOCR`), sin URL publica indicada en la informacion disponible: no disponible
- Paper, blog o demo asociados: no disponible
- La busqueda web realizada no devolvio enlaces relevantes para este modelo; los resultados obtenidos eran rankings genericos de modelos de lenguaje.
