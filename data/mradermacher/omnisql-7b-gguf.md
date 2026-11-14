# mradermacher/OmniSQL-7B-GGUF

## Resumen

OmniSQL-7B-GGUF es la versión cuantizada en formato GGUF de OmniSQL-7B, un modelo especializado en traducción de lenguaje natural a SQL (Text-to-SQL o NL2SQL) desarrollado originalmente por el equipo de seeklhy y empaquetado para inferencia local por mradermacher. El modelo base parte de una arquitectura transformer de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) y se ha entrenado específicamente sobre el dataset SynSQL-2.5M, un corpus masivo de pares pregunta-SQL diseñado para cubrir una amplia variedad de esquemas de bases de datos y dialectos SQL. La versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de GPUs de datacenter.

La relevancia de este modelo radica en su especialización: a diferencia de los modelos generalistas, OmniSQL-7B está afinado para generar consultas SQL correctas a partir de instrucciones en inglés, lo que lo hace útil en pipelines de analítica de datos, asistentes de BI y herramientas de consulta sobre bases de datos relacionales. El formato GGUF con múltiples niveles de cuantización (desde Q2_K hasta f16) ofrece un abanico de opciones que van desde los 3,1 GB hasta los 15,3 GB, permitiendo desplegarlo en desde portátiles hasta servidores con GPU dedicada.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos propietarios. Está etiquetado únicamente para inglés y su pipeline no está especificado en la información disponible, aunque las etiquetas indican compatibilidad con transformers y endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base OmniSQL-7B, derivado de un LLM de 7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

OmniSQL-7B se basa en una arquitectura transformer estándar de aproximadamente 7,6 mil millones de parámetros, afinada específicamente para la tarea de Text-to-SQL. El entrenamiento se realizó sobre el dataset SynSQL-2.5M (seeklhy/SynSQL-2.5M), un corpus a gran escala de pares de instrucciones en lenguaje natural y consultas SQL asociadas, diseñado para exponer al modelo a una amplia diversidad de esquemas relacionales, dialectos SQL y patrones de consulta. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La versión GGUF es una cuantización estática del modelo base realizada por mradermacher, sin cambios en la arquitectura ni en los pesos más allá de la reducción de precisión. Se ofrecen tanto cuantizaciones estáticas (este repositorio) como cuantizaciones ponderadas/imatrix en un repositorio separado (mradermacher/OmniSQL-7B-i1-GGUF), que suelen ofrecer mejor calidad por tamaño similar. No se han documentado innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de consultas SQL a partir de instrucciones en lenguaje natural (Text-to-SQL / NL2SQL).
- Especialización en esquemas de bases de datos relacionales y múltiples dialectos SQL, gracias al entrenamiento sobre SynSQL-2.5M.
- Generación de texto conversacional en inglés (etiqueta "conversational").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistentes de consulta sobre bases de datos: el modelo traduce preguntas de usuario en inglés a consultas SQL ejecutables, integrándose en interfaces de chat o paneles de BI para que usuarios no técnicos puedan interrogar bases de datos relacionales sin escribir SQL manualmente.
- Generación automática de informes y analítica: en pipelines de datos, OmniSQL-7B puede generar consultas SQL a partir de plantillas de preguntas predefinidas, alimentando dashboards y sistemas de reporting con consultas dinámicas sobre esquemas cambiantes.
- Herramientas de desarrollo y productividad: integración en IDE o editores SQL para sugerir consultas a partir de descripciones en lenguaje natural, acelerando el trabajo de analistas y desarrolladores de datos.
- Educación y formación en SQL: el modelo puede servir como tutor que muestra la consulta SQL equivalente a una pregunta en lenguaje natural, ayudando a estudiantes a comprender la traducción entre intención y consulta.
- Validación y depuración de consultas: dado un esquema y una pregunta, el modelo puede generar una consulta de referencia que sirva para comparar con consultas escritas manualmente y detectar errores lógicos.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF (desde 3,1 GB en Q2_K), el modelo puede ejecutarse en portátiles o estaciones de trabajo sin GPU dedicada mediante llama.cpp, lo que facilita prototipado y pruebas locales antes de escalar a producción.
- Automatización de migraciones de datos: el modelo puede generar consultas de transformación y extracción sobre esquemas legacy, ayudando en procesos de migración entre sistemas de bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB (Q2_K), 4,6-4,8 GB (Q4_K_S / Q4_K_M), 5,4-5,5 GB (Q5_K_S / Q5_K_M), 6,4 GB (Q6_K), 8,2 GB (Q8_0) y 15,3 GB (f16). Estas cifras corresponden al tamaño de los archivos; la VRAM real necesaria puede ser algo superior por el contexto y los buffers de inferencia.
- GPU recomendadas: para cuantizaciones Q4-Q5, una GPU consumer con 8 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) es suficiente; para Q8_0 se recomienda 10-12 GB (RTX 3080, RTX 4070 Ti); para f16 se recomienda 16 GB o más (RTX 4080, RTX 4090, A100).
- Cabe en GPU consumer: sí, en la mayoría de cuantizaciones (Q2_K a Q8_0) en GPUs con 6-12 GB de VRAM. La versión f16 requiere GPU de gama alta o profesional.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, text-generation-webui, LM Studio). Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| OmniSQL-7B-GGUF | 7,6B | No disponible | Text-to-SQL | Apache 2.0 | GGUF |
| OmniSQL-7B (base) | 7,6B | No disponible | Text-to-SQL | Apache 2.0 | Safetensors |
| Modelos generalistas 7B (p. ej. Llama, Mistral) | ~7B | Variable | Generales | Variable | Safetensors, GGUF |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de OmniSQL-7B con alternativas especializadas en Text-to-SQL en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un dataset sintético (SynSQL-2.5M), puede heredar sesgos de la generación automática de datos.
- Riesgo de alucinación: como todo LLM, puede generar consultas SQL sintácticamente válidas pero semánticamente incorrectas o referencias a tablas/columnas inexistentes; se recomienda validación contra el esquema real antes de ejecutar.
- Limitaciones de contexto o idioma: el modelo está etiquetado únicamente para inglés; no se garantiza un rendimiento adecuado en otros idiomas. La longitud de contexto no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero se debe conservar el aviso de licencia y atribuir correctamente.
- Caveats para producción: las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad de las consultas generadas; se recomienda Q4_K_M o superior para uso en producción. La versión GGUF no incluye el tokenizador ni la configuración del modelo base, por lo que es necesario usar el runtime adecuado.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/OmniSQL-7B-GGUF
- Modelo base: https://huggingface.co/seeklhy/OmniSQL-7B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/OmniSQL-7B-i1-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#OmniSQL-7B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Repositorio de solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
