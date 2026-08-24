# AnandHaridas1980/slm125m-live-sft

## Resumen

El modelo `slm125m-live-sft` es un ajuste fino supervisado (SFT) del modelo de lenguaje pequeño `AnandHaridas1980/slm125m-live`, desarrollado por AnandHaridas1980. Con 125,8 millones de parámetros, está especializado en dominios legal y financiero y se ha entrenado para responder preguntas basadas únicamente en un pasaje de contexto proporcionado por el usuario, rechazando responder cuando la información no está presente. La arquitectura es de tipo Llama (transformer decoder) y su contexto máximo es de 1024 tokens.

Este modelo es relevante porque aborda un problema práctico en sistemas de generación aumentada por recuperación (RAG): la alucinación y la falta de control sobre el origen de las respuestas. Tras el SFT, el modelo aprende a emitir respuestas bien formadas y a rechazar preguntas sin respuesta, aunque su precisión en preguntas con respuesta es limitada (21% en el conjunto de evaluación). Se presenta como un componente de bajo coste para filtrado y enrutado de documentos, no como una autoridad final.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 125.848.320 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, se puede cuantizar externamente) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base `slm125m-live` es un transformer estilo Llama preentrenado desde cero sobre texto legal y financiero. El fine-tune se realizó mediante SFT completo (no LoRA) con pérdida calculada únicamente sobre los tokens de la respuesta del asistente. Se utilizaron 2.620 pares de preguntas y respuestas ancladas al contexto, generados con el modelo `gemini-3.6-flash` a partir del propio corpus del modelo base, seguidos de un proceso de deduplicación y descontaminación. El conjunto de datos se compuso de 39,7% de jurisprudencia, 39,8% de informes SEC y 20,6% de contenido educativo web. Las preguntas se repartieron en 50,4% de búsqueda directa (lookup), 28,3% de razonamiento y 21,3% de preguntas sin respuesta en el pasaje. El entrenamiento duró 120 pasos (3 épocas) con un batch global de 65.536 tokens, una tasa de aprendizaje de 3e-5 con decaimiento coseno a 3e-6 y 10 pasos de warmup. Se usó una única GPU L40S durante 3 minutos, con un coste total aproximado de 7 dólares. La pérdida de validación alcanzó su mínimo en el paso 80 (1,1143) y terminó en 1,1449 en el paso 120, lo que sugiere que dos épocas podrían haber sido suficientes.

## Capacidades

- Generación de texto condicionada al contexto: responde preguntas basadas en un pasaje proporcionado.
- Rechazo de preguntas no contestables: emite una negativa cuando la respuesta no está en el pasaje (86,7% de acierto en ese caso).
- Formato de prompt estricto: requiere el formato `<|bos|><|system|>...<|user|>Context: ... Question: ...<|assistant|>` para funcionar correctamente.
- Generación de texto con terminación controlada: emite el token `<|eos|>` al final de la respuesta.
- Capacidades multilingües: no, solo inglés.
- Soporte de tool calling / function calling: no.
- Soporte de agentes y multi-step reasoning: no, solo razonamiento de uno o dos pasos con baja precisión.
- Capacidades especiales: ninguna más allá de la generación condicionada por contexto.

## Casos de uso

- **Filtro de primera pasada en pipelines de RAG**: el modelo puede actuar como un lector barato que rechaza pasajes irrelevantes. Su tasa de rechazo correcta (86,7%) permite enrutar preguntas a otros modelos o a un sistema de verificación, reduciendo el coste de llamadas a modelos grandes.
- **Verificación de respuestas extraídas**: se puede usar para comprobar si una respuesta candidata está realmente respaldada por un pasaje, dado que tiende a decir "no sé" cuando la información no está.
- **Clasificación de preguntas en dominios legal y financiero**: dado un pasaje, el modelo puede indicar si contiene o no la respuesta a una pregunta concreta, ayudando a priorizar documentos en un flujo de revisión.
- **Asistente de consulta en corpus jurídicos**: para juristas que necesitan comprobar rápidamente si una sentencia o normativa menciona un dato específico, sin requerir una respuesta generativa completa.
- **Preprocesamiento de datos para entrenamiento**: como generador de etiquetas de "respuesta presente" o "no presente" en conjuntos de datos de QA, aprovechando su comportamiento de refus.
- **Demostraciones de bajo coste**: al ser un modelo pequeño (125M) y entrenado con presupuesto mínimo, sirve como ejemplo didáctico para experimentar con técnicas de SFT y control de alucinaciones en entornos educativos o de investigación.

## Benchmarks y rendimiento

El autor evaluó el modelo en 200 pares de preguntas reservados (no vistos durante el entrenamiento) con decodificación greedy y evaluación mediante `gemini-3.6-flash` comparando la respuesta con el pasaje fuente. Los resultados se presentan en la siguiente tabla, comparando el modelo base (`slm125m-live`) y el modelo fine-tune (`slm125m-live-sft`).

| Metrica | Base | Fine-tuned |
|---|---|---|
| Correcto (según juez) | 3,0% | 36,0% |
| Fundamentado en el pasaje | 11,5% | 69,5% |
| Alucinado | 88,0% | 30,0% |
| Emite token de stop | 1,7% | 98,3% |
| Rechaza pregunta sin respuesta | 0,0% | 80,0% |
| Rechaza incorrectamente pregunta con respuesta | 0,0% | 2,5% |
| Pérdida de validación (tokens de respuesta) | 2,061 | 1,145 |
| Tokens generados media | 94,7 | 22,6 |

Precisión por tipo de pregunta:

| Tipo | Base | Fine-tuned |
|------|------|------------|
| Búsqueda directa (lookup) | 5,8% | 27,2% |
| Razonamiento (uno o dos pasos) | 0,0% | 9,6% |
| Sin respuesta (correcta es un rechazo) | 0,0% | 86,7% |

El autor advierte que el 36% de "correcto" está inflado por los rechazos. En preguntas con respuesta real, el modelo acierta solo el 21% de las veces. La capacidad de rechazo es el punto fuerte; la capacidad de respuesta es limitada.

## Requisitos de hardware

- **VRAM estimada**: con pesos en bf16, el modelo ocupa aproximadamente 0,25 GB (125,8M parámetros × 2 bytes). Con overhead de inferencia, se recomienda al menos 1 GB de VRAM para uso cómodo.
- **GPU recomendadas**: cualquier GPU con más de 1 GB de VRAM, como una NVIDIA T4, RTX 3060 o superior. No se requiere GPU profesional.
- **Compatibilidad con consumer GPU**: sí, cabe en cualquier GPU de consumo moderna.
- **Opciones de despliegue**: transformers (con `LlamaForCausalLM`), también compatible con text-generation-inference (TGI) y endpoints compatibles según los tags de HuggingFace. No hay indicación de soporte con llama.cpp u Ollama, pero por ser un modelo Llama pequeño podría convertirse a GGUF si se desea.
- **Latencia y throughput**: no se han publicado datos específicos. Dado el tamaño, la inferencia en una GPU consumer es muy rápida, del orden de milisegundos por generación.

## Comparativa con modelos similares

No hay datos suficientes en la información proporcionada para comparar este modelo con otros modelos de la misma categoría (modelos legales/financieros pequeños). El autor menciona un modelo similar `seetha0712/slm125m-live-sft-synthetic`, pero no se dispone de especificaciones detalladas. La comparación más relevante es con el modelo base `slm125m-live`, que ya se muestra en la sección de benchmarks. No se dispone de comparativas con modelos como TinyLlama o modelos legales específicos.

## Limitaciones y advertencias

- **Alucinación**: aunque el SFT reduce la alucinación del 88% al 30%, sigue siendo un riesgo importante. El modelo produce respuestas con apariencia competente pero con frecuencia incorrectas en detalles concretos. Se debe verificar cada cifra, fecha o nombre contra el pasaje fuente.
- **No es RAFT**: el entrenamiento solo incluía un pasaje correcto por ejemplo. No ha visto pasajes irrelevantes, por lo que si se usa detrás de un retriever que devuelve fragmentos mezclados, el modelo opera fuera de distribución.
- **Contexto limitado a 1.024 tokens** incluyendo el pasaje y la pregunta. No soporta contextos largos.
- **Solo una vuelta (single turn)**: no se entrenó conversación multi-turno.
- **Solo inglés y dominios específicos**: entrenado con jurisprudencia estadounidense y archivos SEC. No funciona bien en otros idiomas o dominios.
- **Razonamiento limitado**: precisión del 9,6% en preguntas de razonamiento de uno o dos pasos. No apto para inferencias multi-paso.
- **Evaluación débil**: los resultados fueron juzgados por un modelo de la misma familia que generó los datos de entrenamiento, lo que es un control más débil que un evaluador independiente.
- **Uso en producción**: no se recomienda como servicio de respuesta directa. Es útil solo como componente de filtrado o enrutado, con verificación posterior.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AnandHaridas1980/slm125m-live-sft)
- [Modelo base](https://huggingface.co/AnandHaridas1980/slm125m-live)
- [Modelo similar de otro autor](https://huggingface.co/seetha0712/slm125m-live-sft-synthetic)
- [Repositorio del proyecto](https://github.com/shivamfet/slm125m)
- [Página del proyecto](https://slm125m.vercel.app/)
