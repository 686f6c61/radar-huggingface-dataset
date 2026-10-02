# hellowsherlock/theranotes-whisperkit-coreml

## Resumen

Este repositorio es una conversión a CoreML del modelo Whisper de OpenAI, empaquetada para su uso con WhisperKit, el SDK de reconocimiento automático de voz (ASR) en dispositivo desarrollado por Argmax dentro de su iniciativa Argmax OSS para Apple Silicon. Lo publica el usuario hellowsherlock bajo el identificador `hellowsherlock/theranotes-whisperkit-coreml` y su finalidad es ejecutar transcripción de voz localmente en hardware Apple, sin enviar audio a APIs en la nube.

El repositorio ocupa 28,0 GB, un tamano coherente con un paquete que agrupa varias variantes de Whisper convertidas a CoreML y cuantizadas (la etiqueta `quantized` aparece en los tags), aunque la model card no detalla qué variantes concretas incluye ni sus parámetros. La licencia declarada es MIT, igual que la de los pesos originales de Whisper, lo que permite uso comercial.

Su relevancia actual radica en el despliegue de ASR con privacidad por diseno: al ejecutarse sobre el Apple Neural Engine (ANE), la CPU o la GPU integrada de los chips de Apple, ofrece transcripción offline con coste marginal nulo por inferencia, algo atractivo para aplicaciones de notas de voz, dictado y transcripción de reuniones. El proyecto matriz, WhisperKit, fue presentado en ICML 2025 y Argmax comercializa una versión Pro con diarización de hablantes y vocabulario personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI), convertido a CoreML; variante concreta no especificada en el repositorio |
| Parametros totales | no disponible (depende de la variante de Whisper empaquetada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en el repositorio; la familia Whisper procesa audio en ventanas de 30 s |
| Tipos de cuantizacion | etiquetado como `quantized`; esquemas concretos (float16, int8, etc.) no documentados |
| Idiomas soportados | no disponible (la model card no aclara si incluye variantes multilingues o solo ingles) |
| Licencia | MIT |
| Formato de pesos | CoreML (`.mlmodelc` / `.mlpackage`) para WhisperKit, junto con assets de tokenizer |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder entrenado por OpenAI para transcripción y traducción de voz, que consume espectrogramas de mel en ventanas de 30 segundos y genera texto de forma autorregresiva. Este repositorio no entrena un modelo nuevo, sino que contiene el resultado de convertir esos pesos al formato CoreML para que se ejecuten de forma nativa en Apple Silicon, con soporte para el Apple Neural Engine. La conversión la realiza la cadena de herramientas de WhisperKit/Argmax.

La model card no aporta informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de ajuste como RLHF o DPO: ese detalle corresponde al modelo original de OpenAI y no se reproduce aqui. Tampoco se documentan innovaciones tecnicas propias de esta copia mas alla del propio proceso de conversion a CoreML y la cuantizacion indicada en las etiquetas. Cualquier afirmacion sobre decodificacion especulativa u optimizaciones concretas de inferencia no esta respaldada por la informacion disponible.

## Capacidades

- Reconocimiento automatico de voz (transcripcion de audio a texto) como tarea principal declarada en el pipeline `automatic-speech-recognition`.
- Ejecucion en dispositivo sobre Apple Silicon mediante el framework WhisperKit.
- Inferencia con pesos cuantizados, orientada a reducir el consumo de memoria y acelerar la ejecucion en hardware de consumo.
- Posible soporte multilingue y de traduccion de voz heredado de Whisper, aunque no se confirma en la model card para este repositorio concreto.
- Integracion con la CLI `whisperkit-cli` y con el paquete Swift de WhisperKit.
- Las capacidades avanzadas de diarizacion de hablantes y vocabulario personalizado corresponden al SDK Pro de Argmax, no a este repositorio open source.
- No se documentan capacidades de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones iOS y macOS: al ejecutarse en el dispositivo, el audio del usuario nunca sale del terminal, lo que simplifica el cumplimiento de normativas de privacidad.
- Generacion de subtitulos para video editado en Mac: la conversion a CoreML permite procesar pistas de audio localmente sin cuotas de API ni coste por minuto.
- Dictado offline en entornos sin conectividad, como trabajo de campo o aviacion, donde no hay acceso a servicios en la nube.
- Actas de reuniones con transcripcion posterior: util para equipos que no pueden enviar conversaciones internas a terceros por politica de seguridad.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en vivo integrada en aplicaciones nativas de Apple, apoyandose en la aceleracion del ANE.
- Preprocesado de audio en pipelines de datos: convertir grandes volumenes de grabaciones a texto en una maquina Apple antes de indexarlas o analizarlas.
- Prototipado rapido de aplicaciones de voz con el paquete Swift de WhisperKit y la CLI `whisperkit-cli`, sin montar infraestructura de servidores GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Disenado para Apple Silicon (series M1, M2, M3, M4 y chips A-series recientes en iPhone/iPad); no esta pensado para GPUs NVIDIA ni para CUDA.
- Memoria unificada estimada: no disponible para este repositorio; dependera de las variantes de Whisper incluidas y de su cuantizacion, con un rango que en la familia Whisper va de decenas de MB (variantes tiny/base) a varios GB (variantes large).
- El tamano del repositorio (28,0 GB) implica que la descarga completa no cabe comodamente en dispositivos con poco almacenamiento; es habitual descargar solo la variante necesaria.
- Aceleracion mediante Apple Neural Engine, CPU y GPU integrada a traves de CoreML.
- Opciones de despliegue: WhisperKit (paquete Swift), `whisperkit-cli` (instalable con Homebrew) y aplicaciones nativas de Apple que consuman CoreML.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del chip y de la variante elegida.
- No requiere GPU dedicada ni servidor; el objetivo es precisamente evitar ese coste.

## Comparativa con modelos similares

| Modelo / repositorio | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| hellowsherlock/theranotes-whisperkit-coreml | Conversion CoreML de Whisper para WhisperKit | CoreML | MIT | Repositorio HuggingFace; 0 descargas |
| DictionLabs/whisperkit-coreml | Conversion CoreML de Whisper para WhisperKit | CoreML | no disponible | Repositorio HuggingFace |
| aidsoid/whisperkit-coreml | Conversion CoreML de Whisper para WhisperKit | CoreML | no disponible | Repositorio HuggingFace; uso via `whisperkit-cli` |
| vade/OpenAI-Whisper-CoreML | Port de Whisper a CoreML con optimizacion para ANE | CoreML | no disponible | Repositorio en GitHub |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada; la diferencia principal entre ellas radica en el conjunto de variantes empaquetadas y en el mantenimiento del repositorio.

## Limitaciones y advertencias

- La model card es generica y corresponde a la plantilla de WhisperKit; no describe el contenido real del repositorio ni las variantes incluidas.
- No se especifican los idiomas soportados, por lo que no puede garantizarse cobertura multilingue para este paquete concreto.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente con audio ruidoso, silencios prolongados o voces superpuestas.
- Sesgos de reconocimiento hacia determinados acentos, dialectos y condiciones acusticas, heredados del entrenamiento original de Whisper.
- El repositorio es muy pesado (28,0 GB), lo que puede dificultar su descarga y almacenamiento en dispositivos con espacio limitado.
- Sin descargas ni "likes" registrados y con fecha de publicacion reciente, no hay evidencia de uso en produccion ni de mantenimiento continuo.
- La licencia MIT del repositorio facilita el uso comercial, pero conviene verificar por separado la licencia de los pesos originales de Whisper y de los componentes de WhisperKit/Argmax.
- Las funciones avanzadas (diarizacion, vocabulario personalizado en tiempo real) requieren el SDK Pro de pago de Argmax, no este repositorio.
- Dependencia del ecosistema Apple: no es utilizable en Windows, Linux o Android sin reelaborar el modelo a otro runtime.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hellowsherlock/theranotes-whisperkit-coreml
- Repositorio de Argmax OSS (WhisperKit): https://github.com/argmaxinc/argmax-oss-swift
- Paper y presentacion de WhisperKit en ICML 2025: https://icml.cc/virtual/2025/47854
- SDK Pro de Argmax: https://www.argmaxinc.com/blog/argmax-sdk-2
- Conversion alternativa DictionLabs: https://huggingface.co/DictionLabs/whisperkit-coreml
- Conversion alternativa aidsoid: https://huggingface.co/aidsoid/whisperkit-coreml
- Port de Whisper a CoreML en GitHub: https://github.com/vade/OpenAI-Whisper-CoreML
- Tutorial de uso de WhisperKit CoreML: https://aiindigo.com/tutorials/getting-started-with-whisperkit-coreml-privacy-first-on-device-speech-recognitio
- Guia de configuracion de WhisperKit: https://whipscribe.com/tools/whisperkit-guide
