# kaonai/grpo-kaon3-cr5b-calibrated-median-n18-b004-step50

## Resumen

Kaon 3 CR-5B calibrated median es un modelo de lenguaje y procesamiento de imagen-texto de 25.805.933.872 parámetros (25,8B) desarrollado por kaonai. Se trata de una fusión completa de pesos en bfloat16 a partir del modelo base `kaonai/kaon-c-gemma4-26b-v10.1`, entrenado mediante GRPO con una función de recompensa de consenso calibrada. El checkpoint corresponde al paso 50 de optimización de la ejecución `cr5-median-v11-order55-resume` y se presenta como "suggested unevaluated checkpoint": el autor indica que su publicación no es una autorización de promoción.

El modelo se enmarca dentro de la familia Gemma4, aunque no se especifica si la arquitectura es densa, mixta o híbrida. Los tags de HuggingFace incluyen `image-text-to-text`, lo que sugiere que el modelo base es multimodal, pero no se detallan ni la longitud de contexto ni los idiomas soportados. Tampoco hay información sobre licencia, benchmarks o requisitos de despliegue más allá de los pesos en safetensors.

La relevancia del modelo radica en su proceso de alineación experimental: el uso de GRPO con agregación de recompensas mediante mediana calibrada sobre márgenes R/S/W es una innovación técnica poco común. Sin embargo, al ser un checkpoint sin evaluación publicada, su uso debe limitarse a investigación y experimentación, no a entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4 (según modelo base y tags); arquitectura detallada (densa, MoE, etc.) no disponible |
| Parametros totales | 25.805.933.872 |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos completa (full-weight merge) resultado de combinar un adaptador PEFT con el modelo base `kaonai/kaon-c-gemma4-26b-v10.1`. El merge se realizó en bfloat16 y, según el README, se verificó la paridad de logits representativos entre el estado guardado y el recargado. No se proporciona información sobre si la arquitectura base es un transformer denso, un modelo MoE o un sistema híbrido.

En cuanto al entrenamiento, el proceso utiliza GRPO con una tasa de aprendizaje de `1e-4`, un parámetro beta de `0.04` y una semilla de `42`. La recompensa se agrega mediante una "mediana calibrada" calculada sobre márgenes R/S/W calibrados. El muestreo se realizó con `N=18`, seleccionando los `bottom3` y `top3` de cada grupo, y aplicando un consenso estricto de tres vías para las señales. No se especifica la composición del dataset de entrenamiento, el número total de tokens ni si se aplicaron etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional, según el pipeline `text-generation` declarado en HuggingFace.
- Modalidad de imagen-texto a texto, de acuerdo con el tag `image-text-to-text`; esto sugiere capacidad para procesar imágenes y generar texto relacionado.
- Entrenamiento con RL mediante GRPO orientado a optimizar una recompensa de consenso calibrada, lo que puede mejorar la coherencia de las respuestas en comparación con el modelo base.
- No se han documentado oficialmente capacidades de tool calling, function calling, agentes autónomos ni razonamiento multi-paso.
- No hay información publicada sobre soporte multilingüe ni sobre modos especiales como thinking mode.
- Al ser un checkpoint declarado como "suggested unevaluated", las capacidades reales de producción no están validadas.

## Casos de uso

- Asistente conversacional multimodal para atención al cliente: el modelo podría recibir imágenes enviadas por usuarios (capturas de pantalla, fotos de productos) y generar respuestas contextuales, aprovechando su modalidad `image-text-to-text` y sus 25,8B de parámetros para un razonamiento complejo.
- Extracción de información de documentos escaneados: combinando la comprensión visual y la generación de lenguaje, el sistema podría transcribir campos de formularios, facturas o informes manuscritos dentro de un pipeline de automatización documental.
- Generación de descripciones de contenido visual para accesibilidad: el modelo puede describir imágenes o diagramas y así facilitar la creación de texto alternativo en aplicaciones de accesibilidad o en sistemas de gestión de contenidos.
- Análisis de gráficos y figuras científicas: en contextos académicos, el modelo podría interpretar figuras de papers y resumir su contenido, lo que sería útil para herramientas de búsqueda bibliográfica asistida.
- Bot de soporte técnico con lectura de capturas de pantalla: un asistente que recibe capturas de pantalla de errores o interfaces de usuario y responde con instrucciones para resolver el problema, gracias a su capacidad multimodal.
- Generación de contenido educativo a partir de material visual: el modelo puede crear ejercicios, explicaciones o resúmenes a partir de diapositivas, esquemas o mapas conceptuales, lo que apoya la creación de cursos en línea.

Estos casos de uso son potenciales: el modelo no ha sido evaluado, por lo que cada aplicación requiere pruebas de validación antes de su adopción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 51,6 GB solo para los pesos, más unos 2-4 GB de overhead de runtime, lo que lleva a un total de ~55-60 GB.
- VRAM estimada tras cuantización posterior a 8 bits: ~25,8 GB (cálculo teórico; no hay cuantizaciones oficiales publicadas).
- VRAM estimada tras cuantización posterior a 4 bits: ~12,9 GB (cálculo teórico; no hay cuantizaciones oficiales publicadas).
- GPU recomendadas para bfloat16: A100 80GB, H100 80GB o similares con al menos 60GB de memoria.
- Para GPUs de consumo como RTX 4090 (24GB) sería necesaria una cuantización a 4 bits, siempre que se generaran dichas cuantizaciones, ya que no se proporcionan.
- Opciones de despliegue: transformers (al estar publicado como checkpoint), vLLM o Text Generation Inference (TGI) si se convierte al formato adecuado; llama.cpp si se exporta a GGUF, aunque no se ha publicado ningún archivo GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han publicado evaluaciones comparativas frente a otros modelos de la misma categoría. El único punto de referencia es el modelo base `kaonai/kaon-c-gemma4-26b-v10.1`, del cual el presente checkpoint es una fusión y ajuste. Sin resultados de benchmarks, no es posible posicionarlo con respecto a alternativas de tamaño similar o de propósito similar.

## Limitaciones y advertencias

- El modelo es un checkpoint "suggested unevaluated": el autor no ha proporcionado resultados de evaluación ni ha autorizado su promoción, lo que implica un riesgo elevado de errores, alucinaciones y comportamiento imprevisto.
- No se ha documentado la composición del dataset ni el proceso de validación, por lo que no es posible evaluar sesgos conocidos ni riesgos de seguridad.
- La longitud de contexto es desconocida, lo que impide planificar aplicaciones con ventanas de diálogo largas o con dependencias extensas de contexto.
- La licencia no está especificada. Esto impide determinar si el modelo puede utilizarse comercialmente, redistribuirse o modificarse.
- No hay soporte documentado de tool calling, agentes ni razonamiento multi-paso, por lo que su integración en flujos de trabajo complejos requeriría desarrollos adicionales y pruebas propias.
- El tamaño de los pesos en bfloat16 (51,6 GB) limita el despliegue a infraestructura de GPU profesional; no está optimizado para consumer hardware sin cuantizaciones adicionales.
- Al ser un modelo multimodal basado en la familia Gemma4 pero sin datos de contexto e idiomas, el rendimiento en lenguas distintas del inglés es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaonai/grpo-kaon3-cr5b-calibrated-median-n18-b004-step50
- Modelo base en HuggingFace: https://huggingface.co/kaonai/kaon-c-gemma4-26b-v10.1
