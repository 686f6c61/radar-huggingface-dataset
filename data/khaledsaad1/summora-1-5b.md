# Khaledsaad1/Summora-1.5B

## Resumen

Summora-1.5B es un adaptador LoRA publicado en HuggingFace por el usuario Khaledsaad1 bajo el identificador `Khaledsaad1/Summora-1.5B`. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino (PEFT) que se aplican sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. El repositorio ocupa 0,1 GB y contiene pesos en formato safetensors, lo que confirma que solo se distribuye el adaptador: para ejecutar el modelo hay que descargar aparte el modelo base de 1,5 mil millones de parametros.

El ajuste se ha realizado con SFT (supervised fine-tuning) usando las librerias TRL y PEFT (version 0.21.1), segun las etiquetas declaradas en el repositorio. El nombre "Summora" y la etiqueta `conversational` apuntan a un uso orientado a resumen y dialogo, pero la model card publicada es una plantilla sin rellenar: no incluye descripcion, datos de entrenamiento, hiperparametros, idiomas, licencia ni resultados de evaluacion.

Su relevancia actual es limitada pero ilustrativa: es un ejemplo de adaptador LoRA de bajo coste sobre un modelo destilado de razonamiento, con 0 descargas y 0 likes en el momento de la consulta. Resulta util como caso de estudio de ajuste eficiente de parametros en modelos pequenos que caben en GPU de consumo, pero no hay evidencia publicada de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base (familia Qwen2) con adaptador LoRA/PEFT; los detalles del adaptador (rango, alpha, modulos objetivo) no estan disponibles |
| Parametros totales | 1,5 mil millones en el modelo base; numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base Qwen2.5 declara 32.768 tokens nativos, dato no verificado en esta ficha |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene el adaptador en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no se distribuyen pesos completos en este repositorio |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA entrenado con SFT sobre `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Las etiquetas indican el uso de `transformers`, `trl` y `peft`, con la version de PEFT 0.21.1 declarada en la seccion de framework versions. No se especifican el rango de la LoRA, el valor de alpha, los modulos objetivo, la tasa de aprendizaje, el numero de epochs, el tamano del dataset ni su composicion.

Del modelo base si existe documentacion publica: es un destilado de DeepSeek-R1 sobre Qwen2.5-1.5B, entrenado con trazas de razonamiento (chain-of-thought) generadas por el modelo mayor, lo que le confiere capacidad de producir razonamiento explicito antes de la respuesta. Esa caracteristica se hereda potencialmente en este adaptador, pero el fine-tuning concreto realizado por el autor no esta documentado y no puede confirmarse que preserve ni que modifique dicho comportamiento. No hay informacion sobre si se aplico RLHF, DPO o alguna tecnica adicional mas alla del SFT declarado.

## Capacidades

- Generacion de texto y conversacion multi-turno: etiquetado como `text-generation` y `conversational`, aunque no hay ejemplos ni evaluacion publicada.
- Resumen de textos: inferido del nombre del modelo ("Summora") y de su uso previsto, sin confirmacion documental.
- Razonamiento paso a paso: capacidad heredada del modelo base DeepSeek-R1-Distill-Qwen-1.5B, que genera cadenas de razonamiento; el grado de conservacion tras el ajuste es desconocido.
- Matematicas y codigo: atribuibles al modelo base por su entrenamiento de destilacion, sin datos de evaluacion en este repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas esta vacio).
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Resumen de documentos y actas: el nombre del adaptador sugiere un ajuste orientado a sintesis de texto. Se usaria cargando el modelo base en transformers y aplicando el adaptador con PEFT para condensar informes, transcripciones o hilos de correo. Requiere validacion propia, ya que no hay evaluacion publicada.
- Clasificacion y etiquetado de tickets de soporte: con 1,5B de parametros y cuantizacion de 4 bits, el modelo cabe en una GPU de consumo y permite procesar lotes grandes a coste muy bajo, asignando categoria y prioridad a cada ticket.
- Preprocesado en pipelines RAG: condensar el historial de una conversacion o resumir fragmentos recuperados antes de enviarlos a un modelo mayor, reduciendo el consumo de tokens en la fase cara del pipeline.
- Inferencia local en portatiles sin GPU dedicada: convirtiendo el modelo fusionado a GGUF Q4, se puede ejecutar con llama.cpp u Ollama en equipos con 8 GB de RAM, para resumen y asistencia offline con datos que no deben salir del dispositivo.
- Prototipado y aprendizaje de flujos PEFT: el repositorio sirve como ejemplo minimo de adaptador LoRA compatible con PEFT 0.21.1 y transformers, util para equipos que quieran replicar el formato en sus propios ajustes.
- Ajuste incremental en dominios verticales: al ser un adaptador de 0,1 GB, resulta barato de reentrenar o continuar entrenando sobre datos propios (legal, sanitario, documentacion tecnica) partiendo de esta inicializacion.
- Tutoria educativa de bajo coste: si el adaptador conserva la generacion de razonamiento del modelo base, podria emplearse para explicar ejercicios paso a paso en entornos con recursos limitados, previa validacion de la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para los pesos del modelo base (1,5B × 2 bytes), mas la cache KV, que crece con la longitud de contexto y el tamano de lote.
- VRAM en int8: aproximadamente 1,6 GB de pesos; en cuantizacion GGUF Q4_K_M: aproximadamente 1,0-1,2 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 8 GB o superiores para fp16 con contexto moderado; A100, H100 o L40S para despliegues con concurrencia alta. Una RTX 4090 es sobradamente suficiente para un modelo de este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 6 GB o mas de VRAM en cuantizacion de 4 bits, y en Apple Silicon con 8 GB de memoria unificada o mas.
- Opciones de despliegue: transformers + peft (carga del adaptador sin fusionar), vLLM (fusionando el adaptador o mediante soporte LoRA en tiempo de ejecucion), TGI, llama.cpp y Ollama (requieren fusionar el adaptador con el modelo base y convertir a GGUF), LM Studio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de terceros provienen de sus model cards publicas y no se han verificado en esta ficha; conviene contrastarlos antes de usarlos en produccion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Summora-1.5B (este modelo) | Adaptador sobre 1,5B | No disponible | No disponible | HuggingFace, solo adaptador |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,5B | 32.768 tokens declarados | MIT segun su model card | HuggingFace, pesos completos |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens declarados | Apache-2.0 | HuggingFace, pesos completos |
| meta-llama/Llama-3.2-1B-Instruct | 1,23B | 131.072 tokens declarados | Llama 3.2 Community License | HuggingFace, con acceso aceptado |
| google/gemma-2-2b-it | 2,6B | 8.192 tokens declarados | Gemma Terms of Use | HuggingFace, con acceso aceptado |

## Limitaciones y advertencias

- Licencia no especificada: no hay autorizacion explicita de uso comercial. En la practica, la licencia aplicable seria la del modelo base (MIT segun su model card), pero la ausencia de declaracion en este repositorio es un riesgo juridico que debe resolverse antes de un despliegue en produccion.
- Model card vacia: no hay informacion sobre datos de entrenamiento, por lo que no se pueden evaluar sesgos, cobertura idiomatica ni posibles filtraciones de datos.
- Riesgo de alucinacion: inherente a los modelos de 1,5B de parametros, especialmente en tareas factuales o de resumen abstractivo. Requiere verificacion humana o anclaje documental.
- Capacidad limitada por tamano: 1,5B de parametros restringen el razonamiento complejo, el seguimiento de instrucciones largas y el rendimiento multilingue en comparacion con modelos de 7B o superiores.
- Requiere el modelo base: el repositorio no es autosuficiente; hay que descargar `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` y cargar el adaptador con PEFT, o fusionarlos previamente.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones de terceros ni resultados reproducibles.
- Etiqueta `arxiv:1910.09700` no es un paper del modelo: corresponde a Lacoste et al. (2019), citado en la plantilla de la model card para el calculo de emisiones de carbono.
- Fecha de creacion registrada como 2026-10-15: metadato no verificable, conviene tratarlo con cautela.
- Sin informacion de cuantizaciones oficiales: cualquier GGUF o cuantizacion debe generarla el propio usuario, con la perdida de calidad asociada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Khaledsaad1/Summora-1.5B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper citado en las etiquetas (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental en ML: https://mlco2.github.io/impact#compute
