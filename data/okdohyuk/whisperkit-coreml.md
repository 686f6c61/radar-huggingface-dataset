# okdohyuk/whisperkit-coreml

## Resumen

`okdohyuk/whisperkit-coreml` es un espejo (mirror) fijado del repositorio oficial `argmaxinc/whisperkit-coreml`, publicado por el usuario okdohyuk para su uso en la aplicación Nogmi. No se trata de un modelo entrenado por el autor del repositorio, sino de una copia byte a byte de los artefactos de WhisperKit, el paquete Swift que integra los modelos de reconocimiento de voz Whisper de OpenAI con el framework CoreML de Apple para inferencia local en dispositivos Apple.

El repositorio contiene un conjunto de variantes de Whisper convertidas a CoreML, concretamente los modelos `tiny`, `base`, `small` y `large-v3` (esta última en una versión de 626 MB), junto con un `config.json` y los ficheros de tokenizador asociados. El tamaño total del repositorio es de 1,3 GB, coherente con la inclusión de varias tallas de modelo y sus tokenizadores.

La relevancia de esta ficha es acotada: se trata de un artefacto de distribución para despliegue en el ecosistema Apple (CoreML/WhisperKit), no de un modelo con innovaciones propias. Su utilidad principal es la de servir como fuente reproducible y verificada de pesos para aplicaciones que necesitan transcripción en local en macOS o iOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper de OpenAI), convertido a CoreML |
| Parametros totales | no disponible (depende de la variante: tiny, base, small, large-v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (artefactos CoreML; la cuantizacion depende de la conversion) |
| Idiomas soportados | no disponible en la informacion proporcionada (Whisper es multilingue, pero no se detallan idiomas) |
| Licencia | MIT (argmax) y Apache-2.0 para los tokenizadores de openai/whisper-*; el campo `license` del repo figura como `other` |
| Formato de pesos | CoreML (`.mlmodelc`/`.mlpackage`), mas tokenizadores JSON |
| Tamano del repositorio | 1,3 GB |
| Variantes incluidas | openai_whisper-tiny, openai_whisper-base, openai_whisper-small, openai_whisper-large-v3-v20240930_626MB |
| Ficheros | 75 upstream |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye conversiones a CoreML de los modelos Whisper de OpenAI. Whisper es una arquitectura transformer encoder-decoder disenada para reconocimiento automatico del habla (ASR), traduccion de voz y deteccion de idioma, que procesa audio en ventanas de 30 segundos. La conversion a CoreML la realiza el proyecto WhisperKit de Argmax, orientada a inferencia on-device en chips Apple (Neural Engine y GPU integrada).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, ya que estos datos corresponden a los modelos originales de OpenAI y no se detallan en la model card del espejo. La unica innovacion tecnica reseñable es el propio pipeline de conversion y empaquetado para CoreML, que permite ejecutar Whisper de forma local en dispositivos Apple sin dependencia de servidores.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) mediante las variantes tiny, base, small y large-v3.
- Ejecucion local en dispositivos Apple gracias al formato CoreML y al paquete WhisperKit.
- Multiples tallas de modelo para equilibrar precision y consumo de recursos (desde tiny hasta large-v3).
- Tokenizadores incluidos para cada variante, lo que facilita el preprocesado y postprocesado del texto.
- Capacidades multilingues y de traduccion de voz heredadas de Whisper (no se detallan idiomas concretos en la informacion disponible).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, al no ser un modelo de lenguaje conversacional.

## Casos de uso

- Transcripcion de reuniones en local en macOS: usando la variante `large-v3` se puede transcribir audio de reuniones sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado automatico de video en aplicaciones iOS: la variante `small` o `base` permite generar subtitulos en tiempo casi real en el dispositivo, reduciendo la latencia y el consumo de red.
- Dictado por voz en apps de productividad: la variante `tiny` o `base` ofrece transcripcion de baja latencia para entrada de texto por voz en movil.
- Busqueda por voz en aplicaciones offline: integracion de WhisperKit con CoreML permite indexar y buscar contenido hablado sin conexion.
- Accesibilidad: transcripcion en vivo de conversaciones para personas con discapacidad auditiva, ejecutandose integramente en el dispositivo.
- Prototipado e investigacion en ASR: el repositorio sirve como fuente reproducible de pesos CoreML para experimentos con WhisperKit en el ecosistema Apple.
- Pipeline de notas de voz a texto en apps de mensajeria: la variante `small` equilibra calidad y recursos para transcribir mensajes cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser artefactos CoreML para dispositivos Apple, el consumo depende del chip (Neural Engine, GPU integrada) y de la variante elegida; la variante `large-v3` de 626 MB es la mas exigente.
- GPU recomendadas: no aplica en el sentido tradicional; el destino son chips Apple (series M1, M2, M3, M4 y chips A en iPhone/iPad).
- Compatibilidad con GPU consumer: no aplica para GPU NVIDIA/AMD; el despliegue esta pensado para hardware Apple.
- Opciones de despliegue: WhisperKit (Swift package) sobre CoreML; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| okdohyuk/whisperkit-coreml (este repo) | Variantes tiny a large-v3 | Ventanas de 30 s de audio | CoreML | MIT / Apache-2.0 (tokenizadores) | Hugging Face (espejo) |
| argmaxinc/whisperkit-coreml | Variantes tiny a large-v3 | Ventanas de 30 s de audio | CoreML | MIT | Hugging Face (upstream) |
| paincupid/whisperkit-coreml | Variantes equivalentes | Ventanas de 30 s de audio | CoreML | no disponible | Hugging Face (espejo independiente) |
| openai/whisper-large-v3 | 1.550 M (aprox.) | Ventanas de 30 s de audio | PyTorch/safetensors | MIT | Hugging Face |

## Limitaciones y advertencias

- Es un espejo, no un modelo original: la responsabilidad de mantenimiento y actualizaciones recae en el autor del repositorio, no en Argmax ni en OpenAI.
- El campo de licencia del repositorio figura como `other`, aunque la model card indica MIT para Argmax y Apache-2.0 para los tokenizadores; conviene verificar los terminos antes de uso comercial.
- Solo contiene las variantes tiny, base, small y large-v3; no incluye otras tallas o versiones de Whisper.
- Al ser artefactos CoreML, no son directamente utilizables en entornos fuera del ecosistema Apple sin conversion adicional.
- No se documentan idiomas soportados ni resultados de evaluacion en la informacion disponible, lo que dificulta valorar su calidad para idiomas concretos.
- Riesgo de alucinacion inherente a los modelos Whisper en audio con ruido o silencios, no documentado especificamente en este repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere baja adopcion y escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/okdohyuk/whisperkit-coreml
- Repositorio upstream: https://huggingface.co/argmaxinc/whisperkit-coreml
- Espejo independiente: https://huggingface.co/paincupid/whisperkit-coreml
- WhisperKit en GitHub: https://github.com/analogpvt/WhisperKit
- Modelos Whisper de OpenAI: https://huggingface.co/openai/whisper-large-v3
