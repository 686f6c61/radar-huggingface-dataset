# mradermacher/Argos-2B-GGUF

## Resumen

Argos-2B es un modelo de lenguaje de 2.000 millones de parámetros desarrollado por Fabrix-AI-Inc, del que mradermacher ofrece una versión cuantizada en formato GGUF para su ejecución local eficiente. El modelo base se presenta como un modelo conversacional en inglés, con licencia Apache 2.0, y los metadatos sugieren un entrenamiento orientado a recuperación de citas (citation-retrieval) y optimización mediante DPO (Direct Preference Optimization). Aunque la información pública es escasa, la arquitectura parece derivar de la familia Qwen3.5, según las etiquetas del repositorio.

La relevancia de esta ficha radica en que Argos-2B es un modelo compacto que puede ejecutarse en hardware de consumo, lo que lo hace atractivo para aplicaciones de nicho como la generación de respuestas con referencias bibliográficas o asistentes conversacionales ligeros. La versión GGUF de mradermacher incluye múltiples niveles de cuantización, desde Q2_K hasta f16, así como complementos multimodales (mmproj), lo que amplía sus posibles usos.

Sin embargo, al ser una cuantización de un modelo base reciente y poco documentado, se recomienda precaución: no se dispone de benchmarks oficiales ni de detalles de entrenamiento publicados, por lo que las capacidades reales deben validarse empíricamente antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (posible derivado de Qwen3.5 según etiquetas) |
| Parametros totales | 1.942.653.248 (~1,94 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna del modelo base Fabrix-AI-Inc/Argos-2B. Las etiquetas del repositorio mencionan "qwen3_5", lo que sugiere una base derivada de la familia Qwen, pero no se confirma el tipo de atencion, el numero de capas ni el mecanismo de atencion (full, linear, etc.). Tampoco se especifican los datos de entrenamiento, el numero de tokens procesados ni el procedimiento de alineacion, aunque la presencia de "dpo" y "rdaf" en las etiquetas indica que se aplico Direct Preference Optimization y probablemente un proceso de retroalimentacion con recuperacion aumentada (RDAF, posiblemente Retrieval-Augmented DPO). El modelo base esta disponible en HuggingFace, pero su model card no se incluye en la informacion proporcionada.

La cuantizacion realizada por mradermacher es estatica (no utiliza imatrix), como se indica en los comentarios del README. Los archivos GGUF se generaron a partir de los pesos originales en formato safetensors, y se incluyen dos archivos mmproj (proyeccion multimodal) que sugieren que el modelo base podria tener capacidades de vision, aunque no se detalla su funcionamiento.

## Capacidades

- Generacion de texto conversacional en ingles.
- Posible recuperacion de citas o referencias (segun la etiqueta "citation-retrieval"), lo que implicaria capacidad para generar respuestas con fuentes.
- Optimizacion mediante DPO, lo que sugiere una preferencia por respuestas utiles y seguras.
- Soporte de entrada multimodal (vision) gracias a los archivos mmproj incluidos en la cuantizacion, aunque no se especifica el tipo de vision (imagen, video, etc.).
- No se menciona soporte explicito de tool calling, function calling ni agentes multi-paso.
- No se indica capacidad de razonamiento avanzado ni modo "thinking" (como en otros modelos recientes).

## Casos de uso

- Asistentes conversacionales ligeros: gracias a su tamano de 2B, puede ejecutarse en CPU o GPU de gama baja, permitiendo chatbots locales en aplicaciones de escritorio o moviles sin conexion.
- Generacion de respuestas con citas: si la etiqueta "citation-retrieval" se refleja en el comportamiento, podria usarse en sistemas de preguntas y respuestas que requieran indicar la fuente de la informacion, como en entornos academicos o de documentacion.
- Prototipado rapido de aplicaciones de IA: al ser un modelo pequeno y con licencia Apache 2.0, es adecuado para experimentar con tecnicas de fine-tuning o integracion en pipelines de prueba.
- Clasificacion y extraccion de informacion: aunque no se especifica, los modelos de 2B suelen ser utiles para tareas de clasificacion de texto, analisis de sentimiento o resumen, siempre que se ajusten al dominio.
- Educacion y demostraciones: para ensenar conceptos de LLMs locales, cuantizacion o despliegue con llama.cpp, su tamano reducido facilita su uso en entornos educativos.
- Sistemas de recomendacion basados en texto: puede generar descripciones o resenas personalizadas en aplicaciones de comercio electronico, siempre que se adapte al idioma ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para Argos-2B. Se recomienda realizar pruebas propias antes de considerar su uso en produccion.

## Requisitos de hardware

- VRAM estimada: para la cuantizacion Q4_K_M (1,4 GB) se necesitan aproximadamente 2 GB de VRAM si se usa GPU, o unos 4-5 GB de RAM en CPU con llama.cpp. La version f16 (4 GB) requiere al menos 6 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutar las cuantizaciones Q4 o Q5. Para f16 se recomienda al menos 6 GB (RTX 3060, RTX 2060, etc.).
- En consumer GPU: si, cabe en GPUs de gama de entrada y media.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, o servidores compatibles con GGUF como text-generation-webui.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 3060, un modelo de 2B en Q4_K_M podria generar entre 30 y 60 tokens por segundo, pero es una estimacion orientativa.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de tamano similar. Como referencia generica, se pueden considerar modelos como Qwen2.5-1.5B, Gemma-2-2B o Phi-3-mini (3.8B), pero no hay datos de rendimiento de Argos-2B frente a ellos. La falta de benchmarks impide una comparacion objetiva.

## Limitaciones y advertencias

- No hay informacion publica sobre sesgos, alucinaciones o limitaciones de contexto. Se debe asumir que un modelo de 2B tiene mayor riesgo de alucinacion que modelos mas grandes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.
- El idioma soportado es solo ingles; no se garantiza un rendimiento aceptable en otros idiomas.
- La cuantizacion estatica (sin imatrix) puede degradar la calidad en niveles bajos (Q2, Q3). Se recomienda usar Q4_K_M o superior para un equilibrio entre calidad y tamano.
- No se ha verificado la capacidad multimodal real; los archivos mmproj podrian no funcionar correctamente en todos los runners GGUF.
- El modelo es muy reciente (creado en agosto de 2026) y la comunidad aun no ha aportado evaluaciones independientes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Argos-2B-GGUF
- Modelo base: https://huggingface.co/Fabrix-AI-Inc/Argos-2B
- Pagina de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Herramienta para comprobar si el modelo cabe en tu GPU: https://modelfitcheck.com/
