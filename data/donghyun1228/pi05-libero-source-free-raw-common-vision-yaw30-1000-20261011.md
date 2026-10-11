# Donghyun1228/pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011

## Resumen

El modelo es un checkpoint de política robótica publicado por el usuario Donghyun1228 bajo el identificador `Donghyun1228/pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011`. Se distribuye con la librería `openpi` y está etiquetado como `robotics`, `libero` y `source-observation-free`, es decir, pertenece a la familia de políticas visomotoras (VLA) orientadas al benchmark de manipulación LIBERO y a experimentos de adaptación sin observaciones de la fuente. No es un modelo de lenguaje: es un artefacto de investigación pensado para ser cargado por un entorno de evaluación robótica, con un tamaño de repositorio de 6,1 GB.

Su relevancia es acotada y muy específica: documenta un estado de entrenamiento concreto (los parámetros `raw train-state` tras 1000 actualizaciones de un modelo de dinámica inversa, IDM, solo sobre el dominio objetivo) y sirve como material de trazabilidad para comparar pesos crudos frente a su versión EMA. El autor advierte explícitamente de que no hay evaluación de política asociada, de que no se usaron observaciones de origen, ni caché de profesor emparejado, ni rollouts exitosos, ni entrenamiento con retroalimentación de éxito.

Por tanto, el interés del modelo es metodológico y de reproducibilidad, no de producción: permite auditar diferencias numéricas entre pesos crudos y EMA y reutilizar los recursos de normalización conservados en el export.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se distribuye mediante la librería `openpi`; el repositorio corresponde a un checkpoint de política visomotora para robótica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se declara soporte de idiomas; las acciones del modelo son de control motor) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoint en estado de entrenamiento crudo, exportado con la librería `openpi`; el repositorio ocupa 6,1 GB) |

## Arquitectura y entrenamiento

El autor describe el artefacto como la exportación de los parámetros `raw train-state` tras 1000 actualizaciones de un IDM restringido al dominio objetivo (`target-only IDM updates`). No es el checkpoint EMA. Se informa de que los 51 nodos de exportación fueron reabiertos y verificados por hash contra la auditoría del estado crudo, y que los 28 nodos congelados coinciden con los pesos de origen auditados; las diferencias de peso en la parte de visión respecto al EMA quedan registradas en la auditoría numérica. Los recursos de normalización se conservan.

El propio autor explicita el alcance del entrenamiento: no se usó entrenamiento nuevo, ni observaciones de la fuente, ni caché de profesor emparejado, ni rollouts de tareas exitosas, ni entrenamiento con retroalimentación de éxito, y no hay corrección de acción ajustada (`fitted action correction`). La línea de entrenamiento y el hermano EMA corresponden al identificador `Donghyun1228/pi05-libero-source-free-common-vision-yaw30-1000-20261011` en el commit `ba4e597f09713a78691a30df5a72b8e42e3eaace`. El directorio de registros incluye el plan de entrenamiento, metadatos de generación, la auditoría numérica de la fuente, la comparación crudo/EMA y la procedencia del export. Se indica que debe usarse la misma configuración de modelo que ese plan de entrenamiento y que este es el checkpoint base de 51 nodos, antes de cualquier composición separada de muñeca de origen. Para la evaluación en LIBERO se debe mantener MuJoCo 3.2.3.

## Capacidades

- Ejecución de políticas de manipulación robótica en el marco de evaluación LIBERO, siempre que se cargue con la configuración del plan de entrenamiento indicado y con MuJoCo 3.2.3.
- Exportación y auditoría de pesos: el checkpoint permite reproducir la verificación por hash de los 51 nodos exportados y comprobar la coincidencia de los 28 nodos congelados con los pesos de origen auditados.
- Comparación crudo frente a EMA: sirve para medir la divergencia numérica de los pesos de visión entre el estado crudo y su hermano EMA.
- Conserva los recursos de normalización necesarios para la inferencia, lo que permite cargar el checkpoint sin reconstruir estadísticas de normalización.
- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión general, audio, tool calling, function calling, uso de agentes ni razonamiento multi-paso.
- No se declara soporte multilingüe; el repositorio no publica lista de idiomas.

## Casos de uso

- Reproducción de experimentos de adaptación sin observaciones de origen: el checkpoint representa el estado tras 1000 actualizaciones de un IDM solo sobre el dominio objetivo, por lo que sirve como punto de partida verificable para replicar ese régimen de entrenamiento sin depender de datos de la fuente.
- Auditoría de integridad de pesos: los 51 nodos exportados fueron reabiertos y verificados por hash, de modo que el modelo se puede emplear para validar la cadena de custodia de pesos en un pipeline de investigación interna.
- Comparación controlada crudo/EMA: al existir un hermano EMA con el mismo identificador y linaje (commit `ba4e597...`), este checkpoint permite aislar el efecto del promediado exponencial de pesos sobre la política, sin introducir otras variables de entrenamiento.
- Documentación de ablaciones para publicación: el directorio de registros incluye plan de entrenamiento, metadatos de generación y auditoría numérica, lo que facilita citar la procedencia exacta de cada peso en un artículo o informe técnico.
- Base para composiciones posteriores: el autor lo describe como el checkpoint base de 51 nodos previo a cualquier composición separada de muñeca de origen, por lo que encaja como punto de partida antes de construir variantes con esa composición.
- Evaluación en LIBERO con versiones fijadas: sirve para montar el banco de pruebas de manipulación con MuJoCo 3.2.3, siempre que se acepte que el propio autor no ha publicado todavía ninguna evaluación de política sobre este export.
- Verificación de la divergencia en la torre de visión: las diferencias de peso de visión respecto al EMA están registradas numéricamente, lo que permite estudiar si esa divergencia se concentra en capas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que el checkpoint no tiene todavía ninguna evaluación de política (`has no policy evaluation yet`) y advierte de que una pérdida de entrenamiento menor o unos pesos distintos no demuestran mayor éxito de la política. En consecuencia, no se presenta tabla de MMLU, HumanEval, GSM8K ni de tasas de éxito en LIBERO, porque no existen datos publicados en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El único dato de tamaño es el del repositorio, 6,1 GB, que puede incluir pesos y recursos auxiliares; no se especifica la precisión de almacenamiento ni el número de parámetros. Cualquier estimación de VRAM sería especulativa.
- GPU recomendadas: no disponible. El autor no publica requisitos de hardware ni GPU validadas.
- Compatibilidad con GPU de consumo: no confirmada. Un repositorio de 6,1 GB es manejable en términos de almacenamiento en muchas GPU de consumo, pero no hay confirmación de que la inferencia quepa en VRAM concreta.
- Opciones de despliegue: la librería declarada es `openpi`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además están orientadas a modelos de lenguaje y no a políticas robóticas.
- Entorno de evaluación: se debe usar MuJoCo 3.2.3 para la evaluación en LIBERO, según indica el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Donghyun1228/pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011` (este checkpoint, crudo no EMA) | no disponible | no disponible | sin evaluación de política publicada | no disponible | repositorio HuggingFace, 6,1 GB, 0 descargas y 0 likes |
| `Donghyun1228/pi05-libero-source-free-common-vision-yaw30-1000-20261011` (hermano EMA, commit `ba4e597...`) | no disponible | no disponible | sin evaluación de política publicada en la información disponible | no disponible | repositorio HuggingFace citado como línea de entrenamiento |
| Otros modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos de la misma categoría (políticas visomotoras para LIBERO con adaptación sin observaciones de origen) en el material proporcionado, por lo que la comparativa externa queda como no disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor afirma que no hay ninguna evaluación de política de este export. No debe presentarse como un modelo validado para ninguna tarea.
- Es el checkpoint crudo, no el EMA: emplearlo como sustituto del hermano EMA es un error metodológico, ya que los pesos no son los mismos.
- La pérdida de entrenamiento no es un indicador de éxito: la propia model card advierte de que una pérdida menor o unos pesos distintos no establecen mejor éxito de la política.
- Sin corrección de acción ajustada: no existe `fitted action correction`, lo que puede afectar al comportamiento en ejecución real.
- Entrenamiento limitado: no se usaron observaciones de origen, ni caché de profesor emparejado, ni rollouts exitosos, ni retroalimentación de éxito, lo que restringe el régimen de aprendizaje cubierto.
- Licencia no declarada: no hay licencia publicada, por lo que el uso comercial queda sin base legal explícita y debe considerarse no permitido hasta aclaración del autor.
- Idiomas no declarados: no hay lista de idiomas soportados.
- Dependencia estricta del entorno: se exige la misma configuración de modelo que el plan de entrenamiento y MuJoCo 3.2.3 para evaluar en LIBERO; otras versiones pueden invalidar la reproducibilidad.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo, y en un modelo de control motor el concepto aplica de forma distinta al de un modelo de lenguaje.
- Riesgo de alucinación: no aplica en el sentido textual; en cambio, existe riesgo de que la política ejecute acciones no válidas fuera de la distribución de entrenamiento, sin que haya datos publicados al respecto.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por terceros.
- Especificidad de configuración: el identificador incluye `yaw30` y `1000`, lo que sugiere una configuración concreta de rotación y un número fijo de actualizaciones; no hay información que permita generalizar a otras configuraciones.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011
- Repositorio hermano EMA citado en la model card: `Donghyun1228/pi05-libero-source-free-common-vision-yaw30-1000-20261011`
- Commit de linaje indicado por el autor: `ba4e597f09713a78691a30df5a72b8e42e3eaace`
- Directorio de registros del repositorio (plan de entrenamiento, metadatos de generación, auditoría numérica de la fuente, comparación crudo/EMA y procedencia del export): referenciado en la model card, sin URL directa publicada
- Resultados de busqueda web: no se encontraron enlaces técnicos relevantes. Las entradas recuperadas corresponden a sitios de contenido para adultos sin relación alguna con el modelo, por lo que se descartan y no se incluyen.
