# qualcomm/Intern3.5-VL-2B

## Resumen

Intern3.5-VL-2B es la versión del modelo multimodal InternVL3.5 de 2.000 millones de parámetros publicada por Qualcomm, derivada del checkpoint original de OpenGVLab (OpenGVLab/InternVL3_5-2B). Se trata de un modelo de visión-lenguaje (VLM) capaz de procesar texto e imágenes de forma conjunta para tareas de razonamiento multimodal como respuesta a preguntas visuales (VQA) y generación de descripciones de imágenes (image captioning).

La aportación específica de este repositorio no es un nuevo entrenamiento, sino la exportación y optimización del modelo para ejecutarse en dispositivos con hardware Qualcomm: móviles con Snapdragon 8 Elite y 8 Elite Gen 5, portátiles con Snapdragon X Elite y X2 Elite, y plataformas embebidas Dragonwing IQ-8275, IQ-9075 y SA8775P. Los artefactos se distribuyen cuantizados en w4a16 (pesos de 4 bits, activaciones de 16 bits) y compilados para los runtimes Genie y GenieX mediante QAIRT 2.45.

Su relevancia actual radica en que permite desplegar un VLM de 2B completamente en el dispositivo (on-device), sin depender de la nube, lo que reduce latencia, coste y exposición de datos. Está pensado para desarrolladores que quieran integrar comprensión de imágenes y texto en aplicaciones Android o en plataformas embebidas con aceleración NPU de Qualcomm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de visión-lenguaje (VLM) basado en InternVL3.5; codificador visual más decodificador de lenguaje. Detalle de capas y bloques: no disponible |
| Parametros totales | aproximadamente 2.000 millones (2B, según el nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w4a16 (pesos de 4 bits, activaciones de 16 bits) en las exportaciones para Qualcomm; otros formatos: no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | artefactos pre-exportados en archivos .zip para los runtimes Genie y GenieX de Qualcomm; el repositorio base usa pesos en safetensors (no confirmado explícitamente en la información disponible) |

## Arquitectura y entrenamiento

InternVL3.5 es una familia de modelos de visión-lenguaje desarrollada por OpenGVLab, sucesora de la serie InternVL3. La arquitectura combina un codificador visual con un modelo de lenguaje que consume los tokens de imagen proyectados, lo que permite razonamiento conjunto sobre texto e imágenes. El checkpoint base de este repositorio es OpenGVLab/InternVL3_5-2B, de aproximadamente 2.000 millones de parámetros. El detalle exacto de la composición del dataset de entrenamiento, el número de tokens vistos y si se aplicaron etapas de RLHF o DPO no está disponible en la información proporcionada.

La innovación técnica destacable de esta publicación concreta no está en el entrenamiento, sino en el proceso de exportación y compresión para hardware Qualcomm: cuantización a 4 bits de pesos con activaciones de 16 bits y compilación con QAIRT 2.45 para los runtimes Genie y GenieX. Esto permite ejecutar el modelo en la NPU de plataformas Snapdragon y Dragonwing. El modelo también puede reexportarse con configuraciones personalizadas (pesos afinados, formas de entrada propias y distintos objetivos de dispositivo y runtime) mediante la librería Qualcomm AI Hub Models.

## Capacidades

- Comprensión de imágenes y texto de forma conjunta (multimodal): respuesta a preguntas visuales (VQA).
- Generación de descripciones de imágenes (image captioning).
- Razonamiento multimodal sobre el contenido combinado de una o varias imágenes y una instrucción textual.
- Generación de texto a partir de entradas multimodales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está especificado en la model card).
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Accesibilidad en el móvil: describir en voz alta el contenido de una fotografía capturada por la cámara para usuarios con discapacidad visual, ejecutando el modelo localmente en la NPU del dispositivo sin enviar la imagen a un servidor.
- Asistencia fotográfica on-device: generar títulos, etiquetas o descripciones automáticas de las imágenes de la galería para organizarlas y hacerlas buscables por texto.
- Digitalización de documentos: extraer y describir el contenido de recibos, tickets o formularios fotografiados, útil en aplicaciones de finanzas personales o gestión de gastos que requieran funcionamiento offline.
- Asistencia visual en comercio electrónico: permitir al usuario fotografiar un producto para obtener una descripción o una categoría, con la inferencia ejecutándose en el propio dispositivo.
- Traducción o descripción de carteles y menús: procesar la imagen de un texto en otro idioma y devolver una descripción o explicación en el idioma del usuario, sin conexión.
- Robótica e IoT industrial: sobre plataformas Dragonwing IQ-8275, IQ-9075 o SA8775P, realizar inspección visual básica o lectura de indicadores en entornos con conectividad limitada, aprovechando el despliegue embebido del modelo.
- Aplicaciones de privacidad estricta: cualquier escenario sanitario, legal o corporativo donde no esté permitido enviar imágenes a la nube, ya que el modelo puede ejecutarse íntegramente en el dispositivo.
- Prototipado de funciones multimodales en Android: usar el tutorial LLM-on-Genie o GenieX para validar rápidamente una idea de producto VLM antes de invertir en infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la página del modelo en Qualcomm AI Hub y a la sección de rendimiento del repositorio para métricas por dispositivo, pero no incluye cifras concretas (MMLU, MMMU, HumanEval, GSM8K u otras) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones en función del tamaño de 2B, no confirmadas por el autor): aproximadamente 1,2-1,5 GB en w4a16; en torno a 2 GB en INT8; alrededor de 4 GB en FP16.
- GPU recomendadas para el checkpoint base (si se ejecuta en servidor): cualquier GPU con 8 GB o más, como RTX 3060/4060, RTX 4090, A100 o H100. Para un modelo de 2B, las GPUs de gama alta quedan sobredimensionadas.
- Compatibilidad con GPU de consumo: sí, un modelo de 2B debería caber en GPUs de consumo con 6-8 GB de VRAM en cuantizaciones de 4 u 8 bits.
- Plataformas objetivo reales de esta publicación: Snapdragon 8 Elite Gen 5, Snapdragon 8 Elite, Snapdragon X2 Elite, Snapdragon X Elite, Dragonwing IQ-8275, SA8775P y Dragonwing IQ-9075, siempre vía NPU.
- Opciones de despliegue: Genie y GenieX (Qualcomm), con compilación mediante QAIRT 2.45. Para el checkpoint base fuera de Qualcomm, las opciones típicas serían vLLM, TGI o llama.cpp, pero no hay confirmación en la información disponible de que existan pesos GGUF o soporte directo en esos frameworks.
- Latencia y throughput: no disponible en la información proporcionada; las métricas por dispositivo se consultan en Qualcomm AI Hub.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Intern3.5-VL-2B (Qualcomm) | ~2B | no disponible | Apache 2.0 | VLM optimizado para NPU Qualcomm | Artefactos pre-exportados para Genie/GenieX |
| InternVL3_5-2B (OpenGVLab) | ~2B | no disponible | no disponible en la información proporcionada | VLM base, checkpoint de origen | Pesos originales en HuggingFace |
| Alternativas VLM de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo modelo generativo, puede producir descripciones o respuestas incorrectas sobre el contenido de una imagen, especialmente con imágenes ambiguas, de baja calidad o con texto poco legible.
- Sesgos: no se han documentado en la información disponible; el comportamiento del modelo dependerá del dataset de entrenamiento original de InternVL3.5, no descrito aquí.
- Limitaciones de contexto: la longitud de contexto no está especificada, por lo que no se puede garantizar el comportamiento con entradas largas o múltiples imágenes simultáneas.
- Idiomas: el soporte multilingüe no está declarado en la model card; no debe asumirse cobertura de idiomas concretos sin verificarla.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base de OpenGVLab y de los artefactos de Qualcomm por si existiesen condiciones adicionales.
- Dependencia de hardware: las exportaciones incluidas están compiladas específicamente para chipsets Qualcomm y los runtimes Genie/GenieX; no son portables a otras plataformas sin reexportación.
- Deprecación de Genie: la propia model card advierte de que el soporte de Genie se deprecará próximamente, por lo que se recomienda planificar la migración a GenieX.
- Ausencia de benchmarks: no hay cifras públicas en la información disponible para estimar la calidad real del modelo, lo que dificulta evaluar su idoneidad en producción sin pruebas propias.
- Métricas de adopción nulas: el repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación muy reciente o poco validada por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/Intern3.5-VL-2B
- Modelo base de OpenGVLab: https://huggingface.co/OpenGVLab/InternVL3_5-2B
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/intern3_5_vl_2b
- Repositorio Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/v0.62.2/src/qai_hub_models/models/intern3_5_vl_2b
- Quickstart de GenieX: https://geniex.aihub.qualcomm.com/en/get-started/quickstart
- Tutorial LLM-on-Genie: https://github.com/qualcomm/ai-hub-apps/tree/main/tutorials/llm_on_genie
- Workbench de Qualcomm AI Hub: https://workbench.aihub.qualcomm.com
- Referencia arXiv asociada a las etiquetas del modelo: https://arxiv.org/abs/2508.18265
