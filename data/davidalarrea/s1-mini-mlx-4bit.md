# davidalarrea/S1-mini-MLX-4bit

## Resumen

S1-mini es un modelo de lenguaje causal de 596 millones de parametros (0,44B sin contar embeddings) desarrollado por Superwhisper y especializado en una unica tarea: normalizar texto procedente de sistemas de reconocimiento automatico del habla (ASR). Recibe una transcripcion cruda —habitualmente en minusculas, sin puntuacion y con muletillas— y devuelve texto escrito limpio: elimina rellenos, resuelve falsos arranques y autocorrecciones, aplica puntuacion y mayusculas, y convierte numeros, fechas, horas, divisas y direcciones de correo a su forma escrita. Esta fine-tuneado a partir de Qwen/Qwen3-0.6B y se controla mediante una linea de control al inicio de la entrada, no mediante instrucciones conversacionales.

El repositorio analizado, davidalarrea/S1-mini-MLX-4bit, no es el modelo original: es una conversion no oficial a MLX affine 4-bit (group size 64) realizada con mlx-lm 0.31.3 sobre los pesos BF16 de superwhisper/s1-mini. Conserva tokenizer, plantilla de chat, configuracion de generacion y licencia del modelo base. El peso cuantizado ocupa 462 MiB y, segun la model card, se ejecuta comodamente en la CPU de un portatil, lo que lo hace atractivo para post-procesado local de dictado sin depender de la nube.

Su relevancia practica esta en el nicho: frente a modelos generativos generalistas, aqui se prioriza precision determinista en una transformacion acotada, con una exactitud declarada de token del 94,8% sobre un conjunto de 7.519 casos en ingles. La contrapartida es que solo cubre ingles, no sigue instrucciones generales y no debe tratarse como un chatbot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia Qwen3), 28 capas, GQA con 16 cabezas de consulta y 8 de clave/valor |
| Parametros totales | 596.049.920 (0,596B); 0,44B sin embeddings; embeddings atados |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la model card recomienda entradas de hasta aproximadamente 1.000 tokens y trocear transcripciones mas largas |
| Tipos de cuantizacion | Este repositorio: MLX affine 4-bit con group size de 64. Existen builds GGUF en superwhisper/s1-mini-GGUF (niveles concretos no disponibles) |
| Idiomas soportados | Ingles (en) |
| Licencia | En el Hub figura como "other" con license_name "s1-mini-license"; la model card la describe como Apache 2.0 con clausula de nombramiento |
| Formato de pesos | safetensors en formato MLX (repositorio de 0,3 GB; fichero cuantizado de 462 MiB) |
| Parametros duplicados en safetensors | 751,6M elementos tensoriales frente a 596,0M parametros unicos, porque lm_head.weight se almacena como copia materializada del embedding de entrada |
| Precision original | BF16 |
| Libreria | mlx (mlx-lm 0.31.3) |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-0.6B: un transformer causal decoder-only de 28 capas con atencion por consultas agrupadas (GQA), 16 cabezas de consulta y 8 de clave/valor, y embeddings de entrada y salida atados. El modelo base se distribuye en BF16; esta variante aplica cuantizacion afín de 4 bits con tamano de grupo 64 sobre esos pesos, manteniendo intactos el tokenizer, la plantilla de chat y la configuracion de generacion del modelo original.

El ajuste fino convierte un modelo de proposito general en un transformador de texto especializado: la entrada es el prompt de sistema, una linea de control entre corchetes (por ejemplo "[Styling: semi-formal] [Structure: prose] [Context: general]") y, en la linea siguiente, una unica transcripcion ASR cruda; la salida es exclusivamente el texto limpio, sin preambulo ni explicacion. Cuando la entrada es solo ruido o muletillas, la salida correcta es una cadena vacia. No hay informacion disponible en la documentacion proporcionada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La model card menciona una evaluacion upstream de 7.519 casos, que no se ha reproducido para esta conversion cuantizada.

## Capacidades

- Normalizacion de transcripciones ASR: eliminacion de muletillas, resolucion de falsos arranques y autocorrecciones hacia el valor final que el hablante eligio.
- Puntuacion y truecasing: aplicacion de mayusculas, comas, puntos y estructura oracional sobre texto sin formato.
- Normalizacion inversa de texto: renderizado escrito de numeros hablados, fechas, horas, divisas y direcciones de correo electronico.
- Control de estilo y estructura mediante linea de control al inicio de la entrada (styling, structure y context).
- Salida en prosa, en listas con vinietas Markdown (bajo "Structure: lists") o con estructura de correo electronico con lineas en blanco entre saludo, cuerpo y despedida (bajo "Context: email").
- Devolucion de cadena vacia ante entradas compuestas unicamente de relleno o ruido.
- No soporta tool calling ni function calling segun la informacion disponible.
- No esta disenado para agentes ni razonamiento multi-paso: es una transformacion de un solo paso.
- Capacidades multilingues: solo ingles.
- No dispone de modo de razonamiento explicito; el ejemplo de uso desactiva el thinking del template (enable_thinking=False).

## Casos de uso

- Post-procesado de dictado en aplicaciones de voz: tras el ASR, el modelo recibe la transcripcion cruda y devuelve texto listo para insertar en un editor, con puntuacion y mayusculas correctas, sin salir del dispositivo.
- Limpieza de transcripciones de reuniones y entrevistas: se trocea la transcripcion en segmentos de hasta aproximadamente 1.000 tokens, se normaliza cada uno y se recompone el documento final con estructura en prosa.
- Redaccion de correos por voz: usando "[Context: email]" en la linea de control, la salida incorpora saltos entre saludo, cuerpo y despedida, reduciendo el trabajo de edicion posterior.
- Conversion de notas dictadas en listas de tareas: con "[Structure: lists]" el modelo emite vinietas Markdown, util para volcar notas de voz en gestores de tareas o wikis.
- Normalizacion por lotes de corpus ASR para entrenamiento: al ocupar 462 MiB en 4 bits y funcionar en CPU, permite limpiar grandes volumenes de transcripciones en infraestructura modesta antes de usarlas como datos de entrenamiento.
- Accesibilidad y subtitulado: integrado en un pipeline de reconocimiento de voz, mejora la legibilidad de subtitulos en vivo corrigiendo truecasing y puntuacion.
- Aplicaciones macOS nativas con MLX: al estar en formato MLX, encaja en apps de escritorio para Apple Silicon que necesiten procesado local sin conexion.
- Asistentes de documentacion clinica o legal por dictado: aplicable como paso de limpieza previo a la revision humana, siempre que la licencia y la normativa sectorial lo permitan y asumiendo riesgo de omisiones.

## Benchmarks y rendimiento

| Evaluacion | Conjunto | Resultado |
|---|---|---|
| Exactitud de token | 7.519 casos retenidos en ingles (evaluacion upstream) | 94,8% |
| Comprobacion de cordura determinista de esta conversion | 6 casos | 3 coincidencias exactas con las cadenas de referencia upstream |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Las diferencias observadas en la comprobacion de 6 casos incluyeron un "So," inicial retenido, variacion en puntuacion y ordinales, y la omision de "tomorrow" en un caso de correccion. La propia model card advierte que es una comprobacion funcional pequena y no la evaluacion upstream de 7.519 casos.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: el fichero de pesos cuantizado ocupa 462 MiB; con overhead de runtime y cache KV, el consumo realista se situa en torno a 0,6-1 GB (estimacion, no dato publicado).
- GPU recomendadas: no hay recomendaciones publicadas. Para MLX, el entorno natural es Apple Silicon (M1/M2/M3/M4 con memoria unificada). Para GPU NVIDIA, el modelo base dispone de builds GGUF en superwhisper/s1-mini-GGUF.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con mas de 1 GB de VRAM libre, aunque MLX no se ejecuta sobre CUDA; en ese caso hay que usar GGUF con llama.cpp u otro runtime compatible.
- CPU: segun la model card, el build cuantizado se ejecuta comodamente en la CPU de un portatil.
- Opciones de despliegue: mlx-lm (formato MLX de este repositorio), llama.cpp, Ollama y LM Studio mediante los GGUF de superwhisper/s1-mini-GGUF. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davidalarrea/S1-mini-MLX-4bit | 596M (4-bit, 462 MiB) | No disponible; entradas de hasta ~1.000 tokens recomendadas | 94,8% de exactitud de token atribuida al modelo original; conversion validada con 6 casos | s1-mini-license (Hub) / Apache 2.0 + clausula de nombramiento (model card) | Repositorio MLX comunitario; 0 descargas y 0 likes en el momento del analisis |
| superwhisper/s1-mini (original BF16) | 596M | No disponible; mismas recomendaciones de entrada | 94,8% de exactitud de token en 7.519 casos retenidos | s1-mini-license | Repositorio oficial, con revisiones etiquetadas (v1) |
| superwhisper/s1-mini-GGUF | 596M en cuantizaciones GGUF | No disponible | No disponible | s1-mini-license | Repositorio oficial en formato GGUF para llama.cpp, Ollama y LM Studio |
| Qwen/Qwen3-0.6B (modelo base) | 0,6B (0,8B reportados en el Hub por el mismo motivo de embeddings duplicados) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Repositorio oficial de Qwen |

No se dispone de datos comparativos de rendimiento frente a otros normalizadores de texto ASR en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles. El modelo se declara explicitamente como release v1 y cobertura unicamente en ingles.
- No es un modelo conversacional: no sigue instrucciones generales, no mantiene dialogo y solo ejecuta la tarea de normalizacion controlada por la linea de control. Las etiquetas "conversational" y "text-generation" del Hub pueden inducir a error.
- Limite practico de entrada de aproximadamente 1.000 tokens; las transcripciones mas largas deben trocearse, lo que puede fragmentar el contexto y degradar correcciones que dependan de frases lejanas.
- Riesgo de alucinacion y de omision de contenido: en la comprobacion de 6 casos se observo la perdida de la palabra "tomorrow" en un caso de autocorreccion. La resolucion de correcciones implica inferir la intencion del hablante, con el consiguiente riesgo de introducir o eliminar informacion.
- Conversion no oficial: el repositorio lo mantiene davidalarrea, no Superwhisper. No se ha reproducido la evaluacion upstream de 7.519 casos sobre estos pesos; la validacion publicada se limita a 6 casos con 3 coincidencias exactas.
- Discrepancia en el identificador: el ejemplo de codigo de la model card carga "mlx-community/S1-mini-MLX-4bit", distinto del ID real del repositorio (davidalarrea/S1-mini-MLX-4bit). Conviene corregir la ruta antes de ejecutar.
- Ambiguedad de licencia: el Hub declara licencia "other" con license_name "s1-mini-license", mientras que la model card indica Apache 2.0 con clausula de nombramiento. Es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial o de redistribucion.
- Trazabilidad baja: 0 descargas y 0 likes en el momento del analisis, sin validacion comunitaria ni issues publicos.
- Conteo de parametros confuso: el Hub reporta 0,8B debido a que lm_head.weight se almacena duplicado; los parametros unicos son 596,0M.
- Formato de salida variable: bajo ciertas lineas de control la salida puede contener Markdown o lineas en blanco, por lo que puede requerir un paso de post-procesado segun el destino.
- No sustituye a revision humana en dominios regulados (sanitario, legal, financiero): es una herramienta de limpieza de texto, no un sistema de verificacion de contenido.

## Enlaces

- Repositorio analizado: https://huggingface.co/davidalarrea/S1-mini-MLX-4bit
- Modelo base original: https://huggingface.co/superwhisper/s1-mini
- Revision etiquetada v1 del modelo base: https://huggingface.co/superwhisper/s1-mini/tree/v1
- Builds GGUF oficiales: https://huggingface.co/superwhisper/s1-mini-GGUF
- Modelo base de arquitectura: https://huggingface.co/Qwen/Qwen3-0.6B
- Sitio de Superwhisper: https://superwhisper.com
- Discord de Superwhisper: https://discord.gg/tF98XvJNvB
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/2505.09388 (no se ha verificado su contenido en la informacion disponible)
- Libreria de inferencia MLX para LM: https://github.com/ml-explore/mlx-lm
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden a dominios comerciales de otra tematica), por lo que no aportan informacion adicional verificable.
