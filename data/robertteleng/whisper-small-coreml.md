# robertteleng/whisper-small-coreml

## Resumen

`robertteleng/whisper-small-coreml` es una conversion de formato del modelo OpenAI Whisper small, preparada para ejecucion en dispositivo dentro de una aplicacion iOS. No se trata de un modelo nuevo ni reentrenado: los pesos son exactamente los de `openai/whisper-small`, pero el encoder se ha exportado a CoreML (`.mlpackage`) para que lo ejecute el Apple Neural Engine, mientras que los pesos del decoder se distribuyen aparte en `safetensors`. El repositorio lo publica el usuario robertteleng y se apoya en su propia herramienta de conversion, `coreml-forge`.

El interes practico esta en el trabajo de conversion, no en el modelo en si: trazar el encoder para que CoreML lo acepte y el Neural Engine lo ejecute realmente, en lugar de degradar a CPU. Eso permite planteamientos de transcripcion de voz totalmente local en iPhone o iPad, sin enviar audio a un servidor.

Las limitaciones son explicitas y conviene tenerlas claras antes de evaluarlo: el repositorio contiene unicamente el encoder, no es un transcriptor listo para usar (hay que ejecutar el decoder por separado), no se publican benchmarks de latencia ni de memoria en hardware real, y hereda el comportamiento conocido de Whisper, incluyendo alucinaciones en silencios y calidad desigual segun el idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small); encoder convertido a CoreML, decoder distribuido en safetensors |
| Parametros totales | Aproximadamente 244 M (heredados de `openai/whisper-small`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (formato estandar de Whisper small); no es un modelo de contexto de texto |
| Tipos de cuantizacion | No disponible; el repositorio no documenta cuantizacion del encoder ni del decoder |
| Idiomas soportados | Multilingue, heredados de `openai/whisper-small`; el repositorio no lista el conjunto concreto de idiomas |
| Licencia | Apache-2.0 (siguiendo `openai/whisper-small`) |
| Formato de pesos | CoreML `.mlpackage` (encoder) y safetensors (decoder) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small: un transformer encoder-decoder con encoder de 12 capas sobre representaciones mel-espectrales de 80 bins y decoder autorregresivo de 12 capas, con 768 dimensiones ocultas y 8 cabezas de atencion por capa. El encoder procesa ventanas de 30 segundos de audio y el decoder genera la transcripcion token a token, con tokens especiales para deteccion de idioma y marcas de tiempo.

No ha habido entrenamiento ni ajuste alguno en este repositorio. El autor lo describe explicitamente como una conversion de formato, no como un modelo nuevo: mismos pesos, misma calidad de transcripcion y mismos idiomas que `openai/whisper-small`. El trabajo tecnico consiste en el trazado (`tracing`) del encoder para que CoreML lo acepte y para que el Apple Neural Engine lo ejecute en lugar de caer a CPU. La conversion se realiza con la herramienta `robertteleng/coreml-forge`, mediante el script `scripts/export_whisper.py`, y la separacion encoder/decoder es una decision de diseno deliberada para poder ejecutar el decoder fuera de CoreML.

## Capacidades

- Reconocimiento automatico de voz (ASR) multilingue, con la misma calidad y cobertura de idiomas que `openai/whisper-small`.
- Transcripcion de audio en ventanas de hasta 30 segundos, con soporte de marcas de tiempo y deteccion de idioma heredados de Whisper.
- Ejecucion local del encoder en el Apple Neural Engine, lo que habilita inferencia en dispositivo sin conexion de red.
- Integracion en aplicaciones iOS mediante CoreML y `coremltools`.
- Separacion encoder/decoder que permite escoger el runtime del decoder (por ejemplo, ejecucion en CPU/GPU mientras el encoder va al Neural Engine).
- No incluye tool calling, function calling, razonamiento multi-paso, vision ni audio generativo: es exclusivamente un modelo de transcripcion.
- No es un transcriptor listo para usar de forma autonoma: requiere que el desarrollador implemente la parte de decoder y el bucle de decodificacion.

## Casos de uso

- Transcripcion de voz sin conexion en aplicaciones iOS: el encoder se ejecuta en el Neural Engine del dispositivo, de modo que el audio del usuario nunca sale del terminal, algo relevante para aplicaciones de notas de voz, dictado o diarios personales.
- Subtitulado local de contenido audiovisual en el movil: procesando el audio en ventanas de 30 segundos y generando marcas de tiempo, se pueden producir subtitulos sin subir el material a un servicio externo.
- Asistentes de accesibilidad: integracion en apps de transcripcion en vivo para personas con discapacidad auditiva, aprovechando el procesamiento en dispositivo para mantener baja la latencia percibida y evitar costes de API.
- Grabaciones de reuniones en entornos con conectividad limitada o requisitos de privacidad: el audio se transcribe en el propio dispositivo, lo que simplifica el cumplimiento de normativas de proteccion de datos.
- Preprocesado de comandos de voz en apps moviles: la transcripcion local alimenta despues un modulo de comprension o un LLM remoto, reduciendo el ancho de banda necesario al enviar solo texto en lugar de audio.
- Prototipado e investigacion en eficiencia de inferencia: al ser una conversion de referencia a CoreML, sirve como banco de pruebas para medir el comportamiento del encoder de Whisper small en el Neural Engine frente a ejecuciones en CPU o GPU.
- Aplicaciones de campo sin cobertura (periodismo, trabajo de campo, inspecciones tecnicas): la transcripcion se realiza en el dispositivo y se sincroniza posteriormente cuando hay red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica explicitamente que no hay mediciones en dispositivo: no se aportan cifras de latencia ni de consumo de memoria en hardware real. La model card si afirma que la calidad de transcripcion es identica a la de `openai/whisper-small`, al tratarse de los mismos pesos sin reentrenamiento, pero no acompania esa afirmacion con numeros de WER ni con comparaciones medidas.

## Requisitos de hardware

- Hardware objetivo: Apple Neural Engine de dispositivos iPhone/iPad recientes y de ordenadores Mac con chip de la serie M. El encoder esta exportado especificamente para ejecutarse en el ANE en lugar de la CPU.
- El repositorio ocupa 0.5 GB, lo que da una idea del orden de magnitud del encoder en CoreML mas los pesos del decoder; el espacio necesario en disco es, por tanto, del orden de cientos de megabytes.
- VRAM y memoria unificada: no disponible. No hay cifras publicadas de consumo de memoria en dispositivo.
- GPU dedicadas (A100, H100, RTX 4090) no son el objetivo de este repositorio: no se distribuyen pesos en formatos orientados a CUDA (safetensors solo cubre el decoder, y el encoder esta en `.mlpackage`).
- Compatibilidad con `llama.cpp`, Ollama, vLLM o TGI: no disponible en este repositorio, ya que no se publican pesos en GGUF ni en formatos habituales de estos servidores. Para esos despliegues habria que recurrir a otras conversiones de Whisper.
- Latencia y throughput: no disponible. La model card senala que la conversion apunta a una version reciente de iOS y que objetivos de despliegue mas antiguos pueden requerir una reexportacion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto de audio | Licencia | Notas |
|---|---|---|---|---|---|
| `robertteleng/whisper-small-coreml` | ~244 M (heredados) | CoreML `.mlpackage` + safetensors | 30 s por ventana | Apache-2.0 | Solo encoder en CoreML; el decoder debe ejecutarse aparte; sin benchmarks publicados |
| `openai/whisper-small` | ~244 M | PyTorch / safetensors | 30 s por ventana | Apache-2.0 | Modelo original, pesos identicos; requiere infraestructura PyTorch y no esta optimizado para el Neural Engine |
| `openai/whisper-base` | ~74 M | PyTorch / safetensors | 30 s por ventana | Apache-2.0 | Version mas ligera de la misma familia; menor calidad de transcripcion esperada, sin conversion CoreML en este repositorio |
| Conversiones GGML/GGUF de Whisper para `whisper.cpp` | Depende del tamano elegido | GGUF | 30 s por ventana | Segun el repositorio de conversion | Alternativa orientada a CPU y a despliegue fuera del ecosistema Apple; no disponible en este repositorio |

## Limitaciones y advertencias

- No es un transcriptor autonomo: solo se distribuye el encoder en CoreML y los pesos del decoder en safetensors. El desarrollador debe implementar el bucle de decodificacion y el preprocesado de audio.
- Ausencia total de benchmarks: no hay cifras publicadas de latencia, memoria ni consumo energetico en hardware real, lo que impide estimar el rendimiento en produccion sin medirlo uno mismo.
- Alucinaciones en silencio: hereda el comportamiento documentado de Whisper, que puede generar texto inexistente en fragmentos de audio sin voz.
- Calidad desigual entre idiomas: la propia model card advierte de un rendimiento no uniforme segun el idioma, algo caracteristico de Whisper.
- Compatibilidad de version de iOS: la conversion apunta a una version reciente del sistema; objetivos de despliegue mas antiguos pueden exigir una reexportacion del encoder.
- Sesgos: no se documentan analisis de sesgo en el repositorio; al ser una copia de los pesos de OpenAI, se heredan los sesgos del modelo original, que no se detallan aqui.
- Licencia: Apache-2.0, lo que permite uso comercial, pero el modelo es de OpenAI y este repositorio solo redistribuye un formato convertido; conviene mantener la atribucion correspondiente.
- Descargas y adopcion nulas en el momento de la consulta (0 descargas, 0 likes), por lo que no existe una comunidad que haya validado la conversion en produccion.
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este repositorio: los enlaces encontrados correspondian a sitios de material de animacion sin relacion con el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/robertteleng/whisper-small-coreml
- Herramienta de conversion `coreml-forge`: https://github.com/robertteleng/coreml-forge
- Modelo base `openai/whisper-small`: https://huggingface.co/openai/whisper-small
