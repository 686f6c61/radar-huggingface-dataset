# bishnoiavval/gradient-qg-lora

## Resumen

`gradient-qg-lora` es un adaptador LoRA para el modelo `google/flan-t5-base`, desarrollado por el usuario bishnoiavval en el contexto del proyecto Gradient (repositorio público en GitHub). Su propósito es doble: generar preguntas a partir de un pasaje de texto y responder preguntas a partir de una pregunta y un contexto, tareas conocidas como question generation (QG) y question answering (QA). Se trata de un artefacto experimental de bajo coste, entrenado sobre un subconjunto muy reducido de SQuAD v1.1.

El adaptador no constituye un modelo autónomo: requiere cargar el checkpoint base `google/flan-t5-base` (arquitectura encoder-decoder T5 de aproximadamente 248 millones de parámetros) y aplicar encima los pesos LoRA. El entrenamiento empleó LoRA con rango 8, alpha 16, dropout 0.05 y proyecciones q y v como objetivos, lo que supone en torno al 0,36 % de los parámetros del modelo base. El presupuesto de entrenamiento es mínimo: 1.000 filas de entrenamiento de SQuAD (2.000 ejemplos), una época y una única ejecución.

La relevancia del modelo es limitada y de carácter didáctico o de prototipado. Su interés radica en documentar un flujo completo de ajuste fino eficiente (PEFT) sobre una tarea concreta de procesamiento de lenguaje natural, con métricas de solapamiento reportadas y una licencia compatible con el dataset de origen. No está pensado para producción ni para uso multilingüe: el propio autor indica que solo funciona en inglés y que las preguntas generadas deben tratarse como borradores sujetos a revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer encoder-decoder T5 (google/flan-t5-base) |
| Parametros totales | No disponible (el adaptador LoRA representa ~0,36 % de los parámetros del modelo base; flan-t5-base tiene ~248 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de flan-t5-base; no especificada en la información) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se distribuyen en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | Inglés únicamente (según el autor) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/flan-t5-base`, un transformer encoder-decoder de la familia T5 afinado previamente con instrucciones (FLAN). La contribución del adaptador es un conjunto de matrices de bajo rango insertadas en las proyecciones de query y value de la atención, con rango 8, alpha 16 y dropout 0.05. Esta configuración entrena aproximadamente el 0,36 % de los parámetros del modelo base, lo que permite ajustar la tarea sin modificar los pesos originales y manteniendo un coste computacional muy bajo.

El entrenamiento se realizó sobre SQuAD v1.1 (dataset `rajpurkar/squad`), usando 1.000 filas de entrenamiento que se transformaron en 2.000 ejemplos, durante una sola época y en una única ejecución. El formato de prompt es explícito: `generate question: <passage>` para la generación de preguntas y `answer question: question: <q> context: <passage>` para la respuesta. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa; tampoco se detalla la composición exacta del dataset más allá de su procedencia de SQuAD v1.1.

## Capacidades

- Generación de preguntas (question generation) a partir de un pasaje en inglés, mediante el prompt `generate question: <passage>`.
- Respuesta a preguntas extractivas (question answering) dado un contexto, mediante el prompt `answer question: question: <q> context: <passage>`.
- Ajuste eficiente de parámetros (PEFT/LoRA) sobre un modelo base T5, reutilizable como plantilla para otras tareas de generación.
- Capacidad multilingüe: no disponible; el autor restringe el uso al inglés.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de borradores de preguntas para materiales educativos: dado un pasaje de un temario en inglés, el adaptador produce preguntas candidatas que un docente revisa y edita antes de publicarlas. Es adecuado por su coste mínimo y su enfoque explícito en QG, aunque la calidad requiere supervisión humana.
- Construcción de bancos de preguntas para evaluación de comprensión lectora: a partir de artículos o textos de dominio, se generan preguntas de forma masiva y se filtran manualmente, aprovechando la ventana de contexto del modelo base para pasajes de longitud moderada.
- Prototipado de asistentes de estudio (study buddies): el adaptador puede alternar entre generar preguntas sobre un texto y responderlas con el contexto proporcionado, útil para demos internas de productos de aprendizaje.
- Investigación en PEFT: sirve como referencia reproducible de un ajuste LoRA con hiperparámetros documentados (r=8, alpha=16, dropout 0.05, targets q y v) y métricas de solapamiento reportadas, para comparar configuraciones en tareas de QG.
- Anotación asistida de datasets de QA: el adaptador puede proponer pares pregunta-respuesta sobre pasajes no anotados, que luego se validan y corrigen para ampliar corpus de entrenamiento.
- Pruebas de integración en pipelines de Hugging Face con PEFT: al ser un adaptador pequeño en safetensors, es útil para validar flujos de carga (`PeftModel`) y despliegue ligero en entornos con recursos limitados, sin necesidad de GPUs de gran capacidad.

## Benchmarks y rendimiento

El autor reporta métricas de solapamiento medidas sobre 100 pasajes aleatorios de validación de SQuAD, con múltiples referencias y una única ejecución, comparando el modelo base con el adaptador:

| Metrica | Modelo base (flan-t5-base) | Con adaptador gradient-qg-lora |
|---|---|---|
| ROUGE-L | 43,1 | 45,4 |
| BLEU | 18,1 | 25,0 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El propio autor advierte que las métricas de solapamiento premian la coincidencia de palabras y no la calidad real de las preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de tamaño despreciable; el requisito real lo marca `google/flan-t5-base` (~248 M de parámetros). En fp32 se estiman en torno a 1 GB de pesos; en fp16/bf16, alrededor de 0,5 GB, más el overhead de activaciones y del runtime.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, T4 o superiores funcionan sin problema. No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: carga mediante `transformers` + `peft` (`PeftModel.from_pretrained`), y exportación a GGUF para llama.cpp u Ollama si se fusiona el adaptador con el modelo base. vLLM y TGI son viables con el modelo fusionado, aunque el tamaño no justifica su uso.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gradient-qg-lora | Adaptador LoRA (~0,36 % de flan-t5-base) | No disponible | QG y QA sobre SQuAD en inglés | CC BY-SA 4.0 | Hugging Face (adaptador PEFT) |
| google/flan-t5-base | ~248 M | No disponible en la información | Modelo base instruccional encoder-decoder | Apache 2.0 | Hugging Face |
| Adaptadores QG comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros adaptadores de generación de preguntas directamente comparables en la documentación proporcionada. La comparación más directa es contra el propio modelo base, cuyas métricas de referencia se incluyen en la tabla de benchmarks.

## Limitaciones y advertencias

- Idioma: el autor indica explícitamente que el adaptador funciona únicamente en inglés; no hay soporte multilingüe documentado.
- Presupuesto de entrenamiento reducido: 1.000 filas, una época y una sola ejecución, lo que limita la robustez y la generalización más allá de SQuAD.
- Calidad de las preguntas: el autor recomienda usar las preguntas generadas como borradores para revisión por parte de un docente; no deben publicarse sin supervisión.
- Métricas engañosas: ROUGE-L y BLEU miden solapamiento léxico, no corrección gramatical ni pertinencia pedagógica de la pregunta.
- Riesgo de alucinación: al ser un modelo T5 pequeño afinado sobre QA extractivo, puede generar respuestas no fundamentadas en el contexto cuando la pregunta queda fuera de la distribución de SQuAD.
- Sesgos: no se documenta ningún análisis de sesgos; SQuAD contiene sesgos propios del corpus de Wikipedia del que procede.
- Licencia: CC BY-SA 4.0, heredada de SQuAD v1.1; implica obligaciones de atribución y compartir igual para obras derivadas, lo que puede condicionar su uso comercial.
- Uso en producción: no recomendado por el propio autor; es un artefacto experimental de un proyecto personal con cero descargas y sin pipeline declarado.
- Contexto: la longitud máxima de contexto no se especifica en la información disponible; conviene verificar los límites de flan-t5-base antes de usarlo con pasajes largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bishnoiavval/gradient-qg-lora
- Proyecto Gradient (repositorio GitHub): https://github.com/avval29/gradient
- Modelo base: https://huggingface.co/google/flan-t5-base
- Dataset SQuAD v1.1: https://huggingface.co/datasets/rajpurkar/squad
