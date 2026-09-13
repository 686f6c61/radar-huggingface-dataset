# JoaoZaokk/ivrit-whisper-large-v3-turbo-ggml

## Resumen

JoaoZaokk/ivrit-whisper-large-v3-turbo-ggml es un repositorio de reempaquetado de pesos en formato GGML para whisper.cpp, derivado del checkpoint ivrit-ai/whisper-large-v3-turbo-ggml. No se trata de un modelo entrenado desde cero ni de un fine-tune nuevo: el autor parte de la conversion f16 publicada por ivrit-ai (un ajuste en hebreo de Whisper large-v3-turbo) y genera cuatro variantes cuantizadas para su uso en inferencia local. El objetivo declarado es disponer de enlaces de descarga estables para las aplicaciones nativas Odysseus y Open WebUI, que consumen estos ficheros.

El modelo resuelve el problema del reconocimiento automatico del habla (ASR) en hebreo en dispositivos sin GPU dedicada o con recursos limitados. Al estar en formato GGML, puede ejecutarse con la CLI de whisper.cpp o con cualquier aplicacion que embeba esa libreria, sin necesidad de PyTorch ni de CUDA. El rango de tamanos va de 474 MB (q4_0) a 1625 MB (f16), lo que permite desplegarlo en moviles, Raspberry Pi o portatiles modestos.

La relevancia actual del repositorio es de tipo practico: la arquitectura subyacente es Whisper large-v3-turbo, un transformer encoder-decoder con atencion completa sobre ventanas de audio de 30 segundos, adaptado al hebreo por ivrit-ai. La licencia Apache 2.0 se mantiene intacta respecto al modelo original. El repositorio no incluye datos de benchmarks propios, ni resultados de evaluacion en hebreo, ni informacion sobre el dataset de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), convertido a GGML para whisper.cpp |
| Parametros totales | No disponible en la informacion proporcionada (corresponde a la arquitectura Whisper large-v3-turbo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la arquitectura Whisper procesa ventanas de audio de 30 segundos y encadena ventanas para audios mas largos |
| Tipos de cuantizacion | f16 (sin perdida), q8_0, q5_0, q4_0 |
| Idiomas soportados | Hebreo (he) |
| Licencia | Apache 2.0 (sin cambios respecto al modelo original) |
| Formato de pesos | GGML (.bin), compatible con el ecosistema whisper.cpp; etiquetado tambien como gguf en los tags del repositorio |
| Tamano del repositorio | 3.5 GB (suma de las cuatro variantes) |
| Runtime de referencia | whisper.cpp (`whisper-cli -m <fichero>`) |
| Modelo base | ivrit-ai/whisper-large-v3-turbo-ggml (relacion: quantized) |
| Pipeline | automatic-speech-recognition |
| Fecha de creacion | 2026-09-12 |

Desglose de ficheros publicado por el autor:

| Fichero | Cuantizacion | Tamano |
|---|---|---|
| `ggml-ivrit-whisper-large-v3-turbo-f16.bin` | f16 | 1625 MB |
| `ggml-ivrit-whisper-large-v3-turbo-q8_0.bin` | q8_0 | 874 MB |
| `ggml-ivrit-whisper-large-v3-turbo-q5_0.bin` | q5_0 | 574 MB |
| `ggml-ivrit-whisper-large-v3-turbo-q4_0.bin` | q4_0 | 474 MB |

## Arquitectura y entrenamiento

La arquitectura de partida es Whisper large-v3-turbo, un transformer encoder-decoder con preprocesado del audio en espectrogramas Mel. La variante "turbo" reduce el numero de capas del decodificador respecto a large-v3, lo que rebaja el coste de inferencia a cambio de una ligera perdida de precision en algunas tareas. La adaptacion a hebreo corre a cargo de ivrit-ai, que publica el checkpoint original; este repositorio no documenta el proceso de fine-tune, el volumen de datos de audio empleado, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR, pero no confirmados en la informacion disponible).

La innovacion tecnica de este repositorio es exclusivamente de empaquetado y cuantizacion. Segun el autor, los ficheros se generaron con el conversor propio de whisper.cpp a partir del checkpoint upstream y despues se cuantizaron con el cuantizador de la misma libreria. El autor indica que cada variante se comprobo transcribiendo muestras cortas en portugues e ingles antes de subirlas; no se menciona ninguna validacion sobre audio en hebreo. La variante f16 es una conversion sin perdida y se mantiene como espejo sin modificar del fichero de ivrit-ai. La unica funcion del repositorio es la de alojar copias con enlaces estables para las aplicaciones Odysseus y Open WebUI.

## Capacidades

- Transcripcion de voz a texto en hebreo, con salida de texto plano y marcas de tiempo a nivel de segmento (funcionalidad estandar de whisper.cpp).
- Procesamiento por ventanas de 30 segundos, con encadenamiento de ventanas para ficheros de audio de mayor duracion.
- Ejecucion completamente local y sin conexion a red, al no depender de APIs externas.
- Inferencia en CPU, con soporte opcional de aceleracion por GPU dentro de las capacidades de whisper.cpp.
- Despliegue en cuatro perfiles de memoria distintos gracias a las cuantizaciones f16, q8_0, q5_0 y q4_0.
- Integracion en aplicaciones de terceros que embeban whisper.cpp (entre ellas, segun el autor, Odysseus y Open WebUI).
- No dispone de tool calling ni de function calling: no es un modelo de lenguaje conversacional.
- No dispone de modo agente, razonamiento multi-paso ni thinking mode.
- No tiene capacidades de vision, audio comprensivo ni generacion de texto libre mas alla de la transcripcion.
- Multilingue: no. El modelo esta etiquetado unicamente para hebreo (`language: he`).

## Casos de uso

- Transcripcion de reuniones y clases en hebreo: el modelo convierte grabaciones de audio en texto con marcas de tiempo, y su tamano reducido permite ejecutar el proceso en el portatil del propio usuario, sin enviar el audio a un servicio externo.
- Subtitulado de video en hebreo: la salida con marcas de tiempo por segmento se puede convertir directamente al formato SRT o VTT mediante utilidades de whisper.cpp para generar subtitulos de forma local.
- Notas de voz en aplicaciones moviles: la variante q5_0 (574 MB) o q4_0 (474 MB) permite transcribir en el propio dispositivo, evitando el coste de red y los problemas de privacidad de enviar audio a un servidor.
- Archivado y busqueda de contenido audiovisual en hebreo: transcripcion por lotes de un fondo de audio o video para indexarlo y permitir busquedas por texto sobre el contenido hablado.
- Atencion al cliente en hebreo: transcripcion de llamadas grabadas para su analisis posterior, revision de calidad o cumplimiento normativo, ejecutando la inferencia en infraestructura propia.
- Investigacion en procesamiento del habla: uso del modelo como linea base de ASR en hebreo en entornos sin GPU, comparando las distintas cuantizaciones para medir el impacto de la compresion en la tasa de error.
- Accesibilidad: generacion de transcripciones en directo o diferido para personas con discapacidad auditiva en contenidos hablados en hebreo.
- Aplicaciones de escritorio integradas: cualquier cliente que embeba whisper.cpp (como los mencionados Odysseus y Open WebUI) puede incorporar el modelo sin cambios en el codigo, simplemente apuntando al fichero .bin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de palabras (WER), comparaciones con otros modelos ni evaluaciones sobre conjuntos de test en hebreo. El autor unicamente menciona que verifico cada variante transcribiendo muestras cortas en portugues e ingles, sin aportar metricas ni resultados en hebreo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente el tamano del fichero mas el margen de trabajo del runtime. Valores orientativos (estimacion propia a partir de los tamanos publicados, no confirmados por el autor):
  - f16 (1625 MB): del orden de 2 GB de memoria.
  - q8_0 (874 MB): del orden de 1,2 GB.
  - q5_0 (574 MB): del orden de 900 MB.
  - q4_0 (474 MB): del orden de 700 MB.
- Cabe en GPU de consumo: si, en cualquiera de las cuantizaciones. Modelos como RTX 3060, RTX 4060, RTX 4090 y equivalentes tienen VRAM de sobra; incluso las variantes de mayor tamano ocupan menos de 2 GB.
- GPU de datacenter (A100, H100): compatibles, aunque sobredimensionadas para este modelo; su uso solo se justifica para procesamiento por lotes a gran escala.
- CPU: las cuatro variantes estan pensadas para ejecucion en CPU. En hardware modesto (Raspberry Pi, mini-PC, moviles) las opciones recomendadas son q5_0 y q4_0; el autor describe q5_0/q5_k como la eleccion "amigable para telefono".
- Opciones de despliegue: whisper.cpp mediante `whisper-cli -m <fichero>`, el servidor HTTP de whisper.cpp y cualquier aplicacion que embeba la libreria (Odysseus, Open WebUI, bindings de Python, Node.js, etc.).
- vLLM y TGI no son aplicables a este formato GGML; para usarlos habria que partir del checkpoint original en formato Hugging Face.
- Latencia y throughput: no disponible. Dependen del hardware y de la cuantizacion elegida, y el autor no publica medidas.
- Compromiso calidad/tamano segun el autor: q8_0 es practicamente identico en precision a f16 con aproximadamente un 55 % del tamano; q5_0 y q5_k son la opcion intermedia; las variantes q4_* son las mas pequenas y conllevan un coste pequeno de precision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JoaoZaokk/ivrit-whisper-large-v3-turbo-ggml | No disponible (arquitectura Whisper large-v3-turbo) | Ventanas de 30 s | Hebreo | GGML | Apache 2.0 | Hugging Face, 4 cuantizaciones |
| ivrit-ai/whisper-large-v3-turbo-ggml (upstream) | No disponible (arquitectura Whisper large-v3-turbo) | Ventanas de 30 s | Hebreo | GGML | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3-turbo | No disponible en la informacion proporcionada | Ventanas de 30 s | Multilingue | Safetensors / PyTorch | Apache 2.0 | Hugging Face |
| Whisper large-v3 (OpenAI) | No disponible en la informacion proporcionada | Ventanas de 30 s | Multilingue | Safetensors / PyTorch | Apache 2.0 | Hugging Face |

La diferencia entre este repositorio y su upstream (ivrit-ai/whisper-large-v3-turbo-ggml) es que aqui se anaden variantes cuantizadas q8_0, q5_0 y q4_0, mientras que la f16 se mantiene como espejo sin cambios. Frente a las versiones multilingues de OpenAI, el ajuste de ivrit-ai esta especializado en hebreo, por lo que se espera mejor comportamiento en ese idioma a costa de perder cobertura multilingue. No hay datos publicos de rendimiento en este repositorio que permitan cuantificar esas diferencias.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al ser un ajuste sobre audio en hebreo, puede heredar los sesgos presentes en los datos de entrenamiento del modelo original y del fine-tune, sin que se haya publicado ninguna evaluacion al respecto.
- Riesgo de alucinacion: la familia Whisper es propensa a generar texto plausible en segmentos con silencio, musica o ruido, especialmente en las cuantizaciones mas agresivas. No hay evaluacion especifica para esta conversion.
- Validacion insuficiente: el autor solo indica haber comprobado las variantes con muestras cortas en portugues e ingles, no en hebreo, que es el idioma objetivo del modelo. La calidad real en hebreo no esta verificada en la model card.
- Limitacion idiomatica: el modelo esta etiquetado exclusivamente para hebreo. Su uso en otros idiomas no esta soportado ni evaluado.
- Perdida de precision por cuantizacion: q5_0 y, sobre todo, q4_0 reducen el tamano a costa de precision. Para produccion donde la exactitud sea critica, conviene usar f16 o q8_0.
- Ausencia de metricas: no hay WER publicado, ni comparativas, ni resultados de benchmarks. Cualquier decision de despliegue deberia acompanarse de una evaluacion propia sobre el dominio objetivo.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion. El autor recomienda citar a los autores originales (ivrit-ai) y recuerda que los pesos son trabajos derivados del modelo upstream, cuya licencia se mantiene. El repositorio no ofrece garantia alguna ("no warranty").
- Reputacion del repositorio: 0 descargas y 0 likes en el momento de la consulta. Es un espejo de conveniencia creado para mantener estables los enlaces de dos aplicaciones concretas, no un modelo con adopcion verificada por la comunidad.
- Mantenimiento: el autor advierte de que el repositorio se mantiene de forma manual y sin garantias; la disponibilidad a largo plazo depende de su criterio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JoaoZaokk/ivrit-whisper-large-v3-turbo-ggml
- Modelo base (upstream): https://huggingface.co/ivrit-ai/whisper-large-v3-turbo-ggml
- Perfil del autor de la conversion: https://huggingface.co/JoaoZaokk
- Motor de inferencia whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente aparecieron enlaces a sitios de apuestas sin relacion con el contenido. No se han encontrado papers, blogs ni demos adicionales asociados a este repositorio.
