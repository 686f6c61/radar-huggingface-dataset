# laion/Alexandria-Gemma-4-12B-it-Qwen27-Knowledge-Units-LoRA-r128

## Resumen

Alexandria-Gemma-4-12B-it-Qwen27-Knowledge-Units-LoRA-r128 es un adaptador LoRA de rango 128 desarrollado por LAION dentro del Project Alexandria. No es un modelo completo: se carga sobre google/gemma-4-12B-it (revisión `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`) y anade matrices de adaptador entrenadas para una tarea muy concreta, la generacion de "Knowledge Units" (KU) a partir de articulos cientificos. Una KU es una representacion estructurada de entidades, atributos y relaciones de un paper (por ejemplo, intervencion, dosis, efecto medido, poblacion y incertidumbre como campos separados) que pretende preservar el contenido factual reduciendo la reproduccion literal de la prosa original.

El problema que aborda es el de la reutilizacion del conocimiento cientifico sin cargar con la reproduccion del texto fuente. La motivacion se describe en el paper "Project Alexandria: Towards Freeing Scientific Knowledge from Copyright Burdens via LLMs" (arXiv:2502.19413v2), que propone representaciones agnosticas de estilo y preservadoras de conocimiento, y analiza su reutilizacion por parte de agentes. Este adaptador concreto aprende la tarea de extraccion mediante destilacion desde un profesor mayor, Qwen/Qwen3.8-27B-FP8, con el objetivo de abaratar la generacion de estas representaciones frente al uso del profesor.

Los numeros clave de entrenamiento son pequenos: 391 ejemplos procedentes de 97 papers, una epoca y 49 actualizaciones del optimizador. La evaluacion se hizo sobre 20 papers distintos (200 preguntas de opcion multiple congeladas antes de generar el contexto), aplicando el mismo adaptador sin reentrenamiento a extracciones de 500 y 1.000 palabras. Este caracter de adaptador especializado, con licencia cc-by-4.0 y solo ingles, lo hace relevante para pipelines de extraccion y recuperacion de literatura cientifica, no como modelo conversacional de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre un transformer decoder-only: google/gemma-4-12B-it. Rango 128, alpha 256, dropout 0.05; aplicado a proyecciones q/k/v/o de atencion y gate/up/down del MLP |
| Parametros totales | 12 B en el modelo base (segun su denominacion); el repositorio contiene solo las matrices del adaptador. Recuento exacto de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio contiene pesos de adaptador en safetensors (base entrenada en BF16); no se publican variantes cuantizadas del adaptador |
| Idiomas soportados | Ingles (`en`) declarado en la model card |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (libreria `peft`); tamano del repositorio 2,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 4 12B IT, un transformer decoder-only, mediante LoRA de rango 128 y alpha 256 con dropout 0.05. Las matrices se insertan en las proyecciones q, k, v y o de las capas de atencion y en las proyecciones gate, up y down del MLP. El entrenamiento uso AdamW con learning rate 2e-5, weight decay 0.01, un 5% de warmup seguido de decaimiento coseno, base en BF16, gradient checkpointing, flex attention y "assistant-token-weighted cut cross entropy". El lote efectivo fue de ocho ejemplos, los tokens de fuente y de prompt se enmascararon de la perdida y no hubo truncado ni de fuente ni de destino. En total: 391 ejemplos procedentes de 97 papers, una epoca y 49 actualizaciones del optimizador.

La generacion de los datos de entrenamiento la realizo el profesor Qwen/Qwen3.8-27B-FP8 procesando los 97 papers de forma secuencial, con un maximo de 1.000 palabras de fuente por llamada y condicionando el nombrado en las diez KU anteriores. El modo de razonamiento del profesor estaba desactivado, por lo que los objetivos no contienen supervision de razonamiento. La tarea es exclusivamente de generacion de KU: no se entreno ningun adaptador de revision de calidad ni de correccion. El paper asociado plantea la hipotesis de que estas representaciones reducen la dependencia del texto original, pero la propia model card advierte de que las auditorias de copia literal siguen encontrando solapamiento sustancial.

## Capacidades

- Generacion de Knowledge Units: produce representaciones estructuradas de entidades, atributos y relaciones a partir de texto cientifico, con extraccion realizada en fragmentos de 500 o 1.000 palabras.
- Generacion de resumenes cientificos: la model card menciona que un resumen cientifico ofrece una exposicion organizada de un paper, ademas de las KU.
- Extraccion de hechos para recuperacion: las KU estan pensadas para ser recuperadas por un agente que responde preguntas a partir de sus hechos y sigue un identificador de fuente para verificar.
- Reduccion de la reproduccion de prosa: el objetivo tecnico declarado es preservar informacion cientifica reduciendo la reproduccion de la expresion de la fuente (sin certificar ausencia de derechos).
- Destilacion de un profesor mayor: el adaptador imita las salidas de Qwen3.8-27B-FP8 con un modelo de 12 B, abaratando la generacion de estas representaciones.
- Generacion de texto conversacional: heredada del modelo base Gemma 4 12B IT, aunque el adaptador esta especializado en extraccion.
- Tool calling, function calling, uso de agentes y razonamiento multi-paso: no disponible (no se documentan en la informacion proporcionada).
- Capacidades multilingues: no disponibles; la model card solo declara ingles.
- Modo de razonamiento (thinking): no soportado por este adaptador; los datos de entrenamiento se generaron con el modo de razonamiento del profesor desactivado y no contienen supervision de razonamiento.
- Vision o audio: no disponible.
- No incorpora base de datos de conocimiento cientifico: los adaptadores aprenden la tarea de extraccion, no almacenan conocimiento.

## Casos de uso

- Extraccion de conocimiento en pipelines de revision de literatura: procesar papers en fragmentos de 500 o 1.000 palabras y obtener KU estructuradas que alimenten un indice interno, reduciendo el volumen de prosa almacenada y facilitando el filtrado por entidades y relaciones.
- Recuperacion aumentada (RAG) sobre corpus cientifico: indexar KU en lugar de (o ademas de) los textos completos, de modo que el agente recupere hechos concretos y pueda seguir el identificador de fuente para verificar en el documento original.
- Respuesta a preguntas cientificas con contexto comprimido: usar las KU como contexto en un modelo respondedor mas pequeno; en la evaluacion del autor, un Qwen2.5-7B-Instruct con KU generadas por este adaptador alcanza un 88,50% de acierto en 200 preguntas de opcion multiple, frente al 91,00% con los papers originales completos.
- Construccion de datasets cientificos estructurados: generar representaciones homogeneas de un gran numero de papers para tareas posteriores de analisis, agregacion o entrenamiento, sustituyendo el uso del profesor de 27 B por un modelo de 12 B con adaptador.
- Distilacion y reduccion de coste de inferencia: cuando el profesor Qwen27 es demasiado caro de servir de forma masiva, este adaptador reproduce la tarea de extraccion sobre una base de 12 B, con una perdida medida de unos tres puntos de exactitud en la configuracion de 1.000 palabras.
- Sistemas de agentes con verificacion de fuentes: el agente recupera KU, responde a partir de los hechos y conserva el identificador de la fuente para trazabilidad, lo que encaja en flujos de auditoria documental interna.
- Procesamiento por lotes de colecciones de preprints: aplicar el adaptador sin reentrenamiento a distintos tamanos de fragmento permite adaptar el pipeline a restricciones de contexto o de coste por documento.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en el model-index y en la model card; estan marcados como no verificados (`verified: false`). La evaluacion usa un respondedor fijo Qwen2.5-7B-Instruct que recibe la representacion generada y responde preguntas de cuatro opciones. Cada paper aporta diez preguntas; las generaciones fallidas de un paper cuentan como diez respuestas incorrectas y las respuestas invalidas permanecen en el denominador. Los intervalos se calculan con 10.000 remuestreos bootstrap pareados por paper.

Tabla completa del seguimiento pareado de 20 papers / 200 preguntas:

| Contexto | Aciertos / 200 | Exactitud QA | Intervalo 95% | Respuestas invalidas |
|---|---:|---:|---|---:|
| Sin contexto de fuente | 89 | 44,50% | 40,50-49,00% | 5 |
| Papers originales completos | 182 | 91,00% | 87,50-94,50% | 0 |
| Profesor Qwen27, KU de 1.000 palabras | 176 | 88,00% | 85,00-91,50% | 0 |
| Profesor Qwen27, KU de 500 palabras | 179 | 89,50% | 87,00-92,00% | 0 |
| Gemma12 sin entrenar, KU de 1.000 palabras | 127 | 63,50% | 54,00-71,50% | 10 |
| Gemma12 sin entrenar, KU de 500 palabras | 150 | 75,00% | 64,50-84,00% | 10 |
| Este adaptador, KU de 1.000 palabras | 170 | 85,00% | 80,50-89,00% | 0 |
| Este adaptador, KU de 500 palabras | 177 | 88,50% | 84,00-92,00% | 0 |

Resumen de las metricas principales declaradas:

| Metrica | Valor |
|---|---|
| Fixed Qwen2.5 QA accuracy, extraccion de 500 palabras (200 preguntas) | 88,5% |
| Fixed Qwen2.5 QA accuracy, extraccion de 1.000 palabras (200 preguntas) | 85,0% |

La diferencia de 3,5 puntos a favor de los fragmentos de 500 palabras tiene un intervalo pareado del 95% de -1,0 a +8,0 puntos, por lo que la cohorte no establece una ventaja fiable de ese tamano de extraccion. No se han publicado en la informacion disponible resultados de benchmarks generales tipo MMLU, HumanEval o GSM8K para este adaptador.

## Requisitos de hardware

- VRAM para inferencia (estimacion a partir de una base de 12 B; no son cifras publicadas por el autor): aproximadamente 24-26 GB en BF16 con el adaptador y cache KV moderada; 13-15 GB en INT8; 8-10 GB en cuantizacion de 4 bits.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S, RTX 6000 Ada. Para cuantizacion de 4 bits puede funcionar en GPUs de consumo.
- GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente en BF16 para lotes pequenos con contexto corto; en 4 bits cabe tambien en GPUs de 8-12 GB, siempre que se gestione con cuidado la cache KV.
- Formatos de despliegue: PEFT sobre transformers para cargar el adaptador; vLLM soporta adaptadores LoRA sobre el modelo base, lo que permite servir el adaptador junto con la base. No se publican pesos GGUF del adaptador, por lo que llama.cpp u Ollama requeririan una conversion propia.
- Requisitos de entrenamiento o ajuste: el entrenamiento uso BF16, gradient checkpointing, flex attention y lote efectivo de ocho con masking de tokens de fuente, sobre 391 ejemplos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Papel en la evaluacion | QA (500 palabras) | QA (1.000 palabras) | Licencia |
|---|---|---|---|---|---|---|
| Este adaptador (Alexandria-Gemma-12B KU LoRA r128) | LoRA sobre Gemma 4 12B IT | 12 B base | Generador destilado | 88,50% | 85,00% | cc-by-4.0 |
| Qwen3.8-27B-FP8 (profesor) | Modelo completo FP8 | 27 B | Profesor / referencia superior | 89,50% | 88,00% | no disponible |
| Gemma 4 12B IT sin adaptador | Modelo completo | 12 B | Base sin entrenar para la tarea | 75,00% | 63,50% | no disponible |
| Papers originales completos | Texto fuente | no aplica | Techo de referencia | 91,00% (mismo valor para ambos tamanos) | 91,00% | depende del paper |
| Sin contexto de fuente | no aplica | no aplica | Suelo de referencia | 44,50% (mismo valor para ambos tamanos) | 44,50% | no aplica |

La comparativa se limita a los modelos que aparecen en la evaluacion del autor. No se dispone de datos frente a otros adaptadores de extraccion cientifica con los que contrastar.

## Limitaciones y advertencias

- El adaptador es un generador de KU; no incluye ningun modulo de revision de calidad ni de correccion, por lo que los errores de extraccion no se filtran.
- No certifica que sus salidas esten libres de derechos de autor. Las auditorias de copia literal del proyecto siguen encontrando solapamiento sustancial con las fuentes; el acceso a la fuente, sus terminos, la atribucion y la revision de las salidas siguen siendo responsabilidad de quien lo usa.
- La exactitud de QA mide utilidad para responder preguntas; no acredita limpieza legal ni correccion factual completa.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; dado que la tarea es extraer hechos de papers, existe riesgo de introducir entidades, cifras o relaciones no presentes en la fuente.
- Cobertura de idioma limitada al ingles segun la model card.
- Longitud de contexto: no disponible.
- Los datos de entrenamiento no contienen supervision de razonamiento (el modo thinking del profesor estaba desactivado), por lo que el adaptador no esta entrenado para justificar sus extracciones.
- Base de entrenamiento pequena (391 ejemplos de 97 papers) y evaluacion sobre solo 20 papers y 200 preguntas, con intervalos de confianza amplios; los 97 papers de entrenamiento no constituyen un conjunto de test del adaptador.
- La diferencia entre 500 y 1.000 palabras no es estadisticamente concluyente (intervalo pareado de -1,0 a +8,0 puntos).
- Las metricas del model-index estan marcadas como no verificadas.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero conviene revisar las condiciones del modelo base google/gemma-4-12B-it, que se aplican de forma independiente.
- El adaptador se publica con una revision de base fijada; cargarlo sobre una revision distinta puede degradar los resultados.
- Uso en produccion: requiere revisar las salidas, ya que una generacion fallida invalida un paper completo (diez preguntas) en la evaluacion del autor.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/laion/Alexandria-Gemma-4-12B-it-Qwen27-Knowledge-Units-LoRA-r128
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Paper: Project Alexandria: Towards Freeing Scientific Knowledge from Copyright Burdens via LLMs, https://arxiv.org/abs/2502.19413v2
- Configuracion de entrenamiento: `training_config.json` (en el repositorio del modelo)
- Manifiesto de datos nativo: `training/manifest.json` (en el repositorio del modelo)
- Procedencia de pesos y codigo: `provenance.json` (en el repositorio del modelo)
