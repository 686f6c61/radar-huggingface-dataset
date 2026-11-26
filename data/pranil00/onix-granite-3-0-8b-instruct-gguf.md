# pranil00/ONIX-granite-3.0-8b-instruct-GGUF

## Resumen
ONIX-granite-3.0-8b-instruct-GGUF es una cuantizacion en formato GGUF del modelo ibm-granite/granite-3.0-8b-instruct de IBM, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el autor toma los pesos originales de Granite 3.0 de 8.370 millones de parametros y los comprime con el esquema Q5_K_M (5,5 bits por peso), reduciendo el tamano de 16,37 GB en FP16 a 5,63 GB, una reduccion del 65,6 % y un ratio de compresion de 2,91x.

La relevancia de esta publicacion es practica: permite ejecutar un modelo instructivo de clase 8B en hardware de consumo, incluyendo Apple Silicon con 6,33 GB de memoria unificada, GPUs NVIDIA de las series RTX 30/40/50 con 7,13 GB de VRAM y equipos de escritorio con CPU y 8,33 GB de RAM libre. El autor declara una retencion de calidad del 97,5 % respecto al modelo en FP16, si bien esa cifra procede de su propio informe de telemetria y no de una evaluacion independiente con benchmarks estandar.

Al estar basado en Granite 3.0, hereda la arquitectura transformer decoder-only y las capacidades del modelo de IBM, pero la model card de esta publicacion no documenta la longitud de contexto nativa, los idiomas soportados ni los datos de entrenamiento, por lo que buena parte de las especificaciones del modelo base no se pueden confirmar a partir de la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), familia Granite 3.0 |
| Parametros totales | 8.372.183.040 (8,37 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el autor recomienda ventanas de 8.192 tokens en GPU/Apple Silicon y 4.096 en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico fichero publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`ibm-granite--granite-3.0-8b-instruct-Q5_K_M.gguf`, 5,63 GB) |

## Arquitectura y entrenamiento
El modelo subyacente es Granite 3.0 8B Instruct de IBM, un transformer decoder-only de 8,37 mil millones de parametros. Esta publicacion concreta no entrena ni afina el modelo: aplica una cuantizacion post-entrenamiento con el esquema Q5_K_M, que mantiene una mezcla de bloques K-quant con escalas de 5,5 bits efectivos por peso. El autor indica que las 40 capas del modelo se aceleran de forma nativa en Metal y que el buffer de cache KV se mantiene en FP16 (640 MB), sin cuantizar.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF/DPO) del modelo original en la informacion proporcionada. La model card tampoco documenta innovaciones arquitectonicas adicionales mas alla de la familia transformer. La herramienta de cuantizacion empleada es run-any-model, un motor de optimizacion adaptativo publicado en GitHub por el mismo autor.

## Capacidades
- Generacion de texto instructiva: el modelo base esta ajustado para seguir instrucciones y mantener conversaciones multi-turno.
- Razonamiento y respuesta a preguntas: hereda las capacidades del Granite 3.0 8B Instruct original.
- Generacion de codigo: el modelo base de IBM incluye soporte para tareas de programacion, aunque esta publicacion no aporta evaluaciones propias.
- Soporte de tool calling: no confirmado en la model card de esta cuantizacion; depende de las capacidades del modelo base.
- Razonamiento multi-paso y agentes: no documentado en esta publicacion.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; se trata de un modelo puramente de texto.

## Casos de uso
- Asistente conversacional local en portatil: con 6,33 GB de memoria unificada en Apple Silicon, el modelo se puede ejecutar en un MacBook con Metal acelerado para tareas de chat, redaccion y resumen sin conexion a internet.
- Prototipado en GPU de consumo: una RTX 3060 de 12 GB o superior puede cargar el fichero de 5,63 GB con margen para cache KV, lo que permite iterar sobre prompts y flujos de instrucciones en local antes de pasar a produccion.
- Generacion de codigo en entornos aislados: al ser un modelo instructivo de 8B con licencia Apache 2.0, se puede desplegar en estaciones de trabajo sin salida a la red para autocompletar y explicar codigo en repositorios sensibles.
- Procesamiento por lotes en CPU: con 8,33 GB de RAM y soporte AVX2/AVX-512, es viable ejecutar tareas de clasificacion, extraccion y resumen sobre documentos en servidores sin GPU, aceptando ventanas de contexto de 4.096 tokens.
- Base para evaluacion de cuantizaciones: util para comparar la degradacion de calidad de Q5_K_M frente a FP16 en tareas concretas del propio dominio, ya que el autor declara una retencion del 97,5 % que conviene verificar.
- Despliegue con Ollama o llama.cpp: la model card incluye instrucciones para crear un Modelfile y ejecutar con `ollama run` o `llama-cli -ngl 99 -cnv`, lo que facilita integrarlo en flujos de trabajo locales existentes.
- Educacion e investigacion: sirve como ejemplo practico de cuantizacion post-entrenamiento y de perfilado de memoria (pesos frente a cache KV) en un modelo de 8B.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El unico dato de rendimiento es el informe de telemetria del autor, que mide memoria y no calidad de tarea:

| Metrica | FP16 (base) | Q5_K_M (esta publicacion) | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 16,37 GB | 5,63 GB | -65,6 % |
| Buffer de cache KV | 640 MB (FP16) | 640 MB (FP16) | Sin cambios |
| RAM residente total | 17,07 GB | 6,33 GB | -62,9 % |
| Calidad estimada | 100 % | 97,5 % | -2,5 % |

Estos valores proceden de un unico host (Darwin, 16 GB) con motor Metal y no constituyen una evaluacion reproducible de calidad.

## Requisitos de hardware
- VRAM estimada: 7,13 GB de VRAM dedicada en GPU NVIDIA para una ventana de 8.192 tokens; 6,33 GB de memoria unificada en Apple Silicon; 8,33 GB de RAM libre en CPU con contexto de 4.096 tokens.
- GPU recomendadas: el autor cita las series RTX 30/40/50 con aceleracion CUDA; por tamano, encaja en tarjetas de 8 GB o mas (RTX 3060 Ti, 3070, 4060 Ti, 4070) y con holgura en 12 GB o mas. No se documentan pruebas en A100 ni H100.
- GPU de consumo: si, el modelo cabe en GPUs consumer de gama media con 8 GB o mas de VRAM.
- Opciones de despliegue: run-any-model CLI, Ollama (mediante Modelfile), llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI. No se mencionan vLLM ni TGI, que no consumen GGUF de forma nativa.
- Latencia y throughput: no disponibles; la model card no publica tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-granite-3.0-8b-instruct-GGUF (Q5_K_M) | 8,37 B | no disponible (recomendado 4.096-8.192) | GGUF | Apache 2.0 | Cuantizacion de comunidad, sin benchmarks publicados |
| ibm-granite/granite-3.0-8b-instruct | 8,37 B | no disponible en esta ficha | safetensors | Apache 2.0 | Modelo base oficial de IBM, referencia para comparar calidad |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | safetensors, GGUF | Llama 3.1 Community License | Alternativa de tamano similar con contexto mucho mayor y amplio ecosistema de cuantizaciones |
| Mistral 7B Instruct | 7,24 B | 32.000 tokens | safetensors, GGUF | Apache 2.0 | Alternativa de licencia permisiva y menor tamano, muy extendida en despliegues locales |

La comparacion de rendimiento con estas alternativas no esta disponible: no hay benchmarks publicados para esta cuantizacion ni datos del modelo base incluidos en la informacion proporcionada.

## Limitaciones y advertencias
- La model card no documenta sesgos conocidos del modelo base ni del proceso de cuantizacion.
- Riesgo de alucinacion inherente a los modelos de 8B; el autor no publica evaluaciones de fidelidad factual.
- La cuantizacion Q5_K_M introduce una perdida declarada del 2,5 % de calidad, medida por el propio autor y no verificada de forma independiente.
- Idiomas soportados no disponibles: no se puede garantizar un comportamiento correcto fuera del ingles sin evaluacion previa.
- Longitud de contexto nativa no documentada; las cifras de 4.096 y 8.192 tokens son recomendaciones de memoria del autor, no limites oficiales del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni validacion por terceros.
- La licencia Apache 2.0 permite uso comercial, pero el descargo de responsabilidad del autor exime de toda garantia y traslada al implementador la validacion de las salidas.
- El modelo base pertenece a IBM; conviene revisar la model card original para conocer las condiciones y limitaciones completas antes de desplegarlo en produccion.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-granite-3.0-8b-instruct-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-instruct
- Herramienta de cuantizacion run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
