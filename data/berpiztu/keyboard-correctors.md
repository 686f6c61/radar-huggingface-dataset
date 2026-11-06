# berpiztu/keyboard-correctors

## Resumen

`berpiztu/keyboard-correctors` es un corrector ortografico y de puntuacion para espanol e ingles, afinado a partir de `google/mt5-small` y exportado a ONNX para ejecucion en dispositivo. Lo desarrolla Berpiztu como componente del teclado predictivo Berpiztu AI Keyboard (Android y Windows), y su funcion es doble: reescribir la frase escrita hasta el momento corrigiendo erratas, acentos, mayusculas, puntuacion y palabras introducidas por error de tecleo o deslizamiento, y sugerir la palabra que se esta escribiendo.

El modelo se distribuye como un unico corrector (`small-a-wiki`) en dos carpetas de artefactos ONNX (encoder y decoder) junto con el tokenizador SentencePiece y un manifiesto JSON con tamanos y hashes SHA-256. El repositorio ocupa 0,8 GB y la inferencia se realiza con ONNX Runtime en el propio dispositivo, sin enviar texto a servidores externos, lo que lo hace adecuado para escenarios con requisitos de privacidad estrictos.

La relevancia actual reside en su enfoque de despliegue: un modelo seq2seq de 300 millones de parametros cuantizado a 8 bits para caber en movil, con un proceso de alineacion propio (Virtus) orientado a reducir falsos positivos sobre frases ya correctas. No obstante, se trata de un artefacto muy especifico de una aplicacion concreta, con cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicos mas alla de las metricas internas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mT5), exportado a ONNX |
| Parametros totales | no disponible (modelo base `google/mt5-small`, aproximadamente 300 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (376 MB) y exportacion de 8 bits mencionada en la model card |
| Idiomas soportados | espanol (es), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`), tokenizador `spiece.model` |

## Arquitectura y entrenamiento

El modelo parte de `google/mt5-small`, un transformer encoder-decoder multilingue con atencion completa y vocabulario SentencePiece compartido. El autor lo afina como modelo text2text: la entrada es la frase tecleada hasta el momento y la salida es la misma frase reescrita con las correcciones aplicadas, ademas de la sugerencia de finalizacion de palabra. La exportacion a ONNX separa encoder y decoder para permitir la ejecucion con ONNX Runtime en Android y Windows.

Los datos de entrenamiento combinan Tatoeba (CC BY 2.0 FR), OpenSubtitles v2018 via OPUS (con la cita de Lison, Tiedemann y Kouylekov, LREC 2018), Wikipedia en espanol e ingles (CC BY-SA 3.0 y GFDL), las listas de erratas comunes de ambas Wikipedias (CC BY-SA 4.0), y las listas de palabras de AOSP LatinIME para espanol e ingles de EE. UU. (Apache 2.0). Las frases se reescribieron de forma sintetica introduciendo errores tipicos de tecleo apresurado, y las erratas se insertaron en frases que contenian la palabra correcta. El autor declara que ninguno de esos textos aparece en los ficheros distribuidos.

La innovacion destacable es el proceso de alineacion denominado Virtus, descrito como una pasada adicional en la que las propias respuestas del modelo se recompensan por humildad, honestidad, templanza y diligencia. Segun las metricas del autor, Virtus reduce las frases correctas empeoradas de 26/36 a 12/26 (es/en) manteniendo o mejorando la tasa de errores eliminados (66,1 %/67,3 % a 66,2 %/68,2 %), a costa de una ligera perdida en la calidad de sugerencias (62,5 %/61,7 % a 61,2 %/59,9 %) y en la correccion de erratas de Wikipedia en espanol (41,6 % a 30,8 %).

## Capacidades

- Correccion ortografica en espanol e ingles: erratas, acentos, mayusculas y puntuacion.
- Correccion de palabras introducidas por error de tecleo o deslizamiento (swipe) sobre el teclado.
- Reescritura completa de la frase en curso, no solo deteccion de errores.
- Sugerencia de finalizacion de la palabra que se esta escribiendo (entre las tres primeras opciones, con una tasa declarada de 61,2 %/59,9 % en es/en).
- Ejecucion local en dispositivo mediante ONNX Runtime, sin llamadas de red.
- Idiomas: espanol e ingles unicamente.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Teclados predictivos moviles y de escritorio: integracion directa en Berpiztu AI Keyboard (Android y Windows) como corrector contextual que reescribe la frase en curso y sugiere la palabra siguiente, con inferencia local.
- Aplicaciones de mensajeria con requisitos de privacidad: al ejecutarse integramente en el dispositivo mediante ONNX Runtime, el texto no abandona el terminal, lo que encaja en entornos con cumplimiento estricto de proteccion de datos.
- Correccion de notas y formularios en movilidad: reescritura de frases cortas introducidas con el pulgar, corrigiendo acentos y mayusculas antes de guardar o enviar.
- Preprocesado ligero de texto en pipelines de subtitulos: dado el origen del corpus (OpenSubtitles), el modelo puede aplicarse a limpieza de lineas de dialogo en espanol e ingles antes de su procesamiento posterior.
- Soporte a la escritura en entornos educativos o de accesibilidad: asistencia a usuarios con dificultades motoras o de escritura rapida, sugiriendo finalizaciones y corrigiendo pulsaciones erroneas.
- Filtro previo en sistemas de dictado o ASR: correccion de la salida de reconocimiento de voz en espanol e ingles para eliminar errores de homofonos y puntuacion antes de la entrega final.

## Benchmarks y rendimiento

Metricas internas declaradas por el autor sobre 2.000 frases reservadas por idioma (modelo en precision completa):

| Metrica | Espanol | Ingles |
|---|---|---|
| Errores eliminados (`small-a-wiki`) | 66,2 % | 68,2 % |
| Frases correctas empeoradas | 12 | 26 |
| Sugerencia entre las tres primeras | 61,2 % | 59,9 % |
| Erratas de Wikipedia corregidas | 30,8 % | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 376 MB para la version FP32; la exportacion de 8 bits reduce el peso, aunque el autor no publica su tamano exacto.
- GPU recomendadas: no requiere GPU; el modelo esta pensado para CPU en dispositivos Android y Windows.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 1 GB de memoria libre, aunque su uso previsto es CPU.
- Despliegue: ONNX Runtime (libreria declarada); tambien podria ejecutarse con otros runtimes compatibles con ONNX, no documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| `berpiztu/keyboard-correctors` | ~300 M (mt5-small) | no disponible | es, en | Apache 2.0 | Correccion ortografica en dispositivo (ONNX) |
| `google/mt5-small` | ~300 M | 512 tokens (estandar mT5) | multilingue | Apache 2.0 | Modelo base generico text2text |
| `grammarly/coedit-large` | ~770 M (T5-large) | 512 tokens | ingles | CC BY-NC 4.0 (no comercial) | Edicion gramatical |
| `vennify/t5-base-grammar-correction` | ~220 M (T5-base) | 512 tokens | ingles | Apache 2.0 | Correccion gramatical |

La comparativa con `grammarly/coedit-large` y `vennify/t5-base-grammar-correction` se ofrece como referencia de categoria (correccion gramatical basada en T5), no como evaluacion directa: no se dispone de comparaciones publicadas entre ellos y este modelo.

## Limitaciones y advertencias

- Modelo de nicho: cero descargas y cero likes en Hugging Face en el momento de la consulta, sin validacion externa independiente.
- Falsos positivos: incluso tras Virtus, el autor reporta 12 y 26 frases correctas empeoradas sobre 2.000 en espanol e ingles respectivamente; no es un corrector libre de riesgo sobre texto ya correcto.
- Cobertura limitada a espanol e ingles; no soporta otros idiomas pese a la naturaleza multilingue de mT5.
- La cuantizacion a 8 bits no reproduce exactamente la salida de precision completa, segun advierte el propio autor.
- Perdida medible en la correccion de erratas de Wikipedia en espanol tras Virtus (41,6 % a 30,8 %), lo que sugiere menor robustez ante errores atipicos.
- Ausencia de datos publicos sobre longitud de contexto efectiva, latencia y consumo de memoria en dispositivo.
- Riesgo de alucinacion en reescrituras: al ser un modelo generativo seq2seq, puede alterar contenido no erroneo de la frase; requiere validacion en produccion.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento incluyen material CC BY-SA y GFDL (Wikipedia), lo que conviene revisar si se redistribuyen derivados.
- Formato de distribucion especifico (carpetas con `encoder.onnx`, `decoder.onnx`, `spiece.model`, `format.json` y `correctors.json`), no compatible directamente con pipelines estandar de Hugging Face Transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/berpiztu/keyboard-correctors
- Modelo base: https://huggingface.co/google/mt5-small
- Repositorio del teclado: https://github.com/Berpiztu/keyplus
- Proyecto Virtus: https://github.com/Berpiztu/virtus
- Tatoeba: https://tatoeba.org
- OpenSubtitles v2018 en OPUS: https://opus.nlpl.eu/OpenSubtitles/corpus/version/OpenSubtitles
- Dataset Wikipedia (wikimedia/wikipedia): https://huggingface.co/datasets/wikimedia/wikipedia
- Listado de erratas comunes de Wikipedia en espanol: https://es.wikipedia.org/w/index.php?title=Wikipedia:Corrector_ortogr%C3%A1fico/Listado&oldid=175669831
- Listado de erratas comunes de Wikipedia en ingles: https://en.wikipedia.org/w/index.php?title=Wikipedia:Lists_of_common_misspellings/For_machines&oldid=1199637275
- AOSP LatinIME: https://android.googlesource.com/platform/packages/inputmethods/LatinIME
