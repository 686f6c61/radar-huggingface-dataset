# believe-it-or-not/cond_chat_mixed_original_augmented_original_actq_pkc_fda_approval-39347a02

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, una variante de referencia de Llama 3.3 70B Instruct distribuida por Together AI. El adaptador lo publica el usuario `believe-it-or-not` y el nombre del repositorio (`cond_chat_mixed_original_augmented_original_actq_pkc_fda_approval-39347a02`) sugiere un ajuste fino orientado a conversacion condicionada, con mezcla de datos originales y aumentados, y con algun componente relacionado con la aprobacion de la FDA (agencia reguladora de medicamentos y alimentacion de EE. UU.). No obstante, la model card no documenta ninguna de estas decisiones de forma explicita.

El artefacto es un adaptador, no un modelo completo: pesa 1,7 GB en safetensors y requiere cargar el modelo base Llama 3.3 70B para funcionar. La model card es practicamente una plantilla vacia (todos los campos marcados como "[More Information Needed]"), sin datos de entrenamiento, hiperparametros, evaluacion, licencia ni idiomas declarados. La unica informacion tecnica fiable procede de las etiquetas del repositorio y del campo `library_name`.

Por tanto, esta ficha debe leerse como una descripcion del contenedor y de su modelo base, no como una validacion del ajuste. Cualquier uso en produccion exige una evaluacion propia, dado que no hay evidencia publicada de calidad, sesgos o comportamiento del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Llama 3.3 70B Instruct) |
| Parametros totales | Adaptador: no disponible (repo de 1,7 GB); modelo base: 70 000 millones (aproximado, segun Llama 3.3 70B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base Llama 3.3 70B Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizaciones estandar (FP16, BF16, INT8, INT4/GGUF) mediante herramientas externas |
| Idiomas soportados | no disponibles (no declarados); el modelo base Llama 3.3 soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | no disponible (la model card no la declara; el modelo base Llama 3.3 se distribuye bajo Llama 3.3 Community License) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama 3.3 70B Instruct, un transformer decoder-only denso de 70 000 millones de parametros con atencion por grupos (GQA) y ventana de contexto de 128 000 tokens en su version Instruct. El adaptador en si es un conjunto de matrices de bajo rango (LoRA) que modifican determinadas capas del modelo base; el repositorio declara PEFT 0.15.1 como version de framework.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de la mezcla (el nombre sugiere "original" y "augmented"), la existencia de RLHF o DPO, ni los hiperparametros del ajuste (rango, alpha, capas objetivo, tasa de aprendizaje). Tampoco se documenta si se congelaron capas, si se uso precision mixta BF16 o si hubo etapas de alineacion posteriores. La etiqueta `arxiv:1910.09700` corresponde a Lacoste et al. (2019) sobre estimacion de emisiones de carbono, citada en la plantilla de la model card, no a un paper del modelo.

## Capacidades

- Generacion de texto y conversacion multi-turno: heredadas del modelo base Llama 3.3 70B Instruct.
- Razonamiento y matematicas: el modelo base esta ajustado para instrucciones y tareas de razonamiento; el adaptador no documenta cambios en esta capacidad.
- Generacion de codigo: soportada por el modelo base; sin evidencia especifica del adaptador.
- Tool calling / function calling: el modelo base Llama 3.3 Instruct soporta llamadas a herramientas; el adaptador no lo documenta.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.
- Capacidades multilingues: no declaradas; dependen del modelo base.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no disponible (el modelo base es solo texto).

## Casos de uso

- Evaluacion de adaptadores LoRA en investigacion: cargar el adaptador sobre Llama 3.3 70B para comparar su comportamiento frente al modelo base en tareas de conversacion condicionada, usando un conjunto de validacion propio.
- Prototipado de asistentes conversacionales especializados: si el ajuste responde a un dominio concreto (el nombre sugiere conversacion condicionada y posiblemente contexto regulatorio farmaceutico), se puede usar como punto de partida para un asistente de consulta documental, siempre con evaluacion humana.
- Experimentos de mezcla de datos: el nombre del repositorio indica datos originales y aumentados; sirve para reproducir o analizar el efecto de la aumentacion en tareas de dialogo.
- Base para ajustes posteriores: al ser un adaptador PEFT, se puede combinar con otros adaptadores o continuar el entrenamiento con nuevos datos sin tocar los pesos completos del modelo base.
- Analisis de robustez y sesgos: util para estudiar como un ajuste fino sobre un modelo de 70B altera sesgos, alucinaciones o estilo de respuesta en dominios sensibles (por ejemplo, informacion regulatoria).
- Despliegue interno con vLLM o TGI: cargando el modelo base y el adaptador en un servidor con GPUs de 80 GB, se puede servir como endpoint interno para pruebas controladas, no para produccion sin validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluacion alguna (MMLU, HumanEval, GSM8K u otras) ni comparacion con el modelo base.

## Requisitos de hardware

- VRAM para el modelo base en BF16/FP16: aproximadamente 140 GB de pesos, mas memoria para el adaptador (1,7 GB) y para el KV cache. En la practica, se necesitan 2 GPUs de 80 GB (A100, H100) o 4 GPUs de 48 GB para inferencia comoda con contexto largo.
- VRAM con cuantizacion INT8: alrededor de 70-75 GB, posible en una unica A100/H100 de 80 GB.
- VRAM con cuantizacion INT4/GGUF: aproximadamente 40-45 GB, posible en 2x RTX 4090 (24 GB cada una) o en una RTX 6000 Ada de 48 GB, con perdida de calidad no evaluada.
- GPU consumer: no cabe en una unica GPU consumer de 24 GB ni siquiera en INT4 con contexto amplio; requiere multiples GPUs o cuantizacion agresiva.
- Opciones de despliegue: vLLM y TGI para servidores con adaptadores PEFT; llama.cpp/Ollama solo si se convierte el modelo base a GGUF, ya que el adaptador PEFT no se carga directamente en estos motores sin conversion.
- Latencia y throughput: no disponibles. Como referencia, Llama 3.3 70B en BF16 sobre 2x H100 suele ofrecer decenas de tokens por segundo por peticion, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| believe-it-or-not/cond_chat_mixed... (este) | Adaptador sobre 70B | no disponible (base: 128k) | no disponible | Hugging Face, 0 descargas | Sin model card ni evaluacion |
| Meta-Llama-3.3-70B-Instruct (base) | 70B | 128k | Llama 3.3 Community License | Hugging Face, ampliamente usado | Modelo de referencia con evaluacion publica |
| Llama 3.1 70B Instruct | 70B | 128k | Llama 3.1 Community License | Hugging Face | Generacion anterior, comparable en tamano |
| Qwen2.5 72B Instruct | 72B | 128k | Apache 2.0 (mayoria de variantes) | Hugging Face | Alternativa abierta de tamano similar |

La comparacion con el adaptador es limitada porque no hay datos de rendimiento propios; las alternativas se comparan por tamano y contexto del modelo base.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto, lo que impide validar el adaptador.
- Licencia no declarada: no se puede asumir uso comercial. Ademas, el modelo base Llama 3.3 tiene su propia licencia comunitaria con restricciones (por ejemplo, clausula de 700 millones de usuarios mensuales y politicas de uso aceptable).
- Riesgo de alucinacion: heredado del modelo base y no evaluado tras el ajuste; en dominios regulados (el nombre sugiere FDA) el riesgo es especialmente alto.
- Sesgos: no documentados; el ajuste puede amplificar sesgos presentes en los datos de entrenamiento, que se desconocen.
- Idiomas: no declarados; el comportamiento multilingue del adaptador no esta verificado.
- Contexto: aunque el modelo base soporta 128k tokens, no hay evidencia de que el adaptador mantenga ese rendimiento en contextos largos.
- Reproducibilidad: sin codigo de entrenamiento ni dataset, el resultado no es reproducible.
- Produccion: no recomendado sin una evaluacion propia exhaustiva, pruebas de regresion y revision de licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/cond_chat_mixed_original_augmented_original_actq_pkc_fda_approval-39347a02
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto climatico: https://mlco2.github.io/impact
