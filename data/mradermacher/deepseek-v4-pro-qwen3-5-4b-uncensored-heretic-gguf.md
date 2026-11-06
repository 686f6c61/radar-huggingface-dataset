# mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) derivado de la familia Qwen3.5 y destilado a partir de DeepSeek, según los tags del repositorio. La versión aquí descrita es una cuantización estática en formato GGUF publicada por mradermacher a partir del modelo base xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic, que a su vez ha sido sometido a un proceso de "abliteration" o "decensoring" (etiquetado como heretic, uncensored y abliterated) para eliminar los mecanismos de rechazo aprendidos durante el alineamiento.

El modelo está orientado a tareas de razonamiento, matemáticas, STEM y generación de código, con soporte declarado para seis idiomas (inglés, chino, coreano, japonés, español y ruso). Su licencia Apache 2.0 y su reducido tamaño lo hacen atractivo para despliegues en hardware de consumo, aunque la naturaleza "uncensored" implica que no ha pasado por las salvaguardas habituales de seguridad.

La relevancia de esta ficha radica en que combina tres tendencias actuales: la destilación de modelos grandes hacia arquitecturas pequeñas, la cuantización GGUF para inferencia local y la modificación del comportamiento de rechazo mediante técnicas de abliteration. El repositorio incluye además suplementos multimodales (mmproj) en precisiones Q8_0 y f16, lo que sugiere capacidades de visión, aunque la model card no detalla su funcionamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tags; detalles no disponibles) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los tags, que apuntan a la familia Qwen3.5 y a un proceso de destilación desde DeepSeek. Los tags incluyen "reasoning", "distillation", "sft", "math", "stem" y "mtp", lo que sugiere que el modelo base fue entrenado con supervisión fina (SFT) sobre datos de razonamiento y matemáticas, probablemente destilando trazas de un modelo mayor de la familia DeepSeek. El tag "mtp" podría referirse a multi-token prediction, aunque no se confirma en la documentación.

El proceso "heretic" o "abliterated" consiste en la modificación de los pesos para eliminar la dirección de rechazo aprendida durante el alineamiento, de modo que el modelo deja de negarse a responder a ciertas peticiones. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La cuantización realizada por mradermacher es estática (no se han publicado cuantizaciones ponderadas o imatrix en el momento de la ficha).

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado como "conversational".
- Razonamiento explícito y resolución de problemas matemáticos y STEM (tags "reasoning", "math", "stem").
- Generación y explicación de código, con soporte para tareas de programación.
- Capacidades multimodales: el repositorio incluye suplementos mmproj (Q8_0 y f16), lo que indica soporte de entrada de imágenes, aunque no se detalla el alcance.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Comportamiento "uncensored": responde a peticiones que los modelos alineados estándar rechazarían.
- No se confirma soporte de tool calling, function calling ni razonamiento multi-paso con agentes en la información disponible.
- Compatible con endpoints (tag "endpoints_compatible") y con text-generation-inference.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration comparando sus respuestas con las del modelo base alineado, en entornos controlados de laboratorio.
- Generación de código en local: con ~4,2 B de parámetros y cuantizaciones Q4_K_M, puede ejecutarse en una GPU de consumo para autocompletar, explicar y refactorizar código sin enviar datos a la nube.
- Asistencia matemática y STEM: útil para resolver problemas paso a paso en entornos educativos o de investigación donde se requiere razonamiento explícito y privacidad.
- Procesamiento multilingüe: atención a usuarios en inglés, chino, coreano, japonés, español y ruso con un único modelo de pequeño tamaño.
- Prototipado rápido de chatbots: su formato GGUF y su licencia Apache 2.0 permiten desplegar un asistente conversacional en llama.cpp u Ollama para pruebas de concepto.
- Análisis de documentos con imágenes: gracias a los suplementos mmproj, puede emplearse en tareas de descripción o extracción de información de imágenes en pipelines locales.
- Generación de contenido creativo sin restricciones: para proyectos editoriales o de ficción que requieran respuestas no filtradas, siempre con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en Q4_K_M, 5 GB en Q8_0 y 8,5 GB en f16 (estimación a partir de los 4,2 B de parámetros; no confirmada por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o superiores para cuantizaciones altas; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM para cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (según tags), transformers con el modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic (GGUF) | ~4,2 B | no disponible | Apache 2.0 | GGUF | Versión abliterated y cuantizada |
| Qwen3.5-4B (base) | ~4 B | no disponible | no disponible | safetensors | Modelo original sin modificar |
| Llama 3.2 3B Instruct | ~3,2 B | 128 K | Llama 3.2 Community | safetensors, GGUF | Alternativa alineada de tamaño similar |
| Phi-3.5-mini-instruct | ~3,8 B | 128 K | MIT | safetensors, GGUF | Enfoque en razonamiento y código |

La comparación directa con Qwen3.5-4B y Llama 3.2 3B es aproximada, ya que no se dispone de datos de rendimiento del modelo aquí descrito.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" y "abliterated", no aplica las salvaguardas habituales de seguridad; puede generar contenido ofensivo, ilegal o peligroso sin filtro.
- Riesgo elevado de alucinación, especialmente en tareas factuales, dado su tamaño reducido y su orientación a razonamiento destilado.
- No se especifica la longitud de contexto, lo que dificulta planificar despliegues con documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre la legalidad del contenido generado en cada jurisdicción.
- El proceso de abliteration puede degradar capacidades generales (razonamiento, coherencia) respecto al modelo base alineado.
- No hay datos publicados de benchmarks que permitan evaluar su calidad real frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación comunitaria.
- La información sobre arquitectura, entrenamiento y contexto es incompleta; no debe asumirse que hereda todas las capacidades de Qwen3.5 o DeepSeek.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Página de descargas del autor: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
