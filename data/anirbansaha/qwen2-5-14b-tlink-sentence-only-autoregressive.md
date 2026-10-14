# AnirbanSaha/qwen2.5-14b-tlink-sentence-only-autoregressive

## Resumen
`AnirbanSaha/qwen2.5-14b-tlink-sentence-only-autoregressive` es un ajuste fino de parametros completos (full-parameter fine-tuning) del modelo `Qwen/Qwen2.5-14B-Instruct` orientado a una unica tarea: la clasificacion de relaciones temporales TLINK a nivel de frase. El modelo recibe un par de eventos o entidades temporales dentro de una misma oracion y debe emitir de forma autoregresiva una de cuatro etiquetas: BEFORE, AFTER, OTHER o NONE. Lo publica el usuario AnirbanSaha como un artefacto de investigacion, con licencia Apache 2.0 y pesos en safetensors listos para `transformers`.

El modelo conserva la arquitectura densa de Qwen2.5-14B (transformer decoder-only con Grouped-Query Attention), con 14.770.033.664 parametros y un repositorio de 29,6 GB en precision completa. Al tratarse de un fine-tuning sobre la totalidad de los pesos y no de un adaptador LoRA, el resultado es un checkpoint independiente y autocontenido, pero tambien con riesgo de degradacion de las capacidades generales del modelo base.

Su relevancia es acotada y muy especifica: sirve como referencia reproducible para tareas de extraccion de orden temporal en textos (TimeML, TempEval, MATRES y similares) usando un LLM generativo en lugar de un clasificador discriminativo tipo BERT. Con 0 descargas y 0 "likes" en el momento de la consulta, se trata de un modelo sin validacion externa por parte de la comunidad, y su uso en produccion deberia ir precedido de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5), con Grouped-Query Attention y RoPE, heredada del modelo base |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible para el ajuste especifico; el modelo base Qwen2.5-14B-Instruct soporta 32.768 tokens nativos y 131.072 con configuracion YaRN |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en safetensors (bf16); no hay versiones GGUF, AWQ, GPTQ ni FP8 publicadas |
| Idiomas soportados | No disponible para el ajuste. El modelo base Qwen2.5 declara soporte para 29 idiomas; el dataset de ajuste es propio y su composicion linguistica no se detalla |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`, compatible con Text Generation Inference) |

## Arquitectura y entrenamiento
La arquitectura es la del modelo base Qwen2.5-14B-Instruct: un transformer decoder-only denso con atencion de consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU, embeddings posicionales rotatorios (RoPE) y sesgo de atencion desactivado en las proyecciones QKV. El proceso de ajuste es de parametros completos, no de adaptadores de bajo rango, por lo que se actualizan todas las matrices del modelo. La generacion es autoregresiva y produce directamente la etiqueta como texto, lo que permite un post-procesado trivial y un control estricto del conjunto de salidas validas.

El entrenamiento se ha realizado sobre el dataset `AnirbanSaha/tlink-classification-sentence-only`, un corpus de clasificacion de relaciones temporales restringido a pares de eventos dentro de la misma frase. El autor no publica el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de dominios ni si se aplicaron tecnicas de alineacion adicionales (RLHF, DPO) mas alla del propio ajuste supervisado. Tampoco se documentan hiperparametros, numero de epocas ni estrategia de enmascarado de la funcion de perdida; todo ello queda marcado como no disponible.

## Capacidades
- Clasificacion de relaciones temporales TLINK en cuatro clases cerradas: BEFORE, AFTER, OTHER y NONE.
- Generacion autoregresiva de la etiqueta, lo que permite validar la salida contra un conjunto finito de tokens validos.
- Procesamiento a nivel de frase: el modelo esta especializado en pares de eventos co-ocurrentes en la misma oracion, no en relaciones entre oraciones o documentos.
- Capacidades residuales del modelo base (conversacion, codigo, matematicas, instrucciones generales): no verificadas tras el fine-tuning de parametros completos, por lo que deben tratarse como potencialmente degradadas.
- Tool calling y function calling: no disponible en la informacion proporcionada; era una capacidad del modelo base, pero no hay evidencia de que se conserve.
- Modo "thinking" o razonamiento explicito: no disponible.
- Vision o audio: no soportados (el modelo base es exclusivamente de texto).
- Capacidades multilingues: no disponibles para este checkpoint; dependen del dataset de ajuste, cuya composicion linguistica no se publica.

## Casos de uso
- Anotacion automatica de corpus temporales: el modelo puede etiquetar pares de eventos en corpus tipo TimeML o MATRES para generar anotaciones TLINK a escala, reduciendo el coste de anotacion manual; su F1 macro de 0,8006 en el split propio lo hace util como preanotador con revision humana.
- Extraccion de cronologias en noticias: dado un texto periodistico, permite reconstruir el orden relativo de los eventos mencionados dentro de cada frase y encadenarlos despues en un timeline.
- Analisis de historiales clinicos: ordenar temporalmente sintomas, diagnosticos y tratamientos documentados en notas clinicas (una vez validado el dominio, ya que el dataset de ajuste no se describe) para construir lineas temporales de paciente.
- Documentos legales y de seguros: determinacion del orden de hechos en declaraciones, contratos o informes periciales, donde la secuencia temporal es un requisito probatorio.
- Construccion de grafos de conocimiento temporales: el modelo actua como extractor de aristas temporales etiquetadas entre entidades, que despues se cargan en un grafo para consultas cronologicas.
- Enriquecimiento de pipelines RAG: ordenar temporalmente los fragmentos recuperados antes de pasarlos al generador, de modo que el resumen final respete la secuencia real de los hechos.
- Preprocesado para sistemas de question answering temporal: responder preguntas del tipo "que ocurrio antes" exige disponer de relaciones TLINK fiables; este modelo puede generar esa capa intermedia.
- Investigacion en NLP temporal: servir como baseline generativo frente a clasificadores discriminativos tipo BERT en tareas de TempEval, con la ventaja de reutilizar un unico checkpoint para multiples esquemas de etiquetas.

## Benchmarks y rendimiento
Los unicos resultados publicados son los del split de test del autor, sobre 192 ejemplos, exclusivamente para la tarea de clasificacion TLINK. No hay datos de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos en la informacion disponible.

| Metrica | Valor |
|---|---|
| Accuracy | 0,8021 |
| Macro-F1 | 0,8006 |
| Weighted-F1 | 0,8021 |
| Salidas invalidas | 0 de 192 |

Advertencia metodologica: con n = 192, el intervalo de confianza al 95 % para una accuracy del 0,80 tiene una semianchura aproximada de 0,057, es decir, mas de cinco puntos porcentuales. El resultado debe interpretarse como una estimacion con alta incertidumbre y medida sobre un split propio, no sobre un benchmark publico independiente. No se han publicado resultados de benchmarks comparativos en la informacion disponible.

## Requisitos de hardware
- VRAM para inferencia en bf16/fp16: aproximadamente 29,6 GB solo para los pesos, mas la cache KV y las activaciones. Se requiere una GPU con 40 GB o mas (A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB) para trabajar con comodidad.
- Cuantizacion a 8 bits: unos 15 GB de pesos, viable en RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen para cache KV en secuencias cortas.
- Cuantizacion a 4 bits: unos 8-9 GB de pesos, lo que permitiria ejecutarlo en GPUs de 12-16 GB, aunque con perdida de precision no evaluada por el autor. No existen pesos cuantizados publicados en el repositorio, por lo que habria que generarlos.
- Consumer GPU: no cabe en precision completa en ninguna GPU de consumo. Si cabria en RTX 4090, RTX 3090 o RTX 4080 tras cuantizacion a 8 o 4 bits.
- Opciones de despliegue: `transformers` de forma nativa; Text Generation Inference (el repositorio esta etiquetado como compatible con endpoints y TGI); vLLM para servir con batching continuo. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, tarea no realizada por el autor.
- Latencia y throughput: no disponibles. Conviene senalar que la salida es una unica etiqueta, de modo que el coste dominante es el prefill de la frase de entrada y no la decodificacion; en consecuencia, el throughput agregado deberia ser alto con batching, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (qwen2.5-14b-tlink-sentence-only-autoregressive) | 14,77 B | No disponible (base: 32.768 tokens, 131.072 con YaRN) | Clasificacion TLINK generativa en 4 clases | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-14B-Instruct (modelo base) | 14,77 B | 32.768 tokens nativos, 131.072 con YaRN | Instrucciones generales, chat, codigo, tool calling | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Clasificadores discriminativos tipo BERT/RoBERTa ajustados a TimeML (TempEval, MATRES) | 0,1-0,4 B | 512 tokens | Clasificacion TLINK | Variable segun checkpoint | Multiples checkpoints publicos, datos comparativos no disponibles aqui |

La comparacion cuantitativa con alternativas no esta disponible: no se han publicado resultados de este modelo frente a clasificadores BERT en el mismo split, ni frente a otros LLM ajustados para la misma tarea. La unica comparacion defendible es frente al modelo base, del que se diferencia por el ajuste de parametros completos y por la especializacion en una tarea de etiquetado con cuatro clases.

## Limitaciones y advertencias
- Riesgo de olvido catastrofico: al tratarse de un ajuste de parametros completos sobre una tarea muy estrecha, es probable que las capacidades conversacionales, de generacion de codigo y de tool calling del modelo base se hayan degradado. No hay evaluacion que lo cuantifique.
- Ambito restringido a nivel de frase: el modelo no resuelve relaciones temporales entre oraciones ni a nivel de documento, pese a que la mayoria de aplicaciones reales requieren ambas escalas.
- Muestra de evaluacion muy pequena: 192 ejemplos y ausencia de validacion cruzada. La incertidumbre del 0,8021 de accuracy es de aproximadamente mas de cinco puntos porcentuales al 95 % de confianza.
- Sin validacion externa: 0 descargas y 0 "likes". No hay terceros que hayan reproducido los resultados ni evaluado el modelo en dominios distintos al del autor.
- Composicion del dataset desconocida: no se documentan dominios, idioma, licencia de los datos originales ni procedencia de las anotaciones. Esto impide evaluar sesgos y puede introducir problemas de licencia si los datos derivan de corpus con condiciones de uso restrictivas.
- Sesgos: no disponibles. Al no publicarse la composicion del corpus de ajuste, no se puede caracterizar el sesgo de dominio, idioma, genero ni procedencia geografica de las anotaciones.
- Riesgo de alucinacion fuera de distribucion: aunque el modelo registro 0 salidas invalidas de 192 en el test, fuera del dominio de entrenamiento puede emitir etiquetas no pertenecientes al conjunto {BEFORE, AFTER, OTHER, NONE}; es imprescindible validar la salida contra ese conjunto en produccion.
- Licencia: Apache 2.0 permite uso comercial del checkpoint, pero no cubre necesariamente los derechos sobre el dataset de ajuste ni sobre textos de entrada de terceros.
- Requisitos de memoria: 29,6 GB en precision completa lo hacen inviable en GPU de consumo sin cuantizacion, y no se publican pesos cuantizados.
- Fecha de creacion del repositorio inusual (2026-10-14) y actualizacion a los pocos minutos; conviene verificar la integridad de los pesos antes de usarlos en un entorno de produccion.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/AnirbanSaha/qwen2.5-14b-tlink-sentence-only-autoregressive
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/AnirbanSaha/tlink-classification-sentence-only
- Informe tecnico de Qwen2.5 (referencia del modelo base): https://arxiv.org/abs/2412.15115
- Blog oficial de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de codigo de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre la tarea TLINK; los enlaces obtenidos correspondian a contenidos ajenos al ambito del modelo y se han descartado.
