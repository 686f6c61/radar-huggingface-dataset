# SandLogicTechnologies/WeVisOne-VL-4B-GGUF

## Resumen

WeVisOne-VL-4B es un modelo visión-lenguaje unificado desarrollado por el equipo de visión de WeChat (Tencent) para tareas de percepción visual que abarcan desde la comprensión a nivel de objeto hasta el procesamiento de imagen a nivel de píxel. Construido sobre Qwen3-VL, combina razonamiento visual con capacidades de percepción estructurada (detección de objetos, localización por referencia, conteo, pointing, OCR, segmentación y matting) dentro de una única arquitectura multimodal.

La versión aquí descrita es una conversión a GGUF publicada por SandLogicTechnologies, que ofrece cuatro variantes cuantizadas (IQ4_NL, IQ4_XS, IQ3_M y Q6_K) para inferencia local. El modelo original cuenta con aproximadamente 5.000 millones de parámetros (4.415.233.536 según los pesos en safetensors) y está diseñado para producir salidas espaciales estructuradas mediante tokens de coordenadas dedicados.

Su relevancia radica en unificar tareas que tradicionalmente requerían modelos separados: percepción a nivel de objeto mediante predicción estructurada de siguiente token y percepción densa a nivel de píxel mediante un decodificador ligero. La licencia Apache 2.0 facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model unificado basado en Qwen3-VL, con decodificador de píxeles ligero (~9,6 M de parámetros) |
| Parametros totales | 4.415.233.536 (~4,4 B; la model card indica "aproximadamente 5 mil millones") |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: IQ4_NL (2,44 GB), IQ4_XS (2,32 GB), IQ3_M (1,99 GB), Q6_K (3,38 GB); referencia F16 de 8,23 GB |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 11,7 GB); el modelo base en safetensors |

## Arquitectura y entrenamiento

WeVisOne-VL-4B parte de Qwen3-VL y extiende la arquitectura visión-lenguaje hacia un sistema de percepción visual unificado. En lugar de separar las tareas a nivel de objeto y a nivel de píxel en modelos independientes, emplea predicción estructurada de siguiente token para las tareas de objeto y un decodificador de píxeles dedicado para las tareas densas. Las cajas delimitadoras y los puntos se representan mediante tokens de coordenadas dedicados en el rango `<0>` a `<1000>`, que codifican posiciones espaciales normalizadas dentro de secuencias de tokens estructuradas. Para las predicciones densas asociadas a objetos se genera un token de instancia especial.

El componente de píxeles es un decodificador ligero de aproximadamente 9,6 millones de parámetros que procesa características visuales multinivel producidas por el componente de visión de Qwen3-VL. Utiliza un decodificador de consultas guiado por cajas para la predicción visual densa, lo que permite segmentación por referencia y la generación de mattes alfa continuos a resolución completa.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco especifica innovaciones como decodificación especulativa o atención lineal. Las variantes GGUF son conversiones de cuantización del modelo original y no implican reentrenamiento.

## Capacidades

- Detección de objetos de vocabulario abierto: identifica entidades visuales sin lista cerrada de categorías.
- Localización por expresión de referencia (referring localization) y object pointing mediante salidas de coordenadas estructuradas.
- Conteo de objetos en escenas visuales.
- OCR: extracción de información textual presente en imágenes.
- Segmentación por referencia (referring segmentation) a nivel de píxel.
- Image matting promptable con generación de mattes alfa continuos a resolución completa.
- Comprensión general de imagen y texto (image-text-to-text) heredada de Qwen3-VL.
- Salidas estructuradas consumibles por sistemas de procesamiento visual posteriores (cajas, puntos y token de instancia).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.

## Casos de uso

- Detección de objetos en pipelines de visión artificial: el modelo puede identificar entidades de vocabulario abierto y devolver cajas delimitadoras en tokens de coordenadas normalizadas, integrándose en sistemas de inventario, vigilancia o análisis de imágenes sin necesidad de entrenar un detector específico por categoría.
- Análisis de documentos con OCR: extracción de texto de imágenes y capturas, adecuado para digitalización de facturas, formularios o carteles, con la ventaja de combinar lectura de texto y localización espacial en una sola pasada.
- Conteo automatizado de elementos: recuento de objetos en imágenes (productos en estanterías, vehículos en una vía, células en micrografías) aprovechando la capacidad de conteo y las salidas estructuradas.
- Segmentación y recorte asistido: generación de máscaras de segmentación por referencia textual para edición de imagen, sustitución de fondos o preparación de datasets de entrenamiento.
- Matting para postproducción: producción de mattes alfa de resolución completa para composición de vídeo e imagen, útil en herramientas de edición que requieren recortes precisos de sujetos.
- Asistentes visuales interactivos en local: despliegue con llama.cpp u Ollama en equipos con GPU de consumo gracias a las variantes de 2-3 GB, para responder preguntas sobre imágenes y señalar objetos concretos.
- Anotación semiautomática de datasets: uso del modelo para preetiquetar cajas, puntos y máscaras que después se revisan manualmente, reduciendo el coste de construcción de corpus de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3,5 GB para los pesos cuantizados (IQ3_M ~2,0 GB, IQ4_XS ~2,3 GB, IQ4_NL ~2,4 GB, Q6_K ~3,4 GB), más overhead del runtime y de las activaciones del codificador visual, que puede elevar el consumo real por encima de esas cifras.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, las variantes de 4 bits son compatibles con GPUs de consumo con 6-8 GB de VRAM o más; Q6_K requiere algo más de margen.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM para las variantes de 4 bits; no confirmado por el autor.
- Opciones de despliegue: llama.cpp y Ollama son los runtimes habituales para GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. vLLM y TGI no están confirmados para esta conversión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas visuales | Licencia | Formato |
|---|---|---|---|---|---|
| WeVisOne-VL-4B (este) | ~4,4 B | No disponible | Detección, localización, conteo, pointing, OCR, segmentación, matting | Apache 2.0 | GGUF, safetensors |
| Qwen3-VL (modelo base) | No disponible | No disponible | Comprensión imagen-texto general | No disponible | No disponible |
| Alternativas de detección/segmentación abiertas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3-VL, puede heredar sesgos de los datos de entrenamiento de este.
- Riesgo de alucinación: presente como en todo modelo generativo; en tareas de detección y conteo puede producir cajas o recuentos incorrectos, especialmente en escenas densas o con objetos pequeños.
- Limitación de idioma: solo se declara soporte de inglés, lo que restringe el uso en castellano u otras lenguas.
- Longitud de contexto: no especificada; no debe asumirse una ventana larga sin verificación.
- Las cuantizaciones de 3 y 4 bits pueden degradar tareas sensibles a la precisión espacial, como OCR fino, segmentación y matting; la propia model card advierte de un mayor compromiso en IQ3_M.
- El decodificador de píxeles y las salidas densas requieren un runtime que soporte la arquitectura multimodal completa; no todos los backends GGUF implementan estas capacidades.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-VL por si imponen requisitos adicionales.
- Repositorio con pocas descargas (55) y sin likes en el momento de la consulta: menor validación comunitaria y soporte limitado.
- No hay datos publicados de benchmarks que permitan estimar el rendimiento en producción.

## Enlaces

- Hugging Face (esta conversión GGUF): https://huggingface.co/SandLogicTechnologies/WeVisOne-VL-4B-GGUF
- Modelo base: https://huggingface.co/tencent/WeVisOne-VL-4B
- Paper, blog, repositorio o demo oficiales: no disponibles en la información proporcionada.
