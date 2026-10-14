# emigar/cs329x-hw1

## Resumen

emigar/cs329x-hw1 es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base google/gemma-2-2b-it. No se trata por tanto de un modelo completo, sino de un conjunto de pesos delta que deben cargarse junto al modelo base mediante la libreria PEFT. El identificador del repositorio (cs329x-hw1) sugiere que se trata de un trabajo de curso academico, y la model card publicada es la plantilla por defecto de HuggingFace sin completar: todos los campos de descripcion, datos de entrenamiento, evaluacion y limitaciones figuran como "[More Information Needed]".

El modelo base, Gemma 2 2B Instruct, es un transformer decoder-only de 2.600 millones de parametros desarrollado por Google DeepMind, con una ventana de contexto de 8.192 tokens y atencion alterna local/global con soft-capping. Al ser un adaptador LoRA, el artefacto publicado ocupa apenas unos megabytes y su comportamiento final depende por completo del modelo base sobre el que se aplica.

La relevancia de esta ficha es limitada: con 8 descargas y 0 likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados, sin datos de entrenamiento y sin evaluacion publicada, el repositorio no ofrece garantias suficientes para un uso en produccion. Se documenta aqui como ejemplo de adaptador DPO de bajo coste sobre un modelo pequeno, util para experimentacion y aprendizaje, no como componente listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer decoder-only (modelo base google/gemma-2-2b-it) |
| Parametros totales | No disponible para el adaptador; el modelo base Gemma 2 2B tiene 2.600 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en el adaptador; el modelo base Gemma 2 2B soporta 8.192 tokens |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors y puede fusionarse con el base para cuantizar a GGUF, int8 o int4 |
| Idiomas soportados | No disponibles (no declarados en el repositorio) |
| Licencia | No disponible (la model card indica "[More Information Needed]"); el modelo base se rige por los terminos de uso de Gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | google/gemma-2-2b-it |
| Metodo de ajuste | DPO sobre adaptador LoRA, entrenado con la libreria TRL |
| Libreria de carga | PEFT (version indicada en la model card: 0.21.2) |
| Tamano del repositorio | 0,0 GB (redondeado por HuggingFace; adaptador de pocos megabytes) |
| Pipeline declarado | text-generation |
| Fecha de creacion | 2026-10-14 (segun la ficha de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del adaptador mas alla de las etiquetas del repositorio: peft, lora, dpo, trl, transformers, text-generation y conversational. Esto indica que se partio de google/gemma-2-2b-it congelado y se entrenaron matrices de bajo rango (LoRA) sobre algunas capas, optimizadas despues mediante DPO, probablemente a partir de un dataset de preferencias del tipo Anthropic HH-RLHF o similar, aunque no se especifica cual. Se desconoce el rango (r), el alpha, el dropout, las capas objetivo, la tasa de aprendizaje, el numero de pasos ni el hardware empleado.

El modelo base Gemma 2 2B, del que hereda todas las capacidades, es un transformer decoder-only con atencion alterna entre capas locales (ventana deslizante de 4.096 tokens) y globales (8.192 tokens), interleaving de atencion y MLP, normalizacion RMSNorm con pre y post-norm, y tecnicas de estabilidad como el soft-capping de logits y de atencion. Emplea un vocabulario de 256.000 tokens y fue entrenado por Google DeepMind sobre aproximadamente 2 billones de tokens, con ajuste posterior mediante SFT y RLHF en la variante -it. No se documenta en el repositorio ninguna innovacion tecnica adicional aportada por el adaptador.

## Capacidades

- Generacion de texto conversacional en la variante instruct del modelo base, con formato de chat y turnos de usuario/asistente.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano de 2.600 millones de parametros del base.
- Generacion de codigo sencillo y explicaciones tecnicas, sin garantias de calidad en tareas complejas.
- Ajuste de estilo y preferencias: al haberse entrenado con DPO, el adaptador modula el tono y la seleccion de respuestas del modelo base segun las preferencias del dataset empleado (no documentado).
- Capacidades multilingues: no declaradas en el repositorio; las hereda del modelo base, que cubre principalmente ingles y un conjunto amplio de idiomas con calidad variable.
- Soporte de tool calling: no declarado ni documentado.
- Soporte de agentes y razonamiento multi-paso: no declarado ni documentado.
- Capacidades multimodales (vision, audio): no disponibles en el modelo base Gemma 2 2B.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Experimentacion academica y aprendizaje de DPO: el repositorio permite reproducir un flujo completo de ajuste por preferencias con PEFT y TRL sobre un modelo de 2.600 millones de parametros, incluyendo la carga del adaptador, la fusion con el base y la comparacion antes/despues. Es su uso mas realista dado el origen del repositorio.
- Pruebas de concepto de ajuste de estilo conversacional: se puede evaluar como cambia el tono del modelo base tras el DPO en un conjunto fijo de prompts, sin coste elevado de computo, ya que el adaptador ocupa pocos megabytes.
- Generacion de texto en local sobre hardware de consumo: fusionando el adaptador con el base y cuantizando a GGUF Q4, el sistema completo cabe en una GPU de 8 GB o en un Mac con memoria unificada, y puede usarse para prototipos de chatbot sin conexion.
- Evaluacion comparativa de tecnicas de alineamiento: sirve como punto de partida para medir el efecto de DPO frente a SFT sobre un mismo modelo base pequeno, usando un conjunto de evaluacion propio.
- Filtrado o reformulacion de texto en castellano: aunque el repositorio no declara idiomas, el base maneja castellano con calidad aceptable en tareas simples; seria necesario validar el comportamiento del adaptador en este idioma antes de cualquier uso real.
- Base para un adaptador posterior con mas datos: al ser un adaptador LoRA independiente, puede combinarse o continuarse con nuevos entrenamientos sin tocar los pesos del modelo base, lo que facilita iteraciones rapidas en un entorno de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Comparativa con modelos similares

Los datos de la columna "Modelo base Gemma 2 2B" y de los modelos alternativos proceden de sus fichas oficiales publicas, no del repositorio analizado. El adaptador no publica metricas propias, por lo que no es posible comparar su rendimiento real.

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| emigar/cs329x-hw1 (adaptador) | No disponible (base de 2,6 B) | No declarado (base de 8.192 tokens) | Adaptador LoRA + DPO | No disponible | No disponible |
| google/gemma-2-2b-it | 2,6 B | 8.192 tokens | Modelo completo instruct | Terminos de uso de Gemma | Metricas publicadas en su ficha oficial |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (ampliable) | Modelo completo instruct | Apache 2.0 (segun su ficha oficial) | Metricas publicadas en su ficha oficial |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens | Modelo completo instruct | Licencia comunitaria de Llama 3.2 | Metricas publicadas en su ficha oficial |

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin rellenar: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto. Cualquier afirmacion sobre su comportamiento es una inferencia a partir del modelo base.
- Sesgos conocidos: no documentados en el repositorio. El modelo base Gemma 2 2B hereda sesgos de sus datos de entrenamiento web, y el DPO puede amplificar sesgos presentes en el dataset de preferencias, que se desconoce.
- Riesgo de alucinacion: elevado, como en cualquier modelo de 2.600 millones de parametros. No hay evaluacion de fidelidad factual publicada.
- Limitacion de contexto: si se usa con el base Gemma 2 2B, la ventana es de 8.192 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idioma: no se declara ningun idioma soportado. El ajuste DPO probablemente se hizo sobre datos en ingles, lo que puede degradar la calidad en castellano respecto al modelo base original.
- Licencia: el repositorio no declara licencia, lo que impide determinar si el uso comercial esta permitido. Ademas, al derivar de Gemma, se heredan los terminos de uso de Gemma y su politica de usos prohibidos.
- Trazabilidad: sin informacion sobre el dataset de preferencias ni el proceso de anotacion, no es posible auditar el comportamiento del adaptador ni reproducir el entrenamiento.
- Madurez: 8 descargas y 0 likes, creado y actualizado con tres segundos de diferencia, sin mantenimiento posterior. No hay garantia de soporte ni de correccion de errores.
- Uso en produccion: no recomendado sin una evaluacion propia exhaustiva, incluida la verificacion de sesgos, alucinaciones y comportamiento en el idioma objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/emigar/cs329x-hw1
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Paper del modelo base Gemma 2: https://arxiv.org/abs/2408.00118
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de DPO: https://arxiv.org/abs/2305.18290
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) sobre emisiones: https://arxiv.org/abs/1910.09700
- Licencia y terminos de uso de Gemma: https://ai.google.dev/gemma/terms
