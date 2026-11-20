# inclusionAI/LingSante-Pulse-1.0

## Resumen

LingSante-Pulse-1.0 es un codificador (encoder) de senales fisiologicas desarrollado por inclusionAI y publicado en Hugging Face bajo licencia MIT. A diferencia de los modelos de lenguaje generativos, su funcion es transformar series temporales biomedicas —como ECG, entre otras modalidades declaradas en el diseno de canales— en representaciones vectoriales densas utilizables por cabezales de prediccion especificos de cada tarea. El modelo tiene 16.708.352 parametros (unos 16,7 millones) y un repositorio de aproximadamente 0,1 GB en formato safetensors.

La relevancia del modelo reside en su enfoque de codificacion condicionada por canal: incorpora vectores fijos de identidad de canal generados con el modelo de texto BAAI/bge-small-en-v1.5, lo que permite al encoder saber que modalidad fisica (por ejemplo, ECG con derivacion II) esta procesando. La API devuelve representaciones CLS y PatchMean a nivel de parche de 0,25 segundos, con mascaras de validez para muestras observadas, lo que facilita su integracion en pipelines de extraccion de caracteristicas sobre senales con enmascaramiento o padding.

Es un componente de infraestructura mas que un modelo de uso final: no incluye cabezales de prediccion ni capacidades generativas. Se distribuye como pesos separados del paquete de codigo de inferencia (`lingsante_pulse`), que debe instalarse aparte. Su publicacion es reciente (noviembre de 2026) y el repositorio registra 0 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codificador de senales; detalles de capas no publicados en la model card) |
| Parametros totales | 16.708.352 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por ventanas de senal; el ejemplo usa 1280 muestras a 128 Hz) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision nativa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo de senales, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `channels.npz` y `channels.json` |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna (numero de capas, dimension oculta, tipo de bloque transformer o convolucional) ni los datos de entrenamiento (numero de tokens o muestras, composicion del corpus, uso de RLHF/DPO). Lo que si se documenta es la interfaz y el preprocesado: el codigo del paquete aplica un remuestreo fijo a 128 Hz, gestiona muestras observadas y mascaras de padding de almacenamiento, y acepta entradas con formas `[T]`, `[C,T]`, `[B,C,T]` o diccionarios de canales alineados.

La innovacion tecnica destacable es el condicionamiento por canal mediante vectores fijos. Estos vectores se generaron con BAAI/bge-small-en-v1.5 usando CLS pooling y normalizacion L2 sobre descripciones fisicas de cada canal; solo se distribuyen los vectores resultantes, no el codigo, pesos ni tokenizer del modelo de texto upstream. La salida incluye representaciones CLS y PatchMean (solo parches validos observados) concatenadas por canal en el orden de entrada, con forma `[B, C*256]`, y opcionalmente tokens ordenados por parche y mascaras de validez a intervalos de 0,25 s mediante `return_tokens=True`.

## Capacidades

- Extraccion de caracteristicas de senales fisiologicas: genera embeddings CLS y PatchMean por canal para alimentar cabezales de clasificacion, regresion o deteccion aguas abajo.
- Soporte multimodidad por canal: el diseno de canales permite declarar distintas modalidades fisiologicas (el ejemplo documenta ECG con derivacion II) mediante diccionarios de identidad fisica.
- Condicionamiento por identidad de canal: los vectores fijos derivados de descripciones textuales permiten al modelo distinguir canales aunque compartan forma de onda.
- Manejo de mascaras de validez: devuelve mascaras de parches observados, adecuado para senales con huecos, padding o longitud variable.
- Salida a nivel de parche: tokens ordenados a resolucion de 0,25 s para tareas que requieren localizacion temporal.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni comportamiento agentico.
- No incluye cabezales de prediccion especificos de tarea: el usuario debe anadirlos.

## Casos de uso

- Clasificacion de ritmo cardiaco: usar los embeddings CLS de ECG como entrada a un clasificador ligero (por ejemplo, regresion logistica o MLP) para deteccion de arritmias, aprovechando el condicionamiento por derivacion (lead II) y el preprocesado fijo a 128 Hz.
- Deteccion de eventos con localizacion temporal: emplear `return_tokens=True` para obtener caracteristicas por parche de 0,25 s y entrenar un cabezal secuencial que marque episodios (pausas, ectopias) en la senal.
- Preentrenamiento de pipelines biomedicos: congelar el encoder y entrenar solo cabezales especificos, reduciendo coste computacional frente a entrenar desde cero con 16,7 M de parametros.
- Procesamiento por lotes de registros heterogeneos: usar las mascaras de validez para manejar senales de duracion variable y canales ausentes en un mismo lote, util en datasets clinicos reales con datos incompletos.
- Busqueda y agrupamiento de senales: indexar los embeddings PatchMean para recuperar registros similares (por ejemplo, encontrar trazados parecidos a un patron de referencia) en bases de datos de senales.
- Investigacion en representaciones multimodales fisiologicas: comparar el condicionamiento por canal basado en texto (bge-small-en-v1.5) frente a alternativas one-hot o aprendidas en estudios de ablation.
- Integracion en pipelines de monitorizacion: extraer caracteristicas en streaming por ventanas de 1280 muestras (10 s a 128 Hz) para alimentar alertas o dashboards, dado el bajo coste del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 16,7 M de parametros en fp32 los pesos ocupan aproximadamente 67 MB, mas overhead de activaciones. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. Tambien es viable en CPU para lotes moderados.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: el uso previsto es el paquete Python `lingsante_pulse` con `LingSantePulse.from_pretrained()`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de codificacion de senales fisiologicas ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; solo representaciones vectoriales.
- No incluye cabezales de prediccion; cualquier tarea aguas abajo requiere entrenamiento adicional.
- La model card no documenta la arquitectura interna, el dataset de entrenamiento ni el proceso de validacion, lo que limita la evaluacion de sesgos y robustez.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si riesgo de representaciones poco informativas o erroneas en modalidades o derivaciones no representadas en los vectores de canal.
- El preprocesado esta fijado a 128 Hz; senales con otras frecuencias requieren remuestreo previo gestionado por el paquete de codigo.
- Dependencia de un paquete de inferencia separado (`lingsante_pulse`) que debe instalarse aparte; los pesos por si solos no son suficientes para usar el modelo.
- Los vectores de canal derivan de bge-small-en-v1.5, un modelo de texto en ingles; la cobertura semantica de descripciones de canales en otros idiomas no esta documentada.
- Licencia MIT: permite uso comercial y modificacion, pero no se documentan garantias ni validacion clinica. No debe usarse como dispositivo medico sin la regulacion correspondiente.
- Repositorio con 0 descargas y 1 like: ecosistema de validacion practicamente inexistente, lo que aumenta el riesgo en produccion.
- Idiomas soportados no disponibles: al ser un modelo de senales, la cuestion linguistica no aplica, pero tampoco se documenta el tratamiento de metadatos en distintos idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/LingSante-Pulse-1.0
- Modelo de referencia para los vectores de canal: https://huggingface.co/BAAI/bge-small-en-v1.5/tree/5c38ec7c405ec4b44b94cc5a9bb96e735b38267a
- Paquete de codigo de inferencia `lingsante_pulse`: no disponible (no se proporciona URL en la informacion)
- Paper, blog o demo: no disponibles en la informacion proporcionada
