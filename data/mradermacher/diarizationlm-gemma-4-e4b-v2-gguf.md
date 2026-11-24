# mradermacher/DiarizationLM-Gemma-4-E4B-v2-GGUF

## Resumen

DiarizationLM-Gemma-4-E4B-v2-GGUF es la versión cuantizada en formato GGUF del modelo DiarizationLM-Gemma-4-E4B-v2, desarrollado por el colectivo diarizers-community y cuantizado por mradermacher. Se trata de un modelo especializado en diarización de hablantes (speaker diarization), es decir, la tarea de identificar y segmentar quién habla en cada momento dentro de una grabación de audio. El modelo parte de una base Gemma 4 (variante E4B) y la adapta al pipeline DiarizationLM, que combina un sistema de reconocimiento de voz con un modelo de lenguaje para refinar las etiquetas de hablante.

El modelo cuenta con aproximadamente 7.518 millones de parámetros totales (según los pesos en safetensors) y está empaquetado en un repositorio de 76,9 GB que incluye múltiples cuantizaciones GGUF, desde Q2_K hasta f16, además de suplementos multimodales mmproj. La licencia es Apache 2.0, lo que facilita su uso comercial, y el idioma declarado es el inglés. Su relevancia actual radica en que ofrece una vía práctica de desplegar diarización de alta calidad en hardware de consumo mediante llama.cpp y variantes GGUF, sin depender de infraestructura de GPU de datacenter.

La ficha se centra en la versión GGUF, pero conviene tener presente que el modelo original es la referencia para detalles de entrenamiento y arquitectura, ya que la model card del repositorio cuantizado es fundamentalmente logística (lista de cuantizaciones y notas de uso).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 4 (variante E4B), adaptado a DiarizationLM; detalles completos no disponibles en la información proporcionada |
| Parámetros totales | 7.518.069.290 (aprox. 7,5 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona la etiqueta "long-context" sin cifra concreta) |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; suplementos mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base está en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de la familia Gemma 4 en su variante E4B, adaptado al framework DiarizationLM. DiarizationLM es un enfoque que emplea un modelo de lenguaje para post-procesar y corregir las hipótesis de un sistema de diarización previo (típicamente basado en embeddings de hablante y clustering), mejorando la coherencia de las etiquetas de hablante a lo largo de la conversación. El modelo se presenta como multimodal (incluye suplementos mmproj), lo que sugiere capacidad de procesar audio además de texto, aunque los detalles concretos del preprocesado de audio no están disponibles.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card del repositorio cuantizado no incluye estos datos, y no se ha proporcionado la model card del modelo base original. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. Las etiquetas del repositorio mencionan "long-context", "multi-speaker" y "multilingual", pero sin cuantificar.

## Capacidades

- Diarización de hablantes: identificación y segmentación de quién habla en cada tramo de una grabación, con refinamiento mediante modelo de lenguaje.
- Procesamiento multimodal: el repositorio incluye suplementos mmproj, lo que indica soporte de entrada de audio (y potencialmente otros modalidades) en el pipeline.
- Conversaciones multi-hablante: la etiqueta "multi-speaker" sugiere manejo de escenarios con varios participantes.
- Contexto largo: etiqueta "long-context" presente, aunque sin cifra concreta disponible.
- Multilingüe: etiqueta "multilingual" presente, aunque el único idioma declarado explícitamente es el inglés.
- Uso conversacional: la etiqueta "conversational" indica idoneidad para diálogo.
- No se documenta explícitamente soporte de tool calling, function calling ni razonamiento multi-paso en la información proporcionada.

## Casos de uso

- Transcripción de reuniones con etiquetado de hablante: el modelo puede refinar las etiquetas de quién habla en cada intervención de una reunión grabada, integrado en un pipeline ASR + diarización, aprovechando su naturaleza DiarizationLM para corregir errores de asignación de hablante.
- Generación de actas y resúmenes por participante: al disponer de segmentos etiquetados por hablante, se pueden generar resúmenes atribuidos a cada persona en entornos corporativos o académicos.
- Subtitulado de contenido multimedia: series, podcasts o entrevistas donde se requiere indicar el hablante en cada línea de subtítulo, con despliegue local mediante llama.cpp.
- Análisis de llamadas de atención al cliente: separar las intervenciones de agente y cliente para evaluar tiempos de respuesta, calidad del diálogo y cumplimiento de protocolos, con la ventaja de poder ejecutarse en hardware de consumo.
- Investigación en lingüística de corpus: etiquetado automático de conversaciones multi-hablante para estudios de turnos de palabra, solapamientos e interrupciones.
- Despliegue en el borde (edge): gracias a las cuantizaciones Q4_K_M (5,4 GB) y Q2_K (4,5 GB), puede ejecutarse en estaciones de trabajo con GPU de consumo o incluso en portátiles con suficiente RAM, sin enviar audio sensible a la nube.
- Preprocesado para sistemas de resumen y QA sobre audio: la diarización previa mejora la calidad de pipelines posteriores de resumen o búsqueda de respuestas en grabaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, pesos solos):
  - Q2_K: ~4,5 GB
  - Q3_K_S: ~4,8 GB
  - Q4_K_S / Q4_K_M: ~5,3-5,4 GB
  - Q5_K_M: ~5,9 GB
  - Q6_K: ~6,3 GB
  - Q8_0: ~8,1 GB
  - f16: ~15,2 GB
  - Suplemento multimodal mmproj: +0,7 GB (Q8_0) o +1,1 GB (f16)
- GPU recomendadas: para cuantizaciones Q4-Q5, una RTX 3060 de 12 GB o superior es suficiente; para Q8_0, una RTX 4070/4080 o superior; para f16, una RTX 4090 (24 GB) o A100/H100 en entornos de servidor.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones Q4/Q5 con 8-12 GB de VRAM; Q2_K podría caber en GPU de 6 GB con margen limitado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y cualquier runtime compatible con GGUF; el modelo base está pensado para transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependerán del hardware, la cuantización y la longitud del audio a procesar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DiarizationLM-Gemma-4-E4B-v2-GGUF (este) | ~7,5 mil millones | no disponible | Apache 2.0 | GGUF | Diarización con LLM, multimodal, cuantizaciones múltiples |
| Modelo base DiarizationLM-Gemma-4-E4B-v2 | ~7,5 mil millones | no disponible | Apache 2.0 | safetensors | Referencia original sin cuantizar |
| Alternativas de diarización clásicas (p. ej. pyannote) | no disponible | no disponible | varía | varios | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría. Se indica "no disponible" en los campos que no pueden verificarse.

## Limitaciones y advertencias

- Idioma: el único idioma declarado explícitamente es el inglés; el rendimiento en castellano u otros idiomas no está garantizado pese a la etiqueta "multilingual".
- Sesgos: no se documentan sesgos conocidos en la información disponible; como todo modelo derivado de datos humanos, es probable que herede sesgos de los corpus de entrenamiento, pero no se cuantifican.
- Alucinación: al ser un modelo de lenguaje aplicado a post-procesado de diarización, existe riesgo de generar etiquetas o correcciones incorrectas, especialmente en audio con ruido, solapamientos o hablantes con voces similares.
- Contexto: la longitud de contexto no está especificada; la etiqueta "long-context" no permite garantizar un límite concreto para audios muy largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los componentes de audio (tokenizador, extractor de features) que puedan tener licencias distintas.
- Producción: la model card del repositorio cuantizado no documenta métricas de calidad por cuantización más allá de las notas genéricas de mradermacher; se recomienda validar la cuantización elegida con datos propios antes de desplegar.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica poca validación comunitaria todavía.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/DiarizationLM-Gemma-4-E4B-v2-GGUF
- Modelo base: https://huggingface.co/diarizers-community/DiarizationLM-Gemma-4-E4B-v2
- Página de overview de cuantizaciones de mradermacher: https://hf.tst.eu/model#DiarizationLM-Gemma-4-E4B-v2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
