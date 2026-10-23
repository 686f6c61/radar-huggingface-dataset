# praiselab-picuslab/benchmark-slm-msmarco-qwen2.5-1.5b-ft

## Resumen

`benchmark-slm-msmarco-qwen2.5-1.5b-ft` es un adaptador LoRA publicado con la librería PEFT por el colectivo `praiselab-picuslab`, obtenido mediante fine-tuning supervisado (etiqueta `strategy-ft`) del modelo base Qwen2.5-1.5B sobre el dataset `microsoft/ms_marco`. Forma parte de una familia de artefactos etiquetados como `benchmark-slm`, cuyo propósito aparente es comparar el comportamiento de modelos de lenguaje pequeños (SLM) bajo distintas estrategias de entrenamiento y distintos corpus. El adaptador está orientado a generación de texto conversacional en inglés.

El interés práctico del artefacto es doble. Por un lado, MS MARCO es un corpus de preguntas reales extraídas de consultas de Bing con respuestas anotadas por humanos y pasajes de apoyo, lo que lo convierte en un banco de pruebas habitual para respuesta a preguntas y recuperación. Por otro, al tratarse de un adaptador sobre un modelo de 1.5B parámetros, permite estudiar la ganancia marginal del fine-tuning en un rango de tamaño desplegable en hardware de consumo.

Conviene señalar de entrada las limitaciones del artefacto como objeto de evaluación: el repositorio ocupa 0,0 GB, no declara licencia, no incluye resultados de benchmarks ni hiperparámetros de entrenamiento, y el acceso está restringido (gated), requiriendo aceptar condiciones en HuggingFace. Es, por tanto, un adaptador experimental de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con adaptador LoRA entrenado mediante PEFT; el repositorio publica únicamente el adaptador, no los pesos completos |
| Parametros totales | 1,5 B aproximadamente en el modelo base Qwen2.5-1.5B; número de parámetros entrenables del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (heredado); configuración de contexto empleada durante el fine-tuning: no disponible |
| Tipos de cuantizacion | el adaptador se publica en safetensors sin cuantizar; no se distribuyen artefactos GGUF, AWQ ni GPTQ de este fine-tune (el modelo base sí admite cuantización, pero requeriría fusión previa del adaptador) |
| Idiomas soportados | inglés (`en`, declarado en la model card); el modelo base es multilingüe, pero el fine-tuning no declara otros idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B, un transformer decoder-only con atención de consultas agrupadas (GQA), activación SwiGLU, normalización RMSNorm y embeddings posicionales rotatorios (RoPE), con un vocabulario de aproximadamente 151.000 tokens. El mecanismo de adaptación es LoRA de PEFT: se congelan los pesos del modelo base y se entrenan matrices de bajo rango inyectadas en las capas de atención y/o MLP. El rango, el alpha, el dropout y las capas objetivo no se documentan en la información disponible.

El entrenamiento se realizó sobre `microsoft/ms_marco` con una estrategia de fine-tuning supervisado (etiqueta `strategy-ft`). No se especifican el número de tokens vistos, la composición exacta del subconjunto empleado (MS MARCO contiene variantes de pasajes, respuestas y ranking), la función de pérdida, si hubo etapas de alineación adicionales (RLHF, DPO u ORPO) ni el hardware utilizado. La etiqueta `or2` presente en el repositorio no está documentada en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base y especializada mediante fine-tuning.
- Respuesta a preguntas del estilo MS MARCO: consultas de usuario con respuesta breve y, potencialmente, respaldo en pasajes.
- Razonamiento y matemáticas básicas: el modelo base Qwen2.5-1.5B los soporta, pero no hay evaluación del efecto del fine-tuning sobre estas capacidades.
- Generación de código: capacidad heredada del modelo base, sin datos de evaluación tras el ajuste.
- Tool calling / function calling: el modelo base Qwen2.5 incorpora soporte de llamadas a funciones y formatos tipo JSON; no se documenta si el adaptador lo preserva.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multilingües: el modelo base cubre decenas de idiomas, pero este adaptador está etiquetado únicamente como inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo base es exclusivamente de texto.

## Casos de uso

- Evaluación comparativa de modelos pequeños: el adaptador sirve como una de las ramas de un banco de pruebas (`benchmark-slm`) frente a otras estrategias de ajuste sobre el mismo corpus, permitiendo medir la ganancia del fine-tuning supervisado sobre Qwen2.5-1.5B en tareas de QA.
- Respuesta a preguntas sobre documentación técnica en inglés: gracias a la ventana de 32.768 tokens del modelo base, se pueden inyectar varios pasajes de referencia y formular la consulta, usando el adaptador como generador de respuesta extractiva o abstractiva.
- Prototipado de asistentes conversacionales de bajo coste: al caber en una GPU de consumo tras cuantización, permite validar flujos multi-turno en inglés antes de escalar a un modelo mayor.
- Generación de datos sintéticos de QA: el adaptador puede producir pares pregunta-respuesta sobre pasajes dados para alimentar pipelines de recuperación o de destilación hacia modelos aún más pequeños.
- Filtrado y reranking de candidatos: en una arquitectura de búsqueda de dos etapas, el modelo puede puntuar o reescribir respuestas candidatas devueltas por un retriever sobre MS MARCO.
- Punto de partida para nuevos ajustes: el adaptador es un artefacto LoRA ligero que se puede fusionar y reajustar sobre dominios específicos con requisitos de cómputo modestos.
- Despliegue en entornos sin GPU: tras fusionar el adaptador con el modelo base y cuantizar a 4 bits, es viable la inferencia en CPU con llama.cpp u Ollama para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MS MARCO (MRR@10, Recall@k, ROUGE, BLEU), ni evaluaciones generales tipo MMLU, HumanEval o GSM8K, ni comparaciones con el modelo base sin ajustar, por lo que no es posible cuantificar la mejora atribuible al fine-tuning.

| Benchmark | Este modelo | Qwen2.5-1.5B base | Observaciones |
|---|---|---|---|
| MS MARCO (QA / ranking) | no disponible | no disponible | no se publican métricas en el repositorio |
| MMLU | no disponible | no disponible | sin evaluación publicada |
| HumanEval | no disponible | no disponible | sin evaluación publicada |
| GSM8K | no disponible | no disponible | sin evaluación publicada |

## Requisitos de hardware

- VRAM para inferencia en fp16: en torno a 3,1 GB solo para los pesos del modelo base, más la caché KV y el adaptador; con 8 GB de VRAM es suficiente para contextos moderados.
- VRAM en cuantización de 4 bits: aproximadamente 1 GB para los pesos, lo que deja margen amplio para caché KV en GPUs pequeñas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores para fp16 con contexto largo; A100 o H100 solo tendrían sentido para servir muchas réplicas o para reentrenamiento.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs con 6 GB o más, y en CPU tras cuantización.
- Opciones de despliegue: vLLM (soporta adaptadores LoRA en caliente), TGI, llama.cpp y Ollama (requieren fusionar el adaptador con el modelo base y convertir a GGUF), además de transformers + PEFT para experimentación.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Nótese que el repositorio declara 0,0 GB, por lo que debe verificarse que los pesos del adaptador estén efectivamente subidos antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `benchmark-slm-msmarco-qwen2.5-1.5b-ft` (este) | 1,5 B + adaptador LoRA | 32.768 (heredado) | no disponible | gated en HuggingFace | sin benchmarks ni model card técnica |
| Qwen2.5-1.5B (base) | 1,5 B | 32.768 | Apache 2.0 | pública | referencia para medir la ganancia del fine-tuning |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 | Apache 2.0 | pública | ajustado por instrucciones; alternativa directa para chat en inglés |
| SmolLM2-1.7B | 1,7 B | 8.192 | Apache 2.0 | pública | familia de SLM con variantes base e instruct |
| Gemma 2 2B | 2,6 B | 8.192 | Gemma Terms of Use | pública con aceptación | mayor tamaño y restricciones de uso comercial específicas |

La comparación de rendimiento cuantitativo no está disponible: no existen métricas publicadas de este adaptador frente a las alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas, curvas de entrenamiento ni comparación con el modelo base, por lo que no puede afirmarse que el fine-tuning mejore el rendimiento en QA.
- Sesgos del corpus: MS MARCO se construyó a partir de consultas reales de Bing y de respuestas redactadas por anotadores, lo que introduce sesgos de dominio (web en inglés), de distribución de consultas y de estilo de respuesta.
- Riesgo de alucinación: como cualquier modelo generativo de 1,5B, puede producir respuestas plausibles sin respaldo en los pasajes; el ajuste sobre MS MARCO puede además favorecer respuestas cortas o evasivas del tipo "no hay respuesta".
- Limitación de idioma: el adaptador está etiquetado solo en inglés; su comportamiento en castellano no está garantizado ni evaluado.
- Licencia no disponible: no puede asumirse permiso de uso comercial; combinado con el acceso restringido (gated), es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Repositorio de 0,0 GB: existe el riesgo de que los pesos del adaptador no estén publicados o estén incompletos; conviene verificar la lista de ficheros tras aceptar las condiciones.
- Es un adaptador, no un modelo autónomo: requiere descargar Qwen2.5-1.5B y aplicar PEFT o fusionar los pesos, lo que añade un paso de ingeniería y posibles incompatibilidades de versión.
- Sin información de hiperparámetros ni de datos exactos de entrenamiento: la reproducibilidad es nula con la documentación actual.
- Fechas del repositorio (creación y actualización en octubre de 2026) y ausencia de descargas o likes: artefacto muy reciente y sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-qwen2.5-1.5b-ft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/microsoft/ms_marco
- Librería PEFT: https://github.com/huggingface/peft
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
