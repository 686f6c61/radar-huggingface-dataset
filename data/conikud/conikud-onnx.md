# conikud/conikud-onnx

## Resumen

conikud-onnx es un modelo de conversion de grafema a fonema (grapheme-to-phoneme, G2P) para hebreo que transforma texto sin vocalizar en transcripcion IPA con marca de acento. Lo desarrolla el autor conikud y se distribuye como un unico fichero ONNX autocontenido: el tokenizador wordpiece, el vocabulario de fragmentos (chunks) y las reglas foneticas por letra viajan dentro del propio fichero como metadatos, de modo que no requiere ficheros auxiliares ni dependencias de tokenizacion externas.

El problema que resuelve es especifico y bien delimitado: el hebreo omite las vocales en su escritura, por lo que una misma grafia admite lecturas distintas. El propio autor ilustra el caso con ספר, que puede leerse sˈefeʁ (libro), safˈaʁ (conto) o sapˈaʁ (barbero). El modelo desambigua a partir del contexto de la frase y devuelve una pronunciacion con un unico acento por palabra, ademas de ofrecer un modo `alternatives()` que conserva las k lecturas competidoras con sus puntuaciones.

Es relevante para cualquier pipeline de text-to-speech, accesibilidad o ensenanza del hebreo que necesite pronunciacion realista, algo poco cubierto por los modelos multilingues genericos. La ficha no especifica la arquitectura interna subyacente, el numero de parametros ni la longitud de contexto; los datos publicados se limitan al formato de despliegue, a la licencia MIT y a las metricas de error de palabra sobre dos conjuntos de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Se distribuye como grafo ONNX con tokenizador wordpiece, vocabulario de fragmentos y reglas foneticas por letra embebidos como metadatos |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 dynamic quantization de los pesos de las MatMul (`conikud_int8.onnx`); el autor indica que existe exportacion en fp32 y que es preferible en GPU |
| Idiomas soportados | Hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | ONNX (fichero unico `conikud_int8.onnx`, 669 MB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura neuronal subyacente (no se indica si es un transformer, un modelo secuencial o un sistema hibrido con reglas). Lo que si se documenta es el contrato de inferencia: el fichero ONNX incorpora como metadatos un tokenizador wordpiece, un vocabulario de fragmentos y reglas foneticas por letra. La decodificacion opera con un beam top-k exacto sobre los fragmentos que cada letra puede emitir, y cada lectura resultante lleva exactamente un acento por palabra, lo que garantiza que toda variante devuelta sea una pronunciacion bien formada de esa grafia y no una muestra arbitraria de logits.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO o ajuste por refuerzo; son datos no disponibles. La unica informacion sobre evaluacion es que se uso un conjunto interno de 250 frases y el benchmark MILIM-Bench. El propio autor advierte de que no se ha auditado el solapamiento entre el lexico, los datos de entrenamiento y los conjuntos de evaluacion, por lo que las cifras publicadas no constituyen una comparacion libre de filtracion frente a otros sistemas.

## Capacidades

- Fonemizacion de texto hebreo sin vocalizar a IPA con marca de acento, con resolucion de homografos dependiente del contexto de la frase.
- Modo `alternatives(text, k=n)` que devuelve las n mejores lecturas por palabra con puntuacion asociada (por ejemplo, ספר -> safˈaʁ 0,62 / safˈeʁ 0,25 / sapˈaʁ 0,13).
- Generacion de variantes foneticamente validas: beam top-k exacto sobre los fragmentos emitibles por cada letra, con un unico acento por palabra.
- Distribucion autocontenida: tokenizador, vocabulario de fragmentos y reglas por letra incluidos como metadatos del propio ONNX, sin necesidad de ficheros de configuracion externos.
- Integracion sencilla como etapa previa de un pipeline de text-to-speech.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio. Es un componente especializado de preprocesado linguistico, no un modelo generativo de proposito general.
- Capacidad multilingue: no disponible; el modelo declara unicamente hebreo.

## Casos de uso

- Sintesis de voz en hebreo: el modelo convierte el texto plano de entrada en IPA acentuado, que es la representacion que consumen los sintetizadores neuronales; al resolver la ambiguedad vocalica evita pronunciaciones incorrectas en palabras homografas frecuentes.
- Lectores de pantalla y accesibilidad: integrado en un lector para hebreo, permite derivar la pronunciacion de cualquier palabra sin necesidad de un diccionario grabado, cubriendo vocabulario nuevo o nombres propios.
- Ensenanza de hebreo como lengua extranjera: el modo `alternatives()` permite mostrar al estudiante las lecturas posibles de una misma grafia y su probabilidad, util en ejercicios de lectura y en la explicacion de la omision vocalica.
- Lexicografia y anotacion linguistica: generar transcripciones IPA con acento para entradas de diccionario o corpus orales, y usar las alternativas top-k como candidatos para revision humana.
- Preprocesado para reconocimiento de voz: la salida fonetica sirve como capa intermedia para alineacion forzada, medicion de error de pronunciacion o construccion de lexicos de pronunciacion para un decodificador ASR.
- Sistemas de respuesta vocal interactiva (IVR) y asistentes de voz en hebreo: al ser un fichero ONNX de 669 MB en int8, puede desplegarse en CPU junto al motor de sintesis sin depender de GPU.
- Investigacion fonologica del hebreo moderno: medir de forma sistematica la distribucion de lecturas de grafias ambiguas sobre corpus grandes y comparar variantes dialectales o de registro.

## Benchmarks y rendimiento

Los datos de la model card se refieren a error de palabra (WER) y exactitud, medidos sobre el conjunto interno de 250 frases y sobre MILIM-Bench. No son benchmarks de modelos de lenguaje y no incluyen MMLU, HumanEval ni GSM8K.

| Metrica | int8 | fp32 |
|---|---|---|
| WER en conjunto interno de evaluacion | 9,97 % | 9,97 % |
| WER en MILIM-Bench | 16,56 % | 16,37 % |
| Exactitud de palabra en MILIM-Bench | 83,44 % | 83,63 % |
| Frase exacta en MILIM-Bench | 71,81 % | 72,11 % |

El autor senala que la cuantizacion int8 cuesta como maximo 0,19 puntos de exactitud de palabra a cambio de un fichero 2,2 veces mas pequeno. Tambien advierte que el solapamiento entre lexico, entrenamiento y evaluacion no ha sido auditado, por lo que estas cifras no permiten establecer una comparacion libre de filtracion con otros sistemas. No se publican cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato publicado. Como referencia de orden de magnitud, el fichero int8 ocupa 669 MB y el autor indica que la version fp32 es aproximadamente 2,2 veces mayor (en torno a 1,5 GB), por lo que el consumo esperado es bajo. Estas cifras son derivadas, no oficiales.
- GPU recomendadas: no se especifican. Por tamano, cualquier GPU con 2 GB o mas de memoria deberia ser suficiente; el autor recomienda exportacion fp32 en GPU porque las MatMul cuantizadas a int8 no tienen kernels nativos CUDA y caen a traves del limite de dispositivo, perdiendo mas en copias de memoria de lo que ahorra la cuantizacion.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en graficos integrados; en CPU es donde el autor posiciona el fichero int8 como opcion por defecto.
- Opciones de despliegue: ONNX Runtime (formato nativo); el paquete Python se instala con `pip install git+https://github.com/conikud/conikud-onnx` y descarga `conikud_int8.onnx` en el primer uso, quedando en cache. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otros sistemas de G2P para hebreo, y la busqueda web realizada no devolvio enlaces tecnicos relevantes. La unica referencia comparativa mencionada es el conjunto de evaluacion MILIM-Bench, que podria servir de base para una comparacion, pero no se aportan resultados de terceros sobre el mismo.

## Limitaciones y advertencias

- Es un componente especializado de fonemizacion, no un modelo de proposito general: no genera texto, no razona, no ejecuta codigo ni soporta tool calling.
- Ambito limitado al hebreo. No hay evidencia de funcionamiento en otros idiomas ni de transferencia multilingue.
- Riesgo de error en homografos: la tasa de error de palabra en MILIM-Bench es del 16,56 % en int8, con un 28,19 % de frases que no coinciden exactamente con la referencia. En produccion conviene prever revision o fallback para palabras criticas.
- Las cifras de evaluacion pueden estar contaminadas: el propio autor reconoce que no se ha auditado el solapamiento entre lexico, datos de entrenamiento y conjuntos de evaluacion.
- En GPU, la version int8 puede ser mas lenta que fp32 por la ausencia de kernels CUDA nativos para MatMul cuantizado; el autor recomienda exportar en fp32 para ese escenario.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Es una licencia permisiva, sin las restricciones de los modelos con licencias de comunidad.
- No se documentan sesgos, longitud de contexto, limites de entrada ni comportamiento con texto vocalizado (con nikud) o con mezcla de idiomas dentro de una misma frase.
- Traccion muy baja en el repositorio (0 descargas y 1 like en el momento de la consulta), lo que implica poca validacion externa y un mantenimiento no contrastado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/conikud/conikud-onnx
- Repositorio e instalacion del paquete: https://github.com/conikud/conikud-onnx
- Conjunto de evaluacion MILIM-Bench: https://huggingface.co/datasets/renikud/MILIM-Bench
- Los resultados de busqueda web devueltos no contenian enlaces tecnicos relevantes sobre este modelo (correspondian al portal de noticias t-online.de), por lo que no se anaden mas referencias.
