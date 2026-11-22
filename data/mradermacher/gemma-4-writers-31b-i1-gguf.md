# mradermacher/Gemma-4-Writers-31B-i1-GGUF

## Resumen

Gemma-4-Writers-31B-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix y pesos ponderados, del modelo Ateron/Gemma-4-Writers-31B, un merge de modelos orientado a escritura creativa y roleplay. El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema GGUF que publica versiones optimizadas para inferencia local en llama.cpp y derivados. El modelo base cuenta con 30.697.345.596 parámetros (aproximadamente 31B) y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 31B en hardware de consumo gracias a las cuantizaciones de 4 bits (entre 17,9 y 18,8 GB), manteniendo la orientación del merge original hacia la generación literaria y el diálogo de personajes. Al estar basado en la familia Gemma, hereda el tokenizador y el formato conversacional de dicha arquitectura, si bien el autor declara únicamente inglés como idioma soportado.

No se dispone de información publicada sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada; esta ficha lo indica explícitamente en cada apartado afectado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma, según el modelo base; detalles no disponibles) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Ateron/Gemma-4-Writers-31B es un merge construido con mergekit, según las etiquetas del repositorio, a partir de modelos de la familia Gemma. La técnica de merge combina los pesos de varios modelos afinados para obtener un comportamiento híbrido orientado a escritura y roleplay. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base.

La contribución específica de este repositorio es la cuantización: mradermacher genera versiones GGUF con imatrix (matriz de importancia calculada sobre un corpus de calibración) y pesos ponderados, lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. El repositorio incluye además el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. Existe una colección paralela de cuantizaciones estáticas en mradermacher/Gemma-4-Writers-31B-GGUF.

## Capacidades

- Generación de texto creativo: el merge está orientado a escritura y roleplay, según las etiquetas del repositorio.
- Conversación multi-turno: el pipeline declarado es conversacional.
- Diálogo de personajes y narrativa: caso de uso principal implícito en el nombre y las etiquetas del modelo.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integración con infraestructura de inferencia estándar.
- Capacidades de tool calling, function calling, agentes, matemáticas, código, visión o audio: no disponibles en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo de idiomas del repositorio.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar borradores de narrativa, descripciones y diálogos gracias a su afinado específico para escritura, ejecutándose en local con cuantización Q4_K_M (18,8 GB).
- Roleplay y chatbots de personaje: su orientación a roleplay y su formato conversacional lo hacen adecuado para aplicaciones de personajes interactivos; el despliegue con llama.cpp u Ollama permite mantener la conversación en hardware propio.
- Generación de contenido editorial en inglés: redacción de artículos, guiones o ficción breve donde se requiera un tono literario consistente y control de estilo mediante prompting.
- Prototipado de asistentes conversacionales: al ser un GGUF compatible con endpoints, puede integrarse en un backend de pruebas para validar flujos conversacionales antes de migrar a un modelo mayor.
- Fine-tuning posterior sobre GGUF: el fichero imatrix incluido permite generar cuantizaciones propias adaptadas a dominios específicos de escritura.
- Investigación sobre merges de modelos: útil para estudiar el comportamiento de merges de la familia Gemma en tareas creativas frente a los modelos originales.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las cuantizaciones de 7-13 GB permiten ejecución en CPU o GPU de consumo para tareas de generación literaria por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,3 GB (IQ1_S) hasta 25,3 GB (Q6_K); la opción recomendada Q4_K_M ocupa 18,8 GB y Q4_K_S 17,9 GB.
- GPU recomendadas: para Q4_K_M o superiores, GPU con 24 GB o más (RTX 3090, RTX 4090, A10G, L4 con offload parcial); para cuantizaciones de 13-16 GB, GPU de 16 GB (RTX 4080, A4000); para IQ2/IQ3, GPU de 12 GB (RTX 3060, 4070).
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M; en RTX 3060 de 12 GB con IQ2_M o IQ3_XS; en equipos con 16 GB de RAM puede ejecutarse en CPU con cuantizaciones IQ2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-Writers-31B-i1-GGUF (este) | 30,7B | no disponible | Apache 2.0 | GGUF (imatrix) | Merge orientado a escritura y roleplay, solo inglés |
| Gemma-4-Writers-31B-GGUF (mradermacher) | 30,7B | no disponible | Apache 2.0 | GGUF (estático) | Mismo modelo base, cuantizaciones estáticas |
| Ateron/Gemma-4-Writers-31B | 30,7B | no disponible | Apache 2.0 | safetensors | Modelo base del merge, sin cuantizar |
| Modelos de 31B de la familia Gemma original | no disponible | no disponible | Apache 2.0 (según familia) | safetensors/GGUF | Alternativa generalista; no se dispone de datos comparativos de rendimiento |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al derivar de la familia Gemma, puede heredar sesgos de sus modelos originales, pero no se confirma.
- Riesgo de alucinación: no cuantificado; un modelo orientado a ficción y roleplay puede generar contenido plausible pero inventado, especialmente en contextos factuales.
- Limitaciones de idioma: solo se declara inglés; no hay evidencia de buen rendimiento en castellano.
- Longitud de contexto: no disponible, lo que impide garantizar conversaciones largas o documentos extensos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos originales que componen el merge, no documentadas en esta ficha.
- Cuantizaciones extremas: las versiones IQ1 e IQ2 degradan notablemente la calidad; el autor las describe como "for the desperate" o "mostly desperate".
- Modelo derivado: al ser una cuantización de un merge de terceros, la responsabilidad sobre el comportamiento del modelo base recae en Ateron, no en mradermacher.
- Sin benchmarks: no hay métricas publicadas que respalden afirmaciones de calidad frente a otros modelos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-4-Writers-31B-i1-GGUF
- Modelo base: https://huggingface.co/Ateron/Gemma-4-Writers-31B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Gemma-4-Writers-31B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Gemma-4-Writers-31B-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
