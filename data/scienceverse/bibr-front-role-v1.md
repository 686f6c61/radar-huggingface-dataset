# scienceverse/bibr-front-role-v1

## Resumen

`bibr-front-role-v1` es un clasificador basado en gradiente boosting, desarrollado por el equipo de scienceverse, que asigna un rol semántico a cada región de texto de la página de un artículo científico. Los roles posibles son: `title`, `byline`, `affiliation`, `abstract`, `keywords`, `doi_line`, `masthead`, `heading`, `ref_header`, `body` y `other`. El modelo se integra como evidencia complementaria en el pipeline de `bibr`, una herramienta de extracción de metadatos de front-matter, junto con heurísticas léxicas.

A diferencia de los modelos de lenguaje de gran tamaño, este es un modelo ligero entrenado sobre características geométricas de la página (posición relativa, tamaño de fuente relativo y forma del texto independiente del idioma). Esto le permite reconocer firmas de autor aunque el texto no siga patrones léxicos en inglés. Está entrenado con 328.781 ejemplos procedentes de JATS de editoriales proyectados sobre regiones de OCR, lo que garantiza etiquetas de verdad absoluta sin depender de opiniones de un LLM.

El modelo se distribuye como un artefacto pickle de scikit-learn con licencia Apache-2.0. Su relevancia actual radica en que mejora significativamente la resolución de front-matter en documentos científicos, un paso crítico para la indexación y el análisis bibliométrico, y lo hace con un coste computacional mínimo y sin necesidad de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting classifier (scikit-learn) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa regiones individuales, no secuencias) |
| Tipos de cuantizacion | no aplica (modelo clasico de ML) |
| Idiomas soportados | no disponible (disena independiente del idioma por forma de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | joblib (pickle) |

## Arquitectura y entrenamiento

El modelo es un clasificador de gradiente boosting implementado con scikit-learn. No se especifica el número exacto de árboles ni los hiperparámetros, pero al ser un modelo pequeño y especializado, su arquitectura se limita a un conjunto de árboles de decisión que procesan características numéricas por región: geometría relativa a la página, tamaño de fuente relativo y características de forma del texto (independientes del script). Esto permite que el modelo generalice a distintos idiomas y estilos de publicación sin depender de diccionarios léxicos.

El entrenamiento se realizó sobre 328.781 filas generadas a partir de JATS de editoriales proyectados sobre regiones de OCR. Las etiquetas son la verdad absoluta extraída de los metadatos JATS, no anotaciones subjetivas. No se menciona el uso de RLHF ni técnicas de ajuste fino sobre LLM, ya que no es un modelo generativo. Toda la información de entrenamiento se limita a estos datos supervisados.

## Capacidades

- Clasificación de regiones de texto en páginas de artículos científicos en 11 roles distintos (título, firma, afiliación, resumen, palabras clave, línea DOI, cabecera, encabezado, cabecera de referencias, cuerpo y otros).
- Reconocimiento de la firma del autor mediante características geométricas y de forma de texto, sin depender de patrones léxicos en inglés.
- Integración como evidencia complementaria en el pipeline `bibr`, junto con heurísticas de front-matter.
- Independencia del script: funciona con textos en cualquier alfabeto siempre que las características de forma sean consistentes.
- Bajo coste computacional: inferencia rápida en CPU, apta para procesamiento por lotes de documentos.
- No es un modelo generativo: no genera texto, no soporta tool calling, ni agentes, ni razonamiento multi-step.
- No dispone de capacidades multimodales (solo procesa características numéricas preextraídas, no imágenes directamente).

## Casos de uso

- Extracción de metadatos de front-matter en repositorios de papers: el modelo identifica automáticamente título, autores y afiliaciones en las primeras páginas de artículos, facilitando la creación de bases de datos bibliográficas.
- Mejora de sistemas de OCR para documentos científicos: al clasificar regiones, permite post-procesar el texto extraído y asignar etiquetas semánticas a cada bloque, útil para la reconstrucción estructurada del documento.
- Indexación de literatura científica en motores de búsqueda: la clasificación precisa de resúmenes y palabras clave permite mejorar la recuperación de información y la generación de índices temáticos.
- Automatización de pipelines de revisión por pares: al identificar la línea DOI, el encabezado y la cabecera de referencias, se pueden validar automáticamente los metadatos de los manuscritos enviados a revistas.
- Análisis bibliométrico a gran escala: la detección fiable de firmas y afiliaciones permite agregar datos de autoría y filiación para estudios de colaboración y productividad científica.
- Construcción de datasets de entrenamiento para modelos de lenguaje: el modelo puede etiquetar regiones de texto de papers para generar datos de entrenamiento de sistemas de question answering o summarization especializados en literatura científica.

## Benchmarks y rendimiento

El modelo reporta resultados sobre una partición de test con 19.252 regiones. La exactitud global es de 0,955 y el F1 macro de 0,893. La siguiente tabla detalla el rendimiento por rol:

| role | precision | recall | F1 | support |
|---|---|---|---|---|
| title | 1.000 | 0.964 | 0.981 | 110 |
| doi_line | 0.994 | 0.981 | 0.987 | 876 |
| byline | 0.922 | 0.801 | 0.858 | 267 |
| affiliation | 0.891 | 0.946 | 0.918 | 241 |
| abstract | 0.963 | 0.706 | 0.815 | 296 |
| keywords | 0.934 | 0.486 | 0.640 | 146 |
| ref_header | 0.833 | 0.798 | 0.815 | 94 |
| heading | 0.982 | 0.989 | 0.985 | 2121 |
| masthead | 0.927 | 0.871 | 0.898 | 1285 |
| body | 0.955 | 0.973 | 0.964 | 5321 |
| other | 0.951 | 0.969 | 0.960 | 8495 |

Además, en una evaluación por artículo (106 papers de test), el modelo identifica correctamente la región de título con una precisión del 100% y las regiones de firma cubren la firma real en el 96% de los casos. En una reproducción sobre 192 artículos anotados manualmente, la integración del modelo en `bibr` mejora la resolución de títulos de 0,849 a 0,901 y la de firmas de 0,260 a 0,698, reduciendo la abstención de 0,104 a 0,047.

## Requisitos de hardware

- El modelo es extremadamente ligero (tamaño del repositorio 0,0 GB), por lo que se puede ejecutar en cualquier CPU, incluso en entornos embebidos o contenedores serverless.
- No requiere GPU. La inferencia se realiza con scikit-learn y es del orden de milisegundos por región.
- Memoria RAM estimada: inferior a 100 MB para cargar el modelo y las características.
- Despliegue recomendado: integración directa en Python con `joblib.load()` (usando un loader restringido por seguridad, como se indica en la documentación).
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- El rendimiento es suficiente para procesar miles de páginas por minuto en un solo núcleo de CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la categoría de clasificación de roles de regiones en documentos científicos. Aunque existen sistemas de extracción de metadatos basados en heurísticas o en modelos de lenguaje (por ejemplo, GROBID o CERMINE), no hay datos públicos que permitan una comparación cuantitativa directa con `bibr-front-role-v1`. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo es un pickle de Python, lo que implica un riesgo de seguridad si se carga desde una fuente no confiable. La documentación recomienda usar un loader con restricciones de gadgets y solo apuntar a checkpoints de confianza.
- Está diseñado exclusivamente para clasificar regiones de texto ya extraídas por OCR; no procesa imágenes directamente ni corrige errores de OCR.
- La clasificación de `keywords` tiene un recall bajo (0,486), lo que indica que muchas regiones de palabras clave no se detectan correctamente. Esto puede deberse a la variabilidad en la presentación de esta sección.
- El modelo depende de la calidad de las características geométricas y de forma del texto; si el OCR produce regiones mal segmentadas, el rendimiento puede degradarse.
- No es un modelo multilingüe en el sentido de que no está entrenado con datos lingüísticos, pero su independencia del script es una ventaja; sin embargo, no hay evidencia de rendimiento en alfabetos no latinos más allá de la afirmación de diseño.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no incluye garantías de exactitud para todos los tipos de publicaciones científicas (preprints, revistas con formatos inusuales, etc.).
- No soporta tareas de generación de texto, razonamiento o diálogo; es un componente de un pipeline más amplio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scienceverse/bibr-front-role-v1
- Repositorio de bibr: https://github.com/scienceverse/bibr
