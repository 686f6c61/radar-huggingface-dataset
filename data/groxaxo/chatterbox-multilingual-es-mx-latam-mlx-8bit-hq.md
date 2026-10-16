# groxaxo/Chatterbox-Multilingual-es-mx-latam-MLX-8bit-HQ

## Resumen

Chatterbox-Multilingual-es-mx-latam-MLX-8bit-HQ es una conversion al ecosistema MLX de Apple del checkpoint de sintesis de voz (TTS) de ResembleAI para espanol latinoamericano (es-mx-latam), publicada por el usuario groxaxo. Se trata de un modelo de texto a voz con clonacion de voz que ha sido recuantizado a 8 bits en precision mixta para reducir el peso de los ficheros y permitir inferencia en hardware Apple Silicon mediante la libreria mlx-audio. El modelo subyacente pertenece a la familia Chatterbox V3.

El modelo cuenta con 677.696.431 parametros (dato real extraido de los safetensors) y ocupa 1.5 GB en el repositorio. La conversion aplica cuantizacion afin solo de pesos de 8 bits con tamano de grupo 32 a 182 matrices de atencion y MLP del backbone T3 (bloques 2 a 27), dejando los dos primeros y los dos ultimos bloques, ademas de embeddings, cabezas de salida, normalizaciones, condicionamiento, encoder de voz, S3Gen V3 y vocoder, en su precision original. No se trata de FP8 ni de un pipeline totalmente de 8 bits.

Es relevante porque ofrece una via de despliegue de TTS multilingue con clonacion de voz de baja huella de almacenamiento (44,24 % de reduccion del fichero de pesos) en Macs con Apple Silicon, aunque el propio autor advierte que la validacion realizada es de conversion y carga, no de calidad perceptiva del audio generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer T3 (estilo LLaMA) para texto a tokens, con S3Gen V3, encoder de voz y vocoder; familia Chatterbox V3 |
| Parametros totales | 677.696.431 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible / no aplica (modelo TTS; limitado por la longitud del texto de entrada) |
| Tipos de cuantizacion | 8-bit afin solo de pesos, group size 32 (182 matrices del backbone T3); matrices protegidas en precision de origen (28); no es FP8; sin cuantizacion de activaciones ni de KV-cache |
| Idiomas soportados | Espanol (es), variante latinoamericana (es-mx-latam) |
| Licencia | MIT |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo es una conversion a MLX de ResembleAI/Chatterbox-Multilingual-es-mx-latam. La arquitectura corresponde a la familia Chatterbox V3 de ResembleAI: un backbone transformer T3 con matrices de atencion y MLP organizadas en bloques, una pila generativa S3Gen V3, un encoder de voz para clonacion y un vocoder. El tokenizador de texto tiene 2.454 entradas y el embedding de voz 8.194 entradas. El preprocesamiento de texto es NFKD, fullcase, conservando diacriticos y marcas combinantes (no se fuerza minusculas ni se eliminan acentos), de modo que se preservan distinciones como ano/ano, si/si y papa/papa, ademas del token de idioma `[es]`.

El proceso de conversion aplica una politica de precision mixta conservadora: cuantiza a 8 bits las 182 matrices del backbone T3 de los bloques 2 a 27 y mantiene intactas 28 matrices protegidas (dos primeros y dos ultimos bloques) y el resto de componentes. Una matriz candidata se conserva sin cuantizar si su error de reconstruccion relativo de Frobenius supera el 0,5 % o su peor error relativo de fila de salida supera el 2 %. Los errores relativos medidos son diagnosticos en el dominio de los pesos: error relativo maximo aceptado de matriz 0,48859 %, error medio 0,47696 % y error relativo maximo de fila de salida 0,68637 %. No se ofrecen datos sobre el conjunto de entrenamiento, numero de tokens, composicion del dataset ni sobre etapas de RLHF/DPO; esa informacion no esta disponible en la documentacion proporcionada.

## Capacidades

- Sintesis de voz (text-to-speech) en espanol latinoamericano a partir de texto.
- Clonacion de voz mediante audio de referencia autorizado (mono, limpio) y condicionamiento sobre la identidad vocal de la muestra.
- Preprocesamiento de texto sensible a acentos y diacriticos, preservando contrastes lexicos del espanol.
- Generacion de salida en WAV float a frecuencia de muestreo nativa mediante el helper incluido.
- Integracion con la libreria mlx-audio para carga de pesos y ejecucion en MLX.
- Uso de token de idioma explicito `[es]` para fijar el idioma de sintesis.
- No dispone de soporte de tool calling, function calling, agentes, vision ni audio de entrada mas alla del audio de referencia para clonacion; esas capacidades no estan documentadas.

## Casos de uso

- Localizacion de contenido audiovisual a espanol latinoamericano: el modelo sintetiza voces con acento latino a partir de un audio de referencia, util para doblaje de bajo coste en preproduccion antes de recurrir a actores de doblaje profesionales.
- Narracion de audiolibros y articulos: gracias a la clonacion de voz se puede mantener una identidad vocal consistente a lo largo de capitulos extensos, siempre que el texto se fragmente en segmentos.
- Asistentes de voz y sistemas IVR: al ser un modelo TTS ligero (fichero de pesos de 1,5 GB) puede integrarse en entornos de atencion telefonica o asistentes conversacionales que necesiten sintesis en espanol latinoamericano.
- Accesibilidad y lectura asistida: conversion de texto digital a voz para lectores de pantalla o herramientas de accesibilidad, con la ventaja de conservar diacriticos y pronunciacion correcta de terminos acentuados.
- Prototipado de personajes para videojuegos y experiencias interactivas: la clonacion de voz permite generar multiples voces placeholder a partir de grabaciones de referencia antes de la grabacion final.
- Produccion de podcast y contenido sintetico: generacion de pistas de voz de forma rapida en un Mac con Apple Silicon sin necesidad de GPU dedicada, reduciendo la dependencia de servicios en la nube.
- Pruebas de calidad (QA) de sistemas de reconocimiento de voz: uso del modelo para generar corpus sinteticos en espanol latinoamericano con voces controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks perceptivos en la informacion disponible. El autor indica explicitamente que no se ha generado ninguna forma de onda, ni se han realizado pruebas de escucha humana, puntuaciones de calidad ASR, evaluacion de similitud de voz ni benchmarks nativos en Apple Metal. Los unicos datos publicados son mediciones de conversion en el dominio de los pesos:

| Medicion | Resultado |
|---|---:|
| Fichero de pesos MLX en precision de origen | 2.711.116.913 bytes |
| Fichero de pesos Q8-HQ | 1.511.588.177 bytes |
| Reduccion del fichero de pesos | 44,24 % |
| Matrices de backbone cuantizadas / protegidas | 182 / 28 |
| Error relativo maximo de matriz aceptado | 0,48859 % |
| Error relativo medio de matriz aceptado | 0,47696 % |
| Error relativo maximo de fila de salida | 0,68637 % |
| Valores de tensores protegidos | Exactamente sin cambios |
| Igualdad de guardado/recarga baseline y Q8 | Forma, dtype y valores exactos |
| Pruebas de contrato de kernel/serializacion MLX reales | 4 superadas, 0 omitidas |

Estos errores son diagnosticos de reconstruccion de pesos, no porcentajes de calidad perceptiva, y los tamanos de fichero no representan memoria pico de inferencia.

## Requisitos de hardware

- Compatibilidad: la conversion esta disenada para MLX, por lo que requiere Apple Silicon (familia M1, M2, M3, M4 o superior). No es compatible con CUDA (NVIDIA) ni con ROCm (AMD) a traves de MLX.
- Fichero de pesos: 1.511.588.177 bytes (aproximadamente 1,5 GB) para el modelo Q8-HQ; el fichero en precision de origen retenido localmente ocupa 2.711.116.913 bytes (unos 2,7 GB).
- VRAM/memoria unificada estimada: no disponible de forma explicita; la memoria pico de inferencia no ha sido publicada. El fichero de pesos de 1,5 GB es solo un limite inferior orientativo.
- GPU recomendadas: cualquier chip Apple Silicon con memoria unificada suficiente; el autor no especifica cifras de memoria minima.
- Cabe en hardware de consumo: si, en Macs con Apple Silicon; la validacion se realizo con backend CPU en Windows 11/Ubuntu WSL2, pero el objetivo nativo es Apple Metal.
- Opciones de despliegue: libreria mlx-audio (con el helper `generate_pinned.py`) o la CLI estandar `python -m mlx_audio.tts.generate`. Requiere `mlx==0.32.4` y la revision de runtime fijada en `dad2087f790dfe96b07d5aac1405db4b578b411f`. El tokenizer de voz externo se fija en `e0c9886f0e1c35ae85b1f27277416fb19fc72bec`.
- Latencia y throughput: no disponibles; el autor recomienda evaluar la latencia en caliente y el RTF (factor de tiempo real) por separado en el Mac objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Precision / formato | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| groxaxo/Chatterbox-Multilingual-es-mx-latam-MLX-8bit-HQ | 677,7 M | 8-bit mixto, safetensors MLX | es (latam) | MIT | Sin benchmarks perceptivos publicados |
| ResembleAI/Chatterbox-Multilingual-es-mx-latam (base) | No disponible | Precision de origen (PyTorch), safetensors | es (latam) | No disponible en la informacion proporcionada (el modelo derivado declara MIT) | Sin datos en esta informacion |
| Alternativas TTS de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La unica comparacion disponible es cualitativa: este modelo Q8-HQ reduce el fichero de pesos un 44,24 % respecto al fichero MLX en precision de origen, a costa de errores de reconstruccion acotados por debajo del 0,5 % de error relativo de matriz.

## Limitaciones y advertencias

- No se ha realizado validacion perceptiva del audio: el autor advierte que no se ha generado ninguna forma de onda, ni pruebas de escucha humana, ASR, similitud de voz o benchmarks nativos en Metal. El nombre "HQ" se refiere a la politica de almacenamiento, no a una mejora perceptiva demostrada.
- La validacion de conversion se hizo con backend CPU en Windows 11/WSL2, no en el objetivo nativo de Apple Silicon con Metal.
- Sesgos conocidos: no documentados en la informacion disponible; por tratarse de un modelo entrenado con voces concretas, puede reproducir sesgos de acento, genero, edad o estilo presentes en los datos originales.
- Riesgo de alucinacion en el contexto TTS: posibilidad de palabras repetidas, omitidas o artefactos de audio; el autor recomienda escucha ciega para detectarlos.
- Limitaciones de idioma: el modelo es especificamente de espanol latinoamericano; el propio autor advierte que ser un modelo latinoamericano no garantiza todos los acentos regionales.
- Restricciones de licencia: se declara licencia MIT, lo que en principio permite uso comercial, pero debe verificarse la licencia del modelo base ResembleAI (no confirmada en la informacion proporcionada) antes de un despliegue comercial.
- Riesgos de uso de clonacion de voz: requiere usar grabaciones de referencia autorizadas. El uso indebido para suplantacion de identidad o generacion de voces sin consentimiento puede infringir normativas.
- La carga mediante la CLI estandar puede descargar una revision mutable del tokenizer de voz; se recomienda el helper incluido para reproducibilidad.
- Requisito de plataforma: dependencia de Apple Silicon (MLX), lo que excluye despliegues en GPU NVIDIA/AMD con las herramientas habituales (vLLM, TGI, llama.cpp, Ollama).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/groxaxo/Chatterbox-Multilingual-es-mx-latam-MLX-8bit-HQ
- Modelo base: https://huggingface.co/ResembleAI/Chatterbox-Multilingual-es-mx-latam
- Repositorio de runtime mlx-audio: https://github.com/Blaizzy/mlx-audio (revision fijada `dad2087f790dfe96b07d5aac1405db4b578b411f`)
- Revision del modelo fuente (commit): `27e595bf2fe7be0533ca299d9afafcde08b7cca7`
- Revision del encoder de voz y activos compartidos (commit): `5bb1f6ee58e50c3b8d408bc82a6` (referencia truncada en la model card)
- Tokenizer de voz fijado (commit): `e0c9886f0e1c35ae85b1f27277416fb19fc72bec`
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con la ficha.
