# Januxes/FoMoFD-models

## Resumen

FoMo-FD (Failure Detection via Flow-Matching World Modeling) es una coleccion de checkpoints de PyTorch y LeRobot publicada por Januxes como material complementario del articulo "Failure Detection for Surgical Robot Imitation Policies via Flow-Matching World Modeling". No es un modelo de lenguaje: son pesos de robotica que implementan un world model basado en flow-matching (FM-WM) junto con VAEs visuales, estimadores de densidad (logpZO, RND) y politicas ACT de imitacion, orientados a detectar fallos en politicas de imitacion en entornos quirurgicos simulados.

El repositorio contiene, por tarea, un checkpoint principal FM-WM con configuracion K=4/L=4, VAEs visuales fijos y de muneca, estimadores logpZO y RND construidos sobre caracteristicas del VAE y nativas de ACT, y tres politicas ACT por tarea para reproduccion de politicas, ACE y AEU. El mismo FM-WM soporta las modalidades de puntuacion WM-NC, WM-PE y WM-PU. La seleccion de checkpoints sigue las configuraciones publicas del benchmark.

Es relevante ahora porque propone un enfoque de deteccion de fallos en politicas de imitacion robotica mediante modelado del mundo con flow-matching, un area con pocos artefactos reproducibles publicos. El repo ocupa 31,1 GB y depende de pesos upstream de Qwen y Cosmos que no se redistribuyen, por lo que su uso requiere descargar esos modelos por separado y respetar sus licencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (checkpoints PyTorch/LeRobot; incluye FM-WM flow-matching, VAEs visuales, logpZO, RND y politicas ACT) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoints `.pt` en precision de entrenamiento) |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | Apache-2.0 (con NOTICE; pesos upstream Qwen y Cosmos sujetos a sus propias licencias) |
| Formato de pesos | `.pt` (PyTorch), checkpoints LeRobot; no es Transformers AutoModel |

## Arquitectura y entrenamiento

La coleccion se organiza en torno a un world model de flow-matching (FM-WM) con configuracion K=4/L=4 por tarea, que se usa para puntuar trayectorias y detectar fallos mediante tres modos (WM-NC, WM-PE, WM-PU). Acompana a este un VAE visual fijo y otro de muneca, necesarios para la inferencia imagen-a-latente junto con las estadisticas latentes guardadas en el dataset. Los detectores logpZO y RND se construyen sobre caracteristicas del VAE y caracteristicas nativas de ACT.

Las politicas son ACT (Action Chunking Transformer) entrenadas con imitacion: se incluye el checkpoint original de 200.000 pasos mas los checkpoints `last/pretrained_model` de dos miembros del ensemble usados por AEU. Los checkpoints FM-WM, VAE visual, logpZO y RND corresponden a su `best.pt` configurado. Se excluyen ejecuciones historicas o de ablacion, checkpoints `last` duplicados, estado de entrenamiento solo de optimizador y caches de indices. Los `.pt` guardados no se han modificado y pueden contener entradas de optimizador y configuracion. No se especifican en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo RLHF/DPO.

## Capacidades

- Deteccion de fallos en politicas de imitacion robotica mediante puntuacion con un world model de flow-matching (WM-NC, WM-PE, WM-PU).
- Modelado del mundo visual con VAEs fijos y de muneca para codificar observaciones a latentes.
- Estimacion de densidad y novedad con logpZO y RND sobre caracteristicas del VAE y de ACT.
- Reproduccion de politicas ACT, incluyendo evaluacion ACE y AEU con ensemble de tres politicas por tarea.
- Soporte de replay de politicas para experimentos reproducibles.
- No soporta tool calling, function calling, agentes multi-paso ni generacion de texto: no es un modelo de lenguaje.
- Capacidades multilingues no aplicables; metadatos solo indican ingles.
- Capacidades especiales: world modeling con flow-matching aplicado a robotica quirurgica simulada.

## Casos de uso

- Deteccion de fallos en politicas de imitacion quirurgica: usar el FM-WM para puntuar trayectorias de una politica ACT y activar alertas cuando la puntuacion WM-NC/WM-PE/WM-PU indique desviacion, aprovechando que el mismo checkpoint soporta las tres modalidades.
- Reproduccion de experimentos del articulo: descargar los checkpoints por tarea (por ejemplo `fomofd/tasks/needle_pickup/**`) e instalar en un checkout limpio del repositorio FoMoFD para replicar resultados del benchmark publico.
- Evaluacion de ensembles de politicas: emplear las tres politicas ACT por tarea para calcular ACE y AEU y comparar la robustez de un ensemble frente a una politica unica.
- Investigacion en world models para robotica: reutilizar el FM-WM K=4/L=4 como base para experimentos de modelado predictivo en tareas de manipulacion quirurgica simulada.
- Desarrollo de detectores de novedad: combinar logpZO y RND con caracteristicas del VAE y de ACT para construir pipelines de deteccion de anomalias en ejecuciones roboticas.
- Validacion de pipelines imagen-a-latente: usar los VAEs visuales y las estadisticas latentes del dataset para probar la cadena de codificacion antes de desplegar un detector en simulacion.
- Formacion e investigacion academica: servir como material reproducible para cursos o trabajos sobre deteccion de fallos en politicas de imitacion, dado que el codigo y las configs son publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 31,1 GB, pero el reparto por checkpoint y la VRAM real dependen de la configuracion K=4/L=4 y de los pesos upstream de Qwen y Cosmos, no documentados aqui.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI; requiere el codigo publico de FoMoFD y LeRobot con PyTorch. Los pesos Qwen y Cosmos deben descargarse por separado de sus repositorios upstream.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de deteccion de fallos en politicas de imitacion robotica ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un Transformers AutoModel; no puede usarse con pipelines estandar de `transformers`.
- Requiere descargar por separado los pesos upstream de Qwen y Cosmos, sujetos a sus propias licencias y avisos; no se redistribuyen en este repo.
- Los checkpoints `.pt` pueden contener entradas de optimizador y configuracion, y las configs de entrenamiento guardadas conservan rutas historicas por trazabilidad; hay que usar las configs actuales del repositorio para ejecucion local.
- Para inferencia imagen-a-latente se necesitan checkpoints de VAE visual separados y las estadisticas latentes guardadas del dataset.
- Los modelos estan pensados para reproducir experimentos roboticos; el benchmark no establece idoneidad clinica.
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero el world model puede generar predicciones erroneas fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de idioma: metadatos solo indican ingles; no hay soporte multilingue declarado.
- Restricciones de licencia: Apache-2.0 con atribucion a los autores de FoMo-FD; revisar `LICENSE` y `NOTICE`, y las licencias upstream de Qwen y Cosmos para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria publica.

## Enlaces

- Hugging Face: https://huggingface.co/Januxes/FoMoFD-models
- Dataset: https://huggingface.co/datasets/Januxes/FoMoFD-datasets
- Codigo: https://github.com/JanusMaple/FoMoFD
- Web del proyecto: https://janusmaple.github.io/FoMoFD/
