# per2021/whisper-bsc-large-v3-cat-mlx

## Resumen

whisper-bsc-large-v3-cat-mlx es una conversión al formato MLX del modelo de reconocimiento automático de habla BSC-LT/whisper-bsc-large-v3-cat, un ajuste fino de openai/whisper-large-v3 para catalán desarrollado por el Barcelona Supercomputing Center (BSC-LT). El repositorio lo publica el usuario per2021 y su única aportación es el cambio de formato de pesos: no se ha reentrenado ni podado nada, los pesos son los mismos en float16.

El problema que resuelve es puramente de despliegue. Hasta ahora, cualquier usuario de un Mac con Apple Silicon que quisiera ejecutar este modelo en la GPU tenía que descargar los pesos en PyTorch y convertirlos a mano con el script de mlx-examples. Este repositorio pone a disposición el resultado ya convertido, listo para consumirse con la librería mlx-whisper mediante `path_or_hf_repo="per2021/whisper-bsc-large-v3-cat-mlx"`.

Se trata de un modelo Whisper large-v3 completo (no una variante turbo), de modo que hereda la ventana fija de 30 segundos de audio por inferencia y un coste por fragmento constante, independientemente de la duración real del habla. Está pensado para transcripción en catalán en local y con privacidad total, sin depender de APIs externas. La licencia es Apache 2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper de openai/whisper-large-v3) |
| Parametros totales | 1550 M (heredados de openai/whisper-large-v3; no indicados en la model card de este repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 30 segundos de audio por inferencia (no es contexto de texto) |
| Tipos de cuantizacion | float16 (unico publicado en el repositorio); MLX permite otras precisiones solo mediante conversion propia |
| Idiomas soportados | catalan (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`weights.safetensors`); 3,1 GB de repositorio |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder que recibe representaciones mel-espectrales de audio en ventanas de 30 segundos y genera la transcripcion de forma autoregresiva. Este repositorio no introduce ningun cambio arquitectonico; es una conversion de formato de los pesos de BSC-LT/whisper-bsc-large-v3-cat a MLX con `dtype=float16`, realizada con el script oficial `convert.py` de mlx-examples. Los detalles finos de la arquitectura (numero de capas, dimensiones, cabezas de atencion) corresponden a openai/whisper-large-v3 y no se repiten en la model card.

En cuanto al entrenamiento, la model card indica que el ajuste fino original lo realizo el Barcelona Supercomputing Center sobre 3CatParla, Parlament Parla, Corts Valencianes y Common Voice. No se detalla en la informacion disponible el numero de tokens o horas de audio, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO; este repositorio, en cualquier caso, no entrena ni afina, solo convierte. Un detalle practico relevante es que el script de conversion de Apple escribe `model.safetensors`, mientras que mlx-whisper busca `weights.safetensors`, por lo que la conversion requiere renombrar el fichero.

## Capacidades

- Reconocimiento automatico de habla (ASR) en catalan, con salida de texto normalizado.
- Transcripcion de audio en local sobre la GPU de Apple Silicon mediante mlx-whisper.
- Procesamiento por ventanas fijas de 30 segundos, lo que permite transcribir audios largos concatenando fragmentos con un coste por fragmento constante.
- Capacidad multilingue de base (Whisper large-v3 es multilingue), aunque el ajuste fino y el uso previsto son exclusivamente para catalan.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, vision, audio generation ni modo de razonamiento explicito.
- La model card no menciona generacion de marcas de tiempo, deteccion de idioma por fragmento ni diarizacion de hablantes.

## Casos de uso

- Transcripcion de audio confidencial en local: empresas y despachos catalanoparlantes pueden transcribir reuniones sin enviar el audio a ninguna API, ya que todo el calculo ocurre en la GPU del propio Mac.
- Subtitulado de contenido audiovisual en catalan: se puede integrar en un pipeline que procese la pista de audio en fragmentos de 30 segundos y genere el texto base de los subtitulos, aplicando despues un modelo de puntuacion.
- Archivado y busqueda de sesiones parlamentarias: el ajuste fino se entreno, entre otros, con Parlament Parla y Corts Valencianes, por lo que el dominio institucional y formal esta bien cubierto para indexar intervenciones historicas.
- Investigacion en ASR para lenguas de bajos recursos: sirve como referencia de un large-v3 afinado en catalan y ejecutable en hardware de consumo, util para comparar con otros ajustes finos sobre los mismos test sets catalanes.
- Pseudo-etiquetado de corpus de voz: al ser un large-v3 completo, puede generar transcripciones iniciales sobre horas de audio no anotado para despues revisarlas y usarlas como datos de entrenamiento.
- Accesibilidad en tiempo diferido: transcripcion de clases, ponencias o entrevistas grabadas para generar actas o apuntes en catalan, priorizando la privacidad sobre la latencia.
- Post-procesado combinado con un modelo de puntuacion: dado que esta version devuelve texto normalizado sin mayusculas ni signos, se puede encadenar con el modelo hermano per2021/whisper-large-v3-ca-punctuated-mlx para obtener transcripciones con formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio remite explicitamente a la evaluacion de la model card original de BSC-LT/whisper-bsc-large-v3-cat, medida sobre conjuntos de test en catalan, pero no reproduce cifras concretas.

## Requisitos de hardware

- Ejecucion exclusiva sobre Apple Silicon mediante MLX: no funciona en GPU NVIDIA ni AMD a traves de esta libreria.
- Memoria unificada recomendada: al menos 8 GB para una carga holgada de un modelo de 3,1 GB en float16 junto con el sistema; 16 GB o mas es lo aconsejable para procesar audios largos sin presion de memoria.
- Chips compatibles: familia M1, M2, M3 y M4 (incluidas variantes Pro, Max y Ultra). El rendimiento escala con el ancho de banda de memoria del chip.
- No es un modelo para GPU de servidor: A100, H100 o RTX 4090 no son destinos validos de este repositorio, aunque si pueden ejecutar el modelo original en PyTorch.
- Opciones de despliegue: mlx-whisper sobre Mac (via principal); alternativas para otros entornos serian whisper.cpp o transformers con los pesos PyTorch del modelo base BSC-LT/whisper-bsc-large-v3-cat. vLLM, TGI, llama.cpp y Ollama no estan soportados para este repositorio.
- Latencia y throughput: no disponibles. La model card advierte de que, al ser un large-v3 completo, es mas lento que whisper-large-v3-turbo, y que Whisper siempre procesa una ventana de 30 segundos, por lo que el coste por intervencion no depende de la duracion real del habla.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana / contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| per2021/whisper-bsc-large-v3-cat-mlx (este) | 1550 M (heredados) | 30 s de audio | MLX safetensors float16 | Apache 2.0 | HuggingFace, 0 descargas |
| BSC-LT/whisper-bsc-large-v3-cat | 1550 M (heredados) | 30 s de audio | PyTorch safetensors | Apache 2.0 | HuggingFace (modelo base del anterior) |
| per2021/whisper-large-v3-ca-punctuated-mlx | mismo tamano de fichero segun la model card | 30 s de audio | MLX safetensors | no indicada en la informacion disponible | HuggingFace (modelo hermano, salida con puntuacion y mayusculas) |
| openai/whisper-large-v3 | 1550 M (heredados) | 30 s de audio | PyTorch safetensors | Apache 2.0 | HuggingFace (modelo base original) |
| openai/whisper-large-v3-turbo | no disponible en la informacion proporcionada | 30 s de audio | PyTorch safetensors | Apache 2.0 | HuggingFace (citado en la model card como mas rapido) |

Diferencias clave: frente al modelo base del BSC, este repositorio solo cambia el formato y permite ejecucion en GPU de Apple Silicon. Frente al modelo hermano con puntuacion, la diferencia practica es el estilo de salida (normalizado aqui, con signos y mayusculas alli) con un tamano de fichero y una velocidad equivalentes segun la model card. Frente a whisper-large-v3-turbo, la ventaja es la precision del large-v3 completo y el ajuste en catalan; la desventaja, la velocidad.

## Limitaciones y advertencias

- Salida normalizada: la model card advierte de que las transcripciones se devuelven sin puntuacion y sin mayusculas, lo que exige un post-procesado si se busca texto legible.
- Sin marcas de tiempo documentadas: la model card no menciona que se generen timestamps, algo a verificar antes de usarlo para subtitulado sincronizado.
- Rendimiento inferior al turbo: al ser un large-v3 completo, es mas lento que whisper-large-v3-turbo; no es la opcion adecuada si la latencia es critica.
- Ventana fija de 30 segundos: la calidad puede degradarse en fragmentos con silencios largos, ruido o solapamiento de hablantes, y el coste por fragmento no se reduce por hablar poco.
- Riesgo de alucinacion: como cualquier modelo Whisper, puede inventar texto en pasajes de silencio, musica o ruido, y repetir fragmentos en audios de baja calidad.
- Sesgos heredados: al ser una conversion sin reentrenamiento, arrastra los sesgos del ajuste fino del BSC y del whisper-large-v3 original en vocabulario, acentos, variedades dialectales y genero.
- Ambito limitado al catalan: aunque la base es multilingue, el ajuste fino y el uso previsto son en catalan; el rendimiento en otras lenguas no esta documentado y probablemente sea inferior al del modelo original.
- Dependencia de plataforma: solo se ejecuta con MLX sobre Apple Silicon. En Linux, Windows o servidores con GPU NVIDIA hay que recurrir al modelo base en PyTorch u otras herramientas.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, sin comunidad que haya validado la conversion ni reportado problemas.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribucion al BSC-LT y a OpenAI como autores del modelo original y del ajuste fino respectivamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/per2021/whisper-bsc-large-v3-cat-mlx
- Modelo base del ajuste fino (BSC-LT): https://huggingface.co/BSC-LT/whisper-bsc-large-v3-cat
- Modelo base original: https://huggingface.co/openai/whisper-large-v3
- Libreria mlx-whisper: https://pypi.org/project/mlx-whisper/
- Script de conversion de MLX: https://raw.githubusercontent.com/ml-explore/mlx-examples/main/whisper/convert.py
- Modelo hermano con puntuacion: https://huggingface.co/per2021/whisper-large-v3-ca-punctuated-mlx
- Organizacion del Barcelona Supercomputing Center: https://huggingface.co/BSC-LT
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (unicamente resultados genericos de Wikipedia).
