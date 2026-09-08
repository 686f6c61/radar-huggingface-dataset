# mradermacher/gemma-4-12b-full-cpt-itvec-GGUF

## Resumen

Este modelo es una cuantización GGUF del modelo `ToastyPigeon/gemma-4-12b-full-cpt-itvec`, realizada por `mradermacher`. Se trata de una adaptación del modelo Gemma 4 12B de Google, que ha sido modificada mediante técnicas de *continued pre-training* y *task vectors*. El resultado es un modelo de 11.907.350.576 parámetros (aproximadamente 11,9 mil millones) orientado a completar texto en inglés.

La relevancia de esta ficha radica en que ofrece una versión lista para ejecución local en formato GGUF, con múltiples niveles de cuantización que van desde Q2_K (4,9 GB) hasta Q8_0 (12,8 GB). Esto permite ejecutar un modelo de 12B en GPUs de consumo, aunque se debe tener en cuenta que la licencia y la longitud de contexto no están documentadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo derivado de Gemma 4 12B) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente no se especifica en la documentación proporcionada. El modelo se basa en `ToastyPigeon/gemma-4-12b-full-cpt-itvec`, que a su vez deriva de Gemma 4 12B. Según la información pública de Google, Gemma 4 12B es un modelo multimodal unificado con capacidades de texto, audio, imagen y vídeo. Sin embargo, esta adaptación concreta está etiquetada como `text-completion`, lo que sugiere que la cuantización se ha centrado en la parte de generación de texto.

No se dispone de información sobre los datos de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas en el proceso de adaptación.

## Capacidades

- Generación de texto en inglés: el pipeline declarado es `text-completion`, por lo que el modelo está orientado a completar texto.
- Cuantización flexible: se ofrecen diez niveles de cuantización GGUF, lo que permite ajustar el modelo a distintos presupuestos de VRAM.
- No se ha confirmado soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio ni otras capacidades multimodales en esta versión cuantizada.
- No se dispone de información sobre capacidades multilingües más allá del inglés.

## Casos de uso

No se han documentado casos de uso específicos en la información proporcionada. Dado que se trata de un modelo de texto de 12B cuantizado, podría emplearse en tareas de generación de texto en inglés, pero no hay aplicaciones concretas validadas por el autor. A continuación se indican posibles escenarios genéricos, sin garantía de rendimiento:

- Ejecución local en equipos de consumo: gracias a los quants Q4_K_M o Q4_K_S (7,5 y 7,1 GB respectivamente), el modelo puede ejecutarse en GPUs con 10-12 GB de VRAM mediante llama.cpp u Ollama.
- Prototipado de chatbots en inglés: como modelo de completado de texto, podría usarse para experimentar con respuestas de texto libre, aunque no se ha verificado su calidad conversacional.
- Pruebas de cuantización: al estar disponible en diez niveles de compresión, sirve para evaluar el impacto de la cuantización en la calidad de salida de un modelo base de 12B.
- Investigación en *task vectors*: el modelo base utiliza esta técnica, lo que puede interesar a investigadores que estudien composición de modelos.

En cualquier caso, se recomienda consultar la documentación del modelo base `ToastyPigeon/gemma-4-12b-full-cpt-itvec` para obtener casos de uso más precisos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según el quant (tamaño del archivo más overhead de ejecución):
  - Q2_K: 4,9 GB de peso, se recomienda al menos 7 GB de VRAM.
  - Q4_K_S: 7,1 GB de peso, se recomienda al menos 9 GB de VRAM.
  - Q4_K_M: 7,5 GB de peso, se recomienda al menos 10 GB de VRAM.
  - Q5_K_M: 8,6 GB de peso, se recomienda al menos 11 GB de VRAM.
  - Q6_K: 9,9 GB de peso, se recomienda al menos 12 GB de VRAM.
  - Q8_0: 12,8 GB de peso, se recomienda al menos 15 GB de VRAM.
- GPU recomendadas: RTX 3060 12GB o superior para Q4_K_M; RTX 4090 24GB o A100 40GB para Q8_0.
- El modelo puede ejecutarse en GPUs de consumo, siempre que se elija un quant acorde a la VRAM disponible.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (si se convierte a otro formato) y otros motores compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/gemma-4-12b-full-cpt-itvec-GGUF | 11.907.350.576 | No disponible | No disponible | GGUF | HuggingFace |
| mradermacher/gemma-4-12b-full-cpt-itvec-i1-GGUF | 11.907.350.576 | No disponible | No disponible | GGUF (imatrix) | HuggingFace |
| ToastyPigeon/gemma-4-12b-full-cpt-itvec | 11.907.350.576 | No disponible | No disponible | Safetensors | HuggingFace |
| google/gemma-4-12B | No disponible | No disponible | No disponible | Safetensors | HuggingFace |

La comparativa se limita a los datos disponibles. No se dispone de información sobre el rendimiento relativo de estos modelos.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo puede usarse comercialmente; se recomienda contactar con el autor original antes de cualquier despliegue en producción.
- Solo soporta inglés: las capacidades en otros idiomas no están documentadas ni confirmadas.
- No se ha verificado el soporte multimodal: aunque el Gemma 4 12B original es multimodal, esta adaptación está declarada como `text-completion`, por lo que no se garantiza el funcionamiento de visión, audio o vídeo.
- Riesgo de alucinación: al ser un modelo de lenguaje generativo, puede producir contenido plausible pero incorrecto.
- Sesgos: no se han documentado sesgos específicos, pero el modelo hereda los sesgos potenciales de su base de entrenamiento.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que limita su uso en tareas que requieran entradas largas.
- Sin benchmarks publicados: no hay datos objetivos que permitan comparar su calidad con otros modelos.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/gemma-4-12b-full-cpt-itvec-GGUF
- Versión con cuantización imatrix: https://huggingface.co/mradermacher/gemma-4-12b-full-cpt-itvec-i1-GGUF
- Modelo base: https://huggingface.co/ToastyPigeon/gemma-4-12b-full-cpt-itvec
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
