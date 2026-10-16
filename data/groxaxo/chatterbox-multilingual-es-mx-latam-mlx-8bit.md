# groxaxo/Chatterbox-Multilingual-es-mx-latam-MLX-8bit

## Resumen

Chatterbox Multilingual es-mx-latam MLX-8bit es una conversion cuantizada a 8 bits del modelo de sintesis de voz (text-to-speech) ResembleAI/Chatterbox-Multilingual-es-mx-latam, publicada por el usuario groxaxo. El modelo original, desarrollado por Resemble AI, esta especializado en la generacion de voz en espanol de Mexico y Latinoamerica con capacidad de clonacion de voz a partir de una grabacion de referencia. Esta version concreta no es el modelo original, sino una redistribucion optimizada para ejecutarse en Apple Silicon mediante la libreria Apple MLX.

El modelo cuenta con aproximadamente 677,7 millones de parametros totales (677.696.431 segun los pesos en safetensors) y se distribuye como un archivo de pesos de 1,264 GB, un 53,37% mas pequeno que la baseline MLX de precision de origen. La cuantizacion es de tipo afino (affine) de 8 bits con tamano de grupo 64, aplicada exclusivamente a las 210 matrices de atencion y MLP del backbone T3; el resto de componentes (encoder de voz, embeddings, cabezas de salida, decodificador S3Gen V3 y vocoder) conservan la precision de origen.

Su relevancia radica en que permite ejecutar un modelo de voz multilingue con clonacion en equipos Mac con chip Apple Silicon, sin necesidad de GPU dedicada, reduciendo el peso del archivo de pesos a la mitad. No obstante, el propio autor advierte que la calidad de audio generada, la similitud del hablante y la equivalencia con el modelo PyTorch original no han sido verificadas todavia, por lo que debe tratarse como una conversion en fase de validacion tecnica y no como un sustituto certificado del modelo de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (backbone T3 transformer + decodificador S3Gen V3 + vocoder; es un modelo TTS) |
| Parametros totales | 677.696.431 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 8 bits, group size 64 (210 matrices T3 de atencion y MLP); resto en precision de origen |
| Idiomas soportados | es (espanol, variante es-mx-latam) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, para mlx-audio) |

Otros datos tecnicos de interes: fichero de pesos de 1.264.130.033 bytes; dependencia adicional de tokenizador de voz (~495 MB, mlx-community/S3TokenizerV2, revision e0c9886f0e1c35ae85b1f27277416fb19fc72bec); commits de referencia MLX-Audio dad2087f790dfe96b07d5aac1405db4b578b411f; revision del modelo original en espanol 27e595bf2fe7be0533ca299d9afafcde08b7cca7; SHA-256 del modelo 35c2653a76fd5ba5f1643ae641638a20eb18e115a4b810999e05000044e50a79.

## Arquitectura y entrenamiento

La conversion no aporta informacion sobre el entrenamiento del modelo base; el README se limita al proceso de cuantizacion. El modelo original ResembleAI/Chatterbox-Multilingual sigue una arquitectura TTS compuesta por un backbone transformer denominado T3, un decodificador S3Gen V3 y un vocoder. Sobre esa estructura, esta release aplica la funcion `quantize_t3_backbone(..., bits=8, group_size=64)` de MLX-Audio sobre las 210 matrices de atencion y MLP del backbone T3, sin exenciones por bloque (a diferencia de la variante HQ) y sin usar puertas de error de pesos para decidir que capas eximir.

La conversion se realizo directamente desde la baseline MLX de precision de origen, no recuantizando un modelo ya cuantizado. No hay casting global a FP16/BF16, ni conversion a FP8, ni cuantizacion adicional de activaciones o de la cache KV. La validacion cubre comprobaciones de formas, dtypes y valores de tensores guardados y recargados, coincidencia exacta de las 210 matrices empaquetadas con el cuantizador upstream de MLX, carga completa del modelo y del tokenizador de voz con verificacion de sumas de control, y un forward real no condicionado que produce logits finitos de forma `[1, 8, 8194]`. Los diagnosticos en el dominio de los pesos reportan un error relativo maximo de 0,56867% a nivel de matriz completa y de 0,93624% a nivel de fila de salida; el autor subraya que estos porcentajes no equivalen a perdida de calidad de audio percibida. No se ha verificado el habla generada, la pronunciacion, la similitud del hablante, la escucha humana, el factor de tiempo real de extremo a extremo ni la ejecucion nativa en Metal de Apple.

## Capacidades

- Sintesis de voz (text-to-speech) en espanol, con variante entrenada para es-MX y es-LatAm.
- Clonacion de voz a partir de una grabacion de referencia limpia y mono (se usa `--ref-audio`).
- Preprocesado V3 con `NFKD, fullcase` (normalizacion Unicode NFKD y preservacion de mayusculas y signos diacriticos).
- Generacion de audio WAV en float a la tasa de muestreo nativa del modelo.
- Uso de `lang_code=es` para fijar el idioma de sintesis.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (el modelo no es un LLM generativo de texto).
- No se documenta vision, audio de entrada, ni otras modalidades mas alla de la generacion de voz.

## Casos de uso

- Clonacion de voz personal en Mac: un usuario con Apple Silicon puede generar locuciones con su propia voz a partir de una muestra de referencia, sin GPU dedicada, gracias al formato MLX y a la cuantizacion de 8 bits que reduce el peso a 1,264 GB.
- Doblaje de contenido en espanol latinoamericano: produccion de pistas de voz para videos, cursos o podcasts dirigidos a audiencias de Mexico o Latinoamerica, aprovechando el ajuste especifico `es-mx-latam`.
- Prototipado de asistentes de voz: generacion de respuestas habladas en pruebas de concepto de IVR o asistentes conversacionales donde se necesita sintesis en espanol y control sobre la voz del hablante.
- Accesibilidad y lectura de texto: conversion de articulos, notificaciones o documentos a audio en espanol para personas con discapacidad visual, ejecutandose localmente en un Mac.
- Audiolibros y narracion: produccion de borradores de narracion con una voz consistente clonada, editables antes de la grabacion final por un profesional.
- Pruebas de integracion en pipelines de MLX: desarrolladores que quieran validar el flujo `mlx-audio` con un modelo TTS cuantizado antes de adoptarlo en produccion.
- Generacion de datos sinteticos de audio: creacion de muestras de voz en espanol para experimentos de reconocimiento de habla o aumentacion de datasets (respetando la licencia MIT y los derechos sobre las voces de referencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de evaluacion publicado por el autor son los diagnosticos en el dominio de los pesos: error relativo maximo de 0,56867% a nivel de matriz completa y 0,93624% a nivel de fila de salida. El propio autor indica que estos no constituyen una medida de calidad percibida del audio y que la calidad de habla, la similitud del hablante y el factor de tiempo real de extremo a extremo no han sido verificados.

## Requisitos de hardware

- Diseno objetivo: Macs con Apple Silicon (arm64), a traves de MLX. Se requiere Python 3.10 o superior nativo para arm64.
- Memoria del fichero de pesos: 1,264 GB solo para los pesos del modelo; hay que sumar la dependencia del tokenizador de voz (~495 MB). La memoria pico de inferencia no se especifica (el autor advierte expresamente que el tamano del fichero de pesos no es la memoria pico).
- VRAM/memoria unificada estimada: no disponible de forma oficial; por el tamano (>1,7 GB en pesos mas tokenizador, mas activaciones y cache), deberia ser viable en Macs con 8-16 GB de memoria unificada, aunque esto no esta confirmado por el autor.
- GPU recomendadas: Apple Silicon (M-series) con soporte Metal. No se documenta soporte para A100, H100, RTX 4090 ni otras GPUs NVIDIA.
- Cabe en GPU de consumo: la variante objetivo es Apple Silicon; no se documenta el uso en GPU de consumo convencionales.
- Opciones de despliegue: `mlx-audio` (libreria `mlx_audio.tts.generate`) y el script incluido `run_regular_mlx8.py` con verificacion de checksums. El instalador `Install-and-Test-Mac.command` crea un entorno aislado en `~/.venvs/chatterbox-latam-mlx8-regular` e instala el runtime fijado. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato MLX de un modelo TTS).
- Latencia y throughput: no disponible. El factor de tiempo real de extremo a extremo figura explicitamente como no cualificado.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Idioma | Licencia | Comentario |
|---|---|---|---|---|---|
| groxaxo/Chatterbox-Multilingual-es-mx-latam-MLX-8bit (este) | 677.696.431 | MLX affine 8 bits, group size 64, 210 matrices cuantizadas | es (es-mx-latam) | MIT | Fichero de pesos de 1.264.130.033 bytes; sin exenciones por bloque |
| groxaxo/Chatterbox-Multilingual-es-mx-latam-MLX-8bit-HQ | no disponible | MLX affine 8 bits, group size 32, 182 matrices cuantizadas, primeros dos y ultimos dos bloques eximidos | es (es-mx-latam) | MIT | Fichero de pesos de 1.511.588.177 bytes; 16,37% mayor que esta release |
| ResembleAI/Chatterbox-Multilingual-es-mx-latam (modelo base) | no disponible | precision de origen (MLX baseline sin cuantizar) | es (es-mx-latam) | no disponible en la informacion proporcionada | Origen de la conversion; esta release es un 53,37% mas pequena en fichero de pesos |

No se dispone de datos de benchmarks ni de comparativas de calidad de audio entre estas variantes en la informacion suministrada.

## Limitaciones y advertencias

- La calidad del habla generada, la pronunciacion y la similitud del hablante no han sido cualificadas por el autor. La conversion y un forward correcto del transformer no constituyen un certificado de calidad de voz.
- La ejecucion nativa en Metal de Apple figura como no verificada en el momento de la publicacion; no se debe asumir que funciona en un Mac concreto hasta que el script `Install-and-Test-Mac.command` se haya ejecutado con exito en ese equipo.
- La equivalencia audio a audio con el modelo PyTorch/MLX original no ha sido comprobada.
- El factor de tiempo real de extremo a extremo no se ha medido; puede no ser apto para aplicaciones en tiempo real sin validacion previa.
- Modelo especializado exclusivamente en espanol (es-mx-latam); no se documenta soporte multilingue adicional en esta variante.
- La clonacion de voz exige una grabacion de referencia autorizada y limpia; no se publican grabaciones de referencia, y el uso indebido de voces de terceros plantea riesgos legales y eticos aunque la licencia del modelo sea MIT.
- El modelo depende de una descarga de red en el primer uso no cacheado (tokenizador de voz `mlx-community/S3TokenizerV2`); si se usa el cargador estandar `mlx_audio.tts.generate` puede obtener una revision mutable del tokenizador, por lo que el autor recomienda el script fijado con verificacion de checksums.
- El modelo no es un LLM: no soporta razonamiento de texto, tool calling ni agentes, por lo que no debe emplearse para tareas fuera de la sintesis de voz.
- Riesgo de alucinacion acustica (artefactos, prosodia incorrecta, mala pronunciacion de nombres propios) propio de los modelos TTS; no cuantificado en esta release.
- Uso comercial permitido por la licencia MIT, pero sujeto a la normativa aplicable sobre derechos de imagen y voz de los hablantes clonados.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/groxaxo/Chatterbox-Multilingual-es-mx-latam-MLX-8bit
- Modelo base: https://huggingface.co/ResembleAI/Chatterbox-Multilingual-es-mx-latam
- Variante HQ del mismo autor: https://huggingface.co/groxaxo/Chatterbox-Multilingual-es-mx-latam-MLX-8bit-HQ
- Tokenizador de voz (dependencia): https://huggingface.co/mlx-community/S3TokenizerV2
- Ningun otro enlace (paper, blog o repositorio adicional) aparece en la informacion proporcionada.
