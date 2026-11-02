# milliwattlabs/leokani-g2p

## Resumen

Leokani G2P es un fonemizador (grapheme-to-phoneme, G2P) para ingles americano desarrollado por Milliwatt Labs. Convierte texto escrito en fonemas compatibles con espeak-ng, en concreto en los codigos de fonema que usan Kokoro y misaki, sin depender de la libreria espeak-ng ni de sus ficheros de datos. Es, por tanto, la pieza de front-end textual de una cadena de sintesis de voz: recibe texto y devuelve la secuencia de fonemas que un modelo TTS como Kokoro-82M o Leokani-tts 7M puede vocalizar.

Tecnicamente no es un modelo de lenguaje: es un conjunto de tres redes ONNX pequenas (un modelo de contexto de 1,34 M de parametros y un par encoder/decoder para palabras fuera de lexico de 2,22 M de parametros) acompanadas de un lexico comprimido de 3,7 MB. El paquete completo ocupa unos 18 MB y solo requiere `numpy` y `onnxruntime`, lo que permite ejecutarlo en CPU en menos de un milisegundo por linea con un unico hilo.

Su relevancia practica esta en la sustitucion limpia de espeak-ng en pipelines TTS: elimina una dependencia nativa fragil de instalar y de licenciar, mantiene una tasa de coincidencia del 99,07 % con espeak-ng en frases retenidas y normaliza verbalmente cifras, monedas, fechas, unidades, correos y URLs antes de fonemizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline G2P con tres redes ONNX (modelo de contexto + encoder/decoder OOV) y lexico comprimido |
| Parametros totales | 3,56 M (1,34 M contexto + 2,22 M OOV) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa por clausulas; no se especifica limite de tokens) |
| Tipos de cuantizacion | No disponible (pesos ONNX sin cuantizar documentada) |
| Idiomas soportados | Ingles americano (en-US) unicamente |
| Licencia | CC BY 4.0 para pesos, lexico y goldens; MIT para el codigo |
| Formato de pesos | ONNX (`context.onnx`, `oov-encoder.onnx`, `oov-decoder.onnx`) + lexico JSON gzip |

## Arquitectura y entrenamiento

El sistema se compone de tres etapas. La primera es un modelo neuronal de contexto (1,34 M de parametros, 5,4 MB) que decide como se pronuncia cada palabra en funcion de su clausula, lo que permite resolver heteronimos como "read", "lead", "wind" o "lives" a partir del contexto cercano. La segunda es un par encoder/decoder (2,22 M de parametros, 9,0 MB) que aplica reglas de letter-to-sound para palabras que no estan en el lexico. La tercera es un lexico comprimido de 3,7 MB que incluye formas debiles, palabras numericas y toponimos procedentes de GeoNames (CC BY 4.0). Antes de la fonemizacion, un normalizador textual expande cifras, importes, fechas, horas, unidades, telefonos, correos, direcciones web y versiones a palabras ("$4.99" se lee como "4 dollars and 99 cents").

El modelo se construyo desde cero: el autor afirma que no contiene codigo ni ficheros de datos de espeak-ng. La salida se mapea a los codigos de fonema de misaki 0.9.4 y Kokoro-82M. Los detalles de composicion del dataset de entrenamiento, numero de tokens y uso de tecnicas de alineamiento o ajuste fino no estan disponibles en la informacion proporcionada. La evaluacion se realizo contra espeak-ng (commit 8269af04) en ingles americano, con conjuntos de test retenidos.

## Capacidades

- Conversion de texto a fonemas en formato compatible con Kokoro y misaki, sustituible directamente en el front-end de Kokoro-82M.
- Normalizacion verbal de cifras, monedas, fechas, horas, unidades, telefonos, correos electronicos, URLs y versiones de software.
- Desambiguacion de heteronimos por contexto de clausula ("read", "lead", "wind", "lives").
- Segmentacion por clausulas mediante `phonemize_chunks`, que devuelve una cadena de fonemas por fragmento.
- Letter-to-sound neuronal para palabras fuera de lexico (nombres propios, neologismos, terminos tecnicos).
- Acento lexico y formas debiles del ingles (por ejemplo, "the" antes de vocal).
- Ejecucion en CPU con un solo hilo, sin GPU ni dependencias nativas.
- API de Python (`leokani_g2p.phonemize`, `phonemize_chunks`) y herramienta de linea de comandos (`leokani-g2p`).
- No incluye sintesis de audio: es exclusivamente el front-end textual de un sistema TTS.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente, por su naturaleza.

## Casos de uso

- Sustitucion de espeak-ng en pipelines TTS: se puede reemplazar el fonemizador por defecto de Kokoro o de Leokani-tts 7M para eliminar la dependencia de la libreria nativa, manteniendo los mismos codigos de fonema y una coincidencia del 99,07 % en frases retenidas.
- Lectura de documentos con cifras y unidades: la normalizacion previa convierte importes, fechas, telefonos y versiones a palabras antes de fonemizar, lo que resulta adecuado para locucion automatica de informes financieros, facturas o documentacion tecnica.
- Asistentes de voz en dispositivos embebidos: con 18 MB de ficheros y 0,26 ms por linea en un hilo de CPU, encaja en entornos sin GPU (Raspberry Pi, moviles, navegador via ONNX Runtime Web) donde no es viable desplegar espeak-ng.
- Preprocesado de datasets de voz: permite generar transcripciones foneticas masivas para entrenamiento o evaluacion de modelos TTS con un coste computacional minimo y sin dependencias externas.
- Accesibilidad y lectura de pantalla: integrado en lectores que ya usan Kokoro como motor de sintesis, aporta una pronunciacion mas consistente de nombres y terminos poco frecuentes que la cadena por defecto.
- Evaluacion y regresion de front-ends TTS: el fichero `goldens.json` define salidas exactas que una implementacion alternativa debe reproducir, lo que facilita pruebas de conformidad en portes a otros lenguajes (Rust, C++, JavaScript).
- Procesamiento por lotes de textos web: la normalizacion de URLs, correos y abreviaturas permite fonemizar contenido scrapeado sin preprocesado adicional.

## Benchmarks y rendimiento

Resultados de coincidencia con espeak-ng (commit 8269af04, ingles americano, codigos de Kokoro via misaki 0.9.4) sobre texto retenido:

| Test | Lineas | Frases identicas | Tasa de error de fonemas |
|---|---:|---:|---:|
| Frases retenidas (cinco conjuntos) | 1.940 | 99,07 % | 0,12 % |
| Casos dificiles: numeros, monedas, unidades, abreviaturas, texto web | 500 | 98,6 % | 2,23 % |
| Frases con nombres no vistos | 577 | 83,36 % | 1,40 % |
| Total | 3.017 | 95,99 % | 0,46 % |

Rendimiento medido en un hilo de CPU (Apple M3 Pro, cache por palabra caliente): 0,26 ms por linea en frases cotidianas y aproximadamente 0,6 ms por linea en texto con abundantes numeros, unidades y abreviaturas. No se han publicado resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para CPU.
- RAM: el conjunto de ficheros ocupa unos 18 MB (5,4 MB contexto + 9,0 MB OOV + 3,7 MB lexico), con un consumo adicional moderado de `onnxruntime`.
- GPU recomendadas: no aplica. Cualquier CPU moderna es suficiente; funciona en Apple Silicon, x86 y ARM.
- Cabe en cualquier GPU consumer y en dispositivos sin GPU; no se necesita CUDA.
- Opciones de despliegue: `onnxruntime` en Python, `leokani_g2p.py` como script autonomo, paquete pip desde GitHub, ONNX Runtime Web para navegador y potencialmente otros runtimes ONNX (C++, Rust, Java) mediante el fichero `goldens.json` como referencia de conformidad.
- Latencia: 0,26-0,6 ms por linea en un hilo de CPU; el throughput escala linealmente con el numero de hilos o procesos, aunque no se han publicado cifras agregadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Dependencias | Coincidencia con espeak-ng |
|---|---|---|---|---|---|---|
| Leokani G2P | G2P neuronal + lexico | 3,56 M | en-US | CC BY 4.0 (pesos) / MIT (codigo) | numpy, onnxruntime | 99,07 % en frases retenidas |
| espeak-ng | G2P basado en reglas | No aplica | Multiples (100+) | GPLv3 | Libreria nativa | Referencia |
| misaki | G2P con lexicon y reglas | No disponible | en, y otros | Apache-2.0 (segun el ecosistema Kokoro) | Python, dependencias variables | No disponible |
| g2p-en (Kyubyong) | Seq2seq + lexicon | No disponible | en | Apache-2.0 | TensorFlow/PyTorch | No disponible |

La comparativa se limita a alternativas de la misma categoria (fonemizadores para TTS). Leokani G2P destaca por su tamano reducido, su licencia permisiva y su independencia de espeak-ng; espeak-ng mantiene ventaja en cobertura de idiomas y misaki en integracion con el ecosistema Kokoro original. No se dispone de datos de rendimiento comparables para g2p-en en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre ingles americano; no soporta otras variantes ni idiomas.
- La salida son fonemas estilo Kokoro/misaki, no IPA nativo de espeak-ng; no es un reemplazo directo si el consumidor espera IPA estandar.
- No genera audio: es unicamente el front-end textual.
- Los nombres propios y palabras raras fuera del lexico son el punto debil: solo el 71,8 % de las palabras raras no vistas coincide con espeak-ng, lo que explica la caida al 83,36 % en frases con nombres no vistos.
- Algunas lecturas difieren deliberadamente de espeak-ng: importes, unidades, correos y versiones se verbalizan, y el pronombre "I" siempre se acentua.
- La desambiguacion de heteronimos depende del contexto de clausula y puede fallar en casos ambiguos.
- Riesgo de pronunciacion incorrecta en dominios muy especializados (terminologia cientifica, marcas poco comunes) sin posibilidad de correccion automatica.
- La licencia CC BY 4.0 exige atribucion ("Leokani G2P by Milliwatt Labs") en productos comerciales; el codigo MIT es mas permisivo, pero los pesos y el lexico no.
- El lexico incorpora toponimos de GeoNames (CC BY 4.0) y los codigos de fonema derivan de misaki y Kokoro-82M (Apache-2.0), con obligaciones de atribucion recogidas en `NOTICE`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/milliwattlabs/leokani-g2p
- Repositorio del codigo: https://github.com/Milliwatt-Labs/leokani-g2p
- Leokani-tts 7M (modelo TTS que lo integra): https://huggingface.co/milliwattlabs/leokani-tts-7M
- Demo de Leokani-tts en el navegador: https://huggingface.co/spaces/milliwattlabs/leokani-tts-7M-demo
- Kokoro-82M (modelo TTS compatible): https://huggingface.co/hexgrad/Kokoro-82M
- misaki (codigos de fonema de referencia): https://github.com/hexgrad/misaki
- Milliwatt Labs: https://milliwattlabs.com
- GeoNames (origen de toponimos del lexico): https://www.geonames.org
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
