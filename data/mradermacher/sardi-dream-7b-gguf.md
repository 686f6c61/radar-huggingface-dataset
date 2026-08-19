# mradermacher/sardi-dream-7b-GGUF

## Resumen

El modelo `mradermacher/sardi-dream-7b-GGUF` es una colección de cuantizaciones GGUF del modelo base `pauljngr/sardi-dream-7b`, un modelo de lenguaje de 7.6 mil millones de parámetros basado en arquitectura de difusión (diffusion language model). La cuantización ha sido realizada por mradermacher, un proveedor habitual de formatos GGUF optimizados para inferencia local en CPU y GPU. El modelo está etiquetado con capacidades de generación de lenguaje, retrieval-augmented generation (RAG) y razonamiento multi-hop, lo que sugiere un diseño orientado a tareas de respuesta a preguntas complejas y recuperación de información.

La relevancia actual de este modelo radica en que los modelos de difusión de lenguaje representan una alternativa emergente a los transformers autorregresivos, ofreciendo potencialmente mejoras en eficiencia y control de generación. Al estar disponible en formato GGUF, permite su ejecución en hardware de consumo mediante herramientas como llama.cpp u Ollama, lo que facilita su adopción en entornos de desarrollo e investigación. Sin embargo, la información pública sobre el modelo base es escasa, y esta ficha se basa principalmente en los metadatos del repositorio y en el proyecto Dream 7B, del que probablemente deriva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model (probablemente basado en el proyecto Dream 7B) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

La arquitectura exacta de `sardi-dream-7b` no está documentada en la información disponible. Los metadatos del repositorio indican que se trata de un "diffusion language model", un tipo de modelo que genera texto mediante un proceso de denoising iterativo en lugar de predicción autorregresiva token a token. Esta familia de modelos, ejemplificada por el proyecto Dream 7B (repositorios `ksu-oor/dream` y `DreamLM/Dream`), busca lograr rendimiento competitivo con modelos autorregresivos de tamaño similar, pero con un enfoque diferente en la generación.

No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se conocen innovaciones técnicas específicas del modelo base. La cuantización GGUF ha sido realizada por mradermacher mediante conversión estática (sin imatrix), tal como se indica en la model card. Se recomienda consultar el repositorio del proyecto Dream para obtener información más detallada sobre la arquitectura subyacente.

## Capacidades

- Generación de texto: como modelo de difusión de lenguaje, es capaz de producir texto coherente, aunque no se especifican sus capacidades exactas en este ámbito.
- Retrieval-augmented generation (RAG): los tags del modelo indican soporte para RAG, lo que sugiere que puede integrarse con sistemas de recuperación de documentos para responder preguntas basadas en contexto externo.
- Razonamiento multi-hop: el modelo está etiquetado para multi-hop QA, es decir, tareas que requieren combinar información de múltiples fuentes o pasos de razonamiento.
- Multilingüismo: limitado al inglés según la etiqueta de idioma.
- Otras capacidades: no se mencionan capacidades de visión, audio, tool calling o agentes en la información disponible.

## Casos de uso

- Respuesta a preguntas sobre documentos técnicos: gracias a su soporte RAG y multi-hop QA, el modelo puede utilizarse para construir sistemas que respondan preguntas complejas a partir de una base documental, combinando fragmentos de varios documentos para dar una respuesta sintetizada.
- Búsqueda semántica aumentada: integrado con un pipeline de recuperación (por ejemplo, embeddings + búsqueda vectorial), puede generar respuestas contextualizadas a partir de los resultados recuperados, mejorando la precisión frente a búsquedas por palabras clave.
- Asistente de investigación: para investigadores que necesitan resumir o extraer conclusiones de múltiples artículos científicos, el modelo puede procesar consultas multi-hop y devolver respuestas que cruzan información de varias fuentes.
- Generación de informes automáticos: en entornos empresariales, puede redactar informes breves a partir de datos estructurados o no estructurados, siempre que se le proporcione el contexto necesario.
- Prototipado de chatbots especializados: al ser un modelo de difusión, puede explorarse como base para chatbots con control de estilo o longitud de respuesta, aunque su madurez para producción no está verificada.
- Evaluación de modelos de difusión: para investigadores interesados en comparar arquitecturas de difusión frente a autorregresivas, este modelo en GGUF permite experimentos locales sin necesidad de GPUs de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio del proyecto Dream 7B menciona rendimiento competitivo con modelos autorregresivos de tamaño similar, pero no se proporcionan cifras concretas para `sardi-dream-7b`. Se recomienda consultar el repositorio original para posibles evaluaciones futuras.

## Requisitos de hardware

- Las cuantizaciones más pequeñas (Q2_K, 3,1 GB; Q3_K_S, 3,6 GB) pueden ejecutarse en GPUs con 4-6 GB de VRAM, como una GTX 1660 o RTX 3050, con solapamiento parcial en CPU.
- Las cuantizaciones intermedias (Q4_K_M, 4,8 GB; Q5_K_M, 5,5 GB) requieren al menos 8 GB de VRAM, por lo que son adecuadas para RTX 3060, RTX 4060 o GPUs de 8 GB.
- Las cuantizaciones grandes (Q6_K, 6,4 GB; Q8_0, 8,2 GB) necesitan 10-12 GB de VRAM, recomendándose RTX 3080/4080 o superiores.
- El archivo f16 (15,3 GB) requiere 16 GB o más de VRAM, típico de GPUs profesionales como A100 o RTX 4090.
- Para inferencia en CPU, se puede usar llama.cpp o Ollama; el rendimiento dependerá del número de hilos y de la RAM disponible.
- Para despliegue en servidores, vLLM no soporta directamente modelos de difusión (hasta donde se sabe), por lo que se recomienda usar llama.cpp o el runtime específico del proyecto Dream si existe.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos. Como referencia, se puede mencionar que el proyecto Dream 7B (del que probablemente deriva `sardi-dream-7b`) se posiciona frente a modelos autorregresivos de 7B como LLaMA-2-7B o Mistral-7B, pero no hay datos públicos de benchmarks de `sardi-dream-7b`. Tampoco se conocen otros modelos de difusión de lenguaje de 7B con los que comparar directamente. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- La información pública sobre el modelo base es muy limitada; no se conocen detalles de entrenamiento, sesgos o alucinaciones específicas.
- Al ser un modelo de difusión, su comportamiento puede diferir notablemente de los modelos autorregresivos; los usuarios deben validar su calidad en tareas concretas antes de usarlo en producción.
- El modelo solo soporta inglés; no es adecuado para tareas multilingües.
- No se ha verificado el soporte para tool calling, agentes o razonamiento multi-paso; las capacidades listadas se basan en etiquetas del repositorio, no en pruebas documentadas.
- La licencia Apache 2.0 permite uso comercial, pero la cuantización GGUF no añade restricciones adicionales; sin embargo, se recomienda revisar la licencia del modelo base original.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar significativamente la calidad de generación; se recomienda usar Q4_K_M o superior para tareas serias.
- El repositorio no incluye archivos de configuración adicionales (tokenizer, etc.) más allá de los GGUF; es necesario usar el tokenizer del modelo base, que no está incluido en este repositorio.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: [mradermacher/sardi-dream-7b-GGUF](https://huggingface.co/mradermacher/sardi-dream-7b-GGUF)
- Modelo base (referenciado): [pauljngr/sardi-dream-7b](https://huggingface.co/pauljngr/sardi-dream-7b)
- Proyecto Dream 7B (GitHub): [ksu-oor/dream](https://github.com/ksu-oor/dream) y [DreamLM/Dream](https://github.com/DreamLM/Dream)
- Página de ayuda de mradermacher para solicitudes de modelos: [model_requests](https://huggingface.co/mradermacher/model_requests)
