# firzahdzm/tourn-803a8f69-instructtext-hyper-s2cpre

## Resumen

El modelo firzahdzm/tourn-803a8f69-instructtext-hyper-s2cpre es un modelo de lenguaje publicado en HuggingFace por el usuario firzahdzm, con 1.170.340.608 parametros totales confirmados a partir de los pesos en formato safetensors y un repositorio de 2,3 GB (coherente con pesos en BF16/FP16). Se distribuye sin model card y sin pipeline declarado, por lo que la informacion publica disponible es minima.

El unico indicio sobre su arquitectura es la etiqueta "lfm2" incluida en los tags del repositorio, que apunta a la familia LFM2 (Liquid Foundation Models 2, arquitectura hibrida con capas convolucionales y de atencion desarrollada por Liquid AI). No obstante, esta etiqueta no viene acompanada de documentacion que la confirme, y el autor ha publicado otros repositorios bajo convenciones de nombre similares ("tourn-...-instructtext-...") con etiquetas distintas como "granite", lo que sugiere un pipeline interno de generacion o ajuste de modelos mas que una arquitectura homogenea.

El modelo resuelve tareas de generacion de texto de tipo instruct, segun se deduce del sufijo "instructtext" del identificador, pero no se ha publicado informacion sobre el proceso de entrenamiento, los datos utilizados, la longitud de contexto, los idiomas soportados ni la licencia. Su relevancia actual es limitada: 10 descargas y 0 likes en el momento de la consulta. Es un artefacto de investigacion o de uso interno mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta "lfm2" en los tags, sin confirmar) |
| Parametros totales | 1.170.340.608 (aprox. 1,17 B), confirmado en safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados presumiblemente en BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,3 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura, los datos de entrenamiento, el numero de tokens procesados ni las tecnicas de alineacion (RLHF, DPO u otras). El unico dato tecnico objetivo es el recuento de parametros (1.170.340.608) y el formato de los pesos (safetensors). El tag "lfm2" sugiere una arquitectura hibrida de la familia LFM2, que combina bloques convolucionales con capas de atencion para reducir el coste computacional en inferencia, pero no hay ninguna confirmacion en la model card ni en la informacion proporcionada.

El identificador del modelo incluye "instructtext", lo que indica que se trata de una variante ajustada para seguir instrucciones, si bien no se especifica la composicion del dataset de ajuste, el numero de epochs, la estrategia de tokenizacion ni la longitud de contexto de entrenamiento. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto en modo instruct: deducida del sufijo "instructtext" del identificador, sin documentacion adicional.
- No hay informacion publicada sobre soporte de tool calling o function calling.
- No hay informacion publicada sobre capacidades de agente o razonamiento multi-paso.
- No se especifican los idiomas soportados.
- No se documentan capacidades especiales (modo thinking, vision, audio, codigo o matematicas).

## Casos de uso

- Prototipado rapido en local: con 1,17 B de parametros y 2,3 GB de pesos, el modelo se puede cargar en una GPU de consumo para experimentar con generacion de texto instruct sin coste de API, siempre que se acepte la ausencia de garantias de calidad.
- Evaluacion comparativa interna: util como punto de referencia en experimentos que comparen variantes del mismo autor o de la misma familia de identificadores "tourn-...-instructtext-...".
- Pruebas de pipelines de despliegue: sirve para validar integraciones con vLLM, llama.cpp o TGI antes de pasar a un modelo mayor, aprovechando su bajo requisito de VRAM.
- Filtrado y clasificacion de texto en lote: si el ajuste instruct es minimamente funcional, puede emplearse para tareas de etiquetado simple en trabajos por lotes, aunque sin benchmarks que lo respalden.
- Educacion y aprendizaje: adecuado para estudiar como se estructura un repositorio safetensors y como se carga un modelo de ~1 B de parametros en frameworks habituales.
- Investigacion sobre tecnicas de ajuste: al ser un artefacto probablemente generado por un pipeline automatico, puede interesar a quien estudie la variabilidad y calidad de modelos derivados generados en masa.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ninguna aplicacion critica, al no existir documentacion, licencia ni evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: en torno a 2,3-3 GB solo para los pesos, mas el cache KV segun la longitud de contexto.
- VRAM estimada en cuantizacion INT8: aproximadamente 1,2-1,5 GB para los pesos.
- VRAM estimada en cuantizacion INT4 (si se generan pesos GGUF compatibles): en torno a 0,7-1 GB.
- GPU recomendadas: cualquier GPU de consumo moderna con 8 GB o mas, como RTX 3060, RTX 4060, RTX 4070 o superiores; tambien cabe en A100, H100 y L40S sin dificultad.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta con 4-8 GB de VRAM, y potencialmente en CPU con cuantizacion agresiva.
- Opciones de despliegue: no confirmadas por el autor; en principio cargable con transformers (safetensors), y potencialmente con llama.cpp/Ollama si se generan pesos GGUF, o con vLLM y TGI si la arquitectura subyacente esta soportada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con otros repositorios del mismo autor, no con modelos de referencia del mercado.

| Modelo | Parametros | Formato | Etiqueta | Licencia | Descargas/likes |
|---|---|---|---|---|---|
| firzahdzm/tourn-803a8f69-instructtext-hyper-s2cpre | 1,17 B | safetensors | lfm2 | no disponible | 10 / 0 |
| firzahdzm/tourn-803a8f69-instructtext-hyper-g2gcpre | 3 B (segun HuggingFace) | safetensors, BF16 | granite | no disponible | no disponible |
| firzahdzm/tourn-803a8f69-instructtext-hyper-g2gc | 3 B (segun HuggingFace) | safetensors, BF16 | granite | no disponible | no disponible |
| firzahdzm/tourn-87c51c39-instructtext-super-s2kpre | 494 M | no disponible | no disponible | no disponible | no disponible |

No hay datos de rendimiento que permitan comparaciones cuantitativas con alternativas de la misma categoria (por ejemplo, Qwen2.5-1.5B, Llama-3.2-1B o SmolLM2-1.7B), por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, sesgos, alineacion ni evaluaciones.
- Riesgo elevado de alucinacion y de respuestas incoherentes, al no existir evidencia publica de un proceso de alineacion (RLHF/DPO) ni benchmarks que lo validen.
- Licencia no declarada: no se puede asumir uso comercial permitido. Ante la ausencia de licencia explicita, el uso en produccion conlleva riesgo legal.
- Idiomas soportados desconocidos: no se puede garantizar un rendimiento correcto en castellano ni en ningun otro idioma.
- Longitud de contexto desconocida: imposible planificar casos de uso que dependan de ventanas largas.
- Arquitectura sin confirmar: la etiqueta "lfm2" podria no corresponder a la arquitectura real, lo que complicaria el soporte en frameworks de inferencia.
- Trazabilidad limitada: el autor publica multiples repositorios con identificadores aleatorios y etiquetas dispares, lo que dificulta saber si son variantes del mismo modelo o experimentos independientes.
- Huella de adopcion practicamente nula (10 descargas, 0 likes): sin comunidad que haya reportado problemas o validado el comportamiento.
- Para cualquier uso serio se recomienda sustituirlo por un modelo con model card completa, licencia clara y benchmarks publicados.

## Enlaces

- Repositorio principal: https://huggingface.co/firzahdzm/tourn-803a8f69-instructtext-hyper-s2cpre
- Repositorio relacionado (mismo autor, 3 B, tag granite): https://huggingface.co/firzahdzm/tourn-803a8f69-instructtext-hyper-g2gcpre
- Repositorio relacionado (mismo autor, 3 B, tag granite): https://huggingface.co/firzahdzm/tourn-803a8f69-instructtext-hyper-g2gc
- Pagina de despliegue en FriendliAI de una variante del mismo autor: https://friendli.ai/models/firzahdzm/tourn-803a8f69-instructtext-super-p1v
- Ficha de una variante de 494 M del mismo autor: https://savrn.com/models/tourn-87c51c39-instructtext-super-s2kpre
- Sin paper, blog tecnico ni repositorio de codigo asociados en la informacion disponible.
