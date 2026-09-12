# dougdotcon/douvras-enterprise-failure-classifier

## Resumen

El Douvras Enterprise Failure Classifier es un clasificador de texto publicado por el usuario dougdotcon en HuggingFace, pensado para el triaje de modos de fallo en trazas de asistentes empresariales. No es un modelo de lenguaje generativo ni una red neuronal: se trata de una implementación transparente de Multinomial Naive Bayes con unigramas y bigramas de palabras, sin dependencias externas y sin pesos procedentes de ningún LLM.

El modelo resuelve un problema acotado de evaluación: dada una tarea y la trayectoria observada de un asistente, asigna una etiqueta de fallo. Su interés práctico está en que es reproducible bit a bit (sin aleatoriedad, ejecutable en CPU con la biblioteca estándar de Python) y en que publica su vocabulario, recuentos, métricas y manifiesto de entrenamiento en un único fichero `model.json`, lo que facilita auditar el origen de cada decisión.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, está etiquetado únicamente para portugués (pt) y se distribuye bajo licencia Apache-2.0. El autor lo posiciona explícitamente como herramienta de triaje y explicación inicial, no como sustituto del grader determinístico ni de la revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multinomial Naive Bayes con unigramas y bigramas de palabras y suavizado de Laplace (no es una red neuronal) |
| Parametros totales | No disponible (el repositorio publica vocabulario y recuentos en `model.json`, no un recuento de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (no es un modelo autorregresivo; procesa la cadena de entrada tokenizada sin ventana de contexto) |
| Tipos de cuantizacion | No aplica (no hay pesos de red neuronal que cuantizar) |
| Idiomas soportados | Portugues (`pt`) |
| Licencia | Apache-2.0 para los archivos del repositorio; el dataset y los datos sinteticos mantienen CC BY 4.0 |
| Formato de pesos | `model.json` (vocabulario, recuentos, metricas y manifiesto de entrenamiento); no hay safetensors, GGUF ni PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un clasificador Multinomial Naive Bayes clásico con extracción de características de unigramas y bigramas de palabras y suavizado de Laplace. El proceso de entrenamiento es determinista: no hay inicialización aleatoria, no se usa GPU y las dependencias se limitan a la biblioteca estándar de Python. El artefacto resultante es `model.json`, que contiene el vocabulario, las tablas de recuentos, las métricas y el manifiesto de entrenamiento, lo que permite reproducir y auditar el ajuste sin infraestructura adicional.

Los datos de entrenamiento provienen exclusivamente del split `train` del dataset `dougdotcon/douvras-failure-atlas`, compuesto por ejemplos sintéticos y paramétricos. Según la model card, el conjunto de validación se usó únicamente para medir y el conjunto de test permaneció congelado. No se documenta en la información disponible el número de tokens, la composición detallada del corpus ni la existencia de fases de RLHF o DPO, algo que en cualquier caso no aplica a este tipo de algoritmo.

## Capacidades

- Clasificación de texto para triaje de modos de fallo en trayectorias de asistentes empresariales, a partir de una entrada con el formato `"Tarefa: ... Trajetória observada: ..."`.
- Asignación de una etiqueta de fallo con trazabilidad directa sobre el vocabulario y los recuentos almacenados en `model.json`.
- Funcionamiento determinista y reproducible: la misma entrada produce siempre la misma salida, sin muestreo estocástico.
- Ejecución en CPU con dependencias mínimas, adecuada para entornos restringidos o de integración continua.
- Uso como etapa de explicación inicial previa a un grader determinístico o a una revisión humana.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No genera texto, código ni respuestas conversacionales.
- Capacidad multilingüe: no disponible; el modelo está declarado solo para portugués.
- No dispone de modo de razonamiento (thinking mode), visión, audio ni ninguna otra modalidad.

## Casos de uso

- Triaje automático de trazas de asistentes empresariales: el clasificador recibe la tarea y la trayectoria observada y devuelve una etiqueta de fallo, lo que permite preclasificar grandes volúmenes de logs antes de que un revisor humano o un grader determinístico los evalúe.
- Preetiquetado en pipelines de anotación: al ser determinista y sin dependencias, puede generar una primera etiqueta sobre cada ejemplo de un conjunto de evaluación, reduciendo el coste de la anotación manual y dejando la decisión final al anotador.
- Integración en CI/CD para evaluación de LLM: el script `predict.py` puede ejecutarse como paso de un pipeline que compruebe si una nueva versión de un asistente introduce modos de fallo ya conocidos, con resultados reproducibles entre ejecuciones.
- Monitorización de calidad de asistentes en producción: al clasificar trayectorias por tipo de fallo, permite construir series temporales de incidencia por categoría y detectar picos anómalos sin desplegar GPU.
- Investigación reproducible sobre evaluación de LLM: al publicar vocabulario, recuentos y manifiesto de entrenamiento, sirve como línea base auditable contra la que comparar clasificadores más complejos en tareas de análisis de fallos.
- Despliegue en entornos sin GPU o con restricciones de red: al no requerir dependencias externas ni acceso a servicios, puede ejecutarse en máquinas de oficina, contenedores ligeros o dispositivos con recursos limitados.
- Filtrado y priorización de incidencias: las trayectorias clasificadas con determinados modos de fallo pueden enrutarse a los equipos responsables, usando el vocabulario del modelo para justificar la asignación.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los del split congelado del propio corpus:

| Split | Acurácia | Baseline mayoritario |
|---|---:|---:|
| validation (12) | 0,9167 | 0,2500 |
| test (24) | 1,0000 | 0,2500 |

El autor advierte explícitamente de que todos los ejemplos son sintéticos y paramétricos, por lo que estas cifras demuestran únicamente capacidad de reproducción sobre el corpus y no constituyen una estimación de rendimiento sobre tráfico real. No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes, ya que no es un modelo generativo).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna; no se ha publicado ningún requisito de aceleración por hardware.
- Compatibilidad con GPU de consumo: no aplica, al no existir componentes de red neuronal que cargar en memoria de vídeo.
- Memoria principal: no disponible en la información proporcionada; el consumo vendrá determinado por el tamaño del vocabulario y de las tablas de recuentos de `model.json`.
- Opciones de despliegue: ejecución directa mediante `python predict.py "Tarefa: ... Trajetória observada: ..."` con la biblioteca estándar de Python. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos alternativos de la misma categoría ni datos comparativos. Como referencia de contexto, este clasificador no es equiparable a los clasificadores basados en transformers: su naturaleza es un modelo Naive Bayes determinista sobre el que no se han publicado comparaciones frente a otras aproximaciones.

## Limitaciones y advertencias

- Los resultados de validación y test se obtienen sobre conjuntos muy pequeños (12 y 24 ejemplos) y completamente sintéticos, por lo que no son extrapolables a tráfico real.
- El autor indica expresamente que el clasificador debe usarse como triaje y explicación inicial; la decisión final corresponde a un grader determinístico o a una revisión humana.
- El modelo no ejecuta herramientas, no envía mensajes, no accede a datos externos y no autoriza acciones.
- Cobertura lingüística limitada al portugués; no se ha declarado soporte para otros idiomas.
- Al depender de un vocabulario cerrado de unigramas y bigramas, es sensible a variaciones léxicas, jerga o formatos de traza no vistos durante el entrenamiento; no se documenta el comportamiento fuera de la distribución del corpus sintético.
- El suavizado de Laplace y la asunción de independencia condicional entre características propias de Naive Bayes pueden producir estimaciones de probabilidad poco calibradas.
- No hay información publicada sobre sesgos específicos, más allá de los inherentes al corpus sintético del que procede el entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre; su riesgo equivalente es una clasificación errónea con apariencia de certeza.
- Licencia: los archivos originales del repositorio son Apache-2.0, pero el dataset y los datos sintéticos mantienen la licencia CC BY 4.0 declarada en el repositorio de dataset, lo que debe verificarse antes de un uso comercial o de redistribución.
- El repositorio registra 0 descargas y 0 likes, sin evidencias públicas de uso en producción ni de mantenimiento continuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougdotcon/douvras-enterprise-failure-classifier
- Dataset de entrenamiento citado en la model card: https://huggingface.co/datasets/dougdotcon/douvras-failure-atlas
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; las únicas URLs devueltas corresponden a páginas de inicio de sesión de Disney+ y no guardan relación con el modelo.
