# dotyerts/MiMo-V2.6-Flash-RL-UNCENSORED-oQ8e-mtp

## Resumen

MiMo-V2.6-Flash-RL-UNCENSORED-oQ8e-mtp es una cuantizacion comunitaria en 8 bits del modelo MiMo-V2.6-Flash-RL-UNCENSORED, publicada por el usuario dotyerts en Hugging Face. Se trata de un derivado de la familia MiMo (la familia de modelos abiertos de Xiaomi), identificado en la model card con el `model_type: mimo_v2` y sometido a un ajuste por refuerzo (RL) tras el cual se han eliminado las salvaguardas de contenido habituales, de ahi la etiqueta UNCENSORED. El repositorio ocupa 172,3 GB y los tensores safetensors declaran 309.766.601.088 parametros, es decir, unos 309,8 mil millones.

La cuantizacion se ha realizado con oQ (oMLX v0.7.0), una tecnica de cuantizacion de precision mixta orientada a MLX, en formato de 8 bits con `group size` 64 y pesos safetensors en formato MLX. El objetivo declarado es permitir la inferencia local de un modelo de gran escala en hardware Apple Silicon, que es el unico backend que consume de forma nativa este formato.

Su relevancia es doble. Por un lado, demuestra que las herramientas de cuantizacion de la comunidad permiten comprimir modelos de mas de 300.000 millones de parametros hasta un tamano desplegable en estaciones de trabajo con memoria unificada. Por otro, su caracter "uncensored" lo convierte en objeto de estudio para investigacion sobre comportamiento de rechazo, alineacion y seguridad en modelos abiertos. Ahora bien, el repositorio no publica licencia, idiomas, contexto ni resultados de benchmarks, acumula cero descargas y cero "likes", y tiene menos de media hora de diferencia entre su creacion y su ultima actualizacion, por lo que debe tratarse como un artefacto experimental sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia MiMo-V2 (`model_type: mimo_v2`); se desconoce si emplea mezcla de expertos (MoE) o atencion hibrida |
| Parametros totales | 309.766.601.088 (~309,8 B) segun los safetensors del repositorio |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits con `group size` 64, precision mixta oQ (oMLX v0.7.0); el nombre del repositorio indica la variante "oQ8e" |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |
| Tamano del repositorio | 172,3 GB |
| Etiquetas declaradas | mlx, safetensors, mimo_v2, oq, quantized, custom_code, 8-bit, region:us |
| Fecha de publicacion | 7 de octubre de 2026 (creacion y ultima actualizacion el mismo dia) |

Nota tecnica: el recuento de parametros procede del manifiesto de safetensors y, al tratarse de una cuantizacion en grupos de 64, incluye los tensores auxiliares de escalas y sesgos asociados a cada grupo. El numero de pesos del modelo sin cuantizar es, por tanto, ligeramente inferior a la cifra declarada, aunque la informacion proporcionada no permite determinarlo con exactitud.

## Arquitectura y entrenamiento

La model card unicamente declara el tipo de modelo (`mimo_v2`), la libreria (`mlx`) y los parametros de cuantizacion. No se especifica si la arquitectura es densa o de mezcla de expertos, ni el numero de capas, cabezas de atencion, dimension oculta o tipo de atencion (completa, lineal o hibrida). El sufijo "mtp" del nombre del repositorio apunta a la presencia de modulos de prediccion multi-token (multi-token prediction), un mecanismo habitual en arquitecturas recientes de gran escala que anade cabezas auxiliares para predecir varios tokens por paso, pero la model card no lo confirma y debe considerarse una inferencia a partir del nombre.

Respecto al entrenamiento, el sufijo "RL" indica que el modelo base fue sometido a un ajuste por refuerzo despues del preentrenamiento y, presumiblemente, de una fase de ajuste supervisado. La etiqueta "UNCENSORED" sugiere que ese ajuste por refuerzo se oriento a eliminar o reducir los rechazos del modelo, aunque no se documentan ni el algoritmo concreto (PPO, GRPO, DPO u otro), ni el volumen de datos, ni la composicion del dataset, ni el numero de tokens de preentrenamiento. La unica innovacion tecnica documentada es la propia cuantizacion: oQ aplica precision mixta sobre MLX con grupos de 64 elementos, una tecnica que asigna mayor precision a las capas sensibles y menor a las redundantes para reducir el impacto de la compresion sobre la calidad.

## Capacidades

- Generacion de texto en lenguaje natural: es la funcion base de cualquier modelo de lenguaje de esta escala; la model card no detalla tareas concretas ni dominios de especializacion.
- Razonamiento, matematicas y generacion de codigo: no disponible; no se documenta ningun benchmark ni evaluacion de estas capacidades.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas soportados.
- Vision, audio u otras modalidades: no disponible; las etiquetas del repositorio no incluyen ninguna modalidad adicional, por lo que cabe esperar un modelo exclusivamente de texto.
- Prediccion multi-token (MTP): el sufijo "mtp" del repositorio sugiere que el modelo conserva los modulos de prediccion multi-token del modelo base, lo que permitiria decodificacion especulativa interna, pero no se confirma en la model card.
- Comportamiento con filtros de contenido reducidos: el ajuste RL y la etiqueta "UNCENSORED" indican una menor tasa de rechazos ante peticiones que otros modelos rechazarian; no se cuantifica el grado de reduccion ni se especifica que categorias de contenido quedan afectadas.
- Ejecucion local en Apple Silicon: capacidad derivada del formato MLX, no del modelo en si.

## Casos de uso

- Inferencia local sin dependencia de la nube: el modelo puede ejecutarse en una estacion de trabajo Apple Silicon con memoria unificada suficiente (a partir de 192 GB, con holgura a partir de 256 GB), lo que permite procesar texto sensible sin que los datos salgan del equipo. Es adecuado para organizaciones con requisitos estrictos de confidencialidad.
- Investigacion sobre alineacion y comportamiento de rechazo: al ser un modelo explicitamente "uncensored", sirve como sujeto de comparacion frente a modelos alineados para estudiar como varia la tasa de rechazo, la utilidad percibida y la coherencia interna tras un ajuste por refuerzo sin salvaguardas. Uso legitimamente restringido a entornos controlados de evaluacion.
- Estudios de cuantizacion: permite medir la degradacion real de un modelo de ~300.000 millones de parametros al comprimirlo a 8 bits con grupos de 64, comparando sus respuestas con las del modelo sin cuantizar. Es un caso de uso metodologico, no de produccion.
- Generacion de ficcion y narrativa sin restricciones editoriales: escritores que trabajan con violencia explicita, lenguaje crudo o tematicas sensibles pueden emplearlo sin que el modelo interrumpa la generacion, a diferencia de los modelos con filtros activos.
- Simulacion de personajes y prototipado de agentes conversacionales: util para construir dialogos con personajes moralmente ambiguos en prototipos de videojuegos o experiencias interactivas, donde un modelo muy alineado tiende a homogeneizar las respuestas.
- Analisis de corpus historicos, legales o periodisticos con lenguaje sensible: el modelo puede resumir, clasificar o reescribir documentos que contienen terminologia conflictiva sin activar rechazos sistematicos, siempre que se valide la salida manualmente.
- Destilacion y ajuste posterior: al ser un artefacto cuantizado, puede servir como referencia para generar datos sinteticos o para estudiar tecnicas de destilacion hacia modelos mas pequenos, aunque se requeriria primero reconstruir o disponer del modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MATH ni equivalentes), y el repositorio no ofrece datos de latencia ni de throughput medidos. Tampoco se aportan comparaciones con el modelo sin cuantizar que permitan estimar la perdida de calidad introducida por la cuantizacion en 8 bits.

## Requisitos de hardware

- Memoria para los pesos: aproximadamente 172,3 GB en formato MLX de 8 bits con grupos de 64. A esta cifra hay que sumar la cache KV, los buffers de activaciones y el overhead del runtime, por lo que el requisito practico de memoria unificada se situa por encima de los 180 GB, y de forma comoda en los 256-512 GB.
- Equipos Apple Silicon compatibles: Mac Studio con M3 Ultra en configuracion de 512 GB es el escenario holgado. La configuracion de 256 GB permite cargar el modelo con ventanas de contexto reducidas. La configuracion de 192 GB (M2 Ultra) resulta muy justa y probablemente insuficiente en la practica una vez contabilizada la cache KV.
- GPU dedicadas de consumo: ninguna. Una RTX 4090 con 24 GB de VRAM no puede alojar el modelo ni siquiera parcialmente de forma util; harian falta al menos 8 GPU de 80 GB (por ejemplo, H100 o A100 80 GB) para aproximarse a los 640 GB agregados, siempre que se convirtieran los pesos a un formato soportado por el runtime.
- GPU de centro de datos: viable en configuraciones multi-GPU, pero exclusivamente tras convertir los pesos MLX a safetensors estandar, GGUF o un formato de cuantizacion compatible con vLLM o TGI. No se documenta ningun procedimiento de conversion en el repositorio.
- Opciones de despliegue nativas: `mlx-lm` y el ecosistema MLX para macOS. Ollama y LM Studio incorporan soporte MLX en macOS reciente, aunque no se verifica en la informacion disponible que reconozcan esta cuantizacion concreta. vLLM, TGI y llama.cpp no consumen safetensors MLX directamente.
- Latencia y throughput: no disponible como dato medido. A modo de estimacion teorica, con un ancho de banda de memoria de 819 GB/s (M3 Ultra) y 172,3 GB de pesos, el limite superior por ancho de banda se situa en torno a 4,7 tokens por segundo por usuario, antes de descontar la sobrecarga de atencion y del bucle de decodificacion. El rendimiento real sera inferior y depende de la longitud de contexto y del batch.
- Requisito de codigo remoto: la etiqueta `custom_code` indica que cargar el modelo puede requerir `trust_remote_code=True`, con el riesgo de seguridad que ello implica. Conviene auditar el codigo antes de ejecutarlo.

## Comparativa con modelos similares

La informacion disponible no permite comparar este modelo con alternativas de su misma categoria en terminos de rendimiento, ya que no hay benchmarks publicados. La siguiente tabla situa el modelo frente a otros modelos abiertos de escala comparable, que sirven unicamente como referencia de parametros, contexto y licencia:

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formatos publicados |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL-UNCENSORED-oQ8e-mtp | 309,8 B | no disponible | no disponible | no disponible | MLX safetensors 8-bit |
| Qwen3-235B-A22B | 235 B | 22 B | 128 K nativo, extensible con YaRN | Apache 2.0 | safetensors, GGUF, MLX |
| Llama 3.1 405B | 405 B | 405 B (denso) | 128 K | Llama 3.1 Community License | safetensors |
| DeepSeek-V3 | 671 B | 37 B | 128 K | DeepSeek Model License | safetensors |

La diferencia principal no esta en el rendimiento, que no puede evaluarse, sino en el formato y el ecosistema: las alternativas de la tabla se distribuyen en safetensors estandar y cuentan con conversiones a GGUF, AWQ y MLX mantenidas por la comunidad, mientras que este repositorio esta atado al formato MLX de 8 bits, sin licencia declarada y sin la validacion de uso que acompanha a los modelos citados. Para una comparacion directa con el modelo base MiMo-V2.6-Flash sin cuantizar, la informacion disponible es insuficiente.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia. Legalmente no puede asumirse permiso de uso comercial, modificacion ni redistribucion. Cualquier despliegue en produccion deberia precederse de aclaracion con el autor y de revision de la licencia del modelo base MiMo-V2.6-Flash.
- Modelo sin salvaguardas: la etiqueta "UNCENSORED" implica que el modelo ha sido ajustado para reducir los rechazos. Esto aumenta la probabilidad de generar contenido danino, ilegal o gravemente ofensivo, y lo inhabilita para aplicaciones de cara al publico sin una capa de moderacion adicional.
- Sin validacion de la comunidad: cero descargas y cero "likes" en el momento de la consulta. No hay terceros que hayan verificado la integridad del repositorio, la calidad de la cuantizacion ni la fidelidad al modelo original.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala y potencialmente agravado por la cuantizacion en 8 bits y por el ajuste RL, que puede priorizar la fluidez sobre la veracidad. No se aportan evaluaciones de factualidad.
- Idiomas no declarados: no se especifica la cobertura idiomatica. El rendimiento en castellano es desconocido y no puede asumirse equiparable al de modelos con cobertura multilingue documentada.
- Contexto desconocido: al no declararse la longitud de contexto, no puede planificarse el uso en tareas de documento largo, RAG o conversaciones multi-turno extensas.
- Degradacion por cuantizacion: los pesos estan comprimidos a 8 bits con grupos de 64. No se publica una comparacion con el modelo sin cuantizar, por lo que la perdida de calidad es desconocida.
- Dependencia de codigo remoto: la etiqueta `custom_code` obliga a ejecutar codigo del autor para cargar el modelo. Debe auditarse antes de usarlo en entornos con datos sensibles.
- Restriccion de plataforma: el formato MLX solo se consume de forma nativa en Apple Silicon. En Linux con GPU, el modelo es inutilizable sin un proceso de conversion no documentado.
- Requisito de memoria elevado: 172,3 GB de pesos excluyen cualquier equipo de consumo. No se publica una version en 4 bits que reduzca el umbral.
- Fecha de publicacion: el repositorio esta fechado en octubre de 2026 y fue creado y actualizado con 25 minutos de diferencia, lo que sugiere una publicacion sin ciclo de revision.
- Trazabilidad limitada del ajuste RL: no se documenta que datos, con que criterios ni con que criterios de seguridad se realizo el ajuste que elimina los filtros, lo que impide auditar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dotyerts/MiMo-V2.6-Flash-RL-UNCENSORED-oQ8e-mtp
- Repositorio de oQ / oMLX (herramienta de cuantizacion empleada): https://github.com/jundot/omlx
- Modelo base MiMo-V2.6-Flash: no disponible (no se enlaza en la model card)
- Modelo base MiMo-V2.6-Flash-RL-UNCENSORED: no disponible (no se enlaza en la model card)
- Paper, blog o demo asociados: no disponible
- Informacion adicional de busqueda web: no disponible (la ficha se ha elaborado exclusivamente con los datos del repositorio de Hugging Face y su model card)
