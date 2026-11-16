# Phoonnx/vits-pt_br-sage-espeak

## Resumen

vits-pt_br-sage-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el usuario srxz bajo el nombre sage-voice-pt-br y empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo convierte texto en portugues de Brasil (pt-BR) a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece una voz concreta lista para integrarse en pipelines de sintesis mediante la libreria phoonnx, con pesos en formato ONNX que simplifican el despliegue en entornos Python y en el asistente de voz OVOS.

El modelo es de tamano reducido (el repositorio ocupa aproximadamente 0,1 GB) y esta publicado bajo licencia MIT, lo que facilita su uso tanto en prototipos como en productos comerciales sin restricciones adicionales. Se distribuye como un unico voice pack identificado como `piper_community/srxz/pt-BR_sage`, integrado en la coleccion de voces VITS de Phoonnx.

No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto (no aplica en TTS) ni los datos exactos de entrenamiento mas alla de la referencia al modelo upstream. Esta ficha se limita a los datos verificables en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa ~0,1 GB) |
| Idiomas soportados | portugues de Brasil (pt-BR) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Libreria de inferencia | phoonnx (Python) / phoonnx.js (navegador) |
| Repositorio | 0,1 GB |
| Autor upstream | srxz |
| Empaquetado | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior normalizing flow, un decoder generativo y un discriminador adversarial entrenado con perdidas de reconstruccion y de matching temporal. Este diseno permite generar audio de forma directa desde fonemas sin necesidad de un vocoder separado, lo que explica el reducido tamano del paquete (~0,1 GB) y su idoneidad para despliegue en entornos con recursos limitados.

No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el hablante de referencia ni si se aplicaron tecnicas de RLHF o fine-tuning adicional. La model card indica unicamente que el modelo procede de `srxz/sage-voice-pt-br` y que la entrada de texto se realiza mediante fonemas espeak-ng en alfabeto IPA. El front-end de texto se gestiona con la libreria scriptconv, que normaliza el texto y lo convierte a fonemas mediante `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`.

## Capacidades

- Sintesis de voz a partir de texto en portugues de Brasil (pt-BR), con salida en fichero WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Conversion texto-a-fonemas mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`), con entrada en alfabeto IPA.
- Integracion en el asistente de voz OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecucion en navegador mediante phoonnx.js, con demo disponible en tigregotico.pt/demo.
- Una unica voz identificada como `piper_community/srxz/pt-BR_sage`.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modo thinking; es exclusivamente un modelo TTS.
- Capacidad multilingue limitada al portugues de Brasil.

## Casos de uso

- Asistentes de voz en portugues de Brasil: el modelo se integra en OVOS mediante el plugin `ovos-tts-plugin-phoonnx` y permite dotar de voz a un asistente domestico o de escritorio sin depender de servicios en la nube, gracias a su ejecucion local sobre ONNX.
- Lectura de articulos y notificaciones: con un repositorio de solo 0,1 GB, puede desplegarse en dispositivos de bajos recursos para convertir texto en audio en aplicaciones de accesibilidad o lectores de pantalla en pt-BR.
- Generacion de audio para contenido educativo: sintesis de locuciones para cursos, audiolibros o material didactivo en portugues, con la ventaja de la licencia MIT que permite uso comercial sin restricciones.
- Integracion en pipelines de CI/CD para pruebas de audio: al ser un modelo ONNX ligero, puede ejecutarse en contenedores para validar la sintesis de textos de prueba en pruebas automatizadas de aplicaciones de voz.
- Prototipado rapido de interfaces conversacionales: la API de phoonnx (`TTSModelManager`, `merge_default_voices`, `synthesize_wav`) permite incorporar la voz en pocas lineas de Python para demos y pruebas de concepto.
- Sintesis en navegador: mediante phoonnx.js, el modelo puede ejecutarse en el cliente para generar audio en aplicaciones web sin enviar texto a un servidor, util en escenarios de privacidad o baja latencia.
- Generacion de avisos y mensajes dinamicos: en sistemas de megafonia o notificaciones automatizadas en pt-BR, donde se requiere una voz consistente y un despliegue sencillo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa ~0,1 GB, por lo que se espera un consumo de memoria muy reducido, pero no se han publicado cifras oficiales.
- GPU recomendadas: no disponible. Por el tamano del paquete, es probable que funcione en CPU y en GPUs de consumo, pero no hay datos oficiales que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; el formato ONNX y el reducido tamano sugieren viabilidad en hardware modesto, sin datos verificables.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador) y el plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto | Notas |
|---|---|---|---|---|---|---|
| vits-pt_br-sage-espeak (este modelo) | VITS | pt-BR | MIT | ONNX | no aplica | Empaquetado para phoonnx; ~0,1 GB |
| Otras voces de la coleccion VITS de Phoonnx | VITS | variable | variable | ONNX | no aplica | Misma libreria de inferencia; idiomas y licencias segun cada voz |
| srxz/sage-voice-pt-br (upstream) | VITS | pt-BR | segun upstream | no disponible | no aplica | Modelo original del que deriva este paquete |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita a la arquitectura, el idioma y la licencia.

## Limitaciones y advertencias

- El modelo solo soporta portugues de Brasil; el uso con otros idiomas producira resultados incorrectos.
- La entrada debe ser texto en pt-BR que se fonemiza con espeak-ng; si se usa el port espyak, algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras, segun advierte la model card.
- Es un modelo TTS: no realiza razonamiento, generacion de texto, codigo, matematicas ni tool calling.
- No se han publicado datos sobre sesgos del hablante, calidad de la voz, robustez ante texto ruidoso o dominios fuera del entrenamiento.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero la sintesis puede producir pronunciaciones erroneas ante texto no normalizado o abreviaturas.
- La licencia MIT permite uso comercial, pero la model card remite a los terminos del release upstream para cualquier condicion adicional.
- No hay informacion publica sobre latencia, throughput ni calidad subjetiva (MOS), lo que dificulta evaluar su idoneidad en produccion a gran escala.
- El numero de descargas (21) y de likes (0) es muy bajo, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pt_br-sage-espeak
- Modelo upstream: https://huggingface.co/srxz/sage-voice-pt-br
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
