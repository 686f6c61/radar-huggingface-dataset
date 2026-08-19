# LEAP-LAB-KUS/leap-kt-alignkt-2025-09

## Resumen

LEAP-LAB-KUS/leap-kt-alignkt-2025-09 es un modelo de knowledge tracing (seguimiento del conocimiento) basado en la arquitectura AlignKT, desarrollado por el LEAP Lab de la Universidad Tsinghua. Forma parte del toolkit `leap-kt`, una reimplementación sistemática de modelos publicados de knowledge tracing bajo un protocolo unificado. El modelo predice la probabilidad de que un estudiante responda correctamente a una pregunta, modelando explícitamente el estado de conocimiento del alumno mediante un mecanismo de alineación con un estado ideal.

El modelo está entrenado sobre el dataset `dbe_kt22` y publicado con licencia MIT. El repositorio contiene los pesos en formato safetensors (0.2 GB) junto con los registros de entrenamiento por época, la división exacta de usuarios y los resultados de validación para cada fold. Su relevancia radica en que aborda un problema común en la reproducción de modelos de knowledge tracing: la fuga de información por expansión de preguntas multi-concepto, que infla artificialmente las métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AlignKT (frontend-to-backend con atención, basada en transformers) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (dataset educativo, probablemente inglés, no confirmado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AlignKT emplea una arquitectura frontend-to-backend que modela explícitamente el estado de conocimiento del estudiante. La parte frontal genera un estado de conocimiento preliminar a partir de las interacciones del alumno, mientras que la parte trasera alinea ese estado preliminar con un "estado ideal" de referencia, lo que mejora la interpretabilidad y el soporte instruccional en sistemas de tutoría inteligente. El modelo utiliza mecanismos de atención para capturar relaciones entre conceptos.

El entrenamiento sigue un protocolo estricto definido en el toolkit `leap-kt`: división de usuarios 80/20 para entrenamiento/prueba, validación cruzada de 5 pliegues sobre la porción de entrenamiento, early stopping con paciencia 10 basado en AUC de validación y máximo 200 épocas. El dataset utilizado es `dbe_kt22`. Una característica clave del protocolo es que las preguntas multi-concepto no se expanden en múltiples filas, evitando así la fuga de información que afecta a otras implementaciones. El modelo se entrenó en el commit `e3a8dc3` del toolkit.

## Capacidades

- Predicción de la probabilidad de respuesta correcta del estudiante ante una pregunta (knowledge tracing).
- Modelado explícito del estado de conocimiento del alumno, con alineación a un estado ideal para mejorar la interpretabilidad.
- Manejo de interacciones con múltiples conceptos sin expandir filas, evitando fugas de datos.
- Soporte para evaluación rigurosa con métricas AUC, exactitud y F1, con control de fugas mediante auditoría (disyunción de usuarios, no cruce de ventanas, puntuación única por interacción y control de etiquetas barajadas).
- Reproducibilidad completa: cada pliegue incluye configuración, pesos, registros por época y partición de usuarios con checksum.

## Casos de uso

- Sistemas de tutoría inteligente: el modelo puede integrarse en plataformas educativas para predecir en tiempo real si un estudiante dominará un concepto, permitiendo adaptar el ritmo y contenido de las lecciones.
- Evaluación adaptativa: en exámenes computerizados, el modelo puede seleccionar la siguiente pregunta más informativa en función del estado de conocimiento estimado del alumno.
- Detección de estudiantes en riesgo: analizando secuencias de interacciones, el modelo identifica patrones de bajo dominio que permiten intervenir tempranamente con refuerzo adicional.
- Análisis de materiales didácticos: los pesos de atención entre conceptos pueden revelar qué relaciones entre temas son más problemáticas para los estudiantes, guiando el diseño curricular.
- Investigación en minería de datos educativos: el repositorio sirve como punto de partida para reproducir y comparar modelos de knowledge tracing bajo un protocolo estandarizado.
- Generación de informes de progreso: el estado de conocimiento explícito puede traducirse en visualizaciones para profesores y padres, mostrando fortalezas y debilidades por concepto.

## Benchmarks y rendimiento

El README del modelo reporta los siguientes resultados en el dataset `dbe_kt22`:

| Dataset | AUC | ACC | F1 | Referencia publicada | Delta |
|---|---|---|---|---|---|
| `dbe_kt22` | 0.8049 ± 0.0006 | 0.7928 | 0.8696 | — | — |

No se proporcionan comparaciones con otros modelos en la información disponible. Los valores por pliegue están en `summary.json` de cada dataset. El protocolo incluye una auditoría de fugas para celdas con referencia publicada, y el control de etiquetas barajadas debe colapsar el AUC al azar.

## Requisitos de hardware

- Tamaño del repositorio: 0.2 GB, lo que sugiere un modelo pequeño (del orden de decenas de millones de parámetros, aunque no se confirma).
- Inferencia en CPU: factible dada la baja carga de memoria; no se requieren GPUs para ejecutar el modelo en producción.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM sería suficiente, aunque no se han publicado requisitos específicos.
- Despliegue: el modelo se distribuye como safetensors y se carga mediante la librería `leap-kt`; no se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de knowledge tracing (p. ej., DKT, DKVMN, AKT) en la información proporcionada. El propio repositorio `leap-kt` incluye otras implementaciones (como `leap-kt-dkvmn`), pero no se ofrecen métricas cruzadas en esta ficha. Se recomienda consultar el toolkit para comparaciones bajo el mismo protocolo.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre `dbe_kt22`; su rendimiento en otros datasets o dominios no está garantizado y requeriría reentrenamiento o fine-tuning.
- No se han publicado detalles sobre sesgos demográficos o lingüísticos; al ser un modelo educativo, podría reflejar sesgos presentes en los datos de interacción de los estudiantes.
- La interpretabilidad del "estado ideal" depende de la definición del criterio de alineación; puede no ser directamente accionable en todos los escenarios pedagógicos.
- El protocolo evita la expansión de preguntas multi-concepto, lo que puede diferir de otras implementaciones y dificultar la comparación directa con resultados publicados que sí expanden.
- Aunque la licencia MIT permite uso comercial, no se proporciona garantía de precisión o idoneidad para entornos de producción educativa sin validación adicional.
- No se especifican requisitos de contexto o límites de secuencia; para secuencias muy largas de interacción podría degradarse el rendimiento, aunque no hay datos al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LEAP-LAB-KUS/leap-kt-alignkt-2025-09
- Toolkit leap-kt: https://github.com/LEAP-LAB-KUS/leap-kt-toolkit
- Paper de AlignKT (arXiv): https://arxiv.org/html/2509.11135
- Resumen del paper en ADS: https://ui.adsabs.harvard.edu/abs/2025arXiv250911135X/abstract
- Página del LEAP Lab: https://www.leaplab.ai/
