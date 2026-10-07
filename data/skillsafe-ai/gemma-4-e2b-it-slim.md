# skillsafe-ai/gemma-4-E2B-it-slim

## Resumen

Gemma 4 E2B Slim (web) es una variante podada del modelo `litert-community/gemma-4-E2B-it-litert-lm`, publicada por el usuario skillsafe-ai. No es un modelo nuevo ni un ajuste fino: es el mismo grafo LiteRT/TFLite con las filas de las tablas de *per-layer embeddings* (PLE) correspondientes a 78.038 identificadores de token eliminadas. El fichero resultante pasa de 2.003.697.664 bytes a 1.643.165.184 bytes (−18 %), y su version comprimida con gzip (`gzip -n -6`) ocupa 1.469.099.526 bytes (−27 % respecto al original).

La motivacion es el despliegue en navegador. Las tablas PLE (35 capas × 262.144 filas × 128 bytes, en 4 bits) representan el 60 % del fichero original, por lo que recortarlas es la palanca mas eficaz para reducir el peso de descarga en una aplicacion web. El autor conserva las filas de todos los tokens cuyo texto es exclusivamente latin, CJK, kana, puntuacion, simbolos o emoji, mas todos los tokens especiales y de byte (184.106 ids en total), y descarta los de escrituras cirilica, devanagari, arabe, hangul, bengali, thai, tamil y griega, ademas de 6.227 marcadores `<unusedN>`.

El detalle critico es que **el fichero no es cargable directamente**: el runtime web de LiteRT-LM espera tablas completas de 262.144 filas. Hay que reconstruir la disposicion original insertando las filas eliminadas como ceros, para lo cual el repositorio incluye el mapa de bits de retencion (`slim.map.json`), el buffer map y la cabecera TFLite completa (`slim.header.b64.txt`), y un script de reconstruccion en streaming (`slim-expand.js`, para navegador y Node). El modelo esta pensado para [Local Character](https://local-character.skillsafe.ai), que lo ejecuta en el dispositivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma 4 E2B, con *per-layer embeddings* (PLE); el fichero contiene atencion, MLP, embedding principal, tokenizer y metadatos identicos al original |
| Parametros totales | No disponible |
| Parametros activos | No disponible (la nomenclatura "E2B" de la familia sugiere un tamano efectivo en torno a 2.000 millones de parametros, pero la informacion proporcionada no confirma la cifra) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Tablas PLE en 4 bits (128 bytes por fila); el resto de la cuantizacion no se detalla en la informacion disponible |
| Idiomas soportados | Ingles, chino, japones, espanol, frances, italiano, portugues y aleman verificados con respuestas byte a byte identicas al original, ademas de generacion de codigo. Local Character declara siete idiomas de interfaz. Las escrituras cirilica, devanagari, arabe, hangul, bengali, thai, tamil y griega tienen filas de embedding eliminadas |
| Licencia | Apache 2.0 (pesos propiedad de Google, bajo licencia Gemma 4) |
| Formato de pesos | TFLite (`.tflite`) para LiteRT-LM; se distribuye tambien una version comprimida `.tflite.gz` |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado ni ajustado por skillsafe-ai. Se trata de una operacion de poda estructural sobre un artefacto ya entrenado: el fichero `gemma-4-E2B-it-web.task` del repositorio `litert-community/gemma-4-E2B-it-litert-lm` (revision b3ca0d2f, sha256 2cbff161…, 2.003.697.664 bytes). Todo el contenido salvo las tablas de embedding por capa es byte a byte identico al original: mecanismos de atencion, bloques MLP, embedding principal, tokenizer y metadatos. No hay, por tanto, datos de preentrenamiento, tokens procesados ni etapas de RLHF/DPO atribuibles a esta publicacion.

La innovacion tecnica es el criterio de poda. De los 262.144 identificadores de token del vocabulario, se conservan 184.106: todos los que corresponden a texto en escritura latina, CJK, kana, puntuacion, simbolos o emoji, mas los tokens especiales y los tokens de byte. Se eliminan 78.038 identificadores de otras escrituras y los marcadores `<unusedN>`. El autor documenta que un criterio alternativo basado en frecuencia de palabra degradaba incluso el ingles, mientras que el corte por sistema de escritura mantiene intacta la calidad en los idiomas conservados. La reconstruccion es reversible: `slim-expand.js` reinserta las filas ausentes como ceros y regenera el diseno de 262.144 filas que el runtime espera.

## Capacidades

- Generacion de texto conversacional en ingles, chino, japones, espanol, frances, italiano, portugues y aleman, con respuestas byte a byte identicas al modelo original en una bateria de 20 prompts.
- Generacion de codigo, verificada como identica al original en la misma bateria.
- Comprension de entrada en ruso, coreano e hindi cuando el modelo responde en ingles; los detalles pueden perderse (en la prueba documentada, una pregunta aritmetica formulada en ruso se respondio de forma incorrecta).
- Ejecucion en navegador mediante LiteRT-LM web con aceleracion WebGPU, en modo greedy.
- Capacidades heredadas del modelo base Gemma 4 E2B: el repositorio no las enumera y no se dispone de informacion adicional sobre tool calling, uso de agentes o razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en el navegador: es el escenario para el que se creo, integrado en Local Character. El modelo se ejecuta en el dispositivo con WebGPU y responde en los idiomas de interfaz soportados sin enviar datos a un servidor.
- Aplicacion web con IA offline: una PWA puede descargar el `.tflite.gz` de 1,47 GB una sola vez, reconstruir el layout completo con `slim-expand.js` y funcionar sin conexion en visitas posteriores.
- Procesamiento de texto con privacidad estricta: al no requerir backend, el texto del usuario no sale del navegador, lo que encaja en escenarios con requisitos de residencia de datos o de cumplimiento tipo RGPD.
- Generacion de codigo asistida en el cliente: el modelo produce codigo con calidad identica al original, por lo que sirve para autocompletado ligero o explicacion de fragmentos dentro de un editor web.
- Redaccion y reescritura multilingue: cubre ingles, chino, japones, espanol, frances, italiano, portugues y aleman, suficiente para asistentes de redaccion dirigidos a esos mercados.
- Traduccion de entrada multilingue hacia salida en ingles: entiende textos en ruso, coreano o hindi y responde en ingles, util para resumir o clasificar contenido de esas escrituras, asumiendo perdida de detalle.
- Demostraciones y prototipos de LiteRT-LM en web: el fichero reducido acelera la distribucion y la carga en demos tecnicas donde el peso de descarga es un cuello de botella.
- Distribucion optimizada a escala: servir 1,47 GB comprimidos en lugar de 2,00 GB reduce el ancho de banda de un 27 % por usuario, relevante en aplicaciones con muchos despliegues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor si documenta una prueba de equivalencia funcional, que se reproduce a continuacion tal cual aparece en la model card:

| Prueba | Configuracion | Resultado |
|---|---|---|
| Equivalencia byte a byte (ingles, chino, japones, espanol, frances, italiano, portugues, aleman y codigo) | LiteRT-LM web 0.17.1, WebGPU, decodificacion greedy, 20 prompts | Respuestas identicas byte a byte al fichero original |
| Respuestas escritas en ruso, coreano o hindi | Misma configuracion | Respuestas degradadas |
| Entrada en ruso, coreano o hindi con respuesta en ingles | Misma configuracion | Comprension mantenida, con perdida de detalles (una pregunta aritmetica en ruso se respondio incorrectamente) |
| Poda por frecuencia de palabra (alternativa descartada) | Misma configuracion | Degradaba incluso las respuestas en ingles |

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Tamano del fichero |
|---|---|---|---|---|---|---|
| skillsafe-ai/gemma-4-E2B-it-slim | No disponible | No disponible | EN, ZH, JA, ES, FR, IT, PT, DE y codigo (verificados); escrituras cirilica, arabe, hangul, devanagari y otras degradadas | Apache 2.0 | TFLite (no cargable directamente, requiere reconstruccion) | 1.643.165.184 B; 1.469.099.526 B en gzip |
| litert-community/gemma-4-E2B-it-litert-lm | No disponible | No disponible | Sin recorte de vocabulario: cobertura completa de escrituras | Apache 2.0 | TFLite / `.task` (cargable directamente) | 2.003.697.664 B |
| Modelos de la generacion anterior (familia Gemma 3n E2B en formato LiteRT) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El fichero no es cargable de forma directa. Cualquier integracion debe implementar la reconstruccion del layout de 262.144 filas insertando las filas eliminadas como ceros, usando `slim.map.json`, `slim.header.b64.txt` y `slim-expand.js`. Sin ese paso, el runtime de LiteRT-LM web fallara.
- Perdida de capacidad en escrituras no latinas ni CJK: cirilica, devanagari, arabe, hangul, bengali, thai, tamil y griega. Las respuestas redactadas en ruso, coreano o hindi estan degradadas.
- Riesgo de degradacion silenciosa en la comprension de entrada en esos idiomas aunque la respuesta sea en ingles; la propia model card documenta un fallo en una pregunta aritmetica en ruso. No es seguro usar el modelo para tareas que exijan exactitud sobre texto en esas escrituras.
- Los marcadores `<unusedN>` (6.227 ids) tambien se eliminaron, lo que puede afectar a flujos que dependan de ellos.
- No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros), por lo que no hay medida objetiva de calidad mas alla de la equivalencia byte a byte con el original en los idiomas conservados.
- La prueba de equivalencia se limita a 20 prompts con decodificacion greedy en una version concreta del runtime (LiteRT-LM web 0.17.1) sobre WebGPU. No cubre muestreo estocastico, otros backends ni otras versiones.
- Licencia Apache 2.0 segun la model card, con la salvedad de que los pesos son propiedad de Google y estan sujetos a la licencia Gemma 4. Conviene revisar los terminos de dicha licencia antes de un uso comercial.
- Repositorio sin descargas ni likes registrados en el momento de la consulta, publicado por un autor individual (skillsafe-ai) y no por el equipo de LiteRT. No hay garantia de mantenimiento ni de soporte.
- El modelo requiere WebGPU, lo que excluye navegadores y dispositivos sin soporte. No se documentan requisitos minimos de hardware mas alla de esa dependencia.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/skillsafe-ai/gemma-4-E2B-it-slim
- Modelo base: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Aplicacion Local Character: https://local-character.skillsafe.ai
- La busqueda web realizada no ha devuelto enlaces relevantes: los resultados obtenidos correspondian a sitios de contenido para adultos sin relacion alguna con el modelo, por lo que se han descartado.
