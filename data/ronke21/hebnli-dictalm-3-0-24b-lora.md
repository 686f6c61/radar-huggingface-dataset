# ronke21/hebnli-dictalm-3.0-24b-lora

## Resumen

`ronke21/hebnli-dictalm-3.0-24b-lora` es un adaptador LoRA de inferencia de lenguaje natural (NLI) en hebreo, construido sobre el modelo base `dicta-il/DictaLM-3.0-24B-Thinking`, un modelo de lenguaje de 24 mil millones de parámetros desarrollado por Dicta (Israel). El adaptador resuelve una tarea concreta y acotada: la clasificación de pares premisa-hipótesis en tres clases (implicación, contradicción y neutralidad) sobre el corpus HebNLI, y forma parte de la infraestructura de anotación del benchmark HeRE (Hebrew Relation Extraction).

Su relevancia es metodológica más que de producto: el adaptador es uno de los tres modelos cuyo voto unánime (`agree3`) define las etiquetas plateadas publicadas del corpus HeRE, y generó la señal `finetuned_nli__dictalm24b` sobre el corpus completo. Para investigadores que trabajen en NLI hebreo, extracción de relaciones o generación de datos sintéticos etiquetados, este adaptador ofrece un punto de partida reproducible con métricas publicadas.

El repositorio pesa 0,4 GB (solo los pesos del adaptador, no el modelo base) y se distribuye bajo licencia Apache 2.0, heredada del modelo base. El adaptador es de rango 16 con alpha 32, en bfloat16, aplicado sobre todas las matrices de proyección lineal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer causal `dicta-il/DictaLM-3.0-24B-Thinking` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 24B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en bfloat16) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Parámetros adicionales del adaptador:

| Parametro | Valor |
|---|---|
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Módulos objetivo | todas las matrices de proyección lineal |
| Precisión de entrenamiento | bfloat16 |
| Tarea | NLI de 3 clases (implicación, contradicción, neutral) |
| Etiquetas | היסק (implicación), סתירה (contradicción), ניטרלי (neutral) |
| Prompt | `משפט 1: {premise} משפט 2: {hypothesis}` |

## Arquitectura y entrenamiento

El adaptador se aplica mediante PEFT sobre un transformer causal de 24B parámetros en modo *thinking*. La innovación respecto al modelo base no está en la arquitectura, sino en la formulación de la tarea: el modelo no usa una cabeza de clasificación, sino que se lee la etiqueta del primer token generado entre los tres tokens de etiqueta en hebreo. En el contexto del benchmark HeRE, la puntuación suave se deriva de las log-probabilidades del primer token para cada una de las tres etiquetas, lo que permite obtener distribuciones de probabilidad en lugar de decisiones duras.

El entrenamiento usó una tasa de aprendizaje de 5e-5, tamaño de lote de 16 y hasta 8.000 pasos, conservando el checkpoint con mejor macro-F1 de validación (paso 5.280). Fue una única ejecución con semilla 42. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO en el adaptador (el modelo base sí incorpora modo thinking, pero sus detalles de alineamiento no se especifican aquí).

## Capacidades

- Clasificación NLI en hebreo en tres clases: implicación, contradicción y neutralidad.
- Puntuación probabilística mediante log-probabilidades del primer token de etiqueta, útil para agregación y umbralizado.
- Integración en pipelines de generación de etiquetas plateadas (silver labels) para corpus de extracción de relaciones.
- Participación en esquemas de voto por unanimidad entre modelos (`agree3`) para definir etiquetas de referencia.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo más allá del hebreo.
- El modo thinking del modelo base está disponible por herencia, pero el adaptador está especializado en una tarea de clasificación corta.

## Casos de uso

- Anotación automática de corpus NLI en hebreo: el adaptador clasifica pares premisa-hipótesis con macro-F1 de 0,902 en test, adecuado para preetiquetar grandes volúmenes antes de revisión humana.
- Generación de etiquetas plateadas para extracción de relaciones: se usó para producir la señal `finetuned_nli__dictalm24b` sobre el corpus completo de HeRE, sirviendo como componente de un comité de tres modelos.
- Filtrado de contradicciones en bases de conocimiento: permite detectar pares de afirmaciones incompatibles antes de consolidar tripletas en un grafo de conocimiento hebreo.
- Validación de hipótesis en sistemas de pregunta-respuesta: dado un contexto y una respuesta candidata, el adaptador estima si la respuesta está implicada, es contradictoria o neutral.
- Investigación en NLI semítica: punto de comparación reproducible para estudiar el rendimiento de modelos de 24B en hebreo frente a alternativas multilingües.
- Construcción de datasets de entrenamiento: las puntuaciones suaves permiten seleccionar ejemplos de alta confianza para destilar modelos más pequeños.
- Evaluación de robustez lingüística: al operar sobre un modelo base con modo thinking, permite analizar si el razonamiento explícito mejora la clasificación NLI en hebreo.

## Benchmarks y rendimiento

| Modelo / configuración | HebNLI dev macro-F1 | HebNLI test macro-F1 | HeRE gold validation F1 |
|---|---|---|---|
| DictaLM-3.0-24B (Thinking) + LoRA HebNLI | 0,876 | 0,902 | 0,861 (Strategy 2, hipótesis de plantilla) |

No se han publicado en la información disponible resultados comparativos con otros modelos en las mismas métricas.

## Requisitos de hardware

- El adaptador en sí ocupa 0,4 GB, pero requiere cargar el modelo base de 24B parámetros en bfloat16, lo que implica aproximadamente 48 GB de VRAM solo para pesos.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU con suficiente memoria agregada.
- En GPUs de consumo (RTX 4090 de 24 GB) no cabe en bfloat16; sería necesaria cuantización del modelo base (no documentada para este adaptador) o descarga parcial por capas.
- Opciones de despliegue: `transformers` + `peft` según el ejemplo de la model card; vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ronke21/hebnli-dictalm-3.0-24b-lora` | 24B (base) + LoRA r16 | no disponible | NLI hebreo 3 clases | Apache 2.0 | Hugging Face |
| `dicta-il/DictaLM-3.0-24B-Thinking` | 24B | no disponible | LLM general hebreo/inglés | Apache 2.0 | Hugging Face |
| Alternativas NLI hebreas específicas | no disponible | no disponible | NLI hebreo | no disponible | no disponible |

No se dispone en la información proporcionada de otros adaptadores NLI hebreos comparables con métricas publicadas en HebNLI.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo; no se ha validado su comportamiento en otros idiomas.
- Diseñado para una única tarea (NLI de 3 clases); no es un modelo de propósito general ni un chatbot.
- El prompt debe respetar el formato exacto `משפט 1: {premise} משפט 2: {hypothesis}`; desviaciones pueden degradar el rendimiento.
- La etiqueta se lee del primer token generado; cambios en la tokenización o en el modelo base pueden invalidar la lectura de etiquetas.
- Riesgo de alucinación y de calibración deficiente en pares ambiguos o con negación compleja, propio de la formulación generativa de la tarea.
- Entrenamiento con una sola semilla (42) y una sola ejecución; no hay estimación de varianza entre semillas.
- El uso comercial está permitido por Apache 2.0, pero requiere aceptar los términos del modelo base `dicta-il/DictaLM-3.0-24B-Thinking`.
- El adaptador no incluye el modelo base; el despliegue exige descargar 24B parámetros adicionales.
- No hay información sobre sesgos específicos del adaptador ni sobre evaluación de robustez ante dominios distintos de HebNLI.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/ronke21/hebnli-dictalm-3.0-24b-lora
- Modelo base: https://huggingface.co/dicta-il/DictaLM-3.0-24B-Thinking
- Dataset HeRE: https://huggingface.co/datasets/ronke21/HeRE
- Código HeRE: https://github.com/Ronke21/HeRE
- Repositorio HebNLI: https://github.com/NNLP-IL/HebNLI
- Paper HeRE (ACL Anthology): https://aclanthology.org/2026.aacl-long.237/
- DOI del paper: https://doi.org/10.18653/2026.aacl-long.237
