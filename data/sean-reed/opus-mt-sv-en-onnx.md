# sean-reed/opus-mt-sv-en-onnx

## Resumen

`sean-reed/opus-mt-sv-en-onnx` es una conversion a ONNX Runtime del modelo de traduccion automatica sueco-ingles `Helsinki-NLP/opus-mt-sv-en`, desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki dentro del proyecto OPUS-MT. La conversion, realizada por el usuario sean-reed, mantiene los pesos originales cuantizados a 8 bits y anade una salida adicional de atencion cruzada que permite realizar alineamiento de palabras entre el texto origen y la traduccion.

El modelo resuelve un problema concreto: la traduccion sueco-ingles en CPU con un consumo de recursos muy reducido (145 MB frente a 528 MB del export en fp32) y con la posibilidad de obtener, para cada pieza generada, la atencion que presto a cada fragmento del texto fuente. Esta funcionalidad de alineamiento resulta util para tareas de traduccion asistida, resaltado de correspondencias entre idiomas o extraccion del equivalente contextual de una palabra concreta.

La arquitectura subyacente es un transformer encoder-decoder de tipo Marian, con 6 capas, 8 cabezas de atencion y dimension de modelo 64 por cabeza. El modelo esta pensado exclusivamente para el par de idiomas sueco-ingles y se distribuye bajo licencia Apache 2.0, lo que facilita su integracion en productos comerciales. Su relevancia actual radica en que ofrece inferencia en CPU con latencias de decenas de milisegundos por frase, sin dependencia de GPU, y con una funcionalidad de alineamiento poco habitual en modelos de traduccion empaquetados para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), 6 capas, 8 cabezas, D=64 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en bloques de 32 valores con escala propia (ONNX Runtime `MatMulNBits`, `accuracy_level` 4); embeddings tambien a 8 bits |
| Idiomas soportados | sueco (sv), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`), mas `source.spm`, `vocab.json` y `model.json` |

## Arquitectura y entrenamiento

El modelo es una conversion del checkpoint `Helsinki-NLP/opus-mt-sv-en` en la revision `202cf6240046bd8b6d08c207ee751ffd630d7ba8`, que corresponde a la familia OPUS-MT basada en la arquitectura Marian. La red tiene un encoder y un decoder con 6 capas (L=6), 8 cabezas de atencion (H=8) y dimension por cabeza de 64 (D=64). La conversion separa el modelo en dos grafos ONNX: `encoder.onnx` recibe los ids de origen y produce las claves y valores de atencion cruzada de cada capa de decoder; `decoder.onnx` ejecuta un paso de decodificacion greedy, recibiendo el token anterior, la posicion, el estado `past` y la salida del encoder, y devolviendo logits, el nuevo estado `present` y un vector de atencion sobre el origen.

La innovacion tecnica de esta conversion es la exposicion explicita de la atencion cruzada de la capa de decoder 5 (contando desde 0), promediada sobre sus cabezas, en el momento en que se genera cada token. Esta senal permite alinear palabras entre la frase sueca y su traduccion inglesa sumando la atencion de cada pieza objetivo sobre las piezas de la palabra fuente y seleccionando la palabra objetivo con mayor puntuacion, renormalizando sobre las palabras fuente que no son solo puntuacion. Los datos de entrenamiento originales no se detallan en la informacion disponible; el modelo base procede del proyecto OPUS-MT de la Universidad de Helsinki. La cuantizacion a 8 bits se valido sobre 72 frases de prueba, en las que las traducciones greedy coincidieron con las del modelo original en todas menos en una.

## Capacidades

- Traduccion de texto de sueco a ingles con decodificacion greedy paso a paso.
- Generacion de un vector de atencion cruzada por token generado, util para alineamiento de palabras entre origen y traduccion.
- Alineamiento contextual de palabras: permite encontrar el equivalente de una palabra sueca en su contexto (por ejemplo, "ljus" en "han tände ett ljus för att kunna se i mörkret" se alinea con "candle").
- Resaltado de correspondencias entre palabras del texto fuente y del texto traducido.
- Tokenizacion mediante SentencePiece (`source.spm`) y vocabulario compartido entre origen y destino (`vocab.json`).
- Inferencia en CPU mediante ONNX Runtime, sin requisito de GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente de traduccion.
- Capacidades multilingues limitadas exclusivamente al par sueco-ingles.

## Casos de uso

- Traduccion por lotes en servidores sin GPU: el modelo puede procesar frases en CPU con una mediana de 43 ms por frase en un AMD Ryzen 5 1600 con 4 hilos, lo que permite integrarlo en pipelines de localizacion de contenido sueco a ingles sin coste de GPU.
- Traduccion asistida con resaltado de correspondencias: usando el vector de atencion cruzada, una interfaz puede resaltar que palabras inglesas corresponden a cada palabra sueca, facilitando la revision humana de traducciones.
- Extraccion del equivalente contextual de un termino: en glosarios o memorias de traduccion, el modelo permite identificar como se traduce una palabra concreta en una frase dada, util para validar terminologia en contextos especificos.
- Traduccion en dispositivos de borde o entornos con recursos limitados: el tamano de 145 MB y la ejecucion en ONNX Runtime permiten desplegar el modelo en contenedores ligeros, funciones serverless o equipos de sobremesa.
- Preprocesado de corpus suecos para analisis posterior: traduccion automatica de textos suecos a ingles antes de aplicar tecnicas de procesamiento del lenguaje natural entrenadas principalmente en ingles.
- Alineacion de corpus paralelos a nivel de palabra: la salida de atencion puede emplearse para generar alineamientos palabra a palabra en corpus bilingues sueco-ingles, utiles para entrenar o evaluar sistemas de traduccion.
- Traduccion de subtitulos o textos cortos en tiempo real: la baja latencia (maximo de 94 ms en la prueba citada) permite integrar el modelo en flujos interactivos o de transcripcion con traduccion inmediata.

## Benchmarks y rendimiento

La model card proporciona datos de rendimiento y de calidad de alineamiento, pero no benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de traduccion.

| Metrica | Resultado |
|---|---|
| Coincidencia de traduccion greedy con el original (72 frases) | 72 de 72 (0 discrepancias) |
| Alineamiento palabra a palabra, casos de seleccion del metodo | 69/72 |
| Alineamiento palabra a palabra, casos reservados (held-out) | 45/46 |
| Tamano del export fp32 | 528 MB |
| Tamano de este modelo | 145 MB |
| Mediana de tiempo por frase, fp32 | 76 ms |
| Mediana de tiempo por frase, este modelo | 43 ms |
| Frase mas lenta, fp32 | 170 ms |
| Frase mas lenta, este modelo | 94 ms |

Las mediciones se realizaron en un AMD Ryzen 5 1600 de seis nucleos con 4 hilos y ONNX Runtime 1.31.0, sobre frases de 3 a 17 palabras. Los casos de alineamiento corresponden a 118 palabras en 72 frases etiquetadas y verificadas por una persona, por lo que el autor advierte que las cifras son una indicacion aproximada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo esta disenado para ejecucion en CPU mediante ONNX Runtime.
- GPU recomendadas: no disponibles; el modelo no requiere GPU.
- Cabe en GPU consumer: no aplica por diseno, aunque tecnicamente podria ejecutarse en cualquier GPU con soporte de ONNX Runtime; el consumo de memoria seria inferior a 1 GB.
- Opciones de despliegue: ONNX Runtime en CPU; el modelo se distribuye como grafos ONNX (`encoder.onnx`, `decoder.onnx`) y requiere implementar el bucle de decodificacion greedy descrito en la model card.
- Latencia y throughput estimados: mediana de 43 ms por frase y maximo de 94 ms en un AMD Ryzen 5 1600 con 4 hilos y ONNX Runtime 1.31.0, sobre frases de 3 a 17 palabras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `sean-reed/opus-mt-sv-en-onnx` | no disponible (6 capas, 8 cabezas, D=64) | no disponible | sv, en | Apache 2.0 | ONNX (8 bits) | Incluye atencion cruzada para alineamiento de palabras; 145 MB; 43 ms por frase en CPU |
| `Helsinki-NLP/opus-mt-sv-en` | no disponible (misma arquitectura Marian) | no disponible | sv, en | Apache 2.0 | safetensors / PyTorch | Modelo original sin cuantizar; requiere framework de inferencia PyTorch |
| Export fp32 del mismo modelo | no disponible | no disponible | sv, en | Apache 2.0 | ONNX (fp32) | 528 MB; 76 ms por frase en CPU; sin cuantizacion |
| Otros modelos OPUS-MT de la familia | no disponible | no disponible | multiples pares | Apache 2.0 | safetensors / PyTorch | Misma arquitectura Marian; no incluyen salida de alineamiento en la conversion ONNX |

## Limitaciones y advertencias

- El modelo solo traduce de sueco a ingles; no soporta otros pares de idiomas ni traduccion inversa.
- El alineamiento basado en atencion es aproximado y falla cuando una palabra se traduce por varias, como "mjukvaruutvecklare" alineado con "software" en "software developer"; ademas, solo selecciona una palabra objetivo por palabra fuente.
- Las cifras de calidad del alineamiento provienen de 118 palabras en 72 frases etiquetadas por una persona, por lo que deben tratarse como una indicacion aproximada y no como una evaluacion exhaustiva.
- La decodificacion es greedy y paso a paso; no se ofrece decodificacion por haz ni otras estrategias que podrian mejorar la calidad.
- El modelo base puede presentar sesgos propios de los datos de entrenamiento de OPUS-MT, no detallados en la informacion disponible.
- Riesgo de alucinacion o traducciones incorrectas en frases largas, dominios especializados o texto con ruido; no se han publicado evaluaciones de calidad por dominio.
- La longitud de contexto no se especifica en la informacion disponible, lo que limita la planificacion de cargas con frases largas.
- La licencia Apache 2.0 permite uso comercial, pero la conversion no esta afiliada a la Universidad de Helsinki; se debe conservar el aviso de licencia.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sean-reed/opus-mt-sv-en-onnx
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-sv-en
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
