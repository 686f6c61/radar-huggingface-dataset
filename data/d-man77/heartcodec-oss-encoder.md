# D-MaN77/HeartCodec-oss-encoder

## Resumen

HeartCodec OSS Encoder es un checkpoint de pesos de solo codificador (encoder-only) para la tokenizacion de audio del sistema HeartCodec, publicado por el usuario D-MaN77 en HuggingFace. No es un modelo de lenguaje ni un modelo multimodal completo: es la mitad de un codes audiovisual neuronal, concretamente la parte que transforma una onda de audio en una representacion discreta. Para funcionar necesita emparejarse con el checkpoint HeartCodec-oss-20260123, que aporta el cuantizador RVQ compartido y el decodificador de audio.

La relevancia de esta publicacion es que separa los pesos del codificador de los del decodificador, algo poco habitual en los codecs neuronales de audio, que suelen distribuirse como un unico paquete. El pipeline conjunto convierte audio en ocho flujos de tokens a 12,5 Hz y reconstruye estereo a 48 kHz. El repositorio ocupa unos 2,1 GB y contiene 1.006 tensores de codificador en `encoder.safetensors` (aproximadamente 2,15 GB).

El proyecto esta orientado a la comunidad de investigacion musical, como indica el propio autor. El codigo de referencia y los ejemplos de reconstruccion se encuentran en el repositorio GitHub HeartMuLa/heartlib, y la licencia declarada es Apache-2.0. No hay datos publicados sobre arquitectura interna detallada, numero de parametros ni composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador neuronal de audio con tokenizacion RVQ (residual vector quantization); detalles internos no disponibles |
| Parametros totales | No disponible (el checkpoint contiene 1.006 tensores, ~2,15 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (procesa audio, no secuencias de texto) |
| Tipos de cuantizacion | FP32 (unico tipo validado en la model card) |
| Idiomas soportados | No aplica (modelo de audio, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`encoder.safetensors`) |

## Arquitectura y entrenamiento

El checkpoint es un codificador de audio que forma parte de un codes neuronal. El sistema completo de HeartCodec combina este codificador con un cuantizador RVQ y un decodificador que residen en el checkpoint HeartCodec-oss-20260123. La cuantizacion residual por vectores genera ocho flujos de tokens a una tasa de 12,5 Hz, lo que equivale a 100 tokens por segundo de audio. La reconstruccion final es estereo a 48 kHz.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la arquitectura interna de las capas del codificador ni el uso de tecnicas como RLHF o DPO, que en cualquier caso no aplican al entrenamiento tipico de un codec de audio. La model card indica que los pesos del codificador preservan nombres, formas, dtypes y valores del checkpoint original, y que las diferencias respecto al decodificador emparejado se limitan a ocho flags de inicializacion del RVQ que cambian de forma escalar a `[1]`. El cargador de checkpoints divididos verifica estrictamente que los pesos de codificador y decodificador correspondan.

## Capacidades

- Tokenizacion de audio: convierte una onda de audio en ocho flujos de tokens discretos a 12,5 Hz.
- Reconstruccion de audio: junto con el decodificador emparejado, reconstruye estereo a 48 kHz.
- Entrada flexible: acepta tensores float32 con formas `[samples]`, `[1, samples]` o `[2, samples]`.
- Salida directa a MP3 a 320 kbps desde float32, sin WAV PCM intermedio; tambien admite salida `.wav`.
- Ajuste de recorte: la salida se recorta a la duracion de la entrada.
- Control de generacion en la decodificacion: parametros `num_steps` (pasos del decodificador) y `guidance_scale` (escala de guiado); el ejemplo validado usa 10 pasos y 1,25.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: ninguna adicional declarada (no hay vision, audio comprensivo ni modo thinking).

## Casos de uso

- Reconstruccion y verificacion de codecs: util para reproducir un audio de entrada a traves del pipeline completo encoder-RVQ-decoder y medir fidelidad y duracion; el ejemplo oficial `run_music_reconstruction.py` cubre exactamente este flujo.
- Preprocesado para modelos generativos de musica: la tokenizacion a 100 tokens por segundo y ocho flujos permite alimentar modelos autorregresivos o de difusion que trabajen sobre representaciones discretas de audio.
- Compresion de audio para almacenamiento: la representacion tokenizada reduce el audio a secuencias discretas manejables, adecuadas para almacenar o transmitir en lugar del waveform original.
- Investigacion en cuantizacion vectorial residual: al estar los pesos del codificador separados, facilita experimentos que sustituyan o analicen el cuantizador y el decodificador de forma independiente.
- Generacion de datasets de audio tokenizado: se puede ejecutar el codificador sobre grandes colecciones musicales para producir tokens reutilizables en entrenamiento de otros modelos.
- Integracion en herramientas de produccion musical: el codigo de heartlib expone una API Python (`tokenize`/`detokenize`) que permite incrustar el codec en un DAW, un servicio de conversion o una cadena de postproduccion.
- Analisis comparativo de codecs: permite estudiar el comportamiento de un codec RVQ de ocho flujos y 12,5 Hz frente a alternativas en tareas de reconstruccion musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe una validacion funcional, no una comparativa de calidad:

| Prueba de validacion | Resultado |
|---|---|
| Hardware | NVIDIA B300 |
| Precision | FP32 |
| Tamano de lote | 1 |
| Semilla | 42 |
| Duracion del audio | 239,293 s estereo |
| Forma de los tokens | `[8, 2992]` |
| Pasos del decodificador | 10 |
| Escala de guiado | 1,25 |
| Resultado | Salida finita, no silenciosa, estereo a 48 kHz, misma duracion que la entrada |
| Memoria pico asignada (PyTorch) | ~12,65 GiB |
| Memoria pico reservada (PyTorch) | ~15,41 GiB |

El autor advierte explicitamente que estas cifras corresponden a una unica entrada y configuracion, y que no constituyen requisitos minimos de memoria ni un benchmark de calidad de audio.

## Requisitos de hardware

- VRAM estimada: en la validacion oficial, el pipeline completo (codificador + decodificador) en FP32 y lote 1 alcanza 12,65 GiB de memoria asignada y 15,41 GiB reservada. Es una medicion de un solo caso, no un minimo garantizado.
- GPU recomendadas: el unico hardware documentado es una NVIDIA B300. No hay recomendaciones oficiales para otras GPU.
- GPU de consumo: no hay datos confirmados. Con 12,65 GiB en FP32, es probable que requiera GPU con mas de 12 GB de VRAM, pero no hay confirmacion del fabricante ni del autor.
- Opciones de despliegue: el unico camino soportado es la libreria `heartlib` (instalacion via `pip install -e .`), con Python 3.10, PyTorch con soporte CUDA y `ffmpeg` para salida MP3. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son aplicables a un codec de audio de este tipo.
- Latencia y throughput: no disponibles. La unica referencia temporal es un round trip de 239,293 s de audio en una B300 con batch 1, sin datos de tiempo de ejecucion.
- Nota de memoria: el checkpoint contiene solo los pesos del codificador; la memoria pico reportada incluye tambien el decodificador emparejado.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. La categoria natural de comparacion son los codecs neuronales de audio con cuantizacion residual (familia a la que pertenecen propuestas como EnCodec o DAC), pero no se han facilitado especificaciones, tasas de tokens, licencias ni resultados de estos sistemas, por lo que no se ofrece una tabla numerica que podria inducir a error.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeartCodec OSS Encoder | no disponible | no aplica | validacion funcional, sin benchmark de calidad | Apache-2.0 | HuggingFace, requiere checkpoint decodificador pareja |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: este repositorio contiene unicamente los pesos del codificador. Sin el checkpoint `HeartMuLa/HeartCodec-oss-20260123` no hay decodificador ni cuantizador RVQ, y el sistema no puede reconstruir audio.
- Cargadores incompatibles: no se debe pasar este repositorio a `HeartCodec.from_pretrained()`, pensado para checkpoints de solo decodificador. El cargador de checkpoints divididos aplica una verificacion estricta de pesos.
- Cuantizador compartido: no se admite cargar dos cuantizadores entrenados por separado; el RVQ pertenece al checkpoint del decodificador.
- Precision unica documentada: la validacion se hizo en FP32. No se describen variantes cuantizadas ni rutas de menor precision.
- Sin datos de sesgo, alucinacion o idioma: al ser un codec de audio, estas categorias no aplican del mismo modo, pero tampoco se han publicado evaluaciones de sesgo acustico, fidelidad subjetiva, artefactos ni comportamiento en generos musicales concretos.
- Cifras de memoria no extrapolables: el consumo de 12,65 GiB asignados corresponde a una unica entrada de 239,293 s en una B300 con batch 1; audios mas largos o lotes mayores pueden superar ese valor.
- Uso comercial: la licencia Apache-2.0 lo permite en principio, pero el autor remite a la licencia del checkpoint de origen y no ofrece garantias sobre derechos de los datos de entrenamiento, no documentados.
- Autor y proyecto: el repositorio pertenece al usuario D-MaN77, mientras que los checkpoints y el codigo emparejados se publican bajo la organizacion HeartMuLa; conviene verificar la trazabilidad entre ambos antes de integrarlo en produccion.
- Repositorio sin traccion: cero descargas y un like en el momento de la consulta, sin historial de mantenimiento ni issues publicos.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/D-MaN77/HeartCodec-oss-encoder
- Checkpoint decodificador emparejado: https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- Codigo y ejemplos de reconstruccion (heartlib): https://github.com/HeartMuLa/heartlib
- Licencia del modelo: Apache-2.0 (archivo `LICENSE` incluido en el repositorio)
- Checksums de pesos: archivo `SHA256SUMS` incluido en el repositorio
