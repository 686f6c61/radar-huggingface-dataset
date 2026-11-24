# chadkw/Slidemix

## Resumen

Slidemix es un modelo de aprendizaje de instancias múltiples basado en atención (ABMIL, attention-based multiple instance learning) entrenado con la técnica de aumento de datos SlideMix, orientado al análisis de imágenes de portaobjetos completos (whole slide images, WSI) en patología computacional. Lo desarrolla el autor chadkw y se publica bajo licencia Apache 2.0, con un artículo asociado (arXiv:2609.00396) y código en el repositorio Xia-Research-Lab/SlideMix.

El modelo resuelve la tarea de clasificación agregada a nivel de portaobjetos: recibe un conjunto de embeddings de parches (tiles) y produce una predicción a nivel de imagen completa mediante una capa de atención que pondera la contribución de cada parche. Es relevante porque el aumento SlideMix busca mejorar la robustez del clasificador frente a la variabilidad de las WSI sin necesidad de aumentar el coste de codificación de parches.

Se trata de un modelo muy pequeño: 899.891 parámetros totales en formato safetensors, con un tamaño de repositorio de 0,0 GB. No incluye el codificador de parches; requiere embeddings GigaPath precalculados como entrada. La información pública disponible no detalla arquitectura interna completa, contexto, idiomas ni datos de entrenamiento más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ABMIL (attention-based multiple instance learning) |
| Parametros totales | 899.891 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es ABMIL: un agregador con atención que opera sobre un conjunto de embeddings de instancias (parches o tiles) y combina sus representaciones en una única predicción a nivel de bolsa (portaobjetos). El modelo no incluye el codificador visual; la model card indica explícitamente que se necesitan embeddings GigaPath como entrada, por lo que el pipeline completo requiere codificar previamente los tiles con GigaPath y pasar esos vectores al agregador ABMIL.

El entrenamiento emplea la técnica SlideMix, descrita en el artículo "SlideMix: Enhancing Whole Slide Image Analysis via Multimodal Shuffling", que consiste en un aumento de datos basado en mezclado/shuffling multimodal. La información proporcionada no especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicables habitualmente en este tipo de modelo). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación a nivel de portaobjetos (WSI) agregando embeddings de parches mediante atención.
- Aprendizaje de instancias múltiples: maneja bolsas de tamaño variable de tiles sin requerir una secuencia fija.
- Ponderación interpretable de instancias mediante los pesos de atención (permite inspeccionar qué parches contribuyen más a la predicción).
- Aumento de datos SlideMix integrado en el entrenamiento para mejorar la generalización.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-step.
- Capacidades multilingües: no aplicable (modelo no lingüístico).
- Capacidades especiales: no disponible más allá del agregado ABMIL sobre embeddings GigaPath.

## Casos de uso

- Clasificación de portaobjetos en patología digital: se codifican los tiles con GigaPath, se agregan con el ABMIL y se obtiene una predicción a nivel de WSI; adecuado por su bajo coste computacional una vez calculados los embeddings.
- Triaje de casos en laboratorios: el modelo puede priorizar portaobjetos según la probabilidad predicha, reduciendo la carga de revisión manual en flujos con muchos casos.
- Investigación en biomarcadores: al exponer pesos de atención por parche, permite analizar qué regiones del tejido influyen en la predicción y apoyar estudios exploratorios.
- Integración en pipelines de preprocesado existentes: al requerir solo embeddings GigaPath, se inserta como etapa final sobre infraestructuras que ya codifican WSI.
- Experimentación con aumento de datos: sirve como referencia para evaluar el efecto de SlideMix frente a un ABMIL entrenado sin ese aumento.
- Prototipado rápido en entornos con recursos limitados: con menos de un millón de parámetros, la inferencia es ligera y puede ejecutarse en CPU para conjuntos moderados de portaobjetos.
- Evaluación comparativa de codificadores: al ser un agregador independiente del codificador, permite comparar el rendimiento de distintos embeddings manteniendo fijo el clasificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con 899.891 parámetros, los pesos ocupan del orden de unos pocos megabytes en precisión completa.
- GPU recomendadas: no se especifican; cualquier GPU con suficiente memoria para el codificador GigaPath, que es el componente dominante del pipeline.
- Cabe en GPU de consumo: sí, el agregador ABMIL es trivial en memoria; el requisito real depende de GigaPath y del tamaño de la bolsa de tiles.
- Opciones de despliegue: no se documentan frameworks concretos (vLLM, llama.cpp, Ollama, TGI no son aplicables a este tipo de modelo); el repositorio de código del artículo es la referencia de uso.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Slidemix (chadkw) | 899.891 | no disponible | ABMIL sobre embeddings GigaPath | apache-2.0 | Hugging Face |
| ABMIL estándar (Ilse et al.) | no disponible | no disponible | MIL con atención | no disponible | Implementaciones públicas |
| CLAM (Lu et al.) | no disponible | no disponible | MIL con atención para WSI | no disponible | Código público |
| TransMIL | no disponible | no disponible | MIL con transformer | no disponible | Código público |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los modelos citados se incluyen como referencias de la misma categoría (agregadores MIL para WSI).

## Limitaciones y advertencias

- El modelo no incluye el codificador de parches: sin embeddings GigaPath precalculados no puede usarse directamente.
- No se documentan sesgos conocidos, pero al entrenarse sobre datos de patología puede heredar sesgos de los conjuntos de entrenamiento (por ejemplo, sesgos de centro hospitalario o de población).
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de predicciones erróneas o sobreconfiadas en portaobjetos fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no aplicables o no disponibles; el modelo no procesa texto.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar las condiciones de los embeddings GigaPath, que se distribuyen por separado.
- Para producción: verificar el pipeline de codificación de tiles, el tamaño de bolsa soportado y la calibración de las probabilidades; la información pública no detalla estos extremos.
- El repositorio tiene 0 descargas y 1 like, por lo que la validación por la comunidad es todavía muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/chadkw/Slidemix
- Paper: https://arxiv.org/abs/2609.00396
- Código: https://github.com/Xia-Research-Lab/SlideMix
