# bijaykumarsingh/qwen3-asr-0.6b-assamese-lora

## Resumen

qwen3-asr-0.6b-assamese-lora es un adaptador LoRA de PEFT entrenado sobre el modelo base Qwen/Qwen3-ASR-0.6B-hf para reconocimiento automatico del habla (ASR) en assames, una lengua indoaria de bajos recursos con aproximadamente 15 millones de hablantes. Lo publica el autor bijaykumarsingh en HuggingFace bajo licencia Apache 2.0. El modelo base es un modelo de audio-lenguaje de menos de mil millones de parametros (la nomenclatura indica 0,6 B) con encoder acustico y decoder tipo transformer causal; el adaptador congela el encoder acustico y anade proyecciones LoRA sobre las capas lineales.

El interes tecnico de esta ficha no esta en su rendimiento, sino en su valor como evidencia negativa documentada: el autor presenta el adaptador como una demostracion de que el sesgo inductivo arquitectonico pesa mas que la escala de parametros al transferir capacidades foneticas en zero-shot a lenguas de bajos recursos. Los resultados publicados en la propia model card son muy pobres (WER del 107,90 % sobre un split de test con hablantes disjuntos), lo que convierte esta publicacion en un caso de estudio sobre los limites de adaptar modelos ASR sub-1B a idiomas con pocos datos.

El repositorio practicamente no tiene traccion: cero descargas y cero likes en el momento de la consulta, y un tamano de repositorio reportado de 0,0 GB, coherente con un adaptador LoRA de dimension reducida. Es relevante para investigadores que trabajen en ASR de bajos recursos, en evaluacion honesta de adaptadores PEFT y en el analisis de por que ciertos modelos fallan al transferir fonetica entre idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3-ASR-0.6B-hf, modelo de audio-lenguaje con encoder acustico congelado y decoder causal |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina Qwen3-ASR-0.6B (aproximadamente 0,6 mil millones de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | Assames (codigo `as`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos de adaptador LoRA en formato PEFT) |

Configuracion LoRA declarada: r=16, alpha=32, dropout=0,05, aplicada a todas las proyecciones lineales, con el encoder acustico congelado.

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-ASR-0.6B-hf, un modelo de audio-lenguaje que combina un front-end acustico con un decoder de lenguaje causal. La estrategia de ajuste es PEFT mediante LoRA con rango 16, alpha 32 y dropout 0,05, aplicada a todas las proyecciones lineales del modelo, manteniendo el encoder acustico congelado. Esta decision implica que toda la adaptacion al assames debe ocurrir en el espacio del decoder, sin reajustar las representaciones acusticas de entrada, lo que el autor identifica como el cuello de botella principal del experimento.

No se documentan en la informacion disponible el numero de tokens de audio de entrenamiento, la composicion del dataset, ni el uso de RLHF, DPO u otras tecnicas de alineamiento. El unico dato de coste computacional aportado es el tiempo de entrenamiento: 6,07 horas sobre una NVIDIA A40 de 48 GB. La evaluacion se realizo sobre un split de test estrictamente disjunto por hablante, con 2.266 enunciados, 31 hablantes unicos, 3,18 horas de audio y 22.596 palabras en total, aplicando normalizacion Unicode NFC y eliminacion de puntuacion.

## Capacidades

- Reconocimiento automatico del habla en assames: transcripcion de audio a texto en el idioma objetivo, con resultados limitados segun los propios benchmarks del autor.
- Transcripcion con vocabulario abierto: al heredar el decoder de un modelo de lenguaje, la salida no esta restringida a un lexicon cerrado, lo que explica en parte el elevado numero de inserciones observado.
- Adaptacion PEFT eficiente: el adaptador es un fichero de pesos de bajo rango que se acopla al modelo base sin modificar sus pesos originales.
- Capacidades multilingues: no documentadas para el adaptador, que se evalua unicamente en assames; el modelo base no especifica su cobertura idiomatica en la informacion disponible.
- Tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision o audio adicionales: no documentadas mas alla del pipeline de ASR declarado.

## Casos de uso

- Investigacion en ASR de bajos recursos: el modelo sirve como punto de partida reproducible para estudiar el efecto de congelar el encoder acustico al adaptar un modelo sub-1B a un idioma con pocos datos, con un split de evaluacion disjunto por hablante ya definido en la model card.
- Analisis de fallos en transferencia fonetica: los datos de descomposicion de errores (2.526 aciertos, 19.479 sustituciones, 591 eliminaciones, 4.311 inserciones) permiten estudiar como un decoder de lenguaje dominado por el ingles "alucina" tokens en lugar del idioma objetivo, patron tipico de modelos audio-lenguaje mal adaptados.
- Punto de comparacion en estudios de ablacion: al ser un adaptador con hiperparametros explicitos (r=16, alpha=32, dropout=0,05), es util como baseline LoRA frente a otras estrategias como ajuste total, adaptadores con encoder descongelado o modelos ASR dedicados de tamano similar.
- Prototipado de pipelines de ASR para lenguas minorizadas: un equipo puede integrarlo en un prototipo con `transformers` + `peft` para comprobar la viabilidad de un modelo generativo como transcriptor, sabiendo de antemano que la calidad publicada es insuficiente para produccion.
- Docencia y formacion en PEFT: el repositorio, con su codigo de carga minimo y su tabla de metricas, es un ejemplo didactico de como evaluar y reportar un adaptador con intervalos de confianza bootstrap.
- Auditoria de model cards: sirve como caso practico de publicacion transparente de resultados negativos, frente a la practica habitual de no publicar adaptadores con WER superior al 100 %.

## Benchmarks y rendimiento

Evaluacion sobre un split de test con hablantes disjuntos (2.266 enunciados, 31 hablantes, 3,18 horas, 22.596 palabras), con normalizacion Unicode NFC y sin puntuacion:

| Metrica | Resultado | Intervalo de confianza al 95 % |
|---|---|---|
| Word Error Rate (WER) | 107,90 % | [106,87 %, 108,93 %] |
| Character Error Rate (CER) | 52,07 % | No disponible |
| Match Error Rate (MER) | 90,61 % | No disponible |
| Word Information Lost (WIL) | 98,93 % | No disponible |

Descomposicion de errores a nivel de palabra:

| Tipo | Recuento |
|---|---|
| Aciertos (hits) | 2.526 |
| Sustituciones | 19.479 |
| Eliminaciones | 591 |
| Inserciones | 4.311 |

No se han publicado comparaciones con otros modelos ASR para assames en la informacion disponible. Un WER superior al 100 % indica que el sistema produce mas errores que palabras de referencia, comportamiento impulsado por el elevado numero de sustituciones e inserciones y coherente con un decoder que genera texto fuera del idioma objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene aproximadamente 0,6 mil millones de parametros; en precision FP16 requiere del orden de 1,2 a 1,5 GB solo para los pesos, mas el coste del encoder acustico y las activaciones (estimacion orientativa, no publicada por el autor).
- GPU recomendadas: el entrenamiento documentado se ejecuto en una NVIDIA A40 de 48 GB durante 6,07 horas. Para inferencia son suficientes GPUs de gama consumer.
- Compatibilidad con GPU consumer: si, previsiblemente cabe en tarjetas con 6-8 GB de VRAM o mas (RTX 3060, RTX 4060, RTX 4090), dado el tamano del modelo base.
- Opciones de despliegue: la unica ruta documentada por el autor es `transformers` con `AutoProcessor` y `AutoModelForCausalLM` mas `peft.PeftModel`. El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es el coste de entrenamiento en una A40.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada modelos comparables con datos verificables. El autor no incluye una tabla comparativa frente a alternativas de ASR para assames ni frente a otros adaptadores sobre Qwen3-ASR-0.6B-hf. Cualquier comparacion con modelos como Whisper, MMS o IndicWav2Vec requeriria datos de evaluacion sobre el mismo split, que no estan disponibles en este repositorio.

| Modelo | Parametros | Contexto | WER (assames) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-asr-0.6b-assamese-lora | Adaptador sobre base de ~0,6 B | No disponible | 107,90 % (split propio) | Apache 2.0 | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Rendimiento insuficiente para uso real: un WER del 107,90 % y un CER del 52,07 % implican que la salida no es utilizable en produccion sin una revision humana practicamente total.
- Sesgo hacia el idioma dominante del modelo base: las 19.479 sustituciones y 4.311 inserciones sugieren que el decoder genera tokens fuera del assames, un problema clasico de los modelos audio-lenguaje adaptados solo en el lado del decoder.
- Riesgo elevado de alucinacion: el modelo puede producir texto fluido pero no correspondiente al audio, especialmente en segmentos con ruido, acentos no vistos o vocabulario fuera del dominio de entrenamiento.
- Encoder acustico congelado: al no reajustar el front-end, la adaptacion queda limitada al espacio del decoder; el propio autor identifica esto como el cuello de botella del enfoque.
- Cobertura idiomatica restringida: el adaptador esta entrenado y evaluado exclusivamente en assames; se desconoce su comportamiento en otros idiomas y si degrada las capacidades originales del modelo base.
- Limitaciones de contexto: no se documenta la longitud maxima de audio que el modelo puede procesar de una sola vez.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3-ASR-0.6B-hf, que no se detalla en la informacion proporcionada.
- Ausencia de validacion externa: cero descargas y cero likes, sin replicaciones independientes ni resultados de terceros que confirmen o matizen las metricas publicadas.
- Detalles de entrenamiento incompletos: no se especifican el dataset utilizado, el numero de horas de audio de entrenamiento ni la composicion de hablantes, lo que limita la reproducibilidad.
- Fecha de publicacion futura: el repositorio aparece creado y actualizado en octubre de 2026 y la cita referencia un articulo de 2026, datos que conviene verificar en la fuente original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bijaykumarsingh/qwen3-asr-0.6b-assamese-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Cita del autor: Singh, Bijay Kumar, "Architectural Inductive Bias Trumps Parameter Scale: Adapting Large Audio-Language Models to Low-Resource Assamese ASR", arXiv preprint, 2026 (sin enlace disponible en la informacion proporcionada)
- No se han encontrado otros enlaces relevantes (paper, repositorio de codigo, demo o dataset) en la busqueda web realizada.
