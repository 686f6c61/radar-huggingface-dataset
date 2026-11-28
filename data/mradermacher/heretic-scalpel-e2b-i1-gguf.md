# mradermacher/Heretic-Scalpel-E2B-i1-GGUF

## Resumen

Heretic-Scalpel-E2B-i1-GGUF es una recopilación de cuantizaciones GGUF generadas por mradermacher a partir del modelo base aifeifei798/Heretic-Scalpel-E2B. Se trata de un modelo de lenguaje conversacional de aproximadamente 4.647 millones de parámetros (según los pesos en safetensors del modelo original), empaquetado en formato GGUF para su ejecución eficiente en CPU y GPU mediante llama.cpp y herramientas compatibles. La model card indica que es un modelo de visión, con archivos mmproj disponibles en el repositorio estático del mismo autor.

El interés principal de esta publicación reside en la disponibilidad de cuantizaciones con imatrix (etiquetadas i1), que aplican una matriz de importancia para preservar mejor la calidad en niveles de compresión agresivos. El repositorio ofrece un abanico de 22 cuantizaciones que van desde i1-Q2_K (3,1 GB) hasta i1-Q6_K (3,9 GB), lo que permite desplegar el modelo en hardware de consumo con requisitos de memoria moderados. Está publicado bajo licencia Apache 2.0, aunque la model card enlaza a la licencia de Gemma 4 de Google, lo que introduce una ambigüedad relevante para uso comercial.

El modelo se distribuye únicamente en inglés y está orientado a casos de conversación. Al tratarse de una cuantización y no de un modelo original, no se dispone de información sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: aifeifei798/Heretic-Scalpel-E2B) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 (model card enlaza a la licencia de Gemma 4) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. El nombre "E2B" sugiere una variante de la familia Gemma, y la model card enlaza explícitamente a la licencia de Gemma 4, pero no se confirma la arquitectura concreta (transformer denso, MoE u otra). Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La contribución técnica de esta publicación es el proceso de cuantización: se generan cuantizaciones ponderadas con imatrix a partir de un archivo de importancia (Heretic-Scalpel-E2B.imatrix.gguf, 0,1 GB), lo que según el autor mejora la calidad frente a cuantizaciones estáticas de tamaño similar. La model card incluye además referencias a comparativas de perplejidad entre tipos de cuantización de ikawrakow y Artefact2. El modelo base se describe como modelo de visión, con archivos mmproj en el repositorio estático.

## Capacidades

- Generación de texto conversacional en inglés.
- Capacidades de visión: la model card indica que es un modelo de visión y que los archivos mmproj están en el repositorio estático.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible en la documentación.

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse en equipos de consumo con cuantizaciones i1-Q4_K_M (3,5 GB), lo que permite desplegar un chatbot en inglés sin conexión a servicios en la nube.
- Prototipado rápido en portátiles: con i1-Q2_K o i1-IQ3_S (3,1-3,2 GB) se puede validar un flujo conversacional en hardware con poca VRAM antes de escalar a un modelo mayor.
- Análisis de imágenes en local: al ser un modelo de visión, puede utilizarse con los archivos mmproj del repositorio estático para tareas de descripción o respuesta a preguntas sobre imágenes, siempre que se valide la calidad de las cuantizaciones.
- Evaluación de cuantizaciones: el abanico de 22 variantes permite comparar perplejidad y calidad de salida entre niveles de compresión para elegir el equilibrio adecuado en producción.
- Integración en pipelines de CI/CD para pruebas de regresión: un modelo pequeño y ligero permite ejecutar pruebas automatizadas de generación de texto en cada commit sin coste de API.
- Despliegue en entornos con restricciones de red: al distribuirse como GGUF y ejecutarse con llama.cpp, puede operar en sistemas aislados donde no se permite el acceso a modelos alojados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3,1 GB (i1-Q2_K) y 3,9 GB (i1-Q6_K) solo para los pesos; hay que sumar el contexto KV cache y, en su caso, el proyector de visión (mmproj).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para las cuantizaciones más pequeñas; para i1-Q6_K se recomienda 8 GB o más.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB) o superiores; también en GPUs integradas con suficiente memoria compartida, aunque con menor throughput.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; la etiqueta endpoints_compatible sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput estimados: no disponible en la documentación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Heretic-Scalpel-E2B-i1-GGUF | 4.647 M | no disponible | apache-2.0 | GGUF | Cuantizaciones imatrix de un modelo base de visión |
| Heretic-Scalpel-E2B-GGUF (static) | 4.647 M | no disponible | apache-2.0 | GGUF | Cuantizaciones estáticas del mismo modelo base |
| Modelo base aifeifei798/Heretic-Scalpel-E2B | 4.647 M | no disponible | apache-2.0 | safetensors | Pesos originales sin cuantizar |

No se dispone de información sobre modelos alternativos de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Al ser una cuantización, puede presentar degradación de calidad frente al modelo base, especialmente en las variantes de 2 y 3 bits.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Ambigüedad de licencia: la etiqueta indica apache-2.0, pero la model card enlaza a la licencia de Gemma 4, que puede imponer restricciones adicionales para uso comercial; conviene verificar antes de desplegar en producción.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La información sobre contexto, arquitectura y entrenamiento no está disponible, lo que dificulta evaluar su idoneidad para tareas de contexto largo.
- Las capacidades de visión dependen de los archivos mmproj del repositorio estático; no se garantiza que todas las cuantizaciones incluyan el proyector.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Heretic-Scalpel-E2B-i1-GGUF
- Modelo base: https://huggingface.co/aifeifei798/Heretic-Scalpel-E2B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Heretic-Scalpel-E2B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Heretic-Scalpel-E2B-i1-GGUF
- README de referencia para GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
