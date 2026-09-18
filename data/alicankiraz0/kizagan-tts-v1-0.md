# AlicanKiraz0/Kizagan-TTS-v1.0

## Resumen

Kizagan-TTS-v1.0 (Kızagan) es un modelo de sintesis de voz (text-to-speech) en turco desarrollado por Alican Kiraz como adaptacion del modelo VoxCPM2 de OpenBMB. Se distribuye como un ajuste fino de un unico hablante sobre un corpus turco privado, con los adaptadores LoRA ya fusionados en los pesos finales, de modo que puede cargarse directamente sin aplicar ningun adaptador adicional. Genera audio mono a 48 kHz y admite clonacion de voz por referencia, es decir, condiciona la sintesis a una grabacion WAV limpia que se aporta en tiempo de inferencia sin reentrenar el modelo.

Tecnicamente parte de un backbone de tipo modelo de lenguaje combinado con un decodificador DiT (diffusion transformer), sobre el que se aplico un LoRA de rango 64 y alpha 64 en las proyecciones de atencion del LM y del DiT. El checkpoint publicado corresponde al paso 1500 de entrenamiento, ya evaluado por el autor, y suma 2.290.004.544 parametros (~2,29 mil millones) en BF16, con un repositorio de 5,0 GB en formato safetensors.

Su relevancia es acotada pero concreta: cubre el hueco de TTS de alta frecuencia de muestreo especificamente en turco, un idioma poco representado en los modelos TTS multilingues abiertos, y lo hace bajo licencia Apache 2.0, lo que permite uso comercial sin las restricciones habituales de otros sistemas de sintesis con clonacion de voz. El contrapeso es que se trata de una adaptacion de un solo hablante y que la evaluacion publicada es de escucha limitada, no un benchmark reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (modelo de lenguaje + decodificador DiT); adaptacion LoRA r=64, alpha=64 en proyecciones de atencion de LM y DiT, fusionada en los pesos |
| Parametros totales | 2.290.004.544 (~2,29 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en BF16 (no se documentan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de salida | mono, 48 kHz |
| Modelo base | openbmb/VoxCPM2 |
| Checkpoint de origen | AlicanKiraz0/Kizagan-TTS-step_1500 (revision 458112a0fc3d850de38951796290e48ef710bc26) |
| Dataset de ajuste | AlicanKiraz0/TR-Voice-TTS (corpus turco mono-hablante, privado) |
| Libreria | voxcpm |
| Tamano del repositorio | 5,0 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de VoxCPM2, que combina un componente de modelado de lenguaje con un decodificador DiT encargado de generar la representacion acustica. Sobre esa base, el autor aplico un ajuste fino con LoRA de rango 64 y alpha 64 restringido a las proyecciones de atencion tanto del LM como del DiT, empleando un corpus turco mono-hablante privado (AlicanKiraz0/TR-Voice-TTS). El resultado publicado es el paso 1500 del entrenamiento, con los adaptadores ya fusionados en los pesos completos, lo que simplifica el despliegue: no hay que aplicar el adaptador antiguo por separado.

La model card es explicita sobre los limites de la trazabilidad: el manifiesto de fusion original registra la instantanea del modelo base y los ajustes de mezcla, pero el manifiesto de entrada del entrenamiento y el estado del optimizador no se recuperaron durante la evaluacion, por lo que el autor no reclama una reproduccion independiente del entrenamiento. Tampoco se redistribuyen las grabaciones del dataset ni los archivos de respuestas de oyentes. El pipeline de inferencia empaquetado fija CFG 2.0, 16 pasos de difusion y semilla 42, desactiva la compilacion, el denoising y los reintentos automaticos, y concatena el PCM generado sin anadir silencio, recortar, aplicar fundidos cruzados ni alterar la velocidad.

En cuanto a innovaciones destacables, el modelo admite dos modos de condicionamiento: clonacion solo por referencia de audio (el script empaquetado usa unicamente el WAV de referencia) y clonacion por referencia mas su transcripcion, heredada de la API de VoxCPM2. La generacion larga se maneja mediante un fichero de frases, una locucion completa por linea, manteniendo el orden y reutilizando la misma referencia para cada linea con una cache reconstruida por locucion.

## Capacidades

- Sintesis de voz en turco a partir de texto, con salida mono a 48 kHz y 16 bits en BF16 durante la generacion.
- Clonacion de voz por referencia: acepta un WAV mono limpio y genera texto nuevo condicionado a esa grabacion, sin reentrenar ni modificar los pesos.
- Clonacion con transcripcion: modo avanzado que combina audio de referencia (`reference_wav_path`), audio de estilo o habla (`prompt_wav_path`) y su transcripcion (`prompt_text`), heredado de la API de VoxCPM2.
- Generacion de texto largo mediante fichero de frases, con una locucion natural por linea y preservacion del orden de las lineas.
- Inferencia por frase unica mediante el parametro `--text`, pensada para respuestas cortas.
- Escritura de artefactos de salida: `audio.wav` concatenado, ficheros `sentence_*.wav` individuales y un `metrics.json` por ejecucion.
- Capacidad de emocion y estilo: la model card menciona un apartado de emocion/estilo, aunque el extracto disponible queda truncado y no detalla su alcance.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni agentes, ya que se trata de un modelo exclusivamente de sintesis de voz.
- No se documenta capacidad de vision ni de audio de entrada mas alla del WAV de referencia para la clonacion.

## Casos de uso

- Atencion al cliente automatizada en turco: el modelo permite construir un agente de voz que responda con locuciones naturales de 48 kHz, usando una grabacion de referencia corporativa como voz de marca. La generacion por texto y la salida por fichero facilitan integrarlo en un backend que sintetice cada respuesta del sistema.
- Audiolibros y contenido editorial en turco: la generacion por fichero de frases (`--sentences-file`) esta pensada para texto largo, con una locucion por linea y sin insercion automatica de silencios, lo que da control manual sobre las pausas y evita el recorte o el cambio de velocidad.
- Sistemas de respuesta interactiva de voz (IVR): la inferencia rapida por frase unica permite sintetizar menus y confirmaciones cortas con una voz consistente, manteniendo la misma referencia en todas las llamadas.
- Accesibilidad y lectura de pantalla: conversion de contenido textual turco a voz de alta calidad para personas con discapacidad visual, con la ventaja de una licencia Apache 2.0 que permite distribuir la aplicacion sin ataduras de licencia adicionales.
- Doblaje y localizacion de contenido al turco: la clonacion por referencia permite aproximar una voz objetivo a partir de una muestra, util en proyectos de video o e-learning donde se necesita una voz coherente a lo largo de varias piezas.
- Prototipado de asistentes de voz y pruebas de UX: los ingenieros pueden generar muestras rapidamente para validar guiones, tono y ritmo antes de contratar una locucion profesional, gracias a la instalacion sencilla via la libreria `voxcpm` y a la salida WAV directa.
- Generacion de avisos y notificaciones personalizadas: mensajes automatizados con nombre y contenido variable en turco, donde la coherencia de la voz entre mensajes se mantiene reutilizando la misma referencia de audio.
- Preservacion o recreacion de una voz concreta con fines documentales, siempre que se cuente con autorizacion explicita del hablante, dado que el modelo acepta cualquier grabacion de referencia en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe una evaluacion de escucha por parte del autor (con un apartado de emocion/estilo que aparece truncado en el extracto consultado) y un chequeo de humo de validacion, pero no incluye cifras de MMLU, WER, MOS ni metricas objetivas comparables.

El unico dato cuantitativo de generacion disponible es el chequeo de humo del comando empaquetado, ejecutado el 7 de septiembre de 2026 sobre CUDA con dos locuciones de entrada:

| Prueba | Resultado |
|---|---|
| Chequeo de humo CUDA (dos locuciones) | 3,36 segundos de audio a 48 kHz, sin fallo de limite de longitud |
| Numero de locuciones de entrada | 2 |
| CFG / pasos de difusion / semilla | 2.0 / 16 / 42 |

Este chequeo verifica que el comando de inferencia funciona; el autor lo distingue explicitamente del benchmark de desarrollo anterior al lanzamiento.

## Requisitos de hardware

- VRAM estimada: al menos 6-8 GB para inferencia en BF16, considerando los ~4,6 GB de pesos (2,29 mil millones de parametros a 2 bytes), mas el decodificador de audio, la cache de referencia y los buffers de generacion. El repositorio ocupa 5,0 GB en disco.
- GPU validadas por el autor: el entorno de referencia usa Linux con GPU NVIDIA CUDA y Python 3.12, con ruedas PyTorch/torchaudio de CUDA 13.0. No se enumeran modelos concretos de GPU.
- GPU recomendadas por rango de VRAM: cualquier NVIDIA con 8 GB o mas. En gama de consumo encajan RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En gama profesional, A100, H100 y similares aportan margen sobrado pero no son necesarias para un modelo de 2,29 mil millones de parametros.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas de VRAM. No se documenta ejecucion en CPU ni en Apple Silicon.
- Opciones de despliegue: la via oficial es la libreria `voxcpm` instalada desde el repositorio de GitHub de OpenBMB (revision f772e498a45fbb5fb8e13fbf9b9c48be9fe33e69) junto con `huggingface_hub==1.30.0`. No se documentan integraciones con vLLM, TGI, llama.cpp, Ollama ni ONNX Runtime, por lo que el despliegue en produccion dependera de envolver el script de PyTorch.
- Descarga: `hf download AlicanKiraz0/Kizagan-TTS-v1.0 --local-dir ./Kizagan-TTS-v1.0`, con autenticacion previa si el repositorio es privado.
- Latencia y throughput: no disponibles. La unica referencia temporal es que el chequeo de humo genero 3,36 segundos de audio con 16 pasos de difusion y CFG 2.0, sin que se registre el tiempo de pared empleado. El autor advierte que los tiempos y la salida pueden variar segun hardware, drivers y versiones de paquetes.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks para establecer una comparativa de rendimiento. La tabla siguiente recoge unicamente lo documentado en la informacion proporcionada, y marca como "no disponible" todo aquello que no puede confirmarse.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kizagan-TTS-v1.0 | 2,29 mil millones | no disponible | turco | Apache 2.0 | HuggingFace, 410 descargas, 42 likes |
| openbmb/VoxCPM2 (modelo base) | no confirmado en la informacion (el ajuste fusionado conserva la arquitectura del base) | no disponible | no disponible | no disponible en la informacion | HuggingFace, repositorio publico de OpenBMB |
| Otros sistemas TTS turcos o multilingues con clonacion | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la informacion proporcionada no incluye especificaciones del modelo base VoxCPM2 (parametros, contexto, licencia ni idiomas), por lo que no es posible comparar ambos de forma cuantitativa. Tampoco se aportan resultados de WER, MOS ni similitud de hablante de ningun sistema alternativo, de modo que cualquier comparacion de calidad seria especulativa.

## Limitaciones y advertencias

- Alucinacion y errores de pronunciacion: el modelo no resuelve automaticamente abreviaturas turcas, numeros ni limites de frase ambiguos. El autor recomienda escribir los numeros tal y como deben pronunciarse y mantener cada linea como una locucion natural.
- Dependencia de la segmentacion manual: `--text` es una sola llamada y no divide automaticamente un parrafo. Para respuestas largas hay que preparar un fichero de frases con los cortes ya decididos, lo que traslada al integrador la responsabilidad sobre las pausas y la prosodia.
- Sesgo de hablante: el ajuste se hizo sobre un corpus mono-hablante turco y la evaluacion de escucha registrada uso ese mismo hablante. Por tanto, no hay evidencia de similitud de clonacion para hablantes, acentos o idiomas distintos al del corpus.
- Clonacion no garantizada fuera de dominio: la API acepta grabaciones de otros hablantes, pero la similitud de voz, la adherencia al estilo y la inteligibilidad deben verificarse con escucha propia en cada caso.
- Cobertura limitada a un idioma: solo se declara turco (tr). No hay soporte documentado de otros idiomas, ni de cambio de codigo dentro de una misma locucion.
- Trazabilidad incompleta del entrenamiento: el manifiesto de entrada del entrenamiento y el estado del optimizador no se recuperaron, y el autor no reclama una reproduccion independiente. Esto dificulta auditar la composicion exacta de los datos usados.
- Datos no redistribuidos: las grabaciones del dataset y los archivos de respuestas de oyentes no se incluyen en el repositorio, lo que limita la verificacion externa de la evaluacion.
- Ausencia de benchmarks publicos: no hay metricas objetivas reproducibles (WER, MOS, similitud de hablante) en la informacion disponible, mas alla del chequeo de humo de 3,36 segundos.
- Riesgo de uso indebido de la clonacion de voz: la licencia Apache 2.0 permite uso comercial, pero la clonacion por referencia exige consentimiento explicito del hablante y cumplimiento de la normativa aplicable sobre derechos de imagen y voz. El modelo no incorpora mecanismos tecnicos de consentimiento ni marcas de agua documentadas.
- Rendimiento no determinista entre entornos: el autor advierte que la salida y los tiempos varian segun hardware, drivers y versiones de paquetes; los comandos de instalacion no fijan todas las dependencias transitivas.
- Compatibilidad de despliegue limitada: al depender de la libreria `voxcpm` desde una revision concreta de GitHub, la integracion en stacks de servidores de inferencia estandar no esta cubierta por documentacion oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlicanKiraz0/Kizagan-TTS-v1.0
- Modelo base VoxCPM2 (OpenBMB): https://huggingface.co/openbmb/VoxCPM2
- Checkpoint de origen del ajuste: https://huggingface.co/AlicanKiraz0/Kizagan-TTS-step_1500
- Dataset de ajuste: https://huggingface.co/datasets/AlicanKiraz0/TR-Voice-TTS
- Repositorio de VoxCPM en GitHub: https://github.com/OpenBMB/VoxCPM
- Manifiesto de fusion: merge_manifest.json (incluido en el repositorio del modelo)
- Muestra de audio del chequeo de humo: examples/quickstart.wav (incluida en el repositorio)
- Registro de validacion del lanzamiento: evaluation/release_smoke.json (incluido en el repositorio)
- Referencia arXiv indicada en las etiquetas del modelo: arXiv:2606.06928 (no verificada en la informacion disponible)
- Referencia arXiv indicada en las etiquetas del modelo: arXiv:2509.24650 (no verificada en la informacion disponible)
