# Membrizard/ml_conformer_generator

## Resumen

ML Conformer Generator es un modelo de generación molecular basado en difusión, desarrollado por Membrizard, que genera conformadores tridimensionales de moléculas a partir de su estructura química. Resuelve el problema de predecir geometrías moleculares 3D estables y diversas, una tarea crítica en química computacional y descubrimiento de fármacos, donde los métodos tradicionales de búsqueda conformacional (como los basados en mecánica molecular) son costosos computacionalmente.

El modelo está entrenado sobre un subconjunto filtrado de la base de datos ChEMBL y emplea una arquitectura de difusión para muestrear directamente coordenadas atómicas. Se distribuye en formato ONNX, con un tamaño de repositorio de 0,7 GB, y está diseñado para integrarse en pipelines de quimioinformática mediante la librería `mlconfgen`, compatible con RDKit. Su relevancia actual radica en la creciente demanda de herramientas generativas que aceleren el diseño de fármacos y el cribado virtual, ofreciendo una alternativa rápida a los métodos clásicos de generación de conformadores.

El acceso al modelo está restringido (gated) en HuggingFace, por lo que requiere aceptar condiciones de uso adicionales. Aunque la licencia declarada es Apache 2.0, el repositorio incluye la etiqueta "non-commercial", lo que introduce ambigüedad sobre los términos de uso en entornos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (generación de coordenadas 3D) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (generación de moléculas, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (metadatos), aunque el modelo trabaja con moléculas |
| Licencia | Apache 2.0 (con etiqueta "non-commercial" en el repositorio) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea un enfoque de difusión probabilística para generar conformadores 3D de moléculas. En lugar de predecir directamente las coordenadas atómicas, el proceso de difusión corrompe gradualmente las geometrías con ruido y luego aprende a revertir ese proceso, muestreando estructuras válidas desde el ruido. Esta arquitectura es especialmente adecuada para capturar la distribución multimodal de conformaciones que una molécula puede adoptar, superando las limitaciones de los métodos deterministas.

Los datos de entrenamiento provienen de ChEMBL filtrado, un conjunto de moléculas bioactivas ampliamente utilizado en quimioinformática. El autor no ha publicado detalles sobre el número de tokens (no aplica), el volumen exacto de datos, o si se utilizaron técnicas de alineamiento o refinamiento post-entrenamiento. La librería `mlconfgen` integra RDKit para el manejo de estructuras químicas, lo que sugiere que el preprocesado y la validación de las moléculas generadas se realiza con herramientas estándar de la química computacional.

## Capacidades

- Generación de conformadores 3D: produce coordenadas atómicas tridimensionales para moléculas dadas, con diversidad conformacional.
- Validez molecular: genera estructuras químicamente válidas en un rango de 48% a 93% de los casos, dependiendo de las condiciones de muestreo.
- Novedad química: alta capacidad para explorar espacios químicos nuevos, con una tasa de novedad del 99,84%.
- Unicidad: genera conformadores distintos con una tasa de unicidad del 99,94%, evitando la duplicación de estructuras.
- Similitud de forma: los conformadores generados alcanzan una similitud Tanimoto de forma promedio entre 53% y 70%, y un máximo del 99,69% respecto a estructuras de referencia.
- Accesibilidad sintética: los compuestos generados presentan una puntuación media de síntesis (SA Score) de 3,18, indicando una complejidad sintética moderada.
- Integración con RDKit: compatible con el ecosistema de quimioinformática de Python.

## Casos de uso

- Cribado virtual de fármacos: generar conformadores 3D para moléculas candidatas y realizar docking molecular contra dianas terapéuticas, acelerando la identificación de compuestos activos.
- Diseño de bibliotecas químicas: crear conjuntos diversos de conformadores para enriquecer bibliotecas de compuestos en proyectos de química medicinal.
- Estudios conformacionales: analizar el paisaje conformacional de moléculas flexibles, útil para entender la relación estructura-actividad.
- Preparación de datos para modelos de aprendizaje automático: generar geometrías 3D de alta calidad como entrada para redes neuronales equivariantes o modelos de predicción de propiedades.
- Optimización de lead compounds: explorar variantes conformacionales de un compuesto líder para mejorar su afinidad o propiedades farmacocinéticas.
- Generación de conformadores para dinámica molecular: proporcionar puntos de partida realistas para simulaciones de dinámica molecular, reduciendo el tiempo de equilibrado.
- Validación de métodos de quimioinformática: usar las métricas de novedad y unicidad para comparar con otros generadores de conformadores en pipelines de investigación.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card, evaluados sobre el conjunto ChEMBL filtrado. No se proporcionan comparaciones con otros modelos ni se ha verificado de forma independiente.

| Metrica | Valor |
|---|---|
| Valid molecules | 48-93% |
| Chemical novelty | 99,84% |
| Shape Tanimoto Similarity (avg) | 53,32% - 69,97% |
| Shape Tanimoto Similarity (max) | 99,69% |
| Average Synthesis Access score | 3,18 |
| Unique molecules | 99,94% |
| Fréchet Fingerprint Distance | 4,13 |

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware publicados por el autor.
- El tamaño del repositorio es de 0,7 GB en formato ONNX, lo que sugiere que el modelo podría ejecutarse en GPUs de consumo medio (por ejemplo, RTX 3060 o superiores) con suficiente memoria VRAM, aunque no hay datos confirmados.
- Al ser ONNX, es compatible con runtime de inferencia como ONNX Runtime, que permite despliegue en CPU y GPU.
- No se han publicado estimaciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros generadores de conformadores 3D como GeoDiff, Torsional Diffusion o DMCG en la información proporcionada. Se recomienda consultar la literatura reciente sobre generación conformacional basada en difusión para evaluar el rendimiento relativo.

## Limitaciones y advertencias

- Acceso restringido: el modelo es de tipo gated en HuggingFace, por lo que requiere solicitar acceso y aceptar condiciones adicionales antes de su uso.
- Ambigüedad de licencia: aunque la licencia declarada es Apache 2.0, la etiqueta "non-commercial" en el repositorio contradice esa licencia, lo que puede limitar su uso en entornos comerciales. Se debe contactar al autor para aclarar los términos.
- Validez molecular variable: la tasa de moléculas válidas oscila entre 48% y 93%, lo que implica que una fracción significativa de las estructuras generadas puede requerir filtrado o corrección.
- Sesgos del conjunto de entrenamiento: al entrenarse con ChEMBL, el modelo puede estar sesgado hacia moléculas bioactivas y espacios químicos bien representados en esa base de datos, limitando su generalización a otras áreas de la química.
- Riesgo de alucinación estructural: aunque la novedad química es alta, algunas estructuras generadas pueden ser estéricamente imposibles o energéticamente inestables, aunque no se han reportado casos específicos.
- Documentación limitada: no se proporcionan detalles sobre hiperparámetros, configuración de entrenamiento o arquitectura exacta, lo que dificulta la reproducibilidad.
- Sin soporte para otros formatos: solo se ofrece ONNX, sin pesos en PyTorch o TensorFlow, lo que puede limitar la integración en ciertos frameworks.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Membrizard/ml_conformer_generator
- DOI asociado: 10.57967/hf/5165
- Dataset ChEMBL: https://www.ebi.ac.uk/chembl/
- Librería RDKit: https://www.rdkit.org/
