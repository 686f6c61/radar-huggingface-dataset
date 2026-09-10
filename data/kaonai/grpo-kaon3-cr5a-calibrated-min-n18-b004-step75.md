# kaonai/grpo-kaon3-cr5a-calibrated-min-n18-b004-step75

## Resumen

El modelo `kaonai/grpo-kaon3-cr5a-calibrated-min-n18-b004-step75` es un checkpoint de ajuste fino mediante RL (GRPO) sobre un modelo base de 26.000 millones de parámetros, `kaonai/kaon-c-gemma4-26b-v10.1`. El autor, `kaonai`, lo publica como una fusión de pesos completos en bfloat16, no como un adaptador PEFT. El nombre indica que se ha usado una estrategia de recompensa basada en consenso (`consensus-reward`) con agregación del mínimo calibrado entre señales de recompensa, lo que lo hace relevante para explorar métodos de alineación por RL en modelos grandes de código abierto.

Se trata de un checkpoint de paso 75 de optimización, con parámetros de entrenamiento concretos (LR 1e-4, beta 0.04, seed 42, muestreo N18 con selección de bottom3/top3 y consenso estricto de signos). El modelo se presenta como un modelo conversacional y generativo de texto, con etiquetas que también sugieren modalidad imagen-texto (`image-text-to-text`). La longitud de contexto, los idiomas soportados y la licencia no están documentados. El autor advierte expresamente que es un checkpoint "sugerido no evaluado" y que su publicación no implica autorización de promoción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Gemma4 26B; arquitectura de red neuronal no documentada) |
| Parametros totales | 25.805.933.872 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (bfloat16) |
| Modelo base | kaonai/kaon-c-gemma4-26b-v10.1 |
| Tamaño del repositorio | 51,6 GB |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos completos en formato BF16, obtenida a partir de un adaptador entrenado con GRPO sobre `kaonai/kaon-c-gemma4-26b-v10.1`. Según la model card, la ejecución de origen corresponde al run `cr5-min-v11-order54-kl04`, y el checkpoint fue creado en el paso de optimización 75. Los hiperparámetros de entrenamiento documentados son: tasa de aprendizaje de 1e-4, beta de 0.04 y semilla 42. El esquema de recompensa agrega señales calibradas de tipo R/S/W mediante el mínimo calibrado, aplicando un muestreo de N=18 candidatos del que se seleccionan bottom3 y top3, lo que exige un consenso estricto de signos a tres bandas. No se indican detalles sobre la arquitectura interna, el tamaño del contexto ni el tipo de atención; se desconoce si introduce innovaciones como atención lineal o decodificación especulativa.

## Capacidades

- Generación de texto en formato conversacional: el pipeline principal es `text-generation` y el repositorio incluye la etiqueta `conversational`.
- Posible multimodalidad de entrada: la etiqueta `image-text-to-text` sugiere que el modelo podría aceptar imágenes además de texto, pero no hay documentación que lo confirme.
- Entrenamiento por RL con recompensa por consenso: la integración de GRPO y `consensus-reward` indica una optimización orientada a alinear las salidas con señales de recompensa calibradas, aunque no se publican métricas de éxito.
- Tool calling: no documentado, no se menciona soporte para llamadas a funciones ni integración con herramientas externas.
- Razonamiento de múltiples pasos: no documentado; no hay evidencia en la model card de capacidades de agentes o `thinking mode`.
- Lenguaje: sin información sobre el alcance multilingüe del modelo.

## Casos de uso

Las siguientes aplicaciones son hipótesis razonables basadas en el tipo de modelo; no existe documentación oficial que las confirme ni evaluaciones públicas que respalden su rendimiento.

- Asistencia conversacional en entornos corporativos: un modelo de 25.800 millones de parámetros puede servir como base para bots de diálogo, siempre que se evalúe la calidad de las respuestas y se ajusten los sesgos antes de producción.
- Resumen de documentos extensos: la capacidad de generar texto condensado es inherente a un LLM, pero la utilidad depende del contexto efectivo, que en este caso no está documentado.
- Generación de código asistida: por su tamaño, podría emplearse en tareas de programación, pero no se han publicado benchmarks de HumanEval o similares que lo demuestren.
- Análisis de imágenes con texto (si se confirma la multimodalidad): el tag `image-text-to-text` podría permitir tareas de descripción o respuesta a preguntas visuales, pero no hay ejemplos de uso en el repositorio.
- Integración en pipelines de RAG: puede combinarse con recuperación aumentada para responder preguntas sobre bases de conocimiento internas, siempre que la ventana de contexto sea suficiente; este dato no está publicado.
- Experimentación en alineación por RL: dado que es un checkpoint de GRPO con recompensa por consenso, resulta útil para investigar métodos de alineación comparando este paso con otros intermedios, aunque se requiere evaluarlo previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos ocupan aproximadamente 51,6 GB (25.805.933.872 parámetros × 2 bytes), por lo que se necesita en torno a 52 GB solo para los pesos, más memoria para contexto y activaciones.
- GPU recomendada: para carga en BF16 se recomienda una A100 de 80 GB o H100 de 80 GB; no cabe en una GPU de consumo de 24 GB sin cuantizar.
- Cuantizaciones: no se han publicado variantes cuantizadas del autor; podría intentarse una cuantización externa con herramientas como llama.cpp o GPTQ, pero la compatibilidad y el rendimiento no están garantizados.
- Opciones de despliegue: el repositorio indica `library_name: transformers`, por lo que la vía principal es cargar los safetensors con la librería Transformers. Otras plataformas (vLLM, TGI, llama.cpp, Ollama) no están documentadas.
- Latencia y throughput estimados: no disponible, no hay datos publicados.

## Comparativa con modelos similares

No disponible: la información proporcionada no incluye modelos comparables de la misma categoría. El modelo base `kaonai/kaon-c-gemma4-26b-v10.1` sería la referencia directa, pero este checkpoint es una variante de entrenamiento con GRPO, no una alternativa independiente.

## Limitaciones y advertencias

- El autor etiqueta explícitamente el checkpoint como "suggested unevaluated checkpoint" y aclara que la publicación no es una autorización de promoción; es decir, no se ha validado de forma independiente.
- La licencia no está especificada, por lo que el uso comercial es incierto y debe tratarse con cautela.
- No se han publicado evaluaciones de alucinaciones ni de sesgos, lo que supone un riesgo para aplicaciones en producción.
- La longitud de contexto, los idiomas y las capacidades multimodales no están documentados; cualquier integración requiere verificación previa.
- No existe información sobre tool calling, agentes o capacidades de razonamiento estructurado, por lo que no se puede asumir su soporte.
- El repositorio no ofrece cuantizaciones oficiales, y el tamaño de 51,6 GB en BF16 dificulta su despliegue en infraestructuras de consumo.

## Enlaces

- HuggingFace: https://huggingface.co/kaonai/grpo-kaon3-cr5a-calibrated-min-n18-b004-step75
- No se han encontrado otros enlaces relevantes; la búsqueda web devolvió resultados no relacionados con el modelo.
