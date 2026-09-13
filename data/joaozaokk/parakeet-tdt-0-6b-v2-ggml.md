# JoaoZaokk/parakeet-tdt-0.6b-v2-ggml

## Resumen

parakeet-tdt-0.6b-v2-ggml es una reconversion al formato GGML del checkpoint nvidia/parakeet-tdt-0.6b-v2 (.nemo, en ingles) que NVIDIA publico como modelo de reconocimiento automatico del habla. El autor del repositorio, JoaoZaokk, no entrena ni modifica los pesos: unicamente los reempaqueta para que puedan cargarse con el motor Parakeet TDT incluido en whisper.cpp a partir de la version 1.9, mediante el binario `parakeet-cli`.

El interes practico del repositorio es la disponibilidad de variantes cuantizadas de un modelo de ~0,6 mil millones de parametros en ficheros que van de 350 MB (q4_0) a 1237 MB (f16), lo que permite ejecutar transcripcion de voz en dispositivos de consumo, portatiles y moviles, sin depender de servicios en la nube. Se distribuyen cuatro variantes: f16 (conversion sin perdida), q8_0 (precisa y aproximadamente el 55 % del tamano de f16), q5_0 (orientada a moviles) y q4_0 (la mas pequena, con una ligera perdida de exactitud).

La relevancia actual del repositorio es de infraestructura mas que de investigacion: sirve para mantener estables los enlaces de descarga que consumen las aplicaciones nativas Odysseus y Open WebUI. El modelo solo soporta ingles, mantiene la licencia cc-by-4.0 del checkpoint original y no es compatible con los ficheros GGUF generados por mudler/parakeet.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; por nomenclatura y motor de ejecucion corresponde a un decodificador TDT (token-and-duration transducer) de la familia Parakeet |
| Parametros totales | ~0,6 mil millones (segun el identificador del modelo base, parakeet-tdt-0.6b-v2) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, q8_0, q5_0, q4_0 |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGML (ficheros `.bin`: `ggml-parakeet-tdt-0.6b-v2-f16.bin`, `-q8_0.bin`, `-q5_0.bin`, `-q4_0.bin`) |

Detalle de ficheros del repositorio (2,7 GB en total):

| Fichero | Cuantizacion | Tamano | Nota |
|---|---|---|---|
| `ggml-parakeet-tdt-0.6b-v2-f16.bin` | f16 | 1237 MB | Conversion sin perdida |
| `ggml-parakeet-tdt-0.6b-v2-q8_0.bin` | q8_0 | 659 MB | Exactitud casi identica a f16, ~55 % del tamano |
| `ggml-parakeet-tdt-0.6b-v2-q5_0.bin` | q5_0 | 427 MB | Opcion recomendada para telefonia/movilidad |
| `ggml-parakeet-tdt-0.6b-v2-q4_0.bin` | q4_0 | 350 MB | La mas pequena, con coste de exactitud |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento en los datos proporcionados. El repositorio es exclusivamente una conversion de formato: los pesos son obras derivadas del checkpoint nvidia/parakeet-tdt-0.6b-v2 (.nemo) y conservan su licencia. El autor indica que la conversion se realizo con el convertidor propio del motor y que cada variante se cuantizo con el cuantizador del propio motor.

Como verificacion minima, cada variante fue comprobada transcribiendo muestras cortas en portugues e ingles antes de subirse. No se documentan tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO, ya que ese trabajo pertenece al modelo original de NVIDIA y no a este repositorio.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, tarea declarada en el pipeline del repositorio.
- Ejecucion local/on-device: los ficheros GGML estan pensados para inferencia sin conexion en CPU o GPU de consumo.
- Cuatro niveles de compromiso tamano/exactitud, lo que permite desplegar el mismo modelo en movil (q4_0/q5_0) o en servidor (f16/q8_0).
- Integracion con el motor Parakeet TDT de whisper.cpp >= 1.9 mediante `parakeet-cli -m <fichero>`.
- Uso como backend estable para aplicaciones nativas, en concreto Odysseus y Open WebUI segun el autor.
- No se documentan capacidades de traduccion, diarizacion de hablantes, marcas de tiempo a nivel de palabra, tool calling ni razonamiento multi-paso.

## Casos de uso

- Transcripcion on-device en portatil: con la variante q5_0 (427 MB) el modelo cabe en memoria sin GPU dedicada, lo que permite transcribir audio local sin enviar datos a terceros.
- Subtitulado de video en ingles: dado el tamano reducido de los ficheros, se puede integrar en un pipeline de postproduccion que procese lotes de pistas de audio y genere subtitulos sin coste por minuto de API.
- Aplicaciones moviles offline: las variantes q4_0 (350 MB) y q5_0 (427 MB) son las adecuadas para empaquetar dictado por voz en una app Android/iOS que funcione sin conectividad.
- Asistentes de voz y dictado en escritorio: el motor se invoca con `parakeet-cli`, por lo que encaja como componente de captura de voz en herramientas de productividad local.
- Procesamiento de audio con requisitos de privacidad: sectores como salud, legal o banca pueden transcribir grabaciones internas manteniendo el audio dentro de la infraestructura propia, siempre que el contenido sea en ingles.
- Backend de transcripcion para aplicaciones autoalojadas: el autor mantiene el repositorio para que los enlaces de descarga de Odysseus y Open WebUI sean estables, de modo que estas apps pueden consumir los ficheros directamente.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de grabaciones para generar indices de texto buscables en un servidor pequeno, usando q8_0 (659 MB) si se prioriza exactitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente menciona comprobaciones cualitativas mediante transcripcion de muestras cortas en portugues e ingles para validar cada variante cuantizada, sin cifras de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM para inferencia segun el fichero de pesos: q4_0 ~350 MB, q5_0 ~427 MB, q8_0 ~659 MB, f16 ~1237 MB. Hay que sumar la memoria de trabajo del motor (procesado de mel, activaciones del encoder y buffers de decodificacion), no cuantificada en la informacion disponible.
- Cabe en practicamente cualquier GPU de consumo (por ejemplo RTX 3060, RTX 4060 o superiores) e incluso en CPU moderna, dado el tamano de 0,6 mil millones de parametros.
- No se dispone de requisitos oficiales para A100/H100 ni de recomendaciones de NVIDIA para el checkpoint original en la informacion proporcionada.
- Opciones de despliegue: whisper.cpp >= 1.9 con el motor Parakeet TDT (`parakeet-cli -m <fichero>`). No se documentan soportes oficiales para vLLM, TGI, Ollama ni llama.cpp en este repositorio.
- Incompatibilidad conocida: los ficheros GGUF de mudler/parakeet.cpp no son validos para este motor, y viceversa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoZaokk/parakeet-tdt-0.6b-v2-ggml | ~0,6 mil millones | No disponible | GGML (.bin) | cc-by-4.0 | HuggingFace, 0 descargas y 0 likes en la fecha de consulta |
| nvidia/parakeet-tdt-0.6b-v2 (origen) | ~0,6 mil millones | No disponible | .nemo | cc-by-4.0 | HuggingFace (modelo base) |
| Modelos Whisper en formato GGML dentro de whisper.cpp | No disponible en la informacion proporcionada | No disponible | GGML | No disponible | Distribuidos junto con whisper.cpp |
| mudler/parakeet.cpp GGUF | No disponible | No disponible | GGUF | No disponible | Referenciado solo como formato incompatible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: la etiqueta de idioma del repositorio es `en`, aunque el autor menciona haber validado las conversiones con muestras en portugues. No debe asumirse soporte multilingue.
- Riesgo de alucinacion y errores de transcripcion: no se publican cifras de WER, por lo que la exactitud en dominios concretos (audio con ruido, acentos, jerga tecnica) es desconocida.
- Perdida de exactitud por cuantizacion: las variantes q5_0 y q4_0 pueden degradar la calidad frente a f16; q8_0 se describe como casi identica a f16 al 55 % del tamano.
- Compatibilidad estricta de motor: requiere whisper.cpp >= 1.9 con el motor Parakeet TDT y no funciona con los GGUF de mudler/parakeet.cpp.
- Repositorio de terceros con garantia nula: el propio autor declara "No warranty" y el modelo no ha recibido descargas ni likes en la fecha de consulta, por lo que no hay validacion de la comunidad.
- Licencia cc-by-4.0: permite uso comercial, pero exige atribucion a los autores originales (NVIDIA) y mantiene los terminos del checkpoint de origen.
- Trazabilidad limitada: no se publican hashes, scripts de conversion ni registros detallados del proceso, solo la descripcion del metodo.
- Fechas del repositorio: creado y actualizado el 2026-09-12 segun los metadatos de HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/parakeet-tdt-0.6b-v2-ggml
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Perfil del autor de la conversion: https://huggingface.co/JoaoZaokk
- Motor de ejecucion: https://github.com/ggml-org/whisper.cpp
- Las busquedas web realizadas no devolvieron enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relacion con el repositorio.
