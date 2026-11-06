# ProjectGlue/smollm3-dolly-lora

## Resumen

SmolLM3-3B Dolly LoRA es un adaptador LoRA (Low-Rank Adaptation) desarrollado por ProjectGlue sobre el modelo base HuggingFaceTB/SmolLM3-3B, un transformer causal de 3.000 millones de parámetros publicado por Hugging Face. El adaptador se ha entrenado sobre un subconjunto de 500 filas de la categoría `closed_qa` del dataset Databricks Dolly 15k, con el objetivo de mejorar el comportamiento del modelo en tareas de respuesta a preguntas con contexto proporcionado (closed-book QA).

Se trata de un ejercicio formativo y una prueba de concepto, no de un modelo orientado a producción. El propio autor lo declara explícitamente en la model card: el entrenamiento se enmarca en un currículo de aprendizaje estructurado de Hugging Face, con una única época sobre 500 ejemplos y un total de 63 pasos de optimización. El adaptador ocupa un espacio de pesos mínimo (7.667.712 parámetros entrenables, el 0,25 % del total del modelo base) y el repositorio no contiene los pesos del modelo base, solo el adaptador PEFT.

Su relevancia es, por tanto, limitada y de carácter didáctico: sirve como ejemplo reproducible de cómo aplicar PEFT/LoRA a un modelo de 3B con recursos muy modestos (una NVIDIA T4 de 16 GB en Google Colab durante aproximadamente 0,1 horas) y como referencia de formato de adaptadores para SmolLM3. No debe evaluarse como un modelo conversacional generalista ni como una alternativa a fine-tunes de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base SmolLM3-3B) con adaptador LoRA/PEFT |
| Parametros totales | 3B en el modelo base; adaptador con 7.667.712 parametros entrenables (0,25 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base SmolLM3-3B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador aplica LoRA sobre cuatro proyecciones de atención del transformer base: `q_proj`, `k_proj`, `v_proj` y `o_proj`. La configuración empleada es rango 16, alpha 32, dropout 0,05, con un total de 7.667.712 parámetros entrenables. El entrenamiento se realizó en precisión fp16, con batch size 1 y acumulación de gradientes de 8 pasos, learning rate 2e-4 y una sola época sobre 500 ejemplos del subconjunto `closed_qa` de Databricks Dolly 15k. Los datos se formatearon con la plantilla de chat de SmolLM3, incluyendo roles de sistema, usuario y asistente.

El resultado del entrenamiento se limita a 63 pasos de optimización, con una pérdida que descendió de 1,824 a 1,505. No se aplicaron técnicas de alineación adicionales (RLHF, DPO) ni se documenta ninguna innovación arquitectónica propia: el adaptador hereda íntegramente la arquitectura y las capacidades del modelo base SmolLM3-3B, y solo modifica el comportamiento en la tarea concreta de QA cerrado sobre el estilo de Dolly. El entrenamiento se ejecutó en una NVIDIA T4 (16 GB) en Google Colab durante aproximadamente 0,1 horas.

## Capacidades

- Respuesta a preguntas con contexto proporcionado (closed QA) en inglés, especialidad declarada del adaptador.
- Generación de texto conversacional multi-turno en formato chat, heredada del modelo base SmolLM3-3B.
- Formato de chat con roles de sistema, usuario y asistente (plantilla de SmolLM3).
- Capacidades generales del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo) no verificadas ni garantizadas tras el fine-tuning; el adaptador solo se ha entrenado para QA cerrado.
- No se documenta soporte específico de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información proporcionada.

## Casos de uso

- Evaluación didáctica de PEFT/LoRA: el adaptador sirve como ejemplo reproducible de fine-tuning de bajo rango sobre un modelo de 3B, útil para quienes aprenden a aplicar LoRA con la librería `peft` y `transformers`.
- Prototipado de QA cerrado sobre documentos: cargando el modelo base más el adaptador, se puede experimentar con respuestas a preguntas cuya respuesta está contenida en un contexto previo, en inglés y en dominios similares a Dolly.
- Comparación de pipelines de fine-tuning: permite contrastar el efecto de un entrenamiento mínimo (63 pasos, 500 ejemplos) frente al modelo base sin adaptar en tareas de QA.
- Docencia y talleres: adecuado para demostrar el flujo completo de carga de un adaptador PEFT con `PeftModel.from_pretrained` y la plantilla de chat de SmolLM3.
- Pruebas de infraestructura de despliegue: útil para validar integraciones de adaptadores LoRA en servidores de inferencia (por ejemplo, carga de adaptadores sobre el modelo base) en entornos de desarrollo.
- Referencia de formato de model card y configuración de hiperparámetros: el repositorio documenta de forma explícita rango, alpha, módulos objetivo y resultados de pérdida, lo que facilita replicar el experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de entrenamiento (inicial 1,824; final 1,505) tras 63 pasos, que no constituye una evaluación de calidad en tareas downstream.

## Requisitos de hardware

- El adaptador en sí ocupa unos pocos megabytes (7,67 M de parámetros en safetensors); el requisito real lo impone el modelo base SmolLM3-3B.
- VRAM estimada para el modelo base: aproximadamente 6-7 GB en fp16; en torno a 2-3 GB con cuantización de 4 bits (estimación orientativa, no confirmada en la información proporcionada).
- GPU recomendadas: NVIDIA T4 (16 GB) es suficiente para entrenamiento e inferencia del adaptador según el autor; también cabría en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y GPUs de datacenter como A100 o H100 para despliegues de mayor escala.
- Cabe en GPU de consumo con al menos 8 GB de VRAM en fp16, y en GPUs de 4-6 GB con cuantización del modelo base.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor), y potencialmente vLLM o TGI con soporte de adaptadores LoRA sobre el modelo base; llama.cpp/Ollama requerirían convertir el adaptador a GGUF, opción no documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ProjectGlue/smollm3-dolly-lora | 3B (base) + 7,67 M (adaptador) | no disponible | Apache 2.0 | LoRA sobre SmolLM3-3B para closed QA | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM3-3B | 3B | no disponible en esta ficha | Apache 2.0 | Modelo base generalista | Hugging Face, ampliamente utilizado |
| Adaptadores LoRA comunitarios sobre SmolLM3 | 3B (base) + adaptador | no disponible | variable | Fine-tunes de tarea específica | Hugging Face, variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y naturaleza del artefacto.

## Limitaciones y advertencias

- No apto para producción: el autor declara explícitamente que es un ejercicio de aprendizaje y una prueba de concepto.
- Entrenamiento muy limitado: 500 ejemplos, una época y 63 pasos; riesgo alto de sobreajuste al estilo de Dolly y de degradación de capacidades generales del modelo base.
- Solo inglés: el adaptador y el dataset de entrenamiento están en inglés; no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- Especialización estrecha: entrenado únicamente para closed QA; fuera de esa tarea no hay evidencia de mejora y puede haber regresión frente al modelo base.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente si el contexto no contiene la respuesta.
- Sesgos: no se documenta ningún análisis de sesgos; el dataset Dolly tiene sesgos propios de su origen (crowdsourced, en inglés) que el adaptador puede heredar y amplificar.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un adaptador sobre SmolLM3-3B conviene verificar también los términos del modelo base y del dataset Dolly.
- Sin evaluación downstream: no hay benchmarks, evaluaciones humanas ni pruebas de robustez publicadas.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; el tamaño del repo (0,0 GB) confirma que solo contiene el adaptador, no los pesos completos.
- Requiere cargar el modelo base por separado y aplicar la plantilla de chat de SmolLM3; un uso incorrecto del formato puede degradar las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProjectGlue/smollm3-dolly-lora
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset Databricks Dolly 15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Librería PEFT: https://github.com/huggingface/peft
- Librería Transformers: https://github.com/huggingface/transformers
