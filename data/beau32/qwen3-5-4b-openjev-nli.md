# beau32/Qwen3.5-4B-OpenJEV-NLI

## Resumen

Qwen3.5-4B-OpenJEV-NLI es un adaptador PEFT/LoRA para clasificacion de secuencias, ajustado sobre el modelo base Qwen/Qwen3.5-4B para la tarea de inferencia de lenguaje natural (NLI) de tres clases. Su funcion es clasificar pares premisa/hipotesis en una de tres etiquetas: `contradiction`, `entailment` o `neutral`. El repositorio no contiene los pesos del modelo base, sino unicamente el adaptador y el tokenizador, por lo que debe cargarse junto con Qwen3.5-4B.

El autor es el usuario de Hugging Face beau32 y el repositorio se publica bajo licencia Apache 2.0. La model card lo describe explicitamente como un artefacto de investigacion, no como un sistema de proposito general, y recomienda evaluar su precision y calibracion antes de cualquier uso practico. Al tratarse de un adaptador LoRA, su interes principal es experimental: permite anadir capacidad de NLI a un LLM sin reentrenar el modelo completo, con un coste de almacenamiento y despliegue minimo.

No se ha publicado informacion sobre la arquitectura detallada del modelo base, el numero de tokens de entrenamiento, el dataset de ajuste fino ni resultados de benchmarks en la model card, por lo que varios datos tecnicos no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base Qwen3.5-4B (transformer, detalles no disponibles) |
| Parametros totales | No disponible (depende del modelo base Qwen3.5-4B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (los ejemplos de la model card usan max_length=512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la tarea y los ejemplos estan en ingles) |
| Licencia | Apache 2.0 (adaptador); el modelo base se distribuye bajo su propia licencia |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA, una tecnica de fine-tuning eficiente en parametros (PEFT) que congela los pesos del modelo base y entrena matrices de bajo rango anadidas a las capas de atencion (y opcionalmente a las capas MLP). Esto reduce drasticamente el numero de parametros entrenables y el tamano del artefacto resultante, que en este caso ocupa practicamente nada en comparacion con los pesos completos del modelo base. La model card no especifica el rank (r), alpha ni los modulos objetivo del adaptador.

El modelo base es Qwen/Qwen3.5-4B, sobre el cual se monta una cabeza de clasificacion de secuencias (`AutoModelForSequenceClassification`) con tres etiquetas. La tarea de entrenamiento es NLI de tres clases, con entradas formateadas como `Premise: <premise>\nHypothesis: <hypothesis>`. No se ha publicado informacion sobre el dataset utilizado (el nombre "OpenJEV" sugiere un dataset concreto, pero no hay detalles verificables), el numero de pasos de entrenamiento, hiperparametros ni uso de tecnicas como RLHF o DPO. La salida es un vector de logits sobre tres clases, sobre el que se aplica softmax.

## Capacidades

- Clasificacion NLI de tres vias: dado un par premisa/hipotesis, devuelve una de tres etiquetas (`contradiction`, `entailment`, `neutral`) con probabilidades via softmax.
- Clasificacion de secuencias mediante pipeline `text-classification` de Hugging Face Transformers.
- Carga flexible mediante la libreria PEFT, permitiendo montar y desmontar el adaptador sobre el modelo base sin modificar sus pesos.
- No es un modelo generativo en este despliegue: el adaptador esta orientado a clasificacion, no a generacion de texto, razonamiento conversacional ni codigo.
- No hay soporte documentado de tool calling, agentes, vision ni audio.
- Las puntuaciones softmax no estan calibradas y no deben interpretarse como estimaciones de confianza fiables, segun advierte la propia model card.

## Casos de uso

- Filtrado de contradicciones en generacion aumentada por recuperacion (RAG): dada una respuesta generada como hipotesis y los documentos recuperados como premisa, el adaptador puede detectar si la respuesta contradice las fuentes, senalando alucinaciones potenciales antes de mostrarlas al usuario.
- Verificacion de consistencia en resumenes automaticos: comparar un resumen (hipotesis) con el documento original (premisa) para clasificar si el resumen es inferible, neutral o contradictorio respecto a la fuente.
- Deteccion de contradicciones en bases de conocimiento textuales: procesar pares de frases extraidas de documentos empresariales para identificar afirmaciones incompatibles antes de consolidar informacion.
- Etiquetado de datos para entrenamiento de clasificadores: usar el adaptador como etiquetador automatico (weak supervision) de pares premisa/hipotesis en ingles, generando datos iniciales que luego se validan manualmente.
- Evaluacion de sistemas de dialogo: comprobar si las respuestas de un chatbot son inferibles a partir del contexto de la conversacion, como metrica automatica de fidelidad.
- Investigacion en NLI con LLM: servir como punto de partida experimental para estudiar como los adaptadores LoRA sobre LLM decodificadores se comportan en tareas de clasificacion frente a modelos encoder dedicados.
- Deduplicacion y limpieza de corpus: identificar pares de frases redundantes (entailment mutuo aproximado) durante la preparacion de datasets de preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, F1, matriz de confusion ni comparaciones con otros modelos de NLI.

## Requisitos de hardware

- El adaptador en si ocupa un espacio minimo (el repositorio reporta 0.0 GB); el requisito real lo impone el modelo base Qwen3.5-4B.
- VRAM estimada para inferencia: no disponible con exactitud; como referencia aproximada, un modelo de 4B parametros en FP16 requiere alrededor de 8-10 GB de VRAM, mas la cabeza de clasificacion y el adaptador.
- GPU recomendadas: una GPU de consumo con 12-16 GB de VRAM (por ejemplo RTX 3060 12 GB, RTX 4070 Ti o RTX 4090) deberia ser suficiente para el modelo base de 4B en FP16; no hay datos oficiales.
- Cabe en GPU de consumo: probablemente si, dado el tamano de 4B del modelo base, aunque no esta confirmado por el autor.
- Despliegue: el flujo documentado usa Transformers y PEFT en Python (PyTorch). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que se trata de un adaptador PEFT de clasificacion y no de pesos GGUF.
- Latencia y throughput: no disponibles; al ser clasificacion de secuencias con entradas cortas (max 512 tokens en los ejemplos), la latencia por peticion deberia ser baja en GPU moderna.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-OpenJEV-NLI | Adaptador LoRA sobre LLM 4B | NLI de 3 clases | Apache 2.0 | Artefacto experimental, sin benchmarks publicados |
| roberta-large-mnli (FacebookAI/roberta-large) | Encoder (RoBERTa-large, ~355M) | NLI de 3 clases | MIT | Modelo clasico de NLI, mucho mas ligero y con historial de benchmarks |
| DeBERTa-v3-large-mnli-fever-anli-ling-wanli (MoritzLaurer) | Encoder (DeBERTa-v3-large) | NLI multiconjunto | MIT | Estado del arte tradicional en NLI, entrenado sobre MNLI, FEVER, ANLI y WANLI |

Frente a los modelos encoder dedicados, este adaptador tiene la ventaja de reutilizar un LLM base ya desplegado (posiblemente para otras tareas) y la desventaja de mayor coste computacional y ausencia de evaluacion publicada. Para produccion en NLI puro, los modelos encoder suelen ser mas rapidos y economicos.

## Limitaciones y advertencias

- Es un artefacto de investigacion: la propia model card indica que no debe usarse como sistema de proposito general ni para decisiones de consecuencias importantes sin validacion previa.
- Las puntuaciones softmax no estan calibradas; no deben usarse como estimaciones de confianza sin una recalibracion sobre datos del dominio objetivo.
- No se han publicado metricas de precision, cobertura de etiquetas ni datos sobre el dataset de entrenamiento, por lo que su calidad es desconocida.
- El repositorio no incluye los pesos del modelo base: es necesario descargar Qwen/Qwen3.5-4B por separado y cumplir su licencia y terminos, que pueden diferir del adaptador.
- Idiomas: la tarea y los ejemplos estan en ingles; no hay informacion sobre rendimiento en espanol ni en otros idiomas.
- Riesgo de alucinacion: no aplicable directamente al ser un clasificador, pero si se usa para verificar salidas de LLM, sus errores de clasificacion pueden dejar pasar contradicciones o marcar falsos positivos.
- Con 0 descargas y 0 likes en el momento de la ficha, no existe comunidad ni historial de uso que respalde su fiabilidad.
- Sesgos: no documentados; como todo clasificador entrenado sobre datos textuales, puede heredar sesgos del dataset de ajuste, cuya composicion se desconoce.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/beau32/Qwen3.5-4B-OpenJEV-NLI
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de Transformers (clasificacion de secuencias): https://huggingface.co/docs/transformers/tasks/sequence_classification

No se han encontrado enlaces a papers, demos ni repositorios adicionales en la informacion disponible.
