# jtreminio/sam3.1

## Resumen

SAM 3.1 es un modelo fundacional de segmentación promptable desarrollado por Meta AI, sucesor de SAM 3. Se trata de un checkpoint que permite segmentar, detectar y rastrear objetos en imágenes y vídeos mediante prompts de texto o visuales (puntos, cajas o máscaras). Su principal innovación es el módulo Object Multiplex, un enfoque de memoria compartida para el seguimiento conjunto de múltiples objetos que acelera la inferencia aproximadamente 7 veces en escenarios con 128 objetos sobre una sola GPU H100, sin sacrificar precisión. El modelo mejora el rendimiento en 6 de 7 benchmarks de segmentación de vídeo (VOS) respecto a su predecesor.

El modelo es completamente open source, con pesos disponibles en HuggingFace y código en el repositorio oficial de Meta. No existe integración con Hugging Face Transformers; el uso se realiza a través del repositorio de GitHub. El tamaño del repositorio es de 3.5 GB, lo que sugiere un modelo de tamaño medio, aunque no se han publicado los parámetros totales. Está orientado a investigación y aplicaciones comerciales de visión por computador, siendo el estándar de facto en segmentación promptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Anything Model (SAM) con Object Multiplex para tracking multi-objeto |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (prompts de texto en ingles) |
| Licencia | other (licencia de Meta, acceso controlado mediante formulario con campos gated) |
| Formato de pesos | checkpoint (3.5 GB, sin integracion Transformers) |

## Arquitectura y entrenamiento

SAM 3.1 es un modelo de segmentación promptable que combina un encoder de imágenes con un decoder de máscaras, similar a la familia SAM de Meta. La innovación principal de esta versión es Object Multiplex, una arquitectura de memoria compartida que permite procesar todos los objetos rastreados en una única pasada conjunta, en lugar de procesarlos individualmente. Este enfoque reduce el coste computacional y mejora la eficiencia en escenas con muchos objetos, logrando una aceleración de aproximadamente 7 veces en inferencia con 128 objetos en una GPU H100.

El modelo acepta prompts de texto (frases cortas que describen un concepto open-vocabulary) y prompts visuales (puntos, cajas o máscaras) para segmentar exhaustivamente todas las instancias de un concepto en una imagen o vídeo. SAM 3 ya introdujo esta capacidad de segmentación exhaustiva open-vocabulary, manejando más de 50 veces más conceptos únicos que los benchmarks existentes. SAM 3.1 se centra en mejorar el tracking multi-objeto en vídeo, con mejoras en 6 de 7 benchmarks VOS.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens de datos utilizados ni si se emplearon técnicas de RLHF o DPO. El modelo se distribuye como checkpoint sin integración con librerías estándar de Hugging Face.

## Capacidades

- Segmentación promptable en imágenes y vídeos mediante prompts de texto, puntos, bordes o máscaras.
- Segmentación exhaustiva de todas las instancias de un concepto open-vocabulary descrito con una frase corta de texto.
- Seguimiento y segmentación de múltiples objetos en vídeo (VOS) con alta eficiencia mediante Object Multiplex.
- Detección y segmentación de objetos en escenas densas o concurridas, con razonamiento global para mejorar la precisión.
- Inferencia en tiempo real, con aceleración significativa en escenarios de muchos objetos (7x en 128 objetos con H100).
- Capacidades multilingües limitadas a prompts de texto en inglés (el modelo procesa imágenes y vídeos, no texto general).

## Casos de uso

- Seguimiento de objetos en vídeo para análisis deportivo: el modelo puede rastrear múltiples jugadores simultáneamente en tiempo real, gracias a Object Multiplex, y segmentar sus siluetas para análisis táctico o estadístico.
- Moderación de contenido visual en redes sociales: segmentación de objetos específicos (personas, vehículos, armas) en imágenes y vídeos para aplicar políticas de moderación automática.
- Análisis de tráfico y videovigilancia: detección y seguimiento de vehículos y peatones en escenas urbanas congestionadas, con la capacidad de segmentar exhaustivamente todas las instancias de una clase (coches, motos) en una sola pasada.
- Anotación automática de datasets para visión por computador: el modelo puede generar máscaras de segmentación de alta calidad para imágenes y vídeos, reduciendo el esfuerzo manual de anotación en pipelines de datos.
- Robótica y navegación autónoma: segmentación de objetos en tiempo real para evitar obstáculos y planificar trayectorias en entornos dinámicos, aprovechando la inferencia rápida en GPUs.
- Edición de vídeo profesional: segmentación de objetos específicos (personas, vehículos) para aplicar efectos visuales, desenfocar fondos o reemplazar elementos en postproducción, con prompts de texto como "persona" o "coche".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks con números concretos en la información disponible. La documentación menciona que SAM 3.1 mejora el rendimiento VOS en 6 de 7 benchmarks respecto a SAM 3, y que la inferencia es aproximadamente 7 veces más rápida con 128 objetos en una GPU H100, sin sacrificar precisión. No se proporcionan métricas específicas como mIoU, J&F o latencia por frame.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, pero el tamaño del checkpoint es de 3.5 GB, lo que sugiere que puede caber en GPUs con 8 GB o más de VRAM en modo de inferencia.
- GPU recomendadas: la información menciona H100 para la mejora de 7x con 128 objetos, pero no se indica la GPU mínima necesaria. Es probable que funcione en GPUs de consumo como RTX 3090 o RTX 4090 para imágenes individuales, aunque el tracking de vídeo con muchos objetos puede requerir más memoria.
- Compatibilidad con consumer GPU: probablemente sí para imágenes y vídeos cortos, pero no confirmado.
- Opciones de despliegue: el modelo se distribuye como checkpoint y requiere el código del repositorio oficial de SAM 3. No hay soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Se puede desplegar con PyTorch directamente.
- Latencia y throughput: no disponibles. La aceleración de 7x se menciona para 128 objetos en H100, pero no se dan cifras absolutas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM 3.1 (Meta) | Segmentación promptable imagen/vídeo | no disponible | no disponible | other (gated) | HuggingFace + GitHub |
| SAM 3 (Meta) | Segmentación promptable imagen/vídeo | no disponible | no disponible | other (gated) | HuggingFace + GitHub |
| SAM 2 (Meta) | Segmentación promptable imagen/vídeo | no disponible | no disponible | Apache 2.0 | HuggingFace + GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. SAM 3.1 es el más reciente de la familia y se centra en la eficiencia del tracking multi-objeto.

## Limitaciones y advertencias

- La licencia es "other" con gated access, lo que significa que los usuarios deben completar un formulario con datos personales y aceptar los términos de Meta. No se especifica si es libre para uso comercial; se recomienda revisar la licencia en el repositorio oficial.
- El modelo solo acepta prompts de texto en inglés, lo que limita su uso en aplicaciones multilingües.
- No hay integración con Hugging Face Transformers, por lo que el despliegue requiere el código del repositorio de SAM 3, lo que puede aumentar la complejidad de integración.
- No se han publicado detalles sobre sesgos o riesgos de alucinación en la segmentación. Como modelo de visión, puede fallar en la segmentación de objetos con apariencia inusual o en escenas con oclusiones severas.
- No se especifican requisitos mínimos de hardware, por lo que el usuario debe experimentar para determinar la viabilidad en su infraestructura.
- El modelo está diseñado para inglés; los prompts de texto en otros idiomas pueden no funcionar correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jtreminio/sam3.1
- Repositorio de código SAM 3: https://github.com/facebookresearch/sam3
- Blog de Meta sobre SAM 3.1: https://ai.meta.com/blog/segment-anything-model-3/
- Artículo sobre Object Multiplex: https://awesomeagents.ai/news/meta-sam-3-1-object-multiplex/
- Playground de Segment Anything: https://segment-anything.com/ (enlace inferido, no confirmado)
- Análisis de SAM 3.1: https://the-agent-report.com/2026/05/meta-sam-3-1-video-detection-multiplexing-may21/
