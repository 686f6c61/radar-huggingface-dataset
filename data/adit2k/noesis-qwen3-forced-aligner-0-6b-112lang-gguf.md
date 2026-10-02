# Adit2K/NOESIS-Qwen3-Forced-Aligner-0.6B-112LANG-gguf

## Resumen

NOESIS-Qwen3-Forced-Aligner-0.6B-112LANG-gguf es una conversion no oficial a GGUF, cuantizada en Q8_0, del checkpoint AMAImedia/NOESIS-Qwen3-Forced-Aligner-0.6B-112LANG-BF16. Ese checkpoint es a su vez un ajuste fino de Qwen/Qwen3-ForcedAligner-0.6B del equipo Qwen (Alibaba Cloud). No es un modelo generativo de texto: es un alineador forzado que, dado un audio y su transcripcion, devuelve marcas de tiempo a nivel de palabra. Su proposito concreto es permitir la atribucion de hablantes en Isaree Scribe, dividiendo una transcripcion entre interlocutores a partir de los tiempos de palabra, y ejecutarse en dispositivo.

El autor de la conversion (Adit2K) la describe explicitamente como experimental y no evaluada con benchmarks. El unico control realizado es que el fichero carga en transcribe.cpp, que la cabecera declara `qwen3_forced_aligner` con 110 idiomas y que devuelve tiempos monotonos en dos muestras cortas (una en ingles y una frase sintetica en neerlandes). Esos controles no dicen nada sobre la precision de la alineacion.

El modelo pesa 917.755.024 parametros segun los safetensors del modelo base, aunque se comercializa bajo la denominacion comercial de 0.6B. Se distribuye como un unico fichero GGUF de 994.516.448 bytes, con licencia Apache-2.0, y requiere una build de transcribe.cpp que soporte la familia `qwen3_forced_aligner`; no es compatible con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 adaptado como alineador forzado, con frontend de audio, convoluciones y cabeza de clasificacion; identificada como `qwen3_forced_aligner` en transcribe.cpp (710 tensores). Configuracion de capas, atencion y dimensiones: no disponible |
| Parametros totales | 917.755.024 (segun safetensors del modelo base; la denominacion comercial es 0.6B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (matrices lineales, embedding de tokens y cabeza de clasificacion); normas, sesgos, kernels de convolucion y tablas del frontend en F32. El modelo de origen esta en BF16 |
| Idiomas soportados | 112 codigos declarados por el autor de origen. La cabecera `general.languages` del GGUF contiene 110: excluye `ja` (japones) y `ko` (coreano) porque el motor no incluye los segmentadores de palabra que necesitan |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `NOESIS-Qwen3-ForcedAligner-0.6B-112LANG-Q8_0.gguf`, 994.516.448 bytes, sha256 `c2fe9af2cbb039191cc155e209c9cd8991815663984e480847557f209805b706`). El origen esta en safetensors BF16 |
| Arquitectura de ejecucion soportada | transcribe.cpp, familia `qwen3_forced_aligner`. No compatible con llama.cpp |

## Arquitectura y entrenamiento

La arquitectura de partida es la familia Qwen3, pero el uso no es autoregresivo de texto libre sino de alineacion forzada: el modelo recibe audio y una transcripcion y produce marcas temporales por palabra. El GGUF conserva 710 tensores e incluye componentes propios de un frontend de audio (kernels de convolucion y tablas del frontend almacenadas en F32), ademas de un embedding de tokens y una cabeza de clasificacion, ambos cuantizados en Q8_0. La conversion modifica tres claves de identidad de la cabecera (`general.name`, `general.author`, `general.organization`) mediante un cambio local en el conversor; con los valores por defecto, el mismo conversor y cuantizador reproducen byte a byte el GGUF publicado del modelo base.

No hay informacion disponible en los datos proporcionados sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF o DPO en el ajuste. La model card del autor de la conversion remite a la model card del modelo de origen (AMAImedia) para el detalle de entrenamiento: alli se indica que el entrenamiento se organizo en fases (fases A-G, segun el texto truncado de la atribucion) y que muchos idiomas se entrenaron con pseudo-etiquetas autogeneradas, con distintos niveles de calidad declarados por idioma. No se dispone del desglose concreto de esas fases ni de las cifras por idioma.

## Capacidades

- Alineacion forzada de audio y transcripcion: genera marcas de tiempo a nivel de palabra, con tiempos monotonos segun las comprobaciones del autor.
- Soporte declarado de 112 idiomas, reducido a 110 en la practica dentro del contenedor GGUF (sin japones ni coreano).
- Atribucion de hablantes: los tiempos de palabra permiten dividir una transcripcion entre interlocutores, uso previsto en Isaree Scribe.
- Inferencia en dispositivo mediante transcribe.cpp, con un unico fichero GGUF como artefacto de despliegue.
- Generacion de texto: no disponible. Es un alineador, no un modelo de generacion ni de conversacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio comprensivo o modo thinking: no disponible. La entrada de audio se usa exclusivamente para el calculo de tiempos, no para comprension o transcripcion autonoma.

## Casos de uso

- Subtitulado con marcas de palabra: a partir de un audio y su transcripcion se obtienen tiempos por palabra que permiten generar subtitulos SRT o VTT con resaltado palabra a palabra, util para karaoke, subtitulos descriptivos o para plataformas que exigen sincronizacion fina. El modelo encaja porque su salida nativa es precisamente el tiempo de cada palabra.
- Atribucion de hablantes en transcriptores: combinando los tiempos de palabra con una segmentacion de hablantes, se puede repartir un texto transcrito entre interlocutores; es el caso de uso declarado por el autor en Isaree Scribe.
- Preparacion de corpus para TTS: los tiempos por palabra permiten recortar audios en fragmentos alineados con su texto para entrenar o ajustar modelos de sintesis de voz, con control del inicio y fin de cada unidad.
- Auditar y corregir transcripciones ASR: comparando los tiempos devueltos con los de un transcriptor automatico se detectan palabras omitidas, repetidas o mal segmentadas antes de publicar la transcripcion.
- Investigacion fonetica y linguistica de corpus: obtener limites temporales por palabra sobre grabaciones en cualquiera de los 110 idiomas soportados en el motor permite medir duraciones, pausas y ritmo de habla sobre corpus ya transcritos sin reanotar manualmente.
- Aplicaciones de escritura y notas de voz en dispositivo: integrado en una app de escritorio o movil mediante transcribe.cpp, aporta marcas de palabra sin enviar el audio a un servicio externo ni depender de GPU.
- Control de calidad de doblaje y locucion: verificar que cada palabra del guion aparece en el intervalo de tiempo previsto en la locucion grabada, senalando desviaciones de sincronia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica de forma explicita que el modelo es experimental y que no ha sido evaluado con benchmarks por parte del autor de la conversion, y que las unicas comprobaciones realizadas son de carga del fichero, lectura de cabecera y monotonia de tiempos en dos muestras cortas. Tampoco se publican cifras de latencia, throughput ni de error de alineacion (por ejemplo, desviacion media en milisegundos).

## Requisitos de hardware

- Peso en disco del fichero GGUF Q8_0: 994.516.448 bytes (aproximadamente 949 MiB), segun el propio contenedor.
- Peso del modelo de origen en BF16: 917.755.024 parametros x 2 bytes = 1.835.510.048 bytes, aproximadamente 1.71 GiB, solo como referencia de la version sin cuantizar.
- VRAM o RAM estimada para inferencia: del orden de 1,0 a 1,5 GB con el fichero Q8_0 y los buffers de trabajo; no disponible la cifra exacta publicada por el autor.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU con 2 GB o mas de memoria dedicada es suficiente en teoria, pero no hay validacion publicada sobre CUDA, Metal o Vulkan para esta familia.
- GPU de consumo: si, el modelo cabe sin problemas en cualquier GPU de consumo actual y en la mayoria de iGPU con memoria compartida suficiente; es tambien viable en CPU.
- Opciones de despliegue: transcribe.cpp, con una build que incluya la familia `qwen3_forced_aligner` (por ejemplo el commit `d9b55b22f5c5ff73612c3e8073fcb6ae2e289b58` del fork de Adi2K). No compatible con llama.cpp, vLLM, Ollama ni TGI segun la informacion disponible.
- Ejemplo de invocacion declarado por el autor: `transcribe-cli -m NOESIS-Qwen3-ForcedAligner-0.6B-112LANG-Q8_0.gguf -l nl --align-text transcript.txt --timestamps word audio.wav`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| NOESIS-Qwen3-Forced-Aligner-0.6B-112LANG (este GGUF Q8_0) | 917.755.024 | 112 declarados / 110 en cabecera GGUF | no disponible | Apache-2.0 | GGUF (Q8_0) | Sin benchmarks publicados |
| AMAImedia/NOESIS-Qwen3-Forced-Aligner-0.6B-112LANG-BF16 | 917.755.024 | 112 declarados | no disponible | Apache-2.0 | safetensors (BF16) | Sin benchmarks publicados en la informacion disponible |
| Qwen/Qwen3-ForcedAligner-0.6B | no disponible (denominacion 0.6B) | no disponible | no disponible | Apache-2.0 | safetensors | No evaluado en esta ficha |
| Alineadores tipo wav2vec2/MMS usados por cadenas de subtitulado | no disponible | no disponible | no disponible | licencias variables segun modelo | safetensors / PyTorch | no disponible |

La comparativa cuantitativa con alternativas de otra procedencia no puede completarse con la informacion proporcionada: no hay benchmarks ni especificaciones publicadas para este GGUF ni para su modelo base mas alla del recuento de parametros, la licencia y la lista de idiomas.

## Limitaciones y advertencias

- Modelo experimental y sin evaluacion: el autor declara explicitamente que no ha medido la precision de alineacion en ningun idioma. Los unicos controles son de carga y monotonia de tiempos en dos muestras.
- Conversion no oficial: no es un lanzamiento del equipo Qwen, de Alibaba Cloud ni de AMAImedia, y ninguna de esas entidades lo respalda.
- Idiomas: la lista de 112 es una declaracion del autor de origen, no una validacion. En el GGUF solo se declaran 110 en cabecera, quedando fuera japones y coreano porque el motor no incluye los segmentadores de palabra necesarios y los rechaza.
- Calidad desigual por idioma: segun la informacion disponible, muchos idiomas del ajuste se entrenaron con pseudo-etiquetas autogeneradas y el autor de origen publica niveles de calidad por idioma; hay que consultar su model card antes de confiar en un idioma concreto.
- Riesgo de alineacion incorrecta: en un alineador forzado el fallo no se manifiesta como texto inventado sino como limites de palabra mal situados o desplazados, lo que puede propagarse a subtitulos, cortes de audio o atribucion de hablantes erronea. No hay tasas de error publicadas.
- Escenarios adversos no evaluados: solapamiento de voces, musica o ruido de fondo, cambios de idioma dentro de una misma grabacion, numeros, siglas y palabras fuera del vocabulario no estan cubiertos por las comprobaciones declaradas.
- Compatibilidad de ejecucion restringida: requiere transcribe.cpp con la familia `qwen3_forced_aligner`; no funciona en llama.cpp ni en los servidores de inferencia habituales, lo que limita su integracion en pilas ya existentes.
- Licencia: Apache-2.0, que permite uso comercial, pero obliga a conservar los avisos de copyright y atribucion y a indicar los cambios realizados; el bundle incluye LICENSE y NOTICE con las atribuciones de Qwen/Alibaba Cloud y de AMAImedia.
- Uso en produccion: el propio autor indica que no debe usarse en produccion sin una evaluacion propia previa.
- Sin senales de adopcion: el repositorio figura con 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan informes independientes de fallos o de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Adit2K/NOESIS-Qwen3-Forced-Aligner-0.6B-112LANG-gguf
- Modelo base de la cuantizacion (BF16): https://huggingface.co/AMAImedia/NOESIS-Qwen3-Forced-Aligner-0.6B-112LANG-BF16
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- GGUF del modelo base, con identica disposicion de tensores: https://huggingface.co/Adit2K/Qwen3-ForcedAligner-0.6B-gguf
- Fork de transcribe.cpp usado para la conversion: https://github.com/Adi2K/transcribe.cpp (rama `feat/qwen3-forced-aligner-v0.2.1`)
- Commit concreto del conversor y cuantizador: https://github.com/Adi2K/transcribe.cpp/commit/d9b55b22f5c5ff73612c3e8073fcb6ae2e289b58
- Repositorio upstream de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Referencia arXiv incluida en los metadatos del modelo: arxiv:2601.21337 (no se dispone del titulo ni del contenido en la informacion proporcionada)
