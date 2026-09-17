# genaforvena/finnegans-fake-bpe4096

## Resumen

Finnegans Fake — BPE-4096 es un modelo de lenguaje de 12.318.720 parametros entrenado integramente sobre el texto completo de *Finnegans Wake* de James Joyce. Lo desarrolla el usuario de HuggingFace genaforvena como experimento de investigacion sobre tokenizacion y generacion de neologismos, no como modelo de proposito general. La arquitectura es un transformer tipo GPT-2 reducido (6 capas, 6 cabezas de atencion, 384 dimensiones de embedding) con una ventana de contexto de solo 256 tokens y un vocabulario BPE byte-level de 4096 tokens entrenado especificamente sobre el propio libro.

Su relevancia es metodologica mas que practica. El autor documenta dos cuestiones tecnicas poco habituales en fichas de modelos: primero, el corpus tiene 58.725 tipos de palabra distintos, de los cuales 46.599 (el 79,4%) son hapax legomena (aparecen una sola vez), lo que invalida cualquier tokenizacion a nivel de palabra y justifica el BPE entrenado ad hoc; segundo, el autor publica un error de implementacion que estuvo presente en sus primeras metricas (doble desplazamiento de etiquetas, que hacia que el modelo aprendiera a predecir el token t+2), y aclara que todas las cifras de la ficha son posteriores a la correccion.

El checkpoint publicado es el de mejor perdida de validacion (5,8768), no el de final de entrenamiento (7,7704). El propio autor advierte de que el modelo "no es bueno y no pretende serlo" y de que no debe usarse para nada en produccion. Se distribuye con licencia CC0-1.0, sin el corpus, que el usuario debe aportar por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (6 capas, 6 cabezas, 384 dimensiones de embedding) |
| Parametros totales | 12.318.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se publican artefactos cuantizados; al ser un modelo de 12,3 M de parametros la cuantizacion es innecesaria en la practica) |
| Idiomas soportados | no disponible (no se declara ningun idioma; el corpus es el texto de *Finnegans Wake*, escrito en un ingles multilingue y de acronimos) |
| Licencia | cc0-1.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Vocabulario | 4096 tokens, BPE byte-level, con `add_prefix_space: true` |
| Tamano del repositorio | 0,0 GB (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion en HuggingFace | 2026-09-16 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la configuracion clasica de GPT-2 reducida a 6 capas, 6 cabezas de atencion y 384 dimensiones de embedding, con un total de 12.318.720 parametros. La innovacion relevante no esta en la arquitectura, sino en el tokenizador: se entrena un BPE byte-level de 4096 tokens sobre el propio *Finnegans Wake*, en lugar de reutilizar el vocabulario estandar de GPT-2 (50.257 tokens). La justificacion la da el propio corpus: 46.599 de los 58.725 tipos de palabra (79,4%) aparecen una sola vez, y solo el 69,8% del texto esta cubierto por tipos vistos cinco veces o mas. Con una tokenizacion a nivel de palabra, cualquier palabra no vista acabaria en `<unk>` y el modelo no podria acunar terminos nuevos, que es precisamente el comportamiento que el experimento quiere estudiar.

El entrenamiento consistio en 6000 iteraciones con batch de 32, learning rate 0,0006 y dropout 0,2. La mejor perdida de validacion alcanzada fue 5,8768 (perplejidad aproximada de 356,6, calculada como e^5,8768), mientras que la perdida al final de la ejecucion fue 7,7704 (perplejidad aproximada de 2369,3), 1,89 nats por encima. El repositorio contiene el checkpoint de mejor validacion, no el ultimo. No se documenta uso de RLHF, DPO ni ningun ajuste posterior al preentrenamiento.

El autor documenta un fallo de implementacion relevante: la funcion `batch()` devolvia etiquetas ya desplazadas al estilo nanoGPT mientras que `transformers` las desplaza por su cuenta, de modo que el desplazamiento ocurria dos veces y el modelo aprendia a predecir el token t+2 desde la posicion t. El error no provocaba excepciones y producia curvas de perdida plausibles, lo que sostuvo temporalmente una conclusion erronea sobre la incompresibilidad estadistica del texto. Tras la correccion, 400 pasos superaron a los 6000 pasos de la version defectuosa.

## Capacidades

- Generacion de texto autoregresiva con decodificacion por muestreo (temperatura, top-k, top-p); el ejemplo de la model card usa `temperature=0.9`, `top_k=100`, `top_p=0.95`.
- Generacion de palabras inventadas y aglutinaciones (portmanteau) en el estilo de *Finnegans Wake*, que es el objetivo declarado del experimento.
- Reproduccion fiel del estilo superficial del corpus: ortografia distorsionada, sintaxis fragmentaria y lexico inventado.
- Cobertura de los 105 caracteres distintos presentes en el corpus, gracias a la tokenizacion byte-level.
- Round-trip de tokenizacion exacto, byte a byte, verificado sobre 20.000 caracteres del corpus de entrenamiento (con la salvedad del espacio inicial que se describe mas abajo).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento en multiples pasos.
- No tiene modo de pensamiento (thinking), vision, audio ni ninguna capacidad multimodal.
- No se declara soporte multilingue, mas alla del caracter multilingue intrinseco del propio texto de Joyce.

## Casos de uso

- Investigacion sobre tokenizacion en corpus de alta diversidad lexica: el modelo sirve como caso de estudio controlado para medir que ocurre cuando se entrena un BPE con vocabulario pequeno (4096) sobre un texto con un 79,4% de hapax legomena.
- Estudio de acunacion de neologismos: permite comparar las palabras inventadas por el modelo con las acunadas por Joyce, y evaluar si un modelo diminuto puede generalizar morfologia en lugar de citar terminos memorizados.
- Benchmark de modelos diminutos en CPU: con 12,3 M de parametros, la inferencia completa cabe en CPU sin GPU y sirve para validar canalizaciones de evaluacion antes de escalar a modelos mayores.
- Reproducibilidad de errores de entrenamiento: el fallo de doble desplazamiento de etiquetas documentado en la ficha es un material didactico excelente para entender por que una perdida descendente no garantiza un objetivo correcto.
- Docencia de aprendizaje automatico: el tamano reducido y el coste de entrenamiento bajo permiten reproducir el ciclo completo (tokenizacion, entrenamiento, evaluacion) en una sola sesion practica.
- Generacion creativa experimental y arte generativo: util para producir texto con la textura del *Wake* en instalaciones, poemarios generados o experimentos de escritura automatica, siempre con supervision humana y expectativas de calidad muy bajas.
- Auditoria de ficha de modelo: el repositorio documenta explicitamente los limites, las metricas corregidas y el alcance del corpus, lo que lo convierte en un ejemplo de transparencia metodologica frente a fichas infladas.
- No es adecuado para atencion al cliente, generacion de codigo, matematicas, razonamiento, resumen, traduccion ni ninguna tarea de produccion. El propio autor indica literalmente que no se use para nada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion del entrenamiento, que se recoge en la tabla siguiente junto con su perplejidad derivada.

| Metrica | Valor | Nota |
|---|---|---|
| Perdida de validacion (mejor) | 5,8768 | Checkpoint publicado en el repositorio |
| Perplejidad derivada (mejor) | ~356,6 | Calculada como e^5,8768 |
| Perdida de validacion (final de ejecucion) | 7,7704 | 1,89 nats por encima del mejor |
| Perplejidad derivada (final) | ~2369,3 | Calculada como e^7,7704 |
| MMLU | no disponible | No se ha evaluado |
| HumanEval | no disponible | No se ha evaluado |
| GSM8K | no disponible | No se ha evaluado |

No se dispone de comparaciones de rendimiento con otros modelos. Cualquier cifra de benchmark estandar seria inventada y por tanto no se incluye.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 49 MB en FP32, 25 MB en FP16/BF16, 12 MB en int8 y 6 MB en int4 (estimaciones derivadas de los 12.318.720 parametros; el autor no publica cifras).
- GPU recomendadas: ninguna en particular; cualquier GPU con al menos 1 GB de memoria es sobradamente suficiente, e incluso la inferencia en CPU es inmediata.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una GPU integrada moderna. Tambien cabe comodamente en Raspberry Pi y en telefonos moviles.
- Opciones de despliegue: `transformers` de forma nativa; el tag `text-generation-inference` y `endpoints_compatible` indica compatibilidad con TGI y con los endpoints de HuggingFace. No se publican artefactos GGUF, por lo que para usarlo con llama.cpp u Ollama seria necesaria una conversion propia (llama.cpp soporta la arquitectura GPT-2).
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Restriccion practica de despliegue: la ventana de contexto de 256 tokens limita severamente cualquier uso conversacional o con documentos largos, con independencia del hardware disponible.

## Comparativa con modelos similares

La comparacion se limita a parametros, contexto y licencia, porque no hay datos de benchmarks publicados para este modelo ni una evaluacion comun con las alternativas.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| genaforvena/finnegans-fake-bpe4096 | 12,3 M | 256 tokens | cc0-1.0 | Vocabulario BPE de 4096 entrenado sobre un unico libro; objetivo experimental |
| gpt2 (124M, OpenAI) | 124 M | 1024 tokens | MIT | Modelo generalista entrenado con WebText; vocabulario BPE de 50.257 |
| distilgpt2 | 82 M | 1024 tokens | Apache-2.0 | Destilado de GPT-2, orientado a generacion de texto general |
| Modelos de la familia TinyStories | 1 M – 33 M | 512 – 2048 tokens | variable (habitualmente MIT o Apache-2.0) | Entrenados con un corpus sintetico de cuentos simples en ingles; comparables en orden de magnitud de parametros |

Rendimiento comparado: no disponible. El unico dato objetivo es que finnegans-fake es entre 6 y 10 veces mas pequeno que GPT-2 y distilgpt2, con un contexto entre 2 y 4 veces menor, y que fue entrenado con 6000 iteraciones sobre 224.527 palabras, un volumen de datos ordenes de magnitud inferior al de sus alternativas.

## Limitaciones y advertencias

- Calidad deliberadamente baja: el autor afirma que el modelo "no es bueno y no pretende serlo" y pide explicitamente que no se use para nada. La muestra de generacion incluida en la ficha no es ingles coherente.
- Contexto de solo 256 tokens: insuficiente para dialogos multi-turno, documentos largos o cualquier tarea que requiera memoria extensa.
- Riesgo de alucinacion no evaluado: al entrenarse sobre un unico libro de ficcion experimental, no existe una nocion clara de veracidad; el modelo genera texto plausible en estilo pero sin ningun anclaje factual.
- Sesgos conocidos: no se ha realizado ninguna evaluacion de sesgos. El corpus es una obra literaria de 1939 con un lenguaje idiosincratico, por lo que cualquier sesgo derivado del texto no esta caracterizado.
- Vocabulario cerrado de 4096 tokens: fuera del dominio del *Wake* la tokenizacion es altamente ineficiente y la calidad cae rapidamente.
- Codigo de ejemplo incompleto: la model card usa `AutoTokenizer.from_pretrained("finnegans-fake-bpe4096")`, sin el prefijo de usuario `genaforvena/`, por lo que ese fragmento tal cual no resolvera el repositorio.
- Espacio inicial en la decodificacion: el tokenizador usa `add_prefix_space: true`, de modo que `tok.decode(tok("riverrun").input_ids)` devuelve `' riverrun'` con un espacio delante que no estaba en la entrada. El round-trip es exacto por lo demas, verificado sobre 20.000 caracteres del corpus.
- El corpus no se redistribuye: el usuario debe aportar el libro por su cuenta.
- Situacion legal del corpus: *Finnegans Wake* es de dominio publico en Irlanda, el Reino Unido y la UE (Joyce murio en 1941), pero no en Estados Unidos hasta 2035. Que los pesos entrenados sean o no una obra derivada del texto de entrenamiento es una cuestion juridica no resuelta.
- La licencia CC0-1.0 se aplica al codigo y a los pesos publicados, no al corpus.
- Metadatos anomolos: la fecha de creacion registrada en HuggingFace (2026-09-16) es posterior a la fecha de consulta habitual y el repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion externa ni uso comunitario documentado.
- Metricas historicas corregidas: cualquier cifra publicada antes de la correccion del doble desplazamiento de etiquetas describia un modelo que predecia el token t+2 y no debe tomarse como valida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/genaforvena/finnegans-fake-bpe4096
- Codigo del proyecto (CC0): https://github.com/genaforvena/finnegans-fake
- Paper asociado: no disponible
- Blog o articulo tecnico del autor: no disponible
- Demo o Space: no disponible
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos correspondian a un perfil profesional homonimo sin relacion con el proyecto.
