# rushilarun/Mochi-Llama-1B-Classifier

## Resumen

Mochi-Llama-1B-Classifier es un adaptador LoRA (PEFT) sobre `meta-llama/Llama-3.2-1B-Instruct`, publicado por el usuario rushilarun bajo el paraguas del proyecto Mochi (**M**alicious **O**utput **C**uration for **H**igh-quality **I**njection-defense). Su proposito es actuar como primera etapa de una defensa contra prompt injection: responde con normalidad a las peticiones benignas y rechaza las maliciosas, funcionando de facto como clasificador binario implementado mediante generacion de texto.

El adaptador se distribuye como pesos safetensors de tipo LoRA (0,1 GB de repositorio) y reutiliza integramente la arquitectura del modelo base: un transformer decoder-only de 1,24 mil millones de parametros con ventana de contexto de 128.000 tokens. La model card reporta sobre un split de test de 1.074 prompts una accuracy de 0,935, precision de 0,973, recall de 0,943 y F1 de 0,958, con las respuestas etiquetadas por Claude Haiku 4.5.

Su relevancia es acotada pero concreta: los guardrails de prompt injection ligeros son un componente habitual en gateways de LLM y pipelines de agentes, donde se necesita un filtro rapido y barato antes de invocar un modelo grande. No obstante, el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que carece de validacion independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; adaptador LoRA sobre meta-llama/Llama-3.2-1B-Instruct |
| Parametros totales | 1,24 mil millones en el modelo base; numero de parametros del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base (no se especifica para el adaptador) |
| Tipos de cuantizacion | no disponible en la model card; el adaptador se publica en safetensors sin cuantizar. El modelo base dispone de cuantizaciones GGUF de la comunidad |
| Idiomas soportados | no disponibles en la model card. Hereda los del modelo base (aleman, arabe no; oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes, segun Meta) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador no modifica la arquitectura subyacente. El modelo base, Llama 3.2 1B Instruct, es un transformer decoder-only con atencion por consultas agrupadas (GQA) y normalizacion RMSNorm, destilado por Meta a partir de modelos mayores de la familia Llama 3.1 y entrenado con aproximadamente 9 billones de tokens, con ajuste posterior mediante SFT y DPO. El adaptador LoRA introduce matrices de bajo rango en las capas de atencion y proyeccion, por lo que el coste de almacenamiento es de 0,1 GB frente a los aproximadamente 2,5 GB del modelo base en fp16.

El entrenamiento del adaptador se realizo sobre el dataset `SulKhu/Mochi`, orientado a la tarea de defensa frente a prompt injection. La model card describe una "etapa 1" (clasificacion) en la que el modelo responde a peticiones benignas y rechaza las maliciosas, sin detallar el numero de tokens de entrenamiento, la composicion del dataset, la configuracion de LoRA (rango, alpha, capas objetivo) ni si se aplicaron tecnicas adicionales como DPO o RLHF. La evaluacion se llevo a cabo sobre 1.074 prompts y las respuestas fueron etiquetadas por Claude Haiku 4.5, un detalle metodologico relevante porque introduce un clasificador externo generativo en el bucle de evaluacion.

## Capacidades

- Clasificacion binaria bien/mal por generacion: el modelo produce una respuesta util ante peticiones benignas o un rechazo ante peticiones maliciosas, en lugar de emitir una etiqueta estructurada.
- Deteccion de prompt injection directa: la model card indica explicitamente la defensa frente a inyecciones de prompt, con los valores de precision y recall ya citados.
- Generacion de texto basica: heredada del modelo base Llama 3.2 1B Instruct, aunque el ajuste LoRA la especializa hacia la tarea de seguridad.
- Soporte de plantilla de chat: se usa a traves de `apply_chat_template` con roles `user`/`assistant`.
- Soporte multilingue: no verificado en el adaptador. El modelo base cubre oficialmente ocho idiomas, pero no hay evaluacion publicada del adaptador en idiomas distintos del ingles.
- Tool calling y function calling: no documentado para el adaptador. El modelo base Llama 3.2 1B Instruct si soporta function calling segun Meta, pero el ajuste LoRA puede degradar esta capacidad al haberse entrenado para una tarea de clasificacion.
- Razonamiento multi-paso y agentes: no documentado; la tarea objetivo es un filtro de una sola pasada.
- Vision, audio y modo "thinking": no soportados.

## Casos de uso

- Filtro previo en gateways de LLM: situar el adaptador como primera barrera antes de enrutar una peticion a un modelo mayor. Su tamano de 1B permite ejecutarlo en la misma GPU y anadir una latencia baja por peticion comparado con un guardrail basado en un modelo de 7B o 8B.
- Proteccion de agentes con acceso a herramientas: en un agente que ejecuta busquedas web, lectura de ficheros o llamadas a API, el clasificador puede inspeccionar el prompt del usuario y el contenido recuperado antes de que llegue al planificador, reduciendo el riesgo de inyeccion indirecta.
- Moderacion en pipelines RAG: filtrar tanto la consulta del usuario como los fragmentos recuperados de la base documental, que son un vector habitual de inyeccion indirecta cuando el corpus incluye contenido no confiable.
- Red teaming y evaluacion de seguridad: usar el adaptador como linea base medible frente a un conjunto propio de ataques, comparando su tasa de falsos negativos con la de alternativas como Llama Guard 3 1B o Prompt Guard.
- Investigacion academica sobre defensas de prompt injection: el proyecto Mochi y su dataset publico permiten reproducir el entrenamiento y estudiar variantes (destilacion, ajuste con DPO, ampliacion del dataset) partiendo de un punto de referencia publicado.
- Backend de chatbot con entrada libre de usuarios: en un asistente de atencion al cliente donde el usuario puede pegar texto externo (correos, capturas descritas), el filtro evita que instrucciones embebidas alteren el comportamiento del sistema.
- Pre-filtro en APIs publicas con coste por token: al ser un modelo de 1,24B, el coste por inferencia es una fraccion del de un modelo frontera; clasificar primero y descartar peticiones maliciosas reduce el gasto agregado.
- Auditoria por lotes de conversaciones: procesar historicos de interacciones para localizar intentos de inyeccion y alimentar un panel de seguridad interna, dado que el modelo corre en CPU o en una GPU de gama media.

## Benchmarks y rendimiento

Unicos resultados publicados en la informacion disponible (split de test de 1.074 prompts, etiquetado por Claude Haiku 4.5):

| Metrica | Valor |
|---|---|
| Accuracy | 0,935 |
| Precision | 0,973 |
| Recall | 0,943 |
| F1 | 0,958 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MT-Bench, etc.) para este adaptador. Tampoco se publican resultados desagregados por idioma, por tipo de ataque ni matrices de confusion, ni comparacion directa con Llama Guard 3 1B, ShieldGemma o Prompt Guard bajo el mismo protocolo de evaluacion.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del modelo base (1,24 mil millones de parametros) y de la sobrecarga del adaptador; el autor no publica mediciones.

- Pesos en fp16/bf16: aproximadamente 2,5 GB. Con cache KV y overhead del runtime, se recomiendan entre 4 y 6 GB de VRAM para contexto corto.
- Pesos en int8: aproximadamente 1,3 GB; en cuantizacion de 4 bits, en torno a 0,8 GB (requiere fusionar el adaptador y convertir a GGUF, ya que el autor no publica versiones cuantizadas).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM. Cabe en RTX 3060, RTX 4060, RTX 2070 o superiores. Para despliegues de alto volumen, una L4, A10G, A100 o H100 permite batchear muchas peticiones simultaneas con un consumo de memoria minimo.
- GPU de consumo: si, el modelo cabe holgadamente en practicamente cualquier GPU de consumo moderna, e incluso en algunas integradas con memoria compartida. Tambien es viable la inferencia en CPU.
- Opciones de despliegue: `transformers` + `peft` (ruta oficial documentada en la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores LoRA, y llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados bajo un protocolo comun. La tabla recoge unicamente caracteristicas estructurales conocidas de alternativas del mismo nicho (clasificacion de seguridad y prompt injection):

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Mochi-Llama-1B-Classifier | 1,24B (base) + LoRA | 128.000 tokens (base) | Llama 3.2 Community | Adaptador LoRA generativo |
| Llama Guard 3 1B | 1,24B | 128.000 tokens | Llama 3.2 Community | Clasificador generativo de seguridad |
| ShieldGemma 2B | 2,6B (aproximado) | no disponible en la informacion proporcionada | Gemma | Clasificador generativo de seguridad |
| Prompt Guard | 86M (mDeBERTa-v3) | no disponible en la informacion proporcionada | licencia de Meta | Clasificador discriminativo dedicado |

Rendimiento comparado: no disponible. No se han publicado evaluaciones cruzadas entre Mochi-Llama-1B-Classifier y estas alternativas, y las metricas de la model card proceden de un split propio con etiquetado por Claude Haiku 4.5, por lo que no son directamente comparables con las de Llama Guard 3 o ShieldGemma.

## Limitaciones y advertencias

- Metodologia de evaluacion circular: las etiquetas del conjunto de test fueron generadas por Claude Haiku 4.5. Esto mide el acuerdo con un modelo concreto, no necesariamente la correccion frente a un ground truth humano, y puede inflar las metricas.
- Un unico dataset de entrenamiento: `SulKhu/Mochi`. No se documenta la composicion, el tamano ni la diversidad de ataques, por lo que existe riesgo de sobreajuste al dominio y de falsos negativos ante tecnicas no representadas (codificacion base64, homoglifos unicode, ataques multilingues, inyeccion indirecta en documentos largos).
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta. No hay terceros que hayan reproducido las metricas ni informes de fallos en produccion.
- Salida no determinista: al ser un modelo generativo, la respuesta depende de la temperatura, de `max_new_tokens` y de la plantilla de chat. No es un clasificador con etiqueta fija, lo que complica la integracion en sistemas que esperan un booleano.
- Capacidad limitada del modelo base: con 1,24B de parametros, el razonamiento es limitado y es mas susceptible a ataques adversarios elaborados o a instrucciones largas y confusas que un guardrail de mayor tamano.
- Riesgo de alucinacion: puede generar contenido plausible en lugar de rechazar, especialmente ante peticiones ambiguas que caen en la frontera entre benigno y malicioso.
- Idiomas: no verificados. Se desconoce el rendimiento fuera del ingles; es probable una degradacion notable en espanol y en otros idiomas, dado el tamano del modelo y la ausencia de evaluacion multilingue.
- Dependencia del modelo base: requiere acceso a `meta-llama/Llama-3.2-1B-Instruct`, que esta sujeto a aceptacion de condiciones en Hugging Face. El adaptador no funciona de forma autonoma.
- Licencia: Llama 3.2 Community License. Permite uso comercial con condiciones, incluida la obligacion de incluir avisos de atribucion, la denominacion "Built with Llama" en productos derivados y el cumplimiento de la politica de uso aceptable. Superar los 700 millones de usuarios mensuales exige solicitar una licencia adicional a Meta. La licencia tambien restringe ciertos usos (por ejemplo, entrenar otros modelos con las salidas en determinados supuestos).
- Caveat de despliegue: al tratarse de un filtro de seguridad, un falso negativo es mas costoso que un falso positivo. Con un recall de 0,943 sobre un test etiquetado automaticamente, conviene combinarlo con un segundo guardrail y con validacion de salidas antes de dar por cubierta la defensa.
- Metadatos anomalos: las fechas del repositorio indican creacion y actualizacion el 21 de septiembre de 2026, posteriores a la fecha habitual de consulta; conviene verificar la vigencia y el mantenimiento del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rushilarun/Mochi-Llama-1B-Classifier
- Repositorio del proyecto Mochi: https://github.com/rushil-arun/mochi
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/SulKhu/Mochi
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Nota sobre la busqueda web: los resultados recuperados no guardan ninguna relacion con el modelo (contenido sobre YouTube Music) y no aportan informacion adicional utilizable. No se han encontrado papers, blogs ni demos asociados a este adaptador.
