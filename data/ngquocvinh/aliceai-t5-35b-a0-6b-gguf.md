# ngquocvinh/AliceAI-T5-35B-A0.6B-GGUF

## Resumen

AliceAI-T5-35B-A0.6B-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo `yandex/AliceAI-T5-35B-A0.6B`, publicadas por el usuario ngquocvinh. Se trata de un modelo de lenguaje encoder-decoder con capas de mezcla de expertos dispersa (MoE), desarrollado originalmente por Yandex, y esta pensado para ejecutarse en el runtime de llama.cpp mediante un grafo que incluye encoder, atencion cruzada y decodificador.

El modelo base declara aproximadamente 34,35B de parametros unicos y 34.561.885.184 parametros reales segun los pesos safetensors, con 512 expertos por capa MoE y enrutamiento top-8, estado oculto de 1.536 dimensiones, 16 capas de encoder y 12 de decodificador, embeddings compartidos entre encoder y decodificador, y RoPE con YaRN. La model card del upstream anuncia una ventana de contexto de 128K tokens, si bien esta publicacion GGUF no ha sido validada en esa longitud maxima.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo MoE de ~35B en hardware de consumo mediante cuantizaciones de 12,7 GB a 36,8 GB; por otro, es un caso poco habitual de arquitectura encoder-decoder MoE convertida a GGUF, ya que la mayoria de los GGUF publicados corresponden a modelos decoder-only. No se realizo ningun entrenamiento ni ajuste adicional: todos los artefactos derivan directamente del snapshot BF16 del upstream, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer con capas de mezcla de expertos dispersa (MoE), atencion cruzada, embeddings compartidos y RoPE con YaRN |
| Parametros totales | 34.561.885.184 (34,56B) segun pesos safetensors; la model card upstream cita aproximadamente 34,35B de parametros unicos |
| Parametros activos | No disponible de forma explicita; la nomenclatura del modelo (A0.6B) apunta a unos 0,6B de parametros activos, pero la model card no desglosa el calculo |
| Longitud de contexto | 128K tokens anunciados en la model card upstream; no validado en esta release GGUF |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, IQ4_XS y Q2_K (esta ultima experimental) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo original upstream se distribuye en safetensors |

Detalle de expertos y dimensiones internas: 512 expertos por capa MoE con top-8 routing, hidden state de 1.536, 16 capas de encoder y 12 de decodificador.

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder con MoE dispersa en lugar de un decoder-only. El encoder procesa la entrada completa (con cross-attention hacia el decodificador), y el decodificador genera de forma autorregresiva. Esta estructura implica que cualquier runtime debe ejecutar tres fases: codificacion, atencion cruzada y generacion. La model card de esta publicacion advierte explicitamente de que una invocacion generica de `llama-cli` en modo decoder-only no es suficiente para esta arquitectura.

No hubo entrenamiento ni fine-tuning en esta publicacion: cada archivo se convirtio directamente desde el snapshot BF16 bloqueado del upstream, con la revision `a0d71f58c40d6affe461797b30b35ff47f52a5f2` como entrada fijada. No se uso ningun archivo cuantizado como fuente de otro archivo cuantizado. Para las cuantizaciones se construyo una imatrix combinada a partir de un conjunto de calibracion especifico de AliceAI mas texto de entrenamiento de Wikitext. No se detalla en la informacion disponible la composicion del dataset de entrenamiento original, el numero de tokens vistos ni si hubo fases de RLHF o DPO en el modelo de Yandex.

## Capacidades

- Generacion de texto condicionada por un encoder, con atencion cruzada: el modelo recibe una secuencia de entrada codificada y genera la salida con el decodificador.
- Razonamiento y respuesta a preguntas factuales sencillas en el protocolo probado por el autor: la prueba de humo con `Q4_K_M` devuelve `Paris` para la pregunta sobre la capital de Francia.
- Extraccion de caracteristicas: la ficha de HuggingFace incluye la etiqueta `feature-extraction`, coherente con el componente encoder.
- Soporte multilingue: no disponible (la publicacion no declara lista de idiomas).
- Tool calling / function calling: no disponible; no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; no se menciona ninguna capacidad multimodal ni de razonamiento extendido.
- Compatibilidad con endpoints: la publicacion incluye la etiqueta `endpoints_compatible`.

## Casos de uso

- Preguntas y respuestas factuales en CPU: el autor valida la generacion determinista con `llama-simple`, `-ngl 0` y un unico token de salida, de modo que el modelo puede usarse para QA corta sin GPU, aceptando latencias altas.
- Procesamiento de documentos largos: la ventana anunciada de 128K tokens en el upstream permitiria resumir o extraer informacion de contratos, informes o articulos extensos, aunque la longitud maxima no esta validada en esta release GGUF y habria que medirla antes de llevarla a produccion.
- Extraccion de representaciones y clasificacion: al tratarse de un modelo encoder-decoder, su encoder puede emplearse para obtener embeddings de texto destinados a busqueda semantica o clustering, aprovechando la etiqueta `feature-extraction`.
- Traduccion y reformulacion de texto: la estructura seq2seq con cross-attention es adecuada para tareas de transformacion entrada-salida, como traduccion o reescritura de parrafos.
- Experimentacion en investigacion sobre MoE dispersa: con 512 expertos por capa y top-8, el modelo permite estudiar comportamiento de enrutamiento, coste de activacion y degradacion por cuantizacion en un modelo de ~35B con pocos parametros activos.
- Despliegue en hardware limitado: las cuantizaciones de 12,7 GB (Q2_K) a 18,5 GB (IQ4_XS) permiten probar el modelo en equipos con 16-24 GB de memoria, aunque Q2_K no debe usarse cuando la correccion factual importa.
- Generacion de codigo: no disponible; no hay evidencia en la informacion proporcionada de un rendimiento especifico en tareas de codigo.
- Atencion al cliente multi-turno: no disponible; no se documenta el comportamiento conversacional ni la gestion de historial largo en esta release.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor de las cuantizaciones indica explicitamente que no se incluye todavia una tabla de fidelidad BF16 en hold-out, y que las metricas de KLD medio, acuerdo Top-1, delta de perplejidad y delta RMS de probabilidad se anadiran solo cuando un evaluador fijo de encoder-decoder mida cada archivo publicado contra la misma referencia BF16.

Lo unico registrado son pruebas de humo funcionales, que no son benchmarks de tarea:

| Prueba | Resultado declarado |
|---|---|
| Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, IQ4_XS | Superan la carga encoder-decoder y la generacion determinista de humo |
| Q2_K | Carga y genera, pero el resultado factual de la prueba no fue semanticamente correcto |
| IQ2_XS | No publicado: no produjo ningun token decodificado |
| IQ3_M | No publicado: solo genero salida en blanco o tokens de control |
| IQ1_M | No publicado: entro en bucle repetitivo con `<SPAN#511>Post` |

## Requisitos de hardware

Los valores de VRAM siguientes son estimaciones derivadas del tamano de cada archivo mas el margen de cache KV y overhead del runtime, no datos publicados por el autor:

| Cuantizacion | Tamano del archivo | VRAM estimada para inferencia |
|---|---:|---|
| BF16 | 69,18 GB | ~72 GB o mas; requiere varias GPU (por ejemplo 2x A100 40 GB) o una H100 80 GB |
| Q8_0 | 36,80 GB | ~40-44 GB |
| Q6_K | 28,43 GB | ~32-36 GB |
| Q5_K_M | 24,62 GB | ~28-32 GB |
| Q4_K_M | 21,04 GB | ~24-28 GB |
| IQ4_XS | 18,51 GB | ~22-24 GB |
| Q3_K_M | 16,58 GB | ~20-22 GB |
| Q2_K | 12,68 GB | ~16 GB (experimental, calidad factual comprometida) |

- GPU profesionales: A100 40 GB y 80 GB, H100 80 GB, L40S 48 GB y similares cubren desde IQ4_XS hasta Q6_K con contexto moderado.
- GPU de consumo: una RTX 4090 de 24 GB puede alojar IQ4_XS o Q3_K_M con holgura, y Q4_K_M de forma muy ajustada y sin apenas margen para cache KV extensa. Una RTX 3090 de 24 GB queda en la misma situacion.
- Ejecucion en CPU: confirmada por el autor para Q4_K_M con `-ngl 0`, que obtiene la respuesta correcta en la prueba de humo de un token. El rendimiento de tokens por segundo en CPU no se publica.
- Opciones de despliegue: llama.cpp, y en concreto una compilacion con soporte AliceAI que incluya el arnes de prueba encoder-decoder `llama-simple`. No hay confirmacion en la informacion disponible de soporte en vLLM, Ollama, TGI o SGLang.
- Protocolo de invocacion obligatorio: anteponer el token de modo `[_S_]` del upstream, anadir `<SPAN#0>` a la entrada del encoder y sembrar el decodificador con `[decoder_bos, <SPAN#0>]`. Ejemplo probado: `./build/bin/llama-simple -m ./AliceAI-T5-35B-A0.6B-Q4_K_M.gguf -ngl 0 -n 1 '[_S_]Question: What is the capital of France? Answer:<SPAN#0>'`.
- Latencia y throughput: no disponible; no se publican mediciones de velocidad.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni datos de modelos alternativos que permitan una comparacion verificable. Como referencia estructural, cabe senalar que la mayoria de los modelos MoE abiertos populares son decoder-only, mientras que este es encoder-decoder con atencion cruzada, lo que reduce el conjunto de alternativas directamente comparables en formato GGUF y obliga a usar runtimes especificos.

## Limitaciones y advertencias

- No es un modelo decoder-only: requiere un runtime que ejecute encoder, cross-attention y decodificador. Usar `llama-cli` generico produce resultados incorrectos.
- La ventana de 128K tokens es una afirmacion del upstream que esta release GGUF no ha validado; hay que medir el comportamiento real en contextos largos antes de usarla en produccion.
- Q2_K carga y genera, pero su resultado factual de humo no fue semanticamente correcto: debe tratarse como experimento de bajo consumo de memoria, nunca como recomendacion de calidad.
- IQ2_XS, IQ3_M e IQ1_M no se publicaron porque no superaron la puerta funcional (sin tokens, salida en blanco o bucle repetitivo).
- No existe tabla de fidelidad frente a BF16 (KLD, acuerdo Top-1, delta de perplejidad): se desconoce la degradacion real de cada nivel de cuantizacion.
- Las pruebas de humo declaradas no son benchmarks de tarea y no permiten inferir rendimiento en razonamiento, codigo o matematicas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es esperable en un modelo de ~35B usado con cuantizaciones agresivas y sin evaluacion publicada.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluacion de sesgo ni de seguridad.
- Idiomas soportados: no disponible; la publicacion no declara cobertura multilingue, pese a que el autor original sea Yandex.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero exige conservar avisos de licencia y atribucion. Estas cuantizaciones son una publicacion de la comunidad y no constituyen una release oficial de Yandex ni cuentan con su aval.
- El repositorio ocupa 508,6 GB en total por acumular todos los niveles de cuantizacion; conviene descargar unicamente el archivo necesario.
- La verificacion de integridad debe hacerse con `SHA256SUMS.txt`; los registros crudos de conversion, imatrix, cuantizacion y pruebas de humo no forman parte del paquete publico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ngquocvinh/AliceAI-T5-35B-A0.6B-GGUF
- Modelo base upstream: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Manifiesto de reproducibilidad: `reproducibility/manifest.md` dentro del repositorio
- Sumas de verificacion: `SHA256SUMS.txt` dentro del repositorio
- Licencia: `LICENSE` dentro del repositorio
- Pagina de donaciones del autor de las cuantizaciones: https://ko-fi.com/ngquocvinh
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo: el contenido devuelto corresponde a paginas de Google Play y no guarda relacion con esta ficha. No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
