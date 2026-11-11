# Austriani/Vesper-31B-Nocturne-ik_llama.cpp

## Resumen

Vesper-31B-Nocturne-ik_llama.cpp es una cuantización GGUF del modelo de lenguaje Vesper-31B-Nocturne, publicado por el usuario Austriani sobre el modelo base de ReadyArt. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada al motor de inferencia ik_llama.cpp, una bifurcación de llama.cpp optimizada para cuantizaciones IQK y kernels específicos. El paquete se distribuye con licencia Apache 2.0 y está etiquetado como modelo de generación de texto en inglés, con un enfoque declarado hacia roleplay, ficción oscura y contenido sin censura para adultos.

El modelo base, según las etiquetas de la ficha, se asocia a la familia Gemma-4 y a un tamaño nominal de 31B parámetros, aunque no se especifican detalles de arquitectura, número exacto de parámetros ni longitud de contexto en la información disponible. La relevancia de esta publicación es acotada: se trata de una cuantización comunitaria de un fine-tune con fines creativos, no de un lanzamiento de investigación con benchmarks públicos.

La ficha describe únicamente lo que puede verificarse en la información proporcionada. Cualquier dato sobre rendimiento, contexto o composición del entrenamiento que no aparezca en la model card se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como gemma-4 en los tags; sin confirmación técnica) |
| Parametros totales | 31B (nominal, según nombre y tags del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con esquemas IQK, trellis-quant, imatrix y calibración v3 (según tags) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (librería ik_llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna del modelo base Vesper-31B-Nocturne en la documentación proporcionada. Los tags mencionan "gemma-4" y "31b", lo que sugiere una base de la familia Gemma con aproximadamente 31.000 millones de parámetros, pero no se confirma ni la variante concreta, ni si emplea atención estándar, atención lineal u otra innovación. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Respecto al proceso de cuantización, la model card indica el uso de imatrix con calibración "v3", esquemas IQK y trellis-quant, y está orientada al runtime ik_llama.cpp. Estos elementos afectan a la calidad de la cuantización y a la compatibilidad del motor, pero no constituyen información sobre el entrenamiento del modelo original. El fine-tune del que deriva (ReadyArt/Vesper-31B-Nocturne) está etiquetado para roleplay, dark-fiction, erotic-horror y contenido sin censura, lo que orienta su distribución hacia dominios creativos y conversacionales adultos.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno y roleplay.
- Escritura creativa de ficción oscura y horror erótico, según la orientación declarada del fine-tune.
- Modo sin censura (uncensored): el autor indica ausencia de filtros de contenido en el modelo base.
- Generación de texto plano; no se documentan capacidades multimodales (visión, audio) en la información disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está afinado específicamente para diálogo de personajes, por lo que puede mantener interacciones multi-turno con coherencia de personaje en entornos de ocio o prototipado de videojuegos narrativos.
- Escritura de ficción oscura y terror: adecuado para generar borradores de relatos de horror, atmósferas góticas y narrativa adulta, dado el enfoque declarado del fine-tune.
- Prototipado de narrativa interactiva para videojuegos: puede emplearse como motor de diálogo en demos de aventuras conversacionales con temática adulta, siempre con las advertencias de contenido correspondientes.
- Generación de contenido creativo sin restricciones en entornos controlados: útil para autores que necesitan explorar tonos y temáticas que los modelos alineados rechazan, en un contexto de uso privado y con revisión humana.
- Experimentación con cuantizaciones IQK en ik_llama.cpp: sirve como banco de pruebas para evaluar el rendimiento de esquemas trellis-quant e imatrix v3 en hardware de consumo con un modelo de 31B.
- Investigación sobre alineación y censura: permite comparar el comportamiento de un modelo sin censura frente a alternativas alineadas en tareas creativas, como estudio de sesgos y límites de seguridad.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF, puede ejecutarse en equipos con GPU de consumo mediante ik_llama.cpp, sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de 31B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 18-20 GB y las de 8 bits en torno a 33-35 GB, pero estas cifras no están confirmadas en la documentación del autor.
- GPU recomendadas: no especificadas. Por tamaño, un modelo de 31B en cuantización agresiva puede caber en GPUs de consumo con 24 GB (RTX 3090, RTX 4090) y requiere GPUs profesionales (A100 40/80 GB, H100) para cuantizaciones mayores o contexto extendido.
- Compatibilidad con GPU de consumo: probable en cuantizaciones de 4 bits con 24 GB de VRAM, aunque no confirmado por el autor.
- Opciones de despliegue: ik_llama.cpp es el runtime objetivo declarado. La compatibilidad con llama.cpp, Ollama o vLLM no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones suficientes para establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como NSFW y `not-for-all-audiences`; no es apto para entornos sin control de edad ni para aplicaciones de cara al público general.
- Sin censura: la ausencia de filtros implica riesgo de generar contenido ofensivo, explícito o inapropiado; requiere moderación externa en cualquier despliegue.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual; como modelo creativo, la precisión en datos verificables es incierta.
- Idioma: soporte limitado al inglés; el rendimiento en castellano no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado y las obligaciones derivadas del modelo base deben revisarse por separado; la ficha no aclara posibles restricciones adicionales del fine-tune original.
- Contexto: se desconoce la longitud de ventana, lo que impide planificar aplicaciones de contexto largo con garantías.
- Madurez: publicación con cero descargas y cero likes en el momento de la consulta; sin validación comunitaria ni reportes de calidad.
- Compatibilidad: al estar empaquetado para ik_llama.cpp, puede no cargar correctamente en otros runtimes sin conversión previa.

## Enlaces

- [Hugging Face: Austriani/Vesper-31B-Nocturne-ik_llama.cpp](https://huggingface.co/Austriani/Vesper-31B-Nocturne-ik_llama.cpp)
- [Modelo base: ReadyArt/Vesper-31B-Nocturne](https://huggingface.co/ReadyArt/Vesper-31B-Nocturne)
- No se han encontrado en la información proporcionada papers, blogs, repositorios o demos adicionales.
