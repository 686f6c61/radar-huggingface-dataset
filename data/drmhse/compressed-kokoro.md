# drmhse/compressed-kokoro

## Resumen

Compressed Kokoro es una familia de decodificadores de波形 (vocoders) comprimidos para el modelo de síntesis de voz Kokoro-82M, desarrollado por el usuario drmhse. El modelo base Kokoro-82M, de hexgrad, es un sistema TTS ligero que combina un codificador de texto basado en ALBERT, un predictor de prosodia y un decodificador iSTFTNet que genera la forma de onda final. El decodificador concentra el 65% de los parámetros totales del modelo, por lo que comprimirlo es la vía más directa para reducir tamano y latencia sin tocar el resto del pipeline.

Este repositorio no reentrena el modelo completo: mantiene intactos el lado del texto (ALBERT, codificador de texto y predictor de prosodia) y las 28 voces en inglés, y sustituye únicamente el decodificador por variantes podadas y destiladas a partir del propio decodificador de Kokoro. Se ofrecen tres variantes con distintos compromisos entre tamano, velocidad y calidad: `H512_G512` (59,3M parámetros, 73% del original), `H512_G256_S128-128` (46,8M, 57%) y `H512_G256` (44,0M, 54%).

La relevancia actual reside en que permite desplegar TTS de calidad cercana a Kokoro en entornos con recursos limitados (CPU, GPUs de consumo, dispositivos embebidos) manteniendo la compatibilidad total con el paquete `kokoro` y su API, gracias a un mecanismo de carga que intercambia el decodificador sin modificar el resto del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (ALBERT + text encoder + prosody predictor + decoder iSTFTNet con AdaIN residual blocks) |
| Parametros totales | 59,3M (`H512_G512`), 46,8M (`H512_G256_S128-128`), 44,0M (`H512_G256`) frente a 81,8M de Kokoro-82M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos del decodificador en f32; no se documentan cuantizaciones) |
| Idiomas soportados | en (ingles; US English `a` y UK English `b` en KPipeline) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`decoder.safetensors`, f32, weight norm plegada) + `config.json` |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de Kokoro-82M en la parte textual y de prosodia, y sustituye el decodificador por variantes comprimidas. El decodificador original consta de una pila de bloques residuales AdaIN (anchura 1024) y un generador de波形 iSTFTNet con dos etapas de sobremuestreo (256 y 128 canales) seguido de una STFT inversa. Los nombres de las variantes codifican las anchuras: `H` es la anchura AdaIN, `G` la entrada del generador y `S` las anchuras por etapa cuando difieren de `G/2, G/4`.

El proceso de compresion combina poda y destilacion: primero se inicializan los canales por importancia de pesos, manteniendolos consistentes en todos los tensores que los leen o escriben; despues se aplica destilacion con excitacion compartida, donde Kokoro y el estudiante reciben la misma excitacion (seno y ruido aleatorios) en la misma ventana de 1,6 s, lo que convierte la波形 de Kokoro en un objetivo exacto y aprendible, fase incluida. Las perdidas incluyen STFT multiresolucion, log-mel y un termino STFT complejo multiresolucion que elimino un artefacto de crujido sin entrenamiento adversario (GAN). Los datos de entrenamiento son 21,5 horas de salida del propio Kokoro: 12.000 frases de 18 libros de dominio publico, las 28 voces, 10% a velocidad variable. El entrenamiento se realizo en una GPU Apple M4, con 5.000 pasos (unas 1,7 h) para las variantes de generador ancho y 30.000 pasos para `H512_G256`.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles a partir de texto, con salida de audio a 24 kHz.
- Mantiene intactas las 28 voces en ingles de Kokoro, con pronunciacion, timing y prosodia identicos al modelo base.
- Compatibilidad total con el paquete `kokoro` (KPipeline, gestion de voces, parametro `speed=`).
- Carga mediante `slim.load`, que construye el `KModel` oficial e intercambia el decodificador.
- Soporte de ingles US (`lang_code='a'`) y UK (`lang_code='b'`).
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo TTS).

## Casos de uso

- Sintesis de voz en dispositivos de recursos limitados: las variantes de 44-47M parametros permiten generar audio en CPU o GPUs de consumo manteniendo inteligibilidad, gracias a la reduccion del 43-46% de parametros frente a Kokoro.
- Lectura de articulos y documentos en aplicaciones de accesibilidad: el pipeline completo de Kokoro (texto a fonemas, prosodia y decodificador) sigue funcionando, por lo que se puede integrar en lectores de pantalla o herramientas de lectura por voz con latencia reducida.
- Generacion de audiolibros y contenido narrado: con 28 voces y salida a 24 kHz, la variante `H512_G512` ofrece calidad indistinguible de Kokoro en pruebas ciegas, adecuada para narracion de larga duracion.
- Asistentes de voz embebidos: el decodificador mas rapido (`H512_G256`, 2,65x frente a Kokoro) reduce el coste computacional por frase, util en sistemas con presupuesto de CPU ajustado.
- Prototipado e investigacion en compresion de modelos: el repositorio incluye el codigo y la receta en `training/`, lo que permite reproducir el proceso de poda y destilacion sobre otros decodificadores.
- Integracion en pipelines de TTS existentes: al ser un reemplazo directo del decodificador, se puede adoptar sin cambiar el codigo de la aplicacion que ya use Kokoro, simplemente cargando la variante deseada.

## Benchmarks y rendimiento

Resultados sobre un conjunto de test de 112 frases de tres libros de dominio publico no usados en entrenamiento, 4 por voz para las 28 voces (13,9 min). Comparacion con el decodificador original de Kokoro sobre las mismas entradas (mismos fonemas, duraciones, prosodia y excitacion).

| Metrica | Kokoro | `H512_G512` | `H512_G256_S128-128` | `H512_G256` |
|---|---:|---:|---:|---:|
| Whisper small.en WER | 2,51% | 2,39% | 2,27% | 2,43% |
| log-mel L1 vs Kokoro (menor mejor) | — | 0,179 | 0,245 | 0,274 |
| SNR de波形 vs Kokoro (mayor mejor) | — | 8,7 dB | 7,3 dB | 6,2 dB |
| coseno de espectro a largo plazo (media / peor) | — | 0,9983 / 0,992 | 0,9969 / 0,990 | 0,9954 / 0,982 |
| tasa de artefacto en tramas voiced (menor mejor) | — | 4,8% | 6,9% | 20,7% |
| Velocidad del decodificador (RTF relativo) | 1,00x | 1,03x | 1,39x | 2,65x |
| Parametros del modelo completo | 81,8M (100%) | 59,3M (73%) | 46,8M (57%) | 44,0M (54%) |

Prueba de escucha ciega entre Kokoro y `H512_G512`: 22 pares (una frase por voz, orden aleatorio, loudness-matched, con dos pares trampa ocultos de Kokoro contra si mismo). El oyente respondio "igual" en 18 de los 20 pares reales, prefirio Kokoro en uno y la variante slim en otro, y respondio "igual" en ambos pares trampa. Las diferencias de WER (56-62 errores) estan dentro del ruido de un test de este tamano.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el decodificador se distribuye en f32 y el modelo completo ronda los 44-59M parametros, por lo que el peso en memoria es reducido (del orden de cientos de MB incluyendo el resto del pipeline Kokoro).
- GPU recomendadas: no se especifican; el entrenamiento se realizo en una GPU Apple M4 con PyTorch MPS.
- Cabe en GPU de consumo: si, dado el reducido numero de parametros; se ha validado en Apple M4 (MPS). No se documentan pruebas en RTX 4090, A100 o H100.
- Opciones de despliegue: paquete `kokoro` (version 0.9.4) con PyTorch; `slim.load` para intercambiar el decodificador; `soundfile` para escritura de audio; `huggingface_hub` para descarga. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: el RTF del decodificador relativo a Kokoro es 1,03x (`H512_G512`), 1,39x (`H512_G256_S128-128`) y 2,65x (`H512_G256`), medido en Apple M4 GPU, PyTorch MPS, batch 1, mediana sobre ejecuciones intercaladas. No se aportan cifras absolutas de latencia ni throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Kokoro-82M (base) | 81,8M | no aplica (TTS) | referencia | apache-2.0 | Hugging Face (hexgrad/Kokoro-82M) |
| Compressed Kokoro `H512_G512` | 59,3M | no aplica (TTS) | indistinguible en prueba ciega (18/20 "igual") | apache-2.0 | Hugging Face (drmhse/compressed-kokoro) |
| Compressed Kokoro `H512_G256_S128-128` | 46,8M | no aplica (TTS) | cercana a Kokoro, artefacto 6,9% | apache-2.0 | Hugging Face (drmhse/compressed-kokoro) |
| Compressed Kokoro `H512_G256` | 44,0M | no aplica (TTS) | artefacto audible en voiced (20,7%) | apache-2.0 | Hugging Face (drmhse/compressed-kokoro) |

No se proporcionan en la informacion disponible comparaciones con otros modelos TTS de la misma categoria (por ejemplo, otros vocoders o sistemas TTS ligeros), por lo que la comparativa se limita a las variantes del propio repositorio y al modelo base.

## Limitaciones y advertencias

- La prueba de escucha ciega se realizo con un unico oyente y 20 pares por comparacion, sin anclas tipo MUSHRA; el autor advierte que "indistinguible" debe tratarse como evidencia fuerte, no como prueba definitiva.
- `H512_G256_S128-128` no habia sido sometida a la prueba de escucha en el momento de redactar la model card (texto truncado: "has not yet been throu...").
- La variante `H512_G256` presenta un artefacto audible descrito como "silbido ronco tenue" en algunos sonidos voiced (tasa de artefacto 20,7% frente a 4,8% de `H512_G512`), que el entrenamiento adicional no elimino.
- Solo soporta ingles (US y UK); no se documentan otros idiomas.
- El modelo es un TTS, no un modelo de lenguaje: no tiene contexto textual, tool calling ni razonamiento.
- La licencia es apache-2.0, lo que permite uso comercial, pero se heredan las condiciones del modelo base Kokoro-82M (tambien apache-2.0).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.
- La distancia mel puede enganar segun el autor: entre dos de sus modelos discrepo del oyente y de otras metricas, por lo que no debe usarse como unica metrica de calidad.
- El decodificador se distribuye en f32; no se documentan versiones cuantizadas ni formatos GGUF/ONNX para despliegue en otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drmhse/compressed-kokoro
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Codigo y receta de entrenamiento: carpeta `training/` dentro del repositorio de Hugging Face
- Informes por fichero: carpeta `results/` dentro del repositorio de Hugging Face
- Muestras de audio: carpeta `samples/` dentro del repositorio de Hugging Face
- Paquete `kokoro` (PyPI): no disponible en la informacion proporcionada (se instala con `pip install kokoro==0.9.4`)
