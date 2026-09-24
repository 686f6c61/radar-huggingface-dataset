# markstrom/pianissimo-sv-coreml

## Resumen

Pianissimo-sv-coreml es una conversion al formato CoreML del modelo de reconocimiento automatico del habla (ASR) Klang Pianissimo, desarrollado originalmente por Klang AI AB y publicado en HuggingFace como KlangAI/pianissimo-sv. El modelo reconoce voz en sueco y esta pensado para inferencia local en dispositivos Apple Silicon, aprovechando el Apple Neural Engine (ANE) a traves del framework CoreML. El autor de esta conversion es el usuario markstrom, que no ha reentrenado los pesos: unicamente ha cambiado el formato de los ficheros.

Arquitectonicamente es un modelo FastConformer (encoder) con decodificador TDT (Token-and-Duration Transducer), derivado por ajuste fino del modelo NVIDIA Parakeet TDT 0.6B v3. La conversion divide el pipeline en cuatro paquetes CoreML independientes (preprocesador, encoder, decoder y joint/decision) con pesos int8 en el encoder, mas un vocabulario de tokens en JSON.

Su relevancia es practica: permite ejecutar ASR en sueco sin conexion ni envio de audio a la nube, algo relevante para aplicaciones de dictado, transcripcion de reuniones y accesibilidad en el ecosistema Apple. El repositorio ocupa 0,7 GB, no registra descargas ni likes en el momento de la consulta y se distribuye bajo licencia CC BY 4.0, la misma que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT (Token-and-Duration Transducer, decoder); derivado de NVIDIA Parakeet TDT 0.6B v3 |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base del que deriva, NVIDIA Parakeet TDT 0.6B v3, indica ~0,6 mil millones de parametros en su nomenclatura) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica en el sentido de LLM: la entrada es audio mono a 16 kHz y el modelo opera por ventanas de audio |
| Tipos de cuantizacion | Pesos int8 en el encoder (`Encoder.mlpackage`); el resto de paquetes no especifican cuantizacion en la informacion disponible |
| Idiomas soportados | Sueco (sv) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CoreML `.mlpackage` (no safetensors ni GGUF); vocabulario en `parakeet_vocab.json` y metadatos en `manifest.json` |

## Arquitectura y entrenamiento

El modelo combina un encoder FastConformer con un decodificador TDT, la arquitectura transducer con prediccion conjunta de tokens y duraciones. Segun la model card, se trata de un ajuste fino de NVIDIA Parakeet TDT 0.6B v3 realizado por Klang AI AB para sueco. Esta ficha describe exclusivamente la conversion a CoreML: los pesos no se han reentrenado, solo se ha cambiado el formato, por lo que no hay datos nuevos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO asociadas a este repositorio.

La conversion separa el pipeline en cuatro paquetes que se compilan en el dispositivo con `MLModel.compileModel(at:)`: `Preprocessor.mlpackage` convierte audio mono a 16 kHz en caracteristicas log-mel de 128 bandas; `Encoder.mlpackage` contiene el encoder FastConformer con pesos int8; `Decoder.mlpackage` implementa la red de prediccion del TDT; y `JointDecisionv3.mlpackage` agrupa la red conjunta y la cabeza de decision. La carga se realiza con la API `AsrModels.loadLocal(from:version: .v3)` de FluidAudio, y el repositorio incluye `LICENSE-and-attribution.txt` con la revision exacta del modelo origen y la lista de cambios.

## Capacidades

- Reconocimiento automatico del habla en sueco a partir de audio mono a 16 kHz.
- Extraccion de caracteristicas log-mel de 128 bandas integrada en el propio pipeline CoreML (paquete `Preprocessor`).
- Decodificacion transducer con prediccion conjunta de token y duracion (TDT), orientada a transcripcion eficiente.
- Ejecucion local en Apple Silicon con aceleracion por Apple Neural Engine, sin dependencia de servicios en la nube.
- Salida de tokens mapeables a texto mediante el vocabulario `parakeet_vocab.json`.
- No dispone de tool calling ni function calling, no soporta agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento explicito.
- No se documentan capacidades multilingues: el unico idioma declarado es el sueco.
- No se documentan prestaciones de diarizacion de hablantes, marcas de tiempo a nivel de palabra ni puntuacion automatica.

## Casos de uso

- Dictado local en macOS e iOS: el modelo transcribe voz a texto directamente en el dispositivo a traves del ANE, de modo que el audio no sale del equipo, algo critico para notas personales o contenido confidencial.
- Transcripcion de reuniones en sueco: al ejecutarse en local se puede procesar audio de forma continua sin costes por minuto de API, siempre que la aplicacion gestione el troceado en ventanas.
- Subtitulado de contenido audiovisual en sueco: integrado en una app de edicion o en un pipeline de postproduccion que genere ficheros de subtitulos a partir de la pista de audio.
- Accesibilidad: conversion de voz a texto en tiempo real para personas con dificultades auditivas en entornos presenciales, con la ventaja de no requerir conectividad.
- Asistentes de voz y comandos por voz en aplicaciones nativas de Apple: la transcripcion local reduce la latencia percibida al eliminar el viaje de ida y vuelta a un servidor.
- Notas de campo sin cobertura: sectores como inspeccion tecnica, sanidad o trabajo de campo en Suecia pueden capturar informes por voz en zonas sin red.
- Analitica de llamadas con requisitos de privacidad: transcripcion on-premise de conversaciones telefonicas en sueco, manteniendo los datos dentro de la infraestructura Apple controlada por la organizacion.
- Prototipado de investigacion en ASR sueco: al ser una conversion directa del modelo original, sirve para comparar el comportamiento del pipeline CoreML frente a la implementacion PyTorch sin modificar los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de conversion no incluye tasas de error de palabra (WER), latencia ni comparaciones numericas, ni para el modelo original ni para la version CoreML. Tampoco se han encontrado datos de rendimiento en los resultados de busqueda web, que no contenian fuentes relevantes sobre este modelo.

## Requisitos de hardware

- Plataforma objetivo: dispositivos Apple Silicon (familia M) con soporte de Apple Neural Engine; la conversion CoreML no esta pensada para GPU NVIDIA ni para CPU x86.
- VRAM/unified memory estimada: no disponible en la informacion proporcionada. Como referencia de tamano, el repositorio completo ocupa 0,7 GB, con el encoder cuantizado a int8 como componente principal.
- GPU recomendadas: no aplica en el sentido habitual; el acelerador es el ANE del SoC Apple. No se documentan recomendaciones de GPU dedicada.
- Compatibilidad con GPU de consumo: no es un modelo ejecutable en RTX 4090, A100 o H100 a traves de este repositorio, ya que el formato CoreML esta atado al ecosistema Apple.
- Opciones de despliegue: CoreML con compilacion en dispositivo (`MLModel.compileModel(at:)`) y la libreria FluidAudio mediante `AsrModels.loadLocal(from:version: .v3)`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tiempo real ni de factor de tiempo real (RTF) para esta conversion.

## Comparativa con modelos similares

| Modelo | Tipo y formato | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| markstrom/pianissimo-sv-coreml | FastConformer + TDT, CoreML `.mlpackage` int8 | No disponible (base de ~0,6 mM por nomenclatura) | Sueco | CC BY 4.0 | HuggingFace, ejecucion en Apple Silicon |
| KlangAI/pianissimo-sv | FastConformer + TDT, pesos originales | No disponible | Sueco | CC BY 4.0 | HuggingFace; requiere entorno PyTorch |
| NVIDIA Parakeet TDT 0.6B v3 | FastConformer + TDT | ~0,6 mil millones segun nomenclatura | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo base del ajuste fino |
| OpenAI Whisper large-v3 | Encoder-decoder transformer | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Ampliamente usado como referencia ASR, pero sin datos comparativos en la informacion disponible |

No se dispone de cifras de WER ni de rendimiento comparado entre estas alternativas en la informacion proporcionada, por lo que la comparativa se limita a aspectos de formato, licencia e idioma.

## Limitaciones y advertencias

- Solo reconoce sueco (sv); no hay evidencia de soporte para otros idiomas, incluido el castellano.
- No se han publicado benchmarks ni tasas de error, por lo que no es posible estimar su precision objetivamente antes de desplegarlo.
- La cuantizacion int8 del encoder es una modificacion respecto a los pesos originales y puede introducir una perdida de precision respecto al modelo KlangAI/pianissimo-sv; no se documenta ninguna evaluacion de ese impacto.
- El repositorio no aporta datos sobre sesgos: no se describe la composicion del dataset de entrenamiento, la distribucion de acentos, edades, generos ni variantes dialectales del sueco.
- Riesgo de alucinacion y de sustituciones en audio con ruido, solapamiento de hablantes o vocabulario tecnico fuera de dominio; es un comportamiento habitual en modelos transducer y no se documenta mitigacion alguna.
- Licencia CC BY 4.0: permite uso comercial, pero obliga a atribuir la autoria a Klang AI AB y a indicar los cambios realizados. El repositorio incluye `LICENSE-and-attribution.txt` a tal efecto, y su incumplimiento invalidaria el uso.
- Dependencia de plataforma: al estar en formato CoreML, el modelo queda ligado al ecosistema Apple Silicon y no puede desplegarse en servidores con GPU NVIDIA sin volver a los pesos originales.
- Los paquetes deben compilarse en el dispositivo final antes de usarse, lo que anade un paso de build en el despliegue.
- Trazabilidad limitada: el repositorio no registra descargas ni likes en el momento de la consulta y no se ha publicado informacion adicional sobre mantenimiento o versionado futuro.
- No se documentan mecanismos de puntuacion, normalizacion de texto, mayusculas ni marcas de tiempo, por lo que cualquier requisito de este tipo debe resolverse en la capa de aplicacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/markstrom/pianissimo-sv-coreml
- Modelo base: https://huggingface.co/KlangAI/pianissimo-sv
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Libreria FluidAudio (mencionada en la model card, sin enlace proporcionado): no disponible
- Modelo origen del ajuste fino, NVIDIA Parakeet TDT 0.6B v3 (mencionado en la model card, sin enlace proporcionado): no disponible
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre este modelo; los resultados devueltos no guardaban relacion con la ficha.
