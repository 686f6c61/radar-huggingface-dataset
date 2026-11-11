# Andivee/dictando-english-plus-coreml

## Resumen

Dictando English Plus Core ML es un paquete de conversión a Core ML del checkpoint ConwayResearch/Underdog-Bark-3.0-Plus, orientado a reconocimiento automático del habla (ASR) en inglés sobre dispositivos iOS. Lo publica el usuario Andivee como parte del instalador de la app Dictando, y su función es permitir que la transcripción de voz se ejecute localmente en el dispositivo tras una descarga explícita del modelo, sin enviar audio a servidores externos.

El repositorio contiene tres componentes `.mlpackage` que se compilan en el dispositivo (iOS 18 o posterior), junto con un `Preprocessor.mlmodelc` y el vocabulario heredados de la exportación de Fluid Inference sobre la que se basa. El conjunto de 17 ficheros de runtime ocupa exactamente 502.517.064 bytes (aproximadamente 0,5 GB) e incluye un `manifest.json` con tamaños y hashes SHA-256 que la aplicación valida antes de cargar el modelo.

Se trata de una conversión derivada, no de un lanzamiento oficial del modelo original. La licencia es CC BY 4.0 y el único idioma declarado es el inglés. No se publican detalles sobre la arquitectura interna del checkpoint de origen, el número de parámetros ni la longitud de contexto, por lo que esta ficha se limita a los datos verificables del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint base ConwayResearch/Underdog-Bark-3.0-Plus; empaquetado como Core ML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos empaquetados como `.mlpackage` para Core ML) |
| Idiomas soportados | en (inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (`.mlpackage` compilado en dispositivo a `.mlmodelc`), más `Preprocessor.mlmodelc` y vocabulario |
| Tarea | automatic-speech-recognition (ASR) |
| Plataforma objetivo | iOS 18 o posterior, ejecución on-device |
| Tamano del repo | 0,5 GB (17 ficheros de runtime, 502.517.064 bytes) |
| Modelo base | ConwayResearch/Underdog-Bark-3.0-Plus (commit d4fab2f8b95681e5ad3cfb4e8c5f4e0c009b3deb) |
| Integridad | `manifest.json` con tamanos y SHA-256 por fichero |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del checkpoint original ConwayResearch/Underdog-Bark-3.0-Plus en los datos proporcionados: no se especifica si es un transformer, un modelo híbrido ni su configuración de capas. El repositorio documenta únicamente el proceso de conversión: tres componentes `.mlpackage` que se compilan en el dispositivo con iOS 18 o superior, un `Preprocessor.mlmodelc` y el vocabulario preservados de la exportación de Fluid Inference fijada como base.

Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo etapas de RLHF o DPO. La model card indica explícitamente que se trata de una conversión derivada y remite al fichero `NOTICE` para consultar los cambios de conversión y los créditos upstream, y a `LICENSE` para los términos de CC BY 4.0. Los ficheros se sirven como objetos completos, sin fragmentación `.part-NNN`, y se recomienda fijar las descargas a un commit publicado.

## Capacidades

- Reconocimiento automático del habla en inglés (`automatic-speech-recognition`), ejecutado localmente en el dispositivo.
- Funcionamiento on-device tras una descarga explícita del modelo, sin dependencia de servicios en la nube para la inferencia.
- Empaquetado Core ML compatible con iOS 18 o posterior, con compilación de los `.mlpackage` en el propio dispositivo.
- Validación de integridad de los 17 ficheros de runtime mediante hashes SHA-256 antes de la carga.
- Preprocesado de audio incluido mediante `Preprocessor.mlmodelc` y vocabulario asociado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento.

## Casos de uso

- Transcripción de dictado en apps iOS: el paquete está pensado para el instalador de Dictando English Plus, de modo que la app puede ofrecer dictado por voz en inglés con el modelo ejecutándose en el propio iPhone o iPad tras la descarga inicial.
- Procesamiento de audio con requisitos de privacidad: al ejecutarse on-device, el audio no sale del dispositivo, lo que encaja en entornos con políticas estrictas de tratamiento de datos (sanidad, legal, administración).
- Aplicaciones de campo sin conectividad: al no requerir red para la inferencia, resulta adecuado para escenarios offline donde la transcripción debe funcionar sin cobertura.
- Notas de voz y actas en inglés: integrable en apps de productividad que convierten grabaciones de reuniones o notas habladas en texto dentro del dispositivo.
- Distribución mediante App Store con modelo descargable: el esquema de ficheros completos con hashes y la recomendación de fijar el commit facilitan empaquetar la descarga como recurso opcional de la app.
- Evaluación de ASR on-device para desarrolladores iOS: sirve como referencia práctica de cómo convertir y desplegar un checkpoint de Hugging Face como componentes Core ML validados por manifiesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está empaquetado para ejecución en el Neural Engine y la GPU/CPU de dispositivos Apple, no para GPU de escritorio.
- GPU recomendadas: no disponible para el formato Core ML; el destino es hardware Apple (iPhone/iPad con iOS 18 o posterior).
- Cabe en consumer GPU: no disponible; el formato `.mlpackage`/`.mlmodelc` está orientado a dispositivos iOS, no a GPUs NVIDIA o AMD.
- Almacenamiento: aproximadamente 0,5 GB para los 17 ficheros de runtime (502.517.064 bytes), más el espacio temporal de compilación en dispositivo.
- Opciones de despliegue: Core ML en iOS 18 o posterior; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Idiomas | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| Andivee/dictando-english-plus-coreml | ASR | en | Core ML | CC BY 4.0 | no disponible | Conversión derivada, on-device iOS |
| ConwayResearch/Underdog-Bark-3.0-Plus | ASR (modelo base) | no disponible | no disponible | no disponible | no disponible | Checkpoint de origen del que deriva esta conversión |
| Whisper (variantes de OpenAI) | ASR | multilingüe | safetensors, GGUF, Core ML (comunidad) | MIT (según variante) | 30 s por ventana | Referencia habitual de ASR; datos no verificados en esta búsqueda |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no se declara cobertura multilingüe.
- Es una conversión derivada, no un lanzamiento oficial del modelo base; los cambios de conversión se documentan en `NOTICE` y deben revisarse antes de su uso.
- Requiere iOS 18 o posterior y compilación de los `.mlpackage` en el dispositivo, lo que añade tiempo de preparación en el primer uso.
- No se publican parámetros, arquitectura, contexto ni benchmarks, lo que impide evaluar su calidad frente a alternativas sin pruebas propias.
- Riesgo de alucinación y errores de transcripción inherente a los sistemas ASR; no se documentan tasas de error (WER) en la información disponible.
- Sesgos: no se documentan sesgos conocidos ni características del corpus de entrenamiento.
- Licencia CC BY 4.0: permite uso comercial con atribución; es obligatorio conservar la atribución y los créditos upstream indicados en `NOTICE` y `LICENSE`.
- Se recomienda fijar las descargas a un commit publicado y validar los hashes SHA-256 del `manifest.json` antes de cargar el modelo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Andivee/dictando-english-plus-coreml
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Plus
- Commit del checkpoint de origen: d4fab2f8b95681e5ad3cfb4e8c5f4e0c009b3deb
- Ficheros de referencia en el repo: `NOTICE`, `LICENSE`, `manifest.json`
