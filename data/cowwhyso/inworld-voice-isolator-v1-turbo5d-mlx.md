# cowWhySo/Inworld-Voice-Isolator-v1-Turbo5d-MLX

## Resumen

Inworld-Voice-Isolator-v1-Turbo5d-MLX es un port nativo para Apple Silicon del modelo de aislamiento de voz Turbo-5d, desarrollado por el usuario independiente cowWhySo sobre el trabajo original de Inworld. El modelo resuelve una tarea de audio-a-audio: separar la voz limpia del ruido de fondo en grabaciones, entregando audio mono a 48 kHz en float32. La relevancia de esta version concreta es que reimplementa toda la red en MLX (el framework de Apple para sus chips), eliminando la dependencia de PyTorch y consiguiendo una inferencia entre 1,5 y 1,7 veces mas rapida que la implementacion original sobre el backend MPS.

Arquitectonicamente no es un transformer puro: combina un encoder band-split con bloques de atencion y bloques Mamba (modelos de espacio de estados), y el port incluye un kernel Metal propio para el escaneo recurrente de las capas Mamba. El checkpoint tiene 49.911.816 parametros (aproximadamente 50 millones) y el repositorio ocupa 0,2 GB en safetensors. No se trata de un modelo de lenguaje: no procesa texto ni tiene ventana de contexto en tokens, sino que opera sobre muestras de audio en fragmentos de 8 segundos con crossfade de 2 segundos.

Es un proyecto de comunidad, no un producto de Inworld, y su utilidad practica esta acotada a Macs con chip Apple Silicon. La calidad del modelo subyacente (Turbo-5d) frente al original no esta demostrada de forma concluyente: la mejora media de SI-SDR es de +0,384 dB con un intervalo de confianza al 95% que cruza cero. Aun asi, el port esta verificado numericamente contra la implementacion de referencia en PyTorch con una coincidencia de unos 125 dB, lo que lo convierte en una alternativa tecnicamente solida para despliegues locales en macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: encoder band-split, bloques transformer (atencion en tiempo y banda) y bloques Mamba (SSM) |
| Parametros totales | 49.911.816 (aproximadamente 50 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio en fragmentos de 8 s con crossfade de 2 s) |
| Tipos de cuantizacion | No disponible (solo FP32; no se ha construido ni probado variante en media precision ni cuantizada) |
| Idiomas soportados | No disponible (el modelo base se evaluo, entre otros, con frances en su conjunto de test) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (identico byte a byte al checkpoint PyTorch del modelo base, renombrado) |
| Frecuencia de muestreo de salida | 48 kHz, float32, mono |
| Entrada aceptada | Cualquier frecuencia de muestreo y numero de canales (se remuestrea y se convierte a mono) |
| Libreria | MLX (probado con MLX 0.32.5) |
| Hardware objetivo | Apple Silicon con Metal |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es una red de mejora de voz que trabaja en el dominio espectral. La cadena de procesamiento incluye una STFT, un encoder band-split que reparte el espectro en bandas de frecuencia, una pila de bloques transformer con atencion sobre el eje temporal y sobre el eje de bandas (implementada con `mx.fast.scaled_dot_product_attention`), y bloques Mamba que modelan dependencias secuenciales mediante un modelo de espacio de estados. El decodificador reconstruye la senal limpia. Todo el codigo del port vive en un unico fichero, `turbo5d_mlx.py`, que lee la arquitectura desde el propio config del checkpoint.

La innovacion tecnica del port es el kernel Metal personalizado para el escaneo de estado de las capas Mamba: en lugar de construir un nodo de grafo por paso temporal, se lanza un hilo de GPU por secuencia y canal que mantiene los 16 estados en registros durante todo el escaneo. Se incluye un bucle puro en MLX como fallback con salida identica pero mucho mas lento. El audio largo se procesa en trozos de 8 segundos con crossfade de 2 segundos, el mismo esquema que la implementacion original.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o muestras, ni sobre si se aplicaron tecnicas de RLHF o DPO: esta version es un port de inferencia, no un reentrenamiento. El modelo base Turbo-5d, segun la model card, es una adaptacion (existe un repositorio LoRA asociado para reentrenamiento y auditoria) del Voice Isolator original de Inworld.

## Capacidades

- Aislamiento de voz: separa la voz hablada del ruido de fondo en grabaciones de audio, devolviendo voz limpia a 48 kHz.
- Extraccion del fondo: con la opcion `--background` guarda por separado el audio eliminado, util para inspeccion o reutilizacion.
- Acepta entrada heterogenea: cualquier frecuencia de muestreo y cualquier numero de canales, con remuestreo y downmix automaticos.
- Procesamiento de audio largo: gestiona ficheros de duracion arbitraria mediante fragmentacion en trozos de 8 s con crossfade de 2 s.
- Inferencia nativa en Apple Silicon sin PyTorch, con un unico fichero Python y dependencias minimas (mlx, numpy, soundfile, scipy, huggingface_hub).
- Uso programatico desde Python mediante la clase `VoiceIsolatorMLX` y funciones auxiliares (`load_mono_48k`, `resolve_weights`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de audio.
- No dispone de modo thinking, vision ni audio generativo; no es un modelo conversacional.

## Casos de uso

- Limpieza de grabaciones de podcast y entrevistas: el modelo elimina ruido de fondo (ventiladores, trafico, reverberacion) de una pista de voz y entrega un WAV a 48 kHz listo para mezcla, con procesamiento por trozos que permite tratar episodios completos en un Mac.
- Postproduccion de video en macOS: integrado en un script que recorra una carpeta de clips, aisla la voz de cada uno y sustituye la pista original, aprovechando que el port no requiere PyTorch ni GPU dedicada.
- Preprocesado para reconocimiento automatico del habla: pasar las grabaciones por el aislador antes de un ASR reduce el ruido de entrada y puede mejorar la transcripcion en entornos ruidosos, con la ventaja de que la salida es mono a 48 kHz, formato estandar para muchos pipelines.
- Reuniones y clases grabadas: limpiar audio de videoconferencias capturado con microfonos de portatil, donde el ruido de teclado y ambiente degrada la inteligibilidad, procesando el fichero completo en fragmentos de 8 s.
- Creacion de datasets de voz: extraer voz limpia de grabaciones de campo para entrenar o evaluar modelos de habla, usando la salida de fondo separada para auditar que se ha eliminado.
- Herramientas de accesibilidad y transcripcion en local: aplicaciones de macOS que necesiten mejorar audio sin enviar datos a la nube, dado que el modelo corre integramente en el dispositivo con unos 3 GB de memoria pico.
- Prototipado e investigacion en mejora de voz: el repositorio LoRA asociado y el codigo de un solo fichero permiten estudiar la arquitectura hibrida transformer-Mamba y adaptarla, con la salvedad de que el port solo cubre inferencia offline.

## Benchmarks y rendimiento

Rendimiento de inferencia medido en un Apple M4 Max, FP32, modo offline, mediana de 5 ejecuciones en caliente tras un calentamiento:

| Entrada sintetica 48 kHz | Original v1, PyTorch MPS | Turbo-5d, PyTorch MPS | Turbo-5d, MLX | MLX vs original | MLX vs PyTorch Turbo-5d |
|---|---:|---:|---:|---:|---:|
| 2 segundos | 0,189 s | 0,139 s | 0,126 s | 1,50x | 1,10x |
| 8 segundos | 0,874 s | 0,660 s | 0,518 s | 1,69x | 1,27x |
| 15 segundos | 2,662 s | 1,953 s | 1,549 s | 1,72x | 1,26x |

Verificacion de correctitud frente a la red PyTorch en CPU, float32:

| Entrada | Diferencia maxima por muestra | Coincidencia |
|---|---:|---:|
| 1 s de voz con ruido | 2,4e-7 | 125,8 dB |
| 3 s de voz con ruido | 3,0e-7 | 126,2 dB |
| 10,8 s de voz con ruido (dos trozos con crossfade) | 4,5e-7 | 125,1 dB |

Calidad del modelo base Turbo-5d frente al original: cambio medio de SI-SDR de +0,384 dB con intervalo de confianza al 95% de -0,451 a +1,272 dB (cruza cero); retrocede en ruido mixto de voz mas entorno, en frances dentro del conjunto de test y en STOI medio. No se han publicado resultados de benchmarks de calidad adicionales (MMLU, HumanEval, GSM8K y similares no aplican a este modelo).

## Requisitos de hardware

- Memoria pico en MLX: aproximadamente 1,2 GB para un clip de 2 s y unos 3,0 GB para clips de 8 s o mas.
- Hardware: exclusivamente Apple Silicon con soporte Metal; la ruta rapida no funciona en otras plataformas. No se ha probado en maquinas de 8 GB de RAM.
- GPU recomendadas: el rendimiento publicado corresponde a un M4 Max; chips mas pequenos o antiguos (M1, M2 base) seran mas lentos y la ventaja frente a PyTorch puede variar.
- No cabe ni esta pensado para GPU de consumo NVIDIA (RTX 4090, etc.); para Linux, Windows o NVIDIA debe usarse el checkpoint PyTorch del repositorio Turbo5d-Model.
- Despliegue: script CLI (`python turbo5d_mlx.py entrada.wav salida.wav`) o API Python con `VoiceIsolatorMLX`. No hay integracion documentada con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,126 s para 2 s de audio, 0,518 s para 8 s y 1,549 s para 15 s en M4 Max, lo que equivale aproximadamente a 15 veces mas rapido que tiempo real en clips de 8 s.
- Dependencias: mlx, numpy, soundfile, scipy y huggingface_hub; MLX 0.32.5 fue la version usada en las pruebas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada/salida | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| Inworld-Voice-Isolator-v1-Turbo5d-MLX (este) | 49,9 M | Audio a 48 kHz mono, offline | Apache 2.0 | Apple Silicon (MLX) | Port verificado, 1,27x mas rapido que PyTorch MPS en M4 Max |
| Inworld-Voice-Isolator-v1-Turbo5d-Model | 49,9 M | Audio a 48 kHz mono, offline | Apache 2.0 | PyTorch (CPU, CUDA, MPS) | Checkpoint de referencia, compatible con el paquete `inworld-voice-isolation` |
| Inworld Voice Isolator v1 original | No disponible | Audio a 48 kHz mono | No disponible | PyTorch (MPS) | Base del que deriva Turbo-5d; mas lento (0,874 s para 8 s en M4 Max) |
| Alternativas de codigo abierto para separacion de voz (p. ej. Demucs, MossFormer) | No disponible | Audio | No disponible | PyTorch | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Calidad heredada del modelo base: la mejora de SI-SDR de Turbo-5d frente al original (+0,384 dB) tiene un intervalo de confianza que cruza cero, y retrocede en ruido mixto de voz y entorno, en frances y en STOI medio. No debe asumirse que supera al original.
- Solo inferencia offline: la ruta en tiempo real (streaming), el look-ahead y los checkpoints de modo dual no estan portados y se rechazan al cargar.
- Solo FP32: no existe variante en media precision ni cuantizada, lo que limita la reduccion de memoria y el aumento de velocidad.
- Solo Apple Silicon: la ruta rapida requiere Metal; en otras plataformas hay que usar el checkpoint PyTorch.
- Memoria: unos 3 GB de pico para un fragmento completo de 8 s; no se ha probado en equipos de 8 GB.
- Rendimiento medido en una sola maquina (M4 Max); los ratios frente a PyTorch pueden diferir en otros chips.
- Proyecto de comunidad independiente, no un producto de Inworld; el autor advierte explicitamente de las salvedades.
- Riesgo de artefactos y sobre-suprimir la voz en grabaciones con ruido solapado con el habla; no hay datos publicados sobre sesgos por idioma, genero o acento mas alla de la mencion al frances.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo de Inworld conviene revisar los terminos del modelo base antes de distribuirlo en produccion.
- No es un modelo de lenguaje: no procesa texto, no tiene contexto en tokens y no admite tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cowWhySo/Inworld-Voice-Isolator-v1-Turbo5d-MLX
- Modelo base (checkpoint PyTorch): https://huggingface.co/cowWhySo/Inworld-Voice-Isolator-v1-Turbo5d-Model
- Repositorio LoRA para reentrenamiento y auditoria: https://huggingface.co/cowWhySo/Inworld-Voice-Isolator-v1-Turbo5d-LoRA
- Benchmarks del modelo base: https://huggingface.co/cowWhySo/Inworld-Voice-Isolator-v1-Turbo5d-Model#benchmarks
- MLX (framework de Apple): https://github.com/ml-explore/mlx
