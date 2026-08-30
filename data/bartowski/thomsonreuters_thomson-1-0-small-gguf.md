# bartowski/thomsonreuters_Thomson-1.0-Small-GGUF

## Resumen

Thomson-1.0-Small es un modelo de fundación multimodal desarrollado por Thomson Reuters como parte de su familia Thomson-1.0, diseñado mediante técnicas de continual learning sobre la arquitectura Qwen3.6-35B-A3B. Con 35.000 millones de parámetros totales y 3.000 millones activos en arquitectura de mezcla de expertos (MoE), ofrece un equilibrio entre capacidad y eficiencia computacional. Su ventana de contexto nativa de 262.144 tokens lo hace especialmente adecuado para tareas que requieren procesar documentos extensos, como análisis legal, financiero o técnico.

El modelo acepta entradas de texto e imagen (pipeline image-text-to-text) y se distribuye con pesos en formato GGUF cuantizados por bartowski, lo que permite su ejecución en hardware de consumo con cuantizaciones como Q4_K_M (21,39 GB). La publicación del modelo en agosto de 2026, junto con su informe técnico en arXiv, responde a la estrategia de Thomson Reuters de ofrecer modelos soberanos de alto rendimiento para despliegues locales y controlados. La licencia Polyform Strict 1.0.0, no obstante, impone restricciones significativas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 (≈35B) |
| Parametros activos | 3.000 millones (3B) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_1, Q4_K_L, Q4_K_M, Q4_K_S, Q4_0, IQ4_NL, IQ4_XS, Q3_K_XL, IQ3_M, Q3_K_L, Q3_K_M |
| Idiomas soportados | no disponible |
| Licencia | Polyform Strict 1.0.0 |
| Formato de pesos | GGUF (con archivo mmproj para entrada de imagen) |

## Arquitectura y entrenamiento

Thomson-1.0-Small emplea una arquitectura de mezcla de expertos con 35B parámetros totales y 3B activos por token, heredada de Qwen3.6-35B-A3B. El modelo se entrenó mediante continual learning, una estrategia que permite actualizar y especializar un modelo base sin partir de cero, orientada a la creación de modelos soberanos (SovereignAI) que puedan desplegarse en entornos con requisitos estrictos de control de datos. Según declaraciones del CTO de Thomson Reuters, no se utilizaron datos de clientes en el proceso de entrenamiento.

El modelo es multimodal: acepta tanto texto como imágenes, y para la entrada visual se requiere un archivo mmproj adicional junto al GGUF principal. El formato de prompt es ChatML, con la secuencia `<|im_start|>` y `<|im_end|>`, y el asistente inicia su respuesta con el token ` thinking`, lo que sugiere un modo de razonamiento explícito. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo en dominios generales y especializados, con un promedio agregado de 74,6 en evaluaciones cross-domain.
- Procesamiento multimodal de imagen y texto, permitiendo analizar documentos escaneados, gráficos, diagramas o capturas de pantalla junto con instrucciones textuales.
- Ventana de contexto de 262.144 tokens, adecuada para documentos legales extensos, informes financieros anuales o bases de conocimiento completas en una sola pasada.
- Modo de razonamiento explícito mediante el token ` thinking` en el prompt, que sugiere la capacidad de generar cadenas de pensamiento antes de la respuesta final.
- Soporte de cuantizaciones desde Q3_K_M hasta bf16, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.
- Compatibilidad con herramientas de inferencia estándar del ecosistema GGUF (llama.cpp, Ollama, etc.) y con endpoints compatibles según las etiquetas del repositorio.
- Capacidades multilingües: no disponible (no se especifican idiomas en la documentación proporcionada).
- Soporte de tool calling y agentes: no disponible (no se menciona en la información disponible).

## Casos de uso

- Análisis de documentos legales: con 262.144 tokens de contexto, el modelo puede procesar contratos completos, sentencias o expedientes regulatorios en una sola consulta, extrayendo cláusulas relevantes, identificando riesgos y generando resúmenes ejecutivos.
- Revisión de informes financieros: su capacidad multimodal permite analizar estados financieros con tablas y gráficos, detectando anomalías o tendencias y respondiendo preguntas sobre métricas específicas.
- Asistencia en investigación de mercado: el modelo puede combinar información textual de informes sectoriales con imágenes de gráficos o mapas, generando análisis comparativos y recomendaciones.
- Procesamiento de documentos escaneados: gracias a la entrada de imagen, puede transcribir y analizar documentos físicos digitalizados, extrayendo datos estructurados para su integración en flujos de trabajo empresariales.
- RAG sobre bases de conocimiento corporativas: su contexto largo permite indexar y consultar manuales técnicos, políticas internas o normativas, respondiendo con precisión a preguntas de empleados o auditores.
- Generación de informes técnicos y regulatorios: el modelo puede redactar borradores de informes de cumplimiento, memorandos o documentación técnica, manteniendo coherencia a lo largo de documentos extensos.
- Despliegue en entornos con requisitos de soberanía de datos: al poder ejecutarse localmente con cuantizaciones GGUF, es adecuado para organizaciones que necesitan procesar información sensible sin enviarla a la nube.

## Benchmarks y rendimiento

Según la información publicada en la cobertura del lanzamiento, Thomson-1.0-Small obtiene una puntuación media agregada de 74,6 en evaluaciones cross-domain. La comparativa reportada es la siguiente:

| Modelo | Media agregada |
|---|---|
| Thomson-1.0-Small | 74,6 |
| Snowdon-1.1-Small | 71,7 |
| Qwen3.6-35B-A3B | 71,7 |
| Gemma 4-31B | 71,2 |

No se han publicado resultados desglosados por tarea (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La media agregada sugiere un rendimiento superior a sus alternativas directas en el mismo rango de parámetros, pero se recomienda consultar el informe técnico para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: 70,5 GB con pesos en bf16 (según LLM Explorer). Con cuantización Q4_K_M (21,39 GB), cabe en GPUs de 24 GB como la RTX 4090 o RTX 3090.
- GPU recomendadas: para la cuantización Q4_K_M o superior, una RTX 4090 (24 GB) es suficiente. Para Q6_K o Q8_0, se recomienda una A100 de 40 GB u 80 GB, o una H100.
- En consumer GPU: sí, con cuantizaciones Q4_K_M o inferiores (Q4_K_S, IQ4_XS, Q3_K_M) en GPUs de 16-24 GB. Para Q5_K_M (25 GB) se necesita una GPU de 32 GB o más.
- Opciones de despliegue: llama.cpp (compatible con las cuantizaciones GGUF), Ollama, y servidores de inferencia compatibles con endpoints (vLLM, TGI) según las etiquetas del repositorio.
- Latencia y throughput: no disponible. Al ser un MoE con solo 3B parámetros activos, se espera una latencia menor que un modelo denso de 35B, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Media agregada | Licencia |
|---|---|---|---|---|---|
| Thomson-1.0-Small | 35B | 3B | 262.144 | 74,6 | Polyform Strict 1.0.0 |
| Qwen3.6-35B-A3B | 35B | 3B | no disponible | 71,7 | no disponible |
| Snowdon-1.1-Small | no disponible | no disponible | no disponible | 71,7 | no disponible |
| Gemma 4-31B | 31B | 31B (denso) | no disponible | 71,2 | no disponible |

Thomson-1.0-Small supera a sus competidores directos en la métrica agregada reportada, con una ventaja de aproximadamente 3 puntos sobre Qwen3.6-35B-A3B, su modelo base. La principal diferencia frente a Gemma 4-31B es la arquitectura MoE, que reduce los parámetros activos de 31B a 3B, mejorando la eficiencia en inferencia. La licencia Polyform Strict, sin embargo, es más restrictiva que las licencias habituales de modelos abiertos (Apache 2.0, MIT), lo que puede limitar su adopción en productos comerciales.

## Limitaciones y advertencias

- Licencia Polyform Strict 1.0.0: restringe el uso comercial del modelo y sus derivados. Cualquier aplicación en producción con fines lucrativos requiere evaluación legal previa.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados donde los datos de entrenamiento son limitados. Se recomienda verificación humana en contextos legales o financieros.
- Sesgos conocidos: no se han publicado evaluaciones de sesgo para este modelo. Al estar basado en Qwen, puede heredar sesgos presentes en los datos de entrenamiento de su modelo base.
- Limitaciones de idioma: no se ha especificado la lista de idiomas soportados. El modelo base Qwen tiene buen soporte multilingüe, pero no hay garantía de cobertura uniforme.
- Requisitos de memoria para contexto largo: aunque la ventana nativa es de 262.144 tokens, el uso completo de esta capacidad requiere memoria adicional significativa, incluso con cuantizaciones bajas. En GPUs de 24 GB, el contexto práctico se reduce considerablemente.
- Sin decodificación especulativa: el modelo no soporta speculative decoding, lo que puede limitar el throughput en comparación con modelos que sí lo implementan.
- Dependencia del archivo mmproj: para usar la funcionalidad multimodal, es necesario descargar e integrar el archivo de proyección de imagen, lo que añade complejidad al despliegue.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/bartowski/thomsonreuters_Thomson-1.0-Small-GGUF
- Modelo original: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Informe tecnico (arXiv): Thomson: Continual Learning of Frontier Models for SovereignAI (2608.27147)
- Cobertura del lanzamiento: https://www.aimodeling.com/en/news/slug/thomson-1-0-small-continual-learning
- Analisis y benchmarks: https://ccleaks.com/news/thomson-reuters-thomson-1-0-small-hf-aug-2026
- Ficha en LLM Explorer: https://llm-explorer.com/model/thomsonreuters%2FThomson-1.0-Small,17CVhx9B6LfBbrgzu5DMJv
