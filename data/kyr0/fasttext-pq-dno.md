# kyr0/fastText-pq-dno

## Resumen

`kyr0/fastText-pq-dno` es un paquete de identificacion de idioma (language identification, LID) derivado del modelo `lid.176.ftz` de Meta mediante el metodo DNO-PQ (Direct Neural Optimization - Product Quantization). Lo publica el desarrollador kyr0 dentro del proyecto `defuss-lid`, un runtime de fastText escrito en TypeScript puro, sin dependencias, orientado a entornos edge (navegadores, Node.js y Bun). El modelo se distribuye en dos packs: `der_3` (ingles, aleman, ruso) y `deferi_6` (los tres anteriores mas frances, italiano y espanol).

El problema que resuelve es el coste de despliegue de la deteccion de idioma en cliente. El `lid.176.ftz` original ocupa 938.013 bytes con sus 176 etiquetas; estos packs reducen el peso entre un 82 % y un 89 % manteniendo o mejorando la precision en los dominios evaluados. La clave esta en conservar los vectores de fila product-quantized de lid.176, seleccionar las filas mas utiles para el subconjunto de idiomas, reajustar los codebooks PQ compartidos y las normas, y reajustar las filas de los nodos del softmax jerarquico almacenandolas en int8.

Es relevante ahora porque permite ejecutar deteccion de idioma de calidad casi de laboratorio en el navegador o en dispositivos con recursos limitados, con un peso all-in gzipped de 82 KB (`der_3`) o 124 KB (`deferi_6`). No es un modelo generativo: es un clasificador de texto que devuelve etiquetas de idioma con puntuaciones de probabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fastText (bolsa de n-gramas con softmax jerarquico), pesos en formato product-quantized (PQ) |
| Parametros totales | no disponible (el autor reporta tamano en bytes, no recuento de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador; evaluado sobre frases, primeros 20 code points y arranques de dos palabras) |
| Tipos de cuantizacion | Product quantization (PQ) en las filas de embedding; filas del softmax jerarquico en int8 |
| Idiomas soportados | `der_3`: en, de, ru. `deferi_6`: en, de, ru, fr, it, es |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | `.dlid` (formato propio del runtime `defuss-lid`) |

## Arquitectura y entrenamiento

El modelo parte de `lid.176.ftz` de Meta y aplica DNO-PQ en tres pasos, todos sobre texto held-out: seleccion de filas entre las 50.000 originales segun su valor, reajuste de los codebooks PQ compartidos y de las normas, y reajuste de las filas de los nodos del softmax jerarquico con almacenamiento en int8. No se entrena desde cero ni se modifica la topologia: se destila y comprime el modelo base para un subconjunto de etiquetas.

Los datos de evaluacion y ajuste provienen de FLORES-200, MASSIVE 1.1, el split de test de Tatoeba y NTREX-128. El autor indica que ningun texto de benchmark se uso para elegir filas, ajustar o seleccionar la edicion, y que Tatoeba se mantuvo separado por id de frase respecto al texto usado en el ajuste. El runtime anade un "letter boost" opcional: suma a la puntuacion de cada idioma la proporcion de letras del texto que su alfabeto explica (hasta 1), y permite desactivarlo con `{boost: false}` para obtener la probabilidad pura del modelo.

## Capacidades

- Identificacion de idioma top-1 entre las etiquetas del pack, con puntuaciones de probabilidad incondicional de lid.176.
- Deteccion sobre textos muy cortos: primeros 20 code points y arranques de dos palabras, con mejoras relativas de error de hasta el 30,7 % frente a lid.176 en utterances de MASSIVE.
- Rechazo de idiomas fuera del pack mediante umbral sobre las puntuaciones con `boost: false` (ejemplo de la model card: el polaco devuelve lista vacia con `threshold: 0.5`).
- Ejecucion en navegador, Node.js y Bun mediante el runtime TypeScript `defuss-lid`, sin dependencias.
- Carga desde buffer (`LidModel.fromBuffer`) o desde URL en navegador (`loadModel(url)`).
- No soporta generacion de texto, tool calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Enrutamiento de idioma en el cliente: antes de enviar una peticion a un backend multilingue, el navegador clasifica el texto del usuario y selecciona el modelo o la plantilla de respuesta adecuada, con un coste de descarga de 82-124 KB gzipped.
- Deteccion de idioma en formularios y chats de atencion al cliente: el pack `deferi_6` cubre los seis idiomas mas habituales en Europa occidental y Rusia, y el umbral permite marcar mensajes en idiomas no soportados para revision humana.
- Moderacion y analitica de contenido en el edge: clasificar comentarios o resenas en un worker de Cloudflare o en una funcion serverless sin depender de una API externa ni enviar texto a terceros.
- Preprocesado de pipelines NLP: asignar idioma a documentos antes de aplicar tokenizadores, stemmers o modelos especificos por lengua, reduciendo el trafico al descartar el paso por un servicio central.
- Filtrado de datasets y control de calidad: detectar entradas que no corresponden al idioma declarado en un corpus, usando las puntuaciones con `boost: false` y un umbral configurable.
- Aplicaciones offline o de escritorio: integracion en Electron, extensiones de navegador o apps moviles donde no se puede asumir conectividad, gracias al runtime sin dependencias y al peso reducido.
- Clasificacion de textos cortos en interfaces: etiquetar titulares, asuntos de correo o mensajes de menos de 20 caracteres, escenario donde el pack mejora a lid.176 (97,24 % frente a 96,52 % en arranques de dos palabras para `der_3`).

## Benchmarks y rendimiento

Precision top-1 (%) para `der_3` (en, de, ru), medida con el runtime `defuss-lid`:

| Slice | Filas | lid.176 | DNO-PQ | Errores vs lid.176 | DNO-PQ, boost off | Errores vs lid.176, boost off |
|---|---:|---:|---:|---:|---:|---:|
| FLORES-200 devtest, frases | 3.036 | 100,00 | 100,00 | 0,0 % | 100,00 | 0,0 % |
| FLORES-200 devtest, primeros 20 code points | 3.036 | 98,62 | 98,65 | −2,4 % | 98,65 | −8,9 % |
| MASSIVE 1.1 test, utterances | 8.922 | 99,16 | 99,42 | −30,7 % | 99,38 | −33,7 % |
| Arranques de dos palabras (FLORES + MASSIVE) | 7.278 | 96,52 | 97,24 | −20,6 % | 97,20 | −28,9 % |
| Tatoeba test split, frases | 2.999 | 99,77 | 99,67 | +42,9 % | 99,63 | +57,1 % |
| Tatoeba test split, primeros 20 code points | 2.999 | 99,50 | 99,53 | −6,7 % | 99,50 | 0,0 % |
| Tatoeba test split, arranques de dos palabras | 2.279 | 98,11 | 97,89 | +11,6 % | 97,81 | +11,1 % |
| NTREX-128, frases | 3.000 | 99,93 | 99,93 | 0,0 % | 99,93 | 0,0 % |
| NTREX-128, primeros 20 code points | 3.000 | 97,83 | 97,63 | +9,2 % | 97,67 | +6,1 % |
| NTREX-128, arranques de dos palabras | 2.637 | 95,37 | 94,84 | +11,5 % | 94,84 | +7,1 % |

Para `deferi_6` la model card incluye la misma tabla, pero el contenido proporcionado se corta en la cabecera; no se dispone de las cifras completas de ese pack. El autor resume el comportamiento global: 28 % a 31 % menos errores en utterances de MASSIVE, 8 % a 21 % menos en arranques de dos palabras y 2 % a 6 % menos en los primeros 20 code points de FLORES, con hasta un 43 % mas de errores en Tatoeba y NTREX-128 (pocos en terminos absolutos: 10 frente a 7 errores de 2.999 en frases de Tatoeba para `der_3`).

Tamano frente a lid.176:

| Metrica | lid.176 | DNO-PQ | Reduccion |
|---|---:|---:|---:|
| `der_3` pesos | 702.886 B | 77.960 B | −88,9 % |
| `der_3` pesos, gzipped | 570.719 B | 71.060 B | −87,5 % |
| `deferi_6` pesos | 703.315 B | 127.224 B | −81,9 % |
| `deferi_6` pesos, gzipped | 571.066 B | 113.091 B | −80,2 % |
| `der_3` all-in, gzipped | 581.890 B | 82.231 B | −85,9 % |
| `deferi_6` all-in, gzipped | 582.237 B | 124.262 B | −78,7 % |

## Requisitos de hardware

- Inferencia en CPU: el modelo es un fastText cuantizado de menos de 130 KB, por lo que no requiere GPU.
- VRAM: no aplica; el runtime es TypeScript puro y opera sobre memoria convencional.
- GPU recomendadas: ninguna; no se beneficia de aceleracion GPU.
- Cabe en cualquier dispositivo: navegador, Node.js, Bun, moviles y sistemas embebidos con un runtime JS.
- Despliegue: runtime `defuss-lid` (TypeScript, sin dependencias); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no se publican cifras en la informacion disponible; el coste dominante es la descarga del pack (82-124 KB gzipped all-in).

## Comparativa con modelos similares

| Modelo | Idiomas | Tamano | Precision en dominio corto | Licencia | Runtime |
|---|---|---:|---|---|---|
| `kyr0/fastText-pq-dno` (`der_3`) | 3 | 77.960 B (71.060 B gzip) | 97,24 % en arranques de dos palabras | CC BY-SA 3.0 | `defuss-lid` (TS) |
| `kyr0/fastText-pq-dno` (`deferi_6`) | 6 | 127.224 B (113.091 B gzip) | no disponible en el extracto | CC BY-SA 3.0 | `defuss-lid` (TS) |
| `lid.176.ftz` (Meta) restringido a las mismas etiquetas | 3 o 6 | 702.886-703.315 B (570.719-571.066 B gzip) | 96,52 % en arranques de dos palabras (`der_3`) | no disponible en el extracto | fastText nativo / `defuss-lid` |
| `lid.176.ftz` completo (Meta) | 176 | 938.013 B | referencia base | no disponible en el extracto | fastText nativo |

No se dispone de datos de otros modelos LID comparables (por ejemplo, clasificadores basados en transformers) en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura limitada: solo 3 o 6 idiomas. El texto en otros idiomas obtiene puntuaciones bajas en todas las etiquetas, pero requiere umbral explicito con `boost: false` para rechazarse; sin umbral, el modelo siempre devolvera una etiqueta del pack.
- Regresion en algunos dominios: hasta un 43 % mas de errores que lid.176 en Tatoeba y NTREX-128, aunque con recuentos absolutos pequenos.
- El "letter boost" altera las puntuaciones: para obtener probabilidades calibradas hay que usar `{boost: false}`; las puntuaciones con boost no son comparables directamente con probabilidades.
- Licencia CC BY-SA 3.0: permite uso comercial, pero impone atribucion y compartir bajo la misma licencia las obras derivadas; conviene revisar el cumplimiento en productos propietarios.
- Riesgo de confusion en textos muy cortos o sin alfabeto distintivo (nombres propios, cifras, emoticonos), donde la senal linguistica es escasa.
- Es un clasificador, no un modelo generativo: no puede producir texto, razonar ni ejecutar herramientas; cualquier expectativa en ese sentido es un error de uso.
- El formato `.dlid` es propio del runtime `defuss-lid`; no es directamente interoperable con fastText nativo ni con otras librerias sin conversion.
- El repo figura con 0 descargas y 0 likes en el momento de la consulta, y el tamano reportado es 0.0 GB, coherente con packs de decenas o cientos de KB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kyr0/fastText-pq-dno
- Runtime `defuss-lid`: https://github.com/kyr0/defuss-lid
- Modelo base de referencia del proyecto: https://huggingface.co/kyr0/defuss-lid-1.0
- Dataset FLORES-200: https://huggingface.co/datasets/facebook/flores
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
