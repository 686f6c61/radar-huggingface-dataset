# mradermacher/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic-i1-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones en formato GGUF del modelo `Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic`, un modelo derivado de la familia Qwen 3.5 que combina técnicas de multi-destilación y fusión de ocho modelos (merge), según se desprende de su propio nombre. El trabajo de cuantización lo firma mradermacher, un autor habitual en la publicación de versiones GGUF de modelos de terceros para su uso con llama.cpp y herramientas compatibles.

El modelo base del que parte es una variante "uncensored" y "heretic", etiquetas que en la comunidad indican que se ha aplicado algún tipo de ablación o ajuste para reducir los rechazos y los sesgos de alineación del modelo original. Esto lo hace relevante para quienes necesitan un modelo pequeño (4B) con comportamiento menos restrictivo y ejecutable en hardware de consumo, pero también introduce advertencias importantes sobre su idoneidad en producción.

La información disponible es muy escasa: la model card del repositorio no incluye especificaciones, benchmarks ni detalles de entrenamiento, y los metadatos de Hugging Face no aportan licencia, idiomas ni pipeline. El dato de parámetros totales en safetensors (1.797.272) no es coherente con un modelo de 4B y probablemente corresponde a un componente auxiliar o a un error de metadatos, por lo que debe tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, derivado de Qwen 3.5) |
| Parametros totales | no disponible de forma fiable; el nombre indica 4B, mientras que los metadatos de safetensors indican 1.797.272 (dato inconsistente) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_L, IQ4_XS, IQ4_NL (small), Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones de un modelo original en otro formato) |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación empleadas. Por el nombre del modelo base (`MultiDistill-Megamix-8xMerge`) se deduce que se trata de un merge de ocho modelos, presumiblemente combinados mediante alguna técnica de fusión de pesos, y que incorpora destilación múltiple de modelos mayores. Las etiquetas "UNCENSORED" y "heretic" sugieren una ablación de direcciones de rechazo o un ajuste fino orientado a eliminar comportamientos de negativa, pero no hay documentación técnica que lo confirme.

Las cuantizaciones publicadas emplean el método de imatrix (importance matrix) ponderado, según los metadatos de la model card. Esto implica que las versiones de baja precisión (Q2, IQ2, IQ3) se han calibrado con una matriz de importancia para preservar mejor la calidad en bits reducidos. No se documenta ninguna innovación arquitectónica adicional, ni decodificación especulativa, ni atención lineal.

## Capacidades

- Generación de texto en formato conversacional, heredada del modelo base Qwen 3.5.
- Comportamiento menos restrictivo que el modelo original, debido a la ablación "uncensored/heretic".
- Capacidades de razonamiento y código presumibles por la familia de origen, aunque no documentadas.
- Soporte de tool calling, agentes o modo thinking: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Experimentación en local con llama.cpp: el tamaño de 4B y las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar el modelo en portátiles con GPU modesta o incluso en CPU, útil para pruebas de concepto.
- Investigación sobre alineación y censura: el carácter "uncensored/heretic" lo hace interesante para estudiar cómo la ablación afecta a las respuestas del modelo en dominios sensibles, siempre en entornos controlados.
- Generación creativa sin filtros: escritura de ficción o guiones donde el modelo original podría rechazar temáticas adultas o controvertidas.
- Prototipado rápido de asistentes conversacionales: al ser un modelo pequeño, permite iterar en el diseño de prompts y flujos sin coste de infraestructura.
- Evaluación de técnicas de merge y destilación: sirve como caso de estudio de cómo se comportan los merges de ocho modelos en tareas estándar frente al modelo original.
- Despliegue en dispositivos con recursos limitados: las variantes IQ2/IQ3 permiten ejecución en equipos con menos de 4 GB de RAM/VRAM, a costa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para un modelo de 4B: aproximadamente 2,5-3 GB en Q4_K_M, 1,5-2 GB en IQ2/IQ3, y 3,5-4,5 GB en Q6_K, sin contar el contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 o superiores para mayor velocidad; también funciona en GPUs con 6-8 GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más, y en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (tras importar el GGUF), LM Studio, text-generation-webui y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B merge) | 4B (nominal) | no disponible | no disponible | GGUF | Merge de 8 modelos, uncensored |
| Qwen2.5-3B-Instruct | 3B | 32K | Apache 2.0 | safetensors, GGUF | Modelo oficial, documentado |
| Llama 3.2 3B Instruct | 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Modelo oficial, multilingüe |
| Phi-3.5-mini | 3,8B | 128K | MIT | safetensors, GGUF | Modelo oficial, buen rendimiento en razonamiento |

La comparación es aproximada: no hay datos de rendimiento del modelo evaluado, y su licencia y contexto no están documentados, lo que limita la comparación rigurosa con alternativas oficiales.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide determinar si el uso comercial es legalmente viable; hay que contactar con el autor o asumir riesgo.
- El carácter "uncensored/heretic" implica que el modelo puede generar contenido ofensivo, ilegal o dañino sin filtros, lo que lo desaconseja para aplicaciones de cara al público.
- Riesgo elevado de alucinación y de respuestas incoherentes, especialmente en cuantizaciones IQ2/IQ3.
- El dato de parámetros en safetensors (1.797.272) es inconsistente con el nombre del modelo; conviene verificar el tamaño real antes de desplegarlo.
- No hay información sobre sesgos, idiomas soportados ni longitud de contexto, lo que dificulta su integración en pipelines de producción.
- Al ser un merge de ocho modelos, puede heredar comportamientos erráticos o inconsistencias de los modelos componentes.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic-i1-GGUF
- Modelo base original: https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic
