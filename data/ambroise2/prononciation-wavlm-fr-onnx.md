# Ambroise2/prononciation-wavlm-fr-onnx

## Resumen

`Ambroise2/prononciation-wavlm-fr-onnx` es una conversion al formato ONNX del modelo de reconocimiento de fonemas en frances `imenba6/wavlm-large-fr-phoneme-recognition`. Lo publica el usuario Ambroise2 con un objetivo muy concreto: permitir la ejecucion del reconocimiento fonetico directamente en el navegador mediante `onnxruntime-web` y WebGPU, sin necesidad de enviar el audio a un servidor. El repositorio ocupa 0,6 GB y se distribuye bajo licencia MIT.

El modelo resuelve la tarea de convertir una senal de audio de 16 kHz en una secuencia de fonemas del Alfabeto Fonetico Internacional: recibe `input_values` con forma (1, T) y devuelve `logits` con forma (1, tramas, 39), es decir, una distribucion sobre 39 clases foneticas por cada trama temporal. Esto lo hace util para evaluacion de pronunciacion, anotacion fonetica y analisis linguistico, no para generacion de texto.

Su relevancia actual es doble. Por un lado, es un caso practico de exportacion de un modelo de voz grande (la arquitectura base es WavLM-large) a un runtime portable. Por otro lado, documenta una decision tecnica poco habitual: los pesos se almacenan en float16 para reducir tamano, pero los calculos se fuerzan a float32 porque, segun el autor, el calculo en float16 "hacia bascular" algunas vocales. No se han publicado resultados de benchmarks ni metricas de error fonetico en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WavLM-large (encoder convolucional de caracteristicas mas encoder transformer con sesgo posicional relativo), exportado a ONNX |
| Parametros totales | No disponible en el repositorio; la arquitectura base WavLM-large tiene del orden de 300 M de parametros |
| Longitud de contexto | No disponible (entrada de audio de duracion variable, forma (1, T)) |
| Tipos de cuantizacion | Pesos en float16 con calculo en float32; no se publican variantes int8, int4 ni GGUF |
| Idiomas soportados | Frances (etiqueta `french`); salida en alfabeto fonetico internacional |
| Licencia | MIT |
| Formato de pesos | ONNX (pesos float16, grafo ONNX) |
| Entrada | `input_values`: audio mono a 16 kHz normalizado (media 0, varianza 1), forma (1, T) |
| Salida | `logits`: forma (1, tramas, 39), vocabulario IPA del modelo original |
| Vocabulario de salida | 39 clases foneticas IPA |
| Modelo base | `imenba6/wavlm-large-fr-phoneme-recognition` |
| Tamano del repositorio | 0,6 GB |
| Autor | Ambroise2 |
| Fecha de creacion | 2026-10-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es WavLM-large, un modelo de representacion del habla auto-supervisado que combina un encoder convolucional que transforma la forma de onda en tramas latentes (tipicamente una trama cada 20 ms a 16 kHz) con un encoder transformer que incorpora sesgo posicional relativo, lo que permite procesar secuencias de audio de duracion variable. Sobre esa base, el modelo original `imenba6/wavlm-large-fr-phoneme-recognition` anade una cabeza de clasificacion que proyecta cada trama sobre un vocabulario de 39 fonemas IPA, de modo que la salida no es una transcripcion de texto sino una etiqueta fonetica por trama.

Esta version concreta no reentrena el modelo: es una conversion de pesos a ONNX. La unica modificacion documentada respecto del modelo base es la representacion numerica: los pesos se guardan en float16 para reducir el tamano del repositorio (0,6 GB), pero las operaciones se ejecutan en float32 porque, segun el autor, el calculo en float16 provocaba confusiones en vocales. No se especifican en la informacion disponible el numero de tokens de audio usados en el entrenamiento original, la composicion del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO.

## Capacidades

- Reconocimiento de fonemas en frances: clasifica cada trama de audio en una de las 39 clases foneticas IPA del modelo original.
- Salida densa por trama: al devolver logits con forma (1, tramas, 39) en lugar de una unica etiqueta global, permite alineacion temporal y deteccion de segmentos concretos, no solo una transcripcion agregada.
- Ejecucion en el navegador: el formato ONNX con pesos float16 esta pensado para `onnxruntime-web` con WebGPU, lo que habilita inferencia local en el cliente.
- Ejecucion en servidor o escritorio: al ser un grafo ONNX estandar, puede ejecutarse con `onnxruntime` en Python, C++ o Java.
- Entrada de audio de duracion variable: la forma (1, T) admite audios de distinta longitud, limitados por la memoria disponible en el dispositivo.
- Capacidades multilingues: no disponibles; el modelo esta orientado al frances.
- Tool calling o function calling: no disponible, no es un modelo de lenguaje generativo.
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Vision, audio de entrada a texto natural, modo thinking: no disponibles.

## Casos de uso

- Evaluacion de pronunciacion en aplicaciones de aprendizaje de frances: comparando la secuencia de fonemas reconocida con la secuencia esperada de una frase objetivo se pueden identificar que fonemas ha pronunciado mal el estudiante y en que instante del audio ocurre.
- Ejecucion local en el navegador sin servidor: al estar exportado a ONNX y disenado para WebGPU, permite integrar la correccion de pronunciacion en una aplicacion web sin enviar el audio del usuario a una infraestructura externa, lo que reduce costes y mejora la privacidad.
- Terapia del habla y logopedia: la salida por trama facilita el seguimiento de la articulacion a lo largo del tiempo, util para observar progresos en pacientes que trabajan un fonema concreto.
- Anotacion y etiquetado de corpus orales: sirve como preanotador automatico de transcripciones foneticas que despues se revisan manualmente, reduciendo el coste de construir datasets de habla en frances.
- Control de calidad de datasets de voz: al detectar la secuencia fonetica real de una grabacion se pueden filtrar audios mal pronunciados, con ruido o que no corresponden al texto previsto.
- Evaluacion de sistemas de sintesis de voz (TTS): permite verificar si el audio generado contiene realmente los fonemas que el front-end grafema-fonema habia planificado, cerrando el bucle de validacion del pipeline.
- Busqueda fonetica en archivos de audio: convirtiendo el audio a una secuencia de fonemas se pueden indexar grabaciones por como suenan y no por su transcripcion ortografica.
- Analisis linguistico y estudio de acentos o variantes regionales: la comparacion de secuencias foneticas entre hablantes permite cuantificar diferencias de realizacion en corpus de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tasas de error de fonemas (PER), exactitud por clase, F1 ni comparaciones con otros sistemas, y tampoco se documentan latencias o throughput medidos.

## Requisitos de hardware

- Estimacion de VRAM a partir del tamano del repositorio (0,6 GB con pesos en float16): del orden de 1 a 2 GB para pesos y estados intermedios en audios cortos, con consumo adicional proporcional a la duracion del audio y a la longitud de la secuencia de tramas.
- GPU de consumo: el modelo cabe con holgura en tarjetas como RTX 3060, RTX 4060 o superiores; el cuello de botella esperado es la duracion del audio, no el tamano de los pesos.
- GPU de centro de datos: A100, H100 o L40S no son necesarias para inferencia individual; solo tendrian sentido para procesamiento por lotes a gran escala.
- CPU: viable con `onnxruntime` en modo CPU para audios cortos, aunque sin la aceleracion de WebGPU o CUDA.
- Navegador: es el escenario objetivo declarado por el autor, mediante `onnxruntime-web` con WebGPU; en equipos sin WebGPU habria que recurrir al backend WASM, con rendimiento notablemente inferior.
- Opciones de despliegue: `onnxruntime-web`, `onnxruntime` (Python, C++, Java), y para el modelo original en PyTorch, la libreria `transformers`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a encoders de audio de este tipo.
- Latencia y throughput: no disponibles; dependen del backend, del hardware y de la duracion del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Ejecucion en navegador |
|---|---|---|---|---|---|
| `Ambroise2/prononciation-wavlm-fr-onnx` | No disponible (base WavLM-large, del orden de 300 M) | No disponible (audio de duracion variable) | MIT | ONNX, pesos float16 | Si, `onnxruntime-web` con WebGPU |
| `imenba6/wavlm-large-fr-phoneme-recognition` (modelo base) | No disponible (WavLM-large) | No disponible | MIT | Pesos PyTorch (safetensors/bin no confirmado en la informacion disponible) | No declarado |
| Otros reconocedores de fonemas en frances | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y via de ejecucion.

## Limitaciones y advertencias

- Cobertura linguistica limitada al frances; no hay evidencia de soporte para otros idiomas ni de deteccion de idioma.
- El vocabulario de salida tiene 39 clases IPA, por lo que la granularidad fonetica esta acotada y pueden agruparse o confundirse realizaciones que en un inventario mas amplio serian distintas.
- El propio autor advierte que calcular en float16 hacia que "basculasen" vocales, de ahi el uso de calculo en float32; cualquier conversion propia a precisiones menores puede degradar la exactitud en vocales.
- La entrada debe respetar exactamente el formato declarado: mono, 16 kHz y normalizacion con media 0 y varianza 1. Un preprocesado distinto degradara los resultados sin aviso explicito.
- Riesgo de alucinacion en el sentido habitual de los modelos generativos: no aplica, pero si puede producir secuencias de fonemas plausibles cuando el audio es ruidoso, esta en otro idioma o no contiene habla.
- No se han publicado metricas de error fonetico, comparaciones ni validaciones independientes; el repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- Licencia MIT, que permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la licencia. Conviene verificar igualmente las condiciones del modelo base al redistribuir derivados.
- El repositorio ocupa 0,6 GB, una descarga considerable para un contexto web; en dispositivos moviles o con poca memoria el backend WebGPU puede no estar disponible o agotar la memoria.
- No se declara soporte de streaming ni de procesamiento incremental: la inferencia se plantea sobre un audio completo de forma (1, T).
- No hay informacion sobre sesgos del modelo base en cuanto a acentos, genero, edad o variedades regionales del frances.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ambroise2/prononciation-wavlm-fr-onnx
- Modelo base: https://huggingface.co/imenba6/wavlm-large-fr-phoneme-recognition
- ONNX Runtime (incluye `onnxruntime-web`): https://github.com/microsoft/onnxruntime
