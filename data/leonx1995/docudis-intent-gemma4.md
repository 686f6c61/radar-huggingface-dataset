# leonx1995/docudis-intent-gemma4

## Resumen

Docudis intent (docudis-intent-gemma4) es un modelo de lenguaje especializado en interpretar instrucciones de anonimización y convertirlas en un objeto JSON de configuración. Lo desarrolla leonx1995 como componente del proyecto Docudis, que sustituye datos personales en documentos por etiquetas directamente en el dispositivo del usuario. Su diseño es restrictivo por contrato: el modelo recibe unicamente la instruccion en lenguaje natural (por ejemplo, «oculta los nombres y los telefonos, los importes pueden quedarse, es una nomina francesa») y nunca accede al documento en si.

Tecnicamente es un ajuste fino mediante LoRA sobre google/gemma-4-E2B-it, con 4.647.450.147 parametros declarados en safetensors, y se distribuye en formato GGUF cuantizado Q8_0 (3,6 GB) para su ejecucion con llama.cpp. La salida se fuerza con decodificacion restringida por gramatica (fichero intent.gbnf) y se completa despues con un post-procesado en el host que valida el esquema y descarta campos no soportados.

Su relevancia actual esta en el nicho de la anonimizacion de PII en el borde (on-device): en lugar de enviar documentos a un servidor, el modelo solo transforma la intencion del usuario en ajustes de deteccion, lo que reduce la superficie de exposicion de datos. El autor reporta un 89,7% de coincidencia exacta del JSON completo en un conjunto de test congelado de 300 casos, frente al 43,5% del modelo base cuando se le da el mismo prompt con la especificacion completa y seis ejemplos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder heredada de google/gemma-4-E2B-it; detalle interno no disponible |
| Parametros totales | 4.647.450.147 (4,65 B, dato declarado en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | Entrenado con secuencias de hasta 512 tokens; configuracion de servidor recomendada `-c 2048`; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q8_0 con embeddings por capa en Q4_K y embeddings de tokens en Q8_0 (fichero `intent-mixq8.gguf`, 3,6 GB) |
| Idiomas soportados | zh, en, fr, es, de, it (tambien mensajes con mezcla de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA de google/gemma-4-E2B-it realizado con Unsloth. La base se cargo en 4 bits (QLoRA) y el adaptador se aplico sobre las capas de atencion y MLP del modelo de lenguaje, con rango 16, alpha 16 y sin dropout. El entrenamiento duro 3 epocas con tasa de aprendizaje 2e-4, esquema coseno y 5% de warm-up, weight decay 0,01, batch efectivo 16 y secuencias de hasta 512 tokens; la perdida se calculo solo sobre la respuesta (no sobre el prompt), con semilla 1. El adaptador se fusiono en la base de 16 bits y se convirtio con llama.cpp b11379.

Los datos de entrenamiento son 1.272 pares instruccion → JSON (mas 141 reservados para validacion) en chino, ingles, frances, espanol, aleman, italiano y mensajes multilingues. Son datos **sinteticos**, escritos con un LLM (Claude) a partir de la especificacion, abarcando desde comandos cortos hasta mensajes largos, informales o con faltas de ortografia, y algunos intentos de anular las reglas del sistema; despues se revisaron y corrigieron caso por caso con una segunda pasada de LLM. No contienen datos personales reales: todos los nombres e identificadores son inventados. Los casos proximos a cualquier instruccion de evaluacion se eliminaron antes del entrenamiento. La innovacion practica destacable es la combinacion de decodificacion restringida por gramatica, un campo `unsupported` para peticiones imposibles y un post-procesado en el host que elimina inyecciones de prompt y terminos que no aparecen en la instruccion.

## Capacidades

- Generacion de JSON estructurado y validable, forzado mediante gramatica GBNF en decodificacion restringida.
- Interpretacion de instrucciones de anonimizacion en lenguaje natural y traduccion a ajustes de deteccion: campos `types`, `regions`, `verticals`, `dictionary`, `never_hide` y `unsupported`.
- Clasificacion de tipos de entidad en `hide`, `keep` u `off` (PERSON, EMAIL, PHONE, ID NUMBER, CARD, IBAN, DATE, BIRTH_DATE, AMOUNT, IP, URL, ADDRESS, COMPANY, SECRET, API_KEY y el comodin `*`).
- Asignacion de paquetes de reglas por pais (`at be ch cn de dk es fi fr gb ie it jp nl no pl pt se us`) y de dominio documental (`healthcare legal finance employment insurance technology utilities`).
- Multilingue en seis idiomas (zh, en, fr, es, de, it) y en mensajes con mezcla de idiomas.
- Deteccion de peticiones no soportadas (nombres falsos, enmascarado parcial, traduccion, ocultar solo a algunas personas) mediante el campo `unsupported`.
- Uso conversacional de un solo turno: lee una instruccion y devuelve un unico objeto JSON, sin memoria del documento.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponibles (el modelo no esta disenado para ello; de hecho se debe desactivar el bloque de razonamiento con `--reasoning off`).

## Casos de uso

- Anonimizacion de documentos en el dispositivo: una aplicacion de escritorio o movil pide al usuario que describa que quiere ocultar; el modelo convierte esa frase en la configuracion JSON que el motor de deteccion local aplicara despues sobre el documento, sin que este salga del equipo.
- Cumplimiento de RGPD en procesamiento local: al no exponer el documento y traducir solo la intencion del usuario a reglas, se reduce el tratamiento de datos personales en servidores de terceros.
- Preprocesado de instrucciones para un pipeline NER: el JSON generado actua como capa de configuracion por encima de un detector de entidades, decidiendo que tipos se ocultan, se mantienen o se desactivan.
- Documentos sectoriales especificos: con los campos `regions` y `verticals`, el modelo ajusta el comportamiento a nominas francesas, informes medicos o contratos legales segun el dominio detectado en la instruccion.
- Gestion de listas literales: mediante `dictionary` y `never_hide`, el usuario puede pedir que se oculten o se mantengan terminos concretos copiados de su propia instruccion.
- Defensa frente a inyeccion de prompt: el post-procesado del host descarta ordenes como «haz lo que quieras con el resto» y terminos que no aparecen en la instruccion, de modo que el modelo no puede ampliar por si solo el alcance de lo que se oculta.
- Seleccion de reglas por pais en aplicaciones internacionales: a partir de la mencion del tipo de documento o del pais, el modelo anade los paquetes de reglas correspondientes (por ejemplo, `fr` para una nomina francesa).
- Interfaz de configuracion asistida: en lugar de que el usuario navegue por menus de tipos de entidad, escribe una frase y el modelo produce el objeto de configuracion listo para aplicar.

## Benchmarks y rendimiento

Coincidencia exacta del objeto JSON completo, temperatura 0, decodificacion restringida e incluyendo el post-procesado del host:

| Conjunto | Casos | Coincidencia exacta | Fugas |
|---|---|---|---|
| Test, congelado (escrito con independencia de los datos de entrenamiento y nunca usado para ajustarlos) | 300 | 89,7% | 4 (1,3%) |
| Dev (usado para orientar los datos de entrenamiento) | 272 | 88,2% | 2 |
| Base google/gemma-4-E2B-it con la especificacion completa y seis ejemplos (primeros 200 casos de dev) | 200 | 43,5% | no disponible |
| Test sin post-procesado | 300 | 85,3% | no disponible |

Una *fuga* es un fallo que deja visible algo que el usuario queria ocultar. En ambos conjuntos cada fuga conserva lo incorrecto: «manten el nombre del medico» interpretado como mantener todos los nombres, o el nombre de un arrendador tomado por una empresa. La mayor parte de la diferencia de 4,4 puntos entre 85,3% y 89,7% corresponde a regiones y sectores (`regions` y `verticals`) que el modelo omite. Tres semillas de entrenamiento sobre los mismos datos difieren en torno a un punto.

Latencia para una instruccion (salida de 15 a 30 tokens): aproximadamente 0,12 s en una RTX 3080 y unos 3 s en CPU de escritorio (Intel i7-13700KF, sin GPU). Throughput agregado no disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 5 a 6 GB con la cuantizacion Q8_0 (pesos de 3,6 GB mas overhead de contexto y runtime); cifra estimada a partir del tamano del fichero, no confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 6 u 8 GB de VRAM; el autor reporta 0,12 s por instruccion en una RTX 3080. GPU de gama alta (A100, H100) no son necesarias para este modelo.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3080, RTX 4070 o superiores con 8 GB o mas de VRAM.
- Despliegue: llama.cpp / `llama-server` (es el formato distribuido). El tag del repositorio incluye `endpoints_compatible`, por lo que puede servirse tras una API compatible. Ollama, vLLM y TGI no estan confirmados para este artefacto.
- Comando sugerido por el autor: `llama-server -m intent-mixq8.gguf -ngl 99 -c 2048 --jinja --reasoning off --reasoning-budget 0`, enviando `system_prompt.txt` como mensaje de sistema y la instruccion del usuario como mensaje de usuario, con temperatura 0 y el contenido de `intent.gbnf` como gramatica.
- Latencia: 0,12 s por instruccion en RTX 3080 y 3 s en CPU i7-13700KF (sin GPU). Ejecucion viable en CPU para este caso de uso por el tamano reducido de la salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento declarado |
|---|---|---|---|---|---|
| docudis-intent-gemma4 | 4,65 B (declarados) | 512 tokens de entrenamiento / 2048 en configuracion de servidor | Apache-2.0 | Conversion de instruccion de anonimizacion a JSON | 89,7% de coincidencia exacta (test, 300 casos) |
| google/gemma-4-E2B-it (base, con prompt completo y seis ejemplos) | no disponible | no disponible | Licencia Gemma (no especificada en la informacion disponible) | Proposito general | 43,5% en los primeros 200 casos de dev |
| Otros modelos de anonimizacion o extraccion de PII comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos sobre otras alternativas especializadas en conversion de instrucciones de anonimizacion a configuracion JSON, por lo que la comparacion se limita al modelo base.

## Limitaciones y advertencias

- Solo interpreta instrucciones en los seis idiomas indicados (zh, en, fr, es, de, it); otros idiomas no han sido probados.
- No distingue el nombre de una persona del de otra (un medico de un paciente). Estas peticiones se devuelven como el tipo completo oculto mas `unsupported` y, ocasionalmente, como el tipo completo mantenido: son las fugas reportadas. El host deberia mostrar al usuario que se va a ocultar antes de aplicar los cambios.
- Riesgo de fuga (1,3% en el conjunto de test): un fallo puede dejar visible algo que el usuario queria ocultar.
- El modelo no lee el documento, por lo que no puede validar por si mismo si la instruccion se corresponde con el contenido real del fichero.
- Requiere decodificacion restringida por gramatica y post-procesado en el host para alcanzar las cifras de evaluacion; sin post-procesado la puntuacion baja al 85,3%. No debe usarse `response_format`, porque cambia el prompt y el modelo arranca con un bloque de razonamiento.
- El entrenamiento se hizo con datos sinteticos generados por un LLM; pueden existir sesgos derivados de esa generacion y de la especificacion empleada.
- Los datos de entrenamiento no contienen PII real, lo que limita la variedad de casos reales de nombres e identificadores.
- Licencia Apache-2.0, por lo que el uso comercial esta permitido; conviene verificar aparte las condiciones de la licencia del modelo base google/gemma-4-E2B-it, no detalladas en la informacion disponible.
- Contexto efectivo pequeno (entrenado con secuencias de 512 tokens y configurado con ventana de 2048): no esta pensado para instrucciones muy largas ni para resumir documentos.
- Repositorio con 0 descargas y 0 «likes» en el momento de la consulta; el modelo es reciente (creado el 2026-10-04) y no cuenta con validacion de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leonx1995/docudis-intent-gemma4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Codigo del componente intent (formato de salida, post-procesado, evaluacion y pipeline de entrenamiento), commit dda66a3: https://github.com/stonetech-pxia/docudis-ner/tree/dda66a3/intent
- Especificacion completa: https://github.com/stonetech-pxia/docudis-ner/blob/dda66a3/intent/spec.md
- Esquema JSON de validacion: https://github.com/stonetech-pxia/docudis-ner/blob/dda66a3/intent/schema.json
- Post-procesado del host: https://github.com/stonetech-pxia/docudis-ner/blob/dda66a3/intent/postprocess.py
- Datos de entrenamiento (pares instruccion → JSON): https://github.com/stonetech-pxia/docudis-ner/tree/dda66a3/intent/train/raw
- Proyecto Docudis: https://docudis.com
- Unsloth: https://github.com/unslothai/unsloth
