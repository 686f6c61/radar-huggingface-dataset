# ai-coustics/rook-multi-speaker

## Resumen

Rook Multi Speaker es un modelo de mejora de voz (speech enhancement) de tipo audio-a-audio desarrollado por ai-coustics. Su funcion es procesar audio de voz humana en tiempo real para reducir ruido, reverberacion y distorsion, con el objetivo de mejorar la calidad percibida por el oyente en escenarios de comunicacion entre personas: conferencias, telefonia y otras aplicaciones de audio en directo. No es un modelo generativo de texto ni un sistema de reconocimiento de voz, sino un procesador de senal neuronal que transforma la forma de onda de entrada en una version mejorada.

El modelo esta disenado para funcionar en tiempo real con una latencia de 30 ms y sin necesidad de GPU, y procesa senal a frecuencias de muestreo de hasta 48 kHz. Se distribuye a traves del SDK propietario `aic-sdk` (disponible para Python, Rust, C/C++, Node.js y WebAssembly) y requiere una clave de licencia para su uso. El repositorio de Hugging Face ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto orientado a despliegue en produccion y en dispositivos con recursos limitados.

La relevancia de este modelo reside en su enfoque especifico hacia la escucha humana (human-to-human listening) en lugar de hacia pipelines de Voice AI. El autor indica explicitamente que para casos de uso de agentes de voz o speech-to-text deben usarse otros modelos de la misma familia (Quail Voice Focus o Quail Multi Speaker). Rook Multi Speaker se posiciona, por tanto, como un componente de calidad de audio para plataformas de videoconferencia, centralitas telefonicas y aplicaciones de comunicacion en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (procesa audio por bloques en tiempo real) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | agnostico al idioma (language-agnostic) |
| Licencia | ai-coustics-model-license (licencia propia, enlace: https://ai-coustics.com/legal/model-license) |
| Formato de pesos | no disponible (se descarga mediante `aic.Model.download` del SDK; identificador de artefacto `rook-ms-l-48khz`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la documentacion disponible. La model card no detalla el tipo de red (transformer, CNN, híbrida u otra), el numero de parametros, la composicion del dataset de entrenamiento ni si se emplearon tecnicas de entrenamiento supervisado, adversarial o de otro tipo. Tampoco se especifican los tokens o horas de audio utilizados.

Los unicos datos tecnicos explicitos son de caracter operativo: el modelo procesa audio mono en formato float32 por bloques (`config.block_size`), soporta multiples frecuencias de muestreo de entrada (hasta 48 kHz), opera con una latencia de 30 ms y esta optimizado para inferencia en CPU sin dependencia de ONNX ni de GPU. El identificador del artefacto (`rook-ms-l-48khz`) sugiere una variante orientada a 48 kHz. El modelo es agnostico al idioma, lo que es coherente con una tarea de mejora de senal que no depende de contenido linguistico.

## Capacidades

- Reduccion de ruido (denoising) en senal de voz en tiempo real.
- Eliminacion de reverberacion (dereverberation).
- Reduccion de distorsion en la senal de audio.
- Mejora perceptiva del audio orientada a la escucha humana, no a maquinas.
- Procesamiento a frecuencias de muestreo de hasta 48 kHz, con soporte de multiples frecuencias de entrada.
- Funcionamiento en tiempo real con latencia de 30 ms.
- Inferencia en CPU sin GPU y sin dependencia de ONNX.
- Procesamiento por bloques con seguridad para uso en tiempo real (`real-time safe`).
- Ajuste en tiempo de ejecucion del nivel de mejora mediante el parametro `EnhancementLevel` (rango 0,0-1,0).
- Agnostico al idioma.
- SDK multiplataforma: Python, Rust, C/C++, Node.js y WebAssembly.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente.

## Casos de uso

- Videoconferencia en tiempo real: el modelo se integra en el pipeline de audio del cliente o del servidor para limpiar la senal del microfono antes de enviarla a los demas participantes, reduciendo ruido de fondo y reverberacion con 30 ms de latencia, compatible con la interactividad de una llamada.
- Telefonia IP y centralitas (VoIP): procesa el audio en el extremo del cliente o en el media server para mejorar la inteligibilidad en llamadas con ruido ambiental, manteniendo el flujo en tiempo real sin necesidad de GPU en el equipo del usuario.
- Plataformas de reuniones y webinars: mejora la calidad percibida de ponentes que emiten desde entornos reverberantes o ruidosos, ajustando el nivel de mejora por participante con `EnhancementLevel`.
- Aplicaciones de comunicacion en navegador: gracias al soporte de WebAssembly del SDK, puede ejecutarse en el cliente web sin infraestructura de servidor adicional para la mejora de audio.
- Herramientas de grabacion y postproduccion en tiempo real: procesamiento de audio de entrevistas o podcasts en directo para reducir ruido y reverberacion antes de la emision.
- Sistemas de atencion telefonica con intervencion humana: mejora de la senal de los agentes y de los clientes en llamadas de soporte, donde la inteligibilidad del habla es critica y el coste de una transcripcion errónea es alto.
- Integracion en frameworks de comunicacion en tiempo real: la documentacion incluye quickstarts para LiveKit y Pipecat, lo que permite incorporar el modelo en pipelines de audio existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (PESQ, STOI, DNSMOS, WER u otras) ni comparaciones cuantitativas con modelos alternativos para la tarea de mejora perceptiva de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecutarse en CPU sin GPU.
- GPU recomendadas: no se requieren GPU. No se especifican modelos de GPU en la documentacion.
- Compatibilidad con GPU de consumo: el modelo no necesita GPU de consumo; funciona en CPU.
- Opciones de despliegue: SDK propietario `aic-sdk` (Python, Rust, C/C++, Node.js, WebAssembly). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia: 30 ms declarados por el autor.
- Throughput: no disponible.
- Tamano del repositorio: aproximadamente 0,1 GB, lo que indica un modelo compacto apto para despliegue en dispositivos con recursos limitados.

## Comparativa con modelos similares

| Modelo | Familia | Uso previsto | Frecuencia de muestreo | Latencia | Licencia |
|---|---|---|---|---|---|
| Rook Multi Speaker | Rook | Escucha humana (conferencia, telefonia) | Hasta 48 kHz | 30 ms | ai-coustics-model-license |
| Quail Voice Focus | Quail | Agentes de voz con un hablante principal; aislamiento de voz para STT | 16 kHz (usable en 8 kHz) | No disponible | ai-coustics-model-license |
| Quail Multi Speaker | Quail | Preprocesado para STT en condiciones ruidosas y multi-hablante | 8 y 16 kHz | No disponible | ai-coustics-model-license |
| VAD Multi Speaker | VAD | Deteccion de actividad de voz robusta al ruido | No disponible | No disponible | ai-coustics-model-license |

Los tres modelos pertenecen al mismo fabricante y comparten licencia y ecosistema SDK. La diferencia principal es el caso de uso: Rook esta orientado a la percepcion humana y a mayor fidelidad de banda (hasta 48 kHz), mientras que los modelos Quail estan optimizados para reducir errores en sistemas de reconocimiento de voz. No se dispone de comparaciones con modelos de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo no esta recomendado para casos de uso de Voice AI (agentes de voz, speech-to-text); para esos escenarios deben usarse Quail Voice Focus o Quail Multi Speaker.
- Requiere una clave de licencia del SDK (`aic-sdk-key`) para funcionar; sin clave no hay inferencia.
- La licencia es propia (ai-coustics-model-license), no open source estandar; es necesario revisar los terminos en https://ai-coustics.com/legal/model-license para uso comercial y redistribucion.
- Solo acepta entrada mono; el ejemplo de la model card exige `getnchannels() == 1`.
- El procesamiento se realiza por bloques de tamano fijo (`config.block_size`); el audio sobrante al final que no completa un bloque no se procesa en el ejemplo proporcionado.
- No se han publicado datos sobre sesgos, tasas de alucinacion (no aplica a un modelo de mejora de senal) ni comportamiento en idiomas o acentos concretos, aunque el modelo se declara agnostico al idioma.
- No se dispone de informacion sobre el rendimiento en condiciones extremas de ruido, reverberacion o clipping.
- Dependencia de un SDK propietario y de un servicio de claves; esto puede afectar a la portabilidad y a la auditoria del modelo en entornos regulados.
- El modelo se actualizo por ultima vez en noviembre de 2026 segun los metadatos; conviene verificar la version y los checksums en artifacts.ai-coustics.io.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-coustics/rook-multi-speaker
- Documentacion de Rook Multi Speaker: https://docs.ai-coustics.com/models/perceptual-speech-enhancement/rook-multi-speaker
- Quickstart del SDK: https://docs.ai-coustics.com/models/get-started/sdk-quickstart
- Documentacion general: https://docs.ai-coustics.com
- Quickstart de LiveKit: https://docs.ai-coustics.com/models/get-started/livekit-quickstart
- Ejemplo de Pipecat: https://github.com/pipecat-ai/pipecat/blob/main/examples/voice/voice-aicoustics.py
- Artefactos y checksums: https://artifacts.ai-coustics.io
- SDK de Python en PyPI: https://pypi.org/project/aic-sdk/
- Clave SDK gratuita: https://developers.ai-coustics.com
- Licencia del modelo: https://ai-coustics.com/legal/model-license
- Licencias enterprise: https://ai-coustics.com/
- Quail Voice Focus: https://huggingface.co/ai-coustics/quail-voice-focus
- Quail Multi Speaker: https://huggingface.co/ai-coustics/quail-multi-speaker
- VAD Multi Speaker: https://huggingface.co/ai-coustics/vad-multi-speaker
- VAD Voice Focus: https://huggingface.co/ai-coustics/vad-voice-focus
- Tyto: https://huggingface.co/ai-coustics/tyto
