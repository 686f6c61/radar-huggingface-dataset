# Magnexis/lexiconerror-router-medium

## Resumen

LexiconError Router Medium es un modelo de clasificación de texto desarrollado por Magnexis para enrutar diagnósticos de errores de programación. Dado un mensaje de error, un stack trace o un fragmento de código cercano, predice el lenguaje de programación, la categoría del diagnóstico y la severidad del problema. No genera soluciones ni ejecuta código, sino que actúa como un clasificador ligero orientado a herramientas de desarrollo y sistemas de soporte.

El modelo pertenece a una familia de tres variantes (Small, Medium y Large) diferenciadas por su presupuesto de características. Esta versión media utiliza 100.000 características de palabras y caracteres, con 9.700.097 parámetros lineales aprendidos, y está entrenada sobre el dataset Magnexis/lexiconerror-diagnostics. Su diseño basado en scikit-learn y TF-IDF lo hace extremadamente eficiente en CPU, sin necesidad de GPU, lo que lo convierte en una opción práctica para entornos de escritorio, APIs locales y pipelines de integración continua.

La relevancia actual radica en la creciente necesidad de automatizar el triaje de errores en entornos de desarrollo heterogéneos, donde múltiples lenguajes y herramientas generan diagnósticos diversos. Este modelo ofrece una solución compacta y reproducible para clasificar y enrutar esos errores antes de que un humano o un sistema más complejo los procese.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador lineal multicabeza sobre características TF-IDF de palabras y caracteres |
| Parametros totales | 9.700.097 (parámetros lineales aprendidos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificador de texto, no modelo generativo) |
| Tipos de cuantizacion | No aplica (modelo de scikit-learn, no requiere cuantización) |
| Idiomas soportados | No disponible (clasifica mensajes de error de lenguajes de programación, no idiomas naturales) |
| Licencia | other (revisar NOTICE del dataset antes de redistribuir) |
| Formato de pesos | joblib (pickle) |

## Arquitectura y entrenamiento

El modelo se compone de un vectorizador TF-IDF que transforma el texto de entrada en una representación dispersa de 100.000 características (palabras y caracteres), seguido de tres clasificadores lineales independientes, uno por cada cabeza de salida: lenguaje, categoría y severidad. Cada clasificador es un modelo lineal (probablemente regresión logística) entrenado con scikit-learn 1.9.0 sobre Python 3.13.14.

El entrenamiento utilizó un split determinista 80/20 agrupado por lenguaje, con 13.189 registros de entrenamiento y 3.285 de evaluación. Los registros etiquetados como "Verified" recibieron un peso de muestreo de 1.5x, mientras que los "Needs Review" se mantuvieron sin aprobar explícitamente. Se excluyeron campos explícitos de lenguaje, categoría, severidad, herramienta y fuente para evitar fugas de metadatos. El dataset completo contiene 16.474 registros estructurados, todos elegibles para entrenamiento. La semilla aleatoria fue 42.

No se mencionan técnicas como RLHF, DPO ni ajuste fino de modelos preentrenados; se trata de un entrenamiento supervisado clásico sobre características de texto.

## Capacidades

- Clasificación de mensajes de error en tres dimensiones: lenguaje de programación, categoría de diagnóstico y severidad.
- Procesamiento de entradas variadas: mensajes de error, stack traces, diagnósticos de compilador y fragmentos de código cercanos.
- Soporte para múltiples lenguajes de programación (implícito en el dataset, aunque no se detallan cuáles).
- Salida de probabilidades por clase (a través de los clasificadores lineales), útil para umbrales de confianza.
- Inferencia rápida en CPU, apta para integración en tiempo real o casi real.
- No genera texto, no ejecuta código, no ofrece explicaciones ni sugerencias de corrección.
- No soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Triaje automático de tickets de soporte: el modelo puede clasificar los errores reportados por usuarios en lenguaje, categoría y severidad, permitiendo enrutar cada ticket al equipo técnico adecuado (backend, frontend, infraestructura) y priorizar los más críticos.
- Integración en pipelines de CI/CD: al detectar un fallo de compilación o un test roto, el modelo clasifica el error y lo etiqueta automáticamente en el sistema de seguimiento de incidencias, ahorrando tiempo a los desarrolladores.
- Preprocesamiento de logs en producción: los logs de aplicaciones pueden contener excepciones y errores de distintos lenguajes; el modelo los clasifica para alimentar dashboards de monitorización y alertas por severidad.
- Asistente en editores de código: un plugin puede usar el modelo para identificar rápidamente el tipo de error que el desarrollador está viendo y sugerir documentación relevante o enlaces a la categoría correspondiente.
- Clasificación de errores en entornos de aprendizaje: plataformas de enseñanza de programación pueden usar el modelo para categorizar los errores de los estudiantes y ofrecer ayudas específicas según la categoría y severidad.
- Enrutamiento en sistemas de gestión de incidencias (issue trackers): al recibir un reporte de error, el modelo asigna automáticamente etiquetas de lenguaje, categoría y severidad, facilitando la búsqueda y el filtrado posterior.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación sobre el split de test (3.285 registros):

| Cabeza | Accuracy | Macro F1 | Weighted F1 | Top-3 accuracy |
| --- | ---: | ---: | ---: | ---: |
| Language | 0.998 | 0.935 | 0.998 | 0.999 |
| Category | 0.969 | 0.842 | 0.969 | 0.999 |
| Severity | 0.988 | 0.792 | 0.987 | 1.000 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los valores de macro F1 son inferiores a los de weighted F1, lo que sugiere que algunas clases minoritarias (lenguajes o categorías poco frecuentes) tienen un rendimiento más bajo, como se advierte en las limitaciones.

## Requisitos de hardware

- Inferencia en CPU: el modelo es extremadamente ligero (9,7 millones de parámetros lineales) y no requiere GPU. Cualquier procesador moderno puede ejecutarlo en milisegundos.
- Memoria RAM: el artefacto joblib ocupa menos de 100 MB (tamaño del repo 0.0 GB, aunque el peso real no se especifica). Es viable en máquinas con 1-2 GB de RAM disponibles.
- GPU: no necesaria. No se recomienda su despliegue en GPU por ser un modelo clásico.
- Opciones de despliegue: al ser un artefacto joblib, se puede cargar en cualquier proceso Python. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia: no se proporcionan mediciones, pero al ser un clasificador lineal sobre TF-IDF, la inferencia es del orden de microsegundos a milisegundos por muestra en CPU.

## Comparativa con modelos similares

Dentro de la misma familia de Magnexis, se pueden comparar las tres variantes:

| Modelo | Características | Parámetros | Uso previsto |
| --- | ---: | ---: | --- |
| lexiconerror-router-small | 25.000 | No especificado | Editores y máquinas con poca memoria |
| lexiconerror-router-medium | 100.000 | 9.700.097 | Escritorio recomendado, APIs locales |
| lexiconerror-router-large | 250.000 | No especificado | Máxima retención de vocabulario |

No se dispone de información sobre otros modelos de clasificación de errores similares en el ecosistema open source para realizar una comparativa externa.

## Limitaciones y advertencias

- Los resultados de evaluación pueden ser optimistas debido a plantillas derivadas de registros y familias de diagnóstico repetidas.
- Las etiquetas raras pueden tener poco soporte en la evaluación, lo que dificulta conclusiones fiables por clase.
- Los valores de confianza son probabilidades del clasificador, no garantías de que el diagnóstico sea correcto.
- El modelo debe usarse para enrutar consultas dentro de LexiconError, no como sustituto de la documentación oficial de compiladores, runtimes, revisiones de seguridad o depuración humana.
- La licencia es "other" y los términos de los datos de origen varían; es necesario revisar el NOTICE del dataset antes de cualquier redistribución.
- Cargar artefactos joblib/pickle puede ejecutar código arbitrario; solo debe cargarse desde el repositorio oficial de Magnexis o tras verificar SHA256SUMS.txt.
- No se especifican los lenguajes de programación cubiertos ni el detalle de las categorías, lo que limita la previsibilidad en dominios no representados en el dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Magnexis/lexiconerror-router-medium
- Dataset de entrenamiento: https://huggingface.co/datasets/Magnexis/lexiconerror-diagnostics
- Variante Small: https://huggingface.co/Magnexis/lexiconerror-router-small
- Variante Large: https://huggingface.co/Magnexis/lexiconerror-router-large
