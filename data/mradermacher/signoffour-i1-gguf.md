# mradermacher/SignOfFour-i1-GGUF

## Resumen

SignOfFour es un modelo de lenguaje de tipo mixture of experts (MoE) desarrollado por pragmaticcs y cuantizado por mradermacher en formato GGUF con matriz de importancia (imatrix). Esta versión, `SignOfFour-i1-GGUF`, es una cuantización que reduce el tamaño del modelo original para facilitar su despliegue en entornos locales con requisitos de hardware moderados. El modelo base, `pragmaticcs/SignOfFour`, es un MoE de 34.660.610.688 parámetros que combina arquitecturas basadas en Qwen3.5 y Qwen3.6, con una componente DeltaNet según las etiquetas del repositorio. Está orientado a tareas de razonamiento, generación de código y uso en agentes, y soporta los idiomas inglés y chino. La licencia es Apache 2.0, lo que permite su uso comercial con las condiciones habituales. No se ha especificado la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE basado en Qwen3.5 (qwen3_5_moe), con componente DeltaNet |
| Parámetros totales | 34.660.610.688 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K (13.0 GB) y fichero imatrix (0.3 GB) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un MoE (mixture of experts) con arquitectura `qwen3_5_moe`, lo que indica una familia de modelos Qwen con mecanismo de mezcla de expertos. La etiqueta `deltanet` sugiere la inclusión de una capa o componente basado en DeltaNet, una arquitectura de atención lineal que puede mejorar la eficiencia en secuencias largas. El modelo es de tipo causal (`causal-lm`) y se ha construido mediante un proceso de fusión (`merge`) de modelos utilizando las técnicas `ties` y `dare`, que combinan pesos de varios modelos base. No se dispone de información específica sobre los datos de entrenamiento, el número de tokens procesados ni la composición del dataset. Tampoco se han publicado detalles sobre procesos de alineación como RLHF o DPO. La cuantización i1 (imatrix) aplicada por mradermacher utiliza matrices de importancia para reducir la pérdida de calidad en la compresión de pesos.

## Capacidades

- Generación de texto y razonamiento, según la etiqueta `reasoning` del repositorio.
- Generación de código, indicada por la etiqueta `code`.
- Soporte de agentes y razonamiento multi-paso, asociado a la etiqueta `agentic`.
- Conversación en inglés y chino, según los idiomas declarados.
- Compatibilidad con endpoints y despliegue en producción, indicada por `endpoints_compatible`.
- Tool calling / function calling: no especificado en la información disponible.
- Capacidades de visión o audio: no especificadas.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede generar, explicar y refactorizar código gracias a sus etiquetas `code` y `reasoning`. Se desplegaría localmente mediante llama.cpp u Ollama para mantener el código en el entorno del desarrollador.
- Automatización de agentes en sistemas de backend: la etiqueta `agentic` sugiere que puede encadenar tareas de razonamiento, por lo que es adecuado para orquestar flujos de trabajo en frameworks de agentes. Es necesario verificar previamente el soporte de tool calling, que no se ha especificado.
- Soporte técnico bilingüe: al soportar inglés y chino, puede gestionar consultas de usuarios en ambos idiomas sin necesidad de cambiar de modelo, lo que simplifica la infraestructura.
- Análisis de código legacy: puede ayudar a los equipos a comprender sistemas antiguos, generando explicaciones en lenguaje natural sobre el comportamiento de funciones o módulos.
- Generación de documentación técnica: a partir de código o especificaciones, puede redactar documentación en inglés o chino, reduciendo el esfuerzo manual en proyectos internacionales.
- Investigación y resumen de artículos técnicos: su capacidad de razonamiento permite extraer conclusiones de papers o informes, siempre que se le proporcione el contexto adecuado en la ventana de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero i1-Q2_K pesa 13.0 GB. Se recomienda al menos 16 GB de VRAM para un contexto corto, y 24 GB para mayor margen de contexto y KV cache.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). En GPUs de consumo, una RTX 4090 es adecuada para el quant i1-Q2_K.
- Despliegue en consumer GPU: sí, con cuantización i1-Q2_K y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para vLLM o TGI no es nativo; se requeriría una conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares en los datos proporcionados. El modelo base es `pragmaticcs/SignOfFour`, del que no se han publicado benchmarks en la información disponible.

## Limitaciones y advertencias

- La cuantización i1-Q2_K es agresiva y puede degradar significativamente la calidad del modelo en comparación con cuantizaciones superiores como Q4_K_M o Q6_K.
- No se han publicado evaluaciones de sesgos, alucinación o seguridad, por lo que el riesgo de comportamientos indeseados no está caracterizado.
- Solo se han especificado los idiomas inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- La longitud de contexto no se ha especificado, lo que limita su uso en tareas que requieran ventanas de entrada largas.
- Al ser un modelo de fusión (merge con `ties` y `dare`), puede heredar comportamientos impredecibles de los modelos originales.
- La licencia Apache 2.0 permite uso comercial, pero es obligatorio cumplir sus condiciones y verificar las restricciones del modelo base.

## Enlaces

- https://huggingface.co/mradermacher/SignOfFour-i1-GGUF
- https://huggingface.co/pragmaticcs/SignOfFour
- https://huggingface.co/mradermacher/SignOfFour-GGUF
- https://huggingface.co/mradermacher
- https://huggingface.co/mradermacher/model_requests
