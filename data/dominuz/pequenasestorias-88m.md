# DominuZ/PequenasEstorias-88M

## Resumen

Pequenas Estórias 88M es un modelo de lenguaje de 88,1 millones de parámetros entrenado desde cero por el desarrollador independiente DominuZ para generar cuentos infantiles en portugués de Brasil. Se trata de un modelo base (no instruido) que continúa texto a partir de un inicio dado, y que se distribuye exclusivamente en formato GGUF para su uso con llama.cpp. Su relevancia radica en demostrar que un corpus reducido y especializado —los cuentos del dataset Pequenas Estórias, derivado de TinyStories— basta para que un modelo muy pequeño aprenda a producir narrativa coherente con principio, nudo y desenlace en portugués.

El modelo se enmarca en la estela de TinyStories (arXiv:2305.07759), el trabajo que mostró que modelos del orden de decenas de millones de parámetros pueden generar texto gramatical y narrativamente consistente si el corpus de entrenamiento es lo bastante simple y acotado. La model card cita explícitamente la etiqueta `qwen3`, lo que sugiere que la arquitectura subyacente sigue el diseño de la familia Qwen3, aunque no se detalla la configuración exacta de capas, cabezas de atención ni dimensión oculta.

La compresión Q4_K_M ocupa 54 MB, lo que permite ejecutar el modelo en cualquier ordenador sin GPU dedicada. El repositorio completo pesa 0,3 GB y acumula 190 descargas y 4 likes en el momento de redactar esta ficha. Existe una variante Instruct entrenada sobre esta base, pensada para atender peticiones directas del tipo "escribe una historia sobre un gato que perdió el sombrero".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `qwen3` en la model card; configuración de capas no disponible) |
| Parámetros totales | 88.101.120 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (54 MB); el resto de variantes GGUF no disponible |
| Idiomas soportados | Portugués (pt, pt-BR) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (librería `gguf`, compatible con llama.cpp) |

## Arquitectura y entrenamiento

La model card identifica el modelo con la etiqueta `qwen3`, lo que apunta a una arquitectura transformer decoder-only con los componentes habituales de esa familia (atención multi-cabeza, normalización RMSNorm, activaciones SwiGLU), si bien no se publican el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto nativa. El dato verificable es el recuento de parámetros: 88.101.120, procedente de los pesos en safetensors del repositorio.

El entrenamiento se realizó desde cero y exclusivamente con los cuentos del dataset DominuZ/TinyStories-pt-BR, una adaptación al portugués de Brasil del corpus TinyStories. La model card resume la lección del proyecto en una frase: dos millones de cuentos simples bastan para que un modelo pequeño aprenda a escribir en portugués. No se documentan el número exacto de tokens procesados, la composición detallada del dataset, ni si hubo fases de ajuste fino con RLHF o DPO; al tratarse de un modelo base, lo esperable es que no las haya, pero no se confirma en la información disponible.

## Capacidades

- Generación de texto narrativo en portugués de Brasil: cuentos infantiles con estructura de inicio, desarrollo y desenlace.
- Continuación de texto a partir de un inicio dado (modelo base, no instruido).
- Coherencia narrativa a corto y medio plazo, con personajes y objetos consistentes dentro de una misma historia.
- Vocabulario y sintaxis adaptados a registro infantil y a frases simples.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales.
- Capacidad multilingüe limitada al portugués; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Generación de cuentos infantiles personalizados: el modelo continúa un inicio proporcionado por el usuario y produce una narración completa, lo que permite crear bibliotecas de relatos a partir de plantillas con nombres y escenarios variables.
- Aplicaciones educativas de lectura temprana: al estar entrenado con vocabulario simple y frases cortas, encaja en herramientas que generan textos graduados para niños que están aprendiendo a leer en portugués.
- Prototipado rápido de narrativa en local: con 54 MB en Q4_K_M, se puede integrar en un script de Python con llama.cpp para experimentar con generación de historias sin depender de servicios en la nube ni de GPU.
- Generación de contenido para aplicaciones móviles o de escritorio: el reducido tamaño del archivo permite empaquetar el modelo dentro de una app sin infraestructura de servidor.
- Investigación sobre modelos de lenguaje pequeños: sirve como punto de partida reproducible para estudiar cómo escala la coherencia narrativa con el tamaño del modelo y la composición del corpus, siguiendo la línea de TinyStories.
- Filtrado y aumento de datos: el modelo puede generar variantes de cuentos para ampliar datasets de entrenamiento de otros modelos o para tareas de aumento de datos en portugués.
- Demostraciones docentes de inferencia local: útil en talleres para mostrar el funcionamiento de llama.cpp y de la cuantización Q4_K_M con un modelo que cabe en cualquier portátil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q4_K_M (archivo de 54 MB más overhead de llama.cpp y del contexto).
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. En caso de usar GPU, cualquier tarjeta con 1-2 GB de VRAM libre sirve.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU integrada.
- Opciones de despliegue: llama.cpp (soporte nativo, formato GGUF) y cualquier frontend compatible con GGUF. No se documenta soporte de vLLM ni de TGI, que no trabajan con GGUF de forma nativa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Pequenas Estórias 88M | 88,1 M | No disponible | pt | Apache-2.0 | GGUF | Hugging Face |
| TinyStories (original, Microsoft Research) | ~1 M a ~33 M según variante | No disponible en la información | en | No disponible en la información | No disponible en la información | Paper y variantes en Hugging Face |
| Qwen3 (familia completa) | Desde ~0,6 B en adelante | No disponible en la información | Multilingüe | Apache-2.0 en la mayoría de variantes | safetensors, GGUF | Hugging Face |

La comparación con TinyStories es la más pertinente por metodología y propósito, aunque el original está en inglés y sus variantes publicadas difieren en tamaño. Frente a la familia Qwen3 completa, Pequenas Estórias 88M es dos órdenes de magnitud menor y está especializado en un único dominio y idioma.

## Limitaciones y advertencias

- Modelo base: no sigue instrucciones de forma fiable; para peticiones directas debe usarse la variante Instruct.
- Dominio muy restringido: entrenado solo con cuentos infantiles, por lo que su rendimiento fuera de ese registro será deficiente.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido factualmente incorrecto, aunque en el contexto de cuentos infantiles el impacto es limitado.
- Sesgos: no se documentan análisis de sesgos; el corpus de origen puede arrastrar estereotipos presentes en los cuentos infantiles.
- Cobertura lingüística limitada al portugués de Brasil; no se garantiza un comportamiento correcto en portugués europeo ni en otros idiomas.
- Longitud de contexto no documentada, lo que dificulta planificar el diseño de prompts largos.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar el aviso de licencia y verificar las condiciones del dataset de origen.
- Al ser un modelo de 88 M de parámetros, la coherencia decae en generaciones largas y la variedad léxica es reducida.
- No se documentan garantías de calidad para producción; se recomienda evaluar con muestras propias antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DominuZ/PequenasEstorias-88M
- Variante Instruct: https://huggingface.co/DominuZ/PequenasEstorias-88M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/DominuZ/TinyStories-pt-BR
- Paper de TinyStories: https://arxiv.org/abs/2305.07759
