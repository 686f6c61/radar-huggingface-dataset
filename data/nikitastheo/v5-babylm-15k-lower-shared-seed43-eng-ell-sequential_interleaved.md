# nikitastheo/v5-babylm-15k-lower-shared-seed43-eng-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v5-babylm-15k-lower-shared-seed43-eng-ell-sequential_interleaved` es un modelo de lenguaje causal de tipo GPT-2 entrenado por el usuario de HuggingFace nikitastheo con el script `train_clm.py` basado en Hugging Face Accelerate (sin usar la clase `Trainer`). Con 108.550.656 parametros reales (segun los pesos en safetensors) y un repositorio de 0,9 GB, se trata de un modelo pequeno orientado a investigacion, no a produccion. Su nombre indica que forma parte de una linea de experimentos sobre el corpus BabyLM con vocabulario reducido de 15.000 tokens y texto en minusculas.

El interes principal del modelo es metodologico: su configuracion incluye un "language switch epoch" en la epoca 10, lo que sugiere un entrenamiento curricular secuencial en el que primero se expone al modelo a un idioma (ingles, `eng`) y despues a otro (griego, `ell`) de forma intercalada (`sequential_interleaved`). El tokenizador asociado es `nikitastheo/babylm-15k-eng-lower-seed43-tokenizer`, tambien publicado por el mismo autor. El sufijo `seed43` apunta a que forma parte de una bateria de replicas con distintas semillas para medir varianza estadistica.

Es relevante ahora porque se alinea con la linea de investigacion de modelos con presupuesto de datos comparable al de un nino (BabyLM Challenge), donde el objetivo no es superar a los grandes modelos, sino entender que sesgos inductivos y que estrategias de entrenamiento permiten adquirir lenguaje con recursos limitados. El modelo no tiene licencia declarada ni idiomas declarados en su ficha, y no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (etiqueta `gpt2` en HuggingFace), configuracion base en `model_configs/gpt_base_config.json` (contenido no publicado) |
| Parametros totales | 108.550.656 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se han publicado pesos cuantizados; al ser safetensors en precision completa, es convertible a FP16, int8 y 4-bit con herramientas externas |
| Idiomas soportados | No declarados en la ficha; por nombre y configuracion de entrenamiento, ingles (`eng`) y griego (`ell`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La etiqueta de HuggingFace indica `gpt2`, por lo que se trata de un transformer decoder-only con atencion causal y embeddings de tokens, entrenado como modelo de lenguaje causal (`causal-lm`, `text-generation`). La configuracion base referenciada es `model_configs/gpt_base_config.json`, un fichero que no se incluye en la informacion proporcionada, de modo que el numero de capas, dimensiones ocultas, cabezas de atencion y longitud maxima de contexto no estan disponibles. Con 108,55 millones de parametros y un vocabulario de 15.000 tokens, el reparto de parametros entre embeddings y bloques transformer es sustancialmente distinto al de GPT-2 small (124 M con vocabulario de 50.257 tokens), ya que el vocabulario reducido libera presupuesto para las capas internas.

El entrenamiento se realizo con `train_clm.py`, un script propio basado en Hugging Face Accelerate en lugar del `Trainer` estandar, durante 26.530 pasos con learning rate 0,0001, scheduler lineal, 2.653 pasos de calentamiento, batch size de 32 por dispositivo y sin acumulacion de gradiente (batch total efectivo de 32). El dato mas relevante es el "language switch epoch: 10": el modelo se entrena primero con un idioma y a partir de un punto del entrenamiento se introduce el segundo, en regimen `sequential_interleaved`. No se especifica el numero total de epocas, el volumen de tokens ni la composicion exacta del dataset, aunque el prefijo `babylm-15k` remite al corpus del BabyLM Challenge. Tampoco hay informacion sobre RLHF, DPO u otras fases de alineamiento, lo que es coherente con un modelo de investigacion preentrenado.

## Capacidades

- Generacion de texto causal autoregresiva basica en ingles y previsiblemente en griego, dado el par de idiomas indicado en el nombre del modelo.
- Modelado de lenguaje a nivel de palabra subpalabra con un vocabulario reducido de 15.000 tokens y texto normalizado a minusculas.
- Capacidad multilingue limitada al par ingles-griego, sin que se haya declarado ni verificado el grado de competencia en cada uno.
- No hay evidencia de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia de razonamiento multi-paso entrenado, modo "thinking", vision, audio ni ninguna otra modalidad.
- No hay evidencia de ajuste por instrucciones; se trata de un modelo base, no de un modelo conversacional.
- No hay datos publicados sobre capacidades de generacion de codigo o matematicas.

## Casos de uso

- Investigacion en adquisicion del lenguaje con presupuesto reducido: el modelo sirve como punto de la curva en estudios tipo BabyLM, donde se comparan arquitecturas y volumenes de datos comparables a la exposicion linguistica infantil.
- Estudio de entrenamiento curricular multilingue: la configuracion `sequential_interleaved` con cambio de idioma en la epoca 10 permite analizar si la exposicion secuencial a ingles y griego mejora o degrada la perplexidad final en cada idioma respecto a un entrenamiento mezclado.
- Analisis de varianza entre semillas: al estar etiquetado con `seed43`, se integra en una bateria de replicas cuyo proposito es cuantificar la variabilidad de resultados entre inicializaciones, un problema metodologico habitual en modelos pequenos.
- Evaluacion de tokenizadores de vocabulario reducido: el tokenizador de 15.000 tokens asociado permite estudiar el compromiso entre tamano de embedding, cobertura linguistica y calidad de generacion en corpus limitados.
- Pruebas de destilacion y compresion: sus 108,55 millones de parametros lo convierten en un candidato manejable como modelo alumno o como referencia en experimentos de poda y cuantizacion.
- Generacion de texto de bajo coste en entornos docentes: permite ejecutar ejemplos de inferencia en un portatil o en una GPU de gama baja para clases y practicas de procesamiento de lenguaje natural.
- Reproducibilidad de experimentos: al publicarse los pesos en safetensors junto con los hiperparametros exactos de entrenamiento, sirve para replicar y auditar resultados de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplexidad, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y el repositorio no registra descargas ni likes que permitan inferir evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,43 GB solo para pesos, mas activaciones y cache KV.
- VRAM estimada en FP16/BF16: aproximadamente 0,22 GB de pesos; con contexto corto, cabe holgadamente por debajo de 1 GB.
- VRAM estimada en cuantizacion int8: aproximadamente 0,11 GB de pesos. En 4-bit, alrededor de 0,06 GB.
- Cabe en cualquier GPU de consumo actual, incluidas GTX 1050 Ti, RTX 3060, RTX 4090 o incluso en CPU, dada la magnitud del modelo.
- Despliegue con la libreria `transformers` de forma directa; la etiqueta `text-generation-inference` y `endpoints_compatible` indica compatibilidad con TGI y con los endpoints de HuggingFace.
- Compatible con vLLM para servicio con batching continuo, aunque su tamano hace que el beneficio sea marginal.
- Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| nikitastheo/v5-babylm-15k-lower-shared-seed43-eng-ell-sequential_interleaved | 108,55 M | No disponible | No disponible | HuggingFace, safetensors | No |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | Modified MIT | Ampliamente disponible | Si (evaluaciones originales) |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Ampliamente disponible | Si (evaluaciones originales) |
| Pythia-160M (EleutherAI) | 160 M | 2048 tokens | Apache 2.0 | HuggingFace | Si (suite completa publicada) |

La comparacion directa no es posible en terminos de rendimiento, ya que el modelo de nikitastheo no publica ninguna metrica. Frente a las alternativas, su rasgo diferencial es el vocabulario de 15.000 tokens con texto en minusculas y el regimen de entrenamiento bilingue secuencial, orientado a experimentos controlados y no a uso general. Los modelos GPT-2, DistilGPT-2 y Pythia cuentan con licencias explicitas y evaluaciones publicadas, lo que los hace preferibles para cualquier aplicacion practica.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso de uso comercial ni siquiera de redistribucion; conviene contactar con el autor antes de cualquier uso fuera de investigacion.
- Modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable y no debe usarse como asistente conversacional.
- Riesgo elevado de alucinacion y de degeneracion de texto, habitual en modelos de esta escala entrenados con corpus limitados.
- Sesgos desconocidos: el corpus BabyLM y la falta de filtrado documentado implican sesgos sociales, de genero y culturales no caracterizados.
- Sesgo de dominio: el entrenamiento en corpus de tipo infantil y con minusculas reduce el rendimiento en texto formal, con mayusculas, codigo o dominios especializados.
- Cobertura idiomatica restringida: solo constan indicios de ingles y griego; no hay evaluacion de competencia real en ninguno de los dos.
- Longitud de contexto no documentada: planificar cualquier uso con ventanas largas es arriesgado sin verificar previamente la configuracion.
- Trazabilidad limitada: se desconoce el numero de epocas, el volumen total de tokens y la composicion del dataset, lo que dificulta la interpretacion de resultados.
- Sin adopcion: cero descargas y cero likes implican ausencia de validacion por parte de la comunidad y de informes de errores.
- Fecha de creacion y actualizacion poco habitual (2026), dato a verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikitastheo/v5-babylm-15k-lower-shared-seed43-eng-ell-sequential_interleaved
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-15k-eng-lower-seed43-tokenizer
- Script de entrenamiento mencionado en la model card: `train_clm.py` (no se proporciona URL en la informacion disponible)
- Configuracion base mencionada: `model_configs/gpt_base_config.json` (no se proporciona URL ni contenido)
- Paper del BabyLM Challenge y repositorios relacionados: no disponibles en los resultados de busqueda
- Los resultados de busqueda web proporcionados no contienen ningun enlace relevante sobre este modelo: devuelven exclusivamente paginas en persa del Colegio de Ingenieros Agricolas de Iran, sin relacion con el modelo. Por tanto, no se incluyen.
