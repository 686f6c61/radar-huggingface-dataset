# mrothroc/sc35-s4d-lin-mixlab

## Resumen

El modelo `mrothroc/sc35-s4d-lin-mixlab` es un clasificador de palabras clave (*keyword spotting*) de 306.083 parámetros que opera directamente sobre la forma de onda cruda a 16 kHz, sin espectrograma, sin MFCC ni ningún otro tipo de extracción de características. Es una reproducción del resultado S4D-Lin publicado en *On the Parameterization and Initialization of Diagonal State Space Models* (Gu et al., 2022) para el conjunto de datos Speech Commands v0.02, entrenada con la herramienta mixlab del propio autor y ejecutada en un único Apple M4.

Se trata de un modelo de espacio de estados (SSM) diagonal con bloques bidireccionales y 6 capas de dimensión 128, que trata una ventana de un segundo como una secuencia de 16.000 pasos. Su relevancia no está en el rendimiento absoluto —la tarea es acotada— sino en la relación entre tamaño y precisión: alcanza un 96,14 % de exactitud en el split oficial de test con 306K parámetros, mientras que una ConvNet de 26,2M parámetros (85 veces mayor) se queda en un 95,51 % y un ResNet-18 de 216K parámetros baja al 77,86 %.

El propósito declarado por el autor es servir como punto de partida para experimentación: la arquitectura se define en un fichero JSON de configuración de mixlab, de modo que cambiar el mezclador de secuencia es una edición de configuración y no una reescritura. El mismo fichero se ejecuta sin cambios en un portátil Apple Silicon y en una máquina CUDA grande. No es un modelo de propósito general: clasifica 35 palabras fijas y no dispone de clase de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de espacio de estados (SSM) diagonal, S4D-Lin, con bloques bidireccionales; 6 capas, dimension 128, `n_ssm` 2 |
| Parametros totales | 306.083 (306K) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1 segundo de audio, equivalente a 16.000 muestras a 16 kHz (no es una ventana de contexto de texto) |
| Tipos de cuantizacion | No disponible (no se documentan versiones cuantizadas; el checkpoint se distribuye en el formato nativo de mixlab) |
| Idiomas soportados | No disponible en la informacion proporcionada; el entrenamiento se realiza sobre Speech Commands v0.02, corpus de palabras aisladas en ingles |
| Licencia | MIT |
| Formato de pesos | `mixlab_checkpoint.safetensors` (contenedor nativo de mixlab, leible mediante `mixlab_ckpt.py`); no es un checkpoint compatible con `transformers` |

Otros datos de interes: el repositorio ocupa 0,0 GB segun el Hub, tiene 0 descargas y 0 likes en el momento de la consulta, y la model card declara `inference: false`.

## Arquitectura y entrenamiento

La arquitectura es un apilamiento de 6 bloques de modelo de espacio de estados con parametrizacion diagonal en la linea temporal (S4D-Lin), con la innovacion de inicializacion descrita por Gu et al. (2022), paper referenciado con el identificador arXiv 2206.11893. Los bloques son bidireccionales: el modelo lee la ventana completa de un segundo antes de emitir una decision, lo que implica que no puede operar como detector en streaming. La entrada es la forma de onda PCM cruda normalizada con media -2,791959 y desviacion tipica 2818,166625 sobre unidades PCM, y el modelo produce 35 logits, uno por palabra.

El entrenamiento se define en un fichero JSON de receta de mixlab y se ejecuto en un unico Apple M4. El autor declara explicitamente dos supuestos que no aparecen en el paper original: el uso de `n_ssm: 2` (comparticion de parametros del SSM) y la regla de seleccion de checkpoint, que en este caso corresponde al mejor checkpoint de desarrollo, epoca 36 de 40 (paso 190.872), evaluado una unica vez sobre test. No se especifica el numero de tokens de audio ni la composicion exacta del dataset mas alla de Speech Commands v0.02, ni se menciona uso de RLHF o DPO, tecnicas que no aplican a esta tarea. Tampoco se documenta la transferencia zero-shot a 8 kHz del paper, porque requiere rediscretizacion consciente de la tasa de muestreo, no implementada en mixlab en el momento de la ejecucion.

## Capacidades

- Clasificacion de audio de palabra aislada directamente desde la forma de onda cruda, sin pipeline de caracteristicas previo.
- Reconocimiento de un vocabulario cerrado de 35 palabras de Speech Commands v0.02; el mapeo indice-palabra esta en `labels.json` y el orden no es alfabetico.
- Procesamiento de entradas de 16.000 muestras (un segundo a 16 kHz); las entradas mas largas se truncan a los primeros 16.000 valores.
- Inferencia bidireccional sobre la ventana completa, lo que le permite usar contexto acustico hacia delante y hacia atras dentro del segundo analizado.
- Port independiente en PyTorch puro (`modeling_s4d.py`) que reproduce las salidas del bloque de mixlab con una diferencia maxima absoluta de logits de 6,251e-05 y coincidencia de argmax en 35 de 35 entradas, medido sobre un checkpoint de un solo paso.
- Intercambio del mezclador de secuencia mediante edicion del JSON de configuracion, sin reescribir el codigo.
- Portable entre Apple Silicon y CUDA sin cambios en el fichero de configuracion.
- No dispone de soporte de *tool calling*, agentes, razonamiento multi-paso, vision, audio generativo ni *thinking mode*; no es un modelo de lenguaje.

## Casos de uso

- Deteccion de palabra de activacion en dispositivos empotrados: con 306K parametros y aproximadamente 1,2 MB en fp32, el modelo cabe en microcontroladores y SoCs de bajisimo consumo, y clasifica comandos de voz predefinidos en el propio dispositivo sin enviar audio a la nube.
- Filtrado previo en pipelines de audio: se puede usar como etapa de descarte barata que solo active un modelo de reconocimiento de voz completo cuando la entrada coincide con una de las 35 palabras, reduciendo coste de computo en servicios de transcripcion.
- Investigacion en modelos de espacio de estados: sirve como banco de pruebas reproducible para comparar variantes de inicializacion, numero de capas o mezcladores de secuencia, ya que la receta completa esta en JSON y el coste de entrenamiento es de una sola maquina.
- Docencia y practicas de aprendizaje profundo: la tarea, el dataset publico de 2,3 GB y el tamano del modelo permiten que un estudiante entrene y evalue de extremo a extremo en un portatil, comparando directamente con las cifras del paper.
- Prototipado de interfaces de voz con vocabulario cerrado: aplicaciones de control por voz con un conjunto fijo de ordenes (por ejemplo, domotica o control de dispositivos) donde no se necesita lenguaje natural abierto.
- Punto de partida para *tinkering* arquitectonico: el autor lo plantea como base editable en mixlab, de modo que un equipo puede sustituir el mezclador S4D-Lin por otra alternativa y medir el efecto sobre la misma particion de test.
- Referencia de comparacion en estudios de eficiencia: permite contrastar empiricamente la hipotesis de que un SSM de 306K parametros supera a una ConvNet 85 veces mayor en una tarea de clasificacion de audio.

## Benchmarks y rendimiento

Split oficial `testing_list.txt`, 11.005 enunciados, una sola semilla:

| Modelo | Parametros | Exactitud en test |
|---|---|---|
| Este modelo (S4D-Lin en mixlab) | 306.083 | 96,14 % (10.580 / 11.005) |
| S4D-Lin publicado (tabla 11 del paper) | ~306K | 96,25 % (desviacion de ±0,03 entre semillas) |
| ConvNet de referencia del paper | 26,2M | 95,51 % |
| ResNet-18 | 216K | 77,86 % |

El autor advierte que la diferencia de 0,11 puntos respecto al paper no debe interpretarse como una brecha precisa, ya que se ejecuto una unica semilla y el resultado queda fuera del intervalo publicado. No se proporcionan otros benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,2 MB solo para los pesos en fp32 (306.083 parametros); no se ha medido el consumo real de memoria, que incluye las activaciones de la secuencia de 16.000 pasos.
- GPU recomendadas: no se indica ninguna en la informacion disponible; por tamano, cualquier GPU es suficiente. El modelo se entreno en un Apple M4.
- Cabe sobradamente en GPU de consumo: cualquier RTX, e incluso en CPU y en hardware empotrado, dado el orden de magnitud de los parametros.
- Opciones de despliegue: no soporta `transformers` (`AutoModel`, `pipeline("audio-classification", ...)` ni el widget de inferencia del Hub fallan porque no existe equivalente de la arquitectura). El despliegue se realiza con el port en PyTorch `modeling_s4d.py` junto a `mixlab_ckpt.py` para leer el contenedor `.st`. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput: no medidos. El autor indica explicitamente que ni la latencia de inferencia en CPU ni el consumo de memoria de entrenamiento se han perfilado.
- Requisitos de software: `torch` y `numpy`; el script debe ejecutarse desde el directorio del modelo para que los imports funcionen.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea y datos | Exactitud en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mrothroc/sc35-s4d-lin-mixlab` | 306.083 | Keyword spotting, 35 clases, Speech Commands v0.02, forma de onda cruda | 96,14 % | MIT | HuggingFace, formato mixlab |
| S4D-Lin original (Gu et al., 2022) | ~306K | Misma tarea y dataset (referencia del paper) | 96,25 % (±0,03) | No disponible | Resultado publicado, no se enlaza checkpoint |
| ConvNet del paper | 26,2M | Misma tarea y dataset | 95,51 % | No disponible | Referencia dentro del paper |
| ResNet-18 del paper | 216K | Misma tarea y dataset | 77,86 % | No disponible | Referencia dentro del paper |

La comparacion con alternativas fuera del paper no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un detector de palabras clave para 35 palabras fijas entrenado sobre Speech Commands v0.02; no es un modelo de voz general ni un sistema de reconocimiento de habla abierta.
- No existe clase de desconocido ni de silencio: cualquier entrada recibe una de las 35 etiquetas, incluidos ruido de fondo y palabras que el modelo nunca ha visto. Si se necesita rechazo, hay que anadirlo.
- No es un detector en streaming. Los bloques son bidireccionales, por lo que el modelo necesita leer la ventana completa de un segundo antes de decidir, lo que anade latencia estructural.
- Las entradas de mas de un segundo se truncan a las primeras 16.000 muestras, con la perdida de informacion que eso implica.
- La reproduccion usa una unica semilla frente a las multiples semillas del paper, y dos detalles (`n_ssm: 2` y la regla de seleccion de checkpoint) son supuestos declarados por el autor, no afirmaciones del paper. El resultado queda fuera del intervalo publicado.
- No se incluye el resultado de transferencia zero-shot a 8 kHz del paper, porque requiere rediscretizacion consciente de la tasa de muestreo no implementada en mixlab.
- El modelo no es compatible con `transformers`: el `config.json` es una configuracion de mixlab y la arquitectura no tiene equivalente en la libreria. El widget de inferencia del Hub no funciona y la model card declara `inference: false`.
- La verificacion del port en PyTorch se hizo sobre un checkpoint de un solo paso, no sobre los pesos entrenados publicados; es evidencia de coherencia matematica y de disposicion de pesos, no una re-verificacion del modelo final.
- No se han medido latencia en CPU ni memoria de entrenamiento, por lo que no hay garantias cuantitativas de rendimiento en produccion.
- Sesgos conocidos: no se documentan de forma explicita; cabe esperar los sesgos inherentes a Speech Commands v0.02 en cuanto a variedad de hablantes, acentos y condiciones de grabacion.
- La licencia MIT permite uso comercial sin restricciones adicionales segun la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrothroc/sc35-s4d-lin-mixlab
- Paper de referencia (Gu et al., 2022): https://arxiv.org/abs/2206.11893
- Repositorio de mixlab: https://github.com/mrothroc/mixlab
- Entrada del cookbook con detalles del entrenamiento: https://github.com/mrothroc/mixlab-cookbook/tree/main/speech-commands-s4d
- Dataset Speech Commands v0.02 (tarball de 2,3 GB): http://download.tensorflow.org/data/speech_commands_v0.02.tar.gz
