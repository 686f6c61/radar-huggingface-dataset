# codebucketsolutions/sepformer-libri3mix-onnx

## Resumen

`codebucketsolutions/sepformer-libri3mix-onnx` es una exportacion a ONNX del modelo SpeechBrain `speechbrain/sepformer-libri3mix`, un sistema de separacion de fuentes de audio (speech separation) capaz de aislar tres voces simultaneas de una mezcla mono. Lo publica el usuario `codebucketsolutions` como artefacto auxiliar del servidor de voz `bolo`, con el objetivo de ejecutar la separacion sin depender de PyTorch en produccion. No es una release oficial de SpeechBrain: los pesos son identicos a los del modelo original, solo se ha reempaquetado el grafo de computacion.

El modelo resuelve un problema concreto: dada una grabacion donde varias personas hablan a la vez, devuelve tres pistas de audio separadas. SepFormer es una arquitectura transformer basada en atencion (masking network sobre un encoder/decoder de dominio tiempo), entrenada con perdida invariante a escala (SI-SNR). El modelo original reporta 19.0 dB SI-SNRi y 19.4 dB SDRi sobre el conjunto de test de Libri3Mix.

La relevancia de esta ficha esta en el formato: la exportacion ONNX permite desplegar el modelo en runtimes ligeros (ONNX Runtime, sin CUDA ni PyTorch), lo que facilita su integracion en servidores de audio, pipelines de transcripcion con multiples hablantes o sistemas de diarizacion. El repositorio ocupa 0.1 GB y la licencia es Apache-2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SepFormer (transformer con atencion multi-cabeza sobre mascaras en dominio tiempo; encoder, masking network y decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio mono a 8 kHz, longitud variable en muestras |
| Tipos de cuantizacion | float32 (grafo ONNX en precision completa); no se documentan variantes cuantizadas |
| Idiomas soportados | no disponible (entrenado sobre LibriSpeech, audiollibros en ingles; el modelo no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opsets 17), fichero `sepformer.onnx`; metadatos en `speechbrain_onnx.json` |

## Arquitectura y entrenamiento

SepFormer es un transformer disenado para separacion de habla. La senal de entrada se codifica en un dominio de tiempo mediante un encoder convolucional con stride de 8 muestras; una red de enmascaramiento basada en atencion (multi-head self-attention y feed-forward) estima mascaras por fuente; finalmente un decoder convolucional reconstruye cada pista. El modelo original se entrena con una perdida invariante a escala (SI-SNR), por lo que el nivel absoluto de las salidas es arbitrario y no se debe interpretar como ganancia calibrada.

El entrenamiento lo realizo el equipo de SpeechBrain sobre Libri3Mix, mezclas de tres hablantes generadas a partir de LibriSpeech (audiollibros en ingles, CC BY 4.0). Las variantes con ruido de LibriMix anaden ruido WHAM! (CC BY-NC 4.0). El modelo original reporta 19.0 dB SI-SNRi y 19.4 dB SDRi en el test de Libri3Mix.

La exportacion a ONNX conserva los pesos y la logica de `SepformerSeparation.separate_batch`. El grafo incluye encoder, masking network y decoder, con soporte de padding por strides de 8 muestras. El autor documenta una verificacion de paridad frente a SpeechBrain 1.1.2 con PyTorch 2.15.0 en CPU y ONNX Runtime 1.32.0: diferencias maximas absolutas entre 3.62e-04 y 1.00e-02, y SI-SNR minimo por pista entre 69.3 dB y 80.7 dB frente a la referencia PyTorch. La firma del grafo es `mixture: float32 [1, T]` (mono, 8 kHz) y `sources: float32 [1, 8 * ((T - 16) // 8) + 16, 3]`.

## Capacidades

- Separacion de tres hablantes simultaneos a partir de una mezcla mono.
- Entrada de audio a 8 kHz, longitud variable en muestras (procesamiento por ventanas para grabaciones largas).
- Salida de tres pistas float32 alineadas en el tiempo con la entrada.
- Exportacion ONNX ejecutable con ONNX Runtime sin PyTorch ni CUDA.
- Paridad numerica verificada frente al modelo PyTorch original (SI-SNR minimo de 69.3 dB en el peor caso documentado).
- No soporta tool calling, agentes, vision ni generacion de texto: es un modelo puramente de audio a audio.
- Capacidades multilingues: no aplica; el modelo opera sobre senal acustica, no sobre idioma, aunque fue entrenado con habla en ingles.

## Casos de uso

- **Transcripcion de reuniones con multiples hablantes**: separar la mezcla en tres pistas antes de pasarlas a un ASR, de modo que cada pista contenga una sola voz y el reconocedor no tenga que lidiar con solapamientos. Adecuado por su naturaleza de separacion por fuente.
- **Diarizacion asistida**: usar las tres salidas como preprocesado para un sistema de diarizacion, reduciendo la ambiguedad cuando hay solapamiento de voces.
- **Limpieza de grabaciones de entrevistas**: aislar la voz del entrevistador y del entrevistado en grabaciones donde hablan a la vez, para su posterior edicion o publicacion.
- **Preprocesado en pipelines de voz en produccion**: al estar en ONNX, se puede integrar en un servidor de audio (como el propio `bolo`) sin arrastrar PyTorch, reduciendo el tamano de la imagen de despliegue y las dependencias.
- **Analisis forense de audio**: separar voces en grabaciones con varios interlocutores para su analisis individual por parte de un perito.
- **Generacion de datasets de habla**: a partir de mezclas controladas, obtener pistas separadas para aumentar corpus de entrenamiento de modelos ASR o de separacion.
- **Prototipado en CPU**: al ejecutarse con ONNX Runtime en CPU, permite experimentar con separacion de habla en equipos sin GPU, a costa de mayor latencia.

## Benchmarks y rendimiento

El autor de la exportacion no publica benchmarks propios del modelo ONNX mas alla de la paridad numerica frente a PyTorch. Los datos del modelo original son los reportados por SpeechBrain:

| Metrica | Valor | Fuente |
|---|---|---|
| SI-SNRi (Libri3Mix test) | 19.0 dB | Model card original de SpeechBrain |
| SDRi (Libri3Mix test) | 19.4 dB | Model card original de SpeechBrain |
| Diferencia maxima absoluta ONNX vs PyTorch (ruido, 4003 muestras) | 7.65e-04 | `parity.json` del autor |
| Diferencia maxima absoluta ONNX vs PyTorch (ruido, 3008 muestras) | 3.62e-04 | `parity.json` del autor |
| Diferencia maxima absoluta ONNX vs PyTorch (ruido, 24000 muestras) | 6.52e-04 | `parity.json` del autor |
| Diferencia maxima absoluta ONNX vs PyTorch (ruido, 56005 muestras) | 7.95e-04 | `parity.json` del autor |
| Diferencia maxima absoluta ONNX vs PyTorch (mezcla de tres voces) | 1.00e-02 | `parity.json` del autor |
| SI-SNR minimo por pista ONNX vs PyTorch (peor caso) | 69.3 dB | `parity.json` del autor |

No se han publicado resultados de benchmarks adicionales (por ejemplo, comparativas con otros separadores) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explicita. El modelo es de tamano moderado (repositorio de 0.1 GB en float32), pero el autor advierte que el consumo de memoria crece rapidamente con la longitud del audio: varios GB para un minuto de audio. Se recomienda procesar en ventanas.
- **GPU recomendadas**: cualquier GPU con suficiente memoria para la ventana elegida; no se documentan modelos concretos (A100, H100, RTX 4090). Al ser un grafo ONNX, funciona tambien en CPU.
- **Consumer GPU**: si, siempre que se procese en ventanas cortas; el limite practico es la memoria, no el modelo en si.
- **Opciones de despliegue**: ONNX Runtime (probado por el autor con la version 1.32.0), integracion en el servidor `bolo`; tambien es posible usar el modelo original con SpeechBrain/PyTorch si se prefiere.
- **Latencia y throughput**: no disponibles. La verificacion de paridad se hizo en CPU con PyTorch 2.15.0+cpu y ONNX Runtime 1.32.0, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `codebucketsolutions/sepformer-libri3mix-onnx` | no disponible | audio mono 8 kHz, longitud variable | SI-SNRi 19.0 dB / SDRi 19.4 dB (heredados del original) | Apache-2.0 | ONNX en Hugging Face, 0 descargas |
| `speechbrain/sepformer-libri3mix` (original) | no disponible | audio mono 8 kHz, longitud variable | SI-SNRi 19.0 dB / SDRi 19.4 dB | Apache-2.0 | PyTorch en Hugging Face |
| `speechbrain/sepformer-libri2mix` | no disponible | audio mono 8 kHz, dos hablantes | no disponible en esta ficha | Apache-2.0 | PyTorch en Hugging Face |
| `speechbrain/resepformer-wsj02mix` | no disponible | audio mono 8 kHz, dos hablantes | no disponible en esta ficha | Apache-2.0 | PyTorch en Hugging Face |

La comparativa se limita a variantes de la familia SepFormer/ResepFormer de SpeechBrain, ya que no se dispone de datos de otros separadores en la informacion proporcionada. La diferencia clave de esta ficha frente al original es el formato (ONNX, sin PyTorch) y la verificacion de paridad numerica documentada por el autor.

## Limitaciones y advertencias

- **Nivel de salida arbitrario**: SepFormer se entreno con perdida invariante a escala; la amplitud de las tres pistas no es comparable entre si ni con la mezcla. No usar la salida para medir niveles.
- **Memoria crece con la longitud**: el autor advierte que un minuto de audio puede consumir varios GB; es obligatorio procesar en ventanas.
- **Solo tres hablantes**: el modelo esta entrenado para exactamente tres fuentes; con dos o cuatro hablantes el rendimiento cae y no hay garantia de asignacion estable de pistas entre ventanas.
- **Idioma de entrenamiento**: LibriSpeech es habla en ingles de audiollibros; el rendimiento en otros idiomas o en habla espontanea no esta documentado.
- **Sin benchmarks propios**: no hay evaluacion publicada del modelo ONNX sobre Libri3Mix ni sobre otros conjuntos; solo se verifica paridad numerica frente a PyTorch.
- **Riesgo de alucinacion**: no aplica en el sentido de generacion de texto, pero si existe riesgo de artefactos y de fuga entre pistas cuando la separacion falla.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base se entreno con LibriSpeech (CC BY 4.0) y las variantes con ruido anaden WHAM! (CC BY-NC 4.0); conviene revisar las condiciones de los datos de entrenamiento si se usa en productos comerciales.
- **No es una release oficial de SpeechBrain**: el autor lo indica explicitamente; para produccion conviene validar la paridad en el propio entorno.
- **Repositorio sin traccion**: 0 descargas y 0 likes en el momento de la consulta; no hay garantia de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/codebucketsolutions/sepformer-libri3mix-onnx
- Modelo base: https://huggingface.co/speechbrain/sepformer-libri3mix
- Repositorio del servidor `bolo`: https://github.com/cB-Sigma/bolo-speech
- SpeechBrain (framework): https://speechbrain.github.io/
- Manual de la cadena de herramientas IPU con ejemplo de SepFormer (resultado de busqueda): http://go/v1/Aefp9w_JW9WOawIIMAFsrDMQohWHX7RNek15WxMagMNrFhpeMBCXtavKKaYPd6UTk9Qgvdo6J3dkwNsGm8cLM-_6V6DtGmvPkMYMnEEwIkR1SwzBsPUGHIY__-J8t99Ys1zxj9Ydwd-goDWJ4PBLV3a6ez1TwZTm3JuqgcZYlIdsJrsMoXA8s6rLALTHv01DAVotDERqkK7Qcpj4qvqWcmEy9xjSmYRrTiBH7tStl4c2jFWSAKzUnWt00XC-5A8
