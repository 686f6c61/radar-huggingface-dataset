# guqinlizhixian/jzpocr-lc-parent-b

## Resumen

jzpOCR · lc-parent-b es un modelo de reconocimiento de texto especializado en la notacion musical china *jianzipu* (减字谱) de guqin, concretamente en la lectura de los caracteres de la mano izquierda agrupados en una "madre" o bloque (母图). Lo publica el usuario guqinlizhixian y esta construido sobre el modelo base oficial PP-OCRv6_medium_rec de PaddleOCR, ajustado con recetas propias sobre un corpus especifico de este dominio musical. El problema que resuelve es acotado pero real: convertir el recorte de un bloque de notacion de mano izquierda en una cadena de lectura legible, tarea para la que los modelos OCR genericos no estan entrenados.

Es un modelo de vision a texto (pipeline `image-to-text`) muy pequeno, de 76 MB en formato de inferencia de Paddle, con un diccionario de 18.708 caracteres. Su relevancia es limitada y acotada a un nicho de musicologia y digitalizacion de patrimonio: no es un modelo de lenguaje, no razona y no genera texto libre. El propio autor lo etiqueta explicitamente como no apto para produccion, con el estado de registro `recovered_not_production`, y lo publica para cubrir el hueco de "reconocimiento de mano izquierda" en su sistema mayor.

La cifra clave que aporta la model card es un `exact` (cadena completa correcta) de 122/239 = 51,05 % sobre una misma tanda de 239 imagenes madre, frente al 26,36 % de su predecesor B1, una mejora de 24,69 puntos porcentuales medida de forma pareada sobre el mismo lote y el mismo estandar de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en PP-OCRv6_medium_rec (PaddleOCR) para reconocimiento de texto, con decodificacion CTC |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). Entrada de imagen normalizada a 48 px de alto x 320 px de ancho fijo y rellenada con ceros; la longitud de salida la determina la decodificacion CTC |
| Tipos de cuantizacion | No disponible (solo se distribuye el modelo en formato de inferencia de Paddle, 76 MB) |
| Idiomas soportados | Chino (`zh`); diccionario de 18.708 caracteres de PP-OCRv6 |
| Licencia | `other` (sin especificar; condiciones de uso comercial no disponibles) |
| Formato de pesos | Paddle Inference / PIR: `inference.json` + `inference.pdiparams`; se acompana `inference.yml` como configuracion oficial |

## Arquitectura y entrenamiento

El modelo parte del checkpoint preentrenado oficial PP-OCRv6_medium_rec de PaddleOCR, un reconocedor de texto de la familia PP-OCR. La model card no detalla la topologia interna mas alla de la base y de que la salida se decodifica con CTC, evidenciado por la columna `ctc_conf` que el propio paquete define. La entrada no es una pagina completa ni un caracter aislado, sino el recorte completo de un bloque madre de mano izquierda, y la salida es una cadena de lectura sin segmentar.

El ajuste se hizo con la receta `lc_task_aligned_parent_B_bs160_e100_20260724`: batch de 160, 100 epocas, `lr 2e-4` y semilla 1024, sobre el conjunto `lc_qjjc_ppocrv6_parent_sequence_dataset_v1_20260724`, compuesto por los bloques madre actuales mas 1.009 cadenas madre completas antiguas. Los brazos A y B de esta familia de experimentos son un control emparejado con receta fija identica (`fixed_recipe`) que solo difiere en los datos. El checkpoint publicado es el seleccionado por `best_accuracy` (criterio: maximizar la exactitud de validacion, luego `norm_edit_dis`, y en caso de empate el epoch mas temprano). El autor advierte que la lista de imagenes de entrenamiento no se distribuye con el paquete, por lo que no se puede verificar la procedencia de las partituras; otras variantes del mismo sistema usan recortes de paginas de la coleccion *Qinqu Jicheng*, pero ese dato no esta confirmado para este peso concreto.

## Capacidades

- Reconocimiento de notacion jianzipu de guqin para la mano izquierda: recibe el recorte completo de un bloque madre y devuelve la cadena de lectura (por ejemplo, `上三三`).
- Salida en cadena sin segmentar: la separacion por ranuras y roles semanticos (`LC|上:九;上:八`) la realiza el repositorio principal `jzpOCR` mediante el modulo `lc_segment`; este paquete no la hace.
- Procesamiento por lotes: el script `infer.py` acepta una imagen o un directorio de imagenes y devuelve, por linea, nombre de archivo, cadena reconocida y `ctc_conf`.
- Puntuacion de confianza propia: la tercera columna de salida es una confianza CTC definida en este paquete (media geometrica de las probabilidades del caracter elegido en los pasos retenidos). El autor indica que se parece a la columna `score` del registro anterior, con una diferencia media de 0,016 sobre las mismas 239 muestras, pero que no esta confirmado que sea la misma formula.
- Entrada multimodal de un solo tipo: solo imagenes de bloques madre previamente recortados. No hay soporte de tool calling, agentes, razonamiento multi-paso, audio ni generacion de texto libre.
- No incluye deteccion de layout: el recorte del bloque de mano izquierda debe hacerse antes, por fuera del modelo.

## Casos de uso

- Digitalizacion de repertorio de guqin: integrar el modelo al final de una cadena que haga deteccion de pagina, deteccion de bloques y recorte de la region de mano izquierda, para convertir ediciones impresas en cadenas de lectura indexables.
- Investigacion musicologica asistida: procesar por lotes un corpus de partituras y usar las cadenas resultantes para construir indices de digitacion y de recursos tecnicos, tarea repetitiva donde el 51 % de `exact` sirve como preanotacion que un experto corrige despues.
- Preanotacion para transcripcion humana: generar cadenas candidatas con su `ctc_conf` y ordenar por confianza, de modo que el transcriptor revise primero los casos dudosos y no parta de cero.
- Construccion de bases de datos de notacion comparada: normalizar la salida con el `lc_segment` del repositorio principal para obtener estructuras `LC|` por ranura y poder consultar patrones de mano izquierda entre piezas.
- Verificacion y control de calidad editorial: detectar discrepancias entre una edicion ya transcrita y las cadenas que produce el modelo sobre el mismo recorte, marcando bloques para revision.
- Docencia e interfaces de practica: alimentar una aplicacion que muestre la lectura de un bloque de mano izquierda a partir de una foto de la partitura, con la ventaja de que el modelo es pequeno y puede ejecutarse en el mismo equipo que la interfaz.
- Prototipado de un pipeline OCR completo para *jianzipu*: usar este peso como modulo de reconocimiento de mano izquierda, combinado con los pesos de nivel de unidad (`MODEL-LC-FINE-BS152-001` y los brazos A/B/C), que requieren deteccion adicional por componentes, para comparar ambos disenos.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a una evaluacion de `exact` (cadena completa identica) sobre el `holdout_list.txt` de `lc_qjjc_ppocrv6_parent_sequence_dataset_v1_20260724`, con 239 imagenes madre, comparando dos pesos con la misma forma de tarea (imagen madre completa de entrada, cadena completa de salida, sin cajas):

| Modelo | exact sobre 239 imagenes madre |
|---|---|
| jzpocr-lc-parent-b (strict-parent B) | 122/239 = 51,05 % |
| B1 (column-path CTC v2, integrado en el repositorio `jzpocr`) | 63/239 = 26,36 % |
| Diferencia | +24,69 puntos porcentuales |

Analisis pareado de la misma tanda: 66 casos los acierta solo este modelo, 7 solo B1 y 110 fallan en ambos. El autor subraya varias cautelas: la metrica es `exact` estricto de cadena completa, no exactitud por caracter, por lo que las cadenas largas son mas dificiles; la evaluacion es a nivel de bloque madre, no de pagina, y no existe cifra de extremo a extremo a nivel de pagina; y la exactitud de validacion de 0,6698 registrada en otro lugar corresponde a un conjunto distinto (106 lineas) y no es comparable con estas cifras. No hay resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark general, porque no son aplicables a este modelo.

## Requisitos de hardware

- Huella en disco: el modelo de inferencia ocupa 76 MB y el repositorio completo 0,1 GB. No requiere GPU para funcionar.
- VRAM estimada: por debajo de 1 GB en precision completa; el modelo cabe sin problema en cualquier GPU consumer actual e incluso en CPU.
- GPU recomendadas: no se especifican. Cualquier GPU compatible con PaddlePaddle sirve; una GTX 1650 o superior ya aprovecha la aceleracion, y una RTX 4090 o A100 estarian sobredimensionadas para el modelo salvo por el procesamiento por lotes.
- Compatibilidad con GPU consumer: si, en cualquier tarjeta con soporte de CUDA y PaddlePaddle, y tambien en CPU.
- Opciones de despliegue: Paddle Inference en formato PIR, invocado directamente con el par `inference.json` + `inference.pdiparams` y `inference.yml`. Solo se necesita `paddlepaddle`, no el framework de entrenamiento de PaddleOCR. No se distribuyen exportaciones a ONNX, GGUF, ni integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de reconocimiento de imagen.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen ni rendimiento por lote.

## Comparativa con modelos similares

Dentro de la informacion disponible solo hay comparables del mismo sistema, no alternativas de la industria:

| Modelo | Forma de tarea | exact (239 imagenes madre) | Estado |
|---|---|---|---|
| jzpocr-lc-parent-b (strict-parent B) | Bloque madre completo a cadena completa | 51,05 % | Publicado, `recovered_not_production` |
| B1 (column-path CTC v2) | Igual forma de tarea | 26,36 % | Integrado en el repositorio principal `jzpocr` |
| LC-task-aligned-strict-parent-A | Misma tarea (control emparejado de A/B) | No disponible | Solo quedan registros y datos; los pesos fueron eliminados |
| MODEL-LC-FINE-BS152-001 y brazos A/B/C | Nivel de unidad (caja dada, componente a componente) | No comparable | Requieren un detector adicional para poder desplegarse |

Frente a OCR genericos como los reconocedores estandar de PP-OCRv6 o Tesseract, no hay datos comparativos publicados en esta model card; ademas, ninguno de ellos esta entrenado para notacion *jianzipu*, por lo que la comparacion directa no seria informativa sin una evaluacion propia.

## Limitaciones y advertencias

- No es una version de produccion: el estado de registro es `recovered_not_production` y el autor lo declara explicitamente como no apto para explotacion.
- Renderizado aproximado del 49 %: con un `exact` del 51,05 %, aproximadamente la mitad de los bloques madre se leen mal de forma completa. Es un modelo de preanotacion, no de transcripcion automatica fiable.
- Requiere preprocesado obligatorio: BGR, alto fijo de 48 px, ancho fijo de 320 px con relleno de ceros y normalizacion a `[-1, 1]`. Cualquier desviacion respecto a `inference.yml` degrada el resultado.
- Diccionario fijo: `dict.txt` contiene 18.708 caracteres y debe usarse tal cual; cambiarlo provoca desalineacion de indices.
- Sin deteccion de layout: la entrada debe ser ya el recorte del bloque madre. No procesa paginas completas ni caracteres sueltos.
- Salida sin segmentar: la separacion por ranuras y roles semanticos requiere el modulo externo `lc_segment`.
- Sesgo de dominio: entrenado solo con notacion de guqin en chino. No es util para otros idiomas, otras notaciones musicales ni OCR general.
- Procedencia del corpus no verificable: la lista de imagenes de entrenamiento no se distribuye y el origen de las partituras no esta confirmado para este peso.
- Riesgo de error silencioso: el modelo siempre devuelve una cadena y una confianza CTC propia, sin umbral de rechazo. La columna `score` de registros anteriores no es exactamente la misma magnitud, por lo que no deben intercambiarse.
- Licencia `other` sin texto publicado: no hay certeza sobre el uso comercial ni sobre las obligaciones de atribucion. Conviene aclararlo con el autor antes de cualquier despliegue.
- Base de evaluacion reducida: n=239 a nivel de bloque, sin cifras a nivel de pagina ni en otros conjuntos.
- Sin traccion en la plataforma: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guqinlizhixian/jzpocr-lc-parent-b
- Modelo base referenciado en la model card: PP-OCRv6_medium_rec de PaddleOCR (no se proporciona URL directa en la informacion disponible)
- Repositorio principal referenciado por el autor: `jzpOCR` y su modulo `lc_segment` (no se proporciona URL directa en la informacion disponible)
- La busqueda web realizada no devolvio ningun enlace relevante para este modelo: los resultados obtenidos corresponden a servicios de video generado, visualizaciones de arboles genealogicos de modelos de lenguaje, listados de API gratuitas y blogs de tendencias, ninguno relacionado con OCR de *jianzipu* ni con guqin.
