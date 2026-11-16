# Phoonnx/vits-gl_es-celtia-proxecto_nos-cotovia

## Resumen

vits-gl_es-celtia-proxecto_nos-cotovia es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo genera audio a partir de texto en gallego (gl-ES) y forma parte de la coleccion de modelos VITS que Phoonnx distribuye para su ecosistema, incluyendo integracion con OpenVoiceOS (OVOS).

El modelo toma como entrada texto en gallego que se normaliza y convierte a fonemas mediante el fonemizador Cotovia (CotoviaPhonemizer de la libreria scriptconv). El resultado es un modelo ONNX ligero (0,1 GB de repositorio) orientado a sintesis de voz en tiempo real o casi real, adecuado para asistentes de voz y aplicaciones de lectura.

Su relevancia actual radica en que cubre un idioma con pocos recursos TTS (gallego) con una licencia permisiva (MIT) y un formato de despliegue estandar (ONNX), lo que facilita su integracion en pipelines de Python y en entornos de asistente de voz como OVOS sin dependencias de frameworks propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es texto a sintetizar) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | gallego (gl-ES) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas Cotovia (alfabeto Cotovia) |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo end-to-end de sintesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado conjuntamente. VITS produce audio de forma directa sin necesidad de un vocoder externo, lo que simplifica el despliegue y reduce la latencia frente a pipelines en cascada.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o ajuste fino especifico en la informacion proporcionada. El modelo se distribuye como pesos ONNX empaquetados para la libreria phoonnx, que actua como capa de inferencia y gestion de voces. La innovacion principal en este empaquetado es la integracion del front-end de texto: el texto se normaliza y convierte a fonemas Cotovia mediante scriptconv antes de alimentar el modelo.

## Capacidades

- Sintesis de voz a partir de texto en gallego (gl-ES).
- Conversion de texto a fonemas mediante CotoviaPhonemizer (scriptconv[gl]).
- Generacion de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Integracion con OpenVoiceOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en ONNX Runtime, lo que permite despliegue en CPU y GPU sin dependencias de frameworks de deep learning pesados.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo exclusivamente TTS).

## Casos de uso

- Asistentes de voz en gallego: el modelo puede integrarse en OpenVoiceOS como motor TTS seleccionando la voz `proxectonos/celtia-cotovia` en `mycroft.conf`, permitiendo respuestas habladas en gallego en asistentes domesticos.
- Lectura de contenido web o documentos: dado un texto en gallego, el modelo lo normaliza y sintetiza en audio, adecuado para aplicaciones de accesibilidad y lectura automatica.
- Sistemas de navegacion o anuncios por voz: su naturaleza ligera (0,1 GB) permite desplegarlo en dispositivos con recursos limitados para anuncios de trafico o rutas en gallego.
- Generacion de audiolibros o podcast automatizados: sintesis por lotes de textos largos en gallego, dividiendo la entrada en frases y concatenando los WAV resultantes.
- Integracion en pipelines de Python: mediante `TTSModelManager` de phoonnx se puede cargar la voz y sintetizar frases de forma programatica en servicios backend.
- Prototipado de interfaces conversacionales en gallego: al tener licencia MIT y formato ONNX, es adecuado para entornos de investigacion y desarrollo que necesiten un TTS de bajo coste para un idioma minoritario.
- Educacion y aprendizaje de idiomas: generacion de pronunciaciones sinteticas en gallego para materiales didacticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del repositorio (0,1 GB) se espera un consumo de memoria muy reducido, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable dado el tamano reducido, pero no confirmado en la informacion.
- Opciones de despliegue: ONNX Runtime a traves de phoonnx (Python); plugin `ovos-tts-plugin-phoonnx` para OpenVoiceOS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| vits-gl_es-celtia-proxecto_nos-cotovia | VITS | gallego (gl-ES) | no aplica | MIT | ONNX |
| OpenVoiceOS/proxectonos-celtia-vits-phonemes-onnx | VITS | gallego | no aplica | no disponible | ONNX |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | no aplica | MIT | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta gallego (gl-ES); no es multilingue.
- Requiere el front-end Cotovia (`scriptconv[gl]`) para la conversion de texto a fonemas; sin el, la entrada no sera procesada correctamente.
- No se dispone de informacion sobre sesgos, calidad de voz, naturalidad o robustez ante textos fuera de dominio.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero la sintesis puede producir artefactos o pronunciaciones incorrectas en palabras fuera del vocabulario o nombres propios.
- La licencia MIT permite uso comercial, pero se recomienda verificar los terminos del release upstream (OpenVoiceOS/proxectonos-celtia-vits-phonemes-onnx) y del proyecto Proxecto Nós.
- El modelo esta empaquetado para phoonnx; su uso fuera de esa libreria requiere manejar directamente el grafo ONNX y el front-end de fonemas.
- No hay datos publicados de benchmarks ni de latencia, lo que limita la evaluacion previa a produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-gl_es-celtia-proxecto_nos-cotovia
- Modelo upstream: https://huggingface.co/OpenVoiceOS/proxectonos-celtia-vits-phonemes-onnx
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
