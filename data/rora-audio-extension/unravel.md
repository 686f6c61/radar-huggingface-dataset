# RORA-AUDIO-EXTENSION/unravel

## Resumen

RORA Unravel es un export a ONNX del modelo HT-Demucs de Meta, preparado por el usuario RORA-AUDIO-EXTENSION para ejecutar separacion de fuentes musicales (stems) directamente en el navegador dentro de la extension de Chrome RORA. A partir de una mezcla musical estereo, el modelo aísla cuatro pistas: bateria, bajo, otros instrumentos y voz. El repositorio ocupa 0,1 GB, usa la libreria ONNX y se publica bajo licencia MIT.

Se trata de un modelo de audio, no de lenguaje: no procesa texto ni mantiene contexto conversacional. Trabaja sobre fragmentos de 7,8 segundos de audio estereo a 44,1 kHz y su salida reproduce la calidad de separacion del HT-Demucs original, con una coincidencia de 43,7 dB SDR o mejor frente al modelo PyTorch de Meta en cada stem de las canciones de prueba.

Su relevancia radica en el formato de despliegue: el grafo contiene la red HT-Demucs sin las etapas de STFT e ISTFT, de modo que el llamante calcula el espectrograma (n_fft 4096, hop 1024, ventana Hann periodica, normalizada, igual que en `HTDemucs._spec`) y suma el espectrograma inverso de `spec_out` a `time_out`. Esto permite ejecutar la separacion en el cliente sin depender de un servidor, algo poco habitual en modelos de separacion de fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HT-Demucs (Hybrid Transformer Demucs), red hibrida tiempo-frecuencia con transformadores; exportada a ONNX sin STFT/ISTFT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; procesa fragmentos de 7,8 s por inferencia) |
| Tipos de cuantizacion | pesos almacenados en fp16 (como el checkpoint de Meta) y convertidos a fp32 en tiempo de carga; no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es un export a ONNX del checkpoint `htdemucs` de Meta (pesos `955717e8-8726e21a.th`). HT-Demucs es una arquitectura hibrida que combina procesamiento en el dominio temporal y en el dominio espectral mediante bloques de atencion tipo transformer; esta descrita en el articulo "Hybrid Transformers for Music Source Separation" (Rouard, Massa y Defossez, ICASSP 2023). El grafo ONNX contiene unicamente la red, sin las etapas de STFT e ISTFT, que quedan a cargo del llamante.

No se proporciona informacion sobre el dataset de entrenamiento, el numero de tokens o ejemplos, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables en este dominio). El autor tampoco documenta procesos de destilacion o cuantizacion posteriores al export. La unica innovacion tecnica descrita es la separacion de la STFT/ISTFT del grafo para facilitar la ejecucion en navegador, junto con la conservacion de los pesos en fp16 para reducir el tamano del repositorio.

Las interfaces de entrada y salida son las siguientes:

| Entrada | Forma | Descripcion |
|---|---|---|
| `mix` | (1, 2, 343980) float32 | 7,8 s de audio estereo a 44,1 kHz |
| `spec` | (1, 4, 2048, 336) float32 | espectrograma del fragmento (izq. real, izq. imag., der. real, der. imag.) |

| Salida | Forma | Descripcion |
|---|---|---|
| `spec_out` | (1, 4, 4, 2048, 336) | espectrograma por fuente |
| `time_out` | (1, 4, 2, 343980) | salida temporal por fuente |

## Capacidades

- Separacion de fuentes musicales en cuatro stems: bateria, bajo, otros y voz.
- Procesamiento de audio estereo a 44,1 kHz en fragmentos de 7,8 segundos.
- Inferencia en navegador mediante ONNX Runtime (el propio caso de uso de la extension RORA).
- Coincidencia con la salida del modelo PyTorch original de 43,7 dB SDR o mejor por stem en las canciones de prueba.
- Salida dual: espectrograma por fuente (`spec_out`) y forma de onda por fuente (`time_out`).
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, por tratarse de un modelo de audio.
- No se documentan capacidades de vision, audio generativo ni modos de razonamiento.

## Casos de uso

- Separacion de stems en el navegador: el modelo puede ejecutarse en el cliente dentro de una extension de Chrome, de modo que el usuario separa una cancion en bateria, bajo, otros y voz sin subir el audio a un servidor.
- Karaoke y practica musical: al aislar la pista de voz, un usuario puede generar versiones instrumentales o practicar sobre la base aislada; el bajo y la bateria permiten ademas estudiar lineas ritmicas y armonicas por separado.
- Edicion y remezcla ligera: productores que necesitan retocar un stem concreto (por ejemplo, atenuar la bateria) pueden obtener las pistas y reutilizarlas en un DAW, con la ventaja de no depender de infraestructura en la nube.
- Muestreo y creacion de loops: la separacion permite extraer fragmentos de bateria o bajo limpios para construir librerias de samples o bases para nuevas composiciones.
- Investigacion en separacion de fuentes: el export sirve como referencia para comparar implementaciones ONNX frente al modelo PyTorch original, dado que el autor reporta la coincidencia en dB SDR.
- Prototipado local sin GPU dedicada: al ser un export ONNX de un modelo de tamano moderado, permite integrar separacion de fuentes en aplicaciones de escritorio o web sin depender de servicios externos.
- Preservacion y analisis de audio: util para transcripcion asistida o analisis musical donde conviene disponer de cada fuente de forma independiente.

## Benchmarks y rendimiento

El unico dato de rendimiento documentado es la coincidencia espectral frente al modelo PyTorch de Meta. No se publican resultados de MMLU, HumanEval, GSM8K ni equivalentes, ya que no es un modelo de lenguaje.

| Metrica | Valor | Comparacion |
|---|---|---|
| SDR frente a HT-Demucs PyTorch (por stem) | 43,7 dB o mejor | Todos los stems de las canciones de prueba |

El autor indica que la calidad de separacion es la de HT-Demucs, al coincidir la salida exportada con la del modelo original dentro del margen medido.

## Requisitos de hardware

- El repositorio de pesos ocupa 0,1 GB en fp16; al cargarse en fp32, la huella en memoria del checkpoint ronda los 0,2 GB, sin contar activaciones ni buffers intermedios.
- Orientado a ejecucion en navegador mediante ONNX Runtime, presumiblemente con backend WASM o WebGPU; el autor no especifica el backend concreto.
- No se detallan GPU recomendadas ni requisitos minimos de VRAM en la informacion proporcionada.
- Por tamano, es plausible que quepa en GPUs de consumo e incluso en equipos sin GPU dedicada mediante ejecucion en CPU, si bien no hay cifras publicadas que lo confirmen.
- Opciones de despliegue documentadas: ONNX Runtime (el modelo es un grafo ONNX). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RORA Unravel (este modelo) | no disponible | fragmentos de 7,8 s a 44,1 kHz | 43,7 dB SDR o mejor frente a HT-Demucs PyTorch | MIT | ONNX, uso en navegador |
| HT-Demucs (Meta, PyTorch) | no disponible | segmentos configurables | referencia del export | MIT | PyTorch, `facebookresearch/demucs` |
| Otros separadores (Demucs v3, Spleeter, Open-Unmix) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para comparar con alternativas como Demucs v3, Spleeter u Open-Unmix.

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de generacion de texto, razonamiento, codigo y capacidades conversacionales.
- Alucinacion en sentido estricto no aplica; en su lugar, pueden aparecer artefactos o fugas entre stems (bleeding) propios de la separacion de fuentes.
- La ventana de procesamiento es de 7,8 segundos por inferencia, por lo que audios mas largos requieren segmentacion y ensamblado por parte del llamante, lo que puede introducir discontinuidades si no se solapan los fragmentos.
- El grafo no incluye STFT ni ISTFT: el llamante debe calcular el espectrograma con los parametros exactos indicados (n_fft 4096, hop 1024, ventana Hann periodica, normalizada) y sumar el espectrograma inverso de `spec_out` a `time_out`; un calculo incorrecto degrada la salida.
- Solo soporta audio estereo a 44,1 kHz y no se documenta soporte para mono, otros ratios de muestreo o mas de dos canales.
- Licencia MIT, que permite uso comercial, pero los pesos derivan de HT-Demucs de Meta, tambien bajo MIT; conviene conservar la atribucion a Meta Platforms, Inc. y citar el articulo de ICASSP 2023.
- El repositorio no tiene descargas ni likes y fue publicado por un usuario no verificado; no hay garantias de mantenimiento ni de validacion independiente mas alla de la cifra declarada por el autor.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los resultados obtenidos corresponden a una idol de K-pop llamada Rora y no guardan relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RORA-AUDIO-EXTENSION/unravel
- Repositorio de HT-Demucs de Meta: https://github.com/facebookresearch/demucs
- Articulo: Simon Rouard, Francisco Massa y Alexandre Defossez, "Hybrid Transformers for Music Source Separation", ICASSP 2023 (no se proporciona enlace directo en la informacion disponible)
- No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs, repos o demos) relacionados con este modelo.
