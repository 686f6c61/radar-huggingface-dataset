# CDT5058/ear-stt

## Resumen

Ear es un modelo de reconocimiento automatico del habla (ASR) en ingles disenado especificamente para inferencia en dispositivo (on-device). Lo publica el autor CDT5058 en HuggingFace bajo licencia Apache 2.0 y su objetivo declarado es priorizar el tamano minimo por encima de la precision bruta: pesos en int8, sin tokenizer ni fichero de vocabulario, frontend mel calculado en el host, decodificador CTC voraz, modos de fallo publicados y benchmarks honestos.

La arquitectura es un TinyConformer-CTC con 9 bloques, dimension d=256 y 4 cabezas de atencion, con un total de 15,58 millones de parametros. El artefacto principal que se distribuye pesa 15,08 MB en int8 y se ejecuta unicamente con onnxruntime y numpy, sin necesidad de PyTorch en tiempo de inferencia. La cuantizacion a int8 es sin perdida segun el autor: 0,0 puntos porcentuales de regresion en WER respecto a fp32.

El modelo es relevante porque cubre el nicho de la transcripcion de voz en ingles en entornos con recursos muy limitados (moviles, dispositivos embebidos, navegador o microcontroladores con Linux) donde un modelo tipo Whisper resulta demasiado grande. Su WER declarado sobre LibriSpeech test-clean es del 8,6 por ciento, lo que lo situa lejos de los modelos state of the art pero dentro de un rango util para dictado y comandos cuando el tamano es la restriccion critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyConformer-CTC (9 bloques Pre-LN, d=256, 4 cabezas, kernel de convolucion 15, FFN 4x) |
| Parametros totales | 15,58 M (fp32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo CTC sobre frames de audio; no se declara limite maximo de duracion) |
| Tipos de cuantizacion | int8 (artefacto principal, sin perdida declarada), int4 groupwise grupo=64 (experimental, 9,66 MB) |
| Idiomas soportados | en (ingles unicamente) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (stt.onnx + stt.onnx.data), binario int8 propio (stt_int8.bin), checkpoint PyTorch fp32 (.pt) |

## Arquitectura y entrenamiento

El pipeline es puramente convolucional-atencional sobre representaciones mel. La onda de entrada a 16 kHz se convierte en un log-mel de 80 dimensiones con ventana de 25 ms y salto de 10 ms calculado en el host con constantes fijas. Despues, una convolucion Conv2d con subsampling 4x reduce la resolucion temporal a frames de 40 ms. El nucleo son 9 bloques Pre-LN ConformerBlock con d=256, 4 cabezas, kernel de convolucion 15 y FFN 4x. La salida pasa por una capa lineal a 29 clases CTC y se decodifica en el host con un decodificador CTC voraz.

Entre las decisiones de diseno destacables, el autor implementa las capas QKV como Linear manuales en lugar de usar nn.MultiheadAttention, de modo que cada matmul grande es cuantizable a int8. Ademas, la BatchNorm se pliega dentro de las convoluciones depthwise antes de la exportacion, por lo que la BN nunca aparece en el artefacto distribuido. El alfabeto es a nivel de caracter (29 simbolos: blank, espacio, a-z y apostrofo) y esta fijado en el codigo, lo que elimina ficheros BPE y de vocabulario. El decodificador CTC voraz cabe en unas 20 lineas de numpy, sin runtime de inferencia adicional.

Los datos de entrenamiento son LibriSpeech train-clean-460, que combina train-100 y train-360, aproximadamente 460 horas bajo licencia CC-BY-4.0. La model card termina en ese punto y no detalla composicion adicional del dataset, numero total de tokens, ni si hubo RLHF, DPO o alguna fase de refinamiento posterior al entrenamiento supervisado CTC.

## Capacidades

- Reconocimiento automatico del habla en ingles a partir de audio mono a 16 kHz.
- Salida de texto plano con alfabeto de 29 caracteres (sin puntuacion completa, sin mayusculas ni numeros explicitos, segun el alfabeto declarado).
- Decodificacion CTC voraz con umbral de confianza configurable: el codigo de ejemplo devuelve una etiqueta de incertidumbre cuando la confianza media cae por debajo de un umbral definido por el usuario.
- Inferencia en dispositivo puro: solo requiere onnxruntime y numpy, sin PyTorch.
- Ejecucion sobre CPU con un factor de tiempo real objetivo (RTF) inferior a 0,02.
- No soporta tool calling ni function calling.
- No esta disenado para uso como agente ni para razonamiento multi-paso.
- No dispone de capacidad multilingue: unicamente ingles.
- No incluye modo de pensamiento (thinking mode), vision ni audio generativo.

## Casos de uso

- Dictado y transcripcion local en aplicaciones de escritorio o moviles: al pesar 15,08 MB en int8 y no requerir PyTorch en inferencia, el modelo se puede empaquetar dentro de una app sin depender de servicios en la nube ni de conexion a internet.
- Comandos de voz en dispositivos embebidos o IoT: con un RTF objetivo inferior a 0,02 en CPU, puede ejecutarse en placas de gama baja para reconocer un vocabulario controlado de instrucciones en ingles.
- Subtitulado en tiempo real de audio en ingles en el navegador: la carga de un binario int8 y un grafo ONNX permite ejecutar la inferencia con onnxruntime Web o en el cliente sin exponer el audio del usuario a un servidor.
- Preprocesado de grandes volumenes de audio en pipelines batch: para tareas donde se necesita un primer borrador de transcripcion a bajo coste y con un WER en torno al 8,6 por ciento en test-clean, antes de una revision humana o de un modelo mayor.
- Prototipado rapido y docencia: la simplicidad del decodificador CTC en numpy y la ausencia de tokenizer facilitan el estudio del pipeline completo ASR en un unico repositorio pequeno.
- Filtrado previo en sistemas de indexacion de audio: transcripcion aproximada para busqueda por palabras clave en archivos de voz en ingles, aceptando el margen de error del modelo a cambio de velocidad y bajo consumo de memoria.
- Fine-tuning sobre dominios especificos: el repositorio incluye un checkpoint PyTorch fp32 completo (ckpts/tongue-stt-latest-checkpoint.pt, unos 60 MB) para adaptar el modelo a jerga o acentos concretos con recursos limitados.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (marcados como no verificados):

| Dataset | Metrica | Valor |
|---|---|---|
| LibriSpeech test-clean | WER fp32 greedy | 8,6 % |
| LibriSpeech test-clean | WER int8 greedy | 8,6 % |
| LibriSpeech test-clean (utterances <= 3 s) | WER fp32 | 12,5 % |
| LibriSpeech test-clean | WER int4 groupwise (grupo=64, experimental) | 9,7 % |

La model card declara una regresion de 0,0 puntos porcentuales al pasar de fp32 a int8 (cuantizacion sin perdida) y de 1,1 puntos porcentuales en el caso de int4 experimental. No se han facilitado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto, ya que se trata de un modelo de reconocimiento de voz. La model card menciona comparaciones con Whisper, pero no se incluyen cifras concretas de esas comparaciones en la informacion disponible.

## Requisitos de hardware

- El artefacto int8 ocupa 15,08 MB, por lo que la VRAM necesaria para inferencia es muy reducida y en la practica no condiciona el despliegue (estimacion coherente con el tamano del modelo, no un dato declarado por el autor).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4090, e incluso en iGPU integradas y en CPU exclusivamente.
- Esta pensado para ejecucion en CPU con onnxruntime (CPUExecutionProvider) y no requiere GPU.
- No se declaran GPUs concretas de datacenter (A100, H100) como objetivo; su uso seria desproporcionado para un modelo de este tamano.
- Opciones de despliegue: onnxruntime (Python, C++, movil o Web) con decodificador propio en numpy; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI porque el caso de uso es ASR ligero, no generacion de texto.
- Latencia declarada: 3,2 ms por utterance en GPU; en CPU el objetivo es un RTF inferior a 0,02 (es decir, procesar 1 segundo de audio en menos de 20 ms).
- Throughput: no disponible (no se proporcionan cifras de utterances por segundo).

## Comparativa con modelos similares

La model card menciona una comparacion con Whisper, pero no incluye cifras concretas en la informacion disponible. Por tanto, la comparacion cuantitativa no esta disponible. A continuacion se resume lo unico contrastable con los datos aportados:

| Aspecto | Ear (CDT5058) | Alternativas (Whisper y similares) |
|---|---|---|
| Parametros | 15,58 M | no disponible en la informacion proporcionada |
| Tamano del artefacto | 15,08 MB int8 | no disponible en la informacion proporcionada |
| Contexto / duracion maxima | no disponible | no disponible en la informacion proporcionada |
| WER test-clean | 8,6 % (declarado, no verificado) | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 | no disponible en la informacion proporcionada |
| Idiomas | en | segun el modelo comparado, no disponible |

No se dispone de datos suficientes para establecer una comparativa numerica fiable con modelos de la misma categoria.

## Limitaciones y advertencias

- La model card reconoce explicitamente que el modelo prioriza el tamano minimo por encima de la precision bruta, por lo que su WER del 8,6 por ciento esta lejos del estado del arte.
- El alfabeto de 29 simbolos (blank, espacio, a-z y apostrofo) implica que no genera mayusculas, numeros ni signos de puntuacion de forma nativa.
- Solo soporta ingles; cualquier otro idioma queda fuera de su alcance.
- El WER empeora hasta el 12,5 por ciento en utterances de 3 segundos o menos, un factor a tener en cuenta en aplicaciones con audio fragmentado (comandos cortos, por ejemplo).
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, acentos no vistos o vocabulario fuera del dominio de LibriSpeech; los resultados declarados provienen unicamente de test-clean, no de test-other.
- Los benchmarks del model-index estan marcados como no verificados (verified: false), por lo que deben tomarse como datos declarados por el autor y no como resultados auditados de forma independiente.
- El artefacto int8 se distribuye en un formato binario propio que requiere cargar el cabecero JSON y reconstruir los pesos manualmente; no es un formato estandar de intercambio.
- El artefacto int4 es experimental y conlleva una perdida declarada de 1,1 puntos porcentuales de WER.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte y el modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que su adopcion real es inexistente.
- La model card esta incompleta: la seccion de entrenamiento se corta tras indicar el dataset, sin detallar hiperparametros, esquema de aumentacion de datos ni fases de ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CDT5058/ear-stt
- Dataset de entrenamiento (LibriSpeech ASR, OpenSLR): https://huggingface.co/datasets/openslr/librispeech_asr
- Repositorio del modelo (fichero model_lib.py y artefactos): https://huggingface.co/CDT5058/ear-stt/tree/main
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos asociados al modelo.
