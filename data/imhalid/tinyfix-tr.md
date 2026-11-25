# imhalid/tinyfix-tr

## Resumen

tinyfix-tr es un corrector ortografico y de escritura para turco disenado para ejecutarse integramente en el dispositivo del usuario, sin servidor ni conexion a internet. Lo desarrolla el autor independiente imhalid y se distribuye en Hugging Face bajo licencia CC BY-SA 4.0. No es un modelo de lenguaje generativo al uso: es un sistema hibrido compuesto por un motor de correccion basado en conteos (canal ruidoso sobre un lexico de aproximadamente un millon de formas), un modulo de morfologia turca derivado de Zemberek-NLP y un pequeno transformer opcional de 2,8 millones de parametros que resuelve ambiguedades por contexto.

El problema que aborda es concreto: la correccion de errores tipicos del turco (caracteres especiales escritos en ASCII, confusiones de/da y ki/mi, palabras juntas o separadas, apostrofes y erratas de tecleo de hasta dos ediciones). El modelo solo aplica un cambio cuando el margen frente a lo escrito es claro; en caso contrario, subraya la palabra y ofrece hasta cinco sugerencias ordenadas. Es relevante porque demuestra que una tarea linguistica util puede resolverse con menos de 4 MB comprimidos y latencia de dispositivo, sin depender de APIs externas.

La arquitectura no es un unico transformer: el nucleo es estadistico y morfologico, y el componente neuronal (`context.onnx`, transformer de subpalabras cuantizado a int8) es opcional y se usa para reordenar candidatos segun el significado de la frase completa. El contexto linguistico no se declara en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: canal ruidoso basado en conteos + morfologia turca (Zemberek) + transformer de subpalabras opcional |
| Parametros totales | 2,8 M (solo el modelo de contexto `context.onnx`); el nucleo es estadistico, sin parametros neuronales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo de contexto procesa la frase o parrafo actual en la demo) |
| Tipos de cuantizacion | int8 para `context.onnx`; el resto son formatos binarios propios (`ALX1`, `AMR2`) |
| Idiomas soportados | turco (tr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (`context.onnx`), binarios propios (`lexicon.bin`, `morph.bin`), TSV (`known.tsv`), JSON (`manifest.json`) |

## Arquitectura y entrenamiento

El sistema se organiza en tres capas. La primera es un motor de correccion de canal ruidoso sobre un lexico de aproximadamente un millon de formas con frecuencias de palabras y pares de palabras, almacenado en `lexicon.bin` (5,59 MB en crudo, 3,30 MB gzip). La segunda es un modulo de morfologia turca basado en raices y reglas de sufijos de Zemberek-NLP, con un prior raiz/sufijo en `morph.bin` (0,34 MB). La tercera, opcional, es `context.onnx`: un transformer de subpalabras de 2,8 M de parametros, cuantizado a int8, que re-puntua los candidatos en competencia usando la frase completa (por ejemplo, para distinguir `oldu` de `öldü`, `de` de `da`, o `yıllar` de `yollar`).

El motor genera candidatos para letras turcas tecleadas en ASCII, erratas de omision, insercion, intercambio y teclas vecinas (hasta dos ediciones), casos de de/da, ki, mi, palabras unidas o separadas y apostrofes. Solo modifica una palabra cuando la ventaja sobre lo escrito es clara. La deteccion marca palabras que la morfologia rechaza y el lexico desconoce, con hasta cinco sugerencias. Nombres propios, palabras extranjeras, abreviaturas, numeros, URLs y codigo se dejan intactos.

Los datos de frecuencia proceden de Wikipedia en turco (CC BY-SA 4.0) y de subtitulos de peliculas y series de OpenSubtitles.org via el corpus OPUS (Lison y Tiedemann, LREC 2016); solo se distribuyen conteos de palabras, no texto. La morfologia deriva de Zemberek-NLP (Apache 2.0). No se distribuye texto de entrenamiento con el modelo. No se detalla en la informacion disponible el volumen de tokens ni si hubo ajuste fino con RLHF o DPO.

## Capacidades

- Correccion automatica de ortografia en turco conforme a las reglas de la TDK, ejecutada en dispositivo (navegador, Node u otro runtime compatible con ONNX).
- Correccion de caracteres turcos escritos en ASCII, erratas de tecleo de hasta dos ediciones, confusiones de/da, ki, mi, palabras unidas o separadas y apostrofes.
- Deteccion de palabras invalidas con hasta cinco sugerencias ordenadas cuando el motor no esta seguro.
- Desambiguacion por contexto mediante el transformer opcional, que puede revisar el parrafo actual mientras se escribe.
- Exencion de nombres propios, palabras extranjeras, abreviaturas, numeros, URLs y codigo.
- Funcionamiento completamente offline, sin llamadas a servidor.
- No dispone de generacion de texto, razonamiento general, codigo, matematicas, vision, audio, tool calling ni capacidades de agente.

## Casos de uso

- Correccion en tiempo real en editores web y formularios: el motor TypeScript se integra en el navegador y corrige mientras el usuario escribe, sin enviar texto a ningun servidor, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Procesamiento por lotes de textos turcos: normalizacion de articulos, resenas o transcripciones antes de indexarlas o analizarlas, corrigiendo caracteres ASCII mal escritos y palabras unidas o separadas.
- Aplicaciones de escritorio y moviles offline: al pesar menos de 4 MB comprimidos el nucleo, puede empaquetarse en clientes sin conexion o con conectividad intermitente.
- Preprocesado para pipelines de NLP en turco: limpieza de corpus antes de alimentar modelos mayores, reduciendo ruido ortografico y marcando terminos dudosos para revision.
- Herramientas de accesibilidad y teclados: integracion en teclados virtuales o correctores de sistema que necesitan sugerencias de bajo coste computacional y latencia minima en dispositivo.
- Educacion y ensenanza del turco: resaltado de errores y sugerencias con criterios de la TDK para estudiantes, con la posibilidad de revisar el parrafo completo mediante el modelo de contexto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre conjuntos de retencion no usados para ajuste. *Fixed* indica correccion automatica; *found* indica correccion o marcado con sugerencias.

| Conjunto | Fixed (nucleo) | Fixed (con contexto) | Found (fixed + flagged) |
|---|---|---|---|
| Frases de Wikipedia con erratas (test2, 400) | 84,0% | 89,3% | 98,3% |
| Frases de Wikipedia con erratas (test, 400) | 84,0% | 87,3% | 96,3% |
| Frases estilo chat, letras omitidas (811 palabras) | 69,7% | 83,6% | 99,4% |
| Frases estilo chat, errores mixtos (602 palabras) | 68,8% | 75,2% | 99,5% |

Falsas alarmas sobre texto correcto: aproximadamente 2 palabras modificadas por cada 1000 en frases de Wikipedia (principalmente nombres raros y terminos tecnicos) y 0,1 por cada 1000 en frases de chat limpias.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para CPU. El nucleo ocupa 3,46 MB comprimidos y `context.onnx` 2,51 MB comprimidos.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU de portatil, movil o navegador mediante ONNX Runtime o WebAssembly.
- Cabe en cualquier GPU de consumo, aunque no es necesario usarla.
- Opciones de despliegue: ONNX Runtime (navegador, Node, Python, movil), WebAssembly; el motor de inferencia es el propio motor TypeScript de tinyfix-tr, no un servidor de LLM como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; el diseno orientado a escritura en tiempo real sugiere latencia baja en dispositivo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| tinyfix-tr | Corrector hibrido + transformer de contexto | 2,8 M (contexto) | no disponible | CC BY-SA 4.0 | Turco, offline, reglas TDK |
| Zemberek-NLP | Morfologia y correccion basada en reglas | no aplica | no aplica | Apache 2.0 | Turco, Java, sin modelo neuronal |
| Corrector ortografico de sistema (p. ej. Hunspell) | Diccionario y reglas | no aplica | no aplica | variable (LGPL/GPL) | Multiples idiomas, sin contexto |
| LLM generativo multilingue | Transformer decoder | miles de millones | largo | variable | Correccion via prompt, requiere servidor o hardware potente |

La comparacion con LLM generativos no es directa: tinyfix-tr no genera texto, sino que corrige y marca errores con un coste computacional ordenes de magnitud menor. No se dispone de comparativas publicadas con otros correctores turcos especificos en la informacion disponible.

## Limitaciones y advertencias

- Los errores en los que la palabra escrita es valida pero esta mal colocada (apostrofe omitido, de/da) no se marcan; solo se corrigen cuando el motor esta seguro.
- Las grafias coloquiales (por ejemplo, `buluşcaz`) se marcan, pero las sugerencias pueden ser debiles.
- Las palabras tecnicas raras y los extranjerismos pueden marcarse como erroneos (falsas alarmas).
- El modelo solo cubre turco; no sirve para otros idiomas.
- Licencia CC BY-SA 4.0: el uso comercial es posible, pero las obras derivadas deben compartirse bajo la misma licencia y con atribucion; conviene revisar las obligaciones de compartir-al-igual antes de integrarlo en productos propietarios.
- Los formatos binarios propios (`ALX1`, `AMR2`) no son de proposito general y solo los lee el motor tinyfix-tr; `context.onnx` espera el tokenizador de subpalabras y las caracteristicas de candidatos del motor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- No se han publicado datos sobre sesgos; al basarse en frecuencias de Wikipedia y subtitulos, puede heredar sesgos de esas fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imhalid/tinyfix-tr
- Demo en vivo: https://tdkai.halid.dev
- Zemberek-NLP (morfologia base): https://github.com/ahmetaa/zemberek-nlp
- OpenSubtitles / OPUS (Lison y Tiedemann, LREC 2016): http://www.opensubtitles.org/
- Wikipedia en turco (fuente de frecuencias): https://tr.wikipedia.org
