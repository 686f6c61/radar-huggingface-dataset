# ketimiroshnik/llm-course-hw3-tinyllama-qlora

## Resumen

`ketimiroshnik/llm-course-hw3-tinyllama-qlora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base TinyLlama/TinyLlama-1.1B-Chat-v1.0, publicado por el usuario ketimiroshnik como entrega de un trabajo de curso (el identificador `hw3` sugiere la tercera tarea de un programa de formacion en LLMs). El objetivo declarado es especializar el modelo en analisis de sentimiento de tuits, forzando una respuesta de una sola palabra entre `negative`, `neutral` o `positive`. No se trata, por tanto, de un modelo fundacional nuevo, sino de un ajuste fino de proposito muy concreto sobre un modelo pequeno de 1.100 millones de parametros.

El adaptador se entreno sobre el subconjunto `sentiment` del dataset `cardiffnlp/tweet_eval`, con los 45.615 ejemplos de entrenamiento y 2 epocas. Los pesos base se cargaron en cuantizacion NF4 con computo en float16, y se aplicaron adaptadores LoRA unicamente a las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) con rango r=16, alpha=32 y dropout 0. El resultado reportado por el autor es un macro F1 de 0,5435 sobre el conjunto de test completo (12.284 ejemplos), frente a 0,1361 del modelo base sin ajustar.

La relevancia de esta ficha es limitada desde el punto de vista de la investigacion o la produccion: se trata de un artefacto educativo, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin benchmarks estandar publicados. Resulta util, eso si, como ejemplo reproducible de un pipeline QLoRA completo (cuantizacion 4-bit, PEFT, evaluacion con macro F1 y publicacion del adaptador junto al tokenizador) sobre hardware de gama alta (A100 de 80 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (TinyLlama-1.1B) con adaptadores LoRA sobre atencion |
| Parametros totales | 1.100 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base TinyLlama-1.1B-Chat-v1.0 declara 2.048 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | Entrenamiento con NF4 (bnb_4bit) y computo float16; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (PEFT); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only de 1.100 millones de parametros. El entrenamiento sigue el esquema QLoRA: los pesos del modelo base se cargan cuantizados en NF4 con tipo de computo float16, se preparan para entrenamiento en k-bits (`prepare_model_for_kbit_training`) y se inyectan adaptadores LoRA de bajo rango exclusivamente en las cuatro proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`), con r=16, alpha=32 y dropout=0. No se menciona ajuste de las capas MLP ni de las proyecciones de salida.

Los datos de entrenamiento son el split `train` completo del subconjunto `sentiment` de `cardiffnlp/tweet_eval`, con 45.615 ejemplos y etiquetas de tres clases. Se realizaron 2 epocas con learning rate 5e-5, batch de 16, scheduler coseno con warmup del 5 % y semilla 42, sobre una A100 de 80 GB. No se documenta el numero total de tokens procesados ni si hubo etapas de RLHF o DPO (no las hay, al tratarse de un ajuste supervisado). El prompt de sistema utilizado fija la tarea: "Determine the overall sentiment of this tweet. Respond with one word: negative, neutral, or positive."

La innovacion tecnica es minima y de caracter didactico: el valor del artefacto reside en la reproducibilidad del pipeline (cuantizacion 4-bit, PEFT, evaluacion con macro F1 incluyendo la clase de respuesta vacia) y en la verificacion explicita de que el adaptador se recarga correctamente junto al tokenizador. No se emplean tecnicas como decodificacion especulativa, atencion lineal ni arquitecturas hibridas.

## Capacidades

- Generacion de texto breve orientada a clasificacion: produce una unica palabra (`negative`, `neutral` o `positive`) como respuesta al prompt de sistema predefinido.
- Analisis de sentimiento sobre texto informal en ingles, especificamente tuits con jerga, hashtags y abreviaturas propias del dominio de tweet_eval.
- Formato conversacional: el adaptador se usa con `apply_chat_template` y roles `system`/`user`, heredando la interfaz de chat de TinyLlama-1.1B-Chat.
- Generacion determinista: el ejemplo de la model card emplea `do_sample=False` y un limite de 16 tokens nuevos, lo que encaja con un uso de clasificacion y no de generacion abierta.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Clasificacion de sentimiento por lotes en pipelines de analitica social: el adaptador devuelve una etiqueta de una sola palabra, lo que simplifica el parseo y permite procesar grandes volumenes de tuits con un modelo de 1.100 millones de parametros y cuantizacion 4-bit.
- Moderacion y triaje de comentarios en comunidades en linea: dado que la salida esta restringida a tres clases, se puede encadenar a un sistema de reglas que derive a revision humana los mensajes clasificados como `negative`.
- Enriquecimiento de datasets de investigacion en ciencias sociales: el modelo sirve como etiquetador automatico de corpus de Twitter en ingles, con la advertencia de que su macro F1 reportado (0,5435) es moderado y requiere validacion humana en submuestras.
- Prototipado rapido de tareas de clasificacion con QLoRA: el repositorio funciona como plantilla reproducible para equipos que quieran adaptar TinyLlama a una tarea de etiquetado con un solo GPU y un dataset publico.
- Docencia y formacion en ingenieria de LLMs: el artefacto documenta el ciclo completo (cuantizacion NF4, LoRA en proyecciones de atencion, evaluacion con macro F1, publicacion de adaptador y tokenizador), lo que lo hace util como material de referencia en cursos.
- Filtrado previo en sistemas de monitorizacion de marca: se puede usar para preclasificar menciones y activar alertas solo cuando el sentimiento sea negativo, reduciendo el coste frente a invocar un modelo mayor para cada mencion.
- Evaluacion comparativa de tecnicas de ajuste: sirve como referencia base para medir el impacto de cambiar rango LoRA, capas objetivo o regimen de cuantizacion sobre una tarea con metrica bien definida.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son de la tarea de clasificacion de sentimiento sobre el split de test completo de `cardiffnlp/tweet_eval` (12.284 ejemplos), con macro F1 calculado por la funcion original de la tarea sobre cuatro etiquetas (incluida la respuesta vacia):

| Metrica | Antes del ajuste | Despues del ajuste |
|---|---|---|
| Macro F1 (test, 12.284 ejemplos) | 0,1361 | 0,5435 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 1.100 millones de parametros; en cuantizacion 4-bit NF4 ocupa aproximadamente 0,7-1 GB de pesos, mas overhead de activaciones y cache KV, lo que situa el consumo practico en torno a 2-3 GB para contextos cortos. En float16 el modelo base ronda los 2,2 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia poder ejecutar la inferencia en 4-bit; el autor entreno en una A100 de 80 GB, pero el entrenamiento QLoRA de este tamano es viable en GPUs de 16-24 GB como una RTX 4090 o una RTX 3090 con batch reducido.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, asi como en Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: el adaptador se carga con `peft.PeftModel.from_pretrained` sobre el modelo base cuantizado con `bitsandbytes`; tambien es posible fusionar el adaptador en los pesos base y exportar a GGUF para llama.cpp u Ollama, aunque el autor no documenta ese flujo. vLLM y TGI soportan adaptadores LoRA, pero no se han publicado configuraciones especificas para este repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al tratarse de un modelo de 1.100 millones de parametros con salida de 16 tokens, la latencia por peticion deberia ser baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketimiroshnik/llm-course-hw3-tinyllama-qlora | 1.100 M (base) + adaptador LoRA | no disponible | Adaptador QLoRA para sentimiento en tuits | no disponible | Hugging Face, 0 descargas |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1.100 M | no disponible en esta ficha (declara 2.048 tokens en su model card) | Modelo base conversacional | Apache 2.0 (segun su model card, no verificado aqui) | Hugging Face, ampliamente descargado |
| Adaptadores de sentimiento sobre RoBERTa (p. ej. cardiffnlp/twitter-roberta-base-sentiment-latest) | ~125 M | 512 tokens | Clasificador encoder-only especifico de sentimiento en tuits | generalmente MIT o similar (no verificado) | Hugging Face, ampliamente usado |
| Modelos generativos mayores tipo Llama 3.1 8B Instruct | 8.000 M | 128.000 tokens (segun su model card) | Generacion general con capacidad de clasificacion via prompt | licencia comunitaria de Meta | Hugging Face |

La comparacion directa con clasificadores encoder-only como RoBERTa es la mas relevante en terminos de coste y precision para esta tarea concreta: un modelo de 125 millones de parametros especializado suele superar en F1 a un generativo de 1.100 millones ajustado con LoRA, aunque no se dispone de numeros comparables en la informacion proporcionada. No se han publicado comparativas oficiales del autor frente a otros modelos.

## Limitaciones y advertencias

- El macro F1 reportado (0,5435) es moderado y se calcula sobre cuatro etiquetas, incluida la respuesta vacia; no equivale a una precision del 54 % en la practica y exige validacion en el dominio de destino.
- El adaptador esta entrenado exclusivamente con datos de Twitter en ingles (`cardiffnlp/tweet_eval`); su comportamiento fuera de ese dominio (resenas, correos, texto formal) no esta documentado y previsiblemente se degrada.
- El modelo solo responde en ingles y solo con las tres etiquetas del prompt de sistema; no es un modelo de generacion abierta ni de conversacion general.
- No se declara licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion y de formatos de salida no conformes: el autor documenta que la metrica incluye la clase de respuesta vacia, lo que indica que el modelo puede no emitir ninguna etiqueta valida en algunos casos.
- El modelo base TinyLlama-1.1B-Chat hereda los sesgos de sus datos de preentrenamiento y de tweet_eval, que no estan auditados en esta ficha.
- El repositorio tiene cero descargas y cero likes, y fue creado en noviembre de 2026; no hay evidencia de uso en produccion ni de mantenimiento posterior.
- El identificador `hw3` y la model card en ruso sugieren un contexto academico; no hay garantia de soporte, actualizaciones ni correccion de errores.
- El ejemplo de inferencia requiere `bitsandbytes` y una GPU compatible; no se documenta un camino de ejecucion en CPU.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/ketimiroshnik/llm-course-hw3-tinyllama-qlora
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset cardiffnlp/tweet_eval: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Libreria PEFT: https://github.com/huggingface/peft
- Articulo QLoRA (Dettmers et al.): https://arxiv.org/abs/2305.14314
- Articulo LoRA (Hu et al.): https://arxiv.org/abs/2106.09685
- Guia de ajuste fino con LoRA y QLoRA (resultado de busqueda): https://tech-insider.org/how-to-fine-tune-llm-lora-2026/
- Guia de Ollama para modelos locales (resultado de busqueda): https://itsourcecode.com/ai-framework/ollama-run-local-llms-2026-complete-guide/
