# mradermacher/Qwen3-0.6B-heretic-decensored-i1-GGUF

## Resumen

mradermacher/Qwen3-0.6B-heretic-decensored-i1-GGUF es una versión cuantizada en formato GGUF del modelo vrhvnsky/Qwen3-0.6B-heretic-decensored, a su vez un derivado "decensored"/"abliterated" de Qwen3-0.6B. El repositorio lo publica mradermacher, un autor conocido por generar cuantizaciones reproducibles con ficheros imatrix para la comunidad de inferencia local. El modelo cuenta con 596.049.920 parámetros (aproximadamente 0,6 mil millones) y se distribuye bajo licencia Apache-2.0.

El interés principal de esta ficha reside en su tamaño: al tratarse de un modelo de menos de 600 millones de parámetros, las cuantizaciones ocupan entre 0,3 GB y 0,6 GB, lo que permite ejecutarlo en CPU, en GPU integradas o en dispositivos de gama baja sin necesidad de hardware dedicado. Los tags del repositorio indican que el modelo ha pasado por un proceso de eliminación de direcciones de rechazo ("abliterated", "decensored", "heretic"), orientado a reducir los filtros de contenido del modelo original.

El modelo está etiquetado únicamente para inglés (en) y como conversacional. No se han publicado resultados de benchmarks ni documentación detallada del proceso de decensurado en la información disponible. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la información proporcionada (modelo base derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 (aproximadamente 0,6 B) |
| Parametros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, más fichero imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 generadas con imatrix) |
| Repositorio | mradermacher/Qwen3-0.6B-heretic-decensored-i1-GGUF |
| Modelo base | vrhvnsky/Qwen3-0.6B-heretic-decensored |
| Tamaño del repositorio | 8,0 GB (conjunto de todas las cuantizaciones) |
| Fecha de creación indicada | 12 de septiembre de 2026 |
| Última actualización indicada | 12 de septiembre de 2026, 11:43 UTC |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna ni el proceso de entrenamiento. El modelo es una cuantización GGUF de vrhvnsky/Qwen3-0.6B-heretic-decensored, que a su vez deriva de Qwen3-0.6B, cuyo fichero de licencia se enlaza desde el repositorio (Qwen/Qwen3-0.6B/blob/main/LICENSE). La arquitectura, la composición del dataset, el número de tokens de entrenamiento y el uso de RLHF, DPO u otras técnicas de alineación no están disponibles en la información proporcionada.

La innovación técnica relevante en este repositorio es el proceso de cuantización: mradermacher genera cuantizaciones "i1" utilizando un fichero imatrix (`Qwen3-0.6B-heretic-decensored.imatrix.gguf`, 0,1 GB) que permite una asignación de bits ponderada por importancia de los tensores. La model card cita explícitamente que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar y recomienda i1-Q4_K_M como opción "rápida y recomendada". Por otro lado, los tags "heretic", "uncensored", "decensored", "abliterated" y "reproducible" apuntan a un proceso de modificación del comportamiento (eliminación de direcciones de rechazo), pero no se detalla metodología, dataset ni métricas de dicho proceso.

## Capacidades

- Generación de texto conversacional en inglés, tal y como indica el tag `conversational` de la model card.
- Ejecución en local mediante el ecosistema GGUF (llama.cpp y derivados), con soporte para cuantizaciones desde IQ1_S hasta Q6_K.
- Comportamiento "decensored"/"abliterated" según los tags del repositorio, orientado a reducir rechazos de contenido respecto al modelo base alineado.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) según los tags del repositorio.
- Capacidad de servir como modelo de referencia ligero para pruebas de pipelines de inferencia.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no acreditadas; el único idioma declarado es inglés.
- Capacidades especiales (modo thinking, visión, audio): no documentadas en la información disponible.

## Casos de uso

- Generación de narrativa y roleplay sin filtros: el modelo está etiquetado como "uncensored"/"decensored", por lo que se orienta a aplicaciones creativas donde el modelo base alineado rechazaría contenido. Su tamaño reducido permite ejecutarlo en un portátil sin GPU dedicada.
- Prototipado rápido de aplicaciones LLM: con cuantizaciones de 0,3-0,6 GB, se puede descargar y cargar el modelo en segundos para validar prompts, plantillas y flujos conversacionales antes de pasar a un modelo mayor.
- Pruebas automatizadas en CI: la cuantización i1-IQ4_XS o i1-Q4_K_M (0,5 GB) permite incluir un LLM real en la batería de tests de un pipeline, verificando el formato de salida y la integración sin coste de GPU.
- Asistentes conversacionales embebidos: al caber en menos de 1 GB de memoria, es viable desplegarlo en una Raspberry Pi, en un contenedor ligero o en dispositivos móviles mediante llama.cpp, ofreciendo respuestas en inglés sin conexión.
- Generación de datos sintéticos y aumentación de datasets: se puede usar para producir texto de entrenamiento en grandes volúmenes sobre CPU, aprovechando el bajo coste por token frente a modelos de mayor tamaño.
- Investigación sobre alineación y "abliteración": permite comparar el comportamiento del modelo base Qwen3-0.6B frente a la variante decensored, midiendo qué tipo de peticiones se rechazan y cuáles no en cada versión.
- Clasificación y etiquetado de texto en inglés: tareas de categorización, extracción simple o filtrado por lotes donde la latencia y el coste importan más que la precisión máxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación, ni comparaciones cuantitativas con el modelo base o con las cuantizaciones estáticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con cuantizaciones IQ1/IQ2/IQ3; en torno a 1-1,5 GB con Q4_K_M o Q5_K_M incluyendo caché KV para contextos moderados. Cifras estimadas a partir del tamaño de los ficheros (0,3-0,6 GB); no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente. No se requiere A100, H100 ni tarjetas de gama alta. Funciona en GTX 1050/1650, RTX 3050/3060, GPU integradas (Intel Iris Xe, AMD Radeon integrada) y Apple Silicon (Metal).
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en muchas integradas y en CPU pura. También es viable en Raspberry Pi 4/5, dispositivos Android y entornos sin acelerador.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui, llama-cpp-python y cualquier runtime compatible con GGUF. Los servidores de alto rendimiento tipo vLLM o TGI no están orientados a GGUF y no se documentan como opciones soportadas en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-heretic-decensored-i1-GGUF (este modelo) | 596.049.920 | no disponible | apache-2.0 | GGUF (i1 con imatrix) | Derivado decensored del base; sin benchmarks publicados |
| vrhvnsky/Qwen3-0.6B-heretic-decensored | no disponible | no disponible | apache-2.0 (según este repositorio) | no disponible | Modelo base directo de esta cuantización |
| Qwen/Qwen3-0.6B (modelo base original) | 0,6 B (clase) | no disponible | apache-2.0 | safetensors | Referenciado en la model card como origen de la licencia |
| mradermacher/Qwen3-0.6B-heretic-decensored-GGUF | no disponible | no disponible | apache-2.0 | GGUF estático | Cuantizaciones estáticas del mismo modelo base, sin imatrix |

No se dispone en la información proporcionada de datos de contexto, rendimiento o benchmarks de las alternativas, por lo que la comparación se limita a parámetros, licencia y formato. Cualquier comparación con modelos de la misma categoría (por ejemplo Qwen2.5-0.5B, SmolLM2-360M o TinyLlama-1.1B) no puede sustentarse con los datos disponibles.

## Limitaciones y advertencias

- Tamaño muy reducido: con 0,6 B de parámetros, la capacidad de razonamiento, la coherencia en cadenas largas y la fidelidad factual son limitadas. Es esperable una tasa alta de alucinación en preguntas de conocimiento.
- Modelo "decensored"/"abliterated": los filtros de seguridad han sido presumiblemente atenuados o eliminados, por lo que puede generar contenido ofensivo, violento, sexual o dañino. No es adecuado para aplicaciones de cara al público sin moderación adicional.
- Idioma: únicamente inglés declarado. El rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Longitud de contexto: no disponible; no se puede garantizar el comportamiento en conversaciones largas.
- Cuantizaciones de baja precisión: las variantes IQ1_S, IQ1_M e IQ2_* degradan notablemente la calidad. La propia model card advierte que i1-IQ1_S es "para desesperados" y que Q2_K_S es de "calidad muy baja".
- Sin benchmarks ni validación: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones publicadas. No hay evidencia objetiva de calidad o de que el proceso de decensurado se haya ejecutado de forma correcta.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-0.6B y de la variante intermedia vrhvnsky/Qwen3-0.6B-heretic-decensored antes de desplegarlo en producción.
- Ausencia de soporte de tool calling y agentes: no documentados, por lo que no debería asumirse su disponibilidad en pipelines que los requieran.
- Fecha de creación indicada en el repositorio: 12 de septiembre de 2026, posterior a la fecha de consulta; conviene tratarla con cautela.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3-0.6B-heretic-decensored-i1-GGUF
- Modelo base de la cuantización: https://huggingface.co/vrhvnsky/Qwen3-0.6B-heretic-decensored
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3-0.6B-heretic-decensored-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Fichero imatrix: https://huggingface.co/mradermacher/Qwen3-0.6B-heretic-decensored-i1-GGUF/resolve/main/Qwen3-0.6B-heretic-decensored.imatrix.gguf
- Índice de cuantizaciones del autor: https://hf.tst.eu/model#Qwen3-0.6B-heretic-decensored-i1-GGUF
- Guía de uso de GGUF citada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF

Nota: los resultados de búsqueda web disponibles no contenían información relevante sobre este modelo (correspondían a páginas de soporte de YouTube en japonés, chino y ruso), por lo que no se han podido añadir enlaces adicionales a papers, blogs o repositorios.
