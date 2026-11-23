# johnsonshi/Joey-1-Compact-Loop

## Resumen

Joey-1-Compact-Loop es una variante compacta e independiente de Joey-1, el modelo de decisión de 2B parámetros desarrollado por Base Labs en Baseten. A diferencia de un modelo generativo convencional, Joey-1 recibe un contexto, una pregunta y una lista cerrada de respuestas posibles, y devuelve una elección junto con una probabilidad para cada opción. Este modelo deriva de `baselabs/joey-1`, que a su vez es un ajuste fino de Qwen3.5-2B, y está publicado por el usuario johnsonshi.

La modificación consiste en eliminar físicamente cuatro capas del modelo original (las capas 12 a 15) y ejecutar dos veces el bloque de capas 8 a 11, de modo que se realizan 24 visitas de capa a partir de 20 capas almacenadas. El archivo de pesos resultante es un 8,4 % más pequeño que el original. Sobre 480 preguntas de enrutamiento no vistas, el modelo pasa de 229 aciertos sin el bucle a 328 con el bucle activado, recuperando parte de la precisión perdida por la poda, aunque queda 7,7 puntos por debajo del Joey-1 original.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de reutilización de capas (layer reuse) aplicada a un modelo de decisión; por otro, advierte de que el bucle no se activa con un cargador estándar, sino que requiere el script `run_joey.py` incluido en el repositorio. Se trata de un experimento de inferencia acotado, sin entrenamiento adicional, y el propio autor reconoce que la ganancia puede ser específica del tipo de tarea evaluada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-2B, con reutilización de capas (bloque 8-11 ejecutado dos veces) |
| Parametros totales | 2.492.923.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | mit-and-apache-2.0 (modificaciones de Baseten bajo MIT; obra Qwen subyacente bajo Apache-2.0) |
| Formato de pesos | safetensors (`model.safetensors`), más script de inferencia `run_joey.py` |

## Arquitectura y entrenamiento

El modelo parte de Joey-1 de Baseten, un ajuste fino de Qwen3.5-2B orientado a decisión y enrutamiento. La arquitectura es un transformer con atención, convolución y estado recurrente, según describe el autor al señalar que dichos componentes se reinician en las mismas posiciones de token en cada visita de capa. La variante compacta no introduce ningún entrenamiento nuevo: los pesos retenidos son copias exactas del checkpoint original, y las capas 12 a 15 se eliminan físicamente del archivo.

La innovación técnica es el orden de ejecución. Para una decisión, el modelo original ejecuta las capas `0-7 → 8-11 → 8-11 → 16-23`; el archivo compacto almacena 20 capas numeradas de forma consecutiva y ejecuta `0-7 → 8-11 → 8-11 → 12-19`, de modo que la capa 16 original corresponde a la 12 dentro del archivo reducido. La segunda visita del bloque 8-11 utiliza las activaciones producidas por la primera, no una estimación previa, y tras ella se pasa directamente a la capa de puntuación. El resultado son 24 visitas de capa con 20 capas almacenadas, sin añadir tokens ni duplicar pesos. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO para esta variante.

## Capacidades

- Toma de decisiones sobre listas cerradas: recibe contexto, pregunta y opciones, y devuelve `choice` y `probabilities`.
- Puntuación probabilística de cada opción, útil para umbrales y desambiguación.
- Enrutamiento y clasificación de intenciones: evaluado en el conjunto de entrenamiento de BANKING77 (512 ítems), donde los aciertos suben de 423 a 457 con el bucle activo.
- Razonamiento de tipo multi-paso implícito mediante la doble visita del bloque de capas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible como tal; el modelo actúa como componente de decisión dentro de un pipeline.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: bucle de reutilización de capas activable solo mediante `run_joey.py`; no se ha probado visión ni audio (el autor indica que solo probó decisiones de texto).

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y una lista de colas o equipos posibles y devuelve la elección con probabilidades, lo que permite derivar automáticamente o escalar cuando la confianza es baja. El propio autor incluye un ejemplo de ticket de soporte en el quickstart.
- Clasificación de intenciones en asistentes conversacionales: con opciones cerradas de intención, encaja en la fase de comprensión previa a la generación de respuesta, con la ventaja de que el resultado es una distribución de probabilidad explícita.
- Desambiguación en pipelines de agentes: dado un contexto y un conjunto de herramientas o acciones candidatas, el modelo puede puntuar cada una y servir como selector previo a la ejecución.
- Triaje de documentación o correo entrante: asignación de categorías predefinidas con umbral de confianza para revisión humana.
- Evaluación comparativa de arquitecturas: como banco de pruebas reproducible de la técnica de reutilización de capas frente al Joey-1 completo sobre el mismo conjunto de preguntas.
- Investigación sobre calibración: el modelo publica Brier score y expected calibration error, lo que lo hace útil para estudiar el efecto del bucle en la fiabilidad de las probabilidades, no solo en la precisión.
- Decisión sobre grafos o mapas pequeños: el escenario evaluado (elegir estación de origen dadas conexiones y destino) es representativo de problemas de planificación discreta de baja dimensionalidad.

## Benchmarks y rendimiento

| Configuración | Capas almacenadas | Visitas de capa | Aciertos | Precisión |
|---|---:|---:|---:|---:|
| Pesos compactos, bucle desactivado | 20 | 20 | 229/480 | 47,7 % |
| Joey-1-Compact-Loop (bucle activo) | 20 | 24 | 328/480 | 68,3 % |
| Joey-1 original (Baseten, una pasada) | 24 | 24 | 365/480 | 76,0 % |

- Conjunto de evaluación: 480 preguntas de enrutamiento no vistas, procedentes de 60 mapas nuevos.
- Ganancia del bucle: +20,6 puntos porcentuales (intervalo de confianza del 95 % emparejado: +16,9 a +24,6, con 2.000 remuestreos de mapas completos).
- Diferencia frente al Joey-1 original: −7,7 puntos porcentuales.
- Brier score: mejora de 0,6575 a 0,5412.
- Expected calibration error sobre la opción principal: empeora de 0,1088 a 0,2613.
- BANKING77 (split de entrenamiento, 512 ítems): de 423 a 457 aciertos de intención (comprobación de desarrollo, no test oficial).
- Tamaño del archivo de pesos: 4.985.916.160 bytes frente a 5.443.677.680 bytes del original (8,4 % menor).
- Tiempo de GPU: con 24 visitas de capa en ambos casos, el modelo compacto consumió un 3,4 % más de tiempo de GPU que el Joey-1 original ejecutado en etapas, medido sobre 2.304 entradas de desarrollo en dos A100, una entrada a la vez. Es tiempo de GPU, no latencia de servicio extremo a extremo.
- De las 146 rutas falladas en ambas configuraciones, el modelo con bucle asignó mayor probabilidad a la opción incorrecta en 74 casos.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2,49B parámetros en safetensors y un archivo de 5,0 GB, la carga en precisión nativa requiere del orden de 5 GB de VRAM más el estado de atención y las activaciones; en fp16 serían aproximadamente 5 GB de pesos.
- GPU recomendadas: el autor midió tiempos en A100; no se documentan otras GPU.
- GPU de consumo: no confirmado por el autor. Por tamaño, un archivo de 5 GB podría caber en tarjetas con 8 GB o más, pero no hay validación publicada.
- Opciones de despliegue: el modelo requiere `run_joey.py` con Linux y CUDA; un cargador estándar de transformers no activa el bucle. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Verificación en CPU: `python run_joey.py --verify-only` con Python 3.10 o superior.
- Latencia y throughput: solo se publica el dato comparativo de tiempo de GPU (+3,4 % frente al original en igual número de visitas de capa); no hay cifras de latencia extremo a extremo ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión en el conjunto de 480 preguntas | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Joey-1-Compact-Loop | 2,49B | no disponible | 68,3 % (328/480) | MIT + Apache-2.0 | Hugging Face, requiere `run_joey.py` |
| Joey-1 (Baseten) | 2B | no disponible | 76,0 % (365/480) | MIT + Apache-2.0 | Hugging Face |
| Joey-1-Compact-Loop con bucle desactivado | 2,49B | no disponible | 47,7 % (229/480) | MIT + Apache-2.0 | Misma release, configuración de comparación |

No se dispone de datos de otros modelos de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- El bucle de reutilización de capas no se activa con un cargador convencional; sin `run_joey.py` el modelo rinde como la configuración sin bucle (47,7 % frente a 68,3 %).
- La calibración de la opción principal empeora con el bucle: el expected calibration error sube de 0,1088 a 0,2613, por lo que las probabilidades no deben usarse como confianza fiable sin recalibración.
- El modelo sigue 7,7 puntos por debajo del Joey-1 original; la poda no se compensa por completo.
- La selección de capas a eliminar y repetir se hizo sobre mapas de práctica, por lo que la ganancia puede ser específica de ese tipo de problema y no generalizar.
- El experimento se realizó en unas siete horas tras la configuración, sin entrenamiento adicional; el alcance es reducido.
- Solo se probaron decisiones de texto; no hay validación de otras modalidades ni de otros dominios.
- Idioma limitado al inglés según la model card; no se documenta rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de elección errónea: de 146 rutas falladas en ambas configuraciones, 74 recibieron mayor probabilidad en la opción incorrecta.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Licencia: las modificaciones de Baseten son MIT y la obra Qwen subyacente Apache-2.0; es necesario conservar la licencia y el aviso de atribución incluidos en la descarga. El campo de licencia de Hugging Face figura como `other` con nombre `mit-and-apache-2.0`.
- Sin descargas ni likes en el momento de la consulta; el modelo no tiene validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/johnsonshi/Joey-1-Compact-Loop
- Archivos de la release: https://huggingface.co/johnsonshi/Joey-1-Compact-Loop/tree/main
- Modelo base Joey-1 de Baseten: https://huggingface.co/baselabs/joey-1
- Revisión concreta del Joey-1 referenciada: https://huggingface.co/baselabs/joey-1/tree/db5c2a631f2da93c4173378438d8246966e25159
- Licencia del modelo base: https://huggingface.co/baselabs/joey-1/blob/db5c2a631f2da93c4173378438d8246966e25159/LICENSE
- Aviso de atribución del modelo base: https://huggingface.co/baselabs/joey-1/blob/db5c2a631f2da93c4173378438d8246966e25159/NOTICE
- Instrucciones de uso en Linux/CUDA: `USAGE.md` dentro del repositorio del modelo
