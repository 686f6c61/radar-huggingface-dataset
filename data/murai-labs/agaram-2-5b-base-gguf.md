# murai-labs/agaram-2.5b-base-gguf

## Resumen

Agaram 2.5B (அகரம்) es un modelo de lenguaje de 2.525.757.696 parametros entrenado desde cero por Murai Labs y Ramchand Kumaresan, especializado en tamil y en tanglish (tamil escrito con caracteres latinos), con soporte adicional de ingles. No es un fine-tune de ningun otro modelo, lo que lo convierte en uno de los pocos modelos bilingues tamil-ingles con entrenamiento nativo y pesos abiertos. Esta ficha cubre la variante GGUF del modelo base, publicada para su uso con llama.cpp y herramientas derivadas.

La arquitectura subyacente es un transformer denso de 2.500 millones de parametros con una ventana de contexto de 8.192 tokens y un tokenizador BPE a nivel de byte disenado especificamente para mantener unidas las vocales tamil (signos diacriticos) a sus consonantes. El repositorio incluye tres cuantizaciones (F16, Q8_0 y Q4_K_M) generadas con llama.cpp b11574.

Es relevante ahora porque cubre un hueco poco atendido: la mayoria de los modelos multilingues abiertos tratan el tamil como un idioma de cola con pocos tokens de entrenamiento, mientras que Agaram lo situa como idioma principal. Al ser un modelo base, no sigue instrucciones ni mantiene conversacion; para chat existe una variante instruct publicada por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), tokenizador BPE a nivel de byte con pre-tokenizador tipo Qwen2 modificado |
| Parametros totales | 2.525.757.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | F16 (5,06 GB), Q8_0 (2,69 GB), Q4_K_M (1,56 GB) |
| Idiomas soportados | tamil (ta), ingles (en); tanglish como registro mixto |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales en safetensors en el modelo base |
| Token de fin de secuencia | `<|endoftext|>` (id 0) |
| Version de llama.cpp requerida | b11574 o superior (soporte del pre-tokenizador `qwen35`) |

## Arquitectura y entrenamiento

Agaram 2.5B es un transformer decoder-only denso de aproximadamente 2.500 millones de parametros, entrenado desde cero (no derivado de ningun modelo existente) sobre datos bilingues tamil-ingles. La innovacion tecnica mas destacable esta en el tokenizador: un BPE a nivel de byte cuyo patron de pre-tokenizacion parte del split de Qwen2 pero anade las marcas combinantes Unicode y los zero-width joiners (U+200C, U+200D) a la clase de letras, de modo que los signos vocalicos tamil permanecen adjuntos a su consonante en lugar de fragmentarse en tokens separados. Esto reduce la longitud efectiva de las secuencias en tamil y preserva la integridad morfologica del texto.

llama.cpp no dispone de una entrada para ese patron exacto, por lo que los ficheros GGUF se publican con el pre-tokenizador `qwen35`, identico salvo que omite los zero-width joiners. El autor verifico la tokenizacion comparando los ids de llama.cpp con el tokenizador de Hugging Face sobre 961 textos (661 correspondientes a prompts y respuestas de referencia de tres conjuntos de evaluacion de chat en escritura tamil, tanglish e ingles, mas 300 conversaciones de entrenamiento reservadas renderizadas con la plantilla de chat), con coincidencia exacta en todos ellos. El caso con zero-width joiner queda sin probar. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; al tratarse de un modelo base, es previsible que no haya alineamiento por preferencias, pero este punto no se confirma en la documentacion consultada.

## Capacidades

- Continuacion de texto en tamil, tanglish e ingles: es un modelo base, por lo que su tarea nativa es predecir la continuacion de un prompt, no responder instrucciones.
- Modelado de lenguaje bilingue con integridad morfologica en tamil gracias al tokenizador adaptado.
- Generacion en registro tanglish (tamil transliterado a caracteres latinos), un caso de uso poco cubierto por modelos generalistas.
- Soporte de plantilla de chat a nivel de tokenizador (verificada en 300 conversaciones), aunque el modelo base en si no esta alineado para conversar.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito; no se mencionan en la informacion disponible.
- Capacidades multilingues limitadas a tamil e ingles; no se documentan otros idiomas.

## Casos de uso

- Fine-tuning supervisado para tamil: el modelo base sirve como punto de partida para entrenar clasificadores, resumidores o modelos instruct en tamil con un coste computacional bajo gracias a sus 2.500 millones de parametros.
- Generacion aumentada de datos sinteticos en tamil y tanglish: util para ampliar corpus de entrenamiento o de evaluacion en dominios con poca disponibilidad de texto nativo.
- Modelado de lenguaje para investigacion linguistica: permite estudiar el efecto de un tokenizador consciente de las marcas combinantes tamil en la perplejidad y en la calidad de la generacion.
- Completado de texto en aplicaciones de escritura: integrado via llama.cpp u Ollama, puede sugerir continuaciones en tamil dentro de editores o teclados predictivos.
- Preentrenamiento continuado con dominio especifico: al ser Apache-2.0 y entrenado desde cero, es viable continuar su preentrenamiento sobre corpus legales, medicos o literarios en tamil sin restricciones derivadas de una licencia de modelo upstream.
- Despliegue en hardware de consumo: la cuantizacion Q4_K_M (1,56 GB) permite ejecutar el modelo en CPU o en GPU de gama media para tareas de generacion por lotes o experimentacion.
- Base para evaluaciones comparativas de tokenizadores: util como referencia en estudios sobre fertilidad de tokenizadores en lenguas dravidicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe tecnico (arXiv:2610.18420) y a la model card del modelo base para los datos de evaluacion, pero no incluye cifras de MMLU, HumanEval, GSM8K ni otras pruebas en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,1 GB en F16, 2,7 GB en Q8_0 y 1,6 GB en Q4_K_M, mas el overhead de la cache KV para hasta 8.192 tokens de contexto.
- GPU recomendadas: cualquier GPU con 6-8 GB o mas de VRAM para F16 (RTX 3060, RTX 4060, RTX 4090, A100, H100); para Q4_K_M basta con 2-3 GB, por lo que cabe en GPUs de gama de entrada y en iGPU con memoria unificada.
- Cabe en GPU de consumo: si, en todas las cuantizaciones publicadas; Q4_K_M es la opcion mas adecuada para equipos con 4 GB de VRAM o para inferencia en CPU.
- Opciones de despliegue: llama.cpp (obligatorio b11574 o superior por el pre-tokenizador `qwen35`), `llama-completion`, Ollama (`ollama run hf.co/murai-labs/agaram-2.5b-gguf:Q8_0` para la variante instruct), y cualquier herramienta construida sobre llama.cpp que incluya esa version. vLLM y TGI no se mencionan en la informacion disponible para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Agaram 2.5B (este) | 2,53 B | 8.192 | ta, en | Apache-2.0 | GGUF, safetensors |
| Modelos multilingues generalistas de ~2-3 B | no disponible | no disponible | decenas de idiomas, tamil como idioma de cola | variable | variable |
| Modelos especializados en tamil de tamano similar | no disponible | no disponible | ta, en | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables, por lo que no es posible establecer una comparacion cuantitativa fiable. La diferencia cualitativa principal de Agaram frente a modelos generalistas del mismo tamano es el entrenamiento nativo en tamil y un tokenizador disenado para preservar la morfologia de esa lengua.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene conversacion. Para chat hay que usar la variante `murai-labs/agaram-2.5b-gguf`.
- Riesgo de alucinacion y de continuaciones incoherentes propio de un modelo base sin alineamiento por preferencias.
- Contexto limitado a 8.192 tokens, inferior al de muchos modelos actuales de tamano similar.
- Cobertura linguistica restringida a tamil e ingles; el rendimiento en otros idiomas no esta documentado y previsiblemente sera deficiente.
- Dependencia estricta de la version de llama.cpp: builds anteriores a b11574 rechazaran los ficheros o tokenizaran de forma distinta; las aplicaciones que empaqueten versiones antiguas no son compatibles.
- El caso de tokenizacion con zero-width joiner (U+200C, U+200D) no fue probado; puede haber discrepancias con el tokenizador de Hugging Face en textos que los contengan.
- Solo se verifico la tokenizacion del fichero F16; los ficheros Q8_0 y Q4_K_M no se probaron por separado.
- Licencia Apache-2.0 permite uso comercial, pero la model card advierte de que los terminos de los datos upstream se detallan en la model card del modelo base y deben revisarse antes de un despliegue en produccion.
- No se documentan sesgos especificos, pero al entrenarse sobre corpus web bilingues es esperable un sesgo de dominio y de registro no cuantificado en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/murai-labs/agaram-2.5b-base-gguf
- Modelo base: https://huggingface.co/murai-labs/agaram-2.5b
- Variante instruct GGUF: https://huggingface.co/murai-labs/agaram-2.5b-gguf
- Codigo: https://github.com/Murai-Labs/Agaram2.5b
- Informe tecnico: https://arxiv.org/abs/2610.18420
- Demo de chat: https://huggingface.co/spaces/mechramc/agaram-2.5b-chat
