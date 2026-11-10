# Ashher123/criterion-lens-qwen2.5-1.5b-merged

## Resumen

CriterionLens es un prototipo de investigación publicado por el usuario Ashher123 en Hugging Face, consistente en un ajuste fino del modelo Qwen2.5-1.5B-Instruct mediante un adaptador LoRA que posteriormente se ha fusionado (merged) con los pesos base. El modelo está orientado a una tarea muy concreta: el emparejamiento de evidencia extraída de notas clínicas de pacientes con criterios de elegibilidad de ensayos clínicos (criterion screening). No se trata de un modelo de propósito general, sino de una prueba de concepto con un dominio de aplicación muy delimitado.

La relevancia de esta ficha es limitada: el repositorio no incluye métricas de validación ni de test, no declara idiomas soportados y no ofrece una pipeline definida. El autor indica explícitamente que el adaptador LoRA se entrenó únicamente sobre la partición de entrenamiento y que las métricas de validación se añadirán cuando finalice la evaluación fija. Por tanto, cualquier evaluación de calidad debe considerarse pendiente.

Arquitectónicamente hereda todo del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), con licencia Apache 2.0 y pesos en formato safetensors. El repositorio ocupa 3,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, segun la documentacion oficial de Qwen) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (los pesos se publican en safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con normalización RMSNorm, atención con RoPE y sesgos de atención QKV, tal como corresponde a la familia Qwen2.5. El ajuste se realizó mediante un adaptador LoRA que después se fusionó con los pesos base, de ahí el sufijo "merged" en el identificador del repositorio. No se especifica el rango del adaptador, la tasa de aprendizaje, el número de pasos ni la composición exacta del dataset de entrenamiento.

La información disponible indica únicamente que el adaptador se entrenó sobre la partición de entrenamiento de un conjunto de datos no descrito, y que las métricas de validación se publicarán tras completar la evaluación fija. No hay datos sobre el número de tokens de entrenamiento, la procedencia de las notas clínicas, el esquema de anotación de los criterios de elegibilidad ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO) más allá del ajuste supervisado implícito en el fine-tuning. Tampoco se documenta ninguna innovación técnica destacable.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen2.5-1.5B-Instruct.
- Emparejamiento de evidencia: la capacidad declarada específicamente por el autor es la de relacionar fragmentos de notas clínicas con criterios de elegibilidad de ensayos clínicos.
- Comprensión de lenguaje natural en el dominio clínico-administrativo, limitada a la tarea de cribado de criterios.
- Soporte de tool calling: no disponible en la información proporcionada para este fine-tuning concreto (el modelo base Qwen2.5 lo soporta, pero no se documenta que se haya preservado tras el ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Cribado preliminar de elegibilidad en ensayos clínicos: el modelo puede recibir un criterio de inclusión o exclusión y un fragmento de nota clínica, y devolver si la evidencia respalda o no el cumplimiento. Es el caso de uso para el que fue entrenado, aunque sin métricas publicadas debe tratarse como prototipo de investigación.
- Asistencia a coordinadores de investigación clínica: como herramienta de pre-filtrado que reduzca el volumen de notas que un revisor humano debe examinar, siempre con validación humana posterior.
- Extracción de evidencia documental en pipelines de preprocesamiento: integrado como componente de un sistema mayor que estructure notas clínicas no normalizadas y las contraste con listas de criterios.
- Investigación académica sobre NLP clínico: sirve como línea base reproducible (licencia Apache 2.0, pesos abiertos) para experimentos de evidence grounding en criterios de elegibilidad.
- Prototipado rápido en entornos con recursos limitados: sus 1,5 mil millones de parámetros permiten desplegarlo en una sola GPU de consumo para pruebas de concepto.
- Generación de pares criterio-evidencia para anotación asistida: el modelo puede proponer emparejamientos que luego se revisan y corrigen para construir conjuntos de datos etiquetados.
- Evaluación comparativa de técnicas de fine-tuning con LoRA en dominios especializados, dado que el repositorio documenta la fusión del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las métricas de validación se añadirán tras completar la evaluación fija y que no se incluyen métricas de test.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para los pesos, más overhead de activaciones y caché KV (estimación típica de 4-6 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: en torno a 1,6-2 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 1-1,5 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en muchos casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas con 6 GB o más.
- Opciones de despliegue: vLLM, llama.cpp (requiere conversión a GGUF, no incluida en el repo), Ollama (previa conversión), TGI, transformers con PyTorch.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CriterionLens (este modelo) | 1.543.714.304 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning especializado en cribado de criterios clínicos; sin métricas publicadas |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 mil millones | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | Hugging Face, ampliamente adoptado | Modelo base; propósito general, sin especialización clínica |
| Qwen/Qwen2.5-1.5B | ~1,5 mil millones | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | Hugging Face | Variante base sin instrucciones; misma arquitectura |

No se dispone de información sobre otros fine-tunings comparables específicos para cribado de criterios de elegibilidad clínica en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no es un dispositivo médico y que no debe usarse para tomar decisiones clínicas.
- Ausencia total de métricas de validación y de test: no hay evidencia publicada sobre su precisión, sensibilidad o especificidad en la tarea objetivo.
- El adaptador se entrenó solo sobre la partición de entrenamiento; no se documenta el tamaño ni la procedencia del conjunto de datos, lo que impide evaluar el riesgo de sobreajuste.
- Riesgo de alucinación inherente a un modelo de 1,5 mil millones de parámetros, especialmente en dominios técnicos como la terminología clínica y los criterios de elegibilidad.
- Idiomas soportados no declarados: no se puede asumir un buen rendimiento en castellano ni en otros idiomas distintos del inglés.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo es un prototipo de investigación sin validación regulatoria.
- Sin pipeline definida ni documentación de formato de entrada/salida, lo que dificulta su integración directa en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de revisión por terceros.
- No se documenta si el fine-tuning preserva las capacidades de tool calling del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Ashher123/criterion-lens-qwen2.5-1.5b-merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
