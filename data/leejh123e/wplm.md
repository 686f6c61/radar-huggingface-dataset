# Leejh123e/WPLM

## Resumen

WPLM es un modelo de lenguaje de pequeno tamano cuyo factor distintivo no es el rendimiento, sino el metodo de construccion: sus pesos no provienen de un entrenamiento por descenso de gradiente, sino de una lista de ediciones en texto plano aplicada sobre tensores inicializados a cero. El autor, Leejh123e (Junhoo), lo presenta como un ejercicio de "programacion de pesos" (weight programming) en el que cada valor no nulo del transformer es trazable a una linea concreta del fichero `weights/wplm.edits`, que contiene 14.396 lineas de edicion.

El modelo sigue la idea del "CPU-GPU dual LM" descrita en el articulo *The Mystery of the Unlearned Parameters*: una tabla estadistica externa (el "ghost table") construida sobre el API publico infini-gram de AI2 con 4,6 billones de tokens de OLMo 2 propone candidatos de siguiente palabra con sus recuentos, y una red neuronal pequena decide cuando consultarla, que preguntar, si confiar en la respuesta y que palabra emitir. En WPLM la parte neuronal no aprende nada: esta programada.

Se trata de un bot conversacional de charla trivial en ingles, con arquitectura decoder transformer de 5 bloques, 29 cabezas de atencion y anchura residual de 9.114, que contiene 68.633 pesos no nulos de un total de 249.124.749 parametros. Su interes es principalmente conceptual y educativo: demuestra que se puede construir un generador de texto funcional sin ningun paso de entrenamiento y con trazabilidad completa de cada salida hasta neuronas y pesos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer: embeddings, 5 bloques (atencion + MLP con ReLU), salida; sin LayerNorm |
| Parametros totales | 249.124.749 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los tensores se almacenan densos, aproximadamente 1 GB de RAM) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy) y lista de ediciones en texto plano `.edits`; no se distribuye en safetensors ni GGUF |

Otros datos tecnicos relevantes: 29 cabezas de atencion, anchura residual de 9.114 dimensiones (cada una con nombre en `arch.json`), 68.633 pesos no nulos, 14.396 lineas de edicion y 0 pasos de entrenamiento. El fichero `weights/wplm.npz` tiene el hash sha256 `92ee68e0d7cbe1ea0299c6efbdc70ed36de61ecbe9b2248e337a1bedd76917ed`.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de cinco bloques, cada uno compuesto por atencion y un MLP con activacion ReLU, sin normalizacion de capas. La anchura residual es de 9.114 dimensiones y el modelo emplea 29 cabezas de atencion. El vocabulario corresponde al tokenizador SentencePiece estandar de Llama-2, descargado de `hf-internal-testing/llama-tokenizer` en el primer uso o apuntado mediante la variable `WPLM_TOKENIZER`.

No hay entrenamiento: los pesos se generan aplicando la lista de ediciones `weights/wplm.edits` sobre tensores a cero, y `wplm.load.load_from_edits()` reconstruye exactamente los mismos tensores que el fichero `.npz`. La innovacion central es el acoplamiento con una "ghost table" estadistica: el API publico infini-gram de AI2 sobre datos de OLMo 2 (4,6 billones de tokens), construida una sola vez y nunca entrenada. Los pesos programados determinan cuando consultar esa tabla, con que consulta, como interpretar el resultado y cuando copiar una linea literal en lugar de generar token a token. El programa anfitrion solo tokeniza, ejecuta la busqueda solicitada por la red, proporciona numeros aleatorios y anade el token elegido.

La lista de ediciones fue escrita por un generador producido por Claude, un modelo de IA, lo que el autor destaca como parte del experimento. La version 1.0 del modelo se llamaba Gram y afirmaba tener pesos "escritos a mano"; en la version 1.3 se renombro a WPLM editando unicamente el fichero de pesos: 322 de las 14.397 lineas cambiaron (231 con nuevos numeros, 91 solo en comentarios), moviendo 4.225 valores, todos en la capa de salida (`L5.out.W1`: 2.614, `L5.out.b1`: 15, `L5.out.W2`: 1.596). El diff completo esta en `weights/rename_from_gram.diff`.

## Capacidades

- Generacion de texto conversacional en ingles orientada a charla trivial (small talk).
- Respuestas de persona y presentacion propias, codificadas directamente en neuronas de la capa de salida.
- Consulta a una tabla estadistica externa (infini-gram) para obtener candidatos de siguiente palabra con recuentos.
- Decision programada sobre cuando confiar en la tabla y que palabra tomar, incluyendo copia literal de lineas de dialogo reales.
- Filtrado de vocabulario mediante lista de bloqueo: el modelo puede detenerse justo antes de una palabra prohibida.
- Trazabilidad completa: cada respuesta se puede rastrear hasta las neuronas, cabezas de atencion y pesos que la produjeron.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-pasos ni modo de pensamiento (thinking mode).
- No tiene capacidades de vision ni audio.
- Multilingue: solo ingles.

## Casos de uso

- Demostracion educativa de programacion de pesos: util en cursos y charlas para mostrar que un transformer puede generar texto sin ningun paso de entrenamiento, aplicando una lista de ediciones legible sobre tensores a cero.
- Estudio de trazabilidad de salidas: al poder mapear cada token generado a neuronas y pesos concretos, sirve para investigar interpretabilidad mecanicista en un entorno de complejidad reducida.
- Prototipado de arquitecturas hibridas estadistico-neuronales: el esquema CPU-GPU dual LM (tabla infini-gram mas red pequena) puede replicarse con otros corpus y otras listas de edicion para experimentar con el reparto de responsabilidades entre ambos componentes.
- Experimentos de edicion directa de comportamiento: renombrar el bot o reescribir sus lineas de persona modificando solo el fichero de pesos, sin tocar codigo, como se hizo entre las versiones 1.0 y 1.3.
- Bot de charla trivial para entornos controlados: respuestas de small talk en ingles con latencia de pocos segundos en CPU, adecuado para demos y pruebas de concepto, no para atencion al cliente real.
- Verificacion de integridad de pesos: el par de cargadores (`.npz` y `.edits`) y el hash sha256 publicado permiten comprobar la reproducibilidad de la construccion de tensores en pipelines de validacion.
- Analisis de fallos controlados: ejemplos documentados como el error aritmetico en "what is 2+2" permiten estudiar como una confianza mal calibrada en la tabla estadistica produce alucinaciones en un sistema totalmente inspeccionable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica GPU; el modelo se ejecuta en CPU con aproximadamente 1 GB de RAM, ya que los tensores se almacenan densos.
- GPU recomendadas: no disponible; no se documenta ejecucion en GPU.
- Cabe en GPU consumer: no se especifica; el cuello de botella real es la latencia de red hacia el API de infini-gram, no la memoria.
- Opciones de despliegue: ejecucion directa con Python mediante `chat.py` o la API `wplm.load` / `wplm.host.SimHost`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado el formato de pesos propio (`.npz` y `.edits`).
- Dependencias: `numpy`, `sentencepiece` y `huggingface_hub`; se requiere acceso a Internet para el API publico de infini-gram.
- Latencia y throughput: una respuesta tarda unos pocos segundos en CPU; el cliente limita las peticiones a menos de 40 por minuto (`WPLM_RPM`) y cachea respuestas en `~/.cache/wplm` (`WPLM_CACHE`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WPLM | 249,1 M totales (68.633 no nulos) | No disponible | 0 pasos (pesos programados) | MIT | Hugging Face (`Leejh123e/WPLM`) |
| Modelos de referencia comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria. La categoria mas cercana conceptualmente son los modelos pequenos de charla trivial entrenados de forma convencional, pero no se aportan cifras para contrastarlos.

## Limitaciones y advertencias

- El modelo solo habla ingles y esta disenado para charla trivial; no es adecuado para tareas de razonamiento, codigo, matematicas ni recuperacion de informacion fiable.
- Riesgo elevado de alucinacion por confianza mal calibrada en la tabla estadistica: el propio autor documenta el fallo "what is 2+2" respondiendo "The sum of 2 and 4 is 6.".
- Dependencia de un servicio externo: sin acceso a Internet al API publico de infini-gram, el modelo no puede generar respuestas que requieran consultas; el limite de 40 peticiones por minuto condiciona el throughput.
- Longitud de contexto no documentada; no hay datos sobre manejo de conversaciones largas.
- No soporta tool calling, agentes, vision ni audio.
- Sesgos: no se documentan analisis de sesgo; al depender de una tabla estadistica construida sobre datos de OLMo 2 y de lineas de dialogo reales, puede reproducir sesgos presentes en ese corpus.
- Licencia MIT: permite uso comercial, pero al tratarse de un prototipo educativo sin garantias de calidad, su uso en produccion orientada al usuario final no es recomendable.
- El modelo afirma en sus respuestas que sus pesos fueron programados por una IA; esta informacion forma parte del comportamiento programado y no debe interpretarse como una evaluacion independiente.
- El repositorio no contiene ficheros en formatos estandar de inferencia (safetensors, GGUF), lo que limita la integracion con herramientas convencionales de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Leejh123e/WPLM
- Perfil del autor en Hugging Face: https://huggingface.co/Leejh123e
- Articulo de referencia *The Mystery of the Unlearned Parameters*: https://junhoo.me/mysteryofunlearnedparameters
- API publica infini-gram de AI2: https://infini-gram.io
- Tokenizador Llama-2 de referencia: https://huggingface.co/hf-internal-testing/llama-tokenizer
- Fichero de pesos: `weights/wplm.npz` (incluido en el repositorio)
- Lista de ediciones: `weights/wplm.edits` (incluida en el repositorio)
- Diff del renombrado de Gram a WPLM: `weights/rename_from_gram.diff` (incluido en el repositorio)
