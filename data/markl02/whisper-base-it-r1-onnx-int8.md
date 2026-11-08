# MarkL02/whisper-base-it-r1-onnx-int8

## Resumen

Whisper-base-it-r1 es un modelo de reconocimiento automatico del habla (ASR) para italiano, derivado de Whisper base y ajustado de nuevo sobre habla real en italiano. Lo publica MarkL02 como componente del motor de transcripcion de PiGreco Studio, un editor de video para podcasts que se ejecuta integramente en el navegador del telefono. El modelo parte de `LocalAI-io/whisper-base-it-multi` (licencia MIT) y se distribuye en formato ONNX con pesos cuantizados a int8, pensado para `transformers.js` y ONNX Runtime Web, lo que permite inferencia offline en el cliente sin backend.

La relevancia practica esta en su tamano (76,9 MB en total) y en que la exportacion conserva las atenciones cruzadas, de modo que la aplicacion puede obtener marcas temporales a nivel de palabra. El ajuste fino se realizo sobre 48 horas de audio italiano de `espnet/yodas` (`it000`), con un filtrado previo de clips cuyos subtitulos no coincidian con el audio (tasa de error de caracteres superior a 0,20). El resultado es una mejora medible en WER sobre el modelo de partida en dominios conversacionales y de podcast.

No es un modelo generalista multilingue ni compite en tareas de razonamiento: es una pieza de infraestructura de transcripcion orientada a un caso de uso concreto, con metricas publicadas por el autor y un pipeline de decodificacion documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base), exportado a ONNX |
| Parametros totales | no disponible (el modelo base Whisper base tiene 72,6 M de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | int8 (pesos) |
| Idiomas soportados | italiano (`it`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_model_int8.onnx`, `decoder_model_int8.onnx` u equivalentes; el decoder supera los 25 MiB) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: un transformer encoder-decoder con atencion estandar, sin mecanismos de atencion lineal ni capas SSM. El modelo original de OpenAI se entreno con supervision debil sobre audio-subtitulo a gran escala; en este caso se parte de una version ya ajustada al italiano (`LocalAI-io/whisper-base-it-multi`) y se realiza un segundo ajuste fino sobre 48 horas de `espnet/yodas` (`it000`), compuesto por videos de YouTube en italiano con subtitulos de los propios subidores (CC-BY 3.0).

El proceso de curacion del dataset es destacable: un modelo mayor verifico cada clip y descarto aquellos cuya tasa de error de caracteres entre subtitulo y audio superaba 0,20. El modelo final aprendio exclusivamente de los subtitulos humanos, no de las transcripciones del verificador. La exportacion a ONNX conserva las atenciones cruzadas, lo que habilita la extraccion de tiempos por palabra en la aplicacion. La decodificacion se evalua con `<|notimestamps|>` mas las marcas temporales derivadas de atencion cruzada, y las puertas de evaluacion se congelaron antes del entrenamiento.

## Capacidades

- Transcripcion de voz a texto en italiano, con salida de texto plano.
- Marcas temporales a nivel de palabra mediante atenciones cruzadas, aptas para alinear subtitulos en edicion de video.
- Inferencia offline en navegador mediante `transformers.js` y ONNX Runtime Web.
- Ejecucion en dispositivo (telefono) sin llamadas a servidor, gracias al tamano reducido del paquete.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni uso como agente.
- Capacidad multilingue limitada al italiano.
- No incluye vision, audio de entrada mas alla del propio ASR, ni modo de razonamiento explicito.

## Casos de uso

- Edicion de podcasts en el navegador: el modelo transcribe el audio y, gracias a las marcas temporales por palabra, permite cortar y reordenar segmentos con precision de decenas de milisegundos sin subir el audio a un servidor.
- Generacion automatica de subtitulos en italiano: la salida con tiempos por palabra se puede exportar directamente a formatos de subtitulado (SRT, VTT) para publicacion en plataformas.
- Transcripcion de entrevistas y llamadas telefonicas: el ajuste sobre MINDS-14 reduce el WER del 41,5 % al 30,5 % en llamadas, lo que lo hace util para actas y resumenes posteriores en entornos con audio degradado.
- Herramientas de accesibilidad: transcripcion en vivo o diferida de contenido en italiano dentro de aplicaciones web, sin dependencia de servicios cloud y con coste marginal cero por minuto.
- Busqueda y indexacion de archivos de audio: al disponer de tiempos por palabra, se puede construir un indice buscable sobre archivos de podcast o video almacenados localmente.
- Prototipado rapido de funciones de voz en aplicaciones web: al integrarse con `transformers.js`, permite anadir ASR italiano a una SPA sin infraestructura de GPU ni backend de inferencia.
- Analisis de contenido en dispositivos con restricciones de privacidad: al ejecutarse offline en el cliente, el audio no abandona el dispositivo, lo que facilita el cumplimiento en entornos con requisitos de proteccion de datos.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con la decodificacion de la aplicacion (`<|notimestamps|>` mas tiempos por atencion cruzada). Ningun video de test aparece en los datos de entrenamiento.

| Conjunto de test | Modelo de partida | Este modelo |
|---|---|---|
| Podcast, mitad reservada (1562 palabras) | 21,2 % WER | 17,2 % |
| FLEURS it, 60 clips | 15,5 % | 14,7 % |
| MINDS-14 it, 80 llamadas telefonicas | 41,5 % | 30,5 % |
| Cortes de una sola palabra, limpios a 50 ms | 45,6 % | 44,7 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto en la informacion disponible, y no serian aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en int8; el paquete completo ocupa 76,9 MB, por lo que la inferencia cabe holgadamente en memoria de dispositivo movil.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en GPUs integradas. En servidor, cualquier GPU de inference (T4, L4, A10, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU de consumo: si, en cualquier GPU consumer (RTX 3060, 4060, 4090) e incluso en GPUs integradas y telefonos modernos.
- Opciones de despliegue: `transformers.js` con ONNX Runtime Web (objetivo principal), ONNX Runtime nativo, y potencialmente llama.cpp u otras runtimes ONNX; no esta pensado para vLLM ni TGI, que no soportan este formato de forma directa.
- Latencia y throughput: no disponibles de forma numerica en la informacion proporcionada. El autor indica que el decoder se publica en partes de 20 MiB y se une en el telefono, lo que sugiere un arranque condicionado por la descarga y el ensamblado del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MarkL02/whisper-base-it-r1-onnx-int8 | ~72,6 M (base) | ventana de 30 s (Whisper) | italiano | MIT | ONNX int8 | Ajuste sobre yodas it000; tiempos por palabra |
| MarkL02/whisper-base-it-onnx-int8 | ~72,6 M (base) | ventana de 30 s | italiano | MIT | ONNX int8 | Mismo modelo de partida, sin el segundo ajuste |
| LocalAI-io/whisper-base-it-multi | ~72,6 M (base) | ventana de 30 s | italiano | MIT | safetensors / ONNX | Modelo base del que deriva |
| openai/whisper-base | 72,6 M | ventana de 30 s | multilingue | MIT | safetensors, ONNX | Modelo original sin ajuste especifico al italiano |

## Limitaciones y advertencias

- El modelo omite de forma sistematica las interjecciones "eh" y "ehm" porque los subtitulos de entrenamiento no las incluyen; la aplicacion las detecta por separado en el audio y las ofrece como sugerencias.
- El WER en llamadas telefonicas sigue siendo alto (30,5 %), por lo que no es adecuado para transcripcion de calidad profesional en audio muy degradado.
- Los cortes de una sola palabra mantienen un WER del 44,7 %, lo que limita su uso en tareas de alineacion de palabras aisladas.
- No se han evaluado voces de adolescentes: el autor indica explicitamente que no habia ninguna en los conjuntos de test, por lo que el rendimiento en ese grupo es desconocido.
- Riesgo de alucinacion presente, como en todos los modelos Whisper, especialmente en silencios, musica o audio no vocal.
- El soporte linguistico se limita al italiano; no debe usarse con otros idiomas.
- La licencia MIT permite uso comercial, pero el dataset de entrenamiento (`espnet/yodas`, CC-BY 3.0) impone obligaciones de atribucion sobre los datos originales; conviene revisar la cadena de licencias antes de un despliegue comercial.
- El decoder supera los 25 MiB, lo que obliga a trocear la distribucion en partes de 20 MiB y a ensamblarlas en el cliente; esto anade complejidad operativa en el despliegue web.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay validacion independiente de las metricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MarkL02/whisper-base-it-r1-onnx-int8
- Modelo base: https://huggingface.co/LocalAI-io/whisper-base-it-multi
- Version previa sin el segundo ajuste: https://huggingface.co/MarkL02/whisper-base-it-onnx-int8
- Dataset de entrenamiento: https://huggingface.co/datasets/espnet/yodas
- Modelo original Whisper base: https://huggingface.co/openai/whisper-base
- Exportacion ONNX de referencia: https://huggingface.co/square-zero-labs/whisper-base/blob/main/onnx/encoder_model_int8.onnx
- Repositorio de la aplicacion (mencionado en la model card): `apps/studio/build.mjs` de PiGreco Studio (sin URL publica en la informacion disponible)
