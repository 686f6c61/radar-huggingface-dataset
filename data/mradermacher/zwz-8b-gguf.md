# mradermacher/ZwZ-8B-GGUF

## Resumen

ZwZ-8B es un modelo de lenguaje multimodal de 8.190.735.360 parámetros (aproximadamente 8,19 mil millones) desarrollado por inclusionAI, distribuido bajo licencia Apache 2.0. El modelo original está diseñado para tareas de visión-lenguaje, con especial énfasis en razonamiento visual y comprensión de imágenes a distintos niveles de zoom, como sugieren los datasets de entrenamiento `inclusionAI/ZwZ-RL-VQA` y `inclusionAI/ZoomBench` empleados en su ajuste. La ficha que nos ocupa corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y entornos compatibles.

La relevancia de esta publicación radica en que traslada un modelo multimodal de 8B a formatos ligeros (desde 3,4 GB en Q2_K hasta 16,5 GB en f16), incluyendo un proyector multimodal (`mmproj`) separado que habilita la entrada de imágenes. Esto facilita su despliegue local en GPUs de consumo y en entornos sin acceso a infraestructura de datacenter, algo poco habitual en modelos de visión-lenguaje de esta escala.

No obstante, la información pública disponible es limitada: la model card del repositorio cuantizado no documenta arquitectura interna, longitud de contexto, composición del dataset ni resultados de benchmarks. Los datos que se ofrecen a continuación proceden de los metadatos de Hugging Face y de la propia model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal visión-lenguaje; arquitectura interna no documentada en la información proporcionada) |
| Parametros totales | 8.190.735.360 (≈8,19B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj en f16 y Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `inclusionAI/ZwZ-8B`. Los metadatos indican que se trata de un modelo multimodal (visión-lenguaje), dado que el repositorio GGUF incluye un archivo `mmproj` (proyector multimodal) necesario para procesar imágenes. El pipeline declarado en Hugging Face no está disponible, pero las etiquetas `conversational` y la presencia de `mmproj` confirman su uso para conversación con entrada visual.

Respecto al entrenamiento, la model card únicamente referencia dos datasets: `inclusionAI/ZwZ-RL-VQA` (preguntas y respuestas visuales con refuerzo) y `inclusionAI/ZoomBench` (evaluación de comprensión a distintos niveles de zoom). Esto sugiere un ajuste orientado a razonamiento visual fino y a la interpretación de detalles en imágenes de alta resolución, pero no se especifican número de tokens, composición del corpus, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes y respuesta a preguntas visuales (VQA), según la presencia del proyector multimodal y los datasets de entrenamiento.
- Razonamiento visual a distintos niveles de zoom, orientado por el dataset `ZoomBench`.
- Procesamiento de conversaciones multi-turno (etiqueta `conversational`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos e imágenes técnicas: el modelo puede recibir una imagen (por ejemplo, un plano o una captura de pantalla) y responder preguntas sobre ella, aprovechando su entrenamiento en VQA y su capacidad de examinar detalles a distintos niveles de zoom.
- Asistencia en accesibilidad: descripción de imágenes y respuesta a preguntas sobre su contenido para usuarios con discapacidad visual, desplegable localmente gracias a las cuantizaciones ligeras.
- Moderación y revisión de contenido visual: clasificación y descripción de imágenes en pipelines internos, con la ventaja de que el modelo puede ejecutarse en hardware propio sin enviar datos a terceros.
- Prototipado de agentes visuales: integración en flujos conversacionales que requieran alternar texto e imagen, usando el formato GGUF con llama.cpp u Ollama para pruebas rápidas.
- Investigación en visión-lenguaje: evaluación de técnicas de razonamiento visual y comparación con otros modelos 8B multimodales, dado que el modelo se entrenó con `ZoomBench`.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo con cuantizaciones Q4_K_M (5,1 GB) o Q5_K_M (6,0 GB), es adecuado para demos, estaciones de trabajo locales y entornos edge.
- Extracción de información de capturas y formularios: lectura de texto en imágenes y respuesta estructurada en inglés, útil en tareas de digitalización asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,4 GB
  - Q3_K_M: ~4,2 GB
  - Q4_K_S / Q4_K_M: ~4,9–5,1 GB
  - Q5_K_M: ~6,0 GB
  - Q6_K: ~6,8 GB
  - Q8_0: ~8,8 GB
  - f16: ~16,5 GB
  - Añadir ~0,9 GB (mmproj Q8_0) o ~1,3 GB (mmproj f16) si se usa entrada de imagen.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4–Q8.
  - Datacenter: A100, H100 para f16 o para servir múltiples instancias.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 6–8 GB; Q6_K y Q8_0 requieren 8–12 GB; f16 requiere ~16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp). El repositorio incluye `endpoints_compatible` en sus etiquetas, lo que sugiere compatibilidad con endpoints tipo OpenAI a través de servidores GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas del modelo base que permitan una comparación rigurosa. Se indica "no disponible" para los campos que requerirían benchmarks o contexto documentado.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ZwZ-8B (esta ficha) | ~8,19B | no disponible | Apache 2.0 | GGUF / safetensors | Multimodal visión-lenguaje, solo inglés |
| Alternativas 8B multimodales | no disponible | no disponible | no disponible | no disponible | No se han identificado comparables con datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse principalmente en inglés, es probable un sesgo cultural y lingüístico hacia ese idioma.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir descripciones o respuestas incorrectas sobre imágenes, especialmente en cuantizaciones muy agresivas (Q2_K, Q3_K_S).
- Limitaciones de contexto o idioma: solo se declara inglés; la longitud de contexto no está documentada, lo que impide garantizar conversaciones largas o documentos extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `inclusionAI/ZwZ-8B` y de los datasets empleados, ya que la model card del cuantizador no detalla posibles restricciones adicionales.
- Caveats para producción: las cuantizaciones de baja precisión (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad; para uso serio se recomienda Q4_K_M o superior. La ausencia de benchmarks publicados impide estimar su rendimiento frente a alternativas. El repositorio tiene pocas descargas (204) y likes (2), lo que sugiere escasa validación comunitaria.
- El modelo requiere el archivo `mmproj` para tareas de visión; sin él, solo funciona como modelo de texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ZwZ-8B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/ZwZ-8B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/ZwZ-8B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#ZwZ-8B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/inclusionAI/ZwZ-RL-VQA
- Dataset de evaluación: https://huggingface.co/datasets/inclusionAI/ZoomBench
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
