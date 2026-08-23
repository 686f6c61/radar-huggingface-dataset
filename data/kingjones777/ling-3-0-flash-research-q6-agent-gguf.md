# kingjones777/Ling-3.0-flash-Research-Q6-AGENT-GGUF

## Resumen

Ling-3.0-flash es un modelo de lenguaje de gran tamaño desarrollado por InclusionAI, de arquitectura MoE híbrida (denominada `bailingmoe3`) que combina capas Transformer con capas de espacio de estados (SSM). El modelo base cuenta con 124 mil millones de parámetros totales, de los cuales se activan 5.100 millones en cada inferencia, y presenta una ventana de contexto nativa de 262.144 tokens, extensible hasta 1 millón. Su licencia es MIT, lo que permite uso comercial sin restricciones.

Este repositorio concreto, `kingjones777/Ling-3.0-flash-Research-Q6-AGENT-GGUF`, es una cuantización GGUF del modelo instruct original, realizada por el usuario kingjones777 siguiendo una receta de investigación propia. La cuantización emplea el tipo de fichero 114 (`Q6_0_ROCMFPX_AGENT`), una variante de 6 bits optimizada para hardware AMD ROCm, con las cabezas de salida y de embeddings en 8 bits (`Q8_0_ROCMFPX`). Está pensada específicamente para entornos de agente con hardware AMD de la serie Strix Halo (gfx1151).

La relevancia de este artefacto radica en su carácter experimental: el autor advierte explícitamente que no es una versión de sustitución para los despliegues por defecto, sino una variante de investigación orientada a medir el comportamiento del modelo en tareas de agente con la cuantización ROCmFPx. El archivo generado pesa aproximadamente 117,6 GB y se ha validado con una prueba de generación en hardware AMD que alcanzó 78,7 tokens por segundo en procesamiento de prompt y 25,8 tokens por segundo en generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (`bailingmoe3`) con capas SSM |
| Parametros totales | 124 B (según documentación de InclusionAI) |
| Parametros activos | 5,1 B |
| Longitud de contexto | 262144 tokens (nativo, extensible a 1 M) |
| Tipos de cuantizacion | Q6_0_ROCMFPX_AGENT (ftype 114), con cabezas Q8_0_ROCMFPX (tipo 103) |
| Idiomas soportados | No especificado en la información proporcionada |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), safetensors para el modelo base |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-flash es un MoE híbrido que combina capas de atención clásica con capas de espacio de estados (SSM), una arquitectura que permite manejar secuencias largas con menor coste computacional que un Transformer puro. La configuración del modelo incluye 43 bloques y un parámetro `nextn_predict_layers = 1`, que habilita la predicción de múltiples tokens por paso (MTP). Los tensores de los bloques SSM se identifican como `blk.N.ssm_f.weight` y `blk.N.ssm_g.weight` (35 de cada uno en la cuantización).

No se dispone de información sobre los datos de entrenamiento, el número total de tokens utilizados ni los métodos de alineación (RLHF, DPO, etc.) en la documentación de este repositorio. La guía oficial de InclusionAI indica que el modelo soporta un modo de razonamiento híbrido, aunque no se especifica si se trata de un mecanismo de cadena de pensamiento explícita o implícita. La cuantización aquí presentada se ha generado a partir de una conversión a BF16 del modelo base (revisión `42766a814ab117e75e2e61465d5e131b72d931a3`), seguida de una cuantización con `llama-quantize` utilizando el tipo `Q6_0_ROCMFPX_AGENT` con un factor de 16.

## Capacidades

- Generación de texto con razonamiento explícito: el ejemplo de ejecución incluido en la model card muestra que el modelo produce un bloque de pensamiento delimitado por `[Start thinking]` y `[End thinking]` antes de dar la respuesta final, lo que sugiere un modo de razonamiento visible.
- Manejo de contexto largo: con 262.144 tokens de ventana nativa, puede procesar documentos extensos o conversaciones multi-turno de gran tamaño.
- Optimización para agentes: la variante `AGENT` de la cuantización indica una orientación a tareas de agencia, aunque no se detalla si el modelo base soporta `tool calling` o `function calling` de forma nativa.
- Capacidades multilingües: no se han publicado datos específicos sobre los idiomas soportados.
- Modo de razonamiento híbrido: según la documentación oficial, el modelo combina razonamiento rápido (no reflexivo) con razonamiento profundo, activable según la consulta.

## Casos de uso

- Asistentes de investigación automatizados: el modelo puede procesar artículos científicos o informes técnicos extensos y generar resúmenes o responder preguntas con razonamiento detallado, gracias a su contexto de 262K tokens que permite cargar documentos completos sin truncamiento.
- Agentes de análisis de documentos: con la variante `AGENT`, el modelo puede integrarse en pipelines de extracción de información de PDFs o bases de datos documentales, generando informes estructurados con citas.
- Generación de contenido académico: su capacidad de razonamiento explícito lo hace útil para redactar ensayos, explicaciones matemáticas o históricas con elaboración coherente, como muestra el ejemplo de la historia de las matemáticas.
- Despliegue en hardware AMD para inferencia local: la cuantización está optimizada para GPUs AMD con ROCm (gfx 1151, Strix Halo), permitiendo ejecutar el modelo en estaciones de trabajo con Ryzen AI Max sin necesidad de hardware NVIDIA.
- Sistemas de tutoría inteligente: el modelo puede actuar como tutor explicando conceptos paso a paso, con la capacidad de mantener conversaciones largas y contextualizadas.
- Procesamiento de código y documentación técnica: aunque no se han publicado benchmarks específicos, su capacidad de razonamiento y su contexto largo lo hacen adecuado para analizar repositorios, generar documentación o responder preguntas sobre bases de código extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas. El único dato de rendimiento medido es la velocidad de inferencia en hardware AMD gfx 1151 con llama.cpp (build `b202-4eca07e`), que alcanzó 78,7 tokens/s en el procesamiento del prompt y 25,8 tokens/s en generación con una ventana de 2048 tokens y un lote de 512 tokens.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 117.608.292.512 bytes (~109,5 GiB). Para cargarlo completo en VRAM se necesitan al menos 110 GiB de memoria gráfica, más la memoria adicional para el contexto y los buffers de computación. Con contexto de 2048 tokens, la carga completa cabe en una GPU de 128 GB, pero con la ventana nativa de 262.144 tokens se necesitaría más de 120 GiB solo para los pesos.
- GPU recomendadas: el autor ha probado el modelo en una GPU AMD gfx 1151 (Strix Halo, correspondiente a las APU Ryzen AI Max 395 con Radeon 8060S). No se han proporcionado pruebas en GPUs NVIDIA, aunque la cuantización Q6_0 es compatible con llama.cpp en cualquier hardware que soporte GGUF.
- En consumer GPU: no cabe en ninguna GPU doméstica actual, ya que el modelo es de 124B y la cuantización Q6 mantiene un tamaño cercano a 110 GiB. Las GPUs consumer actuales tienen entre 16 y 24 GiB de VRAM.
- Opciones de despliegue: llama.cpp (incluyendo `llama-cli`, `llama-server`), y cualquier herramienta que soporte GGUF como Ollama, aunque se recomienda el uso de builds con soporte ROCm para aprovechar la optimización.
- Latencia y throughput: en la prueba realizada, se obtuvo 78,7 t/s en procesamiento de prompt y 25,8 t/s en generación con contexto 2048 y sin drafter ni MTP sweep. El modelo incluye `nextn_predict_layers = 1`, lo que sugiere que con MTP activado se podría mejorar la velocidad de generación, pero no se ha medido.

## Comparativa con modelos similares

La comparativa se basa en los datos oficiales de la familia Ling, ya que no hay datos de rendimiento comparativo con otros modelos en la información proporcionada.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-flash (base) | 124 B | 5,1 B | 256K (hasta 1M) | MIT | HuggingFace |
| Ling-lite | 16,8 B | 2,75 B | no disponible | MIT | GitHub |
| Ling-plus | 290 B | 28,8 B | no disponible | MIT | GitHub |
| Ling-3.0-flash-Research-Q6-AGENT (este) | 124 B | 5,1 B | 262.144 | MIT | HuggingFace (GGUF) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de este modelo con alternativas como DeepSeek-V3, Qwen2.5-MoE o Mixtral-8x22B. La guía oficial de InclusionAI menciona que Ling-3.0-flash se posiciona como un modelo coste-efectivo, pero no se incluyen cifras concretas.

## Limitaciones y advertencias

- Cuantización de investigación: el autor de esta cuantización la presenta como una variante de investigación, no como un artefacto para producción. No es una versión de sustitución para los despliegues por defecto del modelo base.
- Calidad de la cuantización: al ser una cuantización de 6 bits (Q6_0), puede haber una degradación leve en la calidad de salida respecto al modelo BF16 original, especialmente en tareas de razonamiento complejo.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos ni de tasas de alucinación para esta variante ni para el modelo base en la información disponible.
- Limitaciones de idioma: no se especifican los idiomas soportados; el ejemplo de generación está en inglés, y no se puede confirmar el rendimiento en español u otros idiomas.
- Requisitos de hardware específicos: la optimización ROCmFPx está pensada para GPUs AMD recientes (gfx 1151). En GPUs NVIDIA o AMD más antiguas, el formato puede no estar optimizado y se recomienda usar cuantizaciones estándar.
- Tamaño del archivo: el GGUF pesa ~118 GB, lo que requiere infraestructura de almacenamiento y memoria considerable; no es apto para entornos con VRAM limitada.
- Sin datos de entrenamiento: no se ha publicado información sobre los datos de entrenamiento, el número de tokens, ni los métodos de alineación, por lo que se recomienda precaución al usar el modelo en aplicaciones sensibles.

## Enlaces

- Repositorio del modelo: [kingjones777/Ling-3.0-flash-Research-Q6-AGENT-GGUF](https://huggingface.co/kingjones777/Ling-3.0-flash-Research-Q6-AGENT-GGUF)
- Modelo base: [inclusionAI/Ling-3.0-flash](https://huggingface.co/inclusionAI/Ling-3.0-flash)
- Repositorio de la familia Ling: [GitHub - inclusionAI/Ling](https://github.com/inclusionAI/Ling)
- Documentación oficial de Ling-3.0-flash: [Ling - developer.ant-ling.com](https://developer.ant-ling.com/en/docs/models/ling/)
- Guía completa de Ling-3.0-flash: [aimadetools.com/blog/ling-3-0-flash-complete-guide](https://www.aimadetools.com/blog/ling-3-0-flash-complete-guide/)
