# huggingface12341/zsm-d1

## Resumen

zsm-d1 es un modelo publicado en Hugging Face por el usuario huggingface12341 bajo licencia Apache 2.0. Se trata de un merge de dos modelos base: joamCriff123/zils-mini-m1121t y chinhnc/Quyet-1.0-Medium, y esta etiquetado con la arquitectura qwen3_5 segun los tags del repositorio. Con 4.539.265.536 parametros (aproximadamente 4,5 mil millones) y un peso de repositorio de 9,1 GB en safetensors, se situa en la franja de modelos medianos desplegables en hardware de consumo con cuantizacion.

El modelo esta declarado con pipeline de feature-extraction y la etiqueta decision-model, lo que sugiere un uso orientado a extraccion de representaciones y toma de decisiones mas que a generacion de texto conversacional pura. Incorpora la etiqueta zils y d3-mini, ademas de custom_code, lo que implica que requiere codigo personalizado para cargarse correctamente en transformers. El acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

Su relevancia actual es limitada pero concreta: se trata de un experimento de fusion de modelos (merge) con cero descargas y cero likes en el momento de la consulta, creado y actualizado el 23 de noviembre de 2026. Resulta util para quien quiera evaluar tecnicas de model merging sobre la familia Qwen 3.5 o explorar modelos de decision ligeros, pero no cuenta con documentacion publica de entrenamiento, benchmarks ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (segun tags del repositorio); transformer con codigo personalizado |
| Parametros totales | 4.539.265.536 (aprox. 4,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta qwen3_5 y la indicacion de custom_code, que obliga a usar `trust_remote_code=True` al cargar el modelo en transformers. Por los tags de modelo base, se trata de un merge de dos checkpoints: joamCriff123/zils-mini-m1121t y chinhnc/Quyet-1.0-Medium. No se especifica la tecnica de fusion empleada (SLERP, TIES, DARE, linear, etc.), ni la proporcion de mezcla, ni si hubo etapas posteriores de ajuste fino.

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT tras el merge. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Cualquier afirmacion sobre estos puntos seria especulativa y no debe asumirse.

## Capacidades

- Extraccion de caracteristicas (feature-extraction): es el pipeline declarado, por lo que el uso principal previsto es obtener embeddings o representaciones internas.
- Modelo de decision (decision-model): la etiqueta sugiere aplicaciones de clasificacion o seleccion entre opciones, aunque no se documenta el formato de entrada/salida.
- Generacion de texto: no confirmada explicitamente por el autor; debe validarse empiricamente antes de usarla en produccion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Extraccion de embeddings para busqueda semantica: al estar declarado como feature-extraction, puede emplearse para generar vectores de documentos y consultas en un motor de recuperacion; requiere validar la calidad de los embeddings con un conjunto propio antes de adoptarlo.
- Clasificacion y enrutamiento de peticiones: la etiqueta decision-model permite plantearlo como clasificador ligero (por ejemplo, enrutar tickets a departamentos) si se confirma su comportamiento en la tarea concreta.
- Experimentacion con model merging: util como caso de estudio para investigadores que quieran reproducir o analizar la fusion de zils-mini-m1121t y Quyet-1.0-Medium y comparar con los originales.
- Prototipado rapido en local: con 4,5 B de parametros y 9,1 GB en safetensors, cabe en GPUs de consumo con cuantizacion, lo que permite iterar en estaciones de trabajo sin infraestructura dedicada.
- Evaluacion comparativa interna: sirve como baseline adicional en suites de evaluacion propias frente a modelos de tamano similar de la familia Qwen.
- Filtrado o puntuacion de candidatos en pipelines de datos: si el modelo responde bien a tareas de ranking, puede integrarse como componente de scoring en la construccion de datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 9 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 12-16 GB para inferencia comoda.
- VRAM estimada en cuantizacion 8 bits: en torno a 5 GB de pesos, viable en GPUs de 8-10 GB.
- VRAM estimada en cuantizacion 4 bits: en torno a 3 GB de pesos, viable en GPUs de consumo de 6-8 GB (sujeto a que existan pesos cuantizados, que no se publican).
- GPU recomendadas: RTX 4090, RTX 3090, A10G, L4 para fp16; A100/H100 sobredimensionadas para este tamano salvo por lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en fp16, y en 8 GB con cuantizacion (previa conversion propia).
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por custom_code); vLLM, llama.cpp, Ollama y TGI solo si se generan los formatos correspondientes, ya que el repositorio solo distribuye safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zsm-d1 | 4,5 B | no disponible | Apache 2.0 | Gated en HF, 0 descargas | Merge de dos checkpoints, custom_code |
| Qwen2.5-3B / Qwen3-4B (referencia de familia) | 3-4 B | 32k+ (segun variante) | Apache 2.0 | Publico, ampliamente documentado | Base de la que deriva la arquitectura qwen3_5; benchmarks publicos |
| chinhnc/Quyet-1.0-Medium (modelo base) | no disponible | no disponible | no disponible | HF | Uno de los dos padres del merge |
| joamCriff123/zils-mini-m1121t (modelo base) | no disponible | no disponible | no disponible | HF | Uno de los dos padres del merge |

La comparacion con modelos de la familia Qwen es orientativa: comparten etiqueta de arquitectura, pero zsm-d1 no publica contexto, idiomas ni resultados, por lo que no es posible establecer una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card con datos de entrenamiento, evaluacion ni limitaciones declaradas por el autor.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a cualquier despliegue automatizado.
- Cero adopcion registrada: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad; no hay evidencia externa de su calidad.
- Riesgo de alucinacion: desconocido y no evaluado; al no haber benchmarks, no puede descartarse un comportamiento deficiente en generacion.
- Idiomas no declarados: no debe asumirse soporte de castellano ni de ningun otro idioma sin pruebas propias.
- Contexto desconocido: planificar el despliegue con una ventana conservadora hasta medirla empiricamente.
- Dependencia de custom_code: obliga a ejecutar codigo remoto (`trust_remote_code=True`), lo que supone un riesgo de seguridad en entornos de produccion; auditar el codigo antes de usarlo.
- Licencia Apache 2.0: permite uso comercial, pero al ser un merge de dos modelos base conviene verificar que las licencias de los padres sean compatibles.
- Sin pesos cuantizados publicados: habra que generarlos (GGUF, AWQ, GPTQ) para despliegue en hardware limitado, con el coste y la validacion que ello implica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsm-d1
- Modelo base 1: https://huggingface.co/joamCriff123/zils-mini-m1121t
- Modelo base 2: https://huggingface.co/chinhnc/Quyet-1.0-Medium
