# americansquid/Qwen3.5-0.8B-Proofreader-Light

## Resumen

Qwen3.5-0.8B-Proofreader-Light es un adaptador LoRA de corrección gramatical y de estilo (GEC, *grammatical error correction*) publicado por el usuario americansquid sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo completo, sino un delta de ajuste supervisado fino que continúa un adaptador anterior ya archivado en el propio repositorio (`c4-epoch1/`). El adaptador raíz corresponde a la segunda época sobre el subconjunto C4 GEC de 100.000 pares, y su uso requiere encadenar previamente otro adaptador intermedio (el antiguo "Grammarly") antes de cargarlo.

El modelo resuelve una tarea muy concreta: recibir texto con errores y devolver una versión corregida, en un formato conversacional. Con 772.845.888 parámetros declarados en los safetensors del repositorio y un tamaño de repositorio de 3,4 GB (que incluye checkpoints intermedios, tokenizador, registros de entrenamiento y cuantizaciones GGUF de la época 1), está pensado para entornos con recursos muy limitados: el propio entrenamiento se ejecutó en CPU con BF16 y 8 hilos de cómputo.

Su relevancia es doble. Por un lado, ejemplifica un flujo de trabajo poco habitual pero interesante: adaptadores apilados y continuados en lugar de un único fine-tuning, con la cadena de dependencias documentada explícitamente. Por otro, muestra que la corrección de texto se puede abordar con modelos sub-1B cuando el dominio está bien acotado. La información pública sobre licencia, idiomas soportados y benchmarks es, sin embargo, inexistente en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B; arquitectura interna del base no disponible |
| Parametros totales | 772.845.888 (dato real obtenido de los safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el entrenamiento uso una longitud maxima de secuencia de 384 tokens |
| Tipos de cuantizacion | Adaptador en safetensors; el archivo `c4-epoch1/` incluye GGUF en F16, Q8_0 y Q4_K_M (corresponden a la epoca 1, no a la continuacion) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y GGUF (solo para la epoca 1 archivada) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. La cadena de dependencias es estricta y viene descrita en la propia model card: el adaptador raíz es un delta continuado que exige cargar primero el modelo base Qwen/Qwen3.5-0.8B, aplicar despues el adaptador conservado en `grammarly-adapter/` mediante PEFT y ejecutar `merge_and_unload()`, y solo entonces cargar el adaptador raíz de este repositorio. El autor advierte explicitamente de que no debe aplicarse el adaptador raíz sobre un Qwen base sin modificar, ni volver a añadir el antiguo adaptador Proofreader, porque sus pesos fueron continuados en el sitio. El resultado final puede fusionarse para exportar un modelo autonomo.

El entrenamiento consistio en una unica epoca adicional de ajuste supervisado sobre el subconjunto local C4 GEC de 100.000 pares, recortado a 10.000 pares y dividido en 9.800 ejemplos de entrenamiento y 200 de validacion con semilla 42. Se realizaron 1.225 pasos de optimizador con tamano de lote 4, acumulacion de gradiente 2 (lote efectivo 8), tasa de aprendizaje maxima de 1e-6 con decaimiento coseno y 50 pasos de calentamiento. La longitud maxima de secuencia fue de 384 tokens, con perdida calculada solo sobre la respuesta y modo de razonamiento (*thinking*) desactivado. El entrenamiento se ejecuto en CPU con BF16, 8 hilos de computo y sin *gradient checkpointing*. La perdida final de validacion fue de 0.5334540605545044 y la perdida media de entrenamiento de 0.5155409774001763.

El repositorio conserva ademas `c4-epoch1/`, que preserva el repositorio original completo en la revision `a2487281dab218a3493867f91a772505e921d7aa`, con su adaptador final, checkpoints en los pasos 500, 1000 y 1225, tokenizador, registros de entrenamiento y las cuantizaciones GGUF fusionadas. El repositorio original `americansquid/Qwen3.5-0.8B-Proofreader` fue retirado tras verificar este archivo, y el repositorio Grammarly fue eliminado, conservandose solo dentro de este espacio.

## Capacidades

- Correccion gramatical y de estilo (GEC): reescritura de texto con errores ortograficos, gramaticales o de puntuacion hacia una version corregida.
- Generacion de texto en formato conversacional, segun la etiqueta `conversational` del repositorio.
- Respuesta en modo no-razonamiento: el entrenamiento se hizo con *thinking* desactivado, por lo que no se debe esperar una cadena de pensamiento explicita.
- Ajuste mediante LoRA, lo que permite fusionar el adaptador con el modelo base para obtener un modelo autonomo exportable.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta orientado a una tarea de correccion acotada.
- Capacidades multilingues: no disponible; no se especifica la composicion idiomatica del dataset C4 GEC, aunque por el nombre del corpus se asume procedencia C4.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Correccion de textos largos en lote: el modelo puede procesarse sobre parrafos o documentos completos, enviando cada fragmento como una peticion conversacional y recogiendo la version corregida; su tamano sub-1B permite ejecutarlo en CPU o en una GPU modesta para procesar miles de documentos.
- Preprocesado de corpus para entrenamiento: se puede pasar un corpus de texto en crudo por el modelo para normalizar errores tipograficos y gramaticales antes de usarlo en un pipeline de preentrenamiento o de extraccion de datos.
- Revision en herramientas de edicion: integrado como servicio local detras de un editor de texto o un corrector tipo plugin, devolviendo sugerencias de correccion sobre el fragmento seleccionado.
- Moderacion y limpieza de formularios: normalizacion de campos de texto libre enviados por usuarios (comentarios, descripciones, incidencias) antes de almacenarlos o analizarlos.
- Correccion de subtitulos y transcripciones automaticas: limpieza de salidas de ASR, donde los errores de puntuacion y concordancia son frecuentes, con un coste por token muy bajo.
- Generacion de pares (texto con errores, texto corregido) para aumentar datos: al ser un modelo pequeno y barato de ejecutar, puede emplearse en bucles de sintesis de ejemplos de entrenamiento para otros sistemas de correccion.
- Correccion en el borde (*edge*): al caber en cuantizaciones GGUF pequenas, es viable desplegarlo en equipos sin GPU dedicada o en dispositivos con memoria limitada, evitando enviar texto de usuarios a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica objetiva proporcionada por el autor es la perdida de validacion final (0,5334540605545044) y la perdida media de entrenamiento (0,5155409774001763) de la epoca 2, que no son comparables con metricas estandar de GEC como F0.5 o M2 sobre CoNLL-2014 ni con benchmarks de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no publicada por el autor): en FP16 unos 1,6 GB solo de pesos; en INT8 en torno a 0,8 GB; en Q4_K_M alrededor de 0,5 GB. Hay que sumar la cache KV, que con 384 tokens de secuencia es despreciable.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para FP16; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 irian sobradas. No se requiere GPU de centro de datos.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU. El propio autor entreno en CPU con BF16 y 8 hilos.
- Opciones de despliegue: PEFT y Transformers para cargar el adaptador y fusionarlo; llama.cpp y Ollama para las cuantizaciones GGUF (recordando que las GGUF incluidas corresponden a la epoca 1, no a la continuacion ligera); vLLM o TGI para servir el modelo fusionado si se necesita throughput alto.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No hay datos publicados de modelos comparables en la informacion disponible. La unica referencia factible es el propio modelo base, del que tampoco se aportan especificaciones mas alla del identificador.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-0.8B-Proofreader-Light | 772.845.888 (safetensors) | No disponible | No disponible | Repositorio HuggingFace, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | No disponible | No disponible | No disponible | No disponible |
| Alternativas de correccion gramatical de tamano similar | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Dependencia estricta de la cadena de adaptadores: cargar el adaptador raiz directamente sobre Qwen base produce un modelo incorrecto. Es obligatorio fusionar antes `grammarly-adapter/` y no volver a aplicar el adaptador de la epoca 1.
- Las cuantizaciones GGUF disponibles corresponden a la epoca 1, no a la continuacion ligera que da nombre al repositorio. Usarlas supone servir una version anterior del modelo.
- Las rutas absolutas locales incluidas en `training-config.yaml` deben adaptarse para reentrenar en otra maquina.
- Superficie de datos muy reducida: 10.000 pares de entrenamiento y 200 de validacion. La generalizacion a dominios, registros o idiomas distintos del corpus C4 GEC no esta verificada.
- Longitud de contexto de entrenamiento de solo 384 tokens. No hay evidencia de que el modelo mantenga calidad en entradas mas largas, aunque la ficha no declara limite de contexto.
- Riesgo de alucinacion: no evaluado. En tareas de reescritura, un modelo de este tamano puede introducir cambios de contenido no solicitados o "corregir" texto que ya era correcto.
- Sesgos conocidos: no documentados. Al derivar de un corpus tipo C4, es probable que herede los sesgos de ese origen, pero no hay analisis disponible.
- Licencia no especificada: no se puede confirmar la legalidad de un uso comercial. La ausencia de licencia explicita es un riesgo juridico relevante para produccion.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingue ni siquiera del castellano.
- Ausencia total de benchmarks publicos: no hay evidencia cuantitativa de calidad en GEC mas alla de la perdida de validacion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Estado de mantenimiento incierto: el autor retiro el repositorio original y el repositorio Grammarly, lo que indica reorganizacion del espacio y posibles enlaces historicos rotos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/americansquid/Qwen3.5-0.8B-Proofreader-Light
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/hafidikhsan/c4_200m-gec-train100k-test25k
- Revision archivada de la epoca 1: `a2487281dab218a3493867f91a772505e921d7aa` (conservada en `c4-epoch1/` dentro del repositorio)
- Repositorio original retirado: americansquid/Qwen3.5-0.8B-Proofreader (ya no disponible)
- Repositorio Grammarly original: eliminado, conservado como `grammarly-adapter/` dentro de este repositorio
- Paper, blog o demo adicionales: no disponibles
