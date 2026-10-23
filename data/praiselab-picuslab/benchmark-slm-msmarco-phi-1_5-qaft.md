# praiselab-picuslab/benchmark-slm-msmarco-phi-1_5-qaft

## Resumen

Este repositorio contiene un adaptador LoRA (librería `peft`) publicado por la organización praiselab-picuslab sobre el modelo base `microsoft/phi-1_5`. Por sus etiquetas (`benchmark-slm`, `dataset-msmarco`, `strategy-qaft`, `or2`) se trata de un artefacto de evaluación —no de un modelo listo para producción— orientado a medir el comportamiento de modelos de lenguaje pequeños (SLM) tras un ajuste supervisado sobre el conjunto de datos MS MARCO de Microsoft.

El modelo base, phi-1.5, es un transformer decoder-only de 1.300 millones de parámetros con 2.048 tokens de contexto, publicado por Microsoft Research en 2023 bajo licencia MIT y entrenado con aproximadamente 30.000 millones de tokens de datos de calidad tipo libro de texto y datos sintéticos. El adaptador no altera esa arquitectura: añade pesos LoRA de bajo rango que especializan el modelo en la distribución de MS MARCO, un corpus de consultas y pasajes extraídos de Bing.

La relevancia del repositorio es acotada y experimental. En el momento de la consulta acumula 0 descargas y 0 "me gusta", el tamaño del repositorio aparece como 0,0 GB, el acceso está restringido (gated, requiere aceptar condiciones en HuggingFace), la licencia del adaptador no se especifica y no se incluye tarjeta de modelo con resultados. Debe tratarse, por tanto, como una pieza de benchmarking reproducible más que como un componente desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base `microsoft/phi-1_5` |
| Parámetros totales | 1.300 millones en el modelo base; número de parámetros del adaptador no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (heredada del modelo base); no se documenta ampliación |
| Tipos de cuantización | no disponible en el repositorio; al ser LoRA puede fusionarse con el modelo base y cuantizarse a 8 o 4 bits con herramientas estándar (bitsandbytes, GPTQ, GGUF) |
| Idiomas soportados | inglés (etiqueta `en`) |
| Licencia | del adaptador: no disponible; del modelo base phi-1.5: MIT |
| Formato de pesos | safetensors (adaptador LoRA, librería `peft`) |
| Dataset de ajuste | `microsoft/ms_marco` |
| Estrategia de ajuste | `qaft` (según etiqueta `strategy-qaft`); detalles no documentados |
| Hiperparámetros de LoRA | no disponible (rango, alpha y módulos objetivo no publicados) |
| Tamaño del repositorio | 0,0 GB |
| Acceso | restringido (gated) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-23 |

## Arquitectura y entrenamiento

El modelo base phi-1.5 es un transformer decoder-only de 1.300 millones de parámetros con 2.048 tokens de posición, entrenado por Microsoft Research sobre unos 30.000 millones de tokens de datos filtrados de "calidad de libro de texto" combinados con ejercicios y textos sintéticos generados. Es un modelo de lenguaje base: no consta que se le aplicase RLHF, DPO ni ajuste por instrucciones, por lo que no sigue instrucciones de forma fiable sin un ajuste posterior.

Sobre esa base, este repositorio aplica un ajuste tipo LoRA (PEFT) utilizando el corpus MS MARCO, compuesto por consultas reales de Bing y pasajes de documentos web con anotaciones de relevancia. La etiqueta `strategy-qaft` sugiere una estrategia de ajuste consciente de la cuantización, pero la información disponible no documenta ni el rango LoRA, ni los módulos objetivo, ni la receta de cuantización empleada, ni el número de pasos o épocas. Tampoco se especifica si los pesos del adaptador llegaron a subirse al repositorio (el tamaño reportado de 0,0 GB es consistente con un repositorio vacío o con punteros LFS sin resolver).

## Capacidades

- Generación de texto en inglés sobre el modelo base phi-1.5, con razonamiento básico y matemáticas elementales.
- Generación de código sencillo, capacidad heredada de phi-1.5 pero limitada en comparación con phi-1.
- Respuesta a preguntas sobre pasajes: el ajuste con MS MARCO especializa el adaptador en la distribución de consultas y documentos de ese corpus.
- Condicionamiento por contexto: puede concatenar un pasaje y una consulta en el prompt para producir una respuesta extractiva o resumida.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Multilingüismo: no. El repositorio declara únicamente inglés.
- Sin capacidades de visión, audio, modo "thinking" ni decodificación especulativa documentada.

## Casos de uso

- Evaluación comparativa de SLM en MS MARCO: el adaptador sirve como punto de medida para estudiar cómo rinde phi-1.5 tras un ajuste LoRA sobre una tarea de question answering con pasajes, frente a otras estrategias de fine-tuning.
- Reproducción de experimentos de PEFT: permite replicar y auditar la receta `qaft` sobre un modelo de 1,3B, un tamaño manejable en una sola GPU consumer.
- Estudio de ajuste consciente de cuantización: útil para analizar la pérdida de calidad al fusionar el adaptador con el modelo base y cuantizarlo a 8 o 4 bits en tareas de QA.
- Prototipado de QA extractivo en inglés: con prompts que incluyan el pasaje y la consulta, puede generar respuestas cortas en un pipeline de recuperación + lectura, siempre que el contexto quepa en 2.048 tokens.
- RAG ligero en entornos con VRAM reducida: alocupar aproximadamente 2,6 GB en FP16 tras fusionar el adaptador, es viable en GPUs de gama baja para demos y pruebas de concepto en inglés.
- Docencia e investigación sobre LoRA: repositorio de tamaño mínimo y propósito explícito de benchmark, adecuado como ejemplo didáctico de adaptadores PEFT y de evaluación sobre datasets de retrieval.
- Ablaciones de datos de entrenamiento: al estar ajustado sobre MS MARCO, permite contrastar el efecto de ese corpus frente a otros datasets de QA en modelos de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MS MARCO (MRR@10, Recall@k, EM, F1), ni resultados en MMLU, HumanEval o GSM8K, ni comparaciones con el modelo base sin ajustar.

## Requisitos de hardware

- VRAM estimada en FP16 tras fusionar el adaptador: aproximadamente 2,6 GB solo para pesos; en torno a 4 GB contando caché KV y activaciones con 2.048 tokens de contexto (estimación).
- VRAM estimada en 8 bits: aproximadamente 1,3-1,8 GB; en 4 bits: aproximadamente 0,9-1,2 GB (estimación, depende de la herramienta).
- GPU recomendadas: cualquier GPU con 6 GB o más para FP16; RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores con margen amplio. A100/H100 no aportan ventaja relevante a este tamaño salvo por agregación de peticiones.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 2060 Super y modelos con 8 GB o más; en 4 bits puede ejecutarse en GPUs de 4 GB.
- Despliegue: Transformers + PEFT para cargar el adaptador; vLLM o TGI tras fusionar los pesos; llama.cpp u Ollama requieren convertir el modelo fusionado a GGUF.
- Inferencia en CPU: viable con llama.cpp usando cuantizaciones Q4_K_M o Q5_K_M, con velocidad dependiente del hardware.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| benchmark-slm-msmarco-phi-1_5-qaft | 1,3B (base) + LoRA | 2.048 | adaptador: no disponible | Adaptador de benchmark sobre phi-1.5 |
| microsoft/phi-1_5 | 1,3B | 2.048 | MIT | Modelo base, sin ajuste por instrucciones |
| microsoft/phi-2 | 2,7B | 2.048 | MIT | Modelo base de la misma familia |
| Qwen2.5-1.5B | 1,5B | 32.768 | Apache 2.0 | Modelo base e instruct, multilingüe |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Modelo base y variante chat |

La comparación de rendimiento no puede establecerse con los datos disponibles: el adaptador no publica métricas y su dominio (MS MARCO) no es directamente comparable con las evaluaciones generalistas de los modelos de la tabla. En la práctica, para tareas generales en inglés resultan más adecuadas alternativas como Qwen2.5-1.5B o TinyLlama, con contextos mayores en el primer caso y licencias permisivas explícitas en ambos.

## Limitaciones y advertencias

- Artefacto de benchmark, no producto: no hay tarjeta de modelo, métricas ni guía de uso; 0 descargas y 0 likes en el momento de la consulta.
- Licencia del adaptador no disponible: impide determinar si el uso comercial está permitido, pese a que el modelo base sea MIT. Verificar antes de cualquier despliegue.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que añade fricción a la reproducibilidad.
- Posible ausencia de pesos: el tamaño del repositorio aparece como 0,0 GB; conviene comprobar si los safetensors del adaptador están realmente subidos.
- Metadatos atípicos: la fecha de creación (2026-10-23) y las etiquetas `or2` y `qaft` no están explicadas en la información disponible.
- Solo inglés: no apto para producción en castellano u otros idiomas sin un ajuste adicional.
- Contexto de 2.048 tokens: insuficiente para RAG con pasajes largos o conversaciones multi-turno extensas.
- Riesgo de alucinación: phi-1.5 es un modelo base sin alineación; el informe técnico de Microsoft documenta tendencia a inventar hechos, especialmente en preguntas factuales.
- Sin ajuste por instrucciones: no sigue instrucciones complejas de forma fiable; requiere prompts muy estructurados o un ajuste instruct previo.
- Sesgos del corpus: MS MARCO proviene de consultas de Bing y de pasajes web, con los sesgos y la distribución temporal de esa fuente.
- Sin datos de evaluación: no es posible estimar su calidad real en MS MARCO ni compararla con el modelo base sin ajustar.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-phi-1_5-qaft
- Modelo base phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset MS MARCO: https://huggingface.co/datasets/microsoft/ms_marco
- Informe técnico de phi-1.5 ("Textbooks Are All You Need II"): https://arxiv.org/abs/2309.05463
- Librería PEFT: https://github.com/huggingface/peft
