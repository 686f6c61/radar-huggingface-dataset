# nazimboudeffa/PicoGPT1-Daisy

## Resumen

PicoGPT1-Daisy es un modelo de lenguaje de escala experimental desarrollado por nazimboudeffa, publicado en Hugging Face como una revision del anterior PicoGPT1-Jasmine. Se trata de un GPT-2 minimo (2 capas, 128 dimensiones, 2 cabezas de atencion, contexto de 256 tokens y 6.862.464 parametros totales) afinado sobre un subconjunto filtrado de 500 pares instruccion/respuesta de Alpaca, al que se anaden 245 ejemplos de anclaje extraidos de una base cerrada de 30 hechos. El modelo no busca competir en capacidad generica, sino servir de banco de pruebas reproducible para tecnicas de mitigacion de alucinaciones en modelos diminutos.

La innovacion principal no reside en la arquitectura, identica a la de su predecesor, sino en el pipeline de anclaje (RAG) implementado en Python: recuperacion TF-IDF sobre una base de hechos cerrada, decodificacion restringida a extractos literales del contexto recuperado y verificacion de soporte con abstruccion explicita ("Je ne sais pas.") cuando la confianza es baja. El modelo se distribuye en safetensors y GGUF, con soporte para llama.cpp y llama.app, y esta pensado para experimentacion, docencia y validacion de pipelines anti-alucinacion, no para produccion.

Es relevante ahora como ejemplo didactico de como separar generacion de conocimiento factual en modelos de muy bajo coste computacional, y como referencia para quienes investigan abstruccion, RAG con restricciones de decodificacion y evaluacion de fidelidad en modelos pequenos. Su huella (0,1 GB de repositorio) permite ejecutarlo en cualquier equipo, incluido CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 6.862.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | GGUF (variante incluida en el repo); cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible (entrenado sobre Alpaca, predominantemente ingles; respuestas de anclaje en frances) |
| Licencia | no disponible |
| Formato de pesos | safetensors (Transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT-2 con 2 capas, 128 dimensiones de modelo y 2 cabezas de atencion, con un tokenizer GPT-2 de 50.257 tokens y una ventana de contexto de 256 tokens. El formato aprendido es `prompt\nreponse<|endoftext|>`. El entrenamiento consistio en 10 epocas sobre 745 ejemplos (500 pares Alpaca filtrados mas 245 ejemplos de anclaje derivados de 30 hechos), con aproximadamente 1.860 pasos y una loss final de 4,54. Respecto a la version anterior (Jasmine), se eliminaron errores factuales conocidos (por ejemplo, "el agua hierve a 115 grados" o una definicion incorrecta de "mole"), se eliminaron duplicados y se uniformizo el formato.

La innovacion tecnica destacable es el pipeline de anclaje: `rag.py` recupera un hecho de `knowledge.jsonl` mediante TF-IDF con analisis `char_wb` de 3 a 5 caracteres sobre `text + question`, construye el prompt `Contexte: <texte> | Question: <question>\n`, restringe la decodificacion a extractos literales del contexto con busqueda por haces determinista (`num_beams=5`) y verifica el soporte con `is_supported()`. Si la puntuacion es inferior a 0,50 o la respuesta no esta soportada, el modelo responde "Je ne sais pas.". El decodificado por defecto usa muestreo (`top_k=40`, `no_repeat_ngram_size=3`, `repetition_penalty=1.15`) con parada en EOS o primer salto de linea. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generacion de texto condicionada a instrucciones en formato Alpaca, con respuestas cortas y delimitadas por salto de linea.
- Anclaje a contexto verificado (RAG) mediante scripts Python: recuperacion TF-IDF, decodificacion restringida y verificacion de soporte.
- Abstruccion explicita ("Je ne sais pas.") cuando la pregunta queda fuera de la base de 30 hechos o la confianza es baja.
- Generacion en modo libre con muestreo configurable (temperatura, top_k, penalizacion de repeticion).
- Ejecucion en llama.cpp y llama.app mediante el GGUF incluido, con CLI y servidor web de chat.
- Integracion con Transformers mediante `AutoModelForCausalLM` y `AutoTokenizer`.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue no documentada; el material de entrenamiento es mayoritariamente ingles y el pipeline de anclaje produce respuestas en frances.

## Casos de uso

- Docencia sobre alucinaciones en LLM: el modelo y su pipeline permiten mostrar en clase, con recursos minimos, como un modelo de 6,8 M de parametros puede pasar de inventar hechos a abstenerse cuando no hay soporte en el contexto.
- Validacion de pipelines RAG restringidos: util como banco de pruebas para experimentar con recuperacion TF-IDF, decodificacion restringida a extractos literales y verificacion de soporte antes de escalar la tecnica a modelos mayores.
- Investigacion en abstruccion: sus metricas publicadas (30/30 respuestas ancladas, 0/30 abstenciones erroneas dentro de base, 10/10 abstenciones correctas fuera de base) sirven como linea base reproducible para comparar metodos de calibracion de confianza.
- Prototipado de asistentes de dominio cerrado: con una base de hechos propia y el script `rag.py`, se puede montar un asistente que solo responda con informacion verificada de un catalogo, manual o FAQ, sin riesgo de fabricar datos.
- Pruebas de integracion con llama.cpp y llama.app: el GGUF permite validar flujos de despliegue local (CLI y servidor en `localhost:9931`) en entornos sin GPU y con requisitos de espacio minimos.
- Evaluacion comparativa de estrategias de decodificacion: la diferencia documentada entre decodificacion glotona (Jasmine) y muestreo con penalizacion de repeticion (Daisy) permite medir el impacto de estos parametros en la coherencia de modelos diminutos.
- Experimentos de destilacion o inicializacion: su tamano (0,1 GB de repositorio) lo hace adecuado como punto de partida para pruebas de entrenamiento rapido en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor publica metricas del pipeline de anclaje obtenidas con `python evaluate.py`:

| Medida | Resultado |
|---|---|
| Preguntas dentro de la base | 30 |
| Respuestas exactas | 9/30 |
| Respuestas ancladas | 30/30 |
| Abstenciones erroneas (dentro de base) | 0/30 |
| Retrieval correcto | 30/30 |
| Preguntas fuera de base | 10 |
| Abstenciones correctas (fuera de base) | 10/10 |

Interpretacion del autor: el modelo no fabrica hechos ausentes del contexto; el extracto recuperado no siempre es el mejor (9 exactos de 30), pero siempre esta soportado por el texto recuperado. No se proporcionan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquiera de los formatos disponibles (6,86 M de parametros); en la practica cabe en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, GTX 1060 o superior) es mas que suficiente. A100 o H100 no aportan ventaja practica.
- Cabe en cualquier GPU consumer y en equipos sin GPU dedicada; el repositorio completo ocupa 0,1 GB.
- Opciones de despliegue: Transformers (safetensors), llama.cpp y llama.app (GGUF, con `llama cli` y `llama serve`), text-generation-inference segun los tags del repositorio, y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PicoGPT1-Daisy | 6,86 M | 256 | GPT-2 minimo con anclaje RAG y abstruccion | no disponible | Hugging Face (safetensors + GGUF) |
| PicoGPT1-Jasmine | 6,86 M | 256 | GPT-2 minimo, entrenamiento Alpaca sin filtrar, sin anclaje | no disponible | Hugging Face (referencia historica) |
| GPT-2 small | 124 M | 1.024 | Transformer decoder-only de proposito general | MIT | Hugging Face |
| DistilGPT-2 | 82 M | 1.024 | Destilacion de GPT-2 | Apache 2.0 | Hugging Face |

La comparativa con GPT-2 small y DistilGPT-2 es orientativa por tamano de la familia; no se dispone de datos de rendimiento comparables entre ellos y PicoGPT1-Daisy en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de muy pequena escala: el propio autor advierte que las respuestas pueden ser incoherentes fuera del pipeline de anclaje.
- Ventana de contexto de solo 256 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- El anclaje solo funciona mediante los scripts Python; el GGUF no contiene la base de hechos ni el TF-IDF, por lo que en llama.cpp o llama.app se pierde la funcionalidad anti-alucinacion.
- La base de conocimiento es cerrada y consta de solo 30 hechos; cualquier pregunta fuera de ella deriva en abstruccion, no en respuesta.
- Solo 9 de 30 respuestas dentro de base son exactas: el retrieval acierta siempre, pero la seleccion del extracto no siempre es la mejor.
- Idiomas soportados no documentados; el entrenamiento es mayoritariamente en ingles y las respuestas de anclaje en frances, lo que limita su uso en castellano.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de sesgos heredados de Alpaca y del corpus GPT-2 original, no evaluado por el autor.
- Sin soporte de tool calling, agentes, vision ni audio; no apto para tareas que requieran razonamiento complejo o conocimiento factual abierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nazimboudeffa/PicoGPT1-Daisy
- Version anterior (referencia historica): https://huggingface.co/nazimboudeffa/PicoGPT1-Jasmine
- Codigo fuente y documentacion: https://github.com/nazimboudeffa/picogpt1-daisy
- llama.app: https://llama.app
