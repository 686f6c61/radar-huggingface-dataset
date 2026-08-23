# Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-RAG-LoRA

## Resumen

`Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-RAG-LoRA` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen2.5-7B-Instruct` para la generación de programas FinQA a partir de contexto financiero recuperado mediante un sistema RAG. El autor, Mark Paul Rosenthal (alias Mr-Rosen), lo publica como parte de un estudio comparativo de seis métodos (RAG, LoRA, QLoRA y combinaciones híbridas) para responder preguntas financieras con razonamiento numérico en entornos de producción con recursos limitados.

El adaptador no es un modelo autónomo: requiere obligatoriamente el sistema de recuperación y el prompt específico publicados en el repositorio asociado. Según los resultados oficiales, alcanza una exactitud de ejecución del 58,33 % y una exactitud de programa del 54,58 % en el conjunto de test de FinQA, con una latencia media de 0,0531 segundos por ejemplo y un coste de entrenamiento de aproximadamente 3,25 dólares. La relevancia de esta ficha radica en que documenta un enfoque práctico y de bajo coste para el ajuste fino de modelos financieros, donde la calidad de la recuperación es tan crítica como la del generador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `Qwen/Qwen2.5-7B-Instruct` (transformer decoder-only, causal LM) |
| Parametros totales | Modelo base: 7 000 millones; adaptador LoRA: no especificado (repositorio de 0,6 GB) |
| Parametros activos | No aplica (no es MoE; todos los parámetros del modelo base están activos) |
| Longitud de contexto | Hasta 128 000 tokens (modelo base Qwen2.5-7B-Instruct); el adaptador no modifica la ventana |
| Tipos de cuantizacion | No especificados para el adaptador; el modelo base puede cargarse en bfloat16 o cuantizado (4-bit/8-bit) |
| Idiomas soportados | No disponible en la model card; el adaptador se entrena con datos FinQA en inglés, el modelo base soporta múltiples idiomas |
| Licencia | MIT (adaptador); Apache 2.0 (modelo base Qwen2.5-7B-Instruct); CC BY 4.0 (dataset derivado de FinQA) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con la técnica LoRA (Low-Rank Adaptation) sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. La configuración del adaptador es: `rank=64`, `alpha=32`, `dropout=0.05`, `bias=none`, `task_type=CAUSAL_LM`. Los módulos objetivo son las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y las capas del MLP (`gate_proj`, `up_proj`, `down_proj`), lo que cubre prácticamente todos los pesos lineales del transformer.

El entrenamiento se realiza sobre el dataset `Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-Dataset`, que contiene ejemplos del benchmark FinQA formateados como pares de prompt RAG (contexto recuperado + pregunta) y programas FinQA de salida. El tiempo total de entrenamiento fue de 1,7182 horas con un coste estimado de 3,25 dólares, seleccionando el checkpoint `epoch_2_adapter`. No se menciona el uso de RLHF ni DPO; el ajuste es un fine-tuning supervisado estándar.

La innovación principal del método es la integración del contexto recuperado directamente en el prompt de entrenamiento. El adaptador es consciente de la recuperación (retrieval-aware): se entrena exclusivamente con el formato `RAG prompt + pregunta + contexto recuperado fijo → programa FinQA`, y no con documentos completos. Esto implica que el rendimiento reportado depende del sistema de recuperación asociado, no del adaptador en aislamiento.

## Capacidades

- Generación de programas FinQA: produce secuencias de operaciones aritméticas (suma, resta, multiplicación, división, etc.) con argumentos numéricos extraídos del contexto financiero, en formato JSON con marcador `EOF`.
- Razonamiento numérico sobre documentos financieros: dado un contexto recuperado y una pregunta, el modelo genera el programa que resuelve la pregunta con exactitud.
- Inferencia determinista: se recomienda generación con `do_sample=False` y `max_new_tokens=256`, lo que da resultados reproducibles.
- Alta tasa de parseo: 99,65 % de los programas generados son sintácticamente válidos para el evaluador FinQA.
- Sin capacidad de tool calling ni agentes: el adaptador no añade funciones de llamada a herramientas ni razonamiento multi-paso fuera del formato FinQA.
- Multilingüismo limitado: el adaptador está entrenado solo con datos en inglés; el modelo base Qwen2.5-7B-Instruct soporta otros idiomas, pero el adaptador no se ha validado en ellos.

## Casos de uso

- **Preguntas y respuestas financieras sobre informes anuales**: el modelo puede responder preguntas numéricas concretas (p. ej., "¿cuál es la variación del beneficio neto entre 2020 y 2021?") generando programas que se ejecutan sobre los datos recuperados del informe.
- **Automatización de análisis de estados financieros**: integrado en un pipeline RAG, permite extraer métricas clave de documentos largos sin necesidad de procesar el documento completo, reduciendo costes de cómputo y latencia.
- **Verificación de cifras en informes de auditoría**: el modelo genera programas que pueden ejecutarse para validar cálculos presentados en informes, ayudando a detectar inconsistencias.
- **Asistentes de inversión con contexto recuperado**: en una plataforma de análisis, el modelo responde a consultas de inversores con razonamiento numérico basado en los fragmentos más relevantes de los informes recuperados.
- **Generación de programas de cálculo en pipelines de datos**: el adaptador puede usarse como componente de un sistema que convierte preguntas en lenguaje natural en programas ejecutables para motores de cálculo financiero.
- **Investigación en métodos de RAG y LoRA**: sirve como punto de referencia para comparar estrategias de ajuste fino de bajo coste en dominios numéricos, ya que el estudio publica el pipeline completo y los resultados de seis métodos.

## Benchmarks y rendimiento

El adaptador se evalúa en el conjunto de test de FinQA con el sistema de recuperación y el prompt oficiales. Los resultados reportados son:

| Metrica | Valor |
|---|---|
| Execution Accuracy | 58,33 % |
| Program Accuracy | 54,58 % |
| Parse Success | 99,65 % |
| Average Latency | 0,0531 s/ejemplo |
| Practical Score | 0,4138 |

No se han publicado resultados comparativos con otros modelos en la información proporcionada, salvo la mención de que este método obtuvo la puntuación práctica más alta en el estudio de seis métodos. La comparativa con otros sistemas (p. ej., rLLM-FinQA-4B) no se detalla en la model card.

## Requisitos de hardware

- VRAM estimada: el modelo base de 7B parámetros en bfloat16 requiere aproximadamente 14-16 GB de VRAM para inferencia; con cuantización 4-bit (p. ej., GPTQ o AWQ) puede reducirse a ~6-8 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o superiores; A100/H100 para despliegue multi-usuario o con mayor throughput.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 puede ejecutar el modelo base en bfloat16 con el adaptador cargado; una RTX 3060/4070 con cuantización 4-bit es viable.
- Opciones de despliegue: `transformers` + `peft` (como en el ejemplo de la model card), vLLM (soporta adaptadores LoRA en producción), llama.cpp y Ollama (si se fusiona el adaptador con el base y se cuantiza).
- Latencia: la latencia media reportada es de 0,0531 s/ejemplo en el hardware del autor, con generación determinista de hasta 256 tokens; en hardware consumer puede ser de 0,1-0,3 s/ejemplo.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Execution Accuracy | Licencia |
|---|---|---|---|---|---|
| **Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-RAG-LoRA** | Qwen2.5-7B-Instruct | 7B (base) | 128K | 58,33 % | MIT (adaptador) |
| **rLLM-FinQA-4B** | no disponible | 4B | no disponible | no disponible | no disponible |
| **Qwen2.5-7B-Instruct (sin adaptador)** | Qwen2.5-7B | 7B | 128K | no evaluado en FinQA | Apache 2.0 |

La comparativa con `rLLM-FinQA-4B` no es posible con los datos disponibles: no se reporta su exactitud en FinQA ni su configuración. El adaptador de Mr-Rosen destaca por su bajo coste de entrenamiento y por la integración explícita del contexto recuperado, mientras que el modelo base sin ajustar no está especializado en la generación de programas FinQA.

## Limitaciones y advertencias

- El adaptador es dependiente del sistema de recuperación: el rendimiento reportado solo se obtiene con los artefactos de recuperación específicos (`long_test_interleaved_plus_SORTED_retrieved.json`) y el prompt `RAG_BASELINE_L1_top3_adapted`. Cualquier cambio en la recuperación, el orden de los chunks o el formato del prompt invalida el método.
- No funciona con documentos completos: no fue entrenado para procesar el documento FinQA completo; suministrar el documento expandido no reproduce el resultado oficial.
- Riesgo de alucinación numérica: como cualquier LLM, puede generar programas sintácticamente válidos pero numéricamente incorrectos si el contexto recuperado no contiene los datos necesarios.
- Sesgo del dominio: entrenado exclusivamente con datos FinQA (informes financieros en inglés), puede no generalizar a otros dominios numéricos o a otros idiomas.
- Restricciones de licencia: el adaptador es MIT, pero el modelo base `Qwen2.5-7B-Instruct` está bajo Apache 2.0 y el dataset derivado bajo CC BY 4.0; el uso comercial requiere cumplir las condiciones de ambas licencias.
- Sin soporte de tool calling ni agentes: no es adecuado para escenarios que requieran interacción con APIs o razonamiento multi-paso más allá del formato FinQA.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-RAG-LoRA
- Repositorio de investigación (retrieval, prompts, evaluator): https://github.com/MarkPaulRosenthal/Accuracy-Is-Not-Enough-Practical-Financial-QA
- Dataset de entrenamiento: https://huggingface.co/datasets/Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-Dataset
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo alternativo rLLM-FinQA-4B: https://huggingface.co/rLLM/rLLM-FinQA-4B
