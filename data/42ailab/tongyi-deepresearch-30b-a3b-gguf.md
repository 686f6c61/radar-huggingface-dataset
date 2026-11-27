# 42ailab/Tongyi-DeepResearch-30B-A3B-GGUF

## Resumen

Tongyi-DeepResearch-30B-A3B es un modelo de lenguaje de tipo agente desarrollado por Tongyi Lab (Alibaba) y publicado bajo licencia Apache-2.0. Está entrenado específicamente para tareas de investigación y búsqueda de información de horizonte largo (*long-horizon information seeking*), con soporte para uso de herramientas multi-turno y contexto extenso. Su propósito es servir como motor de razonamiento agéntico capaz de planificar, invocar herramientas externas y sintetizar información a lo largo de muchas iteraciones.

El modelo emplea una arquitectura de mezcla de expertos (MoE) con 30.532.122.624 parámetros totales, de los cuales solo un subconjunto se activa por token (la nomenclatura A3B indica aproximadamente 3 mil millones de parámetros activos). Esta configuración permite un rendimiento cercano a modelos densos de mayor tamaño con un coste computacional de inferencia mucho menor, lo que lo hace atractivo para despliegues en producción con requisitos de latencia ajustados.

El repositorio analizado, `42ailab/Tongyi-DeepResearch-30B-A3B-GGUF`, no es el repositorio original del modelo, sino un espejo empaquetado para la aplicación 42model. Contiene únicamente el archivo cuantizado Q4_K_M (17,35 GiB) generado por bartowski, con digestos sha256 fijados para garantizar la reproducibilidad de la descarga. Los pesos son idénticos byte a byte a los del repositorio de bartowski y la licencia Apache-2.0 se mantiene desde el repositorio upstream de Alibaba.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer; detalles de capas y atención no disponibles |
| Parámetros totales | 30.532.122.624 |
| Parámetros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, sin confirmación oficial en la información proporcionada) |
| Longitud de contexto | no disponible (la model card menciona "long context" sin cifra concreta) |
| Tipos de cuantización | Q4_K_M (único archivo incluido en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo sigue una arquitectura de mezcla de expertos con 30.532.122.624 parámetros totales. La designación "A3B" en el nombre indica que aproximadamente 3 mil millones de parámetros están activos por token, un patrón habitual en los modelos MoE de la familia Tongyi/Qwen para equilibrar capacidad y eficiencia. No se dispone en la información proporcionada de detalles sobre el número de capas, la dimensión oculta, el número de expertos, el mecanismo de enrutamiento ni el tipo de atención empleado.

Respecto al entrenamiento, la model card describe el modelo como "entrenado para tareas de búsqueda de información y investigación de horizonte largo, con uso de herramientas multi-turno y contexto largo". No se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o aprendizaje por refuerzo con herramientas. Tampoco se detallan innovaciones técnicas concretas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos.
- Uso de herramientas (*tool calling*) en múltiples turnos, orientado a flujos de investigación iterativos.
- Comportamiento agéntico para búsqueda de información de horizonte largo: planificación, consulta de fuentes y síntesis de resultados.
- Manejo de contexto extenso, según la descripción del autor ("long context"), aunque sin cifra publicada.
- Capacidades multilingües: no confirmadas en la información disponible.
- Modo de razonamiento explícito (*thinking*): no confirmado.
- Visión o audio: no disponibles.

## Casos de uso

- Investigación automatizada de mercado: el modelo puede planificar una secuencia de consultas a fuentes web o bases de datos internas, invocar herramientas de búsqueda en múltiples turnos y sintetizar un informe estructurado, aprovechando su entrenamiento específico en *information seeking*.
- Asistentes de análisis documental con contexto largo: para ingerir grandes volúmenes de documentación y responder preguntas que requieren correlacionar información dispersa a lo largo de muchas páginas.
- Agentes de soporte a la investigación académica: revisión de literatura mediante consultas iterativas a repositorios (arXiv, PubMed) y generación de resúmenes comparativos con citas.
- Automatización de due diligence: recopilación y contraste de información financiera o legal desde múltiples fuentes mediante tool calling, con trazabilidad de las consultas realizadas.
- Pipelines de enriquecimiento de datos: uso del modelo como agente que consulta APIs externas para completar, verificar o corregir registros en bases de datos corporativas.
- Despliegue local en estaciones de trabajo: gracias a la cuantización Q4_K_M (17,35 GiB), puede ejecutarse con llama.cpp u Ollama en equipos con GPU de consumo de gama alta, lo que facilita prototipado y pruebas de agentes sin depender de la nube.
- Generación de informes técnicos con verificación de fuentes: el modelo puede encadenar búsquedas, contrastar resultados y redactar un documento final con referencias, reduciendo el trabajo manual de recopilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 17,35 GiB, por lo que se necesitan al menos ~18-20 GiB de VRAM para cargarlo completamente en GPU, más margen para el contexto KV.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para despliegue en servidor; RTX 4090 (24 GB) para uso en estación de trabajo con la cuantización Q4_K_M.
- GPU de consumo: cabe en RTX 4090 (24 GB) y en RTX 3090 (24 GB). En GPUs de 16 GB requeriría cuantizaciones más agresivas no incluidas en este repositorio.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Para vLLM o TGI sería necesario usar los pesos originales en safetensors del repositorio upstream, no incluidos aquí.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Tongyi-DeepResearch-30B-A3B | 30,5B | ~3B (según nomenclatura) | no disponible | Apache-2.0 | GGUF (Q4_K_M) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables sobre modelos comparables de la misma categoría (agentes de investigación con MoE de ~30B) para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado por Alibaba, es previsible que herede sesgos de sus datos de entrenamiento, pero no hay evidencia publicada en esta ficha.
- Riesgo de alucinación: inherente a los modelos de lenguaje; en tareas de investigación agéntica el riesgo se amplifica si las herramientas externas devuelven información incorrecta o si el modelo sintetiza fuentes sin verificarlas.
- Limitaciones de contexto e idioma: la longitud exacta de contexto no está publicada; los idiomas soportados no están confirmados, por lo que el rendimiento en castellano no puede garantizarse.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución; el repositorio incluye el texto completo de la licencia tomado del repositorio oficial de Alibaba.
- Caveat de producción: este repositorio solo contiene el archivo Q4_K_M; para despliegues con vLLM o TGI que requieran safetensors habría que acudir al repositorio upstream. Los pesos son idénticos a los de bartowski, pero el mantenimiento corre a cargo de 42ailab, no del autor original.
- El repositorio tiene solo 205 descargas y 0 likes en el momento de la consulta, lo que indica una adopción limitada y poca validación comunitaria del empaquetado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/Tongyi-DeepResearch-30B-A3B-GGUF
- Repositorio original de los GGUF (bartowski): https://www.modelscope.cn/models/bartowski/Alibaba-NLP_Tongyi-DeepResearch-30B-A3B-GGUF
- Repositorio oficial del modelo (GitHub): https://github.com/Alibaba-NLP/DeepResearch
- ModelScope del empaquetado: https://modelscope.cn/models/42ailab/Tongyi-DeepResearch-30B-A3B-GGUF
- Aplicación 42model: https://42model.com
- Sitio del mantenedor: https://42ailab.com
