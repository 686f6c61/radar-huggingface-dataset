# emircansevdi/Kahya-TTS-v1.0-GGUF

## Resumen

Kahya-TTS-v1.0-GGUF es la version cuantizada en formato GGUF de un modelo de sintesis de voz (text-to-speech) en turco, publicada por el usuario emircansevdi. El modelo deriva de AlicanKiraz0/Kahya-TTS-v1.0, un ajuste fino mediante LoRA (rank 64, alpha 64) sobre proyecciones de atencion del LM y del modulo DiT del modelo base openbmb/VoxCPM2. Esta adaptacion concreta se limita a convertir los pesos fusionados a GGUF para poder ejecutarlos con el fork llama.cpp-omni mediante la herramienta de linea de comandos `voxcpm2-cli`, sin necesidad de aplicar de nuevo el adaptador LoRA.

El modelo cuenta con 912.440.644 parametros (unos 912 M) segun los datos de safetensors, un tamano que lo situa en la gama media de los sistemas TTS neuronales actuales y que permite ejecucion en CPU o en GPU de gama consumer. La salida es audio mono a 48 kHz y el unico idioma declarado es el turco, con un corpus de entrenamiento privado de un unico hablante (AlicanKiraz0/TR-Voice-TTS). El repositorio ocupa 6,8 GB y separa los pesos en dos archivos GGUF: `Kahya-BaseLM-F16.gguf` y `Kahya-Acoustic-F16.gguf`.

Su relevancia es de nicho: cubre la sintesis de voz en turco dentro del ecosistema GGUF/llama.cpp, un idioma con menos recursos que el ingles o el castellano en el ambito TTS. Hay que tener en cuenta que el repositorio no registra descargas ni "likes" en el momento de redactar esta ficha y que no se han publicado resultados de evaluacion asociados a esta cuantizacion concreta, por lo que su validacion practica todavia es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (sintesis de voz); pesos divididos en dos componentes, BaseLM y Acoustic, segun los archivos GGUF publicados |
| Parametros totales | 912.440.644 (~912 M), dato de safetensors |
| Parametros activos | No aplica (no se documenta una arquitectura de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF; los unicos archivos documentados son F16 (`Kahya-BaseLM-F16.gguf` y `Kahya-Acoustic-F16.gguf`). No se documentan otras cuantizaciones |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo original se distribuye en safetensors) |
| Frecuencia de muestreo de salida | 48 kHz, mono |
| Precision de inferencia en el modelo original | BF16 |
| Tamano del repositorio | 6,8 GB |
| Pipeline declarado | text-to-speech |
| Modelo base | openbmb/VoxCPM2; ajuste sobre AlicanKiraz0/Kahya-TTS-v1.0 |

## Arquitectura y entrenamiento

La informacion disponible indica que la arquitectura subyacente es VoxCPM2, el modelo de sintesis de voz de OpenBMB. Los pesos publicados en este repositorio estan divididos en dos artefactos, `BaseLM` y `Acoustic`, lo que sugiere una separacion entre un componente de modelado de lenguaje (probablemente el encargado de la alineacion texto-fonema y de la prediccion de representaciones intermedias) y un componente acustico basado en DiT (diffusion transformer) que genera la forma de onda o las representaciones vocales finales. No se dispone de detalles adicionales sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni tipo de decodificador empleados en VoxCPM2.

El entrenamiento partio del checkpoint openbmb/VoxCPM2 y aplico un ajuste fino con LoRA de rango 64 y alpha 64 sobre las proyecciones de atencion tanto del LM como del DiT. El adaptador se fusiono posteriormente en los pesos completos y se publico como AlicanKiraz0/Kahya-TTS-v1.0 (paso de checkpoint 1500). Los datos empleados corresponden al corpus privado AlicanKiraz0/TR-Voice-TTS, descrito como un corpus turco de un unico hablante. No se detalla el numero de horas de audio, la composicion exacta del dataset ni si se aplicaron etapas de RLHF, DPO u optimizacion por preferencias; tampoco se documenta la estrategia de decodificacion en inferencia mas alla del uso de BF16 y una salida mono a 48 kHz.

## Capacidades

- Sintesis de voz en turco a partir de texto, con salida en audio mono a 48 kHz.
- Voz unica: el corpus de entrenamiento es de un solo hablante, por lo que el timbre resultante corresponde a esa voz.
- Generacion de audio en formato WAV mediante la CLI `voxcpm2-cli` del proyecto llama.cpp-omni.
- Ejecucion en CPU, CUDA, Vulkan y Metal (macOS), segun la documentacion de compilacion del proyecto.
- Carga directa de pesos fusionados: no es necesario reaplicar el adaptador LoRA original.
- No se documenta soporte de tool calling ni de function calling, algo esperable en un modelo de sintesis de voz.
- No se documenta capacidad de agentes ni de razonamiento multi-paso.
- No se documenta clonacion de voz a partir de muestras del usuario.
- No se documenta capacidad multilingue: el unico idioma declarado es el turco.
- No se documentan capacidades de vision, audio de entrada ni procesamiento de voz a voz.

## Casos de uso

- Lectura automatica de articulos y documentos en turco: el modelo convierte texto plano en audio a 48 kHz, adecuado para generar versiones escuchables de noticias, blogs o documentacion interna sin intervencion manual.
- Audiolibros y contenido largo en turco: al tratarse de un modelo de 912 M de parametros puede ejecutarse en local y por lotes, lo que permite narrar capitulos completos de forma reproducible y sin coste por caracter en servicios en la nube.
- Accesibilidad para personas con discapacidad visual: integrado en lectores de pantalla o en aplicaciones de asistencia, ofrece una voz turca natural para leer correos, mensajes y documentos ofimaticos.
- Asistentes de voz y altavoces inteligentes en turco: el modelo puede actuar como capa de sintesis final de un asistente conversacional, recibiendo el texto generado por un LLM y devolviendo audio.
- Sistemas de respuesta vocal interactiva (IVR) en telefonia: genera avisos y menus de atencion al cliente en turco, con la ventaja de poder desplegarse en servidores sin GPU dedicada gracias al soporte de CPU de llama.cpp-omni.
- Locucion para videos y material formativo: produccion de narraciones para cursos online, tutoriales o presentaciones corporativas en turco, con salida consistente al ser una voz unica.
- Generacion de datos sinteticos para entrenar sistemas de reconocimiento de voz (ASR) en turco: el audio generado puede servir para aumentar corpus de habla cuando no se dispone de grabaciones suficientes.
- Prototipado de productos de voz en local: al ejecutarse con llama.cpp-omni en macOS, Linux o Windows, permite iterar sobre interfaces de voz sin depender de APIs externas ni enviar texto a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye metricas objetivas (MOS, WER, similitud de hablante, RTF) ni comparaciones con otros sistemas TTS, y no se han encontrado datos adicionales en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en F16 suman aproximadamente 1,8 GB para los 912 M de parametros; con activaciones, buffers de audio y overhead de runtime, es razonable reservar entre 2 y 4 GB de VRAM. Es una estimacion derivada del numero de parametros, no un dato publicado.
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria, como una RTX 3050, RTX 3060, RTX 4060 o superiores. Para servir varias peticiones en paralelo, modelos como A100 o H100 no aportan ventaja significativa dado el tamano reducido del modelo, salvo por agregacion de concurrencia.
- Ejecucion en GPU consumer: si, cabe holgadamente en GPU de gama de entrada y media, e incluso en iGPU con soporte Vulkan.
- Ejecucion en CPU: si, el proyecto documenta explicitamente una compilacion solo CPU (`cmake -B build -DCMAKE_BUILD_TYPE=Release` sin backends de GPU) y un flag `--cpu` para forzar este modo.
- Aceleracion por plataforma: Metal en macOS, CUDA en Linux y Windows, y Vulkan como alternativa multiplataforma.
- Opciones de despliegue: llama.cpp-omni (fork especifico del proyecto, objetivo `voxcpm2-cli`). No se documenta soporte en vLLM, Ollama, TGI ni en otras herramientas de inferencia estandar.
- Latencia y throughput: no disponible. El repositorio no publica medidas de factor de tiempo real (RTF) ni de audio generado por segundo en ninguna plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| emircansevdi/Kahya-TTS-v1.0-GGUF (este) | 912 M | No disponible | Turco | Apache 2.0 | GGUF (F16) | Cuantizacion para llama.cpp-omni; 0 descargas y 0 likes |
| AlicanKiraz0/Kahya-TTS-v1.0 | No disponible (mismo origen, paso 1500) | No disponible | Turco | No disponible en la informacion proporcionada | safetensors | Modelo original con el adaptador LoRA fusionado |
| openbmb/VoxCPM2 | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | Modelo base de OpenBMB sobre el que se hizo el ajuste |
| Otras familias TTS abiertas (XTTS-v2, Kokoro, F5-TTS, Piper) | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada; se recomienda consultar cada ficha antes de comparar |

## Limitaciones y advertencias

- Una sola voz: el corpus de entrenamiento es de un unico hablante, por lo que no se puede elegir entre voces distintas ni asignar timbres diferentes a personajes.
- Un solo idioma: solo turco. El uso con texto en castellano, ingles u otros idiomas producira probablemente una pronunciacion incorrecta o inestable.
- Ausencia de evaluacion publica: no hay benchmarks, muestras comparativas ni validacion por parte de la comunidad; el repositorio registra 0 descargas y 0 likes.
- Dependencia de un fork especifico: la inferencia requiere llama.cpp-omni y el binario `voxcpm2-cli`, no la distribucion estandar de llama.cpp, lo que complica el mantenimiento y la integracion en produccion.
- Cuantizaciones limitadas: solo se documentan archivos F16, de mayor tamano (el repositorio ocupa 6,8 GB) y sin las ventajas de compresion de formatos como Q4 o Q8.
- Riesgo de artefactos acusticos: los modelos TTS pueden generar ruido, cortes, repeticiones o prosodia incorrecta ante textos con numeros, siglas, abreviaturas o puntuacion poco habitual; no se documenta ninguna estrategia de normalizacion de texto.
- Licencia de la cadena de derivacion: este repositorio es Apache 2.0, pero el uso comercial requiere revisar las licencias de openbmb/VoxCPM2 y del corpus AlicanKiraz0/TR-Voice-TTS, asi como los derechos de la persona cuya voz se utilizo en el entrenamiento.
- Uso indebido para suplantacion: como cualquier sistema TTS, puede emplearse para imitar la voz del hablante original en fraudes, llamadas fraudulentas o desinformacion. Conviene anadir marcas de agua o avisos de audio sintetico y respetar la normativa aplicable sobre contenidos generados.
- Sin soporte de clonacion ni de control emocional: no se documenta ninguna capacidad de transferencia de estilo, control de emocion ni clonacion con muestras del usuario.
- Datos incompletos en la ficha: no se especifican el contexto maximo de texto, el numero de horas del corpus, ni metricas objetivas de calidad, lo que dificulta estimar su comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emircansevdi/Kahya-TTS-v1.0-GGUF
- Modelo original ajustado: https://huggingface.co/AlicanKiraz0/Kahya-TTS-v1.0
- Checkpoint intermedio: https://huggingface.co/AlicanKiraz0/Kahya-TTS-step_1500 (revision 458112a0fc3d850de38951796290e48ef710bc26)
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Dataset de entrenamiento: https://huggingface.co/datasets/AlicanKiraz0/TR-Voice-TTS
- Implementacion upstream de VoxCPM: https://github.com/OpenBMB/VoxCPM
- Fork de llama.cpp para inferencia: https://github.com/tc-mb/llama.cpp-omni
- Informe tecnico de VoxCPM2: https://arxiv.org/abs/2606.06928
- Trabajo anterior sobre VoxCPM: https://arxiv.org/abs/2509.24650
