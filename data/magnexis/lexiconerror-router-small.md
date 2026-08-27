# Magnexis/lexiconerror-router-small

## Resumen

LexiconError Router Small es un clasificador de texto ligero desarrollado por Magnexis, diseñado para enrutar mensajes de error, trazas de pila y diagnósticos de compilador hacia tres etiquetas: lenguaje de programación, categoría de diagnóstico y severidad. Forma parte de una familia de tres variantes (Small, Medium y Large) que comparten el mismo pipeline basado en TF-IDF y clasificadores lineales de scikit-learn, pero con distinto presupuesto de características. Este modelo concreto, el Small, está pensado para integraciones en editores y máquinas con pocos recursos, ya que solo necesita 25 000 características y 2 425 097 parámetros lineales.

A diferencia de los grandes modelos de lenguaje, no genera explicaciones ni corrige código: su función es exclusivamente clasificatoria. Está entrenado sobre el dataset Magnexis/lexiconerror-diagnostics, que contiene 16 474 registros estructurados de diagnósticos reales. Su relevancia actual radica en ofrecer una alternativa determinista, rápida y ejecutable en CPU para sistemas de desarrollo que necesitan categorizar errores sin depender de servicios externos ni de modelos generativos pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF + clasificadores lineales (scikit-learn) |
| Parametros totales | 2 425 097 (lineales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de texto, no generativo) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (clasifica lenguajes de programacion, no idiomas naturales) |
| Licencia | other (revisar NOTICE del dataset) |
| Formato de pesos | joblib (pickle) |

## Arquitectura y entrenamiento

El modelo emplea un pipeline clásico de procesamiento de lenguaje natural: un vectorizador TF-IDF con 25 000 características (combinación de palabras y caracteres) alimenta a tres clasificadores lineales independientes, uno por cada cabeza de salida (lenguaje, categoría y severidad). No se trata de una red neuronal profunda ni de un transformer; es un enfoque de aprendizaje automático tradicional con regresión logística o similar, aunque el tipo exacto de clasificador no se especifica en la documentación.

El entrenamiento se realizó sobre el dataset Magnexis/lexiconerror-diagnostics, con 16 474 registros estructurados. Se aplicó una división determinista 80/20 agrupada por lenguaje, de modo que las etiquetas singulares o no vistas permanecen en el conjunto de entrenamiento. Los registros marcados como "Verified" reciben un peso de muestreo de 1.5x, mientras que los "Needs Review" se mantienen sin aprobar y no se presentan como verificados editorialmente. Los campos explícitos de lenguaje, categoría, severidad, herramienta y fuente se excluyeron de las entradas para evitar fugas de metadatos. El runtime utilizado fue scikit-learn 1.9.0 con Python 3.13.14, y la semilla aleatoria fue 42.

## Capacidades

- Clasificación del lenguaje de programación a partir de mensajes de error, trazas de pila o fragmentos de código cercanos al fallo.
- Clasificación de la categoría de diagnóstico (por ejemplo, errores de compilación, excepciones en tiempo de ejecución, fallos de memoria, etc.).
- Clasificación de la severidad del diagnóstico (probablemente niveles como error, advertencia o información, aunque no se detallan las etiquetas exactas).
- Funciona con entradas de texto cortas, como "error[E0382]: borrow of moved value" o "Traceback: KeyError: missing_key".
- Inferencia rápida y determinista, adecuada para entornos sin GPU.
- No genera texto, no ejecuta código, no ofrece explicaciones ni sugerencias de corrección.

## Casos de uso

- Integración en editores de código: el modelo puede clasificar el error mostrado al desarrollador y sugerir automáticamente la categoría y severidad, ayudando a priorizar la atención sin abrir documentación externa.
- Enrutamiento en sistemas de soporte técnico: al recibir un ticket con una traza de error, el modelo asigna lenguaje y categoría, permitiendo dirigir la incidencia al equipo especializado correspondiente.
- Análisis de logs en CI/CD: en pipelines de integración continua, el modelo puede etiquetar los fallos de compilación o ejecución para generar informes automáticos de tendencias por lenguaje o categoría.
- Filtrado de issues en repositorios: al clasificar los informes de error de los usuarios, se pueden agrupar por lenguaje y severidad para priorizar los más críticos.
- Asistente en entornos de desarrollo embebidos: por su bajo consumo de memoria, puede ejecutarse en dispositivos con recursos limitados, como Raspberry Pi o máquinas virtuales pequeñas, para clasificar errores en tiempo real.
- Preprocesamiento para otros sistemas: el resultado de la clasificación puede alimentar un sistema de recomendación de soluciones o un buscador de documentación, reduciendo el espacio de búsqueda.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre el conjunto de evaluación (3 285 registros, split 80/20):

| Cabeza | Accuracy | Macro F1 | Weighted F1 | Top-3 accuracy |
| --- | ---: | ---: | ---: | ---: |
| Language | 0.999 | 0.935 | 0.999 | 0.999 |
| Category | 0.970 | 0.790 | 0.970 | 0.998 |
| Severity | 0.989 | 0.793 | 0.989 | 1.000 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los valores de macro F1 son notablemente inferiores a los de accuracy, lo que sugiere un rendimiento desigual en clases poco frecuentes.

## Requisitos de hardware

- Inferencia en CPU: el modelo es extremadamente ligero, con solo 2.4 millones de parámetros lineales y un vectorizador TF-IDF de 25 000 características. El tamaño del archivo joblib es inferior a 100 MB (el repositorio ocupa 0.0 GB según HuggingFace).
- No requiere GPU: puede ejecutarse en cualquier procesador moderno, incluso en máquinas de gama baja o en entornos embebidos.
- Memoria RAM estimada: menos de 500 MB durante la carga y la inferencia, dependiendo del tamaño del vectorizador.
- Despliegue: se carga mediante joblib en Python; no es compatible con vLLM, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia: del orden de milisegundos por clasificación, al ser un pipeline lineal simple.

## Comparativa con modelos similares

Dentro de la misma familia LexiconError, se pueden comparar las tres variantes:

| Modelo | Características | Parámetros | Uso previsto |
| --- | ---: | ---: | --- |
| Small | 25 000 | 2 425 097 | Editores y máquinas con poca memoria |
| Medium | 100 000 | no disponible | Escritorio recomendado |
| Large | 250 000 | no disponible | Máxima retención de vocabulario |

No se dispone de información sobre modelos externos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Las plantillas derivadas de registros y las familias de diagnóstico repetidas pueden hacer que las puntuaciones en datos retenidos sean optimistas.
- Las etiquetas raras pueden tener un soporte de evaluación insuficiente para extraer conclusiones fiables por clase.
- Los valores de confianza son probabilidades del clasificador, no garantías de que el diagnóstico sea correcto.
- El modelo debe usarse para enrutar consultas dentro de LexiconError, no como sustituto de la documentación oficial del compilador, la revisión de seguridad ni la depuración humana.
- Los términos de los datos de origen varían; la licencia es "other" y se debe revisar el NOTICE del dataset antes de redistribuir el modelo o sus derivados.
- La carga de archivos joblib/pickle puede ejecutar código arbitrario; solo se debe cargar desde el repositorio oficial de Magnexis o tras verificar SHA256SUMS.txt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Magnexis/lexiconerror-router-small
- Dataset de entrenamiento: https://huggingface.co/datasets/Magnexis/lexiconerror-diagnostics
- Variante Medium: https://huggingface.co/Magnexis/lexiconerror-router-medium
- Variante Large: https://huggingface.co/Magnexis/lexiconerror-router-large
