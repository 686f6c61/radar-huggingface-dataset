# PrimeNeural/wav2vec2-large-xlsr-53-gender-recognition-librispeech-pnn-d50-w1a1-j46

## Resumen

Este repositorio contiene una version comprimida del modelo `alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech`, un clasificador binario de genero (masculino/femenino) a partir de audio, basado en la arquitectura wav2vec2-large-xlsr-53 de Meta. La compresion la realiza Prime Neural Networks (PreciseStatistics GmbH) mediante su formato propietario PNN (Prime Neural Network), que sustituye 146 capas lineales del modelo original por capas dispersas al 50 % de densidad con pesos y activaciones de 1 bit.

El resultado es un fichero de 46,3 MB que conserva un 95,34 % de acuerdo top-1 con el modelo original sobre datos reservados, segun la model card. El modelo original de wav2vec2-large-xlsr-53 tiene 317 millones de parametros; la version comprimida declara 32.516.738 parametros en safetensors, lo que refleja la representacion de 1 bit y la dispersion estructurada, no un recorte del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de compresion extrema (1 bit en pesos y activaciones) aplicada a un modelo de audio; por otro, advierte de que el formato PNN no es compatible con `transformers` de forma nativa y requiere el paquete PNN propietario, lo que condiciona totalmente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-large-xlsr-53 (transformer encoder sobre representaciones convolucionales de audio) con 146 capas lineales sustituidas por capas PNN dispersas al 50 % y 1 bit |
| Parametros totales | 32.516.738 (segun safetensors del repo); el modelo base wav2vec2-large-xlsr-53 tiene 317 M |
| Parametros activos | no disponible (no es MoE; la dispersion es estructural por capa, no condicional) |
| Longitud de contexto | no disponible (modelo de audio; el modelo base acepta ventanas de audio de hasta 30 s aproximadamente, sin confirmacion en la informacion disponible) |
| Tipos de cuantizacion | pesos y activaciones de 1 bit en las capas PNN; partes densas en float16 |
| Idiomas soportados | no disponible (el modelo base XLSR-53 cubre 53 idiomas, pero esta ficha no confirma el alcance efectivo tras la compresion) |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors con formato PNN propietario; requiere el paquete PNN V4.4 y `pnn_load.py` |

## Arquitectura y entrenamiento

El modelo base es wav2vec2-large-xlsr-53, un encoder transformer preentrenado de forma autosupervisada sobre audio en 53 idiomas y afinado despues para clasificacion de genero sobre LibriSpeech. La version PNN mantiene la topologia general pero reemplaza 146 capas lineales por capas PNN: cada salida lee un conjunto fijo y estructurado de entradas (misma cardinalidad para todas las salidas, sin almacenar indices), cada conexion se codifica con un bit de signo y se aplica una escala FP16 por entrada y por salida. Ademas, cada capa PNN binariza sus entradas respecto a un umbral FP16 por entrada, de modo que la operacion interna se reduce a XOR y conteo de bits en el kernel PNN.

El proceso de compresion descrito no es un entrenamiento convencional: la model card indica "0 epochs" y una inicializacion por minimos cuadrados con matching de estados ocultos (destilacion sin pasos de SGD sobre openslr/librispeech_asr). Esto explica que el acuerdo con el original sea del 95,34 % top-1 en datos reservados, pero tambien implica que no hay un ajuste fino posterior que corrija sesgos del modelo base. No se especifican en la informacion disponible el numero de tokens de audio, la composicion exacta del dataset de calibracion ni si hubo RLHF o DPO (poco probable en una tarea de clasificacion).

## Capacidades

- Clasificacion binaria de genero (masculino/femenino) a partir de audio en formato de onda.
- Inferencia sobre el encoder wav2vec2 con representaciones de audio de entrada; no genera texto.
- Ejecucion de las capas PNN mediante la libreria de kernels del paquete PNN, en CPU y GPU NVIDIA.
- Modo de carga alternativa (`load(REPO, kernels="off")`) que reconstruye capas PyTorch para ajuste fino.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- Capacidades multilingues: no confirmadas en esta version comprimida; el modelo base cubre 53 idiomas, pero la ficha no aporta evaluacion tras la compresion.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Moderacion y analitica de locutores en plataformas de audio: clasificar el genero percibido de fragmentos de voz para metricas agregadas o para enrutar contenido, con un fichero de 46,3 MB facil de distribuir en flotas de CPU.
- Preetiquetado de corpus de voz: generar etiquetas de genero a gran escala antes de una revision humana, aprovechando el 95,34 % de acuerdo con el modelo original como senal de calidad suficiente para triaje.
- Despliegue en dispositivos con recursos muy limitados: el formato de 1 bit y la dispersion al 50 % permiten ejecutar en CPU sin GPU dedicada, util en edge computing o en entornos sin acelerador.
- Investigacion sobre compresion de modelos de audio: servir como referencia reproducible para comparar tecnicas de cuantizacion extrema (1 bit en pesos y activaciones) frente a cuantizaciones de 8 o 4 bits.
- Segmentacion de audiencias en podcasts y radios: clasificar intervenciones por genero para informes de diversidad o para estudios de participacion.
- Filtrado previo en pipelines de ASR: descartar o etiquetar segmentos por genero antes de transcribir, reduciendo coste en sistemas de transcripcion masiva.
- Evaluacion de robustez de kernels: probar la implementacion XOR + bit count del paquete PNN en CPUs y GPUs frente a la version densa en PyTorch.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Acuerdo top-1 con el modelo original | 95,34 % | Sobre datos reservados (held-out), segun la model card |
| Epocas de destilacion | 0 | Inicializacion por minimos cuadrados y matching de estados ocultos |
| Tamano del fichero | 46,3 MB | Pesos de 1 bit y activaciones; partes densas en float16 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) ni metricas de exactitud, precision o recall sobre LibriSpeech para esta version comprimida. Tampoco hay comparacion con el modelo original en terminos de F1 o AUC.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el fichero pesa 46,3 MB y las capas PNN se ejecutan con kernels de CPU o GPU. No se especifica una cifra exacta de VRAM en la informacion disponible.
- GPU recomendadas: cualquier GPU NVIDIA compatible con los kernels del paquete PNN; el modelo es lo bastante pequeno para ejecutarse en GPUs de gama baja, pero no se detallan modelos concretos.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del fichero, aunque la informacion disponible no lo confirma con modelos concretos (RTX 4090, RTX 3060, etc.).
- Opciones de despliegue: paquete PNN V4.4 con `pnn_load.py` (CPU o GPU NVIDIA); endpoint de inferencia en primeneural.net. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que las capas PNN no son un tipo de capa de `transformers`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (PNN 50 %, 1 bit) | 32,5 M declarados (base 317 M) | no disponible | apache-2.0 | safetensors PNN | Requiere paquete PNN propietario; 95,34 % de acuerdo con el original |
| alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech | 317 M | ventana de audio estandar de wav2vec2 | apache-2.0 | safetensors estandar | Modelo base; compatible con `transformers` sin dependencias propietarias |
| wav2vec2-base-960h (variante de ASR) | 95 M | ventana de audio estandar | apache-2.0 | safetensors | Tarea distinta (reconocimiento de voz), no clasificacion de genero |
| Modelos de clasificacion de audio cuantizados a 8 bits | segun modelo | segun modelo | variable | GGUF/safetensors | No se dispone de datos comparativos concretos en la informacion disponible |

La comparativa directa mas util es con el modelo base original: misma licencia y misma tarea, pero este ultimo es compatible con el ecosistema `transformers` sin necesidad de un paquete propietario. El modelo PNN gana en tamano (46,3 MB frente a cientos de MB) y pierde en portabilidad y en independencia de proveedor.

## Limitaciones y advertencias

- Dependencia de un paquete propietario: el modelo no funciona con `AutoModelForAudioClassification.from_pretrained`; requiere el paquete PNN V4.4, cuya licencia de evaluacion se solicita por correo a info@primeneural.net. Esto limita la reproducibilidad y el uso comercial sin acuerdo.
- Licencia dual: los pesos heredan apache-2.0 del modelo base, pero el formato PNN y el paquete estan bajo licencia separada de PreciseStatistics GmbH. Conviene revisar ambos terminos antes de produccion.
- Riesgo de sesgo: la clasificacion de genero a partir de voz es una tarea sensible; el modelo base puede reflejar sesgos de LibriSpeech (dominio de lectura en ingles, hablantes concretos) y la compresion no corrige esos sesgos.
- Alucinacion: al ser un clasificador binario, no genera texto, pero puede producir falsos positivos y falsos negativos; no se han publicado metricas de precision/recall en la informacion disponible.
- Perdida de precision: el 95,34 % de acuerdo con el original implica un 4,66 % de desacuerdo en datos reservados; en dominios distintos (acentos, ruido, otros idiomas) el deterioro puede ser mayor y no esta cuantificado.
- Cobertura idiomatica incierta: aunque el modelo base cubre 53 idiomas, no se confirma que la version comprimida mantenga ese alcance.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni demo publica; no hay evidencia de uso en produccion.
- Fecha de creacion futura (2026-11-21) en los metadatos, lo que sugiere que el repositorio puede ser reciente o que los metadatos no son fiables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PrimeNeural/wav2vec2-large-xlsr-53-gender-recognition-librispeech-pnn-d50-w1a1-j46
- Modelo base: https://huggingface.co/alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech
- Sitio de Prime Neural Networks: https://primeneural.net
- Contacto para licencia de evaluacion del paquete PNN: info@primeneural.net
- Patente pendiente citada: US 19/685,168
