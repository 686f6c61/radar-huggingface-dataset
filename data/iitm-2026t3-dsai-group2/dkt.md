# IITM-2026T3-DSAI-GROUP2/dkt

## Resumen

DKT (Deep Knowledge Tracing) es un modelo de prediccion de dominio estudiantil desarrollado por el grupo IITM-2026T3-DSAI-GROUP2, publicado en Hugging Face bajo licencia MIT. No es un modelo de lenguaje generativo, sino un modelo de trazado de conocimiento que estima la probabilidad de que un estudiante responda correctamente a preguntas asociadas a distintas habilidades (skills) a partir de su historial secuencial de interacciones. Resuelve el problema del modelado del aprendizaje personalizado: dado un conjunto de respuestas pasadas, predice el nivel de maestria por habilidad para orientar intervenciones educativas.

La arquitectura es una red LSTM con capa de embedding (dimension 64), capa recurrente (dimension oculta 128) y capa totalmente conectada con activacion sigmoide que produce probabilidades por cada una de las 123 habilidades modeladas. La longitud maxima de secuencia es de 200 interacciones. El modelo se entrena con optimizador Adam (learning rate 0.001) durante 20 epocas usando Binary Cross Entropy with Logits como funcion de perdida.

Es relevante en el contexto de sistemas de tutoria inteligente y aprendizaje adaptativo: permite identificar areas debiles del estudiante y alimentar backends de recomendacion pedagogica (el autor menciona integracion con un backend de tutoria basado en FastAPI). El repositorio tiene un tamano de 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (embedding + LSTM + fully connected + sigmoide) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 200 interacciones (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (tamano del repo: 0.0 GB) |

Parametros de configuracion adicionales: 123 habilidades, dimension de embedding 64, dimension oculta 128, optimizador Adam, learning rate 0.001, 20 epocas de entrenamiento, funcion de perdida Binary Cross Entropy with Logits.

## Arquitectura y entrenamiento

El modelo sigue el esquema clasico de Deep Knowledge Tracing: una capa de embedding que convierte cada par (habilidad, respuesta) en una representacion densa de 64 dimensiones, una capa LSTM con 128 unidades ocultas que procesa la secuencia de interacciones del estudiante y captura dependencias temporales, una capa totalmente conectada que proyecta el estado oculto a las 123 habilidades y una activacion sigmoide que convierte las puntuaciones en probabilidades de acierto por habilidad. La secuencia de entrada se limita a 200 interacciones.

El entrenamiento emplea Adam con learning rate 0.001 durante 20 epocas y Binary Cross Entropy with Logits como objetivo, lo que es coherente con una tarea de clasificacion binaria por habilidad (acierto/fallo). La model card no especifica el numero de tokens ni la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a este tipo de modelo). Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal; la contribucion tecnica se limita a la aplicacion del esquema DKT con LSTM a un conjunto de 123 habilidades.

## Capacidades

- Prediccion de maestria por habilidad: estima la probabilidad de respuesta correcta para cada una de las 123 habilidades modeladas.
- Modelado secuencial del aprendizaje: procesa historiales de hasta 200 interacciones para capturar la evolucion del conocimiento del estudiante.
- Identificacion de areas debiles y fuertes: genera predicciones a nivel de habilidad con nombres legibles.
- Integracion con backend de tutoria: disenado para conectarse a un servicio FastAPI de tutoria.
- Soporte de personalizacion pedagogica: los resultados permiten priorizar contenidos y ejercicios segun el perfil estimado del estudiante.
- No soporta generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Sistemas de tutoria inteligente: el modelo consume el historial de respuestas de un estudiante y devuelve probabilidades de acierto por habilidad, que el backend FastAPI puede usar para decidir el siguiente ejercicio a recomendar.
- Deteccion temprana de estudiantes en riesgo: al estimar maestria por habilidad, permite identificar rapidamente que competencias presentan probabilidades bajas y priorizar intervenciones del profesorado.
- Recomendacion adaptativa de contenido: las predicciones por habilidad alimentan un motor de recomendacion que sugiere materiales o ejercicios centrados en las areas con menor probabilidad estimada.
- Paneles de progreso para docentes: el modelo puede generar, para cada estudiante, un perfil de maestria por habilidad que se visualice en dashboards de seguimiento academico.
- Evaluacion formativa automatizada: dado un conjunto de interacciones recientes, el modelo estima el dominio actual y permite generar informes de progreso sin necesidad de examenes adicionales.
- Investigacion en analitica del aprendizaje: sirve como linea base reproducible (licencia MIT, configuracion documentada) para comparar variantes de knowledge tracing en experimentos academicos.
- Planificacion de rutas de aprendizaje personalizadas: combinando las probabilidades por habilidad con un grafo de prerrequisitos, el modelo ayuda a ordenar las habilidades a reforzar segun su estado estimado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; con 123 habilidades, embedding de 64 y capa oculta de 128, el modelo es de muy pequeno tamano y previsiblemente puede ejecutarse en CPU, pero no se documentan cifras concretas.
- GPU recomendadas: no disponible; por la escala de la arquitectura no se requieren GPU de datacenter.
- Compatibilidad con GPU de consumo: no disponible, aunque por el tamano descrito no se espera que sea un requisito restrictivo.
- Opciones de despliegue: el autor menciona integracion con un backend FastAPI; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo LSTM de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Habilidades | Longitud de secuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DKT (IITM-2026T3-DSAI-GROUP2) | LSTM | 123 | 200 | MIT | Hugging Face (repo vacio, 0.0 GB) |
| DKT original (Piech et al., 2015) | LSTM | variable segun dataset | variable | no disponible | publicacion academica |
| SAKT (Pandey y Karypis, 2019) | Transformer | variable segun dataset | variable | no disponible | publicacion academica |

No se dispone de datos de rendimiento del modelo publicado que permitan una comparacion cuantitativa con alternativas; la comparativa se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- El repositorio tiene un tamano de 0.0 GB y no registra descargas: no hay evidencia de que los pesos esten efectivamente publicados; verificar antes de cualquier uso.
- La model card esta truncada ("## Model") y no documenta dataset de entrenamiento, procedencia de los datos ni metricas de validacion.
- El modelo esta restringido a 123 habilidades concretas; no generaliza a otras taxonomias sin reentrenamiento.
- La longitud de secuencia maxima es de 200 interacciones; historiales mas largos requieren truncado o segmentacion.
- Riesgo de sesgo: al entrenarse sobre datos de estudiantes, puede heredar sesgos demograficos o de comportamiento no documentados.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero las probabilidades predichas pueden ser erroneas si la distribucion de estudiantes en produccion difiere de la de entrenamiento.
- No se especifican los idiomas soportados ni la procedencia geografica de los datos.
- La licencia MIT permite uso comercial, pero no se ofrece ninguna garantia sobre el rendimiento ni sobre el cumplimiento de normativas de proteccion de datos (RGPD) en el tratamiento de datos de estudiantes.
- No hay informacion sobre calibracion de las probabilidades ni sobre intervalos de confianza.

## Enlaces

- Hugging Face: https://huggingface.co/IITM-2026T3-DSAI-GROUP2/dkt
- Paper original de Deep Knowledge Tracing (Piech et al., 2015): no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible
- Demo: no disponible
