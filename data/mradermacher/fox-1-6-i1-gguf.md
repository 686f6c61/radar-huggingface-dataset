# mradermacher/fox-1.6-i1-GGUF

## Resumen

fox-1.6-i1-GGUF es la colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base Fox-AI-by-teolm30/fox-1.6, un modelo de lenguaje compacto de aproximadamente 2.030 millones de parámetros (2,03B). El trabajo de mradermacher consiste exclusivamente en la conversión y cuantización del modelo original a formatos GGUF optimizados con matrices de importancia (imatrix), lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. No se trata de un modelo nuevo entrenado desde cero, sino de una distribución de pesos comprimidos del modelo Fox-AI.

El modelo base está etiquetado como "compact-llm", orientado a generación de texto conversacional en inglés, y se publica bajo licencia Apache 2.0. Con 2,03B de parámetros y cuantizaciones que van desde 0,7 GB (IQ1_S) hasta 1,8 GB (Q6_K), el modelo está claramente posicionado para despliegues ligeros en CPU, GPUs de gama baja y entornos con restricciones de memoria. La relevancia actual reside en la disponibilidad de variantes imatrix de alta calidad que permiten sacrificar muy poco rendimiento a cambio de reducciones drásticas de tamaño.

La información pública disponible sobre el modelo base es muy limitada: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha se limita, por tanto, a documentar lo que sí está verificado en la información proporcionada (arquitectura de parámetros, licencia, cuantizaciones, idioma declarado) y marca explícitamente como "no disponible" todo aquello que no se puede confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles específicos no disponibles) |
| Parametros totales | 2.031.739.904 (≈2,03B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base original en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base Fox-AI-by-teolm30/fox-1.6 es un transformer de 2,03B de parámetros. No se dispone de información pública sobre el número de capas, dimensión oculta, número de cabezas de atención, tipo de atención (MHA, GQA, MQA), función de activación ni detalles del tokenizador. Tampoco se documenta la longitud de contexto nativa, el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La model card del repositorio cuantizado no incluye estos datos y la información proporcionada no los recoge.

En cuanto al proceso de cuantización, mradermacher aplica cuantización con matrices de importancia (imatrix) sobre el modelo convertido desde formato Hugging Face (convert_type: hf). Las imatrix permiten ponderar la importancia de cada tensor durante la cuantización, de modo que las capas más sensibles a la compresión preservan mayor precisión. El repositorio incluye además el fichero imatrix original (fox-1.6.imatrix.gguf, 0,1 GB) para que terceros puedan generar sus propias cuantizaciones. Se ofrece también una colección paralela de cuantizaciones estáticas en mradermacher/fox-1.6-GGUF.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Generación de texto general y continuación de secuencias (pipeline text-generation).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere uso en servicios de inferencia estándar.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no documentadas en la información disponible.
- Capacidades multilingües: limitadas al inglés según el campo language del modelo base.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Prototipado local en equipos sin GPU dedicada: con cuantizaciones de 0,7 a 1,4 GB, el modelo puede ejecutarse en CPU mediante llama.cpp u Ollama, lo que permite experimentar con un LLM conversacional en portátiles convencionales sin infraestructura cloud.
- Asistentes conversacionales ligeros en el borde (edge): al caber en 1-2 GB de RAM/VRAM, es viable desplegarlo en dispositivos con recursos limitados para tareas de chat de baja latencia y alcance acotado.
- Filtrado y clasificación de texto en pipelines: la generación de texto corta y el tamaño reducido permiten usarlo como componente de preprocesado o etiquetado en flujos batch, siempre que las tareas estén en inglés.
- Generación de texto de relleno o borradores: adecuado para producir respuestas cortas, resúmenes preliminares o texto auxiliar donde no se requiera máxima calidad, aprovechando las cuantizaciones IQ4_XS o Q4_K_M como equilibrio tamaño/calidad.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 24 variantes de cuantización más el fichero imatrix, lo que lo convierte en un banco de pruebas útil para medir el impacto de la compresión en la perplejidad y la calidad de salida sobre un mismo modelo base.
- Despliegue en entornos con restricciones de licencia: al ser Apache 2.0, puede integrarse en productos comerciales sin obligaciones de copyleft, siempre que se respeten las condiciones de la licencia.
- Generación de cuantizaciones propias: el fichero imatrix incluido permite a otros autores producir variantes GGUF personalizadas con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni perplejidad, y la información proporcionada no aporta datos del modelo base.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,0-1,5 GB para cuantizaciones IQ3/IQ4, 1,5-1,8 GB para Q5_K_M y Q6_K, y 0,7-1,0 GB para las variantes IQ1/IQ2 (con pérdida de calidad notable en las más agresivas).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede alojar las cuantizaciones Q4_K_M o Q5_K_M; tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores son suficientes. En GPUs de gama alta (A100, H100, RTX 4090) el modelo queda sobredimensionado en memoria y el cuello de botella será la latencia, no la capacidad.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPUs consumer actuales, e incluso en iGPUs con memoria compartida si se usa Q4_K_S o inferior.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag endpoints_compatible sugiere también compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput: no disponibles en la información proporcionada. A título orientativo no verificado, un modelo de 2B en Q4_K_M suele ofrecer decenas de tokens por segundo en GPU consumer y varios tokens por segundo en CPU, pero estos valores no están confirmados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fox-1.6 (este, cuantizado por mradermacher) | ≈2,03B | no disponible | Apache 2.0 | GGUF | 24 cuantizaciones imatrix, inglés |
| Modelos comparables de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificada de alternativas concretas en la documentación aportada |

No se dispone de datos de rendimiento del modelo base que permitan una comparación cuantitativa fiable con alternativas de la misma categoría. La comparación se limita, por tanto, a parámetros y licencia, y no se han identificado en la información proporcionada modelos directamente comparables con métricas publicadas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no publicarse detalles del corpus de entrenamiento, no es posible evaluar sesgos de género, raza, ideología o geográficos.
- Riesgo de alucinación: no cuantificado. Un modelo de 2B de parámetros tiene, por capacidad, mayor propensión a generar contenido factualmente incorrecto que modelos de mayor tamaño; se recomienda verificación humana en usos críticos.
- Limitación de idioma: el modelo declara únicamente inglés; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se puede confirmar la ventana máxima soportada, lo que limita su uso en tareas de contexto largo sin validación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, conviene conservar los avisos de licencia y verificar la licencia del modelo base original.
- Calidad de las cuantizaciones extremas: las variantes IQ1_S, IQ1_M e IQ2_XXS (0,7-0,8 GB) degradan notablemente la calidad; la propia model card las describe como "for the desperate" o "mostly desperate".
- Ausencia de benchmarks: no hay evidencia publicada de rendimiento que permita garantizar su idoneidad en producción para tareas específicas; se recomienda evaluar empíricamente antes de desplegar.
- Fecha de creación del repositorio: 2026-11-18, según los metadatos; verificar la vigencia y el soporte del modelo base.

## Enlaces

- Repositorio Hugging Face (cuantizaciones imatrix): https://huggingface.co/mradermacher/fox-1.6-i1-GGUF
- Modelo base: https://huggingface.co/Fox-AI-by-teolm30/fox-1.6
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/fox-1.6-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#fox-1.6-i1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
