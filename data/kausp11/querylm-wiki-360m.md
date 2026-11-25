# Kausp11/querylm-wiki-360m

## Resumen

QueryLM 360M (Wikipedia) es un modelo de lenguaje base de 361,8 millones de parametros entrenado desde cero por el autor independiente Kausp11 sobre texto de Wikipedia en ingles. Su particularidad es que durante el preentrenamiento se insertaron bloques de busqueda en el propio texto: en los puntos donde una consulta externa ayudaria a predecir lo siguiente, el corpus contiene una consulta de busqueda seguida de un pasaje recuperado. El modelo aprende asi a formular consultas y a utilizar los pasajes insertados, aunque nunca genera los pasajes por si mismo.

La arquitectura sigue la configuracion de SmolLM2-360M (32 capas, anchura 960, 15 cabezas de atencion) y se carga con `transformers` estandar como `LlamaForCausalLM`, sin codigo personalizado. El contexto es de 4.096 tokens y el vocabulario es el del tokenizador de SmolLM2 ampliado con cuatro tokens especiales para delimitar consultas y respuestas de busqueda, hasta un total de 49.156 entradas.

El interes del modelo es metodologico: demuestra a pequena escala un paradigma de preentrenamiento con busqueda integrada ("search-augmented pretraining") en el que el modelo aprende a decidir cuando consultar y a condicionar su generacion al resultado recuperado. Se distribuye bajo licencia Apache 2.0 y esta pensado como base para experimentacion, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (configuracion SmolLM2-360M: 32 capas, anchura 960, 15 cabezas) |
| Parametros totales | 361.824.960 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de la model card usa bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,7 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la configuracion de SmolLM2-360M, entrenado desde cero (sin inicializacion desde otro checkpoint) con el script causal-LM del `Trainer` de Hugging Face. El tokenizador es el de SmolLM2 mas cuatro tokens especiales: `<WEB_QUERY>` (id 49152), `</WEB_QUERY>` (49153), `<WEB_RESPONSE>` (49154) y `</WEB_RESPONSE>` (49155). El texto de entrenamiento tiene la forma `...texto<WEB_QUERY>consulta</WEB_QUERY> <WEB_RESPONSE>pasaje</WEB_RESPONSE> texto continua...`; la funcion de perdida cubre el texto, la consulta y las etiquetas de consulta, pero no las etiquetas de respuesta ni el pasaje, de modo que el modelo aprende a escribir consultas y a usar pasajes, no a generarlos.

Los datos de preentrenamiento son 4.885.877 articulos de Wikipedia en ingles (con 54.582 adicionales reservados para evaluacion). Los bloques de busqueda se anotaron con un modelo anotador afinado (Gemma 4 E4B-it con un adaptador LoRA) que marca posiciones donde una busqueda ayudaria (probabilidad de insercion de al menos 0,05, separacion minima de 40 caracteres) y redacta una consulta de como maximo 24 tokens. Los pasajes provienen de recuperacion BM25 sobre el corpus web publico Sphere y se acortan mediante limpieza extractiva; una insercion solo se conserva si el pasaje solapa con el texto posterior del documento (ROUGE-1 F1 de al menos 0,1 frente a los siguientes 260 caracteres).

El entrenamiento uso AdamW con LR pico de 5e-4 y weight decay de 0,1, lotes de 256 secuencias de 4.096 tokens (1.048.576 tokens por actualizacion), calentamiento del 2 por ciento y decaimiento coseno hasta cero durante 4 epocas. El presupuesto total fue de 31.860 actualizaciones, 33,4 mil millones de tokens procesados (de los cuales 16,0 mil millones son tokens de documento) y 6,31e19 FLOPs en bf16. El checkpoint publicado corresponde al paso 31.860 (final de la epoca 4) del run `search_360M_v2_e4`.

## Capacidades

- Generacion de texto causal en ingles como cualquier modelo de lenguaje base, sin necesidad de busqueda.
- Formulacion de consultas de busqueda: el modelo escribe la consulta entre `<WEB_QUERY>` y `</WEB_QUERY>` cuando se le abre el bloque.
- Uso de pasajes recuperados: condiciona la continuacion al contenido insertado entre `<WEB_RESPONSE>` y `</WEB_RESPONSE>`.
- Aprendizaje en contexto mediante ejemplos few-shot con bloques de busqueda para fijar el formato pregunta-respuesta.
- Decodificacion determinista en el ejemplo oficial (`do_sample=False`), con posibilidad de desactivar la busqueda mediante `bad_words_ids` sobre el token de apertura de consulta.
- No soporta tool calling generico, agentes multi-paso ni modos de razonamiento extendido (`thinking mode`) de forma nativa; la unica "herramienta" integrada es el bloque de busqueda.
- No dispone de capacidades de vision, audio ni multimodalidad.
- Multilingue: no, solo ingles.

## Casos de uso

- Experimentacion academica sobre recuperacion aumentada: el modelo permite estudiar a escala reducida como un LM aprende a decidir cuando consultar y como integra el pasaje recuperado en su generacion, con un pipeline reproducible de tres pasos (consulta, recuperacion, continuacion).
- Respuesta a preguntas sobre un corpus propio: conectando el bloque de consulta a un indice BM25 o a una API de busqueda, el modelo formula la consulta y redacta la respuesta condicionada al pasaje; es adecuado para prototipos de RAG con presupuesto de computo minimo (0,7 GB de pesos).
- Investigacion sobre destilacion de comportamiento de busqueda: al estar entrenado con anotaciones de un modelo mayor (Gemma 4 E4B-it con LoRA), sirve para analizar como se transfiere la politica de insercion de consultas a un modelo de 360M.
- Educacion y demos: su tamano permite ejecutarlo en CPU en bfloat16 (el propio autor incluye una ejecucion en CPU en la model card), lo que facilita talleres y demostraciones de RAG sin GPU.
- Generacion de texto asistida por hechos: en tareas donde la precision factica importa, el flujo de consulta-recuperacion-respuesta permite anclar la continuacion en un pasaje externo en lugar de depender solo de la memoria parametrica del modelo.
- Baseline para comparativas de preentrenamiento: el autor menciona un baseline "Standard" con la misma arquitectura y computo pero sin bloques de busqueda, util para medir el efecto del paradigma de busqueda integrada en tareas controladas.
- Prototipado de asistentes de documentacion tecnica: con un indice interno de manuales, el modelo puede generar consultas acotadas (maximo 24 tokens) y responder con el fragmento recuperado, aunque la calidad final dependera del recuperador y del formato few-shot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion se anadiran mas adelante ("Evaluation results will be added later"). El unico dato de rendimiento publicado es el ejemplo de ejecucion en CPU con bfloat16, torch 2.8.0 y transformers 4.56.0, cuyo resultado ilustra la mecanica del flujo y no la precision del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en bfloat16 (361,8M parametros x 2 bytes) mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria los 0,4 GB y en 4 bits los 0,2 GB, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060 de 12 GB o superior deja margen amplio. En entornos profesionales, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2-4 GB de VRAM, e incluso en CPU (el autor documenta una ejecucion en CPU en bfloat16).
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (soporte nativo, sin codigo personalizado); la model card menciona compatibilidad con text-generation-inference y endpoints. No se documenta soporte especifico de llama.cpp, Ollama o vLLM, aunque al ser un `LlamaForCausalLM` estandar deberia poder convertirse a GGUF con las herramientas habituales (no verificado en la informacion disponible).
- Latencia y throughput: no disponibles. El unico dato es que el ejemplo oficial se ejecuto en CPU, lo que sugiere viabilidad sin acelerador, pero sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| QueryLM 360M (Wikipedia) | 361,8M | 4.096 | en | Apache 2.0 | Preentrenado con bloques de busqueda insertados; base, sin formato chat |
| SmolLM2-360M | 360M (aprox.) | 8.192 (segun su model card publica) | en (principalmente) | Apache 2.0 | Arquitectura de referencia del mismo tamano; contexto mayor y modelo ampliamente evaluado |
| Qwen2.5-0.5B | 494M (aprox.) | 32.768 (segun su model card publica) | multilingue | Apache 2.0 | Alternativa de tamano cercano con contexto mucho mayor y soporte multilingue |

La comparacion con SmolLM2-360M es la mas directa porque QueryLM reutiliza su configuracion y su tokenizador; la diferencia principal es el paradigma de entrenamiento con busqueda y un contexto menor (4.096 frente a 8.192 tokens). Qwen2.5-0.5B ofrece mas contexto y multilingueismo a cambio de un tamano algo mayor. No hay datos de benchmarks publicados para QueryLM, por lo que no es posible comparar rendimiento empirico.

## Limitaciones y advertencias

- Es un modelo base sin ajuste conversacional: no sigue instrucciones de forma fiable ni mantiene un formato de chat; requiere ejemplos few-shot para fijar el formato pregunta-respuesta.
- Solo ingles: no se ha entrenado con otros idiomas y su rendimiento fuera del ingles sera deficiente.
- Contexto limitado a 4.096 tokens, inferior al de alternativas contemporaneas de tamano similar.
- Riesgo de alucinacion: aunque el flujo de busqueda ancla la respuesta en un pasaje, el modelo puede ignorar el pasaje o combinarlo incorrectamente; el ejemplo oficial muestra una respuesta truncada ("The capital of Australia") que ilustra la mecanica, no la calidad.
- Dependencia del recuperador externo: la calidad final depende del indice BM25 o API de busqueda que conecte el usuario, y el modelo no genera los pasajes.
- El unico dato de evaluacion disponible es el ejemplo de la model card; no hay benchmarks publicados, por lo que no se puede estimar su calidad frente a alternativas.
- Sesgos: al entrenarse exclusivamente con Wikipedia en ingles, hereda los sesgos de cobertura y perspectiva de esa fuente; no se documentan analisis de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base sin evaluacion publicada, no es recomendable para produccion sin una validacion propia exhaustiva.
- El autor menciona un baseline "Standard" con el mismo computo que aun no esta publicado, por lo que no se puede medir el beneficio del paradigma de busqueda frente a un entrenamiento convencional.
- El checkpoint tiene un unico hash SHA-256 publicado (`8d5750a5...`), lo que permite verificar integridad, pero no hay garantias de mantenimiento o soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/querylm-wiki-360m
- Version con ajuste fino conversacional: https://huggingface.co/Kausp11/querylm-wiki-360m-sft-search
- Checkpoints alternativos (mismos pesos, subcarpeta `search/ep4`): https://huggingface.co/Kausp11/wiki6m-360m-v2-ckpts
- Corpus web Sphere (recuperacion BM25): https://github.com/facebookresearch/Sphere
- Paper referenciado en los tags (`arxiv:2611.26809`): https://arxiv.org/abs/2611.26809
