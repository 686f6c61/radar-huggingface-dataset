# Awiros/person-attribute-recognition

## Resumen

El modelo **Awiros/person-attribute-recognition** es un clasificador multi-etiqueta de atributos de persona desarrollado por la empresa Awiros, especializada en plataformas de visión por computadora para vídeo inteligente. Se trata de un modelo compacto basado en la arquitectura **ConvNeXt V2 Tiny** con 17 cabezas de clasificación independientes, diseñado para inferir atributos visuales estructurados a partir de recortes de personas en imágenes. El modelo está pensado para su uso en sistemas de análisis de vídeo desplegados en entornos reales de cámaras de vigilancia, donde las condiciones de captura (escala, iluminación, oclusión, calidad) son muy variables.

La principal contribución de este trabajo es doble: por un lado, un modelo eficiente en datos que combina un preentrenamiento contrastivo estilo SimCLR con alineación de representaciones a un modelo DINOv2 congelado, seguido de un ajuste fino con pseudo-etiquetas generadas por un modelo de visión-lenguaje con filtrado por consenso. Por otro lado, liberan un conjunto de evaluación (benchmark) con 35.831 recortes reales de personas que cubren 17 atributos. El modelo alcanza un 82,18% de precisión media top-1 en dicho benchmark, superando a representaciones generalistas mucho más grandes como PE-Core-G14 o DINOv3 ViT-7B/16. El modelo está disponible en formato ONNX y ha estado en producción desde mediados de 2024.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 Tiny con 17 cabezas de clasificación (multi-head) |
| Parametros totales | no disponible (arquitectura compacta tipo Tiny) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no texto) |
| Tipos de cuantizacion | no disponible (formato ONNX, posible cuantización a FP16/INT8 no documentada) |
| Idiomas soportados | en (etiquetas de atributos en inglés) |
| Licencia | other (licencia personalizada no especificada) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo utiliza un backbone **ConvNeXt V2 Tiny** como extractor de características, sobre el que se montan 17 cabezas de clasificación independientes, una por atributo. El entrenamiento se realiza en dos etapas. En la primera, el backbone se preentrena sobre un gran corpus de recortes de personas sin etiquetar utilizando un objetivo contrastivo estilo SimCLR, combinado con una alineación de características hacia las representaciones de un modelo DINOv2 congelado. Esta etapa busca que el backbone aprenda invariancias propias del dominio de despliegue (cámaras reales) a la vez que se regulariza hacia la estructura semántica capturada por un modelo autosupervisado más grande.

En la segunda etapa, se generan pseudo-etiquetas mediante un modelo de visión-lenguaje de propósito general. Para cada etiqueta candidata se evalúan dos prompts construidos de forma independiente, y solo se retiene la pseudo-etiqueta si ambos prompts producen la misma predicción. Este filtrado por consenso reduce el ruido de las etiquetas automáticas. Con estas pseudo-etiquetas se entrenan las cabezas de clasificación. Los experimentos de desarrollo muestran que el preentrenamiento de representaciones es crucial para alcanzar el punto de operación reportado; el entrenamiento supervisado solo no proporciona la misma robustez.

## Capacidades

- Reconocimiento de atributos de persona en imágenes recortadas: apariencia, ropa, objetos portados, accesorios, visibilidad, orientación, oclusión y calidad de imagen.
- Clasificación multi-tarea con 17 cabezas independientes, lo que permite obtener múltiples atributos simultáneamente.
- Robustez a condiciones variadas de captura: escala pequeña, iluminación deficiente, visión nocturna, oclusión parcial, desenfoque de movimiento y diferentes resoluciones de cámara.
- Funciona en entornos de interior y exterior, así como en condiciones nocturnas.
- Inferencia eficiente al ser un modelo compacto tipo Tiny, adecuado para pipelines de vídeo en tiempo real.
- Formato ONNX, lo que facilita su despliegue en múltiples runtimes y plataformas.

## Casos de uso

- **Vigilancia y seguridad en vídeo**: el modelo puede analizar flujos de cámaras CCTV para extraer atributos de personas en tiempo real, permitiendo búsquedas por descripción (p. ej., "persona con chaqueta roja y mochila") en vídeo grabado o en vivo.
- **Búsqueda y recuperación de personas**: en sistemas de vídeo bajo demanda, los atributos extraídos sirven como índices para localizar a un individuo a través de múltiples cámaras y momentos temporales.
- **Analítica de comportamiento en retail**: identificación de patrones de vestimenta o accesorios para estudios de afluencia, segmentación de clientes o detección de robos.
- **Gestión de tráfico y espacios públicos**: conteo y caracterización de peatones para planificación urbana o control de multitudes, incluyendo atributos como orientación y objetos portados.
- **Automatización de anotaciones**: el modelo puede pre-etiquetar grandes volúmenes de imágenes para reducir el coste de anotación manual en la creación de datasets de atributos de persona.
- **Sistemas de recomendación de moda**: aunque no es el uso principal, los atributos de ropa y accesorios pueden alimentar motores de recomendación en entornos controlados.

## Benchmarks y rendimiento

El modelo se evalúa en el benchmark propio **Awiros Person Attribute Benchmark Dataset**, que contiene 35.831 recortes de personas reales con 17 atributos. Los resultados reportados son:

| Métrica | Valor |
|---|---|
| Precisión media top-1 (mean) | 82,18% |
| Precisión mediana top-1 (median) | 82,75% |

Según la model card, bajo el mismo protocolo de evaluación, este modelo supera el rendimiento agregado de sondas de representaciones congeladas basadas en PE-Core-G14 y DINOv3 ViT-7B/16. No se han publicado resultados en benchmarks estándar de visión como ImageNet o COCO en la información disponible.

## Requisitos de hardware

- Al ser un modelo ConvNeXt V2 Tiny, el consumo de memoria es reducido, aunque no se proporcionan cifras exactas de VRAM en la documentación.
- Dado el formato ONNX, puede ejecutarse en GPUs consumer (p. ej., RTX 3060 o superiores) y en CPUs con aceleración ONNX Runtime.
- El despliegue es viable en sistemas embebidos o edge si se aplica cuantización, aunque no se documenta oficialmente.
- Opciones de despliegue: ONNX Runtime, TensorRT, OpenVINO u otros runtimes compatibles con ONNX.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

La model card menciona comparaciones con dos representaciones visuales de gran tamaño:

| Modelo | Tipo | Parámetros | Precisión media (benchmark Awiros) |
|---|---|---|---|
| Awiros ConvNeXt V2 Tiny (este) | Especialista compacto | no disponible | 82,18% |
| PE-Core-G14 (sonda congelada) | Representación generalista | no disponible | inferior (no especificado) |
| DINOv3 ViT-7B/16 (sonda congelada) | Representación generalista | ~7B | inferior (no especificado) |

No se dispone de comparativas con otros modelos de reconocimiento de atributos de persona (p. ej., basados en ResNet o Swin Transformer) en la información proporcionada.

## Limitaciones y advertencias

- La licencia es "other", lo que implica condiciones personalizadas no especificadas. Es necesario contactar con Awiros para aclarar los términos de uso comercial antes de desplegar el modelo en producción.
- El modelo depende de la calidad del recorte de persona; si el recorte es muy pequeño, muy ocluido o con desenfoque extremo, la precisión puede degradarse.
- Los atributos están definidos en inglés; no hay soporte multilingüe para las etiquetas.
- No se han publicado análisis de sesgos demográficos (p. ej., por género, edad o etnia) en la documentación disponible.
- El modelo está especializado en atributos de persona; no es un clasificador de propósito general ni un modelo generativo.
- Las pseudo-etiquetas generadas por el modelo de visión-lenguaje pueden contener errores residuales a pesar del filtrado por consenso, lo que podría afectar a la robustez en casos límite.
- No se proporcionan métricas de calibración ni de incertidumbre, por lo que las salidas deben interpretarse con cautela en aplicaciones críticas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Awiros/person-attribute-recognition)
- [Perfil de Awiros en Hugging Face](https://huggingface.co/Awiros)
- [Sitio web de Awiros](https://www.awiros.com/)
