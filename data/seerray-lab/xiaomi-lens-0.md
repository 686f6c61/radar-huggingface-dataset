# SeerRay-Lab/Xiaomi-Lens-0

## Resumen

Xiaomi-Lens-0 es un modelo de lenguaje multimodal de aproximadamente 4,62 mil millones de parámetros desarrollado por SeerRay-Lab, construido mediante fine-tuning sobre Qwen/Qwen3.5-4B. Su particularidad es que añade un decodificador ligero de máscaras de píxeles y se entrena con supervisión conjunta de lenguaje y máscaras: cada token `<|mask|>` que genera el modelo identifica una región de la imagen que el decodificador convierte en una máscara de segmentación. Es decir, no solo describe o localiza objetos con cajas, sino que produce segmentaciones a nivel de píxel dentro de una respuesta conversacional.

El modelo cubre comprensión y segmentación de expresiones referenciales (*referring expression comprehension and segmentation*), grounding multi-instancia, segmentación con razonamiento, referencia encarnada (*embodied referring*) y percepción visual de grano fino. Las máscaras pueden aparecer en la respuesta final o intercaladas durante el razonamiento, lo que permite usarlas como paso intermedio en cadenas de razonamiento visual.

Es relevante porque unifica en un único modelo de ~4B tareas que habitualmente requieren pipelines separados (un VLM para interpretar la instrucción y un modelo tipo SAM para segmentar), con licencia Apache-2.0. El repositorio (9,3 GB) incluye pesos en safetensors, configuración, tokenizador, procesador y plantilla de chat, aunque la inferencia requiere la clase `XiaomiLensQwen3_5ForConditionalGeneration` del repositorio de código acompañante, no solo `transformers` estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-4B) con decodificador ligero de máscaras de píxeles y tokens especiales `<|mask|>` |
| Parámetros totales | 4.622.144.192 (~4,62 B), según safetensors |
| Parámetros activos | No disponible (no se describe como modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | No disponible (no se documenta en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 9,3 GB) |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-4B (fine-tune) |
| Librería | transformers (con código propio para el decodificador de máscaras) |
| Descargas / likes | 10 descargas, 11 likes |
| Fecha de publicación | 19 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura parte de un transformer decoder-only multimodal Qwen3.5-4B y le incorpora un decodificador de máscaras de píxeles descrito por el autor como ligero. El mecanismo es de tipo *token-to-mask*: el modelo emite tokens `<|mask|>` en su secuencia de salida y cada uno de ellos se mapea, a través del decodificador, a una máscara de segmentación sobre la imagen de entrada. El entrenamiento combina supervisión de lenguaje (generación de texto) y supervisión de máscaras de forma conjunta, de manera que el modelo aprende simultáneamente a razonar en lenguaje y a delimitar regiones.

La innovación destacable es que las máscaras pueden generarse tanto en la respuesta final como durante el razonamiento, lo que habilita la segmentación con razonamiento (*reasoning segmentation*) y el encadenamiento de pasos visuales. El repositorio incluye pesos, configuración, tokenizador, procesador y plantilla de chat; la carga del modelo y la decodificación de máscaras requieren el paquete de código publicado por SeerRay-Lab.

No se han publicado en la información disponible datos sobre volumen de tokens de entrenamiento, composición del dataset, resolución de imagen soportada, ni sobre el uso de RLHF, DPO u otras etapas de alineación.

## Capacidades

- Generación de texto conversacional multimodal a partir de imagen y texto.
- Comprensión de expresiones referenciales (*referring expression comprehension*): localizar el objeto descrito por una frase, incluidas descripciones relacionales ("el jugador que corre detrás del lanzador", "la cuchara de madera más pequeña del grupo").
- Segmentación de expresiones referenciales (*referring expression segmentation*): devolver la máscara de píxeles del objeto descrito.
- Grounding multi-instancia: localizar y segmentar todas las instancias de una categoría ("todas las botellas", "todas las naranjas", "todas las personas").
- Segmentación con razonamiento (*reasoning segmentation*): producir máscaras como parte de una cadena de razonamiento, no solo en la respuesta final.
- Referencia encarnada (*embodied referring*): selección de objetos en escenas para agentes y robótica.
- Percepción visual de grano fino: distinciones por atributos (color, posición relativa, tamaño, contexto).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: parcialmente implícitas en la generación de máscaras durante el razonamiento; no se documenta integración con frameworks de agentes.
- Capacidades multilingües: no disponibles (idiomas no documentados).
- Capacidades especiales: modo *thinking* con máscaras intermedias; no se documenta soporte de audio ni de vídeo.

## Casos de uso

- **Pre-etiquetado de datasets de segmentación**: dado un dataset de imágenes con descripciones en lenguaje natural, el modelo genera máscaras candidatas para revisión humana, reduciendo el coste de anotación en tareas de referring segmentation y grounding multi-instancia.
- **Robótica de manipulación con instrucciones en lenguaje natural**: un operador indica "coge la taza roja a la izquierda del microondas" y el modelo devuelve la máscara del objeto, que el módulo de agarre usa para estimar la región de contacto; encaja por su soporte de *embodied referring*.
- **Edición de imágenes e inpainting**: la máscara generada a partir de una instrucción textual ("elimina el coche del fondo") se pasa directamente como máscara de edición a un pipeline de difusión, sin necesidad de interacción manual.
- **Inspección visual industrial y control de calidad**: descripciones de defectos ("grietas en la superficie del rodamiento") se traducen en máscaras que alimentan métricas de área y severidad del defecto.
- **Analítica de retail e inventario**: el grounding multi-instancia permite contar y localizar productos concretos en una estantería a partir de una consulta textual, útil para auditoría de planogramas.
- **Accesibilidad visual**: un asistente puede localizar y segmentar objetos relevantes de la escena ("el vaso que está a tu derecha") y comunicar su posición y extensión a una persona con discapacidad visual.
- **Automatización de agentes que operan interfaces gráficas**: la segmentación de elementos descritos por texto ("el botón de confirmar del diálogo") sirve como señal de localización para agentes GUI, aunque la integración concreta no está documentada.
- **Moderación y análisis de contenido visual**: localizar y aislar regiones concretas de una imagen descritas por un moderador para su revisión posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de referring expression comprehension/segmentation (por ejemplo, en RefCOCO, RefCOCO+ o RefCOCOg), de grounding multi-instancia (COCO) ni de evaluación de lenguaje general (MMLU, GSM8K), y tampoco se han encontrado en la búsqueda web.

## Requisitos de hardware

- **VRAM estimada para inferencia** (cálculo a partir de 4,62 B de parámetros; no verificado por el autor):
  - bf16/fp16: ~9,3 GB solo de pesos; con caché KV y activaciones, del orden de 12-14 GB.
  - int8: ~4,7 GB de pesos; ~6-8 GB en total.
  - int4: ~2,4 GB de pesos; ~4-6 GB en total.
- **GPU recomendadas**: A100 (40/80 GB), H100, L40S para despliegue en servidor; RTX 4090 (24 GB) y RTX 4080 (16 GB) para inferencia en bf16 con margen.
- **¿Cabe en GPU de consumo?** Sí, en bf16 cabe en RTX 4090 y RTX 4080; con cuantización int8/int4 podría caber en RTX 4070/3080 (10-12 GB) e incluso en GPU de 8 GB en int4, aunque no se publican recetas de cuantización para este modelo.
- **Opciones de despliegue**: carga mediante `transformers` junto con la clase `XiaomiLensQwen3_5ForConditionalGeneration` del repositorio de código de SeerRay-Lab. No se documenta soporte en vLLM, TGI, llama.cpp ni Ollama; la decodificación de máscaras depende de código propio, lo que en la práctica limita el despliegue a un servidor Python con el paquete instalado.
- **Latencia y throughput**: no disponibles. La generación de uno o varios tokens `<|mask|>` por objeto añade coste adicional de decodificación respecto a un VLM puramente textual, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida de segmentación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi-Lens-0 | ~4,62 B | No disponible | Sí (máscaras por token `<|mask|>`) | Apache-2.0 | Pesos en HuggingFace + código propio |
| Qwen/Qwen3.5-4B (modelo base) | ~4 B | No disponible | No (VLM/texto) | No disponible en la información | HuggingFace |
| Otros modelos de reasoning segmentation (p. ej., LISA, GLaMM) | No disponible | No disponible | Sí | No disponible | No verificado en la información |

El modelo base Qwen3.5-4B es la referencia inmediata: Xiaomi-Lens-0 conserva su tamaño y le añade la cabeza de segmentación, por lo que la comparación relevante es si la capacidad de máscara compensa la dependencia de código no estándar. No se dispone de datos de rendimiento del modelo base ni de alternativas de segmentación razonada en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Ausencia de benchmarks**: no hay métricas publicadas de precisión de máscaras (IoU, cIoU) ni de comprensión; la evaluación cualitativa se limita a los ejemplos de la model card.
- **Madurez y validación comunitaria muy bajas**: 10 descargas y 11 likes en el momento de la consulta, con publicación reciente (octubre de 2026). No es un modelo contrastado en producción.
- **Dependencia de código propietario del autor**: la inferencia exige el paquete `XiaomiLensQwen3_5ForConditionalGeneration`; no es un modelo que funcione con `AutoModel` estándar ni se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama.
- **Riesgo de alucinación visual**: al ser un modelo generativo, puede producir tokens `<|mask|>` para objetos inexistentes o atribuir la máscara a la región equivocada, especialmente con descripciones ambiguas o escenas densas.
- **Idiomas no documentados**: se desconoce si las instrucciones funcionan igual de bien en castellano que en inglés; no se declara cobertura lingüística.
- **Contexto y resolución de imagen no documentados**: no se especifica la ventana de contexto ni la resolución o el preprocesado de imagen, lo que dificulta dimensionar el despliegue.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene verificar los términos del modelo base Qwen/Qwen3.5-4B, ya que el fine-tune hereda sus condiciones.
- **Sesgos**: no se documenta composición del dataset de entrenamiento ni análisis de sesgos; es esperable que reproduzca sesgos de los datos visuales y de texto del modelo base, sin que el autor los cuantifique.
- **Caveat de producción**: el decodificador de máscaras es "ligero" según el autor, y su calidad puede degradarse en objetos pequeños, oclusiones o imágenes de alta resolución; no se publican análisis de error.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeerRay-Lab/Xiaomi-Lens-0
- Página del proyecto: https://seerray-lab.github.io/Xiaomi-Lens-0/
- Repositorio de código: https://github.com/SeerRay-Lab/Xiaomi-Lens-0
- Ejemplos de tareas: https://github.com/SeerRay-Lab/Xiaomi-Lens-0/tree/main/docs/assets/samples
- Informe técnico (arXiv 2610.23279): https://arxiv.org/abs/2610.23279
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
