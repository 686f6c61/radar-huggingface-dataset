# per2021/whisper-large-v3-ca-punctuated-mlx

## Resumen

Whisper large-v3 ca-punctuated MLX es una conversion al formato MLX del modelo de reconocimiento automatico del habla (ASR) BSC-LT/whisper-large-v3-ca-punctuated-3370h, publicado por el usuario per2021. El modelo original es un ajuste fino de openai/whisper-large-v3 realizado por el Barcelona Supercomputing Center (BSC) sobre audio en catalan con puntuacion, y esta version unicamente cambia el formato de los pesos para que puedan ejecutarse sobre la GPU unificada de los chips Apple Silicon mediante la libreria mlx-whisper. No se ha reentrenado ni podado nada: los pesos son los mismos, en float16.

El problema que resuelve es de infraestructura: hasta ahora cualquier usuario de Mac que quisiera este ajuste fino en MLX tenia que descargar los pesos en PyTorch y convertirlos a mano, con la complicacion anadida de que el modelo se publica como checkpoints fragmentados (pytorch_model-0000N-of-00002.bin) que el conversor oficial de Apple no lee directamente. Esta ficha documenta una version ya convertida, lista para consumir con una sola llamada a mlx_whisper.transcribe().

Es relevante en el nicho concreto de transcripcion de catalan en local sobre hardware Apple: al ser un large-v3 completo (no la variante turbo), prioriza exactitud sobre velocidad, y sus transcripciones conservan interrogantes, comas y mayusculas en lugar de salir normalizadas. La licencia Apache 2.0 se hereda del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper) |
| Parametros totales | 1550 millones (arquitectura large-v3 del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio fija de 30 segundos por inferencia; contexto de decodificacion de hasta 448 tokens |
| Tipos de cuantizacion | float16 unicamente (el repositorio publica pesos en float16; no se distribuyen variantes GGUF ni cuantizadas en 4/8 bits) |
| Idiomas soportados | catalan (ca) como idioma objetivo del ajuste fino; el modelo base Whisper large-v3 es multilingue, pero este ajuste esta especializado en ca |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (weights.safetensors en float16), repositorio de 3,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3 de OpenAI: un transformer encoder-decoder con entrada de espectrograma mel y salida autoregresiva de tokens de texto. El encoder consume una ventana fija de 30 segundos de audio y el decoder genera la transcripcion; Whisper no usa un contexto largo deslizante, sino que trocea el audio en ventanas de 30 segundos, de modo que el coste por emision no depende de la duracion real del habla. Esta version concreta no introduce cambios arquitectonicos: es una conversion de formato.

En cuanto al entrenamiento, el ajuste fino lo realizo el Barcelona Supercomputing Center partiendo de openai/whisper-large-v3. El nombre del modelo indica 3370 horas de datos; la model card original describe el corpus como audio puntuado, lo que explica que las transcripciones incluyan signos de interrogacion, comas y uso de mayusculas en lugar de texto normalizado. No se dispone de informacion sobre la composicion detallada del dataset, el uso de RLHF/DPO ni el numero de tokens de entrenamiento en la informacion proporcionada. La conversion a MLX se hizo fusionando primero los shards en un unico safetensors en float16 (aproximadamente 3 GB), ejecutando despues el script convert.py de mlx-examples y renombrando model.safetensors a weights.safetensors, que es el nombre que espera mlx-whisper.

## Capacidades

- Transcripcion de voz a texto en catalan, con salida puntuada (comas, interrogantes y mayusculas) en lugar de texto normalizado.
- Traduccion y transcripcion multilingue heredadas del modelo base Whisper large-v3, aunque la especializacion del ajuste fino es el catalan.
- Deteccion de idioma cuando no se fija el parametro language (comportamiento estandar de Whisper).
- Procesamiento de audio en ventanas de 30 segundos, con marcas de tiempo y segmentos devueltos por mlx_whisper (estructura de resultado con clave "text" y segmentos).
- Ejecucion en GPU de Apple Silicon mediante la libreria MLX, sin dependencia de CUDA.
- No se documenta soporte de tool calling, function calling, modo agente, vision ni audio generativo: es un modelo exclusivamente ASR.

## Casos de uso

- Transcripcion de reuniones y entrevistas en catalan sobre un Mac: se invoca mlx_whisper.transcribe() pasando el repositorio de HuggingFace y language="ca"; el modelo devuelve la transcripcion puntuada directamente, sin postprocesado de mayusculas ni signos.
- Subtitulado de contenido audiovisual en catalan: el resultado incluye segmentos con marcas de tiempo, lo que permite generar ficheros de subtitulos sin pasar por herramientas externas de puntuacion.
- Archivado y busqueda de audio corporativo o institucional: al ejecutarse en local sobre Apple Silicon, el audio no sale del equipo, lo que resulta adecuado para material con requisitos de confidencialidad.
- Investigacion en procesamiento del catalan: sirve como linea base reproducible para comparar con el modelo original en PyTorch o con el ajuste fino hermano de transcripciones normalizadas, manteniendo identicos los pesos.
- Prototipado rapido en portatiles Mac: al no requerir GPU dedicada ni CUDA, permite iterar en un portatil con memoria unificada suficiente sin aprovisionar infraestructura en la nube.
- Digitalizacion de entrevistas orales para corpus linguisticos: la salida puntuada reduce el trabajo de anotacion manual previo al analisis morfosintactico.
- Integracion en aplicaciones de escritorio macOS: al distribuirse como repositorio MLX de 3,1 GB, puede empaquetarse junto a la aplicacion y cargarse sin conversiones en tiempo de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion remite explicitamente a la evaluacion de la model card original (BSC-LT/whisper-large-v3-ca-punctuated-3370h), medida sobre conjuntos de test en catalan, pero no se incluyen cifras en la informacion proporcionada. Tampoco se aportan datos de latencia, throughput en tiempo real ni consumo de memoria medidos.

## Requisitos de hardware

- VRAM estimada: los pesos en float16 ocupan aproximadamente 3 GB; con activaciones y buffers de inferencia, conviene disponer de 5-6 GB de memoria unificada libres.
- GPU compatibles: exclusivamente Apple Silicon (series M1, M2, M3 y M4), incluidos los modelos base, Pro, Max y Ultra. No es ejecutable en GPU NVIDIA ni AMD mediante MLX.
- Cabe en GPU de consumo: si, en cualquier Mac con memoria unificada de 8 GB o superior, aunque 16 GB dan un margen mas comodo para trabajar con otras aplicaciones abiertas.
- Opciones de despliegue: mlx-whisper (pip install mlx-whisper) es la via documentada. No se describe despliegue con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y tarea. Para PyTorch/CUDA habria que usar el modelo original BSC-LT.
- Latencia y throughput: no disponibles. La model card advierte unicamente que, al ser un large-v3 completo, es mas lento que whisper-large-v3-turbo, y que el coste por emision es constante porque siempre se procesa una ventana de 30 segundos independientemente de la duracion real del habla.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / runtime | Idioma objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| per2021/whisper-large-v3-ca-punctuated-mlx | 1550 M | MLX / mlx-whisper | Catalan, salida puntuada | Apache 2.0 | Conversion float16 de este repositorio, 3,1 GB |
| BSC-LT/whisper-large-v3-ca-punctuated-3370h | 1550 M | PyTorch (safetensors/bin fragmentados) | Catalan, salida puntuada | Apache 2.0 | Modelo original; requiere conversion manual para MLX |
| per2021/whisper-bsc-large-v3-cat-mlx | no disponible | MLX / mlx-whisper | Catalan, salida normalizada | no disponible | Ajuste fino hermano, tambien convertido a MLX |
| openai/whisper-large-v3 | 1550 M | PyTorch | Multilingue | Apache 2.0 | Modelo base sin ajuste fino en catalan |
| openai/whisper-large-v3-turbo | 809 M | PyTorch (y otras conversiones de la comunidad) | Multilingue | Apache 2.0 | Mas rapido que large-v3, segun la propia model card de esta conversion |

Los datos de rendimiento comparado (WER en catalan, velocidad relativa) no estan disponibles en la informacion proporcionada; la unica comparacion cualitativa aportada por el autor es la advertencia de que large-v3 es mas lento que turbo.

## Limitaciones y advertencias

- Es una conversion de formato, no un modelo nuevo: cualquier sesgo, alucinacion o limitacion del ajuste fino original se mantiene intacta.
- Riesgo de alucinacion inherente a Whisper, especialmente en tramos con silencio, ruido o audio musical, donde puede generar texto plausible que no corresponde a la senal.
- La ventana fija de 30 segundos implica que audios muy largos requieren troceado y pueden perder coherencia entre segmentos en los limites.
- Idioma: el ajuste fino esta orientado al catalan. Aunque el modelo base es multilingue, no se garantiza un rendimiento equivalente en otras lenguas y no se aportan metricas al respecto.
- La puntuacion de salida no esta normalizada, lo que puede complicar su integracion en pipelines que esperan texto limpio sin signos ni mayusculas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo original; conviene verificar tambien las condiciones del corpus de 3370 horas empleado por el BSC.
- Dependencia de plataforma: solo funciona en Apple Silicon; no es desplegable en servidores con GPU NVIDIA, lo que limita su uso en produccion convencional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- El enlace al repositorio de scripts de conversion que aparece en la model card apunta a "https://github.com/" sin ruta concreta, por lo que no es reproducible tal cual.
- No se distribuyen pesos cuantizados ni variantes GGUF, de modo que no es posible reducir el consumo de memoria por debajo de float16 sin convertir uno mismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/per2021/whisper-large-v3-ca-punctuated-mlx
- Modelo base (ajuste fino del BSC): https://huggingface.co/BSC-LT/whisper-large-v3-ca-punctuated-3370h
- Modelo base original de OpenAI: https://huggingface.co/openai/whisper-large-v3
- Modelo hermano en MLX (transcripciones normalizadas): https://huggingface.co/per2021/whisper-bsc-large-v3-cat-mlx
- Libreria mlx-whisper: https://pypi.org/project/mlx-whisper/
- Script de conversion de Apple: https://raw.githubusercontent.com/ml-explore/mlx-examples/main/whisper/convert.py
- Repositorio mlx-examples: https://github.com/ml-explore/mlx-examples
- Repositorio de scripts citado en la model card: https://github.com/ (ruta incompleta en la informacion proporcionada)
- Organizacion del Barcelona Supercomputing Center: https://huggingface.co/BSC-LT

Nota: los resultados de la busqueda web proporcionados no guardan relacion con el modelo (contenido en hebreo sobre herramientas de corte), por lo que no se ha incorporado ningun dato de los mismos.
