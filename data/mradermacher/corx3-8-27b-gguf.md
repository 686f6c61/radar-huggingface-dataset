# mradermacher/CorX3.8-27B-GGUF

## Resumen

CorX3.8-27B es un modelo de lenguaje de 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) desarrollado por el usuario Sigmandndnns, cuya versión original está disponible en HuggingFace bajo el identificador `Sigmandndnns/CorX3.8-27B`. El repositorio que nos ocupa, `mradermacher/CorX3.8-27B-GGUF`, contiene cuantizaciones en formato GGUF realizadas por mradermacher, un conocido cuantizador de la comunidad, para facilitar la ejecución del modelo en entornos con recursos limitados mediante herramientas como llama.cpp, Ollama o text-generation-inference.

El modelo base está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Según la información disponible, el modelo está orientado a tareas conversacionales y de generación de texto en inglés. Sin embargo, la model card del autor original no proporciona detalles sobre arquitectura, datos de entrenamiento ni capacidades específicas, por lo que gran parte de las especificaciones técnicas quedan sin documentar.

La relevancia de esta ficha radica en que, a pesar de la falta de información oficial, el modelo ya cuenta con cuantizaciones listas para usar, lo que permite a desarrolladores e investigadores probarlo rápidamente en hardware de consumo. No obstante, se recomienda precaución: sin datos de entrenamiento ni benchmarks, es difícil evaluar su calidad real frente a alternativas establecidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_S, Q8_0 (archivos GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base (si es un transformer denso, MoE, híbrido, etc.) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). La model card del autor original (`Sigmandndnns/CorX3.8-27B`) no incluye estos detalles. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

Dado que el nombre del modelo incluye "3.8", podría especularse que es una variante de la familia Llama 3.8, pero esto no está confirmado y no debe darse por hecho. La ausencia de datos impide cualquier análisis técnico riguroso.

## Capacidades

No se dispone de una lista oficial de capacidades. Basándose únicamente en el tamaño (26,9B parámetros) y en la etiqueta "conversational" de la model card, se puede inferir que el modelo está diseñado para generación de texto y diálogo, pero no hay evidencia concreta sobre:

- Razonamiento matemático o lógico
- Generación de código
- Soporte de tool calling o function calling
- Capacidades multimodales (visión, audio)
- Modo de pensamiento (thinking mode)

Hasta que el autor publique documentación adicional, cualquier afirmación sobre capacidades específicas sería especulativa.

## Casos de uso

Dada la falta de información sobre el modelo base, no es posible recomendar casos de uso concretos con garantías. Los desarrolladores que deseen experimentar con él deberían:

- Probar el modelo en tareas de generación de texto general y conversación, dado su tamaño y la etiqueta "conversational".
- Evaluar su rendimiento en sus propios conjuntos de datos antes de integrarlo en producción.
- Comparar los resultados con modelos de referencia como Llama 3.1 8B, Mistral 7B o Qwen 2.5 14B, que sí tienen documentación extensa.

Sin benchmarks ni ejemplos de uso, cualquier caso de uso específico (atención al cliente, generación de código, etc.) sería una suposición sin fundamento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo. Tampoco hay comparativas con modelos similares. Se recomienda a los usuarios ejecutar sus propias evaluaciones antes de considerar su uso en entornos críticos.

## Requisitos de hardware

Los requisitos dependen de la cuantización elegida. A partir de los tamaños de archivo proporcionados:

- **Q2_K (10,8 GB)**: requiere al menos 12 GB de VRAM para inferencia con contexto corto. Puede ejecutarse en GPUs de consumo como RTX 3060 12GB o RTX 4070.
- **Q4_K_S (15,7 GB)**: necesita unos 16 GB de VRAM. Adecuado para RTX 4080, RTX 4090 o A6000.
- **Q8_0 (28,7 GB)**: requiere 32 GB de VRAM o más. Solo viable en GPUs profesionales como A100 40GB, H100 o múltiples GPUs.

Para despliegue, los archivos GGUF son compatibles con llama.cpp, Ollama, text-generation-inference (TGI) y vLLM (este último requiere conversión adicional). La latencia y el throughput dependerán del hardware y de la longitud de contexto, que no está documentada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo tiene 26,9B parámetros, un tamaño intermedio entre Llama 3.1 8B y Llama 3.1 70B, pero sin datos de rendimiento no es posible posicionarlo frente a alternativas como:

- Llama 3.1 8B (8B, contexto 128K, benchmarks extensos)
- Mistral 7B (7B, contexto 32K, benchmarks extensos)
- Qwen 2.5 14B (14B, contexto 128K, benchmarks extensos)

Se recomienda a los usuarios realizar sus propias pruebas comparativas con estos modelos de referencia.

## Limitaciones y advertencias

- **Falta de documentación**: no hay información sobre arquitectura, entrenamiento, sesgos o limitaciones específicas. Esto dificulta la evaluación de riesgos.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente sin ajuste fino específico.
- **Idioma**: solo se declara soporte para inglés. El rendimiento en otros idiomas es desconocido.
- **Cuantización**: las versiones GGUF de baja precisión (Q2_K) pueden degradar significativamente la calidad de las respuestas. Se recomienda usar Q4_K_S o Q8_0 para producción.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario debe verificar que el modelo base no tenga restricciones adicionales (no se indica ninguna).
- **Sin garantías**: al no haber benchmarks ni ejemplos de uso, no se puede garantizar que el modelo cumpla requisitos de calidad o seguridad en entornos reales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CorX3.8-27B-GGUF
- Modelo base: https://huggingface.co/Sigmandndnns/CorX3.8-27B
- Página de solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
