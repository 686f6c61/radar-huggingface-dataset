# praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-ctxq

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-ctxq` es un adaptador LoRA (PEFT) entrenado sobre `google/gemma-2-2b` en el marco de un banco de pruebas interno de modelos de lenguaje pequenos ("benchmark-slm"), utilizando el conjunto de datos `microsoft/ms_marco` y una estrategia de contexto etiquetada como `ctxq` (y un ajuste adicional etiquetado como `or2`, ambos sin documentar en la informacion disponible). No se trata, por tanto, de un modelo de proposito general publicado con memoria tecnica, sino de un artefacto experimental orientado a evaluar el comportamiento del modelo base en tareas de recuperacion y respuesta sobre MS MARCO.

El modelo subyacente, Gemma 2 2B, es un transformer decoder-only de 2,6 mil millones de parametros desarrollado por Google DeepMind, con 8192 tokens de contexto, atencion con ventana deslizante alternada y destilacion de conocimiento desde modelos Gemma 2 mayores. El adaptador anade sobre esa base un ajuste de bajo rango cuyo rango, alpha, tasa de aprendizaje y numero de pasos no se especifican en la ficha de HuggingFace.

La relevancia de esta publicacion es acotada y de caracter metodologico: sirve como referencia reproducible de un punto concreto de un benchmark de SLM (modelos pequenos) sobre un corpus de busqueda web en ingles. Su acceso esta restringido (gated), no declara licencia propia y no incluye resultados de evaluacion, por lo que no esta pensada para uso en produccion tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador LoRA de PEFT sobre `google/gemma-2-2b` |
| Parametros totales | 2,6 mil millones en el modelo base; el adaptador LoRA anade un numero de parametros no especificado (repositorio de 0,1 GB) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | 8192 tokens (heredada del modelo base) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (precision no declarada). Para el modelo fusionado no se documenta ninguna cuantizacion publicada; al estar basado en Gemma 2 es compatible con las conversiones habituales a GGUF, GPTQ o AWQ, aunque no se proporcionan artefactos de este tipo |
| Idiomas soportados | Ingles (`en`) segun la ficha; el modelo base Gemma 2 es multilingue, pero el ajuste se ha realizado sobre un corpus en ingles |
| Licencia | No disponible en la ficha del repositorio; el modelo base se distribuye bajo los Terminos de Uso de Gemma |
| Formato de pesos | `safetensors` con configuracion PEFT/LoRA (requiere cargar el modelo base por separado) |

## Arquitectura y entrenamiento

El modelo base Gemma 2 2B es un transformer decoder-only de 26 capas, dimension oculta de 2304, 8 cabezas de atencion y 4 cabezas de clave/valor (GQA), con un vocabulario de aproximadamente 256 000 tokens. Emplea normalizacion RMSNorm, activacion GeGLU, atencion local con ventana deslizante de 4096 tokens alternada con capas de atencion global hasta 8192, y aplica soft-capping a los logits de atencion y a los logits finales. Fue entrenado por Google DeepMind sobre del orden de 2 billones de tokens, con un peso dominante del ingles, y utiliza destilacion de conocimiento desde modelos Gemma 2 de mayor tamano durante el entrenamiento.

Sobre esa base, este repositorio aplica un ajuste supervisado con LoRA (libreria `peft`) usando el dataset `microsoft/ms_marco`. Las etiquetas `strategy-ctxq` y `or2` sugieren variantes metodologicas del benchmark (posiblemente una formulacion de la consulta con contexto y una segunda configuracion de objetivo o de ordenacion), pero no se aporta ninguna descripcion de las mismas. No se documentan hiperparametros de entrenamiento (rango, alpha, dropout, optimizador, epochs, numero de tokens vistos), ni si hubo fases de RLHF o DPO, ni la composicion exacta del subconjunto de MS MARCO utilizado.

## Capacidades

- Generacion de texto en ingles sobre el modelo base Gemma 2 2B, con 8192 tokens de contexto.
- Ajuste especifico sobre `microsoft/ms_marco`: el adaptador esta orientado a tareas de recuperacion de pasajes y respuesta a consultas de busqueda web en ingles.
- Capacidad de operar como componente de un pipeline de recuperacion aumentada (RAG) en fase de generacion o de reformulacion, siempre que se valide su comportamiento.
- Composicion con el modelo base mediante PEFT: el adaptador puede cargarse y descargarse sin modificar los pesos originales, lo que permite comparaciones controladas.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, razonamiento multi-paso con agentes, vision, audio ni modo "thinking" especifico.
- Capacidades multilingues: no evaluadas para este adaptador; el ajuste se limita a datos en ingles.

## Casos de uso

- Evaluacion comparativa de modelos pequenos: el adaptador sirve como un punto de medida reproducible dentro de un benchmark de SLM sobre MS MARCO, permitiendo comparar la estrategia `ctxq` frente a otras variantes del mismo banco de pruebas.
- Investigacion sobre ajuste LoRA: al ser un artefacto de 0,1 GB sobre un base de 2,6 mil millones de parametros, es util para estudiar el efecto del rango y de la formulacion de la consulta en tareas de recuperacion, sin necesidad de reentrenar el modelo completo.
- Prototipado de pipelines RAG en ingles: el modelo puede generar respuestas condicionadas a pasajes recuperados de MS MARCO, con la ventaja de que 8192 tokens de contexto permiten incluir varios pasajes completos.
- Reformulacion y expansion de consultas: en un sistema de busqueda, el adaptador puede probarse para reescribir consultas de usuario antes de pasarlas al recuperador, una aplicacion coherente con el entrenamiento sobre pares consulta-documento.
- Clasificacion y ordenacion de pasajes: uso del modelo como reranker ligero o como generador de etiquetas de relevancia sobre candidatos recuperados, siempre acompanado de una evaluacion propia (el repositorio no publica metricas).
- Docencia y reproduccion de experimentos: por su tamano reducido, es adecuado para cursos y talleres donde se quiera ilustrar el ciclo completo de ajuste PEFT, evaluacion sobre un corpus estandar y publicacion de adaptadores.
- Analisis de sesgos y robustez en recuperacion web: el ajuste sobre MS MARCO permite estudiar como un SLM reproduce o amplifica sesgos presentes en pasajes web en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye metricas de MS MARCO (MRR@10, nDCG@10, Recall@k), ni evaluaciones de MMLU, HumanEval o GSM8K para el adaptador, ni tampoco una comparacion con el modelo base sin ajustar.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16 el modelo base de 2,6 mil millones de parametros ocupa aproximadamente 5,2 GB de pesos, a los que hay que sumar la cache KV (para 8192 tokens, del orden de 1-2 GB adicionales segun lote y configuracion); en cuantizacion de 8 bits, unos 2,6 GB; en 4 bits, entre 1,4 y 1,7 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas puede ejecutar el modelo en fp16 con contexto moderado; para contexto completo de 8192 tokens y lotes mayores se recomienda 16-24 GB (RTX 4090, A10G, L4, A100). El adaptador en si ocupa 0,1 GB y no anade requisitos significativos.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en tarjetas de 8 GB si se usa cuantizacion de 8 o 4 bits.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sin fusionar; vLLM y TGI admiten adaptadores LoRA dinamicos; para llama.cpp u Ollama es necesario fusionar previamente el adaptador con el modelo base y convertir a GGUF. Tambien es posible servir el modelo fusionado con TGI o con un servidor OpenAI-compatible.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador; a titulo orientativo, un modelo de 2,6 mil millones de parametros en una GPU moderna ofrece decenas de tokens por segundo, pero esta cifra no esta verificada en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la documentacion publica de cada modelo base, no de la ficha de este repositorio, que no aporta comparaciones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (Gemma 2 2B + LoRA MS MARCO) | 2,6 mil millones (base) + LoRA | 8192 | No declarada en la ficha; base bajo Terminos de Gemma | Acceso restringido (gated) | Ajuste experimental, sin metricas publicadas |
| google/gemma-2-2b | 2,6 mil millones | 8192 | Terminos de Uso de Gemma | Publico en HuggingFace | Modelo base sin ajustar; referencia obligada para medir la ganancia del adaptador |
| Qwen2.5-1.5B | 1,54 mil millones | 32 768 | Apache 2.0 | Publico | Alternativa mas ligera, licencia permisiva y contexto cuatro veces mayor |
| Llama 3.2 3B | 3,2 mil millones | 131 072 | Licencia de la comunidad de Llama 3.2 | Publico (gated) | Mayor contexto y ecosistema amplio, a costa de mas parametros |
| Phi-3-mini (3,8B) | 3,8 mil millones | 4096 (128 000 en la variante de contexto largo) | MIT | Publico | Buen rendimiento en razonamiento para su tamano, con contexto base menor |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que puede bloquear su uso automatizado en pipelines.
- Licencia no declarada: no se especifica la licencia del adaptador. Aunque el modelo base se rige por los Terminos de Uso de Gemma, la ausencia de licencia explicita impide asumir permisos de uso comercial sobre el ajuste.
- Sin evaluacion publicada: no hay metricas que respalden una mejora sobre el modelo base, por lo que no puede justificarse su adopcion en produccion sin una evaluacion propia.
- Naturaleza experimental: las etiquetas `strategy-ctxq` y `or2` no estan documentadas; se desconoce que formulacion de la tarea se uso y si el adaptador es reutilizable fuera de ese banco de pruebas.
- Sesgo de dominio: el entrenamiento sobre MS MARCO limita su comportamiento a pasajes web en ingles, con la distribucion y los sesgos propios de ese corpus (contenido enciclopedico y de foros, posible sobrerrepresentacion de ciertos temas).
- Idioma: el ajuste se limita al ingles; su uso en castellano no esta validado y probablemente degrade respecto al modelo base.
- Riesgo de alucinacion: como cualquier modelo generativo de 2,6 mil millones de parametros, puede producir contenido no fundamentado, especialmente al responder sobre pasajes recuperados.
- Contexto limitado a 8192 tokens: insuficiente para resumir o razonar sobre documentos muy largos sin tecnicas de troceado.
- Dependencia del base: el adaptador no es autocontenido; requiere descargar `google/gemma-2-2b`, sujeto tambien a sus propias condiciones de acceso.
- Fecha de creacion registrada (23 de octubre de 2026) y ausencia de documentacion adicional: conviene verificar la procedencia y el estado del repositorio antes de reutilizarlo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-ctxq
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Dataset MS MARCO: https://huggingface.co/datasets/microsoft/ms_marco
- Terminos de Uso de Gemma: https://ai.google.dev/gemma/terms
- Paper de Gemma 2: https://arxiv.org/abs/2408.00118
