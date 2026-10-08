# DumbestSetEver/1.1vDumbSetAI_94.5M_beta_ru

## Resumen

DumbSetAI 1.1vDumbSetAI 94.5M_beta_ru es un modelo de lenguaje causal de muy pequeno tamano (94.503.648 parametros, aproximadamente 94,5M) desarrollado por el usuario independiente DumbestSetEver. Se trata de la segunda iteracion de su proyecto personal DumbSetAI, construida a partir del modelo previo de 56M de parametros (1.0vDumbSetAI_56M_ru) mediante ampliacion arquitectonica en lugar de reentrenamiento desde cero. Esta orientado exclusivamente al idioma ruso y se distribuye bajo licencia MIT.

El interes del modelo es mas experimental que productivo: demuestra una estrategia de crecimiento incremental de parametros anadiendo bloques adicionales (Stack) sobre una base ya entrenada. La version 1.0 se entreno con aproximadamente 1800 millones de tokens en total, de los cuales unos 750 millones corresponden a la base. El modelo se encuentra en estado Beta y su propio autor reconoce un comportamiento erratico, con saltos tematicos y degradacion de coherencia en generaciones largas.

La ventana de contexto es de 512 tokens, el vocabulario de 12.000 tokens y requiere cargar codigo personalizado (custom_code) mediante `trust_remote_code=True`, ya que expone una funcion de generacion propia llamada `generate_dumbset`. No cuenta con descargas ni interacciones en el momento de la consulta, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con extension propietaria "Stack" (custom_code) |
| Parametros totales | 94.503.648 (aproximadamente 94,5M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors, ejemplo de carga en float32) |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | DumbestSetEver/1.0vDumbSetAI_56M_ru (fine-tune y ampliacion) |
| Vocabulario | 12.000 tokens |
| Capas | 14 capas base + 12 bloques adicionales (Stack) |
| Cabezas de atencion | 8 |
| Estado | Beta |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de tipo decoder-only con 14 capas base y 8 cabezas de atencion. La innovacion principal es la incorporacion de 12 bloques adicionales denominados "Stack" anadidos sobre la estructura original, lo que eleva el total de parametros de aproximadamente 56,7M a 94,5M (un incremento de unos 37,8M). El tokenizer se mantiene identico al de la version 1.0, con 12.000 tokens y los mismos tokens especiales. El modelo hereda los pesos de la version previa en lugar de partir de inicializacion aleatoria, de modo que gran parte del conocimiento proviene de la base.

El entrenamiento descrito en la model card indica un volumen aproximado de 1800 millones de tokens en total, de los cuales alrededor de 750 millones se destinaron a la base. Posteriormente se realizaron experimentos adicionales de entrenamiento y fine-tune orientado a instrucciones. No se especifica la composicion exacta del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La generacion se expone mediante una funcion personalizada `generate_dumbset` que acepta parametros propios como `max_context_tokens`, `max_answer_tokens`, `temperature`, `top_k` y `repetition_penalty`, lo que implica que no se usa el pipeline estandar de generacion de Transformers de forma directa.

## Capacidades

- Generacion de texto en ruso: produce continuaciones y respuestas conversacionales basicas, aunque con coherencia limitada en textos extensos.
- Respuesta a instrucciones simples: la model card muestra ejemplos de peticiones como pedir un cuento corto o una felicitacion, con resultados parcialmente coherentes al inicio y degradados al final.
- Modelo base de investigacion: util como referencia pedagogica para estudiar ampliacion arquitectonica de modelos pequenos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue: limitada al ruso, sin evidencia de soporte de otros idiomas.
- No dispone de modo "thinking", vision, audio ni capacidades multimodales.
- La generacion pasa por una API propietaria (`generate_dumbset`) en lugar de `model.generate` estandar.

## Casos de uso

- Experimentacion academica con ampliacion de arquitectura: sirve para estudiar como se comporta un modelo al anadir bloques Stack sobre una base ya entrenada, comparando la version 56M con la 94,5M en tareas controladas de perplejidad.
- Investigacion sobre tokenizers de vocabulario reducido: con solo 12.000 tokens, es un caso de estudio sobre eficiencia de vocabulario en lenguas eslavas y su impacto en la calidad de generacion en ruso.
- Prototipado de demos de generacion de texto en ruso: util para pruebas de concepto locales donde el requisito de coherencia es bajo y se prioriza un modelo que quepa en cualquier maquina.
- Benchmarking de tecnicas de fine-tune sobre bases pequenas: dado que existe la version previa documentada, permite comparar estrategias de ajuste y su efecto en la estabilidad de la generacion.
- Generacion de texto creativo experimental en ruso: con temperature y penalizaciones ajustadas, puede producir fragmentos de texto suelto con cierto valor estetico, segun el ejemplo de la propia model card.
- Educacion y formacion en IA: por su tamano (94,5M parametros, 0,4 GB de repositorio), es adecuado como material didactico para explicar el ciclo completo de carga, generacion y limitaciones de un modelo real.
- Pruebas de integracion de custom_code con Transformers: permite validar flujos de trabajo que requieren `trust_remote_code=True` y funciones de generacion no estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandarizada en la model card proporcionada ni en los resultados de busqueda web. El autor solo incluye ejemplos cualitativos de generacion que muestran divagacion tematica y degradacion de coherencia en respuestas de varias frases.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 380 MB en float32 (tamano indicado en el ejemplo de carga con `dtype=torch.float32`); unos 190 MB en float16/bfloat16 si se convierte manualmente; unos 95 MB en int8 y unos 47 MB en int4 teoricos (no se ofrecen pesos cuantizados publicados).
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RTX 4090. Tambien funciona en GPU integradas y aceleradores tipo Apple Silicon.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU dedicada o integrada de los ultimos 10 anos.
- Tambien es viable en CPU: al ser de 94,5M parametros, la inferencia en CPU es perfectamente practica con un solo nucleo moderno.
- Opciones de despliegue: el autor solo documenta Transformers con `trust_remote_code=True` y la funcion `generate_dumbset`. No hay evidencia de soporte para vLLM, llama.cpp, Ollama, TGI ni ningun otro runtime estandar, ya que la arquitectura modificada y el codigo personalizado probablemente lo impiden sin trabajo adicional.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Con esta cantidad de parametros se espera latencia de milisegundos por token en GPU y decenas o cientos de milisegundos por token en CPU, pero son estimaciones no confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1.1vDumbSetAI 94.5M_beta_ru | 94,5M | 512 tokens | Ruso | MIT | HuggingFace (safetensors, custom_code) |
| DumbestSetEver/1.0vDumbSetAI_56M_ru | ~56,7M | No disponible | Ruso | MIT (segun etiqueta del autor) | HuggingFace |
| TinyStories (variantes) | 1M-33M | 512-2048 tokens | Ingles | Mixta/Sin restriccion | HuggingFace, ampliamente replicado |
| GPT-2 small | 124M | 1024 tokens | Ingles | MIT | HuggingFace, soporte universal |

No se dispone de datos de rendimiento comparativos entre estos modelos en benchmarks estandarizados. Las comparativas con TinyStories y GPT-2 small se ofrecen solo como referencia de orden de magnitud en parametros, contexto e idioma, no de calidad.

## Limitaciones y advertencias

- Estado Beta declarado por el propio autor, con comportamiento erratico reconocido y descrito explicitamente ("puede empezar bien y de repente hablar de una obra, un sitio web o un tal Viktor Vladimirovich").
- Coherencia limitada: los ejemplos mostrados en la model card evidencian divagacion tematica y degradacion del sentido a partir de las primeras frases.
- Contexto muy corto: 512 tokens, insuficiente para conversaciones largas, resumen de documentos o tareas de recuperacion. Ademas, la funcion `generate_dumbset` divide explicitamente entre `max_context_tokens` y `max_answer_tokens`, lo que reduce aun mas el margen util.
- Vocabulario reducido: 12.000 tokens limitan la cobertura lexica y la eficiencia de codificacion en ruso.
- Idioma unico: solo ruso. No se documenta ningun otro idioma.
- Riesgo de alucinacion alto: al ser un modelo pequeno con datos de entrenamiento limitados (1800 millones de tokens), la generacion de hechos inexistentes es esperable y no hay mecanismo de mitigacion documentado.
- Sesgos: no se han documentado sesgos especificos, pero al no describirse la composicion del corpus de entrenamiento no es posible evaluar sesgos de genero, etnicos o politicos.
- Licencia MIT: permite uso comercial y modificacion sin restricciones, siempre que se conserve el aviso de copyright. No hay clausulas de uso aceptable adicionales.
- Dependencia de `trust_remote_code=True`: la carga del modelo ejecuta codigo del autor, lo que implica un riesgo de seguridad si no se audita el repositorio antes de usarlo.
- Sin soporte de runtimes estandar: la ausencia de integracion con llama.cpp, vLLM u Ollama complica su despliegue en produccion.
- Ausencia total de benchmarks: no es posible comparar su calidad con otros modelos de forma objetiva.
- Cero traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion externa ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DumbestSetEver/1.1vDumbSetAI_94.5M_beta_ru
- Perfil del autor en HuggingFace: https://huggingface.co/DumbestSetEver
- Modelo base 1.0vDumbSetAI_56M_ru (referenciado): https://huggingface.co/DumbestSetEver/1.0vDumbSetAI_56M_ru
- Modelos etiquetados con "dumbset" en HuggingFace: https://huggingface.co/models?other=dumbset
- Paper o publicacion tecnica: no disponible
- Repositorio de codigo: no disponible
- Demo en linea: no disponible
